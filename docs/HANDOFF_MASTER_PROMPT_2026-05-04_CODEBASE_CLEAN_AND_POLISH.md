# Master Prompt — Codebase Cleanup + Site Design Polish (2026-05-04)

**Branch:** `BidOnDent-Horizon-Beta`
**Author:** Copilot (Claude Opus 4.7)
**Audience:** Next autopilot AI inheriting this branch (Cloud / Codex / Sonnet / Opus)
**Predecessor work:** 2026-05-05 sustained autopilot session (Parts 1-4) + Pass M (commit `e5937a27`)
**Authority tier:** PLAN — execution prompt, not LAW. Defer to `LAW_PROJECT_RULES.md` and `LAW_HARDENING_PLAN.md` if any line below conflicts.

---

## Audit Synthesis (where the codebase actually is)

### Numbers
- 608 source files (`.ts`/`.tsx`), 59 test files, ~107,800 LOC
- `src/styles/theme.css` = 4,037 lines, 182 comment blocks
- 5 files over 500-line hard limit, ~30 over 300-line soft limit
- TS hardening: only **4 `as any`** in production (3 framework boundaries + 1 real candidate); **0 `@ts-` escapes**
- KIs: **57 RESOLVED** / **7 OPEN** (every OPEN is owner-gated — see below)
- Build: clean, 3,817.64 KiB precache, 61 entries
- Forbidden palette grep: **ZERO** (locked premium gold canon binding)

### What was shipped recently (do not redo)
| Range | Theme |
|---|---|
| Pass H (`a7e1d274..ddec7719`) | Landing atmospheric boost + canon adoption across 11 commits |
| Pass I (`1afea721..10644ada`) | 5 landing sections — atmospheric/radial canon swap at SAME alpha |
| Pass J (`897259ab`) | Coordinated heading-area spacing trim across 7 landing sections |
| Pass K (`907f0cd8`) | Between-section spacing tightening |
| Pass L (`6b96c22b`) | Section-transition stripe fix via overlap + drop navy darkening |
| Pass M (`e5937a27`) | Light-mode seam-fade alpha lift 0.13→0.18 / 0.04→0.06 |
| F-04..F-24 | Functionality sweep — 8 KIs RESOLVED, 5 owner-gated remaining |

### What is genuinely OPEN (all owner-gated)
| KI | Subject | Owner action required |
|---|---|---|
| KI-002 | RESEND_API_KEY | Set secret in Supabase, redeploy |
| KI-064 | Honda Accord red-rectangle thumbnail | DB row + Storage cleanup |
| KI-067 | Coverage Command Center mobile sheet posture | Owner explicit HOLD |
| KI-089 | Dead `storageService` adapter (~1k lines deletable) | Post-launch cleanup authorization (>3 file delete = hard-stop) |
| KI-095 | F-04 Supabase log root cause | Owner Dashboard log inspection |
| KI-100 | Full Supabase shop directory swap | Owner authorization (~20-file blast radius) + 4 design decisions |
| KI-101 | "Toyoto" typo in DB | 30-second SQL UPDATE |
| KI-102 | Cat photo on real customer report | Storage cleanup |
| KI-103 | Footer `bidondent@gmail.com` | Owner provisions domain mailbox first |
| KI-106 | SpeedLimitBadge pure-white | Documented intentional exception |

---

## What This Master Prompt Authorizes

The user's `go full auto for hours` directive authorizes the inheritor to execute every item in **§1 Codebase Cleanup (Safe)**, **§2 Visual Polish (Pass M Pattern)**, and **§3 Documentation Hygiene** without per-item re-confirmation. **§4 Larger Refactors** require explicit owner authorization before each one.

Hard stops (always honored, never overridden by "go full auto"):
- LAW conflict (LAW_PROJECT_RULES.md, LAW_HARDENING_PLAN.md)
- Locked Premium Gold Palette violation (rgba(196,144,65) / rgba(196,130,45) / rgba(140,82,22) / rgba(252,238-240,204-208) — no other gold)
- 0.22a single-layer halo cap exceeded
- Any forbidden palette regression (rgba(220,165,90), rgba(254,248,220), rgba(160,95,25), etc.)
- Any auth/storage/identity invariant: `verify_jwt: false` removed; `storage://` pointer pattern broken; any `hydrateSignedStorageUrl` bypass added; any direct supabase query from a component
- Any schema migration to production
- Any deploy / secret action
- More than 3 files deleted in a single commit
- Cross-2-architectural-layer refactor in a single commit
- Build broken after 2 fix attempts on the same error

