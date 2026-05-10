/**
 * Tests for detectDeviation.ts — Phase 5 Pass 76.
 *
 * Pure-function tests covering the four detector branches + the GPS jitter
 * guard + the KI-116 regression assertion ("user sitting at the origin
 * vertex must not be reported as off-route").
 */
import { describe, expect, it } from "vitest";

import { detectDeviations } from "./detectDeviation";
import {
  OFF_ROUTE_THRESHOLD_MILES,
  STOPPED_SPEED_THRESHOLD_MPH,
  type NavigationSnapshot,
} from "./deviationTypes";

const ATLANTA = { latitude: 33.749, longitude: -84.388 };
const ATLANTA_NORTH = { latitude: 33.95, longitude: -84.09 };
const NYC = { latitude: 40.7128, longitude: -74.006 };

function makeSnapshot(overrides: Partial<NavigationSnapshot>): NavigationSnapshot {
  return {
    routeId: "fastest",
    estimatedDurationMinutes: 30,
    currentPosition: ATLANTA,
    currentSpeedMph: 35,
    routePolyline: [ATLANTA, ATLANTA_NORTH],
    capturedAt: "2026-05-09T00:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Empty / null inputs
// ---------------------------------------------------------------------------
describe("detectDeviations — guard rails", () => {
  it("returns no events when previous is null and current is on-route, moving, idle ETA", () => {
    const events = detectDeviations(null, makeSnapshot({}));
    expect(events).toEqual([]);
  });

  it("returns no events when polyline is empty (off_route detector short-circuits)", () => {
    const events = detectDeviations(
      null,
      makeSnapshot({ routePolyline: [], currentPosition: NYC })
    );
    expect(events).toEqual([]);
  });

  it("returns no off_route event when currentPosition is null", () => {
    const events = detectDeviations(null, makeSnapshot({ currentPosition: null }));
    expect(events.find((e) => e.type === "off_route")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// KI-116 regression — origin vertex must not flag off_route
// ---------------------------------------------------------------------------
describe("detectDeviations — KI-116 regression (origin vertex)", () => {
  it("does NOT report off_route when user is sitting on the origin polyline vertex", () => {
    // User is exactly at the first polyline vertex — distance to nearest
    // segment vertex is 0 mi, well below the 0.3 mi threshold.
    const events = detectDeviations(null, makeSnapshot({ currentPosition: ATLANTA }));
    expect(events.find((e) => e.type === "off_route")).toBeUndefined();
  });

  it("DOES report off_route (high severity) when user is hundreds of miles from polyline", () => {
    // KI-116 audit smoking gun: GPS in Atlanta but nav session destination in NYC.
    const events = detectDeviations(
      null,
      makeSnapshot({ currentPosition: NYC, routePolyline: [ATLANTA, ATLANTA_NORTH] })
    );
    const off = events.find((e) => e.type === "off_route");
    expect(off).toBeDefined();
    expect(off?.severity).toBe("high");
    if (off?.type === "off_route") {
      expect(off.metadata.distanceMiles).toBeGreaterThan(700);
    }
  });
});

// ---------------------------------------------------------------------------
// off_route severity bands
// ---------------------------------------------------------------------------
describe("detectDeviations — off_route severity", () => {
  it("flags medium severity when distance is between threshold and 1 mile", () => {
    // Move ~0.5 mi north of polyline (roughly 0.0073 deg latitude).
    const slightlyOff = { latitude: ATLANTA.latitude + 0.0073, longitude: ATLANTA.longitude };
    const events = detectDeviations(null, makeSnapshot({ currentPosition: slightlyOff }));
    const off = events.find((e) => e.type === "off_route");
    expect(off?.severity).toBe("medium");
  });

  it("does NOT flag off_route when distance is exactly under threshold", () => {
    // Just inside the 0.3 mi guard.
    expect(OFF_ROUTE_THRESHOLD_MILES).toBe(0.3);
    const justInside = {
      latitude: ATLANTA.latitude + 0.001, // ~0.07 mi
      longitude: ATLANTA.longitude,
    };
    const events = detectDeviations(null, makeSnapshot({ currentPosition: justInside }));
    expect(events.find((e) => e.type === "off_route")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// stopped detector + GPS jitter guard
// ---------------------------------------------------------------------------
describe("detectDeviations — stopped + GPS jitter", () => {
  it("flags stopped when speed is at or below threshold", () => {
    const events = detectDeviations(
      null,
      makeSnapshot({ currentSpeedMph: STOPPED_SPEED_THRESHOLD_MPH })
    );
    const stopped = events.find((e) => e.type === "stopped");
    expect(stopped).toBeDefined();
    expect(stopped?.severity).toBe("low");
  });

  it("does NOT flag stopped when speed is above threshold", () => {
    const events = detectDeviations(null, makeSnapshot({ currentSpeedMph: 35 }));
    expect(events.find((e) => e.type === "stopped")).toBeUndefined();
  });

  it("does NOT flag stopped when speed is null", () => {
    const events = detectDeviations(null, makeSnapshot({ currentSpeedMph: null }));
    expect(events.find((e) => e.type === "stopped")).toBeUndefined();
  });

  it("GPS jitter guard suppresses stopped when position barely changed (< 8m)", () => {
    const previous = makeSnapshot({ currentSpeedMph: 1, currentPosition: ATLANTA });
    // Tiny delta — about 1m.
    const tinyDelta = {
      latitude: ATLANTA.latitude + 0.00001,
      longitude: ATLANTA.longitude,
    };
    const current = makeSnapshot({ currentSpeedMph: 1, currentPosition: tinyDelta });
    const events = detectDeviations(previous, current);
    expect(events.find((e) => e.type === "stopped")).toBeUndefined();
  });

  it("GPS jitter guard does NOT suppress stopped when position moved more than 8m", () => {
    const previous = makeSnapshot({ currentSpeedMph: 1, currentPosition: ATLANTA });
    // ~50 m north of the prev position.
    const movedDelta = {
      latitude: ATLANTA.latitude + 0.00045,
      longitude: ATLANTA.longitude,
    };
    const current = makeSnapshot({ currentSpeedMph: 1, currentPosition: movedDelta });
    const events = detectDeviations(previous, current);
    expect(events.find((e) => e.type === "stopped")).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// route_change detector
// ---------------------------------------------------------------------------
describe("detectDeviations — route_change", () => {
  it("flags route_change when routeId changes", () => {
    const previous = makeSnapshot({ routeId: "fastest" });
    const current = makeSnapshot({ routeId: "balanced" });
    const events = detectDeviations(previous, current);
    const change = events.find((e) => e.type === "route_change");
    expect(change).toBeDefined();
    expect(change?.severity).toBe("medium");
    if (change?.type === "route_change") {
      expect(change.metadata.previousRouteId).toBe("fastest");
      expect(change.metadata.currentRouteId).toBe("balanced");
    }
  });

  it("does NOT flag route_change when routeId is unchanged", () => {
    const previous = makeSnapshot({ routeId: "fastest" });
    const current = makeSnapshot({ routeId: "fastest" });
    const events = detectDeviations(previous, current);
    expect(events.find((e) => e.type === "route_change")).toBeUndefined();
  });

  it("does NOT flag route_change when previous routeId is null", () => {
    const previous = makeSnapshot({ routeId: null });
    const current = makeSnapshot({ routeId: "balanced" });
    const events = detectDeviations(previous, current);
    expect(events.find((e) => e.type === "route_change")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// delay_increase detector
// ---------------------------------------------------------------------------
describe("detectDeviations — delay_increase", () => {
  it("flags delay_increase (medium) when ETA grows by >20% but ≤10 min", () => {
    const previous = makeSnapshot({ estimatedDurationMinutes: 20 });
    const current = makeSnapshot({ estimatedDurationMinutes: 26 }); // +6 min, 30%
    const events = detectDeviations(previous, current);
    const delay = events.find((e) => e.type === "delay_increase");
    expect(delay).toBeDefined();
    expect(delay?.severity).toBe("medium");
  });

  it("flags delay_increase (high) when ETA grows by more than 10 minutes", () => {
    const previous = makeSnapshot({ estimatedDurationMinutes: 30 });
    const current = makeSnapshot({ estimatedDurationMinutes: 50 }); // +20 min
    const events = detectDeviations(previous, current);
    const delay = events.find((e) => e.type === "delay_increase");
    expect(delay?.severity).toBe("high");
  });

  it("uses the 3-min absolute floor when 20% would be below it", () => {
    // 5 min route, 20% would be 1 min (below 3-min floor).
    // +4 min increase clears the floor.
    const previous = makeSnapshot({ estimatedDurationMinutes: 5 });
    const current = makeSnapshot({ estimatedDurationMinutes: 9 });
    const events = detectDeviations(previous, current);
    expect(events.find((e) => e.type === "delay_increase")).toBeDefined();
  });

  it("does NOT flag delay_increase when routeId differs (route_change handles it)", () => {
    const previous = makeSnapshot({ routeId: "fastest", estimatedDurationMinutes: 20 });
    const current = makeSnapshot({ routeId: "balanced", estimatedDurationMinutes: 50 });
    const events = detectDeviations(previous, current);
    expect(events.find((e) => e.type === "delay_increase")).toBeUndefined();
  });

  it("does NOT flag delay_increase when ETA decreases", () => {
    const previous = makeSnapshot({ estimatedDurationMinutes: 30 });
    const current = makeSnapshot({ estimatedDurationMinutes: 20 });
    const events = detectDeviations(previous, current);
    expect(events.find((e) => e.type === "delay_increase")).toBeUndefined();
  });
});
