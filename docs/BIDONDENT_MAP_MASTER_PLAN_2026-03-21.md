## Passes 181–185 — Design Consolidation Sweep (2026-03-24)

Full-stack design system consolidation: glass unification, blue token upgrade, empty state visibility, CTA hierarchy, report flow touch targets, Sentry setup, MCP plugin plan. See `BIDONDENT_MAP_TRACKER_2026-03-21.md` and `BIDONDENT_BUILD_PROGRESS_DASHBOARD.md` for detailed pass-by-pass logs.

**Key outcomes:**

- All empty states now use `bd-glass-card` — no more invisible `bg-slate-50` on dark dashboard
- Blue system tokens upgraded: glass backgrounds blue-tinted, shadows refined, hover accents unified
- All report creation buttons meet WCAG AA 44px touch targets
- Landing page CTAs standardized: pill shape, vertical gradient, proportional sizing
- Sentry project live, DSN wired, MCP plugin roadmap documented

## Strategic Direction Update (2026-03-25)

### Current Reality (Screenshot-Verified)

The map/coverage section is the strongest product surface. The Operating Regions section with its dark navy background, interactive map, ZIP search, and navigation handoff is the visual identity anchor. The design consolidation passes (181-185) unified the glass system and blue tokens across all surfaces.

### Remaining Strategic Gap

The map is compelling when you reach it, but the overall product doesn't yet feel **map-native**. The dashboard still feels like "UI with a map widget" rather than "map with floating panels." Light landing sections are clean but don't feel connected to the map identity.

### Strategic Priorities (Post-185)

1. **Map dominance** — Make the map the central experience, not a section among sections
2. **Spatial interaction loops** — Report→shop→bid→navigation should feel like one connected spatial journey
3. **Identity unification** — Every surface should feel like it belongs to BidOnDent's blue/map world
4. **Mobile-first map behavior** — Bottom sheets, overlays, and thumb zones optimized for map interaction

### Implementation Note — Pass 200 (2026-03-25)

- Dashboard shell now applies a map-night visual system across sticky header, desktop sidebar, and mobile bottom nav.
- Fixed map hero layer in `HomeScreen.tsx` is offset below sticky header to prevent map/header collision.
- This is a directional step toward map-dominant shell behavior while preserving current information architecture.

### Implementation Note — Pass 203 (2026-03-25)

- Coverage county list in `OperatingRegionsSection.tsx` now uses map-native hierarchy with active-region labeling and status badges.
- This maintains existing behavior while improving quick-scan comprehension of current service footprint.

### Implementation Note — Pass 205 (2026-03-25)

- Introduced a persisted appearance preference (`map-dark` or `light`) through Account settings to support controlled shell variation.
- Wiring spans app orchestration, dashboard routing contracts, and both core shell surfaces (`DashboardLayout.tsx`, `LandingPageLayout.tsx`).
- Strategic intent: preserve map-first default while enabling broader system theme scalability in future passes.

### Implementation Note — Pass 206 (2026-03-25)

- Hardened appearance system with document-level mode attributes (`data-appearance-mode`, `color-scheme`) in app orchestration.
- Extended mode-aware shell consistency to mobile bottom navigation so light mode no longer inherits dark-only nav treatment.
- Adds a safer foundation for future map-overlay and card-level theme tokenization while preserving map-dark as product default.

### Implementation Note — Pass 207 (2026-03-25)

- Executed a mobile-first contrast sweep across major landing sections to remove washed headings/body copy on small screens.
- Shifted customer dashboard map widget and bids summary/empty surfaces toward map-dark glass treatment for shell consistency.
- Strategic effect: strengthens map-first visual continuity from landing to dashboard without changing underlying data flows.

### Implementation Note — Pass 208 (2026-03-25)

- Refined dashboard mobile top-stack rhythm by increasing map-to-content separation and tightening hero action-card spacing.
- Added compact density controls to customer map widget for mobile while preserving full detail in expanded map dialog.
- Strategic effect: improves first-screen clarity in authenticated map-first experience without changing navigation architecture.

### Implementation Note — Pass 209 (2026-03-25)

- Refined Account tab surfaces to dark map-shell card language (`AccountInfoCard`, `AccountMenu`) for authenticated-shell coherence.
- Elevated icon chip and row contrast to maintain tap clarity on mobile dark backgrounds.
- Strategic effect: reduces visual context switching between dashboard tabs and supports a unified map-first product identity.

### Implementation Note — Pass 210 (2026-03-25)

- Extended dark-shell cohesion into report intake shell (`ReportHeader`, `ReportProgress`, `StepVehicleInfo`).
- Tuned inactive step indicators and form fields for legibility on dark surfaces while preserving current flow behavior.
- Strategic effect: improves continuity from dashboard home to report creation in the core report -> map -> shop loop.

