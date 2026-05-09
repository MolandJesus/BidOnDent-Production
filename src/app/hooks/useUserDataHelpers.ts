import { STORAGE_KEYS } from "../constants";
import type { UserData } from "../types";
import { isCachedUserData, sanitizeCachedUserData } from "./userDataValidation";

/**
 * Pass 25 (audit AI) — pruned 6 dead exports from this helper file per
 * dormant-exports sweep: `getLastActiveEmail`, `loadCachedUserData`,
 * `saveUserDataCache`, `buildUserDataCachePayload`, `isCloudImageUrl`,
 * `createSupabaseReportPayload`. Each had zero source-tree consumers
 * (independently verified vs co-worker AI's earlier finding).
 *
 * Surviving exports (consumer counts in parentheses):
 *  - `normalizeEmail` (11)
 *  - `getUserCacheKey` (12)
 *  - `parseCachedUserData` (4)
 *  - `buildPhotoStorageFromReports` (8)
 *
 * Dead-helper imports also dropped: `buildUserCacheKey` aliased import
 * (used by `loadCachedUserData`/`saveUserDataCache`), `readLocalStorageItemSafely`/
 * `writeLocalStorageItemSafely` (used by the same dead pair). `STORAGE_KEYS`
 * stays for `getUserCacheKey` consumer.
 */

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

export function parseCachedUserData(raw: string): UserData | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isCachedUserData(parsed) ? sanitizeCachedUserData(parsed) : null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error loading cached data:", error);
    return null;
  }
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
