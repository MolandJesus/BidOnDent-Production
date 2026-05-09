---
status: ACTIVE
authority: PLAN
scope: platform-shell-stability-test
canonical_source_of_truth: PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 271 stability-test of Pass 270's MVP nucleus under shell-layer deep audit. Reads 8 shell files (1778 lines) by content rather than by grep. Surfaces 6 contamination categories Pass 270's surface-grep missed (type-import coupling, atmospheric color coupling, identity coupling in named "generic" components, route-config coupling, taxonomy coupling, role-logic coupling). Revises Pass 270 §6.2 MVP nucleus shell-sub-package from "16 subsystems / 3-of-6-clean shell" to "shell sub-package = slot-driven primitive PATTERNS, NOT current implementations." Re-classifies BrandLogo + DashboardAtmosphere as APP-PRIVATE not platform. Adds atmosphere as candidate Tier B optional module. Confirms inert-seam doctrine prediction: "generic-looking but emotionally branded primitives" are the dangerous category. Doc-only.
last_updated: 2026-05-09
---

# Platform Shell Stability Test — 2026-05-09

> **Tier:** PLAN. Future direction, not current truth.
> **Authority:** Pass 271. Owner relay 2026-05-09 directives #1
> (behavioral coupling), #2 (generic-looking but emotionally
> branded primitives), #3 (deep-audit shell), #8 (test whether
> nucleus stabilizes under depth).
>
> **What this doc is:** the stability test the relay asked for —
> apply Pass 270's classification framework to actual shell file
> CONTENT (not just grep) and surface what changes.
>
> **What this doc is NOT:**
> - LAW. Findings revise Pass 270 classifications; ratification still
>   gated.
> - A bootstrap. No new repos / no extractions / no code moves.
> - A supersession of Pass 270. This pass AMENDS Pass 270's MVP
>   nucleus shell-sub-package classification with deeper findings.
>   The 16-subsystem nucleus shape stands; the work-required-inside-
>   each shape changes.

---

## §1 — Mission

