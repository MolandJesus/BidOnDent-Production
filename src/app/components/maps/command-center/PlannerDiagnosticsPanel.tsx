/**
 * PlannerDiagnosticsPanel — Diagnostics signal, confidence trend, provider health, discovery quality.
 *
 * Pure presentation component extracted from CoverageNavigationPlanner (Pass 27).
 * ALL diagnostics state, service reads, useEffect, and handlers remain in the parent shell.
 * This component receives every computed value as props and renders only.
 */

import { cn } from "../../ui/utils";
import type { MapSurfaceTheme, MapSurfaceTone } from "../serviceCoverageMapTypes";
import type { NavigationDiagnosticsSignal } from "../../../services/navigation/navigationDiagnosticsSignal";
import type { ProviderHealthSummary } from "../../../services/navigation/providerHealth";
import type { MapPerformanceSummary } from "../../../services/navigation/mapPerformance";
import type { DiscoveryQualitySnapshot } from "../../../services/navigation/placeDiscovery";
import type { ConfidenceTrendState } from "../../../services/navigation/navigationPlannerPresentation";

function providerLabel(provider: string) {
  if (provider === "osrm-route") {
    return "Route";
  }

  if (provider === "nominatim-search") {
    return "Address";
  }

  if (provider === "overpass-discovery") {
    return "Discovery";
  }

  return "Speed";
}

function humanizeProviderErrorMessage(message: string | null | undefined) {
  if (!message) {
    return "No recent provider errors";
  }

  const normalized = message.toLowerCase();
  if (
    normalized.includes("abort") ||
    normalized.includes("aborted") ||
    normalized.includes("cancelled") ||
    normalized.includes("canceled")
  ) {
    return "Request interrupted";
  }

  return message;
}

function diagnosticsDriverLabel(driver: "none" | "provider" | "performance" | "balanced") {
  if (driver === "provider") {
    return "Provider reliability";
  }

  if (driver === "performance") {
    return "Map interaction latency";
  }

  if (driver === "balanced") {
    return "Provider + map performance";
  }

  return "No dominant driver";
}

function diagnosticsReasonLabel(
  reason: "none" | "failure-rate" | "recent-error" | "stale-telemetry"
) {
  if (reason === "recent-error") {
    return "Recent error";
  }

  if (reason === "failure-rate") {
    return "Failure rate";
  }

  if (reason === "stale-telemetry") {
    return "Stale telemetry";
  }

  return null;
}

function formatAgeLabel(ageMs: number | null | undefined) {
  if (typeof ageMs !== "number" || ageMs < 0 || !Number.isFinite(ageMs)) {
    return "--";
  }

  if (ageMs < 30_000) {
    return "just now";
  }

  if (ageMs < 60 * 60 * 1000) {
    return `${Math.max(1, Math.round(ageMs / 60_000))}m ago`;
  }

  if (ageMs < 24 * 60 * 60 * 1000) {
    return `${Math.max(1, Math.round(ageMs / (60 * 60 * 1000)))}h ago`;
  }

  return `${Math.max(1, Math.round(ageMs / (24 * 60 * 60 * 1000)))}d ago`;
}

function formatDiscoveryCategoryMix(snapshot: {
  acceptedCount: number;
  acceptedBodyShopCount: number;
  acceptedInsuranceCount: number;
  acceptedFuelCount: number;
  acceptedRentalCount: number;
  acceptedSupplierCount: number;
}) {
  if (snapshot.acceptedCount <= 0) {
    return "Mix --";
  }

  const entries: Array<{ label: string; count: number }> = [
    { label: "Body", count: snapshot.acceptedBodyShopCount },
    { label: "Insurance", count: snapshot.acceptedInsuranceCount },
    { label: "Fuel", count: snapshot.acceptedFuelCount },
    { label: "Rental", count: snapshot.acceptedRentalCount },
    { label: "Supplier", count: snapshot.acceptedSupplierCount },
  ];

  return entries
    .filter((entry) => entry.count > 0)
    .map((entry) => `${entry.label} ${Math.round((entry.count / snapshot.acceptedCount) * 100)}%`)
    .join(" · ");
}

type PlannerDiagnosticsPanelProps = {
  tone: MapSurfaceTone;
  theme: MapSurfaceTheme;
  diagnosticsSignal: NavigationDiagnosticsSignal;
  confidenceTrend: ConfidenceTrendState;
  diagnosticsToneClassName: string;
  staleTelemetryProviderSummary: ProviderHealthSummary | null;
  providerHealth: ProviderHealthSummary[];
  mapPerformance: MapPerformanceSummary;
  discoveryQualitySnapshot: DiscoveryQualitySnapshot | null;
  showDiagnosticsDetails: boolean;
  onToggleDiagnosticsDetails: () => void;
  showDevDiagnosticsActions: boolean;
  onRunDiagnosticsChecks: () => void;
  lastDiagnosticsRefreshAt: string | null;
  diagnosticsRefreshError: string | null;
};

