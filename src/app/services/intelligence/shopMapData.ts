import type { Coordinates, Place } from "../../types/mapDomain";

export type ShopLocationRecord = {
  coordinates: Coordinates;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

const DEFAULT_MAP_CENTER: Coordinates = {
  latitude: 32.7767,
  longitude: -96.797,
};

const SHOP_LOCATION_DIRECTORY: Record<number, ShopLocationRecord> = {
  1: {
    coordinates: { latitude: 32.7876, longitude: -96.7998 },
    address: "2215 Ross Ave",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
  },
  2: {
    coordinates: { latitude: 32.8012, longitude: -96.8084 },
    address: "4201 Oak Lawn Ave",
    city: "Dallas",
    state: "TX",
    zipCode: "75219",
  },
  3: {
    coordinates: { latitude: 32.7639, longitude: -96.7917 },
    address: "1515 Elm St",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
  },
  4: {
    coordinates: { latitude: 32.8239, longitude: -96.7709 },
    address: "8300 Meadow Rd",
    city: "Dallas",
    state: "TX",
    zipCode: "75231",
  },
  5: {
    coordinates: { latitude: 32.8469, longitude: -96.7642 },
    address: "9440 Skillman St",
    city: "Dallas",
    state: "TX",
    zipCode: "75243",
  },
  6: {
    coordinates: { latitude: 32.7347, longitude: -96.8271 },
    address: "228 W Jefferson Blvd",
    city: "Dallas",
    state: "TX",
    zipCode: "75208",
  },
};

const SUGGESTED_SEARCH_ORIGINS: Place[] = [
  {
    name: "Downtown Dallas",
    address: "1500 Marilla St",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
    latitude: 32.7767,
    longitude: -96.797,
    placeId: "downtown-dallas",
  },
  {
    name: "Uptown",
    address: "2610 Maple Ave",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
    latitude: 32.7974,
    longitude: -96.8013,
    placeId: "uptown-dallas",
  },
  {
    name: "Love Field Corridor",
    address: "8008 Herb Kelleher Way",
    city: "Dallas",
    state: "TX",
    zipCode: "75235",
    latitude: 32.845,
    longitude: -96.8518,
    placeId: "love-field-corridor",
  },
  {
    name: "White Rock",
    address: "8300 Garland Rd",
    city: "Dallas",
    state: "TX",
    zipCode: "75218",
    latitude: 32.8151,
    longitude: -96.7173,
    placeId: "white-rock",
  },
];

export function getLocationForShop(shopId: number): ShopLocationRecord {
  return (
    SHOP_LOCATION_DIRECTORY[shopId] || {
      coordinates: DEFAULT_MAP_CENTER,
      address: "Dallas Service Area",
      city: "Dallas",
      state: "TX",
      zipCode: "75201",
    }
  );
}

export function getDefaultMapCenter() {
  return DEFAULT_MAP_CENTER;
}

export function getSuggestedSearchOrigins() {
  return SUGGESTED_SEARCH_ORIGINS;
}
