# Phase 8.5 Pre-Execution Audit 2026-05-05 (OPS)

**Authority level:** OPS — read-only audit of Phase 8.5 (Map ambient + idle motion) surfaces against [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) §2 §E (the 7 map-specific keyframes) before any code commits.

**Last updated:** 2026-05-05

**Status:** **CLOSED via Path Y 2026-05-05.** Phase 8.5 has real aesthetic-addition work — 5 of 7 map-specific keyframes are defined but unconsumed by map surfaces. All findings are **P7-TECHDEBT (KI-112 family)**, not defensive. **0 P0/P1/P2/P3 findings.** Closed via Path Y (docs-only close + KI-112 extension); F1 + F2 + F4 folded into KI-112 as F4 + F5 + F6 (audit F3 maps to existing KI-112 F2). Path A (3-4 aesthetic execution commits) remains available as a post-launch aesthetic pass or owner-driven phase. See §9 close footer below.

**Phase context:** Authorized as the natural next step after Phase 8 close (commit `f484019c`) under owner authorization "go full auto on code work doc work and design work for hours after." Mirrors Phase 6 / 6.5 / 7 / 7.5 / 8 audit pattern; output style is **findings-style** (per the original Phase 8.5 charter "route preview draw-on, pin pulse, camera idle drift, liquid sheen extension"), not scope-contract-style (Phase 8.5 work is keyframe wiring, not architectural lift).

**Companion docs:**

