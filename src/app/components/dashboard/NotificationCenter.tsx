import { useEffect, useRef } from "react";
import { Bell, Radio, Sparkles, X } from "lucide-react";
import { createPortal } from "react-dom";
import type { Notification } from "../../types";
import { getNotificationDestination, getNotificationVisual } from "./notification-utils";

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

type NotificationCenterProps = {
  isOpen: boolean;
  isLightAppearance?: boolean;
  userType: "customer" | "shop" | "insurer";
  notifications: Notification[];
  notificationSyncActive: boolean;
  activeReportsCount: number;
  anchorRect?: NotificationAnchorRect | null;
  headerOverlayRect?: NotificationHeaderRect | null;
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
  anchorRect = null,
  headerOverlayRect = null,
  onClose,
  onNavigate,
  onMarkNotificationRead,
  onMarkAllRead,
}: NotificationCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      panelRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
  const pageScrim =
    typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[60]"
            style={{
              background: isLightAppearance
                ? "linear-gradient(180deg, rgba(15, 23, 42, 0.16) 0%, rgba(15, 23, 42, 0.28) 100%)"
                : "linear-gradient(180deg, rgba(2, 6, 23, 0.30) 0%, rgba(2, 6, 23, 0.56) 100%)",
            }}
            onClick={onClose}
            aria-hidden="true"
          />,
          document.body
        )
      : null;
  const headerOverlay =
    typeof document !== "undefined" && headerOverlayRect
      ? createPortal(
          <div
            className="fixed z-[61]"
            style={{
              top: Math.max(0, headerOverlayRect.top - 8),
              left: headerOverlayRect.left,
              width: headerOverlayRect.width,
              height: headerOverlayRect.height + 72,
              borderRadius: headerOverlayRect.borderRadius,
              background: isLightAppearance
                ? "linear-gradient(180deg, rgba(15, 23, 42, 0.09) 0%, rgba(15, 23, 42, 0.14) 40%, rgba(15, 23, 42, 0.08) 68%, rgba(15, 23, 42, 0.00) 100%)"
                : "linear-gradient(180deg, rgba(2, 6, 23, 0.18) 0%, rgba(2, 6, 23, 0.26) 42%, rgba(2, 6, 23, 0.12) 70%, rgba(2, 6, 23, 0.00) 100%)",
              backdropFilter: "blur(6px) saturate(1.01)",
              WebkitBackdropFilter: "blur(6px) saturate(1.01)",
              maskImage:
                "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 46%, rgba(0,0,0,0.62) 74%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage:
                "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.96) 46%, rgba(0,0,0,0.62) 74%, rgba(0,0,0,0) 100%)",
              boxShadow: isLightAppearance
                ? "inset 0 1px 0 rgba(255, 255, 255, 0.12)"
                : "inset 0 1px 0 rgba(147, 197, 253, 0.04)",
              pointerEvents: "none",
            }}
            aria-hidden="true"
          />,
          document.body
        )
      : null;
  // KI-067: on mobile, anchor the panel near the bottom of the viewport
  // (with safe-area padding) so it lands within thumb-reach on tall phones.
  // Desktop position unchanged — still drops below the trigger.
  const panelPositionStyle =
    anchorRect && typeof window !== "undefined"
      ? isMobile
        ? {
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
            left: 8,
            right: 8,
          }
        : {
            top: anchorRect.bottom + 10,
            right: Math.max(8, window.innerWidth - anchorRect.right),
          }
      : isMobile
        ? {
            bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
            left: 8,
            right: 8,
          }
        : {
            top: 76,
            right: 8,
          };

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
    <>
      {pageScrim}
      {headerOverlay}
      {typeof document !== "undefined"
        ? createPortal(
            <div
              id="dashboard-notification-center"
              ref={panelRef}
              className="fixed z-[70] w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border max-md:w-auto"
              aria-label="Notification center"
              role="dialog"
              tabIndex={-1}
              style={{
                ...panelPositionStyle,
                // V3c parity with ProfileDropdown: alpha lowered + saturate
                // raised so the dashboard gold-lamp atmosphere reads through
                // the panel. Gold-as-light catchlights added on top + bottom
                // bezel inset so the panel feels lit, not painted.
                background: isLightAppearance
                  ? "linear-gradient(180deg, rgba(250, 252, 255, 0.86) 0%, rgba(238, 247, 255, 0.80) 100%)"
                  : "linear-gradient(180deg, rgba(11, 23, 47, 0.86) 0%, rgba(8, 18, 38, 0.80) 100%)",
                borderColor: isLightAppearance
                  ? "rgba(147, 197, 253, 0.42)"
                  : "rgba(96, 165, 250, 0.22)",
                boxShadow: isLightAppearance
                  ? // Light mode aligned to locked 2026-05-03 palette (KI-066).
                    // Phase 3 (2026-05-04): drop-shadow values aligned to
                    // ProfileDropdown's canonical stack (24px/56px/0.14 +
                    // 4px/12px/0.08) so the two top-bar dropdowns share the
                    // same chrome-coherent surface treatment.
                    "0 24px 56px rgba(15, 23, 42, 0.14), 0 4px 12px rgba(30, 58, 138, 0.08), inset 0 1px 0 rgba(252, 240, 208, 0.88), inset 0 -1px 0 rgba(140, 82, 22, 0.30), 0 0 0 1px rgba(140, 82, 22, 0.20), 0 0 0 1px rgba(191, 219, 254, 0.30), 0 0 36px rgba(196, 130, 45, 0.18)"
                  : // Dark popover shell aligned to locked palette (KI-066).
                    // Phase 3 (2026-05-04): close drop alpha tightened to 0.52
                    // matched + 4px/12px/0.32 mid-drop added per ProfileDropdown
                    // canonical stack — chrome-coherent two-dropdown surface.
                    "0 24px 56px rgba(2, 6, 23, 0.52), 0 4px 12px rgba(2, 6, 23, 0.32), 0 0 0 1px rgba(96, 165, 250, 0.20), inset 0 1px 0 rgba(196, 144, 65, 0.24), inset 0 -1px 0 rgba(140, 82, 22, 0.34), 0 0 36px rgba(37, 99, 235, 0.12), 0 0 50px rgba(196, 130, 45, 0.18)",
                backdropFilter: isLightAppearance
                  ? "blur(26px) saturate(1.5)"
                  : "blur(28px) saturate(1.5)",
                WebkitBackdropFilter: isLightAppearance
                  ? "blur(26px) saturate(1.5)"
                  : "blur(28px) saturate(1.5)",
              }}
            >
              {/* ── Mobile drag-handle (KI-067 reachability affordance) ── */}
              {isMobile ? (
                <div aria-hidden="true" className="flex items-center justify-center pt-2 pb-1">
                  <span
                    className={`block h-1 w-9 rounded-full ${
                      isLightAppearance ? "bg-[rgba(140,82,22,0.32)]" : "bg-[rgba(196,144,65,0.34)]"
                    }`}
                  />
                </div>
              ) : null}

              {/* ── Header ── */}
              <div
                className={`px-4 py-3 ${
                  isLightAppearance
                    ? "border-b border-[rgba(147,197,253,0.28)]"
                    : "border-b border-[rgba(96,165,250,0.14)]"
                }`}
              >
                {/* Top row: title + unread count + close */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        isLightAppearance
                          ? "bg-blue-50 text-blue-500"
                          : "bg-blue-500/12 text-blue-400"
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-semibold leading-none ${
                          isLightAppearance ? "text-slate-800" : "text-slate-100"
                        }`}
                      >
                        Notifications
                      </h3>
                      <p className="mt-1 text-[11px] leading-none text-slate-400">
                        {notificationSyncActive ? (
                          <span className="inline-flex items-center gap-1">
                            <Radio className="h-2.5 w-2.5 animate-pulse motion-reduce:animate-none text-blue-400" />
                            Live
                          </span>
                        ) : (
                          "Snapshot"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {unreadCount > 0 && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          isLightAppearance
                            ? "bg-blue-50 text-blue-600"
                            : "bg-blue-500/15 text-blue-300"
                        }`}
                      >
                        {unreadCount} unread
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className={`flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg transition ${
                        isLightAppearance
                          ? "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                          : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                      }`}
                      aria-label="Close notifications"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mark all read */}
                {unreadCount > 0 && (
                  <div className="mt-2.5 flex justify-end">
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition ${
                        isLightAppearance
                          ? "text-blue-600 hover:bg-blue-50"
                          : "text-blue-400/80 hover:bg-blue-500/10 hover:text-blue-300"
                      }`}
                    >
                      <Sparkles className="h-3 w-3" />
                      Mark all read
                    </button>
                  </div>
                )}
              </div>

              {/* ── Notification list ── */}
              <div className="max-h-[22rem] overflow-y-auto overscroll-contain max-md:max-h-[min(55vh,22rem)]">
                {notifications.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    {/* D9: empty-state icon plate carries gold-lamp identity to
                        match the sibling ProfileDropdown empty state (D8). Cool
                        blue body unchanged; warm inset bottom + warm halo only. */}
                    <div
                      className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl ${
                        isLightAppearance
                          ? // Light mode aligned to locked 2026-05-03 palette
                            // (KI-066): cream inset, bronze rim, outer halo
                            // tuned to rgba(196,130,45) per reconciled doctrine.
                            "bg-[linear-gradient(135deg,rgba(219,234,254,0.85)_0%,rgba(191,219,254,0.55)_100%)] shadow-[inset_0_1px_0_rgba(252,240,208,0.82),inset_0_-1px_0_rgba(140,82,22,0.26),0_0_0_1px_rgba(147,197,253,0.30),0_4px_14px_rgba(59,130,246,0.10),0_0_20px_rgba(196,130,45,0.16)]"
                          : // Dark empty-state plate aligned to locked palette (KI-066).
                            "bg-[linear-gradient(135deg,rgba(37,99,235,0.18)_0%,rgba(59,130,246,0.10)_100%)] shadow-[inset_0_1px_0_rgba(147,197,253,0.18),inset_0_-1px_0_rgba(140,82,22,0.32),0_0_0_1px_rgba(96,165,250,0.22),0_4px_18px_rgba(37,99,235,0.18),0_0_22px_rgba(196,130,45,0.20)]"
                      }`}
                    >
                      <Bell
                        className={`h-4.5 w-4.5 ${isLightAppearance ? "text-blue-600" : "text-blue-300"}`}
                      />
                    </div>
                    <p
                      className={`mt-3 text-sm font-medium ${isLightAppearance ? "text-slate-700" : "text-slate-300"}`}
                    >
                      No notifications yet
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Activity from your account will appear here.
                    </p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification, index) => {
                      const visual = getNotificationVisual(notification.type);
                      const Icon = visual.icon;
                      const isLast = index === notifications.length - 1;

                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => handleNotificationSelect(notification)}
                          className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                            !isLast
                              ? isLightAppearance
                                ? "border-b border-[rgba(147,197,253,0.18)]"
                                : "border-b border-[rgba(96,165,250,0.10)]"
                              : ""
                          } ${
                            notification.read
                              ? isLightAppearance
                                ? "hover:bg-slate-50/60"
                                : "hover:bg-white/[0.03]"
                              : isLightAppearance
                                ? "bg-blue-50/40 hover:bg-blue-50/60"
                                : "bg-blue-500/[0.06] hover:bg-blue-500/[0.10]"
                          }`}
                        >
                          <div
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isLightAppearance ? "bg-slate-50" : "bg-white/[0.04]"
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${visual.iconClassName}`} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${visual.badgeClassName}`}
                              >
                                {visual.label}
                              </span>
                              {!notification.read && (
                                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none" />
                              )}
                            </div>
                            <p
                              className={`mt-1.5 text-[13px] leading-snug ${
                                notification.read
                                  ? isLightAppearance
                                    ? "text-slate-500"
                                    : "text-slate-400"
                                  : isLightAppearance
                                    ? "text-slate-700"
                                    : "text-slate-200"
                              }`}
                            >
                              {notification.message}
                            </p>
                            <p
                              className={`mt-1 text-[11px] ${isLightAppearance ? "text-slate-400" : "text-slate-500"}`}
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
            </div>,
            document.body
          )
        : null}
    </>
  );
}
