export type NavigationProvider = "apple" | "google" | "waze";

export type NavigationVoiceMode = "full" | "alerts-only" | "muted";
export type NavigationVoicePersona = "british-smooth";
export type NavigationVoiceVolumePreset = "louder" | "normal" | "softer";
export type NavigationSavedLocationCategory = "home" | "work" | "saved" | "recent" | "parked-car";
export type NavigationSearchProvider = "nominatim";
export type NavigationRouteProvider = "osrm-public";
export type NavigationSpeedLimitProvider = "overpass";
export type NavigationSpeedLimitConfidence = "high" | "medium" | "low";

export type NavigationCoordinate = {
  lat: number;
  lng: number;
};

export type NavigationAddressResult = {
  id: string;
  label: string;
  primaryLabel: string;
  secondaryLabel?: string;
  lat: number;
  lng: number;
  provider: NavigationSearchProvider;
};

export type NavigationAddressSuggestionIntent = "address" | "poi" | "recent" | "saved" | "fallback";

export type NavigationAddressSuggestion = {
  id: string;
  title: string;
  subtitle?: string;
  coordinate: NavigationCoordinate;
  intent: NavigationAddressSuggestionIntent;
  confidenceScore: number;
  provider: NavigationSearchProvider;
};

export type NavigationRouteStep = {
  id: string;
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  roadName?: string;
  maneuverType?: string;
  maneuverModifier?: string;
  location: NavigationCoordinate;
};

export type NavigationRoutePreview = {
  provider: NavigationRouteProvider;
  distanceMeters: number;
  durationSeconds: number;
  geometry: NavigationCoordinate[];
  steps: NavigationRouteStep[];
  fetchedAt: string;
  /**
   * Pass 203 (2026-05-09) KI-179 — true when the navigation engine returned
   * a route whose distance/duration/implied-speed falls outside plausibility
   * bands for a local body-shop trip (>100mi, >240min, or implied speed
   * outside [10, 80] mph). Mirrors the `RouteOption.isImplausible` flag
   * shipped Pass 179 for the dashboard mini-map data path. Optional —
   * absence means "not flagged" rather than "passed inspection."
   */
  isImplausible?: boolean;
  /** Diagnostic reasons populated alongside isImplausible. */
  implausibleReasons?: string[];
};

export type NavigationRouteOptions = {
  primary: NavigationRoutePreview;
  alternatives: NavigationRoutePreview[];
};

export type NavigationSpeedLimitSnapshot = {
  provider: NavigationSpeedLimitProvider;
  speedLimitMph: number;
  confidence: NavigationSpeedLimitConfidence;
  roadName?: string;
  sourceMaxspeedTag?: string;
  matchDistanceMeters?: number;
  fetchedAt: string;
};

export type NavigationSavedLocation = {
  id: string;
  label: string;
  subtitle?: string;
  category: NavigationSavedLocationCategory;
  coordinate: NavigationCoordinate;
  createdAt: string;
  lastUsedAt?: string;
};

export type NavigationParkedCarLocation = {
  id: string;
  coordinate: NavigationCoordinate;
  label: string;
  accuracyMeters?: number;
  roadName?: string;
  savedAt: string;
};

export type NavigationGuidanceSettings = {
  voiceMode: NavigationVoiceMode;
  voicePersona: NavigationVoicePersona;
  voiceVolumePreset: NavigationVoiceVolumePreset;
  gpsTrackingEnabled: boolean;
  speedLimitMonitorEnabled: boolean;
  autoRerouteEnabled: boolean;
  addressSearchProvider: NavigationSearchProvider;
  routeProvider: NavigationRouteProvider;
  speedLimitProvider: NavigationSpeedLimitProvider;
};

/** Voice-only subset of guidance settings — shared by speech services and alert hooks. */
export type NavigationVoiceSettings = Pick<
  NavigationGuidanceSettings,
  "voiceMode" | "voicePersona" | "voiceVolumePreset"
>;

export type ExternalNavigationSession = {
  provider: NavigationProvider;
  destinationId?: string;
  destinationName: string;
  destinationAddress?: string;
  destinationCoordinates: NavigationCoordinate;
  originLabel?: string;
  originCoordinates?: NavigationCoordinate;
  launchedAt: string;
};
