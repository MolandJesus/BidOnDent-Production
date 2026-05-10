---
status: CANONICAL
authority: REFERENCE
scope: map-runtime-philosophy
canonical_source_of_truth: REF_RUNTIME_PHILOSOPHY_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: critical
ai_summary: Conceptual north star for the BidOnDent map runtime. Defines navigation as a product term with three sub-runtimes (operational, exploratory, preview), continuity guarantees, interruption semantics, persistence expectations, authority expectations, and escalation/handoff philosophy. Block D / Pass 231a deliverable.
last_updated: 2026-05-09
---

# REF — Runtime Philosophy Audit

> Block D / Pass 231a deliverable. **Conceptual north star.** This
> document does not change behavior. It defines the vocabulary and
> semantic commitments that all subsequent runtime architecture work
> (231b–e and Phase 1+ convergence) must honor.
>
> Source artifacts this synthesizes:
> [`LAW_MAP_RENDERER_CONTRACT.md`](LAW_MAP_RENDERER_CONTRACT.md),
> [`REF_NAVIGATION_AUTHORITY_2026-05-09.md`](REF_NAVIGATION_AUTHORITY_2026-05-09.md),
> [`REF_MAP_UX_COHESION_AUDIT_2026-05-09.md`](REF_MAP_UX_COHESION_AUDIT_2026-05-09.md),
> [`REF_DASHBOARD_PREVIEW_DUPLICATION_2026-05-09.md`](REF_DASHBOARD_PREVIEW_DUPLICATION_2026-05-09.md).

---

## §1. Premise

The BidOnDent map is a **runtime platform**, not a set of screens.
Every map-bearing surface exposes a slice of one underlying spatial
runtime. Convergence work is the act of making that runtime **legible
and consistent** to users, developers, and AI agents — not the act of
collapsing it to the smallest possible component count.

Governing principle (owner-set, Block C):

> **Minimum conceptual fragmentation, not minimum file count.**

Two engines under one runtime contract is acceptable. Two engines
delivering two different behavioral contracts under the same name is
not.

---

## §2. The word "navigation" is a product term

Block C proved "navigation" denotes two structurally different
runtimes today (KI-182). That ambiguity is the deepest mental-model
gap in the system. From this point forward, "navigation" without a
qualifier is **forbidden in load-bearing prose** (LAW docs, REF docs,
component names, prop names, telemetry events).

Three sub-runtimes are canonical:

### 2.1 Operational Navigation

User has committed to going somewhere now. The runtime takes
responsibility for getting them there.

- **Trigger:** explicit user commitment (tap "Navigate", confirm
  destination).
- **Continuity guarantee:** survives reload, app background, screen
  lock. Persisted to cloud per-user.
- **Authority:** runtime owns camera, owns reroute decisions, owns
  voice + toast + wake-lock.
- **Interruption semantics:** explicit user dismissal only. Background
  → resume. Reload → resume. Crash → resume on next session.
- **Today's implementation:** `useShopDirectoryNavigation` (Host B).
- **Examples:** shop driving to a customer, customer driving to a shop.

### 2.2 Exploratory Navigation

User is investigating spatial possibilities. The runtime helps them
look around without committing.

- **Trigger:** opening a map surface; tapping a pin; panning into a
  region.
- **Continuity guarantee:** session-scoped. Viewport may persist for
  recovery, but route state need not survive reload.
- **Authority:** user owns camera. Runtime suggests routes but does
  not commit to one.
- **Interruption semantics:** any other activity preempts freely. No
  voice. No wake-lock. Toast acceptable but not required.
- **Today's implementation:** `useCoverageNavigationExperience`
  (Host A) for coverage exploration; the shop directory map in browse
  mode.
- **Examples:** customer exploring shop coverage, shop scanning
  competitor density.

### 2.3 Preview Navigation

A small, non-interactive or minimally-interactive map surface
showing pre-determined spatial context inside a larger UI.

- **Trigger:** rendering a card, dashboard widget, or detail screen
  that needs spatial context.
- **Continuity guarantee:** none. Stateless on every render.
- **Authority:** caller owns viewport intent. Runtime renders.
  Gestures suppressed. Tap-to-expand affordance escalates to an
  Operational or Exploratory surface.
- **Interruption semantics:** N/A — preview is read-only context.
- **Today's implementation:** `MapLibreDashboardMapPreview` (Engine
  3) called from 6 surfaces.
- **Examples:** ReportDetailScreen mini-map, dashboard "shops near
  me" widget.

---

## §3. Continuity guarantees

A **continuity guarantee** is a promise about what survives across a
boundary. The boundaries that matter:

