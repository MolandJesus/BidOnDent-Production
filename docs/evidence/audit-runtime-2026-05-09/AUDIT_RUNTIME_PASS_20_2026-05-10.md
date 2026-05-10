# Audit Runtime Pass 20 — Second-Order False-Universal Detection (Visual Cleanup Pressure)
**Date:** 2026-05-10
**Lane:** Audit AI (observational this pass; design-fix authority unused)
**Branch:** BidOnDent-Horizon-Beta
**Companion to:** Pass 19 (first design-hygiene patches), Pass 18 (FALSE-A-PURE registry).

---

## 0. Mission this pass

Owner relay 2026-05-10 #27 explicitly redirected the audit lane AWAY
from cleanup escalation and TOWARD second-order false-universal
detection. Critical reframing: when a UI pattern repeats, **the
question is not whether it's duplicated — the question is whether
deduplicating it would silently erase behavioral locality.**

Constraints this pass: no helpers, no hooks, no utilities, no
truncation wrappers, no popup-sizing infrastructure, no shared
overlay shell, no spacing tokens, no design-system cleanup. Observe
first.

**This pass produced ZERO source edits.** The fixer-authority
granted to the audit lane in Pass 19 was intentionally unused this
pass — the brief's praise of Pass 19's restraint was treated as a
signal that further design fixes should wait until clearly visible
defects surface, not be hunted for. Pass 20 is pure reconnaissance.

---

## 1. Pre-flight discipline

- **AI_LOCK status:** Active AI is Claude Opus 4.7 (1M ctx) holding
  Pass 303 (Platform-Core Anti-Sprawl Doctrine artifact). Their
  locked files are `docs/REF_PLATFORM_CORE_ANTI_SPRAWL_DOCTRINE_2026-05-10.md`
  + `AI_LOCK.md`. **Zero overlap with this pass.** AI_LOCK.md
  intentionally not modified.
- **`git status`:** other-lane uncommitted work preserved untouched
  (LAW docs, REF docs, ShopMapWidget, test files, Pass 302/303
  artifacts).
- **TS verification ceiling:** not re-run this pass since no source
  edits made.

---

## 2. Reconnaissance results

### 2.1 The `truncate` family is NOT a false-A-pure candidate — but it surfaces a different finding

**Raw counts across `src/app/`:**

| Pattern | File count |
|---|---|
| `truncate` | 42 files |
| `flex-wrap` | 76 files |
| `line-clamp-N` | (sampled, ~6 files) |
| `break-words` / `break-all` | (sampled, ~3 files) |

**Critical observation:** `truncate` and `flex-wrap` are CONTRARY
policies, not duplicate ones. They encode opposite decisions:

- `truncate` says: "single-line, callsite-bounded, scanning-priority,
  show as much as fits on one row, ellipsis the rest."
- `flex-wrap` says: "natural multi-line flow, density-priority,
  preserve full information, accept variable row heights."
- `line-clamp-N` says: "truncate at row N, hybrid policy."

The repo has 76 surfaces choosing flex-wrap and 42 choosing truncate
— **almost a 2:1 preference for natural flow over single-line
truncation.** That ratio is itself doctrine. A "TruncatingFlexRow"
helper would erase this CHOICE and pressure surfaces toward the
truncation policy, even where the surface intentionally chose wrap
(LikedShopCard, NavigationBrowseDiscoveryPanel header chip rows,
ShopDirectoryHybridStage badge clusters, etc.).

**Verdict:** the `min-w-0 flex-1 + truncate` triad IS legitimate
narrow CSS hygiene when the design intent is single-line — but the
PREDICATE "design intent is single-line" is itself a per-surface
decision that no helper can encode. The Pass 19 patches were correct
because they preserved an existing `truncate` intent that wasn't
firing; they would have been WRONG if applied to a `flex-wrap`
surface to "make it consistent."

This is a new audit principle worth recording:

> **The CSS-hygiene unit is the triad
> (`min-w-0 flex-1` + `truncate`/`line-clamp-N` + bounded ancestor).
> The DESIGN unit is the per-surface choice between truncation and
> wrapping. Helpers can fix triad mechanics; helpers cannot fix
> per-surface design choice.**

