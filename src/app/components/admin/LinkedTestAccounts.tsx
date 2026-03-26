import { motion } from "motion/react";
import { CheckCircle, LogIn, RefreshCw, Trash2, UserPlus, Users, XCircle } from "lucide-react";
import { TEST_ACCOUNTS } from "../../config/adminConfig";

type AccountStatus = {
  email: string;
  exists: boolean;
  accountType?: string;
  userId?: string;
  name?: string;
  loading: boolean;
  error?: string;
};

type LinkedTestAccountsProps = {
  primaryColor: string;
  accountStatuses: Record<string, AccountStatus>;
  isLoading: boolean;
  onSwitchToAccount: (email: string) => void;
  onDeleteAccount: (email: string) => void;
  onCreateAccount: (email: string, accountType: string) => void;
  onCheckAccount: (email: string) => void;
};

export default function LinkedTestAccounts({
  primaryColor,
  accountStatuses,
  isLoading,
  onSwitchToAccount,
  onDeleteAccount,
  onCreateAccount,
  onCheckAccount,
}: LinkedTestAccountsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bd-glass-card rounded-lg p-6 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" style={{ color: primaryColor }} />
        Linked Test Accounts
      </h2>

      <div className="space-y-4">
        {TEST_ACCOUNTS.map((account, index) => {
          const status = accountStatuses[account.email];

          return (
            <motion.div
              key={account.email}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="border rounded-lg p-4 transition-all border-white/[0.10] hover:border-white/[0.12]"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{account.label}</h3>

                    {/* Status Badge */}
                    {status?.loading ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/[0.06] text-slate-400 text-xs rounded-full">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Checking...
                      </span>
                    ) : status?.exists ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : status ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                        <XCircle className="w-3 h-3" />
                        Not Created
                      </span>
                    ) : null}

                    {/* Account Type Badge */}
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        account.type === "customer"
                          ? "bg-blue-100 text-blue-400"
                          : account.type === "shop"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-400 mb-2">{account.description}</p>
                  <p className="text-sm text-slate-400 font-mono">{account.email}</p>

                  {status?.userId && (
                    <p className="text-xs text-gray-400 mt-1">User ID: {status.userId}</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 ml-4">
                  {status?.exists ? (
                    <>
                      <button
                        onClick={() => onSwitchToAccount(account.email)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <LogIn className="w-4 h-4" />
                        Switch To
                      </button>
                      <button
                        onClick={() => onDeleteAccount(account.email)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </>
                  ) : status && !status.loading ? (
                    <button
                      onClick={() => onCreateAccount(account.email, account.type)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      Create
                    </button>
                  ) : (
                    <button
                      onClick={() => onCheckAccount(account.email)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Check
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
