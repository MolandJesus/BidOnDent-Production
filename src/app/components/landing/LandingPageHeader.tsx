import { Car, Home } from "lucide-react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { useState, useEffect } from "react";

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[rgba(240,248,255,0.94)] backdrop-blur-2xl border-b border-blue-200/40 shadow-[0_4px_24px_rgba(0,61,130,0.08)]"
          : "bg-white/20 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 py-2 px-2 rounded-xl cursor-pointer hover:bg-white/20 active:bg-white/30 transition-colors duration-200"
        >
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              boxShadow: "0 2px 12px rgba(37, 99, 235, 0.25), 0 0 20px rgba(59, 130, 246, 0.08)",
            }}
          >
            <Car className="w-5 h-5" />
          </span>
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
            className="bd-glass-control--utility font-medium"
            type="button"
          >
            How It Works
          </button>
          <button
            onClick={() =>
              document.getElementById("who-we-serve")?.scrollIntoView({ behavior: "smooth" })
            }
            className="bd-glass-control--utility font-medium"
            type="button"
          >
            Who We Serve
          </button>
          <button
            onClick={() => {
              window.location.hash = "#/about";
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="bd-glass-control--utility font-medium"
            type="button"
          >
            About
          </button>
        </nav>

        <div className="flex items-center space-x-3">
          {isLoggedIn ? (
            <>
              {/* Dashboard Button */}
              {showLandingPage && (
                <button
                  onClick={onViewDashboard}
                  className="bd-glass-control--secondary inline-flex items-center gap-2 font-medium"
                  type="button"
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
                <button
                  className="bd-glass-control--secondary hidden md:block font-medium"
                  type="button"
                >
                  Login
                </button>
              </SignInButton>

              {/* Get Started CTA */}
              <SignUpButton mode="modal">
                <button className="bd-glass-control font-semibold" type="button">
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
