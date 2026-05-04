import { useCallback } from "react";
import { motion, AnimatePresence, type PanInfo } from "motion/react";
import { PanelLeftClose } from "lucide-react";
import ShopDirectoryResultCard from "./ShopDirectoryResultCard";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { NavigationSessionStatus } from "../../features/navigation";
import type { Place, RouteOption, ShopSortOption } from "../../types/mapDomain";
import {
  getShopRouteActionLabel,
  shouldUseShopNavigationAction,
} from "../../hooks/shopDirectorySessionUtils";
import { getRoleCollectionActionLabels } from "../../services/intelligence/shopMapExperience";

export type DrawerSnap = "peek" | "half" | "full";

type ImmersiveMapResultsDrawerProps = {
  isDark: boolean;
  open: boolean;
  snap: DrawerSnap;
  onClose: () => void;
  onSnapChange: (snap: DrawerSnap) => void;
  mapListings: ShopMapListing[];
  selectedShopId: number | null;
  selectedOrigin: Place | null;
  selectedRoute: RouteOption | null;
  navigationSessionStatus: NavigationSessionStatus;
  navigationSessionDestinationId: string | null;
  directionsActionLabel: string;
  hasArrived: boolean;
  userType: MarketUserType;
  roleHighlights: {
    badge: string;
    title: string;
    callouts: string[];
    secondaryActionLabel: string;
  };
  roleCollectionIds: number[];
  primaryColor: string;
  sortBy: ShopSortOption;
  onSortChange?: (sort: ShopSortOption) => void;
  onSelectShop: (id: number | null) => void;
  onToggleRoleCollection: (shopId: number) => void;
  onOpenShopDirections: (shop: ShopMapListing) => void;
  onStartNavigation?: (shop: ShopMapListing) => void;
  onViewDetails?: (shop: ShopMapListing) => void;
  onRequestEstimate?: (shop: ShopMapListing) => void;
};

const snapHeights: Record<DrawerSnap, string> = {
  peek: "25dvh",
  half: "50dvh",
  full: "78dvh",
};

