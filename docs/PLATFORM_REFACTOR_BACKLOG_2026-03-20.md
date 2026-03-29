# Platform Refactor Backlog - March 20, 2026

> **⚠️ HISTORICAL — SUPERSEDED (March 28, 2026)**
>
> This backlog was the active implementation tracker from March 20–21, 2026.
> It has been **superseded** by:
>
> - `docs/BIDONDENT_FINISHING_MASTER_PLAN.md` — active execution plan
> - `docs/CLAUDE_AI_MASTER_CONTEXT.md` — master context and tech debt tracking
> - `docs/CODE_ORGANIZATION_AUDIT.md` — active code structure audit
>
> Most items below have been completed or absorbed into the documents above.
> Do NOT use this file for active planning.

Last updated: March 28, 2026
Status: **RETIRED** — preserved for historical reference

## Purpose

This backlog now follows the Phase 1 architecture audit.

Primary source docs:

- `docs/PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md`
- `docs/PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md`
- `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
- `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`
- `docs/CODE_ORGANIZATION_AUDIT.md`
- `docs/PRODUCTION_READINESS_AUDIT_2026-03-20.md`

## Verified Current Baseline

- Public landing pages render before Clerk session hydration completes.
- The dashboard bell opens a real notification panel.
- Bell and profile notification surfaces now share one background-refreshed activity feed instead of booting separate live wrappers.
- Legacy seeded notification defaults are retired in favor of honest report/bid-derived snapshots.
- Coverage map code is reusable across landing and dashboard.
- Coverage search now remembers ZIP/radius/map mode/focused shop/preferred directions app locally across reloads.
- Coverage users can launch real turn-by-turn driving routes in Apple Maps, Google Maps, or Waze from partner-shop cards.
- The last external route handoff is now stored locally so the immersive command center can resume directions context after reload.
- The immersive command center now distinguishes between browse/setup mode and active route mode, with saved places, parked-car memory, guide cards, and active-only speed badges.
- Report IDs now remain string-safe through selection/detail routing.
- Missing or stale report selection now fails with a user-facing fallback state instead of a white screen.
- Customer report persistence and shop bid submission both hit real backend routes.
- No `.ts/.tsx/.js/.jsx` files in `src/` or `supabase/` exceed 500 lines.

## Reality Check

These are **not** fully production-finished yet:

- true globe rendering
- provider-backed real places catalog
- role-aware customer / insurer / shop fullscreen map surfaces
- provider-backed route geometry inside the BidOnDent map itself
- fully truthful shop and insurer operational flows
- requested temporary relaxed admin-access model

## Now

### Architecture / cleanup

1. Tighten `ViewMode` and router typing so screen ownership is explicit.
2. Normalize report/bid/claim view models instead of repeating per-screen adapters.
3. Reduce duplicate notification ownership between bell and profile dropdown.
4. Replace seeded default notifications with honest empty/live states.

### Map / coverage

1. ~~Extract landing/dashboard coverage search state into a shared hook.~~ (Complete — `useCoveragePartnerShops()` is shared.)
2. ~~Split immersive fullscreen map chrome into dedicated modules.~~ (Complete — command-center header, sidebar, and map overlay controls extracted.)
3. Split the current map into:
   - operational embedded map
   - immersive fullscreen map
4. Keep low-zoom immersive behavior honest: world overview is acceptable, fake globe is not.
5. ~~Redesign midnight mode so it feels branded and premium rather than generic dark tiles.~~ (Complete — navy-tinted dark mode with blue-glow glass.)
6. ~~Add selected-shop highlighting and route-launch affordances across landing and fullscreen map surfaces.~~ (Complete.)
7. Keep route-launch behavior honest: external navigation is live now, embedded navigation remains planned.
8. Keep browse-mode content BidOnDent-specific with nearby stores, guide cards, and saved-place shortcuts instead of generic filler. (In progress)

### Glass design system (Delivered 2026-03-22)

1. ~~Glass tokens and classes fully deployed~~ (`bd-glass-panel`, `bd-glass-card`, `bd-glass-badge`, `bd-glass-control`, `bd-glass-floating`).
2. ~~Unified hover standard `hover:bg-white/40` site-wide.~~
3. ~~Navy dark mode `#0c1929` with blue-tinted glass.~~
4. ~~Map zoom controls premium (pill, gradient, blur).~~

### Role truthfulness

1. Audit and remove synthetic display fields in shop requests where live data should exist.
2. Audit and reduce synthetic claim values in insurer screens.
3. Identify buttons that still look live but route to placeholders or no-op actions.

### Documentation

1. Treat the new Phase 1 audit as the architecture source of truth.
2. Retire stale docs only after their useful content is preserved.

## Next

### Navigation platform foundation

1. Create a dedicated navigation domain:
   - route models
   - navigation session state
   - local persistence
   - voice mode state
2. Create provider adapters for routing and immersive rendering.
3. Add route overview and turn list UI shells behind truthful capability boundaries.
4. Add mobile-portable location and guidance abstractions.
5. Add provider-backed real places/body-shop search and role-specific account overlays without forking the navigation foundation.
6. Treat true globe and lane-grade native navigation as explicit provider-decision work, not visual polish.

### Notification and activity

1. Move toward a single notification source of truth.
2. Replace direct client realtime dependence with Clerk-safe server-driven delivery or controlled polling/SSE.
3. Tie notifications more directly to actual report/bid/claim workflow events.

### Role workflows

1. Finish shop service-area eligibility and opportunity filtering.
2. Build insurer claim creation/review on top of persisted data instead of synthetic wrappers.
3. Simplify admin access and isolate admin policy behind one explicit gate.

## Later

### Provider-backed immersive map / navigation

Decision pending explicit approval because this can introduce cost/vendor lock-in.

Candidate directions:

- Mapbox path:
  - strongest match for globe + routing + future native navigation alignment
- MapLibre path:
  - strong web globe story with weaker native-navigation parity

### Premium map UX

1. Add a real fullscreen globe only in immersive mode.
2. Add branded royal-blue night mapping system.
3. Add route HUD, ETA summaries, and voice controls only when backed by real routing/navigation capability.

### Mobile portability

1. Design navigation logic for future mobile app portability.
2. Keep business logic separate from desktop-only presentation.
3. Preserve route/session/voice models so they can graduate to native later.

## Retired Docs

These older snapshots were retired on March 20, 2026 and should not be recreated as living status docs:

- `docs/FIXES_APPLIED.md`
- `docs/IDENTIFIED_ISSUES.md`
- `docs/PROJECT_COMPLETION_SUMMARY.md`
- `docs/PROJECT_STATUS.md`
- `docs/COMPREHENSIVE_TEST_PLAN.md`
- `docs/CROSS_ACCOUNT_TESTING_PLAN.md`
- `docs/BIDONDENT_NAVIGATION_REBUILD_MASTER_PLAN_2026-03-20.md`
- `docs/JEFFREY_REQUEST_IMPLEMENTATION_PLAN.md`

Use `docs/README.md` plus the dated audit/plan docs above instead.
