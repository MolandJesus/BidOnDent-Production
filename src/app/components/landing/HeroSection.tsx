import { ChevronRight, CheckCircle, Play, Car } from "lucide-react";
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
  isLightAppearance?: boolean;
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
  isLightAppearance = false,
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
    <section
      className="pt-20 sm:pt-32 pb-16 sm:pb-24 overflow-hidden relative"
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, #f5f7fb 0%, #eef2f9 40%, #e8edf5 100%)"
          : "linear-gradient(180deg, #0a1a38 0%, #0d2244 40%, #091832 100%)",
      }}
    >
      {/* Atmospheric radiance */}
      {isLightAppearance ? (
        <>
          {/* Subtle mesh texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.03)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
          {/* Color atmosphere */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,rgba(99,102,241,0.14),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_85%_80%,rgba(59,130,246,0.11),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_100%,rgba(255,191,105,0.08),transparent_50%)]" />
          {/* Large ambient blur pools */}
          <div className="absolute top-10 right-[10%] w-[22rem] h-[22rem] bg-blue-300/[0.16] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-[8%] w-[18rem] h-[18rem] bg-indigo-300/[0.13] rounded-full blur-[140px]" />
          <div className="absolute top-1/2 left-1/3 w-[20rem] h-[20rem] bg-sky-200/[0.08] rounded-full blur-[160px]" />
        </>
      ) : (
        <>
          {/* Subtle dot grid texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.035)_1px,transparent_1px)] [background-size:32px_32px] opacity-35" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_15%_-10%,rgba(59,130,246,0.18),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_85%_90%,rgba(37,99,235,0.10),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_40%_at_50%_100%,rgba(30,58,138,0.06),transparent_45%)]" />
          <div className="absolute top-16 right-10 w-[28rem] h-[28rem] bg-blue-500/[0.12] rounded-full blur-[140px]" />
          <div className="absolute bottom-20 -left-10 w-[32rem] h-[32rem] bg-indigo-500/[0.06] rounded-full blur-[160px]" />
        </>
      )}

      {/* Bottom edge fade for smooth transition to next section */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-24 pointer-events-none ${isLightAppearance ? "bg-gradient-to-b from-transparent via-[#e8edf5]/40 to-[#e8edf5]/80" : "bg-gradient-to-b from-transparent to-[#071a34]/50"}`}
      />

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-32 right-[8%] animate-orb-drift"
        style={{ animationDelay: "0s" }}
      >
        <div
          className={`w-7 h-7 rounded-full ${isLightAppearance ? "bg-blue-400/40" : "bg-blue-400/60"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 36px 14px rgba(59,130,246,0.22)"
              : "0 0 32px 12px rgba(59,130,246,0.30)",
          }}
        />
      </div>
      <div
        className="hidden md:block absolute bottom-24 left-[5%] animate-orb-float"
        style={{ animationDelay: "3s" }}
      >
        <div
          className={`w-5 h-5 rounded-full ${isLightAppearance ? "bg-indigo-400/35" : "bg-indigo-400/50"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 30px 12px rgba(99,102,241,0.18)"
              : "0 0 28px 10px rgba(99,102,241,0.26)",
          }}
        />
      </div>
      <div
        className="hidden lg:flex absolute top-48 left-[3%] animate-orb-rotate items-center justify-center"
        style={{ animationDelay: "5s" }}
      >
        <div
          className={`w-11 h-11 rounded-[1rem] flex items-center justify-center ${isLightAppearance ? "bg-white/50 border border-blue-300/30 backdrop-blur-sm" : "bg-blue-500/15 border border-blue-400/20"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 24px rgba(59,130,246,0.14), inset 0 1px 0 rgba(255,255,255,0.6)"
              : "0 0 20px rgba(59,130,246,0.15)",
          }}
        >
          <Car
            className={`w-4 h-4 ${isLightAppearance ? "text-blue-500/60" : "text-blue-400/50"}`}
          />
        </div>
      </div>

      <div className="container mx-auto px-5 sm:px-6 max-w-7xl relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          {/* Left column — text content */}
          <div className="lg:w-[48%] space-y-5 sm:space-y-7">
            {/* Trusted badge */}
            <div
              className={`transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
            >
              <span
                className="inline-flex items-center px-3.5 py-1.5 rounded-full border backdrop-blur-sm text-xs sm:text-sm font-medium shadow-sm"
                style={{
                  borderColor: isLightAppearance
                    ? "rgba(59,130,246,0.20)"
                    : "rgba(96,165,250,0.25)",
                  background: isLightAppearance ? "rgba(255,255,255,0.50)" : "rgba(59,130,246,0.1)",
                  color: isLightAppearance ? "#334155" : "#bfdbfe",
                  boxShadow: isLightAppearance
                    ? "0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.7)"
                    : undefined,
                }}
              >
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse" />
                Trusted workflow for customers, shops, and insurers
              </span>
            </div>

            {/* Main Content */}
            <div className="space-y-4 sm:space-y-5">
              <h2
                className={`text-[1.75rem] sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold leading-[1.15] tracking-tight transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: "0.2s" }}
              >
                <span className={isLightAppearance ? "text-slate-800" : "text-slate-100"}>
                  Get the{" "}
                </span>
                <span className="text-blue-500">Best Price</span>
                <span className={isLightAppearance ? "text-slate-800" : "text-slate-100"}>
                  {" "}
                  on Your{" "}
                </span>
                <br className="hidden sm:block" />
                <span
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #60a5fa 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Auto Body Repair
                </span>
              </h2>
              <p
                className={`text-base sm:text-lg leading-relaxed max-w-lg transition-all duration-700 ${isLightAppearance ? "text-slate-600" : "text-blue-100/70"} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: "0.35s" }}
              >
                Compare competitive bids from trusted local shops and choose the solution that works
                best for you.
              </p>

              {/* Value carousel */}
              <div
                className={`relative h-[4.5rem] sm:h-16 overflow-hidden pt-1 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{ transitionDelay: "0.5s" }}
              >
                {VALUE_STATEMENTS.map((statement, i) => (
                  <p
                    key={i}
                    className={`absolute inset-x-0 flex items-start text-sm sm:text-base leading-relaxed transition-all duration-500 ease-in-out ${isLightAppearance ? "text-slate-500" : "text-blue-100/65"}`}
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
                          backgroundColor:
                            activeValue === i
                              ? isLightAppearance
                                ? primaryColor
                                : "#60a5fa"
                              : isLightAppearance
                                ? "rgba(59,130,246,0.2)"
                                : "rgba(96,165,250,0.25)",
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
              className={`flex flex-col sm:flex-row gap-3 pt-2 transition-all duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: "0.65s" }}
            >
              <button
                onClick={onGetStarted}
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-[1.75rem] border border-white/10 px-7 py-4 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg active:scale-[0.97] sm:w-auto sm:rounded-2xl sm:py-3.5 sm:text-base"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, #3b82f6 100%)`,
                  boxShadow: "0 4px 24px rgba(37, 99, 235, 0.35), 0 0 40px rgba(59, 130, 246, 0.1)",
                }}
                type="button"
              >
                {getButtonText()}
                <ChevronRight className="ml-1 w-4 h-4" />
              </button>
              <button
                onClick={onLearnMore}
                className={`inline-flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-[1.75rem] border px-7 py-4 text-sm font-medium backdrop-blur-md transition-all active:scale-[0.97] sm:w-auto sm:rounded-2xl sm:py-3.5 sm:text-base ${isLightAppearance ? "border-slate-300/40 bg-white/45 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-white/65 hover:border-slate-300/60" : "border-blue-400/25 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20 hover:border-blue-400/40"}`}
                type="button"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Learn More
              </button>
            </div>

            {/* Trust microcopy */}
            <div
              className={`grid grid-cols-2 gap-2 pt-1 transition-all duration-700 sm:flex sm:flex-wrap sm:items-center ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "0.9s" }}
            >
              {["Now available in NY", "Transparent bids", "Free for customers"].map(
                (item, index) => (
                  <span
                    key={item}
                    className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-sm sm:justify-start sm:px-2.5 sm:py-1 sm:text-sm ${index === 2 ? "col-span-2 sm:col-span-1" : ""} ${isLightAppearance ? "border-blue-200/30 bg-white/40 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]" : "border-blue-400/20 bg-blue-500/10 text-blue-100/80"}`}
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Right column — product story visual */}
          <div
            className={`lg:w-[52%] relative transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "0.3s" }}
          >
            <ImageErrorBoundary>
              <div className="relative">
                {/* Blue glow behind image */}
                <div className="absolute -inset-6 bg-gradient-to-br from-blue-500/15 via-transparent to-blue-400/10 rounded-[2rem] blur-2xl" />
                <ImageWithFallback
                  src={heroImage}
                  alt="Professional auto body repair service - Precision dent removal and paintless dent repair"
                  className="relative rounded-2xl w-full h-auto object-cover border border-blue-300/15"
                  style={{
                    boxShadow: isLightAppearance
                      ? "0 24px 80px rgba(0, 0, 0, 0.12), 0 0 50px rgba(37, 99, 235, 0.06)"
                      : "0 24px 80px rgba(2, 6, 23, 0.5), 0 0 60px rgba(37, 99, 235, 0.12)",
                    aspectRatio: "16/10",
                    maxHeight: "520px",
                  }}
                />
                {/* Depth overlay on hero image */}
                <div
                  className={`absolute inset-0 rounded-2xl pointer-events-none ${isLightAppearance ? "bg-gradient-to-t from-[#1e293b]/20 via-transparent to-transparent" : "bg-gradient-to-t from-[#0a1628]/40 via-transparent to-transparent"}`}
                />
              </div>
            </ImageErrorBoundary>

            {/* Floating "NY" region badge — dark glass */}
            <div
              className={`absolute -top-1 right-2 sm:-top-2 sm:right-0 lg:top-4 lg:-right-4 rounded-2xl border backdrop-blur-xl px-3 py-2 sm:px-3.5 sm:py-2.5 animate-float-slow transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
              style={{
                transitionDelay: "1.2s",
                borderColor: isLightAppearance ? "rgba(148,163,184,0.20)" : "rgba(96,165,250,0.25)",
                background: isLightAppearance
                  ? "linear-gradient(180deg, rgba(255, 255, 255, 0.60) 0%, rgba(248, 250, 255, 0.55) 100%)"
                  : "linear-gradient(180deg, rgba(18, 36, 60, 0.92) 0%, rgba(12, 25, 41, 0.88) 100%)",
                boxShadow: isLightAppearance
                  ? "0 12px 40px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255,255,255,0.7), 0 0 1px rgba(148, 163, 184, 0.2)"
                  : "0 12px 40px rgba(2, 6, 23, 0.4), 0 0 1px rgba(96, 165, 250, 0.3)",
              }}
            >
              <div
                className={`text-lg sm:text-xl font-bold ${isLightAppearance ? "text-blue-600" : "text-blue-400"}`}
              >
                NY
              </div>
              <div
                className={`text-[10px] sm:text-xs font-medium ${isLightAppearance ? "text-slate-500" : "text-blue-200/60"}`}
              >
                Active Service Region
              </div>
            </div>

            {/* Floating notification card — dark glass */}
            <div
              className={`absolute bottom-2 left-1 sm:bottom-6 sm:-left-4 lg:-left-6 lg:bottom-8 rounded-xl sm:rounded-2xl border backdrop-blur-xl px-2.5 py-2 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-2.5 animate-float-slow transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
              style={{
                transitionDelay: "1.6s",
                animationDelay: "1.5s",
                borderColor: isLightAppearance ? "rgba(148,163,184,0.15)" : "rgba(96,165,250,0.2)",
                background: isLightAppearance
                  ? "linear-gradient(180deg, rgba(255, 255, 255, 0.60) 0%, rgba(248, 250, 255, 0.55) 100%)"
                  : "linear-gradient(180deg, rgba(18, 36, 60, 0.92) 0%, rgba(12, 25, 41, 0.88) 100%)",
                boxShadow: isLightAppearance
                  ? "0 12px 40px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255,255,255,0.7), 0 0 1px rgba(148, 163, 184, 0.15)"
                  : "0 12px 40px rgba(2, 6, 23, 0.4), 0 0 1px rgba(96, 165, 250, 0.3)",
              }}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border ${isLightAppearance ? "bg-emerald-50 border-emerald-200/60" : "bg-emerald-500/15 border-emerald-400/25"}`}
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div
                  className={`font-semibold text-xs sm:text-sm ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
                >
                  Repair Completed!
                </div>
                <div
                  className={`text-[10px] sm:text-xs ${isLightAppearance ? "text-slate-500" : "text-blue-200/50"}`}
                >
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
