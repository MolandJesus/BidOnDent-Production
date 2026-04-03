import { describe, expect, it } from "vitest";

import { ADMIN_EMAIL, TEST_ACCOUNTS } from "../config/adminConfig";
import {
  ADMIN_EMAIL_EXPORT,
  ADMIN_LINKED_ACCOUNTS,
  canSwitchToAdminAccount,
  getLinkedAccountInfo,
  hasAdminPrivileges,
  isAdmin,
  isLinkedAccount,
} from "./adminCheck";

describe("adminCheck compatibility helpers", () => {
  it("re-exports the canonical admin identity constants", () => {
    expect(ADMIN_EMAIL_EXPORT).toBe(ADMIN_EMAIL);
    expect(ADMIN_LINKED_ACCOUNTS).toEqual(TEST_ACCOUNTS);
  });

  it("keeps legacy admin and linked-account checks aligned with adminConfig", () => {
    const linkedAccount = TEST_ACCOUNTS[0];

    expect(isAdmin(ADMIN_EMAIL.toUpperCase())).toBe(true);
    expect(isLinkedAccount(linkedAccount.email.toUpperCase())).toBe(true);
    expect(isLinkedAccount(ADMIN_EMAIL)).toBe(false);
    expect(hasAdminPrivileges(linkedAccount.email)).toBe(true);
    expect(hasAdminPrivileges("someone@example.com")).toBe(false);
  });

  it("returns linked account metadata and switch permissions", () => {
    const linkedAccount = TEST_ACCOUNTS[1];

    expect(getLinkedAccountInfo(linkedAccount.email.toUpperCase())).toEqual(linkedAccount);
    expect(getLinkedAccountInfo(undefined)).toBeUndefined();
    expect(canSwitchToAdminAccount(linkedAccount.email)).toBe(true);
    expect(canSwitchToAdminAccount(ADMIN_EMAIL)).toBe(false);
  });
});
