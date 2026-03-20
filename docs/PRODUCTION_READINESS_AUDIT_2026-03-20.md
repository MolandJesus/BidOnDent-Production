# Production Readiness Audit - March 20, 2026

## Executive Summary

This audit focused on the gap between the current Clerk-based application architecture and the older Supabase-auth assumptions still present in the codebase.

The highest-risk production issues found were:

- customer reports could silently fail to persist because the frontend sent the wrong Clerk field name,
- shared cross-account views were still mixing live data with static/demo bid data,
- profile image and account edits were not being reliably persisted through Clerk metadata,
- the production Supabase project was missing multiple intake/workflow tables expected by the frontend,
- the remote `bids` table was not Clerk-compatible.

The highest-value fixes from this pass are now implemented and deployed.

## What Is Now Live

### App-level persistence

- Customer report submission now saves through Clerk-aware edge functions with the correct `clerkUserId` payload.
- Customer/shop/insurer report loading now uses Clerk-aware edge reads instead of relying on `supabase.auth.getUser()`.
- Report loads now include nested bid data, allowing counts and bid details to flow through the customer, shop, and insurer UI.
- The app now extracts bid data from reports and stores it in shared local state.
- Logged-in users now refresh cloud data on a 15-second interval, which improves cross-account visibility without requiring a full page reload.

### Account/profile persistence

- Account/profile saves now persist name, phone, and profile image through Clerk metadata.
- Clerk sync no longer wipes the saved profile image back to an empty string.
- Dashboard and landing layouts now prefer the persisted profile image instead of only Clerk's default image URL.
- Email editing is now visually locked in the profile modal to avoid pretending that unsupported email edits are saved.

### Shared bid workflow

- Shops can now submit bids through a real backend route instead of local-only state.
- Customer bid screens now render live bid data from the current report set instead of hardcoded example bids.
- Customer report detail pages now render live bid cards from the report data instead of mock shop cards.
- Shop and insurer summary views now derive counts from current report/bid data instead of hardcoded placeholder metrics.

### Coverage map and discovery UX

- The home coverage experience now uses extracted reusable map modules instead of a single landing-page-only implementation.
- The map now recenters correctly after ZIP/location changes by driving the live Leaflet instance directly.
- Coverage users can switch between roadmap, satellite, and midnight view and open the map in a fullscreen command-center dialog.
- The fullscreen dialog now has a zoom-aware orbital presentation layer, so the most cinematic map treatment is reserved for fullscreen exploration instead of slowing the inline functional maps.
- Approximate ZIP coverage preview and strict nearby-shop routing are now separated, so the UI stays informative without overstating precision.
- The dashboard now exposes the reusable coverage command center through its home screen instead of trapping map access on the landing page only.

### Notification UX

- The dashboard bell now opens a real notification center instead of acting as a visual-only icon.
- Notification clicks now mark alerts as read and route users into the relevant dashboard area for their account type.
- Shared notification state is now updated through app-level helpers instead of being handled only inside a local dropdown view.

### Startup and dashboard performance

- Public visitors no longer wait on Clerk session hydration before the landing site renders.
- The app shell now lazy-loads dashboard, onboarding, and secondary legal pages, reducing the initial main bundle and removing the build warning about oversized first-load chunks from the primary public path.
- Broad post-hydration customer autosave loops were removed so cloud hydration no longer triggers redundant writes for every loaded report and vehicle.
- Shop and insurer home dashboards now render from real report inputs rather than seeded placeholder report data.

### Supabase edge/backend rollout

- Deployed updated `server` edge function to project `wmdcnjgtsppftrofaqqa`.
- Added live `POST /bids` edge route for Clerk-backed bid creation.
- Added live `GET /bids` edge route for report/shop bid reads.
- Updated `GET /reports` edge route to include related bids.
- Extended database initialization to create/repair:
  - `bids`
  - `public_partner_shops`
  - `shop_interest_submissions`
  - `insurer_interest_submissions`
  - `platform_activity_events`
  - `job_assignments`
- Extended `bids` table shape to support:
  - `clerk_shop_user_id`
  - `shop_name`
  - `shop_email`
  - `shop_rating`
  - `shop_reviews`
  - `shop_distance`
  - `notes`
  - nullable `shop_user_id` for Clerk-only bid submissions

