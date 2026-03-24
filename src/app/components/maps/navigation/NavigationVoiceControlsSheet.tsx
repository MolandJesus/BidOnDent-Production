import { useEffect } from "react";
import { Check, X } from "lucide-react";
import { cn } from "../../ui/utils";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";
import type { NavigationVoiceMode, NavigationVoiceVolumePreset } from "../../../types/navigation";

type NavigationVoiceControlsSheetProps = {
  tone: MapSurfaceTone;
  open: boolean;
  voiceMode: NavigationVoiceMode;
  voiceVolumePreset: NavigationVoiceVolumePreset;
  preferredVoiceLabel: string | null;
  voiceGuidanceSupported: boolean;
  onVoiceModeChange: (voiceMode: NavigationVoiceMode) => void;
  onVoiceVolumePresetChange: (voiceVolumePreset: NavigationVoiceVolumePreset) => void;
  onClose: () => void;
};

const voiceModes: Array<{ id: NavigationVoiceMode; label: string }> = [
  { id: "muted", label: "Muted" },
  { id: "alerts-only", label: "Alerts only" },
  { id: "full", label: "Unmuted" },
];

const volumePresets: Array<{ id: NavigationVoiceVolumePreset; label: string }> = [
  { id: "louder", label: "Louder" },
  { id: "normal", label: "Normal" },
  { id: "softer", label: "Softer" },
];

export default function NavigationVoiceControlsSheet({
  tone,
  open,
  voiceMode,
  voiceVolumePreset,
  preferredVoiceLabel,
  voiceGuidanceSupported,
  onVoiceModeChange,
  onVoiceVolumePresetChange,
  onClose,
}: NavigationVoiceControlsSheetProps) {
  const theme = getMapSurfaceTheme(tone, true);

  if (!open) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-x-3 bottom-[13rem] z-[565] flex justify-center sm:inset-x-4 sm:bottom-6 sm:justify-end">
      <div
        className={cn(
          "map-liquid-panel map-ui-enter pointer-events-auto relative w-full max-w-[440px] overflow-hidden p-4 sm:p-5",
          theme.panelStrongClassName
        )}
      >
        <div className="map-liquid-sheen pointer-events-none absolute inset-0 opacity-70" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className={cn(
                "text-[2rem] font-semibold tracking-[-0.03em] sm:text-3xl sm:tracking-[-0.04em]",
                theme.titleClassName
              )}
            >
              Voice Controls
            </div>
            <div className={cn("mt-2 text-sm", theme.secondaryTextClassName)}>
              {voiceGuidanceSupported
                ? `Preferred voice: ${preferredVoiceLabel || "System default"}`
                : "Speech synthesis is not available in this browser."}
            </div>
          </div>
          <button type="button" onClick={onClose} className={theme.iconButtonClassName}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={cn("map-liquid-card mt-5 p-2", theme.panelClassName)}>
          <div className="grid grid-cols-3 gap-2">
            {voiceModes.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onVoiceModeChange(option.id)}
                className={
                  voiceMode === option.id
                    ? theme.primaryButtonClassName
                    : theme.secondaryButtonClassName
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className={cn("text-sm font-semibold", theme.titleClassName)}>Volume</div>
          <div className={cn("map-liquid-card mt-3 space-y-2 p-3", theme.panelClassName)}>
            {volumePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onVoiceVolumePresetChange(preset.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-[1.25rem] px-4 py-4 text-left transition",
                  voiceVolumePreset === preset.id
                    ? tone === "light"
                      ? "bg-blue-50 text-slate-950"
                      : "bg-cyan-400/12 text-white"
                    : tone === "light"
                      ? "bg-white/60 text-slate-800 hover:bg-white/90"
                      : "bg-white/4 text-slate-100 hover:bg-white/8"
                )}
              >
                <span className="text-xl font-semibold tracking-[-0.03em]">{preset.label}</span>
                {voiceVolumePreset === preset.id ? <Check className="h-5 w-5" /> : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
