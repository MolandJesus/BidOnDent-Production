import { Compass, History, MapPinned, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { CoveragePartnerShop, MapSurfaceTone, MapTileMode } from "../serviceCoverageMapTypes";
import {
  getNavigationProviderLabel,
  type NavigationProvider,
} from "../../../services/navigation/externalNavigation";
import type { ExternalNavigationSession } from "../../../types/navigation";
import { cn } from "../../ui/utils";
import {
  formatApproximateDriveWindow,
  formatDistanceMiles,
  formatLaunchTime,
} from "../mapRoutePresentation";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";

type CoverageCommandCenterSidebarProps = {
  tone: MapSurfaceTone;
  dock?: "left" | "right";
  showOverviewCards?: boolean;
  tileMode: MapTileMode;
  regionCount: number;
  partnerShops: CoveragePartnerShop[];
  selectedShop: CoveragePartnerShop | null;
  preferredNavigationProvider: NavigationProvider;
  navigationSession: ExternalNavigationSession | null;
  onOpenDirections: (shop: CoveragePartnerShop) => void;
  children: ReactNode;
};

export default function CoverageCommandCenterSidebar({
  tone,
  dock = "right",
  showOverviewCards = true,
  tileMode,
  regionCount,
  partnerShops,
  selectedShop,
  preferredNavigationProvider,
  navigationSession,
  onOpenDirections,
  children,
}: CoverageCommandCenterSidebarProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const viewModeLabel =
    tileMode === "night" ? "Midnight" : tileMode === "satellite" ? "Satellite" : "Roadmap";
  const launchTime = formatLaunchTime(navigationSession?.launchedAt);
  const selectedShopDistance = formatDistanceMiles(selectedShop?.distanceMiles);
  const selectedDriveWindow = formatApproximateDriveWindow(selectedShop?.distanceMiles);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-t border-white/10 p-2.5 sm:p-3.5 xl:border-t-0",
        dock === "left" ? "xl:border-r" : "xl:border-l"
      )}
    >
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-0.5">
        {showOverviewCards ? (
          <div
            className={cn(
              "map-liquid-card map-ui-enter flex flex-wrap items-center gap-2 p-3",
              theme.panelClassName
            )}
          >
            <span className={theme.softBadgeClassName}>Mode {viewModeLabel}</span>
            <span className={theme.softBadgeClassName}>{regionCount} regions</span>
            <span className={theme.softBadgeClassName}>{partnerShops.length} live shops</span>
          </div>
        ) : null}

        {showOverviewCards ? (
          <div
            className={cn(
              "map-liquid-panel map-ui-enter map-ui-enter-delay-1 p-4",
              theme.accentPanelClassName
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={theme.metricLabelClassName}>Browse Focus</div>
                <div className={cn("mt-2 text-base font-semibold", theme.titleClassName)}>
                  {selectedShop ? selectedShop.name : "Explore nearby BidOnDent coverage"}
                </div>
              </div>
              <span className={theme.iconButtonClassName}>
                <MapPinned className="h-4 w-4" />
              </span>
            </div>

            <p className={cn("mt-2 text-sm leading-6", theme.bodyClassName)}>
              {selectedShop
                ? `Use ${getNavigationProviderLabel(preferredNavigationProvider)} for live driving directions, then jump back into BidOnDent to keep comparing nearby shops and market context.`
                : "Search a ZIP, use live location, or choose a nearby place to build a cleaner BidOnDent route setup flow."}
            </p>

            {selectedShopDistance || selectedDriveWindow ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedShopDistance ? (
                  <span className={theme.softBadgeClassName}>{selectedShopDistance}</span>
                ) : null}
                {selectedDriveWindow ? (
                  <span className={theme.softBadgeClassName}>{selectedDriveWindow}</span>
                ) : null}
              </div>
            ) : null}

            {selectedShop?.addressLine ? (
              <p className={cn("mt-3 text-xs", theme.secondaryTextClassName)}>
                {selectedShop.addressLine}
              </p>
            ) : null}

            {selectedShop ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenDirections(selectedShop)}
                  className={theme.primaryButtonClassName}
                >
                  <Compass className="h-4 w-4" />
                  Open directions
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {showOverviewCards ? (
          <div
            className={cn(
              "map-liquid-panel map-ui-enter map-ui-enter-delay-2 p-4",
              theme.panelClassName
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={theme.metricLabelClassName}>BidOnDent Live Context</div>
                <div className={cn("mt-2 text-base font-semibold", theme.titleClassName)}>
                  Browse, compare, and route
                </div>
              </div>
              <span className={theme.iconButtonClassName}>
                <Sparkles className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className={theme.listCardClassName}>
                <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                  Partner shops stay first-class
                </div>
                <div className={cn("mt-1 text-xs leading-5", theme.secondaryTextClassName)}>
                  Nearby BidOnDent shops, saved places, and parked-car memory stay visible while you
                  browse.
                </div>
              </div>
              <div className={theme.listCardClassName}>
                <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                  Real public places are live
                </div>
                <div className={cn("mt-1 text-xs leading-5", theme.secondaryTextClassName)}>
                  Customer, insurer, and shop lenses can surface live nearby market places around
                  the active search area.
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {navigationSession ? (
          <div
            className={cn(
              "map-liquid-card map-ui-enter map-ui-enter-delay-3 p-3",
              theme.panelClassName
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className={theme.metricLabelClassName}>Recent Route</div>
                <div className={cn("mt-1 truncate text-sm font-semibold", theme.titleClassName)}>
                  {navigationSession.destinationName}
                </div>
                <div className={cn("mt-0.5 text-xs", theme.secondaryTextClassName)}>
                  {getNavigationProviderLabel(navigationSession.provider)}
                  {launchTime ? ` • ${launchTime}` : ""}
                </div>
              </div>
              <span className={theme.iconButtonClassName}>
                <History className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        ) : null}

        {children}
      </div>
    </aside>
  );
}
