import { ChevronDown, ChevronUp, MapPin, Sparkles, X } from "lucide-react";
import { useState } from "react";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { Place, RouteOption } from "../../types/mapDomain";
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
}: ShopDirectoryMapOverlaysProps) {
  const [routeExpanded, setRouteExpanded] = useState(false);
  const [intelligenceExpanded, setIntelligenceExpanded] = useState(false);

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
            className="flex items-center gap-2 rounded-2xl border border-white/20 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-colors hover:bg-slate-950/80"
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
            <div className="mt-2 rounded-2xl border border-white/15 bg-slate-950/75 p-3 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                  Intelligence
                </p>
                <button
                  className="rounded-full p-1 text-white/50 transition-colors hover:text-white"
                  onClick={() => setIntelligenceExpanded(false)}
                  type="button"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 space-y-1.5">
                {intelligenceCallouts.map((callout) => (
                  <p key={callout} className="text-xs leading-5 text-white/85">
                    {callout}
                  </p>
                ))}
                {/* Overlay enrichment: distance, ETA, session state */}
                {hasRoute && (
                  <>
                    <p className="text-xs leading-5 text-blue-200/90">Distance: {distanceLabel}</p>
                    <p className="text-xs leading-5 text-blue-200/90">ETA: {etaLabel}</p>
                  </>
                )}
                {sessionStateText && (
                  <p className="text-xs leading-5 text-blue-200/70">Session: {sessionStateText}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Route preview — bottom-left floating card */}
      {showRoute && (
        <div className="pointer-events-auto absolute bottom-64 left-4 z-[510] w-80 max-w-[calc(100vw-2rem)] sm:bottom-24">
          <div className="rounded-2xl border border-white/15 bg-white/95 p-3 shadow-2xl backdrop-blur-md dark:bg-slate-900/90">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <MapPin className="h-3.5 w-3.5" />
                Route
              </div>
              <button
                className="rounded-full p-1 text-slate-400 transition-colors hover:text-slate-600"
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
                    className={`flex-1 rounded-xl px-2 py-2 text-center text-xs transition-colors ${
                      isActive
                        ? "bg-slate-950 font-semibold text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    onClick={() => onSelectRoute(route.id)}
                    type="button"
                  >
                    <span className="block font-semibold">{route.estimatedDurationMinutes}m</span>
                    <span
                      className={`block text-[10px] ${isActive ? "text-white/70" : "text-slate-400"}`}
                    >
                      {route.totalDistanceLabel}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ETA summary line with real metrics */}
            <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
              <span className="truncate">
                {selectedOrigin.name} → {selectedShop.name}
              </span>
              <span className="ml-2 font-semibold text-slate-950 whitespace-nowrap">
                {distanceLabel && etaLabel ? `${distanceLabel} • ${etaLabel}` : ""}
              </span>
            </div>

            {/* Expanded turn list */}
            {routeExpanded && (
              <div className="mt-3 max-h-48 space-y-2 overflow-y-auto border-t border-slate-200 pt-3">
                {selectedRoute.instructions.map((instruction, index) => (
                  <div key={instruction.id} className="flex gap-2 text-xs">
                    <div
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                      style={{ backgroundColor: selectedRoute.accentColor }}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{instruction.title}</p>
                      <p className="text-slate-500">
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
