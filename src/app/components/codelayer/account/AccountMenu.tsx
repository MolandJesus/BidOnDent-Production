import {
  Car as CarIcon,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  Trash2,
  CheckSquare,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { isAdmin } from "../../../utils/adminCheck";

type AccountMenuProps = {
  userType: string;
  userEmail?: string;
  onOpenSettings: () => void;
  onOpenPayment: () => void;
  onOpenShopProfile: () => void;
  onOpenHelp: () => void;
  onOpenSmokeTest?: () => void;
  onOpenAdmin?: () => void;
  onOpenDeleteAccount: () => void;
  onLogout: () => void;
  onViewVehicles?: () => void;
};

export default function AccountMenu({
  userType,
  userEmail,
  onOpenSettings,
  onOpenPayment,
  onOpenShopProfile,
  onOpenHelp,
  onOpenSmokeTest,
  onOpenAdmin,
  onOpenDeleteAccount,
  onLogout,
  onViewVehicles,
}: AccountMenuProps) {
  const rowBaseClass =
    "w-full py-3.5 px-4 flex items-center justify-between rounded-xl transition-colors";
  const canAccessAdmin = isAdmin(userEmail);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3"
    >
      <div className="space-y-1.5">
        <button className={`${rowBaseClass} hover:bg-slate-50`} onClick={onOpenSettings}>
          <div className="flex items-center">
            <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mr-3">
              <Settings className="w-5 h-5" />
            </span>
            <span className="font-medium text-slate-900">Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
        <button className={`${rowBaseClass} hover:bg-slate-50`} onClick={onOpenPayment}>
          <div className="flex items-center">
            <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mr-3">
              <CreditCard className="w-5 h-5" />
            </span>
            <span className="font-medium text-slate-900">Payment Methods</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        {userType === "customer" && (
          <button className={`${rowBaseClass} hover:bg-slate-50`} onClick={onViewVehicles}>
            <div className="flex items-center">
              <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mr-3">
                <CarIcon className="w-5 h-5" />
              </span>
              <span className="font-medium text-slate-900">My Vehicles</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        )}

        {userType === "shop" && (
          <button className={`${rowBaseClass} hover:bg-slate-50`} onClick={onOpenShopProfile}>
            <div className="flex items-center">
              <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mr-3">
                <Settings className="w-5 h-5" />
              </span>
              <span className="font-medium text-slate-900">Shop Profile</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        )}

        <button className={`${rowBaseClass} hover:bg-slate-50`} onClick={onOpenHelp}>
          <div className="flex items-center">
            <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mr-3">
              <HelpCircle className="w-5 h-5" />
            </span>
            <span className="font-medium text-slate-900">Help & Support</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>

        {onOpenAdmin && canAccessAdmin && (
          <button className={`${rowBaseClass} hover:bg-slate-50`} onClick={onOpenAdmin}>
            <div className="flex items-center">
              <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mr-3">
                <Shield className="w-5 h-5" />
              </span>
              <span className="font-medium text-slate-900">Admin Dashboard</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        )}

        {onOpenSmokeTest && (
          <button className={`${rowBaseClass} hover:bg-slate-50`} onClick={onOpenSmokeTest}>
            <div className="flex items-center">
              <span className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mr-3">
                <CheckSquare className="w-5 h-5" />
              </span>
              <span className="font-medium text-slate-900">Smoke Test Checklist</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        )}

        <button
          className={`${rowBaseClass} hover:bg-rose-50 text-rose-600`}
          onClick={onOpenDeleteAccount}
        >
          <div className="flex items-center">
            <span className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mr-3">
              <Trash2 className="w-5 h-5" />
            </span>
            <span className="font-medium">Delete Account</span>
          </div>
        </button>

        <button className={`${rowBaseClass} hover:bg-slate-50 text-rose-600`} onClick={onLogout}>
          <div className="flex items-center">
            <span className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mr-3">
              <LogOut className="w-5 h-5" />
            </span>
            <span className="font-medium">Sign Out</span>
          </div>
        </button>
      </div>
    </motion.section>
  );
}
