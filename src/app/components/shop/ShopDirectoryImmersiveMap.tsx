import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowLeft, Layers3, List, MapPin, PanelLeftClose, Search, SunMoon } from "lucide-react";
import ShopDirectoryMapPane from "./MapLibreShopDirectoryMapPane";
import ShopDirectoryMapOverlays from "./ShopDirectoryMapOverlays";
import ShopDirectoryResultCard from "./ShopDirectoryResultCard";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import { getRoleCollectionActionLabels } from "../../services/intelligence/shopMapExperience";
import type {
  Coordinates,
  MapTheme,
  MapViewMode,
  MapViewportBounds,
  Place,
  RouteOption,
  SavedPlace,
} from "../../types/mapDomain";

type ShopDirectoryImmersiveMapProps = {
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
  deviationPrompt?: React.ReactNode;
  navigationMode: "browse" | "route-preview" | "guidance";

  onSearchQueryChange: (query: string) => void;
  onSearchSubmit: (event: FormEvent) => void;
  onSelectShop: (id: number) => void;
  onSelectRoute: (id: string) => void;
  onToggleRoleCollection: (shopId: number) => void;
  onOpenShopDirections: (shop: ShopMapListing) => void;
  onSetMapCenter: (center: Coordinates) => void;
  onSetMapZoom: (zoom: number) => void;
  onSetMapViewportBounds: (bounds: MapViewportBounds) => void;
  onToggleTheme: () => void;
  onSwitchMode: (mode: MapViewMode) => void;
  onBack: () => void;
  userCoords?: Coordinates | null;
};

