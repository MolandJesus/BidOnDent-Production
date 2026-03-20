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
    <aside className="border-t border-white/10 p-4 sm:p-6 xl:border-t-0 xl:border-l">
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className={cn("p-4", theme.panelClassName)}>
            <div className={theme.metricLabelClassName}>View Mode</div>
            <div className={cn("mt-2 text-xl font-semibold", theme.titleClassName)}>
              {viewModeLabel}
            </div>
          </div>
          <div className={cn("p-4", theme.panelClassName)}>
            <div className={theme.metricLabelClassName}>Coverage Grid</div>
            <div className={cn("mt-2 text-xl font-semibold", theme.titleClassName)}>
              {regionCount} regions
            </div>
          </div>
          <div className={cn("p-4", theme.panelClassName)}>
            <div className={theme.metricLabelClassName}>Partner Markers</div>
            <div className={cn("mt-2 text-xl font-semibold", theme.titleClassName)}>
              {partnerShops.length} live shops
            </div>
          </div>
        </div>

        <div className={cn("p-4", theme.accentPanelClassName)}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={theme.metricLabelClassName}>Browse Focus</div>
              <div className={cn("mt-2 text-lg font-semibold", theme.titleClassName)}>
                {selectedShop ? selectedShop.name : "Explore nearby BidOnDent coverage"}
              </div>
            </div>
            <span className={theme.iconButtonClassName}>
              <MapPinned className="h-4 w-4" />
            </span>
          </div>

          <p className={cn("mt-2 text-sm", theme.bodyClassName)}>
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

        <div className={cn("p-4", theme.panelClassName)}>
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
                Customer, insurer, and shop lenses can surface live nearby market places around the
                active search area.
              </div>
            </div>
          </div>
        </div>

        {navigationSession ? (
          <div className={cn("p-4", theme.panelClassName)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className={theme.metricLabelClassName}>Recent Route Memory</div>
                <div className={cn("mt-2 text-base font-semibold", theme.titleClassName)}>
                  {navigationSession.destinationName}
                </div>
              </div>
              <span className={theme.iconButtonClassName}>
                <History className="h-4 w-4" />
              </span>
            </div>
            <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
              Last launched with {getNavigationProviderLabel(navigationSession.provider)}
              {launchTime ? ` • ${launchTime}` : ""}
            </div>
            {navigationSession.destinationAddress ? (
              <div className={cn("mt-2 text-xs leading-5", theme.secondaryTextClassName)}>
                {navigationSession.destinationAddress}
              </div>
            ) : null}
          </div>
        ) : null}

        {children}
      </div>
    </aside>
  );
}
