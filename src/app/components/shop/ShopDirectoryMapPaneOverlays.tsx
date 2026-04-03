import {
  Compass,
  LoaderCircle,
  MapPin,
  Radio,
  Route,
  Search,
  Shield,
  Sparkles,
  Star,
  TriangleAlert,
  X,
} from "lucide-react";
import type { NavigationSessionStatus } from "../../features/navigation";
import MapPaneLegendPanel from "./MapPaneLegendPanel";

import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { MapTheme, Place, RouteOption } from "../../types/mapDomain";
import { getRoleLabel } from "./MapLibreShopDirectoryViewportManager";

/* ── Props ──────────────────────────────────────────────────────────── */
type HeaderBadgesProps = {
  isDark: boolean;
  userType: MarketUserType;
  selectedOrigin?: Place | null;
  shopCount: number;
};

type BottomOverlayProps = {
  isDark: boolean;
  selectedShop: ShopMapListing | null;
  selectedRoute: RouteOption | null;
  hasArrived?: boolean;
  onOpenShopDirections?: (shop: ShopMapListing) => void;
  onStartNavigation?: (shop: ShopMapListing) => void;
  canStartNavigation?: boolean;
  directionsActionLabel?: string;
  hasLiveNavigation?: boolean;
  navigationSessionStatus?: NavigationSessionStatus;
  remainingEtaLabel?: string | null;
  remainingDistanceLabel?: string | null;
  usingLiveRoutes?: boolean;
  routeError?: string;
  isLoadingRoute?: boolean;
  /** When true, hide the shop card (e.g. route preview overlay is showing) — legend only */
  compact?: boolean;
  showSavedPlaces?: boolean;
  onToggleSavedPlaces?: () => void;
  showReports?: boolean;
  onToggleReports?: () => void;
  reportCount?: number | null;
  showRoutes?: boolean;
  onToggleRoutes?: () => void;
  reportStatusFilter?: string;
  onReportStatusFilterChange?: (status: string) => void;
  density?: "default" | "compact";
};

type SearchPillsProps = {
  isDark: boolean;
  hasPanned: boolean;
  searchWithinViewport?: boolean;
  onSearchInArea?: () => void;
  onClearAreaSearch?: () => void;
  onClearPan: () => void;
  density?: "default" | "compact";
};

/* ── Theme tokens (shared between header + bottom) ──────────────────── */
/**
 * Premium glass tokens aligned with the landing-page mapSurfaceTheme
 * design language (blue-accented gradients, royal blue shadow palette).
 */
function useOverlayTokens(isDark: boolean) {
  return {
    badgeCard: isDark
      ? "border-blue-300/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.84),rgba(15,23,42,0.76))] text-white shadow-xl backdrop-blur-2xl"
      : "border-slate-200/78 bg-[linear-gradient(180deg,rgba(248,250,252,0.84),rgba(226,232,240,0.76))] text-slate-800 shadow-xl backdrop-blur-2xl",
    badgeLabel: isDark ? "text-slate-400" : "text-slate-500",
    badgeValue: isDark ? "text-white" : "text-slate-800",
    topGradient: isDark
      ? "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_40%),linear-gradient(180deg,rgba(2,6,23,0.62)_0%,rgba(2,6,23,0.18)_50%,transparent_100%)]"
      : "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.10),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.06)_50%,transparent_100%)]",
    bottomGradient: isDark
      ? "bg-[linear-gradient(0deg,rgba(2,6,23,0.82)_0%,rgba(15,23,42,0.38)_45%,transparent_100%)]"
      : "bg-[linear-gradient(0deg,rgba(226,232,240,0.68)_0%,rgba(248,250,252,0.22)_45%,transparent_100%)]",
    shopCardCls: isDark
      ? "border-blue-200/22 bg-[linear-gradient(180deg,rgba(30,58,138,0.34),rgba(15,23,42,0.82))] text-white shadow-[0_26px_64px_rgba(2,6,23,0.32)] backdrop-blur-2xl"
      : "border-slate-200/82 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(226,232,240,0.78))] text-slate-800 shadow-[0_26px_64px_rgba(15,23,42,0.12)] backdrop-blur-2xl",
    shopCardSecondary: isDark ? "text-slate-200" : "text-slate-500",
    shopCardMeta: isDark ? "text-slate-300" : "text-slate-500",
    shopCardScore: isDark
      ? "bg-[linear-gradient(180deg,rgba(37,99,235,0.36),rgba(15,23,42,0.88))] border border-blue-300/25 text-white"
      : "bg-[linear-gradient(180deg,rgba(239,246,255,0.84),rgba(219,234,254,0.72))] border border-sky-200/70 text-slate-800",
    shopCardScoreLabel: isDark ? "text-blue-200/70" : "text-sky-600",
    shopCardCta: isDark
      ? "border-blue-300/30 bg-blue-300 text-slate-950 shadow-[0_14px_26px_rgba(59,130,246,0.24)] hover:-translate-y-0.5 hover:bg-blue-200"
      : "border-blue-300/40 bg-[linear-gradient(180deg,rgba(59,130,246,0.82),rgba(29,78,216,0.88))] text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 hover:brightness-110",
  };
}

