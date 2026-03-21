import type { CoverageSearchTarget } from "../../components/maps/serviceCoverageMapTypes";
import type { NavigationAddressResult } from "../../types/navigation";
import { runWithProviderHealth } from "./providerHealth";

const addressSearchCache = new Map<string, NavigationAddressResult[]>();

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

  if (cached) {
    return cached;
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
    throw new Error("Address lookup is temporarily unavailable.");
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

  addressSearchCache.set(cacheKey, results);
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
