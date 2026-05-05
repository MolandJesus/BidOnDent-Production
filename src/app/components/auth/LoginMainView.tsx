import { motion, useReducedMotion } from "motion/react";
import { Car, Wrench, Shield, ChevronRight } from "lucide-react";
import type { LoginView } from "../../types";

interface LoginMainViewProps {
  primaryColor: string;
  onUserTypeSelect: (type: "customer" | "shop" | "insurer") => void;
  onLoginViewChange: (view: LoginView) => void;
}

export function LoginMainView({
  primaryColor,
  onUserTypeSelect,
  onLoginViewChange,
}: LoginMainViewProps) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="space-y-4">
      <p className="text-slate-300/80 mb-6">Choose how you want to use BidOnDent</p>

      <motion.button
        onClick={() => {
          onUserTypeSelect("customer");
          onLoginViewChange("signup");
        }}
        className="bd-glass-card w-full py-3 px-4 border-2 border-transparent font-medium hover:border-blue-200/40 transition-colors text-left flex items-center justify-between"
        style={{ borderColor: primaryColor }}
        type="button"
        whileHover={{ x: 4 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.3, delay: 0.1 }}
      >
        <div className="flex items-center">
          <Car className="w-6 h-6 mr-3" style={{ color: primaryColor }} />
          <div>
            <div className="font-semibold">I need repairs</div>
            <div className="text-sm text-gray-500">Customer Account</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </motion.button>

      <motion.button
        onClick={() => {
          onUserTypeSelect("shop");
          onLoginViewChange("signup");
        }}
        className="bd-glass-card w-full py-3 px-4 border-2 border-transparent font-medium hover:border-blue-200/40 transition-colors text-left flex items-center justify-between"
        style={{ borderColor: primaryColor }}
        type="button"
        whileHover={{ x: 4 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.3, delay: 0.2 }}
      >
        <div className="flex items-center">
          <Wrench className="w-6 h-6 mr-3" style={{ color: primaryColor }} />
          <div>
            <div className="font-semibold">I'm an auto body repair shop</div>
            <div className="text-sm text-gray-500">Shop Account</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </motion.button>

      <motion.button
        onClick={() => {
          onUserTypeSelect("insurer");
          onLoginViewChange("signup");
        }}
        className="bd-glass-card w-full py-3 px-4 border-2 border-transparent font-medium hover:border-blue-200/40 transition-colors text-left flex items-center justify-between"
        style={{ borderColor: primaryColor }}
        type="button"
        whileHover={{ x: 4 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.3, delay: 0.3 }}
      >
        <div className="flex items-center">
          <Shield className="w-6 h-6 mr-3" style={{ color: primaryColor }} />
          <div>
            <div className="font-semibold">I'm an insurer</div>
            <div className="text-sm text-gray-500">Insurance Company</div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </motion.button>
    </div>
  );
}
