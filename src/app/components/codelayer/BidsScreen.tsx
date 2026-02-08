import { useState } from "react";
import { DollarSign, Clock, MapPin, Star, ChevronDown, ChevronUp, Phone, MessageSquare, ExternalLink, ThumbsUp, ArrowLeft } from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import ShopRatingModal from "../ShopRatingModal";

type BidsScreenProps = {
  primaryColor?: string;
  secondaryColor?: string;
  onBack?: () => void;
  userType?: "customer" | "shop" | "insurer";
};

export default function BidsScreen({
  primaryColor = "#0056b3",
  secondaryColor = "#00a0e9",
  onBack,
  userType = "customer"
}: BidsScreenProps) {
  const [activeBid, setActiveBid] = useState<number | null>(null);
  const [filter, setFilter] = useState("all"); // all, lowest, fastest, rating
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [shopRatings, setShopRatings] = useState<{[key: string]: {rating: number, review: string, categoryRatings?: any}}>({});

  // Sample bids data
  const bids = [
    {
      id: 1,
      shopName: "Express Auto Body",
      rating: 4.8,
      reviews: 124,
      price: 850,
      timeframe: "3-4 days",
      distance: "2.4 miles",
      description: "Complete bumper repair and painting to match original color. We use OEM parts and offer a 2-year warranty on all our work.",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      shopName: "Premium Collision Center",
      rating: 4.6,
      reviews: 86,
      price: 925,
      timeframe: "2-3 days",
      distance: "3.8 miles",
      description: "Full bumper replacement with factory paint match. Includes rental car for the duration of repair. We are a certified auto body repair shop for most major manufacturers.",
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      shopName: "Value Auto Repair",
      rating: 4.2,
      reviews: 56,
      price: 675,
      timeframe: "5-7 days",
      distance: "1.5 miles",
      description: "Bumper repair and repainting. We offer competitive pricing and can work with all insurance providers. Free pickup and delivery within 5 miles.",
      image: "https://images.unsplash.com/photo-1666919643134-d97687c1826c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  // Apply filter to bids
  const filteredBids = [...bids].sort((a, b) => {
    if (filter === "lowest") return a.price - b.price;
    if (filter === "fastest") {
      // Parse timeframe to get the lower number of days
      const aDays = parseInt(a.timeframe.split('-')[0]);
      const bDays = parseInt(b.timeframe.split('-')[0]);
      return aDays - bDays;
    }
    if (filter === "rating") return b.rating - a.rating;
    return 0; // default "all"
  });

  const toggleBid = (id: number) => {
    if (activeBid === id) {
      setActiveBid(null);
    } else {
      setActiveBid(id);
    }
  };

  const handleRating = (shopName: string, rating: number, review: string, categoryRatings: { quality: number; service: number; timeliness: number; value: number }) => {
    setShopRatings(prevRatings => ({
      ...prevRatings,
      [shopName]: { rating, review, categoryRatings }
    }));
    setShowRatingModal(false);
  };

  return (
    <div className="pb-20">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={onBack}
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          )}
          <div className="flex-1">
            <h1 className="font-bold text-lg mb-2">Repair Bids</h1>
            <p className="text-gray-600 text-sm">3 bids for your 2021 Toyota Camry</p>
          </div>
        </div>
      </div>
      
      {/* Filter options */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              filter === "all" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-white text-gray-700 border border-gray-300"
            }`}
            onClick={() => setFilter("all")}
          >
            All Bids
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              filter === "lowest" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-white text-gray-700 border border-gray-300"
            }`}
            onClick={() => setFilter("lowest")}
          >
            Lowest Price
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              filter === "fastest" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-white text-gray-700 border border-gray-300"
            }`}
            onClick={() => setFilter("fastest")}
          >
            Fastest
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm ${
              filter === "rating" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-white text-gray-700 border border-gray-300"
            }`}
            onClick={() => setFilter("rating")}
          >
            Highest Rated
          </button>
        </div>
      </div>
      
      {/* Bids list */}
      <div className="px-4 py-3">
        <div className="space-y-4">
          {filteredBids.map((bid) => (
            <div 
              key={bid.id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
            >
              <div className="flex items-center p-4 cursor-pointer" onClick={() => toggleBid(bid.id)}>
                <div className="w-12 h-12 rounded overflow-hidden mr-3">
                  <ImageWithFallback
                    src={bid.image}
                    alt={bid.shopName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{bid.shopName}</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="flex items-center mr-2">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" fill="#FBBF24" />
                      <span>{bid.rating}</span>
                    </div>
                    <span>({bid.reviews} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">${bid.price}</div>
                  <div className="text-sm text-gray-600">{bid.timeframe}</div>
                </div>
                <div className="ml-2">
                  {activeBid === bid.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
              
              {activeBid === bid.id && (
                <div className="p-4 border-t border-gray-100">
                  <div className="flex space-x-4 mb-4 text-sm">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1 text-gray-500" />
                      <span>${bid.price}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1 text-gray-500" />
                      <span>{bid.timeframe}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                      <span>{bid.distance}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {bid.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="px-4 py-2 rounded text-white font-medium flex-1"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Accept Bid
                    </button>
                    <button
                      className="px-4 py-2 rounded border border-gray-300 font-medium"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      className="px-4 py-2 rounded border border-gray-300 font-medium"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      className="px-4 py-2 rounded border border-gray-300 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    {/* Only customers can rate shops */}
                    {userType === "customer" && (
                      <button
                        className="px-4 py-2 rounded border border-gray-300 font-medium"
                        onClick={() => {
                          setSelectedShop(bid.shopName);
                          setShowRatingModal(true);
                        }}
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {showRatingModal && (
        <ShopRatingModal
          shopName={selectedShop}
          onClose={() => setShowRatingModal(false)}
          onSubmit={(rating, review, categoryRatings) => handleRating(selectedShop, rating, review, categoryRatings)}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
}