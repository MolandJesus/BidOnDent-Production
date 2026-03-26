import { STORAGE_KEYS } from "../constants";
import { buildNotificationsSnapshot } from "../services/notifications/notificationSnapshots";
import type {
  Profile,
  Bid as SupabaseBid,
  DamageReport as SupabaseDamageReport,
} from "../services/supabase/types";
import type { UserData } from "../types";

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

export function normalizeEmail(email?: string): string {
  return email ? email.toLowerCase() : "";
}

export function getUserCacheKey(email?: string): string {
  const normalized = normalizeEmail(email);
  return normalized ? `${STORAGE_KEYS.USER_DATA}:${normalized}` : STORAGE_KEYS.USER_DATA;
}

export function getLastActiveEmail(): string {
  const lastActive = localStorage.getItem(STORAGE_KEYS.USER_DATA_LAST_ACTIVE);
  return normalizeEmail(lastActive || undefined);
}

export function loadCachedUserData(): CachedUserDataResult | null {
  const lastActiveEmail = getLastActiveEmail();
  const lastActiveCacheKey = lastActiveEmail
    ? getUserCacheKey(lastActiveEmail)
    : STORAGE_KEYS.USER_DATA;
  const cachedData =
    localStorage.getItem(lastActiveCacheKey) || localStorage.getItem(STORAGE_KEYS.USER_DATA);

  if (!cachedData) {
    return null;
  }

  try {
    return {
      raw: cachedData,
      data: JSON.parse(cachedData) as UserData,
    };
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error loading cached data:", error);
    return null;
  }
}

export function saveUserDataCache(userData: UserData, email?: string): void {
  try {
    localStorage.setItem(
      getUserCacheKey(email || userData.userInfo.email),
      JSON.stringify(userData)
    );
    localStorage.setItem(
      STORAGE_KEYS.USER_DATA_LAST_ACTIVE,
      normalizeEmail(email || userData.userInfo.email)
    );
  } catch {
    // Graceful: quota exceeded or private mode — Supabase is source of truth
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

export function createSupabaseReportPayload(report: any) {
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