| Boundary | Operational | Exploratory | Preview |
|---|---|---|---|
| Component remount (revision-keyed) | route preserved | viewport preserved | none |
| Route change (intra-app) | route preserved | viewport preserved | none |
| Page reload | route restored from cloud | viewport may restore from local | none |
| App background → foreground | wake-lock released, route resumed | viewport preserved | none |
| Sign-out / account switch | route cleared | viewport cleared | N/A |
| Multi-device | future: cloud session restore on second device | not guaranteed | not applicable |

Hidden authority is forbidden. If a surface's continuity behavior
does not match the table, that is a bug, not a design choice.

---

## §4. Interruption semantics

Interruption = anything that displaces the current runtime
focus. Each sub-runtime declares which interruptions it tolerates and
which it preempts.

### 4.1 Operational
- **Tolerated:** OS-level focus loss (calls, notifications). Resume on
  return. Wake-lock yields and re-acquires.
- **Preempts:** any in-app navigation away from the operational
  surface must show a "Leave navigation?" confirmation, OR carry
  navigation state with the user (mini-pill on shell). Silent loss
  is forbidden.
- **Reroute:** gated by [`shouldTriggerReroute`](../src/app/services/navigation/rerouteGate.ts). Off-route detection must NOT trigger reroute prompts during route preview or unconfirmed exploration.

### 4.2 Exploratory
- **Tolerated:** any interruption. State may be discarded on context
  switch.
- **Preempts:** nothing. User may abandon any time.

### 4.3 Preview
- **Tolerated:** any. No state to lose.
- **Preempts:** nothing.

---

## §5. Persistence expectations

Persistence is the disk/cloud cost the runtime is allowed to take.

| Concern | Operational | Exploratory | Preview |
|---|---|---|---|
| Local viewport (per-surface) | yes | yes | no |
| Local session (per-user) | yes (`bidondent_nav_session_*`) | optional | no |
| Cloud session (per-user) | **required** | optional / future | no |
| External handoff (Apple/Google/Waze) | yes (`bidondent_navigation_session` legacy global key) | no | no |
| Telemetry of route decisions | yes | aggregate only | no |

KI-183 (storage-key naming collision between in-app session and
external-handoff payload) MUST be resolved before any new persistence
key is introduced. The two concepts must visibly differ in name.

---

## §6. Authority expectations

Authority = who decides what when models disagree. Locked by
[`LAW_MAP_RENDERER_CONTRACT.md`](LAW_MAP_RENDERER_CONTRACT.md) §2 +
this doc §6.

| Decision | Operational | Exploratory | Preview |
|---|---|---|---|
| Camera (pan/zoom) | runtime owns when guidance active; user owns otherwise | user owns | caller owns |
| Pitch | runtime sets pitch in guidance mode; user gestures ignored | user owns within tier-defined caps | none (gestures suppressed) |
| Route choice | user picks; runtime commits | user picks; runtime suggests | N/A |
| Reroute | runtime owns (gated by `shouldTriggerReroute`) | none | N/A |
| Layer visibility | runtime owns (guidance layers always on during guidance) | user owns within tier-defined toggles | caller owns |
| Audio (voice) | runtime owns | none | none |
| Wake-lock | runtime owns | none | none |

---

## §7. Escalation + handoff philosophy

A user moves between sub-runtimes constantly. Each transition is a
**handoff** with explicit semantics.

### 7.1 Preview → Exploratory ("expand")

The preview's tap-to-expand affordance opens a full-surface
exploratory map.

- Carry forward: caller-supplied center + zoom (preview's
  `viewState`), pin selection if any.
- Discard: nothing meaningful to discard (preview is stateless).
- Animation: `LAW_ANIMATION_AND_ATMOSPHERE` declarative `flyTo`,
  reduced-motion respected.

### 7.2 Exploratory → Operational ("commit to navigate")

User taps "Navigate" on a previewed route option.

- Carry forward: chosen route, destination, current viewport as
  starting frame.
