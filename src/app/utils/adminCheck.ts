/**
 * Admin utilities for Bidondent
 *
 * 🚨 PRODUCTION REMOVAL: Delete this file when removing admin features
 * See /src/app/config/adminConfig.ts for complete removal instructions
 */

import {
  ADMIN_EMAIL,
  TEST_ACCOUNTS,
  isAdmin as configIsAdmin,
  isTestAccount,
  hasAdminPrivileges as configHasAdminPrivileges,
  getTestAccountInfo as configGetTestAccountInfo,
  canSwitchToAdmin,
} from "../config/adminConfig";

// Re-export for backwards compatibility
export const ADMIN_EMAIL_EXPORT = ADMIN_EMAIL;
export const ADMIN_LINKED_ACCOUNTS = TEST_ACCOUNTS;

/**
 * Check if the given email is the admin account
 */
export function isAdmin(email: string | undefined): boolean {
  return configIsAdmin(email);
}

/**
 * Check if the given email is a linked test account
 */
export function isLinkedAccount(email: string | undefined): boolean {
  return isTestAccount(email);
}

/**
 * Get linked account info
 */
export function getLinkedAccountInfo(email: string | undefined) {
  return configGetTestAccountInfo(email);
}

/**
 * Check if user has admin privileges (either admin or linked account)
 */
export function hasAdminPrivileges(email: string | undefined): boolean {
  return configHasAdminPrivileges(email);
}

/**
 * Check if test account can switch to admin account
 */
export function canSwitchToAdminAccount(email: string | undefined): boolean {
  return canSwitchToAdmin(email);
}
