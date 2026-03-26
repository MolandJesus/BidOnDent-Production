import { useState } from "react";
import {
  Search,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  Wrench,
  Package,
  ChevronRight,
  Star,
  AlertCircle,
  User,
  X,
} from "lucide-react";
import RepairLifecycleTimeline from "../workflow/RepairLifecycleTimeline";
import { shopLifecycle } from "../workflow/lifecycle-presets";

type ShopActiveJobsScreenProps = {
  primaryColor?: string;
  reports?: any[];
  onUpdateJobStatus?: (jobId: number, status: string) => void;
};

export default function ShopActiveJobsScreen({
  primaryColor = "#003d82",
  reports = [],
  onUpdateJobStatus,
}: ShopActiveJobsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "in-progress" | "awaiting-parts" | "completed"
  >("all");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "awaiting-parts":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "in-progress":
        return <Wrench className="w-4 h-4" />;
      case "awaiting-parts":
        return <Package className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b border-blue-300/15"
        style={{
          background: "linear-gradient(180deg, rgba(11, 23, 47, 0.92) 0%, rgba(8, 18, 38, 0.86) 100%)",
          boxShadow: "0 4px 24px rgba(3, 10, 24, 0.30)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4 text-slate-100">
            Active Jobs
          </h1>

          {/* Search */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer, vehicle, or job type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-blue-300/20 rounded-xl bg-white/8 text-slate-100 placeholder:text-blue-200/50 focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20 outline-none transition-colors"
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
                  filterStatus === filter.id ? "text-white shadow-sm" : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"
                }`}
                style={filterStatus === filter.id ? { background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` } : {}}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="px-4 py-4 space-y-4">
        {filteredJobs.length === 0 ? (
          <div
            className="bd-glass-card p-5 sm:p-8 text-center"
            style={{
              background: "linear-gradient(180deg, rgba(11, 23, 47, 0.80) 0%, rgba(8, 18, 38, 0.76) 100%)",
              borderColor: "rgba(96, 165, 250, 0.20)",
            }}
          >
            <AlertCircle className="w-12 h-12 text-blue-400/70 mx-auto mb-3" />
            <p className="text-slate-100">No active jobs found</p>
            <p className="text-sm text-blue-100/70 mt-1">Try adjusting your filters or search</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bd-glass-card overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(11, 23, 47, 0.82) 0%, rgba(8, 18, 38, 0.78) 100%)",
                borderColor: "rgba(96, 165, 250, 0.22)",
              }}
            >
              {/* Job Header */}
              <div className="p-4 border-b border-blue-300/15">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-blue-200/70">Job #{job.id}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(job.status)} flex items-center gap-1`}
                      >
                        {getStatusIcon(job.status)}
                        {formatStatus(job.status)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-100">{job.customerName}</h3>
                    <p className="text-sm text-blue-100/75">{job.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-blue-200">
                      {job.bidAmount > 0 ? `$${job.bidAmount.toLocaleString()}` : "Bid pending"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-100/70">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Started {job.startDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Due {job.estimatedCompletion}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-4 py-3 bg-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-100/80">Progress</span>
                  <span className="text-sm font-bold text-blue-200">
                    {job.progress}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{ width: `${job.progress}%`, background: `linear-gradient(90deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
                  />
                </div>
              </div>

              {/* Tasks Checklist */}
              <div className="px-4 py-3 border-t border-blue-300/15">
                <h4 className="font-semibold text-sm mb-2 text-blue-100/80">Tasks</h4>
                <div className="space-y-2">
                  {job.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          task.completed
                            ? "border-emerald-400 bg-emerald-500"
                            : "border-blue-300/30 bg-white/8"
                        }`}
                      >
                        {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <span
                        className={`text-sm ${task.completed ? "text-blue-200/60 line-through" : "text-slate-200"}`}
                      >
                        {task.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurance & Notes */}
              <div className="px-4 py-3 bg-blue-500/8 border-t border-blue-300/15">
                {job.insuranceClaim && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-blue-300" />
                      <span className="text-sm font-semibold text-slate-100">Insurance Claim</span>
                    </div>
                    <p className="text-sm text-blue-100/75 ml-6">
                      {job.insuranceCompany} - Claim #{job.claimNumber}
                    </p>
                  </div>
                )}
                {job.notes && (
                  <div>
                    <p className="text-xs font-medium text-blue-200/60 mb-1">Notes:</p>
                    <p className="text-sm text-blue-100/80">{job.notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-blue-300/15">
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
                  <a
                    href={`tel:${job.customerPhone}`}
                    className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-xs">Call</span>
                  </a>
                  <a
                    href={`mailto:${job.customerEmail}`}
                    className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-xs">Email</span>
                  </a>
                  <button className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs">Message</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedJob(job)}
                  className="w-full py-3 min-h-[44px] rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
                >
                  <User className="w-5 h-5" />
                  View Full Details
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Job Detail Modal (placeholder for future expansion) */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div
            className="rounded-t-2xl sm:rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-blue-300/20"
            style={{
              background: "linear-gradient(180deg, rgba(11, 23, 47, 0.95) 0%, rgba(8, 18, 38, 0.92) 100%)",
              boxShadow: "0 20px 60px rgba(3, 10, 24, 0.60)",
            }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">Job #{selectedJob.id}</h2>
                  <p className="text-blue-100/75">{selectedJob.damageType}</p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-blue-200/60 hover:text-slate-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl p-4 bg-white/8 border border-blue-300/15">
                  <h3 className="font-semibold mb-2 text-slate-100">Customer Information</h3>
                  <p className="text-sm text-blue-100/80">
                    <strong className="text-slate-200">Name:</strong> {selectedJob.customerName}
                  </p>
                  <p className="text-sm text-blue-100/80">
                    <strong className="text-slate-200">Email:</strong> {selectedJob.customerEmail}
                  </p>
                  <p className="text-sm text-blue-100/80">
                    <strong className="text-slate-200">Phone:</strong> {selectedJob.customerPhone}
                  </p>
                  <p className="text-sm text-blue-100/80">
                    <strong className="text-slate-200">Vehicle:</strong> {selectedJob.vehicle}
                  </p>
                </div>

                <div className="rounded-xl p-4 bg-white/8 border border-blue-300/15">
                  <h3 className="font-semibold mb-2 text-slate-100">Job Details</h3>
                  <p className="text-sm text-blue-100/80">
                    <strong className="text-slate-200">Bid Amount:</strong> ${selectedJob.bidAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-100/80">
                    <strong className="text-slate-200">Start Date:</strong> {selectedJob.startDate}
                  </p>
                  <p className="text-sm text-blue-100/80">
                    <strong className="text-slate-200">Estimated Completion:</strong> {selectedJob.estimatedCompletion}
                  </p>
                  <p className="text-sm text-blue-100/80">
                    <strong className="text-slate-200">Status:</strong> {formatStatus(selectedJob.status)}
                  </p>
                </div>

                {selectedJob.insuranceClaim && (
                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-400/20">
                    <h3 className="font-semibold mb-2 text-blue-200">Insurance Information</h3>
                    <p className="text-sm text-blue-100/80">
                      <strong className="text-slate-200">Company:</strong> {selectedJob.insuranceCompany}
                    </p>
                    <p className="text-sm text-blue-100/80">
                      <strong className="text-slate-200">Claim #:</strong> {selectedJob.claimNumber}
                    </p>
                  </div>
                )}

                <RepairLifecycleTimeline
                  title="Job Lifecycle"
                  subtitle="Standardized execution phases for this repair"
                  steps={shopLifecycle(selectedJob.status)}
                  compact
                />

                <button
                  onClick={() => setSelectedJob(null)}
                  className="w-full py-3 min-h-[44px] rounded-xl font-medium text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
