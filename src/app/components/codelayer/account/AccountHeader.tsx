import { Camera, User as UserIcon } from "lucide-react";
import { ImageWithFallback } from "../../figma/ImageWithFallback";
import { motion } from "motion/react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type AccountHeaderProps = {
  profileImage: string | null;
  userInfo: {
    name: string;
    shopName: string;
    companyName: string;
  };
  userType: string;
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
  onProfileImageClick: () => void;
};

export default function AccountHeader({
  profileImage,
  userInfo,
  userType,
  appearanceMode = "map-dark",
  onProfileImageClick,
}: AccountHeaderProps) {
  const isLight = appearanceMode === "light";
  const subtitle =
    userType === "customer"
      ? "Car Owner"
      : userType === "shop"
        ? userInfo.shopName
        : userInfo.companyName;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`bd-dashboard-panel bd-dashboard-panel--accent-blue relative overflow-hidden rounded-2xl p-5 md:p-6 ${
        isLight ? "text-slate-800" : "text-white"
      }`}
    >
      {/* Atmospheric decorative orbs */}
      <div
        className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute right-20 top-3 w-20 h-20 rounded-full"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -left-6 top-1/2 w-24 h-24 rounded-full"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(37,99,235,0.05) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex items-center gap-4">
        <div className="relative">
          {profileImage ? (
            <div
              className={`w-20 h-20 rounded-full overflow-hidden ring-2 ${
                isLight ? "bg-blue-50/60 ring-blue-300/30" : "bg-white/[0.06] ring-blue-300/40"
              }`}
              style={{
                boxShadow: isLight
                  ? "0 0 16px rgba(37,99,235,0.12), 0 4px 12px rgba(0,0,0,0.08)"
                  : "0 0 20px rgba(37,99,235,0.3), 0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <ImageWithFallback
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ring-2 ${
                isLight ? "bg-blue-100/60 ring-blue-300/25" : "bg-blue-400/15 ring-blue-300/25"
              }`}
              style={{
                boxShadow: isLight
                  ? "0 0 16px rgba(37,99,235,0.10), 0 4px 12px rgba(0,0,0,0.06)"
                  : "0 0 20px rgba(37,99,235,0.25), 0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <UserIcon className={`w-10 h-10 ${isLight ? "text-blue-400" : "text-blue-200"}`} />
            </div>
          )}
          <button
            className={`bd-dashboard-secondary-button absolute -bottom-2 -right-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-0 shadow-md transition-transform hover:scale-105 ${
              isLight
                ? "border-blue-200/70 bg-white/85 text-blue-700"
                : "border-blue-300/30 bg-slate-950/55 text-blue-100"
            }`}
            onClick={onProfileImageClick}
            type="button"
            aria-label="Update profile photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <p className="bd-section-eyebrow mb-1.5">Account Hub</p>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight md:text-2xl">
              {userInfo.name}
            </h1>
            <div
              className={`bd-dashboard-chip inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
                isLight
                  ? "bg-white/80 text-blue-700"
                  : "border-blue-200/20 bg-white/10 text-blue-50"
              }`}
            >
              <UserIcon className="w-3 h-3" />
              <span>Profile</span>
            </div>
          </div>
          <p className={isLight ? "text-slate-600" : "text-white/85"}>{subtitle}</p>
          <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-white/70"}`}>
            Manage your profile details and appearance settings here.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
