/**
 * Go to Admin Account Button Component
 *
 * Shows a button that allows test accounts to switch back to the main admin account.
 * Only visible to test accounts (molalign5+shop@gmail.com, etc.), not to regular users.
 *
 * 🚨 PRODUCTION REMOVAL: Delete this file when removing admin features
 * See /src/app/config/adminConfig.ts for complete removal instructions
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, ArrowRight, X, Lock, AlertCircle } from "lucide-react";
import { canSwitchToAdmin, ADMIN_EMAIL } from "../../config/adminConfig";
import { supabase } from "../../services/supabaseService";

interface GoToAdminButtonProps {
  userEmail: string | undefined;
  primaryColor: string;
}

const GoToAdminButton = ({ userEmail, primaryColor }: GoToAdminButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Only show button for test accounts
  if (!userEmail || !canSwitchToAdmin(userEmail)) {
    return null;
  }

  const handleOpenModal = () => {
    setShowModal(true);
    setPassword("");
    setError("");
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      setShowModal(false);
      setPassword("");
      setError("");
    }
  };

  const handleSwitchToAdmin = async () => {
    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (import.meta.env.DEV) {
        console.log("🔄 Switching to admin account...");
        console.log("👤 Current user:", userEmail);
        console.log("🎯 Target admin:", ADMIN_EMAIL);
      }

      // Set a flag in sessionStorage to prevent showing onboarding during switch
      sessionStorage.setItem("bidondent_switching_to_admin", "true");

      // Sign out current user
      if (import.meta.env.DEV) console.log("📤 Signing out current user...");
      await supabase.auth.signOut();

      if (import.meta.env.DEV)
        console.log("📥 Attempting to sign in as admin with email:", ADMIN_EMAIL);

      // Sign in as admin with the provided password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: password,
      });

      if (import.meta.env.DEV)
        console.log("📡 Sign in response:", { data: signInData, error: signInError });

      if (signInError) {
        if (import.meta.env.DEV) console.error("❌ Switch error:", signInError);

        // Check if it's an invalid credentials error
        if (
          signInError.message.includes("Invalid") ||
          signInError.message.includes("credentials")
        ) {
          setError("Invalid password. Please check your password and try again.");
          setIsLoading(false);
          return;
        } else {
          setError(signInError.message || "An error occurred. Please try again.");
          setIsLoading(false);
          return;
        }
      }

      if (!signInData.session) {
        if (import.meta.env.DEV) console.error("❌ No session returned");
        setError("Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      if (import.meta.env.DEV) {
        console.log("✅ Successfully switched to admin account! Session:", signInData.session);
        console.log("🔄 Auth state listener will handle the rest...");
      }

      // Close the modal - the auth listener will automatically handle the sign-in
      setShowModal(false);
      setPassword("");
      setError("");
      setIsLoading(false);

      // Note: No page reload needed! The auth state listener in App.tsx will:
      // 1. Detect the SIGNED_IN event for admin account
      // 2. Override account type to "customer" for admin
      // 3. Skip onboarding
      // 4. Show admin dashboard
    } catch (error) {
      if (import.meta.env.DEV) console.error("❌ Exception switching to admin:", error);
      setError(error instanceof Error ? error.message : "An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSwitchToAdmin();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400/20 rounded-lg p-6 mt-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Shield className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-slate-100 mb-1">🔐 Test Account Feature</h3>
            <p className="text-sm text-slate-400 mb-4">
              You are using a test account. Switch back to the main admin account to access the
              admin dashboard and manage all test accounts.
            </p>

            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all transform hover:scale-105 shadow-md"
              style={{ backgroundColor: primaryColor }}
            >
              <Shield className="w-4 h-4" />
              Go to Admin Account
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-slate-400 mt-3">
              Current account: <span className="font-mono">{userEmail}</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Custom Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bd-glass-floating rounded-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="px-6 py-5 text-white relative overflow-hidden"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Switch to Admin Account</h2>
                      <p className="text-sm opacity-90">Enter your admin password</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    disabled={isLoading}
                    className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-200">
                    <strong>You are about to switch from:</strong>
                    <br />
                    <span className="font-mono text-blue-400">{userEmail}</span>
                  </p>
                  <div className="my-2 flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-blue-200">
                    <strong>To admin account:</strong>
                    <br />
                    <span className="font-mono text-blue-400">{ADMIN_EMAIL}</span>
                  </p>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Admin Account Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 border-2 border-white/[0.12] rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-white/[0.06] disabled:cursor-not-allowed"
                    />
                  </div>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 flex items-start gap-2 text-red-300 bg-red-400/10 border border-red-400/30 rounded-lg p-3"
                    >
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{error}</p>
                    </motion.div>
                  )}
                </div>

                {/* Info */}
                <p className="text-xs text-slate-400 mt-4">
                  💡 This is the same password you use to sign in to your admin account normally.
                </p>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-white/[0.04] flex items-center justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  disabled={isLoading}
                  className="px-4 py-2 text-slate-300 bd-glass-control rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSwitchToAdmin}
                  disabled={isLoading || !password}
                  className="px-5 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center gap-2"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Switching...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Switch to Admin
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GoToAdminButton;
