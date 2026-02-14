export interface DashboardRouterProps {
  viewMode: string;
  currentTab: string;
  userType: "customer" | "shop" | "insurer";
  userInfo: {
    name: string;
    email: string;
    profileImage?: string;
  };
  userPhone: string;
  reports: any[];
  vehicles: any[];
  bids: any[];
  photoStorage: { [key: string]: string[] };
  selectedReportId: string | null;
  demoMode?: boolean;
  originalAccountType?: "customer" | "shop" | "insurer" | null;
  primaryColor: string;
  secondaryColor: string;
  onStartReport: () => void;
  onSubmitBid: (
    reportId: string,
    bidAmount: number,
    estimatedDays: number,
    description: string
  ) => void;
  onViewAllReports: () => void;
  onConnectInsurance: () => void;
  onViewLikedShops: () => void;
  onViewBids: () => void;
  onViewRequests: () => void;
  onViewJobs: () => void;
  onViewClaims: () => void;
  onViewShops: () => void;
  onCreateNewClaim: () => void;
  onViewCompetitors?: () => void;
  onViewInsurers?: () => void;
  onSelectReport: (reportId: string) => void;
  onViewModeChange: (mode: string) => void;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onEnterDemoMode?: () => void;
  onEnableDemoMode?: (accountType: "customer" | "shop" | "insurer") => void;
  onExitDemoMode?: () => void;
  onProfileUpdate: (info: {
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  }) => void;
  onPasswordChange: (passwords: { current: string; new: string }) => void;
  onDeleteAccount: () => void;
  onSaveVehicles: (vehicles: any[]) => void;
  onSaveVehicle: (vehicle: any) => void;
  hasSeenPhotoGuide: boolean;
  onPhotoGuideComplete: () => void;
  onReportSubmit: (report: any) => void;
}
