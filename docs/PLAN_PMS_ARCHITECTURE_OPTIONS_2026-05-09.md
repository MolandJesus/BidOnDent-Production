---
status: ACTIVE
authority: PLAN
scope: persistent-map-session-planning
canonical_source_of_truth: PLAN_PMS_ARCHITECTURE_OPTIONS_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Pass 259 of the PMS planning lane. Decision substrate for the eventual PMS implementation pass — evaluates six architecture patterns (shell singleton, hidden-root persistence, preserved subtree, portal transfer, detached renderer, hybrid persistence) against twelve scoring axes (route authority, React correctness, WebGL lifecycle, memory lifetime, reduced-motion continuity, performance gates G1-G4, rollback complexity, instrumentation compatibility, migration sequencing, semantic-risk surface, app-shell location compatibility, PMS-impacted controller bridge cost). Recommends the hybrid persistence pattern hosted at the post-Clerk app-shell boundary as the lowest-blast-radius/highest-payoff option. Doc-only — no source touched.
last_updated: 2026-05-09
---

# PMS Architecture Options Matrix — 2026-05-09

> **Tier:** PLAN. Future direction, not current truth.
> **Authority:** Pass 259 of the PMS Planning lane (owner-authorized
> 2026-05-09).
>
> **Companion docs (siblings in this lane):**
>
> - [`PLAN_PMS_TOPOLOGY_AUDIT_2026-05-09.md`](PLAN_PMS_TOPOLOGY_AUDIT_2026-05-09.md) — Pass 258 substrate
> - [`REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md`](REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md) — Pass 261 measurement methodology
> - [`PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md`](PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md) — Pass 260 sequencing (companion to this matrix)
>
> **This pass:** doc-only. **Recommends a winning option** but does
> NOT pre-commit it as a runtime decision — owner authorization is
> required before any implementation work is scheduled.
>
> **Hard rule (lane discipline):** if behavior could plausibly change,
> STOP and characterize instead of modifying. This matrix proposes
> nothing implementable.

---

## §1 — Mission

Six well-known patterns exist for keeping a React-hosted resource
alive across route changes. The PMS lane needs a clear-eyed
comparison so the eventual implementation lane can pick a path
without re-litigating the option space.

This matrix evaluates each pattern against the constraint surface
the prior PMS-planning passes locked:

- **G1-G4** (the four owner performance gates from Pass 257 §163,
  re-stated in Pass 261 §2)
- **PMS-impacted controllers** (Pass 258 §9 — four imperative
  camera controllers whose effect-dep keying changes meaning under
  PMS)
- **Performance-tracking lifetime shift** (Pass 258 §8, Pass 261
  §3.1) — mount-scoped → session-scoped sample window
- **Locked Tier B branch semantics** (Pass 258 §11, Pass 246/256
  invariants — autoFit / callerBoundsExplicit / reduced-motion
  continuity may not regress)
- **App-shell location candidates** (Pass 258 §15 — four candidate
  PMS roots)
- **Owner-dirty exclusion** (`ShopMapWidget` is untouchable until
  released)
- **Hidden-host-of-Engine-2 split** (Pass 258 §1, §11 — Engine 2
  is Phase-2-deferred; PMS Phase 1 targets E1 + E3 only)

The matrix produces:

1. A **per-option scorecard** across 12 axes (§3).
2. A **per-axis recommendation** for which option each axis prefers (§4).
3. An **integrated recommendation** with an explicit dissent log (§5).
4. The **forward constraints** the chosen option must satisfy in
   Pass 260 sequencing (§6).
5. A **risk register** of issues each option introduces (§7).

Architecture choice is owner-decided. This matrix supplies the
decision substrate, not the decision itself.

---

## §2 — The six options

Brief descriptions; full evaluation in §3.

### O1 — Shell singleton

One MapLibre `Map` instance lives at the app shell. Every route
that needs map content renders a "slot" component that references
the singleton via context. Sources/layers/controllers mount as
*children* of the singleton and toggle visibility per-route.

