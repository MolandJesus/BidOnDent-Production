import { useEffect, useMemo, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation, LocateFixed } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import {
  getPublicPartnerShops,
  haversineMiles,
  resolveShopCoordinates,
  zipToCoordinates,
} from "../../services/supabase/map";
import type { PartnerShopMapRecord } from "../../services/supabase/types";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const regions = [
  "Rockland County",
  "Dutchess County",
  "Westchester County",
  "Nassau County",
  "Orange County",
  "Putnam County",
];

const countyCenters = [
  { name: "Rockland County", lat: 41.1489, lng: -73.983 },
  { name: "Dutchess County", lat: 41.7658, lng: -73.7485 },
  { name: "Westchester County", lat: 41.122, lng: -73.7949 },
  { name: "Nassau County", lat: 40.6546, lng: -73.5594 },
  { name: "Orange County", lat: 41.402, lng: -74.3056 },
  { name: "Putnam County", lat: 41.4299, lng: -73.7604 },
];

const partnerShops = [
  { name: "BidOnDent North Hub", county: "Dutchess", lat: 41.7004, lng: -73.921 },
  { name: "BidOnDent West Hub", county: "Rockland", lat: 41.1112, lng: -74.0413 },
  { name: "BidOnDent Metro Hub", county: "Westchester", lat: 41.033, lng: -73.7629 },
  { name: "BidOnDent East Hub", county: "Nassau", lat: 40.7244, lng: -73.6407 },
];

const zipCoordinates: Record<string, { lat: number; lng: number; county: string }> = {
  "10601": { lat: 41.033, lng: -73.7629, county: "Westchester" },
  "10956": { lat: 41.1432, lng: -73.9896, county: "Rockland" },
  "12601": { lat: 41.7004, lng: -73.921, county: "Dutchess" },
  "11590": { lat: 40.7557, lng: -73.5876, county: "Nassau" },
  "12508": { lat: 41.52, lng: -73.9662, county: "Dutchess" },
  "10583": { lat: 40.9898, lng: -73.7976, county: "Westchester" },
  "10954": { lat: 41.1053, lng: -74.0121, county: "Rockland" },
  "10924": { lat: 41.3223, lng: -74.184, county: "Orange" },
  "10512": { lat: 41.427, lng: -73.6746, county: "Putnam" },
};

const prefixFallback: Record<string, { lat: number; lng: number; county: string }> = {
  "105": { lat: 41.145, lng: -73.81, county: "Westchester" },
  "106": { lat: 41.033, lng: -73.7629, county: "Westchester" },
  "107": { lat: 40.9528, lng: -73.8676, county: "Westchester" },
  "108": { lat: 40.9395, lng: -73.8332, county: "Westchester" },
  "109": { lat: 41.1462, lng: -74.0343, county: "Rockland" },
  "125": { lat: 41.7453, lng: -73.6996, county: "Dutchess" },
  "126": { lat: 41.7004, lng: -73.921, county: "Dutchess" },
  "127": { lat: 41.6623, lng: -74.7156, county: "Orange" },
  "110": { lat: 40.7756, lng: -73.704, county: "Nassau" },
  "115": { lat: 40.6501, lng: -73.6068, county: "Nassau" },
};

const nyCenter: [number, number] = [41.22, -73.88];

