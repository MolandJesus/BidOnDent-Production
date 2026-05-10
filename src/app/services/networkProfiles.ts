import type { WebsiteIdentity } from "./auth/websiteIdentity";
import type {
  DirectoryInventory,
  InsurerBusinessProfile,
  ShopBusinessProfile,
} from "../types/networkProfiles";
import {
  buildSupabaseEdgeHeadersAsync,
  buildSupabaseFunctionUrl,
  SUPABASE_EDGE_ROUTES,
} from "./supabase/runtime";
// Pass 14 Step 2 (audit AI) — KI-165 root-cause class closure for
// networkProfiles.ts: every `fetch()` here uses the canonical timeout
// wrapper. 8s ceiling for GETs, 12s for POSTs.
//
// Pass 16 (audit AI) — retrofitted to import the shared `fetchWithTimeout`
// extracted to `services/navigation/requestTimeout.ts` by co-worker AI's
// Pass 15 helper extraction (3+ raw-fetch consumers reached threshold).
// Local helper removed; behavior unchanged.
import { fetchWithTimeout } from "./navigation/requestTimeout";

const SHOP_PROFILE_ENDPOINT = buildSupabaseFunctionUrl(SUPABASE_EDGE_ROUTES.shopProfile);
const INSURER_PROFILE_ENDPOINT = buildSupabaseFunctionUrl(SUPABASE_EDGE_ROUTES.insurerProfile);
const DIRECTORY_INVENTORY_ENDPOINT = buildSupabaseFunctionUrl(
  SUPABASE_EDGE_ROUTES.directoryInventory
);
const DIRECTORY_UPDATED_EVENT = "bidondent:directory-inventory-updated";

let directoryInventoryCache: DirectoryInventory | null = null;
let directoryInventoryPromise: Promise<DirectoryInventory> | null = null;

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry) => typeof entry === "string") : [];
}

function toStringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toDirectoryExperience(value: unknown): "standard" | "strong" | "excellent" {
  return value === "strong" || value === "excellent" ? value : "standard";
}

function toShopBusinessProfile(record: Record<string, unknown>): ShopBusinessProfile {
  return {
    aboutSummary: toNullableString(record?.about_summary),
    acceptsInsuranceClaims: !!record?.accepts_insurance_claims,
    averageRating: toNullableNumber(record?.average_rating),
    averageTicketValue: toNullableNumber(record?.average_ticket_value),
    businessAddress: toStringValue(record?.business_address),
    businessCity: toStringValue(record?.business_city),
    businessHours: toNullableString(record?.business_hours),
    businessName: toStringValue(record?.business_name),
    businessPhone: toStringValue(record?.business_phone),
    businessState: toStringValue(record?.business_state),
    businessZip: toStringValue(record?.business_zip),
    certifications: toStringArray(record?.certifications),
    clerkUserId: toNullableString(record?.clerk_user_id),
    completionRate: toNullableNumber(record?.completion_rate),
    createdAt: toOptionalString(record?.created_at),
    geoLatitude: toNullableNumber(record?.geo_latitude),
    geoLongitude: toNullableNumber(record?.geo_longitude),
    id: toOptionalString(record?.id),
    insurerPrograms: toStringArray(record?.insurer_programs),
    isAcceptingBids: record?.is_accepting_bids !== false,
    isDirectoryVisible: record?.is_directory_visible !== false,
    offersEstimates: !!record?.offers_estimates,
    profileImageUrl: toNullableString(record?.profile_image_url),
    responseTimeHours: toNullableNumber(record?.response_time_hours),
    specialties: toStringArray(record?.specialties),
    supportedMakes: toStringArray(record?.supported_makes),
    totalReviews: toNullableNumber(record?.total_reviews),
    updatedAt: toOptionalString(record?.updated_at),
    website: toNullableString(record?.website),
    websiteUserKey: toStringValue(record?.website_user_key),
  };
}

