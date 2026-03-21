import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CoveragePartnerShop,
  CoverageSearchTarget,
} from "../components/maps/serviceCoverageMapTypes";
import { haversineMiles } from "../services/supabase/map";
import type {
  NavigationAddressResult,
  NavigationCoordinate,
  NavigationGuidanceSettings,
  NavigationRouteOptions,
  NavigationRoutePreview,
  NavigationRouteStep,
  NavigationSpeedLimitSnapshot,
  NavigationVoiceMode,
  NavigationVoiceVolumePreset,
} from "../types/navigation";
import {
  addressResultToSearchTarget,
  searchNavigationAddresses,
} from "../services/navigation/addressSearch";
import {
  getDefaultNavigationGuidanceSettings,
  loadNavigationGuidanceSettings,
  saveNavigationGuidanceSettings,
} from "../services/navigation/navigationPreferences";
import { fetchNavigationRouteOptions } from "../services/navigation/routeEngine";
import { fetchNearestSpeedLimit } from "../services/navigation/speedLimit";
import { createTimeoutAbortController } from "../services/navigation/requestTimeout";
import {
  cancelVoiceGuidance,
  getPreferredVoiceLabel,
  speakNavigationInstruction,
  supportsVoiceGuidance,
} from "../services/navigation/voiceGuidance";

type UseCoverageNavigationExperienceArgs = {
  selectedShop: CoveragePartnerShop | null;
  fallbackOriginTarget: CoverageSearchTarget | null;
};

export type CoverageNavigationExperience = {
  settings: NavigationGuidanceSettings;
  setVoiceMode: (voiceMode: NavigationVoiceMode) => void;
  setVoiceVolumePreset: (voiceVolumePreset: NavigationVoiceVolumePreset) => void;
  setGpsTrackingEnabled: (gpsTrackingEnabled: boolean) => void;
  setSpeedLimitMonitorEnabled: (speedLimitMonitorEnabled: boolean) => void;
  addressQuery: string;
  setAddressQuery: (value: string) => void;
  addressResults: NavigationAddressResult[];
  selectedAddressResult: NavigationAddressResult | null;
  isSearchingAddresses: boolean;
  addressError: string;
  searchAddresses: () => Promise<void>;
  chooseAddressResult: (result: NavigationAddressResult) => void;
  selectManualOrigin: (target: CoverageSearchTarget) => void;
  clearAddressResult: () => void;
  clearManualOrigin: () => void;
  routePreview: NavigationRoutePreview | null;
  routeAlternatives: NavigationRoutePreview[];
  selectedRouteIndex: number;
  setSelectedRouteIndex: (index: number) => void;
  isLoadingRoute: boolean;
  routeError: string;
  currentStepIndex: number;
  nextStep: NavigationRouteStep | null;
  currentPosition: NavigationCoordinate | null;
  currentSpeedMph: number | null;
  gpsAccuracyMeters: number | null;
  gpsError: string;
  speedLimitSnapshot: NavigationSpeedLimitSnapshot | null;
  activeOriginTarget: CoverageSearchTarget | null;
  activeOriginLabel: string;
  preferredVoiceLabel: string | null;
  voiceGuidanceSupported: boolean;
  refreshRoutePreview: () => void;
  resetNavigationSettings: () => void;
};

function toCoverageSearchTarget(
  coordinate: NavigationCoordinate,
  label: string,
  source: CoverageSearchTarget["source"]
): CoverageSearchTarget {
  return {
    lat: coordinate.lat,
    lng: coordinate.lng,
    label,
    source,
  };
}

function calculateFallbackSpeedMph(
  previousPosition: NavigationCoordinate | null,
  previousTimestamp: number | null,
  nextPosition: NavigationCoordinate,
  nextTimestamp: number
) {
  if (!previousPosition || !previousTimestamp) {
    return null;
  }

  const elapsedHours = (nextTimestamp - previousTimestamp) / (1000 * 60 * 60);

  if (elapsedHours <= 0) {
    return null;
  }

  return haversineMiles(previousPosition, nextPosition) / elapsedHours;
}

function shouldSpeakStep(step: NavigationRouteStep, voiceMode: NavigationVoiceMode) {
  if (voiceMode === "muted") {
    return false;
  }

  if (voiceMode === "full") {
    return true;
  }

  return step.maneuverType !== "continue" && step.maneuverType !== "depart";
}

function getManeuverBaseSpeakDistanceMeters(step: NavigationRouteStep) {
  if (step.maneuverType === "arrive") {
    return 95;
  }

  if (step.maneuverType === "roundabout" || step.maneuverType === "off ramp") {
    return 180;
  }

  if (step.maneuverType === "turn" || step.maneuverType === "fork") {
    return 150;
  }

  if (step.maneuverType === "merge" || step.maneuverType === "on ramp") {
    return 170;
  }

  return 140;
}

