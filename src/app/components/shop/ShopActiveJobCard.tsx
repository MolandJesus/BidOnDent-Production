import {
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Mail,
  MessageSquare,
  Package,
  Phone,
  Star,
  User,
  Wrench,
} from "lucide-react";

type JobTask = { id: number; name: string; completed: boolean };

type ActiveJob = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: string;
  damageType: string;
  bidAmount: number;
  startDate: string;
  estimatedCompletion: string;
  status: string;
  progress: number;
  tasks: JobTask[];
  insuranceClaim: boolean;
  insuranceCompany: string;
  claimNumber: string;
  notes: string;
};

type ShopActiveJobCardProps = {
  job: ActiveJob;
  isLight: boolean;
  primaryColor: string;
  onViewDetails: (job: ActiveJob) => void;
};

function getStatusColor(status: string, isLight: boolean) {
  if (isLight) {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "awaiting-parts":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "completed":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-slate-100 text-slate-600 border-slate-300";
    }
  }
  switch (status) {
    case "pending":
      return "bg-yellow-500/15 text-yellow-300 border-yellow-400/25";
    case "in-progress":
      return "bg-blue-500/15 text-blue-300 border-blue-400/25";
    case "awaiting-parts":
      return "bg-orange-500/15 text-orange-300 border-orange-400/25";
    case "completed":
      return "bg-green-500/15 text-green-300 border-green-400/25";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-400/25";
  }
}

function getStatusIcon(status: string) {
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
}

function formatStatus(status: string) {
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export type { ActiveJob };
export { getStatusColor, formatStatus };

export default function ShopActiveJobCard({
  job,
  isLight,
  primaryColor,
  onViewDetails,
}: ShopActiveJobCardProps) {
  return (
    <div
      className={`bd-glass-card overflow-hidden${isLight ? " bd-light-surface" : ""}`}
      style={
        isLight
          ? {}
          : {
              background:
                "linear-gradient(180deg, rgba(11, 23, 47, 0.82) 0%, rgba(8, 18, 38, 0.78) 100%)",
              borderColor: "rgba(96, 165, 250, 0.22)",
            }
      }
    >
      {/* Job Header */}
      <div className={`p-4 border-b ${isLight ? "border-slate-200/60" : "border-blue-300/15"}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-sm font-medium ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
              >
                Job #{typeof job.id === "string" && job.id.length > 8 ? job.id.slice(0, 8).toUpperCase() : job.id}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(job.status, isLight)} flex items-center gap-1`}
              >
                {getStatusIcon(job.status)}
                {formatStatus(job.status)}
              </span>
            </div>
            <h3 className={`font-bold text-lg ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              {job.customerName}
            </h3>
            <p className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/75"}`}>
              {job.vehicle}
            </p>
          </div>
          <div className="text-right">
            <p className={`font-bold text-lg ${isLight ? "text-blue-600" : "text-blue-200"}`}>
              {job.bidAmount > 0
                ? `$${job.bidAmount.toLocaleString()}`
                : job.tasks.some((t) => t.name === "Bid Accepted" && t.completed)
                  ? "Bid accepted"
                  : "Bid pending"}
            </p>
          </div>
        </div>

        <div
          className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${isLight ? "text-slate-500" : "text-blue-100/70"}`}
        >
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
      <div className={`px-4 py-3 ${isLight ? "bg-slate-50" : "bg-white/5"}`}>
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm font-medium ${isLight ? "text-slate-700" : "text-blue-100/80"}`}
          >
            Progress
          </span>
          <span className={`text-sm font-bold ${isLight ? "text-blue-600" : "text-blue-200"}`}>
            {job.progress}%
          </span>
        </div>
        <div
          className={`h-2 rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-white/10"}`}
        >
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${job.progress}%`,
              background: `linear-gradient(90deg, ${primaryColor} 0%, #0f8fd7 100%)`,
            }}
          />
        </div>
      </div>

      {/* Tasks Checklist */}
      <div
        className={`px-4 py-3 border-t ${isLight ? "border-slate-200/60" : "border-blue-300/15"}`}
      >
        <h4
          className={`font-semibold text-sm mb-2 ${isLight ? "text-slate-700" : "text-blue-100/80"}`}
        >
          Workflow
        </h4>
        <div className="space-y-2">
          {job.tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  task.completed
                    ? "border-emerald-400 bg-emerald-500"
                    : isLight
                      ? "border-slate-300 bg-white"
                      : "border-blue-300/30 bg-white/8"
                }`}
              >
                {task.completed && <CheckCircle className="w-4 h-4 text-white" />}
              </div>
              <span
                className={`text-sm ${
                  task.completed
                    ? isLight
                      ? "text-slate-400 line-through"
                      : "text-blue-200/60 line-through"
                    : isLight
                      ? "text-slate-800"
                      : "text-slate-200"
                }`}
              >
                {task.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Insurance & Notes */}
      <div
        className={`px-4 py-3 border-t ${isLight ? "bg-slate-50 border-slate-200/60" : "bg-blue-500/8 border-blue-300/15"}`}
      >
        {job.insuranceClaim && (
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <Star className={`w-4 h-4 ${isLight ? "text-blue-500" : "text-blue-300"}`} />
              <span
                className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
              >
                Insurance Claim
              </span>
            </div>
            <p className={`text-sm ml-6 ${isLight ? "text-slate-600" : "text-blue-100/75"}`}>
              {job.insuranceCompany} - Claim #{job.claimNumber}
            </p>
          </div>
        )}
        {job.notes && (
          <div>
            <p
              className={`text-xs font-medium mb-1 ${isLight ? "text-slate-500" : "text-blue-200/60"}`}
            >
              Notes:
            </p>
            <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
              {job.notes}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={`p-4 border-t ${isLight ? "border-slate-200/60" : "border-blue-300/15"}`}>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
          {job.customerPhone && job.customerPhone !== "Not provided" ? (
            <a
              href={`tel:${job.customerPhone}`}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isLight ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200" : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"}`}
            >
              <Phone className="w-4 h-4" />
              <span className="text-xs">Call</span>
            </a>
          ) : (
            <span
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed ${isLight ? "text-slate-600 bg-slate-100 border border-slate-200" : "text-blue-100/80 bg-white/8 border border-blue-300/15"}`}
              title="Contact info not available"
            >
              <Phone className="w-4 h-4" />
              <span className="text-xs">Call</span>
            </span>
          )}
          {job.customerEmail && job.customerEmail !== "Not provided" ? (
            <a
              href={`mailto:${job.customerEmail}`}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isLight ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200" : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"}`}
            >
              <Mail className="w-4 h-4" />
              <span className="text-xs">Email</span>
            </a>
          ) : (
            <span
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed ${isLight ? "text-slate-600 bg-slate-100 border border-slate-200" : "text-blue-100/80 bg-white/8 border border-blue-300/15"}`}
              title="Contact info not available"
            >
              <Mail className="w-4 h-4" />
              <span className="text-xs">Email</span>
            </span>
          )}
          <button
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isLight ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200" : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs">Message</span>
          </button>
        </div>

        <button
          onClick={() => onViewDetails(job)}
          className="w-full py-3 min-h-[44px] rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
          }}
        >
          <User className="w-5 h-5" />
          View Full Details
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
