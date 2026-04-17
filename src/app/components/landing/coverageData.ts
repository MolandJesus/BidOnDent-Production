import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";

export type CoverageLookup = {
  lat: number;
  lng: number;
  county: string;
};

export const operatingRegions = [
  "Rockland County",
  "Dutchess County",
  "Westchester County",
  "Nassau County",
  "Orange County",
  "Putnam County",
];

export const countyCenters = [
  { name: "Rockland County", lat: 41.1489, lng: -73.983 },
  { name: "Dutchess County", lat: 41.7658, lng: -73.7485 },
  { name: "Westchester County", lat: 41.122, lng: -73.7949 },
  { name: "Nassau County", lat: 40.6546, lng: -73.5594 },
  { name: "Orange County", lat: 41.402, lng: -74.3056 },
  { name: "Putnam County", lat: 41.4299, lng: -73.7604 },
];

export const fallbackPartnerHubs: CoveragePartnerShop[] = [
  {
    name: "BidOnDent North Hub",
    dataMode: "demo" as const,
    countyLabel: "Dutchess County hub",
    lat: 41.7004,
    lng: -73.921,
    label: "Poughkeepsie, NY",
    specialties: ["Collision estimating", "Panel repair"],
    rating: 4.8,
  },
  {
    name: "BidOnDent West Hub",
    dataMode: "demo" as const,
    countyLabel: "Rockland County hub",
    lat: 41.1112,
    lng: -74.0413,
    label: "Spring Valley, NY",
    specialties: ["Dent repair", "Insurance-ready intake"],
    rating: 4.7,
  },
  {
    name: "BidOnDent Metro Hub",
    dataMode: "demo" as const,
    countyLabel: "Westchester County hub",
    lat: 41.033,
    lng: -73.7629,
    label: "White Plains, NY",
    specialties: ["Same-day review", "ADAS coordination"],
    rating: 4.9,
  },
  {
    name: "BidOnDent East Hub",
    dataMode: "demo" as const,
    countyLabel: "Nassau County hub",
    lat: 40.7244,
    lng: -73.6407,
    label: "Westbury, NY",
    specialties: ["Refinish", "Paintless dent repair"],
    rating: 4.7,
  },
  {
    name: "BidOnDent Hudson Hub",
    dataMode: "demo" as const,
    countyLabel: "Orange County hub",
    lat: 41.5034,
    lng: -74.0104,
    label: "Newburgh, NY",
    specialties: ["Frame alignment", "Heavy collision"],
    rating: 4.6,
  },
  {
    name: "BidOnDent Highlands Hub",
    dataMode: "demo" as const,
    countyLabel: "Putnam County hub",
    lat: 41.4309,
    lng: -73.6808,
    label: "Carmel, NY",
    specialties: ["Hail repair", "Glass calibration"],
    rating: 4.8,
  },
];

const exactZipCoordinates: Record<string, CoverageLookup> = {
  "10512": { lat: 41.427, lng: -73.6746, county: "Putnam County" },
  "10522": { lat: 41.0196, lng: -73.8693, county: "Westchester County" },
  "10532": { lat: 41.1012, lng: -73.8032, county: "Westchester County" },
  "10583": { lat: 40.9898, lng: -73.7976, county: "Westchester County" },
  "10601": { lat: 41.033, lng: -73.7629, county: "Westchester County" },
  "10604": { lat: 41.0508, lng: -73.7924, county: "Westchester County" },
  "10701": { lat: 40.9318, lng: -73.8988, county: "Westchester County" },
  "10710": { lat: 40.9734, lng: -73.8563, county: "Westchester County" },
  "10801": { lat: 40.9126, lng: -73.7838, county: "Westchester County" },
  "10901": { lat: 41.1073, lng: -74.0632, county: "Rockland County" },
  "10924": { lat: 41.3223, lng: -74.184, county: "Orange County" },
  "10940": { lat: 41.4654, lng: -74.3632, county: "Orange County" },
  "10950": { lat: 41.3254, lng: -74.2832, county: "Orange County" },
  "10954": { lat: 41.1053, lng: -74.0121, county: "Rockland County" },
  "10956": { lat: 41.1432, lng: -73.9896, county: "Rockland County" },
  "10960": { lat: 41.0918, lng: -73.9513, county: "Rockland County" },
  "10977": { lat: 41.1479, lng: -74.0051, county: "Rockland County" },
  "11530": { lat: 40.7268, lng: -73.6415, county: "Nassau County" },
  "11590": { lat: 40.7557, lng: -73.5876, county: "Nassau County" },
  "11747": { lat: 40.7951, lng: -73.3596, county: "Nassau County" },
  "12508": { lat: 41.52, lng: -73.9662, county: "Dutchess County" },
  "12524": { lat: 41.5262, lng: -73.9457, county: "Dutchess County" },
  "12550": { lat: 41.5034, lng: -74.0104, county: "Orange County" },
  "12601": { lat: 41.7004, lng: -73.921, county: "Dutchess County" },
  "12603": { lat: 41.7082, lng: -73.8818, county: "Dutchess County" },
  "10916": { lat: 41.4318, lng: -74.2543, county: "Orange County" },
  "10998": { lat: 41.2962, lng: -74.0654, county: "Orange County" },
  "12563": { lat: 41.4215, lng: -73.6849, county: "Putnam County" },
  "10573": { lat: 40.9934, lng: -73.6718, county: "Westchester County" },
};

const prefixFallbackCoordinates: Record<string, CoverageLookup> = {
  "105": { lat: 41.145, lng: -73.81, county: "Westchester County" },
  "106": { lat: 41.033, lng: -73.7629, county: "Westchester County" },
  "107": { lat: 40.9528, lng: -73.8676, county: "Westchester County" },
  "108": { lat: 40.9395, lng: -73.8332, county: "Westchester County" },
  "109": { lat: 41.1462, lng: -74.0343, county: "Rockland County" },
  "110": { lat: 40.7756, lng: -73.704, county: "Nassau County" },
  "115": { lat: 40.6501, lng: -73.6068, county: "Nassau County" },
  "125": { lat: 41.7453, lng: -73.6996, county: "Dutchess County" },
  "126": { lat: 41.7004, lng: -73.921, county: "Dutchess County" },
  "127": { lat: 41.6623, lng: -74.7156, county: "Orange County" },
};

export const defaultCoverageCenter: [number, number] = [41.22, -73.88];

export function sanitizeZipInput(value: string) {
  return value.replace(/[^0-9]/g, "").slice(0, 5);
}

export function resolveCoverageLookup(zipCode: string): CoverageLookup | null {
  const normalizedZip = sanitizeZipInput(zipCode);

  if (normalizedZip.length < 3) return null;
  if (normalizedZip.length >= 5 && exactZipCoordinates[normalizedZip]) {
    return exactZipCoordinates[normalizedZip];
  }

  return prefixFallbackCoordinates[normalizedZip.slice(0, 3)] || null;
}
