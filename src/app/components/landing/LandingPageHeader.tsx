import { Car, Home } from "lucide-react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import type { RedirectInfo } from "../../types";

interface LandingPageHeaderProps {
  isLoggedIn: boolean;
  primaryColor: string;
  secondaryColor: string;
  showLandingPage: boolean;
  onViewDashboard: () => void;
}

export default function LandingPageHeader({
  isLoggedIn,
  primaryColor,
  secondaryColor,
  showLandingPage,
  onViewDashboard,
}: LandingPageHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? "bg-white/90 backdrop-blur-2xl border-b border-gray-200/50 shadow-lg"
        : "bg-white/30 backdrop-blur-md border-b border-transparent"
    }`}>
      <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          <Car className="w-5 h-5" style={{ color: primaryColor }} />
          <h1 className="text-lg font-bold tracking-tight">
            <span
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Bid
            </span>
            <span style={{ color: "#70c0ee" }}>On</span>
            <span className="text-gray-900">Dent</span>
          </h1>
        </button>

        {/* Navigation Links - Hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() =>
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 rounded-lg hover:bg-gray-100/60 active:scale-95"
          >
            How It Works
          </button>
          <button
            onClick={() =>
              document.getElementById("who-we-serve")?.scrollIntoView({ behavior: "smooth" })
            }
            className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 rounded-lg hover:bg-gray-100/60 active:scale-95"
          >
            Who We Serve
          </button>
        </nav>

        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <>
              {/* Dashboard Button - Mobile */}
              {showLandingPage && (
                <button
                  onClick={onViewDashboard}
                  className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4" style={{ color: primaryColor }} />
                  <span style={{ color: primaryColor }}>Dashboard</span>
                </button>
              )}

              {/* Dashboard Button - Desktop */}
              {showLandingPage && (
                <button
                  onClick={onViewDashboard}
                  className="hidden md:inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg hover:bg-gray-100/60 transition-colors font-medium"
                >
                  <Home className="w-4 h-4" style={{ color: primaryColor }} />
                  <span style={{ color: primaryColor }}>Dashboard</span>
                </button>
              )}

              {/* Clerk's UserButton */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </>
          ) : (
            <>
              {/* Sign In Button */}
              <SignInButton mode="modal">
                <button className="hidden md:block px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition-colors">
                  Login
                </button>
              </SignInButton>

              {/* Get Started Button */}
              <SignUpButton mode="modal">
                <button
                  className="px-6 py-2.5 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  Get Started
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
