import { useEffect, useMemo, useState } from "react";
import type {
  CoveragePartnerShop,
  CoverageSearchTarget,
} from "../components/maps/serviceCoverageMapTypes";
import type {
  NavigationAddressResult,
  NavigationAddressSuggestion,
  NavigationCoordinate,
  NavigationGuidanceSettings,
  NavigationRoutePreview,
  NavigationRouteStep,
  NavigationSpeedLimitSnapshot,
  NavigationVoiceMode,
  NavigationVoiceVolumePreset,
} from "../types/navigation";
import {
  getDefaultNavigationGuidanceSettings,
  loadNavigationGuidanceSettings,
  saveNavigationGuidanceSettings,
} from "../services/navigation/navigationPreferences";
import { useNavigationAddressSearch } from "./useNavigationAddressSearch";
import {
  cancelVoiceGuidance,
  getPreferredVoiceLabel,
  supportsVoiceGuidance,
} from "../services/navigation/voiceGuidance";
import { primeVoiceEngine } from "../services/navigation/voiceSupport";
import { useVoiceSupport } from "./useVoiceSupport";
import { useNavigationGpsTracking } from "./useNavigationGpsTracking";
import type { GpsStatus, SpeedLimitStatus } from "./useNavigationGpsTracking";
import { toCoverageSearchTarget } from "../services/navigation/navigationGuidanceHelpers";
import { useNavigationRoutePreview } from "./useNavigationRoutePreview";

export type { GpsStatus, SpeedLimitStatus };

type UseCoverageNavigationExperienceArgs = {
  selectedShop: CoveragePartnerShop | null;
  fallbackOriginTarget: CoverageSearchTarget | null;
  originPriority?: "gps-first" | "fallback-first";
  voiceGuidanceEnabled?: boolean;
};

export type CoverageNavigationExperience = {
  settings: NavigationGuidanceSettings;
  setVoiceMode: (voiceMode: NavigationVoiceMode) => void;
  setVoiceVolumePreset: (voiceVolumePreset: NavigationVoiceVolumePreset) => void;
  setGpsTrackingEnabled: (gpsTrackingEnabled: boolean) => void;
  setSpeedLimitMonitorEnabled: (speedLimitMonitorEnabled: boolean) => void;
  setAutoRerouteEnabled: (autoRerouteEnabled: boolean) => void;
  addressQuery: string;
  setAddressQuery: (value: string) => void;
  addressResults: NavigationAddressResult[];
  addressSuggestions: NavigationAddressSuggestion[];
  selectedAddressResult: NavigationAddressResult | null;
  isSearchingAddresses: boolean;
  addressError: string;
  searchAddresses: () => Promise<NavigationAddressResult[]>;
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
  hasArrived: boolean;
  nextStep: NavigationRouteStep | null;
  currentPosition: NavigationCoordinate | null;
  currentHeadingDegrees: number | null;
  currentSpeedMph: number | null;
  gpsAccuracyMeters: number | null;
  gpsError: string;
  gpsStatus: GpsStatus;
  retryGps: () => void;
  speedLimitSnapshot: NavigationSpeedLimitSnapshot | null;
  speedLimitStatus: SpeedLimitStatus;
  activeOriginTarget: CoverageSearchTarget | null;
  activeOriginLabel: string;
  preferredVoiceLabel: string | null;
  voiceGuidanceSupported: boolean;
  voiceStatusLabel: string;
  refreshRoutePreview: () => void;
  resetNavigationSettings: () => void;
};

