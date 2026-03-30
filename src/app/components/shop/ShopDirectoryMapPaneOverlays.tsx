import {
  Compass,
  LoaderCircle,
  MapPin,
  Radio,
  Route,
  Search,
  Shield,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import type { NavigationSessionStatus } from "../../features/navigation";

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
};

type SearchPillsProps = {
  isDark: boolean;
  hasPanned: boolean;
  searchWithinViewport?: boolean;
  onSearchInArea?: () => void;
  onClearAreaSearch?: () => void;
  onClearPan: () => void;
};

/* ── Theme tokens (shared between header + bottom) ──────────────────── */
function useOverlayTokens(isDark: boolean) {
  return {
    badgeCard: isDark
      ? "border-white/22 bg-slate-950/82 text-white shadow-xl backdrop-blur"
      : "border-black/8 bg-white/85 text-slate-800 shadow-xl backdrop-blur",
    badgeLabel: isDark ? "text-white/78" : "text-slate-500",
    badgeValue: isDark ? "text-white/95" : "text-slate-800",
    topGradient: isDark
      ? "bg-gradient-to-b from-slate-950/64 via-slate-950/20 to-transparent"
      : "bg-gradient-to-b from-black/18 via-black/5 to-transparent",
    bottomGradient: isDark
      ? "bg-gradient-to-t from-slate-950/84 via-slate-950/30 to-transparent"
      : "bg-gradient-to-t from-black/22 via-black/8 to-transparent",
    shopCardCls: isDark
      ? "border-white/24 bg-slate-950/94 text-white shadow-2xl backdrop-blur-xl"
      : "border-black/8 bg-white/94 text-slate-800 shadow-2xl backdrop-blur-xl",
    shopCardSecondary: isDark ? "text-slate-200/92" : "text-slate-500",
    shopCardMeta: isDark ? "text-slate-200/78" : "text-slate-500",
    shopCardScore: isDark ? "bg-slate-900/92 text-white" : "bg-slate-100 text-slate-800",
    shopCardScoreLabel: isDark ? "text-white/78" : "text-slate-500",
    shopCardCta: isDark
      ? "border-blue-300/55 bg-blue-600/42 text-white hover:bg-blue-600/55"
      : "border-blue-300/70 bg-blue-50 text-blue-700 hover:bg-blue-100",
    legendCard: isDark
      ? "border-white/24 bg-slate-950/82 text-white/95 shadow-xl backdrop-blur"
      : "border-black/8 bg-white/85 text-slate-600 shadow-xl backdrop-blur",
    topPickDot: isDark
      ? "border border-white/70 bg-slate-900 shadow-[0_0_0_1px_rgba(148,163,184,0.45)]"
      : "border border-slate-200 bg-slate-900",
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
      className={`pointer-events-none absolute inset-x-0 top-0 z-[500] ${t.topGradient} px-2.5 py-2 sm:px-4 sm:py-3`}
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
          <p className={`text-base font-semibold leading-tight ${t.badgeValue}`}>{shopCount}</p>
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
}: BottomOverlayProps) {
  const t = useOverlayTokens(isDark);
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
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-[500] ${t.bottomGradient} px-3 pt-10 sm:px-5 sm:pt-16`}
      style={{
        paddingBottom: compact
          ? "max(10rem, calc(env(safe-area-inset-bottom, 0px) + 9rem))"
          : "max(1rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div
        className={`flex flex-wrap items-end ${compact ? "justify-end" : "justify-between"} gap-3`}
      >
        {selectedShop && !compact && (
          <div className={`max-w-md rounded-2xl border p-2.5 sm:p-3 ${t.shopCardCls}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3
                  className={`truncate text-base font-semibold sm:text-lg ${isDark ? "text-white" : "text-slate-800"}`}
                >
                  {selectedShop.name}
                </h3>
                {selectedShop.mapResult.city ? (
                  <p
                    className={`mt-0.5 truncate text-xs ${isDark ? "text-slate-400/70" : "text-slate-400"}`}
                  >
                    {[selectedShop.mapResult.city, selectedShop.mapResult.state]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : null}
              </div>
              <div className={`shrink-0 rounded-xl px-2 py-1.5 text-center ${t.shopCardScore}`}>
                <p className={`text-[10px] uppercase tracking-[0.18em] ${t.shopCardScoreLabel}`}>
                  AI Fit
                </p>
                <p className="text-base font-semibold">{selectedShop.recommendationScore}%</p>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
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
              className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${t.shopCardSecondary}`}
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPin className={`h-4 w-4 ${t.shopCardMeta}`} />
                {distanceLabel || selectedShop.mapDistanceLabel}
              </span>
              {etaLabel ? (
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className={`h-4 w-4 ${t.shopCardMeta}`} />
                  {etaLabel}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Shield className={`h-4 w-4 ${t.shopCardMeta}`} />
                {selectedShop.insuranceCompatibilityScore}% carrier
              </span>
            </div>

            <p className={`mt-2 hidden text-sm leading-6 sm:block ${t.shopCardSecondary}`}>
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
                className={`pointer-events-auto mt-2 inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors ${t.shopCardCta}`}
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

        <div
          className={`rounded-xl border px-2.5 py-1.5 text-[10px] shadow-lg sm:px-3 sm:py-2 sm:text-[11px] ${t.legendCard}`}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
              Origin
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
              Selected
            </span>
            <span className="inline-flex items-center gap-1">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${t.topPickDot}`} />
              Top pick
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Reports
            </span>
            {onToggleSavedPlaces && (
              <button
                type="button"
                onClick={onToggleSavedPlaces}
                className={`inline-flex items-center gap-1 rounded px-1 -mx-1 transition-opacity ${
                  showSavedPlaces ? "opacity-100" : "opacity-40"
                }`}
                title={showSavedPlaces ? "Hide saved places" : "Show saved places"}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-blue-600 opacity-40" />
                Saved
              </button>
            )}
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-4 rounded border border-current opacity-50"
                style={{ borderStyle: "dashed" }}
              />
              Routes
            </span>
          </div>
        </div>
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
}: SearchPillsProps) {
  if (onSearchInArea && hasPanned && !searchWithinViewport) {
    return (
      <div className="pointer-events-auto absolute inset-x-0 top-3 z-[600] flex justify-center">
        <button
          type="button"
          onClick={onSearchInArea}
          className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-xl backdrop-blur-md transition-colors ${
            isDark
              ? "border-white/30 bg-slate-900/88 text-white hover:bg-slate-900/96"
              : "border-black/10 bg-white/90 text-slate-800 hover:bg-white"
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
      <div className="pointer-events-auto absolute inset-x-0 top-3 z-[600] flex justify-center">
        <button
          type="button"
          onClick={() => {
            onClearAreaSearch();
            onClearPan();
          }}
          className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-xl backdrop-blur-md transition-colors ${
            isDark
              ? "border-blue-300/55 bg-blue-600/42 text-white hover:bg-blue-600/55"
              : "border-blue-400/40 bg-blue-100 text-blue-700 hover:bg-blue-200"
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
