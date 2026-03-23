import { STORAGE_KEYS } from "../constants";

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
  vehicle: {
    make: report.vehicle_make || "",
    model: report.vehicle_model || "",
    year: report.vehicle_year?.toString() || "",
    vin: "",
  },
  damageArea: report.damage_location || report.damage_type || "unknown",
  photos: report.photo_urls || [],
  description: report.damage_description || "",
  incident: report.additional_notes || "",
  status: report.status || "pending",
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
  photo_urls: report.photos || [],
  insurance_claim: false,
  preferred_contact: "email",
  additional_notes: report.incident || "",
  status: report.status || "pending",
});
