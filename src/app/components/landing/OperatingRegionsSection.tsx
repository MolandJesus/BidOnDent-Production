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
      className="py-14 bg-gradient-to-b from-[#131122] via-[#1a1535] to-[#0f1020] text-white relative overflow-hidden"
      ref={sectionRef}
    >
      {/* Atmospheric depth */}
      <div className="absolute top-0 right-1/3 w-72 h-72 bg-indigo-500/12 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 max-w-6xl relative">
        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="uppercase tracking-[0.12em] text-sm text-slate-300 mb-2">
                Current Coverage
              </p>
              <h3 className="text-3xl font-bold">Actively operating in New York service regions</h3>
              <p className="text-slate-300 mt-2 max-w-2xl">
                Explore coverage with our interactive map. Enter ZIP and radius to preview service
                availability and nearby partner hubs.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
            {operatingRegions.map((region) => (
              <div
                key={region}
                className="rounded-xl border border-slate-700/80 bg-slate-800/50 backdrop-blur-sm px-4 py-3 flex items-center gap-2 hover:border-blue-500/40 hover:bg-slate-800/70 transition-all duration-300"
              >
                <MapPin className="w-4 h-4 text-cyan-300" />
                <span>{region}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
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
