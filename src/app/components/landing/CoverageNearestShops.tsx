import { ExternalLink, LocateFixed, MapPinned, Navigation, Star } from "lucide-react";
import { cn } from "../ui/utils";
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
  onSelectShop: (shop: CoverageNearbyShop) => void;
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
  onSelectShop,
  onOpenDirections,
  className,
}: CoverageNearestShopsProps) {
  const theme = getMapSurfaceTheme(tone, true);

  return (
    <div className={className || cn("p-3", theme.panelStrongClassName)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h5 className={cn("text-sm font-semibold", theme.titleClassName)}>
            Nearest Partner Shops
          </h5>
          <p className={cn("mt-0.5 text-xs", theme.secondaryTextClassName)}>
            {activeSearchTarget
              ? `From ${activeSearchTarget.label}`
              : "Search by ZIP or address to find nearby shops."}
          </p>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          {activeSearchTarget ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                theme.softBadgeClassName
              )}
            >
              {radiusMiles} mi
            </span>
          ) : null}
          {isLoadingShops ? (
            <span className={cn("text-[10px]", theme.secondaryTextClassName)}>Loading…</span>
          ) : null}
        </div>
      </div>

      {!activeSearchTarget ? null : nearbyShops.length === 0 ? (
        <div
          className={cn(
            "mt-3 flex flex-col items-center gap-2 rounded-[1.25rem] border px-4 py-6 text-center",
            tone === "light" ? "border-slate-200/60 bg-slate-50/60" : "border-white/8 bg-white/4"
          )}
        >
          <MapPinned
            className={cn("h-8 w-8", tone === "light" ? "text-slate-300" : "text-slate-500")}
          />
          <div className={cn("text-sm font-medium", theme.titleClassName)}>
            No shops within {radiusMiles} miles
          </div>
          <div className={cn("text-xs leading-relaxed", theme.secondaryTextClassName)}>
            Try expanding your search radius or searching a different area.
          </div>
        </div>
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
                  <Navigation className="h-3.5 w-3.5" />
                  Start Route
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
