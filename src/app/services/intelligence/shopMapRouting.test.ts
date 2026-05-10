import { describe, expect, it } from "vitest";
import {
  calculateDistanceMiles,
  flagImplausibleRoute,
  formatDistanceLabel,
} from "./shopMapRouting";

describe("calculateDistanceMiles", () => {
  it("returns 0 for identical coordinates", () => {
    const point = { latitude: 40.7128, longitude: -74.006 };
    expect(calculateDistanceMiles(point, point)).toBe(0);
  });

  it("calculates known NYC → JFK distance (~12 mi)", () => {
    const manhattan = { latitude: 40.7128, longitude: -74.006 };
    const jfk = { latitude: 40.6413, longitude: -73.7781 };
    const distance = calculateDistanceMiles(manhattan, jfk);
    expect(distance).toBeGreaterThan(11);
    expect(distance).toBeLessThan(14);
  });

  it("calculates known NYC → LA distance (~2,450 mi)", () => {
    const nyc = { latitude: 40.7128, longitude: -74.006 };
    const la = { latitude: 34.0522, longitude: -118.2437 };
    const distance = calculateDistanceMiles(nyc, la);
    expect(distance).toBeGreaterThan(2400);
    expect(distance).toBeLessThan(2500);
  });

  it("is symmetric", () => {
    const a = { latitude: 40.7128, longitude: -74.006 };
    const b = { latitude: 40.758, longitude: -73.9855 };
    expect(calculateDistanceMiles(a, b)).toBeCloseTo(calculateDistanceMiles(b, a), 10);
  });
});

describe("formatDistanceLabel", () => {
  it("formats sub-mile with one decimal", () => {
    expect(formatDistanceLabel(0.3)).toBe("0.3 mi");
  });

  it("formats 1+ miles with one decimal", () => {
    expect(formatDistanceLabel(3.456)).toBe("3.5 mi");
  });

  it("formats exact mile", () => {
    expect(formatDistanceLabel(1.0)).toBe("1.0 mi");
  });

  it("formats very small distance", () => {
    expect(formatDistanceLabel(0.05)).toBe("0.1 mi");
  });
});

describe("flagImplausibleRoute (KI-169 sanity check)", () => {
  it("passes a typical local route through clean", () => {
    // 5mi at 30mph ≈ 10min — well inside all bands
    const result = flagImplausibleRoute({ distanceMiles: 5, durationMinutes: 10 });
    expect(result.isImplausible).toBe(false);
    expect(result.reasons).toEqual([]);
  });

  it("catches the audit AI's 853mi / 1264min case", () => {
    const result = flagImplausibleRoute({ distanceMiles: 853.4, durationMinutes: 1264 });
    expect(result.isImplausible).toBe(true);
    expect(result.reasons.length).toBeGreaterThanOrEqual(2);
    expect(result.reasons.some((r) => r.includes("100mi"))).toBe(true);
    expect(result.reasons.some((r) => r.includes("240min"))).toBe(true);
  });

  it("flags a >100mi route even if duration is plausible", () => {
    // 150mi at 75mph = 120min — duration in band, distance not
    const result = flagImplausibleRoute({ distanceMiles: 150, durationMinutes: 120 });
    expect(result.isImplausible).toBe(true);
    expect(result.reasons.some((r) => r.includes("100mi"))).toBe(true);
  });

  it("flags >240min even if distance is plausible", () => {
    // 80mi at 19mph = 252min — distance OK, duration not
    const result = flagImplausibleRoute({ distanceMiles: 80, durationMinutes: 252 });
    expect(result.isImplausible).toBe(true);
    expect(result.reasons.some((r) => r.includes("240min"))).toBe(true);
  });

  it("flags implied speed below 10mph", () => {
    // 5mi in 60min → 5mph (gridlock-grade or stationary GPS)
    const result = flagImplausibleRoute({ distanceMiles: 5, durationMinutes: 60 });
    expect(result.isImplausible).toBe(true);
    expect(result.reasons.some((r) => r.includes("speed"))).toBe(true);
  });

  it("flags implied speed above 80mph", () => {
    // 50mi in 30min → 100mph (route engine fed wrong duration)
    const result = flagImplausibleRoute({ distanceMiles: 50, durationMinutes: 30 });
    expect(result.isImplausible).toBe(true);
    expect(result.reasons.some((r) => r.includes("speed"))).toBe(true);
  });

  it("does not divide-by-zero on tiny distances", () => {
    const result = flagImplausibleRoute({ distanceMiles: 0.05, durationMinutes: 5 });
    // Distance is too small to compute implied speed reliably; should not flag
    // on speed-band alone (the 0.1mi guard skips that check).
    expect(result.reasons.some((r) => r.includes("speed"))).toBe(false);
  });

  it("returns plausible for highway-speed long-but-in-band routes", () => {
    // 60mi at 60mph = 60min — all bands clean
    const result = flagImplausibleRoute({ distanceMiles: 60, durationMinutes: 60 });
    expect(result.isImplausible).toBe(false);
  });
});
