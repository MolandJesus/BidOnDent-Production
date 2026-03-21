import type { ExternalNavigationSession } from "../../../types/navigation";
import { getNavigationProviderLabel } from "../../../services/navigation/externalNavigation";
import { formatLaunchTime } from "../mapRoutePresentation";
import { cn } from "../../ui/utils";
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
    <div className="map-ui-enter relative overflow-hidden border-b border-white/10 px-4 py-4 text-left sm:px-6 sm:py-5">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-20 -top-24 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute -right-16 top-1/3 h-44 w-44 rounded-full bg-cyan-300/16 blur-3xl" />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className={theme.eyebrowClassName}>BidOnDent Maps</div>
          <h2
            className={cn(
              "mt-3 text-[1.7rem] font-semibold sm:mt-4 sm:text-2xl",
              theme.titleClassName
            )}
          >
            Coverage command center
          </h2>
          <p className={cn("mt-2 max-w-3xl text-sm", theme.bodyClassName)}>
            Browse live partner coverage, preview nearby real places, and keep your map context
            intact while routing through the BidOnDent workflow.
          </p>
        </div>

        {navigationSession ? (
          <div
            className={cn(
              "map-liquid-card map-ui-enter map-ui-enter-delay-1 px-4 py-3 text-sm",
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
