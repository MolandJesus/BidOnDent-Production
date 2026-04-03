import { afterEach, describe, expect, it, vi } from "vitest";

// Mock the runtime module
vi.mock("./runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./runtime")>();
  return {
    ...actual,
    requestSupabaseEdge: vi.fn(),
  };
});

import {
  getEdgeFunctionHealth,
  getDeepEdgeFunctionHealth,
  checkAdminAccountExists,
  setupAdminAccount,
  listAdminUsers,
  listAdminProfiles,
  createAdminUser,
  deleteAdminUser,
  deleteAdminUsers,
  createTestAdminAccount,
  manageAdminAccount,
} from "./admin";
import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

const mockRequest = vi.mocked(requestSupabaseEdge);

afterEach(() => {
  mockRequest.mockReset();
});

// ---------------------------------------------------------------------------
// getEdgeFunctionHealth
// ---------------------------------------------------------------------------
describe("getEdgeFunctionHealth", () => {
  it("calls health endpoint and returns sanitized response", async () => {
    mockRequest.mockResolvedValueOnce({
      status: "ok",
      message: "Server running",
      timestamp: "2025-01-15T12:00:00Z",
      version: "1.0",
    });
    const result = await getEdgeFunctionHealth();
    expect(result.status).toBe("ok");
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.health,
      expect.objectContaining({ method: "GET" })
    );
  });
});

// ---------------------------------------------------------------------------
// getDeepEdgeFunctionHealth
// ---------------------------------------------------------------------------
describe("getDeepEdgeFunctionHealth", () => {
  it("calls deep health endpoint and returns sanitized response", async () => {
    mockRequest.mockResolvedValueOnce({
      status: "ok",
      checks: { database: "ok", storage: "ok" },
      timestamp: "2025-01-15T12:00:00Z",
    });
    const result = await getDeepEdgeFunctionHealth();
    expect(result.status).toBe("ok");
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.healthDeep,
      expect.objectContaining({ method: "GET" })
    );
  });
});

// ---------------------------------------------------------------------------
// checkAdminAccountExists
// ---------------------------------------------------------------------------
describe("checkAdminAccountExists", () => {
  it("returns sanitized existence check", async () => {
    mockRequest.mockResolvedValueOnce({ exists: true, email: "admin@test.com", totalUsers: 5 });
    const result = await checkAdminAccountExists();
    expect(result.exists).toBe(true);
  });

  it("handles non-existent admin", async () => {
    mockRequest.mockResolvedValueOnce({ exists: false });
    const result = await checkAdminAccountExists();
    expect(result.exists).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// setupAdminAccount
// ---------------------------------------------------------------------------
describe("setupAdminAccount", () => {
  it("posts email and password to setup endpoint", async () => {
    mockRequest.mockResolvedValueOnce({ success: true, userId: "u-1" });
    const result = await setupAdminAccount("admin@test.com", "securePass123");
    expect(result.success).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.admin.setupAdmin,
      expect.objectContaining({ method: "POST" })
    );
    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.email).toBe("admin@test.com");
    expect(body.password).toBe("securePass123");
  });
});

// ---------------------------------------------------------------------------
// listAdminUsers
// ---------------------------------------------------------------------------
describe("listAdminUsers", () => {
  it("returns sanitized user list", async () => {
    mockRequest.mockResolvedValueOnce({
      users: [{ id: "u-1", email: "user@test.com", created_at: "2025-01-01" }],
    });
    const result = await listAdminUsers();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("u-1");
  });

  it("returns empty array when no users key", async () => {
    mockRequest.mockResolvedValueOnce({});
    const result = await listAdminUsers();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// listAdminProfiles
// ---------------------------------------------------------------------------
describe("listAdminProfiles", () => {
  it("fetches all profiles without email filter", async () => {
    mockRequest.mockResolvedValueOnce({
      profiles: [{ email: "a@test.com", account_type: "customer", created_at: "2025-01-01" }],
    });
    const result = await listAdminProfiles();
    expect(result).toHaveLength(1);
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.admin.profiles,
      expect.objectContaining({ method: "GET" })
    );
  });

  it("includes email query param when provided", async () => {
    mockRequest.mockResolvedValueOnce({ profiles: [] });
    await listAdminProfiles("Admin@Test.com");
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("email=admin%40test.com"),
      expect.anything()
    );
  });

  it("returns empty array when no profiles key", async () => {
    mockRequest.mockResolvedValueOnce({});
    const result = await listAdminProfiles();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// createAdminUser
// ---------------------------------------------------------------------------
describe("createAdminUser", () => {
  it("posts user params and returns result", async () => {
    mockRequest.mockResolvedValueOnce({ success: true, userId: "u-2" });
    const result = await createAdminUser({
      email: "new@test.com",
      password: "pass123",
      account_type: "shop",
    });
    expect(result.success).toBe(true);
  });

  it("includes adminEmail when option provided", async () => {
    mockRequest.mockResolvedValueOnce({ success: true });
    await createAdminUser(
      { email: "new@test.com", password: "pass", account_type: "customer" },
      { adminEmail: "admin@test.com" }
    );
    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.adminEmail).toBe("admin@test.com");
  });
});

// ---------------------------------------------------------------------------
// deleteAdminUser
// ---------------------------------------------------------------------------
describe("deleteAdminUser", () => {
  it("posts delete request with email", async () => {
    mockRequest.mockResolvedValueOnce({ success: true, email: "del@test.com" });
    const result = await deleteAdminUser("del@test.com");
    expect(result.success).toBe(true);
    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.email).toBe("del@test.com");
  });

  it("includes adminEmail option", async () => {
    mockRequest.mockResolvedValueOnce({ success: true });
    await deleteAdminUser("del@test.com", { adminEmail: "admin@test.com" });
    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.adminEmail).toBe("admin@test.com");
  });
});

// ---------------------------------------------------------------------------
// deleteAdminUsers
// ---------------------------------------------------------------------------
describe("deleteAdminUsers", () => {
  it("posts batch delete and returns sanitized response", async () => {
    mockRequest.mockResolvedValueOnce({ deleted: 2, requested: 2, errors: [] });
    const result = await deleteAdminUsers(["u-1", "u-2"]);
    expect(result.deleted).toBe(2);
    expect(result.requested).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// createTestAdminAccount
// ---------------------------------------------------------------------------
describe("createTestAdminAccount", () => {
  it("posts test account params", async () => {
    mockRequest.mockResolvedValueOnce({ success: true, email: "test@test.com" });
    const result = await createTestAdminAccount({
      email: "test@test.com",
      password: "testpass",
      userType: "shop",
    });
    expect(result.success).toBe(true);
    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.userType).toBe("shop");
  });
});

// ---------------------------------------------------------------------------
// manageAdminAccount
// ---------------------------------------------------------------------------
describe("manageAdminAccount", () => {
  it("promotes a user to admin", async () => {
    mockRequest.mockResolvedValueOnce({ success: true, message: "Promoted" });
    const result = await manageAdminAccount({ email: "user@test.com", promote: true });
    expect(result.success).toBe(true);
  });

  it("includes adminEmail option", async () => {
    mockRequest.mockResolvedValueOnce({ success: true });
    await manageAdminAccount(
      { email: "user@test.com", promote: false },
      { adminEmail: "admin@test.com" }
    );
    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.adminEmail).toBe("admin@test.com");
    expect(body.promote).toBe(false);
  });
});
