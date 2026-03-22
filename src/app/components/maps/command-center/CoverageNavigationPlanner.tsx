import { FormEvent, useEffect, useRef, useState } from "react";
import {
  LocateFixed,
  MapPin,
  Mic2,
  Navigation,
  RefreshCcw,
  Search,
  ShieldAlert,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "../../ui/utils";
import { formatApproximateDriveWindow, formatDistanceMiles } from "../mapRoutePresentation";
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
import {
  formatRouteAlternativeDeltaLabel,
  getConfidenceTrendState,
} from "../../../services/navigation/navigationPlannerPresentation";

function providerLabel(provider: string) {
  if (provider === "osrm-route") {
    return "Route";
  }

  if (provider === "nominatim-search") {
    return "Address";
  }

  if (provider === "overpass-discovery") {
    return "Discovery";
  }

  return "Speed";
}

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
  preferredVoiceLabel: string | null;
  voiceGuidanceSupported: boolean;
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
  speedLimitStatus: SpeedLimitStatus;
};

function voiceModeDisplayLabel(voiceMode: NavigationVoiceMode) {
  if (voiceMode === "alerts-only") {
    return "Important only";
  }

  if (voiceMode === "muted") {
    return "Muted";
  }

  return "Full voice";
}

function diagnosticsDriverLabel(driver: "none" | "provider" | "performance" | "balanced") {
  if (driver === "provider") {
    return "Provider reliability";
  }

  if (driver === "performance") {
    return "Map interaction latency";
  }

  if (driver === "balanced") {
    return "Provider + map performance";
  }

  return "No dominant driver";
}

function diagnosticsReasonLabel(
  reason: "none" | "failure-rate" | "recent-error" | "stale-telemetry"
) {
  if (reason === "recent-error") {
    return "Recent error";
  }

  if (reason === "failure-rate") {
    return "Failure rate";
  }

  if (reason === "stale-telemetry") {
    return "Stale telemetry";
  }

  return null;
}

function formatAgeLabel(ageMs: number | null | undefined) {
  if (typeof ageMs !== "number" || ageMs < 0 || !Number.isFinite(ageMs)) {
    return "--";
  }

  if (ageMs < 30_000) {
    return "just now";
  }

  if (ageMs < 60 * 60 * 1000) {
    return `${Math.max(1, Math.round(ageMs / 60_000))}m ago`;
  }

  if (ageMs < 24 * 60 * 60 * 1000) {
    return `${Math.max(1, Math.round(ageMs / (60 * 60 * 1000)))}h ago`;
  }

  return `${Math.max(1, Math.round(ageMs / (24 * 60 * 60 * 1000)))}d ago`;
}

function formatDiscoveryCategoryMix(snapshot: {
  acceptedCount: number;
  acceptedBodyShopCount: number;
  acceptedInsuranceCount: number;
  acceptedFuelCount: number;
  acceptedRentalCount: number;
  acceptedSupplierCount: number;
}) {
  if (snapshot.acceptedCount <= 0) {
    return "Mix --";
  }

  const entries: Array<{ label: string; count: number }> = [
    { label: "Body", count: snapshot.acceptedBodyShopCount },
    { label: "Insurance", count: snapshot.acceptedInsuranceCount },
    { label: "Fuel", count: snapshot.acceptedFuelCount },
    { label: "Rental", count: snapshot.acceptedRentalCount },
    { label: "Supplier", count: snapshot.acceptedSupplierCount },
  ];

  return entries
    .filter((entry) => entry.count > 0)
    .map((entry) => `${entry.label} ${Math.round((entry.count / snapshot.acceptedCount) * 100)}%`)
    .join(" · ");
}