export default function ShopDirectoryImmersiveMap({
  mapListings,
  routeOptions,
  selectedRoute,
  selectedRouteId,
  selectedShopId,
  selectedShop,
  selectedOrigin,
  savedPlaces,
  routeSummary,
  mapTheme,
  mapCenter,
  mapZoom,
  userType,
  roleHighlights,
  roleCollectionIds,
  primaryColor,
  directionsActionLabel,
  searchQuery,
  deviationPrompt,
  navigationMode,
  onSearchQueryChange,
  onSearchSubmit,
  onSelectShop,
  onSelectRoute,
  onToggleRoleCollection,
  onOpenShopDirections,
  onSetMapCenter,
  onSetMapZoom,
  onSetMapViewportBounds,
  onToggleTheme,
  onSwitchMode,
  onBack,
  userCoords,
}: ShopDirectoryImmersiveMapProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDark = mapTheme === "dark";

  const getDefaultCenter = (): Coordinates => ({ latitude: 40.7128, longitude: -74.006 });

  // Theme-aware top bar tokens
  const topGradient = isDark
    ? "bg-gradient-to-b from-slate-950/60 via-slate-950/20 to-transparent"
    : "bg-gradient-to-b from-black/20 via-black/6 to-transparent";
  const iconBtn = isDark
    ? "border-white/20 bg-slate-950/70 text-white shadow-xl backdrop-blur-md hover:bg-slate-950/85"
    : "border-black/10 bg-white/82 text-slate-800 shadow-xl backdrop-blur-md hover:bg-white/95";
  const searchInput = isDark
    ? "border-white/20 bg-slate-950/70 text-white placeholder:text-white/45 focus:border-blue-400/50 focus:bg-slate-950/80"
    : "border-black/10 bg-white/82 text-slate-800 placeholder:text-slate-400 focus:border-blue-400/40 focus:bg-white/95";
  const listBtnActive = isDark
    ? "border-blue-400/40 bg-blue-600/30 text-white"
    : "border-blue-400/40 bg-blue-100 text-blue-700";
  const listBtnInactive = isDark
    ? "border-white/20 bg-slate-950/70 text-white/80 hover:bg-slate-950/85 hover:text-white"
    : "border-black/10 bg-white/82 text-slate-600 hover:bg-white/95 hover:text-slate-800";
  const drawerBg = isDark
    ? "border-white/10 bg-slate-950/90 backdrop-blur-xl"
    : "border-black/8 bg-white/92 backdrop-blur-xl";
  const drawerDivider = isDark ? "border-white/[0.08]" : "border-black/[0.06]";
  const drawerLabel = isDark ? "text-slate-500" : "text-slate-400";
  const drawerTitle = isDark ? "text-slate-100" : "text-slate-800";
  const drawerClose = isDark
    ? "text-slate-400 hover:bg-white/[0.10] hover:text-slate-200"
    : "text-slate-500 hover:bg-black/[0.06] hover:text-slate-700";

  return (
    <div className={`fixed inset-0 z-[60] ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
      {/* Map — absolute full viewport */}
      <div className="absolute inset-0">
        <ShopDirectoryMapPane
          initialCenter={mapCenter || getDefaultCenter()}
          initialZoom={mapZoom}
          mapTheme={mapTheme}
          onSelectShop={onSelectShop}
          onViewportChange={(center, zoom, bounds) => {
            onSetMapCenter(center);
            onSetMapZoom(zoom);
            onSetMapViewportBounds(bounds);
          }}
          routeOptions={routeOptions}
          savedPlaces={savedPlaces}
          selectedOrigin={selectedOrigin}
          selectedRouteId={selectedRouteId}
          selectedShopId={selectedShopId}
          shops={mapListings}
          suppressHeader
          userCoords={userCoords}
          userType={userType}
          onOpenShopDirections={onOpenShopDirections}
          directionsActionLabel={directionsActionLabel}
        >
          <ShopDirectoryMapOverlays
            deviationPrompt={deviationPrompt}
            directionsLabel={directionsActionLabel}
            intelligenceCallouts={roleHighlights.callouts}
            intelligenceTitle={roleHighlights.title}
            mapTheme={mapTheme}
            navigationMode={navigationMode}
            onSelectRoute={onSelectRoute}
            onStartNavigation={selectedShop ? () => onOpenShopDirections(selectedShop) : undefined}
            routeOptions={routeOptions}
            routeSummary={routeSummary}
            selectedOrigin={selectedOrigin}
            selectedRoute={selectedRoute}
            selectedShop={selectedShop}
            overlayTopClass="top-28"
          />
        </ShopDirectoryMapPane>
      </div>

      {/* Floating top bar */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-[550] ${topGradient} px-3 pb-8 sm:px-4`}
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0.75rem))" }}
      >
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          {/* Back */}
          <button
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${iconBtn}`}
            onClick={onBack}
            type="button"
            aria-label="Back to shop directory"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Map-owned search */}
          <form className="flex-1" onSubmit={onSearchSubmit}>
            <div className="relative max-w-lg">
              <Search
                className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isDark ? "text-white/60" : "text-slate-400"}`}
              />
              <input
                className={`w-full rounded-full border py-2.5 pl-9 pr-4 text-sm shadow-xl outline-none backdrop-blur-md transition-colors ${searchInput}`}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Search shops, programs, specialties..."
                type="text"
                value={searchQuery}
              />
            </div>
          </form>

          {/* Results drawer toggle */}
          <button
            className={`flex h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium shadow-xl backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${drawerOpen ? listBtnActive : listBtnInactive}`}
            onClick={() => setDrawerOpen((v) => !v)}
            type="button"
            aria-expanded={drawerOpen}
            aria-label="Toggle results drawer"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">{mapListings.length}</span>
          </button>

          {/* Mode switches — hidden on small mobile to save space */}
          <button
            className={`hidden sm:flex h-11 items-center gap-2 rounded-full border px-3 text-sm font-medium shadow-xl backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${iconBtn}`}
            onClick={() => onSwitchMode("hybrid")}
            type="button"
            aria-label="Switch to split view"
          >
            <Layers3 className="h-4 w-4" />
            <span className="hidden sm:inline">Split</span>
          </button>

          {/* Theme toggle */}
          <button
            className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-xl backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${iconBtn}`}
            onClick={onToggleTheme}
            type="button"
            aria-label={mapTheme === "light" ? "Switch to dark map" : "Switch to light map"}
          >
            <SunMoon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Collapsible results drawer — bottom sheet on mobile, side drawer on sm+ */}
      {drawerOpen && (
        <aside
          className={`absolute inset-x-0 bottom-0 z-[530] flex max-h-[60vh] flex-col overflow-hidden rounded-t-2xl border-t shadow-2xl sm:inset-x-auto sm:bottom-0 sm:left-0 sm:top-16 sm:max-h-none sm:w-[360px] sm:max-w-[85vw] sm:rounded-t-none sm:rounded-r-2xl sm:border-t-0 sm:border-r ${drawerBg}`}
          role="region"
          aria-label="Shop results"
          onKeyDown={(e) => e.key === "Escape" && setDrawerOpen(false)}
        >
          <div className={`flex items-center justify-between border-b px-4 py-3 ${drawerDivider}`}>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${drawerLabel}`}>
                Results
              </p>
              <p className={`text-lg font-semibold ${drawerTitle}`}>
                {mapListings.length} shop{mapListings.length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${drawerClose}`}
              onClick={() => setDrawerOpen(false)}
              type="button"
              aria-label="Close results drawer"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {mapListings.length === 0 && (
              <div
                className={`rounded-2xl border border-dashed p-4 ${isDark ? "border-blue-300/20 bg-blue-500/[0.04]" : "border-blue-200 bg-blue-50"}`}
              >
                <p
                  className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}
                >
                  No shops matched
                </p>
                <p
                  className={`mt-1 text-xs leading-5 ${isDark ? "text-slate-300/80" : "text-slate-500"}`}
                >
                  Try broadening the search or changing the sort.
                </p>
              </div>
            )}

            {mapListings.map((shop) => {
              const roleAction = getRoleCollectionActionLabels(
                userType,
                roleCollectionIds.includes(shop.id)
              );

              return (
                <ShopDirectoryResultCard
                  compact
                  directionsActionLabel={directionsActionLabel}
                  isSelected={selectedShopId === shop.id}
                  key={shop.id}
                  onDirectionsAction={() => onOpenShopDirections(shop)}
                  onPrimaryAction={() => onToggleRoleCollection(shop.id)}
                  onSecondaryAction={() => onSelectShop(shop.id)}
                  primaryActionLabel={roleAction.primary}
                  primaryColor={primaryColor}
                  secondaryActionLabel={roleHighlights.secondaryActionLabel}
                  shop={shop}
                />
              );
            })}
          </div>
        </aside>
      )}
    </div>
  );
}
