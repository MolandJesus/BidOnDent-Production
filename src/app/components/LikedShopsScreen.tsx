import { useState } from "react";
import { ArrowLeft, Star, MapPin, Phone, Heart, MessageSquare, Award } from "lucide-react";
import ImageWithFallback from "./codelayer/ImageWithFallback";

type LikedShopsScreenProps = {
  onBack: () => void;
  primaryColor?: string;
  secondaryColor?: string;
};

export default function LikedShopsScreen({
  onBack,
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9"
}: LikedShopsScreenProps) {
  const [likedShops, setLikedShops] = useState([
    {
      id: 1,
      name: "Express Auto Body",
      rating: 4.8,
      reviews: 124,
      distance: "2.4 miles",
      phone: "(555) 123-4567",
      specialties: ["Collision Repair", "Paintless Dent Removal"],
      certifications: ["ASE Certified", "I-CAR Gold Class"],
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      lastUsed: "2026-12-15"
    },
    {
      id: 2,
      name: "Premium Collision Center",
      rating: 4.6,
      reviews: 86,
      distance: "3.8 miles",
      phone: "(555) 987-6543",
      specialties: ["Luxury Vehicle Repair", "Frame Straightening"],
      certifications: ["Tesla Certified", "BMW Certified"],
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      lastUsed: "2026-11-20"
    }
  ]);

  const handleUnlike = (shopId: number) => {
    setLikedShops(likedShops.filter(shop => shop.id !== shopId));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div 
        className="text-white sticky top-0 z-10"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
      >
        <div className="px-4 py-6">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Favorite Shops</h1>
              <p className="text-white/80 text-sm">{likedShops.length} saved shops</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {likedShops.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">No favorite shops yet</h3>
            <p className="text-gray-600">
              When you work with shops you love, save them here for easy access next time.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {likedShops.map((shop) => (
              <div
                key={shop.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex gap-3 mb-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <ImageWithFallback
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-lg">{shop.name}</h3>
                        <button
                          onClick={() => handleUnlike(shop.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Heart className="w-5 h-5 text-red-500" fill="#EF4444" />
                        </button>
                      </div>
                      
                      <div className="flex items-center mb-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#FBBF24" />
                        <span className="font-semibold mr-1">{shop.rating}</span>
                        <span className="text-gray-600">({shop.reviews})</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-gray-600">{shop.distance}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-1" />
                        <span>{shop.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="flex flex-wrap gap-1 mb-3">
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
                  <div className="flex flex-wrap gap-1 mb-4">
                    {shop.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-2 px-4 rounded-md text-white font-medium"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Request Quote
                    </button>
                    <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <Phone className="w-5 h-5 text-gray-600" />
                    </button>
                    <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
