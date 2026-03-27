import { Building2, MapPinned, Navigation } from "lucide-react";

import { useCoveragePartnerShops } from "../../hooks/useCoveragePartnerShops";
import { operatingRegions } from "../landing/coverageData";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type InsurerMapWidgetProps = {
  primaryColor: string;
  secondaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  onViewShops?: () => void;
};

/**
 * Compact CarPlay-style "Network Overview" widget for the insurer dashboard.
 * Structure-only placeholder — real network analytics require queryable shop data.
 * Max height 300px. Glanceable network stats with region breakdown.
 */
export default function InsurerMapWidget({
  primaryColor,
  secondaryColor,
  appearanceMode = "map-dark",
  onViewShops,
}: InsurerMapWidgetProps) {
  const isLight = appearanceMode === "light";
  const { partnerShops, isLoadingShops, fetchError } = useCoveragePartnerShops();

  const avgRating =
    partnerShops.length > 0
      ? partnerShops.reduce((sum, s) => sum + s.rating, 0) / partnerShops.length
      : 0;

  return (
    <section
      className="bd-glass-card p-5"
      style={
        isLight
          ? {
              maxHeight: 380,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.88) 100%)",
              borderColor: "rgba(148,163,184,0.30)",
              boxShadow: "0 14px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.80)",
            }
          : { maxHeight: 380 }
      }
    >
      {" "}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Building2 className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3
              className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              Network Overview
            </h3>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-500"}`}>
              {isLoadingShops ? "Loading\u2026" : "Partner shop network"}
            </p>
          </div>
        </div>
        {onViewShops && (
          <button
            type="button"
            onClick={onViewShops}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 min-h-[44px] text-xs font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-md"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Navigation className="h-3.5 w-3.5" />
            View Network
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className={`bd-glass-card p-3 ${isLight ? "!bg-slate-50 !border-slate-200/60" : ""}`}>
          <div
            className={`text-xs uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-slate-500"}`}
          >
            Shops
          </div>
          <div
            className={`mt-1 text-xl font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
          >
            {isLoadingShops ? "\u2014" : partnerShops.length}
          </div>
        </div>
        <div className={`bd-glass-card p-3 ${isLight ? "!bg-slate-50 !border-slate-200/60" : ""}`}>
          <div
            className={`text-xs uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-slate-500"}`}
          >
            Regions
          </div>
          <div
            className={`mt-1 text-xl font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
          >
            {operatingRegions.length}
          </div>
        </div>
        <div className={`bd-glass-card p-3 ${isLight ? "!bg-slate-50 !border-slate-200/60" : ""}`}>
          <div
            className={`text-xs uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-slate-500"}`}
          >
            Avg Rating
          </div>
          <div
            className={`mt-1 text-xl font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
          >
            {isLoadingShops ? "\u2014" : avgRating.toFixed(1)}
          </div>
        </div>
      </div>
      {fetchError && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-400/10 border border-red-400/20 px-3 py-2.5">
          <p className="text-xs text-red-600">
            Could not load network data. Check your connection and try again.
          </p>
        </div>
      )}
      <div
        className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 ${isLight ? "bg-blue-50 border border-blue-200/60" : "bg-blue-500/[0.08] border border-blue-400/[0.15]"}`}
      >
        <MapPinned className={`h-4 w-4 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
        <p className={`text-xs ${isLight ? "text-slate-600" : "text-slate-500"}`}>
          Network analytics dashboard coming soon. Region-level claims and shop performance data
          will appear here.
        </p>
      </div>
    </section>
  );
}