Mental model: one engine, many overlays.

### O2 — Hidden-root persistence

The MapLibre `Map` instance is mounted at the app root inside a
hidden container (positioned off-screen or under `display:
none`). When a route needs the map, a slot in the route tree is
*moved* into the visible position via DOM repositioning or a
portal. The map's React tree stays at the root.

Mental model: one engine, two viewports — the "real" off-screen
host and the visible slot.

### O3 — Preserved subtree

A designated map-bearing subtree is kept mounted across route
changes. Routes that don't need a map render adjacent siblings;
routes that do, render alongside the preserved subtree. The
router becomes structure-aware: it never unmounts the map subtree.

Mental model: routing is overlay-on-stable-trunk, not
mount/unmount-per-route.

### O4 — Portal transfer

The `Map` instance is mounted to a portal target at the app
shell. Each route declares a portal *destination* via a ref.
Route entry calls `ReactDOM.createPortal` (or equivalent) to move
the map's React tree into the route's destination. Engine state
persists because the React node never unmounts — only its DOM
parent changes.

Mental model: same engine, different DOM landlords.

### O5 — Detached renderer

The MapLibre `Map` instance is created imperatively (outside
react-map-gl) at the app shell. React renders a `<div>` slot at
each map-bearing route; the engine's canvas is moved into the
active slot via DOM `appendChild`. React owns the slot, the
engine owns the canvas, and a thin imperative bridge owns the
hand-off.

Mental model: React schedules; the engine survives.

### O6 — Hybrid persistence

Per-engine: E1 (`MapLibreServiceCoverageMap`) gets persistence
(O1, O2, or O3 as sub-choices); E3
(`MapLibreDashboardMapPreview`) stays mount-per-site (no
persistence; Tier B previews remain short-lived chrome). E2
(`MapLibreShopDirectoryMapPane`) stays out-of-scope per Phase 2
deferral.

Mental model: persistence-when-it-pays, mount-as-usual elsewhere.

---

## §3 — The matrix (12 axes × 6 options)

Each cell scores: **GOOD** / **OK** / **RISK** / **HARD-STOP**.
Cells with RISK or HARD-STOP carry a brief justification; cells
with GOOD or OK justify only when the reason isn't obvious from
the option's design.

### §3.1 Axis 1 — Route authority

> Does the option preserve hash-route + auth-state-driven routing
> as it works today (per Pass 258 §3)? PMS must not require React
> Router introduction.

| Option | Score | Notes                                                                                                |
| ------ | ----- | ---------------------------------------------------------------------------------------------------- |
| O1     | GOOD  | Routing unchanged; only the slot component dispatch changes.                                          |
| O2     | OK    | Routing unchanged; the off-screen host is route-agnostic.                                             |
| O3     | RISK  | Routing must learn which subtrees to preserve. Implies refactoring `DashboardRouter` dispatch shape. |
| O4     | GOOD  | Routing unchanged; portal targets are declarative refs.                                               |
| O5     | GOOD  | Routing unchanged; engine is React-agnostic by design.                                                |
| O6     | GOOD  | Per-engine; routing impact is whichever sub-pattern the persistent engine uses.                       |

### §3.2 Axis 2 — React correctness

> Does the option produce predictable React semantics? React's
> mental model around mount/unmount/effect cleanup must remain
> intact for the rest of the app.

| Option | Score      | Notes                                                                                                                                                                 |
| ------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O1     | GOOD       | Pure React; singleton lives at shell, slot is a normal child.                                                                                                          |
| O2     | RISK       | DOM repositioning bypasses React reconciliation. Layout assumptions can drift; CSS ancestry changes affect cascade. Hidden-host trick has historical foot-gun reputation. |
| O3     | GOOD       | Pure React; routing dispatches into preserved trees.                                                                                                                   |
| O4     | OK         | `createPortal` is supported but moving an existing portal between targets requires unmounting and re-mounting the portal — defeats the purpose unless carefully wrapped. |
| O5     | RISK       | Imperative bridge sits beside React; effect-cleanup contracts diverge. Higher cognitive cost.                                                                          |
| O6     | GOOD/OK    | Inherits sub-pattern's score; if the persistent engine uses O1, this is GOOD.                                                                                          |

