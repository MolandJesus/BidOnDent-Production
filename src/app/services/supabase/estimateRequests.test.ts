import { afterEach, describe, expect, it, vi } from "vitest";

import type { EstimateRequest } from "./estimateRequests";

// Mock the runtime module so requestSupabaseEdge is a controllable stub
vi.mock("./runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./runtime")>();
  return {
    ...actual,
    requestSupabaseEdge: vi.fn(),
  };
});

import {
  submitEstimateRequest,
  getMyEstimateRequests,
  updateEstimateRequest,
  getShopEstimateRequests,
  customerRespondToEstimate,
} from "./estimateRequests";
import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

const mockRequest = vi.mocked(requestSupabaseEdge);

const fakeRequest: EstimateRequest = {
  id: "est-1",
  shop_id: 42,
  shop_name: "Quick Fix Auto",
  clerk_customer_user_id: "user_abc",
  customer_name: "Jane Doe",
  customer_email: "jane@example.com",
  description: "Front bumper dent",
  timeline: "this week",
  status: "pending",
  created_at: "2025-01-15T12:00:00Z",
  updated_at: "2025-01-15T12:00:00Z",
};

afterEach(() => {
  mockRequest.mockReset();
});

// ---------------------------------------------------------------------------
// submitEstimateRequest
// ---------------------------------------------------------------------------
describe("submitEstimateRequest", () => {
  it("returns null when clerkUserId is missing", async () => {
    const result = await submitEstimateRequest(
      { shop_id: 42, shop_name: "Shop", description: "Dent", timeline: "asap" },
      undefined
    );
    expect(result).toBeNull();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("posts request and returns the estimate", async () => {
    mockRequest.mockResolvedValueOnce({ estimateRequest: fakeRequest });
    const result = await submitEstimateRequest(
      { shop_id: 42, shop_name: "Quick Fix Auto", description: "Front bumper dent", timeline: "this week" },
      "user_abc"
    );
    expect(result).toEqual(fakeRequest);
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.estimateRequests,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns null when response has no estimateRequest key", async () => {
    mockRequest.mockResolvedValueOnce({});
    const result = await submitEstimateRequest(
      { shop_id: 42, shop_name: "Shop", description: "Dent", timeline: "asap" },
      "user_abc"
    );
    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("Network failure"));
    const result = await submitEstimateRequest(
      { shop_id: 42, shop_name: "Shop", description: "Dent", timeline: "asap" },
      "user_abc"
    );
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getMyEstimateRequests
// ---------------------------------------------------------------------------
describe("getMyEstimateRequests", () => {
  it("returns empty array when clerkUserId is missing", async () => {
    const result = await getMyEstimateRequests(undefined);
    expect(result).toEqual([]);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("fetches user estimate requests", async () => {
    mockRequest.mockResolvedValueOnce({ estimateRequests: [fakeRequest] });
    const result = await getMyEstimateRequests("user_abc");
    expect(result).toEqual([fakeRequest]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("clerkUserId=user_abc"),
      expect.objectContaining({ method: "GET" })
    );
  });

  it("returns empty array when response has no estimateRequests key", async () => {
    mockRequest.mockResolvedValueOnce({});
    const result = await getMyEstimateRequests("user_abc");
    expect(result).toEqual([]);
  });

  it("returns empty array on error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("fail"));
    const result = await getMyEstimateRequests("user_abc");
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// updateEstimateRequest
// ---------------------------------------------------------------------------
describe("updateEstimateRequest", () => {
  it("returns null when clerkUserId is missing", async () => {
    const result = await updateEstimateRequest("est-1", "viewed", "");
    expect(result).toBeNull();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns null when requestId is missing", async () => {
    const result = await updateEstimateRequest("", "viewed", "user_abc");
    expect(result).toBeNull();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("patches status and returns updated estimate", async () => {
    const updated = { ...fakeRequest, status: "viewed" as const };
    mockRequest.mockResolvedValueOnce({ estimateRequest: updated });
    const result = await updateEstimateRequest("est-1", "viewed", "user_abc");
    expect(result).toEqual(updated);
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.estimateRequests,
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("includes responseMessage in body when provided", async () => {
    mockRequest.mockResolvedValueOnce({ estimateRequest: fakeRequest });
    await updateEstimateRequest("est-1", "responded", "user_abc", "We can do $300");
    const callBody = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(callBody.responseMessage).toBe("We can do $300");
  });

  it("returns null on error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("fail"));
    const result = await updateEstimateRequest("est-1", "viewed", "user_abc");
    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getShopEstimateRequests
// ---------------------------------------------------------------------------
describe("getShopEstimateRequests", () => {
  it("returns empty array when shopClerkUserId is empty", async () => {
    const result = await getShopEstimateRequests("");
    expect(result).toEqual([]);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("fetches shop estimate requests", async () => {
    mockRequest.mockResolvedValueOnce({ estimateRequests: [fakeRequest] });
    const result = await getShopEstimateRequests("shop_abc");
    expect(result).toEqual([fakeRequest]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("shopClerkUserId=shop_abc"),
      expect.objectContaining({ method: "GET" })
    );
  });

  it("returns empty array on error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("fail"));
    const result = await getShopEstimateRequests("shop_abc");
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// customerRespondToEstimate
// ---------------------------------------------------------------------------
describe("customerRespondToEstimate", () => {
  it("returns null when clerkUserId is missing", async () => {
    const result = await customerRespondToEstimate("est-1", "accepted", "");
    expect(result).toBeNull();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns null when requestId is missing", async () => {
    const result = await customerRespondToEstimate("", "accepted", "user_abc");
    expect(result).toBeNull();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("sends PUT with accepted status", async () => {
    const accepted = { ...fakeRequest, status: "accepted" as const };
    mockRequest.mockResolvedValueOnce({ estimateRequest: accepted });
    const result = await customerRespondToEstimate("est-1", "accepted", "user_abc");
    expect(result).toEqual(accepted);
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.estimateRequests,
      expect.objectContaining({ method: "PUT" })
    );
  });

  it("sends PUT with declined status", async () => {
    const declined = { ...fakeRequest, status: "declined" as const };
    mockRequest.mockResolvedValueOnce({ estimateRequest: declined });
    const result = await customerRespondToEstimate("est-1", "declined", "user_abc");
    expect(result).toEqual(declined);
  });

  it("returns null on error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("fail"));
    const result = await customerRespondToEstimate("est-1", "accepted", "user_abc");
    expect(result).toBeNull();
  });
});
