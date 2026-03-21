/**
 * Lightweight manual checks for provider health diagnostics logic.
 */
import {
  buildProviderHealthSummary,
  buildProviderHealthSummaryFromRaw,
  sanitizeProviderHealthEventsFromRaw,
} from "./providerHealth";

function isoAt(nowMs: number, deltaMs: number) {
  return new Date(nowMs + deltaMs).toISOString();
}

export function runProviderHealthDiagnosticsChecks() {
  const nowMs = Date.parse("2026-03-21T12:00:00.000Z");

  const validRawEvents: unknown = [
    {
      provider: "osrm-route",
      ok: true,
      latencyMs: 302.2,
      timestamp: isoAt(nowMs, -20_000),
    },
    {
      provider: "osrm-route",
      ok: false,
      latencyMs: 1210,
      timestamp: isoAt(nowMs, -10_000),
      errorMessage: "timeout",
    },
  ];
  const validEvents = sanitizeProviderHealthEventsFromRaw(validRawEvents);
  console.assert(validEvents.length === 2, "Valid provider events should be preserved");

  const validSummary = buildProviderHealthSummary(validEvents, nowMs);
  const validSummaryFromRaw = buildProviderHealthSummaryFromRaw(validRawEvents, nowMs);
  const routeSummary = validSummary.find((summary) => summary.provider === "osrm-route");
  console.assert(routeSummary?.totalChecks === 2, "Route summary should count checks");
  console.assert(routeSummary?.successRate === 50, "Route summary should compute success rate");
  console.assert(
    routeSummary?.lastCheckedAgeMs === 10_000,
    "Route summary should expose deterministic last checked age"
  );
  console.assert(
    routeSummary?.lastErrorMessage === "timeout",
    "Route summary should preserve latest error"
  );
  console.assert(
    validSummaryFromRaw.find((summary) => summary.provider === "osrm-route")?.failureCount === 1,
    "Raw summary helper should align with validated summary"
  );

  const malformedRawEvents: unknown = [
    { provider: "osrm-route", ok: "yes", latencyMs: 10, timestamp: isoAt(nowMs, -5_000) },
    { provider: "bad-provider", ok: true, latencyMs: 5, timestamp: isoAt(nowMs, -4_000) },
    { foo: "bar" },
  ];
  const malformedEvents = sanitizeProviderHealthEventsFromRaw(malformedRawEvents);
  console.assert(malformedEvents.length === 0, "Malformed provider events should be dropped");

  const emptySummary = buildProviderHealthSummaryFromRaw([], nowMs);
  console.assert(
    emptySummary.every((summary) => summary.totalChecks === 0),
    "Empty summary should contain zero checks for all providers"
  );
  console.assert(
    emptySummary.every((summary) => summary.lastCheckedAgeMs === null),
    "Empty summary should have null last checked age"
  );

  return {
    validSummary,
    validSummaryFromRaw,
    emptySummary,
  };
}
