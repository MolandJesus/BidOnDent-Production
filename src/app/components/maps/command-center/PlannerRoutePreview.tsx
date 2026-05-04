/**
 * PlannerRoutePreview — Route loading, error, preview, alternatives, metrics, turns, attribution.
 *
 * Pure presentation component extracted from CoverageNavigationPlanner (Pass 27).
 * All state and orchestration remain in the parent shell.
 */

import { MapPinned, Navigation, RefreshCcw, Route } from "lucide-react";
import { cn } from "../../ui/utils";
import { formatApproximateDriveWindow, formatDistanceMiles } from "../mapRoutePresentation";
import type { MapSurfaceTheme, MapSurfaceTone } from "../serviceCoverageMapTypes";
import type { NavigationRoutePreview } from "../../../types/navigation";
import type { CoveragePartnerShop } from "../serviceCoverageMapTypes";
import { formatRouteAlternativeDeltaLabel } from "../../../services/navigation/navigationPlannerPresentation";

type PlannerRoutePreviewProps = {
  tone: MapSurfaceTone;
  theme: MapSurfaceTheme;
  showAdvancedControls: boolean;
  isSearchFocus: boolean;
  selectedShop: CoveragePartnerShop | null;
  routePreview: NavigationRoutePreview | null;
  routeAlternatives: NavigationRoutePreview[];
  selectedRouteIndex: number;
  onSelectRouteIndex: (index: number) => void;
  isLoadingRoute: boolean;
  routeError: string;
  routeDistanceMiles: number | null;
  routeDurationMinutes: number | null;
  onResetNavigationSettings: () => void;
  onRetryRoutePreview: () => void;
  onStartNavigation: () => void;
  onOpenShops: () => void;
  currentStepIndex: number;
};

