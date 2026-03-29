import { STORAGE_KEYS } from "../constants";
import type {
  DamageReport as FrontendReport,
  Vehicle as FrontendVehicle,
  Bid as FrontendBid,
} from "../types";
import type {
  DamageReport as SupabaseReport,
  Vehicle as SupabaseVehicle,
  Bid as SupabaseBid,
} from "../services/supabase/types";

/** Convert a Supabase Vehicle to a frontend Vehicle. */
export function toFrontendVehicle(v: SupabaseVehicle): FrontendVehicle {
  return {
    id: v.id || "",
    year: String(v.year),
    make: v.make,
    model: v.model,
    vin: v.vin,
    licensePlate: v.license_plate,
    color: v.color,
  };
}

/** Convert a frontend Vehicle to a Supabase Vehicle for saving. */
export function toSupabaseVehicle(v: FrontendVehicle): SupabaseVehicle {
  return {
    id: v.id || undefined,
    make: v.make,
    model: v.model,
    year: parseInt(v.year, 10) || 0,
    vin: v.vin,
    license_plate: v.licensePlate,
    color: v.color,
  };
}

/** Convert a Supabase Bid to a frontend Bid. */
export function toFrontendBid(b: SupabaseBid): FrontendBid {
  return {
    id: b.id || "",
    shopId: b.shop_id || b.shop_user_id || b.clerk_shop_user_id || "",
    shopName: b.shop_name || "",
    shopEmail: b.shop_email || "",
    reportId: b.damage_report_id || b.report_id || "",
    amount: b.amount,
    estimatedDays: b.estimated_days,
    description: b.description || "",
    status: b.status,
    createdAt: b.created_at || new Date().toISOString(),
    shopRating: b.shop_rating ?? undefined,
    shopReviews: b.shop_reviews ?? undefined,
    shopDistance: b.shop_distance ?? undefined,
  };
}

export const isUuidLike = (value?: string | null) =>
  Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );

export const normalizeEmail = (email?: string) => (email ? email.toLowerCase() : "");

export const getUserCacheKey = (email?: string, explicitWebsiteUserKey?: string) => {
  if (explicitWebsiteUserKey) {
    return `${STORAGE_KEYS.USER_DATA}:${explicitWebsiteUserKey}`;
  }
  const normalized = normalizeEmail(email);
  return normalized ? `${STORAGE_KEYS.USER_DATA}:${normalized}` : STORAGE_KEYS.USER_DATA;
};

export const getLastActiveCacheKey = () => {
  const lastActiveIdentifier = localStorage.getItem(STORAGE_KEYS.USER_DATA_LAST_ACTIVE);
  if (!lastActiveIdentifier) {
    return STORAGE_KEYS.USER_DATA;
  }
  if (lastActiveIdentifier.startsWith("website-user-")) {
    return `${STORAGE_KEYS.USER_DATA}:${lastActiveIdentifier}`;
  }
  return getUserCacheKey(lastActiveIdentifier);
};

export const buildPhotoStorageFromReports = (reportsData: FrontendReport[]) => {
  const photoStorageData: Record<string, string[]> = {};
  reportsData.forEach((report) => {
    if (report?.id && Array.isArray(report.photos) && report.photos.length > 0) {
      photoStorageData[report.id] = report.photos;
    }
  });
  return photoStorageData;
};

function normalizeReportStatus(value?: string): FrontendReport["status"] {
  switch (value) {
    case "active":
    case "completed":
    case "in-review":
    case "resolved":
      return value;
    default:
      return "pending";
  }
}

export const transformSupabaseReport = (report: SupabaseReport): FrontendReport => {
  const damageArea = report.damage_location || report.damage_type || "unknown";
  const createdAt = report.created_at || new Date().toISOString();
  const zipCode = report.zip_code || "";

  return {
    id: report.id || "",
    vehicleId: report.vehicle_id || "",
    vehicleInfo: {
      year: report.vehicle_year?.toString() || "",
      make: report.vehicle_make || "",
      model: report.vehicle_model || "",
    },
    vehicle: {
      make: report.vehicle_make || "",
      model: report.vehicle_model || "",
      year: report.vehicle_year?.toString() || "",
      vin: "",
    },
    damageAreas: [damageArea],
    damageArea,
    photos: report.photo_urls || [],
    description: report.damage_description || "",
    damageDescription: report.damage_description || "",
    incident: report.additional_notes || "",
    address: report.address || "",
    city: report.city || "",
    state: report.state || "",
    zipCode,
    zip_code: zipCode,
    damageType: report.damage_type || "",
    status: normalizeReportStatus(report.status),
    createdAt,
    submittedAt: createdAt,
    bidsCount: 0,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts both frontend and Supabase report shapes
export const buildSupabaseReportPayload = (report: Record<string, any>) => ({
  ...(isUuidLike(report.id) ? { id: report.id } : {}),
  vehicle_make: report.vehicle?.make || report.vehicle_make || "",
  vehicle_model: report.vehicle?.model || report.vehicle_model || "",
  vehicle_year: parseInt(report.vehicle?.year || report.vehicle_year || "0", 10),
  vehicle_id: report.vehicleId || report.vehicle_id || undefined,
  damage_type: report.damageArea || report.damage_type || "unknown",
  damage_severity: report.damage_severity || "moderate",
  damage_description: report.description || report.damage_description || "",
  damage_location: report.damageArea || report.damage_location || "",
  address: report.address || "",
  city: report.city || "",
  state: report.state || "",
  zip_code: report.zipCode || report.zip_code || "",
  photo_urls: report.photos || report.photo_urls || [],
  insurance_claim: report.insurance_claim ?? false,
  preferred_contact: report.preferred_contact || "email",
  additional_notes: report.incident || report.additional_notes || "",
  status: report.status || "pending",
});
