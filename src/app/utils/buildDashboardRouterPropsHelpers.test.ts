import { beforeEach, describe, expect, it, vi } from "vitest";

import { handleAcceptBid } from "./buildDashboardRouterPropsHelpers";

const {
  mockGetBidsForReport,
  mockUpdateBidStatus,
  mockUpdateReportStatus,
  mockCreateJobAssignment,
  mockZipToCoordinates,
  mockUpdateWebsiteSessionMemory,
} = vi.hoisted(() => ({
  mockGetBidsForReport: vi.fn(),
  mockUpdateBidStatus: vi.fn(),
  mockUpdateReportStatus: vi.fn(),
  mockCreateJobAssignment: vi.fn(),
  mockZipToCoordinates: vi.fn(),
  mockUpdateWebsiteSessionMemory: vi.fn(),
}));

vi.mock("../services/supabase/bids", () => ({
  getBidsForReport: mockGetBidsForReport,
  updateBidStatus: mockUpdateBidStatus,
}));

vi.mock("../services/supabase/reports", () => ({
  updateReportStatus: mockUpdateReportStatus,
}));

vi.mock("../services/supabase/workflow", () => ({
  createJobAssignment: mockCreateJobAssignment,
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
    mockGetBidsForReport.mockResolvedValue([
      { id: "bid-1", status: "pending" },
      { id: "bid-2", status: "pending" },
      { id: "bid-3", status: "rejected" },
    ]);
    mockUpdateReportStatus.mockResolvedValue({ id: "report-1", status: "active" });
    mockCreateJobAssignment.mockResolvedValue({ id: "assignment-1" });
  });

  it("accepts a bid, rejects competitors, creates an assignment, and hands off to map flow", async () => {
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
      websiteIdentity,
    );

    expect(mockUpdateBidStatus).toHaveBeenCalledWith("bid-1", "accepted", "clerk_123");
    expect(mockUpdateReportStatus).toHaveBeenCalledWith("report-1", "active", "clerk_123");
    expect(mockGetBidsForReport).toHaveBeenCalledWith("report-1");
    expect(mockUpdateBidStatus).toHaveBeenCalledWith("bid-2", "rejected", "clerk_123");
    expect(mockCreateJobAssignment).toHaveBeenCalledWith({
      damage_report_id: "report-1",
      customer_user_id: "clerk_123",
      shop_user_id: "shop-1",
      bid_id: "bid-1",
      status: "scheduled",
    });

    expect(userData.bids.find((bid) => bid.id === "bid-1")?.status).toBe("accepted");
    expect(userData.reports[0]).toEqual(
      expect.objectContaining({
        id: "report-1",
        status: "active",
        assignmentId: "assignment-1",
      }),
    );
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
      { accountType: "customer" },
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

    await handleAcceptBid(
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
      websiteIdentity,
    );

    expect(mockUpdateReportStatus).not.toHaveBeenCalled();
    expect(mockGetBidsForReport).not.toHaveBeenCalled();
    expect(mockCreateJobAssignment).not.toHaveBeenCalled();
    expect(mockUpdateWebsiteSessionMemory).not.toHaveBeenCalled();
    expect(navigation.setViewMode).not.toHaveBeenCalled();
    expect(userData.reports[0]).toEqual(
      expect.objectContaining({
        id: "report-1",
        status: "pending",
      }),
    );
  });
});
