import type {
  Coordinates,
  MapSearchFilters,
  MapSessionMemory,
  MapTheme,
  MapViewMode,
  MapViewportBounds,
  RecentSearch,
  SavedPlace,
  SearchOrigin,
} from "../../types/mapDomain";
import type { WebsiteSessionMemory } from "./websiteIdentity";

// ── Default values ──────────────────────────────────────────────────

export const DEFAULT_MAP_SESSION: MapSessionMemory = {
  savedPlaces: [],
  recentSearches: [],
  customerSavedShopIds: [],
  shopWatchlistIds: [],
  insurerShortlistIds: [],
  mapViewMode: "hybrid",
  mapTheme: "light",
  selectedRouteId: "fastest",
  showClusters: true,
  clusterLevel: "balanced",
  updatedAt: new Date(0).toISOString(),
};

export const DEFAULT_MEMORY: WebsiteSessionMemory = {
  updatedAt: new Date(0).toISOString(),
  shopDirectory: {
    searchQuery: "",
    filterRating: 0,
    sortBy: "smart-match",
    lastViewedShopId: null,
    sessionIntelligenceOpen: false,
  },
  insuranceConnection: {
    connectedInsurerIds: [],
    draftPolicyNumber: "",
    draftClaimNumber: "",
    lastSelectedInsurerId: null,
  },
  mapSession: DEFAULT_MAP_SESSION,
};

// ── Allowed-value constant arrays ───────────────────────────────────

const SHOP_SORT_OPTIONS = ["smart-match", "rating", "reviews", "distance"] as const;
const MAP_VIEW_MODES = ["list", "map", "hybrid"] as const satisfies readonly MapViewMode[];
const MAP_THEMES = ["light", "dark"] as const satisfies readonly MapTheme[];
const CLUSTER_LEVELS = ["aggressive", "balanced", "detailed"] as const;
const SAVED_PLACE_CATEGORIES = ["home", "work", "frequent", "custom"] as const;

// ── Type guards ─────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function deepEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) {
    return true;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return (
      left.length === right.length && left.every((value, index) => deepEqual(value, right[index]))
    );
  }

  if (isRecord(left) && isRecord(right)) {
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    return leftKeys.every(
      (key) => Object.prototype.hasOwnProperty.call(right, key) && deepEqual(left[key], right[key])
    );
  }

  return false;
}

function isAllowedValue<T extends string>(allowed: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(new Date(value).getTime());
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// ── Primitive sanitizers ────────────────────────────────────────────

function sanitizeNumericCollection(values: unknown): number[] {
  return Array.isArray(values)
    ? [
        ...new Set(
          values
            .map((value) => Number(value))
            .filter((value) => Number.isInteger(value) && value > 0)
        ),
      ]
    : [];
}

function sanitizeStringArray(values: unknown): string[] {
  return Array.isArray(values)
    ? [
        ...new Set(
          values.filter(
            (value): value is string => typeof value === "string" && value.trim().length > 0
          )
        ),
      ]
    : [];
}

function sanitizePositiveInteger(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : undefined;
}

function sanitizeNullablePositiveInteger(value: unknown): number | null {
  return sanitizePositiveInteger(value) ?? null;
}

// ── Domain sanitizers ───────────────────────────────────────────────

function sanitizeCoordinates(value: unknown): Coordinates | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const { latitude, longitude } = value;
  if (
    !isFiniteNumber(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !isFiniteNumber(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return undefined;
  }

  return { latitude, longitude };
}

function sanitizeViewportBounds(value: unknown): MapViewportBounds | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const { north, south, east, west } = value;
  if (
    !isFiniteNumber(north) ||
    !isFiniteNumber(south) ||
    !isFiniteNumber(east) ||
    !isFiniteNumber(west) ||
    north < -90 ||
    north > 90 ||
    south < -90 ||
    south > 90 ||
    east < -180 ||
    east > 180 ||
    west < -180 ||
    west > 180 ||
    north < south
  ) {
    return undefined;
  }

  return { north, south, east, west };
}

function sanitizePlace(value: unknown): SearchOrigin | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const coordinates = sanitizeCoordinates(value);
  if (
    !coordinates ||
    !isNonEmptyString(value.name) ||
    !isNonEmptyString(value.address) ||
    !isNonEmptyString(value.city) ||
    !isNonEmptyString(value.state) ||
    !isNonEmptyString(value.zipCode)
  ) {
    return undefined;
  }

  return {
    ...coordinates,
    name: value.name,
    address: value.address,
    city: value.city,
    state: value.state,
    zipCode: value.zipCode,
    ...(isNonEmptyString(value.placeId) ? { placeId: value.placeId } : {}),
  };
}

