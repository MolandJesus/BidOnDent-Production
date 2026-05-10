---
status: CANONICAL
authority: REFERENCE
scope: block-d-closeout-and-dispatch
canonical_source_of_truth: REF_BLOCK_D_CLOSEOUT_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: true
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Block D ("Runtime Identity + Experience Unification") closeout. Captures what the six Block D passes (231 + 231a-e) delivered, what they unlock, the updated dispatch packet for the first runtime convergence pass (Pass 232), and the explicit owner-mandated STOP gate before any production runtime change.
last_updated: 2026-05-09
---

# Block D — Closeout + Dispatch Packet (2026-05-09)

> Block D / final pass. **STOP gate.** No runtime convergence,
> Host A/B modification, camera authority migration, or navigation
> persistence work executes after this without explicit owner
> authorization for the specific next pass.

---

## §1. Block D mission recap

Owner-stated mission (verbatim):

> **Runtime Identity + Experience Unification.** Answer: "What is
> the canonical map / runtime experience BidOnDent is actually
> trying to become?"

Owner governing principle:

> **Minimum conceptual fragmentation, not minimum file count.**

Owner-locked vocabulary going forward:

- **Tier A** = primary map surface (full-screen exploration / ops).
- **Tier B** = secondary preview surface (panel-embedded, escalates).
- **Tier C** = tertiary widget (dashboard tile, miniature, decorative).
- **Operational / Exploratory / Preview** = three sub-runtimes.

---

## §2. Pass-by-pass delivery

| Pass | Title                              | Output                                                                        | Commit     | Lines |
| ---- | ---------------------------------- | ----------------------------------------------------------------------------- | ---------- | ----- |
| 231  | Ratify LAW + PLAN status flips     | LAW_MAP_RENDERER_CONTRACT → CANONICAL; PLAN_MAP_CONVERGENCE_SEQUENCE → ACTIVE | `66c70794` | n/a   |
| 231a | Runtime philosophy audit           | REF_RUNTIME_PHILOSOPHY_2026-05-09.md                                          | `129a357b` | 335   |
| 231b | Canonical runtime paths            | REF_CANONICAL_RUNTIME_PATHS_2026-05-09.md                                     | `0e867eba` | 356   |
| 231c | Map shell + layout hierarchy audit | REF_MAP_SHELL_HIERARCHY_2026-05-09.md                                         | `5c87897e` | 300   |
| 231d | Motion + transition contract audit | REF_MAP_MOTION_CONTRACT_2026-05-09.md                                         | `366c2a66` | 282   |
| 231e | Test infrastructure prefix         | src/app/test-utils/mapTestHarness.ts + smoke test                             | `5bc1c3c9` | 315   |

Total Block D output: **5 new CANONICAL/REFERENCE docs (1,273 lines)** + **2 LAW/PLAN status promotions** + **1 test-only source module + smoke test (315 lines)**. Zero production runtime changes.

---

## §3. What Block D unlocks (per pass)

### §3.1. Pass 231 (LAW + PLAN ratification) unlocks:

- LAW_MAP_RENDERER_CONTRACT may now be cited as binding in convergence-pass commit messages and reviewer rejections.
- PLAN_MAP_CONVERGENCE_SEQUENCE Phase 0 deliverables are owner-authorized to ship — Phase 1+ still needs per-pass owner approval as documented.

### §3.2. Pass 231a (Runtime Philosophy) unlocks:

- The phrase "navigation" is now banned in load-bearing prose. All future code, docs, commit messages, and PR titles must qualify with "operational navigation" / "exploratory navigation" / "preview navigation".
- The "third option" recommendation for coverage navigation (stay Exploratory + lifecycle conformance + viewport persistence) is the authorized direction. Convergence passes must NOT add Operational capabilities to coverage navigation.

### §3.3. Pass 231b (Canonical Runtime Paths) unlocks:

- Each of the 9 paths P1-P9 has a numbered identity. Convergence passes must declare which path(s) they touch and which they leave alone.
- §5 expand-target carry-forward map is the proposed mapping for the 6 Tier B preview callers. Owner approval still required before any escalation wiring lands.

### §3.4. Pass 231c (Shell Hierarchy) unlocks:

