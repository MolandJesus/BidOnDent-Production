/**
 * ShopDirectoryShopPinLayers — MapLibre Source + Layer group for shop pins,
 * clusters, glow rings, and labels. Extracted from ShopDirectoryMapLayers
 * to enforce file-size limits.
 */
import { Layer, Source } from "react-map-gl/maplibre";

export const SHOP_LAYER = "shop-dir-circles";
export const SHOP_CLUSTER_LAYER = "shop-dir-clusters";
const SHOP_CLUSTER_COUNT_LAYER = "shop-dir-cluster-count";
const SHOP_GLOW_LAYER = "shop-dir-glow";
const SHOP_LABEL_LAYER = "shop-dir-labels";

type PointFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: number[] };
    properties: Record<string, unknown>;
  }>;
};

type ShopDirectoryShopPinLayersProps = {
  isDark: boolean;
  shopsGeoJson: PointFeatureCollection;
};

export default function ShopDirectoryShopPinLayers({
  isDark,
  shopsGeoJson,
}: ShopDirectoryShopPinLayersProps) {
  if (shopsGeoJson.features.length === 0) return null;

  return (
    <Source
      id="shops-source"
      type="geojson"
      data={shopsGeoJson}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={50}
    >
      {/* ── Cluster circle ── */}
      <Layer
        id={SHOP_CLUSTER_LAYER}
        type="circle"
        filter={["has", "point_count"]}
        paint={
          {
            "circle-color": [
              "step",
              ["get", "point_count"],
              isDark ? "#3b82f6" : "#2563eb",
              10,
              isDark ? "#6366f1" : "#4f46e5",
              25,
              isDark ? "#8b5cf6" : "#7c3aed",
            ],
            "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 25, 30],
            "circle-opacity": 0.88,
            "circle-stroke-width": 3,
            "circle-stroke-color": isDark ? "#1e3a5f" : "#dbeafe",
          } as Record<string, unknown>
        }
      />
      {/* ── Cluster count label ── */}
      <Layer
        id={SHOP_CLUSTER_COUNT_LAYER}
        type="symbol"
        filter={["has", "point_count"]}
        layout={
          {
            "text-field": "{point_count_abbreviated}",
            "text-size": 13,
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-allow-overlap": true,
          } as Record<string, unknown>
        }
        paint={
          {
            "text-color": "#ffffff",
          } as Record<string, unknown>
        }
      />
      {/* ── Individual shop glow (unclustered only) ── */}
      <Layer
        id={SHOP_GLOW_LAYER}
        type="circle"
        filter={["all", ["!", ["has", "point_count"]], ["==", ["get", "isSelected"], 1]]}
        paint={
          {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 20, 12, 28, 15, 36],
            "circle-color": "#2563eb",
            "circle-opacity": 0.2,
            "circle-blur": 1,
          } as Record<string, unknown>
        }
      />
      <Layer
        id={SHOP_LAYER}
        type="circle"
        filter={["!", ["has", "point_count"]]}
        paint={
          {
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              8,
              ["case", ["==", ["get", "isSelected"], 1], 8, ["==", ["get", "topPick"], 1], 7, 5],
              12,
              ["case", ["==", ["get", "isSelected"], 1], 14, ["==", ["get", "topPick"], 1], 12, 10],
              15,
              ["case", ["==", ["get", "isSelected"], 1], 22, ["==", ["get", "topPick"], 1], 18, 14],
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
            "circle-stroke-color": ["case", ["==", ["get", "isSelected"], 1], "#dbeafe", "#eff6ff"],
          } as Record<string, unknown>
        }
      />
      <Layer
        id={SHOP_LABEL_LAYER}
        type="symbol"
        minzoom={12}
        filter={["!", ["has", "point_count"]]}
        layout={
          {
            "text-field": [
              "format",
              ["get", "name"],
              { "font-scale": 1.0 },
              "\n",
              {},
              ["concat", "AI ", ["to-string", ["get", "recommendationScore"]], "%"],
              { "font-scale": 0.8 },
            ],
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
  );
}
