import { STORAGE_KEYS } from "../constants";
import type { Vehicle as FrontendVehicle } from "../types";
import type { Vehicle as SupabaseVehicle } from "../services/supabase/types";

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

export const buildPhotoStorageFromReports = (reportsData: any[]) => {
  const photoStorageData: Record<string, string[]> = {};
  reportsData.forEach((report: any) => {
    if (report?.id && Array.isArray(report.photos) && report.photos.length > 0) {
      photoStorageData[report.id] = report.photos;
    }
  });
  return photoStorageData;
};

export const transformSupabaseReport = (report: any) => ({
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
  damageAreas: [report.damage_location || report.damage_type || "unknown"],
  damageArea: report.damage_location || report.damage_type || "unknown",
  photos: report.photo_urls || [],
  description: report.damage_description || "",
  incident: report.additional_notes || "",
  address: report.address || "",
  city: report.city || "",
  state: report.state || "",
  zip_code: report.zip_code || "",
  status: report.status || "pending",
  createdAt: report.created_at || new Date().toISOString(),
  submittedAt: report.created_at || new Date().toISOString(),
  bidsCount: 0,
});

export const buildSupabaseReportPayload = (report: any) => ({
  ...(isUuidLike(report.id) ? { id: report.id } : {}),
  vehicle_make: report.vehicle?.make || "",
  vehicle_model: report.vehicle?.model || "",
  vehicle_year: parseInt(report.vehicle?.year || "0"),
  damage_type: report.damageArea || "unknown",
  damage_severity: "moderate",
  damage_description: report.description || "",
  damage_location: report.damageArea || "",
  address: report.address || "",
  zip_code: report.zipCode || report.zip_code || "",
  photo_urls: report.photos || [],
  insurance_claim: false,
  preferred_contact: "email",
  additional_notes: report.incident || "",
  status: report.status || "pending",
});
