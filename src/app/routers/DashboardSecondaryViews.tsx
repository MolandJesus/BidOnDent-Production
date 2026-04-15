/**
 * DashboardSecondaryViews.tsx — Renders all non-tab overlay/secondary views.
 *
 * Extracted from DashboardRouter to keep the main router under 500 lines.
 * Handles: reports-list, report-detail, smoke-test, insurer-connect,
 * liked-shops, vehicles, shop-directory, new-claim, insurance-companies,
 * competitor-analysis, demo-switcher, and route fallback.
 */
import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import type { DashboardRouterProps } from "./dashboard-router-types";
import { zipToCoordinates } from "../services/supabase/map";
import { submitInsuranceClaim } from "../services/supabase/reports";
import { lazyWithRetry } from "../utils/lazyWithRetry";

const ReportsListScreen = lazyWithRetry(() => import("../components/reports/ReportsListScreen"));
const ReportDetailScreen = lazyWithRetry(() => import("../components/reports/ReportDetailScreen"));
const SmokeTestScreen = lazyWithRetry(() => import("../components/demo/SmokeTestScreen"));
const InsurerConnectionScreen = lazyWithRetry(
  () => import("../components/insurer/InsurerConnectionScreen")
);
const LikedShopsScreen = lazyWithRetry(() => import("../components/shop/LikedShopsScreen"));
const VehicleProfileScreen = lazyWithRetry(() => import("../components/shop/VehicleProfileScreen"));
const ShopDirectoryScreen = lazyWithRetry(() => import("../components/shop/ShopDirectoryScreen"));
const InsurerNewClaimScreen = lazyWithRetry(
  () => import("../components/insurer/InsurerNewClaimScreen")
);
const InsuranceCompaniesScreen = lazyWithRetry(
  () => import("../components/insurer/InsuranceCompaniesScreen")
);
const CompetitorAnalysisScreen = lazyWithRetry(
  () => import("../components/reports/CompetitorAnalysisScreen")
);
const DemoAccountSwitcher = lazyWithRetry(() => import("../components/demo/DemoAccountSwitcher"));
const MissingReportState = lazyWithRetry(() => import("../components/reports/MissingReportState"));

const screenTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20, pointerEvents: "none" as const },
  transition: { duration: 0.2 },
};

type Props = Pick<
  DashboardRouterProps,
  | "viewMode"
  | "userType"
  | "userInfo"
  | "primaryColor"
  | "secondaryColor"
  | "appearanceMode"
  | "reports"
  | "photoStorage"
  | "reportsLoading"
  | "reportsError"
  | "vehicles"
  | "selectedReportId"
  | "websiteIdentity"
  | "onSelectReport"
  | "onViewModeChange"
  | "onTabChange"
  | "onSaveVehicles"
  | "onEnableDemoMode"
  | "onExitDemoMode"
  | "onConfirmCompletion"
> & {
  refetchCustomerEstimates?: () => void;
  refetchShopBids?: () => void;
};

export default function DashboardSecondaryViews({
  viewMode,
  userType,
  userInfo,
  primaryColor,
  secondaryColor,
  appearanceMode,
  reports,
  photoStorage,
  reportsLoading,
  reportsError,
  vehicles,
  selectedReportId,
  websiteIdentity,
  onSelectReport,
  onViewModeChange,
  onTabChange,
  onSaveVehicles,
  onEnableDemoMode,
  onExitDemoMode,
  onConfirmCompletion,
  refetchCustomerEstimates,
  refetchShopBids,
}: Props) {
  // Compute report-based map center for shop directory when navigating from a report
  const reportMapCenter = useMemo(() => {
    const report = selectedReportId
      ? reports.find((r) => r.id === selectedReportId)
      : reports[reports.length - 1];
    if (!report) return undefined;
    if (report.latitude != null && report.longitude != null) {
      return { latitude: report.latitude, longitude: report.longitude };
    }
    const zip = zipToCoordinates(report.zipCode);
    return zip ? { latitude: zip.lat, longitude: zip.lng } : undefined;
  }, [selectedReportId, reports]);

  return (
    <AnimatePresence mode="wait">
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
            onStartReport={() => onTabChange("report")}
          />
        </motion.div>
      )}

      {/* Report Detail Screen */}
      {viewMode === "report-detail" && selectedReportId && (
        <motion.div key="report-detail" {...screenTransition}>
          {reportsLoading && !reports.find((r) => r.id === selectedReportId) ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 px-6 py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60" />
              <p className="text-sm text-slate-400">Loading report…</p>
            </div>
          ) : reports.find((r) => r.id === selectedReportId) ? (
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
              onFindShops={() => onViewModeChange("shop-directory")}
              onConfirmCompletion={onConfirmCompletion}
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
            />
          ) : (
            <MissingReportState
              primaryColor={primaryColor}
              title="Report not found"
              description="This report may have been deleted, or you may not have permission to view it. If you believe this is an error, try returning to your reports list."
              actionLabel="Start New Report"
              onAction={() => onTabChange("report")}
              onBack={() => onViewModeChange("reports-list")}
            />
          )}
        </motion.div>
      )}

      {viewMode === "report-detail" && !selectedReportId && (
        <motion.div key="report-detail-missing" {...screenTransition}>
          <MissingReportState
            primaryColor={primaryColor}
            title="No report selected"
            description="Select a report from your reports list to view its details, or submit a new damage report to get started."
            actionLabel="Start New Report"
            onAction={() => onTabChange("report")}
            onBack={() => onViewModeChange("reports-list")}
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
            onViewReportDetail={(reportId) => {
              onSelectReport(reportId);
              onViewModeChange("report-detail");
            }}
            onViewBids={(reportId?: string) => {
              if (reportId) onSelectReport(reportId);
              onTabChange("bids");
              onViewModeChange("dashboard");
            }}
            mapReports={reports}
            initialSearchHint={
              reports.length > 0
                ? (() => {
                    const latest = reports[reports.length - 1];
                    return latest.zipCode || latest.city || undefined;
                  })()
                : undefined
            }
            initialMapCenter={reportMapCenter}
            focusReportId={selectedReportId ?? undefined}
            onEstimateSubmitted={refetchCustomerEstimates}
            onBidSubmitted={refetchShopBids}
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
            onCreateClaim={async (claimData) => {
              const reportId = claimData.customer.id.replace("customer-", "");
              const amount = claimData.estimatedAmount
                ? parseFloat(claimData.estimatedAmount)
                : undefined;
              const ok = await submitInsuranceClaim(reportId, {
                policyNumber: claimData.policyNumber || undefined,
                incidentDate: claimData.incidentDate || undefined,
                damageDescription: claimData.damageDescription || undefined,
                estimatedAmount: Number.isFinite(amount) ? amount : undefined,
                priority: claimData.priority || "medium",
                shopClerkUserId: claimData.shop?.clerkUserId || undefined,
              });
              if (import.meta.env.DEV)
                console.info("[BidOnDent] New claim created:", {
                  reportId,
                  persisted: ok,
                  claimData,
                });
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
    </AnimatePresence>
  );
}
