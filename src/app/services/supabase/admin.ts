import {
  requestSupabaseEdge,
  SUPABASE_EDGE_ROUTES,
} from "./runtime";
import {
  type AdminProfileSummary,
  type AdminUserRecord,
  sanitizeAdminUserRecord,
  sanitizeAdminProfileSummary,
  sanitizeEdgeHealthResponse,
  sanitizeDeepEdgeHealthResponse,
  sanitizeAdminAccountExistsResponse,
  sanitizeDeleteAdminUsersResponse,
} from "./adminSanitizers";

export type { AdminProfileSummary, AdminUserRecord };

type AdminMutationOptions = {
  adminEmail?: string;
};

export async function getEdgeFunctionHealth() {
  const payload = await requestSupabaseEdge<{
    message?: string;
    status: string;
    timestamp?: string;
    version?: string;
  }>(SUPABASE_EDGE_ROUTES.health, {
    method: "GET",
  });

  return sanitizeEdgeHealthResponse(payload);
}

export async function getDeepEdgeFunctionHealth() {
  const payload = await requestSupabaseEdge<{
    checks?: Record<string, string>;
    status: string;
    timestamp?: string;
    version?: string;
  }>(SUPABASE_EDGE_ROUTES.healthDeep, {
    method: "GET",
  });

  return sanitizeDeepEdgeHealthResponse(payload);
}

export async function checkAdminAccountExists() {
  const payload = await requestSupabaseEdge<{
    email?: string;
    exists: boolean;
    totalUsers?: number;
  }>(SUPABASE_EDGE_ROUTES.admin.checkAdminExists, {
    method: "GET",
  });

  return sanitizeAdminAccountExistsResponse(payload);
}

export async function setupAdminAccount(email: string, password: string) {
  return requestSupabaseEdge<{
    error?: string;
    message?: string;
    success: boolean;
    userId?: string;
  }>(SUPABASE_EDGE_ROUTES.admin.setupAdmin, {
    body: JSON.stringify({
      email,
      password,
    }),
    method: "POST",
  });
}

export async function listAdminUsers() {
  const payload = await requestSupabaseEdge<{ users?: AdminUserRecord[] }>(
    SUPABASE_EDGE_ROUTES.admin.listUsers,
    {
      method: "GET",
    }
  );

  return Array.isArray(payload.users)
    ? payload.users
        .map((user) => sanitizeAdminUserRecord(user))
        .filter((user): user is AdminUserRecord => Boolean(user))
    : [];
}

export async function listAdminProfiles(email?: string) {
  const searchParams = new URLSearchParams();
  if (email) {
    searchParams.set("email", email.toLowerCase());
  }

  const payload = await requestSupabaseEdge<{ profiles?: AdminProfileSummary[] }>(
    `${SUPABASE_EDGE_ROUTES.admin.profiles}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`,
    {
      method: "GET",
    }
  );

  return Array.isArray(payload.profiles)
    ? payload.profiles
        .map((profile) => sanitizeAdminProfileSummary(profile))
        .filter((profile): profile is AdminProfileSummary => Boolean(profile))
    : [];
}

export async function createAdminUser(
  params: {
    account_type: "customer" | "shop" | "insurer" | string;
    email: string;
    name?: string;
    password: string;
  },
  options?: AdminMutationOptions
) {
  return requestSupabaseEdge<{
    accountType?: string;
    created?: boolean;
    email?: string;
    error?: string;
    message?: string;
    success?: boolean;
    userId?: string;
  }>(SUPABASE_EDGE_ROUTES.admin.createUser, {
    body: JSON.stringify({
      ...params,
      adminEmail: options?.adminEmail,
    }),
    method: "POST",
  });
}

export async function deleteAdminUser(
  email: string,
  options?: AdminMutationOptions
) {
  return requestSupabaseEdge<{
    email?: string;
    error?: string;
    message?: string;
    success: boolean;
    userId?: string;
  }>(SUPABASE_EDGE_ROUTES.admin.deleteUser, {
    body: JSON.stringify({
      adminEmail: options?.adminEmail,
      email,
    }),
    method: "POST",
  });
}

export async function deleteAdminUsers(userIds: string[]) {
  const payload = await requestSupabaseEdge<{
    deleted: number;
    error?: string;
    errors?: Array<{ error: string; userId: string }>;
    requested: number;
  }>(SUPABASE_EDGE_ROUTES.admin.deleteUsers, {
    body: JSON.stringify({
      userIds,
    }),
    method: "POST",
  });

  return sanitizeDeleteAdminUsersResponse(payload);
}

export async function createTestAdminAccount(params: {
  email: string;
  password: string;
  userType: "customer" | "shop" | "insurer";
}) {
  return requestSupabaseEdge<{
    created?: boolean;
    email?: string;
    error?: string;
    success?: boolean;
    userId?: string;
    userType?: string;
  }>(SUPABASE_EDGE_ROUTES.admin.createTestAccount, {
    body: JSON.stringify(params),
    method: "POST",
  });
}

export async function manageAdminAccount(
  params: {
    email: string;
    promote: boolean;
  },
  options?: AdminMutationOptions
) {
  return requestSupabaseEdge<{
    error?: string;
    message?: string;
    profile?: AdminProfileSummary;
    success: boolean;
  }>(SUPABASE_EDGE_ROUTES.admin.manageAdmin, {
    body: JSON.stringify({
      ...params,
      adminEmail: options?.adminEmail,
    }),
    method: "POST",
  });
}
