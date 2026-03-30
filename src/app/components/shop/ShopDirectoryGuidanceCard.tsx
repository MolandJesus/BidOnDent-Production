import {
  ArrowUp,
  CheckCircle2,
  LoaderCircle,
  LocateFixed,
  Pause,
  Phone,
  Play,
  RefreshCw,
  Route,
  Signal,
  SignalLow,
  SignalZero,
  Square,
  TriangleAlert,
} from "lucide-react";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { NavigationSessionStatus } from "../../features/navigation";
import type { GpsStatus } from "../../hooks/useNavigationGpsTracking";
import type { Place, RouteOption } from "../../types/mapDomain";

type ShopDirectoryGuidanceCardProps = {
  selectedOrigin: Place;
  selectedShop: ShopMapListing;
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
  onPauseNavigation?: () => void;
  onResumeNavigation?: () => void;
  onEndNavigation?: () => void;
  onRecenterNavigation?: () => void;
};

function formatActiveDuration(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatSpeedLimitDetail(
  currentSpeedMph: number | null | undefined,
  speedLimitMph: number | null | undefined
) {
  if (!Number.isFinite(speedLimitMph)) {
    return null;
  }

  const roundedLimit = Math.round(Number(speedLimitMph));

  if (!Number.isFinite(currentSpeedMph) || Number(currentSpeedMph) < 1) {
    return `Limit ${roundedLimit}`;
  }

  const roundedCurrentSpeed = Math.round(Number(currentSpeedMph));
  const overageMph = roundedCurrentSpeed - roundedLimit;

  if (overageMph > 0) {
    return `+${overageMph} over ${roundedLimit}`;
  }

  if (overageMph >= -2) {
    return `At limit ${roundedLimit}`;
  }

  return `${Math.abs(overageMph)} below ${roundedLimit}`;
}

function getGpsRecoveryMessage(gpsStatus: GpsStatus, gpsError: string | undefined) {
  if (gpsError?.trim()) {
    return gpsError;
  }

  if (gpsStatus === "denied") {
    return "Location permission denied. Allow access, then retry GPS.";
  }

  if (gpsStatus === "lost") {
    return "GPS signal lost — turn-by-turn position may be outdated.";
  }

  return "GPS signal stale — no fresh location update in the last 10 seconds.";
}

function formatEtaComparison(actualSeconds: number, estimatedMinutes: number) {
  const actualMinutes = Math.round(actualSeconds / 60);
  const diff = actualMinutes - estimatedMinutes;
  if (Math.abs(diff) <= 1) return "On time";
  if (diff > 0) return `${diff}m slower`;
  return `${Math.abs(diff)}m faster`;
}

export default function ShopDirectoryGuidanceCard({
  selectedOrigin,
  selectedShop,
  selectedRoute,
  sessionStatus,
  sessionDestinationLabel,
  routeSummary,
  hasArrived = false,
  routeError,
  isLoadingRoute = false,
  usingLiveRoutes = false,
  sessionActiveSeconds = 0,
  remainingEtaLabel,
  remainingDistanceLabel,
  distanceLabel,
  etaLabel,
  isDark,
  currentSpeedMph,
  speedLimitMph,
  gpsStatus = "active",
  gpsError,
  nextInstruction,
  followingInstruction,
  onRetryGps,
  onRetryRoute,
  onPauseNavigation,
  onResumeNavigation,
  onEndNavigation,
  onRecenterNavigation,
}: ShopDirectoryGuidanceCardProps) {
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

  const GpsIcon = gpsStatus === "active" ? Signal : gpsStatus === "stale" ? SignalLow : SignalZero;
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

  return (
    <div
      className="pointer-events-auto absolute left-3 z-[510] w-[18rem] max-w-[calc(100vw-1.5rem)] sm:left-4 sm:w-[19rem]"
      style={{ bottom: "max(3.5rem, calc(env(safe-area-inset-bottom, 0px) + 2.4rem))" }}
    >
      <div
        className={`rounded-[1.3rem] border p-2.5 shadow-2xl sm:rounded-2xl sm:p-3 ${glassPanel}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${secondaryText}`}>
              BidOnDent Navigation
            </p>
            <p className={`mt-1 text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
              {sessionDestinationLabel || selectedShop.name}
            </p>
          </div>
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              sessionStatus === "paused" ? pausedSessionBadge : activeSessionBadge
            }`}
          >
            {sessionStatus === "paused" ? "Paused" : "Live"}
          </span>
        </div>

        <div
          className={`mt-2 flex items-center justify-between text-[11px] sm:text-xs ${secondaryText}`}
        >
          <span className="truncate pr-2">
            {selectedOrigin.name} → {selectedShop.name}
          </span>
          <span
            className={`ml-2 whitespace-nowrap font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
          >
            {selectedRoute.label}
          </span>
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
          {!hasArrived && (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${gpsBadge}`}
            >
              <GpsIcon className="h-3 w-3" />
              {gpsLabel}
            </span>
          )}
        </div>

        {/* Turn-by-turn instruction */}
        {!hasArrived && nextInstruction ? (
          <div
            className={`mt-2 flex items-start gap-2 rounded-xl border px-3 py-2 ${
              isDark ? "border-blue-400/20 bg-blue-400/10" : "border-blue-200 bg-blue-50"
            }`}
          >
            <ArrowUp
              className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${isDark ? "text-blue-300" : "text-blue-600"}`}
            />
            <div className="min-w-0 flex-1">
              <p
                className={`text-xs font-semibold leading-5 ${isDark ? "text-blue-100" : "text-blue-800"}`}
              >
                {nextInstruction}
              </p>
              {followingInstruction ? (
                <p
                  className={`mt-0.5 text-[11px] leading-4 ${isDark ? "text-blue-200/60" : "text-blue-600/70"}`}
                >
                  Then: {followingInstruction}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {hasArrived ? (
          <div
            className={`mt-2 rounded-xl border px-3 py-2.5 ${
              isDark
                ? "border-emerald-400/25 bg-emerald-400/10"
                : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2
                className={`mt-0.5 h-4 w-4 shrink-0 ${isDark ? "text-emerald-300" : "text-emerald-600"}`}
              />
              <p
                className={`text-xs font-semibold leading-5 ${isDark ? "text-emerald-100" : "text-emerald-800"}`}
              >
                You've arrived at {selectedShop.name}
              </p>
            </div>
            <div className={`mt-2.5 grid grid-cols-3 gap-1.5 border-t pt-2.5 ${divider}`}>
              <div className={`rounded-xl border px-2 py-2 text-center ${glassChip}`}>
                <p className={`text-[10px] uppercase tracking-[0.16em] ${secondaryText}`}>
                  Duration
                </p>
                <p
                  className={`mt-1 text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
                >
                  {formatActiveDuration(sessionActiveSeconds)}
                </p>
              </div>
              <div className={`rounded-xl border px-2 py-2 text-center ${glassChip}`}>
                <p className={`text-[10px] uppercase tracking-[0.16em] ${secondaryText}`}>
                  Distance
                </p>
                <p
                  className={`mt-1 text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
                >
                  {selectedRoute.totalDistanceLabel}
                </p>
              </div>
              <div className={`rounded-xl border px-2 py-2 text-center ${glassChip}`}>
                <p className={`text-[10px] uppercase tracking-[0.16em] ${secondaryText}`}>vs ETA</p>
                <p
                  className={`mt-1 text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
                >
                  {formatEtaComparison(
                    sessionActiveSeconds,
                    selectedRoute.estimatedDurationMinutes
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : routeSummary.description ? (
          <p className={`mt-2 text-xs leading-5 ${isDark ? "text-white/80" : "text-slate-700"}`}>
            {routeSummary.description}
          </p>
        ) : null}

        {routeError ? (
          <div
            className={`mt-2 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${
              isDark
                ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="leading-5">
                Using estimated route — live directions temporarily unavailable
              </p>
              {onRetryRoute ? (
                <button
                  className={`mt-2 inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                    isDark
                      ? "bg-amber-400/20 text-amber-100 hover:bg-amber-400/30"
                      : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }`}
                  onClick={onRetryRoute}
                  type="button"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry Route
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {showGpsRecovery && gpsRecoveryMessage ? (
          <div
            className={`mt-2 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${gpsRecoveryPanel}`}
          >
            <LocateFixed className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="leading-5">{gpsRecoveryMessage}</p>
              {onRetryGps ? (
                <button
                  className={`mt-2 inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${gpsRecoveryButton}`}
                  onClick={onRetryGps}
                  type="button"
                >
                  <RefreshCw className="h-3 w-3" />
                  Retry GPS
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {hasArrived ? null : (
          <div className={`mt-3 grid grid-cols-4 gap-1.5 border-t pt-3 ${divider}`}>
            <div className={`rounded-xl border px-2 py-2 text-center ${glassChip}`}>
              <p className={`text-[10px] uppercase tracking-[0.16em] ${secondaryText}`}>Active</p>
              <p
                className={`mt-1 text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
              >
                {formatActiveDuration(sessionActiveSeconds)}
              </p>
            </div>
            <div className={`rounded-xl border px-2 py-2 text-center ${glassChip}`}>
              <p className={`text-[10px] uppercase tracking-[0.16em] ${secondaryText}`}>Speed</p>
              <p
                className={`mt-1 text-sm font-semibold ${
                  isOverSpeedLimit ? "text-red-400" : isDark ? "text-white" : "text-slate-800"
                }`}
              >
                {currentSpeedMph != null && currentSpeedMph >= 1
                  ? `${Math.round(currentSpeedMph)}`
                  : "—"}
                <span className={`ml-0.5 text-[10px] font-normal ${secondaryText}`}>mph</span>
              </p>
              {speedLimitDetail ? (
                <p
                  className={`mt-0.5 text-[9px] ${
                    isOverSpeedLimit ? (isDark ? "text-red-300" : "text-red-600") : secondaryText
                  }`}
                >
                  {speedLimitDetail}
                </p>
              ) : null}
            </div>
            <div className={`rounded-xl border px-2 py-2 text-center ${glassChip}`}>
              <p className={`text-[10px] uppercase tracking-[0.16em] ${secondaryText}`}>ETA</p>
              <p
                className={`mt-1 text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
              >
                {remainingEtaLabel || etaLabel || `${selectedRoute.estimatedDurationMinutes}m`}
              </p>
            </div>
            <div className={`rounded-xl border px-2 py-2 text-center ${glassChip}`}>
              <p className={`text-[10px] uppercase tracking-[0.16em] ${secondaryText}`}>Distance</p>
              <p
                className={`mt-1 text-sm font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
              >
                {remainingDistanceLabel || distanceLabel || selectedRoute.totalDistanceLabel}
              </p>
            </div>
          </div>
        )}

        {hasArrived ? (
          <div className={`mt-3 border-t pt-3 ${divider}`}>
            <div className="grid grid-cols-2 gap-2">
              {selectedShop.mapResult?.phone ? (
                <a
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-[1rem] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
                  href={`tel:${selectedShop.mapResult.phone}`}
                >
                  <Phone className="h-4 w-4" />
                  Call Shop
                </a>
              ) : null}
              <button
                className={`flex min-h-[44px] items-center justify-center gap-2 rounded-[1rem] bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800 ${
                  selectedShop.mapResult?.phone ? "" : "col-span-2"
                }`}
                onClick={onEndNavigation}
                type="button"
              >
                <Square className="h-4 w-4" />
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {sessionStatus === "paused" ? (
              <button
                className="flex min-h-[42px] items-center justify-center gap-2 rounded-[1rem] bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
                onClick={onResumeNavigation}
                type="button"
              >
                <Play className="h-4 w-4" />
                Resume
              </button>
            ) : (
              <button
                className={`flex min-h-[42px] items-center justify-center gap-2 rounded-[1rem] border px-4 py-2.5 text-sm font-semibold transition-colors ${
                  isDark
                    ? "border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.1]"
                    : "border-black/8 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={onPauseNavigation}
                type="button"
              >
                <Pause className="h-4 w-4" />
                Pause
              </button>
            )}

            <button
              className={`flex min-h-[42px] items-center justify-center gap-2 rounded-[1rem] border px-4 py-2.5 text-sm font-semibold transition-colors ${
                isDark
                  ? "border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.1]"
                  : "border-black/8 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={onRecenterNavigation}
              type="button"
            >
              <LocateFixed className="h-4 w-4" />
              Recenter
            </button>

            <button
              className={`flex min-h-[42px] items-center justify-center gap-2 rounded-[1rem] border px-4 py-2.5 text-sm font-semibold transition-colors ${
                isDark
                  ? "border-red-400/30 bg-red-500/14 text-red-100 hover:bg-red-500/20"
                  : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              }`}
              onClick={onEndNavigation}
              type="button"
            >
              <Square className="h-4 w-4" />
              End Route
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
