---
status: ACTIVE
authority: REF
scope: capability-vs-identity-matrix-synthesis
canonical_source_of_truth: REF_CAPABILITY_VS_IDENTITY_MATRIX_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 279 capability-vs-identity matrix under owner relay 2026-05-09 #10 priority D (central extraction-governance axis). SYNTHESIS pass — consolidates Pass 274-278 mechanical findings into a unified per-subsystem 6-axis classification (type-shape / token systems / behavioral authority / provider topology / runtime continuity / emotional infrastructure). 19 subsystem folders inventoried (~99K LOC total): ~48K Tier C BD-domain (landing 8754 + dashboard 3280 + reports 2059 + insurer 4601 + shop 17302 + codelayer 9421 + admin 2726), ~8.5K Tier B map (8558), ~4.8K Tier A clean (ui 4771 + theme 51), ~35K mixed-tier (shell 1778 + types 779 + services 16950 + hooks 9965 + features 2072 + utils 1977 + routers 1222 + auth 753). Three classification outcomes: (1) PURE-CAPABILITY subsystems (clean extraction targets) — components/ui/, services/storage/, src/app/theme/, parts of services/supabase/ plumbing; (2) PURE-IDENTITY subsystems (Tier C clean app-private) — landing, dashboard, reports, insurer, shop, codelayer, admin, dev, intelligence, BD CRUD layers; (3) SPLIT subsystems (capability + identity coexist; pre-extraction prep needed) — shell (capability=delegation pattern + slot composition; identity=BrandLogo + DashboardAtmosphere concentration), types/index.ts (3 platform-shape + 13 BD-domain symbols in flat barrel), theme.css (~38 platform-shape classes + ~42 emotional + ~125 BD-domain), notifications (machinery=capability; value=identity per Pass 273 §2.2), services/auth (thin-wrapper=capability; Clerk binding=vendor-locked identity), services/navigation (machinery=capability; route taxonomy + persistence prefixes=identity), hooks/ (useNavigation + useAppearanceMode = capability; useUserData + useAuth = identity), features/notifications (registry pattern=capability; BD category/deep-link unions=identity). Six-axis classification ratio: across the mixed band, ~60% capability portion / ~40% identity portion. Aggregate codebase: ~80% Tier C BD-domain or vendor-bound, ~15% pure or split-extractable platform candidate, ~5% pure platform-grade ready for direct port. Three integration findings: (1) the mixed-tier band (35K LOC) is the actual extraction work surface — pure-capability and pure-identity subsystems have already self-classified through file organization; (2) capability-vs-identity boundary lives at FILE level for some subsystems (services/, hooks/) and at SYMBOL level for others (types/index.ts, theme.css) — requiring different extraction strategies per subsystem; (3) the 6 axes confirm Pass 271 6-category framework + Pass 273 6-seam taxonomy as a unified architectural model — capability axes map to seam types; identity axes map to BD-flavor at each seam. Framework HOLDS — every finding fits stable doctrine. ZERO new contamination categories. ZERO new owner-decision points (cumulative remains 31). Doc-only.
last_updated: 2026-05-09
---

# Pass 279 — Capability-vs-Identity Matrix

