import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RealtimeBidService } from "./RealtimeBidService";

// Track channel subscriptions
type ChannelCallback = (status: string) => void;
type PostgresListener = {
  event: string;
  callback: (payload: { new: Record<string, unknown>; old: Record<string, unknown> }) => void;
};

function createMockChannel() {
  const listeners: PostgresListener[] = [];
  let subscribeCallback: ChannelCallback | null = null;

  const channel = {
    on: vi.fn((_type: string, _filter: unknown, callback: PostgresListener["callback"]) => {
      listeners.push({ event: (_filter as { event: string }).event, callback });
      return channel;
    }),
    subscribe: vi.fn((cb: ChannelCallback) => {
      subscribeCallback = cb;
      // Auto-trigger SUBSCRIBED
      setTimeout(() => cb("SUBSCRIBED"), 0);
      return channel;
    }),
    // Expose internal helpers for tests
    _listeners: listeners,
    _triggerSubscribeStatus: (status: string) => subscribeCallback?.(status),
    _triggerPostgresEvent: (
      event: string,
      payload: { new?: Record<string, unknown>; old?: Record<string, unknown> }
    ) => {
      const listener = listeners.find((l) => l.event === event);
      listener?.callback({ new: payload.new ?? {}, old: payload.old ?? {} });
    },
  };

  return channel;
}

// Mock supabase module
const mockChannels = new Map<string, ReturnType<typeof createMockChannel>>();

vi.mock("../supabaseService", () => ({
  supabase: {
    channel: vi.fn((name: string) => {
      const ch = createMockChannel();
      mockChannels.set(name, ch);
      return ch;
    }),
    removeChannel: vi.fn(),
  },
}));

