/**
 * Tests for shouldTriggerReroute.ts — Phase 5 Pass 76.
 *
 * Pure decision-function tests covering: null event, wrong type, severity
 * threshold, lifecycle gates (pending / completed / cooldown), and the
 * cooldown auto-clear after REROUTE_COOLDOWN_MS.
 */
import { describe, expect, it } from "vitest";

import type {
  DeviationEvent,
  DeviationSeverity,
  OffRouteEvent,
} from "./deviationTypes";
import type { RerouteState, RerouteStatus } from "./rerouteTypes";
import { REROUTE_COOLDOWN_MS } from "./rerouteTypes";
import { shouldTriggerReroute } from "./shouldTriggerReroute";

const NOW_MS = new Date("2026-05-09T00:00:00.000Z").getTime();

function makeOffRoute(severity: DeviationSeverity = "high"): OffRouteEvent {
  return {
    id: "evt-1",
    type: "off_route",
    severity,
    timestamp: "2026-05-09T00:00:00.000Z",
    description: "off",
    metadata: { distanceMiles: 1.5, position: { latitude: 0, longitude: 0 } },
  };
}

function makeState(
  status: RerouteStatus,
  lastCompletedAt: string | null = null
): RerouteState {
  return {
    status,
    activeRequest: null,
    lastCompletedAt,
    completedCount: 0,
  };
}

// ---------------------------------------------------------------------------
// Guard rails
// ---------------------------------------------------------------------------
describe("shouldTriggerReroute — guard rails", () => {
  it("rejects when event is null", () => {
    const decision = shouldTriggerReroute(null, makeState("idle"), NOW_MS);
    expect(decision.eligible).toBe(false);
    expect(decision.reason).toMatch(/no deviation event/i);
  });

  it("rejects when event type is not off_route", () => {
    const event: DeviationEvent = {
      id: "evt-2",
      type: "stopped",
      severity: "high",
      timestamp: "2026-05-09T00:00:00.000Z",
      description: "stopped",
      metadata: { speedMph: 0, position: null },
    };
    const decision = shouldTriggerReroute(event, makeState("idle"), NOW_MS);
    expect(decision.eligible).toBe(false);
    expect(decision.reason).toMatch(/does not qualify/i);
  });

  it("rejects when severity is below threshold (low)", () => {
    const decision = shouldTriggerReroute(
      makeOffRoute("low"),
      makeState("idle"),
      NOW_MS
    );
    expect(decision.eligible).toBe(false);
    expect(decision.reason).toMatch(/below reroute threshold/i);
  });
});

// ---------------------------------------------------------------------------
// Severity threshold (medium meets it)
// ---------------------------------------------------------------------------
describe("shouldTriggerReroute — severity acceptance", () => {
  it("accepts medium severity off_route from idle", () => {
    const decision = shouldTriggerReroute(
      makeOffRoute("medium"),
      makeState("idle"),
      NOW_MS
    );
    expect(decision.eligible).toBe(true);
  });

  it("accepts high severity off_route from idle", () => {
    const decision = shouldTriggerReroute(
      makeOffRoute("high"),
      makeState("idle"),
      NOW_MS
    );
    expect(decision.eligible).toBe(true);
  });

  it("accepts off_route from eligible status (idle pre-trigger lifecycle)", () => {
    const decision = shouldTriggerReroute(
      makeOffRoute("high"),
      makeState("eligible"),
      NOW_MS
    );
    expect(decision.eligible).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Lifecycle gates
// ---------------------------------------------------------------------------
describe("shouldTriggerReroute — lifecycle gates", () => {
  it("rejects when status is pending (already running)", () => {
    const decision = shouldTriggerReroute(
      makeOffRoute("high"),
      makeState("pending"),
      NOW_MS
    );
    expect(decision.eligible).toBe(false);
    expect(decision.reason).toMatch(/already pending/i);
  });

  it("rejects when status is completed (just finished)", () => {
    const decision = shouldTriggerReroute(
      makeOffRoute("high"),
      makeState("completed"),
      NOW_MS
    );
    expect(decision.eligible).toBe(false);
    expect(decision.reason).toMatch(/just completed/i);
  });
});

// ---------------------------------------------------------------------------
// Cooldown
// ---------------------------------------------------------------------------
describe("shouldTriggerReroute — cooldown window", () => {
  it("rejects when cooldown is active and reports remaining seconds", () => {
    const lastCompletedAt = new Date(NOW_MS - 30_000).toISOString(); // 30s ago
    const decision = shouldTriggerReroute(
      makeOffRoute("high"),
      makeState("cooldown", lastCompletedAt),
      NOW_MS
    );
    expect(decision.eligible).toBe(false);
    expect(decision.reason).toMatch(/cooldown active/i);
    expect(decision.reason).toMatch(/30s remaining/);
  });

  it("accepts when cooldown has fully elapsed", () => {
    const lastCompletedAt = new Date(NOW_MS - REROUTE_COOLDOWN_MS - 1).toISOString();
    const decision = shouldTriggerReroute(
      makeOffRoute("high"),
      makeState("cooldown", lastCompletedAt),
      NOW_MS
    );
    expect(decision.eligible).toBe(true);
  });

  it("accepts cooldown status when lastCompletedAt is null (no recorded completion)", () => {
    // Defensive: if state somehow says cooldown without a timestamp, helper
    // skips the cooldown gate rather than rejecting forever.
    const decision = shouldTriggerReroute(
      makeOffRoute("high"),
      makeState("cooldown", null),
      NOW_MS
    );
    expect(decision.eligible).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// nowMs default
// ---------------------------------------------------------------------------
describe("shouldTriggerReroute — nowMs default", () => {
  it("falls back to Date.now() when nowMs argument is omitted", () => {
    // Arrange a cooldown that ends well in the past relative to real Date.now().
    const lastCompletedAt = new Date(0).toISOString(); // 1970
    const decision = shouldTriggerReroute(
      makeOffRoute("high"),
      makeState("cooldown", lastCompletedAt)
    );
    expect(decision.eligible).toBe(true);
  });
});
