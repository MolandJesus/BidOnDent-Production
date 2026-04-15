import { useState, useEffect, useCallback } from "react";
import { getAllDamageReports } from "../services/supabase/reports";
import { useNotifications } from "../features/notifications/NotificationContext";
import type { DamageReport } from "../types";

/**
 * Fetches all damage reports from Supabase for marketplace views
 * (shop requests, insurer claims). Falls back to empty array on failure.
 */
export function useMarketplaceReports(userType: string) {
  const [marketplaceReports, setMarketplaceReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notifications = useNotifications();

  const showErrorToast = useCallback(() => {
    notifications.showToast({
      message: "Unable to load requests. Please check your connection and try again.",
      variant: "error",
      durationMs: 4000,
      deepLink: null,
    });
  }, [notifications]);

  const fetchReports = useCallback(async () => {
    if (userType !== "shop" && userType !== "insurer") return;
    setLoading(true);
    setError(null);
    try {
      const raw = await getAllDamageReports();
      const reports = Array.isArray(raw) ? raw : [];
      setMarketplaceReports(reports);
    } catch {
      setError("Unable to load live data — showing demo requests");
      showErrorToast();
    } finally {
      setLoading(false);
    }
  }, [userType, showErrorToast]);

  useEffect(() => {
    if (userType !== "shop" && userType !== "insurer") return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await getAllDamageReports();
        if (!cancelled) {
          const reports = Array.isArray(raw) ? raw : [];
          setMarketplaceReports(reports);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load live data — showing demo requests");
          showErrorToast();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userType, showErrorToast]);

  return { marketplaceReports, loading, error, refetch: fetchReports };
}
