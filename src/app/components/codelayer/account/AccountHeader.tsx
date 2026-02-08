import { Camera, Cloud, User as UserIcon } from "lucide-react";
import { ImageWithFallback } from "../../figma/ImageWithFallback";

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
  onProfileImageClick
}: AccountHeaderProps) {
  return (
    <div
      className="px-4 pt-6 pb-8 text-white"
      style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)` }}
    >
      <div className="flex items-center">
        <div className="relative">
          {profileImage ? (
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white">
              <ImageWithFallback src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <UserIcon className="w-10 h-10" />
            </div>
          )}
          <button
            className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md"
            onClick={onProfileImageClick}
          >
            <Camera className="w-4 h-4 text-blue-600" />
          </button>
        </div>

        <div className="ml-4 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{userInfo.name}</h1>
            <div className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 text-xs">
              <Cloud className="w-3 h-3" />
              <span>Synced</span>
            </div>
          </div>
          <p className="text-white/80">
            {userType === "customer" && "Car Owner"}
            {userType === "shop" && userInfo.shopName}
            {userType === "insurer" && userInfo.companyName}
          </p>
        </div>
      </div>
    </div>
  );
}
