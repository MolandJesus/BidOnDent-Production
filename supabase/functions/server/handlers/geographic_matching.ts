import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { requireClerkSession } from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (
  body: unknown,
  status?: number,
  headers?: Record<string, string>
) => Response;

/**
 * GET /nearby-shops?latitude=33.749&longitude=-84.388&radius_miles=25
 * Returns shops within the specified radius of the given coordinates.
 * Uses PostGIS ST_DWithin for efficient spatial queries.
 */
export async function getNearbyShops(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    await requireClerkSession(req, { requireEmail: false });

    const url = new URL(req.url);
    const latitude = parseFloat(url.searchParams.get("latitude") ?? "");
    const longitude = parseFloat(url.searchParams.get("longitude") ?? "");
    const radiusMiles = parseFloat(
      url.searchParams.get("radius_miles") ?? "25"
    );

    if (isNaN(latitude) || isNaN(longitude)) {
      return respond({ error: "latitude and longitude are required" }, 400);
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return respond({ error: "Invalid coordinates" }, 400);
    }

    if (radiusMiles <= 0 || radiusMiles > 500) {
      return respond({ error: "radius_miles must be between 0 and 500" }, 400);
    }

    const radiusMeters = radiusMiles * 1609.344;

    const { data, error } = await supabase.rpc("find_shops_near", {
      p_longitude: longitude,
      p_latitude: latitude,
      p_radius_meters: radiusMeters,
    });

    if (error) {
      console.error(
        "getNearbyShops: query error:",
        sanitizeErrorMessage(error.message)
      );
      return respond({ error: "Failed to find nearby shops" }, 500);
    }

    // Enrich with shop profile data
    const shopIds = (data ?? []).map(
      (r: { shop_profile_id: string }) => r.shop_profile_id
    );

    if (shopIds.length === 0) {
      return respond({ shops: [], total: 0 }, 200);
    }

    const { data: profiles, error: profileError } = await supabase
      .from("shop_profiles")
      .select(
        "id, business_name, geo_latitude, geo_longitude, city, state, phone, website, is_verified"
      )
      .in("id", shopIds);

    if (profileError) {
      console.error(
        "getNearbyShops: profile fetch error:",
        sanitizeErrorMessage(profileError.message)
      );
      return respond({ error: "Failed to fetch shop details" }, 500);
    }

    // Merge distance data with profiles
    const distanceMap = new Map(
      (data ?? []).map(
        (r: { shop_profile_id: string; distance_meters: number }) => [
          r.shop_profile_id,
          r.distance_meters,
        ]
      )
    );

    const shops = (profiles ?? []).map(
      (profile: Record<string, unknown>) => ({
        ...profile,
        distance_miles:
          ((distanceMap.get(profile.id as string) as number) ?? 0) / 1609.344,
      })
    );

    // Sort by distance
    shops.sort(
      (a: { distance_miles: number }, b: { distance_miles: number }) =>
        a.distance_miles - b.distance_miles
    );

    return respond({ shops, total: shops.length }, 200);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("getNearbyShops:", sanitizeErrorMessage(msg));
    return respond({ error: "Failed to find nearby shops" }, 500);
  }
}

/**
 * GET /reports-in-service-area
 * Returns reports within the authenticated shop's service areas.
 * Resolves shop from Clerk session.
 */
export async function getReportsInServiceArea(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false });
    const clerkUserId = session.clerkUserId;

    // Resolve shop profile from session
    const { data: shopProfile, error: shopError } = await supabase
      .from("shop_profiles")
      .select("id")
      .eq("clerk_user_id", clerkUserId)
      .maybeSingle();

    if (shopError) {
      console.error(
        "getReportsInServiceArea: shop lookup error:",
        sanitizeErrorMessage(shopError.message)
      );
      return respond({ error: "Failed to resolve shop" }, 500);
    }

    if (!shopProfile) {
      return respond({ error: "No shop profile found" }, 404);
    }

    const { data, error } = await supabase.rpc(
      "find_reports_in_service_area",
      { p_shop_profile_id: shopProfile.id }
    );

    if (error) {
      console.error(
        "getReportsInServiceArea: query error:",
        sanitizeErrorMessage(error.message)
      );
      return respond({ error: "Failed to find reports" }, 500);
    }

    // Enrich with report details
    const reportIds = (data ?? []).map(
      (r: { report_id: string }) => r.report_id
    );

    if (reportIds.length === 0) {
      return respond({ reports: [], total: 0 }, 200);
    }

    const { data: reports, error: reportError } = await supabase
      .from("damage_reports")
      .select(
        "id, status, damage_type, description, latitude, longitude, zip_code, created_at"
      )
      .in("id", reportIds);

    if (reportError) {
      console.error(
        "getReportsInServiceArea: report fetch error:",
        sanitizeErrorMessage(reportError.message)
      );
      return respond({ error: "Failed to fetch report details" }, 500);
    }

    // Merge distance data
    const distanceMap = new Map(
      (data ?? []).map(
        (r: { report_id: string; distance_meters: number }) => [
          r.report_id,
          r.distance_meters,
        ]
      )
    );

    const enrichedReports = (reports ?? []).map(
      (report: Record<string, unknown>) => ({
        ...report,
        distance_miles:
          ((distanceMap.get(report.id as string) as number) ?? 0) / 1609.344,
      })
    );

    enrichedReports.sort(
      (a: { distance_miles: number }, b: { distance_miles: number }) =>
        a.distance_miles - b.distance_miles
    );

    return respond(
      { reports: enrichedReports, total: enrichedReports.length },
      200
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("getReportsInServiceArea:", sanitizeErrorMessage(msg));
    return respond({ error: "Failed to find reports in service area" }, 500);
  }
}