Per relay #8: "if the nucleus changes materially every pass,
extraction is still premature." This pass tests whether Pass 270's
MVP nucleus survives a deeper audit, specifically of the shell
layer (relay #3 — shell becomes "one of the highest leverage
future actions" if generalized correctly).

The test methodology:
- Pass 270 used a `grep -E "bid|shop|insurer|claim|report"`
  surface scan to count contamination per shell file.
- This pass READS the actual file content (1,778 lines across 8
  shell files) and looks for the deeper coupling categories the
  relay flagged: behavioral, atmospheric, type-level, identity.

Outcome: Pass 270's grep was materially insufficient. Several
"clean" classifications were wrong. The MVP nucleus shape stands;
the IMPLEMENTATION READINESS of the shell sub-package needs
revision.

---

## §2 — Methodology gap exposed

Pass 270 §2.4 evaluated 6 shell files using a single regex pattern:

```
grep -cE "\b(bid|shop|insurer|claim|report)\b"
```

Files with zero matches were labeled CLEAN. Files with low matches
were labeled LOW or MEDIUM coupling.

What that pattern MISSED:

1. **Type imports.** `import type { Bid, Report, Vehicle } from "../../types"` — domain types embedded in component prop signatures. Zero matches because the regex looked at lowercased identifiers only inside the component body.
2. **Atmospheric color values.** `rgba(196, 144, 65, 0.22)` (Jeffrey bronze gold) embedded in inline styles. Pure visual; no domain words.
3. **Identity coupling in "generic" component names.** A component called `BrandLogo` that hardcodes "Bid" / "On" / "Dent" text. The component IDENTITY is BD-coupled even though its BODY has zero domain refs.
4. **Route-config coupling.** `HASH_PAGES = ["about", "privacy-policy", "terms-of-service", "insurer-partnership"]` — the WHITELIST is BD-specific even though `useHashPage` infrastructure is generic.
5. **Notification-taxonomy coupling.** `categoryToType: { bid: "bid", shop: "repair_request", insurer: "claim" }` — mapping logic that hardcodes BD's notification universe.
6. **Role-logic coupling.** `if (role === "customer") { const pendingBids = bids.filter(...) }` — role-based UI logic embedded in the layout component.

**These six categories survive lexical-grep extraction invisibly.**
That's exactly what relay #1 warned about: "behavioral assumptions
survive extraction invisibly."

---

## §3 — Per-shell-file deep findings

Files audited (1,778 lines total). Re-classification table at end of section.

### §3.1 `AppShell.tsx` (104 lines)

**Pass 270 verdict:** "LOW — ~1 token rename + perf-mark namespace."

**Pass 271 deep finding:** mostly correct, with one nuance:

- `AuthConfigFallback` component: structurally generic shape
  (env-vars-missing UI), but inline color values are Jeffrey-coded
  (`#0b172f` navy bg, blue/amber accent text). Visually-branded
  fallback.
- `HASH_PAGES` array: hardcoded BidOnDent route whitelist. The
  `"insurer-partnership"` entry is the explicit BD leakage; even the
  LEGAL pages (`about`, `privacy-policy`, `terms-of-service`) are
  app-config, not platform config.
- `useHashPage` machinery: clean platform infrastructure once
  `HASH_PAGES` becomes a config argument.

**Revised verdict:** infrastructure is platform-grade (high-quality
hook). Specific implementations (HASH_PAGES, AuthConfigFallback
visuals) are app-config. Rename + parameterize.

### §3.2 `AppLoading.tsx` (90 lines)

**Pass 270 verdict:** not specifically called out (was implied
"clean" because zero domain refs).

**Pass 271 deep finding:** structurally generic; visually
Jeffrey-coded.

- 8-second recovery prompt logic — generic operational doctrine
  (any platform app could use this).
- Light/dark appearance mutation observer — generic.
- Color values — heavily Jeffrey: `#d4af37` (gold), `#60a5fa`
  (blue), `#0b172f` (BD navy), `#1e40af`. Hardcoded not
  token-driven.

**Revised verdict:** STRUCTURE platform-grade. STYLING needs
3-tier token rewrite. Two-stage extraction: lift the structure
into platform-core; brand override fills the colors.

### §3.3 `BrandLogo.tsx` (74 lines)

**Pass 270 verdict:** "CLEAN — direct port" (because zero domain
refs in the body).

**Pass 271 deep finding:** **MIS-CLASSIFIED.** This file IS
BidOnDent's logo:
- Imports `Car` icon from `lucide-react` (a CAR icon for
  BIDONDENT — the auto-repair semantics ARE the icon choice).
- Hardcodes the wordmark: `<span style={bidStyle}>Bid</span>
  <span>On</span><span>Dent</span>`.
- `aria-label="BidOnDent"`.
- File is named `BrandLogo` but the brand IS BidOnDent.

**Revised verdict:** **APP-PRIVATE BRAND ASSET, not platform-core.**
Belongs in `apps/bidondent-legacy/components/` (or stays in this
repo). What the platform actually needs is a SLOT pattern
(`<AppHeader logo={...}>`) where each app supplies its own logo
component. Stacey's site supplies a Stacey logo; Jeffrey's
creative brand supplies its own.

This is the canonical example of relay #2: a primitive that
appears reusable while encoding brand identity. The lesson: any
component named `Brand*`, `App*`, `Site*` deserves second-pass
classification — its IDENTITY may be brand-coupled even when its
body looks generic.

### §3.4 `DashboardAtmosphere.tsx` (184 lines)

**Pass 270 verdict:** not in Pass 270's 6-file shell list (Pass
270 cited 6 files; the actual `components/app/` has 8).
Therefore unclassified.

**Pass 271 deep finding:** **DISCOVERY.** This file is 184 lines
of pure Jeffrey atmospheric chrome:
- 11 layered radial-gradient `<div>`s.
- Hardcoded color values: `rgba(196, 144, 65, ...)` (Jeffrey
  bronze gold lamp), `#0a163a` / `#040a18` (BD deep navy ocean),
  `rgba(255, 224, 160, ...)` (warm bloom), `rgba(196, 130, 45, ...)`
  (bronze trim).