function getManeuverAdvanceDistanceMeters(step: NavigationRouteStep) {
  if (step.maneuverType === "arrive") {
    return 42;
  }

  if (step.maneuverType === "roundabout" || step.maneuverType === "off ramp") {
    return 34;
  }

  return 28;
}

function getSpeedAdjustmentMeters(currentSpeedMph: number | null) {
  if (!currentSpeedMph || !Number.isFinite(currentSpeedMph)) {
    return 0;
  }

  if (currentSpeedMph >= 65) {
    return 72;
  }

  if (currentSpeedMph >= 45) {
    return 40;
  }

  if (currentSpeedMph >= 30) {
    return 20;
  }

  return 0;
}

function getAccuracyAdjustmentMeters(gpsAccuracyMeters: number | null) {
  if (!gpsAccuracyMeters || !Number.isFinite(gpsAccuracyMeters)) {
    return 0;
  }

  return Math.max(0, Math.min(45, gpsAccuracyMeters * 0.25));
}

function buildOriginKey(target: CoverageSearchTarget | null) {
  if (!target) {
    return null;
  }

  return `${target.source}:${target.lat.toFixed(4)},${target.lng.toFixed(4)}`;
}

function buildDestinationKey(shop: CoveragePartnerShop | null) {
  if (!shop) {
    return null;
  }

  return `${shop.id || shop.name}:${shop.lat.toFixed(4)},${shop.lng.toFixed(4)}`;
}

