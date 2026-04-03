import {
  AlertTriangle,
  ExternalLink,
  LocateFixed,
  MapPinned,
  Navigation,
  RefreshCw,
  Search,
  Star,
} from "lucide-react";
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
  fetchError?: string | null;
  usingDemoFallback?: boolean;
  activeSearchTarget: CoverageSearchTarget | null;
  nearbyShops: CoverageNearbyShop[];
  radiusMiles: string;
  selectedShopId?: string;
  onSelectShop: (shop: CoverageNearbyShop) => void;
  onOpenDirections: (shop: CoverageNearbyShop) => void;
  onRetryShops?: () => void;
  className?: string;
  variant?: "default" | "landing-showcase";
  selectedShopName?: string | null;
};

export default function CoverageNearestShops({
  tone,
  isLoadingShops,
  fetchError,
  usingDemoFallback = false,
  activeSearchTarget,
  nearbyShops,
  radiusMiles,
  selectedShopId,
  onSelectShop,
  onOpenDirections,
  onRetryShops,
  className,
  variant = "default",
  selectedShopName,
}: CoverageNearestShopsProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const showBackendFailureState = Boolean(fetchError) && !usingDemoFallback;
  const isLandingShowcase = variant === "landing-showcase";

  return (
    <div
      className={
        className ||
        cn(isLandingShowcase ? "p-4 lg:p-5" : "p-3", theme.panelStrongClassName)
      }
    >
      {isLandingShowcase ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className={theme.metricLabelClassName}>Recommended Shops</div>
            <h5
              className={cn(
                "mt-1.5 text-xl font-semibold tracking-tight sm:text-[1.6rem]",
                theme.titleClassName
              )}
            >
              {activeSearchTarget
                ? `${nearbyShops.length} nearby repair options`
                : "Search an area to unlock shop recommendations"}
            </h5>
            <p className={cn("mt-1 text-sm leading-6", theme.secondaryTextClassName)}>
              {activeSearchTarget
                ? `Compare rating, distance, and live routing around ${activeSearchTarget.label}.`
                : "Set an origin above and the strongest partner shops will populate below the map."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeSearchTarget ? (
              <span className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold", theme.softBadgeClassName)}>
                {radiusMiles} mi radius
              </span>
            ) : null}
            {selectedShopName ? (
              <span className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold", theme.badgeClassName)}>
                Focused: {selectedShopName}
              </span>
            ) : null}
            {isLoadingShops ? (
              <span className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold", theme.softBadgeClassName)}>
                Loading…
              </span>
            ) : null}
          </div>
        </div>
      ) : (
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
      )}

      {fetchError ? (
        <div
          className={cn(
            "mt-3 flex flex-col gap-2 rounded-[1.2rem] border px-3 py-3 sm:flex-row sm:items-center sm:justify-between",
            tone === "light"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-rose-400/20 bg-rose-500/10 text-rose-100"
          )}
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em]">
                {usingDemoFallback ? "Demo fallback active" : "Partner-shop backend issue"}
              </div>
              <div className="mt-1 text-xs leading-relaxed">
                {usingDemoFallback
                  ? "Live partner-shop data is temporarily unavailable. Showing demo hubs while the backend recovers."
                  : "Live partner-shop data could not be loaded. Retry to refresh shops from Supabase."}
              </div>
            </div>
          </div>

          {onRetryShops ? (
            <button
              type="button"
              onClick={onRetryShops}
              className={cn(
                "inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
                tone === "light"
                  ? "bg-rose-100 text-rose-800 hover:bg-rose-200"
                  : "bg-white/10 text-white hover:bg-white/15"
              )}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          ) : null}
        </div>
      ) : null}

      {!activeSearchTarget ? (
        isLandingShowcase ? (
          <div className={cn("mt-4 rounded-[1.35rem] border p-3.5 sm:p-4", theme.panelClassName)}>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Search,
                  title: "Search a ZIP or address",
                  description:
                    "Drop in home, work, or a repair address to focus the map fast.",
                },
                {
                  icon: LocateFixed,
                  title: "Use live location",
                  description:
                    "Switch to GPS when you want the map to follow where you are now.",
                },
                {
                  icon: Navigation,
                  title: "Choose a shop below",
                  description:
                    "Once the map is focused, compare nearby partners and jump into routing.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex h-full gap-3 rounded-[1.1rem]">
                    <div
                      className={cn(
                        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                        theme.softBadgeClassName
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={cn("text-sm font-semibold tracking-tight", theme.titleClassName)}
                      >
                        {item.title}
                      </div>
                      <p
                        className={cn(
                          "mt-1 text-xs leading-5 sm:text-sm sm:leading-5",
                          theme.secondaryTextClassName
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null
      ) : showBackendFailureState && nearbyShops.length === 0 ? (
        <div
          className={cn(
            "mt-3 flex flex-col items-center gap-2 rounded-[1.25rem] border px-4 py-6 text-center",
            tone === "light" ? "border-rose-200 bg-rose-50/80" : "border-rose-400/20 bg-rose-500/10"
          )}
        >
          <AlertTriangle
            className={cn("h-8 w-8", tone === "light" ? "text-rose-300" : "text-rose-300/80")}
          />
          <div className={cn("text-sm font-medium", theme.titleClassName)}>
            Unable to load nearby partner shops
          </div>
          <div className={cn("text-xs leading-relaxed", theme.secondaryTextClassName)}>
            The search origin is ready, but the live partner-shop feed did not return. Retry the
            backend call and try again.
          </div>
          {onRetryShops ? (
            <button type="button" onClick={onRetryShops} className={theme.secondaryButtonClassName}>
              <RefreshCw className="h-3.5 w-3.5" />
              Retry partner shops
            </button>
          ) : null}
        </div>
      ) : nearbyShops.length === 0 ? (
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
        <div
          className={cn(
            isLandingShowcase
              ? "mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3"
              : "mt-3 sm:mt-4 grid gap-2.5 sm:gap-3 md:grid-cols-2"
          )}
        >
          {nearbyShops.map((shop) => (
            <div
              key={shop.id || shop.name}
              className={cn(
                selectedShopId === `${shop.id || shop.name}`
                  ? theme.selectedListCardClassName
                  : theme.listCardClassName,
                isLandingShowcase && "flex h-full flex-col gap-3"
              )}
            >
              {isLandingShowcase ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className={cn("text-base font-semibold tracking-tight sm:text-lg", theme.titleClassName)}>
                        {shop.name}
                      </div>
                      <div className={cn("mt-0.5 text-sm", theme.secondaryTextClassName)}>
                        {shop.addressLine || shop.countyLabel}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {selectedShopId === `${shop.id || shop.name}` ? (
                        <span className={theme.badgeClassName}>Focused</span>
                      ) : null}
                      {shop.dataMode === "demo" ? (
                        <span className="inline-flex rounded-full border border-amber-400/25 bg-amber-400/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
                          Demo
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold", theme.softBadgeClassName)}>
                      <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
                      {shop.rating.toFixed(1)}
                    </span>
                    <span className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold", theme.softBadgeClassName)}>
                      {shop.distanceMiles.toFixed(1)} mi
                    </span>
                    {formatApproximateDriveWindow(shop.distanceMiles) ? (
                      <span className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold", theme.softBadgeClassName)}>
                        {formatApproximateDriveWindow(shop.distanceMiles)}
                      </span>
                    ) : null}
                  </div>

                  <p className={cn("text-xs leading-5 sm:text-sm sm:leading-6", theme.secondaryTextClassName)}>
                    {shop.countyLabel}
                  </p>

                  {shop.specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {shop.specialties.slice(0, 2).map((specialty) => (
                        <span
                          key={`${shop.id || shop.name}-${specialty}`}
                          className={cn("rounded-full px-3 py-1 text-[11px] font-medium", theme.softBadgeClassName)}
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
                      Start Route
                    </button>
                    {shop.phoneNumber ? (
                      <a href={`tel:${shop.phoneNumber}`} className={theme.secondaryButtonClassName}>
                        <ExternalLink className="h-3.5 w-3.5" />
                        Call
                      </a>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
