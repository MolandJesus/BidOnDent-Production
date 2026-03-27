import { ChevronDown, ChevronUp, MapPin, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { MapTheme, Place, RouteOption } from "../../types/mapDomain";
import { useNavigationSession } from "../../features/navigation/useNavigationSession";
import {
  haversineDistanceMiles,
  formatDistance,
  computeETA,
} from "../../features/navigation/computeNavigationMetrics";

/* ------------------------------------------------------------------ */
/*  Floating overlays rendered INSIDE the map surface                  */
/*  These adopt the Apple Maps overlay pattern:                        */
/*  – glass-style floating cards                                       */
/*  – positioned absolutely within the map pane                        */
/*  – contextual: only show when data is available                     */
/* ------------------------------------------------------------------ */

type ShopDirectoryMapOverlaysProps = {
  routeOptions: RouteOption[];
  selectedRoute: RouteOption | null;
  selectedOrigin: Place | null;
  selectedShop: ShopMapListing | null;
  routeSummary: IntelligenceSummary;
  onSelectRoute: (id: string) => void;
  intelligenceTitle: string;
  intelligenceCallouts: string[];
  deviationPrompt?: React.ReactNode;
  /** Controls which overlays are visible based on navigation state */
  navigationMode?: "browse" | "route-preview" | "guidance";
  /** Clerk user ID for navigation session identity */
  userId?: string;
  /** Map tile/surface theme — drives overlay color tokens */
  mapTheme?: MapTheme;
};

export default function ShopDirectoryMapOverlays({
  routeOptions,
  selectedRoute,
  selectedOrigin,
  selectedShop,
  routeSummary,
  onSelectRoute,
  intelligenceTitle,
  intelligenceCallouts,
  deviationPrompt,
  navigationMode = "browse",
  userId,
  mapTheme = "dark",
}: ShopDirectoryMapOverlaysProps) {
  const [routeExpanded, setRouteExpanded] = useState(false);
  const [intelligenceExpanded, setIntelligenceExpanded] = useState(false);
  const isDark = mapTheme === "dark";

  // Theme-aware overlay tokens
  const glassPanel = isDark
    ? "border-blue-400/15 bg-slate-950/80 backdrop-blur-md text-white"
    : "border-black/8 bg-white/88 backdrop-blur-md text-slate-800";
  const glassChip = isDark
    ? "border-blue-400/20 bg-slate-950/70 text-white backdrop-blur-md hover:bg-slate-950/80"
    : "border-black/8 bg-white/85 text-slate-700 backdrop-blur-md hover:bg-white/95";
  const secondaryText = isDark ? "text-white/60" : "text-slate-500";
  const inactiveRoute = isDark ? "bg-white/[0.06] text-white/70 hover:bg-white/[0.1]" : "bg-black/[0.04] text-slate-500 hover:bg-black/[0.08]";
  const activeRoute = isDark ? "bg-slate-950 font-semibold text-white" : "bg-white font-semibold text-slate-800 shadow-sm";
  const routeSubtext = isDark ? "text-white/70" : "text-slate-500";
  const routeSubtextActive = isDark ? "text-white/70" : "text-slate-400";
  const divider = isDark ? "border-white/10" : "border-black/8";

  // Navigation session state
  const { session } = useNavigationSession(userId);
  const sessionStatus = session.status;

  // Compute distance and ETA only if origin, shop, and route exist
  let distanceLabel = "";
  let etaLabel = "";
  if (selectedOrigin && selectedShop && selectedRoute) {
    const distance = haversineDistanceMiles(selectedOrigin, selectedShop.mapResult.coordinates);
    distanceLabel = formatDistance(distance);
    etaLabel = computeETA(distance);
  }

  // Session state indicator (text only)
  let sessionStateText = "";
  if (sessionStatus === "idle") sessionStateText = "Idle";
  else if (sessionStatus === "planning") sessionStateText = "Planning route";
  else if (sessionStatus === "active") sessionStateText = "Navigating";
  else if (sessionStatus === "paused") sessionStateText = "Paused";
  else if (sessionStatus === "ended") sessionStateText = "Session ended";

  const hasRoute = selectedOrigin && selectedShop && selectedRoute;
  const showIntelligence = navigationMode === "browse" || navigationMode === "route-preview";
  const showRoute = (navigationMode === "browse" || navigationMode === "route-preview") && hasRoute;
  const showDeviation = navigationMode === "route-preview" || navigationMode === "guidance";

  return (
    <>
      {/* Deviation prompt — top center floating */}
      {showDeviation && deviationPrompt && (
        <div className="pointer-events-auto absolute inset-x-0 top-20 z-[520] flex justify-center px-4">
          {deviationPrompt}
        </div>
      )}

      {/* Intelligence chip — top-left, below header badges */}
      {showIntelligence && (
        <div className="pointer-events-auto absolute left-4 top-20 z-[510] max-w-xs">
          <button
            className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition-colors ${glassChip}`}
            onClick={() => setIntelligenceExpanded((v) => !v)}
            type="button"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            {intelligenceTitle}
            {intelligenceExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
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
                  <p key={callout} className={`text-xs leading-5 ${isDark ? "text-white/85" : "text-slate-700"}`}>
                    {callout}
                  </p>
                ))}
                {hasRoute && (
                  <>
                    <p className={`text-xs leading-5 ${isDark ? "text-blue-200/90" : "text-blue-700"}`}>Distance: {distanceLabel}</p>
                    <p className={`text-xs leading-5 ${isDark ? "text-blue-200/90" : "text-blue-700"}`}>ETA: {etaLabel}</p>
                  </>
                )}
                {sessionStateText && (
                  <p className={`text-xs leading-5 ${isDark ? "text-blue-200/70" : "text-blue-600"}`}>Session: {sessionStateText}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shop action overlay — bottom center, mobile-first */}
      {hasRoute && selectedShop && (
        <div
          className="pointer-events-auto fixed z-[530] flex -translate-x-1/2 flex-col items-center gap-3 px-4 sm:absolute sm:bottom-10 sm:left-1/2 left-1/2"
          style={{ bottom: "max(env(safe-area-inset-bottom, 0px) + 1.5rem, 1.5rem)" }}
        >
          <div className={`rounded-2xl border flex flex-col gap-2 p-4 min-w-[260px] max-w-[95vw] shadow-2xl ${glassPanel}`}>
            <div className={`mb-2 text-center text-base font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
              {selectedShop.name}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <button
                className="flex-1 rounded-xl px-6 py-3 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors min-h-[44px] min-w-[120px]"
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("shop-bid-action", { detail: { shop: selectedShop } })
                  )
                }
              >
                Place Bid
              </button>
              <button
                className={`flex-1 rounded-xl px-6 py-3 text-base font-bold transition-colors min-h-[44px] min-w-[120px] border ${isDark ? "text-blue-200 bg-blue-500/15 hover:bg-blue-500/25 border-blue-400/25" : "text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200"}`}
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("shop-accept-action", { detail: { shop: selectedShop } })
                  )
                }
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route preview — bottom-left floating card */}
      {showRoute && (
        <div className="pointer-events-auto absolute bottom-64 left-4 z-[510] w-80 max-w-[calc(100vw-2rem)] sm:bottom-24">
          <div className={`rounded-2xl border p-3 shadow-2xl ${glassPanel}`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] ${secondaryText}`}>
                <MapPin className="h-3.5 w-3.5" />
                Route
              </div>
              <button
                className={`rounded-full p-1 transition-colors ${secondaryText} hover:opacity-80`}
                onClick={() => setRouteExpanded((v) => !v)}
                type="button"
              >
                {routeExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Compact route tabs */}
            <div className="mt-2 flex gap-1.5">
              {routeOptions.map((route) => {
                const isActive = route.id === selectedRoute.id;
                return (
                  <button
                    key={route.id}
                    className={`flex-1 rounded-xl px-2 py-2 text-center text-xs transition-colors ${isActive ? activeRoute : inactiveRoute}`}
                    onClick={() => onSelectRoute(route.id)}
                    type="button"
                  >
                    <span className="block font-semibold">{route.estimatedDurationMinutes}m</span>
                    <span className={`block text-[10px] ${isActive ? routeSubtextActive : routeSubtext}`}>
                      {route.totalDistanceLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ETA summary line with real metrics */}
            <div className={`mt-2 flex items-center justify-between text-xs ${secondaryText}`}>
              <span className="truncate">
                {selectedOrigin.name} → {selectedShop.name}
              </span>
              <span className={`ml-2 font-semibold whitespace-nowrap ${isDark ? "text-white" : "text-slate-800"}`}>
                {distanceLabel && etaLabel ? `${distanceLabel} • ${etaLabel}` : ""}
              </span>
            </div>

            {/* Expanded turn list */}
            {routeExpanded && (
              <div className={`mt-3 max-h-48 space-y-2 overflow-y-auto border-t pt-3 ${divider}`}>
                {selectedRoute.instructions.map((instruction, index) => (
                  <div key={instruction.id} className="flex gap-2 text-xs">
                    <div
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{ backgroundColor: selectedRoute.accentColor }}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-medium ${isDark ? "text-white" : "text-slate-800"}`}>{instruction.title}</p>
                      <p className={secondaryText}>
                        {instruction.durationMinutes > 0
                          ? `${instruction.durationMinutes} min`
                          : instruction.distanceLabel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
