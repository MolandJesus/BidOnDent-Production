import { afterEach, describe, expect, it, vi } from "vitest";

import { setClerkTokenGetter } from "./authSession";
import {
  EdgeErrorCode,
  EdgeFunctionError,
  SUPABASE_ALL_STORAGE_BUCKETS,
  SUPABASE_ANON_KEY,
  SUPABASE_BASE_URL,
  SUPABASE_EDGE_FUNCTION_SLUG,
  SUPABASE_STORAGE_BUCKETS,
  SUPABASE_USER_SCOPED_STORAGE_BUCKETS,
  buildSupabaseEdgeHeaders,
  buildSupabaseEdgeHeadersAsync,
  buildSupabaseFunctionUrl,
  buildWebsiteIdentityQuery,
  isSupportedSupabaseBucket,
  isUserScopedSupabaseBucket,
  parseSupabaseEdgeResponse,
} from "./runtime";

afterEach(() => {
  setClerkTokenGetter(null);
  vi.useRealTimers();
});

describe("supabase runtime helpers", () => {
  it("builds function URLs with or without a leading slash", () => {
    const expected = `${SUPABASE_BASE_URL}/functions/v1/${SUPABASE_EDGE_FUNCTION_SLUG}/reports`;

    expect(buildSupabaseFunctionUrl("reports")).toBe(expected);
    expect(buildSupabaseFunctionUrl("/reports")).toBe(expected);
  });

  it("builds sync headers with default auth, apikey, and json content type", () => {
    const headers = buildSupabaseEdgeHeaders();

    expect(headers.get("Authorization")).toBe(`Bearer ${SUPABASE_ANON_KEY}`);
    expect(headers.get("apikey")).toBe(SUPABASE_ANON_KEY);
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("preserves explicit headers and skips content type for non-json bodies", () => {
    const headers = buildSupabaseEdgeHeaders({
      headers: {
        Authorization: "Bearer custom-token",
        apikey: "custom-apikey",
      },
      json: false,
    });

    expect(headers.get("Authorization")).toBe("Bearer custom-token");
    expect(headers.get("apikey")).toBe("custom-apikey");
    expect(headers.has("Content-Type")).toBe(false);
  });

  it("builds async headers with the Clerk token when available", async () => {
    setClerkTokenGetter(async () => "clerk-token");

    const headers = await buildSupabaseEdgeHeadersAsync();

    expect(headers.get("Authorization")).toBe("Bearer clerk-token");
    expect(headers.get("apikey")).toBe(SUPABASE_ANON_KEY);
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("waits briefly for the Clerk token getter before falling back to anon auth", async () => {
    vi.useFakeTimers();

    const headersPromise = buildSupabaseEdgeHeadersAsync();

    await vi.advanceTimersByTimeAsync(100);
    setClerkTokenGetter(async () => "delayed-clerk-token");
    await vi.advanceTimersByTimeAsync(50);

    const headers = await headersPromise;

    expect(headers.get("Authorization")).toBe("Bearer delayed-clerk-token");
    expect(headers.get("apikey")).toBe(SUPABASE_ANON_KEY);
  });

  it("falls back to the anon key when the Clerk token getter returns null", async () => {
    setClerkTokenGetter(async () => null);

    const headers = await buildSupabaseEdgeHeadersAsync({ json: false });

    expect(headers.get("Authorization")).toBe(`Bearer ${SUPABASE_ANON_KEY}`);
    expect(headers.get("apikey")).toBe(SUPABASE_ANON_KEY);
    expect(headers.has("Content-Type")).toBe(false);
  });

  it("builds website identity queries with correct precedence", () => {
    expect(
      buildWebsiteIdentityQuery({
        clerkUserId: "clerk_123",
        websiteUserKey: "site_123",
        email: "user@example.com",
      }).toString(),
    ).toBe("clerkUserId=clerk_123");

    expect(
      buildWebsiteIdentityQuery({
        websiteUserKey: "site_123",
        email: "user@example.com",
      }).toString(),
    ).toBe("websiteUserKey=site_123");

    expect(buildWebsiteIdentityQuery({ email: "user@example.com" }).toString()).toBe(
      "email=user%40example.com",
    );

    expect(buildWebsiteIdentityQuery({}).toString()).toBe("");
  });

  it("recognizes supported and user-scoped storage buckets", () => {
    for (const bucket of SUPABASE_ALL_STORAGE_BUCKETS) {
      expect(isSupportedSupabaseBucket(bucket)).toBe(true);
    }

    for (const bucket of SUPABASE_USER_SCOPED_STORAGE_BUCKETS) {
      expect(isUserScopedSupabaseBucket(bucket)).toBe(true);
    }

    expect(isSupportedSupabaseBucket(SUPABASE_STORAGE_BUCKETS.accountMedia)).toBe(true);
    expect(isUserScopedSupabaseBucket("bidondent-landing-page-images")).toBe(false);
    expect(isSupportedSupabaseBucket("not-a-real-bucket")).toBe(false);
  });

  it("parses successful edge responses", async () => {
    const response = new Response(JSON.stringify({ ok: true, value: 3 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    await expect(parseSupabaseEdgeResponse<{ ok: boolean; value: number }>(response)).resolves.toEqual(
      { ok: true, value: 3 },
    );
  });

  it("throws a structured edge error for failed responses", async () => {
    const response = new Response(
      JSON.stringify({
        error: "Shop not found",
        code: EdgeErrorCode.NOT_FOUND,
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );

    await expect(parseSupabaseEdgeResponse(response)).rejects.toEqual(
      expect.objectContaining<EdgeFunctionError>({
        name: "EdgeFunctionError",
        message: "Shop not found",
        status: 404,
        code: EdgeErrorCode.NOT_FOUND,
      }),
    );
  });
});
