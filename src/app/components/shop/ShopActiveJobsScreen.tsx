import { useState } from "react";
import { Search, AlertCircle } from "lucide-react";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import ShopActiveJobCard, { type ActiveJob } from "./ShopActiveJobCard";
import ShopActiveJobDetailModal from "./ShopActiveJobDetailModal";

type ShopActiveJobsScreenProps = {
  primaryColor?: string;
  reports?: any[];
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
  const isLight = appearanceMode === "light";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "in-progress" | "awaiting-parts" | "completed"
  >("all");
  const [selectedJob, setSelectedJob] = useState<ActiveJob | null>(null);

  const buildTasks = (status: string) => {
    if (status === "completed") {
      return [
        { id: 1, name: "Intake Review", completed: true },
        { id: 2, name: "Bid Selected", completed: true },
        { id: 3, name: "Repair Completed", completed: true },
      ];
    }

    if (status === "in-progress") {
      return [
        { id: 1, name: "Intake Review", completed: true },
        { id: 2, name: "Bid Selected", completed: true },
        { id: 3, name: "Repair In Progress", completed: false },
      ];
    }

    return [
      { id: 1, name: "Intake Review", completed: true },
      { id: 2, name: "Bid Selection", completed: false },
      { id: 3, name: "Repair Start", completed: false },
    ];
  };

  const liveJobs = reports.map((report: any, index: number) => {
    const rawStatus = String(report?.status ?? "pending").toLowerCase();
    const status =
      rawStatus === "completed"
        ? "completed"
        : rawStatus === "in-review"
          ? "in-progress"
          : "pending";
    const vehicleData = report?.vehicle || report?.vehicleInfo || {};
    const vehicleParts = [vehicleData.year, vehicleData.make, vehicleData.model].filter(Boolean);
    const bidAmount = Number(report?.bidAmount) || 0;
    const progress = status === "completed" ? 100 : status === "in-progress" ? 60 : 20;

    return {
      id: String(report?.id ?? `job-${index}`),
      customerName: "Customer",
      customerEmail: report?.customer_email || "Contact via BidOnDent",
      customerPhone: report?.customer_phone || "Via platform",
      vehicle: vehicleParts.length > 0 ? vehicleParts.join(" ") : "Vehicle details pending",
      damageType: report?.damageArea || report?.damageType || "Repair request",
      bidAmount,
      startDate: report?.submittedAt
        ? new Date(report.submittedAt).toLocaleDateString()
        : "Pending",
      estimatedCompletion: status === "completed" ? "Completed" : "In scheduling",
      status,
      progress,
      tasks: buildTasks(status),
      insuranceClaim: false,
      insuranceCompany: "N/A",
      claimNumber: "N/A",
      notes: report?.description || "Repair request received and queued.",
    };
  });

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
        className={`sticky top-0 z-10 border-b ${isLight ? "border-slate-200/60" : "border-blue-300/15"}`}
        style={
          isLight
            ? {}
            : {
                background:
                  "linear-gradient(180deg, rgba(11, 23, 47, 0.92) 0%, rgba(8, 18, 38, 0.86) 100%)",
                boxShadow: "0 4px 24px rgba(3, 10, 24, 0.30)",
                backdropFilter: "blur(12px)",
              }
        }
      >
        <div className="px-4 py-4">
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
                className={`px-4 py-2 min-h-[44px] rounded-lg font-medium whitespace-nowrap transition-colors ${
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
            <span>Showing demo jobs — active jobs will appear when bids are accepted.</span>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="px-4 py-4 space-y-4">
        {filteredJobs.length === 0 ? (
          <div
            className={`bd-glass-card p-5 sm:p-8 text-center${isLight ? " bd-light-surface" : ""}`}
            style={
              isLight
                ? {}
                : {
                    background:
                      "linear-gradient(180deg, rgba(11, 23, 47, 0.80) 0%, rgba(8, 18, 38, 0.76) 100%)",
                    borderColor: "rgba(96, 165, 250, 0.20)",
                  }
            }
          >
            <AlertCircle
              className={`w-12 h-12 mx-auto mb-3 ${isLight ? "text-blue-500/60" : "text-blue-400/70"}`}
            />
            <p className={isLight ? "text-slate-900" : "text-slate-100"}>No active jobs found</p>
            <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
              Try adjusting your filters or search
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
        />
      )}
    </div>
  );
}
