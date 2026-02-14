/* CLERK CONFIGURATION - Add your Clerk Publishable Key here */

// Get your Publishable Key from: https://dashboard.clerk.com
// It's safe to expose this key - it's meant to be public (like Supabase anon key)
export const clerkPublishableKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ||
  "pk_test_am9pbnQtb2FyZmlzaC0yMy5jbGVyay5hY2NvdW50cy5kZXYk";
