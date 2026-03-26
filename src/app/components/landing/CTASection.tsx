import { ChevronRight, Sparkles } from "lucide-react";
import { SignUpButton, useUser } from "@clerk/clerk-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

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
      className="py-10 md:py-16 lg:py-20 relative overflow-hidden"
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, #e6e3f6 0%, #e4ecfc 40%, #e2eafa 70%, #e0e6f8 100%)"
          : "linear-gradient(180deg, #0c1e4a 0%, #142a5c 45%, #102450 100%)",
      }}
      ref={sectionRef}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-indigo-300/20" : "via-blue-400/25"} to-transparent`}
      />
      {/* Atmospheric depth */}
      {isLightAppearance ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(99,102,241,0.10),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_30%_20%,rgba(59,130,246,0.07),transparent_55%)]" />
          <div className="absolute top-0 right-[25%] w-56 h-56 bg-indigo-300/[0.07] rounded-full blur-[100px]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(37,99,235,0.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_30%_20%,rgba(99,102,241,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_35%_35%_at_70%_80%,rgba(251,191,36,0.04),transparent_50%)]" />
        </>
      )}
      <div className="container mx-auto px-4 max-w-6xl text-center relative">
        <div
          className={`relative mx-auto max-w-4xl px-5 sm:px-8 md:px-14 py-8 sm:py-10 md:py-14 rounded-3xl border transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={
            isLightAppearance
              ? {
                  background:
                    "linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(248, 250, 255, 0.92) 100%)",
                  borderColor: "rgba(59, 130, 246, 0.18)",
                  boxShadow:
                    "0 24px 48px rgba(99, 102, 241, 0.08), 0 0 0 1px rgba(59, 130, 246, 0.06)",
                }
              : {
                  background:
                    "linear-gradient(180deg, rgba(20, 42, 92, 0.92) 0%, rgba(12, 30, 68, 0.90) 100%)",
                  borderColor: "rgba(96, 165, 250, 0.35)",
                  boxShadow:
                    "0 24px 56px rgba(3, 10, 24, 0.55), inset 0 1px 0 rgba(147, 197, 253, 0.18), 0 0 80px rgba(37, 99, 235, 0.08)",
                }
          }
        >
          <div
            className={`absolute -top-6 -left-4 md:-left-8 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br rotate-12 ${isLightAppearance ? "from-blue-400 to-blue-600 opacity-50" : "from-blue-300 to-blue-500 opacity-80"}`}
            style={{
              boxShadow: "0 8px 24px rgba(59, 130, 246, 0.25), 0 0 40px rgba(59, 130, 246, 0.10)",
            }}
          />
          <div
            className={`absolute -bottom-6 -right-4 md:-right-8 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${isLightAppearance ? "from-cyan-400 to-blue-600 opacity-40" : "from-cyan-300 to-blue-500 opacity-90"}`}
            style={{
              boxShadow: "0 8px 24px rgba(59, 130, 246, 0.30), 0 0 48px rgba(14, 165, 233, 0.15)",
              animationDelay: "1.2s",
            }}
          />

          <div
            className={`mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm md:text-base font-semibold ${isLightAppearance ? "border border-blue-200/60 bg-white/80 text-blue-700 backdrop-blur-sm" : "bd-glass-badge"}`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Your Repair Journey
            </span>
          </div>

          <h3
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5 transition-all duration-700 ${isLightAppearance ? "text-slate-900" : "text-slate-100"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "0.15s" }}
          >
            Ready to Get Started?
          </h3>
          <p
            className={`mx-auto max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed mb-8 transition-all duration-700 ${isLightAppearance ? "text-slate-600" : "text-blue-100/75"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "0.3s" }}
          >
            Compare competitive bids from local shops and get your auto body repair scheduled today.
          </p>

          <div
            className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "0.45s" }}
          >
            {isSignedIn ? (
              <button
                onClick={onNavigateToDashboard}
                className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-white font-semibold text-base sm:text-lg leading-none transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.97]"
                style={{
                  background: `linear-gradient(180deg, rgba(30, 64, 175, 0.98) 0%, rgba(37, 99, 235, 0.98) 100%)`,
                  boxShadow:
                    "0 4px 20px rgba(37, 99, 235, 0.30), 0 0 32px rgba(59, 130, 246, 0.12)",
                }}
              >
                Go to Dashboard
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            ) : (
              <SignUpButton mode="modal">
                <button
                  className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-white font-semibold text-base sm:text-lg leading-none transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.97]"
                  style={{
                    background: `linear-gradient(180deg, rgba(30, 64, 175, 0.98) 0%, rgba(37, 99, 235, 0.98) 100%)`,
                    boxShadow:
                      "0 4px 20px rgba(37, 99, 235, 0.30), 0 0 32px rgba(59, 130, 246, 0.12)",
                  }}
                >
                  Get Started Now
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              </SignUpButton>
            )}
          </div>

          <p
            className={`mt-6 text-sm sm:text-base transition-all duration-700 ${isLightAppearance ? "text-slate-500" : "text-blue-100/55"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "0.6s" }}
          >
            Free to use &bull; No obligation &bull; Get quotes in minutes
          </p>
        </div>
      </div>
    </section>
  );
}
