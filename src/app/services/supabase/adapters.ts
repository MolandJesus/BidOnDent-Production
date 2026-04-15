/**
 * adapters.ts — Canonical DB ↔ App domain transforms for launch-critical models.
 *
 * Every service read-path must run results through the appropriate `fromDb()` adapter
 * before returning data to hooks/components. This guarantees a clean snake_case → camelCase
 * boundary at the service layer.
 *
 * Write-path helpers (`toDb`, `buildReportPayload`) are also here for symmetry.
 */
import type {
  DamageReport as DbDamageReport,
  Bid as DbBid,
  Vehicle as DbVehicle,
} from "./types";
import type {
  DamageReport as AppDamageReport,
  Bid as AppBid,
  Vehicle as AppVehicle,
  JobAssignment as AppJobAssignment,
  ActivityEvent as AppActivityEvent,
} from "../../types";
import type { EnrichedJobAssignment } from "./workflow";

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

function normalizeReportStatus(value?: string): AppDamageReport["status"] {
  switch (value) {
    case "active":
    case "completed":
    case "in-review":
    case "resolved":
      return value;
    default:
      return "pending";
  }
}

/** Convert a DB DamageReport (snake_case) → App DamageReport (camelCase). */
export function reportFromDb(report: DbDamageReport): AppDamageReport {
  const damageArea = report.damage_location || report.damage_type || "unknown";
  const createdAt = report.created_at || new Date().toISOString();
  const zipCode = report.zip_code || "";

  return {
    id: report.id || "",
    vehicleId: report.vehicle_id || "",
    vehicleInfo: {
      year: report.vehicle_year?.toString() || "",
      make: report.vehicle_make || "",
      model: report.vehicle_model || "",
    },
    vehicle: {
      make: report.vehicle_make || "",
      model: report.vehicle_model || "",
      year: report.vehicle_year?.toString() || "",
      vin: "",
    },
    damageAreas: [damageArea],
    damageArea,
    photos: report.photo_urls || [],
    description: report.damage_description || "",
    damageDescription: report.damage_description || "",
    incident: report.additional_notes || "",
    address: report.address || "",
    city: report.city || "",
    state: report.state || "",
    zipCode,
    latitude: report.latitude ?? null,
    longitude: report.longitude ?? null,
    damageType: report.damage_type || "",
    damageSeverity: report.damage_severity || "",
    status: normalizeReportStatus(report.status),
    createdAt,
    submittedAt: createdAt,
    bidsCount: report.bids_count ?? 0,
    customerName: report.customer_name || undefined,
    customerEmail: report.customer_email || undefined,
    customerPhone: report.customer_phone || undefined,
    claimStatus: report.claim_status || undefined,
    approvedAmount: report.approved_amount ?? undefined,
    denialReason: report.denial_reason || undefined,
    claimDecisionDate: report.claim_decision_date || undefined,
    insuranceClaim: report.insurance_claim ?? undefined,
    insuranceCompany: report.insurance_company || undefined,
  };
}

