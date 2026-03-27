import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useEffect } from "react";
import { ScreenErrorBoundary } from "../components/ScreenErrorBoundary";
import { useBidsForReport } from "../hooks/useBidsForReport";
import { useMarketplaceReports } from "../hooks/useMarketplaceReports";

// Lazy-loaded screens for route-level code splitting
const HomeScreen = lazy(() => import("../components/codelayer/HomeScreen"));
const ReportScreen = lazy(() => import("../components/codelayer/ReportScreen"));
const BidsScreen = lazy(() => import("../components/codelayer/BidsScreen"));
const AccountScreen = lazy(() => import("../components/codelayer/AccountScreen"));
const ShopRequestsScreen = lazy(() => import("../components/shop/ShopRequestsScreen"));
const ShopActiveJobsScreen = lazy(() => import("../components/shop/ShopActiveJobsScreen"));
const LikedShopsScreen = lazy(() => import("../components/shop/LikedShopsScreen"));
const VehicleProfileScreen = lazy(() => import("../components/shop/VehicleProfileScreen"));
const ShopDirectoryScreen = lazy(() => import("../components/shop/ShopDirectoryScreen"));
const InsurerClaimsScreen = lazy(() => import("../components/insurer/InsurerClaimsScreen"));
const InsurerPartnerShopsScreen = lazy(
  () => import("../components/insurer/InsurerPartnerShopsScreen")
);
const InsurerConnectionScreen = lazy(() => import("../components/insurer/InsurerConnectionScreen"));
const InsurerNewClaimScreen = lazy(() => import("../components/insurer/InsurerNewClaimScreen"));
const InsuranceCompaniesScreen = lazy(
  () => import("../components/insurer/InsuranceCompaniesScreen")
);
const ReportsListScreen = lazy(() => import("../components/reports/ReportsListScreen"));
const ReportDetailScreen = lazy(() => import("../components/reports/ReportDetailScreen"));
const CompetitorAnalysisScreen = lazy(
  () => import("../components/reports/CompetitorAnalysisScreen")
);
const DemoAccountSwitcher = lazy(() => import("../components/demo/DemoAccountSwitcher"));
const SmokeTestScreen = lazy(() => import("../components/demo/SmokeTestScreen"));

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
  appearanceMode,
  onAppearanceModeChange,
  reportsLoading,
  reportsError,
}: DashboardRouterProps) {
  // Fetch live bids from Supabase for the selected report
  // Falls back to the customer's most recent report if no specific report is selected
  const bidsReportId =
    currentTab === "bids" && userType === "customer"
      ? selectedReportId || reports[0]?.id || null
      : null;
  const { bids: liveBids } = useBidsForReport(bidsReportId);

  // Fetch all reports from Supabase for shop/insurer marketplace views
  const { marketplaceReports, loading: marketplaceLoading } = useMarketplaceReports(userType);
  const shopInsurerReports =
    marketplaceReports.length > 0 ? marketplaceReports : SEED_DAMAGE_REPORTS;

  // Scroll to top whenever view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewMode, currentTab]);

  const hasRouteMatch =
    (viewMode === "dashboard" && currentTab === "home") ||
    (viewMode === "dashboard" && currentTab === "report" && userType === "customer") ||
    (viewMode === "dashboard" && currentTab === "bids" && userType === "customer") ||
    (viewMode === "dashboard" && currentTab === "requests" && userType === "shop") ||
    (viewMode === "dashboard" && currentTab === "jobs" && userType === "shop") ||
    (viewMode === "dashboard" && currentTab === "claims" && userType === "insurer") ||
    (viewMode === "dashboard" && currentTab === "shops" && userType === "insurer") ||
    (viewMode === "dashboard" && currentTab === "account") ||
    viewMode === "reports-list" ||
    viewMode === "report-detail" ||
    viewMode === "smoke-test" ||
    viewMode === "insurer-connect" ||
    viewMode === "liked-shops" ||
    viewMode === "vehicles" ||
    viewMode === "shop-directory" ||
    (viewMode === "new-claim" && userType === "insurer") ||
    viewMode === "insurance-companies" ||
    viewMode === "competitor-analysis" ||
    viewMode === "demo-switcher";

  return (
    <div className="w-full">
      <ScreenErrorBoundary>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <AnimatePresence mode="wait">
            {/* Dashboard Home Screen */}
            {viewMode === "dashboard" && currentTab === "home" && (
              <motion.div key="home" {...screenTransition}>
                <HomeScreen
                  userType={userType}
                  appearanceMode={appearanceMode}
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
                  appearanceMode={appearanceMode}
                  vehicles={vehicles}
                  onSaveVehicle={onSaveVehicle}
                  hasSeenPhotoGuide={hasSeenPhotoGuide}
                  onPhotoGuideComplete={onPhotoGuideComplete}
                  onReportSubmit={onReportSubmit}
                  onViewReports={() => {
                    // Navigate to "reports-list" viewMode which shows the reports list
                    onViewModeChange("reports-list");
                  }}
                  onViewShops={onViewShops}
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
                  appearanceMode={appearanceMode}
                  onAcceptBid={onAcceptBid}
                  onRejectBid={onRejectBid}
                  onStartReport={() => onTabChange("report")}
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
                  reportsLoading={marketplaceLoading}
                  appearanceMode={appearanceMode}
                  onSubmitBid={(requestId, bidAmount, estimatedDays, description) => {
                    onSubmitBid(requestId.toString(), bidAmount, estimatedDays, description);
                  }}
                />
              </motion.div>
            )}

            {/* Shop: Active Jobs Screen */}
            {viewMode === "dashboard" && currentTab === "jobs" && userType === "shop" && (
              <motion.div key="jobs" {...screenTransition}>
                <ShopActiveJobsScreen
                  primaryColor={primaryColor}
                  reports={shopInsurerReports}
                  appearanceMode={appearanceMode}
                />
              </motion.div>
            )}

            {/* Insurer: Claims Screen */}
            {viewMode === "dashboard" && currentTab === "claims" && userType === "insurer" && (
              <motion.div key="claims" {...screenTransition}>
                <InsurerClaimsScreen
                  primaryColor={primaryColor}
                  reports={shopInsurerReports}
                  reportsLoading={marketplaceLoading}
                  appearanceMode={appearanceMode}
                  onApproveClaim={(claimId, amount) => {
                    console.info("[BidOnDent] Claim approved:", { claimId, amount });
                  }}
                />
              </motion.div>
            )}

            {/* Insurer: Partner Shops Screen */}
            {viewMode === "dashboard" && currentTab === "shops" && userType === "insurer" && (
              <motion.div key="shops" {...screenTransition}>
                <InsurerPartnerShopsScreen
                  primaryColor={primaryColor}
                  identity={websiteIdentity}
                  appearanceMode={appearanceMode}
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
                  appearanceMode={appearanceMode}
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
                  onAppearanceModeChange={onAppearanceModeChange}
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
                  reportsLoading={reportsLoading ?? false}
                  reportsError={reportsError ?? null}
                  onBack={() => onViewModeChange("dashboard")}
                  onSelectReport={(reportId) => {
                    onSelectReport(String(reportId));
                    onViewModeChange("report-detail");
                  }}
                  primaryColor={primaryColor}
                  appearanceMode={appearanceMode}
                />
              </motion.div>
            )}

            {/* Report Detail Screen */}
            {viewMode === "report-detail" && selectedReportId && (
              <motion.div key="report-detail" {...screenTransition}>
                {reports.find((r) => r.id === selectedReportId) ? (
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
                    appearanceMode={appearanceMode}
                  />
                ) : (
                  <div className="pb-20 px-4 md:px-6 py-4 md:py-5 text-center">
                    <p className="text-slate-600">Report not found.</p>
                    <button
                      onClick={() => onViewModeChange("reports-list")}
                      className="mt-4 px-4 py-2 rounded-xl text-white font-medium"
                      style={{ background: primaryColor }}
                    >
                      Back to Reports
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {viewMode === "report-detail" && !selectedReportId && (
              <motion.div key="report-detail-missing" {...screenTransition}>
                <div className="pb-20 px-4 md:px-6 py-4 md:py-5 text-center">
                  <p className="text-slate-600">No report selected.</p>
                  <button
                    onClick={() => onViewModeChange("reports-list")}
                    className="mt-4 px-4 py-2 rounded-xl text-white font-medium"
                    style={{ background: primaryColor }}
                  >
                    Back to Reports
                  </button>
                </div>
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
                  appearanceMode={appearanceMode}
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
                  appearanceMode={appearanceMode}
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
                  appearanceMode={appearanceMode}
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
                  appearanceMode={appearanceMode}
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
                  appearanceMode={appearanceMode}
                  onBack={() => onViewModeChange("dashboard")}
                  onCreateClaim={(claimData) => {
                    console.info("[BidOnDent] New claim created:", claimData);
                    onTabChange("claims");
                    onViewModeChange("dashboard");
                  }}
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
                  appearanceMode={appearanceMode}
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

            {!hasRouteMatch && (
              <motion.div key="route-fallback" {...screenTransition}>
                <div className="pb-20 px-4 md:px-6 py-4 md:py-5 text-center">
                  <p className="text-slate-600">
                    We couldn't load this view. Returning to dashboard.
                  </p>
                  <button
                    onClick={() => {
                      onTabChange("home");
                      onViewModeChange("dashboard");
                    }}
                    className="mt-4 px-4 py-2 rounded-xl text-white font-medium"
                    style={{ background: primaryColor }}
                  >
                    Go to Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </ScreenErrorBoundary>
    </div>
  );
}
