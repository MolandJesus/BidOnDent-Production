import { useCallback, type ReactNode } from "react";
import ShopDirectoryMapPane from "./MapLibreShopDirectoryMapPane";
import ShopDirectoryMapOverlays from "./ShopDirectoryMapOverlays";
import NavigationActiveManeuverCard from "../maps/navigation/NavigationActiveManeuverCard";
import NavigationErrorBoundary from "../maps/NavigationErrorBoundary";
import { getDefaultMapCenter } from "../../services/intelligence/shopMapExperience";
import { cn } from "../ui/utils";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { DamageReport } from "../../services/supabase/types";
import type { useShopDirectorySession } from "../../hooks/useShopDirectorySession";
import type { useShopDirectoryNavigation } from "../../hooks/useShopDirectoryNavigation";
import type { useShopDirectoryActions } from "../../hooks/useShopDirectoryActions";

type ShopDirectoryHybridMapSectionProps = {
  isLight: boolean;
  stageSummaryText: string;
  session: ReturnType<typeof useShopDirectorySession>;
  nav: ReturnType<typeof useShopDirectoryNavigation>;
  actions: ReturnType<typeof useShopDirectoryActions>;
  userType: MarketUserType;
  handleSelectShop: (shopId: number | null) => void;
  handleFindShopsNear: (coords: { lat: number; lng: number }) => void;
  onViewReportDetail?: (reportId: string) => void;
  onPlaceBidForShop?: (report: DamageReport) => void;
  onViewBidsForCustomer?: (reportId: string) => void;
  mapReports?: DamageReport[];
  focusReportId?: string;
  deviationPromptNode?: ReactNode;
  isOffRoute: boolean;
};

