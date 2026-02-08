import { useState } from "react";
import { X, Star } from "lucide-react";

type ShopRatingModalProps = {
  shopName: string;
  onClose: () => void;
  onSubmit: (rating: number, review: string, categoryRatings: { quality: number; service: number; timeliness: number; value: number }) => void;
  primaryColor?: string;
};

export default function ShopRatingModal({
  shopName,
  onClose,
  onSubmit,
  primaryColor = "#003d82"
}: ShopRatingModalProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [category, setCategory] = useState({
    quality: 0,
    service: 0,
    timeliness: 0,
    value: 0
  });

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select an overall rating");
      return;
    }
    onSubmit(rating, review, category);
  };

  // Independent StarRating component with its own hover state
  const StarRating = ({ 
    value, 
    onChange, 
    size = "w-8 h-8" 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    size?: string 
  }) => {
    // Each instance has its own hover state
    const [localHover, setLocalHover] = useState(0);

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setLocalHover(star)}
            onMouseLeave={() => setLocalHover(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`${size} ${
                star <= (localHover || value)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              fill={star <= (localHover || value) ? "#FBBF24" : "none"}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Rate {shopName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating *
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          {/* Category Ratings */}
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Rate specific aspects (optional):</p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality of Work
              </label>
              <StarRating 
                value={category.quality} 
                onChange={(val) => setCategory({...category, quality: val})}
                size="w-6 h-6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Service
              </label>
              <StarRating 
                value={category.service} 
                onChange={(val) => setCategory({...category, service: val})}
                size="w-6 h-6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeliness
              </label>
              <StarRating 
                value={category.timeliness} 
                onChange={(val) => setCategory({...category, timeliness: val})}
                size="w-6 h-6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value for Money
              </label>
              <StarRating 
                value={category.value} 
                onChange={(val) => setCategory({...category, value: val})}
                size="w-6 h-6"
              />
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder="Share your experience with this shop..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 text-white rounded-md font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              Submit Rating
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
