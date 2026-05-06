import { Edit } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type AccountInfoCardProps = {
  userType: string;
  userInfo: {
    name: string;
    email: string;
    phone: string;
    vehicles: { id?: string; make: string; model: string; year: string | number }[];
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
  const reduceMotion = useReducedMotion();
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
  const detailFields: Array<{
    label: string;
    value: string;
    breakWords?: boolean;
    toneClass: string;
    wide?: boolean;
  }> = [
    {
      label: "Name",
      value: userInfo.name || "-",
      toneClass: "bd-dashboard-section--deep",
    },
    {
      label: "Phone",
      value: userInfo.phone || "-",
      toneClass: "bd-dashboard-section--deep",
    },
    {
      label: "Email",
      value: userInfo.email || "-",
      breakWords: true,
      toneClass: "bd-dashboard-section--deep",
      wide: true,
    },
  ];

  if (userType === "shop") {
    detailFields.push({
      label: "Shop Profile",
      value: userInfo.shopName || "-",
      toneClass: "bd-dashboard-section--accent-indigo",
      wide: true,
    });
  }

  if (userType === "insurer") {
    detailFields.push({
      label: "Insurer Profile",
      value: userInfo.companyName || "-",
      toneClass: "bd-dashboard-section--accent-indigo",
      wide: true,
    });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, delay: 0.05 }}
      className="bd-dashboard-panel bd-dashboard-panel--deep relative mb-5 overflow-hidden rounded-2xl p-5"
    >
      {/* Subtle decorative orb — D4: cool-blue tint instead of warm-cream */}
      <div
        className="absolute -right-12 -top-12 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(96,165,250,0.10) 0%, transparent 70%)",
        }}
      />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="bd-section-eyebrow mb-1.5">Identity</p>
          <h2
            className={`font-semibold text-xl ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
          >
            Account Information
          </h2>
          <p
            className={`mt-1 text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-100/82"}`}
          >
            Core details, contact info, and saved profile data.
          </p>
        </div>
        <button
          className={`bd-dashboard-secondary-button inline-flex min-h-[44px] items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
            isLightAppearance
              ? "border-blue-200/70 bg-white/80 text-blue-700"
              : "border-blue-300/25 bg-slate-950/45 text-blue-100"
          }`}
          onClick={onEditProfile}
          type="button"
          aria-label="Edit account information"
        >
          <Edit className="w-5 h-5" />
          <span>Edit</span>
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
          className={`bd-dashboard-note bd-dashboard-note--deep h-2 overflow-hidden rounded-full ${isLightAppearance ? "bg-blue-100" : ""}`}
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
        {detailFields.map((field) => (
          <div
            key={field.label}
            className={`bd-dashboard-section rounded-xl p-3.5 ${field.toneClass} ${
              field.wide ? "sm:col-span-2" : ""
            }`}
          >
            <p
              className={`text-xs uppercase tracking-wide ${isLightAppearance ? "text-slate-500" : "text-blue-100/82"}`}
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
          <div className="bd-dashboard-section bd-dashboard-section--accent-blue rounded-xl p-3.5 sm:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <p
                className={`text-xs uppercase tracking-wide ${isLightAppearance ? "text-slate-500" : "text-blue-100/82"}`}
              >
                Vehicles
              </p>
              <span
                className={`bd-dashboard-chip px-2.5 py-1 text-[11px] font-medium ${
                  isLightAppearance
                    ? "bg-white/80 text-blue-700"
                    : "border-blue-200/20 bg-white/10 text-blue-50"
                }`}
              >
                {userInfo.vehicles.length} saved
              </span>
            </div>
            {userInfo.vehicles.map((vehicle, index) => (
              <p
                key={index}
                className={`font-medium mt-1.5 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
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
