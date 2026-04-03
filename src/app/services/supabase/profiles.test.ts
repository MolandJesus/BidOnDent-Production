import { afterEach, describe, expect, it, vi } from "vitest";

import type { Profile } from "./types";

vi.mock("./runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./runtime")>();
  return {
    ...actual,
    requestSupabaseEdge: vi.fn(),
  };
});

import { getProfile, markSetupCompleted, saveProfile } from "./profiles";
import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

const mockRequest = vi.mocked(requestSupabaseEdge);

const fakeProfile: Profile = {
  id: "profile-1",
  email: "user@example.com",
  name: "Alice",
  account_type: "customer",
  setup_completed: false,
};

afterEach(() => {
  mockRequest.mockReset();
});

// ---------------------------------------------------------------------------
// getProfile
// ---------------------------------------------------------------------------
describe("getProfile", () => {
  it("fetches profile by email string", async () => {
    mockRequest.mockResolvedValueOnce({ profile: fakeProfile });

    const result = await getProfile("user@example.com");

    expect(result).toEqual(fakeProfile);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining(`${SUPABASE_EDGE_ROUTES.userProfile}?email=user%40example.com`),
      { method: "GET" },
    );
  });

  it("fetches profile by clerkUserId identity", async () => {
    mockRequest.mockResolvedValueOnce({ profile: fakeProfile });

    const result = await getProfile({ clerkUserId: "clerk-1" });

    expect(result).toEqual(fakeProfile);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("clerkUserId=clerk-1"),
      expect.any(Object),
    );
  });

  it("fetches profile by websiteUserKey identity", async () => {
    mockRequest.mockResolvedValueOnce({ profile: fakeProfile });

    const result = await getProfile({ websiteUserKey: "website-user-key-1" });

    expect(result).toEqual(fakeProfile);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("websiteUserKey=website-user-key-1"),
      expect.any(Object),
    );
  });

  it("returns null when identity has no usable fields", async () => {
    const result = await getProfile({ clerkUserId: null, email: null, websiteUserKey: null });

    expect(result).toBeNull();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns null when response has no profile", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await getProfile("user@example.com");

    expect(result).toBeNull();
  });

  it("returns null on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("timeout"));

    const result = await getProfile("user@example.com");

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// saveProfile
// ---------------------------------------------------------------------------
describe("saveProfile", () => {
  it("saves profile with identity and returns true", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await saveProfile(fakeProfile, { clerkUserId: "clerk-1" });

    expect(result).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith(SUPABASE_EDGE_ROUTES.userProfile, {
      method: "POST",
      body: expect.any(String),
    });

    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.identity.clerkUserId).toBe("clerk-1");
    expect(body.profile).toEqual(fakeProfile);
  });

  it("falls back to profile email when identity email is missing", async () => {
    mockRequest.mockResolvedValueOnce({});

    await saveProfile(fakeProfile);

    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.identity.email).toBe("user@example.com");
    expect(body.identity.clerkUserId).toBeNull();
    expect(body.identity.websiteUserKey).toBeNull();
  });

  it("returns false on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("server error"));

    const result = await saveProfile(fakeProfile, { clerkUserId: "clerk-1" });

    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// markSetupCompleted
// ---------------------------------------------------------------------------
describe("markSetupCompleted", () => {
  it("fetches profile, sets setup_completed, and saves", async () => {
    // First call: getProfile
    mockRequest.mockResolvedValueOnce({ profile: fakeProfile });
    // Second call: saveProfile
    mockRequest.mockResolvedValueOnce({});

    const result = await markSetupCompleted("user@example.com", { clerkUserId: "clerk-1" });

    expect(result).toBe(true);
    expect(mockRequest).toHaveBeenCalledTimes(2);

    // Verify the save call includes setup_completed = true
    const saveBody = JSON.parse(mockRequest.mock.calls[1][1]!.body as string);
    expect(saveBody.profile.setup_completed).toBe(true);
  });

  it("returns false when profile is not found", async () => {
    mockRequest.mockResolvedValueOnce({ profile: null });

    const result = await markSetupCompleted("user@example.com");

    expect(result).toBe(false);
    // Should only call getProfile, not saveProfile
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it("returns false when getProfile throws", async () => {
    mockRequest.mockRejectedValueOnce(new Error("fail"));

    const result = await markSetupCompleted("user@example.com");

    expect(result).toBe(false);
  });
});
