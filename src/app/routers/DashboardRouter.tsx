import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
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
const InsurerClaimsScreen = lazy(() => import("../components/insurer/InsurerClaimsScreen"));
const InsurerPartnerShopsScreen = lazy(
  () => import("../components/insurer/InsurerPartnerShopsScreen")
);

import { SEED_DAMAGE_REPORTS } from "../constants";
import { getShopSubmittedBids } from "../services/supabase/bids";
import { updateClaimDecision } from "../services/supabase/reports";
import type { DamageReport } from "../types";
import type { DashboardRouterProps } from "./dashboard-router-types";
import DashboardSecondaryViews from "./DashboardSecondaryViews";

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
  const { bids: liveBids } = useBidsForReport(bidsReportId);

  // Fetch all reports from Supabase for shop/insurer marketplace views
  const {
    marketplaceReports,
    loading: marketplaceLoading,
    refetch: refetchMarketplace,
  } = useMarketplaceReports(userType);
  const enrichedUserReports = reports.map((report) => ({
    ...report,
    photos:
      Array.isArray(photoStorage[report.id]) && photoStorage[report.id].length > 0
        ? photoStorage[report.id]
        : Array.isArray(report.photos)
          ? report.photos
          : [],
  }));

  const liveReportMap = new Map<string, DamageReport>();

  marketplaceReports.forEach((report) => {
    liveReportMap.set(String(report.id), report);
  });

  enrichedUserReports.forEach((report) => {
    const reportKey = String(report.id);
    const existing = liveReportMap.get(reportKey);

    if (!existing) {
      liveReportMap.set(reportKey, report);
      return;
    }

    liveReportMap.set(reportKey, {
      ...existing,
      customerName: report.customerName || existing.customerName,
      customerEmail: report.customerEmail || existing.customerEmail,
      customerPhone: report.customerPhone || existing.customerPhone,
      description: report.description || existing.description,
      damageDescription: report.damageDescription || existing.damageDescription,
      damageArea: report.damageArea || existing.damageArea,
      damageType: report.damageType || existing.damageType,
      address: report.address || existing.address,
      city: report.city || existing.city,
      state: report.state || existing.state,
      zipCode: report.zipCode || existing.zipCode,
      zip_code: report.zip_code || existing.zip_code,
      claimNumber: report.claimNumber || existing.claimNumber,
      policyNumber: report.policyNumber || existing.policyNumber,
      vehicle: report.vehicle || existing.vehicle,
      vehicleInfo: report.vehicleInfo || existing.vehicleInfo,
      photos: report.photos.length > 0 ? report.photos : existing.photos,
      bids: Array.isArray(report.bids) && report.bids.length > 0 ? report.bids : existing.bids,
      bidsCount: report.bidsCount ?? existing.bidsCount,
      bidAmount: report.bidAmount ?? existing.bidAmount,
      submittedAt: report.submittedAt || existing.submittedAt,
      createdAt: report.createdAt || existing.createdAt,
      status: report.status || existing.status,
    });
  });

  const liveMarketplaceReports = Array.from(liveReportMap.values()).sort((left, right) => {
    const leftDate = Date.parse(left.submittedAt || left.createdAt || "");
    const rightDate = Date.parse(right.submittedAt || right.createdAt || "");
    return rightDate - leftDate;
  });
  const usingSeedFallback = liveMarketplaceReports.length === 0;
  const shopInsurerReports = usingSeedFallback ? SEED_DAMAGE_REPORTS : liveMarketplaceReports;
  const shopInsurerReportsLoading = marketplaceLoading && liveMarketplaceReports.length === 0;

  // Pre-load shop's existing bids so ShopRequestsScreen knows which reports already have bids
  const [shopBidReportIds, setShopBidReportIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (userType !== "shop" || !websiteIdentity?.providerUserId) return;
    let cancelled = false;
    getShopSubmittedBids(websiteIdentity.providerUserId).then((bids) => {
      if (!cancelled) {
        const ids = new Set(
          bids.map((b) => b.damage_report_id || b.report_id || "").filter(Boolean)
        );
        setShopBidReportIds(ids);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userType, websiteIdentity?.providerUserId]);

  const shopBidReportIdsArray = useMemo(() => Array.from(shopBidReportIds), [shopBidReportIds]);

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
                      : enrichedUserReports
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
                  onApproveClaim={async (claimId, amount) => {
                    const ok = await updateClaimDecision(claimId, "approved", {
                      approvedAmount: amount,
                    });
                    if (ok) refetchMarketplace();
                    if (import.meta.env.DEV)
                      console.info("[BidOnDent] Claim approved:", {
                        claimId,
                        amount,
                        persisted: ok,
                      });
                  }}
                  onDenyClaim={async (claimId, reason) => {
                    const ok = await updateClaimDecision(claimId, "denied", {
                      denialReason: reason,
                    });
                    if (ok) refetchMarketplace();
                    if (import.meta.env.DEV)
                      console.info("[BidOnDent] Claim denied:", { claimId, reason, persisted: ok });
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

            {/* Secondary / overlay views */}
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
            />

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
