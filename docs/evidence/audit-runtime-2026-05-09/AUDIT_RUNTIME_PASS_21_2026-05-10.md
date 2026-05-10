# Audit Runtime Pass 21 — Visual Doctrine Casebook Reconnaissance
**Date:** 2026-05-10
**Lane:** Audit AI (observational; zero source edits this pass)
**Branch:** BidOnDent-Horizon-Beta
**Companion to:** Pass 20 (second-order false-universal detection) + corrects Pass 20 §2.4.

---

## 0. Mission this pass

Owner relay 2026-05-10 #28 directs visual-doctrine casebook
reconnaissance: classify which UI patterns are most likely to be
"cleaned up" by future contributors despite carrying hidden behavioral
context. New principle to encode:

> **Repeated UI structure does NOT imply shared UI doctrine.
> Sometimes repetition exists because different surfaces independently
> converged on similar local survivability solutions.**

This pass also discovered a Pass 20 finding that was incomplete and
required correction. The audit lane's posture this pass is therefore:
- 90% classification work
- 10% self-correction (a previous finding revised against new
  evidence)
- 0% source edits

---

## 1. Pre-flight discipline

- **AI_LOCK status:** Pass 303 still active (or just standdown'd —
  not re-read this pass). Their locked files
  (`docs/REF_PLATFORM_CORE_ANTI_SPRAWL_DOCTRINE_2026-05-10.md` +
  `AI_LOCK.md`) do not overlap with this pass's evidence file.
  AI_LOCK.md not modified.
- **`git status`:** other-lane work preserved untouched.
- **TS verification:** not re-run; no source edits this pass.

---

## 2. Pass 20 §2.4 correction — motion-reduce coverage gap was a false-positive

### 2.1 What Pass 20 reported

Pass 20 §2.4 noted that shadcn primitives (`alert-dialog.tsx`,
`popover.tsx`, `hover-card.tsx`, `sheet.tsx`, `navigation-menu.tsx`)
use `data-[state=open]:animate-in` WITHOUT pairing it with the
explicit `motion-reduce:animate-none` Tailwind class that BD's
hand-rolled overlays carry, and flagged this as a possible
survivability gap requiring live-Chrome verification.

### 2.2 What Pass 21 evidence shows

Three independent reduce-motion coverage layers exist in this repo:

| Layer | Location | Coverage |
|---|---|---|
| 1. Tailwind plugin default | `tailwindcss-animate` | All `animate-in`/`animate-out` keyframes auto-wrap in `@media (prefers-reduced-motion: no-preference)` |
| 2. Project animations.css | Pass 56 §C Gap-1 fix (lines 478-516) | Explicit `@media (prefers-reduced-motion: reduce)` block neutralizing 24 keyframes + 27 utility classes shipped without guards since inception |
| 3. Project theme.css | 17 explicit guards | Lines 689, 772, 782, 1142, 1210, 1320, 1353, 2134, 3724, 4393, 4473, 4544, 4583 etc. |

19 `prefers-reduced-motion` handlers at the CSS layer total. The
LAW_ANIMATION_AND_ATMOSPHERE doc explicitly mandates **CSS-first
lock**: motion-reduce handling lives at the `@media` level, not at
the component-level Tailwind class.

The shadcn primitives that lack `motion-reduce:animate-none` are
therefore covered by all three layers. **Adding the Tailwind class
to shadcn primitives would actually violate the CSS-first lock** —
it would push motion-reduce policy back into component-level
classes, partly duplicating @media coverage and creating two sources
of truth.

### 2.3 Correct interpretation

BD's hand-rolled overlays pairing `motion-reduce:animate-none` with
`animate-in` is **belt-and-suspenders**, not canonical. The
canonical pattern is the CSS @media guard. Pass 20 read the absence
as a gap; the absence is in fact discipline.

This is exactly the kind of finding the Pass 21 brief Priority C
warned about: "blanket accessibility normalization could
accidentally flatten trust pacing." Acting on Pass 20 §2.4 without
this Pass 21 verification would have produced the very pattern the
brief was warning against.

