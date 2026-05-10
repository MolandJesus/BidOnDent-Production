# Pass 53 — Deep Navigation Engine Audit (audit-only)

**Date:** 2026-05-07
**Branch:** BidOnDent-Horizon-Beta @ 715e87f7 (pre-Pass-53)
**Scope:** Read-only engine inventory of `src/app/features/navigation/**` + consumer wiring trace + animation contract verification.
**Why:** Pass 46 audit only walked `src/app/components/maps/navigation/`, `src/app/services/navigation/`, and `src/app/hooks/`. It missed `src/app/features/navigation/**` entirely — that is where the deviation/reroute/voice-alerts/session engine actually lives. KI-075's description ("voice TTS not implemented", "deviation detection is stub") is **stale**; the engine is largely shipped.

---

## A. Inventory: `src/app/features/navigation/**` (1 808 LOC across 13 files)

| File                           | LOC | Role                                                                                                                                                                                                                   |
| ------------------------------ | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useNavigationSession.ts`      | 307 | FSM (`idle → planning → active ⇄ paused → ended → idle`). Cloud sync via `fetchNavigationSession` / `saveNavigationSessionToCloud`. Pause history + `computeActiveSeconds`.                                            |
| `useNavigationReroute.ts`      | 234 | Lifecycle `idle → eligible → pending → completed → cooldown`. Auto-reroute on high-severity off_route (when `autoRerouteEnabled`). `requestReroute` / `confirmReroute` / `cancelReroute`. `REROUTE_COOLDOWN_MS` timer. |
| `detectDeviation.ts`           | 207 | Pure detectors: `route_change`, `stopped` (`STOPPED_SPEED_THRESHOLD_MPH`), `delay_increase` (>20 % or +3 min), `off_route` (`OFF_ROUTE_THRESHOLD_MILES`, severity `high` if >1 mi). `GPS_JITTER_METERS = 8` guard.     |
| `useNavigationVoiceAlerts.ts`  | 185 | Bridges deviation events + reroute status → `speakNavigationInstruction`. `DEVIATION_ALERT_MODES = {"full","alerts-only"}`, `DELAY_ALERT_MODES = {"full"}`. 10 s semantic dedup via `announcedEventIdsRef`.            |
| `useNavigationToastBridge.ts`  | 149 | Translates session/reroute/intelligence events into `notifications.showToast`.                                                                                                                                         |
| `deviationTypes.ts`            | 137 | `DeviationEvent`, `NavigationSnapshot`, severity enums, thresholds.                                                                                                                                                    |
| `deviationVoicePhrases.ts`     | 117 | Persona-aware spoken phrases for deviation + reroute states.                                                                                                                                                           |
| `sessionTypes.ts`              | 100 | `NavigationSession`, `NavigationSessionStatus`, pause entry, waypoint.                                                                                                                                                 |
| `shouldTriggerReroute.ts`      | 95  | Cooldown + severity gate. Only `off_route` at `REROUTE_MIN_SEVERITY`+ qualifies.                                                                                                                                       |
| `useNavigationIntelligence.ts` | 92  | `pushEvent` + `evaluate(snapshot)`. `DUPLICATE_INTERVAL_MS = 5 000` dedup. `MAX_DEVIATION_HISTORY` ring buffer.                                                                                                        |
| `rerouteTypes.ts`              | 86  | `RerouteState`, `RerouteRequest`, status enum.                                                                                                                                                                         |
| `index.ts`                     | 65  | Public re-exports.                                                                                                                                                                                                     |
| `computeNavigationMetrics.ts`  | 34  | Active-seconds + segment helpers.                                                                                                                                                                                      |

**Findings:** Engine is a clean, layered, testable feature module. Boundaries are correct (LAW_LAYERED_ARCHITECTURE: pure detectors → state hooks → bridges → consumer hook). No file exceeds 500 LOC; only `useNavigationSession.ts` is above the 300 soft limit (307 — borderline, acceptable).

---

## B. Voice TTS — End-to-End Wiring Verified ✅

**Library:** Web Speech API only (LAW-locked — no new TTS dependency).

**Speak call sites:**

1. **Step cues** — `src/app/hooks/useNavigationRoutePreview.ts:268-272`. Inside the GPS step-tracking effect, when `stepDistanceMeters ≤ adaptiveSpeakThreshold` and step has not been spoken (`spokenStepIdsRef`), calls `speakNavigationInstruction({ text: nextStep.instruction, voiceMode, voicePersona, voiceVolumePreset })`. Adaptive threshold = `getManeuverBaseSpeakDistanceMeters(step) + getSpeedAdjustmentMeters(speed) + getAccuracyAdjustmentMeters(accuracy)`.
2. **Deviation + reroute alerts** — `src/app/features/navigation/useNavigationVoiceAlerts.ts:128, 159`. Watches `latestEvent` and `rerouteStatus`, dedupes by `event.id` + 10 s semantic window, calls `speakNavigationInstruction`.

**Cross-browser handling:** [`voiceGuidance.ts`](../../../src/app/services/navigation/voiceGuidance.ts) (198 LOC) handles Chrome async voices, Safari user-gesture requirement, Firefox limited persona set. `primeVoiceEngine()` is called from `setVoiceMode` and from both `handleStartInAppNavigation` / `handleStartDirectNavigation` to satisfy Safari's gesture rule.

**Settings:** Persisted via `loadNavigationGuidanceSettings` / `saveNavigationGuidanceSettings`. `voiceGuidanceEnabled` only true when `navSession.session.status === "active"` AND destination matches.

**Wiring integrity:** ✅ Full path GPS → step distance → `speakNavigationInstruction` → `window.speechSynthesis.speak`.

**KI-075 claim "voice TTS not implemented" is FALSE.**

---

## C. Deviation + Reroute — End-to-End Wiring Verified ✅

**Snapshot ingest:** [`useNavigationLifecycleEffects.ts:51-78`](../../../src/app/hooks/useNavigationLifecycleEffects.ts) builds `NavigationSnapshot` from current GPS + route polyline + speed and calls `intelligence.evaluate(snapshot)` on every GPS update (effect deps include `shopMapUserCoords.latitude/longitude` + `currentSpeedMph`).

**Detection:** `detectDeviations(prev, next)` returns events. GPS jitter guard prevents off-route fire when GPS hop < 8 m.

**Reroute lifecycle:** `useNavigationReroute(intelligence.latestEvent, { autoRerouteEnabled, currentRouteId })` instantiated at [`useShopDirectoryNavigation.ts:73`](../../../src/app/hooks/useShopDirectoryNavigation.ts).

- Auto path: high-severity `off_route` + `autoRerouteEnabled = true` → auto `requestReroute → confirmReroute` chain.
- Manual path: `handleReviewRoute` (line 405) → `requestReroute(currentRouteId) → refreshRoutePreview() → confirmReroute()`.

**UI surface:** `<NavigationDeviationPrompt event={nav.deviationEvent} onReviewRoute={nav.handleReviewRoute} />` rendered at `ShopDirectoryScreen.tsx:120` and threaded into the immersive map overlay.

**Voice surface:** `useNavigationVoiceAlerts(latestEvent, rerouteStatus, settings, voiceGuidanceEnabled)` at `useShopDirectoryNavigation.ts:143`. Speaks deviation + reroute lifecycle phrases.

**Toast surface:** `useNavigationToastBridge(session, latestEvent, notifications, …, rerouteState)` at `useShopDirectoryNavigation.ts:147`.

**KI-075 claim "deviation detection is stub" is FALSE.**

### Bug found (minor — log for Pass 54+, do not fix in audit):

`handleReviewRoute` calls `confirmReroute()` synchronously immediately after `refreshRoutePreview()`. `refreshRoutePreview()` only resets local state and triggers an async OSRM fetch — the cooldown therefore starts before the new route arrives. If OSRM fails, the user is stuck in cooldown with no refreshed route. Fix: defer `confirmReroute()` until `routePreview` actually changes (or until OSRM resolves). **Severity: low** — auto-reroute path is unaffected (it manages its own state machine inside `useNavigationReroute`).

---

## D. Turn-by-Turn Progression — End-to-End Wiring Verified ✅

`useNavigationRoutePreview.ts:240-298` runs on every GPS update:

- Computes `stepDistanceMeters` to `nextStep.location` via `haversineMiles × 1609.34`.
- Adaptive speak threshold (per Section B).
- Adaptive advance threshold = `getManeuverAdvanceDistanceMeters(step) + 0.5 × getAccuracyAdjustmentMeters(accuracy)`.
- On arrival maneuver + `stepDistanceMeters ≤ getArrivalCompletionDistanceMeters(accuracy)` → `setHasArrived(true)`.
- Otherwise on advance threshold → `setCurrentStepIndex(i + 1)`.

**Off-route auto-refetch:** `useNavigationRoutePreview.ts:86-101` computes `isOffRoute` (~100 m / 0.062 mi from polyline). When true, the route-fetch effect's `shouldRefreshRoute` flips true, triggering a fresh OSRM call. `resolveStepIndexAfterRefresh` preserves progress; `computeCarriedSpokenSteps` preserves dedup set.

**Step cards:** `<NavigationActiveManeuverCard nextStep followingStep tone />` rendered at `ShopDirectoryScreen.tsx:111` (immersive overlay) using `nav.followingStep` / `nav.nextStep` derived from `currentStepIndex`.

### Architectural duplication noted (log for planner — do not fix in audit):

There are **two off-route paths**:

1. `useNavigationRoutePreview` auto-refetch at ~100 m (always-on, no UI prompt).
2. `useNavigationReroute` lifecycle at `OFF_ROUTE_THRESHOLD_MILES` with severity gating + cooldown + UI prompt.

These are not strictly duplicate (path 1 is "small drift, just reroute silently"; path 2 is "user has clearly diverged, prompt them"), but the relationship is implicit and could double-fire OSRM in edge cases. **No user-visible bug observed**, but worth a planner conversation before Pass 60+ (saved-places phase).

---

## E. Animation + Atmosphere Compliance vs LAW_ANIMATION_AND_ATMOSPHERE

**CSS-first lock:** ✅ Honored. Map/nav surfaces use CSS classes only (`map-liquid-panel`, `map-liquid-sheen`, `map-nav-icon-ring-pulse`, `map-ui-enter`, `map-ui-enter-delay-{1,2,3}`). All defined in `src/styles/theme.css:554-625`.

**`prefers-reduced-motion` contract:** ✅ Honored at the CSS layer. `theme.css` contains **10** `@media (prefers-reduced-motion: reduce)` blocks (lines 689, 772, 782, 1142, 1210, 1320, 1353, 2134, 3724, +1). The map UI surfaces are all reset under `theme.css:689` (lines 690-698 cover sheen, icon pulse, all four enter classes).

**JS layer:** Only **3** `prefers-reduced-motion` checks in TS — `useParallaxOffset.ts:27`, `HeroSection.tsx:44`, `ReportScreen.tsx:201`. None of them are nav-engine code. Acceptable since CSS handles all nav/map animation, but we should verify no `framer-motion` / `motion.div` slipped into nav components.

**framer-motion check:** `grep -r "framer-motion\|motion\." src/app/features/navigation src/app/components/maps/navigation` returns **zero** matches. ✅

**29 canonical keyframes status:** Not enumerated in this pass — will require a dedicated cross-reference with `LAW_ANIMATION_AND_ATMOSPHERE.md` § canonical-keyframes-list. Deferred to Pass 57.

---

## F. Pass 54+ Dispatch Recommendations

**Real outstanding gaps (post-audit, sorted by user impact):**

| #      | Gap                                                                                                              | Severity                             | File budget                                                                                              | Schema?         | Notes                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| **F1** | `handleReviewRoute` confirms cooldown before OSRM resolves (Section C bug)                                       | P2                                   | 1 file, ~15 LOC                                                                                          | No              | Defer `confirmReroute()` until `routePreview.fetchedAt` advances; or pass a callback into `requestReroute`. |
| **F2** | Saved navigation places persist to localStorage only (`useSavedNavigationLocations.ts:1-16`); cloud sync missing | P2                                   | 2-3 files (service + hook + types), but **needs new `navigation_saved_places` migration → planner-only** | YES (migration) | **DO NOT autonomously dispatch** — schema migration excluded by chain authorization. Hand back to planner.  |
| **F3** | Dual off-route paths (Section D) — implicit, could double-fire OSRM                                              | P3 (architectural, not user-visible) | 1-2 files, ~30 LOC                                                                                       | No              | Probably wait until F2 lands so we don't refactor twice.                                                    |
| **F4** | Real-time partner-shop availability (`isAvailable` realtime channel)                                             | P2 (planner scope)                   | New service + Supabase channel + migration                                                               | YES             | **DO NOT autonomously dispatch** — needs realtime infra + planner.                                          |
| **F5** | Animation pass — verify all 29 LAW canonical keyframes vs `theme.css`; add any missing on nav/map surfaces only  | P4                                   | ≤ 5 files, ≤ 200 LOC, CSS-first                                                                          | No              | Deferred to Pass 57 per chain plan.                                                                         |
| **F6** | Per-role map layer rules (customer sees X, shop sees Y, insurer sees Z)                                          | P3 (planner scope)                   | Cross-cutting                                                                                            | No              | **DO NOT autonomously dispatch** — needs role/layer policy doc first.                                       |

### Autonomous chain Pass 54 candidate

**F1** is the only gap in §F that satisfies all chain-authorization conditions: 1 file, ~15 LOC, no schema, no new dependency, no design-canon question, pure connection-wiring fix, no large refactor. **Recommended Pass 54: fix the reroute-confirm timing bug.**

### Stop-and-hand-back list

F2, F4, F6 require planner re-dispatch. **Do not auto-execute** — they violate "no schema migration" and/or "no provider stack change" and/or "no large product decision" hard stops.

---

## Summary

KI-075 description is **outdated by ≥2 passes of work**. Voice TTS, deviation detection, reroute lifecycle, and turn-by-turn progression are all shipped and wired. Real outstanding gaps are: (a) reroute confirmation timing, (b) saved-places cloud sync, (c) realtime partner availability, (d) per-role map layer policy, and (e) animation cross-reference vs the 29-keyframe LAW list.

KI-075 entry will be updated in this same pass per CO-UPDATE rule.
