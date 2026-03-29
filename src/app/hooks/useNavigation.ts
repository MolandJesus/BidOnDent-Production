// Custom hook for managing UI navigation and view state
import { useState, useRef, useEffect } from "react";
import type { ViewMode } from "../types";

const NAVIGATION_STORAGE_KEY = "bidondent_navigation_state";
const FALLBACK_NAVIGATION_STATE = {
  currentTab: "home",
  viewMode: "dashboard" as ViewMode,
  selectedReportId: null as string | null,
};

const VALID_VIEW_MODES = new Set<string>([
  "dashboard",
  "reports-list",
  "report-detail",
  "insurer-connect",
  "liked-shops",
  "shop-directory",
  "insurance-companies",
  "competitor-analysis",
  "vehicles",
  "new-claim",
  "smoke-test",
  "demo-switcher",
]);

function persistSavedState(state: typeof FALLBACK_NAVIGATION_STATE) {
  try {
    localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error saving navigation state:", error);
  }
}

function clearSavedState() {
  try {
    localStorage.removeItem(NAVIGATION_STORAGE_KEY);
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error clearing navigation state:", error);
  }
}

// Load saved navigation state from localStorage with shape validation
const loadSavedState = () => {
  try {
    const saved = localStorage.getItem(NAVIGATION_STORAGE_KEY);
    if (!saved) return FALLBACK_NAVIGATION_STATE;

    const parsed: unknown = JSON.parse(saved);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      clearSavedState();
      return FALLBACK_NAVIGATION_STATE;
    }

    const navigationState = parsed as Record<string, unknown>;
    const currentTab =
      typeof navigationState.currentTab === "string" && navigationState.currentTab.trim().length > 0
        ? navigationState.currentTab
        : FALLBACK_NAVIGATION_STATE.currentTab;
    const viewMode =
      typeof navigationState.viewMode === "string" && VALID_VIEW_MODES.has(navigationState.viewMode)
        ? (navigationState.viewMode as ViewMode)
        : FALLBACK_NAVIGATION_STATE.viewMode;
    const selectedReportId =
      typeof navigationState.selectedReportId === "string" &&
      navigationState.selectedReportId.trim().length > 0
        ? navigationState.selectedReportId
        : null;

    const isValidSavedState =
      typeof navigationState.currentTab === "string" &&
      navigationState.currentTab.trim().length > 0 &&
      typeof navigationState.viewMode === "string" &&
      VALID_VIEW_MODES.has(navigationState.viewMode) &&
      (navigationState.selectedReportId === undefined ||
        navigationState.selectedReportId === null ||
        (typeof navigationState.selectedReportId === "string" &&
          navigationState.selectedReportId.trim().length > 0));

    const sanitizedState = { currentTab, viewMode, selectedReportId };
    if (!isValidSavedState) {
      persistSavedState(sanitizedState);
    }

    return sanitizedState;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error loading navigation state:", error);
    clearSavedState();
    return FALLBACK_NAVIGATION_STATE;
  }
};

export function useNavigation() {
  // Use lazy initialization to only load once on mount
  const [savedNavigationState] = useState(loadSavedState);
  const [currentTab, setCurrentTab] = useState(savedNavigationState.currentTab);
  const [viewMode, setViewMode] = useState<ViewMode>(savedNavigationState.viewMode);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    savedNavigationState.selectedReportId
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
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

  // Track whether a state change originated from the browser popstate event
  // to avoid pushing a duplicate history entry in the effect below.
  const isRestoringFromHistory = useRef(false);

  // Save navigation state to localStorage and push a browser history entry
  // so the hardware/gesture back button works on mobile (Safari included).
  useEffect(() => {
    const navigationState = {
      currentTab,
      viewMode,
      selectedReportId,
    };

    persistSavedState(navigationState);

    // Skip pushing when this update came from popstate (we're going backward)
    if (isRestoringFromHistory.current) {
      isRestoringFromHistory.current = false;
      return;
    }

    // Push a history entry so the browser back button can return to this state
    history.pushState({ currentTab, viewMode, selectedReportId }, "");
  }, [currentTab, viewMode, selectedReportId]);

  // Handle browser back/forward (popstate) — restore app state without pushing
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as {
        currentTab?: string;
        viewMode?: string;
        selectedReportId?: string | null;
      } | null;
      isRestoringFromHistory.current = true;
      if (state?.viewMode && VALID_VIEW_MODES.has(state.viewMode)) {
        setViewMode(state.viewMode as ViewMode);
        setCurrentTab(state.currentTab || "home");
        setSelectedReportId(state.selectedReportId ?? null);
      } else {
        // Bottom of history stack — return to dashboard home
        setViewMode("dashboard");
        setCurrentTab("home");
        setSelectedReportId(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
    if (import.meta.env.DEV) console.log(`Demo mode enabled: Viewing as ${accountType}`);
  };

  // Exit demo mode and return to original account
  const exitDemoMode = () => {
    setDemoMode(false);
    setDemoAccountType(null);
    setCurrentTab("home");
    setViewMode("dashboard");
    if (import.meta.env.DEV) console.log("Demo mode exited: Returned to original account");
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
