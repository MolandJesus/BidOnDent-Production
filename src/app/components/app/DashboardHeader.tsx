import { Bell, Home, LogOut, Search, Settings, Sparkles, User, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { Bid, Notification, Report, Vehicle } from "../../types";
import type { ProfileDropdownData, UserProfile } from "../../types/dashboardShell";
import NotificationCenter from "../dashboard/NotificationCenter";
import BrandLogo from "./BrandLogo";

type NotificationAnchorRect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type NotificationHeaderRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: string;
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
  reports: Report[];
  profileDropdownData?: ProfileDropdownData;
  unreadCount: number;
  onMarkNotificationRead: (notificationId: string | number) => void;
  onMarkAllNotificationsRead: () => void;
  onOpenSettings: () => void;
  onNavigateToReport?: (reportId: string) => void;
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
  onNavigateToReport,
}: DashboardHeaderProps) {
  const [showTopProfileMenu, setShowTopProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationAnchorRect, setNotificationAnchorRect] =
    useState<NotificationAnchorRect | null>(null);
  const [notificationHeaderRect, setNotificationHeaderRect] =
    useState<NotificationHeaderRect | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const topProfileMenuRef = useRef<HTMLDivElement>(null);
  const notificationTriggerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    return reports
      .filter((r) => {
        const vi = r.vehicleInfo;
        const text = [
          vi?.year,
          vi?.make,
          vi?.model,
          r.description,
          r.damageDescription,
          r.address,
          r.city,
          r.state,
          r.claimNumber,
          r.customerName,
          r.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(q);
      })
      .slice(0, 6);
  }, [searchQuery, reports]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  useEffect(() => {
    if (!showTopProfileMenu && !searchOpen) {
      return;
    }

    const onDocumentClick = (event: MouseEvent) => {
      if (topProfileMenuRef.current && !topProfileMenuRef.current.contains(event.target as Node)) {
        setShowTopProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    document.addEventListener("mousedown", onDocumentClick);
    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
    };
  }, [showTopProfileMenu, searchOpen, closeSearch]);

  useEffect(() => {
    if (!showNotifications && !showTopProfileMenu && !searchOpen) {
      return;
    }

    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowTopProfileMenu(false);
        setShowNotifications(false);
        closeSearch();
      }
    };

    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [showNotifications, showTopProfileMenu, searchOpen, closeSearch]);

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

  useEffect(() => {
    if (!showNotifications) {
      setNotificationAnchorRect(null);
      setNotificationHeaderRect(null);
      return;
    }

    const updateNotificationGeometry = () => {
      const headerBounds = headerRef.current?.getBoundingClientRect();
      const triggerBounds = notificationTriggerRef.current?.getBoundingClientRect();
      if (!headerBounds || !triggerBounds) return;

      const computedHeaderStyle = window.getComputedStyle(headerRef.current!);

      setNotificationHeaderRect({
        top: Math.round(headerBounds.top),
        left: Math.round(headerBounds.left),
        width: Math.round(headerBounds.width),
        height: Math.round(headerBounds.height),
        borderRadius: computedHeaderStyle.borderRadius,
      });

      setNotificationAnchorRect({
        top: Math.round(triggerBounds.top),
        right: Math.round(triggerBounds.right),
        bottom: Math.round(triggerBounds.bottom),
        left: Math.round(triggerBounds.left),
      });
    };

    const frameId = window.requestAnimationFrame(updateNotificationGeometry);
    window.addEventListener("resize", updateNotificationGeometry);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updateNotificationGeometry);
    };
  }, [showNotifications]);

  return (
    <header
      ref={headerRef}
      className={`bd-shell-header sticky top-0 z-40 mx-1.5 mt-1.5 rounded-3xl border sm:mx-2 sm:mt-2 md:mx-3 md:mt-3 md:rounded-[2rem] ${
        isLightAppearance
          ? "bd-shell-header--light border-[rgba(140,82,22,0.32)]"
          : "bd-shell-header--dark border-blue-400/[0.12]"
      }`}
    >
      <div className="relative z-[2] flex items-center justify-between gap-2 px-3 py-2 sm:px-4 md:gap-3 md:px-8 md:py-3.5">
        <button
          onClick={onLogoClick}
          aria-label="Open dashboard home"
          className={`flex min-h-[44px] min-w-0 shrink-0 items-center rounded-2xl px-1 py-1 transition-colors md:hidden ${isLightAppearance ? "hover:bg-slate-900/[0.04] active:bg-slate-900/[0.08]" : "hover:bg-white/5 active:bg-white/10"}`}
          type="button"
        >
          <BrandLogo
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            tone={isLightAppearance ? "light" : "dark"}
            size="header"
          />
        </button>

        <div className="hidden md:block">
          <h2
            className={`text-xl font-semibold leading-tight ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
          >
            {activeTabLabel}
          </h2>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          {onOpenDemoMode && (
            <button
              onClick={onOpenDemoMode}
              className={`flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border backdrop-blur-xl transition-all md:hidden ${isLightAppearance ? "border-[rgba(140,82,22,0.30)] bg-blue-50/72 shadow-[0_8px_18px_rgba(15,30,60,0.10),inset_0_1px_0_rgba(252,238,204,0.70)] hover:bg-blue-50/90" : "border-blue-300/18 bg-white/[0.05] shadow-[0_10px_22px_rgba(2,6,23,0.26)] hover:bg-white/[0.08]"}`}
              aria-label="Open demo mode"
              type="button"
            >
              <Sparkles
                className={`h-4 w-4 ${isLightAppearance ? "text-blue-600" : "text-blue-200/85"}`}
              />
            </button>
          )}
          <div ref={searchRef} className="relative hidden lg:block">
            <div
              className={`flex items-center gap-2 px-3 py-2 min-h-[44px] min-w-[260px] rounded-xl border transition-colors ${
                searchOpen
                  ? isLightAppearance
                    ? "border-blue-400/55 bg-blue-50/85 ring-2 ring-blue-300/25 shadow-[0_2px_8px_rgba(15,30,60,0.12),inset_0_1px_0_rgba(252,238,204,0.78)]"
                    : "border-blue-400/35 bg-white/[0.08] ring-2 ring-blue-400/18"
                  : isLightAppearance
                    ? "border-[rgba(140,82,22,0.30)] bg-blue-50/72 cursor-pointer hover:bg-blue-50/90 hover:border-[rgba(140,82,22,0.42)] shadow-[inset_0_1px_0_rgba(252,238,204,0.72),0_2px_6px_rgba(15,30,60,0.08)]"
                    : "bd-glass-control--utility cursor-pointer"
              }`}
              onClick={() => {
                if (!searchOpen) {
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 0);
                }
              }}
              role={searchOpen ? undefined : "button"}
              tabIndex={searchOpen ? undefined : 0}
              onKeyDown={(e) => {
                if (!searchOpen && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  setSearchOpen(true);
                  setTimeout(() => searchInputRef.current?.focus(), 0);
                }
              }}
            >
              <Search
                className={`w-4 h-4 shrink-0 ${isLightAppearance ? "text-slate-400" : "text-blue-200/70"}`}
              />
              {searchOpen ? (
                <>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") closeSearch();
                    }}
                    placeholder="Search reports…"
                    className={`w-full bg-transparent text-sm outline-none placeholder-slate-400 ${isLightAppearance ? "text-slate-700" : "text-slate-100"}`}
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={closeSearch}
                      aria-label="Close search"
                      className={`shrink-0 ${isLightAppearance ? "text-slate-400 hover:text-slate-600" : "text-blue-200/60 hover:text-blue-100"}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : (
                <span
                  className={`truncate text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-200/60"}`}
                >
                  Search reports…
                </span>
              )}
            </div>

            {/* Search results dropdown */}
            {searchOpen && searchQuery.length >= 2 && (
              <div
                className={`absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50 ${
                  isLightAppearance
                    ? // Cool blue-cream glass replaces near-white surface (KI-066).
                      "border border-blue-200/45 bg-[linear-gradient(180deg,rgba(238,247,255,0.96)_0%,rgba(219,234,254,0.92)_100%)] shadow-[0_18px_44px_rgba(15,23,42,0.12),0_4px_10px_rgba(30,58,138,0.06),inset_0_1px_0_rgba(252,240,208,0.85)]"
                    : "border border-blue-400/20 bg-[#0d1f35]/95 shadow-[0_18px_44px_rgba(2,6,23,0.45),inset_0_1px_0_rgba(147,197,253,0.10),inset_0_-1px_0_rgba(196,144,65,0.16),0_0_22px_rgba(196,130,45,0.12)]"
                }`}
              >
                {searchResults.length === 0 ? (
                  <p
                    className={`px-4 py-3 text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-200/60"}`}
                  >
                    No reports found.
                  </p>
                ) : (
                  searchResults.map((report) => (
                    <button
                      key={report.id}
                      type="button"
                      onClick={() => {
                        onNavigateToReport?.(report.id);
                        closeSearch();
                      }}
                      className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        isLightAppearance
                          ? "hover:bg-slate-50 text-slate-700"
                          : "hover:bg-white/[0.06] text-slate-200"
                      }`}
                    >
                      <span className="font-medium">
                        {[
                          report.vehicleInfo?.year,
                          report.vehicleInfo?.make,
                          report.vehicleInfo?.model,
                        ]
                          .filter(Boolean)
                          .join(" ") || "Report"}
                      </span>
                      <span
                        className={`ml-2 text-xs ${isLightAppearance ? "text-slate-400" : "text-blue-200/50"}`}
                      >
                        {report.city || report.address || report.status}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="relative" ref={notificationTriggerRef}>
            <button
              type="button"
              onClick={() => {
                setShowNotifications((current) => !current);
                setShowTopProfileMenu(false);
              }}
              className={`relative flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 ${isLightAppearance ? "border-blue-200/55 bg-[linear-gradient(180deg,rgba(238,247,255,0.85)_0%,rgba(219,234,254,0.78)_100%)] shadow-[inset_0_1px_0_rgba(252,240,208,0.78)] hover:bg-[linear-gradient(180deg,rgba(238,247,255,0.96)_0%,rgba(219,234,254,0.90)_100%)] hover:border-blue-300/65" : "border-blue-400/[0.14] bg-white/[0.05] hover:bg-white/[0.09] hover:border-blue-400/[0.22] shadow-[inset_0_1px_0_rgba(147,197,253,0.06)]"}`}
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
                className={`w-[18px] h-[18px] ${isLightAppearance ? "text-slate-500" : "text-slate-300"}`}
              />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold leading-none text-white"
                  style={{
                    boxShadow: "0 2px 6px rgba(59, 130, 246, 0.4)",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
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
                anchorRect={notificationAnchorRect}
                headerOverlayRect={notificationHeaderRect}
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
              className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full p-1 transition-colors hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 md:gap-2 md:pl-1.5 md:pr-2 md:py-1.5"
              type="button"
            >
              {userImageUrl && !userImageUrl.startsWith("storage://") ? (
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
                className={`absolute right-0 mt-2 w-60 z-50 overflow-hidden rounded-2xl border backdrop-blur-xl ${isLightAppearance ? "border-blue-200/45 bg-[linear-gradient(180deg,rgba(238,247,255,0.96)_0%,rgba(219,234,254,0.92)_100%)] shadow-[0_18px_44px_rgba(15,23,42,0.14),0_4px_10px_rgba(30,58,138,0.07),inset_0_1px_0_rgba(252,240,208,0.85),0_0_0_1px_rgba(191,219,254,0.20)]" : "border-blue-400/22 bg-[linear-gradient(180deg,rgba(11,23,47,0.94)_0%,rgba(8,18,38,0.90)_100%)] shadow-[0_22px_56px_rgba(2,6,23,0.50),inset_0_1px_0_rgba(147,197,253,0.14),inset_0_-1px_0_rgba(196,144,65,0.18),0_0_0_1px_rgba(96,165,250,0.18),0_0_24px_rgba(196,130,45,0.14)]"}`}
              >
                <div
                  className={`px-3 py-2.5 border-b ${isLightAppearance ? "border-blue-200/35" : "border-blue-400/15"}`}
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
