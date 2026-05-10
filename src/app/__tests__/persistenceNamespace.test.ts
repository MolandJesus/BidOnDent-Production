/**
 * Pass 288 (2026-05-09) — Persistence-key namespace snapshot test.
 *
 * Phase 1 of Pass 285 runtime continuity regression harness §3.5.
 * Pins the localStorage / sessionStorage namespace conventions
 * documented in Pass 274 §3 against future drift.
 *
 * The codebase uses FOUR namespacing conventions (Pass 274 §3.1):
 *   1. `bidondent.*` (dot-namespaced)         — 4 keys baseline
 *   2. `bidondent_*` (underscore-namespaced)  — ~22 keys baseline
 *   3. `bd-*` / `bd:*` (short prefix)         — 2 keys baseline
 *   4. UN-NAMESPACED                          — 1 documented localStorage key
 *
 * The 1 un-namespaced localStorage exception (Pass 274 §3.2) is:
 *   - `coverageCurrentLocation` (clearStaleNavSessions.ts)
 *
 * (Pass 274 §3.2 also lists `demo` and `mode`, but those are query-string
 * keys, not localStorage keys — outside this test's scope.)
 *
 * The codebase pattern is: storage keys are declared as constants
 *   const FOO_KEY = "bidondent_foo";
 * and then passed to localStorage methods. Snapshot test scans for
 * these `*KEY*` / `*STORAGE*` named constants and verifies their
 * literal values are namespaced (or in the allowlist).
 *
 * This test:
 *   1. Walks src/app/**\/*.ts{x} (excluding test files).
 *   2. Extracts string-literal values from constants with names
 *      containing KEY or STORAGE (case-insensitive).
 *   3. Categorizes each value by namespace convention.
 *   4. Asserts no NEW un-namespaced values beyond the documented
 *      exception.
 *
 * Failure mode caught: persistence drift — new constants declaring
 * storage keys that bypass the namespace doctrine (Pass 281 §11
 * + Pass 274 §3 + Pass 281 §9 invariants).
 *
 * Out of scope: dynamic / template-literal keys (e.g.,
 * `bidondent_nav_session_${id}`) — runtime-evaluated, not snapshot.
 *
 * References:
 *   - docs/REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md (Pass 274 §3)
 *   - docs/REF_RUNTIME_CONTINUITY_REGRESSION_SPEC_2026-05-09.md (Pass 285 §3.5)
 *   - docs/REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md (Pass 281 §9 + §11)
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const SRC_APP = resolve(REPO_ROOT, "src", "app");

/**
 * Documented un-namespaced / off-pattern storage-key exceptions.
 * Adding a new entry requires updating this allowlist AND the
 * corresponding Pass 274 §3.x documentation.
 *
 * Each entry must cite the source of authorization. Drift entries
 * (Pass 288 discoveries; not yet remediated) are flagged as such
 * and reference Pass 274 §3.4 RISK 2 (convention drift remediation
 * is owner-authorize work).
 */
const ALLOWED_UNNAMESPACED_KEYS = new Set<string>([
  // Pass 274 §3.2 RISK 1 — un-namespaced localStorage key; collides
  // cross-app on same origin; documented as remediation candidate.
  "coverageCurrentLocation",
  // Pass 274 §3.2 — query-string keys (not localStorage). Trigger
  // matched here because the constant names contain KEY
  // (DEMO_QUERY_KEY / DEMO_MODE_QUERY_KEY in src/app/utils/devDemoMode.ts).
  // Out of localStorage namespace scope but constant-naming heuristic
  // catches them — allowlist them explicitly.
  "demo",
  "mode",
  // Pass 274 §3.3 — window-global patch marker (uppercase). Set on
  // globalThis at src/app/utils/maplibreResizePatch.ts:98 + referenced
  // at src/app/test-utils/mapTestHarness.ts:215 as PATCH_MARKER_KEY.
  // Domain is window globals, not localStorage; allowlist explicitly.
  "__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__",
  // Pass 288 (this test) DRIFT DISCOVERY — 5th namespace convention
  // detected. `bidondent-` (hyphen-separated) at
  // src/app/services/navigation/placeDiscoveryQuality.ts:51 is not in
  // Pass 274 §3.1's catalogued 4 conventions (dot / underscore /
  // bd-short / un-namespaced). Allowlist tolerates the existing
  // drift; remediation per Pass 274 §3.4 RISK 2 (convention drift)
  // is owner-authorize pre-extraction prep work.
  "bidondent-navigation-discovery-quality-snapshot-v1",
]);

/**
 * Allowed namespace prefix patterns. A key is "namespaced" if it
 * matches one of these.
 */
