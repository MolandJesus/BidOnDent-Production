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
import { useAppearanceMode } from "./hooks/useAppearanceMode";

// Notification system
import { useNotificationEvents, NotificationProvider } from "./features/notifications";
import { useNotifications } from "./features/notifications/NotificationContext";
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
import type { ViewMode, DamageReport } from "./types";

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
        sessionHint: user?.lastSignInAt ? String(user.lastSignInAt) : "",
      })
    : null;
  const isWebsiteSessionHydrated = useWebsiteSessionSync(websiteIdentity, userProfile?.user_type);
  const {
    businessProfile,
    error: businessProfileError,
    isLoading: isBusinessProfileLoading,
    saveProfile: saveBusinessProfile,
  } = useBusinessProfile(websiteIdentity, userProfile?.user_type);
  const [appearanceMode, setAppearanceMode] = useAppearanceMode();

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

  // Notification-enhanced report submission: toast + auto-redirect to shop directory
  const notifications = useNotifications();
  const handleReportSubmitWithNotification = async (report: DamageReport) => {
    try {
      await handleReportSubmit(report);
      notifications.push({
        category: "report",
        title: "Report submitted!",
        body: "Shops in your area will start sending bids soon.",
        payload: { reportId: report.id },
        userId: user?.id ?? "",
        deepLink: { screen: "dashboard" },
        priority: "normal",
      });
      notifications.showToast({
        message: "Report submitted — browse nearby shops!",
        variant: "success",
        durationMs: 4000,
        deepLink: { screen: "shop-directory" },
      });
    } catch (error) {
      notifications.showToast({
        message: "Failed to submit report. Please try again.",
        variant: "error",
        durationMs: 5000,
        deepLink: null,
      });
      throw error;
    }
  };

  useAppEffects({
    navigation,
    userProfile,
    userData,
  });

  // Register deep link navigation handler for toast clicks
  useEffect(() => {
    notifications.setDeepLinkHandler((deepLink) => {
      if (!deepLink) return;
      switch (deepLink.screen) {
        case "dashboard":
          navigation.setViewMode("dashboard");
          break;
        case "report":
          navigation.setSelectedReportId(deepLink.reportId);
          navigation.setViewMode("report-detail");
          break;
        case "bid":
          navigation.setCurrentTab("bids");
          navigation.setViewMode("dashboard");
          break;
        case "shop":
          navigation.setViewMode("shop-directory");
          break;
        case "shop-directory":
          navigation.setViewMode("shop-directory");
          break;
        case "navigation":
          navigation.setViewMode("shop-directory");
          break;
      }
    });
    return () => notifications.setDeepLinkHandler(null);
  }, [notifications, navigation]);

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
    const adaptedSave = async (d: Record<string, unknown>) => {
      await saveBusinessProfile(d as Parameters<typeof saveBusinessProfile>[0]);
    };
    await completeShopOnboarding(data, adaptedSave);
  };

  const handleInsurerOnboardingComplete = async (
    data: Parameters<typeof completeInsurerOnboarding>[0]
  ) => {
    if (!websiteIdentity || !userProfile) return;
    const adaptedSave = async (d: Record<string, unknown>) => {
      await saveBusinessProfile(d as Parameters<typeof saveBusinessProfile>[0]);
    };
    await completeInsurerOnboarding(data, adaptedSave);
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
      onReportSubmit: handleReportSubmitWithNotification,
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
        onDeepLinkClick={notificationActions.navigateDeepLink}
      />
    </NotificationProvider>
  );
}
