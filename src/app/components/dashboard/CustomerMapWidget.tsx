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
import { useMarketStatus } from "../../hooks/useMarketStatus";
import { haversineMiles, zipToCoordinates } from "../../services/supabase/map";
import type { DamageReport } from "../../types";
import { defaultCoverageCenter } from "../landing/coverageData";
import DashboardMapPreview from "./MapLibreDashboardMapPreview";
import MarketStatusIndicator from "./MarketStatusIndicator";
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
  const capabilitySurfaceClasses = [
    "bd-dashboard-section--accent-cyan",
    "bd-dashboard-section--accent-blue",
    "bd-dashboard-section--accent-indigo",
  ];
  const shopSurfaceClasses = [
    "bd-dashboard-section--accent-blue",
    "bd-dashboard-section--deep",
    "bd-dashboard-section--accent-cyan",
    "bd-dashboard-section--deep",
  ];
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
        const zip = r.zipCode;
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

  const marketStatus = useMarketStatus(reports, displayShops.length);

  /** Capability teasers to entice users toward the full Smart Map */
  const capabilities = [
    { icon: Sparkles, label: "AI Matching", desc: "Find your best shop" },
    { icon: Route, label: "Directions", desc: "Turn-by-turn routing" },
    { icon: BarChart3, label: "Compare", desc: "Bids side by side" },
  ];

  return (
    <section className="overflow-hidden rounded-2xl ring-1 ring-[rgba(96,165,250,0.18)] ring-inset">
      {/* Embedded mini-map with click-through overlay */}
      <div
        className="bd-dashboard-panel bd-dashboard-panel--deep group relative h-[200px] cursor-pointer overflow-hidden rounded-2xl md:h-[220px]"
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

        {/* Bucket 5.6 (KI-074 partial): top ambient gold lamp overlay — simulates
            premium lamp light hitting the top edge of the map canvas. Pointer-
            events-none so it never intercepts map interactions. Both modes
            get the gold tint so the cohesion grammar reads in light + dark.
            Pass 5 (2026-05-04): alpha bumped 0.06 -> 0.09 for stronger dark-
            mode presence; still well below the 0.22 single-layer halo cap. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-12 bg-gradient-to-b from-[rgba(196,144,65,0.09)] via-transparent to-transparent"
          aria-hidden="true"
        />

        {/* Bucket 5.9 (KI-074 RESOLVED): map canvas edge sheen — 1px cream
            top catchlight + 1px bronze bottom rim. Premium curved-glass
            edge feel. */}
        <div className="bd-map-canvas-sheen" aria-hidden="true" />

        {/* Bottom gradient overlay — "Explore" teaser */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-center pb-3 pt-16 pointer-events-none transition-opacity group-hover:opacity-100 opacity-80"
          style={{
            background: isLight
              ? // Cool blue-gray fade replaces white fade (KI-066) so the
                // map preview "Explore" teaser feels like the dashboard glass,
                // not a printer-paper overlay.
                "linear-gradient(to top, rgba(232,242,254,0.92) 0%, rgba(232,242,254,0.40) 60%, transparent 100%)"
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
        <div className="bd-dashboard-chip absolute top-3 left-3 z-10 flex items-center gap-2 rounded-xl px-3 py-1.5 pointer-events-none">
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
          className="bd-dashboard-primary-button absolute top-3 right-3 z-10 inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white active:scale-[0.96]"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        >
          <Navigation className="h-3.5 w-3.5" />
          Open Smart Map
        </button>
      </div>

      {/* Capability teasers — show what full map can do */}
      <div className="bd-dashboard-panel bd-dashboard-panel--accent-cyan relative z-10 mt-2 rounded-2xl px-3 py-3 sm:px-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="bd-section-eyebrow mb-1.5">Smart Map Tools</p>
            <p className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              Compare routing, matching, and bid context
            </p>
          </div>
          <span
            className={`bd-dashboard-chip shrink-0 px-2.5 py-1 text-[11px] font-medium ${
              isLight
                ? "bg-[rgba(238,247,255,0.92)] text-cyan-700"
                : "border-cyan-200/18 bg-white/10 text-cyan-50"
            }`}
          >
            {capabilities.length} tools
          </span>
        </div>
        {(marketStatus.nearbyShopCount > 0 || marketStatus.recentBidCount > 0) && (
          <div className="mb-3">
            <MarketStatusIndicator
              nearbyShopCount={marketStatus.nearbyShopCount}
              recentBidCount={marketStatus.recentBidCount}
              isLight={isLight}
            />
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {capabilities.map(({ icon: Icon, label, desc }, index) => (
            <button
              key={label}
              type="button"
              onClick={() => onViewShops?.()}
              className={`bd-dashboard-section bd-dashboard-section--interactive flex min-h-[96px] flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-center active:scale-[0.97] sm:min-h-0 sm:gap-1 sm:py-2.5 ${
                capabilitySurfaceClasses[index % capabilitySurfaceClasses.length]
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  isLight
                    ? "bg-[rgba(238,247,255,0.88)] text-blue-700"
                    : "bg-white/10 text-blue-100"
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
      </div>

      {/* Shop tiles + main CTA */}
      <div className="bd-dashboard-panel bd-dashboard-panel--deep relative z-10 mt-2 rounded-2xl px-3 py-3 sm:px-4 md:px-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="bd-section-eyebrow mb-1.5">Nearby Matches</p>
            <p className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              Local shops around your current report area
            </p>
          </div>
          <span
            className={`bd-dashboard-chip shrink-0 px-2.5 py-1 text-[11px] font-medium ${
              isLight
                ? "bg-[rgba(238,247,255,0.92)] text-blue-700"
                : "border-blue-200/18 bg-white/10 text-blue-50"
            }`}
          >
            {isLoadingShops ? "Loading" : `${compactShops.length || displayShops.length} shown`}
          </span>
        </div>
        {!isLoadingShops && compactShops.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 pb-0.5 md:flex md:items-center md:gap-3 md:overflow-x-auto md:scrollbar-hide">
            {compactShops.map((shop, index) => (
              <button
                key={shop.id || shop.name}
                type="button"
                onClick={() => onViewShops?.()}
                className={`bd-dashboard-section bd-dashboard-section--interactive flex w-full min-w-0 items-center gap-2 rounded-xl px-3 py-2 text-left active:scale-[0.97] md:w-auto md:shrink-0 ${
                  shopSurfaceClasses[index % shopSurfaceClasses.length]
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    isLight
                      ? "bg-[rgba(238,247,255,0.88)] text-blue-700"
                      : "bg-white/10 text-blue-100"
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
            className={`bd-dashboard-note flex items-center gap-2 rounded-xl px-3 py-2.5 ${
              isLight ? "text-rose-700" : "text-rose-200"
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
            className="bd-dashboard-primary-button group/cta mt-2.5 flex w-full items-center justify-between overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold text-white active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
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
