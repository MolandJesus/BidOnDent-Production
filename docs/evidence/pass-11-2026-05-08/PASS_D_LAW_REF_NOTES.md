# Pass D — LAW + REF Guardrails Cross-Reference (Co-Worker AI)

**Author:** Co-worker AI (Cowork session, full folder access).
**Date:** 2026-05-08, post-commit `193f914b`.
**Purpose:** Pre-stage the LAW + REF constraints that govern any dashboard-fullscreen-first map-shell migration ("Pass D"), independent of how master builder resolves the §1.4 / §1.5 engine-wrapper fork. Content-neutral on engine count.
**Audience:** future Pass D plan-doc draft (mine), parallel co-worker session migration drafts (Tracks 2/3), audit AI next-pass dispatch.

---

## §1. Layer placement (LAW_LAYERED_ARCHITECTURE.md)

| New file (anticipated) | Layer | Folder | Soft / Hard budget |
|---|---|---|---|
| `MapProgramShell.tsx` | L2 (composed UI) | `src/app/components/maps/shell/` | 400 / 600 |
| `MapEngineCanvas.tsx` (per Pass 180 §7.1) | L2-with-L4-spirit | `src/app/components/maps/engine/` (NOT `services/` — must render JSX) | 400 / 600 |
| `MapProgramTopBar.tsx` (Step A) | L2 | `src/app/components/maps/shell/` | 400 / 600 (target ~150-250) |
| `MapProgramUtilityCluster.tsx` (Step B) | L2 | `src/app/components/maps/shell/` | 400 / 600 |

**`atmosphere/` folder is RESERVED — empty until Phase 8.5.** Pass D may NOT create files there per LAW_ANIMATION_AND_ATMOSPHERE.md §4. Map-shell motion composes from existing keyframes + `motion/react` envelope (see §3 below).

**Forbidden cross-layer flows that Pass D must respect:**
- L2 → L4 direct: shell components NEVER call `services/*` directly. Must go through L3 hooks (`useShopDirectoryNavigation`, `useCoverageNavigationExperience`, etc.).
- L1 → L2: shell components compose `bd-*` primitives (`bd-glass-card--map`, `bd-notice--warn`); they cannot import L1 primitives that "know about which screens" use them — but the existing `bd-*` utilities in `src/styles/theme.css` are L1-clean.
- Service-shape leak: `MapEngineCanvas` does not import from `src/app/services/` — engine work is wrapped by hooks at the L3 boundary first.

**Grandfathered exception note:** `OperatingRegionsSection.tsx` is at 599 lines (per plan doc §1.3 / KI ledger), close to L2 hard limit 600. Pass D's Step E (when it eventually lands) MUST NOT push this file over 600. If host migration adds net positive lines, split a child component out instead per LAW migration policy.

---

## §2. Apex design canon (MOLANDJESUS_DESIGN_DECISIONS.md)

**Structural lock:** do NOT propose merges, splits, archives, renames, or restructuring of this doc. Cross-refs always point INTO it; Pass D plan doc cites it as authority, never edits it.

**Constraints Pass D must preserve:**

1. **Breathing room first.** Applies especially to dashboard + map overlays (§1). The legend collapse fix (KI-164/166) directly serves this rule — compresses a 20% viewport eater to a 44px pill.
2. **Three layers of information** (§1): Surface (essential signal) / Next step (summary, options) / Deep detail (full content). Map shell must preserve this hierarchy — top bar = surface, slot panels = next step, modals/sheets = deep detail.
3. **Animations are not decoration** (§1). Every Pass D motion class (legend collapse/expand, status-pill enter/exit, marker enter/exit) must justify on trust-signal or spatial-continuity grounds.
4. **Things we will NOT do** (§9):
   - No racing/kitsch automotive decoration on map chrome.
   - No literal Apple Maps homage (tile palette, control shape, marker styling).
   - No applying the landing automotive register to dashboard surfaces (sedan silhouettes, lane dashes, road-line patterns, Direction C luminance, warm-amber INFILL on cards). Warm-amber TRIM + lamp glow IS permitted on dashboard.
   - "Do not change the map glass system just to try something new." Pass D shell extraction must preserve the existing `bd-glass-card--map` material treatment.

---

## §3. Animation / atmosphere contract (LAW_ANIMATION_AND_ATMOSPHERE.md)

