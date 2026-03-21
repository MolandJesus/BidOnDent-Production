import { supabase } from "./client";
import type { Vehicle } from "./types";
import {
  buildWebsiteIdentityQuery,
  requestSupabaseEdge,
  SUPABASE_EDGE_ROUTES,
} from "./runtime";
import type { WebsiteProfileIdentity } from "./profiles";

function normalizeVehicleIdentity(
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

export async function getVehicles(
  identityOrClerkUserId?: string | WebsiteProfileIdentity | null
): Promise<Vehicle[]> {
  const identity = normalizeVehicleIdentity(identityOrClerkUserId);

  if (identity?.clerkUserId || identity?.email || identity?.websiteUserKey) {
    try {
      const searchParams = buildWebsiteIdentityQuery(identity);
      const payload = await requestSupabaseEdge<{ vehicles?: Vehicle[] }>(
        `${SUPABASE_EDGE_ROUTES.vehicles}?${searchParams.toString()}`,
        {
          method: "GET",
        }
      );

      return payload.vehicles || [];
    } catch (error) {
      console.error("Error in getVehicles edge path:", error);
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
      .from("vehicles")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST205" || error.code === "42P01") {
        console.log("ℹ️ Vehicles table not set up yet - using local storage");
        return [];
      }
      console.error("Error fetching vehicles:", error);
      return [];
    }

    console.log(`✅ Loaded ${data.length} vehicles from Supabase`);
    return data as Vehicle[];
  } catch (error) {
    console.error("Error in getVehicles:", error);
    return [];
  }
}

export async function saveVehicle(vehicle: Vehicle, clerkUserId?: string): Promise<boolean> {
  if (clerkUserId) {
    try {
      await requestSupabaseEdge<{ success: boolean }>(SUPABASE_EDGE_ROUTES.vehicles, {
        body: JSON.stringify({
          clerkUserId,
          vehicle,
        }),
        method: "POST",
      });
      return true;
    } catch (error) {
      console.error("Error in saveVehicle edge path:", error);
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

    const yearNum = typeof vehicle.year === "string" ? parseInt(vehicle.year, 10) : vehicle.year;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const hasValidId = vehicle.id && uuidRegex.test(vehicle.id);

    if (hasValidId) {
      const { error } = await supabase
        .from("vehicles")
        .update({
          make: vehicle.make,
          model: vehicle.model,
          year: yearNum,
          color: vehicle.color,
          license_plate: vehicle.licensePlate || vehicle.license_plate,
          vin: vehicle.vin,
          image_url: vehicle.image_url
        })
        .eq("id", vehicle.id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating vehicle:", error);
        return false;
      }
    } else {
      const { error } = await supabase.from("vehicles").insert({
        user_id: user.id,
        make: vehicle.make,
        model: vehicle.model,
        year: yearNum,
        color: vehicle.color,
        license_plate: vehicle.licensePlate || vehicle.license_plate,
        vin: vehicle.vin,
        image_url: vehicle.image_url
      });

      if (error) {
        console.error("Error inserting vehicle:", error);
        return false;
      }
    }

    console.log("✅ Vehicle saved to Supabase");
    return true;
  } catch (error) {
    console.error("Error in saveVehicle:", error);
    return false;
  }
}

export async function deleteVehicle(vehicleId: string, clerkUserId?: string): Promise<boolean> {
  if (clerkUserId) {
    try {
      await requestSupabaseEdge<{ success: boolean }>(SUPABASE_EDGE_ROUTES.deleteVehicle, {
        body: JSON.stringify({
          clerkUserId,
          vehicleId,
        }),
        method: "POST",
      });
      return true;
    } catch (error) {
      console.error("Error in deleteVehicle edge path:", error);
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
      .from("vehicles")
      .delete()
      .eq("id", vehicleId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting vehicle:", error);
      return false;
    }

    console.log("✅ Vehicle deleted from Supabase");
    return true;
  } catch (error) {
    console.error("Error in deleteVehicle:", error);
    return false;
  }
}
