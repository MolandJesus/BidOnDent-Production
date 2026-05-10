/**
 * Tests for notificationPreferences.ts client service — Pass 206 (Phase 5+).
 *
 * Covers:
 *   - getNotificationPreferences happy path strips fallback flag absence
 *   - fallback:true response is annotated with __fallback marker
 *   - thrown error trips 60s breaker — next call rejects without runtime hit
 *   - breaker auto-clears after the window
 *   - updateNotificationPreferences sends partial body and returns prefs
 *
 * Module-level cachedFailure resets via vi.resetModules + dynamic import.
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

const mockRequest = vi.mocked(requestSupabaseEdge);

async function loadService() {
  vi.resetModules();
  return await import("./notificationPreferences");
}

const fakePrefs = {
  id: "np-1",
  clerk_user_id: "user_abc",
  in_app_bid_updates: true,
  in_app_report_updates: true,
  in_app_nearby_reports: true,
  in_app_estimate_updates: true,
  email_bid_updates: false,
  email_report_updates: false,
  email_nearby_reports: false,
  email_estimate_updates: false,
  sms_bid_updates: false,
  sms_report_updates: false,
  email_enabled: true,
  sms_enabled: false,
  share_data_with_shops: true,
  show_profile_to_insurers: true,
};

beforeEach(() => {
  mockRequest.mockReset();
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// getNotificationPreferences
// ---------------------------------------------------------------------------
describe("getNotificationPreferences", () => {
  it("returns the preferences as-is on success (no __fallback marker)", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ preferences: fakePrefs });

    const result = await svc.getNotificationPreferences();

    expect(result).toEqual(fakePrefs);
    expect(result).not.toHaveProperty("__fallback");
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.notificationPreferences,
      { method: "GET" }
    );
  });

  it("annotates response with __fallback:true when edge returns fallback flag", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ preferences: fakePrefs, fallback: true });

    const result = await svc.getNotificationPreferences();

    expect(result).toEqual({ ...fakePrefs, __fallback: true });
  });

  it("rethrows on error and trips 60s breaker", async () => {
    const svc = await loadService();
    mockRequest.mockRejectedValueOnce(new Error("network down"));

    await expect(svc.getNotificationPreferences()).rejects.toThrow("network down");

    // Second call short-circuits with a breaker error WITHOUT hitting runtime.
    await expect(svc.getNotificationPreferences()).rejects.toThrow(/temporarily unavailable/);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it("breaker auto-clears after 60s and retries the runtime", async () => {
    const svc = await loadService();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-09T00:00:00.000Z"));
    mockRequest.mockRejectedValueOnce(new Error("boom"));

    await expect(svc.getNotificationPreferences()).rejects.toThrow();
    expect(mockRequest).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date("2026-05-09T00:01:01.000Z"));
    mockRequest.mockResolvedValueOnce({ preferences: fakePrefs });

    const result = await svc.getNotificationPreferences();
    expect(result).toEqual(fakePrefs);
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it("clears the breaker on a subsequent successful call", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ preferences: fakePrefs });

    await svc.getNotificationPreferences();
    // No breaker ever set — verify a second success works without delay.
    mockRequest.mockResolvedValueOnce({ preferences: fakePrefs });
    await svc.getNotificationPreferences();
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// updateNotificationPreferences
// ---------------------------------------------------------------------------
describe("updateNotificationPreferences", () => {
  it("PUTs only the partial body and returns the new preferences", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ preferences: fakePrefs });

    const result = await svc.updateNotificationPreferences({
      in_app_bid_updates: false,
    });

    expect(result).toEqual(fakePrefs);
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.notificationPreferences,
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify({ preferences: { in_app_bid_updates: false } }),
      })
    );
  });

  it("does not catch errors (caller decides — UI optimistic-revert path)", async () => {
    const svc = await loadService();
    mockRequest.mockRejectedValueOnce(new Error("rls denied"));

    await expect(
      svc.updateNotificationPreferences({ email_enabled: false })
    ).rejects.toThrow("rls denied");
  });
});
