---
status: CANONICAL
authority: REFERENCE
scope: dashboard-preview-duplication
canonical_source_of_truth: REF_DASHBOARD_PREVIEW_DUPLICATION_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: medium
ai_summary: Per-caller analysis of MapLibreDashboardMapPreview's 6 consumers and the smallest shared contract for a future collapse.
last_updated: 2026-05-09
---

# Dashboard Preview Duplication Analysis (2026-05-09)

> Block C / Pass 225 deliverable. Read-only audit. No runtime changes.
>
> Companions:
>
> - [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) — Pass 223 (Engine 3 lifecycle contract)
> - [`REF_NAVIGATION_AUTHORITY_2026-05-09.md`](REF_NAVIGATION_AUTHORITY_2026-05-09.md) — Pass 224 (orchestration grid; Engine 3 has no host)
> - [`PLAN_MAP_UNIFICATION_2026-05-08.md`](PLAN_MAP_UNIFICATION_2026-05-08.md) §1.6 — duplicate inventory for `MapLibreDashboardMapPreview` (caller count needs reconciliation; see § 5 below)
>
> **Note on cross-update:** `PLAN_MAP_UNIFICATION_2026-05-08.md` is currently
> owner-dirty in the working tree. Per Block C hard stops, Pass 225 does not
> edit that doc. The §1.6 update (corrected caller count: 6 not 4, plus this
> doc's collapse plan) is deferred to a follow-up pass once the owner
> stabilizes that file.

---

## §1. Caller-by-caller usage table

`MapLibreDashboardMapPreview` is consumed by 6 sites. Per-caller props
captured below.

| Caller                                                                                   | `shops`          | `reportPins`             | `serviceAreaCircles`            | `center`                               | `zoom`            | `isLight` | `onShopClick`      | `onReportPinClick` | `onMapClick`  |
| ---------------------------------------------------------------------------------------- | ---------------- | ------------------------ | ------------------------------- | -------------------------------------- | ----------------- | --------- | ------------------ | ------------------ | ------------- |
| [`CustomerMapWidget`](../src/app/components/dashboard/CustomerMapWidget.tsx)             | partnerShops     | derived                  | —                               | derived `mapCenter`                    | derived `mapZoom` | ✓         | → onViewShops      | —                  | → onViewShops |
| [`ShopMapWidget`](../src/app/components/dashboard/ShopMapWidget.tsx)                     | partnerShops     | derived                  | derived from shop service areas | derived `mapCenter`                    | constant 9        | ✓         | —                  | —                  | → onViewShops |
| [`InsurerMapWidget`](../src/app/components/dashboard/InsurerMapWidget.tsx)               | partnerShops     | derived from claims      | —                               | `defaultCoverageCenter`                | constant 9        | ✓         | —                  | —                  | → onViewShops |
| [`ReportsListScreen`](../src/app/components/reports/ReportsListScreen.tsx)               | (none)           | derived from report list | —                               | `reportMapCenter`                      | constant 10       | ✓         | —                  | → focus report row | —             |
| [`ReportDetailScreen`](../src/app/components/reports/ReportDetailScreen.tsx)             | (none)           | single report pin        | —                               | `[reportCoords.lat, reportCoords.lng]` | constant 11       | ✓         | —                  | —                  | —             |
| [`CompetitorAnalysisScreen`](../src/app/components/reports/CompetitorAnalysisScreen.tsx) | competitor shops | empty `[]`               | —                               | `competitorMapCenter`                  | constant 9        | ✓         | → focus competitor | —                  | —             |

---

## §2. What each caller actually needs

| Caller                     | Primary need                                                    | Tier (proposed Pass 227)                                  |
| -------------------------- | --------------------------------------------------------------- | --------------------------------------------------------- |
| `CustomerMapWidget`        | "Show me my partner shops + my open reports geographically"     | Tier B preview                                            |
| `ShopMapWidget`            | "Show me my own service area + nearby reports I could bid on"   | Tier B preview                                            |
| `InsurerMapWidget`         | "Show me my claim footprint + partner shops"                    | Tier B preview                                            |
| `ReportsListScreen`        | "Show me my report pins; clicking one focuses the row"          | Tier B preview                                            |
| `ReportDetailScreen`       | "Show me where this single report is"                           | Tier B preview / Tier C decorative (lowest interactivity) |
| `CompetitorAnalysisScreen` | "Show me competitor shops geographically; clicking focuses one" | Tier B preview                                            |

**Common substrate:** all 6 are **Tier B previews** (read-mostly, gesture-
suppressed, click-to-context). None do live navigation, none need camera
controllers, none need GPS. The current `MapLibreDashboardMapPreview` IS
the Tier B engine. The "duplication" framing is therefore misleading: the
COMPONENT is single. The 6 callers are CALL SITES of one component, not
6 re-implementations.

The actual convergence question is different: _should the Tier B engine
also serve coverage-preview / shop-directory-preview cases that today
go through Engines 1 / 2 even when the surface only needs preview
behavior?_

---

## §3. Variance dimensions across callers

The 6 callers vary on these axes:

1. **Pin types provided:** shops only (`CompetitorAnalysisScreen` with empty
   reportPins), reports only (`ReportsListScreen`, `ReportDetailScreen`),
   or both (3 dashboard widgets).
2. **Service-area overlay:** only `ShopMapWidget` uses it (1/6).
3. **Center authority:** 4 callers compute a derived `mapCenter`
   (`CustomerMapWidget`, `ShopMapWidget`, `ReportsListScreen`,
   `CompetitorAnalysisScreen`); `InsurerMapWidget` uses a static
   `defaultCoverageCenter`; `ReportDetailScreen` uses the report's own
   coords.
4. **Zoom authority:** 5 callers pass a constant zoom (9, 9, 9, 10, or 11);
   only `CustomerMapWidget` derives `mapZoom`.
5. **Click-handler shape:** 0 to 2 handlers. No caller uses all three. The
   shop-vs-report disambiguation is internal to the preview's `onClick`
   layer-id check — callers never have to write that logic.
6. **Auto-fit override:** the preview auto-fits to ≥2 shops via internal
   `fittedView` `useMemo`. `ReportsListScreen` and `ReportDetailScreen`
   pass empty shops, so the auto-fit falls back to `allPoints` (which
   is just `reportPins`).

**Finding:** the prop surface is small (shops + reportPins +
serviceAreaCircles + center + zoom + isLight + 3 optional handlers) and
passes without local hacks. **The component is well-fit
to its callers today.** The 6-caller count reflects natural reuse, not
architectural fragmentation. They are call sites of one component, not
6 re-implementations.

---

## §4. The internal auto-fit heuristic vs caller-supplied viewport

A behavioral subtlety worth flagging for Pass 226's lifecycle contract:

`MapLibreDashboardMapPreview` honors `center` / `zoom` props **but
overrides them** when ≥2 shop pins exist (auto-fit to the shop bbox).
The override happens in this `useEffect`:

```ts
useEffect(() => {
  if (fittedView) {
    setViewState(fittedView);
  } else {
    setViewState({ longitude: center[1], latitude: center[0], zoom });
  }
}, [center, zoom, fittedView]);
```

This means caller-supplied `center` / `zoom` are **only honored when fewer
than 2 shop pins are visible**. For:

- `ReportDetailScreen` (always 1 pin, 0 shops) — caller wins.
- `ReportsListScreen` (N report pins, 0 shops) — caller wins.
- All 3 dashboard widgets and `CompetitorAnalysisScreen` (≥2 shops typical)
  — auto-fit wins, caller's `center`/`zoom` ignored.

**Implication for Pass 226:** the lifecycle contract should make the
"caller wins vs auto-fit wins" rule explicit. Today this is invisible to
callers — `CustomerMapWidget` computes `mapZoom` that gets silently
discarded once 2+ shops load. This is not a bug (auto-fit is desirable)
but it is **hidden authority**, the kind of thing that fragments mental
models across surfaces.

---

## §5. Reconciliation against `PLAN_MAP_UNIFICATION_2026-05-08.md` § 1.6

Pass 217 added §1.6 to PLAN_MAP_UNIFICATION listing the duplicate as used
by:

> ReportDetailScreen, ReportsListScreen, InsurerMapWidget, CompetitorAnalysisScreen

That's **4 callers**. Pass 225 grep shows **6 callers** — `CustomerMapWidget`
and `ShopMapWidget` were missed because they live in `dashboard/` rather
than `reports/` and were not surfaced by the original duplication search.

**Pending update for `PLAN_MAP_UNIFICATION_2026-05-08.md` § 1.6 (deferred
until owner-dirty file stabilizes):**

- Caller count: 4 → 6.
- Add `CustomerMapWidget` and `ShopMapWidget` to the caller list.
- Add a pointer to this doc.
- Replace the existing "convergence DEFERRED post-launch" stance with the
  Pass 225 conclusion below: this engine is **single, not duplicate**;
  the convergence question is about Tier-B PREVIEW unification across
  Engines 1/2/3 surfaces, not about consolidating the 6 callers of
  Engine 3.

---

## §6. Collapse plan (when convergence is authorized)

This section is forward-looking. Pass 225 is read-only; no execution
authority is claimed.

### 6.1 What NOT to do

- **Do not collapse the 6 callers into a wrapper.** Each caller already
  passes the smallest prop set it needs. A wrapper would add a layer
  without removing fragmentation.
- **Do not move `MapLibreDashboardMapPreview` into the canonical engine
  in one step.** Engine 3's controlled-viewport pattern is incompatible
  with Engines 1 and 2's uncontrolled-viewport pattern. Forcing a swap
  would break the 6 callers' implicit auto-fit behavior.

### 6.2 What TO do (in order)

1. **Pass 226 lifecycle contract** must declare:
   - One canonical camera authority pattern (likely uncontrolled +
     declarative revision-keyed controllers, matching Engine 1).
   - A separate Tier B contract that explicitly allows the controlled-
     viewport pattern Engine 3 uses today, OR specifies how Tier B
     surfaces opt into auto-fit + caller-supplied viewport coexistence.
   - The `maplibreResizePatch` import as a non-negotiable pre-mount
     invariant (per Pass 223 § 5 finding 5).
2. **Pass 227 sequencing** decides whether Tier B engines (Engine 3) get
   converged into the canonical engine FIRST (lower risk; preview-only)
   or LAST (higher risk; coverage + shop directory go first because they
   matter more).
3. **First runtime convergence pass (post-Pass 230 owner gate)** should
   target the LOWEST-risk surface only. Best candidate: `ReportDetailScreen`
   (single pin, no auto-fit conflict, smallest blast radius).
4. **Each subsequent collapse step** must follow the convergence-pass
   requirements that Pass 226 will lock into the contract:
   - explicit rollback plan
   - renderer ownership diff
   - lifecycle before/after table
   - affected surfaces list
   - orchestration authority diff
   - runtime-risk classification
   - required test coverage

### 6.3 Convergence success criteria (proposed)

- The 6 dashboard/report callers can opt into either Tier B preview
  behavior (current) or canonical Tier A behavior (new), via prop
  rather than via component swap.
- The auto-fit-vs-caller-supplied authority rule is documented in the
  lifecycle contract.
- No regression in the 6 callers' visual or interaction behavior.
- `MapEngineCanvas` continues to serve as the canonical Tier A engine.

---

## §7. Findings summary

1. **The 6 callers are not a duplication problem.** They are call sites
   of a well-fit single component.
2. **The real convergence target is between Engine 3 (Tier B) and
   Engines 1/2 (Tier A),** not within Engine 3's caller set.
3. **PLAN_MAP_UNIFICATION § 1.6 caller count is wrong (4 → 6).** Update
   pending; deferred until owner-dirty file stabilizes.
4. **Auto-fit vs caller-supplied viewport authority is hidden.** Pass 226
   contract should make this explicit.
5. **Lowest-risk first runtime convergence target** (when authorized
   post-Pass 230): `ReportDetailScreen` — single pin, no auto-fit
   conflict, smallest blast radius.

**Hand-off to Pass 225.5:** Pass 225.5 is the new Map UX + Interaction
Cohesion Audit added to Block C per owner directive. It will look at
viewport behavior consistency, route-preview consistency, gesture
consistency, and "mental model continuity" between map surfaces — the
behavioral layer that complements Pass 223's structural layer and Pass
224's orchestration layer.
