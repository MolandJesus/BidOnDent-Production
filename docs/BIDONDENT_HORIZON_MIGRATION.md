# BidOnDent Horizon Migration Record

Last updated: March 21, 2026

## Purpose

This document is the detailed migration record for moving the website work that accumulated on the Production+ line onto the Jeffrey future-updates line, then formalizing that line into a cleaner future-facing branch theme.

Chosen theme name:

- Product/version theme: BidOnDent Horizon
- Active development branch name: feature/bidondent-horizon
- Stable branch name: BidOnDent-Horizon-Stable

This naming keeps `main` clean, keeps the future stream clearly separated from production history, and gives the upcoming website-era platform work a consistent identity.

## Source And Target Baselines

- Original Jeffrey remote baseline: `origin/feature/jeffrey-future-updates` at `e9915cc8`
- Original main remote baseline: `origin/main` at `caca9563`
- Previous stable remote baseline: `origin/BidOnDent-Production-Stable` at `be07376f`
- Local migration starting point after replaying the stable-only commit: `2c70e1e0`

## Migration Result

The Production+ website work has been replayed onto the Jeffrey future-updates line locally.

Branch-level result compared against `origin/feature/jeffrey-future-updates`:

- 84 files changed
- 13,339 insertions
- 3,982 deletions

Structural result:

- New files added: 22
- Old files removed: 8
- Existing files modified: 54

## High-Level Change Themes

### 1. Product Direction And Documentation Expansion

- Added a full product-brain document for the website-era direction.
- Added a dedicated map experience architecture document.
- Reintroduced and expanded project status tracking.
- Updated getting-started and setup documentation to reflect the newer runtime and storage model.
- Added Continue/MCP configuration to support the newer workflow.

### 2. Provider-Agnostic Identity And Session Model

- Added provider-agnostic `websiteIdentity` support.
- Added stable `websiteUserKey` generation.
- Added session-level and persistent website memory.
- Extended nested memory to cover map/search/relationship state.
- Added sync adapters for website preferences and relationship collections.

### 3. Map-First Shop Discovery Experience

- Installed real map support via Leaflet and React Leaflet.
- Rebuilt the shop directory into a map-first desktop shell.
- Added a dedicated map pane component.
- Added map domain types and geospatial recommendation support.
- Preserved list-safe fallback behavior while upgrading the desktop experience.

### 4. Role-Aware Network And Directory Features

- Added live network directory hydration.
- Added business profile hooks and shared network profile services.
- Extended customer saved shops, shop watchlists, and insurer shortlists into a unified memory model.
- Updated partner-shop and competitor-analysis screens to use the shared relationship data.

### 5. Supabase Runtime Cleanup And Edge Refactor

- Added centralized frontend runtime helpers.
- Added admin runtime access.
- Added provider-agnostic profile, preference, network, and relationship handlers on the edge function side.
- Removed older legacy client/session helpers and the legacy Supabase auth layer.
- Added new migrations to support provider-agnostic website-era storage and relationships.

## Exact File-By-File Delta

The following list records every file changed against `origin/feature/jeffrey-future-updates`, including status and line-count delta.

### Added Files

- `A 35/0` `.continue/agents/new-config.yaml`
  Continue agent configuration added for the newer workflow.
- `A 12/0` `.continue/mcpServers/new-mcp-server.yaml`
  Continue MCP server configuration added.
- `A 1240/0` `docs/BIDONDENT_PRODUCT_BRAIN.md`
  Full product-brain document added for the website-era platform direction.
- `A 202/0` `docs/MAP_EXPERIENCE_ARCHITECTURE.md`
  Dedicated technical architecture document for the map-first experience.
- `A 612/0` `docs/PROJECT_STATUS.md`
  Expanded project status tracker added back with current architecture notes.
- `A 432/0` `src/app/components/shop/ShopDirectoryMapPane.tsx`
  New dedicated map pane component for the shop directory experience.
- `A 104/0` `src/app/hooks/useBusinessProfile.ts`
  New hook for provider-agnostic shop/insurer business profile loading and saving.
