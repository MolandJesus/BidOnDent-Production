import { ChevronRight, CheckCircle, Play } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ImageErrorBoundary } from "../ImageErrorBoundary";
import { useEffect, useState } from "react";

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
  onLearnMore,
}: HeroSectionProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
    <section className="pt-32 pb-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden relative">
      {/* Decorative background blobs */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-blue-100 rounded-full opacity-20 blur-3xl animate-blob" />
      <div
        className="absolute bottom-10 left-0 w-96 h-96 bg-blue-200 rounded-full opacity-15 blur-3xl animate-blob"
        style={{ animationDelay: "4s" }}
      />

      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 space-y-6">
            {/* Trusted badge */}
            <div
              className={`transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Trusted workflow for customers, shops, and insurers
              </span>
            </div>

            {/* Main Content */}
            <div className="space-y-4">
              <h2
                className={`text-3xl md:text-5xl font-bold leading-tight transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: "0.2s" }}
              >
                <span className="text-gray-800">Get the </span>
                <span style={{ color: "#002a5c" }}>Best Price</span>
                <span className="text-gray-800"> on Your </span>
                <br />
                <span style={{ color: "#2b8abf" }}>Auto Body Repair</span>
              </h2>
              <p
                className={`text-lg text-gray-600 leading-relaxed transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: "0.35s" }}
              >
                Compare competitive bids from trusted local shops and choose the solution that works
                best for you.
              </p>
              <div
                className={`space-y-3 pt-2 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: "0.5s" }}
              >
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
                  <span>
                    Obtain competitive bids for repairs in your area, with or without an insurance
                    claim
                  </span>
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

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 pt-4 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "0.65s" }}
            >
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-[0.97] hover:brightness-110"
                style={{ backgroundColor: primaryColor }}
              >
                {getButtonText()}
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={onLearnMore}
                className="px-8 py-4 rounded-xl border-2 font-semibold text-lg hover:bg-gray-50 transition-all duration-300 inline-flex items-center justify-center hover:shadow-lg hover:-translate-y-1 active:scale-[0.97] gap-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <Play className="w-4 h-4 fill-current" />
                Learn More
              </button>
            </div>

            {/* Trust microcopy */}
            <div
              className={`flex items-center gap-3 pt-2 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "0.9s" }}
            >
              {["Active NY rollout", "Transparent bids", "Free for customers"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Hero Image with floating elements */}
          <div
            className={`md:w-1/2 relative transition-all duration-1000 ${loaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`}
            style={{ transitionDelay: "0.3s" }}
          >
            <ImageErrorBoundary>
              <ImageWithFallback
                src={heroImage}
                alt="Professional auto body repair service - Precision dent removal and paintless dent repair"
                className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                style={{
                  aspectRatio: "16/10",
                  maxHeight: "600px",
                }}
              />
            </ImageErrorBoundary>

            {/* Floating "500+ Partner Shops" badge */}
            <div
              className={`absolute -top-2 -right-2 md:top-4 md:-right-6 bg-white rounded-xl shadow-lg px-4 py-3 animate-float transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
              style={{ transitionDelay: "1.2s" }}
            >
              <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                NY
              </div>
              <div className="text-xs text-gray-500 font-medium">Active Service Region</div>
            </div>

            {/* Floating notification card */}
            <div
              className={`absolute bottom-4 left-0 md:-left-6 md:bottom-8 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 animate-float-slow transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
              style={{ transitionDelay: "1.6s", animationDelay: "1s" }}
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">Repair Completed!</div>
                <div className="text-xs text-gray-500">
                  Bid selected and scheduled through platform
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
