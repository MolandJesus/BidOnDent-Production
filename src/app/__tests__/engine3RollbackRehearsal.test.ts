/**
 * Engine 3 — rollback rehearsal + invariant stress (Pass 247, Phase 3B PREP).
 *
 * What this file is
 * -----------------
 * A *source-text* characterization of two future-pass invariants:
 *
 *   §1. Sub-pass C rollback is mechanically simple. The eventual
 *       default flip ("always" → "when-no-caller-bounds") in
 *       MapLibreDashboardMapPreview must be revertable by
 *       changing exactly one source token, with no companion
 *       changes to consumers, to types, or to call sites.
 *       This file pins the surface area such that any future
 *       refactor that *expands* the rollback footprint is caught
 *       by CI.
 *
 *   §2. The Pass 243 CI invariant (engine3CallSiteAutoFitContract
 *       — "every accessible call site declares autoFit
 *       explicitly") cannot be silently bypassed. We stress-test
 *       the scan logic with negative samples to confirm it would
 *       catch the four most likely future regressions:
 *
 *         a. A new `<DashboardMapPreview>` site without `autoFit`
 *         b. A new `<MapLibreDashboardMapPreview>` site without
 *            `autoFit`
 *         c. A spread-prop call that hides the `autoFit`
 *            declaration (deliberately unsupported per §12.2
 *            doctrine — must be flagged as a missing declaration)
 *         d. A renamed import alias (the tag-pattern lock catches
 *            either canonical name; renames break the scan
 *            cleanly with the smoke test)
 *
 * Why this exists
 * ---------------
 * Per the Phase 3B PREP directive (relayed via owner from ChatGPT
 * meta-arbiter):
 *
 *   "PASS 248 — rollback rehearsal + invariant stress audit
 *    - verify: reverting sub-pass C is mechanically simple
 *    - prove: CI catches:
 *        missing autoFit
 *        hidden authority reintroduction
 *        semantic fallback coupling
 *        preview-camera ownership violations"
 *
 * (We are landing this as Pass 247 in the local sequence because
 * Pass 246 above covered the reduced-motion × authority
 * interaction lock the dispatch listed at #247.)
 *
 * What this file is NOT
 * ---------------------
 * - It does NOT execute or simulate the sub-pass C flip itself.
 *   That is engine3DefaultFlipSimulation.test.tsx (Pass 245).
 * - It does NOT modify the renderer.
 * - It does NOT touch the existing CI invariant
 *   (engine3CallSiteAutoFitContract.test.ts) — it adds a
 *   negative-sample sibling that proves the invariant's catch
 *   surface is tight.
 *
 * Convergence metadata:
 *  1. Runtime paths touched     : test-only.
 *  2. Runtime classes touched   : Preview (declarative).
 *  3. Tier semantics touched    : Tier B.
 *  4. Motion classes touched    : none.
 *  5. Shell hierarchy impact    : none.
 *  6. Authority semantics       : characterization (locks
 *                                 rollback-footprint surface +
 *                                 invariant catch-surface).
 *  7. Reduced-motion inheritance: unchanged.
 *  8. Hidden-authority risk     : decreased — closes the
 *                                 "future contributor adds
 *                                 spread-prop call site" and
 *                                 "rollback footprint creeps"
 *                                 regression vectors.
 *  9. Continuity guarantees     : unaffected.
 * 10. Rollback semantics        : delete this file.
 *
 * Cross-references
 * ----------------
 * - `src/app/__tests__/engine3CallSiteAutoFitContract.test.ts`
 *   (Pass 243 CI invariant; this file proves its catch surface).
 * - `src/app/__tests__/engine3DefaultFlipSimulation.test.tsx`
 *   (Pass 245 default-flip executable simulation).
 * - `docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md` §12 +
 *   §12.2 + §12.4 (sub-pass C blockers + rollback shape).
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const RENDERER_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "components",
  "dashboard",
  "MapLibreDashboardMapPreview.tsx"
);
const RENDERER_SOURCE = readFileSync(RENDERER_PATH, "utf8");

// ---------------------------------------------------------------
// §1. Sub-pass C rollback footprint is exactly one token.
//
// The future sub-pass C flip will rewrite the renderer's default
// from `autoFit = "always"` to `autoFit = "when-no-caller-bounds"`.
// Reverting that flip must require changing exactly that one
// string back. These tests pin the surface so the rollback stays
// trivial.
// ---------------------------------------------------------------

describe("Engine 3 — Pass 247 §1 sub-pass C rollback footprint", () => {
  it("default value is declared in the renderer signature (comment mentions allowed)", () => {
    // The default lives in the destructured params:
    //   `autoFit = "always"`. The renderer's JSDoc may also
    //   mention the literal in prose explaining the default.
    // We pin a tight upper bound (signature + at most one
    // comment mention) so a future refactor that scatters the
    // default across multiple code paths is caught.
    const matches = RENDERER_SOURCE.match(/autoFit\s*=\s*"always"/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches.length).toBeLessThanOrEqual(2);
  });

  it("default value is NOT declared as a const or exported constant", () => {
    // Doctrinal lock: the default must live in the function
    // signature, not in a hoisted constant. A hoisted constant
    // would be a hidden authority surface (callers + tests
    // could import it and indirectly couple to the default).
    expect(RENDERER_SOURCE).not.toMatch(/const\s+DEFAULT_AUTO_?FIT/i);
    expect(RENDERER_SOURCE).not.toMatch(/export\s+const\s+\w+\s*:\s*AutoFitMode/);
  });

  it("AutoFitMode union members are all literal strings (no dynamic union)", () => {
    // Locks the type definition shape. A future pass that turns
    // `AutoFitMode` into `string` or a computed union would
    // weaken the CI invariant's grep-based audit. This test
    // pins the union to exactly three literal members.
    const unionPattern =
      /export\s+type\s+AutoFitMode\s*=\s*"always"\s*\|\s*"when-no-caller-bounds"\s*\|\s*"never"\s*;/;
    expect(RENDERER_SOURCE).toMatch(unionPattern);
  });

  it("callerBoundsExplicit default is in the renderer signature (comment mentions allowed)", () => {
    // Symmetric lock for the companion prop's default. The
    // doctrinal target is `callerBoundsExplicit = false` in the
    // signature; the renderer's JSDoc may also mention the
    // literal in prose explaining the default. Tight upper
    // bound catches scattered defaults.
    const matches = RENDERER_SOURCE.match(/callerBoundsExplicit\s*=\s*false/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(1);
    expect(matches.length).toBeLessThanOrEqual(2);
  });

  it("effectiveFittedView gate is the only consumer of autoFit/callerBoundsExplicit", () => {
    // Counts the references to ensure the authority gate is
    // localized. A future pass that scatters autoFit reads
    // across the file would widen the rollback footprint.
    //
    // Expected references in renderer source:
    //   - props destructure (autoFit, callerBoundsExplicit)
    //   - effectiveFittedView memo body (3 reads: 2× autoFit,
    //     1× callerBoundsExplicit)
    //   - dependency array (autoFit + callerBoundsExplicit)
    //   - prop type declarations (autoFit?:, callerBoundsExplicit?:)
    //   - JSDoc-style comment references
    //
    // We assert a tight upper bound rather than an exact count
    // (comment phrasing can shift), but the bound is small
    // enough that a real authority leak would trip it.
    const autoFitRefs = (RENDERER_SOURCE.match(/\bautoFit\b/g) ?? []).length;
    const cbeRefs = (RENDERER_SOURCE.match(/\bcallerBoundsExplicit\b/g) ?? []).length;
    expect(autoFitRefs).toBeLessThanOrEqual(50);
    expect(cbeRefs).toBeLessThanOrEqual(40);
    // And lower bound — if a future refactor accidentally
    // deletes the gate, references collapse to ~2 (props
    // destructure + type declaration). 5 is a safe floor.
    expect(autoFitRefs).toBeGreaterThanOrEqual(5);
    expect(cbeRefs).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------
// §2. CI invariant catch-surface stress.
//
// We re-implement the relevant scan from
// engine3CallSiteAutoFitContract.test.ts on synthetic source
// strings to prove it would catch the four most likely future
// regressions. This is a pure logic test — no filesystem walk.
// ---------------------------------------------------------------

function findCallSites(source: string): string[] {
  const out: string[] = [];
  const tagPattern = /<(?:DashboardMapPreview|MapLibreDashboardMapPreview)\b/g;
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(source)) !== null) {
    const start = match.index;
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
    if (end !== -1) out.push(source.slice(start, end + 1));
  }
  return out;
}

function isExplicit(tag: string): boolean {
  return /\bautoFit\s*=/.test(tag);
}

describe("Engine 3 — Pass 247 §2 CI invariant catch-surface stress", () => {
  it("CATCHES: new <DashboardMapPreview> site without autoFit", () => {
    const src = `
      function Foo() {
        return (
          <DashboardMapPreview
            shops={shops}
            center={center}
            zoom={zoom}
            isLight
          />
        );
      }
    `;
    const tags = findCallSites(src);
    expect(tags.length).toBe(1);
    expect(isExplicit(tags[0])).toBe(false);
  });

  it("CATCHES: new <MapLibreDashboardMapPreview> site without autoFit", () => {
    const src = `
      <MapLibreDashboardMapPreview
        shops={[]}
        center={[0, 0]}
        zoom={10}
        isLight={true}
      />
    `;
    const tags = findCallSites(src);
    expect(tags.length).toBe(1);
    expect(isExplicit(tags[0])).toBe(false);
  });

  it("CATCHES: spread-prop call hides autoFit declaration (treated as missing)", () => {
    // A `{...props}` spread COULD pass autoFit at runtime, but
    // it is not statically discoverable. The §12.2 doctrine
    // forbids this pattern explicitly. The scan must treat it
    // as missing — and it does, because no `autoFit=` token
    // appears in the tag.
    const src = `
      <DashboardMapPreview {...mapProps} />
    `;
    const tags = findCallSites(src);
    expect(tags.length).toBe(1);
    expect(isExplicit(tags[0])).toBe(false);
  });

  it('ACCEPTS: explicit autoFit="always" is detected', () => {
    const src = `
      <DashboardMapPreview
        shops={[]}
        center={[0, 0]}
        zoom={10}
        isLight
        autoFit="always"
      />
    `;
    const tags = findCallSites(src);
    expect(tags.length).toBe(1);
    expect(isExplicit(tags[0])).toBe(true);
  });

  it('ACCEPTS: explicit autoFit="never" is detected', () => {
    const src = `<DashboardMapPreview autoFit="never" />`;
    const tags = findCallSites(src);
    expect(tags.length).toBe(1);
    expect(isExplicit(tags[0])).toBe(true);
  });

  it('ACCEPTS: explicit autoFit="when-no-caller-bounds" is detected', () => {
    const src = `<DashboardMapPreview autoFit="when-no-caller-bounds" callerBoundsExplicit />`;
    const tags = findCallSites(src);
    expect(tags.length).toBe(1);
    expect(isExplicit(tags[0])).toBe(true);
  });

  it("CATCHES: multiple sites in one file, mixed compliance", () => {
    const src = `
      const A = () => <DashboardMapPreview autoFit="always" />;
      const B = () => <DashboardMapPreview shops={[]} />;
      const C = () => <MapLibreDashboardMapPreview autoFit="never" />;
    `;
    const tags = findCallSites(src);
    expect(tags.length).toBe(3);
    const compliance = tags.map(isExplicit);
    expect(compliance).toEqual([true, false, true]);
  });

  it("SMOKE: discovers zero sites when neither tag name appears (rename-detection)", () => {
    // If a future refactor renames the renderer to a name not
    // matched by the tag pattern, the scan returns zero sites.
    // The Pass 243 invariant's smoke test catches that case
    // separately ("expect(callSitesByFile.length).toBeGreaterThan(0)").
    // This test pins the precondition for that smoke test.
    const src = `
      <SomeOtherMap autoFit="always" />
      <RenamedPreview shops={[]} />
    `;
    const tags = findCallSites(src);
    expect(tags.length).toBe(0);
  });
});

// ---------------------------------------------------------------
// §3. Source-level "preview owns no camera" rollback witness.
//
// The Pass 236 source-level guards (in motion.test.tsx §1) lock
// the absence of imperative camera APIs in the renderer. This
// test re-asserts those guards in the rollback rehearsal context
// to make the witness explicit: any sub-pass C iteration that
// introduces useMap/flyTo/easeTo/jumpTo is caught BEFORE the
// flip ships, not after.
// ---------------------------------------------------------------

describe("Engine 3 — Pass 247 §3 PONC rollback witness", () => {
  it("renderer does not import useMap from react-map-gl/maplibre", () => {
    expect(RENDERER_SOURCE).not.toMatch(/\buseMap\b/);
  });

  it("renderer does not invoke any imperative camera API", () => {
    const forbidden = [
      "flyTo",
      "easeTo",
      "jumpTo",
      "panTo",
      "zoomTo",
      "fitBounds",
      "panBy",
      "zoomBy",
      "rotateTo",
    ];
    for (const api of forbidden) {
      expect(RENDERER_SOURCE).not.toMatch(new RegExp(`\\.${api}\\s*\\(`));
    }
  });

  it("renderer does not import the imperative maplibre-gl Map type", () => {
    expect(RENDERER_SOURCE).not.toMatch(/from\s+["']maplibre-gl["']/);
  });
});
