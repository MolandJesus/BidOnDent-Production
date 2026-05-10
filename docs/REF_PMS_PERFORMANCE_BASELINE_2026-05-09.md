---
status: CANONICAL
authority: REFERENCE
scope: pms-performance-baseline
canonical_source_of_truth: REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 261 (PMS prep, non-overlapping support lane). Performance baseline characterization for the upcoming Persistent Map Session (PMS) architecture work. Documents the four owner-directed performance gates (Pass 257 §163), enumerates current map-init / WebGL / style / tile-request / cleanup boundaries per engine, defines the route-transition map-churn surface, and proposes a measurement methodology that works around jsdom's WebGL-blind environment. Audit-only — no production source or tests touched.
last_updated: 2026-05-09
---

# PMS Performance Baseline Characterization (Pass 261)

> **Lane:** PMS Preparation + Performance Characterization (NEW
> NON-COLLIDING SUPPORT LANE per owner relay 2026-05-09).
>
> **Position relative to the parallel Audit AI session:** that
> session has forward-claimed Passes 258 / 259 / 260 for
> `PLAN_PMS_TOPOLOGY_AUDIT`, `PLAN_PMS_ARCHITECTURE_OPTIONS`,
> `PLAN_PMS_EXECUTION_SEQUENCING`. Their lane covers the relay's
> P1 (topology) and P3 (architecture options). The relay's P2
> (performance baseline characterization / measurement substrate)
> is **not** in their claimed file set. This doc takes the P2
> sub-lane to maintain non-overlap.
>
> **Charter:**
> - **Allowed:** baseline reports, render-frequency
>   characterization, WebGL lifecycle audits, route churn
>   measurements, memory-lifetime analysis, instrumentation
>   matrices.
> - **NOT allowed:** any source change. Any test change. Any
>   modification to active-confidence files, autoFit, viewport,
>   camera, gesture, reduced-motion, orchestration, route
>   topology, ShopMapWidget, sub-pass C, Engine 2 authority,
>   Persistent Map Session implementation.
> - **Hard rule:** if behavior could plausibly change, STOP and
>   characterize instead of modifying.
>
> **This pass:** doc-only. Substrate for future authorized
> measurement, not the measurement itself.

---

## §1. Mission

Build the **measurement substrate** the eventual PMS architecture
work will use to verify success. Specifically:

1. Document the **four performance gates** committed by the
   parallel session in [`REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md`](REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md) §163.
2. Enumerate every **map-init / WebGL / style / tile-request /
   cleanup boundary** in the current renderer surface, so each
   gate has a known set of locations where regressions could
   occur.
3. Define a **measurement methodology** that works around
   jsdom's blindness to WebGL / GPU lifecycle (the gap explicitly
   called out in the Tier B confidence matrix as out-of-scope).
4. Identify the **route-transition map-churn surface** —
   every navigation that currently destroys and recreates a
   MapLibre instance.
5. Inventory **non-invasive instrumentation candidates** the PMS
   lane charter can opt into when measurement is authorized.

This doc proposes nothing structural. It builds the ruler.

---

## §2. The four performance gates (owner directive)

Pinned verbatim from [`REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md`](REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md) §163
(Pass 257). Each gate is the success criterion PMS must satisfy.

| Gate | Statement                                                                                   | Current state                                                                                                                                          | Measurement difficulty           |
| ---- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| G1   | No regressions in Lighthouse perf scores on landing / dashboard / reports routes            | Baseline scores not yet captured. Lighthouse runs against a Vite preview build are reproducible but not automated.                                     | Browser-only; CI-feasible.       |
| G2   | MapLibre instance count must remain at 1 across route changes                               | Currently **3 engines** (Engine 1, 2, 3 — see [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) §1). Cross-route navigation destroys + recreates Engine 1/2 hosts; Engine 3 has 14 mount sites. | Browser-only.                    |
| G3   | WebGL context creation count must drop to ≤ 1 per session                                   | Each engine instantiation creates its own GL context. Today's count = (engines mounted on landing) + (engines mounted on dashboard) + ... per visit. | Browser-only via `WEBGL_lose_context` and `getExtension` instrumentation. |
| G4   | Navigation between map-bearing routes must complete without re-initializing the map         | Today every route transition that swaps which map host is mounted destroys all GL/source/layer state on the unmounted host. Recreation cost is unmeasured but non-zero. | Browser-only (real timing).      |

