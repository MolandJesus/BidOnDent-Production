/**
 * ShopDirectoryMapPopup — Map popup rendered when a shop marker is clicked.
 * Shows shop info, route badges, AI/carrier fit scores, route summary, and CTA.
 *
 * Extracted from MapLibreShopDirectoryMapPane to enforce file-size limits.
 */
import { Compass, Eye, LoaderCircle, Radio, Route, Send, TriangleAlert } from "lucide-react";
import { Popup } from "react-map-gl/maplibre";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { NavigationSessionStatus } from "../../features/navigation";
import {
  getShopRouteActionLabel,
  shouldUseShopNavigationAction,
} from "../../hooks/shopDirectorySessionUtils";
import type { MapTheme, Place, RouteOption } from "../../types/mapDomain";

type ShopDirectoryMapPopupProps = {
  shopPopup: { lng: number; lat: number; shop: ShopMapListing };
  onClose: () => void;
  mapTheme: MapTheme;
  selectedShop: ShopMapListing | null;
  selectedOrigin?: Place | null;
  selectedRoute: RouteOption | null;
  navigationSessionStatus: NavigationSessionStatus;
  navigationSessionDestinationId: string | null;
  directionsActionLabel?: string;
  hasArrived?: boolean;
  remainingEtaLabel?: string | null;
  remainingDistanceLabel?: string | null;
  usingLiveRoutes?: boolean;
  routeError?: string;
  isLoadingRoute?: boolean;
  onOpenShopDirections?: (shop: ShopMapListing) => void;
  onStartNavigation?: (shop: ShopMapListing) => void;
  onViewDetails?: (shop: ShopMapListing) => void;
  onRequestEstimate?: (shop: ShopMapListing) => void;
  compact?: boolean;
};

