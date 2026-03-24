import AccountScreen from "../components/codelayer/AccountScreen";
import BidsScreen from "../components/codelayer/BidsScreen";
import HomeScreen from "../components/codelayer/HomeScreen";
import ReportScreen from "../components/codelayer/ReportScreen";
import InsurerClaimsScreen from "../components/insurer/InsurerClaimsScreen";
import InsurerPartnerShopsScreen from "../components/insurer/InsurerPartnerShopsScreen";
import ShopActiveJobsScreen from "../components/shop/ShopActiveJobsScreen";
import ShopRequestsScreen from "../components/shop/ShopRequestsScreen";
import { AnimatedScreen } from "./DashboardAnimatedScreen";
import type { DashboardRouterProps } from "./dashboard-router-types";

function getHomeReports({
  reports,
  photoStorage,
}: Pick<DashboardRouterProps, "reports" | "photoStorage">) {
  return reports.map((report) => ({
    ...report,
    photos: photoStorage[report.id] || report.photos || [],
  }));
}

export default function DashboardTabScreens(props: DashboardRouterProps) {
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

    void onSubmitBid(requestId, bidAmount, 0, "");
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
            websiteIdentity={props.websiteIdentity}
            vehicles={vehicles}
            reports={reports}
            onLogout={onLogout}
            onDeleteAccount={props.onDeleteAccount}
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
