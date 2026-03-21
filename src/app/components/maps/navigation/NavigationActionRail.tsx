import { List, LocateFixed, Volume2 } from "lucide-react";
import { cn } from "../../ui/utils";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";

type NavigationActionRailProps = {
  tone: MapSurfaceTone;
  turnListOpen: boolean;
  voiceControlsOpen: boolean;
  onToggleTurnList: () => void;
  onToggleVoiceControls: () => void;
  onRecenter: () => void;
};

function actionButtonClassName(tone: MapSurfaceTone, active: boolean) {
  if (active) {
    return tone === "light"
      ? "border-sky-300/85 bg-white/96 text-sky-700 shadow-[0_18px_34px_rgba(14,165,233,0.18)]"
      : "border-cyan-300/35 bg-slate-900/92 text-cyan-100 shadow-[0_18px_36px_rgba(2,6,23,0.36)]";
  }

  return tone === "light"
    ? "border-white/80 bg-white/90 text-slate-700 shadow-[0_18px_34px_rgba(15,23,42,0.16)]"
    : "border-white/12 bg-slate-950/88 text-slate-100 shadow-[0_18px_36px_rgba(2,6,23,0.38)]";
}

export default function NavigationActionRail({
  tone,
  turnListOpen,
  voiceControlsOpen,
  onToggleTurnList,
  onToggleVoiceControls,
  onRecenter,
}: NavigationActionRailProps) {
  const railShellClassName =
    tone === "light"
      ? "border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(241,245,249,0.72))]"
      : "border-white/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.78),rgba(30,41,59,0.64))]";

  return (
    <div className="pointer-events-none absolute inset-x-4 bottom-[calc(8.25rem+env(safe-area-inset-bottom))] z-[560] flex justify-center map-ui-enter md:inset-x-auto md:bottom-auto md:right-4 md:top-1/2 md:block md:-translate-y-1/2">
      <div
        className={cn(
          "map-liquid-rail pointer-events-auto relative flex flex-row gap-3 overflow-hidden rounded-[2rem] border p-2.5 backdrop-blur-2xl md:flex-col",
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
            "inline-flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.94] md:h-14 md:w-14",
            actionButtonClassName(tone, turnListOpen)
          )}
          aria-pressed={turnListOpen}
        >
          <List className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={onToggleVoiceControls}
          className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.94] md:h-14 md:w-14",
            actionButtonClassName(tone, voiceControlsOpen)
          )}
          aria-pressed={voiceControlsOpen}
        >
          <Volume2 className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={onRecenter}
          className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.94] md:h-14 md:w-14",
            actionButtonClassName(tone, false)
          )}
        >
          <LocateFixed className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
