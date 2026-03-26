import { ChevronRight, Sparkles } from "lucide-react";
import { SignUpButton, useUser } from "@clerk/clerk-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";

interface CTASectionProps {
  primaryColor: string;
  onNavigateToDashboard?: () => void;
}

export default function CTASection({ primaryColor, onNavigateToDashboard }: CTASectionProps) {
  const { isSignedIn } = useUser();
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.15);

  return (
    <section
      className="py-10 md:py-16 lg:py-20 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #080f20 0%, #060d1a 100%)" }}
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 max-w-6xl text-center relative">
        <div
          className={`relative mx-auto max-w-4xl px-5 sm:px-8 md:px-14 py-8 sm:py-10 md:py-14 rounded-3xl border transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{
            background:
              "linear-gradient(180deg, rgba(11, 23, 47, 0.82) 0%, rgba(8, 18, 38, 0.78) 100%)",
            borderColor: "rgba(96, 165, 250, 0.22)",
            boxShadow: "0 24px 48px rgba(3, 10, 24, 0.44), inset 0 1px 0 rgba(147, 197, 253, 0.10)",
          }}
        >
          <div
            className="absolute -top-6 -left-4 md:-left-8 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-blue-300 to-blue-500 rotate-12 opacity-80"
            style={{
              boxShadow: "0 8px 24px rgba(59, 130, 246, 0.25), 0 0 40px rgba(59, 130, 246, 0.10)",
            }}
          />
          <div
            className="absolute -bottom-6 -right-4 md:-right-8 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 opacity-90"
            style={{
              boxShadow: "0 8px 24px rgba(59, 130, 246, 0.30), 0 0 48px rgba(14, 165, 233, 0.15)",
              animationDelay: "1.2s",
            }}
          />

          <div
            className={`mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full bd-glass-badge text-sm md:text-base font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              Start Your Repair Journey
            </span>
          </div>

          <h3
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-slate-100 mb-5 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "0.15s" }}
          >
            Ready to Get Started?
          </h3>
          <p
            className={`mx-auto max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed text-blue-100/75 mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
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
            className={`mt-6 text-sm sm:text-base text-blue-100/55 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "0.6s" }}
          >
            Free to use &bull; No obligation &bull; Get quotes in minutes
          </p>
        </div>
      </div>
    </section>
  );
}
