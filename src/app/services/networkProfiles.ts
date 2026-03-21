import type { WebsiteIdentity } from "./auth/websiteIdentity";
import type {
  DirectoryInventory,
  InsurerBusinessProfile,
  ShopBusinessProfile,
} from "../types/networkProfiles";
import {
  buildSupabaseEdgeHeaders,
  buildSupabaseFunctionUrl,
  SUPABASE_EDGE_ROUTES,
} from "./supabase/runtime";

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

function toShopBusinessProfile(record: any): ShopBusinessProfile {
  return {
    aboutSummary: record?.about_summary || null,
    acceptsInsuranceClaims: !!record?.accepts_insurance_claims,
    averageRating:
      typeof record?.average_rating === "number"
        ? record.average_rating
        : record?.average_rating
          ? Number(record.average_rating)
          : null,
    averageTicketValue:
      typeof record?.average_ticket_value === "number"
        ? record.average_ticket_value
        : record?.average_ticket_value
          ? Number(record.average_ticket_value)
          : null,
    businessAddress: record?.business_address || "",
    businessCity: record?.business_city || "",
    businessHours: record?.business_hours || null,
    businessName: record?.business_name || "",
    businessPhone: record?.business_phone || "",
    businessState: record?.business_state || "",
    businessZip: record?.business_zip || "",
    certifications: toStringArray(record?.certifications),
    clerkUserId: record?.clerk_user_id || null,
    completionRate:
      typeof record?.completion_rate === "number" ? record.completion_rate : Number(record?.completion_rate || 0) || null,
    createdAt: record?.created_at,
    geoLatitude:
      typeof record?.geo_latitude === "number" ? record.geo_latitude : Number(record?.geo_latitude || 0) || null,
    geoLongitude:
      typeof record?.geo_longitude === "number" ? record.geo_longitude : Number(record?.geo_longitude || 0) || null,
    id: record?.id,
    insurerPrograms: toStringArray(record?.insurer_programs),
    isAcceptingBids: record?.is_accepting_bids !== false,
    isDirectoryVisible: record?.is_directory_visible !== false,
    offersEstimates: !!record?.offers_estimates,
    profileImageUrl: record?.profile_image_url || null,
    responseTimeHours:
      typeof record?.response_time_hours === "number"
        ? record.response_time_hours
        : Number(record?.response_time_hours || 0) || null,
    specialties: toStringArray(record?.specialties),
    supportedMakes: toStringArray(record?.supported_makes),
    totalReviews:
      typeof record?.total_reviews === "number" ? record.total_reviews : Number(record?.total_reviews || 0) || null,
    updatedAt: record?.updated_at,
    website: record?.website || null,
    websiteUserKey: record?.website_user_key || "",
  };
}

function toInsurerBusinessProfile(record: any): InsurerBusinessProfile {
  return {
    accountConnectionNotes: toStringArray(record?.account_connection_notes),
    autoApproval: !!record?.auto_approval,
    benefits: toStringArray(record?.benefits),
    claimTypes: toStringArray(record?.claim_types),
    clerkUserId: record?.clerk_user_id || null,
    companyAddress: record?.company_address || "",
    companyCity: record?.company_city || "",
    companyName: record?.company_name || "",
    companyPhone: record?.company_phone || "",
    companyState: record?.company_state || "",
    companyZip: record?.company_zip || "",
    createdAt: record?.created_at,
    description: record?.description || null,
    digitalClaimsExperience: record?.digital_claims_experience || "standard",
    id: record?.id,
    isDirectoryVisible: record?.is_directory_visible !== false,
    licenseNumber: record?.license_number || null,
    licenseState: record?.license_state || null,
    maxClaimAmount:
      typeof record?.max_claim_amount === "number"
        ? record.max_claim_amount
        : Number(record?.max_claim_amount || 0) || null,
    popular: !!record?.popular,
    preferredShops: !!record?.preferred_shops,
    profileImageUrl: record?.profile_image_url || null,
    repairProgramFocus: toStringArray(record?.repair_program_focus),
    updatedAt: record?.updated_at,
    website: record?.website || null,
    websiteUserKey: record?.website_user_key || "",
  };
}

function getRequestHeaders() {
  return buildSupabaseEdgeHeaders();
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
  const response = await fetch(`${SHOP_PROFILE_ENDPOINT}?${buildIdentityQuery(identity)}`, {
    method: "GET",
    headers: getRequestHeaders(),
  });

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
  const response = await fetch(SHOP_PROFILE_ENDPOINT, {
    method: "POST",
    headers: getRequestHeaders(),
    body: JSON.stringify({
      identity,
      profile,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Failed to save shop profile");
  }

  invalidateDirectoryInventoryCache();
  dispatchDirectoryInventoryUpdated();
  return toShopBusinessProfile(payload.profile);
}

export async function fetchInsurerBusinessProfile(identity: WebsiteIdentity) {
  const response = await fetch(`${INSURER_PROFILE_ENDPOINT}?${buildIdentityQuery(identity)}`, {
    method: "GET",
    headers: getRequestHeaders(),
  });

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
  const response = await fetch(INSURER_PROFILE_ENDPOINT, {
    method: "POST",
    headers: getRequestHeaders(),
    body: JSON.stringify({
      identity,
      profile,
    }),
  });

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

  directoryInventoryPromise = fetch(DIRECTORY_INVENTORY_ENDPOINT, {
    method: "GET",
    headers: getRequestHeaders(),
  })
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
