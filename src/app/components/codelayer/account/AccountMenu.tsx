import {
  Car as CarIcon,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LogOut,
  MapPin,
  Settings,
  Shield,
  Trash2,
  CheckSquare,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type RowTone = "deep" | "blue" | "cyan" | "indigo" | "rose";

type MenuRow = {
  label: string;
  description: string;
  icon: LucideIcon;
  tone: RowTone;
  onClick?: () => void;
  disabled?: boolean;
};

type AccountMenuProps = {
  userType: string;
  isAdmin?: boolean;
  appearanceMode?: DashboardAppearanceMode;
  onOpenSettings: () => void;
  onOpenPayment: () => void;
  onOpenShopProfile: () => void;
  onOpenServiceAreas?: () => void;
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
  onOpenServiceAreas,
  onOpenHelp,
  onOpenSmokeTest,
  onOpenAdminPanel,
  onOpenDeleteAccount,
  onLogout,
  onViewVehicles,
}: AccountMenuProps) {
  const isLight = appearanceMode === "light";

  const rowBaseClass =
    "bd-dashboard-section bd-dashboard-section--interactive flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-colors";
  const labelTone = isLight ? "text-slate-700" : "text-slate-100";
  const subduedLabelTone = isLight ? "text-slate-500" : "text-blue-100/62";

  const rowToneClass: Record<RowTone, string> = {
    deep: "bd-dashboard-section--deep",
    blue: "bd-dashboard-section--accent-blue",
    cyan: "bd-dashboard-section--accent-cyan",
    indigo: "bd-dashboard-section--accent-indigo",
    rose: "bd-dashboard-section--accent-rose",
  };

  const iconToneClass: Record<RowTone, string> = {
    deep: isLight
      ? "border-slate-200/60 bg-slate-100/90 text-slate-700"
      : "border-blue-200/12 bg-slate-900/55 text-slate-100",
    blue: isLight
      ? "border-blue-200/60 bg-white/80 text-blue-700"
      : "border-blue-300/22 bg-blue-400/14 text-blue-100",
    cyan: isLight
      ? "border-cyan-200/60 bg-white/80 text-cyan-700"
      : "border-cyan-300/20 bg-cyan-400/14 text-cyan-100",
    indigo: isLight
      ? "border-indigo-200/60 bg-white/80 text-indigo-700"
      : "border-indigo-300/25 bg-indigo-400/15 text-indigo-100",
    rose: isLight
      ? "border-rose-200/60 bg-white/80 text-rose-600"
      : "border-rose-300/20 bg-rose-400/12 text-rose-200",
  };

  const chevronToneClass: Record<RowTone, string> = {
    deep: isLight ? "text-slate-400" : "text-blue-100/65",
    blue: isLight ? "text-blue-500/70" : "text-blue-100/72",
    cyan: isLight ? "text-cyan-600/70" : "text-cyan-100/70",
    indigo: isLight ? "text-indigo-500/75" : "text-indigo-100/72",
    rose: isLight ? "text-rose-500/70" : "text-rose-200/68",
  };

  const labelToneClass: Record<RowTone, string> = {
    deep: labelTone,
    blue: labelTone,
    cyan: labelTone,
    indigo: isLight ? "text-indigo-700" : "text-indigo-100",
    rose: isLight ? "text-rose-700" : "text-rose-200",
  };

  const descriptionToneClass: Record<RowTone, string> = {
    deep: subduedLabelTone,
    blue: isLight ? "text-blue-600/75" : "text-blue-100/68",
    cyan: isLight ? "text-cyan-700/75" : "text-cyan-100/68",
    indigo: isLight ? "text-indigo-700/70" : "text-indigo-100/68",
    rose: isLight ? "text-rose-700/72" : "text-rose-100/72",
  };

  const preferenceRows: MenuRow[] = [
    {
      label: "Appearance Settings",
      description: "Theme, motion, and overall dashboard feel.",
      icon: Settings,
      tone: "deep",
      onClick: onOpenSettings,
    },
    // Payment Preview hidden until billing is live
  ];

  const profileRows: MenuRow[] = [];

  if (userType === "customer") {
    profileRows.push({
      label: "My Vehicles",
      description: "Manage saved cars for faster report intake.",
      icon: CarIcon,
      tone: "cyan",
      onClick: onViewVehicles,
      disabled: !onViewVehicles,
    });
  }

  if (userType === "shop") {
    profileRows.push({
      label: "Shop Profile",
      description: "Update storefront details and business presence.",
      icon: Settings,
      tone: "cyan",
      onClick: onOpenShopProfile,
    });
    profileRows.push({
      label: "Service Areas",
      description: "Define where you accept repair requests.",
      icon: MapPin,
      tone: "blue",
      onClick: onOpenServiceAreas,
    });
  }

  profileRows.push({
    label: "Help & Support",
    description: "Open guides, troubleshooting, and support details.",
    icon: HelpCircle,
    tone: "indigo",
    onClick: onOpenHelp,
  });

  if (isAdmin && onOpenAdminPanel) {
    profileRows.push({
      label: "Admin Panel",
      description: "Access elevated tools and administrative controls.",
      icon: Shield,
      tone: "indigo",
      onClick: onOpenAdminPanel,
    });
  }

  if (import.meta.env.DEV && onOpenSmokeTest) {
    profileRows.push({
      label: "Smoke Test Checklist",
      description: "Quick QA shortcuts for this local environment.",
      icon: CheckSquare,
      tone: "deep",
      onClick: onOpenSmokeTest,
    });
  }

  const sessionRows: MenuRow[] = [
    {
      label: "Sign Out",
      description: "End your current session on this device.",
      icon: LogOut,
      tone: "deep",
      onClick: onLogout,
    },
    {
      label: "Delete Account",
      description: "Permanently remove profile access and stored account data.",
      icon: Trash2,
      tone: "rose",
      onClick: onOpenDeleteAccount,
      disabled: !onOpenDeleteAccount,
    },
  ];

  const renderRow = ({
    label,
    description,
    icon: Icon,
    tone,
    onClick,
    disabled = false,
  }: MenuRow) => (
    <button
      className={`${rowBaseClass} ${rowToneClass[tone]} ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border ${iconToneClass[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="flex flex-col items-start">
          <span className={`text-sm font-semibold ${labelToneClass[tone]}`}>{label}</span>
          <span className={`mt-1 text-xs leading-5 ${descriptionToneClass[tone]}`}>
            {description}
          </span>
        </span>
      </div>
      <ChevronRight className={`h-5 w-5 shrink-0 ${chevronToneClass[tone]}`} />
    </button>
  );

  return (
    <motion.section
      aria-label="Account quick actions"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
      className="bd-dashboard-panel bd-dashboard-panel--deep relative overflow-hidden rounded-2xl p-4 md:p-5"
    >
      <div
        className="pointer-events-none absolute -left-10 bottom-8 h-28 w-28 rounded-full"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="bd-section-eyebrow mb-1.5">Settings</p>
            <h2
              className={`text-xl font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              Actions & Preferences
            </h2>
            <p className={`mt-1 text-sm ${subduedLabelTone}`}>
              Manage your account settings, preferences, and connected services.
            </p>
          </div>
        </div>

        <div className="bd-dashboard-note rounded-2xl p-3">
          <p className="bd-section-eyebrow mb-2">Preferences</p>
          <div className="space-y-2">
            {preferenceRows.map((row) => (
              <div key={row.label}>{renderRow(row)}</div>
            ))}
          </div>
        </div>

        <div className="bd-dashboard-note bd-dashboard-note--deep rounded-2xl p-3">
          <p className="bd-section-eyebrow mb-2">Profile Tools</p>
          <div className="space-y-2">
            {profileRows.map((row) => (
              <div key={row.label}>{renderRow(row)}</div>
            ))}
          </div>
        </div>

        <div className="bd-dashboard-note rounded-2xl p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="bd-section-eyebrow">Session</p>
            <span className={`text-xs ${subduedLabelTone}`}>Sensitive actions</span>
          </div>
          <div className="space-y-2">
            {sessionRows.map((row) => (
              <div key={row.label}>{renderRow(row)}</div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
