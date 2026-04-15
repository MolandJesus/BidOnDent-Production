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
    <div className="bd-report-flow min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="bd-report-section rounded-2xl p-5 sm:p-8 max-w-2xl w-full"
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
                className={`bd-report-choice relative p-5 sm:p-6 rounded-2xl min-h-[44px] text-left sm:text-center ${
                  isActive ? "bd-report-choice--active" : ""
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
              className="bd-report-input w-full px-4 py-3 min-h-[44px] rounded-xl"
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
              className="bd-report-input w-full px-4 py-3 min-h-[44px] rounded-xl"
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
          className="bd-report-primary-button w-full py-3 min-h-[44px] rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, #003d82 0%, #0f8fd7 100%)`,
          }}
        >
          {isLoading ? "Saving..." : "Complete Setup"}
        </motion.button>
        {saveError && <p className="text-sm text-rose-500 text-center mt-3">{saveError}</p>}
      </motion.div>
    </div>
  );
}
