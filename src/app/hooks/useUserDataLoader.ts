/**
 * useUserDataLoader.ts — Cloud-first data loading logic extracted from useUserData.
 *
 * Contains:
 * - hydrateFromCloudProfile: Fetches vehicles/reports/bids from Supabase, returns structured data
 * - migrateLocalToCloud: Migrates cached localStorage data to Supabase for new profiles
 */
import type {
  UserInfo,
  Vehicle,
  DamageReport,
  Notification,
  RedirectInfo,
  UserData,
  Bid,
} from "../types";
import {
  getProfile,
  getVehicles,
  getDamageReports,
  saveProfile,
  saveVehicle,
  saveDamageReport,
} from "../services/supabaseService";
import { getMyBids } from "../services/supabase/bids";
import { getNotificationsByUserType } from "../constants";
import {
  transformSupabaseReport,
  buildSupabaseReportPayload,
  toFrontendVehicle,
  toSupabaseVehicle,
  toFrontendBid,
} from "./userDataUtils";

export type HydrationResult = {
  userInfo: UserInfo;
  userPhone: string;
  redirectInfo: RedirectInfo;
  notifications: Notification[];
  vehicles: Vehicle[];
  reports: DamageReport[];
  reportsError: string | null;
  bids: Bid[];
  photoStorage: Record<string, string[]>;
  signatures: {
    profile: string;
    vehicles: string;
    reports: string;
    vehicleMap: Record<string, string>;
    reportMap: Record<string, string>;
  };
  cachePayload: UserData;
};

/**
 * Hydrate user data from a Supabase profile. Fetches vehicles, reports, bids.
 * Returns all data as a structured result — caller handles state setting.
 */
export async function hydrateFromCloudProfile(
  profileData: any,
  clerkUserId: string
): Promise<HydrationResult> {
  const userInfo: UserInfo = {
    name: profileData.name,
    email: profileData.email,
    profileImage: profileData.profile_image_url || "",
  };
  const userPhone = profileData.phone || "";
  const redirectInfo: RedirectInfo = {
    type: profileData.account_type,
    email: profileData.email,
  };
  const notifications = getNotificationsByUserType(profileData.account_type);

  // Fetch vehicles
  const vehiclesData = await getVehicles(clerkUserId);
  const vehicles = vehiclesData.map(toFrontendVehicle);
  if (import.meta.env.DEV) {
    console.log(`Loaded ${vehiclesData.length} vehicles from Supabase`);
  }

  // Fetch reports
  let reports: DamageReport[] = [];
  let reportsError: string | null = null;
  const photoStorage: Record<string, string[]> = {};
  const reportsData = await getDamageReports(clerkUserId);

  if (Array.isArray(reportsData)) {
    reports = reportsData.map(transformSupabaseReport) as unknown as DamageReport[];
    reportsError = null;
    reportsData.forEach((report: any) => {
      if (report.photo_urls && Array.isArray(report.photo_urls)) {
        photoStorage[report.id || ""] = report.photo_urls;
      }
    });
    if (import.meta.env.DEV) {
      console.log(`[DEV] Loaded ${reports.length} reports from Supabase`);
    }
  } else if (reportsData && reportsData.error) {
    reportsError = reportsData.error;
    if (import.meta.env.DEV) {
      console.error(`[DEV] Reports error:`, reportsData.error);
    }
  } else {
    reportsError = "unknown-error";
    if (import.meta.env.DEV) {
      console.error(`[DEV] Unknown reports error:`, reportsData);
    }
  }

  // Fetch bids
  const bidsData = await getMyBids(clerkUserId);
  const bids = bidsData.map(toFrontendBid);
  if (import.meta.env.DEV) {
    console.log(`[DEV] Loaded ${bids.length} bids from Supabase`);
  }

  // Build signatures for dirty tracking
  const profileSignature = JSON.stringify({
    email: profileData.email,
    name: profileData.name,
    phone: profileData.phone || "",
    profileImage: profileData.profile_image_url || "",
    accountType: profileData.account_type,
  });

  const vehicleMap: Record<string, string> = {};
  for (const vehicle of vehicles) {
    if (vehicle.id) {
      vehicleMap[vehicle.id] = JSON.stringify(vehicle);
    }
  }

  const reportMap: Record<string, string> = {};
  for (const report of reports) {
    if (report.id) {
      reportMap[report.id] = JSON.stringify(report);
    }
  }

  // Build cache payload
  const validReports = Array.isArray(reportsData) ? reportsData : [];
  const cachePayload: UserData = {
    userInfo,
    vehicles,
    reports: validReports.map(transformSupabaseReport) as unknown as DamageReport[],
    bids,
    userPhone,
    redirectInfo,
    notifications,
    hasSeenPhotoGuide: false,
    photoStorage: validReports.reduce((acc: Record<string, string[]>, report: any) => {
      if (report?.id && Array.isArray(report.photo_urls)) {
        acc[report.id] = report.photo_urls;
      }
      return acc;
    }, {}),
  };

  return {
    userInfo,
    userPhone,
    redirectInfo,
    notifications,
    vehicles,
    reports,
    reportsError,
    bids,
    photoStorage,
    signatures: {
      profile: profileSignature,
      vehicles: JSON.stringify(vehicles),
      reports: JSON.stringify(reports),
      vehicleMap,
      reportMap,
    },
    cachePayload,
  };
}

/**
 * Migrate cached localStorage data to Supabase for a user with no existing cloud profile.
 * Returns a HydrationResult if migration succeeded, null otherwise.
 */
export async function migrateLocalToCloud(
  cachedData: string,
  email: string,
  clerkUserId: string,
  websiteUserKey?: string
): Promise<HydrationResult | null> {
  let userData: UserData;
  try {
    userData = JSON.parse(cachedData);
  } catch {
    return null;
  }

  if (!userData?.userInfo?.email || userData.userInfo.email !== email || !userData.redirectInfo) {
    return null;
  }

  if (import.meta.env.DEV) console.log("Migrating cached data to Supabase...");

  const profileSaved = await saveProfile(
    {
      email,
      name: userData.userInfo.name,
      phone: userData.userPhone || "",
      profile_image_url: undefined,
      account_type: userData.redirectInfo.type,
    },
    { clerkUserId, email, websiteUserKey }
  );

  if (!profileSaved) {
    if (import.meta.env.DEV) {
      console.warn("Cached profile migration did not complete; skipping hard reload.");
    }
    return null;
  }

  if (userData.vehicles && userData.vehicles.length > 0) {
    for (const vehicle of userData.vehicles) {
      await saveVehicle(toSupabaseVehicle(vehicle), clerkUserId);
    }
    if (import.meta.env.DEV) console.log("Migrated vehicles to Supabase");
  }

  if (userData.reports && userData.reports.length > 0) {
    for (const report of userData.reports) {
      await saveDamageReport(buildSupabaseReportPayload(report), clerkUserId);
    }
    if (import.meta.env.DEV) console.log("Migrated reports to Supabase");
  }

  // Re-fetch the fresh profile after migration
  const refreshedProfile = await getProfile({ clerkUserId, email, websiteUserKey });
  if (!refreshedProfile) {
    if (import.meta.env.DEV) {
      console.warn("Migration saved data but profile refresh was not yet available");
    }
    return null;
  }

  if (import.meta.env.DEV) {
    console.log("Migration complete - hydrated fresh Supabase data without reload");
  }

  return hydrateFromCloudProfile(refreshedProfile, clerkUserId);
}
