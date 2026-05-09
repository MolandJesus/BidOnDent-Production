# Convergence Topology — Map / Navigation / State Authority (2026-05-09)

> **Tier:** REFERENCE. Current truth as of Pass 213 (2026-05-09). Evidence-backed
> read-only audit produced under [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md)
> Phase 4–5 boundary, dispatched per owner authorization on the multi-AI relay
> (ChatGPT advisory + Claude execution).
>
> **Authority:** This doc is descriptive (current topology), not prescriptive.
> Convergence execution itself is **OWNER-GATED** and **POST-LAUNCH** unless
> the master builder explicitly authorizes a hardening-scoped collapse.
> [`PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) is
> the canonical convergence plan; this doc augments it with three findings
> outside its 5-surface inventory.
>
> **Status tags used in this doc:**
>
> - `CANONICAL` — single source of truth for its concern.
> - `ACTIVE` — currently mounted in production paths.
> - `DUPLICATE` — parallel implementation that overlaps a CANONICAL system.
> - `DEFERRED` — convergence acknowledged, intentionally not collapsed yet.
> - `OWNER-GATED` — requires owner authorization before structural change.
> - `POST-LAUNCH` — convergence target lives outside soft-launch hardening scope.
> - `SAFE-AUTOPILOT` — change can be made by an autopilot pass without owner gate.
> - `STRUCTURAL-RISK` — cascading refactor; requires explicit scope authorization.

---

## §0. AI Operational Onboarding

**What this doc controls:** the topology map for map renderers, navigation
orchestration entry points, route/deviation/reroute lifecycle owners, and
client-side state authority (localStorage / sessionStorage / Supabase
boundaries). Use it to answer "where does X live?" and "is there a duplicate
of Y?" before adding a new system.

**When to trust it:** the inventory is captured at Pass 213 (2026-05-09).
File:line citations are point-in-time. **Verify before acting** — the repo
moves. If a citation does not match current code, prefer the code, then
update this doc in the same pass per LAW co-update rule.

**What supersedes it:**

1. [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — always wins on intent.
2. [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — wins on layer placement.
3. [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) — wins on what is allowed during pre-launch.
4. [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — wins on visual canon.
5. [`PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) — wins on map shell convergence direction.
6. [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) — wins on system-state truth where this doc and that doc disagree.

**What this doc must NOT be used for:**

- Authorizing structural collapse. Convergence findings here are inventory,
  not greenlights. Collapse passes require owner authorization.
- Inventing new renderers, hooks, or storage keys. If the inventory shows a
  CANONICAL system, extend it instead of creating a peer.
- Renaming/extracting/archiving without explicit owner instruction beyond the
  `SAFE-AUTOPILOT` flag on individual items.

---

## §1. Map Renderer Topology

