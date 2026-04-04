import { projectId, publicAnonKey } from "../../../../utils/supabase/info";
import { getClerkTokenForEdgeRequests } from "./authSession";

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

export const SUPABASE_USER_SCOPED_STORAGE_BUCKETS = [
  ...Object.values(SUPABASE_STORAGE_BUCKETS),
  SUPABASE_LEGACY_STORAGE_BUCKETS.damagePhotos,
  SUPABASE_LEGACY_STORAGE_BUCKETS.profiles,
  SUPABASE_LEGACY_STORAGE_BUCKETS.vehicles,
] as const;

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
  estimateRequests: "/estimate-requests",
  claimDecision: "/claim-decision",
  claimSubmission: "/claim-submission",
  cleanupOldReports: "/cleanup-old-reports",
  deletePhoto: "/delete-photo",
  deleteVehicle: "/delete-vehicle",
  directoryInventory: "/directory-inventory",
  health: "/health",
  healthDeep: "/health/deep",
  insurerProfile: "/insurer-profile",
  insurerInterest: "/intake/insurer-interest",
  jobAssignment: "/job-assignment",
  jobAssignmentStatus: "/job-assignment/status",
  migrateDatabase: "/migrate-database",
  navigationSession: "/navigation-session",
  reports: "/reports",
  shopInterest: "/intake/shop-interest",
  shopProfile: "/shop-profile",
  storageList: "/storage/list",
  storageSignedUrl: "/storage/signed-url",
  storageStats: "/storage-stats",
  uploadPhoto: "/upload-photo",
  userProfile: "/user-profile",
  vehicles: "/vehicles",
  websitePreferences: "/website-preferences",
  websiteRelationships: "/website-relationships",
  workflowEvent: "/workflow-event",
  shopServiceAreas: "/shop-service-areas",
  nearbyShops: "/nearby-shops",
  reportsInServiceArea: "/reports-in-service-area",
  notificationPreferences: "/notification-preferences",
} as const;

export type CanonicalSupabaseBucket =
  (typeof SUPABASE_STORAGE_BUCKETS)[keyof typeof SUPABASE_STORAGE_BUCKETS];

export type LegacySupabaseBucket =
  (typeof SUPABASE_LEGACY_STORAGE_BUCKETS)[keyof typeof SUPABASE_LEGACY_STORAGE_BUCKETS];

export type SupportedSupabaseBucket = CanonicalSupabaseBucket | LegacySupabaseBucket;

export type UserScopedSupabaseBucket =
  (typeof SUPABASE_USER_SCOPED_STORAGE_BUCKETS)[number];

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

  if (!headers.has("apikey")) {
    headers.set("apikey", SUPABASE_ANON_KEY);
  }

  if (options?.json !== false && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

export async function buildSupabaseEdgeHeadersAsync(options?: {
  headers?: HeadersInit;
  json?: boolean;
}) {
  const headers = new Headers(options?.headers);

  if (!headers.has("Authorization")) {
    const accessToken = await getClerkTokenForEdgeRequests();
    headers.set("Authorization", `Bearer ${accessToken || SUPABASE_ANON_KEY}`);
  }

  if (!headers.has("apikey")) {
    headers.set("apikey", SUPABASE_ANON_KEY);
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
    return query;
  }

  if (params.websiteUserKey) {
    query.set("websiteUserKey", params.websiteUserKey);
    return query;
  }

  if (params.email) {
    query.set("email", params.email);
  }

  return query;
}

export const EdgeErrorCode = {
  MISSING_FIELD: 'MISSING_FIELD',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type EdgeErrorCode = typeof EdgeErrorCode[keyof typeof EdgeErrorCode];

export class EdgeFunctionError extends Error {
  code: EdgeErrorCode | undefined;
  status: number;

  constructor(message: string, status: number, code?: EdgeErrorCode) {
    super(message);
    this.name = 'EdgeFunctionError';
    this.code = code;
    this.status = status;
  }
}

export async function parseSupabaseEdgeResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorPayload = payload as Record<string, unknown>;
    const message =
      (typeof errorPayload?.error === 'string' ? errorPayload.error : undefined) ||
      (typeof errorPayload?.message === 'string' ? errorPayload.message : undefined) ||
      `Supabase request failed with status ${response.status}`;
    const code = errorPayload?.code as EdgeErrorCode | undefined;
    throw new EdgeFunctionError(message, response.status, code);
  }

  return payload as T;
}

export async function requestSupabaseEdge<T>(
  path: string,
  options?: RequestOptions
): Promise<T> {
  const bodyIsFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;
  const headers = await buildSupabaseEdgeHeadersAsync({
    headers: options?.headers,
    json: !bodyIsFormData,
  });
  const response = await fetch(buildSupabaseFunctionUrl(path), {
    ...options,
    headers,
  });

  return parseSupabaseEdgeResponse<T>(response);
}

export function isSupportedSupabaseBucket(bucket: string): bucket is SupportedSupabaseBucket {
  return SUPABASE_ALL_STORAGE_BUCKETS.includes(bucket as SupportedSupabaseBucket);
}

export function isUserScopedSupabaseBucket(bucket: string): bucket is UserScopedSupabaseBucket {
  return SUPABASE_USER_SCOPED_STORAGE_BUCKETS.includes(bucket as UserScopedSupabaseBucket);
}
