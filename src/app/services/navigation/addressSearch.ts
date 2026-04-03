import type { CoverageSearchTarget } from "../../components/maps/serviceCoverageMapTypes";
import type { NavigationAddressResult, NavigationAddressSuggestion } from "../../types/navigation";
import { isProviderCircuitOpen, runWithProviderHealth } from "./providerHealth";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

type CachedEntry<T> = { data: T; timestamp: number };

const addressSearchCache = new Map<string, CachedEntry<NavigationAddressResult[]>>();

type NominatimSearchResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
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

function buildPrimaryLabel(result: NominatimSearchResult) {
  const houseNumber = result.address?.house_number;
  const road = result.address?.road;
  const locality =
    result.address?.city ||
    result.address?.town ||
    result.address?.village ||
    result.address?.county;

  return [houseNumber, road, locality].filter(Boolean).join(" ");
}

function buildSecondaryLabel(result: NominatimSearchResult) {
  return [result.address?.county, result.address?.state].filter(Boolean).join(", ");
}

export async function searchNavigationAddresses(
  query: string,
  signal?: AbortSignal
): Promise<NavigationAddressResult[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 4) {
    return [];
  }

  const cacheKey = normalizedQuery.toLowerCase();
  const cached = addressSearchCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (isProviderCircuitOpen("nominatim-search")) {
    throw new Error("Address lookup is temporarily overloaded. Try again in about 30 seconds.");
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("q", normalizedQuery);

  const response = await runWithProviderHealth("nominatim-search", () =>
    fetch(url.toString(), {
      headers: {
        Accept: "application/json",
      },
      signal,
    })
  );

  if (!response.ok) {
    throw new Error("Address lookup failed. Please try a different search or wait a moment.");
  }

  const data = (await response.json()) as NominatimSearchResult[];
  const results = data
    .map((result) => ({
      id: String(result.place_id),
      label: result.display_name,
      primaryLabel:
        buildPrimaryLabel(result) || result.display_name.split(",")[0] || "Address result",
      secondaryLabel: buildSecondaryLabel(result) || result.display_name,
      lat: Number(result.lat),
      lng: Number(result.lon),
      provider: "nominatim" as const,
    }))
    .filter((result) => Number.isFinite(result.lat) && Number.isFinite(result.lng));

  addressSearchCache.set(cacheKey, { data: results, timestamp: Date.now() });
  return results;
}

export function addressResultToSearchTarget(
  addressResult: NavigationAddressResult
): CoverageSearchTarget {
  return {
    lat: addressResult.lat,
    lng: addressResult.lng,
    county: addressResult.secondaryLabel,
    label: addressResult.primaryLabel,
    source: "address",
  };
}

// ── Predictive address suggestions ──────────────────────────────────────────

const addressSuggestionCache = new Map<string, CachedEntry<NavigationAddressSuggestion[]>>();

function toSuggestionConfidence(result: NominatimSearchResult, query: string): number {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedName = result.display_name.toLowerCase();
  if (!normalizedQuery || normalizedName === normalizedQuery) return 100;
  if (normalizedName.startsWith(normalizedQuery)) return 92;
  if (normalizedName.includes(normalizedQuery)) return 80;
  return 68;
}

function resultToSuggestion(
  result: NominatimSearchResult,
  query: string
): NavigationAddressSuggestion | null {
  const lat = Number(result.lat);
  const lng = Number(result.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id: String(result.place_id),
    title: buildPrimaryLabel(result) || result.display_name.split(",")[0] || "Address suggestion",
    subtitle: buildSecondaryLabel(result) || result.display_name,
    coordinate: { lat, lng },
    intent: "address",
    confidenceScore: toSuggestionConfidence(result, query),
    provider: "nominatim" as const,
  };
}

/**
 * Autocomplete-style address guessing: runs on ≥ 2 chars, returns up to 8
 * results sorted by confidence score. Results are cached per query.
 */
export async function suggestNavigationAddresses(
  query: string,
  signal?: AbortSignal
): Promise<NavigationAddressSuggestion[]> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) {
    return [];
  }

  const cacheKey = `suggest:${normalizedQuery.toLowerCase()}`;
  const cached = addressSuggestionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "8");
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("q", normalizedQuery);

  let response: Response;
  try {
    response = await runWithProviderHealth("nominatim-search", () =>
      fetch(url.toString(), {
        headers: { Accept: "application/json" },
        signal,
      })
    );
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as NominatimSearchResult[];
  const suggestions = data
    .map((result) => resultToSuggestion(result, normalizedQuery))
    .filter((s): s is NavigationAddressSuggestion => s !== null)
    .sort((a, b) => b.confidenceScore - a.confidenceScore);

  addressSuggestionCache.set(cacheKey, { data: suggestions, timestamp: Date.now() });
  return suggestions;
}