### §3.3 Axis 3 — WebGL lifecycle stability

> Does the option preserve a single, healthy GL context across
> the session? Critical for performance gate G3 (≤1 GL context
> creation per session) and G4 (no map re-init on route change).

| Option | Score      | Notes                                                                                                                                                  |
| ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| O1     | GOOD       | Singleton means one GL context; never disposed except at session end.                                                                                   |
| O2     | OK         | One GL context, but DOM moves can trigger MapLibre `resize()` cascades; CSS `display: none` is known to cause GL canvas size loss → resize crash potential (note: Pass 258 §8 already cites the resize patch as a precondition). |
| O3     | GOOD       | Subtree persistence keeps the canvas in the same DOM ancestry; clean resize path.                                                                       |
| O4     | RISK       | Each portal target swap may destroy/recreate the canvas DOM if the portal API isn't careful; potential GL context loss on swap.                         |
| O5     | OK         | Engine owns the canvas explicitly; bridge can ensure single context, but `appendChild` moves between slots can corrupt MapLibre internal layout state. |
| O6     | GOOD       | Same as sub-pattern; with E1 persistent, GL count drops from 4-6/session to 1.                                                                          |

### §3.4 Axis 4 — Memory lifetime (mount-scoped → session-scoped)

> Pass 258 §10 / Pass 261 §6 both call out the lifetime shift as
> the core PMS implication. Does the option deliver
> session-scoped lifetime cleanly?

| Option | Score | Notes                                                                                                                          |
| ------ | ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| O1     | GOOD  | Singleton lives for session lifetime by definition.                                                                              |
| O2     | GOOD  | Off-screen host lives for session lifetime.                                                                                      |
| O3     | GOOD  | Preserved subtree lives for session lifetime.                                                                                    |
| O4     | OK    | Lifetime depends on portal API; React won't dispose if portal is wrapped with stable parent.                                     |
| O5     | GOOD  | Engine lives for session lifetime by design.                                                                                     |
| O6     | GOOD  | Same as sub-pattern.                                                                                                             |

### §3.5 Axis 5 — Reduced-motion continuity (Pass 256 invariants)

> Pass 256 added 5 reduced-motion preference-flip continuity
> tests. The chosen option must NOT introduce new code paths
> that bypass reduced-motion semantics for the persistent engine.