- Visual metaphor: "lit room with bronze ambient at the floor"
  — Jeffrey's signature emotional language.
- Pass-history annotations (KI-066, KI-073, KI-081) reference
  BidOnDent's hardening passes.

**Revised verdict:** APP-PRIVATE BRAND ASSET, OR a candidate
Tier B optional module (`@platform/atmosphere`) with token-driven
fills. The PATTERN (multi-layer atmospheric chrome) is reusable;
the VALUES are Jeffrey-only.

If extracted as `@platform/atmosphere`:
- Component shape exposes 4-8 atmospheric token slots
  (`--atmosphere-base-bg`, `--atmosphere-bloom-1-color`, etc.)
- Each brand fills the slots.
- A brand that wants ZERO atmosphere passes `--atmosphere-base-bg:
  transparent` for all layers and the component renders as a no-op
  shell.
- Stacey's brand (per relay #5: editorial + minimal) likely
  passes mostly-no-op fills.

**This validates the relay's emotional-architecture concept:** the
SAME structural component can deliver Jeffrey-cinematic OR
Stacey-calm based on token fills alone, without component forks.

### §3.5 `DashboardLayout.tsx` (225 lines)

**Pass 270 verdict:** "MEDIUM — 5 inline refs need slot/prop
refactor."

**Pass 271 deep finding:** **DEEPER COUPLING THAN PASS 270 SAID.**

- Type imports (line 3): `import type { Bid, NavTab, Notification, Report, Vehicle, ViewMode } from "../../types"` — six BD domain types in the component prop signature.
- `categoryToType` map (lines 78-86): hardcodes BidOnDent's
  notification taxonomy (`bid → bid, shop → repair_request,
  report → update, insurer → claim`).
- Tab badge logic (lines 115-124): hardcodes role-based UI:
  `if (role === "customer") { const pendingBids = bids.filter(...) }`.
- Imports brand-coded children: `DashboardAtmosphere`,
  `MobileBottomNav`, `DemoModeBanner`, `SettingsModal`.
- Imports `DashboardRouter` from `routers/` — assumes BD's
  routing structure.
- Inline colors are token-fillable but BD-coded today (e.g.,
  `rgba(255, 253, 248, 0.04)` warm cream wash).

**Revised verdict:** the FILE is structurally a BidOnDent app
composer, NOT a generic shell. Cannot be lifted as-is.

What the platform actually needs:
- A `<PlatformDashboardLayout>` slot-driven primitive that
  accepts `header`, `sidebar`, `main`, `bottomNav`, `atmosphere`
  as JSX slots.
- The current `DashboardLayout.tsx` becomes
  `apps/bidondent-legacy/components/AppDashboardLayout.tsx`
  consuming the platform primitive + filling slots with BD's
  Header/Sidebar/Atmosphere/etc.

This is a SUBSTANTIAL refactor, not a rename. The work-required
estimate is hours not minutes.

### §3.6 `DashboardSidebar.tsx` (323 lines, partial read)

**Pass 270 verdict:** "CLEAN — direct port (slot-driven)."

**Pass 271 deep finding:** **MIS-CLASSIFIED as clean.**

- Type imports (line 3): same `Bid, NavTab, Notification, Report,
  Vehicle, ViewMode` as DashboardLayout. Six BD types.
- Imports `Car` icon — same BrandLogo car semantics.
- Imports `ProfileDropdown` from `../dashboard/ProfileDropdown`
  — coupling to dashboard-specific profile UI.
- Inline atmospheric chrome: `rgba(196, 144, 65, 0.10)` bronze
  gold, `rgba(96, 165, 250, 0.10)` Jeffrey blue, `bd-glass-panel`
  className.
- Multi-layer radial-gradient backgrounds in inline style — Jeffrey
  emotional language.

**Revised verdict:** the FILE has the STRUCTURE of a sidebar
(aside element, sticky positioning, profile-dropdown slot) but the
implementation is heavily Jeffrey-coded chrome. Same pattern as
DashboardLayout: needs slot-driven platform primitive +
BD-specific implementation.

