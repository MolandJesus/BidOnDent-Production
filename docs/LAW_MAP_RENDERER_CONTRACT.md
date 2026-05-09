---
status: DRAFT
authority: LAW
scope: map-renderer-contract
canonical_source_of_truth: LAW_MAP_RENDERER_CONTRACT.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: critical
ai_summary: LAW-tier draft contract for the canonical map runtime — camera authority, lifecycle obligations, tier classification, and required convergence-pass discipline.
last_updated: 2026-05-09
---

# LAW — Map Renderer Contract (DRAFT)

> Block C / Pass 226 deliverable. **DRAFT — not yet enforced.** This
> document becomes binding only when the owner ratifies it (status:
> CANONICAL) at or after Pass 230. Until ratification it documents the
> intended contract for the runtime convergence work that follows.
>
> Authority tier: **LAW**. Once ratified, conflicts with REF or PLAN
> docs are resolved in favor of this doc per LAW > REF > PLAN.
>
> **Safe for autopilot:** false. **Requires owner approval:** true.
> Any change to a ratified version requires explicit owner sign-off.
>
> Inputs:
>
> - [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) — Pass 223
> - [`REF_NAVIGATION_AUTHORITY_2026-05-09.md`](REF_NAVIGATION_AUTHORITY_2026-05-09.md) — Pass 224
> - [`REF_DASHBOARD_PREVIEW_DUPLICATION_2026-05-09.md`](REF_DASHBOARD_PREVIEW_DUPLICATION_2026-05-09.md) — Pass 225
> - [`REF_MAP_UX_COHESION_AUDIT_2026-05-09.md`](REF_MAP_UX_COHESION_AUDIT_2026-05-09.md) — Pass 225.5
> - [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md)
> - [`LAW_LAYERED_ARCHITECTURE.md`](LAW_LAYERED_ARCHITECTURE.md)

---

## §1. Purpose

This contract defines the obligations every map runtime in BidOnDent
must satisfy, and the discipline every convergence pass must follow.

It does **not** mandate a single engine. It mandates a single contract
that all engines must conform to. Within that contract, engines are
classified into tiers (§4) with explicit per-tier obligations.

The contract exists to:

- prevent silent regression of trust-critical behavior (route
  preservation, voice/toast feedback, reroute confirmation),
- make convergence safe by requiring explicit per-pass discipline,
- give Tier A (canonical) and Tier B (preview) engines different but
  compatible contracts so previews are not forced to ship live-nav
  machinery,
- end the "hidden authority" patterns (auto-fit overrides, dual session
  semantics, imperative camera bypassing motion canon) surfaced in
  Passes 223 / 224 / 225 / 225.5.

---

## §2. Camera authority — single canonical model

**Canonical model: uncontrolled viewport + revision-keyed declarative
controllers** (the Engine 1 / `MapEngineCanvas` pattern).

Rationale:

- Declarative re-application on a `revision` bump is provably idempotent;
  imperative `flyTo` is not.
- Controllers can be composed (viewport, follow-location, arrival) without
  cross-controller coordination overhead.
- It is already the pattern proven safe across the canonical interactive
  surface (coverage map).

Tier A engines MUST use this model. Tier B engines MAY use a controlled
viewport (Engine 3 pattern) under the explicit Tier B opt-in declared in
§4.2.

**Imperative `useMap()` camera mutation is FORBIDDEN in Tier A engines**
once this contract ratifies. Tier A `flyTo` style transitions must be
expressed as a controller that responds to a revision bump, not as a
direct call from a hook into a map ref.

---

## §3. Lifecycle obligations (all tiers)

Every map runtime — Tier A, Tier B, or Tier C — MUST satisfy:

1. **Pre-mount resize patch import.** `maplibreResizePatch` MUST be
   imported before the first map mount in the bundle. Removal
   triggers blank-canvas regressions (Pass 192 / Pass 223 § 5).
   This is a non-negotiable invariant.
