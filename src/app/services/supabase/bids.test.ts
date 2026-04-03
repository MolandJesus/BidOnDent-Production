import { afterEach, describe, expect, it, vi } from "vitest";

import type { Bid } from "./types";

// Mock the runtime module so requestSupabaseEdge is a controllable stub
vi.mock("./runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./runtime")>();
  return {
    ...actual,
    requestSupabaseEdge: vi.fn(),
  };
});

import {
  deleteBid,
  getBidsForReport,
  getMyBids,
  getShopSubmittedBids,
  submitBid,
  updateBidStatus,
} from "./bids";
import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

const mockRequest = vi.mocked(requestSupabaseEdge);

const fakeBid: Bid = {
  id: "bid-1",
  damage_report_id: "report-1",
  amount: 350,
  estimated_days: 3,
  status: "pending",
  shop_name: "Quick Fix Auto",
};

afterEach(() => {
  mockRequest.mockReset();
});

// ---------------------------------------------------------------------------
// getBidsForReport
// ---------------------------------------------------------------------------
describe("getBidsForReport", () => {
  it("returns bids for a given report", async () => {
    mockRequest.mockResolvedValueOnce({ bids: [fakeBid] });

    const result = await getBidsForReport("report-1");

    expect(result).toEqual([fakeBid]);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.bids}?reportId=report-1`,
      { method: "GET" },
    );
  });

  it("returns empty array when response has no bids key", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await getBidsForReport("report-1");

    expect(result).toEqual([]);
  });

  it("returns empty array on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("network failure"));

    const result = await getBidsForReport("report-1");

    expect(result).toEqual([]);
  });

  it("encodes reportId with special characters", async () => {
    mockRequest.mockResolvedValueOnce({ bids: [] });

    await getBidsForReport("report/special&id");

    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("reportId=report%2Fspecial%26id"),
      expect.any(Object),
    );
  });
});

// ---------------------------------------------------------------------------
// submitBid
// ---------------------------------------------------------------------------
describe("submitBid", () => {
  it("submits a bid and returns the result", async () => {
    mockRequest.mockResolvedValueOnce({ bid: { ...fakeBid, id: "bid-new" } });

    const result = await submitBid(fakeBid, "clerk-user-1");

    expect(result).toEqual({ ...fakeBid, id: "bid-new" });
    expect(mockRequest).toHaveBeenCalledWith(SUPABASE_EDGE_ROUTES.bids, {
      method: "POST",
      body: JSON.stringify({ clerkUserId: "clerk-user-1", bid: fakeBid }),
    });
  });

  it("returns null when clerkUserId is undefined", async () => {
    const result = await submitBid(fakeBid, undefined);

    expect(result).toBeNull();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns null when response has no bid key", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await submitBid(fakeBid, "clerk-user-1");

    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("500"));

    const result = await submitBid(fakeBid, "clerk-user-1");

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// updateBidStatus
// ---------------------------------------------------------------------------
describe("updateBidStatus", () => {
  it("updates bid status to accepted", async () => {
    const acceptedBid = { ...fakeBid, status: "accepted" as const };
    mockRequest.mockResolvedValueOnce({ bid: acceptedBid });

    const result = await updateBidStatus("bid-1", "accepted", "clerk-user-1");

    expect(result).toEqual(acceptedBid);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.bids}/bid-1`,
      {
        method: "PUT",
        body: JSON.stringify({ status: "accepted", clerkUserId: "clerk-user-1" }),
      },
    );
  });

  it("updates bid status to rejected", async () => {
    const rejectedBid = { ...fakeBid, status: "rejected" as const };
    mockRequest.mockResolvedValueOnce({ bid: rejectedBid });

    const result = await updateBidStatus("bid-1", "rejected", "clerk-user-1");

    expect(result).toEqual(rejectedBid);
  });

  it("returns null when clerkUserId is missing", async () => {
    const result = await updateBidStatus("bid-1", "accepted", undefined);

    expect(result).toBeNull();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns null on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("timeout"));

    const result = await updateBidStatus("bid-1", "accepted", "clerk-user-1");

    expect(result).toBeNull();
  });

  it("encodes bidId with special characters", async () => {
    mockRequest.mockResolvedValueOnce({ bid: fakeBid });

    await updateBidStatus("bid/special&id", "accepted", "clerk-user-1");

    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("bid%2Fspecial%26id"),
      expect.any(Object),
    );
  });
});

// ---------------------------------------------------------------------------
// getMyBids
// ---------------------------------------------------------------------------
describe("getMyBids", () => {
  it("returns bids for the current customer", async () => {
    mockRequest.mockResolvedValueOnce({ bids: [fakeBid] });

    const result = await getMyBids("clerk-customer-1");

    expect(result).toEqual([fakeBid]);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.bids}?customerClerkUserId=clerk-customer-1`,
      { method: "GET" },
    );
  });

  it("returns empty array when clerkUserId is undefined", async () => {
    const result = await getMyBids(undefined);

    expect(result).toEqual([]);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns empty array on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("network"));

    const result = await getMyBids("clerk-customer-1");

    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// getShopSubmittedBids
// ---------------------------------------------------------------------------
describe("getShopSubmittedBids", () => {
  it("returns bids submitted by a shop user", async () => {
    mockRequest.mockResolvedValueOnce({ bids: [fakeBid] });

    const result = await getShopSubmittedBids("clerk-shop-1");

    expect(result).toEqual([fakeBid]);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.bids}?clerkUserId=clerk-shop-1`,
      { method: "GET" },
    );
  });

  it("returns empty array when clerkUserId is undefined", async () => {
    const result = await getShopSubmittedBids(undefined);

    expect(result).toEqual([]);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns empty array on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("net"));

    const result = await getShopSubmittedBids("clerk-shop-1");

    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// deleteBid
// ---------------------------------------------------------------------------
describe("deleteBid", () => {
  it("deletes a bid and returns true", async () => {
    mockRequest.mockResolvedValueOnce({ success: true });

    const result = await deleteBid("bid-1", "clerk-user-1");

    expect(result).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.bids}/bid-1?clerkUserId=clerk-user-1`,
      { method: "DELETE" },
    );
  });

  it("returns false when clerkUserId is missing", async () => {
    const result = await deleteBid("bid-1", undefined);

    expect(result).toBe(false);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns false on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("500"));

    const result = await deleteBid("bid-1", "clerk-user-1");

    expect(result).toBe(false);
  });

  it("encodes bidId and clerkUserId in URL", async () => {
    mockRequest.mockResolvedValueOnce({ success: true });

    await deleteBid("bid/special", "user/special");

    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("bid%2Fspecial?clerkUserId=user%2Fspecial"),
      expect.any(Object),
    );
  });
});
