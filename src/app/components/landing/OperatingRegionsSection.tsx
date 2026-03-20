import { useEffect, useMemo, useState } from "react";
import { Expand, LocateFixed, MapPin, Navigation } from "lucide-react";
import { useCoveragePartnerShops } from "../../hooks/useCoveragePartnerShops";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { haversineMiles, zipToCoordinates } from "../../services/supabase/map";
import ServiceCoverageMap from "../maps/ServiceCoverageMap";
import type {
  CoverageNearbyShop,
  CoverageSearchTarget,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";
import CoverageMapDialog from "./CoverageMapDialog";
import CoverageNearestShops from "./CoverageNearestShops";
import {
  countyCenters,
  defaultCoverageCenter,
  operatingRegions,
  resolveCoverageLookup,
  sanitizeZipInput,
} from "./coverageData";

const focusZoomByRadius: Record<string, number> = {
  "10": 11,
  "20": 10,
  "25": 9,
  "35": 8,
};

const COVERAGE_STATE_STORAGE_KEY = "bidondent_coverage_state";

type MapViewState = {
  center: [number, number];
  zoom: number;
  revision: number;
};

type SavedCoverageState = {
  zipCode?: string;
  radiusMiles?: string;
  tileMode?: MapTileMode;
  isMapExpanded?: boolean;
  activeOriginMode?: "zip" | "geolocation";
  currentLocationTarget?: CoverageSearchTarget | null;
  mapView?: {
    center?: [number, number];
    zoom?: number;
    revision?: number;
  };
};

function loadSavedCoverageState(): SavedCoverageState {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const savedState = localStorage.getItem(COVERAGE_STATE_STORAGE_KEY);
    if (!savedState) {
      return {};
    }

    const parsed = JSON.parse(savedState) as SavedCoverageState;
    return {
      zipCode: typeof parsed.zipCode === "string" ? sanitizeZipInput(parsed.zipCode) : undefined,
      radiusMiles:
        typeof parsed.radiusMiles === "string" && focusZoomByRadius[parsed.radiusMiles]
          ? parsed.radiusMiles
          : undefined,
      tileMode:
        parsed.tileMode === "roadmap" ||
        parsed.tileMode === "night" ||
        parsed.tileMode === "satellite"
          ? parsed.tileMode
          : undefined,
      isMapExpanded: Boolean(parsed.isMapExpanded),
      activeOriginMode:
        parsed.activeOriginMode === "geolocation" ? "geolocation" : parsed.activeOriginMode,
      currentLocationTarget:
        parsed.currentLocationTarget &&
        typeof parsed.currentLocationTarget.lat === "number" &&
        typeof parsed.currentLocationTarget.lng === "number"
          ? parsed.currentLocationTarget
          : null,
      mapView:
        parsed.mapView &&
        Array.isArray(parsed.mapView.center) &&
        parsed.mapView.center.length === 2 &&
        typeof parsed.mapView.center[0] === "number" &&
        typeof parsed.mapView.center[1] === "number" &&
        typeof parsed.mapView.zoom === "number" &&
        typeof parsed.mapView.revision === "number"
          ? parsed.mapView
          : undefined,
    };
  } catch (error) {
    console.error("Error loading coverage map state:", error);
    return {};
  }
}

