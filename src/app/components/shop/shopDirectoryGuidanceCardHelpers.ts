import type { Signal, SignalLow, SignalZero } from "lucide-react";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { NavigationSessionStatus } from "../../features/navigation";
import type { GpsStatus } from "../../hooks/useNavigationGpsTracking";
import type { Place, RouteOption } from "../../types/mapDomain";
import { formatSpeedLimitDetail, getGpsRecoveryMessage } from "./shopDirectoryGuidanceUtils";

export type ShopDirectoryGuidanceCardProps = {
  selectedOrigin: Place | null;
  selectedShop: ShopMapListing | null;
  selectedRoute: RouteOption;
  sessionStatus: NavigationSessionStatus;
  sessionDestinationLabel?: string | null;
  routeSummary: IntelligenceSummary;
  hasArrived?: boolean;
  routeError?: string;
  isLoadingRoute?: boolean;
  usingLiveRoutes?: boolean;
  sessionActiveSeconds: number;
  remainingEtaLabel?: string | null;
  remainingDistanceLabel?: string | null;
  distanceLabel: string;
  etaLabel: string;
  isDark: boolean;
  currentSpeedMph?: number | null;
  speedLimitMph?: number | null;
  gpsStatus?: GpsStatus;
  gpsError?: string;
  nextInstruction?: string | null;
  followingInstruction?: string | null;
  onRetryGps?: () => void;
  onRetryRoute?: () => void;
  onViewDetails?: (shop: ShopMapListing) => void;
  onRequestEstimate?: (shop: ShopMapListing) => void;
  onPauseNavigation?: () => void;
  onResumeNavigation?: () => void;
  onEndNavigation?: () => void;
  onRecenterNavigation?: () => void;
  density?: "default" | "compact";
};

export type GpsIconType = typeof Signal | typeof SignalLow | typeof SignalZero;

export function computeGuidanceStyles(
  isDark: boolean,
  hasArrived: boolean,
  routeError: string | undefined,
  usingLiveRoutes: boolean,
  sessionStatus: NavigationSessionStatus,
  gpsStatus: GpsStatus,
  gpsError: string | undefined,
  currentSpeedMph: number | null | undefined,
  speedLimitMph: number | null | undefined
) {
  const glassPanel = isDark
    ? "border-blue-400/25 bg-slate-950/82 backdrop-blur-md text-white shadow-[0_0_24px_rgba(59,130,246,0.08)]"
    : "border-black/8 bg-white/88 backdrop-blur-md text-slate-800";
  const glassChip = isDark
    ? "border-blue-400/30 bg-slate-950/75 text-white backdrop-blur-md hover:bg-slate-950/85 shadow-[0_0_16px_rgba(59,130,246,0.06)]"
    : "border-black/8 bg-white/85 text-slate-700 backdrop-blur-md hover:bg-white/95";
  const secondaryText = isDark ? "text-white/60" : "text-slate-500";
  const divider = isDark ? "border-white/10" : "border-black/8";

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
  const pausedSessionBadge = isDark
    ? "border-amber-400/35 bg-amber-400/14 text-amber-100"
    : "border-amber-200 bg-amber-50 text-amber-700";
  const activeSessionBadge = isDark
    ? "border-emerald-400/35 bg-emerald-400/14 text-emerald-100"
    : "border-emerald-200 bg-emerald-50 text-emerald-700";

  const gpsBadge =
    gpsStatus === "active"
      ? isDark
        ? "border-emerald-400/30 bg-emerald-400/12 text-emerald-100"
        : "border-emerald-200 bg-emerald-50 text-emerald-700"
      : gpsStatus === "stale"
        ? isDark
          ? "border-amber-400/30 bg-amber-400/12 text-amber-100"
          : "border-amber-200 bg-amber-50 text-amber-700"
        : isDark
          ? "border-red-400/30 bg-red-400/12 text-red-100"
          : "border-red-200 bg-red-50 text-red-700";
  const gpsLabel =
    gpsStatus === "active"
      ? "GPS"
      : gpsStatus === "stale"
        ? "GPS weak"
        : gpsStatus === "denied"
          ? "GPS denied"
          : "GPS lost";
  const speedLimitDetail = formatSpeedLimitDetail(currentSpeedMph, speedLimitMph);
  const isOverSpeedLimit =
    Number.isFinite(currentSpeedMph) &&
    Number.isFinite(speedLimitMph) &&
    Number(currentSpeedMph) > Number(speedLimitMph) + 3;
  const showGpsRecovery = !hasArrived && gpsStatus !== "active";
  const gpsRecoveryMessage = showGpsRecovery ? getGpsRecoveryMessage(gpsStatus, gpsError) : null;
  const gpsRecoveryPanel =
    gpsStatus === "stale"
      ? isDark
        ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
        : "border-amber-200 bg-amber-50 text-amber-700"
      : isDark
        ? "border-red-400/20 bg-red-500/10 text-red-100"
        : "border-red-200 bg-red-50 text-red-700";
  const gpsRecoveryButton =
    gpsStatus === "stale"
      ? isDark
        ? "bg-amber-400/12 text-amber-100 hover:bg-amber-400/18"
        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
      : isDark
        ? "bg-white/10 text-white hover:bg-white/20"
        : "bg-black/8 text-slate-700 hover:bg-black/12";

  return {
    glassPanel,
    glassChip,
    secondaryText,
    divider,
    routeSourceLabel,
    routeSourceBadge,
    refreshBadge,
    pausedSessionBadge,
    activeSessionBadge,
    gpsBadge,
    gpsLabel,
    speedLimitDetail,
    isOverSpeedLimit,
    showGpsRecovery,
    gpsRecoveryMessage,
    gpsRecoveryPanel,
    gpsRecoveryButton,
  };
}
