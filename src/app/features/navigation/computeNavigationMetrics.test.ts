/**
 * Tests for computeNavigationMetrics — Pass 209.
 *
 * Pure math helpers used in nav overlays. Covers:
 *   - haversineDistanceMiles: zero distance, known reference (ATL→LAX),
 *     symmetric distance.
 *   - formatDistance: feet vs miles threshold (0.2 mi cutoff), rounding.
 *   - computeETA: empty/zero, default 35mph, custom speed, rounding.
 */
import { describe, expect, it } from "vitest";

import {
  computeETA,
  formatDistance,
  haversineDistanceMiles,
} from "./computeNavigationMetrics";

describe("haversineDistanceMiles", () => {
  it("returns 0 for identical coordinates", () => {
    expect(haversineDistanceMiles({ latitude: 33.749, longitude: -84.388 }, { latitude: 33.749, longitude: -84.388 }))
      .toBeCloseTo(0, 5);
  });

  it("computes ATL → LAX distance to within 1% of known great-circle (~1946 mi)", () => {
    const atl = { latitude: 33.6407, longitude: -84.4277 };
    const lax = { latitude: 33.9416, longitude: -118.4085 };
    const d = haversineDistanceMiles(atl, lax);
    expect(d).toBeGreaterThan(1925);
    expect(d).toBeLessThan(1965);
  });

  it("is symmetric a→b == b→a", () => {
    const a = { latitude: 33.7, longitude: -84.4 };
    const b = { latitude: 34.0, longitude: -85.0 };
    expect(haversineDistanceMiles(a, b)).toBeCloseTo(haversineDistanceMiles(b, a), 6);
  });
});

describe("formatDistance", () => {
  it("renders feet under 0.2 mi", () => {
    expect(formatDistance(0.1)).toBe("528 ft");
    expect(formatDistance(0.05)).toBe("264 ft");
    expect(formatDistance(0)).toBe("0 ft");
  });

  it("renders miles at or above 0.2 mi with 1-decimal precision", () => {
    expect(formatDistance(0.2)).toBe("0.2 mi");
    expect(formatDistance(1)).toBe("1.0 mi");
    expect(formatDistance(2.456)).toBe("2.5 mi");
  });
});

describe("computeETA", () => {
  it("returns empty string for zero or missing distance", () => {
    expect(computeETA(0)).toBe("");
    expect(computeETA(-1)).toBe("");
    // @ts-expect-error — exercise undefined input path
    expect(computeETA(undefined)).toBe("");
  });

  it("uses default 35 mph average speed", () => {
    // 35 miles at 35 mph = 60 min
    expect(computeETA(35)).toBe("60 min");
  });

  it("respects custom averageSpeedMph", () => {
    // 60 miles at 60 mph = 60 min
    expect(computeETA(60, 60)).toBe("60 min");
    // 30 miles at 30 mph = 60 min
    expect(computeETA(30, 30)).toBe("60 min");
  });

  it("rounds minutes to nearest integer", () => {
    // 1 mile at 35 mph = 1.71 min → 2 min
    expect(computeETA(1)).toBe("2 min");
  });
});
