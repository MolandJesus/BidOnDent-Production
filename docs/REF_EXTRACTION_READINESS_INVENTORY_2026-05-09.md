---
status: ACTIVE
authority: REF
scope: extraction-readiness-mechanical-inventories
canonical_source_of_truth: REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 274 mechanical inventories under owner relay 2026-05-09 post-convergence transition (discovery CLOSED, execution-readiness OPEN). Four registries: vendor-binding sites (Sentry / Supabase / Clerk / MapLibre — 16 total direct-import locations), storage-key registry (~30 distinct localStorage keys across FOUR namespacing conventions: `bidondent.*` dot, `bidondent_*` underscore, `bd-*`/`bd:*` short, and 3 UN-NAMESPACED keys), realtime channel registry (8 fixed channel names + 1 dynamic, 3 Postgres tables), route-taxonomy registry (12 viewMode values + 7 currentTab values + 3 account types). Three execution-sequencing risks surfaced: (1) storage-key namespace inconsistency NOT captured by Pass 273's "uniform `bidondent.*` namespace" claim — multi-tenant reality requires migration script not just provider injection; (2) Clerk leakage is 6 sites, not "30+" as Pass 273 §4.5 estimated — thin-wrapper retrofit is small; (3) Supabase coupling splits cleanly between client init (1 site) + RealtimeChannel TYPE imports (4 sites) — type-only imports are zero-cost at adapter boundary. Framework HOLDS — every finding fits Pass 271 6-category model. NO new contamination categories. NO new owner-decision points. Doc-only.
last_updated: 2026-05-09
---

# Pass 274 — Extraction-Readiness Mechanical Inventories

> **Tier:** REF. Current truth about the codebase's
> extraction-relevant facts.
> **Authority:** Owner relay 2026-05-09 post-convergence transition.
> Discovery lane CLOSED at Pass 273. Execution-readiness lane OPEN
> under unchanged framework + governance constraints.
>
> **What this doc is:** four mechanical inventories the future
> extraction will require. Vendor bindings, storage keys, realtime
> channels, route taxonomy. Each entry is `path:line` so it can be
> verified mechanically.
>
> **What this doc is NOT:**
> - LAW. Inventory data, not doctrine.
> - A re-test of convergence. Pass 273 closed that lane; Pass 274
>   uses the framework as stable doctrine.
> - An extraction plan. Inventories are inputs, not authority.
> - Exhaustive. Four highest-leverage registries; six other
>   inventory types from relay #2 are explicitly deferred.
> - A new decision-point generator. Pass 274 adds zero owner
>   decisions to the cumulative 31.

---

## §1 — Mission

Per relay 2026-05-09 directive #2:

> "Begin extraction-readiness mapping WITHOUT extracting. No
> package creation, no repo bootstrap, no namespace rewrites, no
> source relocation. But begin preparing the execution-grade
> inventories that future extraction would require. The purpose
> is: reduce future extraction uncertainty before any extraction
> authority exists."

Pass 274 selects four highest-leverage registries from the relay's
11-item target list:

1. **Vendor-binding registry** — direct-import sites for SDKs
   (Sentry, Supabase, Clerk, MapLibre). Locates exactly where
   adapter seams will need to slot in.
2. **Storage-key registry** — every persistence namespace point.
   Surfaces multi-app collision risk for the namespace-seam category.
3. **Realtime channel registry** — every channel subscription.
   Sizes the realtime-extraction surface.
4. **Route-taxonomy registry** — `useNavigation` whitelist + every
   reference site. Sizes the config-seam surface.

Deferred to future passes (each its own pass if/when authorized):
- Capability-vs-identity formalization (analytical, not mechanical)
- Emotional-token inventory (deserves dedicated motion-canon pass)
- Token ownership map (theme.css is 4,913 lines — own pass)
- Subsystem boundary inventories (overlap with Pass 270 §6.2)
- Provider/adapter matrices (partial overlap with §2 below)
- Shell-slot contract mapping (qualitative, not mechanical)

---

## §2 — Vendor-binding registry

Direct imports of vendor SDKs. Each `path:line` is a site that the
adapter-seam extraction would either (a) replace with a
platform-core abstraction interface or (b) move into a vendor-binding
sub-package.

### §2.1 Sentry (`@sentry/react`)