export default function PlannerRoutePreview({
  tone,
  theme,
  showAdvancedControls,
  isSearchFocus,
  selectedShop,
  routePreview,
  routeAlternatives,
  selectedRouteIndex,
  onSelectRouteIndex,
  isLoadingRoute,
  routeError,
  routeDistanceMiles,
  routeDurationMinutes,
  onResetNavigationSettings,
  onRetryRoutePreview,
  onStartNavigation,
  onOpenShops,
  currentStepIndex,
}: PlannerRoutePreviewProps) {
  return (
    <>
      {showAdvancedControls ? (
        <div
          className={cn(
            "map-liquid-panel map-ui-enter map-ui-enter-delay-3 p-3",
            theme.accentPanelClassName
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className={theme.metricLabelClassName}>Route to shop</div>
              <div className={cn("mt-0.5 text-sm font-semibold", theme.titleClassName)}>
                {selectedShop ? selectedShop.name : "Select a shop"}
              </div>
            </div>
            <button
              type="button"
              onClick={onResetNavigationSettings}
              className={cn(theme.secondaryButtonClassName, "!py-1 !px-2.5 !text-xs !gap-1")}
            >
              <RefreshCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {isLoadingRoute ? (
            <div className="mt-2 space-y-2">
              <div className={cn("text-xs", theme.bodyClassName)}>Building route preview…</div>
              <div className="grid gap-2 sm:grid-cols-3">
                <div className={cn("rounded-[0.875rem] px-2.5 py-2", theme.panelClassName)}>
                  <div
                    className={cn(
                      "h-2.5 w-16 animate-pulse rounded",
                      tone === "light" ? "bg-slate-300/50" : "bg-slate-500/30"
                    )}
                  />
                  <div
                    className={cn(
                      "mt-1.5 h-5 w-12 animate-pulse rounded",
                      tone === "light" ? "bg-slate-300/50" : "bg-slate-500/30"
                    )}
                  />
                </div>
                <div className={cn("rounded-[0.875rem] px-2.5 py-2", theme.panelClassName)}>
                  <div
                    className={cn(
                      "h-2.5 w-20 animate-pulse rounded",
                      tone === "light" ? "bg-slate-300/50" : "bg-slate-500/30"
                    )}
                  />
                  <div
                    className={cn(
                      "mt-1.5 h-5 w-14 animate-pulse rounded",
                      tone === "light" ? "bg-slate-300/50" : "bg-slate-500/30"
                    )}
                  />
                </div>
                <div className={cn("rounded-[0.875rem] px-2.5 py-2", theme.panelClassName)}>
                  <div
                    className={cn(
                      "h-2.5 w-12 animate-pulse rounded",
                      tone === "light" ? "bg-slate-300/50" : "bg-slate-500/30"
                    )}
                  />
                  <div
                    className={cn(
                      "mt-1.5 h-5 w-10 animate-pulse rounded",
                      tone === "light" ? "bg-slate-300/50" : "bg-slate-500/30"
                    )}
                  />
                </div>
              </div>
            </div>
          ) : routeError ? (
            <div
              className={cn(
                "mt-2 rounded-[0.875rem] border px-2.5 py-2",
                tone === "light"
                  ? "border-rose-200 bg-rose-50 text-rose-900"
                  : "border-rose-300/20 bg-rose-500/10 text-rose-200"
              )}
            >
              <div className="text-xs">{routeError}</div>
              <button
                type="button"
                onClick={onRetryRoutePreview}
                className={cn(
                  "mt-1.5",
                  theme.secondaryButtonClassName,
                  "!py-1 !px-2.5 !text-xs !gap-1"
                )}
              >
                <RefreshCcw className="h-3 w-3" />
                Retry
              </button>
            </div>
          ) : routePreview ? (
            <>
              {routeAlternatives.length > 1 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {routeAlternatives.map((route, index) => {
                    const isSelected = index === selectedRouteIndex;
                    const distanceMiles = route.distanceMeters / 1609.34;
                    const durationMinutes = Math.round(route.durationSeconds / 60);
                    const comparedToFastestSeconds =
                      route.durationSeconds - routeAlternatives[0].durationSeconds;

                    return (
                      <button
                        key={`${route.fetchedAt}-${index}`}
                        type="button"
                        onClick={() => onSelectRouteIndex(index)}
                        className={cn(
                          "min-w-[5.5rem] flex-1 rounded-[0.875rem] border px-2.5 py-2 text-left backdrop-blur-2xl transition-all duration-200",
                          isSelected
                            ? tone === "light"
                              ? "border-sky-300/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.86))]"
                              : "border-cyan-400/30 bg-[linear-gradient(180deg,rgba(6,182,212,0.18),rgba(15,23,42,0.78))]"
                            : tone === "light"
                              ? "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.72),rgba(232,238,248,0.68))] hover:bg-[linear-gradient(180deg,rgba(247,232,194,0.88),rgba(232,238,248,0.84))]"
                              : "border-white/10 bg-slate-900/76 hover:bg-slate-900/88"
                        )}
                      >
                        <div className={cn("text-xs font-semibold", theme.titleClassName)}>
                          {index === 0 ? "Fastest" : `Alt ${index}`}
                        </div>
                        <div className={cn("text-[10px]", theme.secondaryTextClassName)}>
                          {formatDistanceMiles(distanceMiles)} • {durationMinutes} min
                        </div>
                        {index > 0 ? (
                          <div className={cn("text-[10px]", theme.secondaryTextClassName)}>
                            {formatRouteAlternativeDeltaLabel(comparedToFastestSeconds)}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className={cn("rounded-[0.875rem] px-2.5 py-2", theme.panelClassName)}>
                  <div className={theme.metricLabelClassName}>Distance</div>
                  <div className={cn("mt-0.5 text-base font-semibold", theme.titleClassName)}>
                    {formatDistanceMiles(routeDistanceMiles)}
                  </div>
                </div>
                <div className={cn("rounded-[0.875rem] px-2.5 py-2", theme.panelClassName)}>
                  <div className={theme.metricLabelClassName}>Drive window</div>
                  <div className={cn("mt-0.5 text-base font-semibold", theme.titleClassName)}>
                    {formatApproximateDriveWindow(routeDistanceMiles) ||
                      (routeDurationMinutes ? `${Math.round(routeDurationMinutes)} min` : "--")}
                  </div>
                </div>
                <div className={cn("rounded-[0.875rem] px-2.5 py-2", theme.panelClassName)}>
                  <div className={theme.metricLabelClassName}>Turn steps</div>
                  <div className={cn("mt-0.5 text-base font-semibold", theme.titleClassName)}>
                    {routePreview.steps.length}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={cn("mt-2 text-xs", theme.secondaryTextClassName)}>
              Pick a shop and provide GPS or a searched address to build a route.
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {!selectedShop ? (
              <button
                type="button"
                onClick={onOpenShops}
                className={cn(theme.secondaryButtonClassName, "!py-1.5 !px-3 !text-xs")}
              >
                <MapPinned className="h-3.5 w-3.5" />
                Open Shops
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartNavigation}
                disabled={!routePreview || isLoadingRoute}
                className={cn(
                  theme.primaryButtonClassName,
                  "!py-1.5 !px-3 !text-xs disabled:opacity-50"
                )}
              >
                <Navigation className="h-3.5 w-3.5" />
                Start Route
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "map-liquid-panel map-ui-enter map-ui-enter-delay-3 p-4",
            theme.accentPanelClassName
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                tone === "light" ? "bg-blue-100 text-blue-600" : "bg-blue-400/12 text-blue-300"
              )}
            >
              <Route className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className={theme.metricLabelClassName}>Your route</div>
              <div className={cn("mt-0.5 text-sm font-semibold", theme.titleClassName)}>
                {selectedShop ? selectedShop.name : "Choose a destination"}
              </div>
              <div className={cn("mt-1 text-xs leading-relaxed", theme.secondaryTextClassName)}>
                {routePreview
                  ? "Route preview is ready. Tap Start Route when you\u2019re set."
                  : selectedShop
                    ? "Provide GPS location or search an address to build a route."
                    : "Open the Shops tab to choose a destination, then search an origin address."}
              </div>
            </div>
          </div>
          {routePreview && routeDistanceMiles !== null ? (
            <div className="mt-3 flex flex-wrap gap-3">
              <div className={cn("text-xs font-medium", theme.secondaryTextClassName)}>
                {formatDistanceMiles(routeDistanceMiles)}
              </div>
              {routeDurationMinutes !== null ? (
                <div className={cn("text-xs font-medium", theme.secondaryTextClassName)}>
                  {formatApproximateDriveWindow(routeDistanceMiles) ||
                    `${Math.round(routeDurationMinutes)} min`}
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {!selectedShop ? (
              <button
                type="button"
                onClick={onOpenShops}
                className={cn(theme.secondaryButtonClassName, "!py-1.5 !px-3 !text-xs")}
              >
                <MapPinned className="h-3.5 w-3.5" />
                Open Shops
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartNavigation}
                disabled={!routePreview || isLoadingRoute}
                className={cn(
                  theme.primaryButtonClassName,
                  "!py-1.5 !px-3 !text-xs disabled:opacity-50"
                )}
              >
                <Navigation className="h-3.5 w-3.5" />
                Start Route
              </button>
            )}
          </div>
        </div>
      )}

      {!isSearchFocus && routePreview?.steps.length ? (
        <div
          className={cn(
            "map-liquid-card map-ui-enter map-ui-enter-delay-3 p-3",
            theme.panelClassName
          )}
        >
          <div className={theme.metricLabelClassName}>Upcoming turns</div>
          <div className="mt-2 space-y-1">
            {routePreview.steps.slice(currentStepIndex, currentStepIndex + 5).map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "rounded-[0.875rem] border px-2.5 py-2 transition-all duration-200 backdrop-blur-2xl",
                  index === 0
                    ? tone === "light"
                      ? "border-sky-300/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.96),rgba(219,234,254,0.86))]"
                      : "border-cyan-400/30 bg-[linear-gradient(180deg,rgba(6,182,212,0.18),rgba(15,23,42,0.78))]"
                    : tone === "light"
                      ? "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.72),rgba(232,238,248,0.68))]"
                      : "border-white/10 bg-slate-900/76"
                )}
              >
                <div className={cn("text-xs font-semibold leading-5", theme.titleClassName)}>
                  {step.instruction}
                </div>
                <div className={cn("text-[10px]", theme.secondaryTextClassName)}>
                  {(step.distanceMeters / 1609.34).toFixed(1)} mi •{" "}
                  {Math.max(1, Math.round(step.durationSeconds / 60))} min
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