The repo currently instantiates **three independent MapLibre engines**.
[`PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) §1
enumerates 5 *surfaces* but only one of those (`MapLibreServiceCoverageMap`)
was identified as the engine wrapper. The other two engine instantiations
listed below are **not in PLAN_MAP_UNIFICATION's surface inventory** and are
the highest-leverage convergence delta versus that plan.

### 1.1 `MapEngineCanvas` — `CANONICAL` engine boundary (Pass 192 contract-locked)

- **File:** [`src/app/components/maps/engine/MapEngineCanvas.tsx`](../src/app/components/maps/engine/MapEngineCanvas.tsx)
- **Test contract:** [`src/app/components/maps/engine/MapEngineCanvas.test.tsx`](../src/app/components/maps/engine/MapEngineCanvas.test.tsx) — Pass 192 lock.
- **Current consumer:** `MapLibreServiceCoverageMap` (line 9 import).
- **Status:** `CANONICAL`. This is the engine boundary all future renderers
  should target per PLAN_MAP_UNIFICATION §2 `<MapProgramShell>` proposal.

### 1.2 `MapLibreServiceCoverageMap` — `ACTIVE` shell + chrome wrapper

- **File:** [`src/app/components/maps/MapLibreServiceCoverageMap.tsx`](../src/app/components/maps/MapLibreServiceCoverageMap.tsx)
- **Engine:** `MapEngineCanvas` (delegates).
- **Mounted by:**
  - [`CoverageBrowseExperience`](../src/app/components/landing/CoverageBrowseExperience.tsx)
  - [`OperatingRegionsSection`](../src/app/components/landing/OperatingRegionsSection.tsx)
  - [`CoverageActiveNavigationLayout`](../src/app/components/landing/CoverageActiveNavigationLayout.tsx)
- **Status:** `ACTIVE`. Carries `MapNavigationHud`, `MapSurfaceControls`,
  `MapSurfaceHeaderBadges`, `MapSurfaceStatusBar`, follow-location controller,
  arrival camera effect, performance tracking. Per PLAN_MAP_UNIFICATION §2,
  the chrome layer here will eventually split into `<MapProgramShell>`.

### 1.3 `MapLibreDashboardMapPreview` — `DUPLICATE` engine instantiation

- **File:** [`src/app/components/dashboard/MapLibreDashboardMapPreview.tsx`](../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx)
- **Engine:** standalone `<Map>` from `react-map-gl/maplibre` (line 4 import).
  Does NOT route through `MapEngineCanvas`.
- **Mounted by:**
  - [`ReportDetailScreen`](../src/app/components/reports/ReportDetailScreen.tsx) line 9 / 348
  - [`ReportsListScreen`](../src/app/components/reports/ReportsListScreen.tsx) line 8 / 187
  - [`InsurerMapWidget`](../src/app/components/dashboard/InsurerMapWidget.tsx) line 8 / 82
  - [`CompetitorAnalysisScreen`](../src/app/components/reports/CompetitorAnalysisScreen.tsx) line 14 / 330
- **Status:** `DUPLICATE` of CANONICAL engine, `OWNER-GATED` for collapse,
  `POST-LAUNCH`. Convergence target: refactor to consume `<MapEngineCanvas>` so
  preview surfaces inherit the same patches (resize, performance, atmosphere)
  and the engine count drops to one.
- **Risk:** `STRUCTURAL-RISK` — four consumers across reports + insurer +
  competitor analysis. Touches surfaces in active hardening scope. Recommend
  scoping this as its own owner-authorized pass post-launch, NOT in autopilot.
- **Not in PLAN_MAP_UNIFICATION:** §1 of that plan does not list this file
  among the 5 surfaces. Update PLAN_MAP_UNIFICATION §1 to add a 6th surface
  inventory entry, OR record that the dashboard-preview engine is intentionally
  separate and tag it `DEFERRED`. Owner decision.

### 1.4 `MapLibreShopDirectoryMapPane` — `DUPLICATE` engine instantiation (acknowledged in PLAN as "parallel viewport implementation")

- **File:** [`src/app/components/shop/MapLibreShopDirectoryMapPane.tsx`](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx)
- **Engine:** standalone `<Map>` from `react-map-gl/maplibre` (line 6 import).
  Does NOT route through `MapEngineCanvas`.
- **Mount chain:** `ShopDirectoryImmersiveMap` → `ImmersiveMapViewport` → `MapLibreShopDirectoryMapPane`.
- **Status:** `DUPLICATE`, `DEFERRED`, `POST-LAUNCH`. PLAN_MAP_UNIFICATION §1.5
  flags the underlying viewport as "parallel viewport implementation" and
  schedules the immersive surface to migrate **last** in the 9-pass roadmap.
  This audit confirms the engine itself is also duplicated.
- **Risk:** `STRUCTURAL-RISK` — highest behavioral coupling of any map surface
  (route options, drawer snap, origin picker, GPS, deviation, voice).
  Acknowledged by PLAN_MAP_UNIFICATION as the last migration target.

**Convergence delta vs PLAN_MAP_UNIFICATION:** the plan documents one
canonical engine extraction. This audit confirms **two undocumented engine
instantiations** still exist outside the 5-surface inventory. Update
PLAN_MAP_UNIFICATION §1 to acknowledge the 3-engine reality, or this doc
serves as the supplementary inventory.

---

## §2. Navigation Orchestration Topology

Two parallel orchestration assembly patterns exist. Both wire the same
underlying primitives (`useNavigationSession`, `useNavigationIntelligence`,
`useNavigationReroute`, `useNavigationLifecycleEffects`, route preview, GPS
tracking) but at different abstraction levels.

### 2.1 `useCoverageNavigationExperience` — `ACTIVE` composite hook

- **File:** [`src/app/hooks/useCoverageNavigationExperience.ts`](../src/app/hooks/useCoverageNavigationExperience.ts) line 105
- **Mounted by:**
  - [`useOperatingRegionsCoverage`](../src/app/hooks/useOperatingRegionsCoverage.ts) line 113
  - [`DashboardCoveragePanel`](../src/app/components/dashboard/DashboardCoveragePanel.tsx) line 77
- **Status:** `ACTIVE`. High-level composite — assembles route preview,
  GPS tracking, voice priming, launch handler under one return shape.

### 2.2 `useShopDirectoryNavigation` — `ACTIVE` direct-assembly pattern

- **File:** [`src/app/hooks/useShopDirectoryNavigation.ts`](../src/app/hooks/useShopDirectoryNavigation.ts)
- **Pattern:** assembles `useNavigationIntelligence` (line 63),
  `useNavigationSession` (line 64), `useNavigationReroute` (line 73),
  `useNavigationLifecycleEffects` (line 293) **directly** rather than going
  through a composite hook.
- **Status:** `ACTIVE`, `DUPLICATE` of orchestration pattern, `OWNER-GATED`,
  `POST-LAUNCH`. Convergence target: either extract the immersive-specific
  bits into a `useShopDirectoryNavigationExperience` composite that mirrors
  `useCoverageNavigationExperience`, or generalize the latter to accept a
  surface-context discriminator.
- **Risk:** `STRUCTURAL-RISK` — the immersive shop directory has surface-
  specific concerns (drawer snap, origin picker, route options) that the
  coverage composite does not. Generalization may produce a leaky abstraction.
  Defer until `<MapProgramShell>` lands and immersive migrates onto it
  (PLAN_MAP_UNIFICATION final-phase target).

**Convergence delta vs PLAN_MAP_UNIFICATION:** PLAN_MAP_UNIFICATION focuses on
the *renderer* layer (shell + slots). It does not explicitly call out
orchestration-hook duplication. Recommend PLAN_MAP_UNIFICATION add a §11
"Orchestration convergence" section, OR keep the orchestration question
scoped here under `DEFERRED` until renderer convergence completes.

---

## §3. Route / Deviation / Reroute Lifecycle Authority

### 3.1 Route preview — `CANONICAL`

- **Service (data):** [`fetchNavigationRoutePreview`](../src/app/services/navigation/routeEngine.ts) line 81
- **Hook (lifecycle):** [`useNavigationRoutePreview`](../src/app/hooks/useNavigationRoutePreview.ts) line 70
- **Type contract:** [`NavigationRoutePreview`](../src/app/types/navigation.ts) line 50
- **Status:** `CANONICAL`. Single fetch path, single hook lifecycle, single
  type contract. **No duplicate route-preview pipeline detected.** This is the
  cleanest seam in the navigation domain.

### 3.2 Deviation detection — `CANONICAL`

- **Pure function:** [`detectDeviation`](../src/app/features/navigation/detectDeviation.ts) — Pass 205 regression-locked (KI-116 origin-vertex fix).
- **Hook integration:** [`useNavigationIntelligence`](../src/app/features/navigation/useNavigationIntelligence.ts) line 50
- **Single call site:** [`useNavigationLifecycleEffects.ts`](../src/app/hooks/useNavigationLifecycleEffects.ts) — `intelligence.evaluate(snapshot)` gated on `navSession.session.status === "active"` per Pass 61 (KI-117 RESOLVED).
- **Status:** `CANONICAL`. Single algorithm, single integration point, single
  guard. No duplication.

### 3.3 Reroute gating — `CANONICAL`

- **Pure function:** [`shouldTriggerReroute`](../src/app/features/navigation/shouldTriggerReroute.ts) — Pass 205 regression-locked.
- **Hook:** [`useNavigationReroute`](../src/app/features/navigation/useNavigationReroute.ts) line 79
- **Status:** `CANONICAL`. Single gating policy, no duplication.

**Convergence finding for §3:** none required. This subsystem is already
canonical and well-isolated. Document it as a positive example of the target
architecture for §1 and §2 convergence work.

---

## §4. Client-Side State Authority Matrix

Inventory of `localStorage` / `sessionStorage` keys observed in the repo. All
keys are **single-tenant per-key** with no central authority registry. The
`bidondent_nav_*` cluster has dedicated cleanup tooling
([`clearStaleNavSessions`](../src/app/utils/clearStaleNavSessions.ts), Pass
212 test-locked); other clusters do not.

### 4.1 Navigation cluster

| Key                                           | Owner                                                                                                                          | Scope    | Cleanup                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------- |
| `bidondent_navigation_state`                  | [`useNavigation.ts`](../src/app/hooks/useNavigation.ts) line 5                                                                 | global   | `clearAllUserScopedSessionKeys` does **not** touch this — REVIEW. |
| `bidondent_navigation_session`                | [`services/navigation/navigationSession.ts`](../src/app/services/navigation/navigationSession.ts) line 4                       | global   | not in `clearStaleNavSessions` sweep                              |
| `bidondent_navigation_preferences`            | [`navigationPreferences.ts`](../src/app/services/navigation/navigationPreferences.ts) line 4                                   | global   | retained across logout                                            |
| `bidondent_navigation_discovery_role`         | [`discoveryPreferences.ts`](../src/app/services/navigation/discoveryPreferences.ts) line 4                                     | global   | retained                                                          |
| `bidondent_navigation_parked_car`             | [`parkedCarLocation.ts`](../src/app/services/navigation/parkedCarLocation.ts) line 4                                           | global   | retained                                                          |
| `bidondent_navigation_saved_locations`        | [`savedLocations.ts`](../src/app/services/navigation/savedLocations.ts) line 8                                                 | global   | retained                                                          |
| `bidondent_nav_session_*` (per-user)          | [`navigationSessionCloudService.ts`](../src/app/services/navigation/navigationSessionCloudService.ts) line 8                   | per-user | `clearStalePlanningNavSessions` (Pass 61 / KI-117)                |
| `bidondent_nav_active_session_*` (per-user)   | [`navigationSessionCloudService.ts`](../src/app/services/navigation/navigationSessionCloudService.ts) line 9                   | per-user | `clearAllUserScopedSessionKeys`                                   |
| `bidondent_nav_pending_writes`                | [`navigationSessionCloudService.ts`](../src/app/services/navigation/navigationSessionCloudService.ts) line 11                  | global   | `clearAllUserScopedSessionKeys`                                   |
| `bidondent_nav_cloud_unavailable`             | [`navigationSessionCloudService.ts`](../src/app/services/navigation/navigationSessionCloudService.ts) line 12                  | global   | `clearAllUserScopedSessionKeys`                                   |

**Finding:** `bidondent_navigation_state` (UI navigation state, e.g. current
viewMode/tab) and `bidondent_navigation_session` (in-progress nav session)
share a confusingly similar prefix but are owned by different layers
(`hooks/useNavigation.ts` vs `services/navigation/navigationSession.ts`) and
have different lifetimes. Neither is touched by `clearAllUserScopedSessionKeys`
on sign-out. **Status:** `DEFERRED` — not a known active bug, but worth
review on the next sign-out hygiene pass.

### 4.2 Identity / website cluster

| Key                                            | Owner                                                                                                          | Scope    | Cleanup                |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------- | ---------------------- |
| `bidondent_website_session:<userKey>`          | [`websiteIdentity.ts`](../src/app/services/auth/websiteIdentity.ts) line 55                                    | per-user | replace on sign-in     |
| `bidondent_website_memory:<userKey>`           | [`websiteIdentity.ts`](../src/app/services/auth/websiteIdentity.ts) line 56                                    | per-user | replace on sign-in     |
| `bidondent_user_last_active`                   | [`constants/index.ts`](../src/app/constants/index.ts) line 61                                                  | global   | not swept              |

### 4.3 Coverage / map cluster

| Key                          | Owner                                                                                                | Scope  | Cleanup     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | ------ | ----------- |
| `bidondent_coverage_state`   | [`landing/coverageState.ts`](../src/app/components/landing/coverageState.ts) line 12                 | global | not swept   |

### 4.4 Authority observations

- **No central registry.** Each module owns its prefix in isolation. Adding a
  new key requires reading every existing service file to confirm no overlap.
  This is the pattern that produced the navigation-state vs navigation-session
  prefix collision noted above.
- **Cleanup discipline is uneven.** `bidondent_nav_*` cluster has a sweep
  function with test coverage. The website cluster overwrites in-place. The
  remaining global keys (`navigation_state`, `coverage_state`,
  `user_last_active`, all `navigation_*` preferences) persist across sign-out
  with no documented retention policy.
- **Supabase boundary is clean.** Per [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md)
  load-bearing fact #2 (storage URLs as pointers) and #4 (every edge handler
  hydrates), there is no observable client-side persistence of Supabase data
  beyond what React Query / hook state holds. **No convergence work needed
  on the Supabase side.**

**Status of §4 as a whole:** `DEFERRED`, `SAFE-AUTOPILOT` for documentation
extension (this matrix can become a persistent REF section under
`REF_SYSTEM_STATE.md` or its own doc on owner authorization), `OWNER-GATED`
for cleanup-policy unification.

---

## §5. Drift Diff vs `PLAN_MAP_UNIFICATION_2026-05-08.md`

| PLAN_MAP_UNIFICATION claim                                                                       | Pass 213 reality                                                                                          | Action                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5 map surfaces                                                                                   | 5 surfaces + `MapLibreDashboardMapPreview` not in inventory                                               | **Update PLAN §1** to add 6th surface OR tag dashboard-preview as `DEFERRED` separate program. Owner decision.                                                               |
| `MapLibreServiceCoverageMap` is "the engine + base chrome wrapper" with engine extraction target | `MapEngineCanvas` extraction **already shipped** (Pass 192 contract-locked); `MapLibreServiceCoverageMap` now consumes it | **Update PLAN §1.4** to reflect post-Pass-192 state. The "architectural smell" called out in §1.4 has been partially addressed — engine extracted, chrome host pending. |
| 9-pass migration roadmap                                                                         | Pass 192 (engine boundary) + Pass 193 (sub-pass 2 contract lock) + Pass 194 (KI-168 sub-pass 1) shipped   | **Add a "Progress" subsection** to PLAN noting which roadmap passes have shipped. README mentions this; PLAN itself does not.                                                |
| Immersive surface "parallel viewport implementation" flagged                                     | Confirmed — `MapLibreShopDirectoryMapPane` has its own `<Map>` instantiation                              | No action; PLAN already acknowledges.                                                                                                                                        |
| KI-170 / KI-171 / KI-172 are the retirement targets                                              | KI-172 RESOLVED Pass 10; KI-170 / KI-171 still OPEN                                                       | No action; PLAN status accurately tracked.                                                                                                                                   |

**Recommended PLAN_MAP_UNIFICATION updates** (do NOT execute without owner
authorization — this audit is read-only):

1. Add §1.6 entry for `MapLibreDashboardMapPreview` (or explicit `DEFERRED` callout).
2. Update §1.4 to reflect Pass 192 engine extraction.
3. Add §10 "Progress against roadmap" with shipped passes.
4. Add §11 "Orchestration convergence" with the §2 finding from this doc.

---

## §6. Documentation Routing Audit

The doc tree is **healthier than the pass logs implied** to the strategic
advisor. README.md is current to Pass 195, all 5 LAW docs are clearly tiered,
77 archived docs preserve historical context, and cross-refs use canonical
paths.

### 6.1 Findings

| Finding                                                                         | Severity | Recommendation                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PLAN_POST_PASS_28_2026-05-06.md` is a session-execution log, not a forward plan | low      | Filename suggests PLAN tier but contents are an OPS-tier execution log. Status: `DEFERRED`. Owner may rename `OPS_POST_PASS_28_2026-05-06.md` post-launch; not worth doing pre-launch.                                                                       |
| Status-tag vocabulary is inconsistent across docs                               | medium   | Some docs use "Active" / "Draft", some use "ACTIVE" / "PRE-EXECUTION", some use no tag at all. ChatGPT's proposed vocabulary (CANONICAL/ACTIVE/SUPERSEDED/ARCHIVED/DEFERRED/HISTORICAL/OWNER-GATED/POST-LAUNCH/SAFE-AUTOPILOT/STRUCTURAL-RISK) is reasonable. |
| Top-of-doc "AI operational onboarding" section is missing on most major docs    | medium   | This doc adopts the pattern in §0. Future passes could extend `LAW_*` and `REF_*` docs with a similar 4-bullet header (what this doc controls / when to trust it / what supersedes it / what it must NOT be used for).                                       |
| Three engine renderers exist; no doc names them as such                         | high     | This doc closes the gap. Cross-refs from `REF_SYSTEM_STATE.md` § Map Stack and `PLAN_MAP_UNIFICATION_2026-05-08.md` §1 should point here on next touch.                                                                                                      |
| State-authority matrix not captured anywhere centrally                          | high     | This doc closes the gap with §4. If owner wants a permanent home, extract to `REF_STATE_AUTHORITY_MATRIX.md` post-launch.                                                                                                                                    |

### 6.2 Doc proliferation guardrail

ChatGPT's six-new-docs proposal was rejected (relay reply, this session) on
the grounds that it would fragment authority. This doc consolidates the two
genuine gaps (state-authority matrix + map runtime topology) into a **single
new REF doc** rather than spawning multiple parallel authority surfaces.

If post-launch evidence shows §4 (state authority) needs its own home (e.g.
the matrix grows beyond 20 keys, or sign-out hygiene becomes a recurring KI
cluster), promote §4 to `REF_STATE_AUTHORITY_MATRIX.md` then. Until then,
**one doc is enough**.

---

## §7. Convergence Candidates Summary

| ID  | Concern                                          | Status                                            | Risk                | Recommended Phase  |
| --- | ------------------------------------------------ | ------------------------------------------------- | ------------------- | ------------------ |
| C1  | Three MapLibre engine instantiations             | `DUPLICATE`, `OWNER-GATED`                        | `STRUCTURAL-RISK`   | POST-LAUNCH        |
| C2  | `MapLibreDashboardMapPreview` not in PLAN        | `DEFERRED`, drift artifact                        | low                 | PLAN doc update    |
| C3  | Two navigation orchestration patterns            | `DUPLICATE`, `OWNER-GATED`                        | `STRUCTURAL-RISK`   | POST-LAUNCH        |
| C4  | `bidondent_navigation_state` vs `_session` collision | naming-overlap, no active bug                  | low                 | DEFERRED           |
| C5  | Cleanup-policy unevenness across storage keys    | partial coverage                                  | low                 | DEFERRED           |
| C6  | Status-tag vocabulary not standardized           | doc inconsistency                                 | low                 | SAFE-AUTOPILOT     |
| C7  | "AI operational onboarding" header pattern       | adopted here, not propagated                      | low                 | SAFE-AUTOPILOT     |
| C8  | PLAN_MAP_UNIFICATION needs 4 §-level updates     | drift                                             | low                 | OWNER-GATED        |

**Highest-leverage post-launch pass:** C1 (engine consolidation onto
`MapEngineCanvas`). Reduces engine count from 3 → 1, retroactively gives
dashboard preview + immersive surface the same patches and performance
tracking, and closes PLAN_MAP_UNIFICATION's central architecture target.

**Highest-leverage hardening-scope pass:** C2 (PLAN doc update) and C7
(onboarding-header propagation). Both `SAFE-AUTOPILOT`, both improve future
AI agent execution quality without runtime change.

---

## §8. Provenance

- **Audit pass:** Pass 213 (2026-05-09).
- **Method:** read-only file inventory + grep-based usage tracing. No runtime
  validation, no browser audit, no git history archaeology beyond commit
  references already in code/doc comments.
- **Authorization:** owner relay 2026-05-09 ("authorized to fully execute Phase A
  and controlled portions of Phase B").
- **Scope discipline:** zero runtime files modified during this audit. Only
  artifact: this doc.
- **Co-update obligations triggered:** none yet (this doc is purely additive).
  If subsequent passes act on §5 recommendations, PLAN_MAP_UNIFICATION must
  update in the same pass per LAW co-update rule.

---

**Next safe autopilot pass after this commit:** propagate the §0 onboarding
header pattern to one or two REF docs that lack it (e.g. `REF_SYSTEM_STATE.md`,
`REF_KNOWN_ISSUES.md`) under a separate small commit. Anything beyond that —
PLAN doc updates, status-tag vocabulary rollout, structural collapse —
requires explicit owner direction.
