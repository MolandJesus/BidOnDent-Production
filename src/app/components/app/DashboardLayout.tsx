import { Bell, Car, Search, Settings, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import DashboardRouter from "../../routers/DashboardRouter";
import type { Bid, NavTab, Notification, Vehicle } from "../../types";
import { getGlobalSurfaceTheme } from "../../theme/globalSurfaceTheme";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import NotificationCenter from "../dashboard/NotificationCenter";
import ProfileDropdown from "../dashboard/ProfileDropdown";
import MobileBottomNav from "../dashboard/MobileBottomNav";
import SettingsModal from "../codelayer/account/SettingsModal";

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
  const [showTopProfileMenu, setShowTopProfileMenu] = useState(false);
  const [showSidebarProfilePanel, setShowSidebarProfilePanel] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const topProfileMenuRef = useRef<HTMLDivElement>(null);
  const notificationCenterRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const activeTabLabel = currentNavTabs.find((tab) => tab.id === currentTab)?.label ?? "Dashboard";

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (topProfileMenuRef.current && !topProfileMenuRef.current.contains(event.target as Node)) {
        setShowTopProfileMenu(false);
      }

      if (
        notificationCenterRef.current &&
        !notificationCenterRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, []);

  const isLightAppearance = appearanceMode === "light";
  const surfaceTheme = getGlobalSurfaceTheme(isLightAppearance ? "light" : "map-dark");

  return (
    <div className="min-h-screen relative" style={{ background: surfaceTheme.background }}>
      {/* Map background layer (full-bleed, fixed, z-0) — deep ocean atmosphere */}
      <div
        className="fixed inset-0 z-0"
        id="dashboard-map-bg"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 50% 40% at 75% 85%, rgba(139,92,246,0.04), transparent 55%), radial-gradient(ellipse 130% 95% at 24% 8%, rgba(203, 224, 255, 0.74) 0%, rgba(241, 247, 255, 0.96) 62%, #f3f8ff 100%)"
            : "radial-gradient(ellipse 50% 40% at 70% 20%, rgba(59,130,246,0.05), transparent 50%), radial-gradient(ellipse 120% 80% at 30% 20%, rgba(15, 23, 42, 0.96) 0%, rgba(8, 15, 30, 0.99) 60%, #060d1a 100%)",
        }}
      />
      {/* Floating panel container (z-10) */}
      <div className="relative z-10 md:flex md:min-h-screen">
        <aside
          className="hidden md:flex md:w-72 md:flex-col md:sticky md:top-0 md:h-screen bd-glass-panel md:rounded-none md:border-0 md:border-r md:border-blue-900/40"
          style={{
            background: isLightAppearance
              ? "linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(241, 247, 255, 0.92) 100%)"
              : "linear-gradient(180deg, rgba(7, 16, 34, 0.84) 0%, rgba(6, 13, 28, 0.76) 100%)",
          }}
        >
          <div className="px-6 py-6 border-b border-blue-900/35">
            <button
              onClick={onLogoClick}
              className="bd-glass-control--utility flex items-center gap-2.5 cursor-pointer bg-transparent backdrop-blur-xl shadow-none"
              type="button"
              style={{ boxShadow: "none", background: "transparent" }}
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(14, 165, 233, 0.10) 100%)",
                  border: "1px solid rgba(37, 99, 235, 0.22)",
                  boxShadow:
                    "0 0 12px rgba(59, 130, 246, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                }}
              >
                <Car className="w-5 h-5" style={{ color: "#2563eb" }} />
              </span>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-1">
                <span
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Bid
                </span>
                <span style={{ color: "#2563eb", fontWeight: 700 }}>On</span>
                <span className={isLightAppearance ? "text-slate-900" : "text-slate-100"}>
                  Dent
                </span>
              </h1>
            </button>
          </div>

          <nav className="px-3 py-4 space-y-1.5 flex-1 overflow-y-auto">
            {currentNavTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id && viewMode === "dashboard";

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabClick(tab.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? "bd-glass-control bd-glass-control--primary"
                      : "bd-glass-control--secondary"
                  }`}
                  type="button"
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                          boxShadow:
                            "0 2px 16px rgba(37, 99, 235, 0.28), 0 0 24px rgba(59, 130, 246, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                        }
                      : {}
                  }
                >
                  <span className="inline-flex items-center gap-3 text-base font-medium">
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </span>
                  {isActive && <span className="text-white/90">›</span>}
                </button>
              );
            })}
            {onOpenDemoMode && (
              <button
                onClick={onOpenDemoMode}
                className="bd-glass-control--secondary w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium"
                type="button"
              >
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-base">Demo Mode</span>
              </button>
            )}
            {showSidebarProfilePanel && profileDropdownData && (
              <div className="pt-2">
                <ProfileDropdown
                  userInfo={{
                    name: userProfile.name,
                    email: userProfile.email,
                    profileImage: userImageUrl || "",
                  }}
                  userType={profileDropdownData.userType}
                  notifications={notifications}
                  notificationSyncActive={notificationSyncActive}
                  isOpen={showSidebarProfilePanel}
                  onNavigate={profileDropdownData.onNavigate}
                  onLogout={profileDropdownData.onLogout}
                  forwardedRef={profileDropdownData.forwardedRef}
                  reports={reports}
                  vehicles={vehicles}
                  bids={bids}
                  variant="embedded"
                />
              </div>
            )}
          </nav>

          <div className="p-3 border-t border-blue-900/35">
            <button
              onClick={() => {
                setShowTopProfileMenu(false);
                setShowSidebarProfilePanel((current) => !current);
              }}
              className="bd-glass-control--utility w-full flex items-center gap-3 p-3 rounded-xl"
              type="button"
            >
              {userImageUrl ? (
                <img
                  src={userImageUrl}
                  alt="Profile"
                  className="w-11 h-11 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left min-w-0">
                <p
                  className={`text-base font-semibold truncate ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
                >
                  {userProfile.name}
                </p>
                <p
                  className={`text-sm truncate ${isLightAppearance ? "text-slate-600" : "text-slate-300"}`}
                >
                  {userProfile.email}
                </p>
              </div>
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header
            className="sticky top-0 z-40 bd-glass-panel rounded-none border-0 border-b border-blue-900/40"
            style={{
              background: isLightAppearance
                ? "linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(240, 247, 255, 0.92) 100%)"
                : "linear-gradient(180deg, rgba(7, 16, 34, 0.86) 0%, rgba(8, 18, 38, 0.78) 100%)",
              boxShadow: isLightAppearance
                ? "0 8px 24px rgba(37, 99, 235, 0.09), inset 0 -1px 0 rgba(37, 99, 235, 0.18)"
                : "0 8px 28px rgba(3, 10, 24, 0.45), inset 0 -1px 0 rgba(59, 130, 246, 0.20)",
            }}
          >
            <div className="px-4 md:px-8 py-3.5 flex items-center justify-between gap-3">
              <button
                onClick={onLogoClick}
                className="bd-glass-control--utility md:hidden flex items-center gap-2 cursor-pointer"
                type="button"
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  <Car className="w-4 h-4" />
                </span>
                <span
                  className={`text-lg font-semibold ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
                >
                  BidOnDent
                </span>
              </button>

              <div className="hidden md:block">
                <p
                  className={`text-xs font-medium uppercase tracking-wide ${isLightAppearance ? "text-blue-700/80" : "text-blue-200/80"}`}
                >
                  BidOnDent
                </p>
                <h2
                  className={`text-xl font-semibold leading-tight ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
                >
                  {activeTabLabel}
                </h2>
              </div>

              <div className="flex items-center gap-2.5 ml-auto">
                {onOpenDemoMode && (
                  <button
                    onClick={onOpenDemoMode}
                    className="md:hidden w-10 h-10 rounded-xl bd-glass-control--secondary flex items-center justify-center"
                    aria-label="Open demo mode"
                  >
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </button>
                )}
                <div className="hidden lg:flex items-center gap-2 bd-glass-control--utility px-3 py-2 min-w-[260px]">
                  <Search
                    className={`w-4 h-4 ${isLightAppearance ? "text-blue-700/65" : "text-blue-200/70"}`}
                  />
                  <input
                    className={`bg-transparent text-sm w-full outline-none ${isLightAppearance ? "placeholder:text-blue-700/50 text-slate-900" : "placeholder:text-blue-200/60 text-slate-100"}`}
                    placeholder="Search..."
                    aria-label="Search"
                  />
                </div>

                <div className="relative" ref={notificationCenterRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNotifications((current) => !current);
                      setShowTopProfileMenu(false);
                    }}
                    className="relative w-10 h-10 rounded-xl bd-glass-control--utility flex items-center justify-center"
                    aria-label="Open notifications"
                    aria-expanded={showNotifications}
                  >
                    <Bell
                      className={`w-5 h-5 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
                    />
                    {unreadCount > 0 && (
                      <>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                        <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-slate-950 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      </>
                    )}
                  </button>

                  {profileDropdownData ? (
                    <NotificationCenter
                      isOpen={showNotifications}
                      userType={profileDropdownData.userType}
                      notifications={notifications}
                      notificationSyncActive={notificationSyncActive}
                      activeReportsCount={reports.length}
                      onClose={() => setShowNotifications(false)}
                      onNavigate={(destination, tab) => {
                        profileDropdownData.onNavigate(destination, tab);
                        setShowNotifications(false);
                      }}
                      onMarkNotificationRead={onMarkNotificationRead}
                      onMarkAllRead={onMarkAllNotificationsRead}
                    />
                  ) : null}
                </div>

                <div className="relative" ref={topProfileMenuRef}>
                  <button
                    onClick={() => {
                      setShowTopProfileMenu((current) => !current);
                      setShowNotifications(false);
                    }}
                    aria-expanded={showTopProfileMenu}
                    aria-haspopup="menu"
                    aria-label="User profile menu"
                    className="flex items-center gap-2 px-1.5 py-1.5 rounded-xl bd-glass-control--utility hover:bg-white/40 transition-colors"
                  >
                    {userImageUrl ? (
                      <img
                        src={userImageUrl}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        }}
                      >
                        {userProfile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden md:block text-left pr-1">
                      <p
                        className={`text-sm font-semibold leading-none ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
                      >
                        {userProfile.name}
                      </p>
                      <p
                        className={`text-xs mt-1 leading-none ${isLightAppearance ? "text-slate-600" : "text-slate-300"}`}
                      >
                        {userProfile.email}
                      </p>
                    </div>
                  </button>

                  {showTopProfileMenu && profileDropdownData && (
                    <div
                      role="menu"
                      aria-label="User profile menu"
                      className="absolute right-0 mt-2 w-56 bd-glass-floating z-50 overflow-hidden"
                    >
                      <div className="px-3 py-2.5 border-b border-slate-200/40">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {userProfile.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
                      </div>
                      <button
                        role="menuitem"
                        onClick={() => {
                          profileDropdownData.onNavigate("dashboard", "home");
                          setShowTopProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-white/40 transition-colors flex items-center gap-2.5"
                      >
                        Dashboard
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => {
                          setShowTopProfileMenu(false);
                          setShowSettingsModal(true);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-white/40 transition-colors flex items-center gap-2.5"
                      >
                        <Settings className="w-4 h-4 opacity-60" />
                        Site Settings
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => {
                          profileDropdownData.onNavigate("dashboard", "account");
                          setShowTopProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-white/40 transition-colors flex items-center gap-2.5"
                      >
                        Account Settings
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => {
                          profileDropdownData.onLogout();
                          setShowTopProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50/60 transition-colors border-t border-slate-200/40"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main
            className="px-3 md:px-8 py-4 md:py-6 pb-24 md:pb-8"
            style={{
              background: isLightAppearance
                ? "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)"
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
        primaryColor={primaryColor}
        onTabClick={(tabId) => onMobileMenuTabClick(tabId)}
      />

      {/* Site Settings Modal */}
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