**Measurement-environment constraint:** all four gates require a
real browser (Playwright / Chromium / Firefox). jsdom-based
vitest cannot host WebGL — the Tier B confidence matrix locks
this as a hard out-of-scope boundary. The PMS lane charter must
therefore include a Playwright (or equivalent) measurement
harness when measurement is authorized.

---

## §3. Per-engine init / lifecycle boundaries

Cited from the existing [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md)
§2.1-§2.3. Re-tabulated here per performance-gate relevance — not
a duplicate engine inventory.

### §3.1 Engine 1 — `MapEngineCanvas` ([component/maps/engine](../src/app/components/maps/engine/MapEngineCanvas.tsx))

| Performance-relevant boundary       | Location                                                  | Frequency today                                              | Cost class           | PMS impact (target)                  |
| ----------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------ | -------------------- | ------------------------------------ |
| GL context creation                 | `<Map ... />` mount (react-map-gl)                        | 1 per coverage-route mount (mount/unmount/remount cycles)    | HIGH (50-200ms typ.) | drop to ≤1 per session               |
| Style download + parse              | `mapStyle={mapStyle}` initial render                       | 1 per tile-mode change + 1 per mount                         | MEDIUM (network + parse) | tile-mode swap unaffected; mount path eliminated |
| Tile request first wave             | First viewport's tiles after style load                    | 1 burst per mount                                            | MEDIUM-HIGH (network) | first wave per session; subsequent route changes pay nothing |
| Source/layer registration           | Children of `<Map>` (counties, partner shops, GPS, route) | 1 per child render with new data                             | LOW-MEDIUM           | unchanged (source data still mutates) |
| Resize patch invocation             | `import "maplibreResizePatch"` (top-of-file side effect)   | 1 per module load                                            | TRIVIAL              | unchanged                             |
| Cleanup (unmount)                   | React-managed; GL context disposal                         | 1 per coverage-route unmount                                 | LOW (GC + GL.lose)   | path eliminated under PMS             |

**Hot path:** mount→GL→style→first-tile-wave is ~200-500ms in
practice (estimated; not measured under controlled conditions).
This is the dominant route-transition cost on coverage-bearing
routes today.

### §3.2 Engine 2 — `MapLibreShopDirectoryMapPane` ([component/shop](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx))

| Performance-relevant boundary | Location                                                    | Frequency today                                                | Cost class       | PMS impact (target)                            |
| ----------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- | ---------------- | ---------------------------------------------- |
| GL context creation           | `<Map key={mapRenderNonce} ... />` mount                    | 1 per shop-directory mount + 1 per `mapRenderNonce` increment  | HIGH             | drop to ≤1 per session                         |
| `mapRenderNonce` hard remount | Host-controlled escape hatch                                 | rare (recovery only)                                           | HIGH (full GL recreation) | preserved but rarer (PMS makes the soft path always-available) |
| Container-gated mount         | `{containerReady && (<Map .../>)}` — defers until measurable | 1 per mount; measurable-size delay typically <100ms            | LOW              | path eliminated under PMS                      |
| Style download + parse        | tile-mode dependent (satellite vs roadmap)                   | 1 per mount + 1 per tile-mode change                           | MEDIUM           | tile-mode swap unaffected                      |
| Layer composition             | 4 child layer components + inline `<Source>`s                | 1 per child render                                             | LOW-MEDIUM       | unchanged                                      |
| Standard controls             | `GeolocateControl`, `NavigationControl`, `ScaleControl`     | 1 per mount                                                    | LOW              | unchanged                                      |
| `onLoad` / `onError`          | Host-supplied handlers                                       | 1 per mount                                                    | LOW              | rebind path needs PMS doctrine                 |

**Hot path:** identical to Engine 1 in shape; container-gating
adds ~50-100ms startup latency in exchange for crash-free mount.

### §3.3 Engine 3 — `MapLibreDashboardMapPreview` ([component/dashboard](../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx))

