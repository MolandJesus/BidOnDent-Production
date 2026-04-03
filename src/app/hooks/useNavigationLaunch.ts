import { useEffect, useState } from "react";
import { openDirections, type NavigationProvider } from "../services/navigation/externalNavigation";
import { markRecentNavigationLocation } from "../services/navigation/savedLocations";
import { loadNavigationSession } from "../services/navigation/navigationSession";
import { primeVoiceEngine } from "../services/navigation/voiceSupport";
import type { ExternalNavigationSession } from "../types/navigation";
import type {
  CoveragePartnerShop,
  CoverageSearchTarget,
} from "../components/maps/serviceCoverageMapTypes";

interface NavigationLaunchDeps {
  selectedShop: CoveragePartnerShop | null;
  preferredNavigationProvider: NavigationProvider;
  activeOriginTarget: CoverageSearchTarget | null;
  isLoadingRoute: boolean;
  routePreview: { geometry: { lat: number; lng: number }[] } | null;
  voiceMode: string;
  fallbackSearchTarget: CoverageSearchTarget | null;
  isMapExpanded: boolean;
  setIsMapExpanded: (expanded: boolean) => void;
  setGeoMessage: (message: string) => void;
  onSelectShop: (shop: CoveragePartnerShop, options?: { centerMap?: boolean }) => void;
}

export function useNavigationLaunch(deps: NavigationLaunchDeps) {
  const [navigationSession, setNavigationSession] = useState<ExternalNavigationSession | null>(
    loadNavigationSession
  );
  const [navigationStartRequestId, setNavigationStartRequestId] = useState(0);
  const [pendingNavigationStartShopId, setPendingNavigationStartShopId] = useState<string | null>(
    null
  );

  // Sync navigation session when window regains focus
  useEffect(() => {
    const syncNavigationSession = () => {
      setNavigationSession(loadNavigationSession());
    };

    window.addEventListener("focus", syncNavigationSession);
    return () => window.removeEventListener("focus", syncNavigationSession);
  }, []);

  // Auto-trigger navigation start when pending shop + route are ready
  useEffect(() => {
    if (!deps.isMapExpanded) {
      setPendingNavigationStartShopId(null);
      return;
    }

    if (!pendingNavigationStartShopId || !deps.selectedShop) {
      return;
    }

    if (`${deps.selectedShop.id || deps.selectedShop.name}` !== pendingNavigationStartShopId) {
      return;
    }

    if (!deps.activeOriginTarget || deps.isLoadingRoute || !deps.routePreview) {
      return;
    }

    setNavigationStartRequestId((current) => current + 1);
    setPendingNavigationStartShopId(null);
  }, [
    deps.isMapExpanded,
    deps.activeOriginTarget,
    deps.isLoadingRoute,
    deps.routePreview,
    pendingNavigationStartShopId,
    deps.selectedShop,
  ]);

  function handleOpenDirections(shop: CoveragePartnerShop) {
    deps.onSelectShop(shop);
    markRecentNavigationLocation({
      label: shop.name,
      subtitle: shop.addressLine || shop.countyLabel,
      coordinate: {
        lat: shop.lat,
        lng: shop.lng,
      },
    });
    openDirections({
      provider: deps.preferredNavigationProvider,
      destination: shop,
      origin: deps.activeOriginTarget,
    });
    setNavigationSession(loadNavigationSession());
  }

  function handleOpenBidOnDentNavigation(shop: CoveragePartnerShop) {
    if (!deps.activeOriginTarget && !deps.fallbackSearchTarget) {
      deps.setGeoMessage(
        "Choose your current location or enter a ZIP or address before starting a route."
      );
      return;
    }

    deps.onSelectShop(shop, { centerMap: true });
    markRecentNavigationLocation({
      label: shop.name,
      subtitle: shop.addressLine || shop.countyLabel,
      coordinate: {
        lat: shop.lat,
        lng: shop.lng,
      },
    });

    if (deps.voiceMode !== "muted") {
      primeVoiceEngine();
    }

    deps.setGeoMessage("");
    deps.setIsMapExpanded(true);
    setPendingNavigationStartShopId(`${shop.id || shop.name}`);
  }

  return {
    navigationSession,
    navigationStartRequestId,
    handleOpenDirections,
    handleOpenBidOnDentNavigation,
  };
}
