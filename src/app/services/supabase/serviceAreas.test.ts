/**
 * Tests for serviceAreas.ts client service — Pass 206 (Phase 5+).
 *
 * Covers all five exported functions:
 *   - getShopServiceAreas (encodes shopProfileId, swallows errors → [])
 *   - getMyShopServiceAreas (no params, swallows errors → [])
 *   - saveShopServiceArea (POST + body shape, rethrows errors)
 *   - deleteShopServiceArea (DELETE + body shape, rethrows errors)
 *   - getAllPublicServiceAreas (?all=true, swallows errors → [])
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
  deleteShopServiceArea,
  getAllPublicServiceAreas,
  getMyShopServiceAreas,
  getShopServiceAreas,
  saveShopServiceArea,
  type ShopServiceArea,
} from "./serviceAreas";

const mockRequest = vi.mocked(requestSupabaseEdge);

const fakeArea: ShopServiceArea = {
  id: "sa-1",
  shop_profile_id: "shop-1",
  label: "Atlanta metro",
  area_type: "radius",
  center_latitude: 33.749,
  center_longitude: -84.388,
  radius_miles: 15,
  zip_codes: [],
  is_active: true,
  created_at: "2026-05-09T00:00:00.000Z",
  updated_at: "2026-05-09T00:00:00.000Z",
};

beforeEach(() => {
  mockRequest.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// getShopServiceAreas
// ---------------------------------------------------------------------------
describe("getShopServiceAreas", () => {
  it("URL-encodes shopProfileId and returns the unwrapped array", async () => {
    mockRequest.mockResolvedValueOnce({ serviceAreas: [fakeArea] });

    const result = await getShopServiceAreas("shop/1?x");

    expect(result).toEqual([fakeArea]);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.shopServiceAreas}?shopProfileId=${encodeURIComponent("shop/1?x")}`,
      { method: "GET" }
    );
  });

  it("returns empty array when serviceAreas key is missing", async () => {
    mockRequest.mockResolvedValueOnce({});
    expect(await getShopServiceAreas("shop-1")).toEqual([]);
  });

  it("swallows errors and returns empty array", async () => {
    mockRequest.mockRejectedValueOnce(new Error("network down"));
    expect(await getShopServiceAreas("shop-1")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getMyShopServiceAreas
// ---------------------------------------------------------------------------
describe("getMyShopServiceAreas", () => {
  it("calls the canonical endpoint without query params", async () => {
    mockRequest.mockResolvedValueOnce({ serviceAreas: [fakeArea] });

    const result = await getMyShopServiceAreas();

    expect(result).toEqual([fakeArea]);
    expect(mockRequest).toHaveBeenCalledWith(SUPABASE_EDGE_ROUTES.shopServiceAreas, {
      method: "GET",
    });
  });

  it("swallows errors and returns empty array", async () => {
    mockRequest.mockRejectedValueOnce(new Error("rls denied"));
    expect(await getMyShopServiceAreas()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// saveShopServiceArea
// ---------------------------------------------------------------------------
describe("saveShopServiceArea", () => {
  it("POSTs the canonical body and returns the saved area", async () => {
    mockRequest.mockResolvedValueOnce({ serviceArea: fakeArea });

    const input = { label: "Atlanta metro", area_type: "radius" as const };
    const result = await saveShopServiceArea("user_abc", input);

    expect(result).toEqual(fakeArea);
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.shopServiceAreas,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ clerkUserId: "user_abc", serviceArea: input }),
      })
    );
  });

  it("returns null when serviceArea key is missing on response", async () => {
    mockRequest.mockResolvedValueOnce({});
    const result = await saveShopServiceArea("user_abc", {});
    expect(result).toBeNull();
  });

  it("rethrows errors instead of swallowing them", async () => {
    mockRequest.mockRejectedValueOnce(new Error("rls denied"));
    await expect(saveShopServiceArea("user_abc", {})).rejects.toThrow("rls denied");
  });
});

// ---------------------------------------------------------------------------
// deleteShopServiceArea
// ---------------------------------------------------------------------------
describe("deleteShopServiceArea", () => {
  it("DELETEs with the canonical body and returns true on success", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await deleteShopServiceArea("user_abc", "sa-1");

    expect(result).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.shopServiceAreas,
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ clerkUserId: "user_abc", serviceAreaId: "sa-1" }),
      })
    );
  });

  it("rethrows errors instead of swallowing them", async () => {
    mockRequest.mockRejectedValueOnce(new Error("not found"));
    await expect(deleteShopServiceArea("user_abc", "sa-1")).rejects.toThrow("not found");
  });
});

// ---------------------------------------------------------------------------
// getAllPublicServiceAreas
// ---------------------------------------------------------------------------
describe("getAllPublicServiceAreas", () => {
  it("calls the endpoint with ?all=true and returns the unwrapped array", async () => {
    mockRequest.mockResolvedValueOnce({ serviceAreas: [fakeArea] });

    const result = await getAllPublicServiceAreas();

    expect(result).toEqual([fakeArea]);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.shopServiceAreas}?all=true`,
      { method: "GET" }
    );
  });

  it("swallows errors and returns empty array", async () => {
    mockRequest.mockRejectedValueOnce(new Error("boom"));
    expect(await getAllPublicServiceAreas()).toEqual([]);
  });
});