**Cumulative ledger updates Pass 20 §2.4 from "investigation
candidate" to "false-positive — revision recorded."**

---

## 3. Visual Doctrine Casebook (primary contribution this pass)

The casebook below catalogs visual-doctrine candidates the audit
lane has now classified. Each entry follows the same template:
`Pattern → Distinct values → Doctrine encoded → Cleanup risk →
Verdict`.

### 3.1 Backdrop-blur 5-tier veiling palette

**Distinct values (all 5 standard Tailwind tiers in active use):**

| Class | Pixel radius | Use count | Behavioral encoding |
|---|---|---|---|
| `backdrop-blur-sm` | 4px | 49 | Gentle veiling — sticky headers, popover hints, soft separation |
| `backdrop-blur-md` | 12px | 29 | Medium veiling — dashboard panels, secondary modals |
| `backdrop-blur-xl` | 24px | 30 | Strong veiling — primary overlays, major sheets, drawer headers |
| `backdrop-blur-2xl` | 40px | 21 | Premium glass — bid sheet body, navigation card body |
| `backdrop-blur-3xl` | 64px | 3 | Deepest glass — ReportDetailDrawer (the most reflective surface) |

**Doctrine encoded:** veiling depth = perceived overlay weight =
interruption gravity. A `backdrop-blur-sm` chip floats lightly over
the canvas; a `backdrop-blur-3xl` drawer commands focus.

**Cleanup risk:** future contributor sees 5 tiers and "consolidates
to 2-3 levels." This would erase the gravity calibration.

**Verdict:** CONTRARY POLICY → FALSE-A-PURE candidate. Add to registry.

### 3.2 Duration tier system

**Distinct durations and counts:**

| Duration | Count | Behavioral encoding |
|---|---|---|
| 200ms | 90 | Fast transitions — popups, hover states, tooltips, low-drama state changes |
| 300ms | 45 | Sheet close, drawer collapse, "earned-quick" exit |
| 400ms | 15 | Map UI fade-in family (`map-ui-enter`) — atmosphere awareness |
| 500ms | 11 | Sheet open — "earned reveal" |
| 600ms | 4 | Rare — ambient transitions |
| 700ms | 32 | Atmosphere/ambient work — long fades, scroll reveals |
| 1000ms | 2 | Deepest atmospheric |

**Sheet asymmetry:** `data-[state=closed]:duration-300
data-[state=open]:duration-500` (sheet.tsx) — opens slow, closes
quick. **This is trust choreography**: the system rewards
deliberation when revealing, but respects the user's exit speed.

**Doctrine encoded:** 7 duration tiers form a pacing palette ranging
from "instant feedback" (200ms) through "ambient atmosphere"
(1000ms). Each surface picks the duration that matches its
emotional weight.

**Cleanup risk:** "standardize all transitions to 300ms."

**Verdict:** CONTRARY POLICY → FALSE-A-PURE candidate.

### 3.3 Z-tier OS-style attention hierarchy (deepened from Pass 20)

**Pass 20 reported 27 callsites; Pass 21 inventory shows 38+
distinct z-values with much richer layering:**

| Z-band | Sub-bands | Count | Attention layer encoded |
|---|---|---|---|
| 0-50 | z-0, z-10, z-20, z-30, z-40, z-50 | ~120 | Standard widget stacking (Tailwind defaults) |
| 60-80 | z-[60], z-[61], z-[70], z-[80] | ~7 | Modal-equivalent (bid sheet family) |
| 1, 2 | z-[1], z-[2] | 10 | Local widget micro-layering |
| 200-260 | z-[205], z-[210], z-[245], z-[248], z-[249], z-[250], z-[260] | ~10 | **Map atmosphere**: gradients, glow flow, vignettes |
| 400-490 | z-[400], z-[430], z-[450], z-[490] | ~3 | **Map UI overlays**: status bar, HUD |
| 500-540 | z-[500], z-[510], z-[520], z-[525], z-[530], z-[540] | ~13 | **Map operating layer A**: top bar, headers, guidance |
| 550-580 | z-[550], z-[560], z-[565], z-[570], z-[575], z-[580] | ~13 | **Map operating layer B**: navigation cards, sheets |
| 600-620 | z-[600], z-[610], z-[620] | ~14 | **Mobile primary drawer** + close buttons |
| 700-701 | z-[700], z-[701] | 3 | **System dialog primitives** (shadcn) |
| 1000+ | z-[1000], z-[9999], z-[10000], z-[99999] | ~6 | **Critical system messages**: toast, offline banner |

