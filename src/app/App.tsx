import { ClerkProvider, useUser, useClerk, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { Suspense, useEffect, useState } from "react";

// Error boundary for dashboard shell (header, sidebar, nav)
import { ScreenErrorBoundary } from "./components/ScreenErrorBoundary";

// Import Clerk service
import { extractUserProfile } from "./services/clerkService";
import { buildWebsiteIdentity } from "./services/auth/websiteIdentity";
import { setClerkTokenGetter } from "./services/supabase/authSession";
import { setSupabaseRealtimeAuth } from "./services/supabase/client";

// Import custom hooks (for non-auth state management)
import { useUserData } from "./hooks/useUserData";
import { useNavigation } from "./hooks/useNavigation";
import { useAppEffects } from "./hooks/useAppEffects";
import { useAppHandlers } from "./hooks/useAppHandlers";
import { useWebsiteSessionSync } from "./hooks/useWebsiteSessionSync";
import { useBusinessProfile } from "./hooks/useBusinessProfile";
import { AppearanceModeProvider, useAppearanceModeCtx } from "./hooks/AppearanceModeContext";

// Notification system
import { useNotificationEvents, NotificationProvider } from "./features/notifications";
import { useNotifications } from "./features/notifications/NotificationContext";
import { useDeepLinkNavigation } from "./hooks/useDeepLinkNavigation";
import NotificationToast from "./components/ui/NotificationToast";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useServiceWorkerUpdate } from "./hooks/useServiceWorkerUpdate";

// Import constants
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  CUSTOMER_NAV_TABS,
  SHOP_NAV_TABS,
  INSURER_NAV_TABS,
} from "./constants";

// Import helpers
import { buildDashboardRouterProps } from "./utils/buildDashboardRouterProps";
import { completeShopOnboarding, completeInsurerOnboarding } from "./utils/onboardingHandlers";
import { renderLandingPage } from "./utils/renderLandingPage";
import { lazyWithRetry } from "./utils/lazyWithRetry";
import type { ViewMode, DamageReport } from "./types";

// Import components
import AppLoading from "./components/app/AppLoading";
import { AuthConfigFallback, useHashPage } from "./components/app/AppShell";
import DashboardLayout from "./components/app/DashboardLayout";
import ClerkAccountTypeSelector from "./components/auth/ClerkAccountTypeSelector";
import ShopOnboarding from "./components/shop/ShopOnboarding";
import InsurerOnboarding from "./components/insurer/InsurerOnboarding";
import AppearanceToggle from "./components/dev/AppearanceToggle";

// Standalone pages (lazy-loaded — only fetched when hash route is visited)
const AboutPage = lazyWithRetry(() => import("./components/landing/AboutPage"));
const PrivacyPolicyPage = lazyWithRetry(() => import("./components/legal/PrivacyPolicyPage"));
const TermsOfServicePage = lazyWithRetry(() => import("./components/legal/TermsOfServicePage"));
const InsurerPartnershipPage = lazyWithRetry(
  () => import("./components/landing/InsurerPartnershipPage")
);

import { clerkAppearance } from "./config/clerkAppearance";

// Read Clerk publishable key from environment (.env)
const clerkPublishableKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) ?? "";

const hasValidClerkPublishableKey =
  typeof clerkPublishableKey === "string" &&
  clerkPublishableKey.length > 0 &&
  clerkPublishableKey.startsWith("pk_") &&
  !clerkPublishableKey.includes("PASTE_YOUR");