export default function PlannerDiagnosticsPanel({
  tone,
  theme,
  diagnosticsSignal,
  confidenceTrend,
  diagnosticsToneClassName,
  staleTelemetryProviderSummary,
  providerHealth,
  mapPerformance,
  discoveryQualitySnapshot,
  showDiagnosticsDetails,
  onToggleDiagnosticsDetails,
  showDevDiagnosticsActions,
  onRunDiagnosticsChecks,
  lastDiagnosticsRefreshAt,
  diagnosticsRefreshError,
}: PlannerDiagnosticsPanelProps) {
  return (
    <div
      className={cn(
        "map-liquid-card map-ui-enter map-ui-enter-delay-3 rounded-[1rem] border px-3 py-3",
        theme.panelClassName
      )}
    >
      <div className={cn("rounded-[0.85rem] border px-3 py-2 text-xs", diagnosticsToneClassName)}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold uppercase tracking-[0.12em]">Diagnostics signal</span>
          <span className="inline-flex flex-wrap items-center gap-2 font-semibold capitalize">
            <span>{diagnosticsSignal.level}</span>
            <span className="rounded-full border border-current/35 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em]">
              {diagnosticsSignal.confidenceScore} confidence
            </span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em]",
                confidenceTrend.tone === "critical"
                  ? "border-rose-400/70 text-rose-100"
                  : confidenceTrend.tone === "warning"
                    ? "border-amber-300/70 text-amber-100"
                    : confidenceTrend.tone === "positive"
                      ? "border-emerald-300/70 text-emerald-100"
                      : "border-current/25 opacity-85"
              )}
            >
              {confidenceTrend.label}
            </span>
          </span>
        </div>
        <div className="mt-1 opacity-90">{diagnosticsSignal.detail}</div>
        {staleTelemetryProviderSummary ? (
          <div className="bd-notice--warn mt-2 rounded-[0.75rem] border px-2.5 py-2 text-[11px] leading-5">
            Provider telemetry for {providerLabel(staleTelemetryProviderSummary.provider)} is{" "}
            {formatAgeLabel(staleTelemetryProviderSummary.lastCheckedAgeMs)} old. Refresh live map
            activity or rerun diagnostics checks to restore current trust status.
          </div>
        ) : null}
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="opacity-80 sm:pr-2">
            Driver: {diagnosticsDriverLabel(diagnosticsSignal.primaryDriver)}
          </span>
          <button
            type="button"
            onClick={onToggleDiagnosticsDetails}
            className="w-full rounded-full border border-current/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition hover:bg-slate-950/5 sm:w-auto"
          >
            {showDiagnosticsDetails ? "Hide details" : "Details"}
          </button>
        </div>
        {showDiagnosticsDetails ? (
          <div className="mt-2 space-y-2 border-t border-current/20 pt-2 opacity-90">
            {showDevDiagnosticsActions ? (
              <div className="flex flex-col gap-2 pb-1 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={onRunDiagnosticsChecks}
                  className="w-full rounded-full border border-current/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition hover:bg-slate-950/5 sm:w-auto"
                >
                  Run Checks
                </button>
                <span>
                  Last run:{" "}
                  {lastDiagnosticsRefreshAt
                    ? formatAgeLabel(Date.now() - Date.parse(lastDiagnosticsRefreshAt))
                    : "--"}
                </span>
              </div>
            ) : null}
            <div>
              Map pressure: {mapPerformance.recentOverBudgetCount}/
              {mapPerformance.recentSampleCount} recent over-budget samples
            </div>
            <div>
              At-risk provider:{" "}
              {diagnosticsSignal.providerAtRisk
                ? providerLabel(diagnosticsSignal.providerAtRisk)
                : "--"}
            </div>
            <div>
              Latest provider issue:{" "}
              {diagnosticsSignal.providerAtRiskLastError || "No recent provider errors"}
            </div>
            {discoveryQualitySnapshot ? (
              <div>
                Discovery quality: {discoveryQualitySnapshot.acceptedLimitedCount}/
                {discoveryQualitySnapshot.acceptedCount} limited accepted,{" "}
                {discoveryQualitySnapshot.rejectedBelowQualityThresholdCount} below-threshold
                filtered
              </div>
            ) : null}
            {discoveryQualitySnapshot ? (
              <div>
                Discovery limited rate: {discoveryQualitySnapshot.limitedAcceptanceRatePct}%
              </div>
            ) : null}
            {discoveryQualitySnapshot ? (
              <div>Discovery mix: {formatDiscoveryCategoryMix(discoveryQualitySnapshot)}</div>
            ) : null}
            {diagnosticsRefreshError ? (
              <div className="text-rose-600 dark:text-rose-300">{diagnosticsRefreshError}</div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className={theme.metricLabelClassName}>Provider health snapshot</div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {providerHealth.map((status) =>
          (() => {
            const isAtRiskProvider =
              diagnosticsSignal.providerAtRisk === status.provider &&
              (diagnosticsSignal.level === "watch" || diagnosticsSignal.level === "degraded");
            const providerReasonLabel = diagnosticsReasonLabel(
              diagnosticsSignal.providerRiskReason
            );

            return (
              <div
                key={status.provider}
                className={cn(
                  theme.listCardClassName,
                  "p-3",
                  isAtRiskProvider
                    ? tone === "light"
                      ? "ring-2 ring-amber-300"
                      : "ring-2 ring-amber-300/60"
                    : null
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={cn(
                      "text-xs font-semibold uppercase tracking-[0.14em]",
                      theme.titleClassName
                    )}
                  >
                    {providerLabel(status.provider)}
                  </div>
                  {isAtRiskProvider && providerReasonLabel ? (
                    <span className="rounded-full border border-current/35 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
                      {providerReasonLabel}
                    </span>
                  ) : null}
                </div>
                <div className={cn("mt-1 text-sm font-semibold leading-5", theme.titleClassName)}>
                  {status.totalChecks > 0
                    ? `${status.successRate}% success • ${status.averageLatencyMs} ms avg`
                    : "No checks yet"}
                </div>
                <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                  Last check: {formatAgeLabel(status.lastCheckedAgeMs)}
                </div>
                <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                  {humanizeProviderErrorMessage(status.lastErrorMessage)}
                </div>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
