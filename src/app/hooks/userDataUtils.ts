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
import {
  reportFromDb,
  reportToDb,
  buildReportPayload,
  bidFromDb,
  vehicleFromDb,
  vehicleToDb,
} from "../services/supabase/adapters";

/** Convert a Supabase Vehicle to a frontend Vehicle — delegates to canonical adapter. */
export const toFrontendVehicle = vehicleFromDb;

/** Convert a frontend Vehicle to a Supabase Vehicle for saving — delegates to canonical adapter. */
export const toSupabaseVehicle = vehicleToDb;

/** Convert a Supabase Bid to a frontend Bid — delegates to canonical adapter. */
export const toFrontendBid = bidFromDb;

export const isUuidLike = (value?: string | null) =>
  Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );

export const normalizeEmail = (email?: string) => (email ? email.toLowerCase() : "");

export function readLocalStorageItemSafely(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Error reading localStorage item "${key}":`, error);
    return null;
  }
}

export function writeLocalStorageItemSafely(key: string, value: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Error saving localStorage item "${key}":`, error);
    return false;
  }
}

export function removeLocalStorageItemSafely(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error(`Error clearing localStorage item "${key}":`, error);
    return false;
  }
}

export const getUserCacheKey = (email?: string, explicitWebsiteUserKey?: string) => {
  if (explicitWebsiteUserKey) {
    return `${STORAGE_KEYS.USER_DATA}:${explicitWebsiteUserKey}`;
  }
  const normalized = normalizeEmail(email);
  return normalized ? `${STORAGE_KEYS.USER_DATA}:${normalized}` : STORAGE_KEYS.USER_DATA;
};

export const getLastActiveCacheKey = () => {
  const lastActiveIdentifier = readLocalStorageItemSafely(STORAGE_KEYS.USER_DATA_LAST_ACTIVE);
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

/** Convert a Supabase report to a frontend report — delegates to canonical adapter. */
export const transformSupabaseReport = reportFromDb;

/** Convert a frontend DamageReport to Supabase shape for map rendering components — delegates to canonical adapter. */
export const toMapReportShape = reportToDb;

/** Build a DB-shaped report payload from mixed-shape input — delegates to canonical adapter. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts both frontend and Supabase report shapes
export const buildSupabaseReportPayload = buildReportPayload;