---

## §1 Codebase Cleanup (Safe — execute freely)

### 1.1 Comment-block consolidation in `src/styles/theme.css` (LOW RISK)
- 182 multi-line comment blocks document Pass H1, H1.5, H1.6, H1.7, H2..H9, I1..I5, J, K, L, M evolution. Most rules carry 6-12 line "Pass X did Y because Z" preambles.
- **Action:** introduce a top-of-file `Pass Index` comment block listing Pass A→M with one-line summaries + commit refs. Then trim per-rule preambles to single-line `/* Pass M (KI-104): light alpha 0.13→0.18 */` references back to the index.
- **Constraint:** zero behavioral change. Pure comment edit. Verify with `git diff --shortstat` showing `-N comments, +M comments` only.
- **Safety:** comments compiled out by Vite — zero runtime risk. Build size won't change.

### 1.2 Duplicate-selector consolidation in `theme.css` (LOW RISK)
- Audit B2 listed 7 truly-additive duplicate selectors (`bd-glass-card--landing-warm`, `bd-shell-header::after`, `bd-report-section`, `bd-report-secondary-button`, `bd-dashboard-section`, `bd-dashboard-filter-button`, `bd-pin-pulse::after`) + 2 nested-context duplicates.
- **Action:** for each, merge the second additive block into the first when properties don't conflict. Leave nested-context (`[data-appearance-mode="light"] .bd-X`) duplicates as-is — those are intentional mode overrides.
- **Constraint:** validate computed CSS unchanged by visual diff on the affected surfaces (dashboard, report, landing). Roll back any merge that changes paint.
- **Safety:** order matters — merge IN PLACE at the second occurrence's position to preserve cascade priority.

### 1.3 `console.error` Law-5 audit (MEDIUM SCOPE)
- 46 `console.error`/`console.warn` calls outside test files. Per LAW Law 5, raw `console.error` without paired toast/UI feedback is a violation.
- **Action:** for each call site, verify a toast/UI feedback exists in the same handler. If yes, leave the console call (still useful for ops). If no, add the toast via existing `showErrorToast` plumbing or convert to silent log + UI surfacing.
- **Constraint:** ONE FILE PER COMMIT. Max 6 commits in a single autopilot block. Commit message format: `fix(law5): <ServiceName> <handlerName> — surface failure via showErrorToast (per Law 5)`.
- **Safety:** existing `showErrorToast` callback already threaded through `buildDashboardRouterProps` (KI-005 RESOLVED) — reuse don't reinvent.

### 1.4 The 1 real `as any` candidate
- `src/app/components/...ImmersiveMapResultsDrawer.tsx:137` has `} as any)}` — flagged in audit A1 as a real refactor candidate (the other 17 are framework-boundary loose typing).
- **Action:** read the surrounding type context, define a precise type or use a `Record<string, unknown>` constrained shape, drop the `as any`.
- **Safety:** isolated to one file, one expression. Build will catch any regression.

### 1.5 Dead-code candidates (verify-then-remove only)
- `KI-089` documents `services/storage/SupabaseStorageAdapter.ts` + `StorageService.ts` + `StorageService.test.ts` as production-dead (zero callers verified). DO NOT delete in autopilot — exceeds >3-file hard-stop budget. Surface as a one-pass owner authorization request only.

---

## §2 Visual Polish — Pass M Pattern Continuations (execute on canon)

The user's screenshots 10-14 surfaced light-mode wash thinness across the landing surface. Pass M lifted the seam-fade primitive. The remaining same-pattern primitives that the prior AI explicitly flagged as "owner re-verifies before propagating" are now sanctioned by the `go full auto` directive.

### 2.1 Pass N — `.bd-landing-section-toplamp` light alpha lift
- **Current:** `rgba(196, 144, 65, 0.13)` (light) / `rgba(196, 144, 65, 0.20)` (dark)
- **Target:** `rgba(196, 144, 65, 0.18)` (light) / dark UNCHANGED
- **Rationale:** matches Pass M's exact lift (0.13→0.18). Still under 0.22a cap. Still below dark's 0.20 (preserves dark > light hierarchy).
- **Location:** `src/styles/theme.css:3877` area
- **Hard stop:** dark mode unchanged. Hero unchanged.

