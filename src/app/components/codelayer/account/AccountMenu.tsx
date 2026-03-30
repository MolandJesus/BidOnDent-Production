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
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type AccountMenuProps = {
  userType: string;
  isAdmin?: boolean;
  appearanceMode?: DashboardAppearanceMode;
  onOpenSettings: () => void;
  onOpenPayment: () => void;
  onOpenShopProfile: () => void;
  onOpenHelp: () => void;
  onOpenSmokeTest?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenDeleteAccount?: () => void;
  onLogout: () => void;
  onViewVehicles?: () => void;
};

export default function AccountMenu({
  userType,
  isAdmin,
  appearanceMode = "map-dark",
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
  const isLight = appearanceMode === "light";

  const rowBaseClass =
    "w-full py-3.5 px-4 flex items-center justify-between rounded-xl transition-colors";

  const rowHover = isLight ? "hover:bg-blue-50/80" : "hover:bg-blue-400/12";
  const iconBox = isLight
    ? "bg-blue-50 text-blue-600 border-blue-200/30"
    : "bg-blue-400/12 text-blue-100 border-blue-300/20";
  const labelColor = isLight ? "text-slate-700" : "text-slate-100";
  const chevronColor = isLight ? "text-slate-400" : "text-blue-100/70";

  return (
    <motion.section
      aria-label="Account quick actions"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className={`rounded-2xl p-3 relative overflow-hidden border ${
        isLight ? "border-blue-200/25" : "bd-glass-card"
      }`}
      style={{
        background: isLight
          ? "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(241,247,255,0.88) 100%)"
          : "linear-gradient(180deg, rgba(11, 23, 47, 0.88) 0%, rgba(8, 18, 38, 0.84) 100%)",
        borderColor: isLight ? undefined : "rgba(96, 165, 250, 0.22)",
      }}
    >
      {/* Subtle decorative orb */}
      <div
        className="absolute -left-10 bottom-8 w-28 h-28 rounded-full pointer-events-none"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="space-y-1.5">
        <button className={`${rowBaseClass} ${rowHover}`} onClick={onOpenSettings} type="button">
          <div className="flex items-center">
            <span
              className={`w-10 h-10 rounded-[1rem] flex items-center justify-center mr-3 border ${iconBox}`}
            >
              <Settings className="w-5 h-5" />
            </span>
            <span className={`font-medium ${labelColor}`}>Appearance Settings</span>
          </div>
          <ChevronRight className={`w-5 h-5 ${chevronColor}`} />
        </button>
        <button className={`${rowBaseClass} ${rowHover}`} onClick={onOpenPayment} type="button">
          <div className="flex items-center">
            <span
              className={`w-10 h-10 rounded-[1rem] flex items-center justify-center mr-3 border ${iconBox}`}
            >
              <CreditCard className="w-5 h-5" />
            </span>
            <span className={`font-medium ${labelColor}`}>Payment Preview</span>
          </div>
          <ChevronRight className={`w-5 h-5 ${chevronColor}`} />
        </button>

        {userType === "customer" && (
          <button className={`${rowBaseClass} ${rowHover}`} onClick={onViewVehicles} type="button">
            <div className="flex items-center">
              <span
                className={`w-10 h-10 rounded-[1rem] flex items-center justify-center mr-3 border ${iconBox}`}
              >
                <CarIcon className="w-5 h-5" />
              </span>
              <span className={`font-medium ${labelColor}`}>My Vehicles</span>
            </div>
            <ChevronRight className={`w-5 h-5 ${chevronColor}`} />
          </button>
        )}

        {userType === "shop" && (
          <button
            className={`${rowBaseClass} ${rowHover}`}
            onClick={onOpenShopProfile}
            type="button"
          >
            <div className="flex items-center">
              <span
                className={`w-10 h-10 rounded-[1rem] flex items-center justify-center mr-3 border ${iconBox}`}
              >
                <Settings className="w-5 h-5" />
              </span>
              <span className={`font-medium ${labelColor}`}>Shop Profile</span>
            </div>
            <ChevronRight className={`w-5 h-5 ${chevronColor}`} />
          </button>
        )}

        <button className={`${rowBaseClass} ${rowHover}`} onClick={onOpenHelp} type="button">
          <div className="flex items-center">
            <span
              className={`w-10 h-10 rounded-[1rem] flex items-center justify-center mr-3 border ${iconBox}`}
            >
              <HelpCircle className="w-5 h-5" />
            </span>
            <span className={`font-medium ${labelColor}`}>Help & Support</span>
          </div>
          <ChevronRight className={`w-5 h-5 ${chevronColor}`} />
        </button>

        {isAdmin && onOpenAdminPanel && (
          <button
            className={`${rowBaseClass} ${isLight ? "hover:bg-indigo-50/80" : "hover:bg-indigo-400/12"}`}
            onClick={onOpenAdminPanel}
            type="button"
          >
            <div className="flex items-center">
              <span
                className={`w-10 h-10 rounded-[1rem] flex items-center justify-center mr-3 border ${
                  isLight
                    ? "bg-indigo-50 text-indigo-600 border-indigo-200/30"
                    : "bg-indigo-400/15 text-indigo-200 border-indigo-300/25"
                }`}
              >
                <Shield className="w-5 h-5" />
              </span>
              <span className={`font-medium ${isLight ? "text-indigo-700" : "text-indigo-100"}`}>
                Admin Panel
              </span>
            </div>
            <ChevronRight
              className={`w-5 h-5 ${isLight ? "text-indigo-400" : "text-indigo-200/70"}`}
            />
          </button>
        )}

        {import.meta.env.DEV && onOpenSmokeTest && (
          <button className={`${rowBaseClass} ${rowHover}`} onClick={onOpenSmokeTest} type="button">
            <div className="flex items-center">
              <span
                className={`w-10 h-10 rounded-[1rem] flex items-center justify-center mr-3 border ${iconBox}`}
              >
                <CheckSquare className="w-5 h-5" />
              </span>
              <span className={`font-medium ${labelColor}`}>Smoke Test Checklist</span>
            </div>
            <ChevronRight className={`w-5 h-5 ${chevronColor}`} />
          </button>
        )}

        <button
          className={`${rowBaseClass} ${onOpenDeleteAccount ? (isLight ? "hover:bg-rose-50/80 text-rose-600" : "hover:bg-rose-400/12 text-rose-300") : "opacity-40 cursor-not-allowed"}`}
          onClick={onOpenDeleteAccount}
          disabled={!onOpenDeleteAccount}
          type="button"
        >
          <div className="flex items-center">
            <span
              className={`w-10 h-10 rounded-[1rem] flex items-center justify-center mr-3 border ${
                isLight
                  ? "bg-rose-50 text-rose-500 border-rose-200/30"
                  : "bg-rose-400/12 text-rose-300 border-rose-300/25"
              }`}
            >
              <Trash2 className="w-5 h-5" />
            </span>
            <span className={`font-medium ${isLight ? "text-rose-600" : "text-rose-300"}`}>
              Delete Account
            </span>
          </div>
        </button>

        <button className={`${rowBaseClass} ${rowHover}`} onClick={onLogout} type="button">
          <div className="flex items-center">
            <span
              className={`w-10 h-10 rounded-[1rem] flex items-center justify-center mr-3 border ${iconBox}`}
            >
              <LogOut className="w-5 h-5" />
            </span>
            <span className={`font-medium ${isLight ? "text-blue-600" : "text-blue-100"}`}>
              Sign Out
            </span>
          </div>
        </button>
      </div>
    </motion.section>
  );
}
