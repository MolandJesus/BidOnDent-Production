import { describe, it, expect } from "vitest";
import { timeAgo, STATUS_LABELS, TIMELINE_LABELS } from "./shopEstimateInboxHelpers";

describe("timeAgo", () => {
  it("returns empty string for undefined input", () => {
    expect(timeAgo(undefined)).toBe("");
  });

  it("returns empty string for empty string input", () => {
    expect(timeAgo("")).toBe("");
  });

  it("returns minutes ago for recent timestamps", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe("5m ago");
  });

  it("returns 0m ago for just-now timestamp", () => {
    expect(timeAgo(new Date().toISOString())).toBe("0m ago");
  });

  it("returns hours ago for multi-hour timestamps", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe("3h ago");
  });

  it("returns days ago for old timestamps", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(twoDaysAgo)).toBe("2d ago");
  });

  it("returns 1d ago for 24-hour-old timestamp", () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(oneDayAgo)).toBe("1d ago");
  });
});

describe("STATUS_LABELS", () => {
  it("has labels for all expected statuses", () => {
    expect(STATUS_LABELS.pending.label).toBe("New");
    expect(STATUS_LABELS.viewed.label).toBe("Viewed");
    expect(STATUS_LABELS.responded.label).toBe("Responded");
    expect(STATUS_LABELS.declined.label).toBe("Declined");
    expect(STATUS_LABELS.accepted.label).toBe("Accepted");
  });

  it("has both light and dark color classes for each status", () => {
    for (const key of Object.keys(STATUS_LABELS)) {
      expect(STATUS_LABELS[key].color).toBeTruthy();
      expect(STATUS_LABELS[key].darkColor).toBeTruthy();
    }
  });
});

describe("TIMELINE_LABELS", () => {
  it("maps timeline keys to readable labels", () => {
    expect(TIMELINE_LABELS.urgent).toBe("ASAP");
    expect(TIMELINE_LABELS["this-week"]).toBe("This week");
    expect(TIMELINE_LABELS.flexible).toBe("Flexible");
  });
});
