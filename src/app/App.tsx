import { useState, useEffect } from "react";
import { ClerkProvider, useUser, useClerk } from '@clerk/clerk-react';

// Import Clerk service
import { extractUserProfile, isAdminUser as checkIsAdmin } from "./services/clerkService";

// Import custom hooks (for non-auth state management)
import { useUserData } from "./hooks/useUserData";
import { useNavigation } from "./hooks/useNavigation";

// Import constants
import {
  PRIMARY_COLOR,
  SECONDARY_COLOR,
  CTA_BUTTON_TEXT,
  STORAGE_KEYS,
  CUSTOMER_NAV_TABS,
  SHOP_NAV_TABS,
  INSURER_NAV_TABS,
  ADMIN_NAV_TABS,
  LANDING_PAGE_IMAGES,
  getNotificationsByUserType
} from "./constants";

// Import types
import type { Bid, Activity } from "./types";

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
  const { signOut } = useClerk();
  const userProfile = user ? extractUserProfile(user) : null;
  const isAdmin = userProfile ? checkIsAdmin(userProfile) : false;
  
  // ============================================================================
  // CUSTOM HOOKS - Centralized State Management
  // ============================================================================
  
  // User data state (profile, vehicles, reports, Supabase sync)
  const userData = useUserData(user?.id);
  
  // Navigation state (tabs, views, modals, refs)
  const navigation = useNavigation();
  
  // Storage Inspector state (Dev Tool)
  const [showStorageInspector, setShowStorageInspector] = useState(false);
  
  // Log dev tools info on mount (admin only)
  useEffect(() => {
    if (isAdmin) {
      console.log('👑 Admin Dev Tool: Press Ctrl+Shift+S to open Storage Inspector');
    }
  }, [isAdmin]);

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
  const adminNavTabs = ADMIN_NAV_TABS;

  // Navigation tabs config - Switch based on demo mode or actual user type
  const effectiveUserType = navigation.demoMode && navigation.demoAccountType 
    ? navigation.demoAccountType 
    : userProfile?.user_type;
    
  const currentNavTabs = isAdmin ? adminNavTabs :
                        effectiveUserType === "shop" ? shopNavTabs : 
                        effectiveUserType === "insurer" ? insurerNavTabs : 
                        navTabs;

  // ============================================================================
  // EVENT HANDLERS & BUSINESS LOGIC
  // ============================================================================
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navigation.profileDropdownRef.current && !navigation.profileDropdownRef.current.contains(event.target as Node)) {
        navigation.setShowProfileDropdown(false);
      }
    };

    if (navigation.showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigation.showProfileDropdown]);

  // Keyboard shortcut for Storage Inspector (Ctrl+Shift+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only allow admin to open Storage Inspector
      if (!isAdmin) {
        return;
      }
      
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        setShowStorageInspector(prev => !prev);
        console.log('🔍 Storage Inspector toggled');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdmin]);

  // Sync Clerk user data to our state when user changes
  useEffect(() => {
    if (userProfile && userProfile.account_setup_completed) {
      // Only update if values have actually changed to prevent infinite loops
      if (userData.userInfo.name !== userProfile.name || 
          userData.userInfo.email !== userProfile.email) {
        userData.setUserInfo({
          name: userProfile.name,
          email: userProfile.email,
          profileImage: ""
        });
        console.log('✅ Updated user info from Clerk:', {
          name: userProfile.name,
          email: userProfile.email
        });
      }
      
      if (userData.userPhone !== userProfile.phone) {
        userData.setUserPhone(userProfile.phone);
        console.log('✅ Updated phone from Clerk:', userProfile.phone);
      }
      
      // Only update redirect info if user type changed
      if (userData.redirectInfo?.type !== userProfile.user_type) {
        userData.setRedirectInfo({
          type: userProfile.user_type,
          isReturning: true
        });
        console.log('✅ Updated user type from Clerk:', userProfile.user_type);
      }
    }
  }, [userProfile?.name, userProfile?.email, userProfile?.phone, userProfile?.user_type, userProfile?.account_setup_completed, userData.userInfo.name, userData.userInfo.email, userData.userPhone, userData.redirectInfo?.type]);

  const handleLogin = () => {
    // Clerk handles login via its own UI
    console.log('Use Clerk sign-in UI');
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Signing out from Clerk...');
      
      // Sign out from Clerk first
      await signOut();
      
      // Clear local state
      userData.setRedirectInfo(null);
      userData.setUserInfo({ name: "", email: "", profileImage: "" });
      userData.setUserPhone("");
      userData.setVehicles([]);
      userData.setReports([]);
      userData.setBids([]);
      userData.setActivities([]);
      userData.setNotifications([]);
      
      // Show landing page
      navigation.setShowLandingPage(true);
      navigation.setShowProfileDropdown(false);
      
      console.log('✅ Logged out successfully - Clerk session ended & local state cleared');
    } catch (error) {
      console.error('❌ Error during logout:', error);
      // Still clear local state even if Clerk signout fails
      userData.setRedirectInfo(null);
      userData.setUserInfo({ name: "", email: "", profileImage: "" });
      userData.setUserPhone("");
      userData.setVehicles([]);
      userData.setReports([]);
      userData.setBids([]);
      userData.setActivities([]);
      userData.setNotifications([]);
      navigation.setShowLandingPage(true);
      navigation.setShowProfileDropdown(false);
    }
  };

  const addActivity = (
    type: 'bid_submitted' | 'claim_opened' | 'claim_in_progress' | 'claim_approved' | 'claim_denied' | 'new_user',
    message: string,
    metadata?: any
  ) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      type,
      message,
      metadata
    };
    userData.setActivities([newActivity, ...userData.activities]);
  };

  const submitBid = (reportId: string, bidAmount: number) => {
    console.log(`Submitting bid of $${bidAmount} for report ${reportId}`);
    
    const report = userData.reports.find(r => r.id === reportId);
    if (!report) {
      console.error('Report not found:', reportId);
      return;
    }
    
    const vehicleInfo = `${report.year} ${report.make} ${report.model}`;
    
    const newBid: Bid = {
      id: Date.now().toString(),
      reportId,
      shopId: userData.userInfo.email, // Use email as shop ID
      shopName: userData.userInfo.name || "Shop Name",
      amount: bidAmount,
      estimatedDays: Math.floor(Math.random() * 7) + 1,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1), // Mock rating
      reviewCount: Math.floor(Math.random() * 100) + 10, // Mock review count
      shopDistance: `${(Math.random() * 5 + 0.5).toFixed(1)} miles` // Mock distance
    };
    
    // Add bid to global bids list
    const newBids = [...userData.bids, newBid];
    userData.setBids(newBids);
    
    // Update the report to increment bid count
    const updatedReports = userData.reports.map(report => {
      if (report.id === reportId) {
        return {
          ...report,
          bidsCount: (report.bidsCount || 0) + 1,
          bids: [...(report.bids || []), newBid]
        };
      }
      return report;
    });
    userData.setReports(updatedReports);
    
    // Add activity for shop
    addActivity(
      'bid_submitted',
      `Submitted bid of $${bidAmount.toLocaleString()} for ${vehicleInfo}`,
      {
        reportId,
        bidAmount,
        vehicleInfo
      }
    );
    
    console.log('✅ Bid submitted successfully');
    console.log('📊 Report bids count:', updatedReports.find(r => r.id === reportId)?.bidsCount);
    console.log('📈 Total bids:', newBids.length);
  };

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
      isAdmin={isAdmin}
      showStorageInspector={showStorageInspector}
      onCloseStorageInspector={() => setShowStorageInspector(false)}
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

    const dashboardRouterProps = {
      currentTab: navigation.currentTab,
      viewMode: navigation.viewMode,
      userType:
        navigation.demoMode && navigation.demoAccountType
          ? navigation.demoAccountType
          : userProfile.user_type,
      demoMode: navigation.demoMode,
      originalAccountType: userProfile.user_type,
      userInfo: {
        name: userProfile.name,
        email: userProfile.email,
        profileImage: user?.imageUrl || ""
      },
      userPhone: userProfile.phone,
      vehicles: userData.vehicles,
      reports: userData.reports,
      bids: userData.bids,
      shops: [],
      activities: userData.activities,
      photoStorage: userData.photoStorage,
      selectedReportId: navigation.selectedReportId,
      primaryColor,
      secondaryColor,
      onStartReport: () => {
        navigation.setCurrentTab("report");
        navigation.setViewMode("dashboard");
      },
      onSubmitBid: submitBid,
      onViewAllReports: () => {
        navigation.setViewMode("reports-list");
      },
      onConnectInsurance: () => {
        navigation.setViewMode("insurer-connect");
      },
      onViewLikedShops: () => {
        navigation.setViewMode("liked-shops");
      },
      onViewBids: () => {
        navigation.setCurrentTab("bids");
        navigation.setViewMode("dashboard");
      },
      onViewRequests: () => {
        navigation.setCurrentTab("requests");
        navigation.setViewMode("dashboard");
      },
      onViewJobs: () => {
        navigation.setCurrentTab("jobs");
        navigation.setViewMode("dashboard");
      },
      onViewClaims: () => {
        navigation.setCurrentTab("claims");
        navigation.setViewMode("dashboard");
      },
      onViewShops: () => {
        navigation.setViewMode("shop-directory");
      },
      onCreateNewClaim: () => {
        navigation.setViewMode("new-claim");
      },
      onViewCompetitors: () => {
        navigation.setViewMode("competitor-analysis");
      },
      onViewInsurers: () => {
        navigation.setViewMode("insurance-companies");
      },
      onSelectReport: (reportId: string) => {
        navigation.setSelectedReportId(parseInt(reportId));
      },
      onBack: () => {
        navigation.setViewMode("dashboard");
      },
      onViewModeChange: (mode: string) => {
        navigation.setViewMode(mode as any);
      },
      onTabChange: (tab: string) => {
        navigation.setCurrentTab(tab);
      },
      onLogout: handleLogout,
      onEnterDemoMode: () => {
        navigation.setViewMode("demo-switcher" as any);
      },
      onEnableDemoMode: (accountType: string) => {
        if (accountType === userProfile.user_type) {
          navigation.exitDemoMode();
        } else {
          navigation.enableDemoMode(accountType);
        }
      },
      onExitDemoMode: () => {
        navigation.exitDemoMode();
      },
      onProfileUpdate: (info: { name: string; email: string; profileImage?: string; phone?: string }) => {
        userData.setUserInfo({
          name: info.name,
          email: info.email,
          profileImage: info.profileImage || ""
        });
        if (info.phone) {
          userData.setUserPhone(info.phone);
        }
      },
      onPasswordChange: () => {
        console.log("Password change not implemented");
      },
      onDeleteAccount: () => {
        console.log("Delete account not implemented");
      },
      onSaveVehicles: (vehicles: any[]) => {
        userData.setVehicles(vehicles);
      },
      onSaveVehicle: (vehicle: any) => {
        const existingIndex = userData.vehicles.findIndex((entry) => entry.id === vehicle.id);
        if (existingIndex >= 0) {
          userData.setVehicles(
            userData.vehicles.map((entry) => (entry.id === vehicle.id ? vehicle : entry))
          );
        } else {
          userData.setVehicles([...userData.vehicles, vehicle]);
        }
      },
      hasSeenPhotoGuide: userData.hasSeenPhotoGuide,
      onPhotoGuideComplete: () => {
        userData.setHasSeenPhotoGuide(true);
      },
      onReportSubmit: async (report: any) => {
        try {
          console.log("📝 Submitting damage report to API...");

          const apiReport = {
            vehicle_make: report.vehicle?.make || "",
            vehicle_model: report.vehicle?.model || "",
            vehicle_year: report.vehicle?.year || "0",
            damage_type: report.damageArea || "unknown",
            damage_severity: "moderate",
            damage_description: report.description || "",
            damage_location: report.damageArea || "",
            photo_urls: report.photos || [],
            insurance_claim: false,
            preferred_contact: "email",
            additional_notes: report.incident || "",
            status: "pending"
          };

          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-9f243523/reports`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${publicAnonKey}`
              },
              body: JSON.stringify({
                clerk_user_id: user?.id,
                report: apiReport
              })
            }
          );

          const data = await response.json();

          if (!response.ok) {
            console.error("❌ Failed to save report:", data.error || data.details);
            userData.setReports([...userData.reports, report]);
            return;
          }

          console.log("✅ Damage report saved to database:", data.report?.id);

          const savedReport = {
            ...report,
            id: data.report?.id || report.id
          };
          userData.setReports([...userData.reports, savedReport]);
        } catch (error) {
          console.error("❌ Error submitting report:", error);
          userData.setReports([...userData.reports, report]);
        }
      }
    };

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
        isAdmin={isAdmin}
        showStorageInspector={showStorageInspector}
        onCloseStorageInspector={() => setShowStorageInspector(false)}
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