export default function ImmersiveMapResultsDrawer({
  isDark,
  open,
  snap,
  onClose,
  onSnapChange,
  mapListings,
  selectedShopId,
  selectedOrigin,
  selectedRoute,
  navigationSessionStatus,
  navigationSessionDestinationId,
  directionsActionLabel,
  hasArrived,
  userType,
  roleHighlights,
  roleCollectionIds,
  primaryColor,
  sortBy,
  onSortChange,
  onSelectShop,
  onToggleRoleCollection,
  onOpenShopDirections,
  onStartNavigation,
  onViewDetails,
  onRequestEstimate,
}: ImmersiveMapResultsDrawerProps) {
  const drawerBg = isDark
    ? "border-[rgba(96,165,250,0.20)] bg-[linear-gradient(180deg,rgba(30,58,138,0.20)_0%,rgba(8,18,38,0.92)_100%)] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(196,144,65,0.22),inset_0_-1px_0_rgba(140,82,22,0.20),0_0_0_1px_rgba(96,165,250,0.16),0_-22px_56px_rgba(2,6,23,0.46),0_0_56px_rgba(196,130,45,0.14)]"
    : "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.92),rgba(232,238,248,0.88))] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(252,240,208,0.85),0_-18px_46px_rgba(15,23,42,0.14),0_0_0_1px_rgba(140,82,22,0.18)]";
  const drawerDivider = isDark ? "border-white/[0.08]" : "border-black/[0.06]";
  const drawerLabel = isDark ? "text-slate-500" : "text-slate-400";
  const drawerTitle = isDark ? "text-slate-100" : "text-slate-800";
  const drawerCloseCls = isDark
    ? "text-slate-400 hover:bg-white/[0.10] hover:text-slate-200"
    : "text-slate-500 hover:bg-black/[0.06] hover:text-slate-700";

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const vy = info.velocity.y;
      const dy = info.offset.y;
      if (vy > 600 || dy > 160) {
        onClose();
        onSnapChange("half");
        return;
      }
      if (vy < -600 || dy < -120) {
        onSnapChange(snap === "peek" ? "half" : "full");
        return;
      }
      if (dy > 50) {
        onSnapChange(snap === "full" ? "half" : "peek");
        return;
      }
      if (dy < -50) {
        onSnapChange(snap === "peek" ? "half" : "full");
        return;
      }
    },
    [snap, onClose, onSnapChange]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className={`pointer-events-auto absolute inset-x-0 bottom-0 z-[530] flex touch-pan-y overscroll-y-contain flex-col overflow-hidden rounded-t-2xl border-t shadow-2xl sm:inset-x-auto sm:bottom-0 sm:left-0 sm:top-16 sm:max-h-none sm:w-[360px] sm:max-w-[85vw] sm:rounded-t-none sm:rounded-r-2xl sm:border-t-0 sm:border-r ${drawerBg}`}
          role="region"
          aria-label="Shop results"
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          initial={{ y: "100%" }}
          animate={{ y: 0, height: `var(--drawer-h)` }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({
            style: {
              "--drawer-h": snapHeights[snap],
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            },
          } as any)}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.15, bottom: 0.4 }}
          onDragEnd={handleDragEnd}
          dragMomentum={false}
        >
          {/* Mobile drag handle */}
          <div
            className="flex cursor-grab touch-none justify-center py-2.5 sm:hidden active:cursor-grabbing"
            onClick={() =>
              onSnapChange(snap === "full" ? "half" : snap === "half" ? "peek" : "half")
            }
          >
            <div className={`h-1.5 w-12 rounded-full ${isDark ? "bg-white/25" : "bg-black/20"}`} />
          </div>
          <div
            className={`flex items-center justify-between border-b px-4 py-3 sm:pt-3 ${drawerDivider}`}
          >
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.16em] ${drawerLabel}`}>
                Results
              </p>
              <p className={`text-lg font-semibold ${drawerTitle}`}>
                {mapListings.length} shop{mapListings.length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${drawerCloseCls}`}
              onClick={onClose}
              type="button"
              aria-label="Close results drawer"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          {/* Sort pills */}
          {onSortChange && (
            <div className={`flex gap-1.5 overflow-x-auto border-b px-4 py-2 ${drawerDivider}`}>
              {(
                [
                  { value: "smart-match", label: "Smart Match" },
                  { value: "distance", label: "Nearest" },
                  { value: "rating", label: "Top Rated" },
                  { value: "reviews", label: "Most Reviews" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSortChange(opt.value)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                    sortBy === opt.value
                      ? isDark
                        ? "border-blue-400/40 bg-blue-600/30 text-white"
                        : "border-blue-400/40 bg-blue-100 text-blue-700"
                      : isDark
                        ? "border-white/12 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 min-h-0 space-y-3 overflow-y-auto overscroll-y-contain p-4 pb-6 touch-pan-y [-webkit-overflow-scrolling:touch]">
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
                  Try broadening the search, switching to Smart Match, or removing the 4.5+ filter.
                </p>
              </div>
            )}

            {mapListings.map((shop) => {
              const roleAction = getRoleCollectionActionLabels(
                userType,
                roleCollectionIds.includes(shop.id)
              );
              const shopOwnsSessionDestination = navigationSessionDestinationId === String(shop.id);
              const hasArrivedForShop = hasArrived && selectedShopId === shop.id;
              const routeReadyForShop = Boolean(
                onStartNavigation && selectedOrigin && selectedRoute && selectedShopId === shop.id
              );
              const routeStatusLabel = hasArrivedForShop
                ? "Arrived"
                : shopOwnsSessionDestination && navigationSessionStatus === "paused"
                  ? "Paused route"
                  : shopOwnsSessionDestination && navigationSessionStatus === "active"
                    ? "Live guidance"
                    : null;
              const routeStatusTone = hasArrivedForShop
                ? ("arrived" as const)
                : navigationSessionStatus === "paused"
                  ? ("paused" as const)
                  : ("live" as const);
              const shouldUseNavigationAction = Boolean(
                onStartNavigation &&
                  shouldUseShopNavigationAction({
                    shopId: shop.id,
                    routeReady: routeReadyForShop,
                    navigationSessionStatus,
                    navigationSessionDestinationId,
                  })
              );

              return (
                <ShopDirectoryResultCard
                  compact
                  directionsActionLabel={getShopRouteActionLabel({
                    shopId: shop.id,
                    routeReady: routeReadyForShop,
                    hasArrived: hasArrivedForShop,
                    defaultLabel: directionsActionLabel,
                    navigationSessionStatus,
                    navigationSessionDestinationId,
                  })}
                  isSelected={selectedShopId === shop.id}
                  key={shop.id}
                  onCardClick={() => onSelectShop(shop.id)}
                  onDirectionsAction={() =>
                    shouldUseNavigationAction && onStartNavigation
                      ? onStartNavigation(shop)
                      : onOpenShopDirections(shop)
                  }
                  onPrimaryAction={() => onToggleRoleCollection(shop.id)}
                  onRequestEstimate={onRequestEstimate ? () => onRequestEstimate(shop) : undefined}
                  onSecondaryAction={() => {
                    onSelectShop(shop.id);
                    onViewDetails?.(shop);
                  }}
                  primaryActionLabel={roleAction.primary}
                  primaryColor={primaryColor}
                  routeStatusLabel={routeStatusLabel}
                  routeStatusTone={routeStatusTone}
                  secondaryActionLabel={roleHighlights.secondaryActionLabel}
                  shop={shop}
                />
              );
            })}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
