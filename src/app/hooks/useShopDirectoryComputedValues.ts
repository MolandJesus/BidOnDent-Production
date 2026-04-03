import { useMemo } from "react";
import type { ShopSortOption } from "../services/auth/websiteIdentity";
import type { MarketUserType } from "../services/intelligence/marketIntelligence";
import {
  buildShopIntelligenceSummary,
  getInsuranceDirectory,
} from "../services/intelligence/marketIntelligence";
import {
  buildRoleAwareMapHighlights,
  buildShopMapListings,
  getRoleCollectionKey,
  getRoleCollectionTitle,
  getSuggestedSearchOrigins,
} from "../services/intelligence/shopMapExperience";
import { convertPartnerShopsToProfiles } from "../services/intelligence/directoryAdapters";
import type { MapViewMode, MapViewportBounds, Place, SavedPlace } from "../types/mapDomain";
import type { ShopBusinessProfile } from "../types/networkProfiles";
import type { InsurerBusinessProfile } from "../types/networkProfiles";
import type { CoveragePartnerShop } from "../components/maps/serviceCoverageMapTypes";
import { slugify } from "./shopDirectorySessionUtils";

interface ComputedValuesDeps {
  inventoryShops: ShopBusinessProfile[];
  inventoryInsurers: InsurerBusinessProfile[];
  partnerShops: CoveragePartnerShop[];
  searchQuery: string;
  deferredSearchQuery: string;
  filterRating: number;
  sortBy: ShopSortOption;
  selectedShopId: number | null;
  connectedInsurerIds: number[];
  selectedOrigin: Place | null;
  savedPlaces: SavedPlace[];
  customerSavedShopIds: number[];
  shopWatchlistIds: number[];
  insurerShortlistIds: number[];
  mapViewMode: MapViewMode;
  isMapDark: boolean;
  mapViewportBounds: MapViewportBounds | undefined;
  searchWithinViewport: boolean;
  userType: MarketUserType;
  vehicles: Array<{ make?: string; model?: string; year?: string | number }>;
  reports: Array<{
    damageArea?: string;
    damageAreas?: string[];
    damageType?: string;
    description?: string;
  }>;
}

export function useShopDirectoryComputedValues(deps: ComputedValuesDeps) {
  const {
    inventoryShops,
    inventoryInsurers,
    partnerShops,
    searchQuery,
    deferredSearchQuery,
    filterRating,
    sortBy,
    selectedShopId,
    connectedInsurerIds,
    selectedOrigin,
    savedPlaces,
    customerSavedShopIds,
    shopWatchlistIds,
    insurerShortlistIds,
    mapViewMode,
    isMapDark,
    mapViewportBounds,
    searchWithinViewport,
    userType,
    vehicles,
    reports,
  } = deps;

  const allDirectoryShops = useMemo(() => {
    const partnerProfiles = convertPartnerShopsToProfiles(partnerShops);
    if (partnerProfiles.length === 0) return inventoryShops;
    const byName = new Map(inventoryShops.map((s) => [s.businessName.toLowerCase(), s]));
    const merged = [...inventoryShops];
    for (const profile of partnerProfiles) {
      if (!byName.has(profile.businessName.toLowerCase())) {
        merged.push(profile);
      }
    }
    return merged;
  }, [inventoryShops, partnerShops]);

  const mapListings = useMemo(
    () =>
      buildShopMapListings({
        connectedInsurerIds,
        directoryInsurers: inventoryInsurers,
        directoryShops: allDirectoryShops,
        filterRating,
        filters: searchWithinViewport ? { searchWithinViewport: true } : undefined,
        origin: selectedOrigin,
        reports,
        searchQuery: deferredSearchQuery,
        sortBy,
        userType,
        vehicles,
        viewportBounds: mapViewportBounds,
      }),
    [
      allDirectoryShops,
      connectedInsurerIds,
      deferredSearchQuery,
      filterRating,
      inventoryInsurers,
      mapViewportBounds,
      reports,
      searchWithinViewport,
      selectedOrigin,
      sortBy,
      userType,
      vehicles,
    ]
  );

  const exactSearchMatchedShop = useMemo(() => {
    const normalizedSearchQuery = slugify(searchQuery.trim());
    if (!normalizedSearchQuery) return null;
    return mapListings.find((shop) => slugify(shop.name) === normalizedSearchQuery) || null;
  }, [mapListings, searchQuery]);

  const summary = buildShopIntelligenceSummary(mapListings, {
    connectedInsurerIds,
    reports,
    searchQuery: deferredSearchQuery,
    userType,
    vehicles,
  });

  const connectedCarrierNames = getInsuranceDirectory(inventoryInsurers)
    .filter((insurer) => connectedInsurerIds.includes(insurer.id))
    .map((insurer) => insurer.name);

  const roleHighlights = buildRoleAwareMapHighlights({
    connectedCarrierCount: connectedCarrierNames.length,
    recommendations: mapListings,
    reports,
    userType,
  });

  const collectionUniverse = buildShopMapListings({
    connectedInsurerIds,
    directoryInsurers: inventoryInsurers,
    directoryShops: allDirectoryShops,
    origin: selectedOrigin,
    reports,
    searchQuery: "",
    sortBy: "smart-match",
    userType,
    vehicles,
  });

  const selectedShop =
    mapListings.find((shop) => shop.id === selectedShopId) ||
    exactSearchMatchedShop ||
    mapListings[0] ||
    null;

  const roleCollectionKey = getRoleCollectionKey(userType);
  const roleCollectionTitle = getRoleCollectionTitle(userType);
  const roleCollectionIds =
    roleCollectionKey === "shopWatchlistIds"
      ? shopWatchlistIds
      : roleCollectionKey === "insurerShortlistIds"
        ? insurerShortlistIds
        : customerSavedShopIds;
  const roleCollectionListings = collectionUniverse.filter((shop) =>
    roleCollectionIds.includes(shop.id)
  );

  const suggestedOrigins = getSuggestedSearchOrigins();
  const directionsActionLabel = "Get Directions";
  const showMapPane = mapViewMode !== "list";
  const isImmersive = mapViewMode === "map";

  const currentOriginIsSaved = selectedOrigin
    ? savedPlaces.some(
        (place) =>
          place.id === `saved-place-${selectedOrigin.placeId || slugify(selectedOrigin.name)}`
      )
    : false;

  return {
    allDirectoryShops,
    mapListings,
    exactSearchMatchedShop,
    summary,
    connectedCarrierNames,
    roleHighlights,
    collectionUniverse,
    selectedShop,
    roleCollectionKey,
    roleCollectionTitle,
    roleCollectionIds,
    roleCollectionListings,
    suggestedOrigins,
    directionsActionLabel,
    showMapPane,
    isImmersive,
    currentOriginIsSaved,
    resolvedMapTheme: (isMapDark ? "dark" : "light") as "light" | "dark",
  };
}
