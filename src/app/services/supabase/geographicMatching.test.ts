/**
 * Tests for geographicMatching.ts client service — Pass 206 (Phase 5+).
 *
 * Covers:
 *   - getNearbyShops builds correct query string + radius default
 *   - getNearbyShops returns the unwrapped array
 *   - getReportsInMyServiceArea hits the canonical endpoint with no params
 *   - errors propagate to caller (no internal swallow)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./runtime")>();
  return {
    ...actual,
    requestSupabaseEdge: vi.fn(),
  };
});

import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";
import {
  getNearbyShops,
  getReportsInMyServiceArea,
  type NearbyReport,
  type NearbyShop,
} from "./geographicMatching";

const mockRequest = vi.mocked(requestSupabaseEdge);

const fakeShop: NearbyShop = {
  id: "shop-1",
  business_name: "Quick Fix Auto",
  geo_latitude: 33.749,
  geo_longitude: -84.388,
  city: "Atlanta",
  state: "GA",
  phone: null,
  website: null,
  is_verified: true,
  distance_miles: 1.2,
};

const fakeReport: NearbyReport = {
  id: "rep-1",
  status: "open",
  damage_type: "dent",
  description: "rear bumper dent",
  latitude: 33.75,
  longitude: -84.39,
  zip_code: "30303",
  created_at: "2026-05-09T00:00:00.000Z",
  distance_miles: 0.4,
};

beforeEach(() => {
  mockRequest.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// getNearbyShops
// ---------------------------------------------------------------------------
describe("getNearbyShops", () => {
  it("builds the canonical query string and default radius_miles=25", async () => {
    mockRequest.mockResolvedValueOnce({ shops: [fakeShop], total: 1 });

    const result = await getNearbyShops(33.749, -84.388);

    expect(result).toEqual([fakeShop]);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.nearbyShops}?latitude=33.749&longitude=-84.388&radius_miles=25`,
      { method: "GET" }
    );
  });

  it("respects custom radiusMiles", async () => {
    mockRequest.mockResolvedValueOnce({ shops: [], total: 0 });

    await getNearbyShops(0, 0, 10);

    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.nearbyShops}?latitude=0&longitude=0&radius_miles=10`,
      { method: "GET" }
    );
  });

  it("returns empty array when edge returns no shops", async () => {
    mockRequest.mockResolvedValueOnce({ shops: [], total: 0 });
    expect(await getNearbyShops(0, 0)).toEqual([]);
  });

  it("propagates errors to caller", async () => {
    mockRequest.mockRejectedValueOnce(new Error("postgis down"));
    await expect(getNearbyShops(0, 0)).rejects.toThrow("postgis down");
  });
});

// ---------------------------------------------------------------------------
// getReportsInMyServiceArea
// ---------------------------------------------------------------------------
describe("getReportsInMyServiceArea", () => {
  it("calls the reports-in-service-area endpoint without params", async () => {
    mockRequest.mockResolvedValueOnce({ reports: [fakeReport], total: 1 });

    const result = await getReportsInMyServiceArea();

    expect(result).toEqual([fakeReport]);
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.reportsInServiceArea,
      { method: "GET" }
    );
  });

  it("returns empty array when edge returns no reports", async () => {
    mockRequest.mockResolvedValueOnce({ reports: [], total: 0 });
    expect(await getReportsInMyServiceArea()).toEqual([]);
  });

  it("propagates errors to caller", async () => {
    mockRequest.mockRejectedValueOnce(new Error("rls denied"));
    await expect(getReportsInMyServiceArea()).rejects.toThrow("rls denied");
  });
});
