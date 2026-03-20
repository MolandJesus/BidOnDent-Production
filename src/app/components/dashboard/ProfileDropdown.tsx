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
  DollarSign,
  Radio,
  AlertCircle,
  Bell,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { LANDING_PAGE_IMAGES } from "../../constants";
import type { Notification } from "../../types";
import { getNotificationDestination, getNotificationVisual } from "./notification-utils";

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
      ? "w-full bg-white rounded-xl border border-slate-200 shadow-sm"
      : "absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50";

  return (
    <div ref={forwardedRef} className={containerClasses}>
      {/* Profile Header */}
      <div className="p-4 border-b border-gray-200">
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
            <p className="text-sm text-gray-500 truncate">{userInfo.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium capitalize">
              {userType}
            </span>
          </div>
        </div>
      </div>

      {/* Account-Specific Stats Section */}
      {userType === "customer" && (
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="font-bold text-lg text-gray-900">{reports?.length || 0}</div>
              <div className="text-xs text-gray-600">Reports</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Car className="w-4 h-4 text-blue-600" />
              </div>
              <div className="font-bold text-lg text-gray-900">{vehicles?.length || 0}</div>
              <div className="text-xs text-gray-600">Vehicles</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div className="font-bold text-lg text-gray-900">{bids?.length || 0}</div>
              <div className="text-xs text-gray-600">Bids</div>
            </div>
          </div>
        </div>
      )}

      {userType === "shop" && (
        <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <ClipboardList className="w-4 h-4 text-orange-600" />
              </div>
              <div className="font-bold text-lg text-gray-900">{shopRequestsCount}</div>
              <div className="text-xs text-gray-600">Requests</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Wrench className="w-4 h-4 text-orange-600" />
              </div>
              <div className="font-bold text-lg text-gray-900">{shopBidCount}</div>
              <div className="text-xs text-gray-600">Submitted Bids</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Award className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="font-bold text-lg text-gray-900">{shopAverageRating}</div>
              <div className="text-xs text-gray-600">Rating</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-orange-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span>
                Tracked bids:{" "}
                <span className="font-semibold text-gray-900">{shopBidCount}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {userType === "insurer" && (
        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div className="font-bold text-lg text-gray-900">{reportList.length}</div>
              <div className="text-xs text-gray-600">Active Claims</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="font-bold text-lg text-gray-900">{insurerPartnerShops}</div>
              <div className="text-xs text-gray-600">Partner Shops</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div className="font-bold text-lg text-gray-900">{insurerResolvedClaims}</div>
              <div className="text-xs text-gray-600">Resolved</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-purple-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>
                Tracked bids:{" "}
                <span className="font-semibold text-gray-900">{insurerBidCount}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Section */}
      <div className="border-b border-gray-200">
        <div className="px-4 py-2 bg-gray-50 font-semibold text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Notifications</span>
            <div className="flex items-center gap-1">
              <Radio
                className={`w-3 h-3 ${notificationSyncActive ? "text-green-500 animate-pulse" : "text-gray-400"}`}
              />
              <span
                className={`text-xs ${notificationSyncActive ? "text-green-600" : "text-gray-500"}`}
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
            <div className="px-4 py-3 text-sm text-gray-500">{getEmptyStateMessage()}</div>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${
                  !notification.read ? "bg-blue-50" : ""
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
                    <p className="text-sm font-medium truncate">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
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
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
        >
          <Settings className="w-4 h-4 text-gray-500" />
          <span className="text-sm">Account Settings</span>
        </button>

        {/* Customer-specific options */}
        {userType === "customer" && (
          <>
            <button
              onClick={() => onNavigate("vehicles")}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
            >
              <Car className="w-4 h-4 text-gray-500" />
              <span className="text-sm">My Vehicles</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard", "report")}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
            >
              <Camera className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Submit Report</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard", "bids")}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
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
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
            >
              <ClipboardList className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Repair Requests</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard", "jobs")}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
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
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Manage Claims</span>
            </button>
            <button
              onClick={() => onNavigate("dashboard", "shops")}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
            >
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Partner Shops</span>
            </button>
          </>
        )}

        <button
          onClick={onLogout}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-red-600"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Log Out</span>
        </button>
      </div>
    </div>
  );
}
