---
status: ACTIVE
authority: PLAN
scope: platform-convergence-test-2
canonical_source_of_truth: PLAN_PLATFORM_CONVERGENCE_TEST_2_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 272 convergence test #2 per owner relay 2026-05-09 directive #8. Applies Pass 271's 6-layer contamination methodology to four surfaces deferred from Pass 271 (DashboardHeader 551 lines, LandingPageLayout 227 lines, theme.css 4913 lines sample, animations.css 553 lines, top-coupling hooks sample). Result: NO new contamination categories surface; the 6-category framework holds. The slot-driven-primitive pattern from Pass 271 extends to a new sub-package (hooks). Reclassifications: LandingPageLayout (Pass 270 LOW → actually HIGH, same pattern as DashboardLayout), useNavigation (Pass 270 MEDIUM → route-config heavy with 12-route whitelist), useAppearanceMode (Pass 270 CLEAN → actually LOW with bidondent. storage key + map-dark mode value), useUserData (Pass 270 LOW → actually HIGH with 8 type imports). Stability axes 5 of 6 survived; hook-abstraction-boundaries newly identified as needing slot-driven-primitive treatment (same shape as shell boundary movement in Pass 271). Verdict per relay #8: convergence is beginning (framework stable + same fix pattern recurring at scale) but not fully converged (services not yet tested). One more depth-pass on services + notifications taxonomy + a final spot-check should confirm convergence. Doc-only.
last_updated: 2026-05-09
---

# Platform Convergence Test #2 — 2026-05-09

> **Tier:** PLAN. Future direction, not current truth.
> **Authority:** Pass 272. Owner relay 2026-05-09 explicit
> directive #8: test whether motion systems, token tiers,
> DashboardHeader, and orchestration hooks introduce additional
> nucleus-shape revisions.
>
> **What this doc is:** the second convergence test. Pass 271 was
> the first. The methodology: apply Pass 271's 6-layer
> contamination framework to surfaces deferred from Pass 271, see
> whether new categories or major reclassifications emerge.
>
> **Outcome:** no new contamination categories. The 6-category
> framework holds. The slot-driven-primitive pattern that Pass 271
> identified for the shell sub-package is now confirmed to extend
> to the hook sub-package. Convergence beginning; not yet fully
> stable.

---

## §1 — Mission

Per relay #8: "if no major new contamination categories emerge:
the nucleus is converging. If another hidden category appears:
extraction remains premature."

Pass 272 tests against four surfaces:

1. **DashboardHeader.tsx** (551 lines) — deferred from Pass 271
   as the heaviest shell file.
2. **LandingPageLayout.tsx** (227 lines) — deferred from Pass 271
   as a spot-check.
3. **theme.css** (4,913 lines) + **animations.css** (553 lines)
   — token tier verification + motion system audit.
4. **High-coupling hooks** — sample 3 hooks at varying coupling
   levels (useNavigation, useAppearanceMode, useUserData).

Methodology: read CONTENT (not just grep), apply Pass 271's
6-layer contamination detection per file:

1. Domain-term grep
2. Type-import scan
3. Color-value extraction
4. Component-identity audit
5. Route-config + whitelist scan
6. Hardcoded-role-logic scan

If new categories emerge: nucleus still moving. If only existing
categories surface: convergence beginning.

---

## §2 — DashboardHeader.tsx (551 lines)

Pass 271 deferred this as "HIGHEST coupling — Pass 270 verdict
stands; not re-read in this pass." Pass 272 reads it.

### §2.1 Findings (per 6-layer methodology)

