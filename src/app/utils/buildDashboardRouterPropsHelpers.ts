import type { UserProfile } from "../services/clerkService";
import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import { updateWebsiteSessionMemory } from "../services/auth/websiteIdentity";
import type { useNavigation } from "../hooks/useNavigation";
import type { useUserData } from "../hooks/useUserData";
import type { Bid } from "../types";
import { updateBidStatus } from "../services/supabase/bids";
import { zipToCoordinates } from "../services/supabase/map";

type NavigationState = ReturnType<typeof useNavigation>;
type UserDataState = ReturnType<typeof useUserData>;

export async function handleAcceptBid(
  details: {
    bidId: string;
    shopId?: string;
    shopName: string;
    price: number;
    timeframe: string;
    reportId?: string;
  },
  userProfile: UserProfile,
  navigation: NavigationState,
  userData: UserDataState,
  websiteIdentity: WebsiteIdentity | null | undefined
) {
  try {
    const clerkId = userProfile?.id;
    const acceptedBid = await updateBidStatus(details.bidId, "accepted", clerkId);
    if (!acceptedBid) {
      throw new Error("Failed to accept bid — backend did not confirm");
    }

    // Server now handles atomically: report status → "accepted", job assignment, competing bid rejection
    const reportId = details.reportId || navigation.selectedReportId || userData.reports[0]?.id;

    // Update local state to match server-side changes
    if (reportId) {
      userData.setReports(
        userData.reports.map((r) => (r.id === reportId ? { ...r, status: "active" as const } : r))
      );
    }

    userData.setBids(
      userData.bids.map((b: Bid) => (b.id === details.bidId ? { ...b, status: "accepted" } : b))
    );

    // Route handoff: move customer straight into map flow with accepted-shop context.
    const acceptedReport = reportId
      ? userData.reports.find((report) => String(report.id) === String(reportId))
      : null;
    const acceptedReportLegacyZip = acceptedReport
      ? ((acceptedReport as unknown as Record<string, unknown>).zip_code as string | undefined)
      : undefined;
    const acceptedReportZip = acceptedReport?.zipCode || acceptedReportLegacyZip || "";
    const acceptedOriginCoords = acceptedReportZip ? zipToCoordinates(acceptedReportZip) : null;

    updateWebsiteSessionMemory(
      websiteIdentity,
      {
        shopDirectory: {
          lastViewedShopId: undefined,
          searchQuery: details.shopName,
        },
        mapSession: {
          lastViewedShopId: undefined,
          mapViewMode: "hybrid",
          ...(acceptedOriginCoords
            ? {
                lastSearchOrigin: {
                  name: acceptedReport?.address || acceptedReport?.city || "Accepted report",
                  address: acceptedReport?.address || "",
                  city: acceptedReport?.city || "",
                  state: acceptedReport?.state || "",
                  zipCode: acceptedReportZip,
                  latitude: acceptedOriginCoords.lat,
                  longitude: acceptedOriginCoords.lng,
                  placeId: `accepted-report-${String(reportId || details.bidId)}`,
                },
                lastMapCenter: {
                  latitude: acceptedOriginCoords.lat,
                  longitude: acceptedOriginCoords.lng,
                },
              }
            : {}),
        },
      },
      { accountType: "customer" }
    );

    navigation.setViewMode("shop-directory");
  } catch (err) {
    if (import.meta.env.DEV) console.error("Failed to accept bid:", err);
    throw err;
  }
}
