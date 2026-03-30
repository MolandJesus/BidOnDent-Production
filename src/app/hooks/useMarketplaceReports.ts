import { useState, useEffect, useCallback } from "react";
import { getAllDamageReports } from "../services/supabase/reports";
import { transformSupabaseReport } from "./userDataUtils";
import type { DamageReport } from "../types";

/**
 * Fetches all damage reports from Supabase for marketplace views
 * (shop requests, insurer claims). Falls back to empty array on failure.
 */
export function useMarketplaceReports(userType: string) {
  const [marketplaceReports, setMarketplaceReports] = useState<DamageReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (userType !== "shop" && userType !== "insurer") return;
    setLoading(true);
    setError(null);
    try {
      const raw = await getAllDamageReports();
      const reports = Array.isArray(raw) ? raw : [];
      setMarketplaceReports(reports.map(transformSupabaseReport));
    } catch {
      setError("Unable to load live data — showing demo requests");
    } finally {
      setLoading(false);
    }
  }, [userType]);

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
          setMarketplaceReports(reports.map(transformSupabaseReport));
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load live data — showing demo requests");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userType]);

  return { marketplaceReports, loading, error, refetch: fetchReports };
}