if (!hasValidClerkPublishableKey && import.meta.env.DEV) {
  console.error("Missing or invalid VITE_CLERK_PUBLISHABLE_KEY in .env");
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
  const { signOut, openSignUp, openUserProfile } = useClerk();
  const { getToken, isLoaded: isClerkAuthLoaded } = useClerkAuth();
  const userProfile = user ? extractUserProfile(user) : null;

  useEffect(() => {
    if (!isClerkAuthLoaded) {
      return;
    }

    setClerkTokenGetter(() => getToken());

    // Inject Clerk-issued Supabase JWT into Realtime so RLS policies work
    // for live subscriptions. Requires a "supabase" JWT template in Clerk
    // Dashboard signed with Supabase's JWT secret.
    getToken({ template: "supabase" })
      .then((token) => setSupabaseRealtimeAuth(token))
      .catch(() => {
        // Template not configured — Realtime stays unauthenticated (existing behavior)
        if (import.meta.env.DEV)
          console.warn("Clerk 'supabase' JWT template not configured — Realtime unauthenticated");
      });

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
  const [appearanceMode, setAppearanceMode] = useAppearanceModeCtx();

  // ============================================================================
  // CUSTOM HOOKS - Centralized State Management
  // ============================================================================

  // User data state (profile, vehicles, reports, Supabase sync)
  const userData = useUserData(
    user?.id,
    websiteIdentity?.websiteUserKey,
    userProfile?.email,
    isClerkAuthLoaded,
    userProfile?.user_type
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
  useDeepLinkNavigation(notifications, navigation);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const effectiveUserType =
    navigation.demoMode && navigation.demoAccountType
      ? navigation.demoAccountType
      : userProfile?.user_type;

  const currentNavTabs =
    effectiveUserType === "shop"
      ? SHOP_NAV_TABS
      : effectiveUserType === "insurer"
        ? INSURER_NAV_TABS
        : CUSTOMER_NAV_TABS;

  const landingPageDeps = {
    showLandingPage: navigation.showLandingPage,
    showProfileDropdown: navigation.showProfileDropdown,
    userProfile: userProfile
      ? { name: userProfile.name, email: userProfile.email, user_type: userProfile.user_type }
      : null,
    userInfo: userData.userInfo,
    redirectInfo: userData.redirectInfo,
    notifications: userData.notifications,
    reports: userData.reports,
    vehicles: userData.vehicles,
    bids: userData.bids,
    onLoginClick: handleLogin,
    onViewDashboard: () => navigation.setShowLandingPage(false),
    onLogout: handleLogout,
    onNavigate: (destination: string, tab?: string) => {
      if (tab) navigation.setCurrentTab(tab);
      navigation.setViewMode(destination as ViewMode);
      navigation.setShowProfileDropdown(false);
      navigation.setShowLandingPage(false);
    },
    profileDropdownRef: navigation.profileDropdownRef,
  };

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
            primaryColor={PRIMARY_COLOR}
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
            primaryColor={PRIMARY_COLOR}
          />
        );
      }
    }

    // Show landing page while logged in
    if (navigation.showLandingPage) {
      return renderLandingPage(landingPageDeps, true);
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
      primaryColor: PRIMARY_COLOR,
      secondaryColor: SECONDARY_COLOR,
      userImageUrl: user?.imageUrl || "",
      websiteIdentity,
      appearanceMode,
      onAppearanceModeChange: setAppearanceMode,
      openUserProfile,
      showErrorToast: (message: string) => {
        notifications.showToast({
          message,
          variant: "error",
          durationMs: 5000,
          deepLink: null,
        });
      },
    });

    return (
      <ScreenErrorBoundary>
        <DashboardLayout
          primaryColor={PRIMARY_COLOR}
          secondaryColor={SECONDARY_COLOR}
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
          demoMode={navigation.demoMode}
          demoAccountType={navigation.demoAccountType}
          profileDropdownData={profileDropdownData}
          dashboardRouterProps={dashboardRouterProps}
          onNavigateToReport={(reportId) => {
            navigation.setSelectedReportId(reportId);
            navigation.setViewMode("report-detail");
          }}
        />
      </ScreenErrorBoundary>
    );
  }

  // Landing page (not logged in)
  return renderLandingPage(landingPageDeps, false);
}

// Main App component wrapped with ClerkProvider
export default function App() {
  if (!hasValidClerkPublishableKey) {
    return <AuthConfigFallback />;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} appearance={clerkAppearance}>
      <AppWithToast />
    </ClerkProvider>
  );
}

/** Renders AppContent + global toast overlay + PWA lifecycle alerts. */
function AppWithToast() {
  const notificationActions = useNotificationEvents();
  const isOnline = useOnlineStatus();
  const { needRefresh, updateServiceWorker } = useServiceWorkerUpdate();

  // Offline / online toast
  useEffect(() => {
    if (!isOnline) {
      notificationActions.showToast({
        message: "You're offline — cached data is still available.",
        variant: "warning",
        durationMs: 6000,
        deepLink: null,
      });
    } else {
      // Only fire "back online" if the component has been mounted for at
      // least a tick (avoids false positive on initial render).
      const id = setTimeout(() => {
        notificationActions.showToast({
          message: "Back online.",
          variant: "success",
          durationMs: 3000,
          deepLink: null,
        });
      }, 0);
      return () => clearTimeout(id);
    }
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppearanceModeProvider>
      <NotificationProvider value={notificationActions}>
        <AppContent />
        {import.meta.env.DEV && <AppearanceToggle />}
        <NotificationToast
          toast={notificationActions.activeToast}
          onDismiss={notificationActions.dismissToast}
          onDeepLinkClick={notificationActions.navigateDeepLink}
        />
        {needRefresh && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 rounded-xl bg-blue-600 text-white shadow-lg flex items-center gap-3 text-sm">
            <span>A new version is available.</span>
            <button
              onClick={() => void updateServiceWorker()}
              className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 font-medium transition-colors"
            >
              Update
            </button>
          </div>
        )}
      </NotificationProvider>
    </AppearanceModeProvider>
  );
}
