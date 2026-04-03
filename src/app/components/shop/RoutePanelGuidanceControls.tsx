import { Pause, Play, Square } from "lucide-react";

interface RoutePanelGuidanceControlsProps {
  navigationSessionStatus: string;
  isLight: boolean;
  onPauseNavigation?: () => void;
  onResumeNavigation?: () => void;
  onEndNavigation?: () => void;
}

export default function RoutePanelGuidanceControls({
  navigationSessionStatus,
  isLight,
  onPauseNavigation,
  onResumeNavigation,
  onEndNavigation,
}: RoutePanelGuidanceControlsProps) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {navigationSessionStatus === "paused" ? (
        onResumeNavigation ? (
          <button
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-[1rem] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
            onClick={onResumeNavigation}
            type="button"
          >
            <Play className="h-4 w-4" />
            Resume
          </button>
        ) : null
      ) : onPauseNavigation ? (
        <button
          className={`flex min-h-[44px] items-center justify-center gap-2 rounded-[1rem] border px-4 py-2.5 text-sm font-semibold transition-colors ${
            isLight
              ? "border-slate-300 text-slate-700 hover:bg-slate-100"
              : "border-white/20 text-white/80 hover:bg-white/10"
          }`}
          onClick={onPauseNavigation}
          type="button"
        >
          <Pause className="h-4 w-4" />
          Pause
        </button>
      ) : null}
      {onEndNavigation ? (
        <button
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-[1rem] bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 active:bg-red-800"
          onClick={onEndNavigation}
          type="button"
        >
          <Square className="h-4 w-4" />
          End
        </button>
      ) : null}
    </div>
  );
}