| Performance-relevant boundary    | Location                                                   | Frequency today                                                                                | Cost class       | PMS impact (target)                                            |
| -------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------- |
| GL context creation per instance | `<Map id={`dashboard-preview-${useId()}`} />` per mount    | **1 per mount × 14 call sites.** Multiple sites can be live simultaneously (e.g. dashboard cards). | HIGH (×N)        | tier-B previews are out-of-scope for the *primary* PMS pattern |
| Controlled viewport churn        | `{...viewState}` + `onMove` + 4 `useEffect`s               | 1 per parent center/zoom change + 1 per `effectiveFittedView` change                            | LOW (CPU only)   | unchanged                                                      |
| Auto-fit memo                    | `fittedView` `useMemo` (deps: `[shops, allPoints]`)        | 1 per shops/pins identity change                                                                | LOW              | unchanged (Pass 251 EMPTY_* hardening eliminated identity churn) |
| Style swap                       | `mapStyle = isLight ? roadmap : night`                     | 1 per `isLight` toggle                                                                          | MEDIUM           | unchanged                                                      |
| Source data churn                | `geojson` / `reportGeojson` / `serviceAreaGeojson` memos   | 1 per shops/pins/circles identity change                                                        | LOW              | unchanged (Pass 251 hardening on default-`[]`)                 |

**Hot path:** Engine 3 is **not** the primary PMS target. Tier B
previews are short-lived in-page widgets, not route hosts. PMS
addresses the route-host engines (1 + 2). Engine 3 remains
mount-per-site under any plausible PMS architecture.

---

## §4. Map-bearing route inventory + transition cost

The PMS gate G2 (instance count = 1) and G4 (no re-init on
transition) require a precise inventory of routes that bear a
map and the transitions between them. Cited from the route
config + the [`REF_CONVERGENCE_TOPOLOGY_2026-05-09.md`](REF_CONVERGENCE_TOPOLOGY_2026-05-09.md) §2.

### §4.1 Route → engine mapping

| Route type                           | Engine(s)                                          | Today's mount form                                                          |
| ------------------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------- |
| Landing (`/`)                        | none                                               | n/a                                                                         |
| Dashboard variants                   | Engine 3 ×N (cards, widgets)                        | Per-card mount; multiple Engine 3 instances simultaneously possible         |
| Coverage / service-area              | Engine 1 (via `MapLibreServiceCoverageMap`)         | Single mount; unmount on route change                                       |
| Shop directory                       | Engine 2 (via `MapLibreShopDirectoryMapPane`)       | Single mount; unmount on route change                                       |
| Reports list / detail                | Engine 3 ×N                                         | Per-card mount; controlled viewport per caller                              |
| Insurer surfaces                     | Engine 3 ×N                                         | Same                                                                        |
| Step / wizard surfaces               | Engine 3 (e.g. StepServiceLocation)                 | Single mount; controlled viewport                                           |

### §4.2 High-cost transitions today

These are the route navigations whose perf cost PMS most directly
addresses (defined as: transitions that destroy ≥1 GL context and
create ≥1 GL context on the next route).

| Transition                         | GL contexts destroyed | GL contexts created | Estimated cost (uninstrumented) |
| ---------------------------------- | --------------------- | ------------------- | ------------------------------- |
| Landing → Coverage                 | 0                     | 1 (Engine 1)        | ~200-500ms                      |
| Landing → Shop Directory           | 0                     | 1 (Engine 2)        | ~250-600ms (container gate)     |
| Coverage → Shop Directory          | 1 (Engine 1)          | 1 (Engine 2)        | ~250-600ms (cleanup + recreate) |
| Shop Directory → Coverage          | 1 (Engine 2)          | 1 (Engine 1)        | ~250-600ms                      |
| Shop Directory → Dashboard         | 1 (Engine 2)          | N (Engine 3 cards)  | ~300-800ms (engine 3 cohort load) |
| Coverage → Dashboard               | 1 (Engine 1)          | N (Engine 3 cards)  | ~300-800ms                      |
| Dashboard → Coverage               | N (Engine 3 cards)    | 1 (Engine 1)        | ~250-600ms                      |
| Dashboard → Shop Directory         | N (Engine 3 cards)    | 1 (Engine 2)        | ~300-700ms                      |

