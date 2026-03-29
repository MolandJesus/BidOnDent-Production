import type { DamageReport } from "../../types";

export type ClaimData = {
  id: number;
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
    const bidAmount = Number(report?.bidAmount) || 0;
    const zipCode = report?.zipCode || report?.zip_code;
    const vin = report?.vehicle?.vin || report?.vehicleInfo?.vin || "Not provided";

    return {
      id: Number(index + 1),
      claimNumber: `CLM-${String(index + 1).padStart(4, "0")}`,
      customerName: report?.customerName || "Policyholder on file",
      customerEmail: report?.customerEmail || "On file",
      customerPhone: report?.customerPhone || "On file",
      policyNumber: report?.policyNumber || "Pending verification",
      vehicle: vehicleParts.length > 0 ? vehicleParts.join(" ") : "Vehicle details pending",
      vin,
      damageType: report?.damageArea || report?.damageType || "Damage report",
      incidentDate: report?.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : "N/A",
      reportedDate: report?.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : "N/A",
      estimatedDamage: bidAmount,
      location: report?.address || (zipCode ? `ZIP ${zipCode}` : "Service region"),
      status,
      priority: bidAmount >= 1800 ? "high" : bidAmount >= 1000 ? "medium" : "low",
      photoCount: Array.isArray(report?.photos) ? report.photos.length : 0,
      description: report?.description || "Claim details pending review.",
      shopAssigned: null,
      approvedAmount: status === "approved" ? bidAmount : undefined,
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
