import type { DamageReport, Vehicle } from "./types";
import {
  getDamageReports,
  saveDamageReport
} from "./reports";
import { getVehicles, saveVehicle } from "./vehicles";

export async function saveAccountTypeToSupabase(
  email: string,
  accountType: "customer" | "shop" | "insurer"
): Promise<boolean> {
  console.log("ℹ️ saveAccountTypeToSupabase is deprecated, use saveProfile instead");
  return true;
}

export async function loadAccountTypeFromSupabase(
  email: string
): Promise<"customer" | "shop" | "insurer" | null> {
  console.log("ℹ️ loadAccountTypeFromSupabase is deprecated, use getProfile instead");
  return null;
}

export async function saveProfileToSupabase(email: string, profileData: any): Promise<boolean> {
  console.log("ℹ️ saveProfileToSupabase is deprecated, use saveProfile instead");
  return true;
}

export async function loadProfileFromSupabase(email: string): Promise<any | null> {
  console.log("ℹ️ loadProfileFromSupabase is deprecated, use getProfile instead");
  return null;
}

export async function loadVehiclesFromSupabase(email: string): Promise<Vehicle[]> {
  console.log("ℹ️ loadVehiclesFromSupabase is deprecated, use getVehicles instead");
  return await getVehicles();
}

export async function saveVehiclesToSupabase(email: string, vehicles: Vehicle[]): Promise<boolean> {
  console.log("ℹ️ saveVehiclesToSupabase is deprecated, use saveVehicle for each vehicle");
  try {
    for (const vehicle of vehicles) {
      await saveVehicle(vehicle);
    }
    return true;
  } catch (error) {
    console.error("Error in saveVehiclesToSupabase:", error);
    return false;
  }
}

export async function loadReportsFromSupabase(email: string): Promise<DamageReport[]> {
  console.log("ℹ️ loadReportsFromSupabase is deprecated, use getDamageReports instead");
  return await getDamageReports();
}

export async function saveReportsToSupabase(
  email: string,
  reports: DamageReport[]
): Promise<boolean> {
  console.log("ℹ️ saveReportsToSupabase is deprecated, use saveDamageReport for each report");
  try {
    for (const report of reports) {
      await saveDamageReport(report);
    }
    return true;
  } catch (error) {
    console.error("Error in saveReportsToSupabase:", error);
    return false;
  }
}
