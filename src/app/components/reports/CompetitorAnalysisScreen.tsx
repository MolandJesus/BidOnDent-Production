import { ArrowLeft, Search, Star, MapPin, TrendingUp, TrendingDown, Award, Clock, DollarSign, Wrench, CheckCircle } from "lucide-react";
import { useState } from "react";

interface CompetitorAnalysisScreenProps {
  onBack: () => void;
  primaryColor: string;
  secondaryColor: string;
}

interface CompetitorShop {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
  specialties: string[];
  avgRepairTime: string;
  avgCost: string;
  monthlyJobs: number;
  certifications: string[];
  trending: "up" | "down" | "stable";
  verified: boolean;
}

export default function CompetitorAnalysisScreen({ 
  onBack, 
  primaryColor, 
  secondaryColor 
}: CompetitorAnalysisScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "jobs" | "distance">("rating");

  // Mock competitor data
  const competitors: CompetitorShop[] = [
    {
      id: "1",
      name: "Elite Auto Body",
      rating: 4.9,
      reviewCount: 1847,
      location: "Downtown",
      distance: "2.3 miles",
      specialties: ["Collision", "Paint", "Dent Repair"],
      avgRepairTime: "3-4 days",
      avgCost: "$2,800",
      monthlyJobs: 145,
      certifications: ["I-CAR Gold", "ASE Certified"],
      trending: "up",
      verified: true
    },
    {
      id: "2",
      name: "Precision Auto Repair",
      rating: 4.7,
      reviewCount: 1234,
      location: "Westside",
      distance: "3.8 miles",
      specialties: ["Collision", "Frame Repair", "Paint"],
      avgRepairTime: "4-5 days",
      avgCost: "$2,500",
      monthlyJobs: 112,
      certifications: ["I-CAR Gold", "Tesla Certified"],
      trending: "stable",
      verified: true
    },
    {
      id: "3",
      name: "QuickFix Body Shop",
      rating: 4.5,
      reviewCount: 892,
      location: "Eastside",
      distance: "5.1 miles",
      specialties: ["Dent Repair", "Paint Touch-up"],
      avgRepairTime: "2-3 days",
      avgCost: "$1,900",
      monthlyJobs: 178,
      certifications: ["ASE Certified"],
      trending: "up",
      verified: false
    },
    {
      id: "4",
      name: "Master Auto Collision",
      rating: 4.8,
      reviewCount: 2156,
      location: "North District",
      distance: "1.7 miles",
      specialties: ["Collision", "Frame Repair", "Paint", "Glass"],
      avgRepairTime: "3-5 days",
      avgCost: "$3,100",
      monthlyJobs: 134,
      certifications: ["I-CAR Platinum", "ASE Certified", "BMW Certified"],
      trending: "up",
      verified: true
    },
    {
      id: "5",
      name: "Budget Auto Body",
      rating: 4.2,
      reviewCount: 654,
      location: "South End",
      distance: "6.4 miles",
      specialties: ["Basic Repairs", "Paint"],
      avgRepairTime: "5-7 days",
      avgCost: "$1,600",
      monthlyJobs: 95,
      certifications: ["ASE Certified"],
      trending: "down",
      verified: false
    }
  ];

  const filteredCompetitors = competitors
    .filter(shop => 
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "jobs") return b.monthlyJobs - a.monthlyJobs;
      if (sortBy === "distance") return parseFloat(a.distance) - parseFloat(b.distance);
      return 0;
    });

  // Calculate market stats
  const totalJobs = competitors.reduce((sum, c) => sum + c.monthlyJobs, 0);
  const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length;
  const yourShopJobs = 128; // Mock data for current shop

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
            <h1 className="text-xl font-bold">Competitor Analysis</h1>
            <p className="text-sm text-white/80">Monitor market competition</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            placeholder="Search competitors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>

      {/* Market Stats */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-600 mb-3">Market Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: primaryColor }}>
              {competitors.length}
            </p>
            <p className="text-xs text-gray-500">Competitors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: primaryColor }}>
              {totalJobs}
            </p>
            <p className="text-xs text-gray-500">Monthly Jobs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: primaryColor }}>
              {avgRating.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">Avg Rating</p>
          </div>
        </div>

        {/* Your Shop Position */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Your Market Share:</span>
            <span className="text-sm font-bold" style={{ color: primaryColor }}>
              {((yourShopJobs / totalJobs) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${(yourShopJobs / totalJobs) * 100}%`,
                backgroundColor: primaryColor
              }}
            />
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSortBy("rating")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              sortBy === "rating"
                ? "text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={sortBy === "rating" ? { backgroundColor: primaryColor } : {}}
          >
            By Rating
          </button>
          <button
            onClick={() => setSortBy("jobs")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              sortBy === "jobs"
                ? "text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={sortBy === "jobs" ? { backgroundColor: primaryColor } : {}}
          >
            By Jobs
          </button>
          <button
            onClick={() => setSortBy("distance")}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              sortBy === "distance"
                ? "text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            style={sortBy === "distance" ? { backgroundColor: primaryColor } : {}}
          >
            By Distance
          </button>
        </div>
      </div>

      {/* Competitors List */}
      <div className="px-4 py-4 space-y-4">
        {filteredCompetitors.map((shop, index) => (
          <div
            key={shop.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            {/* Shop Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                    <h3 className="font-bold text-gray-900">{shop.name}</h3>
                    {shop.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{shop.rating}</span>
                      <span className="text-sm text-gray-400">({shop.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{shop.distance}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {shop.trending === "up" && (
                    <>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <span className="text-xs font-medium text-green-600">Rising</span>
                    </>
                  )}
                  {shop.trending === "down" && (
                    <>
                      <TrendingDown className="w-5 h-5 text-red-500" />
                      <span className="text-xs font-medium text-red-600">Falling</span>
                    </>
                  )}
                  {shop.trending === "stable" && (
                    <span className="text-xs font-medium text-gray-500">Stable</span>
                  )}
                </div>
              </div>
            </div>

            {/* Shop Stats */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Monthly Jobs</p>
                    <p className="text-sm font-medium text-gray-900">{shop.monthlyJobs}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Avg Cost</p>
                    <p className="text-sm font-medium text-gray-900">{shop.avgCost}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Avg Time</p>
                    <p className="text-sm font-medium text-gray-900">{shop.avgRepairTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">{shop.location}</p>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {shop.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Certifications</p>
                <div className="flex flex-wrap gap-2">
                  {shop.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium flex items-center gap-1"
                    >
                      <Award className="w-3 h-3" />
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
