/**
 * useShopDirectoryNavigation — Orchestrates all navigation-related hooks, derived state,
 * effects, and handlers for the shop directory experience.
 *
 * Extracted from ShopDirectoryScreen to enforce responsibility boundaries:
 * - ShopDirectoryScreen = rendering + layout
 * - useShopDirectorySession = search/filter/map state
 * - useShopDirectoryNavigation = navigation lifecycle + guidance + route intelligence
 */
import { useMemo, useRef, useState } from "react";
import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import type { MarketUserType } from "../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../services/intelligence/shopMapExperience";
import { buildRoleAwareRouteSummary } from "../services/intelligence/shopMapExperience";
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
import { useNotifications } from "../features/notifications";
import { getShopRouteActionLabel } from "./shopDirectorySessionUtils";
import { useNavigationGpsTracking } from "./useNavigationGpsTracking";
import { useNavigationRoutePreview } from "./useNavigationRoutePreview";
import { buildLiveRouteOptionsFromPreviews } from "./useShopDirectoryRoutePreview";
import type { useShopDirectorySession } from "./useShopDirectorySession";
import { formatDistanceLabel } from "../services/intelligence/shopMapRouting";
import { primeVoiceEngine } from "../services/navigation/voiceSupport";
import {
  shopToNavigationDestination,
  buildShopGuidanceOriginTarget,
} from "./shopDirectoryNavigationUtils";
import { useNavigationLifecycleEffects } from "./useNavigationLifecycleEffects";
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
    () => (session.selectedShop ? shopToNavigationDestination(session.selectedShop) : null),
    [session.selectedShop?.id]
  );
  const guidanceOriginTarget = useMemo(
    () =>
      session.selectedOrigin
        ? buildShopGuidanceOriginTarget(
            session.selectedOrigin,
            guidanceSettings.gpsTrackingEnabled,
            shopNavigationGps.currentPosition
          )
        : null,
    [
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

  /* ── Derived navigation state ──────────────────────── */

  const liveNavigationForSelectedShop = Boolean(
    session.selectedShop &&
      navigationSessionDestinationId === String(session.selectedShop.id) &&
      (navSession.session.status === "active" || navSession.session.status === "paused")
  );
  const hasArrivedForSelectedShop = Boolean(
    session.selectedShop &&
      navigationSessionDestinationId === String(session.selectedShop.id) &&
      shopGuidancePreview.hasArrived
  );
  const selectedShopNavigationActionLabel = session.selectedShop
    ? getShopRouteActionLabel({
        shopId: session.selectedShop.id,
        routeReady: Boolean(session.selectedOrigin && session.selectedRoute),
        hasArrived: hasArrivedForSelectedShop,
        defaultLabel: session.directionsActionLabel,
        navigationSessionStatus: navSession.session.status,
        navigationSessionDestinationId,
      })
    : session.directionsActionLabel;

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

  const liveGuidanceRouteOptions = guidanceSelectedDestination
    ? buildLiveRouteOptionsFromPreviews(
        shopGuidancePreview.routeAlternatives,
        guidanceSelectedDestination.name
      )
    : [];

  const mapRouteOptions =
    liveNavigationForSelectedShop && liveGuidanceRouteOptions.length > 0
      ? liveGuidanceRouteOptions
      : session.routeOptions;

  const mapSelectedRoute =
    mapRouteOptions.find((route) => route.id === session.selectedRouteId) ||
    mapRouteOptions[0] ||
    null;

  const mapRouteSummary =
    liveNavigationForSelectedShop && session.selectedShop
      ? buildRoleAwareRouteSummary({
          selectedRoute: mapSelectedRoute,
          shop: session.selectedShop,
          userType,
          isActiveGuidance: Boolean(liveNavigationForSelectedShop || intelligence.latestEvent),
        })
      : session.routeSummary;

  const staticRemainingDurationSeconds = shopGuidancePreview.routePreview
    ? shopGuidancePreview.hasArrived
      ? 0
      : shopGuidancePreview.routePreview.steps
          .slice(shopGuidancePreview.currentStepIndex)
          .reduce((total, step) => total + step.durationSeconds, 0) ||
        shopGuidancePreview.routePreview.durationSeconds
    : 0;
  const remainingDistanceMeters = shopGuidancePreview.routePreview
    ? shopGuidancePreview.hasArrived
      ? 0
      : shopGuidancePreview.routePreview.steps
          .slice(shopGuidancePreview.currentStepIndex)
          .reduce((total, step) => total + step.distanceMeters, 0) ||
        shopGuidancePreview.routePreview.distanceMeters
    : 0;

  // Adapt ETA based on actual speed: blend speed-based ETA with static when user is moving
  const currentSpeedMph = shopNavigationGps.currentSpeedMph;
  const remainingDurationSeconds = (() => {
    if (!currentSpeedMph || currentSpeedMph < 3 || remainingDistanceMeters <= 0)
      return staticRemainingDurationSeconds;
    const speedBasedSeconds = (remainingDistanceMeters / 1609.34 / currentSpeedMph) * 3600;
    // Blend 70% speed-based + 30% static for stability (avoids wild swings)
    return Math.round(speedBasedSeconds * 0.7 + staticRemainingDurationSeconds * 0.3);
  })();

  const liveRemainingEtaLabel = hasArrivedForSelectedShop
    ? "Arrived"
    : liveNavigationForSelectedShop && remainingDurationSeconds > 0
      ? `${Math.max(1, Math.round(remainingDurationSeconds / 60))}m`
      : null;
  const liveRemainingDistanceLabel = hasArrivedForSelectedShop
    ? "Here"
    : liveNavigationForSelectedShop && remainingDistanceMeters > 0
      ? formatDistanceLabel(remainingDistanceMeters / 1609.34)
      : null;

  const routePanel = {
    routeSummary: liveNavigationForSelectedShop ? mapRouteSummary : session.routeSummary,
    routeOptions: liveNavigationForSelectedShop ? mapRouteOptions : session.routeOptions,
    selectedRoute: liveNavigationForSelectedShop ? mapSelectedRoute : session.selectedRoute,
    mode: liveNavigationForSelectedShop ? ("guidance" as const) : ("preview" as const),
    hasArrived: hasArrivedForSelectedShop,
    isLoadingRoute: liveNavigationForSelectedShop
      ? shopGuidancePreview.isLoadingRoute
      : session.isLoadingRoutes,
    routeError: liveNavigationForSelectedShop ? shopGuidancePreview.routeError : session.routeError,
    usingLiveRoutes: liveNavigationForSelectedShop
      ? liveGuidanceRouteOptions.length > 0
      : session.usingLiveRoutes,
    remainingEtaLabel: liveRemainingEtaLabel,
    remainingDistanceLabel: liveRemainingDistanceLabel,
    currentStepIndex: liveNavigationForSelectedShop ? shopGuidancePreview.currentStepIndex : 0,
    nextInstruction: liveNavigationForSelectedShop
      ? (shopGuidancePreview.nextStep?.instruction ?? null)
      : null,
    followingInstruction: liveNavigationForSelectedShop
      ? (followingStep?.instruction ?? null)
      : null,
    navigationSessionStatus: navSession.session.status,
    sessionActiveSeconds: navSession.session.activeSeconds,
    onPauseNavigation: liveNavigationForSelectedShop ? () => navSession.pause("user") : undefined,
    onResumeNavigation: liveNavigationForSelectedShop ? navSession.resume : undefined,
    onEndNavigation: liveNavigationForSelectedShop
      ? () => {
          const wasArrived = shopGuidancePreview.hasArrived;
          navSession.end();
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
    liveNavigationForSelectedShop || intelligence.latestEvent
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

  const handleReviewRoute = reroute.isEligible
    ? () => {
        const request = reroute.requestReroute(session.selectedRouteId);
        if (request) {
          // Force a fresh route calculation from the user's current GPS position
          shopGuidancePreview.refreshRoutePreview();
          reroute.confirmReroute();
        }
      }
    : undefined;

  return {
    navigationMode,
    liveNavigationForSelectedShop,
    hasArrivedForSelectedShop,
    selectedShopNavigationActionLabel,

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
      liveNavigationForSelectedShop && shopGuidancePreview.routePreview
        ? shopGuidancePreview.routePreview.steps
        : [],
    currentStepIndex: liveNavigationForSelectedShop ? shopGuidancePreview.currentStepIndex : 0,

    nextStep: shopGuidancePreview.nextStep ?? null,
    followingStep,
    routePreview: shopGuidancePreview.routePreview ?? null,

    deviationEvent: intelligence.latestEvent,
    handleReviewRoute,

    handleStartInAppNavigation,
    onEndNavigation: () => {
      const wasArrived = shopGuidancePreview.hasArrived;
      navSession.end();
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

    currentSpeedMph: liveNavigationForSelectedShop ? shopNavigationGps.currentSpeedMph : null,
    speedLimitMph: liveNavigationForSelectedShop
      ? (shopNavigationGps.speedLimitSnapshot?.speedLimitMph ?? null)
      : null,
    gpsStatus: liveNavigationForSelectedShop ? shopNavigationGps.gpsStatus : ("active" as const),
    gpsError: liveNavigationForSelectedShop ? shopNavigationGps.gpsError : "",
    onRetryGps: liveNavigationForSelectedShop ? shopNavigationGps.retryGps : undefined,
    onRetryRoute: liveNavigationForSelectedShop
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
