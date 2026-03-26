import { MapPinned, Navigation, Wrench } from "lucide-react";

import { useCoveragePartnerShops } from "../../hooks/useCoveragePartnerShops";
import { operatingRegions } from "../landing/coverageData";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type ShopMapWidgetProps = {
  primaryColor: string;
  secondaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  onViewShops?: () => void;
};

/**
 * Compact CarPlay-style "Your Service Area" widget for the shop dashboard.
 * Structure-only placeholder — real service-area data requires a Supabase table.
 * Max height 300px. One glanceable summary with region count and partner density.
 */
export default function ShopMapWidget({
  primaryColor,
  secondaryColor,
  appearanceMode = "map-dark",
  onViewShops,
}: ShopMapWidgetProps) {
  const { partnerShops, isLoadingShops, fetchError } = useCoveragePartnerShops();
  const isLight = appearanceMode === "light";

  return (
    <section
      className="bd-glass-card p-5"
      style={{
        maxHeight: 380,
        background: isLight
          ? undefined
          : "linear-gradient(180deg, rgba(11, 23, 47, 0.84) 0%, rgba(8, 18, 38, 0.80) 100%)",
        borderColor: isLight ? undefined : "rgba(96, 165, 250, 0.24)",
        boxShadow: isLight
          ? undefined
          : "0 14px 30px rgba(3, 10, 24, 0.38), inset 0 1px 0 rgba(147, 197, 253, 0.12)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Wrench className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3
              className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
            >
              Your Service Area
            </h3>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-100/75"}`}>
              {isLoadingShops ? "Loading\u2026" : "Network overview"}
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
            View Map
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className="bd-glass-card p-3"
          style={
            isLight
              ? {}
              : { background: "rgba(30, 58, 138, 0.18)", borderColor: "rgba(96, 165, 250, 0.20)" }
          }
        >
          <div
            className={`text-xs uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
          >
            Regions
          </div>
          <div
            className={`mt-1 text-xl font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
          >
            {operatingRegions.length}
          </div>
        </div>
        <div
          className="bd-glass-card p-3"
          style={
            isLight
              ? {}
              : { background: "rgba(30, 58, 138, 0.18)", borderColor: "rgba(96, 165, 250, 0.20)" }
          }
        >
          <div
            className={`text-xs uppercase tracking-[0.2em] ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
          >
            Partners
          </div>
          <div
            className={`mt-1 text-xl font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
          >
            {isLoadingShops ? "\u2014" : partnerShops.length}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {operatingRegions.slice(0, 3).map((region) => (
          <span
            key={region}
            className={`rounded-full border px-2.5 py-0.5 text-xs ${isLight ? "border-blue-200/50 bg-blue-50/40 text-slate-600" : "border-blue-400/25 bg-blue-500/10 text-blue-100/80"}`}
          >
            {region}
          </span>
        ))}
        {operatingRegions.length > 3 && (
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs ${isLight ? "border-blue-200/50 bg-blue-50/40 text-slate-500" : "border-blue-400/25 bg-blue-500/10 text-blue-200/70"}`}
          >
            +{operatingRegions.length - 3} more
          </span>
        )}
      </div>

      {fetchError && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5 ${isLight ? "bg-red-50" : "bg-red-500/10 border border-red-400/20"}`}
        >
          <p className={`text-xs ${isLight ? "text-red-600" : "text-red-300"}`}>
            Could not load network data. Check your connection and try again.
          </p>
        </div>
      )}

      <div
        className={`mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5 ${isLight ? "bg-blue-50/30 border border-blue-200/30" : "bg-blue-500/8 border border-blue-400/15"}`}
      >
        <MapPinned className="h-4 w-4 text-blue-400" />
        <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-200/70"}`}>
          Service-area management coming soon. Your shop will appear on customer maps automatically.
        </p>
      </div>
    </section>
  );
}
