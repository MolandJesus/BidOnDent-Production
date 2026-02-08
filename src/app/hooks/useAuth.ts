// Custom hook for managing authentication and login modal state
import { useState } from "react";
import type { LoginView } from "../types";

export function useAuth() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginView, setLoginView] = useState<LoginView>("main");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(false); // User must manually select this option
  const [currentUserType, setCurrentUserType] = useState<"customer" | "shop" | "insurer">("customer");
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");

  // Reset auth form
  const resetAuthForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setShowPassword(false);
    setLoginView("main");
    setKeepMeSignedIn(false);
    setLoginError("");
    setSignupError("");
  };

  // Open login modal
  const openLoginModal = (userType?: "customer" | "shop" | "insurer") => {
    setShowLoginModal(true);
    if (userType) {
      setCurrentUserType(userType);
      setLoginView(userType);
    }
  };

  // Close login modal
  const closeLoginModal = () => {
    setShowLoginModal(false);
    resetAuthForm();
  };

  return {
    // State
    showLoginModal,
    loginView,
    email,
    password,
    showPassword,
    name,
    phone,
    keepMeSignedIn,
    currentUserType,
    showMigrationModal,
    loginError,
    signupError,
    
    // Setters
    setShowLoginModal,
    setLoginView,
    setEmail,
    setPassword,
    setShowPassword,
    setName,
    setPhone,
    setKeepMeSignedIn,
    setCurrentUserType,
    setShowMigrationModal,
    setLoginError,
    setSignupError,
    
    // Actions
    resetAuthForm,
    openLoginModal,
    closeLoginModal
  };
}