import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

import AccountScreen from "../components/codelayer/AccountScreen";
import BidsScreen from "../components/codelayer/BidsScreen";
import HomeScreen from "../components/codelayer/HomeScreen";
import ReportScreen from "../components/codelayer/ReportScreen";
import DemoAccountSwitcher from "../components/demo/DemoAccountSwitcher";
import SmokeTestScreen from "../components/demo/SmokeTestScreen";
import InsurerClaimsScreen from "../components/insurer/InsurerClaimsScreen";
import InsuranceCompaniesScreen from "../components/insurer/InsuranceCompaniesScreen";
import InsurerConnectionScreen from "../components/insurer/InsurerConnectionScreen";
import InsurerNewClaimScreen from "../components/insurer/InsurerNewClaimScreen";
import InsurerPartnerShopsScreen from "../components/insurer/InsurerPartnerShopsScreen";
import CompetitorAnalysisScreen from "../components/reports/CompetitorAnalysisScreen";
import MissingReportState from "../components/reports/MissingReportState";
import ReportDetailScreen from "../components/reports/ReportDetailScreen";
import ReportsListScreen from "../components/reports/ReportsListScreen";
import LikedShopsScreen from "../components/shop/LikedShopsScreen";
import ShopActiveJobsScreen from "../components/shop/ShopActiveJobsScreen";
import ShopDirectoryScreen from "../components/shop/ShopDirectoryScreen";
import ShopRequestsScreen from "../components/shop/ShopRequestsScreen";
import VehicleProfileScreen from "../components/shop/VehicleProfileScreen";
import type { DashboardRouterProps } from "./dashboard-router-types";

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

function withStoredPhotos(report: any, photoStorage: DashboardRouterProps["photoStorage"]) {
  return {
    ...report,
    photos: photoStorage[report.id] || report.photos || [],
  };
}

function getHomeReports({
  reports,
  photoStorage,
}: Pick<DashboardRouterProps, "reports" | "photoStorage">) {
  return reports.map((report) => ({
    ...report,
    photos: photoStorage[report.id] || report.photos || [],
  }));
}

function getSelectedReport({
  reports,
  selectedReportId,
  photoStorage,
}: Pick<DashboardRouterProps, "reports" | "selectedReportId" | "photoStorage">) {
  if (!selectedReportId) {
    return null;
  }

  const report = reports.find((entry) => entry.id === selectedReportId);
  if (!report) {
    return null;
  }

  return {
    ...report,
    photos: photoStorage[selectedReportId] || report.photos || [],
  };
}

function renderDashboardTabScreen(props: DashboardRouterProps) {
  const {
    currentTab,
    userType,
    primaryColor,
    secondaryColor,
    reports,
    bids,
    vehicles,
    userInfo,
    userPhone,
    photoStorage,
    hasSeenPhotoGuide,
    demoMode,
    originalAccountType,
    onStartReport,
    onViewAllReports,
    onViewCoverage,
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
    onEnterDemoMode,
    onExitDemoMode,
    onSelectReport,
    onViewModeChange,
    onTabChange,
    onSaveVehicle,
    onPhotoGuideComplete,
    onReportSubmit,
    onAcceptBid,
    onSubmitBid,
    onLogout,
    onProfileUpdate,
  } = props;

  const handleHomeReportOpen = (reportId: string) => {
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
  };

  const submitShopBid = (requestId: string, bidAmount: number) => {
    const report = reports.find((entry) => entry.id === requestId);
    if (!report) {
      return;
    }

    void onSubmitBid(requestId, bidAmount, 3, "Professional repair service with quality guarantee");
  };

  switch (currentTab) {
    case "home":
      return (
        <AnimatedScreen screenKey="home">
          <HomeScreen
            userType={userType}
            userInfo={userInfo}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onStartReport={onStartReport}
            onViewAllReports={onViewAllReports}
            onViewCoverage={onViewCoverage}
            onOpenReport={handleHomeReportOpen}
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
            reports={getHomeReports({ reports, photoStorage })}
          />
        </AnimatedScreen>
      );
    case "report":
      if (userType !== "customer") {
        return null;
      }

      return (
        <AnimatedScreen screenKey="report">
          <ReportScreen
            primaryColor={primaryColor}
            vehicles={vehicles}
            onSaveVehicle={onSaveVehicle}
            hasSeenPhotoGuide={hasSeenPhotoGuide}
            onPhotoGuideComplete={onPhotoGuideComplete}
            onReportSubmit={onReportSubmit}
            onViewReports={() => onViewModeChange("reports-list")}
            onBackToDashboard={() => {
              onTabChange("home");
              onViewModeChange("dashboard");
            }}
          />
        </AnimatedScreen>
      );
    case "bids":
      if (userType !== "customer") {
        return null;
      }

      return (
        <AnimatedScreen screenKey="bids">
          <BidsScreen
            primaryColor={primaryColor}
            userType={userType}
            bids={bids}
            reports={reports}
            onAcceptBid={onAcceptBid}
            onBack={() => {
              onTabChange("home");
              onViewModeChange("dashboard");
            }}
          />
        </AnimatedScreen>
      );
    case "requests":
      if (userType !== "shop") {
        return null;
      }

      return (
        <AnimatedScreen screenKey="requests">
          <ShopRequestsScreen
            primaryColor={primaryColor}
            reports={reports}
            onSubmitBid={submitShopBid}
          />
        </AnimatedScreen>
      );
    case "jobs":
      if (userType !== "shop") {
        return null;
      }

      return (
        <AnimatedScreen screenKey="jobs">
          <ShopActiveJobsScreen primaryColor={primaryColor} reports={reports} />
        </AnimatedScreen>
      );
    case "claims":
      if (userType !== "insurer") {
        return null;
      }

      return (
        <AnimatedScreen screenKey="claims">
          <InsurerClaimsScreen primaryColor={primaryColor} reports={reports} />
        </AnimatedScreen>
      );
    case "shops":
      if (userType !== "insurer") {
        return null;
      }

      return (
        <AnimatedScreen screenKey="shops">
          <InsurerPartnerShopsScreen primaryColor={primaryColor} reports={reports} />
        </AnimatedScreen>
      );
    case "account":
      return (
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
              onProfileUpdate({
                name: data.name,
                email: data.email,
                phone: data.phone,
                profileImage: data.profileImage,
              });
            }}
            onViewVehicles={() => onViewModeChange("vehicles")}
            onViewReport={(reportId) => {
              onSelectReport(reportId);
              onViewModeChange("report-detail");
            }}
            onOpenSmokeTest={() => onViewModeChange("smoke-test")}
          />
        </AnimatedScreen>
      );
    default:
      return null;
  }
}

