import type { CoverageNavigationExperience } from "../../hooks/useCoverageNavigationExperience";
import type { ExternalNavigationSession } from "../../types/navigation";
import type { NavigationDiscoveryRole } from "../../services/navigation/placeDiscovery";
import type {
  CoverageCountyMarker,
  CoverageNearbyShop,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapSurfaceTone,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";

export type SidebarView = "search" | "explore" | "saved" | "shops";

export type CoverageBrowseExperienceProps = {
  tone: MapSurfaceTone;
  center: [number, number];
  zoom: number;
  revision: number;
  tileMode: MapTileMode;
  counties: CoverageCountyMarker[];
  partnerShops: CoveragePartnerShop[];
  mapSearchTarget: CoverageSearchTarget | null;
  listSearchTarget: CoverageSearchTarget | null;
  nearbyShops: CoverageNearbyShop[];
  radiusMiles: string;
  radiusMeters: number;
  regionCount: number;
  isLoadingShops: boolean;
  coverageFetchError?: string | null;
  usingDemoFallback?: boolean;
  selectedShopId?: string;
  initialDiscoveryRole?: NavigationDiscoveryRole;
  selectedShop: CoveragePartnerShop | null;
  navigationSession: ExternalNavigationSession | null;
  navigation: CoverageNavigationExperience;
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterActive: () => void;
  onResetView: () => void;
  onSelectShop: (shop: CoveragePartnerShop) => void;
  onOpenBidOnDentNavigation: (shop: CoveragePartnerShop) => void;
  onExportDirections: (shop: CoveragePartnerShop) => void;
  onStartNavigation: () => void;
  onRetryPartnerShops?: () => void;
};

export function resolveInitialSidebarView({
  selectedShop,
  listSearchTarget,
  nearbyShops,
}: {
  selectedShop: CoveragePartnerShop | null;
  listSearchTarget: CoverageSearchTarget | null;
  nearbyShops: CoverageNearbyShop[];
}): SidebarView {
  if (selectedShop) {
    return "search";
  }

  if (listSearchTarget && nearbyShops.length > 0) {
    return "shops";
  }

  return "search";
}
