import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { useBidsForReport } from "../hooks/useBidsForReport";
import { useMarketplaceReports } from "../hooks/useMarketplaceReports";

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
import type { DashboardRouterProps } from "./dashboard-router-types";

const screenTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.2 },
};

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
  websiteIdentity,
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
  onAcceptBid,
  onRejectBid,
  onProfileUpdate,
  onDeleteAccount,
  onSaveVehicles,
  onSaveVehicle,
  hasSeenPhotoGuide,
  onPhotoGuideComplete,
  onReportSubmit,
  demoMode,
  originalAccountType,
}: DashboardRouterProps) {
  // Fetch live bids from Supabase for the selected report
  // Falls back to the customer's most recent report if no specific report is selected
  const bidsReportId =
    currentTab === "bids" && userType === "customer"
      ? selectedReportId || reports[0]?.id || null
      : null;
  const { bids: liveBids } = useBidsForReport(bidsReportId);

  // Fetch all reports from Supabase for shop/insurer marketplace views
  const { marketplaceReports } = useMarketplaceReports(userType);
  const shopInsurerReports =
    marketplaceReports.length > 0 ? marketplaceReports : SEED_DAMAGE_REPORTS;

  // Scroll to top whenever view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewMode, currentTab]);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* Dashboard Home Screen */}
        {viewMode === "dashboard" && currentTab === "home" && (
          <motion.div key="home" {...screenTransition}>
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
                // For shops and insurers, show marketplace reports (real Supabase data with seed fallback)
                // For customers, show only their own reports
                userType === "shop" || userType === "insurer"
                  ? shopInsurerReports
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
          <motion.div key="report" {...screenTransition}>
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
          <motion.div key="bids" {...screenTransition}>
            <BidsScreen
              primaryColor={primaryColor}
              userType={userType}
              bids={liveBids.length > 0 ? liveBids : bids}
              reports={reports}
              onAcceptBid={onAcceptBid}
              onRejectBid={onRejectBid}
              onBack={() => {
                onTabChange("home");
                onViewModeChange("dashboard");
              }}
            />
          </motion.div>
        )}

        {/* Shop: Requests Screen */}
        {viewMode === "dashboard" && currentTab === "requests" && userType === "shop" && (
          <motion.div key="requests" {...screenTransition}>
            <ShopRequestsScreen
              primaryColor={primaryColor}
              reports={shopInsurerReports}
              onSubmitBid={(requestId, bidAmount, estimatedDays, description) => {
                onSubmitBid(requestId.toString(), bidAmount, estimatedDays, description);
              }}
            />
          </motion.div>
        )}

        {/* Shop: Active Jobs Screen */}
        {viewMode === "dashboard" && currentTab === "jobs" && userType === "shop" && (
          <motion.div key="jobs" {...screenTransition}>
            <ShopActiveJobsScreen primaryColor={primaryColor} reports={shopInsurerReports} />
          </motion.div>
        )}

        {/* Insurer: Claims Screen */}
        {viewMode === "dashboard" && currentTab === "claims" && userType === "insurer" && (
          <motion.div key="claims" {...screenTransition}>
            <InsurerClaimsScreen primaryColor={primaryColor} reports={shopInsurerReports} />
          </motion.div>
        )}

        {/* Insurer: Partner Shops Screen */}
        {viewMode === "dashboard" && currentTab === "shops" && userType === "insurer" && (
          <motion.div key="shops" {...screenTransition}>
            <InsurerPartnerShopsScreen
              primaryColor={primaryColor}
              identity={websiteIdentity}
              onOpenMap={() => onViewModeChange("shop-directory")}
            />
          </motion.div>
        )}

        {/* Account Screen (All Users) */}
        {viewMode === "dashboard" && currentTab === "account" && (
          <motion.div key="account" {...screenTransition}>
            <AccountScreen
              userType={userType}
              primaryColor={primaryColor}
              userName={userInfo.name}
              userEmail={userInfo.email}
              userPhone={userPhone}
              profileImage={userInfo.profileImage}
              websiteIdentity={websiteIdentity}
              vehicles={vehicles}
              reports={reports}
              onLogout={onLogout}
              onDeleteAccount={onDeleteAccount}
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
          </motion.div>
        )}

        {/* Reports List Screen */}
        {viewMode === "reports-list" && (
          <motion.div key="reports-list" {...screenTransition}>
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
          <motion.div key="report-detail" {...screenTransition}>
            <ReportDetailScreen
              report={{
                ...reports.find((r) => r.id === selectedReportId)!,
                photos:
                  photoStorage[selectedReportId] ||
                  reports.find((r) => r.id === selectedReportId)?.photos ||
                  [],
              }}
              onBack={() => onViewModeChange("reports-list")}
              onViewAllBids={() => {
                onTabChange("bids");
                onViewModeChange("dashboard");
              }}
              primaryColor={primaryColor}
            />
          </motion.div>
        )}

        {viewMode === "smoke-test" && (
          <motion.div key="smoke-test" {...screenTransition}>
            <SmokeTestScreen primaryColor={primaryColor} />
          </motion.div>
        )}

        {/* Insurer Connect Screen */}
        {viewMode === "insurer-connect" && (
          <motion.div key="insurer-connect" {...screenTransition}>
            <InsurerConnectionScreen
              onBack={() => onViewModeChange("dashboard")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              identity={websiteIdentity}
              userType={userType}
              reports={reports}
            />
          </motion.div>
        )}

        {/* Liked Shops Screen */}
        {viewMode === "liked-shops" && (
          <motion.div key="liked-shops" {...screenTransition}>
            <LikedShopsScreen
              onBack={() => onViewModeChange("dashboard")}
              onOpenMap={() => onViewModeChange("shop-directory")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              identity={websiteIdentity}
            />
          </motion.div>
        )}

        {/* Vehicles Screen */}
        {viewMode === "vehicles" && (
          <motion.div key="vehicles" {...screenTransition}>
            <VehicleProfileScreen
              vehicles={vehicles}
              onBack={() => {
                onTabChange("account");
                onViewModeChange("dashboard");
              }}
              primaryColor={primaryColor}
              onSaveVehicles={onSaveVehicles}
            />
          </motion.div>
        )}

        {/* Shop Directory Screen */}
        {viewMode === "shop-directory" && (
          <motion.div key="shop-directory" {...screenTransition}>
            <ShopDirectoryScreen
              onBack={() => onViewModeChange("dashboard")}
              onOpenRelatedScreen={() => {
                if (userType === "shop") {
                  onViewModeChange("competitor-analysis");
                  return;
                }

                if (userType === "insurer") {
                  onTabChange("shops");
                  onViewModeChange("dashboard");
                  return;
                }

                onViewModeChange("liked-shops");
              }}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              identity={websiteIdentity}
              userType={userType}
              userInfo={userInfo}
              vehicles={vehicles}
              reports={reports}
            />
          </motion.div>
        )}

        {/* Insurer New Claim Screen */}
        {viewMode === "new-claim" && userType === "insurer" && (
          <motion.div key="new-claim" {...screenTransition}>
            <InsurerNewClaimScreen
              primaryColor={primaryColor}
              onBack={() => onViewModeChange("dashboard")}
            />
          </motion.div>
        )}

        {/* Insurance Companies Screen */}
        {viewMode === "insurance-companies" && (
          <motion.div key="insurance-companies" {...screenTransition}>
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
          <motion.div key="competitor-analysis" {...screenTransition}>
            <CompetitorAnalysisScreen
              onBack={() => onViewModeChange("dashboard")}
              onOpenMap={() => onViewModeChange("shop-directory")}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              identity={websiteIdentity}
            />
          </motion.div>
        )}

        {/* Demo Account Switcher */}
        {viewMode === "demo-switcher" && (
          <motion.div key="demo-switcher" {...screenTransition}>
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
