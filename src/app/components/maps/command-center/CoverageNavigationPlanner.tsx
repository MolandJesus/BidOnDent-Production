import { useEffect, useRef, useState } from "react";

import { cn } from "@/platform-core/cn";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";
import type {
  NavigationAddressResult,
  NavigationAddressSuggestion,
  NavigationGuidanceSettings,
  NavigationRoutePreview,
  NavigationVoiceMode,
  NavigationVoiceVolumePreset,
} from "../../../types/navigation";
import type { CoveragePartnerShop } from "../serviceCoverageMapTypes";
import type { GpsStatus, SpeedLimitStatus } from "../../../hooks/useCoverageNavigationExperience";
import { getProviderHealthSummary } from "../../../services/navigation/providerHealth";
import { getMapPerformanceSummary } from "../../../services/navigation/mapPerformance";
import { getLatestDiscoveryQualitySnapshot } from "../../../services/navigation/placeDiscovery";
import { getNavigationDiagnosticsSignal } from "../../../services/navigation/navigationDiagnosticsSignal";
import { getConfidenceTrendState } from "../../../services/navigation/navigationPlannerPresentation";
import PlannerAddressSearch from "./PlannerAddressSearch";
import PlannerVoiceGpsSettings from "./PlannerVoiceGpsSettings";
import PlannerRoutePreview from "./PlannerRoutePreview";
import PlannerDiagnosticsPanel from "./PlannerDiagnosticsPanel";

type CoverageNavigationPlannerProps = {
  tone: MapSurfaceTone;
  focusMode?: "search" | "route";
  showDiagnostics?: boolean;
  showSavedAndDiscoveryHints?: boolean;
  showAdvancedControls?: boolean;
  selectedShop: CoveragePartnerShop | null;
  activeOriginLabel: string;
  addressQuery: string;
  onAddressQueryChange: (value: string) => void;
  onSearchAddresses: () => void;
  addressResults: NavigationAddressResult[];
  addressSuggestions?: NavigationAddressSuggestion[];
  selectedAddressResult: NavigationAddressResult | null;
  isSearchingAddresses: boolean;
  addressError: string;
  onChooseAddressResult: (result: NavigationAddressResult) => void;
  onClearAddressResult: () => void;
  settings: NavigationGuidanceSettings;
  onVoiceModeChange: (voiceMode: NavigationVoiceMode) => void;
  onVoiceVolumePresetChange: (voiceVolumePreset: NavigationVoiceVolumePreset) => void;
  onGpsTrackingEnabledChange: (enabled: boolean) => void;
  onSpeedLimitMonitorEnabledChange: (enabled: boolean) => void;
  onResetNavigationSettings: () => void;
  onRetryRoutePreview: () => void;
  onStartNavigation: () => void;
  onOpenShops: () => void;
  preferredVoiceLabel: string | null;
  voiceGuidanceSupported: boolean;
  voiceStatusLabel: string;
  routePreview: NavigationRoutePreview | null;
  routeAlternatives: NavigationRoutePreview[];
  selectedRouteIndex: number;
  onSelectRouteIndex: (index: number) => void;
  isLoadingRoute: boolean;
  routeError: string;
  currentStepIndex: number;
  gpsAccuracyMeters: number | null;
  gpsError: string;
  gpsStatus: GpsStatus;
  retryGps: () => void;
  speedLimitStatus: SpeedLimitStatus;
};