- Map-first vs panel-first archetype split is binding. Phase 1 surface alignment passes must declare which archetype each touched surface lives in.
- The "forbidden hybrid" rule (no half-map / half-panel surfaces) is the rejection criterion for any future "let's just slap a small map here" requests.
- The mobile immersive mode and operational mini-pill are documented as gaps with proposed shapes — implementation requires separate owner approval.

### §3.5. Pass 231d (Motion Contract) unlocks:

- Engine 2's imperative `flyTo` (KI-180) now has a documented LAW-aligned remediation target: route through `useReducedMotion()` and demote to Class A/O classification.
- Phase 2 motion conformance tests have a contract to assert against (per-engine motion authority table, reduced-motion inheritance rule, gesture precedence list, transition timing classes).

### §3.6. Pass 231e (Test Infrastructure) unlocks:

- Engine mount/unmount test gap (KI-187), orchestration-host test gap (KI-188), surface-test gap (KI-189), reduced-motion CI gap (KI-191), and resize-patch CI gap (KI-190) all have a foundation module to build against.
- Future test passes can adopt the harness immediately; no need to re-invent maplibre stubs / matchMedia helpers / viewport fixtures per test file.

---

## §4. Updated dispatch packet — first runtime convergence pass

The Block C dispatch packet (`docs/REF_BLOCK_C_DISPATCH_PACKET_2026-05-09.md` §5) recommended **Pass 232: ReportDetailScreen Tier C/B alignment** as the first runtime convergence pass. Block D outputs sharpen that dispatch as follows:

### §4.1. Pre-flight reading required for Pass 232 author

Block D adds three docs to the mandatory pre-flight reading list:

1. `docs/LAW_MAP_RENDERER_CONTRACT.md` — now CANONICAL.
2. `docs/REF_RUNTIME_PHILOSOPHY_2026-05-09.md` — three sub-runtimes.
3. `docs/REF_CANONICAL_RUNTIME_PATHS_2026-05-09.md` — canonical path P3 governs preview surfaces.
4. `docs/REF_MAP_SHELL_HIERARCHY_2026-05-09.md` — Tier B preview archetype.
5. `docs/REF_MAP_MOTION_CONTRACT_2026-05-09.md` — Engine 3 (Tier B) motion authority.

### §4.2. Per-pass governance declaration (now binding)

Per the new governance rule locked in Block D, **every** runtime convergence pass commit message must declare:

1. **Runtime philosophy preserved** — Operational / Exploratory / Preview the pass touches; what semantics are preserved.
2. **Interaction contracts changed** — gestures, escalation triggers, dismissal/back semantics.
3. **Continuity guarantees affected** — remount / route-change / reload / background / sign-out behavior.
4. **Tier semantics touched** — Tier A / B / C surfaces affected.
5. **Operational vs exploratory behavior change** — explicit "behavior unchanged" / "behavior altered" line.

### §4.3. Pass 232 — refined scope (proposed; owner approval required)

ReportDetailScreen alignment specifically:

- **Path touched:** P3 (preview-surface exploration) on a Tier B/C boundary surface.
- **Engine touched:** Engine 3 (`MapLibreDashboardMapPreview`).
- **Carry-forward target (per 231b §5):** shop directory filtered by report area.
- **What changes:** add tap-to-expand affordance per 231c §4.2; ensure Engine 3 lifecycle (load/error) is observable per LAW_MAP_RENDERER_CONTRACT §3 once Engine 3 contract conformance lands; keep camera authority Preview (gestures suppressed unless expanded).
- **What does NOT change:** no Host A or Host B modification; no navigation persistence; no camera authority migration; no Operational capability acquisition.

### §4.4. Pass 233-235 — sequence preserved from Block C

The Block C dispatch sequence (§5 Phase 1: surface-by-surface Tier alignment for the remaining 5 Tier B/C preview callers) remains the recommended sequence after Pass 232.

---

## §5. Five LAW §7 governance questions still owner-deferred

LAW_MAP_RENDERER_CONTRACT §7 lists five governance questions that Block D documented but did NOT decide. They remain deferred to the owner and **must be resolved before Phase 3 (orchestration host convergence) starts**:

