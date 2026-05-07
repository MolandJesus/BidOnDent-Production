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
  onRetryRoute?: () => void;
  onViewDetails?: (shop: ShopMapListing) => void;
  onRequestEstimate?: (shop: ShopMapListing) => void;
  intelligenceLeftClass?: string;
  density?: "default" | "compact";
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
  onRetryRoute,
  onViewDetails,
  onRequestEstimate,
  intelligenceLeftClass = "left-4",
  density = "default",
}: ShopDirectoryMapOverlaysProps) {
  const [intelligenceExpanded, setIntelligenceExpanded] = useState(false);
  const isDark = mapTheme === "dark";
  const isCompactDensity = density === "compact";

  const glassPanel = isDark
    ? "border-[rgba(96,165,250,0.22)] bg-[linear-gradient(180deg,rgba(30,58,138,0.22)_0%,rgba(12,25,41,0.86)_100%)] backdrop-blur-xl text-white shadow-[inset_0_1px_0_rgba(196,144,65,0.22),inset_0_-1px_0_rgba(140,82,22,0.20),0_0_0_1px_rgba(96,165,250,0.16),0_8px_32px_rgba(2,6,23,0.42),0_0_44px_rgba(196,130,45,0.14)]"
    : "border-[rgba(140,82,22,0.26)] bg-[linear-gradient(180deg,rgba(247,232,194,0.86),rgba(232,238,248,0.80))] backdrop-blur-md text-slate-800 shadow-[inset_0_1px_0_rgba(252,240,208,0.78),0_8px_22px_rgba(15,23,42,0.10)]";
  const glassChip = isDark
    ? "border-[rgba(96,165,250,0.20)] bg-[linear-gradient(180deg,rgba(12,25,41,0.84),rgba(8,16,33,0.78))] text-white backdrop-blur-xl shadow-[inset_0_1px_0_rgba(196,144,65,0.18),inset_0_-1px_0_rgba(140,82,22,0.16),0_4px_20px_rgba(2,6,23,0.46),0_0_18px_rgba(196,130,45,0.10)] hover:bg-[linear-gradient(180deg,rgba(12,25,41,0.94),rgba(8,16,33,0.86))]"
    : "border-[rgba(140,82,22,0.26)] bg-[linear-gradient(180deg,rgba(247,232,194,0.84),rgba(232,238,248,0.78))] text-slate-700 backdrop-blur-md shadow-[inset_0_1px_0_rgba(252,240,208,0.78),0_4px_14px_rgba(15,23,42,0.08)] hover:bg-[linear-gradient(180deg,rgba(247,232,194,0.94),rgba(232,238,248,0.88))]";
  const secondaryText = isDark ? "text-white/60" : "text-slate-500";
  let distanceLabel = "";
  let etaLabel = "";
  if (selectedOrigin && selectedShop?.mapResult?.coordinates && selectedRoute) {
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
  const isActiveSession = sessionStatus === "active" || sessionStatus === "paused";
  const showGuidanceCard =
    hasRoute &&
    isActiveSession &&
    (selectedShopMatchesSessionDestination || (navigationMode === "guidance" && !selectedShop));
  const showIntelligence = navigationMode === "browse" || navigationMode === "route-preview";
  const showRoute = (navigationMode === "browse" || navigationMode === "route-preview") && hasRoute;
  const showDeviation = navigationMode === "route-preview" || navigationMode === "guidance";

  return (
    <>
      {showDeviation && deviationPrompt && (
        <div
          className={`pointer-events-auto absolute inset-x-0 ${overlayTopClass} z-[520] flex justify-center px-4 animate-in fade-in slide-in-from-top-2 duration-300 motion-reduce:animate-none`}
        >
          {deviationPrompt}
        </div>
      )}

      {showIntelligence && (
        <div
          className={`pointer-events-auto absolute ${intelligenceLeftClass} ${overlayTopClass} z-[510] max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-top-2 duration-400 motion-reduce:animate-none ${isCompactDensity ? "sm:max-w-[12.5rem]" : "sm:max-w-xs"}`}
        >
          <button
            className={`flex items-center gap-1.5 rounded-xl border font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              isCompactDensity
                ? "min-h-[34px] px-2.5 py-1.5 text-[10px]"
                : "min-h-[44px] px-3 py-2 text-[11px]"
            } ${glassChip}`}
            onClick={() => setIntelligenceExpanded((value) => !value)}
            onKeyDown={(e) => {
              if (e.key === "Escape" && intelligenceExpanded) {
                setIntelligenceExpanded(false);
                e.stopPropagation();
              }
            }}
            aria-expanded={intelligenceExpanded}
            aria-label="Navigation intelligence"
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
            <div
              className={`mt-2 rounded-2xl border shadow-xl ${
                isCompactDensity ? "p-2.5" : "p-3"
              } ${glassPanel}`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${secondaryText}`}>
                  Intelligence
                </p>
                <button
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${secondaryText} hover:opacity-80`}
                  onClick={() => setIntelligenceExpanded(false)}
                  aria-label="Close intelligence panel"
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

      {showGuidanceCard && selectedRoute ? (
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
          onRetryRoute={onRetryRoute}
          onViewDetails={onViewDetails}
          onRequestEstimate={onRequestEstimate}
          onPauseNavigation={onPauseNavigation}
          onResumeNavigation={onResumeNavigation}
          onEndNavigation={onEndNavigation}
          onRecenterNavigation={onRecenterNavigation}
          density={density}
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
          onRequestEstimate={onRequestEstimate}
          onDismiss={onDismissRoutePreview}
          onRetryRoute={onRetryRoute}
          directionsLabel={directionsLabel}
          density={density}
        />
      ) : null}
    </>
  );
}
