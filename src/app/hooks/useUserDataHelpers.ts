import { STORAGE_KEYS } from "../constants";
import { buildNotificationsSnapshot } from "../services/notifications/notificationSnapshots";
import type {
  Profile,
  Bid as SupabaseBid,
  DamageReport as SupabaseDamageReport,
} from "../services/supabase/types";
import type { Activity, Bid, DamageReport, Notification, UserData, Vehicle } from "../types";
import {
  getUserCacheKey as buildUserCacheKey,
  readLocalStorageItemSafely,
  writeLocalStorageItemSafely,
} from "./userDataUtils";

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

type ReportWithBids = SupabaseDamageReport & {
  bids?: SupabaseBid[];
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}

function isOptionalFiniteNumber(value: unknown) {
  return value === undefined || (typeof value === "number" && Number.isFinite(value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRedirectInfo(value: unknown): value is UserData["redirectInfo"] {
  if (typeof value !== "object" || value === null) return false;
  const redirectInfo = value as Record<string, unknown>;
  return (
    (redirectInfo.type === "customer" ||
      redirectInfo.type === "shop" ||
      redirectInfo.type === "insurer") &&
    (!("email" in redirectInfo) ||
      redirectInfo.email === undefined ||
      typeof redirectInfo.email === "string") &&
    (!("isReturning" in redirectInfo) ||
      redirectInfo.isReturning === undefined ||
      typeof redirectInfo.isReturning === "boolean")
  );
}

function isPhotoStorage(value: unknown): value is Record<string, string[]> {
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value).every((entry) => isStringArray(entry));
}

function isVehicle(value: unknown): value is Vehicle {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.year === "string" &&
    typeof value.make === "string" &&
    typeof value.model === "string" &&
    isOptionalString(value.vin) &&
    isOptionalString(value.licensePlate) &&
    isOptionalString(value.color)
  );
}

function isBid(value: unknown): value is Bid {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.shopId === "string" &&
    typeof value.shopName === "string" &&
    typeof value.shopEmail === "string" &&
    typeof value.reportId === "string" &&
    typeof value.amount === "number" &&
    Number.isFinite(value.amount) &&
    typeof value.estimatedDays === "number" &&
    Number.isFinite(value.estimatedDays) &&
    typeof value.description === "string" &&
    (value.status === "pending" || value.status === "accepted" || value.status === "rejected") &&
    typeof value.createdAt === "string" &&
    isOptionalFiniteNumber(value.shopRating) &&
    isOptionalFiniteNumber(value.shopReviews) &&
    isOptionalString(value.shopDistance) &&
    isOptionalFiniteNumber(value.shopLatitude) &&
    isOptionalFiniteNumber(value.shopLongitude)
  );
}

function isDamageReportVehicleInfo(value: unknown): value is DamageReport["vehicleInfo"] {
  if (!isRecord(value)) return false;
  return (
    typeof value.year === "string" &&
    typeof value.make === "string" &&
    typeof value.model === "string" &&
    isOptionalString(value.vin)
  );
}

function isDamageReportVehiclePreview(
  value: unknown
): value is NonNullable<DamageReport["vehicle"]> {
  if (!isRecord(value)) return false;
  return (
    isOptionalString(value.year) &&
    isOptionalString(value.make) &&
    isOptionalString(value.model) &&
    isOptionalString(value.vin)
  );
}

function isDamageReport(value: unknown): value is DamageReport {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.vehicleId === "string" &&
    isDamageReportVehicleInfo(value.vehicleInfo) &&
    isStringArray(value.damageAreas) &&
    isStringArray(value.photos) &&
    typeof value.description === "string" &&
    (value.status === "pending" ||
      value.status === "in-review" ||
      value.status === "active" ||
      value.status === "completed" ||
      value.status === "resolved") &&
    typeof value.createdAt === "string" &&
    isOptionalString(value.submittedAt) &&
    isOptionalString(value.address) &&
    isOptionalString(value.city) &&
    isOptionalString(value.state) &&
    isOptionalString(value.damageArea) &&
    isOptionalString(value.incident) &&
    isOptionalString(value.zipCode) &&
    isOptionalString(value.zip_code) &&
    isOptionalString(value.damageType) &&
    isOptionalString(value.claimNumber) &&
    isOptionalString(value.customerName) &&
    isOptionalString(value.customerEmail) &&
    isOptionalString(value.customerPhone) &&
    isOptionalString(value.policyNumber) &&
    isOptionalFiniteNumber(value.bidAmount) &&
    isOptionalFiniteNumber(value.bidsCount) &&
    (value.vehicle === undefined || isDamageReportVehiclePreview(value.vehicle)) &&
    (value.bids === undefined ||
      (Array.isArray(value.bids) && value.bids.every((bid) => isBid(bid))))
  );
}

function isNotification(value: unknown): value is Notification {
  if (!isRecord(value)) return false;
  return (
    (typeof value.id === "string" || typeof value.id === "number") &&
    (value.type === "bid" ||
      value.type === "update" ||
      value.type === "message" ||
      value.type === "repair_request" ||
      value.type === "claim") &&
    typeof value.message === "string" &&
    typeof value.time === "string" &&
    typeof value.read === "boolean" &&
    isOptionalString(value.createdAt)
  );
}

function isActivity(value: unknown): value is Activity {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    (value.type === "bid_submitted" ||
      value.type === "request_viewed" ||
      value.type === "job_accepted" ||
      value.type === "claim_created" ||
      value.type === "shop_added" ||
      value.type === "claim_opened" ||
      value.type === "claim_in_progress" ||
      value.type === "claim_approved" ||
      value.type === "claim_denied" ||
      value.type === "new_user") &&
    typeof value.message === "string" &&
    typeof value.timestamp === "string" &&
    (value.metadata === undefined || isRecord(value.metadata))
  );
}

