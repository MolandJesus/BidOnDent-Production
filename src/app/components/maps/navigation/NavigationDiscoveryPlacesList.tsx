/**
 * NavigationDiscoveryPlacesList — Discovery places list rendering with
 * selected detail card, loading skeleton, error, and empty states.
 *
 * Extracted from NavigationBrowseDiscoveryPanel.tsx (Pass 31). Zero behavior change.
 */

import { Fuel, Globe, MapPinned, Navigation } from "lucide-react";
import { cn } from "../../ui/utils";
import type {
  CoverageSearchTarget,
  MapSurfaceTheme,
  MapSurfaceTone,
} from "../serviceCoverageMapTypes";
import type { NavigationDiscoveryPlace } from "../../../services/navigation/placeDiscovery";

type NavigationDiscoveryPlacesListProps = {
  tone: MapSurfaceTone;
  theme: MapSurfaceTheme;
  activeSearchTarget: CoverageSearchTarget | null;
  selectedDiscoveryPlaceId?: string;
  selectedDiscoveryPlace: NavigationDiscoveryPlace | null;
  discoveryPlaces: NavigationDiscoveryPlace[];
  isLoadingDiscoveryPlaces: boolean;
  discoveryError: string;
  onSelectDiscoveryPlace: (place: NavigationDiscoveryPlace) => void;
  onOpenDiscoveryPlaceDirections: (place: NavigationDiscoveryPlace) => void;
};

function discoveryCategoryLabel(place: NavigationDiscoveryPlace) {
  if (place.category === "insurance") {
    return "Insurance";
  }

  if (place.category === "fuel") {
    return "Fuel";
  }

  if (place.category === "rental") {
    return "Rental";
  }

  if (place.category === "supplier") {
    return "Supplier";
  }

  return "Body shop";
}

function discoveryCategoryAccentClassName(place: NavigationDiscoveryPlace, tone: MapSurfaceTone) {
  if (place.category === "insurance") {
    return tone === "light" ? "bg-amber-100 text-amber-900" : "bg-amber-300/18 text-amber-100";
  }

  if (place.category === "fuel") {
    return tone === "light" ? "bg-teal-100 text-teal-900" : "bg-teal-300/18 text-teal-100";
  }

  if (place.category === "supplier") {
    return tone === "light" ? "bg-violet-100 text-violet-900" : "bg-violet-300/18 text-violet-100";
  }

  if (place.category === "rental") {
    return tone === "light" ? "bg-blue-100 text-blue-900" : "bg-blue-300/18 text-blue-100";
  }

  return tone === "light" ? "bg-slate-100 text-slate-900" : "bg-white/10 text-slate-100";
}

function discoveryQualityBadgeClassName(place: NavigationDiscoveryPlace, tone: MapSurfaceTone) {
  if (place.qualityLabel === "verified") {
    return tone === "light"
      ? "bg-emerald-100 text-emerald-900"
      : "bg-emerald-300/18 text-emerald-100";
  }

  if (place.qualityLabel === "standard") {
    return tone === "light" ? "bg-sky-100 text-sky-900" : "bg-sky-300/18 text-sky-100";
  }

  return tone === "light" ? "bg-slate-100 text-slate-800" : "bg-white/10 text-slate-200";
}

