# REF — Responsiveness Continuity Audit (Pass 293, 2026-05-09)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-09 #17 (ChatGPT Priority 3: responsiveness continuity audit; **READ-ONLY ONLY** per relay; do NOT move into implementation unless instability is mechanically undeniable; Pass 281 §11 invariant #3 — resize-patch — is continuity-sensitive).
**Tier:** REF (current truth — derived from source as of commit `6687d899`).
**Source modification:** ZERO. Pure read-only audit. Pass 281 §11 invariant #3 explicitly UNTOUCHED.
**Companion to:** Pass 289–292 audit set (5-axis map continuity reverse engineering completes with this pass).

---

## §1. Premise & scope

ChatGPT relay #17 named responsiveness continuity as Priority 3, with explicit caution: *"approach this carefully. Per Pass 281 invariant #3: the resize-patch infrastructure is continuity-sensitive. Do NOT move into implementation. Remain read-only unless instability becomes mechanically undeniable."*

This pass interrogates: **how does the codebase detect, respond to, and recover from viewport changes — and where are the implicit assumptions that could break continuity under stress?**

Approach: enumerate every responsiveness primitive in source, map each to its continuity contract, surface implicit assumptions. Pure observation. No proposed remediation.

---

## §2. Responsiveness primitive inventory

The browser exposes several mechanisms for viewport-change detection. BidOnDent's actual usage:

