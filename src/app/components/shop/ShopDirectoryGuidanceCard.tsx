import {
  ArrowUp,
  LoaderCircle,
  LocateFixed,
  Pause,
  Play,
  RefreshCw,
  Route,
  Signal,
  SignalLow,
  SignalZero,
  Square,
  TriangleAlert,
} from "lucide-react";
import { formatActiveDuration } from "./shopDirectoryGuidanceUtils";
import { GuidanceArrivalCelebration, GuidanceArrivalActions } from "./GuidanceArrivalSection";
import {
  computeGuidanceStyles,
  type ShopDirectoryGuidanceCardProps,
} from "./shopDirectoryGuidanceCardHelpers";

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
  onViewDetails,
  onRequestEstimate,
  onPauseNavigation,
  onResumeNavigation,
  onEndNavigation,
  onRecenterNavigation,
  density = "default",
}: ShopDirectoryGuidanceCardProps) {
  const isCompactDensity = density === "compact";
  const GpsIcon = gpsStatus === "active" ? Signal : gpsStatus === "stale" ? SignalLow : SignalZero;
  const {
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
  } = computeGuidanceStyles(
    isDark,
    hasArrived,
    routeError,
    usingLiveRoutes,
    sessionStatus,
    gpsStatus,
    gpsError,
    currentSpeedMph,
    speedLimitMph
  );

  return (
    <div
      className={`pointer-events-auto absolute left-3 z-[510] max-w-[calc(100vw-1.5rem)] sm:left-4 ${
        isCompactDensity ? "w-[16rem] sm:w-[17rem]" : "w-[18rem] sm:w-[19rem]"
      }`}
      style={{ bottom: "max(3.5rem, calc(env(safe-area-inset-bottom, 0px) + 2.4rem))" }}
    >
      <div
        className={`rounded-[1.3rem] border shadow-2xl sm:rounded-2xl ${
          isCompactDensity ? "p-2 sm:p-2.5" : "p-2.5 sm:p-3"
        } ${glassPanel}`}
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
          <GuidanceArrivalCelebration
            shopName={selectedShop.name}
            selectedRoute={selectedRoute}
            sessionActiveSeconds={sessionActiveSeconds}
            isDark={isDark}
          />
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
            <div
              className={`rounded-xl border px-2 py-2 text-center ${
                isOverSpeedLimit
                  ? `animate-speed-warning ${isDark ? "border-red-500/50 bg-red-500/15" : "border-red-400/60 bg-red-50"}`
                  : glassChip
              }`}
            >
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
          <GuidanceArrivalActions
            selectedShop={selectedShop}
            isDark={isDark}
            isCompactDensity={isCompactDensity}
            onViewDetails={onViewDetails}
            onRequestEstimate={onRequestEstimate}
            onEndNavigation={onEndNavigation}
          />
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
