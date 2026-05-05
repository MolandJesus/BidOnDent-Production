# Phase 6 Pre-Execution Audit 2026-05-04 (OPS)

**Authority level:** OPS — read-only audit of Phase 6's remaining cluster surfaces (6B / 6C / 6D / 6E) to verify scope-contract assumptions before any code commits.

**Last updated:** 2026-05-04

**Status:** **COMPLETE.** All 4 clusters audited. Phase 6 scope shrinks dramatically — see §4.

**Phase context:** Authorized after Cluster 6A halt revealed the scope contract was built on a partially-wrong premise (decorative SVG conflated with hero map preview). Phase 4 lesson applied: cheap reconnaissance before expensive execution.

**Companion docs:**

- [`PLAN_PHASE_6_SCOPE.md`](PLAN_PHASE_6_SCOPE.md) — scope contract this audit measures against
- [`OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md`](OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md) — Phase 5 diagnose; KI-108 inventory referenced
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex design canon (LOCKED, structural; NOT touched)
- [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — Premium Glass + Premium Gold canon
- [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-108 (verified inventory matches reality this audit)

**Method:** Static code audit (grep + Read). Same method as Phase 5 diagnose. No runtime inspection. No screenshots. Working tree never modified.

---

## 1. Cluster 6A retrospective

**What was assumed:** The hero sample-quote map preview was desktop-only, and a mobile variant was missing. Decision 1 in `PLAN_PHASE_6_SCOPE.md` §6 framed an A/B/C tradeoff between strict §1 conformance, Map-First override, or a static-element compromise.

**What's actually there:** `HeroSection.tsx` has TWO sample-quote map previews — both already at canon:

- **Mobile + tablet:** `block lg:hidden` element at L580–752. Stylized road network SVG, topographic contours (`bd-map-contour`), liquid gold flow (`bd-liquid-gold-flow`), route lines (`bd-route-line`), report pin with pulse (`bd-pin-pulse`), gold sheen (`bd-liquid-gold-sheen`), dual-source counter-glow (KI-074), Premium Glass shadow stack, glass overlay chrome (NY Coverage badge + Double-tap CTA). 200px height, optimized for mobile.
- **Desktop:** `hidden lg:block lg:w-[52%]` element at L762–end-of-hero. Same layered design language at 16:10 aspect ratio with 520px max-height. WebkitMaskImage taper at top edge. Inner edge bleed bridging rim light to atmosphere. Pass C 2026-05-03 work.

**Why the assumption was wrong:** The decorative blueprint SVG accent at L178 (`hidden md:block`, vehicle outline + dent hotspot + bid-route signal) was conflated with the actual map preview. Both the planner pre-read and the master builder caveat made this conflation. The decorative SVG IS desktop-only by design — it's atmospheric tracery, not a map. The actual map previews exist on both sizes.

**Reusable lesson for future scope contracts:** When auditing a file that contains multiple `hidden md:block` / `block lg:hidden` regions, enumerate ALL of them before assuming responsive coverage gaps. A grep for `hidden.*md:|md:hidden|sm:hidden|hidden.*lg:|lg:hidden` returns the full responsive footprint in one pass.

---

## 2. Cluster-by-cluster findings

### Cluster 6B — Coverage browse experience

**Surfaces audited:**

- [`src/app/components/landing/CoverageBrowseExperience.tsx`](../src/app/components/landing/CoverageBrowseExperience.tsx) (460 LOC)
- [`src/app/components/landing/CoverageBrowseMapOverlays.tsx`](../src/app/components/landing/CoverageBrowseMapOverlays.tsx) (247 LOC)
- [`src/app/components/landing/CoverageMapDialog.tsx`](../src/app/components/landing/CoverageMapDialog.tsx) (320 LOC)

**Current canon compliance:** All three files are **orchestrators or theme-driven views**, not direct visual content. Visual canon lives in delegated children.

| File                            | Pattern                     | Where the canon actually lives                                                                                                                                                                                                                                                                     |
| ------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CoverageBrowseExperience.tsx`  | Orchestrator                | Calls `getMapSurfaceTheme(tone, true)` and passes the theme to `ServiceCoverageMap` (Phase 7 territory) + `CoverageCommandCenterSidebar` (Phase 7 territory) + `CoverageBrowseSidebarContent` (NOT in 6B scope) + `CoverageBrowseMapOverlays`. This file does not render visual surfaces directly. |
| `CoverageBrowseMapOverlays.tsx` | Theme-driven overlay chrome | Reads `theme.metricLabelClassName`, `theme.softBadgeClassName`, `theme.secondaryTextClassName`, etc. The canon resolves through `mapSurfaceTheme.ts` (which sits in 6D scope and is already at canon — see Cluster 6D below).                                                                      |
| `CoverageMapDialog.tsx`         | Orchestrator wrapper        | Imports `CoverageBrowseExperience` + `CoverageActiveNavigationLayout` as children. Dialog plumbing only. No direct visual content.                                                                                                                                                                 |

**Genuine visual lift opportunities:** None. The visual canon Phase 6 was targeting already lives in `mapSurfaceTheme.ts` (verified at canon — see Cluster 6D) and is delegated through the theme system. Touching these orchestrators to "lift" their visual treatment would force the visual canon UP from `mapSurfaceTheme` into the orchestrators — which violates the design pattern these files were written against.

**Pass C / prior sweep coverage:**

- `CoverageBrowseExperience.tsx` references `getMapSurfaceTheme` and `CoverageBrowseSidebarContent` (Pass C era).
- `CoverageBrowseMapOverlays.tsx` is theme-driven from inception.
- `CoverageMapDialog.tsx` is dialog plumbing from earlier work.

**Estimated commit count:** **0** (was 2–3 in scope contract).

**L4 import surface area (KI-108 inventory verified):**

- `CoverageBrowseExperience.tsx`: 1 non-type L4 import (`primeVoiceEngine` from `services/navigation/voiceSupport`). Matches KI-108 inventory.
- `CoverageBrowseMapOverlays.tsx`: 0 L4 imports (clean).
- `CoverageMapDialog.tsx`: 1 non-type L4 import (`primeVoiceEngine`). Matches KI-108 inventory.

---

### Cluster 6C — Active navigation layout

**Surfaces audited:**

- [`src/app/components/landing/CoverageActiveNavigationLayout.tsx`](../src/app/components/landing/CoverageActiveNavigationLayout.tsx) (425 LOC)

**Current canon compliance:** **Orchestrator only.** Imports 4+ files from `components/maps/navigation/` subtree (Phase 7 territory) — `NavigationActionRail`, `NavigationActiveManeuverCard`, `NavigationActiveSpeedPanel`, `NavigationSummarySheet` — plus `ServiceCoverageMap` (Phase 7). The visual treatment lives in those out-of-scope children.

**Genuine visual lift opportunities:** None at the in-scope file level. The active-navigation visual canon lives in the navigation subtree (Phase 7).

**Pass C / prior sweep coverage:** Imports navigation subtree from prior phases. The orchestrator itself has been iteratively touched (KI-052 family share-eta cleanup landed here in Phase 2 commit `a693592d`).

**Estimated commit count:** **0** (was 1 in scope contract).

**L4 import surface area:** 2 non-type L4 imports (`shareNavigationEta` from `services/navigation/shareEta`, `haversineMiles` from `services/supabase/map`). Matches KI-108 inventory.

---

### Cluster 6D — Customer/Shop/Insurer map widgets + mapSurfaceTheme

**Surfaces audited:**

- [`src/app/components/dashboard/CustomerMapWidget.tsx`](../src/app/components/dashboard/CustomerMapWidget.tsx) (374 LOC)
- [`src/app/components/dashboard/ShopMapWidget.tsx`](../src/app/components/dashboard/ShopMapWidget.tsx) (243 LOC)
- [`src/app/components/dashboard/InsurerMapWidget.tsx`](../src/app/components/dashboard/InsurerMapWidget.tsx) (208 LOC)
- [`src/app/components/maps/mapSurfaceTheme.ts`](../src/app/components/maps/mapSurfaceTheme.ts) (225 LOC)

**Current canon compliance:** All four files **already at canon.**

**The three widgets** (Customer / Shop / Insurer) share a parallel structural pattern, all canon-applied:

- `isLight = appearanceMode === "light"` gating on every theme-aware className
- Canonical bd-\* utilities: `bd-dashboard-section--accent-cyan`, `bd-dashboard-section--accent-blue`, `bd-dashboard-section--accent-indigo`, `bd-dashboard-section--deep`, `bd-dashboard-chip`, `bd-dashboard-primary-button`, `bd-dashboard-secondary-button`
- Each widget consumes `MapLibreDashboardMapPreview` for the actual map render (NOT in 6D scope)
- 23 / 16 / 18 isLight + canon hits respectively (verified via grep)

**`mapSurfaceTheme.ts`** is THE source of truth for map-surface visual canon and was last updated **Pass H 2026-05-05 (KI-091)** — body opacity reset to canon range (0.84/0.76), directional top-cast champagne lamp added, internal gold radial reduced to 0.05 per LAW canon. Comments throughout reference LAW Premium Glass canon. **Definitively at canon.**

**Genuine visual lift opportunities:** None. The widgets are at the canon Phase 6 was targeting. `mapSurfaceTheme.ts` was just refined 2 days before this audit.

**Pass C / prior sweep coverage:**

- All three widgets are post-Pass-C (the dashboard-widget pattern was a Pass C product).
- `mapSurfaceTheme.ts`: Pass H 2026-05-05 (KI-091) with explicit "canon adoption" comments.

**Per-cluster guard reminder (preserved from prior relay):** _"Cluster 6D: prioritize CustomerMapWidget visual lift; Shop + Insurer widgets get minimal placeholder polish only."_ — **MOOT.** All three are already at canon; no widget needs prioritization because none needs work.

**Estimated commit count:** **0** (was 2–3 in scope contract).

**L4 import surface area:**

- `CustomerMapWidget.tsx`: 1 import (`haversineMiles, zipToCoordinates` from `services/supabase/map`). Matches KI-108.
- `ShopMapWidget.tsx`: 1 import (`zipToCoordinates`). Matches KI-108.
- `InsurerMapWidget.tsx`: 1 import (`zipToCoordinates`). Matches KI-108.
- `mapSurfaceTheme.ts`: 0 L4 imports (it IS L1 design tokens; no service usage).

---

### Cluster 6E — DashboardCoveragePanel (with extra KI-108 firewall scrutiny)

**Surfaces audited:**

- [`src/app/components/dashboard/DashboardCoveragePanel.tsx`](../src/app/components/dashboard/DashboardCoveragePanel.tsx) (287 LOC)

**Current canon compliance:** **PARTIAL.** Uses canonical bd-\* utilities (`bd-dashboard-panel`, `bd-dashboard-section`, `bd-dashboard-chip`, `bd-dashboard-primary-button`, `bd-dashboard-secondary-button`) for surface treatment — those tokens handle theming via theme.css CSS custom properties. **However:** all text colors are hardcoded dark-mode-tuned without `isLight` gating:

```jsx
<h2 className="mt-3 text-2xl font-semibold text-slate-100">    // L164
<p className="mt-2 text-sm text-slate-300/80">                  // L165
<div className="text-xs uppercase tracking-[0.24em] text-slate-400/85">  // L183, 191, 197
<div className="mt-2 text-2xl font-semibold text-slate-100">   // L186, 194, 198
<span className="bd-dashboard-chip rounded-full px-3 py-1 text-sm text-slate-300">  // L208
<p className="mt-3 text-xs text-slate-500">                     // L241
```

**Genuine visual lift opportunity (potential, single-finding):** the hardcoded dark-mode text colors above MAY render too pale on `bd-dashboard-panel`'s cream/champagne light-mode surface — the same family of issue Phase 2 fixed in `InsurerClaimApprovalModal.tsx` (commit `2455c75c`). The Phase 2 pattern was: gate hardcoded text colors with `isLight ? "text-slate-900/800" : "text-slate-100/200"`.

**Whether this is a real visual regression** depends on what the `bd-dashboard-panel` cream surface looks like behind these text colors in light mode. Without runtime visual verification:

- If panel surface in light mode is sufficiently dark (e.g. champagne-cream that still has good contrast with text-slate-100): NO regression. `bd-dashboard-panel` theming may already handle text contrast via CSS-token override.
- If panel surface in light mode is light cream (e.g. ≥0.86 alpha cream + warm gold halo): regression — text-slate-100 reads as near-white-on-cream, low contrast.

**Recommendation:** Phase 6E commit gates the hardcoded text colors per the Phase 2 pattern as a **defensive fix**. Even if current appearance is acceptable on the dashboard's specific surface tone, gating to dark-default + light-override is the canonical pattern shipped across the codebase. Net code change: add `appearanceMode` prop (or equivalent) + 8–10 className edits to use `isLight` ternary. Estimated 1 commit.

**Cluster-specific guard preserved from prior relay:** _"Cluster 6E: extra firewall scrutiny on DashboardCoveragePanel — 4 L4 imports per KI-108. If any cluster 6E commit modifies imports, halt."_ The defensive fix described above touches text color classNames only. **Imports stay untouched** per KI-108 firewall.

**Pass C / prior sweep coverage:** This file has not been touched by the recent Phase 1.5/2/3/3.5/4/4.5/5 sweeps (last meaningful change is older, pre-Pass-C). It was visually adequate through prior dashboard work but was never explicitly re-audited for light-mode text-color readability after the Phase 2 insurer-modal pattern surfaced.

**Estimated commit count:** **0–1** (was 1 in scope contract). Conditional on owner answering decision-point question below.

**L4 import surface area (KI-108 inventory verified):** 4 non-type imports — `markRecentNavigationLocation`, `loadNavigationSession`, `primeVoiceEngine`, `haversineMiles`. Matches KI-108 inventory exactly. **No change to imports during any Phase 6 work.**

---

## 3. Cluster-specific guard reminders (preserved)

| Guard                                          | Status                                                     |
| ---------------------------------------------- | ---------------------------------------------------------- |
| 6D = CustomerMapWidget priority                | **MOOT** (all three widgets already at canon)              |
| 6E = DashboardCoveragePanel L4 import scrutiny | **PRESERVED** — applies to any 6E text-color defensive fix |
| Halt at 1,200 LOC for HeroSection              | **N/A** (Cluster 6A halted before any HeroSection touch)   |

---

## 4. Phase 6 revised total estimate

| Cluster                            | Original estimate | Audit finding                                                                                                    | Revised estimate |
| ---------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------- |
| 6A — Hero map preview              | 1–2 commits       | Both maps already at canon (Pass C 2026-05-03)                                                                   | **0**            |
| 6B — Coverage browse experience    | 2–3 commits       | Orchestrators + theme-driven; canon lives in delegated children                                                  | **0**            |
| 6C — Active navigation layout      | 1 commit          | Orchestrator only; canon in navigation subtree (Phase 7)                                                         | **0**            |
| 6D — Map widgets + mapSurfaceTheme | 2–3 commits       | All canon-applied; mapSurfaceTheme refined Pass H 2026-05-05                                                     | **0**            |
| 6E — DashboardCoveragePanel        | 1 commit          | Defensive light-mode text-color gating, conditional on owner approval                                            | **0–1**          |
| Phase 6 close                      | 1 commit          | If Phase 6 ships ≥1 fix commit, ship close + OPS log; if 0 fixes, ship a single phase-close-with-no-fixes commit | **1**            |

**Phase 6 revised total: 1–2 commits** (was 8–11).

This is the largest scope shrink the v3.3 plan has seen. Honest accounting: prior sweeps (Pass C 2026-05-03, Pass H 2026-05-05, Phase 4.5 charter shipped 2026-05-04, KI-091 canon adoption) consumed most of what Phase 6 was scoped to deliver. Phase 6 is functionally already done.

---

## 5. Recommended cluster execution order

Given the audit, "execute clusters in numeric order" is no longer the right ordering — most clusters have nothing to execute. New recommendation:

**Option A (smallest, recommended):** Skip 6A/6B/6C/6D entirely. Run only Cluster 6E (defensive text-color gating on DashboardCoveragePanel, conditional on owner decision below). Then ship Phase 6 close. **Total: 1–2 commits.**

**Option B (Phase 6 → close):** Skip all clusters. Ship Phase 6 close commit only, marking the phase complete based on this audit's finding that the work was already done. **Total: 1 commit.**

**Option C (defer Phase 6 entirely):** No commits. Mark Phase 6 status as "subsumed by prior sweeps" in `PLAN_DOC_INDEX_BY_PHASE.md` and `PLAN_PHASE_6_SCOPE.md`. Phase 6.5 (atmosphere) and Phase 7 (bids/report/shop/insurer maps) become the next active phases. **Total: 0 fix commits, 1 doc commit (status update).**

**Master builder recommendation: Option A.** The DashboardCoveragePanel defensive fix is a real, small, low-risk improvement that closes a Phase-2-pattern-style light-mode visibility risk. Worth one commit. Skipping it leaves a small but real risk on the surface that's also in KI-108's import-coupled territory — fixing it during Phase 6 (visual layer only, imports untouched) is the right window.

---

## 6. Open scope questions for owner

1. **Phase 6 execution path:** A (run 6E only), B (ship close commit only), or C (defer entirely)?
2. **DashboardCoveragePanel text-color defensive fix authorization:** Even if visual regression is borderline (depends on surface contrast), is the Phase 2-pattern gating worth shipping defensively? Pattern: add `appearanceMode` prop + 8–10 className edits with `isLight` ternaries. Imports untouched per KI-108 firewall.
3. **Phase 6 scope contract update:** This audit invalidates `PLAN_PHASE_6_SCOPE.md` Decisions 1, 2, 3, 4 (all pre-supposed visual work that doesn't exist) and §4 cluster breakdown (all original commit estimates were too high). Should the scope contract be:
   - Edited in place to reflect the new reality (small commit), OR
   - Marked superseded with a note pointing at this audit (small commit), OR
   - Left as historical artifact and unmodified?
4. **Phase 6.5 (atmosphere) trigger reassessment:** Original Decision 5 = "separate auth required." If Phase 6 ships 0–1 commits and the visual canon is already in place, Phase 6.5's atmosphere pass might find similarly little to do. Should Phase 6.5 also get a pre-execution audit before authorization?

---

## What this audit does NOT do

- Does NOT touch any code. Read-only.
- Does NOT touch MOLANDJESUS (structural lock holds; not invoked).
- Does NOT touch `PLAN_PHASE_6_SCOPE.md` (per relay rule — owner re-scopes).
- Does NOT invent new KI entries (KI-108 inventory verified, no new findings beyond the conditional 6E observation).
- Does NOT execute Cluster 6E. The defensive text-color fix awaits owner Decision in §6 question 2.

---

## Cross-references

- [`PLAN_PHASE_6_SCOPE.md`](PLAN_PHASE_6_SCOPE.md) — original scope contract (now invalidated by this audit; awaiting owner decision on update path)
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 6 row updated this commit to reference this audit
- [`OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md`](OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md) — Phase 5 diagnose; KI-108 import inventory verified against this audit's per-file checks
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-108 inventory matches reality across all 8 audited files