| Site                                 | Line | Use                                       |
| ------------------------------------ | ---- | ----------------------------------------- |
| `src/app/services/errorReporting.ts` | 6    | `import * as Sentry from "@sentry/react"` |
| `src/app/services/sentryInit.ts`     | 13   | `import * as Sentry from "@sentry/react"` |

**Total:** 2 sites.

**Extraction shape:** already-isolated. Pass 273 §3.2 confirmed
the public API (`captureException`, `captureMessage`,
`ErrorContext`) is generic. Pattern:

- `@platform-core/error-reporting/` — generic API, no SDK import
- `@platform-core/error-reporting-sentry/` — these 2 files

**Sequencing risk:** none. Smallest vendor surface in the repo.

---

### §2.2 Supabase (`@supabase/supabase-js`)

| Site                                                   | Line | Use                                                |
| ------------------------------------------------------ | ---- | -------------------------------------------------- |
| `src/app/services/supabase/client.ts`                  | 1    | `createClient`, `SupabaseClient` (runtime)         |
| `src/app/services/realtime/RealtimeBidService.ts`      | 28   | `RealtimeChannel` (type-only)                      |
| `src/app/services/realtime/RealtimeEstimateService.ts` | 9    | `RealtimeChannel` (type-only)                      |
| `src/app/services/realtime/RealtimeReportService.ts`   | 22   | `RealtimeChannel` (type-only)                      |
| `src/app/services/supabase/shopAvailability.ts`        | 31   | `RealtimeChannel` (type-only)                      |

**Total:** 5 sites — 1 runtime + 4 type-only.

**Extraction shape:**
- Runtime site (`client.ts`) → vendor-binding sub-package
- Type-only sites can re-export `RealtimeChannel` through a
  platform-core type alias OR remain as direct type imports
  (type imports are zero-cost at the bundle level)

**Sequencing risk:** LOW. The 4 type-only imports are not
extraction blockers — they erase at compile time.

**Open question:** does the platform-core realtime abstraction
expose `RealtimeChannel` as its own type, or pass through the
Supabase type? Decision deferred to extraction time.

---

### §2.3 Clerk (`@clerk/clerk-react`)

| Site                                                              | Line | Use                                                                   |
| ----------------------------------------------------------------- | ---- | --------------------------------------------------------------------- |
| `src/app/App.tsx`                                                 | 1    | `ClerkProvider`, `useUser`, `useClerk`, `useAuth as useClerkAuth`     |
| `src/app/components/admin/AdminIntakeOperationsPanel.tsx`         | 2    | `useAuth as useClerkAuth`                                             |
| `src/app/components/auth/ClerkAccountTypeSelector.tsx`            | 2    | `useUser`                                                             |
| `src/app/components/landing/CTASection.tsx`                       | 2    | `SignUpButton`, `useUser`                                             |
| `src/app/components/landing/LandingPageHeader.tsx`                | 2    | `SignInButton`, `SignUpButton`, `useClerk`, `useUser`                 |
| `src/app/hooks/useAuth.tsx`                                       | 8    | `useUser`, `useClerk`                                                 |

**Total:** 6 sites.

**Correction to prior estimate:** Pass 273 §4.5 said "Clerk imports
ARE scattered (~30+ files import directly from `@clerk/clerk-react`)."
**Actual count: 6.** The framework finding still holds (Clerk is
scattered beyond `services/auth/`), but the magnitude is much
smaller than the rough estimate. The thin-wrapper retrofit
(Pass 269 §5) is 4-6 file edits, not 30+.

**Extraction shape:**
- `App.tsx` — keep `ClerkProvider` as the binding-specific
  provider. Platform-core supplies a generic `<AuthProvider>`
  abstraction; Stacey app instantiates with `<ClerkAuthProvider>`,
  Stacey-without-Clerk app instantiates with another binding.
- `useAuth.tsx` — already a wrapper file. Inflate to be the
  canonical wrapper; redirect the 4 component-level direct imports
  to use it.
- `<SignInButton>` / `<SignUpButton>` (used in CTASection +
  LandingPageHeader) — these are Clerk-specific UI components.
  Either (a) wrap them in app-private components, or (b) the
  landing page is fundamentally Clerk-bound (since BD's landing
  flows through Clerk-hosted sign-in screens) and stays in Tier C
  app-private. Decision deferred.

