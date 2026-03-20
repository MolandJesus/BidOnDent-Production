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
  return (
    <div className="pointer-events-none absolute right-4 top-1/2 z-[560] -translate-y-1/2">
      <div className="pointer-events-auto flex flex-col gap-3 rounded-[1.8rem] border border-white/10 bg-black/5 p-2 backdrop-blur-xl">
        <button
          type="button"
          onClick={onToggleTurnList}
          className={cn(
            "inline-flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5",
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
            "inline-flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5",
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
            "inline-flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-200 hover:-translate-y-0.5",
            actionButtonClassName(tone, false)
          )}
        >
          <LocateFixed className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
