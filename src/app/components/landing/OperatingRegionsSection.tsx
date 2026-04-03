import { MapPin } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useOperatingRegionsCoverage } from "../../hooks/useOperatingRegionsCoverage";
import type { NavigationDiscoveryRole } from "../../services/navigation/placeDiscovery";
import { getMapSurfaceTheme } from "../maps/mapSurfaceTheme";
import type { MapSurfaceTone } from "../maps/serviceCoverageMapTypes";
import ServiceCoverageMap from "../maps/MapLibreServiceCoverageMap";
import { cn } from "../ui/utils";
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
  const stageTheme = getMapSurfaceTheme(inlinePanelTone, true);
  const mapModeLabel =
    coverage.tileMode === "night"
      ? "Night map"
      : coverage.tileMode === "satellite"
        ? "Satellite"
        : "Roadmap";
  const originModeLabel =
    coverage.activeOriginMode === "geolocation"
      ? "Live GPS"
      : coverage.activeOriginMode === "address"
        ? "Manual address"
        : coverage.normalizedZip.length >= 5
          ? "ZIP search"
          : "Regional overview";

  return (
    <section
      id="coverage"
      className={`relative overflow-hidden pt-8 pb-8 sm:pt-10 sm:pb-9 lg:pb-10 ${isLightAppearance ? "text-slate-800" : "text-white"}`}
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
      {isLightAppearance ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(59,130,246,0.06),transparent_60%)]" />
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-400/[0.05] rounded-full blur-[120px]" />
          <div className="absolute bottom-10 left-[15%] w-64 h-64 bg-indigo-300/[0.04] rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_2px_at_20px_20px,rgba(59,130,246,0.04)_1px,transparent_0)] bg-[length:40px_40px] opacity-40" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_59px,rgba(59,130,246,0.04)_59px,rgba(59,130,246,0.04)_60px),repeating-linear-gradient(90deg,transparent,transparent_79px,rgba(59,130,246,0.025)_79px,rgba(59,130,246,0.025)_80px)] opacity-45" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(37,99,235,0.10),transparent_55%)]" />
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-500/[0.08] rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-[10%] w-72 h-72 bg-blue-400/[0.06] rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/[0.04] rounded-full blur-[140px]" />
        </>
      )}
      <div className="container mx-auto max-w-7xl px-4 relative">
        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="mx-auto max-w-2xl text-center">
            <p
              className={`mb-2 text-xs uppercase tracking-[0.18em] ${isLightAppearance ? "text-blue-600/80" : "text-blue-200/80"}`}
            >
              Live Coverage
            </p>
            <h3
              className={`text-[2rem] font-bold tracking-tight sm:text-[2.35rem] ${isLightAppearance ? "text-slate-800" : "bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent"}`}
            >
              Search partner coverage near you
            </h3>
            <p
              className={`mt-2.5 text-sm leading-6 sm:text-[15px] ${isLightAppearance ? "text-slate-600" : "text-blue-100/72"}`}
            >
              Enter a ZIP, address, or live location to focus the map, then compare the strongest
              nearby repair options below.
            </p>
          </div>

          <div className="mx-auto mt-6 max-w-[1080px]">
            <div
              className={cn(
                "relative overflow-hidden rounded-[2rem] p-2.5 sm:p-3.5 lg:p-4",
                stageTheme.shellClassName
              )}
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 opacity-75",
                  stageTheme.ambientOverlayClassName
                )}
              />

              <div className="relative z-10">
                <div className={cn("rounded-[1.7rem] border p-4 sm:p-5", stageTheme.panelStrongClassName)}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                      <span className={stageTheme.eyebrowClassName}>Coverage map</span>
                      <h4
                        className={cn(
                          "mt-2 text-xl font-semibold tracking-tight sm:text-[1.7rem]",
                          stageTheme.titleClassName
                        )}
                      >
                        Keep search controls and the live map in one compact workspace.
                      </h4>
                      <p className={cn("mt-2 text-sm leading-6", stageTheme.secondaryTextClassName)}>
                        Focus the map fast, scan the strongest nearby shops below, and open the full
                        browse view only when you need more room.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-start content-start self-start gap-2 lg:max-w-[18rem] lg:justify-end">
                      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", stageTheme.softBadgeClassName)}>
                        {coverage.nearbyShops.length} recommended
                      </span>
                      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", stageTheme.softBadgeClassName)}>
                        {mapModeLabel}
                      </span>
                      <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", stageTheme.softBadgeClassName)}>
                        {originModeLabel}
                      </span>
                    </div>
                  </div>

                  <div className="relative mt-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      <span className={cn("shrink-0 text-[11px] font-semibold uppercase tracking-[0.2em]", stageTheme.secondaryTextClassName)}>
                        Coverage regions
                      </span>
                      {operatingRegions.map((region) => (
                        <span
                          key={region}
                          className={cn(
                            "shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
                            isLightAppearance
                              ? "border-blue-200/60 bg-blue-50 text-blue-700"
                              : "border-blue-400/30 bg-blue-500/12 text-blue-100/90"
                          )}
                        >
                          <MapPin className="h-3 w-3 text-blue-400/60" />
                          {region.replace(" County", "")}
                        </span>
                      ))}
                    </div>
                    <div
                      className={`pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:hidden ${
                        isLightAppearance
                          ? "bg-gradient-to-l from-[#eef3f8] to-transparent"
                          : "bg-gradient-to-l from-[#091a30] to-transparent"
                      }`}
                    />
                  </div>

                  <CoverageSearchPanel
                    className="mt-4"
                    tone={inlinePanelTone}
                    searchQuery={coverage.searchQuery}
                    zipCode={coverage.zipCode}
                    radiusMiles={coverage.radiusMiles}
                    normalizedZip={coverage.normalizedZip}
                    hasCoverageSignal={coverage.hasCoverageSignal}
                    coverageCounty={coverage.coverageCounty}
                    activeOriginMode={coverage.activeOriginMode}
                    activeOriginLabel={coverage.activeOriginLabel}
                    geoMessage={coverage.geoMessage}
                    isFindingLocation={coverage.isFindingLocation}
                    isSearchingAddresses={coverage.isSearchingAddresses}
                    canCenterMap={Boolean(coverage.mapFocusTarget)}
                    locationError={coverage.locationError}
                    locationPermissionState={coverage.locationPermissionState}
                    addressSuggestions={coverage.addressSuggestions}
                    addressResults={coverage.addressResults}
                    addressError={coverage.addressError}
                    onZipCodeChange={coverage.handleZipCodeChange}
                    onSearchSubmit={coverage.handleSearchSubmit}
                    onChooseAddressResult={coverage.handleChooseAddressResult}
                    onClearAddressResult={coverage.handleClearAddressResult}
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
                  <div className={cn("mt-4 overflow-hidden rounded-[1.5rem] border p-2 sm:p-2.5 lg:p-3", stageTheme.panelClassName)}>
                    <ServiceCoverageMap
                      className="rounded-[1.25rem]"
                      mapHeightClassName="h-[300px] sm:h-[380px] lg:h-[460px]"
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
                      showSurfaceChrome={false}
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

                    <div className="mt-3 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className={cn("text-xs leading-5 sm:text-sm sm:leading-6", stageTheme.secondaryTextClassName)}>
                        Tap any highlighted marker to focus a shop, then open the full map when you
                        want the immersive browse view.
                      </p>
                      <div className="flex flex-wrap items-start content-start self-start gap-2">
                        {coverage.selectedShop ? (
                          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", stageTheme.badgeClassName)}>
                            Focused shop: {coverage.selectedShop.name}
                          </span>
                        ) : null}
                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", stageTheme.softBadgeClassName)}>
                          {coverage.activeOriginLabel || "Regional overview"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-4 max-w-[1080px]">
            <CoverageNearestShops
              tone={inlinePanelTone}
              variant="landing-showcase"
              selectedShopName={coverage.selectedShop?.name || null}
              isLoadingShops={coverage.isLoadingShops}
              fetchError={coverage.coverageFetchError}
              usingDemoFallback={coverage.usingDemoFallback}
              activeSearchTarget={coverage.listSearchTarget}
              nearbyShops={coverage.nearbyShops}
              radiusMiles={coverage.radiusMiles}
              selectedShopId={coverage.selectedShopId}
              onSelectShop={(shop) => coverage.handleSelectShop(shop, { centerMap: true })}
              onOpenDirections={coverage.handleOpenBidOnDentNavigation}
              onRetryShops={coverage.retryCoveragePartnerShops}
            />
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
        coverageFetchError={coverage.coverageFetchError}
        usingDemoFallback={coverage.usingDemoFallback}
        selectedShopId={coverage.selectedShopId}
        initialDiscoveryRole={initialDiscoveryRole}
        preferredNavigationProvider={coverage.preferredNavigationProvider}
        selectedShop={coverage.selectedShop}
        navigationSession={coverage.navigationSession}
        startNavigationRequestId={coverage.navigationStartRequestId}
        navigation={coverage.navigation}
        onTileModeChange={coverage.setTileMode}
        onCenterActive={() => coverage.centerOnTarget(coverage.mapFocusTarget)}
        onResetView={coverage.resetOverviewMap}
        onSelectShop={(shop) => coverage.handleSelectShop(shop, { centerMap: true })}
        onPreferredNavigationProviderChange={coverage.setPreferredNavigationProvider}
        onOpenBidOnDentNavigation={coverage.handleOpenBidOnDentNavigation}
        onExportDirections={coverage.handleOpenDirections}
        onVoiceGuidanceEnabledChange={coverage.setVoiceGuidanceEnabled}
        onRetryPartnerShops={coverage.retryCoveragePartnerShops}
      />
    </section>
  );
}