/** Convert an App DamageReport back to DB shape (for map rendering that still needs DB shape). */
export function reportToDb(report: AppDamageReport): DbDamageReport {
  return {
    id: report.id,
    user_id: undefined,
    vehicle_id: report.vehicleId || undefined,
    vehicle_make: report.vehicleInfo?.make || report.vehicle?.make || "",
    vehicle_model: report.vehicleInfo?.model || report.vehicle?.model || "",
    vehicle_year: parseInt(report.vehicleInfo?.year || report.vehicle?.year || "0", 10),
    damage_type: report.damageType || report.damageArea || "unknown",
    damage_severity: report.damageSeverity || "",
    damage_description: report.damageDescription || report.description || "",
    damage_location: report.damageArea || "",
    address: report.address || "",
    city: report.city || "",
    state: report.state || "",
    zip_code: report.zipCode || "",
    latitude: report.latitude ?? null,
    longitude: report.longitude ?? null,
    photo_urls: report.photos || [],
    status: report.status || "pending",
    created_at: report.createdAt || "",
    customer_name: report.customerName || null,
    customer_email: report.customerEmail || null,
    customer_phone: report.customerPhone || null,
    bids_count: report.bidsCount || 0,
    insurance_claim: report.insuranceClaim,
    insurance_company: report.insuranceCompany,
    claim_status: report.claimStatus,
    approved_amount: report.approvedAmount,
    denial_reason: report.denialReason,
    claim_decision_date: report.claimDecisionDate,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- accepts both frontend and Supabase report shapes
export function buildReportPayload(report: Record<string, any>) {
  const isUuidLike = (value?: string | null) =>
    Boolean(
      value &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    );

  return {
    ...(isUuidLike(report.id) ? { id: report.id } : {}),
    vehicle_make: report.vehicle?.make || report.vehicle_make || "",
    vehicle_model: report.vehicle?.model || report.vehicle_model || "",
    vehicle_year: parseInt(report.vehicle?.year || report.vehicle_year || "0", 10),
    vehicle_id: report.vehicleId || report.vehicle_id || undefined,
    damage_type: report.damageArea || report.damage_type || "unknown",
    damage_severity: report.damage_severity || report.damageSeverity || "moderate",
    damage_description: report.description || report.damage_description || "",
    damage_location: report.damageArea || report.damage_location || "",
    address: report.address || "",
    city: report.city || "",
    state: report.state || "",
    zip_code: report.zipCode || report.zip_code || "",
    latitude: typeof report.latitude === "number" ? report.latitude : null,
    longitude: typeof report.longitude === "number" ? report.longitude : null,
    photo_urls: report.photos || report.photo_urls || [],
    insurance_claim: report.insurance_claim ?? report.insuranceClaim ?? false,
    preferred_contact: report.preferred_contact || "email",
    additional_notes: report.incident || report.additional_notes || "",
    status: report.status || "pending",
  };
}

// ---------------------------------------------------------------------------
// Bids
// ---------------------------------------------------------------------------

/** Convert a DB Bid (snake_case) → App Bid (camelCase). */
export function bidFromDb(b: DbBid): AppBid {
  return {
    id: b.id || "",
    shopId: b.clerk_shop_user_id || b.shop_id || b.shop_user_id || "",
    shopName: b.shop_name || "",
    shopEmail: b.shop_email || "",
    reportId: b.damage_report_id || b.report_id || "",
    amount: b.amount,
    estimatedDays: b.estimated_days,
    description: b.description || "",
    status: b.status,
    createdAt: b.created_at || new Date().toISOString(),
    shopRating: b.shop_rating ?? undefined,
    shopReviews: b.shop_reviews ?? undefined,
    shopDistance: b.shop_distance ?? undefined,
    shopLatitude: b.shop_latitude ?? undefined,
    shopLongitude: b.shop_longitude ?? undefined,
    shopPhone: b.shop_phone ?? undefined,
    shopAddress: b.shop_address ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Vehicles
// ---------------------------------------------------------------------------

/** Convert a DB Vehicle (snake_case) → App Vehicle (camelCase). */
export function vehicleFromDb(v: DbVehicle): AppVehicle {
  return {
    id: v.id || "",
    year: v.year,
    make: v.make,
    model: v.model,
    vin: v.vin,
    licensePlate: v.license_plate,
    color: v.color,
  };
}

/** Convert an App Vehicle → DB Vehicle for saving. */
export function vehicleToDb(v: AppVehicle): DbVehicle {
  return {
    id: v.id || undefined,
    make: v.make,
    model: v.model,
    year: v.year,
    vin: v.vin,
    license_plate: v.licensePlate,
    color: v.color,
  };
}

// ---------------------------------------------------------------------------
// Job Assignments
// ---------------------------------------------------------------------------

/** Convert a DB EnrichedJobAssignment → App JobAssignment. */
export function jobAssignmentFromDb(ja: EnrichedJobAssignment): AppJobAssignment {
  return {
    id: ja.id,
    damageReportId: ja.damage_report_id,
    bidId: ja.bid_id,
    shopClerkUserId: ja.shop_clerk_user_id,
    customerClerkUserId: ja.customer_clerk_user_id,
    status: ja.status,
    createdAt: ja.created_at,
    updatedAt: ja.updated_at,
    report: ja.report,
    bid: ja.bid,
  };
}

// ---------------------------------------------------------------------------
// Activity Events (admin)
// ---------------------------------------------------------------------------

/** Convert a DB-shaped activity event → App ActivityEvent. */
export function activityEventFromDb(e: {
  id: string;
  event_type: string;
  source?: string;
  actor_id?: string;
  object_id?: string;
  outcome?: string;
  created_at: string;
}): AppActivityEvent {
  return {
    id: e.id,
    eventType: e.event_type,
    source: e.source,
    actorId: e.actor_id,
    objectId: e.object_id,
    outcome: e.outcome,
    createdAt: e.created_at,
  };
}
