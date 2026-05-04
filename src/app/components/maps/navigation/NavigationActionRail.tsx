import { List, LocateFixed, Settings2, Volume2 } from "lucide-react";
import { cn } from "../../ui/utils";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";

type NavigationActionRailProps = {
  tone: MapSurfaceTone;
  turnListOpen: boolean;
  voiceControlsOpen: boolean;
  settingsOpen: boolean;
  showVoiceControl?: boolean;
  className?: string;
  onToggleTurnList: () => void;
  onToggleVoiceControls: () => void;
  onToggleSettings: () => void;
  onRecenter: () => void;
};

function actionButtonClassName(tone: MapSurfaceTone, active: boolean) {
  if (active) {
    return tone === "light"
      ? "map-nav-icon-ring-pulse border-sky-300/85 bg-[linear-gradient(180deg,rgba(247,232,194,0.92),rgba(224,242,254,0.92))] text-sky-700 shadow-[0_18px_34px_rgba(14,165,233,0.18),inset_0_1px_0_rgba(252,240,208,0.85),0_0_0_1px_rgba(196,144,65,0.18)]"
      : "map-nav-icon-ring-pulse border-cyan-300/35 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,47,73,0.92))] text-cyan-100 shadow-[0_18px_36px_rgba(2,6,23,0.36)]";
  }

  return tone === "light"
    ? "border-[rgba(140,82,22,0.30)] bg-[linear-gradient(180deg,rgba(247,232,194,0.86),rgba(232,238,248,0.82))] text-slate-700 shadow-[0_18px_34px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(252,240,208,0.78)]"
    : "border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.84))] text-slate-100 shadow-[0_18px_36px_rgba(2,6,23,0.38)]";
}

export default function NavigationActionRail({
  tone,
  turnListOpen,
  voiceControlsOpen,
  settingsOpen,
  showVoiceControl = true,
  className,
  onToggleTurnList,
  onToggleVoiceControls,
  onToggleSettings,
  onRecenter,
}: NavigationActionRailProps) {
  const railShellClassName =
    tone === "light"
      ? "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.78),rgba(232,238,248,0.72))]"
      : "border-white/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(30,41,59,0.68))]";

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-[calc(max(env(safe-area-inset-bottom),0.75rem)_+_8rem)] left-1/2 z-[560] -translate-x-1/2 map-ui-enter sm:left-auto sm:right-4 sm:top-1/2 sm:bottom-auto sm:translate-x-0 sm:-translate-y-1/2",
        className
      )}
    >
      <div
        className={cn(
          "map-liquid-rail pointer-events-auto relative flex flex-row gap-2 overflow-hidden rounded-[1.45rem] border p-1.5 backdrop-blur-2xl sm:flex-col sm:gap-2.5 sm:rounded-[1.75rem] sm:p-2",
          railShellClassName
        )}
      >
        <div
          className={cn(
            "map-liquid-sheen pointer-events-none absolute inset-0",
            tone === "light" ? "opacity-60" : "opacity-40"
          )}
        />
        <button
          type="button"
          onClick={onToggleTurnList}
          className={cn(
            "relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border transition-all duration-200 active:scale-[0.94] sm:h-11 sm:w-11",
            actionButtonClassName(tone, turnListOpen)
          )}
          aria-pressed={turnListOpen}
          aria-label="Toggle turn-by-turn list"
        >
          <List className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </button>
        {showVoiceControl ? (
          <button
            type="button"
            onClick={onToggleVoiceControls}
            className={cn(
              "relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border transition-all duration-200 active:scale-[0.94] sm:h-11 sm:w-11",
              actionButtonClassName(tone, voiceControlsOpen)
            )}
            aria-pressed={voiceControlsOpen}
            aria-label="Toggle voice guidance"
          >
            <Volume2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onToggleSettings}
          className={cn(
            "relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border transition-all duration-200 active:scale-[0.94] sm:h-11 sm:w-11",
            actionButtonClassName(tone, settingsOpen)
          )}
          aria-pressed={settingsOpen}
          aria-label="Navigation settings"
        >
          <Settings2 className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </button>
        <button
          type="button"
          onClick={onRecenter}
          className={cn(
            "relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-[1rem] border transition-all duration-200 active:scale-[0.94] sm:h-11 sm:w-11",
            actionButtonClassName(tone, false)
          )}
          aria-label="Re-center map"
        >
          <LocateFixed className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
}