1. Should Host A and Host B merge into a single orchestration host parameterized by sub-runtime, or remain two hosts with a shared lifecycle contract?
2. Should the Operational mini-pill (231c §5.4) ship before or after Phase 1 surface alignment?
3. Should mobile immersive mode (231c §3.5) ship as a Phase 2 motion-class feature or as a Phase 4 atmosphere feature?
4. Should the carry-forward expand map (231b §5) be wired path-by-path during Phase 1, or in a single Phase 1.5 wiring pass?
5. Should viewport persistence (P8) ship as Operational-only first, or universally for Operational + Exploratory in one pass?

---

## §6. Owner-mandated STOP gate

Per owner verbatim instruction:

> "After Block D completes: STOP again before Phase 1 convergence
> execution, runtime behavior changes, Host A/B modification,
> camera authority migration, or navigation persistence work."

The next pass that touches **any** of:

- Production runtime behavior (any change to user-observable map runtime semantics)
- Host A (`useCoverageNavigationExperience`) source
- Host B (`useShopDirectoryNavigation`) source
- Camera authority (any engine's camera handling)
- Navigation persistence (any change to session-restore / cloud-sync / localStorage navigation cache)
- Phase 1 convergence (Tier alignment edits to production surfaces)

**must wait for explicit owner authorization for that specific pass.** Authorization for Block D does NOT carry forward.

Pre-authorized work (no further owner approval required) is limited to:

- Doc-only passes that update REF/PLAN docs already authorized.
- Test-only passes that build on the Pass 231e harness without touching production source.
- KI registration / KI status updates in `REF_KNOWN_ISSUES.md`.

Any other work pauses here.

---

## §7. Verification — Block D acceptance checklist

| Item                                                      | Status                                     |
| --------------------------------------------------------- | ------------------------------------------ |
| LAW_MAP_RENDERER_CONTRACT status = CANONICAL              | ✅                                         |
| PLAN_MAP_CONVERGENCE_SEQUENCE status = ACTIVE             | ✅                                         |
| Three sub-runtimes named + characterized                  | ✅ (231a §2)                               |
| Continuity guarantees table per sub-runtime               | ✅ (231a §3)                               |
| Escalation / handoff matrix                               | ✅ (231a §7)                               |
| 9 canonical runtime paths catalogued                      | ✅ (231b §1-§9)                            |
| Path-to-pass cross reference                              | ✅ (231b §11)                              |
| 8-surface inventory by archetype                          | ✅ (231c §2)                               |
| 6-layer z-stack canonical                                 | ✅ (231c §3)                               |
| Mobile vs desktop divergence documented                   | ✅ (231c §3.4)                             |
| Tap-to-expand affordance form for Tier B                  | ✅ (231c §4.2)                             |
| Three motion classes (P / A / O)                          | ✅ (231d §2)                               |
| Per-engine motion authority table                         | ✅ (231d §3)                               |
| Reduced-motion inheritance rule (read at engine boundary) | ✅ (231d §4)                               |
| Camera restoration table (no snap-back-on-release)        | ✅ (231d §6)                               |
| Gesture precedence list                                   | ✅ (231d §7)                               |
| Transition timing classes for handoffs                    | ✅ (231d §8)                               |
| Route-follow camera philosophy                            | ✅ (231d §9)                               |
| MapLibre stub factory                                     | ✅ (231e mapTestHarness.ts)                |
| matchMedia reduced-motion helper                          | ✅ (231e mapTestHarness.ts)                |
| Viewport fixtures aligned with §11 surfaces               | ✅ (231e mapTestHarness.ts)                |
| Resize-patch assertion helpers (KI-190 prep)              | ✅ (231e mapTestHarness.ts)                |
| Smoke test for harness                                    | ✅ (231e mapTestHarness.test.ts; 9/9 pass) |
| Build still green                                         | ✅ (3.51s)                                 |
| Cspell still PASS                                         | ✅                                         |
| No production runtime source touched                      | ✅                                         |

---

## §8. End of Block D

Block D is closed. The repo now understands its map system as a **runtime platform** rather than a set of screens. Phase 1 convergence execution awaits owner authorization per §6.
