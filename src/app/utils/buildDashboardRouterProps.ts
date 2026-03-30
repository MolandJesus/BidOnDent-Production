import type { UserProfile } from "../services/clerkService";
import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import { updateWebsiteSessionMemory } from "../services/auth/websiteIdentity";
import type { useNavigation } from "../hooks/useNavigation";
import type { useUserData } from "../hooks/useUserData";
import type { DashboardAppearanceMode } from "../routers/dashboard-router-types";
import type { ViewMode, DamageReport, Vehicle, Bid } from "../types";
import { deleteVehicle } from "../services/supabaseService";
import { getBidsForReport, updateBidStatus } from "../services/supabase/bids";
import { updateReportStatus } from "../services/supabase/reports";
import { createJobAssignment, updateJobAssignmentStatus } from "../services/supabase/workflow";
import { zipToCoordinates } from "../services/supabase/map";

type NavigationState = ReturnType<typeof useNavigation>;
type UserDataState = ReturnType<typeof useUserData>;

type BuildDashboardRouterPropsArgs = {
  navigation: NavigationState;
  userProfile: UserProfile;
  userData: UserDataState;
  submitBid: (
    reportId: string,
    bidAmount: number,
    estimatedDays: number,
    description: string
  ) => void;
  handleDeleteAccount: () => Promise<void>;
  handleLogout: () => Promise<void>;
  onReportSubmit: (report: DamageReport) => Promise<void>;
  primaryColor: string;
  secondaryColor: string;
  userImageUrl: string;
  websiteIdentity?: WebsiteIdentity | null;
  appearanceMode: DashboardAppearanceMode;
  onAppearanceModeChange: (mode: DashboardAppearanceMode) => void;
};

