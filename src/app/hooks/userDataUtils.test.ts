import { describe, expect, it } from "vitest";
import {
  toFrontendVehicle,
  toSupabaseVehicle,
  toFrontendBid,
  isUuidLike,
  normalizeEmail,
  getUserCacheKey,
  buildPhotoStorageFromReports,
  transformSupabaseReport,
  buildSupabaseReportPayload,
} from "./userDataUtils";

describe("toFrontendVehicle", () => {
  it("maps all Supabase fields to frontend shape", () => {
    const result = toFrontendVehicle({
      id: "v-123",
      make: "Toyota",
      model: "Camry",
      year: 2023,
      vin: "1HGCG5655WA014344",
      license_plate: "ABC1234",
      color: "Blue",
    });
    expect(result).toEqual({
      id: "v-123",
      year: "2023",
      make: "Toyota",
      model: "Camry",
      vin: "1HGCG5655WA014344",
      licensePlate: "ABC1234",
      color: "Blue",
    });
  });

  it("defaults id to empty string when undefined", () => {
    const result = toFrontendVehicle({ make: "Ford", model: "F-150", year: 2024 });
    expect(result.id).toBe("");
  });

  it("converts numeric year to string", () => {
    const result = toFrontendVehicle({ make: "Honda", model: "Civic", year: 0 });
    expect(result.year).toBe("0");
  });
});

describe("toSupabaseVehicle", () => {
  it("maps frontend fields to Supabase shape", () => {
    const result = toSupabaseVehicle({
      id: "v-456",
      make: "Honda",
      model: "Civic",
      year: "2022",
      vin: "ABC123",
      licensePlate: "XYZ789",
      color: "Red",
    });
    expect(result).toEqual({
      id: "v-456",
      make: "Honda",
      model: "Civic",
      year: 2022,
      vin: "ABC123",
      license_plate: "XYZ789",
      color: "Red",
    });
  });

  it("parses non-numeric year as 0", () => {
    const result = toSupabaseVehicle({ id: "", make: "X", model: "Y", year: "not-a-year" });
    expect(result.year).toBe(0);
  });

  it("sets id to undefined when empty", () => {
    const result = toSupabaseVehicle({ id: "", make: "X", model: "Y", year: "2020" });
    expect(result.id).toBeUndefined();
  });
});

describe("toFrontendBid", () => {
  it("maps Supabase bid to frontend shape", () => {
    const result = toFrontendBid({
      id: "bid-1",
      shop_id: "shop-1",
      shop_name: "Quick Fix Auto",
      shop_email: "quick@fix.com",
      damage_report_id: "report-1",
      amount: 1500,
      estimated_days: 5,
      description: "Full repair including paint",
      status: "pending",
      created_at: "2026-01-01T00:00:00Z",
      shop_rating: 4.8,
      shop_reviews: 120,
      shop_distance: "3.2 mi",
    });
    expect(result.id).toBe("bid-1");
    expect(result.shopId).toBe("shop-1");
    expect(result.shopName).toBe("Quick Fix Auto");
    expect(result.reportId).toBe("report-1");
    expect(result.amount).toBe(1500);
    expect(result.estimatedDays).toBe(5);
    expect(result.shopRating).toBe(4.8);
    expect(result.shopReviews).toBe(120);
    expect(result.shopDistance).toBe("3.2 mi");
  });

  it("falls back through shop_user_id and clerk_shop_user_id", () => {
    const result = toFrontendBid({
      id: "bid-2",
      clerk_shop_user_id: "clerk-shop-1",
      amount: 800,
      estimated_days: 3,
      status: "accepted",
    });
    expect(result.shopId).toBe("clerk-shop-1");
  });

  it("defaults missing strings to empty", () => {
    const result = toFrontendBid({
      id: "bid-3",
      amount: 500,
      estimated_days: 2,
      status: "rejected",
    });
    expect(result.shopId).toBe("");
    expect(result.shopName).toBe("");
    expect(result.shopEmail).toBe("");
    expect(result.reportId).toBe("");
    expect(result.description).toBe("");
  });

  it("treats null rating/reviews/distance as undefined", () => {
    const result = toFrontendBid({
      id: "bid-4",
      amount: 100,
      estimated_days: 1,
      status: "pending",
      shop_rating: null,
      shop_reviews: null,
      shop_distance: null,
    });
    expect(result.shopRating).toBeUndefined();
    expect(result.shopReviews).toBeUndefined();
    expect(result.shopDistance).toBeUndefined();
  });
});

