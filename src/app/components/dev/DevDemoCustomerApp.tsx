/**
 * Self-contained customer dashboard mounted when `?demo=customer` is set on a
 * dev build. Synthesizes user profile, vehicles, reports, and bids from seed
 * fixtures so a browser-automation agent can audit visual surfaces without
 * touching Clerk or Supabase.
 *
 * NOT shipped to production — gated by App.tsx via `import.meta.env.DEV`.
 */
import { useEffect, useMemo, useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigation } from "../../hooks/useNavigation";
import {
  AppearanceModeProvider,
  useAppearanceModeCtx,
} from "../../hooks/AppearanceModeContext";
import {
  NotificationProvider,
  useNotificationEvents,
} from "../../features/notifications";
import {
  DEMO_BIDS,
  DEMO_NOTIFICATIONS,
  DEMO_REPORTS,
  DEMO_USER_INFO,
  DEMO_USER_PROFILE,
  DEMO_VEHICLES,
  DEMO_WEBSITE_IDENTITY,
  exitDevDemoMode,
  readDevDemoAppearanceOverride,
} from "../../utils/devDemoMode";
import { CUSTOMER_NAV_TABS, PRIMARY_COLOR, SECONDARY_COLOR } from "../../constants";
import DashboardLayout from "../app/DashboardLayout";
import NotificationToast from "../ui/NotificationToast";
import AppearanceToggle from "./AppearanceToggle";
import type {
  Bid,
  DamageReport,
  Notification,
  UserInfo,
  Vehicle,
  ViewMode,
} from "../../types";
import type {
  DashboardAppearanceMode,
  DashboardRouterProps,
} from "../../routers/dashboard-router-types";

const noop = () => {};
const noopAsync = async () => {};

