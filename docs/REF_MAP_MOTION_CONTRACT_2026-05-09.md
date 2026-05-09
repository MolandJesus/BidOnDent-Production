---
status: CANONICAL
authority: REFERENCE
scope: map-motion-transition-contract
canonical_source_of_truth: REF_MAP_MOTION_CONTRACT_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Formalizes flyTo semantics, reduced-motion inheritance, interruption behavior, camera restoration, gesture precedence, transition timing classes, escalation/handoff animation semantics, and route-follow camera philosophy across the BidOnDent map runtime. Cross-references LAW_ANIMATION_AND_ATMOSPHERE. Block D / Pass 231d deliverable.
last_updated: 2026-05-09
---

# REF — Map Motion + Transition Contract

> Block D / Pass 231d deliverable. Formalizes the motion contract for
> the BidOnDent map runtime. Cross-references
> [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md)
> for the application-wide motion canon.
>
> Vocabulary per
> [`REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md)
> §9.

---

## §1. Premise

Camera motion in a map runtime is not decorative. It carries
information:

- **Where am I going next** (a `flyTo` toward a destination shows the
  user the spatial relationship).
- **Where I just was** (return-to-prior-frame after a brief detour).
- **What just changed** (route updated, viewport snapped to result).

Inconsistent motion across the three engines breaks the user's
spatial intuition. This contract makes the motion legible.

---

## §2. Motion classes

Three classes, ordered by user attention cost (lowest first):

### 2.1 Class P — Passive

User-driven motion. Direct response to gesture.

- Pan, pinch-zoom, rotate, pitch (where allowed).
- Inertial decay after gesture release.
- No timing curve — pure physics.
- Interruptible by any gesture.
- Always allowed in Tier A. Suppressed entirely in Tier B (preview).

### 2.2 Class A — Acknowledgement

Brief programmatic motion confirming a user action.

- Snap-to-pin after pin tap.
- Recenter button → return to user location.
- Layer toggle → maintain viewport (no motion).
- Duration: 200–400ms.
- Easing: `ease-out` (no overshoot).
- Interruptible by any gesture.
- Reduced-motion: instant snap, no animation.

### 2.3 Class O — Operational

Long programmatic motion driven by Operational runtime.

- Route-follow camera during guidance (continuous bearing + position).
- "Recenter on route" after user pan-away during guidance.
- "Show full route" on guidance start.
- Duration: 600–1200ms for one-shot, continuous for follow.
- Easing: `ease-in-out`.
- Interruptible by gesture (yields to Class P) but RECLAIMS after
  configurable idle (default 8s).
- Reduced-motion: jump-cut (no smooth interpolation), follow disabled
  unless user opts in.

---

## §3. Per-engine motion authority

Engine motion authority MUST conform to this table. LAW contract §2
binds; this is the runtime-vocabulary expression.

| Engine | Class P | Class A | Class O | Camera authority |
|---|---|---|---|---|
| Engine 1 (canvas, Tier A, Exploratory) | full | declarative `flyTo` keyed to revision | none (no Operational on this engine in current scope) | uncontrolled + revision-keyed declarative |
| Engine 2 (shop directory pane, Tier A, Exploratory + Operational) | full when not in guidance; constrained pitch otherwise | declarative `flyTo` keyed to revision (target state) | declarative route-follow controller (target state) | uncontrolled + revision-keyed declarative (target state) |
| Engine 3 (preview, Tier B, Preview) | none (suppressed) | none | none | controlled `{...viewState}` per caller |

Engine 2's CURRENT implementation uses imperative `useMap()` +
`map.flyTo()` for Class A and Class O. This is the KI-180 LAW
conformance gap. Phase 2 pass 237 closes it.

---

## §4. Reduced-motion contract

Per
[`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md)
the application honors `prefers-reduced-motion: reduce`. The map
runtime extends this:

| Class | reduce response |
|---|---|
| Class P | unaffected (user-driven, not programmatic) |
| Class A | jump-cut, no interpolation, duration 0 |
| Class O | jump-cut for one-shot moves; route-follow falls back to "tap to recenter" only — no continuous follow |

**Inheritance rule:** the reduced-motion query is read at the engine
boundary, NOT at the call site. Every `flyTo` invocation MUST consult
the engine's reduced-motion state before issuing its duration
argument. The engine MAY emit `duration: 0` when reduce is set, OR
swap to `jumpTo` semantics — implementation choice.

**Today's gap:** Engine 2 imperative `flyTo` does not consult the
query (KI-180). Engine 3 has no `flyTo`. Engine 1's declarative
controller respects the query via the `transitionDuration` prop
binding to the reduced-motion hook.

---

## §5. Interruption rules

Every animated motion MUST be interruptible. Specifically:

| Motion | Interrupted by | Result |
|---|---|---|
| Class A | Class P (any gesture) | gesture wins, animation cancels at current frame |
| Class A | Class O (programmatic preempt) | only allowed if O is route-follow priority; otherwise queued |
| Class O continuous | Class P (gesture) | gesture wins; O yields and reclaims after idle (§2.3) |
| Class O one-shot (e.g. "show full route") | Class P (gesture) | gesture wins, O cancels |
| Class O one-shot | Class A | A queued or dropped (engine choice) |

**Forbidden:** any motion that cannot be interrupted by gesture.
Even guidance-mode camera follow yields to user pan.