| Layer | Finding |
| --- | --- |
| 1. Domain-term | 7 refs (Pass 270 baseline confirmed). |
| 2. Type-import | `import type { Bid, Notification, Report, Vehicle }` (line 3). FOUR domain types. |
| 3. Color-value | Heavy. `rgba(140, 82, 22, 0.30)` bronze trim, `rgba(252, 238, 204, 0.70)` cream inset, `rgba(15, 30, 60, 0.10)` Jeffrey-shadow throughout inline styles. |
| 4. Component-identity | Imports `BrandLogo` (already reclassified app-private in Pass 271). Heavy use of `bd-shell-header`, `bd-shell-header--light`, `bd-shell-header--dark`, `bd-glass-control--utility` className refs. |
| 5. Route-config | Lines 76-100: hardcoded search-over-reports logic with explicit field access (`vehicleInfo.year`, `damageDescription`, `claimNumber`, `customerName`). The search functionality is BD-specific — it knows what "reports" look like. |
| 6. Role-logic | Less than expected — most role logic was hoisted into DashboardLayout (`role === "customer"` lives there). Header is largely role-agnostic at the React level; the role-coupling lives in the DATA the header receives. |

**Sub-finding:** "Search reports…" placeholder text (line 299, 318) — **microcopy coupling**. The search input literally says "reports" hardcoded. This is identity coupling extended to UI text — Pass 271 category #3 at the microcopy level.

### §2.2 Verdict

**Pass 271 verdict (HIGH) STANDS.** No new category surfaced.
DashboardHeader needs the same slot-driven primitive treatment
as DashboardLayout: a generic `<PlatformDashboardHeader>` with
slots for `logo`, `pageLabel`, `search`, `notifications`,
`profile`, `quickActions` — apps fill the slots with their
domain-specific implementations.

The 551-line file becomes BD's implementation of the platform
header primitive.

---

## §3 — LandingPageLayout.tsx (227 lines)

Pass 270 verdict: "LOW — single token rename." Pass 271 deferred
spot-check.

### §3.1 Findings

| Layer | Finding |
| --- | --- |
| 1. Domain-term | 1 ref (Pass 270 baseline). |
| 2. Type-import | Line 2: `import type { Bid, Notification, RedirectInfo, Report, UserInfo, Vehicle }`. SIX types — same as DashboardLayout. |
| 3. Color-value | Lines 73-126: 5 atmospheric layers (L1-L5) hardcoded with `rgba(196, 144, 65, ...)` Jeffrey bronze gold. Same Jeffrey atmosphere pattern as DashboardAtmosphere. |
| 4. Component-identity | Imports 11 BD-specific landing sections (HeroSection, BenefitsSection, BusinessInquirySection, FooterSection, etc.). The whole file is a BD-LANDING composer. |
| 5. Route-config | Implicit through the section import list — the layout assumes a specific landing structure. |
| 6. Role-logic | Line 144: `userType={redirectInfo?.type as "customer" \| "shop" \| "insurer" \| undefined}` — role-string coupling at the prop level. |

### §3.2 Verdict

**Pass 270 LOW → Pass 272 actually HIGH.** Same reclassification
pattern as DashboardLayout in Pass 271. The lexical grep for 1
domain ref undercount the actual coupling: type imports, brand-
chrome atmosphere, BD-section imports, and role-string coupling.

Same fix pattern as DashboardLayout: generic `<PlatformLandingLayout>`
with `header`, `sections[]`, `footer`, `atmosphere` slots. Apps
provide their own sections.

**No new contamination category.** The reclassification
follows the exact pattern Pass 271 established.

---

## §4 — theme.css token tiers (4,913 lines, sampled)

### §4.1 Findings

| Layer | Finding |
| --- | --- |
| 1. Domain-term | 696 `bd-` references (Pass 270 baseline). |
| 2. Type-import | N/A (CSS file). |
| 3. Color-value | Pervasive. `.bd-glass-control--secondary` hardcodes `rgba(30, 64, 175, 0.88)` Jeffrey blue gradient. Hundreds of similar instances. |
| 4. Component-identity | The file header is named "BidOnDent — theme.css Pass Index" — direct identity coupling in COMMENTS. Pass-history annotations (KI-081, KI-082, KI-083, etc.) reference BD-specific KIs. |
| 5. Route-config | The `.bd-glass-card--landing` / `.bd-glass-card--landing-warm` / `.bd-glass-card--dashboard` variants encode BD's surface taxonomy in CLASS NAMES (assumes "landing" and "dashboard" are the two surface contexts). |
| 6. Role-logic | N/A (CSS file). |

