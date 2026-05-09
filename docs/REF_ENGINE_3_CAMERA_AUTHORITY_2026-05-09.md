---
status: CANONICAL
authority: REFERENCE
scope: engine-3-camera-authority-audit-and-migration-prep
canonical_source_of_truth: REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Pass 237 (Phase 2) deliverable. Audits every camera-authority source inside Engine 3 (`MapLibreDashboardMapPreview`), maps the implicit-vs-declarative authority surface, identifies the KI-181 hidden-authority point, and stages the additive `autoFit` prop migration design. Migration is NOT executed in Pass 237 — this doc is the design of record for the future declarative migration pass.
last_updated: 2026-05-09
---

# REF — Engine 3 Camera Authority Audit + Declarative Migration Prep

> Phase 2 / Pass 237 deliverable. Audit-and-design only. No
> production behavior change in this pass.
>
> Companion to:
>
> - [`docs/REF_MAP_MOTION_CONTRACT_2026-05-09.md`](REF_MAP_MOTION_CONTRACT_2026-05-09.md) §3 (per-engine motion authority).
> - [`docs/REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md) (preview owns no camera).
> - [`docs/REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) KI-181 (hidden-authority auto-fit).
> - [`src/app/components/dashboard/MapLibreDashboardMapPreview.test.tsx`](../src/app/components/dashboard/MapLibreDashboardMapPreview.test.tsx) (Pass 231g baseline).
> - [`src/app/components/dashboard/MapLibreDashboardMapPreview.motion.test.tsx`](../src/app/components/dashboard/MapLibreDashboardMapPreview.motion.test.tsx) (Pass 236 motion lock).

---

## §1. Mission

Phase 1 declared Engine 3's runtime identity (Tier B preview).
Phase 2 / Pass 236 locked its motion contract (no Class P / A / O,
trivial reduced-motion conformance). This pass — Pass 237 — answers
the next question:

> **Where does Engine 3's resolved camera state actually come from,
> and which of those sources are declarative versus implicit?**

The audit produces:

1. A complete inventory of Engine 3's camera-authority sources
   (§2).
2. A classification: declarative (caller-visible) vs implicit
   (renderer-internal hidden authority) (§3).
3. The KI-181 reconciliation surface (§4).
4. The additive `autoFit` prop migration design (§5).
5. The migration's required test deltas (§6).
6. The migration's rollback shape (§7).

The migration itself is OUT OF SCOPE for Pass 237. It is staged
for a future Phase 2+ pass under explicit owner authorization.

---

## §2. Camera-authority inventory

Engine 3's resolved viewport at any render frame is the output of
this chain:

```
caller props ─▶ fittedView memo ─▶ viewState useEffect ─▶ controlled <Map> ─▶ react-map-gl/maplibre
   (1)              (2)                    (3)                    (4)                  (5)
```

### §2.1 Source (1): caller props

- `center: [number, number]` — caller-supplied lat/lng.
- `zoom: number` — caller-supplied zoom level.
- **Authority class:** declarative (visible at every call site).
- **Doctrine alignment:** correct. Preview must carry caller intent
  forward.

### §2.2 Source (2): `fittedView` memo

```ts
const fittedView = useMemo(() => {
  const fitPoints = shops.length >= 2 ? shops : allPoints;
  if (fitPoints.length < 2) return null;
  // ...bbox math → { latitude, longitude, zoom }
}, [shops, allPoints]);
```

- Computes a bounds-fit viewport whenever ≥2 fitPoints exist.
- `allPoints` = `shops ∪ reportPins` (memo).
- **Authority class:** IMPLICIT (renderer-internal). Caller has no
  way to opt out.
- **Doctrine alignment:** violates "preview owns no camera"
  spirit. The renderer is making a viewport decision the caller
  cannot see, override, or disable.
- **KI link:** KI-181 names this exact behavior.

### §2.3 Source (3): `viewState` useEffect

```ts
useEffect(() => {
  if (fittedView) {
    setViewState(fittedView);
  } else {
    setViewState({ longitude: center[1], latitude: center[0], zoom });
  }
}, [center, zoom, fittedView]);
```

- Resets controlled `viewState` whenever the caller props or the
  fittedView change.
