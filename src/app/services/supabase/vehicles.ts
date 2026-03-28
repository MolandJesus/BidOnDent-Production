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

  if (!identity?.clerkUserId && !identity?.email && !identity?.websiteUserKey) {
    if (import.meta.env.DEV) {
      console.warn("getVehicles: missing identity");
    }
    return [];
  }

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
    if (import.meta.env.DEV) console.error("Error in getVehicles edge path:", error);
    return [];
  }
}

export async function saveVehicle(vehicle: Vehicle, clerkUserId?: string): Promise<boolean> {
  if (!clerkUserId) {
    if (import.meta.env.DEV) {
      console.warn("saveVehicle: missing Clerk user ID");
    }
    return false;
  }

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
    if (import.meta.env.DEV) console.error("Error in saveVehicle edge path:", error);
    return false;
  }
}

export async function deleteVehicle(vehicleId: string, clerkUserId?: string): Promise<boolean> {
  if (!clerkUserId) {
    if (import.meta.env.DEV) {
      console.warn("deleteVehicle: missing Clerk user ID");
    }
    return false;
  }

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
    if (import.meta.env.DEV) console.error("Error in deleteVehicle edge path:", error);
    return false;
  }
}
