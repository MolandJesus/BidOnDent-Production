# BidOnDent Map Master Plan (2026-03-21)

Last updated: March 21, 2026  
Owner: Product + Engineering  
Status: Active strategic source of truth

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
8. Avoid coupling UI components to provider/network contracts; use typed services/hooks.

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
- Keep small-screen readability/tap-target comfort at parity with desktop quality.
- Keep diagnostics trust surfaces readable at small breakpoints so risk triage remains fast on mobile.
- Honor reduced-motion behavior for animated map controls.

## Definition Of Done For Any Map Change

1. Build passes.
2. Persistence and reload behavior verified for touched flows.
3. Mobile and desktop behavior verified for touched UI.
4. Trust/fallback behavior verified when provider or performance signals degrade.
5. Both map docs updated with concise, non-duplicative entries.

## Documentation Discipline

- Keep this master plan stable, strategic, and short-lived only by decision changes.
- Put granular delivery notes in the tracker.
- Retire stale map plans instead of keeping parallel "active" master docs.
