/**
 * HomeScreen Helper Functions
 * Utility functions for formatting and data transformation
 */
import type { DamageReport } from "../../types";

/**
 * Format a date string to a readable format
 * @param value ISO date string or undefined
 * @returns Formatted date string or "No date"
 */
export function formatDate(value?: string): string {
  if (!value) return "No date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "No date";
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format status text to user-friendly format
 * @param status Status string (e.g., "pending", "in-review", "completed")
 * @returns Formatted status text
 */
export function formatStatus(status?: string): string {
  if (!status) return "Unknown";
  if (status === "pending") return "Pending Bids";
  if (status === "in-review" || status === "active") return "Reviewing Bids";
  if (status === "completed" || status === "resolved") return "Completed";
  return status.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Get report title based on user type and report data
 * @param report Report object with claimNumber and vehicle info
 * @param userType Type of user ("customer", "shop", "insurer")
 * @returns Report title string
 */
export function getReportTitle(report: DamageReport, userType: string): string {
  const claimNumber = report?.claimNumber?.trim();
  if (userType === "insurer" && claimNumber) {
    return `Claim #${claimNumber}`;
  }

  const year = report?.vehicle?.year ? String(report.vehicle.year) : "";
  const make = report?.vehicle?.make || "";
  const model = report?.vehicle?.model || "";

  if (year && make && model) {
    return `${year} ${make} ${model}`;
  }

  return `Damage Report #${report?.id?.slice(0, 8) || "Unknown"}`;
}

/**
 * Get report description based on user type and report data
 * @param report Report object with damage description
 * @param userType Type of user
 * @returns Report description text
 */
export function getReportDescription(report: DamageReport, userType: string): string {
  const damageDescription = report?.damageDescription?.trim() || report?.description?.trim();
  if (damageDescription) {
    return damageDescription.substring(0, 100);
  }

  if (userType === "insurer" && report?.claimNumber) {
    return `Claim submitted for repair estimate`;
  }

  return "Vehicle damage report - awaiting review";
}
