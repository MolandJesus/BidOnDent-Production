/**
 * Validate critical configuration at app startup.
 * Logs warnings in dev; in production, surfaces a user-visible error
 * only if the app literally cannot function.
 */

import { SUPABASE_PROJECT_ID, SUPABASE_ANON_KEY } from "../services/supabase/runtime";

// Read Clerk key from env for validation (same source as App.tsx)
const clerkPublishableKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string) ?? "";

interface ConfigIssue {
  key: string;
  message: string;
  fatal: boolean;
}

export function validateAppConfig(): ConfigIssue[] {
  const issues: ConfigIssue[] = [];

  if (!SUPABASE_PROJECT_ID) {
    issues.push({
      key: "SUPABASE_PROJECT_ID",
      message: "Supabase project ID is missing — backend calls will fail.",
      fatal: true,
    });
  }

  if (!SUPABASE_ANON_KEY) {
    issues.push({
      key: "SUPABASE_ANON_KEY",
      message: "Supabase anon key is missing — backend calls will fail.",
      fatal: true,
    });
  }

  if (!clerkPublishableKey) {
    issues.push({
      key: "CLERK_PUBLISHABLE_KEY",
      message: "Clerk publishable key is missing — authentication will fail.",
      fatal: true,
    });
  }

  if (issues.length > 0) {
    for (const issue of issues) {
      const level = issue.fatal ? "error" : "warn";
      console[level](`[Config] ${issue.key}: ${issue.message}`);
    }
  }

  return issues;
}
