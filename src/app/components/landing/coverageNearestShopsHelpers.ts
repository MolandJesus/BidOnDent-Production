import type {
  CoverageNearbyShop,
  CoverageSearchTarget,
  MapSurfaceTone,
} from "../maps/serviceCoverageMapTypes";

export type CoverageNearestShopsProps = {
  tone: MapSurfaceTone;
  isLoadingShops: boolean;
  fetchError?: string | null;
  usingDemoFallback?: boolean;
  activeSearchTarget: CoverageSearchTarget | null;
  nearbyShops: CoverageNearbyShop[];
  radiusMiles: string;
  selectedShopId?: string;
  onSelectShop: (shop: CoverageNearbyShop) => void;
  onOpenDirections: (shop: CoverageNearbyShop) => void;
  onRetryShops?: () => void;
  onOpenSearch?: () => void;
  className?: string;
  variant?: "default" | "landing-showcase";
  selectedShopName?: string | null;
};

export const LANDING_INSTRUCTION_CARDS = [
  {
    iconName: "Search" as const,
    title: "Search a ZIP or address",
    description: "Drop in home, work, or a repair address to focus the map fast.",
  },
  {
    iconName: "LocateFixed" as const,
    title: "Use live location",
    description: "Switch to GPS when you want the map to follow where you are now.",
  },
  {
    iconName: "Navigation" as const,
    title: "Choose a shop below",
    description: "Once the map is focused, compare nearby partners and jump into routing.",
  },
] as const;