export function useCoverageNavigationExperience({
  selectedShop,
  fallbackOriginTarget,
}: UseCoverageNavigationExperienceArgs): CoverageNavigationExperience {
  const [settings, setSettings] = useState<NavigationGuidanceSettings>(() =>
    loadNavigationGuidanceSettings()
  );
  const [addressQuery, setAddressQueryState] = useState("");
  const [addressResults, setAddressResults] = useState<NavigationAddressResult[]>([]);
  const [selectedAddressResult, setSelectedAddressResult] =
    useState<NavigationAddressResult | null>(null);
  const [selectedManualOriginTarget, setSelectedManualOriginTarget] =
    useState<CoverageSearchTarget | null>(null);
  const [isSearchingAddresses, setIsSearchingAddresses] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [routePreview, setRoutePreview] = useState<NavigationRoutePreview | null>(null);
  const [routeAlternatives, setRouteAlternatives] = useState<NavigationRoutePreview[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndexState] = useState(0);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<NavigationCoordinate | null>(null);
  const [currentSpeedMph, setCurrentSpeedMph] = useState<number | null>(null);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState("");
  const [speedLimitSnapshot, setSpeedLimitSnapshot] = useState<NavigationSpeedLimitSnapshot | null>(
    null
  );
  const [preferredVoiceLabel, setPreferredVoiceLabel] = useState<string | null>(() =>
    getPreferredVoiceLabel(loadNavigationGuidanceSettings().voicePersona)
  );

  const previousPositionRef = useRef<NavigationCoordinate | null>(null);
  const previousPositionTimestampRef = useRef<number | null>(null);
  const addressSearchAbortRef = useRef<AbortController | null>(null);
  const lastRouteOriginKeyRef = useRef<string | null>(null);
  const lastRouteDestinationKeyRef = useRef<string | null>(null);
  const lastRouteOriginCoordinateRef = useRef<NavigationCoordinate | null>(null);
  const spokenStepIdsRef = useRef<Set<string>>(new Set());
  const lastSpeedLimitLookupRef = useRef<{
    coordinate: NavigationCoordinate;
    fetchedAt: number;
  } | null>(null);

  useEffect(() => {
    return () => {
      addressSearchAbortRef.current?.abort();
      cancelVoiceGuidance();
    };
  }, []);

  useEffect(() => {
    saveNavigationGuidanceSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!supportsVoiceGuidance()) {
      setPreferredVoiceLabel(null);
      return;
    }

    const refreshVoiceLabel = () => {
      setPreferredVoiceLabel(getPreferredVoiceLabel(settings.voicePersona));
    };

    refreshVoiceLabel();

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const speechSynthesis = window.speechSynthesis as EventTarget & SpeechSynthesis;
    speechSynthesis.addEventListener("voiceschanged", refreshVoiceLabel);

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", refreshVoiceLabel);
    };
  }, [settings.voicePersona]);

  useEffect(() => {
    if (!settings.gpsTrackingEnabled) {
      setGpsError("");
      setCurrentPosition(null);
      setCurrentSpeedMph(null);
      setGpsAccuracyMeters(null);
      setSpeedLimitSnapshot(null);
      previousPositionRef.current = null;
      previousPositionTimestampRef.current = null;
      return;
    }

    if (!navigator.geolocation) {
      setGpsError("This browser does not expose on-device GPS.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const nextTimestamp = position.timestamp;
        const speedFromDevice =
          typeof position.coords.speed === "number" && Number.isFinite(position.coords.speed)
            ? position.coords.speed * 2.23694
            : null;
        const fallbackSpeed = calculateFallbackSpeedMph(
          previousPositionRef.current,
          previousPositionTimestampRef.current,
          nextPosition,
          nextTimestamp
        );

        previousPositionRef.current = nextPosition;
        previousPositionTimestampRef.current = nextTimestamp;
        setCurrentPosition(nextPosition);
        setCurrentSpeedMph(
          speedFromDevice !== null && speedFromDevice >= 0 ? speedFromDevice : fallbackSpeed
        );
        setGpsAccuracyMeters(position.coords.accuracy || null);
        setGpsError("");
      },
      (error) => {
        setGpsError(error.message || "Unable to access device location.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [settings.gpsTrackingEnabled]);

  const activeOriginTarget = useMemo<CoverageSearchTarget | null>(() => {
    if (settings.gpsTrackingEnabled && currentPosition) {
      return toCoverageSearchTarget(currentPosition, "Live GPS position", "geolocation");
    }

    if (selectedManualOriginTarget) {
      return selectedManualOriginTarget;
    }

    return fallbackOriginTarget;
  }, [
    currentPosition,
    fallbackOriginTarget,
    selectedManualOriginTarget,
    settings.gpsTrackingEnabled,
  ]);

  const activeOriginLabel =
    selectedAddressResult?.primaryLabel ||
    selectedManualOriginTarget?.label ||
    (settings.gpsTrackingEnabled && currentPosition
      ? "Live GPS position"
      : fallbackOriginTarget?.label) ||
    "Coverage focus";
  const originKey = buildOriginKey(activeOriginTarget);
  const destinationKey = buildDestinationKey(selectedShop);

  useEffect(() => {
    if (!selectedShop || !activeOriginTarget || !originKey || !destinationKey) {
      setRoutePreview(null);
      setRouteAlternatives([]);
      setRouteError("");
      setCurrentStepIndex(0);
      setSelectedRouteIndexState(0);
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
      settings.gpsTrackingEnabled && currentPosition
        ? !lastRouteOriginCoordinateRef.current ||
          haversineMiles(currentPosition, lastRouteOriginCoordinateRef.current) >= 0.18
        : false;
    const shouldRefreshRoute =
      !routePreview ||
      hasDestinationChanged ||
      (settings.gpsTrackingEnabled && currentPosition ? gpsMovedEnough : hasOriginChanged);

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
        setSelectedRouteIndexState(nextIndex);
        setRoutePreview(selectedRoute);
        setCurrentStepIndex(selectedRoute && selectedRoute.steps.length > 1 ? 1 : 0);
        spokenStepIdsRef.current.clear();
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
        setSelectedRouteIndexState(0);
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
    settings.gpsTrackingEnabled,
  ]);

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
    setCurrentStepIndex(selectedRoute.steps.length > 1 ? 1 : 0);
    spokenStepIdsRef.current.clear();
  }, [routeAlternatives, selectedRouteIndex]);

  const nextStep = routePreview?.steps[currentStepIndex] || null;

  useEffect(() => {
    if (!routePreview) {
      return;
    }

    if (!settings.gpsTrackingEnabled || !currentPosition || !nextStep) {
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
      shouldSpeakStep(nextStep, settings.voiceMode);

    if (shouldSpeak) {
      speakNavigationInstruction({
        text: nextStep.instruction,
        voiceMode: settings.voiceMode,
        voicePersona: settings.voicePersona,
        voiceVolumePreset: settings.voiceVolumePreset,
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
    settings.gpsTrackingEnabled,
    settings.voiceMode,
    settings.voicePersona,
    settings.voiceVolumePreset,
  ]);

  useEffect(() => {
    if (!settings.gpsTrackingEnabled || !settings.speedLimitMonitorEnabled) {
      setSpeedLimitSnapshot(null);
      return;
    }

    if (!currentPosition) {
      return;
    }

    const lastLookup = lastSpeedLimitLookupRef.current;

    if (
      lastLookup &&
      Date.now() - lastLookup.fetchedAt < 30000 &&
      haversineMiles(currentPosition, lastLookup.coordinate) < 0.12
    ) {
      return;
    }

    const speedRequest = createTimeoutAbortController(10000);

    fetchNearestSpeedLimit(currentPosition, speedRequest.controller.signal)
      .then((snapshot) => {
        if (!speedRequest.controller.signal.aborted) {
          setSpeedLimitSnapshot(snapshot);
          lastSpeedLimitLookupRef.current = {
            coordinate: currentPosition,
            fetchedAt: Date.now(),
          };
        }
      })
      .catch((error) => {
        if (!speedRequest.controller.signal.aborted && !speedRequest.didTimeout()) {
          console.error("Speed limit lookup failed:", error);
        }
      });

    return () => {
      speedRequest.clear();
      speedRequest.controller.abort();
    };
  }, [currentPosition, settings.gpsTrackingEnabled, settings.speedLimitMonitorEnabled]);

  async function searchAddresses() {
    if (addressQuery.trim().length < 4) {
      setAddressError("Enter a full house, store, or street address to search.");
      setAddressResults([]);
      return;
    }

    addressSearchAbortRef.current?.abort();
    const addressRequest = createTimeoutAbortController(12000);
    addressSearchAbortRef.current = addressRequest.controller;
    setIsSearchingAddresses(true);
    setAddressError("");

    try {
      const results = await searchNavigationAddresses(
        addressQuery,
        addressRequest.controller.signal
      );
      setAddressResults(results);

      if (results.length === 0) {
        setAddressError("No address matches were found. Try a fuller address.");
      }
    } catch (error) {
      if (!addressRequest.controller.signal.aborted || addressRequest.didTimeout()) {
        setAddressError(error instanceof Error ? error.message : "Address lookup failed.");

        if (addressRequest.didTimeout()) {
          setAddressError("Address lookup timed out. Try a shorter query or retry.");
        }

        setAddressResults([]);
      }
    } finally {
      addressRequest.clear();

      if (addressSearchAbortRef.current === addressRequest.controller) {
        addressSearchAbortRef.current = null;
      }

      if (!addressRequest.controller.signal.aborted || addressRequest.didTimeout()) {
        setIsSearchingAddresses(false);
      }
    }
  }

  function chooseAddressResult(result: NavigationAddressResult) {
    setSelectedAddressResult(result);
    setSelectedManualOriginTarget(addressResultToSearchTarget(result));
    setAddressQueryState(result.primaryLabel);
    setAddressResults([]);
    setAddressError("");
  }

  function clearManualOriginSelection() {
    setSelectedAddressResult(null);
    setSelectedManualOriginTarget(null);
    setAddressError("");
    setAddressResults([]);
  }

  return {
    settings,
    setVoiceMode: (voiceMode: NavigationVoiceMode) =>
      setSettings((current) => ({ ...current, voiceMode })),
    setVoiceVolumePreset: (voiceVolumePreset: NavigationVoiceVolumePreset) =>
      setSettings((current) => ({ ...current, voiceVolumePreset })),
    setGpsTrackingEnabled: (gpsTrackingEnabled: boolean) =>
      setSettings((current) => ({ ...current, gpsTrackingEnabled })),
    setSpeedLimitMonitorEnabled: (speedLimitMonitorEnabled: boolean) =>
      setSettings((current) => ({ ...current, speedLimitMonitorEnabled })),
    addressQuery,
    setAddressQuery: (value: string) => {
      setAddressQueryState(value);
      setAddressError("");
      setAddressResults([]);
    },
    addressResults,
    selectedAddressResult,
    isSearchingAddresses,
    addressError,
    searchAddresses,
    chooseAddressResult,
    selectManualOrigin: (target: CoverageSearchTarget) => {
      setSelectedAddressResult(null);
      setSelectedManualOriginTarget(target);
      setAddressQueryState(target.label);
      setAddressError("");
      setAddressResults([]);
    },
    clearAddressResult: () => {
      clearManualOriginSelection();
    },
    clearManualOrigin: clearManualOriginSelection,
    routePreview,
    routeAlternatives,
    selectedRouteIndex,
    setSelectedRouteIndex: (index: number) => {
      if (!Number.isFinite(index)) {
        return;
      }

      setSelectedRouteIndexState(Math.max(0, Math.floor(index)));
    },
    isLoadingRoute,
    routeError,
    currentStepIndex,
    nextStep,
    currentPosition,
    currentSpeedMph,
    gpsAccuracyMeters,
    gpsError,
    speedLimitSnapshot,
    activeOriginTarget,
    activeOriginLabel,
    preferredVoiceLabel,
    voiceGuidanceSupported: supportsVoiceGuidance(),
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
    resetNavigationSettings: () => setSettings(getDefaultNavigationGuidanceSettings()),
  };
}
