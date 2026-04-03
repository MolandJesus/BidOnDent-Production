import { useEffect } from "react";
import type { NavigationSnapshot } from "../features/navigation";
import type { useNavigationIntelligence, useNavigationSession } from "../features/navigation";
import type { useNotifications } from "../features/notifications";
import type { useNavigationGpsTracking } from "./useNavigationGpsTracking";
import type { useNavigationRoutePreview } from "./useNavigationRoutePreview";
import type { useShopDirectorySession } from "./useShopDirectorySession";

type ShopDirectorySession = ReturnType<typeof useShopDirectorySession>;

type UseNavigationLifecycleEffectsParams = {
  session: ShopDirectorySession;
  navSession: ReturnType<typeof useNavigationSession>;
  intelligence: ReturnType<typeof useNavigationIntelligence>;
  shopGuidancePreview: ReturnType<typeof useNavigationRoutePreview>;
  shopNavigationGps: ReturnType<typeof useNavigationGpsTracking>;
  shopMapUserCoords: { latitude: number; longitude: number } | null;
  notifications: ReturnType<typeof useNotifications>;
  liveNavigationForSelectedShop: boolean;
  navigationStartRequested: number | null;
  setNavigationStartRequested: (value: number | null) => void;
  setFollowCurrentPositionRevision: React.Dispatch<React.SetStateAction<number>>;
  lastArrivalToastSessionIdRef: React.MutableRefObject<string | null>;
};

export function useNavigationLifecycleEffects({
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
}: UseNavigationLifecycleEffectsParams) {
  // ── Intelligence evaluation snapshot ──
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

  // ── Follow position revision on navigation activation ──
  useEffect(() => {
    if (!liveNavigationForSelectedShop || navSession.session.status !== "active") {
      return;
    }

    setFollowCurrentPositionRevision((current) => current + 1);
  }, [liveNavigationForSelectedShop, navSession.session.status, session.selectedShop?.id]);

  // ── Arrival toast ──
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

  // ── Auto-end after arrival delay ──
  useEffect(() => {
    if (!liveNavigationForSelectedShop || navSession.session.status !== "active") {
      return;
    }

    if (!shopGuidancePreview.hasArrived) {
      return;
    }

    const timer = setTimeout(() => {
      navSession.end();
    }, 6000);

    return () => clearTimeout(timer);
  }, [
    liveNavigationForSelectedShop,
    navSession.end,
    navSession.session.status,
    shopGuidancePreview.hasArrived,
  ]);

  // ── Sync navigation session with shop directory state ──
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

  // ── Navigation start request fulfillment ──
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
}
