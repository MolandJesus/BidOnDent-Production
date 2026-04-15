import { useState } from "react";
import { supabase } from "../../services/supabase/client";

interface WaitlistCaptureProps {
  isLightAppearance?: boolean;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistCapture({ isLightAppearance = false }: WaitlistCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) return;

    setStatus("submitting");
    try {
      const { error } = await supabase.from("platform_activity_events").insert({
        event_type: "waitlist_signup",
        actor_id: trimmed,
        outcome: "captured",
        source: "landing-cta",
        payload: {},
      });
      if (error) throw error;
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p className="mt-4 text-sm font-medium text-emerald-300">
        You're on the list! We'll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 mx-auto flex max-w-sm items-center gap-2">
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        className={`flex-1 rounded-full px-4 py-2.5 text-sm outline-none min-h-[44px] ${
          isLightAppearance
            ? "bg-white/90 text-slate-800 placeholder:text-slate-400 border border-slate-200"
            : "bg-white/10 text-white placeholder:text-blue-200/50 border border-blue-300/20 focus:border-blue-400/40"
        }`}
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full px-5 py-2.5 text-sm font-semibold text-white min-h-[44px] transition-opacity disabled:opacity-60"
        style={{
          background: "linear-gradient(180deg, rgba(30,64,175,0.98) 0%, rgba(37,99,235,0.98) 100%)",
        }}
      >
        {status === "submitting" ? "…" : "Join Waitlist"}
      </button>
      {status === "error" && (
        <p className="absolute -bottom-5 left-0 text-xs text-red-400">
          Something went wrong. Try again.
        </p>
      )}
    </form>
  );
}