**Sequencing risk:** LOW. The 6-site retrofit is small. If
`<SignInButton>` is treated as Tier C, only 4 sites need
wrapping.

---

### §2.4 MapLibre (`maplibre-gl`)

| Site                                          | Line | Use                          |
| --------------------------------------------- | ---- | ---------------------------- |
| `src/app/components/maps/engine/MapEngineCanvas.tsx` | 34   | `StyleSpecification` (type)  |
| `src/app/components/maps/mapLibreStyles.ts`   | 1    | `StyleSpecification` (type)  |
| `src/app/utils/maplibreResizePatch.ts`        | 20   | `maplibregl` (runtime)       |

**Total:** 3 sites — 1 runtime + 2 type-only.

**Extraction shape:** the map engine is its own optional Tier B
module per Pass 270 §6.2 (`@platform/map-engine`). MapLibre
binding stays inside that module. The `maplibreResizePatch.ts`
file is the only place MapLibre is imported for runtime use; the
two type imports erase at compile time.

**Sequencing risk:** none. MapLibre is already architecturally
isolated to the map module.

**Note:** `__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__` window global
set at `maplibreResizePatch.ts:98` is the Pass 270 / 273
identity-coupling site. See §3.2.

---

### §2.5 Vendor-binding summary table

| Vendor    | Sites | Runtime | Type-only | Shape                           |
| --------- | ----- | ------- | --------- | ------------------------------- |
| Sentry    | 2     | 2       | 0         | Already isolated; clean port    |
| Supabase  | 5     | 1       | 4         | Client init + 4 type imports    |
| Clerk     | 6     | 6       | 0         | 6-site thin-wrapper retrofit    |
| MapLibre  | 3     | 1       | 2         | Inside Tier B map module        |
| **Total** | **16**| **10**  | **6**     | All fit adapter-seam pattern    |

**Convergence note:** all 4 vendors have a small, bounded
direct-import surface. None require deep refactoring. The
adapter-seam category is mechanically tractable.

---

## §3 — Storage-key registry

**This is the registry with the most extraction-sequencing risk.**

### §3.1 Critical finding: namespace inconsistency

Pass 273 §3.7 stated:

> "every persistence point uses a hardcoded `bidondent.*` or
> `__bidondent*` namespace."

Pass 274 inventory disproves the uniformity claim. The codebase
uses **four** namespacing conventions:

| Convention                   | Count | Examples                                               |
| ---------------------------- | ----- | ------------------------------------------------------ |
| `bidondent.*` (dot)          | 4     | `bidondent.appearance-mode`, `bidondent.navigation.providerHealth.v1`, `bidondent.navigation.mapPerformance.v1`, `bidondent.dev.embedded-browser-banner.dismissed` |
| `bidondent_*` (underscore)   | ~22   | `bidondent_user`, `bidondent_navigation_state`, `bidondent_demo_user`, `bidondent_nav_session_*` (dynamic), `bidondent_website_session`, ...                       |
| `bd-*` / `bd:*` (short)      | 2     | `bd-user-geolocation`, `bd:map:legend:expanded`        |
| **UN-NAMESPACED**            | 3     | `coverageCurrentLocation`, `demo`, `mode`              |

**The 6-category contamination framework still holds** — every
finding fits Pass 271 #3 (identity coupling at namespace level).
But the EXECUTION model needs updating: there isn't ONE namespace
to swap; there are FOUR conventions to reconcile, plus 3
un-namespaced keys that would COLLIDE with any other app sharing
the browser origin.

This is exactly the kind of sub-finding within a stable
category that execution-readiness work surfaces. Pass 273
discovered "namespace seams exist." Pass 274 mechanically
quantifies what extraction has to do.

### §3.2 Full storage-key registry

#### `bidondent.*` (dot-namespaced) — 4 keys

| Key                                                  | Defined at                                              |
| ---------------------------------------------------- | ------------------------------------------------------- |
| `bidondent.appearance-mode`                          | `src/app/hooks/useAppearanceMode.ts:4`                  |
| `bidondent.navigation.mapPerformance.v1`             | `src/app/services/navigation/mapPerformance.ts:30`      |
| `bidondent.navigation.providerHealth.v1`             | `src/app/services/navigation/providerHealth.ts:29`      |
| `bidondent.dev.embedded-browser-banner.dismissed`    | `src/app/components/dev/EmbeddedBrowserBanner.tsx:26`   |

