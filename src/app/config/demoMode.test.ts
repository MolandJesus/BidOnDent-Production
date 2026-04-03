import { describe, expect, it } from "vitest";

import { DEMO_CONFIG, DEMO_MODE } from "./demoMode";

describe("demoMode config", () => {
  it("exports a boolean feature flag", () => {
    expect(typeof DEMO_MODE).toBe("boolean");
  });

  it("keeps the demo banner and account scaffolding enabled", () => {
    expect(DEMO_CONFIG.showBanner).toBe(true);
    expect(DEMO_CONFIG.demoAccounts.customer.email).toBe("customer@demo.com");
    expect(DEMO_CONFIG.demoAccounts.shop.email).toBe("shop@demo.com");
    expect(DEMO_CONFIG.demoAccounts.insurer.email).toBe("insurer@demo.com");
  });

  it("uses a consistent password source across all demo accounts", () => {
    const { customer, shop, insurer } = DEMO_CONFIG.demoAccounts;

    expect(typeof customer.password).toBe("string");
    expect(shop.password).toBe(customer.password);
    expect(insurer.password).toBe(customer.password);
  });

  it("exposes non-empty operator-facing demo messages", () => {
    expect(DEMO_CONFIG.messages.oAuthDisabled.length).toBeGreaterThan(20);
    expect(DEMO_CONFIG.messages.demoNotice).toContain("DEMO MODE");
    expect(DEMO_CONFIG.messages.welcomeMessage).toContain("BidOnDent Demo");
  });
});
