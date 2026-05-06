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
import { useNavigationVoicePriming } from "../../hooks/useNavigationVoicePriming";
import { haversineMiles } from "../../services/supabase/map";
import type { ExternalNavigationSession } from "../../types/navigation";
import CoverageMapDialog from "../landing/CoverageMapDialog";
import { countyCenters, defaultCoverageCenter, operatingRegions } from "../landing/coverageData";
import { mapLibreTileLabels } from "../maps/mapLibreStyles";
import type {
  CoverageNearbyShop,
  CoveragePartnerShop,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";
import type { NavigationDiscoveryRole } from "../../services/navigation/placeDiscovery";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type DashboardCoveragePanelProps = {
  primaryColor: string;
  secondaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  userType?: NavigationDiscoveryRole;
  onOpenCoveragePage?: () => void;
};

export default function DashboardCoveragePanel({
  primaryColor,
  secondaryColor,
  appearanceMode = "map-dark",
  userType,
  onOpenCoveragePage,
}: DashboardCoveragePanelProps) {
  const isLight = appearanceMode === "light";
  const primeVoice = useNavigationVoicePriming();
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
  const [navigationStartRequestId, setNavigationStartRequestId] = useState(0);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(false);

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
    voiceGuidanceEnabled,
  });
  const nearbyShops = useMemo<CoverageNearbyShop[]>(() => {
    if (!navigation.activeOriginTarget) {
      return [];
    }

    return partnerShops
      .map((shop) => ({
        ...shop,
        distanceMiles: haversineMiles(navigation.activeOriginTarget!, shop),
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

  useEffect(() => {
    if (!isMapExpanded && voiceGuidanceEnabled) {
      setVoiceGuidanceEnabled(false);
    }
  }, [isMapExpanded, voiceGuidanceEnabled]);

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

  function handleOpenBidOnDentNavigation(shop: CoveragePartnerShop) {
    handleSelectShop(shop, { centerMap: true });
    markRecentNavigationLocation({
      label: shop.name,
      subtitle: shop.addressLine || shop.countyLabel,
      coordinate: {
        lat: shop.lat,
        lng: shop.lng,
      },
    });
    if (navigation.settings.voiceMode !== "muted") {
      primeVoice();
    }
    setIsMapExpanded(true);
    setNavigationStartRequestId((current) => current + 1);
  }

  return (
    <>
      <section className="bd-dashboard-panel p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="bd-dashboard-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--bd-royal-blue)]">
              <Radar className="w-3.5 h-3.5" />
              Coverage
            </div>
            <h2
              className={`mt-3 text-2xl font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
            >
              Coverage command center
            </h2>
            <p className={`mt-2 text-sm ${isLight ? "text-slate-700" : "text-slate-300/80"}`}>
              Open the NY coverage map from the dashboard, review partner density as the network
              grows, and jump to the full search flow when you need ZIP and radius lookup.
            </p>
          </div>

          <div
            className="bd-dashboard-primary-button hidden h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm sm:flex"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <MapPinned className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="bd-dashboard-section p-4">
            <div
              className={`text-xs uppercase tracking-[0.24em] ${isLight ? "text-slate-500" : "text-slate-400/85"}`}
            >
              Live Regions
            </div>
            <div
              className={`mt-2 text-2xl font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
            >
              {operatingRegions.length}
            </div>
          </div>
          <div className="bd-dashboard-section p-4">
            <div
              className={`text-xs uppercase tracking-[0.24em] ${isLight ? "text-slate-500" : "text-slate-400/85"}`}
            >
              Partner Markers
            </div>
            <div
              className={`mt-2 text-2xl font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
            >
              {partnerShops.length}
            </div>
          </div>
          <div className="bd-dashboard-section p-4">
            <div
              className={`text-xs uppercase tracking-[0.24em] ${isLight ? "text-slate-500" : "text-slate-400/85"}`}
            >
              View Mode
            </div>
            <div
              className={`mt-2 text-2xl font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
            >
              {mapLibreTileLabels[tileMode]}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {operatingRegions.slice(0, 4).map((region) => (
            <span
              key={region}
              className={`bd-dashboard-chip rounded-full px-3 py-1 text-sm ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              {region}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsMapExpanded(true)}
            className="bd-dashboard-primary-button inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white"
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
              className="bd-dashboard-secondary-button inline-flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
            >
              Full Search Flow
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {isLoadingShops ? (
          <p className={`mt-3 text-xs ${isLight ? "text-slate-600" : "text-slate-500"}`}>
            Syncing partner shop markers for the command center...
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
        startNavigationRequestId={navigationStartRequestId}
        navigation={navigation}
        onVoiceGuidanceEnabledChange={setVoiceGuidanceEnabled}
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
        onOpenBidOnDentNavigation={handleOpenBidOnDentNavigation}
        onExportDirections={handleOpenDirections}
      />
    </>
  );
}
