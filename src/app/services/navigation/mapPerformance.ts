export type MapInteractionKind = "zoom" | "pan";

export type MapInteractionSample = {
  kind: MapInteractionKind;
  durationMs: number;
  overBudget: boolean;
  capturedAt: string;
};

export type MapPerformanceStatus = "idle" | "healthy" | "watch" | "degraded";

export type MapPerformanceSummary = {
  zoomBudgetMs: number;
  panBudgetMs: number;
  lastZoomDurationMs: number | null;
  lastPanDurationMs: number | null;
  averageZoomDurationMs: number | null;
  averagePanDurationMs: number | null;
  overBudgetCount: number;
  sampleCount: number;
  recentSampleCount: number;
  recentOverBudgetCount: number;
  latestSampleAt: string | null;
  latestSampleAgeMs: number | null;
  recentStatus: MapPerformanceStatus;
};

const storageKey = "bidondent.navigation.mapPerformance.v1";
const maxSamples = 100;
const recentWindowMs = 15 * 60 * 1000;
const maxFutureSkewMs = 2 * 60 * 1000;

const interactionBudgets: Record<MapInteractionKind, number> = {
  zoom: 450,
  pan: 380,
};

function isInteractionKind(value: unknown): value is MapInteractionKind {
  return value === "zoom" || value === "pan";
}

function normalizeDurationMs(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return Math.max(1, Math.round(value));
}

function normalizeCapturedAt(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const capturedAtMs = Date.parse(value);

  if (Number.isNaN(capturedAtMs)) {
    return null;
  }

  return new Date(capturedAtMs).toISOString();
}

export function toValidatedMapInteractionSample(raw: unknown): MapInteractionSample | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as {
    kind?: unknown;
    durationMs?: unknown;
    capturedAt?: unknown;
  };
  const kind = candidate.kind;
  const durationMs = normalizeDurationMs(candidate.durationMs);
  const capturedAt = normalizeCapturedAt(candidate.capturedAt);

  if (!isInteractionKind(kind) || durationMs === null || capturedAt === null) {
    return null;
  }

  return {
    kind,
    durationMs,
    // Recompute from canonical budgets so tampered storage values cannot skew status.
    overBudget: durationMs > interactionBudgets[kind],
    capturedAt,
  };
}

export function sanitizeMapInteractionSamples(rawSamples: unknown): MapInteractionSample[] {
  if (!Array.isArray(rawSamples)) {
    return [];
  }

  const validSamples = rawSamples
    .map((sample) => toValidatedMapInteractionSample(sample))
    .filter((sample): sample is MapInteractionSample => Boolean(sample));

  return validSamples.slice(-maxSamples);
}

function supportsStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readSamples(): MapInteractionSample[] {
  if (!supportsStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    const sanitizedSamples = sanitizeMapInteractionSamples(parsed);

    if (!Array.isArray(parsed)) {
      writeSamples(sanitizedSamples);
      return sanitizedSamples;
    }

    if (sanitizedSamples.length !== parsed.length) {
      writeSamples(sanitizedSamples);
    }

    return sanitizedSamples;
  } catch {
    clearMapInteractionSamples();
    return [];
  }
}

function writeSamples(samples: MapInteractionSample[]) {
  if (!supportsStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(samples.slice(-maxSamples)));
  } catch {
    // Ignore write failures (quota/private mode) to avoid runtime disruption.
  }
}

export function clearMapInteractionSamples() {
  if (!supportsStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Ignore reset failures in private mode/quota edge cases.
  }
}

function isSampleRecent(sample: MapInteractionSample, now: number) {
  const capturedAtMs = Date.parse(sample.capturedAt);

  if (Number.isNaN(capturedAtMs)) {
    return false;
  }

  if (capturedAtMs - now > maxFutureSkewMs) {
    return false;
  }

  return now - capturedAtMs <= recentWindowMs;
}

function getRecentStatus(
  recentSampleCount: number,
  recentOverBudgetCount: number
): MapPerformanceStatus {
  if (recentSampleCount === 0) {
    return "idle" as const;
  }

  const overBudgetRatio = recentOverBudgetCount / recentSampleCount;

  if (overBudgetRatio >= 0.4 || recentOverBudgetCount >= 4) {
    return "degraded" as const;
  }

  if (overBudgetRatio >= 0.2 || recentOverBudgetCount >= 2) {
    return "watch" as const;
  }

  return "healthy" as const;
}

export function recordMapInteractionSample(kind: MapInteractionKind, durationMs: number) {
  const normalizedDurationMs = normalizeDurationMs(durationMs) || 1;
  const overBudget = normalizedDurationMs > interactionBudgets[kind];
  const sample: MapInteractionSample = {
    kind,
    durationMs: normalizedDurationMs,
    overBudget,
    capturedAt: new Date().toISOString(),
  };

  const samples = readSamples();
  samples.push(sample);
  writeSamples(samples);

  if (overBudget) {
    console.warn(
      `[map-performance] ${kind} interaction exceeded budget: ${normalizedDurationMs}ms > ${interactionBudgets[kind]}ms`
    );
  }

  return sample;
}

export function getMapPerformanceSummary(): MapPerformanceSummary {
  return buildMapPerformanceSummary(readSamples());
}

export function buildMapPerformanceSummary(
  samples: MapInteractionSample[],
  now = Date.now()
): MapPerformanceSummary {
  let zoomTotalDuration = 0;
  let panTotalDuration = 0;
  let zoomSampleCount = 0;
  let panSampleCount = 0;
  let overBudgetCount = 0;
  let recentSampleCount = 0;
  let recentOverBudgetCount = 0;
  let lastZoomDurationMs: number | null = null;
  let lastPanDurationMs: number | null = null;
  let latestSampleAt: string | null = null;
  let latestSampleAtMs: number | null = null;

  for (const sample of samples) {
    latestSampleAt = sample.capturedAt;
    const sampleAtMs = Date.parse(sample.capturedAt);
    latestSampleAtMs = Number.isNaN(sampleAtMs) ? null : sampleAtMs;

    if (sample.kind === "zoom") {
      zoomSampleCount += 1;
      zoomTotalDuration += sample.durationMs;
      lastZoomDurationMs = sample.durationMs;
    } else {
      panSampleCount += 1;
      panTotalDuration += sample.durationMs;
      lastPanDurationMs = sample.durationMs;
    }

    if (sample.overBudget) {
      overBudgetCount += 1;
    }

    if (isSampleRecent(sample, now)) {
      recentSampleCount += 1;

      if (sample.overBudget) {
        recentOverBudgetCount += 1;
      }
    }
  }

  return {
    zoomBudgetMs: interactionBudgets.zoom,
    panBudgetMs: interactionBudgets.pan,
    lastZoomDurationMs,
    lastPanDurationMs,
    averageZoomDurationMs:
      zoomSampleCount > 0 ? Math.round(zoomTotalDuration / zoomSampleCount) : null,
    averagePanDurationMs: panSampleCount > 0 ? Math.round(panTotalDuration / panSampleCount) : null,
    overBudgetCount,
    sampleCount: samples.length,
    recentSampleCount,
    recentOverBudgetCount,
    latestSampleAt,
    latestSampleAgeMs:
      latestSampleAtMs === null ? null : Math.max(0, Math.round(now - latestSampleAtMs)),
    recentStatus: getRecentStatus(recentSampleCount, recentOverBudgetCount),
  };
}

export function buildMapPerformanceSummaryFromRaw(
  rawSamples: unknown,
  now = Date.now()
): MapPerformanceSummary {
  return buildMapPerformanceSummary(sanitizeMapInteractionSamples(rawSamples), now);
}
