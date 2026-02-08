import { Edit } from "lucide-react";

type AccountInfoCardProps = {
  userType: string;
  userInfo: {
    name: string;
    email: string;
    phone: string;
    vehicles: any[];
  };
  onEditProfile: () => void;
};

export default function AccountInfoCard({ userType, userInfo, onEditProfile }: AccountInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">Account Information</h2>
        <button className="text-blue-600" onClick={onEditProfile}>
          <Edit className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-500">Name</p>
          <p>{userInfo.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p>{userInfo.email}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Phone</p>
          <p>{userInfo.phone}</p>
        </div>
        {userType === "customer" && userInfo.vehicles.length > 0 && (
          <div>
            <p className="text-sm text-gray-500">Vehicle</p>
            {userInfo.vehicles.map((vehicle, index) => (
              <p key={index}>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
