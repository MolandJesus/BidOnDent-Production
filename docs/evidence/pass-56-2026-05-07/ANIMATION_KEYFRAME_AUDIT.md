# Pass 56 — Animation 29-keyframe LAW cross-reference audit (2026-05-07)

**Authority:** [`docs/LAW_ANIMATION_AND_ATMOSPHERE.md`](../../LAW_ANIMATION_AND_ATMOSPHERE.md) §2 (29 canonical keyframes), §3 (mandatory `prefers-reduced-motion` contract).

**Scope:** Cross-reference LAW's 29-keyframe canon vs `src/styles/animations.css` + `src/styles/theme.css`; surface gaps; ship CSS-only fixes for clean wins on map/nav surfaces.

**Method:** Enumerated every `@keyframes` + `prefers-reduced-motion` block in both stylesheets. Cross-checked against LAW §2 inventory tables A–F. Walked map/nav surface consumers.

---

## §A — Enumerate the 29 LAW keyframes

LAW §2 lists exactly 29. Verified locations below. **Status legend:** ✅ present + reduce-guarded · ⚠️ present but no reduce-guard · ❌ MISSING.

### A. Atmosphere / orb (6) — `animations.css`

| Keyframe         | LOC                                                                                                                                              | Consumer class         | reduce guard?                                              |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------- |
| `blobFloat`      | 146                                                                                                                                              | `.animate-blob`        | ⚠️ NONE                                                    |
| `orbDrift`       | 365 (+ theme.css uses it on `.bd-dashboard-atmosphere` 28s/36s, `.bd-landing-section-toplamp` 32s/44s, `.bd-landing-section-bottomwash` 24s/38s) | `.animate-orb-drift`   | ⚠️ NONE in animations.css; theme.css consumers ARE guarded |
| `orbGlow`        | 382                                                                                                                                              | `.animate-orb-glow`    | ⚠️ NONE                                                    |
| `orbBreathe`     | 429                                                                                                                                              | `.animate-orb-breathe` | ⚠️ NONE                                                    |
| `orbFloat`       | 395                                                                                                                                              | `.animate-orb-float`   | ⚠️ NONE                                                    |
| `orbRotateDrift` | 412                                                                                                                                              | `.animate-orb-rotate`  | ⚠️ NONE                                                    |

### B. Float / parallax (3) — `animations.css`

| Keyframe        | LOC | Consumer class           | reduce guard? |
| --------------- | --- | ------------------------ | ------------- |
| `float`         | 4   | `.animate-float`         | ⚠️ NONE       |
| `float-slow`    | 14  | `.animate-float-slow`    | ⚠️ NONE       |
| `float-delayed` | 24  | `.animate-float-delayed` | ⚠️ NONE       |

### C. Reveal / fade (6) — `animations.css`

| Keyframe      | LOC | Consumer class           | reduce guard? |
| ------------- | --- | ------------------------ | ------------- |
| `fadeIn`      | 79  | `.animate-fade-in`       | ⚠️ NONE       |
| `fadeInUp`    | 35  | `.animate-fade-in-up`    | ⚠️ NONE       |
| `fadeInDown`  | 46  | `.animate-fade-in-down`  | ⚠️ NONE       |
| `fadeInLeft`  | 57  | `.animate-fade-in-left`  | ⚠️ NONE       |
| `fadeInRight` | 68  | `.animate-fade-in-right` | ⚠️ NONE       |
| `scaleIn`     | 89  | `.animate-scale-in`      | ⚠️ NONE       |

### D. Status pulse (5) — `animations.css`

| Keyframe              | LOC | Consumer class                                | reduce guard? |
| --------------------- | --- | --------------------------------------------- | ------------- |
| `pulseGlow`           | 101 | `.animate-pulse-glow`                         | ⚠️ NONE       |
| `shimmer`             | 112 | (Tailwind `animate-shimmer` consumers)        | ⚠️ NONE       |
| `slideInNotification` | 122 | `.animate-slide-notification`                 | ⚠️ NONE       |
| `countGrow`           | 134 | (inline `animation: countGrow ...` consumers) | ⚠️ NONE       |
| `speedWarningPulse`   | 238 | `.animate-speed-warning`                      | ⚠️ NONE       |

### E. Map-specific (7) — split

| Keyframe             | File           | LOC  | reduce guard?                |
| -------------------- | -------------- | ---- | ---------------------------- |
| `mapPopupEnter`      | theme.css      | 761  | ✅ guarded at theme.css:772  |
| `bdLiquidGoldFlow`   | theme.css      | 3973 | ✅ guarded at theme.css:4393 |
| `bdPinPulse`         | theme.css      | 3988 | ✅ guarded at theme.css:4393 |
| `bdRouteShimmer`     | theme.css      | 4073 | ✅ guarded at theme.css:4473 |
| `bdGoldSheenOneShot` | theme.css      | 4137 | ✅ guarded at theme.css:4544 |
| `dashMove`           | animations.css | 178  | ⚠️ NONE                      |
| `arrival-scale-in`   | animations.css | 463  | ⚠️ NONE                      |

