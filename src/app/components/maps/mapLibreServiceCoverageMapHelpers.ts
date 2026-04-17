import type {
  CoverageCountyMarker,
  CoverageSearchTarget,
  MapTileMode,
} from "./serviceCoverageMapTypes";
import type { NavigationSpeedLimitConfidence, NavigationVoiceMode } from "../../types/navigation";
import type { NavigationDiscoveryPlace } from "../../services/navigation/placeDiscovery";
import { circlePolygon } from "./mapLibreHelpers";

export type MapLibreServiceCoverageMapProps = {
  center: [number, number];
  zoom: number;
  revision: number;
  tileMode: MapTileMode;
  counties: CoverageCountyMarker[];
  partnerShops: import("./serviceCoverageMapTypes").CoveragePartnerShop[];
  activeSearchTarget: CoverageSearchTarget | null;
  radiusMeters: number;
  radiusMiles: string;
  regionCount: number;
  selectedShopId?: string;
  selectedDiscoveryPlaceId?: string;
  className?: string;
  mapHeightClassName?: string;
  immersiveFullscreen?: boolean;
  presentationMode?: "coverage" | "navigation";
  showSurfaceChrome?: boolean;
  showNavigationHud?: boolean;
  showReportLayer?: boolean;
  followCurrentPosition?: boolean;
  followCurrentPositionRevision?: number;
  guidanceMode?: boolean;
  currentHeadingDegrees?: number | null;
  hasArrived?: boolean;
  destination?: [number, number] | null;
  discoveryPlaces?: NavigationDiscoveryPlace[];
  routeGeometry?: [number, number][];
  routeFitKey?: string | null;
  currentPosition?: [number, number] | null;
  gpsAccuracyMeters?: number | null;
  currentSpeedMph?: number | null;
  postedSpeedLimitMph?: number | null;
  postedSpeedLimitConfidence?: NavigationSpeedLimitConfidence | null;
  speedLimitMatchDistanceMeters?: number | null;
  nearestRoadName?: string | null;
  nextInstruction?: string | null;
  voiceMode?: NavigationVoiceMode;
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterActive: () => void;
  onResetView: () => void;
  onSelectShop?: (shopId: string) => void;
  onSelectDiscoveryPlace?: (place: NavigationDiscoveryPlace) => void;
  onExpand?: () => void;
};

/* --- GeoJSON builders (pure) --- */

export function buildRouteGeoJSON(routeGeometry?: [number, number][]) {
  if (!routeGeometry || routeGeometry.length < 2) return null;
  return {
    type: "Feature" as const,
    geometry: {
      type: "LineString" as const,
      coordinates: routeGeometry.map(([lat, lng]) => [lng, lat]),
    },
    properties: {},
  };
}

export function buildCountyGeoJSON(counties: CoverageCountyMarker[]) {
  return {
    type: "FeatureCollection" as const,
    features: counties.map((c) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: [c.lng, c.lat] },
      properties: { name: c.name },
    })),
  };
}

export function buildGpsPointGeoJSON(currentPosition?: [number, number] | null) {
  if (!currentPosition) return null;
  return {
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [currentPosition[1], currentPosition[0]],
    },
    properties: {},
  };
}

export function buildGpsHeadingGeoJSON(
  currentPosition?: [number, number] | null,
  guidanceMode?: boolean,
  currentHeadingDegrees?: number | null
) {
  if (!currentPosition || !guidanceMode || typeof currentHeadingDegrees !== "number") return null;
  const [lat, lng] = currentPosition;
  const headingRad = (currentHeadingDegrees * Math.PI) / 180;
  const distDeg = 60 / 111320;
  const endLat = lat + distDeg * Math.cos(headingRad);
  const endLng = lng + (distDeg * Math.sin(headingRad)) / Math.cos((lat * Math.PI) / 180);
  return {
    type: "Feature" as const,
    geometry: {
      type: "LineString" as const,
      coordinates: [
        [lng, lat],
        [endLng, endLat],
      ],
    },
    properties: {},
  };
}

export function buildGpsAccuracyGeoJSON(
  currentPosition?: [number, number] | null,
  gpsAccuracyMeters?: number | null
) {
  if (!currentPosition || !gpsAccuracyMeters) return null;
  return circlePolygon(
    currentPosition[0],
    currentPosition[1],
    Math.max(18, Math.min(gpsAccuracyMeters, 180))
  );
}

export function buildSearchTargetRadiusGeoJSON(
  activeSearchTarget: CoverageSearchTarget | null,
  radiusMeters: number
) {
  if (!activeSearchTarget) return null;
  return circlePolygon(activeSearchTarget.lat, activeSearchTarget.lng, radiusMeters);
}

export function buildSearchTargetPointGeoJSON(activeSearchTarget: CoverageSearchTarget | null) {
  if (!activeSearchTarget) return null;
  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [activeSearchTarget.lng, activeSearchTarget.lat],
        },
        properties: { kind: "outer" },
      },
      {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [activeSearchTarget.lng, activeSearchTarget.lat],
        },
        properties: { kind: "inner" },
      },
    ],
  };
}

export function buildRadiusLabelGeoJSON(
  activeSearchTarget: CoverageSearchTarget | null,
  radiusMeters: number,
  radiusMiles: string
) {
  if (!activeSearchTarget || !radiusMiles) return null;
  const latRad = (activeSearchTarget.lat * Math.PI) / 180;
  const lngOffset = radiusMeters / (111320 * Math.cos(latRad));
  return {
    type: "Feature" as const,
    geometry: {
      type: "Point" as const,
      coordinates: [activeSearchTarget.lng + lngOffset, activeSearchTarget.lat],
    },
    properties: { label: `${radiusMiles} mi` },
  };
}
