/**
 * useShopDirectoryNavigation — Orchestrates all navigation-related hooks, derived state,
 * effects, and handlers for the shop directory experience.
 *
 * Extracted from ShopDirectoryScreen to enforce responsibility boundaries:
 * - ShopDirectoryScreen = rendering + layout
 * - useShopDirectorySession = search/filter/map state
 * - useShopDirectoryNavigation = navigation lifecycle + guidance + route intelligence
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CoveragePartnerShop,
  CoverageSearchTarget,
} from "../components/maps/serviceCoverageMapTypes";
import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import type { MarketUserType } from "../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../services/intelligence/shopMapExperience";
import { buildRoleAwareRouteSummary } from "../services/intelligence/shopMapExperience";
import type { NavigationSnapshot } from "../features/navigation";
import {
  useNavigationIntelligence,
  useNavigationReroute,
  useNavigationSession,
  useNavigationToastBridge,
  useNavigationVoiceAlerts,
} from "../features/navigation";
import {
  loadNavigationGuidanceSettings,
  saveNavigationGuidanceSettings,
} from "../services/navigation/navigationPreferences";
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

type ShopDirectorySession = ReturnType<typeof useShopDirectorySession>;

function toCoveragePartnerShop(shop: ShopMapListing): CoveragePartnerShop {
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

function buildShopGuidanceOriginTarget(
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
  const reroute = useNavigationReroute(intelligence.latestEvent);
  const [guidanceSettings, setGuidanceSettings] = useState(() => loadNavigationGuidanceSettings());

  const handleVoiceModeChange = useCallback((voiceMode: typeof guidanceSettings.voiceMode) => {
    setGuidanceSettings((prev) => {
      const next = { ...prev, voiceMode };
      saveNavigationGuidanceSettings(next);
      return next;
    });
  }, []);

  const handleVoiceVolumePresetChange = useCallback(
    (voiceVolumePreset: typeof guidanceSettings.voiceVolumePreset) => {
      setGuidanceSettings((prev) => {
        const next = { ...prev, voiceVolumePreset };
        saveNavigationGuidanceSettings(next);
        return next;
      });
    },
    []
  );

  const shopNavigationGps = useNavigationGpsTracking({
    gpsTrackingEnabled: guidanceSettings.gpsTrackingEnabled,
    speedLimitMonitorEnabled: guidanceSettings.speedLimitMonitorEnabled,
  });

  const guidanceSelectedShop = session.selectedShop
    ? toCoveragePartnerShop(session.selectedShop)
    : null;
  const guidanceOriginTarget = session.selectedOrigin
    ? buildShopGuidanceOriginTarget(
        session.selectedOrigin,
        guidanceSettings.gpsTrackingEnabled,
        shopNavigationGps.currentPosition
      )
    : null;

  const navigationSessionDestinationId = navSession.session.destination?.id ?? null;
  const voiceGuidanceEnabled = Boolean(
    guidanceSelectedShop &&
      navigationSessionDestinationId === String(guidanceSelectedShop.id) &&
      navSession.session.status === "active"
  );
  const selectedRouteIndex = Math.max(
    0,
    session.routeOptions.findIndex((route) => route.id === session.selectedRouteId)
  );

  const shopGuidancePreview = useNavigationRoutePreview({
    selectedShop: guidanceSelectedShop,
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
    navSession.syncError
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

  const shopMapUserCoords = shopNavigationGps.currentPosition
    ? {
        latitude: shopNavigationGps.currentPosition.lat,
        longitude: shopNavigationGps.currentPosition.lng,
      }
    : session.userGeolocation.coords;

  const followingStep = shopGuidancePreview.hasArrived
    ? null
    : shopGuidancePreview.routePreview?.steps[shopGuidancePreview.currentStepIndex + 1] || null;

  const liveGuidanceRouteOptions = guidanceSelectedShop
    ? buildLiveRouteOptionsFromPreviews(
        shopGuidancePreview.routeAlternatives,
        guidanceSelectedShop.name
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
  };

  const navigationMode: "browse" | "route-preview" | "guidance" =
    liveNavigationForSelectedShop || intelligence.latestEvent
      ? "guidance"
      : session.selectedRoute
        ? "route-preview"
        : "browse";

  /* ── Navigation lifecycle effects ──────────────────── */

  useEffect(() => {
    const livePosition = shopMapUserCoords
      ? {
          latitude: shopMapUserCoords.latitude,
          longitude: shopMapUserCoords.longitude,
        }
      : null;

    const snapshot: NavigationSnapshot = {
      routeId: session.selectedRoute?.id ?? null,
      estimatedDurationMinutes: session.selectedRoute?.estimatedDurationMinutes ?? null,
      currentPosition: livePosition,
      currentSpeedMph: shopNavigationGps.currentSpeedMph,
      routePolyline:
        shopGuidancePreview.routePreview?.geometry.map(({ lat, lng }) => ({
          latitude: lat,
          longitude: lng,
        })) ??
        session.selectedRoute?.polyline ??
        [],
      capturedAt: new Date().toISOString(),
    };

    intelligence.evaluate(snapshot);
  }, [
    session.selectedRoute?.id,
    session.selectedRoute?.estimatedDurationMinutes,
    shopGuidancePreview.routePreview?.fetchedAt,
    shopMapUserCoords?.latitude,
    shopMapUserCoords?.longitude,
    shopNavigationGps.currentSpeedMph,
  ]);

  useEffect(() => {
    if (!liveNavigationForSelectedShop || navSession.session.status !== "active") {
      return;
    }

    setFollowCurrentPositionRevision((current) => current + 1);
  }, [liveNavigationForSelectedShop, navSession.session.status, session.selectedShop?.id]);

  useEffect(() => {
    if (!liveNavigationForSelectedShop || navSession.session.status !== "active") {
      return;
    }

    if (!shopGuidancePreview.hasArrived || !session.selectedShop) {
      return;
    }

    if (lastArrivalToastSessionIdRef.current === navSession.session.id) {
      return;
    }

    notifications.showToast({
      message: `Arrived at ${session.selectedShop.name}.`,
      variant: "success",
      durationMs: 3200,
      deepLink: null,
    });
    lastArrivalToastSessionIdRef.current = navSession.session.id;
  }, [
    liveNavigationForSelectedShop,
    navSession.session.id,
    navSession.session.status,
    notifications,
    session.selectedShop,
    shopGuidancePreview.hasArrived,
  ]);

  useEffect(() => {
    if (!liveNavigationForSelectedShop || navSession.session.status !== "active") {
      return;
    }

    if (!shopGuidancePreview.hasArrived) {
      return;
    }

    navSession.end();
  }, [
    liveNavigationForSelectedShop,
    navSession.end,
    navSession.session.status,
    shopGuidancePreview.hasArrived,
  ]);

  /* ── Sync navigation session lifecycle with shop directory state ── */
  useEffect(() => {
    const { selectedShop, selectedOrigin, selectedRoute } = session;
    const { status } = navSession.session;

    if (selectedShop && selectedRoute && status === "idle") {
      navSession.startPlanning(
        selectedOrigin
          ? {
              id: selectedOrigin.placeId ?? "origin",
              label: selectedOrigin.name,
              address: selectedOrigin.address,
              coordinate: { lat: selectedOrigin.latitude, lng: selectedOrigin.longitude },
            }
          : null,
        {
          id: String(selectedShop.id),
          label: selectedShop.name,
          address: selectedShop.mapResult.address,
          coordinate: {
            lat: selectedShop.mapResult.coordinates.latitude,
            lng: selectedShop.mapResult.coordinates.longitude,
          },
        }
      );
    }

    if (selectedRoute && (status === "planning" || status === "active")) {
      navSession.selectRoute(selectedRoute.id);
    }

    if (!selectedRoute && status === "planning") {
      navSession.reset();
      return;
    }

    if (!selectedRoute && (status === "active" || status === "paused")) {
      navSession.end();
    }
  }, [
    session.selectedShop?.id,
    session.selectedOrigin?.placeId,
    session.selectedRoute?.id,
    navSession.session.status,
  ]);

  useEffect(() => {
    if (navigationStartRequested == null) {
      return;
    }

    if (session.selectedShop?.id !== navigationStartRequested) {
      return;
    }

    if (navSession.session.status === "planning") {
      navSession.activate();
      setNavigationStartRequested(null);
      if (session.selectedShop) {
        notifications.showToast({
          message: `Navigation started to ${session.selectedShop.name}.`,
          variant: "info",
          durationMs: 2400,
          deepLink: null,
        });
      }
      return;
    }

    if (navSession.session.status === "active") {
      setNavigationStartRequested(null);
    }
  }, [navigationStartRequested, session.selectedShop?.id, navSession.session.status]);

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

    voiceMode: guidanceSettings.voiceMode,
    voiceVolumePreset: guidanceSettings.voiceVolumePreset,
    preferredVoiceLabel: getPreferredVoiceLabel(guidanceSettings.voicePersona),
    voiceGuidanceSupported: supportsVoiceGuidance(),
    onVoiceModeChange: handleVoiceModeChange,
    onVoiceVolumePresetChange: handleVoiceVolumePresetChange,
  };
}
