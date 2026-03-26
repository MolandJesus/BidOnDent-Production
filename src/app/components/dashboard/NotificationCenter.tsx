import { Bell, Radio, Sparkles } from "lucide-react";
import type { Notification } from "../../types";
import { getNotificationDestination, getNotificationVisual } from "./notification-utils";

type NotificationCenterProps = {
  isOpen: boolean;
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
      className="absolute right-0 mt-2 w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-3xl bd-glass-floating z-50"
      style={{
        background:
          "linear-gradient(180deg, rgba(18, 36, 60, 0.97) 0%, rgba(12, 25, 41, 0.93) 100%)",
        borderColor: "rgba(96, 165, 250, 0.24)",
        boxShadow:
          "0 24px 90px rgba(2, 6, 23, 0.5), 0 0 40px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(147, 197, 253, 0.1)",
      }}
    >
      <div className="border-b border-blue-200/30 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_60%)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 bg-slate-800/50 backdrop-blur-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-300">
              <Bell className="h-3.5 w-3.5 text-blue-400" />
              Notification Center
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-100">Account activity</h3>
            <p className="mt-1 text-sm text-blue-200/60">
              Track bids, repair intake, and workflow updates from shared background refresh.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-300/25 bg-slate-800/40 backdrop-blur-sm px-3 py-2 text-right">
            <div className="text-xs uppercase tracking-[0.24em] text-blue-300/60">Unread</div>
            <div className="mt-1 text-2xl font-semibold text-slate-100">{unreadCount}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/20 bg-slate-800/40 backdrop-blur-sm px-3 py-1.5 text-xs text-blue-200/80">
            <Radio
              className={`h-3.5 w-3.5 ${notificationSyncActive ? "animate-pulse text-blue-500" : "text-slate-400"}`}
            />
            {notificationSyncActive ? "Background refresh on" : "Saved snapshot only"}
          </div>

          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 rounded-full border border-blue-300/25 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-blue-400/50 hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="max-h-[28rem] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20">
              <Bell className="h-5 w-5 text-blue-400" />
            </div>
            <h4 className="mt-4 text-sm font-semibold text-slate-100">No alerts yet</h4>
            <p className="mt-1 text-sm text-blue-200/60">
              New workflow activity will appear here as your account starts receiving updates.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-blue-200/15">
            {notifications.map((notification) => {
              const visual = getNotificationVisual(notification.type);
              const Icon = visual.icon;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationSelect(notification)}
                  className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-blue-500/10 ${
                    notification.read ? "bg-transparent" : "bg-blue-500/15"
                  }`}
                >
                  <div className="mt-0.5 rounded-2xl bg-blue-300/10 p-2">
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
                    <p className="mt-2 text-sm font-medium text-slate-200">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-blue-200/50">{notification.time}</p>
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
