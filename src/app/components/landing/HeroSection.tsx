import { ChevronRight, Car } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ImageErrorBoundary } from "../ImageErrorBoundary";

interface HeroSectionProps {
  heroImage: string;
  primaryColor: string;
  secondaryColor: string;
  ctaButtonText: string;
  isLoggedIn: boolean;
  userType?: "customer" | "shop" | "insurer";
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export default function HeroSection({
  heroImage,
  primaryColor,
  secondaryColor,
  ctaButtonText,
  isLoggedIn,
  userType,
  onGetStarted,
  onLearnMore
}: HeroSectionProps) {
  const getButtonText = () => {
    if (isLoggedIn) {
      if (userType === "customer") return "Start New Report";
      if (userType === "insurer") return "Create New Claim";
      if (userType === "shop") return "View Requests";
      return "Get Started";
    }
    return ctaButtonText;
  };

  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 space-y-6">
            {/* Main Content */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                <span className="text-gray-800">Get the </span>
                <span style={{ color: '#002a5c' }}>Best Price</span>
                <span className="text-gray-800"> on Your </span>
                <span style={{ color: '#2b8abf' }}>Auto Body Repair</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Compare competitive bids from trusted local shops and choose the solution that works best for you.
              </p>
              <div className="space-y-3 pt-2">
                <p className="text-base text-gray-700 leading-relaxed flex items-start">
                  <span 
                    className="mr-3 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm mt-0.5"
                    style={{ backgroundColor: primaryColor }}
                  >
                    ✓
                  </span>
                  <span>Connect with trusted local auto body collision repair shops</span>
                </p>
                <p className="text-base text-gray-700 leading-relaxed flex items-start">
                  <span 
                    className="mr-3 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm mt-0.5"
                    style={{ backgroundColor: primaryColor }}
                  >
                    ✓
                  </span>
                  <span>Obtain competitive bids for repairs in your area, with or without an insurance claim</span>
                </p>
                <p className="text-base text-gray-700 leading-relaxed flex items-start">
                  <span 
                    className="mr-3 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm mt-0.5"
                    style={{ backgroundColor: primaryColor }}
                  >
                    ✓
                  </span>
                  <span>Choose the solution that works best for you</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onGetStarted}
                className="px-8 py-4 rounded-lg text-white font-semibold text-lg hover:opacity-90 transition-all inline-flex items-center justify-center shadow-lg hover:shadow-xl"
                style={{ backgroundColor: primaryColor }}
              >
                {getButtonText()}
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
              <button 
                onClick={onLearnMore}
                className="px-8 py-4 rounded-lg border-2 font-semibold text-lg hover:bg-gray-50 transition-all duration-300 inline-flex items-center justify-center hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                Learn More
              </button>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <ImageErrorBoundary>
              <ImageWithFallback 
                src={heroImage} 
                alt="Professional auto body repair service - Precision dent removal and paintless dent repair" 
                className="rounded-2xl shadow-2xl w-full h-auto object-cover hover:shadow-3xl transition-shadow"
                style={{
                  aspectRatio: '16/10',
                  maxHeight: '600px'
                }}
              />
            </ImageErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  );
}