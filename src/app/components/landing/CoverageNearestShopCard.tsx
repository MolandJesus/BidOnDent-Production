import { ExternalLink, LocateFixed, Navigation, Star } from "lucide-react";
import { cn } from "../ui/utils";
import { formatApproximateDriveWindow } from "../maps/mapRoutePresentation";
import type { CoverageNearbyShop } from "../maps/serviceCoverageMapTypes";

type CoverageNearestShopCardProps = {
  shop: CoverageNearbyShop;
  theme: Record<string, string>;
  isSelected: boolean;
  isLandingShowcase: boolean;
  onSelectShop: (shop: CoverageNearbyShop) => void;
  onOpenDirections: (shop: CoverageNearbyShop) => void;
};

export default function CoverageNearestShopCard({
  shop,
  theme,
  isSelected,
  isLandingShowcase,
  onSelectShop,
  onOpenDirections,
}: CoverageNearestShopCardProps) {
  if (isLandingShowcase) {
    return (
      <>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div
              className={cn(
                "text-base font-semibold tracking-tight sm:text-lg",
                theme.titleClassName
              )}
            >
              {shop.name}
            </div>
            <div className={cn("mt-0.5 text-sm", theme.secondaryTextClassName)}>
              {shop.addressLine || shop.countyLabel}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {isSelected ? <span className={theme.badgeClassName}>Focused</span> : null}
            {shop.dataMode === "demo" ? (
              <span className="bd-status--warn inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
                Demo
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold",
              theme.softBadgeClassName
            )}
          >
            <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
            {shop.rating.toFixed(1)}
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-semibold",
              theme.softBadgeClassName
            )}
          >
            {shop.distanceMiles.toFixed(1)} mi
          </span>
          {formatApproximateDriveWindow(shop.distanceMiles) ? (
            <span
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-semibold",
                theme.softBadgeClassName
              )}
            >
              {formatApproximateDriveWindow(shop.distanceMiles)}
            </span>
          ) : null}
        </div>

        <p
          className={cn("text-xs leading-5 sm:text-sm sm:leading-6", theme.secondaryTextClassName)}
        >
          {shop.countyLabel}
        </p>

        {shop.specialties.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {shop.specialties.slice(0, 2).map((specialty) => (
              <span
                key={`${shop.id || shop.name}-${specialty}`}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-medium",
                  theme.softBadgeClassName
                )}
              >
                {specialty}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-0.5">
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
            Start Navigation
          </button>
          {shop.phoneNumber ? (
            <a href={`tel:${shop.phoneNumber}`} className={theme.secondaryButtonClassName}>
              <ExternalLink className="h-3.5 w-3.5" />
              Call
            </a>
          ) : null}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={cn("text-sm font-semibold", theme.titleClassName)}>{shop.name}</div>
          <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
            {shop.distanceMiles.toFixed(1)} miles away
            {formatApproximateDriveWindow(shop.distanceMiles)
              ? ` • ${formatApproximateDriveWindow(shop.distanceMiles)}`
              : ""}
          </div>
          <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>{shop.countyLabel}</div>
          {shop.dataMode === "demo" ? (
            <span className="bd-status--warn mt-1.5 inline-flex rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              Demo
            </span>
          ) : null}
        </div>
        {isSelected ? <span className={theme.badgeClassName}>Live Focus</span> : null}
      </div>

      {shop.addressLine ? (
        <div className={cn("mt-2 text-xs", theme.secondaryTextClassName)}>{shop.addressLine}</div>
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
        {shop.specialties.length > 0 && <span>{shop.specialties.slice(0, 3).join(" • ")}</span>}
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
          Start Navigation
        </button>
        {shop.phoneNumber ? (
          <a href={`tel:${shop.phoneNumber}`} className={theme.secondaryButtonClassName}>
            <ExternalLink className="h-3.5 w-3.5" />
            Call
          </a>
        ) : null}
      </div>
    </>
  );
}
