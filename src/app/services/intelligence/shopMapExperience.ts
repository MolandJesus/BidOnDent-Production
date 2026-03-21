import type { ShopSortOption } from "../auth/websiteIdentity";
import type {
  Coordinates,
  MapSearchFilters,
  MapShopResult,
  MapViewportBounds,
  Place,
  RouteInstruction,
  RouteOption,
  SearchOrigin,
} from "../../types/mapDomain";
import type { ShopBusinessProfile } from "../../types/networkProfiles";
import {
  buildShopRecommendations,
  getInsuranceDirectory,
  type DirectoryReport,
  type DirectoryVehicle,
  type MarketUserType,
  type ShopRecommendation,
} from "./marketIntelligence";
import type { MapSessionMemory } from "../../types/mapDomain";
import {
  buildDirectoryShopRecommendations,
  getDirectoryShopId,
  getShopCoordinates,
  mergeDirectoryEntriesByName,
} from "./directoryAdapters";

type ShopLocationRecord = {
  coordinates: Coordinates;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

export interface ShopMapListing extends ShopRecommendation {
  mapResult: MapShopResult;
  mapDistanceMiles: number;
  mapDistanceLabel: string;
}

export interface ShopMapFilterCatalog {
  insurerPrograms: string[];
  serviceTypes: string[];
  vehicleTypes: string[];
}

export type RoleShopCollectionKey =
  | "customerSavedShopIds"
  | "shopWatchlistIds"
  | "insurerShortlistIds";

const DEFAULT_MAP_CENTER: Coordinates = {
  latitude: 32.7767,
  longitude: -96.797,
};

const SHOP_LOCATION_DIRECTORY: Record<number, ShopLocationRecord> = {
  1: {
    coordinates: { latitude: 32.7876, longitude: -96.7998 },
    address: "2215 Ross Ave",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
  },
  2: {
    coordinates: { latitude: 32.8012, longitude: -96.8084 },
    address: "4201 Oak Lawn Ave",
    city: "Dallas",
    state: "TX",
    zipCode: "75219",
  },
  3: {
    coordinates: { latitude: 32.7639, longitude: -96.7917 },
    address: "1515 Elm St",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
  },
  4: {
    coordinates: { latitude: 32.8239, longitude: -96.7709 },
    address: "8300 Meadow Rd",
    city: "Dallas",
    state: "TX",
    zipCode: "75231",
  },
  5: {
    coordinates: { latitude: 32.8469, longitude: -96.7642 },
    address: "9440 Skillman St",
    city: "Dallas",
    state: "TX",
    zipCode: "75243",
  },
  6: {
    coordinates: { latitude: 32.7347, longitude: -96.8271 },
    address: "228 W Jefferson Blvd",
    city: "Dallas",
    state: "TX",
    zipCode: "75208",
  },
};

const SUGGESTED_SEARCH_ORIGINS: Place[] = [
  {
    name: "Downtown Dallas",
    address: "1500 Marilla St",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
    latitude: 32.7767,
    longitude: -96.797,
    placeId: "downtown-dallas",
  },
  {
    name: "Uptown",
    address: "2610 Maple Ave",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
    latitude: 32.7974,
    longitude: -96.8013,
    placeId: "uptown-dallas",
  },
  {
    name: "Love Field Corridor",
    address: "8008 Herb Kelleher Way",
    city: "Dallas",
    state: "TX",
    zipCode: "75235",
    latitude: 32.845,
    longitude: -96.8518,
    placeId: "love-field-corridor",
  },
  {
    name: "White Rock",
    address: "8300 Garland Rd",
    city: "Dallas",
    state: "TX",
    zipCode: "75218",
    latitude: 32.8151,
    longitude: -96.7173,
    placeId: "white-rock",
  },
];

const ROUTE_VARIANTS = [
  {
    id: "fastest",
    label: "Fastest",
    trafficLabel: "Light traffic",
    speedMph: 34,
    accentColor: "#2563eb",
    corridorLabel: "North Central corridor",
    latitudeOffset: 0.012,
    longitudeOffset: -0.01,
    bufferMinutes: 2,
  },
  {
    id: "balanced",
    label: "Balanced",
    trafficLabel: "Steady cross-town flow",
    speedMph: 29,
    accentColor: "#0f766e",
    corridorLabel: "Uptown connector",
    latitudeOffset: -0.008,
    longitudeOffset: 0.013,
    bufferMinutes: 4,
  },
  {
    id: "local",
    label: "Local roads",
    trafficLabel: "Signals + surface streets",
    speedMph: 24,
    accentColor: "#c2410c",
    corridorLabel: "Neighborhood streets",
    latitudeOffset: 0.016,
    longitudeOffset: 0.016,
    bufferMinutes: 6,
  },
] as const;

function roundDuration(durationMinutes: number) {
  return Math.max(4, Math.round(durationMinutes / 2) * 2);
}

function formatDurationLabel(durationMinutes: number) {
  if (durationMinutes >= 60) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours} hr ${minutes} min`;
  }

  return `${durationMinutes} min`;
}

function interpolatePoint(
  origin: Coordinates,
  destination: Coordinates,
  weight: number,
  latitudeOffset = 0,
  longitudeOffset = 0
): Coordinates {
  return {
    latitude:
      origin.latitude + (destination.latitude - origin.latitude) * weight + latitudeOffset,
    longitude:
      origin.longitude + (destination.longitude - origin.longitude) * weight + longitudeOffset,
  };
}

function buildRoutePolyline(
  origin: Coordinates,
  destination: Coordinates,
  latitudeOffset: number,
  longitudeOffset: number
) {
  return [
    origin,
    interpolatePoint(origin, destination, 0.28, latitudeOffset * 0.55, longitudeOffset * 0.45),
    interpolatePoint(origin, destination, 0.62, latitudeOffset, longitudeOffset),
    interpolatePoint(origin, destination, 0.84, latitudeOffset * 0.35, longitudeOffset * 0.25),
    destination,
  ];
}

function buildRouteInstructions({
  corridorLabel,
  destinationAddress,
  destinationName,
  destinationCity,
  durationMinutes,
  totalDistanceLabel,
}: {
  corridorLabel: string;
  destinationAddress: string;
  destinationCity: string;
  destinationName: string;
  durationMinutes: number;
  totalDistanceLabel: string;
}) {
  const firstLegMinutes = Math.max(3, Math.round(durationMinutes * 0.3));
  const secondLegMinutes = Math.max(4, Math.round(durationMinutes * 0.42));
  const finalLegMinutes = Math.max(2, durationMinutes - firstLegMinutes - secondLegMinutes);

  return [
    {
      id: "depart",
      title: "Depart",
      detail: "Head out from your selected origin and follow the first outbound streets.",
      distanceLabel: totalDistanceLabel,
      durationMinutes: firstLegMinutes,
    },
    {
      id: "corridor",
      title: `Follow ${corridorLabel}`,
      detail: `Stay on the main flow toward ${destinationCity} with BidOnDent's route preview pinned to the selected shop.`,
      distanceLabel: `${Math.max(0.8, Number((firstLegMinutes / 6).toFixed(1)))} mi`,
      durationMinutes: secondLegMinutes,
    },
    {
      id: "arrival-approach",
      title: "Approach destination",
      detail: `Use the final approach around ${destinationAddress} and prepare for shop intake or claim handoff.`,
      distanceLabel: `${Math.max(0.4, Number((finalLegMinutes / 8).toFixed(1)))} mi`,
      durationMinutes: finalLegMinutes,
    },
    {
      id: "arrive",
      title: `Arrive at ${destinationName}`,
      detail: "Selected shop details stay synced with the map card while you compare alternate routes.",
      distanceLabel: "Arrival",
      durationMinutes: 0,
    },
  ] satisfies RouteInstruction[];
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceMiles(origin: Coordinates, destination: Coordinates) {
  const earthRadiusMiles = 3958.8;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusMiles * (2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)));
}

