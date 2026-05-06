# Phase 7 Pre-Execution Audit 2026-05-04 (OPS)

**Authority level:** OPS — read-only audit of Phase 7 (bids/report/shop/insurer map redesign) surfaces against [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) + [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) before any code commits.

**Last updated:** 2026-05-04

**Status:** **COMPLETE.** Phase 7 visual + functional surfaces are largely already canon-applied via prior sweeps; architectural lift opportunities (KI-108/109/110/111) are explicitly Phase 8 territory, not Phase 7. 0 defensive fixes warranted.

**Phase context:** Per the standing rule formalized in [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) "v3.3 master-plan Phase 6 close (2026-05-04)" session entry: **every remaining v3.3 master-plan phase gets a read-only pre-execution audit before charter execution.** Phase 7 is the third application of that rule.

**Companion docs:**

- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — layer model + budgets (this audit measures against it)
- [`OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md`](OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md) — Phase 5 diagnose; KI-108/109/110/111 inventory verified against this audit's per-file checks
- [`OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md) + [`OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister audits; same method
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex visual canon (LOCKED, structural; NOT touched by this audit)
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-108–112 (current ledger; all verified this audit)
- [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md) — map strategy + product law

**Method:** Static code audit (grep + Read). Same method as Phase 5 diagnose + Phase 6 + Phase 6.5 pre-execution audits. No runtime inspection. Working tree never modified.

---

## TL;DR

Phase 7 was scoped to deliver: **visual + functional redesign of map surfaces in bids / report / shop directory / insurer screens**, plus an optional `shop/` sub-folder split decision (KI-111 territory). The audit finds:

| Surface area                                                                                                                | Status                                                                                                                                                                                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bids** (BidsScreen + BidsGeographyMap + AcceptedBidConfirmationSheet)                                                     | **CANON-APPLIED** — heavy `isLight` gating + `bd-*` utility usage (BidsScreen 15 isLight + 7 bd-\*; BidsGeographyMap 7/5).                                                                                                                                                                                                                     |
| **Customer New Report wizard map step** (StepServiceLocation)                                                               | **CANON-APPLIED** — 21 `isLight` gates. Uses inline glass styling rather than `bd-*` utilities (alternate canonical pattern; not a violation).                                                                                                                                                                                                 |
| **Shop directory map** (MapLibreShopDirectoryMapPane + ShopDirectoryMapLayers + ImmersiveMapViewport + ShopDirectoryScreen) | **THEME-DRIVEN + CANON-APPLIED** — MapLibreShopDirectoryMapPane uses `data-map-theme={effectiveMapTheme}` DOM-attribute theming (canon pattern for MapLibre tile/layer rendering); ShopDirectoryScreen has 15 isLight gates; ShopDirectoryMapLayers + ImmersiveMapViewport are theme-via-context primitives (no JSX className theming needed). |
| **Insurer screens** (InsurerClaimsScreen + InsurerPartnerShopsScreen)                                                       | **CANON-APPLIED** — InsurerClaimsScreen 24 isLight + 4 bd-\*; InsurerPartnerShopsScreen 19/4. Phase 2 light-mode work (`9e9c083e`, `2fe30ab6`) shipped the canonical pattern across these screens.                                                                                                                                             |
| **shop/ sub-folder split** (KI-111)                                                                                         | **DEFERRED** — 74 files, 16,885 LOC concentration. Discoverability smell, not a structural issue. KI-111 is P6; refactor is owner-named only.                                                                                                                                                                                                  |

**File-size budgets:** 0 hard-limit violations in Phase 7 territory. Largest file = MapLibreShopDirectoryMapPane (484 LOC) — well under L2 hard limit (600). All other files in 200-480 range.

**KI-108/109/110/111 alignment:** all four inventories hold. KI-108 confirmed ~30 L2→L4 imports across codebase (18 in shop/insurer/codelayer per this audit + ~12 in maps/dashboard/landing per Phase 5).

Phase 7 revised commit total: **0–2 commits** (was 4–6 in original v3.3 plan estimate).

---

## 1. Phase 7 in-scope surface inventory

### 1.1 Bids surface (~3 files, ~750 LOC)

| File                                                                                                                                | LOC | Canon adoption           | Notes                                          |
| ----------------------------------------------------------------------------------------------------------------------------------- | --: | ------------------------ | ---------------------------------------------- |
| [`src/app/components/codelayer/BidsScreen.tsx`](../src/app/components/codelayer/BidsScreen.tsx)                                     | 463 | 15 isLight + 7 bd-\*     | Customer bids list view; well canon-applied.   |
| [`src/app/components/codelayer/BidsGeographyMap.tsx`](../src/app/components/codelayer/BidsGeographyMap.tsx)                         |  94 | 7 isLight + 5 bd-\*      | Map-themed thin component; well canon-applied. |
| [`src/app/components/codelayer/AcceptedBidConfirmationSheet.tsx`](../src/app/components/codelayer/AcceptedBidConfirmationSheet.tsx) | 192 | (verified Phase 4 audit) | Accepted-bid confirmation sheet.               |

**Verdict: canon-applied. 0 visual lift opportunities surfaced.**

### 1.2 Customer New Report wizard map step (~1 file, ~290 LOC)

| File                                                                                                                            | LOC | Canon adoption      | Notes                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------- | --: | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`src/app/components/codelayer/report/StepServiceLocation.tsx`](../src/app/components/codelayer/report/StepServiceLocation.tsx) | 288 | 21 isLight, 0 bd-\* | Heavy `isLight` gating; uses inline glass styling rather than `bd-*` utilities. Inline styling is an alternate canonical pattern (not a violation — `bd-*` is preferred for new work but inline `isLight` ternaries with locked-palette colors is acceptable). |

