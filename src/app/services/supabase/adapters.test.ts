/**
 * Tests for adapters.ts — Pass 208 (Phase 5+).
 *
 * Pure DB ↔ App transform helpers. No async, no module state. Covers:
 *   - reportFromDb status normalization + defaults
 *   - reportToDb vehicleInfo > vehicle precedence + numeric parsing
 *   - buildReportPayload UUID-like id detection (id vs client_request_id)
 *   - bidFromDb shopId fallback chain
 *   - vehicleFromDb / vehicleToDb roundtrip
 *   - jobAssignmentFromDb / activityEventFromDb field mapping
 */
import { describe, expect, it } from "vitest";

import {
  activityEventFromDb,
  bidFromDb,
  buildReportPayload,
  jobAssignmentFromDb,
  reportFromDb,
  reportToDb,
  vehicleFromDb,
  vehicleToDb,
} from "./adapters";

// ---------------------------------------------------------------------------
// reportFromDb — status normalization
// ---------------------------------------------------------------------------
describe("reportFromDb — status normalization", () => {
  const base = { id: "r1", created_at: "2026-05-09T00:00:00.000Z" };

  it("maps 'accepted' → 'active'", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(reportFromDb({ ...base, status: "accepted" } as any).status).toBe("active");
  });

  it("maps 'active' → 'active'", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(reportFromDb({ ...base, status: "active" } as any).status).toBe("active");
  });

  it("maps 'reviewing' → 'in-review'", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(reportFromDb({ ...base, status: "reviewing" } as any).status).toBe("in-review");
  });

  it("preserves 'in-review' and 'resolved' as-is", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(reportFromDb({ ...base, status: "in-review" } as any).status).toBe("in-review");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(reportFromDb({ ...base, status: "resolved" } as any).status).toBe("resolved");
  });

  it("maps 'completed' → 'completed'", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(reportFromDb({ ...base, status: "completed" } as any).status).toBe("completed");
  });

  it("falls back to 'pending' for unknown status", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(reportFromDb({ ...base, status: "weird" } as any).status).toBe("pending");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(reportFromDb({ ...base } as any).status).toBe("pending");
  });
});

