---
status: ACTIVE
authority: PLAN
scope: platform-contamination-audit
canonical_source_of_truth: PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 270 deep-audit doc. Concrete contamination data (file/line counts of BidOnDent naming leakage + domain coupling + map-existence assumptions + theme.css token tier); generalized seam taxonomy; token-contract map; MVP platform-core nucleus definition (the smallest credible extraction set that supports Stacey's site without being incomplete); emotional architecture concept (motion personality + interaction tempo + narrative density as platform tokens); inert-seam doctrine codification ("seams before behavior") with Pass 266 as exemplar; 5-layer doctrine separation (operational / engineering / design / brand / business); and AI-governance drift-protection rules. Doc-only.
last_updated: 2026-05-09
---

# Platform Contamination Audit + MVP Core Definition — 2026-05-09

> **Tier:** PLAN. Future direction, not current truth.
> **Authority:** Pass 270. Owner relay 2026-05-09 expanded directives
> 1–8 (deep audit + contamination inventory + emotional architecture
> + inert-seam doctrine + doctrine-layer separation + MVP platform-core
> + AI-governance drift protection).
>
> **What this doc is:** the concrete-data layer beneath Passes 268
> + 269. The prior two surfaced WHAT to extract and HOW to bootstrap.
> This pass surfaces:
> - actual file/line contamination counts,
> - the smallest credible platform-core nucleus,
> - the seam patterns that will be reused,
> - the token-contract surface,
> - and the operational guardrails that protect the AI-governance
>   layer from drift.
>
> **What this doc is NOT:**
> - LAW. Surfaces options + concrete classifications; binds nothing.
> - A bootstrap. No new repos, no extractions, no code moves.
> - A retroactive critique of BidOnDent. The "contamination"
>   identified here is a feature of a single-product repo — it
>   only becomes contamination under the new platform framing.

---

## §1 — Mission

Three concrete next-step deliverables (per relay #1, #2, #6):

1. **Hidden contamination audit** — the subtle assumptions that
   block reuse, with file/line counts.
2. **MVP platform-core nucleus** — the smallest stable
   extraction set that genuinely supports Stacey's site.
3. **Seam taxonomy + token-contract map** — the structural
   patterns that future apps plug into.

Plus three doctrine codifications (per relay #3, #4, #5):

4. **Emotional architecture** — motion personality + tempo +
   narrative density as platform-level concepts.
5. **Inert-seam doctrine** — "seams before behavior" formalized
   from Pass 266.
6. **5-layer doctrine separation** — operational / engineering /
   design / brand / business.

Plus one operational guardrail (per relay #7):

7. **AI-governance drift protection** — rules that prevent the
   discipline that produced Passes 262–269 from eroding.

All seven sections in one PLAN-tier doc. Single-doc discipline
preserved.

---

## §2 — Contamination audit (concrete file/line data)

Data captured 2026-05-09 from `src/app/` working tree at HEAD
(`5c11e189`).

### §2.1 Naming leakage

| Pattern                                                    | Result                                            |
| ---------------------------------------------------------- | ------------------------------------------------- |
| `bd-` / `bidondent` / `BidOnDent` / `BIDONDENT` occurrences | **948 across 225 files**                          |
| `__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__` global flag         | 4 occurrences (patch + test harness + comment)    |
| `bd:engine:*` / `bd:route:*` perf-mark prefixes             | 4 const declarations in `perfMarks.ts`            |
| `__bd*Patched`, `__bdGlContextLog`, `__bdMapInstanceCount`  | 12 occurrences across 2 dev-counter files         |
| `bidondent.navigation.mapPerformance.v1` localStorage key   | 1 occurrence in `mapPerformance.ts`               |
| `BIDONDENT SERVICES` comment                                 | 1 occurrence in `services/index.ts`               |
| `bd-bloom-atmosphere` className                              | ~8 occurrences across landing sections            |

**Net naming-rename surface:** ~225 files require rename;
~950 occurrences total. Mostly mechanical. None are blockers,
but extraction can't ship clean until this is done. Most
`bd-` is in `theme.css` (696 of the 948 — see §2.5).

### §2.2 Domain coupling (collision-repair worldview)

| Domain term                                            | Files referenced |
| ------------------------------------------------------ | ---------------- |
| `shop`                                                 | 274              |
| `insurer`                                              | 115              |
| `bid`                                                  | 76               |
| `vehicle`                                              | 77               |
| `claim`                                                | 41               |
| `estimate`                                             | 31               |
| `damage_report` (snake_case)                            | 0                |

**Net domain-coupled surface:** ~50% of `src/app/` files
reference at least one collision-repair domain term. These are
correctly Tier C (business-coupled per Pass 268 §3.3) and stay
in the legacy repo. Listed here so the platform-extraction
pass doesn't accidentally pull them.

### §2.3 Map-existence assumptions

Files in `hooks/`, `services/`, `features/` that assume a map
exists at runtime:

| File                                                              | Why coupled                                                                                  |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `hooks/usePublicServiceAreas.ts`                                  | Pulls service-area shapes specifically for map rendering.                                      |
| `hooks/useParallaxOffset.ts`                                      | Implements scroll-coupled parallax — generic in shape; brand-coupled in feel.                   |
| `hooks/useShopAvailability.ts`                                    | Map-first shop availability lookup.                                                            |
| `hooks/useOperatingRegionsCoverageHelpers.ts`                     | Coverage-region computation for the map.                                                       |
| `hooks/useReportLayerData.ts`                                     | Report-pin layer data for the map.                                                             |
| `services/auth/websitePreferencesSync.ts`                         | Preferences syncing — coupled because it persists map state.                                   |
| `services/navigation/requestTimeout.ts`                            | HTTP timeout helper — generic in shape; lives in `navigation/` only by historical placement.    |
| `services/supabase/edgeFunctions.ts`                              | Generic edge-function client — generic in shape; lives in `services/` correctly.                |

**Net:** ~5 hooks are deeply map-coupled (Tier C — stay in
legacy). The 3 services are platform-grade in shape; the
historical placement in `services/navigation/` is misleading
and should be re-pathed at extraction time.

### §2.4 Shell-layer coupling depth

The shell components (which would form platform-core's
sub-package `shell/`) — assessed for refactor cost:

| File                                | Domain refs / Lines | Verdict                                          |
| ----------------------------------- | ------------------- | ------------------------------------------------ |
| `components/app/AppShell.tsx`        | 1 / 104             | LOW — ~1 token rename + perf-mark namespace      |
| `components/app/BrandLogo.tsx`       | 0 / 74              | CLEAN — direct port                              |
| `components/app/DashboardSidebar.tsx`| 0 / 323             | CLEAN — direct port (slot-driven)                |
| `components/app/LandingPageLayout.tsx`| 1 / 227             | LOW — single token rename                        |
| `components/app/DashboardLayout.tsx` | 5 / 225             | MEDIUM — 5 inline refs need slot/prop refactor   |
| `components/app/DashboardHeader.tsx` | 7 / 551             | HIGHER — heaviest of the 6; needs careful slot extraction |

**Net:** 3 of 6 shell files are CLEAN or LOW; only
`DashboardHeader` has a non-trivial refactor surface. The
shell is more reusable than expected.

### §2.5 Theme.css contamination

| Metric                                       | Count |
| -------------------------------------------- | ----- |
| Total lines                                   | 4,913 |
| `--*` CSS custom property declarations        | 196   |
| `.bd-*` utility class definitions              | 208   |
| `bd-` references (broader incl. comments)     | 696   |

**Net:** 196 tokens already declared (a fertile starting set
for the 3-tier architecture); 208 utility classes need
prefix-rename + Tier-3-token consumer rewrite. Theme.css is
the largest single-file refactor surface, but it's
self-contained.

### §2.6 Hook contamination spot-check

| Hook                                                       | Domain refs / Lines | Verdict                                          |
| ---------------------------------------------------------- | ------------------- | ------------------------------------------------ |
| `useAppearanceMode`                                        | 0 / 69              | CLEAN — platform-grade                           |
| `useUserData`                                              | 2 / 412             | LOW — slim refactor                              |
| `useNavigation`                                            | 7 / 274             | MEDIUM — non-trivial domain integration          |
| `useDeepLinkNavigation`                                    | 8 / 48              | HEAVY proportionally — domain-coupled per-line    |

**Net:** ~77 hooks total in the repo. Quick stratification:
- ~20-30 cleanly platform-grade (auth, online status, appearance, deep-link primitives)
- ~30-40 partly coupled (navigation, business UI hooks)
- ~10-20 domain-coupled (Tier C — stay in legacy)

A full hook-by-hook classification is its own pass-sized
deliverable; this brief lists the pattern.

### §2.7 Notification system

`src/app/features/notifications/` files: `NotificationContext.ts`,
`index.ts`, `notificationEventTypes.ts`, `useNotificationEvents.ts`.

Spot-check: zero domain-term references. Notification
infrastructure is platform-grade. The TYPES of notifications
defined in `notificationEventTypes.ts` may be domain-coupled,
but the dispatch + context machinery is generic.

**Verdict:** PLATFORM-GRADE infrastructure with a domain-coupled
**registry** layer. Extract the machinery; let each app define
its own event types.

### §2.8 UI primitives

`src/app/components/ui/` — 30+ shadcn-derived files. Only ONE
contains `bd-*` references: `NotificationToast.tsx`. The rest
are vendor-neutral.

**Verdict:** Direct-copy candidates. ~95% clean.

### §2.9 Pass 262/266 work — already platform-grade?

- **`MapSessionProvider.tsx` + `mapSessionContext.ts`** (Pass
  266, 145 lines total): zero `bd-` references. Only
  `mapInstance` (map-domain, not BD-domain). DIRECT PORT
  CANDIDATE.
- **`perfMarks.ts`** (Pass 262): 4 `bd:` namespace prefixes —
  direct rename target. Otherwise platform-grade.
- **`devMapInstanceCounter.ts` / `devGlContextCounter.ts`**:
  12 `__bd*` window globals — direct rename targets. Logic is
  generic.
- **`pmsInstrumentationHarness.ts`** (Pass 265): ZERO `bd-`
  references in source. Already platform-grade.

**Net:** the Pass 262–266 work is essentially platform-grade
already; only namespace prefixes need flipping. Validates the
inert-seam doctrine — building seams correctly the first time
makes them portable for free.

### §2.10 Hidden assumptions worth flagging

The relay specifically asked about subtle assumptions, not
obvious ones. These are subtle:

| Assumption                                                                       | Location                                              | Severity |
| -------------------------------------------------------------------------------- | ----------------------------------------------------- | -------- |
| "Every app has a map"                                                             | `MapSessionProvider` mounted unconditionally in `App.tsx` | LOW (provider is inert; no harm if no map) |
| "Every app has 3 user roles (customer / shop / insurer)"                          | `useUserData`, `services/auth/websiteIdentity.ts`, role-based dashboard routing | HIGH for Stacey — she has 1 role + maybe admin |
| "Every app has tabs in the dashboard"                                              | `DashboardLayout` + `DashboardRouter` tab dispatch    | MEDIUM — Stacey may have content-pages, not tabs |
| "Notifications are about reports/bids/claims"                                      | `notificationEventTypes.ts` event registry             | MEDIUM — registry, not machinery — easy fix |
| "Hash-routes are limited to `/about` `/privacy` `/terms` `/insurer-partnership`"  | `AppShell.useHashPage` HASH_PAGES whitelist           | LOW — generic helper; whitelist is config-driven |
| "Map performance is the only persisted-window perf signal"                         | `services/navigation/mapPerformance.ts`                | LOW — generic shape; rename + path move        |
| "Users authenticate before seeing the dashboard"                                   | `App.tsx` Clerk-gated tree                             | NONE — this is a platform invariant            |
| "Atmosphere = warm bronze gold + cinematic indigo"                                  | `bd-bloom-atmosphere` class + landing sections         | HIGH for Stacey — atmosphere is brand, not platform |
| "Motion duration scales: 0.6s, 0.8s, 2s, 3s, 4s, 8s, 1.4s"                         | `animations.css` hardcoded                              | MEDIUM — these are personality values, not absolutes |
| "Reports + bids + claims are the dashboard primitives"                              | All dashboard widgets                                   | TIER C (stay in legacy)                         |
| "Service-coverage is the landing-page hero pattern"                                | `OperatingRegionsSection` + `LandingPageLayout`         | TIER C (stay in legacy)                         |

**Net:** the highest-impact hidden assumptions are role-count
(3 vs 1+admin) and atmospheric tone (Jeffrey-coded). Both must
be addressed before Stacey's site can use platform-core.

---

## §3 — Severity matrix

| Severity | Definition                                                                 | Counts                                              |
| -------- | -------------------------------------------------------------------------- | --------------------------------------------------- |
| **HIGH** | Blocks reuse OR creates wrong assumption for Stacey                         | role-count, atmosphere/tone, dashboard tab assumption |
| **MEDIUM** | Needs refactor before extraction; mechanically tractable                  | DashboardHeader (7 refs / 551 lines), notification registry, hardcoded motion durations, useNavigation hook |
| **LOW** | Cosmetic / rename-only / doc-only                                           | `bd-` prefix renames (208 utility classes), `bd:` mark namespaces, `__bd*` globals, `bidondent.*` localStorage keys |

**Refactor effort estimate** for the HIGH + MEDIUM items
combined: ~2-4 days of focused work, sequenced behind owner
ratification of the platform direction.

---

## §4 — Generalized seam taxonomy

Pass 266 introduced the inert-seam pattern at the React-tree
boundary. Other seam types exist (or can be created) elsewhere.
Catalogued here so future seams follow the same pattern.

### §4.1 Provider seams

**Pattern (Pass 266 exemplar):**

- `createContext(NOOP_DEFAULT)` with frozen no-op value.
- Provider component returns `<Context.Provider value={NOOP_DEFAULT_OR_STATEFUL}>{children}</Context.Provider>`.
- Phase 1: provider value === default → behavior identical with or without provider.
- Phase 2+: provider value becomes stateful; consumers continue working.

**Existing seams:** `MapSessionContext` (Pass 266),
`AppearanceModeContext`, `NotificationContext`,
`ClerkProvider`.

**Recommended future seams (none committed):**

- `ContentSessionContext` — for editorial/CMS-driven sites
  like Stacey's. No-op default; stateful when content provider
  is wired.
- `SchedulingSessionContext` — for booking/consultation flows.
- `BrandSessionContext` — exposes the active brand's tokens to
  components that need explicit brand-aware rendering (rare,
  but useful).

### §4.2 Hook seams

**Pattern:** hooks designed against an INTERFACE, not a
specific implementation.

Example (Pass 268 §5.6 doctrine #6 + Pass 269 §5):

```typescript
// platform-core/auth/index.ts
export function useUser(): PlatformUser | null { /* delegates */ }

// auth-clerk/index.ts (binds to Clerk)
export const useUser = ClerkUseUser;

// app/code:
import { useUser } from "@platform/core/auth"; // not @clerk/clerk-react
```

This is a seam at the import surface. Apps that swap auth
providers swap one binding package; consumer code unchanged.

### §4.3 Service seams

**Pattern:** service modules expose a façade, not direct vendor
SDK calls.

Example targets:

- `storage/` exposes `uploadMedia(pointer)` / `getSignedUrl(pointer)`
  rather than `supabase.storage.from(bucket).upload(...)` calls
  scattered across consumers.
- `realtime/` exposes `subscribeChannel(name, handler)`
  rather than `supabase.channel(name).on('postgres_changes', ...)`.

This already partly exists in `services/` but is inconsistent.
Extraction-time refactor target.

### §4.4 Component slot seams

**Pattern:** layout components accept slots (children or named
props) rather than embed concrete content.

Example: `DashboardLayout` should accept `<DashboardLayout
header={...} sidebar={...} main={...}>` rather than embed
BidOnDent-specific Header/Sidebar.

This is the largest L2 refactor surface (`components/app/`).

### §4.5 Token seams

**Pattern:** components consume CSS custom properties; brands
define them.

Detailed in §5 (Token-contract map).

### §4.6 Route seams

**Pattern:** routing accepts a route TABLE from the app, not
hardcoded paths in the platform.

Current state: `useHashPage` in AppShell hardcodes
`HASH_PAGES = ["about", "privacy-policy", ...]`. Extraction-
time refactor: accept a `hashPages` config from the app.

### §4.7 Doctrine: "seams before behavior" (relay #4)

The Pass 266 lesson formalized:

> **Seams before behavior.** Establish the architectural
> boundary (the provider, the slot, the import indirection)
> as an INERT artifact first. Verify behavior is identical
> with the seam present and absent. Only then add the
> behavior the seam was designed for.
>
> The seam pays its rent by surviving Phase 1 verification
> with zero behavior change. Phases 2+ inherit a tested
> boundary instead of inventing one mid-feature.

This becomes a candidate platform LAW clause:

> **PLATFORM_LAW §X.X** — Cross-cutting capabilities (auth,
> theme, sessions, modules) MUST be introduced as inert seams
> first. The seam ships with a no-op default and a contract
> test verifying byte-identical behavior with-or-without the
> wrapper. Only after the seam is verified inert may a
> subsequent pass add behavior.

---

## §5 — Token-contract map

The brand-platform boundary is most concrete in CSS. Here is
the proposed three-tier shape applied to the actual repo's
196 declared tokens.

### §5.1 Tier 1 — Reference tokens (platform owns; brands inherit verbatim)

Raw values. Brands USE these; brands DON'T REDEFINE them.

```
Color reference family:
  --ref-color-blue-{50..950}
  --ref-color-stone-{50..950}
  --ref-color-amber-{50..950}
  --ref-color-emerald-{50..950}
  (etc. — full Tailwind-equivalent palette)

Spacing reference:
  --ref-space-{0..96}    (matches Tailwind v4)

Motion reference:
  --ref-duration-instant    (60ms)
  --ref-duration-quick      (160ms)
  --ref-duration-base       (220ms)
  --ref-duration-deliberate (320ms)
  --ref-duration-narrative  (480ms)
  --ref-duration-cinematic  (720ms)

Easing reference:
  --ref-ease-linear / -in / -out / -in-out
  --ref-ease-trust          (custom cubic-bezier; calm settle)
  --ref-ease-emphasis       (custom; punchy entrance)
```

### §5.2 Tier 2 — System tokens (CONTRACT; brands FILL)

Platform-core declares the names; each brand defines values.

```
Surface contract:
  --surface-canvas         (page background)
  --surface-elevated       (card / panel)
  --surface-overlay        (modal / sheet)
  --surface-inset          (subtle inset highlight)
  --surface-trim           (border / divider)

Action contract:
  --action-primary
  --action-primary-hover
  --action-secondary
  --action-secondary-hover
  --action-destructive
  --action-quiet

Text contract:
  --text-primary
  --text-secondary
  --text-muted
  --text-inverse

Motion-personality contract (relay #3 emotional architecture):
  --motion-duration-quick      (instant feedback; e.g. button press)
  --motion-duration-base       (standard transition)
  --motion-duration-trust      (deliberate settle; calm decisions)
  --motion-duration-narrative  (storytelling pace; longer reveals)
  --motion-ease-trust
  --motion-ease-emphasis

Atmosphere contract (optional; brands that want atmosphere fill it):
  --atmosphere-bloom-color
  --atmosphere-bloom-spread
  --atmosphere-glow-intensity
```

### §5.3 Tier 3 — Component tokens (platform owns; reads Tier 2)

```
.ui-button { background: var(--action-primary); }
.ui-card { background: var(--surface-elevated); border: 1px solid var(--surface-trim); }
.ui-modal { background: var(--surface-overlay); transition: transform var(--motion-duration-base) var(--motion-ease-trust); }
.ui-text-heading { color: var(--text-primary); }
```

(Rename the existing 208 `.bd-*` utility classes to `.ui-*`
during extraction; consumer code in apps barely changes
because the classes-as-strings stay in the same shape.)

### §5.4 Brand fills (illustrative — Jeffrey + Stacey)

**Jeffrey (current BidOnDent):**

```css
:root[data-brand="jeffrey"] {
  --surface-canvas: #0b172f;
  --surface-elevated: rgba(15, 23, 42, 0.84);
  --action-primary: #2563eb;  /* premium navy-blue action */
  --motion-duration-base: var(--ref-duration-base);   /* 220ms */
  --motion-duration-trust: var(--ref-duration-deliberate);  /* 320ms */
  --motion-ease-trust: var(--ref-ease-trust);
  --atmosphere-bloom-color: rgba(196, 144, 65, 0.45);  /* bronze gold lamp */
  --atmosphere-glow-intensity: 0.6;
}
```

**Stacey (illustrative — actual values gated on Pass 268 §8 answers):**

```css
:root[data-brand="stacey-financial"] {
  --surface-canvas: #fafaf9;          /* warm cream-white */
  --surface-elevated: #ffffff;
  --action-primary: #7c5e00;          /* warm gold action */
  --motion-duration-base: var(--ref-duration-deliberate);  /* slower */
  --motion-duration-trust: var(--ref-duration-narrative);  /* much slower */
  --motion-ease-trust: var(--ref-ease-trust);
  --atmosphere-bloom-color: rgba(252, 240, 208, 0.32);  /* soft cream warmth */
  --atmosphere-glow-intensity: 0.25;
}
```

The same component (`.ui-card`) renders DIFFERENTLY under
each brand because the Tier 2 values change. No component
code modified.

### §5.5 Token migration counts

| Migration step                                                        | Effort        |
| --------------------------------------------------------------------- | ------------- |
| Extract Tier 1 reference tokens from `theme.css`                       | ~50-80 tokens |
| Identify Tier 2 contract surface (which tokens brands need to fill)    | ~30-50 tokens |
| Rewrite the 208 `.bd-*` utility classes to consume Tier 2/3            | 208 classes   |
| Move Jeffrey-specific values to `brand-assets/jeffrey/tokens.css`      | ~30-50 values |
| Author Stacey-specific values (gated on Pass 268 §8 answers)            | ~30-50 values |

This is a meaningful refactor (~500-1000 lines of CSS touched)
but it's mechanically tractable once the contract is
ratified.

---

## §6 — MVP platform-core nucleus (the key deliverable per relay #6)

### §6.1 What "MVP" means here

The smallest credible extraction set such that **Stacey's site
can be fully built on platform-core alone** — no half-extracted
modules, no missing primitives, no app-specific
re-implementations of platform concerns.

NOT the full long-term platform vision. Just the nucleus
needed to ship one branded implementation.

### §6.2 What MUST ship in MVP platform-core (v0.1.0)

| Subsystem                       | Why it's in MVP                                                                | Source today                                              |
| ------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------- |
| **UI primitives**                | Stacey needs buttons, cards, dialogs, forms, navigation.                        | `components/ui/` (30+ shadcn files, ~95% clean)            |
| **Shell components**             | Stacey needs a shell (header, content area, footer).                            | `components/app/` (3 of 6 files clean; refactor `DashboardHeader`) |
| **Brand-token contract**         | Stacey's brand needs to slot in.                                                | `theme.css` token tier rewrite (§5)                        |
| **Auth integration**             | Stacey needs sign-in (even if just admin).                                      | `auth/`, `auth-clerk/`, `services/clerkService.ts`         |
| **Notifications machinery**      | Stacey needs toast feedback.                                                    | `features/notifications/` (machinery only; not registry)   |
| **Error boundaries**             | Stacey needs reliability.                                                       | `components/ScreenErrorBoundary.tsx`, `ImageErrorBoundary` |
| **Routing primitives**           | Stacey needs page routing (hash or proper).                                     | `useHashPage` (config-driven version)                      |
| **Online status / SW**           | Stacey needs PWA + offline UX.                                                  | `useOnlineStatus`, `useServiceWorkerUpdate`                |
| **Sentry integration**            | Stacey needs error reporting.                                                   | `services/sentryInit.ts`, `services/errorReporting.ts`     |
| **Storage abstraction**          | Stacey may have profile photos / lead-magnet PDFs.                              | `services/storage/` + edge-function `storage.ts` pattern    |
| **Edge function + Clerk auth pattern** | Stacey needs server-side auth on her edge functions.                       | `supabase/functions/server/utils/clerk.ts`                 |
| **Motion primitives**             | Stacey needs reduced-motion compliance + base animations.                       | `animations.css` Tier 1 motion values + Tier 2 contract     |
| **Validate-app-config gate**      | Stacey needs startup validation.                                                | `utils/validateAppConfig.ts`                                |
| **Inert provider seam pattern**   | Stacey may need future Content/Scheduling providers.                            | Pass 266 `MapSessionProvider` as exemplar                   |
| **Test utilities core**           | Apps need vitest setup + provider mocks.                                        | `test-setup/`, generalized `mapTestHarness` patterns        |
| **Operational doctrine**         | Stacey's repo inherits AI-governance.                                           | `META_AI_OPERATIONAL_DOCTRINE.md` (per Pass 269 §7)         |

**Net MVP package count:** ~16 surface areas. Maps to roughly:

```
@platform/core/
  ui/             # primitives
  shell/          # AppShell + Layouts (slot-driven)
  tokens/         # 3-tier token system
  auth/           # provider-agnostic interface
  auth-clerk/     # Clerk binding
  notifications/  # machinery (apps register their own event types)
  error-boundaries/
  routing/        # useHashPage + helpers (config-driven)
  pwa/            # online + service-worker hooks
  monitoring/     # sentry + errorReporting
  storage/        # client + edge-function utils
  motion/         # reduced-motion contract + base keyframes
  config/         # validateAppConfig + env helpers
  providers/      # inert-seam pattern utilities (createInertContext etc.)
  test-utils/
  doctrine/       # META_AI_OPERATIONAL_DOCTRINE.md companion
```

### §6.3 What is INTENTIONALLY excluded from MVP

These should be Tier B optional modules, NOT shipped by default:

- Map system (Stacey's site doesn't need it)
- Persistent map session (PMS)
- Map performance tracking
- Turn-by-turn navigation
- Realtime subscriptions (Stacey may add later)
- Storage media gallery (Stacey's needs are simpler than BD's)
- Scheduling/consultation (Stacey will need this; ship as v0.2.0
  optional module after MVP)
- Content/CMS (same)
- Lead-capture forms (light forms can use UI primitives;
  formal lead-capture module is post-MVP)

**Why exclude:** "smallest credible extraction nucleus"
explicitly per relay #6. Adding optional modules to MVP
inflates the surface area that has to ship correctly the
first time.

### §6.4 Stacey-specific gaps (require post-MVP modules or app-layer code)

Things Stacey's site needs that aren't in MVP:

| Need                                | Resolution                                                                           |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| Booking / calendar embed             | Either (a) use 3rd-party (Calendly/Acuity) at app layer, OR (b) build `@platform/scheduling` module post-MVP. |
| Editorial content / blog            | Either (a) use external CMS (Contentful/Sanity) at app layer, OR (b) build `@platform/content` module post-MVP. |
| Newsletter / email-list capture      | Light forms via UI primitives (MVP-sufficient); formal `@platform/lead-capture` later. |
| Course / video hosting               | App-layer external integrations (Vimeo, Mux); not platform-core.                       |
| Compliance disclosures (financial)  | App-layer page content; legal review out of platform scope.                            |

Owner answers to Pass 268 §8 will determine which gaps need
post-MVP modules vs app-layer external integration.

### §6.5 MVP definition checkpoint (owner-decision)

Before MVP can ship, owner ratifies:

1. The 16-subsystem nucleus list above (any subtractions /
   additions?).
2. The Tier B optional modules NOT in MVP (any moved into
   MVP?).
3. The Stacey-specific gaps strategy (3rd-party vs
   post-MVP-module).

Pass 268 §4 + §5 + Pass 269 §3 are upstream decisions; this is
the final-stage scoping question.

---

## §7 — Emotional architecture (relay #3)

### §7.1 The insight

Stacey's site shouldn't merely "change colors." It should
FEEL fundamentally different — calmer, more deliberate,
narrative-paced — while using the same engineering substrate.

That requires the platform to expose **emotional primitives**,
not just visual primitives. Color tokens alone don't make
Stacey calm; motion tempo, interaction friction, narrative
density, atmospheric weight, and decision-tempo also matter.

### §7.2 Proposed emotional primitive layers

Each is a contract surface brands fill independently:

#### Layer 1 — Motion personality

Already partly captured in §5.2 Tier 2 motion-personality
contract:

- `--motion-duration-quick` — feedback (button press, hover)
- `--motion-duration-base` — standard transitions (panel open,
  tab switch)
- `--motion-duration-trust` — deliberate settles (modal
  open, confirmation)
- `--motion-duration-narrative` — storytelling reveals (hero
  intro, section enter)

Brands choose values. Jeffrey uses 220 / 320 / 480ms
(brisk-then-deliberate). Stacey could use 320 / 480 / 720ms
(deliberate-throughout-calmer).

#### Layer 2 — Interaction tempo

Beyond duration: how MANY transitions occur per interaction?
Jeffrey is dense (multiple atmospheric layers respond to one
click). Stacey could be sparse (one focused transition per
click).

Tokens:

- `--tempo-density-{minimal | standard | rich}` — semantic
  signal that components consult to decide HOW MUCH to animate.

#### Layer 3 — Narrative density

How much CONTENT space exists per scroll-screen? Stacey's
editorial pace = lots of whitespace, generous line-height,
pull-quotes, slow vertical rhythm. Jeffrey's = denser
information per screen, parallel data layers.

Tokens:

- `--narrative-vertical-rhythm` — scroll velocity
- `--narrative-content-density-{compact | comfortable | airy}`
- `--narrative-section-pause` — implicit visual pause between
  sections

#### Layer 4 — Atmospheric weight

How much "atmosphere" (bloom, glow, vignette) is present?
Jeffrey: heavy atmospheric layers (bd-bloom-atmosphere across
landing). Stacey: light, almost none. Tokens (already in §5.2
atmosphere contract):

- `--atmosphere-bloom-color` / `--atmosphere-bloom-spread`
- `--atmosphere-glow-intensity`

When `--atmosphere-glow-intensity: 0` the components ship
zero atmosphere code paths — atmosphere becomes opt-in per
brand.

### §7.3 Emotional architecture as platform LAW (candidate)

> **PLATFORM_LAW §Y.Y** — Branded implementations differ
> primarily through emotional primitives (motion personality,
> interaction tempo, narrative density, atmospheric weight),
> NOT through bespoke component variants. Platform components
> consume emotional tokens; brands fill them. A component
> behaves correctly under both Jeffrey-density and Stacey-
> calm tokens by construction.

This avoids the "every brand has to fork the button component"
trap.

---

## §8 — Inert-seam doctrine codified (relay #4)

Already drafted in §4.7 above as a candidate
PLATFORM_LAW clause. Re-quoted here for the doctrine
section:

> **Seams before behavior.** Cross-cutting capabilities
> (auth, theme, sessions, modules) MUST be introduced as
> inert seams first — provider with frozen no-op default,
> contract test verifying byte-identical behavior
> with-or-without the wrapper. Only after the seam is
> verified inert may a subsequent pass add behavior.

Pass 266 is the canonical exemplar:

- Pass 266 shipped `MapSessionProvider` with `MAP_SESSION_DEFAULT_VALUE` frozen no-op.
- Pass 266's tests verified byte-identical behavior under
  provider-wrapped vs unwrapped.
- Phase 2 (engine lift) inherits a tested boundary; will not
  invent it mid-feature.

Future seam work follows this template.

---

## §9 — Five-layer doctrine separation (relay #5)

The owner relay flagged five doctrine layers separating
cleanly. Codified here:

| Layer                       | Lives in                              | Examples (current repo)                                        | Examples (future platform)                                      |
| --------------------------- | ------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| 1. Operational doctrine     | `META_AI_OPERATIONAL_DOCTRINE.md`     | AI_LOCK schema, pass commit format, convergence metadata, KI numbering | Same — direct port. Skill: `mola-ai-relay-protocol`. |
| 2. Engineering doctrine      | `PLATFORM_LAW_*` (in new platform repo) | LAW_LAYERED_ARCHITECTURE, LAW_ANIMATION_AND_ATMOSPHERE         | Generalize from BD. PLATFORM_LAW_LAYERED_ARCHITECTURE, PLATFORM_LAW_INERT_SEAMS, PLATFORM_LAW_REDUCED_MOTION. |
| 3. Design doctrine          | `PLATFORM_DESIGN_*` + per-brand assets | shadcn primitives + atmospheric tokens                          | Token-contract surface, motion-personality system, neutral defaults. Brands provide concrete values. |
| 4. Brand doctrine           | `brand-assets/<brand>/`               | MOLANDJESUS_DESIGN_DECISIONS (Jeffrey-coded; LOCKED)            | Per-brand: STACEY_FINANCIAL_DESIGN_DECISIONS, JEFFREY_CREATIVE_DESIGN_DECISIONS, etc. Each brand owns its own canon. |
| 5. Business implementation  | `apps/<app>/`                         | This whole repo (BidOnDent app)                                  | apps/stacey-financial, apps/jeffrey-creative, apps/bidondent-legacy (if moved). |

Each layer cites only the layer above. No layer skips. No
brand pollutes platform-engineering or platform-operational.

---

## §10 — AI-governance drift protection (relay #7)

The discipline that produced Passes 262–269 cleanly is itself
an asset. To protect it:

### §10.1 Anti-drift rules (candidate operational doctrine)

1. **No ad-hoc planning docs.** Each PLAN doc has a stated
   scope, a stated owner-approval gate, and a stated
   superseded-by mechanism. Ad-hoc "thoughts" docs are not
   permitted.

2. **No overlapping canonical sources.** When a topic is
   covered by an existing doc, extension goes IN that doc;
   parallel docs that cover the same surface are flagged and
   consolidated.

3. **No uncontrolled framework proliferation.** New doctrine
   tiers, new pass-numbering systems, new directory structures
   require explicit owner authorization. Containment-over-
   expansion is the default.

4. **No emotionally-driven architecture decisions.** "I just
   feel like a re-architect" is not a forward trigger. Owner
   directive + concrete signal are required.

5. **Single-doc-per-pass discipline.** Each pass authors AT
   MOST one new PLAN doc OR updates AT MOST one existing
   doc + AI_LOCK + memory. Multi-doc passes only when
   genuinely required (e.g., a coordinated extraction).

6. **Memory updates are minimal.** New memory entries require
   either (a) explicit owner request OR (b) a non-obvious
   pattern worth preserving for future sessions. Adding a
   memory per pass is forbidden.

7. **Skills are not invented casually.** New skills require
   explicit owner authorization or a reusable pattern that has
   appeared in 3+ contexts.

### §10.2 Carrying these into the new platform repo

The above 7 rules should ship in the new platform repo's
`META_AI_OPERATIONAL_DOCTRINE.md` (per Pass 269 §7.2) so any
AI agent working in any branded implementation inherits the
discipline.

This makes the AI-operational layer truly portable — not just
"AI_LOCK file pattern" but the BEHAVIORAL discipline that
makes AI_LOCK work.

---

## §11 — What this doc does NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS, or
  CLAUDE.md.
- Does NOT bootstrap any new repo.
- Does NOT extract any subsystem.
- Does NOT pre-commit any platform doctrine, token contract,
  MVP scope, or repo decision.
- Does NOT author Stacey-specific brand content (Pass 268 §8
  still gating).
- Does NOT modify the AI-governance system in this repo
  (preserved as-is; the §10 anti-drift rules are FUTURE
  platform-repo doctrine).
- Does NOT supersede or replace Pass 268 or 269. This pass
  extends both with concrete data + the MVP scoping question.
- Does NOT downgrade or abandon PMS Phase 2+ work — same
  preservation as Pass 268 §7.

---

## §12 — Cross-references

- Pass 268 [`PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md`](PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md) — discovery substrate (4-tier matrix + repo-split + 9 doctrine principles).
- Pass 269 [`PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md`](PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md) — bootstrap-prerequisite decisions (naming, package boundaries, tokens, auth, workspace, AI-governance).
- Pass 266 — `MapSessionProvider` exemplar of the inert-seam pattern (referenced throughout §4 + §8).
- Owner relay 2026-05-09 (the 8-point continuation directive this brief responds to).
- `LAW_LAYERED_ARCHITECTURE.md` — partly portable per §9 (Layer 2 candidate).
- `LAW_ANIMATION_AND_ATMOSPHERE.md` — partly portable per §9 (Layer 2 candidate); reduced-motion contract becomes platform LAW.
- `MOLANDJESUS_DESIGN_DECISIONS.md` — locked BD canon (Layer 4 brand doctrine); explicitly NOT extracted.
- `theme.css` — primary token-contract migration surface (§5.5).
- `services/navigation/mapPerformance.ts` — `bidondent.*` localStorage key rename target.
- `utils/maplibreResizePatch.ts` — `__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__` global rename target.

---

## §13 — Status

- **Drafted:** 2026-05-09 (Pass 270, Platform Contamination Audit lane).
- **Status:** ACTIVE planning.
- **Authority:** PLAN. Subordinate to all current LAW docs.
- **Owner approval required:** TRUE for any subsequent
  extraction action. Three new owner-decision points added
  beyond Pass 268 + 269's 21:
  1. MVP scope (§6.5) — 16-subsystem nucleus acceptable?
  2. Optional modules NOT in MVP — any moved in?
  3. Stacey gaps strategy (§6.4) — 3rd-party vs post-MVP-module?
- **Supersedes:** none.
- **Superseded by:** none.

**Next legitimate forward triggers:**

1. Owner ratifies MVP scope (§6.5) → MVP extraction sequence
   becomes authorable.
2. Owner ratifies §10 anti-drift rules → those become draft
   platform operational doctrine.
3. Owner answers Pass 268 §8 Stacey questions → Stacey
   brand-direction doc authorable.
4. Owner authorizes new repo bootstrap (any of the 24
   total decision points across Passes 268+269+270 ratified
   into a coherent subset) → bootstrap pass authorized.
5. Owner authorizes PMS Phase 2 → independent of platform
   extraction.

Until ratification: disciplined hold. Same discipline that
produced Passes 262–270.

The platform direction expanded the canvas across three passes.
The discipline that makes the canvas worth painting on stays
exactly the same.
