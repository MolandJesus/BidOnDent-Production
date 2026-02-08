import { Car, Bell } from "lucide-react";
import { RefObject } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface DashboardHeaderProps {
  userInfo: {
    name: string;
    email: string;
    profileImage?: string;
  };
  userType: "customer" | "shop" | "insurer";
  unreadCount: number;
  primaryColor: string;
  secondaryColor: string;
  onLogoClick: () => void;
  onNotificationClick: () => void;
  onProfileClick: () => void;
  showProfileDropdown: boolean;
  profileDropdownRef: RefObject<HTMLDivElement>;
}

export default function DashboardHeader({
  userInfo,
  unreadCount,
  primaryColor,
  secondaryColor,
  onLogoClick,
  onProfileClick
}: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-7xl">
        {/* Logo */}
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Car className="w-6 h-6" style={{ color: primaryColor }} />
          <h1 className="text-2xl font-bold">
            <span style={{ 
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Bid</span>
            <span style={{ color: '#70c0ee' }}>on</span>
            <span className="text-gray-800">dent</span>
          </h1>
        </button>

        {/* Spacer for desktop nav (will be filled by DesktopNavTabs component) */}
        <div className="flex-1" />

        {/* Profile Picture and Dropdown */}
        <div className="relative">
          <button
            onClick={onProfileClick}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="relative">
              {/* Profile Picture */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: "linear-gradient(135deg, #003d82 0%, #00a0e9 100%)" }}
              >
                {userInfo.profileImage ? (
                  <ImageWithFallback 
                    src={userInfo.profileImage} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  userInfo.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount}
                </div>
              )}
            </div>
            
            {/* Desktop: User name and email */}
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-semibold text-gray-900">{userInfo.name}</span>
              <span className="text-xs text-gray-500">{userInfo.email}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