| Mechanism | Used? | Sites | Pattern |
|---|---|---|---|
| `window.addEventListener("resize", …)` | ✅ ONE site | [`DashboardHeader.tsx:196`](../src/app/components/app/DashboardHeader.tsx#L196) | Recompute notification dropdown geometry; debounced via `requestAnimationFrame`. |
| `ResizeObserver` | ✅ ONE site | [`useMapPaneState.ts:128`](../src/app/components/shop/useMapPaneState.ts#L128) | Container-readiness gate: wait for non-zero dimensions before mounting map. |
| `window.addEventListener("orientationchange", …)` | ❌ NEVER (zero matches in `src/`) | n/a | Orientation handled implicitly via `resize` (acceptable per modern best practice). |
| `window.matchMedia(query)` | ✅ 22 sites | various — see §3 inventory | Reactive media-query state; subscriber pattern via `MediaQueryList.addEventListener("change", …)`. |
| `IntersectionObserver` | (not in scope — visibility, not responsiveness) | various | n/a |
| **MapLibre resize-patch** (continuity-critical) | ✅ ONE source, 4 import sites | [`maplibreResizePatch.ts`](../src/app/utils/maplibreResizePatch.ts) | Monkey-patch of `maplibregl.Map.prototype` methods; recovers from constructor crashes. |

**Headline finding:** the codebase uses **only TWO direct viewport-change listeners** (one `resize`, one `ResizeObserver`). Everything else is reactive media-query subscription via `matchMedia`. This is a **deliberately minimalist** responsiveness stance — most layout adaptation is handed off to CSS via Tailwind responsive directives, not JS-driven re-layout.

---

## §3. matchMedia query inventory

22 total `window.matchMedia(...)` call sites. Distinct queries and their purposes:

| Query | Sites | Purpose | Notes |
|---|---|---|---|
| `(max-width: 767px)` | 4 sites: [`DashboardHeader.tsx`](../src/app/components/app/DashboardHeader.tsx), [`NotificationCenter.tsx`](../src/app/components/dashboard/NotificationCenter.tsx), [`HeroSection.tsx`](../src/app/components/landing/HeroSection.tsx), [`OperatingRegionsSection.tsx`](../src/app/components/landing/OperatingRegionsSection.tsx) | "Is mobile" detection | Hard-coded breakpoint |
| `(max-width: ${MOBILE_BREAKPOINT - 1}px)` where `MOBILE_BREAKPOINT = 768` | 1 site: [`useIsMobile.ts`](../src/app/components/ui/use-mobile.ts) | "Is mobile" hook | Equivalent to `(max-width: 767px)` but constant-derived |
| `(min-width: 1024px)` | 1 site: [`CoverageBrowseExperience.tsx`](../src/app/components/landing/CoverageBrowseExperience.tsx) | "Is desktop" detection | |
| `(prefers-reduced-motion: reduce)` | 7 sites: `MapLibreReportLayer`, `HeroSection`, `MapLibreShopDirectoryMapPane`, `ShopDirectoryMapLayers`, `useMapPaneState`, `ShopDirectoryShopPinLayers` (×2), `ReportScreen`, `useParallaxOffset` | Reduce-motion respect | Per LAW_ANIMATION_AND_ATMOSPHERE; protected by Pass 238 + Pass 284 audit. |
| `(prefers-color-scheme: dark)` | 1 site: [`useMapPaneState.ts`](../src/app/components/shop/useMapPaneState.ts) | Auto-theme detection | Only used when explicit theme is `auto`. |
| Generic `useMediaQuery(query)` abstraction | 1 source + 3 callers: `HeroSection`, `OperatingRegionsSection`, `CoverageBrowseExperience` | Reactive subscription helper | All callers pass string literals — no runtime-computed queries. |

**Continuity surfaces R1-R3:**

- **R1 — Three breakpoint conventions coexist:** JS uses `(max-width: 767px)`; CSS uses `(max-width: 640px)` AND `(max-width: 768px)` AND `(max-width: 1024px)` per `theme.css`; Tailwind defaults are `sm=640 / md=768 / lg=1024 / xl=1280 / 2xl=1536`. The 767/768 split is benign (Tailwind's `md:` activates at ≥768, JS `(max-width: 767px)` matches at <768 — no overlap). But the `640` boundary in CSS (`(max-width: 640px)`) is NOT mirrored in any JS check. A user at viewport width 700px experiences a CSS-only breakpoint (between 640 and 768) that JS cannot detect.

- **R2 — No single-source-of-truth for breakpoints:** `MOBILE_BREAKPOINT = 768` is defined in `useIsMobile.ts` only; the value `767` is hard-coded in 4 other files; `1024` is hard-coded in CoverageBrowseExperience; CSS uses 640/768/1024. A future change to "desktop starts at 1280" would require synchronized edits to JS hard-codes + CSS @media + Tailwind config (if customized). **Currently not a problem** because no recent change requires it; surfaced as a structural observation.

- **R3 — Tailwind directive usage stats** (production tsx):
  - `sm:` 553 occurrences
  - `md:` 183 occurrences
  - `lg:` 66 occurrences
  - `xl:` 35 occurrences
  - `2xl:` 4 occurrences
  - This descending curve (mobile-first by ~3× ratio per stop) confirms the mobile-first stance per CLAUDE.md / `bd-design-identity` skill. Most layout adaptation is at the sm boundary; lg+ adaptation is uncommon.

---

## §4. The MapLibre resize-patch (Pass 281 §11 invariant #3 — continuity-critical)

**File:** [`src/app/utils/maplibreResizePatch.ts`](../src/app/utils/maplibreResizePatch.ts) (98 lines)

**What it patches:** monkey-patches three `maplibregl.Map.prototype` methods:
1. `_render` — top-level animation frame entry
2. `resize` — external callers (react-map-gl ResizeObserver)
3. `_resizeInternal` — constructor path

**Why it exists:** MapLibre's constructor calls `_resizeInternal()` BEFORE the projection matrix is initialized, causing `_calcMatrices` to crash with `"Cannot read properties of null (reading '0')"`. This corrupts the map's transform state and prevents tiles from loading. The patch wraps each method in try/catch + recovery logic.

**Recovery semantics per patched method:**
- `_render` failure → schedule retry on next frame via `triggerRepaint()`
- `resize` failure → setTimeout 300ms retry
- `_resizeInternal` failure → repair corrupted transform (set `_zoom = 11` if NaN), setTimeout 200ms retry

**Pass 281 invariant #3:** this patch must be imported BEFORE any maplibre-gl module is loaded. The patch is module-cached (re-import is no-op), so the invariant is "first-import wins" — whichever file's import order touches it first establishes it for the whole bundle.

**Audited import discipline (4 owner sites):**

| File | Patch import line | Position | Status |
|---|---|---|---|
| [`MapLibreShopDirectoryMapPane.tsx:2`](../src/app/components/shop/MapLibreShopDirectoryMapPane.tsx#L2) | line 2 | LITERAL FIRST IMPORT | ✅ Gold standard |
| [`MapLibreDashboardMapPreview.tsx:2`](../src/app/components/dashboard/MapLibreDashboardMapPreview.tsx#L2) | line 2 | LITERAL FIRST IMPORT | ✅ Gold standard |
| [`MapEngineCanvas.tsx:29`](../src/app/components/maps/engine/MapEngineCanvas.tsx#L29) | line 29 | First import (preceded only by file-level doc comment block) | ✅ Compliant |
| [`MapSessionProvider.tsx:52`](../src/app/components/maps/MapSessionProvider.tsx#L52) | line 52 | First import (preceded only by extensive doc comment block; explicit comment at lines 49-51 documents the "must run before any future Map instantiation" rationale) | ✅ Compliant |

**All four sites preserve invariant #3.** None imports another maplibre-gl module BEFORE the patch in its own file.

**Continuity surface R4 (cross-file ordering risk):** within a SINGLE file, the import order is preserved. Across files, ES module load order is determined by the import graph — the patch is loaded the first time ANY of these 4 files is loaded by another module. As long as ONE of the 4 patch-importers is in the import graph BEFORE any file that uses `maplibregl` directly, the invariant holds. **There is no test that verifies this cross-file ordering.** Pass 287 protects provider mount order; it does NOT protect resize-patch ordering. Pass 285 §3.3 (hydration timing) is the closest spec coverage — but is Phase 2 / not implemented.

**Continuity surface R5 (upstream maplibre-gl signature drift):** the patch monkey-patches private methods (`_render`, `_resizeInternal`). If maplibre-gl renames these methods (semantic-version-respecting major version), the patch would silently no-op — the `if (originalRender)` / `if (originalResize)` / `if (originalResizeInternal)` guards prevent crash but ALSO mask the patch failure. There is no runtime assertion that the patch attached.

**Continuity surface R6 (window-global allowlist):** `__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__` is set as a global flag for test verification (Pass 231j; KI-190). Catalogued by Pass 290 §3.2 as the un-namespaced window-global allowlist entry. This flag is the ONLY observable signal that the patch attached.

---

## §5. The container-readiness ResizeObserver (orthogonal defense)

**File:** [`useMapPaneState.ts:115-147`](../src/app/components/shop/useMapPaneState.ts#L115)

**Pattern:** before mounting the map, wait for the container element to have non-zero dimensions:
1. On effect mount, check `el.offsetWidth > 0 && el.offsetHeight > 0`.
2. If yes → `requestAnimationFrame(setContainerReady(true))` (paint-cycle ensures browser has actually composited).
3. If no → attach `ResizeObserver` to wait for first non-zero dimensions.
4. Cleanup disconnects the observer on unmount.

**Continuity property:** this is a **distinct** responsiveness defense from the resize-patch. They protect different failure modes:
- Resize-patch: protects against MapLibre's OWN constructor crashes (internal projection state).
- ResizeObserver gate: protects against the PARENT CONTAINER being 0×0 at mount time (e.g. parent in `display: none` then revealed; lazy-loaded routes; tab switches mid-render).

**Two-orthogonal-defenses observation:** these defenses are deliberately uncoordinated. The patch operates at the maplibre-gl prototype level (lib-internal); the gate operates at the React component level (call-site-local). Neither knows about the other. This is healthy decoupling — each defense covers a category the other cannot.

**Continuity surface R7 (no audit of container-readiness coverage):** only `useMapPaneState.ts` (the Engine 2 / shop-directory pane) implements the container-readiness gate. `MapEngineCanvas.tsx` (Engine 1) and `MapLibreDashboardMapPreview.tsx` (Engine 3) do NOT have an equivalent gate. They rely on either (a) the parent container being correctly sized at mount time, or (b) react-map-gl's own ResizeObserver handling the late-paint case. **Asymmetric defense across engines.** Owner-decision: parity-add the gate to engines 1 and 3, or accept the per-engine variation as deliberate?

---

## §6. The single window.resize listener (DashboardHeader notification geometry)

**File:** [`DashboardHeader.tsx:172-201`](../src/app/components/app/DashboardHeader.tsx#L172)

**Purpose:** when the notifications dropdown is open, recompute its position relative to the trigger button on every viewport-resize so it stays aligned.

**Pattern:**
- Effect runs only when `showNotifications === true`.
- Uses `requestAnimationFrame` for initial computation (paint-debounced).
- Adds `window.addEventListener("resize", updateNotificationGeometry)`.
- Cleanup removes the listener.

**Continuity properties:**
- **Lifecycle-bounded:** listener is attached only while notifications are open. No idle cost.
- **Implicit debouncing:** since `updateNotificationGeometry` synchronously calls `getBoundingClientRect` and `setState`, every resize event triggers a re-render. Could be expensive during a fast resize drag, but bounded by the rendered content (just the dropdown geometry).

**Continuity surface R8 (no other component uses this pattern):** only DashboardHeader debounces a positioned-overlay against viewport resize. Other floating overlays (toast, dropdown menus, sheets) rely on their own positioning strategies — Radix uses popper, dialogs use centered transforms, sheets use bottom-anchored. None of these need explicit resize handling because their positioning is CSS-relative. The DashboardHeader notification dropdown is unique because it does pixel-precise alignment relative to a non-Radix-managed trigger.

---

## §7. Orientation handling

**Zero `orientationchange` listeners** in the codebase.

**Why this is acceptable:** modern mobile browsers fire a `resize` event on orientation change. The MapLibre internal `ResizeObserver` (added by react-map-gl) picks up the new container dimensions and triggers `map.resize()`. The resize-patch then either succeeds normally or recovers via the 300ms retry path.

**Continuity property:** orientation continuity is **delegated** to the resize event chain. There is no orientation-specific UX (e.g. "orientation locked landscape for navigation"). Owner-decision territory: should there be orientation-locked surfaces (e.g. immersive navigation), or is the freeform orient/reorient pattern intentional?

**Continuity surface R9 (no orientation lock for active navigation):** mobile users in active navigation can rotate to landscape and the layout adapts via CSS responsive directives. No explicit handling. May be a feature (user choice), may be a gap (some navigation apps lock orientation for safety). Owner-decision territory.

---

## §8. Connections + contributions

### 8.1 To Pass 281 §11 invariant #3 (resize-patch ordering)

Pass 293 §4 verifies the invariant currently holds across all 4 owner sites. The invariant is:
- DOCUMENTED in `LAW_MAP_RENDERER_CONTRACT §3.1` and `REF_KNOWN_ISSUES KI-190`
- EXISTING global flag `__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__` confirms patch installation at runtime
- NOT verified by automated test for cross-file ordering (R4 surface)
- NOT verified by automated test for upstream signature drift (R5 surface)

Pass 287 protects provider mount order at the test level. An analogous test for resize-patch ordering would be a Phase 1 candidate (verify `MapSessionProvider.tsx`, `MapEngineCanvas.tsx`, `MapLibreShopDirectoryMapPane.tsx`, `MapLibreDashboardMapPreview.tsx` each contain the patch import as their first non-comment line). NOT proposed as remediation — only flagged as a candidate per Pass 285 §3 spec extension.

### 8.2 To Pass 290 §3.2 sessionStorage / window-global inventory

The `__BIDONDENT_MAPLIBRE_RESIZE_PATCHED__` global is the un-namespaced window-global allowlist entry catalogued by Pass 288 (test) and acknowledged by Pass 290 (cross-tab persistence audit). Pass 293 §4 R6 confirms its purpose: it's the only observable signal that the resize-patch attached. Per-tab by definition (window globals don't cross tabs).

### 8.3 To Pass 291 §2 z-axis canon

Pass 291 mapped the z-axis. Pass 293 confirms that resize-related elements respect the canon: the dashboard notification dropdown computes its position via JS but uses standard z-50 for stacking; toasts at z-[9999] are repositioned by the toast component on dismiss/replace, not by resize.

### 8.4 To Pass 292 §5 z-axis × spatial intersection

Pass 292 surfaced the bottom-nav-occlusion-by-immersive observation. Pass 293 confirms this is NOT a resize-handler concern — the occlusion is purely a z-relationship. No resize handler needs to participate.

### 8.5 To relay #15 #7 / relay #17 themes

Pass 293 reinforces the semantic-vs-visual decoupling theme along the responsiveness axis:
- **Semantic** responsiveness: matchMedia subscriptions update React state; clean propagation.
- **Visual** responsiveness: CSS @media queries + Tailwind directives; layout adapts without JS.
- These are intentionally decoupled. JS handles only the cases CSS cannot (engine readiness, dropdown positioning).

This is consistent with all four prior passes' findings: **the codebase prefers CSS-driven layout + minimal JS coordination.** Responsiveness is governed by the same philosophy.

### 8.6 No new convergence on `placeDiscoveryQuality.ts:51` hotspot

Pass 293 finds zero new convergence. The convergence-hotspot pattern remains: namespace-drift (Pass 288) + cross-tab race (Pass 290) on the same line. Responsiveness does not touch it.

---

## §9. Owner-decision-bound items surfaced

This audit does NOT propose remediation:

1. **R1 (three breakpoint conventions):** acceptable per-context divergence, or unify under a single source-of-truth?
2. **R2 (no breakpoint single-source-of-truth):** introduce a shared constants module, or accept per-file hard-coding?
3. **R4 (no automated test for resize-patch cross-file ordering):** Phase 1 harness candidate per Pass 285 §3 — implement, or accept current manual discipline?
4. **R5 (no upstream signature drift detection):** add runtime assertion that the patch attached (the `if (originalRender)` guard's else-branch is silent), or accept silent no-op?
5. **R7 (asymmetric container-readiness gate across 3 engines):** parity-add to Engine 1 / Engine 3, or accept per-engine variation?
6. **R9 (no orientation lock for active navigation):** add orientation-lock for safety-critical surfaces, or accept freeform reorient?

**Pass 293 introduces ZERO new owner-decision points to the cumulative count of 31** (each item is conditional on owner first deciding the asymmetry/coverage gap is undesirable).

---

## §10. Pass 281 invariants check

| Invariant | Status |
|---|---|
| 4-layer provider mount order | UNTOUCHED |
| AppWithToast subcomponent boundary | UNTOUCHED |
| **First-import-line resize-patch (invariant #3)** | **VERIFIED PRESERVED** at all 4 owner sites per §4 — audit confirms current compliance |
| Light-vs-dark contrast LAW palette | UNTOUCHED |
| Reduced-motion guards (35/35 per Pass 284) | UNTOUCHED + corroborated by §3 (7 prefers-reduced-motion matchMedia sites) |
| Two intentional `:root` blocks | UNTOUCHED |
| Pass 282 cadence/easing tokenization | UNTOUCHED |
| Pass 283 blur tokenization | UNTOUCHED |
| Pass 286 Clerk wrapper inflation | UNTOUCHED |
| Pass 287 provider-mount-order test | UNTOUCHED |
| Pass 288 persistence-namespace test | UNTOUCHED |
| Pass 289 fullscreen-lifecycle observations | UNTOUCHED (extended) |
| Pass 290 cross-tab observations | UNTOUCHED (extended) |
| Pass 291 overlay-topology observations | UNTOUCHED (extended) |
| Pass 292 spatial-density observations | UNTOUCHED (extended) |

Pass 281 §12 anti-patterns: ZERO violations.
Relay #15 / #17 prohibitions: ZERO violations. **Critical: per relay #17's explicit READ-ONLY constraint on responsiveness, this pass introduces no source modification, no test addition, no patch refactor.**

---

## §11. What this pass does NOT do

- No source modification (audit-only — explicit relay #17 prohibition observed)
- No LAW edit
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit
- No modification of the resize-patch source (Pass 281 invariant #3 protected)
- No proposal to fix any R-series observation
- No new test files (R4 candidate flagged for future authorized work only)
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #17)
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §12. Forward triggers

1. Owner authorizes Phase 1 harness candidate per R4: snapshot test verifying resize-patch import discipline at all 4 owner sites.
2. Owner authorizes runtime assertion per R5: log/throw if `if (originalRender)` guard fails (would catch upstream signature drift).
3. Owner authorizes parity-add of container-readiness gate per R7 (Engines 1 + 3).
4. Owner authorizes breakpoint single-source-of-truth per R1/R2 (constants module + JS-CSS alignment).
5. Owner authorizes orientation-lock decision per R9.

---

## §13. The 5-axis audit set is now COMPLETE

Pass 289 + 290 + 291 + 292 + 293 form the **complete relay #17 audit set**:

| Pass | Axis | Headline finding |
|---|---|---|
| 289 | Within-tab fullscreen lifecycle | "Fullscreen" is a tree-swap, not browser API. 8 drift observations (D1-D8). |
| 290 | Across-tab continuity | Only ONE genuine cross-tab sync (`useAppearanceMode`). 7 cross-tab observations (X1-X7). |
| 291 | Within-frame overlay topology | Numeric z-axis canonized + crosswalked. Guidance overlay duplication drift. 6 observations (S1-S6). |
| 292 | Viewport-spatial allocation | Bimodal map-to-screen ratio. Hybrid stage is column-stacked, not split-pane. 4 observations (SP1-SP4). |
| 293 | Responsiveness continuity | Resize-patch invariant verified at all 4 sites. 9 observations (R1-R9). |

**Combined:** the five passes together reverse-engineer BidOnDent's "continuity operating system" along all five axes named in relay #17. Together they document **34 observation surfaces** (D1-D8 + X1-X7 + S1-S6 + SP1-SP4 + R1-R9) — none of which are categorized as bugs; all are observation-only with explicit owner-decision-bound flags where applicable.

**Cumulative pass-block invariants:**
- Pass 281 §11 invariants ALL UNTOUCHED across the 5 passes
- Pass 281 §12 anti-patterns: ZERO violations
- Relay #15 / #17 prohibitions: ZERO violations
- Owner-decision points cumulative: 31 (UNCHANGED across all 5 audit passes)
- Source files modified: 0
- Test files modified: 0
- LAW files modified: 0
- New REF docs created: 5
- Total audit doc lines added: ~1,420

The audit lane has reached **maximum coverage of relay #17's named priorities** within the read-only constraint.

---

## §14. Status

REF doc shipped Pass 293. Audit-only — preserves all existing doctrine. The 5-axis relay #17 audit set is now COMPLETE per §13. Forward direction is owner-decision territory: which (if any) of the 34 observations to remediate, or whether to authorize the various flagged Phase 1/2/3 harness candidates.

**End of doc.**
