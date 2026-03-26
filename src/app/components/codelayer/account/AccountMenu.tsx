import {
  Car as CarIcon,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
  Shield,
  Trash2,
  CheckSquare,
} from "lucide-react";
import { motion } from "motion/react";

type AccountMenuProps = {
  userType: string;
  isAdmin?: boolean;
  onOpenSettings: () => void;
  onOpenPayment: () => void;
  onOpenShopProfile: () => void;
  onOpenHelp: () => void;
  onOpenSmokeTest?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenDeleteAccount: () => void;
  onLogout: () => void;
  onViewVehicles?: () => void;
};

export default function AccountMenu({
  userType,
  isAdmin,
  onOpenSettings,
  onOpenPayment,
  onOpenShopProfile,
  onOpenHelp,
  onOpenSmokeTest,
  onOpenAdminPanel,
  onOpenDeleteAccount,
  onLogout,
  onViewVehicles,
}: AccountMenuProps) {
  const rowBaseClass =
    "w-full py-3.5 px-4 flex items-center justify-between rounded-xl transition-colors";

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="bd-glass-card rounded-2xl p-3 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(11, 23, 47, 0.88) 0%, rgba(8, 18, 38, 0.84) 100%)",
        borderColor: "rgba(96, 165, 250, 0.22)",
      }}
    >
      {/* Subtle decorative orb */}
      <div
        className="absolute -left-10 bottom-8 w-28 h-28 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="space-y-1.5">
        <button className={`${rowBaseClass} hover:bg-blue-400/12`} onClick={onOpenSettings}>
          <div className="flex items-center">
            <span className="w-9 h-9 rounded-lg bg-blue-400/12 text-blue-100 flex items-center justify-center mr-3 border border-blue-300/20">
              <Settings className="w-5 h-5" />
            </span>
            <span className="font-medium text-slate-100">Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-100/70" />
        </button>
        <button className={`${rowBaseClass} hover:bg-blue-400/12`} onClick={onOpenPayment}>
          <div className="flex items-center">
            <span className="w-9 h-9 rounded-lg bg-blue-400/12 text-blue-100 flex items-center justify-center mr-3 border border-blue-300/20">
              <CreditCard className="w-5 h-5" />
            </span>
            <span className="font-medium text-slate-100">Payment Methods</span>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-100/70" />
        </button>

        {userType === "customer" && (
          <button className={`${rowBaseClass} hover:bg-blue-400/12`} onClick={onViewVehicles}>
            <div className="flex items-center">
              <span className="w-9 h-9 rounded-lg bg-blue-400/12 text-blue-100 flex items-center justify-center mr-3 border border-blue-300/20">
                <CarIcon className="w-5 h-5" />
              </span>
              <span className="font-medium text-slate-100">My Vehicles</span>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-100/70" />
          </button>
        )}

        {userType === "shop" && (
          <button className={`${rowBaseClass} hover:bg-blue-400/12`} onClick={onOpenShopProfile}>
            <div className="flex items-center">
              <span className="w-9 h-9 rounded-lg bg-blue-400/12 text-blue-100 flex items-center justify-center mr-3 border border-blue-300/20">
                <Settings className="w-5 h-5" />
              </span>
              <span className="font-medium text-slate-100">Shop Profile</span>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-100/70" />
          </button>
        )}

        <button className={`${rowBaseClass} hover:bg-blue-400/12`} onClick={onOpenHelp}>
          <div className="flex items-center">
            <span className="w-9 h-9 rounded-lg bg-blue-400/12 text-blue-100 flex items-center justify-center mr-3 border border-blue-300/20">
              <HelpCircle className="w-5 h-5" />
            </span>
            <span className="font-medium text-slate-100">Help & Support</span>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-100/70" />
        </button>

        {isAdmin && onOpenAdminPanel && (
          <button className={`${rowBaseClass} hover:bg-indigo-400/12`} onClick={onOpenAdminPanel}>
            <div className="flex items-center">
              <span className="w-9 h-9 rounded-lg bg-indigo-400/15 text-indigo-200 flex items-center justify-center mr-3 border border-indigo-300/25">
                <Shield className="w-5 h-5" />
              </span>
              <span className="font-medium text-indigo-100">Admin Panel</span>
            </div>
            <ChevronRight className="w-5 h-5 text-indigo-200/70" />
          </button>
        )}

        {import.meta.env.DEV && onOpenSmokeTest && (
          <button className={`${rowBaseClass} hover:bg-blue-400/12`} onClick={onOpenSmokeTest}>
            <div className="flex items-center">
              <span className="w-9 h-9 rounded-lg bg-blue-400/12 text-blue-100 flex items-center justify-center mr-3 border border-blue-300/20">
                <CheckSquare className="w-5 h-5" />
              </span>
              <span className="font-medium text-slate-100">Smoke Test Checklist</span>
            </div>
            <ChevronRight className="w-5 h-5 text-blue-100/70" />
          </button>
        )}

        <button
          className={`${rowBaseClass} hover:bg-rose-400/12 text-rose-300`}
          onClick={onOpenDeleteAccount}
        >
          <div className="flex items-center">
            <span className="w-9 h-9 rounded-lg bg-rose-400/12 text-rose-300 flex items-center justify-center mr-3 border border-rose-300/25">
              <Trash2 className="w-5 h-5" />
            </span>
            <span className="font-medium text-rose-300">Delete Account</span>
          </div>
        </button>

        <button className={`${rowBaseClass} hover:bg-blue-400/12`} onClick={onLogout}>
          <div className="flex items-center">
            <span className="w-9 h-9 rounded-lg bg-blue-400/12 text-blue-100 flex items-center justify-center mr-3 border border-blue-300/20">
              <LogOut className="w-5 h-5" />
            </span>
            <span className="font-medium text-blue-100">Sign Out</span>
          </div>
        </button>
      </div>
    </motion.section>
  );
}
