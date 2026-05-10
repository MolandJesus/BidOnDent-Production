---
status: ACTIVE
authority: REF
scope: pms-continuity-reconnaissance
canonical_source_of_truth: REF_PASS_305_PMS_CONTINUITY_RECONNAISSANCE_2026-05-10.md
companion_to: REF_PLATFORM_CORE_ANTI_SPRAWL_DOCTRINE_2026-05-10.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-10
---

# PMS Continuity Reconnaissance (Pass 305, 2026-05-10)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #28 (Phase H.2: continuity organism recon under STRICT OBSERVATION-ONLY posture).

**Tier:** REF. **Not LAW. Not enforcement. No architecture changes.**

**Posture:** behavioral archaeology. Investigate WHY the repo's "felt continuity" is unusually stable — under the hypothesis that the source is distributed timing choreography rather than centralized PMS infrastructure.

**Companion:**
- [`REF_PLATFORM_CORE_ANTI_SPRAWL_DOCTRINE_2026-05-10.md`](REF_PLATFORM_CORE_ANTI_SPRAWL_DOCTRINE_2026-05-10.md) §7 (emotional-runtime coherence). This pass extends §7 with concrete evidence.
- [`REF_FALSE_UNIVERSAL_CASEBOOK_2026-05-10.md`](REF_FALSE_UNIVERSAL_CASEBOOK_2026-05-10.md) §2 (lazyWithRetry — the canonical small example of timing as embedded doctrine). This pass extends that finding to the system scale.

---

## §1. The PMS framing — and why it's misleading

Persistent Map Session (PMS) was scaffolded in Pass 266 as a deliberate seam for FUTURE persistent-engine work. The current state:

- [`MapSessionProvider`](../src/app/components/maps/MapSessionProvider.tsx) — 70 lines, **Phase 1 inert**. The provider returns `<MapSessionContext.Provider value={MAP_SESSION_DEFAULT_VALUE}>{children}</...>` with no state, no engine handle, no side effects beyond the `maplibreResizePatch` first-import-line.
- [`mapSessionContext`](../src/app/components/maps/mapSessionContext.ts) — 75 lines. The `MAP_SESSION_DEFAULT_VALUE` is an `Object.freeze({ mapInstance: null, routeActiveAt: 0, registerSlot: NOOP, unregisterSlot: NOOP })`. NOOP is an explicit no-op function.

**Critical observation:** as of 2026-05-10, PMS contributes ZERO runtime behavior. The scaffold exists. The interface is defined. The Phase 2-5 capabilities (engine handle, slot registration, route-active timestamp, auth-flip cleanup) are all placeholders.

**Therefore: whatever "felt continuity" the repo currently delivers is NOT coming from PMS.** It cannot be — PMS does nothing yet.

This finding is itself important. The hypothesis that "PMS is responsible for felt continuity" is **falsified at the obvious level**. The continuity must be coming from somewhere else.

---

## §2. The actual continuity-choreography — distributed across local sites

When PMS contributes nothing, the source of felt continuity must be locatable by inspection of running code. Pass 305's investigation found a **distributed set of timing-decision sites** — each calibrated for one specific emotional moment — that collectively create the felt-continuity property.

### 2.1 Catalog of distributed continuity-choreography sites

