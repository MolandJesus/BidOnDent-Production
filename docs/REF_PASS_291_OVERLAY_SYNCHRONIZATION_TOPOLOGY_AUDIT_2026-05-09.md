# REF — Map Overlay Synchronization Topology Audit (Pass 291, 2026-05-09)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-09 #17 (ChatGPT Priority 1: overlay synchronization topology).
**Tier:** REF (current truth — derived from source as of commit `fac621dd`).
**Source modification:** ZERO. Pure read-only audit.
**Companion to:** [`REF_MAP_SHELL_HIERARCHY_2026-05-09.md`](REF_MAP_SHELL_HIERARCHY_2026-05-09.md) §3.1 (conceptual 5-layer model — this doc adds the numeric-z-axis instantiation), [`REF_PASS_289_FULLSCREEN_LIFECYCLE_CONTINUITY_AUDIT_2026-05-09.md`](REF_PASS_289_FULLSCREEN_LIFECYCLE_CONTINUITY_AUDIT_2026-05-09.md) (within-tab lifecycle), [`REF_PASS_290_CROSS_TAB_MAP_CONTINUITY_AUDIT_2026-05-09.md`](REF_PASS_290_CROSS_TAB_MAP_CONTINUITY_AUDIT_2026-05-09.md) (cross-tab).

---

## §1. Premise & scope

ChatGPT relay #17 named overlay synchronization topology as Priority 1 — *"likely where orchestration-layer coupling becomes most visible."* Specifically called out:
- toast-map synchronization
- overlay z-axis authority
- panel-map focus choreography
- guidance overlays
- modal overlap sequencing
- navigation interruption behavior
- atmospheric overlay continuity
- gesture-precedence ownership

This pass interrogates: **what is the actual numeric z-axis stack, who lives at each level, what synchronization (or lack of it) exists across overlay sites, and what gesture/focus contracts hold them together?**

`REF_MAP_SHELL_HIERARCHY §3.1` provides a conceptual 5-layer model. This pass instantiates that model with the actual numeric values and identifies the gaps between conceptual canon and on-the-ground implementation.

---

## §2. Numeric z-axis canon (derived from source)

Distinct numeric z-index values found in production source (excluding tests):

| Numeric range | Layer | Owner sites |
|---|---|---|
| `z-[1]` – `z-[2]` | Map atmospheric / vignette layers (within-map decoration) | `ShopDirectoryImmersiveMap.tsx` (night/satellite ambient glow), `MapLibreServiceCoverageMap.tsx` (atmospheric inset) |
| `z-10` – `z-50` | Within-component element stacking (Tailwind defaults) | various, low-impact |
| `z-[60]` | Immersive container (full-viewport React tree) | `ShopDirectoryImmersiveMap.tsx:128` `fixed inset-0 z-[60]`; `MapBidSheet.tsx` `fixed inset-0 z-[60]` |
| `z-[205]` – `z-[260]` | Map liquid-gold-flow + atmospheric depth layers | `MapLibreServiceCoverageMap.tsx` (z-[248], z-[249], z-[250]) |
| `z-[400]` | Map surface status bar | `MapSurfaceStatusBar.tsx:?` `pointer-events-none absolute inset-x-0 bottom-0 z-[400]` |
| `z-[430]` | Map navigation HUD | `MapNavigationHud.tsx` |
| `z-[450]` – `z-[490]` | Map pane atmosphere overlays | `MapPaneAtmosphereOverlays.tsx` z-[490] |
| `z-[500]` – `z-[510]` | Map top action bar | `MapLibreServiceCoverageMap.tsx` z-[500] |
| `z-[520]` – `z-[565]` | Navigation in-flight cards (maneuver, voice, action rail) | `NavigationActiveManeuverCard.tsx` z-[560], `NavigationVoiceControlsSheet.tsx` z-[565] |
| `z-[570]` – `z-[580]` | Map UI controls (recenter, layer picker, etc.) | various |
| `z-[600]` – `z-[620]` | Map surface controls + bottom info pills | `MapLibreServiceCoverageMap.tsx` z-[620], `MobileMapBottomSheet.tsx` z-[610] |
| `z-[700]` – `z-[701]` | Sheet / Dialog modal layer | `dialog.tsx` z-[700] (close button), `ShopDetailSheet.tsx` z-[700] (overlay) + z-[701] (panel) |
| `z-[9999]` | System / toast / service-worker update banner | `NotificationToast.tsx:55` `z-[9999]`; `App.tsx:536` PWA update prompt z-[9999] |

