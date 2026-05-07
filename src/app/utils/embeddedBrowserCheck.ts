/**
 * Embedded Browser Check
 *
 * Pass 170 (2026-05-07) — Google OAuth `disallowed_useragent` mitigation.
 *
 * Google's "Use secure browsers" policy blocks OAuth flows from embedded
 * browsers / WebViews / Electron-based shells. VS Code's Simple Browser
 * (vscode-browser) qualifies as embedded, so any "Sign in with Google"
 * button hit from inside it returns:
 *
 *     Error 403: disallowed_useragent
 *     "Clerk's request does not comply with Google's policies"
 *
 * This is NOT a BidOnDent code bug — it's Google's policy applied to any
 * OAuth client. The standard remediation is "open in a real browser."
 *
 * This utility detects the most common embedded-browser UAs so the app
 * can show a dev-mode banner directing the user to open `localhost:5173`
 * in real Chrome, OR use the `?demo=customer` / `?demo=shop` URL params
 * which bypass Clerk auth entirely.
 *
 * Safe heuristic — false positives are acceptable here (user just sees
 * a dev banner that doesn't affect production users since the wrapper
 * is gated on `import.meta.env.DEV`).
 */

const EMBEDDED_UA_PATTERNS = [
  /\bElectron\//i, // Electron shells (covers VS Code Simple Browser, Postman browser, etc.)
  /\bwv\)/i, // Android WebView marker
  /; wv\)/i, // Android WebView alt marker
  /Mobile.*Safari\/[\d.]+ Mobile.*Mobile/i, // some webview patterns
  /Code\/[\d.]+/i, // VS Code-specific UA fragment when present
  /VSCode/i, // VS Code UA fragment
  /Simple Browser/i, // VS Code Simple Browser explicit name
];

/**
 * Returns true if the current user agent appears to be an embedded
 * browser that Google OAuth will reject with `disallowed_useragent`.
 *
 * Server-safe (returns false on SSR — `navigator` undefined).
 */
export function isEmbeddedBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return EMBEDDED_UA_PATTERNS.some((pattern) => pattern.test(ua));
}

/**
 * Returns a short description of the detected embedded-browser kind
 * for use in dev-mode banners. Returns null if the UA looks like a
 * regular Chrome/Firefox/Safari window.
 */
export function describeEmbeddedBrowser(): string | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;

  if (/VSCode|Code\/|Simple Browser/i.test(ua)) {
    return "VS Code's Simple Browser";
  }
  if (/\bElectron\//i.test(ua)) {
    return "an Electron-based browser";
  }
  if (/\bwv\)|; wv\)/i.test(ua)) {
    return "an Android WebView";
  }

  return null;
}
