/**
 * Dev-only demo mode bypass for the autonomous visual-audit workflow.
 *
 * Activated by `?demo=customer` or `?demo=shop` on a DEV build
 * (`import.meta.env.DEV === true`). Bypasses Clerk + Supabase entirely so
 * a browser-automation agent can inspect dashboard surfaces without burning
 * real auth credentials.
 *
 * NEVER ships to production: gated on `import.meta.env.DEV` AND a query-string
 * opt-in. A hardened build won't honor the param.
 */
import type { UserProfile } from "../services/clerkService";
import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import type {
  Bid,
  DamageReport,
  Notification,
  UserInfo,
  Vehicle,
} from "../types";
import { SEED_DAMAGE_REPORTS, SEED_DEMO_BIDS } from "../constants";
import type { DashboardAppearanceMode } from "../routers/dashboard-router-types";

const DEMO_QUERY_KEY = "demo";
const DEMO_MODE_QUERY_KEY = "mode";

export type DevDemoAccountType = "customer" | "shop";

/**
 * Read `?demo=customer` or `?demo=shop` from the current URL.
 * Returns null on production builds or when the param is absent / unrecognized.
 */
export function readDevDemoMode(): DevDemoAccountType | null {
  if (!import.meta.env.DEV) return null;
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const value = params.get(DEMO_QUERY_KEY);
  if (value === "customer") return "customer";
  if (value === "shop") return "shop";
  return null;
}

/**
 * Read `?mode=light` or `?mode=dark` for a one-shot appearance override.
 * Returns null when the param is absent or invalid.
 */
export function readDevDemoAppearanceOverride(): DashboardAppearanceMode | null {
  if (!import.meta.env.DEV) return null;
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const value = params.get(DEMO_MODE_QUERY_KEY);
  if (value === "light") return "light";
  if (value === "dark" || value === "map-dark") return "map-dark";
  return null;
}

/**
 * Strip the demo query params and reload at `/` so the landing page renders normally.
 */
export function exitDevDemoMode() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete(DEMO_QUERY_KEY);
  url.searchParams.delete(DEMO_MODE_QUERY_KEY);
  url.hash = "";
  window.location.replace(url.toString());
}

export const DEMO_USER_PROFILE: UserProfile = {
  id: "demo-customer-id",
  email: "demo@bidondent.local",
  name: "Demo Customer",
  phone: "(555) 010-2024",
  user_type: "customer",
  account_setup_completed: true,
  profile_image_url: "",
  shop_name: "",
  company_name: "",
};

export const DEMO_USER_INFO: UserInfo = {
  name: DEMO_USER_PROFILE.name,
  email: DEMO_USER_PROFILE.email,
  profileImage: "",
};

export const DEMO_WEBSITE_IDENTITY: WebsiteIdentity = {
  provider: "anonymous",
  providerUserId: "demo-customer-id",
  normalizedEmail: DEMO_USER_PROFILE.email,
  displayName: DEMO_USER_PROFILE.name,
  websiteUserKey: "website-user-demo-customer",
  sessionId: "session-demo-customer",
};

export const DEMO_VEHICLES: Vehicle[] = [
  {
    id: "demo-vehicle-1",
    year: 2021,
    make: "Toyota",
    model: "Camry",
    color: "Silver",
    licensePlate: "DEMO-001",
    vin: "DEMO0000000000001",
  },
  {
    id: "demo-vehicle-2",
    year: 2019,
    make: "Honda",
    model: "CR-V",
    color: "Blue",
    licensePlate: "DEMO-002",
    vin: "DEMO0000000000002",
  },
];

/**
 * Seed reports + their demo bids merged so the customer Bids tab has real cards
 * to render. Re-uses the existing SEED_* constants so we don't duplicate fixtures.
 */
export const DEMO_REPORTS: DamageReport[] = SEED_DAMAGE_REPORTS.map((report) => {
  const reportBids = SEED_DEMO_BIDS[report.id] ?? [];
  return {
    ...report,
    bids: reportBids,
    bidsCount: reportBids.length,
  };
});

export const DEMO_BIDS: Bid[] = Object.values(SEED_DEMO_BIDS).flat();

export const DEMO_NOTIFICATIONS: Notification[] = [];

// ============================================================================
// SHOP DEMO FIXTURES
// ============================================================================

export const DEMO_SHOP_PROFILE: UserProfile = {
  id: "demo-shop-id",
  email: "shop@bidondent.local",
  name: "Demo Auto Body",
  phone: "(555) 020-2024",
  user_type: "shop",
  account_setup_completed: true,
  profile_image_url: "",
  shop_name: "Demo Auto Body",
  company_name: "",
};

export const DEMO_SHOP_USER_INFO: UserInfo = {
  name: DEMO_SHOP_PROFILE.name,
  email: DEMO_SHOP_PROFILE.email,
  profileImage: "",
};

export const DEMO_SHOP_WEBSITE_IDENTITY: WebsiteIdentity = {
  provider: "anonymous",
  providerUserId: "demo-shop-id",
  normalizedEmail: DEMO_SHOP_PROFILE.email,
  displayName: DEMO_SHOP_PROFILE.name,
  websiteUserKey: "website-user-demo-shop",
  sessionId: "session-demo-shop",
};

const NOW = Date.now();
const HOURS_AGO = (h: number) => new Date(NOW - h * 60 * 60 * 1000).toISOString();
const DAYS_AGO = (d: number) => new Date(NOW - d * 24 * 60 * 60 * 1000).toISOString();

/**
 * Seed reports for the shop dashboard. Status mix is intentional:
 * - 2 "pending" reports → ShopRequestsScreen sees them as "new" requests
 * - 1 "in-review" report with bids → "bidding" state
 * - 1 "active" report → ShopActiveJobsScreen sees it as in-progress
 * - 1 "completed" report → completed-job state for filter coverage
 *
 * Geographically clustered around White Plains, NY (default coverage center).
 */
