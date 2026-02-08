import { ArrowLeft, Search, Star, MapPin, Phone, Mail, Shield, CheckCircle, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

interface InsuranceCompaniesScreenProps {
  onBack: () => void;
  primaryColor: string;
  secondaryColor: string;
  userType?: "customer" | "shop" | "insurer";
}

interface InsuranceCompany {
  id: string;
  name: string;
  logo: string;
  rating: number;
  reviewCount: number;
  coverage: string[];
  location: string;
  phone: string;
  email: string;
  partneredShops: number;
  claimsProcessed: number;
  avgProcessingTime: string;
  verified: boolean;
  description: string;
}

export default function InsuranceCompaniesScreen({ 
  onBack, 
  primaryColor, 
  secondaryColor,
  userType = "customer"
}: InsuranceCompaniesScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "verified" | "high-rated">("all");

  // Mock insurance companies data
  const insuranceCompanies: InsuranceCompany[] = [
    {
      id: "1",
      name: "SafeDrive Insurance",
      logo: "🛡️",
      rating: 4.8,
      reviewCount: 2847,
      coverage: ["Collision", "Comprehensive", "Liability"],
      location: "Nationwide",
      phone: "(555) 123-4567",
      email: "claims@safedrive.com",
      partneredShops: 450,
      claimsProcessed: 12500,
      avgProcessingTime: "2-3 days",
      verified: true,
      description: "Leading auto insurance provider with fast claims processing"
    },
    {
      id: "2",
      name: "AutoGuard Pro",
      logo: "🚗",
      rating: 4.6,
      reviewCount: 1923,
      coverage: ["Collision", "Comprehensive", "Uninsured Motorist"],
      location: "Eastern US",
      phone: "(555) 234-5678",
      email: "support@autoguard.com",
      partneredShops: 320,
      claimsProcessed: 8900,
      avgProcessingTime: "3-4 days",
      verified: true,
      description: "Trusted insurance with excellent customer service"
    },
    {
      id: "3",
      name: "Premier Auto Coverage",
      logo: "⭐",
      rating: 4.9,
      reviewCount: 3421,
      coverage: ["Collision", "Comprehensive", "Liability", "Glass Coverage"],
      location: "Nationwide",
      phone: "(555) 345-6789",
      email: "claims@premierauto.com",
      partneredShops: 680,
      claimsProcessed: 18200,
      avgProcessingTime: "1-2 days",
      verified: true,
      description: "Premium insurance with fastest claims processing in the industry"
    },
    {
      id: "4",
      name: "ValueShield Insurance",
      logo: "💼",
      rating: 4.4,
      reviewCount: 1456,
      coverage: ["Basic Liability", "Collision"],
      location: "Western US",
      phone: "(555) 456-7890",
      email: "info@valueshield.com",
      partneredShops: 210,
      claimsProcessed: 5600,
      avgProcessingTime: "4-5 days",
      verified: false,
      description: "Affordable insurance options for budget-conscious drivers"
    },
    {
      id: "5",
      name: "Elite Coverage Group",
      logo: "🏆",
      rating: 4.7,
      reviewCount: 2156,
      coverage: ["Collision", "Comprehensive", "Roadside Assistance", "Rental Coverage"],
      location: "Nationwide",
      phone: "(555) 567-8901",
      email: "service@elitecoverage.com",
      partneredShops: 540,
      claimsProcessed: 14800,
      avgProcessingTime: "2-3 days",
      verified: true,
      description: "Comprehensive coverage with additional benefits and perks"
    }
  ];

  const filteredCompanies = insuranceCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "verified") return matchesSearch && company.verified;
    if (filterType === "high-rated") return matchesSearch && company.rating >= 4.7;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div 
        className="sticky top-0 z-10 px-4 py-4 text-white shadow-md"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Insurance Companies</h1>
            <p className="text-sm text-white/80">
              {userType === "shop" ? "Partner with insurance providers" : "Find your insurance provider"}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            placeholder="Search insurance companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterType === "all"
                ? "text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={filterType === "all" ? { backgroundColor: primaryColor } : {}}
          >
            All Companies
          </button>
          <button
            onClick={() => setFilterType("verified")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterType === "verified"
                ? "text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={filterType === "verified" ? { backgroundColor: primaryColor } : {}}
          >
            Verified Only
          </button>
          <button
            onClick={() => setFilterType("high-rated")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterType === "high-rated"
                ? "text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={filterType === "high-rated" ? { backgroundColor: primaryColor } : {}}
          >
            High Rated (4.7+)
          </button>
        </div>
      </div>

      {/* Stats Bar (for shops) */}
      {userType === "shop" && (
        <div className="px-4 py-4 bg-white border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {filteredCompanies.length}
              </p>
              <p className="text-xs text-gray-500">Available</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {filteredCompanies.filter(c => c.verified).length}
              </p>
              <p className="text-xs text-gray-500">Verified</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: primaryColor }}>
                {Math.round(filteredCompanies.reduce((acc, c) => acc + c.rating, 0) / filteredCompanies.length * 10) / 10}
              </p>
              <p className="text-xs text-gray-500">Avg Rating</p>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Companies List */}
      <div className="px-4 py-4 space-y-4">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No insurance companies found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Company Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{company.logo}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{company.name}</h3>
                        {company.verified && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{company.rating}</span>
                        <span className="text-sm text-gray-400">({company.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                  <button
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {userType === "shop" ? "Partner" : "Select"}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-3">{company.description}</p>
              </div>

              {/* Company Details */}
              <div className="p-4 space-y-3">
                {/* Coverage Types */}
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Coverage Types</p>
                  <div className="flex flex-wrap gap-2">
                    {company.coverage.map((type, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Claims Processed</p>
                      <p className="text-sm font-medium text-gray-900">
                        {company.claimsProcessed.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Partner Shops</p>
                      <p className="text-sm font-medium text-gray-900">
                        {company.partneredShops}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{company.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{company.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{company.email}</span>
                  </div>
                </div>

                {/* Processing Time */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Processing Time:</span>
                    <span className="text-sm font-medium" style={{ color: primaryColor }}>
                      {company.avgProcessingTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
