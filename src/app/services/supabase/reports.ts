import { projectId, publicAnonKey } from "../../../../utils/supabase/info";
import { supabase } from "./client";
import type { DamageReport } from "./types";

export async function getDamageReports(): Promise<DamageReport[]> {
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
    return data as DamageReport[];
  } catch (error) {
    console.error("Error in getDamageReports:", error);
    return [];
  }
}

export async function getAllDamageReports(): Promise<DamageReport[]> {
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
    return data as DamageReport[];
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

    if (report.id) {
      console.log("📝 Updating damage report:", report.id);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f243523/reports/${report.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            clerkUserId,
            report: {
              vehicle_id: report.vehicle_id,
              vehicle_make: report.vehicle_make,
              vehicle_model: report.vehicle_model,
              vehicle_year: report.vehicle_year,
              damage_type: report.damage_type,
              damage_severity: report.damage_severity,
              damage_description: report.damage_description,
              damage_location: report.damage_location,
              address: report.address,
              city: report.city,
              state: report.state,
              zip_code: report.zip_code,
              photo_urls: report.photo_urls || [],
              insurance_claim: report.insurance_claim,
              insurance_company: report.insurance_company,
              preferred_contact: report.preferred_contact,
              additional_notes: report.additional_notes,
              status: report.status || "pending"
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Failed to update damage report:", errorData);
        return null;
      }

      const result = await response.json();
      console.log("✅ Damage report updated successfully");
      return result.report as DamageReport;
    }

    console.log("📝 Creating new damage report for user:", clerkUserId);

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9f243523/reports`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({
          clerkUserId,
          report: {
            vehicle_id: report.vehicle_id,
            vehicle_make: report.vehicle_make,
            vehicle_model: report.vehicle_model,
            vehicle_year: report.vehicle_year,
            damage_type: report.damage_type,
            damage_severity: report.damage_severity,
            damage_description: report.damage_description,
            damage_location: report.damage_location,
            address: report.address,
            city: report.city,
            state: report.state,
            zip_code: report.zip_code,
            photo_urls: report.photo_urls || [],
            insurance_claim: report.insurance_claim,
            insurance_company: report.insurance_company,
            preferred_contact: report.preferred_contact,
            additional_notes: report.additional_notes,
            status: report.status || "pending"
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Failed to save report:", errorData.error || "Unknown error");
      throw new Error(errorData.error || "Failed to save report");
    }

    const result = await response.json();
    console.log("✅ Damage report created successfully");
    return result.report as DamageReport;
  } catch (error) {
    console.error("Error in saveDamageReport:", error);
    throw error;
  }
}

export async function deleteDamageReport(reportId: string): Promise<boolean> {
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
