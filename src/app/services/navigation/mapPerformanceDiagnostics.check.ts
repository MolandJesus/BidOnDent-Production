/**
 * Lightweight manual checks for map performance diagnostics logic.
 *
 * This project does not currently run an automated TS test runner in CI.
 * Keep this file as a deterministic check surface for key summary scenarios.
 */
import {
  buildMapPerformanceSummary,
  buildMapPerformanceSummaryFromRaw,
  sanitizeMapInteractionSamples,
  type MapInteractionSample,
} from "./mapPerformance";

function isoAt(nowMs: number, deltaMs: number) {
  return new Date(nowMs + deltaMs).toISOString();
}

export function runMapPerformanceDiagnosticsChecks() {
  const nowMs = Date.parse("2026-03-21T12:00:00.000Z");

  const validRawSamples: unknown = [
    { kind: "zoom", durationMs: 440.2, capturedAt: isoAt(nowMs, -60_000), overBudget: true },
    { kind: "pan", durationMs: 390, capturedAt: isoAt(nowMs, -20_000), overBudget: false },
  ];
  const validSamples = sanitizeMapInteractionSamples(validRawSamples);
  console.assert(validSamples.length === 2, "Valid samples should be preserved");

  const validSummary = buildMapPerformanceSummary(validSamples, nowMs);
  const validSummaryFromRaw = buildMapPerformanceSummaryFromRaw(validRawSamples, nowMs);
  console.assert(validSummary.sampleCount === 2, "Valid summary should count samples");
  console.assert(validSummary.recentSampleCount === 2, "Valid summary recent count should match");
  console.assert(
    validSummary.latestSampleAgeMs === 20_000,
    "Valid summary should expose deterministic latest sample age"
  );
  console.assert(
    validSummaryFromRaw.recentStatus === validSummary.recentStatus,
    "Raw summary helper should match sanitized summary status"
  );
  console.assert(
    validSummary.recentStatus === "watch",
    "One recent over-budget sample should be watch"
  );

  const emptySummary = buildMapPerformanceSummary([], nowMs);
  console.assert(emptySummary.recentStatus === "idle", "Empty summary should be idle");
  console.assert(emptySummary.sampleCount === 0, "Empty summary should have zero samples");
  console.assert(
    emptySummary.latestSampleAgeMs === null,
    "Empty summary should have null latest sample age"
  );

  const malformedRawSamples: unknown = [
    { kind: "zoom", durationMs: "fast", capturedAt: "nope" },
    { kind: "tilt", durationMs: 42, capturedAt: isoAt(nowMs, -10_000) },
    { foo: "bar" },
  ];
  const malformedSamples = sanitizeMapInteractionSamples(malformedRawSamples);
  console.assert(malformedSamples.length === 0, "Malformed samples should be dropped");

  const staleSamples: MapInteractionSample[] = [
    {
      kind: "zoom",
      durationMs: 560,
      overBudget: true,
      capturedAt: isoAt(nowMs, -(16 * 60 * 1000)),
    },
  ];
  const staleSummary = buildMapPerformanceSummary(staleSamples, nowMs);
  console.assert(
    staleSummary.sampleCount === 1,
    "Stale sample should still exist in lifetime stats"
  );
  console.assert(
    staleSummary.recentSampleCount === 0,
    "Stale sample should be excluded from recent window"
  );
  console.assert(
    staleSummary.latestSampleAgeMs === 16 * 60 * 1000,
    "Stale sample age should remain deterministic"
  );
  console.assert(staleSummary.recentStatus === "idle", "No recent samples should be idle");

  const futureSkewedSamples: MapInteractionSample[] = [
    {
      kind: "pan",
      durationMs: 420,
      overBudget: true,
      capturedAt: isoAt(nowMs, 3 * 60 * 1000),
    },
  ];
  const futureSummary = buildMapPerformanceSummary(futureSkewedSamples, nowMs);
  console.assert(futureSummary.sampleCount === 1, "Future sample should remain in lifetime stats");
  console.assert(
    futureSummary.recentSampleCount === 0,
    "Future-skewed sample beyond skew budget should not count as recent"
  );
  console.assert(
    futureSummary.recentStatus === "idle",
    "Future-skewed sample should not drive recent status"
  );
  console.assert(
    futureSummary.latestSampleAgeMs === 0,
    "Future-skewed sample age should clamp at zero"
  );

  return {
    validSummary,
    validSummaryFromRaw,
    emptySummary,
    staleSummary,
    futureSummary,
  };
}
