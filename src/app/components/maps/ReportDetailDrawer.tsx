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
import type { DamageReport } from "../../types";
import type { MapTheme } from "../../types/mapDomain";

type ReportDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: DamageReport | null;
  reportCoords?: { lat: number; lng: number } | null;
  mapTheme?: MapTheme;
  onViewReportDetail?: (reportId: string) => void;
  onFindShopsNear?: (coords: { lat: number; lng: number }) => void;
  onPlaceBid?: (report: DamageReport) => void;
  onViewBids?: (reportId: string) => void;
  bidCount?: number;
};

export function ReportDetailDrawer({
  open,
  onOpenChange,
  report,
  reportCoords,
  mapTheme = "dark",
  onViewReportDetail,
  onFindShopsNear,
  onPlaceBid,
  onViewBids,
  bidCount,
}: ReportDetailDrawerProps) {
  if (!report) return null;

  const isDark = mapTheme === "dark";

  const vehicleLabel = report.vehicleInfo?.make
    ? `${report.vehicleInfo?.year ? `${report.vehicleInfo.year} ` : ""}${report.vehicleInfo.make} ${report.vehicleInfo?.model || ""}`.trim()
    : "Damage Report";
  const locationParts = [
    [report.city, report.state].filter(Boolean).join(", "),
    report.zipCode,
  ].filter(Boolean);
  const locationLabel = locationParts.join(" · ");
  const damageArea = report.damageArea || "";
  const description = report.damageDescription || "";
  const photos: string[] = Array.isArray(report.photos) ? report.photos : [];
  const submittedAt = report.createdAt ? new Date(report.createdAt).toLocaleDateString() : null;
  const status = report.status || "submitted";
  const damageType = report.damageType || "";
  const damageSeverity = report.damageSeverity || "";

  const statusColor =
    status === "active"
      ? isDark
        ? "bg-green-900/50 text-green-300 border-green-400/25"
        : "bg-green-50 text-green-700 border-green-200/60"
      : status === "resolved" || status === "completed"
        ? isDark
          ? "bg-slate-700/50 text-slate-300 border-slate-500/25"
          : "bg-slate-100 text-slate-600 border-slate-200/60"
        : isDark
          ? "bg-amber-900/50 text-amber-300 border-amber-400/25"
          : "bg-amber-50 text-amber-700 border-amber-200/60";

  const severityColor =
    damageSeverity.toLowerCase() === "severe" || damageSeverity.toLowerCase() === "critical"
      ? isDark
        ? "bg-red-900/50 text-red-300 border-red-400/25"
        : "bg-red-50 text-red-700 border-red-200/60"
      : damageSeverity.toLowerCase() === "moderate"
        ? isDark
          ? "bg-amber-900/50 text-amber-300 border-amber-400/25"
          : "bg-amber-50 text-amber-700 border-amber-200/60"
        : isDark
          ? "bg-slate-700/50 text-slate-300 border-slate-500/25"
          : "bg-slate-100 text-slate-600 border-slate-200/60";

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
        <DrawerHeader className="px-5 pt-5 pb-1">
          <DrawerTitle
            className={cn(
              "text-lg font-bold flex items-center gap-2",
              isDark ? "text-blue-300" : "text-slate-800"
            )}
          >
            {vehicleLabel}
          </DrawerTitle>
          <DrawerDescription
            className={cn("text-sm mt-0.5", isDark ? "text-slate-300" : "text-slate-500")}
          >
            {locationLabel || damageArea}
            {locationLabel && damageArea ? ` · ${damageArea}` : ""}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-5 pb-5">
          {/* Badges: type, severity, status, bids */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {damageType && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  isDark
                    ? "bg-blue-900/40 text-blue-200 border-blue-400/20"
                    : "bg-blue-50 text-blue-700 border-blue-200/60"
                )}
              >
                {damageType}
              </span>
            )}
            {damageSeverity && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  severityColor
                )}
              >
                {damageSeverity}
              </span>
            )}
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                statusColor
              )}
            >
              {status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
            {bidCount != null && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                  bidCount > 0
                    ? isDark
                      ? "bg-blue-500/20 text-blue-200 border-blue-400/20"
                      : "bg-blue-50 text-blue-700 border-blue-200/60"
                    : isDark
                      ? "bg-slate-700/40 text-slate-400 border-slate-500/20"
                      : "bg-slate-100 text-slate-500 border-slate-200/60"
                )}
              >
                {bidCount > 0 ? `${bidCount} bid${bidCount === 1 ? "" : "s"}` : "No bids"}
              </span>
            )}
          </div>

          {description && (
            <p
              className={cn(
                "text-sm leading-relaxed mb-2",
                isDark ? "text-white/80" : "text-slate-700"
              )}
            >
              {description}
            </p>
          )}

          {photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto mb-2.5">
              {photos.map((src: string, i: number) => (
                <img
                  key={i}
                  src={src}
                  alt="Damage photo"
                  className={cn(
                    "h-20 w-28 shrink-0 object-cover rounded-lg border",
                    isDark ? "border-slate-800" : "border-slate-200"
                  )}
                />
              ))}
            </div>
          )}

          {submittedAt && (
            <p className={cn("text-[11px] mb-3", isDark ? "text-slate-500" : "text-slate-400")}>
              Submitted {submittedAt}
            </p>
          )}

          {onViewReportDetail && report.id && (
            <button
              type="button"
              onClick={() => {
                onViewReportDetail(report.id!);
                onOpenChange(false);
              }}
              className={cn(
                "w-full rounded-xl py-2.5 text-sm font-semibold transition-colors min-h-[44px]",
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
                "mt-1.5 w-full rounded-xl border py-2.5 text-sm font-semibold transition-colors min-h-[44px]",
                isDark
                  ? "border-blue-400/30 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30"
                  : "border-blue-300/60 bg-blue-50 text-blue-700 hover:bg-blue-100"
              )}
            >
              Find Shops Nearby
            </button>
          )}
          {onViewBids && report?.id && (
            <button
              type="button"
              onClick={() => {
                onViewBids(report.id!);
                onOpenChange(false);
              }}
              className={cn(
                "mt-1.5 w-full rounded-xl border py-2.5 text-sm font-semibold transition-colors min-h-[44px]",
                isDark
                  ? "border-emerald-400/30 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30"
                  : "border-emerald-300/60 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              )}
            >
              View Bids
            </button>
          )}
          {onPlaceBid && report && (
            <button
              type="button"
              onClick={() => {
                onPlaceBid(report);
                onOpenChange(false);
              }}
              className={cn(
                "mt-1.5 w-full rounded-xl border py-2.5 text-sm font-semibold transition-colors min-h-[44px]",
                isDark
                  ? "border-amber-400/30 bg-amber-500/20 text-amber-200 hover:bg-amber-500/30"
                  : "border-amber-300/60 bg-amber-50 text-amber-700 hover:bg-amber-100"
              )}
            >
              Place Bid
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
