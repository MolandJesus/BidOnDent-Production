import { Bell, Car, Home, LogOut, Search, Settings, Sparkles, User } from "lucide-react";
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
    <div
      className={`min-h-screen relative ${isLightAppearance ? "" : "dark"}`}
      data-theme={isLightAppearance ? "light" : "dark"}
      style={{ background: surfaceTheme.background }}
    >
      {/* ── Base layer: royal blue deep ocean atmosphere ── */}
      <div
        className="fixed inset-0 z-0"
        id="dashboard-map-bg"
        style={{
          background: isLightAppearance
            ? "radial-gradient(130% 85% at 28% 8%, rgba(16, 32, 68, 0.99) 0%, rgba(10, 22, 50, 0.99) 55%, #060e22 100%)"
            : "radial-gradient(130% 90% at 28% 8%, rgba(10, 22, 58, 0.99) 0%, rgba(6, 14, 36, 0.99) 58%, #040a18 100%)",
        }}
      />
      {/* ── Atmospheric orb layer 1: primary top-left royal blue bloom ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 55% 45% at 15% 8%, rgba(37, 99, 235, 0.22) 0%, transparent 65%)"
            : "radial-gradient(ellipse 55% 45% at 15% 8%, rgba(37, 99, 235, 0.28) 0%, transparent 65%)",
        }}
      />
      {/* ── Atmospheric orb layer 2: right-side cyan/indigo bloom ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 45% 38% at 88% 18%, rgba(99, 102, 241, 0.16) 0%, transparent 60%)"
            : "radial-gradient(ellipse 45% 38% at 88% 18%, rgba(99, 102, 241, 0.20) 0%, transparent 60%)",
        }}
      />
      {/* ── Atmospheric orb layer 3: bottom-left deep teal glow ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 40% 32% at 8% 82%, rgba(14, 165, 233, 0.12) 0%, transparent 60%)"
            : "radial-gradient(ellipse 40% 32% at 8% 82%, rgba(14, 165, 233, 0.14) 0%, transparent 60%)",
        }}
      />
      {/* ── Atmospheric orb layer 4: center-right subtle violet bloom ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 38% 30% at 82% 72%, rgba(139, 92, 246, 0.08) 0%, transparent 58%)"
            : "radial-gradient(ellipse 38% 30% at 82% 72%, rgba(139, 92, 246, 0.10) 0%, transparent 58%)",
        }}
      />
      {/* ── Atmospheric orb layer 5: mid-screen floating blue halo ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: isLightAppearance
            ? "radial-gradient(ellipse 28% 20% at 52% 42%, rgba(59, 130, 246, 0.08) 0%, transparent 55%)"
            : "radial-gradient(ellipse 28% 20% at 52% 42%, rgba(59, 130, 246, 0.10) 0%, transparent 55%)",
        }}
      />
      {/* ── Fine dot-grid texture for topographic depth ── */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(147, 197, 253, 0.055) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          opacity: isLightAppearance ? 0.7 : 1,
        }}
      />
      {/* Floating panel container (z-10) */}
      <div
        className="relative z-10 md:flex md:min-h-screen h-[100dvh] md:h-auto flex flex-col md:flex-row overflow-hidden md:overflow-visible"
        style={{ touchAction: "pan-y pinch-zoom" }}
      >
        <aside
          className={`hidden md:flex md:w-72 md:flex-col md:sticky md:top-0 md:h-screen bd-glass-panel md:rounded-none md:border-0 md:border-r ${
            isLightAppearance
              ? "bd-light-surface md:border-slate-200/60"
              : "md:border-blue-400/[0.12]"
          }`}
          style={{
            background: isLightAppearance
              ? "linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(240, 247, 255, 0.95) 100%)"
              : "linear-gradient(180deg, rgba(6, 14, 36, 0.72) 0%, rgba(5, 11, 28, 0.65) 100%)",
            backdropFilter: "blur(24px) saturate(1.4)",
            WebkitBackdropFilter: "blur(24px) saturate(1.4)",
            boxShadow: isLightAppearance
              ? "2px 0 24px rgba(15, 23, 42, 0.07)"
              : "2px 0 32px rgba(2, 6, 23, 0.50), inset -1px 0 0 rgba(59, 130, 246, 0.08)",
          }}
        >
          <div
            className={`px-5 py-5 border-b ${isLightAppearance ? "border-slate-200/70" : "border-blue-400/[0.10]"}`}
          >
            <button
              onClick={onLogoClick}
              className="flex items-center gap-2.5 cursor-pointer bg-transparent"
              type="button"
            >
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  boxShadow:
                    "0 4px 14px rgba(37, 99, 235, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                }}
              >
                <Car className="w-5 h-5 text-white" />
              </span>
              <h1 className="text-xl font-bold tracking-tight">
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
                <span className="italic" style={{ color: "#3b82f6" }}>
                  On
                </span>
                <span className={isLightAppearance ? "text-slate-800" : "text-slate-100"}>
                  Dent
                </span>
              </h1>
            </button>
          </div>

          <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
            {currentNavTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id && viewMode === "dashboard";

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabClick(tab.id)}
                  className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 relative ${
                    isActive ? "" : "hover:bg-blue-500/[0.06]"
                  }`}
                  type="button"
                  style={
                    isActive
                      ? {
                          background: isLightAppearance
                            ? "linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)"
                            : "linear-gradient(135deg, rgba(37, 99, 235, 0.18) 0%, rgba(59, 130, 246, 0.10) 100%)",
                          boxShadow: isLightAppearance
                            ? "inset 0 1px 0 rgba(147, 197, 253, 0.10)"
                            : "inset 0 1px 0 rgba(147, 197, 253, 0.08)",
                        }
                      : {}
                  }
                >
                  {/* Active indicator bar */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{
                        background: `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        boxShadow: "0 0 8px rgba(37, 99, 235, 0.35)",
                      }}
                    />
                  )}
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isActive
                        ? ""
                        : isLightAppearance
                          ? "bg-blue-500/[0.06] group-hover:bg-blue-500/[0.12]"
                          : "bg-blue-500/[0.08] group-hover:bg-blue-500/[0.14]"
                    }`}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.30)",
                          }
                        : {}
                    }
                  >
                    <Icon
                      className={`w-[18px] h-[18px] transition-colors duration-200 ${
                        isActive
                          ? "text-white"
                          : isLightAppearance
                            ? "text-blue-600/70 group-hover:text-blue-700"
                            : "text-blue-200/70 group-hover:text-blue-200"
                      }`}
                    />
                  </span>
                  <span
                    className={`text-[0.9rem] font-semibold transition-colors duration-200 ${
                      isActive
                        ? isLightAppearance
                          ? "text-blue-700"
                          : "text-blue-100"
                        : isLightAppearance
                          ? "text-slate-600 group-hover:text-slate-800"
                          : "text-slate-300 group-hover:text-slate-100"
                    }`}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="ml-auto text-xs font-medium text-blue-300/50">›</span>
                  )}
                </button>
              );
            })}
            {onOpenDemoMode && (
              <div
                className={`pt-2 mt-1 border-t ${isLightAppearance ? "border-slate-200/60" : "border-blue-400/[0.08]"}`}
              >
                <button
                  onClick={onOpenDemoMode}
                  className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 hover:bg-blue-500/[0.06]`}
                  type="button"
                >
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 bg-purple-500/[0.10] group-hover:bg-purple-500/[0.18]">
                    <Sparkles
                      className={`w-[18px] h-[18px] transition-colors ${isLightAppearance ? "text-purple-500" : "text-purple-300/80"}`}
                    />
                  </span>
                  <span
                    className={`text-[0.9rem] font-semibold transition-colors duration-200 ${isLightAppearance ? "text-slate-600 group-hover:text-slate-800" : "text-slate-300 group-hover:text-slate-100"}`}
                  >
                    Demo Mode
                  </span>
                </button>
              </div>
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
                  isLightAppearance={isLightAppearance}
                />
              </div>
            )}
          </nav>

          <div
            className={`p-3 border-t ${isLightAppearance ? "border-slate-200/70" : "border-blue-400/[0.10]"}`}
          >
            <button
              onClick={() => {
                setShowTopProfileMenu(false);
                setShowSidebarProfilePanel((current) => !current);
              }}
              className="group w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 hover:bg-blue-500/[0.06]"
              type="button"
            >
              {userImageUrl ? (
                <img
                  src={userImageUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left min-w-0 flex-1">
                <p
                  className={`text-sm font-semibold truncate ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
                >
                  {userProfile.name}
                </p>
                <p
                  className={`text-xs truncate ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
                >
                  {userProfile.email}
                </p>
              </div>
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <header
            className={`sticky top-0 z-40 rounded-none border-0 border-b ${
              isLightAppearance ? "border-slate-200/60" : "border-blue-400/[0.12]"
            }`}
            style={{
              background: isLightAppearance
                ? "linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(246, 251, 255, 0.96) 100%)"
                : "linear-gradient(180deg, rgba(6, 14, 36, 0.78) 0%, rgba(5, 12, 30, 0.70) 100%)",
              backdropFilter: "blur(24px) saturate(1.4)",
              WebkitBackdropFilter: "blur(24px) saturate(1.4)",
              boxShadow: isLightAppearance
                ? "0 4px 16px rgba(15, 23, 42, 0.07), inset 0 -1px 0 rgba(148, 163, 184, 0.20)"
                : "0 8px 28px rgba(2, 8, 24, 0.50), inset 0 -1px 0 rgba(59, 130, 246, 0.14)",
            }}
          >
            <div className="px-4 md:px-8 py-2.5 md:py-3.5 flex items-center justify-between gap-3">
              <button
                onClick={onLogoClick}
                className="md:hidden flex items-center gap-2 cursor-pointer"
                type="button"
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    boxShadow: "0 3px 10px rgba(37, 99, 235, 0.30)",
                  }}
                >
                  <Car className="w-4 h-4" />
                </span>
                <span className="text-lg font-bold tracking-tight">
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
                  <span className="italic" style={{ color: "#3b82f6" }}>
                    On
                  </span>
                  <span className={isLightAppearance ? "text-slate-800" : "text-slate-100"}>
                    Dent
                  </span>
                </span>
              </button>

              <div className="hidden md:block">
                <h2
                  className={`text-xl font-semibold leading-tight ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
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
                <div
                  className={`hidden lg:flex items-center gap-2 px-3 py-2 min-w-[260px] rounded-xl border transition-colors ${isLightAppearance ? "border-slate-200/80 bg-slate-50/80 hover:bg-white/90" : "bd-glass-control--utility"}`}
                >
                  <Search
                    className={`w-4 h-4 ${isLightAppearance ? "text-slate-400" : "text-blue-200/70"}`}
                  />
                  <input
                    className={`bg-transparent text-sm w-full outline-none ${isLightAppearance ? "placeholder:text-slate-400 text-slate-700" : "placeholder:text-blue-200/60 text-slate-100"}`}
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
                    className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isLightAppearance ? "border border-slate-200/80 bg-white/70 hover:bg-white/90" : "bd-glass-control--utility"}`}
                    aria-label="Open notifications"
                    aria-expanded={showNotifications}
                  >
                    <Bell
                      className={`w-5 h-5 ${isLightAppearance ? "text-slate-600" : "text-slate-100"}`}
                    />
                    {unreadCount > 0 && (
                      <>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
                        <span
                          className={`absolute -right-1.5 -top-1.5 min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none ${isLightAppearance ? "bg-white text-slate-800 ring-1 ring-slate-200" : "bg-slate-950 text-white"}`}
                        >
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      </>
                    )}
                  </button>

                  {profileDropdownData ? (
                    <NotificationCenter
                      isOpen={showNotifications}
                      isLightAppearance={isLightAppearance}
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
                    className="flex items-center gap-2 p-1 md:pl-1.5 md:pr-2 md:py-1.5 rounded-full hover:bg-blue-500/10 transition-colors"
                  >
                    {userImageUrl ? (
                      <img
                        src={userImageUrl}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover shrink-0 border border-blue-400/25"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white font-semibold"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        }}
                      >
                        {userProfile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden md:block text-left pr-1">
                      <p
                        className={`text-sm font-semibold leading-none ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
                      >
                        {userProfile.name}
                      </p>
                      <p
                        className={`text-xs mt-1 leading-none ${isLightAppearance ? "text-slate-500" : "text-slate-300"}`}
                      >
                        {userProfile.email}
                      </p>
                    </div>
                  </button>

                  {showTopProfileMenu && profileDropdownData && (
                    <div
                      role="menu"
                      aria-label="User profile menu"
                      className={`absolute right-0 mt-2 w-60 z-50 overflow-hidden rounded-2xl border shadow-xl backdrop-blur-xl ${isLightAppearance ? "bg-white/97 border-slate-200/70 shadow-slate-200/50" : "bd-glass-floating"}`}
                    >
                      <div
                        className={`px-3 py-2.5 border-b ${isLightAppearance ? "border-slate-200/70" : "border-blue-400/15"}`}
                      >
                        <p
                          className={`text-sm font-semibold truncate ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
                        >
                          {userProfile.name}
                        </p>
                        <p
                          className={`text-xs truncate ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
                        >
                          {userProfile.email}
                        </p>
                      </div>
                      <button
                        role="menuitem"
                        onClick={() => {
                          profileDropdownData.onNavigate("dashboard", "home");
                          setShowTopProfileMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2.5 ${isLightAppearance ? "text-slate-700 hover:bg-blue-50" : "text-slate-200 hover:bg-blue-500/10"}`}
                      >
                        <Home className="w-4 h-4 opacity-70" />
                        Dashboard
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => {
                          setShowTopProfileMenu(false);
                          setShowSettingsModal(true);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2.5 ${isLightAppearance ? "text-slate-700 hover:bg-blue-50" : "text-slate-200 hover:bg-blue-500/10"}`}
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
                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2.5 ${isLightAppearance ? "text-slate-700 hover:bg-blue-50" : "text-slate-200 hover:bg-blue-500/10"}`}
                      >
                        <User className="w-4 h-4 opacity-70" />
                        Account Settings
                      </button>
                      <button
                        role="menuitem"
                        onClick={() => {
                          profileDropdownData.onLogout();
                          setShowTopProfileMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2.5 text-rose-500 hover:bg-rose-50/80 border-t ${isLightAppearance ? "border-slate-200/60 hover:bg-rose-50" : "border-blue-400/15 hover:bg-rose-500/10 text-rose-400"}`}
                      >
                        <LogOut className="w-4 h-4 opacity-70" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

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