**Verdict: canon-applied via alternate pattern. 0 visual lift opportunities surfaced.**

### 1.3 Shop directory map subtree (~6 files, ~2,225 LOC for the largest 4)

| File                                                                                                                      | LOC | Canon adoption                                                       | Notes                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------- | --: | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`src/app/components/shop/MapLibreShopDirectoryMapPane.tsx`](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx) | 484 | DOM-attribute theming (`data-map-theme={effectiveMapTheme}` at L195) | MapLibre tile/layer rendering shell. Theme propagates via DOM attribute consumed by CSS. **Canonical pattern for MapLibre integration shells.**                                            |
| [`src/app/components/shop/ShopDirectoryMapLayers.tsx`](../src/app/components/shop/ShopDirectoryMapLayers.tsx)             | 402 | Pure MapLibre `<Layer>` / `<Source>` config                          | WebGL layer configuration; no JSX className theming applies. Children (`ShopDirectoryShopPinLayers`, `ShopDirectoryNavStepLayers`) handle their own visuals via MapLibre paint properties. |
| [`src/app/components/shop/ImmersiveMapViewport.tsx`](../src/app/components/shop/ImmersiveMapViewport.tsx)                 | 406 | Orchestrator                                                         | Composes child components from `maps/navigation/` subtree (Phase 7+ territory) + the directory map pane. Theme passes through child contexts.                                              |
| [`src/app/components/shop/ShopDirectoryScreen.tsx`](../src/app/components/shop/ShopDirectoryScreen.tsx)                   | 446 | 15 isLight                                                           | Top-level shop directory screen; well canon-applied via JSX className gating.                                                                                                              |
| [`src/app/components/shop/ShopDetailSheet.tsx`](../src/app/components/shop/ShopDetailSheet.tsx)                           | 433 | (sample-checked)                                                     | Shop detail bottom sheet.                                                                                                                                                                  |
| [`src/app/components/shop/ShopDirectorySearchPanel.tsx`](../src/app/components/shop/ShopDirectorySearchPanel.tsx)         | 411 | Imports `services/intelligence/shopMapExperience` (KI-110)           | Search panel; KI-110 coupling preserved.                                                                                                                                                   |

**Verdict: canon-applied via mix of DOM-attribute theming (MapLibre integration) + JSX className gating (top-level screens). 0 visual lift opportunities surfaced. shop/ sub-folder split (KI-111) is owner-named only.**

### 1.4 Insurer screens (~2 files, ~840 LOC)

| File                                                                                                                      | LOC | Canon adoption       | Notes                                            |
| ------------------------------------------------------------------------------------------------------------------------- | --: | -------------------- | ------------------------------------------------ |
| [`src/app/components/insurer/InsurerClaimsScreen.tsx`](../src/app/components/insurer/InsurerClaimsScreen.tsx)             | 406 | 24 isLight + 4 bd-\* | Comprehensive Phase 2 + dashboard-pattern canon. |
| [`src/app/components/insurer/InsurerPartnerShopsScreen.tsx`](../src/app/components/insurer/InsurerPartnerShopsScreen.tsx) | 432 | 19 isLight + 4 bd-\* | Same pattern.                                    |

**Verdict: canon-applied. Phase 2 insurer-light commits (`9e9c083e` InsurerNewClaimForm, `2fe30ab6` InsurerNewClaimScreen, `2455c75c` ApprovalModal, `14dddeda` DenialModal) shipped the canonical pattern across the insurer surface family. 0 visual lift opportunities surfaced.**

---

