import type { UserProfile } from "../services/clerkService";
import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import { updateWebsiteSessionMemory } from "../services/auth/websiteIdentity";
import type { useNavigation } from "../hooks/useNavigation";
import type { useUserData } from "../hooks/useUserData";
import type { Bid } from "../types";
import { updateBidStatus } from "../services/supabase/bids";
import { updateReportStatus } from "../services/supabase/reports";
import { createJobAssignment } from "../services/supabase/workflow";
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

    // Use the reportId passed from BidsScreen (sourced from live Supabase data)
    const reportId = details.reportId || navigation.selectedReportId || userData.reports[0]?.id;
    if (reportId && userProfile?.id) {
      const reportUpdated = await updateReportStatus(
        reportId.toString(),
        "accepted",
        userProfile.id
      );
      if (reportUpdated) {
        userData.setReports(
          userData.reports.map((r) => (r.id === reportId ? { ...r, status: "active" } : r))
        );
      } else {
        console.warn(
          "updateReportStatus returned false — report may still be 'pending' in DB. reportId:",
          reportId,
          "clerkUserId:",
          userProfile.id
        );
      }
    }

    // Server auto-rejects competing bids atomically (bids.ts:377-389)

    // Update local bids state
    userData.setBids(
      userData.bids.map((b: Bid) => (b.id === details.bidId ? { ...b, status: "accepted" } : b))
    );

    // Create job assignment in Supabase so shop can track repair status
    if (reportId) {
      try {
        const assignment = await createJobAssignment({
          damage_report_id: reportId.toString(),
          customer_user_id: userProfile?.id || "",
          shop_user_id: details.shopId || "",
          bid_id: details.bidId,
          status: "scheduled",
        });
        if (assignment?.id) {
          userData.setReports(
            userData.reports.map((r) =>
              String(r.id) === String(reportId) ? { ...r, assignmentId: assignment.id } : r
            )
          );
        }
      } catch (assignErr) {
        if (import.meta.env.DEV) console.error("Failed to create job assignment:", assignErr);
      }
    }

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