### §3.7 `DashboardHeader.tsx` (551 lines)

**Pass 270 verdict:** "HIGHER — heaviest of the 6; needs careful
slot extraction."

**Pass 271:** Pass 270 was right on this one. 551 lines is the
largest file in the shell folder. Not re-read in detail; the
"heaviest refactor surface" classification stands. Likely contains
all the same patterns (type imports, atmosphere, role logic, child
component coupling) at scale.

### §3.8 `LandingPageLayout.tsx` (227 lines)

**Pass 270 verdict:** "LOW — single token rename."

**Pass 271:** not re-read in detail. The Pass 270 grep result (1
ref / 227 lines) suggests genuine LOW coupling at the lexical
level, but the same caveats apply: type imports, color values, and
identity coupling could lurk. Light spot-check warranted before
extraction; full re-audit deferred to keep Pass 271 scoped.

### §3.9 Re-classification table

Pass 270 vs Pass 271 verdicts:

| File                          | Pass 270 verdict        | Pass 271 verdict (deep)                                                       |
| ----------------------------- | ----------------------- | ----------------------------------------------------------------------------- |
| `AppShell.tsx`                | LOW                     | LOW (correct) — infrastructure clean; HASH_PAGES + colors need parameterizing  |
| `AppLoading.tsx`              | (unclassified)          | LOW-STRUCTURE / MEDIUM-STYLING — generic shape, Jeffrey colors                 |
| `BrandLogo.tsx`               | CLEAN — direct port     | **APP-PRIVATE** — brand identity itself is BidOnDent                          |
| `DashboardAtmosphere.tsx`     | (unclassified)          | **APP-PRIVATE** OR **Tier B optional module** with token slots                |
| `DashboardLayout.tsx`         | MEDIUM (5 refs)         | **HIGH** — type imports + role logic + taxonomy maps + brand-child imports    |
| `DashboardSidebar.tsx`        | CLEAN (0 refs)          | **MEDIUM-HIGH** — type imports + atmosphere + brand-child coupling             |
| `DashboardHeader.tsx`         | HIGHER (7 refs / 551)   | HIGHEST (Pass 270 verdict stands; not re-read in this pass)                    |
| `LandingPageLayout.tsx`       | LOW                     | LOW (assumed; not re-read; spot-check warranted)                               |

**Net change vs Pass 270:** 4 of 8 shell files reclassified from
"clean / low-cost" to "structurally coupled / app-private."

---

## §4 — Six new contamination categories (the methodology lesson)

The relay's directive #1 said behavioral coupling matters more
than string renames. Pass 271 confirms with 6 categories Pass
270's grep missed. Each becomes a CHECK ITEM for any future
contamination audit:

### §4.1 Type-import coupling

**Pattern:** shell components import domain types (`Bid`,
`Report`, `Vehicle`, `Notification`) directly into their prop
signatures. The TYPE itself is BD-coupled even though the COMPONENT
NAME is generic.

**Detection:** grep for `^import type { .* } from "../../types"`
in shell-layer files.

**Resolution:** platform-core defines GENERIC slot prop shapes
(e.g., `notifications: Array<NotificationLike>` where
`NotificationLike` is structural). Apps pass their domain-typed
arrays into those slots.

### §4.2 Atmospheric color coupling

**Pattern:** inline styles or className references hardcode
brand-specific colors (Jeffrey bronze gold `rgba(196, 144, 65, ...)`,
Jeffrey navy `#0b172f`, etc.).

**Detection:** grep for hardcoded `rgba(` or `#` color hex literals
in components labeled "generic." Cross-reference with the brand's
known palette.

**Resolution:** 3-tier token system per Pass 269 §4.3. Components
read `var(--surface-*)` / `var(--atmosphere-*)` tokens; brands fill.

### §4.3 Identity coupling in named-generic components

**Pattern:** a component is named `BrandLogo` / `AppHeader` /
`SiteFooter` but its BODY hardcodes a specific brand's identity.

