import {
  requestSupabaseEdge,
  SUPABASE_EDGE_ROUTES,
} from "./runtime";

export type AdminProfileSummary = {
  account_type: "customer" | "shop" | "insurer" | string;
  clerk_user_id?: string | null;
  created_at: string;
  email: string;
  is_admin?: boolean | null;
  name?: string | null;
  setup_completed?: boolean | null;
  user_id?: string | null;
  website_user_key?: string | null;
};

export type AdminUserRecord = {
  id: string;
  email?: string | null;
  created_at?: string;
  confirmed_at?: string | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  user_metadata?: {
    name?: string;
    user_type?: string;
  };
};

type AdminMutationOptions = {
  adminEmail?: string;
};

export async function getEdgeFunctionHealth() {
  return requestSupabaseEdge<{
    message?: string;
    status: string;
    timestamp?: string;
    version?: string;
  }>(SUPABASE_EDGE_ROUTES.health, {
    method: "GET",
  });
}

export async function checkAdminAccountExists() {
  return requestSupabaseEdge<{
    email?: string;
    exists: boolean;
    totalUsers?: number;
  }>(SUPABASE_EDGE_ROUTES.admin.checkAdminExists, {
    method: "GET",
  });
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

  return payload.users || [];
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

  return payload.profiles || [];
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
    deleted?: {
      auth?: boolean;
      kv_data?: boolean;
      profile?: boolean;
    };
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
  return requestSupabaseEdge<{
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