### 2.2 Popup-width policy IS a false-A-pure candidate (confirmed)

Inventory of `max-w-[N]` and `<Popup maxWidth>` values in surface
order, with my reading of what each width encodes:

| Surface | Width | Behavioral encoding |
|---|---|---|
| `ReportLayerPopup` | `min-w-[160px] max-w-[260px]` | Tiny pin-info popup; preserves map visibility |
| `ShopDirectoryMapPopup` (compact) | `maxWidth="264px"` | Mobile pin-info; maximally compact |
| `ShopDirectoryMapPopup` (default) | `maxWidth="320px"` | Desktop pin-info; comfortable |
| `MapNavigationHud` | `max-w-[320px]` | HUD card; one-thumb readable |
| `NavigationActiveSpeedPanel` | `max-w-[248px]` | Speed indicator; minimal interruption |
| `CoverageBrowseMapOverlays` (sidebar) | `max-w-[320px] sm:max-w-[380px]` | Browse rail; medium |
| `NavigationTurnListSheet` | `max-w-[420px]` | Turn list; readable but compact |
| `NavigationVoiceControlsSheet` | `max-w-[440px]` | Voice controls; touch-target reach |
| `NavigationSettingsSheet` | `max-w-[440px]` | Settings; same touch reach as voice |
| `NavigationActiveManeuverCard` | `max-w-[640px]` | Maneuver card; dense info during nav |
| `CoverageBrowseMapOverlays` (banner) | `max-w-[680px]` | Discovery banner; comfort reading |
| `NavigationSummarySheet` | `max-w-[720px]` | Trip summary; reflective post-nav widest |
| `ShopDirectoryHybridHeader` | `max-w-[46rem]` (≈736px) | Hero text column |
| `OperatingRegionsSection` | `max-w-[1080-1100px]` | Page body width |
| `ShopDirectoryHybridStage` | `max-w-[1480px]` | Page container ceiling |
| `ImmersiveMapResultsDrawer` | `sm:max-w-[85vw]` | Side drawer; viewport-relative |
| `ShopDirectoryGuidanceCard` | `max-w-[calc(100vw-1.5rem)]` | Guidance toast; viewport-relative |

**16 distinct width policies × multiple ratios encoded:**

1. **Map-occlusion ratio** — popup widths 160-320px on mobile (375px)
   keep 14-57% of the map visible. A "popup width token" helper would
   force a single ratio and break the spatial trust calibration that
   distinguishes pin-info (preserves map) from navigation-card
   (preserves info).
2. **Touch-reach asymmetry** — 440px sheets fit one-thumb portrait
   reach (iPhone 15 Pro Max thumb arc ≈ 425-450px from corner).
   320px HUDs are corner-anchored, not thumb-reachable. 720px summary
   is both-hands post-arrival. A unified token would erase this
   ergonomic split.
3. **Information criticality vs interruption depth** — 248px speed
   panel is maximally non-interruptive (one number); 720px summary is
   maximally interruptive (trip review demands attention). The width
   IS the interruption signal. Centralizing breaks the signal.
4. **Page-body vs map-overlay** — 46rem-1480px is page-body land;
   160-720px is map-overlay land. Different layout grammars. A
   "container max-w token set" would mix them and cause cross-context
   misuse.

**Verdict: confirmed FALSE-A-PURE.** Popup-width tokens look generic
but encode at minimum 4 distinct doctrine layers (map-occlusion,
touch-reach, criticality, body-vs-overlay). Adding to the registry:

| FALSE-A-PURE registry (cumulative across passes) | Hidden doctrine load |
|---|---|
| `validateAppConfig` | Type-vs-function asymmetry |
| `lazyWithRetry` | 1500ms retry pacing as trust choreography |
| `use-mobile` | Hardcoded 768px + boolean coalescing |
| `popup max-width tokens` (Pass 19, confirmed Pass 20) | Map-occlusion + touch-reach + criticality + body-vs-overlay |
| **`truncate vs flex-wrap policy`** (new this pass) | Per-surface single-line vs natural-flow CHOICE |

5 confirmed FALSE-A-PURE × 3 confirmed A-pure (`Sentry init`,
`useOnlineStatus`, `cn`). Split now ~5:3 against generic UI
extraction.

