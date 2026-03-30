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

type AdminDeleteUsersError = {
  error: string;
  userId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOptionalNullableString(value: unknown) {
  return value === undefined || value === null || typeof value === "string";
}

function isOptionalNullableBoolean(value: unknown) {
  return value === undefined || value === null || typeof value === "boolean";
}

function isOptionalStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((entry) => typeof entry === "string")
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function sanitizeAdminUserMetadata(value: unknown): AdminUserRecord["user_metadata"] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const metadata: NonNullable<AdminUserRecord["user_metadata"]> = {};
  if (typeof value.name === "string") {
    metadata.name = value.name;
  }
  if (typeof value.user_type === "string") {
    metadata.user_type = value.user_type;
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

function sanitizeAdminUserRecord(value: unknown): AdminUserRecord | null {
  if (!isRecord(value) || typeof value.id !== "string") {
    return null;
  }

  return {
    id: value.id,
    ...(isOptionalNullableString(value.email) ? { email: value.email } : {}),
    ...(typeof value.created_at === "string" ? { created_at: value.created_at } : {}),
    ...(isOptionalNullableString(value.confirmed_at) ? { confirmed_at: value.confirmed_at } : {}),
    ...(isOptionalNullableString(value.email_confirmed_at)
      ? { email_confirmed_at: value.email_confirmed_at }
      : {}),
    ...(isOptionalNullableString(value.last_sign_in_at)
      ? { last_sign_in_at: value.last_sign_in_at }
      : {}),
    ...(sanitizeAdminUserMetadata(value.user_metadata)
      ? { user_metadata: sanitizeAdminUserMetadata(value.user_metadata) }
      : {}),
  };
}

function sanitizeAdminProfileSummary(value: unknown): AdminProfileSummary | null {
  if (
    !isRecord(value) ||
    typeof value.account_type !== "string" ||
    typeof value.created_at !== "string" ||
    typeof value.email !== "string"
  ) {
    return null;
  }

  return {
    account_type: value.account_type,
    created_at: value.created_at,
    email: value.email,
    ...(isOptionalNullableString(value.clerk_user_id) ? { clerk_user_id: value.clerk_user_id } : {}),
    ...(isOptionalNullableBoolean(value.is_admin) ? { is_admin: value.is_admin } : {}),
    ...(isOptionalNullableString(value.name) ? { name: value.name } : {}),
    ...(isOptionalNullableBoolean(value.setup_completed)
      ? { setup_completed: value.setup_completed }
      : {}),
    ...(isOptionalNullableString(value.user_id) ? { user_id: value.user_id } : {}),
    ...(isOptionalNullableString(value.website_user_key)
      ? { website_user_key: value.website_user_key }
      : {}),
  };
}

function sanitizeEdgeHealthResponse(value: unknown) {
  if (!isRecord(value)) {
    return { status: "unknown" };
  }

  return {
    status: typeof value.status === "string" ? value.status : "unknown",
    ...(typeof value.message === "string" ? { message: value.message } : {}),
    ...(typeof value.timestamp === "string" ? { timestamp: value.timestamp } : {}),
    ...(typeof value.version === "string" ? { version: value.version } : {}),
  };
}

function sanitizeDeepEdgeHealthResponse(value: unknown) {
  if (!isRecord(value)) {
    return { status: "unknown" };
  }

  return {
    status: typeof value.status === "string" ? value.status : "unknown",
    ...(isOptionalStringRecord(value.checks) ? { checks: value.checks } : {}),
    ...(typeof value.timestamp === "string" ? { timestamp: value.timestamp } : {}),
    ...(typeof value.version === "string" ? { version: value.version } : {}),
  };
}

function sanitizeAdminAccountExistsResponse(value: unknown) {
  if (!isRecord(value)) {
    return { exists: false };
  }

  return {
    exists: value.exists === true,
    ...(typeof value.email === "string" ? { email: value.email } : {}),
    ...(isFiniteNumber(value.totalUsers) ? { totalUsers: value.totalUsers } : {}),
  };
}

function sanitizeAdminDeleteUsersError(value: unknown): AdminDeleteUsersError | null {
  if (!isRecord(value) || typeof value.error !== "string" || typeof value.userId !== "string") {
    return null;
  }

  return {
    error: value.error,
    userId: value.userId,
  };
}

function sanitizeDeleteAdminUsersResponse(value: unknown) {
  if (!isRecord(value)) {
    return {
      deleted: 0,
      requested: 0,
    };
  }

  return {
    deleted: isFiniteNumber(value.deleted) ? value.deleted : 0,
    requested: isFiniteNumber(value.requested) ? value.requested : 0,
    ...(typeof value.error === "string" ? { error: value.error } : {}),
    ...(Array.isArray(value.errors)
      ? {
          errors: value.errors
            .map((entry) => sanitizeAdminDeleteUsersError(entry))
            .filter((entry): entry is AdminDeleteUsersError => Boolean(entry)),
        }
      : {}),
  };
}

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