- `A 58/0` `src/app/hooks/useNetworkDirectory.ts`
  New shared hook for hydrating directory inventory into role-based screens.
- `A 108/0` `src/app/hooks/useWebsiteSessionSync.ts`
  New startup hydration hook for reconciling local and cloud website memory.
- `A 298/0` `src/app/services/auth/websiteIdentity.ts`
  New provider-agnostic website identity and nested website session memory system.
- `A 119/0` `src/app/services/auth/websitePreferencesSync.ts`
  New cloud sync adapter for website preference persistence.
- `A 229/0` `src/app/services/auth/websiteRelationshipsSync.ts`
  New cloud sync adapter for saved shops, watchlists, shortlists, and connected carriers.
- `A 422/0` `src/app/services/intelligence/directoryAdapters.ts`
  New adapter layer for blending persisted directory inventory with seeded intelligence models.
- `A 774/0` `src/app/services/intelligence/marketIntelligence.ts`
  New seeded recommendation/scoring engine for shops and insurers.
- `A 824/0` `src/app/services/intelligence/shopMapExperience.ts`
  New map-first service with geo metadata, suggested origins, and role-aware map behaviors.
- `A 254/0` `src/app/services/networkProfiles.ts`
  New client-side service for provider-agnostic shop/insurer profile persistence.
- `A 199/0` `src/app/services/supabase/admin.ts`
  New shared admin edge client/runtime access layer.
- `A 147/0` `src/app/services/supabase/runtime.ts`
  New centralized frontend Supabase runtime contract.
- `A 305/0` `src/app/types/mapDomain.ts`
  New shared domain types for map/search/origin/place/result/session memory.
- `A 66/0` `src/app/types/networkProfiles.ts`
  New shared types for shop and insurer business/network profiles.
- `A 1/0` `supabase/functions/make-server-9f243523/index.ts`
  New deployed edge function folder reference for the live server variant.
- `A 36/0` `supabase/functions/server/config/storage.ts`
  New storage configuration module for the server edge function.
- `A 257/0` `supabase/functions/server/handlers/network_profiles.ts`
  New provider-agnostic network profile handlers.
- `A 89/0` `supabase/functions/server/handlers/preferences.ts`
  New provider-agnostic website preference handlers.
- `A 156/0` `supabase/functions/server/handlers/profiles.ts`
  New provider-agnostic website profile handlers.
- `A 216/0` `supabase/functions/server/handlers/website_relationships.ts`
  New durable relationship handlers for saved shops, watchlists, shortlists, and carriers.
- `A 40/0` `supabase/migrations/005_create_website_preferences_table.sql`
  New migration for durable website preference memory.
- `A 54/0` `supabase/migrations/006_make_business_profiles_provider_agnostic.sql`
  New migration making business profiles provider agnostic.
- `A 35/0` `supabase/migrations/007_create_website_relationships_table.sql`
  New migration for durable relationship collections.
- `A 43/0` `supabase/migrations/008_organize_website_storage_and_profiles.sql`
  New migration organizing storage and website-era profile behavior.

### Deleted Files

- `D 0/70` `src/app/services/supabase/legacy.ts`
  Removed legacy Supabase auth/runtime layer superseded by the centralized runtime contract.
- `D 0/64` `src/app/utils/fixAccountType.ts`
  Removed legacy account-type repair helper no longer needed in the new identity flow.
- `D 0/47` `src/app/utils/forceReload.ts`
  Removed legacy force-reload helper.
- `D 0/52` `src/app/utils/migrateData.ts`
  Removed legacy migration helper.
- `D 0/201` `src/app/utils/sessionDebugger.ts`
  Removed legacy session debugger utilities.
- `D 0/193` `src/app/utils/sessionManager.ts`
  Removed legacy session manager utilities.
- `D 0/234` `supabase/functions/make-server-c3ef122f/index.ts`
  Removed older edge-function folder reference replaced by the newer deployed variant.

### Modified Files

