/**
 * ============================================================================
 * 🔐 ADMIN & TEST ACCOUNT CONFIGURATION
 * ============================================================================
 *
 * This file centralizes all admin and test account functionality for Bidondent.
 *
 * 🚨 PRODUCTION REMOVAL INSTRUCTIONS:
 * ----------------------------------------------------------------------------
 * To remove admin features for production deployment:
 *
 * 1. DELETE this entire file: /src/app/config/adminConfig.ts
 * 2. DELETE /src/app/components/admin/AdminDashboard.tsx
 * 3. REMOVE admin-related imports from:
 *    - /src/app/App.tsx
 *    - /src/app/routers/DashboardRouter.tsx
 * 4. REMOVE the admin tab from ADMIN_NAV_TABS in /src/app/constants.ts
 * 5. REMOVE admin server routes from /supabase/functions/server/index.tsx
 * 6. SEARCH for "adminConfig" across the codebase and remove related code
 *
 * ============================================================================
 */

/**
 * Main admin account email (Figma Make Development Version)
 * NOTE: Use Bidondent@gmail.com as the main admin account
 */
export const ADMIN_EMAIL = "bidondent@gmail.com";

/**
 * Admin password (for reference - stored in Clerk)
 * Email: bidondent@gmail.com
 * Password: (set during Clerk signup)
 */

/**
 * Test accounts linked to the admin account
 * These accounts can switch back to the admin account
 */
export const TEST_ACCOUNTS = [
  {
    email: "figmaadmin+shop@bidondent.com",
    type: "shop" as const,
    label: "Test Shop Account",
    description: "Auto repair shop testing account",
  },
  {
    email: "figmaadmin+insurer@bidondent.com",
    type: "insurer" as const,
    label: "Test Insurer Account",
    description: "Insurance company testing account",
  },
  {
    email: "figmaadmin+customer@bidondent.com",
    type: "customer" as const,
    label: "Test Customer Account",
    description: "Customer testing account",
  },
];

/**
 * All test account emails (for easy lookup)
 */
export const TEST_ACCOUNT_EMAILS = TEST_ACCOUNTS.map((acc) => acc.email.toLowerCase());

/**
 * Admin password for switching accounts (dev/test only)
 * Tree-shaken from production builds via DEV guard
 */
export const ADMIN_SWITCH_PASSWORD: string = import.meta.env.DEV ? "admin123" : "";

/**
 * Check if the given email is the main admin account
 */
export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Check if the given email is the super admin (molalign5@gmail.com)
 * Super admin has special privileges like promoting other admins
 */
export function isSuperAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * Check if the given email is a test account (not including main admin)
 */
export function isTestAccount(email: string | undefined): boolean {
  if (!email) return false;
  return TEST_ACCOUNT_EMAILS.includes(email.toLowerCase());
}

/**
 * Check if user has any admin privileges (admin or test account)
 */
export function hasAdminPrivileges(email: string | undefined): boolean {
  if (!email) return false;
  return isAdmin(email) || isTestAccount(email);
}

/**
 * Get test account info by email
 */
export function getTestAccountInfo(email: string | undefined) {
  if (!email) return undefined;
  return TEST_ACCOUNTS.find((account) => account.email.toLowerCase() === email.toLowerCase());
}

/**
 * Check if a test account can switch to admin account
 * (only test accounts can do this, not regular user accounts)
 */
export function canSwitchToAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return isTestAccount(email);
}
