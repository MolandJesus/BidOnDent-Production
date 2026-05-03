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
import type { Notification, Report } from "../../types";
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
  forwardedRef: RefObject<HTMLDivElement>;
  // Account-specific data props
  reports?: Report[];
  vehicles?: { id?: string; make: string; model: string; year: string | number }[];
  bids?: { id?: string; shopRating?: number }[];
  variant?: "popover" | "embedded";
  isLightAppearance?: boolean;
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
  isLightAppearance = false,
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
        ? report.bids.map((bid: { shopName?: string }) => bid?.shopName).filter(Boolean)
        : []
    )
  ).size;
  const insurerBidCount = reportList.reduce(
    (count, report) => count + (Array.isArray(report?.bids) ? report.bids.length : 0),
    0
  );

  const totalUnreadCount = notifications.filter((n) => !n.read).length;

  const getEmptyStateMessage = () => {
    const helperTextClassName = isLightAppearance ? "text-slate-400" : "text-blue-200/50";

    if (!notificationSyncActive) {
      return (
        <div className="flex flex-col gap-1">
          <span>No notifications yet</span>
          <span className={`text-xs ${helperTextClassName}`}>Background refresh is paused.</span>
        </div>
      );
    }

    switch (userType) {
      case "shop":
        return (
          <div className="flex flex-col gap-1">
            <span>No notifications yet</span>
            <span className={`text-xs ${helperTextClassName}`}>
              Refreshes every 15 seconds for new repair requests.
            </span>
          </div>
        );
      case "customer":
        return (
          <div className="flex flex-col gap-1">
            <span>No notifications yet</span>
            <span className={`text-xs ${helperTextClassName}`}>
              Refreshes every 15 seconds for bids on your reports.
            </span>
          </div>
        );
      case "insurer":
        return (
          <div className="flex flex-col gap-1">
            <span>No notifications yet</span>
            <span className={`text-xs ${helperTextClassName}`}>
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
      ? `w-full bd-glass-card${isLightAppearance ? " bd-light-surface" : ""}`
      : `absolute right-0 mt-2 w-80 bd-glass-floating z-50${isLightAppearance ? " bd-light-surface" : ""}`;

  return (
    <div
      ref={forwardedRef}
      aria-label="Profile panel"
      className={`${containerClasses} ${isLightAppearance ? "text-slate-800" : "text-slate-200"}`}
      role="region"
      style={{
        // V3c (2026-05-03): body alpha lowered so the dashboard gold-lamp
        // atmosphere reads through the glass — was 0.97/0.94 (effectively
        // opaque, no glass identity in light mode per Sonnet's audit). Now
        // 0.86/0.80 light, 0.86/0.80 dark with backdrop-blur kept saturated.
        // Champagne top bezel + amber bottom-edge inset added so the panel
        // catches light at its boundaries (gold-as-light, not gold-paint).
        background: isLightAppearance
          ? "linear-gradient(180deg, rgba(250, 252, 255, 0.86) 0%, rgba(238, 247, 255, 0.80) 100%)"
          : "linear-gradient(180deg, rgba(11, 23, 47, 0.86) 0%, rgba(8, 18, 38, 0.80) 100%)",
        borderColor: isLightAppearance ? "rgba(147, 197, 253, 0.42)" : "rgba(96, 165, 250, 0.26)",
        backdropFilter: isLightAppearance ? "blur(26px) saturate(1.5)" : "blur(28px) saturate(1.5)",
        WebkitBackdropFilter: isLightAppearance
          ? "blur(26px) saturate(1.5)"
          : "blur(28px) saturate(1.5)",
        boxShadow: isLightAppearance
          ? // Light mode aligned to locked 2026-05-03 palette (KI-066): cream
            // inset replaces white, bronze rim/ring (140,82,22), top/corner
            // halo (196,144,65), outer halo (196,130,45).
            "0 24px 56px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(30, 58, 138, 0.08), inset 0 1px 0 rgba(252, 240, 208, 0.88), inset 0 -1px 0 rgba(140, 82, 22, 0.30), 0 0 0 1px rgba(140, 82, 22, 0.20), 0 0 0 1px rgba(191, 219, 254, 0.30), 0 0 36px rgba(196, 130, 45, 0.18)"
          : // Dark mode aligned to locked 2026-05-03 palette (KI-066):
            // top/corner lamp (196,144,65) + bronze rim (140,82,22) +
            // deeper outer warm halo (196,130,45). Cool blue ring + drop
            // shadows preserved.
            "0 24px 56px rgba(2, 6, 23, 0.52), 0 4px 12px rgba(2, 6, 23, 0.32), 0 0 0 1px rgba(96, 165, 250, 0.20), inset 0 1px 0 rgba(196, 144, 65, 0.24), inset 0 -1px 0 rgba(140, 82, 22, 0.34), 0 0 36px rgba(37, 99, 235, 0.12), 0 0 50px rgba(196, 130, 45, 0.18)",
      }}
    >
      {/* Profile Header */}
      <div
        className={`p-4 border-b ${isLightAppearance ? "border-blue-200/35" : "border-blue-400/15"}`}
      >
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
            <p
              className={`text-sm truncate ${isLightAppearance ? "text-slate-500" : "text-blue-200/60"}`}
            >
              {userInfo.email}
            </p>
            <span
              className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${isLightAppearance ? "bg-blue-100 text-blue-600" : "bg-blue-500/25 text-blue-300"}`}
            >
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
        isLightAppearance={isLightAppearance}
      />

      {/* Notifications Section */}
      <div
        className={`border-b ${isLightAppearance ? "border-blue-200/35" : "border-blue-400/15"}`}
      >
        <div
          className={`px-4 py-2 font-semibold text-sm flex items-center justify-between ${isLightAppearance ? "bg-blue-50/55" : "bg-white/5"}`}
        >
          <div className="flex items-center gap-2">
            <span className={isLightAppearance ? "text-slate-700" : "text-slate-200"}>
              Notifications
            </span>
            <div className="flex items-center gap-1">
              <Radio
                className={`w-3 h-3 ${notificationSyncActive ? "text-green-500 animate-pulse" : "text-gray-400"}`}
              />
              <span
                className={`text-xs ${notificationSyncActive ? (isLightAppearance ? "text-green-600" : "text-green-400") : isLightAppearance ? "text-slate-400" : "text-blue-200/50"}`}
                role="status"
              >
                {notificationSyncActive ? "Refresh on" : "Refresh paused"}
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
            <div
              className={`px-4 py-5 text-sm flex flex-col items-center text-center gap-2 ${isLightAppearance ? "text-slate-500" : "text-blue-200/60"}`}
            >
              {/* D8: lit-glass icon plate so the empty state reads as designed
                  surface, not plain text. Cool blue body + warm halo trim. */}
              <div
                aria-hidden="true"
                className={`w-9 h-9 rounded-2xl flex items-center justify-center ${isLightAppearance ? "bg-blue-500/[0.08] border border-blue-300/[0.28]" : "bg-blue-500/[0.10] border border-blue-400/[0.24]"}`}
                style={{
                  boxShadow: isLightAppearance
                    ? // Light empty-state plate aligned to locked palette (KI-066).
                      "inset 0 1px 0 rgba(252,240,208,0.78), inset 0 -1px 0 rgba(140,82,22,0.26), 0 0 18px rgba(196,130,45,0.16)"
                    : // Dark empty-state plate aligned to locked palette (KI-066).
                      "inset 0 1px 0 rgba(147,197,253,0.20), inset 0 -1px 0 rgba(140,82,22,0.32), 0 0 20px rgba(196,130,45,0.20)",
                }}
              >
                <Bell
                  className={`w-4 h-4 ${isLightAppearance ? "text-blue-500/70" : "text-blue-200/70"}`}
                />
              </div>
              {getEmptyStateMessage()}
            </div>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <button
                key={notification.id}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  isLightAppearance
                    ? `border-b border-slate-200/50 hover:bg-slate-50/80 ${!notification.read ? "bg-blue-50/60" : ""}`
                    : `border-b border-blue-200/10 hover:bg-blue-500/10 ${!notification.read ? "bg-blue-500/15" : ""}`
                }`}
                onClick={() => handleNotificationClick(notification)}
                type="button"
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
                    <p
                      className={`text-sm font-medium truncate ${isLightAppearance ? "text-slate-700" : "text-slate-200"}`}
                    >
                      {notification.message}
                    </p>
                    <p
                      className={`text-xs mt-1 ${isLightAppearance ? "text-slate-400" : "text-blue-200/50"}`}
                    >
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <button
          onClick={() => onNavigate("dashboard", "account")}
          className={`w-full px-4 py-2.5 text-left flex items-center space-x-2 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/80" : "text-blue-100/90 hover:bg-white/[0.06]"}`}
          type="button"
        >
          <Settings
            className={`w-4 h-4 ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
          />
          <span className="text-sm">Account Settings</span>
        </button>

        {/* Customer-specific options */}
        {userType === "customer" && (
          <>
            <button
              onClick={() => onNavigate("vehicles")}
              className={`w-full px-4 py-2.5 text-left flex items-center space-x-2 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/80" : "text-blue-100/90 hover:bg-white/[0.06]"}`}
              type="button"
            >
              <Car
                className={`w-4 h-4 ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
              />
              <span className="text-sm">My Vehicles</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard", "report")}
              className={`w-full px-4 py-2.5 text-left flex items-center space-x-2 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/80" : "text-blue-100/90 hover:bg-white/[0.06]"}`}
              type="button"
            >
              <Camera
                className={`w-4 h-4 ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
              />
              <span className="text-sm">Submit Report</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard", "bids")}
              className={`w-full px-4 py-2.5 text-left flex items-center space-x-2 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/80" : "text-blue-100/90 hover:bg-white/[0.06]"}`}
              type="button"
            >
              <FileCheck
                className={`w-4 h-4 ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
              />
              <span className="text-sm">My Bids</span>
            </button>
          </>
        )}

        {/* Shop-specific options */}
        {userType === "shop" && (
          <>
            <button
              onClick={() => onNavigate("dashboard", "requests")}
              className={`w-full px-4 py-2.5 text-left flex items-center space-x-2 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/80" : "text-blue-100/90 hover:bg-white/[0.06]"}`}
              type="button"
            >
              <ClipboardList
                className={`w-4 h-4 ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
              />
              <span className="text-sm">Repair Requests</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard", "jobs")}
              className={`w-full px-4 py-2.5 text-left flex items-center space-x-2 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/80" : "text-blue-100/90 hover:bg-white/[0.06]"}`}
              type="button"
            >
              <Wrench
                className={`w-4 h-4 ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
              />
              <span className="text-sm">Active Jobs</span>
            </button>
          </>
        )}

        {/* Insurer-specific options */}
        {userType === "insurer" && (
          <>
            <button
              onClick={() => onNavigate("dashboard", "claims")}
              className={`w-full px-4 py-2.5 text-left flex items-center space-x-2 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/80" : "text-blue-100/90 hover:bg-white/[0.06]"}`}
              type="button"
            >
              <FileText
                className={`w-4 h-4 ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
              />
              <span className="text-sm">Manage Claims</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard", "shops")}
              className={`w-full px-4 py-2.5 text-left flex items-center space-x-2 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/80" : "text-blue-100/90 hover:bg-white/[0.06]"}`}
              type="button"
            >
              <Building2
                className={`w-4 h-4 ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
              />
              <span className="text-sm">Partner Shops</span>
            </button>
          </>
        )}

        <button
          onClick={onLogout}
          className={`w-full px-4 py-2.5 text-left flex items-center space-x-2 transition-colors text-red-500 ${isLightAppearance ? "hover:bg-rose-50" : "hover:bg-rose-500/10"}`}
          type="button"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Log Out</span>
        </button>
      </div>
    </div>
  );
}
