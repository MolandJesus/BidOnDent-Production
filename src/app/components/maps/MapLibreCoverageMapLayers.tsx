import { Layer, Source } from "react-map-gl/maplibre";
import type { GeoJSON } from "geojson";

import MapLibrePartnerShopLayer from "./MapLibrePartnerShopLayer";
import MapLibreReportLayer from "./MapLibreReportLayer";
import MapLibreDiscoveryPlaceLayer from "./MapLibreDiscoveryPlaceLayer";
import NavigationErrorBoundary from "./NavigationErrorBoundary";
import { MapLibreRouteFitController } from "./mapLibreControllers";
import type {
  CoverageCountyMarker,
  CoveragePartnerShop,
  MapSurfaceTone,
} from "./serviceCoverageMapTypes";
import type { NavigationDiscoveryPlace } from "../../services/navigation/placeDiscovery";

type MapLibreCoverageMapLayersProps = {
  tone: MapSurfaceTone;
  isNavigationPresentation: boolean;
  showReportLayer: boolean;
  routeGeoJSON: GeoJSON | null;
  routeGeometry?: [number, number][];
  routeFitKey?: string | null;
  counties: CoverageCountyMarker[];
  countyGeoJSON: GeoJSON;
  partnerShops: CoveragePartnerShop[];
  selectedShopId?: string;
  onSelectShop?: (shopId: string) => void;
  discoveryPlaces: NavigationDiscoveryPlace[];
  selectedDiscoveryPlaceId?: string;
  onSelectDiscoveryPlace?: (place: NavigationDiscoveryPlace) => void;
  gpsAccuracyGeoJSON: GeoJSON | null;
  gpsPointGeoJSON: GeoJSON | null;
  gpsHeadingGeoJSON: GeoJSON | null;
  activeSearchTarget: { label: string } | null;
  searchTargetRadiusGeoJSON: GeoJSON | null;
  searchTargetPointGeoJSON: GeoJSON | null;
  radiusLabelGeoJSON: GeoJSON | null;
};

