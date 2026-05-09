# Phase 4 Mobile Audit (OPS)

**Authority level:** OPS — operational audit log for Phase 4 mobile sweep.

**Last updated:** 2026-05-04

**Status:** **COMPLETE 2026-05-04.** All findings shipped. Phase 4 closed; re-authorization gate now active for Phase 4.5+.

**Scope contract:** [`PLAN_PHASE_4_MOBILE_SWEEP.md`](archive/PLAN_PHASE_4_MOBILE_SWEEP_archived_2026-05-05.md)

**Method:** Static code audit (grep + Read) on touch targets, viewport overflow, modal traps, safe-area insets, gesture conflicts. No real-device QA. No Playwright run-through. Chrome DevTools emulation can verify any specific finding if needed.

---

## TL;DR

The codebase is **substantially mobile-compliant already.** Prior commits established the patterns:

- `865dedf4` — NavigationSavedPlacesPanel pinned-place delete h-9 → h-10
- `e3839083` — NavigationDeviationPrompt off-route dismiss h-7 → h-10
- `8d151083` — MapSurfaceControls 6 buttons h-8 → h-10
- LandingPageHeader hamburger: `h-11 w-11 min-h-[44px] min-w-[44px]` (compliant)
- MobileBottomNav: `min-w-[3.5rem]` + `py-2` + icon + label (compliant)
- Insurer modal CTAs (Approval / Denial): `h-11` (compliant)

This phase finds a small number of remaining violations and brings them to the established floor. **No systemic redesign needed; no LAW promotion warranted at this audit's findings level.**

---

## Findings

### Cluster A — Landing

**Status:** Compliant. No findings.

Audited:

- [`LandingPageHeader.tsx`](../src/app/components/landing/LandingPageHeader.tsx) — hamburger at L182 is `h-11 w-11 min-h-[44px] min-w-[44px]` (compliant); theme-toggle at L170 same; profile-menu trigger at L218–225 standard size.
- [`HeroSection.tsx`](../src/app/components/landing/HeroSection.tsx) — no sub-44 click targets in primary CTAs (`Start New Report` / `Learn More` use larger button shells). The 480px sample-quote-map preview at L178 is `hidden md:block` — desktop only, no mobile overflow risk.
- [`CoverageBrowseExperience.tsx`](../src/app/components/landing/CoverageBrowseExperience.tsx) — 372px overlay panel at L384 is `hidden lg:block` — desktop only.
- Other landing sections (`HowItWorks`, `Why Choose`, `Who We Serve`, `Coverage Map block`, `Shop/Insurer Signup`, `Ready to Get Started`, `Footer`) — full-width buttons, no sub-44 hits in the static grep.

### Cluster B — Customer Dashboard

**Status:** 1 finding.

| Finding                                                                                                                 | File                                                                               | Line | Fix                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Notifications close button is `h-7 w-7` (28×28 px), well below the 44×44 mobile floor. Used on every dashboard top bar. | [`NotificationCenter.tsx`](../src/app/components/dashboard/NotificationCenter.tsx) | 266  | Enlarge hit area to `h-10 w-10 min-h-[44px] min-w-[44px]`. Inner `X` icon stays the same visual size; only the click region grows. |

**Not findings (verified false positives on first grep):**

- `NotificationCenter.tsx:222` — title icon container, decorative (no `onClick`). Wraps a static icon next to "Notifications" header text.
- `NotificationCenter.tsx:357` — list-item icon container, decorative. The parent list item is the click target; this inner icon container is just visual decoration.
- `CustomerMapWidget.tsx:240, 294` — decorative icon tiles (capability badge + shop list item icon). The parent rows are the click targets.
- `ProfileDropdown.tsx:282` — decorative avatar wrapper (`w-9 h-9`); no `onClick`.
- `ProfileDropdown.tsx:299–447` — full-row buttons with `w-full py-3` — tall enough.
- `ReportProgress.tsx:30` — progress step indicator (`h-9 w-9`) — visually represents a step, not a tap target. The step transition is driven by the form flow, not by tapping the indicator.
- `MobileBottomNav` (`min-w-[3.5rem]` + `py-2` + icon + label) — compliant.

### Cluster C — Customer New Report flow

**Status:** Compliant. No findings.

Audited Step1 / Step2 / Step3 / Step4 / Step5. All step CTAs (`Continue`, `Back`, `Submit`) use full-width or larger buttons. Icon decorations at sub-h-10 are decorative (placeholder `ImageIcon`, etc.), not click targets. `StepPhotos` photo-tile buttons use the parent tile area (≥80×80) as the click target.

### Cluster D — Shop Dashboard + Bid flow

**Status:** 1 finding (borderline).

