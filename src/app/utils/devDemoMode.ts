/**
 * Dev-only demo mode bypass for the autonomous visual-audit workflow.
 *
 * Activated by `?demo=customer` on a DEV build (`import.meta.env.DEV === true`).
 * Bypasses Clerk + Supabase entirely so a browser-automation agent can inspect
 * customer dashboard surfaces without burning real auth credentials.
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
import { SEED_DAMAGE_REPORTS, SEED_DEMO_BIDS, LANDING_PAGE_IMAGES } from "../constants";
import type { DashboardAppearanceMode } from "../routers/dashboard-router-types";

const DEMO_QUERY_KEY = "demo";
const DEMO_MODE_QUERY_KEY = "mode";

export type DevDemoAccountType = "customer";

/**
 * Read `?demo=customer` from the current URL.
 * Returns null on production builds or when the param is absent / unrecognized.
 */
export function readDevDemoMode(): DevDemoAccountType | null {
  if (!import.meta.env.DEV) return null;
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const value = params.get(DEMO_QUERY_KEY);
  return value === "customer" ? "customer" : null;
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
  profileImage: LANDING_PAGE_IMAGES.DEFAULT_PROFILE,
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
