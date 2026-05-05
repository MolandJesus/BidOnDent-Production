# Phase 6 — Landing + Dashboard Map Redesign Scope Contract (PLAN)

**Authority level:** PLAN — execution scope contract for Phase 6 of the v3.3 master plan.

**Last updated:** 2026-05-04

**Status:** **PRE-EXECUTION — AWAITING OWNER GREENLIGHT.** No code touched. Owner reads this contract end-to-end, answers the decision-point questions in §6, then either authorizes execution or sends the contract back for revision.

**Phase context:** [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) Phase 6 row. Largest visual scope on the v3.3 roadmap; needs an explicit scope contract before any code lands (mirrors the Phase 4 pattern in [`PLAN_PHASE_4_MOBILE_SWEEP.md`](PLAN_PHASE_4_MOBILE_SWEEP.md)).

**Companion docs:**

- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex design canon (LOCKED, structural). Authority for all visual decisions.
- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — Phase 6 targets L2 only; L3/L4 boundaries are Phase 8 territory.
- [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon Phase 6 must respect; CSS-first lock.
- [`OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md`](OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md) — Phase 5 diagnose; risks pulled from §5 below.
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-108–111 (architectural drift; Phase 8 refactor territory, NOT Phase 6).

---

## 1. Phase 6 product intent

User-visible problem: the **landing-page map preview** and the **dashboard map widgets** currently feel functionally complete but visually understated relative to the rest of the app. They are the surfaces a new user sees BEFORE they trust the product, and the surfaces a returning user sees FIRST when opening their dashboard. The visual story needs to match the premium glass + gold lamp identity locked in [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) and [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md).

What "redesign" means in this phase:

- **Visual lift** within the existing premium glass + cream/gold canon. NOT a new design system. NOT a new color.
- **Functional clarity** — the user should understand at a glance: "this is a service-area map," "this is my recent report," "this is a coverage preview." Today some of these read ambiguously.
- **Mobile + desktop parity** — Phase 4 established the touch-target floor; Phase 6 builds on it without re-litigating it.

What "redesign" does NOT mean:

- New product surfaces. No new map screens, no new dashboard widgets.
- Behavioral changes to routing/geocoding/navigation. Those are Phase 8 territory.
- Animation work beyond what [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) Phase 4.5 charter permits. Phase 6.5 owns the atmosphere pass.

---

## 2. In-scope surfaces

Specific files/components Phase 6 may modify:

### Landing-page map surfaces (~7 files)

| File                                                                                                                                | What Phase 6 touches                                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/app/components/landing/HeroSection.tsx`](../src/app/components/landing/HeroSection.tsx)                                       | Sample-quote map preview (the embedded `w-[480px]` desktop-only map at L178). Visual lift only. **NO structural extraction** (KI-107 grandfathering holds — owner-named only, not Phase 6 scope). |
| [`src/app/components/landing/CoverageBrowseExperience.tsx`](../src/app/components/landing/CoverageBrowseExperience.tsx)             | Coverage browse map experience visual treatment.                                                                                                                                                  |
| [`src/app/components/landing/CoverageBrowseMapOverlays.tsx`](../src/app/components/landing/CoverageBrowseMapOverlays.tsx)           | Map overlay chrome (badges, legends, status pills).                                                                                                                                               |
| [`src/app/components/landing/CoverageMapDialog.tsx`](../src/app/components/landing/CoverageMapDialog.tsx)                           | Coverage map dialog visual treatment.                                                                                                                                                             |
| [`src/app/components/landing/CoverageActiveNavigationLayout.tsx`](../src/app/components/landing/CoverageActiveNavigationLayout.tsx) | Active navigation layout visual treatment.                                                                                                                                                        |
| [`src/app/components/landing/coverageData.ts`](../src/app/components/landing/coverageData.ts)                                       | **Read-only.** Demo data already isolated per Map Master Plan; do not modify.                                                                                                                     |
| Adjacent landing styles in `src/styles/theme.css`                                                                                   | Only as needed for visual lift; no structural CSS rewrites.                                                                                                                                       |

### Dashboard map surfaces (~5 files)

| File                                                                                                                    | What Phase 6 touches                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/app/components/dashboard/CustomerMapWidget.tsx`](../src/app/components/dashboard/CustomerMapWidget.tsx)           | Customer dashboard mini-map widget. Visual lift + responsive treatment.                                                                                                           |
| [`src/app/components/dashboard/ShopMapWidget.tsx`](../src/app/components/dashboard/ShopMapWidget.tsx)                   | Shop dashboard mini-map widget (placeholder per `PLAN_PRODUCT_FUTURE_CARDS.md` "Shop Map Intelligence"). Visual lift only; no functional buildout (that's the future card's job). |
| [`src/app/components/dashboard/InsurerMapWidget.tsx`](../src/app/components/dashboard/InsurerMapWidget.tsx)             | Insurer dashboard mini-map widget (placeholder per same card). Visual lift only.                                                                                                  |
| [`src/app/components/dashboard/DashboardCoveragePanel.tsx`](../src/app/components/dashboard/DashboardCoveragePanel.tsx) | Dashboard coverage panel visual treatment. **NB:** has 4 L2→L4 imports (KI-108). Touch the visual layer only; the L4 imports stay.                                                |
| [`src/app/components/maps/mapSurfaceTheme.ts`](../src/app/components/maps/mapSurfaceTheme.ts)                           | Token tweaks if visual lift requires; no structural rewrites.                                                                                                                     |