**These cost estimates are uninstrumented assumptions** based on
typical MapLibre mount profiles in similar apps. PMS measurement
must replace them with real numbers before authorizing the
architecture pass.

### §4.3 Low-cost transitions today (PMS-orthogonal)

Transitions that destroy/create N Engine 3 instances within the
dashboard cluster (e.g. Dashboard ↔ Reports ↔ Insurer) are
Engine-3-only. PMS targets Engines 1+2 first; Engine 3 cohort
behavior is a possible later phase.

---

## §5. Rerender hotspot characterization (qualitative)

Pre-existing rerender amplification surfaces, drawn from KI-181 /
KI-196 / Pass 244 / Pass 251 evidence. Listed because PMS must
ensure the lifted-host pattern doesn't reintroduce them.

| Hotspot                                                | Status today                                                           | PMS forward concern                                                                                                                |
| ------------------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Engine 3 default-`[]` param chain (KI-196 strict)      | RESOLVED Pass 251 (`EMPTY_REPORT_PINS` etc.)                            | Stays resolved under PMS; the hardening is module-scope and survives lifecycle changes.                                            |
| Engine 3 `fittedView` → `setViewState` chain           | Closed loop, dep-stable post-Pass-251                                   | Under PMS the parent (route shell) is more persistent. If the parent passes new `center`/`zoom` per route, the chain remains correct. |
| Engine 1 viewport-controller revision-key churn        | `MapLibreViewportController` is declarative + revision-keyed           | PMS must preserve revision-key semantics when host stays mounted across routes.                                                    |
| Engine 2 `mapRenderNonce` hard-remount escape          | Owner-controlled escape hatch                                          | PMS must preserve the escape but soft-path becomes always-available.                                                                |
| `useMapPerformanceTracking` sample window              | Resets on host unmount today                                            | Under PMS the host stays mounted across route changes → window becomes session-scoped (Pass 257 §161 forward constraint).         |
| Style swap (`mapStyle={mapStyle}`)                     | Full reload triggered                                                  | Under PMS the swap path stays the same; not a PMS-introduced hazard.                                                                |

---

## §6. Memory-lifetime model (current vs PMS target)

### §6.1 Current model

| Resource                       | Lifetime                                          | Disposal                                       |
| ------------------------------ | ------------------------------------------------- | ---------------------------------------------- |
| MapLibre Map instance          | Component mount → unmount                          | React unmount + GL context loss                |
| WebGL context                  | One per Map instance                               | Released on unmount (browser GC)               |
| Style + glyphs cache           | Browser HTTP cache (per-origin)                    | Browser-managed                                |
| Tile pyramid memory            | Map instance lifetime                              | Released with Map instance                     |
| Source/layer registry          | Map instance lifetime                              | Released with Map instance                     |
| `useMapPerformanceTracking` samples | Component mount lifetime                       | Reset on host unmount                          |
| Viewport state                 | Component mount lifetime                            | Reset on unmount (controllers re-derive on next mount) |

### §6.2 PMS-target model (informational, no design proposed here)

| Resource                       | PMS-target lifetime                                  | Implication                                                                       |
| ------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| MapLibre Map instance          | **Session lifetime** for the route-host engines      | One persistent instance from first mount until session end                        |
| WebGL context                  | **Session lifetime**                                 | One context, ≤1 creation per session                                              |
| Style + glyphs cache           | unchanged                                            | Browser-managed; PMS-orthogonal                                                   |
| Tile pyramid memory            | **Session lifetime** (or LRU-bounded if memory-pressured) | New optimization opportunity: PMS enables tile cache reuse across route changes   |
| Source/layer registry          | **Session lifetime**, but mutated per route           | New invariant: route changes must NOT leak orphan sources/layers from prior routes |
| Performance samples            | **Session lifetime**                                 | Window becomes session-scoped (Pass 257 §161); test re-evaluation needed          |
| Viewport state                 | Per-route, lifted to a session store                  | New invariant: viewport persistence across route returns                          |

The shift from mount-scoped to session-scoped lifetime is the
**core memory-model implication of PMS**. Every gate (G1-G4)
ultimately tests whether this lifetime shift is achieved without
side effects.

