import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  ChevronRight,
  User,
  Car,
  Building2,
  ArrowLeft,
  Plus,
  CheckCircle,
} from "lucide-react";
import {
  buildClaimShops,
  buildPolicyholders,
  type ClaimShop,
  type Policyholder,
} from "./newClaimData";
import InsurerNewClaimForm, { type ClaimFormData } from "./InsurerNewClaimForm";

type InsurerNewClaimScreenProps = {
  primaryColor?: string;
  reports?: any[];
  onBack?: () => void;
  onCreateClaim?: (claimData: any) => void;
};

export default function InsurerNewClaimScreen({
  primaryColor = "#003d82",
  reports = [],
  onBack,
  onCreateClaim,
}: InsurerNewClaimScreenProps) {
  const [activeTab, setActiveTab] = useState<"customers" | "shops">("customers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Policyholder | null>(null);
  const [selectedShop, setSelectedShop] = useState<ClaimShop | null>(null);
  const [showNewClaimForm, setShowNewClaimForm] = useState(false);
  const [claimFormData, setClaimFormData] = useState<ClaimFormData>({
    policyNumber: "",
    incidentDate: "",
    damageDescription: "",
    estimatedAmount: "",
    priority: "medium",
  });

  const policyholders = useMemo<Policyholder[]>(() => buildPolicyholders(reports), [reports]);

  const claimShops = useMemo<ClaimShop[]>(() => buildClaimShops(reports), [reports]);

  const filteredCustomers = policyholders.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.policyNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShops = claimShops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateClaim = () => {
    if (selectedCustomer && claimFormData.policyNumber && claimFormData.incidentDate) {
      const newClaim = {
        customer: selectedCustomer,
        shop: selectedShop,
        ...claimFormData,
      };
      onCreateClaim?.(newClaim);
      setShowNewClaimForm(false);
      setSelectedCustomer(null);
      setSelectedShop(null);
      setClaimFormData({
        policyNumber: "",
        incidentDate: "",
        damageDescription: "",
        estimatedAmount: "",
        priority: "medium",
      });
    }
  };

  return (
    <div className="min-h-screen bd-glass-panel">
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-200/30 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center mb-4">
            {onBack && (
              <button onClick={onBack} className="mr-3 p-1" type="button">
                <ArrowLeft className="w-6 h-6" style={{ color: primaryColor }} />
              </button>
            )}
            <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
              Create New Claim
            </h1>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Start a new claim using active policyholders and partner routing options.
          </p>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("customers")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "customers" ? "text-white" : "bd-glass-control--utility"
              }`}
              style={activeTab === "customers" ? { backgroundColor: primaryColor } : {}}
              type="button"
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                Policyholders
              </div>
            </button>
            <button
              onClick={() => setActiveTab("shops")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "shops" ? "text-white" : "bd-glass-control--utility"
              }`}
              style={activeTab === "shops" ? { backgroundColor: primaryColor } : {}}
              type="button"
            >
              <div className="flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4" />
                Auto Shops
              </div>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={
                activeTab === "customers" ? "Search policyholders..." : "Search auto shops..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {activeTab === "customers" ? (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bd-glass-card rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{customer.name}</h3>
                      <p className="text-sm text-gray-600">Policy: {customer.policyNumber}</p>
                    </div>
                    {customer.activeClaims > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {customer.activeClaims} Active
                      </span>
                    )}
                  </div>

                  <div className="mb-3 space-y-1">
                    {customer.vehicles.map((vehicle, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-700">
                        <Car className="w-4 h-4 mr-2 text-gray-400" />
                        <span>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{customer.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
                    <a
                      href={`tel:${customer.phone}`}
                      className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-xs">Call</span>
                    </a>
                    <a
                      href={`mailto:${customer.email}`}
                      className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-xs">Email</span>
                    </a>
                    <button
                      className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility"
                      type="button"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">Message</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowNewClaimForm(true);
                      setClaimFormData((prev) => ({
                        ...prev,
                        policyNumber: customer.policyNumber,
                      }));
                    }}
                    className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: primaryColor }}
                    type="button"
                  >
                    <Plus className="w-5 h-5" />
                    Create Claim for {customer.name.split(" ")[0]}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredShops.map((shop) => (
              <div key={shop.id} className="bd-glass-card rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{shop.name}</h3>
                        {shop.certified && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                            Certified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="font-medium">{shop.rating}</span>
                        <span className="mx-1">•</span>
                        <span>{shop.reviewCount} reviews</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 space-y-1">
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{shop.address}</span>
                    </div>
                    <div className="text-sm text-gray-600 ml-6">{shop.distance}</div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {shop.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600 text-xs">Partner Since</p>
                        <p className="font-medium">{shop.partnerSince}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Completed Jobs</p>
                        <p className="font-medium">{shop.completedJobs}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
                    <a
                      href={`tel:${shop.phone}`}
                      className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-xs">Call</span>
                    </a>
                    <a
                      href={`mailto:${shop.email}`}
                      className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-xs">Email</span>
                    </a>
                    <button
                      className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility"
                      type="button"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">Message</span>
                    </button>
                  </div>

                  {selectedCustomer ? (
                    <button
                      onClick={() => setSelectedShop(shop)}
                      className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                        selectedShop?.id === shop.id
                          ? "bg-green-100 text-green-700 border-2 border-green-500"
                          : "border-2 bd-glass-control--utility"
                      }`}
                      type="button"
                    >
                      {selectedShop?.id === shop.id ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Selected for Claim
                        </>
                      ) : (
                        <>
                          <Building2 className="w-5 h-5" />
                          Assign to Claim
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-3 rounded-lg bg-gray-100 text-gray-500 font-medium text-center text-sm">
                      Select a customer first
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNewClaimForm && selectedCustomer && (
        <InsurerNewClaimForm
          selectedCustomer={selectedCustomer}
          selectedShop={selectedShop}
          claimFormData={claimFormData}
          primaryColor={primaryColor}
          onUpdate={setClaimFormData}
          onCancel={() => {
            setShowNewClaimForm(false);
            setSelectedShop(null);
          }}
          onSubmit={handleCreateClaim}
        />
      )}
    </div>
  );
}
