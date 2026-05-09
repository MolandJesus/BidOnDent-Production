---
status: CANONICAL
authority: REFERENCE
scope: map-ux-interaction-cohesion
canonical_source_of_truth: REF_MAP_UX_COHESION_AUDIT_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Behavioral cohesion audit across the three map runtime engines — viewport, gesture, route preview, navigation interruption, panel/map focus, motion, mental-model continuity.
last_updated: 2026-05-09
---

# Map UX + Interaction Cohesion Audit (2026-05-09)

> Block C / Pass 225.5 deliverable. Read-only audit. No runtime changes.
>
> Added to Block C between Pass 225 and Pass 226 per owner directive
> 2026-05-09: **"Map UX consistency is architecture. Not aesthetics."**
> This pass is **not visual polish, not marketing UX**. It documents
> behavioral and interaction inconsistencies between the three map
> runtime engines so that Pass 226's lifecycle contract can lock the
> right invariants.
>
> Companions:
>
> - [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) — Pass 223 (structural / engine layer)
> - [`REF_NAVIGATION_AUTHORITY_2026-05-09.md`](REF_NAVIGATION_AUTHORITY_2026-05-09.md) — Pass 224 (orchestration layer)
> - [`REF_DASHBOARD_PREVIEW_DUPLICATION_2026-05-09.md`](REF_DASHBOARD_PREVIEW_DUPLICATION_2026-05-09.md) — Pass 225 (Engine 3 caller analysis)
> - [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon

---

## §1. Headline finding

The three runtime engines deliver **three different interaction
contracts** to users. The differences are not stylistic — they are
behavioral. The same gesture means different things on different
surfaces; the same word ("navigation") triggers different runtimes; a
camera move on one surface uses a different authority model than a
camera move on the next surface.

This is the "conceptual fragmentation" cost the owner flagged when
defining Block C. It is invisible in screenshots and visible only to
users who move between surfaces.

---

## §2. Gesture contract per engine

| Gesture           | Engine 1 (canonical)              | Engine 2 (shop dir)               | Engine 3 (preview)                 |
| ----------------- | --------------------------------- | --------------------------------- | ---------------------------------- |
| `scrollZoom`      | enabled (default)                 | enabled (default)                 | **suppressed**                     |
| `dragPan`         | enabled (default)                 | enabled (default)                 | **suppressed**                     |
| `dragRotate`      | enabled (default)                 | enabled (default)                 | **suppressed**                     |
| `doubleClickZoom` | enabled (default)                 | enabled (default)                 | **suppressed**                     |
| `touchZoomRotate` | enabled (default)                 | enabled (default)                 | **suppressed**                     |
| `keyboard`        | enabled (default)                 | enabled (default)                 | **suppressed**                     |
| `minZoom`         | `2` immersive / `8` non-immersive | `12` guidance / `3` browse        | n/a (no caps; controlled viewport) |
| `maxZoom`         | n/a (no cap)                      | `19`                              | n/a (controlled)                   |
| `maxPitch`        | n/a (no cap)                      | `65` (sat or guidance) / `0` else | n/a (controlled)                   |

**Findings:**

1. **Engines 1 and 2 share the "all gestures live" contract** but diverge
   on zoom/pitch caps. Engine 2 dynamically gates pitch on tile mode +
   navigation mode — Engine 1 does not gate at all.
2. **Engine 3 is the only fully gesture-suppressed engine.** This is
   correct for previews, but it means a user touching a preview gets
   silent no-op behavior. There is no surface affordance saying "tap
   the map to expand"; the `onMapClick` handler is the entire
   interaction vocabulary. Pass 226 contract should make this contract
   explicit per Tier.
3. **Pitch behavior is the most fragmented dimension.** Engine 1 has
   no pitch cap (free 3D tilt). Engine 2 caps pitch at 0° unless
   guidance mode is active OR satellite tiles are on. Engine 3 cannot
   pitch at all. Three engines, three pitch contracts.

---

## §3. Camera authority + viewport behavior continuity

Combining Pass 223 § 4.3 (camera authority) with this pass's gesture
contract:

| Engine | Camera authority                                                | User gesture                                                            | Programmatic camera move                                                                                       |
| ------ | --------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1      | Uncontrolled + revision-keyed declarative controllers (3 hooks) | Lives — user can freely pan/zoom; controllers re-apply on revision bump | Setting `revision` triggers a re-application of the declarative camera spec                                    |
| 2      | Imperative `useMap()` + `key={mapRenderNonce}` hard-remount     | Lives — same as Engine 1                                                | Imperative `map.flyTo` / `map.fitBounds` from inside `MapLibreShopDirectoryViewportManager`                    |
| 3      | Controlled `{...viewState}` + `onMove`                          | n/a — gestures suppressed                                               | Setting `viewState` from parent `useEffect` (auto-fit overrides caller-supplied center/zoom; see Pass 225 § 4) |

**Mental-model breakage:** a user who expects "the map remembers where I
panned" gets that on Engines 1 and 2. On Engine 3 there is nothing to
remember (gestures off). A developer who expects "I can call `flyTo`
from outside" gets it on Engine 2 only — Engines 1 and 3 require setting
state instead.

**Cross-surface continuity:** if a user pans the coverage map (Engine 1),
then opens shop directory (Engine 2), the camera does NOT carry over.
Each engine has its own viewport state. There is no shared camera bus.
This is fine for v1, but Pass 226 contract should declare it explicitly:
"camera state is engine-local; cross-surface continuity is out of scope."

---

## §4. Navigation runtime continuity

Per Pass 224 § 5, the word "navigation" denotes two different runtimes
depending on which surface the user is on. From a UX cohesion lens:

| Behavior             | Coverage surface (Host A → Engine 1) | Shop directory surface (Host B → Engine 2) |
| -------------------- | ------------------------------------ | ------------------------------------------ |
| Voice prompts        | silent                               | speaks                                     |
| Toast feedback       | none                                 | fires                                      |
| Wake-lock            | not held                             | held                                       |
| Reload survival      | route lost                           | route restored from cloud                  |
| Reroute on deviation | refetch on origin change             | gated `shouldTriggerReroute` + cooldown    |

**Finding:** A user activating "navigation" on the coverage map gets a
**different product** than a user activating "navigation" on the shop
directory. There is no UI label distinguishing the two. From the user's
mental model, "navigation" is one thing; from the runtime, it is two.

This is the highest-impact behavioral inconsistency in the audit. Pass
226 contract should require:

- either Host A grows into Host B's contract (preferred from continuity),
- or coverage navigation is explicitly classified as Tier B preview-only
  (does not enter "live navigation" — see Pass 227 tier classification).

---

## §5. Motion + transition coherence

Per `LAW_ANIMATION_AND_ATMOSPHERE.md` motion canon (29 keyframes,
prefers-reduced-motion contract, CSS-first lock).

| Surface             | Camera transition                                                                               | Layer fade-in                                                                                   | Reduced-motion respect                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Engine 1 (coverage) | Declarative controllers — durations defined per controller (viewport, follow-location, arrival) | Layer authority centralized in MapLibreCoverageMapLayers — fades respect reduced-motion via CSS | ✓ (verified via scripts/audit-reduced-motion.mjs)                                                     |
| Engine 2 (shop dir) | Imperative `flyTo` — duration arg passed inline at call sites                                   | Layer authority distributed across 4 children — fade timing inconsistent across layers          | ⚠ partial — `flyTo` calls do not consult `prefers-reduced-motion` matchMedia before passing duration |
| Engine 3 (preview)  | None (gestures off; viewState set instantly via setViewState in parent useEffect)               | n/a — preview renders shops/reports as static layers                                            | ✓ trivially (no motion to suppress)                                                                   |

**Finding:** Engine 2's imperative `flyTo` calls bypass the reduced-motion
contract. This is a LAW conformance gap that Pass 226 contract should
require Engine 2 (or its successor) to fix. It is not a Pass 225.5 fix —
this audit only documents.

---

## §6. Panel/map focus coordination

Each surface has its own model for "what gets focus when the user opens a
panel that overlaps the map":

| Surface                      | Panel                                                                    | Map gestures while panel open            | Map auto-fit on panel close                                |
| ---------------------------- | ------------------------------------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------- |
| Coverage (Engine 1)          | Coverage filter sheet, report detail sheet                               | Live (gestures still work behind sheet)  | Sheet close re-applies last revision (declarative camera)  |
| Shop directory (Engine 2)    | Shop detail sheet, navigation route preview, navigation guidance overlay | Live but pitch capped at 65° in guidance | Sheet close fires imperative `flyTo` to last selected shop |
| Dashboard preview (Engine 3) | n/a — previews live inside cards, not under sheets                       | n/a — gestures suppressed                | n/a — auto-fit recalculates on prop change                 |

**Finding:** Cross-surface, "panel close" behavior is engine-specific. A
user doesn't necessarily notice — but a developer adding a new panel to
the coverage map cannot copy/paste from shop directory; the camera
authority is different.

---

## §7. Mental-model continuity matrix

For a user moving between map surfaces in a single session:

| User-facing concept                   | Coverage map         | Shop directory                        | Dashboard preview        |
| ------------------------------------- | -------------------- | ------------------------------------- | ------------------------ |
| "I can tilt the map"                  | yes (free)           | yes if guidance OR satellite          | no                       |
| "I can zoom out fully"                | yes if immersive     | no — capped at minZoom 12 in guidance | no                       |
| "I can tap a shop"                    | yes                  | yes                                   | yes (single onShopClick) |
| "I can tap a report"                  | yes                  | n/a (no report layer)                 | yes (onReportPinClick)   |
| "Pinch zoom works"                    | yes                  | yes                                   | NO                       |
| "If I refresh, my route is preserved" | NO                   | yes                                   | n/a                      |
| "Voice tells me when to turn"         | NO                   | yes                                   | n/a                      |
| "Toasts confirm reroute"              | NO                   | yes                                   | n/a                      |
| "Map remembers my last position"      | yes (revision-keyed) | yes (imperative state)                | NO (auto-fit overrides)  |
| "Tap behind a sheet still pans"       | yes                  | yes                                   | n/a                      |

**Implication:** Six of the ten rows above show inter-surface inconsistency.
This is the cohesion debt Block C is meant to surface. Pass 226 contract
should target the rows that matter most for trust: route preservation,
voice prompts, reroute confirmation, and pinch-to-zoom on previews
(currently no, but a tap-to-expand affordance could compensate).

---

## §8. Behavioral risks for first runtime convergence pass

When the first runtime convergence pass is authorized post-Pass 230, the
following behavioral preservation requirements should be locked in
Pass 226 contract:

1. **Engine 2's imperative flyTo behavior** is user-visible for the
   navigation route preview animation. Any swap to the canonical engine
   must preserve the perceived smoothness or the user will feel it.
2. **Engine 1's revision-keyed declarative camera** has no perceptual
   issue today; preservation is mostly developer-facing.
3. **Engine 3's auto-fit-overrides-caller behavior** (Pass 225 § 4) is
   a UX subtlety: callers think they set zoom; they don't (when ≥2
   shops). Any convergence that exposes caller-supplied zoom for
   currently-suppressed cases will visually move the map. Behavioral
   regression risk: medium.
