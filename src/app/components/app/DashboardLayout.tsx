import { useState, type RefObject } from "react";
import DashboardRouter from "../../routers/DashboardRouter";
import type { Bid, NavTab, Notification, Vehicle } from "../../types";
import { getGlobalSurfaceTheme } from "../../theme/globalSurfaceTheme";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import MobileBottomNav from "../dashboard/MobileBottomNav";
import SettingsModal from "../codelayer/account/SettingsModal";
import DashboardAtmosphere from "./DashboardAtmosphere";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

type UserProfile = {
  name: string;
  email: string;
  user_type: string;
  phone?: string;
};

type ProfileDropdownData = {
  userType: "customer" | "shop" | "insurer";
  reports: any[];
  vehicles: Vehicle[];
  bids: Bid[];
  onNavigate: (destination: string, tab?: string) => void;
  onLogout: () => void;
  forwardedRef: RefObject<HTMLDivElement | null>;
};

type DashboardLayoutProps = {
  appearanceMode: DashboardAppearanceMode;
  onAppearanceModeChange?: (mode: DashboardAppearanceMode) => void;
  primaryColor: string;
  secondaryColor: string;
  currentNavTabs: NavTab[];
  currentTab: string;
  viewMode: string;
  showProfileDropdown: boolean;
  userProfile: UserProfile;
  userImageUrl: string;
  notifications: Notification[];
  notificationSyncActive: boolean;
  reports: any[];
  vehicles: Vehicle[];
  bids: Bid[];
  onLogoClick: () => void;
  onTabClick: (tabId: string) => void;
  onMobileMenuTabClick: (tabId: string) => void;
  onProfileToggle: () => void;
  onOpenDemoMode?: () => void;
  onMarkNotificationRead: (notificationId: string | number) => void;
  onMarkAllNotificationsRead: () => void;
  profileDropdownData?: ProfileDropdownData;
  dashboardRouterProps: React.ComponentProps<typeof DashboardRouter>;
};

export default function DashboardLayout({
  appearanceMode,
  onAppearanceModeChange,
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
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  profileDropdownData,
  dashboardRouterProps,
}: DashboardLayoutProps) {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const isLightAppearance = appearanceMode === "light";
  const surfaceTheme = getGlobalSurfaceTheme(isLightAppearance ? "light" : "map-dark");
  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeTabLabel = currentNavTabs.find((tab) => tab.id === currentTab)?.label ?? "Dashboard";

  return (
    <div
      className={`min-h-screen relative ${isLightAppearance ? "" : "dark"}`}
      data-theme={isLightAppearance ? "light" : "dark"}
      style={{ background: surfaceTheme.background }}
    >
      <DashboardAtmosphere isLightAppearance={isLightAppearance} />

      <div
        className="relative z-10 flex flex-col md:flex-row h-[100dvh] overflow-hidden"
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
          notifications={notifications}
          notificationSyncActive={notificationSyncActive}
          reports={reports}
          vehicles={vehicles}
          bids={bids}
          onDismissTopProfile={() => {}}
        />

        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <DashboardHeader
            isLightAppearance={isLightAppearance}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            activeTabLabel={activeTabLabel}
            onLogoClick={onLogoClick}
            onOpenDemoMode={onOpenDemoMode}
            userProfile={userProfile}
            userImageUrl={userImageUrl}
            notifications={notifications}
            notificationSyncActive={notificationSyncActive}
            reports={reports}
            profileDropdownData={profileDropdownData}
            unreadCount={unreadCount}
            onMarkNotificationRead={onMarkNotificationRead}
            onMarkAllNotificationsRead={onMarkAllNotificationsRead}
            onOpenSettings={() => setShowSettingsModal(true)}
          />

          <main
            className="px-3 md:px-8 py-4 md:py-6 pb-24 md:pb-8 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
            style={{
              background: isLightAppearance
                ? "linear-gradient(180deg, rgba(219, 234, 254, 0.08) 0%, transparent 100%)"
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
        appearanceMode={appearanceMode}
        tabs={currentNavTabs}
        currentTab={currentTab}
        viewMode={viewMode}
        onTabClick={(tabId) => onMobileMenuTabClick(tabId)}
      />

      {onAppearanceModeChange && (
        <SettingsModal
          isOpen={showSettingsModal}
          primaryColor={primaryColor}
          appearanceMode={appearanceMode}
          onAppearanceModeChange={onAppearanceModeChange}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
