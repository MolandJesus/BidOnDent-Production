/**
 * Clerk appearance configuration — matches BidOnDent's dark blue design system.
 *
 * When Google / Apple OAuth is enabled in the Clerk Dashboard,
 * social sign-in buttons appear automatically in the modal UI.
 *
 * Dashboard setup:
 *   Clerk Dashboard → Configure → SSO Connections → Add Google / Apple
 *   https://dashboard.clerk.com  →  your-app  →  User & Authentication → Social connections
 */
import type { Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#003d82",
    colorBackground: "#0a1626",
    colorText: "#e2e8f0",
    colorTextSecondary: "#94a3b8",
    colorInputBackground: "rgba(255,255,255,0.06)",
    colorInputText: "#e2e8f0",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "bg-[#0d1f35] border border-blue-400/15 shadow-2xl",
    headerTitle: "text-slate-100",
    headerSubtitle: "text-slate-400",
    socialButtonsBlockButton:
      "border-blue-400/20 bg-white/[0.06] hover:bg-white/[0.10] text-slate-200",
    formFieldInput:
      "border-white/[0.12] bg-white/[0.06] text-slate-100 placeholder-slate-500 focus:ring-blue-500",
    formButtonPrimary: "bg-[#003d82] hover:bg-[#004da3] text-white",
    footerActionLink: "text-blue-400 hover:text-blue-300",
    dividerLine: "bg-blue-400/15",
    dividerText: "text-slate-500",
  },
};
