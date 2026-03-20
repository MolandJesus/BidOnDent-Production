import { useEffect, useMemo, useRef, useState } from "react";
import type { CoveragePartnerShop, CoverageSearchTarget } from "../components/maps/serviceCoverageMapTypes";
import { haversineMiles } from "../services/supabase/map";
import type {
  NavigationAddressResult,
  NavigationCoordinate,
  NavigationGuidanceSettings,
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
import { fetchNavigationRoutePreview } from "../services/navigation/routeEngine";
import { fetchNearestSpeedLimit } from "../services/navigation/speedLimit";
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
  const [selectedAddressResult, setSelectedAddressResult] = useState<NavigationAddressResult | null>(
    null
  );
  const [selectedManualOriginTarget, setSelectedManualOriginTarget] =
    useState<CoverageSearchTarget | null>(null);
  const [isSearchingAddresses, setIsSearchingAddresses] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [routePreview, setRoutePreview] = useState<NavigationRoutePreview | null>(null);
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
  const lastSpeedLimitLookupRef = useRef<{ coordinate: NavigationCoordinate; fetchedAt: number } | null>(
    null
  );

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
    (settings.gpsTrackingEnabled && currentPosition ? "Live GPS position" : fallbackOriginTarget?.label) ||
    "Coverage focus";
  const originKey = buildOriginKey(activeOriginTarget);
  const destinationKey = buildDestinationKey(selectedShop);

  useEffect(() => {
    if (!selectedShop || !activeOriginTarget || !originKey || !destinationKey) {
      setRoutePreview(null);
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

    const controller = new AbortController();
    setIsLoadingRoute(true);
    setRouteError("");

    fetchNavigationRoutePreview({
      origin: activeOriginCoordinate,
      destination: selectedShop,
      signal: controller.signal,
    })
      .then((nextRoute) => {
        setRoutePreview(nextRoute);
        setCurrentStepIndex(nextRoute.steps.length > 1 ? 1 : 0);
        spokenStepIdsRef.current.clear();
        lastRouteOriginKeyRef.current = originKey;
        lastRouteDestinationKeyRef.current = destinationKey;
        lastRouteOriginCoordinateRef.current = activeOriginCoordinate;
      })
      .catch((error) => {
        if (controller.signal.aborted) {
          return;
        }
        setRoutePreview(null);
        setRouteError(error instanceof Error ? error.message : "Unable to build a route preview.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingRoute(false);
        }
      });

    return () => controller.abort();
  }, [
    activeOriginTarget,
    currentPosition,
    destinationKey,
    originKey,
    routePreview,
    selectedShop,
    settings.gpsTrackingEnabled,
  ]);

  const nextStep = routePreview?.steps[currentStepIndex] || null;

  useEffect(() => {
    if (!routePreview) {
      return;
    }

    if (!settings.gpsTrackingEnabled || !currentPosition || !nextStep) {
      return;
    }

    const stepDistanceMeters =
      haversineMiles(currentPosition, nextStep.location) * 1609.34;
    const shouldSpeak =
      stepDistanceMeters <= (nextStep.maneuverType === "arrive" ? 90 : 140) &&
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

    if (stepDistanceMeters <= (nextStep.maneuverType === "arrive" ? 40 : 28)) {
      setCurrentStepIndex((current) => Math.min(current + 1, routePreview.steps.length - 1));
    }
  }, [
    currentPosition,
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

    const controller = new AbortController();

    fetchNearestSpeedLimit(currentPosition, controller.signal)
      .then((snapshot) => {
        if (!controller.signal.aborted) {
          setSpeedLimitSnapshot(snapshot);
          lastSpeedLimitLookupRef.current = {
            coordinate: currentPosition,
            fetchedAt: Date.now(),
          };
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error("Speed limit lookup failed:", error);
        }
      });

    return () => controller.abort();
  }, [currentPosition, settings.gpsTrackingEnabled, settings.speedLimitMonitorEnabled]);

  async function searchAddresses() {
    if (addressQuery.trim().length < 4) {
      setAddressError("Enter a full house, store, or street address to search.");
      setAddressResults([]);
      return;
    }

    addressSearchAbortRef.current?.abort();
    const controller = new AbortController();
    addressSearchAbortRef.current = controller;
    setIsSearchingAddresses(true);
    setAddressError("");

    try {
      const results = await searchNavigationAddresses(addressQuery, controller.signal);
      setAddressResults(results);

      if (results.length === 0) {
        setAddressError("No address matches were found. Try a fuller address.");
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setAddressError(error instanceof Error ? error.message : "Address lookup failed.");
        setAddressResults([]);
      }
    } finally {
      if (addressSearchAbortRef.current === controller) {
        addressSearchAbortRef.current = null;
      }

      if (!controller.signal.aborted) {
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
    resetNavigationSettings: () => setSettings(getDefaultNavigationGuidanceSettings()),
  };
}