export const DEMO_SHOP_REPORTS: DamageReport[] = [
  {
    id: "demo-shop-report-1",
    vehicleId: "demo-shop-vehicle-1",
    vehicleInfo: { year: "2022", make: "BMW", model: "330i" },
    damageAreas: ["Front Bumper"],
    damageArea: "Front Bumper",
    description:
      "Front bumper cover scraped against a parking-garage column. Plastic intact, paint heavily transferred. No mechanical damage.",
    status: "pending",
    createdAt: HOURS_AGO(1),
    submittedAt: HOURS_AGO(1),
    bidsCount: 0,
    photos: [],
    customerName: "Alex Park",
    customerEmail: "alex.park@example.com",
    customerPhone: "(914) 555-0145",
    zipCode: "10601",
    latitude: 41.0339,
    longitude: -73.7629,
    insuranceClaim: false,
    insuranceCompany: "",
  },
  {
    id: "demo-shop-report-2",
    vehicleId: "demo-shop-vehicle-2",
    vehicleInfo: { year: "2020", make: "Tesla", model: "Model 3" },
    damageAreas: ["Driver Door"],
    damageArea: "Driver Door",
    description:
      "Driver door has a 6-inch dent above the handle from a runaway shopping cart. Paint cracked along the impact line.",
    status: "pending",
    createdAt: HOURS_AGO(3),
    submittedAt: HOURS_AGO(3),
    bidsCount: 0,
    photos: [],
    customerName: "Jordan Lee",
    customerEmail: "jordan.lee@example.com",
    customerPhone: "(914) 555-0211",
    zipCode: "10605",
    latitude: 41.025,
    longitude: -73.745,
    insuranceClaim: true,
    insuranceCompany: "Geico",
    policyNumber: "POL-DEMO-7711",
  },
  {
    id: "demo-shop-report-3",
    vehicleId: "demo-shop-vehicle-3",
    vehicleInfo: { year: "2019", make: "Honda", model: "Accord" },
    damageAreas: ["Rear Quarter Panel"],
    damageArea: "Rear Quarter Panel",
    description:
      "Backed into a low retaining wall. Rear quarter panel dented and paint chipped over a 12-inch area.",
    status: "in-review",
    createdAt: HOURS_AGO(8),
    submittedAt: HOURS_AGO(8),
    bidsCount: 2,
    photos: [],
    customerName: "Sam Rivera",
    customerEmail: "sam.rivera@example.com",
    customerPhone: "(914) 555-0322",
    zipCode: "10583",
    latitude: 41.0223,
    longitude: -73.7688,
    insuranceClaim: false,
    insuranceCompany: "",
  },
  {
    id: "demo-shop-report-4",
    vehicleId: "demo-shop-vehicle-4",
    vehicleInfo: { year: "2021", make: "Toyota", model: "RAV4" },
    damageAreas: ["Hood"],
    damageArea: "Hood",
    description: "Hail damage — multiple small dents across hood and roof.",
    status: "active",
    createdAt: DAYS_AGO(2),
    submittedAt: DAYS_AGO(2),
    bidsCount: 1,
    bidAmount: 1850,
    photos: [],
    customerName: "Riley Chen",
    customerEmail: "riley.chen@example.com",
    customerPhone: "(914) 555-0488",
    zipCode: "10591",
    latitude: 41.0762,
    longitude: -73.8588,
    insuranceClaim: true,
    insuranceCompany: "State Farm",
    claimNumber: "CLM-DEMO-2261",
    assignmentId: "demo-assignment-4",
  },
  {
    id: "demo-shop-report-5",
    vehicleId: "demo-shop-vehicle-5",
    vehicleInfo: { year: "2018", make: "Ford", model: "F-150" },
    damageAreas: ["Tailgate"],
    damageArea: "Tailgate",
    description: "Tailgate dent repair — completed and delivered.",
    status: "completed",
    createdAt: DAYS_AGO(7),
    submittedAt: DAYS_AGO(7),
    bidsCount: 1,
    bidAmount: 720,
    photos: [],
    customerName: "Morgan Diaz",
    customerEmail: "morgan.diaz@example.com",
    customerPhone: "(914) 555-0512",
    zipCode: "10708",
    latitude: 40.9626,
    longitude: -73.8462,
    insuranceClaim: false,
    insuranceCompany: "",
    assignmentId: "demo-assignment-5",
  },
];

/** Bids the shop has submitted (or that exist on reports they're viewing). */
export const DEMO_SHOP_BIDS: Bid[] = [
  {
    id: "demo-shop-bid-3a",
    reportId: "demo-shop-report-3",
    shopId: "demo-shop-id",
    shopName: "Demo Auto Body",
    shopEmail: "shop@bidondent.local",
    amount: 1450,
    estimatedDays: 4,
    description: "Quarter panel re-shape, blend paint, clear coat. 6-month warranty on workmanship.",
    status: "pending",
    createdAt: HOURS_AGO(6),
    shopRating: 4.7,
    shopReviews: 64,
    shopDistance: "1.8 mi",
  },
  {
    id: "demo-shop-bid-4a",
    reportId: "demo-shop-report-4",
    shopId: "demo-shop-id",
    shopName: "Demo Auto Body",
    shopEmail: "shop@bidondent.local",
    amount: 1850,
    estimatedDays: 5,
    description: "PDR on hood and roof, no paint. Insurance-direct billing.",
    status: "accepted",
    createdAt: DAYS_AGO(2),
    shopRating: 4.7,
    shopReviews: 64,
    shopDistance: "3.4 mi",
  },
];
