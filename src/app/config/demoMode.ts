/**
 * Demo Mode Configuration
 * Set to true to disable all Supabase functionality and use localStorage instead
 */

export const DEMO_MODE = true;

export const DEMO_CONFIG = {
  // Show demo banner at top of app
  showBanner: true,
  
  // Pre-loaded demo accounts
  demoAccounts: {
    customer: {
      email: 'customer@demo.com',
      password: 'demo123',
      name: 'Demo Customer'
    },
    shop: {
      email: 'shop@demo.com',
      password: 'demo123',
      name: 'Demo Auto Shop'
    },
    insurer: {
      email: 'insurer@demo.com',
      password: 'demo123',
      name: 'Demo Insurance Co.'
    }
  },
  
  // Messages
  messages: {
    oAuthDisabled: 'OAuth sign-in is not available in demo mode. Use demo@bidondent.com or create a new account.',
    demoNotice: '🎭 DEMO MODE - All data stored locally in browser',
    welcomeMessage: 'Welcome to BidOnDent Demo! Try customer@demo.com / demo123'
  }
};