**Doctrine encoded — this is an OS-style attention hierarchy:**

1. **Authority precedence:** atmosphere never overlays operating
   layer; operating layer never overlays system messages; nothing
   overlays critical system (z-9999+).
2. **Interruption depth:** map atmosphere (200-260) is non-
   interruptive cosmetic; map UI (400-490) is awareness-only;
   navigation cards (550-580) are operating instructions; mobile
   drawer (600-620) is primary task surface; system dialog (700) is
   focus-stealing; critical (1000+) is never-blockable.
3. **Two-band navigation distinction:** the split between 500-540
   and 550-580 mirrors a split between **map information** (top
   bar, headers, guidance) and **map operation** (navigation
   instructions). They occupy different operating sub-layers.

**Cleanup risk:** future contributor sees 38 distinct z-values and
"consolidates to a 5-tier system" or "moves to a z-index scale
constant file." Either flattens the OS-attention hierarchy.

**Verdict:** This is **structured doctrine**, not entropy. Pass 16's
"modal z-tier inconsistency across 4/5 modal families" finding is
formally re-classified: those modals occupy distinct operating
sub-layers and the difference is intentional.

### 3.4 Gap density restraint

**Distinct gap values:**

| Class | Count | Density encoding |
|---|---|---|
| `gap-2` | 510 | Standard close grouping |
| `gap-3` | 250 | Comfortable item separation |
| `gap-1.5` | 177 | Dense chip/badge spacing |
| `gap-1` | 167 | Tightest list compression |
| `gap-4` | 46 | Card-to-card breathing room |
| `gap-2.5` | 42 | Between-tier transitional |
| `gap-5` | 18 | Major section separation |
| `gap-0.5` | 13 | Tightest possible |
| `gap-6` | 9 | Wide section separation |
| `gap-3.5` | 2 | Rare transitional |
| `gap-7`, `gap-8`, `gap-10`, `gap-16` | 1 each | Rare large-scale |

**Observation:** ~85% of gap usage falls within `gap-1` through
`gap-3`. The repo deliberately constrains density in the close
grouping range. Density jumps to `gap-6+` are extremely rare (12
total instances across the codebase) — confirming Pass 20 §4's
"limited layout jumping" continuity-feel finding.

**Cleanup risk:** "extract spacing tokens" — collapsing the 11
distinct values to a 4-step scale.

**Verdict:** restrained density doctrine. The 11 values form a
calibration curve, not duplication.

### 3.5 The bd-* utility family already IS the consolidation

Future contributors performing a "design-system extraction sweep"
risk re-creating what already exists. Inventory of the bd-*
families:

| Family | Variants | Count |
|---|---|---|
| `bd-glass-card` (+ `--map`, `--floating`, `--panel`) | 5 | 102 |
| `bd-dashboard-*` (`primary-button`, `secondary-button`, `panel`, `panel--deep`, `chip`, `note`, `note--deep`, `section`, `section--deep`, `section--accent-blue`, `section--accent-cyan`, `section--interactive`) | 12 | 311 |
| `bd-report-*` (`input`, `section`, `primary-button`) | 3 | 63 |
| `bd-glass-control--utility`, `--secondary` | 2 | 43 |
| `bd-light-surface`, `bd-section-eyebrow`, `bd-bloom-atmosphere`, `bd-notice--warn`, `bd-glass-panel` | 5 | 78 |

