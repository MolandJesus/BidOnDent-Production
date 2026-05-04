# Full Autopilot Audit — 2026-05-05

**Authority level:** AUDIT BASELINE — single-pass snapshot of codebase + TS + LAW compliance + functionality state, captured before extended autopilot fix work begins.

**Captured by:** Cloud (Opus 4.7) per owner directive 2026-05-04 ("go full auto and have full freedom design work and functionality work for hours without stopping after fully auditing codebase and ts work now"). Codex framework loaded (long-running prompt). Phase 0 is mandatory before any fix commits.

**Repo state at audit:** branch `BidOnDent-Horizon-Beta` HEAD `23f4a2cd` (KI-086 followup just shipped). Working tree clean except for an in-progress handoff doc (`docs/archive/HANDOFF_CLOUD_MASTER_AUTOPILOT_2026-05-03_archived_2026-05-04.md`, archived 2026-05-04) created during prior session.

**Build at audit:** clean. `npm run build` → 3.78s, precache 3808.26 KiB, 61 entries.

**Constraint:** This audit was captured without browser access in the current environment. Section F (mobile + functionality smoke) is necessarily code-side only. Owner-driven browser verification remains the gate for design ship/regression calls (per established F-fix pattern).

---

## Tag legend

- **P0** — Blocks launch / build / runtime / LAW compliance
- **P1** — Storage/auth invariant, broken user loop, or LAW canon violation
- **P2** — Mobile/UX regression, design canon adoption gap, missing user-visible error
- **P3** — Architecture choke point, file size, dead code
- **P4** — Functionality polish (loading/empty/error states, edge cases)
- **P7** — TS hardening / `any` / docs

Each finding gets a **recommended action** in `[brackets]`: FIX NOW (this pass), FIX THIS PASS, DEFER, DOCUMENT-ONLY.

---

## A. TypeScript health

**Build status:** ✅ clean. Vite 6 build succeeds at 3.78s. Bundle size stable at 3808 KiB precache (matches 2026-05-03 baseline).

| #   | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | P-tag | Action                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------- |
| A1  | 18 `any` type usages outside test files (mostly legitimate: `lazyWithRetry` generic, `MapProto as any` for maplibre patch, `React.ComponentType<any>` for nav icons, `PerformanceOptimizer` cache map). 5 are test fixtures (`as any[]`). 1 is a real refactor candidate: `ImmersiveMapResultsDrawer.tsx:137 } as any)}`. Most others are legitimate framework-boundary loose typing.                                                                                                                                                               | P7    | DEFER (low-impact, mostly framework boundaries)                         |
| A2  | 1 `@ts-expect-error` in test fixture (`shopRequestsScreenHelpers.test.ts:79` — testing null id fallback). Legitimate.                                                                                                                                                                                                                                                                                                                                                                                                                               | P7    | DOCUMENT-ONLY                                                           |
| A3  | ~~36 ungated `console.log`~~ **CORRECTED 2026-05-05 (T2.1 follow-up):** the original count was a false positive from grep regex limitations — it filtered same-line `if (import.meta.env.DEV) console.log(...)` but missed multi-line `if (import.meta.env.DEV) { console.log(...) ... }` gate blocks. Re-scan with multiline-aware detector found **0 truly ungated `console.log` in production code**. All 4 candidate hits are either JSDoc examples in comments (3) or inside multi-statement DEV-gate blocks (1). Codebase is fully DEV-gated. | —     | OK (no fix needed — audit overcount corrected)                          |
| A4  | 121 `console.error` in production paths. These are Law-5-compliant when paired with toast/UI feedback; raw `console.error` alone violates Law 5. KI-005 marked RESOLVED for the major mutation handlers but residual coverage gap likely on newer paths.                                                                                                                                                                                                                                                                                            | P2    | DEFER (sweep would touch 30+ files; do per-file when otherwise editing) |
| A5  | `react-dom-shims.d.ts` and `vite-env.d.ts` exist; not inspected for staleness this pass.                                                                                                                                                                                                                                                                                                                                                                                                                                                            | P7    | DOCUMENT-ONLY                                                           |

---