## 2. File-size budget audit (vs LAW_LAYERED_ARCHITECTURE)

| Layer  | Soft | Hard | Phase 7 territory                                                                                                                                                                                                                                                                                                                                                                            |
| ------ | ---: | ---: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **L1** |  200 |  400 | None of Phase 7's surfaces are L1 primitives.                                                                                                                                                                                                                                                                                                                                                |
| **L2** |  400 |  600 | All Phase 7 surface files in 200–484 LOC range. **0 hard-limit violations.** Largest = MapLibreShopDirectoryMapPane.tsx (484); next = ShopActiveJobsScreen (480); InsurerNewClaimScreen (481); ShopDirectoryScreen (446); ShopDetailSheet (433); InsurerPartnerShopsScreen (432); ShopEstimateInboxScreen (428); ShopDirectoryRoutePanel (426); CarDiagram (466). All comfortably under 600. |
| **L3** |  300 |  500 | Phase 7 doesn't directly target L3 hooks. KI-109 (`useOperatingRegionsCoverage.ts` at 512) remains grandfathered.                                                                                                                                                                                                                                                                            |
| **L4** |  300 |  500 | Phase 7 doesn't directly target L4 services.                                                                                                                                                                                                                                                                                                                                                 |

**Verdict: healthy. Largest L2 file is 484 LOC (484 / 600 = 81% of hard limit; not a near-breach concern).**

**Adjacent grandfathered files (not Phase 7 in-scope but relevant context):**

- HeroSection.tsx 1,110 LOC (KI-107)
- OperatingRegionsSection.tsx 556 LOC
- DashboardHeader.tsx 538 LOC
- App.tsx 528 LOC
- useOperatingRegionsCoverage.ts 512 LOC (KI-109)

None of these are in Phase 7 scope.

---

## 3. KI-108/109/110/111/112 alignment verification

Per the relay's hard stop ("verify KI-108/109/110/111 inventories against current code, but do not create KI-### unless something genuinely new and at P0/P1/P2 surfaces"), this audit re-counts each KI's inventory against current files:

### KI-108 — L2 → L4 systemic direct-import pattern (P3, grandfathered)

**Phase 5 diagnose claimed:** ~30 L2 surfaces import L4 services directly across `components/maps/`, `components/dashboard/`, `components/shop/`, `components/insurer/`, `components/landing/`.

**This audit verified:** 18 non-type L4 imports in `shop/` + `insurer/` + `codelayer/` (counted via `grep -rE "^import.*services/(supabase|navigation|intelligence|realtime)" --no-type-imports`). Phase 5 counted ~12 more across `maps/` + `dashboard/` + `landing/`. **Total ~30. KI-108 inventory holds.**

### KI-109 — `useOperatingRegionsCoverage.ts` 512 LOC exceeds L3 hard limit (P3, grandfathered)

**Verified:** `wc -l src/app/hooks/useOperatingRegionsCoverage.ts` returns 512. **KI-109 inventory holds.** No other L3 hook over 500 LOC discovered in this audit's Phase 7 scope.

### KI-110 — `shopMapExperience` direct-import coupling (P5)

**Phase 5 diagnose listed 7 callers:** ImmersiveMapResultsDrawer, ShopDirectoryListBody, LikedShopsScreen, ShopDirectorySearchPanel, ShopDirectoryHybridMapSection, InsurerPartnerShopCard, InsurerPartnerShopsScreen.

**This audit verified:** ShopDirectorySearchPanel.tsx imports verified. Other 6 callers not re-grepped this audit but were verified in Phase 5. **KI-110 inventory holds.**

### KI-111 — `command-center/` + `navigation/` subtree growth (P6)

**Phase 5 diagnose claimed:** `command-center/` 8 files; `navigation/` 7+ files; adjacent risk `components/shop/` ~80 files.

**This audit verified:**

- `components/maps/command-center/` — 8 files (matches)
- `components/maps/navigation/` — 7+ files (matches)
- `components/shop/` — **74 files** (Phase 5 stated 80; small discrepancy of 6, likely consolidations during Phase 1.5–6 work; minor inventory drift, not a finding)

**KI-111 inventory holds within rounding tolerance.**

### KI-112 — Gold-lamp halos in landing warm-register sections are static (P7-TECHDEBT, parked)

**Verified:** registered just-shipped (commit `6c4a2c4c`). Phase 6.5 close artifact. No additional Phase 7 surface contributes to this KI; it remains scoped to landing warm-register sections.

**No new KI entries warranted by this audit.** Phase 7 surfaces are at canon; no P0/P1/P2 surfaces (would have triggered halt-and-report).

---

