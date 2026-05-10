---
status: ACTIVE
authority: REF
scope: provider-adapter-matrix
canonical_source_of_truth: REF_PROVIDER_ADAPTER_MATRIX_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 278 provider/adapter matrix under owner relay 2026-05-09 #9 priority C (runtime provider dependency topology). Extends Pass 274 vendor-binding registry (16 sites) by adding three additional provider categories: (1) React Context providers — 9 createContext sites: NotificationContext (27 useNotifications consumers), AppearanceModeContext (23 useAppearanceModeCtx consumers), MapSessionContext (0 consumers — Pass 266 inert-seam confirmed), plus 6 shadcn UI-primitive contexts (Carousel/Chart/FormField/FormItem/Sidebar/ToggleGroup) — all clean Tier A; (2) Hook-as-provider patterns — useNavigation 23 importers, useAppearanceMode 23 importers, useUser 13 importers (Clerk-coupled), useUserData 6 importers, useAuth 2 importers; (3) Adapter implementations — 4 adapter files in active use: services/storage/SupabaseStorageAdapter (Pass 273 §3.4 textbook pattern), services/intelligence/directoryAdapters + directoryAdapterUtils, services/navigation/navigationDestinationAdapters. App-mount provider hierarchy is 4-layer: ClerkProvider > MapSessionProvider > AppearanceModeProvider > NotificationProvider. Three behavioral categories: capability-bearing providers (substitutable at platform extraction time — AppearanceMode, MapSession, Sidebar, Carousel, Chart, Form, navigation/storage adapters) vs identity-bearing providers (cannot fully substitute — NotificationContext value carries BD-domain category/deep-link union; ClerkProvider is vendor-bound) vs already-platform-grade (UI-primitive shadcn contexts ready for direct port). Adapter pattern is ALREADY in active use across 3 domains (storage, directory data, navigation destinations) — Pass 269 §5.3 adapter recommendation is not speculative; the codebase has organic adapter discipline. Capability-vs-identity classification (relay #9 architectural axis): 7 capability-bearing platform candidates, 2 identity-bearing (Clerk + NotificationContext value), 6 already-platform-grade UI primitives. Three sequencing risks; six-step pre-extraction prep recommended. Framework HOLDS — every finding fits Pass 271 6-category model + Pass 273 6-seam taxonomy. ZERO new contamination categories. ZERO new owner-decision points (cumulative remains 31).
last_updated: 2026-05-09
---

# Pass 278 — Provider / Adapter Matrix

> **Tier:** REF. Current truth about runtime provider topology.
> **Authority:** Owner relay 2026-05-09 #9 priority C (runtime
> provider dependency topology). Extends Pass 274 vendor-binding
> registry by adding React Context providers, hook-as-provider
> patterns, and existing adapter implementations.
>
> **What this doc is:** mechanical inventory of the four
> provider/adapter categories operating in the codebase, mapped
> against three classification axes: capability vs identity,
> consumer count, and tier (A platform / B optional / C BD-private).
>
> **What this doc is NOT:**
> - LAW. Inventory data, not doctrine.
> - A re-test of convergence. Framework used as stable doctrine.
> - An extraction plan. Inventory is input, not authority.
> - A duplicate of Pass 274 §2 vendor-binding work. Pass 278
>   cross-references and extends.
> - A new decision-point generator. Pass 278 adds zero owner
>   decisions to cumulative 31.

---

## §1 — Mission

Per relay #9 priority C:

> "Pass 274 mapped registries. Pass 275 mapped type coupling.
> Pass 276 mapped token ownership. Pass 277 mapped behavioral
> authority. The next hidden instability surface is now: runtime
> provider dependency topology. Especially after the runtime
> audit surfaced realtime thrash, persistence entropy, route
> authority boundaries, and state-truth divergence. Provider/adapter
> mapping is now likely the highest remaining execution-risk
> surface."

The questions this pass answers:
1. What are ALL providers (not just vendor SDKs)? Where do they live, what do they bear?
2. Which providers are capability-bearing (substitutable) vs identity-bearing (BD-locked)?
3. Where is the adapter pattern already-in-use vs missing?
4. What is the App-mount provider hierarchy + dependency order?
5. Per-provider: tier classification + consumer count + extraction shape.

