/**
 * navigationDestinationAdapters — Convert various source types into
 * the universal NavigationDestination used by routeEngine and guidance.
 */
import type { NavigationDestination } from "../../types/mapDomain";
import type { NavigationAddressResult } from "../../types/navigation";
import type { NavigationDiscoveryPlace } from "./placeDiscovery";
import type { AtlantaQADestination } from "../intelligence/atlantaQADestinations";

/** Nominatim address search result → NavigationDestination */
export function addressResultToNavigationDestination(
  result: NavigationAddressResult
): NavigationDestination {
  return {
    id: `addr-${result.id}`,
    name: result.primaryLabel,
    lat: result.lat,
    lng: result.lng,
    kind: "address",
    address: result.label,
  };
}

/** Overpass discovery place → NavigationDestination */
export function discoveryPlaceToNavigationDestination(
  place: NavigationDiscoveryPlace
): NavigationDestination {
  return {
    id: place.id,
    name: place.label,
    lat: place.coordinate.lat,
    lng: place.coordinate.lng,
    kind: "real_place",
    address: place.subtitle || undefined,
  };
}

/** Atlanta QA test destination → NavigationDestination */
export function qaDestinationToNavigationDestination(
  dest: AtlantaQADestination
): NavigationDestination {
  return {
    id: dest.id,
    name: dest.name,
    lat: dest.coordinates.lat,
    lng: dest.coordinates.lng,
    kind: "qa_seed_destination",
    address: dest.address,
  };
}
