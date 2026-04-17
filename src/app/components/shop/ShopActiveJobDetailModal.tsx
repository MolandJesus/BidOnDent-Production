import { PlayCircle, Package, CheckCircle2, X } from "lucide-react";
import RepairLifecycleTimeline from "../workflow/RepairLifecycleTimeline";
import { shopLifecycle } from "../workflow/lifecycle-presets";
import { formatStatus, type ActiveJob } from "./ShopActiveJobCard";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type ShopActiveJobDetailModalProps = {
  job: ActiveJob;
  isLight: boolean;
  appearanceMode: DashboardAppearanceMode;
  onClose: () => void;
  onUpdateStatus?: (jobId: string, status: string) => void;
};

export default function ShopActiveJobDetailModal({
  job,
  isLight,
  appearanceMode,
  onClose,
  onUpdateStatus,
}: ShopActiveJobDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div
        className={`rounded-t-2xl sm:rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto border ${isLight ? "bg-white border-slate-200/60 shadow-xl" : "border-blue-300/20"}`}
        style={
          isLight
            ? {}
            : {
                background:
                  "linear-gradient(180deg, rgba(11, 23, 47, 0.95) 0%, rgba(8, 18, 38, 0.92) 100%)",
                boxShadow: "0 20px 60px rgba(3, 10, 24, 0.60)",
              }
        }
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className={`text-2xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Job #{typeof job.id === "string" && job.id.length > 8 ? job.id.slice(0, 8).toUpperCase() : job.id}
              </h2>
              <p className={isLight ? "text-slate-600" : "text-blue-100/75"}>{job.damageType}</p>
            </div>
            <button
              onClick={onClose}
              className={`transition-colors ${isLight ? "text-slate-400 hover:text-slate-700" : "text-blue-200/60 hover:text-slate-100"}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div
              className={`rounded-xl p-4 border ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/8 border-blue-300/15"}`}
            >
              <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Customer Information
              </h3>
              <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                <strong className={isLight ? "text-slate-900" : "text-slate-200"}>Name:</strong>{" "}
                {job.customerName}
              </p>
              <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                <strong className={isLight ? "text-slate-900" : "text-slate-200"}>Email:</strong>{" "}
                {job.customerEmail}
              </p>
              <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                <strong className={isLight ? "text-slate-900" : "text-slate-200"}>Phone:</strong>{" "}
                {job.customerPhone?.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") ?? "—"}
              </p>
              <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                <strong className={isLight ? "text-slate-900" : "text-slate-200"}>Vehicle:</strong>{" "}
                {job.vehicle}
              </p>
            </div>

            <div
              className={`rounded-xl p-4 border ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/8 border-blue-300/15"}`}
            >
              <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Job Details
              </h3>
              <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                <strong className={isLight ? "text-slate-900" : "text-slate-200"}>
                  Bid Amount:
                </strong>{" "}
                ${job.bidAmount.toLocaleString()}
              </p>
              <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                <strong className={isLight ? "text-slate-900" : "text-slate-200"}>
                  Start Date:
                </strong>{" "}
                {job.startDate}
              </p>
              <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                <strong className={isLight ? "text-slate-900" : "text-slate-200"}>
                  Estimated Completion:
                </strong>{" "}
                {job.estimatedCompletion}
              </p>
              <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                <strong className={isLight ? "text-slate-900" : "text-slate-200"}>Status:</strong>{" "}
                {formatStatus(job.status)}
              </p>
            </div>

            {job.insuranceClaim && (
              <div
                className={`p-4 rounded-xl border ${isLight ? "bg-blue-50 border-blue-200" : "bg-blue-500/10 border-blue-400/20"}`}
              >
                <h3 className={`font-semibold mb-2 ${isLight ? "text-blue-700" : "text-blue-200"}`}>
                  Insurance Information
                </h3>
                <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                  <strong className={isLight ? "text-slate-900" : "text-slate-200"}>
                    Company:
                  </strong>{" "}
                  {job.insuranceCompany}
                </p>
                <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                  <strong className={isLight ? "text-slate-900" : "text-slate-200"}>
                    Claim #:
                  </strong>{" "}
                  {job.claimNumber}
                </p>
              </div>
            )}

            <RepairLifecycleTimeline
              title="Job Lifecycle"
              subtitle="Track your repair progress step by step"
              steps={shopLifecycle(job.status)}
              compact
              appearanceMode={appearanceMode}
            />

            {/* Status update actions */}
            {onUpdateStatus && job.status !== "completed" && (
              <div className="space-y-2">
                <h3
                  className={`font-semibold text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}
                >
                  Update Status
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.status === "pending" && (
                    <button
                      onClick={() => onUpdateStatus(job.id, "in-progress")}
                      className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #003d82 0%, #0f8fd7 100%)",
                      }}
                    >
                      <PlayCircle className="w-4 h-4" />
                      Start Repair
                    </button>
                  )}
                  {(job.status === "pending" || job.status === "in-progress") && (
                    <button
                      onClick={() => onUpdateStatus(job.id, "awaiting-parts")}
                      className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
                        isLight
                          ? "text-orange-700 bg-orange-50 border border-orange-200 hover:bg-orange-100"
                          : "text-orange-300 bg-orange-500/15 border border-orange-400/25 hover:bg-orange-500/25"
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      Awaiting Parts
                    </button>
                  )}
                  {job.status !== "pending" && (
                    <button
                      onClick={() => onUpdateStatus(job.id, "completed")}
                      className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
                        isLight
                          ? "text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                          : "text-emerald-300 bg-emerald-500/15 border border-emerald-400/25 hover:bg-emerald-500/25"
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Completed
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className={`w-full py-3 min-h-[44px] rounded-xl font-medium transition-colors ${isLight ? "text-slate-700 border border-slate-200 hover:bg-slate-50" : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"}`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