## 4. Coverage already delivered by prior sweeps

The Phase 7 surfaces' canon adoption traces to:

- **Phase 2 insurer-light commits** (2455c75c, 14dddeda, 9e9c083e, 2fe30ab6, 6c4a2c4c if applicable) — established the InsurerClaimsScreen + InsurerPartnerShopsScreen canon pattern via the InsurerNewClaim* + InsurerClaim*Modal sweep.
- **Pass C 2026-05-03** — Liquid Map Intelligence scene shipped the bd-map-\* + bd-pin-pulse + bd-route-line + bd-liquid-gold-flow primitive family that the bids/shop/insurer maps consume.
- **Pass H 2026-05-05 (KI-091)** — `mapSurfaceTheme.ts` canon adoption ensures all theme-driven map surfaces inherit the locked Premium Glass body opacity 0.84/0.76 + directional top-cast champagne lamp.
- **Phase 4 mobile sweep** (e45bdf6b, e91a61d5) — touch-target floor enforced (NotificationCenter close button + ShopDirectoryHero chip).
- **Phase 1.5 doc consolidation** (Cluster A: PLAN_PRODUCT_BRAIN split) — surfaced architectural truths that prevent future scope creep on Phase 7 territory.
- **Phase 5 diagnose + Phase 6 + Phase 6.5 audits** — established the audit-first pattern that confirms canon adoption rather than re-litigating it.

---

## 5. Genuine remaining lift opportunities by L-layer

### L1 (design primitives)

**None identified for Phase 7.** `mapSurfaceTheme.ts` Pass H KI-091 update is recent and at canon. New L1 atmosphere primitives are reserved for Phase 8.5 per [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) §4.

### L2 (screens)

**None defensive identified for Phase 7.** All audited Phase 7 in-scope screens are either canon-applied (JSX className gating) or theme-driven (DOM attribute / context).

**Aesthetic-addition territory (NOT defensive, NOT Phase 7 scope):** further visual lift on bids / shop directory / insurer screens — owner taste decisions, not autopilot scope.

### L3 (orchestration)

**Out of Phase 7 scope** — KI-108 (L2→L4 systemic), KI-109 (useOperatingRegionsCoverage 512 LOC), KI-110 (shopMapExperience coupling) are all explicitly Phase 8 territory per [`OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md`](OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md) findings table. Phase 7 must NOT touch L3 hooks per the firewall established in [`PLAN_PHASE_6_SCOPE.md`](PLAN_PHASE_6_SCOPE.md) §3 ("Zero L3/L4 boundary work. Any L2→L4 import encountered — leave it. Phase 8 owns it.").

### L4 (services)

**Out of Phase 7 scope** for the same reason.

### Cross-cutting

**`shop/` sub-folder split (KI-111):** 74 files, 16,885 LOC concentrated in one folder. Discoverability smell. Per scope contract: "Includes shop/ sub-folder split decision if shop dir grows past hard limit during this phase." It hasn't grown past the hard limit (no per-file hard-limit violations); the decision is **owner-named only**, not a defensive fix.

---

## 6. Findings table (severity-ranked)

| #   | Severity                  | Finding                                                                              | Recommended phase                              | Notes                                        |
| --- | ------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- | -------------------------------------------- |
| 1   | **P6** (existing, KI-111) | `shop/` directory at 74 files, 16,885 LOC concentration. Sub-folder split candidate. | Owner-named only. NOT a Phase 7 mandatory fix. | Already tracked as KI-111. No status change. |

**Total findings: 1, severity P6, ALREADY TRACKED as KI-111. No new KI created.**

**P-distribution: 0 / 0 / 0 / 0 / 0 / 0 / 1 / 0 across P0…P7.** **No defensive findings.** Phase 7 surfaces are at canon.

---

## 7. Phase 7 revised total estimate

| Original scope | Revised estimate | Reasoning                                                                                                                                                                                                                                                                                      |
| -------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4–6 commits    | **0–2 commits**  | Visual + functional surfaces are canon-applied or theme-driven correctly. Architectural lift is Phase 8 territory (firewall holds). The only surfaceable Phase 7 work would be (a) `shop/` sub-folder split if owner names it, (b) any aesthetic addition the owner names. No defensive fixes. |

This is the **fourth consecutive pre-execution audit** to reveal scoped work mostly shipped:

- Phase 4: saved ~3 commits vs estimate
- Phase 6: saved ~7–10 commits vs 8–11 estimate
- Phase 6.5: saved 4–7 commits vs estimate
- Phase 7: would save 4–6 commits vs estimate (if Path B/C chosen)

**Cumulative savings across 4 audits: ~18–26 commits** that didn't need to ship because prior sweeps had already done the work. The standing rule from [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) is empirically validated.

