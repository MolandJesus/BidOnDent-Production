import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import type { ShopBusinessProfile } from "../types/networkProfiles";
import { fetchShopBusinessProfile } from "../services/networkProfiles";
import { useBusinessProfile } from "./useBusinessProfile";

vi.mock("../services/networkProfiles", () => ({
  fetchInsurerBusinessProfile: vi.fn(),
  fetchShopBusinessProfile: vi.fn(),
  saveInsurerBusinessProfile: vi.fn(),
  saveShopBusinessProfile: vi.fn(),
}));

const mockFetchShopBusinessProfile = vi.mocked(fetchShopBusinessProfile);

const SHOP_IDENTITY: WebsiteIdentity = {
  provider: "clerk",
  providerUserId: "user_123",
  normalizedEmail: "shop@example.com",
  displayName: "Test Shop",
  websiteUserKey: "website-user-123",
  sessionId: "session-123",
};

const SHOP_PROFILE: ShopBusinessProfile = {
  websiteUserKey: SHOP_IDENTITY.websiteUserKey,
  businessName: "Test Shop Collision",
  businessAddress: "1 Main St",
  businessCity: "Yonkers",
  businessState: "NY",
  businessZip: "10701",
  businessPhone: "555-123-4567",
  certifications: [],
  specialties: [],
  acceptsInsuranceClaims: true,
  offersEstimates: true,
  insurerPrograms: [],
  supportedMakes: [],
  isAcceptingBids: true,
  isDirectoryVisible: true,
};

function BusinessProfileHarness({ tick }: { tick: number }) {
  const identity = { ...SHOP_IDENTITY };
  const { businessProfile, isLoading } = useBusinessProfile(identity, "shop");
  const businessName =
    businessProfile && "businessName" in businessProfile ? businessProfile.businessName : "";

  return (
    <div>
      <div data-testid="tick">{tick}</div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="business-name">{businessName}</div>
    </div>
  );
}

describe("useBusinessProfile", () => {
  beforeEach(() => {
    mockFetchShopBusinessProfile.mockReset();
    mockFetchShopBusinessProfile.mockResolvedValue(SHOP_PROFILE);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("does not refetch when the parent rerenders with the same identity values", async () => {
    const { rerender } = render(<BusinessProfileHarness tick={0} />);

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("business-name").textContent).toBe("Test Shop Collision");
    expect(mockFetchShopBusinessProfile).toHaveBeenCalledTimes(1);

    rerender(<BusinessProfileHarness tick={1} />);

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(mockFetchShopBusinessProfile).toHaveBeenCalledTimes(1);
  });
});
