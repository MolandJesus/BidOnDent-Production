import { type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import ShopDirectoryListBody from "./ShopDirectoryListBody";
import ShopDirectoryHero from "./ShopDirectoryHero";
import ShopDirectorySearchPanel from "./ShopDirectorySearchPanel";
import ShopDirectorySheets from "./ShopDirectorySheets";
import ShopDirectoryHybridHeader from "./ShopDirectoryHybridHeader";
import ShopDirectoryHybridMapSection from "./ShopDirectoryHybridMapSection";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport } from "../../types";
import { cn } from "../ui/utils";

import type { useShopDirectorySession } from "../../hooks/useShopDirectorySession";
import type { useShopDirectoryNavigation } from "../../hooks/useShopDirectoryNavigation";
import type { useShopDirectoryActions } from "../../hooks/useShopDirectoryActions";

type ShopDirectoryHybridStageProps = {
  appearanceMode: DashboardAppearanceMode;
  identity?: WebsiteIdentity | null;
  userType: MarketUserType;
  primaryColor: string;
  secondaryColor: string;
  session: ReturnType<typeof useShopDirectorySession>;
  nav: ReturnType<typeof useShopDirectoryNavigation>;
  actions: ReturnType<typeof useShopDirectoryActions>;
  onBack: () => void;
  onOpenRelatedScreen?: () => void;
  onViewReportDetail?: (reportId: string) => void;
  mapReports?: DamageReport[];
  focusReportId?: string;
  // Pre-computed props passed from parent
  RoleIcon: React.ElementType;
  accentClasses: string;
  compactCards: boolean;
  handleSelectShop: (shopId: number | null) => void;
  handleToggleSaveShop: (shop: ShopMapListing) => void;
  isDetailShopSaved: boolean;
  onPlaceBidForShop?: (report: DamageReport) => void;
  onViewBidsForCustomer?: (reportId: string) => void;
  handleFindShopsNear: (coords: { lat: number; lng: number }) => void;
  deviationPromptNode?: ReactNode;
  isOffRoute: boolean;
};

