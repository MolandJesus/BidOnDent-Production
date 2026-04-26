/**
 * Vehicle CRUD Route Handlers
 * Handles all vehicle-related operations (create, read, update, delete)
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  ensureClerkUserMatchesSession,
  getAuthenticatedProfile,
  requireClerkSession,
} from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";
import { hydrateSignedStorageUrl } from "../utils/storage.ts";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

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
    const session = await requireClerkSession(req, { requireEmail: false });
    const { clerkUserId, vehicle } = body;
    const authenticatedClerkUserId = ensureClerkUserMatchesSession(
      session,
      clerkUserId || null
    );

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
        .eq('clerk_user_id', authenticatedClerkUserId)
        .select()
        .maybeSingle();

      data = result.data;
      error = result.error;
    } else {
      // Insert new vehicle
      const result = await supabase
        .from('vehicles')
        .insert({
          clerk_user_id: authenticatedClerkUserId,
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

    return respond({
      success: true,
      vehicle: data
        ? {
            ...data,
            image_url: await hydrateSignedStorageUrl(
              supabase,
              typeof data.image_url === "string" ? data.image_url : null
            ),
          }
        : null,
    });
  } catch (error: any) {
    console.error('Error in save vehicle endpoint:', error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Authenticated user mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
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
    const session = await requireClerkSession(req, { requireEmail: false });
    const sessionClerkUserId = ensureClerkUserMatchesSession(
      session,
      url.searchParams.get('clerkUserId')
    );

    // Resolve the user's profile to recover any historical clerk_user_id.
    // Vehicles may have been saved under an older Clerk id (Clerk env switch,
    // session rotation, account re-link). The profile is found by clerk_user_id
    // OR email, so its stored clerk_user_id is the canonical link to legacy
    // rows even when the current JWT carries a different id.
    const profile = await getAuthenticatedProfile(supabase, session);
    const candidateClerkUserIds = new Set<string>();
    candidateClerkUserIds.add(sessionClerkUserId);
    if (profile?.clerk_user_id) {
      candidateClerkUserIds.add(profile.clerk_user_id);
    }

    const baseQuery = supabase
      .from('vehicles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    const filteredQuery =
      candidateClerkUserIds.size === 1
        ? baseQuery.eq('clerk_user_id', sessionClerkUserId)
        : baseQuery.in('clerk_user_id', Array.from(candidateClerkUserIds));

    let { data, error } = await filteredQuery;

    // Final fallback: vehicles linked via legacy Supabase auth user_id when
    // the profile carries a user_id but no historical clerk_user_id match.
    if (!error && (!data || data.length === 0) && profile?.user_id) {
      const userIdResult = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', profile.user_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });
      if (!userIdResult.error && userIdResult.data && userIdResult.data.length > 0) {
        data = userIdResult.data;

        // Self-heal: relink legacy rows to the current Clerk user id so future
        // direct queries by clerk_user_id succeed without the fallback hop.
        const legacyIds = userIdResult.data
          .map((row: any) => row.id)
          .filter((id: any) => typeof id === "string");
        if (legacyIds.length > 0) {
          await supabase
            .from('vehicles')
            .update({ clerk_user_id: sessionClerkUserId })
            .in('id', legacyIds);
        }
      }
    }

    // Self-heal: if rows were found under a stale clerk_user_id, relink them
    // to the current session's id so the fallback isn't needed next time.
    if (
      !error &&
      data &&
      data.length > 0 &&
      candidateClerkUserIds.size > 1
    ) {
      const staleIds = data
        .filter((row: any) => row.clerk_user_id && row.clerk_user_id !== sessionClerkUserId)
        .map((row: any) => row.id)
        .filter((id: any) => typeof id === "string");
      if (staleIds.length > 0) {
        await supabase
          .from('vehicles')
          .update({ clerk_user_id: sessionClerkUserId })
          .in('id', staleIds);
      }
    }

    if (error) {
      console.error('Error fetching vehicles:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      vehicles: await Promise.all(
        (data || []).map(async (vehicle: any) => ({
          ...vehicle,
          image_url: await hydrateSignedStorageUrl(
            supabase,
            typeof vehicle?.image_url === "string" ? vehicle.image_url : null
          ),
        }))
      ),
    });
  } catch (error: any) {
    console.error('Error in get vehicles endpoint:', error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Authenticated user mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
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
    const session = await requireClerkSession(req, { requireEmail: false });
    const { vehicleId, clerkUserId } = body;

    if (!vehicleId || !clerkUserId) {
      return respond({ error: 'Missing vehicleId or clerkUserId' }, 400);
    }

    const authenticatedClerkUserId = ensureClerkUserMatchesSession(session, clerkUserId);

    const { error } = await supabase
      .from('vehicles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', vehicleId)
      .eq('clerk_user_id', authenticatedClerkUserId)
      .is('deleted_at', null);

    if (error) {
      console.error('Error soft-deleting vehicle:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true, message: 'Vehicle deleted' });
  } catch (error: any) {
    console.error('Error in delete vehicle endpoint:', error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Authenticated user mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

/**
 * DELETE /vehicles/:id - Delete a vehicle by REST DELETE
 * Alternative delete method using REST-style DELETE HTTP method
 */
export async function deleteVehicleByDelete(
  req: Request,
  vehicleId: string | undefined,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false });
    const url = new URL(req.url);
    const clerkUserId = url.searchParams.get("clerkUserId");

    if (!vehicleId || !clerkUserId) {
      return respond({ error: 'Missing vehicleId or clerkUserId' }, 400);
    }

    const authenticatedClerkUserId = ensureClerkUserMatchesSession(session, clerkUserId);

    const { error } = await supabase
      .from('vehicles')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', vehicleId)
      .eq('clerk_user_id', authenticatedClerkUserId)
      .is('deleted_at', null);

    if (error) {
      console.error('Error soft-deleting vehicle:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true, message: 'Vehicle deleted' });
  } catch (error: any) {
    console.error('Error in delete vehicle endpoint:', error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Authenticated user mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}
