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

  const handleComplete = async () => {
    if (!user || !name.trim()) return;

    setIsLoading(true);
    try {
      await updateUserMetadata(user, {
        user_type: selectedType,
        name: name.trim(),
        phone: phone.trim(),
        account_setup_completed: true,
      });

      // Reload to refresh the app with new user data
      window.location.reload();
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error saving user profile:", error);
      alert("Error saving profile. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bd-glass-panel flex items-center justify-center p-4">
      <div className="bd-glass-card rounded-xl shadow-xl p-5 sm:p-8 max-w-2xl w-full">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Welcome to BidOnDent!</h2>
        <p className="text-slate-400 mb-8">
          Let's set up your account. What type of account do you need?
        </p>

        {/* Account Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setSelectedType("customer")}
            className={`p-6 rounded-lg transition-all ${
              selectedType === "customer"
                ? "bd-glass-card border-2 border-blue-500/60 bg-blue-500/15"
                : "bd-glass-card border-2 border-transparent hover:border-blue-200/40"
            }`}
          >
            <Car className="w-12 h-12 mx-auto mb-3 text-blue-400" />
            <h3 className="font-semibold text-slate-100 mb-1">Customer</h3>
            <p className="text-sm text-slate-400">Get repair quotes for your vehicle</p>
          </button>

          <button
            onClick={() => setSelectedType("shop")}
            className={`p-6 rounded-lg transition-all ${
              selectedType === "shop"
                ? "bd-glass-card border-2 border-blue-500/60 bg-blue-500/15"
                : "bd-glass-card border-2 border-transparent hover:border-blue-200/40"
            }`}
          >
            <Wrench className="w-12 h-12 mx-auto mb-3 text-blue-400" />
            <h3 className="font-semibold text-slate-100 mb-1">Auto Shop</h3>
            <p className="text-sm text-slate-400">Bid on repair jobs</p>
          </button>

          <button
            onClick={() => setSelectedType("insurer")}
            className={`p-6 rounded-lg transition-all ${
              selectedType === "insurer"
                ? "bd-glass-card border-2 border-blue-500/60 bg-blue-500/15"
                : "bd-glass-card border-2 border-transparent hover:border-blue-200/40"
            }`}
          >
            <Shield className="w-12 h-12 mx-auto mb-3 text-blue-400" />
            <h3 className="font-semibold text-slate-100 mb-1">Insurer</h3>
            <p className="text-sm text-slate-400">Manage claims and shops</p>
          </button>
        </div>

        {/* Name and Phone */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-white/[0.12] rounded-lg bg-white/[0.06] text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-white/[0.12] rounded-lg bg-white/[0.06] text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Phone number"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Complete Button */}
        <button
          onClick={handleComplete}
          disabled={!name.trim() || isLoading}
          className="bd-glass-control w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Saving..." : "Complete Setup"}
        </button>
      </div>
    </div>
  );
}
