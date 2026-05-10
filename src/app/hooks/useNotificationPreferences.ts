import { useCallback, useEffect, useRef, useState } from "react";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from "../services/supabase/notificationPreferences";

const DEFAULT_PREFERENCES: NotificationPreferences = {
  id: "local-default",
  clerk_user_id: "",
  in_app_bid_updates: true,
  in_app_report_updates: true,
  in_app_nearby_reports: true,
  in_app_estimate_updates: true,
  email_bid_updates: true,
  email_report_updates: true,
  email_nearby_reports: false,
  email_estimate_updates: false,
  sms_bid_updates: false,
  sms_report_updates: false,
  email_enabled: true,
  sms_enabled: false,
  share_data_with_shops: true,
  show_profile_to_insurers: false,
};

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // Pass 83 (2026-05-07) — KI-138 client gap: surface to the UI when the
  // initial GET failed and the user is editing local defaults rather than
  // their persisted preferences. The optimistic-save path will keep retrying
  // on every toggle, but the user deserves to know the source of truth is
  // local-only until the next successful round-trip.
  const [isUsingDefaults, setIsUsingDefaults] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isRemote = useRef(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    setLoadError(null);

    getNotificationPreferences()
      .then((prefs) => {
        if (mounted) {
          isRemote.current = true;
          setPreferences(prefs);
          setIsUsingDefaults(false);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          // Fall back to local defaults so the UI is always interactive
          isRemote.current = false;
          setPreferences({ ...DEFAULT_PREFERENCES });
          setIsUsingDefaults(true);
          setLoadError(err instanceof Error ? err.message : "Failed to load");
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  const update = useCallback(
    async (updates: Partial<Omit<NotificationPreferences, "id" | "clerk_user_id">>) => {
      // Optimistic update — always applies locally
      setPreferences((prev) => (prev ? { ...prev, ...updates } : prev));

      // Always attempt the remote save. The previous behavior gated on
      // isRemote.current (set only by a successful initial GET), which meant
      // any first-load 500 silently swallowed every subsequent save.
      setIsSaving(true);
      try {
        const updated = await updateNotificationPreferences(updates);
        isRemote.current = true;
        setPreferences(updated);
        setError(null);
        setIsUsingDefaults(false);
        setLoadError(null);
      } catch (err) {
        // Preserve the optimistic local state — better to keep the user's
        // intent visible than to revert to stale defaults.
        setError(err instanceof Error ? err.message : "Failed to save");
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  return { preferences, isLoading, isSaving, error, update, isUsingDefaults, loadError, reload };
}
