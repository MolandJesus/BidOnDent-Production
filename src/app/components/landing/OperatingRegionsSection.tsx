import { MapPin } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useOperatingRegionsCoverage } from "../../hooks/useOperatingRegionsCoverage";
import type { NavigationDiscoveryRole } from "../../services/navigation/placeDiscovery";
import ServiceCoverageMap from "../maps/ServiceCoverageMap";
import CoverageMapDialog from "./CoverageMapDialog";
import CoverageNearestShops from "./CoverageNearestShops";
import CoverageSearchPanel from "./CoverageSearchPanel";
import { operatingRegions } from "./coverageData";

type OperatingRegionsSectionProps = {
  initialDiscoveryRole?: NavigationDiscoveryRole;
};

export default function OperatingRegionsSection({
  initialDiscoveryRole,
}: OperatingRegionsSectionProps) {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
  const coverage = useOperatingRegionsCoverage();

  return (
    <section
      id="coverage"
      className="py-10 sm:py-14 text-white relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0a1628 0%, #0d1b33 50%, #091422 100%)" }}
      ref={sectionRef}
    >
      {/* Smooth transition edges — top/bottom gradient fades */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0a1628]/0 to-transparent pointer-events-none z-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/25 to-transparent" />
      {/* Atmospheric depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:28px_28px] opacity-20" />
      <div className="absolute top-0 right-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-[10%] w-56 h-56 bg-indigo-400/[0.05] rounded-full blur-[100px]" />
      <div className="container mx-auto px-4 max-w-6xl relative">
        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="uppercase tracking-[0.12em] text-sm text-blue-200/80 mb-2">
                Find a Shop
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold">Search coverage near you</h3>
            </div>
          </div>

          {/* Search-first: CoverageSearchPanel leads */}
          <div className="mt-4 sm:mt-6">
            <CoverageSearchPanel
              tone={coverage.surfaceTone}
              zipCode={coverage.zipCode}
              radiusMiles={coverage.radiusMiles}
              normalizedZip={coverage.normalizedZip}
              hasCoverageSignal={coverage.hasCoverageSignal}
              coverageCounty={coverage.coverageCounty}
              activeOriginMode={coverage.activeOriginMode}
              currentLocationLabel={coverage.currentLocationLabel}
              geoMessage={coverage.geoMessage}
              isFindingLocation={coverage.isFindingLocation}
              canCenterMap={Boolean(coverage.mapFocusTarget)}
              onZipCodeChange={coverage.handleZipCodeChange}
              onRadiusMilesChange={coverage.setRadiusMiles}
              onCenterMap={() => {
                if (!coverage.mapFocusTarget) {
                  return;
                }

                coverage.centerOnTarget(
                  coverage.mapFocusTarget,
                  coverage.mapFocusTarget.source === "geolocation"
                    ? "Coverage map centered to your live location."
                    : `Coverage map centered on ${coverage.mapFocusTarget.label}.`
                );
              }}
              onUseCurrentLocation={coverage.handleUseCurrentLocation}
              onExpandMap={() => coverage.setIsMapExpanded(true)}
            />

            {/* Compact region pills — Apple Maps style */}
            <div className="mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="shrink-0 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200/60">
                Active:
              </span>
              {operatingRegions.map((region) => (
                <span
                  key={region}
                  className="shrink-0 inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-blue-400/20 bg-blue-500/8 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-blue-200/80"
                >
                  <MapPin className="w-3 h-3 text-blue-400/60" />
                  {region.replace(" County", "")}
                </span>
              ))}
            </div>

            <ServiceCoverageMap
              className="mt-4"
              center={coverage.mapView.center}
              zoom={coverage.mapView.zoom}
              revision={coverage.mapView.revision}
              tileMode={coverage.tileMode}
              counties={coverage.countyCenters}
              partnerShops={coverage.mapPartnerShops}
              activeSearchTarget={coverage.mapFocusTarget}
              radiusMeters={coverage.radiusMeters}
              radiusMiles={coverage.radiusMiles}
              regionCount={operatingRegions.length}
              selectedShopId={coverage.selectedShopId}
              showNavigationHud={false}
              routeGeometry={coverage.routeGeometry}
              routeFitKey={coverage.navigation.routePreview?.fetchedAt ?? null}
              currentPosition={
                coverage.navigation.currentPosition
                  ? [
                      coverage.navigation.currentPosition.lat,
                      coverage.navigation.currentPosition.lng,
                    ]
                  : null
              }
              gpsAccuracyMeters={coverage.navigation.gpsAccuracyMeters}
              currentSpeedMph={coverage.navigation.currentSpeedMph}
              postedSpeedLimitMph={coverage.navigation.speedLimitSnapshot?.speedLimitMph ?? null}
              postedSpeedLimitConfidence={
                coverage.navigation.speedLimitSnapshot?.confidence ?? null
              }
              speedLimitMatchDistanceMeters={
                coverage.navigation.speedLimitSnapshot?.matchDistanceMeters ?? null
              }
              nearestRoadName={coverage.navigation.speedLimitSnapshot?.roadName ?? null}
              nextInstruction={coverage.navigation.nextStep?.instruction ?? null}
              voiceMode={coverage.navigation.settings.voiceMode}
              onTileModeChange={coverage.setTileMode}
              onCenterActive={() => coverage.centerOnTarget(coverage.mapFocusTarget)}
              onResetView={coverage.resetOverviewMap}
              onExpand={() => coverage.setIsMapExpanded(true)}
              onSelectShop={coverage.handleSelectShopById}
            />

            <div className="mt-4">
              <CoverageNearestShops
                tone={coverage.surfaceTone}
                isLoadingShops={coverage.isLoadingShops}
                activeSearchTarget={coverage.listSearchTarget}
                nearbyShops={coverage.nearbyShops}
                radiusMiles={coverage.radiusMiles}
                selectedShopId={coverage.selectedShopId}
                preferredNavigationProvider={coverage.preferredNavigationProvider}
                onSelectShop={(shop) => coverage.handleSelectShop(shop, { centerMap: true })}
                onPreferredNavigationProviderChange={coverage.setPreferredNavigationProvider}
                onOpenDirections={coverage.handleOpenDirections}
              />
            </div>
          </div>
        </div>
      </div>

      <CoverageMapDialog
        open={coverage.isMapExpanded}
        onOpenChange={coverage.setIsMapExpanded}
        center={coverage.mapView.center}
        zoom={coverage.mapView.zoom}
        revision={coverage.mapView.revision}
        tileMode={coverage.tileMode}
        counties={coverage.countyCenters}
        partnerShops={coverage.mapPartnerShops}
        mapSearchTarget={coverage.mapFocusTarget}
        listSearchTarget={coverage.listSearchTarget}
        nearbyShops={coverage.nearbyShops}
        radiusMiles={coverage.radiusMiles}
        radiusMeters={coverage.radiusMeters}
        regionCount={operatingRegions.length}
        isLoadingShops={coverage.isLoadingShops}
        selectedShopId={coverage.selectedShopId}
        initialDiscoveryRole={initialDiscoveryRole}
        preferredNavigationProvider={coverage.preferredNavigationProvider}
        selectedShop={coverage.selectedShop}
        navigationSession={coverage.navigationSession}
        navigation={coverage.navigation}
        onTileModeChange={coverage.setTileMode}
        onCenterActive={() => coverage.centerOnTarget(coverage.mapFocusTarget)}
        onResetView={coverage.resetOverviewMap}
        onSelectShop={(shop) => coverage.handleSelectShop(shop, { centerMap: true })}
        onPreferredNavigationProviderChange={coverage.setPreferredNavigationProvider}
        onOpenDirections={coverage.handleOpenDirections}
      />
    </section>
  );
}
