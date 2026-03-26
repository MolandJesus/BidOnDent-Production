import { Edit } from "lucide-react";
import { motion } from "motion/react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type AccountInfoCardProps = {
  userType: string;
  userInfo: {
    name: string;
    email: string;
    phone: string;
    vehicles: any[];
    shopName?: string;
    companyName?: string;
  };
  appearanceMode?: DashboardAppearanceMode;
  onEditProfile: () => void;
};

export default function AccountInfoCard({
  userType,
  userInfo,
  appearanceMode = "map-dark",
  onEditProfile,
}: AccountInfoCardProps) {
  const isLightAppearance = appearanceMode === "light";
  const hasPhone = Boolean(userInfo.phone && userInfo.phone.trim().length > 0);
  const hasVehicles = userType === "customer" ? userInfo.vehicles.length > 0 : true;
  const hasBusinessName =
    userType === "shop"
      ? Boolean(userInfo.shopName)
      : userType === "insurer"
        ? Boolean(userInfo.companyName)
        : true;
  const completionScore = [
    userInfo.name,
    userInfo.email,
    hasPhone ? "yes" : "",
    hasVehicles ? "yes" : "",
    hasBusinessName ? "yes" : "",
  ].filter(Boolean).length;
  const completionPercent = Math.round((completionScore / 5) * 100);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="bd-glass-card rounded-2xl p-5 mb-5 relative overflow-hidden"
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(241, 247, 255, 0.88) 100%)"
          : "linear-gradient(180deg, rgba(11, 23, 47, 0.88) 0%, rgba(8, 18, 38, 0.84) 100%)",
        borderColor: isLightAppearance ? "rgba(37, 99, 235, 0.18)" : "rgba(96, 165, 250, 0.22)",
      }}
    >
      {/* Subtle decorative orb */}
      <div
        className="absolute -right-12 -top-12 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)",
        }}
      />
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`font-semibold text-xl ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
        >
          Account Information
        </h2>
        <button
          className={`${isLightAppearance ? "text-blue-600 hover:text-blue-700" : "text-blue-300 hover:text-blue-200"} transition-colors`}
          onClick={onEditProfile}
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <p className={`font-medium ${isLightAppearance ? "text-slate-500" : "text-blue-100/80"}`}>
            Profile completion
          </p>
          <p className={`font-semibold ${isLightAppearance ? "text-slate-700" : "text-slate-100"}`}>
            {completionPercent}%
          </p>
        </div>
        <div
          className={`h-2 rounded-full overflow-hidden ${isLightAppearance ? "bg-blue-100/60 border border-blue-200/50" : "bg-slate-900/45 border border-blue-300/10"}`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
            style={{
              width: `${completionPercent}%`,
              boxShadow: "0 0 10px rgba(37,99,235,0.45), 0 0 4px rgba(56,189,248,0.3)",
            }}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 relative">
        {[
          { label: "Name", value: userInfo.name || "-", show: true },
          {
            label: "Email",
            value: userInfo.email || "-",
            show: true,
            breakWords: true,
          },
          { label: "Phone", value: userInfo.phone || "-", show: true },
          {
            label: "Shop Profile",
            value: userInfo.shopName || "-",
            show: userType === "shop",
          },
          {
            label: "Insurer Profile",
            value: userInfo.companyName || "-",
            show: userType === "insurer",
          },
        ]
          .filter((field) => field.show)
          .map((field) => (
            <div
              key={field.label}
              className={`bd-glass-card rounded-xl p-3.5 ${
                isLightAppearance
                  ? "bg-white/60 border-blue-200/30"
                  : "bg-slate-900/35 border-blue-200/18"
              }`}
              style={{
                boxShadow: isLightAppearance
                  ? "0 1px 3px rgba(37,99,235,0.08), inset 0 1px 0 rgba(255,255,255,0.6)"
                  : "0 1px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(148,163,184,0.06)",
              }}
            >
              <p
                className={`text-xs uppercase tracking-wide ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
              >
                {field.label}
              </p>
              <p
                className={`font-medium mt-1 ${field.breakWords ? "break-words" : ""} ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
              >
                {field.value}
              </p>
            </div>
          ))}
        {userType === "customer" && userInfo.vehicles.length > 0 && (
          <div
            className={`bd-glass-card rounded-xl p-3.5 ${
              isLightAppearance
                ? "bg-white/60 border-blue-200/30"
                : "bg-slate-900/35 border-blue-200/18"
            }`}
            style={{
              boxShadow: isLightAppearance
                ? "0 1px 3px rgba(37,99,235,0.08), inset 0 1px 0 rgba(255,255,255,0.6)"
                : "0 1px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(148,163,184,0.06)",
            }}
          >
            <p
              className={`text-xs uppercase tracking-wide ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
            >
              Vehicles
            </p>
            {userInfo.vehicles.map((vehicle, index) => (
              <p
                key={index}
                className={`font-medium mt-1 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
              >
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
