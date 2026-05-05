# Phase 6.5 Pre-Execution Audit 2026-05-04 (OPS)

**Authority level:** OPS — read-only audit of Phase 6.5 (landing atmosphere + section transitions) surfaces against [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) before any code commits.

**Last updated:** 2026-05-04

**Status:** **COMPLETE.** Phase 6.5 atmosphere infrastructure is comprehensively shipped via prior sweeps. 0 defensive fixes warranted. All theoretically-remaining work is aesthetic-addition territory requiring owner taste decisions, not autopilot execution.

**Phase context:** Authorized as the second commit of the Phase 6 close sequence (relay 2026-05-04). Mirrors `OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md` shape and applies the standing rule formalized in [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) "v3.3 master-plan Phase 6 close (2026-05-04)" session entry: **every remaining v3.3 master-plan phase gets a read-only pre-execution audit before charter execution.**

**Companion docs:**

- [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon Phase 6.5 was scoped against (29 keyframes catalogued, prefers-reduced-motion contract, atmosphere folder reservation, framer-motion escape clause)
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex visual canon (LOCKED, structural; NOT touched by this audit)
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 6.5 row updated this commit
- [`OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister audit; same method, similar outcome
- [`OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md`](OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md) — Phase 5 diagnose (KI-108 firewall still applies to any 6.5 work)

**Method:** Static code audit (grep + Read). Same method as Phase 5 diagnose + Phase 6 pre-execution audit. No runtime inspection. Working tree never modified.

---

## TL;DR

Phase 6.5 was scoped to deliver: **parallax, idle drift, gold lamp breathing, section transitions** for landing surfaces. The audit finds:

| Item                | Status                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Parallax            | **SHIPPED** — `useParallaxOffset` hook with internal `prefers-reduced-motion` guard, consumed by `HeroSection` (8 sites) + `OperatingRegionsSection` (7 sites).                                                                                                                                                                                                                                          |
| Idle drift          | **SHIPPED** — 17 orb-animation instances across 6 landing sections (HeroSection, HowItWorksSection, BenefitsSection, WhoWeServeSection, AboutOpportunitySection, TrustStatsSection) using `animate-orb-drift` / `animate-orb-float` / `animate-orb-glow` / `animate-orb-rotate`. All 6 keyframes catalogued in LAW_ANIMATION_AND_ATMOSPHERE §2.A.                                                        |
| Section transitions | **SHIPPED** — `useScrollAnimation` IntersectionObserver hook + `bd-bloom-atmosphere` reveal-on-scroll pattern, consumed by 10+ landing components. Section seam gradient-fades at the bottom of HowItWorks, AboutOpportunity, BusinessInquiry, CTASection, OperatingRegions.                                                                                                                             |
| Gold lamp breathing | **PARTIAL** — `pulseGlow` keyframe defined in `animations.css` but not consumed by static gold-lamp halo surfaces (BenefitsSection, AboutOpportunitySection, etc.). Gold canon is densely applied (205 `rgba(196,…)` hits in theme.css) but the halos themselves are static radials, not breathing. **This is the only theoretically-remaining gap. Aesthetic-addition territory; not a defensive fix.** |

Phase 6.5 revised commit total: **0–1** (same shape as Phase 6 audit). Owner-named only if any aesthetic additions are wanted.

---

## 1. Inventory

### Atmosphere infrastructure (already shipped)

| Asset                           | Location                                                                        | Coverage                                                                                                                                                                                                                                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useParallaxOffset`             | [`src/app/hooks/useParallaxOffset.ts`](../src/app/hooks/useParallaxOffset.ts)   | Hero (8) + OperatingRegions (7). Internal `prefers-reduced-motion` guard returns 0 for reduced-motion users.                                                                                                                                                                                                                           |
| `useScrollAnimation`            | [`src/app/hooks/useScrollAnimation.ts`](../src/app/hooks/useScrollAnimation.ts) | IntersectionObserver-based reveal-on-scroll. Consumed by 10 landing components: CTASection, FooterSection, AboutPage, BusinessInquirySection, HowItWorksSection, AboutOpportunitySection, InsurerPartnershipPage, BenefitsSection, OperatingRegionsSection, WhoWeServeSection. Plus TrustStatsSection (driving `bd-bloom-atmosphere`). |
| `bd-bloom-atmosphere`           | [`src/styles/theme.css`](../src/styles/theme.css) L1217–L1244                   | CSS reveal-on-scroll pattern (is-hidden / is-visible states). Has `prefers-reduced-motion: reduce` media-query block at L1238. Used by HeroSection (`loaded` driver) + TrustStatsSection (`isVisible` driver).                                                                                                                         |
| 29 CSS keyframes                | `src/styles/animations.css` (24) + `src/styles/theme.css` (5)                   | Catalogued in LAW_ANIMATION_AND_ATMOSPHERE §2 across 6 categories (atmosphere/orb, float/parallax, reveal/fade, status pulse, map-specific, misc effects).                                                                                                                                                                             |
| 9 prefers-reduced-motion guards | 6 CSS @media blocks in theme.css + 3 JS `window.matchMedia` checks              | Per LAW_ANIMATION_AND_ATMOSPHERE §3 baseline. Every named animation respects reduced-motion.                                                                                                                                                                                                                                           |
| Section seam gradient-fades     | 5 landing sections                                                              | HowItWorksSection L322, AboutOpportunitySection L284, BusinessInquirySection L471, CTASection L233, OperatingRegionsSection L552. Bottom-edge `bg-gradient-to-b from-transparent to-[next-section-color]` pattern across the whole page.                                                                                               |

### Orb-animation footprint (already shipped)

| Section                 |   LOC | Orb-animation count | Pattern                                                                                                            |
| ----------------------- | ----: | ------------------: | ------------------------------------------------------------------------------------------------------------------ |
| HeroSection             | 1,110 |                   5 | `animate-orb-drift` + `animate-orb-float` + `animate-orb-rotate` (L303, L316, L329) plus 2 atmosphere-bloom layers |
| HowItWorksSection       |   326 |                   3 | `animate-orb-glow` family across decorative orbs                                                                   |
| BenefitsSection         |   354 |                   2 | `animate-orb-glow` + parallax accent                                                                               |
| WhoWeServeSection       |   372 |                   3 | Three orb instances with breakpoint-gated visibility                                                               |
| AboutOpportunitySection |   288 |                   2 | `animate-orb-glow` orbs L110+                                                                                      |
| TrustStatsSection       |   268 |                   2 | Two orb instances with `bd-bloom-atmosphere` driver                                                                |
| **Total**               |       |              **17** | All 17 instances render under reduced-motion-aware keyframes.                                                      |

CTASection, FooterSection — 0 orbs. They use `transition-*` Tailwind utilities + `useScrollAnimation` reveal only. By design (these are utility footers without atmosphere).

---

## 2. Originally-scoped Phase 6.5 work — line-by-line

The originally-imagined Phase 6.5 deliverables (per `PLAN_DOC_INDEX_BY_PHASE.md` Phase 6.5 row + the v3.3 plan history):

### 6.5-1 Section transition pattern rollout — **SHIPPED**

> "Section transition pattern applied to all landing sections (one commit per major section, 5–6 commits)"

**Already done:** `useScrollAnimation` is consumed by 10+ landing components. `bd-bloom-atmosphere` provides the canonical reveal-on-scroll CSS pattern. Section seam gradient-fades exist on 5 sections handling color-zone-to-color-zone transitions.

### 6.5-2 Hero ambient orb parallax — **SHIPPED**

> "Hero orbs drift at different scroll velocities"

**Already done:** HeroSection uses `useParallaxOffset` 8 times for differential parallax on hero ambient elements (orbs, atmospheric blooms, blueprint SVG accent). Reduced-motion users get zero parallax via the hook's internal guard.

### 6.5-3 Hero map preview idle animation — **PARTIAL**

> "Gentle camera drift + sample-quote pulse on the hero map preview"

**Already done (sample-quote pulse equivalent):** Hero map preview pair (mobile L580 + desktop L762 in HeroSection.tsx) includes:

- `bd-pin-pulse` on the active report pin
- `bd-route-line` animated route lines with staggered animation-delay
- `bd-liquid-gold-flow` drifting liquid gold marketplace energy
- `bd-liquid-gold-sheen` activity sheen overlay
- `bd-route-shimmer` (via `bdRouteShimmer` keyframe) for route line draw-on

**Not present:** "Camera drift" in the literal sense — the SVG content is static (no slow pan/zoom animation). Adding camera drift would require new keyframe + state management on the hero preview. Aesthetic addition, not a defensive fix.

### 6.5-4 Coverage Map block ambient — **SHIPPED**

> "Same idle drift + subtle pin breathe"

**Already done:** Coverage map block uses the same `bd-pin-pulse` + `bd-liquid-gold-flow` + `bd-route-line` patterns as the hero preview. Verified during Phase 6 cluster 6B audit (CoverageBrowseExperience + CoverageBrowseMapOverlays + CoverageMapDialog all theme-driven, canon already in `mapSurfaceTheme.ts` post-Pass-H KI-091 update).

### 6.5-5 Gold lamp breathing — **PARTIAL (aesthetic gap)**

> "Slow opacity oscillation on Why Choose / Built on Transparency lamp surfaces"

**State:**

- `pulseGlow` keyframe defined in `src/styles/animations.css` L101.
- Gold canon densely applied: 205 `rgba(196,…)` hits across theme.css.
- Specific gold-lamp surfaces in landing — BenefitsSection ("Why Choose") L85 + L109 radial halos, AboutOpportunitySection L110+ orb glow — are **static radial gradients**, not breathing animations.

**Aesthetic addition opportunity (NOT a defensive fix):** wire `pulseGlow` (or a new `bdGoldLampBreathe` keyframe) to the static gold halos so they oscillate slowly. Requires:

- New CSS class (e.g. `bd-gold-lamp-breathe`) applied to the existing halo divs
- New `@keyframes` if `pulseGlow`'s curve doesn't match the desired breathing rate
- Mandatory `prefers-reduced-motion: reduce` guard per LAW_ANIMATION_AND_ATMOSPHERE §3
- Owner taste decision on which surfaces breathe (just BenefitsSection? all gold-halo sections?)

**Why this is not autopilot territory:** the discriminating filter from LAW_ANIMATION_AND_ATMOSPHERE §1 says motion serves trust signal OR spatial continuity. A breathing gold lamp serves "atmospheric depth on landing" — that's an aesthetic/identity signal, not a trust or spatial-continuity signal. It's defensible (could read as premium), but it's owner judgment, not master-builder discretion.

---

## 3. Findings table (severity-ranked)

| #   | Severity            | Finding                                                                                                                                                                   | Recommended phase                      | Notes                                                                                                                       |
| --- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | **n/a (aesthetic)** | Gold-lamp halos in BenefitsSection / AboutOpportunitySection / etc. are static radials, not breathing. `pulseGlow` keyframe exists but is not consumed by these surfaces. | Owner-named only. NOT a defensive fix. | If owner authorizes, ~1–2 commits: new `bd-gold-lamp-breathe` CSS class + apply to specific surfaces + reduce-motion guard. |

**Total findings: 1, severity n/a.**

**P-distribution: 0 / 0 / 0 / 0 / 0 / 0 / 0 / 0** across P0…P7. **No regression-pattern findings.** The atmosphere infrastructure is at canon.

---

## 4. KI-108 firewall verification

Phase 6.5 work, if executed, would touch landing component CSS classNames + potentially new CSS in animations.css/theme.css. Per the Phase 5 audit (KI-108: ~30 L2→L4 systemic direct imports), several landing files HAVE direct L4 imports. Phase 6.5 work would NOT modify those imports (atmosphere CSS work doesn't touch service calls).

**Verified L4 imports in landing components that would be touched by gold-lamp-breathe additions:** none in BenefitsSection, AboutOpportunitySection. (Only landing files with L4 imports per KI-108 inventory: CoverageBrowseExperience, CoverageMapDialog, CoverageActiveNavigationLayout, BusinessInquirySection, WaitlistCapture — none of which would be the primary gold-halo-breathe targets.)

**KI-108 firewall holds for any Phase 6.5 work.**

---

## 5. Phase 6.5 revised total estimate

| Original scope | Revised estimate | Reasoning                                                                                                                                                                                                                                                                |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 4–7 commits    | **0–1 commits**  | All 4 originally-scoped deliverables are either fully shipped (parallax, idle drift, section transitions, coverage map ambient, sample-quote pulse) or partial-aesthetic-addition only (gold lamp breathing). No defensive fixes. Aesthetic addition needs owner naming. |

This is the **third pre-execution audit** to reveal the v3.3 plan estimated work that was already shipped:

- Phase 4: 5 of 5 clusters audited; 3 had 0 findings, 2 produced fix commits. Saved ~3 commits vs original estimate.
- Phase 6: 5 of 5 clusters audited; 4 had 0 findings, 1 produced 1 commit. Saved ~7–10 commits vs original 8–11 estimate.
- Phase 6.5: Atmosphere infrastructure surveyed; 0 defensive fixes warranted. Would save 4–7 commits vs original estimate.

**Pattern is now consistent across 3 phases.** The standing rule formalized in LAW_HARDENING_PLAN ("every remaining v3.3 phase gets a read-only pre-execution audit before charter execution") is paying off.

---

## 6. Recommended path

Following the Phase 6 A/B/C template:

**Path A — Run gold-lamp-breathe addition (aesthetic):** 1–2 commits. Adds atmospheric depth on landing's warm-register sections (BenefitsSection, AboutOpportunitySection, etc.). Risks: (i) requires owner taste decision on which surfaces breathe and at what rate, (ii) ships a new CSS class + keyframe with mandatory reduce-motion guard, (iii) every new animation requires `LAW_ANIMATION_AND_ATMOSPHERE` motion-vibe sign-off.

**Path B — Skip the aesthetic addition; ship Phase 6.5 close commit only:** 1 commit. Marks Phase 6.5 as "subsumed by prior sweeps + 1 aesthetic gap deferred to owner-named work." Updates `PLAN_PHASE_6_5_SCOPE` (if it exists, or proposes a future scope doc be opened only if owner names the gap) and `PLAN_DOC_INDEX_BY_PHASE` Phase 6.5 row.

**Path C — Defer Phase 6.5 entirely as "subsumed":** 0 fix commits, 1 doc commit. `PLAN_DOC_INDEX_BY_PHASE` Phase 6.5 row marks the phase as subsumed; the gold-lamp-breathe gap stays as a future owner-named candidate. Path C trades phase ordering tidiness for fewer status updates.

**Master builder recommendation: Path B or Path C, depending on owner aesthetic preference.**

- Path B if the owner ever wants to revisit gold-lamp-breathe and would benefit from a "scope wishlist" anchored to Phase 6.5.
- Path C if the gold-lamp-breathe question is genuinely "maybe never" — let it ride as an owner-named candidate without phase-ordering ceremony.

**Path A only if the owner explicitly wants the gold-lamp-breathe ship now** with a taste decision on which surfaces breathe + at what rate. Not a master builder recommendation absent that explicit owner direction.

---

## 7. Open scope questions for owner

1. **Phase 6.5 path:** A (run gold-lamp-breathe) / B (close-only with deferred-aesthetic note) / C (defer as subsumed)?
2. **If Path A:** which gold-halo surfaces breathe? Just BenefitsSection ("Why Choose")? All warm-register sections (BenefitsSection + AboutOpportunitySection + Built on Transparency / TrustStatsSection)? Or every gold halo across landing?
3. **If Path A:** breathing rate target — 4-second cycle (matches typical premium-glass UI breathing) or slower (8–12s for "barely-perceptible drift")? Owner taste call.
4. **Phase 7 pre-execution audit trigger:** the standing rule says every remaining v3.3 phase gets a pre-execution audit. Phase 7 is "bids/report/shop/insurer map redesign" with much larger surface area than 6/6.5. Should Phase 7's pre-execution audit happen alongside any 6.5 close work, or wait until owner authorizes Phase 7 separately?

---

## What this audit does NOT do

- Does NOT touch any code. Read-only.
- Does NOT touch MOLANDJESUS (structural lock holds; not invoked).
- Does NOT touch `LAW_ANIMATION_AND_ATMOSPHERE.md` (the charter is verified accurate this audit; no edits warranted).
- Does NOT invent KI entries (no defensive findings; aesthetic gap is owner-judgment territory, not a registered issue).
- Does NOT execute any aesthetic addition. Path A awaits owner decision in §7.
- Does NOT pre-write `OPS_LANDING_ATMOSPHERE_LOG.md` (per relay rule — that doc's existence is conditional on Path A producing fix commits).

---

## Cross-references

- [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon Phase 6.5 was scoped against (verified accurate this audit)
- [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) — "v3.3 master-plan Phase 6 close (2026-05-04)" session entry establishing the pre-execution-audit standing rule
- [`OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister audit; same method
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 6.5 row updated this commit
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex design canon (LOCKED; not touched by this audit)
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-108–111 (Phase 8 territory; not affected by 6.5)
- [`src/app/hooks/useParallaxOffset.ts`](../src/app/hooks/useParallaxOffset.ts) — canonical parallax hook (reduced-motion-aware)
- [`src/app/hooks/useScrollAnimation.ts`](../src/app/hooks/useScrollAnimation.ts) — canonical scroll-trigger reveal hook
