# KI-168 — Smart Shop Map fullscreen entry: transition state inventory (read-only)

**Pass:** 192 (Audit AI parallel track) · **Date:** 2026-05-09
**Authority:** Pass E from audit-AI parallel-track menu — read-only inventory, no source edits, owner picks remediation.
**Source KI:** [docs/REF_KNOWN_ISSUES.md](../../REF_KNOWN_ISSUES.md) KI-168 (P2-LOADING, OPEN).

---

## KI-168 (verbatim)

> When entering fullscreen, transition shows: live shop card top-left + "Loading map…" spinner pill dead-center + faded ROUTE box + faded legend bar at ~15% opacity. Three layered states for ~2 seconds. Either bottom panels should not render until map hydrated, or spinner should be the only visible chrome during load.

## Surface

`MapLibreShopDirectoryMapPane` ([src/app/components/shop/MapLibreShopDirectoryMapPane.tsx](../../../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx)) — the Smart Shop Map fullscreen pane.

## Method

```bash
grep -rln "Loading map\|Loading shops\|Finding shops" src/
grep -n "mapLoad\|InlineMapStatus\|mapLoaded\|MapPaneInlineUI\|isMapLoaded\|onLoad" \
  src/app/components/shop/MapLibreShopDirectoryMapPane.tsx
grep -n "mapLoaded\|isMapLoaded\|hidden\|opacity-\|aria-hidden" \
  src/app/components/shop/ShopDirectoryMapPaneOverlays.tsx
```

