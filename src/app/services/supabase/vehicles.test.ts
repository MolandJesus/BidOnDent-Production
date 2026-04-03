import { afterEach, describe, expect, it, vi } from "vitest";

import type { Vehicle } from "./types";

vi.mock("./runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./runtime")>();
  return {
    ...actual,
    requestSupabaseEdge: vi.fn(),
  };
});

import { deleteVehicle, getVehicles, saveVehicle } from "./vehicles";
import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

const mockRequest = vi.mocked(requestSupabaseEdge);

const fakeVehicle: Vehicle = {
  id: "v-1",
  make: "Honda",
  model: "Civic",
  year: 2022,
  color: "Silver",
  vin: "1HGBH41JXMN109186",
};

afterEach(() => {
  mockRequest.mockReset();
});

// ---------------------------------------------------------------------------
// getVehicles
// ---------------------------------------------------------------------------
describe("getVehicles", () => {
  it("returns vehicles for a clerkUserId", async () => {
    mockRequest.mockResolvedValueOnce({ vehicles: [fakeVehicle] });

    const result = await getVehicles("clerk-user-1");

    expect(result).toEqual([fakeVehicle]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining(`${SUPABASE_EDGE_ROUTES.vehicles}?clerkUserId=clerk-user-1`),
      { method: "GET" },
    );
  });

  it("returns vehicles for an email identity", async () => {
    mockRequest.mockResolvedValueOnce({ vehicles: [fakeVehicle] });

    const result = await getVehicles("user@example.com");

    expect(result).toEqual([fakeVehicle]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("email=user%40example.com"),
      expect.any(Object),
    );
  });

  it("returns vehicles for a websiteUserKey", async () => {
    mockRequest.mockResolvedValueOnce({ vehicles: [fakeVehicle] });

    const result = await getVehicles("website-user-abc");

    expect(result).toEqual([fakeVehicle]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("websiteUserKey=website-user-abc"),
      expect.any(Object),
    );
  });

  it("returns vehicles for a WebsiteProfileIdentity object", async () => {
    mockRequest.mockResolvedValueOnce({ vehicles: [fakeVehicle] });

    const result = await getVehicles({ clerkUserId: "clerk-obj-1" });

    expect(result).toEqual([fakeVehicle]);
  });

  it("returns empty array when identity is null", async () => {
    const result = await getVehicles(null);

    expect(result).toEqual([]);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns empty array when identity is undefined", async () => {
    const result = await getVehicles(undefined);

    expect(result).toEqual([]);
  });

  it("returns empty array when response has no vehicles key", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await getVehicles("clerk-user-1");

    expect(result).toEqual([]);
  });

  it("returns empty array on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("network"));

    const result = await getVehicles("clerk-user-1");

    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// saveVehicle
// ---------------------------------------------------------------------------
describe("saveVehicle", () => {
  it("saves vehicle and returns true", async () => {
    mockRequest.mockResolvedValueOnce({ success: true });

    const result = await saveVehicle(fakeVehicle, "clerk-user-1");

    expect(result).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith(SUPABASE_EDGE_ROUTES.vehicles, {
      method: "POST",
      body: JSON.stringify({ clerkUserId: "clerk-user-1", vehicle: fakeVehicle }),
    });
  });

  it("returns false when clerkUserId is missing", async () => {
    const result = await saveVehicle(fakeVehicle, undefined);

    expect(result).toBe(false);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns false on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("500"));

    const result = await saveVehicle(fakeVehicle, "clerk-user-1");

    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteVehicle
// ---------------------------------------------------------------------------
describe("deleteVehicle", () => {
  it("deletes vehicle and returns true", async () => {
    mockRequest.mockResolvedValueOnce({ success: true });

    const result = await deleteVehicle("v-1", "clerk-user-1");

    expect(result).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith(SUPABASE_EDGE_ROUTES.deleteVehicle, {
      method: "POST",
      body: JSON.stringify({ clerkUserId: "clerk-user-1", vehicleId: "v-1" }),
    });
  });

  it("returns false when clerkUserId is missing", async () => {
    const result = await deleteVehicle("v-1", undefined);

    expect(result).toBe(false);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns false on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("fail"));

    const result = await deleteVehicle("v-1", "clerk-user-1");

    expect(result).toBe(false);
  });
});
