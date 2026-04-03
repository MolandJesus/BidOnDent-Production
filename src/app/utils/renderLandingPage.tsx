import { Suspense, lazy, type ComponentProps } from "react";
import type { DashboardAppearanceMode } from "../routers/dashboard-router-types";
import type { RedirectInfo, UserInfo } from "../types";
import { PRIMARY_COLOR, SECONDARY_COLOR, CTA_BUTTON_TEXT, LANDING_PAGE_IMAGES } from "../constants";

const LandingPageLayout = lazy(() => import("../components/app/LandingPageLayout"));

interface LandingPageDeps {
  appearanceMode: DashboardAppearanceMode;
  setAppearanceMode: (mode: DashboardAppearanceMode) => void;
  showLandingPage: boolean;
  showProfileDropdown: boolean;
  userProfile: { name: string; email: string; user_type: "customer" | "shop" | "insurer" } | null;
  userInfo: UserInfo;
  redirectInfo: RedirectInfo | null;
  notifications: unknown[];
  reports: unknown[];
  vehicles: unknown[];
  bids: unknown[];
  onLoginClick: () => void;
  onViewDashboard: () => void;
  onLogout: () => void;
  onNavigate: (destination: string, tab?: string) => void;
  profileDropdownRef: React.RefObject<HTMLDivElement>;
}

export function renderLandingPage(deps: LandingPageDeps, isLoggedIn: boolean) {
  const {
    appearanceMode,
    setAppearanceMode,
    showLandingPage,
    showProfileDropdown,
    userProfile,
    userInfo,
    redirectInfo,
    notifications,
    reports,
    vehicles,
    bids,
    onLoginClick,
    onViewDashboard,
    onLogout,
    onNavigate,
    profileDropdownRef,
  } = deps;

  const landingUserInfo = userProfile
    ? { name: userProfile.name, email: userProfile.email, profileImage: "" }
    : userInfo;

  const landingRedirectInfo = userProfile ? { type: userProfile.user_type } : redirectInfo;

  const landingProfileDropdownData = userProfile
    ? {
        userType: userProfile.user_type,
        notifications,
        reports,
        vehicles,
        bids,
        onNavigate,
        onLogout,
        forwardedRef: profileDropdownRef,
      }
    : undefined;

  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950" />}>
      <LandingPageLayout
        isLoggedIn={isLoggedIn}
        appearanceMode={appearanceMode}
        primaryColor={PRIMARY_COLOR}
        secondaryColor={SECONDARY_COLOR}
        ctaButtonText={CTA_BUTTON_TEXT}
        heroImage={LANDING_PAGE_IMAGES.HERO}
        vehicleInspectionImage={LANDING_PAGE_IMAGES.VEHICLE_INSPECTION}
        mechanicImage={LANDING_PAGE_IMAGES.MECHANIC}
        repairToolImage={LANDING_PAGE_IMAGES.REPAIR_TOOLS}
        dentRepairImage={LANDING_PAGE_IMAGES.DENT_REPAIR}
        precisionRepairImage={LANDING_PAGE_IMAGES.PRECISION_REPAIR}
        showLandingPage={showLandingPage}
        showProfileDropdown={showProfileDropdown}
        userInfo={landingUserInfo}
        redirectInfo={landingRedirectInfo}
        onLoginClick={onLoginClick}
        onViewDashboard={onViewDashboard}
        onAppearanceModeChange={setAppearanceMode}
        profileDropdownData={
          landingProfileDropdownData as ComponentProps<
            typeof LandingPageLayout
          >["profileDropdownData"]
        }
      />
    </Suspense>
  );
}
