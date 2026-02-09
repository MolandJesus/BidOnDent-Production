import type { RefObject } from "react";
import type { Activity, Bid, Notification, RedirectInfo, UserInfo, Vehicle } from "../../types";
import CTASection from "../landing/CTASection";
import BenefitsSection from "../landing/BenefitsSection";
import FooterSection from "../landing/FooterSection";
import HeroSection from "../landing/HeroSection";
import HowItWorksSection from "../landing/HowItWorksSection";
import TrustStatsSection from "../landing/TrustStatsSection";
import WhoWeServeSection from "../landing/WhoWeServeSection";
import LandingPageHeader from "../LandingPageHeader";
import ProfileDropdown from "../dashboard/ProfileDropdown";

type ProfileDropdownData = {
  userType: "customer" | "shop" | "insurer";
  userEmail: string;
  profileImage: string;
  notifications: Notification[];
  unreadCount: number;
  reports: any[];
  vehicles: Vehicle[];
  bids: Bid[];
  activities: Activity[];
  onNavigate: (destination: string, tab?: string) => void;
  onClose: () => void;
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
  defaultProfileImage: string;
  showLandingPage: boolean;
  showProfileDropdown: boolean;
  userInfo: UserInfo;
  redirectInfo: RedirectInfo | null;
  profileDropdownRef: RefObject<HTMLDivElement | null>;
  onLoginClick: () => void;
  onProfileClick: () => void;
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
  defaultProfileImage,
  showLandingPage,
  showProfileDropdown,
  userInfo,
  redirectInfo,
  profileDropdownRef,
  onLoginClick,
  onProfileClick,
  onViewDashboard,
  profileDropdownData
}: LandingPageLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <LandingPageHeader
        isLoggedIn={isLoggedIn}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        showLandingPage={showLandingPage}
        showProfileDropdown={showProfileDropdown}
        userInfo={userInfo}
        redirectInfo={redirectInfo}
        profileDropdownRef={profileDropdownRef}
        onLoginClick={onLoginClick}
        onProfileClick={onProfileClick}
        onViewDashboard={onViewDashboard}
        onLogout={profileDropdownData?.onLogout}
        defaultProfileImage={defaultProfileImage}
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

      <TrustStatsSection />

      <CTASection
        primaryColor={primaryColor}
        onNavigateToDashboard={onViewDashboard}
      />

      <FooterSection
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
      />

      {isLoggedIn && showProfileDropdown && profileDropdownData && (
        <ProfileDropdown
          userInfo={userInfo}
          userType={profileDropdownData.userType}
          notifications={profileDropdownData.notifications}
          unreadCount={profileDropdownData.unreadCount}
          isOpen={showProfileDropdown}
          onClose={profileDropdownData.onClose}
          onNavigate={profileDropdownData.onNavigate}
          onLogout={profileDropdownData.onLogout}
          forwardedRef={profileDropdownData.forwardedRef}
          userEmail={profileDropdownData.userEmail}
          reports={profileDropdownData.reports}
          vehicles={profileDropdownData.vehicles}
          bids={profileDropdownData.bids}
          activities={profileDropdownData.activities}
        />
      )}

    </div>
  );
}
