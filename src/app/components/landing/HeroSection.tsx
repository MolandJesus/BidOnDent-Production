import { ChevronRight, CheckCircle, Play, Car } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParallaxOffset } from "../../hooks/useParallaxOffset";
import { useMediaQuery } from "../../hooks/useMediaQuery";

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
  // heroImage retained in HeroSectionProps for parent compatibility but
  // no longer rendered (Pass C 2026-05-03 — Liquid Map Intelligence scene
  // replaced the photo on the right column).
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
  const isMobile = useMediaQuery("(max-width: 767px)");
  const parallaxY = useParallaxOffset(isMobile ? 0.06 : 0.12);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setLoaded(true), 120);
    return () => clearTimeout(timer);
  }, []);

  const advanceCarousel = useCallback(() => {
    setActiveValue((prev) => (prev + 1) % VALUE_STATEMENTS.length);
  }, []);

  // Hero-map double-tap → open landing fullscreen coverage map. Mouse uses
  // native dblclick; touch synthesises double-tap via two taps within 320ms
  // (browsers fire two `click`s back-to-back without a real `dblclick` on
  // touch devices). Single tap remains a no-op so the map can host other
  // affordances later (pan/zoom on a real map, hover tooltips, etc).
  const lastHeroMapTapRef = useRef(0);
  const openFullCoverageMap = useCallback(() => {
    window.dispatchEvent(new CustomEvent("bd:open-landing-coverage-map"));
    document.getElementById("coverage")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const handleHeroMapTap = useCallback(() => {
    const now = Date.now();
    if (now - lastHeroMapTapRef.current < 320) {
      lastHeroMapTapRef.current = 0;
      openFullCoverageMap();
      return;
    }
    lastHeroMapTapRef.current = now;
  }, [openFullCoverageMap]);

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
      className="pt-20 sm:pt-32 pb-10 sm:pb-24 overflow-hidden relative"
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, #fdfcf9 0%, #f8f8f5 40%, #f4f5f8 100%)"
          : "linear-gradient(180deg, #0a1a38 0%, #0d2244 40%, #091832 100%)",
      }}
    >
      {/* Atmospheric radiance — wrapped in bloom for entry animation */}
      <div className={`bd-bloom-atmosphere ${loaded ? "is-visible" : "is-hidden"}`}>
        {/* Pass 6 — Direction C luminance accent: electric blue, top-left corner */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: "800px",
            height: "800px",
            top: "-220px",
            left: "-220px",
            background: "radial-gradient(circle, rgba(37,99,235,0.22), transparent 65%)",
          }}
        />
        {isLightAppearance ? (
          <>
            {/* Deeper-amber mesh texture (Branch A: light-mode second tier; Pass 11: deeper) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(210,165,90,0.10)_1px,transparent_1px)] [background-size:32px_32px] opacity-95" />
            {/* Color atmosphere — Pass 11: deeper warm tones for richer light-mode dimension */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_-10%,rgba(230,180,110,0.38),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_85%_80%,rgba(220,160,80,0.34),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_40%_at_50%_100%,rgba(240,195,130,0.28),transparent_50%)]" />
            {/* Large ambient blur pools — Pass 11: deeper saturation. Parallax (Pass 5). */}
            <div
              className="absolute top-10 right-[10%] w-[22rem] h-[22rem] bg-amber-300/[0.42] rounded-full blur-[120px]"
              style={{ transform: `translateY(${parallaxY}px)`, willChange: "transform" }}
            />
            <div
              className="absolute bottom-0 left-[8%] w-[18rem] h-[18rem] bg-amber-200/[0.26] rounded-full blur-[140px]"
              style={{ transform: `translateY(${parallaxY * -0.6}px)`, willChange: "transform" }}
            />
            <div
              className="absolute top-1/2 left-1/3 w-[20rem] h-[20rem] bg-amber-200/[0.32] rounded-full blur-[160px]"
              style={{ transform: `translateY(${parallaxY * 0.4}px)`, willChange: "transform" }}
            />
          </>
        ) : (
          <>
            {/* Subtle dot grid texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.06)_1px,transparent_1px)] [background-size:32px_32px] opacity-80" />
            {/* Gold lamp-from-above wash (Pass G 2026-05-03) — adopts the
                dashboard's navy-lit-by-gold-lamp identity. Wide warm radial
                from top, fading by mid-hero. Layered FIRST so the cool blue
                radials below render on top in the body of the hero; the top
                edge reads warm-lit, the body stays cool. */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_45%_at_50%_-12%,rgba(196, 144, 65,0.26),transparent_65%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_30%_at_50%_-6%,rgba(235,180,105,0.18),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_15%_-10%,rgba(59,130,246,0.26),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_85%_90%,rgba(37,99,235,0.18),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_40%_at_50%_100%,rgba(30,58,138,0.14),transparent_45%)]" />
            <div
              className="absolute top-16 right-10 w-[28rem] h-[28rem] bg-blue-500/[0.22] rounded-full blur-[140px]"
              style={{ transform: `translateY(${parallaxY}px)`, willChange: "transform" }}
            />
            <div
              className="absolute bottom-20 -left-10 w-[32rem] h-[32rem] bg-indigo-500/[0.14] rounded-full blur-[160px]"
              style={{ transform: `translateY(${parallaxY * -0.6}px)`, willChange: "transform" }}
            />
            {/* Gold lamp orb (Pass G 2026-05-03) — warm pool centered above
                the hero, completing the dashboard navy-lit-by-gold-lamp
                identity at the top of landing. Slow parallax with the blue
                orb so it tracks the same cinematic motion. */}
            <div
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-[42rem] h-[24rem] bg-amber-400/[0.10] rounded-full blur-[160px]"
              style={{
                transform: `translate(-50%, ${parallaxY * 0.3}px)`,
                willChange: "transform",
              }}
            />
          </>
        )}
      </div>

      {/* Hero polish 2026-05-03 — repair-blueprint accent (replaces prior
          filled-sedan silhouette which read as a cartoon blob). Thin
          stroke-only contour with dent hotspot + diagnostic crosshair +
          dashed bid-route signal connecting the diagnosis to the
          marketplace map card on the left. Low opacity, watermark-tier,
          behind everything. */}
      <svg
        aria-hidden="true"
        className="hidden md:block absolute top-12 right-0 w-[480px] h-[200px] pointer-events-none"
        viewBox="0 0 480 200"
        fill="none"
        stroke={isLightAppearance ? "#1e3a8a" : "#60a5fa"}
        style={{ opacity: isLightAppearance ? 0.18 : 0.28 }}
      >
        {/* Faint horizontal blueprint guide */}
        <line
          x1="0"
          y1="118"
          x2="480"
          y2="118"
          strokeWidth="0.5"
          strokeDasharray="2 6"
          opacity="0.35"
        />

        {/* Vehicle body outline — thin stroke quarter+door+roof */}
        <path
          d="M 36 130 Q 70 132 92 118 L 116 88 Q 150 62 200 60 L 300 60 Q 342 64 376 92 L 402 118 Q 432 132 460 130"
          strokeWidth="1.2"
          opacity="0.55"
        />

        {/* Greenhouse / window line */}
        <path d="M 138 90 L 200 66 L 300 66 L 350 90" strokeWidth="0.85" opacity="0.40" />

        {/* Belt line / panel separation */}
        <line x1="116" y1="98" x2="402" y2="98" strokeWidth="0.6" opacity="0.32" />

        {/* Door cut */}
        <line x1="220" y1="68" x2="220" y2="120" strokeWidth="0.55" opacity="0.32" />
        <line x1="280" y1="68" x2="280" y2="120" strokeWidth="0.55" opacity="0.32" />

        {/* Dent hotspot — door panel area, with concentric pulse rings */}
        <circle
          cx="244"
          cy="96"
          r="4"
          fill={isLightAppearance ? "#3b82f6" : "#93c5fd"}
          stroke="none"
          opacity="0.85"
        />
        <circle cx="244" cy="96" r="9" strokeWidth="0.8" opacity="0.55" />
        <circle cx="244" cy="96" r="15" strokeWidth="0.5" opacity="0.30" />

        {/* Diagnostic crosshair around dent */}
        <line x1="244" y1="76" x2="244" y2="84" strokeWidth="0.85" opacity="0.6" />
        <line x1="244" y1="108" x2="244" y2="116" strokeWidth="0.85" opacity="0.6" />
        <line x1="224" y1="96" x2="232" y2="96" strokeWidth="0.85" opacity="0.6" />
        <line x1="256" y1="96" x2="264" y2="96" strokeWidth="0.85" opacity="0.6" />

        {/* Bid-route signal — dashed curve from dent toward the marketplace */}
        <path
          d="M 244 96 Q 180 130 110 158"
          strokeWidth="0.9"
          strokeDasharray="3 4"
          opacity="0.42"
        />
        {/* Marketplace endpoint pin (echoes the map card's report-pin language) */}
        <circle
          cx="110"
          cy="158"
          r="2.6"
          fill={isLightAppearance ? "#60a5fa" : "#93c5fd"}
          stroke="none"
          opacity="0.65"
        />
        <circle cx="110" cy="158" r="6" strokeWidth="0.5" opacity="0.35" />

        {/* Subtle annotation tick on the rear quarter — extra blueprint feel */}
        <line x1="376" y1="78" x2="392" y2="68" strokeWidth="0.55" opacity="0.30" />
        <text
          x="396"
          y="66"
          fontSize="7"
          fill={isLightAppearance ? "#1e3a8a" : "#60a5fa"}
          stroke="none"
          opacity="0.45"
          fontFamily="ui-monospace, monospace"
        >
          R-Q.PANEL
        </text>
      </svg>

      {/* Pass 6 — Automotive identity: road-lane dashes at the Hero→HowItWorks transition.
          Three horizontal segments evoking lane markings; sits above the bottom fade. */}
      <div
        aria-hidden="true"
        className="hidden sm:flex absolute bottom-10 left-1/2 -translate-x-1/2 items-center gap-4 pointer-events-none"
        style={{ opacity: isLightAppearance ? 0.32 : 0.42 }}
      >
        <div
          className="h-[3px] w-12 rounded-full"
          style={{
            background: isLightAppearance
              ? "linear-gradient(to right, transparent, rgba(200,165,90,0.7), transparent)"
              : "linear-gradient(to right, transparent, rgba(96,165,250,0.7), transparent)",
          }}
        />
        <div
          className="h-[3px] w-12 rounded-full"
          style={{
            background: isLightAppearance
              ? "linear-gradient(to right, transparent, rgba(200,165,90,0.7), transparent)"
              : "linear-gradient(to right, transparent, rgba(96,165,250,0.7), transparent)",
          }}
        />
        <div
          className="h-[3px] w-12 rounded-full"
          style={{
            background: isLightAppearance
              ? "linear-gradient(to right, transparent, rgba(200,165,90,0.7), transparent)"
              : "linear-gradient(to right, transparent, rgba(96,165,250,0.7), transparent)",
          }}
        />
      </div>

      {/* Bottom edge fade for smooth transition to next section */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-32 pointer-events-none ${isLightAppearance ? "bg-gradient-to-b from-transparent via-[#eef5ff]/60 to-[#eef5ff]" : "bg-gradient-to-b from-transparent to-[#071a34]/50"}`}
      />

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-32 right-[8%] animate-orb-drift"
        style={{ animationDelay: "0s" }}
      >
        <div
          className={`w-7 h-7 rounded-full ${isLightAppearance ? "bg-amber-400/30" : "bg-blue-400/60"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 36px 14px rgba(200,165,100,0.18)"
              : "0 0 32px 12px rgba(59,130,246,0.30)",
          }}
        />
      </div>
      <div
        className="hidden md:block absolute bottom-24 left-[5%] animate-orb-float"
        style={{ animationDelay: "3s" }}
      >
        <div
          className={`w-5 h-5 rounded-full ${isLightAppearance ? "bg-amber-300/28" : "bg-indigo-400/50"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 30px 12px rgba(200,165,100,0.15)"
              : "0 0 28px 10px rgba(99,102,241,0.26)",
          }}
        />
      </div>
      <div
        className="hidden lg:flex absolute top-48 left-[3%] animate-orb-rotate items-center justify-center"
        style={{ animationDelay: "5s" }}
      >
        <div
          className={`w-11 h-11 rounded-[1rem] flex items-center justify-center ${isLightAppearance ? "bg-[rgba(255,251,245,0.5)] border border-[rgba(200,180,150,0.25)] backdrop-blur-sm" : "bg-blue-500/15 border border-blue-400/20"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 24px rgba(59,130,246,0.14), inset 0 1px 0 rgba(255,250,240,0.7)"
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
                    ? "rgba(200,180,150,0.22)"
                    : "rgba(96,165,250,0.25)",
                  background: isLightAppearance ? "rgba(255,251,245,0.55)" : "rgba(59,130,246,0.1)",
                  color: isLightAppearance ? "#334155" : "#bfdbfe",
                  boxShadow: isLightAppearance
                    ? "0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,250,240,0.75)"
                    : undefined,
                }}
              >
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse" />
                Now serving New York &middot; Free for customers
              </span>
            </div>

            {/* Main Content */}
            <div className="space-y-4 sm:space-y-5">
              {/*
                Transition is scoped to opacity + transform (entry animation
                only). Using `transition-all` here caused the inner gradient
                span (WebkitBackgroundClip: text) to interpolate its
                background-image when isLightAppearance flipped, which paints
                a smeared/blurred raster of "Auto Body Repair" that some
                browsers retain after the transition settles.
              */}
              <h2
                className={`text-[1.75rem] sm:text-4xl lg:text-[2.75rem] xl:text-5xl font-bold leading-[1.15] tracking-tight transition-[opacity,transform] duration-700 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                style={{
                  transitionDelay: "0.2s",
                  textShadow: isLightAppearance
                    ? "0 1px 2px rgba(0,0,0,0.06)"
                    : "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                <span className={isLightAppearance ? "text-slate-800" : "text-slate-100"}>
                  Get the{" "}
                </span>
                <span className={isLightAppearance ? "text-blue-500" : "text-sky-300"}>
                  Best Price
                </span>
                <span className={isLightAppearance ? "text-slate-800" : "text-slate-100"}>
                  {" "}
                  on Your{" "}
                </span>
                <br className="hidden sm:block" />
                {/* Phase 1 hero typography fix (2026-05-03 P1):
                    Dark mode keeps showing the gradient span as visibly softer
                    than its solid-fill siblings ("Get the", "Best Price",
                    "on Your") despite prior textShadow + transition-scope
                    fixes. Two compounding causes remain in dark mode only:
                    (1) WebkitBackgroundClip:text + transparent fill subpixel-
                    rasterizes differently than solid color, so glyph edges
                    read fractionally hazier even with shadow killed; (2) the
                    gradient began at #3b82f6 (blue-500) which has low contrast
                    against the #0a1a38 navy hero, so the top-left of letters
                    fade before the gradient brightens.
                    Decision per brief ("if gradient clipping keeps failing,
                    replace that line with a solid or simpler blue treatment"):
                    drop the gradient in dark mode, use a solid bright blue
                    (#bfdbfe / blue-200) — uniform brightness, crisp glyph
                    rendering identical to siblings, strong contrast against
                    navy, blue identity preserved. Light mode keeps its
                    gradient (works there per owner verification). */}
                {isLightAppearance ? (
                  <span
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor} 0%, #60a5fa 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textShadow: "none",
                    }}
                  >
                    Auto Body Repair
                  </span>
                ) : (
                  <span style={{ color: "#bfdbfe" }}>Auto Body Repair</span>
                )}
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
                {/* Carousel dots — Pass 8 polish: larger, glow on active, clearer affordance.
                    Pass 3 (mobile audit 2026-05-05): bumped tap target from h-10 w-8
                    (40×32) → h-11 w-11 (44×44) for LAW touch-target compliance. The
                    inner 8px/24px dot stays the same — only the invisible hit area grows. */}
                <div className="absolute bottom-0 left-8 flex gap-1.5">
                  {VALUE_STATEMENTS.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Value ${i + 1}`}
                      className="flex h-11 w-11 items-center justify-center"
                      onClick={() => setActiveValue(i)}
                    >
                      <span
                        className="rounded-full transition-all duration-300"
                        style={{
                          width: activeValue === i ? "24px" : "8px",
                          height: "8px",
                          backgroundColor:
                            activeValue === i
                              ? isLightAppearance
                                ? primaryColor
                                : "#60a5fa"
                              : isLightAppearance
                                ? "rgba(59,130,246,0.40)"
                                : "rgba(96,165,250,0.45)",
                          boxShadow:
                            activeValue === i
                              ? isLightAppearance
                                ? `0 0 12px ${primaryColor}66, 0 0 4px ${primaryColor}88`
                                : "0 0 14px rgba(96,165,250,0.55), 0 0 6px rgba(96,165,250,0.35)"
                              : "none",
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
              {/* L1 (2026-05-03): adopts bd-dashboard-primary-button so the
                  hero primary inherits the D10 system — rounded-2xl radius,
                  gold-lamp trim, premium hover/active/focus states. The 3-stop
                  cool-blue gradient is preserved via inline `background` per
                  the system's shell+consumer-bg pattern (see ShopDirectoryResultCard
                  for the canonical example). Hand-rolled hover/active classes
                  removed — system equivalents are tuned tighter. */}
              <button
                onClick={onGetStarted}
                className="bd-dashboard-primary-button inline-flex min-h-[52px] w-full items-center justify-center gap-1.5 px-7 py-4 text-sm font-semibold text-white sm:w-auto sm:py-3.5 sm:text-base"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, #3b82f6 50%, #2563eb 100%)`,
                }}
                type="button"
              >
                {getButtonText()}
                <ChevronRight className="ml-1 w-4 h-4" />
              </button>
              {/* V1 mobile contrast fix: dark mode background bumped from
                   rgba(59,130,246,0.10) → 0.20 and border alpha 0.25 → 0.45.
                   At mobile dark, the previous values blended into the navy
                   atmosphere, making the secondary CTA effectively invisible. */}
              <button
                onClick={onLearnMore}
                className={`bd-dashboard-primary-button inline-flex min-h-[52px] w-full items-center justify-center gap-1.5 px-7 py-4 text-sm font-semibold backdrop-blur-md sm:w-auto sm:py-3.5 sm:text-base ${isLightAppearance ? "text-slate-700" : "text-blue-100"}`}
                style={{
                  background: isLightAppearance
                    ? "rgba(255,251,245,0.55)"
                    : "rgba(59,130,246,0.20)",
                  borderColor: isLightAppearance
                    ? "rgba(200,180,150,0.30)"
                    : "rgba(147,197,253,0.45)",
                  boxShadow: isLightAppearance
                    ? undefined
                    : "inset 0 1px 0 rgba(196, 144, 65,0.18), inset 0 0 0 1px rgba(96,165,250,0.18)",
                }}
                type="button"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Learn More
              </button>
            </div>

            {/* Trust microcopy */}
            <div
              className={`flex flex-col gap-2 pt-1 transition-all duration-700 sm:flex-row sm:flex-wrap sm:items-center ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "0.9s" }}
            >
              {["Now available in NY", "Transparent bids", "Free for customers"].map((item) => (
                <span
                  key={item}
                  className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-sm sm:justify-start sm:px-2.5 sm:py-1 sm:text-sm ${isLightAppearance ? "border-[rgba(140,82,22,0.28)] bg-[linear-gradient(180deg,rgba(247,232,194,0.78),rgba(232,238,248,0.74))] text-slate-700 shadow-[inset_0_1px_0_rgba(252,240,208,0.85)]" : "border-blue-400/20 bg-blue-500/10 text-blue-100/80"}`}
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  {item}
                </span>
              ))}
            </div>

            {/* V2 — Mobile hero map intelligence strip.
                Lightweight presentational SVG scene that gives mobile users the
                map-first identity that desktop carries in the right column.
                Reuses Liquid Map Intelligence language (contour, route lines,
                pin pulse, gold flow/sheen) at compact 200px height. No second
                MapLibre instance, no fake shop claims, no operational copy.
                Tap target scrolls to the coverage section. Hidden at lg+ where
                the desktop right column takes over. */}
            <button
              type="button"
              aria-label="Double-tap to open the full coverage map. Single-tap to scroll to coverage."
              onClick={handleHeroMapTap}
              onDoubleClick={openFullCoverageMap}
              className={`group block lg:hidden mt-5 rounded-2xl relative overflow-hidden transition-all duration-700 active:scale-[0.985] w-full text-left ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{
                transitionDelay: "1.05s",
                height: "200px",
                background: isLightAppearance ? "#dbe7f5" : "#0d1d3a",
                boxShadow: isLightAppearance
                  ? "0 14px 40px rgba(15, 30, 60, 0.10), 0 40px 90px rgba(15, 30, 60, 0.08), 0 0 50px rgba(37, 99, 235, 0.06), inset 0 1px 0 rgba(255,255,255,0.55), inset 0 0 0 1px rgba(190,210,235,0.22), inset 0 -1px 0 rgba(140,82,22,0.20), 0 0 80px rgba(196,130,45,0.05)"
                  : "0 16px 48px rgba(2, 6, 23, 0.40), 0 50px 110px rgba(2, 6, 23, 0.18), 0 0 60px rgba(37, 99, 235, 0.12), inset 0 1px 0 rgba(196, 144, 65,0.20), inset 0 0 0 1px rgba(96, 165, 250, 0.14), inset 0 -1px 0 rgba(196, 144, 65,0.16), 0 0 100px rgba(196, 130, 45, 0.08)",
              }}
            >
              {/* Outer ambient bloom — bleeds the strip into the hero atmosphere */}
              <div
                aria-hidden="true"
                className="absolute -inset-6 rounded-[2rem] blur-2xl pointer-events-none -z-10"
                style={{
                  background: isLightAppearance
                    ? "radial-gradient(ellipse 70% 65% at 50% 50%, rgba(59,130,246,0.10), transparent 70%)"
                    : "radial-gradient(ellipse 75% 70% at 50% 50%, rgba(59,130,246,0.16), transparent 72%)",
                }}
              />

              {/* Bucket 5.7 (KI-074 partial): dual-source counter-glow — cool
                  blue sky catch at top-left + warm bronze lamp catch at
                  bottom-right. Premium "lit at sunset" feel; locks the hero
                  map into the same lamp-from-above + cool-floor convention
                  the dashboard atmosphere D8/D9/D10 layers express. */}
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] blur-2xl pointer-events-none -z-10"
                style={{
                  background:
                    "radial-gradient(ellipse 50% 45% at 0% 0%, rgba(96, 165, 250, 0.12), transparent 65%), radial-gradient(ellipse 50% 45% at 100% 100%, rgba(196, 130, 45, 0.10), transparent 65%)",
                }}
              />

              {/* Layer 1 — stylized road network (mobile scale) */}
              <svg
                aria-hidden="true"
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 600 200"
                preserveAspectRatio="xMidYMid slice"
              >
                <rect width="600" height="200" fill={isLightAppearance ? "#dbe7f5" : "#0d1d3a"} />
                <path
                  d="M 0,80 Q 150,90 300,75 T 600,90"
                  stroke={isLightAppearance ? "#94a3b8" : "#334155"}
                  strokeWidth="2.5"
                  fill="none"
                  opacity="0.85"
                />
                <path
                  d="M 0,140 Q 200,120 400,135 T 600,130"
                  stroke={isLightAppearance ? "#94a3b8" : "#334155"}
                  strokeWidth="2"
                  fill="none"
                  opacity="0.65"
                />
                <path
                  d="M 160,0 Q 175,100 165,200"
                  stroke={isLightAppearance ? "#a8b8cb" : "#293449"}
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.55"
                />
                <path
                  d="M 440,0 Q 460,110 435,200"
                  stroke={isLightAppearance ? "#a8b8cb" : "#293449"}
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.5"
                />
              </svg>

              {/* Layer 2 — topographic contour grid */}
              <div
                className={
                  isLightAppearance ? "bd-map-contour" : "bd-map-contour bd-map-contour--dark"
                }
              />

              {/* Layer 3 — drifting liquid gold (marketplace energy ambient) */}
              <div
                className={`bd-liquid-gold-flow ${
                  isLightAppearance ? "bd-liquid-gold-flow--light" : "bd-liquid-gold-flow--dark"
                }`}
              />

              {/* Layer 4 — route lines from pin */}
              <svg
                aria-hidden="true"
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 600 200"
                preserveAspectRatio="xMidYMid slice"
              >
                <path d="M 180,100 Q 100,70 30,30" className="bd-route-line" />
                <path
                  d="M 180,100 Q 320,110 560,75"
                  className="bd-route-line"
                  style={{ animationDelay: "0.8s" }}
                />
                <path
                  d="M 180,100 Q 250,150 350,180"
                  className="bd-route-line"
                  style={{ animationDelay: "1.4s" }}
                />
              </svg>

              {/* Layer 5 — report pin with pulse */}
              <div
                className="absolute"
                style={{ top: "50%", left: "30%", transform: "translate(-50%, -50%)" }}
              >
                <div className="relative w-3.5 h-3.5">
                  <div className="absolute -inset-2 bd-pin-pulse" />
                  <div
                    className="relative w-3.5 h-3.5 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      boxShadow:
                        "0 0 14px rgba(59,130,246,0.7), 0 0 4px rgba(96,165,250,0.95), inset 0 1px 0 rgba(255,255,255,0.45)",
                    }}
                  />
                </div>
              </div>

              {/* Layer 6 — gold activity sheen */}
              <div className="bd-liquid-gold-sheen" />

              {/* Layer 7 — top eyebrow + bottom CTA hint as a glass overlay */}
              <div
                className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md"
                style={{
                  background: isLightAppearance ? "rgba(238,247,255,0.86)" : "rgba(8,18,38,0.78)",
                  borderColor: isLightAppearance
                    ? "rgba(190,210,235,0.55)"
                    : "rgba(96,165,250,0.30)",
                  color: isLightAppearance ? "#1e3a8a" : "#bfdbfe",
                  boxShadow: isLightAppearance
                    ? "inset 0 1px 0 rgba(196, 144, 65,0.20), 0 2px 8px rgba(15,30,60,0.08)"
                    : "inset 0 1px 0 rgba(196, 144, 65,0.22), 0 2px 12px rgba(2,6,23,0.30)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                NY Coverage
              </div>
              <div
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold backdrop-blur-md transition-transform group-active:scale-95"
                style={{
                  background: isLightAppearance
                    ? "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                    : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  color: "#ffffff",
                  boxShadow:
                    "0 6px 18px rgba(37,99,235,0.36), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(140,82,22,0.20)",
                }}
              >
                Double-tap for full map
                <ChevronRight className="w-3.5 h-3.5" />
              </div>

              {/* Layer 8 — top + bottom depth gradients */}
              <div
                className={`absolute inset-0 pointer-events-none ${
                  isLightAppearance
                    ? "bg-gradient-to-t from-[#1e293b]/14 via-transparent to-transparent"
                    : "bg-gradient-to-t from-[#0a1628]/40 via-transparent to-transparent"
                }`}
              />
            </button>
          </div>

          {/* Right column — product story visual.
              V1 mobile fix: hidden below lg. The Liquid Map Intelligence scene
              was reserving ~16:10 of full mobile width as an empty-feeling slot
              (chips already correctly hidden < md per KI-062), creating ~200px
              of dead space between trust chips and HowItWorks. V2 will replace
              this slot at mobile with a compact 220px map intelligence strip. */}
          <div
            className={`hidden lg:block lg:w-[52%] relative transition-all duration-1000 ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ transitionDelay: "0.3s" }}
          >
            {/* Liquid Map Intelligence scene (Pass C 2026-05-03)
                Replaces the prior photo. Layered presentational mock per
                locked Decision #1 (no 2nd MapLibre instance).
                V2 (2026-05-03): map stage immersion — outer ambient bloom
                deepened with a second cool layer + faint gold lamp halo
                so the field bleeds into the hero atmosphere instead of
                reading as a pasted rectangle. Frame inset 1px outline
                removed; replaced with a champagne top bezel + amber
                bottom-edge lamp inset that catches the hero's gold-from-
                above wash. */}
            <div className="relative">
              {/* Wrapper aria-hidden removed (V-007 fix, 2026-05-05): this
                  wrapper contains the focusable double-tap target button.
                  aria-hidden on a focused-element ancestor blocks AT exposure
                  AND triggers a Chrome focus-management warning. Decorative
                  child layers below carry their own aria-hidden as needed.
                  See docs/AUDIT_VISUAL_DEEP_2026-05-05_SONNET.md V-007. */}
              {/* Hero polish 2026-05-03 — outer bloom expanded so the map
                  card dissolves into the hero atmosphere instead of reading
                  as a discrete rectangle pasted on top. Three layers now:
                  (1) widened cool ambient pool, (2) widened gold lamp halo,
                  (3) new tight inner bleed that bridges the card edge to
                  hero color so the rim light reads as light catching glass
                  inside the same atmosphere — not a frame around an island. */}
              <div
                className="absolute -inset-20 rounded-[3rem] blur-3xl pointer-events-none"
                style={{
                  background: isLightAppearance
                    ? "radial-gradient(ellipse 78% 68% at 50% 50%, rgba(59,130,246,0.20), transparent 72%)"
                    : "radial-gradient(ellipse 82% 72% at 50% 50%, rgba(59,130,246,0.26), transparent 74%)",
                }}
              />
              {/* Outer gold lamp halo — gold-as-light, expanded reach */}
              <div
                className="absolute -inset-24 rounded-[3.25rem] blur-3xl pointer-events-none"
                style={{
                  background: isLightAppearance
                    ? "radial-gradient(ellipse 85% 75% at 50% 30%, rgba(196, 144, 65,0.14), transparent 68%)"
                    : "radial-gradient(ellipse 85% 75% at 50% 25%, rgba(196, 144, 65,0.18), transparent 68%)",
                }}
              />
              {/* Bucket 5.7 (KI-074 partial): dual-source counter-glow on
                  the desktop hero map shell — cool blue sky catch at top-left
                  + warm bronze lamp catch at bottom-right. Mirrors the mobile
                  hero counter-glow at wider scale to match the desktop hero's
                  open atmosphere. Locks the map into the lamp-from-above +
                  cool-floor convention. */}
              <div
                aria-hidden="true"
                className="absolute -inset-16 rounded-[3rem] blur-3xl pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 55% 50% at 0% 0%, rgba(96, 165, 250, 0.12), transparent 65%), radial-gradient(ellipse 55% 50% at 100% 100%, rgba(196, 130, 45, 0.10), transparent 65%)",
                }}
              />
              {/* Inner edge bleed — sits flush around the card, bridging
                  the rim light to the surrounding atmosphere so the card
                  edge reads as a soft glass meniscus instead of a hard
                  perimeter. */}
              <div
                className="absolute -inset-3 rounded-[2.4rem] blur-2xl pointer-events-none"
                style={{
                  background: isLightAppearance
                    ? "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(96,165,250,0.10), transparent 75%)"
                    : "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(59,130,246,0.16), transparent 75%)",
                }}
              />

              {/* Map stage — embedded map-window feel.
                  Frame: outline ring removed in favor of a dual-edge
                  inset (champagne top bezel + amber lamp at bottom) so
                  the glass reads as a lit object catching the lamp wash
                  from above, not a stamped rectangle.

                  Top-edge mask softens the rim light, road network and
                  contour grid into the hero atmosphere (4%→11% taper).
                  Bottom + sides keep full definition so the map content
                  remains visible — earlier four-edge variant ghosted the
                  card too aggressively (navy-on-navy in dark mode left
                  the card almost imperceptible). Owner taste call:
                  preserve the v1 dissolve-at-top, don't over-fade. */}
              <div
                className="relative rounded-2xl w-full overflow-hidden"
                style={{
                  aspectRatio: "16/10",
                  maxHeight: "520px",
                  background: isLightAppearance ? "#dbe7f5" : "#0d1d3a",
                  boxShadow: isLightAppearance
                    ? "0 18px 60px rgba(15, 30, 60, 0.10), 0 0 80px rgba(37, 99, 235, 0.10), 0 0 140px rgba(196, 144, 65,0.08), inset 0 1px 0 rgba(255,255,255,0.62), inset 0 -1px 0 rgba(196, 144, 65,0.18), inset 0 2px 12px rgba(255,255,255,0.20)"
                    : "0 22px 70px rgba(2, 6, 23, 0.42), 0 0 90px rgba(37, 99, 235, 0.14), 0 0 160px rgba(196, 144, 65,0.10), inset 0 1px 0 rgba(196, 144, 65,0.18), inset 0 -1px 0 rgba(196, 144, 65,0.16), inset 0 2px 12px rgba(96, 165, 250, 0.10)",
                  WebkitMaskImage:
                    "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 4%, #000 11%, #000 100%)",
                  maskImage:
                    "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 4%, #000 11%, #000 100%)",
                }}
              >
                {/* Layer 1 — stylized map base. Faint road network via SVG curves. */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 800 500"
                  preserveAspectRatio="xMidYMid slice"
                  aria-hidden="true"
                >
                  <rect width="800" height="500" fill={isLightAppearance ? "#dbe7f5" : "#0d1d3a"} />
                  {/* Major arteries */}
                  <path
                    d="M 0,180 Q 200,200 400,170 T 800,200"
                    stroke={isLightAppearance ? "#94a3b8" : "#334155"}
                    strokeWidth="3.5"
                    fill="none"
                    opacity="0.85"
                  />
                  <path
                    d="M 0,330 Q 250,290 500,320 T 800,310"
                    stroke={isLightAppearance ? "#94a3b8" : "#334155"}
                    strokeWidth="3"
                    fill="none"
                    opacity="0.7"
                  />
                  {/* Vertical secondary roads */}
                  <path
                    d="M 200,0 Q 230,200 210,500"
                    stroke={isLightAppearance ? "#a8b8cb" : "#293449"}
                    strokeWidth="2"
                    fill="none"
                    opacity="0.6"
                  />
                  <path
                    d="M 580,0 Q 620,250 560,500"
                    stroke={isLightAppearance ? "#a8b8cb" : "#293449"}
                    strokeWidth="2"
                    fill="none"
                    opacity="0.55"
                  />
                  {/* Small connector accents */}
                  <path
                    d="M 380,80 Q 420,90 470,75"
                    stroke={isLightAppearance ? "#94a3b8" : "#334155"}
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.4"
                  />
                  <path
                    d="M 100,420 Q 140,410 180,425"
                    stroke={isLightAppearance ? "#94a3b8" : "#334155"}
                    strokeWidth="1.5"
                    fill="none"
                    opacity="0.4"
                  />
                </svg>

                {/* Layer 2 — topographic contour grid */}
                <div
                  className={
                    isLightAppearance ? "bd-map-contour" : "bd-map-contour bd-map-contour--dark"
                  }
                />

                {/* Layer 3 — drifting liquid gold (marketplace energy) */}
                <div
                  className={`bd-liquid-gold-flow ${
                    isLightAppearance ? "bd-liquid-gold-flow--light" : "bd-liquid-gold-flow--dark"
                  }`}
                />

                {/* Layer 4 — route lines from report pin toward bid cards */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 800 500"
                  preserveAspectRatio="xMidYMid slice"
                  style={{ pointerEvents: "none" }}
                  aria-hidden="true"
                >
                  {/* Pin sits at (220, 240) in viewBox space */}
                  <path d="M 220,240 Q 130,180 50,90" className="bd-route-line" />
                  <path
                    d="M 220,240 Q 180,330 70,420"
                    className="bd-route-line"
                    style={{ animationDelay: "1.5s" }}
                  />
                  <path
                    d="M 220,240 Q 460,260 740,170"
                    className="bd-route-line"
                    style={{ animationDelay: "0.7s" }}
                  />
                </svg>

                {/* Layer 5 — report pin (blue product color) with concentric pulse */}
                <div
                  className="absolute"
                  style={{
                    top: "48%",
                    left: "27.5%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="relative w-4 h-4">
                    {/* Pulse ring (expands behind the dot) */}
                    <div className="absolute -inset-2 bd-pin-pulse" />
                    {/* Pin core */}
                    <div
                      className="relative w-4 h-4 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                        boxShadow:
                          "0 0 16px rgba(59,130,246,0.7), 0 0 4px rgba(96,165,250,0.95), inset 0 1px 0 rgba(255,255,255,0.45)",
                      }}
                    />
                  </div>
                </div>

                {/* Layer 6 — gold activity sweep across the glass */}
                <div className="bd-liquid-gold-sheen" />

                {/* Layer 7 — top depth gradient (preserved from prior card) */}
                <div
                  className={`absolute inset-0 pointer-events-none ${
                    isLightAppearance
                      ? "bg-gradient-to-t from-[#1e293b]/12 via-transparent to-transparent"
                      : "bg-gradient-to-t from-[#0a1628]/30 via-transparent to-transparent"
                  }`}
                />

                {/* Double-tap target — covers the middle 70% of the map stage
                    so the floating chips on the corners stay independently
                    interactive in future. Single click = silent state bump,
                    second click within 320ms (or native dblclick) opens the
                    full landing coverage map dialog. */}
                <button
                  type="button"
                  aria-label="Double-tap to open the full landing coverage map"
                  onClick={handleHeroMapTap}
                  onDoubleClick={openFullCoverageMap}
                  className="absolute inset-x-[15%] inset-y-[18%] cursor-zoom-in rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60"
                  style={{
                    background: "transparent",
                  }}
                />

                {/* Hint pill — top-right, light/dark aware. Reads as a quiet
                    affordance, not a competing focal point. */}
                <div
                  className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md pointer-events-none"
                  style={{
                    background: isLightAppearance ? "rgba(252,238,204,0.78)" : "rgba(8,18,38,0.74)",
                    borderColor: isLightAppearance
                      ? "rgba(140,82,22,0.32)"
                      : "rgba(196,144,65,0.36)",
                    color: isLightAppearance ? "#7c4a16" : "#fde6c0",
                    boxShadow: isLightAppearance
                      ? "inset 0 1px 0 rgba(252,240,212,0.92), 0 2px 10px rgba(15,30,60,0.10)"
                      : "inset 0 1px 0 rgba(196, 144, 65, 0.22), inset 0 -1px 0 rgba(140, 82, 22, 0.22), 0 0 0 1px rgba(96, 165, 250, 0.18), 0 16px 32px rgba(2, 6, 23, 0.30), 0 4px 12px rgba(2, 6, 23, 0.22), 0 0 60px rgba(196, 130, 45, 0.12)",
                  }}
                >
                  Double-tap for full map
                </div>
              </div>
            </div>

            {/* Floating "Sample quote" chip — Pass G 2026-05-03:
                  - Hidden < md: fixes mobile overflow regression where the
                    chip covered the Learn More CTA + trust row.
                  - Glow halos restrained: pin pulse + routes are the visual
                    anchor; chip should read as a quiet artifact, not a
                    competing focal point. */}
            <div
              className={`absolute top-2 left-1 sm:top-4 sm:left-0 lg:top-8 lg:-left-6 rounded-xl sm:rounded-2xl border backdrop-blur-xl px-3 py-2 sm:px-3.5 sm:py-2.5 hidden md:flex items-center gap-2 sm:gap-2.5 bd-bid-card-float transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
              style={{
                transitionDelay: "2s",
                animationDelay: "2.5s",
                borderColor: isLightAppearance ? "rgba(190,205,230,0.28)" : "rgba(96,165,250,0.18)",
                background: isLightAppearance
                  ? // Cool blue-cream glass replaces near-white surface (LAW).
                    "linear-gradient(180deg, rgba(238, 247, 255, 0.92) 0%, rgba(219, 234, 254, 0.84) 100%)"
                  : "linear-gradient(180deg, rgba(18, 36, 60, 0.92) 0%, rgba(12, 25, 41, 0.88) 100%)",
                boxShadow: isLightAppearance
                  ? "0 12px 36px rgba(15, 30, 60, 0.10), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(252, 240, 208, 0.92), 0 0 24px rgba(59, 130, 246, 0.10)"
                  : "0 10px 32px rgba(2, 6, 23, 0.34), inset 0 1px 0 rgba(96, 165, 250, 0.10), 0 0 28px rgba(59, 130, 246, 0.14)",
              }}
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                  isLightAppearance
                    ? "bg-blue-50 border-blue-200/60"
                    : "bg-blue-500/20 border-blue-400/30"
                }`}
              >
                <span className="text-blue-400 font-bold text-xs">$</span>
              </div>
              <div>
                <div
                  className={`font-semibold text-xs sm:text-sm ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
                >
                  Sample quote
                </div>
                <div
                  className={`text-[10px] sm:text-xs ${isLightAppearance ? "text-slate-500" : "text-blue-200/50"}`}
                >
                  $1,240 estimate
                </div>
              </div>
            </div>

            {/* KI-063 final fix (2026-05-03): NY region badge removed to land
                on plan Decision #2 spec (2 floating cards, not 3). Same NY
                content remains communicated 3 other places: hero eyebrow
                "Now serving New York", trust chip "Now available in NY",
                Coverage section region chips — no factual loss. */}

            {/* Floating "Estimated ETA" chip — Pass G 2026-05-03:
                  Same restraint pass as the quote chip. Hidden < md to fix
                  mobile overflow; glow halos toned down so the chip reads
                  as a quiet result artifact, not a competing focal point. */}
            <div
              className={`absolute bottom-2 left-1 sm:bottom-6 sm:-left-4 lg:-left-6 lg:bottom-8 rounded-xl sm:rounded-2xl border backdrop-blur-xl px-2.5 py-2 sm:px-4 sm:py-3 hidden md:flex items-center gap-2 sm:gap-2.5 bd-bid-card-float transition-all duration-700 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
              style={{
                transitionDelay: "1.6s",
                animationDelay: "1.5s",
                borderColor: isLightAppearance ? "rgba(190,205,230,0.26)" : "rgba(96,165,250,0.18)",
                background: isLightAppearance
                  ? // Cool blue-cream glass replaces near-white surface (LAW).
                    "linear-gradient(180deg, rgba(238, 247, 255, 0.92) 0%, rgba(219, 234, 254, 0.84) 100%)"
                  : "linear-gradient(180deg, rgba(18, 36, 60, 0.92) 0%, rgba(12, 25, 41, 0.88) 100%)",
                boxShadow: isLightAppearance
                  ? "0 14px 40px rgba(15, 30, 60, 0.10), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(252, 240, 208, 0.92), 0 0 24px rgba(16, 185, 129, 0.10)"
                  : "0 12px 36px rgba(2, 6, 23, 0.36), inset 0 1px 0 rgba(96, 165, 250, 0.10), 0 0 28px rgba(16, 185, 129, 0.14)",
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
                  Estimated ETA
                </div>
                <div
                  className={`text-[10px] sm:text-xs ${isLightAppearance ? "text-slate-500" : "text-blue-200/50"}`}
                >
                  ~4 days for sample repair
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
