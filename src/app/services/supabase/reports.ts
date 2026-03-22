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
): Promise<DamageReport[]> {
  const identity = normalizeReportIdentity(identityOrClerkUserId);

  if (identity?.clerkUserId || identity?.email || identity?.websiteUserKey) {
    try {
      const searchParams = buildWebsiteIdentityQuery(identity);
      const payload = await requestSupabaseEdge<{ reports?: DamageReport[] }>(
        `${SUPABASE_EDGE_ROUTES.reports}?${searchParams.toString()}`,
        {
          method: "GET",
        }
      );

      return payload.reports || [];
    } catch (error) {
      console.error("Error in getDamageReports edge path:", error);
      return [];
    }
  }

  try {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("ℹ️ No authenticated user");
      return [];
    }

    const { data, error } = await supabase
      .from("damage_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST205" || error.code === "42P01") {
        console.log("ℹ️ Damage reports table not set up yet - using local storage");
        return [];
      }
      console.error("Error fetching damage reports:", error);
      return [];
    }

    console.log(`✅ Loaded ${data.length} damage reports from Supabase`);
    return Array.isArray(data) ? (data as DamageReport[]) : [];
  } catch (error) {
    console.error("Error in getDamageReports:", error);
    return [];
  }
}

export async function getAllDamageReports(): Promise<DamageReport[]> {
  try {
    const { data, error } = await supabase
      .from("damage_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST205" || error.code === "42P01") {
        console.log("ℹ️ Damage reports table not set up yet - using local storage");
        return [];
      }
      console.error("Error fetching all damage reports:", error);
      return [];
    }

    console.log(`✅ Loaded ${data.length} total damage reports from Supabase`);
    return Array.isArray(data) ? (data as DamageReport[]) : [];
  } catch (error) {
    console.error("Error in getAllDamageReports:", error);
    return [];
  }
}

export async function saveDamageReport(
  report: DamageReport,
  clerkUserId?: string
): Promise<DamageReport | null> {
  try {
    if (!clerkUserId) {
      console.warn("⚠️ No Clerk user ID provided to saveDamageReport");
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

    console.log(
      shouldUpdate
        ? "✅ Damage report updated successfully"
        : "✅ Damage report created successfully"
    );
    return result.report as DamageReport;
  } catch (error) {
    console.error("Error in saveDamageReport:", error);
    throw error;
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
      console.error("Error in deleteDamageReport edge path:", error);
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
      console.error("Error deleting damage report:", error);
      return false;
    }

    console.log("✅ Damage report deleted from Supabase");
    return true;
  } catch (error) {
    console.error("Error in deleteDamageReport:", error);
    return false;
  }
}