export default function ShopDirectoryHybridStage({
  appearanceMode,
  identity,
  userType,
  primaryColor,
  secondaryColor,
  session,
  nav,
  actions,
  onBack,
  onOpenRelatedScreen,
  onViewReportDetail,
  mapReports,
  focusReportId,
  RoleIcon,
  accentClasses,
  compactCards,
  handleSelectShop,
  handleToggleSaveShop,
  isDetailShopSaved,
  onPlaceBidForShop,
  onViewBidsForCustomer,
  handleFindShopsNear,
  deviationPromptNode,
  isOffRoute,
}: ShopDirectoryHybridStageProps) {
  const isLight = appearanceMode === "light";
  const stageRoleLabel =
    userType === "shop"
      ? "Market watch"
      : userType === "insurer"
        ? "Partner scouting"
        : "Repair routing";

  const sortLabel =
    session.sortBy === "rating"
      ? "Highest Rated"
      : session.sortBy === "reviews"
        ? "Most Reviews"
        : session.sortBy === "distance"
          ? "Nearest"
          : "Smart Match";
  const mapToneLabel =
    session.mapTheme === "light"
      ? "Light tiles"
      : session.mapTheme === "dark"
        ? "Dark tiles"
        : "Auto tiles";

  const stageShellClassName = isLight
    ? "border-slate-200/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(226,232,240,0.74))] shadow-[0_30px_86px_rgba(15,23,42,0.12)]"
    : "border-blue-300/14 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.2),rgba(8,16,32,0.92)_34%,rgba(2,6,23,0.98)_100%)] shadow-[0_34px_90px_rgba(2,6,23,0.42)]";
  const stagePanelClassName = isLight
    ? "border-slate-200/78 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(226,232,240,0.76))]"
    : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(9,18,36,0.84),rgba(6,13,26,0.92))]";
  const stageSummaryText = session.selectedShop
    ? `Focused on ${session.selectedShop.name}. The map stays live while the strongest recommended shops stay below for easy comparison.`
    : session.selectedOrigin
      ? `Showing live recommendations near ${session.selectedOrigin.name}. Pan, refine filters, or search again to update the map and result set together.`
      : "Set an address, ZIP, or live location to tighten distance-aware recommendations and routing quality.";

  return (
    <div className="space-y-5 pb-[calc(env(safe-area-inset-bottom)+6.5rem)] sm:pb-6">
      <ShopDirectoryHero
        appearanceMode={appearanceMode}
        RoleIcon={RoleIcon}
        accentClasses={accentClasses}
        connectedCarrierNames={session.connectedCarrierNames}
        contextChips={session.contextChips}
        identity={identity}
        mapListingsCount={session.mapListings.length}
        onBack={onBack}
        onToggleIntelligence={() => session.setSessionIntelligenceOpen((c) => !c)}
        roleHighlights={session.roleHighlights}
        sessionIntelligenceOpen={session.sessionIntelligenceOpen}
        showMapPane={true}
        summary={session.summary}
      />

      {session.usingDemoFallback && (
        <div
          className={`mx-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
            isLight
              ? "border-amber-300/60 bg-amber-50 text-amber-700"
              : "border-amber-400/30 bg-amber-400/10 text-amber-300"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Showing example shop locations. Verified partner shops will appear once your account is
            connected.
          </span>
        </div>
      )}

      {!session.usingDemoFallback && session.coverageFetchError && (
        <div
          className={`mx-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
            isLight
              ? "border-rose-300/60 bg-rose-50 text-rose-700"
              : "border-rose-400/30 bg-rose-400/10 text-rose-200"
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            Live partner-shop data is temporarily unavailable. Check network or backend status and
            retry.
          </span>
        </div>
      )}

      <section className="mx-4">
        <div
          className={cn(
            "mx-auto max-w-[1480px] overflow-hidden rounded-[2rem] border p-3 sm:p-4",
            stageShellClassName
          )}
        >
          <div className={cn("rounded-[1.8rem] border p-4 sm:p-5", stagePanelClassName)}>
            <ShopDirectoryHybridHeader
              isLight={isLight}
              stageRoleLabel={stageRoleLabel}
              sortLabel={sortLabel}
              mapToneLabel={mapToneLabel}
              shopCount={session.mapListings.length}
            />

            <ShopDirectorySearchPanel
              className="mt-4"
              variant="stage"
              appearanceMode={appearanceMode}
              RoleIcon={RoleIcon}
              currentOriginIsSaved={session.currentOriginIsSaved}
              filterRating={session.filterRating}
              isLocating={session.userGeolocation.isLocating}
              isSearchingOrigins={session.isSearchingOrigins}
              locationError={session.userGeolocation.error}
              mapTheme={session.mapTheme}
              mapViewMode={session.mapViewMode}
              onClearAreaSearch={session.handleClearAreaSearch}
              onClearOrigin={session.handleClearOrigin}
              onFilterRatingChange={session.setFilterRating}
              onOriginSearchQueryChange={session.handleOriginSearchQueryChange}
              onOpenRelatedScreen={onOpenRelatedScreen}
              onSearchOrigin={session.handleSearchOrigin}
              onSaveOrigin={session.handleSaveOrigin}
              onSearchQueryChange={session.setSearchQuery}
              onSearchSubmit={session.handleSearchSubmit}
              onSelectOrigin={session.handleSelectOrigin}
              onSelectOriginSearchResult={session.handleSelectOriginSearchResult}
              onSelectOriginSuggestion={session.handleSelectOriginSuggestion}
              onSortChange={session.setSortBy}
              onToggleTheme={session.handleToggleTheme}
              onUseMyLocation={session.handleUseMyLocation}
              onViewModeChange={session.setMapViewMode}
              originSearchError={session.originSearchError}
              originSearchQuery={session.originSearchQuery}
              originSearchResults={session.originSearchResults}
              originSuggestions={session.originSuggestions}
              primaryColor={primaryColor}
              roleCollectionListings={session.roleCollectionListings}
              roleHighlights={session.roleHighlights}
              savedPlaces={session.savedPlaces}
              searchQuery={session.searchQuery}
              searchWithinViewport={session.searchWithinViewport}
              secondaryColor={secondaryColor}
              selectedOrigin={session.selectedOrigin}
              showMapPane={true}
              sortBy={session.sortBy}
              suggestedOrigins={session.suggestedOrigins}
              userType={userType}
            />

            <ShopDirectoryHybridMapSection
              isLight={isLight}
              stageSummaryText={stageSummaryText}
              session={session}
              nav={nav}
              actions={actions}
              userType={userType}
              handleSelectShop={handleSelectShop}
              handleFindShopsNear={handleFindShopsNear}
              onViewReportDetail={onViewReportDetail}
              onPlaceBidForShop={onPlaceBidForShop}
              onViewBidsForCustomer={onViewBidsForCustomer}
              mapReports={mapReports}
              focusReportId={focusReportId}
              deviationPromptNode={deviationPromptNode}
              isOffRoute={isOffRoute}
            />
          </div>
        </div>
      </section>

      <section className="mx-4">
        <div className="mx-auto max-w-[1480px]">
          <ShopDirectoryListBody
            appearanceMode={appearanceMode}
            variant="showcase"
            onStartNavigation={nav.handleStartInAppNavigation}
            onViewDetails={actions.handleViewShopDetails}
            onRequestEstimate={userType === "customer" ? actions.handleRequestEstimate : undefined}
            navigationSessionDestinationId={nav.navigationSessionDestinationId}
            navigationSessionStatus={nav.navigationSessionStatus}
            routePanel={nav.routePanel}
            session={session}
            userType={userType}
            primaryColor={primaryColor}
            compactCards={compactCards}
          />
        </div>
      </section>

      <ShopDirectorySheets
        actions={actions}
        isDark={appearanceMode !== "light"}
        isDetailShopSaved={isDetailShopSaved}
        onGetDirections={session.handleOpenShopDirections}
        onRequestEstimate={userType === "customer" ? actions.handleRequestEstimate : undefined}
        onToggleSave={handleToggleSaveShop}
      />
    </div>
  );
}
