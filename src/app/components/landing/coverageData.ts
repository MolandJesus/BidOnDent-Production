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

export const fallbackPartnerHubs = [
  {
    name: "BidOnDent North Hub",
    countyLabel: "Dutchess County hub",
    lat: 41.7004,
    lng: -73.921,
    label: "Poughkeepsie, NY",
    specialties: ["Collision estimating", "Panel repair"],
    rating: 4.8,
  },
  {
    name: "BidOnDent West Hub",
    countyLabel: "Rockland County hub",
    lat: 41.1112,
    lng: -74.0413,
    label: "Spring Valley, NY",
    specialties: ["Dent repair", "Insurance-ready intake"],
    rating: 4.7,
  },
  {
    name: "BidOnDent Metro Hub",
    countyLabel: "Westchester County hub",
    lat: 41.033,
    lng: -73.7629,
    label: "White Plains, NY",
    specialties: ["Same-day review", "ADAS coordination"],
    rating: 4.9,
  },
  {
    name: "BidOnDent East Hub",
    countyLabel: "Nassau County hub",
    lat: 40.7244,
    lng: -73.6407,
    label: "Westbury, NY",
    specialties: ["Refinish", "Paintless dent repair"],
    rating: 4.7,
  },
];

const exactZipCoordinates: Record<string, CoverageLookup> = {
  "10512": { lat: 41.427, lng: -73.6746, county: "Putnam County" },
  "10583": { lat: 40.9898, lng: -73.7976, county: "Westchester County" },
  "10601": { lat: 41.033, lng: -73.7629, county: "Westchester County" },
  "10924": { lat: 41.3223, lng: -74.184, county: "Orange County" },
  "10954": { lat: 41.1053, lng: -74.0121, county: "Rockland County" },
  "10956": { lat: 41.1432, lng: -73.9896, county: "Rockland County" },
  "11590": { lat: 40.7557, lng: -73.5876, county: "Nassau County" },
  "12508": { lat: 41.52, lng: -73.9662, county: "Dutchess County" },
  "12601": { lat: 41.7004, lng: -73.921, county: "Dutchess County" },
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
