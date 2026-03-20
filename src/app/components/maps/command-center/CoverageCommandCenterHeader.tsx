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
    <div className="border-b border-white/10 px-6 py-5 text-left">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className={theme.eyebrowClassName}>BidOnDent Maps</div>
          <h2 className={cn("mt-4 text-2xl font-semibold", theme.titleClassName)}>
            Coverage command center
          </h2>
          <p className={cn("mt-2 max-w-3xl text-sm", theme.bodyClassName)}>
            Browse live partner coverage, preview nearby real places, and keep your map context
            intact while routing through the BidOnDent workflow.
          </p>
        </div>

        {navigationSession ? (
          <div className={cn("px-4 py-3 text-sm", theme.panelClassName)}>
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
