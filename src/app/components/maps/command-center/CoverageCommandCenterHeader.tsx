import type { ExternalNavigationSession } from "../../../types/navigation";
import { getNavigationProviderLabel } from "../../../services/navigation/externalNavigation";
import { formatLaunchTime } from "../mapRoutePresentation";
import { cn } from "@/platform-core/cn";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";
import type { MapSurfaceTone } from "../serviceCoverageMapTypes";

type CoverageCommandCenterHeaderProps = {
  tone: MapSurfaceTone;
  navigationSession: ExternalNavigationSession | null;
};

export default function CoverageCommandCenterHeader({
  tone,
  navigationSession,
}: CoverageCommandCenterHeaderProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const launchTime = formatLaunchTime(navigationSession?.launchedAt);

  return (
    <div className="map-ui-enter relative overflow-hidden rounded-[1.5rem] border border-white/10 px-4 py-3 text-left sm:px-5">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-24 -top-24 h-40 w-40 rounded-full bg-sky-300/16 blur-3xl" />
        <div className="absolute right-12 top-0 h-28 w-28 rounded-full bg-cyan-300/14 blur-3xl" />
      </div>

      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div>
            <div className={theme.eyebrowClassName}>Coverage browse</div>
            <h2 className={cn("text-sm font-semibold sm:text-base", theme.titleClassName)}>
              Find nearby shops and route with live context
            </h2>
          </div>
        </div>

        {navigationSession ? (
          <div
            className={cn(
              "map-liquid-card map-ui-enter map-ui-enter-delay-1 px-4 py-2.5 text-sm",
              theme.panelClassName
            )}
          >
            <div className={theme.metricLabelClassName}>Last route handoff</div>
            <div className={cn("mt-1 font-semibold", theme.titleClassName)}>
              {navigationSession.destinationName}
            </div>
            <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
              {getNavigationProviderLabel(navigationSession.provider)} remembered locally
              {launchTime ? ` • ${launchTime}` : ""}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