#### `bidondent_*` (underscore-namespaced) — ~22 keys

| Key                                       | Defined at                                                    |
| ----------------------------------------- | ------------------------------------------------------------- |
| `bidondent_user`                          | `src/app/constants/index.ts:60`                               |
| `bidondent_user_last_active`              | `src/app/constants/index.ts:61`                               |
| `bidondent_damage_report_draft`           | `src/app/constants/index.ts:62` + `reportDraftStorage.ts:19`  |
| `bidondent_keep_signed_in`                | `src/app/constants/index.ts:63`                               |
| `bidondent_navigation_state`              | `src/app/hooks/useNavigation.ts:5`                            |
| `bidondent_anon_nav_id`                   | `src/app/features/navigation/useNavigationSession.ts:26`      |
| `bidondent_navigation_session`            | `src/app/services/navigation/navigationSession.ts:4`          |
| `bidondent_navigation_preferences`        | `src/app/services/navigation/navigationPreferences.ts:4`      |
| `bidondent_navigation_discovery_role`     | `src/app/services/navigation/discoveryPreferences.ts:4`       |
| `bidondent_navigation_parked_car`         | `src/app/services/navigation/parkedCarLocation.ts:4`          |
| `bidondent_navigation_saved_locations`    | `src/app/services/navigation/savedLocations.ts:8`             |
| `bidondent_nav_session_*` (dynamic)       | `src/app/services/navigation/navigationSessionCloudService.ts:8` |
| `bidondent_nav_active_session_*` (dynamic)| `src/app/services/navigation/navigationSessionCloudService.ts:9` |
| `bidondent_nav_pending_writes`            | `src/app/services/navigation/navigationSessionCloudService.ts:11` |
| `bidondent_nav_cloud_unavailable`         | `src/app/services/navigation/navigationSessionCloudService.ts:12` |
| `bidondent_user:*` (dynamic, scoped)      | `src/app/utils/clearStaleNavSessions.ts:24`                   |
| `bidondent_demo_user`                     | `src/app/services/demoAuthService.ts:21`                      |
| `bidondent_demo_users`                    | `src/app/services/demoAuthService.ts:22`                      |
| `bidondent_demo_vehicles`                 | `src/app/services/demoDataServiceHelpers.ts:39`               |
| `bidondent_demo_reports`                  | `src/app/services/demoDataServiceHelpers.ts:40`               |
| `bidondent_demo_bids`                     | `src/app/services/demoDataServiceHelpers.ts:41`               |
| `bidondent_website_session` (prefix)      | `src/app/services/auth/websiteIdentity.ts:55`                 |
| `bidondent_website_memory` (prefix)       | `src/app/services/auth/websiteIdentity.ts:56`                 |
| `bidondent_coverage_state`                | `src/app/components/landing/coverageState.ts:12`              |

#### `bd-*` / `bd:*` (short prefix) — 2 keys

| Key                          | Defined at                                          |
| ---------------------------- | --------------------------------------------------- |
| `bd-user-geolocation`        | `src/app/hooks/useUserGeolocation.ts:17`            |
| `bd:map:legend:expanded`     | `src/app/components/shop/MapPaneLegendPanel.tsx:9`  |

#### UN-NAMESPACED — 3 keys (extraction hazard)

| Key                          | Defined at                                          | Risk                                  |
| ---------------------------- | --------------------------------------------------- | ------------------------------------- |
| `coverageCurrentLocation`    | `src/app/utils/clearStaleNavSessions.ts:25`         | Collides with any app on same origin  |
| `demo`                       | `src/app/utils/devDemoMode.ts:18`                   | Query-param key; less risky but still |
| `mode`                       | `src/app/utils/devDemoMode.ts:19`                   | Query-param key; less risky but still |

Note: `demo` and `mode` are query-string keys (not localStorage),
so the cross-app collision risk is per-URL not per-origin. Lower
severity than the localStorage `coverageCurrentLocation` case.

### §3.3 Window globals — 2 distinct namespaces

| Global                                   | Defined at                                        | Use                                  |
| ---------------------------------------- | ------------------------------------------------- | ------------------------------------ |
| `__bidondent_supabase__`                 | `src/app/services/supabase/client.ts:6,16,17,71`  | Supabase client singleton stash      |
| `__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__`  | `src/app/utils/maplibreResizePatch.ts:98` + `src/app/test-utils/mapTestHarness.ts:215,224` | Patch idempotency marker |