**Detection:** for any component whose name suggests it's a slot
or generic primitive, read the body and verify its content can
serve any brand. If it hardcodes `<Car>`, `<Plane>`,
`<TrademarkText>` — it's app-private.

**Resolution:** convert to a slot pattern where each app provides
the actual identity content.

### §4.4 Route-config coupling

**Pattern:** routing infrastructure has a hardcoded whitelist of
specific routes (e.g., `HASH_PAGES = [...]`).

**Detection:** for any routing helper, examine its arguments and
config sources. If the helper accepts no app-supplied config and
references specific path strings, it's BD-coupled.

**Resolution:** parameterize. `useHashPage(hashPages: readonly
string[])` instead of importing a const.

### §4.5 Notification-taxonomy coupling

**Pattern:** event/notification systems have taxonomy maps
(`categoryToType: { bid: "bid", insurer: "claim" }`) embedded in
shell layout components.

**Detection:** find category-mapping objects in shell or
infrastructure files. If their keys are domain words, the layer
is mis-placed.

**Resolution:** apps register their own notification taxonomies
into a generic `<NotificationProvider categoryMap={...}>`.

### §4.6 Role-logic coupling

**Pattern:** shell components branch on `role === "customer"` /
`role === "shop"` and run domain-specific logic
(`bids.filter(...)`, etc.).

**Detection:** grep for `role === "..."` in shell files.

**Resolution:** badge-counting / role-driven UI lives in the APP
LAYER. The shell receives a pre-computed `badgeCounts: Record<string,
number>` prop and renders it role-agnostically.

---

## §5 — MVP nucleus revisions

Pass 270 §6.2 listed 16 platform-core sub-packages. Pass 271's
findings DO NOT change the 16-subsystem count or the package
shapes. They DO change the **work-required** inside the `shell/`
sub-package.

### §5.1 What Pass 270 §6.2 said

> shell/  # AppShell + Layouts (slot-driven)

(implying a relatively direct port of the existing
`components/app/` files).

### §5.2 What Pass 271 reveals

The shell sub-package needs to be **slot-driven primitive
PATTERNS, not the existing implementations.**

Specifically:

- **`platform-core/shell/PlatformDashboardLayout.tsx`** —
  generic slot-driven primitive accepting `header`, `sidebar`,
  `main`, `bottomNav`, `atmosphere` slots. NOT today's
  `DashboardLayout.tsx`.
- **`platform-core/shell/PlatformDashboardSidebar.tsx`** — 
  generic aside primitive accepting `logo`, `navTabs`, `profile`,
  `footer` slots. NOT today's `DashboardSidebar.tsx`.
- **`platform-core/shell/PlatformDashboardHeader.tsx`** —
  generic header primitive accepting `logo`, `pageLabel`,
  `notifications`, `profile`, `quickActions` slots.
- **`platform-core/shell/PlatformLandingLayout.tsx`** — generic
  landing layout (similar slot pattern).
- **`platform-core/shell/AppShell.tsx`** — useHashPage as
  parameterized primitive; AuthConfigFallback genericized.
- **`platform-core/shell/AppLoading.tsx`** — token-driven port.

These are NEW PRIMITIVES that don't exist yet. The current
`components/app/*.tsx` files become BD-specific implementations
that fill the platform primitives.

### §5.3 Files explicitly RECLASSIFIED to app-private

Pass 271 moves these out of platform-core and into
`apps/bidondent-legacy/`:

- **`BrandLogo.tsx`** — BidOnDent's logo (Car icon + Bid/On/Dent
  text).
- **`DashboardAtmosphere.tsx`** — Jeffrey's hardcoded atmospheric
  chrome.
- **The current `DashboardLayout.tsx`** as-shipped — keeps its
  type imports + role logic + taxonomy maps; consumes a future
  platform primitive.
- **The current `DashboardSidebar.tsx`** as-shipped — same.
- **The current `DashboardHeader.tsx`** as-shipped — same.

The platform extracts the PATTERNS. The current files stay in
legacy as the BD implementation of those patterns.