- Establish: cloud session, wake-lock, voice channel, reroute gate.
- Discard: alternative route options (kept in cache for "show
  alternatives" gesture).
- User must confirm. No silent escalation.

### 7.3 Operational → Exploratory ("end navigation")

User explicitly ends operational navigation OR arrives at destination.

- Carry forward: final viewport.
- Tear down: wake-lock, voice channel, reroute gate, cloud session.
- Confirmation: required if route is < 90% complete and user did
  NOT arrive. "End navigation?" prompt.

### 7.4 Operational → Operational ("destination change")

Treat as: tear down current operational session, escalate fresh from
exploratory. No silent rerouting to a NEW destination.

### 7.5 Forbidden transitions

- **Preview → Operational direct:** never. Must pass through
  Exploratory for route selection.
- **Exploratory → Operational silent:** never. Must require explicit
  user commitment.
- **Operational → Preview:** never. Operational sessions cannot be
  "minimized" into a preview surface; they must end first OR
  surface as a sticky shell affordance (shell-level decision in
  Pass 231c, not runtime-level).

---

## §8. What this philosophy implies for the open questions

LAW contract §7 carries five questions. This philosophy doc does not
answer them — that is owner authority — but it constrains the
acceptable answer space.

### 8.1 Coverage navigation: Tier A vs Tier B
- Today: coverage is **silent**, no voice, no toast, no wake-lock,
  no cloud restore.
- Per §2, that matches **Exploratory Navigation**, not Operational.
- Branch B (downgrade to Tier B preview) collapses Exploratory into
  Preview, which loses user-owned camera authority — a real
  capability loss.
- Branch A (grow to Host B) upgrades Exploratory to Operational —
  changes the social contract of the surface.
- Recommendation: **third option.** Coverage stays Tier A
  Exploratory. Host A grows ONLY enough to satisfy LAW lifecycle
  obligations (onLoad/onError/error boundary/reduced-motion) and
  optional viewport persistence. It does NOT acquire Operational
  capabilities.
- This is a Block D recommendation, not a Block D decision. Owner
  retains authority.

### 8.2 Pitch caps
- Per §6, pitch authority differs by sub-runtime. A unified cap
  across surfaces would conflate runtimes.
- Recommendation: declare per-runtime caps (Operational: 65°
  unconditional; Exploratory: 65° satellite-only, 0° default;
  Preview: gestures suppressed entirely). Discoverable affordance
  (subtle pitch indicator on Exploratory) makes the cap legible.

### 8.3 Cross-surface camera continuity
- Per §3, viewport continuity is per-surface for Exploratory and
  per-route for Operational. Cross-surface continuity (e.g. coverage
  viewport flowing into shop directory viewport) is NOT a current
  guarantee.
- Recommendation: explicitly out of scope for the launch envelope.
  Future feature, file as PLAN doc when prioritized.

### 8.4 Tier C dedicated engine
- Per §2.3, Preview is stateless and minimally interactive. Engine
  3 already serves it well.
- Recommendation: NO dedicated Tier C engine. Tier B with stricter
  props (`autoFit`, gesture suppression flags) suffices.

### 8.5 Engine 2 imperative `flyTo` deadline
- Per §6, Operational runtime owns camera. Imperative `flyTo` is
  the implementation mechanism today.
- LAW contract §2 forbids imperative camera in Tier A AFTER
  ratification.
- Recommendation: imperative `flyTo` becomes a LAW conformance gap
  (KI-180) that must close in Phase 2 pass 237. Until then, Engine
  2's imperative camera is an explicit known gap with a documented
  removal trigger.

---

## §9. Vocabulary lock (binding from this commit)

| Term | Use it for | Do NOT use it for |
|---|---|---|
| Navigation | the product surface family — never alone in load-bearing prose | a specific runtime |
| Operational Navigation | sub-runtime per §2.1 | exploratory map browsing |
| Exploratory Navigation | sub-runtime per §2.2 | committed driving |
| Preview Navigation | sub-runtime per §2.3 | full-surface map work |
| Tier A | LAW contract canonical interactive | preview surfaces |
| Tier B | LAW contract operational preview | guidance-active surfaces |
| Tier C | LAW contract decorative | anything with gestures |
| Host A | `useCoverageNavigationExperience` orchestration host | the engine it pairs with |
| Host B | `useShopDirectoryNavigation` orchestration host | the engine it pairs with |
| Engine 1 | `MapEngineCanvas` | any other component |
| Engine 2 | `MapLibreShopDirectoryMapPane` | any other component |
| Engine 3 | `MapLibreDashboardMapPreview` | any other component |
| Continuity guarantee | a §3-table commitment | a casual observation |
| Authority | a §6-table assignment | a casual observation |
| Escalation / handoff | a §7-defined transition | any UI navigation |

---

## §10. Status

- **Block D / Pass 231a:** COMPLETE.
- **Authority:** REFERENCE / CANONICAL / runtime_impact_if_misunderstood: critical.
- **Binding:** all subsequent Block D passes (231b–e) must use this
  vocabulary. Phase 1+ convergence passes must declare which
  sub-runtime they preserve, change, or escalate (per the new
  governance rule established at owner authorization).
- **Next pass:** 231b — REF_CANONICAL_RUNTIME_PATHS_2026-05-09.md.
