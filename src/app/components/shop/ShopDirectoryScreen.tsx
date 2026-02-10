import { useState } from "react";
import { Search, Star, MapPin, Award, TrendingUp, Filter, ChevronRight } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";

type ShopDirectoryScreenProps = {
  primaryColor?: string;
  secondaryColor?: string;
};

export default function ShopDirectoryScreen({
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9"
}: ShopDirectoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState("rating"); // rating, distance, reviews

  // Sample shop data with ratings
  const shops = [
    {
      id: 1,
      name: "Express Auto Body",
      rating: 4.8,
      reviews: 124,
      distance: "2.4 miles",
      certifications: ["ASE Certified", "I-CAR Gold Class"],
      specialties: ["Collision Repair", "Paintless Dent Removal"],
      averagePrice: "$850",
      completionRate: 98,
      responseTime: "< 2 hours",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      categoryRatings: {
        quality: 4.9,
        service: 4.7,
        timeliness: 4.8,
        value: 4.6
      }
    },
    {
      id: 2,
      name: "Premium Collision Center",
      rating: 4.6,
      reviews: 86,
      distance: "3.8 miles",
      certifications: ["Tesla Certified", "BMW Certified"],
      specialties: ["Luxury Vehicle Repair", "Frame Straightening"],
      averagePrice: "$925",
      completionRate: 95,
      responseTime: "< 3 hours",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      categoryRatings: {
        quality: 4.8,
        service: 4.5,
        timeliness: 4.4,
        value: 4.6
      }
    },
    {
      id: 3,
      name: "Value Auto Repair",
      rating: 4.2,
      reviews: 56,
      distance: "1.5 miles",
      certifications: ["AAA Approved"],
      specialties: ["Budget Repairs", "Insurance Claims"],
      averagePrice: "$675",
      completionRate: 92,
      responseTime: "< 4 hours",
      image: "https://images.unsplash.com/photo-1666919643134-d97687c1826c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      categoryRatings: {
        quality: 4.1,
        service: 4.3,
        timeliness: 4.0,
        value: 4.5
      }
    },
    {
      id: 4,
      name: "Elite Auto Works",
      rating: 4.9,
      reviews: 203,
      distance: "5.2 miles",
      certifications: ["Mercedes Certified", "Porsche Approved"],
      specialties: ["Exotic Cars", "Custom Paint"],
      averagePrice: "$1,250",
      completionRate: 99,
      responseTime: "< 1 hour",
      image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      categoryRatings: {
        quality: 5.0,
        service: 4.9,
        timeliness: 4.8,
        value: 4.7
      }
    }
  ];

  const filteredShops = shops
    .filter(shop => 
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterRating === 0 || shop.rating >= filterRating)
    )
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviews - a.reviews;
      if (sortBy === "distance") return parseFloat(a.distance) - parseFloat(b.distance);
      return 0;
    });

  return (
    <div className="pb-20">
      {/* Header */}
      <div 
        className="px-4 py-6 text-white"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
      >
        <h1 className="text-2xl font-bold mb-2">Shop Directory</h1>
        <p className="text-white text-opacity-90">
          Find and compare auto body repair shops in your network
        </p>
      </div>

      {/* Search and Filters */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSortBy("rating")}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              sortBy === "rating"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Highest Rated
          </button>
          <button
            onClick={() => setSortBy("reviews")}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              sortBy === "reviews"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Most Reviews
          </button>
          <button
            onClick={() => setSortBy("distance")}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              sortBy === "distance"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Nearest
          </button>
          <button
            onClick={() => setFilterRating(filterRating === 4.5 ? 0 : 4.5)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              filterRating > 0
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            4.5+ ⭐
          </button>
        </div>
      </div>

      {/* Shop List */}
      <div className="px-4 py-4">
        <div className="space-y-4">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="flex p-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                  <ImageWithFallback
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-1">{shop.name}</h3>
                  <div className="flex items-center mb-2">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#FBBF24" />
                    <span className="font-semibold mr-1">{shop.rating}</span>
                    <span className="text-sm text-gray-600">({shop.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{shop.distance}</span>
                    <span className="mx-2">•</span>
                    <span>{shop.responseTime} response</span>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="px-4 pb-4 space-y-3">
                {/* Category Ratings */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality:</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" fill="#FBBF24" />
                      <span className="font-medium">{shop.categoryRatings.quality}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" fill="#FBBF24" />
                      <span className="font-medium">{shop.categoryRatings.service}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeliness:</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" fill="#FBBF24" />
                      <span className="font-medium">{shop.categoryRatings.timeliness}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Value:</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" fill="#FBBF24" />
                      <span className="font-medium">{shop.categoryRatings.value}</span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-gray-700">{shop.completionRate}% completion rate</span>
                  </div>
                  <span className="text-gray-600">Avg: {shop.averagePrice}</span>
                </div>

                {/* Certifications */}
                <div className="flex flex-wrap gap-1">
                  {shop.certifications.map((cert, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full flex items-center"
                    >
                      <Award className="w-3 h-3 mr-1" />
                      {cert}
                    </span>
                  ))}
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1">
                  {shop.specialties.map((specialty, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* View Details Button */}
                <button
                  className="w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  View Full Profile
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
