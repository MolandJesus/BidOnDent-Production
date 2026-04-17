import {
  buildSupabaseEdgeHeaders,
  buildSupabaseFunctionUrl,
  SUPABASE_EDGE_ROUTES,
} from "../supabase/runtime";

type NominatimAddress = {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
};

export type NominatimSearchResult = {
  place_id?: number;
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: NominatimAddress;
};

function normalizeResults(payload: unknown): NominatimSearchResult[] {
  if (Array.isArray(payload)) {
    return payload as NominatimSearchResult[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { results?: unknown }).results)
  ) {
    return (payload as { results: NominatimSearchResult[] }).results;
  }

  return [];
}

export async function fetchGeocodeSearchResults({
  query,
  limit,
  signal,
}: {
  query: string;
  limit: number;
  signal?: AbortSignal;
}): Promise<NominatimSearchResult[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const params = new URLSearchParams({
    limit: String(limit),
    q: normalizedQuery,
  });

  const response = await fetch(
    buildSupabaseFunctionUrl(`${SUPABASE_EDGE_ROUTES.geocodeSearch}?${params.toString()}`),
    {
      method: "GET",
      headers: buildSupabaseEdgeHeaders({
        headers: {
          Accept: "application/json",
        },
        json: false,
      }),
      signal,
    }
  );

  if (!response.ok) {
    throw new Error("Address lookup failed. Please try a different search or wait a moment.");
  }

  return normalizeResults(await response.json().catch(() => ({ results: [] })));
}