> **Tier:** REF. Current truth — synthesis of 6-axis
> classification per subsystem.
> **Authority:** Owner relay 2026-05-09 #10 priority D
> ("the central extraction-governance axis ... it now exists
> simultaneously across type-shape, token systems, behavioral
> authority, provider topology, runtime continuity, and
> emotional infrastructure").
>
> **What this doc is:** integration pass that consolidates
> Pass 274 (registries), Pass 275 (type graph), Pass 276 (token
> map), Pass 277 (shell behavior), Pass 278 (provider matrix)
> into a single per-subsystem capability-vs-identity classification.
>
> **What this doc is NOT:**
> - LAW. Synthesis of inventory data, not doctrine.
> - A re-test of convergence. Framework used as stable doctrine.
> - An extraction plan. Inventory is input, not authority.
> - Exhaustive per-file classification. Subsystem-level
>   resolution is sufficient to surface sequencing implications.
> - A new decision-point generator. Pass 279 adds zero owner
>   decisions to cumulative 31.

---

## §1 — Mission

Per relay #10:

> "The capability-vs-identity distinction is no longer
> philosophical. It now exists simultaneously across type-shape,
> token systems, behavioral authority, provider topology, runtime
> continuity, and emotional infrastructure. That makes it the
> central extraction-governance axis."

The questions this pass answers:
1. For each major subsystem, what is the capability portion and
   what is the identity portion?
2. Across the 6 axes Passes 274-278 + runtime audit established,
   where does the capability-vs-identity boundary sit?
3. Which subsystems are pure-capability (clean extraction)?
4. Which subsystems are pure-identity (clean Tier C)?
5. Which subsystems are split (need pre-extraction prep to
   separate capability from identity)?
6. What is the aggregate ratio across the codebase?

---

## §2 — Six classification axes

| Axis                          | Source             | What it measures                                      |
| ----------------------------- | ------------------ | ----------------------------------------------------- |
| 1. Type-shape coupling         | Pass 275            | Which BD-domain types leak into the subsystem         |
| 2. Token / class consumption   | Pass 276            | Which `--bd-*` tokens or `.bd-*` classes are used     |
| 3. Behavioral authority        | Pass 277            | Owns / Delegates / Emits behavior                     |
| 4. Provider topology           | Pass 278            | Capability-bearing or identity-bearing provider role  |
| 5. Runtime continuity          | runtime-audit lane  | Persistence keys, realtime channels, route authority  |
| 6. Emotional infrastructure    | Pass 271 + 276      | Emotional-token / atmospheric-class concentration     |

Each subsystem is classified on each axis as: **CAPABILITY**
(substitutable platform-grade), **IDENTITY** (BD-locked / vendor-locked /
app-private), or **SPLIT** (both coexist within the subsystem).

---

## §3 — Subsystem inventory + LOC

| Subsystem path                    | Files | LOC     | Tier (Pass 270 §6.2 baseline) |
| --------------------------------- | ----- | ------- | ----------------------------- |
| `src/app/components/ui/`          | 53    | 4,771   | A — UI primitives             |
| `src/app/components/app/` (shell) | 8     | 1,778   | A/B/C SPLIT                   |
| `src/app/components/atmosphere/`  | (in components/app/DashboardAtmosphere.tsx + theme.css) | — | B — `@platform/atmosphere` |
| `src/app/components/maps/`        | 46    | 8,558   | B — `@platform/map-engine`     |
| `src/app/components/landing/`     | 31    | 8,754   | C — BD landing identity       |
| `src/app/components/dashboard/`   | 15    | 3,280   | C — BD dashboard surface      |
| `src/app/components/reports/`     | 7     | 2,059   | C — BD damage report wizard   |
| `src/app/components/insurer/`     | 20    | 4,601   | C — BD insurer flow           |
| `src/app/components/shop/`        | 74    | 17,302  | C — BD shop directory         |
| `src/app/components/codelayer/`   | 45    | 9,421   | C — BD code/wizard layer      |
| `src/app/components/admin/`       | 18    | 2,726   | C — BD admin                  |
| `src/app/components/auth/`        | 5     | 753     | C — BD auth wrappers          |
| `src/app/components/dev/`         | 4     | 628     | D — dev/demo                  |
| `src/app/hooks/`                  | 71    | 9,965   | A/C SPLIT                     |
| `src/app/features/`               | 17    | 2,072   | C — orchestration             |
| `src/app/services/`               | 97    | 16,950  | A/B/C SPLIT                   |
| `src/app/utils/`                  | 20    | 1,977   | A/C SPLIT                     |
| `src/app/routers/`                | 5     | 1,222   | C — BD dispatch               |
| `src/app/theme/`                  | 1     | 51      | A — globalSurfaceTheme        |
| `src/app/types/`                  | 5     | 779     | A/C SPLIT                     |
| **Total**                         | **542** | **~99,000** |                          |

(Plus `src/styles/theme.css` 4,913 lines + `animations.css` 553
lines + supabase functions/migrations.)

---

## §4 — Pure-capability subsystems (clean extraction targets)

### §4.1 `components/ui/` (53 files / 4,771 LOC) — Tier A direct port

| Axis                  | Classification |
| --------------------- | -------------- |
| Type-shape            | CAPABILITY (Pass 275 §6.1: zero DamageReport refs) |
| Token / class         | CAPABILITY (Pass 276 §5.1: only NotificationToast has `bd-*`) |
| Behavioral authority   | CAPABILITY (own internal state: shadcn UI primitives) |
| Provider topology     | CAPABILITY (6 shadcn contexts — Pass 278 §4.2)       |
| Runtime continuity     | CAPABILITY (no localStorage / channels / routes)     |
| Emotional infrastructure | CAPABILITY (no atmospheric / motion personality)   |

**6/6 axes = pure capability.** Direct port to `@platform-core/ui/`.

### §4.2 `services/storage/` (4 files) — Tier A textbook adapter

Pass 273 §3.4 + Pass 278 §6.1 confirmed. Direct port to
`@platform-core/storage/` + `@platform-core/storage-supabase/`.

### §4.3 `src/app/theme/` (1 file / 51 LOC) — Tier A globalSurfaceTheme

Generic theme registry pattern. Not BD-coupled in shape.

### §4.4 `services/supabase/` plumbing subset (~10 files)

Per Pass 273 §3.5 split: `client.ts`, `runtime.ts`, `edgeFunctions.ts`,
`adapters.ts`, `authSession.ts`, `clerkEdgeData.ts`, `admin.ts`,
`adminIntake.ts`, `adminSanitizers.ts` — generic Supabase plumbing.
The Clerk-edge auth pattern is per-Pass 269 §5.2 platform-core
candidate.

### §4.5 Pure-capability aggregate

~5,000 LOC of pure-capability subsystems already self-classified
through file organization. **These don't require pre-extraction
prep beyond renaming**.

---

## §5 — Pure-identity subsystems (clean Tier C app-private)

| Subsystem                            | LOC     | Identity contents                                       |
| ------------------------------------ | ------- | ------------------------------------------------------- |
| `components/landing/`                | 8,754   | BD landing sections (HeroSection, BenefitsSection, etc.) |
| `components/dashboard/`              | 3,280   | BD dashboard widgets (CustomerMapWidget, etc.)          |
| `components/reports/`                | 2,059   | BD damage report flow                                    |
| `components/insurer/`                | 4,601   | BD insurer claim flow                                    |
| `components/shop/`                   | 17,302  | BD shop directory + bidding                             |
| `components/codelayer/`              | 9,421   | BD report wizard + bid card + account flows             |
| `components/admin/`                  | 2,726   | BD admin operations                                      |
| `components/auth/`                   | 753     | BD-specific auth components (ClerkAccountTypeSelector)  |
| `components/dev/`                    | 628     | Dev/demo apps (Tier D)                                   |
| `services/intelligence/` (subset)    | ~3,000  | BD intelligence/marketplace logic                        |
| `services/supabase/` (subset)        | ~5,000  | BD entity CRUD (bids, reports, vehicles, etc.)          |
| `routers/`                           | 1,222   | BD route dispatch                                        |
| `features/notifications/` (registry) | (subset of 264) | BD category/deep-link union                     |

### §5.1 Pure-identity aggregate

~58,000 LOC of pure-identity Tier C BD-domain subsystems. Pass
270 §6.2 already classified these; Pass 279 confirms via 6-axis
check.

These don't extract. They stay in the BD app.

---

## §6 — Split subsystems (capability + identity coexist)

These are the subsystems where pre-extraction prep work matters.

### §6.1 `components/app/` shell (8 files / 1,778 LOC) — Pass 277 detail

| File                       | Capability portion                         | Identity portion                              |
| -------------------------- | ------------------------------------------ | --------------------------------------------- |
| AppShell.tsx (104)         | useHashPage routing primitive              | `insurer-partnership` page name (1 of 4 hardcoded values) |
| AppLoading.tsx (90)        | boot/loading state pattern                 | none                                           |
| BrandLogo.tsx (74)         | colors+tone+size shape                     | "Bid"/"On"/"Dent" + Car icon + hardcoded hex   |
| DashboardLayout.tsx (225)  | composition pattern + delegation           | 27-prop signature embedding 8 BD entity types  |
| DashboardSidebar.tsx (323) | sidebar composition                        | BD nav payload                                 |
| DashboardHeader.tsx (551)  | search + notification panel state primitives | "reports" microcopy + BD profile semantics   |
| LandingPageLayout.tsx (227)| section-composition pattern                | 10 BD landing-section component imports        |
| DashboardAtmosphere.tsx (184)| pure-render single-prop slot pattern    | 184 lines hardcoded BD palette + Jeffrey atmosphere canon |

**Pre-extraction prep (Pass 277 §9):** generic-parameterize 4
shell components over `<TItems, TViewMode, TRole>` + microcopy
slot for search placeholder.

**Aggregate axis split:** ~500 LOC capability shape + ~1,278 LOC
identity payload. Capability extracts; identity stays as BD app
implementation OR `@platform/atmosphere` Tier B module.

### §6.2 `src/app/types/` (5 files / 779 LOC) — Pass 275 detail

| File                       | Capability symbols                | Identity symbols                                 |
| -------------------------- | --------------------------------- | ------------------------------------------------ |
| index.ts (~115)            | UserInfo, NavTab (shape), RedirectInfo | DamageReport, Bid, Vehicle, Notification, Activity, ActivityEvent, JobAssignment, UserData, ShopOnboardingFormData, InsurerOnboardingFormData, LoginView, ViewMode (values) |
| navigation.ts (~120)       | NavigationCoordinate, NavigationAddressResult, NavigationRouteStep, NavigationRoutePreview | ExternalNavigationSession (BD session shape) |
| mapDomain.ts (~330)        | NavigationDestination, MapTheme, Place, RouteOption, ShopSortOption | (mostly platform-shape; review per pass) |
| networkProfiles.ts (~60)   | (most generic shapes)             | InsurerBusinessProfile, ShopBusinessProfile (BD biz domain) |
| dashboardShell.ts (~25)    | (none — full identity)            | ProfileDropdownData, UserProfile (BD shell coupling) |

**Pre-extraction prep (Pass 275 §8):** types/index.ts split into
platform/platform-shape/domain/notifications sub-files; re-export
shim preserves 92 importers.

**Aggregate axis split:** ~400 LOC capability + ~379 LOC identity.

### §6.3 `src/styles/theme.css` (4,913 LOC) — Pass 276 detail

| Surface                | Capability portion                                    | Identity portion                                         |
| ---------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| `--bd-*` tokens (199)  | ~23 platform-grade-shape (`--bd-glass-*`, `--bd-glow-*`, `--bd-radius-*`) | ~28 emotional / atmospheric (`--bd-warm-dark-amber-*`, `--bd-liquid-gold-*`, `--bd-flow-loop-*`, `--bd-route-blue-*`, `--bd-royal-blue-*`) + ~84 BD-domain (`--bd-dashboard-*`, `--bd-report-*`) + ~64 mixed |
| `.bd-*` classes (208)  | ~38 platform-shape (`.bd-glass-*`, `.bd-button-*`, `.bd-skip-link-*`) | ~42 emotional/map + ~125 BD-domain |
| inline rgba() (1,150)  | (none — all inline)                                    | 1,150 hardcoded color literals scattered through class definitions |
| reduced-motion blocks (10) | CAPABILITY — Pass 273 LAW already honored mechanically | (none)                                              |
| Two `:root` blocks     | CAPABILITY — deliberate cascade-order separation       | BD identity values inside                                |

**Pre-extraction prep (Pass 276 §8):** rgba() literal lift +
Strategy A vs B decision + Tier 1 reference layer + class
namespace migration.

**Aggregate axis split:** ~38+23 = 61 platform-shape surfaces +
~42+28+125+84 = 279 BD/emotional surfaces + 1,150 inline literals.

### §6.4 `features/notifications/` (4 files / 264 LOC) — Pass 273 §2.2

| Surface                          | Capability portion                                | Identity portion                                |
| -------------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| NotificationContext.ts (12)      | createContext + useNotifications hook machinery   | (none — generic)                                |
| notificationEventTypes.ts (80)   | NotificationEvent / NotificationToast / NotificationDeepLink generic shapes | NotificationCategory union (8 BD values), NotificationDeepLink targets (7 BD screens) |
| useNotificationEvents.ts (150)   | event-handling logic                              | (mostly capability)                              |
| index.ts (22)                    | re-exports                                         | (none)                                          |

**Pre-extraction prep:** type-parameterize over `<TCategory,
TDeepLink>` per Pass 275 §4.2.

### §6.5 `services/auth/` (10 files / part of services 16,950) — Pass 269 §5

Pass 273 §4.5 + Pass 278 §5: thin-wrapper retrofit.

| Surface                       | Capability portion        | Identity portion                              |
| ----------------------------- | ------------------------- | --------------------------------------------- |
| websiteIdentity.ts (50+)      | session/memory pattern     | `bidondent_website_session`, `bidondent_website_memory` storage prefixes |
| websiteIdentitySanitizers.ts  | sanitization utilities     | (BD-domain sanitization)                      |
| websitePreferencesSync.ts     | preference sync pattern    | (BD preference shape)                         |
| websiteRelationshipsSync.ts   | relationship sync pattern  | (BD relationship shape)                       |
| (proposed: useAuth.tsx wrapper)| Clerk thin-wrapper       | Clerk vendor binding                          |

**Pre-extraction prep (Pass 278 §10 step 3-5):** inflate
`hooks/useAuth.tsx` as canonical wrapper; redirect 5 direct
useUser() callsites; `<SignInButton>` strategy decision.

### §6.6 `services/navigation/` (~15 files / part of services 16,950)

Per Pass 274 §3.2 + Pass 274 §5:

| Surface                                | Capability portion          | Identity portion                          |
| -------------------------------------- | --------------------------- | ----------------------------------------- |
| navigationSession.ts                   | session structure           | `bidondent_navigation_session` key        |
| navigationPreferences.ts               | preference persistence      | `bidondent_navigation_preferences` key    |
| navigationSessionCloudService.ts       | sync pattern                | `bidondent_nav_session_*` dynamic keys (22 nav-session-keys runtime entropy) |
| parkedCarLocation.ts                   | persistence pattern         | `bidondent_navigation_parked_car`         |
| savedLocations.ts                      | persistence pattern         | `bidondent_navigation_saved_locations`    |
| navigationDestinationAdapters.ts       | source-to-unified pattern   | (mostly capability)                       |
| externalNavigation.ts                  | provider-options pattern    | (capability)                              |

**Pre-extraction prep:** Pass 274 §3.4 + Pass 278 §12.2 — namespace
parameterization + LRU policy wrapper.

### §6.7 `services/realtime/` (3 files / part of services 16,950) — Pass 274 §4

| Surface                                | Capability portion                  | Identity portion                            |
| -------------------------------------- | ----------------------------------- | ------------------------------------------- |
| RealtimeBidService.ts (~200)           | subscribe/filter/handler pattern    | "all-bids-global", "report-bids-${reportId}", table:"bids" |
| RealtimeEstimateService.ts             | subscribe/filter/handler pattern    | "new-estimate-requests", "estimate-request-updates", table:"estimate_requests" |
| RealtimeReportService.ts               | subscribe/filter/handler pattern    | "new-damage-reports", "damage-report-updates", table:"damage_reports" |

**Pre-extraction prep:** Pass 274 §4.4 + Pass 278 §12.1 — central
RealtimeSubscriptionProvider candidate.

### §6.8 `src/app/hooks/` (71 files / 9,965 LOC)

Per Pass 275 §6.2 + Pass 278 §5:

| Capability hooks (Tier A platform candidates) | Identity hooks (Tier C BD-domain) |
| --------------------------------------------- | --------------------------------- |
| useNavigation (23 importers)                  | useUserData (6 importers)         |
| useAppearanceMode (23 importers)              | useAuth (2 importers)             |
| useUserGeolocation                            | useMarketStatus, useCustomerReportStatusNotifications, useShopDirectoryActions, useAppHandlers, userDataActions, userDataUtils, useCustomerBidNotifications, useMarketplaceReports, userDataValidation, useReportLayerData, useUserDataCloudSync, useUserDataLoader (13 hooks importing DamageReport per Pass 275 §6.2) |
| (UI-state hooks like useReducedMotion if present) | useCoveragePartnerShops, etc. |

**Pre-extraction prep:** Pass 275 §8 step 1 (role-token unification)
+ step 2 (types split) before extracting useUser/useNavigation.

### §6.9 `components/maps/` (46 files / 8,558 LOC) — Tier B

Map module (`@platform/map-engine` + `@platform/persistent-map-session`
candidates). Mixed: engine machinery is capability; specific
BD-domain map widgets (CoverageBrowseMapDialog etc.) are identity.

Out of scope for Pass 279 detailed mapping — Pass 277 §7.4 noted
the map-state divergence + MapSessionProvider inert-seam status.
A future map-module-specific inventory would deepen this.

---

## §7 — Aggregate ratio across the codebase

### §7.1 LOC distribution by tier

| Tier                  | LOC      | %     |
| --------------------- | -------- | ----- |
| Tier C BD-domain (pure-identity)            | ~58,000 | ~58% |
| Tier B map module                            | ~8,500  | ~9%  |
| Tier A pure-capability                       | ~5,000  | ~5%  |
| Mixed-tier band (split subsystems)           | ~28,000 | ~28% |
| **Total**                                    | ~99,500 | 100% |

### §7.2 Mixed-tier capability-vs-identity portions

Within the ~28,000 LOC mixed band, the rough split:

| Mixed-tier capability portion | ~17,000 LOC (~60%) |
| Mixed-tier identity portion   | ~11,000 LOC (~40%) |

### §7.3 Aggregate platform-extractable surface

Combining pure-capability + mixed-tier capability portion +
Tier B platform-grade machinery:

| Class                                | LOC      | %     |
| ------------------------------------ | -------- | ----- |
| Direct platform-extractable          | ~5,000  | ~5%  |
| Split-extractable after prep         | ~17,000 | ~17% |
| Tier B optional-module machinery     | ~6,000  | ~6%  |
| **Subtotal extractable**             | **~28,000** | **~28%** |
| Tier C BD-domain (stays in BD app)   | ~58,000 | ~58% |
| Tier B map BD-coupled widgets        | ~2,500  | ~3%  |
| Mixed-tier identity portion          | ~11,000 | ~11% |
| **Subtotal stays-in-BD**             | **~71,500** | **~72%** |

**Roughly 28% of the codebase is platform-extractable** — but
~17% requires pre-extraction prep work to separate capability
from identity within mixed-tier subsystems.

The 5% pure-capability is the easiest first target. The 6%
Tier B optional-module machinery (map engine) is the second
target. The 17% split-extractable surface is where Passes
274-278 pre-extraction prep recommendations apply.

---

## §8 — Three integration findings

### §8.1 Finding 1: the mixed-tier band IS the extraction work

Pure-capability subsystems already self-classified through file
organization — they extract by rename. Pure-identity subsystems
stay in the BD app — no work needed. **The actual
extraction-readiness work is concentrated in the ~28,000-line
mixed-tier band (~28% of codebase).**

Pre-extraction prep priority order (lowest blast → highest):

1. **theme/ + ui/** (clean port; ~5K LOC; rename only)
2. **services/storage/** (already-shaped adapter; rename only)
3. **types/** (split barrel; Pass 275 §8 step 2)
4. **services/realtime/** + **services/navigation/** (registry pattern; Pass 274 §3.4 + §4.4)
5. **services/auth/** (Clerk thin-wrapper; Pass 278 §10 step 3-5)
6. **features/notifications/** (type-parameterize; Pass 273 §2.2)
7. **components/app/** shell (4-component prop generic-parameterization; Pass 277 §9)
8. **theme.css** (rgba lift + Strategy A/B + class migration; Pass 276 §8)

### §8.2 Finding 2: capability/identity boundaries operate at TWO granularities

| Subsystem                | Boundary granularity | Implication                         |
| ------------------------ | -------------------- | ----------------------------------- |
| services/, hooks/, components/ | FILE-level     | Move files; 1-step extraction       |
| types/index.ts, theme.css | SYMBOL-level         | Split files first; 2-step extraction |
| features/notifications/  | TYPE-PARAMETER-level | Generic-parameterize; 3-step extraction |
| components/app/ shell    | PROP-SIGNATURE-level | Generic-parameterize 4 components   |

**Different subsystems require different extraction strategies.**
A single "rename + move" approach won't work for theme.css or
types/index.ts. The pre-extraction prep recommendations across
Pass 274-278 already encode the right granularity per subsystem.

### §8.3 Finding 3: the 6 axes confirm Pass 271 + 273 framework integrity

The 6 classification axes Pass 279 uses map cleanly to Pass 271
6-category contamination model + Pass 273 6-seam taxonomy:

| Pass 279 axis            | Pass 271 contamination category | Pass 273 seam type |
| ------------------------ | ------------------------------- | ------------------ |
| Type-shape coupling       | #1 type-import coupling          | (no direct match) |
| Token / class consumption | #3 identity coupling (naming) + #2 atmospheric color | token seam |
| Behavioral authority      | (cross-cutting)                 | slot seam + config seam |
| Provider topology         | (cross-cutting)                 | adapter seam      |
| Runtime continuity        | (cross-cutting)                 | namespace seam    |
| Emotional infrastructure  | #2 atmospheric coupling          | emotional seam    |

**The 6 axes are not new categories — they are the ALREADY-VALIDATED
framework re-organized into a synthesis lens.** Pass 279 uses
the framework as integration tool; doesn't extend it.

---

## §9 — Sequencing implications

### §9.1 Per-subsystem extraction order (refines Pass 268 §6 + Pass 270 §6.2)

The mixed-tier band's pre-extraction prep work has a natural
ordering:

```
Phase 0 — pure-capability ports (no prep):
  components/ui/         direct port to @platform-core/ui/
  src/app/theme/         direct port (51 lines)
  services/storage/      direct port to @platform-core/storage/

Phase 1 — symbol-level splits (require source edits):
  types/index.ts         split into platform/platform-shape/domain/notifications
  theme.css §1           lift top-N rgba() into reference tokens

Phase 2 — type-parameter generics (require source edits):
  features/notifications/  parameterize over <TCategory, TDeepLink>
  components/app/ shell    parameterize 4 components over <TItems, TViewMode, TRole>

Phase 3 — vendor wrappers (require source edits + decision):
  services/auth/           inflate useAuth.tsx; redirect 5 useUser() sites
  
Phase 4 — provider authority (require source edits + new providers):
  services/realtime/       optional RealtimeSubscriptionProvider
  services/navigation/     optional PersistenceProvider w/ LRU
  
Phase 5 — class namespace (high blast radius):
  theme.css §2             class-namespace migration (398 TSX + 208 CSS)

Phase 6 — file moves:
  All extracted subsystems migrate to platform-core packages
```

Each phase requires its own owner authorization. Phases 0-2 are
mechanical and can run in parallel. Phases 3-5 are owner
decisions. Phase 6 is the actual extraction.

### §9.2 Identity preservation as first-class concern

Per relay #5 + #7: "successful extraction that accidentally
destroys emotional continuity" is the new dominant risk class.

The capability-vs-identity matrix supports identity preservation by:
- Locating identity surfaces (concentrated, bounded)
- Distinguishing emotional infrastructure from cosmetic styling
- Preserving Pass 271 emotional architecture across extraction
- Confirming `@platform/atmosphere` candidate (Pass 271 §3.2 +
  Pass 276 §3.2) bounded to ~28 tokens + ~42 classes + 184-line
  DashboardAtmosphere component

Identity preservation is mechanically tractable because identity
is concentrated (BrandLogo 74 + DashboardAtmosphere 184 + theme.css
emotional family + features/notifications value layer + auth
vendor binding + intelligence/directory + BD CRUD). The
capability-vs-identity boundary at every subsystem is a **preservation
checkpoint**, not just a categorization.

---

## §10 — Cleanliness wins (per relay #4 + #8)

1. **Pure-capability subsystems already self-classified** through file organization (~5K LOC clean port).
2. **Pure-identity subsystems already self-classified** as Tier C (~58K LOC stays in BD app).
3. **Mixed-tier band is bounded to ~28K LOC** (~28% of codebase). The architectural cleanliness is high.
4. **Within mixed-tier, ~60% capability portion + ~40% identity portion** — capability dominates, simplifying extraction.
5. **Six classification axes map cleanly to Pass 271 + 273 framework** — no new doctrine needed.
6. **Identity surfaces are concentrated, not diffuse** — BrandLogo (74), DashboardAtmosphere (184), 28 emotional tokens, 42 emotional classes, NotificationContext value (8+7 unions), Clerk binding (6 sites), intelligence/directory (~3K). Total identity-bearing-but-not-pure-Tier-C: ~5,000 LOC across ~10 concentrated locations.
7. **Adapter pattern is already-in-use across 3 domains** (Pass 278 §6.4) — extraction extends existing pattern.
8. **77% of provider/adapter surfaces are capability-bearing** (Pass 278 §8.4) — provider topology is already platform-shape.
9. **The repo exhibits "organic platform convergence"** (relay #9) — capability-bearing surfaces dominate at every layer.

---

## §11 — What this pass DOES NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS, or CLAUDE.md.
- Does NOT bootstrap any repo / extract any subsystem / create any package.
- Does NOT split types/index.ts / refactor any file / introduce any new doctrine.
- Does NOT add new owner-decision points (cumulative remains 31).
- Does NOT re-open convergence-discovery lane — every finding fits Pass 271 6-category model + Pass 273 6-seam taxonomy as stable doctrine.
- Does NOT supersede prior platform docs; consolidates them.
- Does NOT validate or duplicate runtime-audit lane findings; cross-references only.

---

## §12 — What's deferred

Per relay #11 priority order, Pass 279 ships only Priority D. One remaining inventory:

- **E. Emotional-token inventory** — would deepen Pass 276 §3.2 + §4.2 emotional-tier work + Pass 277 §4.8 DashboardAtmosphere mapping
- **Subsystem boundary inventory** — Pass 279 §3 partially anticipates with subsystem-folder LOC table; full per-file classification deferred

Each is its own future pass if/when authorized.

---

## §13 — Cross-references

- Pass 278 [`REF_PROVIDER_ADAPTER_MATRIX_2026-05-09.md`](REF_PROVIDER_ADAPTER_MATRIX_2026-05-09.md) — provider topology axis foundation; Pass 279 §6 + §7 builds on §8 capability-vs-identity classification.
- Pass 277 [`REF_SHELL_SLOT_CONTRACT_MAP_2026-05-09.md`](REF_SHELL_SLOT_CONTRACT_MAP_2026-05-09.md) — behavioral authority axis foundation; Pass 279 §6.1 incorporates per-component classification.
- Pass 276 [`REF_TOKEN_OWNERSHIP_MAP_2026-05-09.md`](REF_TOKEN_OWNERSHIP_MAP_2026-05-09.md) — token / class axis foundation; Pass 279 §6.3 incorporates tier breakdown.
- Pass 275 [`REF_TYPE_IMPORT_DEPENDENCY_GRAPH_2026-05-09.md`](REF_TYPE_IMPORT_DEPENDENCY_GRAPH_2026-05-09.md) — type-shape axis foundation; Pass 279 §6.2 incorporates per-symbol classification.
- Pass 274 [`REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md`](REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md) — runtime continuity axis foundation; Pass 279 §6.6 + §6.7 incorporates persistence + realtime mapping.
- Pass 273 [`PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md`](PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md) — 6-seam taxonomy; Pass 279 §8.3 confirms axis-to-seam mapping.
- Pass 271 [`PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md`](PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md) — 6-category contamination model; Pass 279 §8.3 confirms axis-to-category mapping.
- Pass 270 [`PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md`](PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md) — 16-subsystem MVP nucleus; Pass 279 confirms tier classification mechanically.
- Owner relay 2026-05-09 #10 priority D + parallel runtime-audit lane findings.

---

## §14 — Status

- **Drafted:** 2026-05-09 (Pass 279, Capability-vs-Identity Matrix lane).
- **Status:** ACTIVE reference. Synthesis of inventory data — current truth as of 2026-05-09 commit.
- **Authority:** REF. Subordinate to all current LAW docs.
- **Owner approval required:** FALSE for this doc itself. TRUE for any of the §9.1 phased pre-extraction prep tasks (each phase has its own owner authorization gate).
- **Supersedes:** none.
- **Superseded by:** none.
- **Refines (does not supersede):** Pass 270 §6.2 16-subsystem MVP nucleus by adding LOC + 6-axis classification per subsystem.

**Forward triggers (any one re-opens an inventory or prep pass):**

1. Owner authorizes the remaining Priority E (emotional-token inventory) or subsystem-boundary deep dive.
2. Owner ratifies any of the §9.1 phased pre-extraction prep tasks → corresponding source-edit work begins.
3. Owner ratifies any of the 31 cumulative decision points → relevant draft platform-LAW / extraction plan becomes authorable.
4. Real runtime defect surfaces (independent lane).
5. Owner provides Stacey answers (Pass 268 §8).

Until one fires: dormant.

The execution-readiness lane is now populated with three
registries (Pass 274), three dependency graphs (Pass 275 type +
Pass 276 token + Pass 278 provider), one behavioral slot map
(Pass 277), and one synthesis matrix (Pass 279). The capability-vs-identity
distinction is now mechanically measurable across all 6 axes
the framework predicts. The architectural cleanliness predicted
by Pass 271 + 273 + 277 + 278 holds at the synthesis layer.

The most actionable extraction-risk reduction surfaced: §9.1
Phase 0 (pure-capability ports — direct port of ui/, theme/,
storage/ adapter; ~5K LOC; lowest blast). The most consequential
strategic insight: 28% of the codebase is platform-extractable;
~17% requires pre-extraction prep before extraction; ~5% is
direct-port ready today.

The repo's organic platform convergence is the headline of Pass
279: the architecture has matured toward platform-grade shape
at every measured axis. The framework predicted it; the inventory
data confirmed it; the synthesis matrix quantifies it.
