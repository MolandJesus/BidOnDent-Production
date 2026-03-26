import { supabase } from "./client";
import type { DamageReport } from "./types";
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

  if (identity?.clerkUserId || identity?.email || identity?.websiteUserKey) {
    let edgeError = null;
    let edgePayload = null;
    // Try edge function, retry once if fails
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const searchParams = buildWebsiteIdentityQuery(identity);
        const payload = await requestSupabaseEdge<{ reports?: DamageReport[] }>(
          `${SUPABASE_EDGE_ROUTES.reports}?${searchParams.toString()}`,
          {
            method: "GET",
          }
        );
        if (payload && Array.isArray(payload.reports)) {
          if (import.meta.env.DEV && attempt > 0) {
            console.log("[DEV] Edge function succeeded on retry");
          }
          return payload.reports;
        }
        edgePayload = payload;
      } catch (error) {
        edgeError = error;
        if (import.meta.env.DEV) {
          console.error(`[DEV] Edge function attempt ${attempt + 1} failed:`, error);
        }
      }
    }
    // Fallback to direct query if edge fails — try clerk_user_id first, then user_id
    if (import.meta.env.DEV) {
      console.warn("[DEV] Edge function failed, falling back to direct Supabase query");
    }
    try {
      // Try querying by clerk_user_id directly (most reports are saved this way)
      const clerkId = identity?.clerkUserId;
      if (clerkId) {
        const { data, error } = await supabase
          .from("damage_reports")
          .select("*")
          .eq("clerk_user_id", clerkId)
          .order("created_at", { ascending: false });
        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
        if (import.meta.env.DEV && error) {
          console.error("[DEV] Fallback clerk_user_id query error:", error);
        }
      }
      return [];
    } catch (fallbackError) {
      if (import.meta.env.DEV) {
        console.error("[DEV] Fallback Supabase query threw:", fallbackError);
      }
      return [];
    }
  }

  // No clerkUserId or identity provided — cannot fetch reports for Clerk-authenticated users
  if (import.meta.env.DEV) {
    console.warn("[DEV] getDamageReports: no clerkUserId available");
  }
  return { error: "no clerkUserId available" };
}

export async function getAllDamageReports(): Promise<DamageReport[]> {
  // Use the edge function (service-role) to bypass RLS and get all reports
  try {
    const payload = await requestSupabaseEdge<{ reports?: DamageReport[] }>(
      `${SUPABASE_EDGE_ROUTES.reports}/marketplace`,
      { method: "GET" }
    );
    if (payload && Array.isArray(payload.reports)) {
      if (import.meta.env.DEV) console.log(`[DEV] Loaded ${payload.reports.length} marketplace reports via edge`);
      return payload.reports;
    }
  } catch (edgeError) {
    if (import.meta.env.DEV) console.warn("[DEV] Marketplace edge failed, trying direct:", edgeError);
  }

  // Fallback: direct query (will only work if RLS allows it)
  try {
    const { data, error } = await supabase
      .from("damage_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST205" || error.code === "42P01") {
        if (import.meta.env.DEV) console.log("[DEV] Damage reports table not set up yet");
        return [];
      }
      if (import.meta.env.DEV) console.error("[DEV] Error fetching all damage reports:", error);
      return [];
    }

    if (import.meta.env.DEV) console.log(`[DEV] Loaded ${data.length} total damage reports`);
    return Array.isArray(data) ? (data as DamageReport[]) : [];
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error in getAllDamageReports:", error);
    return [];
  }
}

export async function saveDamageReport(
  report: DamageReport,
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
      },
    };

    const shouldUpdate = isUuidLike(report.id);

    const result = await requestSupabaseEdge<{ report: DamageReport }>(
      shouldUpdate ? `${SUPABASE_EDGE_ROUTES.reports}/${report.id}` : SUPABASE_EDGE_ROUTES.reports,
      {
        body: JSON.stringify(payload),
        method: shouldUpdate ? "PUT" : "POST",
      }
    );

    if (import.meta.env.DEV)
      console.log("[DEV]", shouldUpdate ? "Damage report updated" : "Damage report created");
    return result.report as DamageReport;
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
  try {
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
  } catch (error) {
    if (import.meta.env.DEV) console.error("[DEV] Error updating report status:", error);
    return false;
  }
}

export async function deleteDamageReport(
  reportId: string,
  clerkUserId?: string
): Promise<boolean> {
  if (clerkUserId) {
    try {
      const searchParams = new URLSearchParams({ clerkUserId });
      await requestSupabaseEdge<{ success: boolean }>(
        `${SUPABASE_EDGE_ROUTES.reports}/${reportId}?${searchParams.toString()}`,
        {
          method: "DELETE",
        }
      );
      return true;
    } catch (error) {
      if (import.meta.env.DEV) console.error("[DEV] Error in deleteDamageReport edge path:", error);
      return false;
    }
  }

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { error } = await supabase
      .from("damage_reports")
      .delete()
      .eq("id", reportId)
      .eq("user_id", user.id);

    if (error) {
      if (import.meta.env.DEV) console.error("[DEV] Error deleting damage report:", error);
      return false;
    }

    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error("[DEV] Error in deleteDamageReport:", error);
    return false;
  }
}