export default function OperatingRegionsSection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
  const [savedCoverageState] = useState(loadSavedCoverageState);
  const [zipCode, setZipCode] = useState(() => savedCoverageState.zipCode || "");
  const [radiusMiles, setRadiusMiles] = useState(() => savedCoverageState.radiusMiles || "20");
  const [geoMessage, setGeoMessage] = useState("");
  const [tileMode, setTileMode] = useState<MapTileMode>(
    () => savedCoverageState.tileMode || "roadmap"
  );
  const [isMapExpanded, setIsMapExpanded] = useState(
    () => savedCoverageState.isMapExpanded || false
  );
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [activeOriginMode, setActiveOriginMode] = useState<"zip" | "geolocation">(
    () => savedCoverageState.activeOriginMode || "zip"
  );
  const [currentLocationTarget, setCurrentLocationTarget] = useState<CoverageSearchTarget | null>(
    () => savedCoverageState.currentLocationTarget || null
  );
  const [mapView, setMapView] = useState<MapViewState>({
    center: savedCoverageState.mapView?.center || defaultCoverageCenter,
    zoom: savedCoverageState.mapView?.zoom || 9,
    revision: savedCoverageState.mapView?.revision || 0,
  });
  const { partnerShops: mapPartnerShops, isLoadingShops } = useCoveragePartnerShops();

  const normalizedZip = zipCode.trim();
  const lookup = useMemo(() => {
    return resolveCoverageLookup(normalizedZip);
  }, [normalizedZip]);

  const hasCoverageSignal = Boolean(lookup);
  const radiusMeters = Number(radiusMiles) * 1609.34;

  const zipSearchTarget = useMemo<CoverageSearchTarget | null>(() => {
    if (normalizedZip.length < 5) return null;

    const fallbackCoordinates = zipToCoordinates(normalizedZip);
    const lat = lookup?.lat ?? fallbackCoordinates?.lat;
    const lng = lookup?.lng ?? fallbackCoordinates?.lng;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return null;
    }

    return {
      lat,
      lng,
      county: lookup?.county || "Regional coverage",
      label: `ZIP ${normalizedZip}`,
      source: "zip",
    };
  }, [lookup, normalizedZip]);

  const zipMapTarget = useMemo<CoverageSearchTarget | null>(() => {
    if (!lookup) return null;

    return {
      lat: lookup.lat,
      lng: lookup.lng,
      county: lookup.county,
      label: normalizedZip.length >= 5 ? `ZIP ${normalizedZip}` : `${normalizedZip} area`,
      source: "zip",
    };
  }, [lookup, normalizedZip]);

  const mapFocusTarget = activeOriginMode === "geolocation" ? currentLocationTarget : zipMapTarget;
  const listSearchTarget =
    activeOriginMode === "geolocation" ? currentLocationTarget : zipSearchTarget;

  const nearbyShops = useMemo<CoverageNearbyShop[]>(() => {
    if (!listSearchTarget) return [];

    return mapPartnerShops
      .map((shop) => {
        const distanceMiles = haversineMiles(
          { lat: listSearchTarget.lat, lng: listSearchTarget.lng },
          { lat: shop.lat, lng: shop.lng }
        );
        return {
          ...shop,
          distanceMiles,
        };
      })
      .filter((shop) => shop.distanceMiles <= Number(radiusMiles))
      .sort((a, b) => a.distanceMiles - b.distanceMiles)
      .slice(0, 6);
  }, [listSearchTarget, mapPartnerShops, radiusMiles]);

  useEffect(() => {
    const nextState: SavedCoverageState = {
      zipCode,
      radiusMiles,
      tileMode,
      isMapExpanded,
      activeOriginMode,
      currentLocationTarget,
      mapView,
    };

    try {
      localStorage.setItem(COVERAGE_STATE_STORAGE_KEY, JSON.stringify(nextState));
    } catch (error) {
      console.error("Error saving coverage map state:", error);
    }
  }, [
    zipCode,
    radiusMiles,
    tileMode,
    isMapExpanded,
    activeOriginMode,
    currentLocationTarget,
    mapView,
  ]);

  function updateMapView(target: [number, number], zoom: number, message?: string) {
    setMapView((previous) => ({
      center: target,
      zoom,
      revision: previous.revision + 1,
    }));

    if (message) {
      setGeoMessage(message);
    }
  }

  function centerOnTarget(target: CoverageSearchTarget | null, message?: string) {
    if (!target) return;

    updateMapView([target.lat, target.lng], focusZoomByRadius[radiusMiles] || 9, message);
  }

  function resetOverviewMap() {
    updateMapView(
      defaultCoverageCenter,
      9,
      "Coverage map returned to the New York regional overview."
    );
  }

  return (
    <section id="coverage" className="py-14 bg-slate-900 text-white" ref={sectionRef}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="uppercase tracking-[0.12em] text-sm text-slate-300 mb-2">
                Current Coverage
              </p>
              <h3 className="text-3xl font-bold">Actively operating in New York service regions</h3>
              <p className="text-slate-300 mt-2 max-w-2xl">
                Explore coverage with our interactive map. Enter ZIP and radius to preview service
                availability and nearby partner hubs.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
            {operatingRegions.map((region) => (
              <div
                key={region}
                className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-cyan-300" />
                <span>{region}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-4 h-4 text-cyan-300" />
              <h4 className="font-semibold">Find Coverage By ZIP and Radius</h4>
            </div>

            <div className="grid md:grid-cols-4 gap-3">
              <input
                value={zipCode}
                onChange={(event) => {
                  const nextZip = sanitizeZipInput(event.target.value);
                  setZipCode(nextZip);

                  if (nextZip.length >= 3) {
                    setActiveOriginMode("zip");
                    setGeoMessage("");
                  } else if (currentLocationTarget) {
                    setActiveOriginMode("geolocation");
                  }
                }}
                placeholder="ZIP Code"
                className="h-11 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white placeholder:text-slate-400"
              />
              <select
                value={radiusMiles}
                onChange={(event) => setRadiusMiles(event.target.value)}
                className="h-11 px-3 rounded-lg border border-slate-600 bg-slate-900 text-white"
              >
                <option value="10">10 miles</option>
                <option value="20">20 miles</option>
                <option value="25">25 miles</option>
                <option value="35">35 miles</option>
              </select>
              <div className="h-11 px-3 rounded-lg border border-slate-600 bg-slate-900 flex items-center text-sm text-slate-300">
                Target radius: {radiusMiles} miles
              </div>
              <button
                type="button"
                onClick={() => {
                  if (mapFocusTarget) {
                    centerOnTarget(
                      mapFocusTarget,
                      mapFocusTarget.source === "geolocation"
                        ? "Coverage map centered to your live location."
                        : `Coverage map centered on ${mapFocusTarget.label}.`
                    );
                  }
                }}
                disabled={!mapFocusTarget}
                className="h-11 px-3 rounded-lg border border-cyan-500/60 bg-cyan-500/10 text-cyan-200 text-sm font-medium hover:bg-cyan-500/20 transition-colors inline-flex items-center justify-center gap-2"
              >
                <LocateFixed className="w-4 h-4" />
                Center Map
              </button>
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  if (!navigator.geolocation) {
                    setGeoMessage("Geolocation is not supported on this browser.");
                    return;
                  }

                  setIsFindingLocation(true);
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const target: CoverageSearchTarget = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        county: "Current location",
                        label: "Your current location",
                        source: "geolocation",
                      };

                      setCurrentLocationTarget(target);
                      setActiveOriginMode("geolocation");
                      centerOnTarget(target, "Coverage map centered to your live location.");
                      setIsFindingLocation(false);
                    },
                    () => {
                      setGeoMessage(
                        "Location permission denied. You can still search by ZIP code."
                      );
                      setIsFindingLocation(false);
                    },
                    {
                      enableHighAccuracy: true,
                      maximumAge: 300000,
                      timeout: 10000,
                    }
                  );
                }}
                className="h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-slate-200 text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                {isFindingLocation ? "Finding Your Location..." : "Use My Current Location"}
              </button>
              <button
                type="button"
                onClick={() => setIsMapExpanded(true)}
                className="ml-3 h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-slate-200 text-sm font-medium hover:bg-slate-700 transition-colors inline-flex items-center gap-2"
              >
                <Expand className="h-4 w-4" />
                Full Screen Map
              </button>
            </div>

            {normalizedZip.length > 0 && (
              <p
                className={`mt-3 text-sm ${hasCoverageSignal ? "text-emerald-300" : "text-amber-300"}`}
              >
                {hasCoverageSignal
                  ? `${normalizedZip} is in or near ${lookup?.county} coverage. Partner assignment available in selected radius.`
                  : `We are expanding coverage. ${normalizedZip} may require manual partner assignment.`}
              </p>
            )}

            {geoMessage && <p className="mt-2 text-sm text-cyan-200">{geoMessage}</p>}

            <p className="mt-4 text-sm text-slate-300">
              Switch between roadmap and satellite, center on your live search target, or open the
              map in full-screen mode for a more operational view.
            </p>

            <ServiceCoverageMap
              className="mt-4"
              center={mapView.center}
              zoom={mapView.zoom}
              revision={mapView.revision}
              tileMode={tileMode}
              counties={countyCenters}
              partnerShops={mapPartnerShops}
              activeSearchTarget={mapFocusTarget}
              radiusMeters={radiusMeters}
              radiusMiles={radiusMiles}
              regionCount={operatingRegions.length}
              onTileModeChange={setTileMode}
              onCenterActive={() => centerOnTarget(mapFocusTarget)}
              onResetView={resetOverviewMap}
              onExpand={() => setIsMapExpanded(true)}
            />

            <CoverageNearestShops
              className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4"
              isLoadingShops={isLoadingShops}
              activeSearchTarget={listSearchTarget}
              nearbyShops={nearbyShops}
              radiusMiles={radiusMiles}
            />
          </div>
        </div>
      </div>

      <CoverageMapDialog
        open={isMapExpanded}
        onOpenChange={setIsMapExpanded}
        center={mapView.center}
        zoom={mapView.zoom}
        revision={mapView.revision}
        tileMode={tileMode}
        counties={countyCenters}
        partnerShops={mapPartnerShops}
        mapSearchTarget={mapFocusTarget}
        listSearchTarget={listSearchTarget}
        nearbyShops={nearbyShops}
        radiusMiles={radiusMiles}
        radiusMeters={radiusMeters}
        regionCount={operatingRegions.length}
        isLoadingShops={isLoadingShops}
        onTileModeChange={setTileMode}
        onCenterActive={() => centerOnTarget(mapFocusTarget)}
        onResetView={resetOverviewMap}
      />
    </section>
  );
}
