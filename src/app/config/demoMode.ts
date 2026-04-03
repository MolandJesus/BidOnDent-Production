/**
 * Demo Mode Configuration
 *
 * DEMO_MODE is controlled via the VITE_DEMO_MODE env var.
 * - In production builds: defaults to false (real Supabase data only).
 * - In local dev: set VITE_DEMO_MODE=true in .env.local to enable demo fallback.
 */

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

/**
 * Demo password — set via VITE_DEMO_PASSWORD env var.
 * Never hardcode credentials in source control.
 */
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD ?? "";

export const DEMO_CONFIG = {
  // Show demo banner at top of app
  showBanner: true,

  // Pre-loaded demo accounts
  demoAccounts: {
    customer: {
      email: "customer@demo.com",
      password: DEMO_PASSWORD,
      name: "Demo Customer",
    },
    shop: {
      email: "shop@demo.com",
      password: DEMO_PASSWORD,
      name: "Demo Auto Shop",
    },
    insurer: {
      email: "insurer@demo.com",
      password: DEMO_PASSWORD,
      name: "Demo Insurance Co.",
    },
  },

  // Messages
  messages: {
    oAuthDisabled:
      "OAuth sign-in is not available in demo mode. Use demo@bidondent.com or create a new account.",
    demoNotice: "🎭 DEMO MODE - All data stored locally in browser",
    welcomeMessage: "Welcome to BidOnDent Demo! Use a demo account to explore.",
  },
};