- **Authority class:** orchestration of (1) and (2). The effect
  itself is correct — it is the channel through which (1) and (2)
  reach (4). The hidden-authority is upstream at (2), not here.
- **Behavior characterized:** when shops collection changes such
  that fittedView recomputes, the viewport snaps to the new fit
  (Pass 237 adds a test for this — see §6.1).

### §2.4 Source (4): controlled `<Map>` props

```tsx
<Map
  {...viewState}
  onMove={(e) => setViewState(e.viewState)}
  ...
/>
```

- Standard react-map-gl controlled-component pattern.
- `onMove` keeps the local `viewState` in sync with internal map
  state (e.g. for unsuppressed gestures — but Tier B suppresses
  all gestures, so this primarily serves prop-driven echoes).
- **Authority class:** declarative pass-through.
- **Doctrine alignment:** correct.

### §2.5 Source (5): react-map-gl/maplibre

- External authority. Not under audit.

---

## §3. Authority classification

| Source                       | Class         | Caller-visible            | Caller-overridable | Doctrine status                |
| ---------------------------- | ------------- | ------------------------- | ------------------ | ------------------------------ |
| (1) caller props             | declarative   | yes                       | yes                | ✅ correct                     |
| (2) `fittedView` memo        | **IMPLICIT**  | no                        | no                 | ❌ KI-181 hidden authority     |
| (3) `viewState` useEffect    | orchestration | n/a                       | n/a                | ✅ correct (downstream of (2)) |
| (4) controlled `<Map>` props | declarative   | yes (via prop forwarding) | n/a                | ✅ correct                     |

The single hidden-authority point is **§2.2 `fittedView` memo**.
Eliminating that hidden authority is the Pass 237 migration target.

---

## §4. KI-181 reconciliation surface

KI-181 baseline is locked by the Pass 231g test file
(`MapLibreDashboardMapPreview.test.tsx`) under section
"Pass 231g hidden-authority baseline (KI-181)":

- 0 shops + 0 pins → caller wins.
- 1 shop + 0 pins → caller wins.
- 0 shops + 1 pin → caller wins.
- 2+ shops → fittedView OVERRIDES caller (silent).
- 1 shop + 1 pin → fittedView via allPoints OVERRIDES caller
  (silent).

KI-181 will be marked RESOLVED **only after** the migration in
§5 lands AND the override behavior becomes opt-in via the new
`autoFit` prop.

Until then, KI-181 remains OPEN with the current baseline as the
"as-built" reference.

---

## §5. Additive `autoFit` prop migration design

### §5.1 Prop shape

```ts
type AutoFitMode =
  | "always" // current implicit behavior — fit when ≥2 points
  | "when-no-caller-bounds" // fit only if caller did not supply explicit bounds
  | "never"; // caller props always win

type MapLibreDashboardMapPreviewProps = {
  // ...existing props...
  autoFit?: AutoFitMode;
};
```

### §5.2 Default value

`autoFit` default MUST be `"always"` to preserve existing call-site
behavior (zero call-site churn migration). Every Phase 1 surface
relies on the implicit fit; flipping the default to `"never"` would
silently regress 5 surfaces.

### §5.3 Migration cadence (3 sub-passes, each STOP-gated)

1. **Sub-pass A:** add the `autoFit` prop with default `"always"`.
   No call-site changes. Behavior identical to today. Tests added
   for `"never"` and `"when-no-caller-bounds"` branches.
2. **Sub-pass B:** audit each call site. For surfaces that
   intentionally rely on auto-fit, set `autoFit="always"`
   explicitly (caller-visible). For surfaces that should respect
   caller intent (e.g. `ReportDetailScreen` showing a single
   report at a tight zoom), set `autoFit="never"`.
3. **Sub-pass C:** flip the default to `"when-no-caller-bounds"`
   (the safer doctrine default). KI-181 marked RESOLVED. Pass 231g
   "hidden-authority baseline" tests rewritten as
   "explicit-authority confirmation" tests.

### §5.4 What this migration does NOT do

- ❌ Does not introduce imperative camera APIs (`flyTo`, etc.).
- ❌ Does not introduce a `useMap()` handle.
- ❌ Does not add motion to Engine 3 ("preview owns no camera"
  remains intact).
