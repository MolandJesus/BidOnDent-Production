import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { NavigationSessionStatus } from "../../features/navigation";
import type { NavigationRouteStep } from "../../types/navigation";
import type { MapTileMode } from "../maps/serviceCoverageMapTypes";
import type { DamageReport } from "../../types";
import type {
  Coordinates,
  MapTheme,
  MapViewportBounds,
  Place,
  RouteOption,
  SavedPlace,
} from "../../types/mapDomain";

/* ── Props ──────────────────────────────────────────────────────────── */
export type ShopDirectoryMapPaneProps = {
  shops: ShopMapListing[];
  routeOptions: RouteOption[];
  selectedRouteId?: string | null;
  selectedShopId: number | null;
  onSelectShop: (shopId: number | null) => void;
  selectedOrigin?: Place | null;
  savedPlaces: SavedPlace[];
  mapTheme: MapTheme;
  initialCenter?: Coordinates;
  initialZoom?: number;
  preserveViewport?: boolean;
  userType: MarketUserType;
  onViewportChange: (center: Coordinates, zoom: number, bounds: MapViewportBounds) => void;
  children?: React.ReactNode;
  suppressHeader?: boolean;
  suppressTilePicker?: boolean;
  externalTileMode?: MapTileMode | null;
  searchWithinViewport?: boolean;
  onSearchInArea?: () => void;
  onClearAreaSearch?: () => void;
  onFindShopsNear?: (coords: { lat: number; lng: number }) => void;
  userCoords?: Coordinates | null;
  userHeadingDegrees?: number | null;
  followCurrentPosition?: boolean;
  followCurrentPositionRevision?: number;
  onOpenShopDirections?: (shop: ShopMapListing) => void;
  onStartNavigation?: (shop: ShopMapListing) => void;
  onViewDetails?: (shop: ShopMapListing) => void;
  onRequestEstimate?: (shop: ShopMapListing) => void;
  navigationSessionStatus: NavigationSessionStatus;
  navigationSessionDestinationId: string | null;
  directionsActionLabel?: string;
  hasArrived?: boolean;
  remainingEtaLabel?: string | null;
  remainingDistanceLabel?: string | null;
  usingLiveRoutes?: boolean;
  routeError?: string;
  isLoadingRoute?: boolean;
  onViewReportDetail?: (reportId: string) => void;
  onPlaceBid?: (report: DamageReport) => void;
  onViewBids?: (reportId: string) => void;
  initialReports?: DamageReport[];
  focusReportId?: string;
  navigationSteps?: NavigationRouteStep[];
  currentStepIndex?: number;
  navigationMode?: "browse" | "route-preview" | "guidance";
  isOffRoute?: boolean;
  onSwitchToListMode?: () => void;
  onExpandMap?: () => void;
  suppressBottomCard?: boolean;
  suppressShopPopup?: boolean;
  onTileDarkChange?: (isDark: boolean) => void;
  onTileModeChange?: (mode: MapTileMode) => void;
  overlayDensity?: "default" | "compact";
};
