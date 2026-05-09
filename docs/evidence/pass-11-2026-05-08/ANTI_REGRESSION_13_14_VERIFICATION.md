# Anti-Regression Items 13–14 Verification (T-C)

**Source:** PLAN_MAP_UNIFICATION_2026-05-08.md §7.4 (Pass 180 master-builder additions to §6).
**Pass:** Co-worker AI Pass 11 follow-up — T-C track per audit-AI authorization 2026-05-08.
**Method:** file-and-line read against repo HEAD (commit `96916ae0`); ripgrep sweep for regression patterns across `src/`.

## Item 13 — Pass 175 `liveRemainingEtaLabel` "N min" suffix

| # | Site | Expected | Actual | Result |
|---|---|---|---|---|
| 13.a | `src/app/hooks/shopDirectoryNavigationDerived.ts:173` | `` `${Math.round(remainingDurationSeconds / 60)} min` `` | `` `${Math.round(remainingDurationSeconds / 60)} min` `` | **PASS** |
| 13.b | `src/app/components/shop/ShopDirectoryGuidanceCard.tsx:291` | `` `${selectedRoute.estimatedDurationMinutes} min` `` | `` `${selectedRoute.estimatedDurationMinutes} min` `` | **PASS** |
| 13.c | `src/app/hooks/shopDirectoryNavigationDerived.test.ts:180` | `expect(result.liveRemainingEtaLabel).toBe("15 min")` | `expect(result.liveRemainingEtaLabel).toBe("15 min")` | **PASS** |
| 13.d | Repo-wide regression sweep — `${...DurationMinutes}m` / `}m\b` short-suffix on time values | zero remaining instances | **`src/app/components/shop/ShopDirectoryRoutePreviewCard.tsx:176`** still renders `{route.estimatedDurationMinutes}m` for the route-alternatives chip row (Fastest / Balanced / Local roads). Reads as "15m" / "23m" — same bug class as KI-162. | **FAIL** |

**Net for Item 13:** REGRESSION — Pass 175 fix shipped to 2 of 3 surfaces. The route-alternatives chip retained the unfixed pattern. Likely also explains part of KI-169's "1005m / 853.4 mi" observation if `route.estimatedDurationMinutes` ever returns a duration value rendered as the top-line of the chip (the sibling `route.totalDistanceLabel` renders below as the real distance, so a duration "1005m" stacked on top of a distance label is exactly the audit symptom).

**Recommended follow-up (NOT shipped this track per dispatch — verification only):** apply the same Pass 175 swap at `ShopDirectoryRoutePreviewCard.tsx:176`: `{route.estimatedDurationMinutes}m` → `{route.estimatedDurationMinutes} min`. 1-line, semantic-equivalent, no behavior change. Promote to next-pass commit list under either KI-162 reopen or as a KI-162-companion entry.

## Item 14 — Pass 176 single-source maneuver text via `nextInstruction={null}`

| # | Site | Expected | Actual | Result |
|---|---|---|---|---|
| 14.a | `src/app/components/landing/CoverageActiveNavigationLayout.tsx:325` | `nextInstruction={null}` | `nextInstruction={null}` | **PASS** |
| 14.b | `src/app/components/maps/MapNavigationHud.tsx:112-119` | maneuver block gated on truthy `nextInstruction` | `{nextInstruction ? (<div ...>...{nextInstruction}</div>) : null}` at L112-L119 | **PASS** |
| 14.c | Other `nextInstruction={...}` consumers preserve their pass-through (per KI-161 fix-shipped note: only the active-nav surface gates to null; preview/browse modes keep the HUD maneuver) | preserved | All 11 other consumers pass real values: `MapLibreServiceCoverageMap` (engine pass-through), `CoverageBrowseExperience` (preview), `OperatingRegionsSection` (inline preview), `ShopDirectoryListBody`, `ShopDirectoryScreen`, `ShopDirectoryHybridMapSection`, `ImmersiveMapViewport`, `ShopDirectoryImmersiveMap`, `ShopDirectoryMapOverlays` — all read `navigation.nextStep?.instruction ?? null` or `routePanel.nextInstruction`. Active-nav layout is the lone gate-to-null. | **PASS** |

**Net for Item 14:** PASS. KI-161 fix preserved across the surface set. No regression observed.

## Summary

| Item | Status | Action required |
|---|---|---|
| 13 | **FAIL** | Apply Pass 175 swap at `ShopDirectoryRoutePreviewCard.tsx:176` in next pass; reopen KI-162 or file companion KI |
| 14 | **PASS** | None |

**Evidence file complete.** ≤80 lines target met. Hand-back to audit AI for fold into next-pass dispatch.

