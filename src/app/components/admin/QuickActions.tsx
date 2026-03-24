import { motion } from "motion/react";
import { Database, HardDrive, RefreshCw, UserPlus } from "lucide-react";

type QuickActionsProps = {
  primaryColor: string;
  isLoading: boolean;
  showNewAccountForm: boolean;
  operationStatus: string;
  onCheckAllAccounts: () => void;
  onToggleNewAccountForm: () => void;
  onCheckEdgeFunctionHealth: () => void;
  onVerifyDatabase: () => void;
};

export default function QuickActions({
  primaryColor,
  isLoading,
  showNewAccountForm,
  operationStatus,
  onCheckAllAccounts,
  onToggleNewAccountForm,
  onCheckEdgeFunctionHealth,
  onVerifyDatabase,
}: QuickActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bd-glass-card rounded-lg p-6 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Database className="w-5 h-5" style={{ color: primaryColor }} />
        Quick Actions
      </h2>

      <div className="flex gap-3">
        <button
          onClick={onCheckAllAccounts}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Check All Accounts
        </button>

        <button
          onClick={onToggleNewAccountForm}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          {showNewAccountForm ? "Cancel" : "Create Custom Test Account"}
        </button>

        <button
          onClick={onCheckEdgeFunctionHealth}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <HardDrive className="w-4 h-4" />
          Check Edge Function Health
        </button>

        <button
          onClick={onVerifyDatabase}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Database className="w-4 h-4" />
          Verify Database
        </button>
      </div>

      {operationStatus && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={`mt-4 p-4 rounded-lg whitespace-pre-wrap ${
            operationStatus.startsWith("✅")
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {operationStatus}
        </motion.div>
      )}
    </motion.div>
  );
}
