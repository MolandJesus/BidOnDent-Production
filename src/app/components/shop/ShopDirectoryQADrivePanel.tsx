import { useMemo, useState } from "react";
import { CarFront, MapPinned } from "lucide-react";
import { ATLANTA_QA_DESTINATIONS, ATLANTA_QA_NEIGHBORHOODS } from "../../services/intelligence/atlantaQADestinations";
import { qaDestinationToNavigationDestination } from "../../services/navigation/navigationDestinationAdapters";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type ShopDirectoryQADrivePanelProps = {
  appearanceMode?: DashboardAppearanceMode;
  onStartDrive: ReturnType<typeof qaDestinationToNavigationDestination> extends infer T
    ? (destination: T) => void
    : never;
};

const KIND_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  gas_station: "Gas station",
  grocery: "Grocery",
  coffee: "Coffee",
  landmark: "Landmark",
  hospital: "Hospital",
  pharmacy: "Pharmacy",
  park: "Park",
};

export default function ShopDirectoryQADrivePanel({
  appearanceMode = "map-dark",
  onStartDrive,
}: ShopDirectoryQADrivePanelProps) {
  const isLight = appearanceMode === "light";
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>(
    ATLANTA_QA_NEIGHBORHOODS[0],
  );

  const visibleDestinations = useMemo(
    () =>
      ATLANTA_QA_DESTINATIONS.filter(
        (destination) => destination.neighborhood === selectedNeighborhood,
      ),
    [selectedNeighborhood],
  );

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <section className="bd-dashboard-panel bd-dashboard-panel--deep mx-4 space-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div
            className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${
              isLight ? "text-blue-600/70" : "text-blue-200/60"
            }`}
          >
            <CarFront className="h-4 w-4" />
            Atlanta QA drives
          </div>
          <h2
            className={`mt-2 text-lg font-semibold ${
              isLight ? "text-slate-900" : "text-slate-100"
            }`}
          >
            Start a real navigation test to a local destination
          </h2>
          <p
            className={`mt-2 max-w-3xl text-sm leading-6 ${
              isLight ? "text-slate-600" : "text-slate-300/80"
            }`}
          >
            QA-only destination pack for Atlanta drive testing. Starting a drive here uses current
            GPS when available, otherwise your selected origin.
          </p>
        </div>

        <div className="bd-dashboard-note bd-dashboard-note--deep rounded-2xl px-3 py-2 text-xs leading-5">
          {ATLANTA_QA_DESTINATIONS.length} test destinations across{" "}
          {ATLANTA_QA_NEIGHBORHOODS.length} neighborhoods
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ATLANTA_QA_NEIGHBORHOODS.map((neighborhood) => {
          const isActive = neighborhood === selectedNeighborhood;

          return (
            <button
              key={neighborhood}
              className={`min-h-[44px] rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? "bd-dashboard-primary-button text-white"
                  : `bd-dashboard-secondary-button ${isLight ? "text-slate-700" : "text-slate-100"}`
              }`}
              onClick={() => setSelectedNeighborhood(neighborhood)}
              type="button"
            >
              {neighborhood}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {visibleDestinations.map((destination) => (
          <article
            key={destination.id}
            className="bd-dashboard-section bd-dashboard-section--deep flex h-full flex-col gap-3 rounded-2xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div
                  className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    isLight ? "text-blue-600/70" : "text-blue-200/55"
                  }`}
                >
                  {KIND_LABELS[destination.kind]}
                </div>
                <h3
                  className={`mt-1 text-base font-semibold ${
                    isLight ? "text-slate-900" : "text-slate-100"
                  }`}
                >
                  {destination.name}
                </h3>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                  destination.isChain
                    ? isLight
                      ? "bg-blue-50 text-blue-700"
                      : "bg-blue-500/15 text-blue-200"
                    : isLight
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-emerald-500/15 text-emerald-200"
                }`}
              >
                {destination.isChain ? "Chain" : "Local"}
              </span>
            </div>

            <div className={`flex items-start gap-2 text-sm ${isLight ? "text-slate-600" : "text-slate-300/80"}`}>
              <MapPinned className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{destination.address}</span>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3">
              <div
                className={`text-xs ${
                  isLight ? "text-slate-500" : "text-slate-400/80"
                }`}
              >
                {destination.coordinates.lat.toFixed(4)}, {destination.coordinates.lng.toFixed(4)}
              </div>
              <button
                className="bd-dashboard-primary-button min-h-[44px] rounded-xl px-3.5 py-2 text-sm font-semibold text-white"
                onClick={() =>
                  onStartDrive(qaDestinationToNavigationDestination(destination))
                }
                type="button"
              >
                Start drive
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