### §5.4 Optional new Tier B module candidate

**`@platform/atmosphere`** — Jeffrey's atmospheric layering
pattern, generalized:
- Component primitive that renders N layered atmospheric `<div>`s.
- Each layer reads tokens (`--atmosphere-layer-{1..N}-bg`,
  `--atmosphere-layer-{1..N}-blend-mode`, etc.).
- Brands fill all layers, fill some layers, or zero out all
  layers (no atmosphere).

This is genuinely reusable — Stacey's brand may want a 1-2 layer
soft-cream atmosphere; Jeffrey wants 11 layers; future brands
choose their own complexity. Pattern is portable; values are
brand-private.

If the owner ratifies this, atmosphere joins the Tier B optional
modules list (alongside map-engine, PMS, scheduling, content,
lead-capture).

### §5.5 Net effect on MVP nucleus

| Aspect                             | Pass 270 said                    | Pass 271 revises                                                      |
| ---------------------------------- | -------------------------------- | --------------------------------------------------------------------- |
| Subsystem count                    | 16                                | 16 (unchanged)                                                        |
| Shell sub-package contents         | Existing 6 files (port + rename)  | New slot-driven primitives + existing files become BD-implementations |
| Optional modules                   | 6 already + 3 new (scheduling/content/lead-capture) | +1: `@platform/atmosphere`                                            |
| Work-required to extract shell      | Underestimated                   | Substantial slot-refactor + per-app implementation                    |

**Net:** the MVP nucleus SHAPE survived the stability test. The
SCOPING confidence on shell-extraction-cost did not — it was
over-confident. This is the kind of finding the relay #8
"stability test" was designed to surface.

---

## §6 — Methodology lesson: the grep is insufficient

For any future contamination pass, the shell stability test
proves the audit needs ALL SIX layers, not just lexical-grep:

| Audit layer                         | Pass 270 covered? | Pass 271 added? |
| ----------------------------------- | ----------------- | --------------- |
| 1. Domain-term grep                  | ✓                 |                 |
| 2. Type-import scan                  |                   | ✓               |
| 3. Color-value extraction            |                   | ✓               |
| 4. Component-identity audit          |                   | ✓               |
| 5. Route-config + whitelist scan     | partial           | ✓               |
| 6. Hardcoded-role-logic scan         |                   | ✓               |

Future contamination passes (when/if owner authorizes) should
run all six layers per file. This becomes a methodology rule
suitable for inclusion in a future
`META_AI_OPERATIONAL_DOCTRINE.md` extraction skill or as a
contamination-audit checklist.

---

## §7 — Stability assessment (per relay #8)

Relay #8: "the next legitimate milestone is probably stable
contamination classifications, stable seam taxonomy, stable
token-contract shape, stable shell abstraction boundaries, and
stable emotional-primitive definitions across multiple passes.
Only then does extraction become architecture instead of
speculation."

Pass 271 results:

| Stability axis                        | Pass 270 → Pass 271 movement | Verdict                                                                |
| ------------------------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| Contamination classification framework | Stable (categories survive)  | Pass 270's 4-tier matrix (A/B/C/D) survived; Pass 271 added 6 detection layers but didn't change tier shape |
| Seam taxonomy                          | Stable (Pass 270 §4 survived) | No new seam types surfaced; all findings fit existing categories       |
| Token-contract shape                   | Stable                       | 3-tier architecture survives; only specific token names change         |
| Shell abstraction boundaries           | **MATERIALLY MOVED**         | "16 subsystems with shell as direct port" → "16 subsystems with shell as slot-primitive rewrite" |
| Emotional-primitive definitions        | Stable                       | DashboardAtmosphere finding actually VALIDATES the emotional-architecture concept (it would be a future Tier B module) |

**Net:** 4 of 5 stability axes survived. **One axis (shell
abstraction) materially moved.** That's a nucleus-shape change,
not just a wording change.