function formatDistanceLabel(distanceMiles: number) {
  if (distanceMiles < 1) {
    return `${Math.round(distanceMiles * 10) / 10} mi`;
  }

  return `${distanceMiles.toFixed(1)} mi`;
}

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

function sortValuesByFrequency(values: string[]) {
  const counts = new Map<string, { count: number; value: string }>();

  values.forEach((value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }

    const key = normalizeValue(trimmedValue);
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
      return;
    }

    counts.set(key, {
      count: 1,
      value: trimmedValue,
    });
  });

  return [...counts.values()]
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))
    .map((entry) => entry.value);
}

function matchesSelection(candidates: string[], selections?: string[]) {
  if (!selections || selections.length === 0) {
    return true;
  }

  const normalizedCandidates = candidates.map((candidate) => normalizeValue(candidate));
  return selections.some((selection) => normalizedCandidates.includes(normalizeValue(selection)));
}

function isWithinViewportBounds(
  coordinates: Coordinates,
  viewportBounds?: MapViewportBounds
) {
  if (!viewportBounds) {
    return true;
  }

  return (
    coordinates.latitude <= viewportBounds.north &&
    coordinates.latitude >= viewportBounds.south &&
    coordinates.longitude <= viewportBounds.east &&
    coordinates.longitude >= viewportBounds.west
  );
}

