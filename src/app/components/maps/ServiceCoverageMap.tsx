import {
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
} from "react-leaflet";
import { useEffect, useState } from "react";
import { cn } from "../ui/utils";
import { ensureLeafletDefaultIcon } from "./leafletSetup";
import MapDiscoveryPlaceMarkers from "./MapDiscoveryPlaceMarkers";
import MapNavigationHud from "./MapNavigationHud";
import MapFollowLocationController from "./MapFollowLocationController";
import MapRouteFitController from "./MapRouteFitController";
import MapViewportController from "./MapViewportController";
import MapZoomTracker from "./MapZoomTracker";
import MapSurfaceControls from "./MapSurfaceControls";
import MapSurfaceHeaderBadges from "./MapSurfaceHeaderBadges";
import MapSurfaceStatusBar from "./MapSurfaceStatusBar";
import { getMapSurfaceTheme, resolveMapSurfaceTone } from "./mapSurfaceTheme";
import { mapTileLayers } from "./mapTileLayers";
import type {
  CoverageCountyMarker,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapTileMode,
} from "./serviceCoverageMapTypes";
import type { NavigationVoiceMode } from "../../types/navigation";
import type { NavigationDiscoveryPlace } from "../../services/navigation/placeDiscovery";

ensureLeafletDefaultIcon();
const worldBounds: [[number, number], [number, number]] = [
  [-85, -179.999],
  [85, 179.999],
];