// ---------------------------------------------------------------------------
// reportFromDb — field mapping
// ---------------------------------------------------------------------------
describe("reportFromDb — field mapping", () => {
  it("derives damageArea from damage_location, falls back to damage_type, then 'unknown'", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(reportFromDb({ id: "r", damage_location: "front bumper" } as any).damageArea).toBe(
      "front bumper"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(reportFromDb({ id: "r", damage_type: "dent" } as any).damageArea).toBe("dent");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(reportFromDb({ id: "r" } as any).damageArea).toBe("unknown");
  });

  it("preserves null lat/lng (does not coerce to 0)", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = reportFromDb({ id: "r", latitude: null, longitude: null } as any);
    expect(out.latitude).toBeNull();
    expect(out.longitude).toBeNull();
  });

  it("passes through numeric lat/lng including 0", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out = reportFromDb({ id: "r", latitude: 0, longitude: 0 } as any);
    expect(out.latitude).toBe(0);
    expect(out.longitude).toBe(0);
  });

  it("populates customer + claim fields when present", () => {
    const out = reportFromDb({
      id: "r",
      customer_name: "Jane",
      customer_email: "j@example.com",
      customer_phone: "555-0100",
      claim_status: "approved",
      approved_amount: 1200,
      denial_reason: undefined,
      claim_decision_date: "2026-05-10",
      insurance_claim: true,
      insurance_company: "Acme",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(out.customerName).toBe("Jane");
    expect(out.customerEmail).toBe("j@example.com");
    expect(out.customerPhone).toBe("555-0100");
    expect(out.claimStatus).toBe("approved");
    expect(out.approvedAmount).toBe(1200);
    expect(out.insuranceClaim).toBe(true);
    expect(out.insuranceCompany).toBe("Acme");
  });

  it("uses provided created_at; falls back to ISO now when missing", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fromGiven = reportFromDb({ id: "r", created_at: "2024-01-01T00:00:00.000Z" } as any);
    expect(fromGiven.createdAt).toBe("2024-01-01T00:00:00.000Z");
    expect(fromGiven.submittedAt).toBe("2024-01-01T00:00:00.000Z");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fallback = reportFromDb({ id: "r" } as any);
    expect(fallback.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

// ---------------------------------------------------------------------------
// reportToDb
// ---------------------------------------------------------------------------
describe("reportToDb", () => {
  it("prefers vehicleInfo over vehicle and parses year as int", () => {
    const out = reportToDb({
      id: "r",
      vehicleInfo: { year: "2020", make: "Toyota", model: "Camry" },
      vehicle: { year: "1999", make: "Other", model: "Other", vin: "" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(out.vehicle_make).toBe("Toyota");
    expect(out.vehicle_model).toBe("Camry");
    expect(out.vehicle_year).toBe(2020);
  });

  it("falls back to vehicle when vehicleInfo missing", () => {
    const out = reportToDb({
      id: "r",
      vehicle: { year: "2018", make: "Honda", model: "Civic", vin: "" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(out.vehicle_make).toBe("Honda");
    expect(out.vehicle_year).toBe(2018);
  });

  it("preserves null lat/lng and passes through photos", () => {
    const out = reportToDb({
      id: "r",
      latitude: null,
      longitude: null,
      photos: ["a.jpg", "b.jpg"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(out.latitude).toBeNull();
    expect(out.longitude).toBeNull();
    expect(out.photo_urls).toEqual(["a.jpg", "b.jpg"]);
  });
});

// ---------------------------------------------------------------------------
// buildReportPayload
// ---------------------------------------------------------------------------
describe("buildReportPayload", () => {
  const VALID_UUID = "11111111-2222-3333-8444-555555555555";

  it("includes id when value is UUID-like", () => {
    const out = buildReportPayload({ id: VALID_UUID });
    expect(out.id).toBe(VALID_UUID);
    expect("client_request_id" in out).toBe(false);
  });

  it("converts non-UUID id to client_request_id (idempotent submit key)", () => {
    const out = buildReportPayload({ id: "client-tmp-abc" });
    expect("id" in out).toBe(false);
    expect(out.client_request_id).toBe("client-tmp-abc");
  });

  it("respects explicit client_request_id (snake or camel)", () => {
    expect(buildReportPayload({ clientRequestId: "x" }).client_request_id).toBe("x");
    expect(buildReportPayload({ client_request_id: "y" }).client_request_id).toBe("y");
  });

  it("only forwards vehicle_id when UUID-like", () => {
    expect(buildReportPayload({ vehicleId: VALID_UUID }).vehicle_id).toBe(VALID_UUID);
    expect(buildReportPayload({ vehicle_id: VALID_UUID }).vehicle_id).toBe(VALID_UUID);
    expect(buildReportPayload({ vehicleId: "not-a-uuid" }).vehicle_id).toBeUndefined();
  });

  it("type-guards lat/long: numbers pass through, non-numbers become null", () => {
    expect(buildReportPayload({ latitude: 33, longitude: -84 }).latitude).toBe(33);
    expect(buildReportPayload({ latitude: 33, longitude: -84 }).longitude).toBe(-84);
    expect(buildReportPayload({ latitude: "33" }).latitude).toBeNull();
    expect(buildReportPayload({}).latitude).toBeNull();
  });

  it("supports both camel and snake fallbacks for shared fields", () => {
    const camel = buildReportPayload({
      vehicle: { make: "Honda", model: "Civic", year: "2020" },
      damageArea: "rear",
      description: "scratched",
      zipCode: "30303",
      photos: ["a"],
      insuranceClaim: true,
      incident: "lot",
    });
    expect(camel.vehicle_make).toBe("Honda");
    expect(camel.damage_type).toBe("rear");
    expect(camel.damage_description).toBe("scratched");
    expect(camel.zip_code).toBe("30303");
    expect(camel.photo_urls).toEqual(["a"]);
    expect(camel.insurance_claim).toBe(true);
    expect(camel.additional_notes).toBe("lot");

    const snake = buildReportPayload({
      vehicle_make: "Honda",
      damage_type: "rear",
      damage_description: "scratched",
      zip_code: "30303",
      photo_urls: ["a"],
      insurance_claim: false,
      additional_notes: "lot",
    });
    expect(snake.vehicle_make).toBe("Honda");
    expect(snake.damage_type).toBe("rear");
    expect(snake.zip_code).toBe("30303");
    expect(snake.insurance_claim).toBe(false);
  });

  it("applies sane defaults: damage_severity='moderate', preferred_contact='email', status='pending', damage_type='unknown'", () => {
    const out = buildReportPayload({});
    expect(out.damage_severity).toBe("moderate");
    expect(out.preferred_contact).toBe("email");
    expect(out.status).toBe("pending");
    expect(out.damage_type).toBe("unknown");
  });
});

// ---------------------------------------------------------------------------
// bidFromDb
// ---------------------------------------------------------------------------
describe("bidFromDb — shopId fallback chain", () => {
  it("prefers clerk_shop_user_id over shop_id over shop_user_id", () => {
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bidFromDb({ clerk_shop_user_id: "A", shop_id: "B", shop_user_id: "C" } as any).shopId
    ).toBe("A");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(bidFromDb({ shop_id: "B", shop_user_id: "C" } as any).shopId).toBe("B");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(bidFromDb({ shop_user_id: "C" } as any).shopId).toBe("C");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(bidFromDb({} as any).shopId).toBe("");
  });

  it("derives reportId from damage_report_id, falls back to report_id", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(bidFromDb({ damage_report_id: "rep1" } as any).reportId).toBe("rep1");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(bidFromDb({ report_id: "rep2" } as any).reportId).toBe("rep2");
  });

  it("uses provided created_at; falls back to ISO now when missing", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(bidFromDb({ created_at: "2024-01-01T00:00:00.000Z" } as any).createdAt).toBe(
      "2024-01-01T00:00:00.000Z"
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(bidFromDb({} as any).createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("passes through optional shop enrichment fields", () => {
    const b = bidFromDb({
      shop_rating: 4.7,
      shop_reviews: 120,
      shop_distance: 3.2,
      shop_latitude: 33.7,
      shop_longitude: -84.4,
      shop_phone: "555-0100",
      shop_address: "1 Main",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(b.shopRating).toBe(4.7);
    expect(b.shopReviews).toBe(120);
    expect(b.shopDistance).toBe(3.2);
    expect(b.shopLatitude).toBe(33.7);
    expect(b.shopLongitude).toBe(-84.4);
    expect(b.shopPhone).toBe("555-0100");
    expect(b.shopAddress).toBe("1 Main");
  });
});

// ---------------------------------------------------------------------------
// vehicleFromDb / vehicleToDb roundtrip
// ---------------------------------------------------------------------------
describe("vehicle adapters", () => {
  it("vehicleFromDb maps license_plate → licensePlate", () => {
    const out = vehicleFromDb({
      id: "v1",
      year: 2020,
      make: "Toyota",
      model: "Camry",
      vin: "JT123",
      license_plate: "ABC-123",
      color: "blue",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(out.licensePlate).toBe("ABC-123");
  });

  it("vehicleToDb maps licensePlate → license_plate; omits empty id", () => {
    const out = vehicleToDb({
      id: "",
      year: 2020,
      make: "Toyota",
      model: "Camry",
      vin: "JT123",
      licensePlate: "ABC-123",
      color: "blue",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(out.license_plate).toBe("ABC-123");
    expect(out.id).toBeUndefined();
  });

  it("roundtrip preserves identity fields", () => {
    const app = {
      id: "v1",
      year: 2021,
      make: "Honda",
      model: "Civic",
      vin: "1HG",
      licensePlate: "XYZ-789",
      color: "red",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const back = vehicleFromDb(vehicleToDb(app as any) as any);
    expect(back).toEqual(app);
  });
});

// ---------------------------------------------------------------------------
// jobAssignmentFromDb
// ---------------------------------------------------------------------------
describe("jobAssignmentFromDb", () => {
  it("maps snake_case → camelCase and preserves nested report/bid", () => {
    const report = { id: "r1" };
    const bid = { id: "b1" };
    const out = jobAssignmentFromDb({
      id: "j1",
      damage_report_id: "r1",
      bid_id: "b1",
      shop_clerk_user_id: "user_shop",
      customer_clerk_user_id: "user_cust",
      status: "active",
      created_at: "2026-05-09T00:00:00.000Z",
      updated_at: "2026-05-09T00:00:00.000Z",
      report,
      bid,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(out.damageReportId).toBe("r1");
    expect(out.bidId).toBe("b1");
    expect(out.shopClerkUserId).toBe("user_shop");
    expect(out.customerClerkUserId).toBe("user_cust");
    expect(out.report).toBe(report);
    expect(out.bid).toBe(bid);
  });
});

// ---------------------------------------------------------------------------
// activityEventFromDb
// ---------------------------------------------------------------------------
describe("activityEventFromDb", () => {
  it("maps event_type/source/actor_id/object_id/outcome/created_at → camelCase", () => {
    const out = activityEventFromDb({
      id: "e1",
      event_type: "bid.created",
      source: "edge",
      actor_id: "user_shop",
      object_id: "bid_123",
      outcome: "ok",
      created_at: "2026-05-09T00:00:00.000Z",
    });
    expect(out).toEqual({
      id: "e1",
      eventType: "bid.created",
      source: "edge",
      actorId: "user_shop",
      objectId: "bid_123",
      outcome: "ok",
      createdAt: "2026-05-09T00:00:00.000Z",
    });
  });
});