export default function ShopDirectoryHybridMapSection({
  isLight,
  stageSummaryText,
  session,
  nav,
  actions,
  userType,
  handleSelectShop,
  handleFindShopsNear,
  onViewReportDetail,
  onPlaceBidForShop,
  onViewBidsForCustomer,
  mapReports,
  focusReportId,
  deviationPromptNode,
  isOffRoute,
}: ShopDirectoryHybridMapSectionProps) {
  const panelClassName = isLight
    ? "border-slate-200/78 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(226,232,240,0.76))]"
    : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(9,18,36,0.84),rgba(6,13,26,0.92))]";
  const mutedTextClassName = isLight ? "text-slate-600" : "text-slate-300/80";
  const accentBadgeClassName = isLight
    ? "border-blue-200/80 bg-blue-50 text-blue-700"
    : "border-blue-400/30 bg-blue-500/15 text-blue-200";
  const badgeClassName = isLight
    ? "border-slate-200/80 bg-white/90 text-slate-600"
    : "border-white/[0.10] bg-white/[0.05] text-slate-300";

  const onSwitchToListMode = useCallback(
    () => session.setMapViewMode("list"),
    [session.setMapViewMode]
  );

  const handleViewportChange = useCallback(
    (
      center: { latitude: number; longitude: number },
      zoom: number,
      bounds: { north: number; south: number; east: number; west: number }
    ) => {
      session.setMapCenter((prev) => {
        const changed =
          !prev ||
          Math.abs(prev.latitude - center.latitude) > 0.000001 ||
          Math.abs(prev.longitude - center.longitude) > 0.000001;
        return changed ? center : prev;
      });
      session.setMapZoom((prev) => {
        const changed = typeof prev !== "number" || Math.abs(prev - zoom) > 0.001;
        return changed ? zoom : prev;
      });
      session.setMapViewportBounds((prev) => {
        const changed =
          !prev ||
          Math.abs(prev.north - bounds.north) > 0.000001 ||
          Math.abs(prev.south - bounds.south) > 0.000001 ||
          Math.abs(prev.east - bounds.east) > 0.000001 ||
          Math.abs(prev.west - bounds.west) > 0.000001;
        return changed ? bounds : prev;
      });
    },
    [session.setMapCenter, session.setMapViewportBounds, session.setMapZoom]
  );

  const handleTileDarkChange = useCallback(
    (dark: boolean) => session.setMapTheme(dark ? "dark" : "light"),
    [session.setMapTheme]
  );

  const renderGuidanceOverlay = (containerClassName: string) =>
    nav.liveNavigationActive && nav.routePreview ? (
      <NavigationActiveManeuverCard
        containerClassName={containerClassName}
        followingStep={nav.followingStep}
        nextStep={nav.nextStep}
        tone={session.resolvedMapTheme}
      />
    ) : null;

  return (
    <div
      className={cn(
        "mt-4 overflow-hidden rounded-[1.8rem] border p-2 sm:p-3 lg:p-4",
        panelClassName
      )}
    >
      <div className="h-[420px] overflow-hidden rounded-[1.5rem] sm:h-[520px] xl:h-[640px]">
        <NavigationErrorBoundary>
          <ShopDirectoryMapPane
            overlayDensity="compact"
            initialCenter={session.mapCenter || getDefaultMapCenter()}
            initialZoom={session.mapZoom}
            mapTheme={session.mapTheme}
            onTileDarkChange={handleTileDarkChange}
            onClearAreaSearch={session.handleClearAreaSearch}
            onSearchInArea={session.handleSearchInArea}
            onFindShopsNear={handleFindShopsNear}
            onSelectShop={handleSelectShop}
            onViewDetails={actions.handleViewShopDetails}
            onRequestEstimate={userType === "customer" ? actions.handleRequestEstimate : undefined}
            onViewportChange={handleViewportChange}
            routeOptions={nav.mapRouteOptions}
            savedPlaces={session.savedPlaces}
            preserveViewport={session.searchWithinViewport}
            searchWithinViewport={session.searchWithinViewport}
            selectedOrigin={session.selectedOrigin}
            selectedRouteId={nav.mapSelectedRoute?.id ?? session.selectedRouteId}
            selectedShopId={session.selectedShopId}
            shops={session.mapListings}
            suppressHeader
            onExpandMap={() => session.setMapViewMode("map")}
            onSwitchToListMode={onSwitchToListMode}
            userCoords={nav.shopMapUserCoords}
            userHeadingDegrees={nav.userHeadingDegrees}
            userType={userType}
            followCurrentPosition={nav.liveNavigationActive}
            followCurrentPositionRevision={nav.followCurrentPositionRevision}
            onOpenShopDirections={session.handleOpenShopDirections}
            onStartNavigation={nav.handleStartInAppNavigation}
            navigationSessionDestinationId={nav.navigationSessionDestinationId}
            navigationSessionStatus={nav.navigationSessionStatus}
            directionsActionLabel={session.directionsActionLabel}
            hasArrived={nav.hasArrivedForDestination}
            isLoadingRoute={nav.routePanel.isLoadingRoute}
            remainingDistanceLabel={nav.liveRemainingDistanceLabel}
            remainingEtaLabel={nav.liveRemainingEtaLabel}
            routeError={nav.routePanel.routeError}
            usingLiveRoutes={nav.routePanel.usingLiveRoutes}
            onViewReportDetail={onViewReportDetail}
            onPlaceBid={onPlaceBidForShop}
            onViewBids={onViewBidsForCustomer}
            initialReports={mapReports}
            focusReportId={focusReportId}
            navigationSteps={nav.routeSteps}
            currentStepIndex={nav.currentStepIndex}
            navigationMode={nav.navigationMode}
            isOffRoute={isOffRoute}
          >
            <>
              {renderGuidanceOverlay("top-4 sm:top-5")}
              <ShopDirectoryMapOverlays
                density="compact"
                deviationPrompt={deviationPromptNode}
                directionsLabel={nav.selectedShopNavigationActionLabel}
                intelligenceCallouts={session.roleHighlights.callouts}
                intelligenceTitle={session.roleHighlights.title}
                mapTheme={session.resolvedMapTheme}
                navigationMode={nav.navigationMode}
                onEndNavigation={nav.onEndNavigation}
                onDismissRoutePreview={() => session.setSelectedShopId(null)}
                onPauseNavigation={nav.onPauseNavigation}
                onRecenterNavigation={nav.onRecenterNavigation}
                onResumeNavigation={nav.onResumeNavigation}
                onSelectRoute={session.setSelectedRouteId}
                onStartNavigation={
                  session.selectedShop
                    ? () => nav.handleStartInAppNavigation(session.selectedShop)
                    : undefined
                }
                remainingDistanceLabel={nav.liveRemainingDistanceLabel}
                remainingEtaLabel={nav.liveRemainingEtaLabel}
                routeError={nav.routePanel.routeError}
                routeOptions={nav.mapRouteOptions}
                routeSummary={nav.mapRouteSummary}
                hasArrived={nav.hasArrivedForDestination}
                sessionActiveSeconds={nav.sessionActiveSeconds}
                sessionDestinationId={nav.navigationSessionDestinationId}
                sessionDestinationLabel={nav.sessionDestinationLabel}
                sessionStatus={nav.navigationSessionStatus}
                isLoadingRoute={nav.routePanel.isLoadingRoute}
                selectedOrigin={session.selectedOrigin}
                selectedRoute={nav.mapSelectedRoute}
                selectedShop={session.selectedShop}
                usingLiveRoutes={nav.routePanel.usingLiveRoutes}
                nextInstruction={nav.routePanel.nextInstruction}
                followingInstruction={nav.routePanel.followingInstruction}
                currentSpeedMph={nav.currentSpeedMph}
                gpsStatus={nav.gpsStatus}
                gpsError={nav.gpsError}
                speedLimitMph={nav.speedLimitMph}
                onRetryGps={nav.onRetryGps}
                onRetryRoute={nav.onRetryRoute}
                onViewDetails={actions.handleViewShopDetails}
                onRequestEstimate={
                  userType === "customer" ? actions.handleRequestEstimate : undefined
                }
              />
            </>
          </ShopDirectoryMapPane>
        </NavigationErrorBoundary>
      </div>

      <div
        className={cn(
          "mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between",
          isLight ? "border-slate-200/80" : "border-white/[0.08]"
        )}
      >
        <p className={`max-w-3xl text-sm leading-6 ${mutedTextClassName}`}>{stageSummaryText}</p>
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              "inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold",
              accentBadgeClassName
            )}
          >
            {session.selectedOrigin?.name || "Choose an origin"}
          </span>
          {session.searchWithinViewport ? (
            <span
              className={cn(
                "inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                badgeClassName
              )}
            >
              Area search active
            </span>
          ) : null}
          {session.selectedShop ? (
            <span
              className={cn(
                "inline-flex items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                badgeClassName
              )}
            >
              Focused: {session.selectedShop.name}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