2. **Per-instance `id` strategy.** Map containers MUST use a stable
   per-instance id (Engine 3's `useId()` pattern) when more than one
   map of the same engine can mount in the same tree, OR a static id
   when only one is possible per route. Static ids that collide
   across simultaneous mounts are FORBIDDEN.
3. **`onLoad` and `onError` handlers MUST be wired.** No engine may
   ship without both. Failure-surface gaps (Engine 1 today) are a
   conformance debt to repair during convergence.
4. **Error boundary parent.** Every map mount MUST be wrapped in an
   error boundary that can re-mount the map without re-mounting the
   surrounding shell. Engine 2's `NavigationErrorBoundary` is the
   reference pattern.
5. **Container gating.** The map MUST NOT mount before its container
   has non-zero dimensions. Engine 2's container-gating pattern is
   the reference.
6. **`prefers-reduced-motion` contract.** Camera transitions MUST
   consult the prefers-reduced-motion media query before issuing any
   animated camera movement. Engine 2's imperative `flyTo` calls
   that bypass this contract today (Pass 225.5 § 5) are a LAW gap to
   close during convergence.

---

## §4. Map runtime tiers

Three tiers, with per-tier behavioral contracts. Every map mount MUST
be classified into exactly one tier, and that classification MUST be
declared at the call site (prop or component-level convention to be
locked in Pass 227).

### 4.1 Tier A — canonical interactive

**Definition:** the map IS the surface. The user expects to interact
with it as a primary control.

**Obligations:**

- Canonical camera authority model (§2).
- All gestures live by default (`scrollZoom`, `dragPan`, `dragRotate`,
  `doubleClickZoom`, `touchZoomRotate`, `keyboard`).
- Pitch policy: free (no cap) UNLESS surface declares an explicit
  per-mode cap with documented user-discoverable affordance.
- Live navigation runtime fully wired: voice, toast, wake-lock, reroute
  gating, cloud session sync (per Host B contract from Pass 224).
- Camera state engine-local; no cross-surface camera continuity claim.

**Today:** the coverage map (Engine 1) and shop directory map (Engine 2) both nominally fit this tier, but coverage map fails the live
navigation obligation (Pass 224 § 5). Convergence MUST resolve this:
either coverage navigation grows into the full Host B runtime, OR the
coverage surface is reclassified as Tier B preview-only.

### 4.2 Tier B — operational preview

**Definition:** the map COMMUNICATES context but is not the primary
control. User taps the map to expand, navigate, or focus, but does not
manipulate camera directly.

**Obligations:**

- Controlled viewport ALLOWED (Engine 3 pattern is the reference).
- Gestures suppressed by default.
- Tap-to-expand affordance MUST be visible (no silent suppression).
- Auto-fit-vs-caller-supplied viewport authority MUST be explicit at
  call site (e.g. via prop `autoFit: 'always' | 'when-no-caller-bounds' | 'never'`).
  Hidden auto-fit overrides (Pass 225 § 4) are FORBIDDEN once this
  contract ratifies.
- No live navigation runtime. If a user wants to navigate, the surface
  MUST hand off to a Tier A surface, not start a live nav session
  inside the preview.

**Today:** all 6 callers of `MapLibreDashboardMapPreview` fit this tier
(Pass 225 § 2). The component itself fits the tier; the only gap is
the explicit caller-side declaration.

### 4.3 Tier C — decorative / embedded

**Definition:** the map is purely visual — a thumbnail, a backdrop, a
loading state. No user interaction expected.

**Obligations:**

- Controlled viewport REQUIRED.
- All gestures suppressed.
- No camera transitions (or only opacity/cross-fade).
- No navigation runtime.
- No outbound user actions wired.

**Today:** no engine targets this tier explicitly. Some `ReportDetailScreen`
single-pin uses are arguably Tier C (Pass 225 § 2). Pass 227 sequencing
will decide whether Tier C deserves a dedicated engine or whether Tier
B with stricter props suffices.

---

## §5. Convergence-pass discipline

Every runtime convergence pass — i.e., every pass that changes which
engine a surface uses, or changes a Tier A / B / C classification — MUST
include the following before merging:

### 5.1 Required artifacts

1. **Rollback plan.** A specific, executable revert path. "Revert the
   commit" alone is not a rollback plan; downstream state cleanup must
   be specified if any.
2. **Renderer ownership diff.** A before/after table showing which
   engine each affected surface mounts.
3. **Lifecycle before/after table.** What `onLoad`, `onError`, error
   boundary, container gating, and resize patch behavior changes per
   surface.
4. **Affected surfaces list.** Every screen, route, or modal where the
   converged surface appears, with a 1-line behavioral description per.
5. **Orchestration authority diff.** Which orchestration host (per Pass 224) owns each surface before and after. If the host changes, what
   navigation runtime contract changes with it.
6. **Runtime-risk classification.** One of: low (preview-to-preview
   swap), medium (Tier B → Tier A or vice versa with no orchestration
   change), high (Tier A → Tier A engine swap), critical (any change
   that affects a live navigation runtime).
7. **Required test coverage.** Per Pass 228 gap analysis (forthcoming):
   minimum test coverage required to ship at the declared risk level.

### 5.2 Required validations

- Build passes.
- Mount/unmount tests for every affected surface.
- Visual diff for every affected surface (mobile + desktop).
- Reduced-motion contract conformance verified for any animated camera.
- For Tier A changes: live navigation runtime smoke test (route fetch,
  reroute trigger, voice fire, toast fire, wake-lock acquisition,
  cloud session restore).
- For Tier B changes: tap-to-expand affordance verified visible.

### 5.3 Per-pass commit discipline

- One pass = one commit (existing rule, reaffirmed here).
- Pass title MUST cite this contract: `convergence(map): Pass N — <surface> — Tier <X> per LAW_MAP_RENDERER_CONTRACT`.
- Commit body MUST include §5.1 artifacts.

### 5.4 Hard stops

A convergence pass MUST stop and request explicit owner approval if it
would:

- Change a Tier A surface's orchestration host.
- Remove a navigation runtime capability from any surface (voice, toast,
  wake-lock, cloud session, reroute gating).
- Modify the canonical camera authority model.
- Change the tier classification of any surface.
- Touch any owner-dirty file at the time of execution.

---

## §6. Post-ratification migration plan (informational)

Once this contract ratifies (Pass 230 owner gate), the runtime
convergence sequence executes per `PLAN_MAP_CONVERGENCE_SEQUENCE`
(Pass 227 forthcoming). The first convergence pass is expected to
target the lowest-risk surface (per Pass 225 § 6.2:
`ReportDetailScreen` Tier C / Tier B candidate).

Each subsequent pass follows §5 discipline. The convergence may take
many passes; the contract makes that explicit and acceptable. Speed
is not the goal — preserving trust-critical behavior is the goal.

---

## §7. Open questions for owner ratification

These questions MUST be resolved before this draft becomes CANONICAL:

1. **Coverage navigation:** Tier A (grow into Host B) or Tier B
   (declare preview-only)? Owner decides.
2. **Pitch caps:** unify across surfaces, or declare per-surface intent?
   Owner decides.
3. **Cross-surface camera continuity:** explicitly out of scope, or
   future feature?
4. **Tier C dedicated engine:** required, or Tier B with stricter
   props sufficient?
5. **Imperative `flyTo` deadline:** must Engine 2 stop using it before
   any other convergence work, or is it acceptable as a known gap until
   Engine 2 itself converges?

These are tracked here, not resolved here. Pass 230 dispatch packet
will surface them for explicit owner input.

---

## §8. Status

- **Drafted:** 2026-05-09 (Pass 226).
- **Status:** DRAFT.
- **Ratification gate:** Pass 230 owner approval.
- **Until ratification:** this doc is REFERENCE-effective (LAW intent,
  not yet binding).
- **After ratification:** authority becomes LAW; conflicts with REF/PLAN
  resolved in favor of this doc.