- ❌ Does not change Tier B gesture suppression.
- ❌ Does not change the controlled-`<Map>` pattern.
- ❌ Does not touch Engines 1 or 2.

The migration is purely about **making the auto-fit authority
explicit at the call site**, not about adding new behavior.

---

## §6. Required test deltas (staged for migration sub-passes)

### §6.1 Pass 237 ADDS (in this pass)

One additive characterization test in
`MapLibreDashboardMapPreview.motion.test.tsx` § new section
"camera authority — dynamic auto-fit recomputation (KI-181
extension)":

- When `shops` prop changes from 2 NY shops to 2 LA shops, the
  resolved viewport snaps to the new fittedView (not the prior
  one, not the caller `center`).

This pins the **dynamic** half of the KI-181 hidden authority.
Pass 231g pinned only the **mount-time** half.

### §6.2 Migration sub-pass A WILL ADD

- `autoFit="never"` + 2 shops → caller wins (override disabled).
- `autoFit="when-no-caller-bounds"` + caller provides explicit
  center/zoom + 2 shops → caller wins.
- `autoFit="when-no-caller-bounds"` + caller provides default
  center/zoom + 2 shops → fittedView wins.
- `autoFit="always"` + 2 shops → fittedView wins (today's behavior,
  re-pinned under the explicit prop).

### §6.3 Migration sub-pass C WILL REWRITE

The Pass 231g "hidden-authority baseline (KI-181)" describe block
will be renamed to "explicit-authority confirmation
(KI-181 RESOLVED)" and the test bodies will assert the new
default's explicit-fit-only behavior.

---

## §7. Rollback shape

The migration is fully reversible at every sub-pass:

- **Sub-pass A revert:** delete the `autoFit` prop + its branch in
  the `fittedView` consumer. Behavior reverts to today's implicit
  always-fit.
- **Sub-pass B revert:** delete the `autoFit=...` literals at each
  call site. Default kicks in. Behavior reverts to today.
- **Sub-pass C revert:** flip the default back to `"always"`.
  Behavior reverts to today.

No data migration. No persistence change. No motion contract
change. No engine merging.

---

## §8. Hard stops carried into the migration sub-passes

Same as Phase 2 hard-stops, plus:

- ❌ Do not introduce a `bounds: LngLatBoundsLike` caller prop
  (that is the imperative-camera door — declarative bounds belong
  to a future phase).
- ❌ Do not surface `fittedView` as a controlled prop (caller
  computing the fit defeats the purpose of an opt-in flag).
- ❌ Do not change `useEffect([center, zoom, fittedView])`
  dependencies during sub-passes A or B — the orchestration is
  correct; only the upstream `fittedView` truth-table changes.

---

## §9. Cross-engine implications

This audit is Engine-3-scoped. Engines 1 and 2 have their own
camera-authority profiles:

- **Engine 1** (canvas, Tier A, Exploratory): declarative `flyTo`
  keyed to revision (per motion contract §3). Camera-authority
  audit is OUT OF SCOPE for Phase 2.
- **Engine 2** (shop directory pane, Tier A, Exploratory +
  Operational): imperative `useMap()` + `map.flyTo()` for Class A
  and Class O (per motion contract §3 + KI-180). Camera-authority
  audit is OUT OF SCOPE for Phase 2 per owner Phase 2
  authorization ("Engine 2 convergence or authority migration"
  NOT AUTHORIZED).

---

## §10. STOP gate

Pass 237 is audit-and-design only. The migration sub-passes A,
B, C require explicit owner authorization with:

1. Confirmation of the migration's three-sub-pass cadence.
2. Confirmation that no imperative camera APIs will be
   introduced.
3. Confirmation that Engine 3 remains the only engine touched.
4. Confirmation that each sub-pass STOPs and reports before the
   next starts.

Until that authorization arrives, no migration work runs.

---

## §11. End of Pass 237 design surface

Pass 237 ships:

- This audit + design REF doc.
- One additive characterization test (§6.1) pinning the dynamic
  half of the KI-181 hidden authority.

Next authorized pass (per Phase 2 dispatch packet):
**Pass 238 — reduced-motion CI invariant promotion.**
