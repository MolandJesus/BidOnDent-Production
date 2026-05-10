---
status: CANONICAL
authority: REFERENCE
scope: navigation-orchestration-authority
canonical_source_of_truth: REF_NAVIGATION_AUTHORITY_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Authority map for navigation state — who owns route, ETA, reroute, GPS, lifecycle across the two orchestration hosts.
last_updated: 2026-05-09
---

# Navigation Orchestration Authority Audit (2026-05-09)

> Block C / Pass 224 deliverable. Read-only audit. No runtime changes.
>
> Companion to:
>
> - [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) — Pass 223 engine inventory
> - [`PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) §11 — orchestration convergence (DEFERRED until renderer convergence completes)
> - [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) § 5.5 — client-side state authority matrix
>
> Pairs with Pass 223. Pass 226 lifecycle contract draft will use both
> outputs as input.

---

## §1. Headline finding

The repo has **two parallel navigation orchestration hosts**, not one:

| Orchestration host                     | File                                                                                     | Lines | Composes                                                                                                                                                                                                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Host A — Coverage navigation**       | [`useCoverageNavigationExperience`](../src/app/hooks/useCoverageNavigationExperience.ts) | 300   | `useNavigationAddressSearch` + `useNavigationGpsTracking` + `useNavigationRoutePreview`                                                                                                                                              |
| **Host B — Shop directory navigation** | [`useShopDirectoryNavigation`](../src/app/hooks/useShopDirectoryNavigation.ts)           | 542   | `useNavigationIntelligence` + `useNavigationSession` + `useNavigationReroute` + `useNavigationGpsTracking` + `useNavigationRoutePreview` + `useNavigationLifecycleEffects` + `useNavigationVoiceAlerts` + `useNavigationToastBridge` |

**Asymmetry:** Host B uses 8 navigation hooks. Host A uses 3. Host A
does NOT consume `useNavigationSession`, `useNavigationReroute`,
`useNavigationLifecycleEffects`, voice alerts, or the toast bridge.

This means **the coverage map runs a structurally different navigation
runtime than the shop directory runs**, despite both surfaces presenting
themselves to users as "navigation". The two hosts share only the lower-
level GPS + route preview primitives.

Convergence implication: orchestration unification is not a "merge two
near-identical hosts" problem. It is a "promote Host B's contract to
canonical, and decide whether Host A needs to grow into it or whether
the coverage surface should explicitly be Tier B (preview, not live
nav)" problem. See § 6.

---

## §2. Authority map per concern

### 2.1 Active route geometry

| Concern                                     | Owner                                                                                             | Storage                         | Notes                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Active route preview (geometry, steps, ETA) | [`useNavigationRoutePreview`](../src/app/hooks/useNavigationRoutePreview.ts) `routePreview` state | React state (per host instance) | Both Host A and Host B instantiate this independently — two parallel route states can exist if both surfaces are mounted |
| Route alternatives                          | Same hook, `routeAlternatives` state                                                              | React state (per host instance) | Same dual-instance risk                                                                                                  |
| Selected route index                        | Same hook, `selectedRouteIndex` prop in                                                           | Caller-controlled               | Caller picks; hook honors                                                                                                |
| Route fetch trigger                         | `useEffect` in `useNavigationRoutePreview` watching origin/destination keys                       | n/a                             | Refetch is keyed; reroute coordination via `suppressOffRouteRefetch` flag                                                |

**Finding:** No central authority for "the active route". Each orchestration
host owns its own copy of the same hook. There is no cross-host coordination.
If both hosts are mounted simultaneously (e.g. coverage + shop dir on the
same screen — not currently triggered, but possible) they would issue
independent OSRM requests for the same destination.

### 2.2 Navigation session lifecycle (idle / planning / active / paused / ended)

| Concern                             | Owner                                                                                                                  | Storage                                              | Notes                                                                                                                                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Session status machine              | [`useNavigationSession`](../src/app/features/navigation/useNavigationSession.ts) reducer (`reduceSession`)             | React state + Supabase cloud + per-user localStorage | **Host B only.** Host A does not instantiate this hook.                                                                                                                                    |
| Session transitions                 | Action creators on the hook (`startPlanning`, `selectRoute`, `activate`, `pause`, `resume`, `end`, `reset`)            | Reducer-dispatched                                   | Pure transitions in `reduceSession`                                                                                                                                                        |
| Cross-tab cloud sync                | [`navigationSessionCloudService`](../src/app/services/navigation/navigationSessionCloudService.ts)                     | Supabase + per-user localStorage                     | Per-user keys: `bidondent_nav_session_*`, `bidondent_nav_active_session_*`, `bidondent_nav_pending_writes`, `bidondent_nav_cloud_unavailable` (per REF_SYSTEM_STATE § 5.5.1)               |
| Pre-session external launch payload | [`navigationSession.ts` service](../src/app/services/navigation/navigationSession.ts) (legacy, separate from the hook) | localStorage key `bidondent_navigation_session`      | **Distinct from the hook above.** This is the OLD payload-handoff mechanism for opening Apple/Google/Waze. The naming collision (note the prefix) was flagged in REF_SYSTEM_STATE § 5.5.4. |

**Critical finding:** The string "navigation session" denotes **two different
concepts** in the codebase:

1. The reducer-managed in-app session (`useNavigationSession` hook,
   feature folder, cloud-synced via `navigationSessionCloudService`).
2. The legacy external-handoff payload (`navigationSession.ts` service,
   global `bidondent_navigation_session` localStorage key, used to remember
   the destination when the user bounces out to an external map app).

These are owned by different layers, have different lifetimes, different
cleanup discipline, and DIFFERENT prefixed-but-similarly-named storage
keys. Future convergence work MUST disambiguate the two before modifying
either.

### 2.3 Reroute decision-making

| Concern               | Owner                                                                                                                       | Storage                            | Notes                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Reroute gating policy | Pure function [`shouldTriggerReroute`](../src/app/features/navigation/shouldTriggerReroute.ts) — Pass 205 regression-locked | n/a                                | Single canonical gating policy                                                                |
| Reroute orchestration | [`useNavigationReroute`](../src/app/features/navigation/useNavigationReroute.ts)                                            | React state + ref-tracked cooldown | **Host B only.** Host A relies on `suppressOffRouteRefetch=false` default and ad-hoc refetch. |
| Deviation detection   | [`detectDeviation`](../src/app/features/navigation/detectDeviation.ts) + `useNavigationIntelligence`                        | n/a (computed)                     | Feeds reroute hook                                                                            |

**Finding:** Per `REF_CONVERGENCE_TOPOLOGY_2026-05-09.md` § 3 the reroute
subsystem is canonical. Pass 224 confirms: the **gating policy is
canonical**, but **the orchestration of the gate is Host B-only**. Host A's
reroute story is "OSRM refetches whenever the origin key changes" — there
is no cooldown, no deviation gate, no toast/voice surface for the user.

### 2.4 GPS tracking

| Concern                                  | Owner                                                                      | Storage                  | Notes                              |
| ---------------------------------------- | -------------------------------------------------------------------------- | ------------------------ | ---------------------------------- |
| Live position + heading + speed          | [`useNavigationGpsTracking`](../src/app/hooks/useNavigationGpsTracking.ts) | React state per instance | Both Host A and Host B instantiate |
| GPS accuracy + status (Strong/Weak/Lost) | Same hook, derived                                                         | React state per instance | Same dual-instance risk as routes  |
| Speed limit fetch                        | [`speedLimit.ts`](../src/app/services/navigation/speedLimit.ts)            | n/a                      | Network-driven                     |

**Finding:** GPS is the most-shared primitive — both hosts use it identically.
But like routes, dual instantiation means dual `watchPosition` subscriptions
if both hosts are mounted. Browser may de-duplicate, but no hook-level
guarantee.

### 2.5 Voice + toast surfaces

| Concern      | Owner                                                                                    | Storage            | Notes           |
| ------------ | ---------------------------------------------------------------------------------------- | ------------------ | --------------- |
| Voice alerts | [`useNavigationVoiceAlerts`](../src/app/features/navigation/useNavigationVoiceAlerts.ts) | n/a                | **Host B only** |
| Toast bridge | [`useNavigationToastBridge`](../src/app/features/navigation/useNavigationToastBridge.ts) | n/a (Sonner toast) | **Host B only** |

**Finding:** The coverage navigation experience produces NO voice and NO
toasts. The shop directory navigation experience produces both. From the
user's perspective, navigation in the coverage surface is silent and
chrome-less compared to shop directory navigation.

### 2.6 Lifecycle effects (resize, visibility, page leave, wake-lock)

| Concern                  | Owner                                                                                | Storage | Notes           |
| ------------------------ | ------------------------------------------------------------------------------------ | ------- | --------------- |
| Lifecycle effects bundle | [`useNavigationLifecycleEffects`](../src/app/hooks/useNavigationLifecycleEffects.ts) | n/a     | **Host B only** |

**Finding:** Coverage navigation has no centralized lifecycle effects
hookup. If a user backgrounds the tab during coverage navigation, none
of the wake-lock / visibility coordination kicks in.

### 2.7 Address search

| Concern       | Owner                                                                          | Storage                  | Notes                                                                                           |
| ------------- | ------------------------------------------------------------------------------ | ------------------------ | ----------------------------------------------------------------------------------------------- |
| Origin search | [`useNavigationAddressSearch`](../src/app/hooks/useNavigationAddressSearch.ts) | React state per instance | Both hosts instantiate (Host A once for origin; Host B's session hook instantiates per surface) |

### 2.8 Discovery places

| Concern          | Owner                                                                                                                                                        | Storage                                         | Notes                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------- |
| Discovery places | [`useNavigationDiscoveryPlaces`](../src/app/hooks/useNavigationDiscoveryPlaces.ts) + [`placeDiscovery.ts`](../src/app/services/navigation/placeDiscovery.ts) | React state + module-level diagnostics counters | Coverage-side concern; not used by shop dir hosts |

---

## §3. Camera authority cross-cut with renderer engines

Combining § 2 above with `REF_MAP_RENDERER_INVENTORY_2026-05-09.md` § 4.3
(camera authority models) gives a 2×3 authority grid:

|                                                | Engine 1 (`MapEngineCanvas`)                                                                                                                       | Engine 2 (`ShopDirectoryMapPane`)                                                                                                                    | Engine 3 (`DashboardMapPreview`)                                                                                                            |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Host A (`useCoverageNavigationExperience`)** | ✓ canonical pairing — coverage surface mounts Engine 1 via `MapLibreServiceCoverageMap`. Camera mutation = revision-keyed declarative controllers. | n/a (not paired)                                                                                                                                     | n/a (preview surface, no live nav)                                                                                                          |
| **Host B (`useShopDirectoryNavigation`)**      | n/a (not paired)                                                                                                                                   | ✓ canonical pairing — shop directory surface mounts Engine 2. Camera mutation = imperative `useMap()` inside `MapLibreShopDirectoryViewportManager`. | n/a (preview surface, no live nav)                                                                                                          |
| **No host (preview-only)**                     | n/a                                                                                                                                                | n/a                                                                                                                                                  | ✓ Engine 3 used by 6 dashboard/report callers. Camera = controlled `viewState` + parent `useEffect` overrides. No navigation orchestration. |

**Cross-cut finding:** Each renderer engine has exactly one orchestration
host, and the two pairings use INCOMPATIBLE camera authority models
(declarative-revision vs imperative-useMap). Engine 3 has no host (it's
a Tier B preview).

This 1:1 host-to-engine pairing is the deepest reason renderer convergence
is genuinely hard: collapsing Engines 1 + 2 into one engine forces a
camera-authority decision that ripples back through the navigation
orchestration layer.

---

## §4. Storage authority cross-cut

Per `REF_SYSTEM_STATE.md` § 5.5.1 the navigation cluster has 10 keys.
Cross-referenced with the orchestration hosts:

| Key                                                       | Written by                                                                          | Read by                   | Cleared by                      |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------- | ------------------------------- |
| `bidondent_navigation_state` (UI viewMode)                | `useNavigation` (`hooks/useNavigation.ts`)                                          | App.tsx routing           | NOT swept                       |
| `bidondent_navigation_session` (external handoff payload) | `navigationSession.ts` legacy service                                               | external-launch flows     | NOT swept                       |
| `bidondent_navigation_preferences`                        | `navigationPreferences.ts`                                                          | both hosts indirectly     | retained                        |
| `bidondent_navigation_discovery_role`                     | `discoveryPreferences.ts`                                                           | Host A discovery          | retained                        |
| `bidondent_navigation_parked_car`                         | `parkedCarLocation.ts`                                                              | both hosts indirectly     | retained                        |
| `bidondent_navigation_saved_locations`                    | `savedLocations.ts`                                                                 | both hosts                | retained                        |
| `bidondent_nav_session_*` (per-user)                      | `navigationSessionCloudService` writes from Host B's `useNavigationSession` reducer | Host B hydration on mount | `clearStalePlanningNavSessions` |
| `bidondent_nav_active_session_*` (per-user)               | Same                                                                                | Same                      | `clearAllUserScopedSessionKeys` |
| `bidondent_nav_pending_writes`                            | Same                                                                                | Same                      | `clearAllUserScopedSessionKeys` |
| `bidondent_nav_cloud_unavailable`                         | Same                                                                                | Same                      | `clearAllUserScopedSessionKeys` |

**Finding:** The cloud-synced session cluster (`bidondent_nav_*` per-user)
serves Host B exclusively. Host A persists nothing about its in-progress
navigation. If a user is mid-coverage-navigation and reloads, the route
preview is gone; if a user is mid-shop-directory-navigation and reloads,
the session restores from cloud.

This asymmetry is invisible in the UI but real in the runtime. Pass 226
lifecycle contract should make a deliberate decision about whether Host A
inherits the cloud-synced session, or whether the coverage surface is
explicitly classified as Tier B (preview-only, ephemeral) and never
resumes.

---

## §5. Mental-model continuity table

For an AI agent or new engineer trying to understand "navigation" in this
codebase:

| Claim                                | True for Host A?               | True for Host B?                      |
| ------------------------------------ | ------------------------------ | ------------------------------------- |
| There is an active route             | ✓ (in-memory only)             | ✓ (in-memory + reducer-tracked)       |
| There is a session lifecycle         | ✗                              | ✓                                     |
| Reroute is gated by deviation policy | ✗ (refetches on origin change) | ✓ (`shouldTriggerReroute` + cooldown) |
| Voice prompts fire                   | ✗                              | ✓                                     |
| Toasts fire                          | ✗                              | ✓                                     |
| Wake-lock + visibility tied in       | ✗                              | ✓                                     |
| State survives reload                | ✗                              | ✓ (cloud sync)                        |
| Camera mutation is declarative       | ✓ (revision-keyed controllers) | ✗ (imperative `useMap()`)             |
| Engine pairing                       | Engine 1                       | Engine 2                              |

**Implication:** "Navigation" in BidOnDent does not mean one thing. It
means one of two things depending on which surface the user is on. This
should be made explicit in REF docs and the eventual lifecycle contract.

---

## §6. Findings summary + hand-off to Pass 225

1. **Two orchestration hosts, structurally different.** Host B is the
   "full" navigation runtime; Host A is a strict subset. They share the
   lower-level GPS + route preview primitives, nothing else.
2. **One-to-one host-to-engine pairing** with incompatible camera
   authority models is the deepest convergence blocker, deeper than
   either renderer count or hook count alone.
3. **The string "navigation session" denotes two different concepts**
   (in-app reducer hook vs legacy external-handoff payload). Disambiguate
   before modifying either.
4. **Reroute gating policy is canonical;** orchestration of the gate is
   Host B-only.
5. **Cloud-synced session is Host B-only.** Coverage navigation does not
   survive reload. This is silent today; it should become an explicit
   tier classification in Pass 227.
6. **GPS is dual-instantiated risk** if both hosts mount simultaneously
   (not currently triggered).
7. **Naming collision risk** between `bidondent_navigation_state` (UI),
   `bidondent_navigation_session` (legacy external), and the
   `bidondent_nav_session_*` (per-user reducer) cluster — flagged in
   REF_SYSTEM_STATE § 5.5.4 and reaffirmed here.

**Hand-off to Pass 225:** dashboard-preview duplication analysis. Pass 225
will look at WHY the 6 callers of `MapLibreDashboardMapPreview` exist as
separate consumers and what the smallest shared contract would be. With
Pass 223 + Pass 224 in hand, Pass 225 has the engine + orchestration
context needed to scope that collapse safely.