function sanitizeSavedPlaceMetadata(value: unknown): SavedPlace["metadata"] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const metadata: NonNullable<SavedPlace["metadata"]> = {};
  if (isNonEmptyString(value.icon)) {
    metadata.icon = value.icon;
  }

  if (isAllowedValue(SAVED_PLACE_CATEGORIES, value.category)) {
    metadata.category = value.category;
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

function sanitizeSavedPlace(value: unknown): SavedPlace | null {
  if (!isRecord(value)) {
    return null;
  }

  const place = sanitizePlace(value);
  if (
    !place ||
    !isNonEmptyString(value.id) ||
    !isNonEmptyString(value.label) ||
    typeof value.isFavorite !== "boolean" ||
    !isValidTimestamp(value.createdAt) ||
    !isValidTimestamp(value.lastUsedAt)
  ) {
    return null;
  }

  const metadata = sanitizeSavedPlaceMetadata(value.metadata);

  return {
    ...place,
    id: value.id,
    label: value.label,
    isFavorite: value.isFavorite,
    createdAt: value.createdAt,
    lastUsedAt: value.lastUsedAt,
    ...(metadata ? { metadata } : {}),
  };
}

function sanitizeRecentSearch(value: unknown): RecentSearch | null {
  if (!isRecord(value) || !isNonEmptyString(value.query) || !isValidTimestamp(value.timestamp)) {
    return null;
  }

  const origin = sanitizePlace(value.origin);
  const resultCount =
    isFiniteNumber(value.resultCount) && value.resultCount >= 0 ? value.resultCount : undefined;

  return {
    query: value.query,
    timestamp: value.timestamp,
    ...(origin ? { origin } : {}),
    ...(resultCount !== undefined ? { resultCount } : {}),
  };
}

function sanitizeSearchFilters(value: unknown): MapSearchFilters | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const nextFilters: MapSearchFilters = {};
  if (isFiniteNumber(value.maxDistanceMiles) && value.maxDistanceMiles > 0) {
    nextFilters.maxDistanceMiles = value.maxDistanceMiles;
  }

  if (isFiniteNumber(value.minRating) && value.minRating >= 0 && value.minRating <= 5) {
    nextFilters.minRating = value.minRating;
  }

  const serviceTypes = sanitizeStringArray(value.serviceTypes);
  if (serviceTypes.length > 0) {
    nextFilters.serviceTypes = serviceTypes;
  }

  const insurerPrograms = sanitizeStringArray(value.insurerPrograms);
  if (insurerPrograms.length > 0) {
    nextFilters.insurerPrograms = insurerPrograms;
  }

  const vehicleTypes = sanitizeStringArray(value.vehicleTypes);
  if (vehicleTypes.length > 0) {
    nextFilters.vehicleTypes = vehicleTypes;
  }

  if (typeof value.searchWithinViewport === "boolean") {
    nextFilters.searchWithinViewport = value.searchWithinViewport;
  }

  if (typeof value.openNow === "boolean") {
    nextFilters.openNow = value.openNow;
  }

  if (typeof value.hasAvailability === "boolean") {
    nextFilters.hasAvailability = value.hasAvailability;
  }

  return Object.keys(nextFilters).length > 0 ? nextFilters : undefined;
}

// ── Main sanitizer ──────────────────────────────────────────────────

