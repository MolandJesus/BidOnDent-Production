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
      className={`min-h-screen overflow-x-hidden ${isLightAppearance ? "" : "dark"}`}
      data-theme={isLightAppearance ? "light" : "dark"}
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, #fdfcf9 0%, #f8f8f5 100%)"
          : "radial-gradient(130% 90% at 30% 8%, rgba(12, 28, 58, 0.99) 0%, rgba(6, 14, 32, 0.99) 58%, #040a18 100%)",
      }}
    >
      {/* ── L1 (Bucket 7, KI-073): top-left corner gold lamp — landing
            equivalent of dashboard D8, slightly more restrained because
            landing breathes more openly. Owner directive: bring premium
            dashboard lamp lighting to landing while keeping landing's
            richer hero color story. ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 36% 26% at 8% 0%, rgba(196, 144, 65, 0.05) 0%, transparent 65%)"
            : "radial-gradient(ellipse 40% 30% at 8% 0%, rgba(196, 144, 65, 0.18) 0%, transparent 60%)",
        }}
      />
      {/* ── L2 (Bucket 7, KI-073): top-right corner gold lamp — softer
            than L1 for the same single-source asymmetric premium feel. ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 30% 22% at 92% 0%, rgba(196, 144, 65, 0.04) 0%, transparent 65%)"
            : "radial-gradient(ellipse 34% 26% at 92% 0%, rgba(196, 144, 65, 0.13) 0%, transparent 60%)",
        }}
      />
      {/* ── L3 (Bucket 7, KI-073): left gutter wash — landing parallel of
            dashboard D6 left, lower alpha so the hero's richer gradients
            stay theatrical. ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 30% 65% at 0% 42%, rgba(196, 130, 45, 0.08) 0%, transparent 62%)"
            : "radial-gradient(ellipse 30% 65% at 0% 42%, rgba(196, 130, 45, 0.15) 0%, transparent 60%)",
        }}
      />
      {/* ── L4 (Bucket 7, KI-073): right gutter wash — landing parallel of
            dashboard D6 right, lower alpha (paired with L3). ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 28% 60% at 100% 58%, rgba(196, 130, 45, 0.07) 0%, transparent 62%)"
            : "radial-gradient(ellipse 28% 60% at 100% 58%, rgba(196, 130, 45, 0.12) 0%, transparent 60%)",
        }}
      />
      {/* ── L5 (Bucket 7, KI-073): bottom wash — landing parallel of
            dashboard D7, restrained so the FooterSection breathes. ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 50% 18% at 50% 100%, rgba(196, 130, 45, 0.06) 0%, transparent 70%)"
            : "radial-gradient(ellipse 52% 20% at 50% 100%, rgba(196, 130, 45, 0.10) 0%, transparent 68%)",
        }}
      />

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
