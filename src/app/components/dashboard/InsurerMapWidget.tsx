import { Building2, MapPinned, Navigation } from "lucide-react";
import { useMemo } from "react";

import { useCoveragePartnerShops } from "../../hooks/useCoveragePartnerShops";
import type { DamageReport } from "../../types";
import { zipToCoordinates } from "../../services/supabase/map";
import { defaultCoverageCenter, operatingRegions } from "../landing/coverageData";
import DashboardMapPreview from "./MapLibreDashboardMapPreview";
import type { ReportPin } from "./MapLibreDashboardMapPreview";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type InsurerMapWidgetProps = {
  primaryColor: string;
  secondaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  reports?: DamageReport[];
  onViewShops?: () => void;
};

/**
 * Map-backed "Network Overview" widget for the insurer dashboard.
 * Shows partner shop density on an embedded mini-map with network stats.
 */
export default function InsurerMapWidget({
  primaryColor,
  secondaryColor,
  appearanceMode = "map-dark",
  reports = [],
  onViewShops,
}: InsurerMapWidgetProps) {
  const isLight = appearanceMode === "light";
  const statSurfaceClasses = [
    "bd-dashboard-section--accent-indigo",
    "bd-dashboard-section--deep",
    "bd-dashboard-section--accent-cyan",
  ];
  const { partnerShops, isLoadingShops, fetchError } = useCoveragePartnerShops();

  /** Convert claims/reports to map pins via ZIP→coordinate lookup */
  const reportPins = useMemo<ReportPin[]>(() => {
    return reports
      .map((r) => {
        const lat = r.latitude;
        const lng = r.longitude;
        if (lat != null && lng != null) {
          const label = r.claimNumber || r.damageType || "Claim";
          return { id: r.id, lat, lng, label };
        }
        const zip = r.zipCode;
        const coords = zipToCoordinates(zip);
        if (!coords) return null;
        const label = r.claimNumber || r.damageType || "Claim";
        return { id: r.id, lat: coords.lat, lng: coords.lng, label };
      })
      .filter((pin): pin is ReportPin => pin !== null);
  }, [reports]);
  const pendingClaimCount = reports.filter((report) =>
    ["pending", "in-review"].includes(String(report.status))
  ).length;
  const photoBackedClaimCount = reports.filter(
    (report) => Array.isArray(report.photos) && report.photos.length > 0
  ).length;

  const avgRating =
    partnerShops.length > 0
      ? partnerShops.reduce((sum, s) => sum + s.rating, 0) / partnerShops.length
      : 0;

  return (
    <section className="bd-dashboard-panel bd-dashboard-panel--accent-indigo overflow-hidden">
      {/* Embedded mini-map — Bucket 1.3 (KI-074 partial): inner-glass bezel
          ring eliminates the flat seam between panel chrome and map canvas. */}
      <div className="relative h-[180px] md:h-[200px] rounded-xl ring-1 ring-[rgba(96,165,250,0.16)] ring-inset overflow-hidden">
        {/* Bucket 5.9 (KI-074 RESOLVED): map canvas edge sheen — premium
            curved-glass edge feel above the map canvas. */}
        <div className="bd-map-canvas-sheen z-[1]" aria-hidden="true" />
        <DashboardMapPreview
          shops={partnerShops}
          reportPins={reportPins}
          center={defaultCoverageCenter}
          zoom={9}
          isLight={isLight}
          onMapClick={onViewShops}
        />

        {/* Floating badge — top left */}
        <div className="bd-dashboard-chip absolute top-3 left-3 z-10 flex items-center gap-2 rounded-xl px-3 py-1.5 pointer-events-none">
          <Building2 className={`h-3.5 w-3.5 ${isLight ? "text-blue-600" : "text-blue-300"}`} />
          <span
            className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-100"}`}
          >
            Network Overview
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
            View Network
          </button>
        )}
      </div>

      {/* Stats + info below map */}
      <div className="px-4 py-3 md:px-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p
              className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                isLight ? "text-indigo-700/70" : "text-indigo-100/58"
              }`}
            >
              Network Health
            </p>
            <p className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              Shop coverage, regional spread, and claim readiness
            </p>
          </div>
          <span
            className={`bd-dashboard-chip shrink-0 px-2.5 py-1 text-[11px] font-medium ${
              isLight
                ? "bg-[rgba(238,247,255,0.92)] text-indigo-700"
                : "border-indigo-200/18 bg-white/10 text-indigo-50"
            }`}
          >
            {pendingClaimCount} pending
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className={`bd-dashboard-section rounded-xl p-2.5 ${statSurfaceClasses[0]}`}>
            <div
              className={`text-[10px] uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
            >
              Shops
            </div>
            <div
              className={`mt-0.5 text-lg font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              {isLoadingShops ? "\u2014" : partnerShops.length}
            </div>
          </div>
          <div className={`bd-dashboard-section rounded-xl p-2.5 ${statSurfaceClasses[1]}`}>
            <div
              className={`text-[10px] uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
            >
              Regions
            </div>
            <div
              className={`mt-0.5 text-lg font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              {operatingRegions.length}
            </div>
          </div>
          <div className={`bd-dashboard-section rounded-xl p-2.5 ${statSurfaceClasses[2]}`}>
            <div
              className={`text-[10px] uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
            >
              Avg Rating
            </div>
            <div
              className={`mt-0.5 text-lg font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              {isLoadingShops ? "\u2014" : avgRating.toFixed(1)}
            </div>
          </div>
        </div>

        {fetchError && (
          <div
            className={`bd-dashboard-note mt-2.5 flex items-center gap-2 rounded-xl px-3 py-2 animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none ${
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
              {pendingClaimCount > 0
                ? `${pendingClaimCount} live claim${pendingClaimCount === 1 ? "" : "s"} awaiting review`
                : "No pending live claims right now"}
            </p>
            <p
              className={`truncate text-[11px] ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
            >
              {photoBackedClaimCount > 0
                ? `${photoBackedClaimCount} claim${photoBackedClaimCount === 1 ? "" : "s"} include photo evidence`
                : "New filed claims with photos will show up here automatically."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
