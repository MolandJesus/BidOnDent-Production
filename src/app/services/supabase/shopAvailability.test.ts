/**
 * Tests for shopAvailability.ts client service (Pass 75 — Phase 5).
 *
 * Covers:
 *   - updateOwnShopAvailability: success, fallback:true (KI-095) trip, error trip,
 *     breaker short-circuit, 60s breaker auto-clear.
 *   - fetchShopAvailability: success, fallback trip, error trip, empty-id guard.
 *   - subscribeToShopAvailability: smoke — channel is created, status callbacks
 *     fire on SUBSCRIBED / CHANNEL_ERROR / CLOSED, unsubscribe removes the channel.
 *
 * The supabase client is mocked so realtime channel construction is observable
 * without touching the real ws connection. Module-level cachedFailure resets
 * via vi.resetModules + re-import per test.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the runtime module so requestSupabaseEdge is a controllable stub.
vi.mock("./runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./runtime")>();
  return {
    ...actual,
    requestSupabaseEdge: vi.fn(),
  };
});

// Mock the supabase client used by subscribeToShopAvailability.
type StatusHandler = (status: string) => void;
type ChangeHandler = (payload: { new: Record<string, unknown> }) => void;

const mockChannelState: {
  lastChannelId: string | null;
  lastStatusHandler: StatusHandler | null;
  lastChangeHandler: ChangeHandler | null;
  channels: unknown[];
  removed: unknown[];
} = {
  lastChannelId: null,
  lastStatusHandler: null,
  lastChangeHandler: null,
  channels: [],
  removed: [],
};

vi.mock("../supabaseService", () => {
  function makeChannel(channelId: string) {
    mockChannelState.lastChannelId = channelId;
    const channel = {
      on(_event: string, _opts: unknown, handler: ChangeHandler) {
        mockChannelState.lastChangeHandler = handler;
        return channel;
      },
      subscribe(handler: StatusHandler) {
        mockChannelState.lastStatusHandler = handler;
        mockChannelState.channels.push(channel);
        return channel;
      },
    };
    return channel;
  }
  return {
    supabase: {
      channel: vi.fn((id: string) => makeChannel(id)),
      removeChannel: vi.fn((channel: unknown) => {
        mockChannelState.removed.push(channel);
      }),
    },
  };
});

import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

const mockRequest = vi.mocked(requestSupabaseEdge);

async function loadService() {
  vi.resetModules();
  return await import("./shopAvailability");
}

const fakeAvailability = {
  shopId: "shop-1",
  isAvailable: true,
  availableUntil: null,
  availabilityUpdatedAt: "2026-05-09T00:00:00.000Z",
  availabilityNote: null,
};

beforeEach(() => {
  mockRequest.mockReset();
  mockChannelState.lastChannelId = null;
  mockChannelState.lastStatusHandler = null;
  mockChannelState.lastChangeHandler = null;
  mockChannelState.channels = [];
  mockChannelState.removed = [];
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------------------------------------------------------------------------
// updateOwnShopAvailability
// ---------------------------------------------------------------------------
describe("updateOwnShopAvailability", () => {
  it("PUTs the canonical body and returns success + availability", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({
      success: true,
      availability: fakeAvailability,
    });

    const result = await svc.updateOwnShopAvailability({
      isAvailable: true,
      availableUntil: null,
      note: "open all day",
    });

    expect(result).toEqual({ success: true, availability: fakeAvailability });
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.shopAvailability,
      expect.objectContaining({
        method: "PUT",
        body: expect.stringContaining(`"isAvailable":true`),
      })
    );
  });

  it("returns success:false and trips breaker on fallback:true", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ fallback: true });

    const first = await svc.updateOwnShopAvailability({ isAvailable: false });
    expect(first).toEqual({ success: false, availability: null });

    const second = await svc.updateOwnShopAvailability({ isAvailable: false });
    expect(second).toEqual({ success: false, availability: null });
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it("returns success:false and trips breaker on thrown error", async () => {
    const svc = await loadService();
    mockRequest.mockRejectedValueOnce(new Error("network down"));

    expect(await svc.updateOwnShopAvailability({ isAvailable: true })).toEqual({
      success: false,
      availability: null,
    });
    expect(await svc.updateOwnShopAvailability({ isAvailable: true })).toEqual({
      success: false,
      availability: null,
    });
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it("breaker auto-clears after 60s backoff window", async () => {
    const svc = await loadService();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-09T00:00:00.000Z"));
    mockRequest.mockRejectedValueOnce(new Error("boom"));

    await svc.updateOwnShopAvailability({ isAvailable: true });
    expect(mockRequest).toHaveBeenCalledTimes(1);

    vi.setSystemTime(new Date("2026-05-09T00:01:01.000Z"));
    mockRequest.mockResolvedValueOnce({
      success: true,
      availability: fakeAvailability,
    });

    const result = await svc.updateOwnShopAvailability({ isAvailable: true });
    expect(result).toEqual({ success: true, availability: fakeAvailability });
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// fetchShopAvailability
// ---------------------------------------------------------------------------
describe("fetchShopAvailability", () => {
  it("returns the availability snapshot on success", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ availability: fakeAvailability });

    const result = await svc.fetchShopAvailability("shop-1");

    expect(result).toEqual(fakeAvailability);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.shopAvailability}/shop-1`,
      { method: "GET" }
    );
  });

  it("returns null and skips runtime when shopId is empty", async () => {
    const svc = await loadService();

    const result = await svc.fetchShopAvailability("");

    expect(result).toBeNull();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns null and trips breaker on fallback:true", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ fallback: true });

    expect(await svc.fetchShopAvailability("shop-1")).toBeNull();
    expect(await svc.fetchShopAvailability("shop-1")).toBeNull();
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it("returns null and trips breaker on thrown error", async () => {
    const svc = await loadService();
    mockRequest.mockRejectedValueOnce(new Error("boom"));

    expect(await svc.fetchShopAvailability("shop-1")).toBeNull();
    expect(await svc.fetchShopAvailability("shop-1")).toBeNull();
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it("URL-encodes shopId with special characters", async () => {
    const svc = await loadService();
    mockRequest.mockResolvedValueOnce({ availability: null });

    await svc.fetchShopAvailability("shop/1?x");

    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.shopAvailability}/${encodeURIComponent("shop/1?x")}`,
      { method: "GET" }
    );
  });
});

// ---------------------------------------------------------------------------
// subscribeToShopAvailability
// ---------------------------------------------------------------------------
describe("subscribeToShopAvailability", () => {
  it("opens a stable-id channel and forwards SUBSCRIBED → connected", async () => {
    const svc = await loadService();
    const onChange = vi.fn();
    const onStatus = vi.fn();

    const unsub = svc.subscribeToShopAvailability(onChange, onStatus);

    expect(mockChannelState.lastChannelId).toBe("shop-availability-global");
    expect(mockChannelState.lastStatusHandler).toBeTypeOf("function");

    mockChannelState.lastStatusHandler!("SUBSCRIBED");
    expect(onStatus).toHaveBeenCalledWith("connected");

    unsub();
    expect(mockChannelState.removed).toHaveLength(1);
    // Final cleanup status fires.
    expect(onStatus).toHaveBeenLastCalledWith("idle");
  });

  it("forwards CHANNEL_ERROR → error and CLOSED → disconnected", async () => {
    const svc = await loadService();
    const onChange = vi.fn();
    const onStatus = vi.fn();

    svc.subscribeToShopAvailability(onChange, onStatus);

    mockChannelState.lastStatusHandler!("CHANNEL_ERROR");
    expect(onStatus).toHaveBeenCalledWith("error");

    mockChannelState.lastStatusHandler!("CLOSED");
    expect(onStatus).toHaveBeenCalledWith("disconnected");
  });

  it("invokes onChange with the shaped row when a postgres_changes payload arrives", async () => {
    const svc = await loadService();
    const onChange = vi.fn();

    svc.subscribeToShopAvailability(onChange);

    expect(mockChannelState.lastChangeHandler).toBeTypeOf("function");
    mockChannelState.lastChangeHandler!({
      new: {
        id: "shop-9",
        is_available: true,
        available_until: null,
        availability_updated_at: "2026-05-09T01:00:00.000Z",
        availability_note: "back at 3pm",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      shopId: "shop-9",
      isAvailable: true,
      availableUntil: null,
      availabilityUpdatedAt: "2026-05-09T01:00:00.000Z",
      availabilityNote: "back at 3pm",
    });
  });

  it("ignores postgres_changes payloads with non-string id", async () => {
    const svc = await loadService();
    const onChange = vi.fn();

    svc.subscribeToShopAvailability(onChange);
    mockChannelState.lastChangeHandler!({
      new: { id: 123, is_available: true },
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});
