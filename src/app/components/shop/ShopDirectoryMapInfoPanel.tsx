/**
 * ShopDirectoryMapInfoPanel — Left-side panel for selected shop details.
 * Replaces the on-map popup in immersive mode. Shows empty state
 * when no shop is selected.
 *
 * Mobile (<sm): hidden — existing MapPaneBottomOverlay handles shop info.
 * Desktop (sm+): fixed left panel (300px).
 */
import { useEffect, useRef, useState } from "react";
import { ChevronRight, Compass, Eye, MapPin, Route, Send, Star, X } from "lucide-react";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { NavigationSessionStatus } from "../../features/navigation";
import type { MapTheme, Place, RouteOption } from "../../types/mapDomain";
import {
  getShopRouteActionLabel,
  shouldUseShopNavigationAction,
} from "../../hooks/shopDirectorySessionUtils";

type ShopDirectoryMapInfoPanelProps = {
  shop: ShopMapListing | null;
  mapTheme: MapTheme;
  selectedRoute: RouteOption | null;
  selectedOrigin?: Place | null;
  navigationSessionStatus: NavigationSessionStatus;
  navigationSessionDestinationId: string | null;
  directionsActionLabel?: string;
  hasArrived?: boolean;
  remainingEtaLabel?: string | null;
  remainingDistanceLabel?: string | null;
  onOpenShopDirections?: (shop: ShopMapListing) => void;
  onStartNavigation?: (shop: ShopMapListing) => void;
  onViewDetails?: (shop: ShopMapListing) => void;
  onRequestEstimate?: (shop: ShopMapListing) => void;
  /** Hide the directions/navigation CTA (e.g. when route preview card is visible below) */
  hideDirectionsCta?: boolean;
};

