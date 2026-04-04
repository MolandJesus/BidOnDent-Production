import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchShopBusinessProfile,
  saveShopBusinessProfile,
  fetchInsurerBusinessProfile,
  saveInsurerBusinessProfile,
  fetchDirectoryInventory,
  invalidateDirectoryInventoryCache,
  getDirectoryInventoryUpdatedEventName,
} from "./networkProfiles";
import type { WebsiteIdentity } from "./auth/websiteIdentity";

// Mock the runtime module (edge headers + URL builder)
vi.mock("./supabase/runtime", () => ({
  buildSupabaseEdgeHeadersAsync: vi
    .fn()
    .mockResolvedValue(new Headers({ Authorization: "Bearer test" })),
  buildSupabaseFunctionUrl: vi.fn(
    (route: string) => `https://test.supabase.co/functions/v1/server/${route}`
  ),
  SUPABASE_EDGE_ROUTES: {
    shopProfile: "shop-profile",
    insurerProfile: "insurer-profile",
    directoryInventory: "directory-inventory",
  },
}));

const mockIdentity: WebsiteIdentity = {
  websiteUserKey: "key-123",
  provider: "clerk",
  providerUserId: "user_abc",
  normalizedEmail: "test@example.com",
  displayName: "Test User",
  sessionId: "session-1",
};

// Save original fetch
const originalFetch = globalThis.fetch;

