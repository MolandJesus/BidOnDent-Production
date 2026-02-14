/**
 * ============================================================================
 * 🔐 ADMIN CONFIGURATION
 * ============================================================================
 *
 * This file centralizes admin account functionality for Bidondent.
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
 * Super admin account email
 */
export const SUPER_ADMIN_EMAIL = "molalign5@gmail.com";

/**
 * Admin password (for reference - stored in Clerk)
 * Email: bidondent@gmail.com
 * Password: (set during Clerk signup)
 */

const ADMIN_EMAILS = [ADMIN_EMAIL, SUPER_ADMIN_EMAIL].map((email) => email.toLowerCase());

/**
 * Admin password for switching accounts (dev/test only)
 * In production, this would be removed entirely
 */
export const ADMIN_SWITCH_PASSWORD = "admin123";

/**
 * Check if the given email is the main admin account
 */
export function isAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Check if the given email is the super admin (molalign5@gmail.com)
 * Super admin has special privileges like promoting other admins
 */
export function isSuperAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}
