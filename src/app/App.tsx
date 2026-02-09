import { ClerkProvider, useUser, useClerk } from '@clerk/clerk-react';

// Import Clerk service
import { extractUserProfile } from "./services/clerkService";

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
  LANDING_PAGE_IMAGES
} from "./constants";

// Import helpers
import { buildDashboardRouterProps } from "./utils/buildDashboardRouterProps";

// Import components
import AppLoading from "./components/app/AppLoading";
import DashboardLayout from "./components/app/DashboardLayout";
import LandingPageLayout from "./components/app/LandingPageLayout";
import ClerkAccountTypeSelector from "./components/ClerkAccountTypeSelector";
import ShopOnboarding from "./components/ShopOnboarding";
import InsurerOnboarding from "./components/InsurerOnboarding";

import { projectId, publicAnonKey } from "../../utils/supabase/info";
import { clerkPublishableKey } from "../../utils/clerk/info";

// Validate Clerk key
console.log('Clerk Key loaded:', clerkPublishableKey?.substring(0, 20) + '...');
if (!clerkPublishableKey || clerkPublishableKey.includes("PASTE_YOUR")) {
  throw new Error(`Please add your Clerk Publishable Key to /utils/clerk/info.tsx. Current value: ${clerkPublishableKey?.substring(0, 30)}...`);
}

