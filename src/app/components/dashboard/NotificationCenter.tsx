import { Bell, Radio, Sparkles } from "lucide-react";
import type { Notification } from "../../types";
import { getNotificationDestination, getNotificationVisual } from "./notification-utils";
import { useProfileDropdownRealtime } from "./profile-dropdown-realtime";

type NotificationCenterProps = {
  isOpen: boolean;
  userType: "customer" | "shop" | "insurer";
  notifications: Notification[];
  activeReportsCount: number;
  onClose: () => void;
  onNavigate: (destination: string, tab?: string) => void;
  onNewNotification: (notification: Notification) => void;
  onMarkNotificationRead: (notificationId: string | number) => void;
  onMarkAllRead: () => void;
};

export default function NotificationCenter({
  isOpen,
  userType,
  notifications,
  activeReportsCount,
  onClose,
  onNavigate,
  onNewNotification,
  onMarkNotificationRead,
  onMarkAllRead,
}: NotificationCenterProps) {
  const { realtimeConnected, localNotifications } = useProfileDropdownRealtime({
    isOpen,
    notifications,
    onNewNotification,
    userType,
  });

  if (!isOpen) {
    return null;
  }

  const unreadCount = localNotifications.filter((notification) => !notification.read).length;

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
    <div className="absolute right-0 mt-2 w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.18)] z-50">
      <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_60%)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              <Bell className="h-3.5 w-3.5 text-blue-600" />
              Notification Center
            </div>
            <h3 className="mt-3 text-lg font-semibold text-slate-950">Live account activity</h3>
            <p className="mt-1 text-sm text-slate-500">
              Track bids, repair intake, and workflow updates without leaving the page.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-right">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Unread</div>
            <div className="mt-1 text-2xl font-semibold text-slate-950">{unreadCount}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600">
            <Radio
              className={`h-3.5 w-3.5 ${realtimeConnected ? "animate-pulse text-emerald-500" : "text-slate-400"}`}
            />
            {realtimeConnected ? "Live updates active" : "Polling from saved activity"}
          </div>

          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="max-h-[28rem] overflow-y-auto">
        {localNotifications.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Bell className="h-5 w-5 text-slate-500" />
            </div>
            <h4 className="mt-4 text-sm font-semibold text-slate-900">No alerts yet</h4>
            <p className="mt-1 text-sm text-slate-500">
              New workflow activity will appear here as your account starts receiving updates.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {localNotifications.map((notification) => {
              const visual = getNotificationVisual(notification.type);
              const Icon = visual.icon;

              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationSelect(notification)}
                  className={`flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-slate-50 ${
                    notification.read ? "bg-white" : "bg-blue-50/60"
                  }`}
                >
                  <div className="mt-0.5 rounded-2xl bg-slate-950/4 p-2">
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
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{notification.time}</p>
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