function isCachedUserData(value: unknown): value is UserData {
  if (typeof value !== "object" || value === null) return false;
  const userData = value as Record<string, unknown>;
  const userInfo = userData.userInfo;
  return (
    typeof userInfo === "object" &&
    userInfo !== null &&
    typeof (userInfo as Record<string, unknown>).name === "string" &&
    typeof (userInfo as Record<string, unknown>).email === "string" &&
    typeof (userInfo as Record<string, unknown>).profileImage === "string" &&
    Array.isArray(userData.vehicles) &&
    Array.isArray(userData.reports) &&
    Array.isArray(userData.bids) &&
    typeof userData.userPhone === "string" &&
    isRedirectInfo(userData.redirectInfo) &&
    Array.isArray(userData.notifications) &&
    typeof userData.hasSeenPhotoGuide === "boolean" &&
    (!("photoStorage" in userData) ||
      userData.photoStorage === undefined ||
      isPhotoStorage(userData.photoStorage)) &&
    (!("activities" in userData) ||
      userData.activities === undefined ||
      Array.isArray(userData.activities))
  );
}

function sanitizeCachedUserData(userData: UserData): UserData {
  return {
    ...userData,
    vehicles: userData.vehicles.filter((vehicle) => isVehicle(vehicle)),
    reports: userData.reports.filter((report) => isDamageReport(report)),
    bids: userData.bids.filter((bid) => isBid(bid)),
    notifications: userData.notifications.filter((notification) => isNotification(notification)),
    ...(userData.activities
      ? {
          activities: userData.activities.filter((activity) => isActivity(activity)),
        }
      : {}),
  };
}

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

export function transformSupabaseReport(report: SupabaseDamageReport) {
  const vehicleInfo = {
    make: report.vehicle_make || "",
    model: report.vehicle_model || "",
    year: report.vehicle_year?.toString() || "",
    vin: "",
  };
  const bids = Array.isArray((report as ReportWithBids).bids)
    ? ((report as ReportWithBids).bids ?? []).map(transformSupabaseBid)
    : [];

  return {
    id: report.id || "",
    vehicleId: report.vehicle_id || "",
    vehicle: vehicleInfo,
    vehicleInfo,
    damageAreas: [report.damage_location || report.damage_type || "unknown"],
    damageArea: report.damage_location || report.damage_type || "unknown",
    photos: report.photo_urls || [],
    description: report.damage_description || "",
    incident: report.additional_notes || "",
    status: report.status || "pending",
    createdAt: report.created_at || new Date().toISOString(),
    submittedAt: report.created_at || new Date().toISOString(),
    bids,
    bidsCount: bids.length,
  };
}

export function transformSupabaseReports(reportsData: ReportWithBids[]) {
  return reportsData.map(transformSupabaseReport);
}

export function transformSupabaseBid(bid: SupabaseBid) {
  const reportId = bid.damage_report_id || bid.report_id || "";
  const shopRating =
    typeof bid.shop_rating === "number"
      ? bid.shop_rating
      : bid.shop_rating
        ? Number(bid.shop_rating)
        : undefined;
  const shopReviews =
    typeof bid.shop_reviews === "number"
      ? bid.shop_reviews
      : bid.shop_reviews
        ? Number(bid.shop_reviews)
        : undefined;

  return {
    id: bid.id || "",
    shopId: bid.clerk_shop_user_id || bid.shop_user_id || bid.shop_id || "",
    shopName: bid.shop_name || "Auto Shop",
    shopEmail: bid.shop_email || "",
    reportId,
    amount: Number(bid.amount || 0),
    estimatedDays: Number(bid.estimated_days || 0),
    description: bid.description || bid.notes || "",
    status: bid.status || "pending",
    createdAt: bid.created_at || new Date().toISOString(),
    shopRating,
    shopReviews,
    shopDistance: bid.shop_distance || undefined,
  };
}

export function extractBidsFromReports(
  reportsData: ReportWithBids[],
  userType: "customer" | "shop" | "insurer",
  clerkUserId?: string
) {
  const bids = reportsData.flatMap((report) =>
    Array.isArray(report.bids) ? report.bids.map(transformSupabaseBid) : []
  );

  if (userType === "shop" && clerkUserId) {
    return bids.filter((bid) => bid.shopId === clerkUserId);
  }

  return bids;
}

export function createFreshUserData(args: {
  profileData: Profile;
  vehiclesData: UserData["vehicles"];
  reportsData: SupabaseDamageReport[];
}): UserData {
  const { profileData, vehiclesData, reportsData } = args;

  return {
    userInfo: {
      name: profileData.name,
      email: profileData.email,
      profileImage: profileData.profile_image_url || "",
    },
    vehicles: vehiclesData,
    reports: transformSupabaseReports(reportsData) as unknown as UserData["reports"],
    bids: [],
    userPhone: profileData.phone || "",
    redirectInfo: {
      type: profileData.account_type,
      email: profileData.email,
    } as UserData["redirectInfo"],
    notifications: buildNotificationsSnapshot({
      userType: profileData.account_type,
      reports: transformSupabaseReports(reportsData) as unknown as UserData["reports"],
      bids: [],
      existingNotifications: [],
    }),
    hasSeenPhotoGuide: false,
    photoStorage: buildPhotoStorageFromReports(reportsData),
  };
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