---

## §2 — Provider/adapter categories

Four categories of "provider/adapter" operate in the codebase:

| Category                            | Section | Count |
| ----------------------------------- | ------- | ----- |
| Vendor SDK bindings                 | §3 (cross-ref Pass 274 §2) | 4 vendors / 16 sites |
| React Context providers             | §4      | 9 createContext sites |
| Hook-as-provider patterns           | §5      | 5 main hooks  |
| Adapter implementations             | §6      | 4 files       |

Together these are the runtime authority surface that platform
extraction will need to either preserve, parameterize, or substitute.

---

## §3 — Vendor SDK bindings (cross-ref Pass 274 §2)

| Vendor    | Sites | Consumer count of root API                     |
| --------- | ----- | ---------------------------------------------- |
| Sentry    | 2     | (internal; errorReporting.ts public API)       |
| Supabase  | 5     | 1 client init + 4 type-only RealtimeChannel    |
| Clerk     | 6     | 1 ClerkProvider mount + 5 direct useUser() sites |
| MapLibre  | 3     | (internal; map module Tier B)                  |

Pass 274 §2 already documented the surface. Pass 278 confirms
the consumer-count side: ClerkProvider has **5 direct `useUser()`
calls scattered across the codebase** (the count is small enough
that the Pass 269 thin-wrapper retrofit is mechanical).

**Adapter pattern presence:** for storage YES (services/storage/);
for the others NO — direct vendor coupling at the use sites.

---

## §4 — React Context providers (9 sites)

### §4.1 Application-state providers (3)

| Provider                          | Source                                                     | Consumer count            | Tier classification |
| --------------------------------- | ---------------------------------------------------------- | ------------------------- | ------------------- |
| `NotificationContext`             | `features/notifications/NotificationContext.ts:4`          | **27** (`useNotifications`) | Tier A machinery + Tier C registry value (Pass 273 §2.2 split) |
| `AppearanceModeContext`           | `hooks/AppearanceModeContext.tsx:10`                       | **23** (`useAppearanceModeCtx`) | Tier A — wraps `useAppearanceMode` hook (Pass 275 confirmed clean platform candidate) |
| `MapSessionContext`               | `components/maps/mapSessionContext.ts:75`                  | **0** (Pass 266 Phase-1 inert-seam) | Tier B — `@platform/persistent-map-session` |

**MapSessionContext finding:** zero consumers confirms Pass 266
+ Pass 270 inert-seam doctrine. The provider scaffold is in
place; Phase 2 lift would wire consumers.

### §4.2 UI-primitive providers (6 — shadcn)

| Provider              | Source                                     | Tier  |
| --------------------- | ------------------------------------------ | ----- |
| `CarouselContext`     | `components/ui/carousel.tsx:31`            | A — direct port |
| `ChartContext`        | `components/ui/chart.tsx:25`               | A — direct port |
| `FormFieldContext`    | `components/ui/form.tsx:28`                | A — direct port |
| `FormItemContext`     | `components/ui/form.tsx:70`                | A — direct port |
| `SidebarContext`      | `components/ui/sidebar-context.tsx:26`     | A — direct port |
| `ToggleGroupContext`  | `components/ui/toggle-group.tsx:10`        | A — direct port |

All six are inside `components/ui/` (Pass 270 §6.2 + Pass 275 §6.2
confirmed CLEAN of BD types). These are shadcn UI primitives with
their own internal state machinery. Direct port to
`@platform-core/ui/` — no parameterization needed.

---

## §5 — Hook-as-provider patterns (5 main hooks)

Hooks that act as state-providers without using React Context:

| Hook                  | Source                                          | Importers | Tier classification              |
| --------------------- | ----------------------------------------------- | --------- | -------------------------------- |
| `useNavigation`       | `hooks/useNavigation.ts`                        | **23**    | A platform-candidate (Pass 275 §6.2 clean) |
| `useAppearanceMode`   | `hooks/useAppearanceMode.ts`                    | **23**    | A platform-candidate (clean)     |
| `useUser` (Clerk)     | `@clerk/clerk-react`                            | **13**    | C — vendor-coupled; thin-wrapper retrofit per Pass 269 §5 |
| `useUserData`         | `hooks/useUserData.ts`                          | **6**     | C — Pass 275 confirmed BD-domain |
| `useAuth`             | `hooks/useAuth.tsx`                             | **2**     | C — wraps Clerk; Pass 274 §2.3 |