/* ── Header badges (top gradient) ───────────────────────────────────── */
export function MapPaneHeaderBadges({
  isDark,
  userType,
  selectedOrigin,
  shopCount,
}: HeaderBadgesProps) {
  const t = useOverlayTokens(isDark);

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-[500] ${t.topGradient} px-2 py-1.5 @xl:px-2.5 @xl:py-2 @3xl:px-4 @3xl:py-3`}
    >
      <div className="flex flex-wrap items-start justify-between gap-1.5">
        <div className={`rounded-lg border px-2 py-1.5 ${t.badgeCard}`}>
          <div
            className={`flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] ${t.badgeLabel}`}
          >
            <Sparkles className="h-2.5 w-2.5" />
            {getRoleLabel(userType)}
          </div>
          <p className={`mt-0.5 text-[11px] font-medium ${t.badgeValue}`}>
            {selectedOrigin ? `Centered on ${selectedOrigin.name}` : "Exploring the service area"}
          </p>
        </div>

        <div className={`rounded-lg border px-2 py-1.5 text-right ${t.badgeCard}`}>
          <p className={`text-[9px] uppercase tracking-[0.2em] ${t.badgeLabel}`}>Shops</p>
          <p className={`text-sm @xl:text-base font-semibold leading-tight ${t.badgeValue}`}>
            {shopCount}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Bottom overlay: selected shop card + legend ────────────────────── */
export function MapPaneBottomOverlay({
  isDark,
  selectedShop,
  selectedRoute,
  hasArrived = false,
  onOpenShopDirections,
  onStartNavigation,
  canStartNavigation = false,
  directionsActionLabel,
  hasLiveNavigation = false,
  navigationSessionStatus = "idle",
  remainingEtaLabel,
  remainingDistanceLabel,
  usingLiveRoutes = false,
  routeError = "",
  isLoadingRoute = false,
  compact,
  showSavedPlaces,
  onToggleSavedPlaces,
  showReports,
  onToggleReports,
  reportCount,
  showRoutes,
  onToggleRoutes,
  reportStatusFilter = "all",
  onReportStatusFilterChange,
  density = "default",
}: BottomOverlayProps) {
  const t = useOverlayTokens(isDark);
  const isCompactDensity = density === "compact";
  const sessionBadgeClass = hasArrived
    ? isDark
      ? "border-emerald-400/30 bg-emerald-400/12 text-emerald-100"
      : "border-emerald-200 bg-emerald-50 text-emerald-700"
    : navigationSessionStatus === "paused"
      ? isDark
        ? "border-amber-400/30 bg-amber-400/12 text-amber-100"
        : "border-amber-200 bg-amber-50 text-amber-700"
      : isDark
        ? "border-emerald-400/30 bg-emerald-400/12 text-emerald-100"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";
  const routeSourceBadgeClass = routeError
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
  const routeSourceLabel = routeError
    ? "Route estimate"
    : hasArrived
      ? "Trip complete"
      : usingLiveRoutes
        ? "Live route"
        : "Estimated route";
  const etaLabel = hasArrived
    ? "Arrived"
    : remainingEtaLabel || (selectedRoute ? `${selectedRoute.estimatedDurationMinutes} min` : null);
  const distanceLabel = hasArrived
    ? "Here"
    : remainingDistanceLabel ||
      selectedRoute?.totalDistanceLabel ||
      selectedShop?.mapDistanceLabel ||
      null;

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-[500] ${t.bottomGradient} px-2 pt-6 @lg:px-3 @lg:pt-8 @3xl:px-5 @3xl:pt-12`}
      style={{
        paddingBottom: compact
          ? "max(4.75rem, calc(env(safe-area-inset-bottom, 0px) + 3.75rem))"
          : "max(1rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        className={`flex flex-wrap items-end ${compact ? "justify-end" : "justify-between"} ${
          isCompactDensity ? "gap-1.5 @xl:gap-2" : "gap-2 @xl:gap-3"
        }`}
      >
        {selectedShop && !compact && (
          <div
            className={`w-full max-w-[calc(100vw-1.5rem)] rounded-2xl border ${isCompactDensity ? "p-2 @xl:max-w-[15rem] @3xl:max-w-[16.5rem]" : "p-2 @lg:p-2.5 @3xl:p-3 @xl:max-w-sm @3xl:max-w-md"} ${t.shopCardCls}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3
                  className={`truncate font-semibold ${isCompactDensity ? "text-[13px] @xl:text-sm @3xl:text-base" : "text-sm @xl:text-base @3xl:text-lg"} ${isDark ? "text-white" : "text-slate-800"}`}
                >
                  {selectedShop.name}
                </h3>
                {selectedShop.mapResult?.city ? (
                  <p
                    className={`mt-0.5 truncate ${isCompactDensity ? "text-[11px]" : "text-xs"} ${isDark ? "text-slate-400/70" : "text-slate-400"}`}
                  >
                    {[selectedShop.mapResult?.city, selectedShop.mapResult?.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : null}
              </div>
              <div
                className={`shrink-0 text-center ${isCompactDensity ? "rounded-lg px-1.5 py-1" : "rounded-lg px-1.5 py-1 @xl:rounded-xl @xl:px-2 @xl:py-1.5"} ${t.shopCardScore}`}
              >
                <p
                  className={`${isCompactDensity ? "text-[8px] @xl:text-[9px]" : "text-[9px] @xl:text-[10px]"} uppercase tracking-[0.16em] ${t.shopCardScoreLabel}`}
                >
                  AI Fit
                </p>
                <p
                  className={`${isCompactDensity ? "text-xs @xl:text-sm" : "text-sm @xl:text-base"} font-semibold`}
                >
                  {selectedShop.recommendationScore}%
                </p>
              </div>
            </div>

            <div className="mt-1 @xl:mt-2 flex flex-wrap gap-1">
              {hasLiveNavigation ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${sessionBadgeClass}`}
                >
                  <Radio className="h-3 w-3" />
                  {navigationSessionStatus === "paused" ? "Paused route" : "Live guidance"}
                </span>
              ) : hasArrived ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${sessionBadgeClass}`}
                >
                  <Radio className="h-3 w-3" />
                  Arrived
                </span>
              ) : null}
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${routeSourceBadgeClass}`}
              >
                <Route className="h-3 w-3" />
                {routeSourceLabel}
              </span>
              {isLoadingRoute ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    isDark
                      ? "border-blue-400/20 bg-blue-400/10 text-blue-100"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  <LoaderCircle className="h-3 w-3 animate-spin" />
                  Refreshing
                </span>
              ) : null}
            </div>

            <div
              className={`mt-1.5 flex flex-wrap items-center gap-y-0.5 ${isCompactDensity ? "gap-x-1.5 text-[11px] @xl:text-xs" : "gap-x-2 text-xs @xl:text-sm @xl:gap-x-3"} ${t.shopCardSecondary}`}
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPin className={`h-4 w-4 ${t.shopCardMeta}`} />
                {distanceLabel || selectedShop.mapDistanceLabel}
              </span>
              {etaLabel ? (
                <span className="inline-flex items-center gap-1.5">
                  <Compass className={`h-4 w-4 ${t.shopCardMeta}`} />
                  {etaLabel}
                </span>
              ) : null}
              {selectedShop.rating > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star className={`h-3.5 w-3.5 fill-current ${t.shopCardMeta}`} />
                  {selectedShop.rating.toFixed(1)}
                </span>
              )}
              {selectedShop.insuranceCompatibilityScore > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Shield className={`h-4 w-4 ${t.shopCardMeta}`} />
                  {selectedShop.insuranceCompatibilityScore}% carrier
                </span>
              )}
            </div>

            <p
              className={`mt-1.5 hidden @3xl:block ${isCompactDensity ? "text-[11px] leading-[1.15rem]" : "text-xs leading-5"} ${t.shopCardSecondary}`}
            >
              {hasArrived
                ? "You made it to this shop. The trip is complete, and you can restart directions whenever you need."
                : selectedShop.aiSummary}
            </p>

            {routeError ? (
              <div
                className={`mt-2 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm ${
                  isDark
                    ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="leading-5">
                  Using estimated route — live directions temporarily unavailable
                </p>
              </div>
            ) : null}

            {onOpenShopDirections && (
              <button
                type="button"
                onClick={() => {
                  if (canStartNavigation && onStartNavigation) {
                    onStartNavigation(selectedShop);
                    return;
                  }

                  onOpenShopDirections(selectedShop);
                }}
                className={`pointer-events-auto mt-1.5 @xl:mt-2 inline-flex w-full items-center justify-center rounded-xl border font-semibold transition-colors ${isCompactDensity ? "min-h-[34px] gap-1 px-2 py-1 text-[10px] @xl:text-[11px]" : "min-h-[36px] gap-1 px-2 py-1 @xl:gap-1.5 @xl:px-2.5 @xl:py-1.5 text-[11px] @xl:text-xs"} ${t.shopCardCta}`}
              >
                <Compass className="h-3.5 w-3.5" />
                {hasArrived
                  ? "Start Again"
                  : directionsActionLabel ||
                    (canStartNavigation ? "Start Navigation" : "Get Directions")}
              </button>
            )}
          </div>
        )}

        <MapPaneLegendPanel
          isDark={isDark}
          showSavedPlaces={showSavedPlaces}
          onToggleSavedPlaces={onToggleSavedPlaces}
          showReports={showReports}
          onToggleReports={onToggleReports}
          reportCount={reportCount}
          showRoutes={showRoutes}
          onToggleRoutes={onToggleRoutes}
          reportStatusFilter={reportStatusFilter}
          onReportStatusFilterChange={onReportStatusFilterChange}
          density={density}
        />
      </div>
    </div>
  );
}