## B. Build + bundle health

| #   | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | P-tag | Action                                                            |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------------------------------- |
| B1  | Precache 3808 KiB (61 entries). Stable vs prior baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                | —     | OK                                                                |
| B2  | 7 truly-additive duplicate `theme.css` selectors (`bd-glass-card--landing-warm`, `bd-shell-header::after`, `bd-report-section`, `bd-report-secondary-button`, `bd-dashboard-section`, `bd-dashboard-filter-button`, `bd-pin-pulse::after`) plus 2 nested-context duplicates (`[data-appearance-mode="light"]` at L1776 + L2641). All are intentional additive multi-blocks (second def adds properties, doesn't conflict). IDE flags as "duplicate selector" but no behavioral conflict. | P3    | DEFER (cosmetic; consolidate when otherwise touching the surface) |
| B3  | 0 TODO/FIXME/XXX/HACK comments in src/.                                                                                                                                                                                                                                                                                                                                                                                                                                                  | —     | OK                                                                |

---

## C. Architecture compliance audit

| #   | Finding                                                                                                                                                                                                                  | P-tag | Action                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- | --------------------------------------------------------------------------------- |
| C1  | Files exceeding 500-line hard limit (5): `HeroSection.tsx` (1112), `OperatingRegionsSection.tsx` (551), `DashboardHeader.tsx` (538), `App.tsx` (524), `useOperatingRegionsCoverage.ts` (512).                            | P3    | DEFER (extractions touch hot paths; safer post-launch)                            |
| C2  | Files exceeding 300-line soft limit (~30 files top of list — landing sections, hooks, screens). Notable: `DashboardRouter.tsx` (477), `BidsScreen.tsx` (463), `ReportDetailScreen.tsx` (461), `AccountScreen.tsx` (449). | P3    | DOCUMENT-ONLY (architectural debt, post-launch refactor scope per Hardening Plan) |
| C3  | `buildDashboardRouterProps.ts` choke point (KI-010) still in place — every new feature requires threading callback through 4+ files.                                                                                     | P3    | DEFER (KI-010 explicitly post-launch)                                             |
| C4  | State-driven routing (KI-011) still in place — no URL sharing/bookmarking.                                                                                                                                               | P3    | DEFER (KI-011 explicitly post-launch)                                             |
| C5  | Bid split-state ownership (KI-012) — `useUserData.bids` (stale) + `useBidsForReport` (live) merge logic.                                                                                                                 | P3    | DEFER (KI-012 P3)                                                                 |

---

## D. Storage + Auth invariant audit

| #   | Finding                                                                                                                                                                                                                                                                                        | P-tag | Action                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------- |
| D1  | ✅ `config.toml` `[functions.server]` still pinned `verify_jwt = false` (line 406). Clerk JWT verification correctly happens in-handler.                                                                                                                                                       | —     | OK                                                                    |
| D2  | ✅ Edge upload handler (`storage.ts:175-180`) returns `storage://bucket/path` pointer in `publicUrl` field. Persistence path is correct.                                                                                                                                                       | —     | OK                                                                    |
| D3  | ✅ `workflow.ts` `getJobAssignments` properly hydrates `damage_reports.photo_urls` via `hydrateSignedStorageUrls()` (line 175). The historical bypass is fixed and stays fixed.                                                                                                                | —     | OK                                                                    |
| D4  | ⚠️ `SupabaseStorageAdapter.ts:102` direct-upload fallback path uses `getPublicUrl()` — would return a non-functional public URL since LAW says all buckets are private. May be dead code (the canonical flow goes through edge function). Need to grep call sites; if dead, removal candidate. | P3    | FIX THIS PASS — verify dead vs live; remove if dead, document if live |
| D5  | ✅ `bids.ts` handlers return `bids` (no photo_urls) — no hydration needed. Correct.                                                                                                                                                                                                            | —     | OK                                                                    |
| D6  | ✅ `reports.ts` handlers properly hydrate via `hydrateReport()`.                                                                                                                                                                                                                               | —     | OK                                                                    |
| D7  | All four prod `damage_reports.photo_urls` rows backfilled from expired signed URLs to pointers (per REF_SYSTEM_STATE migration `20260501000001`).                                                                                                                                              | —     | OK                                                                    |

---

## E. Design system canon compliance

| #   | Finding                                                                                                                                                                                                                                                                                                                                                                                                                               | P-tag | Action                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------- |
| E1  | LAW Light-Mode Surface Rule violations in component inline styles (load-bearing surfaces):                                                                                                                                                                                                                                                                                                                                            | P1    | FIX THIS PASS                                                                                                                      |
| E1a | `ShopBidModal.tsx:43` — light branch `bg-white border-slate-200/60 shadow-xl` paints the shop bid modal body PURE WHITE in light mode. Direct LAW violation on a load-bearing customer-facing surface (the shop's bid form).                                                                                                                                                                                                          | P1    | FIX THIS PASS                                                                                                                      |
| E1b | `ShopBidModal.tsx:123` — light branch `bg-slate-50 border-slate-200` for inner field cluster — borderline (slate-50 is near-white but technically not pure white).                                                                                                                                                                                                                                                                    | P2    | FIX THIS PASS — bring to bd-\* register                                                                                            |
| E1c | `ShopBidModal.tsx:155` — secondary button light branch `text-slate-700 border border-slate-200 hover:bg-slate-50` — same near-white concern, plus this is a button that should use `bd-glass-control--secondary` per design system.                                                                                                                                                                                                   | P2    | FIX THIS PASS                                                                                                                      |
| E1d | `ShopOnboardingStep4.tsx:48,70` — `border-slate-200/60 bg-white/60` on onboarding cards in light mode. Two surfaces (card + image previews).                                                                                                                                                                                                                                                                                          | P1    | FIX THIS PASS                                                                                                                      |
| E1e | `DemoLoginHelper.tsx:54` — light branch is OK (gradient blue), only dark branch uses `bg-white/[0.06]` (dark-glass-appropriate).                                                                                                                                                                                                                                                                                                      | —     | OK                                                                                                                                 |
| E1f | `LandingPageHeader.tsx`, `DashboardHeader.tsx`, `ClerkAccountTypeSelector.tsx`, etc. — uses warm cream `bg-[rgba(255,251,245,0.65)]` style values (not pure white) and proper `bd-*` tokens.                                                                                                                                                                                                                                          | —     | OK                                                                                                                                 |
| E2  | LAW canon: omnidirectional `0 0 X-large` (>=120px blur) on premium glass — ZERO hits in `theme.css`. Pass F's directional triad held.                                                                                                                                                                                                                                                                                                 | —     | OK                                                                                                                                 |
| E3  | LAW canon: internal radial gold paint `>0.05α` in light-mode bodies — 5 actual VIOLATIONS on premium glass:                                                                                                                                                                                                                                                                                                                           | P1    | FIX THIS PASS                                                                                                                      |
| E3a | `.bd-glass-floating` light L1947 — body radial 0.16α. LAW canon explicitly applies to `.bd-glass-floating`.                                                                                                                                                                                                                                                                                                                           | P1    | FIX THIS PASS — demote to 0.05                                                                                                     |
| E3b | `.bd-dashboard-panel--deep` light L2902 — body radial 0.20α on cool blue body (main content panel). Risk of warm-on-cool peach blush.                                                                                                                                                                                                                                                                                                 | P1    | FIX THIS PASS — demote to 0.05                                                                                                     |
| E3c | `.bd-dashboard-panel--accent-cyan` light L2924 — body radial 0.20α on cool cyan body. Same risk.                                                                                                                                                                                                                                                                                                                                      | P1    | FIX THIS PASS — demote to 0.05                                                                                                     |
| E3d | `.bd-dashboard-panel--accent-indigo` light L2946 — body radial 0.22α on cool indigo body (same selector family as Compare card sub-section that already exhibited peach in screenshots). High risk.                                                                                                                                                                                                                                   | P1    | FIX THIS PASS — demote to 0.05                                                                                                     |
| E3e | `.bd-dashboard-section--deep` light L3083 — body radial 0.18α.                                                                                                                                                                                                                                                                                                                                                                        | P1    | FIX THIS PASS — demote to 0.05                                                                                                     |
| E3f | `--bd-report-panel-bg` (CSS var) L2107 — body radial 0.12α on warm cream body (report wizard). The report flow is intentionally warmer (sibling system per REF_VISUAL_SYSTEM.md), but per LAW canon the threshold is 0.05α regardless. Lower priority since the warm body absorbs the gold radial without producing peach.                                                                                                            | P2    | FIX THIS PASS — demote to 0.05 for canon compliance                                                                                |
| E3g | NOT VIOLATIONS (intentional warm-dominant or pseudo-element): `.bd-dashboard-panel--accent-blue` (0.24 — HERO panel, intentionally warm-dominant per LAW Page Hierarchy), `.bd-dashboard-section--accent-gold` (0.22 — WARM POP TILE), `.bd-dashboard-section--accent-champagne` (0.16 — WARM POP TILE), `.bd-dashboard-panel::after` (0.32 — pseudo decorative corner lamp), `.bd-report-section::after` (0.16 — pseudo decorative). | —     | OK                                                                                                                                 |
| E4  | Body opacity outside LAW canon range on premium glass — multiple panels at 0.94/0.86 or 0.94/0.88 (above LAW canon ceiling 0.84 for light, 0.78 for dark). Affects `--deep`, `--accent-cyan`, `--accent-indigo` panel-level + sub-section button surfaces.                                                                                                                                                                            | P2    | FIX THIS PASS — bring panels to canon range; preserve sub-section buttons (button-surface exception per KI-086 followup reasoning) |
| E5  | Border colors — cool blue ring identity-locked. Per spot check, all premium glass surfaces use `rgba(96,165,250,*)` cool blue ring + `rgba(140,82,22,*)` bronze trim per LAW. Clean.                                                                                                                                                                                                                                                  | —     | OK                                                                                                                                 |
| E6  | Forbidden palette regression check (forbidden yellow-amber values from LAW Premium Gold Palette) — branch-aware grep returns ZERO hits. Locked palette discipline holding.                                                                                                                                                                                                                                                            | —     | OK                                                                                                                                 |

---

## F. Mobile + functionality smoke

**Constraint:** No browser available in this environment. Code-side only.

| #   | Finding                                                                                                                                                                                | P-tag | Action                                    |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ----------------------------------------- |
| F1  | Global error boundary at App.tsx — exists per REF_VISUAL_SYSTEM.md (`bd-dashboard-primary-button` adopted on root error boundary). Confirmed via grep.                                 | —     | OK                                        |
| F2  | Sentry wired (`src/main.tsx:10`, `sentryInit.ts`, `errorReporting.ts`) per LAW Hardening Plan launch guardrail. `VITE_SENTRY_DSN` deployment status unknown without browser/env check. | —     | DOCUMENT-ONLY (owner verification needed) |
| F3  | Loading state exists (per `App.tsx:524` shell, `AppLoading.tsx` component).                                                                                                            | —     | OK                                        |
| F4  | Browser-side audit deferred to owner verification loop (established protocol for design changes).                                                                                      | —     | DOCUMENT-ONLY                             |

---

## G. Known-issue verification sweep

| #   | Finding                                                                                                                                                                | P-tag | Action                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------- |
| G1  | KI status totals: 42 RESOLVED, 15 Open. Most recent RESOLVED: KI-086 (Compare card peach blush, just shipped this session at `23f4a2cd`).                              | —     | OK                                      |
| G2  | KI-067 (Coverage Command Center mobile sheet) — owner explicit HOLD, do not touch. Confirmed honored.                                                                  | —     | OK                                      |
| G3  | KI-075 (future nav engine + map functionality) — DEFERRED, audit-only. Confirmed honored.                                                                              | —     | OK                                      |
| G4  | KI-068 "Shop family load-bearing white surfaces (light mode)" — Open. Status partially overlaps with E1a (ShopBidModal). Should mark scope intersection in fix commit. | P1    | FIX THIS PASS via E1a                   |
| G5  | KI-002 (RESEND_API_KEY deployment for email notifications) — code-side complete, blocked on human secret deployment. Continues to be the soft-launch P0 blocker.       | P0    | DEFER (human action required, not code) |

---

## Phase 1 priority queue (derived from this audit)

### Tier 1 — P0/P1 (must fix this session)

1. **E3a-f** — Demote 5 light-mode internal gold radial paint violations from 0.16-0.22α → 0.05α on `.bd-glass-floating`, `.bd-dashboard-panel--deep`, `.bd-dashboard-panel--accent-cyan`, `.bd-dashboard-panel--accent-indigo`, `.bd-dashboard-section--deep`. Plus `--bd-report-panel-bg` CSS var (0.12 → 0.05). LAW canon compliance. Single commit.
2. **E1a/E1d** — Fix LAW Light-Mode Surface Rule violations on `ShopBidModal.tsx` (load-bearing modal painted pure white) + `ShopOnboardingStep4.tsx` (onboarding cards painted `bg-white/60`). Migrate to `bd-*` register tokens. Single commit. Resolves G4 (KI-068).
3. **E4** — Bring panel-level body opacity into LAW canon range (light 0.76-0.84) on the three large panel surfaces above. Keep sub-section button surfaces at button-tier opacity per established button-surface exception. Single commit (may bundle with E3 since same edits).
4. **D4** — Verify `SupabaseStorageAdapter.uploadFile` direct-path fallback is dead code; remove if dead, document if live (separate commit).

### Tier 2 — P2 (fix this session if time)

5. **A3** — Gate noisiest ungated `console.log`s in `useUserData.ts`, `useUserDataLoader.ts`, `useAppEffects.ts`, `RealtimeBidService.ts`, `StorageService.ts` behind `if (import.meta.env.DEV)`. Single commit.
6. **E1b/E1c** — Migrate ShopBidModal inner field cluster + secondary button to `bd-*` register (post-modal-fix continuation).
7. **Landing cool-section gold uplift** (per REF_VISUAL_SYSTEM.md §4b future direction — owner verbatim 2026-05-04: "for future landing page design updates, sections still need work as well as more gold areas and lighting prmium"). Bounded scope per master-designer license: section-level ambient gold lamp via radial overlay, primary item only. Owner re-verifies before propagating to eyebrow chips / CTA pills / list checkmarks / dividers.

### Tier 3 — P3 (opportunistic)

8. **B2** — Consolidate truly additive duplicate selectors in `theme.css` (touch only when otherwise editing the surface).
9. **C2** — File-size soft-limit cleanup deferred per Hardening Plan (post-launch).

### Tier 4 — Document-only

- A1, A2, A4, A5, B3, C1-5, D7, E2, E5, E6, F1-F4, G1-G3, G5.

---

## Hard-stop honoring (verified before fix work begins)

This audit pass respects all autopilot hard stops:

- ❌ No auth/payment/identity/schema/migration touches anywhere in the priority queue
- ❌ No edge function `verify_jwt` changes
- ❌ No storage RLS policy changes
- ❌ No map provider / routing provider changes
- ❌ No `git push --force` / `git reset --hard` / branch deletes / main merges
- ❌ No KI-067 touches (owner HOLD)
- ❌ No KI-075 / PLAN_FUTURE_NAV_AND_MAP_FUNCTIONALITY.md touches (DEFERRED)
- ❌ No DashboardAtmosphere.tsx structural changes
- ❌ No Pass F dark register reverts
- ❌ No warm bronze landing section paint changes
- ❌ No cool landing section paint changes (atmosphere only per future-direction doc)

---

## Skills referenced for this audit

- `bd-design-identity` — for LAW canon compliance scans (sections E)
- `supabase-clerk-edge-function` — for D3 `verify_jwt` invariant
- `supabase-storage-signed-urls` — for D2/D4 storage pointer pattern
- `mola-ai-relay-protocol` — for extracting owner directive from Codex's relay prompt and translating it into Phase 0 audit + bounded Phase 1 fix work

Per LAW Co-Update Rules, this audit doc was written and committed BEFORE any fix commits begin, so future agents can see the baseline against which the long-run pass operates.
