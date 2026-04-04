import { STORAGE_KEYS } from "../constants";
import type { UserData } from "../types";
import {
  getUserCacheKey as buildUserCacheKey,
  readLocalStorageItemSafely,
  writeLocalStorageItemSafely,
} from "./userDataUtils";
import { isCachedUserData, sanitizeCachedUserData } from "./userDataValidation";

type CachePayloadArgs = {
  userInfo: UserData["userInfo"];
  vehicles: UserData["vehicles"];
  reports: UserData["reports"];
  bids: UserData["bids"];
  userPhone: string;
  redirectInfo: UserData["redirectInfo"];
  notifications: UserData["notifications"];
  hasSeenPhotoGuide: boolean;
  photoStorage: Record<string, string[]>;
};

type CachedUserDataResult = {
  raw: string;
  data: UserData;
};

type ReportPhotoSource = {
  id?: string;
  photos?: string[];
  photo_urls?: string[];
};

export function normalizeEmail(email?: string): string {
  return email ? email.toLowerCase() : "";
}

export function getUserCacheKey(email?: string): string {
  const normalized = normalizeEmail(email);
  return normalized ? `${STORAGE_KEYS.USER_DATA}:${normalized}` : STORAGE_KEYS.USER_DATA;
}

export function getLastActiveEmail(): string {
  const lastActive = readLocalStorageItemSafely(STORAGE_KEYS.USER_DATA_LAST_ACTIVE);
  return normalizeEmail(lastActive || undefined);
}

export function loadCachedUserData(): CachedUserDataResult | null {
  const lastActiveEmail = getLastActiveEmail();
  const lastActiveCacheKey = lastActiveEmail
    ? buildUserCacheKey(lastActiveEmail)
    : STORAGE_KEYS.USER_DATA;
  const cachedData =
    readLocalStorageItemSafely(lastActiveCacheKey) ||
    readLocalStorageItemSafely(STORAGE_KEYS.USER_DATA);

  if (!cachedData) {
    return null;
  }

  const parsed = parseCachedUserData(cachedData);
  if (!parsed) {
    return null;
  }

  return {
    raw: cachedData,
    data: parsed,
  };
}

export function parseCachedUserData(raw: string): UserData | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isCachedUserData(parsed) ? sanitizeCachedUserData(parsed) : null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error loading cached data:", error);
    return null;
  }
}

export function saveUserDataCache(userData: UserData, email?: string): void {
  writeLocalStorageItemSafely(
    buildUserCacheKey(email || userData.userInfo.email),
    JSON.stringify(userData)
  );
  writeLocalStorageItemSafely(
    STORAGE_KEYS.USER_DATA_LAST_ACTIVE,
    normalizeEmail(email || userData.userInfo.email)
  );
}

export function buildPhotoStorageFromReports(
  reportsData: ReportPhotoSource[]
): Record<string, string[]> {
  const photoStorageData: Record<string, string[]> = {};

  reportsData.forEach((report) => {
    const photos = report.photo_urls || report.photos;
    if (report?.id && Array.isArray(photos) && photos.length > 0) {
      photoStorageData[report.id] = photos;
    }
  });

  return photoStorageData;
}

export function buildUserDataCachePayload(args: CachePayloadArgs): UserData {
  const {
    userInfo,
    vehicles,
    reports,
    bids,
    userPhone,
    redirectInfo,
    notifications,
    hasSeenPhotoGuide,
    photoStorage,
  } = args;

  return {
    userInfo,
    vehicles,
    reports,
    bids,
    userPhone,
    redirectInfo,
    notifications,
    hasSeenPhotoGuide,
    photoStorage,
  };
}

export function isCloudImageUrl(imageUrl?: string): boolean {
  return Boolean(imageUrl && (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts both frontend and Supabase report shapes
export function createSupabaseReportPayload(report: Record<string, any>) {
  const vehicleInfo = report.vehicle || report.vehicleInfo || {};

  return {
    id: report.id,
    vehicle_make: vehicleInfo.make || "",
    vehicle_model: vehicleInfo.model || "",
    vehicle_year: parseInt(vehicleInfo.year || "0", 10),
    damage_type: report.damageArea || "unknown",
    damage_severity: "moderate",
    damage_description: report.description || "",
    damage_location: report.damageArea || "",
    photo_urls: report.photos || [],
    insurance_claim: false,
    preferred_contact: "email",
    additional_notes: report.incident || "",
    status: report.status || "pending",
  };
}
