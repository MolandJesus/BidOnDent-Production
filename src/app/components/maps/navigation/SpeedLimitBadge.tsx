import { cn } from "../../ui/utils";
import type { NavigationSpeedLimitConfidence } from "../../../types/navigation";

type SpeedLimitBadgeProps = {
  postedSpeedLimitMph?: number | null;
  confidence?: NavigationSpeedLimitConfidence | null;
};

function confidenceLabel(confidence: NavigationSpeedLimitConfidence | null | undefined) {
  if (confidence === "high") {
    return "High confidence";
  }

  if (confidence === "medium") {
    return "Moderate confidence";
  }

  return "Low confidence";
}

function confidenceClasses(confidence: NavigationSpeedLimitConfidence | null | undefined) {
  if (confidence === "high") {
    return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
  }

  if (confidence === "medium") {
    return "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
  }

  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export default function SpeedLimitBadge({ postedSpeedLimitMph, confidence }: SpeedLimitBadgeProps) {
  const hasPostedLimit = Number.isFinite(postedSpeedLimitMph);

  return (
    <div className="relative grid h-[76px] w-[76px] place-items-center rounded-full border-[6px] border-rose-500 bg-white text-slate-950 shadow-[0_22px_52px_rgba(15,23,42,0.18)] sm:h-[104px] sm:w-[104px] sm:border-[8px]">
      <div className="text-center leading-none">
        <div className="text-[8px] font-bold uppercase tracking-[0.22em] sm:text-[9px]">Speed</div>
        <div className="mt-0.5 text-[1.5rem] font-black leading-none sm:mt-1 sm:text-4xl">
          {hasPostedLimit ? Math.round(Number(postedSpeedLimitMph)) : "--"}
        </div>
        <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.22em] sm:mt-1 sm:text-[9px]">
          Limit
        </div>
      </div>

      {hasPostedLimit ? (
        <div
          className={cn(
            "absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em]",
            confidenceClasses(confidence)
          )}
        >
          {confidenceLabel(confidence)}
        </div>
      ) : null}
    </div>
  );
}
