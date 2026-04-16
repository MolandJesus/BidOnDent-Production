import type { UserProfile } from "../services/clerkService";
import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import type { useNavigation } from "../hooks/useNavigation";
import type { useUserData } from "../hooks/useUserData";
import type { DashboardAppearanceMode } from "../routers/dashboard-router-types";
import type { ViewMode, DamageReport, Vehicle, Bid } from "../types";
import { deleteVehicle } from "../services/supabaseService";
import { updateBidStatus } from "../services/supabase/bids";
import { updateReportStatus } from "../services/supabase/reports";
import { updateJobAssignmentStatus } from "../services/supabase/workflow";
import { handleAcceptBid } from "./buildDashboardRouterPropsHelpers";

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
  openUserProfile?: () => void;
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
  openUserProfile,
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
      const effectiveUserType =
        navigation.demoMode && navigation.demoAccountType
          ? navigation.demoAccountType
          : userProfile.user_type;
      if (effectiveUserType === "shop") {
        navigation.setCurrentTab("requests");
        navigation.setViewMode("dashboard");
      } else if (effectiveUserType === "insurer") {
        navigation.setCurrentTab("claims");
        navigation.setViewMode("dashboard");
      } else {
        navigation.setViewMode("reports-list");
      }
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
    }) => {
      await handleAcceptBid(details, userProfile, navigation, userData, websiteIdentity);
    },
    onRejectBid: async (details: { bidId: string; shopName: string }) => {
      const rejectedBid = await updateBidStatus(details.bidId, "rejected", userProfile?.id);
      if (!rejectedBid) {
        throw new Error("Failed to reject bid — backend did not confirm");
      }
      // Update local bids state so UI reflects the change immediately
      userData.setBids(
        userData.bids.map((b: Bid) => (b.id === details.bidId ? { ...b, status: "rejected" } : b))
      );
    },
    onPasswordChange: () => {
      openUserProfile?.();
    },
    onDeleteAccount: handleDeleteAccount,
    onSaveVehicles: async (vehicles: Vehicle[]) => {
      // Detect vehicles that were removed and delete them from Supabase
      const removedVehicles = userData.vehicles.filter(
        (existing) => existing.id && !vehicles.some((v) => v.id === existing.id)
      );
      if (removedVehicles.length > 0) {
        const clerkUserId = userProfile.id;
        for (const removed of removedVehicles) {
          if (removed.id) {
            await deleteVehicle(removed.id, clerkUserId);
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
        throw new Error(`No assignment found for job ${jobId}`);
      }

      await updateJobAssignmentStatus(assignmentId, backendStatus);
    },
    onConfirmCompletion: async (reportId: string) => {
      const clerkId = userProfile?.id;
      if (clerkId) {
        await updateReportStatus(reportId, "resolved", clerkId);
      }
      userData.setReports(
        userData.reports.map((r) =>
          String(r.id) === String(reportId) ? { ...r, status: "resolved" as const } : r
        )
      );
    },
  };
}
