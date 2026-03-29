import { ClerkProvider, useUser, useClerk, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { lazy, Suspense, useEffect, useState } from "react";

// Import Clerk service
import { extractUserProfile } from "./services/clerkService";
import { buildWebsiteIdentity } from "./services/auth/websiteIdentity";
import { setClerkTokenGetter } from "./services/supabase/authSession";

// Import custom hooks (for non-auth state management)
import { useUserData } from "./hooks/useUserData";
import { useNavigation } from "./hooks/useNavigation";
import { useAppEffects } from "./hooks/useAppEffects";
import { useAppHandlers } from "./hooks/useAppHandlers";
import { useWebsiteSessionSync } from "./hooks/useWebsiteSessionSync";
import { useBusinessProfile } from "./hooks/useBusinessProfile";

// Notification system
import { useNotificationEvents, NotificationProvider } from "./features/notifications";
import NotificationToast from "./components/ui/NotificationToast";

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
import { completeShopOnboarding, completeInsurerOnboarding } from "./utils/onboardingHandlers";
import type { ViewMode } from "./types";
import type { DashboardAppearanceMode } from "./routers/dashboard-router-types";

// Import components
import AppLoading from "./components/app/AppLoading";
import { AuthConfigFallback, useHashPage } from "./components/app/AppShell";
import DashboardLayout from "./components/app/DashboardLayout";
import LandingPageLayout from "./components/app/LandingPageLayout";
import ClerkAccountTypeSelector from "./components/auth/ClerkAccountTypeSelector";
import ShopOnboarding from "./components/shop/ShopOnboarding";
import InsurerOnboarding from "./components/insurer/InsurerOnboarding";

// Standalone pages (lazy-loaded — only fetched when hash route is visited)
const AboutPage = lazy(() => import("./components/landing/AboutPage"));
const PrivacyPolicyPage = lazy(() => import("./components/legal/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./components/legal/TermsOfServicePage"));
const InsurerPartnershipPage = lazy(() => import("./components/landing/InsurerPartnershipPage"));

import { clerkPublishableKey } from "../../utils/clerk/info";

const hasValidClerkPublishableKey =
  typeof clerkPublishableKey === "string" &&
  clerkPublishableKey.length > 0 &&
  clerkPublishableKey.startsWith("pk_") &&
  !clerkPublishableKey.includes("PASTE_YOUR");

if (!hasValidClerkPublishableKey && import.meta.env.DEV) {
  console.error("Missing or invalid Clerk publishable key in utils/clerk/info.tsx");
}

const APPEARANCE_STORAGE_KEY = "bidondent.appearance-mode";

function readSavedAppearanceMode(): DashboardAppearanceMode {
  if (typeof window === "undefined") {
    return "map-dark";
  }

  const saved = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
  if (saved === "light" || saved === "map-dark") {
    return saved;
  }

  // Respect OS preference when no explicit choice has been saved
  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "map-dark";
}

// Main App content (wrapped by ClerkProvider)
function AppContent() {
  // ============================================================================
  // HASH PAGE ROUTING
  // ============================================================================
  const { hashPage, clearHashPage } = useHashPage();

  // ============================================================================
  // CLERK AUTH - Replaces useAuth hook
  // ============================================================================
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut, openSignUp } = useClerk();
  const { getToken, isLoaded: isClerkAuthLoaded } = useClerkAuth();
  const userProfile = user ? extractUserProfile(user) : null;

  useEffect(() => {
    if (!isClerkAuthLoaded) {
      return;
    }

    setClerkTokenGetter(() => getToken());

    return () => {
      setClerkTokenGetter(null);
    };
  }, [getToken, isClerkAuthLoaded]);

  const websiteIdentity = userProfile
    ? buildWebsiteIdentity({
        provider: "clerk",
        providerUserId: user?.id,
        email: userProfile.email,
        displayName: userProfile.name || user?.fullName || "",
        sessionHint: String((user as any)?.lastSignInAt || ""),
      })
    : null;
  const isWebsiteSessionHydrated = useWebsiteSessionSync(websiteIdentity, userProfile?.user_type);
  const {
    businessProfile,
    error: businessProfileError,
    isLoading: isBusinessProfileLoading,
    saveProfile: saveBusinessProfile,
  } = useBusinessProfile(websiteIdentity, userProfile?.user_type);
  const [appearanceMode, setAppearanceMode] =
    useState<DashboardAppearanceMode>(readSavedAppearanceMode);

  useEffect(() => {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, appearanceMode);
    document.documentElement.setAttribute("data-appearance-mode", appearanceMode);
    document.documentElement.style.colorScheme = "dark";
  }, [appearanceMode]);

  // Sync appearance mode across browser tabs via storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === APPEARANCE_STORAGE_KEY && e.newValue) {
        if (e.newValue === "light" || e.newValue === "map-dark") {
          setAppearanceMode(e.newValue);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // ============================================================================
  // CUSTOM HOOKS - Centralized State Management
  // ============================================================================

  // User data state (profile, vehicles, reports, Supabase sync)
  const userData = useUserData(
    user?.id,
    websiteIdentity?.websiteUserKey,
    userProfile?.email,
    isClerkAuthLoaded
  );

  // Navigation state (tabs, views, modals, refs)
  const navigation = useNavigation();

  const { handleLogin, handleDeleteAccount, handleLogout, submitBid, handleReportSubmit } =
    useAppHandlers({
      deleteCurrentUser: user?.delete ? async () => user.delete() : undefined,
      userId: user?.id,
      signOut,
      openSignUp,
      userData,
      navigation,
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
    ? { name: userProfile.name, email: userProfile.email, profileImage: "" }
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
          navigation.setViewMode(destination as ViewMode);
          navigation.setShowProfileDropdown(false);
          navigation.setShowLandingPage(false);
        },
        onLogout: handleLogout,
        forwardedRef: navigation.profileDropdownRef,
      }
    : undefined;

  const shouldWaitForBusinessProfile =
    !!user && !!userProfile && userProfile.user_type !== "customer" && isBusinessProfileLoading;
  const shouldShowBusinessOnboarding =
    !!user &&
    !!userProfile &&
    userProfile.user_type !== "customer" &&
    !isBusinessProfileLoading &&
    !businessProfileError &&
    !businessProfile;

  const handleShopOnboardingComplete = async (
    data: Parameters<typeof completeShopOnboarding>[0]
  ) => {
    if (!websiteIdentity || !userProfile) return;
    await completeShopOnboarding(data, saveBusinessProfile);
  };

  const handleInsurerOnboardingComplete = async (
    data: Parameters<typeof completeInsurerOnboarding>[0]
  ) => {
    if (!websiteIdentity || !userProfile) return;
    await completeInsurerOnboarding(data, saveBusinessProfile);
  };

  const renderLandingPage = (isLoggedIn: boolean) => (
    <LandingPageLayout
      isLoggedIn={isLoggedIn}
      appearanceMode={appearanceMode}
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
      onAppearanceModeChange={setAppearanceMode}
      profileDropdownData={landingProfileDropdownData}
    />
  );

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  // Standalone hash pages (legal, about, partnership) — render before anything else
  if (hashPage) {
    const backToHome = clearHashPage;
    return (
      <Suspense fallback={<AppLoading />}>
        {hashPage === "about" && <AboutPage onBackToHome={backToHome} />}
        {hashPage === "privacy-policy" && <PrivacyPolicyPage onBackToHome={backToHome} />}
        {hashPage === "terms-of-service" && <TermsOfServicePage onBackToHome={backToHome} />}
        {hashPage === "insurer-partnership" && <InsurerPartnershipPage onBackToHome={backToHome} />}
      </Suspense>
    );
  }

  // Wait for Clerk to load
  if (
    !isUserLoaded ||
    !isClerkAuthLoaded ||
    (user && websiteIdentity && !isWebsiteSessionHydrated) ||
    shouldWaitForBusinessProfile
  ) {
    return <AppLoading />;
  }

  // If user is logged in, show the dashboard or account setup
  if (user && userProfile) {
    // Show account type selector if setup not complete
    if (!userProfile.account_setup_completed) {
      return <ClerkAccountTypeSelector />;
    }

    if (
      shouldShowBusinessOnboarding ||
      (navigation.showOnboarding && !navigation.onboardingComplete)
    ) {
      if (userProfile.user_type === "shop") {
        return (
          <ShopOnboarding
            onComplete={async (data) => {
              await handleShopOnboardingComplete(data);
              navigation.setShowOnboarding(false);
              navigation.setOnboardingComplete(true);
            }}
            primaryColor={primaryColor}
          />
        );
      }

      if (userProfile.user_type === "insurer") {
        return (
          <InsurerOnboarding
            onComplete={async (data) => {
              await handleInsurerOnboardingComplete(data);
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
      reports: userData.reports,
      vehicles: userData.vehicles,
      bids: userData.bids,
      onNavigate: (destination: string, tab?: string) => {
        if (tab) {
          navigation.setCurrentTab(tab);
        }
        navigation.setViewMode(destination as ViewMode);
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
      handleDeleteAccount,
      handleLogout,
      onReportSubmit: handleReportSubmit,
      primaryColor,
      secondaryColor,
      userImageUrl: user?.imageUrl || "",
      websiteIdentity,
      appearanceMode,
      onAppearanceModeChange: setAppearanceMode,
    });

    return (
      <DashboardLayout
        appearanceMode={appearanceMode}
        onAppearanceModeChange={setAppearanceMode}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        currentNavTabs={currentNavTabs}
        currentTab={navigation.currentTab}
        viewMode={navigation.viewMode}
        showProfileDropdown={navigation.showProfileDropdown}
        userProfile={userProfile}
        userImageUrl={user?.imageUrl || ""}
        notifications={userData.notifications}
        notificationSyncActive={false}
        onMarkNotificationRead={(id) => {
          userData.setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }}
        onMarkAllNotificationsRead={() => {
          userData.setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        reports={userData.reports}
        vehicles={userData.vehicles}
        bids={userData.bids}
        onLogoClick={() => navigation.setShowLandingPage(true)}
        onTabClick={handleTabClick}
        onMobileMenuTabClick={handleTabClick}
        onProfileToggle={() => navigation.setShowProfileDropdown((current) => !current)}
        onOpenDemoMode={() => navigation.setViewMode("demo-switcher")}
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
  if (!hasValidClerkPublishableKey) {
    return <AuthConfigFallback />;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AppWithToast />
    </ClerkProvider>
  );
}

/** Renders AppContent + global toast overlay. */
function AppWithToast() {
  const notificationActions = useNotificationEvents();
  return (
    <NotificationProvider value={notificationActions}>
      <AppContent />
      <NotificationToast
        toast={notificationActions.activeToast}
        onDismiss={notificationActions.dismissToast}
      />
    </NotificationProvider>
  );
}
