import type { Vehicle, DamageReport, RedirectInfo } from "../types";
import {
  getVehicles,
  saveProfile,
  saveVehicle,
  saveDamageReport,
} from "../services/supabaseService";
import { buildSupabaseReportPayload } from "./userDataUtils";

/** Save user profile to Supabase. Returns true on success. */
export async function saveProfileToCloud(params: {
  email: string;
  name: string;
  phone: string;
  profileImage: string;
  accountType: RedirectInfo["type"];
  clerkUserId?: string;
  websiteUserKey?: string;
}): Promise<boolean> {
  const isCloudUrl =
    params.profileImage &&
    (params.profileImage.startsWith("http://") || params.profileImage.startsWith("https://"));

  const success = await saveProfile(
    {
      email: params.email,
      name: params.name,
      phone: params.phone,
      profile_image_url: isCloudUrl ? params.profileImage : undefined,
      account_type: params.accountType,
    },
    {
      clerkUserId: params.clerkUserId,
      email: params.email,
      websiteUserKey: params.websiteUserKey,
    }
  );

  if (success) {
    console.log("✅ Profile saved to Supabase");
  }
  return Boolean(success);
}

/**
 * Save vehicles to Supabase and return the refreshed list.
 * Returns the updated vehicles array, or null on failure.
 */
export async function saveVehiclesToCloud(
  vehiclesData: Vehicle[],
  clerkUserId: string
): Promise<Vehicle[] | null> {
  try {
    for (const vehicle of vehiclesData) {
      await saveVehicle(vehicle, clerkUserId);
    }
    const updatedVehicles = await getVehicles(clerkUserId);
    console.log("✅ Vehicles saved to Supabase");
    return updatedVehicles;
  } catch (error) {
    console.error("❌ Error saving vehicles:", error);
    return null;
  }
}

/** Save reports to Supabase. Returns true on success. */
export async function saveReportsToCloud(
  reportsData: DamageReport[],
  clerkUserId: string
): Promise<boolean> {
  try {
    for (const report of reportsData) {
      await saveDamageReport(buildSupabaseReportPayload(report), clerkUserId);
    }
    console.log("✅ Reports saved to Supabase");
    return true;
  } catch (error) {
    console.error("❌ Error saving reports:", error);
    return false;
  }
}
