/**
 * Client service for geographic matching endpoints.
 * Uses PostGIS-powered edge functions for proximity queries.
 */
import {
  requestSupabaseEdge,
  SUPABASE_EDGE_ROUTES,
} from "./runtime";

// ── Types ──────────────────────────────────────────────────────

export interface NearbyShop {
  id: string;
  business_name: string;
  geo_latitude: number;
  geo_longitude: number;
  city: string | null;
  state: string | null;
  phone: string | null;
  website: string | null;
  is_verified: boolean;
  distance_miles: number;
}

export interface NearbyReport {
  id: string;
  status: string;
  damage_type: string | null;
  description: string | null;
  latitude: number;
  longitude: number;
  zip_code: string | null;
  created_at: string;
  distance_miles: number;
}

// ── API calls ──────────────────────────────────────────────────

/**
 * Find shops near a given location.
 * @param latitude  Report/user latitude
 * @param longitude Report/user longitude
 * @param radiusMiles Search radius (default 25)
 */
export async function getNearbyShops(
  latitude: number,
  longitude: number,
  radiusMiles = 25
): Promise<NearbyShop[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    radius_miles: String(radiusMiles),
  });

  const result = await requestSupabaseEdge<{
    shops: NearbyShop[];
    total: number;
  }>(`${SUPABASE_EDGE_ROUTES.nearbyShops}?${params}`, { method: "GET" });

  return result.shops;
}

/**
 * Find damage reports within the current shop's service areas.
 * Uses Clerk session to resolve shop identity.
 */
export async function getReportsInMyServiceArea(): Promise<NearbyReport[]> {
  const result = await requestSupabaseEdge<{
    reports: NearbyReport[];
    total: number;
  }>(SUPABASE_EDGE_ROUTES.reportsInServiceArea, { method: "GET" });

  return result.reports;
}