### Implementation Note — Pass 211 (2026-03-25)

- Completed dark-shell parity for remaining report steps (`StepDamageArea`, `StepDescription`) so intake styling stays consistent through submission.
- Updated selector/button/field/error surfaces for stronger legibility on map-night backgrounds without changing flow logic.
- Strategic effect: closes report-flow visual continuity gaps and strengthens the report -> map -> shop action loop.

### Implementation Note — Pass 212 (2026-03-25)

- Wired appearance-mode conditionals through DashboardRouter → ReportScreen → ReportHeader/Progress/VehicleInfo/DamageArea/Description.
- Each component derives `isLightAppearance` from the prop and applies conditional class names for both map-dark and light modes.
- Strategic effect: establishes the pattern for system-wide dark/light mode support; report flow is the first multi-screen surface fully wired.

### Implementation Note — Pass 213 (2026-03-25)

- Completed appearance-mode parity for the remaining 3 report steps: StepPhotos, StepServiceLocation, StepComplete.
- All 6 report steps + header + progress bar now respond to the `appearanceMode` prop.
- Strategic effect: report intake is the first complete multi-step flow with full dark/light mode parity — validates the approach for system-wide rollout.

See `BIDONDENT_FINISHING_MASTER_PLAN.md` for detailed execution roadmap.

---

## Pass 179 — Shop loop completion (spatial shop actions, map-driven overlays) (2026-03-24)

- **Why this pass was chosen:** Map-driven shop actions (bid/accept) were not surfaced as primary overlays, limiting mobile and map-first flows. Needed to complete the spatial shop loop and ensure all actions are accessible from the map.
- **What changed:**
  - Added a floating shop action overlay to `ShopDirectoryMapOverlays.tsx`.
  - Overlay provides large, mobile-first "Place Bid" and "Accept" buttons, always accessible when a shop and route are selected.
  - Buttons are glass/royal blue, 44x44px+ touch targets, and follow the design system.
  - Actions dispatch custom events for integration with the rest of the shop flow.
- **Files touched:** `ShopDirectoryMapOverlays.tsx`
- **Validation:** Build: ✓ 0 errors · 990.81 KB · 2.08s. Diagnostics: 0. Spellcheck: 0. Overlay appears and works on mobile and desktop.
- **What this unlocks:** Shop actions are now map-native, mobile-first, and always accessible. Enables customer decision loop and navigation flow hardening.
- **Best next pass:** Pass 180 — Customer decision loop (map-driven bid/action).

## Pass 80 — OperatingRegionsSection Hook Extraction (2026-03-23)

- `OperatingRegionsSection.tsx` (476 lines) refactored: extracted `useOperatingRegionsCoverage` hook (348 lines) containing all coverage state management, map view control, shop selection, geolocation, ZIP search, and direction-launching logic. Component reduced to 175 lines — pure JSX rendering via `coverage.*` access pattern. Clean single-responsibility split: hook = data/domain logic, component = rendering.

## Pass 79 — Sonnet Audit + InsurerNewClaimScreen Fix (2026-03-23)

- Audited Sonnet's autopilot passes 73–78. Found incomplete extraction on `InsurerNewClaimScreen.tsx` — orphaned inline modal JSX broke the build. Removed the orphaned code (477 → 362 lines). `InsurerNewClaimForm.tsx` (created by Sonnet) now sole owner of the claim form. Also fixed two type errors left behind: added `"login"` to `LoginView` type union, and relaxed `ShopDirectoryRoutePanel.routeSummary` from `IntelligenceSummary` to `{ title; description }` since `callouts` was never used.

## Pass 78 — ShopOnboarding Extraction (2026-03-23)

- `ShopOnboarding.tsx` (484 lines) split into 5 files: `ShopOnboardingStep1–Step4` (each 76–148 lines) + the refactored orchestrator (115 lines). Each step is a standalone presentational component receiving `formData`, `onUpdate`, and navigation callbacks. Static options and helpers moved to the files that own them.

## Pass 77 — ShopDirectoryScreen Extraction (2026-03-23)

- `ShopDirectoryScreen.tsx` (489 lines) split: extracted `ShopDirectoryListBody` (168 lines) containing the entire scrollable sidebar list body. Screen reduced to 339 lines. Session object passed as single prop to minimize prop drilling while keeping the extraction clean.

## Pass 76 — LoginModal Extraction (2026-03-23)

- `LoginModal.tsx` (484 lines) split into 4 files: `LoginMainView` (87), `LoginSignupView` (185), `LoginLoginView` (160), and the refactored `LoginModal` (134 lines). Modal is now a thin wrapper + conditional renderer with no inline form JSX.

