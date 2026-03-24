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
      className="bd-glass-card rounded-2xl p-5 mb-5"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-slate-900 text-xl">Account Information</h2>
        <button
          className="text-blue-600 hover:text-blue-700 transition-colors"
          onClick={onEditProfile}
        >
          <Edit className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <p className="text-slate-600 font-medium">Profile completion</p>
          <p className="text-slate-700 font-semibold">{completionPercent}%</p>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bd-glass-card rounded-xl p-3.5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
          <p className="text-slate-900 font-medium mt-1">{userInfo.name || "-"}</p>
        </div>
        <div className="bd-glass-card rounded-xl p-3.5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
          <p className="text-slate-900 font-medium mt-1 break-words">{userInfo.email || "-"}</p>
        </div>
        <div className="bd-glass-card rounded-xl p-3.5">
          <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
          <p className="text-slate-900 font-medium mt-1">{userInfo.phone || "-"}</p>
        </div>
        {userType === "shop" && (
          <div className="bd-glass-card rounded-xl p-3.5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Shop Profile</p>
            <p className="text-slate-900 font-medium mt-1">{userInfo.shopName || "-"}</p>
          </div>
        )}
        {userType === "insurer" && (
          <div className="bd-glass-card rounded-xl p-3.5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Insurer Profile</p>
            <p className="text-slate-900 font-medium mt-1">{userInfo.companyName || "-"}</p>
          </div>
        )}
        {userType === "customer" && userInfo.vehicles.length > 0 && (
          <div className="bd-glass-card rounded-xl p-3.5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Vehicles</p>
            {userInfo.vehicles.map((vehicle, index) => (
              <p key={index} className="text-slate-900 font-medium mt-1">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
