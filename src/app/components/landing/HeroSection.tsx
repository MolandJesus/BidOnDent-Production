import { ChevronRight, CheckCircle, Play, Star, Shield } from "lucide-react";
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
    const timer = setTimeout(() => setLoaded(true), 120);
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
    <section className="pt-28 sm:pt-32 pb-20 sm:pb-28 overflow-hidden relative bg-gradient-to-br from-[#f8f9fc] via-[#f0f4fa] to-[#e8eef6]">
      {/* Warm atmospheric depth layers — soft, natural lighting feel */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-15%,rgba(99,147,205,0.12),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_85%_80%,rgba(147,130,205,0.07),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_110%,rgba(180,200,220,0.1),transparent_50%)]" />
      {/* Soft ambient blobs — warm and diffused */}
      <div className="absolute top-16 right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-[80px] animate-blob" />
      <div
        className="absolute bottom-20 -left-10 w-80 h-80 bg-violet-200/20 rounded-full blur-[90px] animate-blob"
        style={{ animationDelay: "4s" }}
      />
      <div
        className="absolute top-1/3 left-1/4 w-64 h-64 bg-sky-100/25 rounded-full blur-[70px] animate-blob"
        style={{ animationDelay: "2s" }}
      />

      <div className="container mx-auto px-5 sm:px-6 max-w-7xl relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          {/* Left column — text content */}
          <div className="lg:w-[48%] space-y-5 sm:space-y-7">
            {/* Trusted badge */}
            <div
              className={`transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bd-glass-badge text-xs sm:text-sm font-medium shadow-sm">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse" />
                Trusted workflow for customers, shops, and insurers
              </span>
            </div>

            {/* Main Content */}
            <div className="space-y-4 sm:space-y-5">
              <h2
                className={`text-[1.75rem] sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold leading-[1.15] tracking-tight transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: "0.2s" }}
              >
                <span className="text-slate-900">Get the </span>
                <span className="text-[#1a4f8b]">Best Price</span>
                <span className="text-slate-900"> on Your </span>
                <br className="hidden sm:block" />
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
                className={`text-base sm:text-lg text-slate-500 leading-relaxed max-w-lg transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: "0.35s" }}
              >
                Compare competitive bids from trusted local shops and choose the solution that works
                best for you.
              </p>

              {/* Value carousel */}
              <div
                className={`relative h-14 overflow-hidden pt-1 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: "0.5s" }}
              >
                {VALUE_STATEMENTS.map((statement, i) => (
                  <p
                    key={i}
                    className="absolute inset-x-0 flex items-start text-sm sm:text-base text-slate-600 leading-relaxed transition-all duration-500 ease-in-out"
                    style={{
                      opacity: activeValue === i ? 1 : 0,
                      transform: `translateY(${activeValue === i ? "0" : "10px"})`,
                    }}
                    aria-hidden={activeValue !== i}
                  >
                    <span
                      className="mr-2.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs mt-0.5"
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
                <div className="absolute bottom-0 left-8 flex gap-0.5">
                  {VALUE_STATEMENTS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Value ${i + 1}`}
                      className="flex h-10 w-6 items-center justify-center"
                      onClick={() => setActiveValue(i)}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: activeValue === i ? primaryColor : "rgba(0,61,130,0.18)",
                          transform: activeValue === i ? "scale(1.3)" : "scale(1)",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Buttons — refined sizing */}
            <div
              className={`flex flex-col sm:flex-row gap-3 pt-2 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "0.65s" }}
            >
              <button
                onClick={onGetStarted}
                className="bd-glass-control inline-flex items-center justify-center gap-1.5 w-full sm:w-auto text-sm sm:text-base"
                type="button"
              >
                {getButtonText()}
                <ChevronRight className="ml-1 w-4 h-4" />
              </button>
              <button
                onClick={onLearnMore}
                className="bd-glass-control--secondary inline-flex items-center justify-center gap-1.5 w-full sm:w-auto text-sm sm:text-base"
                type="button"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Learn More
              </button>
            </div>

            {/* Trust microcopy */}
            <div
              className={`flex flex-wrap items-center gap-2 pt-1 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "0.9s" }}
            >
              {["Now available in NY", "Transparent bids", "Free for customers"].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1.5 rounded-full bd-glass-badge px-2.5 py-1 text-xs sm:text-sm font-medium"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right column — product story visual */}
          <div
            className={`lg:w-[52%] relative transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "0.3s" }}
          >
            <ImageErrorBoundary>
              <div className="relative">
                {/* Soft glow behind image */}
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/20 via-transparent to-violet-200/15 rounded-[2rem] blur-xl" />
                <ImageWithFallback
                  src={heroImage}
                  alt="Professional auto body repair service - Precision dent removal and paintless dent repair"
                  className="relative rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] w-full h-auto object-cover"
                  style={{
                    aspectRatio: "16/10",
                    maxHeight: "520px",
                  }}
                />
                {/* Warm depth overlay on hero image */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-slate-900/8 via-transparent to-white/3 pointer-events-none" />
              </div>
            </ImageErrorBoundary>

            {/* Floating "NY" region badge — refined */}
            <div
              className={`absolute -top-1 right-0 sm:-top-2 sm:-right-3 lg:top-4 lg:-right-4 bd-glass-floating px-3 py-2 sm:px-3.5 sm:py-2.5 animate-float-slow transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
              style={{ transitionDelay: "1.2s" }}
            >
              <div className="text-lg sm:text-xl font-bold" style={{ color: primaryColor }}>
                NY
              </div>
              <div className="text-[10px] sm:text-xs text-slate-500 font-medium">
                Active Service Region
              </div>
            </div>

            {/* Floating notification card — product-story feel */}
            <div
              className={`absolute bottom-3 left-0 sm:bottom-6 sm:-left-4 lg:-left-6 lg:bottom-8 bd-glass-floating px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5 animate-float-slow transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
              style={{ transitionDelay: "1.6s", animationDelay: "1.5s" }}
            >
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 border border-green-100">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="font-semibold text-xs sm:text-sm text-slate-800">
                  Repair Completed!
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400">
                  Bid selected and scheduled through platform
                </div>
              </div>
            </div>

            {/* Floating rating badge — social proof */}
            <div
              className={`absolute top-1/2 -left-2 sm:-left-4 lg:-left-8 bd-glass-floating px-3 py-2 flex items-center gap-2 animate-float transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
              style={{ transitionDelay: "2s", animationDelay: "0.5s" }}
            >
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-700">4.9</span>
            </div>

            {/* Shield trust badge — top-left area */}
            <div
              className={`absolute top-8 -left-1 sm:top-12 sm:-left-3 lg:top-16 lg:-left-5 bd-glass-floating p-2 sm:p-2.5 animate-float-slow transition-all duration-700 hidden sm:flex ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
              style={{ transitionDelay: "1.8s", animationDelay: "2s" }}
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
