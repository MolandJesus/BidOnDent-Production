import { FormEvent } from "react";
import { LocateFixed, Mic2, Navigation, RefreshCcw, Search, ShieldAlert, Volume2, VolumeX } from "lucide-react";
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
  onStartNavigation: () => void;
  preferredVoiceLabel: string | null;
  voiceGuidanceSupported: boolean;
  routePreview: NavigationRoutePreview | null;
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
  onStartNavigation,
  preferredVoiceLabel,
  voiceGuidanceSupported,
  routePreview,
  isLoadingRoute,
  routeError,
  currentStepIndex,
  gpsAccuracyMeters,
  gpsError,
}: CoverageNavigationPlannerProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const routeDistanceMiles = routePreview ? routePreview.distanceMeters / 1609.34 : null;
  const routeDurationMinutes = routePreview ? routePreview.durationSeconds / 60 : null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearchAddresses();
  };

  return (
    <div className={cn("space-y-4 rounded-[1.75rem] p-4", theme.panelStrongClassName)}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={theme.eyebrowClassName}>Route Planner</span>
          <span className={theme.softBadgeClassName}>
            Browser GPS + routing preview + voice shell
          </span>
        </div>
        <p className={cn("mt-3 text-sm leading-6", theme.bodyClassName)}>
          Search a store or house address, keep live GPS on-device, and drive a turn-by-turn
          preview that prefers a British English voice when your device makes one available.
        </p>
      </div>

      <div className={cn("p-4", theme.panelClassName)}>
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

      <form onSubmit={handleSubmit} className={cn("space-y-3 p-4", theme.panelClassName)}>
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
          <div className={cn("flex items-center justify-between gap-3 rounded-[1rem] px-3 py-2", theme.accentPanelClassName)}>
            <div>
              <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                Manual origin selected
              </div>
              <div className={cn("text-xs", theme.secondaryTextClassName)}>
                {selectedAddressResult.secondaryLabel || selectedAddressResult.label}
              </div>
            </div>
            <button type="button" onClick={onClearAddressResult} className={theme.secondaryButtonClassName}>
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
        <div className={cn("p-4", theme.panelClassName)}>
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

        <div className={cn("p-4", theme.panelClassName)}>
          <div className="flex items-center gap-2">
            <LocateFixed className="h-4 w-4" />
            <span className={theme.metricLabelClassName}>GPS and speed</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onGpsTrackingEnabledChange(!settings.gpsTrackingEnabled)}
              className={settings.gpsTrackingEnabled ? theme.primaryButtonClassName : theme.secondaryButtonClassName}
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

      <div className={cn("p-4", theme.accentPanelClassName)}>
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
          <button type="button" onClick={onResetNavigationSettings} className={theme.secondaryButtonClassName}>
            <RefreshCcw className="h-4 w-4" />
            Reset settings
          </button>
        </div>

        {isLoadingRoute ? (
          <div className={cn("mt-3 text-sm", theme.bodyClassName)}>Building route preview...</div>
        ) : routeError ? (
          <div
            className={cn(
              "mt-3 rounded-[1rem] border px-3 py-2 text-sm",
              tone === "light"
                ? "border-rose-200 bg-rose-50 text-rose-900"
                : "border-rose-300/20 bg-rose-500/10 text-rose-200"
            )}
          >
            {routeError}
          </div>
        ) : routePreview ? (
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
        <div className={cn("p-4", theme.panelClassName)}>
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
                  {(step.distanceMeters / 1609.34).toFixed(1)} mi • {Math.max(1, Math.round(step.durationSeconds / 60))} min
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className={cn("rounded-[1rem] border px-3 py-3 text-xs leading-5", theme.panelClassName)}>
        This planner uses submit-based OpenStreetMap address search, an OSRM route preview, device
        GPS speed when available, and nearby-road maxspeed tags. It is much stronger than a mock
        UI, but it is still not the same thing as a native automotive navigation SDK.
      </div>
    </div>
  );
}