**Two conventions even here** — one lowercase, one uppercase.

### §3.4 Extraction sequencing risks (storage-key)

Three risks in priority order:

**RISK 1 — Un-namespaced keys (HIGH).** `coverageCurrentLocation`
will collide with any other app on the same origin.
Multi-tenant browser sessions break. Pre-extraction remediation:
rename to `bidondent_coverage_current_location` (matches the
underscore convention) or move into `bidondent_coverage_state`
JSON blob (already exists at `coverageState.ts:12`).

**RISK 2 — Convention drift (MEDIUM).** Three Bidondent prefixes
(`bidondent.`, `bidondent_`, `bd-`/`bd:`) reflect organic growth.
Extraction needs to pick ONE platform-core convention. Most
likely: `<namespace>:<scope>:<key>` (matches the existing
`bd:map:legend:expanded` pattern; clean scoping; works for
both static and dynamic keys). Apps inject `<namespace>` via
provider config.

**RISK 3 — Migration script needed (MEDIUM).** Renaming any
storage key invalidates user state on first load post-deploy.
Pre-extraction prep should include a migration script template
that reads old keys, writes new keys, deletes old. Per
`clearStaleNavSessions.ts`, this codebase already has a
storage-cleanup utility — a similar pattern can drive the
namespace migration.

---

## §4 — Realtime channel registry

### §4.1 Channel name inventory

| Channel name                          | Service file                                             | Line |
| ------------------------------------- | -------------------------------------------------------- | ---- |
| `report-bids-${reportId}` (dynamic)   | `src/app/services/realtime/RealtimeBidService.ts`        | 83   |
| `all-bids-global`                     | `src/app/services/realtime/RealtimeBidService.ts`        | 177  |
| `new-estimate-requests`               | `src/app/services/realtime/RealtimeEstimateService.ts`   | 33   |
| `estimate-request-updates`            | `src/app/services/realtime/RealtimeEstimateService.ts`   | 86   |
| `new-damage-reports`                  | `src/app/services/realtime/RealtimeReportService.ts`     | 77   |
| `damage-report-updates`               | `src/app/services/realtime/RealtimeReportService.ts`     | 149  |
| `shop-availability-global`            | `src/app/services/supabase/shopAvailability.ts`          | 170  |
| `map-report-layer-changes`            | `src/app/hooks/useReportLayerData.ts`                    | 87   |
| `map-report-bid-updates`              | `src/app/hooks/useReportLayerData.ts`                    | 120  |

**Total:** 9 channel names (8 fixed + 1 dynamic pattern).

### §4.2 Postgres tables under realtime subscriptions

| Table              | Service                                                   |
| ------------------ | --------------------------------------------------------- |
| `bids`             | `RealtimeBidService.ts` (5 subscriptions)                 |
| `estimate_requests`| `RealtimeEstimateService.ts` (2 subscriptions)            |
| `damage_reports`   | `RealtimeReportService.ts` (2 subscriptions)              |

**Total:** 3 tables. All BD-domain entities.

### §4.3 Extraction shape

The realtime PRIMITIVE (channel + filter + handler) is generic.
The channel NAMES and TABLE values are BD-specific.

Platform-core extraction:
- `@platform-core/realtime/` — generic `subscribe(channel, filter, handler)` machinery
- `@platform-core/realtime-supabase/` — Supabase `RealtimeChannel` adapter

App-private:
- `services/realtime/RealtimeBidService.ts` — channel: `all-bids-global`, table: `bids`
- `services/realtime/RealtimeEstimateService.ts` — channels + table values
- `services/realtime/RealtimeReportService.ts` — channels + table values

### §4.4 Sequencing risks (realtime)

**RISK 1 — Two locations subscribing without going through service files.**
`useReportLayerData.ts` subscribes directly via `.channel()` at
lines 87 + 120, bypassing the `services/realtime/Realtime*Service.ts`
pattern. Pre-extraction prep: route both subscriptions through
the appropriate service to maintain extraction-boundary discipline.
Otherwise the realtime extraction misses two sites.

**RISK 2 — Channel name collisions in multi-app browser.**
`all-bids-global`, `shop-availability-global`, `map-report-layer-changes`
are not namespaced. Multi-tenant deployments must namespace channels
per app. Same remediation pattern as storage keys.