### 2.2 Pass O — `.bd-landing-section-bottomwash` light alpha lift
- **Current:** `rgba(30, 58, 138, 0.10)` (light navy) / `rgba(15, 30, 60, 0.30)` (dark)
- **Target:** `rgba(30, 58, 138, 0.14)` (light) / dark UNCHANGED
- **Rationale:** the "lit room" companion to toplamp (cool blue depth from below). Light @ 0.10 reads near-imperceptible against pale section bodies. Lift to 0.14 still preserves restraint.
- **Hard stop:** cool blue identity preserved (do NOT swap to gold). Dark unchanged.

### 2.3 Pass P — `.bd-landing-seam-fade` middle-stop refinement (OPTIONAL — only if Pass M visual passes)
- Pass M lifted center 0.13→0.18 and mid 0.04→0.06. There is a tertiary stop in the gradient that can read sharper if needed. Inspect first; touch only if the seam still reads as a hard line.

### 2.4 Pass Q — DashboardAtmosphere D8/D9/D10 light-mode parity check
- Bucket 7 (commit `9e0aa928`) added corner gold lamps + bronze floor wash to dashboard. Light alphas may have slipped underweight relative to dark.
- **Action:** read `theme.css` `.bd-dashboard-atmosphere` rules, identify any light-mode alpha < 0.10, lift to 0.12-0.14 within Locked Premium Gold Palette only.
- **Hard stop:** dashboard panels themselves UNTOUCHED. Atmosphere only.

### 2.5 Pass R — Light-mode landing section body opacity
- Owner screenshots 10-14 show inter-section atmospheric wash reading thin. Even after seam-fade + toplamp + bottomwash lifts, the section body itself may be the thin one.
- **Diagnose first:** open the live site (light mode), inspect a landing section background. If the section body has its own gradient/wash, check alphas. If alphas < 0.08, lift to 0.10-0.12.
- **Do NOT execute without diagnosing first** — likely there's nothing to bump and the perceived thinness is the body being correctly canvas-blank.

### 2.6 Pass S — Light-mode shop family parity (recheck)
- KI-068 was marked partial-resolution (commit `35538907`). Walk the shop family screens in light mode (ShopBidModal, ShopOnboardingStep4, ShopActiveJobsScreen, ShopEstimateInboxScreen) — verify no remaining `bg-white` or `border-slate-200` LAW pure-white violations.
- **Tool:** `grep -nE "bg-white|border-slate-200|bg-slate-50" src/app/components/shop/*.tsx`
- **Fix pattern:** convert to `bd-*` utility or `linear-gradient(180deg, rgba(238,247,255,0.78), rgba(219,234,254,0.70))` body + `rgba(140,82,22,0.20)` border + `rgba(252,240,208,0.78)` cream highlight (the canonical Pass T1.2 recipe).

---

## §3 Documentation Hygiene

### 3.1 KI status freshness check
- Walk every OPEN KI and verify the status is still accurate. If owner has acted (e.g., KI-101 typo fixed in DB), update status to RESOLVED with date.
- **Tool:** browser smoke test against staging, confirm finding is gone, then update `REF_KNOWN_ISSUES.md`.

### 3.2 Archive superseded docs
- Several `PASS_AUTOPILOT_2026-05-0X` reports could roll to `docs/archive/` once their KIs all RESOLVED. Do NOT archive while any referenced KI is OPEN.

### 3.3 `REF_SYSTEM_STATE.md` co-update
- Per CLAUDE.md co-update rule, any new endpoint, migration, or auth-contract change updates REF_SYSTEM_STATE in the same pass. None this session, but verify the doc still reflects current truth.

---

## §4 Larger Refactors (require owner authorization per item)

