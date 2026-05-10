import { AlertTriangle, LocateFixed, MapPinned, Navigation, RefreshCw, Search } from "lucide-react";
import { cn } from "@/platform-core/cn";
import { getMapSurfaceTheme } from "../maps/mapSurfaceTheme";
import CoverageNearestShopCard from "./CoverageNearestShopCard";
import {
  LANDING_INSTRUCTION_CARDS,
  type CoverageNearestShopsProps,
} from "./coverageNearestShopsHelpers";

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
  onOpenSearch,
  className,
  variant = "default",
  selectedShopName,
  isOutsideServiceArea = false,
}: CoverageNearestShopsProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const showBackendFailureState = Boolean(fetchError) && !usingDemoFallback;
  const isLandingShowcase = variant === "landing-showcase";

  return (
    <div
      className={cn(
        className || cn(isLandingShowcase ? "p-4 lg:p-5" : "p-3", theme.panelStrongClassName),
        "animate-in fade-in slide-in-from-bottom-2 duration-400 motion-reduce:animate-none"
      )}
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
              {!activeSearchTarget
                ? "Search an area to unlock shop recommendations"
                : isOutsideServiceArea
                  ? "Outside our current NY service region"
                  : `${nearbyShops.length} nearby repair options`}
            </h5>
            <p className={cn("mt-1 text-sm leading-6", theme.secondaryTextClassName)}>
              {!activeSearchTarget
                ? "Set an origin above and the strongest partner shops will populate below the map."
                : isOutsideServiceArea
                  ? "BidOnDent is focused on Rockland, Dutchess, Westchester, Nassau, Orange, and Putnam — browse the regions above to see where we're live."
                  : `Compare rating and distance to partner shops near ${activeSearchTarget.label}.`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeSearchTarget && !isOutsideServiceArea ? (
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-semibold",
                  theme.softBadgeClassName
                )}
              >
                {radiusMiles} mi radius
              </span>
            ) : null}
            {selectedShopName ? (
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-semibold",
                  theme.badgeClassName
                )}
              >
                Focused: {selectedShopName}
              </span>
            ) : null}
            {isLoadingShops ? (
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-semibold",
                  theme.softBadgeClassName
                )}
              >
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
            "mt-3 flex flex-col gap-2 rounded-[1.2rem] border px-3 py-3 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none",
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
                  ? "Partner-shop data is temporarily unavailable. Showing demo hubs while the backend recovers."
                  : "Partner-shop data could not be loaded. Retry to refresh shops from Supabase."}
              </div>
            </div>
          </div>

          {onRetryShops ? (
            <button
              type="button"
              onClick={onRetryShops}
              className={cn(
                "inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
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
                  title: LANDING_INSTRUCTION_CARDS[0].title,
                  description: LANDING_INSTRUCTION_CARDS[0].description,
                },
                {
                  icon: LocateFixed,
                  title: LANDING_INSTRUCTION_CARDS[1].title,
                  description: LANDING_INSTRUCTION_CARDS[1].description,
                },
                {
                  icon: Navigation,
                  title: LANDING_INSTRUCTION_CARDS[2].title,
                  description: LANDING_INSTRUCTION_CARDS[2].description,
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
        ) : (
          <div className={cn("mt-3 rounded-[1.35rem] border p-4", theme.panelClassName)}>
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  theme.softBadgeClassName
                )}
              >
                <Search className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={cn("text-sm font-semibold tracking-tight", theme.titleClassName)}>
                  Set an origin to reveal nearby shops
                </div>
                <p className={cn("mt-1 text-xs leading-5", theme.secondaryTextClassName)}>
                  Use ZIP, address, or live GPS in Search to turn this panel into a ranked
                  partner-shop list.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className={theme.listCardClassName}>
                <div className="flex items-start gap-3">
                  <LocateFixed className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                      Use live location
                    </div>
                    <div className={cn("mt-1 text-xs leading-5", theme.secondaryTextClassName)}>
                      Let the map lock onto where you are for faster nearby recommendations.
                    </div>
                  </div>
                </div>
              </div>
              <div className={theme.listCardClassName}>
                <div className="flex items-start gap-3">
                  <MapPinned className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                      Browse the strongest matches
                    </div>
                    <div className={cn("mt-1 text-xs leading-5", theme.secondaryTextClassName)}>
                      Once focused, this view ranks nearby BidOnDent partners by distance and fit.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {onOpenSearch ? (
              <button
                type="button"
                onClick={onOpenSearch}
                className={cn("mt-4 w-full", theme.secondaryButtonClassName)}
              >
                <Search className="h-4 w-4" />
                Open Search
              </button>
            ) : null}
          </div>
        )
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
            The search origin is ready, but the partner-shop feed did not return. Retry the backend
            call and try again.
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
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl",
              tone === "light"
                ? "border border-blue-200/60 bg-blue-50/60"
                : "border border-blue-400/20 bg-blue-500/10"
            )}
            style={{
              boxShadow:
                tone === "light"
                  ? // Pass 28: cream-gold inset highlight per locked Premium Gold Palette.
                    "0 6px 20px rgba(59,130,246,0.14), inset 0 1px 0 rgba(252,240,208,0.65)"
                  : "0 0 22px rgba(59,130,246,0.22), inset 0 1px 0 rgba(147,197,253,0.20)",
            }}
          >
            <MapPinned
              className={cn("h-5 w-5", tone === "light" ? "text-blue-500" : "text-blue-300")}
            />
          </div>
          <div className={cn("text-sm font-semibold", theme.titleClassName)}>
            {isOutsideServiceArea
              ? "You're outside our current NY service region"
              : "Service area is expanding"}
          </div>
          <div className={cn("text-xs leading-relaxed max-w-sm", theme.secondaryTextClassName)}>
            {isOutsideServiceArea
              ? "BidOnDent is currently focused on NY counties — Rockland, Dutchess, Westchester, Nassau, Orange, and Putnam. Browse the regions above to see where we're live."
              : `No partner shops within ${radiusMiles} miles yet. Try a wider radius, a different NY ZIP, or check back as our network grows across NY.`}
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
              <CoverageNearestShopCard
                shop={shop}
                theme={theme}
                isSelected={selectedShopId === `${shop.id || shop.name}`}
                isLandingShowcase={isLandingShowcase}
                onSelectShop={onSelectShop}
                onOpenDirections={onOpenDirections}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