---

## §5 — Route-taxonomy registry

### §5.1 ViewMode whitelist (12 values)

Source: `src/app/hooks/useNavigation.ts:12-25`.

```
dashboard
reports-list
report-detail
insurer-connect
liked-shops
shop-directory
insurance-companies
competitor-analysis
vehicles
new-claim
smoke-test
demo-switcher
```

### §5.2 CurrentTab values (7 values, soft-typed)

Sourced from `setCurrentTab(...)` call sites:

```
home
report
requests
claims
bids
jobs
estimates
```

Note: `currentTab` is typed as `string`, not a union. Validation
is loose (`typeof === "string" && length > 0`). The 7 values
above are observed call sites; the type allows arbitrary strings.

### §5.3 Account types (3 values)

Sourced from `useNavigation.ts:109-111`:

```
customer
shop
insurer
```

### §5.4 Reference-site map (where the route taxonomy is referenced)

| Site                                            | Lines                       | Refs                              |
| ----------------------------------------------- | --------------------------- | --------------------------------- |
| `src/app/utils/buildDashboardRouterProps.ts`    | 83, 93, 96, 109, 113, 117, 121 | 7 setCurrentTab calls          |
| `src/app/components/dev/DevDemoCustomerApp.tsx` | 95, 109                     | 2 setCurrentTab calls             |
| `src/app/components/dev/DevDemoShopApp.tsx`     | 98, 105, 109                | 3 setCurrentTab calls             |
| `src/app/hooks/useDeepLinkNavigation.ts`        | 28, 38                      | 2 setCurrentTab calls             |
| `src/app/hooks/useNavigation.ts`                | 188, 226, 235               | 3 internal setCurrentTab calls    |

**Total:** ~17 reference sites for `setCurrentTab` alone.
`setViewMode` adds more (deferred — route-graph mapping is its
own future pass).

### §5.5 Extraction shape

Per Pass 272 §10 + Pass 273:

- Platform-core `useNavigation` accepts `validRoutes` config
- App layer supplies `BD_ROUTES` (12 viewModes + 7 tabs + 3 roles)
- Storage key parameterized: app passes namespace; hook builds
  `<namespace>_navigation_state`

### §5.6 Sequencing risks (route-taxonomy)

**RISK 1 — Loose typing of `currentTab`.** Refactoring to a
union type would break all 17 reference sites. Pre-extraction
prep: tighten `currentTab` to a `BdTab` union BEFORE extraction;
catches misspellings at compile time.

**RISK 2 — `currentTab` doesn't share validation with `viewMode`.**
ViewMode has `VALID_VIEW_MODES.has()` check at restore time;
currentTab does not. Inconsistent contract. Future platform
hook should expose ONE validation pattern for both.

**RISK 3 — Demo-mode resets `currentTab` to `"home"`** at
useNavigation.ts:226+235. If `home` is renamed, demo mode breaks
silently. Tighten union type to surface this.

---

## §6 — Cross-registry sequencing risks

Beyond per-registry risks, three cross-cutting hazards:

### §6.1 Storage-key + window-global must migrate together

Renaming `bidondent_*` storage keys without renaming
`__bidondent_supabase__` window global creates inconsistent
namespace state. Migration script must handle both surfaces.

### §6.2 Realtime channel + storage-key namespace must be consistent

If platform-core exposes one `<namespace>` injection point,
both storage keys and channel names should derive from it.
Otherwise multi-tenant deployments break in subtle ways
(e.g., user A's storage isolates correctly but their realtime
events leak to user B).

### §6.3 Route taxonomy + storage-key derivation

`useNavigation` writes to `bidondent_navigation_state`. If the
hook is extracted with parameterized routes but its storage key
is hard-coded, it can't be reused. Storage-key parameterization
must ship in the same extraction pass as the hook, not later.

---

## §7 — What this pass DOES NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS, or
  CLAUDE.md.
- Does NOT bootstrap any repo / extract any subsystem / create
  any package.
- Does NOT rename any storage key, channel name, or route value.
- Does NOT add new owner-decision points (cumulative remains 31
  across Passes 268-273).
- Does NOT re-open the convergence-discovery lane. Every
  finding fits the Pass 271 6-category framework. Pass 274
  refines INSIDE the namespace-seam category; it does not
  invent new categories.