function getLocationForShop(shopId: number): ShopLocationRecord {
  return (
    SHOP_LOCATION_DIRECTORY[shopId] || {
      coordinates: DEFAULT_MAP_CENTER,
      address: "Dallas Service Area",
      city: "Dallas",
      state: "TX",
      zipCode: "75201",
    }
  );
}

function sortListings(listings: ShopMapListing[], sortBy: ShopSortOption) {
  const sortedListings = [...listings];

  sortedListings.sort((left, right) => {
    if (sortBy === "rating") {
      return right.rating - left.rating;
    }

    if (sortBy === "reviews") {
      return right.reviews - left.reviews;
    }

    if (sortBy === "distance") {
      return left.mapDistanceMiles - right.mapDistanceMiles;
    }

    return right.recommendationScore - left.recommendationScore;
  });

  return sortedListings;
}

function buildMapListingFromRecommendation(
  shop: ShopRecommendation,
  location: ShopLocationRecord,
  origin?: SearchOrigin
) {
  const mapDistanceMiles = origin ? calculateDistanceMiles(origin, location.coordinates) : shop.distanceMiles;

  const mapResult: MapShopResult = {
    id: shop.id,
    name: shop.name,
    coordinates: location.coordinates,
    address: location.address,
    city: location.city,
    state: location.state,
    zipCode: location.zipCode,
    distanceMiles: mapDistanceMiles,
    rating: shop.rating,
    reviews: shop.reviews,
    image: shop.image,
    certifications: shop.certifications,
    responseTimeHours: shop.responseTimeHours,
    completionRate: shop.completionRate,
    specialties: shop.specialties,
    supportedMakes: shop.supportedMakes,
    insurerPrograms: shop.insurerPrograms,
    aiSummary: shop.aiSummary,
    matchScore: shop.recommendationScore,
    insuranceCompatibilityScore: shop.insuranceCompatibilityScore,
  };

  return {
    ...shop,
    mapResult,
    mapDistanceMiles,
    mapDistanceLabel: formatDistanceLabel(mapDistanceMiles),
  } satisfies ShopMapListing;
}

function withAdjustedTopPick(listings: ShopMapListing[]) {
  return listings.map((listing, index) => ({
    ...listing,
    topPick: index === 0,
  }));
}