**30 unique keyframes total** (29 catalogued 2026-05-04 + `bdTileFade` added 2026-05-07 Pass 93). Pass D motion vocabulary defaults to:

1. The 30 canonical keyframes (in `animations.css` + `theme.css`).
2. New CSS keyframes in `animations.css` / `theme.css` (with mandatory reduce-guard).
3. Tailwind `transition-*` utilities for state transitions.
4. `useParallaxOffset` (or equivalent vanilla hook) for orchestration CSS cannot express.
5. `motion/react` ONLY within the established envelope: stateful enter/exit via `AnimatePresence`, gesture micro-interactions (`whileTap`/`whileHover`/`whileFocus`), drag/swipe on bottom sheets.

**`prefers-reduced-motion: reduce` contract — REQUIRED, library-agnostic.** Every new motion in Pass D needs:
- CSS path: `@media (prefers-reduced-motion: reduce) { animation: none; }` or duration → `0.001ms`.
- `motion/react` path: `useReducedMotion()` short-circuit to static render.
- Verification: DevTools → Rendering → Emulate prefers-reduced-motion: reduce → confirm suppression.

**WAAPI vs CSS layering trap (KI-113 lesson):** WAAPI runtime motion and CSS `transition:` declarations are independent layers. Pass D shell's interactive states (hover, focus, focus-visible, active) MUST have `@media (prefers-reduced-motion: reduce)` overrides on the CSS side even if `motion/react` is also handling motion. Both layers respect reduce, or the contract is violated.

**Map-shell-specific motion classes that need reduce-coverage in Pass D:**
- Legend collapse/expand transition (KI-164/166 fix).
- Status-pill enter/exit (KI-172 banner becomes shell `statusPill` slot in Step D).
- Camera moves (Pass 166 smooth flyTo, Pass 171 upper-third pin-pan offset — engine-level, must survive `<MapEngineCanvas>` extraction).
- Marker enter/exit (engine-level).
- Compass enter/exit (Pass 172 immersive-fullscreen compass).

---

## §4. Storage + auth invariants (LAW_PROJECT_RULES.md)

Pass D is client-side only. The following invariants are NOT touched but the shell migration must not regress them:

1. **`verify_jwt: false` pin** on `[functions.server]` in `supabase/config.toml`. Shell refactor never touches edge functions; if any server change creeps in, the pin must be reasserted.
2. **Pointer-on-write / sign-on-read for media URLs.** Shell refactor must not start persisting signed URLs — none of the proposed shell slots own media-URL persistence; this is a watch rule, not an active change.
3. **Storage RLS deny-by-default.** Shell refactor doesn't touch storage policies; if a future slot needs direct-from-client uploads, separate policy work required.
4. **Light-Mode Surface Rule + Premium Gold Palette (LOCKED 2026-05-03).** Shell-level CSS must use the locked warm-tone values (`rgba(196, 144, 65)` halos, `rgba(196, 130, 45)` outer halos, `rgba(140, 82, 22)` trim, `rgba(252, 238-240, 204-208)` insets). Forbidden values (`rgba(220, 165, 90)`, `rgba(254, 248, 220)`, `rgba(160, 95, 25)`) must not return.
5. **Premium Glass body opacity invariants** (LAW 2026-05-04): light register 0.76-0.84, dark register 0.66-0.78. Shell glass surfaces inherit this range, never paint above 0.92 or below 0.62.
6. **Directional Backlight Canon — REQUIRED.** Premium glass cards use 3-layer shadow stack (close edge halo + mid spread + DIRECTIONAL top-cast champagne-gold at `0 -28 to -44px`). Forbidden: omnidirectional `0 0 X-large` ≥120px far-ambient. Shell card surfaces inherit this canon.

---

## §5. Verification protocol (REF_AI_BROWSER_NAVIGATION.md)

Pass D smoke-test instructions MUST follow the canonical flow:

**Browser-test target:** `http://localhost:5173/`, started with `npm run dev:local-browser` (auto-wires Vite to local Docker Supabase via `supabase status -o env`).

**Required navigation:**
1. Authenticated landing return → BidOnDent logo flow (selectors order: `aria-label="Open dashboard home"` → `header button[aria-label="Back to top"]` → `header button:has-text("BidOnDent")`). NEVER `page.goto("/")` for return flow.
2. Dashboard Smart Shop Map entry → use the explicit Smart Shop Map / Directions entry point. Verify `Smart Shop Map` heading + search/origin shell + map surface.
3. Active navigation audit → use existing route preview + `Start Navigation`. Verify `Next maneuver` overlay + guidance card + right action rail.

