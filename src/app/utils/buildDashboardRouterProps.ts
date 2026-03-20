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
  submitBid: (
    reportId: string,
    bidAmount: number,
    estimatedDays: number,
    description: string
  ) => Promise<void>;
  handleLogout: () => Promise<void>;
  handleProfileUpdate: (info: {
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  }) => Promise<void>;
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
  handleProfileUpdate,
  onReportSubmit,
  primaryColor,
  secondaryColor,
  userImageUrl,
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
      name: userData.userInfo.name || userProfile.name,
      email: userProfile.email,
      profileImage: userData.userInfo.profileImage || userImageUrl,
    },
    userPhone: userData.userPhone || userProfile.phone,
    vehicles: userData.vehicles,
    reports: userData.reports,
    bids: userData.bids,
    photoStorage: userData.photoStorage,
    selectedReportId: navigation.selectedReportId,
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
    onViewCoverage: () => {
      navigation.setShowLandingPage(true);
      navigation.setShowProfileDropdown(false);
      window.setTimeout(() => {
        document.getElementById("coverage")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
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
      navigation.setSelectedReportId(reportId);
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
    onProfileUpdate: handleProfileUpdate,
    onSaveVehicles: (vehicles: any[]) => {
      userData.setVehicles(vehicles);
      void userData.saveVehicles(vehicles);
    },
    onSaveVehicle: (vehicle: any) => {
      const existingIndex = userData.vehicles.findIndex((entry) => entry.id === vehicle.id);
      const nextVehicles =
        existingIndex >= 0
          ? userData.vehicles.map((entry) => (entry.id === vehicle.id ? vehicle : entry))
          : [...userData.vehicles, vehicle];

      userData.setVehicles(nextVehicles);
      void userData.saveVehicles(nextVehicles);
    },
    hasSeenPhotoGuide: userData.hasSeenPhotoGuide,
    onPhotoGuideComplete: () => {
      userData.setHasSeenPhotoGuide(true);
    },
    onReportSubmit,
  };
}
