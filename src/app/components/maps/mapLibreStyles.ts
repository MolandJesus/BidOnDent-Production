import type { StyleSpecification } from "maplibre-gl";
import type { MapTileMode } from "./serviceCoverageMapTypes";

/**
 * MapLibre style specifications for each tile mode.
 * Phase 1: Raster tiles from CARTO (same sources as the Leaflet era).
 * Phase 3 will swap these for vector tile styles (MapTiler / OpenFreeMap).
 */

const roadmapStyle: StyleSpecification = {
  version: 8,
  sources: {
    "carto-voyager": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
    },
  },
  layers: [{ id: "carto-voyager", type: "raster", source: "carto-voyager" }],
};

const nightStyle: StyleSpecification = {
  version: 8,
  sources: {
    "carto-dark": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; CARTO',
    },
  },
  layers: [{ id: "carto-dark", type: "raster", source: "carto-dark" }],
};

const satelliteStyle: StyleSpecification = {
  version: 8,
  sources: {
    "esri-satellite": {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      maxzoom: 19,
    },
  },
  layers: [{ id: "esri-satellite", type: "raster", source: "esri-satellite" }],
};

export const mapLibreStyles: Record<MapTileMode, StyleSpecification> = {
  roadmap: roadmapStyle,
  night: nightStyle,
  satellite: satelliteStyle,
};

export const mapLibreTileLabels: Record<MapTileMode, string> = {
  roadmap: "Roadmap",
  night: "Midnight",
  satellite: "Satellite",
};
