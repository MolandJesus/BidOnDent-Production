import type { WebsiteIdentity } from "../services/auth/websiteIdentity";

export type DashboardUserType = "customer" | "shop" | "insurer";

export interface DashboardRouterProps {
  // Navigation state
  viewMode: string;
  currentTab: string;

  // User data
  userType: DashboardUserType;
  userInfo: {
    name: string;
    email: string;
    profileImage?: string;
  };
  userPhone: string;
  reports: any[];
  reportsLoading?: boolean;
  reportsError?: string | null;
  vehicles: any[];
  bids: any[];
  photoStorage: { [key: string]: string[] };
  selectedReportId: string | null;
  websiteIdentity?: WebsiteIdentity | null;
  demoMode?: boolean;
  originalAccountType?: DashboardUserType | null;

  // Styling
  primaryColor: string;
  secondaryColor: string;

  // Handlers
  onStartReport: () => void;
  onSubmitBid: (
    reportId: string,
    bidAmount: number,
    estimatedDays: number,
    description: string
  ) => void | Promise<void>;
  onViewAllReports: () => void;
  onViewCoverage?: () => void;
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
  onLogout: () => void | Promise<void>;
  onAcceptBid?: (details: {
    bidId: string;
    shopName: string;
    price: number;
    timeframe: string;
  }) => void;
  onRejectBid?: (details: { bidId: string; shopName: string }) => void;
  onEnterDemoMode?: () => void;
  onEnableDemoMode?: (accountType: DashboardUserType) => void;
  onExitDemoMode?: () => void;

  // Account-specific handlers
  onProfileUpdate: (info: {
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  }) => void | Promise<void>;
  onPasswordChange: (passwords: { current: string; new: string }) => void;
  onDeleteAccount: () => void;
  onSaveVehicles: (vehicles: any[]) => void;
  onSaveVehicle: (vehicle: any) => void;
  hasSeenPhotoGuide: boolean;
  onPhotoGuideComplete: () => void;
  onReportSubmit: (report: any) => void | Promise<void>;
}