function toInsurerBusinessProfile(record: Record<string, unknown>): InsurerBusinessProfile {
  return {
    accountConnectionNotes: toStringArray(record?.account_connection_notes),
    autoApproval: !!record?.auto_approval,
    benefits: toStringArray(record?.benefits),
    claimTypes: toStringArray(record?.claim_types),
    clerkUserId: toNullableString(record?.clerk_user_id),
    companyAddress: toStringValue(record?.company_address),
    companyCity: toStringValue(record?.company_city),
    companyName: toStringValue(record?.company_name),
    companyPhone: toStringValue(record?.company_phone),
    companyState: toStringValue(record?.company_state),
    companyZip: toStringValue(record?.company_zip),
    createdAt: toOptionalString(record?.created_at),
    description: toNullableString(record?.description),
    digitalClaimsExperience: toDirectoryExperience(record?.digital_claims_experience),
    id: toOptionalString(record?.id),
    isDirectoryVisible: record?.is_directory_visible !== false,
    licenseNumber: toNullableString(record?.license_number),
    licenseState: toNullableString(record?.license_state),
    maxClaimAmount: toNullableNumber(record?.max_claim_amount),
    popular: !!record?.popular,
    preferredShops: !!record?.preferred_shops,
    profileImageUrl: toNullableString(record?.profile_image_url),
    repairProgramFocus: toStringArray(record?.repair_program_focus),
    updatedAt: toOptionalString(record?.updated_at),
    website: toNullableString(record?.website),
    websiteUserKey: toStringValue(record?.website_user_key),
  };
}

async function getRequestHeaders() {
  return await buildSupabaseEdgeHeadersAsync();
}

function buildIdentityQuery(identity: WebsiteIdentity) {
  const params = new URLSearchParams({
    websiteUserKey: identity.websiteUserKey,
  });

  if (identity.provider === "clerk" && identity.providerUserId) {
    params.set("clerkUserId", identity.providerUserId);
  }

  return params.toString();
}

function dispatchDirectoryInventoryUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(DIRECTORY_UPDATED_EVENT));
}

export function invalidateDirectoryInventoryCache() {
  directoryInventoryCache = null;
  directoryInventoryPromise = null;
}

export function getDirectoryInventoryUpdatedEventName() {
  return DIRECTORY_UPDATED_EVENT;
}

export async function fetchShopBusinessProfile(identity: WebsiteIdentity) {
  const response = await fetchWithTimeout(
    `${SHOP_PROFILE_ENDPOINT}?${buildIdentityQuery(identity)}`,
    {
      method: "GET",
      headers: await getRequestHeaders(),
    },
    8000,
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Failed to fetch shop profile");
  }

  return payload?.profile ? toShopBusinessProfile(payload.profile) : null;
}

export async function saveShopBusinessProfile(
  identity: WebsiteIdentity,
  profile: Omit<ShopBusinessProfile, "websiteUserKey" | "clerkUserId">
) {
  const response = await fetchWithTimeout(
    SHOP_PROFILE_ENDPOINT,
    {
      method: "POST",
      headers: await getRequestHeaders(),
      body: JSON.stringify({
        identity,
        profile,
      }),
    },
    12000,
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Failed to save shop profile");
  }

  invalidateDirectoryInventoryCache();
  dispatchDirectoryInventoryUpdated();
  return toShopBusinessProfile(payload.profile);
}

export async function fetchInsurerBusinessProfile(identity: WebsiteIdentity) {
  const response = await fetchWithTimeout(
    `${INSURER_PROFILE_ENDPOINT}?${buildIdentityQuery(identity)}`,
    {
      method: "GET",
      headers: await getRequestHeaders(),
    },
    8000,
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Failed to fetch insurer profile");
  }

  return payload?.profile ? toInsurerBusinessProfile(payload.profile) : null;
}

export async function saveInsurerBusinessProfile(
  identity: WebsiteIdentity,
  profile: Omit<InsurerBusinessProfile, "websiteUserKey" | "clerkUserId">
) {
  const response = await fetchWithTimeout(
    INSURER_PROFILE_ENDPOINT,
    {
      method: "POST",
      headers: await getRequestHeaders(),
      body: JSON.stringify({
        identity,
        profile,
      }),
    },
    12000,
  );

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Failed to save insurer profile");
  }

  invalidateDirectoryInventoryCache();
  dispatchDirectoryInventoryUpdated();
  return toInsurerBusinessProfile(payload.profile);
}

export async function fetchDirectoryInventory(forceRefresh = false) {
  if (!forceRefresh && directoryInventoryCache) {
    return directoryInventoryCache;
  }

  if (!forceRefresh && directoryInventoryPromise) {
    return directoryInventoryPromise;
  }

  directoryInventoryPromise = fetchWithTimeout(
    DIRECTORY_INVENTORY_ENDPOINT,
    {
      method: "GET",
      headers: await getRequestHeaders(),
    },
    8000,
  )
    .then(async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch directory inventory");
      }

      const inventory: DirectoryInventory = {
        shops: Array.isArray(payload?.shops) ? payload.shops.map(toShopBusinessProfile) : [],
        insurers: Array.isArray(payload?.insurers)
          ? payload.insurers.map(toInsurerBusinessProfile)
          : [],
      };

      directoryInventoryCache = inventory;
      return inventory;
    })
    .finally(() => {
      directoryInventoryPromise = null;
    });

  return directoryInventoryPromise;
}
