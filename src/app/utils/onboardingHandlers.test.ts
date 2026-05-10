/**
 * Tests for onboardingHandlers — Pass 211.
 *
 * Pure builders that translate raw onboarding form input into the
 * canonical business-profile payload shape passed to the persistence
 * layer. Covers shop + insurer paths and the small bits of derived
 * logic (specialties → averageTicketValue, insurance → insurer programs,
 * claim types → repair-program focus mirror).
 */
import { describe, expect, it, vi } from "vitest";

import { completeInsurerOnboarding, completeShopOnboarding } from "./onboardingHandlers";
import type { InsurerOnboardingFormData, ShopOnboardingFormData } from "../types";

function shopForm(overrides: Partial<ShopOnboardingFormData> = {}): ShopOnboardingFormData {
  return {
    shopName: "Quick Fix Auto",
    address: "1 Main St",
    city: "Atlanta",
    state: "GA",
    zip: "30303",
    phone: "555-0100",
    website: "https://quickfix.example",
    hours: "Mon-Fri 8-6",
    certifications: ["I-CAR"],
    specialties: ["Dent Repair"],
    insurance: true,
    estimates: true,
    ...overrides,
  };
}

function insurerForm(
  overrides: Partial<InsurerOnboardingFormData> = {}
): InsurerOnboardingFormData {
  return {
    companyName: "Acme Insurance",
    licenseNumber: "LIC-1234",
    address: "100 Insurance Way",
    city: "Atlanta",
    state: "GA",
    zip: "30303",
    phone: "555-0200",
    website: "https://acme-insurance.example",
    claimTypes: ["auto", "dent"],
    preferredShops: true,
    autoApproval: false,
    maxClaimAmount: "5000",
    ...overrides,
  };
}

describe("completeShopOnboarding", () => {
  it("invokes saveBusinessProfile with the canonical shop payload", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await completeShopOnboarding(shopForm(), save);

    expect(save).toHaveBeenCalledTimes(1);
    const payload = save.mock.calls[0][0];
    expect(payload.businessName).toBe("Quick Fix Auto");
    expect(payload.businessAddress).toBe("1 Main St");
    expect(payload.businessCity).toBe("Atlanta");
    expect(payload.businessState).toBe("GA");
    expect(payload.businessZip).toBe("30303");
    expect(payload.businessPhone).toBe("555-0100");
    expect(payload.businessHours).toBe("Mon-Fri 8-6");
    expect(payload.website).toBe("https://quickfix.example");
    expect(payload.certifications).toEqual(["I-CAR"]);
    expect(payload.specialties).toEqual(["Dent Repair"]);
    expect(payload.acceptsInsuranceClaims).toBe(true);
    expect(payload.offersEstimates).toBe(true);
    expect(payload.isAcceptingBids).toBe(true);
    expect(payload.isDirectoryVisible).toBe(true);
    expect(payload.profileImageUrl).toBeNull();
  });

  it("derives a Luxury averageTicketValue when specialties include 'Luxury Vehicles'", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await completeShopOnboarding(
      shopForm({ specialties: ["Dent Repair", "Luxury Vehicles"] }),
      save
    );
    expect(save.mock.calls[0][0].averageTicketValue).toBe(1050);
  });

  it("uses the standard averageTicketValue when no Luxury specialty", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await completeShopOnboarding(shopForm({ specialties: ["Dent Repair"] }), save);
    expect(save.mock.calls[0][0].averageTicketValue).toBe(890);
  });

  it("seeds insurerPrograms when insurance=true; empties when false", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await completeShopOnboarding(shopForm({ insurance: true }), save);
    expect(save.mock.calls[0][0].insurerPrograms).toEqual(["Progressive", "State Farm"]);

    save.mockClear();
    await completeShopOnboarding(shopForm({ insurance: false }), save);
    expect(save.mock.calls[0][0].insurerPrograms).toEqual([]);
  });

  it("defaults certifications/specialties to [] when missing", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await completeShopOnboarding(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shopForm({ certifications: undefined as any, specialties: undefined as any }),
      save
    );
    const payload = save.mock.calls[0][0];
    expect(payload.certifications).toEqual([]);
    expect(payload.specialties).toEqual([]);
  });

  it("converts empty website to null", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await completeShopOnboarding(shopForm({ website: "" }), save);
    expect(save.mock.calls[0][0].website).toBeNull();
  });

  it("propagates save errors", async () => {
    const save = vi.fn().mockRejectedValue(new Error("rls denied"));
    await expect(completeShopOnboarding(shopForm(), save)).rejects.toThrow("rls denied");
  });
});

describe("completeInsurerOnboarding", () => {
  it("invokes saveBusinessProfile with the canonical insurer payload", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await completeInsurerOnboarding(insurerForm(), save);

    expect(save).toHaveBeenCalledTimes(1);
    const payload = save.mock.calls[0][0];
    expect(payload.companyName).toBe("Acme Insurance");
    expect(payload.companyAddress).toBe("100 Insurance Way");
    expect(payload.companyCity).toBe("Atlanta");
    expect(payload.companyState).toBe("GA");
    expect(payload.companyZip).toBe("30303");
    expect(payload.companyPhone).toBe("555-0200");
    expect(payload.licenseNumber).toBe("LIC-1234");
    expect(payload.licenseState).toBe("GA");
    expect(payload.website).toBe("https://acme-insurance.example");
    expect(payload.claimTypes).toEqual(["auto", "dent"]);
    expect(payload.repairProgramFocus).toEqual(["auto", "dent"]);
    expect(payload.preferredShops).toBe(true);
    expect(payload.isDirectoryVisible).toBe(true);
    expect(payload.popular).toBe(false);
    expect(payload.profileImageUrl).toBeNull();
  });

  it("notes auto-approval state in accountConnectionNotes", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await completeInsurerOnboarding(insurerForm({ autoApproval: true }), save);
    expect(save.mock.calls[0][0].accountConnectionNotes).toContain(
      "Auto-approval is enabled for qualified claims"
    );
    expect(save.mock.calls[0][0].digitalClaimsExperience).toBe("excellent");

    save.mockClear();
    await completeInsurerOnboarding(insurerForm({ autoApproval: false }), save);
    expect(save.mock.calls[0][0].accountConnectionNotes).toContain(
      "Manual review stays in place for higher-touch claims"
    );
    expect(save.mock.calls[0][0].digitalClaimsExperience).toBe("strong");
  });

  it("converts maxClaimAmount string to number; passes null when empty", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await completeInsurerOnboarding(insurerForm({ maxClaimAmount: "12500" }), save);
    expect(save.mock.calls[0][0].maxClaimAmount).toBe(12500);

    save.mockClear();
    await completeInsurerOnboarding(insurerForm({ maxClaimAmount: "" }), save);
    expect(save.mock.calls[0][0].maxClaimAmount).toBeNull();
  });

  it("defaults claimTypes to [] when missing", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    await completeInsurerOnboarding(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      insurerForm({ claimTypes: undefined as any }),
      save
    );
    expect(save.mock.calls[0][0].claimTypes).toEqual([]);
    expect(save.mock.calls[0][0].repairProgramFocus).toEqual([]);
  });

  it("propagates save errors", async () => {
    const save = vi.fn().mockRejectedValue(new Error("rls denied"));
    await expect(completeInsurerOnboarding(insurerForm(), save)).rejects.toThrow("rls denied");
  });
});
