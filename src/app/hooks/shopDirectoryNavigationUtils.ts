import type {
  CoveragePartnerShop,
  CoverageSearchTarget,
} from "../components/maps/serviceCoverageMapTypes";
import type { ShopMapListing } from "../services/intelligence/shopMapExperience";
import type { NavigationDestination } from "../types/mapDomain";
import type { useShopDirectorySession } from "./useShopDirectorySession";

type ShopDirectorySession = ReturnType<typeof useShopDirectorySession>;

export function toCoveragePartnerShop(shop: ShopMapListing): CoveragePartnerShop {
  return {
    id: String(shop.id),
    name: shop.name,
    countyLabel: [shop.mapResult.city, shop.mapResult.state].filter(Boolean).join(", "),
    lat: shop.mapResult.coordinates.latitude,
    lng: shop.mapResult.coordinates.longitude,
    label: shop.name,
    addressLine: [
      shop.mapResult.address,
      shop.mapResult.city,
      shop.mapResult.state,
      shop.mapResult.zipCode,
    ]
      .filter(Boolean)
      .join(", "),
    specialties: shop.specialties,
    rating: shop.rating,
    distanceMiles: shop.mapDistanceMiles,
  };
}

/** Convert a ShopMapListing to the universal NavigationDestination for routing/guidance */
export function shopToNavigationDestination(shop: ShopMapListing): NavigationDestination {
  return {
    id: String(shop.id),
    name: shop.name,
    lat: shop.mapResult.coordinates.latitude,
    lng: shop.mapResult.coordinates.longitude,
    kind: "shop",
    address: [
      shop.mapResult.address,
      shop.mapResult.city,
      shop.mapResult.state,
      shop.mapResult.zipCode,
    ]
      .filter(Boolean)
      .join(", "),
  };
}

export function buildShopGuidanceOriginTarget(
  selectedOrigin: NonNullable<ShopDirectorySession["selectedOrigin"]>,
  gpsTrackingEnabled: boolean,
  currentPosition: { lat: number; lng: number } | null
): CoverageSearchTarget {
  if (selectedOrigin.placeId === "user-geolocation" && gpsTrackingEnabled && currentPosition) {
    return {
      lat: currentPosition.lat,
      lng: currentPosition.lng,
      label: "Live GPS position",
      source: "geolocation",
    };
  }

  return {
    lat: selectedOrigin.latitude,
    lng: selectedOrigin.longitude,
    county: [selectedOrigin.city, selectedOrigin.state].filter(Boolean).join(", "),
    label: selectedOrigin.name,
    source: selectedOrigin.placeId === "user-geolocation" ? "geolocation" : "address",
  };
}
