/**
 * useMapEngineGeoJSON — engine-side GeoJSON memoization for the map canvas.
 *
 * Extracts the seven `useMemo` GeoJSON builders that previously lived inline
 * in `MapLibreServiceCoverageMap.tsx` (lines 117-151 pre-Pass-185). This is
 * Step C.1 sub-pass 1 of the unification plan — isolating engine-data-prep
 * from chrome composition so the eventual `<MapEngineCanvas>` extraction has
 * a clean dependency boundary.
 *
 * No behavior change: same memoization, same builders, same dependency
 * arrays. Hook is consumed by `MapLibreServiceCoverageMap` and (future)
 * `<MapEngineCanvas>`. Safe to consume from any host; pure data
 * transformation, no side effects.
 *
 * Refs:
 *  - PLAN_MAP_UNIFICATION_2026-05-08.md §4 Step C.1
 *  - LAW_LAYERED_ARCHITECTURE.md (L3 hooks for shared engine state)
 */

import { useMemo } from "react";
import type {
  CoverageCountyMarker,
  CoverageSearchTarget,
} from "./serviceCoverageMapTypes";
import {
  buildRouteGeoJSON,
  buildCountyGeoJSON,
  buildGpsPointGeoJSON,
  buildGpsHeadingGeoJSON,
  buildGpsAccuracyGeoJSON,
  buildSearchTargetRadiusGeoJSON,
  buildSearchTargetPointGeoJSON,
  buildRadiusLabelGeoJSON,
} from "./mapLibreServiceCoverageMapHelpers";

export type UseMapEngineGeoJSONInput = {
  routeGeometry?: [number, number][];
  counties: CoverageCountyMarker[];
  currentPosition?: [number, number] | null;
  guidanceMode: boolean;
  currentHeadingDegrees?: number | null;
  gpsAccuracyMeters?: number | null;
  activeSearchTarget: CoverageSearchTarget | null;
  radiusMeters: number;
  radiusMiles: string;
};

export function useMapEngineGeoJSON(input: UseMapEngineGeoJSONInput) {
  const {
    routeGeometry,
    counties,
    currentPosition,
    guidanceMode,
    currentHeadingDegrees,
    gpsAccuracyMeters,
    activeSearchTarget,
    radiusMeters,
    radiusMiles,
  } = input;

  const routeGeoJSON = useMemo(() => buildRouteGeoJSON(routeGeometry), [routeGeometry]);

  const countyGeoJSON = useMemo(() => buildCountyGeoJSON(counties), [counties]);

  const gpsPointGeoJSON = useMemo(() => buildGpsPointGeoJSON(currentPosition), [currentPosition]);

  const gpsHeadingGeoJSON = useMemo(
    () => buildGpsHeadingGeoJSON(currentPosition, guidanceMode, currentHeadingDegrees),
    [currentPosition, guidanceMode, currentHeadingDegrees]
  );

  const gpsAccuracyGeoJSON = useMemo(
    () => buildGpsAccuracyGeoJSON(currentPosition, gpsAccuracyMeters),
    [currentPosition, gpsAccuracyMeters]
  );

  const searchTargetRadiusGeoJSON = useMemo(
    () => buildSearchTargetRadiusGeoJSON(activeSearchTarget, radiusMeters),
    [activeSearchTarget, radiusMeters]
  );

  const searchTargetPointGeoJSON = useMemo(
    () => buildSearchTargetPointGeoJSON(activeSearchTarget),
    [activeSearchTarget]
  );

  const radiusLabelGeoJSON = useMemo(
    () => buildRadiusLabelGeoJSON(activeSearchTarget, radiusMeters, radiusMiles),
    [activeSearchTarget, radiusMeters, radiusMiles]
  );

  return {
    routeGeoJSON,
    countyGeoJSON,
    gpsPointGeoJSON,
    gpsHeadingGeoJSON,
    gpsAccuracyGeoJSON,
    searchTargetRadiusGeoJSON,
    searchTargetPointGeoJSON,
    radiusLabelGeoJSON,
  };
}