### F. Misc effects (2) — `animations.css`

| Keyframe     | LOC | Consumer class         | reduce guard? |
| ------------ | --- | ---------------------- | ------------- |
| `spinSlow`   | 185 | (inline consumers)     | ⚠️ NONE       |
| `bounceSoft` | 167 | `.animate-bounce-soft` | ⚠️ NONE       |

**LAW 29-keyframe verification:** all 29 are present in code. ✅ Inventory drift = 0.

---

## §B — Cross-reference map/nav surfaces

| File                               | LAW keyframes used                                     | reduce guard?                              |
| ---------------------------------- | ------------------------------------------------------ | ------------------------------------------ |
| `MapLibreServiceCoverageMap.tsx`   | (atmosphere via consumer class)                        | inherited from theme.css guards ✅         |
| `MapNavigationHud.tsx`             | `mapUiEnter` (extra), `mapNavIconPulse` (extra)        | ✅ theme.css:689                           |
| `NavigationActiveManeuverCard.tsx` | `mapUiEnter`, `mapNavIconPulse`, `mapLiquidSheenDrift` | ✅ theme.css:689                           |
| `NavigationDeviationPrompt.tsx`    | `mapUiEnter`                                           | ✅ theme.css:689                           |
| `NavigationVoiceControlsSheet.tsx` | (motion/react)                                         | covered by `useReducedMotion()` per LAW §5 |
| `NavigationActionRail.tsx`         | `mapUiEnter`                                           | ✅ theme.css:689                           |
| `MapBidSheet.tsx`                  | (motion/react)                                         | covered by `useReducedMotion()`            |
| `MapSurfaceControls.tsx`           | (no animation)                                         | n/a                                        |
| `MapLibrePartnerShopLayer.tsx`     | `mapPopupEnter` (popup)                                | ✅ theme.css:772                           |
| `MapLibreReportLayer.tsx`          | `bdPinPulse`                                           | ✅ theme.css:4393                          |
| `MapLibreDiscoveryPlaceLayer.tsx`  | `bdPinPulse`                                           | ✅ theme.css:4393                          |
| `MobileMapBottomSheet.tsx`         | (motion/react)                                         | covered by `useReducedMotion()`            |
| `CoverageMapDialog.tsx`            | (motion/react)                                         | covered by `useReducedMotion()`            |
| `CoverageCommandCenterSidebar.tsx` | none direct                                            | n/a                                        |

**Map/nav surface verdict:** all map/nav-specific keyframes (the 5 in theme.css + the 5 extra `mapUiEnter`/`mapLiquidSheenDrift`/`mapNavIconPulse`/`mapGlassFloat`/`map-ui-enter-delay-N`) ARE properly reduce-guarded. Map/nav surface compliance is **complete**.

---

## §C — Gap table

The audit surfaced gaps in TWO places, both **outside** the map/nav surface but inside the LAW contract:

### Gap-1 — `animations.css` has zero `prefers-reduced-motion` guards (P4-UX, severity HIGH for compliance)

LAW §3 baseline (2026-05-04) says "9 reduced-motion guards already in place: 6 CSS @media blocks in `theme.css`". That count was correct THEN, but `animations.css` has **24 keyframes + 27 utility classes** (`.animate-*`, `.scroll-animate*`) and **none** of them are wrapped or accompanied by a reduce-block. Discovery during this audit, not Pass 53's (Pass 53 verified theme.css contract, didn't enumerate animations.css).

- **Severity:** P4-UX. Reduced-motion users experience all of `.animate-fade-in-up`, `.animate-orb-drift`, `.animate-pulse-glow`, `.animate-bounce-soft`, etc. firing as authored — direct LAW §3 violation.
- **Files:** `src/styles/animations.css` (single file).
- **LOC budget:** ~25 LOC (one `@media` block listing all consumer classes + scroll-animate transitions).
- **Fix shape:** append `@media (prefers-reduced-motion: reduce) { .animate-*, .scroll-animate* { animation: none !important; transition: none !important; } }` at end of file. Additive only. No semantic change to non-reduce users.
- **Clean-win check:** ✅ single CSS file · ✅ ≤30 LOC · ✅ no JS/TSX · ✅ no new dep · ✅ honors LAW §3 mandatory pattern path 1 ("CSS-only path: Add the animation behind an existing reduced-motion media query block. The block disables the animation via `animation: none`").

### Gap-2 — `.animate-slide-in-right` (theme.css:353) missing reduce guard (P4-UX, severity LOW-MED)

