import DemoAccountSwitcher from "../components/demo/DemoAccountSwitcher";
import SmokeTestScreen from "../components/demo/SmokeTestScreen";
import InsuranceCompaniesScreen from "../components/insurer/InsuranceCompaniesScreen";
import InsurerConnectionScreen from "../components/insurer/InsurerConnectionScreen";
import InsurerNewClaimScreen from "../components/insurer/InsurerNewClaimScreen";
import CompetitorAnalysisScreen from "../components/reports/CompetitorAnalysisScreen";
import MissingReportState from "../components/reports/MissingReportState";
import ReportDetailScreen from "../components/reports/ReportDetailScreen";
import ReportsListScreen from "../components/reports/ReportsListScreen";
import LikedShopsScreen from "../components/shop/LikedShopsScreen";
import ShopDirectoryScreen from "../components/shop/ShopDirectoryScreen";
import VehicleProfileScreen from "../components/shop/VehicleProfileScreen";
import { AnimatedScreen } from "./DashboardAnimatedScreen";
import type { DashboardRouterProps } from "./dashboard-router-types";

function withStoredPhotos(report: any, photoStorage: DashboardRouterProps["photoStorage"]) {
  return {
    ...report,
    photos: photoStorage[report.id] || report.photos || [],
  };
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

export default function DashboardStandaloneScreens(props: DashboardRouterProps) {
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
            reportsLoading={props.reportsLoading ?? false}
            reportsError={props.reportsError ?? null}
            onBack={() => onViewModeChange("dashboard")}
            onSelectReport={(reportId) => {
              onSelectReport(String(reportId));
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