| Option | Score | Notes                                                                                                                                                |
| ------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| O1     | GOOD  | Reduced-motion is React-resolved at render; singleton's render passes through normally.                                                                |
| O2     | OK    | Same render path; risk is that DOM moves can trigger animations not gated by `prefers-reduced-motion` (e.g., browser's default scroll-into-view animation). |
| O3     | GOOD  | Pure React; no new motion paths.                                                                                                                       |
| O4     | GOOD  | Portal transfer keeps React rendering; reduced-motion paths intact.                                                                                    |
| O5     | RISK  | Imperative DOM moves can introduce browser-managed transitions outside React's reduced-motion gates. Must be explicitly suppressed.                   |
| O6     | GOOD  | Inherits sub-pattern.                                                                                                                                  |

### §3.6 Axis 6 — Performance gates (G1-G4 from Pass 257 §163)

> Each option's projected delivery on:
>
> - **G1** Lighthouse perf score (no regression)
> - **G2** instance count = 1
> - **G3** GL contexts ≤ 1
> - **G4** no map re-init on route change

| Option | G1   | G2   | G3   | G4   | Notes                                                                                                                            |
| ------ | ---- | ---- | ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------- |
| O1     | GOOD | GOOD | GOOD | GOOD | Singleton's design cost is a one-time at-shell cost; route-change perf becomes near-zero.                                          |
| O2     | OK   | GOOD | GOOD | GOOD | Hidden-host carries small steady-state cost; route entry pays a `resize` cost.                                                    |
| O3     | GOOD | GOOD | GOOD | GOOD | Subtree persistence has lowest steady-state cost; route entry pays a tab-content swap.                                            |
| O4     | OK   | OK   | OK   | OK   | Portal transfer cost is implementation-dependent; if portal swap is expensive, G1/G3 can regress at swap time.                    |
| O5     | OK   | GOOD | GOOD | OK   | DOM moves on route change cost more than React subtree swap; G1 regression possible if not carefully optimized.                   |
| O6     | GOOD | GOOD | GOOD | GOOD | E1 persistence delivers all four gates for the dominant route-host engine; E3 stays mount-per-site (Tier B chrome, low cost).    |

### §3.7 Axis 7 — Rollback complexity

> If the chosen option proves wrong, how hard is it to revert
> just the persistence layer without losing the rest of the
> change?

| Option | Score | Notes                                                                                                                |
| ------ | ----- | -------------------------------------------------------------------------------------------------------------------- |
| O1     | OK    | Removing the singleton + slot proxies is a surgical revert per route; ~20-50 lines of touch.                          |
| O2     | RISK  | Hidden host introduces DOM-layout fragility that's hard to fully unwind without regressing layout fixes made for it.   |
| O3     | RISK  | Routing refactor is a one-way door; reverting requires re-introducing per-route mount, which bleeds into screen code. |
| O4     | OK    | Portal infrastructure is removable; portal targets can become inline mounts again.                                    |
| O5     | RISK  | Imperative bridge becomes load-bearing for many call sites; partial revert is ugly.                                   |
| O6     | GOOD  | Per-engine isolation; can revert E1 persistence without touching E3 chrome.                                            |

### §3.8 Axis 8 — Instrumentation compatibility (Pass 261 §7-§8)

> Pass 261 §7 lists 4 measurement instruments + a candidate list.
> Does the option support these instruments without source
> changes beyond the implementation itself?

| Option | Score | Notes                                                                                                                                                              |
| ------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| O1     | GOOD  | Singleton + slot is the canonical place for `performance.mark` instrumentation at engine mount + dispose.                                                           |
| O2     | GOOD  | Hidden host is a clear hook point for instance-count + GL-context counters.                                                                                          |
| O3     | OK    | Preserved subtree is a normal React render; instrumentation goes wherever it goes without persistence-specific concern.                                              |
| O4     | OK    | Portal swaps are a natural mark point but the timing semantics differ across portal libraries; instrumentation can become library-specific.                          |
| O5     | RISK  | Imperative bridge is the right place for instance-count instrumentation; React-side counters need extra plumbing because the engine is not in React's tree.          |
| O6     | GOOD  | Per-engine; sub-pattern's instrumentation rules apply.                                                                                                               |

### §3.9 Axis 9 — Migration sequencing (incremental adoption)

> Can the option be rolled out engine-by-engine or
> route-by-route, or does it require a big-bang flip?

| Option | Score | Notes                                                                                                                                              |
| ------ | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| O1     | OK    | Singleton must be created at shell on day one; routes can be migrated incrementally to use the slot, but the engine pinning is up-front.            |
| O2     | OK    | Same — hidden host is up-front.                                                                                                                     |
| O3     | RISK  | Subtree preservation requires the routing refactor before any engine can persist; cannot be incremental at the engine level.                         |
| O4     | OK    | Portal infrastructure is up-front; route opt-ins can be incremental.                                                                                 |
| O5     | OK    | Bridge is up-front; per-engine adoption follows.                                                                                                     |
| O6     | GOOD  | Engine-by-engine is the explicit design. E1 first, E3 deferred forever (no need), E2 in Phase 2.                                                     |

### §3.10 Axis 10 — Semantic-risk surface

> Surface area where a small mistake could change runtime
> meaning. Smaller is better.

| Option | Score | Notes                                                                                                                                                  |
| ------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| O1     | OK    | Singleton's source/layer composition becomes route-driven; small wiring errors yield wrong overlays. Layer-list invariants needed.                       |
| O2     | RISK  | DOM repositioning has historical glitchiness; layout edge cases (z-index, transform, position: fixed) can change rendering subtly.                      |
| O3     | OK    | Routing refactor is one-time risk, then stable.                                                                                                          |
| O4     | RISK  | Portal swaps interact with focus management, ARIA, scroll restoration; subtle accessibility regressions possible.                                       |
| O5     | RISK  | Imperative bridge sits beside react-map-gl's `useMap()` context — the existing 7+ files using `useMap()` would need bridge-aware fallbacks. Real risk.   |
| O6     | OK    | Limits semantic-risk to the persistent engine's surface; E3 chrome stays unchanged.                                                                      |

### §3.11 Axis 11 — App-shell location compatibility (Pass 258 §15)

> Pass 258 §15 listed 4 candidate locations for the PMS root:
> (a) inside `DashboardLayout`, (b) `main.tsx` between
> `MotionConfig` and `GlobalErrorBoundary`, (c) inside `App.tsx`
> authenticated branch, (d) new `MapSessionProvider` between
> Clerk and `App`. Does the option work cleanly with each?

Locations summarized: **(a)** dashboard-only, **(b)** app-root,
**(c)** post-auth, **(d)** post-auth + new provider.

| Option | Best location  | Why                                                                                                                                                          |
| ------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| O1     | (c) or (d)     | Singleton needs auth boundary above it (so auth flip can clean it); (c) reuses existing tree, (d) adds a clean provider seam.                                  |
| O2     | (b)            | Hidden host benefits from app-root scope (survives auth flips and landing↔dashboard transitions); but auth-boundary preservation is a *con* for sign-out flows. |
| O3     | (a) or (c)     | Subtree preservation only matters where routing changes happen; dashboard-internal routing benefits most from this.                                            |
| O4     | (b) or (d)     | Portal target needs to be highest-stable-ancestor of all routes that consume it.                                                                                |
| O5     | (b)            | Imperative bridge is most natural at app root.                                                                                                                  |
| O6     | (c) or (d)     | Per-engine; the persistent engine's location follows its sub-pattern's preference.                                                                              |

### §3.12 Axis 12 — PMS-impacted controller bridge cost (Pass 258 §9)

> Pass 258 §9 lists 4 imperative camera controllers whose
> "first-mount" semantics shift under PMS. How much controller
> rewrite does each option require?

| Option | Score | Notes                                                                                                                                                                       |
| ------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O1     | OK    | Controllers must distinguish "first-mount" from "first-active-route"; one new key per controller (~4 keys × ~10 lines = ~40 lines of controller change).                     |
| O2     | OK    | Same controller change.                                                                                                                                                      |
| O3     | OK    | Same.                                                                                                                                                                        |
| O4     | OK    | Same.                                                                                                                                                                        |
| O5     | RISK  | Controllers use `useMap()` from react-map-gl context; if engine is detached, the context is empty — controllers need a bridge-context shim. Significantly more work.        |
| O6     | OK    | Inherits sub-pattern.                                                                                                                                                        |

### §3.13 Aggregate scorecard

| Option | Axes-good | Axes-OK | Axes-risk | Hard-stops | Net                                                          |
| ------ | --------- | ------- | --------- | ---------- | ------------------------------------------------------------ |
| O1     | 8         | 4       | 0         | 0          | Strong but commits to up-front shell singleton on day one.   |
| O2     | 4         | 4       | 4         | 0          | Persistence works but DOM-foot-gun risk is real.             |
| O3     | 6         | 3       | 3         | 0          | Strong runtime profile, but routing refactor is a one-way door. |
| O4     | 3         | 6       | 3         | 0          | Middle-of-the-road; portal infrastructure carries cost.        |
| O5     | 3         | 3       | 6         | 0          | Highest theoretical performance; highest semantic risk.        |
| **O6** | **9**     | **3**   | **0**     | **0**      | **Recommended (§5).** Per-engine isolation makes every axis at-least-OK; engine-by-engine sequencing matches the existing tier discipline. |

---

## §4 — Per-axis preferred option

Quick reference for which option each axis prefers (when isolated):

| Axis                                | Prefers          |
| ----------------------------------- | ---------------- |
| Route authority                     | O1, O4, O5, O6   |
| React correctness                   | O1, O3, O6       |
| WebGL lifecycle stability           | O1, O3, O6       |
| Memory lifetime                     | O1, O2, O3, O5, O6 |
| Reduced-motion continuity           | O1, O3, O4, O6   |
| Performance gates G1-G4             | O1, O3, O6       |
| Rollback complexity                 | O6               |
| Instrumentation compatibility       | O1, O2, O6       |
| Migration sequencing (incremental)  | O6               |
| Semantic-risk surface               | O1, O3, O6       |
| App-shell location compatibility    | tied             |
| Controller bridge cost              | O1, O2, O3, O4, O6 |

**O6 wins or ties on every axis.** That's the consequence of being
a meta-option — it inherits the best sub-pattern per engine. The
real question is *which sub-pattern* O6 uses for E1.

Among E1 candidate sub-patterns: **O1 (shell singleton)** is the
best on 8/12 axes; **O3 (preserved subtree)** is the best on 6/12
but has a routing-refactor downside; **O2** has a known DOM
foot-gun history.

---

## §5 — Integrated recommendation

### §5.1 Recommended option

**O6 — Hybrid persistence, with E1 using sub-pattern O1 (shell singleton), hosted at Pass 258 §15 location (c) or (d).**

Composition:

- **E1 (`MapLibreServiceCoverageMap`):** lifted to a shell-level
  singleton via O1, mounted once at the post-auth app shell.
  Three call sites (landing, coverage dialog, active-nav layout)
  become slot consumers that select layer composition + viewport
  via context.
- **E3 (`MapLibreDashboardMapPreview`):** stays mount-per-site.
  Tier B previews are short-lived chrome, not route hosts —
  applying PMS to them would incur React-tree complexity for no
  meaningful GL count or session-window benefit.
- **E2 (`MapLibreShopDirectoryMapPane`):** Phase-2-deferred per
  Pass 258 §11. Out of this matrix's scope.

**Recommended host location:** Pass 258 §15 candidate **(d)** —
new `MapSessionProvider` between Clerk and `App`. Reasons:

- Cleanest separation of concerns (one component owns the
  singleton's mount + context).
- Clean tear-down on auth flip (provider can listen to Clerk's
  session signal and dispose the engine on sign-out).
- Avoids `main.tsx` modification (lower-blast-radius change).
- Naturally compatible with the four PMS-impacted controllers'
  re-keying (controllers receive a `routeActiveAt` timestamp from
  context).

### §5.2 Why not O1 by itself

O1 by itself would also persist E3, which has no payoff (Tier B
chrome) and adds React-tree complexity. The composability win of
O6 is precisely that it scopes persistence to where it pays.

### §5.3 Why not O3 (preserved subtree)

O3's runtime profile is competitive with O1, but it requires a
routing refactor — `DashboardRouter` would need to learn which
route trees it must keep mounted. That's a one-way door and a
bigger change than the rest of the proposal. O6/O1 doesn't
demand it.

### §5.4 Why not O5 (detached renderer)

O5 has the strongest theoretical performance ceiling but the
worst semantic-risk profile. The 7+ files using `useMap()`
become bridge-dependent; controllers need shim contexts;
imperative DOM moves bypass React's reduced-motion gates. The
performance ceiling difference is small relative to O1's
delivery, and the risk is real.

### §5.5 Dissent log

These are arguments AGAINST the recommendation worth logging:

1. **O3 dissent — "Preserve subtree is more idiomatic React."**
   True. If the team prefers structural correctness over
   one-way-door cost, O3 is a defensible alternative. The
   recommendation favors O6/O1 because the routing today is
   stable and refactor cost is non-trivial.

2. **O1 dissent — "Why ever ship a singleton? It's a global."**
   True; singletons compose poorly with future architecture
   shifts. The PMS lane explicitly accepts this tradeoff because
   the engine is *the* expensive resource and the API surface
   for accessing it (slot + context) is small and reversible.

3. **O6 dissent — "Hybrid means more complexity."**
   True; the codebase has two persistence stories (E1 = singleton;
   E3 = mount-per-site). The recommendation accepts this because
   E3's per-site model is *already* working correctly post-Pass
   251 hardening, and there is no benefit to forcing it into
   the persistence pattern.

4. **Location dissent — "Why a new provider, not in `App.tsx`?"**
   New `MapSessionProvider` is preferred because it's
   single-responsibility and testable in isolation. Inlining into
   `App.tsx`'s authenticated branch would couple it to
   role-routing code that already does too much.

---

## §6 — Forward constraints for Pass 260 sequencing

If owner authorizes O6/O1 in location (d), Pass 260's execution
sequencing plan must order the work to satisfy these constraints:

1. **Resize patch import** ([`maplibreResizePatch`](../src/app/utils/maplibreResizePatch.ts))
   MUST run before the singleton's first construction. The
   `MapSessionProvider` file must import the patch as its first
   side-effect line.

2. **Gesture-mode source** (Pass 258 §6) becomes route-state-derived
   under PMS. A new "active route descriptor" field on the
   provider context: `{ cooperativeGestures: boolean }`. Each
   route declares its preference; the singleton consumes it.

3. **Performance-tracking lifetime semantics** (Pass 258 §8 / Pass
   261 §3.1) shift to session-scoped. Pass 260 must include the
   diagnostics-consumer re-evaluation explicitly:
   `PlannerDiagnosticsPanel` and `CoverageNavigationPlanner`
   either accept session windows or get an explicit window-reset
   on PMS route transition.

4. **Imperative camera controllers** (Pass 258 §9) need a
   `routeActiveAt` re-keying. Pass 260 must order: provider →
   controllers → controllers' tests → call-site updates.

5. **Tier B branch semantics** stay locked. Pass 260 must NOT
   touch `autoFit`, `callerBoundsExplicit`, or any Engine 3 prop
   contract. (The recommendation explicitly excludes E3 from
   PMS, which preserves these locks by construction.)

6. **CI invariants** from Passes 243, 246, 251, 254, 255, 256
   stay green. Pass 260 must confirm zero suite regressions at
   each step.

7. **Owner-dirty exclusion**: `ShopMapWidget` stays untouchable
   until released. The recommendation doesn't touch it (E3 stays
   per-site).

8. **Instrumentation gates**: Pass 261 §7 methodology becomes the
   PMS gate's verification protocol. Pass 260 must schedule the
   instrumentation work as a *before-implementation* phase (or
   confirm that a different measurement strategy is acceptable).

---

## §7 — Risk register

Issues the recommended option (O6/O1 in location (d)) introduces.
Each has a mitigation.

| #  | Risk                                                                                      | Severity | Mitigation                                                                                                                         |
| -- | ----------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| R1 | Singleton breaks tests that currently mount E1 freshly per test                            | MEDIUM   | Provider exposes a `__resetForTests` escape; vitest setup re-creates the provider per file.                                        |
| R2 | Layer composition shifts from host-driven to route-driven                                  | MEDIUM   | Pass 260 introduces a `<RouteMapLayers>` declarator API; routes opt into layers explicitly. Existing `<MapLibreCoverageMapLayers>` becomes a renderer that subscribes to the active route's layer set. |
| R3 | First-mount semantics change for 4 imperative controllers (Pass 258 §9)                    | MEDIUM   | Provider exposes `routeActiveAt` timestamp; controllers re-key from `[mount]` to `[routeActiveAt, ...other deps]`.                  |
| R4 | Performance window becomes session-scoped; diagnostics consumers may show stale window     | LOW      | Pass 260 includes the explicit diagnostics-consumer re-evaluation; either accept session window OR add `mapPerformance.resetWindow()` call on route transition. |
| R5 | Reduced-motion continuity tests (Pass 256) target current per-mount semantics              | LOW      | Tests pass under O6 because E3 (the reduced-motion-tested engine) stays mount-per-site. E1 will need its own reduced-motion continuity tests in Pass 260. |
| R6 | New `MapSessionProvider` file is a new architectural seam                                  | LOW      | Single-responsibility, tested in isolation; ~100 lines.                                                                              |
| R7 | Auth flip (sign-out) must dispose the singleton cleanly                                     | MEDIUM   | Provider listens to Clerk session signal; on `signOut`, `useEffect` cleanup disposes engine + clears context.                        |
| R8 | `react-map-gl` MapProvider context must wrap the singleton                                  | LOW      | Standard library pattern; provider includes the MapProvider wrapper.                                                                 |
| R9 | Route changes that don't include a map need a "no-map" slot mode                            | LOW      | Slot component renders nothing when route says no map; engine sits in `display: none` of the singleton container only when no consumer asks. |
| R10 | Demo-mode (Pass 258 §16) interaction unchanged but should be re-verified                   | LOW      | Pass 260 includes a demo-mode smoke pass.                                                                                            |

---

## §8 — What this matrix does NOT do

- Does NOT touch any production source.
- Does NOT touch any test.
- Does NOT pre-commit the recommendation as policy. Owner
  authorization required before Pass 260's sequencing plan
  proposes implementation timing.
- Does NOT propose Engine 2 (`MapLibreShopDirectoryMapPane`)
  unification — that is Phase-2-deferred.
- Does NOT modify `LAW_*` or `REF_*` documentation. Companion
  docs are referenced, not altered.
- Does NOT introduce new KIs / new doc tiers / new framework
  expansion beyond the explicit Pass 259 deliverable.
- Does NOT touch `ShopMapWidget` (owner-dirty).
- Does NOT change `autoFit` / `callerBoundsExplicit` / sub-pass
  C / Engine 3 internals / viewport / camera / gesture /
  reduced-motion / route-topology / orchestration / persistence
  semantics. The recommendation specifically scopes E3 OUT of
  PMS for this exact reason.

---

## §9 — Cross-references

- [`PLAN_PMS_TOPOLOGY_AUDIT_2026-05-09.md`](PLAN_PMS_TOPOLOGY_AUDIT_2026-05-09.md) — Pass 258 substrate; cited extensively in §1, §3, §6.
- [`REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md`](REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md) — Pass 261 measurement methodology; cited in §3.6, §3.8, §6.
- [`REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md`](REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md) — Pass 257 confidence baseline; gates G1-G4 source.
- [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) — engine inventory; cited in §1, §2.
- [`REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md`](REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md) — E3 camera authority semantics (the locks the recommendation preserves).
- [`PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) — predecessor unification plan.
- [`docs/LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md) — four-layer model.
- [`AI_LOCK.md`](../AI_LOCK.md) — current session coordination.

---

## §10 — Status

- **Drafted:** 2026-05-09 (Pass 259, Primary Builder AI for PMS planning).
- **Status:** ACTIVE matrix. Updates only when:
  - the topology substrate (Pass 258) changes,
  - a new option is proposed,
  - owner provides explicit guidance that re-weights an axis,
  - measurement (Pass 261 §7 methodology) replaces estimates with real numbers.
- **Authority:** PLAN. Subordinate to LAW_PROJECT_RULES,
  LAW_LAYERED_ARCHITECTURE, the active execution authority.
- **Owner approval required:** **TRUE.** Implementation must NOT
  begin without explicit owner authorization of the recommendation
  in §5.
- **Supersedes:** none.
- **Superseded by:** none.

**Next pass (260):** PMS execution sequencing plan. Builds on §6
forward constraints to produce a phased implementation order that
each phase carries: an explicit success criterion, a CI gate, a
rollback shape, and an owner approval point.
