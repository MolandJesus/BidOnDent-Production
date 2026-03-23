import { ArrowRight, ArrowUp, CornerDownLeft, CornerDownRight, RotateCcw } from "lucide-react";
import { cn } from "../../ui/utils";
import { formatTurnDistance } from "../mapRoutePresentation";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";
import type { NavigationRouteStep } from "../../../types/navigation";

type NavigationActiveManeuverCardProps = {
  tone: MapSurfaceTone;
  nextStep: NavigationRouteStep | null;
  followingStep: NavigationRouteStep | null;
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
}: NavigationActiveManeuverCardProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const ManeuverIcon = getManeuverIcon(nextStep);
  const FollowingIcon = getManeuverIcon(followingStep);
  const nextDistance = formatTurnDistance(nextStep?.distanceMeters);
  const followingDistance = formatTurnDistance(followingStep?.distanceMeters);

  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-[560] flex justify-center sm:inset-x-4 sm:top-4">
      <div
        className={cn(
          "map-liquid-panel map-ui-enter pointer-events-auto relative w-full max-w-[720px] overflow-hidden rounded-[2.2rem] border backdrop-blur-3xl",
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

        <div className="flex items-start gap-3 px-3 py-3 sm:gap-4 sm:px-6 sm:py-5">
          <div className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.36)] map-nav-icon-ring-pulse sm:h-16 sm:w-16">
            <ManeuverIcon className="h-5 w-5 sm:h-8 sm:w-8" strokeWidth={2.4} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/66 sm:text-[11px]">
              Next maneuver
            </div>
            <div className="mt-1 text-lg font-semibold leading-[1.08] tracking-[-0.02em] sm:mt-2 sm:text-[2.55rem] sm:tracking-[-0.03em]">
              {nextStep?.instruction || "Route ready"}
            </div>
            <div className="mt-1 text-xs text-white/82 sm:mt-2 sm:text-sm">
              {nextDistance || "Waiting for the next precise road cue"}
            </div>
          </div>
        </div>

        <div className="map-ui-enter-delay-1 hidden border-t border-white/10 bg-slate-950/14 px-4 py-4 sm:block sm:px-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/8">
              <FollowingIcon className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-semibold leading-tight text-white/86">
                {followingStep?.instruction || "Keep following the active route"}
              </div>
              <div className="mt-1 text-sm text-white/60">
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
