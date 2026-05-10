# REF — Map Fullscreen Lifecycle Continuity Audit (Pass 289, 2026-05-09)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-09 #16 (NEW chat handoff; ChatGPT priority #1: continue deep Map Continuity + Spatial UX Audit).
**Tier:** REF (current truth — derived purely from source as of commit `4beaa88e`).
**Source modification:** ZERO. Pure read-only audit. No production source touched, no LAW touched, no MOLANDJESUS touched.
**Companion to:** [`REF_MAP_SHELL_HIERARCHY_2026-05-09.md`](REF_MAP_SHELL_HIERARCHY_2026-05-09.md) (static shell-rule contract), [`REF_MAP_RENDERER_INVENTORY_2026-05-09.md`](REF_MAP_RENDERER_INVENTORY_2026-05-09.md) (engine inventory), [`REF_MAP_UX_COHESION_AUDIT_2026-05-09.md`](REF_MAP_UX_COHESION_AUDIT_2026-05-09.md) (UX cohesion). This doc adds **dynamic lifecycle behavior** that the shell hierarchy doc covers only as static rules (see `MAP_SHELL §3.5` immersive mode).

---

## §1. Premise & scope

ChatGPT relay #15 #7 surfaced an operationally critical observation:

> *"semantic authority can commit before visual continuity, orchestration layers are partially decoupled, continuity failures can localize, and framer-motion instability is secondary to mount sequencing."*

Relay #16 named "fullscreen map continuity" as part of the highest-density continuity surface still requiring deep audit. This pass interrogates one specific question:

**When a user enters or exits a "fullscreen" map surface, what survives, what is destroyed, and where does continuity drift?**

The audit deliberately reads source rather than trusting prior abstractions. Three patterns surfaced — only two are real lifecycle patterns.

---

## §2. Pattern inventory — three "fullscreen-class" surfaces (only two are lifecycle patterns)

### 2.1 Pattern A — Tree-swap conditional render (Shop Directory immersive)

