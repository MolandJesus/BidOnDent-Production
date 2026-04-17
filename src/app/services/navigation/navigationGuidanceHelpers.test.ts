import { describe, expect, it, vi } from "vitest";

vi.mock("../supabase/map", () => ({
  haversineMiles: (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusMiles = 3958.8;
    const dLat = toRadians(b.lat - a.lat);
    const dLng = toRadians(b.lng - a.lng);
    const startLat = toRadians(a.lat);
    const endLat = toRadians(b.lat);
    const haversine =
      Math.sin(dLat / 2) ** 2 + Math.cos(startLat) * Math.cos(endLat) * Math.sin(dLng / 2) ** 2;
    return 2 * earthRadiusMiles * Math.asin(Math.sqrt(haversine));
  },
}));

import {
  calculateFallbackSpeedMph,
  resolveReliableCurrentSpeedMph,
} from "./navigationGuidanceHelpers";

describe("calculateFallbackSpeedMph", () => {
  it("returns null without a previous point", () => {
    expect(calculateFallbackSpeedMph(null, null, { lat: 41.1, lng: -73.8 }, Date.now())).toBeNull();
  });

  it("calculates fallback speed from distance over time", () => {
    const previousTimestamp = Date.now();
    const nextTimestamp = previousTimestamp + 60_000;

    const speed = calculateFallbackSpeedMph(
      { lat: 40.7128, lng: -74.006 },
      previousTimestamp,
      { lat: 40.7248, lng: -74.006 },
      nextTimestamp
    );

    expect(speed).toBeGreaterThan(45);
    expect(speed).toBeLessThan(60);
  });
});

describe("resolveReliableCurrentSpeedMph", () => {
  it("prefers the fallback speed when the device speed spikes far above the previous reading", () => {
    const nextSpeed = resolveReliableCurrentSpeedMph({
      speedFromDeviceMph: 184,
      fallbackSpeedMph: 23,
      previousSpeedMph: 21,
      elapsedMs: 1_000,
      gpsAccuracyMeters: 18,
    });

    expect(nextSpeed).toBe(23);
  });

  it("holds near the previous speed when only a poor-accuracy spike is available", () => {
    const nextSpeed = resolveReliableCurrentSpeedMph({
      speedFromDeviceMph: 184,
      fallbackSpeedMph: null,
      previousSpeedMph: 24,
      elapsedMs: 1_000,
      gpsAccuracyMeters: 86,
    });

    expect(nextSpeed).toBe(24);
  });

  it("allows realistic increases when the new reading is plausible", () => {
    const nextSpeed = resolveReliableCurrentSpeedMph({
      speedFromDeviceMph: 42,
      fallbackSpeedMph: 39,
      previousSpeedMph: 28,
      elapsedMs: 1_500,
      gpsAccuracyMeters: 14,
    });

    expect(nextSpeed).toBe(39);
  });

  it("uses the lower of two disagreeing first readings until a reliable history exists", () => {
    const nextSpeed = resolveReliableCurrentSpeedMph({
      speedFromDeviceMph: 91,
      fallbackSpeedMph: 28,
      previousSpeedMph: null,
      elapsedMs: null,
      gpsAccuracyMeters: 22,
    });

    expect(nextSpeed).toBe(28);
  });
});
