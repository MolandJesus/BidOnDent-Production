import type { FormEvent } from "react";
import { useState } from "react";
import { ArrowLeft, Layers3, List, MapPin, PanelLeftClose, Search, SunMoon } from "lucide-react";
import ShopDirectoryMapPane from "./ShopDirectoryMapPane";
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
  onToggleTheme: () => void;
  onSwitchMode: (mode: MapViewMode) => void;
  onBack: () => void;
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
  onToggleTheme,
  onSwitchMode,
  onBack,
}: ShopDirectoryImmersiveMapProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getDefaultCenter = (): Coordinates => ({ latitude: 32.7767, longitude: -96.797 });

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950">
      {/* Map — absolute full viewport */}
      <div className="absolute inset-0">
        <ShopDirectoryMapPane
          initialCenter={mapCenter || getDefaultCenter()}
          initialZoom={mapZoom}
          mapTheme={mapTheme}
          onSelectShop={onSelectShop}
          onViewportChange={(center, zoom) => {
            onSetMapCenter(center);
            onSetMapZoom(zoom);
          }}
          routeOptions={routeOptions}
          savedPlaces={savedPlaces}
          selectedOrigin={selectedOrigin}
          selectedRouteId={selectedRouteId}
          selectedShopId={selectedShopId}
          shops={mapListings}
          suppressHeader
          userType={userType}
        >
          <ShopDirectoryMapOverlays
            deviationPrompt={deviationPrompt}
            intelligenceCallouts={roleHighlights.callouts}
            intelligenceTitle={roleHighlights.title}
            navigationMode={navigationMode}
            onSelectRoute={onSelectRoute}
            routeOptions={routeOptions}
            routeSummary={routeSummary}
            selectedOrigin={selectedOrigin}
            selectedRoute={selectedRoute}
            selectedShop={selectedShop}
          />
        </ShopDirectoryMapPane>
      </div>

      {/* Floating top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[550] bg-gradient-to-b from-slate-950/60 via-slate-950/20 to-transparent px-4 pb-8 pt-4">
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Back */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white shadow-xl backdrop-blur-md transition-colors hover:bg-slate-950/85"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Map-owned search */}
          <form className="flex-1" onSubmit={onSearchSubmit}>
            <div className="relative max-w-lg">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
              <input
                className="w-full rounded-full border border-white/20 bg-slate-950/70 py-2.5 pl-9 pr-4 text-sm text-white shadow-xl outline-none backdrop-blur-md transition-colors placeholder:text-white/45 focus:border-blue-400/50 focus:bg-slate-950/80"
                onChange={(event) => onSearchQueryChange(event.target.value)}
                placeholder="Search shops, programs, specialties..."
                type="text"
                value={searchQuery}
              />
            </div>
          </form>

          {/* Results drawer toggle */}
          <button
            className={`flex h-10 items-center gap-2 rounded-full border px-3 text-sm font-medium shadow-xl backdrop-blur-md transition-colors ${
              drawerOpen
                ? "border-blue-400/40 bg-blue-600/30 text-white"
                : "border-white/20 bg-slate-950/70 text-white/80 hover:bg-slate-950/85 hover:text-white"
            }`}
            onClick={() => setDrawerOpen((v) => !v)}
            type="button"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">{mapListings.length}</span>
          </button>

          {/* Mode switches */}
          <button
            className="flex h-10 items-center gap-2 rounded-full border border-white/20 bg-slate-950/70 px-3 text-sm font-medium text-white/80 shadow-xl backdrop-blur-md transition-colors hover:bg-slate-950/85 hover:text-white"
            onClick={() => onSwitchMode("hybrid")}
            type="button"
          >
            <Layers3 className="h-4 w-4" />
            <span className="hidden sm:inline">Split</span>
          </button>

          {/* Theme toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-950/70 text-white/80 shadow-xl backdrop-blur-md transition-colors hover:bg-slate-950/85 hover:text-white"
            onClick={onToggleTheme}
            type="button"
          >
            <SunMoon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Collapsible results drawer — bottom sheet on mobile, side drawer on sm+ */}
      {drawerOpen && (
        <aside className="absolute inset-x-0 bottom-0 z-[530] flex max-h-[60vh] flex-col overflow-hidden rounded-t-2xl border-t border-white/10 bg-white/95 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:bottom-0 sm:left-0 sm:top-16 sm:max-h-none sm:w-[360px] sm:max-w-[85vw] sm:rounded-t-none sm:rounded-r-2xl sm:border-t-0 sm:border-r">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Results
              </p>
              <p className="text-lg font-semibold text-slate-100">
                {mapListings.length} shop{mapListings.length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/[0.10] hover:text-slate-200"
              onClick={() => setDrawerOpen(false)}
              type="button"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {mapListings.length === 0 && (
              <div className="rounded-2xl border border-dashed border-blue-300/20 bg-blue-500/[0.04] p-4">
                <p className="text-sm font-semibold text-slate-900">No shops matched</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
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
