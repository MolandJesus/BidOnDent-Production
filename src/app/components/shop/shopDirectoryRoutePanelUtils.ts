import type { NavigationSessionStatus } from "../../features/navigation";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { Place, RouteOption } from "../../types/mapDomain";

export interface ShopDirectoryRoutePanelProps {
  routeSummary: { title: string; description: string };
  routeOptions: RouteOption[];
  selectedRoute: RouteOption | null;
  selectedOrigin: Place | null;
  selectedShop: ShopMapListing | null;
  hasArrived?: boolean;
  onSelectRoute: (id: string) => void;
  appearanceMode?: DashboardAppearanceMode;
  mode?: "preview" | "guidance";
  navigationSessionStatus?: NavigationSessionStatus;
  isLoadingRoute?: boolean;
  routeError?: string;
  usingLiveRoutes?: boolean;
  remainingEtaLabel?: string | null;
  remainingDistanceLabel?: string | null;
  currentStepIndex?: number;
  nextInstruction?: string | null;
  followingInstruction?: string | null;
  sessionActiveSeconds?: number;
  onPauseNavigation?: () => void;
  onResumeNavigation?: () => void;
  onEndNavigation?: () => void;
}

export function formatActiveDuration(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function buildRoutePanelTheme(isLight: boolean) {
  return {
    panelSurface: isLight
      ? "rounded-[1.6rem] border border-slate-200/70 bg-white/88 p-4 shadow-sm"
      : "bd-glass-card border-white/[0.10] p-4",
    topLabelClass: isLight ? "text-blue-600/70" : "text-blue-200/50",
    titleClass: isLight ? "text-slate-900" : "text-slate-100",
    bodyTextClass: isLight ? "text-slate-600" : "text-slate-300/80",
    subTextClass: isLight ? "text-slate-500" : "text-slate-400/70",
    activeRouteCardClass: isLight
      ? "border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(239,246,255,0.94))]"
      : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(37,99,235,0.08))]",
    statCardClass: isLight ? "border-slate-200/80 bg-white" : "border-white/[0.08] bg-white/[0.06]",
    liveBadgeClass: isLight
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-emerald-400/30 bg-emerald-400/12 text-emerald-200",
    pausedBadgeClass: isLight
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-amber-400/30 bg-amber-400/12 text-amber-200",
    arrivedBadgeClass: isLight
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-emerald-400/30 bg-emerald-400/12 text-emerald-200",
  };
}

export function buildRoutePanelLabels(deps: {
  isArrivedMode: boolean;
  isGuidanceMode: boolean;
  isLight: boolean;
  routeError: string;
  usingLiveRoutes: boolean;
  navigationSessionStatus: NavigationSessionStatus;
  remainingEtaLabel?: string | null;
  remainingDistanceLabel?: string | null;
  selectedRoute: RouteOption | null;
  selectedShop: ShopMapListing | null;
  routeSummary: { title: string; description: string };
  theme: ReturnType<typeof buildRoutePanelTheme>;
}) {
  const {
    isArrivedMode,
    isLight,
    routeError,
    usingLiveRoutes,
    navigationSessionStatus,
    remainingEtaLabel,
    remainingDistanceLabel,
    selectedRoute,
    selectedShop,
    routeSummary,
    theme,
  } = deps;

  const routeSourceBadgeClass = routeError
    ? isLight
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-amber-400/30 bg-amber-400/12 text-amber-200"
    : isArrivedMode
      ? theme.arrivedBadgeClass
      : usingLiveRoutes
        ? isLight
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-blue-400/30 bg-blue-400/12 text-blue-200"
        : isLight
          ? "border-slate-200 bg-slate-100 text-slate-600"
          : "border-white/[0.10] bg-white/[0.05] text-slate-300";

  const sessionBadgeClass = isArrivedMode
    ? theme.arrivedBadgeClass
    : navigationSessionStatus === "paused"
      ? theme.pausedBadgeClass
      : theme.liveBadgeClass;

  const sessionBadgeLabel = isArrivedMode
    ? "Arrived"
    : navigationSessionStatus === "paused"
      ? "Paused route"
      : "Live guidance";

  const routeSourceLabel = isArrivedMode
    ? "Trip complete"
    : routeError
      ? "Route estimate"
      : usingLiveRoutes
        ? "Live route"
        : "Estimated route";

  const activeEtaLabel = isArrivedMode
    ? "Arrived"
    : remainingEtaLabel || (selectedRoute ? `${selectedRoute.estimatedDurationMinutes} min` : "—");

  const activeDistanceLabel = isArrivedMode
    ? "Here"
    : remainingDistanceLabel || selectedRoute?.totalDistanceLabel || "—";

  const panelTitle = isArrivedMode ? `Arrived at ${selectedShop?.name}` : routeSummary.title;

  const panelDescription = isArrivedMode
    ? "Navigation completed. You can review the shop, restart directions, or continue browsing nearby options."
    : routeSummary.description;

  return {
    routeSourceBadgeClass,
    sessionBadgeClass,
    sessionBadgeLabel,
    routeSourceLabel,
    activeEtaLabel,
    activeDistanceLabel,
    panelTitle,
    panelDescription,
  };
}
