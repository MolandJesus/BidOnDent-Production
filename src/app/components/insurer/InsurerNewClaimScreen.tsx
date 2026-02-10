import { useState } from "react";
import { Search, MapPin, Phone, Mail, MessageSquare, ChevronRight, User, Car, Building2, ArrowLeft, Plus, CheckCircle } from "lucide-react";

type InsurerNewClaimScreenProps = {
  primaryColor?: string;
  onBack?: () => void;
  onCreateClaim?: (claimData: any) => void;
};

export default function InsurerNewClaimScreen({
  primaryColor = "#003d82",
  onBack,
  onCreateClaim
}: InsurerNewClaimScreenProps) {
  const [activeTab, setActiveTab] = useState<"customers" | "shops">("customers");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [showNewClaimForm, setShowNewClaimForm] = useState(false);
  const [claimFormData, setClaimFormData] = useState({
    policyNumber: "",
    incidentDate: "",
    damageDescription: "",
    estimatedAmount: "",
    priority: "medium"
  });

  // Sample customers (Bidondent car owners) - in production, this would come from Supabase
  const sampleCustomers = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.j@email.com",
      phone: "(555) 123-4567",
      policyNumber: "POL-5678-9012",
      vehicles: [
        { year: 2022, make: "Honda", model: "Accord", vin: "1HGBH41JXMN109186" }
      ],
      location: "San Francisco, CA",
      memberSince: "2020",
      activeClaims: 1,
      status: "active"
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@email.com",
      phone: "(555) 234-5678",
      policyNumber: "POL-3456-7890",
      vehicles: [
        { year: 2020, make: "Toyota", model: "Camry", vin: "4T1B11HK5LU234567" }
      ],
      location: "Oakland, CA",
      memberSince: "2019",
      activeClaims: 0,
      status: "active"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.r@email.com",
      phone: "(555) 345-6789",
      policyNumber: "POL-8901-2345",
      vehicles: [
        { year: 2019, make: "Ford", model: "F-150", vin: "1FTFW1ET5KFC12345" }
      ],
      location: "San Jose, CA",
      memberSince: "2021",
      activeClaims: 2,
      status: "active"
    },
    {
      id: 4,
      name: "David Kim",
      email: "d.kim@email.com",
      phone: "(555) 456-7890",
      policyNumber: "POL-6789-0123",
      vehicles: [
        { year: 2021, make: "BMW", model: "330i", vin: "WBA8B9C51M1234567" }
      ],
      location: "Palo Alto, CA",
      memberSince: "2022",
      activeClaims: 1,
      status: "active"
    }
  ];

  // Sample auto body shops - in production, this would come from Supabase
  const sampleShops = [
    {
      id: 1,
      name: "Express Auto Body",
      email: "info@expressauto.com",
      phone: "(555) 987-6543",
      address: "1234 Mission St, San Francisco, CA 94103",
      location: "San Francisco, CA",
      distance: "2.3 miles",
      rating: 4.8,
      reviewCount: 247,
      specialties: ["Collision Repair", "Paint & Body", "Frame Straightening"],
      certified: true,
      partnerSince: "2019",
      completedJobs: 156,
      avgCompletionDays: 3.5
    },
    {
      id: 2,
      name: "Premium Collision Center",
      email: "contact@premiumcollision.com",
      phone: "(555) 876-5432",
      address: "5678 Broadway, Oakland, CA 94607",
      location: "Oakland, CA",
      distance: "5.1 miles",
      rating: 4.6,
      reviewCount: 189,
      specialties: ["Luxury Vehicles", "Insurance Claims", "Paintless Dent Repair"],
      certified: true,
      partnerSince: "2020",
      completedJobs: 134,
      avgCompletionDays: 4.2
    },
    {
      id: 3,
      name: "Quick Fix Auto Repair",
      email: "service@quickfixauto.com",
      phone: "(555) 765-4321",
      address: "9012 El Camino Real, San Jose, CA 95128",
      location: "San Jose, CA",
      distance: "12.5 miles",
      rating: 4.5,
      reviewCount: 156,
      specialties: ["Fast Service", "Minor Repairs", "Insurance Work"],
      certified: false,
      partnerSince: "2021",
      completedJobs: 89,
      avgCompletionDays: 2.8
    },
    {
      id: 4,
      name: "Luxury Auto Restoration",
      email: "info@luxuryautorest.com",
      phone: "(555) 654-3210",
      address: "3456 Park Ave, Palo Alto, CA 94301",
      location: "Palo Alto, CA",
      distance: "8.7 miles",
      rating: 4.9,
      reviewCount: 312,
      specialties: ["Luxury & Exotic Cars", "Custom Paint", "Restoration"],
      certified: true,
      partnerSince: "2018",
      completedJobs: 203,
      avgCompletionDays: 5.1
    }
  ];

  const filteredCustomers = sampleCustomers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.policyNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredShops = sampleShops.filter(shop =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateClaim = () => {
    if (selectedCustomer && claimFormData.policyNumber && claimFormData.incidentDate) {
      const newClaim = {
        customer: selectedCustomer,
        shop: selectedShop,
        ...claimFormData
      };
      onCreateClaim?.(newClaim);
      // Reset form
      setShowNewClaimForm(false);
      setSelectedCustomer(null);
      setSelectedShop(null);
      setClaimFormData({
        policyNumber: "",
        incidentDate: "",
        damageDescription: "",
        estimatedAmount: "",
        priority: "medium"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center mb-4">
            {onBack && (
              <button onClick={onBack} className="mr-3 p-1">
                <ArrowLeft className="w-6 h-6" style={{ color: primaryColor }} />
              </button>
            )}
            <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>Create New Claim</h1>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Connect with policyholders and auto body shops to initiate new claims
          </p>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("customers")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "customers"
                  ? "text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
              style={activeTab === "customers" ? { backgroundColor: primaryColor } : {}}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                Policyholders
              </div>
            </button>
            <button
              onClick={() => setActiveTab("shops")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === "shops"
                  ? "text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              }`}
              style={activeTab === "shops" ? { backgroundColor: primaryColor } : {}}
            >
              <div className="flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4" />
                Auto Shops
              </div>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={activeTab === "customers" ? "Search policyholders..." : "Search auto shops..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {activeTab === "customers" ? (
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                        <span>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                      </div>
                    ))}
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{customer.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <a
                      href={`tel:${customer.phone}`}
                      className="flex flex-col items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-xs">Call</span>
                    </a>
                    <a
                      href={`mailto:${customer.email}`}
                      className="flex flex-col items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-xs">Email</span>
                    </a>
                    <button className="flex flex-col items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">Message</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowNewClaimForm(true);
                      setClaimFormData({
                        ...claimFormData,
                        policyNumber: customer.policyNumber
                      });
                    }}
                    className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Plus className="w-5 h-5" />
                    Create Claim for {customer.name.split(' ')[0]}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredShops.map((shop) => (
              <div key={shop.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                    <div className="text-sm text-gray-600 ml-6">
                      {shop.distance} away
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {shop.specialties.map((specialty, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
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

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <a
                      href={`tel:${shop.phone}`}
                      className="flex flex-col items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-xs">Call</span>
                    </a>
                    <a
                      href={`mailto:${shop.email}`}
                      className="flex flex-col items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-xs">Email</span>
                    </a>
                    <button className="flex flex-col items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
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
                          : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
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

      {/* New Claim Form Modal */}
      {showNewClaimForm && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">New Claim Details</h2>
              
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Policyholder</p>
                <p className="font-bold">{selectedCustomer.name}</p>
                <p className="text-sm text-blue-700">{selectedCustomer.email}</p>
                <p className="text-sm text-blue-700">{selectedCustomer.phone}</p>
              </div>

              {selectedShop && (
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-1">Assigned Shop</p>
                  <p className="font-bold">{selectedShop.name}</p>
                  <p className="text-sm text-green-700">{selectedShop.location}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    value={claimFormData.policyNumber}
                    onChange={(e) => setClaimFormData({ ...claimFormData, policyNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="POL-XXXX-XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Incident Date
                  </label>
                  <input
                    type="date"
                    value={claimFormData.incidentDate}
                    onChange={(e) => setClaimFormData({ ...claimFormData, incidentDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Damage Description
                  </label>
                  <textarea
                    value={claimFormData.damageDescription}
                    onChange={(e) => setClaimFormData({ ...claimFormData, damageDescription: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    rows={4}
                    placeholder="Describe the damage and incident details..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                    <input
                      type="number"
                      value={claimFormData.estimatedAmount}
                      onChange={(e) => setClaimFormData({ ...claimFormData, estimatedAmount: e.target.value })}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={claimFormData.priority}
                    onChange={(e) => setClaimFormData({ ...claimFormData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowNewClaimForm(false);
                    setSelectedShop(null);
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateClaim}
                  disabled={!claimFormData.policyNumber || !claimFormData.incidentDate}
                  className="flex-1 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  Create Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