export function buildDashboardRouterProps({
  navigation,
  userProfile,
  userData,
  submitBid,
  handleDeleteAccount,
  handleLogout,
  onReportSubmit,
  primaryColor,
  secondaryColor,
  userImageUrl,
  websiteIdentity,
  appearanceMode,
  onAppearanceModeChange,
}: BuildDashboardRouterPropsArgs) {
  return {
    currentTab: navigation.currentTab,
    viewMode: navigation.viewMode,
    userType:
      navigation.demoMode && navigation.demoAccountType
        ? navigation.demoAccountType
        : userProfile.user_type,
    demoMode: navigation.demoMode,
    originalAccountType: userProfile.user_type,
    userInfo: {
      name: userProfile.name,
      email: userProfile.email,
      profileImage: userImageUrl,
    },
    userPhone: userProfile.phone,
    vehicles: userData.vehicles,
    reports: userData.reports,
    reportsLoading: userData.reportsLoading,
    reportsError: userData.reportsError,
    bids: userData.bids,
    photoStorage: userData.photoStorage,
    selectedReportId: navigation.selectedReportId,
    websiteIdentity,
    appearanceMode,
    primaryColor,
    secondaryColor,
    onStartReport: () => {
      navigation.setCurrentTab("report");
      navigation.setViewMode("dashboard");
    },
    onSubmitBid: submitBid,
    onViewAllReports: () => {
      navigation.setViewMode("reports-list");
    },
    onConnectInsurance: () => {
      navigation.setViewMode("insurer-connect");
    },
    onViewLikedShops: () => {
      navigation.setViewMode("liked-shops");
    },
    onViewBids: () => {
      navigation.setCurrentTab("bids");
      navigation.setViewMode("dashboard");
    },
    onViewRequests: () => {
      navigation.setCurrentTab("requests");
      navigation.setViewMode("dashboard");
    },
    onViewJobs: () => {
      navigation.setCurrentTab("jobs");
      navigation.setViewMode("dashboard");
    },
    onViewClaims: () => {
      navigation.setCurrentTab("claims");
      navigation.setViewMode("dashboard");
    },
    onViewShops: () => {
      navigation.setViewMode("shop-directory");
    },
    onCreateNewClaim: () => {
      navigation.setViewMode("new-claim");
    },
    onViewCompetitors: () => {
      navigation.setViewMode("competitor-analysis");
    },
    onViewInsurers: () => {
      navigation.setViewMode("insurance-companies");
    },
    onSelectReport: (reportId: string) => {
      navigation.setSelectedReportId(reportId);
    },
    onViewModeChange: (mode: string) => {
      navigation.setViewMode(mode as ViewMode);
    },
    onTabChange: (tab: string) => {
      navigation.setCurrentTab(tab);
    },
    onLogout: handleLogout,
    onEnterDemoMode: () => {
      navigation.setViewMode("demo-switcher");
    },
    onEnableDemoMode: (accountType: string) => {
      if (accountType === userProfile.user_type) {
        navigation.exitDemoMode();
      } else {
        navigation.enableDemoMode(accountType as "customer" | "shop" | "insurer");
      }
    },
    onExitDemoMode: () => {
      navigation.exitDemoMode();
    },
    onAppearanceModeChange,
    onProfileUpdate: (info: {
      name: string;
      email: string;
      profileImage?: string;
      phone?: string;
    }) => {
      userData.setUserInfo({
        name: info.name,
        email: info.email,
        profileImage: info.profileImage || "",
      });
      if (info.phone) {
        userData.setUserPhone(info.phone);
      }
    },
    onAcceptBid: async (details: {
      bidId: string;
      shopId?: string;
      shopName: string;
      price: number;
      timeframe: string;
      reportId?: string;
      skipNavigation?: boolean;
    }) => {
      try {
        const clerkId = userProfile?.id;
        const acceptedBid = await updateBidStatus(details.bidId, "accepted", clerkId);
        if (!acceptedBid) {
          if (import.meta.env.DEV)
            console.error("Failed to accept bid in Supabase:", details.bidId);
          return;
        }

        // Use the reportId passed from BidsScreen (sourced from live Supabase data)
        const reportId = details.reportId || navigation.selectedReportId || userData.reports[0]?.id;
        if (reportId && userProfile?.id) {
          await updateReportStatus(reportId.toString(), "active", userProfile.id);
          userData.setReports(
            userData.reports.map((r) => (r.id === reportId ? { ...r, status: "active" } : r))
          );
        }

        // Reject competing bids for the same report via Supabase query
        if (reportId) {
          try {
            const allBidsForReport = await getBidsForReport(reportId.toString());
            const competingBids = allBidsForReport.filter(
              (b) => b.id !== details.bidId && b.status !== "rejected"
            );
            for (const competing of competingBids) {
              try {
                const rejectedBid = await updateBidStatus(competing.id!, "rejected", clerkId);
                if (!rejectedBid && import.meta.env.DEV) {
                  console.error("Competing bid reject was not persisted:", competing.id);
                }
              } catch (rejectErr) {
                if (import.meta.env.DEV)
                  console.error("Failed to reject competing bid:", competing.id, rejectErr);
              }
            }
          } catch (fetchErr) {
            if (import.meta.env.DEV) console.error("Failed to fetch competing bids:", fetchErr);
          }
        }

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
        const acceptedReportZip = acceptedReport?.zip_code || acceptedReport?.zipCode || "";
        const acceptedOriginCoords = acceptedReportZip ? zipToCoordinates(acceptedReportZip) : null;

        updateWebsiteSessionMemory(
          websiteIdentity,
          {
            shopDirectory: {
              searchQuery: details.shopName,
            },
            mapSession: {
              mapViewMode: "map",
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

        if (!details.skipNavigation) {
          navigation.setViewMode("shop-directory");
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed to accept bid:", err);
      }
    },
    onRejectBid: async (details: { bidId: string; shopName: string }) => {
      try {
        const rejectedBid = await updateBidStatus(details.bidId, "rejected", userProfile?.id);
        if (!rejectedBid) {
          if (import.meta.env.DEV)
            console.error("Failed to reject bid in Supabase:", details.bidId);
          return;
        }
        // Update local bids state so UI reflects the change immediately
        userData.setBids(
          userData.bids.map((b: Bid) => (b.id === details.bidId ? { ...b, status: "rejected" } : b))
        );
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed to reject bid:", err);
      }
    },
    onPasswordChange: () => {
      if (import.meta.env.DEV) console.log("Password change not implemented");
    },
    onDeleteAccount: handleDeleteAccount,
    onSaveVehicles: (vehicles: Vehicle[]) => {
      // Detect vehicles that were removed and delete them from Supabase
      const removedVehicles = userData.vehicles.filter(
        (existing) => existing.id && !vehicles.some((v) => v.id === existing.id)
      );
      if (removedVehicles.length > 0) {
        const clerkUserId = userProfile.id;
        for (const removed of removedVehicles) {
          if (removed.id) {
            deleteVehicle(removed.id, clerkUserId).catch((err) => {
              if (import.meta.env.DEV)
                console.error("Failed to delete vehicle from Supabase:", err);
            });
          }
        }
      }
      userData.setVehicles(vehicles);
    },
    onSaveVehicle: (vehicle: Vehicle) => {
      const existingIndex = userData.vehicles.findIndex((entry) => entry.id === vehicle.id);
      if (existingIndex >= 0) {
        userData.setVehicles(
          userData.vehicles.map((entry) => (entry.id === vehicle.id ? vehicle : entry))
        );
      } else {
        userData.setVehicles([...userData.vehicles, vehicle]);
      }
    },
    hasSeenPhotoGuide: userData.hasSeenPhotoGuide,
    onPhotoGuideComplete: () => {
      userData.setHasSeenPhotoGuide(true);
    },
    onReportSubmit,
    onUpdateJobStatus: async (jobId: number, status: string) => {
      // Map kebab-case (UI) to snake_case (backend)
      const statusMap: Record<
        string,
        "scheduled" | "in_progress" | "awaiting_parts" | "completed" | "cancelled"
      > = {
        "in-progress": "in_progress",
        "awaiting-parts": "awaiting_parts",
        completed: "completed",
        cancelled: "cancelled",
        scheduled: "scheduled",
      };
      const backendStatus = statusMap[status] || "in_progress";

      // Find assignment ID from local report state
      const report = userData.reports.find((r) => String(r.id) === String(jobId));
      const assignmentId = report?.assignmentId;
      if (!assignmentId) {
        if (import.meta.env.DEV)
          console.warn("No assignmentId found for report", jobId, "— status update is local-only");
        return;
      }

      try {
        await updateJobAssignmentStatus(assignmentId, backendStatus);
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed to update job status:", err);
      }
    },
    onConfirmCompletion: async (reportId: string) => {
      try {
        const clerkId = userProfile?.id;
        if (clerkId) {
          await updateReportStatus(reportId, "resolved", clerkId);
        }
        userData.setReports(
          userData.reports.map((r) =>
            String(r.id) === String(reportId) ? { ...r, status: "resolved" as const } : r
          )
        );
      } catch (err) {
        if (import.meta.env.DEV) console.error("Failed to confirm completion:", err);
      }
    },
  };
}