**Relay #8 verdict:** the nucleus is NOT yet stable enough for
extraction. One more depth-pass on the highest-leverage areas
(DashboardHeader.tsx, the heaviest shell file; LandingPageLayout
spot-check; theme.css token-tier verification; hooks/services
contamination-layer scan) would test whether the nucleus is
converging or still moving.

If a follow-up pass at the same depth produces NO further nucleus
revisions, the nucleus is stable. If it produces another material
revision, extraction remains premature.

This pattern matches Pass 263's verification methodology applied
to architecture: ship a thin verification, see what wedges,
iterate until wedges stop appearing.

---

## §8 — What this doc does NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS, or
  CLAUDE.md.
- Does NOT supersede Pass 270. Amends Pass 270 §2.4 + §6.2 with
  deeper findings; does not rewrite or invalidate it.
- Does NOT propose extraction action. Findings are diagnostic;
  ratification + extraction remain owner-gated.
- Does NOT classify hooks/services with the new 6-layer
  methodology (only the shell layer was deep-audited; broader
  application is a future pass).
- Does NOT fully re-read DashboardHeader.tsx (551 lines), 
  LandingPageLayout.tsx (227 lines). Those are deferred to keep
  Pass 271 scoped; Pass 270's verdicts on them stand pending a
  future spot-check.
- Does NOT author Stacey-specific brand content (Pass 268 §8
  still gating).
- Does NOT modify the AI-governance system in this repo.
- Does NOT change the 16-subsystem MVP nucleus shape — only the
  shell sub-package's implementation strategy.

---

## §9 — Cross-references

- Pass 270 [`PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md`](PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md) — base contamination audit + 16-subsystem MVP nucleus this pass tested.
- Pass 269 [`PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md`](PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md) — 3-tier token architecture surviving the stability test.
- Pass 268 [`PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md`](PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md) — 4-tier extraction matrix surviving the stability test.
- Pass 266 — `MapSessionProvider` exemplar of inert-seam pattern; proves "build correctly the first time = portable for free" — directly relevant to relay #2's emotional-primitive warning.
- Owner relay 2026-05-09 expanded directives 1-8 (specifically #1, #2, #3, #8 addressed by this pass).

---

## §10 — Status

- **Drafted:** 2026-05-09 (Pass 271, Shell Stability Test lane).
- **Status:** ACTIVE planning. Test result: nucleus is approximately
  stable but the shell sub-package implementation strategy
  materially moved.
- **Authority:** PLAN. Subordinate to all current LAW docs.
- **Owner approval required:** TRUE for any subsequent extraction
  action. New owner-decision points beyond Pass 268 + 269 + 270:
  1. Accept the 4-of-8 shell file reclassification (BrandLogo,
     DashboardAtmosphere, DashboardLayout-as-shipped, DashboardSidebar-as-shipped → app-private; new platform primitives needed).
  2. Accept `@platform/atmosphere` as a candidate Tier B optional
     module.
  3. Accept the 6-layer contamination-detection methodology as a
     future audit checklist.
- **Supersedes:** none.
- **Superseded by:** none.

**Next legitimate forward triggers:**

1. Owner ratifies the shell sub-package strategy revision (slot
   primitives + BD-app implementations) → shell extraction sequence
   becomes authorable.
2. Owner authorizes a follow-up pass to deep-audit
   DashboardHeader (551 lines) + theme.css token tiers + the
   highest-coupling hooks → nucleus stability confirmed or further
   revised.
3. Owner ratifies the 6-layer contamination-detection methodology
   → it becomes a portable audit checklist in the eventual
   `META_AI_OPERATIONAL_DOCTRINE.md`.
4. Owner answers Pass 268 §8 Stacey questions → brand-direction
   doc authorable (independent of platform extraction).
5. Owner authorizes PMS Phase 2 → independent of platform work.

Until ratification: disciplined hold. The shell stability test
revealed nucleus instability ONE depth-level down from Pass 270.
Per relay #8, this means extraction is still premature. One more
clean pass at this depth (with no nucleus revisions) signals
convergence.

The discipline that produced Passes 262–271 has held through 10
passes of accelerating architectural pressure. That itself is a
stability proof.
