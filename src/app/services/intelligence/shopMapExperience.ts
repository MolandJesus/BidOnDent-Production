import type { ShopSortOption } from "../auth/websiteIdentity";
import type { MapSearchFilters, MapViewportBounds, SearchOrigin } from "../../types/mapDomain";

import type { ShopBusinessProfile } from "../../types/networkProfiles";
import {
  buildShopRecommendations,
  getInsuranceDirectory,
  type DirectoryReport,
  type DirectoryVehicle,
  type MarketUserType,
} from "./marketIntelligence";
import {
  buildDirectoryShopRecommendations,
  getDirectoryShopId,
  getShopCoordinates,
  mergeDirectoryEntriesByName,
} from "./directoryAdapters";
import { getDefaultMapCenter, getLocationForShop } from "./shopMapData";
import {
  type ShopMapListing,
  type ShopMapFilterCatalog,
  sortValuesByFrequency,
  matchesSelection,
  isWithinViewportBounds,
  sortListings,
  buildMapListingFromRecommendation,
  withAdjustedTopPick,
} from "./shopMapExperienceHelpers";

export type { ShopMapListing, ShopMapFilterCatalog };
export { buildRoleAwareMapHighlights } from "./shopMapExperienceHelpers";
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
  viewportBounds,
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
  viewportBounds?: MapViewportBounds;
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
        city: profile?.businessCity || "White Plains",
        coordinates,
        state: profile?.businessState || "NY",
        zipCode: profile?.businessZip || "10601",
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
    viewportBounds,
  });
}
