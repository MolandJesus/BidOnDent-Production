import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Compass,
  LoaderCircle,
  MapPin,
  Route,
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
  onDismiss?: () => void;
  directionsLabel?: string;
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
  onDismiss,
  directionsLabel,
}: ShopDirectoryRoutePreviewCardProps) {
  const [routeExpanded, setRouteExpanded] = useState(false);

  const glassPanel = isDark
    ? "border-blue-400/25 bg-slate-950/82 backdrop-blur-md text-white shadow-[0_0_24px_rgba(59,130,246,0.08)]"
    : "border-black/8 bg-white/88 backdrop-blur-md text-slate-800";
  const secondaryText = isDark ? "text-white/60" : "text-slate-500";
  const divider = isDark ? "border-white/10" : "border-black/8";
  const activeRoute = isDark
    ? "bg-slate-950 font-semibold text-white"
    : "bg-white font-semibold text-slate-800 shadow-sm";
  const inactiveRoute = isDark
    ? "bg-white/[0.06] text-white/70 hover:bg-white/[0.1]"
    : "bg-black/[0.04] text-slate-500 hover:bg-black/[0.08]";
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
      className="pointer-events-auto absolute left-3 z-[510] w-[16rem] max-w-[calc(100vw-1.5rem)] sm:left-4 sm:w-[17rem]"
      style={{ bottom: "max(3.5rem, calc(env(safe-area-inset-bottom, 0px) + 2.4rem))" }}
    >
      <div className={`rounded-2xl border p-2 shadow-2xl sm:p-2.5 ${glassPanel}`}>
        <div className="flex items-center justify-between">
          <div
            className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] ${secondaryText}`}
          >
            <MapPin className="h-3.5 w-3.5" />
            Route
          </div>
          <div className="flex items-center gap-1">
            <button
              className={`rounded-full p-1 transition-colors ${secondaryText} hover:opacity-80`}
              onClick={() => setRouteExpanded((value) => !value)}
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
                className={`rounded-full p-1 transition-colors ${secondaryText} hover:opacity-80`}
                onClick={onDismiss}
                type="button"
                aria-label="Close route preview"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-2 flex gap-1.5">
          {routeOptions.map((route) => {
            const isActive = route.id === selectedRoute.id;
            return (
              <button
                key={route.id}
                className={`flex min-h-[32px] flex-1 flex-col items-center justify-center rounded-lg px-1.5 py-1 text-center text-[10px] transition-colors sm:min-h-[34px] sm:text-[11px] ${isActive ? activeRoute : inactiveRoute}`}
                onClick={() => onSelectRoute(route.id)}
                type="button"
              >
                <span className="block font-semibold">{route.estimatedDurationMinutes}m</span>
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
              <LoaderCircle className="h-3 w-3 animate-spin" />
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
            <p className="leading-5">
              Using estimated route — live directions temporarily unavailable
            </p>
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

        {onStartNavigation ? (
          <button
            className="mt-2 flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
            onClick={onStartNavigation}
            type="button"
          >
            <Compass className="h-4 w-4" />
            {isArrivedForSelectedShop ? "Start Again" : directionsLabel || "Start Navigation"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
