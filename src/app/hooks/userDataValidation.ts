import type { Activity, Bid, DamageReport, Notification, UserData, Vehicle } from "../types";

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

export function isCachedUserData(value: unknown): value is UserData {
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

export function sanitizeCachedUserData(userData: UserData): UserData {
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
