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

type ReportDetailDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: DamageReport | null;
};

export function ReportDetailDrawer({ open, onOpenChange, report }: ReportDetailDrawerProps) {
  if (!report) return null;

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
          "max-w-lg mx-auto bg-gradient-to-b from-slate-900/90 to-blue-950/90 border-blue-400/20 backdrop-blur-2xl rounded-2xl p-0",
          "shadow-[0_-8px_40px_rgba(59,130,246,0.15),0_0_60px_rgba(14,165,233,0.08),inset_0_1px_0_rgba(96,165,250,0.2)]"
        )}
      >
        <DrawerHeader className="p-6 pb-2">
          <DrawerTitle className="text-2xl font-bold text-blue-300 flex items-center gap-2">
            {vehicleLabel}
          </DrawerTitle>
          <DrawerDescription className="text-slate-300 text-base mt-1">
            {zipCode} &bull; {damageArea}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-6 pb-6">
          <div className="text-lg text-white/90 mb-2 font-medium">{description}</div>
          {photos.length > 0 && (
            <div className="flex gap-2 overflow-x-auto mb-3">
              {photos.map((src: string, i: number) => (
                <img
                  key={i}
                  src={src}
                  alt="Damage photo"
                  className="h-20 w-28 object-cover rounded-lg border border-slate-800"
                />
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-slate-400">Submitted: {submittedAt}</span>
            <span className="text-xs text-slate-400">Status: {status}</span>
          </div>
        </div>
        <DrawerClose className="absolute top-4 right-4 text-slate-400 hover:text-white/90 transition-colors text-xl">
          ×
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}