## Pass 75 — Admin Hook Extraction (2026-03-23)

- `useAdminActions.ts` (490 lines) extracted into 3 files: `useAdminAccountStatuses`, `useAdminRoleManagement`, and the refactored `useAdminActions` (367 lines). Single-responsibility hooks, no consumer changes.

## Pass 73–74 — Landing Page Visual Hierarchy (2026-03-23)

- **Pass 73**: `LandingPageHeader` — logo de-weighted from `bd-glass-control` to transparent hover. Nav links downgraded to `bd-glass-control--utility`. Login given secondary treatment. Dashboard button duplicates consolidated.
- **Pass 74**: `HeroSection` — CTA hierarchy restored: "Get Started" primary, "Learn More" secondary. Full-width CTAs on mobile (`w-full sm:w-auto`). Carousel container height increased to prevent text clip.
- 2 files touched. Build: 1.61s, 0 errors. Spellcheck: 0 all passes.

## Pass 70–72 — Production Polish + Dashboard Density (2026-03-23)

- **Pass 70**: Page title "Full_DEMO" → "BidOnDent — Compare Auto Body Repair Bids". Added meta description + OG tags.
- **Pass 71**: HomeScreen 483→249 lines. Extracted `HomeScreenSections.tsx` (OnboardingCard, ReportsList, Sidebar). Architecture in compliance.
- **Pass 72**: Mobile stat cards compact (2-col grid, smaller sizing). Dashboard content padding tightened on mobile. Badges hidden on mobile for cleaner layout.
- 4 files touched total. Build: 2439 modules, 1.75s, 0 errors at all passes.

## Pass 69 — Customer Dashboard Empty-State Polish (2026-03-23)

- New customers see "How BidOnDent Works" 3-step onboarding card instead of four zero-value stat cards
- Context-aware welcome greeting (first visit vs returning)
- Empty reports section redesigned: centered, icon, descriptive copy, inline CTA
- Returning users with data still see full stats grid and activity feed
- 1 file touched: HomeScreen.tsx (421→483 lines). Build: 1.68s, 0 errors.

## Pass 68 — Safari Blank White Screen Fix (2026-03-23)

- Safari reload produced blank white screen — Clerk SDK or session sync stalls before React mounts
- Added pre-mount loading indicator in `index.html` — spinner visible before JS executes
- Added 10s timeout recovery in HTML: "Tap to reload" link if JS never mounts
- Enhanced `AppLoading.tsx` with 8s timeout: shows "Tap to reload" if loading gate stays blocked
- Two-layer defense: HTML pre-mount (covers JS stall) + React AppLoading (covers async gate stall)
- 2 files touched. Build: 1.70s, 2438 modules, 0 errors.

## Pass 67 — Header Button Sizing (2026-03-23)

- User feedback: landing page header nav buttons oversized/chunky
- `bd-glass-control` CSS: `padding: 0.75em 2.2em` → `0.5em 1.6em`, `font-size: 1.08rem` → `0.92rem`
- Applies globally to all glass nav buttons (Header, map overlays)
- 1 file touched: theme.css. Build: 1.70s, 0 errors.

## Pass 66 — Bottom Sheet Peek Optimization (2026-03-23)

- Peek snap reduced from 120px to 90px (just drag handle + view tabs, no dead space)
- Half snap reduced from 45% to 40% — more map visible when browsing content
- Map = primary surface rule strengthened: bottom sheet eats less map viewport
- 1 file touched: MobileMapBottomSheet.tsx
- Build: 1.71s, 2437 modules, 0 errors. Spellcheck: 0.

## Pass 64/65 — Dialog Close Fix + Planner Compaction (2026-03-23)

- **P1-RUNTIME FIX**: Dialog X close button was non-functional due to z-index stacking context trap
  - Root cause: Dialog at z-50 creates stacking context; MobileMapBottomSheet Portal at z-[610] renders above it in document root stacking context
  - Fix: Portal-based close button via `createPortal(button, document.body)` at z-[700] — escapes dialog stacking context entirely
  - Default Radix close button hidden via `[&>button:last-child]:hidden`
- **P4-UX**: Active nav dialog chrome (padding, map height) pushed from md to xl — matches browse mode
- **P4-UX**: Dialog close button restyled as floating glass button (rounded-full, backdrop-blur, shadow)
- **P4-UX**: Navigation planner compacted for mobile bottom sheet:
  - "Route Planner" header + badge hidden below xl
  - "Navigation shell" info card hidden below xl
  - "Tip" text hidden below xl
  - Route status description hidden below xl (keep title + Start Route button)
