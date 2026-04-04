import { useEffect, useRef, type MutableRefObject } from "react";
import type { Vehicle, DamageReport, RedirectInfo, UserInfo } from "../types";
import { saveProfile, saveVehicle } from "../services/supabaseService";
import { saveDamageReport } from "../services/supabase/reports";
import { toSupabaseVehicle, buildSupabaseReportPayload } from "./userDataUtils";

type CloudSyncDeps = {
  userInfo: UserInfo;
  vehicles: Vehicle[];
  reports: DamageReport[];
  userPhone: string;
  redirectInfo: RedirectInfo | null;
  clerkUserId?: string;
  websiteUserKey?: string;
  isSavingRef: MutableRefObject<boolean>;
  isLoadingFromCloudRef: MutableRefObject<boolean>;
  lastSavedProfileSignatureRef: MutableRefObject<string>;
  lastSavedVehiclesSignatureRef: MutableRefObject<string>;
  lastSavedReportsSignatureRef: MutableRefObject<string>;
  vehicleSignaturesRef: MutableRefObject<Record<string, string>>;
  reportSignaturesRef: MutableRefObject<Record<string, string>>;
  onSyncError?: (error: unknown) => void;
};

export function useUserDataCloudSync({
  userInfo,
  vehicles,
  reports,
  userPhone,
  redirectInfo,
  clerkUserId,
  websiteUserKey,
  isSavingRef,
  isLoadingFromCloudRef,
  lastSavedProfileSignatureRef,
  lastSavedVehiclesSignatureRef,
  lastSavedReportsSignatureRef,
  vehicleSignaturesRef,
  reportSignaturesRef,
  onSyncError,
}: CloudSyncDeps) {
  useEffect(() => {
    if (!userInfo.email || !redirectInfo || isLoadingFromCloudRef.current) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        if (!clerkUserId) {
          return;
        }

        const isCloudUrl =
          userInfo.profileImage &&
          (userInfo.profileImage.startsWith("http://") ||
            userInfo.profileImage.startsWith("https://"));

        const profileSignature = JSON.stringify({
          email: userInfo.email,
          name: userInfo.name,
          phone: userPhone,
          profileImage: userInfo.profileImage || "",
          accountType: redirectInfo.type,
        });
        const vehiclesSignature = JSON.stringify(vehicles);
        const reportsSignature = JSON.stringify(reports);

        if (profileSignature !== lastSavedProfileSignatureRef.current) {
          await saveProfile(
            {
              email: userInfo.email,
              name: userInfo.name,
              phone: userPhone,
              profile_image_url: isCloudUrl ? userInfo.profileImage : undefined,
              account_type: redirectInfo.type,
            },
            {
              clerkUserId,
              email: userInfo.email,
              websiteUserKey,
            }
          );
          lastSavedProfileSignatureRef.current = profileSignature;
          if (import.meta.env.DEV) console.log("Auto-saved profile to Supabase");
        }

        if (vehiclesSignature !== lastSavedVehiclesSignatureRef.current) {
          if (vehicles.length > 0) {
            const dirtyVehicles = vehicles.filter((v) => {
              const vid = v.id;
              return !(vid && JSON.stringify(v) === vehicleSignaturesRef.current[vid]);
            });
            const results = await Promise.allSettled(
              dirtyVehicles.map((vehicle) =>
                saveVehicle(toSupabaseVehicle(vehicle), clerkUserId).then(() => {
                  const vid = vehicle.id;
                  if (vid) vehicleSignaturesRef.current[vid] = JSON.stringify(vehicle);
                })
              )
            );
            const savedCount = results.filter((r) => r.status === "fulfilled").length;
            if (import.meta.env.DEV && savedCount > 0)
              console.log(`Auto-saved ${savedCount}/${vehicles.length} vehicles to Supabase`);
          }
          lastSavedVehiclesSignatureRef.current = vehiclesSignature;
        }

        if (reportsSignature !== lastSavedReportsSignatureRef.current) {
          if (reports.length > 0) {
            const dirtyReports = reports.filter((r) => {
              const rid = r.id;
              return !(rid && JSON.stringify(r) === reportSignaturesRef.current[rid]);
            });
            const results = await Promise.allSettled(
              dirtyReports.map((report) =>
                saveDamageReport(buildSupabaseReportPayload(report), clerkUserId).then(() => {
                  const rid = report.id;
                  if (rid) reportSignaturesRef.current[rid] = JSON.stringify(report);
                })
              )
            );
            const savedCount = results.filter((r) => r.status === "fulfilled").length;
            if (import.meta.env.DEV && savedCount > 0)
              console.log(`Auto-saved ${savedCount}/${reports.length} reports to Supabase`);
          }
          lastSavedReportsSignatureRef.current = reportsSignature;
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error auto-saving to Supabase:", error);
        onSyncError?.(error);
      } finally {
        isSavingRef.current = false;
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [userInfo, vehicles, reports, userPhone, redirectInfo, clerkUserId, websiteUserKey]);
}
