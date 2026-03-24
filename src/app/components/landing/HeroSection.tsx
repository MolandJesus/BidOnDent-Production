import { ChevronRight, CheckCircle, Play } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ImageErrorBoundary } from "../ImageErrorBoundary";
import { useEffect, useState, useRef, useCallback } from "react";

const VALUE_STATEMENTS = [
  "Connect with trusted local auto body collision repair shops",
  "Obtain competitive bids for repairs, with or without insurance",
  "Choose the solution that works best for you",
];

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
  const [activeValue, setActiveValue] = useState(0);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const advanceCarousel = useCallback(() => {
    setActiveValue((prev) => (prev + 1) % VALUE_STATEMENTS.length);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion.current) return;
    const interval = setInterval(advanceCarousel, 3800);
    return () => clearInterval(interval);
  }, [advanceCarousel]);

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
    <section className="pt-32 pb-20 overflow-hidden relative bg-gradient-to-br from-[#e8f0fe] via-[#f0f6ff] to-[#e8f4fd]">
      {/* Structural blue atmosphere layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,61,130,0.08),transparent)]" />
      {/* Decorative background blobs */}
      <div className="absolute top-20 right-0 w-72 h-72 bg-blue-200 rounded-full opacity-25 blur-3xl animate-blob" />
      <div
        className="absolute bottom-10 left-0 w-96 h-96 bg-blue-300 rounded-full opacity-15 blur-3xl animate-blob"
        style={{ animationDelay: "4s" }}
      />

      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 space-y-6">
            {/* Trusted badge */}
            <div
              className={`transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bd-glass-badge text-sm font-medium shadow-sm">
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
                <span style={{ color: "#0c2340" }}>Get the </span>
                <span style={{ color: "#003d82" }}>Best Price</span>
                <span style={{ color: "#0c2340" }}> on Your </span>
                <br />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Auto Body Repair
                </span>
              </h2>
              <p
                className={`text-lg text-slate-600 leading-relaxed transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: "0.35s" }}
              >
                Compare competitive bids from trusted local shops and choose the solution that works
                best for you.
              </p>

              {/* Value carousel — cycles through 3 statements */}
              <div
                className={`relative h-16 overflow-hidden pt-2 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: "0.5s" }}
              >
                {VALUE_STATEMENTS.map((statement, i) => (
                  <p
                    key={i}
                    className="absolute inset-x-0 flex items-start text-base text-slate-700 leading-relaxed transition-all duration-500 ease-in-out"
                    style={{
                      opacity: activeValue === i ? 1 : 0,
                      transform: `translateY(${activeValue === i ? "0" : "12px"})`,
                    }}
                    aria-hidden={activeValue !== i}
                  >
                    <span
                      className="mr-3 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-sm mt-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      }}
                    >
                      ✓
                    </span>
                    <span>{statement}</span>
                  </p>
                ))}
                {/* Carousel dots */}
                <div className="absolute bottom-0 left-9 flex gap-0.5">
                  {VALUE_STATEMENTS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Value ${i + 1}`}
                      className="flex h-11 w-7 items-center justify-center"
                      onClick={() => setActiveValue(i)}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: activeValue === i ? primaryColor : "rgba(0,61,130,0.2)",
                          transform: activeValue === i ? "scale(1.3)" : "scale(1)",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-4 pt-4 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "0.65s" }}
            >
              <button
                onClick={onGetStarted}
                className="bd-glass-control inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                type="button"
              >
                {getButtonText()}
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={onLearnMore}
                className="bd-glass-control--secondary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                type="button"
              >
                <Play className="w-4 h-4 fill-current" />
                Learn More
              </button>
            </div>

            {/* Trust microcopy */}
            <div
              className={`flex flex-wrap items-center gap-3 pt-2 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "0.9s" }}
            >
              {["Now available in NY", "Transparent bids", "Free for customers"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full bd-glass-badge px-3 py-1.5 text-sm font-medium shadow-sm"
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

            {/* Floating "NY" region badge */}
            <div
              className={`absolute -top-2 -right-2 md:top-4 md:-right-6 bd-glass-floating px-4 py-3 animate-float transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
              style={{ transitionDelay: "1.2s" }}
            >
              <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                NY
              </div>
              <div className="text-xs text-slate-500 font-medium">Active Service Region</div>
            </div>

            {/* Floating notification card */}
            <div
              className={`absolute bottom-4 left-0 md:-left-6 md:bottom-8 bd-glass-floating px-4 py-3 flex items-center gap-3 animate-float-slow transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
              style={{ transitionDelay: "1.6s", animationDelay: "1s" }}
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-800">Repair Completed!</div>
                <div className="text-xs text-slate-500">
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
