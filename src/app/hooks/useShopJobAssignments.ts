import { useCallback, useEffect, useState } from "react";
import { getJobAssignments } from "../services/supabase/workflow";
import type { JobAssignment } from "../types";
import { useNotifications } from "../features/notifications/NotificationContext";

export function useShopJobAssignments(shopClerkUserId: string | null | undefined) {
  const [jobs, setJobs] = useState<JobAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const notifications = useNotifications();

  const refresh = useCallback(async () => {
    if (!shopClerkUserId) return;
    setIsLoading(true);
    try {
      const result = await getJobAssignments(shopClerkUserId);
      setJobs(result);
    } catch {
      notifications.showToast({
        message: "Unable to load jobs. Please check your connection and try again.",
        variant: "error",
        durationMs: 4000,
        deepLink: null,
      });
    } finally {
      setIsLoading(false);
    }
  }, [shopClerkUserId, notifications]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { jobs, isLoading, refresh };
}
