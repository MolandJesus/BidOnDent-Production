// Login and Signup Modal Component
import { motion } from "motion/react";
import { X } from "lucide-react";
import type { LoginView } from "../../types";
import { LoginMainView } from "./LoginMainView";
import { LoginSignupView } from "./LoginSignupView";
import { LoginLoginView } from "./LoginLoginView";

interface LoginModalProps {
  show: boolean;
  loginView: LoginView;
  email: string;
  password: string;
  showPassword: boolean;
  name: string;
  phone: string;
  keepMeSignedIn: boolean;
  primaryColor: string;
  loginError?: string;
  signupError?: string;
  onClose: () => void;
  onLoginViewChange: (view: LoginView) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onShowPasswordToggle: () => void;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  onKeepMeSignedInChange: (checked: boolean) => void;
  onUserTypeSelect: (type: "customer" | "shop" | "insurer") => void;
  onSignup: () => void;
  onLogin: () => void;
}

export default function LoginModal({
  show,
  loginView,
  email,
  password,
  showPassword,
  name,
  phone,
  keepMeSignedIn,
  primaryColor,
  loginError,
  signupError,
  onClose,
  onLoginViewChange,
  onEmailChange,
  onPasswordChange,
  onShowPasswordToggle,
  onNameChange,
  onPhoneChange,
  onKeepMeSignedInChange,
  onUserTypeSelect,
  onSignup,
  onLogin,
}: LoginModalProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{
        backgroundImage:
          'linear-gradient(135deg, rgba(0, 61, 130, 0.95) 0%, rgba(0, 93, 166, 0.95) 100%), url("https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bd-glass-floating rounded-lg max-w-md w-full p-5 sm:p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">
            {loginView === "main" && "Welcome"}
            {loginView === "signup" && "Create Account"}
            {loginView === "login" && "Log In"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {loginView === "main" && (
          <LoginMainView
            primaryColor={primaryColor}
            onUserTypeSelect={onUserTypeSelect}
            onLoginViewChange={onLoginViewChange}
          />
        )}

        {loginView === "signup" && (
          <LoginSignupView
            email={email}
            password={password}
            showPassword={showPassword}
            name={name}
            phone={phone}
            keepMeSignedIn={keepMeSignedIn}
            primaryColor={primaryColor}
            signupError={signupError}
            onEmailChange={onEmailChange}
            onPasswordChange={onPasswordChange}
            onShowPasswordToggle={onShowPasswordToggle}
            onNameChange={onNameChange}
            onPhoneChange={onPhoneChange}
            onKeepMeSignedInChange={onKeepMeSignedInChange}
            onLoginViewChange={onLoginViewChange}
            onSignup={onSignup}
          />
        )}

        {loginView === "login" && (
          <LoginLoginView
            email={email}
            password={password}
            showPassword={showPassword}
            keepMeSignedIn={keepMeSignedIn}
            primaryColor={primaryColor}
            loginError={loginError}
            onEmailChange={onEmailChange}
            onPasswordChange={onPasswordChange}
            onShowPasswordToggle={onShowPasswordToggle}
            onKeepMeSignedInChange={onKeepMeSignedInChange}
            onLoginViewChange={onLoginViewChange}
            onLogin={onLogin}
          />
        )}
      </motion.div>
    </div>
  );
}
