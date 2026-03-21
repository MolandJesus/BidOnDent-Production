import {
  BriefcaseBusiness,
  CarFront,
  Clock3,
  Home,
  LocateFixed,
  MapPinned,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "../../ui/utils";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";
import type { CoverageSearchTarget, MapSurfaceTone } from "../serviceCoverageMapTypes";
import type {
  NavigationParkedCarLocation,
  NavigationSavedLocation,
  NavigationSavedLocationCategory,
} from "../../../types/navigation";

type NavigationSavedPlacesPanelProps = {
  tone: MapSurfaceTone;
  activeOriginLabel: string;
  activeOriginTarget: CoverageSearchTarget | null;
  currentPositionAvailable: boolean;
  pinnedLocations: NavigationSavedLocation[];
  recentLocations: NavigationSavedLocation[];
  parkedCar: NavigationParkedCarLocation | null;
  onSaveCurrentOrigin: (category: "home" | "work" | "saved") => void;
  onUseSavedLocation: (target: CoverageSearchTarget, id?: string) => void;
  onDeleteSavedLocation: (id: string) => void;
  onSaveParkedCar: () => void;
  onClearParkedCar: () => void;
};

function categoryLabel(category: NavigationSavedLocationCategory) {
  if (category === "home") {
    return "Home";
  }

  if (category === "work") {
    return "Work";
  }

  if (category === "recent") {
    return "Recent";
  }

  if (category === "parked-car") {
    return "Parked Car";
  }

  return "Saved";
}

function categoryIcon(category: NavigationSavedLocationCategory) {
  if (category === "home") {
    return Home;
  }

  if (category === "work") {
    return BriefcaseBusiness;
  }

  if (category === "recent") {
    return Clock3;
  }

  if (category === "parked-car") {
    return CarFront;
  }

  return Star;
}

function locationToTarget(location: NavigationSavedLocation): CoverageSearchTarget {
  return {
    lat: location.coordinate.lat,
    lng: location.coordinate.lng,
    label: location.label,
    county: location.subtitle,
    source: "address",
  };
}

function parkedCarToTarget(parkedCar: NavigationParkedCarLocation): CoverageSearchTarget {
  return {
    lat: parkedCar.coordinate.lat,
    lng: parkedCar.coordinate.lng,
    label: parkedCar.label,
    county: parkedCar.roadName,
    source: "address",
  };
}

export default function NavigationSavedPlacesPanel({
  tone,
  activeOriginLabel,
  activeOriginTarget,
  currentPositionAvailable,
  pinnedLocations,
  recentLocations,
  parkedCar,
  onSaveCurrentOrigin,
  onUseSavedLocation,
  onDeleteSavedLocation,
  onSaveParkedCar,
  onClearParkedCar,
}: NavigationSavedPlacesPanelProps) {
  const theme = getMapSurfaceTheme(tone, true);

  return (
    <div className={cn("space-y-4 rounded-[1.75rem] p-4", theme.panelStrongClassName)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className={theme.eyebrowClassName}>Saved Places</div>
          <div className={cn("mt-3 text-base font-semibold", theme.titleClassName)}>
            Origin shortcuts and parked car
          </div>
          <div className={cn("mt-1 text-sm", theme.secondaryTextClassName)}>
            Keep favorite locations handy and save where the car is parked.
          </div>
        </div>
      </div>

      <div className={cn("p-4", theme.panelClassName)}>
        <div className={theme.metricLabelClassName}>Save current origin</div>
        <div className={cn("mt-2 text-sm font-semibold", theme.titleClassName)}>
          {activeOriginLabel}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!activeOriginTarget}
            onClick={() => onSaveCurrentOrigin("home")}
            className={cn(theme.secondaryButtonClassName, "disabled:opacity-50")}
          >
            <Home className="h-4 w-4" />
            Save Home
          </button>
          <button
            type="button"
            disabled={!activeOriginTarget}
            onClick={() => onSaveCurrentOrigin("work")}
            className={cn(theme.secondaryButtonClassName, "disabled:opacity-50")}
          >
            <BriefcaseBusiness className="h-4 w-4" />
            Save Work
          </button>
          <button
            type="button"
            disabled={!activeOriginTarget}
            onClick={() => onSaveCurrentOrigin("saved")}
            className={cn(theme.primaryButtonClassName, "disabled:opacity-50")}
          >
            <Star className="h-4 w-4" />
            Save Place
          </button>
        </div>
      </div>

      <div className={cn("p-4", theme.accentPanelClassName)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className={theme.metricLabelClassName}>Parked car</div>
            <div className={cn("mt-2 text-sm font-semibold", theme.titleClassName)}>
              {parkedCar?.roadName || parkedCar?.label || "No parked car saved yet"}
            </div>
            <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
              {parkedCar
                ? `Saved ${new Date(parkedCar.savedAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}`
                : "Save the current live location to mark where the car is parked."}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!currentPositionAvailable}
              onClick={onSaveParkedCar}
              className={cn(theme.primaryButtonClassName, "disabled:opacity-50")}
            >
              <CarFront className="h-4 w-4" />
              Save Parked Car
            </button>
            {parkedCar ? (
              <>
                <button
                  type="button"
                  onClick={() => onUseSavedLocation(parkedCarToTarget(parkedCar))}
                  className={theme.secondaryButtonClassName}
                >
                  <LocateFixed className="h-4 w-4" />
                  Use as Origin
                </button>
                <button
                  type="button"
                  onClick={onClearParkedCar}
                  className={theme.secondaryButtonClassName}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
        <div className={cn("p-4", theme.panelClassName)}>
          <div className={theme.metricLabelClassName}>Pinned places</div>
          <div className="mt-3 space-y-2">
            {pinnedLocations.length === 0 ? (
              <div className={cn("text-sm", theme.secondaryTextClassName)}>
                Save Home, Work, or custom places from the current origin.
              </div>
            ) : (
              pinnedLocations.map((location) => {
                const Icon = categoryIcon(location.category);

                return (
                  <div key={location.id} className={theme.listCardClassName}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "inline-flex h-10 w-10 items-center justify-center rounded-full",
                            tone === "light" ? "bg-sky-100 text-sky-700" : "bg-cyan-400/12 text-cyan-200"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                            {location.label}
                          </div>
                          <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                            {location.subtitle || categoryLabel(location.category)}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteSavedLocation(location.id)}
                        className={cn(
                          "inline-flex h-8 w-8 items-center justify-center rounded-full",
                          tone === "light" ? "text-slate-400 hover:bg-slate-100" : "text-slate-400 hover:bg-white/10"
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onUseSavedLocation(locationToTarget(location), location.id)}
                        className={theme.primaryButtonClassName}
                      >
                        <MapPinned className="h-4 w-4" />
                        Use as Origin
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={cn("p-4", theme.panelClassName)}>
          <div className={theme.metricLabelClassName}>Recent places</div>
          <div className="mt-3 space-y-2">
            {recentLocations.length === 0 ? (
              <div className={cn("text-sm", theme.secondaryTextClassName)}>
                Recent destinations and origins will appear here after use.
              </div>
            ) : (
              recentLocations.map((location) => {
                const Icon = categoryIcon(location.category);

                return (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => onUseSavedLocation(locationToTarget(location), location.id)}
                    className={cn("w-full text-left", theme.listCardClassName)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "inline-flex h-10 w-10 items-center justify-center rounded-full",
                          tone === "light" ? "bg-slate-100 text-slate-700" : "bg-white/8 text-slate-100"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                          {location.label}
                        </div>
                        <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                          {location.subtitle || "Recent place"}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
