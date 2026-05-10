import { ArrowRight, ArrowUp, CornerDownLeft, CornerDownRight, RotateCcw } from "lucide-react";
import { cn } from "@/platform-core/cn";
import { formatTurnDistance } from "../mapRoutePresentation";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";
import type { NavigationRouteStep } from "../../../types/navigation";

type NavigationActiveManeuverCardProps = {
  tone: MapSurfaceTone;
  nextStep: NavigationRouteStep | null;
  followingStep: NavigationRouteStep | null;
  /** Live GPS distance to the next step in meters (overrides step.distanceMeters). */
  liveDistanceMeters?: number | null;
  containerClassName?: string;
};

function getManeuverIcon(step: NavigationRouteStep | null) {
  const modifier = step?.maneuverModifier?.toLowerCase() || "";
  const maneuverType = step?.maneuverType?.toLowerCase() || "";

  if (modifier.includes("left")) {
    return CornerDownLeft;
  }

  if (modifier.includes("right")) {
    return CornerDownRight;
  }

  if (modifier.includes("uturn") || maneuverType.includes("uturn")) {
    return RotateCcw;
  }

  if (maneuverType === "arrive") {
    return ArrowRight;
  }

  return ArrowUp;
}

export default function NavigationActiveManeuverCard({
  tone,
  nextStep,
  followingStep,
  liveDistanceMeters,
  containerClassName,
}: NavigationActiveManeuverCardProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const ManeuverIcon = getManeuverIcon(nextStep);
  const FollowingIcon = getManeuverIcon(followingStep);
  const effectiveDistanceMeters =
    typeof liveDistanceMeters === "number" && Number.isFinite(liveDistanceMeters)
      ? liveDistanceMeters
      : nextStep?.distanceMeters;
  const nextDistance = formatTurnDistance(effectiveDistanceMeters);
  const followingDistance = formatTurnDistance(followingStep?.distanceMeters);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-3 top-3 z-[560] flex justify-center sm:inset-x-4 sm:top-4",
        containerClassName
      )}
    >
      <div
        className={cn(
          "map-liquid-panel map-ui-enter pointer-events-auto relative w-full max-w-[640px] overflow-hidden rounded-[1.35rem] border backdrop-blur-3xl",
          tone === "light"
            ? "border-white/85 bg-[linear-gradient(180deg,rgba(38,38,38,0.86),rgba(64,64,64,0.78))] text-white shadow-[0_28px_68px_rgba(15,23,42,0.34)]"
            : "border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(30,41,59,0.76))] text-white shadow-[0_30px_72px_rgba(2,6,23,0.42)]"
        )}
      >
        <div
          className={cn(
            "map-liquid-sheen pointer-events-none absolute inset-0",
            tone === "light" ? "opacity-80" : "opacity-55"
          )}
        />

        <div className="flex items-start gap-3 px-3 py-3 sm:gap-3.5 sm:px-5 sm:py-4">
          <div className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.36)] map-nav-icon-ring-pulse sm:h-12 sm:w-12">
            <ManeuverIcon className="h-4.5 w-4.5 sm:h-6 sm:w-6" strokeWidth={2.35} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/66 sm:text-[11px]">
              Next maneuver
            </div>
            <div className="mt-1 text-base font-semibold leading-[1.08] tracking-[-0.02em] sm:mt-1.5 sm:text-xl md:text-2xl">
              {nextStep?.instruction || "Route ready"}
            </div>
            <div className="mt-1 text-xs text-white/82 sm:mt-1.5 sm:text-sm">
              {nextDistance || "Waiting for the next precise road cue"}
            </div>
          </div>
        </div>

        <div className="map-ui-enter-delay-1 border-t border-white/10 bg-slate-950/14 px-3 py-2 sm:px-5 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/8 sm:h-10 sm:w-10">
              <FollowingIcon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold leading-tight text-white/86 sm:text-base">
                {followingStep?.instruction || "Keep following the active route"}
              </div>
              <div className="mt-0.5 text-[11px] text-white/60 sm:text-xs">
                {followingDistance || "Upcoming step will appear here"}
              </div>
            </div>
          </div>
        </div>

        <div className={cn("sr-only", theme.titleClassName)}>Active navigation card</div>
      </div>
    </div>
  );
}
