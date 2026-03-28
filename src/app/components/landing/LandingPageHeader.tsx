import { Car, Home, LogOut, Menu, Settings, User, X } from "lucide-react";
import { SignInButton, SignUpButton, useClerk, useUser } from "@clerk/clerk-react";
import { useState, useEffect, useRef } from "react";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import SettingsModal from "../codelayer/account/SettingsModal";

interface LandingPageHeaderProps {
  isLoggedIn: boolean;
  primaryColor: string;
  secondaryColor: string;
  showLandingPage: boolean;
  isLightAppearance?: boolean;
  appearanceMode?: DashboardAppearanceMode;
  onAppearanceModeChange?: (mode: DashboardAppearanceMode) => void;
  onViewDashboard: () => void;
}

export default function LandingPageHeader({
  isLoggedIn,
  primaryColor,
  secondaryColor,
  showLandingPage,
  isLightAppearance = false,
  appearanceMode = "map-dark",
  onAppearanceModeChange,
  onViewDashboard,
}: LandingPageHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileMenu]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? isLightAppearance
            ? "backdrop-blur-2xl border-b border-slate-200/40 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            : "backdrop-blur-2xl border-b border-blue-400/15 shadow-[0_4px_24px_rgba(2,6,23,0.3)]"
          : "backdrop-blur-md border-b border-transparent"
      }`}
      style={{
        background: isScrolled
          ? isLightAppearance
            ? "linear-gradient(180deg, rgba(245, 247, 251, 0.88) 0%, rgba(238, 242, 249, 0.85) 100%)"
            : "linear-gradient(180deg, rgba(12, 25, 41, 0.95) 0%, rgba(10, 22, 38, 0.92) 100%)"
          : isLightAppearance
            ? "rgba(245, 247, 251, 0.25)"
            : "rgba(12, 25, 41, 0.3)",
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between max-w-7xl">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`flex items-center gap-2.5 py-2 px-2 rounded-xl cursor-pointer transition-colors duration-200 ${isLightAppearance ? "hover:bg-slate-900/[0.04] active:bg-slate-900/[0.08]" : "hover:bg-white/5 active:bg-white/10"}`}
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
            <span style={{ color: isLightAppearance ? "#3b82f6" : "#70c0ee" }}>On</span>
            <span className={isLightAppearance ? "text-slate-800" : "text-slate-100"}>Dent</span>
          </h1>
        </button>

        {/* Navigation Links - Hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() =>
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
            }
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isLightAppearance ? "text-slate-600 hover:text-slate-800 hover:bg-slate-900/[0.04]" : "text-blue-200/80 hover:text-blue-100 hover:bg-blue-500/10"}`}
            type="button"
          >
            How It Works
          </button>
          <button
            onClick={() =>
              document.getElementById("who-we-serve")?.scrollIntoView({ behavior: "smooth" })
            }
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isLightAppearance ? "text-slate-600 hover:text-slate-800 hover:bg-slate-900/[0.04]" : "text-blue-200/80 hover:text-blue-100 hover:bg-blue-500/10"}`}
            type="button"
          >
            Who We Serve
          </button>
          <button
            onClick={() => {
              window.location.hash = "#/about";
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isLightAppearance ? "text-slate-600 hover:text-slate-800 hover:bg-slate-900/[0.04]" : "text-blue-200/80 hover:text-blue-100 hover:bg-blue-500/10"}`}
            type="button"
          >
            About
          </button>
        </nav>

        <div className="flex items-center space-x-3">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className={`md:hidden p-2 rounded-xl transition-colors ${isLightAppearance ? "text-slate-600 hover:bg-slate-900/[0.04]" : "text-blue-200/80 hover:bg-white/10"}`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {isLoggedIn ? (
            <>
              {/* Dashboard Button */}
              {showLandingPage && (
                <button
                  onClick={onViewDashboard}
                  className={`inline-flex items-center gap-1.5 font-medium px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border backdrop-blur-sm transition-all ${isLightAppearance ? "border-slate-200/40 bg-white/40 text-slate-700 hover:bg-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]" : "border-blue-400/25 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"}`}
                  type="button"
                >
                  <Home
                    className={`w-4 h-4 ${isLightAppearance ? "text-blue-600" : "text-blue-400"}`}
                  />
                  <span
                    className={`hidden sm:inline ${isLightAppearance ? "text-slate-700" : "text-blue-200"}`}
                  >
                    Dashboard
                  </span>
                </button>
              )}

              {/* Custom Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu((v) => !v)}
                  aria-expanded={showProfileMenu}
                  aria-haspopup="menu"
                  aria-label="User profile menu"
                  className={`flex items-center gap-2 px-1.5 py-1.5 rounded-xl transition-colors ${isLightAppearance ? "hover:bg-slate-900/[0.04]" : "hover:bg-white/10"}`}
                  type="button"
                >
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt="Profile"
                      className={`w-10 h-10 rounded-full object-cover border ${isLightAppearance ? "border-slate-200/50" : "border-blue-400/30"}`}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                      }}
                    >
                      {(user?.firstName?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                </button>

                {showProfileMenu && (
                  <div
                    role="menu"
                    aria-label="User profile menu"
                    className={`absolute right-0 mt-2 w-56 rounded-xl border backdrop-blur-xl shadow-lg z-50 overflow-hidden ${isLightAppearance ? "bg-white/90 border-slate-200/40 shadow-black/10" : "bg-[#0c1929]/95 border-blue-400/20 shadow-black/30"}`}
                  >
                    <div
                      className={`px-3 py-2.5 border-b ${isLightAppearance ? "border-slate-200/40" : "border-blue-400/15"}`}
                    >
                      <p
                        className={`text-sm font-semibold truncate ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
                      >
                        {user?.fullName || "User"}
                      </p>
                      <p
                        className={`text-xs truncate ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
                      >
                        {user?.primaryEmailAddress?.emailAddress || ""}
                      </p>
                    </div>
                    <button
                      role="menuitem"
                      onClick={() => {
                        onViewDashboard();
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/60" : "text-slate-200 hover:bg-white/8"}`}
                    >
                      <Home className="w-4 h-4 opacity-60" />
                      Dashboard
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowSettingsModal(true);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/60" : "text-slate-200 hover:bg-white/8"}`}
                    >
                      <Settings className="w-4 h-4 opacity-60" />
                      Site Settings
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowProfileMenu(false);
                        openUserProfile();
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/60" : "text-slate-200 hover:bg-white/8"}`}
                    >
                      <User className="w-4 h-4 opacity-60" />
                      Manage Account
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setShowProfileMenu(false);
                        signOut({ redirectUrl: "/" });
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors border-t ${isLightAppearance ? "text-rose-600 hover:bg-rose-50/60 border-slate-200/40" : "text-rose-400 hover:bg-rose-500/10 border-blue-400/15"}`}
                    >
                      <LogOut className="w-4 h-4 opacity-60" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Sign In Button */}
              <SignInButton mode="modal">
                <button
                  className={`hidden md:block font-medium px-3 py-2 rounded-xl text-sm transition-all ${isLightAppearance ? "text-slate-600 hover:text-slate-800 hover:bg-slate-900/[0.04]" : "text-blue-200/80 hover:text-blue-100 hover:bg-blue-500/10"}`}
                  type="button"
                >
                  Login
                </button>
              </SignInButton>

              {/* Get Started CTA */}
              <SignUpButton mode="modal">
                <button
                  className="font-semibold text-sm text-white rounded-xl px-4 py-2.5 transition-all hover:brightness-110"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #3b82f6 100%)`,
                    boxShadow: "0 2px 12px rgba(37, 99, 235, 0.3)",
                  }}
                  type="button"
                >
                  Get Started
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>

      {/* Mobile navigation panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-80 opacity-100 border-t" : "max-h-0 opacity-0 border-t-0"} ${isLightAppearance ? "border-slate-200/40" : "border-blue-400/15"}`}
        style={{
          background: isLightAppearance ? "rgba(245, 247, 251, 0.94)" : "rgba(10, 22, 38, 0.97)",
        }}
      >
        <div className="container mx-auto px-6 py-4 flex flex-col gap-1 max-w-7xl">
          {[
            { label: "How It Works", target: "how-it-works" },
            { label: "Who We Serve", target: "who-we-serve" },
            { label: "Coverage Map", target: "coverage" },
          ].map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => {
                document.getElementById(item.target)?.scrollIntoView({ behavior: "smooth" });
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/60 active:bg-slate-200/60" : "text-blue-100 hover:bg-white/8 active:bg-white/12"}`}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              window.location.hash = "#/about";
              window.scrollTo({ top: 0, behavior: "smooth" });
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-slate-100/60 active:bg-slate-200/60" : "text-blue-100 hover:bg-white/8 active:bg-white/12"}`}
          >
            About
          </button>
          {!isLoggedIn && (
            <div
              className={`flex gap-3 pt-3 mt-2 border-t ${isLightAppearance ? "border-slate-200/40" : "border-blue-400/15"}`}
            >
              <SignInButton mode="modal">
                <button
                  type="button"
                  className={`flex-1 text-center font-medium text-sm px-4 py-2.5 rounded-xl border transition-colors ${isLightAppearance ? "border-slate-200/50 bg-white/50 text-slate-700 hover:bg-white/70" : "border-blue-400/25 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"}`}
                >
                  Login
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="flex-1 text-center font-semibold text-sm text-white rounded-xl px-4 py-2.5 transition-all hover:brightness-110"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, #3b82f6 100%)`,
                  }}
                >
                  Get Started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>

      {/* Site Settings Modal */}
      {onAppearanceModeChange && (
        <SettingsModal
          isOpen={showSettingsModal}
          primaryColor={primaryColor}
          appearanceMode={appearanceMode}
          onAppearanceModeChange={onAppearanceModeChange}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </header>
  );
}