**Owner file:** [`src/app/components/shop/ShopDirectoryScreen.tsx:156`](../src/app/components/shop/ShopDirectoryScreen.tsx#L156)

**Trigger state:** `session.isImmersive` (derived in [`src/app/hooks/useShopDirectoryComputedValues.ts:179`](../src/app/hooks/useShopDirectoryComputedValues.ts#L179) as `mapViewMode === "map"`)

**State store:** `useShopDirectorySession` (`mapViewMode` lives in session state, controlled by `setMapViewMode`)

**Render mechanism:** plain `if (session.isImmersive) return <ImmersiveTree />`. The immersive tree and the hybrid tree are sibling JSX branches. React unmounts whichever branch was previously rendered and mounts the new one each toggle.

**Mode trichotomy** (from `mapViewMode: "list" | "map" | "hybrid"`):
- `"list"` → list-only layout (lines 309+ of `ShopDirectoryScreen.tsx`)
- `"hybrid"` → `ShopDirectoryHybridStage` (line 277+)
- `"map"` → `ShopDirectoryImmersiveMap` wrapped in `NavigationErrorBoundary` (line 156+)

**Exit paths:**
1. ESC key → `useEscapeKey(session.isImmersive, exitImmersive)` at line 153 → `setMapViewMode("hybrid")`
2. `onBack` button (top bar) → `setMapViewMode("hybrid")` at line 175
3. `onSwitchMode` selector inside immersive top bar → arbitrary mode (line 191)

**Browser Fullscreen API used?** No. There is no `document.requestFullscreen()` / `document.exitFullscreen()` call anywhere in `src/app/`. The "fullscreen" effect is purely React-tree CSS positioning (`fixed inset-0 z-[60]` on the immersive container — line 128 of `ShopDirectoryImmersiveMap.tsx`).

### 2.2 Pattern B — Radix Dialog portal (Coverage Map Dialog)

**Owner file:** [`src/app/components/landing/CoverageMapDialog.tsx:227`](../src/app/components/landing/CoverageMapDialog.tsx#L227)

**Trigger state:** `open` prop (controlled by parent in [`src/app/components/landing/HeroSection.tsx`](../src/app/components/landing/HeroSection.tsx))

**Render mechanism:** `@radix-ui/react-dialog`'s `Dialog` + `DialogPortal` + `DialogContent`. Radix [defaults to unmount-on-close](../src/app/components/ui/dialog.tsx) — there is no `forceMount` prop on `DialogContent` or `DialogPortal`. So on close, all dialog children are removed from the React tree.

**Exit paths:**
- Radix close affordances (overlay click, X button, ESC) → `onOpenChange(false)` → unmount
- Programmatic via parent setting `open=false`

### 2.3 Pattern C — `immersiveFullscreen` prop (NOT a lifecycle pattern)

**Owner file:** [`src/app/components/landing/CoverageActiveNavigationLayout.tsx:305`](../src/app/components/landing/CoverageActiveNavigationLayout.tsx#L305) → forwards to [`MapLibreServiceCoverageMap.tsx`](../src/app/components/maps/MapLibreServiceCoverageMap.tsx) → forwards to [`MapEngineCanvas.tsx`](../src/app/components/maps/engine/MapEngineCanvas.tsx).

**What it actually is:** a render-mode boolean. When true, the canvas:
- Allows lower zoom (`minZoom={immersiveFullscreen ? 2 : 8}`)
- Disables `cooperativeGestures`
- Shows world-overview / strategic-overview / night-backdrop layers conditionally
- Reads from `toneTheme.immersiveShellToneClassName` instead of `shellToneClassName`

**Critical: the prop does NOT mount or unmount the map.** It is a styling/configuration discriminator passed in continuously while the map is alive. No lifecycle transition is associated with toggling it (in fact it is set to a literal `true` at the call site and never toggled). Therefore Pattern C is **out of scope for this audit** — it has no lifecycle semantics to audit.

---

## §3. Continuity-survival matrix per pattern

The matrix below traces what state survives a single toggle cycle (enter → exit → re-enter) for each pattern.

### 3.1 Pattern A (tree-swap) — survival map

| State category | Lives in | Survives toggle? | Notes |
|---|---|---|---|
| Map camera (`mapCenter`, `mapZoom`) | `useShopDirectorySession` (`useState` at [`useShopDirectorySession.ts:125-128`](../src/app/hooks/useShopDirectorySession.ts#L125)) | ✅ YES | Restored via `initialCenter` / `initialZoom` props on the next mount of `ShopDirectoryMapPane`. Written-back via `onViewportChange` callback during the prior session. |
| `mapViewportBounds` | `useShopDirectorySession` | ✅ YES | Same mechanism. |
| `selectedShopId` | `useShopDirectorySession` | ✅ YES | |
| `selectedRouteId` | `useShopDirectorySession` | ✅ YES | |
| `selectedOrigin` | `useShopDirectorySession` | ✅ YES | |
| `searchQuery` / `deferredSearchQuery` | `useShopDirectorySession` | ✅ YES | |
| `searchWithinViewport` | `useShopDirectorySession` | ✅ YES | |
| Navigation session (`navigationSessionStatus`, route preview, GPS tracking, voice settings, etc.) | `useShopDirectoryNavigation` (called at `ShopDirectoryScreen.tsx:54`, BEFORE the conditional branch) | ✅ YES | The screen-level hook lives above the if/else, so the navigation session itself never tears down on a mode toggle — only its on-screen rendering changes between hybrid and immersive surfaces. |
| Live navigation overlays | Hybrid tree DOES render guidance overlays (see `ShopDirectoryHybridMapSection.tsx:166-178` passing `navigationMode` + `renderGuidanceOverlay`) | ✅ YES (visually) | Both surfaces render guidance during active navigation — visual continuity preserved. |
| MapLibre `Map` instance | Inside `MapLibreShopDirectoryMapPane` (mounted inside `ImmersiveMapViewport`, a child of `ShopDirectoryImmersiveMap`) | ❌ NO — destroyed on each tree swap | The map instance is recreated. Tile cache is browser-level and survives, so visual rebuild is fast, but the JavaScript object is fresh. |
| `drawerOpen`, `drawerSnap` | LOCAL `useState` in `ShopDirectoryImmersiveMap.tsx:115-116` | ❌ NO — destroyed each immersive exit | Result: drawer always re-opens at default state on next immersive entry. |
| `tileDarkOverride`, `tileModeOverride` | LOCAL `useState` in `ShopDirectoryImmersiveMap.tsx:117-118` | ❌ NO — destroyed each immersive exit | **DRIFT:** user changes tile mode to "satellite" in immersive → exits → re-enters → tile mode reverts to roadmap/night derived from `isMapDark`. |
| `turnListOpen`, `voiceControlsOpen`, `settingsOpen` | LOCAL `useState` in `ImmersiveMapViewport.tsx:200-202` | ❌ NO — destroyed each immersive exit | **DRIFT:** if user has the turn-list sheet open mid-navigation and switches to hybrid (e.g. to peek at list results) then re-enters immersive, the sheet is closed. |
| Theme (`mapTheme`, `isMapDark`) | `useShopDirectorySession` | ✅ YES | |

### 3.2 Pattern B (Radix Dialog) — survival map

The `CoverageMapDialog` is unique in that the dialog itself OWNS most of its presentation state, then deliberately resets some of it on close (see `useEffect` at `CoverageMapDialog.tsx:118-123`).

| State category | Lives in | Survives close→reopen? | Notes |
|---|---|---|---|
| Map camera (`center`, `zoom`, `revision`, `tileMode`) | Parent (likely `HeroSection` and its parent state machine) — passed in as props | Depends on parent. Most likely **YES** (parent state survives). | |
| `presentationMode` (`"browse"` / `"navigating"`) | LOCAL `useState` in `CoverageMapDialog.tsx:108-109` | ❌ NO — explicitly reset to `"browse"` in the `useEffect(if !open) {...}` at lines 118-123 | This is **intentional** behavior — the dialog should re-open in browse mode. |
| `arrivalTransition` | LOCAL — reset in same `useEffect` | ❌ NO — by design | |
| `navigationTransition` | LOCAL `useState`, runs on a 2200ms timeout | ❌ NO | Will not fire on a re-open since it's only set inside `handleStartNavigation`. |
| `lastHandledStartRequestId` | LOCAL `useState` | ❌ NO | If `startNavigationRequestId` was non-zero when the dialog closed, the gating logic restarts from 0 — re-open might re-trigger an old start-nav request if the parent did not also reset the request id. **Owner-decision-bound risk** (see §6.2). |
| `followCurrentPositionRevision` | LOCAL `useState`, initial 0 | ❌ NO — resets to 0 | A new "recenter" must be issued after re-open to follow position. |
| `lastArrivalToastKeyRef` (useRef) | LOCAL `useRef` | ❌ NO — refs reset with the component | Edge case: if user closes and reopens within the same navigation session, an arrival toast could fire a second time. |
| Map instance | Inside `ServiceCoverageMap` → its own MapLibre instance | ❌ NO — fully destroyed | Recreated on next open. |

### 3.3 Pattern C — N/A (no lifecycle transition)

Out of audit scope per §2.3.

---

## §4. Identified continuity drift surfaces

Each entry below is a state-restoration drift observed under §3 — i.e. user state that the user might reasonably expect to survive a fullscreen toggle but does not. These are **observations**, not proposed remediations. The decision of which (if any) deserve fixes is owner-decision-bound (see §6.2).

### 4.1 Pattern A drift — Shop Directory immersive

**D1 — Tile-mode override loss.**
*Trigger:* user opens immersive, cycles tile mode (roadmap → night → satellite via top-bar `onCycleTileMode` at `ShopDirectoryImmersiveMap.tsx:317-325`), exits to hybrid (ESC or back-button), re-enters immersive.
*Observed behavior:* `tileModeOverride` reverts to `null` → `activeTileMode` falls back to `(isDark ? "night" : "roadmap")`.
*Impact:* user re-makes the choice on every immersive entry. Particularly noticeable when navigation is active and the user wants satellite view for landmarks.

**D2 — Drawer state loss.**
*Trigger:* user opens immersive, opens results drawer (`drawerOpen=true`, `drawerSnap="half"` or `"full"`), exits, re-enters.
*Observed behavior:* `drawerOpen` reverts to `false`, `drawerSnap` reverts to `"half"`.
*Impact:* if the user was using drawer-based shop browsing and toggles for a quick map-only glance, the drawer collapses on re-entry.

**D3 — Navigation-side-sheet state loss.**
*Trigger:* user is in active guidance mode in immersive, opens turn-list / voice-controls / settings sheet, switches to hybrid, switches back.
*Observed behavior:* All three sheets close. The hybrid view does not have equivalent sheets to inherit the open state into, so even if the state were lifted, hybrid would not show them.
*Impact:* mid-navigation users lose the in-context sheet they were consulting.
*Compounding factor:* `useEffect` at `ImmersiveMapViewport.tsx:204-208` already auto-closes all three when `isGuidanceMode` flips false. So the state is double-fragile (mode change + tree swap).

**D4 — MapLibre instance recreation cost.**
*Trigger:* every immersive ↔ hybrid transition.
*Observed behavior:* both trees mount their own `MapLibreShopDirectoryMapPane` (immersive via `ImmersiveMapViewport`; hybrid via `ShopDirectoryHybridMapSection`). Each transition destroys one instance and creates another.
*Impact:* one-time Map() constructor + style load + source/layer setup on each transition. Tiles benefit from browser HTTP cache; vector layer state (clustering progress, animation timing, popup state) does not. Per relay #15 #7's "framer-motion instability is secondary to mount sequencing" — this is the mount-sequencing concern manifested at the map layer.
*Mitigating factor:* viewport-bounds + camera are restored from session state, so the visual end-state matches. The user would notice this as a brief flicker / re-load shimmer rather than a wrong-camera glitch.

### 4.2 Pattern B drift — Coverage Map Dialog

**D5 — Arrival-toast deduplication ref reset.**
*Trigger:* user reaches arrival in CoverageMapDialog, dialog auto-transitions back to browse via the 2800ms timeout (`CoverageMapDialog.tsx:180-191`), but parent re-opens dialog within the same `selectedShop` / `routePreview.fetchedAt` combination.
*Observed behavior:* `lastArrivalToastKeyRef.current` is `null` on the new mount → arrival toast fires again with the same arrival.
*Impact:* low (requires user to actually reopen with stale arrival state). Worth flagging because the dedupe pattern depends on instance-level ref persistence which the unmount breaks.

**D6 — `lastHandledStartRequestId` reset combined with stable `startNavigationRequestId`.**
*Trigger:* parent issues `startNavigationRequestId=N`, dialog opens, transitions to navigating, dialog closes, parent re-opens dialog while still passing `startNavigationRequestId=N`.
*Observed behavior:* `lastHandledStartRequestId` resets to 0 → the gate at `CoverageMapDialog.tsx:126-128` (`if (startNavigationRequestId <= lastHandledStartRequestId) return;`) re-fires the navigation start.
*Impact:* depends on parent contract. If parent always increments the request id when it wants a new start and never re-passes a stale one on a fresh open, no harm. Worth noting that the gate is one-sided — it only protects against re-fires within a single mount, not across mount cycles.

**D7 — Map instance recreation on dialog open/close.**
*Trigger:* every open → close → open of CoverageMapDialog.
*Observed behavior:* the embedded `ServiceCoverageMap` instance is destroyed and recreated. Same MapLibre re-mount cost as D4.

### 4.3 Cross-pattern drift

**D8 — No browser Fullscreen API integration anywhere.**
*Observation:* the term "fullscreen" in the codebase refers exclusively to React-tree CSS positioning. `document.fullscreenElement`, `requestFullscreen`, `exitFullscreen`, and the `fullscreenchange` event are NOT used.
*Implication:* on mobile (especially iOS Safari), the URL bar / tab strip / status bar remain visible during "immersive" mode. The visual safe-area is the reduced viewport, which the immersive layout handles via `100dvh` etc. There is no fallback path for OS-level fullscreen.
*This is by design* per `MAP_SHELL §3.5` (the doc describes immersive as a CSS positioning treatment, not a browser-fullscreen claim). Documenting here for completeness.

---

## §5. Camera-handoff contract (formalized from observation)

Across both lifecycle patterns the same handoff contract is in effect:

### 5.1 Storage layer

The map's ephemeral camera state is reflected up to a parent state store (`useShopDirectorySession` for Pattern A; the `HeroSection`-and-above state machine for Pattern B). The map controls itself for the duration of its instance life; on every viewport change the parent receives a callback (`onViewportChange` for Pattern A's `ShopDirectoryMapPane`; `onCenterChange` / `onZoomChange` family for Pattern B).

### 5.2 Restoration layer

On re-mount, the same parent state is re-injected via `initialCenter` / `initialZoom` props. The MapLibre engine treats these as **initial** (constructor-time only), not controlled — this is the engine 2 "preview owns no camera" or equivalent stance from `REF_MAP_RENDERER_INVENTORY §4.3`.

### 5.3 Default-fallback layer

If no center/zoom is in session state on first ever entry, defaults are injected at the boundary:
- Pattern A: `getDefaultCenter()` returns `{ latitude: 40.7128, longitude: -74.006 }` (NYC) at `ImmersiveMapViewport.tsx:113`, and `mapZoom` falls back to `9` at `ShopDirectoryScreen.tsx:171`.
- Pattern B: provided by the parent.

### 5.4 Preserved invariants

- **Camera state is never lost across a single fullscreen toggle** within a screen lifetime (the session hook outlives the toggle).
- **Camera state IS lost on full screen-route teardown** (e.g. logging out, navigating to a different top-level screen that destroys `useShopDirectorySession`). Out of scope for this audit.

---

## §6. Connections + contributions

### 6.1 To prior audit lane findings

The drift surfaces in §4 directly instantiate relay #15 #7's abstract observation:

> *"semantic authority can commit before visual continuity, orchestration layers are partially decoupled, continuity failures can localize."*

Specifically:
- **Semantic state** (camera, selection, navigation session) commits to session-level hooks → survives.
- **Visual/UI state** (drawer, sheets, tile mode override) commits to local component state → does not survive.
- **Localization** of failure: a tile-mode override loss does NOT cascade into camera loss; a drawer reset does NOT teardown navigation.

This pattern is healthy preservation discipline at the architecture level. The drifts are not bugs in the orchestration — they are the consequence of the deliberate scope-of-state choice. Whether a given drift is acceptable is a UX decision per surface (see §6.2).

### 6.2 Owner-decision-bound items surfaced

This audit does NOT propose remediation. The following observations may or may not warrant action — owner-decision territory:

1. **D1 (tile-mode override loss):** acceptable default-reset, or should `tileModeOverride` lift to session state?
2. **D3 (navigation-side-sheet loss):** during active navigation specifically, should sheet open-state lift to a navigation-scoped store so that an accidental mode toggle does not collapse the user's reading context?
3. **D4 / D7 (MapLibre recreation):** is the brief instance-recreation flicker acceptable? An alternative (CSS-visibility toggle vs unmount, or shared map instance via a portal) increases orchestration depth and is explicitly discouraged by relay #15.
4. **D6 (CoverageMapDialog start-nav re-fire across mount):** is the parent's contract documented somewhere that it will not re-pass a stale `startNavigationRequestId` after close? If not, the gate is theoretically vulnerable.

These are filed as drift observations only. **Pass 289 introduces ZERO new owner-decision points to the cumulative count of 31** (since each item above is conditional on the owner first deciding the drift is undesirable; the audit itself does not assert preference).

### 6.3 To existing map-domain docs

| Existing doc | Pass 289 relationship |
|---|---|
| `REF_MAP_SHELL_HIERARCHY §3.5` (immersive mode) | Static contract rule. Pass 289 adds dynamic-lifecycle counterpart. |
| `REF_MAP_SHELL_HIERARCHY §3.3` (back-button + dismissal) | Pattern A's three exit paths confirm the doc's dismissal taxonomy. |
| `REF_MAP_RENDERER_INVENTORY §4.3` (camera authority models) | Pass 289 §5 extends this with cross-mount lifecycle behavior. |
| `REF_MAP_UX_COHESION_AUDIT §6` (panel/map focus coordination) | Drift D2/D3 are concrete instances of the focus-coordination concern. |
| `REF_MAP_MOTION_CONTRACT §6` (camera restoration) | Pass 289 §5.2 corroborates initial-only camera prop semantics. |

No conflicts with existing docs surfaced. No corrections required.

### 6.4 To Pass 285 harness spec

Pass 285's six invariant categories do NOT yet include a fullscreen-lifecycle invariant. Pass 289 surfaces a candidate:

> **Candidate Phase 2 invariant:** after `setMapViewMode("map")` → `setMapViewMode("hybrid")` → `setMapViewMode("map")` cycle within the same screen mount, the (a) camera, (b) selected shop, (c) navigation session status, and (d) live route preview are byte-identical to their pre-cycle values.

This is testable as a Phase 2 (Playwright / DOM snapshot) test per Pass 285 §4.2's phasing. Pass 289 does NOT propose adding it — only flags it as a candidate for future authorized harness extension work.

---

## §7. Pass 281 invariants check

Pass 281 §11 invariants — none touched by Pass 289 (read-only audit doc).

| Invariant | Status |
|---|---|
| 4-layer provider mount order | UNTOUCHED |
| AppWithToast subcomponent boundary | UNTOUCHED |
| First-import-line resize-patch | UNTOUCHED |
| Light-vs-dark contrast LAW palette | UNTOUCHED |
| Reduced-motion guards (35/35 per Pass 284) | UNTOUCHED |
| Two intentional `:root` blocks | UNTOUCHED |
| Pass 282 cadence/easing tokenization | UNTOUCHED |
| Pass 283 blur tokenization | UNTOUCHED |
| Pass 286 Clerk wrapper inflation | UNTOUCHED |
| Pass 287 provider-mount-order test | UNTOUCHED |
| Pass 288 persistence-namespace test | UNTOUCHED |

Pass 281 §12 anti-patterns: ZERO violations.

Relay #15 prohibitions check: ZERO violations. No new provider nesting, no orchestration wrappers, no hydration gates, no suspense layers, no generalized lifecycle managers introduced. (This pass introduces no source code at all.)

---

## §8. What this pass does NOT do

- No source modification (audit-only)
- No LAW edit
- No CLAUDE.md / MOLANDJESUS edit
- No proposal to fix any drift surface (all D1-D8 are observations only)
- No modification of Pass 285 harness spec (candidate Phase 2 invariant noted in §6.4 is documented here for future-pass discoverability, not added to the spec doc)
- No proposed change to camera-handoff contract (§5 documents existing behavior)
- No new test files
- No browser Fullscreen API recommendation
- No remediation roadmap
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §9. Forward triggers

Future authorized passes may build on Pass 289's findings via:

1. **Owner authorizes drift remediation for D1 / D3:** lift specific local UI state to session or navigation scope. Estimated cost: <50 lines per drift; preservation-governed (no orchestration depth added).
2. **Owner authorizes Phase 2 harness extension:** implement the candidate fullscreen-cycle invariant from §6.4 as a Playwright test once Phase 2 framework is greenlit per Pass 285.
3. **Owner authorizes parent-contract documentation for D6:** add a `REF_*` note formalizing the `startNavigationRequestId` invariant, OR update CoverageMapDialog's dedupe gate to cross-mount-safe.
4. **Map subsystem audit continuation:** Pass 290+ candidates from relay #16's untouched list — overlay synchronization, spatial density / dead-space, cross-tab continuity, responsiveness failures.

---

## §10. Status

REF doc shipped Pass 289. Audit-only — preserves all existing doctrine. Subsequent map-audit passes can extend coverage to remaining relay #16 items.

**End of doc.**
