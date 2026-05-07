/**
 * useShopDirectoryNavigation — Orchestrates all navigation-related hooks, derived state,
 * effects, and handlers for the shop directory experience.
 *
 * Extracted from ShopDirectoryScreen to enforce responsibility boundaries:
 * - ShopDirectoryScreen = rendering + layout
 * - useShopDirectorySession = search/filter/map state
 * - useShopDirectoryNavigation = navigation lifecycle + guidance + route intelligence
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import type { MarketUserType } from "../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../services/intelligence/shopMapExperience";
import type { NavigationDestination } from "../types/mapDomain";
import {
  useNavigationIntelligence,
  useNavigationReroute,
  useNavigationSession,
  useNavigationToastBridge,
  useNavigationVoiceAlerts,
} from "../features/navigation";
import {
  getPreferredVoiceLabel,
  supportsVoiceGuidance,
} from "../services/navigation/voiceGuidance";
import { navigationDestinationToSessionWaypoint } from "../services/navigation/navigationDestinationAdapters";
import { useNotifications } from "../features/notifications";
import {
  computeLiveNavigationFlags,
  computeRouteDisplayState,
  computeRemainingLabels,
  computeShopActionLabel,
} from "./shopDirectoryNavigationDerived";
import { useNavigationGpsTracking } from "./useNavigationGpsTracking";
import { useNavigationRoutePreview } from "./useNavigationRoutePreview";
import type { useShopDirectorySession } from "./useShopDirectorySession";
import { primeVoiceEngine } from "../services/navigation/voiceSupport";
import { useNavigationLifecycleEffects } from "./useNavigationLifecycleEffects";
import {
  shopToNavigationDestination,
  buildShopGuidanceOriginTarget,
} from "./shopDirectoryNavigationUtils";
import { useGuidanceSettings } from "./useGuidanceSettings";

type ShopDirectorySession = ReturnType<typeof useShopDirectorySession>;

type UseShopDirectoryNavigationParams = {
  session: ShopDirectorySession;
  identity?: WebsiteIdentity | null;
  userType: MarketUserType;
};

export function useShopDirectoryNavigation({
  session,
  identity,
  userType,
}: UseShopDirectoryNavigationParams) {
  const [navigationStartRequested, setNavigationStartRequested] = useState<number | null>(null);
  const [directDestination, setDirectDestination] = useState<NavigationDestination | null>(null);
  const [followCurrentPositionRevision, setFollowCurrentPositionRevision] = useState(0);
  const lastArrivalToastSessionIdRef = useRef<string | null>(null);

  const intelligence = useNavigationIntelligence();
  const navSession = useNavigationSession(identity?.providerUserId ?? undefined);
  const {
    guidanceSettings,
    handleVoiceModeChange,
    handleVoiceVolumePresetChange,
    handleToggleGpsTracking,
    handleToggleSpeedLimitMonitor,
    handleToggleAutoReroute,
  } = useGuidanceSettings();
  const reroute = useNavigationReroute(intelligence.latestEvent, {
    autoRerouteEnabled: guidanceSettings.autoRerouteEnabled,
    currentRouteId: session.selectedRouteId,
  });

  const shopNavigationGps = useNavigationGpsTracking({
    gpsTrackingEnabled: guidanceSettings.gpsTrackingEnabled,
    speedLimitMonitorEnabled: guidanceSettings.speedLimitMonitorEnabled,
  });

  const guidanceSelectedDestination = useMemo(
    () =>
      directDestination ??
      (session.selectedShop ? shopToNavigationDestination(session.selectedShop) : null),
    [directDestination, session.selectedShop?.id]
  );
  const guidanceOriginTarget = useMemo(
    () =>
      session.selectedOrigin
        ? buildShopGuidanceOriginTarget(
            session.selectedOrigin,
            guidanceSettings.gpsTrackingEnabled,
            shopNavigationGps.currentPosition
          )
        : directDestination &&
            guidanceSettings.gpsTrackingEnabled &&
            shopNavigationGps.currentPosition
          ? {
              lat: shopNavigationGps.currentPosition.lat,
              lng: shopNavigationGps.currentPosition.lng,
              label: "Live GPS position",
              source: "geolocation" as const,
            }
          : null,
    [
      directDestination?.id,
      session.selectedOrigin?.placeId,
      session.selectedOrigin?.latitude,
      session.selectedOrigin?.longitude,
      guidanceSettings.gpsTrackingEnabled,
      shopNavigationGps.currentPosition?.lat,
      shopNavigationGps.currentPosition?.lng,
    ]
  );

  const navigationSessionDestinationId = navSession.session.destination?.id ?? null;
  const voiceGuidanceEnabled = Boolean(
    guidanceSelectedDestination &&
      navigationSessionDestinationId === String(guidanceSelectedDestination.id) &&
      navSession.session.status === "active"
  );
  const selectedRouteIndex = Math.max(
    0,
    session.routeOptions.findIndex((route) => route.id === session.selectedRouteId)
  );

  const shopGuidancePreview = useNavigationRoutePreview({
    selectedDestination: guidanceSelectedDestination,
    activeOriginTarget: guidanceOriginTarget,
    currentPosition: shopNavigationGps.currentPosition,
    currentSpeedMph: shopNavigationGps.currentSpeedMph,
    gpsAccuracyMeters: shopNavigationGps.gpsAccuracyMeters,
    gpsTrackingEnabled: guidanceSettings.gpsTrackingEnabled,
    voiceGuidanceEnabled,
    voiceMode: guidanceSettings.voiceMode,
    voicePersona: guidanceSettings.voicePersona,
    voiceVolumePreset: guidanceSettings.voiceVolumePreset,
    selectedRouteIndex,
  });

  useNavigationVoiceAlerts(
    intelligence.latestEvent,
    reroute.state.status,
    guidanceSettings,
    voiceGuidanceEnabled
  );

  const notifications = useNotifications();
  useNavigationToastBridge(
    navSession.session,
    intelligence.latestEvent,
    notifications,
    navSession.restoredFromCloud,
    navSession.syncError,
    reroute.state
  );

  /* ── Derived navigation state (via extracted helpers) ── */

  const {
    liveNavigationForSelectedShop,
    liveNavigationForDirectDest,
    liveNavigationActive,
    hasArrivedForSelectedShop,
    hasArrivedForDestination,
  } = computeLiveNavigationFlags({
    selectedShop: session.selectedShop,
    directDestination,
    navigationSessionDestinationId,
    sessionStatus: navSession.session.status,
    hasArrived: shopGuidancePreview.hasArrived,
  });

  const selectedShopNavigationActionLabel = computeShopActionLabel({
    selectedShop: session.selectedShop,
    selectedOrigin: session.selectedOrigin,
    selectedRoute: session.selectedRoute,
    hasArrivedForSelectedShop,
    directionsActionLabel: session.directionsActionLabel,
    navigationSessionStatus: navSession.session.status,
    navigationSessionDestinationId,
  });

  const shopMapUserCoords = useMemo(
    () =>
      shopNavigationGps.currentPosition
        ? {
            latitude: shopNavigationGps.currentPosition.lat,
            longitude: shopNavigationGps.currentPosition.lng,
          }
        : session.userGeolocation.coords,
    [
      shopNavigationGps.currentPosition?.lat,
      shopNavigationGps.currentPosition?.lng,
      session.userGeolocation.coords,
    ]
  );

  const followingStep = shopGuidancePreview.hasArrived
    ? null
    : shopGuidancePreview.routePreview?.steps[shopGuidancePreview.currentStepIndex + 1] || null;

  const { liveGuidanceRouteOptions, mapRouteOptions, mapSelectedRoute, mapRouteSummary } =
    computeRouteDisplayState({
      liveNavigationActive,
      guidanceSelectedDestination,
      routeAlternatives: shopGuidancePreview.routeAlternatives,
      sessionRouteOptions: session.routeOptions,
      sessionSelectedRouteId: session.selectedRouteId,
      selectedShop: session.selectedShop,
      directDestination,
      userType,
      hasIntelligenceEvent: Boolean(intelligence.latestEvent),
      sessionRouteSummary: session.routeSummary,
    });

  const {
    remainingDurationSeconds,
    remainingDistanceMeters,
    liveRemainingEtaLabel,
    liveRemainingDistanceLabel,
  } = computeRemainingLabels({
    liveNavigationActive,
    hasArrived: shopGuidancePreview.hasArrived,
    hasArrivedForDestination,
    routePreview: shopGuidancePreview.routePreview,
    currentStepIndex: shopGuidancePreview.currentStepIndex,
    currentSpeedMph: shopNavigationGps.currentSpeedMph ?? 0,
  });

  const routePanel = {
    routeSummary: liveNavigationActive ? mapRouteSummary : session.routeSummary,
    routeOptions: liveNavigationActive ? mapRouteOptions : session.routeOptions,
    selectedRoute: liveNavigationActive ? mapSelectedRoute : session.selectedRoute,
    mode: liveNavigationActive ? ("guidance" as const) : ("preview" as const),
    hasArrived: hasArrivedForDestination,
    isLoadingRoute: liveNavigationActive
      ? shopGuidancePreview.isLoadingRoute
      : session.isLoadingRoutes,
    routeError: liveNavigationActive ? shopGuidancePreview.routeError : session.routeError,
    usingLiveRoutes: liveNavigationActive
      ? liveGuidanceRouteOptions.length > 0
      : session.usingLiveRoutes,
    remainingEtaLabel: liveRemainingEtaLabel,
    remainingDistanceLabel: liveRemainingDistanceLabel,
    currentStepIndex: liveNavigationActive ? shopGuidancePreview.currentStepIndex : 0,
    nextInstruction: liveNavigationActive
      ? (shopGuidancePreview.nextStep?.instruction ?? null)
      : null,
    followingInstruction: liveNavigationActive ? (followingStep?.instruction ?? null) : null,
    navigationSessionStatus: navSession.session.status,
    sessionActiveSeconds: navSession.session.activeSeconds,
    onPauseNavigation: liveNavigationActive ? () => navSession.pause("user") : undefined,
    onResumeNavigation: liveNavigationActive ? navSession.resume : undefined,
    onEndNavigation: liveNavigationActive
      ? () => {
          const wasArrived = shopGuidancePreview.hasArrived;
          navSession.end();
          setDirectDestination(null);
          if (!wasArrived) {
            notifications.showToast({
              message: "Route ended.",
              variant: "info",
              durationMs: 2400,
              deepLink: null,
            });
          }
        }
      : undefined,
  };

  const navigationMode: "browse" | "route-preview" | "guidance" =
    liveNavigationActive || intelligence.latestEvent
      ? "guidance"
      : session.selectedRoute
        ? "route-preview"
        : "browse";

  /* ── Navigation lifecycle effects ──────────────────── */

  useNavigationLifecycleEffects({
    session,
    navSession,
    intelligence,
    shopGuidancePreview,
    shopNavigationGps,
    shopMapUserCoords,
    notifications,
    liveNavigationForSelectedShop,
    liveNavigationActive,
    directDestination,
    hasArrivedForDestination,
    navigationStartRequested,
    setNavigationStartRequested,
    setFollowCurrentPositionRevision,
    lastArrivalToastSessionIdRef,
  });

  /* ── Handlers ──────────────────────────────────────── */

  const handleStartInAppNavigation = (shop: NonNullable<typeof session.selectedShop>) => {
    if (guidanceSettings.voiceMode !== "muted") {
      primeVoiceEngine();
    }

    session.handleOpenShopDirections(shop);
    const isCurrentSessionDestination = navSession.session.destination?.id === String(shop.id);

    if (navSession.session.status === "paused" && isCurrentSessionDestination) {
      navSession.resume();
      notifications.showToast({
        message: `Navigation resumed to ${shop.name}.`,
        variant: "info",
        durationMs: 2400,
        deepLink: null,
      });
      return;
    }

    if (navSession.session.status === "active" && isCurrentSessionDestination) {
      return;
    }

    if (
      navSession.session.status === "planning" ||
      navSession.session.status === "active" ||
      navSession.session.status === "paused" ||
      navSession.session.status === "ended"
    ) {
      if (!isCurrentSessionDestination || navSession.session.status === "ended") {
        navSession.reset();
      }
    }

    setNavigationStartRequested(shop.id);
  };

  /** Navigate directly to any NavigationDestination (real place, QA seed, address). */
  const handleStartDirectNavigation = (dest: NavigationDestination) => {
    if (guidanceSettings.voiceMode !== "muted") {
      primeVoiceEngine();
    }

    const isCurrentSessionDestination = navSession.session.destination?.id === dest.id;

    if (navSession.session.status === "paused" && isCurrentSessionDestination) {
      navSession.resume();
      notifications.showToast({
        message: `Navigation resumed to ${dest.name}.`,
        variant: "info",
        durationMs: 2400,
        deepLink: null,
      });
      return;
    }

    if (navSession.session.status === "active" && isCurrentSessionDestination) {
      return;
    }

    // Reset any existing session
    if (navSession.session.status !== "idle") {
      navSession.reset();
    }

    // Set direct destination — this drives guidanceSelectedDestination + route preview
    setDirectDestination(dest);

    // Build origin waypoint from current GPS or selected origin
    const originWaypoint = shopNavigationGps.currentPosition
      ? {
          id: "gps-origin",
          label: "Current Location",
          coordinate: shopNavigationGps.currentPosition,
        }
      : session.selectedOrigin
        ? {
            id: session.selectedOrigin.placeId ?? "origin",
            label: session.selectedOrigin.name,
            address: session.selectedOrigin.address,
            coordinate: {
              lat: session.selectedOrigin.latitude,
              lng: session.selectedOrigin.longitude,
            },
          }
        : null;

    // Start the navigation session directly
    navSession.startPlanning(originWaypoint, navigationDestinationToSessionWaypoint(dest));

    // Activate synchronously — React 18 batches both reducer dispatches in the same
    // tick, so the session transitions planning → active before any lifecycle effect
    // can observe the intermediate "planning" status and reset it.
    navSession.activate();
    notifications.showToast({
      message: `Navigation started to ${dest.name}.`,
      variant: "info",
      durationMs: 2400,
      deepLink: null,
    });
  };

  // Pass 54: defer reroute confirmation (and cooldown start) until the OSRM
  // refresh actually delivers a new route. If OSRM fails (routeError set),
  // cancel the reroute so the user isn't stuck in cooldown without a new route.
  const pendingRerouteFetchedAtRef = useRef<string | null>(null);

  const handleReviewRoute = reroute.isEligible
    ? () => {
        const request = reroute.requestReroute(session.selectedRouteId);
        if (request) {
          // Snapshot the current routePreview.fetchedAt so the effect below
          // can detect when the refresh has produced a NEW route.
          pendingRerouteFetchedAtRef.current =
            shopGuidancePreview.routePreview?.fetchedAt ?? "";
          // Force a fresh route calculation from the user's current GPS position
          shopGuidancePreview.refreshRoutePreview();
        }
      }
    : undefined;

  useEffect(() => {
    if (reroute.state.status !== "pending") return;
    const baseline = pendingRerouteFetchedAtRef.current;
    if (baseline === null) return;

    const nextFetchedAt = shopGuidancePreview.routePreview?.fetchedAt ?? null;
    if (nextFetchedAt && nextFetchedAt !== baseline) {
      pendingRerouteFetchedAtRef.current = null;
      reroute.confirmReroute();
      return;
    }

    if (shopGuidancePreview.routeError) {
      pendingRerouteFetchedAtRef.current = null;
      reroute.cancelReroute();
    }
  }, [
    reroute.state.status,
    shopGuidancePreview.routePreview?.fetchedAt,
    shopGuidancePreview.routeError,
    reroute.confirmReroute,
    reroute.cancelReroute,
  ]);

  return {
    navigationMode,
    liveNavigationForSelectedShop,
    liveNavigationActive,
    hasArrivedForSelectedShop,
    hasArrivedForDestination,
    selectedShopNavigationActionLabel,
    directDestination,

    navigationSessionDestinationId,
    navigationSessionStatus: navSession.session.status,
    sessionActiveSeconds: navSession.session.activeSeconds,
    sessionDestinationLabel: navSession.session.destination?.label ?? null,

    shopMapUserCoords,
    userHeadingDegrees: shopNavigationGps.currentHeadingDegrees,
    followCurrentPositionRevision,

    mapRouteOptions,
    mapSelectedRoute,
    mapRouteSummary,
    routePanel,
    liveRemainingEtaLabel,
    liveRemainingDistanceLabel,
    routeSteps:
      liveNavigationActive && shopGuidancePreview.routePreview
        ? shopGuidancePreview.routePreview.steps
        : [],
    currentStepIndex: liveNavigationActive ? shopGuidancePreview.currentStepIndex : 0,

    nextStep: shopGuidancePreview.nextStep ?? null,
    followingStep,
    routePreview: shopGuidancePreview.routePreview ?? null,

    deviationEvent: intelligence.latestEvent,
    handleReviewRoute,

    handleStartInAppNavigation,
    handleStartDirectNavigation,
    onEndNavigation: () => {
      const wasArrived = shopGuidancePreview.hasArrived;
      navSession.end();
      setDirectDestination(null);
      if (!wasArrived) {
        notifications.showToast({
          message: "Route ended.",
          variant: "info",
          durationMs: 2400,
          deepLink: null,
        });
      }
    },
    onPauseNavigation: () => navSession.pause("user"),
    onResumeNavigation: navSession.resume,
    onRecenterNavigation: () => setFollowCurrentPositionRevision((current) => current + 1),

    currentSpeedMph: liveNavigationActive ? shopNavigationGps.currentSpeedMph : null,
    speedLimitMph: liveNavigationActive
      ? (shopNavigationGps.speedLimitSnapshot?.speedLimitMph ?? null)
      : null,
    gpsStatus: liveNavigationActive ? shopNavigationGps.gpsStatus : ("active" as const),
    gpsError: liveNavigationActive ? shopNavigationGps.gpsError : "",
    onRetryGps: liveNavigationActive ? shopNavigationGps.retryGps : undefined,
    onRetryRoute: liveNavigationActive
      ? () => shopGuidancePreview.refreshRoutePreview()
      : session.refreshRoutePreview,

    voiceMode: guidanceSettings.voiceMode,
    voiceVolumePreset: guidanceSettings.voiceVolumePreset,
    preferredVoiceLabel: getPreferredVoiceLabel(guidanceSettings.voicePersona),
    voiceGuidanceSupported: supportsVoiceGuidance(),
    onVoiceModeChange: handleVoiceModeChange,
    onVoiceVolumePresetChange: handleVoiceVolumePresetChange,

    gpsTrackingEnabled: guidanceSettings.gpsTrackingEnabled,
    speedLimitMonitorEnabled: guidanceSettings.speedLimitMonitorEnabled,
    autoRerouteEnabled: guidanceSettings.autoRerouteEnabled,
    onToggleGpsTracking: handleToggleGpsTracking,
    onToggleSpeedLimitMonitor: handleToggleSpeedLimitMonitor,
    onToggleAutoReroute: handleToggleAutoReroute,
  };
}