export default function CoverageNavigationPlanner({
  tone,
  focusMode = "route",
  showDiagnostics = true,
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
  preferredVoiceLabel,
  voiceGuidanceSupported,
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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchAddresses();
  };

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
      <div className="flex flex-wrap items-center gap-2">
        <span className={theme.eyebrowClassName}>Route Planner</span>
        <span className={theme.softBadgeClassName}>GPS + routing + voice</span>
      </div>

      <div
        className={cn(
          "map-liquid-card map-ui-enter map-ui-enter-delay-1 flex items-center justify-between gap-2 p-3",
          theme.panelClassName
        )}
      >
        <div className="min-w-0 flex-1">
          <div className={theme.metricLabelClassName}>Active origin</div>
          <div className={cn("mt-0.5 truncate text-sm font-semibold", theme.titleClassName)}>
            {selectedAddressResult?.primaryLabel || activeOriginLabel}
          </div>
        </div>
        <div className={cn("shrink-0 text-xs", theme.secondaryTextClassName)}>
          {settings.gpsTrackingEnabled ? "GPS" : "Manual"}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={cn(
          "map-liquid-card map-ui-enter map-ui-enter-delay-1 space-y-2 p-3",
          theme.panelClassName
        )}
      >
        <div>
          <label className={cn("mb-1.5 block text-xs font-semibold", theme.titleClassName)}>
            Search house or store address
          </label>
          <div className="flex gap-1.5">
            <input
              value={addressQuery}
              onChange={(event) => onAddressQueryChange(event.target.value)}
              placeholder="42 Broadway, New York..."
              className={cn(
                "h-9 flex-1 rounded-[0.875rem] border px-3 text-sm outline-none transition",
                tone === "light"
                  ? "border-white/80 bg-white/80 text-slate-900 placeholder:text-slate-400 focus:border-sky-300"
                  : "border-white/12 bg-slate-900/78 text-white placeholder:text-slate-400 focus:border-cyan-400/40"
              )}
            />
            <button
              type="submit"
              disabled={isSearchingAddresses}
              className={cn(
                theme.primaryButtonClassName,
                "!py-1.5 !px-3 !text-xs shrink-0 disabled:opacity-60"
              )}
            >
              <Search className="h-3.5 w-3.5" />
              {isSearchingAddresses ? "…" : "Search"}
            </button>
          </div>

          {addressSuggestions.length > 0 && !selectedAddressResult && !addressResults.length ? (
            <div className="map-ui-enter mt-1.5 space-y-0.5">
              {addressSuggestions.slice(0, 5).map((suggestion) => (
                <button
                  key={suggestion.id}
                  type="button"
                  onClick={() => {
                    onChooseAddressResult({
                      id: suggestion.id,
                      label: suggestion.subtitle || suggestion.title,
                      primaryLabel: suggestion.title,
                      secondaryLabel: suggestion.subtitle,
                      lat: suggestion.coordinate.lat,
                      lng: suggestion.coordinate.lng,
                      provider: suggestion.provider,
                    });
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-[0.75rem] px-2.5 py-1.5 text-left transition-colors",
                    tone === "light"
                      ? "hover:bg-sky-50 text-slate-800"
                      : "hover:bg-white/6 text-slate-200"
                  )}
                >
                  <MapPin className={cn("h-3.5 w-3.5 shrink-0", theme.secondaryTextClassName)} />
                  <div className="min-w-0 flex-1">
                    <div className={cn("truncate text-xs font-semibold", theme.titleClassName)}>
                      {suggestion.title}
                    </div>
                    {suggestion.subtitle ? (
                      <div className={cn("truncate text-[10px]", theme.secondaryTextClassName)}>
                        {suggestion.subtitle}
                      </div>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {selectedAddressResult ? (
          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-[1rem] px-3 py-2",
              theme.accentPanelClassName
            )}
          >
            <div>
              <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                Manual origin selected
              </div>
              <div className={cn("text-xs", theme.secondaryTextClassName)}>
                {selectedAddressResult.secondaryLabel || selectedAddressResult.label}
              </div>
            </div>
            <button
              type="button"
              onClick={onClearAddressResult}
              className={cn(theme.secondaryButtonClassName, "!py-1 !px-2.5 !text-xs")}
            >
              Clear
            </button>
          </div>
        ) : null}

        {addressError ? (
          <div
            className={cn(
              "rounded-[1rem] border px-3 py-2 text-sm",
              tone === "light"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-amber-300/20 bg-amber-500/10 text-amber-200"
            )}
          >
            {addressError}
          </div>
        ) : null}

        {addressResults.length > 0 ? (
          <div className="space-y-1">
            {addressResults.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => onChooseAddressResult(result)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-[0.75rem] px-2.5 py-2 text-left transition-colors",
                  tone === "light"
                    ? "hover:bg-sky-50 text-slate-800"
                    : "hover:bg-white/6 text-slate-200"
                )}
              >
                <MapPin className={cn("h-3.5 w-3.5 shrink-0", theme.secondaryTextClassName)} />
                <div className="min-w-0 flex-1">
                  <div className={cn("truncate text-xs font-semibold", theme.titleClassName)}>
                    {result.primaryLabel}
                  </div>
                  <div className={cn("truncate text-[10px]", theme.secondaryTextClassName)}>
                    {result.secondaryLabel || result.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </form>

      {showAdvancedControls ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <div
            className={cn(
              "map-liquid-card map-ui-enter map-ui-enter-delay-2 p-3",
              theme.panelClassName
            )}
          >
            <div className="flex items-center gap-1.5">
              <Mic2 className="h-3.5 w-3.5" />
              <span className={theme.metricLabelClassName}>Voice</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(["full", "alerts-only", "muted"] as NavigationVoiceMode[]).map((voiceMode) => (
                <button
                  key={voiceMode}
                  type="button"
                  onClick={() => onVoiceModeChange(voiceMode)}
                  className={cn(
                    settings.voiceMode === voiceMode
                      ? theme.primaryButtonClassName
                      : theme.secondaryButtonClassName,
                    "!py-1 !px-2.5 !text-xs !gap-1"
                  )}
                >
                  {voiceMode === "muted" ? (
                    <VolumeX className="h-3 w-3" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                  {voiceMode === "full" ? "Full" : voiceMode === "alerts-only" ? "Alerts" : "Off"}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(["louder", "normal", "softer"] as NavigationVoiceVolumePreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onVoiceVolumePresetChange(preset)}
                  className={cn(
                    settings.voiceVolumePreset === preset
                      ? theme.primaryButtonClassName
                      : theme.secondaryButtonClassName,
                    "!py-1 !px-2.5 !text-xs !gap-1"
                  )}
                >
                  {preset === "louder" ? "Louder" : preset === "softer" ? "Softer" : "Normal"}
                </button>
              ))}
            </div>
            <div className={cn("mt-2 text-[10px] leading-4", theme.secondaryTextClassName)}>
              {voiceGuidanceSupported
                ? `Voice: ${preferredVoiceLabel || "System default"}`
                : "Voice not available in this browser."}
            </div>
          </div>

          <div
            className={cn(
              "map-liquid-card map-ui-enter map-ui-enter-delay-2 p-3",
              theme.panelClassName
            )}
          >
            <div className="flex items-center gap-1.5">
              <LocateFixed className="h-3.5 w-3.5" />
              <span className={theme.metricLabelClassName}>GPS + speed</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onGpsTrackingEnabledChange(!settings.gpsTrackingEnabled)}
                className={cn(
                  settings.gpsTrackingEnabled
                    ? theme.primaryButtonClassName
                    : theme.secondaryButtonClassName,
                  "!py-1 !px-2.5 !text-xs !gap-1"
                )}
              >
                <Navigation className="h-3 w-3" />
                {settings.gpsTrackingEnabled ? "GPS on" : "GPS off"}
              </button>
              <button
                type="button"
                onClick={() => onSpeedLimitMonitorEnabledChange(!settings.speedLimitMonitorEnabled)}
                className={cn(
                  settings.speedLimitMonitorEnabled
                    ? theme.primaryButtonClassName
                    : theme.secondaryButtonClassName,
                  "!py-1 !px-2.5 !text-xs !gap-1"
                )}
              >
                <ShieldAlert className="h-3 w-3" />
                {settings.speedLimitMonitorEnabled ? "Speed alerts on" : "Speed alerts off"}
              </button>
            </div>
            <div className={cn("mt-2 text-[10px] leading-4", theme.secondaryTextClassName)}>
              {gpsError
                ? gpsError
                : gpsAccuracyMeters
                  ? `±${Math.round(gpsAccuracyMeters)}m accuracy`
                  : "Waiting for GPS fix..."}
            </div>
            {gpsStatus !== "active" && (
              <div
                className={cn(
                  "mt-1.5 flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium leading-4",
                  gpsStatus === "lost"
                    ? "bg-rose-500/20 text-rose-300"
                    : "bg-amber-500/20 text-amber-300"
                )}
              >
                <LocateFixed className="h-3 w-3 shrink-0" />
                {gpsStatus === "lost"
                  ? "GPS signal lost — position may be outdated"
                  : "GPS signal stale — no update in 10 s"}
              </div>
            )}
            {settings.speedLimitMonitorEnabled && speedLimitStatus === "unavailable" && (
              <div
                className={cn(
                  "mt-1.5 flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium leading-4",
                  "bg-slate-500/20 text-slate-300"
                )}
              >
                <ShieldAlert className="h-3 w-3 shrink-0" />
                Speed limit unavailable
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "map-liquid-card map-ui-enter map-ui-enter-delay-2 p-3",
            theme.panelClassName
          )}
        >
          <div className={theme.metricLabelClassName}>Navigation shell</div>
          <div className={cn("mt-1 text-xs", theme.bodyClassName)}>
            Voice, speed, and route controls appear when you switch tabs.
          </div>
        </div>
      )}

      {showSavedAndDiscoveryHints ? (
        <div className={cn("rounded-[0.875rem] border px-2.5 py-2 text-xs", theme.panelClassName)}>
          Tip: use tabs above to browse Explore, Saved, and Shops without losing search context.
        </div>
      ) : null}

      {showAdvancedControls ? (
        <div
          className={cn(
            "map-liquid-panel map-ui-enter map-ui-enter-delay-3 p-3",
            theme.accentPanelClassName
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className={theme.metricLabelClassName}>Route preview</div>
              <div className={cn("mt-0.5 text-sm font-semibold", theme.titleClassName)}>
                {selectedShop ? selectedShop.name : "Select a partner shop"}
              </div>
            </div>
            <button
              type="button"
              onClick={onResetNavigationSettings}
              className={cn(theme.secondaryButtonClassName, "!py-1 !px-2.5 !text-xs !gap-1")}
            >
              <RefreshCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {isLoadingRoute ? (
            <div className="mt-2 space-y-2">
              <div className={cn("text-xs", theme.bodyClassName)}>Building route preview…</div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className={cn("rounded-[0.875rem] px-2.5 py-2", theme.panelClassName)}>
                  <div className="h-2.5 w-16 animate-pulse rounded bg-slate-300/40" />
                  <div className="mt-1.5 h-5 w-12 animate-pulse rounded bg-slate-300/40" />
                </div>
                <div className={cn("rounded-[0.875rem] px-2.5 py-2", theme.panelClassName)}>
                  <div className="h-2.5 w-20 animate-pulse rounded bg-slate-300/40" />
                  <div className="mt-1.5 h-5 w-14 animate-pulse rounded bg-slate-300/40" />
                </div>
                <div className={cn("rounded-[0.875rem] px-2.5 py-2", theme.panelClassName)}>
                  <div className="h-2.5 w-12 animate-pulse rounded bg-slate-300/40" />
                  <div className="mt-1.5 h-5 w-10 animate-pulse rounded bg-slate-300/40" />
                </div>
              </div>
            </div>
          ) : routeError ? (
            <div
              className={cn(
                "mt-2 rounded-[0.875rem] border px-2.5 py-2",
                tone === "light"
                  ? "border-rose-200 bg-rose-50 text-rose-900"
                  : "border-rose-300/20 bg-rose-500/10 text-rose-200"
              )}
            >
              <div className="text-xs">{routeError}</div>
              <button
                type="button"
                onClick={onRetryRoutePreview}
                className={cn(
                  "mt-1.5",
                  theme.secondaryButtonClassName,
                  "!py-1 !px-2.5 !text-xs !gap-1"
                )}
              >
                <RefreshCcw className="h-3 w-3" />
                Retry
              </button>
            </div>
          ) : routePreview ? (
            <>
              {routeAlternatives.length > 1 ? (
                <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
                  {routeAlternatives.map((route, index) => {
                    const isSelected = index === selectedRouteIndex;
                    const distanceMiles = route.distanceMeters / 1609.34;
                    const durationMinutes = Math.round(route.durationSeconds / 60);
                    const comparedToFastestSeconds =
                      route.durationSeconds - routeAlternatives[0].durationSeconds;

                    return (
                      <button
                        key={`${route.fetchedAt}-${index}`}
                        type="button"
                        onClick={() => onSelectRouteIndex(index)}
                        className={cn(
                          "rounded-[0.875rem] border px-2.5 py-2 text-left backdrop-blur-2xl transition-all duration-200",
                          isSelected
                            ? tone === "light"
                              ? "border-sky-300/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.86))]"
                              : "border-cyan-400/30 bg-[linear-gradient(180deg,rgba(6,182,212,0.18),rgba(15,23,42,0.78))]"
                            : tone === "light"
                              ? "border-white/80 bg-white/72 hover:bg-white/90"
                              : "border-white/10 bg-slate-900/76 hover:bg-slate-900/88"
                        )}
                      >
                        <div className={cn("text-xs font-semibold", theme.titleClassName)}>
                          {index === 0 ? "Fastest" : `Alt ${index}`}
                        </div>
                        <div className={cn("text-[10px]", theme.secondaryTextClassName)}>
                          {formatDistanceMiles(distanceMiles)} • {durationMinutes} min
                        </div>
                        {index > 0 ? (
                          <div className={cn("text-[10px]", theme.secondaryTextClassName)}>
                            {formatRouteAlternativeDeltaLabel(comparedToFastestSeconds)}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className={cn("rounded-[0.875rem] px-2.5 py-2", theme.panelClassName)}>
                  <div className={theme.metricLabelClassName}>Distance</div>
                  <div className={cn("mt-0.5 text-base font-semibold", theme.titleClassName)}>
                    {formatDistanceMiles(routeDistanceMiles)}
                  </div>
                </div>
                <div className={cn("rounded-[0.875rem] px-2.5 py-2", theme.panelClassName)}>
                  <div className={theme.metricLabelClassName}>Drive window</div>
                  <div className={cn("mt-0.5 text-base font-semibold", theme.titleClassName)}>
                    {formatApproximateDriveWindow(routeDistanceMiles) ||
                      (routeDurationMinutes ? `${Math.round(routeDurationMinutes)} min` : "--")}
                  </div>
                </div>
                <div className={cn("rounded-[0.875rem] px-2.5 py-2", theme.panelClassName)}>
                  <div className={theme.metricLabelClassName}>Turn steps</div>
                  <div className={cn("mt-0.5 text-base font-semibold", theme.titleClassName)}>
                    {routePreview.steps.length}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={cn("mt-2 text-xs", theme.secondaryTextClassName)}>
              Pick a shop and provide GPS or a searched address to build a route.
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onStartNavigation}
              disabled={!routePreview || !selectedShop || isLoadingRoute}
              className={cn(
                theme.primaryButtonClassName,
                "!py-1.5 !px-3 !text-xs disabled:opacity-50"
              )}
            >
              <Navigation className="h-3.5 w-3.5" />
              Start Route
            </button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "map-liquid-panel map-ui-enter map-ui-enter-delay-3 p-3",
            theme.accentPanelClassName
          )}
        >
          <div className={theme.metricLabelClassName}>Route status</div>
          <div className={cn("mt-0.5 text-sm font-semibold", theme.titleClassName)}>
            {selectedShop ? selectedShop.name : "Choose a destination"}
          </div>
          <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
            {routePreview
              ? "Preview is ready. Start route when you are set."
              : "Address + destination will auto-build a route preview."}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onStartNavigation}
              disabled={!routePreview || !selectedShop || isLoadingRoute}
              className={cn(
                theme.primaryButtonClassName,
                "!py-1.5 !px-3 !text-xs disabled:opacity-50"
              )}
            >
              <Navigation className="h-3.5 w-3.5" />
              Start Route
            </button>
          </div>
        </div>
      )}

      {!isSearchFocus && routePreview?.steps.length ? (
        <div
          className={cn(
            "map-liquid-card map-ui-enter map-ui-enter-delay-3 p-3",
            theme.panelClassName
          )}
        >
          <div className={theme.metricLabelClassName}>Upcoming turns</div>
          <div className="mt-2 space-y-1">
            {routePreview.steps.slice(currentStepIndex, currentStepIndex + 5).map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "rounded-[0.875rem] border px-2.5 py-2 transition-all duration-200 backdrop-blur-2xl",
                  index === 0
                    ? tone === "light"
                      ? "border-sky-300/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.86))]"
                      : "border-cyan-400/30 bg-[linear-gradient(180deg,rgba(6,182,212,0.18),rgba(15,23,42,0.78))]"
                    : tone === "light"
                      ? "border-white/80 bg-white/72"
                      : "border-white/10 bg-slate-900/76"
                )}
              >
                <div className={cn("text-xs font-semibold leading-5", theme.titleClassName)}>
                  {step.instruction}
                </div>
                <div className={cn("text-[10px]", theme.secondaryTextClassName)}>
                  {(step.distanceMeters / 1609.34).toFixed(1)} mi •{" "}
                  {Math.max(1, Math.round(step.durationSeconds / 60))} min
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!isSearchFocus ? (
        <div
          className={cn("rounded-[1rem] border px-3 py-3 text-xs leading-5", theme.panelClassName)}
        >
          This planner uses submit-based OpenStreetMap address search, an OSRM route preview, device
          GPS speed when available, and nearby-road maxspeed tags.
        </div>
      ) : null}

      {showDiagnostics ? (
        <div
          className={cn(
            "map-liquid-card map-ui-enter map-ui-enter-delay-3 rounded-[1rem] border px-3 py-3",
            theme.panelClassName
          )}
        >
          <div
            className={cn("rounded-[0.85rem] border px-3 py-2 text-xs", diagnosticsToneClassName)}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-semibold uppercase tracking-[0.12em]">Diagnostics signal</span>
              <span className="inline-flex flex-wrap items-center gap-2 font-semibold capitalize">
                <span>{diagnosticsSignal.level}</span>
                <span className="rounded-full border border-current/35 px-2 py-0.5 text-[10px] uppercase tracking-[0.08em]">
                  {diagnosticsSignal.confidenceScore} confidence
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em]",
                    confidenceTrend.tone === "critical"
                      ? "border-rose-400/70 text-rose-100"
                      : confidenceTrend.tone === "warning"
                        ? "border-amber-300/70 text-amber-100"
                        : confidenceTrend.tone === "positive"
                          ? "border-emerald-300/70 text-emerald-100"
                          : "border-current/25 opacity-85"
                  )}
                >
                  {confidenceTrend.label}
                </span>
              </span>
            </div>
            <div className="mt-1 opacity-90">{diagnosticsSignal.detail}</div>
            {staleTelemetryProviderSummary ? (
              <div
                className={cn(
                  "mt-2 rounded-[0.75rem] border px-2.5 py-2 text-[11px] leading-5",
                  tone === "light"
                    ? "border-amber-300 bg-amber-50 text-amber-950"
                    : "border-amber-300/40 bg-amber-500/15 text-amber-100"
                )}
              >
                Provider telemetry for {providerLabel(staleTelemetryProviderSummary.provider)} is{" "}
                {formatAgeLabel(staleTelemetryProviderSummary.lastCheckedAgeMs)} old. Refresh live
                map activity or rerun diagnostics checks to restore current trust status.
              </div>
            ) : null}
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="opacity-80 sm:pr-2">
                Driver: {diagnosticsDriverLabel(diagnosticsSignal.primaryDriver)}
              </span>
              <button
                type="button"
                onClick={() => setShowDiagnosticsDetails((current) => !current)}
                className="w-full rounded-full border border-current/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition hover:bg-black/5 sm:w-auto"
              >
                {showDiagnosticsDetails ? "Hide details" : "Details"}
              </button>
            </div>
            {showDiagnosticsDetails ? (
              <div className="mt-2 space-y-2 border-t border-current/20 pt-2 opacity-90">
                {showDevDiagnosticsActions ? (
                  <div className="flex flex-col gap-2 pb-1 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={handleRunDiagnosticsChecks}
                      className="w-full rounded-full border border-current/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] transition hover:bg-black/5 sm:w-auto"
                    >
                      Run Checks
                    </button>
                    <span>
                      Last run:{" "}
                      {lastDiagnosticsRefreshAt
                        ? formatAgeLabel(Date.now() - Date.parse(lastDiagnosticsRefreshAt))
                        : "--"}
                    </span>
                  </div>
                ) : null}
                <div>
                  Map pressure: {mapPerformance.recentOverBudgetCount}/
                  {mapPerformance.recentSampleCount} recent over-budget samples
                </div>
                <div>
                  At-risk provider:{" "}
                  {diagnosticsSignal.providerAtRisk
                    ? providerLabel(diagnosticsSignal.providerAtRisk)
                    : "--"}
                </div>
                <div>
                  Latest provider issue:{" "}
                  {diagnosticsSignal.providerAtRiskLastError || "No recent provider errors"}
                </div>
                {discoveryQualitySnapshot ? (
                  <div>
                    Discovery quality: {discoveryQualitySnapshot.acceptedLimitedCount}/
                    {discoveryQualitySnapshot.acceptedCount} limited accepted,{" "}
                    {discoveryQualitySnapshot.rejectedBelowQualityThresholdCount} below-threshold
                    filtered
                  </div>
                ) : null}
                {discoveryQualitySnapshot ? (
                  <div>
                    Discovery limited rate: {discoveryQualitySnapshot.limitedAcceptanceRatePct}%
                  </div>
                ) : null}
                {discoveryQualitySnapshot ? (
                  <div>Discovery mix: {formatDiscoveryCategoryMix(discoveryQualitySnapshot)}</div>
                ) : null}
                {diagnosticsRefreshError ? (
                  <div className="text-rose-600 dark:text-rose-300">{diagnosticsRefreshError}</div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className={theme.metricLabelClassName}>Provider health snapshot</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {providerHealth.map((status) =>
              (() => {
                const isAtRiskProvider =
                  diagnosticsSignal.providerAtRisk === status.provider &&
                  (diagnosticsSignal.level === "watch" || diagnosticsSignal.level === "degraded");
                const providerReasonLabel = diagnosticsReasonLabel(
                  diagnosticsSignal.providerRiskReason
                );

                return (
                  <div
                    key={status.provider}
                    className={cn(
                      theme.listCardClassName,
                      "p-3",
                      isAtRiskProvider
                        ? tone === "light"
                          ? "ring-2 ring-amber-300"
                          : "ring-2 ring-amber-300/60"
                        : null
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div
                        className={cn(
                          "text-xs font-semibold uppercase tracking-[0.14em]",
                          theme.titleClassName
                        )}
                      >
                        {providerLabel(status.provider)}
                      </div>
                      {isAtRiskProvider && providerReasonLabel ? (
                        <span className="rounded-full border border-current/35 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]">
                          {providerReasonLabel}
                        </span>
                      ) : null}
                    </div>
                    <div
                      className={cn("mt-1 text-sm font-semibold leading-5", theme.titleClassName)}
                    >
                      {status.totalChecks > 0
                        ? `${status.successRate}% success • ${status.averageLatencyMs} ms avg`
                        : "No checks yet"}
                    </div>
                    <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                      Last check: {formatAgeLabel(status.lastCheckedAgeMs)}
                    </div>
                    <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                      {status.lastErrorMessage || "No recent provider errors"}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
