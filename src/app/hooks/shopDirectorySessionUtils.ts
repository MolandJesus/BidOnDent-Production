import type { Place, RecentSearch, SavedPlace } from "../types/mapDomain";

const MAX_RECENT_SEARCHES = 6;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildSavedPlace(origin: Place): SavedPlace {
  const timestamp = new Date().toISOString();
  return {
    ...origin,
    id: `saved-place-${origin.placeId || slugify(origin.name)}`,
    label: origin.name,
    isFavorite: true,
    createdAt: timestamp,
    lastUsedAt: timestamp,
    metadata: { category: "custom", icon: "map-pin" },
  };
}

export function buildRecentSearches(
  currentSearches: RecentSearch[],
  query: string,
  origin: Place | null,
  resultCount: number
) {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return currentSearches;

  const nextSearch: RecentSearch = {
    query: trimmedQuery,
    origin: origin || undefined,
    resultCount,
    timestamp: new Date().toISOString(),
  };
  const filteredSearches = currentSearches.filter((search) => {
    const sameOrigin =
      (search.origin?.placeId || search.origin?.name) === (origin?.placeId || origin?.name);
    return !(search.query.toLowerCase() === trimmedQuery.toLowerCase() && sameOrigin);
  });

  return [nextSearch, ...filteredSearches].slice(0, MAX_RECENT_SEARCHES);
}

type VehicleInput = { make?: string; model?: string; year?: string | number };
type ReportInput = {
  damageArea?: string;
  damageAreas?: string[];
  damageType?: string;
  description?: string;
};

export function getContextChips(vehicles: VehicleInput[] = [], reports: ReportInput[] = []) {
  const vehicleMakes = [...new Set(vehicles.map((vehicle) => vehicle.make).filter(Boolean))].slice(
    0,
    3
  );
  const damageSignals = [
    ...new Set(
      reports
        .flatMap((report) => [
          report.damageArea,
          report.damageType,
          ...(Array.isArray(report.damageAreas) ? report.damageAreas : []),
        ])
        .filter(Boolean)
    ),
  ].slice(0, 3);

  return [...vehicleMakes, ...damageSignals].filter(Boolean) as string[];
}
