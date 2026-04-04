import { useEffect } from "react";
import type { NotificationActions } from "../features/notifications/useNotificationEvents";
import type { useNavigation } from "./useNavigation";

type Navigation = ReturnType<typeof useNavigation>;

/**
 * Registers the deep link navigation handler on the notification system.
 * Maps NotificationDeepLink.screen values to navigation actions.
 * Extracted from App.tsx to keep the root component under the 500-line cap.
 */
export function useDeepLinkNavigation(
  notifications: Pick<NotificationActions, "setDeepLinkHandler">,
  navigation: Navigation
): void {
  useEffect(() => {
    notifications.setDeepLinkHandler((deepLink) => {
      if (!deepLink) return;
      switch (deepLink.screen) {
        case "dashboard":
          navigation.setViewMode("dashboard");
          break;
        case "report":
          navigation.setSelectedReportId(deepLink.reportId);
          navigation.setViewMode("report-detail");
          break;
        case "bid":
          navigation.setCurrentTab("bids");
          navigation.setViewMode("dashboard");
          break;
        case "shop":
          navigation.setViewMode("shop-directory");
          break;
        case "shop-directory":
          navigation.setViewMode("shop-directory");
          break;
        case "estimates":
          navigation.setCurrentTab("estimates");
          navigation.setViewMode("dashboard");
          break;
        case "navigation":
          navigation.setViewMode("shop-directory");
          break;
      }
    });
    return () => notifications.setDeepLinkHandler(null);
  }, [notifications, navigation]);
}
