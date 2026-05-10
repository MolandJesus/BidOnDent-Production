---
status: CANONICAL
authority: REFERENCE
scope: map-subsystem-hidden-authority-evidence-inventory
canonical_source_of_truth: REF_HIDDEN_AUTHORITY_EVIDENCE_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Pass 239 (Phase 2) deliverable. Inventories every renderer-internal control point in the map subsystem where a caller-supplied prop can be silently overridden by internal logic (memos, useEffects, refs, internal stores, hydration). Cross-references each surface to the active KI it is tracked under, OR files a new KI if one is missing. Audit-only — no production runtime change.
last_updated: 2026-05-09
---

# REF — Map Subsystem Hidden-Authority Evidence Inventory

> Phase 2 / Pass 239 deliverable. Audit-only. No production
> behavior change in this pass.
>
> Companions:
>
> - [`docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md`](REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md) (Pass 237 — Engine 3 deep audit + migration design).
> - [`docs/REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md) ("preview owns no camera").
> - [`docs/REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) (KI-180, KI-181, KI-186, KI-194 reconciliation targets).

---

## §1. Definitions

A **hidden-authority surface** is any code path inside a map
component or hook where a caller-supplied prop (camera state,
mode, theme, selection, layer visibility, route choice, focus
target) can be silently overridden by renderer-internal logic
(a memo, a useEffect, a captured ref, a hydration call, a sibling
component's effect).

The override is "hidden" when:

- the caller has no prop to opt out, AND
- the override does not surface in the component's prop type, AND
- the override fires from a source the caller cannot reason about
  by reading the call site alone.

This is distinct from:

- **Declarative orchestration** (caller-visible — useEffects whose
  full dep set is on the public prop surface and whose only side
  effect is to forward props into renderer state).
- **External authority** (e.g. browser geolocation, OS motion
  preference) — those are documented separately and do not count
  as renderer-internal hidden authority.

---

## §2. Per-engine audit results

### §2.1 Engine 1 — `MapEngineCanvas` (Tier A, Exploratory)

File: [`src/app/components/maps/engine/MapEngineCanvas.tsx`](../src/app/components/maps/engine/MapEngineCanvas.tsx)
(238 lines).

**Audit method:** read full file (Pass 239); grep for
`flyTo|easeTo|jumpTo|fitBounds|panTo|setView|useRef|useEffect`
returned ZERO matches.

**Hidden-authority surfaces:** NONE in the canvas itself.

**Camera-authority delegated to:**

- `MapLibreViewportController` (declarative `flyTo` keyed to
  revision per motion contract §3).
- `MapLibreFollowLocationController` (operational, follows GPS).
- `MapLibreArrivalCameraEffect` (operational, fires on arrival
  trigger).

Each is its own L3 component with its own prop surface. Pass 231i
(`75223e69`) added the reduced-motion topology baseline for these
controllers. Engine 1's canvas itself is therefore the cleanest of
the three engines: pure composition shell, no implicit overrides.

**Conclusion:** ✅ no hidden authority at the canvas level.
Controller-level audits are tracked separately under Engine 1
follow-on work (out of Phase 2 scope per owner authorization).

### §2.2 Engine 2 — `MapLibreShopDirectoryMapPane` (Tier A, Exploratory + Operational)

File: [`src/app/components/shop/MapLibreShopDirectoryMapPane.tsx`](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx)

- state hook
  [`src/app/components/shop/useMapPaneState.ts`](../src/app/components/shop/useMapPaneState.ts).

**Out of Phase 2 scope** for fixes per owner authorization
("Engine 2 convergence or authority migration NOT
AUTHORIZED"). Inventory recorded here for governance continuity.

| Surface                                                              | Location                                         | Override                                                                                                                                                 | Tracked under                  |
| -------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Imperative `map.flyTo()` for Class A + Class O                       | `useMapPaneState.ts` (multiple call sites)       | Bypasses `prefers-reduced-motion` contract — caller cannot opt out per-call                                                                              | **KI-180** (open)              |
| Tile-mode auto-resolution from `prefers-color-scheme: dark` listener | `useMapPaneState.ts` lines 174-186               | When `mapTheme="auto"`, internal media-query listener overrides any caller intent for `tileMode` between renders                                         | **KI-194** (NEW — see §4.1)    |
| `externalTileMode` override effect                                   | `useMapPaneState.ts` lines 188-193               | If a sibling overlay sets `externalTileMode`, internal `setTileMode(externalTileMode)` mutates state without surfacing the change to the original caller | **KI-194** (NEW — same family) |
| Guidance-mode auto-clear of popups                                   | `useMapPaneState.ts` lines 240-244               | When `navigationMode="guidance"`, internal effect clears `shopPopup` / `savedPlacePopup` / `routePopup` regardless of caller intent                      | **KI-195** (NEW — see §4.2)    |
| `prevTileModeRef` transition detector                                | `MapLibreShopDirectoryMapPane.tsx` lines 185-206 | Ref captures `tileMode` to detect transitions; not a hidden override of caller intent — the ref reflects current prop. Declarative.                      | n/a (not hidden authority)     |

### §2.3 Engine 3 — `MapLibreDashboardMapPreview` (Tier B, Preview)

File: [`src/app/components/dashboard/MapLibreDashboardMapPreview.tsx`](../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx).

**Fully audited in Pass 237.** See
[`docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md`](REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md).

| Surface           | Location    | Override                                                                                                                     | Tracked under     |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `fittedView` memo | lines 49-79 | When `shops.length >= 2` (or `allPoints.length >= 2`), derived bounds-fit viewport silently overrides caller `center`/`zoom` | **KI-181** (open) |

Migration to declarative `autoFit` prop designed in Pass 237 §5.
Mount-time half pinned by Pass 231g; dynamic half pinned by Pass
237 §6.1 test.

---

## §3. Cross-cutting (orchestration-host) audit

### §3.1 Navigation session cloud sync

File: navigation host hooks (per [`docs/REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md)).

| Surface                                                                                  | Override                                                       | Tracked under |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------- |
| Cloud-resumed navigation session can override caller-supplied initial route on hydration | **KI-045** (open — depends on backend schema in connected env) |

Already characterized; no Pass 239 delta needed.

### §3.2 GPS dual-instantiation risk

| Surface                                                                                                                                                                      | Override                  | Tracked under |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------- |
| Two simultaneously-mounted navigation hosts could each subscribe to `navigator.geolocation.watchPosition`, double-charging battery + creating two competing position streams | **KI-186** (open, latent) |

Already characterized; no Pass 239 delta needed.

### §3.3 Tier B preview consumers

Audit of all 6 `MapLibreDashboardMapPreview` call sites
(CustomerMapWidget, ShopMapWidget, InsurerMapWidget,
CompetitorAnalysisScreen, ReportsListScreen, ReportDetailScreen):

- All forward props declaratively. None capture refs, hold local
  caches, or override caller intent.
- Per Phase 1 closeout, all 6 carry the Pass 232–235 metadata
  block.

**Conclusion:** ✅ no hidden authority introduced at the consumer
layer. The hidden-authority surface on Engine 3 (KI-181) is the
only authority point Tier B consumers need to be aware of.

---

## §4. New KI entries (filed by Pass 239)

### §4.1 KI-194 — Engine 2 tile-mode dual-override (P3-IMPLICIT-AUTHORITY)

`useMapPaneState.ts` resolves the effective `tileMode` from
**three** competing sources:

1. Caller `mapTheme` prop (`"auto" | "dark" | "light"`).
2. Internal `prefers-color-scheme: dark` media-query listener
   (only when `mapTheme === "auto"`).
3. Sibling `externalTileMode` prop (when non-null, overrides both
   above).

The caller has no single prop to declare "I own the tile-mode
authority outright." The fix shape mirrors Pass 237's Engine 3
proposal: an additive `tileModeAuthority` prop (or equivalent)
with explicit precedence semantics. Out of Phase 2 scope.

### §4.2 KI-195 — Engine 2 guidance-mode auto-clears popups (P3-IMPLICIT-STATE-MUTATION)

When `navigationMode === "guidance"`, an internal effect calls
`setShopPopup(null)` + `setSavedPlacePopup(null)` +
`setRoutePopup(null)`. The caller's prior selection is silently
discarded. The fix shape: surface a `clearOverlaysOnMode` prop
(default `true` to preserve current behavior; opt out for callers
that want sticky overlays into guidance). Out of Phase 2 scope.

Both new KIs filed in
[`docs/REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) by this pass.

---

## §5. KI reconciliation summary

| KI                                                         | Status before Pass 239 | Status after Pass 239                                                      |
| ---------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| KI-180 (Engine 2 imperative flyTo bypasses reduced-motion) | OPEN                   | OPEN — no change. Out of Phase 2 scope. Cross-referenced from §2.2.        |
| KI-181 (Engine 3 fittedView silent override)               | OPEN                   | OPEN — no change. Migration design in Pass 237 awaits owner authorization. |
| KI-186 (GPS dual-instantiation risk)                       | OPEN, latent           | OPEN, latent — no change. Cross-referenced from §3.2.                      |
| KI-191 (reduced-motion contract not CI-enforced)           | RESOLVED (Pass 238)    | RESOLVED — confirmed.                                                      |
| KI-193 (shadcn/ui reduced-motion gap)                      | OPEN (filed Pass 238)  | OPEN — confirmed.                                                          |
| **KI-194 (Engine 2 tile-mode dual-override)**              | —                      | **NEW — filed by Pass 239.**                                               |
| **KI-195 (Engine 2 guidance-mode auto-clears popups)**     | —                      | **NEW — filed by Pass 239.**                                               |

---

## §6. What this audit does NOT do

- ❌ Does not change any production code.
- ❌ Does not propose Engine 2 remediation (out of Phase 2
  scope). KI-194 and KI-195 are filed but not staged for fixes
  in Phase 2.
- ❌ Does not re-audit hooks already covered by Pass 231 series
  (lifecycle, failure-surface, controllers).
- ❌ Does not introduce new test coverage (Pass 237 + Pass 238
  cover the Phase 2 testing budget).

---

## §7. Hard stops carried forward

- ❌ Do not act on KI-194 or KI-195 in Phase 2. They are
  Engine-2-scoped behavior changes.
- ❌ Do not "tidy up" the `useMapPaneState.ts` reconciliation
  block (lines 174-244) during Phase 2. The audit names the
  surfaces; remediation is Phase 3+ work.
- ❌ Do not re-derive Engine 3 fittedView authority — already
  fully captured in Pass 237.

---

## §8. End of Pass 239 audit surface

Pass 239 ships:

- This evidence inventory REF doc.
- Two new KI entries (KI-194, KI-195) in
  [`docs/REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md).
- Cross-references from each catalogued surface to its
  governing KI.

Next authorized pass (per Phase 2 dispatch packet):
**Pass 240 — Phase 2 closeout + STOP gate.**