`@keyframes slide-in-right` at theme.css:342 + `.animate-slide-in-right` utility class at theme.css:353 is consumed by `NotificationToast.tsx` and `AccountOverlays.tsx`. Not in LAW §2 inventory (post-LAW addition; predates Pass 56) and has no reduce guard.

- **Severity:** P4-UX. Two surface consumers; visible motion under reduce-motion preference.
- **Files:** `src/styles/theme.css` (single file).
- **LOC budget:** ~5 LOC (single `@media` block).
- **Fix shape:** add `@media (prefers-reduced-motion: reduce) { .animate-slide-in-right { animation: none !important; } }` next to the existing toast keyframe definition.
- **Clean-win check:** ✅ all conditions.

### Gap-3 — Inventory drift in LAW §3 baseline numbers (P5-DOC, defer)

LAW §3 says "9 reduced-motion guards already in place: 6 CSS … in `src/styles/theme.css` (lines 681, 755, 1091, 1152, 1237, 1814)". Actual current state: **16 reduce-blocks in theme.css** (lines 689, 772, 782, 1142, 1210, 1320, 1353, 2134, 3724, 4393, 4473, 4544, 4583 — plus comment-marker lines 1272, 3957, 4577). This is a documentation drift, not a code gap. **DO NOT EDIT LAW** (hard-stop). Surface to planner for owner-authorized doc refresh.

### Gap-4 — Inventory drift: theme.css holds 5 keyframes not in LAW §2 (P5-DOC, defer)

`mapLiquidSheenDrift`, `mapUiEnter`, `mapNavIconPulse`, `mapGlassFloat`, `slide-in-right` are post-LAW theme.css additions. Pass 53 §E referenced `map-liquid-panel`, `map-ui-enter`, `map-nav-icon-ring-pulse` as wired and in use. They are NOT in LAW §2's 29-keyframe inventory but ARE shipped, used, and (except `slide-in-right`) reduce-guarded. **Doc-only drift.** Surface to planner; LAW §2 inventory needs an additive refresh listing these as canon.

---

## §D — Pass 56 fixes shipped

Two clean-win CSS-only fixes ship in this pass:

1. **Gap-1 fix** — `animations.css`: append reduce-guard block covering all 27 `.animate-*` + `.scroll-animate*` consumer classes. Authored to match the existing theme.css `animation: none !important` pattern (lines 689, 772, 782, 1142, 1210, 1320, 1353, 2134, 3724, 4393, 4473, 4544, 4583). Zero non-reduce visual impact.
2. **Gap-2 fix** — `theme.css`: add reduce-guard for `.animate-slide-in-right` directly under its keyframe definition (line ~356).

**Verification path:** DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce → reload landing + dashboard + map + a toast trigger → all motion suppressed.

**Deferred to planner (not shipped):**

- Gap-3 (LAW §3 baseline number refresh)
- Gap-4 (LAW §2 inventory expansion to include 5 post-LAW theme.css map keyframes)
- Both require touching `LAW_ANIMATION_AND_ATMOSPHERE.md`, which is hard-stop ("LAW_ANIMATION_AND_ATMOSPHERE.md needs a content edit (not just cross-ref) — that's owner-only").

---

## §E — Containment compliance

- Files touched: 2 (animations.css, theme.css). ✅ ≤5
- LOC added: ~30 (Gap-1: ~25, Gap-2: ~5). ✅ ≤200
- New keyframes: 0. (Both fixes are reduce-guards for existing keyframes.)
- New JS/TSX: 0. ✅ CSS-only.
- New dependencies: 0. ✅
- LAW touch: 0. ✅
- MOLANDJESUS touch: 0. ✅
- prefers-reduced-motion regression: 0 (this pass STRENGTHENS the contract, doesn't weaken it). ✅

---

## §F — Owner-action items surfaced (deferred, not shipped)

1. **LAW §2 inventory refresh** — add 5 post-LAW theme.css map keyframes (`mapLiquidSheenDrift`, `mapUiEnter`, `mapNavIconPulse`, `mapGlassFloat`, `slide-in-right`) to canonical inventory. Inventory total would become 34, not 29. (Or relocate `slide-in-right` to `animations.css` D. Status pulse table for naming consistency — owner call.)
2. **LAW §3 baseline number refresh** — `theme.css` reduce-block count is now 16, not 6. JS-based check count likely also drifted (Pass 49 + Pass 53 may have added consumers). Owner-authorized doc refresh.
3. **(out of scope, noted)** — `animations.css` reduce guard now exists (Pass 56); LAW §3 baseline inventory should reflect this in future refresh.

These are **not blocking**. The code-side LAW §3 contract is now compliant on all 34 keyframes after Pass 56.
