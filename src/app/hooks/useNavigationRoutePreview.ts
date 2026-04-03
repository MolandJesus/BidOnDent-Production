import { useEffect, useRef, useState } from "react";
import type { CoverageSearchTarget } from "../components/maps/serviceCoverageMapTypes";
import { haversineMiles } from "../services/supabase/map";
import type {
  NavigationCoordinate,
  NavigationRouteOptions,
  NavigationRoutePreview,
  NavigationRouteStep,
  NavigationVoiceMode,
  NavigationVoicePersona,
  NavigationVoiceVolumePreset,
} from "../types/navigation";
import type { NavigationDestination } from "../types/mapDomain";
import { fetchNavigationRouteOptions } from "../services/navigation/routeEngine";
import { createTimeoutAbortController } from "../services/navigation/requestTimeout";
import {
  getArrivalCompletionDistanceMeters,
  buildDestinationKey,
  buildOriginKey,
  computeCarriedSpokenSteps,
  getAccuracyAdjustmentMeters,
  getManeuverAdvanceDistanceMeters,
  getManeuverBaseSpeakDistanceMeters,
  getSpeedAdjustmentMeters,
  resolveStepIndexAfterRefresh,
  shouldSpeakStep,
} from "../services/navigation/navigationGuidanceHelpers";
import {
  cancelVoiceGuidance,
  speakNavigationInstruction,
} from "../services/navigation/voiceGuidance";

export type UseNavigationRoutePreviewArgs = {
  selectedDestination: NavigationDestination | null;
  activeOriginTarget: CoverageSearchTarget | null;
  currentPosition: NavigationCoordinate | null;
  currentSpeedMph: number | null;
  gpsAccuracyMeters: number | null;
  gpsTrackingEnabled: boolean;
  voiceGuidanceEnabled: boolean;
  voiceMode: NavigationVoiceMode;
  voicePersona: NavigationVoicePersona;
  voiceVolumePreset: NavigationVoiceVolumePreset;
  selectedRouteIndex: number;
};

export type NavigationRoutePreviewState = {
  routePreview: NavigationRoutePreview | null;
  routeAlternatives: NavigationRoutePreview[];
  isLoadingRoute: boolean;
  routeError: string;
  currentStepIndex: number;
  hasArrived: boolean;
  nextStep: NavigationRouteStep | null;
  refreshRoutePreview: () => void;
};

