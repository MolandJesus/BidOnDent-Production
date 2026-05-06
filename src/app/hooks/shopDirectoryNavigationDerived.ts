/**
 * shopDirectoryNavigationDerived — Pure derived-state computation for the navigation hook.
 *
 * Extracted from useShopDirectoryNavigation to keep it under the 500-line hard limit.
 * All functions are side-effect-free and return derived values from navigation state inputs.
 */
import type {
  MarketUserType,
  IntelligenceSummary,
} from "../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../services/intelligence/shopMapExperience";
import { buildRoleAwareRouteSummary } from "../services/intelligence/shopMapExperience";
import type { NavigationDestination, RouteOption } from "../types/mapDomain";
import type { NavigationSessionStatus } from "../features/navigation";
import type { NavigationRoutePreview } from "../types/navigation";
import { formatDistanceLabel } from "../services/intelligence/shopMapRouting";
import { buildLiveRouteOptionsFromPreviews } from "./useShopDirectoryRoutePreview";
import { getShopRouteActionLabel } from "./shopDirectorySessionUtils";

/* ── Live navigation flags ──────────────────────────── */

export function computeLiveNavigationFlags(params: {
  selectedShop: ShopMapListing | null;
  directDestination: NavigationDestination | null;
  navigationSessionDestinationId: string | null;
  sessionStatus: NavigationSessionStatus;
  hasArrived: boolean;
}) {
  const {
    selectedShop,
    directDestination,
    navigationSessionDestinationId,
    sessionStatus,
    hasArrived,
  } = params;
  const isActiveOrPaused = sessionStatus === "active" || sessionStatus === "paused";

  const liveNavigationForSelectedShop = Boolean(
    selectedShop && navigationSessionDestinationId === String(selectedShop.id) && isActiveOrPaused
  );
  const liveNavigationForDirectDest = Boolean(
    directDestination &&
      navigationSessionDestinationId === String(directDestination.id) &&
      isActiveOrPaused
  );
  const liveNavigationActive = liveNavigationForSelectedShop || liveNavigationForDirectDest;

  const hasArrivedForSelectedShop = Boolean(
    selectedShop && navigationSessionDestinationId === String(selectedShop.id) && hasArrived
  );
  const hasArrivedForDestination = Boolean(liveNavigationActive && hasArrived);

  return {
    liveNavigationForSelectedShop,
    liveNavigationForDirectDest,
    liveNavigationActive,
    hasArrivedForSelectedShop,
    hasArrivedForDestination,
  };
}

/* ── Route display state ────────────────────────────── */

export function computeRouteDisplayState(params: {
  liveNavigationActive: boolean;
  guidanceSelectedDestination: NavigationDestination | null;
  routeAlternatives: NavigationRoutePreview[];
  sessionRouteOptions: RouteOption[];
  sessionSelectedRouteId: string | null;
  selectedShop: ShopMapListing | null;
  directDestination: NavigationDestination | null;
  userType: MarketUserType;
  hasIntelligenceEvent: boolean;
  sessionRouteSummary: IntelligenceSummary;
}) {
  const {
    liveNavigationActive,
    guidanceSelectedDestination,
    routeAlternatives,
    sessionRouteOptions,
    sessionSelectedRouteId,
    selectedShop,
    directDestination,
    userType,
    hasIntelligenceEvent,
    sessionRouteSummary,
  } = params;

  const liveGuidanceRouteOptions = guidanceSelectedDestination
    ? buildLiveRouteOptionsFromPreviews(routeAlternatives, guidanceSelectedDestination.name)
    : [];

  const mapRouteOptions =
    liveNavigationActive && liveGuidanceRouteOptions.length > 0
      ? liveGuidanceRouteOptions
      : sessionRouteOptions;

  const mapSelectedRoute =
    mapRouteOptions.find((route) => route.id === sessionSelectedRouteId) ||
    mapRouteOptions[0] ||
    null;

  const mapRouteSummary =
    liveNavigationActive && (selectedShop || directDestination)
      ? buildRoleAwareRouteSummary({
          selectedRoute: mapSelectedRoute,
          shop:
            selectedShop ??
            ({
              id: 0,
              name: directDestination?.name ?? "Destination",
              mapResult: {
                address: directDestination?.address ?? "",
                coordinates: {
                  latitude: directDestination?.lat ?? 0,
                  longitude: directDestination?.lng ?? 0,
                },
              },
            } as NonNullable<typeof selectedShop>),
          userType,
          isActiveGuidance: Boolean(liveNavigationActive || hasIntelligenceEvent),
        })
      : sessionRouteSummary;

  return { liveGuidanceRouteOptions, mapRouteOptions, mapSelectedRoute, mapRouteSummary };
}

