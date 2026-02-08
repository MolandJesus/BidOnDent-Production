import { useState } from "react";
import { ArrowLeft, Clock, MapPin, DollarSign, Star, Phone, MessageSquare, ChevronRight } from "lucide-react";
import ImageWithFallback from "./codelayer/ImageWithFallback";

type Report = {
  id: number | string;
  vehicle?: {
    make: string;
    model: string;
    year: string;
    vin?: string;
  };
  // Support flattened vehicle info (from Supabase)
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  damageArea: string;
  photos: string[];
  description: string;
  incident?: string;
  status: string;
  submittedAt: string;
  bidsCount: number;
};

type ReportDetailScreenProps = {
  report: Report;
  onBack: () => void;
  primaryColor?: string;
  secondaryColor?: string;
};

export default function ReportDetailScreen({
  report,
  onBack,
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9"
}: ReportDetailScreenProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  // Handle both nested vehicle and flattened vehicle properties
  const vehicleInfo = report.vehicle || {
    make: report.vehicle_make || '',
    model: report.vehicle_model || '',
    year: report.vehicle_year?.toString() || ''
  };
  
  // Provide safe defaults for potentially undefined properties
  const status = report.status || 'pending';
  const photos = report.photos || [];
  const damageArea = report.damageArea || 'Unknown';
  const description = report.description || 'No description provided';
  const submittedAt = report.submittedAt || new Date().toISOString();

  // Mock interested shops
  const interestedShops = [
    {
      id: 1,
      name: "Express Auto Body",
      rating: 4.8,
      reviews: 124,
      distance: "2.4 miles",
      hasBid: true,
      bidAmount: 850,
      estimatedTime: "3-4 days",
      image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      name: "Premium Collision Center",
      rating: 4.6,
      reviews: 86,
      distance: "3.8 miles",
      hasBid: false,
      bidAmount: null,
      estimatedTime: null,
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      name: "Value Auto Repair",
      rating: 4.2,
      reviews: 56,
      distance: "1.5 miles",
      hasBid: true,
      bidAmount: 675,
      estimatedTime: "5-7 days",
      image: "https://images.unsplash.com/photo-1666919643134-d97687c1826c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">
                {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
              </h1>
              <p className="text-sm text-gray-600">Report #{report.id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === "pending" 
                ? "bg-yellow-100 text-yellow-700"
                : status === "active"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Photo Gallery */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4">
            <h2 className="font-bold text-lg mb-3">Damage Photos</h2>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <ImageWithFallback
                    src={photo}
                    alt={`Damage photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-bold text-lg mb-3">Vehicle Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Year:</span>
              <span className="font-medium">{vehicleInfo.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Make:</span>
              <span className="font-medium">{vehicleInfo.make}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="font-medium">{vehicleInfo.model}</span>
            </div>
            {report.vehicle?.vin && (
              <div className="flex justify-between">
                <span className="text-gray-600">VIN:</span>
                <span className="font-medium text-sm">{report.vehicle.vin}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Damaged Area:</span>
              <span className="font-medium capitalize">{damageArea}</span>
            </div>
          </div>
        </div>

        {/* Damage Description */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-bold text-lg mb-3">Damage Description</h2>
          <p className="text-gray-700">{description}</p>
          {report.incident && (
            <>
              <h3 className="font-medium mt-4 mb-2">What Happened</h3>
              <p className="text-gray-700">{report.incident}</p>
            </>
          )}
        </div>

        {/* Submission Details */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-bold text-lg mb-3">Submission Details</h2>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>Submitted on {new Date(submittedAt).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Interested Shops */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Interested Shops</h2>
            <span className="text-sm text-gray-600">
              {interestedShops.filter(s => s.hasBid).length} bids received
            </span>
          </div>

          <div className="space-y-3">
            {interestedShops.map((shop) => (
              <div
                key={shop.id}
                className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <ImageWithFallback
                      src={shop.image}
                      alt={shop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium">{shop.name}</h3>
                      {shop.hasBid && (
                        <span 
                          className="px-2 py-1 rounded-md text-xs font-bold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          BID
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm mb-2">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" fill="#FBBF24" />
                      <span className="font-medium mr-1">{shop.rating}</span>
                      <span className="text-gray-500">({shop.reviews})</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                      <span className="text-gray-600">{shop.distance}</span>
                    </div>

                    {shop.hasBid ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold" style={{ color: primaryColor }}>
                            ${shop.bidAmount?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">{shop.estimatedTime}</div>
                        </div>
                        <button
                          className="px-3 py-1.5 rounded-md text-white text-sm font-medium"
                          style={{ backgroundColor: primaryColor }}
                        >
                          View Bid
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 italic">Reviewing your request...</span>
                        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                          <Phone className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {interestedShops.filter(s => s.hasBid).length > 0 && (
            <button
              className="w-full mt-4 py-3 px-4 rounded-lg text-white font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              Compare All Bids
            </button>
          )}
        </div>
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setSelectedPhoto(null)}
          >
            ×
          </button>
          <img
            src={selectedPhoto}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}