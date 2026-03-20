export type MapTileMode = "roadmap" | "night" | "satellite";
export type MapSurfaceTone = "light" | "dark";

export type MapSurfaceTheme = {
  shellClassName: string;
  ambientOverlayClassName: string;
  mapCanvasClassName: string;
  panelClassName: string;
  panelStrongClassName: string;
  accentPanelClassName: string;
  segmentedClassName: string;
  activeSegmentClassName: string;
  inactiveSegmentClassName: string;
  primaryButtonClassName: string;
  secondaryButtonClassName: string;
  iconButtonClassName: string;
  eyebrowClassName: string;
  metricLabelClassName: string;
  titleClassName: string;
  bodyClassName: string;
  secondaryTextClassName: string;
  badgeClassName: string;
  softBadgeClassName: string;
  listCardClassName: string;
  selectedListCardClassName: string;
};

export type CoverageCountyMarker = {
  name: string;
  lat: number;
  lng: number;
};

export type CoverageSearchTarget = {
  lat: number;
  lng: number;
  county?: string;
  label: string;
  source: "zip" | "geolocation" | "address";
};

export type CoveragePartnerShop = {
  id?: string;
  name: string;
  countyLabel: string;
  lat: number;
  lng: number;
  label: string;
  addressLine?: string;
  phoneNumber?: string;
  email?: string;
  specialties: string[];
  rating: number;
  distanceMiles?: number;
};

export type CoverageNearbyShop = CoveragePartnerShop & {
  distanceMiles: number;
};
