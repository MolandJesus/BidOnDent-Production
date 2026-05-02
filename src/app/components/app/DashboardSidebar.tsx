import { Car, Sparkles } from "lucide-react";
import { useState, type RefObject } from "react";
import type { Bid, NavTab, Notification, Report, Vehicle, ViewMode } from "../../types";
import type { ProfileDropdownData, UserProfile } from "../../types/dashboardShell";
import ProfileDropdown from "../dashboard/ProfileDropdown";

type DashboardSidebarProps = {
  isLightAppearance: boolean;
  primaryColor: string;
  secondaryColor: string;
  currentNavTabs: NavTab[];
  currentTab: string;
  viewMode: ViewMode;
  onLogoClick: () => void;
  onTabClick: (tabId: string) => void;
  onOpenDemoMode?: () => void;
  profileDropdownData?: ProfileDropdownData;
  userProfile: UserProfile;
  userImageUrl: string;
  notifications: Notification[];
  notificationSyncActive: boolean;
  reports: Report[];
  vehicles: Vehicle[];
  bids: Bid[];
  onDismissTopProfile: () => void;
};

export default function DashboardSidebar({
  isLightAppearance,
  primaryColor,
  secondaryColor,
  currentNavTabs,
  currentTab,
  viewMode,
  onLogoClick,
  onTabClick,
  onOpenDemoMode,
  profileDropdownData,
  userProfile,
  userImageUrl,
  notifications,
  notificationSyncActive,
  reports,
  vehicles,
  bids,
  onDismissTopProfile,
}: DashboardSidebarProps) {
  const [showSidebarProfilePanel, setShowSidebarProfilePanel] = useState(false);

  return (
    <aside
      aria-label="Dashboard sidebar"
      className={`hidden md:flex md:w-72 md:flex-col md:sticky md:top-0 md:h-screen bd-glass-panel md:rounded-none md:border-0 md:border-r ${
        isLightAppearance
          ? "bd-light-surface md:border-[rgba(147,197,253,0.32)]"
          : "md:border-blue-400/[0.12]"
      }`}
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, rgba(248, 251, 255, 0.74) 0%, rgba(238, 247, 255, 0.66) 100%), radial-gradient(ellipse 86% 34% at 42% 4%, rgba(255, 255, 255, 0.56) 0%, rgba(220, 235, 255, 0.10) 46%, transparent 78%)"
          : "linear-gradient(180deg, rgba(6, 14, 36, 0.72) 0%, rgba(5, 11, 28, 0.65) 100%)",
        backdropFilter: isLightAppearance
          ? "blur(34px) saturate(1.64)"
          : "blur(28px) saturate(1.5)",
        WebkitBackdropFilter: isLightAppearance
          ? "blur(34px) saturate(1.64)"
          : "blur(28px) saturate(1.5)",
        boxShadow: isLightAppearance
          ? "8px 0 36px rgba(15, 23, 42, 0.12), 2px 0 10px rgba(59, 130, 246, 0.10), inset -1px 0 0 rgba(147, 197, 253, 0.24), inset 0 1px 0 rgba(255, 255, 255, 0.82)"
          : "2px 0 32px rgba(2, 6, 23, 0.50), inset -1px 0 0 rgba(59, 130, 246, 0.08)",
      }}
    >
      <div
        className={`px-5 py-5 border-b ${isLightAppearance ? "border-[rgba(147,197,253,0.22)]" : "border-blue-400/[0.10]"}`}
      >
        <button
          onClick={onLogoClick}
          aria-label="Open dashboard home"
          className="flex items-center gap-2.5 cursor-pointer bg-transparent"
          type="button"
        >
          <span
            className="w-10 h-10 rounded-[1rem] flex items-center justify-center"
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
            <span style={{ color: "#3b82f6" }}>On</span>
            <span className={isLightAppearance ? "text-slate-800" : "text-slate-100"}>Dent</span>
          </h1>
        </button>
      </div>

      <nav aria-label="Dashboard navigation" className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
        {currentNavTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id && viewMode === "dashboard";

          return (
            <button
              key={tab.id}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onTabClick(tab.id)}
              className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45 ${
                isActive
                  ? ""
                  : isLightAppearance
                    ? "hover:bg-blue-500/[0.06]"
                    : "hover:bg-blue-500/[0.08]"
              }`}
              type="button"
              style={
                isActive
                  ? {
                      background: isLightAppearance
                        ? "linear-gradient(135deg, rgba(37, 99, 235, 0.16) 0%, rgba(96, 165, 250, 0.09) 100%)"
                        : "linear-gradient(135deg, rgba(37, 99, 235, 0.20) 0%, rgba(59, 130, 246, 0.11) 100%)",
                      boxShadow: isLightAppearance
                        ? "inset 0 1px 0 rgba(255, 255, 255, 0.80), inset 0 -1px 0 rgba(147, 197, 253, 0.16), 0 0 0 1px rgba(147, 197, 253, 0.18), 0 4px 12px rgba(59, 130, 246, 0.10)"
                        : "inset 0 1px 0 rgba(147, 197, 253, 0.14), 0 0 0 1px rgba(96, 165, 250, 0.20), 0 4px 14px rgba(37, 99, 235, 0.16)",
                    }
                  : {}
              }
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{
                    background: `linear-gradient(180deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    boxShadow: "0 0 8px rgba(37, 99, 235, 0.35)",
                  }}
                />
              )}
              <span
                className={`w-9 h-9 rounded-[1rem] flex items-center justify-center shrink-0 transition-all duration-200 ${
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
                <span aria-hidden="true" className="ml-auto text-xs font-medium text-blue-300/50">
                  ›
                </span>
              )}
            </button>
          );
        })}
        {onOpenDemoMode && (
          <div
            className={`pt-2 mt-1 border-t ${isLightAppearance ? "border-blue-200/40" : "border-blue-400/[0.08]"}`}
          >
            <button
              aria-label="Open demo mode"
              onClick={onOpenDemoMode}
              className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-200 hover:bg-blue-500/[0.06]`}
              type="button"
            >
              <span className="w-9 h-9 rounded-[1rem] flex items-center justify-center shrink-0 transition-all duration-200 bg-purple-500/[0.10] group-hover:bg-purple-500/[0.18]">
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
          <div className="pt-2" id="dashboard-sidebar-profile-panel">
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
        className={`p-3 border-t ${isLightAppearance ? "border-blue-200/40" : "border-blue-400/[0.10]"}`}
      >
        <button
          onClick={() => {
            onDismissTopProfile();
            setShowSidebarProfilePanel((current) => !current);
          }}
          aria-controls="dashboard-sidebar-profile-panel"
          aria-expanded={showSidebarProfilePanel}
          aria-label={showSidebarProfilePanel ? "Close profile panel" : "Open profile panel"}
          className="group w-full flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 hover:bg-blue-500/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/45"
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
              {(userProfile.name || "U").charAt(0).toUpperCase()}
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
  );
}
