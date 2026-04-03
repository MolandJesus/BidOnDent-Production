import { afterEach, describe, expect, it, vi } from "vitest";

// Mock the edgeFunctions module
vi.mock("./edgeFunctions", () => ({
  buildEdgeFunctionUrl: vi.fn((path: string) => `https://edge.test${path}`),
}));

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import { loadAdminIntakeOperations, updateAdminSubmissionStatus } from "./adminIntake";

const mockGetClerkToken = vi.fn<() => Promise<string | null>>();

afterEach(() => {
  mockFetch.mockReset();
  mockGetClerkToken.mockReset();
});

// ---------------------------------------------------------------------------
// loadAdminIntakeOperations
// ---------------------------------------------------------------------------
describe("loadAdminIntakeOperations", () => {
  it("throws when Clerk token is null", async () => {
    mockGetClerkToken.mockResolvedValueOnce(null);
    await expect(loadAdminIntakeOperations(mockGetClerkToken)).rejects.toThrow(
      "Your admin session is not ready"
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("fetches intake operations with auth header", async () => {
    const payload = { shopSubmissions: [], insurerSubmissions: [], activityEvents: [] };
    mockGetClerkToken.mockResolvedValueOnce("tok-abc");
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(payload), { status: 200 })
    );

    const result = await loadAdminIntakeOperations(mockGetClerkToken);
    expect(result).toEqual(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://edge.test/admin/intake-operations",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok-abc" }),
      })
    );
  });

  it("throws on non-ok response with error from body", async () => {
    mockGetClerkToken.mockResolvedValueOnce("tok");
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 })
    );
    await expect(loadAdminIntakeOperations(mockGetClerkToken)).rejects.toThrow("Forbidden");
  });

  it("throws generic message when body has no error key", async () => {
    mockGetClerkToken.mockResolvedValueOnce("tok");
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({}), { status: 500 })
    );
    await expect(loadAdminIntakeOperations(mockGetClerkToken)).rejects.toThrow(
      "Failed to load intake operations data"
    );
  });
});

// ---------------------------------------------------------------------------
// updateAdminSubmissionStatus
// ---------------------------------------------------------------------------
describe("updateAdminSubmissionStatus", () => {
  const params = {
    table: "shop_interest_submissions" as const,
    id: "sub-1",
    status: "approved" as const,
  };

  it("throws when Clerk token is null", async () => {
    mockGetClerkToken.mockResolvedValueOnce(null);
    await expect(
      updateAdminSubmissionStatus(mockGetClerkToken, params)
    ).rejects.toThrow("Your admin session is not ready");
  });

  it("posts status update and succeeds", async () => {
    mockGetClerkToken.mockResolvedValueOnce("tok-abc");
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 })
    );

    await updateAdminSubmissionStatus(mockGetClerkToken, params);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://edge.test/admin/intake-operations/status",
      expect.objectContaining({ method: "POST" })
    );
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.table).toBe("shop_interest_submissions");
    expect(body.status).toBe("approved");
  });

  it("throws on non-ok response", async () => {
    mockGetClerkToken.mockResolvedValueOnce("tok");
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "Not authorized" }), { status: 401 })
    );
    await expect(
      updateAdminSubmissionStatus(mockGetClerkToken, params)
    ).rejects.toThrow("Not authorized");
  });

  it("throws when success is false even on 200", async () => {
    mockGetClerkToken.mockResolvedValueOnce("tok");
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, details: "Row not found" }), { status: 200 })
    );
    await expect(
      updateAdminSubmissionStatus(mockGetClerkToken, params)
    ).rejects.toThrow("Row not found");
  });
});
