import type { FormEvent } from "react";
import type { MapTileMode } from "../maps/serviceCoverageMapTypes";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { NavigationSessionStatus } from "../../features/navigation";
import type { GpsStatus } from "../../hooks/useNavigationGpsTracking";
import type { DamageReport } from "../../services/supabase/types";
import type {
  NavigationAddressResult,
  NavigationAddressSuggestion,
  NavigationRouteStep,
} from "../../types/navigation";
import type { NavigationVoiceMode, NavigationVoiceVolumePreset } from "../../types/navigation";
import type {
  Coordinates,
  MapTheme,
  MapViewMode,
  MapViewportBounds,
  Place,
  RouteOption,
  SavedPlace,
  ShopSortOption,
} from "../../types/mapDomain";

export type ShopDirectoryImmersiveMapProps = {
  mapListings: ShopMapListing[];
  routeOptions: RouteOption[];
  selectedRoute: RouteOption | null;
  selectedRouteId: string | null;
  selectedShopId: number | null;
  selectedShop: ShopMapListing | null;
  selectedOrigin: Place | null;
  savedPlaces: SavedPlace[];
  routeSummary: IntelligenceSummary;
  mapTheme: MapTheme;
  isMapDark?: boolean;
  mapCenter: Coordinates | null;
  mapZoom: number;
  userType: MarketUserType;
  roleHighlights: {
    badge: string;
    title: string;
    callouts: string[];
    secondaryActionLabel: string;
  };
  roleCollectionIds: number[];
  primaryColor: string;
  directionsActionLabel: string;
  searchQuery: string;
  navigationSessionStatus: NavigationSessionStatus;
  navigationSessionDestinationId: string | null;
  sessionActiveSeconds: number;
  hasArrived?: boolean;
  remainingEtaLabel?: string | null;
  remainingDistanceLabel?: string | null;
  usingLiveRoutes?: boolean;
  routeError?: string;
  isLoadingRoute?: boolean;
  guidanceOverlay?: React.ReactNode;
  followCurrentPosition?: boolean;
  followCurrentPositionRevision?: number;
  deviationPrompt?: React.ReactNode;
  isOffRoute?: boolean;
  navigationMode: "browse" | "route-preview" | "guidance";
  routeSteps?: NavigationRouteStep[];
  currentStepIndex?: number;
  nextInstruction?: string | null;
  currentSpeedMph?: number | null;
  speedLimitMph?: number | null;
  gpsStatus?: GpsStatus;
  gpsError?: string;
  followingInstruction?: string | null;
  voiceMode?: NavigationVoiceMode;
  voiceVolumePreset?: NavigationVoiceVolumePreset;
  preferredVoiceLabel?: string | null;
  voiceGuidanceSupported?: boolean;
  onVoiceModeChange?: (mode: NavigationVoiceMode) => void;
  onVoiceVolumePresetChange?: (preset: NavigationVoiceVolumePreset) => void;
  gpsTrackingEnabled?: boolean;
  speedLimitMonitorEnabled?: boolean;
  autoRerouteEnabled?: boolean;
  onToggleGpsTracking?: () => void;
  onToggleSpeedLimitMonitor?: () => void;
  onToggleAutoReroute?: () => void;
  onRetryGps?: () => void;
  onRetryRoute?: () => void;
  searchWithinViewport?: boolean;
  onSearchInArea?: () => void;
  onClearAreaSearch?: () => void;
  onFindShopsNear?: (coords: { lat: number; lng: number }) => void;

  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: (event: FormEvent) => void;
  onSelectShop: (id: number | null) => void;
  onSelectRoute: (id: string) => void;
  onToggleRoleCollection: (shopId: number) => void;
  onOpenShopDirections: (shop: ShopMapListing) => void;
  onStartNavigation?: (shop: ShopMapListing) => void;
  onViewDetails?: (shop: ShopMapListing) => void;
  onRequestEstimate?: (shop: ShopMapListing) => void;
  onPauseNavigation?: () => void;
  onResumeNavigation?: () => void;
  onEndNavigation?: () => void;
  onRecenterNavigation?: () => void;
  onSetMapCenter: (center: Coordinates) => void;
  onSetMapZoom: (zoom: number) => void;
  onSetMapViewportBounds: (bounds: MapViewportBounds) => void;
  onToggleTheme: () => void;
  onSwitchMode: (mode: MapViewMode) => void;
  onBack: () => void;
  userCoords?: Coordinates | null;
  userHeadingDegrees?: number | null;
  onViewReportDetail?: (reportId: string) => void;
  onPlaceBid?: (report: DamageReport) => void;
  onViewBids?: (reportId: string) => void;
  initialReports?: DamageReport[];
  // Origin picker props for immersive mode
  suggestedOrigins?: Place[];
  originSearchQuery?: string;
  originSearchResults?: NavigationAddressResult[];
  originSuggestions?: NavigationAddressSuggestion[];
  isSearchingOrigins?: boolean;
  originSearchError?: string;
  locationError?: string | null;
  isLocating?: boolean;
  onSelectOrigin?: (origin: Place) => void;
  onOriginSearchQueryChange?: (query: string) => void;
  onSearchOrigin?: () => void | Promise<void>;
  onSelectOriginSearchResult?: (result: NavigationAddressResult) => void;
  onSelectOriginSuggestion?: (suggestion: NavigationAddressSuggestion) => void;
  onUseMyLocation?: () => void;
  sortBy?: ShopSortOption;
  onSortChange?: (sort: ShopSortOption) => void;
};