Four of these (`useNavigation`, `useAppearanceMode`, `useUser`,
`useAuth`) duplicate Pass 274 / 275 findings; Pass 278 confirms
the consumer-count side.

**Authority asymmetry:** the two clean platform-candidate hooks
(`useNavigation` + `useAppearanceMode`) have 23 importers each.
The vendor-coupled `useUser()` has 13 direct importers AND is
also wrapped by `useAuth` (2 importers). Total Clerk reach: ~15
direct, plus indirect through the wrapper.

---

## §6 — Adapter implementations (4 files in active use)

The adapter pattern is **already in active use across 3 distinct
domains** in the codebase. Pass 273 §3.4 noted this for storage;
Pass 278 finds two more.

### §6.1 Storage adapter (Pass 273 §3.4 — textbook pattern)

| File                                                  | Role                                                        |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| `services/storage/StorageService.ts`                  | Interface + facade; selects provider via env var            |
| `services/storage/SupabaseStorageAdapter.ts`          | Concrete Supabase implementation                            |
| `services/storage/types.ts`                           | `IStorageProvider` contract                                 |

File header: "Switch providers by changing environment variable.
`STORAGE_PROVIDER=supabase` (default), `STORAGE_PROVIDER=aws-s3`,
`STORAGE_PROVIDER=cloudflare-r2`."

**Status:** ALREADY platform-grade. Direct port to
`@platform-core/storage/` + `@platform-core/storage-supabase/`.

### §6.2 Directory adapter

| File                                                       | Role                                       |
| ---------------------------------------------------------- | ------------------------------------------ |
| `services/intelligence/directoryAdapters.ts`               | Source-to-domain conversion functions      |
| `services/intelligence/directoryAdapterUtils.ts`           | Utilities                                  |

Pattern: convert various source data shapes (CoveragePartnerShop,
business profiles, market intelligence types) into a unified
`DirectoryReport`/`DirectoryVehicle`/etc. shape used by directory
features.

**Status:** Tier C — BD-domain (intelligence/directory features).
Adapter pattern is locally mature; the conversions themselves
are BD business logic.

### §6.3 Navigation destination adapter

| File                                                            | Role                                       |
| --------------------------------------------------------------- | ------------------------------------------ |
| `services/navigation/navigationDestinationAdapters.ts`          | Convert various source types to `NavigationDestination` |

File header: "Convert various source types into the universal
`NavigationDestination` used by routeEngine and guidance."

Pattern: each `*ToNavigationDestination(source)` function adapts
a different upstream type (Nominatim address, session waypoint,
discovery place, NY metro QA destination) to the unified
`NavigationDestination` shape.

**Status:** Tier B (`@platform/persistent-map-session` candidate
per Pass 270 §6.2). Pattern is platform-grade; the specific
source types include some BD-domain (NYMetroQADestination).

### §6.4 Adapter pattern presence summary

| Domain                    | Adapter pattern present? | Tier   |
| ------------------------- | ------------------------ | ------ |
| Storage (Supabase/S3/R2)  | ✓ textbook               | A      |
| Directory data            | ✓ source-to-domain       | C      |
| Navigation destinations   | ✓ source-to-unified      | B      |
| Sentry / error reporting  | ✗ direct vendor import   | A (with retrofit) |
| Clerk / auth              | ✗ direct vendor import   | A (with retrofit) |
| MapLibre / map engine     | ✗ direct vendor import   | B (inside Tier B module) |

**The adapter pattern is mature across 3 of 6 candidate domains.**
The 3 missing (Sentry, Clerk, MapLibre) are the Pass 269 §5
thin-wrapper retrofit candidates. Pass 278 confirms: the
codebase has organic adapter discipline — Pass 269's recommendation
extends an established repo pattern, not introduces a new one.

---

## §7 — App-mount provider hierarchy

`src/app/App.tsx` mounts providers in this order:

```
<ClerkProvider>                           (line 478) — outermost
  <MapSessionProvider>                    (line 489) — Phase 1 inert
    [...auth-gated children...]
    <AppearanceModeProvider>              (line 527)
      <NotificationProvider value={...}>  (line 528) — innermost
        <App content />
      </NotificationProvider>
    </AppearanceModeProvider>
  </MapSessionProvider>
</ClerkProvider>
```

`AppearanceModeProvider` + `NotificationProvider` are duplicated
in `components/dev/DevDemoCustomerApp.tsx:188+248` and
`components/dev/DevDemoShopApp.tsx:183+243` for demo-mode
isolation. ClerkProvider + MapSessionProvider are app-singleton.

### §7.1 Dependency-order analysis

The order encodes load-bearing assumptions:

1. **ClerkProvider outermost** — auth must be available before
   any other provider initializes. Vendor-bound; cannot move.
2. **MapSessionProvider second** — Pass 266 §5.3 chose this
   location (post-Clerk app shell) so the resize-patch import
   lands before any future engine construction.
3. **AppearanceModeProvider third** — its value comes from
   `useAppearanceMode` hook which reads `bidondent.appearance-mode`
   localStorage (Pass 274 §3.2). Must mount after auth/session
   so user-scoped preferences can layer in later.
4. **NotificationProvider innermost** — depends on auth identity
   to scope notifications. Innermost so notification stream
   teardown happens before auth unmount.

**Sequencing implication:** any platform extraction that
relocates one of these providers must preserve the dependency
order. The order is documented inside MapSessionProvider's
file header (Pass 266 §5.3 + relay).

---

## §8 — Capability-vs-identity classification (relay #9 architectural axis)

Per relay #5 + #9 architectural axis distinguishing
"identity-bearing" from "platform-grade":

### §8.1 Pure capability-bearing (substitutable at extraction time)

| Provider/adapter            | Capability                                |
| --------------------------- | ----------------------------------------- |
| `useAppearanceMode`         | persisted appearance preference           |
| `AppearanceModeContext`     | distribute appearance state               |
| `useNavigation`             | persistent navigation state               |
| `MapSessionContext`         | persistent map-session seam (Pass 266)    |
| `MapSessionProvider`        | inert seam scaffold                       |
| `StorageService`            | storage abstraction with provider swap    |
| `navigationDestinationAdapters` | unified destination type             |
| `CarouselContext`           | carousel-component internal state         |
| `ChartContext`              | chart-component internal state            |
| `FormFieldContext` + `FormItemContext` | form-field internal state      |
| `SidebarContext`            | sidebar-component internal state          |
| `ToggleGroupContext`        | toggle-group internal state               |
| `useHashPage` (Pass 277 §4.1) | hash-based routing                      |

13 capability-bearing surfaces. Substitutable: another app
provides its own values without inheriting BD identity.

### §8.2 Identity-bearing (cannot fully substitute)

| Provider/adapter            | Identity contents                                          |
| --------------------------- | ---------------------------------------------------------- |
| `NotificationContext` (value)| BD-domain category union (8 categories) + deep-link union (7 BD screens) — Pass 273 §2.2 split: machinery is platform; value is identity |
| `ClerkProvider`             | Clerk SDK binding (vendor-locked); thin-wrapper retrofit per Pass 269 §5 isolates wrappable surface |
| `directoryAdapters`         | BD intelligence-domain conversion logic                    |
| `useUserData`               | BD user-data shape                                         |

4 identity-bearing surfaces. Each has a concrete substitution
strategy:

- NotificationContext: type-parameterize machinery; app supplies value
- ClerkProvider: thin-wrapper exposes generic interface; binding stays
- directoryAdapters: stays Tier C app-private
- useUserData: stays Tier C app-private

### §8.3 Already-platform-grade (no work needed)

The 6 shadcn UI-primitive contexts (§4.2) plus
`SupabaseStorageAdapter` (§6.1) are already platform-grade-shape.
Direct port; no parameterization, no decision required.

### §8.4 Classification ratio