---

## §7. Measurement methodology (jsdom-aware)

Each gate requires either a browser harness or a careful
non-invasive instrumentation strategy.

### §7.1 Gate G1 — Lighthouse perf scores

**Methodology:**
1. Build with `npm run build`.
2. Serve with `npm run preview`.
3. Run Lighthouse CLI (or CI-integrated equivalent) against
   `/`, `/dashboard`, `/reports` (and any other map-bearing
   routes per §4.1) at fixed device + network throttling.
4. Persist `performance` score per route as the baseline.
5. Re-run after each PMS pass; CI gate fails if any baseline
   score regresses by >5 points.

**Instrumentation needed:** none in source; CI workflow only.

### §7.2 Gate G2 — MapLibre instance count

**Methodology:**
1. Wrap the MapLibre constructor (or react-map-gl's mount path)
   in a development-only counter.
2. Increment on construct, decrement on dispose.
3. Expose via `window.__bdMapInstanceCount` (dev/test only).
4. Playwright assertion after each route navigation: count
   matches expected (currently varies per route; PMS target = 1).

**Instrumentation needed:** thin dev-mode wrapper; doc-only here.

### §7.3 Gate G3 — WebGL context creation count

**Methodology:**
1. Patch `HTMLCanvasElement.prototype.getContext` in dev/test
   builds to record each `webgl` / `webgl2` request with a
   timestamp + caller stack.
2. Persist counts to `window.__bdGlContextLog`.
3. Playwright + counting assertion: per session, count must
   reach ≤1 by PMS gate.

**Instrumentation needed:** dev-mode prototype patch; test-only;
zero impact on production builds.

### §7.4 Gate G4 — No map re-init on route change

**Methodology:**
1. Use Performance API (`performance.mark` / `performance.measure`)
   around route-transition handlers in the app shell.
2. Mark `route:enter:<name>` and `route:leave:<name>`.
3. Mark `map:init` and `map:dispose` with an `engine-id`
   attribute.
4. Playwright captures the `PerformanceObserver` log; assertion:
   no `map:init` mark fires within X ms after a `route:enter`
   when the prior route was also map-bearing (post-PMS).

**Instrumentation needed:** Performance-API marks in the app
shell + engine mount paths; non-invasive (marks have negligible
runtime cost and zero semantic effect).

### §7.5 Cross-cutting: render-frequency characterization

A useful adjacency to G4: count *React renders* per engine per
session under different navigation patterns. Already partially
addressed by Pass 250-254 lifecycle suites for Engine 3. PMS
will need an Engine 1 + Engine 2 equivalent.

**Tool:** React DevTools Profiler API (`Profiler` component) in
test-only wrappers. Already idiomatic in vitest tests; no source
modifications required.

---

## §8. Non-invasive instrumentation candidate list

For convenience of the PMS lane charter — the candidates above,
de-duplicated and grouped by safety class.

| Candidate                                          | Surface         | Safety class      | Owner                | When to introduce                       |
| -------------------------------------------------- | --------------- | ----------------- | -------------------- | --------------------------------------- |
| Map-instance counter (dev-only constructor wrap)   | Source          | DEV-MODE-ONLY     | PMS author           | Before PMS implementation lands         |
| GL-context counter (`getContext` patch, dev-only)  | Source          | DEV-MODE-ONLY     | PMS author           | Same                                    |
| Performance-API marks at engine mount + dispose    | Source          | PRODUCTION-SAFE   | PMS author           | Same                                    |
| Performance-API marks at route enter/leave         | App shell       | PRODUCTION-SAFE   | PMS author           | Same                                    |
| React Profiler wrapper for Engine 1 + Engine 2     | Test-only       | TEST-ONLY         | Confidence-suite author | Independent of PMS — could land sooner if needed |
| Lighthouse CI workflow                             | CI config       | CI-ONLY           | DevOps / CI owner    | Same                                    |
| Tile-request counter (XHR/fetch tap, dev-only)     | Source          | DEV-MODE-ONLY     | PMS author           | Optional; only if tile reuse becomes a PMS sub-gate |

None of the above are proposed for *this* pass. They are
catalogued for the PMS lane to opt into when measurement
authorization is granted.

---

## §9. Forward constraints to flag in PMS architecture matrix

When the parallel session's Pass 259 (`PLAN_PMS_ARCHITECTURE_OPTIONS`)
evaluates options (shell singleton / portal-host transfer /
hidden-root persistence / preserved subtree / hybrid detached
renderer), each option must be scored against:

1. **Whether it preserves the resize-patch import order**
   (`maplibreResizePatch` must run before any Map instantiation).
2. **Whether it preserves Engine 1's revision-keyed declarative
   viewport authority** (the cleanest contract today).
3. **Whether it preserves Engine 2's `mapRenderNonce` escape
   hatch** (recovery path).
4. **Whether it preserves Engine 3's per-instance `useId()`
   pattern** (Tier B preview is unaffected by PMS but must not
   regress).
5. **Whether it lets `useMapPerformanceTracking` switch to a
   session-scoped sample window** without losing the per-mount
   reset semantics for surfaces that still need them.
6. **Whether it allows Pass 256's reduced-motion continuity
   characterization to remain valid** (host persistence must not
   break the toggle continuity path).
7. **Whether it allows controlled viewport contracts (Engine 3)
   and uncontrolled viewport contracts (Engines 1, 2) to coexist**
   under the persistent host.
8. **Whether the option supports the four performance gates G1-G4
   directly** or requires additional patching.

This list is offered to the PMS architecture matrix as a scoring
rubric. The matrix author is welcome to expand or prune it.

---

## §10. What this doc does NOT do

- Does NOT touch any production source.
- Does NOT touch any test file.
- Does NOT touch `AI_LOCK.md` (the parallel session has it
  forward-claimed for their Coverage Map / PMS-planning lane).
- Does NOT propose a PMS architecture.
- Does NOT propose an execution sequence for PMS implementation.
- Does NOT measure performance — it defines the methodology that
  *future* measurement must follow.
- Does NOT touch ShopMapWidget (owner-dirty).
- Does NOT touch the active-confidence test files.
- Does NOT modify autoFit / viewport / camera / gesture /
  reduced-motion semantics.
- Does NOT compete with the parallel session's Passes 258 / 259 /
  260. This pass is Pass 261, on a non-overlapping doc path,
  taking the relay's P2 sub-lane that the parallel session did
  not claim.

---

## §11. Cross-references

- [`REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md`](REF_TIER_B_CONFIDENCE_MATRIX_2026-05-09.md) (Pass 257) — owner performance directive + 4 gates source.
- [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) — engine inventory + lifecycle contracts cited throughout §3.
- [`REF_CONVERGENCE_TOPOLOGY_2026-05-09.md`](REF_CONVERGENCE_TOPOLOGY_2026-05-09.md) — route / state authority topology cited in §4.
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) KI-181, KI-196 — rerender hotspot history.
- [`PLAN_MAP_MASTER.md`](PLAN_MAP_MASTER.md) — long-horizon map plan (PMS context).
- [`src/app/components/maps/useMapPerformanceTracking.ts`](../src/app/components/maps/useMapPerformanceTracking.ts) — existing zoom/pan sample-recording surface; PMS must re-evaluate its lifetime.

---

## §12. Status

- **Drafted:** 2026-05-09 (Pass 261, P2 sub-lane).
- **Status:** ACTIVE baseline. Updates only when:
  - the route surface changes (new map-bearing route),
  - a new engine is added,
  - a new performance gate is committed by owner directive,
  - measurement is authorized and replaces the uninstrumented
    cost estimates with real numbers.
- **Authority:** REFERENCE. Subordinate to LAW_PROJECT_RULES,
  LAW_LAYERED_ARCHITECTURE, the active execution authority.
- **Owner approval required:** false (audit-only).
- **Supersedes:** none.
- **Superseded by:** none (the eventual PMS architecture matrix
  may cite this doc; it does not replace it).
- **Relationship to parallel session's Passes 258/259/260:**
  complementary, non-overlapping. P2 sub-lane filled.

**Next legitimate pass for this lane:** none authorized yet.
Future passes in this sub-lane would be performance measurement
itself — which requires owner authorization for the
instrumentation candidates listed in §8.