### What does NOT make the in-scope list (firewalled to other phases)

- Any `MapLibreReportLayer.tsx` / `MapLibreServiceCoverageMap.tsx` / planner subtree work — Phase 7 territory (bids/report/shop/insurer maps).
- Any command-center subtree (`components/maps/command-center/*`) — Phase 7+ territory.
- Any navigation subtree (`components/maps/navigation/*`) — Phase 7+ territory.
- Any `services/*` change — Phase 8 territory (KI-108–111).
- Any new keyframes / animations — Phase 6.5 territory.
- Any new MOLANDJESUS entry — locked apex; controlled-edit clause not expected to fire.

---

## 3. Out-of-scope (the firewall)

Hitting any of these halts the sweep and asks owner. Verbatim clauses:

> **Zero L3/L4 boundary work. Any L2→L4 import encountered — leave it. Phase 8 owns it. If urge to fix arises, stop and ask.**

> **Zero refactor of existing hooks/services. Visual + functional changes only on the in-scope surface list.**

> **MOLANDJESUS structural lock holds. Controlled-edit clause requires `docs(canon):` + phase citation if invoked.** This phase is NOT expected to require canon edits. If a visual decision feels canon-worthy, write it in a Phase 6 cluster commit's prose first; only invoke controlled-edit if the decision is durable across phases.

> **Animation work follows [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md): CSS-first, no framer-motion, prefers-reduced-motion guard mandatory.** New keyframes added in Phase 6 must include their reduce-motion guard in the same commit. No "we'll add the guard later." Phase 4.6 framer-motion escape clause is NOT auto-fireable from Phase 6 — escape requires its own Phase 4.6 authorization.

Additional explicit hard stops:

- **No Phase 7 surface touches.** If a fix in `CoverageMapDialog` would benefit from a parallel fix in `MapLibreReportLayer`, the Phase 6 fix lands and the `MapLibreReportLayer` fix waits for Phase 7.
- **No HeroSection.tsx structural extraction.** KI-107 grandfathering rules. Phase 6 may touch the embedded map preview's visual lift INSIDE HeroSection, but does NOT extract it to a child component (that's owner-named refactor territory).
- **No new top-level deps.** No motion libs, no map libs, no theming libs. CSS-first, existing-token-only.
- **No copy edits.** Text content stays exactly as-is. If copy changes are warranted, they ride a separate non-Phase-6 commit.
- **No palette extensions.** Existing locked palette (warm gold + cool blue/cyan/indigo) is the universe of color decisions Phase 6 can use. No new tokens.
- **No file >600 LOC creations.** L2 hard budget per [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md). Existing grandfathered files (HeroSection, etc.) keep their P3 status.

---

## 4. Cluster breakdown

Proposed cluster ordering — Phase 4's pattern: cluster-by-cluster, one commit per cluster, owner-interruptible at every seam.

### Cluster 6A — Landing hero map preview (1–2 commits)

- **Goal:** Visual lift on HeroSection's sample-quote map preview. Premium glass surface treatment, cream/gold halo discipline, mobile + desktop parity.
- **Touches:** HeroSection.tsx (visual region only — NO structural extraction).
- **Estimated commits:** 1–2 depending on whether the embedded map preview's premium glass treatment lands cleanly in one pass.

### Cluster 6B — Coverage browse experience (2–3 commits)

