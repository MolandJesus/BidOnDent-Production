import { ChevronRight } from "lucide-react";
import { SignUpButton, useUser } from '@clerk/clerk-react';

interface CTASectionProps {
  primaryColor: string;
  onNavigateToDashboard?: () => void;
}

export default function CTASection({ primaryColor, onNavigateToDashboard }: CTASectionProps) {
  const { isSignedIn } = useUser();

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        <h3 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h3>
        <p className="text-xl text-gray-600 mb-10">Join thousands of satisfied customers and experience hassle-free auto repair today.</p>
        
        {/* Show different button based on auth state */}
        {isSignedIn ? (
          // User is logged in - navigate to dashboard
          <button 
            onClick={onNavigateToDashboard}
            className="px-12 py-5 rounded-lg text-white font-bold text-xl hover:opacity-90 transition-all inline-flex items-center shadow-2xl hover:shadow-3xl"
            style={{ backgroundColor: primaryColor }}
          >
            Go to Dashboard
            <ChevronRight className="ml-2 w-6 h-6" />
          </button>
        ) : (
          // User is not logged in - show sign up
          <SignUpButton mode="modal">
            <button 
              className="px-12 py-5 rounded-lg text-white font-bold text-xl hover:opacity-90 transition-all inline-flex items-center shadow-2xl hover:shadow-3xl"
              style={{ backgroundColor: primaryColor }}
            >
              Get Started Now
              <ChevronRight className="ml-2 w-6 h-6" />
            </button>
          </SignUpButton>
        )}
      </div>
    </section>
  );
}