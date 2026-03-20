// Custom hook for managing UI navigation and view state
import { useState, useRef, useEffect } from "react";
import type { ViewMode } from "../types";

const NAVIGATION_STORAGE_KEY = "bidondent_navigation_state";

// Load saved navigation state from localStorage
const loadSavedState = () => {
  try {
    const saved = localStorage.getItem(NAVIGATION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        currentTab: parsed.currentTab || "home",
        viewMode: (parsed.viewMode || "dashboard") as ViewMode,
        selectedReportId:
          parsed.selectedReportId === undefined || parsed.selectedReportId === null
            ? null
            : String(parsed.selectedReportId),
        showLandingPage: Boolean(parsed.showLandingPage),
      };
    }
  } catch (error) {
    console.error("Error loading navigation state:", error);
  }
  return {
    currentTab: "home",
    viewMode: "dashboard" as ViewMode,
    selectedReportId: null,
    showLandingPage: false,
  };
};

export function useNavigation() {
  // Use lazy initialization to only load once on mount
  const [currentTab, setCurrentTab] = useState(() => loadSavedState().currentTab);
  const [viewMode, setViewMode] = useState<ViewMode>(() => loadSavedState().viewMode);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    () => loadSavedState().selectedReportId
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(() => loadSavedState().showLandingPage);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Demo mode state - MUST be at the end to preserve hook order
  const [demoMode, setDemoMode] = useState(false);
  const [demoAccountType, setDemoAccountType] = useState<"customer" | "shop" | "insurer" | null>(
    null
  );

  // Refs for scrolling
  const whoWeServeRef = useRef<HTMLElement>(null);
  const howItWorksRef = useRef<HTMLElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Save navigation state to localStorage whenever it changes
  useEffect(() => {
    const navigationState = {
      currentTab,
      viewMode,
      selectedReportId,
      showLandingPage,
    };

    try {
      localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(navigationState));
    } catch (error) {
      console.error("Error saving navigation state:", error);
    }
  }, [currentTab, viewMode, selectedReportId, showLandingPage]);

  // Navigate to a specific tab
  const navigateToTab = (tabId: string) => {
    setCurrentTab(tabId);
    setViewMode("dashboard");
  };

  // Navigate to a specific view mode
  const navigateToView = (mode: ViewMode, reportId?: string) => {
    setViewMode(mode);
    if (reportId !== undefined) {
      setSelectedReportId(reportId);
    }
  };

  // Return to dashboard
  const returnToDashboard = () => {
    setViewMode("dashboard");
    setSelectedReportId(null);
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
  };

  // Enable demo mode with a specific account type
  const enableDemoMode = (accountType: "customer" | "shop" | "insurer") => {
    setDemoMode(true);
    setDemoAccountType(accountType);
    setCurrentTab("home");
    setViewMode("dashboard");
    console.log(`🎭 Demo mode enabled: Viewing as ${accountType}`);
  };

  // Exit demo mode and return to original account
  const exitDemoMode = () => {
    setDemoMode(false);
    setDemoAccountType(null);
    setCurrentTab("home");
    setViewMode("dashboard");
    console.log("✅ Demo mode exited: Returned to original account");
  };

  return {
    // State
    currentTab,
    viewMode,
    selectedReportId,
    showOnboarding,
    onboardingComplete,
    showProfileDropdown,
    showLandingPage,
    isUploadingImage,
    demoMode,
    demoAccountType,
    whoWeServeRef,
    howItWorksRef,
    profileDropdownRef,

    // Setters
    setCurrentTab,
    setViewMode,
    setSelectedReportId,
    setShowOnboarding,
    setOnboardingComplete,
    setShowProfileDropdown,
    setShowLandingPage,
    setIsUploadingImage,

    // Actions
    navigateToTab,
    navigateToView,
    returnToDashboard,
    toggleProfileDropdown,
    enableDemoMode,
    exitDemoMode,
  };
}