describe("RealtimeBidService", () => {
  let service: RealtimeBidService;

  beforeEach(() => {
    service = new RealtimeBidService();
    mockChannels.clear();
  });

  afterEach(() => {
    service.unsubscribeAll();
    vi.restoreAllMocks();
  });

  // ── Subscription state management ──

  it("starts with zero subscriptions", () => {
    expect(service.getActiveSubscriptionCount()).toBe(0);
    expect(service.isSubscribed("report-1")).toBe(false);
  });

  it("tracks subscription after subscribeToReportBids", () => {
    service.subscribeToReportBids("report-1");
    expect(service.isSubscribed("report-1")).toBe(true);
    expect(service.getActiveSubscriptionCount()).toBe(1);
  });

  it("prevents duplicate subscriptions for same report", () => {
    service.subscribeToReportBids("report-1");
    service.subscribeToReportBids("report-1");
    expect(service.getActiveSubscriptionCount()).toBe(1);
  });

  it("supports multiple report subscriptions", () => {
    service.subscribeToReportBids("report-1");
    service.subscribeToReportBids("report-2");
    expect(service.getActiveSubscriptionCount()).toBe(2);
  });

  it("unsubscribes by reportId", () => {
    service.subscribeToReportBids("report-1");
    service.unsubscribeFromReportBids("report-1");
    expect(service.isSubscribed("report-1")).toBe(false);
    expect(service.getActiveSubscriptionCount()).toBe(0);
  });

  it("unsubscribeAll clears everything", () => {
    service.subscribeToReportBids("report-1");
    service.subscribeToReportBids("report-2");
    service.subscribeToAllBids();
    expect(service.getActiveSubscriptionCount()).toBe(3);

    service.unsubscribeAll();
    expect(service.getActiveSubscriptionCount()).toBe(0);
  });

  it("returns unsubscribe function from subscribeToReportBids", () => {
    const unsub = service.subscribeToReportBids("report-1");
    expect(service.isSubscribed("report-1")).toBe(true);
    unsub();
    expect(service.isSubscribed("report-1")).toBe(false);
  });

  // ── subscribeToAllBids ──

  it("tracks all-bids subscription", () => {
    service.subscribeToAllBids();
    expect(service.isSubscribed("all-bids")).toBe(true);
  });

  it("returns unsubscribe from subscribeToAllBids", () => {
    const unsub = service.subscribeToAllBids();
    expect(service.isSubscribed("all-bids")).toBe(true);
    unsub();
    expect(service.isSubscribed("all-bids")).toBe(false);
  });

  // ── Bid transformation via callbacks ──

  it("transforms INSERT payload and fires onNewBid callback", () => {
    const onNew = vi.fn();
    service.subscribeToReportBids("report-1", onNew);

    const channel = mockChannels.get("report-bids-report-1")!;
    channel._triggerPostgresEvent("INSERT", {
      new: {
        id: "bid-1",
        clerk_shop_user_id: "shop-1",
        shop_name: "Ace Body Shop",
        shop_email: "ace@test.com",
        damage_report_id: "report-1",
        amount: "1500.50",
        estimated_days: "5",
        description: "Full repair",
        status: "pending",
        created_at: "2026-04-03T12:00:00Z",
      },
    });

    expect(onNew).toHaveBeenCalledTimes(1);
    const bid = onNew.mock.calls[0][0];
    expect(bid.id).toBe("bid-1");
    expect(bid.shopId).toBe("shop-1");
    expect(bid.shopName).toBe("Ace Body Shop");
    expect(bid.amount).toBe(1500.5);
    expect(bid.estimatedDays).toBe(5);
    expect(bid.status).toBe("pending");
  });

  it("transforms UPDATE payload and fires onUpdateBid callback", () => {
    const onUpdate = vi.fn();
    service.subscribeToReportBids("report-1", undefined, onUpdate);

    const channel = mockChannels.get("report-bids-report-1")!;
    channel._triggerPostgresEvent("UPDATE", {
      new: {
        id: "bid-1",
        shop_id: "shop-2",
        shop_name: "Pro Dent",
        damage_report_id: "report-1",
        amount: "2000",
        estimated_days: "3",
        status: "accepted",
        created_at: "2026-04-03T12:00:00Z",
      },
    });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate.mock.calls[0][0].status).toBe("accepted");
    expect(onUpdate.mock.calls[0][0].shopId).toBe("shop-2");
  });

  it("fires onDeleteBid with bid ID", () => {
    const onDelete = vi.fn();
    service.subscribeToReportBids("report-1", undefined, undefined, onDelete);

    const channel = mockChannels.get("report-bids-report-1")!;
    channel._triggerPostgresEvent("DELETE", {
      old: { id: "bid-1" },
    });

    expect(onDelete).toHaveBeenCalledWith("bid-1");
  });

  // ── transformBidFromDb edge cases ──

  it("handles missing fields with sensible defaults", () => {
    const onNew = vi.fn();
    service.subscribeToReportBids("report-x", onNew);

    const channel = mockChannels.get("report-bids-report-x")!;
    channel._triggerPostgresEvent("INSERT", {
      new: { id: "bid-empty" },
    });

    const bid = onNew.mock.calls[0][0];
    expect(bid.shopName).toBe("Unknown Shop");
    expect(bid.shopEmail).toBe("");
    expect(bid.amount).toBe(0);
    expect(bid.estimatedDays).toBe(0);
    expect(bid.description).toBe("");
    expect(bid.status).toBe("pending");
  });

  it("uses fallback shop ID fields in priority order", () => {
    const onNew = vi.fn();
    service.subscribeToReportBids("report-y", onNew);

    const channel = mockChannels.get("report-bids-report-y")!;

    // Only user_id present
    channel._triggerPostgresEvent("INSERT", {
      new: { id: "b1", user_id: "uid-1" },
    });
    expect(onNew.mock.calls[0][0].shopId).toBe("uid-1");

    // shop_user_id wins over user_id
    channel._triggerPostgresEvent("INSERT", {
      new: { id: "b2", shop_user_id: "suid-1", user_id: "uid-1" },
    });
    expect(onNew.mock.calls[1][0].shopId).toBe("suid-1");

    // clerk_shop_user_id wins over all
    channel._triggerPostgresEvent("INSERT", {
      new: { id: "b3", clerk_shop_user_id: "csuid-1", shop_id: "sid-1", user_id: "uid-1" },
    });
    expect(onNew.mock.calls[2][0].shopId).toBe("csuid-1");
  });

  // ── Connection status callbacks ──

  it("fires connection status callback on subscribe", async () => {
    const onStatus = vi.fn();
    service.subscribeToReportBids("report-1", undefined, undefined, undefined, onStatus);

    // Let the setTimeout fire
    await new Promise((r) => setTimeout(r, 10));
    expect(onStatus).toHaveBeenCalledWith("connected");
  });

  it("fires error status on CHANNEL_ERROR", () => {
    const onStatus = vi.fn();
    service.subscribeToReportBids("report-1", undefined, undefined, undefined, onStatus);

    const channel = mockChannels.get("report-bids-report-1")!;
    channel._triggerSubscribeStatus("CHANNEL_ERROR");
    expect(onStatus).toHaveBeenCalledWith("error");
  });

  it("fires disconnected status on CLOSED", () => {
    const onStatus = vi.fn();
    service.subscribeToReportBids("report-1", undefined, undefined, undefined, onStatus);

    const channel = mockChannels.get("report-bids-report-1")!;
    channel._triggerSubscribeStatus("CLOSED");
    expect(onStatus).toHaveBeenCalledWith("disconnected");
  });

  // ── Global callbacks ──

  it("fires global onNew alongside per-report callback", () => {
    const globalNew = vi.fn();
    const reportNew = vi.fn();

    service.setGlobalCallbacks({ onNew: globalNew });
    service.subscribeToReportBids("report-1", reportNew);

    const channel = mockChannels.get("report-bids-report-1")!;
    channel._triggerPostgresEvent("INSERT", {
      new: { id: "bid-g1", shop_name: "G Shop", amount: "100" },
    });

    expect(reportNew).toHaveBeenCalledTimes(1);
    expect(globalNew).toHaveBeenCalledTimes(1);
    expect(globalNew.mock.calls[0][0].shopName).toBe("G Shop");
  });

  // ── Health status ──

  it("returns correct health status", () => {
    service.subscribeToReportBids("report-1");
    service.subscribeToReportBids("report-2");

    const health = service.getHealthStatus();
    expect(health.healthy).toBe(true);
    expect(health.activeSubscriptions).toBe(2);
    expect(health.subscriptions).toContain("report-1");
    expect(health.subscriptions).toContain("report-2");
  });

  it("returns healthy even with zero subscriptions", () => {
    const health = service.getHealthStatus();
    expect(health.healthy).toBe(true);
    expect(health.activeSubscriptions).toBe(0);
  });
});
