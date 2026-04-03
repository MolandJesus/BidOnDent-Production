import {
  ArrowRight,
  MapPinned,
  Navigation,
  Star,
  Store,
  Sparkles,
  Route,
  BarChart3,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useCoveragePartnerShops } from "../../hooks/useCoveragePartnerShops";
import { haversineMiles, zipToCoordinates } from "../../services/supabase/map";
import type { DamageReport } from "../../types";
import { defaultCoverageCenter } from "../landing/coverageData";
import DashboardMapPreview from "./MapLibreDashboardMapPreview";
import type { ReportPin } from "./MapLibreDashboardMapPreview";
import type { CoverageNearbyShop, CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type CustomerMapWidgetProps = {
  primaryColor: string;
  secondaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  reports?: DamageReport[];
  onViewShops?: () => void;
};

/**
 * Compact map preview widget for the customer dashboard.
 * Shows nearby shops on a mini map, capability teasers, and CTAs
 * that navigate to the full Shop Directory experience.
 */
export default function CustomerMapWidget({
  primaryColor,
  secondaryColor,
  appearanceMode = "map-dark",
  reports = [],
  onViewShops,
}: CustomerMapWidgetProps) {
  const isLight = appearanceMode === "light";
  const { partnerShops: rawShops, isLoadingShops, fetchError } = useCoveragePartnerShops();
  const partnerShops = rawShops as CoveragePartnerShop[];
  const [mapCenter] = useState<[number, number]>(defaultCoverageCenter);
  const [mapZoom] = useState(9);

  /** Convert customer damage reports to map pins via ZIP→coordinate lookup */
  const reportPins = useMemo<ReportPin[]>(() => {
    return reports
      .map((r) => {
        const lat = r.latitude;
        const lng = r.longitude;
        if (lat != null && lng != null) {
          const label = r.vehicleInfo
            ? `${r.vehicleInfo.year} ${r.vehicleInfo.make} ${r.vehicleInfo.model}`
            : "Damage report";
          return { id: r.id, lat, lng, label };
        }
        const zip = r.zip_code || r.zipCode;
        const coords = zipToCoordinates(zip);
        if (!coords) return null;
        const label = r.vehicleInfo
          ? `${r.vehicleInfo.year} ${r.vehicleInfo.make} ${r.vehicleInfo.model}`
          : "Damage report";
        return { id: r.id, lat: coords.lat, lng: coords.lng, label };
      })
      .filter((pin): pin is ReportPin => pin !== null);
  }, [reports]);

  /** Simple nearby sort — use first report or map center as origin */
  const displayShops = useMemo<CoverageNearbyShop[]>(() => {
    if (partnerShops.length === 0) return [];
    const originPin = reportPins[0];
    if (originPin) {
      return partnerShops
        .map((shop) => ({
          ...shop,
          distanceMiles: haversineMiles({ lat: originPin.lat, lng: originPin.lng }, shop),
        }))
        .filter((s) => s.distanceMiles <= 30)
        .sort((a, b) => a.distanceMiles - b.distanceMiles)
        .slice(0, 5);
    }
    return partnerShops.slice(0, 5).map((s) => ({ ...s, distanceMiles: 0 }));
  }, [partnerShops, reportPins]);
  const compactShops = displayShops.slice(0, 4);

  /** Capability teasers to entice users toward the full Smart Map */
  const capabilities = [
    { icon: Sparkles, label: "AI Matching", desc: "Find your best shop" },
    { icon: Route, label: "Directions", desc: "Turn-by-turn routing" },
    { icon: BarChart3, label: "Compare", desc: "Bids side by side" },
  ];

  return (
    <section className="overflow-visible">
      {/* Embedded mini-map with click-through overlay */}
      <div
        className="group relative h-[200px] cursor-pointer overflow-hidden rounded-2xl md:h-[220px]"
        style={{
          boxShadow: isLight
            ? "0 10px 26px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.65)"
            : "0 14px 30px rgba(2,8,24,0.42), inset 0 1px 0 rgba(147,197,253,0.12)",
        }}
        onClick={() => onViewShops?.()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onViewShops?.();
        }}
      >
        <DashboardMapPreview
          shops={partnerShops}
          reportPins={reportPins}
          center={mapCenter}
          zoom={mapZoom}
          isLight={isLight}
          onShopClick={() => onViewShops?.()}
          onMapClick={() => onViewShops?.()}
        />

        {/* Bottom gradient overlay — "Explore" teaser */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-center pb-3 pt-16 pointer-events-none transition-opacity group-hover:opacity-100 opacity-80"
          style={{
            background: isLight
              ? "linear-gradient(to top, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)"
              : "linear-gradient(to top, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0.4) 60%, transparent 100%)",
          }}
        >
          <span
            className={`text-xs font-medium tracking-wide ${isLight ? "text-blue-700/80" : "text-blue-200/70"}`}
          >
            Tap to explore full map experience
          </span>
        </div>

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
          <MapPinned className={`h-3.5 w-3.5 ${isLight ? "text-blue-600" : "text-blue-300"}`} />
          <span
            className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-100"}`}
          >
            {isLoadingShops
              ? "Finding shops\u2026"
              : displayShops.length > 0
                ? `${displayShops.length} shops${reportPins.length > 0 ? ` \u00b7 ${reportPins.length} report${reportPins.length > 1 ? "s" : ""}` : ""}`
                : reportPins.length > 0
                  ? `${reportPins.length} report${reportPins.length > 1 ? "s" : ""}`
                  : "Nearby shops"}
          </span>
        </div>

        {/* Floating CTA — top right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewShops?.();
          }}
          className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 min-h-[40px] text-xs font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.96] shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        >
          <Navigation className="h-3.5 w-3.5" />
          Open Smart Map
        </button>
      </div>

      {/* Capability teasers — show what full map can do */}
      <div
        className={`relative z-10 mt-2 grid grid-cols-3 gap-2 rounded-2xl border px-3 py-3 sm:px-4 ${
          isLight ? "bg-white/88 border-slate-200/60" : "bg-slate-950/62 border-blue-400/20"
        }`}
        style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      >
        {capabilities.map(({ icon: Icon, label, desc }) => (
          <button
            key={label}
            type="button"
            onClick={() => onViewShops?.()}
            className={`flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-center transition-colors active:scale-[0.97] ${
              isLight
                ? "bg-slate-50 hover:bg-blue-50/60 border border-slate-200/60"
                : "bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isLight ? "bg-blue-50 text-blue-600" : "bg-blue-400/15 text-blue-300"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span
              className={`text-[11px] font-semibold leading-tight ${isLight ? "text-slate-700" : "text-slate-100"}`}
            >
              {label}
            </span>
            <span
              className={`text-[10px] leading-tight ${isLight ? "text-slate-400" : "text-blue-100/50"}`}
            >
              {desc}
            </span>
          </button>
        ))}
      </div>

      {/* Shop tiles + main CTA */}
      <div
        className={`relative z-10 mt-2 rounded-2xl border px-3 py-3 sm:px-4 md:px-5 ${
          isLight ? "bg-white/88 border-slate-200/60" : "bg-slate-950/62 border-blue-400/20"
        }`}
        style={{ backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      >
        {!isLoadingShops && compactShops.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 pb-0.5 md:flex md:items-center md:gap-3 md:overflow-x-auto md:scrollbar-hide">
            {compactShops.map((shop) => (
              <button
                key={shop.id || shop.name}
                type="button"
                onClick={() => onViewShops?.()}
                className={`flex w-full min-w-0 items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors active:scale-[0.97] md:w-auto md:shrink-0 ${
                  isLight
                    ? "bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                    : "bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08]"
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isLight ? "bg-blue-50 text-blue-600" : "bg-blue-400/15 text-blue-200"
                  }`}
                >
                  <Store className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p
                    className={`min-h-[2rem] text-xs font-medium leading-tight md:min-h-0 md:truncate md:max-w-[160px] ${
                      isLight ? "text-slate-700" : "text-slate-100"
                    }`}
                  >
                    {shop.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {shop.distanceMiles > 0 && (
                      <span
                        className={`text-[10px] ${isLight ? "text-slate-500" : "text-blue-100/70"}`}
                      >
                        {shop.distanceMiles.toFixed(1)} mi
                      </span>
                    )}
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-400">
                      <Star className="h-2.5 w-2.5 fill-amber-400 stroke-amber-400" />
                      {shop.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : !isLoadingShops && fetchError ? (
          <div
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${
              isLight
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-rose-400/30 bg-rose-500/10 text-rose-200"
            }`}
          >
            <Store
              className={`h-4 w-4 shrink-0 ${isLight ? "text-rose-400" : "text-rose-400/60"}`}
            />
            <p className="text-xs">Could not load shops. Check your connection.</p>
          </div>
        ) : !isLoadingShops ? (
          <div className="flex flex-col items-center gap-1.5 py-3">
            <Store className={`h-6 w-6 ${isLight ? "text-slate-300" : "text-blue-300/30"}`} />
            <p
              className={`text-center text-sm font-medium ${
                isLight ? "text-slate-600" : "text-slate-300"
              }`}
            >
              No nearby shops yet
            </p>
            <p className={`text-center text-xs ${isLight ? "text-slate-400" : "text-blue-100/50"}`}>
              Open the map to search your area.
            </p>
          </div>
        ) : null}

        {/* Primary CTA — enhanced to be more visually prominent */}
        {onViewShops && (
          <button
            type="button"
            onClick={onViewShops}
            className="group/cta mt-2.5 flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              boxShadow: "0 4px 16px rgba(37, 99, 235, 0.25)",
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Browse all shops & AI matching</span>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover/cta:translate-x-0.5" />
          </button>
        )}
      </div>
    </section>
  );
}
