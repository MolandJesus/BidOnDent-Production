import { Layer, Source } from "react-map-gl/maplibre";

export const SHOP_LAYER = "shop-dir-circles";

const SHOP_GLOW_LAYER = "shop-dir-glow";
const SHOP_LABEL_LAYER = "shop-dir-labels";
const ROUTE_SELECTED_LAYER = "route-selected-line";
const ROUTE_UNSELECTED_LAYER = "route-unselected-line";
const ORIGIN_LAYER = "origin-circle";
const USER_DOT_LAYER = "user-dot-circle";
const USER_RING_LAYER = "user-ring-circle";
const SAVED_PLACES_LAYER = "saved-places-circles";

type PointFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: number[];
  };
  properties: Record<string, unknown>;
};

type PointFeatureCollection = {
  type: "FeatureCollection";
  features: PointFeature[];
};

type LineFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "LineString";
      coordinates: number[][];
    };
    properties: Record<string, unknown>;
  }>;
};

type ShopDirectoryMapLayersProps = {
  isDark: boolean;
  hasRoutes: boolean;
  routesGeoJson: LineFeatureCollection;
  originGeoJson: PointFeature | null;
  userCoordsGeoJson: PointFeature | null;
  savedPlacesGeoJson: PointFeatureCollection;
  shopsGeoJson: PointFeatureCollection;
};

export default function ShopDirectoryMapLayers({
  isDark,
  hasRoutes,
  routesGeoJson,
  originGeoJson,
  userCoordsGeoJson,
  savedPlacesGeoJson,
  shopsGeoJson,
}: ShopDirectoryMapLayersProps) {
  return (
    <>
      {hasRoutes && (
        <Source id="routes-source" type="geojson" data={routesGeoJson}>
          <Layer
            id={ROUTE_UNSELECTED_LAYER}
            type="line"
            filter={["==", ["get", "isSelected"], 0]}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={
              {
                "line-color": ["get", "accentColor"],
                "line-width": 3,
                "line-opacity": 0.38,
                "line-dasharray": [2.5, 3],
              } as Record<string, unknown>
            }
          />
          <Layer
            id="route-selected-glow"
            type="line"
            filter={["==", ["get", "isSelected"], 1]}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={
              {
                "line-color": ["get", "accentColor"],
                "line-width": 22,
                "line-opacity": 0.18,
                "line-blur": 14,
              } as Record<string, unknown>
            }
          />
          {/* White outline — sits between glow and inner core */}
          <Layer
            id="route-selected-outline"
            type="line"
            filter={["==", ["get", "isSelected"], 1]}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={
              {
                "line-color": isDark ? "#e0f2fe" : "#ffffff",
                "line-width": 11,
                "line-opacity": isDark ? 0.88 : 0.92,
              } as Record<string, unknown>
            }
          />
          <Layer
            id={ROUTE_SELECTED_LAYER}
            type="line"
            filter={["==", ["get", "isSelected"], 1]}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={
              {
                "line-color": ["get", "accentColor"],
                "line-width": 7,
                "line-opacity": 0.92,
              } as Record<string, unknown>
            }
          />
        </Source>
      )}

      {originGeoJson && (
        <Source id="origin-source" type="geojson" data={originGeoJson}>
          <Layer
            id={ORIGIN_LAYER}
            type="circle"
            paint={{
              "circle-radius": 9,
              "circle-color": "#f97316",
              "circle-opacity": 0.9,
              "circle-stroke-width": 3,
              "circle-stroke-color": "#fff7ed",
            }}
          />
        </Source>
      )}

      {userCoordsGeoJson && (
        <Source id="user-coords-source" type="geojson" data={userCoordsGeoJson}>
          <Layer
            id={USER_RING_LAYER}
            type="circle"
            paint={{
              "circle-radius": 22,
              "circle-color": isDark ? "#60a5fa" : "#3b82f6",
              "circle-opacity": 0.2,
              "circle-stroke-width": 1.5,
              "circle-stroke-color": isDark ? "#60a5fa" : "#3b82f6",
            }}
          />
          <Layer
            id={USER_DOT_LAYER}
            type="circle"
            paint={{
              "circle-radius": 8,
              "circle-color": isDark ? "#60a5fa" : "#2563eb",
              "circle-opacity": 0.95,
              "circle-stroke-width": 3,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>
      )}

      {savedPlacesGeoJson.features.length > 0 && (
        <Source id="saved-places-source" type="geojson" data={savedPlacesGeoJson}>
          <Layer
            id={SAVED_PLACES_LAYER}
            type="circle"
            paint={{
              "circle-radius": 7,
              "circle-color": "#1d4ed8",
              "circle-opacity": 0.3,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#1d4ed8",
            }}
          />
        </Source>
      )}

      {shopsGeoJson.features.length > 0 && (
        <Source id="shops-source" type="geojson" data={shopsGeoJson}>
          <Layer
            id={SHOP_GLOW_LAYER}
            type="circle"
            filter={["==", ["get", "isSelected"], 1]}
            paint={
              {
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 18, 12, 24, 15, 30],
                "circle-color": "#2563eb",
                "circle-opacity": 0.2,
                "circle-blur": 1,
              } as Record<string, unknown>
            }
          />
          <Layer
            id={SHOP_LAYER}
            type="circle"
            paint={
              {
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  8,
                  [
                    "case",
                    ["==", ["get", "isSelected"], 1],
                    7,
                    ["==", ["get", "topPick"], 1],
                    6,
                    4,
                  ],
                  12,
                  [
                    "case",
                    ["==", ["get", "isSelected"], 1],
                    12,
                    ["==", ["get", "topPick"], 1],
                    10,
                    8,
                  ],
                  15,
                  [
                    "case",
                    ["==", ["get", "isSelected"], 1],
                    16,
                    ["==", ["get", "topPick"], 1],
                    13,
                    10,
                  ],
                ],
                "circle-color": [
                  "case",
                  ["==", ["get", "isSelected"], 1],
                  "#2563eb",
                  ["==", ["get", "topPick"], 1],
                  "#0f172a",
                  "#38bdf8",
                ],
                "circle-opacity": 0.92,
                "circle-stroke-width": ["case", ["==", ["get", "isSelected"], 1], 4, 2],
                "circle-stroke-color": [
                  "case",
                  ["==", ["get", "isSelected"], 1],
                  "#dbeafe",
                  "#eff6ff",
                ],
              } as Record<string, unknown>
            }
          />
          <Layer
            id={SHOP_LABEL_LAYER}
            type="symbol"
            minzoom={12}
            layout={
              {
                "text-field": ["get", "name"],
                "text-size": ["interpolate", ["linear"], ["zoom"], 12, 10, 15, 13],
                "text-offset": [0, 1.8],
                "text-anchor": "top",
                "text-max-width": 10,
                "text-allow-overlap": false,
                "text-optional": true,
              } as Record<string, unknown>
            }
            paint={
              {
                "text-color": isDark ? "#e2e8f0" : "#1e293b",
                "text-halo-color": isDark ? "#0f172a" : "#ffffff",
                "text-halo-width": 1.5,
                "text-opacity": ["case", ["==", ["get", "isSelected"], 1], 1, 0.8],
              } as Record<string, unknown>
            }
          />
        </Source>
      )}
    </>
  );
}
