/**
 * navigationDestinationAdapters — Convert various source types into
 * the universal NavigationDestination used by routeEngine and guidance.
 */
import type { NavigationDestination } from "../../types/mapDomain";
import type { NavigationAddressResult } from "../../types/navigation";
import type { SessionWaypoint } from "../../features/navigation/sessionTypes";
import type { NavigationDiscoveryPlace } from "./placeDiscovery";
import type { NYMetroQADestination } from "../intelligence/nyMetroQADestinations";

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

/** QA test destination → NavigationDestination */
export function qaDestinationToNavigationDestination(
  dest: NYMetroQADestination
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

/** Universal NavigationDestination → SessionWaypoint for the navigation session */
export function navigationDestinationToSessionWaypoint(
  dest: NavigationDestination
): SessionWaypoint {
  return {
    id: dest.id,
    label: dest.name,
    address: dest.address,
    coordinate: { lat: dest.lat, lng: dest.lng },
  };
}
