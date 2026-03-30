import { Bell, Car, Home, LogOut, Search, Settings, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { Bid, Notification, Vehicle } from "../../types";
import NotificationCenter from "../dashboard/NotificationCenter";

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

type DashboardHeaderProps = {
  isLightAppearance: boolean;
  primaryColor: string;
  secondaryColor: string;
  activeTabLabel: string;
  onLogoClick: () => void;
  onOpenDemoMode?: () => void;
  userProfile: UserProfile;
  userImageUrl: string;
  notifications: Notification[];
  notificationSyncActive: boolean;
  reports: any[];
  profileDropdownData?: ProfileDropdownData;
  unreadCount: number;
  onMarkNotificationRead: (notificationId: string | number) => void;
  onMarkAllNotificationsRead: () => void;
  onOpenSettings: () => void;
};

export default function DashboardHeader({
  isLightAppearance,
  primaryColor,
  secondaryColor,
  activeTabLabel,
  onLogoClick,
  onOpenDemoMode,
  userProfile,
  userImageUrl,
  notifications,
  notificationSyncActive,
  reports,
  profileDropdownData,
  unreadCount,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onOpenSettings,
}: DashboardHeaderProps) {
  const [showTopProfileMenu, setShowTopProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const topProfileMenuRef = useRef<HTMLDivElement>(null);
  const notificationCenterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showNotifications && !showTopProfileMenu) {
      return;
    }

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

    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowTopProfileMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [showNotifications, showTopProfileMenu]);

  useEffect(() => {
    if (
      !showNotifications ||
      typeof document === "undefined" ||
      typeof window === "undefined" ||
      !window.matchMedia("(max-width: 767px)").matches
    ) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showNotifications]);

  return (
    <header
      className={`sticky top-0 z-40 mx-2 mt-2 md:mx-3 md:mt-3 rounded-3xl md:rounded-[2rem] border ${
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
          aria-label="Open dashboard home"
          className="md:hidden flex items-center gap-2 cursor-pointer"
          type="button"
        >
          <span
            className="w-9 h-9 rounded-[1rem] flex items-center justify-center text-white"
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
            <span style={{ color: "#3b82f6" }}>On</span>
            <span className={isLightAppearance ? "text-slate-800" : "text-slate-100"}>Dent</span>
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
              type="button"
            >
              <Sparkles className="w-5 h-5 text-blue-600" />
            </button>
          )}
          <div
            aria-label="Dashboard search is coming soon"
            className={`hidden lg:flex items-center justify-between gap-3 px-3 py-2 min-w-[260px] rounded-xl border ${isLightAppearance ? "border-slate-200/80 bg-slate-50/80" : "bd-glass-control--utility"}`}
            role="note"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Search
                className={`w-4 h-4 shrink-0 ${isLightAppearance ? "text-slate-400" : "text-blue-200/70"}`}
              />
              <div className="min-w-0">
                <p
                  className={`truncate text-sm font-medium ${isLightAppearance ? "text-slate-700" : "text-slate-100"}`}
                >
                  Global search
                </p>
                <p
                  className={`truncate text-xs ${isLightAppearance ? "text-slate-400" : "text-blue-200/60"}`}
                >
                  Coming soon
                </p>
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${isLightAppearance ? "bg-white text-slate-500 ring-1 ring-slate-200" : "bg-white/10 text-blue-100/70"}`}
            >
              Soon
            </span>
          </div>

          <div className="relative" ref={notificationCenterRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications((current) => !current);
                setShowTopProfileMenu(false);
              }}
              className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isLightAppearance ? "border border-slate-200/80 bg-white/70 hover:bg-white/90" : "bd-glass-control--utility"}`}
              aria-label={
                showNotifications
                  ? "Close notifications"
                  : unreadCount > 0
                    ? `Open notifications, ${unreadCount} unread`
                    : "Open notifications"
              }
              aria-controls="dashboard-notification-center"
              aria-expanded={showNotifications}
              aria-haspopup="dialog"
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
              aria-controls="dashboard-user-profile-menu"
              aria-expanded={showTopProfileMenu}
              aria-haspopup="menu"
              aria-label={showTopProfileMenu ? "Close user profile menu" : "Open user profile menu"}
              className="flex items-center gap-2 p-1 md:pl-1.5 md:pr-2 md:py-1.5 rounded-full hover:bg-blue-500/10 transition-colors"
              type="button"
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
                  {(userProfile.name || "U").charAt(0).toUpperCase()}
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
                id="dashboard-user-profile-menu"
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
                  type="button"
                >
                  <Home className="w-4 h-4 opacity-70" />
                  Dashboard
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setShowTopProfileMenu(false);
                    onOpenSettings();
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2.5 ${isLightAppearance ? "text-slate-700 hover:bg-blue-50" : "text-slate-200 hover:bg-blue-500/10"}`}
                  type="button"
                >
                  <Settings className="w-4 h-4 opacity-60" />
                  Appearance Settings
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    profileDropdownData.onNavigate("dashboard", "account");
                    setShowTopProfileMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2.5 ${isLightAppearance ? "text-slate-700 hover:bg-blue-50" : "text-slate-200 hover:bg-blue-500/10"}`}
                  type="button"
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
                  type="button"
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
  );
}