- 5 files touched: CoverageMapDialog.tsx, dialog.tsx, CoverageNavigationPlanner.tsx, PlannerVoiceGpsSettings.tsx, PlannerRoutePreview.tsx
- Build: 1.82s, 2437 modules, 0 errors. Spellcheck: 0.

## Pass 63 — Browse Mode Map-First (2026-03-23)

- All desktop chrome (header, shell background, border, shadow, padding) pushed from md (768px) to xl (1280px)
- Below 1280px, browse mode is now full-bleed map + bottom sheet only — no dashboard chrome
- Tile mode and map utility controls (Center/Reset) hidden below xl — map chrome belongs on desktop sidebar, not mobile sheet
- Map stays 100dvh below xl (no 74vh shrink until desktop)
- Eliminates the "website settings page" feel on tablet viewports (768-1280px)
- 2 files touched: CoverageBrowseExperience.tsx, CoverageBrowseSidebarContent.tsx
- Build: 1.86s, 2437 modules, 0 errors. Spellcheck: 0.

## Pass 62 — ActionRail Mobile Refinement (2026-03-23)

- ActionRail repositioned from horizontal bottom (conflicting with SummarySheet) to vertical right-side at all breakpoints
- Follows Apple Maps / Google Maps pattern: action buttons float on the right edge of the map
- Eliminates bottom-stacking z-index conflict between ActionRail and SummarySheet on mobile
- Buttons remain h-12 w-12 on mobile, h-14 w-14 on md+
- 1 file touched: NavigationActionRail.tsx
- Build: 1.93s, 2437 modules, 0 errors. Spellcheck: 0.

## Pass 18 — Future Map Identity + Atmosphere Governance Alignment (2026-03-22)

### Future Direction: Product-Owned Map Identity, Blue System, and Atmosphere

- The final BidOnDent map product is planned to feel **product-owned, premium, and BidOnDent-native** — not a macOS clone, not generic SaaS, not pasted Apple UI.
- The blue system is a future semantic hierarchy: deep royal blue for primary identity and controls, lighter sky/baby blue for atmosphere and guidance, dark ocean/navy blue for depth and night, gray-blue for subdued/inactive/low-noise UI. Blue should behave like **light through glass**, not paint on controls.
- The map should feel like a **living world**: more depth, atmosphere, layered transparency, liquid glass overlays, and “surface floating above geography.”
- Future immersion direction: richer world feel, environmental depth, spatial layering, and better blending between map and UI. True 3D/world rendering is **aspirational only** and depends on future provider/platform decisions.
- **Day/night guidance mode switching** is a planned, not implemented, feature. Any future implementation must respect provider stack, real capability boundaries, and user override/settings.
- Controls should feel tactile, soft, layered, calm, and premium — not loud, harsh, over-glossed, or like desktop window chrome. Controls should float above the world, not feel like toolbar buttons.
- Glass/material direction: target is breathable, warm, softly illuminated, transparent/translucent — not over-solidified, painted, cold, or aggressively glossy.
- The future map experience should be more emotional and trustworthy: calm, guided, breathable, confident, premium, friendly, and trustworthy — not cold, flat, generic, or overly technical.

All of the above is **future direction** and not yet implemented unless otherwise stated in the tracker.

# BidOnDent Map Master Plan (2026-03-21)

Last updated: March 23, 2026  
Owner: Product + Engineering  
Status: Active strategic source of truth

## Companion Documents

This plan should be read alongside:

- `docs/BIDONDENT_PRODUCT_BRAIN.md` — overall product architecture, role model, and design system direction
- `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md` — granular delivery history and active risks
- `docs/PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md` — architecture truth table and module plan

Any map decision should cross-check all four docs to avoid contradictions.

## Mission

Deliver a production-grade, map-first BidOnDent experience that is:

- trustworthy (real provider-backed behavior in production paths),
- resilient (clear fallback and error visibility),
- premium (intentional UI motion/clarity across desktop and mobile),
- and maintainable (cleanly separated map domains and documentation discipline).

## Non-Negotiables (Humans + AI)

