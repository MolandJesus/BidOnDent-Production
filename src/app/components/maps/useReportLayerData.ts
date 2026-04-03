/**
 * useReportLayerData — Fetches, geocodes, filters, and computes GeoJSON
 * for the MapLibre report layer. Extracted from MapLibreReportLayer to
 * enforce file-size limits and separation of data vs rendering.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllDamageReports } from "../../services/supabase/reports";
import { getBidsForReport } from "../../services/supabase/bids";
import { zipToCoordinates, geocodeAddress } from "../../services/supabase/map";
import type { DamageReport } from "../../services/supabase/types";

type UseReportLayerDataParams = {
  initialReports?: DamageReport[];
  statusFilter: string;
  onReportCountChange?: (count: number, loading: boolean) => void;
};

export type ReportWithCoords = {
  report: DamageReport;
  coords: { lat: number; lng: number };
};

export function useReportLayerData({
  initialReports,
  statusFilter,
  onReportCountChange,
}: UseReportLayerDataParams) {
  const [reports, setReports] = useState<DamageReport[]>(initialReports ?? []);
  const [loading, setLoading] = useState(!initialReports);
  const [fetchError, setFetchError] = useState(false);
  const [geocodedCoords, setGeocodedCoords] = useState<Map<string, { lat: number; lng: number }>>(
    new Map()
  );
  const [bidCounts, setBidCounts] = useState<Record<string, number>>({});

  const fetchReports = useCallback(() => {
    if (initialReports) return;
    setLoading(true);
    setFetchError(false);
    let isMounted = true;
    getAllDamageReports()
      .then((data) => {
        if (!isMounted) return;
        setReports(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setFetchError(true);
        setReports([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [initialReports]);

  // Sync with prop changes when using initialReports
  useEffect(() => {
    if (initialReports) {
      setReports(initialReports);
      setLoading(false);
    }
  }, [initialReports]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Geocode report addresses (refine ZIP centroids)
  useEffect(() => {
    if (reports.length === 0) return;
    let cancelled = false;

    (async () => {
      for (const report of reports) {
        if (cancelled) break;
        const zip = report.zip_code;
        if (!report.address && !report.city && !zip) continue;
        const coords = await geocodeAddress({
          address: report.address,
          city: report.city,
          state: report.state,
          zip,
        });
        if (cancelled) break;
        if (coords && report.id) {
          setGeocodedCoords((prev) => {
            const next = new Map(prev);
            next.set(report.id!, coords);
            return next;
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reports]);

  // Fetch bid counts for each report
  useEffect(() => {
    if (reports.length === 0) return;
    let cancelled = false;
    (async () => {
      const counts: Record<string, number> = {};
      await Promise.allSettled(
        reports.map(async (report) => {
          if (!report.id || cancelled) return;
          try {
            const bids = await getBidsForReport(report.id);
            if (!cancelled) {
              counts[report.id] = bids.filter((b) => b.status !== "rejected").length;
            }
          } catch (err) {
            if (import.meta.env.DEV)
              console.warn(`Bid count fetch failed for report ${report.id}:`, err);
          }
        })
      );
      if (!cancelled) setBidCounts(counts);
    })();
    return () => {
      cancelled = true;
    };
  }, [reports]);

  const reportsWithCoordinates = useMemo(
    () =>
      reports
        .map((report) => {
          const geocoded = report.id ? geocodedCoords.get(report.id) : undefined;
          const coords = geocoded ?? zipToCoordinates(report.zip_code);
          if (!coords) return null;
          return { report, coords };
        })
        .filter((entry): entry is ReportWithCoords => Boolean(entry)),
    [reports, geocodedCoords]
  );

  const filteredReportsWithCoordinates = useMemo(
    () =>
      statusFilter === "all"
        ? reportsWithCoordinates
        : reportsWithCoordinates.filter(
            ({ report }) => (report.status ?? "pending") === statusFilter
          ),
    [reportsWithCoordinates, statusFilter]
  );

  // Notify parent of report count changes
  useEffect(() => {
    onReportCountChange?.(filteredReportsWithCoordinates.length, loading);
  }, [filteredReportsWithCoordinates.length, loading, onReportCountChange]);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: filteredReportsWithCoordinates.map(({ report, coords }) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [coords.lng, coords.lat],
        },
        properties: {
          id: report.id,
          status: report.status ?? "pending",
          vehicle: `${report.vehicle_year} ${report.vehicle_make} ${report.vehicle_model}`,
          damageType: report.damage_type,
          severity: report.damage_severity,
          zip: report.zip_code ?? "",
          bidCount: report.id ? (bidCounts[report.id] ?? 0) : 0,
        },
      })),
    }),
    [filteredReportsWithCoordinates, bidCounts]
  );

  return {
    reports,
    loading,
    fetchError,
    fetchReports,
    bidCounts,
    reportsWithCoordinates,
    filteredReportsWithCoordinates,
    geojson,
  };
}
