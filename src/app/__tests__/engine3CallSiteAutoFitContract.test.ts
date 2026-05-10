/**
 * Engine 3 — call-site `autoFit` explicitization contract.
 *
 * Pass 243 (Phase 3A sub-pass C readiness) CI invariant.
 *
 * What this test locks
 * --------------------
 * Pass 241 introduced the explicit `autoFit` prop on
 * `MapLibreDashboardMapPreview` (Engine 3). Pass 242 audited every
 * production call site and added `autoFit="always"` at the five
 * accessible sites (one is owner-dirty and tracked separately).
 *
 * The doctrinal value of that audit is fragile under code drift:
 * if a future contributor adds a new `<DashboardMapPreview>` site
 * without declaring `autoFit`, the silent fit-driven default
 * re-emerges and the KI-181 hidden-authority surface widens
 * again. This invariant catches that drift at CI time.
 *
 * What this test does NOT do
 * --------------------------
 * - It does NOT assert any specific `autoFit` value. Sites may
 *   legitimately use `"always"`, `"when-no-caller-bounds"`, or
 *   `"never"` depending on intent. The contract is *explicit
 *   declaration*, not a specific value.
 * - It does NOT run on test files. Vitest renders pass props
 *   dynamically via JSX spread or partial overrides, and the
 *   contract is a *production* surface lock.
 * - It does NOT modify behavior. It is a pure source-text
 *   invariant.
 *
 * Owner-dirty exclusion
 * ---------------------
 * `src/app/components/dashboard/ShopMapWidget.tsx` is on the
 * Phase 2/3 hard-stop list (owner-dirty). It is NOT yet
 * audited. The exclusion is itself an inventoried gap (see
 * `docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md` §12.2 row 6).
 * When the file is released, this exclusion must be removed in
 * the same pass that adds the `autoFit` declaration there.
 *
 * Cross-references
 * ----------------
 * - `docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md` (Pass 237
 *   design + Pass 241/242 landing log under §12)
 * - `src/app/components/dashboard/MapLibreDashboardMapPreview.tsx`
 *   (the renderer; Pass 241 added the prop)
 * - `src/app/components/dashboard/MapLibreDashboardMapPreview.motion.test.tsx`
 *   (renderer-level behavior tests for the four autoFit branches)
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = process.cwd();
const SRC_APP = resolve(REPO_ROOT, "src", "app");

/**
 * Owner-dirty exclusion list. Each entry is an inventoried gap
 * tracked in REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md §12.2.
 * Removing an entry from this list MUST be paired with adding
 * an explicit `autoFit` declaration to the corresponding call
 * site in the same pass.
 */
const OWNER_DIRTY_EXCLUSIONS = new Set<string>([
  resolve(SRC_APP, "components", "dashboard", "ShopMapWidget.tsx"),
]);

function walkTsx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = `${dir}/${entry}`;
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkTsx(full));
    else if (entry.endsWith(".tsx") && !entry.endsWith(".test.tsx")) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Find every JSX opening tag of `<DashboardMapPreview>` (the
 * import alias used at every accessible call site) or
 * `<MapLibreDashboardMapPreview>` (the canonical name) in the
 * given source. Returns the slice from `<` to the matching `>`
 * or `/>` so we can assert on the prop set within.
 *
 * Implementation note: this is a deliberately small regex pass.
 * The renderer is a single component with a stable name and
 * import convention. A full JSX parse would be heavier than the
 * invariant warrants. If the convention ever broadens (e.g. a
 * `<DashboardMapPreview {...props} />` spread that hides the
 * autoFit declaration), this test will deliberately miss it —
 * which is acceptable because spread-based call sites are
 * explicitly forbidden by the §12.2 audit doctrine.
 */
function findCallSites(source: string): string[] {
  const out: string[] = [];
  const tagPattern = /<(?:DashboardMapPreview|MapLibreDashboardMapPreview)\b/g;
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(source)) !== null) {
    const start = match.index;
    // Find the closing of the JSX opening tag — either `/>` (self-
    // close) or the first `>` not inside a string. The renderer
    // is always self-closing today; we accept both for safety.
    let depth = 0;
    let i = start;
    let end = -1;
    while (i < source.length) {
      const ch = source[i];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      else if (depth === 0 && ch === ">") {
        end = i;
        break;
      }
      i++;
    }
    if (end !== -1) {
      out.push(source.slice(start, end + 1));
    }
  }
  return out;
}

describe("Engine 3 — call-site autoFit explicitization contract (Pass 243)", () => {
  const allTsx = walkTsx(SRC_APP);
  const callSitesByFile: Array<{ file: string; tags: string[] }> = [];
  for (const file of allTsx) {
    const source = readFileSync(file, "utf8");
    const tags = findCallSites(source);
    if (tags.length > 0) {
      callSitesByFile.push({ file, tags });
    }
  }

  it("discovers at least one call site (smoke test — guards against accidental rename)", () => {
    // If this fails, either the renderer was renamed (update the
    // regex in findCallSites) or every call site was deleted
    // (likely a regression worth investigating manually).
    expect(callSitesByFile.length).toBeGreaterThan(0);
  });

  it("every accessible call site declares autoFit explicitly", () => {
    const violations: string[] = [];
    for (const { file, tags } of callSitesByFile) {
      if (OWNER_DIRTY_EXCLUSIONS.has(file)) continue;
      // Skip the renderer's own source (the type definition,
      // not a call site). The renderer file declares the prop
      // in its function signature; it does not render itself.
      if (file.endsWith("MapLibreDashboardMapPreview.tsx")) continue;
      for (const tag of tags) {
        if (!/\bautoFit\s*=/.test(tag)) {
          const rel = file.slice(REPO_ROOT.length + 1);
          violations.push(`${rel}: ${tag.slice(0, 80).replace(/\s+/g, " ")}...`);
        }
      }
    }
    if (violations.length > 0) {
      const msg = [
        "The following <DashboardMapPreview> call sites omit the explicit",
        "autoFit prop. Pass 242 (Phase 3A sub-pass B) explicitized the",
        "Engine 3 fit-driven authority at every accessible call site to",
        "close the KI-181 hidden-authority surface. New call sites must",
        "follow suit. Pick one of:",
        '  - autoFit="always"             (current behavior; fit-driven)',
        '  - autoFit="never"              (caller-controlled framing)',
        '  - autoFit="when-no-caller-bounds" + callerBoundsExplicit',
        "Cross-ref: docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md §12.",
        "",
        ...violations,
      ].join("\n");
      throw new Error(msg);
    }
  });

  it("owner-dirty exclusions are still owner-dirty (force re-audit when released)", () => {
    // If an exclusion file no longer exists OR has been edited
    // since this test was written, the owner-dirty status may
    // have changed. This guard nudges the next pass to re-audit
    // and remove the exclusion. We test existence only — checking
    // mtime or content hash would be brittle across rebases.
    for (const file of OWNER_DIRTY_EXCLUSIONS) {
      const exists = (() => {
        try {
          statSync(file);
          return true;
        } catch {
          return false;
        }
      })();
      expect(
        exists,
        `Owner-dirty exclusion ${file} no longer exists — remove it from OWNER_DIRTY_EXCLUSIONS or update the path.`
      ).toBe(true);
    }
  });
});
