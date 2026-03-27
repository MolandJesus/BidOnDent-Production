import { describe, expect, it } from "vitest";
import { calculateDistanceMiles, formatDistanceLabel } from "./shopMapRouting";

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
