import { Car, Menu, X } from "lucide-react";
import type { RefObject } from "react";
import DashboardRouter from "../../routers/DashboardRouter";
import type { Activity, Bid, NavTab, Notification, Vehicle } from "../../types";
import DeleteUserUtility from "../DeleteUserUtility";
import ProfileDropdown from "../dashboard/ProfileDropdown";
import MobileBottomNav from "../dashboard/MobileBottomNav";
import StorageInspector from "../StorageInspector";

type UserProfile = {
  name: string;
  email: string;
  user_type: string;
  phone?: string;
};

type ProfileDropdownData = {
  userType: string;
  userEmail: string;
  profileImage: string;
  notifications: Notification[];
  unreadCount: number;
  reports: any[];
  vehicles: Vehicle[];
  bids: Bid[];
  activities: Activity[];
  onNavigate: (destination: string, tab?: string) => void;
  onClose: () => void;
  onLogout: () => void;
  forwardedRef: RefObject<HTMLDivElement>;
};

type DashboardLayoutProps = {
  primaryColor: string;
  secondaryColor: string;
  currentNavTabs: NavTab[];
  currentTab: string;
  viewMode: string;
  showMobileMenu: boolean;
  showProfileDropdown: boolean;
  profileDropdownRef: RefObject<HTMLDivElement>;
  userProfile: UserProfile;
  userImageUrl: string;
  notifications: Notification[];
  reports: any[];
  vehicles: Vehicle[];
  bids: Bid[];
  activities: Activity[];
  onLogoClick: () => void;
  onTabClick: (tabId: string) => void;
  onMobileMenuToggle: () => void;
  onMobileMenuTabClick: (tabId: string) => void;
  onProfileToggle: () => void;
  profileDropdownData?: ProfileDropdownData;
  dashboardRouterProps: React.ComponentProps<typeof DashboardRouter>;
  isAdmin: boolean;
  showStorageInspector: boolean;
  onCloseStorageInspector: () => void;
};

export default function DashboardLayout({
  primaryColor,
  secondaryColor,
  currentNavTabs,
  currentTab,
  viewMode,
  showMobileMenu,
  showProfileDropdown,
  profileDropdownRef,
  userProfile,
  userImageUrl,
  notifications,
  reports,
  vehicles,
  bids,
  activities,
  onLogoClick,
  onTabClick,
  onMobileMenuToggle,
  onMobileMenuTabClick,
  onProfileToggle,
  profileDropdownData,
  dashboardRouterProps,
  isAdmin,
  showStorageInspector,
  onCloseStorageInspector
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="py-3 flex items-center justify-between">
            <button
              onClick={onLogoClick}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Car className="w-6 h-6" style={{ color: primaryColor }} />
              <h1 className="text-2xl font-bold tracking-tight">
                <span
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}
                >
                  Bid
                </span>
                <span style={{ color: "#70c0ee" }}>On</span>
                <span className="text-gray-800">Dent</span>
              </h1>
            </button>

            <nav className="hidden md:flex items-center space-x-1">
              {currentNavTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id && viewMode === "dashboard";

                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabClick(tab.id)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    style={isActive ? { backgroundColor: primaryColor } : {}}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>

            <div className="relative hidden md:block">
              <button
                onClick={onProfileToggle}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {userImageUrl ? (
                  <img
                    src={userImageUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white font-semibold shadow-md">
                    {userProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-medium text-gray-900">{userProfile.name}</p>
                  <p className="text-sm text-gray-500">{userProfile.email}</p>
                </div>
              </button>

              {showProfileDropdown && profileDropdownData && (
                <ProfileDropdown
                  userInfo={{
                    name: userProfile.name,
                    email: userProfile.email,
                    profileImage: userImageUrl || ""
                  }}
                  userType={profileDropdownData.userType}
                  notifications={notifications}
                  unreadCount={profileDropdownData.unreadCount}
                  isOpen={showProfileDropdown}
                  onClose={profileDropdownData.onClose}
                  onNavigate={profileDropdownData.onNavigate}
                  onLogout={profileDropdownData.onLogout}
                  forwardedRef={profileDropdownData.forwardedRef}
                  userEmail={profileDropdownData.userEmail}
                  reports={reports}
                  vehicles={vehicles}
                  bids={bids}
                  activities={activities}
                />
              )}
            </div>

            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="space-y-2">
                {currentNavTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id && viewMode === "dashboard";

                  return (
                    <button
                      key={tab.id}
                      onClick={() => onMobileMenuTabClick(tab.id)}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-left ${
                        isActive ? "text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                      style={isActive ? { backgroundColor: primaryColor } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pb-20 md:pb-0">
        <DashboardRouter {...dashboardRouterProps} />
      </div>

      <MobileBottomNav
        tabs={currentNavTabs}
        currentTab={currentTab}
        viewMode={viewMode}
        primaryColor={primaryColor}
        onTabClick={(tabId) => onMobileMenuTabClick(tabId)}
      />

      {showStorageInspector && isAdmin && (
        <StorageInspector onClose={onCloseStorageInspector} />
      )}

      {isAdmin && <DeleteUserUtility />}
    </div>
  );
}
