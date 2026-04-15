import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Car, Wrench, Shield, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { updateUserMetadata } from "../../services/clerkService";
import { useDocumentAppearanceMode } from "../../hooks/useDocumentAppearanceMode";
import type { UserType } from "../../services/clerkService";

const ACCOUNT_TYPES: {
  type: UserType;
  icon: typeof Car;
  label: string;
  desc: string;
}[] = [
  {
    type: "customer",
    icon: Car,
    label: "Customer",
    desc: "Get repair quotes for your vehicle",
  },
  { type: "shop", icon: Wrench, label: "Auto Shop", desc: "Bid on repair jobs" },
  {
    type: "insurer",
    icon: Shield,
    label: "Insurer",
    desc: "Manage claims and shops",
  },
];

export default function ClerkAccountTypeSelector() {
  const { user } = useUser();
  const [selectedType, setSelectedType] = useState<UserType>("customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const appearanceMode = useDocumentAppearanceMode();
  const isLight = appearanceMode === "light";

  const handleComplete = async () => {
    if (!user || !name.trim()) return;

    setIsLoading(true);
    setSaveError(null);
    try {
      await updateUserMetadata(user, {
        user_type: selectedType,
        name: name.trim(),
        phone: phone.trim(),
        account_setup_completed: true,
      });
      setIsLoading(false);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error saving user profile:", error);
      setSaveError("Error saving profile. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: isLight
          ? "linear-gradient(180deg, #f0f7ff 0%, #e0ecf8 100%)"
          : "radial-gradient(130% 90% at 28% 8%, rgba(10, 22, 58, 0.99) 0%, rgba(6, 14, 36, 0.99) 58%, #040a18 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className={`rounded-2xl p-5 sm:p-8 max-w-2xl w-full border ${
          isLight
            ? "bg-white/95 border-slate-200/60 shadow-[0_10px_40px_rgba(15,23,42,0.08)]"
            : "bd-glass-card"
        }`}
      >
        <h2
          className={`text-2xl sm:text-3xl font-bold mb-1 ${isLight ? "text-slate-900" : "text-slate-100"}`}
        >
          Welcome to BidOnDent
        </h2>
        <p className={`mb-8 text-sm sm:text-base ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          Choose your account type to get started.
        </p>

        {/* Account Type Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {ACCOUNT_TYPES.map(({ type, icon: Icon, label, desc }, idx) => {
            const isActive = selectedType === type;
            return (
              <motion.button
                key={type}
                onClick={() => setSelectedType(type)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.08 * idx, ease: [0.4, 0, 0.2, 1] }}
                className={`relative p-5 sm:p-6 rounded-2xl transition-all min-h-[44px] text-left sm:text-center border ${
                  isActive
                    ? isLight
                      ? "border-blue-400 bg-blue-50/80 shadow-[0_4px_16px_rgba(14,165,233,0.10)]"
                      : "border-blue-500/50 bg-blue-500/10 shadow-[0_4px_20px_rgba(59,130,246,0.12)]"
                    : isLight
                      ? "border-slate-200/80 bg-white/60 hover:border-blue-300 hover:bg-blue-50/40"
                      : "border-white/[0.08] bg-white/[0.03] hover:border-blue-400/30 hover:bg-white/[0.06]"
                }`}
              >
                {isActive && (
                  <CheckCircle2
                    className={`absolute top-3 right-3 w-5 h-5 ${isLight ? "text-blue-500" : "text-blue-400"}`}
                  />
                )}
                <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 sm:mx-auto sm:mb-3 ${
                      isActive ? "bg-blue-500/15" : isLight ? "bg-slate-100" : "bg-white/[0.06]"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${isActive ? "text-blue-500" : isLight ? "text-slate-400" : "text-slate-500"}`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold text-sm sm:text-base ${isLight ? "text-slate-800" : "text-slate-100"}`}
                    >
                      {label}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm mt-0.5 ${isLight ? "text-slate-500" : "text-slate-400"}`}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Name and Phone */}
        <div className="space-y-4 mb-8">
          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 min-h-[44px] border rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 outline-none transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  : "border-white/[0.12] bg-white/[0.06] text-slate-100 placeholder-slate-500"
              }`}
              placeholder="Your full name"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              Phone Number
              <span className={`ml-1 font-normal ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                (optional)
              </span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-4 py-3 min-h-[44px] border rounded-xl focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 outline-none transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  : "border-white/[0.12] bg-white/[0.06] text-slate-100 placeholder-slate-500"
              }`}
              placeholder="(555) 123-4567"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Complete Button */}
        <motion.button
          onClick={handleComplete}
          disabled={!name.trim() || isLoading}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 min-h-[44px] rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
            isLight
              ? "bg-[#003d82] hover:bg-[#004da3] shadow-[0_4px_16px_rgba(0,61,130,0.18)]"
              : "bg-blue-600 hover:bg-blue-500 shadow-[0_4px_20px_rgba(59,130,246,0.2)]"
          }`}
        >
          {isLoading ? "Saving..." : "Complete Setup"}
        </motion.button>
        {saveError && <p className="text-sm text-rose-500 text-center mt-3">{saveError}</p>}
      </motion.div>
    </div>
  );
}