type ServiceCoverageMapProps = {
  center: [number, number];
  zoom: number;
  revision: number;
  tileMode: MapTileMode;
  counties: CoverageCountyMarker[];
  partnerShops: CoveragePartnerShop[];
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
  followCurrentPosition?: boolean;
  followCurrentPositionRevision?: number;
  discoveryPlaces?: NavigationDiscoveryPlace[];
  routeGeometry?: [number, number][];
  routeFitKey?: string | null;
  currentPosition?: [number, number] | null;
  gpsAccuracyMeters?: number | null;
  currentSpeedMph?: number | null;
  postedSpeedLimitMph?: number | null;
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

export default function ServiceCoverageMap({
  center,
  zoom,
  revision,
  tileMode,
  counties,
  partnerShops,
  activeSearchTarget,
  radiusMeters,
  radiusMiles,
  regionCount,
  selectedShopId,
  selectedDiscoveryPlaceId,
  className,
  mapHeightClassName,
  immersiveFullscreen = false,
  presentationMode = "coverage",
  showSurfaceChrome = true,
  showNavigationHud = true,
  followCurrentPosition = false,
  followCurrentPositionRevision = 0,
  discoveryPlaces = [],
  routeGeometry,
  routeFitKey,
  currentPosition,
  gpsAccuracyMeters,
  currentSpeedMph,
  postedSpeedLimitMph,
  nearestRoadName,
  nextInstruction,
  voiceMode = "alerts-only",
  onTileModeChange,
  onCenterActive,
  onResetView,
  onSelectShop,
  onSelectDiscoveryPlace,
  onExpand,
}: ServiceCoverageMapProps) {
  const [liveZoom, setLiveZoom] = useState(zoom);
  const isNavigationPresentation = presentationMode === "navigation";
  const tileLayer = mapTileLayers[tileMode];
  const tone = resolveMapSurfaceTone(tileMode);
  const theme = getMapSurfaceTheme(tone, immersiveFullscreen);
  const activeFocusLabel = activeSearchTarget
    ? activeSearchTarget.source === "geolocation"
      ? "Live location focus"
      : activeSearchTarget.label
    : "Regional overview";
  const showWorldOverview = immersiveFullscreen && liveZoom <= 3;
  const showStrategicOverview = immersiveFullscreen && liveZoom <= 6;
  const showNightBackdrop = immersiveFullscreen && (tileMode === "night" || showWorldOverview);
  const overviewLabel = showWorldOverview
    ? "World overview"
    : showStrategicOverview
      ? "Strategic overview"
      : null;

  useEffect(() => {
    setLiveZoom(zoom);
  }, [zoom, revision]);

  return (
    <div
      data-map-tone={tone}
      className={cn(
        "coverage-map-surface relative overflow-hidden rounded-[2rem]",
        theme.shellClassName,
        className
      )}
    >
      <div className={cn("pointer-events-none absolute inset-0 z-[248]", theme.ambientOverlayClassName)} />

      {showNightBackdrop ? (
        <div
          className="pointer-events-none absolute inset-0 z-[250] opacity-35"
          style={{
            backgroundImage: [
              "radial-gradient(circle at 14% 20%, rgba(255,255,255,0.95) 0, rgba(255,255,255,0.95) 1px, transparent 1.5px)",
              "radial-gradient(circle at 31% 72%, rgba(148,163,184,0.9) 0, rgba(148,163,184,0.9) 1px, transparent 1.5px)",
              "radial-gradient(circle at 72% 18%, rgba(255,255,255,0.85) 0, rgba(255,255,255,0.85) 1px, transparent 1.5px)",
              "radial-gradient(circle at 84% 62%, rgba(125,211,252,0.8) 0, rgba(125,211,252,0.8) 1px, transparent 1.5px)",
              "radial-gradient(circle at 56% 42%, rgba(255,255,255,0.75) 0, rgba(255,255,255,0.75) 1px, transparent 1.5px)",
              "radial-gradient(circle at 66% 82%, rgba(255,255,255,0.92) 0, rgba(255,255,255,0.92) 1px, transparent 1.5px)",
              "radial-gradient(circle at center, rgba(56,189,248,0.18), transparent 44%)",
            ].join(", "),
          }}
        />
      ) : null}

      {immersiveFullscreen ? (
        <div className="pointer-events-none absolute inset-0 z-[260] bg-[radial-gradient(circle_at_center,transparent_52%,rgba(15,23,42,0.14)_74%,rgba(15,23,42,0.32)_100%)]" />
      ) : null}

      {showSurfaceChrome ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-wrap items-start justify-between gap-3 p-4">
          <MapSurfaceHeaderBadges
            tone={tone}
            activeFocusLabel={activeFocusLabel}
            overviewBadge={overviewLabel}
          />
          <MapSurfaceControls
            tone={tone}
            tileMode={tileMode}
            canCenter={Boolean(activeSearchTarget)}
            onTileModeChange={onTileModeChange}
            onCenterActive={onCenterActive}
            onResetView={onResetView}
            onExpand={onExpand}
          />
        </div>
      ) : null}

      {showNavigationHud ? (
        <MapNavigationHud
          tone={tone}
          currentSpeedMph={currentSpeedMph}
          postedSpeedLimitMph={postedSpeedLimitMph}
          nearestRoadName={nearestRoadName}
          gpsAccuracyMeters={gpsAccuracyMeters}
          nextInstruction={nextInstruction}
          voiceMode={voiceMode}
        />
      ) : null}

      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={immersiveFullscreen ? 2 : 8}
        zoomControl={false}
        className={cn("coverage-map-canvas h-[420px] w-full", theme.mapCanvasClassName, mapHeightClassName)}
        preferCanvas
        scrollWheelZoom
        maxBounds={immersiveFullscreen ? worldBounds : undefined}
        maxBoundsViscosity={immersiveFullscreen ? 1 : undefined}
        zoomSnap={0.5}
        zoomDelta={0.5}
        worldCopyJump={false}
      >
        <ZoomControl position="bottomright" />
        <MapViewportController center={center} zoom={zoom} revision={revision} />
        <MapZoomTracker onZoomChange={setLiveZoom} />
        <MapFollowLocationController
          enabled={followCurrentPosition}
          currentPosition={currentPosition}
          revision={followCurrentPositionRevision}
        />
        {routeGeometry && routeGeometry.length > 1 ? (
          <>
            <MapRouteFitController routeGeometry={routeGeometry} routeFitKey={routeFitKey} />
            <Polyline
              positions={routeGeometry}
              pathOptions={{
                color: tone === "light" ? "#ffffff" : "#e0f2fe",
                opacity: isNavigationPresentation ? 0.94 : 0.9,
                weight: isNavigationPresentation ? 12 : 10,
              }}
            />
            <Polyline
              positions={routeGeometry}
              pathOptions={{
                color: tone === "light" ? "#2563eb" : "#38bdf8",
                opacity: 0.98,
                weight: isNavigationPresentation ? 7 : 5,
              }}
            />
          </>
        ) : null}

        <TileLayer
          key={tileMode}
          attribution={tileLayer.attribution}
          maxZoom={tileLayer.maxZoom}
          url={tileLayer.url}
          noWrap={immersiveFullscreen}
        />

        {!isNavigationPresentation &&
          counties.map((county) => (
          <CircleMarker
            key={county.name}
            center={[county.lat, county.lng]}
            radius={8}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#7dd3fc",
              fillOpacity: 0.8,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{county.name}</div>
                <div>Active BidOnDent coverage signal</div>
              </div>
            </Popup>
          </CircleMarker>
          ))}

        {partnerShops
          .filter((shop) =>
            isNavigationPresentation
              ? `${shop.id || shop.name}` === selectedShopId
              : true
          )
          .map((shop) => {
          const shopKey = `${shop.id || shop.name}`;
          const isSelected = selectedShopId === shopKey;

          return (
            <CircleMarker
              key={shopKey}
              center={[shop.lat, shop.lng]}
              radius={isNavigationPresentation ? 16 : isSelected ? 11 : 8}
              eventHandlers={
                onSelectShop
                  ? {
                      click: () => onSelectShop(shopKey),
                    }
                  : undefined
              }
              pathOptions={{
                color: isNavigationPresentation ? "#fef3c7" : isSelected ? "#dbeafe" : "#0f172a",
                fillColor: isNavigationPresentation ? "#fbbf24" : isSelected ? "#38bdf8" : "#1d4ed8",
                fillOpacity: isSelected ? 1 : 0.9,
                weight: isNavigationPresentation ? 5 : isSelected ? 3 : 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{shop.name}</div>
                  <div>{shop.countyLabel}</div>
                  <div>{shop.label}</div>
                  <div>Rating: {shop.rating.toFixed(1)}</div>
                  {shop.addressLine ? <div>{shop.addressLine}</div> : null}
                  {shop.specialties.length > 0 ? (
                    <div>Focus: {shop.specialties.slice(0, 3).join(" • ")}</div>
                  ) : null}
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -18]}>
                {shop.name}
              </Tooltip>
            </CircleMarker>
          );
        })}

        {!isNavigationPresentation && discoveryPlaces.length > 0 ? (
          <MapDiscoveryPlaceMarkers
            tone={tone}
            places={discoveryPlaces}
            selectedPlaceId={selectedDiscoveryPlaceId}
            onSelectPlace={onSelectDiscoveryPlace}
          />
        ) : null}

        {currentPosition ? (
          <>
            {gpsAccuracyMeters ? (
              <Circle
                center={currentPosition}
                radius={Math.max(18, Math.min(gpsAccuracyMeters, 180))}
                pathOptions={{
                  color: tone === "light" ? "#60a5fa" : "#67e8f9",
                  fillColor: tone === "light" ? "#60a5fa" : "#22d3ee",
                  fillOpacity: 0.12,
                  weight: 1.5,
                }}
              />
            ) : null}
            <CircleMarker
              center={currentPosition}
              radius={isNavigationPresentation ? 14 : 12}
              pathOptions={{
                color: "#ffffff",
                fillColor: tone === "light" ? "#0ea5e9" : "#22d3ee",
                fillOpacity: 1,
                weight: 4,
              }}
            >
              <Tooltip direction="top" offset={[0, -16]}>
                Live GPS
              </Tooltip>
            </CircleMarker>
          </>
        ) : null}

        {activeSearchTarget && !isNavigationPresentation ? (
          <>
            <Circle
              center={[activeSearchTarget.lat, activeSearchTarget.lng]}
              radius={radiusMeters}
              pathOptions={{
                color: "#22d3ee",
                fillColor: "#22d3ee",
                fillOpacity: 0.12,
                weight: 2,
              }}
            />
            <CircleMarker
              center={[activeSearchTarget.lat, activeSearchTarget.lng]}
              radius={14}
              pathOptions={{
                color: "#67e8f9",
                fillColor: "#06b6d4",
                fillOpacity: 0.75,
                weight: 3,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{activeSearchTarget.label}</div>
                  <div>{activeSearchTarget.county || "Coverage focus"}</div>
                  <div>Search radius: {radiusMiles} miles</div>
                </div>
              </Popup>
            </CircleMarker>
            <CircleMarker
              center={[activeSearchTarget.lat, activeSearchTarget.lng]}
              radius={5}
              pathOptions={{
                color: "#f8fafc",
                fillColor: "#f8fafc",
                fillOpacity: 1,
                weight: 1,
              }}
            />
          </>
        ) : null}
      </MapContainer>

      {showSurfaceChrome ? (
        <MapSurfaceStatusBar
          tone={tone}
          regionCount={regionCount}
          partnerShopCount={partnerShops.length}
          modeLabel={`${tileLayer.label} mode`}
          radiusMiles={activeSearchTarget ? radiusMiles : null}
          overviewLabel={overviewLabel}
        />
      ) : null}
    </div>
  );
}