export default function ShopDirectoryMapInfoPanel({
  shop,
  mapTheme,
  selectedRoute,
  selectedOrigin,
  navigationSessionStatus,
  navigationSessionDestinationId,
  directionsActionLabel,
  hasArrived = false,
  remainingEtaLabel,
  remainingDistanceLabel,
  onOpenShopDirections,
  onStartNavigation,
  onViewDetails,
  onRequestEstimate,
  hideDirectionsCta = false,
}: ShopDirectoryMapInfoPanelProps) {
  const isDark = mapTheme === "dark";
  const [minimized, setMinimized] = useState(false);
  const prevShopIdRef = useRef<number | string | null>(null);

  // Auto-expand when a different shop is selected
  useEffect(() => {
    if (shop && shop.id !== prevShopIdRef.current) {
      setMinimized(false);
      prevShopIdRef.current = shop.id;
    }
  }, [shop]);

  const panelBg = isDark
    ? "border-[rgba(96,165,250,0.22)] bg-[linear-gradient(180deg,rgba(30,58,138,0.24)_0%,rgba(12,25,41,0.86)_100%)] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(196,144,65,0.22),inset_0_-1px_0_rgba(140,82,22,0.20),0_0_0_1px_rgba(96,165,250,0.18),0_22px_52px_rgba(2,6,23,0.46),0_0_56px_rgba(196,130,45,0.14)]"
    : "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.92),rgba(232,238,248,0.86))] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(252,240,208,0.85),0_18px_46px_rgba(15,23,42,0.14),0_0_0_1px_rgba(140,82,22,0.18)]";
  const titleCls = isDark ? "text-slate-100" : "text-slate-800";
  const subCls = isDark ? "text-slate-400" : "text-slate-500";

  /* ── Empty state ── */
  if (!shop) {
    return (
      <aside
        className={`pointer-events-auto absolute left-3 top-[8.5rem] z-[525] hidden w-[300px] rounded-2xl border shadow-2xl sm:block ${panelBg}`}
        role="complementary"
        aria-label="Shop info panel"
      >
        <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
          <div className={`mb-3 rounded-full p-3 ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`}>
            <MapPin className={`h-6 w-6 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
          </div>
          <p className={`text-sm font-semibold ${titleCls}`}>No shop selected</p>
          <p className={`mt-1 text-xs leading-5 ${subCls}`}>Tap a shop on the map to see details</p>
        </div>
      </aside>
    );
  }

  /* ── Theme tokens (selected state) ── */
  const scoreCard = isDark
    ? "border-white/15 bg-slate-900/72 text-slate-200"
    : "border-slate-200 bg-slate-50 text-slate-500";
  const scoreValue = isDark ? "text-white" : "text-slate-800";
  const carrierCard = isDark
    ? "border-emerald-300/35 bg-emerald-900/42 text-emerald-200"
    : "border-emerald-200 bg-emerald-50 text-emerald-600";
  const carrierValue = isDark ? "text-emerald-200" : "text-emerald-800";
  const ctaBtn = isDark
    ? "border-blue-300/55 bg-blue-600/42 text-white hover:bg-blue-600/55"
    : "border-blue-300/70 bg-blue-50 text-blue-700 hover:bg-blue-100";
  const detailBtn = isDark
    ? "border-white/15 bg-white/[0.06] text-slate-200 hover:bg-white/10"
    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100";

  /* ── Derived state ── */
  const routeReady = Boolean(onStartNavigation && selectedOrigin && selectedRoute);
  const actionLabel = getShopRouteActionLabel({
    shopId: shop.id,
    routeReady,
    hasArrived,
    defaultLabel: directionsActionLabel || "Get Directions",
    navigationSessionStatus,
    navigationSessionDestinationId,
  });
  const shouldUseNav = Boolean(
    onStartNavigation &&
      shouldUseShopNavigationAction({
        shopId: shop.id,
        routeReady,
        navigationSessionStatus,
        navigationSessionDestinationId,
      })
  );
  const etaLabel = hasArrived
    ? "Arrived"
    : remainingEtaLabel || (selectedRoute ? `${selectedRoute.estimatedDurationMinutes} min` : null);
  const distanceLabel = hasArrived
    ? "Here"
    : remainingDistanceLabel || selectedRoute?.totalDistanceLabel || shop.mapDistanceLabel || null;

  /* ── Minimized state — compact pill with shop name + expand button ── */
  if (minimized) {
    return (
      <aside
        className={`pointer-events-auto absolute left-3 top-[8.5rem] z-[525] hidden sm:block`}
        role="complementary"
        aria-label="Selected shop info (minimized)"
      >
        <button
          type="button"
          onClick={() => setMinimized(false)}
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-2xl border px-3 py-2 transition-colors ${panelBg} ${isDark ? "hover:bg-[linear-gradient(180deg,rgba(30,58,138,0.32)_0%,rgba(12,25,41,0.94)_100%)]" : "hover:bg-[linear-gradient(180deg,rgba(247,232,194,0.96),rgba(232,238,248,0.92))]"}`}
          aria-label={`Expand ${shop.name} info`}
        >
          <MapPin className={`h-4 w-4 shrink-0 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
          <span
            className={`max-w-[220px] text-sm font-semibold leading-snug line-clamp-2 ${titleCls}`}
          >
            {shop.name}
          </span>
          <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${subCls}`} />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={`pointer-events-auto absolute left-3 top-[8.5rem] z-[525] hidden max-h-[calc(100dvh-9.5rem)] w-[300px] overflow-y-auto rounded-2xl border shadow-2xl sm:block animate-in fade-in slide-in-from-left-3 duration-300 motion-reduce:animate-none ${panelBg}`}
      role="complementary"
      aria-label="Selected shop info"
    >
      <div className="space-y-3 p-4">
        {/* Header with close button */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className={`text-base font-semibold leading-snug ${titleCls}`}>{shop.name}</h3>
            <p className={`mt-0.5 text-xs ${subCls}`}>
              {shop.mapResult?.address ?? ""}
              {shop.mapResult?.city ? `, ${shop.mapResult.city}` : ""}
            </p>
            {shop.rating > 0 && (
              <p className={`mt-1 inline-flex items-center gap-1 text-xs ${subCls}`}>
                <Star className="h-3 w-3 fill-current text-amber-400" />
                {shop.rating.toFixed(1)}
                {shop.reviews > 0 && <span className="opacity-70">({shop.reviews})</span>}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMinimized(true)}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              isDark
                ? "text-slate-400 hover:bg-white/10 hover:text-white"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            }`}
            aria-label="Minimize shop info"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div
            className={`rounded-xl border px-3 py-2 ${shop.insuranceCompatibilityScore > 0 ? "" : "col-span-2"} ${scoreCard}`}
          >
            <p className="text-[11px]">AI fit</p>
            <p className={`font-semibold ${scoreValue}`}>{shop.recommendationScore}%</p>
          </div>
          {shop.insuranceCompatibilityScore > 0 && (
            <div className={`rounded-xl border px-3 py-2 ${carrierCard}`}>
              <p className="text-[11px]">Carrier fit</p>
              <p className={`font-semibold ${carrierValue}`}>{shop.insuranceCompatibilityScore}%</p>
            </div>
          )}
        </div>

        {/* Route meta */}
        {(distanceLabel || etaLabel) && (
          <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs ${subCls}`}>
            {distanceLabel && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {distanceLabel}
              </span>
            )}
            {etaLabel && (
              <span className="inline-flex items-center gap-1">
                <Route className="h-3 w-3" />
                {etaLabel}
              </span>
            )}
          </div>
        )}

        {/* AI summary */}
        <p className={`text-xs leading-5 ${subCls}`}>
          {hasArrived ? "You've arrived at this shop." : shop.aiSummary}
        </p>

        {/* CTAs */}
        <div className="space-y-2">
          <div className="flex gap-2">
            {onViewDetails && (
              <button
                type="button"
                onClick={() => onViewDetails(shop)}
                className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm font-semibold transition-colors ${detailBtn}`}
              >
                <Eye className="h-3.5 w-3.5" />
                Details
              </button>
            )}
            {onRequestEstimate && (
              <button
                type="button"
                onClick={() => onRequestEstimate(shop)}
                className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm font-semibold transition-colors ${
                  isDark
                    ? "border-blue-400/25 bg-blue-600/20 text-blue-200 hover:bg-blue-600/30"
                    : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                Estimate
              </button>
            )}
          </div>
          {onOpenShopDirections && !hideDirectionsCta && (
            <button
              type="button"
              onClick={() => {
                if (shouldUseNav && onStartNavigation) {
                  onStartNavigation(shop);
                  return;
                }
                onOpenShopDirections(shop);
              }}
              className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${ctaBtn}`}
            >
              <Compass className="h-3.5 w-3.5" />
              {hasArrived ? "Start Again" : actionLabel}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
