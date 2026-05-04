import { Home, LogOut, Menu, Moon, Settings, Sun, User, X } from "lucide-react";
import { SignInButton, SignUpButton, useClerk, useUser } from "@clerk/clerk-react";
import { useState, useEffect, useRef } from "react";
import SettingsModal from "../codelayer/account/SettingsModal";
import BrandLogo from "../app/BrandLogo";
import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";

interface LandingPageHeaderProps {
  isLoggedIn: boolean;
  primaryColor: string;
  secondaryColor: string;
  showLandingPage: boolean;
  isLightAppearance?: boolean;
  onViewDashboard: () => void;
}

export default function LandingPageHeader({
  isLoggedIn,
  primaryColor,
  secondaryColor,
  showLandingPage,
  isLightAppearance = false,
  onViewDashboard,
}: LandingPageHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  const [, setAppearanceMode] = useAppearanceModeCtx();
  const toggleAppearanceMode = () => {
    setAppearanceMode(isLightAppearance ? "map-dark" : "light");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  // Close profile and mobile menus on outside click / escape.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowProfileMenu(false);
        setMobileMenuOpen(false);
      }
    };

    if (showProfileMenu || mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen, showProfileMenu]);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? isLightAppearance
            ? "backdrop-blur-2xl border-b border-[rgba(200,180,150,0.22)] shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            : // Dark scrolled — adopts dashboard navy-lit-by-gold-lamp identity:
              // inset gold trim line at bottom + gold ambient glow, layered
              // over the existing cool-blue shadow.
              "backdrop-blur-2xl border-b border-blue-400/15 shadow-[0_4px_24px_rgba(2,6,23,0.3),inset_0_-1px_0_rgba(196, 144, 65,0.20),0_0_28px_rgba(196, 130, 45,0.16)]"
          : "backdrop-blur-md border-b border-transparent"
      }`}
      style={{
        background: isScrolled
          ? isLightAppearance
            ? "linear-gradient(180deg, rgba(250, 247, 240, 0.9) 0%, rgba(248, 243, 235, 0.87) 100%)"
            : "linear-gradient(180deg, rgba(12, 25, 41, 0.95) 0%, rgba(10, 22, 38, 0.92) 100%)"
          : isLightAppearance
            ? "rgba(250, 247, 240, 0.25)"
            : "rgba(12, 25, 41, 0.3)",
      }}
    >
      <div className="container mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 sm:gap-4 sm:px-6 sm:py-4">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className={`flex min-h-[44px] shrink-0 items-center rounded-2xl px-1 py-1 transition-colors duration-200 sm:rounded-xl sm:px-1.5 sm:py-1.5 ${isLightAppearance ? "hover:bg-slate-900/[0.04] active:bg-slate-900/[0.08]" : "hover:bg-white/5 active:bg-white/10"}`}
          type="button"
        >
          <h1 className="whitespace-nowrap leading-none">
            <BrandLogo
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              tone={isLightAppearance ? "light" : "dark"}
              size="header"
            />
          </h1>
        </button>

        {/* Navigation Links - Hidden on mobile */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center space-x-1">
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Appearance toggle (Pass 1.5) — desktop visible, mobile in drawer */}
          <button
            type="button"
            onClick={toggleAppearanceMode}
            aria-label={
              isLightAppearance ? "Switch to dark appearance" : "Switch to light appearance"
            }
            aria-pressed={!isLightAppearance}
            title={isLightAppearance ? "Switch to dark mode" : "Switch to light mode"}
            className={`hidden md:inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl border backdrop-blur-xl transition-all ${isLightAppearance ? "border-[rgba(200,180,150,0.28)] bg-[rgba(255,251,245,0.65)] text-amber-600 shadow-[0_8px_18px_rgba(15,23,42,0.08),0_0_18px_rgba(251,191,36,0.18)] hover:bg-[rgba(255,251,245,0.82)] hover:text-amber-500" : "border-blue-300/28 bg-white/[0.05] text-blue-200 shadow-[0_10px_22px_rgba(2,6,23,0.32),0_0_22px_rgba(96,165,250,0.18)] hover:bg-white/[0.10] hover:text-blue-100"}`}
          >
            {isLightAppearance ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-controls="landing-mobile-navigation"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className={`flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl border backdrop-blur-xl transition-all md:hidden ${isLightAppearance ? "border-[rgba(200,180,150,0.25)] bg-[rgba(255,251,245,0.6)] text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.06)] hover:bg-[rgba(255,251,245,0.8)]" : "border-blue-300/20 bg-white/[0.04] text-blue-100/80 shadow-[0_10px_22px_rgba(2,6,23,0.28)] hover:bg-white/[0.08]"}`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {isLoggedIn ? (
            <>
              {/* Dashboard Button */}
              {showLandingPage && (
                <button
                  onClick={onViewDashboard}
                  aria-label="Open dashboard"
                  className={`bd-dashboard-primary-button inline-flex h-11 w-11 min-h-[44px] items-center justify-center gap-2 font-medium backdrop-blur-md sm:w-auto sm:px-3.5 sm:py-2 ${isLightAppearance ? "text-slate-700" : "text-blue-100"}`}
                  style={{
                    background: isLightAppearance
                      ? "rgba(255,251,245,0.65)"
                      : "linear-gradient(180deg,rgba(37,99,235,0.22),rgba(15,23,42,0.7))",
                    borderColor: isLightAppearance
                      ? "rgba(200,180,150,0.28)"
                      : "rgba(147,197,253,0.28)",
                  }}
                  type="button"
                >
                  <Home
                    className={`w-4 h-4 shrink-0 ${isLightAppearance ? "text-blue-700" : "text-blue-200"}`}
                    strokeWidth={2.3}
                  />
                  <span
                    className={`hidden sm:inline ${isLightAppearance ? "text-slate-700" : "text-blue-100"}`}
                  >
                    Dashboard
                  </span>
                </button>
              )}

              {/* Custom Profile Dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu((v) => !v)}
                  aria-controls="landing-user-profile-menu"
                  aria-expanded={showProfileMenu}
                  aria-haspopup="menu"
                  aria-label={
                    showProfileMenu ? "Close user profile menu" : "Open user profile menu"
                  }
                  className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-2xl border px-1 py-1 backdrop-blur-xl transition-all ${isLightAppearance ? "border-[rgba(200,180,150,0.25)] bg-[rgba(255,251,245,0.55)] hover:bg-[rgba(255,251,245,0.8)]" : "border-blue-300/18 bg-white/[0.04] hover:bg-white/[0.08]"}`}
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
                    id="landing-user-profile-menu"
                    role="menu"
                    aria-label="User profile menu"
                    className={`absolute right-0 mt-2 w-56 rounded-xl border backdrop-blur-xl shadow-lg z-50 overflow-hidden ${isLightAppearance ? "bg-[rgba(255,251,245,0.92)] border-[rgba(200,180,150,0.22)] shadow-black/10" : "bg-[#0c1929]/95 border-blue-400/20 shadow-black/30"}`}
                  >
                    <div
                      className={`px-3 py-2.5 border-b ${isLightAppearance ? "border-[rgba(200,180,150,0.22)]" : "border-blue-400/15"}`}
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
                        setMobileMenuOpen(false);
                        setShowProfileMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-[rgba(255,248,235,0.6)]" : "text-slate-200 hover:bg-white/8"}`}
                      type="button"
                    >
                      <Home className="w-4 h-4 opacity-60" />
                      Dashboard
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowProfileMenu(false);
                        setShowSettingsModal(true);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-[rgba(255,248,235,0.6)]" : "text-slate-200 hover:bg-white/8"}`}
                      type="button"
                    >
                      <Settings className="w-4 h-4 opacity-60" />
                      Appearance Settings
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowProfileMenu(false);
                        openUserProfile();
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-[rgba(255,248,235,0.6)]" : "text-slate-200 hover:bg-white/8"}`}
                      type="button"
                    >
                      <User className="w-4 h-4 opacity-60" />
                      Manage Account
                    </button>
                    <button
                      role="menuitem"
                      onClick={async () => {
                        setMobileMenuOpen(false);
                        setShowProfileMenu(false);
                        // KI-097: await signOut so the Promise can settle before
                        // re-renders. ClerkProvider's afterSignOutUrl="/" (KI-096)
                        // handles the hard navigation, so no per-call redirectUrl
                        // needed here.
                        await signOut();
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors border-t ${isLightAppearance ? "text-rose-600 hover:bg-rose-50/60 border-[rgba(200,180,150,0.22)]" : "text-rose-400 hover:bg-rose-500/10 border-blue-400/15"}`}
                      type="button"
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
        id="landing-mobile-navigation"
        aria-label="Mobile navigation"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-80 opacity-100 border-t" : "max-h-0 opacity-0 border-t-0"} ${isLightAppearance ? "border-[rgba(200,180,150,0.22)]" : "border-blue-400/15"}`}
        role="region"
        style={{
          background: isLightAppearance ? "rgba(250, 247, 240, 0.95)" : "rgba(10, 22, 38, 0.97)",
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
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-[rgba(255,248,235,0.6)] active:bg-[rgba(255,240,215,0.6)]" : "text-blue-100 hover:bg-white/8 active:bg-white/12"}`}
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
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isLightAppearance ? "text-slate-700 hover:bg-[rgba(255,248,235,0.6)] active:bg-[rgba(255,240,215,0.6)]" : "text-blue-100 hover:bg-white/8 active:bg-white/12"}`}
          >
            About
          </button>
          {/* Appearance toggle (Pass 1.5) — mobile drawer entry */}
          <button
            type="button"
            onClick={() => {
              toggleAppearanceMode();
              setMobileMenuOpen(false);
            }}
            aria-label={
              isLightAppearance ? "Switch to dark appearance" : "Switch to light appearance"
            }
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${isLightAppearance ? "text-slate-700 hover:bg-[rgba(255,248,235,0.6)] active:bg-[rgba(255,240,215,0.6)]" : "text-blue-100 hover:bg-white/8 active:bg-white/12"}`}
          >
            <span className="flex items-center gap-2.5">
              {isLightAppearance ? (
                <Sun className="h-4 w-4 text-amber-600" />
              ) : (
                <Moon className="h-4 w-4 text-blue-300" />
              )}
              {isLightAppearance ? "Switch to Dark mode" : "Switch to Light mode"}
            </span>
            <span
              className={`text-xs font-semibold tracking-wide uppercase ${isLightAppearance ? "text-amber-600/70" : "text-blue-300/70"}`}
            >
              {isLightAppearance ? "Light" : "Dark"}
            </span>
          </button>
          {!isLoggedIn && (
            <div
              className={`flex gap-3 pt-3 mt-2 border-t ${isLightAppearance ? "border-[rgba(200,180,150,0.22)]" : "border-blue-400/15"}`}
            >
              <SignInButton mode="modal">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  type="button"
                  className={`flex-1 text-center font-medium text-sm px-4 py-2.5 rounded-xl border transition-colors ${isLightAppearance ? "border-[rgba(200,180,150,0.25)] bg-[rgba(255,251,245,0.5)] text-slate-700 hover:bg-[rgba(255,251,245,0.7)]" : "border-blue-400/25 bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"}`}
                >
                  Login
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  onClick={() => setMobileMenuOpen(false)}
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

      {/* Appearance Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        primaryColor={primaryColor}
        onClose={() => setShowSettingsModal(false)}
      />
    </header>
  );
}
