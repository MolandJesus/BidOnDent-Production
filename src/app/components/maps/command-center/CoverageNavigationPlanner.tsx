import { FormEvent, useEffect, useRef, useState } from "react";
import {
  LocateFixed,
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
  NavigationGuidanceSettings,
  NavigationRoutePreview,
  NavigationVoiceMode,
  NavigationVoiceVolumePreset,
} from "../../../types/navigation";
import type { CoveragePartnerShop } from "../serviceCoverageMapTypes";
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
  selectedShop: CoveragePartnerShop | null;
  activeOriginLabel: string;
  addressQuery: string;
  onAddressQueryChange: (value: string) => void;
  onSearchAddresses: () => void;
  addressResults: NavigationAddressResult[];
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
  selectedShop,
  activeOriginLabel,
  addressQuery,
  onAddressQueryChange,
  onSearchAddresses,
  addressResults,
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
        "map-liquid-panel map-ui-enter space-y-4 rounded-[1.75rem] p-4",
        theme.panelStrongClassName
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={theme.eyebrowClassName}>Route Planner</span>
          <span className={theme.softBadgeClassName}>
            Browser GPS + routing preview + voice shell
          </span>
        </div>
        <p className={cn("mt-3 text-sm leading-6", theme.bodyClassName)}>
          Search a store or house address, keep live GPS on-device, and drive a turn-by-turn preview
          that prefers a British English voice when your device makes one available.
        </p>
      </div>

      <div
        className={cn(
          "map-liquid-card map-ui-enter map-ui-enter-delay-1 p-4",
          theme.panelClassName
        )}
      >
        <div className={theme.metricLabelClassName}>Active origin</div>
        <div className={cn("mt-2 text-base font-semibold", theme.titleClassName)}>
          {selectedAddressResult?.primaryLabel || activeOriginLabel}
        </div>
        <div className={cn("mt-1 text-sm", theme.secondaryTextClassName)}>
          {settings.gpsTrackingEnabled
            ? "GPS will lead when a live fix is available."
            : "Manual address or map focus is currently driving the route origin."}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className={cn(
          "map-liquid-card map-ui-enter map-ui-enter-delay-1 space-y-3 p-4",
          theme.panelClassName
        )}
      >
        <div>
          <label className={cn("mb-2 block text-sm font-semibold", theme.titleClassName)}>
            Search house or store address
          </label>
          <div className="flex gap-2">
            <input
              value={addressQuery}
              onChange={(event) => onAddressQueryChange(event.target.value)}
              placeholder="Example: 42 Broadway, New York"
              className={cn(
                "h-11 flex-1 rounded-[1rem] border px-4 outline-none transition",
                tone === "light"
                  ? "border-white/80 bg-white/80 text-slate-900 placeholder:text-slate-400 focus:border-sky-300"
                  : "border-white/12 bg-slate-900/78 text-white placeholder:text-slate-400 focus:border-cyan-400/40"
              )}
            />
            <button
              type="submit"
              disabled={isSearchingAddresses}
              className={cn(theme.primaryButtonClassName, "px-4 disabled:opacity-60")}
            >
              <Search className="h-4 w-4" />
              {isSearchingAddresses ? "Searching..." : "Search"}
            </button>
          </div>
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
              className={theme.secondaryButtonClassName}
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
          <div className="space-y-2">
            {addressResults.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => onChooseAddressResult(result)}
                className={cn("w-full text-left", theme.listCardClassName)}
              >
                <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                  {result.primaryLabel}
                </div>
                <div className={cn("mt-1 text-xs leading-5", theme.secondaryTextClassName)}>
                  {result.secondaryLabel || result.label}
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className={cn(
            "map-liquid-card map-ui-enter map-ui-enter-delay-2 p-4",
            theme.panelClassName
          )}
        >
          <div className="flex items-center gap-2">
            <Mic2 className="h-4 w-4" />
            <span className={theme.metricLabelClassName}>Voice guidance</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["full", "alerts-only", "muted"] as NavigationVoiceMode[]).map((voiceMode) => (
              <button
                key={voiceMode}
                type="button"
                onClick={() => onVoiceModeChange(voiceMode)}
                className={
                  settings.voiceMode === voiceMode
                    ? theme.primaryButtonClassName
                    : theme.secondaryButtonClassName
                }
              >
                {voiceMode === "muted" ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                {voiceModeDisplayLabel(voiceMode)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["louder", "normal", "softer"] as NavigationVoiceVolumePreset[]).map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onVoiceVolumePresetChange(preset)}
                className={
                  settings.voiceVolumePreset === preset
                    ? theme.primaryButtonClassName
                    : theme.secondaryButtonClassName
                }
              >
                <Mic2 className="h-4 w-4" />
                {preset === "louder" ? "Louder" : preset === "softer" ? "Softer" : "Normal"}
              </button>
            ))}
          </div>
          <div className={cn("mt-3 text-xs leading-5", theme.secondaryTextClassName)}>
            {voiceGuidanceSupported
              ? `Preferred voice: ${preferredVoiceLabel || "System default"}`
              : "Voice synthesis is not available in this browser."}
          </div>
        </div>

        <div
          className={cn(
            "map-liquid-card map-ui-enter map-ui-enter-delay-2 p-4",
            theme.panelClassName
          )}
        >
          <div className="flex items-center gap-2">
            <LocateFixed className="h-4 w-4" />
            <span className={theme.metricLabelClassName}>GPS and speed</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onGpsTrackingEnabledChange(!settings.gpsTrackingEnabled)}
              className={
                settings.gpsTrackingEnabled
                  ? theme.primaryButtonClassName
                  : theme.secondaryButtonClassName
              }
            >
              <Navigation className="h-4 w-4" />
              {settings.gpsTrackingEnabled ? "GPS on" : "GPS off"}
            </button>
            <button
              type="button"
              onClick={() => onSpeedLimitMonitorEnabledChange(!settings.speedLimitMonitorEnabled)}
              className={
                settings.speedLimitMonitorEnabled
                  ? theme.primaryButtonClassName
                  : theme.secondaryButtonClassName
              }
            >
              <ShieldAlert className="h-4 w-4" />
              {settings.speedLimitMonitorEnabled ? "Speed alerts on" : "Speed alerts off"}
            </button>
          </div>
          <div className={cn("mt-3 text-xs leading-5", theme.secondaryTextClassName)}>
            {gpsError
              ? gpsError
              : gpsAccuracyMeters
                ? `Current accuracy is about ±${Math.round(gpsAccuracyMeters)} meters.`
                : "Waiting for a live GPS fix from the device."}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "map-liquid-panel map-ui-enter map-ui-enter-delay-3 p-4",
          theme.accentPanelClassName
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className={theme.metricLabelClassName}>Route preview</div>
            <div className={cn("mt-1 text-lg font-semibold", theme.titleClassName)}>
              {selectedShop ? selectedShop.name : "Select a partner shop"}
            </div>
            <div className={cn("mt-2 text-sm", theme.secondaryTextClassName)}>
              Speed-limit and current-speed badges appear only after the route is actively running.
            </div>
          </div>
          <button
            type="button"
            onClick={onResetNavigationSettings}
            className={theme.secondaryButtonClassName}
          >
            <RefreshCcw className="h-4 w-4" />
            Reset settings
          </button>
        </div>

        {isLoadingRoute ? (
          <div className="mt-3 space-y-3">
            <div className={cn("text-sm", theme.bodyClassName)}>Building route preview...</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className={cn("rounded-[1rem] px-3 py-3", theme.panelClassName)}>
                <div className="h-3 w-20 animate-pulse rounded bg-slate-300/40" />
                <div className="mt-2 h-6 w-16 animate-pulse rounded bg-slate-300/40" />
              </div>
              <div className={cn("rounded-[1rem] px-3 py-3", theme.panelClassName)}>
                <div className="h-3 w-24 animate-pulse rounded bg-slate-300/40" />
                <div className="mt-2 h-6 w-20 animate-pulse rounded bg-slate-300/40" />
              </div>
              <div className={cn("rounded-[1rem] px-3 py-3", theme.panelClassName)}>
                <div className="h-3 w-16 animate-pulse rounded bg-slate-300/40" />
                <div className="mt-2 h-6 w-14 animate-pulse rounded bg-slate-300/40" />
              </div>
            </div>
          </div>
        ) : routeError ? (
          <div
            className={cn(
              "mt-3 rounded-[1rem] border px-3 py-3",
              tone === "light"
                ? "border-rose-200 bg-rose-50 text-rose-900"
                : "border-rose-300/20 bg-rose-500/10 text-rose-200"
            )}
          >
            <div className="text-sm">{routeError}</div>
            <button
              type="button"
              onClick={onRetryRoutePreview}
              className={cn("mt-2", theme.secondaryButtonClassName)}
            >
              <RefreshCcw className="h-4 w-4" />
              Retry route preview
            </button>
          </div>
        ) : routePreview ? (
          <>
            {routeAlternatives.length > 1 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
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
                      className={
                        isSelected ? theme.selectedListCardClassName : theme.listCardClassName
                      }
                    >
                      <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                        {index === 0 ? "Fastest route" : `Alternate ${index}`}
                      </div>
                      <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                        {formatDistanceMiles(distanceMiles)} • {durationMinutes} min
                      </div>
                      {index > 0 ? (
                        <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                          {formatRouteAlternativeDeltaLabel(comparedToFastestSeconds)}
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className={cn("rounded-[1rem] px-3 py-3", theme.panelClassName)}>
                <div className={theme.metricLabelClassName}>Distance</div>
                <div className={cn("mt-1 text-lg font-semibold", theme.titleClassName)}>
                  {formatDistanceMiles(routeDistanceMiles)}
                </div>
              </div>
              <div className={cn("rounded-[1rem] px-3 py-3", theme.panelClassName)}>
                <div className={theme.metricLabelClassName}>Drive window</div>
                <div className={cn("mt-1 text-lg font-semibold", theme.titleClassName)}>
                  {formatApproximateDriveWindow(routeDistanceMiles) ||
                    (routeDurationMinutes ? `${Math.round(routeDurationMinutes)} min` : "--")}
                </div>
              </div>
              <div className={cn("rounded-[1rem] px-3 py-3", theme.panelClassName)}>
                <div className={theme.metricLabelClassName}>Turn steps</div>
                <div className={cn("mt-1 text-lg font-semibold", theme.titleClassName)}>
                  {routePreview.steps.length}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className={cn("mt-3 text-sm", theme.secondaryTextClassName)}>
            Pick a shop and provide either GPS or a searched address to build a route.
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onStartNavigation}
            disabled={!routePreview || !selectedShop || isLoadingRoute}
            className={cn(theme.primaryButtonClassName, "disabled:opacity-50")}
          >
            <Navigation className="h-4 w-4" />
            Start Route
          </button>
        </div>
      </div>

      {routePreview?.steps.length ? (
        <div
          className={cn(
            "map-liquid-card map-ui-enter map-ui-enter-delay-3 p-4",
            theme.panelClassName
          )}
        >
          <div className={theme.metricLabelClassName}>Upcoming turns</div>
          <div className="mt-3 space-y-2">
            {routePreview.steps.slice(currentStepIndex, currentStepIndex + 5).map((step, index) => (
              <div
                key={step.id}
                className={index === 0 ? theme.selectedListCardClassName : theme.listCardClassName}
              >
                <div className={cn("text-sm font-semibold leading-6", theme.titleClassName)}>
                  {step.instruction}
                </div>
                <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                  {(step.distanceMeters / 1609.34).toFixed(1)} mi •{" "}
                  {Math.max(1, Math.round(step.durationSeconds / 60))} min
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className={cn("rounded-[1rem] border px-3 py-3 text-xs leading-5", theme.panelClassName)}
      >
        This planner uses submit-based OpenStreetMap address search, an OSRM route preview, device
        GPS speed when available, and nearby-road maxspeed tags. It is much stronger than a mock UI,
        but it is still not the same thing as a native automotive navigation SDK.
      </div>

      <div
        className={cn(
          "map-liquid-card map-ui-enter map-ui-enter-delay-3 rounded-[1rem] border px-3 py-3",
          theme.panelClassName
        )}
      >
        <div className={cn("rounded-[0.85rem] border px-3 py-2 text-xs", diagnosticsToneClassName)}>
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
              {formatAgeLabel(staleTelemetryProviderSummary.lastCheckedAgeMs)} old. Refresh live map
              activity or rerun diagnostics checks to restore current trust status.
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
                  <div className={cn("mt-1 text-sm font-semibold leading-5", theme.titleClassName)}>
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
    </div>
  );
}
