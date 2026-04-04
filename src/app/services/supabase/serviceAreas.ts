/**
 * Shop Service Areas — client-side Supabase edge service.
 * Pass 811 — Shop service area foundation.
 */

import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

export type ShopServiceArea = {
  id: string;
  shop_profile_id: string;
  label: string;
  area_type: "radius" | "zip_codes";
  center_latitude: number | null;
  center_longitude: number | null;
  radius_miles: number | null;
  zip_codes: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SaveServiceAreaInput = {
  id?: string;
  label?: string;
  area_type?: "radius" | "zip_codes";
  center_latitude?: number;
  center_longitude?: number;
  radius_miles?: number;
  zip_codes?: string[];
  is_active?: boolean;
};

export async function getShopServiceAreas(
  shopProfileId: string
): Promise<ShopServiceArea[]> {
  try {
    const data = await requestSupabaseEdge<{
      serviceAreas: ShopServiceArea[];
    }>(
      `${SUPABASE_EDGE_ROUTES.shopServiceAreas}?shopProfileId=${encodeURIComponent(shopProfileId)}`,
      { method: "GET" }
    );
    return data.serviceAreas ?? [];
  } catch (error) {
    if (import.meta.env.DEV)
      console.error("getShopServiceAreas error:", error);
    return [];
  }
}

export async function saveShopServiceArea(
  clerkUserId: string,
  serviceArea: SaveServiceAreaInput
): Promise<ShopServiceArea | null> {
  try {
    const data = await requestSupabaseEdge<{
      serviceArea: ShopServiceArea;
    }>(SUPABASE_EDGE_ROUTES.shopServiceAreas, {
      method: "POST",
      body: JSON.stringify({ clerkUserId, serviceArea }),
    });
    return data.serviceArea ?? null;
  } catch (error) {
    if (import.meta.env.DEV)
      console.error("saveShopServiceArea error:", error);
    throw error;
  }
}

export async function deleteShopServiceArea(
  clerkUserId: string,
  serviceAreaId: string
): Promise<boolean> {
  try {
    await requestSupabaseEdge(SUPABASE_EDGE_ROUTES.shopServiceAreas, {
      method: "DELETE",
      body: JSON.stringify({ clerkUserId, serviceAreaId }),
    });
    return true;
  } catch (error) {
    if (import.meta.env.DEV)
      console.error("deleteShopServiceArea error:", error);
    throw error;
  }
}
