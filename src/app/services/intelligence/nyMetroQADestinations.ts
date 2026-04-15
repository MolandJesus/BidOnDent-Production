/**
 * Dev/QA-only NY metro destination pack for local navigation testing.
 * This dataset is intentionally separate from marketplace shop seeds.
 * Covers Westchester, Rockland, Dutchess, Nassau, Orange, and Putnam counties.
 */

export type NYMetroQADestinationKind =
  | "restaurant"
  | "gas_station"
  | "grocery"
  | "coffee"
  | "landmark"
  | "hospital"
  | "pharmacy"
  | "park";

export type NYMetroQADestination = {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  kind: NYMetroQADestinationKind;
  neighborhood: string;
  isChain: boolean;
};

export const NY_METRO_QA_NEIGHBORHOODS = [
  "White Plains",
  "Yonkers",
  "New Rochelle",
  "Tarrytown",
  "Mount Kisco",
  "Nyack",
  "Spring Valley",
  "Poughkeepsie",
  "Beacon",
  "Garden City",
  "Great Neck",
  "Newburgh",
  "Middletown",
  "Carmel",
  "Cold Spring",
] as const;

export const NY_METRO_QA_DESTINATIONS: NYMetroQADestination[] = [
  // ── White Plains (Westchester) ────────────────────────────────────────
  {
    id: "ny-qa-starbucks-white-plains",
    name: "Starbucks",
    address: "230 Main St, White Plains",
    coordinates: { lat: 41.034, lng: -73.763 },
    kind: "coffee",
    neighborhood: "White Plains",
    isChain: true,
  },
  {
    id: "ny-qa-westchester-mall",
    name: "The Westchester Mall",
    address: "125 Westchester Ave, White Plains",
    coordinates: { lat: 41.028, lng: -73.761 },
    kind: "landmark",
    neighborhood: "White Plains",
    isChain: true,
  },
  {
    id: "ny-qa-white-plains-hospital",
    name: "White Plains Hospital",
    address: "41 E Post Rd, White Plains",
    coordinates: { lat: 41.031, lng: -73.768 },
    kind: "hospital",
    neighborhood: "White Plains",
    isChain: false,
  },

  // ── Yonkers (Westchester) ─────────────────────────────────────────────
  {
    id: "ny-qa-cross-county-yonkers",
    name: "Cross County Shopping Center",
    address: "2050 Cross County Shopping Ctr, Yonkers",
    coordinates: { lat: 40.921, lng: -73.87 },
    kind: "landmark",
    neighborhood: "Yonkers",
    isChain: true,
  },
  {
    id: "ny-qa-untermyer-park-yonkers",
    name: "Untermyer Park",
    address: "945 N Broadway, Yonkers",
    coordinates: { lat: 40.96, lng: -73.897 },
    kind: "park",
    neighborhood: "Yonkers",
    isChain: false,
  },
  {
    id: "ny-qa-getty-gas-yonkers",
    name: "Getty Gas",
    address: "1400 Central Park Ave, Yonkers",
    coordinates: { lat: 40.937, lng: -73.892 },
    kind: "gas_station",
    neighborhood: "Yonkers",
    isChain: true,
  },

  // ── New Rochelle (Westchester) ────────────────────────────────────────
  {
    id: "ny-qa-new-roc-city",
    name: "New Roc City",
    address: "33 LeCount Pl, New Rochelle",
    coordinates: { lat: 40.912, lng: -73.782 },
    kind: "landmark",
    neighborhood: "New Rochelle",
    isChain: false,
  },
  {
    id: "ny-qa-cvs-new-rochelle",
    name: "CVS Pharmacy",
    address: "555 Main St, New Rochelle",
    coordinates: { lat: 40.911, lng: -73.784 },
    kind: "pharmacy",
    neighborhood: "New Rochelle",
    isChain: true,
  },
  {
    id: "ny-qa-montefiore-new-rochelle",
    name: "Montefiore New Rochelle Hospital",
    address: "16 Guion Pl, New Rochelle",
    coordinates: { lat: 40.916, lng: -73.776 },
    kind: "hospital",
    neighborhood: "New Rochelle",
    isChain: false,
  },

  // ── Tarrytown (Westchester) ───────────────────────────────────────────
  {
    id: "ny-qa-lyndhurst-tarrytown",
    name: "Lyndhurst Mansion",
    address: "635 S Broadway, Tarrytown",
    coordinates: { lat: 41.059, lng: -73.851 },
    kind: "landmark",
    neighborhood: "Tarrytown",
    isChain: false,
  },
  {
    id: "ny-qa-starbucks-tarrytown",
    name: "Starbucks",
    address: "89 N Broadway, Tarrytown",
    coordinates: { lat: 41.076, lng: -73.858 },
    kind: "coffee",
    neighborhood: "Tarrytown",
    isChain: true,
  },
  {
    id: "ny-qa-shoprite-tarrytown",
    name: "ShopRite",
    address: "60 Old Saw Mill River Rd, Tarrytown",
    coordinates: { lat: 41.083, lng: -73.861 },
    kind: "grocery",
    neighborhood: "Tarrytown",
    isChain: true,
  },

  // ── Mount Kisco (Westchester) ─────────────────────────────────────────
  {
    id: "ny-qa-northern-westchester-hospital",
    name: "Northern Westchester Hospital",
    address: "400 E Main St, Mount Kisco",
    coordinates: { lat: 41.204, lng: -73.727 },
    kind: "hospital",
    neighborhood: "Mount Kisco",
    isChain: false,
  },
  {
    id: "ny-qa-starbucks-mount-kisco",
    name: "Starbucks",
    address: "195 N Bedford Rd, Mount Kisco",
    coordinates: { lat: 41.209, lng: -73.724 },
    kind: "coffee",
    neighborhood: "Mount Kisco",
    isChain: true,
  },
  {
    id: "ny-qa-mount-kisco-library",
    name: "Mount Kisco Public Library",
    address: "100 E Main St, Mount Kisco",
    coordinates: { lat: 41.205, lng: -73.728 },
    kind: "landmark",
    neighborhood: "Mount Kisco",
    isChain: false,
  },

  // ── Nyack (Rockland) ──────────────────────────────────────────────────
  {
    id: "ny-qa-hopper-house-nyack",
    name: "Edward Hopper House",
    address: "82 N Broadway, Nyack",
    coordinates: { lat: 41.091, lng: -73.919 },
    kind: "landmark",
    neighborhood: "Nyack",
    isChain: false,
  },
  {
    id: "ny-qa-strawberry-place-nyack",
    name: "Strawberry Place",
    address: "72 S Broadway, Nyack",
    coordinates: { lat: 41.088, lng: -73.917 },
    kind: "restaurant",
    neighborhood: "Nyack",
    isChain: false,
  },
  {
    id: "ny-qa-memorial-park-nyack",
    name: "Memorial Park",
    address: "20 Depew Ave, Nyack",
    coordinates: { lat: 41.089, lng: -73.92 },
    kind: "park",
    neighborhood: "Nyack",
    isChain: false,
  },

  // ── Spring Valley (Rockland) ──────────────────────────────────────────
  {
    id: "ny-qa-shoprite-spring-valley",
    name: "ShopRite",
    address: "45 Memorial Dr, Spring Valley",
    coordinates: { lat: 41.113, lng: -74.044 },
    kind: "grocery",
    neighborhood: "Spring Valley",
    isChain: true,
  },
  {
    id: "ny-qa-marketplace-spring-valley",
    name: "Spring Valley Marketplace",
    address: "55 N Main St, Spring Valley",
    coordinates: { lat: 41.115, lng: -74.043 },
    kind: "landmark",
    neighborhood: "Spring Valley",
    isChain: false,
  },
  {
    id: "ny-qa-shell-spring-valley",
    name: "Shell",
    address: "2 N Main St, Spring Valley",
    coordinates: { lat: 41.114, lng: -74.042 },
    kind: "gas_station",
    neighborhood: "Spring Valley",
    isChain: true,
  },

  // ── Poughkeepsie (Dutchess) ───────────────────────────────────────────
  {
    id: "ny-qa-walkway-poughkeepsie",
    name: "Walkway Over the Hudson",
    address: "61 Parker Ave, Poughkeepsie",
    coordinates: { lat: 41.714, lng: -73.94 },
    kind: "landmark",
    neighborhood: "Poughkeepsie",
    isChain: false,
  },
  {
    id: "ny-qa-marist-poughkeepsie",
    name: "Marist College",
    address: "3399 North Rd, Poughkeepsie",
    coordinates: { lat: 41.721, lng: -73.933 },
    kind: "landmark",
    neighborhood: "Poughkeepsie",
    isChain: false,
  },
  {
    id: "ny-qa-galleria-poughkeepsie",
    name: "Poughkeepsie Galleria",
    address: "2001 South Rd, Poughkeepsie",
    coordinates: { lat: 41.654, lng: -73.902 },
    kind: "landmark",
    neighborhood: "Poughkeepsie",
    isChain: true,
  },

  // ── Beacon (Dutchess) ─────────────────────────────────────────────────
  {
    id: "ny-qa-dia-beacon",
    name: "Dia:Beacon",
    address: "3 Beekman St, Beacon",
    coordinates: { lat: 41.505, lng: -73.97 },
    kind: "landmark",
    neighborhood: "Beacon",
    isChain: false,
  },
  {
    id: "ny-qa-bank-square-beacon",
    name: "Bank Square Coffeehouse",
    address: "129 Main St, Beacon",
    coordinates: { lat: 41.504, lng: -73.966 },
    kind: "coffee",
    neighborhood: "Beacon",
    isChain: false,
  },
  {
    id: "ny-qa-long-dock-park-beacon",
    name: "Long Dock Park",
    address: "23 Long Dock Rd, Beacon",
    coordinates: { lat: 41.5, lng: -73.98 },
    kind: "park",
    neighborhood: "Beacon",
    isChain: false,
  },

  // ── Garden City (Nassau) ──────────────────────────────────────────────
  {
    id: "ny-qa-roosevelt-field-garden-city",
    name: "Roosevelt Field Mall",
    address: "630 Old Country Rd, Garden City",
    coordinates: { lat: 40.727, lng: -73.612 },
    kind: "landmark",
    neighborhood: "Garden City",
    isChain: true,
  },
  {
    id: "ny-qa-adelphi-garden-city",
    name: "Adelphi University",
    address: "1 South Ave, Garden City",
    coordinates: { lat: 40.721, lng: -73.637 },
    kind: "landmark",
    neighborhood: "Garden City",
    isChain: false,
  },
  {
    id: "ny-qa-garden-city-hotel",
    name: "Garden City Hotel",
    address: "45 Seventh St, Garden City",
    coordinates: { lat: 40.727, lng: -73.634 },
    kind: "restaurant",
    neighborhood: "Garden City",
    isChain: false,
  },

  // ── Great Neck (Nassau) ───────────────────────────────────────────────
  {
    id: "ny-qa-plaza-great-neck",
    name: "Great Neck Plaza",
    address: "1 Middle Neck Rd, Great Neck",
    coordinates: { lat: 40.801, lng: -73.728 },
    kind: "landmark",
    neighborhood: "Great Neck",
    isChain: false,
  },
  {
    id: "ny-qa-trader-joes-great-neck",
    name: "Trader Joe's",
    address: "20 E Shore Rd, Great Neck",
    coordinates: { lat: 40.803, lng: -73.73 },
    kind: "grocery",
    neighborhood: "Great Neck",
    isChain: true,
  },
  {
    id: "ny-qa-kings-point-park",
    name: "Kings Point Park",
    address: "1 Redbrook Rd, Great Neck",
    coordinates: { lat: 40.824, lng: -73.739 },
    kind: "park",
    neighborhood: "Great Neck",
    isChain: false,
  },

  // ── Newburgh (Orange) ─────────────────────────────────────────────────
  {
    id: "ny-qa-waterfront-newburgh",
    name: "Newburgh Waterfront",
    address: "1 Washington St, Newburgh",
    coordinates: { lat: 41.503, lng: -74.01 },
    kind: "landmark",
    neighborhood: "Newburgh",
    isChain: false,
  },
  {
    id: "ny-qa-dunkin-newburgh",
    name: "Dunkin'",
    address: "1 N Robinson Ave, Newburgh",
    coordinates: { lat: 41.501, lng: -74.013 },
    kind: "coffee",
    neighborhood: "Newburgh",
    isChain: true,
  },
  {
    id: "ny-qa-st-lukes-newburgh",
    name: "St. Luke's Cornwall Hospital",
    address: "70 Dubois St, Newburgh",
    coordinates: { lat: 41.499, lng: -74.005 },
    kind: "hospital",
    neighborhood: "Newburgh",
    isChain: false,
  },

  // ── Middletown (Orange) ───────────────────────────────────────────────
  {
    id: "ny-qa-crystal-run-middletown",
    name: "Galleria at Crystal Run",
    address: "1 Galleria Dr, Middletown",
    coordinates: { lat: 41.451, lng: -74.384 },
    kind: "landmark",
    neighborhood: "Middletown",
    isChain: true,
  },
  {
    id: "ny-qa-thrall-park-middletown",
    name: "Thrall Park",
    address: "11 Depot St, Middletown",
    coordinates: { lat: 41.446, lng: -74.422 },
    kind: "park",
    neighborhood: "Middletown",
    isChain: false,
  },
  {
    id: "ny-qa-shoprite-middletown",
    name: "ShopRite",
    address: "420 Route 211 E, Middletown",
    coordinates: { lat: 41.453, lng: -74.392 },
    kind: "grocery",
    neighborhood: "Middletown",
    isChain: true,
  },

  // ── Carmel (Putnam) ───────────────────────────────────────────────────
  {
    id: "ny-qa-golf-course-carmel",
    name: "Putnam County Golf Course",
    address: "187 Hill St, Carmel",
    coordinates: { lat: 41.431, lng: -73.683 },
    kind: "park",
    neighborhood: "Carmel",
    isChain: false,
  },
  {
    id: "ny-qa-town-center-carmel",
    name: "Carmel Town Center",
    address: "60 McAlpin Ave, Carmel",
    coordinates: { lat: 41.432, lng: -73.68 },
    kind: "landmark",
    neighborhood: "Carmel",
    isChain: false,
  },
  {
    id: "ny-qa-reed-library-carmel",
    name: "Reed Memorial Library",
    address: "1733 Route 6, Carmel",
    coordinates: { lat: 41.43, lng: -73.69 },
    kind: "landmark",
    neighborhood: "Carmel",
    isChain: false,
  },

  // ── Cold Spring (Putnam) ──────────────────────────────────────────────
  {
    id: "ny-qa-main-st-cold-spring",
    name: "Cold Spring Main Street",
    address: "75 Main St, Cold Spring",
    coordinates: { lat: 41.42, lng: -73.955 },
    kind: "landmark",
    neighborhood: "Cold Spring",
    isChain: false,
  },
  {
    id: "ny-qa-foundry-park-cold-spring",
    name: "Foundry Dock Park",
    address: "10 Kemble Ave, Cold Spring",
    coordinates: { lat: 41.417, lng: -73.958 },
    kind: "park",
    neighborhood: "Cold Spring",
    isChain: false,
  },
  {
    id: "ny-qa-riverview-cold-spring",
    name: "Riverview Restaurant",
    address: "45 Fair St, Cold Spring",
    coordinates: { lat: 41.419, lng: -73.957 },
    kind: "restaurant",
    neighborhood: "Cold Spring",
    isChain: false,
  },
];
