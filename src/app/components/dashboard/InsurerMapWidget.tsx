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
  const { partnerShops, isLoadingShops, fetchError } = useCoveragePartnerShops();

  /** Convert claims/reports to map pins via ZIP→coordinate lookup */
  const reportPins = useMemo<ReportPin[]>(() => {
    return reports
      .map((r) => {
        const zip = r.zip_code || r.zipCode;
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
    <section
      className={`bd-glass-card overflow-hidden${isLight ? " bd-light-surface" : ""}`}
      style={{
        borderColor: isLight ? "rgba(148,163,184,0.30)" : "rgba(96,165,250,0.24)",
        boxShadow: isLight
          ? "0 14px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.80)"
          : "0 14px 30px rgba(3,10,24,0.38), inset 0 1px 0 rgba(147,197,253,0.12)",
      }}
    >
      {/* Embedded mini-map */}
      <div className="relative h-[180px] md:h-[200px]">
        <DashboardMapPreview
          shops={partnerShops}
          reportPins={reportPins}
          center={defaultCoverageCenter}
          zoom={9}
          isLight={isLight}
          onMapClick={onViewShops}
        />

        {/* Floating badge — top left */}
        <div
          className="absolute top-3 left-3 z-10 flex items-center gap-2 rounded-xl px-3 py-1.5 pointer-events-none"
          style={{
            background: isLight ? "rgba(255,255,255,0.90)" : "rgba(8,18,38,0.85)",
            backdropFilter: "blur(12px)",
            border: isLight
              ? "1px solid rgba(148,163,184,0.25)"
              : "1px solid rgba(96,165,250,0.20)",
            boxShadow: isLight ? "0 2px 8px rgba(0,0,0,0.06)" : "0 2px 10px rgba(0,0,0,0.30)",
          }}
        >
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
            className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 min-h-[40px] text-xs font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.96] shadow-lg"
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
        <div className="grid grid-cols-3 gap-2">
          <div
            className={`rounded-xl p-2.5 ${
              isLight
                ? "bg-slate-50 border border-slate-200/60"
                : "bg-white/[0.04] border border-white/[0.08]"
            }`}
          >
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
          <div
            className={`rounded-xl p-2.5 ${
              isLight
                ? "bg-slate-50 border border-slate-200/60"
                : "bg-white/[0.04] border border-white/[0.08]"
            }`}
          >
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
          <div
            className={`rounded-xl p-2.5 ${
              isLight
                ? "bg-slate-50 border border-slate-200/60"
                : "bg-white/[0.04] border border-white/[0.08]"
            }`}
          >
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
            className={`mt-2.5 flex items-center gap-2 rounded-xl px-3 py-2 ${
              isLight
                ? "bg-rose-50 border border-rose-200 text-rose-700"
                : "bg-rose-500/10 border border-rose-400/20 text-rose-200"
            }`}
          >
            <p className="text-xs">Could not load network data.</p>
          </div>
        )}

        <div
          className={`mt-2.5 flex items-center gap-2 rounded-xl px-3 py-2 ${
            isLight
              ? "bg-blue-50/40 border border-blue-200/40"
              : "bg-blue-500/[0.06] border border-blue-400/[0.12]"
          }`}
        >
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
