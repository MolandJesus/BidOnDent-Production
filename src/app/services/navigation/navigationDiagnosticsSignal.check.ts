/**
 * Lightweight manual checks for combined navigation diagnostics signal logic.
 */
import { buildMapPerformanceSummaryFromRaw } from "./mapPerformance";
import { getNavigationDiagnosticsSignal } from "./navigationDiagnosticsSignal";
import { buildProviderHealthSummaryFromRaw } from "./providerHealth";

function isoAt(nowMs: number, deltaMs: number) {
  return new Date(nowMs + deltaMs).toISOString();
}

export function runNavigationDiagnosticsSignalChecks() {
  const nowMs = Date.parse("2026-03-21T12:00:00.000Z");

  const idleSignal = getNavigationDiagnosticsSignal(
    buildProviderHealthSummaryFromRaw([]),
    buildMapPerformanceSummaryFromRaw([], nowMs)
  );
  console.assert(idleSignal.level === "idle", "Empty diagnostics should be idle");
  console.assert(
    idleSignal.confidenceScore === 50,
    "Idle diagnostics should use baseline confidence"
  );
  console.assert(idleSignal.primaryDriver === "none", "Idle diagnostics should have no driver");

  const providerDrivenSignal = getNavigationDiagnosticsSignal(
    buildProviderHealthSummaryFromRaw([
      {
        provider: "nominatim-search",
        ok: false,
        latencyMs: 1400,
        timestamp: isoAt(nowMs, -10_000),
        errorMessage: "search timeout",
      },
      {
        provider: "nominatim-search",
        ok: false,
        latencyMs: 1300,
        timestamp: isoAt(nowMs, -8_000),
        errorMessage: "search timeout",
      },
      {
        provider: "nominatim-search",
        ok: true,
        latencyMs: 400,
        timestamp: isoAt(nowMs, -6_000),
      },
    ]),
    buildMapPerformanceSummaryFromRaw([], nowMs)
  );
  console.assert(
    providerDrivenSignal.level === "degraded",
    "Provider failures should degrade diagnostics signal"
  );
  console.assert(
    providerDrivenSignal.primaryDriver === "provider",
    "Provider-failure scenario should be provider-driven"
  );
  console.assert(
    providerDrivenSignal.providerAtRisk === "nominatim-search",
    "Provider scenario should surface at-risk provider"
  );
  console.assert(
    providerDrivenSignal.providerRiskReason === "recent-error",
    "Provider error scenario should expose recent-error reason"
  );
  console.assert(
    providerDrivenSignal.confidenceScore <= 45,
    "Provider degraded scenario should materially lower confidence"
  );

  const performanceDrivenSignal = getNavigationDiagnosticsSignal(
    buildProviderHealthSummaryFromRaw([
      {
        provider: "osrm-route",
        ok: true,
        latencyMs: 220,
        timestamp: isoAt(nowMs, -10_000),
      },
    ]),
    buildMapPerformanceSummaryFromRaw(
      [
        { kind: "zoom", durationMs: 800, capturedAt: isoAt(nowMs, -12_000) },
        { kind: "pan", durationMs: 650, capturedAt: isoAt(nowMs, -11_000) },
        { kind: "pan", durationMs: 610, capturedAt: isoAt(nowMs, -10_000) },
        { kind: "zoom", durationMs: 720, capturedAt: isoAt(nowMs, -9_000) },
      ],
      nowMs
    )
  );
  console.assert(
    performanceDrivenSignal.level === "degraded",
    "Map-performance overages should degrade diagnostics signal"
  );
  console.assert(
    performanceDrivenSignal.primaryDriver === "performance",
    "Performance scenario should be performance-driven"
  );
  console.assert(
    performanceDrivenSignal.confidenceScore <= 45,
    "Performance degraded scenario should materially lower confidence"
  );

  const balancedSignal = getNavigationDiagnosticsSignal(
    buildProviderHealthSummaryFromRaw([
      {
        provider: "overpass-discovery",
        ok: false,
        latencyMs: 900,
        timestamp: isoAt(nowMs, -9_000),
        errorMessage: "gateway timeout",
      },
      {
        provider: "overpass-discovery",
        ok: true,
        latencyMs: 300,
        timestamp: isoAt(nowMs, -8_000),
      },
    ]),
    buildMapPerformanceSummaryFromRaw(
      [
        { kind: "zoom", durationMs: 490, capturedAt: isoAt(nowMs, -11_000) },
        { kind: "pan", durationMs: 200, capturedAt: isoAt(nowMs, -10_000) },
        { kind: "pan", durationMs: 420, capturedAt: isoAt(nowMs, -9_000) },
      ],
      nowMs
    )
  );
  console.assert(
    balancedSignal.level === "watch",
    "Mixed caution signals should produce watch level"
  );
  console.assert(
    balancedSignal.primaryDriver === "balanced",
    "Combined caution scenario should be balanced"
  );
  console.assert(
    balancedSignal.confidenceScore < 85 && balancedSignal.confidenceScore > 40,
    "Balanced watch scenario should produce mid-band confidence"
  );

  const staleProviderSignal = getNavigationDiagnosticsSignal(
    buildProviderHealthSummaryFromRaw(
      [
        {
          provider: "overpass-speed-limit",
          ok: true,
          latencyMs: 280,
          timestamp: isoAt(nowMs, -(20 * 60 * 1000)),
        },
      ],
      nowMs
    ),
    buildMapPerformanceSummaryFromRaw([], nowMs)
  );
  console.assert(
    staleProviderSignal.level === "watch",
    "Stale provider checks should produce watch level"
  );
  console.assert(
    staleProviderSignal.primaryDriver === "provider",
    "Stale provider checks should be provider-driven"
  );
  console.assert(
    staleProviderSignal.providerRiskReason === "stale-telemetry",
    "Stale provider scenario should expose stale-telemetry reason"
  );
  console.assert(
    staleProviderSignal.confidenceScore < 90,
    "Stale provider scenario should reduce confidence"
  );

  return {
    idleSignal,
    providerDrivenSignal,
    performanceDrivenSignal,
    balancedSignal,
    staleProviderSignal,
  };
}
