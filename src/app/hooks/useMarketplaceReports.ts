import { useState, useEffect } from "react";
import { getAllDamageReports } from "../services/supabase/reports";
import { transformSupabaseReport } from "./userDataUtils";

/**
 * Fetches all damage reports from Supabase for marketplace views
 * (shop requests, insurer claims). Falls back to empty array on failure.
 */
export function useMarketplaceReports(userType: string) {
  const [marketplaceReports, setMarketplaceReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userType !== "shop" && userType !== "insurer") return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
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

  return { marketplaceReports, loading, error };
}
