/**
 * Pass 287 (2026-05-09) — Provider mount order snapshot test.
 *
 * Phase 1 of Pass 285 runtime continuity regression harness §3.1.
 * Pins the canonical 4-layer provider mount hierarchy in App.tsx
 * against future "cleanup refactor" drift (Pass 281 §12 anti-pattern #1).
 *
 * Canonical hierarchy (Pass 281 §3 + verified 2026-05-09):
 *
 *   <ClerkProvider>                           outermost; auth root (Pass 281 §4.1)
 *     <EmbeddedBrowserBanner />               Pass 170 dev-only mitigation
 *     <MapSessionProvider>                    post-Clerk per Pass 259 §5 (d)
 *                                             + first-line resize-patch import
 *                                             per Pass 260 §6 #1
 *       <AppWithToast>                        subcomponent computes
 *                                             notificationActions via
 *                                             useNotificationEvents()
 *         <AppearanceModeProvider>            hydrates from
 *                                             bidondent.appearance-mode
 *         <NotificationProvider>              innermost; auth-scoped teardown
 *
 * Why a structural snapshot test:
 *   - The ordering encodes runtime invariants (Pass 281 §6-§10).
 *   - Reordering would break hydration timing (atmospheric flash),
 *     auth-boundary teardown (Clerk redirect before notification
 *     stream cleanup), or first-import-line resize-patch timing
 *     (Pass 260 §6 #1).
 *   - Pass 281 §12 anti-pattern #1 explicitly forbids reorder
 *     without re-test. This test IS the re-test mechanism.
 *
 * Algorithm:
 *   1. Read src/app/App.tsx as a string.
 *   2. Locate the return ( ... ) block of the top-level App component.
 *   3. Extract the JSX tag-open sequence.
 *   4. Verify the canonical sequence appears in order:
 *        ClerkProvider → EmbeddedBrowserBanner → MapSessionProvider
 *        → AppWithToast → AppearanceModeProvider → NotificationProvider
 *   5. Verify AppWithToast subcomponent boundary is intact.
 *
 * This is structural verification, not behavioral. Visual/timing
 * regression is Phase 2 of Pass 285 spec; not in this test's scope.
 *
 * References:
 *   - docs/REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md (Pass 281)
 *   - docs/REF_RUNTIME_CONTINUITY_REGRESSION_SPEC_2026-05-09.md (Pass 285)
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const APP_TSX = resolve(REPO_ROOT, "src", "app", "App.tsx");

/**
 * Canonical mount-order sequence. Each entry is a regex string
 * matching the JSX tag-open form. Order matters.
 */
const CANONICAL_SEQUENCE: Array<{ tag: string; pattern: RegExp }> = [
  { tag: "ClerkProvider", pattern: /<ClerkProvider\b/ },
  { tag: "EmbeddedBrowserBanner", pattern: /<EmbeddedBrowserBanner\b/ },
  { tag: "MapSessionProvider", pattern: /<MapSessionProvider\b/ },
  { tag: "AppWithToast", pattern: /<AppWithToast\b/ },
  { tag: "AppearanceModeProvider", pattern: /<AppearanceModeProvider\b/ },
  { tag: "NotificationProvider", pattern: /<NotificationProvider\b/ },
];

describe("App.tsx provider mount order — Pass 281 §3 invariant", () => {
  const source = readFileSync(APP_TSX, "utf8");

  it("contains every canonical provider tag", () => {
    for (const { tag, pattern } of CANONICAL_SEQUENCE) {
      expect(
        pattern.test(source),
        `Canonical provider/component tag missing from App.tsx: <${tag}>. ` +
          `Pass 281 §3 invariant requires the 4-layer mount hierarchy plus ` +
          `EmbeddedBrowserBanner (Pass 170 dev-only) and AppWithToast ` +
          `subcomponent (notificationActions lift point).`,
      ).toBe(true);
    }
  });

  it("renders the providers in the canonical order", () => {
    // Find the first occurrence of each tag in the file.
    const positions: Array<{ tag: string; index: number }> = [];
    for (const { tag, pattern } of CANONICAL_SEQUENCE) {
      const match = source.search(pattern);
      expect(
        match,
        `Could not locate <${tag}> in App.tsx — canonical mount order check cannot proceed.`,
      ).toBeGreaterThanOrEqual(0);
      positions.push({ tag, index: match });
    }

    // Verify positions are strictly increasing.
    for (let i = 1; i < positions.length; i += 1) {
      const prev = positions[i - 1];
      const curr = positions[i];
      expect(
        curr.index,
        `Provider mount order regression: <${curr.tag}> appears before ` +
          `<${prev.tag}> in App.tsx. Pass 281 §3 invariant + §11 invariant ` +
          `#1 require canonical 4-layer hierarchy: ` +
          `ClerkProvider → MapSessionProvider → AppearanceModeProvider → ` +
          `NotificationProvider, with EmbeddedBrowserBanner sitting between ` +
          `ClerkProvider and MapSessionProvider, and AppWithToast subcomponent ` +
          `wrapping AppearanceModeProvider + NotificationProvider. Reorder ` +
          `prohibited per §12 anti-pattern #1.`,
      ).toBeGreaterThan(prev.index);
    }
  });

  it("preserves the AppWithToast subcomponent boundary", () => {
    // Verify AppWithToast is defined as a function in the file.
    // This catches future "cleanup refactors" that would inline its
    // contents into the App component (Pass 281 §12 anti-pattern #2).
    expect(
      /function\s+AppWithToast\b/.test(source) || /const\s+AppWithToast\b/.test(source),
      "AppWithToast subcomponent boundary missing from App.tsx. Pass 281 " +
        "§4.4 + §12 anti-pattern #2 require this boundary to preserve the " +
        "notificationActions = useNotificationEvents() lift point. Inlining " +
        "AppWithToast contents into App would break the notificationActions " +
        "computation scope.",
    ).toBe(true);
  });
});