**Sub-finding:** **Surface-taxonomy coupling** at the CSS class
level (`--landing`, `--dashboard`, `--map`). Stacey's site may
have different surface taxonomy ("editorial", "consultation",
"course") — class taxonomy assumes BD's surface set.

### §4.2 Is surface-taxonomy a NEW category?

No. It's a sub-application of Pass 271 category #3 (identity
coupling). The CLASS IDENTITY encodes the app's surface
taxonomy, just as `BrandLogo`'s component IDENTITY encodes the
brand. Same category at the CSS-class level.

The Pass 269 §4.3 three-tier token architecture handles this:
brand-extensible class system where each brand defines its own
variants.

### §4.3 Verdict

**No new contamination category.** theme.css refactor surface
matches Pass 270 §2.5 baseline + Pass 269 §5.5 migration plan.
The 696 `bd-` references + 196 tokens + 208 utility classes are
all known refactor targets. Mechanically tractable.

---

## §5 — animations.css (553 lines, full content)

### §5.1 Findings

| Layer | Finding |
| --- | --- |
| 1. Domain-term | Effectively zero — animations are mostly generic. |
| 2. Type-import | N/A (CSS file). |
| 3. Color-value | Some hardcoded colors in `pulseGlow` etc. — Tier 2 token-contract candidates. |
| 4. Component-identity | 25 keyframes named generically (`fadeInUp`, `fadeInDown`, `scaleIn`, `pulse`, `float`, `slideInNotification`, `bounceSoft`). All structural primitives. |
| 5. Route-config | N/A. |
| 6. Role-logic | N/A. |
| **Personality** | 13 hardcoded duration values (0.6s, 0.7s, 0.8s, 1.4s, 2s, 3s, 3.5s, 4s, 6s, 8s, 10s, 12s, 14s) — these ARE the personality values Pass 270 §7.2 / Pass 271 §5 emotional-architecture concept flagged. Brands choose values via `--motion-duration-*` tokens. |

**One brand-coded class:** `.bd-tile-fade` (the only `bd-` class
in animations.css; map-tile fade transition).

### §5.2 Verdict

**Convergence-validating.** animations.css is the cleanest file
audited so far:

- 25 keyframes are structural primitives (Tier 3 platform-grade).
- Hardcoded durations in CSS RULES are emotional primitives
  (Tier 2 token-contract).
- Brand provides actual values.

This file is the canonical example of how the platform/brand
separation should work. **No new category. Pass 270/271
emotional-architecture framework handles it cleanly.**

---

## §6 — High-coupling hooks (3 sampled)

Hook auditing focuses on platform-grade-LOOKING hooks (those
Pass 270 rated LOW or CLEAN), to test whether Pass 271's hidden-
coupling pattern extends to the hooks layer.

### §6.1 useNavigation (Pass 270: MEDIUM, 7 refs / 274 lines)

| Layer | Finding |
| --- | --- |
| 1. Domain-term | 7 refs (Pass 270 baseline). |
| 2. Type-import | `import type { ViewMode } from "../types"` — single domain type import. |
| 3. Color-value | N/A (logic hook, not visual). |
| 4. Component-identity | Storage key: `NAVIGATION_STORAGE_KEY = "bidondent_navigation_state"` — naming-leakage in persisted state key. |
| 5. Route-config | **HEAVY.** `VALID_VIEW_MODES = new Set([...])` is a 12-element whitelist of BD-specific routes (`reports-list`, `report-detail`, `insurer-connect`, `liked-shops`, `shop-directory`, `insurance-companies`, `competitor-analysis`, `vehicles`, `new-claim`, etc.). |
| 6. Role-logic | Low; navigation logic is mostly route-string-driven. |

**Sub-finding:** the route whitelist is the heaviest finding.
useNavigation HARDCODES the BD app's route taxonomy.

