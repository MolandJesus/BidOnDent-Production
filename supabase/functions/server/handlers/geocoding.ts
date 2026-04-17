import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (
  body: Record<string, unknown>,
  status?: number,
  headers?: Record<string, string>
) => Response;

type NominatimSearchResult = {
  place_id?: number;
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
  };
};

const DEFAULT_GEOCODE_LIMIT = 5;
const MAX_GEOCODE_LIMIT = 8;
const MIN_QUERY_LENGTH = 2;
const NOMINATIM_USER_AGENT = "BidOnDent/2026-04-17 (+https://bidondent.com)";

function normalizeLimit(rawLimit: string | null) {
  const parsed = Number.parseInt(rawLimit ?? "", 10);

  if (!Number.isFinite(parsed)) {
    return DEFAULT_GEOCODE_LIMIT;
  }

  return Math.min(MAX_GEOCODE_LIMIT, Math.max(1, parsed));
}

function normalizeSearchResults(payload: unknown): NominatimSearchResult[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .filter((entry): entry is NominatimSearchResult => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      place_id: typeof entry.place_id === "number" ? entry.place_id : undefined,
      display_name: typeof entry.display_name === "string" ? entry.display_name : undefined,
      lat: typeof entry.lat === "string" ? entry.lat : undefined,
      lon: typeof entry.lon === "string" ? entry.lon : undefined,
      address:
        entry.address && typeof entry.address === "object"
          ? {
              house_number:
                typeof entry.address.house_number === "string"
                  ? entry.address.house_number
                  : undefined,
              road: typeof entry.address.road === "string" ? entry.address.road : undefined,
              city: typeof entry.address.city === "string" ? entry.address.city : undefined,
              town: typeof entry.address.town === "string" ? entry.address.town : undefined,
              village:
                typeof entry.address.village === "string" ? entry.address.village : undefined,
              county: typeof entry.address.county === "string" ? entry.address.county : undefined,
              state: typeof entry.address.state === "string" ? entry.address.state : undefined,
            }
          : undefined,
    }))
    .filter((entry) => Boolean(entry.display_name && entry.lat && entry.lon));
}

export async function handleGeocodeSearch(
  req: Request,
  _supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const requestUrl = new URL(req.url);
    const query = requestUrl.searchParams.get("q")?.trim() ?? "";

    if (query.length < MIN_QUERY_LENGTH) {
      return respond({ error: "Search query must be at least 2 characters" }, 400);
    }

    const limit = normalizeLimit(requestUrl.searchParams.get("limit"));
    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    nominatimUrl.searchParams.set("format", "jsonv2");
    nominatimUrl.searchParams.set("limit", String(limit));
    nominatimUrl.searchParams.set("countrycodes", "us");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("q", query);

    const upstreamResponse = await fetch(nominatimUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": NOMINATIM_USER_AGENT,
      },
    });

    if (!upstreamResponse.ok) {
      return respond({ error: "Address lookup unavailable" }, upstreamResponse.status >= 500 ? 503 : 400);
    }

    const payload = await upstreamResponse.json();
    return respond({ results: normalizeSearchResults(payload) });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}
