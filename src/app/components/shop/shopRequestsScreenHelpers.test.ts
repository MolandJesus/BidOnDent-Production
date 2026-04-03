import { describe, it, expect } from "vitest";
import { transformReportToRequest } from "./shopRequestsScreenHelpers";
import type { DamageReport } from "../../types";

function makeReport(overrides: Partial<DamageReport> = {}): DamageReport {
  return {
    id: "rpt-1",
    vehicleId: "v-1",
    vehicleInfo: { year: "2024", make: "Toyota", model: "Camry" },
    damageAreas: ["front-bumper"],
    photos: ["https://example.com/photo1.jpg"],
    description: "Minor dent on front bumper",
    status: "pending",
    createdAt: "2026-04-03T12:00:00Z",
    ...overrides,
  };
}

describe("transformReportToRequest", () => {
  it("transforms a full report into a RepairRequest", () => {
    const report = makeReport({
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      customerPhone: "555-1234",
      damageArea: "Front Bumper",
      bidsCount: 2,
      city: "White Plains",
      state: "NY",
      zipCode: "10601",
      submittedAt: "2026-04-03T10:00:00Z",
    });

    const result = transformReportToRequest(report, 0);

    expect(result.id).toBe("rpt-1");
    expect(result.customerName).toBe("Jane Doe");
    expect(result.vehicle).toBe("2024 Toyota Camry");
    expect(result.damageType).toBe("Front Bumper");
    expect(result.status).toBe("new"); // pending → "new"
  });

  it("normalizes pending status to 'new'", () => {
    const result = transformReportToRequest(makeReport({ status: "pending" }), 0);
    expect(result.status).toBe("new");
  });

  it("normalizes in-review status to 'bidding'", () => {
    const result = transformReportToRequest(makeReport({ status: "in-review" }), 0);
    expect(result.status).toBe("bidding");
  });

  it("normalizes active status to 'accepted'", () => {
    const result = transformReportToRequest(makeReport({ status: "active" }), 0);
    expect(result.status).toBe("accepted");
  });

  it("normalizes completed status to 'closed'", () => {
    const result = transformReportToRequest(makeReport({ status: "completed" }), 0);
    expect(result.status).toBe("closed");
  });

  it("sets urgency to high when zero bids", () => {
    const result = transformReportToRequest(makeReport({ bidsCount: 0 }), 0);
    expect(result.urgency).toBe("high");
  });

  it("sets urgency to medium when 1-2 bids", () => {
    expect(transformReportToRequest(makeReport({ bidsCount: 1 }), 0).urgency).toBe("medium");
    expect(transformReportToRequest(makeReport({ bidsCount: 2 }), 0).urgency).toBe("medium");
  });

  it("sets urgency to low when 3+ bids", () => {
    expect(transformReportToRequest(makeReport({ bidsCount: 3 }), 0).urgency).toBe("low");
    expect(transformReportToRequest(makeReport({ bidsCount: 10 }), 0).urgency).toBe("low");
  });

  it("falls back to index-based id when report has no id", () => {
    const report = makeReport();
    // @ts-expect-error — testing null id fallback
    report.id = undefined;
    const result = transformReportToRequest(report, 5);
    expect(result.id).toBe("request-5");
  });

  it("uses vehicleInfo when vehicle is missing", () => {
    const result = transformReportToRequest(
      makeReport({ vehicleInfo: { year: "2023", make: "Honda", model: "Civic" } }),
      0
    );
    expect(result.vehicle).toBe("2023 Honda Civic");
  });

  it("shows 'Vehicle details pending' when no vehicle data", () => {
    const report = makeReport();
    report.vehicleInfo = { year: "", make: "", model: "" };
    report.vehicle = undefined;
    const result = transformReportToRequest(report, 0);
    expect(result.vehicle).toBe("Vehicle details pending");
  });

  it("builds location from address parts", () => {
    const result = transformReportToRequest(
      makeReport({ address: "123 Main St", city: "Yonkers", state: "NY" }),
      0
    );
    expect(result.location).toBe("123 Main St, Yonkers, NY");
    expect(result.hasLocation).toBe(true);
  });

  it("falls back to ZIP code for location", () => {
    const result = transformReportToRequest(makeReport({ zipCode: "10701" }), 0);
    expect(result.location).toBe("ZIP 10701");
    expect(result.hasLocation).toBe(true);
  });

  it("shows 'No location' when nothing available", () => {
    const report = makeReport();
    report.address = undefined;
    report.city = undefined;
    report.state = undefined;
    report.zipCode = undefined;
    report.zip_code = undefined;
    const result = transformReportToRequest(report, 0);
    expect(result.location).toBe("No location");
    expect(result.hasLocation).toBe(false);
  });

  it("detects insurance claim from policyNumber", () => {
    const result = transformReportToRequest(makeReport({ policyNumber: "POL-123" }), 0);
    expect(result.insuranceClaim).toBe(true);
  });

  it("detects insurance claim from claimNumber", () => {
    const result = transformReportToRequest(makeReport({ claimNumber: "CLM-456" }), 0);
    expect(result.insuranceClaim).toBe(true);
  });

  it("counts photos correctly", () => {
    const result = transformReportToRequest(makeReport({ photos: ["a.jpg", "b.jpg", "c.jpg"] }), 0);
    expect(result.photoCount).toBe(3);
    expect(result.previewPhoto).toBe("a.jpg");
  });

  it("handles empty photos", () => {
    const result = transformReportToRequest(makeReport({ photos: [] }), 0);
    expect(result.photoCount).toBe(0);
    expect(result.previewPhoto).toBeNull();
  });
});
