/**
 * Shop Service Areas CRUD Route Handlers
 * Handles service area management for shop profiles.
 * Pass 811 — Shop service area foundation.
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  ensureClerkUserMatchesSession,
  requireClerkSession,
} from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (
  body: unknown,
  status?: number,
  headers?: Record<string, string>
) => Response;

/**
 * GET /shop-service-areas?shopProfileId=UUID
 * Returns all active service areas for a given shop profile.
 * Any authenticated user may read (for map display).
 */
export async function getShopServiceAreas(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    await requireClerkSession(req, { requireEmail: false });

    const url = new URL(req.url);
    const shopProfileId = url.searchParams.get("shopProfileId");
    if (!shopProfileId) {
      return respond({ error: "shopProfileId query param required" }, 400);
    }

    const { data, error } = await supabase
      .from("shop_service_areas")
      .select("*")
      .eq("shop_profile_id", shopProfileId)
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("getShopServiceAreas error:", sanitizeErrorMessage(error.message));
      return respond({ error: "Failed to load service areas" }, 500);
    }

    return respond({ serviceAreas: data ?? [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("getShopServiceAreas catch:", sanitizeErrorMessage(msg));
    return respond({ error: "Failed to load service areas" }, 500);
  }
}

/**
 * POST /shop-service-areas
 * Create or update a service area for the authenticated shop.
 * Body: { clerkUserId, serviceArea: { id?, label, area_type, center_latitude?, center_longitude?, radius_miles?, zip_codes?, is_active? } }
 */
export async function saveShopServiceArea(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const session = await requireClerkSession(req, { requireEmail: false });
    const { clerkUserId, serviceArea } = body;
    const authenticatedClerkUserId = ensureClerkUserMatchesSession(
      session,
      clerkUserId || null
    );

    // Resolve shop profile for authenticated user
    const { data: shopProfile, error: profileError } = await supabase
      .from("shop_profiles")
      .select("id")
      .eq("clerk_user_id", authenticatedClerkUserId)
      .maybeSingle();

    if (profileError || !shopProfile) {
      return respond({ error: "Shop profile not found" }, 404);
    }

    // Validate area_type-specific fields
    const areaType = serviceArea.area_type || "radius";
    if (areaType === "radius") {
      if (
        serviceArea.center_latitude == null ||
        serviceArea.center_longitude == null
      ) {
        return respond(
          { error: "center_latitude and center_longitude required for radius type" },
          400
        );
      }
      if (
        serviceArea.radius_miles != null &&
        (serviceArea.radius_miles <= 0 || serviceArea.radius_miles > 200)
      ) {
        return respond({ error: "radius_miles must be between 0 and 200" }, 400);
      }
    } else if (areaType === "zip_codes") {
      if (
        !Array.isArray(serviceArea.zip_codes) ||
        serviceArea.zip_codes.length === 0
      ) {
        return respond(
          { error: "zip_codes array required for zip_codes type" },
          400
        );
      }
    }

    const row = {
      shop_profile_id: shopProfile.id,
      label: serviceArea.label || "Service Area",
      area_type: areaType,
      center_latitude: serviceArea.center_latitude ?? null,
      center_longitude: serviceArea.center_longitude ?? null,
      radius_miles: serviceArea.radius_miles ?? 15,
      zip_codes: serviceArea.zip_codes ?? [],
      is_active: serviceArea.is_active !== false,
    };

    // Check if updating existing or creating new
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUpdate = serviceArea.id && uuidRegex.test(serviceArea.id);

    let data, error;
    if (isUpdate) {
      // Ensure the area belongs to this shop
      const result = await supabase
        .from("shop_service_areas")
        .update(row)
        .eq("id", serviceArea.id)
        .eq("shop_profile_id", shopProfile.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from("shop_service_areas")
        .insert(row)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("saveShopServiceArea error:", sanitizeErrorMessage(error.message));
      return respond({ error: "Failed to save service area" }, 500);
    }

    return respond({ serviceArea: data }, isUpdate ? 200 : 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("saveShopServiceArea catch:", sanitizeErrorMessage(msg));
    return respond({ error: "Failed to save service area" }, 500);
  }
}

/**
 * DELETE /shop-service-areas
 * Body: { clerkUserId, serviceAreaId }
 * Hard-deletes a service area belonging to the authenticated shop.
 */
export async function deleteShopServiceArea(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const session = await requireClerkSession(req, { requireEmail: false });
    const { clerkUserId, serviceAreaId } = body;
    const authenticatedClerkUserId = ensureClerkUserMatchesSession(
      session,
      clerkUserId || null
    );

    if (!serviceAreaId) {
      return respond({ error: "serviceAreaId required" }, 400);
    }

    // Resolve shop profile
    const { data: shopProfile, error: profileError } = await supabase
      .from("shop_profiles")
      .select("id")
      .eq("clerk_user_id", authenticatedClerkUserId)
      .maybeSingle();

    if (profileError || !shopProfile) {
      return respond({ error: "Shop profile not found" }, 404);
    }

    const { error } = await supabase
      .from("shop_service_areas")
      .delete()
      .eq("id", serviceAreaId)
      .eq("shop_profile_id", shopProfile.id);

    if (error) {
      console.error("deleteShopServiceArea error:", sanitizeErrorMessage(error.message));
      return respond({ error: "Failed to delete service area" }, 500);
    }

    return respond({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("deleteShopServiceArea catch:", sanitizeErrorMessage(msg));
    return respond({ error: "Failed to delete service area" }, 500);
  }
}
