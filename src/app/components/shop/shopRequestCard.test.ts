import { describe, it, expect } from "vitest";
import {
  getUrgencyColor,
  getStatusColor,
  isRecentReport,
  NEW_REPORT_THRESHOLD_MS,
} from "./ShopRequestCard";

// ─── isRecentReport ─────────────────────────────────────────────

describe("isRecentReport", () => {
  it("returns true for a report submitted 30 minutes ago", () => {
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    expect(isRecentReport(thirtyMinAgo)).toBe(true);
  });

  it("returns true for a report submitted just now", () => {
    expect(isRecentReport(new Date().toISOString())).toBe(true);
  });

  it("returns false for a report submitted 3 hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(isRecentReport(threeHoursAgo)).toBe(false);
  });

  it("returns false for a report exactly at the threshold", () => {
    const atThreshold = new Date(Date.now() - NEW_REPORT_THRESHOLD_MS).toISOString();
    expect(isRecentReport(atThreshold)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isRecentReport("")).toBe(false);
  });

  it("returns false for a future timestamp", () => {
    const future = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    expect(isRecentReport(future)).toBe(false);
  });
});

// ─── getUrgencyColor ────────────────────────────────────────────

describe("getUrgencyColor", () => {
  it("returns red classes for high urgency in dark mode", () => {
    const result = getUrgencyColor("high", false);
    expect(result).toContain("text-red");
    expect(result).toContain("bg-red");
  });

  it("returns red classes for high urgency in light mode", () => {
    const result = getUrgencyColor("high", true);
    expect(result).toContain("text-red-700");
    expect(result).toContain("bg-red-100");
  });

  it("returns orange classes for medium urgency", () => {
    expect(getUrgencyColor("medium", false)).toContain("text-orange");
    expect(getUrgencyColor("medium", true)).toContain("text-orange");
  });

  it("returns green classes for low urgency", () => {
    expect(getUrgencyColor("low", false)).toContain("text-green");
    expect(getUrgencyColor("low", true)).toContain("text-green");
  });

  it("returns slate classes for unknown urgency", () => {
    expect(getUrgencyColor("unknown", false)).toContain("text-slate");
    expect(getUrgencyColor("unknown", true)).toContain("text-slate");
  });
});

// ─── getStatusColor ─────────────────────────────────────────────

describe("getStatusColor", () => {
  it("returns blue classes for new status", () => {
    expect(getStatusColor("new", false)).toContain("text-blue");
    expect(getStatusColor("new", true)).toContain("text-blue");
  });

  it("returns yellow classes for bidding status", () => {
    expect(getStatusColor("bidding", false)).toContain("text-yellow");
    expect(getStatusColor("bidding", true)).toContain("text-yellow");
  });

  it("returns emerald classes for accepted status", () => {
    expect(getStatusColor("accepted", false)).toContain("text-emerald");
    expect(getStatusColor("accepted", true)).toContain("text-emerald");
  });

  it("returns slate classes for closed status", () => {
    expect(getStatusColor("closed", false)).toContain("text-slate");
    expect(getStatusColor("closed", true)).toContain("text-slate");
  });
});