100+ class names with intentional context-specific variants
(`--deep`, `--map`, `--accent-blue`, `--utility`, `--secondary`,
`--warn`, `--interactive`, `--floating`, `--panel`).

**Doctrine encoded:** the consolidation already happened. The bd-*
system is a curated design-token surface where each variant exists
because a specific surface needed it. Calling for "design-system
extraction" in this repo is calling for re-doing finished work,
likely producing a parallel less-curated layer.

**Cleanup risk:** future contributor sees both `bd-*` classes AND
hardcoded Tailwind values like `backdrop-blur-2xl`, treats the
mixed usage as "incomplete adoption," and tries to push everything
into bd-* OR push everything to raw Tailwind. Either flattens
intentional opt-out for surfaces that needed local tuning.

**Verdict:** the bd-* + raw-Tailwind hybrid is doctrine. The hybrid
gives surfaces a default (bd-*) AND an escape hatch (raw Tailwind)
when local context requires it.

### 3.6 Touch-target coverage is comprehensive (a11y not a survivability concern)

**Inventory:** 198 `min-h-[44px]` + 23 `min-w-[44px]` instances.
Apple HIG / Material 44pt minimum touch target enforced
aggressively across interactive elements.

**Verdict:** no a11y concern surfaced this pass on touch-targets.
This is a NEGATIVE finding — i.e. the audit lane checked and found
coverage healthy. Logged for the cumulative invariants ledger.

### 3.7 map-ui-enter staggered reveal family

**Inventory:**

| Class | Count | Stagger encoded |
|---|---|---|
| `map-ui-enter` | 37 | Base reveal |
| `map-ui-enter-delay-1` | 7 | Tier-1 stagger (atmosphere first) |
| `map-ui-enter-delay-2` | 4 | Tier-2 stagger (operating layer second) |
| `map-ui-enter-delay-3` | 6 | Tier-3 stagger (cards/sheets third) |

**Doctrine encoded:** map UI doesn't appear instantly — it cascades.
Atmosphere arrives first (giving the user one beat to register the
map context), operating layer second (compass, status), then
operating cards. This is **interruption pacing** disguised as
animation timing.

**Cleanup risk:** "remove stagger delays for snappy UX." This would
collapse interruption pacing into instant-state-change.

**Verdict:** stagger family is doctrine-loaded. Add to FALSE-A-PURE
registry as candidate "animation stagger semantics."

---

## 4. Updated FALSE-A-PURE registry (cumulative across passes)

| Utility / Pattern | Pass discovered | Hidden doctrine load |
|---|---|---|
| `validateAppConfig` | 16 | Type-vs-function asymmetry |
| `lazyWithRetry` | 18 | 1500ms retry pacing as trust choreography |
| `use-mobile` | 18 | Hardcoded 768px + boolean coalescing |
| `popup max-width tokens` | 19/20 | Map-occlusion + touch-reach + criticality + body-vs-overlay |
| `truncate vs flex-wrap policy` | 20 | Per-surface single-line vs natural-flow CHOICE |
| `backdrop-blur 5-tier palette` | **21** | Veiling depth = interruption gravity |
| `duration 7-tier pacing palette` | **21** | Emotional pacing + sheet open-vs-close asymmetry |
| `z-tier 38+ values` | **21** | OS-style attention hierarchy across 8+ operating layers |
| `gap density curve` | **21** | Restrained density doctrine |
| `bd-* + raw-Tailwind hybrid` | **21** | Default + escape-hatch design-token discipline |
| `map-ui-enter stagger family` | **21** | Interruption pacing disguised as timing |

**11 confirmed FALSE-A-PURE × 3 confirmed A-pure** (`Sentry init`,
`useOnlineStatus`, `cn`). Split now ~11:3 against generic UI
extraction. **Visual systems carry hidden survivability doctrine
roughly 4× more often than they appear extractable.**

---

## 5. Continuity-feel observations (Priority E)

The repo's "felt stability" appears to emerge from compounded
restraint:

1. **Selective inconsistency** (§3.1, §3.2, §3.4) — the codebase
   intentionally maintains 5 backdrop-blur tiers, 7 duration tiers,
   11 gap values. None are normalized.
2. **Local pacing control** (§3.7) — map-ui-enter staggers are
   per-surface, not centralized.
3. **Asymmetrical interruption handling** (§3.3) — z-tier system
   gives different interruption types different attention bands.
4. **Calm overlay choreography** — sheet asymmetry (open=500ms,
   close=300ms) rewards reveal deliberation while respecting exit
   speed.
5. **Visible ownership locality** — bd-* families have explicit
   variants per role; no "generic component" hiding role behind
   props.
6. **Restrained density** — 85% of gaps in `gap-1` through `gap-3`
   range; large-density jumps are rare and intentional.
7. **Shallow orchestration** — confirmed in Pass 20; no
   provider-of-providers, no orchestration aggregator.

Each of these is a small restraint. Together they produce continuity.
Centralizing any one would not visibly break the runtime — but
removing several would compound into "this app feels different now"
without anyone being able to point at the change.

---

## 6. Anti-cleanup pressure signals (Priority D)

Re-scan of recent commits (Pass 290-303) and PLAN docs for the
brief's listed pressure phrases — same as Pass 20:

| Pressure phrase | Found in repo? |
|---|---|
| "standardize" | Not found in any 2026-05 commit message |
| "normalize" | Not found in 2026-05 commits |
| "consistent" | Used in REFs as a description, never as a directive |
| "shared overlay" | Not found |
| "common card shell" | Not found |
| "token cleanup" | Not found |
| "animation unification" | Not found |
| "design system extraction" | Not found |

**Brief observation confirmed:** absence of cleanup-pressure
language is a strategic indicator. Pass 300 (anti-extraction
discipline) and Pass 303 (anti-sprawl doctrine, in flight) are
producing language that **pre-empts** cleanup pressure. The doctrine
counterweights are influencing contributor psychology before the
pressure can crystallize.

---

## 7. Cumulative ledger update (after Pass 21)

- **Total findings across 21 passes:** ~245 (12 new this pass:
  §2.2-§2.3 correction + 7 casebook entries §3.1-§3.7 + §5
  continuity emergence + §6 absence-of-pressure restated +
  motion-reduce false-positive logged).
- **A-pure pressure-test split:** 11:3 against generic UI extraction
  (was 5:3 after Pass 20).
- **FALSE-A-PURE registry:** grew by 6 new entries this pass
  (backdrop-blur, duration, z-tier, gap, bd-* hybrid, stagger).
- **Pass 20 §2.4 motion-reduce gap:** formally corrected as
  false-positive (CSS-first lock provides comprehensive coverage).
- **Source edits this pass:** ZERO. Restraint observed.
- **New audit principles (3 added on top of Pass 20's 5):**
  1. **Repeated structure ≠ shared doctrine** (brief's most
     important new principle).
  2. **CSS-first locks are doctrine; component-class redundancy is
     belt-and-suspenders, not canonical.**
  3. **Selective inconsistency compounds into continuity** — the
     felt-stability emerges from 7+ independent restraints, none
     of which alone produces it.

---

## 8. Standdown

- ✅ AI_LOCK race tolerated (Pass 303); files do not overlap.
- ✅ `git status` reviewed; no other-lane work touched.
- ✅ Zero source edits — restraint maintained.
- ✅ One evidence file produced.
- ✅ Pass 20 §2.4 self-correction recorded against new evidence.
- ✅ 7 visual-doctrine casebook entries added.
- ✅ FALSE-A-PURE registry doubled (5 → 11).
- ✅ No LAW edits. No AI_LOCK edits. No source files in active
  modification touched.
- ✅ Three new audit principles added to the ledger.

Audit lane releasing for next pass. The architecture continues
proving the same dominant interpretation: **visual systems carry
hidden survivability doctrine; selective inconsistency is the
mechanism by which continuity is preserved; the bd-* + raw-Tailwind
hybrid is doctrine, not incomplete adoption.**
