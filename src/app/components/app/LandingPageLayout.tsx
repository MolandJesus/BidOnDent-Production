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
import DeleteUserUtility from "../DeleteUserUtility";
import StorageInspector from "../StorageInspector";

type ProfileDropdownData = {
  userType: string;
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
  forwardedRef: RefObject<HTMLDivElement>;
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
  profileDropdownRef: RefObject<HTMLDivElement>;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onViewDashboard: () => void;
  profileDropdownData?: ProfileDropdownData;
  isAdmin: boolean;
  showStorageInspector: boolean;
  onCloseStorageInspector: () => void;
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
  profileDropdownData,
  isAdmin,
  showStorageInspector,
  onCloseStorageInspector
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
        redirectInfo={redirectInfo ?? undefined}
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
        onGetStartedClick={() => {}}
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

      <TrustStatsSection
        repairToolImage={repairToolImage}
        primaryColor={primaryColor}
      />

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

      {showStorageInspector && isAdmin && (
        <StorageInspector onClose={onCloseStorageInspector} />
      )}

      {isAdmin && <DeleteUserUtility />}
    </div>
  );
}
