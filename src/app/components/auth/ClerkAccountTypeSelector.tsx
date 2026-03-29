import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Car, Wrench, Shield } from "lucide-react";
import { updateUserMetadata } from "../../services/clerkService";
import type { UserType } from "../../services/clerkService";

export default function ClerkAccountTypeSelector() {
  const { user } = useUser();
  const [selectedType, setSelectedType] = useState<UserType>("customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isLight = document.documentElement.getAttribute("data-appearance-mode") === "light";

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

  const ACCOUNT_TYPES = [
    {
      type: "customer" as UserType,
      icon: Car,
      label: "Customer",
      desc: "Get repair quotes for your vehicle",
    },
    { type: "shop" as UserType, icon: Wrench, label: "Auto Shop", desc: "Bid on repair jobs" },
    {
      type: "insurer" as UserType,
      icon: Shield,
      label: "Insurer",
      desc: "Manage claims and shops",
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: isLight
          ? "linear-gradient(180deg, #f0f7ff 0%, #e0ecf8 100%)"
          : "radial-gradient(130% 90% at 28% 8%, rgba(10, 22, 58, 0.99) 0%, rgba(6, 14, 36, 0.99) 58%, #040a18 100%)",
      }}
    >
      <div
        className={`rounded-2xl shadow-xl p-5 sm:p-8 max-w-2xl w-full border ${
          isLight ? "bg-white/95 border-slate-200/60 shadow-slate-200/40" : "bd-glass-card"
        }`}
      >
        <h2 className={`text-3xl font-bold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
          Welcome to BidOnDent!
        </h2>
        <p className={`mb-8 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          Let&apos;s set up your account. What type of account do you need?
        </p>

        {/* Account Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {ACCOUNT_TYPES.map(({ type, icon: Icon, label, desc }) => {
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-6 rounded-xl transition-all border-2 ${
                  isActive
                    ? isLight
                      ? "border-blue-400 bg-blue-50 shadow-sm"
                      : "border-blue-500/60 bg-blue-500/15"
                    : isLight
                      ? "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                      : "border-transparent bg-white/[0.04] hover:border-blue-200/40"
                }`}
              >
                <Icon
                  className={`w-12 h-12 mx-auto mb-3 ${isLight ? "text-blue-500" : "text-blue-400"}`}
                />
                <h3
                  className={`font-semibold mb-1 ${isLight ? "text-slate-800" : "text-slate-100"}`}
                >
                  {label}
                </h3>
                <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>{desc}</p>
              </button>
            );
          })}
        </div>

        {/* Name and Phone */}
        <div className="space-y-4 mb-6">
          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  : "border-white/[0.12] bg-white/[0.06] text-slate-100 placeholder-slate-500"
              }`}
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  : "border-white/[0.12] bg-white/[0.06] text-slate-100 placeholder-slate-500"
              }`}
              placeholder="Phone number"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Complete Button */}
        <button
          onClick={handleComplete}
          disabled={!name.trim() || isLoading}
          className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          style={{ background: "linear-gradient(135deg, #003d82 0%, #0ea5e9 100%)" }}
        >
          {isLoading ? "Saving..." : "Complete Setup"}
        </button>
        {saveError && <p className="text-sm text-rose-600 text-center mt-3">{saveError}</p>}
      </div>
    </div>
  );
}
