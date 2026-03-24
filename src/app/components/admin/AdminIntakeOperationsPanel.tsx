import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { Activity, Building2, CircleCheck, Clock3, FileStack, Shield } from "lucide-react";
import {
  loadAdminIntakeOperations,
  updateAdminSubmissionStatus,
  type ActivityEvent,
  type InsurerSubmission,
  type ShopSubmission,
  type SubmissionStatus,
} from "../../services/supabase/adminIntake";

type AdminIntakeOperationsPanelProps = {
  primaryColor: string;
};

export default function AdminIntakeOperationsPanel({
  primaryColor,
}: AdminIntakeOperationsPanelProps) {
  const { getToken } = useClerkAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [shopSubmissions, setShopSubmissions] = useState<ShopSubmission[]>([]);
  const [insurerSubmissions, setInsurerSubmissions] = useState<InsurerSubmission[]>([]);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    setStatusMessage("Loading intake operations data...");

    try {
      const result = await loadAdminIntakeOperations(getToken);

      setShopSubmissions(result.shopSubmissions);
      setInsurerSubmissions(result.insurerSubmissions);
      setActivityEvents(result.activityEvents);

      setStatusMessage("✅ Intake operations data refreshed");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error("Failed to load intake operations data", error);
      setStatusMessage(
        `❌ Unable to load intake operations data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubmissionStatus = async (
    table: "shop_interest_submissions" | "insurer_interest_submissions",
    id: string,
    status: SubmissionStatus
  ) => {
    try {
      await updateAdminSubmissionStatus(getToken, {
        table,
        id,
        status,
      });

      await loadData();
    } catch (error) {
      console.error("Failed to update submission status", error);
      setStatusMessage(
        `❌ Status update failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = useMemo(() => {
    const all = [...shopSubmissions, ...insurerSubmissions];
    const submitted = all.filter((item) => item.status === "submitted").length;
    const reviewing = all.filter((item) => item.status === "reviewing").length;
    const approved = all.filter((item) => item.status === "approved").length;

    return {
      total: all.length,
      submitted,
      reviewing,
      approved,
      events: activityEvents.length,
    };
  }, [shopSubmissions, insurerSubmissions, activityEvents]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bd-glass-card rounded-lg p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileStack className="w-5 h-5" style={{ color: primaryColor }} />
          Intake Operations
        </h2>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50 disabled:opacity-60"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <MetricCard label="Total Intake" value={metrics.total} icon={FileStack} />
        <MetricCard label="Submitted" value={metrics.submitted} icon={Clock3} />
        <MetricCard label="Reviewing" value={metrics.reviewing} icon={Activity} />
        <MetricCard label="Approved" value={metrics.approved} icon={CircleCheck} />
        <MetricCard label="Recent Events" value={metrics.events} icon={Activity} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <SubmissionTable
          title="Shop Applications"
          icon={<Building2 className="w-4 h-4" />}
          rows={shopSubmissions.map((row) => ({
            id: row.id,
            name: row.shop_name,
            contact: row.contact_person,
            email: row.email,
            extra: row.state,
            status: row.status,
            createdAt: row.created_at,
          }))}
          onUpdateStatus={(id, status) =>
            updateSubmissionStatus("shop_interest_submissions", id, status)
          }
        />

        <SubmissionTable
          title="Insurer Partnerships"
          icon={<Shield className="w-4 h-4" />}
          rows={insurerSubmissions.map((row) => ({
            id: row.id,
            name: row.company_name,
            contact: row.contact_person,
            email: row.email,
            extra: "Insurer",
            status: row.status,
            createdAt: row.created_at,
          }))}
          onUpdateStatus={(id, status) =>
            updateSubmissionStatus("insurer_interest_submissions", id, status)
          }
        />
      </div>

      <div className="rounded-lg border border-gray-200 p-3">
        <p className="text-sm font-semibold text-gray-900 mb-2">Recent Workflow Events</p>
        {activityEvents.length === 0 && (
          <p className="text-sm text-gray-500">No events recorded yet.</p>
        )}
        <div className="space-y-1.5 max-h-52 overflow-auto">
          {activityEvents.map((event) => (
            <div
              key={event.id}
              className="text-sm text-gray-700 flex items-center justify-between border-b border-gray-100 pb-1"
            >
              <span className="font-medium">{event.event_type}</span>
              <span className="text-xs text-gray-500">
                {new Date(event.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {statusMessage && (
        <div className="mt-4 text-sm rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700">
          {statusMessage}
        </div>
      )}
    </motion.div>
  );
}

type Row = {
  id: string;
  name: string;
  contact: string;
  email: string;
  extra: string;
  status: SubmissionStatus;
  createdAt: string;
};

function SubmissionTable({
  title,
  icon,
  rows,
  onUpdateStatus,
}: {
  title: string;
  icon: ReactNode;
  rows: Row[];
  onUpdateStatus: (id: string, status: SubmissionStatus) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <p className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
        {icon}
        {title}
      </p>
      <div className="space-y-2 max-h-80 overflow-auto">
        {rows.length === 0 && <p className="text-sm text-gray-500">No submissions yet.</p>}
        {rows.map((row) => (
          <div key={row.id} className="rounded-md border border-gray-100 p-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-900">{row.name}</p>
              <StatusSelect
                value={row.status}
                onChange={(status) => onUpdateStatus(row.id, status)}
              />
            </div>
            <p className="text-xs text-gray-600">
              {row.contact} • {row.email}
            </p>
            <p className="text-xs text-gray-500">{row.extra}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(row.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusSelect({
  value,
  onChange,
}: {
  value: SubmissionStatus;
  onChange: (value: SubmissionStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as SubmissionStatus)}
      className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white"
    >
      <option value="submitted">submitted</option>
      <option value="reviewing">reviewing</option>
      <option value="approved">approved</option>
      <option value="rejected">rejected</option>
    </select>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-3 bg-slate-50">
      <div className="flex items-center gap-2 text-gray-700 mb-1">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