- `M 35/15` `README.md`
  Updated high-level project overview, setup direction, and documentation links.
- `M 7/2` `docs/GETTING_STARTED.md`
  Updated getting-started guidance to reflect the newer website/runtime setup.
- `M 78/361` `docs/SUPABASE_SETUP_GUIDE.md`
  Reworked Supabase setup guidance around the new runtime, storage, and provider-agnostic flows.
- `M 16/0` `package-lock.json`
  Lockfile updated for the new dependency set.
- `M 1/0` `package.json`
  Added map dependency support for the new website map experience.
- `M 163/172` `src/app/App.tsx`
  Rewired the main app to build and pass provider-agnostic website identity and integrate the new dashboard/runtime flows.
- `M 11/61` `src/app/components/admin/AdminAccountManager.tsx`
  Updated admin account manager to work with the newer provider/runtime model.
- `M 8/84` `src/app/components/admin/AdminAccountSetup.tsx`
  Simplified or refactored admin account setup around the new data/runtime pathways.
- `M 421/82` `src/app/components/admin/AdminDashboard.tsx`
  Expanded admin dashboard functionality for the new website-era runtime and diagnostics.
- `M 6/16` `src/app/components/admin/DeleteUserUtility.tsx`
  Updated delete-user flow to align with newer profile/runtime handling.
- `M 84/53` `src/app/components/codelayer/AccountScreen.tsx`
  Updated account screen for the newer session/profile model.
- `M 248/50` `src/app/components/codelayer/HomeScreen.tsx`
  Expanded home screen behavior and role-aware entry points for the new website experience.
- `M 22/1` `src/app/components/codelayer/account/AccountInfoCard.tsx`
  Updated account info presentation for the newer profile data.
- `M 4/5` `src/app/components/codelayer/account/DeleteAccountModal.tsx`
  Small account deletion flow adjustments.
- `M 12/21` `src/app/components/devtools/EdgeFunctionStatus.tsx`
  Updated edge function diagnostics for the new runtime/service layout.
- `M 12/28` `src/app/components/devtools/StorageInspector.tsx`
  Updated storage inspection behavior for the newer buckets and storage routes.
- `M 257/190` `src/app/components/insurer/InsurerConnectionScreen.tsx`
  Expanded insurer connection experience to use provider-agnostic directory and carrier relationship data.
- `M 22/6` `src/app/components/insurer/InsurerOnboarding.tsx`
  Updated insurer onboarding to persist real provider-agnostic business profile data.
- `M 483/290` `src/app/components/insurer/InsurerPartnerShopsScreen.tsx`
  Major rework to insurer shortlist / partner shop management using shared map and relationship state.
- `M 243/201` `src/app/components/reports/CompetitorAnalysisScreen.tsx`
  Reworked shop competitor analysis to use shared map/watchlist memory.
- `M 191/118` `src/app/components/shop/LikedShopsScreen.tsx`
  Reworked customer liked/saved shops around the shared relationship collections.
- `M 1189/251` `src/app/components/shop/ShopDirectoryScreen.tsx`
  Major rebuild from recommendation-card screen into the real map-first directory shell.
- `M 22/6` `src/app/components/shop/ShopOnboarding.tsx`
  Updated shop onboarding to persist provider-agnostic business profile data.
- `M 45/121` `src/app/hooks/useAppHandlers.ts`
  Reworked app actions to align with new runtime, relationship, and profile services.
- `M 14/24` `src/app/hooks/useNavigation.ts`
  Updated navigation behavior to support the new dashboard/map pathways.
- `M 391/217` `src/app/hooks/useUserData.ts`
  Major user data updates for website identity inputs and broader provider-agnostic data loading.
- `M 594/6` `src/app/routers/DashboardRouter.tsx`
  Large routing expansion so role-specific map, insurer-connect, and related screens receive the right context.
- `M 19/37` `src/app/services/storageMonitor.ts`
  Updated storage monitoring around the new runtime and bucket model.
- `M 2/2` `src/app/services/supabase/client.ts`
  Small Supabase client adjustments for the new runtime contract.