---

## §6 items 1-12 quick pinpoint verification (T-C continuation, post-acceptance)

Pinpoint checks of the Pass-10-authored §6 items (the 12 anti-regression rules that pre-date the master-builder Pass 180 13/14 additions). Each item below is verified by a single file:line probe, not an exhaustive sweep — broader audits deferred when noted.

| # | Item | Probe | Result |
|---|---|---|---|
| 1 | Pass 166 smooth flyTo on bounds-fit | engine-behavior — no source comment hit on quick grep; verification deferred to dev-server timing recording before Step C.1 extraction | DEFERRED |
| 2 | Pass 171 upper-third pin-pan offset | engine-behavior — `upperThird` / `Pass 171` comment grep returned no top-level hit; lives in `mapLibreControllers.tsx` or layer files; verification deferred | DEFERRED |
| 3 | Pass 172 immersive-fullscreen compass | `MapLibreServiceCoverageMap.tsx:308` → `<NavigationControl position="bottom-right" showCompass={immersiveFullscreen} />` with Pass 172 comment block at L300-307 | **PASS** |
| 4 | Pass 167 turn list empty state | no quick grep match on common phrases; lives inside `MapNavigationHud` or sibling navigation panel; verification deferred | DEFERRED |
| 5 | `motion-reduce:animate-none` guard density | `motion-reduce` appears in 63 files under `src/app/components/`; spot-checks in `MapNavigationHud.tsx`, `MapSurfaceStatusBar.tsx`, `MapBidSheet.tsx`, `NavigationDeviationPrompt.tsx` confirm the guard is present. Density check; not exhaustive per-animation-class | **PASS-DENSITY** |
| 6 | `bd-*` utility classes on form fields, cards, buttons, notice strips | `bd-glass-card--map` / `bd-notice--warn` / `bd-dashboard-panel*` / `bd-dashboard-section*` appear across map components; per-component count check inconclusive without component-by-component card-surface inventory; deferred to full Pass D plan-doc pre-flight | DEFERRED |
| 7 | Light-Mode Surface Rule + premium gold palette (forbidden values) | `grep -cE "rgba\(220,\s*165,\s*90\|rgba\(254,\s*248,\s*220\|rgba\(160,\s*95,\s*25\|rgba\(220,\s*140,\s*50" src/styles/theme.css` returns **0** | **PASS** |
| 8 | 8-criteria depth bar for dark surfaces | structural design pattern; verification requires reading MOLANDJESUS §"Dark Shell Design System" alongside theme.css depth-bar implementations; deferred to Pass D pre-flight | DEFERRED |
| 9 | Pass 49 / KI-053 lazy-mount on `OperatingRegionsSection` | `OperatingRegionsSection.tsx:44-57` — `IntersectionObserver` + `rootMargin: "200px"` + `typeof IntersectionObserver === "undefined"` SSR guard | **PASS** |
| 10 | Pass 884 — navigation-session cloud-drift fallback | source-grep for "navigation_sessions" / "fetchNavigationSession" in `src/app/services/navigation/`; verification deferred to full Pass D pre-flight (likely in `useNavigationSession.ts`) | DEFERRED |
| 11 | `verify_jwt: false` pin on `[functions.server]` | `supabase/config.toml:406` → `verify_jwt = false` | **PASS** |
| 12 | Pointer-on-write / sign-on-read for media URLs | `hydrateSignedStorageUrl` / `hydrateReport` used in 5 handlers (profiles, workflow, reports, vehicles, network_profiles) | **PASS** |

**Net for §6 items 1-12:** 5 PASS pinpoints (3, 7, 9, 11, 12) + 1 PASS-density (5) + 6 DEFERRED. None FAILED on the quick checks. The 6 deferred items are not flagged as risk — they require fuller verification scope than a single grep can provide and live as scheduled work for Pass D pre-flight or as part of master builder's pre-Step-A authorization.

**Companion finding (KI-118 sanity check):** `src/app/hooks/useEscapeKey.ts` exists; `NavigationVoiceControlsSheet.tsx:7` imports it; called at L48 with `(open, onClose)` signature. KI-118 RESOLVED claim (Pass 63) confirmed in source.

**Pass 175 partial-application sweep (T-C extension):** repo-wide regex sweep for `${...DurationMinutes}m`, `Math.round(.../ 60)}m`, `}m</span>`, `}m</p>`, `}m</div>` returned only ONE remaining hit: `ShopDirectoryRoutePreviewCard.tsx:176`. Bug is fully contained to that single file:line. Other Pass 175 sites confirmed clean.
