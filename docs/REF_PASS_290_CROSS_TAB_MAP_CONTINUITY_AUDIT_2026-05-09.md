# REF — Cross-Tab Map Continuity Audit (Pass 290, 2026-05-09)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-09 #16 (NEW chat handoff; ChatGPT priority #1: continue deep Map Continuity + Spatial UX Audit).
**Tier:** REF (current truth — derived purely from source as of commit `c7adf662`).
**Source modification:** ZERO. Pure read-only audit.
**Companion to:** [`REF_PASS_289_FULLSCREEN_LIFECYCLE_CONTINUITY_AUDIT_2026-05-09.md`](REF_PASS_289_FULLSCREEN_LIFECYCLE_CONTINUITY_AUDIT_2026-05-09.md) (within-tab fullscreen lifecycle); [`REF_PASS_288_PERSISTENCE_NAMESPACE_TEST_2026-05-09.md`](REF_PASS_288_PERSISTENCE_NAMESPACE_TEST_2026-05-09.md) (persistence-namespace catalogue).

---

## §1. Premise & scope

ChatGPT relay #16 named "cross-tab map continuity" as part of the highest-density continuity surface still requiring deep audit. This pass interrogates one question:

**When the same user has two or more tabs of BidOnDent open simultaneously, what map-relevant state is shared, what is fragmented, and where do races / drifts occur?**

Approach: trace every cross-tab signaling primitive in source, map each persistence key to its sync behavior, identify the consequences. Pure observation — no remediation proposed.

---

## §2. Cross-tab signaling primitive inventory

The browser exposes four mechanisms that can carry signals between same-origin tabs:

1. **`storage` event** — fires on every other tab when `localStorage.setItem/removeItem/clear` runs in any tab. Does NOT fire in the originating tab.
2. **`BroadcastChannel`** — explicit pub/sub between tabs.
3. **Service Worker / SharedWorker postMessage** — bidirectional, requires worker registration.
4. **Polling localStorage on focus / visibility events** — passive re-read, not a true signal.

BidOnDent's actual usage:

| Mechanism | Used? | Files |
|---|---|---|
| `storage` event listener | ✅ ONE site | [`useAppearanceMode.ts:64`](../src/app/hooks/useAppearanceMode.ts#L64) |
| `BroadcastChannel` | ❌ NEVER | (zero matches in `src/`) |
| ServiceWorker / SharedWorker postMessage | ❌ NEVER (no map-related SW) | — |
| Focus/visibility re-read | ✅ THREE sites | [`useNavigationLaunch.ts:41`](../src/app/hooks/useNavigationLaunch.ts#L41), [`DashboardCoveragePanel.tsx:118`](../src/app/components/dashboard/DashboardCoveragePanel.tsx#L118), [`useUserGeolocation.ts:208-209`](../src/app/hooks/useUserGeolocation.ts#L208) |

**Headline finding:** the codebase has exactly ONE genuine cross-tab sync (`storage` event for appearance mode). All other cross-tab consistency relies on the passive focus-rehydrate pattern. There is no explicit publish channel for map-domain state.

---

## §3. Per-persistence-key cross-tab survival matrix

Keys identified during Pass 288's persistence-namespace audit, classified for cross-tab behavior. For each key: who reads it, who writes it, who subscribes to changes, and the cross-tab consequence.

### 3.1 localStorage keys (shared across tabs in same origin)

| Key | Owner module | Read on focus? | `storage` event listener? | Cross-tab consequence |
|---|---|---|---|---|
| `bidondent.appearance-mode` | [`useAppearanceMode.ts:4`](../src/app/hooks/useAppearanceMode.ts#L4) | No | ✅ YES — explicit | Tab A flips to map-dark → Tab B's `useAppearanceMode` receives storage event → Tab B re-reads and updates immediately. **Cleanest cross-tab pattern in the codebase.** |
| `bidondent_navigation_session` | [`navigationSession.ts:4`](../src/app/services/navigation/navigationSession.ts#L4) | ✅ YES (focus-only) | ❌ NO | Tab A starts external (Apple/Google/Waze) navigation → writes session → Tab B does NOT update until B receives a `focus` event (i.e. user clicks into B). When B focuses, B's `useNavigationLaunch` line 38 calls `loadNavigationSession()` and re-renders. **DRIFT WINDOW:** Tab B can render stale "no active navigation" while Tab A actually has one running. |
| `bidondent_coverage_state` | [`coverageState.ts:12`](../src/app/components/landing/coverageState.ts#L12) | NO read-on-focus | ❌ NO | Tab A pans coverage map / changes radius → writes whole `SavedCoverageState` blob (including `mapView.center / zoom / revision`). Tab B never re-reads until full reload. **Per-tab fragmentation** — coverage maps in two tabs diverge silently. |
| `bidondent.discovery-quality-snapshot-v1` (a.k.a. the hyphen-namespace drift) | [`placeDiscoveryQuality.ts:51`](../src/app/services/navigation/placeDiscoveryQuality.ts#L51) | NO | ❌ NO | Last-write-wins across tabs. Quality snapshot can be silently overwritten by either tab's writes. (Cross-tab dimension was NOT considered when this key was added — relevant to Pass 274 §3.4 RISK 2 owner-decision.) |
| `LEGEND_EXPANDED_STORAGE_KEY` (legend panel state) | [`MapPaneLegendPanel.tsx`](../src/app/components/shop/MapPaneLegendPanel.tsx) | NO | ❌ NO | UI preference fragments per-tab. Low impact. |
| Recent-navigation-locations | [`savedLocations.ts`](../src/app/services/navigation/savedLocations.ts) (read via `markRecentNavigationLocation`) | NO | ❌ NO | Last-write-wins. Acceptable since this is a list-append pattern; collisions just mean ordering interleaves arbitrarily. |
| Report draft | [`reportDraftStorage.ts`](../src/app/components/codelayer/report/reportDraftStorage.ts) | NO | ❌ NO | Not map-domain — out of scope for this audit but worth flagging for Pass 290+ extensions. |
| Various `bd-*` keys | Various | NO | ❌ NO | Per-tab fragmentation. |

### 3.2 sessionStorage keys (per-tab — never shared)

| Key | Owner | Cross-tab behavior |
|---|---|---|
| `bd-user-geolocation` | [`useUserGeolocation.ts:17`](../src/app/hooks/useUserGeolocation.ts#L17) | **Per-tab cache by design.** Each tab independently caches `getCurrentPosition` for 10 minutes. Two tabs = two `getCurrentPosition` requests = two `permissions.query` calls. Browser-level permission state is shared (same origin), but the cache is not. |
| `coverageCurrentLocation` (Pass 274 §3.2 RISK 1 — un-namespaced) | (per Pass 274 catalogue) | Per-tab. |
| Website-identity session id (`storageKey` in `websiteIdentity.ts:136`) | [`websiteIdentity.ts:136-154`](../src/app/services/auth/websiteIdentity.ts#L136) | Per-tab. **By design** — each tab is treated as a distinct analytics session. |

### 3.3 React-state-only (no persistence — fully per-tab)

These are **never** shared across tabs because they don't touch storage at all:

- `mapCenter`, `mapZoom`, `mapViewportBounds` in `useShopDirectorySession` (each tab has its own pan/zoom)
- `mapViewMode` (immersive/hybrid/list selector — each tab independently)
- `selectedShopId`, `selectedRouteId`, `selectedOrigin` in `useShopDirectorySession`
- All immersive-only local UI state (Pass 289 §3.1 D1-D3)
- Navigation route preview, GPS tracking state, voice settings (in-memory in `useNavigationSession`)

This is a deliberate design — the SHOP DIRECTORY map is a single-tab spatial workspace; the COVERAGE map persists more state because it's the public-facing landing surface.

**Asymmetry:** Coverage map persists camera (`mapView.center / zoom / revision` inside `bidondent_coverage_state`); Shop Directory map does NOT. So a refresh of `/coverage` restores camera; a refresh of `/shop-directory` resets to NYC default (per Pass 289 §5.3). This is documented behavior, not a bug.

---

## §4. Identified cross-tab continuity surfaces

Each entry below is a cross-tab observation. As with Pass 289, these are **observations**, not proposed remediations.

### 4.1 X1 — Stale-navigation-session window in unfocused tab

*Trigger:* user opens BidOnDent in Tab A and Tab B. In Tab A, presses "Open in Apple Maps" / "Open in Google Maps" → external navigation session written to `bidondent_navigation_session`. Tab B remains unfocused.

*Observed behavior:* `useNavigationLaunch.ts:36-43` only re-reads the session on `window` focus event. While Tab B is unfocused, its in-memory `navigationSession` state is whatever it was when B last focused (often `null`). Any UI that branches on `navigationSession` (e.g. "Resume navigation" button, status pills) will render stale.

*Resolution path:* user must click into Tab B → focus event fires → re-read happens.

*Not observed (but possible):* if the browser supports background tabs running JS (which they do), and Tab B has a timer / interval that reads `navigationSession`, that consumer would see the stale value. Not currently an issue because the only consumers are React render paths gated on the focus-rehydrated state.

### 4.2 X2 — Coverage-map full divergence between tabs

*Trigger:* user opens `/coverage` in Tab A and Tab B. In Tab A, pans the map, changes radius from 10 to 25 miles, selects a shop. Tab B was loaded earlier with different settings.

*Observed behavior:* both tabs continue to render their own state. Neither writes triggers a re-read in the other. Tab A's pan writes the new `mapView.center / zoom / revision` to `bidondent_coverage_state` (via the persist effect `useCoveragePersistEffect`); Tab B's next pan overwrites that. Last-write-wins. Reload of either tab pulls the LATEST written state, which may be from the other tab.

*Net effect:* in-memory state diverges per-tab; persisted state is volatile and reflects whichever tab wrote last.

*Drift surface:* a refresh of Tab B at any moment may surface state Tab A wrote — users may perceive this as "lost work" or "ghost interactions." Particularly noticeable for `selectedShopId` and `radiusMiles`.

### 4.3 X3 — Discovery-quality-snapshot last-write-wins

*Trigger:* both tabs are running navigation sessions (or have navigation history that contributes to the discovery-quality model). Each writes to `bidondent-navigation-discovery-quality-snapshot-v1`.

*Observed behavior:* no coordination. Last writer wins. Whatever metric model produced the most recent write is the model used on next read.

*Compounding factor:* this is the same key Pass 288 flagged as the 5th-namespace-convention drift (hyphen-separated rather than dot/underscore). The doctrine drift AND the cross-tab race are independent observations of the same code site.

*Owner-decision-bound interaction:* if Pass 274 §3.4 RISK 2 remediation eventually renames this key, that work could simultaneously add cross-tab coordination if the owner decides it is worth the cost.

### 4.4 X4 — Geolocation cache fragmentation

*Trigger:* user opens 3 tabs. Each calls `useUserGeolocation`, each independently invokes `getCurrentPosition`.

*Observed behavior:* 3 separate prompts (or 3 silent grants if browser permission already granted), 3 separate cache entries (each in its own tab's sessionStorage). The browser-level **permission** state is shared (origin-scoped) but the cache is not.

*Cost:* 3 GPS hits where 1 would suffice. On mobile, this is potentially a battery / location-API rate-limit concern.

*Mitigation already in place:* the 10-minute `GEO_CACHE_MAX_AGE` reduces re-querying within a tab; `permissions.query` with `granted` short-circuits the prompt. So the user doesn't see triple prompts, but the device still does triple GPS work.

*Out-of-scope (architectural):* moving the cache to localStorage would unify across tabs but is a deliberate sessionStorage choice (likely privacy: GPS coords expire when the tab closes).

### 4.5 X5 — `useUserGeolocation` permission-change cascade across tabs

*Trigger:* user has 2 tabs open. Browser-level geolocation permission changes (user grants/revokes via browser settings).

*Observed behavior:* `useUserGeolocation.ts:158-163` registers a `status.onchange` callback. Both tabs receive the change because `permissions.query` is browser-level, NOT tab-level. Both tabs will independently call `fetchPosition()` if state becomes `granted`.

*Race result:* two simultaneous `getCurrentPosition` calls. Likely not harmful (browser usually queues / coalesces), but worth noting that the permission-change event has no debounce across tabs.

### 4.6 X6 — `visibilitychange` is registered but only in geolocation hook

*Observed behavior:* `useUserGeolocation.ts:209` is the ONLY use of `document.addEventListener("visibilitychange", ...)` in the codebase (excluding tests). Navigation, appearance, coverage, etc. do NOT respond to `visibilitychange`.

*Implication:* a tab that the user just unhid (e.g. via Cmd-Tab or returning from a different application) will only refresh its geolocation. Navigation session (which has its own focus listener) will refresh slightly differently — `focus` and `visibilitychange` fire under different conditions. Tabs that are visible-but-unfocused (e.g. tile-arrangement displays, kiosks, multi-monitor splits) will not pick up either signal.

### 4.7 X7 — Map-camera state is never shared cross-tab even within Coverage path's own keys

*Observation extending X2:* Coverage map persists camera but does NOT register a `storage` event listener for `bidondent_coverage_state`. Tab A's pan does NOT update Tab B's map even though the underlying key has the data. The persistence is for **reload survival**, not **cross-tab sync**.

*This is consistent with the codebase's broader pattern:* persistence ≠ sync. Only `useAppearanceMode` makes the persistence-to-sync upgrade.

---

## §5. Connections + contributions

### 5.1 To Pass 288 (persistence namespace)

Pass 288 catalogued WHICH keys exist; Pass 290 catalogues HOW they behave across tabs. The two together fully specify the persistence contract:

- **Key naming convention** — Pass 288's 5-convention catalogue with documented allowlist
- **Cross-tab sync behavior** — Pass 290 §3 matrix above

The hyphen-namespace drift discovery in Pass 288 §critical-finding (placeDiscoveryQuality.ts:51) and the X3 cross-tab race here are **the same code site under two different audit lenses**. Owner-decision remediation for Pass 274 §3.4 RISK 2 should consider both axes simultaneously.

### 5.2 To Pass 289 (within-tab fullscreen lifecycle)

Pass 289 traced what survives a within-tab tree-swap. Pass 290 traces what survives across tabs. Together they form a 2D continuity matrix:

|  | Within-tab transition | Across-tab transition |
|---|---|---|
| Map camera (Shop Directory) | Survives (session hook) | Per-tab; never shared |
| Map camera (Coverage) | Survives (session + localStorage) | Per-tab in-memory; persisted layer last-write-wins |
| Navigation session (in-app) | Survives (screen-level hook) | NOT shared (in-memory only) |
| Navigation session (external — Apple/Google/Waze) | n/a (deep-link to OS) | localStorage with focus-rehydrate (X1 drift window) |
| Appearance mode | Survives (`useAppearanceMode` state) | Synced via `storage` event |
| Drawer / sheet open-state | Lost on tree-swap (Pass 289 D2/D3) | Always per-tab |
| Tile mode override | Lost on tree-swap (Pass 289 D1) | Per-tab; not persisted |

### 5.3 To relay #15 #7 semantic-vs-visual decoupling

The cross-tab axis is a more extreme version of #15 #7's decoupling observation:

- **Within a tab:** semantic state (camera, selection) commits to durable hooks; visual state (drawer/sheet) lives in component-local state
- **Across tabs:** even the durable hooks are tab-scoped; only the explicit-storage keys cross. And only ONE key (appearance) actually pushes notifications.

The codebase treats cross-tab as a "best effort, eventual consistency on focus" problem rather than a real-time sync problem. This is a defensible choice but is worth making explicit (it isn't documented anywhere in LAW or REF as a stance — it's a pattern that emerges from the implementations).

### 5.4 To Pass 285 harness spec

Pass 285 §3.5 covers persistence-key NAMING. It does not cover cross-tab BEHAVIOR. A candidate Phase 3 invariant:

> **Candidate Phase 3 invariant (cross-tab):** for every localStorage key, either (a) the writer documents that cross-tab divergence is acceptable and is the last-write-wins semantic, OR (b) the reader registers a `storage` event listener that re-syncs.

Implementing this as a runtime invariant is harder than Pass 285's other phase-3 candidates because it requires multi-tab orchestration (Playwright with multiple browser contexts). Pass 290 flags it for future spec extension; does NOT propose adding it.

---

## §6. Owner-decision-bound items surfaced

This audit does NOT propose remediation. The following observations may or may not warrant action — owner-decision territory:

1. **X1 (stale navigation session in unfocused tab):** acceptable, or should `useNavigationLaunch` add a `storage` event listener parallel to its focus listener?
2. **X2 (coverage-map cross-tab divergence):** acceptable per-tab fragmentation, or should panning broadcast?
3. **X3 (discovery-quality last-write-wins):** purely conditional on the broader Pass 274 §3.4 RISK 2 owner decision about that key.
4. **X4 (geolocation triple-fetch):** acceptable cost of session-scoped privacy, or should the cache lift to localStorage?
5. **X6 (visibilitychange under-registered):** is the focus-only sync model intentional, or should other consumers (navigation, appearance) also subscribe to visibilitychange?
6. **§5.3 (no documented stance on cross-tab):** should LAW or a REF doc formalize "BidOnDent treats cross-tab as eventual-on-focus consistency" as a stance?

**Pass 290 introduces ZERO new owner-decision points to the cumulative count of 31** — each item above is conditional on the owner first deciding the drift is undesirable.

---

## §7. Pass 281 invariants check

Pass 281 §11 invariants — none touched (read-only audit doc).

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
| Pass 289 fullscreen-lifecycle observations | UNTOUCHED (extended, not modified) |

Pass 281 §12 anti-patterns: ZERO violations.

Relay #15 prohibitions: ZERO violations.

---

## §8. What this pass does NOT do

- No source modification (audit-only)
- No LAW edit
- No CLAUDE.md / MOLANDJESUS edit
- No proposal to fix any cross-tab drift (X1-X7 observation only)
- No modification of Pass 285 harness spec
- No new test files
- No proposed change to the focus-rehydrate pattern
- No proposed BroadcastChannel adoption
- No modification of any pre-existing dirty file in the working tree (other AI activity preserved)
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §9. Forward triggers

Future authorized passes may build on Pass 290 via:

1. **Owner authorizes a documented cross-tab stance:** add a REF doc OR LAW clause formalizing "eventual-on-focus consistency" as the project default. Cost: <100 lines doc-only.
2. **Owner authorizes X1 remediation:** add a `storage` event listener to `useNavigationLaunch`. Cost: ~10 lines, preservation-governed.
3. **Owner authorizes X2 remediation OR acceptance:** decide whether coverage-map cross-tab divergence is okay; if not, add `storage` event listener to `useCoveragePersistEffect`. Cost: ~15 lines.
4. **Owner authorizes Phase 3 harness extension** (per §5.4): multi-tab playwright invariant.
5. **Map subsystem audit continuation:** Pass 291+ candidates from relay #16's untouched list — overlay synchronization, spatial density / dead-space, responsiveness failures.

---

## §10. Status

REF doc shipped Pass 290. Audit-only — preserves all existing doctrine. Pass 289 + 290 together cover within-tab and across-tab dimensions of the map continuity surface.

**End of doc.**