## Jeffrey Request Coverage Update

### Now materially improved

- Shop signup intake flow
  - The missing intake tables now exist remotely, so the landing page intake forms have a real backend target.
- Clarify what happens after report submission and bid events
  - Shared report/bid data is now wired through customer, shop, and insurer views much more directly.
- Database activity for submissions, acceptances, bids, cost
  - The missing activity/intake tables now exist; bid persistence is now real rather than UI-only.
- Shop account should show actual jobs/requests
  - Shop requests now depend on live report data plus live bid submission, not just placeholder state.
- Documentation
  - This audit supplements the Jeffrey plan with production-readiness specifics and verified outcomes.

### Still partially complete

- True "100% live" interaction
  - Core data now refreshes on a timed polling cycle, but true secure real-time subscriptions are still blocked by the Clerk/Supabase auth split.
- Acceptances / scheduling / cost rollups
  - Event logging exists, but end-to-end job assignment and acceptance persistence is not yet fully wired through secure backend routes.

## Validation Performed

- `npm run build`
  - Passed after the new frontend and data-path changes.
- `supabase functions deploy server --project-ref wmdcnjgtsppftrofaqqa`
  - Passed.
- `GET /functions/v1/server/make-server-9f243523/health`
  - Returned `200` with version `2026-03-20-v9`.
- `POST /functions/v1/server/make-server-9f243523/migrate-database`
  - Returned `200` with `{"success":true,"message":"Database migration completed"}`.
- Remote schema checks
  - `bids.shop_name` exists
  - `bids.shop_email` exists
  - `bids.clerk_shop_user_id` exists
  - `shop_interest_submissions` exists
  - `insurer_interest_submissions` exists
  - `platform_activity_events` exists
  - `public_partner_shops` exists
  - `job_assignments` exists

## Cross-Account Interaction Matrix

- Customer submits report
  - Saved in `damage_reports` via Clerk-aware edge route.
  - Visible to shop and insurer marketplace report views.
- Shop submits bid
  - Saved in `bids` with `clerk_shop_user_id`.
  - Reflected in report bid counts and customer bid views.
- Customer views bids
  - Reads current report-linked bids, not static demo cards.
- Insurer views marketplace reports
  - Reads current report set, including nested bids where available.
- Account/profile updates
  - Saved to Clerk metadata and reflected in UI state.

## Remaining Production Blockers

1. Supabase realtime subscriptions are still not fully production-safe under Clerk-only auth.

- Current dropdown/realtime helpers still assume direct Supabase client subscriptions.
- Proper fix: issue Supabase-compatible JWTs for Clerk users or move live notifications to polling/SSE through secure server routes.

2. Account deletion still depends on Supabase auth session behavior.

- The delete-account flow still starts from `supabase.auth.getSession()`.
- In a pure Clerk session, this is not a complete production-safe deletion path.

3. Shop and insurer onboarding persistence is still incomplete.

- The onboarding screens exist, but the app does not yet use a full persisted onboarding state machine for those roles.

4. Admin intake operations are not fully migrated to secure backend routes.

- The admin intake panel still uses direct Supabase table reads/updates from the client.
- That should move behind admin-only edge routes before claiming full production readiness.

5. Legacy Supabase-auth service modules still exist.

- Some exported service modules still assume `supabase.auth.getUser()` and should be retired or rewritten to Clerk-aware routes.

6. Bundle size remains large.

- Build still warns about chunks above the current recommended size threshold.

7. Turn-by-turn navigation is not production-ready.

- Voice guidance, GPS turn-by-turn routing, live speed limits, and true car-navigation visuals are not implemented.
- Those require a dedicated routing/navigation provider and should not be faked on top of the current lightweight Leaflet coverage map.

## Recommended Next Sequence

1. Replace client-side realtime dependencies with secure polling/SSE for Clerk users.
2. Move admin intake review actions behind admin edge routes.
3. Rework account deletion to use a Clerk-first deletion path plus server-side cleanup.
4. Persist shop/insurer onboarding metadata and wire it to dashboard gating.
5. Finish converting legacy direct Supabase-auth services to Clerk-aware edge services.
