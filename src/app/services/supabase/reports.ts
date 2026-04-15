import type { DamageReport as DbDamageReport } from "./types";
import type { DamageReport } from "../../types";
import { reportFromDb } from "./adapters";
import {
  buildWebsiteIdentityQuery,
  requestSupabaseEdge,
  SUPABASE_EDGE_ROUTES,
} from "./runtime";
import type { WebsiteProfileIdentity } from "./profiles";

function isUuidLike(value?: string | null) {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function normalizeReportIdentity(
  identityOrClerkUserId?: string | WebsiteProfileIdentity | null
): WebsiteProfileIdentity | null {
  if (!identityOrClerkUserId) {
    return null;
  }

  if (typeof identityOrClerkUserId !== "string") {
    return identityOrClerkUserId;
  }

  if (identityOrClerkUserId.includes("@")) {
    return { email: identityOrClerkUserId };
  }

  if (identityOrClerkUserId.startsWith("website-user-")) {
    return { websiteUserKey: identityOrClerkUserId };
  }

  return { clerkUserId: identityOrClerkUserId };
}

export async function getDamageReports(
  identityOrClerkUserId?: string | WebsiteProfileIdentity | null
): Promise<DamageReport[] | { error: string }> {
  const identity = normalizeReportIdentity(identityOrClerkUserId);

  if (!identity?.clerkUserId && !identity?.email && !identity?.websiteUserKey) {
    if (import.meta.env.DEV) {
      console.warn("[DEV] getDamageReports: no identity available");
    }
    return { error: "no identity available" };
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const searchParams = buildWebsiteIdentityQuery(identity);
      const payload = await requestSupabaseEdge<{ reports?: DbDamageReport[] }>(
        `${SUPABASE_EDGE_ROUTES.reports}?${searchParams.toString()}`,
        {
          method: "GET",
        }
      );
      if (payload && Array.isArray(payload.reports)) {
        if (import.meta.env.DEV && attempt > 0) {
          console.log("[DEV] Edge function succeeded on retry");
        }
        return payload.reports.map(reportFromDb);
      }
      return [];
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`[DEV] Edge function attempt ${attempt + 1} failed:`, error);
      }
    }
  }

  return { error: "Failed to fetch reports after 2 attempts" };
}

export async function getAllDamageReports(): Promise<DamageReport[]> {
  const payload = await requestSupabaseEdge<{ reports?: DbDamageReport[] }>(
    `${SUPABASE_EDGE_ROUTES.reports}/marketplace`,
    { method: "GET" }
  );
  if (payload && Array.isArray(payload.reports)) {
    if (import.meta.env.DEV) console.log(`[DEV] Loaded ${payload.reports.length} marketplace reports via edge`);
    return payload.reports.map(reportFromDb);
  }
  return [];
}

export async function saveDamageReport(
  report: DbDamageReport,
  clerkUserId?: string
): Promise<DamageReport | null> {
  try {
    if (!clerkUserId) {
      if (import.meta.env.DEV) console.warn("⚠️ No Clerk user ID provided to saveDamageReport");
      return null;
    }

    const payload = {
      clerkUserId,
      report: {
        address: report.address,
        additional_notes: report.additional_notes,
        city: report.city,
        damage_description: report.damage_description,
        damage_location: report.damage_location,
        damage_severity: report.damage_severity,
        damage_type: report.damage_type,
        insurance_claim: report.insurance_claim,
        insurance_company: report.insurance_company,
        photo_urls: report.photo_urls || [],
        preferred_contact: report.preferred_contact,
        state: report.state,
        status: report.status || "pending",
        vehicle_id: report.vehicle_id,
        vehicle_make: report.vehicle_make,
        vehicle_model: report.vehicle_model,
        vehicle_year: report.vehicle_year,
        zip_code: report.zip_code,
        latitude: report.latitude ?? null,
        longitude: report.longitude ?? null,
      },
    };

    const shouldUpdate = isUuidLike(report.id);

    const result = await requestSupabaseEdge<{ report: DbDamageReport }>(
      shouldUpdate ? `${SUPABASE_EDGE_ROUTES.reports}/${report.id}` : SUPABASE_EDGE_ROUTES.reports,
      {
        body: JSON.stringify(payload),
        method: shouldUpdate ? "PUT" : "POST",
      }
    );

    if (import.meta.env.DEV)
      console.log("[DEV]", shouldUpdate ? "Damage report updated" : "Damage report created");
    return result?.report ? reportFromDb(result.report) : null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("[DEV] Error in saveDamageReport:", error);
    throw error;
  }
}

export async function updateReportStatus(
  reportId: string,
  status: string,
  clerkUserId: string
): Promise<boolean> {
  await requestSupabaseEdge(
    `${SUPABASE_EDGE_ROUTES.reports}/${reportId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        clerkUserId,
        report: { status },
      }),
    }
  );
  return true;
}

export async function updateClaimDecision(
  reportId: string,
  decision: "approved" | "denied",
  options: { approvedAmount?: number; denialReason?: string }
): Promise<boolean> {
  await requestSupabaseEdge(SUPABASE_EDGE_ROUTES.claimDecision, {
    method: "POST",
    body: JSON.stringify({
      reportId,
      decision,
      approvedAmount: options.approvedAmount ?? null,
      denialReason: options.denialReason ?? null,
    }),
  });
  return true;
}

export async function submitInsuranceClaim(
  reportId: string,
  claimData: {
    policyNumber?: string;
    incidentDate?: string;
    damageDescription?: string;
    estimatedAmount?: number;
    priority?: string;
    shopClerkUserId?: string;
  }
): Promise<boolean> {
  await requestSupabaseEdge(SUPABASE_EDGE_ROUTES.claimSubmission, {
    method: "POST",
    body: JSON.stringify({
      reportId,
      policyNumber: claimData.policyNumber ?? null,
      incidentDate: claimData.incidentDate ?? null,
      damageDescription: claimData.damageDescription ?? null,
      estimatedAmount: claimData.estimatedAmount ?? null,
      priority: claimData.priority ?? "medium",
      shopClerkUserId: claimData.shopClerkUserId ?? null,
    }),
  });
  return true;
}

export async function deleteDamageReport(
  reportId: string,
  clerkUserId?: string
): Promise<boolean> {
  if (!clerkUserId) {
    if (import.meta.env.DEV) {
      console.warn("[DEV] deleteDamageReport: missing Clerk user ID");
    }
    return false;
  }

  const searchParams = new URLSearchParams({ clerkUserId });
  await requestSupabaseEdge<{ success: boolean }>(
    `${SUPABASE_EDGE_ROUTES.reports}/${reportId}?${searchParams.toString()}`,
    {
      method: "DELETE",
    }
  );
  return true;
}
