import { describe, expect, it } from "vitest";

import {
  ADMIN_EMAIL,
  TEST_ACCOUNTS,
  TEST_ACCOUNT_EMAILS,
  canSwitchToAdmin,
  getTestAccountInfo,
  hasAdminPrivileges,
  isAdmin,
  isSuperAdmin,
  isTestAccount,
} from "./adminConfig";

describe("adminConfig account guards", () => {
  it("treats the configured admin email as case-insensitive", () => {
    expect(isAdmin(ADMIN_EMAIL)).toBe(true);
    expect(isAdmin(ADMIN_EMAIL.toUpperCase())).toBe(true);
    expect(isSuperAdmin(ADMIN_EMAIL.toUpperCase())).toBe(true);
    expect(isAdmin("customer@example.com")).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });

  it("recognizes only linked test accounts as test identities", () => {
    for (const email of TEST_ACCOUNT_EMAILS) {
      expect(isTestAccount(email)).toBe(true);
      expect(isTestAccount(email.toUpperCase())).toBe(true);
    }

    expect(isTestAccount(ADMIN_EMAIL)).toBe(false);
    expect(isTestAccount("someone@example.com")).toBe(false);
    expect(isTestAccount(undefined)).toBe(false);
  });

  it("returns the matching linked account metadata by email", () => {
    const testAccount = TEST_ACCOUNTS[0];

    expect(getTestAccountInfo(testAccount.email.toUpperCase())).toEqual(testAccount);
    expect(getTestAccountInfo("missing@example.com")).toBeUndefined();
    expect(getTestAccountInfo(undefined)).toBeUndefined();
  });

  it("grants admin privileges to the admin and linked test accounts only", () => {
    expect(hasAdminPrivileges(ADMIN_EMAIL)).toBe(true);
    expect(hasAdminPrivileges(TEST_ACCOUNTS[1].email)).toBe(true);
    expect(hasAdminPrivileges("someone@example.com")).toBe(false);
    expect(hasAdminPrivileges(undefined)).toBe(false);
  });

  it("allows only linked test accounts to switch back to admin", () => {
    expect(canSwitchToAdmin(TEST_ACCOUNTS[2].email)).toBe(true);
    expect(canSwitchToAdmin(TEST_ACCOUNTS[2].email.toUpperCase())).toBe(true);
    expect(canSwitchToAdmin(ADMIN_EMAIL)).toBe(false);
    expect(canSwitchToAdmin("someone@example.com")).toBe(false);
    expect(canSwitchToAdmin(undefined)).toBe(false);
  });
});
