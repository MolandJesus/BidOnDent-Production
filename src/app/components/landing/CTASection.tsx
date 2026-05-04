import { ChevronRight, Sparkles } from "lucide-react";
import { SignUpButton, useUser } from "@clerk/clerk-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import WaitlistCapture from "./WaitlistCapture";

interface CTASectionProps {
  primaryColor: string;
  isLightAppearance?: boolean;
  onNavigateToDashboard?: () => void;
}

export default function CTASection({
  primaryColor,
  isLightAppearance = false,
  onNavigateToDashboard,
}: CTASectionProps) {
  const { isSignedIn } = useUser();
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.15);

  return (
    <section
      className="py-8 sm:py-12 md:py-16 lg:py-20 relative overflow-hidden"
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, #e8f1fc 0%, #ddeaf9 40%, #d5e5f8 70%, #cde0f7 100%)"
          : "linear-gradient(180deg, #0c1e4a 0%, #142a5c 45%, #102450 100%)",
      }}
      ref={sectionRef}
    >
      {/* Pass H1.7 — section-level directional top-cast champagne lamp
          per hero atmospheric language. */}
      <div className="bd-landing-section-toplamp" aria-hidden="true" />
      {/* Pass H9 — companion cool-blue bottom depth wash. */}
      <div className="bd-landing-section-bottomwash" aria-hidden="true" />
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-slate-300/20" : "via-blue-400/25"} to-transparent`}
      />
      {/* Atmospheric depth — wrapped in bloom for scroll-entry animation */}
      <div className={`bd-bloom-atmosphere ${isVisible ? "is-visible" : "is-hidden"}`}>
        {isLightAppearance ? (
          <>
            {/* Subtle radial dot pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(200,170,110,0.05)_1px,transparent_1px)] [background-size:24px_24px] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(210,180,130,0.18),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_20%,rgba(200,165,100,0.14),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_65%_70%,rgba(220,185,115,0.13),transparent_50%)]" />
            <div className="absolute top-0 right-[25%] w-64 h-64 bg-[rgba(196,144,65,0.14)] rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-[20%] w-48 h-48 bg-amber-100/[0.12] rounded-full blur-[120px]" />
            <div className="absolute -top-10 left-[10%] w-[44rem] h-[44rem] bg-sky-400/[0.16] rounded-full blur-[220px]" />
            <div className="absolute bottom-0 right-[8%] w-[30rem] h-[30rem] bg-blue-400/[0.14] rounded-full blur-[210px]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(37,99,235,0.22),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_30%_20%,rgba(99,102,241,0.16),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_35%_35%_at_70%_80%,rgba(37,99,235,0.14),transparent_50%)]" />
          </>
        )}
      </div>
      <div className="container mx-auto px-4 max-w-6xl text-center relative">
        {/* Lamp bloom — large radial behind the CTA card so backdrop-blur has
            saturation to blur through. Pass 4. */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[140%] pointer-events-none"
          style={{
            background: isLightAppearance
              ? "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.18), transparent 60%)"
              : "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.28), transparent 60%)",
            filter: "blur(80px)",
            zIndex: 0,
          }}
        />
        <div
          className={`relative mx-auto max-w-4xl px-5 sm:px-8 md:px-14 py-8 sm:py-10 md:py-14 rounded-3xl border overflow-hidden sm:overflow-visible transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={
            isLightAppearance
              ? {
                  background:
                    "linear-gradient(180deg, rgba(20, 42, 92, 0.74) 0%, rgba(12, 30, 68, 0.70) 100%)",
                  borderColor: "rgba(96, 165, 250, 0.36)",
                  backdropFilter: "blur(28px) saturate(1.6)",
                  WebkitBackdropFilter: "blur(28px) saturate(1.6)",
                  /* D6: navy CTA card now picks up gold lamp identity — warm
                     inset bottom + warm outer halo, matching dashboard family. */
                  boxShadow:
                    "0 44px 88px rgba(2, 6, 20, 0.62), 0 16px 44px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(147, 197, 253, 0.32), inset 0 -1px 0 rgba(196, 144, 65, 0.20), 0 0 0 1px rgba(196, 144, 65, 0.14), 0 0 130px rgba(37, 99, 235, 0.20), 0 0 60px rgba(96, 165, 250, 0.20), 0 0 80px rgba(196, 130, 45, 0.16)",
                }
              : {
                  background:
                    "linear-gradient(180deg, rgba(20, 42, 92, 0.72) 0%, rgba(12, 30, 68, 0.68) 100%)",
                  borderColor: "rgba(96, 165, 250, 0.42)",
                  backdropFilter: "blur(28px) saturate(1.8)",
                  WebkitBackdropFilter: "blur(28px) saturate(1.8)",
                  /* D6: navy CTA card now picks up gold lamp identity — warm
                     inset bottom + warm outer halo, matching dashboard family. */
                  boxShadow:
                    "0 28px 64px rgba(3, 10, 24, 0.58), inset 0 1px 0 rgba(147, 197, 253, 0.30), inset 0 -1px 0 rgba(196, 144, 65, 0.22), 0 0 0 1px rgba(196, 144, 65, 0.14), 0 0 100px rgba(37, 99, 235, 0.18), 0 0 56px rgba(96, 165, 250, 0.22), 0 0 80px rgba(196, 130, 45, 0.18)",
                }
          }
        >
          {" "}
          {/* Ambient ring glow behind card */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              boxShadow: isLightAppearance
                ? "0 0 120px rgba(37, 99, 235, 0.22), 0 0 240px rgba(37, 99, 235, 0.11)"
                : "0 0 100px rgba(37, 99, 235, 0.18), 0 0 200px rgba(37, 99, 235, 0.09)",
            }}
          />{" "}
          <div
            className={`absolute -top-6 -left-4 md:-left-8 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br rotate-12 ${isLightAppearance ? "from-blue-300 to-blue-500 opacity-85" : "from-blue-300 to-blue-500 opacity-80"}`}
            style={{
              boxShadow: "0 12px 36px rgba(59, 130, 246, 0.42), 0 0 64px rgba(59, 130, 246, 0.22)",
            }}
          />
          <div
            className={`absolute -bottom-6 -right-4 md:-right-8 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${isLightAppearance ? "from-blue-300 to-indigo-500 opacity-80" : "from-blue-300 to-indigo-500 opacity-90"}`}
            style={{
              boxShadow: "0 12px 40px rgba(99, 102, 241, 0.50), 0 0 80px rgba(99, 102, 241, 0.26)",
              animationDelay: "1.2s",
            }}
          />
          <div
            className={`mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm md:text-base font-semibold bd-glass-badge">
              <Sparkles className="w-4 h-4 mr-2" />
              Start Your Repair Journey
            </span>
          </div>
          {/* Pass 15 — Direction C flanking accent: white-cream "lamp" hue
              for CTA, completing the editorial typography system across all
              eligible sections. White-cream is the locked Direction C palette
              color for CTA (the lamp-bloom shipped in Pass 4). The card itself
              remains decoratively dense (lamp + corner squares + sphere) — the
              flanking strokes operate at the heading layer, not the card
              decoration layer, so they don't compete. */}
          <div
            className={`flex items-center justify-center gap-3 sm:gap-5 mb-5 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "0.15s" }}
          >
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-20 lg:w-28 rounded-full flex-shrink-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(248,250,252,0.20) 25%, rgba(248,250,252,0.92) 60%, rgba(248,250,252,0.55) 85%, transparent 100%)",
              }}
            />
            <h3
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100"
              style={{
                textShadow: "0 2px 12px rgba(0,0,0,0.25)",
              }}
            >
              Ready to Get Started?
            </h3>
            <span
              aria-hidden="true"
              className="hidden sm:block h-[2px] w-20 lg:w-28 rounded-full flex-shrink-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(248,250,252,0.55) 15%, rgba(248,250,252,0.92) 40%, rgba(248,250,252,0.20) 75%, transparent 100%)",
              }}
            />
          </div>
          <p
            className={`mx-auto max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed mb-8 transition-all duration-700 text-blue-100/75 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "0.3s" }}
          >
            No fees. No phone tag. Just transparent bids from trusted shops — compared and
            scheduled, all in one place.
          </p>
          <div
            className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "0.45s" }}
          >
            {isSignedIn ? (
              <span className="bd-landing-cta-glow">
                <button
                  onClick={onNavigateToDashboard}
                  className="bd-dashboard-primary-button px-6 sm:px-8 py-3 sm:py-3.5 text-white font-semibold text-base sm:text-lg leading-none inline-flex items-center min-h-[48px]"
                  style={{
                    background: `linear-gradient(180deg, rgba(37, 99, 235, 0.98) 0%, rgba(30, 64, 175, 0.98) 100%)`,
                  }}
                >
                  Go to Dashboard
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              </span>
            ) : (
              <SignUpButton mode="modal">
                <span className="bd-landing-cta-glow">
                  <button
                    className="bd-dashboard-primary-button px-6 sm:px-8 py-3 sm:py-3.5 text-white font-semibold text-base sm:text-lg leading-none inline-flex items-center min-h-[48px]"
                    style={{
                      background: `linear-gradient(180deg, rgba(37, 99, 235, 0.98) 0%, rgba(30, 64, 175, 0.98) 100%)`,
                    }}
                  >
                    Get Started Now
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </button>
                </span>
              </SignUpButton>
            )}
          </div>
          <p
            className={`mt-6 text-sm sm:text-base transition-all duration-700 text-blue-100/55 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "0.6s" }}
          >
            Free to use &bull; No obligation &bull; Get quotes in under 48 hrs
          </p>
          {!isSignedIn && (
            <div
              className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ transitionDelay: "0.75s" }}
            >
              <p className="mt-6 text-xs text-blue-200/40">
                or stay in the loop — enter your email for updates
              </p>
              <WaitlistCapture />
            </div>
          )}
        </div>
      </div>
      {/* Bottom transition — blends into Footer cool gray */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-20 pointer-events-none ${isLightAppearance ? "bg-gradient-to-b from-transparent to-[#eef1f7]" : "bg-gradient-to-b from-transparent to-[#040e1e]"}`}
      />
    </section>
  );
}
