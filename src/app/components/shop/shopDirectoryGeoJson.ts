/**
 * GeoJSON builders for the ShopDirectoryMapPane.
 * Pure functions that transform domain data into GeoJSON features.
 */
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { Coordinates, Place, RouteOption, SavedPlace } from "../../types/mapDomain";

// ── Point Feature ──────────────────────────────────────────────────────────
export type PointFeature = {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: Record<string, unknown>;
};

export type PointFeatureCollection = {
  type: "FeatureCollection";
  features: PointFeature[];
};

// ── Line Feature ───────────────────────────────────────────────────────────
export type LineFeature = {
  type: "Feature";
  geometry: { type: "LineString"; coordinates: number[][] };
  properties: Record<string, unknown>;
};

export type LineFeatureCollection = {
  type: "FeatureCollection";
  features: LineFeature[];
};

// ── Shops ──────────────────────────────────────────────────────────────────
export function buildShopsGeoJson(
  shops: ShopMapListing[],
  selectedShopId: number | null
): PointFeatureCollection {
  return {
    type: "FeatureCollection",
    features: shops.map((shop) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [
          shop.mapResult.coordinates.longitude,
          shop.mapResult.coordinates.latitude,
        ] as [number, number],
      },
      properties: {
        id: shop.id,
        name: shop.name,
        address: `${shop.mapResult.address}, ${shop.mapResult.city}`,
        recommendationScore: shop.recommendationScore,
        insuranceCompatibilityScore: shop.insuranceCompatibilityScore,
        isSelected: shop.id === selectedShopId ? 1 : 0,
        topPick: shop.topPick ? 1 : 0,
      },
    })),
  };
}

// ── Routes ─────────────────────────────────────────────────────────────────
export function buildRoutesGeoJson(
  routeOptions: RouteOption[],
  selectedRoute: RouteOption | null,
  navigationMode: string,
  userCoords: Coordinates | null
): LineFeatureCollection {
  const isGuidance = navigationMode === "guidance";
  const features: LineFeature[] = routeOptions.flatMap((route) => {
    const coords = route.polyline.map((p) => [p.longitude, p.latitude] as [number, number]);
    const isSelected = route.id === selectedRoute?.id;
    const baseProps = {
      id: route.id,
      accentColor: route.accentColor,
      isSelected: isSelected ? 1 : 0,
      label: route.label,
      totalDistanceLabel: route.totalDistanceLabel,
      estimatedDurationMinutes: route.estimatedDurationMinutes,
      trafficLabel: route.trafficLabel,
      isGuidanceActive: isGuidance && isSelected ? 1 : 0,
      isTravelled: 0,
    };

    // During guidance, split selected route into travelled + remaining
    if (isGuidance && isSelected && userCoords && coords.length > 1) {
      const userLng = userCoords.longitude;
      const userLat = userCoords.latitude;
      let closestIdx = 0;
      let closestDist = Infinity;
      for (let i = 0; i < coords.length; i++) {
        const dx = coords[i][0] - userLng;
        const dy = coords[i][1] - userLat;
        const d = dx * dx + dy * dy;
        if (d < closestDist) {
          closestDist = d;
          closestIdx = i;
        }
      }

      const travelledCoords = coords.slice(0, closestIdx + 1);
      const remainingCoords = coords.slice(closestIdx);

      const result: LineFeature[] = [];
      if (travelledCoords.length >= 2) {
        result.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates: travelledCoords },
          properties: { ...baseProps, isTravelled: 1 },
        });
      }
      if (remainingCoords.length >= 2) {
        result.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates: remainingCoords },
          properties: { ...baseProps, isTravelled: 0 },
        });
      }
      return result.length > 0
        ? result
        : [
            {
              type: "Feature" as const,
              geometry: { type: "LineString" as const, coordinates: coords },
              properties: baseProps,
            },
          ];
    }

    return [
      {
        type: "Feature" as const,
        geometry: { type: "LineString" as const, coordinates: coords },
        properties: baseProps,
      },
    ];
  });

  return { type: "FeatureCollection", features };
}

// ── Origin ─────────────────────────────────────────────────────────────────
export function buildOriginGeoJson(origin: Place | null): PointFeature | null {
  if (!origin) return null;
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [origin.longitude, origin.latitude] as [number, number],
    },
    properties: { name: origin.name, address: origin.address },
  };
}

// ── User Coords ────────────────────────────────────────────────────────────
export function buildUserCoordsGeoJson(userCoords: Coordinates | null): PointFeature | null {
  if (!userCoords) return null;
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [userCoords.longitude, userCoords.latitude] as [number, number],
    },
    properties: {},
  };
}

// ── Saved Places ───────────────────────────────────────────────────────────
export function buildSavedPlacesGeoJson(savedPlaces: SavedPlace[]): PointFeatureCollection {
  return {
    type: "FeatureCollection",
    features: savedPlaces.map((place) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [place.longitude, place.latitude] as [number, number],
      },
      properties: { id: place.id, label: place.label, address: place.address },
    })),
  };
}