**Conceptual ↔ numeric crosswalk** (Pass 291's contribution to `REF_MAP_SHELL_HIERARCHY §3.1`):

| Conceptual layer | Numeric range |
|---|---|
| 1. System layer | `z-[9999]` |
| 2. Modal layer | `z-[700]` – `z-[701]` |
| 3. Sheet layer | `z-[600]` – `z-[620]` |
| 4. Overlay controls layer | `z-[400]` – `z-[580]` |
| 5. Map canvas layer | `z-[1]` – `z-[260]` |

**Findings:**
- Numeric ranges have intentional GAPS between conceptual layers (60→205→400→700→9999). Gaps allow insertion without re-numbering.
- The conceptual canon does NOT document the numeric values. A reader of `REF_MAP_SHELL_HIERARCHY §3.1` cannot, from that doc alone, determine that "the sheet layer lives at z-[600-620]." Pass 291 fills this gap.
- The 9999 → 701 jump is large and intentional — the system layer is decisively above the modal layer.

---

## §3. Toast / system layer (single-slot replacement semantics)

**Mount site:** [`App.tsx:528-534`](../src/app/App.tsx#L528) — `<NotificationToast>` rendered as a sibling of `<AppContent>` inside `NotificationProvider`. Always mounted (always in the React tree); renders `null` if no active toast.

**State source:** [`useNotificationEvents.ts:62`](../src/app/features/notifications/useNotificationEvents.ts#L62) — `activeToast: NotificationToast | null` is a single useState slot. There is NO queue.

**Replacement behavior:** `setActiveToast(newToast)` overwrites the previous toast immediately. If toast A has 5 seconds remaining and toast B is pushed, B replaces A — A's remaining duration is lost, A's content is gone.

**Deduplication:** [`useNotificationEvents.ts:73-78`](../src/app/features/notifications/useNotificationEvents.ts#L73) — `recentPushKeys` ref tracks `${title}::${body}` for a 3-second window. Duplicate pushes within the window are silently dropped.

**Synchronization characteristics:**
- **Toast-vs-toast:** replacement (no queue, no stack). Last writer wins.
- **Toast-vs-map:** non-blocking. Toast at z-[9999] overlaps map area but does NOT prevent map gestures (map intercepts everywhere except the small top-right toast rectangle).
- **Toast-vs-sheet:** toast at z-[9999] overlaps any open sheet (z-[700-701]). Sheets do NOT receive a "toast is up" signal. The toast covers a small portion of the sheet.
- **Toast-vs-dialog:** same — toast above any dialog. Dialog cannot detect toast presence.

**Continuity surface S1:** the **single-slot, replacement** policy is a deliberate choice but creates a fragility — during active navigation, multiple legitimate toast events (arrival + reroute + speed warning) within seconds will overwrite each other. Users may see only the most recent. Owner-decision territory: queue/stack, or accept replacement?

---

## §4. Map UI overlay layer (pointer-events-none + auto pattern)

**Identified pattern:** 42 sites in `src/app/components` use `pointer-events-none` together with a numeric z-index. This is the **gesture-precedence design pattern**.

**Mechanism:**
1. The wrapping overlay element gets `pointer-events-none absolute inset-* z-[NN]` — fully transparent to gestures.
2. Specific child elements (buttons, pills, controls) explicitly opt back in via `pointer-events-auto`.
3. The map canvas at z-[1]–z-[260] receives all gestures that pass through transparent regions.

**Owner sites of `pointer-events-auto`** (10 found):
- `MapSurfaceStatusBar.tsx:97, 125, 160` — status pills
- `MapSurfaceHeaderBadges.tsx:19` — header badge row
- `MapLibreReportLayer.tsx:241, 265` — report-tier badges
- `MapSurfaceControls.tsx:34, 35` — recenter/layer controls
- `MapProgramTopBar.tsx:123, 156` — top bar action buttons

**Continuity property:** the gesture-precedence contract is **strictly local** — each overlay decides for itself whether to intercept gestures. There is no global "modal mode" flag or focus-trap registry. The map continues to receive gestures unless a specific element claims them.

**Continuity surface S2:** this design produces **gesture transparency by default** — a healthy invariant for map-first surfaces (the user's spatial intent is rarely interrupted). But it also means the map can receive a gesture that the user intended for an overlapping non-`pointer-events-auto` element they thought was interactive. Visual presence ≠ interactive presence.

---

## §5. Guidance overlay synchronization (DRIFT FOUND)

**Critical finding:** the same conceptual overlay (`renderGuidanceOverlay`) is **DUPLICATED** at two sites with different positioning:

**Site A — Immersive:** [`ShopDirectoryScreen.tsx:110-118`](../src/app/components/shop/ShopDirectoryScreen.tsx#L110)
```
const renderGuidanceOverlay = (containerClassName: string) =>
  nav.liveNavigationActive && nav.routePreview ? (
    <NavigationActiveManeuverCard
      containerClassName={containerClassName}
      followingStep={nav.followingStep}
      nextStep={nav.nextStep}
      tone={session.resolvedMapTheme}
    />
  ) : null;

// usage at line 165:
guidanceOverlay={renderGuidanceOverlay("top-20 sm:top-24")}
```

**Site B — Hybrid:** [`ShopDirectoryHybridMapSection.tsx:100-107`](../src/app/components/shop/ShopDirectoryHybridMapSection.tsx#L100)
```
const renderGuidanceOverlay = (containerClassName: string) =>
  nav.liveNavigationActive && nav.routePreview ? (
    <NavigationActiveManeuverCard ... />
  ) : null;

// usage at line 170:
{renderGuidanceOverlay("top-4 sm:top-5")}
```

**The function bodies are identical.** Only the position class differs:
- Immersive: `top-20 sm:top-24` (≈80–96 px below top edge)
- Hybrid: `top-4 sm:top-5` (≈16–20 px below top edge)

**Continuity surface S3 (drift):** during active navigation, when the user toggles `mapViewMode` between `"map"` and `"hybrid"` (Pass 289 Pattern A tree-swap), the guidance maneuver card **visibly jumps ~80 px down** on entering immersive (because the immersive top bar pushes it down) and ~80 px up on exiting. This is a discontinuity Pass 289 did not catch — Pass 289 verified that `nav.navigationMode` survives the toggle (state continuity), but did not measure visual continuity of the rendered card position.

**Code-duplication surface S4:** if a future change updates `NavigationActiveManeuverCard`'s prop signature or adds a new field, BOTH sites must be updated in lockstep. There is no shared abstraction. Pass 281 §11 invariants do not catch this kind of duplication.

---

## §6. Sheet / dialog z-axis layering

**Owner sites:**
- [`dialog.tsx:50`](../src/app/components/ui/dialog.tsx#L50) — Radix `DialogContent` with `z-50` (Tailwind default), but the Close button is `z-[700]` (so the close X always wins above sheet content).
- [`ShopDetailSheet.tsx`](../src/app/components/shop/ShopDetailSheet.tsx) — overlay at `z-[700]`, panel at `z-[701]`.
- [`MobileMapBottomSheet.tsx`](../src/app/components/landing/MobileMapBottomSheet.tsx) — fixed bottom sheet at `z-[610]`.
- Various `Navigation*Sheet.tsx` files — within-map sheet z-values in 500-565 range (so they're "in front of map content but below modal layer").

**Stacking behavior:** there is NO central stack manager. Each sheet/dialog manages its own open state independently (search in §1 of Pass 290's working confirmed: zero matches for `openSheet` / `isOpenStack` / `FocusTrap` / similar primitives).

**Continuity surface S5 (no overlap orchestration):** if two unrelated sheets open at once (e.g. a `NavigationSettingsSheet` triggered programmatically while `ShopDetailSheet` is already open), the higher-numbered z wins visually but neither knows about the other. Focus trap (Radix-provided in `dialog`) operates per-component — Radix's focus-scope manages its own siblings, but a non-Radix sheet sibling escapes that scope.

**Existing mitigation (Radix):** Radix Dialog and Sheet primitives include focus-trap + body-scroll-lock by default. So Radix-based dialogs ARE coordinated with each other (Radix uses internal `focus-scope` references). The risk is at the **non-Radix sheet** boundary (e.g. `MapBidSheet`, navigation sheets).

---

## §7. Atmospheric overlay continuity

**Owner site:** [`MapPaneAtmosphereOverlays.tsx`](../src/app/components/shop/MapPaneAtmosphereOverlays.tsx) at `z-[490]` — atmospheric overlay layer that sits between map controls (z-[400]) and navigation cards (z-[520+]).

**Within-tab lifecycle:** the atmosphere overlay is a child of each map pane component. It mounts/unmounts with the pane. Consistent with the Pass 289 Pattern A tree-swap behavior — atmosphere is recreated on every immersive↔hybrid toggle.

**Cross-tab lifecycle:** atmospheric state is purely visual / class-driven, not persisted. Cross-tab divergence is N/A (each tab independently computes atmosphere from theme + viewport state).

**Continuity surface S6:** the night-mode ambient glow (`ShopDirectoryImmersiveMap.tsx:138-152` — radial-gradient + blur layers at z-[1]) and the atmosphere overlay at z-[490] are both **theme-derived but rendered at different z-strata** by different components. There is no central "atmosphere coordinator" — each layer renders its own atmospheric contribution based on local props. This is consistent with the codebase's broader "no orchestration depth" stance (relay #15 prohibition) but means atmosphere fragmentation across z is implicit, not declared.

---

## §8. Gesture-precedence ownership pattern (formalized)

Synthesized from §4 + §5 + §6 observations:

**The codebase implements gesture precedence via a 3-tier transparency contract:**

1. **Default transparent** (`pointer-events-none`): wrapping overlay regions at z-[400-600] are invisible to gestures.
2. **Explicit opt-in** (`pointer-events-auto`): specific interactive children claim gestures back.
3. **Modal claim** (Radix dialog/sheet primitives): full overlay + body-scroll-lock + focus-trap when invoked.

**Implication:** map gestures are the **default winner** for any region not explicitly claimed. This is appropriate for a map-first product but creates the §4 S2 risk (visual presence ≠ interactive presence) — a non-`pointer-events-auto` overlay element that LOOKS interactive will receive nothing; the map below it gets the click.

**This pattern is currently undocumented in LAW or REF.** It is a stable emergent practice, not a codified rule. Owner-decision territory: should this pattern be formalized as a `REF_GESTURE_PRECEDENCE_CONTRACT.md` doc?

---

## §9. Connections + contributions

### 9.1 To `REF_MAP_SHELL_HIERARCHY §3.1`

The conceptual 5-layer model gains a numeric instantiation in §2's crosswalk table. Future authoring should keep both consistent.

### 9.2 To Pass 289 fullscreen-lifecycle audit

Pass 291 §5 surfaces a **new drift class** Pass 289 did not catch:
- Pass 289 D-series tracked **state** lifecycle (drawer/sheet open-state lost on tree-swap).
- Pass 291 S3 tracks **visual position** lifecycle (guidance card jumps ~80px on tree-swap).

These are independent failure modes on the same transition. The 2D continuity matrix from Pass 290 §5.2 should expand to include a "visual position" column for guidance overlays.

### 9.3 To Pass 290 cross-tab audit

Toast deduplication (`recentPushKeys` ref, 3-second window) is purely **per-tab**. Two tabs receiving the same notification trigger (e.g. via re-fetched session data) would both show the toast. Compounds with Pass 290 X1 (stale-navigation-session window) — focus-rehydrate could cause Tab B to push a navigation toast that Tab A already showed.

### 9.4 To relay #15 #7 semantic-vs-visual decoupling

Pass 291 strengthens the relay's observation: **visual state lives even shallower than within-tab fullscreen lifecycle would suggest.** The `renderGuidanceOverlay` duplication shows that visual continuity is not just disposable — it is **fragmented across mount sites** with no shared abstraction. This is the most extreme form of the decoupling pattern.

### 9.5 To Pass 285 harness spec

Two candidate invariants from Pass 291:
- **Phase 1 candidate:** snapshot test verifying that all `z-[NN]` literal occurrences fall within documented numeric ranges from §2.
- **Phase 2 candidate (Playwright):** during `mapViewMode` toggle with `liveNavigationActive=true`, the rendered position of `NavigationActiveManeuverCard` does not jump beyond a small threshold (or, if it must jump, the jump is animated through reduce-motion-respecting transitions).

NOT added to Pass 285 spec doc — only documented for future discoverability.

### 9.6 To the discovery-quality convergence hotspot (Pass 288 + Pass 290)

Pass 291 surfaces ZERO new convergence on `placeDiscoveryQuality.ts:51`. The hotspot remains the namespace-drift + cross-tab-race intersection — overlay topology does not touch it. Per relay #17: continue treating that surface carefully (do NOT fix yet — first understand why it attracts governance tension).

---

## §10. Owner-decision-bound items surfaced

This audit does NOT propose remediation. The following observations may or may not warrant action:

1. **S1 (single-slot toast replacement):** acceptable, or should toasts queue/stack during high-frequency events?
2. **S3 (guidance card position jump on tree-swap):** acceptable visual jump, or should the position be stabilized cross-mode?
3. **S4 (`renderGuidanceOverlay` duplication):** factor into a shared utility (low cost, increases reuse), or accept per-mount-site definitions?
4. **S5 (no central sheet-overlap orchestration):** rely on Radix scoping for Radix-based overlays + accept manual coordination for non-Radix, or introduce a central registry (would add orchestration depth — relay #15 prohibition would need owner override)?
5. **§2 numeric-canon documentation:** add the numeric crosswalk to `REF_MAP_SHELL_HIERARCHY §3.1` directly, or leave Pass 291 as the cross-reference?
6. **§8 gesture-precedence formalization:** create `REF_GESTURE_PRECEDENCE_CONTRACT.md`, or accept the emergent stable practice?

**Pass 291 introduces ZERO new owner-decision points to the cumulative count of 31** (each item is conditional on owner first deciding the drift/asymmetry is undesirable).

---

## §11. Pass 281 invariants check

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
| Pass 289 fullscreen-lifecycle observations | UNTOUCHED (extended) |
| Pass 290 cross-tab observations | UNTOUCHED (extended) |

Pass 281 §12 anti-patterns: ZERO violations.
Relay #15 prohibitions: ZERO violations.
Relay #17 prohibitions (no orchestration inflation, no lifecycle-manager insertion, no generalized sync, no provider mutation, no abstraction rewrites): ZERO violations.

---

## §12. What this pass does NOT do

- No source modification (audit-only)
- No LAW edit
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit (numeric crosswalk in §2 lives here, not pushed up)
- No proposal to fix any S-series observation (S1-S6 are observation only)
- No modification of Pass 285 harness spec
- No new test files
- No proposed central sheet/overlay coordinator (would add orchestration depth — explicit relay #17 prohibition)
- No modification of any pre-existing dirty file in working tree
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #17: continue treating the convergence hotspot carefully)
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §13. Forward triggers

1. Owner authorizes adding the §2 numeric crosswalk into `REF_MAP_SHELL_HIERARCHY §3.1`.
2. Owner authorizes S3 stabilization (guidance card position) — preservation-governed, ~5 lines.
3. Owner authorizes S4 deduplication (extract `renderGuidanceOverlay`) — preservation-governed, ~30 lines.
4. Owner authorizes Phase 1 z-axis canon test (snapshot all `z-[NN]` against §2 ranges).
5. Owner authorizes `REF_GESTURE_PRECEDENCE_CONTRACT.md` per §8.
6. Pass 292+ continues remaining relay #17 list: spatial density / dead-zone, responsiveness (read-only).

---

## §14. Status

REF doc shipped Pass 291. Audit-only — preserves all existing doctrine. The audit lane (Pass 289 + 290 + 291) now covers within-tab lifecycle, across-tab continuity, and within-frame overlay topology — three orthogonal axes of map continuity.

**End of doc.**
