import type { MapPerformanceSummary, MapPerformanceStatus } from "./mapPerformance";
import type { NavigationProviderHealthId, ProviderHealthSummary } from "./providerHealth";

export type NavigationDiagnosticsSignalLevel = "idle" | "healthy" | "watch" | "degraded";

export type NavigationDiagnosticsSignal = {
  level: NavigationDiagnosticsSignalLevel;
  confidenceScore: number;
  providerLevel: Exclude<NavigationDiagnosticsSignalLevel, "idle">;
  performanceLevel: MapPerformanceStatus;
  primaryDriver: "none" | "provider" | "performance" | "balanced";
  providerAtRisk: NavigationProviderHealthId | null;
  providerRiskReason: "none" | "failure-rate" | "recent-error" | "stale-telemetry";
  providerAtRiskLastError: string | null;
  detail: string;
};

const severityRank: Record<NavigationDiagnosticsSignalLevel, number> = {
  idle: 0,
  healthy: 1,
  watch: 2,
  degraded: 3,
};
const providerStaleAgeMs = 15 * 60 * 1000;

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function computeDiagnosticsConfidenceScore(params: {
  level: NavigationDiagnosticsSignalLevel;
  providerLevel: Exclude<NavigationDiagnosticsSignalLevel, "idle">;
  performance: MapPerformanceSummary;
  providerRiskReason: "none" | "failure-rate" | "recent-error" | "stale-telemetry";
}) {
  const { level, providerLevel, performance, providerRiskReason } = params;

  if (level === "idle") {
    return 50;
  }

  let score = 100;

  if (level === "degraded") {
    score -= 20;
  } else if (level === "watch") {
    score -= 8;
  }

  if (providerLevel === "degraded") {
    score -= 30;
  } else if (providerLevel === "watch") {
    score -= 15;
  }

  if (performance.recentStatus === "degraded") {
    score -= 30;
  } else if (performance.recentStatus === "watch") {
    score -= 15;
  } else if (performance.recentStatus === "idle") {
    score -= 8;
  }

  if (providerRiskReason === "recent-error") {
    score -= 8;
  } else if (providerRiskReason === "failure-rate") {
    score -= 6;
  } else if (providerRiskReason === "stale-telemetry") {
    score -= 5;
  }

  if (performance.recentSampleCount > 0) {
    const overBudgetRatio = performance.recentOverBudgetCount / performance.recentSampleCount;
    score -= Math.round(overBudgetRatio * 20);
  }

  return clampScore(score);
}

function summarizeProviderLevel(providerHealth: ProviderHealthSummary[]): {
  level: "healthy" | "watch" | "degraded";
  detail: string;
  providerAtRisk: NavigationProviderHealthId | null;
  providerRiskReason: "none" | "failure-rate" | "recent-error" | "stale-telemetry";
  providerAtRiskLastError: string | null;
} {
  const checksWithTraffic = providerHealth.filter((summary) => summary.totalChecks > 0);
  const providerAtRisk =
    checksWithTraffic.slice().sort((a, b) => {
      const severityA = a.failureCount * 100 + (100 - a.successRate);
      const severityB = b.failureCount * 100 + (100 - b.successRate);

      return severityB - severityA;
    })[0] || null;

  if (checksWithTraffic.length === 0) {
    return {
      level: "healthy" as const,
      detail: "Providers awaiting checks",
      providerAtRisk: null,
      providerRiskReason: "none" as const,
      providerAtRiskLastError: null,
    };
  }

  const failureRatio =
    checksWithTraffic.reduce((sum, summary) => sum + summary.failureCount, 0) /
    Math.max(
      1,
      checksWithTraffic.reduce((sum, summary) => sum + summary.totalChecks, 0)
    );

  const degradedProvider = checksWithTraffic.find(
    (summary) =>
      (summary.totalChecks >= 4 && summary.successRate < 70) ||
      (summary.totalChecks >= 3 && summary.failureCount >= 2)
  );

  if (degradedProvider || failureRatio >= 0.35) {
    const resolvedProvider = degradedProvider || providerAtRisk;
    return {
      level: "degraded" as const,
      detail: "Provider failures are elevated",
      providerAtRisk: resolvedProvider?.provider || null,
      providerRiskReason: resolvedProvider?.lastErrorMessage ? "recent-error" : "failure-rate",
      providerAtRiskLastError:
        resolvedProvider?.lastErrorMessage || providerAtRisk?.lastErrorMessage || null,
    };
  }

  const watchProvider = checksWithTraffic.find(
    (summary) => (summary.totalChecks >= 2 && summary.successRate < 90) || summary.failureCount > 0
  );

  if (watchProvider || failureRatio > 0) {
    const resolvedProvider = watchProvider || providerAtRisk;
    return {
      level: "watch" as const,
      detail: "Provider reliability needs monitoring",
      providerAtRisk: resolvedProvider?.provider || null,
      providerRiskReason: resolvedProvider?.lastErrorMessage ? "recent-error" : "failure-rate",
      providerAtRiskLastError:
        resolvedProvider?.lastErrorMessage || providerAtRisk?.lastErrorMessage || null,
    };
  }

  const staleProvider = checksWithTraffic.find(
    (summary) =>
      typeof summary.lastCheckedAgeMs === "number" && summary.lastCheckedAgeMs > providerStaleAgeMs
  );

  if (staleProvider) {
    return {
      level: "watch" as const,
      detail: "Provider telemetry is stale",
      providerAtRisk: staleProvider.provider,
      providerRiskReason: "stale-telemetry" as const,
      providerAtRiskLastError: staleProvider.lastErrorMessage || null,
    };
  }

  return {
    level: "healthy" as const,
    detail: "Provider reliability is stable",
    providerAtRisk: providerAtRisk?.provider || null,
    providerRiskReason: "none" as const,
    providerAtRiskLastError: providerAtRisk?.lastErrorMessage || null,
  };
}