export function useNavigationRoutePreview({
  selectedDestination,
  activeOriginTarget,
  currentPosition,
  currentSpeedMph,
  gpsAccuracyMeters,
  gpsTrackingEnabled,
  voiceGuidanceEnabled,
  voiceMode,
  voicePersona,
  voiceVolumePreset,
  selectedRouteIndex,
}: UseNavigationRoutePreviewArgs): NavigationRoutePreviewState {
  const [routePreview, setRoutePreview] = useState<NavigationRoutePreview | null>(null);
  const [routeAlternatives, setRouteAlternatives] = useState<NavigationRoutePreview[]>([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasArrived, setHasArrived] = useState(false);

  const lastRouteOriginKeyRef = useRef<string | null>(null);
  const lastRouteDestinationKeyRef = useRef<string | null>(null);
  const lastRouteOriginCoordinateRef = useRef<NavigationCoordinate | null>(null);
  const spokenStepIdsRef = useRef<Set<string>>(new Set());

  const originKey = buildOriginKey(activeOriginTarget);
  const destinationKey = buildDestinationKey(selectedDestination);
  const originTracksGps =
    gpsTrackingEnabled && activeOriginTarget?.source === "geolocation" && Boolean(currentPosition);

  // Off-route detection: compute minimum distance from GPS to route geometry
  const isOffRoute =
    originTracksGps &&
    currentPosition &&
    routePreview &&
    routePreview.geometry.length >= 2 &&
    (() => {
      let minDist = Infinity;
      for (const point of routePreview.geometry) {
        const d = haversineMiles(currentPosition, point);
        if (d < minDist) minDist = d;
      }
      // ~100m threshold = 0.062 miles
      return minDist > 0.062;
    })();

  // Route fetching
  useEffect(() => {
    if (!selectedDestination || !activeOriginTarget || !originKey || !destinationKey) {
      setRoutePreview((prev) => (prev === null ? prev : null));
      setRouteAlternatives((prev) => (prev.length === 0 ? prev : []));
      setRouteError((prev) => (prev === "" ? prev : ""));
      setCurrentStepIndex((prev) => (prev === 0 ? prev : 0));
      setHasArrived((prev) => (prev === false ? prev : false));
      spokenStepIdsRef.current.clear();
      cancelVoiceGuidance();
      lastRouteOriginKeyRef.current = null;
      lastRouteDestinationKeyRef.current = null;
      lastRouteOriginCoordinateRef.current = null;
      return;
    }

    const activeOriginCoordinate = {
      lat: activeOriginTarget.lat,
      lng: activeOriginTarget.lng,
    };
    const hasDestinationChanged = destinationKey !== lastRouteDestinationKeyRef.current;
    const hasOriginChanged = originKey !== lastRouteOriginKeyRef.current;
    const gpsMovedEnough =
      originTracksGps && currentPosition
        ? !lastRouteOriginCoordinateRef.current ||
          haversineMiles(currentPosition, lastRouteOriginCoordinateRef.current) >= 0.18
        : false;
    const shouldRefreshRoute =
      !routePreview ||
      hasDestinationChanged ||
      isOffRoute ||
      (originTracksGps ? gpsMovedEnough : hasOriginChanged);

    if (!shouldRefreshRoute) {
      return;
    }

    const routeRequest = createTimeoutAbortController(15000);
    setIsLoadingRoute(true);
    setRouteError("");

    fetchNavigationRouteOptions({
      origin: activeOriginCoordinate,
      destination: selectedDestination,
      signal: routeRequest.controller.signal,
    })
      .then((nextRoutes: NavigationRouteOptions) => {
        const safeRoutes = nextRoutes.alternatives.length
          ? nextRoutes.alternatives
          : [nextRoutes.primary];
        const nextIndex = Math.min(selectedRouteIndex, safeRoutes.length - 1);
        const selectedRoute = safeRoutes[nextIndex] || safeRoutes[0] || null;

        setRouteAlternatives(safeRoutes);
        setRoutePreview(selectedRoute);

        // Preserve navigation progress across GPS-triggered route refreshes
        if (selectedRoute) {
          const resumeIndex = resolveStepIndexAfterRefresh(selectedRoute.steps, currentPosition);
          setCurrentStepIndex(resumeIndex);
          setHasArrived(false);
          spokenStepIdsRef.current = computeCarriedSpokenSteps(
            selectedRoute.steps,
            spokenStepIdsRef.current
          );
        } else {
          setCurrentStepIndex(0);
          setHasArrived(false);
          spokenStepIdsRef.current.clear();
        }

        lastRouteOriginKeyRef.current = originKey;
        lastRouteDestinationKeyRef.current = destinationKey;
        lastRouteOriginCoordinateRef.current = activeOriginCoordinate;
      })
      .catch((error) => {
        if (routeRequest.controller.signal.aborted && !routeRequest.didTimeout()) {
          return;
        }
        setRoutePreview(null);
        setRouteAlternatives([]);
        setRouteError(
          routeRequest.didTimeout()
            ? "Route preview timed out. Retry to continue navigation."
            : error instanceof Error
              ? error.message
              : "Unable to build a route preview."
        );
      })
      .finally(() => {
        routeRequest.clear();

        if (!routeRequest.controller.signal.aborted || routeRequest.didTimeout()) {
          setIsLoadingRoute(false);
        }
      });

    return () => {
      routeRequest.clear();
      routeRequest.controller.abort();
    };
  }, [
    activeOriginTarget,
    currentPosition,
    destinationKey,
    originKey,
    routePreview,
    selectedDestination,
    selectedRouteIndex,
    gpsTrackingEnabled,
    originTracksGps,
    isOffRoute,
  ]);

  // Alternative route selection
  useEffect(() => {
    if (routeAlternatives.length === 0) {
      return;
    }

    const safeIndex = Math.min(selectedRouteIndex, routeAlternatives.length - 1);
    const selectedRoute = routeAlternatives[safeIndex] || routeAlternatives[0] || null;

    if (!selectedRoute) {
      return;
    }

    setRoutePreview(selectedRoute);

    // Preserve progress when switching between alternative routes
    const resumeIndex = resolveStepIndexAfterRefresh(selectedRoute.steps, currentPosition);
    setCurrentStepIndex(resumeIndex);
    setHasArrived(false);
    spokenStepIdsRef.current = computeCarriedSpokenSteps(
      selectedRoute.steps,
      spokenStepIdsRef.current
    );
  }, [routeAlternatives, selectedRouteIndex, currentPosition]);

  const nextStep = routePreview?.steps[currentStepIndex] || null;

  // GPS step tracking + voice guidance
  useEffect(() => {
    if (!routePreview) {
      return;
    }

    if (hasArrived || !gpsTrackingEnabled || !currentPosition || !nextStep) {
      return;
    }

    const stepDistanceMeters = haversineMiles(currentPosition, nextStep.location) * 1609.34;
    const arrivalCompletionThresholdMeters = getArrivalCompletionDistanceMeters(gpsAccuracyMeters);
    const adaptiveSpeakThresholdMeters =
      getManeuverBaseSpeakDistanceMeters(nextStep) +
      getSpeedAdjustmentMeters(currentSpeedMph) +
      getAccuracyAdjustmentMeters(gpsAccuracyMeters);
    const adaptiveAdvanceThresholdMeters =
      getManeuverAdvanceDistanceMeters(nextStep) +
      getAccuracyAdjustmentMeters(gpsAccuracyMeters) * 0.5;
    const shouldSpeak =
      voiceGuidanceEnabled &&
      stepDistanceMeters <= adaptiveSpeakThresholdMeters &&
      !spokenStepIdsRef.current.has(nextStep.id) &&
      shouldSpeakStep(nextStep, voiceMode);

    if (shouldSpeak) {
      speakNavigationInstruction({
        text: nextStep.instruction,
        voiceMode,
        voicePersona,
        voiceVolumePreset,
      });
      spokenStepIdsRef.current.add(nextStep.id);
    }

    if (
      nextStep.maneuverType === "arrive" &&
      stepDistanceMeters <= arrivalCompletionThresholdMeters
    ) {
      setCurrentStepIndex(routePreview.steps.length - 1);
      setHasArrived(true);
      return;
    }

    if (stepDistanceMeters <= adaptiveAdvanceThresholdMeters) {
      setCurrentStepIndex((current) => Math.min(current + 1, routePreview.steps.length - 1));
    }
  }, [
    currentSpeedMph,
    currentPosition,
    gpsAccuracyMeters,
    hasArrived,
    nextStep,
    routePreview,
    gpsTrackingEnabled,
    voiceGuidanceEnabled,
    voiceMode,
    voicePersona,
    voiceVolumePreset,
  ]);

  return {
    routePreview,
    routeAlternatives,
    isLoadingRoute,
    routeError,
    currentStepIndex,
    hasArrived,
    nextStep,
    refreshRoutePreview: () => {
      setRoutePreview(null);
      setRouteAlternatives([]);
      setRouteError("");
      setCurrentStepIndex(0);
      setHasArrived(false);
      lastRouteOriginKeyRef.current = null;
      lastRouteDestinationKeyRef.current = null;
      lastRouteOriginCoordinateRef.current = null;
      spokenStepIdsRef.current.clear();
    },
  };
}