- `M 71/155` `src/app/services/supabase/profiles.ts`
  Reworked profile data access around provider-agnostic website identity support.
- `M 105/83` `src/app/services/supabase/reports.ts`
  Updated report data access for the newer identity/runtime flows.
- `M 17/27` `src/app/services/supabase/storage.ts`
  Updated storage layer for canonical bucket usage and runtime access changes.
- `M 84/10` `src/app/services/supabase/vehicles.ts`
  Updated vehicle access to support website identity inputs beyond raw Clerk user IDs.
- `M 2/5` `src/app/services/supabaseService.ts`
  Small service-wrapper adjustments.
- `M 26/19` `src/app/types/index.ts`
  Updated shared exports/types to include newer map/network/runtime structures.
- `M 33/72` `src/app/utils/buildDashboardRouterProps.ts`
  Updated router prop building so `websiteIdentity`, reports, vehicles, and role-aware props flow into screens.
- `M 1/1` `supabase/.temp/cli-latest`
  Updated local Supabase CLI temp metadata.
- `M 1/3` `supabase/functions/server/config/constants.ts`
  Small configuration adjustments in edge runtime constants.
- `M 592/41` `supabase/functions/server/database_init.tsx`
  Major database/bootstrap updates for provider-agnostic website-era storage and profile setup.
- `M 50/0` `supabase/functions/server/handlers/admin.ts`
  Expanded admin handlers for the newer runtime needs.
- `M 1/1` `supabase/functions/server/handlers/health.ts`
  Small health handler update.
- `M 74/115` `supabase/functions/server/handlers/reports.ts`
  Reworked reports handler for the newer identity/runtime pipeline.
- `M 161/80` `supabase/functions/server/handlers/storage.ts`
  Reworked storage handler around canonical buckets and provider-agnostic behavior.
- `M 23/2` `supabase/functions/server/handlers/vehicles.ts`
  Updated vehicles handler for broader website identity support.
- `M 101/76` `supabase/functions/server/index.ts`
  Reworked server route registration and orchestration around the new handlers.
- `M 18/11` `supabase/functions/server/storage_init.tsx`
  Updated storage initialization around the newer bucket layout.
- `M 12/0` `supabase/functions/server/utils/helpers.ts`
  Expanded shared server helpers.

## Functional Summary By Area

### Website Identity And Memory

- The app no longer relies only on raw Clerk identifiers for app-level personalization.
- `websiteUserKey` and `sessionId` now provide a provider-agnostic layer for durable website memory.
- Nested `mapSession` memory persists map view mode, saved places, watchlists, shortlists, recent searches, and related role-aware state.

### Shop Discovery And Map UX

- The shop directory is now a true split-pane map-first desktop experience.
- The map pane is its own component instead of simulated layout inside a card list.
- Shared map domain types make the experience extensible instead of screen-local.

### Shop, Insurer, And Customer Relationship Flows

- Customer saved shops are now durable and shared.
- Shop competitor watchlists are now durable and shared.
- Insurer shortlists and connected carriers are now durable and shared.
- The same relationship model is reused across map, saved-shop, competitor, and partner views.

### Provider-Agnostic Business Profile Model

- Shop and insurer onboarding now connect to real business-profile persistence.
- Shared directory inventory can mix seeded directory data with persisted profile data.

### Supabase Runtime Hardening

- Client calls are routed through a central runtime contract.
- Admin functionality uses a clearer shared runtime pathway.
- Legacy helpers that were tied to older auth/runtime assumptions were removed.

## Branching Recommendation

Recommended branch theme moving forward:

- `main`
  Keep clean as the long-term baseline.
- `BidOnDent-Horizon-Stable`
  Use as the current stable website-era branch.
- `feature/bidondent-horizon`
  Use as the active development branch for future Horizon work.

## Migration Status

Status at time of writing:

- Production+ delta has been replayed onto the Jeffrey future-updates line locally.
- `main` has not been merged into or rewritten.
- The workspace is ready to be committed under the new Horizon naming theme.
