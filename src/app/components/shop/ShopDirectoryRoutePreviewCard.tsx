import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Compass,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Route,
  Send,
  TriangleAlert,
  X,
} from "lucide-react";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { Place, RouteOption } from "../../types/mapDomain";

type ShopDirectoryRoutePreviewCardProps = {
  routeOptions: RouteOption[];
  selectedRoute: RouteOption;
  selectedOrigin: Place;
  selectedShop: ShopMapListing;
  isArrivedForSelectedShop: boolean;
  routeSummary: IntelligenceSummary;
  routeError?: string;
  isLoadingRoute?: boolean;
  usingLiveRoutes?: boolean;
  hasArrived?: boolean;
  distanceLabel: string;
  etaLabel: string;
  isDark: boolean;
  onSelectRoute: (id: string) => void;
  onStartNavigation?: () => void;
  onRequestEstimate?: (shop: ShopMapListing) => void;
  onDismiss?: () => void;
  onRetryRoute?: () => void;
  directionsLabel?: string;
  density?: "default" | "compact";
};

export default function ShopDirectoryRoutePreviewCard({
  routeOptions,
  selectedRoute,
  selectedOrigin,
  selectedShop,
  isArrivedForSelectedShop,
  routeSummary,
  routeError,
  isLoadingRoute = false,
  usingLiveRoutes = false,
  hasArrived = false,
  distanceLabel,
  etaLabel,
  isDark,
  onSelectRoute,
  onStartNavigation,
  onRequestEstimate,
  onDismiss,
  onRetryRoute,
  directionsLabel,
  density = "default",
}: ShopDirectoryRoutePreviewCardProps) {
  const [routeExpanded, setRouteExpanded] = useState(false);
  const isCompactDensity = density === "compact";

  // Pass 12 #4 — outer card wrap migrated to canonical `bd-glass-card--map`
  // utility (see theme.css). Pre-Pass-12 this used the bespoke `map-liquid-panel`
  // + per-tone shadow/border/background string. The bd utility carries the same
  // Pass 11 #3/#4 grammar (cream catchlight + bronze rim + warm gold halo + cool
  // blue identity ring) for both light and dark and stays in sync with the rest
  // of the map chrome (Coverage sidebar, Coverage bottom strip, MapPaneLegend).
  // Only the text color tone is kept here because the card body still drives
  // text contrast separately from the surface.
  const cardTextTone = isDark ? "text-white" : "text-slate-800";
  const secondaryText = isDark ? "text-white/60" : "text-slate-500";
  const divider = isDark ? "border-white/10" : "border-black/8";
  const activeRoute = isDark
    ? "map-liquid-card bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(14,116,144,0.18))] font-semibold text-white"
    : "map-liquid-card bg-[linear-gradient(180deg,rgba(247,232,194,0.94),rgba(232,238,248,0.88))] font-semibold text-slate-800 shadow-[inset_0_1px_0_rgba(252,240,208,0.85),0_4px_14px_rgba(15,23,42,0.08)]";
  const inactiveRoute = isDark
    ? "map-liquid-card bg-white/[0.06] text-white/70 hover:bg-white/[0.1]"
    : "map-liquid-card bg-black/[0.04] text-slate-500 hover:bg-black/[0.08]";
  const routeSubtext = isDark ? "text-white/70" : "text-slate-500";
  const routeSubtextActive = isDark ? "text-white/70" : "text-slate-400";

  const routeSourceLabel = hasArrived
    ? "Trip complete"
    : routeError
      ? "Route estimate"
      : usingLiveRoutes
        ? "Live route"
        : "Estimated route";
  const routeSourceBadge = routeError
    ? isDark
      ? "border-amber-400/30 bg-amber-400/12 text-amber-100"
      : "border-amber-200 bg-amber-50 text-amber-700"
    : hasArrived
      ? isDark
        ? "border-emerald-400/30 bg-emerald-400/12 text-emerald-100"
        : "border-emerald-200 bg-emerald-50 text-emerald-700"
      : usingLiveRoutes
        ? isDark
          ? "border-blue-400/30 bg-blue-400/12 text-blue-100"
          : "border-blue-200 bg-blue-50 text-blue-700"
        : isDark
          ? "border-white/12 bg-white/[0.05] text-slate-200"
          : "border-slate-200 bg-slate-100 text-slate-600";
  const refreshBadge = isDark
    ? "border-blue-400/20 bg-blue-400/10 text-blue-100"
    : "border-blue-200 bg-blue-50 text-blue-700";

  return (
    <div
      className={`pointer-events-auto absolute left-2.5 z-[510] max-w-[calc(100vw-1.25rem)] sm:left-3 animate-in fade-in slide-in-from-bottom-3 duration-300 motion-reduce:animate-none ${
        isCompactDensity ? "w-[13.5rem] sm:w-[14.25rem]" : "w-[16rem] sm:w-[17rem]"
      }`}
      style={{
        bottom: isCompactDensity
          ? "max(3rem, calc(env(safe-area-inset-bottom, 0px) + 2rem))"
          : "max(3.5rem, calc(env(safe-area-inset-bottom, 0px) + 2.4rem))",
      }}
    >
      <div
        className={`bd-glass-card--map rounded-2xl ${
          isCompactDensity ? "p-2 sm:p-2.5" : "p-2 sm:p-2.5"
        } ${cardTextTone}`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] ${secondaryText}`}
          >
            <MapPin className="h-3.5 w-3.5" />
            Route
          </div>
          <div className="flex items-center gap-1">
            <button
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${secondaryText} hover:opacity-80`}
              onClick={() => setRouteExpanded((value) => !value)}
              aria-expanded={routeExpanded}
              aria-label="Toggle route steps"
              type="button"
            >
              {routeExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </button>
            {onDismiss ? (
              <button
                className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${secondaryText} hover:opacity-80`}
                onClick={onDismiss}
                type="button"
                aria-label="Close route preview"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className={`mt-2 flex ${isCompactDensity ? "gap-1" : "gap-1.5"}`}>
          {routeOptions.map((route) => {
            const isActive = route.id === selectedRoute.id;
            return (
              <button
                key={route.id}
                className={`flex flex-1 flex-col items-center justify-center rounded-lg text-center transition-colors ${
                  isCompactDensity
                    ? "min-h-[26px] px-1 py-1 text-[9px]"
                    : "min-h-[32px] px-1.5 py-1 text-[10px] sm:min-h-[34px] sm:text-[11px]"
                } ${isActive ? activeRoute : inactiveRoute}`}
                onClick={() => onSelectRoute(route.id)}
                type="button"
              >
                {/*
                  Pass 13 (audit AI) — KI-162-reopen / KI-169 second-half closure.
                  Pass 175 added "N min" suffix at shopDirectoryNavigationDerived.ts:173
                  and ShopDirectoryGuidanceCard.tsx:291 but missed this third render
                  site (co-worker AI Pass 11 T-C surfaced the partial application).
                  Without the space + " min" suffix, the duration value rendered as
                  "{N}m" — a duration formatted as if it were distance — while the
                  sibling `route.totalDistanceLabel` below renders miles. Two
                  siblings, two unit semantics, top one mislabeled. This is the
                  upstream display-side cause of KI-169's "1005m / 853.4 mi" mixed
                  units bug; the route-engine sanity-clamp shipped in Pass 179
                  closed the data-side half.
                */}
                <span className="block font-semibold">
                  {route.estimatedDurationMinutes} min
                </span>
                <span
                  className={`block text-[10px] ${isActive ? routeSubtextActive : routeSubtext}`}
                >
                  {route.totalDistanceLabel}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${routeSourceBadge}`}
          >
            <Route className="h-3 w-3" />
            {routeSourceLabel}
          </span>
          {isLoadingRoute ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${refreshBadge}`}
            >
              <LoaderCircle className="h-3 w-3 animate-spin motion-reduce:animate-none" />
              Refreshing
            </span>
          ) : null}
        </div>

        <div
          className={`mt-2 flex items-center justify-between text-[11px] sm:text-xs ${secondaryText}`}
        >
          <span className="truncate pr-2">
            {isArrivedForSelectedShop
              ? `You made it to ${selectedShop.name}`
              : `${selectedOrigin.name} → ${selectedShop.name}`}
          </span>
          <span
            className={`ml-2 whitespace-nowrap font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
          >
            {isArrivedForSelectedShop
              ? "Here • Arrived"
              : distanceLabel && etaLabel
                ? `${distanceLabel} • ${etaLabel}`
                : ""}
          </span>
        </div>

        {routeError ? (
          <div
            className={`mt-2 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${
              isDark
                ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div className="flex-1">
              <p className="leading-5">
                Using estimated route — live directions temporarily unavailable
              </p>
              {onRetryRoute && !isLoadingRoute ? (
                <button
                  type="button"
                  onClick={onRetryRoute}
                  className={`mt-1.5 inline-flex min-h-[32px] items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                    isDark
                      ? "border-amber-400/30 bg-amber-400/15 text-amber-100 hover:bg-amber-400/25"
                      : "border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }`}
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry live route
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {isArrivedForSelectedShop ? (
          <div
            className={`mt-3 rounded-xl border px-3 py-2.5 text-xs ${
              isDark
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            Trip complete. You can restart guidance any time from this shop card.
          </div>
        ) : routeExpanded ? (
          <div className={`mt-3 max-h-44 space-y-2 overflow-y-auto border-t pt-3 ${divider}`}>
            {selectedRoute.instructions.map((instruction, index) => (
              <div key={instruction.id} className="flex gap-2 text-xs">
                <div
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: selectedRoute.accentColor }}
                >
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <p className={`font-medium ${isDark ? "text-white" : "text-slate-800"}`}>
                    {instruction.title}
                  </p>
                  <p className={secondaryText}>
                    {instruction.durationMinutes > 0
                      ? `${instruction.durationMinutes} min`
                      : instruction.distanceLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {onStartNavigation || onRequestEstimate ? (
          <div className="mt-2 flex gap-2">
            {onRequestEstimate ? (
              <button
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  isCompactDensity
                    ? "min-h-[38px] px-2.5 py-2 text-[11px]"
                    : "min-h-[44px] px-3 py-2 text-xs"
                } ${
                  isDark
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                onClick={() => onRequestEstimate(selectedShop)}
                type="button"
              >
                <Send className="h-3.5 w-3.5" />
                Request Estimate
              </button>
            ) : null}
            {onStartNavigation ? (
              <button
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                  isCompactDensity
                    ? "min-h-[38px] px-2.5 py-2 text-[11px]"
                    : "min-h-[44px] px-3 py-2 text-xs"
                }`}
                onClick={onStartNavigation}
                type="button"
              >
                <Compass className="h-4 w-4" />
                {isArrivedForSelectedShop ? "Start Again" : directionsLabel || "Start Navigation"}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
