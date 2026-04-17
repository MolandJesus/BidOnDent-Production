import type { NavigationAddressResult, NavigationAddressSuggestion } from "../types/navigation";
import type { Place, RecentSearch, SavedPlace } from "../types/mapDomain";
import type { NavigationSessionStatus } from "../features/navigation";

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

function splitLocalityLabel(value?: string) {
  if (!value) {
    return { city: "", state: "" };
  }

  const [city = "", state = ""] = value.split(",").map((part) => part.trim());
  return { city, state };
}

export function buildPlaceFromAddressResult(result: NavigationAddressResult): Place {
  const { city, state } = splitLocalityLabel(result.secondaryLabel);

  return {
    name: result.primaryLabel,
    address: result.primaryLabel,
    city,
    state,
    zipCode: "",
    latitude: result.lat,
    longitude: result.lng,
    placeId: `nominatim-${result.id}`,
  };
}

export function buildPlaceFromAddressSuggestion(suggestion: NavigationAddressSuggestion): Place {
  const { city, state } = splitLocalityLabel(suggestion.subtitle);

  return {
    name: suggestion.title,
    address: suggestion.title,
    city,
    state,
    zipCode: "",
    latitude: suggestion.coordinate.lat,
    longitude: suggestion.coordinate.lng,
    placeId: `nominatim-${suggestion.id}`,
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

type ShopRouteActionLabelArgs = {
  shopId: number;
  routeReady: boolean;
  hasArrived?: boolean;
  defaultLabel: string;
  navigationSessionStatus: NavigationSessionStatus;
  navigationSessionDestinationId: string | null;
};

export function shouldUseShopNavigationAction({
  shopId,
  routeReady,
  navigationSessionStatus,
  navigationSessionDestinationId,
}: Omit<ShopRouteActionLabelArgs, "defaultLabel">) {
  const matchesSessionDestination = navigationSessionDestinationId === String(shopId);
  const hasLiveSessionForShop =
    matchesSessionDestination &&
    (navigationSessionStatus === "active" || navigationSessionStatus === "paused");

  return hasLiveSessionForShop || routeReady;
}

export function getShopRouteActionLabel({
  shopId,
  routeReady,
  hasArrived = false,
  defaultLabel,
  navigationSessionStatus,
  navigationSessionDestinationId,
}: ShopRouteActionLabelArgs) {
  const matchesSessionDestination = navigationSessionDestinationId === String(shopId);
  if (matchesSessionDestination && hasArrived && routeReady) {
    return "Start Again";
  }

  if (matchesSessionDestination && navigationSessionStatus === "paused") {
    return "Resume Navigation";
  }

  if (matchesSessionDestination && navigationSessionStatus === "active") {
    return "Open Live Route";
  }

  if (!routeReady) {
    return defaultLabel;
  }

  return "Start Navigation";
}
