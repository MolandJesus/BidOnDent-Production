/**
 * Shop Nearby Report Notifications — Real-Time Hook
 *
 * Subscribes to Supabase Realtime for new damage_reports INSERTs.
 * Filters to reports within the shop's defined service areas.
 * Pushes a proximity-specific in-app notification (toast + feed).
 *
 * Depends on useShopServiceAreas for the shop's coverage zones.
 * Uses client-side haversine to filter — no extra network call per event.
 *
 * Pass 822 — Shop notification on new nearby reports.
 */

import { useEffect, useRef } from "react";
import {
  realtimeReportService,
  type RealtimeReportPayload,
} from "../services/realtime/RealtimeReportService";
import { useNotifications } from "../features/notifications";
import type { ShopServiceArea } from "../services/supabase/serviceAreas";
import { calculateDistanceMiles } from "../services/intelligence/shopMapRouting";

interface UseShopNearbyReportNotificationsOptions {
  userType: string;
  serviceAreas: ShopServiceArea[];
  onNearbyReport?: () => void;
}

/**
 * Check if a report falls within any of the shop's active radius-type service areas.
 * Returns the matching area label and distance if found, null otherwise.
 */
function matchServiceArea(
  reportLat: number,
  reportLng: number,
  areas: ShopServiceArea[]
): { label: string; distanceMiles: number } | null {
  for (const area of areas) {
    if (
      area.area_type !== "radius" ||
      !area.is_active ||
      area.center_latitude == null ||
      area.center_longitude == null ||
      area.radius_miles == null
    ) {
      continue;
    }

    const distance = calculateDistanceMiles(
      { latitude: area.center_latitude, longitude: area.center_longitude },
      { latitude: reportLat, longitude: reportLng }
    );

    if (distance <= area.radius_miles) {
      return { label: area.label, distanceMiles: Math.round(distance * 10) / 10 };
    }
  }

  // Check zip-code-based areas
  return null; // ZIP matching would need the report's zip code — handled below
}

function matchZipArea(
  reportZip: string | undefined,
  areas: ShopServiceArea[]
): { label: string } | null {
  if (!reportZip) return null;

  for (const area of areas) {
    if (area.area_type !== "zip_codes" || !area.is_active) continue;
    if (area.zip_codes.includes(reportZip)) {
      return { label: area.label };
    }
  }
  return null;
}

export function useShopNearbyReportNotifications({
  userType,
  serviceAreas,
  onNearbyReport,
}: UseShopNearbyReportNotificationsOptions): void {
  const notifications = useNotifications();
  const onNearbyReportRef = useRef(onNearbyReport);
  onNearbyReportRef.current = onNearbyReport;
  const serviceAreasRef = useRef(serviceAreas);
  serviceAreasRef.current = serviceAreas;

  useEffect(() => {
    if (userType !== "shop") return;

    const handleNewReport = (report: RealtimeReportPayload) => {
      const areas = serviceAreasRef.current;
      if (areas.length === 0) return;

      // Try radius match first
      let match: { label: string; distanceMiles?: number } | null = null;
      if (report.latitude != null && report.longitude != null) {
        match = matchServiceArea(report.latitude, report.longitude, areas);
      }

      // Fall back to ZIP match
      if (!match) {
        match = matchZipArea(report.zipCode, areas);
      }

      if (!match) return; // Not in any service area

      const vehicle = [report.vehicleYear, report.vehicleMake, report.vehicleModel]
        .filter(Boolean)
        .join(" ");
      const location = [report.city, report.state].filter(Boolean).join(", ");

      const distanceText = match.distanceMiles != null ? ` (${match.distanceMiles} mi away)` : "";
      const title = vehicle ? `Nearby repair request: ${vehicle}` : "Nearby repair request";
      const body = location
        ? `${report.damageType || "Dent repair"} in ${location}${distanceText}`
        : `${report.damageType || "A customer needs dent repair"}${distanceText}`;

      notifications.push({
        category: "report",
        title,
        body,
        payload: {
          reportId: report.id,
          serviceAreaLabel: match.label,
          distanceMiles: match.distanceMiles,
          nearby: true,
        },
        userId: "",
        deepLink: { screen: "report", reportId: report.id },
        priority: "high",
      });

      onNearbyReportRef.current?.();
    };

    const unsubscribe = realtimeReportService.subscribe(handleNewReport);

    return () => {
      unsubscribe();
    };
  }, [userType, notifications]);
}
