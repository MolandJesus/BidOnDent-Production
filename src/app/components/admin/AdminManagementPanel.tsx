import { motion, useReducedMotion } from "motion/react";
import { Shield, UserMinus, UserPlus } from "lucide-react";

type AdminManagementPanelProps = {
  primaryColor: string;
  targetAdminEmail: string;
  isManagingAdmin: boolean;
  adminManagementStatus: string;
  onTargetAdminEmailChange: (value: string) => void;
  onPromote: () => void;
  onRevoke: () => void;
};

export default function AdminManagementPanel({
  primaryColor,
  targetAdminEmail,
  isManagingAdmin,
  adminManagementStatus,
  onTargetAdminEmailChange,
  onPromote,
  onRevoke,
}: AdminManagementPanelProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3, delay: 0.15 }}
      className="bd-glass-card rounded-lg p-6 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5" style={{ color: primaryColor }} />
        Admin Management
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full ml-2">
          Super Admin Only
        </span>
      </h2>

      <p className="text-sm text-slate-400 mb-4">
        Promote or demote users to grant/revoke admin dashboard access. Admin accounts can access
        the Admin Dashboard but cannot promote others (only you can).
      </p>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Enter email address to promote/demote"
            value={targetAdminEmail}
            onChange={(e) => onTargetAdminEmailChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-white/[0.12] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isManagingAdmin}
          />
          <button
            onClick={onPromote}
            disabled={isManagingAdmin || !targetAdminEmail}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Promote to Admin
          </button>
          <button
            onClick={onRevoke}
            disabled={isManagingAdmin || !targetAdminEmail}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <UserMinus className="w-4 h-4" />
            Revoke Admin
          </button>
        </div>

        {adminManagementStatus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            className={`p-4 rounded-lg whitespace-pre-wrap ${
              adminManagementStatus.startsWith("✅")
                ? "bg-green-400/10 text-green-300 border border-green-400/30"
                : "bg-red-400/10 text-red-300 border border-red-400/30"
            }`}
          >
            {adminManagementStatus}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
