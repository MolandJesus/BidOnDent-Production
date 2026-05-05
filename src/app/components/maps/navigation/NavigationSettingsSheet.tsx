import { Gauge, LocateFixed, RefreshCw, Settings2, X } from "lucide-react";
import { cn } from "../../ui/utils";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";

type NavigationSettingsSheetProps = {
  tone: MapSurfaceTone;
  open: boolean;
  gpsTrackingEnabled: boolean;
  speedLimitMonitorEnabled: boolean;
  autoRerouteEnabled: boolean;
  onToggleGpsTracking: () => void;
  onToggleSpeedLimitMonitor: () => void;
  onToggleAutoReroute: () => void;
  onClose: () => void;
};

function ToggleRow({
  tone,
  icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  tone: MapSurfaceTone;
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-[1.25rem] px-4 py-3.5 text-left transition active:scale-[0.98]",
        enabled
          ? tone === "light"
            ? "bg-blue-50 text-slate-950"
            : "bg-cyan-400/12 text-white"
          : tone === "light"
            ? "bg-[linear-gradient(180deg,rgba(247,232,194,0.52),rgba(232,238,248,0.50))] text-slate-500 hover:bg-[linear-gradient(180deg,rgba(247,232,194,0.78),rgba(232,238,248,0.74))]"
            : "bg-white/4 text-slate-400 hover:bg-white/8"
      )}
    >
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition",
          enabled
            ? tone === "light"
              ? "bg-blue-100 text-blue-600"
              : "bg-cyan-400/16 text-cyan-300"
            : tone === "light"
              ? "bg-slate-100 text-slate-400"
              : "bg-white/6 text-slate-500"
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{label}</div>
        <div
          className={cn("mt-0.5 text-xs", tone === "light" ? "text-slate-500" : "text-slate-400")}
        >
          {description}
        </div>
      </div>
      <div
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          enabled
            ? tone === "light"
              ? "bg-blue-500"
              : "bg-cyan-400"
            : tone === "light"
              ? "bg-slate-300"
              : "bg-white/16"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[left]",
            enabled ? "left-[calc(100%-1.625rem)]" : "left-0.5"
          )}
        />
      </div>
    </button>
  );
}

export default function NavigationSettingsSheet({
  tone,
  open,
  gpsTrackingEnabled,
  speedLimitMonitorEnabled,
  autoRerouteEnabled,
  onToggleGpsTracking,
  onToggleSpeedLimitMonitor,
  onToggleAutoReroute,
  onClose,
}: NavigationSettingsSheetProps) {
  const theme = getMapSurfaceTheme(tone, true);

  if (!open) return null;

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
          <div className="flex items-center gap-2.5">
            <Settings2
              className={cn("h-5 w-5", tone === "light" ? "text-blue-500" : "text-cyan-300")}
            />
            <div
              className={cn(
                "text-[2rem] font-semibold tracking-[-0.03em] sm:text-3xl sm:tracking-[-0.04em]",
                theme.titleClassName
              )}
            >
              Settings
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation settings"
            className={theme.iconButtonClassName}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={cn("map-liquid-card mt-5 space-y-2 p-3", theme.panelClassName)}>
          <ToggleRow
            tone={tone}
            icon={<LocateFixed className="h-4.5 w-4.5" />}
            label="GPS Tracking"
            description="Track position and heading during navigation"
            enabled={gpsTrackingEnabled}
            onToggle={onToggleGpsTracking}
          />
          <ToggleRow
            tone={tone}
            icon={<Gauge className="h-4.5 w-4.5" />}
            label="Speed Limit Warnings"
            description="Visual and voice alerts when over the limit"
            enabled={speedLimitMonitorEnabled}
            onToggle={onToggleSpeedLimitMonitor}
          />
          <ToggleRow
            tone={tone}
            icon={<RefreshCw className="h-4.5 w-4.5" />}
            label="Auto-Reroute"
            description="Automatically find a new route when far off course"
            enabled={autoRerouteEnabled}
            onToggle={onToggleAutoReroute}
          />
        </div>
      </div>
    </div>
  );
}