export default function CoverageNavigationPlanner({
  tone,
  focusMode = "route",
  showDiagnostics = Boolean(import.meta.env?.DEV),
  showSavedAndDiscoveryHints = false,
  showAdvancedControls = true,
  selectedShop,
  activeOriginLabel,
  addressQuery,
  onAddressQueryChange,
  onSearchAddresses,
  addressResults,
  addressSuggestions = [],
  selectedAddressResult,
  isSearchingAddresses,
  addressError,
  onChooseAddressResult,
  onClearAddressResult,
  settings,
  onVoiceModeChange,
  onVoiceVolumePresetChange,
  onGpsTrackingEnabledChange,
  onSpeedLimitMonitorEnabledChange,
  onResetNavigationSettings,
  onRetryRoutePreview,
  onStartNavigation,
  onOpenShops,
  preferredVoiceLabel,
  voiceGuidanceSupported,
  voiceStatusLabel,
  routePreview,
  routeAlternatives,
  selectedRouteIndex,
  onSelectRouteIndex,
  isLoadingRoute,
  routeError,
  currentStepIndex,
  gpsAccuracyMeters,
  gpsError,
  gpsStatus,
  retryGps,
  speedLimitStatus,
}: CoverageNavigationPlannerProps) {
  const showDevDiagnosticsActions =
    typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);
  const theme = getMapSurfaceTheme(tone, true);
  const routeDistanceMiles = routePreview ? routePreview.distanceMeters / 1609.34 : null;
  const routeDurationMinutes = routePreview ? routePreview.durationSeconds / 60 : null;
  const [, forceDiagnosticsRefresh] = useState(0);
  const providerHealth = getProviderHealthSummary();
  const mapPerformance = getMapPerformanceSummary();
  const diagnosticsSignal = getNavigationDiagnosticsSignal(providerHealth, mapPerformance);
  const discoveryQualitySnapshot = getLatestDiscoveryQualitySnapshot();
  const staleTelemetryProviderSummary =
    diagnosticsSignal.providerRiskReason === "stale-telemetry" && diagnosticsSignal.providerAtRisk
      ? providerHealth.find((summary) => summary.provider === diagnosticsSignal.providerAtRisk) ||
        null
      : null;
  const [showDiagnosticsDetails, setShowDiagnosticsDetails] = useState(false);
  const [lastDiagnosticsRefreshAt, setLastDiagnosticsRefreshAt] = useState<string | null>(null);
  const [diagnosticsRefreshError, setDiagnosticsRefreshError] = useState<string | null>(null);
  const [confidenceTrendDelta, setConfidenceTrendDelta] = useState<number | null>(null);
  const previousConfidenceRef = useRef<number | null>(null);
  const confidenceTrend = getConfidenceTrendState(confidenceTrendDelta);
  const diagnosticsToneClassName =
    diagnosticsSignal.level === "degraded"
      ? tone === "light"
        ? "border-rose-300 bg-rose-50 text-rose-900"
        : "border-rose-300/30 bg-rose-500/10 text-rose-100"
      : diagnosticsSignal.level === "watch"
        ? tone === "light"
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : "border-amber-300/30 bg-amber-500/10 text-amber-100"
        : diagnosticsSignal.level === "healthy"
          ? tone === "light"
            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
            : "border-emerald-300/30 bg-emerald-500/10 text-emerald-100"
          : theme.panelClassName;
  const isSearchFocus = focusMode === "search";

  const handleRunDiagnosticsChecks = () => {
    if (!showDevDiagnosticsActions || typeof window === "undefined") {
      return;
    }

    const diagnosticsRunner = (window as unknown as Record<string, unknown>)
      .runNavigationDiagnosticsChecks;

    if (typeof diagnosticsRunner !== "function") {
      setDiagnosticsRefreshError("Diagnostics runner is not available in this session.");
      return;
    }

    try {
      (diagnosticsRunner as () => unknown)();
      setDiagnosticsRefreshError(null);
      setLastDiagnosticsRefreshAt(new Date().toISOString());
      forceDiagnosticsRefresh((current) => current + 1);
    } catch (error) {
      setDiagnosticsRefreshError(
        error instanceof Error ? error.message : "Failed to run diagnostics checks."
      );
    }
  };

  useEffect(() => {
    if (previousConfidenceRef.current === null) {
      previousConfidenceRef.current = diagnosticsSignal.confidenceScore;
      return;
    }

    const delta = diagnosticsSignal.confidenceScore - previousConfidenceRef.current;
    setConfidenceTrendDelta(delta);
    previousConfidenceRef.current = diagnosticsSignal.confidenceScore;
  }, [diagnosticsSignal.confidenceScore]);

  return (
    <div
      className={cn(
        "map-liquid-panel map-ui-enter space-y-3 rounded-[1.75rem] p-3",
        theme.panelStrongClassName
      )}
    >
      <PlannerAddressSearch
        tone={tone}
        theme={theme}
        activeOriginLabel={activeOriginLabel}
        selectedAddressResult={selectedAddressResult}
        gpsTrackingEnabled={settings.gpsTrackingEnabled}
        addressQuery={addressQuery}
        onAddressQueryChange={onAddressQueryChange}
        onSearchAddresses={onSearchAddresses}
        addressResults={addressResults}
        addressSuggestions={addressSuggestions}
        isSearchingAddresses={isSearchingAddresses}
        addressError={addressError}
        onChooseAddressResult={onChooseAddressResult}
        onClearAddressResult={onClearAddressResult}
      />

      <PlannerVoiceGpsSettings
        tone={tone}
        theme={theme}
        showAdvancedControls={showAdvancedControls}
        settings={settings}
        onVoiceModeChange={onVoiceModeChange}
        onVoiceVolumePresetChange={onVoiceVolumePresetChange}
        onGpsTrackingEnabledChange={onGpsTrackingEnabledChange}
        onSpeedLimitMonitorEnabledChange={onSpeedLimitMonitorEnabledChange}
        preferredVoiceLabel={preferredVoiceLabel}
        voiceGuidanceSupported={voiceGuidanceSupported}
        voiceStatusLabel={voiceStatusLabel}
        gpsAccuracyMeters={gpsAccuracyMeters}
        gpsError={gpsError}
        gpsStatus={gpsStatus}
        retryGps={retryGps}
        speedLimitStatus={speedLimitStatus}
      />

      <PlannerRoutePreview
        tone={tone}
        theme={theme}
        showAdvancedControls={showAdvancedControls}
        isSearchFocus={isSearchFocus}
        selectedShop={selectedShop}
        routePreview={routePreview}
        routeAlternatives={routeAlternatives}
        selectedRouteIndex={selectedRouteIndex}
        onSelectRouteIndex={onSelectRouteIndex}
        isLoadingRoute={isLoadingRoute}
        routeError={routeError}
        routeDistanceMiles={routeDistanceMiles}
        routeDurationMinutes={routeDurationMinutes}
        onResetNavigationSettings={onResetNavigationSettings}
        onRetryRoutePreview={onRetryRoutePreview}
        onStartNavigation={onStartNavigation}
        onOpenShops={onOpenShops}
        currentStepIndex={currentStepIndex}
      />

      {showDiagnostics ? (
        <PlannerDiagnosticsPanel
          tone={tone}
          theme={theme}
          diagnosticsSignal={diagnosticsSignal}
          confidenceTrend={confidenceTrend}
          diagnosticsToneClassName={diagnosticsToneClassName}
          staleTelemetryProviderSummary={staleTelemetryProviderSummary}
          providerHealth={providerHealth}
          mapPerformance={mapPerformance}
          discoveryQualitySnapshot={discoveryQualitySnapshot}
          showDiagnosticsDetails={showDiagnosticsDetails}
          onToggleDiagnosticsDetails={() => setShowDiagnosticsDetails((current) => !current)}
          showDevDiagnosticsActions={showDevDiagnosticsActions}
          onRunDiagnosticsChecks={handleRunDiagnosticsChecks}
          lastDiagnosticsRefreshAt={lastDiagnosticsRefreshAt}
          diagnosticsRefreshError={diagnosticsRefreshError}
        />
      ) : null}
    </div>
  );
}