/* ── Search area pills (top floating) ───────────────────────────────── */
export function MapPaneSearchPills({
  isDark,
  hasPanned,
  searchWithinViewport,
  onSearchInArea,
  onClearAreaSearch,
  onClearPan,
  density = "default",
}: SearchPillsProps) {
  const isCompactDensity = density === "compact";
  if (onSearchInArea && hasPanned && !searchWithinViewport) {
    return (
      <div
        className={`pointer-events-none absolute inset-x-0 z-[600] flex justify-center ${
          isCompactDensity ? "top-2" : "top-3"
        }`}
      >
        <button
          type="button"
          onClick={onSearchInArea}
          className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full border font-semibold shadow-[0_16px_36px_rgba(15,23,42,0.14)] backdrop-blur-2xl transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
            isCompactDensity
              ? "min-h-[34px] px-3 py-1.5 text-[10px]"
              : "min-h-[44px] px-4 py-2.5 text-xs"
          } ${
            isDark
              ? "border-blue-200/16 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(30,41,59,0.74))] text-slate-100 hover:-translate-y-0.5 hover:bg-[linear-gradient(180deg,rgba(30,58,138,0.38),rgba(30,41,59,0.82))] hover:text-white"
              : "border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(241,245,249,0.72))] text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:bg-white/90 hover:text-slate-950"
          }`}
        >
          <Search className="h-3 w-3" />
          Search this area
        </button>
      </div>
    );
  }

  if (onClearAreaSearch && searchWithinViewport) {
    return (
      <div
        className={`pointer-events-none absolute inset-x-0 z-[600] flex justify-center ${
          isCompactDensity ? "top-2" : "top-3"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            onClearAreaSearch();
            onClearPan();
          }}
          className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full border font-semibold shadow-[0_14px_26px_rgba(59,130,246,0.24)] backdrop-blur-2xl transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
            isCompactDensity
              ? "min-h-[34px] px-3 py-1.5 text-[10px]"
              : "min-h-[44px] px-4 py-2.5 text-xs"
          } ${
            isDark
              ? "border-blue-300/30 bg-blue-300 text-slate-950 hover:-translate-y-0.5 hover:bg-blue-200"
              : "border-blue-300/40 bg-[linear-gradient(180deg,rgba(59,130,246,0.82),rgba(29,78,216,0.88))] text-white hover:-translate-y-0.5 hover:brightness-110"
          }`}
        >
          <X className="h-3 w-3" />
          Area active
        </button>
      </div>
    );
  }

  return null;
}
