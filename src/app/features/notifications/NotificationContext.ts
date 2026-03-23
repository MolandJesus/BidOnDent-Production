import { createContext, useContext } from "react";
import type { NotificationActions } from "./useNotificationEvents";

const NotificationContext = createContext<NotificationActions | null>(null);

export const NotificationProvider = NotificationContext.Provider;

export function useNotifications(): NotificationActions {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