function renderStandaloneViewScreen(props: DashboardRouterProps) {
  const {
    viewMode,
    userType,
    reports,
    vehicles,
    photoStorage,
    selectedReportId,
    primaryColor,
    secondaryColor,
    onTabChange,
    onViewModeChange,
    onSelectReport,
    onSaveVehicles,
    onEnableDemoMode,
    onExitDemoMode,
  } = props;

  switch (viewMode) {
    case "reports-list":
      return (
        <AnimatedScreen screenKey="reports-list">
          <ReportsListScreen
            reports={reports.map((report) => withStoredPhotos(report, photoStorage))}
            onBack={() => onViewModeChange("dashboard")}
            onSelectReport={(reportId) => {
              onSelectReport(reportId);
              onViewModeChange("report-detail");
            }}
            primaryColor={primaryColor}
          />
        </AnimatedScreen>
      );
    case "report-detail": {
      const selectedReport = getSelectedReport({ reports, selectedReportId, photoStorage });
      if (!selectedReport) {
        return (
          <AnimatedScreen screenKey="missing-report-detail">
            <MissingReportState
              primaryColor={primaryColor}
              title={
                userType === "customer"
                  ? "You don't have any active reports yet"
                  : "That report is no longer available"
              }
              description={
                userType === "customer"
                  ? "There is not an active report tied to this selection yet. Start a new repair report and live bid activity will route somewhere meaningful instead of dropping you into an empty screen."
                  : "The report you tried to open could not be found. Head back to your dashboard and choose another live item."
              }
              actionLabel={userType === "customer" ? "Create a Report" : "Back to Dashboard"}
              onAction={() => {
                if (userType === "customer") {
                  onTabChange("report");
                  onViewModeChange("dashboard");
                  return;
                }

                onViewModeChange("dashboard");
              }}
              onBack={() => onViewModeChange("dashboard")}
            />
          </AnimatedScreen>
        );
      }

      return (
        <AnimatedScreen screenKey="report-detail">
          <ReportDetailScreen
            report={selectedReport}
            onBack={() => onViewModeChange("reports-list")}
            onViewAllBids={() => {
              onTabChange("bids");
              onViewModeChange("dashboard");
            }}
            primaryColor={primaryColor}
          />
        </AnimatedScreen>
      );
    }
    case "smoke-test":
      return (
        <AnimatedScreen screenKey="smoke-test">
          <SmokeTestScreen primaryColor={primaryColor} />
        </AnimatedScreen>
      );
    case "insurer-connect":
      return (
        <AnimatedScreen screenKey="insurer-connect">
          <InsurerConnectionScreen
            onBack={() => onViewModeChange("dashboard")}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </AnimatedScreen>
      );
    case "liked-shops":
      return (
        <AnimatedScreen screenKey="liked-shops">
          <LikedShopsScreen
            onBack={() => onViewModeChange("dashboard")}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </AnimatedScreen>
      );
    case "vehicles":
      return (
        <AnimatedScreen screenKey="vehicles">
          <VehicleProfileScreen
            vehicles={vehicles}
            onBack={() => onViewModeChange("dashboard")}
            primaryColor={primaryColor}
            onSaveVehicles={onSaveVehicles}
          />
        </AnimatedScreen>
      );
    case "shop-directory":
      return (
        <AnimatedScreen screenKey="shop-directory">
          <ShopDirectoryScreen
            onBack={() => onViewModeChange("dashboard")}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </AnimatedScreen>
      );
    case "new-claim":
      if (userType !== "insurer") {
        return null;
      }

      return (
        <AnimatedScreen screenKey="new-claim">
          <InsurerNewClaimScreen
            primaryColor={primaryColor}
            reports={reports}
            onBack={() => onViewModeChange("dashboard")}
          />
        </AnimatedScreen>
      );
    case "insurance-companies":
      return (
        <AnimatedScreen screenKey="insurance-companies">
          <InsuranceCompaniesScreen
            onBack={() => onViewModeChange("dashboard")}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            userType={userType}
          />
        </AnimatedScreen>
      );
    case "competitor-analysis":
      return (
        <AnimatedScreen screenKey="competitor-analysis">
          <CompetitorAnalysisScreen
            onBack={() => onViewModeChange("dashboard")}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </AnimatedScreen>
      );
    case "demo-switcher":
      return (
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
      );
    default:
      return null;
  }
}

export default function DashboardRouterScreens(props: DashboardRouterProps) {
  const activeScreen =
    props.viewMode === "dashboard"
      ? renderDashboardTabScreen(props)
      : renderStandaloneViewScreen(props);

  return <AnimatePresence mode="wait">{activeScreen}</AnimatePresence>;
}
