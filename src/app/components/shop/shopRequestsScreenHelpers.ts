import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport } from "../../types";
import type { RepairRequest } from "./ShopRequestCard";

export type ShopRequestsScreenProps = {
  primaryColor?: string;
  reports?: DamageReport[];
  reportsLoading?: boolean;
  isSeedData?: boolean;
  existingBidReportIds?: string[];
  onSubmitBid?: (
    requestId: string,
    bidAmount: number,
    estimatedDays: number,
    description: string
  ) => Promise<void> | void;
  appearanceMode?: DashboardAppearanceMode;
};

export function transformReportToRequest(report: DamageReport, index: number): RepairRequest {
  const vehicleData = report?.vehicle || report?.vehicleInfo || {};
  const vehicleParts = [vehicleData.year, vehicleData.make, vehicleData.model].filter(Boolean);
  const status = String(report?.status ?? "pending").toLowerCase();
  const normalizedStatus =
    status === "pending"
      ? "new"
      : status === "in-review"
        ? "bidding"
        : status === "active"
          ? "accepted"
          : "closed";
  const bidCount = Number(report?.bidsCount) || 0;
  const reportPhotos = Array.isArray(report?.photos) ? report.photos.filter(Boolean) : [];

  const zipCode = report?.zipCode || report?.zip_code || "";
  const locationParts = [report?.address, report?.city, report?.state].filter(Boolean);
  const address = locationParts.join(", ");
  const hasLocation = Boolean(zipCode || address);
  const locationLabel = address || (zipCode ? `ZIP ${zipCode}` : "No location");
  const submittedAt = report?.submittedAt || report?.createdAt || "";

  return {
    id: String(report?.id ?? `request-${index}`),
    customerName: report?.customerName || "Customer",
    customerEmail: report?.customerEmail || "Contact via BidOnDent",
    customerPhone: report?.customerPhone || "Via platform",
    vehicle: vehicleParts.length > 0 ? vehicleParts.join(" ") : "Vehicle details pending",
    damageType: report?.damageArea || report?.damageType || "Damage report",
    description: report?.damageDescription || report?.description || "No description provided yet.",
    location: locationLabel,
    distance: locationLabel,
    hasLocation,
    photoCount: reportPhotos.length,
    photoUrls: reportPhotos,
    previewPhoto: reportPhotos[0] ?? null,
    submittedAt,
    submittedDate: submittedAt ? new Date(submittedAt).toLocaleDateString() : "Recently submitted",
    status: normalizedStatus,
    urgency: bidCount === 0 ? "high" : bidCount < 3 ? "medium" : "low",
    insuranceClaim: Boolean(report?.policyNumber || report?.claimNumber),
    insuranceCompany: report?.policyNumber || "",
    bidCount,
  };
}
