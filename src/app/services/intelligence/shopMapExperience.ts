import type { ShopSortOption } from "../auth/websiteIdentity";
import type {
  Coordinates,
  MapSearchFilters,
  MapShopResult,
  MapViewportBounds,
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
import {
  buildDirectoryShopRecommendations,
  getDirectoryShopId,
  getShopCoordinates,
  mergeDirectoryEntriesByName,
} from "./directoryAdapters";
import {
  buildRoleAwareRouteSummary,
  buildShopRouteOptions,
  calculateDistanceMiles,
  formatDistanceLabel,
} from "./shopMapRouting";
import {
  getDefaultMapCenter,
  getLocationForShop,
  getSuggestedSearchOrigins,
  type ShopLocationRecord,
} from "./shopMapData";

export { buildRoleAwareRouteSummary, buildShopRouteOptions } from "./shopMapRouting";
export { getDefaultMapCenter, getSuggestedSearchOrigins } from "./shopMapData";
export {
  getRoleCollectionKey,
  getRoleCollectionTitle,
  getRoleCollectionActionLabels,
  getRoleCollectionShopIds,
  toggleRoleCollectionShopId,
  type RoleShopCollectionKey,
} from "./shopMapRoleCollections";

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

function isWithinViewportBounds(coordinates: Coordinates, viewportBounds?: MapViewportBounds) {
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
  const mapDistanceMiles = origin
    ? calculateDistanceMiles(origin, location.coordinates)
    : shop.distanceMiles;

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
    insurerPrograms: sortValuesByFrequency(listings.flatMap((listing) => listing.insurerPrograms)),
    serviceTypes: sortValuesByFrequency(listings.flatMap((listing) => listing.specialties)),
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
    const coordinates = profile ? getShopCoordinates(profile) : getDefaultMapCenter();

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
  const networkReadyCount = recommendations.filter(
    (shop) => shop.insurerPrograms.length >= 3
  ).length;
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
