import { Compass, ExternalLink, LocateFixed, Star } from "lucide-react";
import { cn } from "../ui/utils";
import {
  getNavigationProviderLabel,
  navigationProviderOptions,
  type NavigationProvider,
} from "../../services/navigation/externalNavigation";
import { formatApproximateDriveWindow } from "../maps/mapRoutePresentation";
import { getMapSurfaceTheme } from "../maps/mapSurfaceTheme";
import type {
  CoverageNearbyShop,
  CoverageSearchTarget,
  MapSurfaceTone,
} from "../maps/serviceCoverageMapTypes";

type CoverageNearestShopsProps = {
  tone: MapSurfaceTone;
  isLoadingShops: boolean;
  activeSearchTarget: CoverageSearchTarget | null;
  nearbyShops: CoverageNearbyShop[];
  radiusMiles: string;
  selectedShopId?: string;
  preferredNavigationProvider: NavigationProvider;
  onSelectShop: (shop: CoverageNearbyShop) => void;
  onPreferredNavigationProviderChange: (provider: NavigationProvider) => void;
  onOpenDirections: (shop: CoverageNearbyShop) => void;
  className?: string;
};

export default function CoverageNearestShops({
  tone,
  isLoadingShops,
  activeSearchTarget,
  nearbyShops,
  radiusMiles,
  selectedShopId,
  preferredNavigationProvider,
  onSelectShop,
  onPreferredNavigationProviderChange,
  onOpenDirections,
  className,
}: CoverageNearestShopsProps) {
  const theme = getMapSurfaceTheme(tone, true);

  return (
    <div className={className || cn("p-4", theme.panelStrongClassName)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h5 className={cn("font-semibold", theme.titleClassName)}>Nearest Partner Shops</h5>
          <p className={cn("mt-1 text-sm", theme.secondaryTextClassName)}>
            {activeSearchTarget
              ? `Launch directions from ${activeSearchTarget.label}`
              : "Enter a 5-digit ZIP code or use your live location to view the closest shops."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSearchTarget ? (
            <span className={cn("text-xs font-medium", theme.secondaryTextClassName)}>{radiusMiles}-mile search window</span>
          ) : null}
          {activeSearchTarget ? (
            <div className={theme.segmentedClassName}>
              {navigationProviderOptions.map((provider) => (
                <button
                  key={provider.id}
                  type="button"
                  onClick={() => onPreferredNavigationProviderChange(provider.id)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${
                    preferredNavigationProvider === provider.id
                      ? theme.activeSegmentClassName
                      : theme.inactiveSegmentClassName
                  }`}
                >
                  {provider.label}
                </button>
              ))}
            </div>
          ) : null}
          {isLoadingShops ? (
            <span className={cn("text-xs", theme.secondaryTextClassName)}>
              Loading live partner data...
            </span>
          ) : null}
        </div>
      </div>

      {!activeSearchTarget ? null : nearbyShops.length === 0 ? (
        <p
          className={cn(
            "mt-4 rounded-[1rem] border px-4 py-3 text-sm",
            tone === "light"
              ? "border-amber-200 bg-amber-50 text-amber-900"
              : "border-amber-300/20 bg-amber-500/10 text-amber-200"
          )}
        >
          No partner shops were found within {radiusMiles} miles. Expand the search radius or route
          the request for manual partner assignment.
        </p>
      ) : (
        <div className="mt-3 sm:mt-4 grid gap-2.5 sm:gap-3 md:grid-cols-2">
          {nearbyShops.map((shop) => (
            <div
              key={shop.id || shop.name}
              className={
                selectedShopId === `${shop.id || shop.name}`
                  ? theme.selectedListCardClassName
                  : theme.listCardClassName
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                    {shop.name}
                  </div>
                  <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                    {shop.distanceMiles.toFixed(1)} miles away
                    {formatApproximateDriveWindow(shop.distanceMiles)
                      ? ` • ${formatApproximateDriveWindow(shop.distanceMiles)}`
                      : ""}
                  </div>
                  <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                    {shop.countyLabel}
                  </div>
                  {shop.dataMode === "demo" ? (
                    <span className="mt-1.5 inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-amber-400/15 text-amber-300 border border-amber-400/25">
                      Demo
                    </span>
                  ) : null}
                </div>
                {selectedShopId === `${shop.id || shop.name}` ? (
                  <span className={theme.badgeClassName}>Live Focus</span>
                ) : null}
              </div>

              {shop.addressLine ? (
                <div className={cn("mt-2 text-xs", theme.secondaryTextClassName)}>
                  {shop.addressLine}
                </div>
              ) : null}
              <div
                className={cn(
                  "mt-1 flex flex-wrap items-center gap-2 text-xs",
                  theme.secondaryTextClassName
                )}
              >
                <span className="inline-flex items-center gap-0.5">
                  <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                  <span className="font-medium text-amber-300">{shop.rating.toFixed(1)}</span>
                </span>
                {shop.specialties.length > 0 && (
                  <span>{shop.specialties.slice(0, 3).join(" • ")}</span>
                )}
              </div>

              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSelectShop(shop)}
                  className={theme.secondaryButtonClassName}
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  View on map
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDirections(shop)}
                  className={theme.primaryButtonClassName}
                >
                  <Compass className="h-3.5 w-3.5" />
                  Open in {getNavigationProviderLabel(preferredNavigationProvider)}
                </button>
                {shop.phoneNumber ? (
                  <a href={`tel:${shop.phoneNumber}`} className={theme.secondaryButtonClassName}>
                    <ExternalLink className="h-3.5 w-3.5" />
                    Call
                  </a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
