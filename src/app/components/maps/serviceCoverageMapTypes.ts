export type MapTileMode = "roadmap" | "night" | "satellite";

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
  source: "zip" | "geolocation";
};

export type CoveragePartnerShop = {
  id?: string;
  name: string;
  countyLabel: string;
  lat: number;
  lng: number;
  label: string;
  specialties: string[];
  rating: number;
};

export type CoverageNearbyShop = CoveragePartnerShop & {
  distanceMiles: number;
};