export function buildShopMapFilterCatalog(listings: ShopMapListing[]): ShopMapFilterCatalog {
  return {
    insurerPrograms: sortValuesByFrequency(
      listings.flatMap((listing) => listing.insurerPrograms)
    ),
    serviceTypes: sortValuesByFrequency(
      listings.flatMap((listing) => listing.specialties)
    ),
    vehicleTypes: sortValuesByFrequency(
      listings.flatMap((listing) => listing.supportedVehicleTypes)
    ),
  };
}

export function applyShopMapListingFilters({
  listings,
  filters,
  viewportBounds,
}: {
  listings: ShopMapListing[];
  filters?: MapSearchFilters;
  viewportBounds?: MapViewportBounds;
}) {
  const filteredListings = listings.filter((listing) => {
    if (
      typeof filters?.minRating === "number" &&
      filters.minRating > 0 &&
      listing.rating < filters.minRating
    ) {
      return false;
    }

    if (
      typeof filters?.maxDistanceMiles === "number" &&
      filters.maxDistanceMiles > 0 &&
      listing.mapDistanceMiles > filters.maxDistanceMiles
    ) {
      return false;
    }

    if (!matchesSelection(listing.specialties, filters?.serviceTypes)) {
      return false;
    }

    if (!matchesSelection(listing.insurerPrograms, filters?.insurerPrograms)) {
      return false;
    }

    if (!matchesSelection(listing.supportedVehicleTypes, filters?.vehicleTypes)) {
      return false;
    }

    if (
      filters?.searchWithinViewport &&
      !isWithinViewportBounds(listing.mapResult.coordinates, viewportBounds)
    ) {
      return false;
    }

    return true;
  });

  return withAdjustedTopPick(filteredListings);
}

export function getDefaultMapCenter() {
  return DEFAULT_MAP_CENTER;
}

export function getSuggestedSearchOrigins() {
  return SUGGESTED_SEARCH_ORIGINS;
}

export function getRoleCollectionKey(userType: MarketUserType): RoleShopCollectionKey {
  if (userType === "shop") {
    return "shopWatchlistIds";
  }

  if (userType === "insurer") {
    return "insurerShortlistIds";
  }

  return "customerSavedShopIds";
}

export function getRoleCollectionTitle(userType: MarketUserType) {
  if (userType === "shop") {
    return "Competitor watchlist";
  }

  if (userType === "insurer") {
    return "Partner shortlist";
  }

  return "Saved shops";
}

export function getRoleCollectionActionLabels(userType: MarketUserType, isCollected: boolean) {
  if (userType === "shop") {
    return isCollected
      ? { primary: "Remove from watchlist", sectionCta: "Watched competitor" }
      : { primary: "Track competitor", sectionCta: "Add competitor" };
  }

  if (userType === "insurer") {
    return isCollected
      ? { primary: "Remove from shortlist", sectionCta: "Shortlisted partner" }
      : { primary: "Shortlist partner", sectionCta: "Add partner" };
  }

  return isCollected
    ? { primary: "Remove saved shop", sectionCta: "Saved for bids" }
    : { primary: "Save for bids", sectionCta: "Save shop" };
}

export function getRoleCollectionShopIds(
  userType: MarketUserType,
  mapSession?: MapSessionMemory | null
) {
  if (!mapSession) {
    return [];
  }

  return mapSession[getRoleCollectionKey(userType)] || [];
}

export function toggleRoleCollectionShopId(
  currentIds: number[],
  shopId: number
) {
  if (currentIds.includes(shopId)) {
    return currentIds.filter((id) => id !== shopId);
  }

  return [...currentIds, shopId];
}

