import { Suspense, lazy, useEffect, useState } from "react";
import { ClerkProvider, useUser, useClerk } from "@clerk/clerk-react";

// Import Clerk service
import { extractUserProfile, updateUserMetadata } from "./services/clerkService";
import { logWorkflowEvent } from "./services/supabaseService";

// Import custom hooks (for non-auth state management)
import { useUserData } from "./hooks/useUserData";
import { useNavigation } from "./hooks/useNavigation";
import { useAppEffects } from "./hooks/useAppEffects";
import { useAppHandlers } from "./hooks/useAppHandlers";

// Import constants
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  CTA_BUTTON_TEXT,
  CUSTOMER_NAV_TABS,
  SHOP_NAV_TABS,
  INSURER_NAV_TABS,
  LANDING_PAGE_IMAGES,
} from "./constants";

// Import helpers
import { buildDashboardRouterProps } from "./utils/buildDashboardRouterProps";

// Import components
import AppLoading from "./components/app/AppLoading";
import LandingPageLayout from "./components/app/LandingPageLayout";

import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { clerkPublishableKey } from "../../utils/clerk/info";

const DashboardLayout = lazy(() => import("./components/app/DashboardLayout"));
const ClerkAccountTypeSelector = lazy(() => import("./components/auth/ClerkAccountTypeSelector"));
const ShopOnboarding = lazy(() => import("./components/shop/ShopOnboarding"));
const InsurerOnboarding = lazy(() => import("./components/insurer/InsurerOnboarding"));
const PrivacyPolicyPage = lazy(() => import("./components/legal/PrivacyPolicyPage"));
const AboutPage = lazy(() => import("./components/landing/AboutPage"));
const InsurerPartnershipPage = lazy(() => import("./components/landing/InsurerPartnershipPage"));

// Validate Clerk key
console.log("Clerk Key loaded:", clerkPublishableKey?.substring(0, 20) + "...");
if (!clerkPublishableKey || clerkPublishableKey.includes("PASTE_YOUR")) {
  throw new Error(
    `Please add your Clerk Publishable Key to /utils/clerk/info.tsx. Current value: ${clerkPublishableKey?.substring(0, 30)}...`
  );
}

