import { Camera, Cloud, User as UserIcon } from "lucide-react";
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
      className={`rounded-2xl p-5 md:p-6 shadow-lg border relative overflow-hidden ${
        isLight ? "text-slate-800 border-blue-200/30" : "text-white border-blue-400/20"
      }`}
      style={{
        background: isLight
          ? "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(241,247,255,0.92) 40%, rgba(224,237,255,0.88) 100%)"
          : "linear-gradient(135deg, rgba(0,42,90,0.92) 0%, rgba(8,50,120,0.88) 40%, rgba(0,80,160,0.82) 100%)",
      }}
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

      <div className="relative flex items-center">
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
            className={`absolute bottom-0 right-0 rounded-full p-1.5 shadow-md hover:scale-105 transition-transform ${
              isLight ? "bg-blue-500" : "bg-blue-600"
            }`}
            onClick={onProfileImageClick}
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="ml-4 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{userInfo.name}</h1>
            <div
              className={`px-2 py-0.5 flex items-center gap-1 text-xs rounded-full border ${
                isLight ? "bg-blue-50 border-blue-200/40 text-blue-600" : "bd-glass-badge"
              }`}
            >
              <Cloud className="w-3 h-3" />
              <span>Synced</span>
            </div>
          </div>
          <p className={isLight ? "text-slate-600" : "text-white/85"}>{subtitle}</p>
          <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-white/70"}`}>
            Your profile and preferences are securely synced.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
