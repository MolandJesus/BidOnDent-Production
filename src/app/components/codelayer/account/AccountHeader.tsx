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
  primaryColor: string;
  onProfileImageClick: () => void;
};

export default function AccountHeader({
  profileImage,
  userInfo,
  userType,
  primaryColor,
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
      className="rounded-2xl text-white p-5 md:p-6 shadow-sm border border-white/10 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)` }}
    >
      <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute right-24 top-5 w-16 h-16 rounded-full bg-white/10" />

      <div className="relative flex items-center">
        <div className="relative">
          {profileImage ? (
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-md ring-2 ring-white/40">
              <ImageWithFallback
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center shadow-md ring-2 ring-white/20">
              <UserIcon className="w-10 h-10" />
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
            <div className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 text-xs">
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
