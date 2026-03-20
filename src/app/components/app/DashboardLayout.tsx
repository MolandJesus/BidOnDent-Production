import { Bell, Car, Search, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import DashboardRouter from "../../routers/DashboardRouter";
import type { Bid, NavTab, Notification, Vehicle } from "../../types";
import NotificationCenter from "../dashboard/NotificationCenter";
import ProfileDropdown from "../dashboard/ProfileDropdown";
import MobileBottomNav from "../dashboard/MobileBottomNav";

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
  primaryColor: string;
  secondaryColor: string;
  currentNavTabs: NavTab[];
  currentTab: string;
  viewMode: string;
  showProfileDropdown: boolean;
  userProfile: UserProfile;
  userImageUrl: string;
  notifications: Notification[];
  reports: any[];
  vehicles: Vehicle[];
  bids: Bid[];
  onLogoClick: () => void;
  onTabClick: (tabId: string) => void;
  onMobileMenuTabClick: (tabId: string) => void;
  onProfileToggle: () => void;
  onOpenDemoMode?: () => void;
  onNewNotification: (notification: Notification) => void;
  onMarkNotificationRead: (notificationId: string | number) => void;
  onMarkAllNotificationsRead: () => void;
  profileDropdownData?: ProfileDropdownData;
  dashboardRouterProps: React.ComponentProps<typeof DashboardRouter>;
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
  reports,
  vehicles,
  bids,
  onLogoClick,
  onTabClick,
  onMobileMenuTabClick,
  onProfileToggle,
  onOpenDemoMode,
  onNewNotification,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  profileDropdownData,
  dashboardRouterProps,
}: DashboardLayoutProps) {
  const [showTopProfileMenu, setShowTopProfileMenu] = useState(false);
  const [showSidebarProfilePanel, setShowSidebarProfilePanel] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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

  return (
    <div className="min-h-screen bg-[#f3f5f9]">
      <div className="md:flex md:min-h-screen">
        <aside className="hidden md:flex md:w-72 md:flex-col md:bg-white md:border-r md:border-slate-200 md:sticky md:top-0 md:h-screen">
          <div className="px-6 py-6 border-b border-slate-200">
            <button
              onClick={onLogoClick}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                <Car className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">
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
                <span style={{ color: "#70c0ee" }}>On</span>
                <span className="text-slate-800">Dent</span>
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
                      ? "text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  style={
                    isActive
                      ? {
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
              >
                <Sparkles className="w-5 h-5 text-blue-600" />
                <span className="text-base font-medium">Demo Mode</span>
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

          <div className="p-3 border-t border-slate-200">
            <button
              onClick={() => {
                setShowTopProfileMenu(false);
                setShowSidebarProfilePanel((current) => !current);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 transition-colors"
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
                <p className="text-base font-semibold text-slate-900 truncate">
                  {userProfile.name}
                </p>
                <p className="text-sm text-slate-500 truncate">{userProfile.email}</p>
              </div>
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
            <div className="px-4 md:px-8 py-3.5 flex items-center justify-between gap-3">
              <button
                onClick={onLogoClick}
                className="md:hidden flex items-center gap-2 cursor-pointer"
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  <Car className="w-4 h-4" />
                </span>
                <span className="text-lg font-semibold text-slate-900">BidOnDent</span>
              </button>

              <div className="hidden md:block">
                <p className="text-sm text-slate-500">Dashboard</p>
                <h2 className="text-xl font-semibold text-slate-900">{activeTabLabel}</h2>
              </div>

              <div className="flex items-center gap-2.5 ml-auto">
                {onOpenDemoMode && (
                  <button
                    onClick={onOpenDemoMode}
                    className="md:hidden w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors"
                    aria-label="Open demo mode"
                  >
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </button>
                )}
                <div className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 min-w-[260px]">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    className="bg-transparent text-sm w-full outline-none placeholder:text-slate-400 text-slate-700"
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
                    className="relative w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors"
                    aria-label="Open notifications"
                    aria-expanded={showNotifications}
                  >
                    <Bell className="w-5 h-5 text-slate-600" />
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
                      activeReportsCount={reports.length}
                      onClose={() => setShowNotifications(false)}
                      onNavigate={(destination, tab) => {
                        profileDropdownData.onNavigate(destination, tab);
                        setShowNotifications(false);
                      }}
                      onNewNotification={onNewNotification}
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
                    className="flex items-center gap-2 px-1.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
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
                      <p className="text-sm font-semibold text-slate-900 leading-none">
                        {userProfile.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 leading-none">
                        {userProfile.email}
                      </p>
                    </div>
                  </button>

                  {showTopProfileMenu && profileDropdownData && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
                      <div className="px-3 py-2.5 border-b border-slate-200">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {userProfile.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{userProfile.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          profileDropdownData.onNavigate("dashboard", "home");
                          setShowTopProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          profileDropdownData.onNavigate("dashboard", "account");
                          setShowTopProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Account Settings
                      </button>
                      <button
                        onClick={() => {
                          profileDropdownData.onLogout();
                          setShowTopProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-200"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 md:px-8 py-5 md:py-6 pb-24 md:pb-8">
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
        primaryColor={primaryColor}
        onTabClick={(tabId) => onMobileMenuTabClick(tabId)}
      />
    </div>
  );
}