function worstLevel(
  a: NavigationDiagnosticsSignalLevel,
  b: NavigationDiagnosticsSignalLevel
): NavigationDiagnosticsSignalLevel {
  return severityRank[a] >= severityRank[b] ? a : b;
}

export function getNavigationDiagnosticsSignal(
  providerHealth: ProviderHealthSummary[],
  performance: MapPerformanceSummary
): NavigationDiagnosticsSignal {
  const providerSummary = summarizeProviderLevel(providerHealth);
  const performanceLevel = performance.recentStatus;
  const combinedBase = worstLevel(providerSummary.level, performanceLevel);
  const level = combinedBase === "healthy" && performanceLevel === "idle" ? "idle" : combinedBase;

  if (level === "degraded") {
    const primaryDriver =
      performanceLevel === "degraded" && providerSummary.level === "degraded"
        ? "balanced"
        : performanceLevel === "degraded"
          ? "performance"
          : "provider";

    return {
      level,
      confidenceScore: computeDiagnosticsConfidenceScore({
        level,
        providerLevel: providerSummary.level,
        performance,
        providerRiskReason: providerSummary.providerRiskReason,
      }),
      providerLevel: providerSummary.level,
      performanceLevel,
      primaryDriver,
      providerAtRisk: providerSummary.providerAtRisk,
      providerRiskReason: providerSummary.providerRiskReason,
      providerAtRiskLastError: providerSummary.providerAtRiskLastError,
      detail:
        performanceLevel === "degraded"
          ? "Map interaction latency is degraded"
          : providerSummary.detail,
    };
  }

  if (level === "watch") {
    const primaryDriver =
      performanceLevel === "watch" && providerSummary.level === "watch"
        ? "balanced"
        : performanceLevel === "watch"
          ? "performance"
          : "provider";

    return {
      level,
      confidenceScore: computeDiagnosticsConfidenceScore({
        level,
        providerLevel: providerSummary.level,
        performance,
        providerRiskReason: providerSummary.providerRiskReason,
      }),
      providerLevel: providerSummary.level,
      performanceLevel,
      primaryDriver,
      providerAtRisk: providerSummary.providerAtRisk,
      providerRiskReason: providerSummary.providerRiskReason,
      providerAtRiskLastError: providerSummary.providerAtRiskLastError,
      detail:
        performanceLevel === "watch"
          ? "Map interaction latency is approaching budget limits"
          : providerSummary.detail,
    };
  }

  if (level === "idle") {
    return {
      level,
      confidenceScore: computeDiagnosticsConfidenceScore({
        level,
        providerLevel: providerSummary.level,
        performance,
        providerRiskReason: providerSummary.providerRiskReason,
      }),
      providerLevel: providerSummary.level,
      performanceLevel,
      primaryDriver: "none",
      providerAtRisk: providerSummary.providerAtRisk,
      providerRiskReason: providerSummary.providerRiskReason,
      providerAtRiskLastError: providerSummary.providerAtRiskLastError,
      detail: "Awaiting enough map and provider activity",
    };
  }

  return {
    level,
    confidenceScore: computeDiagnosticsConfidenceScore({
      level,
      providerLevel: providerSummary.level,
      performance,
      providerRiskReason: providerSummary.providerRiskReason,
    }),
    providerLevel: providerSummary.level,
    performanceLevel,
    primaryDriver: "none",
    providerAtRisk: providerSummary.providerAtRisk,
    providerRiskReason: providerSummary.providerRiskReason,
    providerAtRiskLastError: providerSummary.providerAtRiskLastError,
    detail: "Map and provider diagnostics are healthy",
  };
}
