import { Car, Home, Settings, Camera, FileCheck, Wrench, ClipboardList, Building2, FileText, LogOut } from "lucide-react";
import { SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { LANDING_PAGE_IMAGES } from "../constants";

interface LandingPageHeaderProps {
  isLoggedIn: boolean;
  primaryColor: string;
  secondaryColor: string;
  showLandingPage: boolean;
  showProfileDropdown: boolean;
  userInfo: { name: string; email: string; profileImage: string };
  redirectInfo: { type: string } | null;
  profileDropdownRef: React.RefObject<HTMLDivElement>;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onViewDashboard: () => void;
  onLogout: () => void;
  defaultProfileImage: string;
}

export default function LandingPageHeader({
  isLoggedIn,
  primaryColor,
  secondaryColor,
  showLandingPage,
  showProfileDropdown,
  userInfo,
  redirectInfo,
  profileDropdownRef,
  onLoginClick,
  onProfileClick,
  onViewDashboard,
  onLogout,
  defaultProfileImage,
}: LandingPageHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Car className="w-6 h-6" style={{ color: primaryColor }} />
          <h1 className="text-2xl font-bold">
            <span style={{ 
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Bid</span>
            <span style={{ color: '#70c0ee' }}>On</span>
            <span className="text-gray-800">Dent</span>
          </h1>
        </button>
        
        {/* Navigation Links - Hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-all duration-300 rounded-lg hover:bg-gray-100 active:scale-95"
          >
            How It Works
          </button>
          <button 
            onClick={() => document.getElementById('who-we-serve')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-all duration-300 rounded-lg hover:bg-gray-100 active:scale-95"
          >
            Who We Serve
          </button>
        </nav>
        
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              {/* Dashboard Button - Only show on landing page */}
              {showLandingPage && (
                <button
                  onClick={onViewDashboard}
                  className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4" style={{ color: primaryColor }} />
                  <span className="font-medium" style={{ color: primaryColor }}>Dashboard</span>
                </button>
              )}
              
              {/* Clerk's UserButton - Handles profile dropdown automatically */}
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  }
                }}
              />
            </>
          ) : (
            <>
              {/* Sign In Button */}
              <SignInButton mode="modal">
                <button
                  className="hidden md:block px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-all duration-300"
                >
                  Login
                </button>
              </SignInButton>
              
              {/* Get Started Button - Opens Clerk SignUp */}
              <SignUpButton mode="modal">
                <button
                  className="px-4 py-2 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
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