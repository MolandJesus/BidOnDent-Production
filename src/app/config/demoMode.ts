/**
 * Demo Mode Configuration
 * Set to true to disable all Supabase functionality and use localStorage instead
 */

export const DEMO_MODE = true;

/**
 * Demo password — set via VITE_DEMO_PASSWORD env var.
 * Never hardcode credentials in source control.
 */
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD ?? '';

export const DEMO_CONFIG = {
  // Show demo banner at top of app
  showBanner: true,
  
  // Pre-loaded demo accounts
  demoAccounts: {
    customer: {
      email: 'customer@demo.com',
      password: DEMO_PASSWORD,
      name: 'Demo Customer'
    },
    shop: {
      email: 'shop@demo.com',
      password: DEMO_PASSWORD,
      name: 'Demo Auto Shop'
    },
    insurer: {
      email: 'insurer@demo.com',
      password: DEMO_PASSWORD,
      name: 'Demo Insurance Co.'
    }
  },
  
  // Messages
  messages: {
    oAuthDisabled: 'OAuth sign-in is not available in demo mode. Use demo@bidondent.com or create a new account.',
    demoNotice: '🎭 DEMO MODE - All data stored locally in browser',
    welcomeMessage: 'Welcome to BidOnDent Demo! Use a demo account to explore.'
  }
};