export function buildShopMapListings({
  userType,
  searchQuery = "",
  vehicles = [],
  reports = [],
  connectedInsurerIds = [],
  filterRating = 0,
  filters,
  sortBy = "smart-match",
  origin,
  directoryInsurers = [],
  directoryShops = [],
}: {
  userType: MarketUserType;
  searchQuery?: string;
  vehicles?: DirectoryVehicle[];
  reports?: DirectoryReport[];
  connectedInsurerIds?: number[];
  filterRating?: number;
  filters?: MapSearchFilters;
  sortBy?: ShopSortOption;
  origin?: SearchOrigin;
  directoryInsurers?: Parameters<typeof getInsuranceDirectory>[0];
  directoryShops?: ShopBusinessProfile[];
}) {
  const minimumRating = filters?.minRating ?? filterRating;
  const baseRecommendations = buildShopRecommendations({
    userType,
    searchQuery,
    vehicles,
    reports,
    connectedInsurerIds,
    filterRating: minimumRating,
    sortBy,
  });
  const connectedCarrierNames = getInsuranceDirectory(directoryInsurers)
    .filter((insurer) => connectedInsurerIds.includes(insurer.id))
    .map((insurer) => insurer.name);
  const directoryRecommendations = buildDirectoryShopRecommendations({
    connectedCarrierNames,
    directoryShops,
    filterRating: minimumRating,
    reports,
    searchQuery,
    userType,
    vehicles,
  });
  const mappedSeedListings = baseRecommendations.map((shop) =>
    buildMapListingFromRecommendation(shop, getLocationForShop(shop.id), origin)
  );
  const mappedDirectoryListings = directoryRecommendations.map((shop) => {
    const profile = directoryShops.find((entry) => getDirectoryShopId(entry) === shop.id);
    const coordinates = profile
      ? getShopCoordinates(profile)
      : getDefaultMapCenter();

    return buildMapListingFromRecommendation(
      shop,
      {
        address: profile?.businessAddress || "BidOnDent Network",
        city: profile?.businessCity || "Dallas",
        coordinates,
        state: profile?.businessState || "TX",
        zipCode: profile?.businessZip || "75201",
      },
      origin
    );
  });
  const mergedListings = mergeDirectoryEntriesByName(mappedSeedListings, mappedDirectoryListings);

  return applyShopMapListingFilters({
    filters: {
      ...filters,
      minRating: minimumRating,
    },
    listings: sortListings(mergedListings, sortBy),
  });
}

export function buildRoleAwareMapHighlights({
  userType,
  recommendations,
  reports,
  connectedCarrierCount,
}: {
  userType: MarketUserType;
  recommendations: ShopMapListing[];
  reports: DirectoryReport[];
  connectedCarrierCount: number;
}) {
  const topRecommendations = recommendations.slice(0, 3);
  const averageCompletionRate =
    topRecommendations.reduce((total, shop) => total + shop.completionRate, 0) /
      Math.max(topRecommendations.length, 1) || 0;
  const averageTicketValue =
    topRecommendations.reduce((total, shop) => total + shop.averagePriceValue, 0) /
      Math.max(topRecommendations.length, 1) || 0;
  const networkReadyCount = recommendations.filter((shop) => shop.insurerPrograms.length >= 3).length;
  const damageSignalCount = reports.reduce((count, report) => {
    const signalCount =
      (report.damageArea ? 1 : 0) +
      (report.damageType ? 1 : 0) +
      (Array.isArray(report.damageAreas) ? report.damageAreas.length : 0);

    return count + signalCount;
  }, 0);

  if (userType === "shop") {
    return {
      badge: "Competitive market scout",
      title: "Benchmark local players before pricing a job",
      description:
        "Use the map to compare nearby competitors, certification depth, and response speed before you position a bid.",
      metrics: [
        { label: "Top-3 Avg Ticket", value: `$${Math.round(averageTicketValue).toLocaleString()}` },
        { label: "Insurer-Ready Shops", value: String(networkReadyCount) },
      ],
      callouts: [
        "Nearest high-fit shops are clustered around central Dallas and Uptown.",
        "Luxury, EV, and ADAS capabilities are the clearest differentiation pockets in the current seed market.",
      ],
      primaryActionLabel: "Track competitor",
      secondaryActionLabel: "Review profile",
    };
  }

  if (userType === "insurer") {
    return {
      badge: "Network recruitment view",
      title: "Compare partner candidates with carrier-aware context",
      description:
        "This map favors shops that already show insurer-program familiarity, strong completion rates, and fast intake behavior.",
      metrics: [
        { label: "Network-Ready", value: String(networkReadyCount) },
        { label: "Avg Completion", value: `${Math.round(averageCompletionRate)}%` },
      ],
      callouts: [
        "Shops with three or more insurer programs should be the fastest shortlist for partner-network expansion.",
        "Use the selected shop card to inspect response speed and program overlap before outreach.",
      ],
      primaryActionLabel: "Shortlist partner",
      secondaryActionLabel: "Review fit",
    };
  }

  return {
    badge: "Customer repair routing",
    title: "Match shops using repair, insurer, and vehicle context",
    description:
      "BidOnDent is blending signed-in repair context, connected insurance preferences, and repair specialties into a map-first search flow.",
    metrics: [
      { label: "Connected Carriers", value: String(connectedCarrierCount) },
      { label: "Damage Signals", value: String(damageSignalCount) },
    ],
    callouts: [
      "Connected insurers lift compatible shops higher when the carrier already works with that repair program.",
      "Pick an origin to compare nearby shops visually before you start collecting or reviewing bids.",
    ],
    primaryActionLabel: "Save for bids",
    secondaryActionLabel: "View fit",
  };
}

