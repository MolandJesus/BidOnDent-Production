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
      className="py-20 bg-gradient-to-br from-blue-50 to-white relative overflow-hidden"
      ref={sectionRef}
    >
      {/* Decorative floating blobs */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-orange-300 rounded-full opacity-40 blur-sm animate-blob" />
      <div
        className="absolute bottom-16 right-16 w-28 h-28 bg-blue-300 rounded-full opacity-30 blur-sm animate-blob"
        style={{ animationDelay: "3s" }}
      />
      <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-green-300 rounded-full opacity-25 blur-sm animate-float-slow" />

      <div className="container mx-auto px-4 max-w-4xl text-center relative">
        {/* Badge */}
        <div
          className={`mb-6 transition-all duration-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Start Your Repair Journey
          </span>
        </div>

        <h3
          className={`text-4xl md:text-5xl font-bold mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.15s" }}
        >
          Ready to Get Started?
        </h3>
        <p
          className={`text-xl text-gray-600 mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.3s" }}
        >
          Join thousands of satisfied customers and experience hassle-free auto repair today.
        </p>

        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
          style={{ transitionDelay: "0.45s" }}
        >
          {isSignedIn ? (
            <button
              onClick={onNavigateToDashboard}
              className="px-12 py-5 rounded-xl text-white font-bold text-xl transition-all duration-300 inline-flex items-center shadow-2xl hover:shadow-3xl hover:-translate-y-1 active:scale-[0.97] hover:brightness-110"
              style={{ backgroundColor: primaryColor }}
            >
              Go to Dashboard
              <ChevronRight className="ml-2 w-6 h-6" />
            </button>
          ) : (
            <SignUpButton mode="modal">
              <button
                className="px-12 py-5 rounded-xl text-white font-bold text-xl transition-all duration-300 inline-flex items-center shadow-2xl hover:shadow-3xl hover:-translate-y-1 active:scale-[0.97] hover:brightness-110"
                style={{ backgroundColor: primaryColor }}
              >
                Get Started Now
                <ChevronRight className="ml-2 w-6 h-6" />
              </button>
            </SignUpButton>
          )}
        </div>

        {/* Tagline */}
        <p
          className={`mt-6 text-sm text-gray-500 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "0.6s" }}
        >
          Free to use &bull; No obligation &bull; Get quotes in minutes
        </p>
      </div>
    </section>
  );
}
