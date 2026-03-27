import type { Coordinates, Place } from "../../types/mapDomain";

export type ShopLocationRecord = {
  coordinates: Coordinates;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

// Default center: Westchester County, NY — heart of the coverage area
const DEFAULT_MAP_CENTER: Coordinates = {
  latitude: 41.0534,
  longitude: -73.8654,
};

// Shops distributed across the active coverage counties:
// Rockland, Dutchess, Westchester, Nassau, Orange, Putnam
const SHOP_LOCATION_DIRECTORY: Record<number, ShopLocationRecord> = {
  1: {
    coordinates: { latitude: 40.9312, longitude: -73.899 },
    address: "42 McLean Ave",
    city: "Yonkers",
    state: "NY",
    zipCode: "10705",
  },
  2: {
    coordinates: { latitude: 41.0534, longitude: -73.7629 },
    address: "180 Main St",
    city: "White Plains",
    state: "NY",
    zipCode: "10601",
  },
  3: {
    coordinates: { latitude: 41.1132, longitude: -74.0326 },
    address: "205 Route 59",
    city: "Spring Valley",
    state: "NY",
    zipCode: "10977",
  },
  4: {
    coordinates: { latitude: 41.7004, longitude: -73.9209 },
    address: "30 Cannon St",
    city: "Poughkeepsie",
    state: "NY",
    zipCode: "12601",
  },
  5: {
    coordinates: { latitude: 40.7062, longitude: -73.618 },
    address: "350 Fulton Ave",
    city: "Hempstead",
    state: "NY",
    zipCode: "11550",
  },
  6: {
    coordinates: { latitude: 41.445,  longitude: -74.4229 },
    address: "60 Dolson Ave",
    city: "Middletown",
    state: "NY",
    zipCode: "10940",
  },
};

const SUGGESTED_SEARCH_ORIGINS: Place[] = [
  {
    name: "Yonkers",
    address: "40 S Broadway",
    city: "Yonkers",
    state: "NY",
    zipCode: "10701",
    latitude: 40.9312,
    longitude: -73.8988,
    placeId: "yonkers-ny",
  },
  {
    name: "White Plains",
    address: "255 Main St",
    city: "White Plains",
    state: "NY",
    zipCode: "10601",
    latitude: 41.0534,
    longitude: -73.7629,
    placeId: "white-plains-ny",
  },
  {
    name: "Spring Valley",
    address: "200 N Main St",
    city: "Spring Valley",
    state: "NY",
    zipCode: "10977",
    latitude: 41.1132,
    longitude: -74.0447,
    placeId: "spring-valley-ny",
  },
  {
    name: "Poughkeepsie",
    address: "62 Civic Center Plaza",
    city: "Poughkeepsie",
    state: "NY",
    zipCode: "12601",
    latitude: 41.7004,
    longitude: -73.9209,
    placeId: "poughkeepsie-ny",
  },
];

export function getLocationForShop(shopId: number): ShopLocationRecord {
  return (
    SHOP_LOCATION_DIRECTORY[shopId] || {
      coordinates: DEFAULT_MAP_CENTER,
      address: "New York Service Area",
      city: "White Plains",
      state: "NY",
      zipCode: "10601",
    }
  );
}

export function getDefaultMapCenter() {
  return DEFAULT_MAP_CENTER;
}

export function getSuggestedSearchOrigins() {
  return SUGGESTED_SEARCH_ORIGINS;
}