| Class                         | Count | % of 22 surfaces |
| ----------------------------- | ----- | ---------------- |
| Pure capability-bearing       | 13    | 59%              |
| Identity-bearing              | 4     | 18%              |
| Already-platform-grade        | 5     | 23%              |

**77% of provider/adapter surfaces are extractable as platform
capabilities.** Only 18% require app-private treatment or
substitution strategy. The architectural cleanliness predicted
by Pass 271 + 273 + 277 holds at the provider layer too.

---

## §9 — Sequencing risks

### §9.1 RISK 1 (LOW) — UI-primitive contexts are direct port

The 6 shadcn contexts (Carousel/Chart/FormField/FormItem/Sidebar/
ToggleGroup) port directly. No risk.

### §9.2 RISK 2 (LOW) — Storage adapter already-shaped

`StorageService.ts` is textbook adapter. Port unchanged.

### §9.3 RISK 3 (MEDIUM) — App-mount provider order is load-bearing

Per §7.1, the 4-layer App.tsx mount hierarchy encodes dependency
assumptions (Clerk first, MapSession second for resize-patch
side-effect, AppearanceMode third for storage scoping, Notification
innermost for auth-scoped lifecycle).

Pre-extraction prep: the platform-core extraction must preserve
this order. Document the order at the platform level so apps
that compose these providers don't accidentally reorder.

### §9.4 RISK 4 (MEDIUM) — NotificationContext type-parameterization

Pass 273 §2.2 + Pass 275 §3.1 prescribed type-parameterization
of the notification machinery over `<TCategory, TDeepLink>`. 27
`useNotifications()` consumers need updating to specify their
type arguments — though most consumers don't directly use
category/deep-link unions and may not need changes.

Pre-extraction prep: type-design the parameterization (Pass 275
§4.2 sketch); audit which of the 27 consumers actually use the
category/deep-link unions; update those callsites.

### §9.5 RISK 5 (MEDIUM) — Clerk thin-wrapper retrofit (5 + 13 sites)

Per Pass 274 §2.3 + Pass 278 §5: 6 files import directly from
`@clerk/clerk-react`; 5 sites call `useUser()` directly; 13
files import via the `useUser` hook. The thin-wrapper retrofit
(Pass 269 §5) needs to:
1. Inflate `hooks/useAuth.tsx` to be the canonical wrapper.
2. Redirect 5 direct `useUser()` callsites through the wrapper.
3. Decide on `<SignInButton>` / `<SignUpButton>` (Clerk components)
   strategy — wrap or accept Tier C.

### §9.6 RISK 6 (LOW) — MapSessionProvider already-shaped

Pass 266 inert-seam. Phase 2 PMS engine-lift work (independent
gate) wires consumers. Provider topology is platform-extraction-ready.

---

## §10 — Pre-extraction prep recommendation

Step ordering (each requires owner authorization):

1. **Document the App-mount provider order doctrine.** Write a
   short REF or LAW block (Pass 269 §5.3 already partially did
   this) so platform extraction preserves the 4-layer hierarchy
   intent. (Doc-only, not source edit.)
