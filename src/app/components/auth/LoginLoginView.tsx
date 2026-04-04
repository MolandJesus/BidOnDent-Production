import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import type { LoginView } from "../../types";

interface LoginLoginViewProps {
  email: string;
  password: string;
  showPassword: boolean;
  keepMeSignedIn: boolean;
  primaryColor: string;
  loginError?: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onShowPasswordToggle: () => void;
  onKeepMeSignedInChange: (checked: boolean) => void;
  onLoginViewChange: (view: LoginView) => void;
  onLogin: () => void;
}

export function LoginLoginView({
  email,
  password,
  showPassword,
  keepMeSignedIn,
  primaryColor,
  loginError,
  onEmailChange,
  onPasswordChange,
  onShowPasswordToggle,
  onKeepMeSignedInChange,
  onLoginViewChange,
  onLogin,
}: LoginLoginViewProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onLogin()}
            className="w-full pl-10 pr-3 py-2 border border-white/[0.12] rounded-md bg-white/[0.06] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2"
            placeholder="your@email.com"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onLogin()}
            className="w-full pl-10 pr-10 py-2 border border-white/[0.12] rounded-md bg-white/[0.06] text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2"
            placeholder="••••••••"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={onShowPasswordToggle}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={keepMeSignedIn}
          onChange={(e) => onKeepMeSignedInChange(e.target.checked)}
          className="w-4 h-4 rounded"
          style={{ accentColor: primaryColor }}
        />
        <span className="text-sm text-slate-300">Keep me signed in</span>
      </label>

      {loginError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-400/20 text-red-300 px-4 py-3 rounded-lg flex items-start gap-2"
        >
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{loginError}</span>
        </motion.div>
      )}

      <motion.button
        onClick={onLogin}
        className="w-full py-3 rounded-md text-white font-medium hover:opacity-90 transition-opacity"
        style={{ backgroundColor: primaryColor }}
        type="button"
        whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0, 61, 130, 0.3)" }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        Log In
      </motion.button>

      <div className="rounded-lg border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
        <span className="font-medium text-slate-200">Prefer social sign-in?</span> Use the{" "}
        <button
          type="button"
          onClick={() => onLoginViewChange("main")}
          className="underline text-blue-400 hover:text-blue-300"
        >
          main login
        </button>{" "}
        page for Google and other providers.
      </div>

      <button
        onClick={() => onLoginViewChange("main")}
        className="w-full text-center text-sm text-slate-400 hover:text-slate-200"
        type="button"
      >
        Don't have an account? <span className="font-semibold">Sign up</span>
      </button>
    </div>
  );
}
