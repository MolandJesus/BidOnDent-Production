import { Car as CarIcon, ChevronRight, CreditCard, HelpCircle, LogOut, Settings, Trash2 } from "lucide-react";

type AccountMenuProps = {
  userType: string;
  onOpenSettings: () => void;
  onOpenPayment: () => void;
  onOpenShopProfile: () => void;
  onOpenHelp: () => void;
  onOpenDeleteAccount: () => void;
  onLogout: () => void;
  onViewVehicles?: () => void;
};

export default function AccountMenu({
  userType,
  onOpenSettings,
  onOpenPayment,
  onOpenShopProfile,
  onOpenHelp,
  onOpenDeleteAccount,
  onLogout,
  onViewVehicles
}: AccountMenuProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 hover:bg-gray-50">
        <button className="w-full py-4 px-4 flex items-center justify-between" onClick={onOpenSettings}>
          <div className="flex items-center">
            <Settings className="w-5 h-5 mr-3 text-gray-500" />
            <span>Settings</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="border-b border-gray-100 hover:bg-gray-50">
        <button className="w-full py-4 px-4 flex items-center justify-between" onClick={onOpenPayment}>
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 mr-3 text-gray-500" />
            <span>Payment Methods</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {userType === "customer" && (
        <div className="border-b border-gray-100 hover:bg-gray-50">
          <button className="w-full py-4 px-4 flex items-center justify-between" onClick={onViewVehicles}>
            <div className="flex items-center">
              <CarIcon className="w-5 h-5 mr-3 text-gray-500" />
              <span>My Vehicles</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      )}

      {userType === "shop" && (
        <div className="border-b border-gray-100 hover:bg-gray-50">
          <button className="w-full py-4 px-4 flex items-center justify-between" onClick={onOpenShopProfile}>
            <div className="flex items-center">
              <Settings className="w-5 h-5 mr-3 text-gray-500" />
              <span>Shop Profile</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      )}

      <div className="border-b border-gray-100 hover:bg-gray-50">
        <button className="w-full py-4 px-4 flex items-center justify-between" onClick={onOpenHelp}>
          <div className="flex items-center">
            <HelpCircle className="w-5 h-5 mr-3 text-gray-500" />
            <span>Help & Support</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="border-b border-gray-100 hover:bg-red-50">
        <button className="w-full py-4 px-4 flex items-center text-red-600" onClick={onOpenDeleteAccount}>
          <Trash2 className="w-5 h-5 mr-3" />
          <span>Delete Account</span>
        </button>
      </div>

      <div className="hover:bg-gray-50">
        <button className="w-full py-4 px-4 flex items-center text-red-600" onClick={onLogout}>
          <LogOut className="w-5 h-5 mr-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
