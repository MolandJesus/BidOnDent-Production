import { useEffect, useRef, useState } from "react";
import type {
  CoveragePartnerShop,
  CoverageSearchTarget,
} from "../components/maps/serviceCoverageMapTypes";
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
import { fetchNavigationRouteOptions } from "../services/navigation/routeEngine";
import { createTimeoutAbortController } from "../services/navigation/requestTimeout";
import {
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
  selectedShop: CoveragePartnerShop | null;
  activeOriginTarget: CoverageSearchTarget | null;
  currentPosition: NavigationCoordinate | null;
  currentSpeedMph: number | null;
  gpsAccuracyMeters: number | null;
  gpsTrackingEnabled: boolean;
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
  nextStep: NavigationRouteStep | null;
  refreshRoutePreview: () => void;
};

export function useNavigationRoutePreview({
  selectedShop,
  activeOriginTarget,
  currentPosition,
  currentSpeedMph,
  gpsAccuracyMeters,
  gpsTrackingEnabled,
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

  const lastRouteOriginKeyRef = useRef<string | null>(null);
  const lastRouteDestinationKeyRef = useRef<string | null>(null);
  const lastRouteOriginCoordinateRef = useRef<NavigationCoordinate | null>(null);
  const spokenStepIdsRef = useRef<Set<string>>(new Set());

  const originKey = buildOriginKey(activeOriginTarget);
  const destinationKey = buildDestinationKey(selectedShop);

  // Route fetching
  useEffect(() => {
    if (!selectedShop || !activeOriginTarget || !originKey || !destinationKey) {
      setRoutePreview(null);
      setRouteAlternatives([]);
      setRouteError("");
      setCurrentStepIndex(0);
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
      gpsTrackingEnabled && currentPosition
        ? !lastRouteOriginCoordinateRef.current ||
          haversineMiles(currentPosition, lastRouteOriginCoordinateRef.current) >= 0.18
        : false;
    const shouldRefreshRoute =
      !routePreview ||
      hasDestinationChanged ||
      (gpsTrackingEnabled && currentPosition ? gpsMovedEnough : hasOriginChanged);

    if (!shouldRefreshRoute) {
      return;
    }

    const routeRequest = createTimeoutAbortController(15000);
    setIsLoadingRoute(true);
    setRouteError("");

    fetchNavigationRouteOptions({
      origin: activeOriginCoordinate,
      destination: selectedShop,
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
          spokenStepIdsRef.current = computeCarriedSpokenSteps(
            selectedRoute.steps,
            spokenStepIdsRef.current
          );
        } else {
          setCurrentStepIndex(0);
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
    selectedShop,
    selectedRouteIndex,
    gpsTrackingEnabled,
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

    if (!gpsTrackingEnabled || !currentPosition || !nextStep) {
      return;
    }

    const stepDistanceMeters = haversineMiles(currentPosition, nextStep.location) * 1609.34;
    const adaptiveSpeakThresholdMeters =
      getManeuverBaseSpeakDistanceMeters(nextStep) +
      getSpeedAdjustmentMeters(currentSpeedMph) +
      getAccuracyAdjustmentMeters(gpsAccuracyMeters);
    const adaptiveAdvanceThresholdMeters =
      getManeuverAdvanceDistanceMeters(nextStep) +
      getAccuracyAdjustmentMeters(gpsAccuracyMeters) * 0.5;
    const shouldSpeak =
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

    if (stepDistanceMeters <= adaptiveAdvanceThresholdMeters) {
      setCurrentStepIndex((current) => Math.min(current + 1, routePreview.steps.length - 1));
    }
  }, [
    currentSpeedMph,
    currentPosition,
    gpsAccuracyMeters,
    nextStep,
    routePreview,
    gpsTrackingEnabled,
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
    nextStep,
    refreshRoutePreview: () => {
      setRoutePreview(null);
      setRouteAlternatives([]);
      setRouteError("");
      setCurrentStepIndex(0);
      lastRouteOriginKeyRef.current = null;
      lastRouteDestinationKeyRef.current = null;
      lastRouteOriginCoordinateRef.current = null;
      spokenStepIdsRef.current.clear();
    },
  };
}
