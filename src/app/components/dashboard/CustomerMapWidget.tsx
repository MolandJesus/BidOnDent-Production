import { ArrowRight, MapPinned, Navigation, Star, Store } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCoverageNavigationExperience } from "../../hooks/useCoverageNavigationExperience";
import { useCoveragePartnerShops } from "../../hooks/useCoveragePartnerShops";
import {
  openDirections,
  type NavigationProvider,
} from "../../services/navigation/externalNavigation";
import { markRecentNavigationLocation } from "../../services/navigation/savedLocations";
import { loadNavigationSession } from "../../services/navigation/navigationSession";
import { haversineMiles } from "../../services/supabase/map";
import type { ExternalNavigationSession } from "../../types/navigation";
import CoverageMapDialog from "../landing/CoverageMapDialog";
import { countyCenters, defaultCoverageCenter, operatingRegions } from "../landing/coverageData";
import DashboardMapPreview from "./MapLibreDashboardMapPreview";
import type {
  CoverageNearbyShop,
  CoveragePartnerShop,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type CustomerMapWidgetProps = {
  primaryColor: string;
  secondaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  onViewShops?: () => void;
};

/**
 * Compact CarPlay-style "Nearby Shops" widget for the customer dashboard.
 * Glanceable list of nearest partner shops with one primary action: Open Map.
 * Max height 300px. Tapping any shop row opens the full CoverageMapDialog.
 */
export default function CustomerMapWidget({
  primaryColor,
  secondaryColor,
  appearanceMode = "map-dark",
  onViewShops,
}: CustomerMapWidgetProps) {
  const isLight = appearanceMode === "light";
  const { partnerShops: rawShops, isLoadingShops, fetchError } = useCoveragePartnerShops();
  const partnerShops = rawShops as CoveragePartnerShop[];
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [tileMode, setTileMode] = useState<MapTileMode>("roadmap");
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCoverageCenter);
  const [mapZoom, setMapZoom] = useState(9);
  const [mapRevision, setMapRevision] = useState(0);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [preferredNavigationProvider, setPreferredNavigationProvider] =
    useState<NavigationProvider>("apple");
  const [navigationSession, setNavigationSession] = useState<ExternalNavigationSession | null>(
    loadNavigationSession
  );

  const selectedShop = useMemo<CoveragePartnerShop | null>(
    () =>
      partnerShops.find((s) => `${s.id || s.name}` === selectedShopId) || partnerShops[0] || null,
    [partnerShops, selectedShopId]
  );

  const navigation = useCoverageNavigationExperience({
    selectedShop,
    fallbackOriginTarget: null,
  });

  const nearbyShops = useMemo<CoverageNearbyShop[]>(() => {
    if (!navigation.activeOriginTarget) return [];
    const origin = navigation.activeOriginTarget;
    return partnerShops
      .map((shop) => ({
        ...shop,
        distanceMiles: haversineMiles(origin, shop),
      }))
      .filter((s) => s.distanceMiles <= 20)
      .sort((a, b) => a.distanceMiles - b.distanceMiles)
      .slice(0, 5);
  }, [navigation.activeOriginTarget, partnerShops]);

  useEffect(() => {
    if (!selectedShop && nearbyShops.length > 0) {
      setSelectedShopId(`${nearbyShops[0].id || nearbyShops[0].name}`);
    } else if (nearbyShops.length === 0 && !selectedShopId && partnerShops.length > 0) {
      setSelectedShopId(`${partnerShops[0].id || partnerShops[0].name}`);
    }
  }, [nearbyShops, partnerShops, selectedShop, selectedShopId]);

  useEffect(() => {
    const sync = () => setNavigationSession(loadNavigationSession());
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  function updateMapView(center: [number, number], zoom: number) {
    setMapCenter(center);
    setMapZoom(zoom);
    setMapRevision((c) => c + 1);
  }

  function handleSelectShop(shop: CoveragePartnerShop, opts?: { centerMap?: boolean }) {
    setSelectedShopId(`${shop.id || shop.name}`);
    if (opts?.centerMap) updateMapView([shop.lat, shop.lng], 12);
  }

  function handleOpenDirections(shop: CoveragePartnerShop) {
    handleSelectShop(shop, { centerMap: true });
    markRecentNavigationLocation({
      label: shop.name,
      subtitle: shop.addressLine || shop.countyLabel,
      coordinate: { lat: shop.lat, lng: shop.lng },
    });
    openDirections({
      provider: preferredNavigationProvider,
      destination: shop,
      origin: navigation.activeOriginTarget,
    });
    setNavigationSession(loadNavigationSession());
  }

  /* Display: prefer nearby (distance-sorted), fallback to first 5 partners */
  const displayShops: CoverageNearbyShop[] =
    nearbyShops.length > 0
      ? nearbyShops
      : partnerShops.slice(0, 5).map((s) => ({ ...s, distanceMiles: 0 }));
  const compactShops = displayShops.slice(0, 4);

  return (
    <>
      {/* ── Map-backed widget card ── */}
      <section
        className={`bd-glass-card overflow-hidden${isLight ? " bd-light-surface" : ""}`}
        style={
          isLight
            ? {
                borderColor: "rgba(148,163,184,0.30)",
                boxShadow: "0 14px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.80)",
              }
            : {
                borderColor: "rgba(96,165,250,0.24)",
                boxShadow: "0 14px 30px rgba(3,10,24,0.38), inset 0 1px 0 rgba(147,197,253,0.12)",
              }
        }
      >
        {/* Embedded mini-map */}
        <div className="relative h-[200px] md:h-[220px]">
          <DashboardMapPreview
            shops={partnerShops}
            center={mapCenter}
            zoom={mapZoom}
            isLight={isLight}
            onShopClick={(shop) => {
              handleSelectShop(shop, { centerMap: true });
              setIsMapExpanded(true);
            }}
            onMapClick={() => {
              if (onViewShops) onViewShops();
              else setIsMapExpanded(true);
            }}
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
            <MapPinned className={`h-3.5 w-3.5 ${isLight ? "text-blue-600" : "text-blue-300"}`} />
            <span
              className={`text-xs font-semibold ${isLight ? "text-slate-700" : "text-slate-100"}`}
            >
              {isLoadingShops ? "Finding shops\u2026" : `${displayShops.length} shops near you`}
            </span>
          </div>

          {/* Floating CTA — top right */}
          <button
            type="button"
            onClick={() => {
              if (onViewShops) onViewShops();
              else setIsMapExpanded(true);
            }}
            className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 min-h-[40px] text-xs font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:scale-[0.96] shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Navigation className="h-3.5 w-3.5" />
            Open Map
          </button>
        </div>

        {/* Compact shop summary row below map */}
        <div className="px-4 py-3 md:px-5">
          {!isLoadingShops && compactShops.length > 0 ? (
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-0.5">
              {compactShops.map((shop) => (
                <button
                  key={shop.id || shop.name}
                  type="button"
                  onClick={() => {
                    handleSelectShop(shop, { centerMap: true });
                    setIsMapExpanded(true);
                  }}
                  className={`flex items-center gap-2 shrink-0 rounded-xl px-3 py-2 text-left transition-colors active:scale-[0.97] ${
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
                      className={`text-xs font-medium truncate max-w-[100px] ${
                        isLight ? "text-slate-700" : "text-slate-100"
                      }`}
                    >
                      {shop.name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {shop.distanceMiles > 0 && (
                        <span
                          className={`text-[10px] ${
                            isLight ? "text-slate-500" : "text-blue-100/70"
                          }`}
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
              <p className="text-xs">Could not load shops. Check your connection.</p>
            </div>
          ) : !isLoadingShops ? (
            <p
              className={`text-center text-sm py-2 ${
                isLight ? "text-slate-500" : "text-blue-100/75"
              }`}
            >
              No shops found nearby. Open the map to search.
            </p>
          ) : null}

          {onViewShops && (
            <button
              type="button"
              onClick={onViewShops}
              className={`mt-2.5 flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isLight
                  ? "border border-blue-200/50 bg-blue-50/40 text-blue-700 hover:bg-blue-50/70"
                  : "border border-blue-400/20 bg-blue-500/8 text-blue-200/85 hover:bg-blue-500/15"
              }`}
            >
              <span>Browse all shops & AI matching</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
          )}
        </div>
      </section>

      {/* ── Full-screen map dialog (triggered from widget) ── */}
      <CoverageMapDialog
        open={isMapExpanded}
        onOpenChange={setIsMapExpanded}
        center={mapCenter}
        zoom={mapZoom}
        revision={mapRevision}
        tileMode={tileMode}
        counties={countyCenters}
        partnerShops={partnerShops}
        mapSearchTarget={navigation.activeOriginTarget}
        listSearchTarget={navigation.activeOriginTarget}
        nearbyShops={nearbyShops}
        radiusMiles="20"
        radiusMeters={20 * 1609.34}
        regionCount={operatingRegions.length}
        isLoadingShops={isLoadingShops}
        selectedShopId={selectedShopId}
        initialDiscoveryRole="customer"
        preferredNavigationProvider={preferredNavigationProvider}
        selectedShop={selectedShop}
        navigationSession={navigationSession}
        navigation={navigation}
        onTileModeChange={setTileMode}
        onCenterActive={() => {
          if (!navigation.activeOriginTarget) return;
          updateMapView([navigation.activeOriginTarget.lat, navigation.activeOriginTarget.lng], 11);
        }}
        onResetView={() => updateMapView(defaultCoverageCenter, 9)}
        onSelectShop={(shop) => handleSelectShop(shop, { centerMap: true })}
        onPreferredNavigationProviderChange={setPreferredNavigationProvider}
        onOpenDirections={handleOpenDirections}
      />
    </>
  );
}
