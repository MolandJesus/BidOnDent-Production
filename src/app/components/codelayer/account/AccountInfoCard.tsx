import { Edit } from "lucide-react";
import { motion } from "motion/react";

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
  onEditProfile: () => void;
};

export default function AccountInfoCard({
  userType,
  userInfo,
  onEditProfile,
}: AccountInfoCardProps) {
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
        background:
          "linear-gradient(180deg, rgba(11, 23, 47, 0.88) 0%, rgba(8, 18, 38, 0.84) 100%)",
        borderColor: "rgba(96, 165, 250, 0.22)",
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
        <h2 className="font-semibold text-slate-100 text-xl">Account Information</h2>
        <button
          className="text-blue-300 hover:text-blue-200 transition-colors"
          onClick={onEditProfile}
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <p className="text-blue-100/80 font-medium">Profile completion</p>
          <p className="text-slate-100 font-semibold">{completionPercent}%</p>
        </div>
        <div className="h-2 rounded-full bg-slate-900/45 overflow-hidden border border-blue-300/10">
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
        <div
          className="bd-glass-card rounded-xl p-3.5 bg-slate-900/25 border-blue-200/18"
          style={{ boxShadow: "inset 0 1px 0 rgba(148,163,184,0.06)" }}
        >
          <p className="text-xs uppercase tracking-wide text-blue-100/70">Name</p>
          <p className="text-slate-100 font-medium mt-1">{userInfo.name || "-"}</p>
        </div>
        <div
          className="bd-glass-card rounded-xl p-3.5 bg-slate-900/25 border-blue-200/18"
          style={{ boxShadow: "inset 0 1px 0 rgba(148,163,184,0.06)" }}
        >
          <p className="text-xs uppercase tracking-wide text-blue-100/70">Email</p>
          <p className="text-slate-100 font-medium mt-1 break-words">{userInfo.email || "-"}</p>
        </div>
        <div
          className="bd-glass-card rounded-xl p-3.5 bg-slate-900/25 border-blue-200/18"
          style={{ boxShadow: "inset 0 1px 0 rgba(148,163,184,0.06)" }}
        >
          <p className="text-xs uppercase tracking-wide text-blue-100/70">Phone</p>
          <p className="text-slate-100 font-medium mt-1">{userInfo.phone || "-"}</p>
        </div>
        {userType === "shop" && (
          <div
            className="bd-glass-card rounded-xl p-3.5 bg-slate-900/25 border-blue-200/18"
            style={{ boxShadow: "inset 0 1px 0 rgba(148,163,184,0.06)" }}
          >
            <p className="text-xs uppercase tracking-wide text-blue-100/70">Shop Profile</p>
            <p className="text-slate-100 font-medium mt-1">{userInfo.shopName || "-"}</p>
          </div>
        )}
        {userType === "insurer" && (
          <div
            className="bd-glass-card rounded-xl p-3.5 bg-slate-900/25 border-blue-200/18"
            style={{ boxShadow: "inset 0 1px 0 rgba(148,163,184,0.06)" }}
          >
            <p className="text-xs uppercase tracking-wide text-blue-100/70">Insurer Profile</p>
            <p className="text-slate-100 font-medium mt-1">{userInfo.companyName || "-"}</p>
          </div>
        )}
        {userType === "customer" && userInfo.vehicles.length > 0 && (
          <div
            className="bd-glass-card rounded-xl p-3.5 bg-slate-900/25 border-blue-200/18"
            style={{ boxShadow: "inset 0 1px 0 rgba(148,163,184,0.06)" }}
          >
            <p className="text-xs uppercase tracking-wide text-blue-100/70">Vehicles</p>
            {userInfo.vehicles.map((vehicle, index) => (
              <p key={index} className="text-slate-100 font-medium mt-1">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