export function useCoverageNavigationExperience({
  selectedShop,
  fallbackOriginTarget,
  originPriority = "gps-first",
  voiceGuidanceEnabled = false,
}: UseCoverageNavigationExperienceArgs): CoverageNavigationExperience {
  const [settings, setSettings] = useState<NavigationGuidanceSettings>(() =>
    loadNavigationGuidanceSettings()
  );
  const voiceSupport = useVoiceSupport();
  const addressSearch = useNavigationAddressSearch();
  const { selectedAddressResult, selectedManualOriginTarget } = addressSearch;
  const [selectedRouteIndex, setSelectedRouteIndexState] = useState(0);
  const {
    currentPosition,
    currentHeadingDegrees,
    currentSpeedMph,
    gpsAccuracyMeters,
    gpsError,
    gpsStatus,
    retryGps,
    speedLimitSnapshot,
    speedLimitStatus,
  } = useNavigationGpsTracking({
    gpsTrackingEnabled: settings.gpsTrackingEnabled,
    speedLimitMonitorEnabled: settings.speedLimitMonitorEnabled,
  });
  const [preferredVoiceLabel, setPreferredVoiceLabel] = useState<string | null>(() =>
    getPreferredVoiceLabel(loadNavigationGuidanceSettings().voicePersona)
  );

  useEffect(() => {
    return () => {
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

  const activeOriginTarget = useMemo<CoverageSearchTarget | null>(() => {
    if (selectedManualOriginTarget) {
      return selectedManualOriginTarget;
    }

    if (originPriority === "fallback-first" && fallbackOriginTarget) {
      return fallbackOriginTarget;
    }

    if (settings.gpsTrackingEnabled && currentPosition) {
      return toCoverageSearchTarget(currentPosition, "Live GPS position", "geolocation");
    }

    return fallbackOriginTarget;
  }, [
    currentPosition,
    fallbackOriginTarget,
    originPriority,
    selectedManualOriginTarget,
    settings.gpsTrackingEnabled,
  ]);

  const activeOriginLabel =
    selectedAddressResult?.primaryLabel ||
    selectedManualOriginTarget?.label ||
    (originPriority === "fallback-first" && fallbackOriginTarget?.label) ||
    ((settings.gpsTrackingEnabled && currentPosition ? "Live GPS position" : null) ??
      fallbackOriginTarget?.label) ||
    "Service area";

  const {
    routePreview,
    routeAlternatives,
    isLoadingRoute,
    routeError,
    currentStepIndex,
    hasArrived,
    nextStep,
    refreshRoutePreview,
  } = useNavigationRoutePreview({
    selectedDestination: selectedShop
      ? {
          id: selectedShop.id ?? selectedShop.name,
          name: selectedShop.name,
          lat: selectedShop.lat,
          lng: selectedShop.lng,
          kind: "shop" as const,
          address: selectedShop.addressLine,
        }
      : null,
    activeOriginTarget,
    currentPosition,
    currentSpeedMph,
    gpsAccuracyMeters,
    gpsTrackingEnabled: settings.gpsTrackingEnabled,
    voiceGuidanceEnabled,
    voiceMode: settings.voiceMode,
    voicePersona: settings.voicePersona,
    voiceVolumePreset: settings.voiceVolumePreset,
    selectedRouteIndex,
  });

  return {
    settings,
    setVoiceMode: (voiceMode: NavigationVoiceMode) => {
      // Prime the speech engine on first non-muted activation.
      // Safari requires the first speak() call to originate from
      // a user gesture — this setVoiceMode call is gesture-sourced
      // (user tapped a voice mode button).
      if (voiceMode !== "muted") {
        primeVoiceEngine();
      }
      setSettings((current) => ({ ...current, voiceMode }));
    },
    setVoiceVolumePreset: (voiceVolumePreset: NavigationVoiceVolumePreset) =>
      setSettings((current) => ({ ...current, voiceVolumePreset })),
    setGpsTrackingEnabled: (gpsTrackingEnabled: boolean) =>
      setSettings((current) => ({ ...current, gpsTrackingEnabled })),
    setSpeedLimitMonitorEnabled: (speedLimitMonitorEnabled: boolean) =>
      setSettings((current) => ({ ...current, speedLimitMonitorEnabled })),
    setAutoRerouteEnabled: (autoRerouteEnabled: boolean) =>
      setSettings((current) => ({ ...current, autoRerouteEnabled })),
    addressQuery: addressSearch.addressQuery,
    setAddressQuery: addressSearch.setAddressQuery,
    addressResults: addressSearch.addressResults,
    addressSuggestions: addressSearch.addressSuggestions,
    selectedAddressResult,
    isSearchingAddresses: addressSearch.isSearchingAddresses,
    addressError: addressSearch.addressError,
    searchAddresses: addressSearch.searchAddresses,
    chooseAddressResult: addressSearch.chooseAddressResult,
    selectManualOrigin: addressSearch.selectManualOrigin,
    clearAddressResult: addressSearch.clearAddressResult,
    clearManualOrigin: addressSearch.clearManualOrigin,
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
    hasArrived,
    nextStep,
    currentPosition,
    currentHeadingDegrees,
    currentSpeedMph,
    gpsAccuracyMeters,
    gpsError,
    gpsStatus,
    retryGps,
    speedLimitSnapshot,
    speedLimitStatus,
    activeOriginTarget,
    activeOriginLabel,
    preferredVoiceLabel,
    voiceGuidanceSupported: supportsVoiceGuidance(),
    voiceStatusLabel: voiceSupport.statusLabel,
    refreshRoutePreview,
    resetNavigationSettings: () => setSettings(getDefaultNavigationGuidanceSettings()),
  };
}
