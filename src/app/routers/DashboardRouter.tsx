import { AnimatePresence, motion } from "motion/react";
import { Suspense, useEffect } from "react";
import { ScreenErrorBoundary } from "../components/ScreenErrorBoundary";
import { useBidsForReport } from "../hooks/useBidsForReport";
import { useDashboardData } from "./useDashboardData";
import { lazyWithRetry } from "../utils/lazyWithRetry";

// Lazy-loaded screens with automatic retry on chunk load failure
const HomeScreen = lazyWithRetry(() => import("../components/codelayer/HomeScreen"));
const ReportScreen = lazyWithRetry(() => import("../components/codelayer/ReportScreen"));
const BidsScreen = lazyWithRetry(() => import("../components/codelayer/BidsScreen"));
const AccountScreen = lazyWithRetry(() => import("../components/codelayer/AccountScreen"));
const ShopRequestsScreen = lazyWithRetry(() => import("../components/shop/ShopRequestsScreen"));
const ShopActiveJobsScreen = lazyWithRetry(() => import("../components/shop/ShopActiveJobsScreen"));
const ShopEstimateInboxScreen = lazyWithRetry(
  () => import("../components/shop/ShopEstimateInboxScreen")
);
const InsurerClaimsScreen = lazyWithRetry(
  () => import("../components/insurer/InsurerClaimsScreen")
);
const InsurerPartnerShopsScreen = lazyWithRetry(
  () => import("../components/insurer/InsurerPartnerShopsScreen")
);

