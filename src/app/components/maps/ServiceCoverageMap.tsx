import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
} from "react-leaflet";
import { useEffect, useState } from "react";
import {
  Expand,
  LocateFixed,
  Map as MapIcon,
  MoonStar,
  Satellite,
  ScanSearch,
  Telescope,
} from "lucide-react";
import { cn } from "../ui/utils";
import { ensureLeafletDefaultIcon } from "./leafletSetup";
import MapViewportController from "./MapViewportController";
import MapZoomTracker from "./MapZoomTracker";
import { mapTileLayers } from "./mapTileLayers";
import type {
  CoverageCountyMarker,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapTileMode,
} from "./serviceCoverageMapTypes";

ensureLeafletDefaultIcon();

const overlayButtonClasses =
  "inline-flex h-10 items-center gap-2 rounded-full border border-white/12 bg-slate-950/85 px-4 text-sm font-medium text-white shadow-lg shadow-slate-950/30 backdrop-blur transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50";

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
  className?: string;
  mapHeightClassName?: string;
  immersiveFullscreen?: boolean;
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterActive: () => void;
  onResetView: () => void;
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
  className,
  mapHeightClassName,
  immersiveFullscreen = false,
  onTileModeChange,
  onCenterActive,
  onResetView,
  onExpand,
}: ServiceCoverageMapProps) {
  const [liveZoom, setLiveZoom] = useState(zoom);
  const tileLayer = mapTileLayers[tileMode];
  const activeFocusLabel = activeSearchTarget
    ? activeSearchTarget.source === "geolocation"
      ? "Live location focus"
      : activeSearchTarget.label
    : "Regional overview";
  const showOrbitalOverview = immersiveFullscreen && liveZoom <= 6;
  const showSpaceBackdrop = immersiveFullscreen && (tileMode === "night" || showOrbitalOverview);

  useEffect(() => {
    setLiveZoom(zoom);
  }, [zoom, revision]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-slate-700 bg-slate-950/80 shadow-[0_24px_80px_rgba(15,23,42,0.42)]",
        immersiveFullscreen &&
          "bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_rgba(2,6,23,0.95)_42%,_rgba(2,6,23,1)_100%)]",
        className
      )}
    >
      {showSpaceBackdrop ? (
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

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-wrap items-start justify-between gap-3 p-4">
        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-white/12 bg-slate-950/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200 shadow-lg shadow-slate-950/30 backdrop-blur">
            BidOnDent Coverage Live
          </div>
          <div className="rounded-full border border-white/12 bg-slate-950/85 px-4 py-2 text-sm text-slate-100 shadow-lg shadow-slate-950/30 backdrop-blur">
            {activeFocusLabel}
          </div>
          {showOrbitalOverview ? (
            <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100 shadow-lg shadow-slate-950/30 backdrop-blur">
              Orbital overview engaged
            </div>
          ) : null}
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
          <div className="inline-flex rounded-full border border-white/12 bg-slate-950/85 p-1 shadow-lg shadow-slate-950/30 backdrop-blur">
            <button
              type="button"
              onClick={() => onTileModeChange("roadmap")}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition",
                tileMode === "roadmap"
                  ? "bg-cyan-500 text-slate-950"
                  : "text-slate-100 hover:bg-white/8"
              )}
            >
              <MapIcon className="h-4 w-4" />
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => onTileModeChange("night")}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition",
                tileMode === "night"
                  ? "bg-cyan-500 text-slate-950"
                  : "text-slate-100 hover:bg-white/8"
              )}
            >
              <MoonStar className="h-4 w-4" />
              Midnight
            </button>
            <button
              type="button"
              onClick={() => onTileModeChange("satellite")}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition",
                tileMode === "satellite"
                  ? "bg-cyan-500 text-slate-950"
                  : "text-slate-100 hover:bg-white/8"
              )}
            >
              <Satellite className="h-4 w-4" />
              Satellite
            </button>
          </div>

          <button
            type="button"
            onClick={onCenterActive}
            disabled={!activeSearchTarget}
            className={overlayButtonClasses}
          >
            <LocateFixed className="h-4 w-4" />
            Center Focus
          </button>

          <button type="button" onClick={onResetView} className={overlayButtonClasses}>
            <ScanSearch className="h-4 w-4" />
            Overview
          </button>

          {onExpand ? (
            <button type="button" onClick={onExpand} className={overlayButtonClasses}>
              <Expand className="h-4 w-4" />
              Full Screen
            </button>
          ) : null}
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        className={cn("h-[420px] w-full", mapHeightClassName)}
        preferCanvas
        scrollWheelZoom
      >
        <ZoomControl position="bottomright" />
        <MapViewportController center={center} zoom={zoom} revision={revision} />
        <MapZoomTracker onZoomChange={setLiveZoom} />

        <TileLayer
          key={tileMode}
          attribution={tileLayer.attribution}
          maxZoom={tileLayer.maxZoom}
          url={tileLayer.url}
        />

        {counties.map((county) => (
          <CircleMarker
            key={county.name}
            center={[county.lat, county.lng]}
            radius={8}
            pathOptions={{
              color: "#8b5cf6",
              fillColor: "#c4b5fd",
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

        {partnerShops.map((shop) => (
          <Marker key={shop.id || shop.name} position={[shop.lat, shop.lng]}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{shop.name}</div>
                <div>{shop.countyLabel}</div>
                <div>{shop.label}</div>
                <div>Rating: {shop.rating.toFixed(1)}</div>
                {shop.specialties.length > 0 ? (
                  <div>Focus: {shop.specialties.slice(0, 3).join(" • ")}</div>
                ) : null}
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -18]}>
              {shop.name}
            </Tooltip>
          </Marker>
        ))}

        {activeSearchTarget ? (
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[400] flex flex-wrap items-end justify-between gap-3 p-4">
        <div className="pointer-events-auto inline-flex flex-wrap items-center gap-2 rounded-full border border-white/12 bg-slate-950/85 px-4 py-2 text-sm text-slate-100 shadow-lg shadow-slate-950/30 backdrop-blur">
          <span>{regionCount} NY regions</span>
          <span className="text-slate-500">•</span>
          <span>{partnerShops.length} partner markers</span>
          <span className="text-slate-500">•</span>
          <span>{showOrbitalOverview ? "Orbital overview" : `${tileLayer.label} mode`}</span>
        </div>

        {activeSearchTarget ? (
          <div className="pointer-events-auto inline-flex flex-wrap items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/15 px-4 py-2 text-sm font-medium text-cyan-100 shadow-lg shadow-slate-950/30 backdrop-blur">
            <span>{radiusMiles}-mile live search radius</span>
            {showOrbitalOverview ? (
              <>
                <span className="text-cyan-300/60">•</span>
                <span className="inline-flex items-center gap-1">
                  <Telescope className="h-4 w-4" />
                  Zoom in for street-level detail
                </span>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