describe("isUuidLike", () => {
  it("recognizes valid UUID v4", () => {
    expect(isUuidLike("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("recognizes uppercase UUID", () => {
    expect(isUuidLike("550E8400-E29B-41D4-A716-446655440000")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isUuidLike("")).toBe(false);
  });

  it("rejects null/undefined", () => {
    expect(isUuidLike(null)).toBe(false);
    expect(isUuidLike(undefined)).toBe(false);
  });

  it("rejects non-UUID strings", () => {
    expect(isUuidLike("not-a-uuid")).toBe(false);
    expect(isUuidLike("12345")).toBe(false);
  });

  it("rejects UUID with wrong version digit", () => {
    expect(isUuidLike("550e8400-e29b-91d4-a716-446655440000")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("lowercases email", () => {
    expect(normalizeEmail("User@Example.COM")).toBe("user@example.com");
  });

  it("returns empty string for undefined", () => {
    expect(normalizeEmail(undefined)).toBe("");
  });

  it("returns empty string for empty string", () => {
    expect(normalizeEmail("")).toBe("");
  });
});

describe("getUserCacheKey", () => {
  it("uses explicit websiteUserKey when provided", () => {
    expect(getUserCacheKey("test@test.com", "website-user-abc")).toBe(
      "bidondent_user:website-user-abc"
    );
  });

  it("falls back to normalized email", () => {
    expect(getUserCacheKey("User@Test.com")).toBe("bidondent_user:user@test.com");
  });

  it("returns base key when no email", () => {
    expect(getUserCacheKey(undefined)).toBe("bidondent_user");
  });

  it("returns base key for empty email", () => {
    expect(getUserCacheKey("")).toBe("bidondent_user");
  });
});

describe("buildPhotoStorageFromReports", () => {
  it("builds map of report IDs to photo arrays", () => {
    const reports = [
      { id: "r1", photos: ["photo1.jpg", "photo2.jpg"] },
      { id: "r2", photos: ["photo3.jpg"] },
    ] as any[];
    const result = buildPhotoStorageFromReports(reports);
    expect(result).toEqual({
      r1: ["photo1.jpg", "photo2.jpg"],
      r2: ["photo3.jpg"],
    });
  });

  it("skips reports with no photos", () => {
    const reports = [
      { id: "r1", photos: [] },
      { id: "r2", photos: ["photo.jpg"] },
    ] as any[];
    const result = buildPhotoStorageFromReports(reports);
    expect(result).toEqual({ r2: ["photo.jpg"] });
  });

  it("skips reports with no id", () => {
    const reports = [{ photos: ["photo.jpg"] }] as any[];
    const result = buildPhotoStorageFromReports(reports);
    expect(result).toEqual({});
  });

  it("returns empty object for empty array", () => {
    expect(buildPhotoStorageFromReports([])).toEqual({});
  });
});

describe("transformSupabaseReport", () => {
  it("maps all fields from Supabase to frontend shape", () => {
    const report = {
      id: "r-1",
      vehicle_id: "v-1",
      vehicle_make: "Toyota",
      vehicle_model: "Camry",
      vehicle_year: 2023,
      damage_location: "front bumper",
      damage_type: "dent",
      damage_description: "Minor dent from fender bender",
      photo_urls: ["url1.jpg", "url2.jpg"],
      additional_notes: "Happened in parking lot",
      address: "123 Main St",
      city: "Yonkers",
      state: "NY",
      zip_code: "10701",
      status: "submitted",
      created_at: "2026-01-15T10:00:00Z",
    };
    const result = transformSupabaseReport(report as any);

    expect(result.id).toBe("r-1");
    expect(result.vehicleId).toBe("v-1");
    expect(result.vehicleInfo.make).toBe("Toyota");
    expect(result.vehicleInfo.model).toBe("Camry");
    expect(result.vehicleInfo.year).toBe("2023");
    expect(result.damageArea).toBe("front bumper");
    expect(result.damageAreas).toEqual(["front bumper"]);
    expect(result.description).toBe("Minor dent from fender bender");
    expect(result.photos).toEqual(["url1.jpg", "url2.jpg"]);
    expect(result.incident).toBe("Happened in parking lot");
    expect(result.status).toBe("submitted");
    expect(result.address).toBe("123 Main St");
    expect(result.city).toBe("Yonkers");
    expect(result.state).toBe("NY");
  });

  it("provides fallback values for missing fields", () => {
    const result = transformSupabaseReport({} as any);
    expect(result.id).toBe("");
    expect(result.vehicleId).toBe("");
    expect(result.vehicleInfo.make).toBe("");
    expect(result.damageArea).toBe("unknown");
    expect(result.photos).toEqual([]);
    expect(result.description).toBe("");
    expect(result.status).toBe("pending");
  });

  it("uses damage_type as fallback when damage_location is missing", () => {
    const result = transformSupabaseReport({ damage_type: "scratch" } as any);
    expect(result.damageArea).toBe("scratch");
    expect(result.damageAreas).toEqual(["scratch"]);
  });
});

describe("buildSupabaseReportPayload", () => {
  it("maps frontend report to Supabase shape", () => {
    const report = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      vehicle: { make: "Honda", model: "Civic", year: "2022" },
      vehicleId: "v-1",
      damageArea: "rear bumper",
      description: "Paint scratch",
      address: "456 Oak Ave",
      city: "White Plains",
      state: "NY",
      zipCode: "10601",
      photos: ["img1.jpg"],
      insurance_claim: true,
      preferred_contact: "phone",
      incident: "Hit by shopping cart",
      status: "pending",
    };
    const result = buildSupabaseReportPayload(report);

    expect(result.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.vehicle_make).toBe("Honda");
    expect(result.vehicle_model).toBe("Civic");
    expect(result.vehicle_year).toBe(2022);
    expect(result.vehicle_id).toBe("v-1");
    expect(result.damage_type).toBe("rear bumper");
    expect(result.damage_description).toBe("Paint scratch");
    expect(result.photo_urls).toEqual(["img1.jpg"]);
    expect(result.additional_notes).toBe("Hit by shopping cart");
    expect(result.zip_code).toBe("10601");
  });

  it("omits id when not UUID-like", () => {
    const result = buildSupabaseReportPayload({ id: "new-draft" });
    expect(result.id).toBeUndefined();
  });

  it("provides defaults for missing fields", () => {
    const result = buildSupabaseReportPayload({});
    expect(result.vehicle_make).toBe("");
    expect(result.vehicle_model).toBe("");
    expect(result.vehicle_year).toBe(0);
    expect(result.damage_type).toBe("unknown");
    expect(result.damage_severity).toBe("moderate");
    expect(result.status).toBe("pending");
    expect(result.photo_urls).toEqual([]);
  });

  it("prefers vehicle nested object over flat fields", () => {
    const result = buildSupabaseReportPayload({
      vehicle: { make: "BMW", model: "X5", year: "2024" },
      vehicle_make: "OldMake",
    });
    expect(result.vehicle_make).toBe("BMW");
  });
});
