import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, AlertCircle, MapPin } from "lucide-react";
import { zipToCoordinates } from "../../services/supabase/map";
import { defaultCoverageCenter } from "../landing/coverageData";
import DashboardMapPreview from "../dashboard/MapLibreDashboardMapPreview";
import type { ReportPin } from "../dashboard/MapLibreDashboardMapPreview";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import { useNotifications } from "../../features/notifications/NotificationContext";
import ShopActiveJobCard, { type ActiveJob } from "./ShopActiveJobCard";
import ShopActiveJobDetailModal from "./ShopActiveJobDetailModal";

import type { Report } from "../../types";

type ShopActiveJobsScreenProps = {
  primaryColor?: string;
  reports?: Report[];
  isSeedData?: boolean;
  onUpdateJobStatus?: (jobId: number, status: string) => void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function ShopActiveJobsScreen({
  primaryColor = "#003d82",
  reports = [],
  isSeedData = false,
  onUpdateJobStatus,
  appearanceMode = "map-dark",
}: ShopActiveJobsScreenProps) {
  const notifications = useNotifications();
  const isLight = appearanceMode === "light";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "in-progress" | "awaiting-parts" | "completed"
  >("all");
  const [selectedJob, setSelectedJob] = useState<ActiveJob | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});

  const buildTasks = (status: string, hasBids: boolean) => {
    if (status === "completed") {
      return [
        { id: 1, name: "Report Received", completed: true },
        { id: 2, name: "Bid Accepted", completed: true },
        { id: 3, name: "Repair Complete", completed: true },
      ];
    }

    if (status === "in-progress") {
      return [
        { id: 1, name: "Report Received", completed: true },
        { id: 2, name: "Bid Accepted", completed: true },
        { id: 3, name: "Repair In Progress", completed: false },
      ];
    }

    return [
      { id: 1, name: "Report Received", completed: true },
      { id: 2, name: hasBids ? "Bid Submitted" : "Awaiting Bid", completed: hasBids },
      { id: 3, name: "Repair Start", completed: false },
    ];
  };

  const liveJobs = reports
    .map((report, index: number) => {
      const rawStatus = String(report?.status ?? "pending").toLowerCase();
      const status =
        rawStatus === "completed"
          ? "completed"
          : rawStatus === "in-review" || rawStatus === "active"
            ? "in-progress"
            : "pending";
      const vehicleData = report?.vehicle || report?.vehicleInfo || {};
      const vehicleParts = [vehicleData.year, vehicleData.make, vehicleData.model].filter(Boolean);
      const bidAmount = Number(report?.bidAmount) || 0;
      const hasBids = (report?.bidsCount ?? 0) > 0 || bidAmount > 0;
      const tasks = buildTasks(status, hasBids);
      const completedCount = tasks.filter((t) => t.completed).length;
      const progress = Math.round((completedCount / tasks.length) * 100);

      return {
        id: String(report?.id ?? `job-${index}`),
        customerName: report?.customerName || "Not provided",
        customerEmail: report?.customerEmail || "Not provided",
        customerPhone: report?.customerPhone || "Not provided",
        vehicle: vehicleParts.length > 0 ? vehicleParts.join(" ") : "Vehicle details pending",
        damageType: report?.damageArea || report?.damageType || "Repair request",
        bidAmount,
        startDate: report?.submittedAt
          ? new Date(report.submittedAt).toLocaleDateString()
          : "Pending",
        estimatedCompletion: status === "completed" ? "Completed" : "In scheduling",
        status,
        progress,
        tasks,
        insuranceClaim: report?.insuranceClaim ?? false,
        insuranceCompany: report?.insuranceCompany || "N/A",
        claimNumber: report?.claimNumber || "N/A",
        notes: report?.description || "Repair request received and queued.",
      };
    })
    .map((job) => {
      const override = statusOverrides[job.id];
      if (!override) return job;
      const overrideTasks = buildTasks(override, true);
      const completedCount = overrideTasks.filter((t) => t.completed).length;
      const progress = Math.round((completedCount / overrideTasks.length) * 100);
      return { ...job, status: override, progress, tasks: overrideTasks };
    });

  // Map pins for active job locations
  const jobPins = useMemo<ReportPin[]>(() => {
    return (reports || [])
      .map((report) => {
        const vehicleData = report?.vehicle || report?.vehicleInfo || {};
        const label =
          [vehicleData.year, vehicleData.make, vehicleData.model].filter(Boolean).join(" ") ||
          report?.damageArea ||
          "Active job";
        const lat = report?.latitude;
        const lng = report?.longitude;
        if (lat != null && lng != null) {
          return { id: String(report?.id ?? ""), lat, lng, label };
        }
        const zipCode = report?.zipCode || report?.zip_code || "";
        const coords = zipCode ? zipToCoordinates(zipCode) : null;
        if (!coords) return null;
        return { id: String(report?.id ?? ""), lat: coords.lat, lng: coords.lng, label };
      })
      .filter((pin): pin is ReportPin => pin !== null);
  }, [reports]);

  const jobMapCenter = useMemo<[number, number]>(() => {
    if (jobPins.length > 0) {
      return [jobPins[0].lat, jobPins[0].lng];
    }
    return defaultCoverageCenter;
  }, [jobPins]);

  const filteredJobs = liveJobs.filter((job) => {
    const matchesSearch =
      job.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.damageType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className={`border-b ${isLight ? "border-slate-200/60 bg-white/90" : "border-blue-300/15"}`}
        style={
          isLight
            ? { backdropFilter: "blur(12px)" }
            : {
                background:
                  "linear-gradient(180deg, rgba(11, 23, 47, 0.92) 0%, rgba(8, 18, 38, 0.86) 100%)",
                boxShadow: "0 4px 24px rgba(3, 10, 24, 0.30)",
                backdropFilter: "blur(12px)",
              }
        }
      >
        <div className="px-4 py-4">
          <p
            className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${isLight ? "text-cyan-600" : "text-cyan-300/80"}`}
          >
            Shop operations
          </p>
          <h1
            className={`text-2xl font-bold mb-4 ${isLight ? "text-slate-900" : "text-slate-100"}`}
          >
            Active Jobs
          </h1>

          {/* Search */}
          <div className="mb-3">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isLight ? "text-slate-400" : "text-blue-200/60"}`}
              />
              <input
                type="text"
                placeholder="Search by customer, vehicle, or job type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none transition-colors ${isLight ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60" : "border-blue-300/20 bg-white/8 text-slate-100 placeholder:text-blue-200/50 focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20"}`}
              />
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(
              [
                { id: "all", label: "All Jobs" },
                { id: "pending", label: "Pending" },
                { id: "in-progress", label: "In Progress" },
                { id: "awaiting-parts", label: "Awaiting Parts" },
                { id: "completed", label: "Completed" },
              ] as {
                id: "all" | "pending" | "in-progress" | "awaiting-parts" | "completed";
                label: string;
              }[]
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`bd-dashboard-filter-button rounded-full px-4 py-2 min-h-[44px] font-medium whitespace-nowrap transition-colors ${
                  filterStatus === filter.id
                    ? "text-white shadow-sm"
                    : isLight
                      ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200"
                      : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"
                }`}
                style={
                  filterStatus === filter.id
                    ? { background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }
                    : {}
                }
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Data Banner */}
      {isSeedData && (
        <div className="mx-4 mt-4">
          <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
              isLight
                ? "bg-amber-50 border border-amber-200/60 text-amber-800"
                : "bg-amber-500/10 border border-amber-400/20 text-amber-300"
            }`}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Showing example jobs for preview. Your active jobs will appear here once a bid is
              accepted.
            </span>
          </div>
        </div>
      )}

      {/* Job Geography Map */}
      {liveJobs.length > 0 && (
        <div className="px-4 pt-4">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
            className="bd-dashboard-panel bd-dashboard-panel--accent-cyan overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2
                    className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
                  >
                    Job locations
                  </h2>
                  <p
                    className={`mt-0.5 text-xs ${isLight ? "text-slate-500" : "text-blue-100/70"}`}
                  >
                    See where your active repair jobs are located.
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isLight
                      ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                      : "bg-blue-400/14 text-blue-200 border border-blue-300/20"
                  }`}
                >
                  {jobPins.length}/{liveJobs.length} mapped
                </span>
              </div>
            </div>

            {jobPins.length > 0 ? (
              <>
                <div className="h-[200px] md:h-[220px]">
                  <DashboardMapPreview
                    shops={[]}
                    reportPins={jobPins}
                    center={jobMapCenter}
                    zoom={10}
                    isLight={isLight}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      isLight ? "bg-amber-100 text-amber-700" : "bg-amber-500/20 text-amber-200"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Active job
                  </span>
                </div>
              </>
            ) : (
              <div
                className={`mx-3 mb-3 flex items-start gap-2 rounded-xl border border-dashed px-3 py-2.5 text-xs ${
                  isLight ? "border-slate-300/70 text-slate-600" : "border-white/20 text-slate-300"
                }`}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  No job locations available yet. Jobs with ZIP codes will appear on this map.
                </span>
              </div>
            )}
          </motion.section>
        </div>
      )}

      {/* Jobs List */}
      <div className="px-4 py-4 space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="bd-dashboard-panel bd-dashboard-panel--deep p-5 sm:p-8 text-center">
            <AlertCircle
              className={`w-12 h-12 mx-auto mb-3 ${isLight ? "text-blue-500/60" : "text-blue-400/70"}`}
            />
            <p className={isLight ? "text-slate-900" : "text-slate-100"}>No active jobs yet</p>
            <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
              Jobs appear here once a customer accepts one of your bids
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <ShopActiveJobCard
              key={job.id}
              job={job}
              isLight={isLight}
              primaryColor={primaryColor}
              onViewDetails={setSelectedJob}
            />
          ))
        )}
      </div>

      {selectedJob && (
        <ShopActiveJobDetailModal
          job={selectedJob}
          isLight={isLight}
          appearanceMode={appearanceMode}
          onClose={() => setSelectedJob(null)}
          onUpdateStatus={async (jobId, newStatus) => {
            setStatusOverrides((prev) => ({ ...prev, [jobId]: newStatus }));
            const progress =
              newStatus === "completed"
                ? 100
                : newStatus === "in-progress"
                  ? 60
                  : newStatus === "awaiting-parts"
                    ? 45
                    : 20;
            setSelectedJob((prev) =>
              prev ? { ...prev, status: newStatus, progress, tasks: buildTasks(newStatus) } : null
            );

            // Persist to backend (skip for seed/demo data)
            if (!isSeedData && onUpdateJobStatus) {
              try {
                await onUpdateJobStatus(Number(jobId), newStatus);
              } catch {
                // Roll back optimistic update
                setStatusOverrides((prev) => {
                  const next = { ...prev };
                  delete next[jobId];
                  return next;
                });
                notifications.push({
                  category: "shop",
                  title: "Update failed",
                  body: `Could not save status for Job #${jobId}. Please try again.`,
                  payload: { jobId, newStatus },
                  userId: "",
                  deepLink: null,
                  priority: "high",
                });
                return;
              }
            }

            const statusLabels: Record<string, string> = {
              "in-progress": "Repair started",
              "awaiting-parts": "Awaiting parts",
              completed: "Repair completed",
            };
            notifications.push({
              category: "shop",
              title: statusLabels[newStatus] || `Status: ${newStatus}`,
              body: `Job #${jobId} updated to ${newStatus.replace(/-/g, " ")}.`,
              payload: { jobId, newStatus },
              userId: "",
              deepLink: null,
              priority: newStatus === "completed" ? "high" : "normal",
            });
          }}
        />
      )}
    </div>
  );
}
