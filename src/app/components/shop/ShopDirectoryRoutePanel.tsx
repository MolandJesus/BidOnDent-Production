import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  MapPin,
  Radio,
  Route,
  TriangleAlert,
} from "lucide-react";
import RoutePanelGuidanceControls from "./RoutePanelGuidanceControls";
import {
  type ShopDirectoryRoutePanelProps,
  formatActiveDuration,
  buildRoutePanelTheme,
  buildRoutePanelLabels,
} from "./shopDirectoryRoutePanelUtils";

export type { ShopDirectoryRoutePanelProps };

export default function ShopDirectoryRoutePanel({
  routeSummary,
  routeOptions,
  selectedRoute,
  selectedOrigin,
  selectedShop,
  hasArrived = false,
  onSelectRoute,
  appearanceMode = "map-dark",
  mode = "preview",
  navigationSessionStatus = "idle",
  isLoadingRoute = false,
  routeError = "",
  usingLiveRoutes = false,
  remainingEtaLabel,
  remainingDistanceLabel,
  currentStepIndex = 0,
  nextInstruction,
  followingInstruction,
  sessionActiveSeconds = 0,
  onPauseNavigation,
  onResumeNavigation,
  onEndNavigation,
}: ShopDirectoryRoutePanelProps) {
  const [showAllSteps, setShowAllSteps] = useState(false);
  const isLight = appearanceMode === "light";
  const isGuidanceMode = mode === "guidance";
  const isArrivedMode = hasArrived && Boolean(selectedShop);
  const safeInstructionStartIndex = selectedRoute
    ? Math.min(
        isGuidanceMode && nextInstruction
          ? currentStepIndex + 1
          : isGuidanceMode
            ? currentStepIndex
            : 0,
        selectedRoute.instructions.length
      )
    : 0;
  const baseVisibleLimit = isGuidanceMode ? 3 : 2;
  const totalRemainingSteps = selectedRoute
    ? selectedRoute.instructions.length - safeInstructionStartIndex
    : 0;
  const visibleInstructionLimit = showAllSteps ? totalRemainingSteps : baseVisibleLimit;
  const visibleInstructions = selectedRoute
    ? selectedRoute.instructions.slice(
        safeInstructionStartIndex,
        safeInstructionStartIndex + visibleInstructionLimit
      )
    : [];
  const hiddenInstructionCount = selectedRoute
    ? Math.max(
        selectedRoute.instructions.length - safeInstructionStartIndex - visibleInstructions.length,
        0
      )
    : 0;

  const theme = buildRoutePanelTheme(isLight);
  const {
    panelSurface,
    topLabelClass,
    titleClass,
    bodyTextClass,
    subTextClass,
    activeRouteCardClass,
    statCardClass,
  } = theme;
  const {
    routeSourceBadgeClass,
    sessionBadgeClass,
    sessionBadgeLabel,
    routeSourceLabel,
    activeEtaLabel,
    activeDistanceLabel,
    panelTitle,
    panelDescription,
  } = buildRoutePanelLabels({
    isArrivedMode,
    isGuidanceMode,
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
  });

  return (
    <div className={`mb-5 ${panelSurface}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div
            className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${topLabelClass}`}
          >
            {isArrivedMode ? (
              <MapPin className="h-4 w-4" />
            ) : isGuidanceMode ? (
              <Radio className="h-4 w-4" />
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            {isArrivedMode ? "Arrival" : isGuidanceMode ? "Live guidance" : "Route preview"}
          </div>
          <p className={`mt-2 text-lg font-semibold ${titleClass}`}>{panelTitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isGuidanceMode || isArrivedMode ? (
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${sessionBadgeClass}`}
            >
              <Radio className="h-3.5 w-3.5" />
              {sessionBadgeLabel}
            </span>
          ) : null}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${routeSourceBadgeClass}`}
          >
            <Route className="h-3.5 w-3.5" />
            {routeSourceLabel}
          </span>
        </div>
      </div>

      <p className={`mt-2 text-sm leading-6 ${bodyTextClass}`}>{panelDescription}</p>

      {isLoadingRoute && selectedOrigin && selectedShop ? (
        <div
          className={`mt-4 flex items-center gap-2 rounded-[1.1rem] border px-3 py-2.5 text-sm ${
            isLight
              ? "border-blue-200 bg-blue-50 text-blue-700"
              : "border-blue-400/20 bg-blue-400/10 text-blue-100"
          }`}
        >
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Refreshing the {usingLiveRoutes || isGuidanceMode ? "live route" : "route preview"}...
        </div>
      ) : null}

      {routeError ? (
        <div
          className={`mt-4 rounded-[1.1rem] border px-3 py-3 ${
            isLight
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-amber-400/20 bg-amber-400/10 text-amber-100"
          }`}
        >
          <div className="flex items-start gap-2">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Using estimated route</p>
              <p className="mt-1 text-sm leading-6 opacity-90">
                Live directions are temporarily unavailable. The route shown is an estimate based on
                distance. Times and paths may differ from actual driving conditions.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {selectedOrigin && selectedShop && selectedRoute ? (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {routeOptions.map((route) => {
              const isActiveRoute = route.id === selectedRoute.id;

              return (
                <button
                  key={route.id}
                  className={`rounded-[22px] border px-3 py-3 text-left transition-colors ${
                    isActiveRoute
                      ? isLight
                        ? "border-blue-400 bg-blue-100 text-blue-800"
                        : "border-blue-400/60 bg-blue-500/20 text-white"
                      : isLight
                        ? "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                        : "border-white/[0.10] bg-white/[0.04] text-slate-200/80 hover:bg-white/[0.08]"
                  }`}
                  onClick={() => onSelectRoute(route.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{route.label}</span>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: route.accentColor }}
                    />
                  </div>
                  <p
                    className={`mt-2 text-xl font-semibold ${
                      isActiveRoute
                        ? isLight
                          ? "text-blue-800"
                          : "text-white"
                        : isLight
                          ? "text-slate-800"
                          : "text-slate-100"
                    }`}
                  >
                    {route.estimatedDurationMinutes} min
                  </p>
                  <p
                    className={`mt-1 text-xs ${
                      isActiveRoute
                        ? isLight
                          ? "text-blue-600/70"
                          : "text-blue-100/70"
                        : isLight
                          ? "text-slate-500"
                          : "text-slate-400/70"
                    }`}
                  >
                    {route.totalDistanceLabel} • {route.trafficLabel}
                  </p>
                </button>
              );
            })}
          </div>

          <div className={`mt-4 rounded-[24px] border p-3 sm:p-4 ${activeRouteCardClass}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${topLabelClass}`}>
                  {isArrivedMode
                    ? "Trip complete"
                    : isGuidanceMode
                      ? "Active session"
                      : "Active route"}
                </p>
                <p className={`mt-1 text-base font-semibold ${titleClass}`}>
                  {isArrivedMode
                    ? `You made it to ${selectedShop.name}`
                    : `${selectedOrigin.name} to ${selectedShop.name}`}
                </p>
              </div>
              {isGuidanceMode || isArrivedMode ? (
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${sessionBadgeClass}`}
                >
                  <Radio className="h-3.5 w-3.5" />
                  {sessionBadgeLabel}
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <div className={`rounded-2xl border px-3 py-2.5 ${statCardClass}`}>
                <p className={`text-[11px] uppercase tracking-[0.18em] ${topLabelClass}`}>
                  {isGuidanceMode || isArrivedMode ? "Duration" : "Source"}
                </p>
                <p className={`mt-1 text-sm font-semibold ${titleClass}`}>
                  {isGuidanceMode || isArrivedMode
                    ? formatActiveDuration(sessionActiveSeconds)
                    : routeSourceLabel}
                </p>
              </div>
              <div className={`rounded-2xl border px-3 py-2.5 ${statCardClass}`}>
                <p className={`text-[11px] uppercase tracking-[0.18em] ${topLabelClass}`}>ETA</p>
                <p className={`mt-1 text-sm font-semibold ${titleClass}`}>{activeEtaLabel}</p>
              </div>
              <div className={`rounded-2xl border px-3 py-2.5 ${statCardClass}`}>
                <p className={`text-[11px] uppercase tracking-[0.18em] ${topLabelClass}`}>
                  Distance
                </p>
                <p className={`mt-1 text-sm font-semibold ${titleClass}`}>{activeDistanceLabel}</p>
              </div>
            </div>

            {isArrivedMode ? (
              <div
                className={`mt-4 rounded-[1.2rem] border px-4 py-3 ${
                  isLight
                    ? "border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.98),rgba(209,250,229,0.9))]"
                    : "border-emerald-400/20 bg-[linear-gradient(180deg,rgba(16,185,129,0.16),rgba(6,78,59,0.28))]"
                }`}
              >
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${topLabelClass}`}
                >
                  Arrival confirmed
                </p>
                <p className={`mt-1 text-base font-semibold ${titleClass}`}>
                  You&apos;ve reached {selectedShop.name}.
                </p>
                <p className={`mt-2 text-sm leading-6 ${subTextClass}`}>
                  The live route is complete. You can restart directions any time or keep browsing
                  nearby shops.
                </p>
              </div>
            ) : isGuidanceMode && nextInstruction ? (
              <div
                className={`mt-4 rounded-[1.2rem] border px-4 py-3 ${
                  isLight
                    ? "border-blue-200 bg-[linear-gradient(180deg,rgba(239,246,255,0.98),rgba(219,234,254,0.9))]"
                    : "border-blue-400/20 bg-[linear-gradient(180deg,rgba(37,99,235,0.18),rgba(15,23,42,0.4))]"
                }`}
              >
                <p
                  className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${topLabelClass}`}
                >
                  Next cue
                </p>
                <p className={`mt-1 text-base font-semibold ${titleClass}`}>{nextInstruction}</p>
                {followingInstruction ? (
                  <p className={`mt-2 text-sm leading-6 ${subTextClass}`}>
                    Then {followingInstruction}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 space-y-2.5 sm:space-y-3">
              {isGuidanceMode && !isArrivedMode ? (
                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${topLabelClass}`}>
                  Upcoming steps
                </p>
              ) : null}

              {!isArrivedMode &&
                visibleInstructions.map((instruction, index) => (
                  <div
                    key={instruction.id}
                    className={`flex gap-3 rounded-[20px] border px-3 py-2.5 sm:py-3 ${
                      isLight
                        ? "border-slate-200/60 bg-slate-50"
                        : "border-white/[0.08] bg-white/[0.05]"
                    }`}
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: selectedRoute.accentColor }}
                    >
                      {safeInstructionStartIndex + index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className={`font-semibold ${titleClass}`}>{instruction.title}</p>
                        <p className={`text-sm ${subTextClass}`}>
                          {instruction.durationMinutes > 0
                            ? `${instruction.durationMinutes} min`
                            : instruction.distanceLabel}
                        </p>
                      </div>
                      <p className={`mt-1 text-sm leading-6 ${bodyTextClass}`}>
                        {instruction.detail}
                      </p>
                    </div>
                  </div>
                ))}

              {!isArrivedMode && (hiddenInstructionCount > 0 || showAllSteps) ? (
                <button
                  type="button"
                  onClick={() => setShowAllSteps((v) => !v)}
                  className={`flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-[18px] border px-3 py-2 text-sm transition-colors ${
                    isLight
                      ? "border-slate-200/70 bg-white text-slate-500 hover:bg-slate-50 active:bg-slate-100"
                      : "border-white/[0.08] bg-white/[0.03] text-slate-300/70 hover:bg-white/[0.06] active:bg-white/[0.08]"
                  }`}
                >
                  {showAllSteps ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Show fewer steps
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />+{hiddenInstructionCount} more step
                      {hiddenInstructionCount === 1 ? "" : "s"}
                    </>
                  )}
                </button>
              ) : null}
            </div>

            {isGuidanceMode &&
            !isArrivedMode &&
            (onPauseNavigation || onResumeNavigation || onEndNavigation) ? (
              <RoutePanelGuidanceControls
                navigationSessionStatus={navigationSessionStatus}
                isLight={isLight}
                onPauseNavigation={onPauseNavigation}
                onResumeNavigation={onResumeNavigation}
                onEndNavigation={onEndNavigation}
              />
            ) : null}
          </div>
        </>
      ) : (
        <div
          className={`mt-4 rounded-[22px] border border-dashed px-4 py-5 text-sm leading-6 ${
            isLight
              ? "border-blue-300/40 bg-blue-50/60 text-slate-500"
              : "border-blue-300/20 bg-blue-500/[0.04] text-slate-300/70"
          }`}
        >
          Pick a search origin and focus a shop to unlock live-looking route choices, map path
          drawing, ETA comparison, and turn guidance.
        </div>
      )}
    </div>
  );
}