beforeEach(() => {
  invalidateDirectoryInventoryCache();
  globalThis.fetch = vi.fn();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function mockFetchResponse(body: unknown, ok = true, status = 200) {
  (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
}

// ── fetchShopBusinessProfile ──

describe("fetchShopBusinessProfile", () => {
  it("returns parsed shop profile on success", async () => {
    mockFetchResponse({
      profile: {
        id: "sp-1",
        business_name: "Ace Body Shop",
        business_address: "123 Main St",
        business_city: "White Plains",
        business_state: "NY",
        business_zip: "10601",
        business_phone: "914-555-0100",
        certifications: ["I-CAR Gold"],
        specialties: ["PDR", "Paint"],
        average_rating: 4.5,
        total_reviews: 120,
        is_accepting_bids: true,
        is_directory_visible: true,
        website_user_key: "key-123",
      },
    });

    const result = await fetchShopBusinessProfile(mockIdentity);
    expect(result).not.toBeNull();
    expect(result!.businessName).toBe("Ace Body Shop");
    expect(result!.businessCity).toBe("White Plains");
    expect(result!.certifications).toEqual(["I-CAR Gold"]);
    expect(result!.specialties).toEqual(["PDR", "Paint"]);
    expect(result!.averageRating).toBe(4.5);
    expect(result!.isAcceptingBids).toBe(true);
  });

  it("returns null when no profile in response", async () => {
    mockFetchResponse({ profile: null });
    const result = await fetchShopBusinessProfile(mockIdentity);
    expect(result).toBeNull();
  });

  it("throws on non-ok response", async () => {
    mockFetchResponse({ error: "Not found" }, false, 404);
    await expect(fetchShopBusinessProfile(mockIdentity)).rejects.toThrow("Not found");
  });

  it("includes identity query params in request URL", async () => {
    mockFetchResponse({ profile: null });
    await fetchShopBusinessProfile(mockIdentity);
    const url = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).toContain("websiteUserKey=key-123");
    expect(url).toContain("clerkUserId=user_abc");
  });
});

// ── saveShopBusinessProfile ──

describe("saveShopBusinessProfile", () => {
  it("sends POST and returns parsed profile", async () => {
    mockFetchResponse({
      profile: {
        id: "sp-2",
        business_name: "New Shop",
        business_address: "456 Elm",
        business_city: "Yonkers",
        business_state: "NY",
        business_zip: "10701",
        business_phone: "914-555-0200",
        certifications: [],
        specialties: [],
        website_user_key: "key-123",
      },
    });

    const result = await saveShopBusinessProfile(mockIdentity, {
      businessName: "New Shop",
      businessAddress: "456 Elm",
      businessCity: "Yonkers",
      businessState: "NY",
      businessZip: "10701",
      businessPhone: "914-555-0200",
      certifications: [],
      specialties: [],
      acceptsInsuranceClaims: false,
      offersEstimates: false,
      insurerPrograms: [],
      supportedMakes: [],
      isAcceptingBids: true,
      isDirectoryVisible: true,
    });

    expect(result.businessName).toBe("New Shop");
    expect(result.businessCity).toBe("Yonkers");

    // Verify POST method
    const fetchCall = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchCall[1].method).toBe("POST");
  });

  it("throws on failure", async () => {
    mockFetchResponse({ error: "Save failed" }, false, 500);
    await expect(
      saveShopBusinessProfile(mockIdentity, {
        businessName: "X",
        businessAddress: "",
        businessCity: "",
        businessState: "",
        businessZip: "",
        businessPhone: "",
        certifications: [],
        specialties: [],
        acceptsInsuranceClaims: false,
        offersEstimates: false,
        insurerPrograms: [],
        supportedMakes: [],
        isAcceptingBids: true,
        isDirectoryVisible: true,
      })
    ).rejects.toThrow("Save failed");
  });
});

// ── fetchInsurerBusinessProfile ──

describe("fetchInsurerBusinessProfile", () => {
  it("returns parsed insurer profile on success", async () => {
    mockFetchResponse({
      profile: {
        id: "ip-1",
        company_name: "SafeGuard Insurance",
        company_address: "789 Oak Ave",
        company_city: "New Rochelle",
        company_state: "NY",
        company_zip: "10801",
        company_phone: "914-555-0300",
        claim_types: ["collision", "comprehensive"],
        digital_claims_experience: "strong",
        preferred_shops: true,
        auto_approval: false,
        max_claim_amount: 50000,
        benefits: ["Fast turnaround"],
        popular: true,
        website_user_key: "key-123",
      },
    });

    const result = await fetchInsurerBusinessProfile(mockIdentity);
    expect(result).not.toBeNull();
    expect(result!.companyName).toBe("SafeGuard Insurance");
    expect(result!.claimTypes).toEqual(["collision", "comprehensive"]);
    expect(result!.digitalClaimsExperience).toBe("strong");
    expect(result!.preferredShops).toBe(true);
    expect(result!.maxClaimAmount).toBe(50000);
    expect(result!.popular).toBe(true);
  });

  it("returns null when no profile", async () => {
    mockFetchResponse({ profile: null });
    const result = await fetchInsurerBusinessProfile(mockIdentity);
    expect(result).toBeNull();
  });
});

// ── saveInsurerBusinessProfile ──

describe("saveInsurerBusinessProfile", () => {
  it("sends POST and returns parsed profile", async () => {
    mockFetchResponse({
      profile: {
        id: "ip-2",
        company_name: "TestInsurer",
        company_address: "",
        company_city: "",
        company_state: "",
        company_zip: "",
        company_phone: "",
        claim_types: [],
        digital_claims_experience: "standard",
        preferred_shops: false,
        auto_approval: false,
        benefits: [],
        repair_program_focus: [],
        account_connection_notes: [],
        popular: false,
        website_user_key: "key-123",
      },
    });

    const result = await saveInsurerBusinessProfile(mockIdentity, {
      companyName: "TestInsurer",
      companyAddress: "",
      companyCity: "",
      companyState: "",
      companyZip: "",
      companyPhone: "",
      claimTypes: [],
      preferredShops: false,
      autoApproval: false,
      repairProgramFocus: [],
      benefits: [],
      accountConnectionNotes: [],
      digitalClaimsExperience: "standard",
      popular: false,
      isDirectoryVisible: true,
    });

    expect(result.companyName).toBe("TestInsurer");
  });
});

// ── fetchDirectoryInventory ──

describe("fetchDirectoryInventory", () => {
  it("returns shops and insurers arrays", async () => {
    mockFetchResponse({
      shops: [
        {
          id: "sp-1",
          business_name: "Shop A",
          business_address: "",
          business_city: "",
          business_state: "",
          business_zip: "",
          business_phone: "",
          website_user_key: "k1",
        },
      ],
      insurers: [
        {
          id: "ip-1",
          company_name: "Insurer A",
          company_address: "",
          company_city: "",
          company_state: "",
          company_zip: "",
          company_phone: "",
          website_user_key: "k2",
        },
      ],
    });

    const result = await fetchDirectoryInventory();
    expect(result.shops).toHaveLength(1);
    expect(result.shops[0].businessName).toBe("Shop A");
    expect(result.insurers).toHaveLength(1);
    expect(result.insurers[0].companyName).toBe("Insurer A");
  });

  it("caches result on second call", async () => {
    mockFetchResponse({ shops: [], insurers: [] });

    const first = await fetchDirectoryInventory();
    const second = await fetchDirectoryInventory();

    expect(first).toBe(second);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("refetches when forceRefresh is true", async () => {
    mockFetchResponse({ shops: [], insurers: [] });
    await fetchDirectoryInventory();

    mockFetchResponse({
      shops: [{ id: "new", business_name: "New", website_user_key: "k" }],
      insurers: [],
    });
    const result = await fetchDirectoryInventory(true);

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(result.shops[0].businessName).toBe("New");
  });

  it("refetches after invalidateDirectoryInventoryCache", async () => {
    mockFetchResponse({ shops: [], insurers: [] });
    await fetchDirectoryInventory();

    invalidateDirectoryInventoryCache();

    mockFetchResponse({ shops: [], insurers: [] });
    await fetchDirectoryInventory();

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it("handles missing shops/insurers arrays gracefully", async () => {
    mockFetchResponse({});
    const result = await fetchDirectoryInventory();
    expect(result.shops).toEqual([]);
    expect(result.insurers).toEqual([]);
  });
});

// ── Profile mapper edge cases ──

describe("profile mapper edge cases", () => {
  it("handles null/undefined fields in shop profile", async () => {
    mockFetchResponse({
      profile: {
        business_name: null,
        certifications: "not-an-array",
        average_rating: "4.2",
        is_accepting_bids: false,
        is_directory_visible: false,
      },
    });

    const result = await fetchShopBusinessProfile(mockIdentity);
    expect(result!.businessName).toBe(""); // null → fallback ""
    expect(result!.certifications).toEqual([]); // non-array → []
    expect(result!.averageRating).toBe(4.2); // string "4.2" → number 4.2
    expect(result!.isAcceptingBids).toBe(false);
    expect(result!.isDirectoryVisible).toBe(false);
  });

  it("handles invalid digital_claims_experience in insurer profile", async () => {
    mockFetchResponse({
      profile: {
        company_name: "TestCo",
        digital_claims_experience: "invalid-value",
        popular: 0,
        preferred_shops: null,
        auto_approval: undefined,
        website_user_key: "k",
      },
    });

    const result = await fetchInsurerBusinessProfile(mockIdentity);
    expect(result!.digitalClaimsExperience).toBe("standard"); // fallback
    expect(result!.popular).toBe(false); // falsy → false
    expect(result!.preferredShops).toBe(false);
    expect(result!.autoApproval).toBe(false);
  });
});

// ── Utility ──

describe("getDirectoryInventoryUpdatedEventName", () => {
  it("returns the custom event name", () => {
    expect(getDirectoryInventoryUpdatedEventName()).toBe("bidondent:directory-inventory-updated");
  });
});
