import { beforeEach, describe, expect, it, vi } from "vitest";

import { handleAcceptBid } from "./buildDashboardRouterPropsHelpers";

const { mockUpdateBidStatus, mockZipToCoordinates, mockUpdateWebsiteSessionMemory } = vi.hoisted(
  () => ({
    mockUpdateBidStatus: vi.fn(),
    mockZipToCoordinates: vi.fn(),
    mockUpdateWebsiteSessionMemory: vi.fn(),
  })
);

vi.mock("../services/supabase/bids", () => ({
  updateBidStatus: mockUpdateBidStatus,
}));

vi.mock("../services/supabase/map", () => ({
  zipToCoordinates: mockZipToCoordinates,
}));

vi.mock("../services/auth/websiteIdentity", async () => {
  const actual = await vi.importActual("../services/auth/websiteIdentity");
  return {
    ...actual,
    updateWebsiteSessionMemory: mockUpdateWebsiteSessionMemory,
  };
});

type NavigationArg = Parameters<typeof handleAcceptBid>[2];
type UserDataArg = Parameters<typeof handleAcceptBid>[3];
type WebsiteIdentityArg = Parameters<typeof handleAcceptBid>[4];

function createNavigationState(selectedReportId?: string): NavigationArg {
  return {
    selectedReportId,
    setViewMode: vi.fn(),
  } as unknown as NavigationArg;
}

function createUserDataState() {
  let reports = [
    {
      id: "report-1",
      status: "pending",
      address: "123 Peachtree St NE",
      city: "Atlanta",
      state: "GA",
      zip_code: "30308",
    },
  ];
  let bids = [
    { id: "bid-1", status: "pending" },
    { id: "bid-2", status: "pending" },
    { id: "bid-3", status: "pending" },
  ];

  const state = {
    reports,
    bids,
    setReports: vi.fn((next: typeof reports) => {
      reports = next;
      state.reports = next;
    }),
    setBids: vi.fn((next: typeof bids) => {
      bids = next;
      state.bids = next;
    }),
  };

  return state as unknown as UserDataArg & {
    reports: typeof reports;
    bids: typeof bids;
    setReports: ReturnType<typeof vi.fn>;
    setBids: ReturnType<typeof vi.fn>;
  };
}

describe("handleAcceptBid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockZipToCoordinates.mockReturnValue({ lat: 33.7811, lng: -84.3837 });
    mockUpdateBidStatus.mockImplementation(async (bidId: string, status: string) => ({
      id: bidId,
      status,
    }));
  });

  it("accepts a bid, updates local state, and hands off to map flow", async () => {
    const navigation = createNavigationState("report-1");
    const userData = createUserDataState();
    const websiteIdentity = {
      provider: "clerk",
      providerUserId: "clerk_123",
      normalizedEmail: "person@example.com",
      displayName: "Person",
      accountType: "customer",
      websiteUserKey: "site-customer-1",
      clerkUserId: "clerk_123",
    } as unknown as WebsiteIdentityArg;

    await handleAcceptBid(
      {
        bidId: "bid-1",
        shopId: "shop-1",
        shopName: "Atlanta Dent Repair",
        price: 1200,
        timeframe: "3 days",
      },
      { id: "clerk_123" } as Parameters<typeof handleAcceptBid>[1],
      navigation,
      userData,
      websiteIdentity
    );

    // Server call: only updateBidStatus (server handles report status + job assignment atomically)
    expect(mockUpdateBidStatus).toHaveBeenCalledWith("bid-1", "accepted", "clerk_123");
    expect(mockUpdateBidStatus).toHaveBeenCalledTimes(1);

    // Local state updates
    expect(userData.bids.find((bid) => bid.id === "bid-1")?.status).toBe("accepted");
    expect(userData.reports[0]).toEqual(
      expect.objectContaining({
        id: "report-1",
        status: "active",
      })
    );

    // Map flow handoff
    expect(mockUpdateWebsiteSessionMemory).toHaveBeenCalledWith(
      websiteIdentity,
      expect.objectContaining({
        shopDirectory: expect.objectContaining({
          searchQuery: "Atlanta Dent Repair",
        }),
        mapSession: expect.objectContaining({
          mapViewMode: "hybrid",
          lastSearchOrigin: expect.objectContaining({
            zipCode: "30308",
            latitude: 33.7811,
            longitude: -84.3837,
          }),
        }),
      }),
      { accountType: "customer" }
    );
    expect(navigation.setViewMode).toHaveBeenCalledWith("shop-directory");
  });

  it("stops cleanly when the bid accept call fails", async () => {
    const navigation = createNavigationState("report-1");
    const userData = createUserDataState();
    const websiteIdentity = {
      provider: "clerk",
      providerUserId: "clerk_123",
      normalizedEmail: "person@example.com",
      displayName: "Person",
      accountType: "customer",
      websiteUserKey: "site-customer-1",
      clerkUserId: "clerk_123",
    } as unknown as WebsiteIdentityArg;

    mockUpdateBidStatus.mockResolvedValueOnce(null);

    await expect(
      handleAcceptBid(
        {
          bidId: "bid-1",
          shopId: "shop-1",
          shopName: "Atlanta Dent Repair",
          price: 1200,
          timeframe: "3 days",
          reportId: "report-1",
        },
        { id: "clerk_123" } as Parameters<typeof handleAcceptBid>[1],
        navigation,
        userData,
        websiteIdentity
      )
    ).rejects.toThrow("Failed to accept bid");

    expect(mockUpdateWebsiteSessionMemory).not.toHaveBeenCalled();
    expect(navigation.setViewMode).not.toHaveBeenCalled();
    expect(userData.reports[0]).toEqual(
      expect.objectContaining({
        id: "report-1",
        status: "pending",
      })
    );
  });
});
