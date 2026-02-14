/**
 * Admin utilities for Bidondent
 *
 * 🚨 PRODUCTION REMOVAL: Delete this file when removing admin features
 * See /src/app/config/adminConfig.ts for complete removal instructions
 */

import {
  ADMIN_EMAIL,
  SUPER_ADMIN_EMAIL,
  isAdmin as configIsAdmin,
  isSuperAdmin as configIsSuperAdmin,
} from "../config/adminConfig";

// Re-export for backwards compatibility
export const ADMIN_EMAIL_EXPORT = ADMIN_EMAIL;

/**
 * Check if the given email is the admin account
 */
export function isAdmin(email: string | undefined): boolean {
  return configIsAdmin(email);
}

/**
 * Check if the given email is the super admin account
 */
export function isSuperAdmin(email: string | undefined): boolean {
  return configIsSuperAdmin(email);
}