### 2.3 Z-tier is structured, not duplicated

The 27 sampled `z-[N]` callsites form a clear pyramid:

| Z-band | Tier | Purpose |
|---|---|---|
| 1 | Local widget | Navigation menu indicator |
| 50-60 | Bid sheet | Modal-equivalent (shadcn baseline) |
| 248-260 | Map atmosphere | Gradient overlays, glow flow, vignette |
| 400-430 | Map UI | Status bar, navigation HUD |
| 500-565 | Map operating layer | Top bar, headers, navigation cards/sheets |
| 610-620 | Mobile primary drawer | Bottom sheet + close button |
| 700 | System dialog | shadcn dialog close button |
| 9999 | Critical system messages | Toast notifications, offline banner |

**This is doctrine, not entropy.** The Pass 16 finding of "modal
z-tier inconsistency across 4/5 modal families" should be re-read in
this light — what looks like inconsistency may be deliberate
operating-layer separation. Worth a follow-up pass to re-classify
Pass 16's modal z-finding under this rubric.

### 2.4 Animation discipline — partial coverage gap detected

`animate-in` family appears 101 times. BD's hand-rolled overlays
(MapBidSheet, ReportLayerPopup, NavigationBrowseDiscoveryPanel, etc.)
consistently pair `animate-in fade-in zoom-in-95 duration-200` with
the explicit `motion-reduce:animate-none` LAW-mandated escape clause.

**However:** the shadcn primitives (alert-dialog.tsx, popover.tsx,
hover-card.tsx, sheet.tsx, navigation-menu.tsx) use Radix's
`data-[state=open]:animate-in` syntax WITHOUT pairing it with
`motion-reduce:animate-none`. This may or may not be a survivability
gap:

- **Possibly fine:** `tailwindcss-animate` plugin honors
  `prefers-reduced-motion: reduce` at the CSS level by default —
  the `animate-in` keyframes are wrapped in `@media (prefers-reduced-motion: no-preference)` automatically.
- **Possibly a gap:** if BD overrides the plugin's defaults anywhere,
  or if a future Tailwind upgrade changes the plugin's
  reduced-motion behavior, the shadcn primitives would lose their
  reduced-motion respect silently while BD's hand-rolled overlays
  would remain protected by their explicit class.

**This is a recommended investigation, NOT a fix.** Adding
`motion-reduce:animate-none` to shadcn primitives would be a
1-line-per-file mechanical patch — but only if confirmed needed.
The audit lane should not pre-emptively patch shadcn defaults
without first running a `prefers-reduced-motion` test in Chrome to
confirm whether the gap is real. Logged for Phase G live-Chrome pass.

---

## 3. Second-order cleanup-pressure detection (Priority D)

Scanned recent commit messages (Pass 290-303) and PLAN docs for
phrases the brief flagged as second-order pressure signals:

| Pressure phrase | Found in repo? | Notes |
|---|---|---|
| "this pattern appears everywhere" | Not found | |
| "easy abstraction win" | Not found | |
| "standardize layout behavior" | Not found | |
| "shared popup wrapper" | Not found | |
| "common overlay shell" | Not found | |
| "extract spacing tokens" | Not found | |
| "normalize truncation handling" | Not found | |
| "design-system cleanup" | Not found | |

**Cleanup-pressure language is absent from recent doctrine
artifacts.** Pass 300 (anti-extraction discipline) and Pass 303
(in flight, anti-sprawl doctrine) are actively producing language
that pre-empts cleanup pressure. The doctrine layer is doing its
job — there is no abstraction-attractor pressure visible in the
last ~15 passes.

**Possible early-warning signal to monitor in future passes:** if
Pass 19's overflow patches inspire a future PR titled "centralize
truncate utility" or "unified popup container" or similar, that
would be the first abstraction-attractor surfacing post-extraction.
None observed yet.

---

## 4. Continuity-feel preservation observations (Priority C)

Without live Chrome runtime access, the read-only signals available
are:

- **Shallow interruption surfaces:** map operating-layer cards
  (z-560/565) appear via `map-ui-enter` family with `delay-1`/`delay-2`
  staggers, not all-at-once.
- **Low-drama transitions:** `duration-200`/`duration-300`/`duration-400`
  dominate. No `duration-700+` aggressive transitions found in
  in-flow surfaces.