import { updateClaimDecision } from "../services/supabase/reports";
import type { DashboardRouterProps } from "./dashboard-router-types";
import DashboardSecondaryViews from "./DashboardSecondaryViews";
import CustomerEstimateDetailSheet from "../components/dashboard/CustomerEstimateDetailSheet";

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
  onUpdateJobStatus,
  onConfirmCompletion,
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
  const { bids: liveBids, loading: bidsLoading } = useBidsForReport(bidsReportId);

  const {
    enrichedUserReports,
    shopInsurerReports,
    shopInsurerReportsLoading,
    usingSeedFallback,
    shopSubmittedBids,
    shopBidReportIdsArray,
    shopEstimateRequests,
    shopEstimatesLoading,
    customerEstimateRequests,
    selectedEstimate,
    setSelectedEstimate,
    estimateActionLoading,
    handleCustomerEstimateResponse,
    handleShopEstimateUpdate,
    refetchMarketplace,
    refetchCustomerEstimates,
    refetchShopBids,
  } = useDashboardData({
    userType,
    providerUserId: websiteIdentity?.providerUserId ?? undefined,
    reports,
    photoStorage,
  });

  // Scroll to top whenever view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [viewMode, currentTab]);

  const hasRouteMatch =
    (viewMode === "dashboard" && currentTab === "home") ||
    (viewMode === "dashboard" && currentTab === "report" && userType === "customer") ||
    (viewMode === "dashboard" && currentTab === "bids" && userType === "customer") ||
    (viewMode === "dashboard" && currentTab === "requests" && userType === "shop") ||
    (viewMode === "dashboard" && currentTab === "estimates" && userType === "shop") ||
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
              <div className="w-8 h-8 border-4 border-blue-400/60 border-t-transparent rounded-full animate-spin" />
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
                  onViewReportOnMap={(reportId) => {
                    onSelectReport(reportId);
                    onViewModeChange("shop-directory");
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
                      : enrichedUserReports
                  }
                  estimateRequests={userType === "customer" ? customerEstimateRequests : undefined}
                  onSelectEstimate={(est) => setSelectedEstimate(est)}
                  shopSubmittedBids={userType === "shop" ? shopSubmittedBids : undefined}
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
                  onReportSubmit={async (...args) => {
                    await onReportSubmit(...args);
                    refetchMarketplace();
                  }}
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
                  bidsLoading={bidsLoading}
                  reports={reports}
                  appearanceMode={appearanceMode}
                  onAcceptBid={onAcceptBid}
                  onRejectBid={onRejectBid}
                  onStartReport={() => onTabChange("report")}
                  onViewShopDirectory={() => onViewModeChange("shop-directory")}
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
                  reportsLoading={shopInsurerReportsLoading}
                  isSeedData={usingSeedFallback}
                  existingBidReportIds={shopBidReportIdsArray}
                  appearanceMode={appearanceMode}
                  onSubmitBid={async (requestId, bidAmount, estimatedDays, description) => {
                    await onSubmitBid(requestId.toString(), bidAmount, estimatedDays, description);
                    refetchShopBids();
                  }}
                />
              </motion.div>
            )}

            {/* Shop: Estimate Inbox Screen */}
            {viewMode === "dashboard" && currentTab === "estimates" && userType === "shop" && (
              <motion.div key="estimates" {...screenTransition}>
                <ShopEstimateInboxScreen
                  estimateRequests={shopEstimateRequests}
                  loading={shopEstimatesLoading}
                  primaryColor={primaryColor}
                  appearanceMode={appearanceMode}
                  onUpdateStatus={handleShopEstimateUpdate}
                />
              </motion.div>
            )}

            {/* Shop: Active Jobs Screen */}
            {viewMode === "dashboard" && currentTab === "jobs" && userType === "shop" && (
              <motion.div key="jobs" {...screenTransition}>
                <ShopActiveJobsScreen
                  primaryColor={primaryColor}
                  reports={shopInsurerReports}
                  isSeedData={usingSeedFallback}
                  appearanceMode={appearanceMode}
                  onUpdateJobStatus={onUpdateJobStatus}
                />
              </motion.div>
            )}

            {/* Insurer: Claims Screen */}
            {viewMode === "dashboard" && currentTab === "claims" && userType === "insurer" && (
              <motion.div key="claims" {...screenTransition}>
                <InsurerClaimsScreen
                  primaryColor={primaryColor}
                  reports={shopInsurerReports}
                  reportsLoading={shopInsurerReportsLoading}
                  isSeedData={usingSeedFallback}
                  appearanceMode={appearanceMode}
                  onOpenReport={(reportId) => {
                    onSelectReport(reportId);
                    onViewModeChange("report-detail");
                  }}
                  onApproveClaim={async (claimId, amount) => {
                    const ok = await updateClaimDecision(claimId, "approved", {
                      approvedAmount: amount,
                    });
                    if (!ok) throw new Error("Claim approval failed");
                    refetchMarketplace();
                  }}
                  onDenyClaim={async (claimId, reason) => {
                    const ok = await updateClaimDecision(claimId, "denied", {
                      denialReason: reason,
                    });
                    if (!ok) throw new Error("Claim denial failed");
                    refetchMarketplace();
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

            {/* Secondary / overlay views — same AnimatePresence for clean transitions */}
            {viewMode !== "dashboard" && (
              <motion.div key={`secondary-${viewMode}`} {...screenTransition}>
                <DashboardSecondaryViews
                  viewMode={viewMode}
                  userType={userType}
                  userInfo={userInfo}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  appearanceMode={appearanceMode}
                  reports={reports}
                  photoStorage={photoStorage}
                  reportsLoading={reportsLoading}
                  reportsError={reportsError}
                  vehicles={vehicles}
                  selectedReportId={selectedReportId}
                  websiteIdentity={websiteIdentity}
                  onSelectReport={onSelectReport}
                  onViewModeChange={onViewModeChange}
                  onTabChange={onTabChange}
                  onSaveVehicles={onSaveVehicles}
                  onEnableDemoMode={onEnableDemoMode}
                  onExitDemoMode={onExitDemoMode}
                  onConfirmCompletion={onConfirmCompletion}
                  refetchCustomerEstimates={refetchCustomerEstimates}
                  refetchShopBids={refetchShopBids}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Suspense>
      </ScreenErrorBoundary>

      {/* Customer estimate detail bottom sheet — portals outside AnimatePresence */}
      <CustomerEstimateDetailSheet
        estimate={selectedEstimate}
        open={selectedEstimate !== null}
        onClose={() => setSelectedEstimate(null)}
        onAccept={(id) => handleCustomerEstimateResponse(id, "accepted")}
        onDecline={(id) => handleCustomerEstimateResponse(id, "declined")}
        loading={estimateActionLoading}
      />
    </div>
  );
}
