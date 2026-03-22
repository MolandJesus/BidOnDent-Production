import { ArrowUpRight, Globe, MapPinned, Radar } from "lucide-react";
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
import { mapTileLayers } from "../maps/mapTileLayers";
import type {
  CoverageNearbyShop,
  CoveragePartnerShop,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";
import type { NavigationDiscoveryRole } from "../../services/navigation/placeDiscovery";

type DashboardCoveragePanelProps = {
  primaryColor: string;
  secondaryColor: string;
  userType?: NavigationDiscoveryRole;
  onOpenCoveragePage?: () => void;
};

export default function DashboardCoveragePanel({
  primaryColor,
  secondaryColor,
  userType,
  onOpenCoveragePage,
}: DashboardCoveragePanelProps) {
  const { partnerShops, isLoadingShops } = useCoveragePartnerShops();
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
      partnerShops.find((shop) => `${shop.id || shop.name}` === selectedShopId) ||
      partnerShops[0] ||
      null,
    [partnerShops, selectedShopId]
  );
  const navigation = useCoverageNavigationExperience({
    selectedShop,
    fallbackOriginTarget: null,
  });
  const nearbyShops = useMemo<CoverageNearbyShop[]>(() => {
    if (!navigation.activeOriginTarget) {
      return [];
    }

    return partnerShops
      .map((shop) => ({
        ...shop,
        distanceMiles: haversineMiles(navigation.activeOriginTarget, shop),
      }))
      .filter((shop) => shop.distanceMiles <= 20)
      .sort((a, b) => a.distanceMiles - b.distanceMiles)
      .slice(0, 6);
  }, [navigation.activeOriginTarget, partnerShops]);

  useEffect(() => {
    if (!selectedShop && nearbyShops.length > 0) {
      setSelectedShopId(`${nearbyShops[0].id || nearbyShops[0].name}`);
      return;
    }

    if (nearbyShops.length === 0 && !selectedShopId && partnerShops.length > 0) {
      setSelectedShopId(`${partnerShops[0].id || partnerShops[0].name}`);
    }
  }, [nearbyShops, partnerShops, selectedShop, selectedShopId]);

  useEffect(() => {
    const syncNavigationSession = () => {
      setNavigationSession(loadNavigationSession());
    };

    window.addEventListener("focus", syncNavigationSession);
    return () => window.removeEventListener("focus", syncNavigationSession);
  }, []);

  function updateMapView(center: [number, number], zoom: number) {
    setMapCenter(center);
    setMapZoom(zoom);
    setMapRevision((current) => current + 1);
  }

  function handleSelectShop(shop: CoveragePartnerShop, options?: { centerMap?: boolean }) {
    setSelectedShopId(`${shop.id || shop.name}`);

    if (options?.centerMap) {
      updateMapView([shop.lat, shop.lng], 12);
    }
  }

  function handleOpenDirections(shop: CoveragePartnerShop) {
    handleSelectShop(shop, { centerMap: true });
    markRecentNavigationLocation({
      label: shop.name,
      subtitle: shop.addressLine || shop.countyLabel,
      coordinate: {
        lat: shop.lat,
        lng: shop.lng,
      },
    });
    openDirections({
      provider: preferredNavigationProvider,
      destination: shop,
      origin: navigation.activeOriginTarget,
    });
    setNavigationSession(loadNavigationSession());
  }

  return (
    <>
      <section className="bd-glass-panel p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--bd-royal-blue-faint)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--bd-royal-blue)]">
              <Radar className="w-3.5 h-3.5" />
              Coverage
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Coverage command center</h2>
            <p className="mt-2 text-sm text-slate-600">
              Open the live NY coverage map from the dashboard, review partner density, and jump to
              the full search flow when you need ZIP and radius lookup.
            </p>
          </div>

          <div
            className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <MapPinned className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="bd-glass-card p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Live Regions</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {operatingRegions.length}
            </div>
          </div>
          <div className="bd-glass-card p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Partner Markers
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{partnerShops.length}</div>
          </div>
          <div className="bd-glass-card p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">View Mode</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {mapTileLayers[tileMode].label}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {operatingRegions.slice(0, 4).map((region) => (
            <span
              key={region}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
            >
              {region}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsMapExpanded(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Globe className="w-4 h-4" />
            Open Coverage Map
          </button>

          {onOpenCoveragePage ? (
            <button
              type="button"
              onClick={onOpenCoveragePage}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Full Search Flow
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {isLoadingShops ? (
          <p className="mt-3 text-xs text-slate-500">
            Syncing live partner shop markers for the command center...
          </p>
        ) : null}
      </section>

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
        initialDiscoveryRole={userType}
        preferredNavigationProvider={preferredNavigationProvider}
        selectedShop={selectedShop}
        navigationSession={navigationSession}
        navigation={navigation}
        onTileModeChange={setTileMode}
        onCenterActive={() => {
          if (!navigation.activeOriginTarget) {
            return;
          }

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