- **Restrained overflow behavior:** `overflow-hidden` paired with
  `rounded-[N]` consistently across map panels — no scrolling
  overflow leakage.
- **Calm density handling:** `gap-1.5` / `gap-2` / `gap-3` dominate
  flex containers. No `gap-6+` density jumps in close proximity.
- **Limited layout jumping:** stagger delays (`map-ui-enter-delay-1`
  through `delay-2`) are used to sequence appearances, not to compress
  motion into instant state-change.
- **Soft collapse patterns:** `data-[state=closed]:duration-300
  data-[state=open]:duration-500` (sheet.tsx) is asymmetric — opens
  feel earned, closes feel quick. This is emotional choreography.
- **Visible ownership locality:** App.tsx still mounts providers
  in explicit, source-readable order; no hidden provider registry.
- **Orchestration shallowness:** no provider-of-providers patterns
  observed.

**Tentative pattern:** the felt continuity appears to come from
deliberate timing asymmetry (open slow, close fast), shallow stack
depth, and per-surface transition tuning — none of which would
survive centralized motion infrastructure. Pass 303's anti-sprawl
doctrine is targeting exactly this preservation.

---

## 5. New audit principles surfaced this pass

For inclusion in the framework predictions ledger:

**A. Contrary-policy distinction:** when two CSS classes encode
opposite design intents (e.g., `truncate` vs `flex-wrap`), their
co-occurrence in the same codebase is doctrine, not duplication.
Helpers must not erase the choice between them.

**B. Width as multi-doctrine encoding:** popup/sheet width values
encode at minimum 4 doctrine layers (map-occlusion, touch-reach,
information criticality, layout-grammar). Width tokens are
FALSE-A-PURE.

**C. Asymmetric timing as emotional choreography:** opens-slower-
than-closes is not arbitrary; it's a trust-choreography decision
that centralized motion utilities would erase.

**D. Triad-vs-choice separation:** mechanical CSS triads
(`min-w-0 flex-1 + truncate` etc.) ARE legitimately fixable. The
PER-SURFACE CHOICE of which triad to use is NOT. Audit lane fixes
should always be in the first category, never the second.

**E. Anti-pressure doctrine works:** when active doctrine writers
(Pass 300, 303) explicitly name the pressure signals before they
arise, the pressure does not arise. Pass 20 found zero
abstraction-attractor language in recent passes.

---

## 6. Cumulative ledger update (after Pass 20)

- **Total findings across 20 passes:** ~233 (5 new this pass: §2.1,
  §2.2, §2.3, §2.4, §3 cleanup-pressure absence).
- **A-pure pressure-test results:** 8 utilities tested → 3 confirmed
  + 5 FALSE-A-PURE.
- **Platform-core sprawl status:** still 2 entries + README. Sparse
  discipline holds. No new extraction this pass. Pass 303 active on
  doctrine-only artifact.
- **Source edits this pass:** ZERO. Restraint observed per brief.
- **Visible defects requiring fix:** none surfaced this pass.
- **New investigation candidates:**
  1. Pass 16 modal z-tier finding — re-classify under operating-layer
     framework from §2.3.
  2. shadcn `motion-reduce:animate-none` coverage — confirm via live
     Chrome whether `prefers-reduced-motion` is honored by tailwindcss-animate
     defaults in BD's specific Tailwind version.
- **New audit principles (5)** documented in §5 for future-pass
  reference.

---

## 7. Standdown

- ✅ AI_LOCK race detected; Pass 303 holds, files do not overlap.
  AI_LOCK.md not modified.
- ✅ `git status` reviewed; no other-lane work touched.
- ✅ Zero source edits — restraint observed per brief praise of
  Pass 19.
- ✅ One evidence file produced
  (`docs/evidence/audit-runtime-2026-05-09/AUDIT_RUNTIME_PASS_20_2026-05-10.md`).
- ✅ Five new audit principles recorded for ledger.
- ✅ Two follow-up investigation candidates logged (not acted on).
- ✅ No LAW edits, no AI_LOCK edits, no source files in active
  modification by other lanes touched.

Audit lane releasing for next pass. Builder/Platform lane retains
authority via Pass 303.
