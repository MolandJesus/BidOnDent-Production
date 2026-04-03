import type { NavigationSessionStatus } from "../../features/navigation";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { Place, RouteOption } from "../../types/mapDomain";

/* ── Props ──────────────────────────────────────────────────────────── */
export type HeaderBadgesProps = {
  isDark: boolean;
  userType: MarketUserType;
  selectedOrigin?: Place | null;
  shopCount: number;
};

export type BottomOverlayProps = {
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

export type SearchPillsProps = {
  isDark: boolean;
  hasPanned: boolean;
  searchWithinViewport?: boolean;
  onSearchInArea?: () => void;
  onClearAreaSearch?: () => void;
  onClearPan: () => void;
  density?: "default" | "compact";
};

/* ── Theme tokens ───────────────────────────────────────────────────── */
export function useOverlayTokens(isDark: boolean) {
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