### §6.2 useAppearanceMode (Pass 270: CLEAN, 0 refs / 69 lines)

| Layer | Finding |
| --- | --- |
| 1. Domain-term | 0 refs. |
| 2. Type-import | `import type { DashboardAppearanceMode } from "../routers/dashboard-router-types"` — single import; type itself is generic. |
| 3. Color-value | N/A. |
| 4. Component-identity | Storage key: `APPEARANCE_STORAGE_KEY = "bidondent.appearance-mode"` — naming leakage. |
| 5. Route-config | `APPEARANCE_MODES = ["light", "map-dark"] as const` — `map-dark` is BD-specific (the dark mode optimized for the map). The default modes for any platform might be `"light" / "dark"`. |
| 6. Role-logic | N/A. |

**Sub-finding:** even the "CLEANEST hook" Pass 270 found has
TWO leakage points: (1) `bidondent.` storage-key prefix, (2)
the literal value `"map-dark"` encoding BD's dark-mode-favors-
map decision.

### §6.3 useUserData (Pass 270: LOW, 2 refs / 412 lines)

| Layer | Finding |
| --- | --- |
| 1. Domain-term | 2 refs (Pass 270 baseline). |
| 2. Type-import | `import type { UserInfo, Vehicle, DamageReport, Notification, RedirectInfo, UserData, Bid, Activity }` — **EIGHT** domain types. |
| 3. Color-value | N/A. |
| 4. Component-identity | Imports from `../services/supabaseService` — BD service binding. |
| 5. Route-config | N/A. |
| 6. Role-logic | `accountType?: "customer" \| "shop" \| "insurer"` parameter — role-string whitelist. |

**Sub-finding:** Pass 270's "LOW (2 refs)" verdict undercounts
massively. useUserData has 8 domain type imports + role-string
coupling — same pattern as DashboardLayout's reclassification
in Pass 271.

### §6.4 Hooks reclassification table

| Hook | Pass 270 verdict | Pass 272 verdict (deep) |
| --- | --- | --- |
| useNavigation | MEDIUM (7 refs) | **HIGH** — 12-route whitelist + storage-key naming + ViewMode type. Needs `usePlatformNavigation(viewModeWhitelist)` parameterization. |
| useAppearanceMode | CLEAN (0 refs) | **LOW** — `bidondent.` storage-key prefix + `map-dark` mode value. Needs `usePlatformAppearanceMode(modes, storageKey)` parameterization. |
| useUserData | LOW (2 refs) | **HIGH** — 8 type imports + role-string + supabaseService binding. APP-PRIVATE; replace with platform `useUser()` slot pattern (per Pass 269 §5 thin Clerk wrapper). |

Other hooks not re-audited but inferred:
- Hooks with high domain-ref counts (top 10 per Pass 272 grep)
  are Tier C app-private. Stay in legacy.
- Hooks with low domain-ref counts in Pass 270 rating need
  re-audit before extraction (the Pass 271 lesson:
  lexical grep undercounts).

---

## §7 — Stability axes summary

Per relay #8 framework:

| Stability axis                           | Pass 270 → 271 | Pass 271 → 272                                                                                       |
| ---------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| Contamination classification framework    | Stable          | **Stable** — same 4-tier matrix (A/B/C/D) survives                                                    |
| Seam taxonomy                              | Stable          | **Stable** — Pass 271 §4 categories survive (provider / hook / service / component / token / route)   |
| Token-contract shape                       | Stable          | **Stable** — 3-tier architecture survives; theme.css + animations.css both fit the shape              |
| Shell abstraction boundaries               | MOVED           | **Stable** (same pattern; LandingPageLayout slots into the same fix shape as DashboardLayout)         |
| Emotional-primitive definitions            | Stable          | **Stable** — animations.css validates; DashboardAtmosphere already reclassified                       |
| 6-category contamination methodology        | NEW (Pass 271)  | **Stable** — held across DashboardHeader + LandingPageLayout + theme.css + animations.css + 3 hooks |
| **Hook abstraction boundaries (NEW axis)**  | (not tested)    | **MOVED** — slot-driven-primitive pattern extends to hooks sub-package                                |

