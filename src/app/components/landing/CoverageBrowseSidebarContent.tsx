/**
 * CoverageBrowseSidebarContent — Shared browse content for sidebar and bottom sheet.
 *
 * Pure presentation + structure layer, shared by:
 *   - Desktop: CoverageCommandCenterSidebar → CoverageBrowseSidebarContent
 *   - Mobile: MobileMapBottomSheet → CoverageBrowseSidebarContent
 *
 * All state, hooks, and orchestration remain in CoverageBrowseExperience.
 */

import { Compass, Crosshair, MapPinned, RotateCcw, Search, Star } from "lucide-react";
import type { CoverageNavigationExperience } from "../../hooks/useCoverageNavigationExperience";
import type { NavigationDiscoveryPlace } from "../../services/navigation/placeDiscovery";
import type { NavigationDiscoveryRole } from "../../services/navigation/placeDiscovery";
import type { NavigationProvider } from "../../services/navigation/externalNavigation";
import type {
  CoverageNearbyShop,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapSurfaceTheme,
  MapSurfaceTone,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";
import type { NavigationParkedCarLocation, NavigationSavedLocation } from "../../types/navigation";
import CoverageNavigationPlanner from "../maps/command-center/CoverageNavigationPlanner";
import NavigationErrorBoundary from "../maps/NavigationErrorBoundary";
import NavigationBrowseDiscoveryPanel from "../maps/navigation/NavigationBrowseDiscoveryPanel";
import NavigationSavedPlacesPanel from "../maps/navigation/NavigationSavedPlacesPanel";
import CoverageNearestShops from "./CoverageNearestShops";
import { cn } from "../ui/utils";

type SidebarView = "search" | "explore" | "saved" | "shops";

const VIEW_TABS: Array<{ id: SidebarView; label: string; Icon: typeof Search }> = [
  { id: "search", label: "Search", Icon: Search },
  { id: "explore", label: "Explore", Icon: Compass },
  { id: "saved", label: "Saved", Icon: Star },
  { id: "shops", label: "Shops", Icon: MapPinned },
];

type CoverageBrowseSidebarContentProps = {
  tone: MapSurfaceTone;
  theme: MapSurfaceTheme;

  /* ── View / map controls ── */
  sidebarView: SidebarView;
  onSidebarViewChange: (view: SidebarView) => void;
  tileMode: MapTileMode;
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterActive: () => void;
  onResetView: () => void;

  /* ── Navigation planner ── */
  navigation: CoverageNavigationExperience;
  selectedShop: CoveragePartnerShop | null;
  onStartNavigation: () => void;

  /* ── Explore panel ── */
  listSearchTarget: CoverageSearchTarget | null;
  nearbyShops: CoverageNearbyShop[];
  selectedShopId?: string;
  discoveryRole: NavigationDiscoveryRole;
  initialDiscoveryRole?: NavigationDiscoveryRole;
  onDiscoveryRoleChange: (role: NavigationDiscoveryRole) => void;
  selectedDiscoveryPlaceId?: string;
  selectedDiscoveryPlace: NavigationDiscoveryPlace | null;
  discoveryPlaces: NavigationDiscoveryPlace[];
  isLoadingDiscoveryPlaces: boolean;
  discoveryError: string;
  onSelectShop: (shop: CoverageNearbyShop) => void;
  onOpenShopDirections: (shop: CoverageNearbyShop) => void;
  onSelectDiscoveryPlace: (place: NavigationDiscoveryPlace) => void;
  onOpenDiscoveryPlaceDirections: (place: NavigationDiscoveryPlace) => void;

  /* ── Saved panel ── */
  savedNavigation: {
    pinnedLocations: NavigationSavedLocation[];
    recentLocations: NavigationSavedLocation[];
    parkedCar: NavigationParkedCarLocation | null;
  };
  onSaveCurrentOrigin: (category: "home" | "work" | "saved") => void;
  onUseSavedLocation: (target: CoverageSearchTarget, id?: string) => void;
  onDeleteSavedLocation: (id: string) => void;
  onSaveParkedCar: () => void;
  onClearParkedCar: () => void;

  /* ── Shops panel ── */
  isLoadingShops: boolean;
  radiusMiles: string;
  preferredNavigationProvider: NavigationProvider;
  onPreferredNavigationProviderChange: (provider: NavigationProvider) => void;
  onOpenDirections: (shop: CoveragePartnerShop) => void;
};

export default function CoverageBrowseSidebarContent({
  tone,
  theme,
  sidebarView,
  onSidebarViewChange,
  tileMode,
  onTileModeChange,
  onCenterActive,
  onResetView,
  navigation,
  selectedShop,
  onStartNavigation,
  listSearchTarget,
  nearbyShops,
  selectedShopId,
  discoveryRole,
  initialDiscoveryRole,
  onDiscoveryRoleChange,
  selectedDiscoveryPlaceId,
  selectedDiscoveryPlace,
  discoveryPlaces,
  isLoadingDiscoveryPlaces,
  discoveryError,
  onSelectShop,
  onOpenShopDirections,
  onSelectDiscoveryPlace,
  onOpenDiscoveryPlaceDirections,
  savedNavigation,
  onSaveCurrentOrigin,
  onUseSavedLocation,
  onDeleteSavedLocation,
  onSaveParkedCar,
  onClearParkedCar,
  isLoadingShops,
  radiusMiles,
  preferredNavigationProvider,
  onPreferredNavigationProviderChange,
  onOpenDirections,
}: CoverageBrowseSidebarContentProps) {
  return (
    <>
      {/* ── Sticky control bar — view tabs + tile + map controls ── */}
      <div
        className={cn(
          "sticky top-0 z-20 space-y-1.5 rounded-[1.25rem] p-2 backdrop-blur-2xl",
          theme.panelStrongClassName
        )}
      >
        {/* View tab bar (segmented control) */}
        <div className={theme.segmentedClassName}>
          {VIEW_TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSidebarViewChange(id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 rounded-full px-2 py-2 min-h-[44px] text-[11px] font-semibold transition-all duration-200",
                sidebarView === id ? theme.activeSegmentClassName : theme.inactiveSegmentClassName
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}
        </div>

        {/* Map utility controls — removed: tile mode + center/reset now live on map icon rail only */}
        <div className="hidden xl:flex gap-1.5">
          <button
            type="button"
            onClick={onCenterActive}
            className={cn(
              theme.tertiaryButtonClassName,
              "flex-1 !rounded-full !py-1 !px-2 !text-[11px]"
            )}
          >
            <Crosshair className="h-3 w-3" />
            Center
          </button>
          <button
            type="button"
            onClick={onResetView}
            className={cn(
              theme.tertiaryButtonClassName,
              "flex-1 !rounded-full !py-1 !px-2 !text-[11px]"
            )}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
      </div>

      {/* ── Panel content (wrapped in error boundary) ── */}
      <NavigationErrorBoundary>
        {sidebarView === "search" && (
          <CoverageNavigationPlanner
            tone={tone}
            selectedShop={selectedShop}
            activeOriginLabel={navigation.activeOriginLabel}
            addressQuery={navigation.addressQuery}
            onAddressQueryChange={navigation.setAddressQuery}
            onSearchAddresses={() => {
              void navigation.searchAddresses();
            }}
            addressResults={navigation.addressResults}
            selectedAddressResult={navigation.selectedAddressResult}
            isSearchingAddresses={navigation.isSearchingAddresses}
            addressError={navigation.addressError}
            onChooseAddressResult={navigation.chooseAddressResult}
            onClearAddressResult={navigation.clearAddressResult}
            addressSuggestions={navigation.addressSuggestions}
            settings={navigation.settings}
            onVoiceModeChange={navigation.setVoiceMode}
            onVoiceVolumePresetChange={navigation.setVoiceVolumePreset}
            onGpsTrackingEnabledChange={navigation.setGpsTrackingEnabled}
            onSpeedLimitMonitorEnabledChange={navigation.setSpeedLimitMonitorEnabled}
            onResetNavigationSettings={navigation.resetNavigationSettings}
            onRetryRoutePreview={navigation.refreshRoutePreview}
            onStartNavigation={onStartNavigation}
            preferredVoiceLabel={navigation.preferredVoiceLabel}
            voiceGuidanceSupported={navigation.voiceGuidanceSupported}
            voiceStatusLabel={navigation.voiceStatusLabel}
            routePreview={navigation.routePreview}
            routeAlternatives={navigation.routeAlternatives}
            selectedRouteIndex={navigation.selectedRouteIndex}
            onSelectRouteIndex={navigation.setSelectedRouteIndex}
            isLoadingRoute={navigation.isLoadingRoute}
            routeError={navigation.routeError}
            currentStepIndex={navigation.currentStepIndex}
            gpsAccuracyMeters={navigation.gpsAccuracyMeters}
            gpsError={navigation.gpsError}
            gpsStatus={navigation.gpsStatus}
            retryGps={navigation.retryGps}
            speedLimitStatus={navigation.speedLimitStatus}
            focusMode="search"
            showDiagnostics={import.meta.env.DEV}
            showSavedAndDiscoveryHints
            showAdvancedControls={false}
          />
        )}

        {sidebarView === "explore" ? (
          <NavigationBrowseDiscoveryPanel
            tone={tone}
            activeSearchTarget={listSearchTarget}
            nearbyShops={nearbyShops}
            selectedShopId={selectedShopId}
            discoveryRole={discoveryRole}
            defaultDiscoveryRole={initialDiscoveryRole}
            selectedDiscoveryPlaceId={selectedDiscoveryPlaceId}
            selectedDiscoveryPlace={selectedDiscoveryPlace}
            discoveryPlaces={discoveryPlaces}
            isLoadingDiscoveryPlaces={isLoadingDiscoveryPlaces}
            discoveryError={discoveryError}
            onDiscoveryRoleChange={onDiscoveryRoleChange}
            onSelectShop={onSelectShop}
            onOpenShopDirections={onOpenShopDirections}
            onSelectDiscoveryPlace={onSelectDiscoveryPlace}
            onOpenDiscoveryPlaceDirections={onOpenDiscoveryPlaceDirections}
          />
        ) : null}

        {sidebarView === "saved" ? (
          <NavigationSavedPlacesPanel
            tone={tone}
            activeOriginLabel={navigation.activeOriginLabel}
            activeOriginTarget={navigation.activeOriginTarget}
            currentPositionAvailable={Boolean(navigation.currentPosition)}
            pinnedLocations={savedNavigation.pinnedLocations}
            recentLocations={savedNavigation.recentLocations}
            parkedCar={savedNavigation.parkedCar}
            onSaveCurrentOrigin={onSaveCurrentOrigin}
            onUseSavedLocation={onUseSavedLocation}
            onDeleteSavedLocation={onDeleteSavedLocation}
            onSaveParkedCar={onSaveParkedCar}
            onClearParkedCar={onClearParkedCar}
          />
        ) : null}

        {sidebarView === "shops" ? (
          <CoverageNearestShops
            tone={tone}
            className={cn("p-4", theme.panelStrongClassName)}
            isLoadingShops={isLoadingShops}
            activeSearchTarget={listSearchTarget}
            nearbyShops={nearbyShops}
            radiusMiles={radiusMiles}
            selectedShopId={selectedShopId}
            preferredNavigationProvider={preferredNavigationProvider}
            onSelectShop={onSelectShop}
            onPreferredNavigationProviderChange={onPreferredNavigationProviderChange}
            onOpenDirections={onOpenDirections}
          />
        ) : null}
      </NavigationErrorBoundary>
    </>
  );
}
