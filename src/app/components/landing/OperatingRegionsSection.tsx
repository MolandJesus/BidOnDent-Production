import { useEffect } from "react";
import { MapPin } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useParallaxOffset } from "../../hooks/useParallaxOffset";
import { useMediaQuery } from "../../hooks/useMediaQuery";
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
  const coverage = useOperatingRegionsCoverage({ isLightAppearance });
  const isMobile = useMediaQuery("(max-width: 767px)");
  const parallaxY = useParallaxOffset(isMobile ? 0.06 : 0.12);

  // Cross-component opener: hero map double-taps dispatch this event so the
  // landing dialog state stays owned here (where the coverage hook lives) but
  // can be triggered from the hero without prop-drilling the setter.
  useEffect(() => {
    const open = () => coverage.setIsMapExpanded(true);
    window.addEventListener("bd:open-landing-coverage-map", open);
    return () => window.removeEventListener("bd:open-landing-coverage-map", open);
  }, [coverage]);

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
          ? { background: "linear-gradient(180deg, #f2f5f9 0%, #edf1f7 50%, #e8ecf2 100%)" }
          : { background: "linear-gradient(180deg, #071830 0%, #0a2038 50%, #06142a 100%)" }
      }
      ref={sectionRef}
    >
      {/* Smooth transition edges — top/bottom gradient fades */}
      {/* Pass 10 — atmospheric bloom-bridge at TrustStats→Coverage cool transition.
          Replaces the previous transparent-to-transparent placeholder strip with a
          subtle cool-blue luminance so the warm→cool register shift reads as a
          lighting change, not a hard cut. */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(96,165,250,0.10), transparent 70%)"
            : "radial-gradient(ellipse 90% 100% at 50% 0%, rgba(59,130,246,0.14), transparent 70%)",
        }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: isLightAppearance
            ? "linear-gradient(to right, transparent, rgba(96, 165, 250, 0.22) 50%, transparent)"
            : "linear-gradient(to right, transparent, rgba(220, 150, 60, 0.28) 22%, rgba(96, 165, 250, 0.30) 50%, rgba(220, 150, 60, 0.28) 78%, transparent)",
        }}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-blue-400/8" : "via-blue-400/15"} to-transparent`}
      />
      {/* Pass D — Liquid Map Intelligence ambient marketplace energy.
          Slow gold drift sits behind everything; reads as ambient activity,
          never as decoration. Uses existing bd-liquid-gold-flow tokens. */}
      <div
        aria-hidden="true"
        className={`bd-liquid-gold-flow ${isLightAppearance ? "bd-liquid-gold-flow--light" : "bd-liquid-gold-flow--dark"} pointer-events-none`}
        style={{ opacity: isLightAppearance ? 0.55 : 0.7 }}
      />
      {/* Atmospheric depth — topographic contour feel, wrapped in bloom for scroll entry */}
      <div className={`bd-bloom-atmosphere ${isVisible ? "is-visible" : "is-hidden"}`}>
        {/* Pass 6 — Automotive identity: concentric topographic rings behind the map.
            Reads as topographic / radar / map character. Centered, low opacity. */}
        <svg
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          width="900"
          height="900"
          viewBox="0 0 900 900"
          style={{ opacity: isLightAppearance ? 0.06 : 0.08 }}
          fill="none"
          stroke={isLightAppearance ? "#1e3a8a" : "#60a5fa"}
          strokeWidth="1"
        >
          <circle cx="450" cy="450" r="120" />
          <circle cx="450" cy="450" r="200" />
          <circle cx="450" cy="450" r="290" />
          <circle cx="450" cy="450" r="380" strokeDasharray="3 6" />
          <circle cx="450" cy="450" r="430" strokeDasharray="2 8" opacity="0.7" />
        </svg>
        {isLightAppearance ? (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(59,130,246,0.14),transparent_60%)]" />
            <div
              className="absolute top-0 right-1/4 w-80 h-80 bg-blue-400/[0.14] rounded-full blur-[120px]"
              style={{ transform: `translateY(${parallaxY}px)`, willChange: "transform" }}
            />
            <div
              className="absolute bottom-10 left-[15%] w-64 h-64 bg-indigo-300/[0.12] rounded-full blur-[100px]"
              style={{ transform: `translateY(${parallaxY * -0.6}px)`, willChange: "transform" }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_2px_at_20px_20px,rgba(59,130,246,0.07)_1px,transparent_0)] bg-[length:40px_40px] opacity-80" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_59px,rgba(59,130,246,0.07)_59px,rgba(59,130,246,0.07)_60px),repeating-linear-gradient(90deg,transparent,transparent_79px,rgba(59,130,246,0.05)_79px,rgba(59,130,246,0.05)_80px)] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(37,99,235,0.18),transparent_55%)]" />
            <div
              className="absolute top-0 right-1/3 w-96 h-96 bg-blue-500/[0.18] rounded-full blur-3xl"
              style={{ transform: `translateY(${parallaxY}px)`, willChange: "transform" }}
            />
            <div
              className="absolute bottom-10 left-[10%] w-72 h-72 bg-blue-400/[0.14] rounded-full blur-[120px]"
              style={{ transform: `translateY(${parallaxY * -0.6}px)`, willChange: "transform" }}
            />
            <div
              className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/[0.12] rounded-full blur-[140px]"
              style={{
                transform: `translate(-50%, calc(-50% + ${parallaxY * 0.4}px))`,
                willChange: "transform",
              }}
            />
          </>
        )}
      </div>
      <div className="container mx-auto max-w-7xl px-4 relative">
        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center mb-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                  isLightAppearance
                    ? "border-blue-200/70 bg-blue-50/80 text-blue-700 shadow-[0_2px_8px_rgba(59,130,246,0.10)]"
                    : "border-blue-400/30 bg-blue-500/12 text-blue-200"
                }`}
              >
                <span className="inline-flex h-3 w-3 items-center justify-center">
                  <MapPin className="h-3 w-3" />
                </span>
                Coverage Map
              </span>
            </div>
            <h3
              className={`text-[2.1rem] font-bold tracking-tight sm:text-[2.6rem] lg:text-[2.9rem] leading-[1.12] ${
                isLightAppearance
                  ? "text-slate-900"
                  : "bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent"
              }`}
            >
              Browse our NY service area,
              <br className="hidden sm:block" /> right on the map.
            </h3>
            <p
              className={`mt-3 text-sm leading-6 sm:text-[15px] max-w-xl mx-auto ${
                isLightAppearance ? "text-slate-500" : "text-blue-100/70"
              }`}
            >
              Enter a ZIP, address, or tap your location — the map focuses on our New York service
              region and lists any partner shops as they come online.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-[1100px]">
            <div
              className={cn(
                "relative overflow-hidden rounded-[2.2rem] p-3 sm:p-4 lg:p-5",
                stageTheme.shellClassName
              )}
              style={
                isLightAppearance
                  ? {
                      backgroundColor: "#e8eef7",
                      boxShadow:
                        "0 32px_80px_rgba(15,23,42,0.14), 0 10px 30px rgba(59,130,246,0.08), 0 0 0 1px rgba(147,197,253,0.30)",
                    }
                  : {
                      backgroundColor: "#071830",
                      boxShadow:
                        "0 36px 90px rgba(2,6,23,0.50), 0 12px 32px rgba(37,99,235,0.12)",
                    }
              }
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 opacity-75",
                  stageTheme.ambientOverlayClassName
                )}
              />

              <div className="relative z-10">
                <div
                  className={cn(
                    "rounded-[1.9rem] border p-5 sm:p-6",
                    stageTheme.panelStrongClassName
                  )}
                  style={
                    isLightAppearance
                      ? {
                          boxShadow:
                            "0 18px 48px rgba(15,23,42,0.09), 0 3px 10px rgba(59,130,246,0.05)",
                        }
                      : undefined
                  }
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                      <span className={stageTheme.eyebrowClassName}>Coverage map</span>
                      <h4
                        className={cn(
                          "mt-2 text-xl font-semibold tracking-tight sm:text-[1.7rem]",
                          stageTheme.titleClassName
                        )}
                      >
                        Search NY coverage and partner shops.
                      </h4>
                      <p
                        className={cn("mt-2 text-sm leading-6", stageTheme.secondaryTextClassName)}
                      >
                        Focus the map on a NY ZIP, address, or live location — partner shops will
                        list below as they come online in our service counties.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-start content-start self-start gap-2 lg:max-w-[18rem] lg:justify-end">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          stageTheme.softBadgeClassName
                        )}
                      >
                        {coverage.nearbyShops.length > 0
                          ? `${coverage.nearbyShops.length} recommended`
                          : "Set an origin to see shops"}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          stageTheme.softBadgeClassName
                        )}
                      >
                        {mapModeLabel}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          stageTheme.softBadgeClassName
                        )}
                      >
                        {originModeLabel}
                      </span>
                    </div>
                  </div>

                  <div className="relative mt-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      <span
                        className={cn(
                          "shrink-0 text-[11px] font-semibold uppercase tracking-[0.2em]",
                          stageTheme.secondaryTextClassName
                        )}
                      >
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
                    {/* V1 mobile fix: fade colors aligned with the actual card
                         background (#e8eef7 light / #071830 dark) so the row
                         end reads as a clean scroll affordance instead of a
                         color step. Champagne hairline added to read as
                         premium light catching the glass edge. */}
                    <div
                      className={`pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:hidden ${
                        isLightAppearance
                          ? "bg-gradient-to-l from-[#e8eef7] via-[#e8eef7]/85 to-transparent"
                          : "bg-gradient-to-l from-[#071830] via-[#071830]/85 to-transparent"
                      }`}
                      style={{
                        boxShadow: isLightAppearance
                          ? "inset 1px 0 0 rgba(220,165,90,0.18)"
                          : "inset 1px 0 0 rgba(220,165,90,0.22)",
                      }}
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
                    isOutsideServiceRegion={coverage.isOutsideServiceRegion}
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
                  />
                  <div
                    className={cn(
                      "mt-4 overflow-hidden rounded-[1.5rem] border p-2 sm:p-2.5 lg:p-3",
                      stageTheme.panelClassName
                    )}
                  >
                    <ServiceCoverageMap
                      className="rounded-[1.25rem]"
                      mapHeightClassName="h-[380px] sm:h-[500px] lg:h-[580px]"
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
                      postedSpeedLimitMph={
                        coverage.navigation.speedLimitSnapshot?.speedLimitMph ?? null
                      }
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

                    <div className="mt-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
                      <p
                        className={cn(
                          "text-xs leading-5 sm:text-sm sm:leading-6",
                          stageTheme.secondaryTextClassName
                        )}
                      >
                        Tap any pin to preview a shop — or open the full map for the immersive
                        browse experience.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {coverage.selectedShop ? (
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 text-[11px] font-semibold",
                              stageTheme.badgeClassName
                            )}
                          >
                            {coverage.selectedShop.name}
                          </span>
                        ) : null}
                        <button
                          onClick={() => coverage.setIsMapExpanded(true)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[12px] font-semibold transition-all hover:-translate-y-0.5 active:scale-[0.97]",
                            isLightAppearance
                              ? "border-blue-300/50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-[0_6px_20px_rgba(37,99,235,0.32)] hover:shadow-[0_10px_28px_rgba(37,99,235,0.42)]"
                              : "border-blue-300/30 bg-blue-300 text-slate-950 shadow-[0_6px_18px_rgba(59,130,246,0.24)] hover:bg-blue-200"
                          )}
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          Open Full Map
                        </button>
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
              isOutsideServiceArea={coverage.isOutsideServiceRegion}
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
        onSearchSubmit={coverage.handleSearchSubmit}
        onCenterActive={() => coverage.centerOnTarget(coverage.mapFocusTarget)}
        onResetView={coverage.resetOverviewMap}
        onSelectShop={(shop) => coverage.handleSelectShop(shop, { centerMap: true })}
        onPreferredNavigationProviderChange={coverage.setPreferredNavigationProvider}
        onOpenBidOnDentNavigation={coverage.handleOpenBidOnDentNavigation}
        onExportDirections={coverage.handleOpenDirections}
        onVoiceGuidanceEnabledChange={coverage.setVoiceGuidanceEnabled}
        onRetryPartnerShops={coverage.retryCoveragePartnerShops}
      />
      {/* Bottom transition — blends into Business Inquiry section */}
      {isLightAppearance && (
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10 bg-gradient-to-b from-transparent to-[#f5f7fb]" />
      )}
    </section>
  );
}
