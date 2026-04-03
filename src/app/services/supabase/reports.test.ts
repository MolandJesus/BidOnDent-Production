import { afterEach, describe, expect, it, vi } from "vitest";

import type { DamageReport } from "./types";

vi.mock("./runtime", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./runtime")>();
  return {
    ...actual,
    requestSupabaseEdge: vi.fn(),
  };
});

import {
  deleteDamageReport,
  getAllDamageReports,
  getDamageReports,
  saveDamageReport,
  updateClaimDecision,
  updateReportStatus,
} from "./reports";
import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

const mockRequest = vi.mocked(requestSupabaseEdge);

const fakeReport: DamageReport = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  vehicle_make: "Honda",
  vehicle_model: "Civic",
  vehicle_year: 2022,
  damage_type: "dent",
  damage_severity: "minor",
  damage_location: "rear bumper",
  status: "pending",
};

afterEach(() => {
  mockRequest.mockReset();
});

// ---------------------------------------------------------------------------
// getDamageReports
// ---------------------------------------------------------------------------
describe("getDamageReports", () => {
  it("returns reports for a clerkUserId", async () => {
    mockRequest.mockResolvedValueOnce({ reports: [fakeReport] });

    const result = await getDamageReports("clerk-user-1");

    expect(result).toEqual([fakeReport]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining(`${SUPABASE_EDGE_ROUTES.reports}?clerkUserId=clerk-user-1`),
      { method: "GET" },
    );
  });

  it("returns reports for an email identity", async () => {
    mockRequest.mockResolvedValueOnce({ reports: [fakeReport] });

    const result = await getDamageReports("user@example.com");

    expect(result).toEqual([fakeReport]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("email=user%40example.com"),
      expect.any(Object),
    );
  });

  it("returns reports for a website user key", async () => {
    mockRequest.mockResolvedValueOnce({ reports: [fakeReport] });

    const result = await getDamageReports("website-user-abc");

    expect(result).toEqual([fakeReport]);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining("websiteUserKey=website-user-abc"),
      expect.any(Object),
    );
  });

  it("returns reports for a WebsiteProfileIdentity object", async () => {
    mockRequest.mockResolvedValueOnce({ reports: [fakeReport] });

    const result = await getDamageReports({ clerkUserId: "clerk-obj-1" });

    expect(result).toEqual([fakeReport]);
  });

  it("returns error object when identity is null", async () => {
    const result = await getDamageReports(null);

    expect(result).toEqual({ error: "no identity available" });
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns error object when identity is undefined", async () => {
    const result = await getDamageReports(undefined);

    expect(result).toEqual({ error: "no identity available" });
  });

  it("returns empty array when response has no reports key", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await getDamageReports("clerk-user-1");

    expect(result).toEqual([]);
  });

  it("retries once on first failure then succeeds", async () => {
    mockRequest
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce({ reports: [fakeReport] });

    const result = await getDamageReports("clerk-user-1");

    expect(result).toEqual([fakeReport]);
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it("returns error after 2 consecutive failures", async () => {
    mockRequest
      .mockRejectedValueOnce(new Error("fail-1"))
      .mockRejectedValueOnce(new Error("fail-2"));

    const result = await getDamageReports("clerk-user-1");

    expect(result).toEqual({ error: "Failed to fetch reports after 2 attempts" });
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// getAllDamageReports
// ---------------------------------------------------------------------------
describe("getAllDamageReports", () => {
  it("returns marketplace reports", async () => {
    mockRequest.mockResolvedValueOnce({ reports: [fakeReport] });

    const result = await getAllDamageReports();

    expect(result).toEqual([fakeReport]);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.reports}/marketplace`,
      { method: "GET" },
    );
  });

  it("returns empty array when response has no reports", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await getAllDamageReports();

    expect(result).toEqual([]);
  });

  it("returns empty array on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("network"));

    const result = await getAllDamageReports();

    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// saveDamageReport
// ---------------------------------------------------------------------------
describe("saveDamageReport", () => {
  it("creates a new report when id is not UUID-like", async () => {
    const newReport = { ...fakeReport, id: undefined };
    mockRequest.mockResolvedValueOnce({ report: { ...newReport, id: "new-uuid" } });

    const result = await saveDamageReport(newReport, "clerk-user-1");

    expect(result).toEqual({ ...newReport, id: "new-uuid" });
    expect(mockRequest).toHaveBeenCalledWith(
      SUPABASE_EDGE_ROUTES.reports,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("updates an existing report when id is UUID-like", async () => {
    mockRequest.mockResolvedValueOnce({ report: fakeReport });

    const result = await saveDamageReport(fakeReport, "clerk-user-1");

    expect(result).toEqual(fakeReport);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.reports}/${fakeReport.id}`,
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("includes all report fields in the payload", async () => {
    mockRequest.mockResolvedValueOnce({ report: fakeReport });

    await saveDamageReport(
      { ...fakeReport, address: "123 Main St", latitude: 40.7, longitude: -73.9 },
      "clerk-user-1",
    );

    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.clerkUserId).toBe("clerk-user-1");
    expect(body.report.address).toBe("123 Main St");
    expect(body.report.latitude).toBe(40.7);
    expect(body.report.longitude).toBe(-73.9);
    expect(body.report.status).toBe("pending");
  });

  it("returns null when clerkUserId is missing", async () => {
    const result = await saveDamageReport(fakeReport, undefined);

    expect(result).toBeNull();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("throws on network error (does not swallow)", async () => {
    mockRequest.mockRejectedValueOnce(new Error("server error"));

    await expect(saveDamageReport(fakeReport, "clerk-user-1")).rejects.toThrow("server error");
  });
});

// ---------------------------------------------------------------------------
// updateReportStatus
// ---------------------------------------------------------------------------
describe("updateReportStatus", () => {
  it("returns true on success", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await updateReportStatus("report-1", "in_progress", "clerk-user-1");

    expect(result).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith(
      `${SUPABASE_EDGE_ROUTES.reports}/report-1`,
      {
        method: "PUT",
        body: JSON.stringify({ clerkUserId: "clerk-user-1", report: { status: "in_progress" } }),
      },
    );
  });

  it("returns false on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("fail"));

    const result = await updateReportStatus("report-1", "completed", "clerk-user-1");

    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// updateClaimDecision
// ---------------------------------------------------------------------------
describe("updateClaimDecision", () => {
  it("sends approved decision with amount", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await updateClaimDecision("report-1", "approved", { approvedAmount: 500 });

    expect(result).toBe(true);
    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.reportId).toBe("report-1");
    expect(body.decision).toBe("approved");
    expect(body.approvedAmount).toBe(500);
    expect(body.denialReason).toBeNull();
  });

  it("sends denied decision with reason", async () => {
    mockRequest.mockResolvedValueOnce({});

    const result = await updateClaimDecision("report-1", "denied", {
      denialReason: "Not covered",
    });

    expect(result).toBe(true);
    const body = JSON.parse(mockRequest.mock.calls[0][1]!.body as string);
    expect(body.decision).toBe("denied");
    expect(body.denialReason).toBe("Not covered");
    expect(body.approvedAmount).toBeNull();
  });

  it("returns false on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("fail"));

    const result = await updateClaimDecision("report-1", "approved", { approvedAmount: 250 });

    expect(result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deleteDamageReport
// ---------------------------------------------------------------------------
describe("deleteDamageReport", () => {
  it("deletes a report and returns true", async () => {
    mockRequest.mockResolvedValueOnce({ success: true });

    const result = await deleteDamageReport("report-1", "clerk-user-1");

    expect(result).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.stringContaining(`${SUPABASE_EDGE_ROUTES.reports}/report-1?clerkUserId=clerk-user-1`),
      { method: "DELETE" },
    );
  });

  it("returns false when clerkUserId is missing", async () => {
    const result = await deleteDamageReport("report-1", undefined);

    expect(result).toBe(false);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it("returns false on network error", async () => {
    mockRequest.mockRejectedValueOnce(new Error("fail"));

    const result = await deleteDamageReport("report-1", "clerk-user-1");

    expect(result).toBe(false);
  });
});
