import { MapPin } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useOperatingRegionsCoverage } from "../../hooks/useOperatingRegionsCoverage";
import type { NavigationDiscoveryRole } from "../../services/navigation/placeDiscovery";
import type { MapSurfaceTone } from "../maps/serviceCoverageMapTypes";
import ServiceCoverageMap from "../maps/ServiceCoverageMap";
import CoverageMapDialog from "./CoverageMapDialog";
import CoverageNearestShops from "./CoverageNearestShops";
import CoverageSearchPanel from "./CoverageSearchPanel";
import { operatingRegions } from "./coverageData";

type OperatingRegionsSectionProps = {
  initialDiscoveryRole?: NavigationDiscoveryRole;
  isLightAppearance?: boolean;
};

export default function OperatingRegionsSection({
  initialDiscoveryRole,
  isLightAppearance = false,
}: OperatingRegionsSectionProps) {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
  const coverage = useOperatingRegionsCoverage();

  // In light appearance mode, force panel tone to "light" regardless of tile mode
  const inlinePanelTone: MapSurfaceTone = isLightAppearance ? "light" : coverage.surfaceTone;

  return (
    <section
      id="coverage"
      className={`py-12 sm:py-16 relative overflow-hidden ${isLightAppearance ? "text-slate-800" : "text-white"}`}
      style={
        isLightAppearance
          ? { background: "linear-gradient(180deg, #f0f4f8 0%, #e8edf4 50%, #dfe6ef 100%)" }
          : { background: "linear-gradient(180deg, #071830 0%, #0a2038 50%, #06142a 100%)" }
      }
      ref={sectionRef}
    >
      {/* Smooth transition edges — top/bottom gradient fades */}
      <div
        className={`absolute top-0 left-0 right-0 h-16 pointer-events-none z-10 ${isLightAppearance ? "bg-gradient-to-b from-[#f0f4f8]/0 to-transparent" : "bg-gradient-to-b from-[#0a1628]/0 to-transparent"}`}
      />
      <div
        className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-blue-400/10" : "via-blue-400/20"} to-transparent`}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-blue-400/8" : "via-blue-400/15"} to-transparent`}
      />
      {/* Atmospheric depth — topographic contour feel */}
      {!isLightAppearance && (
        <>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_59px,rgba(59,130,246,0.02)_59px,rgba(59,130,246,0.02)_60px),repeating-linear-gradient(90deg,transparent,transparent_79px,rgba(59,130,246,0.015)_79px,rgba(59,130,246,0.015)_80px)] opacity-35" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(37,99,235,0.05),transparent_55%)]" />
          <div className="absolute top-0 right-1/3 w-72 h-72 bg-blue-500/[0.06] rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-[10%] w-56 h-56 bg-blue-400/[0.04] rounded-full blur-[100px]" />
        </>
      )}
      <div className="container mx-auto px-4 max-w-6xl relative">
        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p
                className={`uppercase tracking-[0.12em] text-sm mb-2 ${isLightAppearance ? "text-blue-600/80" : "text-blue-200/80"}`}
              >
                Find a Shop
              </p>
              <h3
                className={`text-2xl sm:text-3xl font-bold ${isLightAppearance ? "text-slate-800" : "bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent"}`}
              >
                Search coverage near you
              </h3>
            </div>
          </div>

          {/* Search-first: CoverageSearchPanel leads */}
          <div className="mt-4 sm:mt-6">
            <CoverageSearchPanel
              tone={inlinePanelTone}
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
              <span
                className={`shrink-0 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] ${isLightAppearance ? "text-slate-500" : "text-blue-200/75"}`}
              >
                Active:
              </span>
              {operatingRegions.map((region) => (
                <span
                  key={region}
                  className={`shrink-0 inline-flex items-center gap-1 sm:gap-1.5 rounded-full border px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium ${
                    isLightAppearance
                      ? "border-blue-200/60 bg-blue-50 text-blue-700"
                      : "border-blue-400/30 bg-blue-500/12 text-blue-100/90"
                  }`}
                >
                  <MapPin className="w-3 h-3 text-blue-400/60" />
                  {region.replace(" County", "")}
                </span>
              ))}
            </div>

            <ServiceCoverageMap
              className="mt-3 sm:mt-4"
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

            <div className="mt-3 sm:mt-4">
              <CoverageNearestShops
                tone={inlinePanelTone}
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
