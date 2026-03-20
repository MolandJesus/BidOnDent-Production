import type {
  CoveragePartnerShop,
  CoverageSearchTarget,
} from "../../components/maps/serviceCoverageMapTypes";
import type { NavigationProvider } from "../../types/navigation";
import { saveNavigationSession } from "./navigationSession";

export type { NavigationProvider } from "../../types/navigation";

export type NavigationMapDestination = Pick<
  CoveragePartnerShop,
  "id" | "name" | "lat" | "lng" | "addressLine"
>;

export const navigationProviderOptions: Array<{ id: NavigationProvider; label: string }> = [
  { id: "apple", label: "Apple Maps" },
  { id: "google", label: "Google Maps" },
  { id: "waze", label: "Waze" },
];

type OpenDirectionsArgs = {
  provider: NavigationProvider;
  destination: NavigationMapDestination;
  origin?: CoverageSearchTarget | null;
};

export function getNavigationProviderLabel(provider: NavigationProvider) {
  return navigationProviderOptions.find((option) => option.id === provider)?.label || "Maps";
}

export function buildDirectionsUrl({ provider, destination, origin }: OpenDirectionsArgs) {
  const destinationLabel = encodeURIComponent(destination.name);
  const destinationCoordinates = `${destination.lat},${destination.lng}`;
  const originCoordinates =
    origin && typeof origin.lat === "number" && typeof origin.lng === "number"
      ? `${origin.lat},${origin.lng}`
      : "";

  if (provider === "google") {
    const query = new URLSearchParams({
      api: "1",
      destination: destinationCoordinates,
      travelmode: "driving",
    });

    if (originCoordinates) {
      query.set("origin", originCoordinates);
    }

    return `https://www.google.com/maps/dir/?${query.toString()}`;
  }

  if (provider === "waze") {
    return `https://www.waze.com/ul?ll=${destinationCoordinates}&navigate=yes`;
  }

  const params = new URLSearchParams({
    daddr: destinationCoordinates,
    q: destinationLabel,
    dirflg: "d",
  });

  if (originCoordinates) {
    params.set("saddr", originCoordinates);
  }

  return `https://maps.apple.com/?${params.toString()}`;
}

export function openDirections(args: OpenDirectionsArgs) {
  saveNavigationSession({
    provider: args.provider,
    destinationId: args.destination.id,
    destinationName: args.destination.name,
    destinationAddress: args.destination.addressLine,
    destinationCoordinates: {
      lat: args.destination.lat,
      lng: args.destination.lng,
    },
    originLabel: args.origin?.label,
    originCoordinates:
      args.origin && typeof args.origin.lat === "number" && typeof args.origin.lng === "number"
        ? {
            lat: args.origin.lat,
            lng: args.origin.lng,
          }
        : undefined,
    launchedAt: new Date().toISOString(),
  });

  const url = buildDirectionsUrl(args);
  window.open(url, "_blank", "noopener,noreferrer");
}
