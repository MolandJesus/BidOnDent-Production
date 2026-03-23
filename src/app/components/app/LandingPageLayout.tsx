import type { RefObject } from "react";
import type { Bid, Notification, RedirectInfo, UserInfo, Vehicle } from "../../types";
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

type ProfileDropdownData = {
  userType: "customer" | "shop" | "insurer";
  notifications: Notification[];
  notificationSyncActive?: boolean;
  reports: any[];
  vehicles: Vehicle[];
  bids: Bid[];
  onNavigate: (destination: string, tab?: string) => void;
  onLogout: () => void;
  forwardedRef: RefObject<HTMLDivElement | null>;
};

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
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f6ff] via-white to-[#f0f6ff]">
      <LandingPageHeader
        isLoggedIn={isLoggedIn}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        showLandingPage={showLandingPage}
        onViewDashboard={onViewDashboard}
      />

      <HeroSection
        heroImage={heroImage}
        ctaButtonText={ctaButtonText}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        isLoggedIn={isLoggedIn}
        userType={redirectInfo?.type as "customer" | "shop" | "insurer" | undefined}
        onGetStarted={isLoggedIn ? onViewDashboard : onLoginClick}
        onLearnMore={() =>
          document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
        }
      />

      <HowItWorksSection
        vehicleInspectionImage={vehicleInspectionImage}
        primaryColor={primaryColor}
      />

      <BenefitsSection
        mechanicImage={mechanicImage}
        repairToolImage={repairToolImage}
        dentRepairImage={dentRepairImage}
        precisionRepairImage={precisionRepairImage}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />

      <WhoWeServeSection primaryColor={primaryColor} />

      <AboutOpportunitySection />

      <TrustStatsSection />

      <OperatingRegionsSection initialDiscoveryRole={initialDiscoveryRole} />

      <BusinessInquirySection />

      <CTASection primaryColor={primaryColor} onNavigateToDashboard={onViewDashboard} />

      <FooterSection primaryColor={primaryColor} secondaryColor={secondaryColor} />

      {isLoggedIn && showProfileDropdown && profileDropdownData && (
        <ProfileDropdown
          userInfo={userInfo}
          userType={profileDropdownData.userType}
          notifications={profileDropdownData.notifications}
          notificationSyncActive={profileDropdownData.notificationSyncActive}
          isOpen={showProfileDropdown}
          onNavigate={profileDropdownData.onNavigate}
          onLogout={profileDropdownData.onLogout}
          forwardedRef={profileDropdownData.forwardedRef}
          reports={profileDropdownData.reports}
          vehicles={profileDropdownData.vehicles}
          bids={profileDropdownData.bids}
        />
      )}
    </div>
  );
}
