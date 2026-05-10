/**
 * Pass 238 — Reduced-motion contract CI promotion.
 *
 * Promotes the CSS-keyframe reduce-motion audit
 * (`scripts/audit-reduced-motion.mjs`) from manually invoked
 * (Pass 71 baseline) to vitest-integrated, so it runs on every
 * `npm test` and any CI lane that runs `npm test`. Also adds a
 * JSX-side companion audit that catches the OTHER half of the
 * LAW_ANIMATION_AND_ATMOSPHERE §3 contract: Tailwind transition
 * utilities (`animate-in` / `animate-out`) must be paired with
 * `motion-reduce:` in the same className expression.
 *
 * Scope (Phase 2 / Pass 238):
 *   - Test 1: spawns the existing CSS audit script. Pass on
 *     exit 0. No script behavior change.
 *   - Test 2: scans every src/app/**\/*.tsx for occurrences of
 *     `animate-in` / `animate-out` and asserts each occurrence
 *     has a `motion-reduce:` token within a small line window
 *     (same-line className expressions, or the same multi-line
 *     className/template-literal span). Today's baseline already
 *     pairs every such occurrence — this test pins the baseline
 *     and prevents future drift.
 *
 * Out of scope (Phase 2):
 *   - Indicator utilities (`animate-spin` / `animate-pulse` /
 *     `animate-ping` / `animate-bounce`). These have a partial
 *     pairing rate today; bringing them to 100% is a separate,
 *     non-Phase-2 sweep. Adding them here would convert
 *     characterization into a behavior change.
 *
 * Doctrine:
 *   - "Characterize before normalize." This file pins the
 *     existing baseline. It does not introduce normalization.
 *   - "Reduced-motion inheritance must be explicit, not
 *     implicit." Every motion utility must opt out, not inherit.
 *
 * References:
 *   - docs/LAW_ANIMATION_AND_ATMOSPHERE.md §3
 *   - scripts/audit-reduced-motion.mjs (Pass 71, KI-139)
 *   - docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md (Pass 237
 *     companion — the same Engine 3 tooltip animation pinned here
 *     was pinned source-locally by Pass 236 motion tests)
 */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// vitest runs from the repo root, so process.cwd() is the project
// root. Resolving from there avoids `import.meta.url` scheme issues
// some vitest transforms surface for files under src/.
const REPO_ROOT = process.cwd();
const SRC_APP = resolve(REPO_ROOT, "src", "app");
const AUDIT_SCRIPT = resolve(REPO_ROOT, "scripts", "audit-reduced-motion.mjs");

/**
 * Directories excluded from the JSX `animate-in / animate-out`
 * audit. Each exclusion is a CHARACTERIZED GAP, not an
 * exemption from LAW_ANIMATION_AND_ATMOSPHERE §3.
 *
 * - `src/app/components/ui` — vendored shadcn/ui primitives
 *   (12 files: alert-dialog, context-menu, dialog, drawer,
 *   dropdown-menu, hover-card, menubar, navigation-menu, popover,
 *   select, sheet, tooltip). Each consumes Radix `data-state`
 *   transitions via Tailwind utility classes that lack a
 *   `motion-reduce:` partner. The fix is a single sweep across the
 *   primitives + a verification that consumers carry the opt-out
 *   at the call site. Tracked as KI in REF_KNOWN_ISSUES.md and
 *   staged for a non-Phase-2 sweep. Excluded here so the audit
 *   pins the BidOnDent-authored surfaces (which DO carry the
 *   opt-out) and surfaces any future drift in those surfaces.
 */
const EXCLUDED_DIRS = ["src/app/components/ui"].map((p) => resolve(REPO_ROOT, p));

function isExcluded(file: string): boolean {
  return EXCLUDED_DIRS.some((dir) => file === dir || file.startsWith(`${dir}/`));
}

function walkTsx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = `${dir}/${entry}`;
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkTsx(full));
    else if (entry.endsWith(".tsx")) out.push(full);
  }
  return out;
}

describe("Reduced-motion contract — Pass 238 CI promotion", () => {
  it("CSS keyframe audit script exits 0 (every keyframe has reduce-motion guard)", () => {
    // execFileSync throws on non-zero exit. Capturing stdout keeps
    // the vitest output clean while letting the failure path surface
    // the script's own diagnostics on stderr if it ever regresses.
    const stdout = execFileSync("node", [AUDIT_SCRIPT], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    expect(stdout).toMatch(/reduced-motion audit:/);
    expect(stdout).toMatch(/\/\d+\s+keyframes have full guard coverage/);
  });

  it("every Tailwind animate-in / animate-out class is paired with motion-reduce: opt-out", () => {
    const motionRegex = /\banimate-(?:in|out)\b/;
    const offenders: Array<{ file: string; line: number; snippet: string }> = [];

    for (const file of walkTsx(SRC_APP)) {
      // Skip test files — fixtures, regex literals, and source-text
      // assertions in tests legitimately mention `animate-in` without
      // a `motion-reduce:` partner.
      if (file.endsWith(".test.tsx") || file.endsWith(".test.ts")) continue;
      // Skip characterized-gap directories (see EXCLUDED_DIRS comment).
      if (isExcluded(file)) continue;

      const content = readFileSync(file, "utf8");
      const lines = content.split("\n");

      for (let i = 0; i < lines.length; i++) {
        if (!motionRegex.test(lines[i])) continue;
        // Use a small window to catch className expressions split
        // across template-literal lines or `cn(...)` joins. 5 lines
        // before/after is wide enough for current call-site shapes
        // and narrow enough to avoid false negatives from unrelated
        // `motion-reduce:` usages elsewhere on the same component.
        const start = Math.max(0, i - 5);
        const end = Math.min(lines.length, i + 5);
        const window = lines.slice(start, end).join("\n");
        if (!/motion-reduce:/.test(window)) {
          offenders.push({
            file: file.replace(`${REPO_ROOT}/`, ""),
            line: i + 1,
            snippet: lines[i].trim().slice(0, 140),
          });
        }
      }
    }

    if (offenders.length > 0) {
      const msg = offenders.map((o) => `  ${o.file}:${o.line}\n    ${o.snippet}`).join("\n");
      throw new Error(
        `${offenders.length} Tailwind animate-in/out occurrence(s) lack a nearby ` +
          `motion-reduce: opt-out:\n${msg}\n\n` +
          `Fix: add \`motion-reduce:animate-none\` to the same className expression. ` +
          `LAW_ANIMATION_AND_ATMOSPHERE §3.`
      );
    }

    expect(offenders).toEqual([]);
  });
});
