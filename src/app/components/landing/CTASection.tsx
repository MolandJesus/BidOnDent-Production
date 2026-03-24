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
      className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-[#e8f2fc] via-[#f0f6ff] to-[#f8fbff] relative overflow-hidden"
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 max-w-6xl text-center relative">
        <div
          className={`relative mx-auto max-w-4xl bd-glass-card px-6 md:px-16 py-12 md:py-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="absolute -top-6 -left-4 md:-left-8 w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 rotate-12 shadow-xl opacity-90" />
          <div
            className="absolute -bottom-6 -right-4 md:-right-8 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 shadow-xl opacity-90"
            style={{ animationDelay: "1.2s" }}
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
            className={`text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
            style={{ transitionDelay: "0.15s" }}
          >
            Ready to Get Started?
          </h3>
          <p
            className={`mx-auto max-w-2xl text-lg md:text-[2rem] leading-tight text-slate-600 mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
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
                className="px-8 md:px-16 py-4 md:py-5 rounded-2xl text-white font-bold text-xl md:text-[1.85rem] leading-none transition-all duration-300 inline-flex items-center shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-[0.97]"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, #147dd6 100%)`,
                }}
              >
                Go to Dashboard
                <ChevronRight className="ml-3 w-7 h-7" />
              </button>
            ) : (
              <SignUpButton mode="modal">
                <button
                  className="px-8 md:px-16 py-4 md:py-5 rounded-2xl text-white font-bold text-xl md:text-[1.85rem] leading-none transition-all duration-300 inline-flex items-center shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-[0.97]"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #147dd6 100%)`,
                  }}
                >
                  Get Started Now
                  <ChevronRight className="ml-3 w-7 h-7" />
                </button>
              </SignUpButton>
            )}
          </div>

          <p
            className={`mt-8 text-lg text-slate-500 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "0.6s" }}
          >
            Free to use &bull; No obligation &bull; Get quotes in minutes
          </p>
        </div>
      </div>
    </section>
  );
}
