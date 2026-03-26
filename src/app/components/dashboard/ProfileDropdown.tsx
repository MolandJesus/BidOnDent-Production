import { RefObject } from "react";
import {
  Settings,
  Car,
  Camera,
  FileCheck,
  ClipboardList,
  Wrench,
  FileText,
  Building2,
  LogOut,
  Radio,
  Bell,
  Package,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { LANDING_PAGE_IMAGES } from "../../constants";
import type { Notification } from "../../types";
import { getNotificationDestination, getNotificationVisual } from "./notification-utils";
import ProfileRoleStats from "./ProfileRoleStats";

interface ProfileDropdownProps {
  userInfo: {
    name: string;
    email: string;
    profileImage?: string;
  };
  userType: "customer" | "shop" | "insurer";
  notifications: Notification[];
  notificationSyncActive?: boolean;
  isOpen: boolean;
  onNavigate: (destination: string, tab?: string) => void;
  onLogout: () => void;
  forwardedRef: RefObject<HTMLDivElement | null>;
  // Account-specific data props
  reports?: any[];
  vehicles?: any[];
  bids?: any[];
  variant?: "popover" | "embedded";
}

export default function ProfileDropdown({
  userInfo,
  userType,
  notifications,
  notificationSyncActive = false,
  isOpen,
  onNavigate,
  onLogout,
  forwardedRef,
  reports,
  vehicles,
  bids,
  variant = "popover",
}: ProfileDropdownProps) {
  if (!isOpen) return null;

  const reportList = Array.isArray(reports) ? reports : [];
  const bidList = Array.isArray(bids) ? bids : [];
  const shopRequestsCount = reportList.length;
  const shopBidCount = bidList.length;
  const shopAverageRating =
    shopBidCount > 0
      ? (
          bidList.reduce((sum, bid) => sum + Number(bid?.shopRating || 0), 0) / shopBidCount
        ).toFixed(1)
      : "--";
  const insurerResolvedClaims = reportList.filter(
    (report) => report?.status === "completed"
  ).length;
  const insurerPartnerShops = new Set(
    reportList.flatMap((report) =>
      Array.isArray(report?.bids)
        ? report.bids.map((bid: any) => bid?.shopName).filter(Boolean)
        : []
    )
  ).size;
  const insurerBidCount = reportList.reduce(
    (count, report) => count + (Array.isArray(report?.bids) ? report.bids.length : 0),
    0
  );

  const totalUnreadCount = notifications.filter((n) => !n.read).length;

  const getEmptyStateMessage = () => {
    if (!notificationSyncActive) {
      return (
        <div className="flex flex-col gap-1">
          <span>No notifications yet</span>
          <span className="text-xs text-gray-400">Background refresh is paused.</span>
        </div>
      );
    }

    switch (userType) {
      case "shop":
        return (
          <div className="flex flex-col gap-1">
            <span>No notifications yet</span>
            <span className="text-xs text-gray-400">
              Refreshes every 15 seconds for new repair requests.
            </span>
          </div>
        );
      case "customer":
        return (
          <div className="flex flex-col gap-1">
            <span>No notifications yet</span>
            <span className="text-xs text-gray-400">
              Refreshes every 15 seconds for bids on your reports.
            </span>
          </div>
        );
      case "insurer":
        return (
          <div className="flex flex-col gap-1">
            <span>No notifications yet</span>
            <span className="text-xs text-gray-400">
              Refreshes every 15 seconds for insurance-linked claims.
            </span>
          </div>
        );
      default:
        return "No notifications";
    }
  };

  // Handle notification click based on type and user role
  const handleNotificationClick = (notification: Notification) => {
    const destinationTab = getNotificationDestination(notification, userType);
    if (destinationTab) {
      onNavigate("dashboard", destinationTab);
    }
  };

  const containerClasses =
    variant === "embedded"
      ? "w-full bd-glass-card"
      : "absolute right-0 mt-2 w-80 bd-glass-floating z-50";

  return (
    <div
      ref={forwardedRef}
      className={`${containerClasses} text-slate-200`}
      style={{
        background:
          "linear-gradient(180deg, rgba(18, 36, 60, 0.97) 0%, rgba(12, 25, 41, 0.93) 100%)",
        borderColor: "rgba(96, 165, 250, 0.24)",
        boxShadow:
          "0 24px 56px rgba(2, 6, 23, 0.5), 0 4px 12px rgba(2, 6, 23, 0.3), 0 0 1px rgba(96, 165, 250, 0.35), inset 0 1px 0 rgba(147, 197, 253, 0.1), 0 0 40px rgba(37, 99, 235, 0.08)",
      }}
    >
      {/* Profile Header */}
      <div className="p-4 border-b border-slate-200/40">
        <div className="flex items-center space-x-3">
          {/* Profile Picture */}
          {userInfo.profileImage ? (
            <ImageWithFallback
              src={userInfo.profileImage}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <img
              src={LANDING_PAGE_IMAGES.DEFAULT_PROFILE}
              alt="Default Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{userInfo.name || "User"}</p>
            <p className="text-sm text-blue-200/60 truncate">{userInfo.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/25 text-blue-300 font-medium capitalize">
              {userType}
            </span>
          </div>
        </div>
      </div>

      {/* Account-Specific Stats Section */}
      <ProfileRoleStats
        userType={userType}
        reportCount={reportList.length}
        vehicleCount={vehicles?.length || 0}
        bidCount={bidList.length}
        shopRequestsCount={shopRequestsCount}
        shopBidCount={shopBidCount}
        shopAverageRating={shopAverageRating}
        insurerPartnerShops={insurerPartnerShops}
        insurerResolvedClaims={insurerResolvedClaims}
        insurerBidCount={insurerBidCount}
      />

      {/* Notifications Section */}
      <div className="border-b border-slate-200/40">
        <div className="px-4 py-2 bg-white/5 font-semibold text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-200">Notifications</span>
            <div className="flex items-center gap-1">
              <Radio
                className={`w-3 h-3 ${notificationSyncActive ? "text-green-500 animate-pulse" : "text-gray-400"}`}
              />
              <span
                className={`text-xs ${notificationSyncActive ? "text-green-400" : "text-blue-200/50"}`}
              >
                {notificationSyncActive ? "Synced" : "Paused"}
              </span>
            </div>
          </div>
          {totalUnreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {totalUnreadCount}
            </span>
          )}
        </div>
        <div className="max-h-48 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-3 text-sm text-blue-200/60">{getEmptyStateMessage()}</div>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-blue-500/10 cursor-pointer border-b border-blue-200/10 transition-colors ${
                  !notification.read ? "bg-blue-500/15" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2">
                  {(() => {
                    const visual = getNotificationVisual(notification.type);
                    const Icon = visual.icon;
                    return (
                      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${visual.iconClassName}`} />
                    );
                  })()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-blue-200/50 mt-1">{notification.time}</p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <button
          onClick={() => onNavigate("dashboard", "account")}
          className="w-full px-4 py-2 text-left bd-glass-control--secondary flex items-center space-x-2"
        >
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="text-sm">Account Settings</span>
        </button>

        {/* Customer-specific options */}
        {userType === "customer" && (
          <>
            <button
              onClick={() => onNavigate("vehicles")}
              className="w-full px-4 py-2 text-left bd-glass-control--utility flex items-center space-x-2"
            >
              <Car className="w-4 h-4 text-gray-500" />
              <span className="text-sm">My Vehicles</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard", "report")}
              className="w-full px-4 py-2 text-left bd-glass-control--secondary flex items-center space-x-2"
            >
              <Camera className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Submit Report</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard", "bids")}
              className="w-full px-4 py-2 text-left bd-glass-control--utility flex items-center space-x-2"
            >
              <FileCheck className="w-4 h-4 text-gray-500" />
              <span className="text-sm">My Bids</span>
            </button>
          </>
        )}

        {/* Shop-specific options */}
        {userType === "shop" && (
          <>
            <button
              onClick={() => onNavigate("dashboard", "requests")}
              className="w-full px-4 py-2 text-left bd-glass-control--secondary flex items-center space-x-2"
            >
              <ClipboardList className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Repair Requests</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard", "jobs")}
              className="w-full px-4 py-2 text-left bd-glass-control--utility flex items-center space-x-2"
            >
              <Wrench className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Active Jobs</span>
            </button>
          </>
        )}

        {/* Insurer-specific options */}
        {userType === "insurer" && (
          <>
            <button
              onClick={() => onNavigate("dashboard", "claims")}
              className="w-full px-4 py-2 text-left bd-glass-control--secondary flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Manage Claims</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard", "shops")}
              className="w-full px-4 py-2 text-left bd-glass-control--utility flex items-center space-x-2"
            >
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Partner Shops</span>
            </button>
          </>
        )}

        <button
          onClick={onLogout}
          className="w-full px-4 py-2 text-left bd-glass-control--utility flex items-center space-x-2 text-red-600 hover:bg-rose-50/60"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Log Out</span>
        </button>
      </div>
    </div>
  );
}
