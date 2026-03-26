import { MapPin } from "lucide-react";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { Place, RouteOption } from "../../types/mapDomain";

export interface ShopDirectoryRoutePanelProps {
  routeSummary: { title: string; description: string };
  routeOptions: RouteOption[];
  selectedRoute: RouteOption | null;
  selectedOrigin: Place | null;
  selectedShop: ShopMapListing | null;
  onSelectRoute: (id: string) => void;
}

export default function ShopDirectoryRoutePanel({
  routeSummary,
  routeOptions,
  selectedRoute,
  selectedOrigin,
  selectedShop,
  onSelectRoute,
}: ShopDirectoryRoutePanelProps) {
  return (
    <div className="mb-5 bd-glass-card p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/50">
        <MapPin className="h-4 w-4" />
        Route preview
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-100">{routeSummary.title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300/80">{routeSummary.description}</p>

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
                      ? "border-blue-400/60 bg-blue-500/20 text-white"
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
                      isActiveRoute ? "text-white" : "text-slate-100"
                    }`}
                  >
                    {route.estimatedDurationMinutes} min
                  </p>
                  <p
                    className={`mt-1 text-xs ${isActiveRoute ? "text-blue-100/70" : "text-slate-400/70"}`}
                  >
                    {route.totalDistanceLabel} • {route.trafficLabel}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-[24px] bg-white/[0.04] border border-white/[0.06] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/50">
                  Active route
                </p>
                <p className="mt-1 text-base font-semibold text-slate-100">
                  {selectedOrigin.name} to {selectedShop.name}
                </p>
              </div>
              <div className="rounded-2xl bg-white/[0.06] border border-white/[0.08] px-3 py-2 text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-blue-200/50">ETA</p>
                <p className="text-lg font-semibold text-slate-100">
                  {selectedRoute.estimatedDurationMinutes} min
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {selectedRoute.instructions.map((instruction, index) => (
                <div
                  key={instruction.id}
                  className="flex gap-3 rounded-[20px] border border-white/[0.08] bg-white/[0.05] px-3 py-3"
                >
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: selectedRoute.accentColor }}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-100">{instruction.title}</p>
                      <p className="text-sm text-slate-400/70">
                        {instruction.durationMinutes > 0
                          ? `${instruction.durationMinutes} min`
                          : instruction.distanceLabel}
                      </p>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-300/80">{instruction.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-[22px] border border-dashed border-blue-300/20 bg-blue-500/[0.04] px-4 py-5 text-sm leading-6 text-slate-300/70">
          Pick a search origin and focus a shop to unlock live-looking route choices, map path
          drawing, ETA comparison, and turn guidance.
        </div>
      )}
    </div>
  );
}
