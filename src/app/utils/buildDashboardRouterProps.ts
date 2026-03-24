import type { UserProfile } from "../services/clerkService";
import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import type { useNavigation } from "../hooks/useNavigation";
import type { useUserData } from "../hooks/useUserData";
import { deleteVehicle } from "../services/supabaseService";

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
  onReportSubmit: (report: any) => Promise<void>;
  primaryColor: string;
  secondaryColor: string;
  userImageUrl: string;
  websiteIdentity?: WebsiteIdentity | null;
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
    bids: userData.bids,
    photoStorage: userData.photoStorage,
    selectedReportId: navigation.selectedReportId,
    websiteIdentity,
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
      navigation.setViewMode(mode as any);
    },
    onTabChange: (tab: string) => {
      navigation.setCurrentTab(tab);
    },
    onLogout: handleLogout,
    onEnterDemoMode: () => {
      navigation.setViewMode("demo-switcher" as any);
    },
    onEnableDemoMode: (accountType: string) => {
      if (accountType === userProfile.user_type) {
        navigation.exitDemoMode();
      } else {
        navigation.enableDemoMode(accountType as any);
      }
    },
    onExitDemoMode: () => {
      navigation.exitDemoMode();
    },
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
      shopName: string;
      price: number;
      timeframe: string;
    }) => {
      try {
        const { updateBidStatus } = await import("../services/supabase/bids");
        await updateBidStatus(details.bidId, "accepted");

        // Update the report status to "active" when a bid is accepted
        const reportId = navigation.selectedReportId || userData.reports[0]?.id;
        if (reportId && userProfile?.id) {
          const { updateReportStatus } = await import("../services/supabase/reports");
          await updateReportStatus(reportId.toString(), "active", userProfile.id);
          userData.setReports(
            userData.reports.map((r) => (r.id === reportId ? { ...r, status: "active" } : r))
          );
        }
      } catch (err) {
        console.error("Failed to accept bid:", err);
      }
    },
    onRejectBid: async (details: { bidId: string; shopName: string }) => {
      try {
        const { updateBidStatus } = await import("../services/supabase/bids");
        await updateBidStatus(details.bidId, "rejected");
      } catch (err) {
        console.error("Failed to reject bid:", err);
      }
    },
    onPasswordChange: () => {
      console.log("Password change not implemented");
    },
    onDeleteAccount: handleDeleteAccount,
    onSaveVehicles: (vehicles: any[]) => {
      // Detect vehicles that were removed and delete them from Supabase
      const removedVehicles = userData.vehicles.filter(
        (existing) => existing.id && !vehicles.some((v) => v.id === existing.id)
      );
      if (removedVehicles.length > 0) {
        const clerkUserId = userProfile.id;
        for (const removed of removedVehicles) {
          if (removed.id) {
            deleteVehicle(removed.id, clerkUserId).catch((err) =>
              console.error("Failed to delete vehicle from Supabase:", err)
            );
          }
        }
      }
      userData.setVehicles(vehicles);
    },
    onSaveVehicle: (vehicle: any) => {
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
  };
}
