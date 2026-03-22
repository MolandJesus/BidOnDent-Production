import { Building2, MapPinned } from "lucide-react";

import { useCoveragePartnerShops } from "../../hooks/useCoveragePartnerShops";
import { operatingRegions } from "../landing/coverageData";

type InsurerMapWidgetProps = {
  primaryColor: string;
  secondaryColor: string;
};

/**
 * Compact CarPlay-style "Network Overview" widget for the insurer dashboard.
 * Structure-only placeholder — real network analytics require queryable shop data.
 * Max height 300px. Glanceable network stats with region breakdown.
 */
export default function InsurerMapWidget({ primaryColor, secondaryColor }: InsurerMapWidgetProps) {
  const { partnerShops, isLoadingShops, fetchError } = useCoveragePartnerShops();

  const avgRating =
    partnerShops.length > 0
      ? partnerShops.reduce((sum, s) => sum + s.rating, 0) / partnerShops.length
      : 0;

  return (
    <section className="bd-glass-card p-5" style={{ maxHeight: 300 }}>
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
            <h3 className="text-sm font-semibold text-slate-900">Network Overview</h3>
            <p className="text-xs text-slate-500">
              {isLoadingShops ? "Loading\u2026" : "Partner shop network"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bd-glass-card p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Shops</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {isLoadingShops ? "\u2014" : partnerShops.length}
          </div>
        </div>
        <div className="bd-glass-card p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Regions</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">{operatingRegions.length}</div>
        </div>
        <div className="bd-glass-card p-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Avg Rating</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {isLoadingShops ? "\u2014" : avgRating.toFixed(1)}
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5">
          <p className="text-xs text-red-600">
            Could not load network data. Check your connection and try again.
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
        <MapPinned className="h-4 w-4 text-slate-400" />
        <p className="text-xs text-slate-500">
          Network analytics dashboard coming soon. Region-level claims and shop performance data
          will appear here.
        </p>
      </div>
    </section>
  );
}