export function sanitizeMemory(memory?: unknown): WebsiteSessionMemory {
  const parsedMemory = isRecord(memory) ? memory : null;
  const shopDirectory = isRecord(parsedMemory?.shopDirectory) ? parsedMemory.shopDirectory : null;
  const insuranceConnection = isRecord(parsedMemory?.insuranceConnection)
    ? parsedMemory.insuranceConnection
    : null;
  const mapSession = isRecord(parsedMemory?.mapSession) ? parsedMemory.mapSession : null;
  const lastSearchOrigin = sanitizePlace(mapSession?.lastSearchOrigin);
  const lastSearchFilters = sanitizeSearchFilters(mapSession?.lastSearchFilters);
  const lastViewedShopId = sanitizePositiveInteger(mapSession?.lastViewedShopId);
  const selectedRouteId = isNonEmptyString(mapSession?.selectedRouteId)
    ? mapSession.selectedRouteId
    : undefined;
  const lastMapCenter = sanitizeCoordinates(mapSession?.lastMapCenter);
  const lastMapZoom =
    isFiniteNumber(mapSession?.lastMapZoom) &&
    mapSession.lastMapZoom >= 0 &&
    mapSession.lastMapZoom <= 24
      ? mapSession.lastMapZoom
      : undefined;
  const lastViewportBounds = sanitizeViewportBounds(mapSession?.lastViewportBounds);

  return {
    updatedAt: isValidTimestamp(parsedMemory?.updatedAt)
      ? parsedMemory.updatedAt
      : DEFAULT_MEMORY.updatedAt,
    shopDirectory: {
      searchQuery:
        typeof shopDirectory?.searchQuery === "string"
          ? shopDirectory.searchQuery
          : DEFAULT_MEMORY.shopDirectory.searchQuery,
      filterRating:
        isFiniteNumber(shopDirectory?.filterRating) &&
        shopDirectory.filterRating >= 0 &&
        shopDirectory.filterRating <= 5
          ? shopDirectory.filterRating
          : DEFAULT_MEMORY.shopDirectory.filterRating,
      sortBy: isAllowedValue(SHOP_SORT_OPTIONS, shopDirectory?.sortBy)
        ? shopDirectory.sortBy
        : DEFAULT_MEMORY.shopDirectory.sortBy,
      lastViewedShopId: sanitizeNullablePositiveInteger(shopDirectory?.lastViewedShopId),
      sessionIntelligenceOpen:
        typeof shopDirectory?.sessionIntelligenceOpen === "boolean"
          ? shopDirectory.sessionIntelligenceOpen
          : DEFAULT_MEMORY.shopDirectory.sessionIntelligenceOpen,
    },
    insuranceConnection: {
      connectedInsurerIds: sanitizeNumericCollection(insuranceConnection?.connectedInsurerIds),
      draftPolicyNumber:
        typeof insuranceConnection?.draftPolicyNumber === "string"
          ? insuranceConnection.draftPolicyNumber
          : DEFAULT_MEMORY.insuranceConnection.draftPolicyNumber,
      draftClaimNumber:
        typeof insuranceConnection?.draftClaimNumber === "string"
          ? insuranceConnection.draftClaimNumber
          : DEFAULT_MEMORY.insuranceConnection.draftClaimNumber,
      lastSelectedInsurerId: sanitizeNullablePositiveInteger(
        insuranceConnection?.lastSelectedInsurerId
      ),
    },
    mapSession: {
      ...DEFAULT_MAP_SESSION,
      savedPlaces: Array.isArray(mapSession?.savedPlaces)
        ? mapSession.savedPlaces
            .map((value) => sanitizeSavedPlace(value))
            .filter((value): value is SavedPlace => Boolean(value))
        : DEFAULT_MAP_SESSION.savedPlaces,
      recentSearches: Array.isArray(mapSession?.recentSearches)
        ? mapSession.recentSearches
            .map((value) => sanitizeRecentSearch(value))
            .filter((value): value is RecentSearch => Boolean(value))
        : DEFAULT_MAP_SESSION.recentSearches,
      customerSavedShopIds: sanitizeNumericCollection(mapSession?.customerSavedShopIds),
      shopWatchlistIds: sanitizeNumericCollection(mapSession?.shopWatchlistIds),
      insurerShortlistIds: sanitizeNumericCollection(mapSession?.insurerShortlistIds),
      mapViewMode: isAllowedValue(MAP_VIEW_MODES, mapSession?.mapViewMode)
        ? mapSession.mapViewMode
        : DEFAULT_MAP_SESSION.mapViewMode,
      mapTheme: isAllowedValue(MAP_THEMES, mapSession?.mapTheme)
        ? mapSession.mapTheme
        : DEFAULT_MAP_SESSION.mapTheme,
      showClusters:
        typeof mapSession?.showClusters === "boolean"
          ? mapSession.showClusters
          : DEFAULT_MAP_SESSION.showClusters,
      clusterLevel: isAllowedValue(CLUSTER_LEVELS, mapSession?.clusterLevel)
        ? mapSession.clusterLevel
        : DEFAULT_MAP_SESSION.clusterLevel,
      updatedAt: isValidTimestamp(mapSession?.updatedAt)
        ? mapSession.updatedAt
        : DEFAULT_MAP_SESSION.updatedAt,
      ...(lastSearchOrigin ? { lastSearchOrigin } : {}),
      ...(typeof mapSession?.lastSearchQuery === "string"
        ? { lastSearchQuery: mapSession.lastSearchQuery }
        : {}),
      ...(lastSearchFilters ? { lastSearchFilters } : {}),
      ...(lastViewedShopId !== undefined ? { lastViewedShopId } : {}),
      ...(selectedRouteId ? { selectedRouteId } : {}),
      ...(lastMapCenter ? { lastMapCenter } : {}),
      ...(lastMapZoom !== undefined ? { lastMapZoom } : {}),
      ...(lastViewportBounds ? { lastViewportBounds } : {}),
    },
  };
}

export function sanitizeWebsiteSessionMemory(memory?: unknown): WebsiteSessionMemory {
  return sanitizeMemory(memory);
}
