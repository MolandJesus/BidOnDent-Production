/**
 * PlannerVoiceGpsSettings — Voice mode/volume controls, GPS toggle, speed-limit alerts.
 *
 * Pure presentation component extracted from CoverageNavigationPlanner (Pass 27).
 * All state and orchestration remain in the parent shell.
 */

import {
  LocateFixed,
  Mic2,
  Navigation,
  RefreshCw,
  ShieldAlert,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "../../ui/utils";
import type { MapSurfaceTheme, MapSurfaceTone } from "../serviceCoverageMapTypes";
import type {
  NavigationGuidanceSettings,
  NavigationVoiceMode,
  NavigationVoiceVolumePreset,
} from "../../../types/navigation";
import type { GpsStatus, SpeedLimitStatus } from "../../../hooks/useCoverageNavigationExperience";

function voiceModeDisplayLabel(voiceMode: NavigationVoiceMode) {
  if (voiceMode === "alerts-only") {
    return "Important only";
  }

  if (voiceMode === "muted") {
    return "Muted";
  }

  return "Full voice";
}

type PlannerVoiceGpsSettingsProps = {
  tone: MapSurfaceTone;
  theme: MapSurfaceTheme;
  showAdvancedControls: boolean;
  settings: NavigationGuidanceSettings;
  onVoiceModeChange: (voiceMode: NavigationVoiceMode) => void;
  onVoiceVolumePresetChange: (voiceVolumePreset: NavigationVoiceVolumePreset) => void;
  onGpsTrackingEnabledChange: (enabled: boolean) => void;
  onSpeedLimitMonitorEnabledChange: (enabled: boolean) => void;
  preferredVoiceLabel: string | null;
  voiceGuidanceSupported: boolean;
  voiceStatusLabel: string;
  gpsAccuracyMeters: number | null;
  gpsError: string;
  gpsStatus: GpsStatus;
  retryGps: () => void;
  speedLimitStatus: SpeedLimitStatus;
};

export default function PlannerVoiceGpsSettings({
  tone,
  theme,
  showAdvancedControls,
  settings,
  onVoiceModeChange,
  onVoiceVolumePresetChange,
  onGpsTrackingEnabledChange,
  onSpeedLimitMonitorEnabledChange,
  preferredVoiceLabel,
  voiceGuidanceSupported,
  voiceStatusLabel,
  gpsAccuracyMeters,
  gpsError,
  gpsStatus,
  retryGps,
  speedLimitStatus,
}: PlannerVoiceGpsSettingsProps) {
  if (!showAdvancedControls) {
    return null;
  }

  return (
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
            ? voiceStatusLabel !== "Voice ready"
              ? voiceStatusLabel
              : `Voice: ${preferredVoiceLabel || "System default"}`
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
              gpsStatus === "denied"
                ? tone === "light"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-rose-500/20 text-rose-300"
                : gpsStatus === "lost"
                  ? tone === "light"
                    ? "bg-rose-100 text-rose-800"
                    : "bg-rose-500/20 text-rose-300"
                  : tone === "light"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-amber-500/20 text-amber-300"
            )}
          >
            <LocateFixed className="h-3 w-3 shrink-0" />
            <span className="flex-1">
              {gpsStatus === "denied"
                ? "Location permission denied"
                : gpsStatus === "lost"
                  ? "GPS signal lost — position may be outdated"
                  : "GPS signal stale — no update in 10 s"}
            </span>
            {(gpsStatus === "denied" || gpsStatus === "lost") && (
              <button
                type="button"
                onClick={retryGps}
                className={cn(
                  "ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors",
                  tone === "light"
                    ? "bg-black/8 hover:bg-black/12"
                    : "bg-white/10 hover:bg-white/20"
                )}
              >
                <RefreshCw className="h-2.5 w-2.5" />
                Retry
              </button>
            )}
          </div>
        )}
        {settings.speedLimitMonitorEnabled && speedLimitStatus === "unavailable" && (
          <div
            className={cn(
              "mt-1.5 flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium leading-4",
              tone === "light" ? "bg-slate-200 text-slate-600" : "bg-slate-500/20 text-slate-300"
            )}
          >
            <ShieldAlert className="h-3 w-3 shrink-0" />
            Speed limit unavailable
          </div>
        )}
      </div>
    </div>
  );
}