function DevDemoCustomerInner() {
  const [appearanceMode, setAppearanceMode] = useAppearanceModeCtx();
  const navigation = useNavigation();
  const notificationActions = useNotificationEvents();

  const [userInfo, setUserInfo] = useState<UserInfo>(DEMO_USER_INFO);
  const [userPhone, setUserPhone] = useState(DEMO_USER_PROFILE.phone);
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEMO_VEHICLES);
  const [reports, setReports] = useState<DamageReport[]>(DEMO_REPORTS);
  const [bids, setBids] = useState<Bid[]>(DEMO_BIDS);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [hasSeenPhotoGuide, setHasSeenPhotoGuide] = useState(true);

  // Apply optional `?mode=light|dark` URL override on mount only.
  useEffect(() => {
    const override = readDevDemoAppearanceOverride();
    if (override && override !== appearanceMode) {
      setAppearanceMode(override);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const photoStorage = useMemo<Record<string, string[]>>(() => {
    const store: Record<string, string[]> = {};
    for (const report of reports) {
      if (report.photos && report.photos.length > 0) {
        store[report.id] = report.photos;
      }
    }
    return store;
  }, [reports]);

  const handleTabClick = (tabId: string) => {
    navigation.setCurrentTab(tabId);
    navigation.setViewMode("dashboard");
  };

  const dashboardRouterProps: DashboardRouterProps = {
    viewMode: navigation.viewMode,
    currentTab: navigation.currentTab,
    userType: "customer",
    userInfo,
    userPhone,
    reports,
    reportsLoading: false,
    reportsError: null,
    vehicles,
    bids,
    photoStorage,
    selectedReportId: navigation.selectedReportId,
    websiteIdentity: DEMO_WEBSITE_IDENTITY,
    demoMode: true,
    originalAccountType: "customer",
    appearanceMode,
    primaryColor: PRIMARY_COLOR,
    secondaryColor: SECONDARY_COLOR,
    onStartReport: () => {
      navigation.setCurrentTab("report");
      navigation.setViewMode("dashboard");
    },
    onSubmitBid: noop,
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
    onViewRequests: noop,
    onViewJobs: noop,
    onViewClaims: noop,
    onViewShops: () => {
      navigation.setViewMode("shop-directory");
    },
    onViewCoverage: () => {
      navigation.setViewMode("shop-directory");
    },
    onCreateNewClaim: noop,
    onSelectReport: (reportId: string) => {
      navigation.setSelectedReportId(reportId);
    },
    onViewModeChange: (mode: string) => {
      navigation.setViewMode(mode as ViewMode);
    },
    onTabChange: (tab: string) => {
      navigation.setCurrentTab(tab);
    },
    onLogout: () => {
      exitDevDemoMode();
    },
    onAcceptBid: noop,
    onRejectBid: noop,
    onUpdateJobStatus: noop,
    onDeleteReport: async (reportId: string) => {
      setReports((prev) => prev.filter((r) => String(r.id) !== reportId));
      return true;
    },
    onConfirmCompletion: noop,
    onAppearanceModeChange: (mode: DashboardAppearanceMode) => {
      setAppearanceMode(mode);
    },
    onProfileUpdate: (info) => {
      setUserInfo({
        name: info.name,
        email: info.email,
        profileImage: info.profileImage || userInfo.profileImage,
      });
      if (info.phone) setUserPhone(info.phone);
    },
    onDeleteAccount: noop,
    onSaveVehicles: (next) => {
      setVehicles(next);
    },
    onSaveVehicle: (vehicle) => {
      setVehicles((prev) => {
        const existingIndex = prev.findIndex((entry) => entry.id === vehicle.id);
        if (existingIndex >= 0) {
          return prev.map((entry) => (entry.id === vehicle.id ? vehicle : entry));
        }
        return [...prev, vehicle];
      });
    },
    hasSeenPhotoGuide,
    onPhotoGuideComplete: () => {
      setHasSeenPhotoGuide(true);
    },
    onReportSubmit: noopAsync,
  };

  const profileDropdownData = {
    userType: "customer" as const,
    reports,
    vehicles,
    bids,
    onNavigate: (destination: string, tab?: string) => {
      if (tab) navigation.setCurrentTab(tab);
      navigation.setViewMode(destination as ViewMode);
      navigation.setShowProfileDropdown(false);
    },
    onLogout: exitDevDemoMode,
    forwardedRef: navigation.profileDropdownRef,
  };

  return (
    <NotificationProvider value={notificationActions}>
      <DashboardLayout
        primaryColor={PRIMARY_COLOR}
        secondaryColor={SECONDARY_COLOR}
        currentNavTabs={CUSTOMER_NAV_TABS}
        currentTab={navigation.currentTab}
        viewMode={navigation.viewMode}
        showProfileDropdown={navigation.showProfileDropdown}
        userProfile={DEMO_USER_PROFILE}
        userImageUrl={userInfo.profileImage}
        notifications={notifications}
        notificationSyncActive={false}
        onMarkNotificationRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }}
        onMarkAllNotificationsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        reports={reports}
        vehicles={vehicles}
        bids={bids}
        onLogoClick={exitDevDemoMode}
        onTabClick={handleTabClick}
        onMobileMenuTabClick={handleTabClick}
        onProfileToggle={() =>
          navigation.setShowProfileDropdown((current) => !current)
        }
        demoMode
        demoAccountType="customer"
        profileDropdownData={profileDropdownData}
        dashboardRouterProps={dashboardRouterProps}
        onNavigateToReport={(reportId) => {
          navigation.setSelectedReportId(reportId);
          navigation.setViewMode("report-detail");
        }}
      />
      <AppearanceToggle />
      <DemoExitPill />
      <NotificationToast
        toast={notificationActions.activeToast}
        onDismiss={notificationActions.dismissToast}
        onDeepLinkClick={notificationActions.navigateDeepLink}
      />
    </NotificationProvider>
  );
}

function DemoExitPill() {
  return (
    <button
      onClick={exitDevDemoMode}
      className="fixed bottom-4 right-4 z-[99999] inline-flex items-center gap-1.5 rounded-full bg-amber-500/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-lg transition-colors hover:bg-amber-400"
      title="Exit demo mode"
    >
      <LogOut className="h-3.5 w-3.5" />
      Exit Demo
    </button>
  );
}

export default function DevDemoCustomerApp() {
  return (
    <AppearanceModeProvider>
      <DevDemoCustomerInner />
    </AppearanceModeProvider>
  );
}