Read of [MapLibreShopDirectoryMapPane.tsx:450-510](../../../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx#L450-L510) and [ShopDirectoryMapPaneInlineUI.tsx:30-90](../../../src/app/components/shop/ShopDirectoryMapPaneInlineUI.tsx#L30-L90).

---

## Finding 1 — Three concurrent overlays render during the load window

In `MapLibreShopDirectoryMapPane.tsx` JSX (return block, lines ~440-510), four sibling overlays mount at the same depth as `<Map>`. Their render gates:

| # | Overlay                  | Mount line                                                                                                              | Render gate                                                                | Visible during pre-`mapLoaded` window? |
|---|--------------------------|-------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------|----------------------------------------|
| 1 | `<Map>` itself           | [:303](../../../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx#L303)                                          | always mounted; tiles load progressively                                   | **Yes** — partially-rendered tiles    |
| 2 | `<MapLoadingSkeleton>`   | [:461](../../../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx#L461)                                          | always mounted; **internally** branches on `mapLoaded` / `mapLoadFailed`   | **Yes** — spinner + "Loading map..."   |
| 3 | `<MapTilePicker>`        | [:469](../../../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx#L469)                                          | gated only on `!isGuidanceActive && !suppressTilePicker` — NOT on `mapLoaded` | **Yes** — fully visible               |
| 4 | `<MapEmptyState>`        | [:478](../../../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx#L478)                                          | always mounted; internally checks `shopCount === 0`                       | **Yes if shopCount===0**              |
| 5 | `<MapPaneBottomOverlay>` | [:482](../../../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx#L482)                                          | gated only on `!suppressBottomCard` — NOT on `mapLoaded`                  | **Yes** — selected shop card + legend  |

Five sibling overlay surfaces, **none gated on `mapLoaded`** except (2) which renders its own contents (spinner) and (4) which has internal empty-state handling. The audit's "three layered states + faded ROUTE box + faded legend" maps cleanly to:

- spinner → `<MapLoadingSkeleton>` ([ShopDirectoryMapPaneInlineUI.tsx:40](../../../src/app/components/shop/ShopDirectoryMapPaneInlineUI.tsx#L40))
- selected shop card / "ROUTE box" → `<MapPaneBottomOverlay>` selected-shop region
- faded legend bar → `<MapPaneBottomOverlay>` `<MapPaneLegendPanel>` slot at [ShopDirectoryMapPaneOverlays.tsx:294](../../../src/app/components/shop/ShopDirectoryMapPaneOverlays.tsx#L294)

The "~15% opacity" the audit measured is likely the under-spinner backdrop blur fading the chrome; the actual elements are at full opacity but the spinner overlay's `backdrop-blur-2xl` panel sits on top of the lower stack.

## Finding 2 — `mapLoaded` flag exists and is plumbed but only consumed by the skeleton

`mapLoaded` and `mapLoadFailed` are destructured at [MapLibreShopDirectoryMapPane.tsx:97-98](../../../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx#L97-L98) from a hook (the source of truth for map-instance lifecycle). Handlers `handleMapLoad` and `handleMapLoadError` are wired to `<Map onLoad>` and `<Map onError>` at [:304-305](../../../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx#L304-L305).

Currently the flag flows to **only one consumer**: `<MapLoadingSkeleton>`. The other four overlays (TilePicker, EmptyState, BottomOverlay, and the layer markers inside `<Map>`) ignore it.

Adding `mapLoaded` as a render gate to the bottom overlay and tile picker is structurally cheap — both already accept `isDark` / `compact` / similar boolean props.

## Finding 3 — `MapLoadingSkeleton` does not exit-fade; it just unmounts

Reading [ShopDirectoryMapPaneInlineUI.tsx:30-90](../../../src/app/components/shop/ShopDirectoryMapPaneInlineUI.tsx#L30-L90) — when `mapLoaded` flips true, the skeleton returns `null` (or equivalent — full method body not read in this audit). No `transition-opacity` exit animation. Per [LAW_ANIMATION_AND_ATMOSPHERE.md](../../LAW_ANIMATION_AND_ATMOSPHERE.md) trust + spatial-continuity, a sudden chrome pop-in (overlay invisible → fully visible the instant tiles ready) is the inverse of the spatial-continuity intent. A 200-300ms cross-fade would soften it.

## Finding 4 — The same pattern likely affects the dashboard-side widgets

[CustomerMapWidget.tsx:185](../../../src/app/components/dashboard/CustomerMapWidget.tsx#L185) shows the parallel KI-165 "Finding shops…" pill on the dashboard preview. That surface uses `MapLibreDashboardMapPreview` (a different engine instance per Pass 191), but the same load-state-gating gap may exist there. Out of scope for this KI-168 inventory but worth a follow-up grep when remediation lands.

---

## Recommended remediation pass shape (when owner authorizes)

KI-168 names two acceptable directions; I'll map both:

### Option (a) — gate bottom panels on `mapLoaded`

> "bottom panels should not render until map hydrated"

**Mechanical change:**
- In `MapLibreShopDirectoryMapPane.tsx` line 482, change `!suppressBottomCard` to `!suppressBottomCard && mapLoaded`.
- Same treatment for `MapTilePicker` line 469: add `&& mapLoaded` to the gate.
- Add a 200-300ms entrance fade once `mapLoaded` flips so the chrome doesn't pop in. Prefer the existing `map-ui-enter` keyframe + `motion-reduce:animate-none` paired class (per Pass 190 finding 6, verify the keyframe bakes the reduce guard).

**Pros:** matches the spec verbatim. Single source of truth for "is the map ready". No wasted DOM during load.
**Cons:** users see less context during the brief load window. If `mapLoaded` flickers (unlikely but possible on style swaps), chrome could flash.

### Option (b) — make spinner the only visible chrome during load

> "spinner should be the only visible chrome during load"

**Mechanical change:**
- Render `<MapLoadingSkeleton>` with a more opaque backdrop that fully covers the bottom overlay during load.
- Or: in `<MapLoadingSkeleton>` while `!mapLoaded`, render an `aria-hidden` opaque scrim covering the full pane that visually obscures the bottom overlays while leaving them in the DOM.
- Bottom panels remain mounted (saves the entrance animation cost) but are hidden behind the scrim.

**Pros:** preserves the bottom overlays' state (no tear-down/rebuild on each style swap). Single-component change.
**Cons:** wastes render work on overlays the user can't see. Scrim approach is "hide it" not "don't render it" — a less honest fix.

**Recommendation: option (a).** It matches the audit-AI's spatial-continuity language elsewhere in the system, eliminates real DOM work during the load window, and the entrance fade is straightforward with the existing `map-ui-enter` keyframe.

### Sub-pass split (if cautious)

- sub-pass 1 — gate `<MapPaneBottomOverlay>` on `mapLoaded`, add fade-in. Verify mobile + desktop on the Smart Shop Map fullscreen surface only.
- sub-pass 2 — gate `<MapTilePicker>` similarly. Re-verify both surfaces.
- sub-pass 3 — close KI-168, update visual audit screenshot baseline, mark RESOLVED.

### Risk

Low-medium. Touches one L2 file plus one L1 helper (the inline-UI skeleton). The `mapLoaded` flag is already the canonical map-instance ready signal and is already plumbed.

---

## Verification

This pass made **zero source-file changes**. Inventory derived from:

- `grep_search` over `src/**` for `Loading map|map.*hydrated|Map failed to load|Loading shops|Finding shops`
- `grep_search` over `src/app/components/shop/**` for `Loading map|isLoading|loading-state|isMapLoading|isHydrated|map-loaded|onMapLoad`
- `grep_search` over `MapLibreShopDirectoryMapPane.tsx` for `mapLoad|InlineMapStatus|mapLoaded|MapPaneInlineUI|isMapLoaded|onLoad`
- read of `MapLibreShopDirectoryMapPane.tsx` lines 450-510 (overlay sibling block)
- read of `ShopDirectoryMapPaneInlineUI.tsx` lines 30-90 (`MapLoadingSkeleton` body)
- `grep_search` of `ShopDirectoryMapPaneOverlays.tsx` for `mapLoaded|opacity-|aria-hidden` (returned no `mapLoaded` matches → confirms BottomOverlay does not gate on it)

No master-builder blast-radius file edited. No owner-dirty file (CLAUDE.md, REF_AI_COLLABORATION_PROTOCOL.md, COWORK_GLOBAL_INSTRUCTIONS.md) read or written.

## Pass-numbering note (audit AI continuation)

Audit AI ships Pass 192 immediately after master-builder's Pass 191 (`9624985e`, dashboard-fullscreen host investigation). Numbering stays linear across both tracks now that master-builder explicitly used 191. No collision.