### 4.1 `theme.css` split into role-based files
- 4,037 lines in a single file. Could split into:
  - `theme/_palette.css` (custom properties, tokens)
  - `theme/_dashboard.css` (`.bd-dashboard-*` rules)
  - `theme/_landing.css` (`.bd-landing-*` rules)
  - `theme/_map.css` (`.bd-map-*`, `.bd-coverage-*`)
  - `theme/_shop.css` (`.bd-shop-*`)
  - `theme/_light-overrides.css` (all `[data-theme="light"]` and `[data-appearance-mode="light"]` rules)
- **HIGH RISK:** any selector ordering issue causes silent visual regressions across the entire site. Requires per-surface visual regression test.
- **Authorization:** owner must explicitly say "split theme.css now" — autopilot does not start this unprompted.

### 4.2 `HeroSection.tsx` extraction (1,112 lines)
- Largest file in the codebase. Likely 4-6 sub-components inline (hero map widget, sample quote chip, ETA chip, CTA buttons, social proof badges, scroll cue).
- Extraction would touch hot path (landing page is highest-traffic surface).
- **Authorization:** post-launch per Hardening Plan.

### 4.3 KI-100 — Supabase shop directory swap
- ~20 file blast radius. 4 design decisions required from owner. Phase 1 plan already drafted in KI-100 entry.

### 4.4 KI-089 — `storageService` abstraction removal
- 4 files deleted (>3 hard-stop). ~1,000 lines removable. Requires owner authorization to bypass the autopilot delete-budget rule.

---

## §5 Execution Discipline (binding)

For every commit:
1. **One bug, one commit.** No bundling. Commit subject names the KI / Pass.
2. **Diagnose-first.** Read the file before editing. Check for prior pass evidence.
3. **Build after every commit.** `npm run build`. Fail-fast if size delta > +50 KiB without justification.
4. **Forbidden grep ZERO.** `grep -rE "rgba\(228|rgba\(220, ?(140|165)|rgba\(255, ?(228|230|215)|rgba\(160, ?95|rgba\(180, ?100|rgba\(170, ?95|rgba\(253, ?(200|220)" src/` must return 0 lines.
5. **Push after every commit.** `git push origin BidOnDent-Horizon-Beta`. No batched pushes.
6. **Co-update docs in same commit** when load-bearing facts change.
7. **Honest stand-down** when scope runs out. Do not manufacture work. The "one more pass" instinct after a long run is the failure mode — recognize it.

---

## §6 What Counts as Done

A successful "hours of full auto" session ends when ONE of:
- All §1, §2, §3 items shipped.
- Build broken twice on the same error → stop, surface to owner.
- Any §5 hard-stop tripped → stop, surface to owner.
- Inheritor judges remaining items would manufacture work → stop, write report.

A successful session does NOT end with:
- Untouched §1 / §2 items because "owner might want different".
- Reports authored with vague "explored options" language and no commits.
- Forbidden palette regressions "for visibility".
- Architectural changes outside §1-§3 scope.

---

## §7 Skill Library Reminders

Apply these before reinventing:
- `bd-design-identity` — for any visual canon question
- `supabase-clerk-edge-function` — for any auth touchpoint
- `supabase-storage-signed-urls` — for any media URL persistence question
- `mola-ai-relay-protocol` — when owner pastes mixed-AI transcripts

Reference the skill by name in commit messages so future agents can trace the pattern source.

---

## §8 Suggested Execution Order (priority desc)

1. **Pass N** — toplamp light alpha lift (immediate Pass M continuation)
2. **Pass O** — bottomwash light alpha lift (immediate Pass M continuation)
3. **Pass Q** — dashboard atmosphere light parity check (high user visibility)
4. **§1.4** — single `as any` cleanup (lowest risk, highest type-safety leverage)
5. **§1.2** — duplicate selector consolidation (cosmetic but high-readability win)
6. **§1.3** — Law 5 console.error sweep, capped at 4 commits per session
7. **§1.1** — theme.css comment-block index (nice-to-have, defer if running out of clean items)
8. **§3.1** — KI status freshness sweep
9. **Stop.** Write final report. Hand back to owner.

---

*Inheritor: this prompt is a runway, not a chain. Pick items in order, diagnose first, ship narrow, push after each commit. When the runway runs out, stop honestly. The session has more value short-and-clean than long-and-dilute.*

*Source skills: `bd-design-identity`, `mola-ai-relay-protocol`. Source LAW: LAW_PROJECT_RULES.md, LAW_HARDENING_PLAN.md.*
