import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import type { ReactNode } from "react";

// Import all screens
import HomeScreen from "../components/codelayer/HomeScreen";
import ReportScreen from "../components/codelayer/ReportScreen";
import BidsScreen from "../components/codelayer/BidsScreen";
import AccountScreen from "../components/codelayer/AccountScreen";
import ShopRequestsScreen from "../components/shop/ShopRequestsScreen";
import ShopActiveJobsScreen from "../components/shop/ShopActiveJobsScreen";
import LikedShopsScreen from "../components/shop/LikedShopsScreen";
import VehicleProfileScreen from "../components/shop/VehicleProfileScreen";
import ShopDirectoryScreen from "../components/shop/ShopDirectoryScreen";
import InsurerClaimsScreen from "../components/insurer/InsurerClaimsScreen";
import InsurerPartnerShopsScreen from "../components/insurer/InsurerPartnerShopsScreen";
import InsurerConnectionScreen from "../components/insurer/InsurerConnectionScreen";
import InsurerNewClaimScreen from "../components/insurer/InsurerNewClaimScreen";
import InsuranceCompaniesScreen from "../components/insurer/InsuranceCompaniesScreen";
import ReportsListScreen from "../components/reports/ReportsListScreen";
import ReportDetailScreen from "../components/reports/ReportDetailScreen";
import CompetitorAnalysisScreen from "../components/reports/CompetitorAnalysisScreen";
import DemoAccountSwitcher from "../components/demo/DemoAccountSwitcher";
import SmokeTestScreen from "../components/demo/SmokeTestScreen";
import { SEED_DAMAGE_REPORTS } from "../constants";

const screenTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.2 },
};

function AnimatedScreen({ screenKey, children }: { screenKey: string; children: ReactNode }) {
  return (
    <motion.div key={screenKey} {...screenTransition}>
      {children}
    </motion.div>
  );
}

interface DashboardRouterProps {
  // Navigation state
  viewMode: string;
  currentTab: string;

  // User data
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
  onAcceptBid?: (details: { shopName: string; price: number; timeframe: string }) => void;
  onEnterDemoMode?: () => void;
  onEnableDemoMode?: (accountType: "customer" | "shop" | "insurer") => void;
  onExitDemoMode?: () => void;