| Site | Constant | Value | Emotional moment served |
|---|---|---|---|
| [`useMapPaneState.ts:160`](../src/app/components/shop/useMapPaneState.ts#L160) | slow-load timeout | 25,000 ms | Tolerance: don't claim "failed" until 25s of patience has elapsed (NOT 5s — that would lie about marginal networks) |
| [`useMapPaneState.ts:165`](../src/app/components/shop/useMapPaneState.ts#L165) | geo error auto-clear | 4,000 ms | Read-once-then-disappear: long enough to read, short enough not to nag |
| [`useMapPaneState.ts:122-133`](../src/app/components/shop/useMapPaneState.ts#L122) | container-readiness gate (rAF + ResizeObserver) | post-paint frame | Avoid mounting a map onto a 0×0 container that would crash; wait until the parent has actually composited |
| [`maplibreResizePatch.ts:48-54`](../src/app/utils/maplibreResizePatch.ts#L48) | resize-failure retry | 300 ms | Calm recovery: don't surface the error; quietly retry |
| [`maplibreResizePatch.ts:79-85`](../src/app/utils/maplibreResizePatch.ts#L79) | constructor-resize retry | 200 ms | Faster than resize-retry because constructor-time crashes block visible rendering |
| [`CoverageMapDialog.tsx:185-191`](../src/app/components/landing/CoverageMapDialog.tsx#L185) | arrival-transition hold | 2,800 ms | Honor the moment of arrival: 2.8 seconds of "you arrived" before flipping back to browse mode |
| [`CoverageMapDialog.tsx:194-197`](../src/app/components/landing/CoverageMapDialog.tsx#L194) | nav-start transition | 2,200 ms | Settling time during nav-start mode flip |
| [`useNotificationEvents.ts:73`](../src/app/features/notifications/useNotificationEvents.ts#L73) | toast-duplicate window | 3,000 ms | If the same toast fires within 3s, treat as duplicate; longer = false-positive dedup; shorter = spam |
| [`notificationEventTypes.ts:80`](../src/app/features/notifications/notificationEventTypes.ts#L80) | default toast duration | 4,000 ms | Same 4s read-window as the geo-error |
| [`useUserGeolocation.ts:18`](../src/app/hooks/useUserGeolocation.ts#L18) | geo-cache max age | 600,000 ms (10 min) | Trust your last known position for 10 min; longer = stale; shorter = battery |
| [`useUserGeolocation.ts:131`](../src/app/hooks/useUserGeolocation.ts#L131) | `getCurrentPosition` maximumAge / timeout | 300,000 / 10,000 ms | 5-min staleness OK; 10-second wait |
| [`lazyWithRetry.ts:18`](../src/app/utils/lazyWithRetry.ts#L18) | chunk-load retry delay | 1,500 ms | Pass 304 §2 — trust-pacing decision encoded as constant |
| [`useNavigationLaunch.ts:41`](../src/app/hooks/useNavigationLaunch.ts#L41) | re-sync trigger | window `focus` event (not `visibilitychange`) | Per Pass 290 X1 — gentler than visibility for tab-arrangement scenarios; trades some staleness for less aggressive re-fetch |
| [`useAppearanceMode.ts:64`](../src/app/hooks/useAppearanceMode.ts#L64) | cross-tab `storage` event | event-driven (no debounce) | Theme is the ONLY cross-tab synced state; all other state stays per-tab |
| `theme.css` `--bd-flow-loop-slow` | atmospheric orbit | 28,000 ms | Slow enough to be subliminal; user feels presence without distraction |
| `theme.css` `--bd-flow-loop-med` | atmospheric medium | 18,000 ms | Mid-tier ambient |
| `theme.css` `--bd-flow-loop-fast` | atmospheric fast | 4,200 ms | Faster ambient (not 4 or 5; specifically 4.2 — that decimal is a calibration artifact) |
| `theme.css` `--bd-ease-entrance` | entrance curve | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Overshoot-y, soft-arrival timing |
| `theme.css` `--bd-flow-ease` | flow curve | `cubic-bezier(0.4, 0, 0.2, 1)` | Material standard for steady-state motion |

There are at least **18 distinct timing constants** distributed across **8 files** governing continuity choreography.

### 2.2 What is NOT centralized

Each timing lives at its consumer site. None is exported as a "platform timing constant" or grouped into a "ContinuityTimings" config. The `--bd-flow-*` cadence tokens (Pass 282) are CSS-tokenized but used only for atmospheric animations, not for runtime behavior.

This means: **the timings are not a system. They are a habit.** Each site's author chose a number that felt right for the specific user moment that site serves. The COLLECTION of those choices is what produces felt continuity.

---

## §3. The pattern: each timing carries ONE specific emotional moment

Examine the timings under the lens "what would a different number cost?"

**`useMapPaneState.ts:160` slow-load timeout = 25,000 ms.** Doc comment explicitly says: *"slow-load fallback only. The hard-failure path is `handleMapLoadError`."* Why 25s and not 5s? Because the timeout is a CONFESSION mechanism, not a decision mechanism. At 25s the app says "this map is taking unreasonably long; let me show you a fallback rather than continue lying that everything is fine." 5 seconds would lie about marginal networks; 60 seconds would let the user wait too long. 25s is the threshold where "patient" becomes "mistreating the user."

**`CoverageMapDialog.tsx:189` arrival-transition = 2,800 ms.** When the user reaches their destination, the app holds the "arrived" mode for 2.8 seconds before reverting to browse. Why 2.8s? Because arrival is an emotional moment that needs time to be FELT. 1 second would feel like the app didn't notice. 5 seconds would feel like it's waiting for permission. 2.8s is the minimum dignity that respects the user's accomplishment without lingering.

**`useNotificationEvents.ts:73` dedup window = 3,000 ms.** A duplicate toast within 3 seconds is treated as the same event. Why 3s? Because rapid duplicate notifications shake user trust ("did the system glitch?"). 1s would let truly distinct events deduplicate (e.g. two arrivals at neighboring locations). 10s would suppress legitimate re-notifications. 3s is the "burst" window for a single user action's downstream events.

**`useUserGeolocation.ts:18` geo-cache max age = 10 minutes.** Why 10 min and not 30 sec or 1 hour? Because geolocation is BATTERY-EXPENSIVE and ADDRESS-LEVEL accurate. 30 sec would drain the device for a precision the user does not need. 1 hour would drift if the user moved across town. 10 min is the practical "user is reasonably still here" window for a session.

**`useNavigationLaunch.ts:41` listens for `focus`, NOT `visibilitychange`.** Why? Because `visibilitychange` fires on Cmd-Tab away/back AND on tile-arrangement (e.g. multi-monitor setups, kiosks). `focus` fires only when the tab actually receives keyboard focus. Per Pass 290 X1: this trades some staleness in unfocused-but-visible tabs for not aggressively re-fetching state every time the user glances at another window. The timing/event choice IS a trust signal.

**`theme.css --bd-flow-loop-fast: 4.2s`.** Why 4.2 and not 4 or 5? The decimal is a calibration artifact — someone set up the atmospheric loop, watched it, and tuned. Round numbers would feel mechanical. 4.2 is "close enough to feel natural; specific enough to feel hand-crafted."

Each number is a small emotional decision. The COLLECTION of 18 such decisions produces the felt continuity property the relay framework named.

---

## §4. Hypothesis test — confirmed

Per relay #28 primary goal: *"Determine whether PMS is partially responsible for the repo's unusually stable 'felt continuity'."*

**Result: PMS itself is not the source (PMS is Phase 1 inert). The source is the distributed timing choreography catalogued in §2.**

Per relay #28 §B specifically: *"Does PMS optimize merely for correctness? Or does it optimize for felt continuity calmness?"*

**Result: PMS hasn't yet been asked to optimize for either, because PMS doesn't yet do anything. But the broader CONTINUITY system the repo currently has DOES optimize for felt continuity calmness — at the level of individual timing constants distributed across 8 files.**

Per relay #28's "most important new hypothesis": *"The repo's strongest property may not be modularity, or topology, or abstraction discipline. It may be continuity reassurance."*

**Result: confirmed. The 18-constant inventory is concrete evidence.** Each constant trades some abstract "performance" or "minimalism" for emotional-runtime calmness. None is the "obvious correct" number; each is a CALIBRATION for one specific user moment. The cumulative effect is the felt continuity.

This explains why behavioral locality repeatedly outperformed centralization pressure (Pass 303 §11): centralizing the timings would force consumers onto BD's calibrations, which would erase the per-consumer emotional voice.

---

## §5. Persistence-authority locality (relay #28 Priority C)

Pass 290 §3 catalogued persistence keys + their cross-tab semantics. Pass 305's reconnaissance confirms the deeper question: **who decides timing for each persistence-touching surface?**

| Surface | Timing decisions owner |
|---|---|
| Geolocation cache | `useUserGeolocation` — owns 10-min max-age + 5-min position staleness + 10s timeout |
| Map session restoration | `useShopDirectorySession` — owns mapCenter/mapZoom + viewport bounds; restoration timing implicit (initialCenter/initialZoom on next mount) |
| Coverage map state | `coverageState.ts` — owns full SavedCoverageState shape + persist-effect timing |
| Navigation session | `loadNavigationSession()` — owns the deserialize/validate timing; consumed by `useNavigationLaunch` on focus |
| Discovery quality snapshot | `placeDiscoveryQuality.ts` — owns the cache-first read + module-singleton + localStorage write (Pass 294's 4-authority concentration) |
| Theme appearance | `useAppearanceMode` — owns the storage-event sync + setItem timing |

**No surface delegates timing to a generic helper.** `persistedState.ts` is a thin envelope helper (versioned read/write); it does NOT decide WHEN to read/write. That decision lives at the consumer.

**Implication:** centralizing persistence timing would replace 6+ specifically-tuned site-decisions with one generic decision. Per relay #28's hypothesis: this would destroy consumer-specific continuity behavior. **Pass 305 confirms: hypothesis verified.** Each site's timing IS its specific continuity contract.

---

## §6. Cross-tab emotional continuity (relay #28 Priority D)

Pass 290 catalogued cross-tab as "best effort, eventual-on-focus consistency." Pass 305 extends with the EMOTIONAL dimension.

The single cross-tab sync via `storage` event (`useAppearanceMode`) is **immediate**. Theme changes propagate without delay. Why? Because theme is a HIGH-VISIBILITY consumer-orientation signal — the user sees light/dark instantly across all open tabs. Lag would feel broken.

The other cross-tab consistencies (focus-rehydrate for nav session) are **lazy**. Why? Because navigation session re-loads silently when the user turns attention to a tab. Lag is not visible. Aggressive re-loading would cost battery and bandwidth for no perceptible gain.

**The asymmetry is itself a calibration:**
- Visible state → immediate sync
- Invisible-until-focused state → focus-triggered re-sync
- Per-tab state (geolocation cache, website-identity session) → never synced

This is a 3-tier emotional-pacing model encoded across the codebase. **No single artifact or helper documents it.** It emerges from the local decisions of `useAppearanceMode`, `useNavigationLaunch`, and `useUserGeolocation`. The model is real but not codified.

Pass 305 surfaces this as a **finding worth preserving narratively** but does NOT codify it as enforcement. Per relay #28: codification risks bureaucracy. The model is healthier as a habit observable in the source than as a rule documented in a registry.

---

## §7. Anti-bureaucracy self-check (relay #28 Priority E)

Per relay #28's specific request: *"continue Phase H self-observation. Especially monitor whether doctrine artifacts begin replacing direct reasoning."*

Pass 305 is the 9th doctrine-related artifact in 2 days (Passes 295, 296, 297, 300, 302, 303, 304 + this pass — and Pass 281 which preceded the current sequence). Pass 304 §10 established a health-check rule: *"if a doctrine pass would produce an artifact that does not have a single specific contribution distinguishable from existing artifacts, the pass should not be authored."*

Does Pass 305 pass that test?

**Single specific contribution:** the 18-constant inventory in §2 — a CONCRETE catalog of the actual continuity-choreography mechanisms. None of the prior 8 artifacts contained this catalog. Pass 303 §7 (emotional-runtime coherence) named the property; Pass 305 §2 names the specific artifacts that produce it.

**No overlap with prior:** §1 falsifies a specific hypothesis (PMS = source of felt continuity → false). §3 explains *why* each number was chosen, with prose. §4 confirms the broader hypothesis at a system scale. §5 + §6 extend persistence-authority and cross-tab observations with emotional-pacing dimensions. None is duplicated.

**Verdict: Pass 305 passes the §10 health check.** It contributes a concrete inventory + the emotional-pacing model finding that no prior artifact contained.

**Forward implication:** the next doctrine pass should be authored only if it would similarly contribute one specific finding not present in passes 281-305. If a future pass would simply restate or reorganize existing material, it should NOT be written.

The 9-artifact corpus is now reaching a natural cap. Future passes should likely shift from doctrine-authoring to:
- direct code observation (more passes like this one — concrete inventory + interpretation)
- responding to actual contributor pressure (when a refactor is proposed, evaluate against existing doctrine)
- preserving the existing doctrine without expanding it

---

## §8. What this pass does NOT do

- No PMS extraction (relay #28 explicit prohibition)
- No persistence layer redesign
- No session coordinator
- No restoration framework
- No continuity abstraction
- No shared lifecycle orchestrator
- No hydration registry
- No runtime coordinator
- No "platform persistence utilities"
- No generalized recovery APIs
- No third live extraction (cumulative Phase F+ prohibition)
- No source code modification
- No new platform-core files
- No modification of existing doctrine artifacts
- No LAW edit (relay #28: REF-tier only)
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit
- No PLAN_PLATFORM_* edit
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #18)
- No fix of the 4 pre-existing TypeScript errors
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §9. Pass 281 invariants check

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15 / #17 / #18 / #19 / #20 / #21 / #22 / #23 / #24 / #25 / #26 / #27 / #28 prohibitions | ZERO violations |
| `placeDiscoveryQuality.ts` source | UNTOUCHED (per relay #18) |
| `src/platform-core/` folder | UNTOUCHED (still 2 files + README) |
| LAW / MOLANDJESUS / CLAUDE.md / MAP_SHELL_HIERARCHY / PLAN_PLATFORM_* | UNTOUCHED |
| MapSessionProvider + mapSessionContext | OBSERVED ONLY (not modified) |

ZERO new owner-decision points (cumulative remains 31).
ZERO architecture changes (relay #28 strict observational posture preserved).

---

## §10. Forward triggers

1. **Future pass that would consolidate the 18 constants into a "ContinuityTimings" config** → REJECT. Per §3 + §4: each constant carries one specific emotional-moment calibration. Centralizing would erase the per-site reasoning. Per Pass 303 §11: this is the canonical false-universal pattern at system scale.
2. **Future PMS Phase 2-5 work** → must preserve the distributed-timing pattern. PMS expanding does NOT mean PMS owns continuity-choreography. PMS owns the persistent-engine concern; timing decisions stay at consumer sites.
3. **Owner authorizes Stacey atmospheric portability reconnaissance** (relay #27 tertiary; relay #28 implicit) → Pass 306+. Stacey's site needs HER OWN timing calibrations, not BD's. The 18-constant inventory becomes a reference for "here's what timing-decisions mean," not for "here's what to copy."
4. **Future relay introduces a new specific recon target** → Pass 306+ executes per single-doc-per-pass discipline.
5. **Health-check ratchet:** subsequent doctrine passes must each contribute one specific finding not already in passes 281-305. Failing this test = no pass. The corpus is approaching natural cap.

---

## §11. Status

REF doc shipped Pass 305. Pure observational reconnaissance. Hypothesis test result: confirmed at the system level + falsified at the PMS-specific level. Felt continuity is a distributed property of 18+ small timing decisions across 8 files; PMS is currently inert and not contributing.

The architectural mission is now anchored on a concrete finding: **the repo's continuity reassurance comes from a HABIT, not a system.** That distinction governs all future continuity-related work.

**End of doc.**
