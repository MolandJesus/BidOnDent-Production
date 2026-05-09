---
status: ACTIVE
authority: PLAN
scope: platform-extraction-discovery
canonical_source_of_truth: PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 268 discovery brief produced under owner relay 2026-05-09 strategic expansion (BidOnDent transitions to legacy/R&D, new modular platform repo created, Stacey site as first branded implementation). Audits the current repo's architectural surface, classifies subsystems into a 4-tier extraction matrix (platform core / optional modules / business-coupled / archive-only), proposes 3 repo-split strategies with tradeoffs, surfaces platform doctrine principles for owner ratification, and lists prerequisite questions before Stacey brand work can begin. Doc-only — no source touched, no LAW edits, no MOLANDJESUS edits. Decisions are surfaced for owner review, NOT pre-committed.
last_updated: 2026-05-09
---

# Platform Extraction Discovery Brief — 2026-05-09

> **Tier:** PLAN. Future direction, not current truth.
> **Authority:** Pass 268. Owner relay 2026-05-09 strategic expansion
> ("BidOnDent → legacy/R&D, new modular platform, Stacey first
> branded implementation").
>
> **What this doc is:** a single discovery brief intended to give
> the owner the substrate needed to make architectural decisions
> about the platform-extraction direction. It catalogues, classifies,
> and surfaces options. It does NOT decide.
>
> **What this doc is NOT:**
> - LAW. No platform doctrine is binding until owner-ratified.
> - A replacement for `LAW_PROJECT_RULES.md`,
>   `LAW_LAYERED_ARCHITECTURE.md`, or
>   `MOLANDJESUS_DESIGN_DECISIONS.md`. Those govern BidOnDent and
>   remain authoritative for this repo.
> - Implementation. No subsystems are extracted; no repos are
>   created; no code is moved.
> - A Stacey brand spec. Brand work is gated on owner-supplied
>   answers to the prerequisite questions in §8.
>
> **Lane discipline:** characterization/planning only. If
> behavior could plausibly change, STOP and characterize instead
> of modifying.

---

## §1 — Strategic context

### §1.1 The shift

Owner relay 2026-05-09 expands the long-term direction:

- **BidOnDent-Production** (this repo) becomes **legacy / R&D /
  reference**. It continues to receive stabilization, PMS
  maturation, modularization preparation, and instrumentation
  hardening — but it stops being treated as the permanent
  primary business platform.
- **A new modular platform repo** is to be created — intentionally
  business-agnostic — extracting reusable systems from this repo.
- **Branded implementations** (starting with Stacey's financial-
  advisory/coaching site) become themed deployments OF the
  platform, not independent rewrites.

### §1.2 What the shift preserves

Per the relay: nothing about the engineering work shipped during
Passes 262–267 should be discarded. Specifically preserved:

- Provider/shell architecture (Pass 266 `MapSessionProvider`
  pattern is exemplary; the pattern itself transfers cleanly).
- Instrumentation substrate (Pass 262 perf marks + dev counters;
  Pass 263–264 verification methodology; Pass 265 shared harness).
- Map lifecycle engineering (Pass 258 topology, Pass 261
  measurement methodology, Pass 259 architecture options matrix,
  Pass 260 sequencing).
- Motion canon (`LAW_ANIMATION_AND_ATMOSPHERE.md` and the
  prefers-reduced-motion contract).
- Backend abstractions (Clerk verification + signed-URL
  hydration patterns).
- Layered architecture discipline (`LAW_LAYERED_ARCHITECTURE.md`
  L1/L2/L3/L4 model).

### §1.3 What the shift separates

The core insight from the relay:

> The current visual identity (dark-mode, cinematic premium
> aesthetic, advanced map orchestration, layered shell, motion
> system, provider architecture) remains valuable — but it is
> Jeffrey's brand language, not platform-agnostic doctrine.
> Stacey's business needs a DIFFERENT emotional product: warmer,
> editorial, calmer, trust-oriented, narrative-driven.

This doc therefore distinguishes:

- **Platform** — business-agnostic infrastructure that any branded
  implementation can adopt.
- **Brand** — emotional UX layer specific to a single business.

The platform should NEVER be bent to satisfy a brand. The
platform should EXPOSE the seams that brands plug into. This is
the central architectural principle this brief argues for.

---

## §2 — Current repo architectural inventory

Counts and surfaces below were produced from the current
working tree at HEAD (Pass 267, `4a284dc4`).

### §2.1 Component LOC by domain

| Domain                                  | LOC    | Reusability stance                             |
| --------------------------------------- | ------ | ---------------------------------------------- |
| `components/shop/` (directory + map)    | 17,302 | Mostly business-coupled; map pane partly modular |
| `components/codelayer/` (bids/reports/account) | 9,421  | Business-coupled (collision-specific)         |
| `components/landing/` (BidOnDent landing) | 8,754  | Business-coupled (BidOnDent narrative)        |
| `components/maps/` (map engine + layers)  | 8,558  | Optional module candidate                      |
| `components/ui/` (shadcn primitives)      | 4,771  | Platform core                                  |
| `components/insurer/` (claims)            | 4,601  | Business-coupled (collision-specific)         |
| `components/dashboard/` (shell + widgets) | 3,280  | Mixed: shell reusable, widgets coupled         |
| `components/app/` (AppShell, Layout)      | 1,778  | Platform core                                  |

**Net:** ~30,000 LOC business-coupled, ~10,000 LOC platform-core,
~8,500 LOC optional-module candidate (maps), with the dashboard
domain as a partly-extractable mixed bag.

### §2.2 Hooks + services + features inventory (counts only)

- `src/app/hooks/` — **77 hooks**. Mix of reusable session
  primitives (useUser, useNavigation, useAppearanceMode,
  useDeepLinkNavigation, useOnlineStatus, useServiceWorkerUpdate)
  and business-coupled hooks (useUserData,
  useCustomerReportStatusNotifications, useCustomerBidNotifications,
  useShopMapListings, useCoverageNavigationExperience).
- `src/app/services/` — **97 files**. Strong domain coupling:
  `intelligence/marketIntelligence`, `navigation/persistedState`,
  `notifications/`, `realtime/`. Small reusable core:
  `errorReporting`, `sentryInit`, `networkProfiles`,
  `validateAppConfig`, `storage/`, `auth/`.
- `src/app/features/` — **2 features** (`navigation/`,
  `notifications/`). Notifications feature is reusable;
  navigation feature is collision-specific.

### §2.3 Backend (Supabase) inventory

- `supabase/functions/server/utils/` — **8 utilities**. All
  reusable platform primitives: `clerk.ts` (Clerk JWT
  verification), `storage.ts` (signed-URL hydration pattern),
  `rateLimiter.ts`, `helpers.ts`, `email.ts`, `emailTemplates.ts`,
  `authz.ts`.
- `supabase/functions/server/handlers/` — business-coupled per-route
  handlers (most of the BidOnDent business logic).
- `supabase/migrations/*.sql` — **10 migrations**. BidOnDent-
  schema-coupled (damage_reports, vehicles, bids, claims, etc.).
  NOT reusable as-is.
- Edge function pattern itself (Clerk verify_jwt: false +
  in-function `requireClerkSession()`) IS reusable doctrine.

### §2.4 Existing reusable doctrine candidates (already in repo)

These docs already encode reusable infrastructure thinking
(though phrased as BidOnDent-specific):

- `LAW_LAYERED_ARCHITECTURE.md` — L1/L2/L3/L4 model. Largely
  business-agnostic. Reusable as platform foundation.
- `LAW_ANIMATION_AND_ATMOSPHERE.md` — motion canon (29 keyframes,
  reduced-motion contract, framer-motion escape clause). Largely
  business-agnostic. Reusable as platform doctrine.
- `LAW_MAP_RENDERER_CONTRACT.md` — map-specific. Belongs in the
  optional-map-module rather than platform core.
- `LAW_HARDENING_PLAN.md` — BidOnDent-specific phase plan.
  Stays in legacy.
- `LAW_PROJECT_RULES.md` — BidOnDent-specific. Stays in legacy.
- `MOLANDJESUS_DESIGN_DECISIONS.md` — **LOCKED apex design
  canon for BidOnDent**. Per relay: stays preserved as Jeffrey's
  brand language. Does NOT transfer to platform-core or to
  Stacey.

### §2.5 Skills already coupled to platform thinking

- `bd-design-identity` — BidOnDent-specific brand skill.
- `supabase-clerk-edge-function` — REUSABLE platform pattern.
- `supabase-storage-signed-urls` — REUSABLE platform pattern.
- `supabase-pro-cost-control` — REUSABLE infrastructure pattern.
- `mola-ai-relay-protocol` — REUSABLE process pattern.

The two Supabase skills are de-facto platform doctrine already
authored.

---

## §3 — Extraction Matrix (4 tiers)

Each subsystem in the current repo classified into one of:

- **A. Reusable Platform Core** — every business will need this.
- **B. Reusable Optional Module** — some businesses will need this; should be opt-in.
- **C. Business-Coupled** — BidOnDent-specific; stays in legacy.
- **D. Archive-Only** — historical/reference; no extraction needed.

### §3.1 Tier A — Reusable Platform Core

| Subsystem                           | Path / Surface                                        | Notes                                                                              |
| ----------------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| shadcn UI primitives                | `components/ui/`                                       | Already vendor-neutral. Direct copy candidate.                                       |
| App shell (AppShell + DashboardLayout + LandingPageLayout patterns) | `components/app/`                                      | Generalize: brand assets become props/slots.                                          |
| Auth wiring (Clerk integration)     | `components/auth/`, `services/clerkService.ts`, `services/auth/` | Clerk is provider-agnostic at the app layer; keep that boundary clean.               |
| Edge-function auth pattern          | `supabase/functions/server/utils/clerk.ts`             | The verify_jwt: false + requireClerkSession() pattern is platform doctrine.          |
| Storage abstraction                 | `supabase/functions/server/utils/storage.ts`, `services/storage/` | Pointer-on-write / sign-on-read pattern. Platform doctrine.                          |
| Notifications system                | `features/notifications/`                              | Toast + deep-link pattern is generic; route mapping is per-app.                       |
| Theme system foundation             | `styles/theme.css`, `theme/globalSurfaceTheme.ts`      | The TOKENS architecture is reusable; the BD-specific values are not.                  |
| Motion system                       | `LAW_ANIMATION_AND_ATMOSPHERE.md` + `styles/animations.css` | Reduced-motion contract, 29-keyframe set: platform doctrine.                         |
| Provider/context pattern            | `MapSessionProvider` (Pass 266) as exemplar            | The post-auth single-responsibility provider seam is the pattern, not the contents.   |
| Instrumentation substrate           | `utils/perfMarks.ts`, `utils/devMapInstanceCounter.ts`, `utils/devGlContextCounter.ts`, `test-utils/pmsInstrumentationHarness.ts` | Generic perf-mark + counter pattern; rename `bd:` namespace to platform namespace.    |
| Error boundaries                    | `components/ScreenErrorBoundary.tsx`, `components/ImageErrorBoundary.tsx` | Generic patterns.                                                                     |
| Image fallback                      | `components/codelayer/ImageWithFallback.tsx`           | Generic; rename out of codelayer.                                                     |
| Service worker / PWA hooks          | `hooks/useOnlineStatus.ts`, `hooks/useServiceWorkerUpdate.ts` | Generic.                                                                              |
| Sentry integration                  | `services/sentryInit.ts`, `services/errorReporting.ts` | Generic; configurable.                                                                 |
| Validate-app-config pattern         | `utils/validateAppConfig.ts`                            | Generic startup gate.                                                                 |
| MaplibreResizePatch                 | `utils/maplibreResizePatch.ts`                          | Generic if maps are an optional module that uses MapLibre.                            |
| Layered architecture doctrine       | `LAW_LAYERED_ARCHITECTURE.md`                            | L1/L2/L3/L4 is business-agnostic.                                                     |
| Hashpage routing pattern            | `components/app/AppShell.tsx` (`useHashPage`)            | Lightweight router pattern; the four hash-pages are BD-specific.                      |

**~25 platform-core subsystems.** Some need light renaming
(strip `bd:` / `bidondent` from identifiers) but no semantic
rework.

### §3.2 Tier B — Reusable Optional Modules

Each is a SEPARATE opt-in package:

| Module                          | Comprises                                                                | Used by                                                              |
| ------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **map-engine**                   | `components/maps/engine/`, `components/maps/MapLibreServiceCoverageMap.tsx`, `components/maps/MapLibreCoverageMapLayers.tsx`, `mapLibreControllers.tsx`, `mapLibreStyles.ts`, `geoCircle.ts` | Any branded site that needs a map host (Stacey's likely doesn't).   |
| **persistent-map-session (PMS)** | `MapSessionProvider.tsx` + `mapSessionContext.ts` (Pass 266) + future Phase 2-6 work | Branded sites with multiple map-bearing routes (e.g. coverage + dashboard). |
| **performance-tracking**          | `services/navigation/mapPerformance.ts`, `useMapPerformanceTracking`, `pmsInstrumentationHarness` | Any site that wants persisted-window perf signals.                  |
| **navigation/turn-by-turn**       | `features/navigation/`, related hooks                                    | Niche; collision-style navigation use cases.                        |
| **realtime subscriptions**        | `services/realtime/`                                                     | Live updates; many businesses need this.                             |
| **storage-media gallery**         | `services/storage/`, `ImageWithFallback`, photo upload patterns          | Any media-heavy site.                                                |
| **scheduling/consultation**       | DOES NOT EXIST YET — would be new platform module                        | Stacey's business will likely need this.                             |
| **content/CMS**                   | DOES NOT EXIST YET — would be new platform module                        | Editorial/storytelling sites (Stacey).                               |
| **lead-capture/forms**            | Light forms exist (BusinessInquirySection); generalize the pattern       | All branded sites.                                                   |

**~6 modules already extractable + ~3 modules that don't yet
exist but are obvious platform additions.** Stacey's site
needs the not-yet-existing ones (scheduling, content, lead
capture) more than the existing ones (map, navigation).

### §3.3 Tier C — Business-Coupled (BidOnDent-only)

Stays in legacy repo. Not extracted.

| Subsystem                              | Why coupled                                                           |
| -------------------------------------- | --------------------------------------------------------------------- |
| Insurer / claims domain                 | Collision-specific business logic.                                    |
| Shop directory                          | Body-shop discovery; partly reusable as a directory pattern but copy is BD-coupled. |
| Bids domain (codelayer/Bids*)            | Bidding is the BD product mechanic.                                   |
| Reports / damage reports                 | Damage-photo workflow is BD-specific.                                 |
| Customer/Shop/Insurer role routing       | Three-role customer-shop-insurer triangle is BD-specific.              |
| BidOnDent landing copy                   | Brand-specific narrative.                                              |
| Supabase schema (`supabase/migrations/*`) | Damage-report-centric schema.                                         |
| Edge-function business handlers           | Per-route business logic.                                              |
| `MOLANDJESUS_DESIGN_DECISIONS.md`         | LOCKED apex BD design canon (per relay: explicit preservation).        |
| `bd-design-identity` skill                | BD-specific design.                                                    |
| `LAW_HARDENING_PLAN.md`                   | BD-specific phase plan.                                                |
| Most of `services/intelligence/`          | Market-intelligence is BD-product-specific.                            |
| Most BD-specific hooks                    | Various hooks coupled to claim/bid/report mechanics.                   |

### §3.4 Tier D — Archive-Only / Reference

| Path                            | Notes                                                                |
| ------------------------------- | -------------------------------------------------------------------- |
| `docs/archive/`                  | Historical pass evidence + superseded plans. Reference only.         |
| `docs/evidence/`                 | Visual/runtime evidence captured during prior passes.                 |
| Demo-mode services (`demoDataService`, `demoAuthService`) | BD development helpers.                                               |
| Workflow component placeholders  | Aspirational BD components.                                          |
| `database_init.tsx`              | Legacy cold-start safety net (per `SUPABASE_SETUP_GUIDE.md` §9).       |

---

## §4 — Repo split strategy options

Three viable structural options. Each evaluated on five axes:
ergonomic complexity, extraction cost, dependency clarity, brand
isolation, ship velocity.

### §4.1 Option α — Two-repo (legacy + new platform-core)

```
bidondent-production           (legacy; current; freeze + R&D)
<new-platform-name>            (new; reusable platform; npm-publishable)
<stacey-business>              (Stacey's site, depends on platform-core via npm)
```

- **Ergonomics:** simple. Three separate git repos.
- **Extraction cost:** moderate. Platform-core repo seeded with
  copies of Tier A subsystems; published to npm; Stacey site
  consumes it.
- **Dependency clarity:** high. Each repo owns its scope.
- **Brand isolation:** very high. Stacey site can't accidentally
  inherit BD theming.
- **Ship velocity:** slower for Stacey at first (must wait for
  platform-core to publish updates).

### §4.2 Option β — Monorepo (pnpm/Turborepo)

```
<new-platform-name>/
  packages/
    platform-core/     (Tier A subsystems)
    platform-modules/  (Tier B optional modules)
    brand-assets/      (per-brand theme/copy/logo bundles)
  apps/
    stacey/            (Stacey's site)
    jeffrey/           (future)
    bidondent-legacy/  (eventually moved here, OR stays in original repo)
```

- **Ergonomics:** moderate (workspace tooling).
- **Extraction cost:** higher upfront (monorepo setup) but lower
  per-extraction.
- **Dependency clarity:** very high. Workspace boundaries explicit.
- **Brand isolation:** high. App-level apps inherit only what
  they import.
- **Ship velocity:** fastest for cross-cutting changes (one PR
  touches package + consuming app).

### §4.3 Option γ — Three-repo (legacy + platform + per-brand)

```
bidondent-production           (legacy; freeze)
<platform-core>                (npm packages)
<stacey-financial>             (Stacey site)
<jeffrey-brand>                (future)
```

- **Ergonomics:** simple but proliferative (n+1 repos).
- **Extraction cost:** moderate.
- **Dependency clarity:** high.
- **Brand isolation:** very high.
- **Ship velocity:** slow for cross-cutting changes (must
  publish + bump + deploy).

### §4.4 Recommendation (for owner ratification)

**Option β — Monorepo** offers the best long-term throughput:

- Cross-cutting changes (e.g. updating platform-core's auth
  wrapper) propagate to all apps in one PR.
- Brand isolation is achieved by app-level boundaries, not
  separate repos.
- The `bidondent-legacy` migration can be deferred indefinitely
  (start by leaving it in this repo; move it later only if
  needed).
- Tooling (pnpm workspaces, Turborepo) is mature.

The recommendation explicitly accepts the upfront monorepo
tooling cost in exchange for better long-run ergonomics. Option
α is a viable fallback if the owner prefers minimal initial
infrastructure.

**Owner-ratification questions before this can advance:**

1. Which option (α / β / γ) does the owner prefer?
2. Should `bidondent-production` stay in its current repo as
   legacy, or eventually be moved into the monorepo as
   `apps/bidondent-legacy/`?
3. Is publishing platform-core to npm acceptable, or should it
   stay private?
4. Naming: what is the new repo / platform name?

---

## §5 — Platform doctrine ideas (for owner ratification)

These are PRINCIPLES, not LAW. Each would become a platform-LAW
clause if owner-ratified:

### §5.1 Brand-platform separation

> Platform code MUST NOT contain brand-specific colors, copy,
> typography, or visual aesthetics. Brand surfaces only at the
> APP layer (`apps/<brand>/`) and the BRAND-ASSETS package
> (`packages/brand-assets/<brand>/`). The platform exposes
> tokens; brands fill them.

Implication: every CSS variable that today reads like
`--bd-blue-500` must become token-shaped (`--surface-primary-500`)
in platform-core, with brand-specific overrides in the app layer.

### §5.2 Provider seam discipline

> Every cross-cutting capability (auth, theme, notifications,
> map session, content session, scheduling session) is exposed
> as a Provider with a frozen no-op default value and a
> stateful provider implementation. Apps OPT IN by wrapping
> their tree with the provider; apps that don't opt in run
> against the no-op default with zero behavior change.

This is the Pass 266 `MapSessionProvider` pattern, generalized.

### §5.3 Optional-module independence

> Each optional module is npm-installable (or workspace-package)
> independently. No optional module imports another optional
> module. Cross-module composition lives at the APP layer via
> provider stacking.

Implication: `map-engine` can be installed without
`persistent-map-session`; `scheduling` can be installed without
`content`; etc.

### §5.4 Theme isolation

> The theme system uses CSS custom properties as the boundary.
> Platform-core ships a token contract (color tokens, motion
> tokens, surface tokens). Brand assets fill them. No
> platform-core component reads brand-specific values directly.

This is achievable today with a token-shaped rewrite of the
existing `theme.css` system.

### §5.5 Reduced-motion is platform LAW

> Every animation in any branded implementation must respect
> `prefers-reduced-motion: reduce`. The platform's motion
> primitives enforce this contract; brand-specific animation
> additions must extend the platform contract, not bypass it.

Direct port of `LAW_ANIMATION_AND_ATMOSPHERE.md` §3 to platform
doctrine.

### §5.6 Auth is provider-agnostic at the app layer

> Apps consume `useUser()`, `useSession()`, etc. — provider-
> agnostic. The Clerk-specific binding lives in a single
> integration package; apps that prefer a different identity
> provider swap the integration without touching app code.

Implication: today's direct Clerk imports across the codebase
become indirections through a thin auth-context wrapper.

### §5.7 Storage uses pointers, not signed URLs

> Every persisted media reference uses `storage://<bucket>/<path>`
> pointers; signed URLs are minted on every read. This is
> platform doctrine.

Direct port of `SUPABASE_SETUP_GUIDE.md` §16 to platform LAW.

### §5.8 Edge-function auth lives in the function

> Supabase edge functions verify Clerk JWTs INSIDE the function
> (`requireClerkSession()`), with `verify_jwt: false` pinned
> in `supabase/config.toml`. The Supabase gateway does NOT
> verify; the function is the boundary.

Direct port of `SUPABASE_SETUP_GUIDE.md` §17 to platform LAW.

### §5.9 Schema source-of-truth

> The platform's database schema is the migration files. Any
> `_init.tsx` files are legacy cold-start safety nets, not
> equal authorities.

Direct port of `SUPABASE_SETUP_GUIDE.md` §9 to platform LAW.

---

## §6 — Migration sequencing thoughts

This is NOT a binding plan; it's a SEQUENCE PROPOSAL for owner
review.

### §6.1 Phase α — Foundation (no code moves yet)

- Owner ratifies the repo-split option (§4.4).
- Owner ratifies the platform doctrine principles (§5).
- Stacey questions answered (§8).
- New platform repo / monorepo created (empty).

### §6.2 Phase β — Tier A extraction

- Move (or copy + symlink) `components/ui/` to platform-core.
- Move `components/app/` shell components, generalize props.
- Move `features/notifications/` (rename from `notifications`
  to `notifications` — already generic).
- Move `services/auth/`, `services/clerkService.ts`,
  `components/auth/`.
- Move motion primitives (`styles/animations.css` portions).
- Establish token-shaped theme contract.
- Extract instrumentation substrate (Pass 262 utilities).

### §6.3 Phase γ — Tier B module extraction

- `map-engine` module (when PMS Phase 2 lands; ports cleanly).
- `performance-tracking` module.
- `realtime` module.
- `storage-media` module.

### §6.4 Phase δ — Stacey app

- Create `apps/stacey/` from platform shell.
- Apply Stacey brand tokens (after owner-supplied answers).
- Add Stacey-specific routes, content, scheduling integration.

### §6.5 Phase ε — BidOnDent legacy decision

- Keep `bidondent-production` repo as legacy (default).
- OR move it into `apps/bidondent-legacy/` if owner decides.
- Either way: `bidondent-production` continues to receive PMS
  Phase 2+ work and engineering hardening, but stops
  receiving new product features.

### §6.6 Strict ordering rule

Phases α → β → γ → δ → ε must be strictly sequential. No phase
begins without owner ratification of its predecessor's outcome.
This matches the discipline established during Passes 262–267.

---

## §7 — PMS roadmap preservation

Per relay: PMS Phase 2+ planning remains alive in documentation
and is NOT abandoned. The four PMS planning corpus docs:

- `PLAN_PMS_TOPOLOGY_AUDIT_2026-05-09.md`
- `PLAN_PMS_ARCHITECTURE_OPTIONS_2026-05-09.md`
- `PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md`
- `REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md`

REMAIN AUTHORITATIVE for the PMS module. Under the platform
extraction direction:

- Today: PMS lives in `bidondent-production` and is BD-coupled
  in incidentals (the `bd:` mark namespace).
- Future: PMS migrates to `packages/persistent-map-session/`
  (Tier B optional module) when the platform repo exists.
- Phase 2 (engine lift) is still gated and still requires owner
  authorization. The migration to platform-core does NOT
  unblock Phase 2 — they are independent decisions.

The Pass 266 `MapSessionProvider` engine-less scaffold is
ALREADY platform-grade (the pattern is reusable); only the file
path moves under extraction.

---

## §8 — Stacey planning prerequisites (questions for owner/Stacey)

Brand work cannot meaningfully advance without these answers.
Owner relay clarification 2026-05-09 explicitly told the Builder
NOT to invent answers.

### §8.1 Service model

- What does Stacey actually sell? (One-on-one coaching? Group
  programs? Subscription advisory? Free consultation → paid
  engagement? Courses?)
- Single primary service, or service catalogue?
- Pricing model: hourly / packages / subscription / sliding scale?

### §8.2 Target client

- Who is the client? (Demographic, life stage, financial
  context.)
- One client persona or multiple?
- Are clients local/regional or national/online?
- Existing book of clients, or starting fresh?

### §8.3 Emotional tone

- Premium boutique / approachable & warm / authoritative
  educator / personal storyteller / scalable brand?
- The relay says "warmer, editorial, calmer, trust-oriented,
  narrative-driven" — does Stacey concur, or is that the
  owner's interpretation?
- How "personal" should the brand feel? (Stacey-as-individual
  vs Stacey-as-brand-name?)

### §8.4 Positioning

- Educational authority? Personal coach? Boutique advisor?
  Scalable thought-leader brand?
- What's the ONE thing Stacey wants visitors to feel/do?

### §8.5 Reference brands

- Examples of sites/brands she likes (and dislikes).
- Examples of brand voices she resonates with.
- Style: contemporary editorial / Scandinavian minimal /
  warm-organic / structured-corporate / something else?

### §8.6 Practical needs

- Booking/scheduling: which calendar/booking tool? (Calendly,
  Acuity, custom?)
- Payments: which processor? (Stripe, Square, custom?)
- Content: blog/resources/courses/email-list/all of these?
- Lead capture: email-only / form / consultation-booking?
- CRM integration?
- Geographic scope, including any regulatory disclosures (some
  financial-advisory work has compliance requirements).

### §8.7 Existing assets

- Logo / wordmark / typography preferences?
- Photography (Stacey's portrait, lifestyle imagery)?
- Existing copy (about page, mission statement)?
- Any existing brand color palette?
- Domain name?

### §8.8 Timeline + ship pressure

- Is there a launch date pressure? Soft launch then iterate?
- Any pre-existing marketing commitment that requires a working
  site by a specific date?

Until these answers are supplied, Stacey-specific brand work
should remain UNAUTHORIZED. This is the same discipline that
prevented inventing PMS Phase 1 work without Pass 259 §5
acceptance.

---

## §9 — What this doc does NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc or `MOLANDJESUS_DESIGN_DECISIONS.md`.
- Does NOT decide which repo-split option will be used.
- Does NOT pre-commit any platform doctrine principle.
- Does NOT extract any subsystem.
- Does NOT create any new repo.
- Does NOT author Stacey-specific brand content.
- Does NOT modify the AI_LOCK Active AI claim shape (single-pass
  doc work; standdown follows commit per Rule 4).
- Does NOT supersede `LAW_PROJECT_RULES.md`,
  `LAW_LAYERED_ARCHITECTURE.md`, or any other LAW. BidOnDent's
  laws still govern this repo.
- Does NOT abandon PMS Phase 2+ work. PMS roadmap remains
  intact (§7).

---

## §10 — Cross-references

- Owner relay 2026-05-09 (multi-business platform expansion).
- `LAW_LAYERED_ARCHITECTURE.md` — current 4-layer model;
  candidate for direct port to platform LAW.
- `LAW_ANIMATION_AND_ATMOSPHERE.md` — motion canon; candidate
  for direct port.
- `LAW_PROJECT_RULES.md` — BidOnDent-specific; stays in legacy.
- `MOLANDJESUS_DESIGN_DECISIONS.md` — locked BidOnDent design;
  stays preserved (relay-explicit).
- `REF_CODE_ORGANIZATION.md` — current repo structure +
  extraction boundaries (input to §3).
- `REF_MODULE_STATUS.md` — current module completion matrix
  (input to §3).
- `PLAN_PMS_TOPOLOGY_AUDIT_2026-05-09.md` (Pass 258),
  `PLAN_PMS_ARCHITECTURE_OPTIONS_2026-05-09.md` (Pass 259),
  `PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md` (Pass 260),
  `REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md` (Pass 261) —
  PMS planning corpus; preserved as §7.
- `SUPABASE_SETUP_GUIDE.md` §9, §16, §17 — sources for §5.7,
  §5.8, §5.9 platform doctrine ideas.

---

## §11 — Status

- **Drafted:** 2026-05-09 (Pass 268, Platform Extraction Discovery lane).
- **Status:** ACTIVE discovery brief.
- **Authority:** PLAN. Subordinate to all current LAW docs.
  Surfaces options for owner review; binds nothing.
- **Owner approval required:** TRUE for any subsequent action.
  Specifically:
  - Repo-split option choice (§4)
  - Platform doctrine ratification (§5)
  - Migration sequencing approval (§6)
  - Stacey question answers (§8)
- **Supersedes:** none.
- **Superseded by:** none.

**Next legitimate forward triggers (owner authorization gates):**

1. Owner ratifies one or more platform doctrine principles (§5)
   → those become draft platform LAW for the new repo.
2. Owner picks a repo-split option (§4) → bootstrap of new repo
   becomes authorized.
3. Owner provides Stacey answers (§8) → Stacey brand-direction
   doc becomes authorable.
4. Owner authorizes PMS Phase 2 (engine lift) → PMS work
   resumes in this repo, eventually migrating to
   `packages/persistent-map-session/` after the new repo exists.

Until one of these triggers fires, the correct posture is
disciplined hold. Same doctrine that produced the successful
Passes 262–267 sequence.