**Required screenshot set for any map-UI-changing pass (Pass D qualifies):**
1-7. Landing coverage section + Full map (Search / Explore / Saved / Shops) + Dashboard inline + Dashboard immersive/fullscreen.
8-10. Route preview + active navigation + pin popup (if changed).

**Mobile add-on:** ~390px CSS width + 487px breakpoint, both light + dark, capture map remains visible (not buried by sheets).

**Pass D-specific verification additions:**
- KI-164/166 closure: legend collapsed-by-default at 1440×900 + 1280×800 + 390×844. Toggle expands via `▼ legend`. localStorage `bd:map:legend:expanded` = "false" / null → collapsed; "true" → expanded.
- KI-172 banner preserved through statusPill slot relocation (Step D, not Pass D — but shell extraction must not break it).
- Pass 166 smooth flyTo timing recorded pre/post `<MapEngineCanvas>` extraction (engine-level — survival check).

---

## §6. Multi-AI coordination (AI_LOCK.md + REF_AI_COLLABORATION_PROTOCOL.md)

**File-touch claims for Pass D:** any session opening Pass D MUST update AI_LOCK.md in the same commit listing:
- Active branch
- Active AI (cowork-A / cowork-B / audit-AI / master-builder)
- Active layer (L2 for shell + canvas extraction)
- Locked files: `MapProgramShell.tsx`, `MapEngineCanvas.tsx`, `MapPaneLegendPanel.tsx` (or whichever subset), plus the dashboard host file (TBD per §1.4 fork)

**Hard stops for Pass D (no AI proceeds):**
- LAW conflicts.
- Destructive data changes.
- Auth/storage invariants.
- Schema migrations applied.
- Provider changes.
- Deploy/secret actions.
- Overwriting unrelated work.
- Structural changes to MOLANDJESUS_DESIGN_DECISIONS.md.

**Layer-isolation rule:** one AI per layer per session. Pass D is L2 work; no parallel L2 work allowed during Pass D.

**Charter changes (LAW tier):** Opus-only. Pass D doesn't touch LAW; if a discovered constraint requires LAW amendment, that's a separate Opus pass.

---

## §7. Independent of §1.4 / §1.5 engine-wrapper fork

This notes file is content-neutral on whether master builder picks (a), (b), or (c) on the engine-wrapper fork. The constraints above apply regardless of:
- Whether the dashboard-fullscreen surface uses `MapLibreServiceCoverageMap`, `MapLibreShopDirectoryMapPane`, or `MapLibreDashboardMapPreview`.
- Whether `<MapProgramShell>` ends up with one shared `<MapEngineCanvas>` consumer or multiple per-engine canvas slots.
- Whether Step C and Step F of the plan doc merge or stay sequenced.

When master builder responds, this notes file gets cited by the full Pass D plan doc and by parallel co-worker session migration drafts. Engine-count refinement (third engine `MapLibreDashboardMapPreview` flagged in evidence-refinement to audit AI 2026-05-08) does not invalidate any item above.

---

## Cross-references

- LAW_LAYERED_ARCHITECTURE.md (charter for layer placement)
- LAW_ANIMATION_AND_ATMOSPHERE.md (motion contract)
- LAW_PROJECT_RULES.md (storage/auth invariants, palette canon, premium glass canon)
- LAW_HARDENING_PLAN.md (current execution authority — Pass D must align with active hardening phase)
- MOLANDJESUS_DESIGN_DECISIONS.md (apex design canon — LOCKED, additive-only)
- REF_AI_BROWSER_NAVIGATION.md (verification protocol)
- REF_AI_COLLABORATION_PROTOCOL.md (multi-AI coordination)
- AI_LOCK.md (active session state)
- PLAN_MAP_UNIFICATION_2026-05-08.md (the parent plan doc; §1.4 / §1.5 fork pending master-builder reply)
- REF_KNOWN_ISSUES.md (KI-053, KI-075, KI-118, KI-140, KI-145, KI-147, KI-158, KI-161, KI-162, KI-163, KI-164, KI-165, KI-166, KI-167, KI-168, KI-169, KI-170, KI-171, KI-172, KI-175 [ETA suffix], KI-176 [maneuver gate])

---

**Notes file complete.** Ready for citation by Pass D plan-doc draft once master-builder fork response lands.
