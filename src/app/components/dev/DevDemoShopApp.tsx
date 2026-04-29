/**
 * Self-contained shop dashboard mounted when `?demo=shop` is set on a dev
 * build. Mirrors DevDemoCustomerApp but with shop nav tabs and shop-specific
 * seed fixtures (incoming requests, in-progress jobs, submitted bids).
 *
 * Bypasses Clerk + Supabase entirely — useful for visual + flow audits, but
 * NOT suitable for testing cross-account workflows (bid → customer's bids
 * list, accept → shop's active jobs). For those, real shop login is required.
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
  DEMO_NOTIFICATIONS,
  DEMO_SHOP_BIDS,
  DEMO_SHOP_PROFILE,
  DEMO_SHOP_REPORTS,
  DEMO_SHOP_USER_INFO,
  DEMO_SHOP_WEBSITE_IDENTITY,
  exitDevDemoMode,
  readDevDemoAppearanceOverride,
} from "../../utils/devDemoMode";
import { PRIMARY_COLOR, SECONDARY_COLOR, SHOP_NAV_TABS } from "../../constants";
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

function DevDemoShopInner() {
  const [appearanceMode, setAppearanceMode] = useAppearanceModeCtx();
  const navigation = useNavigation();
  const notificationActions = useNotificationEvents();

  const [userInfo, setUserInfo] = useState<UserInfo>(DEMO_SHOP_USER_INFO);
  const [userPhone, setUserPhone] = useState(DEMO_SHOP_PROFILE.phone);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reports, setReports] = useState<DamageReport[]>(DEMO_SHOP_REPORTS);
  const [bids, setBids] = useState<Bid[]>(DEMO_SHOP_BIDS);
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [hasSeenPhotoGuide, setHasSeenPhotoGuide] = useState(true);

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
    userType: "shop",
    userInfo,
    userPhone,
    reports,
    reportsLoading: false,
    reportsError: null,
    vehicles,
    bids,
    photoStorage,
    selectedReportId: navigation.selectedReportId,
    websiteIdentity: DEMO_SHOP_WEBSITE_IDENTITY,
    demoMode: true,
    originalAccountType: "shop",
    appearanceMode,
    primaryColor: PRIMARY_COLOR,
    secondaryColor: SECONDARY_COLOR,
    onStartReport: noop,
    onSubmitBid: noop,
    onViewAllReports: () => {
      navigation.setCurrentTab("requests");
      navigation.setViewMode("dashboard");
    },
    onConnectInsurance: noop,
    onViewLikedShops: noop,
    onViewBids: noop,
    onViewRequests: () => {
      navigation.setCurrentTab("requests");
      navigation.setViewMode("dashboard");
    },
    onViewJobs: () => {
      navigation.setCurrentTab("jobs");
      navigation.setViewMode("dashboard");
    },
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
    onDeleteReport: async () => true,
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
    userType: "shop" as const,
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
        currentNavTabs={SHOP_NAV_TABS}
        currentTab={navigation.currentTab}
        viewMode={navigation.viewMode}
        showProfileDropdown={navigation.showProfileDropdown}
        userProfile={DEMO_SHOP_PROFILE}
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
        demoAccountType="shop"
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

export default function DevDemoShopApp() {
  return (
    <AppearanceModeProvider>
      <DevDemoShopInner />
    </AppearanceModeProvider>
  );
}
