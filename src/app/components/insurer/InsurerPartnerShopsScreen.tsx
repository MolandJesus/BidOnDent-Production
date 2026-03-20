import { useMemo, useState } from "react";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Star,
  CheckCircle,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  buildDerivedPartnerShops,
  certificationOptions,
  specialtyOptions,
  type PartnerShop,
} from "./partnerShopsData";

type InsurerPartnerShopsScreenProps = {
  primaryColor?: string;
  reports?: any[];
  onAddShop?: (shopData: any) => void;
};

export default function InsurerPartnerShopsScreen({
  primaryColor = "#003d82",
  reports = [],
  onAddShop,
}: InsurerPartnerShopsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "pending" | "inactive">(
    "all"
  );
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [newShopData, setNewShopData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    specialties: [] as string[],
    certifications: [] as string[],
  });

  const derivedShops = useMemo<PartnerShop[]>(() => buildDerivedPartnerShops(reports), [reports]);

  const filteredShops = derivedShops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === "all" || shop.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "inactive":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setNewShopData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const toggleCertification = (certification: string) => {
    setNewShopData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(certification)
        ? prev.certifications.filter((c) => c !== certification)
        : [...prev.certifications, certification],
    }));
  };

  const handleAddShop = () => {
    if (newShopData.name && newShopData.email && newShopData.phone) {
      onAddShop?.(newShopData);
      setShowAddShopModal(false);
      setNewShopData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        specialties: [],
        certifications: [],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold" style={{ color: primaryColor }}>
              Partner Shops
            </h1>
            <button
              onClick={() => setShowAddShopModal(true)}
              className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              <Plus className="w-5 h-5" />
              Add Shop
            </button>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search shops by name, region, or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Shops" },
                { id: "active", label: "Active" },
                { id: "pending", label: "Pending" },
                { id: "inactive", label: "Inactive" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filterStatus === filter.id
                      ? "text-white"
                      : "bg-white border border-gray-300 text-gray-700"
                  }`}
                  style={filterStatus === filter.id ? { backgroundColor: primaryColor } : {}}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {filteredShops.map((shop) => (
          <div key={shop.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{shop.name}</h3>
                    {shop.certified && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Certified
                      </span>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(shop.status)}`}>
                      {shop.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Star className="w-4 h-4 mr-1 text-amber-500" />
                    <span className="font-medium">{shop.rating}</span>
                    <span className="mx-1">•</span>
                    <span>{shop.reviewCount} reviews</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                  <span>
                    {shop.address}, {shop.city}, {shop.state} {shop.zip}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 ml-6">{shop.distance}</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Partner Since</p>
                  <p className="text-sm font-medium text-gray-900">{shop.partnerSince}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completed Jobs</p>
                  <p className="text-sm font-medium text-gray-900">{shop.completedJobs}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active Jobs</p>
                  <p className="text-sm font-medium" style={{ color: primaryColor }}>
                    {shop.activeJobs}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Completion</p>
                  <p className="text-sm font-medium text-gray-900">{shop.avgCompletionDays} days</p>
                </div>
              </div>

              <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Average Cost</p>
                    <p className="text-lg font-bold" style={{ color: primaryColor }}>
                      ${shop.avgCost.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Performance Trend</p>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Stable</span>
                    </div>
                  </div>
                </div>
              </div>

              {shop.specialties.length > 0 && (
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
              )}

              {shop.certifications.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Certifications:</p>
                  <div className="flex flex-wrap gap-1">
                    {shop.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded flex items-center gap-1"
                      >
                        <Award className="w-3 h-3" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <div className="grid grid-cols-3 gap-2">
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
            </div>
          </div>
        ))}
      </div>

      {showAddShopModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Add Partner Shop</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newShopData.name}
                    onChange={(e) => setNewShopData({ ...newShopData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="New partner shop"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newShopData.email}
                      onChange={(e) => setNewShopData({ ...newShopData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="shop@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newShopData.phone}
                      onChange={(e) => setNewShopData({ ...newShopData, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={newShopData.address}
                    onChange={(e) => setNewShopData({ ...newShopData, address: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={newShopData.city}
                    onChange={(e) => setNewShopData({ ...newShopData, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    value={newShopData.state}
                    onChange={(e) => setNewShopData({ ...newShopData, state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="NY"
                    maxLength={2}
                  />
                  <input
                    type="text"
                    value={newShopData.zip}
                    onChange={(e) => setNewShopData({ ...newShopData, zip: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="ZIP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                  <div className="flex flex-wrap gap-2">
                    {specialtyOptions.map((specialty) => (
                      <button
                        key={specialty}
                        type="button"
                        onClick={() => toggleSpecialty(specialty)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                          newShopData.specialties.includes(specialty)
                            ? "text-white border-transparent"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                        style={
                          newShopData.specialties.includes(specialty)
                            ? { backgroundColor: primaryColor }
                            : {}
                        }
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Certifications</label>
                  <div className="flex flex-wrap gap-2">
                    {certificationOptions.map((cert) => (
                      <button
                        key={cert}
                        type="button"
                        onClick={() => toggleCertification(cert)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                          newShopData.certifications.includes(cert)
                            ? "bg-green-600 text-white border-transparent"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {cert}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddShopModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddShop}
                  disabled={!newShopData.name || !newShopData.email || !newShopData.phone}
                  className="flex-1 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  Add Partner Shop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
