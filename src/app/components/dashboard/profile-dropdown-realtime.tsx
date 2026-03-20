import { useEffect, useState } from "react";
import { supabase } from "../../services/supabaseService";
import type { Notification } from "../../types";

type UseProfileDropdownRealtimeParams = {
  isOpen: boolean;
  notifications: Notification[];
  onNewNotification?: (notification: Notification) => void;
  userType: "customer" | "shop" | "insurer";
};

export function useProfileDropdownRealtime({
  isOpen,
  notifications,
  onNewNotification,
  userType,
}: UseProfileDropdownRealtimeParams) {
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<Notification[]>(notifications);

  useEffect(() => {
    if (!isOpen) return;

    const channels: any[] = [];

    if (userType === "shop") {
      const shopChannel = supabase
        .channel("shop-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "damage_reports",
          },
          (payload) => {
            const newReport = payload.new;
            const notification: Notification = {
              id: `repair-${newReport.id}-${Date.now()}`,
              message: `New repair request: ${newReport.vehicle_year} ${newReport.vehicle_make} ${newReport.vehicle_model}`,
              time: "Just now",
              read: false,
              type: "repair_request",
              reportData: newReport,
            };

            setLocalNotifications((prev) => [notification, ...prev]);
            if (onNewNotification) onNewNotification(notification);
            playNotificationSound();
          }
        )
        .subscribe((status) => {
          setRealtimeConnected(status === "SUBSCRIBED");
        });

      channels.push(shopChannel);
    } else if (userType === "customer") {
      const customerChannel = supabase
        .channel("customer-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "bids",
          },
          (payload) => {
            const newBid = payload.new;
            const notification: Notification = {
              id: `bid-${newBid.id}-${Date.now()}`,
              message: `New bid: $${newBid.amount} from ${newBid.shop_name || "Auto Shop"}`,
              time: "Just now",
              read: false,
              type: "bid",
              reportData: newBid,
            };

            setLocalNotifications((prev) => [notification, ...prev]);
            if (onNewNotification) onNewNotification(notification);
            playNotificationSound();
          }
        )
        .subscribe((status) => {
          setRealtimeConnected(status === "SUBSCRIBED");
        });

      channels.push(customerChannel);
    } else if (userType === "insurer") {
      const insurerChannel = supabase
        .channel("insurer-notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "damage_reports",
          },
          (payload) => {
            const newReport = payload.new;

            if (newReport.insurance_company) {
              const notification: Notification = {
                id: `claim-${newReport.id}-${Date.now()}`,
                message: `New claim filed: ${newReport.vehicle_year} ${newReport.vehicle_make} ${newReport.vehicle_model}`,
                time: "Just now",
                read: false,
                type: "claim",
                reportData: newReport,
              };

              setLocalNotifications((prev) => [notification, ...prev]);
              if (onNewNotification) onNewNotification(notification);
              playNotificationSound();
            }
          }
        )
        .subscribe((status) => {
          setRealtimeConnected(status === "SUBSCRIBED");
        });

      channels.push(insurerChannel);
    }

    return () => {
      channels.forEach((channel) => supabase.removeChannel(channel));
      setRealtimeConnected(false);
    };
  }, [userType, isOpen, onNewNotification]);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  return {
    localNotifications,
    realtimeConnected,
  };
}

function playNotificationSound() {
  try {
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Silently fail if browser blocks autoplay.
    });
  } catch {
    // Ignore audio failures.
  }
}