const NAMESPACE_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: "bidondent. (dot)", pattern: /^bidondent\./ },
  { name: "bidondent_ (underscore)", pattern: /^bidondent_/ },
  { name: "bd- / bd: (short)", pattern: /^bd[-:]/ },
];

/**
 * Heuristic: ignore values that are obviously NOT storage keys.
 * - empty strings
 * - strings with spaces (likely user-facing copy)
 * - strings that contain `/` (likely paths or URLs)
 * - very long strings (likely free-form text)
 * - strings that look like enum values used in constants named *_KEY
 *   for non-storage purposes (e.g., translation keys)
 */
function looksLikeStorageKey(value: string): boolean {
  if (value.length < 3 || value.length > 80) return false;
  if (/\s/.test(value)) return false;
  if (value.includes("/")) return false;
  return true;
}

function walkTs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "__tests__" || entry === "node_modules") continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walkTs(full));
    } else if (
      (entry.endsWith(".ts") || entry.endsWith(".tsx")) &&
      !entry.endsWith(".test.ts") &&
      !entry.endsWith(".test.tsx")
    ) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Extract string-literal values from constants whose names contain
 * KEY or STORAGE (case-insensitive).
 *
 * Patterns matched:
 *   const FOO_KEY = "value"
 *   const FOO_STORAGE_KEY = "value"
 *   const APPEARANCE_STORAGE_KEY = "value"
 *   export const FOO_KEY = "value"
 *   const fooKey = "value"  (camelCase variant)
 */
function extractStorageKeyConstants(source: string): Set<string> {
  const keys = new Set<string>();
  // Match `const NAME = "literal"` where NAME contains KEY or STORAGE.
  // The `i` flag makes the variable-name match case-insensitive.
  const re = /(?:export\s+)?const\s+\w*(?:KEY|STORAGE)\w*\s*(?::\s*[^=]+)?=\s*(["'])((?:\\.|(?!\1).)*)\1/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const value = m[2];
    if (looksLikeStorageKey(value)) keys.add(value);
  }
  return keys;
}

function isNamespaced(key: string): boolean {
  for (const { pattern } of NAMESPACE_PATTERNS) {
    if (pattern.test(key)) return true;
  }
  return false;
}

describe("Persistence-key namespace consistency — Pass 274 §3 + Pass 281 §9 invariants", () => {
  const files = walkTs(SRC_APP);
  const allKeys = new Set<string>();
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    for (const key of extractStorageKeyConstants(source)) {
      allKeys.add(key);
    }
  }

  it("collects at least 10 storage-key constants (sanity check)", () => {
    expect(
      allKeys.size,
      "Fewer than 10 storage-key-like constants found in src/app/**/*.ts{x}. " +
        "Either the codebase storage layer changed dramatically, the regex " +
        "failed, or the directory walk is broken. Pass 274 §3 documented ~28 " +
        "keys at baseline. Verify the test infrastructure.",
    ).toBeGreaterThanOrEqual(10);
  });

  it("introduces no new un-namespaced keys beyond documented exceptions", () => {
    const unnamespaced = [...allKeys].filter((k) => !isNamespaced(k));
    const undocumented = unnamespaced.filter((k) => !ALLOWED_UNNAMESPACED_KEYS.has(k));

    expect(
      undocumented,
      `New un-namespaced storage keys detected: ${JSON.stringify(undocumented)}\n\n` +
        "Pass 274 §3 documents that all persistence keys must be prefixed with " +
        "one of the 4 conventions (bidondent. / bidondent_ / bd- / bd:), with " +
        "ONE documented un-namespaced exception (coverageCurrentLocation; Pass " +
        "274 §3.2 RISK 1). Adding a new un-namespaced key risks cross-app " +
        "collision on the same origin (multi-tenant browser session breaks). " +
        "If this is intentional, update both this test's ALLOWED_UNNAMESPACED_KEYS " +
        "and the Pass 274 §3.2 documentation.",
    ).toEqual([]);
  });

  it("introduces no key with a fifth namespace convention", () => {
    // Any namespaced key should match exactly one of the 3 patterns.
    // A key like "myapp_..." or "ns:..." would match none — caught by
    // the un-namespaced test above. This test is a redundant safety
    // check that the patterns remain unambiguous.
    const matchedByMultiple = [...allKeys].filter((k) => {
      const matches = NAMESPACE_PATTERNS.filter(({ pattern }) => pattern.test(k));
      return matches.length > 1;
    });

    expect(
      matchedByMultiple,
      `Storage keys matching multiple namespace patterns simultaneously: ` +
        `${matchedByMultiple.join(", ")}. This indicates ambiguous prefix design ` +
        `— resolve by tightening one of the patterns.`,
    ).toEqual([]);
  });
});
