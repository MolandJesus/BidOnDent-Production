import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

// Import all screens
import HomeScreen from "../components/codelayer/HomeScreen";
import ReportScreen from "../components/codelayer/ReportScreen";
import BidsScreen from "../components/codelayer/BidsScreen";
import AccountScreen from "../components/codelayer/AccountScreen";
import AdminDashboard from "../components/admin/AdminDashboard";
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
import { isAdmin } from "../utils/adminCheck";

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
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        )}

        {/* Customer: Report Screen */}
        {viewMode === "dashboard" && currentTab === "report" && userType === "customer" && (
          <motion.div
            key="report"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        )}

        {/* Customer: Bids Screen */}
        {viewMode === "dashboard" && currentTab === "bids" && userType === "customer" && (
          <motion.div
            key="bids"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <BidsScreen
              primaryColor={primaryColor}
              userType={userType}
              onBack={() => {
                onTabChange("home");
                onViewModeChange("dashboard");
              }}
            />
          </motion.div>
        )}

        {/* Shop: Requests Screen */}
        {viewMode === "dashboard" && currentTab === "requests" && userType === "shop" && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ShopRequestsScreen
              primaryColor={primaryColor}
              onSubmitBid={(requestId, bidAmount) => {
                // Find the report to get more details
                const report = reports.find((r) => r.id === requestId.toString());
                if (report) {
                  // Call the bid submission handler with all required parameters
                  // For now, using default values for estimated days and description
                  onSubmitBid(
                    requestId.toString(),
                    bidAmount,
                    3, // Default 3 days
                    "Professional repair service with quality guarantee" // Default description
                  );
                }
              }}
            />
          </motion.div>
        )}

        {/* Shop: Active Jobs Screen */}
        {viewMode === "dashboard" && currentTab === "jobs" && userType === "shop" && (
          <motion.div
            key="jobs"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ShopActiveJobsScreen primaryColor={primaryColor} />
          </motion.div>
        )}

        {/* Insurer: Claims Screen */}
        {viewMode === "dashboard" && currentTab === "claims" && userType === "insurer" && (
          <motion.div
            key="claims"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <InsurerClaimsScreen primaryColor={primaryColor} />
          </motion.div>
        )}

        {/* Insurer: Partner Shops Screen */}
        {viewMode === "dashboard" && currentTab === "shops" && userType === "insurer" && (
          <motion.div
            key="shops"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <InsurerPartnerShopsScreen primaryColor={primaryColor} />
          </motion.div>
        )}

        {/* Account Screen (All Users) */}
        {viewMode === "dashboard" && currentTab === "account" && (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
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
              onOpenAdmin={() => {
                onViewModeChange("admin");
              }}
            />
          </motion.div>
        )}

        {viewMode === "admin" && isAdmin(userInfo.email) && (
          <motion.div
            key="admin"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <AdminDashboard primaryColor={primaryColor} adminEmail={userInfo.email} />
          </motion.div>
        )}

        {viewMode === "admin" && !isAdmin(userInfo.email) && (
          <motion.div
            key="admin-locked"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 md:px-6 py-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Admin access required</h2>
                <p className="text-slate-600 mt-2">
                  This section is only available to admin accounts.
                </p>
                <button
                  className="mt-4 px-4 py-2 rounded-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                  onClick={() => {
                    onTabChange("account");
                    onViewModeChange("dashboard");
                  }}
                >
                  Return to Account
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reports List Screen */}
        {viewMode === "reports-list" && (
          <motion.div
            key="reports-list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        )}

        {/* Report Detail Screen */}
        {viewMode === "report-detail" && selectedReportId && (
          <motion.div
            key="report-detail"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        )}

        {viewMode === "smoke-test" && (
          <motion.div
            key="smoke-test"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <SmokeTestScreen primaryColor={primaryColor} />
          </motion.div>
        )}

        {/* Insurer Connect Screen */}
        {viewMode === "insurer-connect" && (
          <motion.div
            key="insurer-connect"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <InsurerConnectionScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </motion.div>
        )}

        {/* Liked Shops Screen */}
        {viewMode === "liked-shops" && (
          <motion.div
            key="liked-shops"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <LikedShopsScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </motion.div>
        )}

        {/* Vehicles Screen */}
        {viewMode === "vehicles" && (
          <motion.div
            key="vehicles"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <VehicleProfileScreen
              vehicles={vehicles}
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              onSaveVehicles={onSaveVehicles}
            />
          </motion.div>
        )}

        {/* Shop Directory Screen */}
        {viewMode === "shop-directory" && (
          <motion.div
            key="shop-directory"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ShopDirectoryScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </motion.div>
        )}

        {/* Insurer New Claim Screen */}
        {viewMode === "new-claim" && userType === "insurer" && (
          <motion.div
            key="new-claim"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <InsurerNewClaimScreen
              primaryColor={primaryColor}
              onBack={() => onViewModeChange("dashboard")}
            />
          </motion.div>
        )}

        {/* Insurance Companies Screen */}
        {viewMode === "insurance-companies" && (
          <motion.div
            key="insurance-companies"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <InsuranceCompaniesScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              userType={userType}
            />
          </motion.div>
        )}

        {/* Competitor Analysis Screen */}
        {viewMode === "competitor-analysis" && (
          <motion.div
            key="competitor-analysis"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <CompetitorAnalysisScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />
          </motion.div>
        )}

        {/* Demo Account Switcher */}
        {viewMode === "demo-switcher" && (
          <motion.div
            key="demo-switcher"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