2. **Audit `useNotifications()` 27 consumers** for direct
   category/deep-link union usage. Categorize: trivial (consumer
   doesn't touch unions) vs requires-type-arg (does). Source-read
   only.
3. **Inflate `hooks/useAuth.tsx`** to be the canonical Clerk
   wrapper. Add the methods the 5 direct `useUser()` callsites
   need. (Source edit.)
4. **Redirect 5 direct `useUser()` callsites** through the
   wrapper. Single coordinated change-set. (Source edit.)
5. **Decide `<SignInButton>` / `<SignUpButton>` strategy.** Owner
   decision: wrap (CTASection.tsx + LandingPageHeader.tsx use them)
   or accept the landing-page Clerk dependency as Tier C boundary.
6. **THEN** provider/adapter extraction is mostly file-moves,
   with the 4 already-clean adapters (Storage / Directory /
   Navigation-destination / Map-resize-patch) as the easiest
   first targets.

Steps 3-4 are mechanical source edits. Step 5 is owner decision.
Steps 1-2 are auditable doc/read passes.

---

## §11 — Cleanliness wins (per relay #4 + #8 directives)

1. **Adapter pattern is already-in-use across 3 domains** (storage, directory, navigation-destination). Pass 269 §5 adapter recommendation extends an established repo pattern, not introduces it.
2. **6 shadcn UI-primitive contexts are direct port.** ZERO BD coupling at the UI-primitive layer (Pass 270 §6.2 + Pass 275 §6.2 already confirmed; Pass 278 extends to Context layer).
3. **MapSessionProvider has 0 consumers — Pass 266 inert-seam doctrine confirmed.** The seam is in place; Phase 2 lift wires it. Provider topology is extraction-ready.
4. **App-mount provider hierarchy is documented inline** (MapSessionProvider file header explains its position). The dependency order is intentional, not accidental.
5. **77% of provider/adapter surfaces are capability-bearing** (substitutable). Only 18% identity-bearing.
6. **AppearanceModeProvider is a 23-line wrapper** around `useAppearanceMode` hook. Adding the Provider doesn't add coupling beyond the underlying hook (Pass 275 confirmed clean platform candidate).
7. **NotificationContext machinery is platform-grade** even though its concrete type value is BD-identity. Pass 273 §2.2 split is mechanically present.
8. **`useNavigation` 23 importers + `useAppearanceMode` 23 importers** are the largest hook-as-provider surfaces, and both are clean platform candidates per Pass 275. The two largest authority distributions are platform-extractable.

---

## §12 — Cross-references to runtime audit lane

Per relay #4-#7 the runtime-audit lane surfaced findings; Pass
278 cross-references where provider topology contextualizes them:

### §12.1 Realtime thrash

The runtime audit detected realtime subscription churn. Pass 274
§4 inventoried the 9 channel names + 3 tables. Pass 278 confirms
**there is NO React Context provider for realtime subscriptions**
— the subscriptions live as imperative side-effects inside
specific service files (`RealtimeBidService.ts` etc.). The
absence of a provider means there's no central authority; each
service manages its own subscription lifecycle. Pre-extraction
prep candidate: introduce a `RealtimeSubscriptionProvider` that
owns the channel registry centrally.

### §12.2 Persistence entropy (22 nav-session keys)

The runtime audit detected unbounded `bidondent_nav_session_*`
key growth. Pass 274 §3.2 documented the dynamic-key surface.
Pass 278 confirms **there is NO React Context provider for
persistence; storage is called imperatively from hooks/services**.
Pre-extraction prep candidate: the 4 existing adapter files
(§6) suggest a `PersistenceProvider` could be added cleanly with
an LRU-policy wrapper around localStorage, matching the
StorageService pattern.

### §12.3 Route authority boundaries

Pass 277 §6 mapped navigation authority concentration. Pass 278
§5 confirms `useNavigation` (23 importers) is the navigation
authority. Pass 277 §4.1 confirms `useHashPage` is the hash
routing authority. **The two are independent providers** — one
for app-internal navigation, one for hash-routed pages. Boundary
is clean.

### §12.4 State-truth divergence

The runtime audit detected map-state overlay desync. Pass 277
§7.1 confirmed this is in `components/maps/`, not the shell.
Pass 278 confirms `MapSessionProvider` is the intended seam for
map-state authority but is currently inert (0 consumers). The
state-truth divergence is happening because there's NO authoritative
provider yet — Pass 266 Phase 2 engine-lift would address this
by wiring the provider as the single source of truth.

---

## §13 — What this pass DOES NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS, or CLAUDE.md.
- Does NOT bootstrap any repo / extract any subsystem / create any package.
- Does NOT add new providers / refactor existing ones / change adapter implementations.
- Does NOT add new owner-decision points (cumulative remains 31).
- Does NOT re-open convergence-discovery lane — every finding fits Pass 271 6-category model + Pass 273 6-seam taxonomy as stable doctrine.
- Does NOT supersede prior platform docs; refines and cross-references.
- Does NOT validate or duplicate runtime-audit lane findings; cross-references only.

---

## §14 — What's deferred

Per relay #9 priority order, Pass 278 ships only Priority C. Two remaining inventories:

- **D. Capability-vs-identity matrix** — Pass 278 §8 partially anticipates this for the 22 provider/adapter surfaces; full matrix would extend to all subsystems
- **E. Emotional-token inventory** — would deepen Pass 276 §3.2 + §4.2 emotional-tier work

Plus from earlier deferred:
- Subsystem boundary inventory

Each is its own future pass if/when authorized. Pass 278 maintains single-doc-per-pass discipline.

---

## §15 — Cross-references

- Pass 277 [`REF_SHELL_SLOT_CONTRACT_MAP_2026-05-09.md`](REF_SHELL_SLOT_CONTRACT_MAP_2026-05-09.md) — shell behavioral mapping; Pass 278 §12.3 + §12.4 cross-references navigation + map-state authority.
- Pass 276 [`REF_TOKEN_OWNERSHIP_MAP_2026-05-09.md`](REF_TOKEN_OWNERSHIP_MAP_2026-05-09.md) — token surface; Pass 278 §8.3 confirms UI-primitive cleanliness extends to context layer.
- Pass 275 [`REF_TYPE_IMPORT_DEPENDENCY_GRAPH_2026-05-09.md`](REF_TYPE_IMPORT_DEPENDENCY_GRAPH_2026-05-09.md) — type-graph; Pass 278 §9.4 cross-references NotificationContext type-parameterization.
- Pass 274 [`REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md`](REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md) — vendor binding registry; Pass 278 §3 cross-references and extends to non-vendor providers.
- Pass 273 [`PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md`](PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md) — adapter-seam pattern validated for storage; Pass 278 confirms the pattern is in active use across 3 domains.
- Pass 269 [`PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md`](PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md) — §5 thin-wrapper recommendation; Pass 278 §9.5 confirms surface size (5 + 13 Clerk sites; tractable).
- Pass 266 — MapSessionProvider inert-seam exemplar; Pass 278 §4.1 confirms 0 consumers (Phase 1 status correct).
- Owner relay 2026-05-09 #9 priority C + parallel runtime-audit lane findings.

---

## §16 — Status

- **Drafted:** 2026-05-09 (Pass 278, Provider/Adapter Matrix lane).
- **Status:** ACTIVE reference. Mechanical inventory — current truth as of 2026-05-09 commit.
- **Authority:** REF. Subordinate to all current LAW docs.
- **Owner approval required:** FALSE for this doc itself. TRUE for any of the §10 step 3-5 source edits and decisions.
- **Supersedes:** none.
- **Superseded by:** none.
- **Refines (does not supersede):** Pass 273 adapter-seam category — confirms pattern is in active use across 3 domains, not just storage. Pass 274 §2 vendor-binding — extends to React Context providers + hook-as-provider patterns + adapter implementations.

**Forward triggers (any one re-opens an inventory or prep pass):**

1. Owner authorizes any of the 2 deferred inventories in §14 (priorities D, E + subsystem boundary).
2. Owner ratifies any of the §10 step 1-5 pre-extraction prep tasks → source-edit work begins.
3. Owner ratifies any of the 31 cumulative decision points → relevant draft platform-LAW / extraction plan becomes authorable.
4. Real runtime defect surfaces (independent lane).
5. Owner provides Stacey answers (Pass 268 §8).

Until one fires: dormant.

The execution-readiness lane is now populated with three
registries (Pass 274), three dependency graphs (Pass 275 type +
Pass 276 token + Pass 278 provider), and one behavioral slot map
(Pass 277). Together they convert Pass 273's qualitative seam
taxonomy into mechanical location data spanning all four
coupling dimensions: type-shape, token-cascade,
behavioral-authority, and persistence-continuity, plus the
runtime authority layer that Pass 278 mapped.

The provider layer's cleanliness is the headline of Pass 278:
77% capability-bearing surfaces, adapter pattern already in
active use across 3 domains, UI-primitive contexts are
direct-port, MapSessionProvider inert-seam doctrine confirmed,
clean App-mount dependency order. The architectural cleanliness
predicted by Pass 271 + 273 + 277 holds at the provider layer.

The most actionable extraction-risk reduction surfaced: §10 step
3-4 (Clerk thin-wrapper retrofit on 5 callsites + 1 wrapper
file). The most consequential owner decisions surfaced: §10 step
5 (`<SignInButton>`/`<SignUpButton>` strategy).