1. Supabase is source of truth for report, vehicle, profile, and user-linked persistence.
2. localStorage is cache/recovery only and must never silently override cloud truth.
3. Real providers are required for routing/place/search in production user paths.
4. Demo map data must remain clearly labeled and isolated to demo-only paths.
5. Every map-related change must update both map docs in the same change set:
   - `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
   - `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`
6. Every map UI pass must be validated on both mobile and desktop.
7. No map-facing silent failures: telemetry, fallback state, and user messaging must stay explicit.

8. Navigation session persistence is now Supabase-backed: all navigation session state is stored in the `navigation_sessions` table in Supabase. localStorage is used only as a cache/recovery layer and never overrides cloud truth. Session state is hydrated from Supabase on boot and saved to Supabase on update. Cross-device continuity is now real. See "Cloud Navigation Persistence" card in Product Brain for full detail.

## 2026-03-22: Map Overlay Intelligence Enrichment (Pass 18)

- **Scope:** ShopDirectoryMapOverlays now computes and displays real navigation intelligence: live distance, ETA, and session state, using actual Place and ShopMapListing coordinates. Overlay logic is session-aware, with edge case handling for missing/incomplete data. No visual or design system changes; overlays only enriched with real metrics.
- **Validation:** Build clean, spellcheck clean, diagnostics clean. Overlays validated for both mobile and desktop. No errors found.
- **Docs:** This change is documented in both the Master Plan and Tracker as required.

8. Avoid coupling UI components to provider/network contracts; use typed services/hooks.

## 2026-03-23: Navigation Session Cloud Sync (Pass 19)

- **Scope:** Navigation session state is now persisted in Supabase (`navigation_sessions` table) with localStorage as cache. Session state is hydrated from Supabase on boot and saved to Supabase on update. Cross-device continuity is now real. No UI or unrelated code changed. All changes are minimal and scoped.
- **Validation:** Build clean, spellcheck clean, diagnostics clean. Session persistence verified after reload and across devices. No errors found.
- **Docs:** This change is documented in both the Master Plan and Tracker as required.

## Architecture Direction

### Map domain boundaries

- `services/navigation/*` owns provider IO, telemetry, sanitization, and summary contracts.
- `hooks/*` owns orchestration/state composition for map workflows.
- `components/maps/*` owns presentation and interaction surfaces.
- Diagnostic check modules stay deterministic and dependency-light.

### Trust as product feature

Map reliability is not hidden infrastructure. It is a user-facing quality signal.

- Provider health and map performance telemetry are first-class.
- Combined trust state (`idle/healthy/watch/degraded`) must remain explainable.
- Confidence scoring and trend hints are acceptable only when derived from canonical summary contracts.

### Data truth model

- Production map discovery/routing/search must prefer real providers.
- Demo fallback entries can exist only behind explicit demo mode gating.
- Placeholder coordinates are allowed only for deterministic continuity in demo/manual records.

## Delivery Themes (Current Program)

### Theme 1: Reliability and diagnostics

- Harden telemetry ingestion and local-cache self-healing.
- Enforce versioned persisted-state parsing and normalization on startup so stale or malformed browser payloads cannot crash hydration.
- Keep summary generation deterministic and low overhead.
- Expose lightweight dev-only check entry points for confidence in refactors.
- GPS degradation detection and graceful degradation (delivered 2026-03-22 via `NavigationErrorBoundary`).
- Speed-limit unavailable state handling (delivered 2026-03-22).

### Theme 2: Explainable trust UI

- Keep planner trust status fast to scan.
- Surface risk reason tags and at-risk provider context.
- Surface explicit stale-telemetry refresh guidance so trust warnings stay actionable.
- Keep confidence-trend and route-alternative messaging backed by deterministic helper logic and checks.
- Preserve meaningful confidence trend signaling without noise.

### Theme 3: Real discovery and routing integrity

- Prevent demo leakage into production results.
- Preserve route-launch continuity from searchable shop surfaces.
- Track discovery quality filtering outcomes with measurable counters so false-positive pressure is visible.
- Keep discovery telemetry readable in category-mix ratios so quality tuning decisions are role-aware.
- Keep provider fallback behavior explicit to users.

### Theme 4: Quality of interaction

- Maintain smooth UI transitions and clear visual hierarchy.
- Keep the expanded command-center map search-first: reduce concurrent panel noise, prioritize route origin/search actions, and use progressive disclosure for secondary controls.
- Keep desktop expanded-map presentation in a cohesive macOS-style app shell (single aligned action rail, single route summary card, and consistent button rhythm).
- Keep small-screen readability/tap-target comfort at parity with desktop quality.
- Keep diagnostics trust surfaces readable at small breakpoints so risk triage remains fast on mobile.
- Honor reduced-motion behavior for animated map controls.

### Theme 5: Visual language, blue system, and motion system

- The BidOnDent map product must feel **product-owned** and not a macOS clone or generic SaaS map UI.
- The visual identity is **royal-blue-first**: royal blue is the primary identity, route, and action color; baby/light blue for air/sky/calm; deep ocean blue for depth/premium/spatial confidence; gray-blue/navy for night/dark mode.
- Map surfaces, overlays, and controls must use the blue system intentionally for meaning, not just decoration.
- The map should feel like a **branded geographic world**: the sky, water, route, and overlays all belong to BidOnDent, not a third-party tile with branding on top.
- **Day/night guidance mode**: The future map experience will support automatic day/night visual switching based on local time or route context, similar to premium navigation products. This is a planned feature, not yet implemented. Day mode is lighter, breathable, and sky-driven; night mode is calm, navy, low-glare, and guidance-first.
- All map design and product decisions must reinforce this blue system and day/night awareness, and avoid desktop window clones or generic map UI patterns.
- Use in-map overlays (not only side panels) for key route/search actions so map context stays visible while users act.
- Keep attribution legally compliant while presenting branded map identity (BidOnDent map badge + provider attribution clarity).
- Make animation quality a first-class acceptance item: layered entry timing, subtle floating glass motion, and deterministic reduced-motion fallback.
- Continue evolving toward search-first, fewer-button, gesture-friendly interaction flows over time without removing desktop discoverability.

### Theme 6: Site-wide design expansion and dashboard map surfaces

- The royal-blue glass design language proven on map surfaces should extend to dashboard shells, landing pages, and role-specific experiences following the staged adoption plan in the Product Brain.
- Dashboard map widgets should follow CarPlay-style principles: compact, glanceable, always-visible, live-updating — not hidden behind full-screen dialogs.
- Each account type (customer, shop, insurer) should eventually have a role-specific compact map widget on their dashboard showing contextually relevant geographic information (nearest shops, incoming requests, claims density).
- `DashboardCoveragePanel.tsx` already proves the embedded map pattern works — future work builds on this foundation.
- Map design decisions (palette, animation, glass treatment) should remain consistent whether the map appears as a full-screen command center or a compact dashboard widget.
- Current integration barrier is high for most non-map surfaces (they use separate Tailwind-only styling with no map token consumption). Stage 1 preparation (global design tokens in `theme.css`) must come before component adoption.

## Future Direction Themes

The themes above (1–6) describe the current program. The themes below describe future evolution that is documented but not yet in active development. Each theme follows the consistent 6-part structure: Current State → Productizing → Aspirational → Prerequisites → UI/UX Evolution → Non-goals. The Product Brain contains the full detail — this plan captures strategic direction.

### Future Theme A: Navigation productization

**1. Current State (Pass 92):** GPS, turn-by-turn, speed HUD, and voice all work and are production-quality. Graceful degradation for GPS loss delivered (Pass 68). Deviation detection with reroute prompt delivered. Cloud sync via Supabase delivered (Pass 19). Error boundary around navigation components delivered (`NavigationErrorBoundary`). Circuit breaker for OSRM delivered (3-fail open, 90s cooldown). Session retry resilience delivered (exponential backoff). Voice alerts with mode-aware dispatch delivered. Consumer copy cleaned across all map surfaces (Passes 87–92). Dev diagnostics gated behind `import.meta.env.DEV` (Pass 91).

**2. Productizing Stage (mostly delivered):** ~~Graceful degradation for GPS loss~~ Done. ~~Deviation detection with reroute prompt~~ Done. ~~Error telemetry~~ Done. Remaining: network error recovery UI, cross-browser voice edge cases.

**3. Aspirational Stage:** User-facing settings UI (voice picker, speed unit, volume). ~~Cloud sync via Supabase~~ Done. Automatic rerouting (currently user-confirmed). ETA updates during active navigation. Marketplace-aware routing to partner shops. Offline caching. Provider abstraction.

**4. Technical Prerequisites (mostly delivered):** ~~Supabase `navigation_sessions` table~~ Done. `navigation_preferences` table not yet created. ~~Error boundary around navigation components~~ Done. ~~Deviation calculation utility~~ Done. Browser compatibility matrix for Web Speech API (informal, not formalized).

**5. UI/UX Evolution Path:** (1) Now → functional panel with no error states. (2) After productizing → same panel with visible warnings for degraded conditions. (3) After aspirational → settings drawer, live ETA, auto-reroute, shop info cards at route end.

**6. Non-goals:** Do not migrate away from OSRM/Nominatim/Overpass preemptively. Do not build multi-stop routing before single-route reliability is production-grade. Do not add CarPlay/Android Auto before web navigation is polished.

**Cross-doc reference:** Product Brain "Navigation Productization Roadmap" has the full structured breakdown.

### Future Theme B: Marketplace-specific map intelligence

**1. Current State:** Customer role has a compact nearest-shops widget (`CustomerMapWidget`) delivered March 2026 showing 5 nearest shops with distance + rating, expandable to full CoverageMapDialog. Shop and insurer roles have placeholder widgets (`ShopMapWidget`, `InsurerMapWidget`) with structure-only stats. No geo-coded report data, no service area boundaries, no claims analytics.

**2. Productizing Stage:**

- **Customer:** Nearest partner shops widget (data already available via `useCoveragePartnerShops()`)
- **Shop:** Service area boundary visualization (requires `shop_service_areas` table)
- **Insurer:** Network coverage map with capacity/rating overlays

**3. Aspirational Stage:**

- **Customer:** Smart shop recommendation routing with distance/rating/wait-time weighting
- **Shop:** Incoming request heatmaps, customer proximity alerts, competitor overlays
- **Insurer:** Claims density analysis, coverage gap detection, optimal claim-to-shop assignment

**4. Technical Prerequisites:** Supabase schema extensions — `report_locations` (geo-indexed), `shop_service_areas` (polygons/radius), `shop_availability` (real-time capacity), `claim_assignments` (geographic context). Real-time subscriptions for live update surfaces.

**5. UI/UX Evolution Path:** (1) Now → shared coverage map for all roles. (2) After productizing → role-specific compact dashboard widgets showing contextually relevant data. (3) After aspirational → each role has a purpose-built map intelligence surface with interactive drill-down.

**6. Non-goals:** Do not build heatmap/clustering infrastructure before underlying Supabase tables exist. Do not show fabricated intelligence — display "not enough data" when data is missing. Do not build shop-to-shop messaging or technician dispatch through the map.

**Cross-doc reference:** Product Brain "Role-Specific Future Map Intelligence" has per-role structured plans.

### Future Theme C: Provider evolution

**1. Current State:** Leaflet (rendering) + OSRM public (routing) + Nominatim (geocoding) + Overpass (speed limits). All free-tier, all functional at current scale. No rate limit issues observed.

**2. Productizing Stage:** No provider changes needed. Focus on reliability within the current stack (error handling, fallbacks, graceful degradation). Document the browser compatibility matrix.

**3. Aspirational Stage:** Evaluate commercial providers only when triggered:

| Trigger                   | Candidate Provider                  | Feature Unlocked                      |
| ------------------------- | ----------------------------------- | ------------------------------------- |
| Globe rendering required  | Mapbox GL or MapLibre GL            | 3D globe, smooth zoom, vector tiles   |
| Free-tier rate limits hit | Self-hosted OSRM, Mapbox Directions | Reliable routing at scale             |
| Traffic data needed       | Google Directions API, TomTom       | Real-time traffic-aware routing       |
| Offline maps needed       | MapLibre + PMTiles                  | Offline tile packs, zero-network maps |

**4. Technical Prerequisites:** Provider abstraction layer (build when first migration is justified, not before). Self-hosted alternatives evaluated before commercial APIs. Budget approval for per-request costs.

**5. UI/UX Evolution Path:** (1) Now → Leaflet tiles with OpenStreetMap. (2) After vector tile migration → smoother zoom, rotatable maps, 3D terrain. (3) After traffic integration → real-time congestion overlay on routes. No visual change should be user-breaking.

**6. Non-goals:** Do not migrate providers for aesthetic reasons. Do not build the provider abstraction layer preemptively. Do not commit to commercial providers without usage data justifying the cost.

### Future Theme D: Documentation-system maturity

**1. Current State:** Four strategic docs with cross-references and shared three-tier vocabulary. Docs are maintained by human + AI pair. Cross-doc consistency verified in audits.

**2. Productizing Stage:** Ensure every major future direction across all docs uses the consistent 6-part structure (this pass). Ensure every doc explicitly names which other docs to check for related content.

**3. Aspirational Stage:** Docs function as an execution-ready operating system — any new engineer or AI agent can read the four docs and know exactly what exists, what's next, what's not built, and why.

**4. Technical Prerequisites:** None — this is process discipline, not infrastructure.

**5. UI/UX Evolution Path:** N/A — these are internal docs.

**6. Non-goals:** Do not create additional docs for sub-features. Keep the doc count at four. Add sections to existing docs rather than spawning new files.

### Future Theme E: Mobile-first map experience

**1. Current State (Pass 22):** Mobile map surfaces now use edge-to-edge full-bleed layout — no rounded shells, no side margins, no min-height overflow on short viewports. Floating navigation overlays (maneuver card, bottom HUD) now render on mobile, not hidden behind `lg:` breakpoints. CoverageMapDialog is full-viewport on mobile. ShopDirectoryScreen removes framed container on mobile. Desktop richness is preserved via responsive `md:`/`lg:` breakpoints.

**2. Productizing Stage:** Bottom-sheet / drawer pattern for shop listings on mobile (swipe up from bottom). Compact floating controls sized for thumb reach. Gesture-friendly map interactions (pinch, swipe). Pull-to-refresh for discovery results. Safe-area-insets support for notched phones.

**3. Aspirational Stage:** Native-feeling mobile navigation with haptic feedback (vibration API). Progressive web app (PWA) with offline map tile cache. Lock-screen widget showing active navigation. Voice-first interaction mode on mobile (activate/pause/end by voice).

**4. Technical Prerequisites:** Bottom-sheet component (Radix or custom with `@use-gesture`). Touch event handlers separate from pointer events. Viewport height handling (`dvh` units where supported). PWA manifest and service worker for offline support.

**5. UI/UX Evolution Path:** (1) Now → responsive layout, floating controls visible on all sizes. (2) After productizing → swipe-friendly bottom sheets, thumb-zone-optimized controls. (3) After aspirational → PWA install, offline maps, haptics, voice-first.

**6. Non-goals:** Do not build a separate mobile-only codebase. Do not strip desktop features to simplify mobile. Do not attempt native app compilation (React Native, Capacitor) before web mobile is polished.

### Future Theme F: Globe / world mode honesty

**1. Current State:** Leaflet renders flat 2D Mercator tiles. There is no globe, 3D terrain, or world-mode rendering. Attempting to fake globe behavior with Leaflet CSS transforms would create a fragile, misleading experience.

**2. Productizing Stage:** No globe mode. Focus on polishing the 2D map experience — smooth tile transitions, proper zoom constraints, attribution clarity, and high-quality tile sources.

**3. Aspirational Stage:** True globe rendering requires a WebGL-based map renderer:

| Option          | Globe Support | Licensing   | Notes                                             |
| --------------- | ------------- | ----------- | ------------------------------------------------- |
| MapLibre GL JS  | Yes (native)  | BSD-3       | Free, open source, community maintained           |
| Mapbox GL JS v3 | Yes (native)  | Proprietary | Requires Mapbox API key; per-request pricing      |
| CesiumJS        | Yes (3D)      | Apache 2.0  | Full 3D globe; heavy bundle; overkill for 2D nav  |
| deck.gl         | Yes (layer)   | MIT         | Data visualization layer; not a full map renderer |

**4. Technical Prerequisites:** Provider abstraction layer (build only when migration is justified). WebGL support detection with graceful fallback to 2D. Performance budget for mobile devices with limited GPU.

**5. UI/UX Evolution Path:** (1) Now → flat 2D tiles, no globe. (2) After vector tiles (MapLibre) → smooth vector rendering, rotation, pitch. (3) After globe → seamless zoom from world view to street level. No forced transitions — users who prefer flat 2D should always have that option.

**6. Non-goals:** Do not fake globe with CSS transforms on Leaflet. Do not add 3D terrain before the core navigation experience is production-grade. Do not commit to Mapbox GL pricing without usage data. Do not present globe mode as "coming soon" until a renderer migration is underway.

## Definition Of Done For Any Map Change

1. Build passes.
2. Persistence and reload behavior verified for touched flows.
3. Mobile and desktop behavior verified for touched UI.
4. Trust/fallback behavior verified when provider or performance signals degrade.
5. Both map docs updated with concise, non-duplicative entries.

6. For navigation session changes: Supabase is the source of truth for session state; localStorage is cache only. Session state must persist across reloads and devices. Cloud sync logic must be covered by tests and documented in both map docs and the Product Brain.

## Documentation Discipline

- Keep this master plan stable, strategic, and short-lived only by decision changes.
- Put granular delivery notes in the tracker.
- Retire stale map plans instead of keeping parallel "active" master docs.

## Pass 178 — Map-first overlays, dashboard bugfixes, mobile fix (2026-03-24)

**Status:** Complete

**Summary:**

- HomeScreen refactored for map-first overlays, floating panels
- DashboardHeader/logo micro-fix, removed blocky blue background
- Mobile loading bug and report marker tap-to-open fixed
- Strict verification and doc update

**Files touched:** src/app/components/codelayer/HomeScreen.tsx, src/app/components/maps/MapReportMarkers.tsx, src/app/components/dashboard/DashboardHeader.tsx

**Validation:** Build 1.81s, 0 errors. Diagnostics: 0. Spellcheck: 0.

---

## Pass 179 — Shop loop completion (spatial shop actions, map-driven shop bid/accept) (2026-03-24)

**Status:** In progress

**Summary:**

- Begin spatial shop action loop: map-driven shop bid/accept, shop overlays, and action flows
- Next: Complete customer decision loop, navigation/back flow hardening, doc/README realignment

**Files touched:** (pending)

**Validation:** (pending)

---