**Net:** 6 of 7 stability axes are stable across Pass 271 → 272.
ONE newly-tested axis (hooks) moved. But the movement is the
SAME PATTERN that moved the shell axis in Pass 271 — slot-driven
primitive + app-implementation. The framework itself didn't move;
the SCOPE-of-where-the-pattern-applies expanded.

That's a stronger stability finding than just "no new
categories": **the categories AND the fix pattern both replicate
across sub-packages.**

---

## §8 — Convergence verdict

Per relay #8:
> "If they do not introduce additional nucleus-shape revisions:
> convergence is beginning. If they do: the nucleus is still
> unstable and extraction remains premature."

**Pass 272 result:** convergence is **beginning**.

Evidence:

1. **No new contamination categories surfaced.** The Pass 271
   six-category framework held across 4 distinct surfaces
   (shell apex, landing layout, theme + motion CSS, hooks sample).
2. **The slot-driven primitive PATTERN replicates.** Same fix
   shape Pass 271 identified for shell now applies to hooks.
   That's predictability — once the pattern is identified, new
   surfaces fit it without surprise.
3. **Re-classifications follow predictable shape.** Each "Pass
   270 said LOW → actually HIGH" reclassification is structurally
   identical: type imports + storage-key naming + role-string
   coupling + brand-chrome inline values + identity in
   microcopy/comments.

But not fully converged. Two surfaces still untested at depth:

| Surface | Why it matters |
| --- | --- |
| `services/` sub-package (97 files) | If services follow the same slot-driven-primitive pattern as shell + hooks, the pattern is universal. If they introduce a new contamination category, the nucleus is still moving. |
| `notifications/` registry layer (Pass 271 categorized as platform-grade machinery + app-coupled registry) | Need to confirm the registry layer separation works under depth-audit. |

**One more clean depth-pass on services + notifications would
confirm full convergence.** That would be Pass 273.

If Pass 273 produces NO new categories AND NO new pattern
movements, the nucleus is genuinely stable and extraction
becomes architecture-not-speculation.

---

## §9 — MVP nucleus impact

Pass 270 §6.2 listed 16 platform-core sub-packages. Pass 271
revised the shell sub-package to require slot-driven primitives.
Pass 272 confirms:

- **Shell sub-package** (Pass 271 finding stands): slot-driven
  primitives + BD implementations.
- **Hooks sub-package** (Pass 272 NEW finding): slot-driven /
  config-driven primitives + BD implementations. NOT a direct
  port.

Specifically:

- `usePlatformNavigation(viewModeWhitelist: readonly string[],
  storageKey: string, fallbackState: NavigationState)` — generic
  primitive; apps inject their route taxonomy.
- `usePlatformAppearanceMode(modes: readonly string[],
  storageKey: string)` — generic primitive; apps choose their
  appearance modes.
- `useUserData` becomes APP-PRIVATE entirely. Platform exposes
  `useUser()` thin-wrapper (Pass 269 §5.3) returning generic
  `PlatformUser` shape; apps wrap with their own domain-typed
  user data hook.

The nucleus subsystem COUNT (16) does not change.
The work-required-per-subsystem reflects this depth-finding.

---

## §10 — Methodology refinement: storage-key naming as identity

Pass 272 surfaces a nuance worth codifying as a methodology
detail (not a new category):

**Storage keys (localStorage / sessionStorage) are an identity-
coupling surface that Pass 271's six-layer methodology should
explicitly check.**

Examples found:
- `bidondent_navigation_state` (useNavigation)
- `bidondent.appearance-mode` (useAppearanceMode)
- `bidondent.navigation.mapPerformance.v1` (mapPerformance —
  Pass 270 already noted)

These appear "platform-grade" until you realize the KEY VALUE is
brand-namespaced. Two apps coexisting in the same browser would
collide on shared platform-key namespace.

