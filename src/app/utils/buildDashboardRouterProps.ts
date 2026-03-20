import type { UserProfile } from "../services/clerkService";
import type { useNavigation } from "../hooks/useNavigation";
import type { useUserData } from "../hooks/useUserData";
import { logWorkflowEvent } from "../services/supabaseService";

type NavigationState = ReturnType<typeof useNavigation>;
type UserDataState = ReturnType<typeof useUserData>;

type BuildDashboardRouterPropsArgs = {
  navigation: NavigationState;
  userProfile: UserProfile;
  userData: UserDataState;
  submitBid: (reportId: string, bidAmount: number) => void;
  handleLogout: () => Promise<void>;
  onReportSubmit: (report: any) => Promise<void>;
  primaryColor: string;
  secondaryColor: string;
  userImageUrl: string;
};

export function buildDashboardRouterProps({
  navigation,
  userProfile,
  userData,
  submitBid,
  handleLogout,
  onReportSubmit,
  primaryColor,
  secondaryColor,
  userImageUrl
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
      profileImage: userImageUrl
    },
    userPhone: userProfile.phone,
    vehicles: userData.vehicles,
    reports: userData.reports,
    bids: userData.bids,
    photoStorage: userData.photoStorage,
    selectedReportId: navigation.selectedReportId === null
      ? null
      : navigation.selectedReportId.toString(),
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
      navigation.setViewMode("shop-directory" as any);
    },
    onCreateNewClaim: () => {
      navigation.setViewMode("new-claim");
    },
    onViewCompetitors: () => {
      navigation.setViewMode("competitor-analysis" as any);
    },
    onViewInsurers: () => {
      navigation.setViewMode("insurance-companies" as any);
    },
    onSelectReport: (reportId: string) => {
      navigation.setSelectedReportId(parseInt(reportId));
    },
    onViewModeChange: (mode: string) => {
      navigation.setViewMode(mode as any);
    },
    onTabChange: (tab: string) => {
      navigation.setCurrentTab(tab);
    },
    onLogout: handleLogout,
    onAcceptBid: (details: { shopName: string; price: number; timeframe: string }) => {
      userData.setActivities([
        {
          id: Date.now().toString(),
          timestamp: Date.now(),
          type: "job_accepted",
          message: `Accepted bid from ${details.shopName} for $${details.price.toLocaleString()}`,
          metadata: {
            shopName: details.shopName,
            price: details.price,
            timeframe: details.timeframe,
          },
        },
        ...userData.activities,
      ] as any);

      void logWorkflowEvent({
        event_type: "bid_selected",
        source: "dashboard",
        payload: {
          shop_name: details.shopName,
          amount: details.price,
          timeframe: details.timeframe,
        },
      });

      void logWorkflowEvent({
        event_type: "repair_scheduled",
        source: "dashboard",
        payload: {
          shop_name: details.shopName,
          timeframe: details.timeframe,
        },
      });
    },
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
    onProfileUpdate: (info: { name: string; email: string; profileImage?: string; phone?: string }) => {
      userData.setUserInfo({
        name: info.name,
        email: info.email,
        profileImage: info.profileImage || ""
      });
      if (info.phone) {
        userData.setUserPhone(info.phone);
      }
    },
    onPasswordChange: () => {
      console.log("Password change not implemented");
    },
    onDeleteAccount: () => {
      console.log("Delete account not implemented");
    },
    onSaveVehicles: (vehicles: any[]) => {
      userData.setVehicles(vehicles);
    },
    onSaveVehicle: (vehicle: any) => {
      const existingIndex = userData.vehicles.findIndex((entry) => entry.id === vehicle.id);
      if (existingIndex >= 0) {
        userData.setVehicles(userData.vehicles.map((entry) => (entry.id === vehicle.id ? vehicle : entry)));
      } else {
        userData.setVehicles([...userData.vehicles, vehicle]);
      }
    },
    hasSeenPhotoGuide: userData.hasSeenPhotoGuide,
    onPhotoGuideComplete: () => {
      userData.setHasSeenPhotoGuide(true);
    },
    onReportSubmit
  };
}
