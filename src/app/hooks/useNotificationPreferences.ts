import { useCallback, useEffect, useState } from "react";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from "../services/supabase/notificationPreferences";

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    getNotificationPreferences()
      .then((prefs) => {
        if (mounted) {
          setPreferences(prefs);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load preferences");
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const update = useCallback(
    async (updates: Partial<Omit<NotificationPreferences, "id" | "clerk_user_id">>) => {
      // Optimistic update
      setPreferences((prev) => (prev ? { ...prev, ...updates } : prev));
      setIsSaving(true);

      try {
        const updated = await updateNotificationPreferences(updates);
        setPreferences(updated);
      } catch (err) {
        // Revert on failure — refetch
        try {
          const fresh = await getNotificationPreferences();
          setPreferences(fresh);
        } catch {
          // ignore refetch error
        }
        setError(err instanceof Error ? err.message : "Failed to save");
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return { preferences, isLoading, isSaving, error, update };
}
