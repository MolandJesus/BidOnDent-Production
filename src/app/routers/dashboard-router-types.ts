import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import type { DamageReport, Vehicle, Bid, ViewMode } from "../types";

export type DashboardUserType = "customer" | "shop" | "insurer";
export type DashboardAppearanceMode = "map-dark" | "light";

export interface DashboardRouterProps {
  // Navigation state
  viewMode: ViewMode;
  currentTab: string;

  // User data
  userType: DashboardUserType;
  userInfo: {
    name: string;
    email: string;
    profileImage?: string;
  };
  userPhone: string;
  reports: DamageReport[];
  reportsLoading?: boolean;
  reportsError?: string | null;
  vehicles: Vehicle[];
  bids: Bid[];
  photoStorage: { [key: string]: string[] };
  selectedReportId: string | null;
  websiteIdentity?: WebsiteIdentity | null;
  demoMode?: boolean;
  originalAccountType?: DashboardUserType | null;
  appearanceMode: DashboardAppearanceMode;

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
    shopId?: string;
    shopName: string;
    price: number;
    timeframe: string;
    reportId?: string;
  }) => void;
  onRejectBid?: (details: { bidId: string; shopName: string }) => void;
  onUpdateJobStatus?: (jobId: number, status: string) => void;
  onConfirmCompletion?: (reportId: string) => void;
  onEnterDemoMode?: () => void;
  onEnableDemoMode?: (accountType: DashboardUserType) => void;
  onExitDemoMode?: () => void;
  onAppearanceModeChange: (mode: DashboardAppearanceMode) => void;

  // Account-specific handlers
  onProfileUpdate: (info: {
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
  }) => void | Promise<void>;
  onPasswordChange: (passwords: { current: string; new: string }) => void;
  onDeleteAccount: () => void;
  onSaveVehicles: (vehicles: Vehicle[]) => void;
  onSaveVehicle: (vehicle: Vehicle) => void;
  hasSeenPhotoGuide: boolean;
  onPhotoGuideComplete: () => void;
  onReportSubmit: (report: DamageReport) => void | Promise<void>;
}
