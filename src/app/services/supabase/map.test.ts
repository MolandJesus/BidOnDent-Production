import { describe, expect, it, vi } from "vitest";

vi.mock("./client", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { haversineMiles, resolveShopCoordinates, zipToCoordinates } from "./map";
import type { PartnerShopMapRecord } from "./types";

// ---------------------------------------------------------------------------
// zipToCoordinates
// ---------------------------------------------------------------------------
describe("zipToCoordinates", () => {
  it("returns coordinates for a known NYC zip prefix", () => {
    const result = zipToCoordinates("10001");

    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(40.71, 1);
    expect(result!.lng).toBeCloseTo(-73.94, 1);
  });

  it("returns coordinates for an Atlanta zip prefix", () => {
    const result = zipToCoordinates("30303");

    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(33.80, 1);
  });

  it("returns coordinates for a Chicago zip prefix", () => {
    const result = zipToCoordinates("60601");

    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(41.88, 1);
  });

  it("returns null for undefined zip", () => {
    expect(zipToCoordinates(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(zipToCoordinates("")).toBeNull();
  });

  it("returns null for zip with too few digits", () => {
    expect(zipToCoordinates("12")).toBeNull();
  });

  it("returns null for unknown zip prefix", () => {
    expect(zipToCoordinates("99999")).toBeNull();
  });

  it("strips non-numeric characters", () => {
    const result = zipToCoordinates("100-01");

    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(40.71, 1);
  });
});

// ---------------------------------------------------------------------------
// haversineMiles
// ---------------------------------------------------------------------------
describe("haversineMiles", () => {
  it("returns 0 for identical coordinates", () => {
    const point = { lat: 40.7128, lng: -73.9352 };
    expect(haversineMiles(point, point)).toBeCloseTo(0, 5);
  });

  it("calculates NYC to LA distance approximately", () => {
    const nyc = { lat: 40.7128, lng: -74.006 };
    const la = { lat: 34.0522, lng: -118.2437 };
    const distance = haversineMiles(nyc, la);

    // NYC to LA is roughly 2,450 miles
    expect(distance).toBeGreaterThan(2400);
    expect(distance).toBeLessThan(2500);
  });

  it("calculates short distance within a city", () => {
    const timesSquare = { lat: 40.758, lng: -73.9855 };
    const centralPark = { lat: 40.7829, lng: -73.9654 };
    const distance = haversineMiles(timesSquare, centralPark);

    // About 1.5 miles
    expect(distance).toBeGreaterThan(1);
    expect(distance).toBeLessThan(3);
  });

  it("is symmetrical", () => {
    const a = { lat: 40.7128, lng: -74.006 };
    const b = { lat: 34.0522, lng: -118.2437 };

    expect(haversineMiles(a, b)).toBeCloseTo(haversineMiles(b, a), 5);
  });
});

// ---------------------------------------------------------------------------
// resolveShopCoordinates
// ---------------------------------------------------------------------------
describe("resolveShopCoordinates", () => {
  it("returns lat/lng from shop record when available", () => {
    const shop: PartnerShopMapRecord = {
      id: "s-1",
      shop_name: "Test Shop",
      latitude: 40.7128,
      longitude: -73.9352,
      zip_code: "10001",
    };

    const result = resolveShopCoordinates(shop);

    expect(result).toEqual({ lat: 40.7128, lng: -73.9352 });
  });

  it("falls back to zipToCoordinates when lat/lng are null", () => {
    const shop: PartnerShopMapRecord = {
      id: "s-2",
      shop_name: "Zip Shop",
      latitude: null,
      longitude: null,
      zip_code: "10001",
    };

    const result = resolveShopCoordinates(shop);

    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(40.71, 1);
  });

  it("falls back to zipToCoordinates when lat/lng are undefined", () => {
    const shop: PartnerShopMapRecord = {
      id: "s-3",
      shop_name: "No Coords",
      zip_code: "30303",
    };

    const result = resolveShopCoordinates(shop);

    expect(result).not.toBeNull();
    expect(result!.lat).toBeCloseTo(33.80, 1);
  });

  it("returns null when neither lat/lng nor valid zip exist", () => {
    const shop: PartnerShopMapRecord = {
      id: "s-4",
      shop_name: "No Location",
      zip_code: "99999",
    };

    expect(resolveShopCoordinates(shop)).toBeNull();
  });

  it("returns null when no zip_code and no lat/lng", () => {
    const shop: PartnerShopMapRecord = {
      id: "s-5",
      shop_name: "Empty Shop",
    };

    expect(resolveShopCoordinates(shop)).toBeNull();
  });
});
