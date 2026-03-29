import { Compass, MapPin, Search, Shield, Sparkles, X } from "lucide-react";

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
  onOpenShopDirections?: (shop: ShopMapListing) => void;
  directionsActionLabel?: string;
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
      ? "border-white/15 bg-slate-950/70 text-white shadow-xl backdrop-blur"
      : "border-black/8 bg-white/85 text-slate-800 shadow-xl backdrop-blur",
    badgeLabel: isDark ? "text-white/65" : "text-slate-500",
    badgeValue: isDark ? "text-white/95" : "text-slate-800",
    topGradient: isDark
      ? "bg-gradient-to-b from-slate-950/50 via-slate-950/12 to-transparent"
      : "bg-gradient-to-b from-black/18 via-black/5 to-transparent",
    bottomGradient: isDark
      ? "bg-gradient-to-t from-slate-950/75 via-slate-950/22 to-transparent"
      : "bg-gradient-to-t from-black/22 via-black/8 to-transparent",
    shopCardCls: isDark
      ? "border-white/15 bg-slate-950/92 text-white shadow-2xl backdrop-blur-xl"
      : "border-black/8 bg-white/94 text-slate-800 shadow-2xl backdrop-blur-xl",
    shopCardSecondary: isDark ? "text-slate-300/80" : "text-slate-500",
    shopCardMeta: isDark ? "text-slate-400" : "text-slate-500",
    shopCardScore: isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800",
    shopCardScoreLabel: isDark ? "text-white/65" : "text-slate-500",
    legendCard: isDark
      ? "border-white/15 bg-slate-950/70 text-white/80 shadow-xl backdrop-blur"
      : "border-black/8 bg-white/85 text-slate-600 shadow-xl backdrop-blur",
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
      className={`pointer-events-none absolute inset-x-0 top-0 z-[500] ${t.topGradient} px-3 py-3 sm:px-5 sm:py-4`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className={`rounded-xl border px-3 py-2 ${t.badgeCard}`}>
          <div
            className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] ${t.badgeLabel}`}
          >
            <Sparkles className="h-3 w-3" />
            {getRoleLabel(userType)}
          </div>
          <p className={`mt-0.5 text-xs font-medium ${t.badgeValue}`}>
            {selectedOrigin ? `Centered on ${selectedOrigin.name}` : "Exploring the service area"}
          </p>
        </div>

        <div className={`rounded-xl border px-3 py-2 text-right ${t.badgeCard}`}>
          <p className={`text-[10px] uppercase tracking-[0.2em] ${t.badgeLabel}`}>Shops</p>
          <p className={`text-lg font-semibold leading-tight ${t.badgeValue}`}>{shopCount}</p>
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
  onOpenShopDirections,
  directionsActionLabel,
}: BottomOverlayProps) {
  const t = useOverlayTokens(isDark);

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-[500] ${t.bottomGradient} px-5 pb-5 pt-16`}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        {selectedShop && (
          <div className={`max-w-md rounded-[24px] border p-4 ${t.shopCardCls}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-xs uppercase tracking-[0.2em] ${t.shopCardMeta}`}>
                  Selected shop
                </p>
                <h3
                  className={`mt-1 text-lg font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
                >
                  {selectedShop.name}
                </h3>
              </div>
              <div className={`rounded-2xl px-3 py-2 text-center ${t.shopCardScore}`}>
                <p className={`text-[11px] uppercase tracking-[0.18em] ${t.shopCardScoreLabel}`}>
                  AI Fit
                </p>
                <p className="text-lg font-semibold">{selectedShop.recommendationScore}%</p>
              </div>
            </div>

            <div
              className={`mt-3 flex flex-wrap items-center gap-3 text-sm ${t.shopCardSecondary}`}
            >
              <span className="inline-flex items-center gap-1.5">
                <MapPin className={`h-4 w-4 ${t.shopCardMeta}`} />
                {selectedShop.mapDistanceLabel}
              </span>
              {selectedRoute && (
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className={`h-4 w-4 ${t.shopCardMeta}`} />
                  {selectedRoute.label} • {selectedRoute.estimatedDurationMinutes} min
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Shield className={`h-4 w-4 ${t.shopCardMeta}`} />
                {selectedShop.insuranceCompatibilityScore}% carrier fit
              </span>
            </div>

            <p className={`mt-3 text-sm leading-6 ${t.shopCardSecondary}`}>
              {selectedShop.aiSummary}
            </p>

            {onOpenShopDirections && (
              <button
                type="button"
                onClick={() => onOpenShopDirections(selectedShop)}
                className={`pointer-events-auto mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                  isDark
                    ? "border-blue-400/35 bg-blue-500/20 text-white hover:bg-blue-500/30"
                    : "border-blue-300/70 bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                {directionsActionLabel || "Directions"}
              </button>
            )}
          </div>
        )}

        <div
          className={`hidden rounded-xl border px-3 py-2 text-[11px] shadow-lg sm:block ${t.legendCard}`}
        >
          <p className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>Legend</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
              Origin
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
              Selected
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-slate-900" />
              Top
            </span>
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
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-xl backdrop-blur-md transition-colors ${
            isDark
              ? "border-white/20 bg-slate-950/80 text-white hover:bg-slate-950/95"
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
          className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-xl backdrop-blur-md transition-colors ${
            isDark
              ? "border-blue-400/40 bg-blue-600/30 text-white hover:bg-blue-600/45"
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