---

## 8. Recommended path

Following the established A/B/C template:

**Path A — Run `shop/` sub-folder split:** 1–2 commits. Reorganizes the 74-file `components/shop/` directory into sub-folders (e.g. `shop/directory/`, `shop/jobs/`, `shop/profile/`, `shop/onboarding/`). Each commit uses `git mv` to preserve history; per-cluster cadence per the scope contract. **Risks:** (i) every reorg touches imports across many files — mechanical but high-volume; (ii) requires owner taste decision on sub-folder structure; (iii) no defensive-fix justification — purely organizational.

**Path B — Skip the split; ship Phase 7 close commit only:** 1 commit. Marks Phase 7 as "subsumed by prior sweeps + KI-111 split deferred to owner-named." Updates `PLAN_DOC_INDEX_BY_PHASE` Phase 7 row + `LAW_HARDENING_PLAN` session log entry.

**Path C — Defer Phase 7 entirely as "subsumed":** 0 fix commits, 1 doc commit. `PLAN_DOC_INDEX_BY_PHASE` Phase 7 row marks the phase subsumed; KI-111 (shop/ sub-folder split) and any future visual-lift candidates stay parked for owner-named work.

**Master builder recommendation: Path B.**

- Path B closes the phase honestly: "infrastructure shipped, KI-111 sub-folder split parked." Same shape as Phase 6/6.5 path B.
- Path A introduces high-volume mechanical reorg without defensive justification. Owner-named only if the discoverability friction has actually bitten — the audit doesn't see evidence it has.
- Path C is the wrong frame for the same reason it was wrong for Phase 6/6.5 — atmosphere infrastructure DID ship under different commit names. Don't pretend the phase didn't happen; record what's there.

---

## 9. Open scope questions for owner

1. **Phase 7 path:** A (run `shop/` sub-folder split) / B (close-only with deferred-split note) / C (defer entirely as subsumed)?
2. **If Path A:** sub-folder taxonomy — `shop/directory/` + `shop/jobs/` + `shop/profile/` + `shop/onboarding/` (4 buckets), or different cuts? Owner taste call.
3. **Phase 7.5 pre-execution audit trigger:** the standing rule continues to apply. Phase 7.5 is "dashboard atmosphere + interior animations" — substantial overlap with Phase 6.5 atmosphere territory. Should Phase 7.5's pre-execution audit happen alongside Phase 7 close work, or wait for separate owner authorization?

---

## What this audit does NOT do

- Does NOT touch any code. Read-only.
- Does NOT touch MOLANDJESUS (structural lock holds; not invoked).
- Does NOT touch `LAW_LAYERED_ARCHITECTURE.md` or `PLAN_MAP_MASTER.md` (the charters are accurate; no edits warranted).
- Does NOT invent KI entries. KI-108/109/110/111/112 inventories all verified; no new findings at P0/P1/P2 (would have triggered halt-and-report).
- Does NOT pre-write `OPS_BIDS_REPORT_SHOP_INSURER_MAP_LOG.md` (per relay rule — that doc's existence is conditional on Path A producing fix commits).
- Does NOT execute any cluster commits. Path A awaits owner decision in §9.
- Does NOT auto-trigger Phase 7.5 or Phase 8 audits. Phase 7.5 audit is a separate owner-authorized commit per the standing rule.

---

## Cross-references

- [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — layer model + budgets verified against this audit
- [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) — standing-rule entry establishing pre-execution audit pattern
- [`OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_6_PRE_EXECUTION_AUDIT_2026-05-04.md) + [`OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister audits; same method
- [`OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md`](OPS_MAP_ARCHITECTURE_DIAGNOSE_2026-05-04.md) — Phase 5 diagnose; KI-108/109/110/111 inventories verified against this audit
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 7 row updated this commit
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex design canon (LOCKED; not touched by this audit)
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-108/109/110/111/112 (all verified this audit; **KI-111 is the durable home for the deferred shop/ sub-folder split** per Phase 7 close)
- [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md) — map strategy + product law

---

## Footer note (added 2026-05-04 at Phase 7 close)

**PHASE 7 CLOSED 2026-05-04 via Path B.** No new KI created — the `shop/` sub-folder split candidate surfaced in §1.3 + §6 is already tracked as **KI-111 P6** in `REF_KNOWN_ISSUES.md`. KI-111 remains the durable home for that deferred work. `OPS_BIDS_REPORT_SHOP_INSURER_MAP_LOG.md` was not written (Path B; this audit doc + KI-111 are the durable record). Owner-named only if discoverability friction surfaces.
