import { motion } from "motion/react";
import { Lock, Mail, Shield, User, UserPlus } from "lucide-react";

type NewAccountFormProps = {
  primaryColor: string;
  isLoading: boolean;
  newAccountEmail: string;
  newAccountName: string;
  newAccountPassword: string;
  newAccountType: "customer" | "shop" | "insurer";
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTypeChange: (value: "customer" | "shop" | "insurer") => void;
  onCreate: () => void;
  onCancel: () => void;
};

export default function NewAccountForm({
  primaryColor,
  isLoading,
  newAccountEmail,
  newAccountName,
  newAccountPassword,
  newAccountType,
  onEmailChange,
  onNameChange,
  onPasswordChange,
  onTypeChange,
  onCreate,
  onCancel,
}: NewAccountFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bd-glass-card rounded-lg border-2 border-green-300 p-6 mb-6"
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5" style={{ color: primaryColor }} />
        Create Custom Test Account
      </h2>

      <p className="text-sm text-slate-400 mb-4">
        Create a test account for other people or additional testing purposes. This account will be
        fully functional and can be used to test all features.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Email Address *</label>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={newAccountEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="test@example.com"
              className="flex-1 px-3 py-2 border border-white/[0.12] rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Full Name (optional)
          </label>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={newAccountName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="John Doe"
              className="flex-1 px-3 py-2 border border-white/[0.12] rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Password *</label>
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={newAccountPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              placeholder="test123 (min. 6 characters)"
              className="flex-1 px-3 py-2 border border-white/[0.12] rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1 ml-8">
            Tip: Use simple passwords like "test123" for testing accounts
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Account Type *</label>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-400" />
            <select
              value={newAccountType}
              onChange={(e) => onTypeChange(e.target.value as "customer" | "shop" | "insurer")}
              className="flex-1 px-3 py-2 border border-white/[0.12] rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="customer">Customer (Car Owner)</option>
              <option value="shop">Shop (Auto Repair Shop)</option>
              <option value="insurer">Insurer (Insurance Company)</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCreate}
            disabled={isLoading || !newAccountEmail || !newAccountPassword}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {isLoading ? "Creating..." : "Create Account"}
          </button>

          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-slate-300 rounded-lg hover:bg-gray-300 disabled:bg-white/[0.06] disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}
