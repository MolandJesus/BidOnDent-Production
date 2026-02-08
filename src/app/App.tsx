import React, { useState, useEffect, useRef } from "react";
import { ClerkProvider, SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';
import { motion, AnimatePresence } from "motion/react";
import { 
  Car, 
  Menu, 
  X, 
  FileText, 
  Home, 
  Briefcase, 
  Shield, 
  Bell, 
  Settings, 
  LogOut,
  ChevronRight,
  User
} from "lucide-react";

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
import type { 
  Vehicle, 
  Report, 
  Bid, 
  Notification, 
  Activity 
} from "./types";

// Import components
import HeroSection from "./components/landing/HeroSection";
import HowItWorksSection from "./components/landing/HowItWorksSection";
import BenefitsSection from "./components/landing/BenefitsSection";
import WhoWeServeSection from "./components/landing/WhoWeServeSection";
import TrustStatsSection from "./components/landing/TrustStatsSection";
import CTASection from "./components/landing/CTASection";
import FooterSection from "./components/landing/FooterSection";
import LandingPageHeader from "./components/LandingPageHeader";
import ClerkAccountTypeSelector from "./components/ClerkAccountTypeSelector";
import ProfileDropdown from "./components/dashboard/ProfileDropdown";
import MobileBottomNav from "./components/dashboard/MobileBottomNav";
import DashboardRouter from "./routers/DashboardRouter";
import ShopOnboarding from "./components/ShopOnboarding";
import InsurerOnboarding from "./components/InsurerOnboarding";
import DeleteUserUtility from "./components/DeleteUserUtility";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import StorageInspector from "./components/StorageInspector";

// Import Supabase service functions (for database/storage only, not auth)
import { supabase } from "./services/supabaseService";
import {
  getProfile,
  saveProfile,
  saveAccountTypeToSupabase,
} from "./services/supabaseService";

// Import utility functions
import { formatPhoneNumber, unformatPhoneNumber } from "./utils/formatters";
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

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  // Render landing page (can be logged in or not)
  const renderLandingPage = (isLoggedIn: boolean) => {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <LandingPageHeader 
          isLoggedIn={isLoggedIn}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          showLandingPage={navigation.showLandingPage}
          showProfileDropdown={navigation.showProfileDropdown}
          userInfo={userProfile ? {
            name: userProfile.name,
            email: userProfile.email,
            profileImage: ""
          } : userData.userInfo}
          redirectInfo={userProfile ? {
            type: userProfile.user_type
          } : userData.redirectInfo}
          profileDropdownRef={navigation.profileDropdownRef}
          onLoginClick={handleLogin}
          onProfileClick={() => navigation.setShowProfileDropdown(!navigation.showProfileDropdown)}
          onViewDashboard={() => navigation.setShowLandingPage(false)}
          onLogout={handleLogout}
          defaultProfileImage={defaultProfileImage}
        />

        {/* Hero Section */}
        <HeroSection
          heroImage={heroImage}
          ctaButtonText={ctaButtonText}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          onGetStartedClick={() => {}} // No longer needed
        />

        {/* How It Works */}
        <HowItWorksSection
          vehicleInspectionImage={vehicleInspectionImage}
          primaryColor={primaryColor}
        />

        {/* Benefits Section */}
        <BenefitsSection
          mechanicImage={mechanicImage}
          repairToolImage={repairToolImage}
          dentRepairImage={dentRepairImage}
          precisionRepairImage={precisionRepairImage}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />

        {/* Who We Serve */}
        <WhoWeServeSection primaryColor={primaryColor} />

        {/* Trust Stats */}
        <TrustStatsSection
          repairToolImage={repairToolImage}
          primaryColor={primaryColor}
        />

        {/* CTA Section */}
        <CTASection
          primaryColor={primaryColor}
          onNavigateToDashboard={() => navigation.setShowLandingPage(false)}
        />

        {/* Footer */}
        <FooterSection 
          primaryColor={primaryColor} 
          secondaryColor={secondaryColor} 
        />

        {/* Profile Dropdown (logged in only) */}
        {isLoggedIn && navigation.showProfileDropdown && userProfile && (
          <ProfileDropdown
            userInfo={{
              name: userProfile.name,
              email: userProfile.email,
              profileImage: user?.imageUrl || ""
            }}
            userType={userProfile.user_type}
            notifications={userData.notifications}
            unreadCount={userData.notifications.filter(n => !n.read).length}
            isOpen={navigation.showProfileDropdown}
            onClose={() => navigation.setShowProfileDropdown(false)}
            onNavigate={(destination, tab) => {
              if (tab) {
                navigation.setCurrentTab(tab);
              }
              navigation.setViewMode(destination as any);
              navigation.setShowProfileDropdown(false);
              navigation.setShowLandingPage(false);
            }}
            onLogout={handleLogout}
            forwardedRef={navigation.profileDropdownRef}
            userEmail={userProfile.email}
            reports={userData.reports}
            vehicles={userData.vehicles}
            bids={userData.bids}
            activities={userData.activities}
          />
        )}

        {/* Storage Inspector (Admin only) */}
        {showStorageInspector && isAdmin && (
          <StorageInspector onClose={() => setShowStorageInspector(false)} />
        )}

        {/* Delete User Utility (Dev Tool - Admin only) */}
        {isAdmin && <DeleteUserUtility />}
      </div>
    );
  };

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================

  // Wait for Clerk to load
  if (!isUserLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
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

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Header with Logo and Profile */}
            <div className="py-3 flex items-center justify-between">
              {/* Logo */}
              <button 
                onClick={() => navigation.setShowLandingPage(true)}
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <Car className="w-6 h-6" style={{ color: primaryColor }} />
                <h1 className="text-2xl font-bold tracking-tight">
                  <span style={{ 
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>Bid</span>
                  <span style={{ color: '#70c0ee' }}>On</span>
                  <span className="text-gray-800">Dent</span>
                </h1>
              </button>

              {/* Desktop Navigation Tabs */}
              <nav className="hidden md:flex items-center space-x-1">
                {currentNavTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = navigation.currentTab === tab.id && navigation.viewMode === "dashboard";
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        navigation.setCurrentTab(tab.id);
                        navigation.setViewMode("dashboard");
                      }}
                      className={`px-4 py-2 rounded-md font-medium transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      style={isActive ? { backgroundColor: primaryColor } : {}}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Profile Dropdown Trigger */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => navigation.setShowProfileDropdown(!navigation.showProfileDropdown)}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {user?.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold shadow-md">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{userProfile.name}</p>
                    <p className="text-sm text-gray-500">{userProfile.email}</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {navigation.showProfileDropdown && (
                  <ProfileDropdown
                    userInfo={{
                      name: userProfile.name,
                      email: userProfile.email,
                      profileImage: user?.imageUrl || ""
                    }}
                    userType={userProfile.user_type}
                    notifications={userData.notifications}
                    unreadCount={userData.notifications.filter(n => !n.read).length}
                    isOpen={navigation.showProfileDropdown}
                    onClose={() => navigation.setShowProfileDropdown(false)}
                    onNavigate={(destination, tab) => {
                      if (tab) {
                        navigation.setCurrentTab(tab);
                      }
                      navigation.setViewMode(destination as any);
                      navigation.setShowProfileDropdown(false);
                    }}
                    onLogout={handleLogout}
                    forwardedRef={navigation.profileDropdownRef}
                    userEmail={userProfile.email}
                    reports={userData.reports}
                    vehicles={userData.vehicles}
                    bids={userData.bids}
                    activities={userData.activities}
                  />
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => navigation.setShowMobileMenu(!navigation.showMobileMenu)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {navigation.showMobileMenu ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>

            {/* Mobile Menu */}
            {navigation.showMobileMenu && (
              <div className="md:hidden py-4 border-t border-gray-200">
                <div className="space-y-2">
                  {currentNavTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = navigation.currentTab === tab.id && navigation.viewMode === "dashboard";
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          navigation.setCurrentTab(tab.id);
                          navigation.setViewMode("dashboard");
                          navigation.setShowMobileMenu(false);
                        }}
                        className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left ${
                          isActive
                            ? "text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        style={isActive ? { backgroundColor: primaryColor } : {}}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span>{tab.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-20 md:pb-0">
          <DashboardRouter
            currentTab={navigation.currentTab}
            viewMode={navigation.viewMode}
            userType={navigation.demoMode && navigation.demoAccountType ? navigation.demoAccountType : userProfile.user_type}
            demoMode={navigation.demoMode}
            originalAccountType={userProfile.user_type}
            userInfo={{
              name: userProfile.name,
              email: userProfile.email,
              profileImage: user?.imageUrl || ""
            }}
            userPhone={userProfile.phone}
            vehicles={userData.vehicles}
            reports={userData.reports}
            bids={userData.bids}
            shops={[]}
            activities={userData.activities}
            photoStorage={userData.photoStorage}
            selectedReportId={navigation.selectedReportId}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onStartReport={() => {
              navigation.setCurrentTab('report');
              navigation.setViewMode('dashboard');
            }}
            onSubmitBid={submitBid}
            onViewAllReports={() => {
              navigation.setViewMode('reports-list');
            }}
            onConnectInsurance={() => {
              navigation.setViewMode('insurer-connect');
            }}
            onViewLikedShops={() => {
              navigation.setViewMode('liked-shops');
            }}
            onViewBids={() => {
              navigation.setCurrentTab('bids');
              navigation.setViewMode('dashboard');
            }}
            onViewRequests={() => {
              navigation.setCurrentTab('requests');
              navigation.setViewMode('dashboard');
            }}
            onViewJobs={() => {
              navigation.setCurrentTab('jobs');
              navigation.setViewMode('dashboard');
            }}
            onViewClaims={() => {
              navigation.setCurrentTab('claims');
              navigation.setViewMode('dashboard');
            }}
            onViewShops={() => {
              navigation.setViewMode('shop-directory');
            }}
            onCreateNewClaim={() => {
              navigation.setViewMode('new-claim');
            }}
            onViewCompetitors={() => {
              navigation.setViewMode('competitor-analysis');
            }}
            onViewInsurers={() => {
              navigation.setViewMode('insurance-companies');
            }}
            onSelectReport={(reportId) => {
              navigation.setSelectedReportId(parseInt(reportId));
            }}
            onBack={() => {
              navigation.setViewMode('dashboard');
            }}
            onViewModeChange={(mode) => {
              navigation.setViewMode(mode as any);
            }}
            onTabChange={(tab) => {
              navigation.setCurrentTab(tab);
            }}
            onLogout={handleLogout}
            onEnterDemoMode={() => {
              navigation.setViewMode('demo-switcher' as any);
            }}
            onEnableDemoMode={(accountType) => {
              // If user selects their own account type, exit demo mode instead
              if (accountType === userProfile.user_type) {
                navigation.exitDemoMode();
              } else {
                navigation.enableDemoMode(accountType);
              }
            }}
            onExitDemoMode={() => {
              navigation.exitDemoMode();
            }}
            onProfileUpdate={(info) => {
              userData.setUserInfo({
                name: info.name,
                email: info.email,
                profileImage: info.profileImage || ""
              });
              if (info.phone) {
                userData.setUserPhone(info.phone);
              }
            }}
            onPasswordChange={(passwords) => {
              console.log('Password change not implemented');
            }}
            onDeleteAccount={() => {
              console.log('Delete account not implemented');
            }}
            onSaveVehicles={(vehicles) => {
              userData.setVehicles(vehicles);
            }}
            onSaveVehicle={(vehicle) => {
              const existingIndex = userData.vehicles.findIndex(v => v.id === vehicle.id);
              if (existingIndex >= 0) {
                userData.setVehicles(
                  userData.vehicles.map(v => v.id === vehicle.id ? vehicle : v)
                );
              } else {
                userData.setVehicles([...userData.vehicles, vehicle]);
              }
            }}
            hasSeenPhotoGuide={userData.hasSeenPhotoGuide}
            onPhotoGuideComplete={() => {
              userData.setHasSeenPhotoGuide(true);
            }}
            onReportSubmit={async (report) => {
              try {
                console.log('📝 Submitting damage report to API...');
                
                // Transform the report to match the API expectations
                const apiReport = {
                  vehicle_make: report.vehicle?.make || '',
                  vehicle_model: report.vehicle?.model || '',
                  vehicle_year: report.vehicle?.year || '0',
                  damage_type: report.damageArea || 'unknown',
                  damage_severity: 'moderate',
                  damage_description: report.description || '',
                  damage_location: report.damageArea || '',
                  photo_urls: report.photos || [],
                  insurance_claim: false,
                  preferred_contact: 'email',
                  additional_notes: report.incident || '',
                  status: 'pending'
                };
                
                // Call the API endpoint with Clerk user ID
                const response = await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-9f243523/reports`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${publicAnonKey}`
                    },
                    body: JSON.stringify({
                      clerk_user_id: user?.id,
                      report: apiReport
                    })
                  }
                );
                
                const data = await response.json();
                
                if (!response.ok) {
                  console.error('❌ Failed to save report:', data.error || data.details);
                  // Still add to local state for offline functionality
                  userData.setReports([...userData.reports, report]);
                  return;
                }
                
                console.log('✅ Damage report saved to database:', data.report?.id);
                
                // Update local state with the saved report (including DB id)
                const savedReport = {
                  ...report,
                  id: data.report?.id || report.id
                };
                userData.setReports([...userData.reports, savedReport]);
              } catch (error) {
                console.error('❌ Error submitting report:', error);
                // Still add to local state for offline functionality
                userData.setReports([...userData.reports, report]);
              }
            }}
          />
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          tabs={currentNavTabs}
          currentTab={navigation.currentTab}
          viewMode={navigation.viewMode}
          primaryColor={primaryColor}
          onTabClick={(tabId) => {
            navigation.setCurrentTab(tabId);
            navigation.setViewMode("dashboard");
          }}
        />

        {/* Storage Inspector (Admin only) */}
        {showStorageInspector && isAdmin && (
          <StorageInspector onClose={() => setShowStorageInspector(false)} />
        )}

        {/* Delete User Utility (Dev Tool - Admin only) */}
        {isAdmin && <DeleteUserUtility />}
      </div>
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