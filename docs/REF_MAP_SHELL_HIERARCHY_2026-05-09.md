---
status: CANONICAL
authority: REFERENCE
scope: map-shell-layout-hierarchy
canonical_source_of_truth: REF_MAP_SHELL_HIERARCHY_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Runtime spatial architecture audit of the map shell. Documents shell hierarchy, panel layering, dock/overlay semantics, modal routing, focus ownership, map-first vs panel-first behavior, mobile/desktop divergence, bottom-sheet philosophy, immersive-mode rules, and dashboard embedding consistency. NOT visual polish. Block D / Pass 231c deliverable.
last_updated: 2026-05-09
---

# REF — Map Shell + Layout Hierarchy Audit

> Block D / Pass 231c deliverable. **NOT visual polish.** This is
> runtime spatial architecture: how the map runtime composes with the
> rest of the application shell.
>
> Vocabulary per
> [`REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md)
> §9. Path references per
> [`REF_CANONICAL_RUNTIME_PATHS_2026-05-09.md`](REF_CANONICAL_RUNTIME_PATHS_2026-05-09.md)
> §1.

---

## §1. Premise

A map surface is never the entire app shell. It is composed with:

- a global navigation chrome (top bar / role tabs / sign-in surface),
- one or more side or bottom panels that contextualize the map,
- one or more overlays (toasts, modals, sheets) that interrupt or
  augment the map,
- and the surrounding application route stack.

The **shell hierarchy** governs which of these layers owns:

- screen real estate,
- focus,
- back-button semantics,
- dismissal behavior,
- keyboard input,
- accessibility traversal order.

When shell hierarchy is inconsistent across map-bearing surfaces,
the user's mental model fragments — even if every individual surface
is internally well-formed.

---

## §2. Surface inventory (8 map-bearing surfaces)

| Surface                  | Sub-runtime               | Shell role            | Map role           |
| ------------------------ | ------------------------- | --------------------- | ------------------ |
| Coverage map             | Exploratory               | dedicated route       | full-bleed primary |
| Shop directory map       | Exploratory + Operational | dedicated route       | full-bleed primary |
| CustomerMapWidget        | Preview                   | dashboard widget      | embedded panel     |
| ShopMapWidget            | Preview                   | dashboard widget      | embedded panel     |
| InsurerMapWidget         | Preview                   | dashboard widget      | embedded panel     |
| ReportsListScreen        | Preview                   | list-screen header    | embedded banner    |
| ReportDetailScreen       | Preview                   | detail-screen section | embedded card      |
| CompetitorAnalysisScreen | Preview                   | analysis screen       | embedded panel     |

Two distinct shell archetypes:

- **Archetype 1 — Map-first surface:** map is the primary content,
  shell chrome wraps it. Coverage map, shop directory map.
- **Archetype 2 — Panel-first surface:** map is embedded
  context inside a non-map screen. The 6 preview callers.

The shell-hierarchy rules differ by archetype.

---

## §3. Map-first archetype — shell rules

For coverage map + shop directory map.

### 3.1 Layer stack (top to bottom in z-axis)

1. **System layer** — toasts, alerts, error overlays. Always
   topmost. Dismissed by user or by timeout.
2. **Modal layer** — full-screen modals (route confirmation, sign-in
   prompt, etc.). Owns focus while open. Dismissable via back
   button OR explicit close.
3. **Sheet layer** — bottom sheet (mobile) or right-side panel
   (desktop). Owns secondary focus. Map remains visible behind/beside.
4. **Overlay controls layer** — floating buttons (recenter, layers,
   zoom). Tap-through transparent regions. Never own focus by
   default.
5. **Map canvas layer** — Engine 1 / Engine 2 root.
6. **Background layer** — solid app background visible only during
   map load + on Engine error fallback.

### 3.2 Focus ownership

- When sheet OR modal is open: that layer owns focus.
- When only overlay controls exist: map canvas is the focus target
  (canvas is the user's primary affordance).
- Focus must be **observable**: map canvas focus indicated by
  cursor/touch behavior, no invisible focus traps.

### 3.3 Back-button + dismissal behavior

- Modal: back dismisses modal, returns to previous shell state.
- Sheet (mobile): back collapses sheet (full → peek → closed). Each
  collapse step is a separate back-button consumption.
- Sheet (desktop): back closes the sheet entirely (no peek state).
- Overlay controls: back never dismisses (they have no open state).
- Map canvas: back returns to the previous app route.

### 3.4 Mobile vs desktop divergence

| Concern                       | Mobile                             | Desktop                     |
| ----------------------------- | ---------------------------------- | --------------------------- |
| Secondary panel               | Bottom sheet (peek/half/full)      | Right-side panel (slide in) |
| Sheet collapse on map drag    | yes — drag map to collapse to peek | no — sheet persists         |
| Floating controls position    | bottom-right (thumb zone)          | top-right (cursor zone)     |
| Pin tap behavior              | open sheet at peek state           | open right-side panel       |
| Immersive mode (chrome hides) | available on intentional gesture   | not applicable              |

### 3.5 Immersive mode (mobile only)

A sustained interaction with the map (continuous pan/zoom > 1.5s,
or explicit pinch-to-fullscreen) hides:

- top navigation chrome,
- bottom tab bar,
- sheet (collapses to closed).

A single tap on the map, OR any interaction with a non-map control,
restores chrome.

**Today's implementation:** immersive mode is NOT implemented
across map-first surfaces. Each surface has its own ad-hoc behavior.
This is a gap.

---

## §4. Panel-first archetype — shell rules

For the 6 preview callers.

### 4.1 Layer stack (within the embedding screen)

1. **System layer** — same as map-first.
2. **Screen modal layer** — dialogs scoped to the embedding screen
   (e.g. "delete report" confirmation on ReportDetailScreen).
3. **Embedded preview** — Engine 3 inside a card or panel.
4. **Surrounding screen content** — list rows, detail fields, other
   widgets.

The preview **does not own focus** by default. Tab traversal goes
to the preview's "Expand" affordance, not to the map canvas itself.

### 4.2 Tap-to-expand affordance

Per
[`LAW_MAP_RENDERER_CONTRACT.md`](LAW_MAP_RENDERER_CONTRACT.md) §4
Tier B: every preview surface MUST surface a tap-to-expand
affordance. Today this is inconsistent (per
[`REF_CANONICAL_RUNTIME_PATHS_2026-05-09.md`](REF_CANONICAL_RUNTIME_PATHS_2026-05-09.md)
§5 P4 gap).

Affordance forms (any one of):

- Visible "Expand" / "View on map" button overlaid on the preview.
- Tap-anywhere-on-preview (with hover/focus indicator).
- Pin-tap escalates (with non-pin tap reserved for screen scroll).

Each of the 6 callers must declare ITS form. Phase 1 passes 232–235
formalize this.

### 4.3 Embedding consistency rules

Even with archetype variation, all preview surfaces MUST:

- Honor caller-supplied `center`+`zoom` unless explicit `autoFit`
  prop opts in.
- Surface `onLoad`/`onError` to the caller.
- Suppress all gestures (LAW §4 Tier B).
- Provide a tap-to-expand affordance (§4.2).
- Render a stable size (no layout shift after map load).
- Match the surrounding card's corner radius + border treatment.

---

## §5. Cross-archetype concerns

### 5.1 Modal routing

Today, modals are mounted at the React tree root via the shadcn
dialog primitive. This works for both archetypes but creates an
implicit rule: a modal opened from a panel-first preview surface
will RECEIVE focus over the entire app (including any visible
map-first surface on a sibling route). This is rare in practice
but documented for completeness.

### 5.2 Toast routing

Toasts (sonner) mount at the app root and float above all layers.
Toast text MUST be runtime-aware:

- Operational Navigation toasts: high-priority (route updated, route
  ended). Visible during guidance.
- Exploratory toasts: medium-priority (saved, copied).
- Preview toasts: low-priority. Should not fire from a preview
  surface.

If a Preview surface ever fires a toast, that is a runtime-leak bug.

### 5.3 Focus during route entry

When the user navigates from one surface to another (intra-app):

- New surface mounts. Focus moves to the surface's primary heading
  (a11y).
- For map-first surfaces: focus on the H1, NOT the map canvas (canvas
  focus is too disorienting on cold mount).
- For panel-first surfaces: focus on the H1; the embedded preview
  is reachable via tab.

### 5.4 Operational mini-pill (proposed)

Per
[`REF_RUNTIME_PHILOSOPHY_2026-05-09.md`](REF_RUNTIME_PHILOSOPHY_2026-05-09.md)
§4.1: when an Operational session is active and the user navigates
away from the operational surface, the runtime must either show a
"Leave navigation?" confirmation OR carry navigation state with the
user (mini-pill on shell).

The mini-pill is the preferred form. It:

- Mounts at shell level (above all routes).
- Shows next-instruction icon + ETA.
- Tap returns to the operational surface (full route preserved).
- Long-press opens "End navigation?" confirmation.

**Today's implementation:** mini-pill does NOT exist. Today's
behavior is silent loss when user navigates away (route persists in
storage and resumes on return, but no UI continuity). This is a
gap, NOT a bug — it falls out of the "leave navigation?" alternative
which also is not implemented.

Resolution: Phase 3 (depends on Branch decision; mini-pill is
Operational-runtime infrastructure).

---

## §6. Map-first vs panel-first decision rule

A new surface that wants to show a map must decide its archetype
BEFORE design. The decision rule:

**Map-first** if ANY of:

- The map is the primary task (drive there, find a shop).
- The map needs > 60% of the viewport.
- The map needs gestures live.
- The map needs operational lifecycle (voice, wake-lock).

**Panel-first** otherwise. A panel-first surface ALWAYS uses Engine
3 (Tier B) and ALWAYS escalates to a Map-first surface for any
interactive task.

**Forbidden:** a hybrid surface where the map is large + interactive
but lives inside a panel-first archetype. This creates the hidden-
authority problem — the map looks operational but the shell
hierarchy says it is not.

---

## §7. Gaps surfaced

| Gap                                                            | Source                                | Severity                | Resolution                       |
| -------------------------------------------------------------- | ------------------------------------- | ----------------------- | -------------------------------- |
| Immersive mode unimplemented across map-first surfaces         | §3.5                                  | medium (UX cohesion)    | Phase 1 follow-up OR post-launch |
| Tap-to-expand affordance inconsistent across 6 preview callers | §4.2                                  | high (LAW conformance)  | Phase 1 (232–235)                |
| Operational mini-pill absent                                   | §5.4                                  | medium (continuity gap) | Phase 3                          |
| Focus on cold mount unspecified per surface                    | §5.3                                  | low                     | a11y pass post-launch            |
| Pin-tap behavior varies by preview caller                      | §4.2 + REF_CANONICAL_RUNTIME_PATHS §5 | high                    | Phase 1 (per-caller declaration) |

These gaps DO NOT need to be filed as new KIs — each is either
already covered by an existing KI (KI-181, KI-184) or is a planning
artifact captured here.

---

## §8. Status

- **Block D / Pass 231c:** COMPLETE.
- **Authority:** REFERENCE / CANONICAL / runtime_impact_if_misunderstood: high.
- **Binding:** Phase 1+ convergence passes touching shell composition
  must declare archetype + layer-stack impact + focus ownership
  changes per §3 / §4 / §5.
- **Next pass:** 231d — Motion + Transition Contract Audit.