// Main App content (wrapped by ClerkProvider)
function AppContent() {
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
    publicAnonKey
  });

  useAppEffects({
    navigation,
    userProfile,
    userData
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
  const effectiveUserType = navigation.demoMode && navigation.demoAccountType 
    ? navigation.demoAccountType 
    : userProfile?.user_type;
    
  const currentNavTabs = effectiveUserType === "shop" ? shopNavTabs : 
                        effectiveUserType === "insurer" ? insurerNavTabs : 
                        navTabs;

  // ============================================================================
  // LANDING PAGE IMAGES (from constants)
  // ============================================================================
  
  const heroImage = LANDING_PAGE_IMAGES.HERO;
  const vehicleInspectionImage = LANDING_PAGE_IMAGES.VEHICLE_INSPECTION;
  const mechanicImage = LANDING_PAGE_IMAGES.MECHANIC;
  const repairToolImage = LANDING_PAGE_IMAGES.REPAIR_TOOLS;
  const dentRepairImage = LANDING_PAGE_IMAGES.DENT_REPAIR;
  const precisionRepairImage = LANDING_PAGE_IMAGES.PRECISION_REPAIR;
  const defaultProfileImage = LANDING_PAGE_IMAGES.DEFAULT_PROFILE;

  const landingUserInfo = userProfile
    ? { name: userProfile.name, email: userProfile.email, profileImage: "" }
    : userData.userInfo;

  const landingRedirectInfo = userProfile
    ? { type: userProfile.user_type }
    : userData.redirectInfo;

  const landingProfileDropdownData = userProfile
    ? {
        userType: userProfile.user_type,
        userEmail: userProfile.email,
        profileImage: user?.imageUrl || "",
        notifications: userData.notifications,
        unreadCount: userData.notifications.filter((notification) => !notification.read).length,
        reports: userData.reports,
        vehicles: userData.vehicles,
        bids: userData.bids,
        activities: userData.activities,
        onNavigate: (destination: string, tab?: string) => {
          if (tab) {
            navigation.setCurrentTab(tab);
          }
          navigation.setViewMode(destination as any);
          navigation.setShowProfileDropdown(false);
          navigation.setShowLandingPage(false);
        },
        onClose: () => navigation.setShowProfileDropdown(false),
        onLogout: handleLogout,
        forwardedRef: navigation.profileDropdownRef
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
      defaultProfileImage={defaultProfileImage}
      showLandingPage={navigation.showLandingPage}
      showProfileDropdown={navigation.showProfileDropdown}
      userInfo={landingUserInfo}
      redirectInfo={landingRedirectInfo}
      profileDropdownRef={navigation.profileDropdownRef}
      onLoginClick={handleLogin}
      onProfileClick={() => navigation.setShowProfileDropdown(!navigation.showProfileDropdown)}
      onViewDashboard={() => navigation.setShowLandingPage(false)}
      profileDropdownData={landingProfileDropdownData}
    />
  );

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  // Wait for Clerk to load
  if (!isUserLoaded) {
    return <AppLoading />;
  }

  // If user is logged in, show the dashboard or account setup
  if (user && userProfile) {
    // Show account type selector if setup not complete
    if (!userProfile.account_setup_completed) {
      return <ClerkAccountTypeSelector />;
    }

    // Show onboarding if needed
    if (navigation.showOnboarding && !navigation.onboardingComplete) {
      if (userProfile.user_type === "shop") {
        return (
          <ShopOnboarding
            onComplete={() => {
              navigation.setShowOnboarding(false);
              navigation.setOnboardingComplete(true);
            }}
            primaryColor={primaryColor}
          />
        );
      } else if (userProfile.user_type === "insurer") {
        return (
          <InsurerOnboarding
            onComplete={() => {
              navigation.setShowOnboarding(false);
              navigation.setOnboardingComplete(true);
            }}
            primaryColor={primaryColor}
          />
        );
      }
    }

    // Show landing page while logged in
    if (navigation.showLandingPage) {
      return renderLandingPage(true);
    }

    const profileDropdownData = {
      userType: userProfile.user_type,
      userEmail: userProfile.email,
      profileImage: user?.imageUrl || "",
      notifications: userData.notifications,
      unreadCount: userData.notifications.filter((notification) => !notification.read).length,
      reports: userData.reports,
      vehicles: userData.vehicles,
      bids: userData.bids,
      activities: userData.activities,
      onNavigate: (destination: string, tab?: string) => {
        if (tab) {
          navigation.setCurrentTab(tab);
        }
        navigation.setViewMode(destination as any);
        navigation.setShowProfileDropdown(false);
      },
      onClose: () => navigation.setShowProfileDropdown(false),
      onLogout: handleLogout,
      forwardedRef: navigation.profileDropdownRef
    };

    const handleTabClick = (tabId: string) => {
      navigation.setCurrentTab(tabId);
      navigation.setViewMode("dashboard");
    };

    const handleMobileMenuTabClick = (tabId: string) => {
      handleTabClick(tabId);
      navigation.setShowMobileMenu(false);
    };

    const dashboardRouterProps = buildDashboardRouterProps({
      navigation,
      userProfile,
      userData,
      submitBid,
      handleLogout,
      onReportSubmit: handleReportSubmit,
      primaryColor,
      secondaryColor,
      userImageUrl: user?.imageUrl || ""
    });

    return (
      <DashboardLayout
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        currentNavTabs={currentNavTabs}
        currentTab={navigation.currentTab}
        viewMode={navigation.viewMode}
        showMobileMenu={navigation.showMobileMenu}
        showProfileDropdown={navigation.showProfileDropdown}
        profileDropdownRef={navigation.profileDropdownRef}
        userProfile={userProfile}
        userImageUrl={user?.imageUrl || ""}
        notifications={userData.notifications}
        reports={userData.reports}
        vehicles={userData.vehicles}
        bids={userData.bids}
        activities={userData.activities}
        onLogoClick={() => navigation.setShowLandingPage(true)}
        onTabClick={handleTabClick}
        onMobileMenuToggle={() => navigation.setShowMobileMenu(!navigation.showMobileMenu)}
        onMobileMenuTabClick={handleMobileMenuTabClick}
        onProfileToggle={() => navigation.setShowProfileDropdown(!navigation.showProfileDropdown)}
        profileDropdownData={profileDropdownData}
        dashboardRouterProps={dashboardRouterProps}
      />
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