// Main App content (wrapped by ClerkProvider)
function AppContent() {
  const [currentHash, setCurrentHash] = useState(
    typeof window !== "undefined" ? window.location.hash : ""
  );

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const isPrivacyPolicyPage = currentHash === "#/privacy-policy";
  const isAboutPage = currentHash === "#/about";
  const isInsurerPartnershipPage = currentHash === "#/insurer-partnership";

  const navigateHome = () => {
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ============================================================================
  // CLERK AUTH - Replaces useAuth hook
  // ============================================================================
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut, openSignUp } = useClerk();
  const userProfile = user ? extractUserProfile(user) : null;

  // ============================================================================
  // CUSTOM HOOKS - Centralized State Management
  // ============================================================================

  // User data state (profile, vehicles, reports, Supabase sync)
  const userData = useUserData(user?.id);

  // Navigation state (tabs, views, modals, refs)
  const navigation = useNavigation();

  const { handleLogin, handleLogout, submitBid, handleReportSubmit } = useAppHandlers({
    userId: user?.id,
    signOut,
    openSignUp,
    userData,
    navigation,
    projectId,
    publicAnonKey,
    logWorkflowEvent,
  });

  useAppEffects({
    navigation,
    userProfile,
    userData,
  });

  // ============================================================================
  // CONSTANTS - Imported from /constants
  // ============================================================================

  const primaryColor = PRIMARY_COLOR;
  const secondaryColor = SECONDARY_COLOR;
  const ctaButtonText = CTA_BUTTON_TEXT;

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Determine which nav tabs to show based on user type
  const navTabs = CUSTOMER_NAV_TABS;
  const shopNavTabs = SHOP_NAV_TABS;
  const insurerNavTabs = INSURER_NAV_TABS;
  // Navigation tabs config - Switch based on demo mode or actual user type
  const effectiveUserType =
    navigation.demoMode && navigation.demoAccountType
      ? navigation.demoAccountType
      : userProfile?.user_type;

  const currentNavTabs =
    effectiveUserType === "shop"
      ? shopNavTabs
      : effectiveUserType === "insurer"
        ? insurerNavTabs
        : navTabs;

  // ============================================================================
  // LANDING PAGE IMAGES (from constants)
  // ============================================================================

  const heroImage = LANDING_PAGE_IMAGES.HERO;
  const vehicleInspectionImage = LANDING_PAGE_IMAGES.VEHICLE_INSPECTION;
  const mechanicImage = LANDING_PAGE_IMAGES.MECHANIC;
  const repairToolImage = LANDING_PAGE_IMAGES.REPAIR_TOOLS;
  const dentRepairImage = LANDING_PAGE_IMAGES.DENT_REPAIR;
  const precisionRepairImage = LANDING_PAGE_IMAGES.PRECISION_REPAIR;

  const landingUserInfo = userProfile
    ? {
        name: userProfile.name,
        email: userProfile.email,
        profileImage:
          userData.userInfo.profileImage || userProfile.profile_image_url || user?.imageUrl || "",
      }
    : userData.userInfo;

  const landingRedirectInfo = userProfile ? { type: userProfile.user_type } : userData.redirectInfo;

  const landingProfileDropdownData = userProfile
    ? {
        userType: userProfile.user_type,
        notifications: userData.notifications,
        reports: userData.reports,
        vehicles: userData.vehicles,
        bids: userData.bids,
        onNavigate: (destination: string, tab?: string) => {
          if (tab) {
            navigation.setCurrentTab(tab);
          }
          navigation.setViewMode(destination as any);
          navigation.setShowProfileDropdown(false);
          navigation.setShowLandingPage(false);
        },
        onLogout: handleLogout,
        forwardedRef: navigation.profileDropdownRef,
      }
    : undefined;

  const renderLandingPage = (isLoggedIn: boolean) => (
    <LandingPageLayout
      isLoggedIn={isLoggedIn}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      ctaButtonText={ctaButtonText}
      heroImage={heroImage}
      vehicleInspectionImage={vehicleInspectionImage}
      mechanicImage={mechanicImage}
      repairToolImage={repairToolImage}
      dentRepairImage={dentRepairImage}
      precisionRepairImage={precisionRepairImage}
      showLandingPage={navigation.showLandingPage}
      showProfileDropdown={navigation.showProfileDropdown}
      userInfo={landingUserInfo}
      redirectInfo={landingRedirectInfo}
      onLoginClick={handleLogin}
      onViewDashboard={() => navigation.setShowLandingPage(false)}
      profileDropdownData={landingProfileDropdownData}
    />
  );

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  if (isPrivacyPolicyPage) {
    return (
      <Suspense fallback={<AppLoading message="Loading privacy policy..." />}>
        <PrivacyPolicyPage onBackToHome={navigateHome} />
      </Suspense>
    );
  }

  if (isAboutPage) {
    return (
      <Suspense fallback={<AppLoading message="Loading about page..." />}>
        <AboutPage onBackToHome={navigateHome} />
      </Suspense>
    );
  }

  if (isInsurerPartnershipPage) {
    return (
      <Suspense fallback={<AppLoading message="Loading partnership page..." />}>
        <InsurerPartnershipPage onBackToHome={navigateHome} />
      </Suspense>
    );
  }

  // Public site should render immediately while Clerk restores session.
  if (!isUserLoaded) {
    return renderLandingPage(false);
  }

  // If user is logged in, show the dashboard or account setup
  if (user && userProfile) {
    const resolvedProfileImage =
      userData.userInfo.profileImage || userProfile.profile_image_url || user.imageUrl || "";

    const handleProfileUpdate = async (info: {
      name: string;
      email: string;
      phone?: string;
      profileImage?: string;
    }) => {
      const nextName = info.name.trim() || userProfile.name;
      const nextPhone = info.phone ?? userProfile.phone ?? "";
      const nextProfileImage = info.profileImage || resolvedProfileImage;

      await userData.saveProfile({
        name: nextName,
        email: userProfile.email,
        phone: nextPhone,
        profileImage: nextProfileImage,
      });

      try {
        await updateUserMetadata(user, {
          name: nextName,
          phone: nextPhone,
          profile_image_url: nextProfileImage,
        });
      } catch (error) {
        console.error("Failed to persist profile metadata to Clerk:", error);
      }
    };

    // Show account type selector if setup not complete
    if (!userProfile.account_setup_completed) {
      return (
        <Suspense fallback={<AppLoading message="Preparing your account..." />}>
          <ClerkAccountTypeSelector />
        </Suspense>
      );
    }

    // Show onboarding if needed
    if (navigation.showOnboarding && !navigation.onboardingComplete) {
      if (userProfile.user_type === "shop") {
        return (
          <Suspense fallback={<AppLoading message="Loading shop workspace..." />}>
            <ShopOnboarding
              onComplete={() => {
                navigation.setShowOnboarding(false);
                navigation.setOnboardingComplete(true);
              }}
              primaryColor={primaryColor}
            />
          </Suspense>
        );
      } else if (userProfile.user_type === "insurer") {
        return (
          <Suspense fallback={<AppLoading message="Loading insurer workspace..." />}>
            <InsurerOnboarding
              onComplete={() => {
                navigation.setShowOnboarding(false);
                navigation.setOnboardingComplete(true);
              }}
              primaryColor={primaryColor}
            />
          </Suspense>
        );
      }
    }

    // Show landing page while logged in
    if (navigation.showLandingPage) {
      return renderLandingPage(true);
    }

    const profileDropdownData = {
      userType: userProfile.user_type,
      reports: userData.reports,
      vehicles: userData.vehicles,
      bids: userData.bids,
      onNavigate: (destination: string, tab?: string) => {
        if (tab) {
          navigation.setCurrentTab(tab);
        }
        navigation.setViewMode(destination as any);
        navigation.setShowProfileDropdown(false);
      },
      onLogout: handleLogout,
      forwardedRef: navigation.profileDropdownRef,
    };

    const handleTabClick = (tabId: string) => {
      navigation.setCurrentTab(tabId);
      navigation.setViewMode("dashboard");
    };

    const dashboardRouterProps = buildDashboardRouterProps({
      navigation,
      userProfile,
      userData,
      submitBid,
      handleLogout,
      handleProfileUpdate,
      onReportSubmit: handleReportSubmit,
      primaryColor,
      secondaryColor,
      userImageUrl: resolvedProfileImage,
    });

    const handleNewNotification = (notification: (typeof userData.notifications)[number]) => {
      userData.pushNotification(notification);
    };

    const handleMarkNotificationRead = (notificationId: string | number) => {
      userData.markNotificationRead(notificationId);
    };

    const handleMarkAllNotificationsRead = () => {
      userData.markAllNotificationsRead();
    };

    return (
      <Suspense fallback={<AppLoading message="Loading dashboard..." />}>
        <DashboardLayout
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          currentNavTabs={currentNavTabs}
          currentTab={navigation.currentTab}
          viewMode={navigation.viewMode}
          showProfileDropdown={navigation.showProfileDropdown}
          userProfile={userProfile}
          userImageUrl={resolvedProfileImage}
          notifications={userData.notifications}
          reports={userData.reports}
          vehicles={userData.vehicles}
          bids={userData.bids}
          onLogoClick={() => navigation.setShowLandingPage(true)}
          onTabClick={handleTabClick}
          onMobileMenuTabClick={handleTabClick}
          onProfileToggle={() => navigation.setShowProfileDropdown((current) => !current)}
          onOpenDemoMode={() => navigation.setViewMode("demo-switcher" as any)}
          onNewNotification={handleNewNotification}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          profileDropdownData={profileDropdownData}
          dashboardRouterProps={dashboardRouterProps}
        />
      </Suspense>
    );
  }

  // Landing page (not logged in)
  return renderLandingPage(false);
}

// Main App component wrapped with ClerkProvider
export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AppContent />
    </ClerkProvider>
  );
}
