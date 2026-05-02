import { lazy, Suspense, useMemo, useState, type RefObject } from "react";
import DashboardRouter from "../../routers/DashboardRouter";
import type { Bid, NavTab, Notification, Report, Vehicle, ViewMode } from "../../types";
import { getGlobalSurfaceTheme } from "../../theme/globalSurfaceTheme";
import type { ProfileDropdownData, UserProfile } from "../../types/dashboardShell";
import { useNotifications } from "../../features/notifications/NotificationContext";
import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";
import MobileBottomNav from "../dashboard/MobileBottomNav";
const SettingsModal = lazy(() => import("../codelayer/account/SettingsModal"));
import DashboardAtmosphere from "./DashboardAtmosphere";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import DemoModeBanner from "../demo/DemoModeBanner";

type DashboardLayoutProps = {
  primaryColor: string;
  secondaryColor: string;
  currentNavTabs: NavTab[];
  currentTab: string;
  viewMode: ViewMode;
  showProfileDropdown: boolean;
  userProfile: UserProfile;
  userImageUrl: string;
  notifications: Notification[];
  notificationSyncActive: boolean;
  reports: Report[];
  vehicles: Vehicle[];
  bids: Bid[];
  onLogoClick: () => void;
  onTabClick: (tabId: string) => void;
  onMobileMenuTabClick: (tabId: string) => void;
  onProfileToggle: () => void;
  onOpenDemoMode?: () => void;
  demoMode?: boolean;
  demoAccountType?: "customer" | "shop" | "insurer" | null;
  onMarkNotificationRead: (notificationId: string | number) => void;
  onMarkAllNotificationsRead: () => void;
  profileDropdownData?: ProfileDropdownData;
  dashboardRouterProps: React.ComponentProps<typeof DashboardRouter>;
  onNavigateToReport?: (reportId: string) => void;
};

export default function DashboardLayout({
  primaryColor,
  secondaryColor,
  currentNavTabs,
  currentTab,
  viewMode,
  showProfileDropdown,
  userProfile,
  userImageUrl,
  notifications,
  notificationSyncActive,
  reports,
  vehicles,
  bids,
  onLogoClick,
  onTabClick,
  onMobileMenuTabClick,
  onProfileToggle,
  onOpenDemoMode,
  demoMode,
  demoAccountType,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  profileDropdownData,
  dashboardRouterProps,
  onNavigateToReport,
}: DashboardLayoutProps) {
  const [appearanceMode, setAppearanceMode] = useAppearanceModeCtx();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const isLightAppearance = appearanceMode === "light";
  const surfaceTheme = getGlobalSurfaceTheme(isLightAppearance ? "light" : "map-dark");
  const activeTabLabel = currentNavTabs.find((tab) => tab.id === currentTab)?.label ?? "Dashboard";

  // Bridge event-stream notifications into the legacy Notification[] feed
  const eventStream = useNotifications();
  const categoryToType: Record<string, Notification["type"]> = {
    bid: "bid",
    shop: "repair_request",
    report: "update",
    system: "message",
    navigation: "update",
    reroute: "update",
    insurer: "claim",
  };
  const mergedNotifications = useMemo<Notification[]>(() => {
    const bridged: Notification[] = eventStream.events.map((e) => ({
      id: e.id,
      type: categoryToType[e.category] || "update",
      message: `${e.title} \u2014 ${e.body}`,
      time: "Just now",
      read: e.read,
      createdAt: e.createdAt,
    }));
    return [...bridged, ...notifications];
  }, [eventStream.events, notifications]);

  const unreadCount = mergedNotifications.filter((n) => !n.read).length;

  const handleMarkRead = (id: string | number) => {
    if (typeof id === "string" && id.startsWith("notify-")) {
      eventStream.markRead(id);
    } else {
      onMarkNotificationRead(id);
    }
  };

  const handleMarkAllRead = () => {
    eventStream.markAllRead();
    onMarkAllNotificationsRead();
  };

  // Compute badge counts for mobile bottom nav
  const tabBadgeCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    const role = userProfile.user_type;
    if (role === "customer") {
      const pendingBids = bids.filter((b) => b.status === "pending").length;
      if (pendingBids > 0) counts["bids"] = pendingBids;
    }
    if (unreadCount > 0) counts["notifications"] = unreadCount;
    return counts;
  }, [bids, userProfile.user_type, unreadCount]);

  return (
    <div
      className={`flex flex-col h-[100dvh] relative ${isLightAppearance ? "" : "dark"}`}
      data-theme={isLightAppearance ? "light" : "dark"}
      style={{ background: surfaceTheme.background }}
    >
      <DashboardAtmosphere isLightAppearance={isLightAppearance} />
      <div aria-hidden className="bd-dashboard-atmosphere" />

      {demoMode && <DemoModeBanner demoAccountType={demoAccountType} />}

      <div
        className="relative z-10 flex flex-col md:flex-row flex-1 overflow-x-hidden"
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        <DashboardSidebar
          isLightAppearance={isLightAppearance}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          currentNavTabs={currentNavTabs}
          currentTab={currentTab}
          viewMode={viewMode}
          onLogoClick={onLogoClick}
          onTabClick={onTabClick}
          onOpenDemoMode={onOpenDemoMode}
          profileDropdownData={profileDropdownData}
          userProfile={userProfile}
          userImageUrl={userImageUrl}
          notifications={mergedNotifications}
          notificationSyncActive={notificationSyncActive}
          reports={reports}
          vehicles={vehicles}
          bids={bids}
          onDismissTopProfile={() => {}}
        />

        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <DashboardHeader
            isLightAppearance={isLightAppearance}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            activeTabLabel={activeTabLabel}
            onLogoClick={onLogoClick}
            onOpenDemoMode={onOpenDemoMode}
            userProfile={userProfile}
            userImageUrl={userImageUrl}
            notifications={mergedNotifications}
            notificationSyncActive={notificationSyncActive}
            reports={reports}
            profileDropdownData={profileDropdownData}
            unreadCount={unreadCount}
            onMarkNotificationRead={handleMarkRead}
            onMarkAllNotificationsRead={handleMarkAllRead}
            onOpenSettings={() => setShowSettingsModal(true)}
            onNavigateToReport={onNavigateToReport}
          />

          <main
            className="px-3 md:px-8 py-4 md:py-6 pb-24 md:pb-8 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
            style={{
              background: isLightAppearance
                ? "linear-gradient(180deg, rgba(255, 253, 248, 0.04) 0%, transparent 100%)"
                : "linear-gradient(180deg, rgba(2, 6, 23, 0.20) 0%, rgba(2, 6, 23, 0.08) 100%)",
            }}
          >
            <div className="max-w-[1400px]">
              <DashboardRouter {...dashboardRouterProps} />
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav
        tabs={currentNavTabs}
        currentTab={currentTab}
        viewMode={viewMode}
        badgeCounts={tabBadgeCounts}
        onTabClick={(tabId) => onMobileMenuTabClick(tabId)}
      />

      {showSettingsModal && (
        <Suspense fallback={null}>
          <SettingsModal
            isOpen={showSettingsModal}
            primaryColor={primaryColor}
            onClose={() => setShowSettingsModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
