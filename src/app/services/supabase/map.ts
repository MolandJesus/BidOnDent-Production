import { supabase } from "./client";
import type { PartnerShopMapRecord } from "./types";

type Coordinates = {
  lat: number;
  lng: number;
};

const zipPrefixCenters: Record<string, Coordinates> = {
  "105": { lat: 41.145, lng: -73.81 },
  "106": { lat: 41.033, lng: -73.7629 },
  "107": { lat: 40.9528, lng: -73.8676 },
  "108": { lat: 40.9395, lng: -73.8332 },
  "109": { lat: 41.1462, lng: -74.0343 },
  "110": { lat: 40.7756, lng: -73.704 },
  "115": { lat: 40.6501, lng: -73.6068 },
  "125": { lat: 41.7453, lng: -73.6996 },
  "126": { lat: 41.7004, lng: -73.921 },
  "127": { lat: 41.6623, lng: -74.7156 },
};

export function zipToCoordinates(zipCode?: string): Coordinates | null {
  if (!zipCode) return null;
  const zip = zipCode.replace(/[^0-9]/g, "").slice(0, 5);
  if (zip.length < 3) return null;
  return zipPrefixCenters[zip.slice(0, 3)] || null;
}

export function haversineMiles(from: Coordinates, to: Coordinates): number {
  const earthRadiusMiles = 3958.8;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return earthRadiusMiles * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function resolveShopCoordinates(shop: PartnerShopMapRecord): Coordinates | null {
  if (typeof shop.latitude === "number" && typeof shop.longitude === "number") {
    return { lat: shop.latitude, lng: shop.longitude };
  }
  return zipToCoordinates(shop.zip_code);
}

export async function getPublicPartnerShops(): Promise<PartnerShopMapRecord[]> {
  const { data, error } = await supabase
    .from("public_partner_shops")
    .select(
      "id, shop_name, address, city, state, zip_code, latitude, longitude, rating, specialties, phone_number, email, is_active"
    )
    .eq("is_active", true)
    .order("shop_name", { ascending: true });

  if (error) {
    console.warn("Public partner shops query failed", error.message);
    return [];
  }

  return (data || []) as PartnerShopMapRecord[];
}
