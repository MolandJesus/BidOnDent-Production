import { MapPinned, Navigation, Wrench } from "lucide-react";
import { useMemo } from "react";

import { useCoveragePartnerShops } from "../../hooks/useCoveragePartnerShops";
import { useShopServiceAreas } from "../../hooks/useShopServiceAreas";
import type { DamageReport } from "../../types";
import { zipToCoordinates } from "../../services/supabase/map";
import { defaultCoverageCenter } from "../landing/coverageData";
import DashboardMapPreview from "./MapLibreDashboardMapPreview";
import type { ReportPin, ServiceAreaCircle } from "./MapLibreDashboardMapPreview";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type ShopMapWidgetProps = {
  primaryColor: string;
  secondaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  reports?: DamageReport[];
  onViewShops?: () => void;
};

/**
 * Map-backed "Your Service Area" widget for the shop dashboard.
 * Shows partner shop density on an embedded mini-map with region stats.
 */
export default function ShopMapWidget({
  primaryColor,
  secondaryColor,
  appearanceMode = "map-dark",
  reports = [],
  onViewShops,
}: ShopMapWidgetProps) {
  const { partnerShops, isLoadingShops, fetchError } = useCoveragePartnerShops();
  const { serviceAreas, isLoading: isLoadingAreas } = useShopServiceAreas();
  const isLight = appearanceMode === "light";
  const statSurfaceClasses = ["bd-dashboard-section--accent-blue", "bd-dashboard-section--deep"];

  /** Use the first radius-type service area center for map, fallback to default */
  const mapCenter = useMemo<[number, number]>(() => {
    const radiusArea = serviceAreas.find(
      (a) => a.area_type === "radius" && a.center_latitude != null && a.center_longitude != null
    );
    if (radiusArea) {
      return [radiusArea.center_latitude!, radiusArea.center_longitude!];
    }
    return defaultCoverageCenter;
  }, [serviceAreas]);

  /** Build a human-readable summary of configured service areas */
  const areaSummary = useMemo(() => {
    if (isLoadingAreas) return null;
    if (serviceAreas.length === 0) return null;
    const radiusAreas = serviceAreas.filter((a) => a.area_type === "radius");
    const zipAreas = serviceAreas.filter((a) => a.area_type === "zip_codes");
    const parts: string[] = [];
    if (radiusAreas.length > 0) {
      const miles = radiusAreas[0].radius_miles;
      parts.push(miles ? `${miles} mi radius` : "Radius area");
      if (radiusAreas[0].label) parts[0] += ` · ${radiusAreas[0].label}`;
    }
    if (zipAreas.length > 0) {
      const totalZips = zipAreas.reduce((sum, a) => sum + (a.zip_codes?.length || 0), 0);
      parts.push(`${totalZips} ZIP code${totalZips !== 1 ? "s" : ""}`);
    }
    return parts.join(" + ");
  }, [serviceAreas, isLoadingAreas]);

  /** Convert radius-type service areas to map circle overlays */
  const serviceAreaCircles = useMemo<ServiceAreaCircle[]>(() => {
    return serviceAreas
      .filter(
        (a) =>
          a.area_type === "radius" &&
          a.center_latitude != null &&
          a.center_longitude != null &&
          a.radius_miles != null
      )
      .map((a) => ({
        lat: a.center_latitude!,
        lng: a.center_longitude!,
        radiusMiles: a.radius_miles!,
      }));
  }, [serviceAreas]);

  /** Convert incoming damage reports to map pins via ZIP→coordinate lookup */
  const reportPins = useMemo<ReportPin[]>(() => {
    return reports
      .map((r) => {
        const lat = r.latitude;
        const lng = r.longitude;
        if (lat != null && lng != null) {
          const label =
            r.damageArea || r.damageType || r.damageDescription || r.description || "Request";
          return { id: r.id, lat, lng, label };
        }
        const zip = r.zipCode;
        const coords = zipToCoordinates(zip);
        if (!coords) return null;
        const label =
          r.damageArea || r.damageType || r.damageDescription || r.description || "Request";
        return { id: r.id, lat: coords.lat, lng: coords.lng, label };
      })
      .filter((pin): pin is ReportPin => pin !== null);
  }, [reports]);
  const liveRequestCount = reports.filter((report) =>
    ["pending", "in-review", "active"].includes(String(report.status))
  ).length;
  const newestRequest = reports[0] || null;
  const newestRequestLabel =
    newestRequest?.damageArea ||
    newestRequest?.damageType ||
    newestRequest?.damageDescription ||
    newestRequest?.description ||
    "Live repair activity";

  return (
    <section className="bd-dashboard-panel bd-dashboard-panel--accent-blue overflow-hidden">
      {/* Embedded mini-map */}
      <div className="relative h-[180px] md:h-[200px]">
        <DashboardMapPreview
          shops={partnerShops}
          reportPins={reportPins}
          serviceAreaCircles={serviceAreaCircles}
          center={mapCenter}
          zoom={9}
          isLight={isLight}
          onMapClick={onViewShops}
        />

        {/* Floating badge — top left */}
        <div className="bd-dashboard-chip absolute top-3 left-3 z-10 flex items-center gap-2 rounded-xl px-3 py-1.5 pointer-events-none">
          <Wrench className={`h-3.5 w-3.5 ${isLight ? "text-blue-600" : "text-blue-300"}`} />
          <span
            className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-100"}`}
          >
            Your Service Area
          </span>
        </div>

        {/* Floating CTA — top right */}
        {onViewShops && (
          <button
            type="button"
            onClick={onViewShops}
            className="bd-dashboard-primary-button absolute top-3 right-3 z-10 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white active:scale-[0.96]"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Navigation className="h-3.5 w-3.5" />
            View Map
          </button>
        )}
      </div>

      {/* Region stats + info below map */}
      <div className="px-4 py-3 md:px-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p
              className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                isLight ? "text-blue-700/70" : "text-blue-100/58"
              }`}
            >
              Coverage Snapshot
            </p>
            <p className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              {areaSummary || "Set up your service area to attract nearby customers"}
            </p>
          </div>
          <span
            className={`bd-dashboard-chip shrink-0 px-2.5 py-1 text-[11px] font-medium ${
              isLight ? "bg-white/85 text-blue-700" : "border-blue-200/18 bg-white/10 text-blue-50"
            }`}
          >
            {liveRequestCount} live
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className={`bd-dashboard-section rounded-xl p-2.5 ${statSurfaceClasses[0]}`}>
            <div
              className={`text-[10px] uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
            >
              Service Areas
            </div>
            <div
              className={`mt-0.5 text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
            >
              {isLoadingAreas ? "\u2014" : serviceAreas.length || "Not set"}
            </div>
          </div>
          <div className={`bd-dashboard-section rounded-xl p-2.5 ${statSurfaceClasses[1]}`}>
            <div
              className={`text-[10px] uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
            >
              Partners
            </div>
            <div
              className={`mt-0.5 text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
            >
              {isLoadingShops ? "\u2014" : partnerShops.length}
            </div>
          </div>
        </div>

        {fetchError && (
          <div
            className={`bd-dashboard-note mt-2.5 flex items-center gap-2 rounded-xl px-3 py-2 ${
              isLight ? "text-rose-700" : "text-rose-200"
            }`}
          >
            <p className="text-xs">Could not load network data.</p>
          </div>
        )}

        <div className="bd-dashboard-note bd-dashboard-note--deep mt-2.5 flex items-center gap-2 rounded-xl px-3 py-2">
          <MapPinned
            className={`h-3.5 w-3.5 shrink-0 ${isLight ? "text-blue-600" : "text-blue-400"}`}
          />
          <div className="min-w-0">
            <p className={`text-xs font-medium ${isLight ? "text-slate-700" : "text-blue-100/85"}`}>
              {liveRequestCount > 0
                ? `${liveRequestCount} live request${liveRequestCount === 1 ? "" : "s"} in your queue`
                : "Waiting for live repair requests"}
            </p>
            <p
              className={`truncate text-[11px] ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
            >
              {liveRequestCount > 0
                ? `Newest intake: ${newestRequestLabel}`
                : "New customer requests will appear here as soon as they land."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