- **Goal:** Visual lift on CoverageBrowseExperience + CoverageBrowseMapOverlays + CoverageMapDialog. Coherent overlay chrome (badges, legends, status pills) with the dashboard widgets.
- **Touches:** 3 landing/Coverage\* files, mapSurfaceTheme.ts if needed.
- **Estimated commits:** 2–3 (overlays + dialog + responsive polish).

### Cluster 6C — Active navigation layout (1 commit)

- **Goal:** CoverageActiveNavigationLayout visual treatment alignment with the rest of the coverage cluster.
- **Touches:** CoverageActiveNavigationLayout.tsx.
- **Estimated commits:** 1.

### Cluster 6D — Customer/Shop/Insurer map widgets (2–3 commits)

- **Goal:** Dashboard mini-map widgets get a coherent premium glass surface treatment. Customer widget gets functional polish (it's the widget with real data); Shop + Insurer get placeholder surface lift consistent with their "coming soon" status from PLAN_PRODUCT_FUTURE_CARDS.
- **Touches:** CustomerMapWidget, ShopMapWidget, InsurerMapWidget.
- **Estimated commits:** 2–3 (one per role widget OR one bundled commit + one polish).

### Cluster 6E — Dashboard coverage panel (1 commit)

- **Goal:** DashboardCoveragePanel visual treatment alignment with the role widgets.
- **Touches:** DashboardCoveragePanel.tsx (visual surface only — KI-108 L4 imports stay untouched).
- **Estimated commits:** 1.

### Phase 6 close (1 commit)

- **Goal:** Update [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) Phase 6 row to SHIPPED. Generate `docs/OPS_LANDING_DASHBOARD_MAP_REDESIGN_LOG.md` per the index pre-declaration. Mark this scope doc COMPLETE.
- **Touches:** PLAN_DOC_INDEX_BY_PHASE, new OPS log doc, this scope doc.
- **Estimated commits:** 1.

**Phase 6 estimated commit total: 8–11 commits.** Cluster cadence preserved across all clusters; AI_LOCK ride-along on every code commit per `LAW_LAYERED_ARCHITECTURE.md` multi-AI rules.

---

## 5. Risks pulled from Phase 5 diagnose

The Phase 5 audit ([`OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md`](OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md)) flagged ~30 L2→L4 direct imports. Phase 6 in-scope surfaces include several of those. **Touch the visual layer only; the L4 import stays.**

Specific risks:

| In-scope surface                                                       | KI / risk                                                                            | Phase 6 rule                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `DashboardCoveragePanel.tsx`                                           | KI-108: 4 L4 imports (savedLocations, navigationSession, voiceSupport, supabase/map) | Touch JSX + className + style only. Imports stay.                    |
| `CustomerMapWidget.tsx` / `ShopMapWidget.tsx` / `InsurerMapWidget.tsx` | KI-108: each imports `services/supabase/map` directly                                | Same rule. Imports stay.                                             |
| `CoverageMapDialog.tsx`                                                | KI-108: imports `services/navigation/voiceSupport`                                   | Same rule.                                                           |
| `CoverageBrowseExperience.tsx`                                         | KI-108: imports `services/navigation/voiceSupport`                                   | Same rule.                                                           |
| `CoverageActiveNavigationLayout.tsx`                                   | KI-108: imports `services/navigation/shareEta` + `services/supabase/map`             | Same rule.                                                           |
| `HeroSection.tsx`                                                      | KI-107: 1,110 LOC grandfathered                                                      | NO structural extraction. Visual lift only inside the existing file. |

**Discipline:** every Phase 6 cluster commit's diff should pass the test "could a reviewer point at any line and say 'this is a Phase 8 refactor disguised as a Phase 6 visual lift'?" If yes, that line backs out before commit.

---

## 6. Owner decision points (REQUIRED before Phase 6 execution)

Phase 6 needs the following questions answered before any cluster commits land. Owner can answer inline (paste back), in conversation, or by amending this doc directly.

1. **Hero sample-quote map preview ambition.** The current 480px embedded preview is desktop-only. Should Phase 6 add a mobile variant, or keep desktop-only? (Mobile variant = +1 commit, +30 min. Desktop-only = stays as-is.)
2. **Cluster sequencing preference.** Default proposed: 6A → 6B → 6C → 6D → 6E → close. Alternative: 6D first (dashboard widgets — most-used surface for returning users) then landing. Owner picks.
3. **Premium glass treatment depth.** Do dashboard widgets get the full 3-layer shadow stack from `LAW_PROJECT_RULES.md` "Premium Glass Body Opacity + Directional Backlight Canon," or a lighter touch (close + mid drop only, no directional backlight)? Full stack risks higher visual weight on the dashboard; lighter touch keeps widgets reading as "compact previews." Owner judgement.
4. **Shop + Insurer widget placeholder framing.** Both currently say "coming soon" structurally. Phase 6 visual lift can keep that framing OR raise their visual prominence (premium glass surface even though data is placeholder). Owner picks.
5. **Phase 6.5 trigger.** Phase 6 is purely visual + functional. Phase 6.5 is the atmosphere pass (parallax, idle drift, gold lamp breathing) per Phase 4.5 charter. Should Phase 6.5 auto-queue after Phase 6 close, or wait for separate authorization? Default: separate auth (re-authorization gate per v3.3 plan).
6. **Owner-named vs autopilot HeroSection touch.** KI-107 grandfathered HeroSection.tsx as "owner-named only" for refactor. Phase 6 visual lift does NOT refactor — but if the visual lift requires touching, say, the animated background layer or stats chips row, those are still inside the 1,110 LOC grandfathered file. Confirm: visual lift inside HeroSection is autopilot-OK as long as no extraction happens?

---

## 7. Success criteria

Phase 6 is "done" when ALL of the following hold:

- All cluster commits shipped (8–11 commits per §4 estimate).
- Build clean across every cluster commit (build verification per cluster).
- Mobile (375 / 390 / 414 viewports) + desktop visual verification per cluster (Chrome DevTools emulation; no real-device QA in scope).
- Zero new KI entries from Phase 6 work (any new bug discovered = halt + ask owner; "while we're here" fixes are forbidden).
- Zero L3/L4 boundary changes. Phase 5 diagnose's KI-108–111 are unchanged at Phase 6 close.
- `OPS_LANDING_DASHBOARD_MAP_REDESIGN_LOG.md` generated and lists every cluster commit with file-touched + visual-verification note.
- This scope doc updated to status COMPLETE.
- Re-authorization gate active for Phase 6.5+ per `LAW_LAYERED_ARCHITECTURE.md`.

If any of the above fails (build break, mobile regression, scope creep into Phase 7/8 territory, accidental KI-108 fix, etc.), Phase 6 stops at the failed cluster and asks owner. No silent rescue.

---

## 8. Rollback plan

If a Phase 6 cluster ships broken (build failure, visual regression, behavior change owner didn't approve):

1. **Single-cluster revert:** `git revert <cluster-commit-sha>` ships the inverse commit. Branch stays linear; no force-push. Build verifies green again post-revert.
2. **Multi-commit cluster revert:** if the cluster shipped over multiple commits (e.g. 6B's 2–3 commits), revert in reverse order — newest first, then walk back. Each revert is its own commit.
3. **Mid-cluster halt:** if the failure surfaces during cluster work but BEFORE commit, halt and uncommit any staged changes. No need for git revert; working tree returns to last-clean-cluster state.
4. **Cross-cluster contamination:** if a Phase 6 commit accidentally touches a Phase 7+ surface (e.g. a `MapLibreReportLayer.tsx` change snuck in), revert and re-do without that file. The discipline check from §5 catches this BEFORE commit; rollback is the safety net, not the primary defense.

`AI_LOCK.md` discipline holds during rollback — clear the lock if a multi-step rollback is in progress so the next session can pick up cleanly.

**No Phase 6 commit ships without first asking: "if this commit breaks, can I revert it cleanly?" If the answer is no (e.g. it bundled changes from multiple clusters), it doesn't ship.**

---

## Cross-references

- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 6 row updated this commit
- [`PLAN_PHASE_4_MOBILE_SWEEP.md`](PLAN_PHASE_4_MOBILE_SWEEP.md) — pattern this scope contract mirrors
- [`OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md`](OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md) — risks pulled from §5
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-107, KI-108, KI-109, KI-110, KI-111 (Phase 6 firewalls all of them)
- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — L2 layer Phase 6 targets; budgets enforced
- [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon Phase 6 must respect
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex visual canon (LOCKED, structural; controlled-edit clause not expected to fire in Phase 6)

---

**End of contract. Status PRE-EXECUTION. Awaiting owner greenlight on the 6 decision points in §6 before any cluster commit lands.**
