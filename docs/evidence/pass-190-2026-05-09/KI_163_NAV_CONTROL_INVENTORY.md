# KI-163 — Navigation control sprawl: surface inventory (read-only)

**Pass:** 190 (Audit AI parallel track) · **Date:** 2026-05-09
**Authority:** Pass D from audit-AI parallel-track menu — read-only inventory, no source edits, owner picks remediation.
**Source KI:** [docs/REF_KNOWN_ISSUES.md](../../REF_KNOWN_ISSUES.md) KI-163 (P2-DESIGN, OPEN).

---

## 1. The five corners audit AI Pass 9 measured (active-navigation surface)

| # | Corner / cluster                  | Component                         | File / line                                                                               |
|---|-----------------------------------|-----------------------------------|-------------------------------------------------------------------------------------------|
| 1 | **Top-left** — exit/back button   | inline `<button>` (no component)  | [src/app/components/landing/CoverageActiveNavigationLayout.tsx:210](../../../src/app/components/landing/CoverageActiveNavigationLayout.tsx#L210) |
| 2 | **Top-center** — rerouting + GPS pills | inline divs (status banners) | [src/app/components/landing/CoverageActiveNavigationLayout.tsx:225](../../../src/app/components/landing/CoverageActiveNavigationLayout.tsx#L225) and [:240](../../../src/app/components/landing/CoverageActiveNavigationLayout.tsx#L240) |
| 3 | **Top-right** — shop list + map-view pills | upstream of nav layout (top-bar shell) | not in this file — owned by `MapProgramTopBar` / `ImmersiveMapTopBar` (Pass 181) |
| 4 | **Right-edge vertical toolbar** — TURNS / VOICE / SETTINGS / CENTER | `NavigationActionRail`            | [src/app/components/maps/navigation/NavigationActionRail.tsx](../../../src/app/components/maps/navigation/NavigationActionRail.tsx) (130 lines) — mounted at [CoverageActiveNavigationLayout.tsx:344](../../../src/app/components/landing/CoverageActiveNavigationLayout.tsx#L344) and [shop/ImmersiveMapViewport.tsx:347](../../../src/app/components/shop/ImmersiveMapViewport.tsx#L347) |
| 5 | **Bottom-left** — navigation panel (maneuver card + speed panel + browse panel) | `NavigationActiveManeuverCard`, `NavigationActiveSpeedPanel`, `NavigationBrowseDiscoveryPanel` | several mounts in `CoverageActiveNavigationLayout.tsx` |
| 6 | **Bottom-right** — MapLibre `<NavigationControl>` (zoom + compass) | engine-level, `position="bottom-right"` | [src/app/components/maps/engine/MapEngineCanvas.tsx:200](../../../src/app/components/maps/engine/MapEngineCanvas.tsx#L200) (Pass 189) |

That is **6 visible clusters** when you include the engine-level `<NavigationControl>` (the audit's "5 corners" count merged the engine zoom/compass into "bottom-right" without naming the source). Whichever way the count lands, the right-edge vertical `NavigationActionRail` is still the unconventional outlier KI-163 calls out.

## 2. Every render of `<NavigationControl>` in `src/`

```
src/app/components/maps/engine/MapEngineCanvas.tsx:200
  <NavigationControl position="bottom-right" showCompass={immersiveFullscreen} />
```

**One render site.** The Pass 189 extraction pulled it out of `MapLibreServiceCoverageMap.tsx` into the canvas adapter. `showCompass` is gated on `immersiveFullscreen` so embedded preview cards stay clean and only fullscreen surfaces show the compass. That gating is correct and should not be touched in remediation.

## 3. Every render of `<NavigationActionRail>` in `src/`

```
src/app/components/landing/CoverageActiveNavigationLayout.tsx:344
src/app/components/shop/ImmersiveMapViewport.tsx:347
```

**Two mount sites**, both inside active-navigation/guidance-mode surfaces. Both pass the same four buttons (Turns, Voice, Settings, Center). `ImmersiveMapViewport` overrides the bottom offset to `bottom-[calc(max(env(safe-area-inset-bottom),0.75rem)_+_20rem)]` to clear its taller bottom card stack; `CoverageActiveNavigationLayout` uses the rail's default `bottom-[calc(...+8rem)]`.

The rail itself is responsive: stacked horizontally on mobile (centered above the bottom panel) and stacked vertically on `sm:` breakpoint and above (right-edge, vertically centered). The audit AI screenshot was a desktop viewport, hence the "right-edge vertical toolbar" framing.

## 4. Other `Compass` / zoom UI in the maps tree (non-rail, non-engine)

```
src/app/components/maps/command-center/CoverageCommandCenterSidebar.tsx:137
  <Compass className="h-4 w-4" />               // sidebar item icon, not a viewport control
src/app/components/maps/navigation/NavigationBrowseDiscoveryPanel.tsx:214,226
  <Compass className="h-4 w-4" />               // discovery panel category labels, not viewport controls
```

These are decorative `lucide-react` icons inside other UI; **not** zoom/pan/compass controls and **not** part of the KI-163 sprawl.

## 5. Remediation surface (mapping the KI-163 fix-direction)

KI-163's recommended fix:
> collapse the right-edge `NavigationActionRail` into the bottom-left navigation panel header (icon row), leaving only back button (top-left), top-right pills, and bottom-right zoom/compass.

What that translates to mechanically:

1. **Move the four rail buttons** (Turns, Voice, Settings, Center) into a horizontal icon row inside the navigation panel header. The `NavigationActionRail` component itself can stay as a reusable building block (already accepts a `className` override), but its absolute-positioning shell would move under panel-header control, not viewport-edge control.
2. **Update both mount sites** ([CoverageActiveNavigationLayout.tsx:344](../../../src/app/components/landing/CoverageActiveNavigationLayout.tsx#L344) and [shop/ImmersiveMapViewport.tsx:347](../../../src/app/components/shop/ImmersiveMapViewport.tsx#L347)) to render the rail inside the bottom panel chrome rather than as a sibling overlay.
3. **Verify behavior** on mobile (rail is currently a centered horizontal strip above the bottom panel — moving it INTO the panel header is conceptually similar). Mobile remediation may be a no-op layout-wise; desktop is the real change.
4. **Anti-regression check**: the rail's `aria-pressed` semantics, 44px min touch targets, and `motion-reduce:animate-none` (none currently — `map-ui-enter` does not include reduce guard, see §6 below) must survive the move.

## 6. Adjacent observation worth recording (NEW — audit AI Pass 190)

While inventorying the rail I noticed `NavigationActionRail` uses `map-ui-enter` for entrance animation ([line 47](../../../src/app/components/maps/navigation/NavigationActionRail.tsx#L47)) but does **not** add the `motion-reduce:animate-none` paired class. Per [LAW_ANIMATION_AND_ATMOSPHERE.md](../../LAW_ANIMATION_AND_ATMOSPHERE.md) every entrance animation requires the reduced-motion guard. This is either:

- (a) `map-ui-enter` already bakes the reduce-guard into its keyframe definition (CSS-first lock), making the explicit class redundant — verify by reading the keyframe definition in `src/styles/`; or
- (b) a missed reduce-guard that should be added in a small follow-up sweep.

This is **not** the audit AI's call to fix in this read-only pass. Filed here for the next motion sweep / law-anim-and-atmosphere audit. If verification shows (b), file as new KI alongside the next sprawl remediation.

## 7. Recommended remediation pass shape (when owner authorizes)

- **Scope:** one pass, single coherent change.
- **Files:** `NavigationActionRail.tsx` (small — adjust default positioning class from absolute viewport-edge to relative-in-flow), `CoverageActiveNavigationLayout.tsx` (move mount under panel-header wrapper), `ImmersiveMapViewport.tsx` (same).
- **Risk:** medium. Touches two L2 surfaces. Mobile + desktop verification required.
- **Estimated host churn:** ~15-30 lines per layout file plus the rail's positioning shell.
- **Predecessor passes that unblock this:** Pass 189 `<MapEngineCanvas>` extraction (already shipped) — engine vs chrome separation makes "what counts as engine control vs panel chrome" reviewable.
- **Sub-pass split (if cautious):**
  - sub-pass 1 — extract panel-header icon-row helper, mount inside `CoverageActiveNavigationLayout` only; verify mobile + desktop.
  - sub-pass 2 — apply same change to `ImmersiveMapViewport`; verify both surfaces.
  - sub-pass 3 — close KI-163, update visual audit screenshot baseline, mark RESOLVED.

---

## Verification

This pass made **zero source-file changes**. Inventory derived from:

- `grep_search` over `src/app/components/maps/**` for `NavigationControl|NavigationActionRail|MapNavigationHud|zoom.*control|compass`
- `grep_search` over `src/**` for `NavigationActionRail` (2 mount sites confirmed)
- read of `NavigationActionRail.tsx` (130 lines, full file)
- read of `CoverageActiveNavigationLayout.tsx` lines 200-370 (mount context)
- read of `ImmersiveMapViewport.tsx` lines 340-365 (second mount context)

No master-builder blast-radius file edited. `MapLibreServiceCoverageMap.tsx` and `engine/MapEngineCanvas.tsx` were read-only.

## Pass-189 number-collision note (audit AI vs master-builder)

Both audit AI and master-builder used "Pass 189" for unrelated work in the same session. Audit AI shipped first (`32126dc2`, cspell domain terms). Master-builder shipped second (`9d154645`, `MapEngineCanvas` extraction). Renumbered: audit AI's next pass (this inventory) is **Pass 190** to keep ordering legible. No code conflict — different files entirely.