- [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) — motion canon §2 §E (the 7 map-specific keyframes this audit inventories)
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex visual canon (LOCKED; not touched by this audit)
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 8.5 row updated this commit
- [`OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister atmosphere audit (landing surfaces); similar shape
- [`OPS_PHASE_7_5_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_7_5_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister atmosphere audit (dashboard surfaces); KI-112 extension precedent
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-112 (atmosphere/idle motion gap family this audit's findings would extend)

**Method:** Static code audit (grep + Read) across the 7 keyframes catalogued in LAW §2 §E + their consuming surfaces in `src/app/components/maps/` and `src/app/components/shop/`. No runtime inspection. Working tree unchanged.

---

## TL;DR

The 7 map-specific keyframes catalogued in [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) §2 §E are mostly defined but unconsumed:

| Keyframe             | Class                  | Defined? | Consumed by map surfaces?                                       |
| -------------------- | ---------------------- | :------: | --------------------------------------------------------------- |
| `mapPopupEnter`      | (inline animation)     |    ✅    | ✅ — applied to popup CSS at `theme.css:741`                    |
| `bdLiquidGoldFlow`   | `.bd-liquid-gold-flow` |    ✅    | ❌ on map; ✅ on landing (HeroSection, OperatingRegionsSection) |
| `bdPinPulse`         | `.bd-pin-pulse`        |    ✅    | ❌ on map pins; ✅ on landing (HeroSection only)                |
| `bdRouteShimmer`     | (animation property)   |    ✅    | ❌ — defined, zero consumers                                    |
| `bdGoldSheenOneShot` | `.bd-gold-sheen-hover` |    ✅    | ❌ on map; partial on theme inline at `theme.css:1087/1148`     |
| `dashMove`           | (would need class)     |    ✅    | ❌ — defined, zero consumers                                    |
| `arrival-scale-in`   | (animation class)      |    ✅    | ✅ — applied in `GuidanceArrivalSection.tsx`                    |

**Result:** **2 of 7 consumed (28%); 5 of 7 unconsumed.** The 5 unconsumed are precisely the keyframes Phase 8.5's charter scoped: route preview draw-on (`bdRouteShimmer` + `dashMove`), pin pulse (`bdPinPulse`), liquid sheen extension (`bdLiquidGoldFlow` + `bdGoldSheenOneShot` on map vs landing). Camera idle drift has **no canonical keyframe** (it would be canvas-side MapLibre animation, not DOM CSS).

**Severity:** All findings are **P7-TECHDEBT** (aesthetic addition territory). 0 P0/P1/P2 production breakage, 0 P3 contract-conformance gap, 0 P4 functional issue, 0 P5/P6 architectural smell, 0 a11y issue. Static map pins/routes render correctly without breathing/shimmer.

**Phase 8.5 revised commit total:** **0 defensive commits** required. All work is owner-taste-gated aesthetic addition.

---

## §1. Phase 8.5 surface inventory

### 1.1 Route preview draw-on (~2 surfaces, ~unknown LOC)

| Surface                                                                | Status                 | Existing motion                                     |
| ---------------------------------------------------------------------- | ---------------------- | --------------------------------------------------- |
| MapLibre route line layers (rendered via MapLibre style spec, not DOM) | **NOT animated**       | Static line layer; no shimmer or draw-on transition |
| `command-center/PlannerRoutePreview.tsx`                               | DOM route preview card | Tailwind `animate-pulse` for loading skeletons only |
| `shop/ShopDirectoryRoutePreviewCard.tsx`                               | DOM route preview card | `LoaderCircle animate-spin` for loading state only  |

**Charter mismatch flag:** `bdRouteShimmer` keyframe is DOM-targeted (`animation: bdRouteShimmer 6s linear infinite` at `theme.css:3638`). MapLibre route lines are canvas-rendered, not DOM. To animate the actual canvas route line requires either (a) MapLibre paint property animation (`line-dasharray` interpolation) or (b) DOM-overlaid SVG route stroke that uses the keyframe. Neither is shipped.

`dashMove` keyframe is similarly DOM-targeted (`animations.css`). No consumers.

### 1.2 Pin pulse (~multiple surfaces)

| Surface                               | Status                 | Existing motion                                                            |
| ------------------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| MapLibre pin layers (canvas-rendered) | **NOT animated**       | Static circle/icon layers; no breathing                                    |
| `MapLibreReportLayer.tsx`             | Report pins            | Static layer; clicks trigger `flyTo` (camera animation, not pin animation) |
| `MapLibreShopDirectoryMapPane.tsx`    | Shop pins              | Static layer                                                               |
| Landing `HeroSection.tsx`             | DOM-rendered hero pins | **CONSUMES `bd-pin-pulse`** ✅                                             |

**Charter mismatch flag:** `bdPinPulse` keyframe is DOM-targeted via `.bd-pin-pulse` class (defined at `theme.css:3653-3681`). MapLibre canvas pins can't directly use CSS classes. To pulse actual map pins requires either MapLibre native circle-radius interpolation OR DOM HTML markers overlaid on the map. Currently unbuilt.

### 1.3 Camera idle drift (no existing keyframe)

| Surface                           | Status           | Existing motion                                                                                             |
| --------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| MapLibre camera (any map surface) | **NOT animated** | `flyTo` and `easeTo` shipped via `mapLibreControllers.tsx` for explicit user actions; no idle/ambient drift |

**Note:** Camera idle drift is canvas-side animation (MapLibre `easeTo` with low duration, looped during user idleness). No keyframe needed; pure MapLibre API + JS scheduling. No keyframe in LAW §2 §E covers this.

This is the same gap as **KI-112 F2** (dashboard atmosphere mini-map idle drift NOT shipped). Phase 7.5 audit already documented this — folding it into Phase 8.5 would create double-tracking.

### 1.4 Liquid sheen extension (~2 surfaces shipped on landing; not on map)

| Surface                                | Status                   | Existing motion                       |
| -------------------------------------- | ------------------------ | ------------------------------------- |
| Landing `HeroSection.tsx`              | Hero panel               | **CONSUMES `bd-liquid-gold-flow`** ✅ |
| Landing `OperatingRegionsSection.tsx`  | Map preview frame        | **CONSUMES `bd-liquid-gold-flow`** ✅ |
| Map `ServiceCoverageMap.tsx`           | Coverage map frame       | NOT consumed                          |
| Map `MapLibreShopDirectoryMapPane.tsx` | Shop directory map frame | NOT consumed                          |

**Charter scope:** "Liquid sheen extension" implies extending the existing landing-side liquid-gold to map-surface frames. The keyframe + class are shipped; consumption is the missing piece. Trivial to wire up if owner wants.

### 1.5 Map popups (already shipped)

| Surface            | Status          | Existing motion                                                  |
| ------------------ | --------------- | ---------------------------------------------------------------- |
| Map popup elements | **CONSUMED** ✅ | `theme.css:741` applies `mapPopupEnter 280ms` to popup CSS class |

`mapPopupEnter` is already wired up. No work needed.

### 1.6 Arrival callout (already shipped)

| Surface                           | Status          | Existing motion                    |
| --------------------------------- | --------------- | ---------------------------------- |
| `shop/GuidanceArrivalSection.tsx` | Arrival callout | **CONSUMES `arrival-scale-in`** ✅ |

`arrival-scale-in` is already wired up. No work needed.

---

## §2. Findings table (severity-ranked)

| ID  | Severity        | Surface                                                               | Finding                                                                                                                                                                                                                         | Recommendation                                                |
| --- | --------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| F1  | **P7-TECHDEBT** | MapLibre route line layers + DOM route preview cards                  | Route preview draw-on NOT shipped. `bdRouteShimmer` + `dashMove` keyframes defined but zero consumers. Charter mismatch — keyframes are DOM-targeted; canvas routes need MapLibre paint property animation or DOM-overlaid SVG. | Fold into KI-112 extension family OR ship 1-2 commits Path A. |
| F2  | **P7-TECHDEBT** | MapLibre pin layers (Report + Shop directory)                         | Pin pulse NOT shipped on actual map canvas pins. `bdPinPulse` shipped on landing HeroSection only. Charter mismatch — same canvas-vs-DOM issue.                                                                                 | Fold into KI-112 extension family OR ship 1 commit Path A.    |
| F3  | **P7-TECHDEBT** | All map surfaces                                                      | Camera idle drift NOT shipped. No canonical keyframe (canvas-side MapLibre API). Overlaps with KI-112 F2 (dashboard atmosphere mini-map idle drift).                                                                            | Already tracked under KI-112 F2; no new KI needed.            |
| F4  | **P7-TECHDEBT** | Map surface frames (ServiceCoverageMap, MapLibreShopDirectoryMapPane) | Liquid sheen NOT extended from landing to map surface frames. `bd-liquid-gold-flow` class shipped + applied on landing; map frames don't consume it.                                                                            | Fold into KI-112 extension family OR ship 1 commit Path A.    |
| —   | 0 P0/P1/P2/P3   | —                                                                     | No production breakage, no contract-conformance gap, no a11y issue. (KI-113 reduced-motion sweep is tracked separately and is not Phase 8.5 territory.)                                                                         | —                                                             |

---

## §3. Coverage already delivered

| Charter item                                      | Delivered? | Source                                   |
| ------------------------------------------------- | :--------: | ---------------------------------------- |
| `mapPopupEnter` consumption                       |     ✅     | `theme.css:741`                          |
| `arrival-scale-in` consumption                    |     ✅     | `shop/GuidanceArrivalSection.tsx`        |
| `bdLiquidGoldFlow` consumption (on landing)       |     ✅     | `HeroSection`, `OperatingRegionsSection` |
| `bdPinPulse` consumption (on landing only)        | partial ✅ | `HeroSection`                            |
| Camera `flyTo` / `easeTo` (explicit user actions) |     ✅     | `mapLibreControllers.tsx`                |

---

## §4. Phase 8.5 revised total estimate

| Original v3.3 estimate                                                                                         | Audit-revised estimate                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 8.5: route preview draw-on + pin pulse + camera idle drift + liquid sheen extension — multi-commit scope | **0 defensive commits required.** All 4 charter items are aesthetic additions where keyframes exist (or in F3's case, would need new MapLibre canvas-side animation infrastructure). KI-112 family. |

If owner picks **Path A** (ship the visual polish): estimated 3-4 commits — one per charter item, each touching 1-3 surfaces, mandatory `prefers-reduced-motion` guard per LAW §3 in the same commit (cross-references KI-113 — these new motion surfaces would also need `useReducedMotion()` if implemented via `motion/react`, OR `@media (prefers-reduced-motion: reduce)` if implemented via CSS keyframes).

If owner picks **Path Y** (docs-only close, fold into KI-112): 1 close commit. Same outcome shape as Phases 6.5 / 7.5 closes.

**Pre-execution-audit pattern is now 7-for-7** with Phase 8.5 producing the 4th aesthetic-only audit (alongside 6.5 / 7.5 F2-F3) — the pattern continues to validate that audits cheaply identify "the work is real but is owner-taste-gated, not defensive."

---

## §5. Recommended path

**Path Y — docs-only close + fold all 4 findings into KI-112 extension** (same shape as Phase 6.5 + Phase 7.5 closes).

Rationale:

1. All 4 findings are P7-TECHDEBT with the exact same family signature as the KI-112 surfaces already parked (landing gold-lamp, dashboard atmosphere, dashboard dropdowns).
2. Charter mismatches (F1 + F2 keyframes are DOM-targeted; map canvas needs different infrastructure) mean ship-as-charter would either require keyframe redesign OR DOM-overlay infrastructure — both out of hardening-phase scope.
3. F3 (camera idle drift) is already tracked under KI-112 F2 — folding F3 here would duplicate.
4. F4 (liquid sheen extension to map frames) is the simplest sub-fix (~10 LOC of CSS class application) and could ride along if owner picks Path A; otherwise parks cleanly.
5. KI-113 (reduced-motion sweep) interaction: any motion shipped in Phase 8.5 must respect reduced-motion. CSS-keyframe surfaces use `@media (prefers-reduced-motion: reduce)` per LAW §3; motion/react surfaces use `useReducedMotion()`. Adding new motion before KI-113 closes adds to the compliance debt.

**Path A** (ship 3-4 aesthetic commits) is also defensible if owner wants pre-launch visual polish, but increases KI-113's compliance scope.

**Path C** (re-frame as charter-write-up) is the wrong frame — the audit already inventoried the surfaces.

---

## §6. Open scope questions for owner (close-commit decisions)

1. **Path A vs Path Y** — ship aesthetic polish now, or defer all 4 findings into KI-112 extension and post-launch?
2. **F4 (liquid sheen extension)** — if Path Y, ship the simplest sub-fix as a tiny ride-along commit (~10 LOC CSS class application to ServiceCoverageMap + MapLibreShopDirectoryMapPane frames)? Or strict Path Y with no code edits?
3. **Camera idle drift (F3)** — confirm folding into existing KI-112 F2 entry rather than creating a separate KI?
4. **KI-113 interaction** — if owner picks Path A, the new motion surfaces ship without `prefers-reduced-motion` guards in this audit's recommendation chain (because KI-113 hasn't closed yet). Add the guards in the same commit per LAW §3 mandate? Default policy: yes, every new animation ships with its reduce-guard.

---

## §7. What this audit does NOT do

- **No code edits.** Working tree clean.
- **No KI invention** for findings F1-F4 in this audit. Per relay convention (Phase 6.5 + 7.5 + 8 audits): aesthetic gaps fold into KI-112 at the close commit, not invented during the audit.
- **No PLAN_PHASE_8_5\* writes.** No scope contract was opened; this audit is findings-style (per the original Phase 8.5 charter scope) not scope-contract-style.
- **No charter amendments.** LAW_ANIMATION_AND_ATMOSPHERE not touched.
- **No MOLANDJESUS touch.** Structural lock holds.
- **No Sonnet invocation.** Read-only static audit per established pattern.
- **No KI-113 work.** Reduced-motion sweep is its own future-phase scope; this audit only flags interaction (any new Phase 8.5 motion must add reduce-guards).
- **No KI-111 work.** Sub-folder split is owner-named per the KI's own framing; not autopilot territory.

---

## §8. Phase 8.5 close commit (next reply, gated on owner Path A vs Y pick)

If **Path Y**:

- KI-112 extension: add F1 + F2 + F4 surfaces (landing gold-lamp + dashboard atmosphere + dashboard dropdowns + map route lines + map pins + map frame sheen). F3 already covered by F2 entry from Phase 7.5.
- This audit doc: close footer with status update + Path-Y rationale.
- `PLAN_DOC_INDEX_BY_PHASE.md`: Phase 8.5 row → status CLOSED with Path Y annotation; `OPS_MAP_AMBIENT_MOTION_LOG.md` marked NOT WRITTEN.
- `LAW_HARDENING_PLAN.md`: Phase 8.5 close session entry.

If **Path A**:

- Per-finding execution commits (3-4 commits): wire `bd-pin-pulse` to map pins (DOM-overlaid markers), wire route shimmer (canvas-side `line-dasharray` interpolation OR DOM-overlay SVG), wire `bd-liquid-gold-flow` to map frames, author camera-idle-drift JS scheduler.
- Each commit: mandatory reduce-guard in the same commit per LAW §3.
- Final `docs(close):` Phase 8.5.

---

## Cross-references

- [`LAW_ANIMATION_AND_ATMOSPHERE.md`](LAW_ANIMATION_AND_ATMOSPHERE.md) §2 §E (the 7 map-specific keyframes inventoried this audit) + §3 (mandatory `prefers-reduced-motion` contract any Path-A commits would honor)
- [`OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_6_5_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister atmosphere audit (landing); shipped Path B (close-only with KI-112 parking)
- [`OPS_PHASE_7_5_PRE_EXECUTION_AUDIT_2026-05-04.md`](OPS_PHASE_7_5_PRE_EXECUTION_AUDIT_2026-05-04.md) — sister atmosphere audit (dashboard); shipped Path Y (docs-only) with KI-112 extension + KI-113 creation
- [`OPS_PHASE_8_SCOPE_CONTRACT_2026-05-05.md`](OPS_PHASE_8_SCOPE_CONTRACT_2026-05-05.md) — sister Phase 8 doc; different output style (scope-contract for execution-authority architectural lift)
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) — Phase 8.5 row updated this commit
- [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) — apex design canon (LOCKED; not touched)
- [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md) — KI-112 (atmosphere/idle motion gap family); KI-113 (reduced-motion sweep — interaction risk if Path A)

---

## §9. Phase 8.5 close (2026-05-05) — PATH Y SHIPPED

Phase 8.5 closed via **Path Y** (docs-only close + KI-112 extension), per audit recommendation in §5 + close-commit shape in §8.

**Decision rationale:** Under owner autopilot authorization with no explicit Path A directive, Path Y is the audit's default recommendation and matches the established Phase 6.5 (Path B) + Phase 7.5 (Path Y) close patterns for atmosphere-audit phases with all-P7-TECHDEBT findings. KI-113 reduced-motion contract is now resolved (commits `b1fea150` → `bb20f554`), so Path A is mechanically unblocked and remains available as a post-launch aesthetic pass or owner-driven phase if the visual polish is wanted before launch.

**What this close commit ships:**

- KI-112 extension in [`REF_KNOWN_ISSUES.md`](REF_KNOWN_ISSUES.md): 3 new sub-fix entries — **F4** (map route preview draw-on, audit F1) + **F5** (map pin pulse on MapLibre canvas, audit F2) + **F6** (liquid sheen extension to map frames, audit F4). Audit F3 (camera idle drift) maps to existing KI-112 F2 (dashboard atmosphere mini-map idle drift) — no duplicate created.
- KI-112 title updated to "+ map ambient surfaces".
- KI-112 scope-extended note appended with Phase 8.5 entry.
- KI-112 Impact, Location, Evidence, Fix direction, and Status sections all extended for F4/F5/F6.
- KI-112 Fix direction updated to clarify mechanical-inheritance for motion/react surfaces (root MotionConfig + useReducedMotion already in place from Phase 7.6) vs CSS-keyframe surfaces (must author own `@media (prefers-reduced-motion: reduce)` per LAW §3).
- This audit doc: §9 close footer (this section) + §0 Status updated to CLOSED.
- [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md): Phase 8.5 audit row → SHIPPED + CLOSED via Path Y; OPS_MAP_AMBIENT_MOTION_LOG row → NOT WRITTEN (Path Y).
- [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md): new session log entry "v3.3 master-plan Phase 8.5 close (2026-05-05)".
- 0 code edits.

**What this close does NOT do (deliberately, under autopilot):**

- No Path A execution (3-4 aesthetic commits would have shipped pin-pulse / route-shimmer / liquid-sheen-extension activations; awaits owner taste decisions).
- No new KI created (audit F3 folded; F1/F2/F4 folded; no KI-114/115).
- No status change to KI-112 (stays OPEN — P7-TECHDEBT).
- No charter amendments (LAW_ANIMATION_AND_ATMOSPHERE not touched).
- No MOLANDJESUS touch (structural lock holds).
- No `OPS_MAP_AMBIENT_MOTION_LOG.md` write (conditional on Path A; not written).
- No new audit framework (per containment doctrine).
- No scope expansion beyond audit findings.

**Cumulative audit pattern:** Pre-execution-audit pattern is now **8-for-8** (Phases 4 / 6 / 6.5 / 7 / 7.5 / 7.6 / 8 / 8.5 all delivered tight scope-or-defer outcomes).

**Status:** **CLOSED via Path Y 2026-05-05.**
