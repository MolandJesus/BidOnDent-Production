/**
 * Tests for navigationSavedPlaces.ts client service (Pass 75 — Phase 5).
 *
 * Covers:
 *   - fetch / upsert / delete happy path
 *   - fallback:true response trips circuit breaker (KI-095)
 *   - thrown error trips breaker
 *   - while breaker is tripped, calls short-circuit without hitting runtime
 *   - breaker auto-clears after 60s backoff window
 *
 * Module-level cachedFailure state is reset between tests via vi.resetModules
 * + a re-import in beforeEach, so each test starts with a clean breaker.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { NavigationSavedLocation } from "../../types/navigation";

// Mock the runtime module so requestSupabaseEdge is a controllable stub.
vi.mock("./runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./runtime")>();
  return {
    ...actual,
    requestSupabaseEdge: vi.fn(),
  };
});

import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

const mockRequest = vi.mocked(requestSupabaseEdge);

// Fresh module import per test so `cachedFailure` resets.
async function loadService() {
  vi.resetModules();
  return await import("./navigationSavedPlaces");
}

const fakeRow = {
  id: "row-1",
  clerk_user_id: "user_abc",
  client_id: "place-1",
  label: "Home",
  subtitle: null,
  category: "home" as const,
  lat: 37.77,
  lng: -122.41,
  last_used_at: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const fakeLocation: NavigationSavedLocation = {
  id: "place-1",
  label: "Home",
  category: "home",
  coordinate: { lat: 37.77, lng: -122.41 },
  createdAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  mockRequest.mockReset();
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// fetchNavigationSavedPlaces
// ---------------------------------------------------------------------------
describe("fetchNavigationSavedPlaces", () => {
  it("returns places + fallback:false on success", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ places: [fakeRow] });

    const result = await svc.fetchNavigationSavedPlaces();

    expect(result).toEqual({ places: [fakeRow], fallback: false });
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.navigationSavedPlaces,
      { method: "GET" }
    );
  });

  it("returns empty array when response has no places key", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({});

    const result = await svc.fetchNavigationSavedPlaces();

    expect(result).toEqual({ places: [], fallback: false });
  });

  it("returns fallback:true and trips breaker when edge returns fallback", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ fallback: true, places: [] });

    const first = await svc.fetchNavigationSavedPlaces();
    expect(first).toEqual({ places: [], fallback: true });

    // Subsequent call short-circuits without hitting the runtime.
    const second = await svc.fetchNavigationSavedPlaces();
    expect(second).toEqual({ places: [], fallback: true });
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it("returns fallback:true and trips breaker on thrown error", async () => {
    const svc = await loadService();
    mockRequest.mockRejectedValueOnce(new Error("network down"));

    const first = await svc.fetchNavigationSavedPlaces();
    expect(first).toEqual({ places: [], fallback: true });

    const second = await svc.fetchNavigationSavedPlaces();
    expect(second).toEqual({ places: [], fallback: true });
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it("breaker auto-clears after 60s backoff window", async () => {
    const svc = await loadService();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-09T00:00:00.000Z"));
    mockRequest.mockRejectedValueOnce(new Error("network down"));

    await svc.fetchNavigationSavedPlaces();
    expect(mockRequest).toHaveBeenCalledTimes(1);

    // Advance past the 60s window.
    vi.setSystemTime(new Date("2026-05-09T00:01:01.000Z"));
    mockRequest.mockResolvedValueOnce({ places: [fakeRow] });

    const result = await svc.fetchNavigationSavedPlaces();
    expect(result).toEqual({ places: [fakeRow], fallback: false });
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// upsertNavigationSavedPlace
// ---------------------------------------------------------------------------
describe("upsertNavigationSavedPlace", () => {
  it("returns true on success and PUTs the canonical body shape", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ place: fakeRow });

    const ok = await svc.upsertNavigationSavedPlace(fakeLocation);

    expect(ok).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.navigationSavedPlaces,
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining(`"client_id":"place-1"`),
      })
    );
  });

  it("returns false and trips breaker on fallback:true", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ fallback: true });

    expect(await svc.upsertNavigationSavedPlace(fakeLocation)).toBe(false);
    // Breaker tripped — second call short-circuits.
    expect(await svc.upsertNavigationSavedPlace(fakeLocation)).toBe(false);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it("returns false and trips breaker on thrown error", async () => {
    const svc = await loadService();
    mockRequest.mockRejectedValueOnce(new Error("boom"));

    expect(await svc.upsertNavigationSavedPlace(fakeLocation)).toBe(false);
    expect(await svc.upsertNavigationSavedPlace(fakeLocation)).toBe(false);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it("returns true when only `success` flag is set on the response", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ success: true });

    expect(await svc.upsertNavigationSavedPlace(fakeLocation)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// deleteNavigationSavedPlace
// ---------------------------------------------------------------------------
describe("deleteNavigationSavedPlace", () => {
  it("DELETEs the per-clientId path and returns true on success", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ success: true });

    const ok = await svc.deleteNavigationSavedPlace("place-1");

    expect(ok).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.navigationSavedPlaces}/place-1`,
      { method: "DELETE" }
    );
  });

  it("URL-encodes clientId with special characters", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ success: true });

    await svc.deleteNavigationSavedPlace("place/1?weird&id");

    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.navigationSavedPlaces}/${encodeURIComponent("place/1?weird&id")}`,
      { method: "DELETE" }
    );
  });

  it("returns false and trips breaker on fallback:true", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ fallback: true });

    expect(await svc.deleteNavigationSavedPlace("place-1")).toBe(false);
    expect(await svc.deleteNavigationSavedPlace("place-1")).toBe(false);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it("returns false and trips breaker on thrown error", async () => {
    const svc = await loadService();
    mockRequest.mockRejectedValueOnce(new Error("boom"));

    expect(await svc.deleteNavigationSavedPlace("place-1")).toBe(false);
    expect(await svc.deleteNavigationSavedPlace("place-1")).toBe(false);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });
});
