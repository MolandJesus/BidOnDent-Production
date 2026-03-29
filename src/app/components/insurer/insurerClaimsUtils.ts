import type { DamageReport } from "../../types";

export type ClaimData = {
  id: string;
  claimNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  policyNumber: string;
  vehicle: string;
  vin: string;
  damageType: string;
  incidentDate: string;
  reportedDate: string;
  estimatedDamage: number;
  location: string;
  status: string;
  priority: string;
  photoCount: number;
  photos: string[];
  previewPhoto: string | null;
  description: string;
  shopAssigned: string | null;
  approvedAmount?: number;
  shopContact?: string;
  approvalDate?: string;
  denialReason?: string;
  shopBids?: { shopName: string; amount: number; distance: string; rating: number }[];
};

export function transformReportsToClaims(reports: DamageReport[]): ClaimData[] {
  return reports.map((report: DamageReport, index: number) => {
    const vehicleData = report?.vehicle || report?.vehicleInfo || {};
    const vehicleParts = [vehicleData.year, vehicleData.make, vehicleData.model].filter(Boolean);
    const rawStatus = String(report?.status ?? "pending").toLowerCase();
    const status =
      rawStatus === "completed" ? "approved" : rawStatus === "in-review" ? "reviewing" : "pending";
    const reportPhotos = Array.isArray(report?.photos) ? report.photos.filter(Boolean) : [];
    const inferredBidAmount =
      Number(report?.bidAmount) ||
      (Array.isArray(report?.bids) && report.bids.length > 0
        ? Math.max(...report.bids.map((bid) => Number(bid.amount) || 0))
        : 0);
    const zipCode = report?.zipCode || report?.zip_code;
    const vin = report?.vehicle?.vin || report?.vehicleInfo?.vin || "Not provided";
    const reportedAt = report?.submittedAt || report?.createdAt || "";
    const locationParts = [report?.address, report?.city, report?.state].filter(Boolean);
    const location = locationParts.join(", ") || (zipCode ? `ZIP ${zipCode}` : "Service region");
    const claimId = String(report?.id ?? `claim-${index + 1}`);
    const bidSummaries =
      Array.isArray(report?.bids) && report.bids.length > 0
        ? report.bids.map((bid) => ({
            shopName: bid.shopName,
            amount: Number(bid.amount) || 0,
            distance: bid.shopDistance || "Distance pending",
            rating: bid.shopRating || 4.7,
          }))
        : undefined;

    return {
      id: claimId,
      claimNumber: report?.claimNumber || `CLM-${String(index + 1).padStart(4, "0")}`,
      customerName: report?.customerName || "Policyholder on file",
      customerEmail: report?.customerEmail || "On file",
      customerPhone: report?.customerPhone || "On file",
      policyNumber: report?.policyNumber || "Pending verification",
      vehicle: vehicleParts.length > 0 ? vehicleParts.join(" ") : "Vehicle details pending",
      vin,
      damageType: report?.damageArea || report?.damageType || "Damage report",
      incidentDate: reportedAt ? new Date(reportedAt).toLocaleDateString() : "N/A",
      reportedDate: reportedAt ? new Date(reportedAt).toLocaleDateString() : "N/A",
      estimatedDamage: inferredBidAmount,
      location,
      status,
      priority:
        inferredBidAmount >= 1800 || reportPhotos.length >= 4
          ? "high"
          : inferredBidAmount >= 1000 || reportPhotos.length >= 2
            ? "medium"
            : "low",
      photoCount: reportPhotos.length,
      photos: reportPhotos,
      previewPhoto: reportPhotos[0] ?? null,
      description: report?.damageDescription || report?.description || "Claim details pending review.",
      shopAssigned: null,
      approvedAmount: status === "approved" ? inferredBidAmount : undefined,
      shopBids: bidSummaries,
    };
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "reviewing":
      return "bg-blue-100 text-blue-400 border-blue-400/20";
    case "approved":
      return "bg-green-400/10 text-green-300 border-green-400/30";
    case "denied":
      return "bg-red-400/10 text-red-300 border-red-400/30";
    default:
      return "bg-white/[0.06] text-slate-300 border-white/[0.10]";
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "high":
      return "text-red-300 bg-red-400/10 border-red-400/30";
    case "medium":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "low":
      return "text-green-300 bg-green-400/10 border-green-400/30";
    default:
      return "text-slate-400 bg-white/[0.04] border-white/[0.10]";
  }
}
