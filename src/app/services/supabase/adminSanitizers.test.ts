import { describe, expect, it } from "vitest";

import {
  sanitizeAdminAccountExistsResponse,
  sanitizeAdminProfileSummary,
  sanitizeAdminUserRecord,
  sanitizeDeepEdgeHealthResponse,
  sanitizeDeleteAdminUsersResponse,
  sanitizeEdgeHealthResponse,
} from "./adminSanitizers";

describe("adminSanitizers", () => {
  it("sanitizes admin user records and drops invalid metadata", () => {
    expect(
      sanitizeAdminUserRecord({
        id: "user-1",
        email: "person@example.com",
        created_at: "2026-04-03T00:00:00.000Z",
        confirmed_at: null,
        email_confirmed_at: "2026-04-03T00:01:00.000Z",
        last_sign_in_at: "2026-04-03T00:02:00.000Z",
        user_metadata: {
          name: "Person",
          user_type: "shop",
          ignored: 123,
        },
      }),
    ).toEqual({
      id: "user-1",
      email: "person@example.com",
      created_at: "2026-04-03T00:00:00.000Z",
      confirmed_at: null,
      email_confirmed_at: "2026-04-03T00:01:00.000Z",
      last_sign_in_at: "2026-04-03T00:02:00.000Z",
      user_metadata: {
        name: "Person",
        user_type: "shop",
      },
    });

    expect(sanitizeAdminUserRecord({ id: "user-2", user_metadata: { ignored: true } })).toEqual({
      id: "user-2",
    });

    expect(sanitizeAdminUserRecord({ email: "missing-id@example.com" })).toBeNull();
  });

  it("sanitizes admin profile summaries and rejects malformed payloads", () => {
    expect(
      sanitizeAdminProfileSummary({
        account_type: "customer",
        created_at: "2026-04-03T00:00:00.000Z",
        email: "person@example.com",
        clerk_user_id: "clerk_123",
        is_admin: true,
        name: "Person",
        setup_completed: false,
        user_id: "user-1",
        website_user_key: "site-1",
      }),
    ).toEqual({
      account_type: "customer",
      created_at: "2026-04-03T00:00:00.000Z",
      email: "person@example.com",
      clerk_user_id: "clerk_123",
      is_admin: true,
      name: "Person",
      setup_completed: false,
      user_id: "user-1",
      website_user_key: "site-1",
    });

    expect(
      sanitizeAdminProfileSummary({
        account_type: "shop",
        created_at: "2026-04-03T00:00:00.000Z",
        email: "shop@example.com",
        setup_completed: "yes",
      }),
    ).toEqual({
      account_type: "shop",
      created_at: "2026-04-03T00:00:00.000Z",
      email: "shop@example.com",
    });

    expect(sanitizeAdminProfileSummary({ account_type: "shop" })).toBeNull();
  });

  it("sanitizes edge health payloads with stable fallbacks", () => {
    expect(sanitizeEdgeHealthResponse("bad-payload")).toEqual({ status: "unknown" });
    expect(
      sanitizeEdgeHealthResponse({
        status: "ok",
        message: "healthy",
        timestamp: "2026-04-03T00:00:00.000Z",
        version: "1.2.3",
      }),
    ).toEqual({
      status: "ok",
      message: "healthy",
      timestamp: "2026-04-03T00:00:00.000Z",
      version: "1.2.3",
    });

    expect(
      sanitizeDeepEdgeHealthResponse({
        status: "degraded",
        checks: {
          database: "ok",
          storage: "slow",
        },
        timestamp: "2026-04-03T00:00:00.000Z",
        version: "2.0.0",
      }),
    ).toEqual({
      status: "degraded",
      checks: {
        database: "ok",
        storage: "slow",
      },
      timestamp: "2026-04-03T00:00:00.000Z",
      version: "2.0.0",
    });

    expect(
      sanitizeDeepEdgeHealthResponse({
        status: "ok",
        checks: {
          database: "ok",
          storage: 500,
        },
      }),
    ).toEqual({
      status: "ok",
    });
  });

  it("sanitizes admin account existence and bulk-delete responses", () => {
    expect(
      sanitizeAdminAccountExistsResponse({
        exists: true,
        email: "bidondent@gmail.com",
        totalUsers: 14,
      }),
    ).toEqual({
      exists: true,
      email: "bidondent@gmail.com",
      totalUsers: 14,
    });

    expect(sanitizeAdminAccountExistsResponse({ exists: "yes" })).toEqual({ exists: false });

    expect(
      sanitizeDeleteAdminUsersResponse({
        deleted: 2,
        requested: 3,
        error: "partial failure",
        errors: [
          { error: "forbidden", userId: "user-2" },
          { error: "missing userId" },
          "bad-entry",
        ],
      }),
    ).toEqual({
      deleted: 2,
      requested: 3,
      error: "partial failure",
      errors: [{ error: "forbidden", userId: "user-2" }],
    });

    expect(sanitizeDeleteAdminUsersResponse(null)).toEqual({
      deleted: 0,
      requested: 0,
    });
  });
});