4. **Gesture suppression on Engine 3** is perceptual: users have learned
   "preview = static." Any convergence that enables gestures on preview
   surfaces must be gated by an explicit Tier B opt-in or it will
   surprise users.
5. **Pitch-cap inconsistency** (Engine 2) is a discoverability risk: a
   user pitching freely on the coverage map and then trying to pitch
   on shop dir browse mode will hit a cap with no UI feedback. Pass 226
   should declare: "pitch caps are intentional per surface" or unify.

---

## §9. Findings summary

1. **Three engines, three gesture contracts.** Engines 1 and 2 share the
   "all gestures live" baseline; Engine 3 is fully suppressed. Pitch
   behavior is the most fragmented dimension (free / mode-gated / off).
2. **Camera authority is engine-local.** No cross-surface camera bus.
   Pass 226 contract should declare this explicitly out of scope.
3. **"Navigation" denotes two different runtimes** with materially
   different user-facing behavior (voice, toast, wake-lock, reload
   survival, reroute gating). Highest-impact cohesion gap. Pass 226
   contract should require either Host A grows into Host B, or coverage
   surface is reclassified as preview-only.
4. **Engine 2's imperative `flyTo` bypasses prefers-reduced-motion.** LAW
   conformance gap to fix during convergence (not in this pass).
5. **Engine 3's auto-fit silently overrides caller-supplied viewport.**
   Hidden authority (per Pass 225 § 4); contract must make explicit.
6. **Mental-model continuity matrix shows 6/10 rows inconsistent.** Pass
   226 should target trust-critical rows first: route preservation,
   voice/toast feedback, reroute confirmation.
7. **Pitch caps are inconsistent and undiscoverable.** Pass 226 should
   either declare per-surface intent or unify.

**Hand-off to Pass 226:** Pass 226 drafts the LAW_MAP_RENDERER_CONTRACT.md
(LAW-tier, requires_owner_approval:true, safe_for_autopilot:false). It
must:

- Pick ONE canonical camera authority model.
- Lock `maplibreResizePatch` pre-mount as a contract obligation.
- Inherit Engine 2's failure-surface (onLoad/onError + error boundary +
  container gating).
- Per-instance `id` strategy (Engine 3 pattern).
- Declare Tier A vs Tier B behavioral contracts (using this pass's §2
  gesture matrix and §7 continuity matrix as input).
- Lock convergence-pass requirements per owner: rollback plan, renderer
  ownership diff, lifecycle before/after table, affected surfaces list,
  orchestration authority diff, runtime-risk classification, required
  test coverage.
