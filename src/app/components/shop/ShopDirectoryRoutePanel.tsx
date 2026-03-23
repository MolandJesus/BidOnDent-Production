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
    <div className="mb-5 rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        <MapPin className="h-4 w-4" />
        Route preview
      </div>
      <p className="mt-2 text-lg font-semibold text-slate-950">{routeSummary.title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{routeSummary.description}</p>

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
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
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
                      isActiveRoute ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {route.estimatedDurationMinutes} min
                  </p>
                  <p
                    className={`mt-1 text-xs ${isActiveRoute ? "text-white/70" : "text-slate-500"}`}
                  >
                    {route.totalDistanceLabel} • {route.trafficLabel}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-[24px] bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Active route
                </p>
                <p className="mt-1 text-base font-semibold text-slate-950">
                  {selectedOrigin.name} to {selectedShop.name}
                </p>
              </div>
              <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">ETA</p>
                <p className="text-lg font-semibold text-slate-950">
                  {selectedRoute.estimatedDurationMinutes} min
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {selectedRoute.instructions.map((instruction, index) => (
                <div
                  key={instruction.id}
                  className="flex gap-3 rounded-[20px] border border-slate-200 bg-white px-3 py-3"
                >
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: selectedRoute.accentColor }}
                  >
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-950">{instruction.title}</p>
                      <p className="text-sm text-slate-500">
                        {instruction.durationMinutes > 0
                          ? `${instruction.durationMinutes} min`
                          : instruction.distanceLabel}
                      </p>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{instruction.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="mt-4 rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          Pick a search origin and focus a shop to unlock live-looking route choices, map path
          drawing, ETA comparison, and turn guidance.
        </div>
      )}
    </div>
  );
}