| Finding                                                                                                                        | File                                                                        | Line | Fix                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Search/filter chip button is `h-9` (36 px) — usable on tablet, slightly tight at 375 px mobile. Below the 44 px iOS HIG floor. | [`ShopDirectoryHero.tsx`](../src/app/components/shop/ShopDirectoryHero.tsx) | 56   | Add `min-h-[44px]` to the chip class so logical height bumps to 44 on mobile while preserving the visual `h-9` desktop appearance via Tailwind's responsive ordering. |

### Cluster E — Insurer Dashboard + New Claim

**Status:** Compliant. No findings.

Audited insurer screens. Buttons are `h-11`+ throughout (Approval / Denial modal CTAs, `<button>` elements in `InsuranceCompaniesScreen`, `AddProspectModal`, etc.). The insurer light-mode work just shipped in Phase 2 (`9e9c083e`, `2fe30ab6`) used canonical sizing patterns; no mobile-touch-target follow-up needed.

---

## Patterns observed (audit-only, NOT auto-promoted to LAW)

The following patterns are consistently applied across the codebase. Documenting them here so the conditional `LAW_MOBILE_VIEWPORT_DOCTRINE.md` write (per [`PLAN_PHASE_4_MOBILE_SWEEP.md`](archive/PLAN_PHASE_4_MOBILE_SWEEP_archived_2026-05-05.md) §7) is a small exercise IF the owner explicitly authorizes promotion:

1. **Touch-target floor for clickable icons** — `h-10 w-10` baseline; `min-h-[44px] min-w-[44px]` when iOS HIG compliance is required (mobile-critical surfaces like landing hamburger, navigation chrome). The pattern is consistent in shipped code.
2. **Decorative icon containers** can be smaller (`h-7`, `h-8`, `h-9`) when they sit inside a larger clickable parent.
3. **Bottom nav** uses `min-w-[3.5rem]` width minimum with `py-2` padding for adequate tap area without forcing icon-button hit-area floors.
4. **Mobile drawers / sheets** use `max-md:fixed max-md:bottom-0` patterns with safe-area inset awareness (e.g. NotificationCenter L221 `max-md:bottom-[max(env(safe-area-inset-bottom),12px)]`).
5. **Forbidden** in shipped code: hardcoded widths >375 px without `hidden md:block` desktop-only gating; modals without close buttons; sub-44 click targets on critical primary actions.

**LAW promotion judgement:** These patterns are real and consistent, but currently codified in shipped commits + this OPS doc. Promoting to LAW requires owner discretion on whether the rule deserves elevation. The audit finds **no systemic violation that would force the issue.** The current state is "shipping discipline holds; the patterns work because the team applies them." LAW promotion would be useful only if the team grew or new AIs joined that didn't share the implicit knowledge — both true now (multi-AI sessions exist), so a case can be made. **Owner-gated; not auto-written.**

---

## Phase 4 fix execution (COMPLETE)

Two fix commits shipped under this audit:

1. **Cluster B fix — `e45bdf6b`** — NotificationCenter close button `h-7 w-7` → `h-10 w-10 min-h-[44px] min-w-[44px]`. Click region grows; inner X icon (`h-4 w-4`) visual unchanged.
2. **Cluster D fix — `e91a61d5`** — ShopDirectoryHero chip button: added `min-h-[44px]` floor. Visual `h-9` preserved on desktop via Tailwind's box-model height clamping.

Cluster A / C / E had no findings at audit time and shipped clean without commits.

**Phase 4 total commit count: 4** (this audit + 2 fixes + this close update). Original 5-cluster cadence reduced because Clusters A/C/E were already compliant.

**LAW promotion judgement (final):** No systemic pattern emerged that wasn't already shipped. The codebase was already mostly compliant; this phase brought 2 specific outliers to the established floor. **`LAW_MOBILE_VIEWPORT_DOCTRINE.md` is NOT being written.** If future audits find a systemic gap, the audit doc can flag it then. Current state holds.

**Re-authorization gate active.** Phase 4.5 (animation pillar) requires separate explicit owner authorization per [`PLAN_PHASE_4_MOBILE_SWEEP.md`](archive/PLAN_PHASE_4_MOBILE_SWEEP_archived_2026-05-05.md) §8. Parallel-AI work is now eligible per [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — Phase 3 dry run + Phase 4 sequential execution both proved discipline holds.

---

## Cross-references

- [`PLAN_PHASE_4_MOBILE_SWEEP.md`](archive/PLAN_PHASE_4_MOBILE_SWEEP_archived_2026-05-05.md) — scope contract this audit operates under
- [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — palette/glass canon (untouched by this sweep)
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — predicted Phase 4 doc surface (this doc + conditional LAW)
- [`AI_LOCK.md`](../AI_LOCK.md) — coordination state during sweep