export default function NavigationDiscoveryPlacesList({
  tone,
  theme,
  activeSearchTarget,
  selectedDiscoveryPlaceId,
  selectedDiscoveryPlace,
  discoveryPlaces,
  isLoadingDiscoveryPlaces,
  discoveryError,
  onSelectDiscoveryPlace,
  onOpenDiscoveryPlaceDirections,
}: NavigationDiscoveryPlacesListProps) {
  if (!activeSearchTarget) {
    return (
      <div className={cn("p-4 text-sm", theme.panelClassName)}>
        Real market places appear after an active ZIP or live-location search exists.
      </div>
    );
  }

  if (isLoadingDiscoveryPlaces) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`discovery-skeleton-${index}`}
            className={cn("space-y-3 rounded-[1rem] p-4", theme.panelClassName)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-300/40" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-slate-300/40" />
            </div>
            <div className="h-3 w-full animate-pulse rounded bg-slate-300/40" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-slate-300/40" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-300/40" />
          </div>
        ))}
      </div>
    );
  }

  if (discoveryError) {
    return (
      <div
        className={cn(
          "rounded-[1rem] border px-4 py-3 text-sm",
          tone === "light"
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-amber-300/20 bg-amber-500/10 text-amber-200"
        )}
      >
        {discoveryError}
      </div>
    );
  }

  if (discoveryPlaces.length === 0) {
    return (
      <div className={cn("p-4 text-sm", theme.panelClassName)}>
        No live places were returned for this role lens in the current area.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {selectedDiscoveryPlace ? (
        <div className={cn("p-4", theme.accentPanelClassName)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className={theme.metricLabelClassName}>Selected live place</div>
              <div className={cn("mt-2 text-lg font-semibold", theme.titleClassName)}>
                {selectedDiscoveryPlace.label}
              </div>
              <div className={cn("mt-2 text-sm leading-6", theme.secondaryTextClassName)}>
                {selectedDiscoveryPlace.subtitle}
              </div>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                discoveryCategoryAccentClassName(selectedDiscoveryPlace, tone)
              )}
            >
              {discoveryCategoryLabel(selectedDiscoveryPlace)}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className={theme.softBadgeClassName}>
              {selectedDiscoveryPlace.distanceMiles.toFixed(1)} miles away
            </span>
            <span className={theme.softBadgeClassName}>OpenStreetMap live data</span>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                discoveryQualityBadgeClassName(selectedDiscoveryPlace, tone)
              )}
            >
              {`${selectedDiscoveryPlace.qualityLabel} ${selectedDiscoveryPlace.qualityScore}`}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelectDiscoveryPlace(selectedDiscoveryPlace)}
              className={theme.secondaryButtonClassName}
            >
              <MapPinned className="h-4 w-4" />
              Preview on map
            </button>
            <button
              type="button"
              onClick={() => onOpenDiscoveryPlaceDirections(selectedDiscoveryPlace)}
              className={theme.primaryButtonClassName}
            >
              <Navigation className="h-4 w-4" />
              Open on map
            </button>
            {selectedDiscoveryPlace.website ? (
              <a
                href={selectedDiscoveryPlace.website}
                target="_blank"
                rel="noreferrer"
                className={theme.secondaryButtonClassName}
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            ) : null}
            {selectedDiscoveryPlace.phoneNumber ? (
              <a
                href={`tel:${selectedDiscoveryPlace.phoneNumber}`}
                className={theme.secondaryButtonClassName}
              >
                <Fuel className="h-4 w-4" />
                Call
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {discoveryPlaces.slice(0, 6).map((place) => (
        <div
          key={place.id}
          className={
            selectedDiscoveryPlaceId === place.id
              ? theme.selectedListCardClassName
              : theme.listCardClassName
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className={cn("truncate text-sm font-semibold", theme.titleClassName)}>
                  {place.label}
                </div>
                {selectedDiscoveryPlaceId === place.id ? (
                  <span className={theme.softBadgeClassName}>Selected</span>
                ) : null}
              </div>
              <div className={cn("mt-1 text-xs leading-5", theme.secondaryTextClassName)}>
                {place.subtitle}
              </div>
            </div>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                discoveryCategoryAccentClassName(place, tone)
              )}
            >
              {discoveryCategoryLabel(place)}
            </span>
          </div>
          <div className={cn("mt-3 text-xs", theme.secondaryTextClassName)}>
            {place.distanceMiles.toFixed(1)} miles away • OpenStreetMap live data •{" "}
            {place.qualityLabel} quality ({place.qualityScore})
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelectDiscoveryPlace(place)}
              className={theme.secondaryButtonClassName}
            >
              <MapPinned className="h-4 w-4" />
              Preview
            </button>
            <button
              type="button"
              onClick={() => onOpenDiscoveryPlaceDirections(place)}
              className={theme.primaryButtonClassName}
            >
              <Navigation className="h-4 w-4" />
              Open on map
            </button>
            {place.website ? (
              <a
                href={place.website}
                target="_blank"
                rel="noreferrer"
                className={theme.secondaryButtonClassName}
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            ) : null}
            {place.phoneNumber ? (
              <a href={`tel:${place.phoneNumber}`} className={theme.secondaryButtonClassName}>
                <Fuel className="h-4 w-4" />
                Call
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
