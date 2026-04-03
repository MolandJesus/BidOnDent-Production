/**
 * Dev/QA-only Atlanta destination pack for local navigation testing.
 * This dataset is intentionally separate from marketplace shop seeds.
 */

export type AtlantaQADestinationKind =
  | "restaurant"
  | "gas_station"
  | "grocery"
  | "coffee"
  | "landmark"
  | "hospital"
  | "pharmacy"
  | "park";

export type AtlantaQADestination = {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  kind: AtlantaQADestinationKind;
  neighborhood: string;
  isChain: boolean;
};

export const ATLANTA_QA_NEIGHBORHOODS = [
  "Midtown",
  "Downtown",
  "Buckhead",
  "Decatur",
  "Sandy Springs",
  "Brookhaven",
  "Dunwoody",
  "Smyrna",
  "Marietta",
  "Roswell",
  "Alpharetta",
  "East Atlanta",
  "Old Fourth Ward",
  "Virginia-Highland",
  "Little Five Points",
] as const;

export const ATLANTA_QA_DESTINATIONS: AtlantaQADestination[] = [
  { id: "atl-qa-starbucks-midtown", name: "Starbucks", address: "1197 Peachtree St NE", coordinates: { lat: 33.786946, lng: -84.382957 }, kind: "coffee", neighborhood: "Midtown", isChain: true },
  { id: "atl-qa-piedmont-park-midtown", name: "Piedmont Park", address: "1320 Monroe Dr NE", coordinates: { lat: 33.789048, lng: -84.371886 }, kind: "park", neighborhood: "Midtown", isChain: false },
  { id: "atl-qa-publix-midtown", name: "Publix", address: "950 W Peachtree St NW", coordinates: { lat: 33.780448, lng: -84.388756 }, kind: "grocery", neighborhood: "Midtown", isChain: true },
  { id: "atl-qa-georgia-aquarium-downtown", name: "Georgia Aquarium", address: "225 Baker St NW", coordinates: { lat: 33.763267, lng: -84.395117 }, kind: "landmark", neighborhood: "Downtown", isChain: false },
  { id: "atl-qa-centennial-park-downtown", name: "Centennial Olympic Park", address: "265 Park Ave W NW", coordinates: { lat: 33.760144, lng: -84.393453 }, kind: "park", neighborhood: "Downtown", isChain: false },
  { id: "atl-qa-world-of-coca-cola-downtown", name: "World of Coca-Cola", address: "121 Baker St NW", coordinates: { lat: 33.762898, lng: -84.392552 }, kind: "landmark", neighborhood: "Downtown", isChain: false },
  { id: "atl-qa-lenox-square-buckhead", name: "Lenox Square", address: "3393 Peachtree Rd NE", coordinates: { lat: 33.846683, lng: -84.362856 }, kind: "landmark", neighborhood: "Buckhead", isChain: false },
  { id: "atl-qa-phipps-plaza-buckhead", name: "Phipps Plaza", address: "3500 Peachtree Rd NE", coordinates: { lat: 33.852675, lng: -84.362139 }, kind: "landmark", neighborhood: "Buckhead", isChain: false },
  { id: "atl-qa-mcdonalds-buckhead", name: "McDonald's", address: "2929 Peachtree Rd NE", coordinates: { lat: 33.835153, lng: -84.381716 }, kind: "restaurant", neighborhood: "Buckhead", isChain: true },
  { id: "atl-qa-decatur-square", name: "Decatur Square", address: "101 E Court Sq", coordinates: { lat: 33.775129, lng: -84.296514 }, kind: "landmark", neighborhood: "Decatur", isChain: false },
  { id: "atl-qa-dancing-goats-decatur", name: "Dancing Goats Coffee Bar", address: "419 W Ponce de Leon Ave", coordinates: { lat: 33.775922, lng: -84.303255 }, kind: "coffee", neighborhood: "Decatur", isChain: false },
  { id: "atl-qa-kroger-decatur", name: "Kroger", address: "2385 Wesley Chapel Rd", coordinates: { lat: 33.718288, lng: -84.217445 }, kind: "grocery", neighborhood: "Decatur", isChain: true },
  { id: "atl-qa-city-springs-sandy-springs", name: "City Springs", address: "1 Galambos Way", coordinates: { lat: 33.925067, lng: -84.380279 }, kind: "landmark", neighborhood: "Sandy Springs", isChain: false },
  { id: "atl-qa-publix-sandy-springs", name: "Publix", address: "8725 Roswell Rd", coordinates: { lat: 33.994135, lng: -84.3493 }, kind: "grocery", neighborhood: "Sandy Springs", isChain: true },
  { id: "atl-qa-shell-sandy-springs", name: "Shell", address: "7325 Roswell Rd", coordinates: { lat: 33.954943, lng: -84.364479 }, kind: "gas_station", neighborhood: "Sandy Springs", isChain: true },
  { id: "atl-qa-town-brookhaven", name: "Town Brookhaven", address: "4330 Peachtree Rd NE", coordinates: { lat: 33.869888, lng: -84.333804 }, kind: "landmark", neighborhood: "Brookhaven", isChain: false },
  { id: "atl-qa-oglethorpe-university-brookhaven", name: "Oglethorpe University", address: "4484 Peachtree Rd NE", coordinates: { lat: 33.876326, lng: -84.334389 }, kind: "landmark", neighborhood: "Brookhaven", isChain: false },
  { id: "atl-qa-publix-brookhaven", name: "Publix", address: "3435 Ashford Dunwoody Rd NE", coordinates: { lat: 33.890427, lng: -84.324501 }, kind: "grocery", neighborhood: "Brookhaven", isChain: true },
  { id: "atl-qa-perimeter-mall-dunwoody", name: "Perimeter Mall", address: "4400 Ashford Dunwoody Rd NE", coordinates: { lat: 33.923484, lng: -84.34068 }, kind: "landmark", neighborhood: "Dunwoody", isChain: false },
  { id: "atl-qa-starbucks-dunwoody", name: "Starbucks", address: "4400 Ashford Dunwoody Rd NE", coordinates: { lat: 33.923812, lng: -84.340859 }, kind: "coffee", neighborhood: "Dunwoody", isChain: true },
  { id: "atl-qa-kroger-dunwoody", name: "Kroger", address: "2090 Dunwoody Club Dr", coordinates: { lat: 33.960555, lng: -84.301169 }, kind: "grocery", neighborhood: "Dunwoody", isChain: true },
  { id: "atl-qa-battery-atlanta-smyrna", name: "The Battery Atlanta", address: "800 Battery Ave SE", coordinates: { lat: 33.88976, lng: -84.468516 }, kind: "landmark", neighborhood: "Smyrna", isChain: false },
  { id: "atl-qa-quiktrip-smyrna", name: "QuikTrip", address: "2180 Windy Hill Rd SE", coordinates: { lat: 33.900849, lng: -84.490546 }, kind: "gas_station", neighborhood: "Smyrna", isChain: true },
  { id: "atl-qa-publix-smyrna", name: "Publix", address: "2955 Atlanta Rd SE", coordinates: { lat: 33.881602, lng: -84.512057 }, kind: "grocery", neighborhood: "Smyrna", isChain: true },
  { id: "atl-qa-marietta-square", name: "Marietta Square", address: "50 N Park Sq NE", coordinates: { lat: 33.952754, lng: -84.549616 }, kind: "landmark", neighborhood: "Marietta", isChain: false },
  { id: "atl-qa-kennestone-marietta", name: "Wellstar Kennestone Hospital", address: "677 Church St NE", coordinates: { lat: 33.968598, lng: -84.552905 }, kind: "hospital", neighborhood: "Marietta", isChain: false },
  { id: "atl-qa-marietta-square-market", name: "Marietta Square Market", address: "68 N Marietta Pkwy NW", coordinates: { lat: 33.954264, lng: -84.551459 }, kind: "restaurant", neighborhood: "Marietta", isChain: false },
  { id: "atl-qa-roswell-area-park", name: "Roswell Area Park", address: "10495 Woodstock Rd", coordinates: { lat: 34.037877, lng: -84.365482 }, kind: "park", neighborhood: "Roswell", isChain: false },
  { id: "atl-qa-kroger-roswell", name: "Kroger", address: "900 Marietta Hwy", coordinates: { lat: 34.004061, lng: -84.389622 }, kind: "grocery", neighborhood: "Roswell", isChain: true },
  { id: "atl-qa-starbucks-roswell", name: "Starbucks", address: "10800 Alpharetta Hwy", coordinates: { lat: 34.043219, lng: -84.34164 }, kind: "coffee", neighborhood: "Roswell", isChain: true },
  { id: "atl-qa-avalon-alpharetta", name: "Avalon", address: "2200 Avalon Blvd", coordinates: { lat: 34.070765, lng: -84.277133 }, kind: "landmark", neighborhood: "Alpharetta", isChain: false },
  { id: "atl-qa-wills-park-alpharetta", name: "Wills Park", address: "11925 Wills Rd", coordinates: { lat: 34.069496, lng: -84.307453 }, kind: "park", neighborhood: "Alpharetta", isChain: false },
  { id: "atl-qa-costco-alpharetta", name: "Costco", address: "2855 Jordan Ct", coordinates: { lat: 34.090549, lng: -84.277692 }, kind: "grocery", neighborhood: "Alpharetta", isChain: true },
  { id: "atl-qa-brownwood-park-east-atlanta", name: "Brownwood Park", address: "607 Brownwood Ave SE", coordinates: { lat: 33.737616, lng: -84.346921 }, kind: "park", neighborhood: "East Atlanta", isChain: false },
  { id: "atl-qa-mcdonalds-east-atlanta", name: "McDonald's", address: "443 Moreland Ave SE", coordinates: { lat: 33.741807, lng: -84.349598 }, kind: "restaurant", neighborhood: "East Atlanta", isChain: true },
  { id: "atl-qa-argosy-east-atlanta", name: "Argosy", address: "470 Flat Shoals Ave SE", coordinates: { lat: 33.741331, lng: -84.346212 }, kind: "restaurant", neighborhood: "East Atlanta", isChain: false },
  { id: "atl-qa-ponce-city-market-o4w", name: "Ponce City Market", address: "675 Ponce de Leon Ave NE", coordinates: { lat: 33.77244, lng: -84.365203 }, kind: "landmark", neighborhood: "Old Fourth Ward", isChain: false },
  { id: "atl-qa-historic-fourth-ward-park-o4w", name: "Historic Fourth Ward Park", address: "680 Dallas St NE", coordinates: { lat: 33.768082, lng: -84.365051 }, kind: "park", neighborhood: "Old Fourth Ward", isChain: false },
  { id: "atl-qa-krog-street-market-o4w", name: "Krog Street Market", address: "99 Krog St NE", coordinates: { lat: 33.756992, lng: -84.364015 }, kind: "landmark", neighborhood: "Old Fourth Ward", isChain: false },
  { id: "atl-qa-murphys-virginia-highland", name: "Murphy's", address: "997 Virginia Ave NE", coordinates: { lat: 33.782058, lng: -84.354875 }, kind: "restaurant", neighborhood: "Virginia-Highland", isChain: false },
  { id: "atl-qa-highland-tap-virginia-highland", name: "Highland Tap", address: "1026 N Highland Ave NE", coordinates: { lat: 33.782529, lng: -84.354534 }, kind: "restaurant", neighborhood: "Virginia-Highland", isChain: false },
  { id: "atl-qa-cvs-virginia-highland", name: "CVS Pharmacy", address: "865 N Highland Ave NE", coordinates: { lat: 33.778345, lng: -84.352284 }, kind: "pharmacy", neighborhood: "Virginia-Highland", isChain: true },
  { id: "atl-qa-vortex-little-five-points", name: "The Vortex Bar & Grill", address: "438 Moreland Ave NE", coordinates: { lat: 33.766255, lng: -84.349211 }, kind: "restaurant", neighborhood: "Little Five Points", isChain: false },
  { id: "atl-qa-variety-playhouse-little-five-points", name: "Variety Playhouse", address: "1099 Euclid Ave NE", coordinates: { lat: 33.76351, lng: -84.350855 }, kind: "landmark", neighborhood: "Little Five Points", isChain: false },
  { id: "atl-qa-little-five-points-pharmacy", name: "Little 5 Points Pharmacy", address: "484 Moreland Ave NE", coordinates: { lat: 33.767583, lng: -84.34935 }, kind: "pharmacy", neighborhood: "Little Five Points", isChain: false },
];
