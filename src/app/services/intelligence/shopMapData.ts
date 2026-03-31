import type { Coordinates, Place } from "../../types/mapDomain";
import { ATLANTA_SUGGESTED_ORIGINS, ATLANTA_TEST_SHOP_LOCATIONS } from "./atlantaTestHubSeed";

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
    coordinates: { latitude: 41.445, longitude: -74.4229 },
    address: "60 Dolson Ave",
    city: "Middletown",
    state: "NY",
    zipCode: "10940",
  },
  7: {
    coordinates: { latitude: 40.9115, longitude: -73.7826 },
    address: "525 Main St",
    city: "New Rochelle",
    state: "NY",
    zipCode: "10801",
  },
  8: {
    coordinates: { latitude: 41.0762, longitude: -73.859 },
    address: "78 Broadway",
    city: "Tarrytown",
    state: "NY",
    zipCode: "10591",
  },
  ...ATLANTA_TEST_SHOP_LOCATIONS,
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
    name: "New Rochelle",
    address: "515 North Ave",
    city: "New Rochelle",
    state: "NY",
    zipCode: "10801",
    latitude: 40.9115,
    longitude: -73.7826,
    placeId: "new-rochelle-ny",
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
    name: "Hempstead",
    address: "1 Washington St",
    city: "Hempstead",
    state: "NY",
    zipCode: "11550",
    latitude: 40.7062,
    longitude: -73.618,
    placeId: "hempstead-ny",
  },
  {
    name: "Middletown",
    address: "16 James St",
    city: "Middletown",
    state: "NY",
    zipCode: "10940",
    latitude: 41.445,
    longitude: -74.4229,
    placeId: "middletown-ny",
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
  {
    name: "Tarrytown",
    address: "1 Depot Plaza",
    city: "Tarrytown",
    state: "NY",
    zipCode: "10591",
    latitude: 41.0762,
    longitude: -73.859,
    placeId: "tarrytown-ny",
  },
  {
    name: "Los Angeles",
    address: "200 N Spring St",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90012",
    latitude: 34.0537,
    longitude: -118.2428,
    placeId: "los-angeles-ca",
  },
  {
    name: "Chicago",
    address: "121 N LaSalle St",
    city: "Chicago",
    state: "IL",
    zipCode: "60602",
    latitude: 41.8837,
    longitude: -87.6324,
    placeId: "chicago-il",
  },
  {
    name: "Dallas",
    address: "1500 Marilla St",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
    latitude: 32.7767,
    longitude: -96.797,
    placeId: "dallas-tx",
  },
  {
    name: "Miami",
    address: "3500 Pan American Dr",
    city: "Miami",
    state: "FL",
    zipCode: "33133",
    latitude: 25.7617,
    longitude: -80.1918,
    placeId: "miami-fl",
  },
  {
    name: "Denver",
    address: "1437 Bannock St",
    city: "Denver",
    state: "CO",
    zipCode: "80202",
    latitude: 39.7392,
    longitude: -104.9903,
    placeId: "denver-co",
  },
  {
    name: "Seattle",
    address: "600 4th Ave",
    city: "Seattle",
    state: "WA",
    zipCode: "98104",
    latitude: 47.6062,
    longitude: -122.3321,
    placeId: "seattle-wa",
  },
  {
    name: "Phoenix",
    address: "200 W Washington St",
    city: "Phoenix",
    state: "AZ",
    zipCode: "85003",
    latitude: 33.4484,
    longitude: -112.074,
    placeId: "phoenix-az",
  },
  ...ATLANTA_SUGGESTED_ORIGINS,
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