/* ── ETA/distance labels ────────────────────────────── */

export function computeRemainingLabels(params: {
  liveNavigationActive: boolean;
  hasArrived: boolean;
  hasArrivedForDestination: boolean;
  routePreview: NavigationRoutePreview | null;
  currentStepIndex: number;
  currentSpeedMph: number;
}) {
  const {
    liveNavigationActive,
    hasArrived,
    hasArrivedForDestination,
    routePreview,
    currentStepIndex,
    currentSpeedMph,
  } = params;

  const staticRemainingDurationSeconds = routePreview
    ? hasArrived
      ? 0
      : routePreview.steps
          .slice(currentStepIndex)
          .reduce((total, step) => total + step.durationSeconds, 0) || routePreview.durationSeconds
    : 0;
  const remainingDistanceMeters = routePreview
    ? hasArrived
      ? 0
      : routePreview.steps
          .slice(currentStepIndex)
          .reduce((total, step) => total + step.distanceMeters, 0) || routePreview.distanceMeters
    : 0;

  const remainingDurationSeconds = (() => {
    if (hasArrivedForDestination) return 0;
    if (!currentSpeedMph || currentSpeedMph < 3 || remainingDistanceMeters <= 0)
      return staticRemainingDurationSeconds;
    const speedBasedSeconds = (remainingDistanceMeters / 1609.34 / currentSpeedMph) * 3600;
    return Math.round(speedBasedSeconds * 0.7 + staticRemainingDurationSeconds * 0.3);
  })();

  const liveRemainingEtaLabel = hasArrivedForDestination
    ? "Arrived"
    : liveNavigationActive && remainingDurationSeconds > 0
      ? `${Math.round(remainingDurationSeconds / 60)}m`
      : null;
  const liveRemainingDistanceLabel = hasArrivedForDestination
    ? "Here"
    : liveNavigationActive && remainingDistanceMeters > 0
      ? formatDistanceLabel(remainingDistanceMeters / 1609.34)
      : null;

  return {
    remainingDurationSeconds,
    remainingDistanceMeters,
    liveRemainingEtaLabel,
    liveRemainingDistanceLabel,
  };
}

/* ── Shop action label ──────────────────────────────── */

export function computeShopActionLabel(params: {
  selectedShop: ShopMapListing | null;
  selectedOrigin: { placeId?: string | null } | null;
  selectedRoute: RouteOption | null;
  hasArrivedForSelectedShop: boolean;
  directionsActionLabel: string;
  navigationSessionStatus: NavigationSessionStatus;
  navigationSessionDestinationId: string | null;
}) {
  const {
    selectedShop,
    selectedOrigin,
    selectedRoute,
    hasArrivedForSelectedShop,
    directionsActionLabel,
    navigationSessionStatus,
    navigationSessionDestinationId,
  } = params;

  return selectedShop
    ? getShopRouteActionLabel({
        shopId: selectedShop.id,
        routeReady: Boolean(selectedOrigin && selectedRoute),
        hasArrived: hasArrivedForSelectedShop,
        defaultLabel: directionsActionLabel,
        navigationSessionStatus,
        navigationSessionDestinationId,
      })
    : directionsActionLabel;
}