export default function OperatingRegionsSection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
  const [zipCode, setZipCode] = useState("");
  const [radiusMiles, setRadiusMiles] = useState("20");
  const [mapCenter, setMapCenter] = useState<[number, number]>(nyCenter);
  const [geoMessage, setGeoMessage] = useState("");
  const [publicShops, setPublicShops] = useState<PartnerShopMapRecord[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);

  const normalizedZip = zipCode.trim();
  const lookup = useMemo(() => {
    if (normalizedZip.length < 3) return null;
    if (normalizedZip.length >= 5 && zipCoordinates[normalizedZip]) {
      return zipCoordinates[normalizedZip];
    }
    return prefixFallback[normalizedZip.slice(0, 3)] || null;
  }, [normalizedZip]);

  useEffect(() => {
    let mounted = true;
    setIsLoadingShops(true);

    void getPublicPartnerShops()
      .then((rows) => {
        if (!mounted) return;
        setPublicShops(rows);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoadingShops(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const hasCoverageSignal = Boolean(lookup);
  const radiusMeters = Number(radiusMiles) * 1609.34;

  const searchableOrigin =
    normalizedZip.length >= 5
      ? zipCoordinates[normalizedZip] ||
        (zipToCoordinates(normalizedZip)
          ? {
              lat: zipToCoordinates(normalizedZip)!.lat,
              lng: zipToCoordinates(normalizedZip)!.lng,
              county: lookup?.county || "Regional Coverage",
            }
          : null)
      : null;

  const mappedPublicShops = useMemo(() => {
    return publicShops
      .map((shop) => {
        const coords = resolveShopCoordinates(shop);
        if (!coords) return null;

        return {
          ...shop,
          lat: coords.lat,
          lng: coords.lng,
          label: [shop.city, shop.state].filter(Boolean).join(", ") || "NY Service Region",
          specialties: shop.specialties || [],
          rating: shop.rating || 4.6,
        };
      })
      .filter(Boolean) as Array<
      PartnerShopMapRecord & {
        lat: number;
        lng: number;
        label: string;
        specialties: string[];
        rating: number;
      }
    >;
  }, [publicShops]);

  const mapPartnerShops = mappedPublicShops.length > 0 ? mappedPublicShops : partnerShops;

  const nearbyShops = useMemo(() => {
    if (!searchableOrigin) return [];

    return mapPartnerShops
      .map((shop) => {
        const distanceMiles = haversineMiles(
          { lat: searchableOrigin.lat, lng: searchableOrigin.lng },
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
  }, [searchableOrigin, mapPartnerShops, radiusMiles]);

  return (
    <section id="coverage" className="py-14 bg-slate-900 text-white" ref={sectionRef}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="uppercase tracking-[0.12em] text-sm text-slate-300 mb-2">Current Coverage</p>
              <h3 className="text-3xl font-bold">Actively operating in New York service regions</h3>
              <p className="text-slate-300 mt-2 max-w-2xl">
                Explore coverage with our interactive map. Enter ZIP and radius to preview service
                availability and nearby partner hubs.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
            {regions.map((region) => (
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
                onChange={(event) => setZipCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
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
                  if (lookup) {
                    setMapCenter([lookup.lat, lookup.lng]);
                    setGeoMessage("");
                  }
                }}
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

                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setMapCenter([position.coords.latitude, position.coords.longitude]);
                      setGeoMessage("Map centered to your current location.");
                    },
                    () => {
                      setGeoMessage("Location permission denied. You can still search by ZIP code.");
                    }
                  );
                }}
                className="h-10 px-3 rounded-lg border border-slate-600 bg-slate-900 text-slate-200 text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                Use My Current Location
              </button>
            </div>

            {normalizedZip.length > 0 && (
              <p className={`mt-3 text-sm ${hasCoverageSignal ? "text-emerald-300" : "text-amber-300"}`}>
                {hasCoverageSignal
                  ? `${normalizedZip} is in or near ${lookup?.county} coverage. Partner assignment available in selected radius.`
                  : `We are expanding coverage. ${normalizedZip} may require manual partner assignment.`}
              </p>
            )}

            {geoMessage && <p className="mt-2 text-sm text-cyan-200">{geoMessage}</p>}

            <div className="mt-4 rounded-xl overflow-hidden border border-slate-700">
              <MapContainer
                center={mapCenter}
                zoom={9}
                className="h-[360px] w-full"
                scrollWheelZoom
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {countyCenters.map((county) => (
                  <Marker key={county.name} position={[county.lat, county.lng]}>
                    <Popup>{county.name}</Popup>
                  </Marker>
                ))}

                {mapPartnerShops.map((shop) => (
                  <Marker key={shop.name} position={[shop.lat, shop.lng]}>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">{shop.name}</div>
                        <div>
                          {"county" in shop ? `${shop.county} Coverage Hub` : (shop as any).label || "Partner Shop"}
                        </div>
                        {"rating" in shop && <div>Rating: {(shop as any).rating}</div>}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {lookup && (
                  <>
                    <Marker position={[lookup.lat, lookup.lng]}>
                      <Popup>
                        <div className="text-sm">
                          <div className="font-semibold">ZIP {normalizedZip}</div>
                          <div>Detected county: {lookup.county}</div>
                          <div>Search radius: {radiusMiles} miles</div>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle
                      center={[lookup.lat, lookup.lng]}
                      radius={radiusMeters}
                      pathOptions={{ color: "#22d3ee", fillColor: "#22d3ee", fillOpacity: 0.15 }}
                    />
                  </>
                )}
              </MapContainer>
            </div>

            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <h5 className="font-semibold text-slate-100">Nearest Partner Shops</h5>
                {isLoadingShops && <span className="text-xs text-slate-400">Loading live partner data...</span>}
              </div>

              {!searchableOrigin ? (
                <p className="mt-2 text-sm text-slate-300">Enter a 5-digit ZIP code to view the closest shops.</p>
              ) : nearbyShops.length === 0 ? (
                <p className="mt-2 text-sm text-amber-300">
                  No partner shops found within {radiusMiles} miles. Expand radius or contact support for manual matching.
                </p>
              ) : (
                <div className="mt-3 grid md:grid-cols-2 gap-2">
                  {nearbyShops.map((shop) => (
                    <div key={shop.id || shop.name} className="rounded-lg border border-slate-700 bg-slate-800/70 p-3">
                      <div className="text-sm font-semibold text-slate-100">{shop.shop_name || shop.name}</div>
                      <div className="text-xs text-slate-300 mt-1">
                        {shop.distanceMiles.toFixed(1)} miles away
                        {"label" in shop ? ` • ${(shop as any).label}` : ""}
                      </div>
                      {"specialties" in shop && Array.isArray((shop as any).specialties) && (shop as any).specialties.length > 0 && (
                        <div className="text-xs text-cyan-200 mt-1">
                          {(shop as any).specialties.slice(0, 2).join(" • ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
