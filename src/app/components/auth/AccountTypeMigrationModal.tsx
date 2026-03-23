// Account Type Migration Modal - One-time prompt for existing users
import { motion } from "motion/react";
import { Car, Wrench, Shield, AlertCircle } from "lucide-react";

interface AccountTypeMigrationModalProps {
  show: boolean;
  email: string;
  primaryColor: string;
  onSelectAccountType: (type: "customer" | "shop" | "insurer") => void;
  onClose: () => void;
}

export default function AccountTypeMigrationModal({
  show,
  email,
  primaryColor,
  onSelectAccountType,
  onClose,
}: AccountTypeMigrationModalProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(0, 61, 130, 0.95) 0%, rgba(0, 93, 166, 0.95) 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <AlertCircle className="w-6 h-6" style={{ color: primaryColor }} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-1">Account Type Required</h3>
            <p className="text-gray-600 text-sm">
              We need to know what type of account this is. This will be permanent.
            </p>
          </div>
        </div>

        {/* Email Display */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-600 mb-1">Logged in as:</p>
          <p className="font-semibold text-gray-900">{email}</p>
        </div>

        {/* Account Type Selection */}
        <div className="space-y-3 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">What type of account is this?</p>

          <motion.button
            onClick={() => onSelectAccountType("customer")}
            className="bd-glass-card w-full py-4 px-4 border-2 border-transparent font-medium hover:border-blue-200/40 transition-all text-left flex items-center gap-3"
            style={{ borderColor: primaryColor }}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0, 61, 130, 0.15)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Car className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">Customer</div>
              <div className="text-sm text-gray-600">I need auto body repairs for my vehicle</div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => onSelectAccountType("shop")}
            className="bd-glass-card w-full py-4 px-4 border-2 border-transparent font-medium hover:border-blue-200/40 transition-all text-left flex items-center gap-3"
            style={{ borderColor: primaryColor }}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0, 61, 130, 0.15)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Wrench className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">Auto Body Shop</div>
              <div className="text-sm text-gray-600">
                I run a repair shop and want to receive bids
              </div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => onSelectAccountType("insurer")}
            className="bd-glass-card w-full py-4 px-4 border-2 border-transparent font-medium hover:border-blue-200/40 transition-all text-left flex items-center gap-3"
            style={{ borderColor: primaryColor }}
            whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(0, 61, 130, 0.15)" }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Shield className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg">Insurance Company</div>
              <div className="text-sm text-gray-600">
                I work for an insurance company managing claims
              </div>
            </div>
          </motion.button>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> This selection is permanent and cannot be changed later. Choose
            the option that matches how you originally created this account.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
