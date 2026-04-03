/**
 * Map Domain Types
 *
 * Shared types for map/search/origin/place/shop result experiences across BidOnDent.
 * Decoupled from any single UI framework to support web, mobile, desktop variants.
 */

// ============================================================================
// MAP VIEW & DISPLAY MODES
// ============================================================================

export type MapViewMode = "list" | "map" | "hybrid";
export type MapTheme = "light" | "dark" | "auto";

// ============================================================================
// GEOGRAPHIC PRIMITIVES
// ============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface MapViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface Place extends Coordinates {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  placeId?: string;
}

export type SearchOrigin = Place | null;

// ============================================================================
// SAVED PLACES (USER FAVORITES / HISTORY)
// ============================================================================

export interface SavedPlace extends Place {
  id: string;
  label: string;
  isFavorite: boolean;
  createdAt: string;
  lastUsedAt: string;
  metadata?: {
    icon?: string;
    category?: "home" | "work" | "frequent" | "custom";
  };
}

// ============================================================================
// SEARCH STATE & HISTORY
// ============================================================================

export interface MapSearchQuery {
  keyword?: string;
  origin?: SearchOrigin;
  filters?: MapSearchFilters;
  sortBy?: ShopSortOption;
}

export interface MapSearchFilters {
  maxDistanceMiles?: number;
  minRating?: number;
  serviceTypes?: string[]; // e.g., ["collision", "glass", "pdr"]
  insurerPrograms?: string[]; // e.g., ["State Farm", "Progressive"]
  vehicleTypes?: string[];
  searchWithinViewport?: boolean;
  openNow?: boolean;
  hasAvailability?: boolean;
}

export interface RecentSearch {
  query: string;
  timestamp: string;
  origin?: SearchOrigin;
  resultCount?: number;
}

// ============================================================================
// ROUTE PREVIEW
// ============================================================================

export interface RouteInstruction {
  id: string;
  title: string;
  detail: string;
  distanceLabel: string;
  durationMinutes: number;
}

export interface RouteOption {
  id: string;
  label: string;
  trafficLabel: string;
  totalDistanceMiles: number;
  totalDistanceLabel: string;
  estimatedDurationMinutes: number;
  accentColor: string;
  polyline: Coordinates[];
  instructions: RouteInstruction[];
}

// ============================================================================
// SHOP RESULT (EXTENDED FROM marketIntelligence)
// ============================================================================

export interface MapShopResult {
  // Core identity
  id: number;
  name: string;

  // Location
  coordinates: Coordinates;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  distanceMiles: number;

  // Rating & trust
  rating: number;
  reviews: number;

  // Visual
  image: string;
  certifications: string[];

  // Contact
  phone?: string;

  // Operational
  responseTimeHours: number;
  completionRate: number;

  // Features
  specialties: string[];
  supportedMakes: string[];
  insurerPrograms: string[];

  // Intelligence
  aiSummary: string;
  matchScore: number;
  insuranceCompatibilityScore: number;
}

// ============================================================================
// INSURER RESULT
// ============================================================================

export interface MapInsurerResult {
  id: number;
  name: string;
  description: string;

  // Contact
  claimsPhone: string;
  headquarters: string;

  // Support
  digitalClaimsExperience: "standard" | "strong" | "excellent";

  // Intelligence
  connected: boolean;
  fitScore: number;
}

// ============================================================================
// MAP RESULT CLUSTERING (FOR PERFORMANCE)
// ============================================================================

export interface MapCluster {
  id: string;
  coordinate: Coordinates;
  count: number;
  isCluster: true;
}

export type MapMarker = MapShopResult | MapInsurerResult | MapCluster;

export function isMapCluster(marker: MapMarker | MapCluster): marker is MapCluster {
  return "isCluster" in marker && marker.isCluster === true;
}

// ============================================================================
// MAP INTERACTION STATE (EPHEMERAL UI STATE)
// ============================================================================

export interface MapInteractionState {
  selectedMarkerId?: string | number; // Currently selected shop/insurer
  hoveredMarkerId?: string | number;

  mapCenter?: Coordinates;
  mapZoom?: number;

  isSearchingByDraw?: boolean; // Advanced: drawing radius on map
  drawRadius?: number;

  visibleFilters?: Partial<MapSearchFilters>; // What's currently visible/applied
}

// ============================================================================
// SORT OPTIONS (FROM marketIntelligence)
// ============================================================================

export type ShopSortOption = "smart-match" | "rating" | "reviews" | "distance";

export interface MapSortConfig {
  sortBy: ShopSortOption;
  ascending: boolean;
}

// ============================================================================
// MAP SESSION MEMORY (PERSISTENT USER STATE)
//
// This extends WebsiteSessionMemory and is persisted to localStorage.
// Unlike MapInteractionState, these are user preferences, not ephemeral UI state.
// ============================================================================

export interface MapSessionMemory {
  // Search history
  savedPlaces: SavedPlace[];
  recentSearches: RecentSearch[];

  // Role-scoped saved collections
  customerSavedShopIds: number[];
  shopWatchlistIds: number[];
  insurerShortlistIds: number[];

  // Current search context
  lastSearchOrigin?: SearchOrigin;
  lastSearchQuery?: string;
  lastSearchFilters?: MapSearchFilters;

  // User preferences
  mapViewMode: MapViewMode;
  mapTheme: MapTheme;

  // Display preferences
  showClusters: boolean;
  clusterLevel: "aggressive" | "balanced" | "detailed";

  // Last viewed state
  lastViewedShopId?: number;
  selectedRouteId?: string;
  lastMapCenter?: Coordinates;
  lastMapZoom?: number;
  lastViewportBounds?: MapViewportBounds;

  // Updated timestamp
  updatedAt: string;
}

// ============================================================================
// COMPOSITE: FULL MAP DATA STATE
// ============================================================================

export interface MapDataState {
  // Persistent session memory
  session: MapSessionMemory;

  // Current ephemeral interaction
  interaction: MapInteractionState;

  // Current search results
  shops: MapShopResult[];
  insurers: MapInsurerResult[];

  // Loading/error states
  isLoading: boolean;
  error?: string;
  resultCount: number;
}

// ============================================================================
// MAP OPERATIONS (FOR HANDLERS/EFFECTS)
// ============================================================================

export interface MapOperations {
  // Search
  search: (query: MapSearchQuery) => Promise<void>;
  setSearchOrigin: (origin: SearchOrigin) => void;
  clearSearch: () => void;

  // Places
  savePlace: (place: SavedPlace) => void;
  removeSavedPlace: (id: string) => void;
  addRecentSearch: (query: string, origin?: SearchOrigin) => void;

  // View preferences
  setMapViewMode: (mode: MapViewMode) => void;
  setMapTheme: (theme: MapTheme) => void;

  // Map pan/zoom
  setMapCenter: (coords: Coordinates) => void;
  setMapZoom: (zoom: number) => void;

  // Selection
  selectShop: (id: number) => void;
  selectInsurer: (id: number) => void;
  clearSelection: () => void;
}
