import { ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { NavigationSessionStatus } from "../../features/navigation";
import type { GpsStatus } from "../../hooks/useNavigationGpsTracking";
import type { MapTheme, Place, RouteOption } from "../../types/mapDomain";
import {
  computeETA,
  formatDistance,
  haversineDistanceMiles,
} from "../../features/navigation/computeNavigationMetrics";
import ShopDirectoryGuidanceCard from "./ShopDirectoryGuidanceCard";
import ShopDirectoryRoutePreviewCard from "./ShopDirectoryRoutePreviewCard";

type ShopDirectoryMapOverlaysProps = {
  routeOptions: RouteOption[];
  selectedRoute: RouteOption | null;
  selectedOrigin: Place | null;
  selectedShop: ShopMapListing | null;
  hasArrived?: boolean;
  routeSummary: IntelligenceSummary;
  onSelectRoute: (id: string) => void;
  intelligenceTitle: string;
  intelligenceCallouts: string[];
  deviationPrompt?: React.ReactNode;
  navigationMode?: "browse" | "route-preview" | "guidance";
  mapTheme?: MapTheme;
  sessionStatus?: NavigationSessionStatus;
  sessionDestinationId?: string | null;
  sessionActiveSeconds?: number;
  sessionDestinationLabel?: string | null;
  remainingEtaLabel?: string | null;
  remainingDistanceLabel?: string | null;
  usingLiveRoutes?: boolean;
  routeError?: string;
  isLoadingRoute?: boolean;
  onPauseNavigation?: () => void;
  onResumeNavigation?: () => void;
  onEndNavigation?: () => void;
  onRecenterNavigation?: () => void;
  onStartNavigation?: () => void;
  onDismissRoutePreview?: () => void;
  directionsLabel?: string;
  overlayTopClass?: string;
  nextInstruction?: string | null;
  followingInstruction?: string | null;
  currentSpeedMph?: number | null;
  speedLimitMph?: number | null;
  gpsStatus?: GpsStatus;
  gpsError?: string;
  onRetryGps?: () => void;
};

export default function ShopDirectoryMapOverlays({
  routeOptions,
  selectedRoute,
  selectedOrigin,
  selectedShop,
  hasArrived = false,
  routeSummary,
  onSelectRoute,
  intelligenceTitle,
  intelligenceCallouts,
  deviationPrompt,
  navigationMode = "browse",
  mapTheme = "dark",
  sessionStatus = "idle",
  sessionDestinationId,
  sessionActiveSeconds = 0,
  sessionDestinationLabel,
  remainingEtaLabel,
  remainingDistanceLabel,
  usingLiveRoutes = false,
  routeError = "",
  isLoadingRoute = false,
  onPauseNavigation,
  onResumeNavigation,
  onEndNavigation,
  onRecenterNavigation,
  onStartNavigation,
  onDismissRoutePreview,
  directionsLabel,
  overlayTopClass = "top-20",
  nextInstruction,
  followingInstruction,
  currentSpeedMph,
  speedLimitMph,
  gpsStatus,
  gpsError,
  onRetryGps,
}: ShopDirectoryMapOverlaysProps) {
  const [intelligenceExpanded, setIntelligenceExpanded] = useState(false);
  const isDark = mapTheme === "dark";

  const glassPanel = isDark
    ? "border-blue-400/25 bg-slate-950/82 backdrop-blur-md text-white shadow-[0_0_24px_rgba(59,130,246,0.08)]"
    : "border-black/8 bg-white/88 backdrop-blur-md text-slate-800";
  const glassChip = isDark
    ? "border-blue-400/30 bg-slate-950/75 text-white backdrop-blur-md hover:bg-slate-950/85 shadow-[0_0_16px_rgba(59,130,246,0.06)]"
    : "border-black/8 bg-white/85 text-slate-700 backdrop-blur-md hover:bg-white/95";
  const secondaryText = isDark ? "text-white/60" : "text-slate-500";
  let distanceLabel = "";
  let etaLabel = "";
  if (selectedOrigin && selectedShop && selectedRoute) {
    const distance = haversineDistanceMiles(selectedOrigin, selectedShop.mapResult.coordinates);
    distanceLabel = formatDistance(distance);
    etaLabel = computeETA(distance);
  }

  let sessionStateText = "";
  if (sessionStatus === "idle") sessionStateText = "Idle";
  else if (sessionStatus === "planning") sessionStateText = "Planning route";
  else if (sessionStatus === "active") sessionStateText = "Navigating";
  else if (sessionStatus === "paused") sessionStateText = "Paused";
  else if (sessionStatus === "ended") sessionStateText = "Session ended";

  const hasRoute = Boolean(selectedOrigin && selectedShop && selectedRoute);
  const selectedShopMatchesSessionDestination = Boolean(
    selectedShop && sessionDestinationId === String(selectedShop.id)
  );
  const isArrivedForSelectedShop = hasArrived && selectedShopMatchesSessionDestination;
  const showGuidanceCard =
    hasRoute &&
    selectedShopMatchesSessionDestination &&
    (sessionStatus === "active" || sessionStatus === "paused");
  const showIntelligence = navigationMode === "browse" || navigationMode === "route-preview";
  const showRoute = (navigationMode === "browse" || navigationMode === "route-preview") && hasRoute;
  const showDeviation = navigationMode === "route-preview" || navigationMode === "guidance";

  return (
    <>
      {showDeviation && deviationPrompt && (
        <div
          className={`pointer-events-auto absolute inset-x-0 ${overlayTopClass} z-[520] flex justify-center px-4`}
        >
          {deviationPrompt}
        </div>
      )}

      {showIntelligence && (
        <div className={`pointer-events-auto absolute left-4 ${overlayTopClass} z-[510] max-w-xs`}>
          <button
            className={`flex min-h-[32px] items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[11px] font-semibold transition-colors ${glassChip}`}
            onClick={() => setIntelligenceExpanded((value) => !value)}
            type="button"
          >
            <Sparkles className="h-3 w-3 text-blue-400" />
            {intelligenceTitle}
            {intelligenceExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>

          {intelligenceExpanded && (
            <div className={`mt-2 rounded-2xl border p-3 shadow-xl ${glassPanel}`}>
              <div className="flex items-center justify-between">
                <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${secondaryText}`}>
                  Intelligence
                </p>
                <button
                  className={`rounded-full p-1 transition-colors ${secondaryText} hover:opacity-80`}
                  onClick={() => setIntelligenceExpanded(false)}
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 space-y-1.5">
                {intelligenceCallouts.map((callout) => (
                  <p
                    key={callout}
                    className={`text-xs leading-5 ${isDark ? "text-white/85" : "text-slate-700"}`}
                  >
                    {callout}
                  </p>
                ))}
                {hasRoute && (
                  <>
                    {isArrivedForSelectedShop ? (
                      <p
                        className={`text-xs leading-5 ${isDark ? "text-emerald-200/90" : "text-emerald-700"}`}
                      >
                        Arrival confirmed at {selectedShop?.name}.
                      </p>
                    ) : (
                      <>
                        <p
                          className={`text-xs leading-5 ${isDark ? "text-blue-200/90" : "text-blue-700"}`}
                        >
                          Distance: {distanceLabel}
                        </p>
                        <p
                          className={`text-xs leading-5 ${isDark ? "text-blue-200/90" : "text-blue-700"}`}
                        >
                          ETA: {etaLabel}
                        </p>
                      </>
                    )}
                    {routeSummary.description ? (
                      <p
                        className={`text-xs leading-5 ${isDark ? "text-white/80" : "text-slate-700"}`}
                      >
                        {routeSummary.description}
                      </p>
                    ) : null}
                  </>
                )}
                {sessionStateText ? (
                  <p
                    className={`text-xs leading-5 ${isDark ? "text-blue-200/70" : "text-blue-600"}`}
                  >
                    Session: {sessionStateText}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {showGuidanceCard && selectedOrigin && selectedShop && selectedRoute ? (
        <ShopDirectoryGuidanceCard
          selectedOrigin={selectedOrigin}
          selectedShop={selectedShop}
          selectedRoute={selectedRoute}
          sessionStatus={sessionStatus}
          sessionDestinationLabel={sessionDestinationLabel}
          routeSummary={routeSummary}
          hasArrived={hasArrived}
          routeError={routeError}
          isLoadingRoute={isLoadingRoute}
          usingLiveRoutes={usingLiveRoutes}
          sessionActiveSeconds={sessionActiveSeconds}
          remainingEtaLabel={remainingEtaLabel}
          remainingDistanceLabel={remainingDistanceLabel}
          distanceLabel={distanceLabel}
          etaLabel={etaLabel}
          isDark={isDark}
          nextInstruction={nextInstruction}
          followingInstruction={followingInstruction}
          currentSpeedMph={currentSpeedMph}
          speedLimitMph={speedLimitMph}
          gpsStatus={gpsStatus}
          gpsError={gpsError}
          onRetryGps={onRetryGps}
          onPauseNavigation={onPauseNavigation}
          onResumeNavigation={onResumeNavigation}
          onEndNavigation={onEndNavigation}
          onRecenterNavigation={onRecenterNavigation}
        />
      ) : null}

      {showRoute && selectedOrigin && selectedShop && selectedRoute ? (
        <ShopDirectoryRoutePreviewCard
          routeOptions={routeOptions}
          selectedRoute={selectedRoute}
          selectedOrigin={selectedOrigin}
          selectedShop={selectedShop}
          isArrivedForSelectedShop={isArrivedForSelectedShop}
          routeSummary={routeSummary}
          routeError={routeError}
          isLoadingRoute={isLoadingRoute}
          usingLiveRoutes={usingLiveRoutes}
          hasArrived={hasArrived}
          distanceLabel={distanceLabel}
          etaLabel={etaLabel}
          isDark={isDark}
          onSelectRoute={onSelectRoute}
          onStartNavigation={onStartNavigation}
          onDismiss={onDismissRoutePreview}
          directionsLabel={directionsLabel}
        />
      ) : null}
    </>
  );
}
