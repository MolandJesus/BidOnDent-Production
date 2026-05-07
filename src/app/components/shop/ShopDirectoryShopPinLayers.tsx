/**
 * ShopDirectoryShopPinLayers — MapLibre Source + Layer group for shop pins,
 * clusters, glow rings, and labels. Extracted from ShopDirectoryMapLayers
 * to enforce file-size limits.
 */
import { useEffect, useMemo, useRef } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";

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
  /* ── Pass 91: Selected-shop pin breathing pulse (owner real-map directive)
   *
   * Apple Maps and Google Maps both pulse the active/selected pin so the
   * eye anchors to it across map redraws. We animate the SHOP_GLOW_LAYER's
   * `circle-opacity` on a 2-second sine-wave breath whenever a selected
   * shop is rendered. The glow layer is already filtered to isSelected == 1,
   * so the pulse automatically starts/stops with selection state.
   *
   * `circle-opacity` is intentionally absent from the declarative <Layer
   * paint> below so react-map-gl does not overwrite the imperative value
   * each render. Reduce-motion users get a static mid-opacity (0.24).
   */
  const { current: map } = useMap();
  const hasSelectedShop = useMemo(
    () => shopsGeoJson.features.some((f) => f.properties.isSelected === 1),
    [shopsGeoJson]
  );
  const pulseRafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!map || !hasSelectedShop) return;
    const m = map.getMap?.() ?? map;
    if (!m || typeof m.setPaintProperty !== "function") return;

    const reduceMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setOpacity = (v: number) => {
      try {
        if (m.getLayer && !m.getLayer(SHOP_GLOW_LAYER)) return;
        m.setPaintProperty(SHOP_GLOW_LAYER, "circle-opacity", v);
      } catch {
        // Layer not yet added — next animation frame will retry, harmless
      }
    };

    if (reduceMotion) {
      setOpacity(0.24);
      return;
    }

    const start = performance.now();
    const period = 2000;
    const minOp = 0.16;
    const maxOp = 0.4;
    const tick = (now: number) => {
      const phase = ((now - start) % period) / period; // 0 → 1
      const eased = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2); // sine 0 → 1 → 0
      setOpacity(minOp + (maxOp - minOp) * eased);
      pulseRafRef.current = requestAnimationFrame(tick);
    };
    pulseRafRef.current = requestAnimationFrame(tick);

    return () => {
      if (pulseRafRef.current !== null) {
        cancelAnimationFrame(pulseRafRef.current);
        pulseRafRef.current = null;
      }
      setOpacity(0.2);
    };
  }, [map, hasSelectedShop]);

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
      {/* ── Individual shop glow (unclustered only)
       * NOTE: `circle-opacity` is intentionally absent — Pass 91 manages it
       * imperatively via setPaintProperty for the breathing-pulse animation. */}
      <Layer
        id={SHOP_GLOW_LAYER}
        type="circle"
        filter={["all", ["!", ["has", "point_count"]], ["==", ["get", "isSelected"], 1]]}
        paint={
          {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 20, 12, 28, 15, 36],
            "circle-color": "#2563eb",
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
