import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "../ui/drawer";
import { cn } from "../ui/utils";
import type { DamageReport } from "../../services/supabase/types";
import type { MapTheme } from "../../types/mapDomain";

type ReportDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: DamageReport | null;
  reportCoords?: { lat: number; lng: number } | null;
  mapTheme?: MapTheme;
  onViewReportDetail?: (reportId: string) => void;
  onFindShopsNear?: (coords: { lat: number; lng: number }) => void;
};

export function ReportDetailDrawer({
  open,
  onOpenChange,
  report,
  reportCoords,
  mapTheme = "dark",
  onViewReportDetail,
  onFindShopsNear,
}: ReportDetailDrawerProps) {
  if (!report) return null;

  const isDark = mapTheme === "dark";

  const vehicleLabel = report.vehicle_make
    ? `${report.vehicle_make} ${report.vehicle_model || ""}`.trim()
    : "Damage Report";
  const zipCode = report.zip_code || "";
  const damageArea = report.damage_location || "";
  const description = report.damage_description || "";
  const photos: string[] = Array.isArray(report.photo_urls) ? report.photo_urls : [];
  const submittedAt = report.created_at
    ? new Date(report.created_at).toLocaleDateString()
    : "Unknown";
  const status = report.status || "submitted";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "max-w-lg mx-auto rounded-2xl p-0 backdrop-blur-2xl",
          isDark
            ? "bg-gradient-to-b from-slate-900/90 to-blue-950/90 border-blue-400/20 shadow-[0_-8px_40px_rgba(59,130,246,0.15),0_0_60px_rgba(14,165,233,0.08),inset_0_1px_0_rgba(96,165,250,0.2)]"
            : "bg-white/95 border-slate-200/80 shadow-xl"
        )}
      >
        <DrawerHeader className="p-6 pb-2">
          <DrawerTitle
            className={cn(
              "text-2xl font-bold flex items-center gap-2",
              isDark ? "text-blue-300" : "text-slate-800"
            )}
          >
            {vehicleLabel}
          </DrawerTitle>
          <DrawerDescription
            className={cn("text-base mt-1", isDark ? "text-slate-300" : "text-slate-500")}
          >
            {zipCode} &bull; {damageArea}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6 pb-6">
          <div
            className={cn("text-lg mb-2 font-medium", isDark ? "text-white/90" : "text-slate-700")}
          >
            {description}
          </div>
          {photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto mb-3">
              {photos.map((src: string, i: number) => (
                <img
                  key={i}
                  src={src}
                  alt="Damage photo"
                  className={cn(
                    "h-20 w-28 object-cover rounded-lg border",
                    isDark ? "border-slate-800" : "border-slate-200"
                  )}
                />
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
              Submitted: {submittedAt}
            </span>
            <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
              Status: {status}
            </span>
          </div>
          {onViewReportDetail && report.id && (
            <button
              type="button"
              onClick={() => {
                onViewReportDetail(report.id!);
                onOpenChange(false);
              }}
              className={cn(
                "mt-4 w-full rounded-xl py-3 text-sm font-semibold transition-colors min-h-[44px]",
                isDark
                  ? "bg-blue-500/90 text-white hover:bg-blue-400/90 active:bg-blue-600/90"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              )}
            >
              View Full Details
            </button>
          )}
          {onFindShopsNear && reportCoords && (
            <button
              type="button"
              onClick={() => {
                onFindShopsNear(reportCoords);
                onOpenChange(false);
              }}
              className={cn(
                "mt-2 w-full rounded-xl border py-3 text-sm font-semibold transition-colors min-h-[44px]",
                isDark
                  ? "border-blue-400/30 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"
                  : "border-blue-300/60 bg-blue-50 text-blue-700 hover:bg-blue-100"
              )}
            >
              Find Shops Nearby
            </button>
          )}
        </div>
        <DrawerClose
          className={cn(
            "absolute top-4 right-4 transition-colors text-xl",
            isDark ? "text-slate-400 hover:text-white/90" : "text-slate-400 hover:text-slate-700"
          )}
        >
          ×
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
