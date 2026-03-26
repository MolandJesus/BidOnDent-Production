import { Camera, Cloud, User as UserIcon } from "lucide-react";
import { ImageWithFallback } from "../../figma/ImageWithFallback";
import { motion } from "motion/react";

type AccountHeaderProps = {
  profileImage: string | null;
  userInfo: {
    name: string;
    shopName: string;
    companyName: string;
  };
  userType: string;
  primaryColor?: string;
  onProfileImageClick: () => void;
};

export default function AccountHeader({
  profileImage,
  userInfo,
  userType,
  onProfileImageClick,
}: AccountHeaderProps) {
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
      className="rounded-2xl text-white p-5 md:p-6 shadow-lg border border-blue-400/20 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(0,42,90,0.92) 0%, rgba(8,50,120,0.88) 40%, rgba(0,80,160,0.82) 100%)",
      }}
    >
      {/* Atmospheric decorative orbs */}
      <div
        className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute right-20 top-3 w-20 h-20 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -left-6 top-1/2 w-24 h-24 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex items-center">
        <div className="relative">
          {profileImage ? (
            <div
              className="w-20 h-20 rounded-full overflow-hidden bg-white ring-2 ring-blue-300/40"
              style={{ boxShadow: "0 0 20px rgba(37,99,235,0.3), 0 4px 12px rgba(0,0,0,0.3)" }}
            >
              <ImageWithFallback
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full bg-blue-400/15 flex items-center justify-center ring-2 ring-blue-300/25"
              style={{ boxShadow: "0 0 20px rgba(37,99,235,0.25), 0 4px 12px rgba(0,0,0,0.3)" }}
            >
              <UserIcon className="w-10 h-10 text-blue-200" />
            </div>
          )}
          <button
            className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:scale-105 transition-transform"
            onClick={onProfileImageClick}
          >
            <Camera className="w-4 h-4 text-blue-600" />
          </button>
        </div>

        <div className="ml-4 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{userInfo.name}</h1>
            <div className="bd-glass-badge px-2 py-0.5 flex items-center gap-1 text-xs">
              <Cloud className="w-3 h-3" />
              <span>Synced</span>
            </div>
          </div>
          <p className="text-white/85">{subtitle}</p>
          <p className="text-xs text-white/70 mt-1">
            Your profile and preferences are securely synced.
          </p>
        </div>
      </div>
    </motion.section>
  );
}