export default function MapLibreCoverageMapLayers({
  tone,
  isNavigationPresentation,
  showReportLayer,
  routeGeoJSON,
  routeGeometry,
  routeFitKey,
  counties,
  countyGeoJSON,
  partnerShops,
  selectedShopId,
  onSelectShop,
  discoveryPlaces,
  selectedDiscoveryPlaceId,
  onSelectDiscoveryPlace,
  gpsAccuracyGeoJSON,
  gpsPointGeoJSON,
  gpsHeadingGeoJSON,
  activeSearchTarget,
  searchTargetRadiusGeoJSON,
  searchTargetPointGeoJSON,
  radiusLabelGeoJSON,
}: MapLibreCoverageMapLayersProps) {
  return (
    <>
      {routeGeoJSON ? (
        <>
          <MapLibreRouteFitController
            routeGeometry={routeGeometry || []}
            routeFitKey={routeFitKey}
          />
          <Source id="route" type="geojson" data={routeGeoJSON}>
            <Layer
              id="route-glow"
              type="line"
              paint={{
                "line-color": tone === "light" ? "#3b82f6" : "#38bdf8",
                "line-opacity": isNavigationPresentation ? 0.28 : 0.22,
                "line-width": isNavigationPresentation ? 26 : 22,
                "line-blur": isNavigationPresentation ? 14 : 12,
              }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
            <Layer
              id="route-outline"
              type="line"
              paint={{
                "line-color": tone === "light" ? "#ffffff" : "#e0f2fe",
                "line-opacity": isNavigationPresentation ? 0.94 : 0.9,
                "line-width": isNavigationPresentation ? 12 : 10,
              }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
            <Layer
              id="route-inner"
              type="line"
              paint={{
                "line-color": tone === "light" ? "#2563eb" : "#38bdf8",
                "line-opacity": 0.98,
                "line-width": isNavigationPresentation ? 7 : 5,
              }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
          </Source>
        </>
      ) : null}

      {!isNavigationPresentation && counties.length > 0 ? (
        <Source id="counties" type="geojson" data={countyGeoJSON}>
          <Layer
            id="counties-circle"
            type="circle"
            paint={{
              "circle-radius": 6,
              "circle-color": "#7dd3fc",
              "circle-opacity": 0.8,
              "circle-stroke-color": "#2563eb",
              "circle-stroke-width": 2,
            }}
          />
          <Layer
            id="counties-label"
            type="symbol"
            minzoom={8}
            layout={
              {
                "text-field": ["get", "name"],
                "text-size": ["interpolate", ["linear"], ["zoom"], 8, 9, 12, 11],
                "text-offset": [0, 1.6],
                "text-anchor": "top",
                "text-max-width": 8,
                "text-allow-overlap": false,
                "text-optional": true,
              } as Record<string, unknown>
            }
            paint={
              {
                "text-color": tone === "light" ? "#1e40af" : "#93c5fd",
                "text-halo-color": tone === "light" ? "#ffffff" : "#0f172a",
                "text-halo-width": 1.5,
                "text-opacity": 0.85,
              } as Record<string, unknown>
            }
          />
        </Source>
      ) : null}

      <MapLibrePartnerShopLayer
        partnerShops={partnerShops}
        selectedShopId={selectedShopId}
        isNavigationPresentation={isNavigationPresentation}
        tone={tone}
        onSelectShop={onSelectShop}
      />

      {!isNavigationPresentation && showReportLayer ? (
        <NavigationErrorBoundary>
          <MapLibreReportLayer />
        </NavigationErrorBoundary>
      ) : null}

      {!isNavigationPresentation && discoveryPlaces.length > 0 ? (
        <MapLibreDiscoveryPlaceLayer
          tone={tone}
          places={discoveryPlaces}
          selectedPlaceId={selectedDiscoveryPlaceId}
          onSelectPlace={onSelectDiscoveryPlace}
        />
      ) : null}

      {gpsAccuracyGeoJSON ? (
        <Source id="gps-accuracy" type="geojson" data={gpsAccuracyGeoJSON}>
          <Layer
            id="gps-accuracy-fill"
            type="fill"
            paint={{
              "fill-color": tone === "light" ? "#60a5fa" : "#22d3ee",
              "fill-opacity": 0.12,
            }}
          />
          <Layer
            id="gps-accuracy-stroke"
            type="line"
            paint={{
              "line-color": tone === "light" ? "#60a5fa" : "#67e8f9",
              "line-width": 1.5,
            }}
          />
        </Source>
      ) : null}

      {gpsPointGeoJSON ? (
        <Source id="gps-position" type="geojson" data={gpsPointGeoJSON}>
          <Layer
            id="gps-glow"
            type="circle"
            paint={{
              "circle-radius": isNavigationPresentation ? 28 : 24,
              "circle-color": tone === "light" ? "#0ea5e9" : "#22d3ee",
              "circle-opacity": 0.12,
              "circle-blur": 1,
            }}
          />
          <Layer
            id="gps-dot"
            type="circle"
            paint={{
              "circle-radius": isNavigationPresentation ? 12 : 10,
              "circle-color": tone === "light" ? "#0ea5e9" : "#22d3ee",
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 3,
            }}
          />
        </Source>
      ) : null}

      {gpsHeadingGeoJSON ? (
        <Source id="gps-heading" type="geojson" data={gpsHeadingGeoJSON}>
          <Layer
            id="gps-heading-line"
            type="line"
            paint={{
              "line-color": tone === "light" ? "#0ea5e9" : "#22d3ee",
              "line-width": 4,
              "line-opacity": 0.7,
            }}
            layout={{ "line-cap": "round" }}
          />
        </Source>
      ) : null}

      {activeSearchTarget && !isNavigationPresentation ? (
        <>
          {searchTargetRadiusGeoJSON ? (
            <Source id="search-radius" type="geojson" data={searchTargetRadiusGeoJSON}>
              <Layer
                id="search-radius-fill"
                type="fill"
                paint={{ "fill-color": "#22d3ee", "fill-opacity": 0.12 }}
              />
              <Layer
                id="search-radius-stroke"
                type="line"
                paint={{ "line-color": "#22d3ee", "line-width": 2 }}
              />
            </Source>
          ) : null}
          {searchTargetPointGeoJSON ? (
            <Source id="search-target" type="geojson" data={searchTargetPointGeoJSON}>
              <Layer
                id="search-target-outer"
                type="circle"
                filter={["==", ["get", "kind"], "outer"]}
                paint={{
                  "circle-radius": 11,
                  "circle-color": "#06b6d4",
                  "circle-opacity": 0.75,
                  "circle-stroke-color": "#67e8f9",
                  "circle-stroke-width": 2.5,
                }}
              />
              <Layer
                id="search-target-inner"
                type="circle"
                filter={["==", ["get", "kind"], "inner"]}
                paint={{
                  "circle-radius": 5,
                  "circle-color": "#f8fafc",
                  "circle-stroke-color": "#f8fafc",
                  "circle-stroke-width": 1,
                }}
              />
            </Source>
          ) : null}
          {radiusLabelGeoJSON ? (
            <Source id="radius-label" type="geojson" data={radiusLabelGeoJSON}>
              <Layer
                id="radius-label-text"
                type="symbol"
                layout={
                  {
                    "text-field": ["get", "label"],
                    "text-size": 11,
                    "text-anchor": "left",
                    "text-offset": [0.5, 0],
                    "text-allow-overlap": true,
                  } as Record<string, unknown>
                }
                paint={
                  {
                    "text-color": tone === "light" ? "#0891b2" : "#67e8f9",
                    "text-halo-color": tone === "light" ? "#ffffff" : "#0f172a",
                    "text-halo-width": 1.5,
                  } as Record<string, unknown>
                }
              />
            </Source>
          ) : null}
        </>
      ) : null}
    </>
  );
}