  // Account-specific handlers
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

export default function DashboardRouter({
  viewMode,
  currentTab,
  userType,
  userInfo,
  userPhone,
  reports,
  vehicles,
  bids,
  photoStorage,
  selectedReportId,
  primaryColor,
  secondaryColor,
  onStartReport,
  onSubmitBid,
  onViewAllReports,
  onConnectInsurance,
  onViewLikedShops,
  onViewBids,
  onViewRequests,
  onViewJobs,
  onViewClaims,
  onViewShops,
  onCreateNewClaim,
  onViewCompetitors,
  onViewInsurers,
  onSelectReport,
  onViewModeChange,
  onTabChange,
  onLogout,
  onAcceptBid,
  onEnterDemoMode,
  onEnableDemoMode,
  onExitDemoMode,
  onProfileUpdate,
  onSaveVehicles,
  onSaveVehicle,
  hasSeenPhotoGuide,
  onPhotoGuideComplete,
  onReportSubmit,
  demoMode,
  originalAccountType,
}: DashboardRouterProps) {
  // Scroll to top whenever view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewMode, currentTab]);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* Dashboard Home Screen */}
        {viewMode === "dashboard" && currentTab === "home" && (
          <AnimatedScreen screenKey="home">
            <HomeScreen
              userType={userType}
              userInfo={userInfo}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onStartReport={onStartReport}
              onViewAllReports={onViewAllReports}
              onOpenReport={(reportId) => {
                if (userType === "customer") {
                  onSelectReport(reportId);
                  onViewModeChange("report-detail");
                  return;
                }

                if (userType === "shop") {
                  onTabChange("requests");
                  onViewModeChange("dashboard");
                  return;
                }

                onTabChange("claims");
                onViewModeChange("dashboard");
              }}
              onConnectInsurance={onConnectInsurance}
              onViewLikedShops={onViewLikedShops}
              onViewBids={onViewBids}
              onViewRequests={onViewRequests}
              onViewJobs={onViewJobs}
              onViewClaims={onViewClaims}
              onViewShops={onViewShops}
              onCreateNewClaim={onCreateNewClaim}
              onViewCompetitors={onViewCompetitors}
              onViewInsurers={onViewInsurers}
              onEnterDemoMode={onEnterDemoMode}
              demoMode={demoMode}
              originalAccountType={originalAccountType || undefined}
              onExitDemoMode={onExitDemoMode}
              reports={
                // For shops and insurers, show seed reports (available requests/claims)
                // For customers, show only their own reports
                userType === "shop" || userType === "insurer"
                  ? SEED_DAMAGE_REPORTS
                  : reports.map((report) => ({
                      ...report,
                      photos: photoStorage[report.id] || [],
                    }))
              }
            />
          </AnimatedScreen>
        )}

        {/* Customer: Report Screen */}
        {viewMode === "dashboard" && currentTab === "report" && userType === "customer" && (
          <AnimatedScreen screenKey="report">
            <ReportScreen
              primaryColor={primaryColor}
              vehicles={vehicles}
              onSaveVehicle={onSaveVehicle}
              hasSeenPhotoGuide={hasSeenPhotoGuide}
              onPhotoGuideComplete={onPhotoGuideComplete}
              onReportSubmit={onReportSubmit}
              onViewReports={() => {
                // Navigate to "reports-list" viewMode which shows the reports list
                onViewModeChange("reports-list");
              }}
              onBackToDashboard={() => {
                // Navigate back to home tab on dashboard
                onTabChange("home");
                onViewModeChange("dashboard");
              }}
            />
          </AnimatedScreen>
        )}

        {/* Customer: Bids Screen */}
        {viewMode === "dashboard" && currentTab === "bids" && userType === "customer" && (
          <AnimatedScreen screenKey="bids">
            <BidsScreen
              primaryColor={primaryColor}
              userType={userType}
              onAcceptBid={onAcceptBid}
              onBack={() => {
                onTabChange("home");
                onViewModeChange("dashboard");
              }}
            />
          </AnimatedScreen>
        )}

        {/* Shop: Requests Screen */}
        {viewMode === "dashboard" && currentTab === "requests" && userType === "shop" && (
          <AnimatedScreen screenKey="requests">
            <ShopRequestsScreen
              primaryColor={primaryColor}
              reports={reports}
              onSubmitBid={(requestId, bidAmount) => {
                // Find the report to get more details
                const report = reports.find((r) => r.id === requestId);
                if (report) {
                  // Call the bid submission handler with all required parameters
                  // For now, using default values for estimated days and description
                  onSubmitBid(
                    requestId,
                    bidAmount,
                    3, // Default 3 days
                    "Professional repair service with quality guarantee" // Default description
                  );
                }
              }}
            />
          </AnimatedScreen>
        )}

        {/* Shop: Active Jobs Screen */}
        {viewMode === "dashboard" && currentTab === "jobs" && userType === "shop" && (
          <AnimatedScreen screenKey="jobs">
            <ShopActiveJobsScreen primaryColor={primaryColor} reports={reports} />
          </AnimatedScreen>
        )}

        {/* Insurer: Claims Screen */}
        {viewMode === "dashboard" && currentTab === "claims" && userType === "insurer" && (
          <AnimatedScreen screenKey="claims">
            <InsurerClaimsScreen primaryColor={primaryColor} reports={reports} />
          </AnimatedScreen>
        )}

        {/* Insurer: Partner Shops Screen */}
        {viewMode === "dashboard" && currentTab === "shops" && userType === "insurer" && (
          <AnimatedScreen screenKey="shops">
            <InsurerPartnerShopsScreen primaryColor={primaryColor} reports={reports} />
          </AnimatedScreen>
        )}

        {/* Account Screen (All Users) */}
        {viewMode === "dashboard" && currentTab === "account" && (
          <AnimatedScreen screenKey="account">
            <AccountScreen
              userType={userType}
              primaryColor={primaryColor}
              userName={userInfo.name}
              userEmail={userInfo.email}
              userPhone={userPhone}
              profileImage={userInfo.profileImage}
              vehicles={vehicles}
              reports={reports}
              onLogout={onLogout}
              onSaveProfile={async (data) => {
                // Update user info with new data
                onProfileUpdate({
                  name: data.name,
                  email: data.email,
                  phone: data.phone,
                  profileImage: data.profileImage, // Use new profile image directly
                });
              }}
              onViewVehicles={() => {
                // Navigate to vehicle profile screen
                onViewModeChange("vehicles");
              }}
              onViewReport={(reportId) => {
                onSelectReport(reportId);
                onViewModeChange("report-detail");
              }}
              onOpenSmokeTest={() => {
                onViewModeChange("smoke-test");
              }}
            />
          </AnimatedScreen>
        )}

        {/* Reports List Screen */}
        {viewMode === "reports-list" && (
          <AnimatedScreen screenKey="reports-list">
            <ReportsListScreen
              reports={reports.map((report) => ({
                ...report,
                photos: photoStorage[report.id] || report.photos || [],
              }))}
              onBack={() => onViewModeChange("dashboard")}
              onSelectReport={(reportId) => {
                onSelectReport(reportId);
                onViewModeChange("report-detail");
              }}
              primaryColor={primaryColor}
            />
          </AnimatedScreen>
        )}

        {/* Report Detail Screen */}
        {viewMode === "report-detail" && selectedReportId && (
          <AnimatedScreen screenKey="report-detail">
            <ReportDetailScreen
              report={{
                ...reports.find((r) => r.id === selectedReportId)!,
                photos:
                  photoStorage[selectedReportId] ||
                  reports.find((r) => r.id === selectedReportId)?.photos ||
                  [],
              }}
              onBack={() => onViewModeChange("reports-list")}
              primaryColor={primaryColor}
            />
          </AnimatedScreen>
        )}

        {viewMode === "smoke-test" && (
          <AnimatedScreen screenKey="smoke-test">
            <SmokeTestScreen primaryColor={primaryColor} />
          </AnimatedScreen>
        )}

        {/* Insurer Connect Screen */}
        {viewMode === "insurer-connect" && (
          <AnimatedScreen screenKey="insurer-connect">
            <InsurerConnectionScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </AnimatedScreen>
        )}

        {/* Liked Shops Screen */}
        {viewMode === "liked-shops" && (
          <AnimatedScreen screenKey="liked-shops">
            <LikedShopsScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </AnimatedScreen>
        )}

        {/* Vehicles Screen */}
        {viewMode === "vehicles" && (
          <AnimatedScreen screenKey="vehicles">
            <VehicleProfileScreen
              vehicles={vehicles}
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              onSaveVehicles={onSaveVehicles}
            />
          </AnimatedScreen>
        )}

        {/* Shop Directory Screen */}
        {viewMode === "shop-directory" && (
          <AnimatedScreen screenKey="shop-directory">
            <ShopDirectoryScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </AnimatedScreen>
        )}

        {/* Insurer New Claim Screen */}
        {viewMode === "new-claim" && userType === "insurer" && (
          <AnimatedScreen screenKey="new-claim">
            <InsurerNewClaimScreen
              primaryColor={primaryColor}
              reports={reports}
              onBack={() => onViewModeChange("dashboard")}
            />
          </AnimatedScreen>
        )}

        {/* Insurance Companies Screen */}
        {viewMode === "insurance-companies" && (
          <AnimatedScreen screenKey="insurance-companies">
            <InsuranceCompaniesScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              userType={userType}
            />
          </AnimatedScreen>
        )}

        {/* Competitor Analysis Screen */}
        {viewMode === "competitor-analysis" && (
          <AnimatedScreen screenKey="competitor-analysis">
            <CompetitorAnalysisScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </AnimatedScreen>
        )}

        {/* Demo Account Switcher */}
        {viewMode === "demo-switcher" && (
          <AnimatedScreen screenKey="demo-switcher">
            <DemoAccountSwitcher
              currentAccountType={userType}
              onSelectAccountType={(type) => {
                if (onEnableDemoMode) {
                  onEnableDemoMode(type);
                }
              }}
              onExitDemo={() => {
                if (onExitDemoMode) {
                  onExitDemoMode();
                } else {
                  onViewModeChange("dashboard");
                }
              }}
              primaryColor={primaryColor}
            />
          </AnimatedScreen>
        )}
      </AnimatePresence>
    </div>
  );
}