**Forbidden:** any motion that locks the camera in a state the user
cannot escape via gesture (no "kiosk lock" without an explicit
exit affordance).

---

## §6. Camera restoration

When a motion completes (or is interrupted), the camera state MUST be
predictable.

| Scenario | Restored state |
|---|---|
| Class A completes naturally | target state |
| Class A interrupted | gesture-current state (no snap-back) |
| Class O continuous yields to gesture | gesture-current state |
| Class O continuous reclaims after idle | smooth interpolation back to follow position |
| Class O one-shot completes | target state |
| Class O one-shot interrupted | gesture-current state (NOT target) |
| Component remount (revision-keyed) | last-applied target state from props |
| Page reload (Operational only) | restored from cloud session per P5 |
| Page reload (Exploratory) | last persisted viewport per surface (P8); cold mount otherwise |
| Page reload (Preview) | caller-supplied viewport on every render |

**Forbidden:** snap-back-on-release. If the user pans away from a
follow camera, releasing the gesture must NOT instantly snap back —
that breaks user trust in the camera. Reclaim happens only after
idle (§2.3).

---

## §7. Gesture precedence

When multiple gestures are theoretically possible:

1. Single-finger pan: Class P pan motion.
2. Two-finger pinch: Class P zoom motion.
3. Two-finger rotate: Class P rotate motion (where allowed by tier).
4. Two-finger drag (vertical): Class P pitch (where allowed).
5. Single tap on pin: Class A snap-to-pin (Tier A) OR pin select +
   sheet open (per shell rules).
6. Single tap on map: clear selection, no Class A motion.
7. Long-press on map: context menu (Tier A) OR no-op (Tier B+C).
8. Double-tap: Class A zoom-in (Tier A) OR Class A escalate-to-
   exploratory (Tier B).

**Tier B gesture suppression:** items 1–4 + 6–8 disabled. Only item
5 (tap on pin) is active, and it triggers escalation per
[`REF_MAP_SHELL_HIERARCHY_2026-05-09.md`](REF_MAP_SHELL_HIERARCHY_2026-05-09.md)
§4.2.

**Tier C suppression:** items 1–8 ALL disabled.

---

## §8. Transition timing classes

For programmatic transitions BETWEEN runtime sub-runtimes (the
escalation/handoff transitions in
[`REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md)
§7), motion participates in the handoff:

| Handoff | Motion | Duration | Easing |
|---|---|---|---|
| Preview → Exploratory (expand) | Class O one-shot from preview viewport to exploratory entry viewport | 600ms | ease-in-out |
| Exploratory → Operational (commit) | Class O one-shot from current viewport to "show full route" frame | 800ms | ease-in-out |
| Operational → Exploratory (end) | Class A one-shot to release follow, restore user-controlled viewport | 400ms | ease-out |
| Operational → Operational (destination change) | Tear-down + fresh escalation; no continuous motion across the boundary | n/a | n/a |

Reduced-motion: every handoff Class O above falls back to instant
viewport set. Class A handoff falls back to instant snap.

---

## §9. Route-follow camera philosophy

The Operational runtime's route-follow camera is the most
attention-heavy motion in the system. Its behavior MUST be:

- **Continuous, not stepped.** Smooth interpolation along the route
  geometry between GPS fixes, not jumpy per-fix updates.
- **Lookahead-biased.** Camera position offset along the route
  bearing so the next instruction is visible.
- **Pitch-elevated (where supported).** 65° pitch in guidance mode
  to give a 3D forward view. Tier-B preview does NOT do this.
- **Bearing-locked to route, NOT to GPS heading.** GPS bearing is
  noisy at low speeds; route bearing is stable.
- **Yielding to gesture per §5.** User pan-away pauses follow;
  reclaims after 8s idle.
- **Honoring reduced-motion per §4.** Continuous follow disabled;
  user must tap "Recenter" for each frame update.

**Today's implementation:** Engine 2 implements all of this
imperatively. Phase 2 must preserve this behavior while moving to
declarative camera authority. The route-follow controller becomes
a declarative target-state computation; engine still smooths the
interpolation. Behavior preservation is the binding constraint of
Phase 2.

---

## §10. Cross-reference: LAW_ANIMATION_AND_ATMOSPHERE

[`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md)
provides:

- the application-wide trust + spatial-continuity filter,
- the 29 canonical keyframes,
- the mandatory `prefers-reduced-motion` contract,
- the CSS-first lock,
- the framer-motion escape clause.

This map motion contract specializes those rules to the map
runtime. Where the two conflict, LAW_ANIMATION_AND_ATMOSPHERE wins
(LAW > REF). No conflicts identified at draft time of this doc.

The map motion contract adds:

- Class P/A/O classification,
- per-engine authority table (§3),
- interruption behavior rules (§5),
- camera restoration rules (§6),
- handoff motion semantics (§8),
- route-follow philosophy (§9).

These are all map-runtime-specific elaborations and do not displace
the LAW.

---

## §11. Status

- **Block D / Pass 231d:** COMPLETE.
- **Authority:** REFERENCE / CANONICAL / runtime_impact_if_misunderstood: high.
- **Binding:** Phase 1+ convergence passes touching motion must
  declare class (P/A/O), reduced-motion conformance, interruption behavior,
  and restoration behavior per the §3/§4/§5/§6 tables.
- **Next pass:** 231e — Test Infrastructure Prefix (test-only source
  changes authorized).
