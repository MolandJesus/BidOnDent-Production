import { Bell, Radio, Sparkles } from "lucide-react";
import type { Notification } from "../../types";
import { getNotificationDestination, getNotificationVisual } from "./notification-utils";

type NotificationCenterProps = {
  isOpen: boolean;
  isLightAppearance?: boolean;
  userType: "customer" | "shop" | "insurer";
  notifications: Notification[];
  notificationSyncActive: boolean;
  activeReportsCount: number;
  onClose: () => void;
  onNavigate: (destination: string, tab?: string) => void;
  onMarkNotificationRead: (notificationId: string | number) => void;
  onMarkAllRead: () => void;
};

export default function NotificationCenter({
  isOpen,
  isLightAppearance = false,
  userType,
  notifications,
  notificationSyncActive,
  activeReportsCount,
  onClose,
  onNavigate,
  onMarkNotificationRead,
  onMarkAllRead,
}: NotificationCenterProps) {
  if (!isOpen) {
    return null;
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const handleNotificationSelect = (notification: Notification) => {
    onMarkNotificationRead(notification.id);

    if (userType === "customer" && notification.type === "bid" && activeReportsCount === 0) {
      onNavigate("dashboard", "report");
      onClose();
      return;
    }

    const destinationTab = getNotificationDestination(notification, userType);
    if (destinationTab) {
      onNavigate("dashboard", destinationTab);
    }

    onClose();
  };

  return (
    <div
      className={`absolute right-0 mt-2 w-[min(24rem,calc(100vw-1rem))] overflow-hidden rounded-2xl bd-glass-floating z-[70] max-md:fixed max-md:left-2 max-md:right-2 max-md:w-auto max-md:mt-0 max-md:top-[calc(env(safe-area-inset-top)+3.9rem)]${isLightAppearance ? " bd-light-surface" : ""}`}
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(241,245,249,0.95) 100%)"
          : "linear-gradient(180deg, rgba(18, 36, 60, 0.97) 0%, rgba(12, 25, 41, 0.93) 100%)",
        borderColor: isLightAppearance ? "rgba(148,163,184,0.30)" : "rgba(96, 165, 250, 0.24)",
        boxShadow: isLightAppearance
          ? "0 24px 90px rgba(15,23,42,0.15), 0 0 40px rgba(59,130,246,0.04), inset 0 1px 0 rgba(255,255,255,0.5)"
          : "0 24px 90px rgba(2, 6, 23, 0.5), 0 0 40px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(147, 197, 253, 0.1)",
      }}
    >
      <div
        className={`border-b px-4 py-3.5 ${
          isLightAppearance
            ? "border-slate-200/60 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.06),_transparent_60%)]"
            : "border-blue-200/25 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_60%)]"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div
              className={`inline-flex items-center gap-2 rounded-full border backdrop-blur-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${
                isLightAppearance
                  ? "border-blue-200/40 bg-blue-50/80 text-blue-600"
                  : "border-blue-300/25 bg-slate-800/50 text-blue-300"
              }`}
            >
              <Bell
                className={`h-3.5 w-3.5 ${isLightAppearance ? "text-blue-500" : "text-blue-400"}`}
              />
              Notification Center
            </div>
            <h3
              className={`mt-2.5 text-base font-semibold ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
            >
              Account activity
            </h3>
            <p
              className={`mt-1 text-xs ${isLightAppearance ? "text-slate-500" : "text-blue-200/65"}`}
            >
              Track bids, repair intake, and workflow updates from shared background refresh.
            </p>
          </div>

          <div
            className={`rounded-xl border backdrop-blur-sm px-2.5 py-1.5 text-right ${
              isLightAppearance
                ? "border-slate-200/60 bg-white/70"
                : "border-blue-300/25 bg-slate-800/40"
            }`}
          >
            <div
              className={`text-xs uppercase tracking-[0.24em] ${isLightAppearance ? "text-slate-400" : "text-blue-300/60"}`}
            >
              Unread
            </div>
            <div
              className={`mt-0.5 text-xl font-semibold ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
            >
              {unreadCount}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div
            className={`inline-flex items-center gap-2 rounded-full border backdrop-blur-sm px-3 py-1.5 text-xs ${
              isLightAppearance
                ? "border-slate-200/50 bg-white/60 text-slate-500"
                : "border-blue-200/20 bg-slate-800/40 text-blue-200/80"
            }`}
          >
            <Radio
              className={`h-3.5 w-3.5 ${notificationSyncActive ? "animate-pulse text-blue-500" : "text-slate-400"}`}
            />
            {notificationSyncActive ? "Background refresh on" : "Saved snapshot only"}
          </div>

          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isLightAppearance
                ? "border-slate-200/60 text-slate-500 hover:border-blue-300/50 hover:text-blue-600"
                : "border-blue-300/25 text-slate-300 hover:border-blue-400/50 hover:text-blue-300"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="max-h-[24rem] overflow-y-auto max-md:max-h-[min(58vh,24rem)]">
        {notifications.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${
                isLightAppearance ? "bg-blue-50" : "bg-blue-500/20"
              }`}
            >
              <Bell
                className={`h-5 w-5 ${isLightAppearance ? "text-blue-500" : "text-blue-400"}`}
              />
            </div>
            <h4
              className={`mt-4 text-sm font-semibold ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
            >
              No alerts yet
            </h4>
            <p
              className={`mt-1 text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-200/60"}`}
            >
              New workflow activity will appear here as your account starts receiving updates.
            </p>
          </div>
        ) : (
          <div
            className={`divide-y ${isLightAppearance ? "divide-slate-200/50" : "divide-blue-200/12"}`}
          >
            {notifications.map((notification) => {
              const visual = getNotificationVisual(notification.type);
              const Icon = visual.icon;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationSelect(notification)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                    notification.read
                      ? isLightAppearance
                        ? "bg-transparent hover:bg-slate-50/80"
                        : "bg-transparent hover:bg-blue-500/10"
                      : isLightAppearance
                        ? "bg-blue-50/60 hover:bg-blue-50"
                        : "bg-blue-500/15 hover:bg-blue-500/10"
                  }`}
                >
                  <div
                    className={`mt-0.5 rounded-2xl p-2 ${isLightAppearance ? "bg-blue-50" : "bg-blue-300/10"}`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${visual.iconClassName}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${visual.badgeClassName}`}
                      >
                        {visual.label}
                      </span>
                      {!notification.read ? (
                        <span className="inline-flex h-2 w-2 rounded-full bg-blue-500" />
                      ) : null}
                    </div>
                    <p
                      className={`mt-2 text-sm font-medium ${isLightAppearance ? "text-slate-700" : "text-slate-200"}`}
                    >
                      {notification.message}
                    </p>
                    <p
                      className={`mt-1 text-xs ${isLightAppearance ? "text-slate-400" : "text-blue-200/50"}`}
                    >
                      {notification.time}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
