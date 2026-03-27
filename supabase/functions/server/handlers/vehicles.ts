/**
 * Vehicle CRUD Route Handlers
 * Handles all vehicle-related operations (create, read, update, delete)
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { findExistingProfile } from "./profiles.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

async function resolveVehicleClerkUserId(
  supabase: SupabaseClient,
  identity: {
    clerkUserId?: string | null;
    email?: string | null;
    websiteUserKey?: string | null;
  }
) {
  if (identity.clerkUserId) {
    return identity.clerkUserId;
  }

  const profile = await findExistingProfile(supabase, identity);
  return profile?.clerk_user_id || null;
}

/**
 * POST /vehicles - Save or update a vehicle
 * Creates a new vehicle or updates an existing one based on whether a valid UUID is provided
 */
export async function saveVehicle(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const { clerkUserId, vehicle } = body;

    if (!clerkUserId) {
      return respond({ error: 'Missing clerkUserId' }, 400);
    }

    // Convert year to number if it's a string and validate range
    const yearNum = typeof vehicle.year === 'string' ? parseInt(vehicle.year, 10) : vehicle.year;
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 2) {
      return respond({ error: 'Vehicle year must be between 1900 and next year' }, 400);
    }

    // Check if vehicle has a valid UUID (existing vehicle)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const hasValidId = vehicle.id && uuidRegex.test(vehicle.id);

    let data, error;

    if (hasValidId) {
      // Update existing vehicle
      const result = await supabase
        .from('vehicles')
        .update({
          make: vehicle.make,
          model: vehicle.model,
          year: yearNum,
          color: vehicle.color,
          license_plate: vehicle.licensePlate || vehicle.license_plate,
          vin: vehicle.vin,
          image_url: vehicle.image_url
        })
        .eq('id', vehicle.id)
        .eq('clerk_user_id', clerkUserId)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // Insert new vehicle
      const result = await supabase
        .from('vehicles')
        .insert({
          clerk_user_id: clerkUserId,
          make: vehicle.make,
          model: vehicle.model,
          year: yearNum,
          color: vehicle.color,
          license_plate: vehicle.licensePlate || vehicle.license_plate,
          vin: vehicle.vin,
          image_url: vehicle.image_url
        })
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error saving vehicle:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true, vehicle: data });
  } catch (error: any) {
    console.error('Error in save vehicle endpoint:', error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

/**
 * GET /vehicles - Retrieve all vehicles for a user
 * Fetches vehicles associated with the provided clerk user ID
 */
export async function getVehicles(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const clerkUserId = await resolveVehicleClerkUserId(supabase, {
      clerkUserId: url.searchParams.get('clerkUserId'),
      email: url.searchParams.get('email'),
      websiteUserKey: url.searchParams.get('websiteUserKey'),
    });

    if (!clerkUserId) {
      return respond({ error: 'Missing clerkUserId or equivalent website identity' }, 400);
    }

    // Use service role to bypass RLS
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching vehicles:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ vehicles: data });
  } catch (error: any) {
    console.error('Error in get vehicles endpoint:', error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

/**
 * POST /delete-vehicle - Delete a vehicle by POST
 * Used instead of DELETE to avoid CORS preflight issues with some clients
 */
export async function deleteVehicleByPost(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const { vehicleId, clerkUserId } = body;

    if (!vehicleId || !clerkUserId) {
      return respond({ error: 'Missing vehicleId or clerkUserId' }, 400);
    }

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)
      .eq('clerk_user_id', clerkUserId);

    if (error) {
      console.error('Error deleting vehicle:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true, message: 'Vehicle deleted' });
  } catch (error: any) {
    console.error('Error in delete vehicle endpoint:', error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

/**
 * DELETE /vehicles/:id - Delete a vehicle by REST DELETE
 * Alternative delete method using REST-style DELETE HTTP method
 */
export async function deleteVehicleByDelete(
  vehicleId: string | undefined,
  clerkUserId: string | null,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    if (!vehicleId || !clerkUserId) {
      return respond({ error: 'Missing vehicleId or clerkUserId' }, 400);
    }

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)
      .eq('clerk_user_id', clerkUserId);

    if (error) {
      console.error('Error deleting vehicle:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true, message: 'Vehicle deleted' });
  } catch (error: any) {
    console.error('Error in delete vehicle endpoint:', error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}
