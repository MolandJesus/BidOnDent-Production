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
  mapShopProfilesToClaimShops,
  type ClaimShop,
  type Policyholder,
} from "./newClaimData";
import InsurerNewClaimForm, { type ClaimFormData } from "./InsurerNewClaimForm";
import {
  INITIAL_CLAIM_FORM_DATA,
  type InsurerNewClaimScreenProps,
} from "./insurerNewClaimScreenHelpers";
import { useNetworkDirectory } from "../../hooks/useNetworkDirectory";

export default function InsurerNewClaimScreen({
  primaryColor = "#003d82",
  reports = [],
  onBack,
  onCreateClaim,
  appearanceMode = "map-dark",
}: InsurerNewClaimScreenProps) {
  const isLight = appearanceMode === "light";
  const [activeTab, setActiveTab] = useState<"customers" | "shops">("customers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Policyholder | null>(null);
  const [selectedShop, setSelectedShop] = useState<ClaimShop | null>(null);
  const [showNewClaimForm, setShowNewClaimForm] = useState(false);
  const [claimFormData, setClaimFormData] = useState<ClaimFormData>(INITIAL_CLAIM_FORM_DATA);

  const policyholders = useMemo<Policyholder[]>(() => buildPolicyholders(reports), [reports]);

  const { inventory, isLoading: shopsLoading } = useNetworkDirectory();
  const claimShops = useMemo<ClaimShop[]>(() => {
    const real = mapShopProfilesToClaimShops(inventory.shops);
    return real.length > 0 ? real : buildClaimShops(reports);
  }, [inventory.shops, reports]);

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
      setClaimFormData(INITIAL_CLAIM_FORM_DATA);
    }
  };

  return (
    <div className={`min-h-screen bd-glass-panel${isLight ? " bd-light-surface" : ""}`}>
      <div
        className={`bd-glass-panel border-b${isLight ? " bd-light-surface border-slate-200/60" : " border-blue-200/30"}`}
        style={
          isLight
            ? {}
            : {
                background:
                  "linear-gradient(180deg, rgba(11, 23, 47, 0.92) 0%, rgba(8, 18, 38, 0.86) 100%)",
                boxShadow: "0 4px 24px rgba(3, 10, 24, 0.30)",
                backdropFilter: "blur(12px)",
              }
        }
      >
        <div className="px-4 py-4">
          <div className="flex items-center mb-4">
            {onBack && (
              <button onClick={onBack} aria-label="Back" className="mr-3 p-1" type="button">
                <ArrowLeft className="w-6 h-6" style={{ color: primaryColor }} />
              </button>
            )}
            <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
              Create New Claim
            </h1>
          </div>
          <p className={`text-sm mb-4 ${isLight ? "text-slate-600" : "text-slate-300/80"}`}>
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
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                isLight ? "text-slate-400" : "text-blue-200/50"
              }`}
            />
            <input
              type="text"
              placeholder={
                activeTab === "customers" ? "Search policyholders..." : "Search auto shops..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isLight
                  ? "border-slate-200 bg-[#fffefa] text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60"
                  : "border-blue-300/20 bg-white/[0.08] text-slate-100 placeholder:text-blue-200/50 focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20"
              }`}
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
                      <h3
                        className={`font-bold text-lg ${isLight ? "text-slate-900" : "text-slate-100"}`}
                      >
                        {customer.name}
                      </h3>
                      <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-300/80"}`}>
                        Policy: {customer.policyNumber}
                      </p>
                    </div>
                    {customer.activeClaims > 0 && (
                      <span className="px-2 py-1 bg-blue-400/15 text-blue-200 text-xs font-medium rounded">
                        {customer.activeClaims} Active
                      </span>
                    )}
                  </div>

                  <div className="mb-3 space-y-1">
                    {customer.vehicles.map((vehicle, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center text-sm ${isLight ? "text-slate-700" : "text-slate-200"}`}
                      >
                        <Car
                          className={`w-4 h-4 mr-2 ${isLight ? "text-slate-400" : "text-blue-200/50"}`}
                        />
                        <span>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </span>
                      </div>
                    ))}
                    <div
                      className={`flex items-center text-sm ${isLight ? "text-slate-500" : "text-slate-300/80"}`}
                    >
                      <MapPin
                        className={`w-4 h-4 mr-2 ${isLight ? "text-slate-400" : "text-blue-200/50"}`}
                      />
                      <span>{customer.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
                    {customer.phone && customer.phone !== "Not provided" ? (
                      <a
                        href={`tel:${customer.phone}`}
                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-xs">Call</span>
                      </a>
                    ) : (
                      <span
                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility opacity-50 cursor-not-allowed"
                        title="Contact info not available"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-xs">Call</span>
                      </span>
                    )}
                    {customer.email && customer.email !== "Not provided" ? (
                      <a
                        href={`mailto:${customer.email}`}
                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-xs">Email</span>
                      </a>
                    ) : (
                      <span
                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility opacity-50 cursor-not-allowed"
                        title="Contact info not available"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-xs">Email</span>
                      </span>
                    )}
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
                    className="bd-dashboard-primary-button w-full py-3 text-white font-semibold flex items-center justify-center gap-2"
                    style={{ background: primaryColor }}
                    type="button"
                  >
                    <Plus className="w-5 h-5" />
                    Create Claim for {(customer.name || "Customer").split(" ")[0]}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : shopsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin motion-reduce:animate-none rounded-full h-8 w-8 border-b-2 border-blue-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredShops.map((shop) => (
              <div key={shop.id} className="bd-glass-card rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-bold text-lg ${isLight ? "text-slate-900" : "text-slate-100"}`}
                        >
                          {shop.name}
                        </h3>
                        {shop.certified && (
                          <span className="px-2 py-0.5 bg-green-400/15 text-green-300 text-xs font-medium rounded">
                            Certified
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex items-center text-sm mb-1 ${isLight ? "text-slate-500" : "text-slate-300/80"}`}
                      >
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="font-medium">{shop.rating}</span>
                        <span className="mx-1">•</span>
                        <span>{shop.reviewCount} reviews</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3 space-y-1">
                    <div
                      className={`flex items-center text-sm ${isLight ? "text-slate-700" : "text-slate-200"}`}
                    >
                      <MapPin
                        className={`w-4 h-4 mr-2 ${isLight ? "text-slate-400" : "text-blue-200/50"}`}
                      />
                      <span>{shop.address}</span>
                    </div>
                    <div
                      className={`text-sm ml-6 ${isLight ? "text-slate-500" : "text-slate-300/80"}`}
                    >
                      {shop.distance}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p
                      className={`text-xs mb-1 ${isLight ? "text-slate-500" : "text-slate-400/70"}`}
                    >
                      Specialties:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {shop.specialties.map((specialty, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-400/15 text-blue-200 text-xs rounded"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className={`mb-3 p-3 border rounded-lg ${
                      isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-white/[0.05] border-white/[0.06]"
                    }`}
                  >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p
                          className={`text-xs ${isLight ? "text-slate-500" : "text-slate-300/80"}`}
                        >
                          Partner Since
                        </p>
                        <p
                          className={`font-medium ${isLight ? "text-slate-800" : "text-slate-100"}`}
                        >
                          {shop.partnerSince}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-xs ${isLight ? "text-slate-500" : "text-slate-300/80"}`}
                        >
                          Completed Jobs
                        </p>
                        <p
                          className={`font-medium ${isLight ? "text-slate-800" : "text-slate-100"}`}
                        >
                          {shop.completedJobs}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
                    {shop.phone && shop.phone !== "Not provided" ? (
                      <a
                        href={`tel:${shop.phone}`}
                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-xs">Call</span>
                      </a>
                    ) : (
                      <span
                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility opacity-50 cursor-not-allowed"
                        title="Contact info not available"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-xs">Call</span>
                      </span>
                    )}
                    {shop.email && shop.email !== "Not provided" ? (
                      <a
                        href={`mailto:${shop.email}`}
                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-xs">Email</span>
                      </a>
                    ) : (
                      <span
                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bd-glass-control--utility opacity-50 cursor-not-allowed"
                        title="Contact info not available"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-xs">Email</span>
                      </span>
                    )}
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
                          ? "bg-green-400/15 text-green-300 border-2 border-green-500"
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
                    <div
                      className={`w-full py-3 rounded-lg font-medium text-center text-sm ${
                        isLight
                          ? "bg-slate-100 text-slate-400 border border-slate-200"
                          : "bg-white/[0.05] text-slate-400/70"
                      }`}
                    >
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
          appearanceMode={appearanceMode}
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
