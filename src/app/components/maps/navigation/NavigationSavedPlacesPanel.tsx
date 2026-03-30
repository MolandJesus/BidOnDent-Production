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
    <div className={cn("space-y-3 rounded-[1.75rem] p-3", theme.panelStrongClassName)}>
      <div>
        <div className={theme.eyebrowClassName}>Saved Places</div>
        <div className={cn("mt-1.5 text-sm", theme.secondaryTextClassName)}>
          Save favorite locations and mark where the car is parked.
        </div>
      </div>

      <div className={cn("p-3", theme.panelClassName)}>
        <div className={theme.metricLabelClassName}>Save current origin</div>
        <div className={cn("mt-1.5 truncate text-sm font-semibold", theme.titleClassName)}>
          {activeOriginLabel}
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          <button
            type="button"
            disabled={!activeOriginTarget}
            onClick={() => onSaveCurrentOrigin("home")}
            className={cn(
              theme.compactButtonClassName,
              "flex-col !gap-1 !px-2 !py-2.5 disabled:opacity-50"
            )}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </button>
          <button
            type="button"
            disabled={!activeOriginTarget}
            onClick={() => onSaveCurrentOrigin("work")}
            className={cn(
              theme.compactButtonClassName,
              "flex-col !gap-1 !px-2 !py-2.5 disabled:opacity-50"
            )}
          >
            <BriefcaseBusiness className="h-4 w-4" />
            <span>Work</span>
          </button>
          <button
            type="button"
            disabled={!activeOriginTarget}
            onClick={() => onSaveCurrentOrigin("saved")}
            className={cn(
              theme.compactButtonClassName,
              "flex-col !gap-1 !px-2 !py-2.5 disabled:opacity-50",
              tone === "light"
                ? "!border-sky-200/60 !bg-sky-50/80 !text-sky-700"
                : "!border-cyan-400/20 !bg-cyan-500/10 !text-cyan-200"
            )}
          >
            <Star className="h-4 w-4" />
            <span>Place</span>
          </button>
        </div>
      </div>

      <div className={cn("p-3", theme.accentPanelClassName)}>
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              tone === "light" ? "bg-blue-100 text-blue-600" : "bg-blue-400/12 text-blue-300"
            )}
          >
            <CarFront className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className={theme.metricLabelClassName}>Parked car</div>
            <div className={cn("mt-1 truncate text-sm font-semibold", theme.titleClassName)}>
              {parkedCar?.roadName || parkedCar?.label || "Not saved yet"}
            </div>
            <div className={cn("mt-0.5 text-xs", theme.secondaryTextClassName)}>
              {parkedCar
                ? `Saved ${new Date(parkedCar.savedAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}`
                : "Mark where the car is parked using live GPS."}
            </div>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            disabled={!currentPositionAvailable}
            onClick={onSaveParkedCar}
            className={cn(theme.compactButtonClassName, "disabled:opacity-50")}
          >
            <CarFront className="h-3.5 w-3.5" />
            {parkedCar ? "Update" : "Save"}
          </button>
          {parkedCar ? (
            <>
              <button
                type="button"
                onClick={() => onUseSavedLocation(parkedCarToTarget(parkedCar))}
                className={theme.compactButtonClassName}
              >
                <LocateFixed className="h-3.5 w-3.5" />
                Use as Origin
              </button>
              <button
                type="button"
                onClick={onClearParkedCar}
                className={theme.compactButtonClassName}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <div className={cn("p-3", theme.panelClassName)}>
          <div className={theme.metricLabelClassName}>Pinned places</div>
          <div className="mt-2.5 space-y-1.5">
            {pinnedLocations.length === 0 ? (
              <div className={cn("text-sm", theme.secondaryTextClassName)}>
                Save Home, Work, or custom places from the current origin.
              </div>
            ) : (
              pinnedLocations.map((location) => {
                const Icon = categoryIcon(location.category);

                return (
                  <div key={location.id} className={theme.listCardClassName}>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          tone === "light"
                            ? "bg-sky-100 text-sky-700"
                            : "bg-cyan-400/12 text-cyan-200"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={cn("truncate text-sm font-semibold", theme.titleClassName)}>
                          {location.label}
                        </div>
                        <div className={cn("text-xs", theme.secondaryTextClassName)}>
                          {location.subtitle || categoryLabel(location.category)}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onUseSavedLocation(locationToTarget(location), location.id)
                          }
                          className={cn(theme.compactIconButtonClassName)}
                          title="Use as origin"
                        >
                          <MapPinned className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSavedLocation(location.id)}
                          className={cn(
                            "inline-flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
                            tone === "light"
                              ? "text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                              : "text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
                          )}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className={cn("p-3", theme.panelClassName)}>
          <div className={theme.metricLabelClassName}>Recent places</div>
          <div className="mt-2.5 space-y-1.5">
            {recentLocations.length === 0 ? (
              <div className={cn("text-sm", theme.secondaryTextClassName)}>
                Recent destinations will appear here after use.
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
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          tone === "light"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-white/8 text-slate-100"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={cn("truncate text-sm font-semibold", theme.titleClassName)}>
                          {location.label}
                        </div>
                        <div className={cn("text-xs", theme.secondaryTextClassName)}>
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