export default function ShopDirectoryMapPopup({
  shopPopup,
  onClose,
  mapTheme,
  selectedShop,
  selectedOrigin,
  selectedRoute,
  navigationSessionStatus,
  navigationSessionDestinationId,
  directionsActionLabel,
  hasArrived = false,
  remainingEtaLabel,
  remainingDistanceLabel,
  usingLiveRoutes = false,
  routeError = "",
  isLoadingRoute = false,
  onOpenShopDirections,
  onStartNavigation,
  onViewDetails,
  onRequestEstimate,
  compact = false,
}: ShopDirectoryMapPopupProps) {
  const isDark = mapTheme === "dark";
  const actionButtonClassName = compact
    ? "inline-flex min-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-1.5 text-[11px] font-semibold transition-colors"
    : "inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm font-semibold transition-colors";

  /* ── Popup-specific derived state ─────────────────────────────────── */
  const popupRouteReady = Boolean(
    onStartNavigation && selectedOrigin && selectedRoute && shopPopup.shop.id === selectedShop?.id
  );
  const popupHasArrived = Boolean(
    hasArrived && selectedShop && shopPopup.shop.id === selectedShop.id
  );
  const popupActionLabel = getShopRouteActionLabel({
    shopId: shopPopup.shop.id,
    routeReady: popupRouteReady,
    hasArrived: popupHasArrived,
    defaultLabel: directionsActionLabel || "Get Directions",
    navigationSessionStatus,
    navigationSessionDestinationId,
  });
  const shouldUsePopupNavigationAction = Boolean(
    onStartNavigation &&
      shouldUseShopNavigationAction({
        shopId: shopPopup.shop.id,
        routeReady: popupRouteReady,
        navigationSessionStatus,
        navigationSessionDestinationId,
      })
  );
  const popupHasLiveNavigation = Boolean(
    navigationSessionDestinationId === String(shopPopup.shop.id) &&
      (navigationSessionStatus === "active" || navigationSessionStatus === "paused")
  );

  /* ── Theme tokens (aligned with landing-page glass language) ──────── */
  const popupTitle = isDark ? "text-white" : "text-slate-800";
  const popupSub = isDark ? "text-slate-200" : "text-slate-500";
  const popupScoreCard = isDark
    ? "border-blue-300/25 bg-[linear-gradient(180deg,rgba(37,99,235,0.26),rgba(15,23,42,0.82))] text-slate-200"
    : "border-sky-200/70 bg-[linear-gradient(180deg,rgba(239,246,255,0.84),rgba(219,234,254,0.72))] text-slate-500";
  const popupScoreValue = isDark ? "text-white" : "text-slate-800";
  const popupCarrierCard = isDark
    ? "border-emerald-300/35 bg-emerald-900/42 text-emerald-200"
    : "border-emerald-200 bg-emerald-50 text-emerald-600";
  const popupCarrierValue = isDark ? "text-emerald-200" : "text-emerald-800";
  const popupCta = isDark
    ? "border-blue-300/30 bg-blue-300 text-slate-950 shadow-[0_10px_20px_rgba(59,130,246,0.24)] hover:-translate-y-0.5 hover:bg-blue-200"
    : "border-blue-300/40 bg-[linear-gradient(180deg,rgba(59,130,246,0.82),rgba(29,78,216,0.88))] text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 hover:brightness-110";
  const badgeBase =
    "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]";
  const sessionBadge =
    navigationSessionStatus === "paused"
      ? isDark
        ? "border-amber-400/30 bg-amber-400/12 text-amber-100"
        : "border-amber-200 bg-amber-50 text-amber-700"
      : isDark
        ? "border-emerald-400/30 bg-emerald-400/12 text-emerald-100"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";
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
  const routeSourceLabel = hasArrived
    ? "Trip complete"
    : routeError
      ? "Preview fallback"
      : usingLiveRoutes
        ? "Live route"
        : "Local preview";
  const etaLabel = hasArrived
    ? "Arrived"
    : remainingEtaLabel || (selectedRoute ? `${selectedRoute.estimatedDurationMinutes} min` : null);
  const distanceLabel = hasArrived
    ? "Here"
    : remainingDistanceLabel || selectedRoute?.totalDistanceLabel || null;

  return (
    <Popup
      longitude={shopPopup.lng}
      latitude={shopPopup.lat}
      anchor="bottom"
      offset={14}
      closeOnClick={false}
      onClose={onClose}
      maxWidth={compact ? "264px" : "320px"}
    >
      <div className={compact ? "space-y-1.5" : "space-y-2"}>
        <div>
          <p className={`truncate ${compact ? "text-sm" : ""} font-semibold ${popupTitle}`}>
            {shopPopup.shop.name}
          </p>
          <p className={`truncate ${compact ? "text-xs" : "text-sm"} ${popupSub}`}>
            {shopPopup.shop.mapResult.address}, {shopPopup.shop.mapResult.city}
          </p>
          {shopPopup.shop.rating > 0 && (
            <p className={`mt-0.5 ${compact ? "text-[11px]" : "text-xs"} ${popupSub}`}>
              ★ {shopPopup.shop.rating.toFixed(1)}
              {shopPopup.shop.reviews > 0 && (
                <span className="ml-1 opacity-70">({shopPopup.shop.reviews})</span>
              )}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {popupHasLiveNavigation ? (
            <span className={`${badgeBase} ${sessionBadge}`}>
              <Radio className="h-3 w-3" />
              {navigationSessionStatus === "paused" ? "Paused route" : "Live guidance"}
            </span>
          ) : popupHasArrived ? (
            <span className={`${badgeBase} ${sessionBadge}`}>
              <Radio className="h-3 w-3" />
              Arrived
            </span>
          ) : null}
          <span className={`${badgeBase} ${routeSourceBadge}`}>
            <Route className="h-3 w-3" />
            {routeSourceLabel}
          </span>
          {isLoadingRoute ? (
            <span className={`${badgeBase} ${refreshBadge}`}>
              <LoaderCircle className="h-3 w-3 animate-spin" />
              Refreshing
            </span>
          ) : null}
        </div>
        <div className={`grid grid-cols-2 ${compact ? "gap-1.5 text-xs" : "gap-2 text-sm"}`}>
          <div
            className={`rounded-xl border px-3 py-2 ${shopPopup.shop.insuranceCompatibilityScore > 0 ? "" : "col-span-2"} ${popupScoreCard}`}
          >
            <p>AI fit</p>
            <p className={`font-semibold ${popupScoreValue}`}>
              {shopPopup.shop.recommendationScore}%
            </p>
          </div>
          {shopPopup.shop.insuranceCompatibilityScore > 0 && (
            <div className={`rounded-xl border px-3 py-2 ${popupCarrierCard}`}>
              <p>Carrier fit</p>
              <p className={`font-semibold ${popupCarrierValue}`}>
                {shopPopup.shop.insuranceCompatibilityScore}%
              </p>
            </div>
          )}
        </div>
        {selectedRoute ? (
          <div className={`grid grid-cols-2 ${compact ? "gap-1.5 text-xs" : "gap-2 text-sm"}`}>
            <div className={`rounded-xl border px-3 py-2 ${popupScoreCard}`}>
              <p>Route</p>
              <p className={`font-semibold ${popupScoreValue}`}>{selectedRoute.label}</p>
            </div>
            <div className={`rounded-xl border px-3 py-2 ${popupScoreCard}`}>
              <p>Trip</p>
              <p className={`font-semibold ${popupScoreValue}`}>
                {[distanceLabel, etaLabel].filter(Boolean).join(" • ") || "Preview"}
              </p>
            </div>
          </div>
        ) : null}
        {routeError ? (
          <div
            className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${
              isDark
                ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p className="leading-5">{routeError}</p>
          </div>
        ) : null}
        <div className="flex gap-2">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(shopPopup.shop)}
              className={`${actionButtonClassName} ${
                isDark
                  ? "border-white/15 bg-white/[0.06] text-slate-200 hover:bg-white/10"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Details
            </button>
          )}
          {onRequestEstimate && (
            <button
              type="button"
              onClick={() => onRequestEstimate(shopPopup.shop)}
              className={`${actionButtonClassName} ${
                isDark
                  ? "border-blue-400/25 bg-blue-600/20 text-blue-200 hover:bg-blue-600/30"
                  : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              Estimate
            </button>
          )}
          {onOpenShopDirections && (
            <button
              type="button"
              onClick={() => {
                if (shouldUsePopupNavigationAction && onStartNavigation) {
                  onStartNavigation(shopPopup.shop);
                  return;
                }

                onOpenShopDirections(shopPopup.shop);
              }}
              className={`${compact ? "inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-xs font-semibold transition-colors" : "inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors"} ${popupCta}`}
            >
              <Compass className="h-3.5 w-3.5" />
              {popupHasArrived ? "Start Again" : popupActionLabel}
            </button>
          )}
        </div>
      </div>
    </Popup>
  );
}
