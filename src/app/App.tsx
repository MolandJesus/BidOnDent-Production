import { ClerkProvider, useUser, useClerk } from "@clerk/clerk-react";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";

// Import Clerk service
import { extractUserProfile } from "./services/clerkService";
import { buildWebsiteIdentity } from "./services/auth/websiteIdentity";

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
import type { ShopOnboardingFormData, InsurerOnboardingFormData, ViewMode } from "./types";
import type { DashboardAppearanceMode } from "./routers/dashboard-router-types";

// Import components
import AppLoading from "./components/app/AppLoading";
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

if (!hasValidClerkPublishableKey) {
  console.error("Missing or invalid Clerk publishable key in utils/clerk/info.tsx");
}

function AuthConfigFallback() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">App setup required</h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          The app could not initialize authentication because the Clerk publishable key is missing
          or invalid.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-slate-700">
          <li>Open utils/clerk/info.tsx</li>
          <li>Set clerkPublishableKey to your Clerk pk_test or pk_live value</li>
          <li>Refresh the browser</li>
        </ol>
      </div>
    </div>
  );
}

// ============================================================================
// HASH PAGE ROUTING — standalone pages (legal, about, partnership)
// ============================================================================
const HASH_PAGES = ["about", "privacy-policy", "terms-of-service", "insurer-partnership"] as const;
type HashPage = (typeof HASH_PAGES)[number];

function parseHashPage(hash: string): HashPage | null {
  const path = hash.replace(/^#\/?/, "");
  return HASH_PAGES.includes(path as HashPage) ? (path as HashPage) : null;
}

function useHashPage() {
  const [page, setPage] = useState<HashPage | null>(() => parseHashPage(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setPage(parseHashPage(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const clearPage = useCallback(() => {
    setPage(null);
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  return { hashPage: page, clearHashPage: clearPage };
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
  const userProfile = user ? extractUserProfile(user) : null;
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
    document.documentElement.style.colorScheme = appearanceMode === "light" ? "light" : "dark";
  }, [appearanceMode]);

  // ============================================================================
  // CUSTOM HOOKS - Centralized State Management
  // ============================================================================

  // User data state (profile, vehicles, reports, Supabase sync)
  const userData = useUserData(user?.id, websiteIdentity?.websiteUserKey, userProfile?.email);

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

  const handleShopOnboardingComplete = async (data: ShopOnboardingFormData) => {
    if (!websiteIdentity || !userProfile) {
      return;
    }

    await saveBusinessProfile({
      aboutSummary: `${data.shopName} is now part of the BidOnDent network for ${data.city}, ${data.state}.`,
      acceptsInsuranceClaims: !!data.insurance,
      averageRating: 4.7,
      averageTicketValue: data.specialties?.includes("Luxury Vehicles") ? 1050 : 890,
      businessAddress: data.address,
      businessCity: data.city,
      businessHours: data.hours,
      businessName: data.shopName,
      businessPhone: data.phone,
      businessState: data.state,
      businessZip: data.zip,
      certifications: data.certifications || [],
      completionRate: 95,
      insurerPrograms: data.insurance ? ["Progressive", "State Farm"] : [],
      isAcceptingBids: true,
      isDirectoryVisible: true,
      offersEstimates: !!data.estimates,
      profileImageUrl: null,
      responseTimeHours: 3,
      specialties: data.specialties || [],
      supportedMakes: [],
      totalReviews: 0,
      website: data.website || null,
    });
  };

  const handleInsurerOnboardingComplete = async (data: InsurerOnboardingFormData) => {
    if (!websiteIdentity || !userProfile) {
      return;
    }

    await saveBusinessProfile({
      accountConnectionNotes: [
        "Provider-agnostic insurer profile created from onboarding",
        data.autoApproval
          ? "Auto-approval is enabled for qualified claims"
          : "Manual review stays in place for higher-touch claims",
      ],
      autoApproval: !!data.autoApproval,
      benefits: ["Claims routing", "Repair-network coordination"],
      claimTypes: data.claimTypes || [],
      companyAddress: data.address,
      companyCity: data.city,
      companyName: data.companyName,
      companyPhone: data.phone,
      companyState: data.state,
      companyZip: data.zip,
      description: `${data.companyName} is now available in the BidOnDent insurer directory.`,
      digitalClaimsExperience: data.autoApproval ? "excellent" : "strong",
      isDirectoryVisible: true,
      licenseNumber: data.licenseNumber,
      licenseState: data.state,
      maxClaimAmount: data.maxClaimAmount ? Number(data.maxClaimAmount) : null,
      popular: false,
      preferredShops: !!data.preferredShops,
      profileImageUrl: null,
      repairProgramFocus: data.claimTypes || [],
      website: data.website || null,
    });
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
