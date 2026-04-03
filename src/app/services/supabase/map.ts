import { supabase } from "./client";
import type { PartnerShopMapRecord } from "./types";

type Coordinates = {
  lat: number;
  lng: number;
};

const zipPrefixCenters: Record<string, Coordinates> = {
  // New York metro
  "100": { lat: 40.7128, lng: -73.9352 },
  "101": { lat: 40.7831, lng: -73.9712 },
  "102": { lat: 40.6782, lng: -73.9442 },
  "103": { lat: 40.5795, lng: -74.1502 },
  "104": { lat: 40.8448, lng: -73.8648 },
  "105": { lat: 41.145, lng: -73.81 },
  "106": { lat: 41.033, lng: -73.7629 },
  "107": { lat: 40.9528, lng: -73.8676 },
  "108": { lat: 40.9395, lng: -73.8332 },
  "109": { lat: 41.1462, lng: -74.0343 },
  "110": { lat: 40.7756, lng: -73.704 },
  "111": { lat: 40.6501, lng: -73.7949 },
  "112": { lat: 40.6782, lng: -73.9442 },
  "113": { lat: 40.7282, lng: -73.7949 },
  "114": { lat: 40.7282, lng: -73.7949 },
  "115": { lat: 40.6501, lng: -73.6068 },
  "116": { lat: 40.7282, lng: -73.4143 },
  "117": { lat: 40.8679, lng: -72.6514 },
  "125": { lat: 41.7453, lng: -73.6996 },
  "126": { lat: 41.7004, lng: -73.921 },
  "127": { lat: 41.6623, lng: -74.7156 },
  // Atlanta metro
  "300": { lat: 33.749, lng: -84.388 },
  "301": { lat: 33.749, lng: -84.388 },
  "302": { lat: 33.749, lng: -84.388 },
  "303": { lat: 33.8034, lng: -84.3963 },
  // Los Angeles / SoCal
  "900": { lat: 34.0522, lng: -118.2437 },
  "901": { lat: 34.0522, lng: -118.2437 },
  "902": { lat: 33.9425, lng: -118.2551 },
  "910": { lat: 34.1478, lng: -118.1445 },
  "917": { lat: 34.0689, lng: -117.9389 },
  "920": { lat: 32.7157, lng: -117.1611 },
  // Chicago
  "606": { lat: 41.8781, lng: -87.6298 },
  "607": { lat: 41.8781, lng: -87.6298 },
  "600": { lat: 42.0451, lng: -87.6877 },
  // Miami / South FL
  "330": { lat: 25.9, lng: -80.2 },
  "331": { lat: 26.1224, lng: -80.1373 },
  "332": { lat: 25.7617, lng: -80.1918 },
  "333": { lat: 25.7617, lng: -80.1918 },
  // Houston / Dallas / Texas
  "770": { lat: 29.7604, lng: -95.3698 },
  "771": { lat: 29.7604, lng: -95.3698 },
  "750": { lat: 32.7767, lng: -96.797 },
  "751": { lat: 32.7767, lng: -96.797 },
  // Phoenix
  "850": { lat: 33.4484, lng: -111.9431 },
  "852": { lat: 33.4484, lng: -111.9431 },
  // Philadelphia / NJ
  "191": { lat: 39.9526, lng: -75.1652 },
  "070": { lat: 40.7282, lng: -74.0776 },
  "071": { lat: 40.7357, lng: -74.1724 },
  // Detroit
  "481": { lat: 42.3314, lng: -83.0458 },
  "482": { lat: 42.3314, lng: -83.0458 },
  // Denver
  "802": { lat: 39.7392, lng: -104.9903 },
  "800": { lat: 39.7392, lng: -104.9903 },
  // Seattle
  "981": { lat: 47.6062, lng: -122.3321 },
  // Boston
  "021": { lat: 42.3601, lng: -71.0589 },
  // DC metro
  "200": { lat: 38.9072, lng: -77.0369 },
  "201": { lat: 38.9072, lng: -77.0369 },
};

export function zipToCoordinates(zipCode?: string): Coordinates | null {
  if (!zipCode) return null;
  const zip = zipCode.replace(/[^0-9]/g, "").slice(0, 5);
  if (zip.length < 3) return null;
  return zipPrefixCenters[zip.slice(0, 3)] || null;
}

/* ── Address geocoding via Nominatim (cached, rate-limited) ─────────── */
const geocodeCache = new Map<string, Coordinates | null>();
let lastGeocodeFetch = 0;

export async function geocodeAddress(parts: {
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}): Promise<Coordinates | null> {
  const query = [parts.address, parts.city, parts.state, parts.zip].filter(Boolean).join(", ");
  if (!query) return null;

  const key = query.toLowerCase();
  if (geocodeCache.has(key)) return geocodeCache.get(key) ?? null;

  // Respect Nominatim rate limit (1 req/sec)
  const now = Date.now();
  const wait = Math.max(0, 1050 - (now - lastGeocodeFetch));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastGeocodeFetch = Date.now();

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "us");
    url.searchParams.set("q", query);

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      geocodeCache.set(key, null);
      return null;
    }
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) {
      geocodeCache.set(key, null);
      return null;
    }
    const coords: Coordinates = { lat: Number(data[0].lat), lng: Number(data[0].lon) };
    if (!Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
      geocodeCache.set(key, null);
      return null;
    }
    geocodeCache.set(key, coords);
    return coords;
  } catch {
    geocodeCache.set(key, null);
    return null;
  }
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
    if (import.meta.env.DEV) console.warn("Public partner shops query failed", error.message);
    throw new Error(error.message || "Failed to load public partner shops");
  }

  return (data || []) as PartnerShopMapRecord[];
}
