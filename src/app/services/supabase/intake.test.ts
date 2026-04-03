import { afterEach, describe, expect, it, vi } from "vitest";

// Mock the runtime module
vi.mock("./runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./runtime")>();
  return {
    ...actual,
    requestSupabaseEdge: vi.fn(),
  };
});

import { submitShopInterest, submitInsurerInterest } from "./intake";
import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

const mockRequest = vi.mocked(requestSupabaseEdge);

afterEach(() => {
  mockRequest.mockReset();
});

// ---------------------------------------------------------------------------
// submitShopInterest
// ---------------------------------------------------------------------------
describe("submitShopInterest", () => {
  const shopPayload = {
    shop_name: "Quick Fix",
    dmv_registration_number: "DMV-123",
    contact_person: "Jane",
    email: "jane@quickfix.com",
    phone_number: "555-0100",
    address: "123 Main St",
    city: "Yonkers",
    state: "NY",
    zip_code: "10701",
  };

  it("posts shop interest and returns response", async () => {
    mockRequest.mockResolvedValueOnce({ submissionId: "sub-1" });
    const result = await submitShopInterest(shopPayload);
    expect(result).toEqual({ submissionId: "sub-1" });
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.shopInterest,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("sends the payload as JSON body", async () => {
    mockRequest.mockResolvedValueOnce({ submissionId: null });
    await submitShopInterest(shopPayload);
    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.shop_name).toBe("Quick Fix");
    expect(body.dmv_registration_number).toBe("DMV-123");
  });

  it("propagates errors from the edge function", async () => {
    mockRequest.mockRejectedValueOnce(new Error("Server error"));
    await expect(submitShopInterest(shopPayload)).rejects.toThrow("Server error");
  });
});

// ---------------------------------------------------------------------------
// submitInsurerInterest
// ---------------------------------------------------------------------------
describe("submitInsurerInterest", () => {
  const insurerPayload = {
    company_name: "AutoInsure",
    contact_person: "Bob",
    email: "bob@autoinsure.com",
    phone_number: "555-0200",
    notes: "Interested in partnership",
  };

  it("posts insurer interest and returns response", async () => {
    mockRequest.mockResolvedValueOnce({ submissionId: "sub-2" });
    const result = await submitInsurerInterest(insurerPayload);
    expect(result).toEqual({ submissionId: "sub-2" });
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.insurerInterest,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("sends the payload as JSON body", async () => {
    mockRequest.mockResolvedValueOnce({ submissionId: null });
    await submitInsurerInterest(insurerPayload);
    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.company_name).toBe("AutoInsure");
    expect(body.notes).toBe("Interested in partnership");
  });

  it("propagates errors from the edge function", async () => {
    mockRequest.mockRejectedValueOnce(new Error("Server error"));
    await expect(submitInsurerInterest(insurerPayload)).rejects.toThrow("Server error");
  });
});