- Does NOT supersede prior platform docs. Pass 274 EXTENDS the
  Passes 268-273 corpus with mechanical inventory data.
- Does NOT author Stacey-specific brand content.
- Does NOT modify the AI-governance system in this repo.
- Does NOT execute any of the §6 remediations. Those are
  pre-extraction prep work that requires owner authorization.

---

## §8 — What's deferred

Per relay #2 the full inventory target list has 11 items. Pass
274 ships 4. The 7 deferred items, in priority order (highest
leverage first):

1. **Token ownership map** — theme.css 4,913 lines. Which tokens
   are platform-core (Tier 1 reference + Tier 2 system)? Which
   are BD-private (Tier 3 component)? Pass 270 §6.2 sketched
   this; mechanical line-by-line audit deferred.
2. **Capability-vs-identity matrix** — for each major subsystem,
   formalize: capability / identity / seam type / contamination
   vector / app-supplied surface. Doctrine consolidation work.
3. **Emotional-token inventory** — animations.css 553 lines +
   motion personality tokens. Pass 272 surfaced; mechanical
   inventory deferred.
4. **Provider/adapter matrix** — partial overlap with §2 above;
   would extend to non-vendor providers (e.g., the
   `MapSessionProvider` Pass 266 inert seam).
5. **Subsystem boundary inventory** — overlaps with Pass 270 §6.2
   16-subsystem MVP nucleus; needs file-by-file expansion.
6. **Shell-slot contract mapping** — qualitative analysis of
   which shell components need which slots. Pass 271 surfaced;
   mechanical mapping deferred.
7. **Type-import dependency graph** — Pass 271 #1 type-import-coupling
   category. Inventory of every cross-subsystem type import.

Each is its own future pass if/when authorized. Pass 274
intentionally ships only the 4 highest-leverage registries to
maintain single-doc-per-pass discipline.

---

## §9 — Cross-references

- Pass 273 [`PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md`](PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md) — convergence verdict; framework Pass 274 uses as doctrine.
- Pass 272 [`PLAN_PLATFORM_CONVERGENCE_TEST_2_2026-05-09.md`](PLAN_PLATFORM_CONVERGENCE_TEST_2_2026-05-09.md) — namespace-seam category origination.
- Pass 271 [`PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md`](PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md) — 6-category contamination framework.
- Pass 270 [`PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md`](PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md) — 16-subsystem MVP nucleus.
- Pass 269 [`PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md`](PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md) — adapter-seam pattern recommendation. Pass 274 §2 confirms surface size matches scope.
- Pass 268 [`PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md`](PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md) — 4-tier extraction matrix.
- Owner relay 2026-05-09 directives #1, #2, #6 (post-convergence transition: discovery CLOSED, execution-readiness OPEN).

---

## §10 — Status

- **Drafted:** 2026-05-09 (Pass 274, Extraction-Readiness Inventory lane).
- **Status:** ACTIVE reference. Mechanical inventories — current truth as of 2026-05-09 commit.
- **Authority:** REF. Subordinate to all current LAW docs.
- **Owner approval required:** FALSE for this doc itself
  (mechanical inventory is non-doctrine). TRUE for any
  pre-extraction remediation surfaced in §3.4 / §4.4 / §5.6 / §6.
- **Supersedes:** none.
- **Superseded by:** none.
- **Refines (does not supersede):** Pass 273 §3.7 namespace
  uniformity claim. Framework category unchanged; sub-finding
  within category corrects the count from "1 namespace
  convention" to 4 conventions + un-namespaced keys.

**Forward triggers (any one re-opens an inventory pass):**

1. Owner authorizes one of the 7 deferred inventories in §8.
2. Owner ratifies any of the 31 cumulative decision points →
   relevant subset of §3.4 / §4.4 / §5.6 / §6 remediations becomes
   pre-extraction prep work.
3. Real runtime defect surfaces (independent lane).
4. Owner provides Stacey answers (Pass 268 §8).

Until one fires: dormant.

The execution-readiness lane is now open and partially populated.
The four registries above reduce future extraction uncertainty by
turning Pass 273's qualitative categories into mechanical
location data. The namespace inconsistency finding (§3.1) is the
single most concrete extraction-sequencing risk the inventories
surfaced — owner ratification of remediation work would naturally
target this first.

The framework still holds. Inventories sharpen it without
revising it.
