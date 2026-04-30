/**
 * Map raw edge-function errors into user-friendly strings.
 *
 * Backend handlers return 4xx/5xx responses with `{ error, code? }` payloads.
 * This helper turns those (and bare network errors) into copy that's safe to
 * render directly in a toast or inline error.
 *
 * The shop side audit caught raw backend strings like
 * "zip_codes array required for zip_codes type" leaking into the UI;
 * that's exactly what this normalizes.
 */
import { EdgeFunctionError } from "../services/supabase/runtime";

const FRIENDLY_BY_CODE: Record<string, string> = {
  UNAUTHORIZED: "Please sign in again to continue.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "We couldn't find that record.",
  VALIDATION_ERROR: "Please check the form and try again.",
  RATE_LIMITED: "You're doing that a little too fast — try again in a moment.",
  SHOP_PROFILE_REQUIRED:
    "Complete your shop profile first — service areas, bids, and jobs all need it.",
};

const FRIENDLY_BY_PATTERN: Array<[RegExp, string]> = [
  [/zip_codes array required/i, "Add at least one ZIP code before saving."],
  [/center_latitude.*required|center_longitude.*required/i, "Pick a location on the map first."],
  [/radius_miles must be between/i, "Pick a radius between 1 and 200 miles."],
  [
    /no authorization header|bearer token|jwt|expired/i,
    "Your session expired — please sign in again.",
  ],
  [
    /website identity mismatch|authenticated user mismatch/i,
    "Something went wrong with your session — please sign out and back in.",
  ],
  [/data conflict|duplicate key|unique/i, "That entry already exists."],
  [/permission denied|row-level security/i, "You don't have permission to do that."],
  [
    /network|failed to fetch|load failed/i,
    "Couldn't reach the server. Check your connection and try again.",
  ],
];

/**
 * Returns a user-friendly error string suitable for toasts and inline messages.
 * Prefers `code` when available (set by backend handlers), falls back to
 * pattern-matching the message, and finally returns a generic fallback.
 */
export function friendlyEdgeError(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (err instanceof EdgeFunctionError && err.code && FRIENDLY_BY_CODE[err.code]) {
    return FRIENDLY_BY_CODE[err.code];
  }

  const message = err instanceof Error ? err.message : typeof err === "string" ? err : "";

  if (message) {
    for (const [pattern, friendly] of FRIENDLY_BY_PATTERN) {
      if (pattern.test(message)) return friendly;
    }
  }

  // If the message looks user-safe (no schema/constraint vocabulary), return it.
  if (message && !/violat|constraint|foreign key|relation "|column "|table "/i.test(message)) {
    return message;
  }

  return fallback;
}
