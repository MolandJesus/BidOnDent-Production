import { projectId, publicAnonKey } from "../../../../utils/supabase/info";

export const SUPABASE_PROJECT_ID = projectId;
export const SUPABASE_ANON_KEY = publicAnonKey;
export const SUPABASE_BASE_URL = `https://${projectId}.supabase.co`;
export const SUPABASE_EDGE_FUNCTION_SLUG = "server";
export const SUPABASE_LEGACY_EDGE_NAMESPACE = "make-server-9f243523";

export const SUPABASE_STORAGE_BUCKETS = {
  accountMedia: "bidondent-account-media",
  reportMedia: "bidondent-report-media",
  vehicleMedia: "bidondent-vehicle-media",
} as const;

export const SUPABASE_LEGACY_STORAGE_BUCKETS = {
  damagePhotos: "bidondent-damage-photos",
  landingPageImages: "bidondent-landing-page-images",
  profiles: "bidondent-profiles",
  vehicles: "bidondent-vehicles",
} as const;

export const SUPABASE_ALL_STORAGE_BUCKETS = [
  ...Object.values(SUPABASE_STORAGE_BUCKETS),
  ...Object.values(SUPABASE_LEGACY_STORAGE_BUCKETS),
] as const;

export const SUPABASE_EDGE_ROUTES = {
  admin: {
    checkAdminExists: "/admin/check-admin-exists",
    createTestAccount: "/admin/create-test-account",
    createUser: "/admin/create-user",
    deleteUser: "/admin/delete-user",
    deleteUsers: "/admin/delete-users",
    listUsers: "/admin/list-users",
    profiles: "/admin/profiles",
    manageAdmin: "/admin/manage-admin",
    setupAdmin: "/admin/setup-admin",
  },
  auth: {
    deleteAccount: "/delete-account",
    trackLogin: "/track-login",
  },
  bids: "/bids",
  cleanupOldReports: "/cleanup-old-reports",
  deleteVehicle: "/delete-vehicle",
  directoryInventory: "/directory-inventory",
  health: "/health",
  insurerProfile: "/insurer-profile",
  migrateDatabase: "/migrate-database",
  reports: "/reports",
  shopProfile: "/shop-profile",
  storageStats: "/storage-stats",
  uploadPhoto: "/upload-photo",
  userProfile: "/user-profile",
  vehicles: "/vehicles",
  websitePreferences: "/website-preferences",
  websiteRelationships: "/website-relationships",
} as const;

export type CanonicalSupabaseBucket =
  (typeof SUPABASE_STORAGE_BUCKETS)[keyof typeof SUPABASE_STORAGE_BUCKETS];

export type LegacySupabaseBucket =
  (typeof SUPABASE_LEGACY_STORAGE_BUCKETS)[keyof typeof SUPABASE_LEGACY_STORAGE_BUCKETS];

export type SupportedSupabaseBucket = CanonicalSupabaseBucket | LegacySupabaseBucket;

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

export function buildSupabaseFunctionUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SUPABASE_BASE_URL}/functions/v1/${SUPABASE_EDGE_FUNCTION_SLUG}${normalizedPath}`;
}

export function buildSupabaseEdgeHeaders(options?: {
  headers?: HeadersInit;
  json?: boolean;
}) {
  const headers = new Headers(options?.headers);

  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${SUPABASE_ANON_KEY}`);
  }

  if (options?.json !== false && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

export function buildWebsiteIdentityQuery(params: {
  clerkUserId?: string | null;
  email?: string | null;
  websiteUserKey?: string | null;
}) {
  const query = new URLSearchParams();

  if (params.clerkUserId) {
    query.set("clerkUserId", params.clerkUserId);
  }

  if (params.email) {
    query.set("email", params.email);
  }

  if (params.websiteUserKey) {
    query.set("websiteUserKey", params.websiteUserKey);
  }

  return query;
}

export async function parseSupabaseEdgeResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      (payload as any)?.error ||
        (payload as any)?.message ||
        `Supabase request failed with status ${response.status}`
    );
  }

  return payload as T;
}

export async function requestSupabaseEdge<T>(
  path: string,
  options?: RequestOptions
): Promise<T> {
  const bodyIsFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;
  const response = await fetch(buildSupabaseFunctionUrl(path), {
    ...options,
    headers: buildSupabaseEdgeHeaders({
      headers: options?.headers,
      json: !bodyIsFormData,
    }),
  });

  return parseSupabaseEdgeResponse<T>(response);
}

export function isSupportedSupabaseBucket(bucket: string): bucket is SupportedSupabaseBucket {
  return SUPABASE_ALL_STORAGE_BUCKETS.includes(bucket as SupportedSupabaseBucket);
}
