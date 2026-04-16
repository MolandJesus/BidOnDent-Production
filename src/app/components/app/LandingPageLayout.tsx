import type { RefObject } from "react";
import type { Bid, Notification, RedirectInfo, Report, UserInfo, Vehicle } from "../../types";
import type { ProfileDropdownData } from "../../types/dashboardShell";
import CTASection from "../landing/CTASection";
import BenefitsSection from "../landing/BenefitsSection";
import BusinessInquirySection from "../landing/BusinessInquirySection";
import FooterSection from "../landing/FooterSection";
import HeroSection from "../landing/HeroSection";
import HowItWorksSection from "../landing/HowItWorksSection";
import OperatingRegionsSection from "../landing/OperatingRegionsSection";
import TrustStatsSection from "../landing/TrustStatsSection";
import AboutOpportunitySection from "../landing/AboutOpportunitySection";
import WhoWeServeSection from "../landing/WhoWeServeSection";
import LandingPageHeader from "../landing/LandingPageHeader";
import ProfileDropdown from "../dashboard/ProfileDropdown";
import type { NavigationDiscoveryRole } from "../../services/navigation/placeDiscovery";
import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";

type LandingPageLayoutProps = {
  isLoggedIn: boolean;
  primaryColor: string;
  secondaryColor: string;
  ctaButtonText: string;
  heroImage: string;
  vehicleInspectionImage: string;
  mechanicImage: string;
  repairToolImage: string;
  dentRepairImage: string;
  precisionRepairImage: string;
  showLandingPage: boolean;
  showProfileDropdown: boolean;
  userInfo: UserInfo;
  redirectInfo: RedirectInfo | null;
  initialDiscoveryRole?: NavigationDiscoveryRole;
  onLoginClick: () => void;
  onViewDashboard: () => void;
  profileDropdownData?: ProfileDropdownData;
};

export default function LandingPageLayout({
  isLoggedIn,
  primaryColor,
  secondaryColor,
  ctaButtonText,
  heroImage,
  vehicleInspectionImage,
  mechanicImage,
  repairToolImage,
  dentRepairImage,
  precisionRepairImage,
  showLandingPage,
  showProfileDropdown,
  userInfo,
  redirectInfo,
  initialDiscoveryRole,
  onLoginClick,
  onViewDashboard,
  profileDropdownData,
}: LandingPageLayoutProps) {
  const [appearanceMode] = useAppearanceModeCtx();
  const isLightAppearance = appearanceMode === "light";

  return (
    <div
      className={`min-h-screen ${isLightAppearance ? "" : "dark"}`}
      data-theme={isLightAppearance ? "light" : "dark"}
      style={{
        background: isLightAppearance
          ? "radial-gradient(130% 90% at 30% 8%, #1b3158 0%, #15264a 52%, #0f1d3a 100%)"
          : "radial-gradient(130% 90% at 30% 8%, rgba(12, 28, 58, 0.99) 0%, rgba(6, 14, 32, 0.99) 58%, #040a18 100%)",
      }}
    >
      <LandingPageHeader
        isLoggedIn={isLoggedIn}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        showLandingPage={showLandingPage}
        isLightAppearance={isLightAppearance}
        onViewDashboard={onViewDashboard}
      />

      <HeroSection
        heroImage={heroImage}
        ctaButtonText={ctaButtonText}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        isLoggedIn={isLoggedIn}
        isLightAppearance={isLightAppearance}
        userType={redirectInfo?.type as "customer" | "shop" | "insurer" | undefined}
        onGetStarted={isLoggedIn ? onViewDashboard : onLoginClick}
        onLearnMore={() =>
          document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
        }
      />

      <HowItWorksSection
        vehicleInspectionImage={vehicleInspectionImage}
        primaryColor={primaryColor}
        isLightAppearance={isLightAppearance}
      />

      <BenefitsSection
        mechanicImage={mechanicImage}
        repairToolImage={repairToolImage}
        dentRepairImage={dentRepairImage}
        precisionRepairImage={precisionRepairImage}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        isLightAppearance={isLightAppearance}
      />

      <WhoWeServeSection primaryColor={primaryColor} isLightAppearance={isLightAppearance} />

      <AboutOpportunitySection isLightAppearance={isLightAppearance} />

      <TrustStatsSection isLightAppearance={isLightAppearance} />

      <OperatingRegionsSection
        initialDiscoveryRole={initialDiscoveryRole}
        isLightAppearance={isLightAppearance}
      />

      <BusinessInquirySection isLightAppearance={isLightAppearance} />

      <CTASection
        primaryColor={primaryColor}
        isLightAppearance={isLightAppearance}
        onNavigateToDashboard={onViewDashboard}
      />

      <FooterSection
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        isLightAppearance={isLightAppearance}
      />

      {isLoggedIn && showProfileDropdown && profileDropdownData && (
        <ProfileDropdown
          userInfo={userInfo}
          userType={profileDropdownData.userType}
          notifications={profileDropdownData.notifications ?? []}
          notificationSyncActive={profileDropdownData.notificationSyncActive}
          isOpen={showProfileDropdown}
          onNavigate={profileDropdownData.onNavigate}
          onLogout={profileDropdownData.onLogout}
          forwardedRef={profileDropdownData.forwardedRef}
          reports={profileDropdownData.reports}
          vehicles={profileDropdownData.vehicles}
          bids={profileDropdownData.bids}
          isLightAppearance={isLightAppearance}
        />
      )}
    </div>
  );
}