**Recommended platform doctrine** (candidate, not committed):

> Every platform module that persists state MUST namespace its
> storage key with an app-supplied prefix. Platform-core never
> uses a hardcoded application name in storage keys. Apps inject
> their namespace at provider initialization.

Pattern: `usePlatformAppearanceMode({ storageNamespace:
"stacey-financial" })` → key becomes
`stacey-financial.appearance-mode`. Same platform code; different
key per app; no collision.

This is a sub-detail of Pass 271 category #3 (identity coupling),
not a new top-level category.

---

## §11 — What this doc does NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS, or
  CLAUDE.md.
- Does NOT supersede Pass 270 or 271. Pass 272 EXTENDS the
  prior findings:
  - Pass 270 baseline contamination data + MVP nucleus
  - Pass 271 added 6 detection layers + shell reclassifications
  - Pass 272 confirms hooks need same treatment + animations.css
    validates emotional-architecture framework
- Does NOT extract any subsystem; does NOT bootstrap any repo.
- Does NOT classify services / notifications registry / remaining
  hooks at depth (deferred to a future Pass 273 if owner authorizes).
- Does NOT author Stacey-specific brand content (Pass 268 §8
  still gating).
- Does NOT modify the AI-governance system in this repo.
- Does NOT change the 16-subsystem MVP nucleus shape — only
  refines the work-required-per-subsystem in the hooks
  sub-package.
- Does NOT downgrade or abandon PMS Phase 2+ work.

---

## §12 — Cross-references

- Pass 271 [`PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md`](PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md) — first convergence test; established 6-layer methodology.
- Pass 270 [`PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md`](PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md) — base contamination audit + 16-subsystem MVP nucleus.
- Pass 269 [`PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md`](PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md) — 3-tier token architecture validated by §4 + §5 of this doc.
- Pass 268 [`PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md`](PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md) — 4-tier extraction matrix surviving the second convergence test.
- Pass 266 — `MapSessionProvider` exemplar of inert-seam pattern; Pass 272 confirms the pattern extends from providers to hooks (and likely to services in Pass 273).
- Owner relay 2026-05-09 expanded directives (#8 specifically: convergence stability test).

---

## §13 — Status

- **Drafted:** 2026-05-09 (Pass 272, Convergence Test #2 lane).
- **Status:** ACTIVE planning. Convergence verdict: **beginning**.
  Framework stable; same fix pattern recurring at scale; one more
  depth-pass on services + notifications would confirm full
  convergence.
- **Authority:** PLAN. Subordinate to all current LAW docs.
- **Owner approval required:** TRUE for any subsequent extraction
  action. Two new owner-decision points beyond Pass 268 + 269 +
  270 + 271:
  1. Accept hook sub-package strategy revision (slot-driven /
     config-driven primitives + BD implementations; same shape
     as shell sub-package per Pass 271).
  2. Accept storage-key namespace doctrine (apps inject prefix;
     platform never hardcodes application name in keys).
- **Cumulative owner-decision points:** 29 across Passes 268 +
  269 + 270 + 271 + 272.
- **Supersedes:** none.
- **Superseded by:** none.

**Next legitimate forward triggers:**

1. Owner authorizes Pass 273 — depth-audit services + notifications
   registry → if no new categories surface, full convergence
   confirmed; extraction-as-architecture is on the table.
2. Owner ratifies any subset of the 29 decision points → the
   ratified part of the nucleus stabilizes for that area.
3. Owner answers Pass 268 §8 Stacey questions → brand-direction
   doc authorable (independent of platform extraction).
4. Owner authorizes PMS Phase 2 → independent of platform work.

Until ratification: disciplined hold. The nucleus is one clean
depth-pass away from declared full convergence. The discipline
that produced Passes 262–272 has now held through 11 passes of
escalating architectural pressure.

The platform direction expanded dramatically across passes
268-272. The discipline that makes the platform worth building
has stayed exactly the same.