export function buildShopRouteOptions({
  origin,
  shop,
}: {
  origin: SearchOrigin;
  shop: ShopMapListing | null;
}) {
  if (!origin || !shop) {
    return [] as RouteOption[];
  }

  const destination = shop.mapResult.coordinates;
  const baseDistance = calculateDistanceMiles(origin, destination);

  return ROUTE_VARIANTS.map((variant, index) => {
    const routeDistanceMiles = Number((baseDistance * (1 + index * 0.045)).toFixed(1));
    const estimatedDurationMinutes = roundDuration(
      (routeDistanceMiles / variant.speedMph) * 60 + variant.bufferMinutes
    );

    return {
      id: variant.id,
      label: variant.label,
      trafficLabel: variant.trafficLabel,
      totalDistanceMiles: routeDistanceMiles,
      totalDistanceLabel: formatDistanceLabel(routeDistanceMiles),
      estimatedDurationMinutes,
      accentColor: variant.accentColor,
      polyline: buildRoutePolyline(
        origin,
        destination,
        variant.latitudeOffset,
        variant.longitudeOffset
      ),
      instructions: buildRouteInstructions({
        corridorLabel: variant.corridorLabel,
        destinationAddress: shop.mapResult.address,
        destinationCity: shop.mapResult.city,
        destinationName: shop.name,
        durationMinutes: estimatedDurationMinutes,
        totalDistanceLabel: formatDistanceLabel(routeDistanceMiles),
      }),
    } satisfies RouteOption;
  });
}

export function buildRoleAwareRouteSummary({
  selectedRoute,
  shop,
  userType,
}: {
  selectedRoute: RouteOption | null;
  shop: ShopMapListing | null;
  userType: MarketUserType;
}) {
  if (!selectedRoute || !shop) {
    return {
      description: "Pick an origin to unlock route preview, ETA, and turn guidance.",
      title: "Route preview ready when you are",
    };
  }

  if (userType === "shop") {
    return {
      title: `Scout ${shop.name} in ${formatDurationLabel(selectedRoute.estimatedDurationMinutes)}`,
      description:
        "Use the route panel to benchmark how quickly your team could physically inspect or compare this competitor territory.",
    };
  }

  if (userType === "insurer") {
    return {
      title: `Plan a partner visit to ${shop.name}`,
      description:
        "The route preview helps claims and network teams estimate field-review timing before outreach or partner onboarding.",
    };
  }

  return {
    title: `Directions to ${shop.name}`,
    description:
      "Compare route timing before you commit to a repair conversation, drop-off, or tow coordination path.",
  };
}
