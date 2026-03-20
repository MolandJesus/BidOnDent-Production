# Platform Refactor Backlog - March 20, 2026

## Purpose

This backlog now follows the Phase 1 architecture audit.

Primary source docs:

- `docs/PHASE_1_PLATFORM_ARCHITECTURE_AUDIT_2026-03-20.md`
- `docs/CODE_ORGANIZATION_AUDIT.md`
- `docs/PRODUCTION_READINESS_AUDIT_2026-03-20.md`

## Verified Current Baseline

- Public landing pages render before Clerk session hydration completes.
- The dashboard bell opens a real notification panel.
- Coverage map code is reusable across landing and dashboard.
- Report IDs now remain string-safe through selection/detail routing.
- Missing or stale report selection now fails with a user-facing fallback state instead of a white screen.
- Customer report persistence and shop bid submission both hit real backend routes.
- No `.ts/.tsx/.js/.jsx` files in `src/` or `supabase/` exceed 500 lines.

## Reality Check

These are **not** fully live yet:

- true globe rendering
- turn-by-turn navigation
- voice guidance
- current speed / speed-limit UI
- navigation session memory
- fully truthful shop and insurer operational flows
- requested temporary relaxed admin-access model

## Now

### Architecture / cleanup

1. Tighten `ViewMode` and router typing so screen ownership is explicit.
2. Normalize report/bid/claim view models instead of repeating per-screen adapters.
3. Reduce duplicate notification ownership between bell and profile dropdown.
4. Replace seeded default notifications with honest empty/live states.
5. Add dedicated local-memory contracts for:
   - last visited app location
   - map search state
   - future directions session state

### Map / coverage

1. Extract landing/dashboard coverage search state into a shared hook.
2. Split the current map into:
   - operational embedded map
   - immersive fullscreen map
3. Remove or quarantine the current faux orbital mode until a truthful globe path is implemented.
4. Redesign midnight mode so it feels branded and premium rather than generic dark tiles.

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

## Docs Under Retirement Review

These are historical context, not current architecture truth:

- `docs/FIXES_APPLIED.md`
- `docs/IDENTIFIED_ISSUES.md`
- `docs/PROJECT_COMPLETION_SUMMARY.md`
- `docs/PROJECT_STATUS.md`
- `docs/COMPREHENSIVE_TEST_PLAN.md`
- `docs/CROSS_ACCOUNT_TESTING_PLAN.md`
