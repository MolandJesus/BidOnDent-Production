# BidOnDent Product Brain

Last updated: March 21, 2026

This is a working internal handbook for anyone acting as the product brain, engineering partner, or maintenance agent for BidOnDent. It is meant to preserve context, reduce re-discovery, and keep future edits aligned with what the product is trying to be.

## What BidOnDent Is

BidOnDent is a three-sided auto body repair marketplace:

- Customers report damage, upload photos, receive repair bids, compare options, and choose a shop.
- Auto body shops review repair opportunities, submit bids, and manage active work.
- Insurers review claims, monitor repair activity, and manage or assign partner shops.

The product promise is transparency:

- structured intake
- visible bid comparison
- faster repair decision-making
- shared visibility across customer, shop, and insurer workflows

The platform wants to feel trustworthy, professional, and operationally clear rather than flashy for its own sake.

## The Most Important Product Truth

The codebase is part real marketplace, part demo shell, and part admin/dev toolbox.

That means there are two truths we have to keep in our head at the same time:

- The intended product is a real multi-party repair marketplace.
- The current implementation still mixes real persistence with mock/sample flows, especially for shop and insurer experiences.

When working on the app, do not assume every visible screen is fully wired end to end. Many are polished frontends that still need deeper integration.

## Screenshot Reality Check

The screenshots the user shared are valuable brand and UX references, but they do not perfectly match the current repo snapshot.

Current code definitely contains:

- landing hero
- How It Works
- Why Choose Us / benefits
- Who We Serve
- trust stats
- CTA
- footer
- dashboard layouts

The screenshots also show elements that are not clearly present in the current code snapshot:

- an `About` top-nav item in the landing header
- shop signup / insurer partnership landing forms
- service coverage map / county coverage section
- some additional landing/about sections

Treat screenshots as product direction, not as guaranteed source-of-truth for the current checked-out code.

## Current Supabase Reality

The repo has now crossed into a cleaner "website-era" Supabase contract:

- frontend Supabase URLs, route slugs, and bucket names are centralized in `src/app/services/supabase/runtime.ts`
- admin/dashboard edge calls are centralized in `src/app/services/supabase/admin.ts`
- canonical live edge function is `server`
- `make-server-9f243523` is still deployed only as a compatibility alias
- canonical buckets for new uploads are:
  - `bidondent-account-media`
  - `bidondent-vehicle-media`
  - `bidondent-report-media`
- old buckets still exist only to preserve previously uploaded assets
- the empty `bidondent-landing-page-images` bucket has already been removed from the live project

Implication:

- do not add new hardcoded Supabase URLs in components
- do not point new uploads at the legacy buckets
- when touching map/account/profile code, prefer website-identity-aware edge services over raw browser table access

## Current Map/Search Reality

The repo now has a real first-pass map foundation. Important facts:

- `src/app/services/auth/websiteIdentity.ts` is the provider-agnostic identity/session layer.
- `websiteIdentity` owns `websiteUserKey`, `sessionId`, and local website memory.
- `src/app/services/intelligence/marketIntelligence.ts` is still the recommendation/scoring brain.
- `src/app/services/intelligence/shopMapExperience.ts` now adds seeded geo metadata, suggested origins, and role-aware map framing.
- provider-agnostic shop and insurer business profiles now persist through edge routes keyed by `website_user_key`.
- `src/app/components/shop/ShopDirectoryScreen.tsx` is now a dedicated map-first shell, not just the old list screen stretched wider.
- `src/app/components/shop/ShopDirectoryMapPane.tsx` uses Leaflet/React Leaflet for the actual interactive map.
- `src/app/types/mapDomain.ts` is the shared domain type layer for map/search/origin/place/session state.
- customer saved shops, shop competitor watchlists, and insurer shortlists now persist inside shared map session memory and feed their related screens.
- that website memory now also has a cloud-backed provider-agnostic sync path through `website_preferences`, not only browser storage.
- onboarding for shop and insurer accounts now has a real persistence target instead of stopping at form UI.
- live directory inventory can now feed the map and insurer connection flows, with seeded fallback still preserved.
- those saved/watchlist/shortlist/carrier collections now also mirror into durable provider-agnostic relationship rows.

Implication:

- future map work should extend this dedicated shell and shared map domain
- do not regress the newer identity/session/intelligence abstraction just to wire a UI shortcut
- screenshots are still design direction, but the real checked-in source-of-truth for map work is now these files

## Architecture In One Pass

App boot:

- `src/main.tsx`
- `src/app/App.tsx`

Main orchestration happens in `src/app/App.tsx`:

- wraps the app in `ClerkProvider`
- reads the Clerk user
- extracts a product-facing profile from Clerk metadata
- initializes shared hooks
- decides between account setup, onboarding, landing page, and dashboard

Shared hooks:

- `src/app/hooks/useUserData.ts`
- `src/app/hooks/useNavigation.ts`
- `src/app/hooks/useAppEffects.ts`
- `src/app/hooks/useAppHandlers.ts`

UI shells:

- `src/app/components/app/LandingPageLayout.tsx`
- `src/app/components/app/DashboardLayout.tsx`

Screen routing:

- `src/app/routers/DashboardRouter.tsx`

This app does not use React Router for main navigation. It uses local React state plus `viewMode` and `currentTab`.

That is a major architectural fact. Any navigation change needs to respect that model.

## How Navigation Actually Works

Navigation state lives in `src/app/hooks/useNavigation.ts`.

Core state:

- `currentTab`
- `viewMode`
- `selectedReportId`
- `showLandingPage`
- `showOnboarding`
- `showProfileDropdown`
- demo mode flags

It persists parts of navigation into localStorage under `bidondent_navigation_state`.

Implication:

- page flow is state-driven, not URL-driven
- restoring state after refresh is intentional
- if you change view names or tab IDs, you also affect saved local state behavior

## The Product Roles

### Customer

Intent:

- report collision/body damage
- upload damage photos
- describe incident
- receive quotes
- compare shops
- pick a repair path
- manage profile and vehicles

Main customer areas:

- home dashboard
- report flow
- bids screen
- reports list/detail
- insurer connection
- liked shops
- vehicles
- account

### Shop

Intent:

- see open repair opportunities
- bid on jobs
- manage active repairs
- monitor competition and insurer opportunities

Main shop areas:

- home dashboard
- requests
- active jobs
- competitor analysis
- insurance company directory
- account / shop profile

### Insurer

Intent:

- review claims
- compare or assign repair options
- manage partner network
- manually create claims

Main insurer areas:

- home dashboard
- claims
- partner shops
- new claim
- account

### Admin / Test Accounts

Intent:

- create and manage linked test accounts
- verify system health
- inspect profiles/users

Reality:

- admin infrastructure exists in the repo
- it is explicitly marked as removable for production
- it is important operationally, but it is not the core customer-facing product

### Demo Mode

Intent:

- let one logged-in user preview customer, shop, and insurer dashboards without separate sign-ins

Reality:

- demo mode is a real first-class concept in the dashboard shell
- it is useful for product demos and manual QA
- it should not be confused with real cross-account data integrity

## Role Interaction Map

This is the conceptual interaction graph the product is aiming for.

Customer -> Shop:

- customer creates a damage report
- shops review the request
- shops submit bids
- customer compares and selects a shop

Customer -> Insurer:

- customer can connect insurer information
- insurer can review claims tied to damage/repair activity

Shop -> Customer:

- shops send bids
- shops communicate repair timing, cost, and status

Insurer -> Customer:

- insurer approves or denies claim amounts
- insurer may help route the customer toward a partner shop

Insurer -> Shop:

- insurer evaluates shop network
- insurer can assign or prefer shops
- insurer tracks network performance

Admin -> Everyone:

- creates test users
- manages admin/test privileges
- validates system health and operational state

## Current Implementation Reality Of Those Interactions

Customer flows are the most real.

- customer auth/account setup is real through Clerk
- customer vehicles and reports have real persistence paths through Supabase
- customer report photo upload has real storage logic with fallback behavior

Shop flows are more demo-heavy.

- shop dashboards look intentional and usable
- shop request and job screens currently lean heavily on hardcoded sample data
- shop bid submission UI exists, but the current cross-role data path is not fully coherent

Insurer flows are also more demo-heavy.

- claims, partner shops, and new claim screens are polished
- a lot of insurer-side data is sample/mock data, not clearly wired to real persisted marketplace state

Admin/devtools are real utility surfaces.

## The Visual Language

BidOnDent consistently leans on:

- deep royal blue plus cyan gradients
- white cards on soft gray or blue-tinted backgrounds
- large rounded corners
- icon-led cards and quick actions
- polished but readable motion
- clean B2B/B2C hybrid trust aesthetics

Design principles visible in the repo:

- the product wants to feel clean and credible
- trust is communicated through badges, stats, certifications, and process clarity
- screens favor explicit labels and guided next actions
- landing sections are modular and market-facing
- dashboard sections are action-first and role-specific

When editing UI, avoid:

- generic app-store-style fluff
- flattening all roles into the same copy
- replacing the blue/cyan trust language with unrelated themes
- making flows more clever than clear

## Code Organization Style To Preserve

The project already shows a preferred organization style.

### 1. Centralized orchestration

Keep app-level decisions in:

- `src/app/App.tsx`
- shared hooks
- `src/app/routers/DashboardRouter.tsx`

Do not scatter top-level route logic randomly across screens.

### 2. Role-based component grouping

Major screen groups live under:

- `src/app/components/landing`
- `src/app/components/shop`
- `src/app/components/insurer`
- `src/app/components/reports`
- `src/app/components/admin`
- `src/app/components/demo`

That is good. Preserve it.

### 3. Legacy but active `codelayer`

`src/app/components/codelayer` is not dead.

It still contains active screens:

- `HomeScreen.tsx`
- `ReportScreen.tsx`
- `BidsScreen.tsx`
- `AccountScreen.tsx`

Do not delete or casually relocate these without updating the router and dependent logic.

### 4. Services should stay modular

Supabase operations are split under:

- `src/app/services/supabase/profiles.ts`
- `src/app/services/supabase/vehicles.ts`
- `src/app/services/supabase/reports.ts`
- `src/app/services/supabase/bids.ts`
- `src/app/services/supabase/storage.ts`

Backward compatibility is preserved through:

- `src/app/services/supabaseService.ts`

That pattern is worth keeping.

### 5. Use hooks as coordination layers

The app already tries to keep side effects and coordination out of leaf screens:

- `useUserData`
- `useNavigation`
- `useAppEffects`
- `useAppHandlers`

New shared behavior should usually go through those layers before it spreads into screen-local hacks.

## Public Landing Page Map

Current landing composition lives in `src/app/components/app/LandingPageLayout.tsx`.

### Header

File:

- `src/app/components/landing/LandingPageHeader.tsx`

Current buttons and behavior:

- logo -> scrolls to top
- `How It Works` -> scrolls to the `how-it-works` section
- `Who We Serve` -> scrolls to the `who-we-serve` section
- if logged out:
  - `Login` -> opens Clerk sign-in modal
  - `Get Started` -> opens Clerk sign-up modal
- if logged in and on landing:
  - `Dashboard` -> exits landing and shows dashboard
  - Clerk `UserButton`

### Hero

File:

- `src/app/components/landing/HeroSection.tsx`

Current buttons:

- primary CTA
  - logged out: `Get Started`
  - logged in customer: `Start New Report`
  - logged in shop: `View Requests`
  - logged in insurer: `Create New Claim`
- secondary CTA: `Learn More` -> scrolls to How It Works

Visual meaning:

- damaged vehicle + customer context
- trust badge
- claim of cost savings and local shop access

### How It Works

File:

- `src/app/components/landing/HowItWorksSection.tsx`

Concept:

- 1. report damage
- 2. receive bids
- 3. choose and repair

### Benefits / Why Choose Us

File:

- `src/app/components/landing/BenefitsSection.tsx`

Themes:

- repair quality
- certified professionals
- competitive pricing

### Who We Serve

File:

- `src/app/components/landing/WhoWeServeSection.tsx`

Audience cards:

- customers
- auto body repair shops
- insurers

### Trust Stats

File:

- `src/app/components/landing/TrustStatsSection.tsx`

Role:

- social proof
- scale
- confidence

### CTA Section

File:

- `src/app/components/landing/CTASection.tsx`

Current main button:

- signed in: `Go to Dashboard`
- signed out: `Get Started Now`

### Footer

File:

- `src/app/components/landing/FooterSection.tsx`

Important note:

- many footer links are placeholder `#` links
- some screenshot-visible sections implied by footer labels are not fully represented in current landing code

## Dashboard Shell Map

Main file:

- `src/app/components/app/DashboardLayout.tsx`

Desktop shell:

- sidebar logo
- role-aware tab list
- optional `Demo Mode` button
- bottom sidebar profile trigger

Top bar:

- active tab label
- search input
- bell icon with unread dot
- top-right compact profile menu

Important note:

- the bell/search are mainly shell UI elements
- the richer navigation and notification behavior is actually handled in `ProfileDropdown`

## Profile Dropdown Behavior

Main file:

- `src/app/components/dashboard/ProfileDropdown.tsx`

What it does:

- shows user identity and role badge
- shows role-specific stats
- subscribes to real-time notifications when open
- offers role-aware quick navigation

Current notification intent:

- customer -> new bids
- shop -> new repair requests
- insurer -> new claims

Important reality:

- subscriptions exist
- but overall end-to-end data consistency still depends on the mixed auth/data architecture being aligned

## Customer Experience Map

### Customer Home Dashboard

File:

- `src/app/components/codelayer/HomeScreen.tsx`

Primary top button:

- `New Repair Request`

Quick actions:

- `New Repair Request`
- `View Bids`
- `Connect Insurance`
- `Find Shops`

Recent list behavior:

- recent reports are shown
- clicking a report opens detail flow

Stats shown:

- active requests
- total bids received
- completed repairs
- money saved

### Damage Report Flow

Main file:

- `src/app/components/codelayer/ReportScreen.tsx`

Substeps:

- `StepVehicleInfo.tsx`
- `StepDamageArea.tsx`
- `StepPhotos.tsx`
- `StepDescription.tsx`
- `StepComplete.tsx`

What the flow does:

- saves a draft in localStorage
- lets users pick a saved vehicle or enter one manually
- lets users choose damage area
- prompts photo guide before photo upload if needed
- compresses photos aggressively before upload
- attempts cloud upload to Supabase storage
- falls back to base64/local state if needed
- submits a report to the edge function

Key buttons by step:

- vehicle step:
  - select saved vehicle
  - `Continue`
- damage step:
  - area buttons
  - `Back`
  - `Continue`
- photos step:
  - `Take Photo`
  - `Upload Photo`
  - per-photo remove button
  - `Back`
  - `Continue`
- description step:
  - `Back`
  - `Continue`
- complete step:
  - `View My Reports`
  - `Back to Dashboard`

### Photo Guide

File:

- `src/app/components/shop/PhotoGuide.tsx`

Even though it lives in the shop folder, it is part of the customer report experience.

This is a good reminder not to assume folder names always tell the whole story.

### Bids Screen

File:

- `src/app/components/codelayer/BidsScreen.tsx`

Current behavior:

- shows sample bids
- allows sorting by:
  - all
  - lowest price
  - fastest
  - highest rated
- expandable bid cards
- per-bid controls:
  - `Accept Bid`
  - call icon
  - message icon
  - external-link icon
  - rating/thumbs-up action for customers

Important reality:

- this screen is currently presentation-heavy and sample-data driven

### Reports List

File:

- `src/app/components/reports/ReportsListScreen.tsx`

Main controls:

- back button
- filter tabs:
  - all
  - pending
  - active
  - completed
- click report card -> report detail
- click photo thumbnail -> lightbox/gallery

### Report Detail

File:

- `src/app/components/reports/ReportDetailScreen.tsx`

Main sections:

- damage photos
- vehicle information
- damage description
- submission details
- interested shops

Current CTA on bid-ready shop cards:

- `View Bid`

Important reality:

- interested shop list is mock/sample data

### Vehicles

File:

- `src/app/components/shop/VehicleProfileScreen.tsx`

This is a customer-facing vehicle manager despite living in `components/shop`.

Main controls:

- back
- `Add Vehicle`
- edit icon
- delete icon
- form:
  - `Cancel`
  - `Save Vehicle`
- empty state:
  - `Add Your First Vehicle`

### Favorite Shops

File:

- `src/app/components/shop/LikedShopsScreen.tsx`

Controls:

- back
- unlike heart
- `Request Quote`
- call icon
- message icon

### Connect Insurance

File:

- `src/app/components/insurer/InsurerConnectionScreen.tsx`

This is customer-facing despite the insurer folder placement.

Controls:

- back
- search insurers
- select insurer
- connect modal:
  - enter policy number
  - optional claim number
  - `Cancel`
  - `Connect`

## Shop Experience Map

### Shop Home Dashboard

File:

- `src/app/components/codelayer/HomeScreen.tsx`

Primary top button:

- `View Requests`

Quick actions:

- `Open Requests`
- `Active Jobs`
- `Competitors`
- `Browse Insurers`

Stats:

- open requests
- active jobs
- completed jobs
- potential revenue

Important reality:

- shop home receives seeded reports from constants rather than truly live marketplace data

### Requests

File:

- `src/app/components/shop/ShopRequestsScreen.tsx`

Main controls:

- search
- filters:
  - all
  - new
  - bidding
  - closed
- call customer
- email customer
- `Submit Bid`
- bid modal:
  - bid amount input
  - `Cancel`
  - `Submit Bid`

Important reality:

- request list is sample data inside the component
- this is not yet a clean live request board

### Active Jobs

File:

- `src/app/components/shop/ShopActiveJobsScreen.tsx`

Main controls:

- search
- status filters
- call
- email
- message
- `View Full Details`
- modal close

Important reality:

- jobs are sample data inside the component

### Competitor Analysis

File:

- `src/app/components/reports/CompetitorAnalysisScreen.tsx`

Main controls:

- back
- search
- sort by rating/jobs/distance

Purpose:

- market awareness for shops

### Insurance Company Directory

File:

- `src/app/components/insurer/InsuranceCompaniesScreen.tsx`

For shop users, this becomes a partner prospecting surface.

Main controls:

- back
- search
- filters
- per-company CTA:
  - `Partner`

## Insurer Experience Map

### Insurer Home Dashboard

File:

- `src/app/components/codelayer/HomeScreen.tsx`

Primary top button:

- `Start New Claim`

Quick actions:

- `View Claims`
- `Create New Claim`
- `Partner Shops`
- `Browse Insurers`

Stats:

- active claims
- claims resolved
- partner shops
- average cycle time

### Claims Management

File:

- `src/app/components/insurer/InsurerClaimsScreen.tsx`

Main controls:

- search
- filters:
  - all
  - pending
  - reviewing
  - approved
  - denied
- call customer
- email customer
- details button
- pending claims:
  - `Review & Approve`
- approval modal:
  - approved amount input
  - `Cancel`
  - `Approve Claim`

Important reality:

- claims list is sample data inside the component

### Partner Shops

File:

- `src/app/components/insurer/InsurerPartnerShopsScreen.tsx`

Main controls:

- search
- filters
- `Add Shop`
- per-shop:
  - call
  - email
  - message
- add-shop modal:
  - shop info fields
  - specialty toggles
  - certification toggles
  - `Cancel`
  - `Add Partner Shop`

Important reality:

- partner network data is sample data inside the component

### New Claim

File:

- `src/app/components/insurer/InsurerNewClaimScreen.tsx`

Main controls:

- back
- role tab switch:
  - `Policyholders`
  - `Auto Shops`
- search
- customer cards:
  - call
  - email
  - message
  - `Create Claim for <name>`
- shop cards:
  - call
  - email
  - message
  - `Assign to Claim`
- claim modal:
  - policy number
  - incident date
  - damage description
  - estimated amount
  - priority
  - `Cancel`
  - `Create Claim`

Important reality:

- creation UI exists
- component is sample-data driven

## Admin And Devtools

Key files:

- `src/app/components/admin/*`
- `src/app/config/adminConfig.ts`
- `src/app/utils/adminCheck.ts`
- `src/app/components/devtools/*`

What exists:

- admin dashboard
- linked test accounts
- bulk user management
- edge function health checks
- database verification
- storage inspection / monitoring
- admin promotion/demotion tools

What to remember:

- admin code is real repo surface area
- but it is intentionally marked as removable for production

## Data And Persistence Model

### Clerk

Clerk is the active auth provider.

Main file:

- `src/app/services/clerkService.ts`

Clerk metadata currently stores:

- `user_type`
- `name`
- `phone`
- `account_setup_completed`

In practical terms, Clerk is the current identity source.

### Supabase

Supabase is used for:

- profiles
- vehicles
- damage reports
- bids
- storage
- realtime
- edge functions

Important client files:

- `src/app/services/supabase/client.ts`
- `src/app/services/supabase/profiles.ts`
- `src/app/services/supabase/vehicles.ts`
- `src/app/services/supabase/reports.ts`
- `src/app/services/supabase/bids.ts`
- `src/app/services/supabase/storage.ts`

### localStorage

Used for:

- quick per-user cache
- navigation state
- report drafts

Important consequence:

- localStorage is not just a convenience here; parts of UX rely on it

## Backend Shape

Edge function router:

- `supabase/functions/server/index.ts`

Important handlers:

- `handlers/reports.ts`
- `handlers/vehicles.ts`
- `handlers/auth.ts`
- `handlers/storage.ts`
- `handlers/admin.ts`

Important backend reality:

- server uses service-role Supabase access
- several handlers use `clerk_user_id`
- several frontend direct reads still assume `user_id` / Supabase-auth alignment

That mismatch matters.

## Known Architectural Risks And Mismatches

### 1. Clerk vs Supabase session split

The app now authenticates users through Clerk, but `useUserData` still waits for a Supabase session before loading cloud data.

Effect:

- a user can be signed in through Clerk and still not fully load cloud-backed data

### 2. Schema drift around `clerk_user_id`

Edge handlers and `database_init.tsx` expect `clerk_user_id` columns on vehicles and damage reports.

But static migration files and some frontend modules still center `user_id`.

Effect:

- backend and frontend persistence assumptions are not fully unified

### 3. Mixed report shapes

Different parts of the frontend treat reports differently:

- nested vehicle object
- flattened `vehicle_make` / `vehicle_model` / `vehicle_year`
- different status names

Effect:

- transformations are common
- bugs can appear when one screen expects a shape another screen does not produce

### 4. `selectedReportId` number vs UUID/string mismatch

Navigation stores `selectedReportId` as a number-ish value, but persisted reports can have string/UUID IDs.

Effect:

- report selection/detail behavior is fragile when real Supabase IDs are involved

### 5. Shop request bidding is not fully coherent

Shop request cards are sample data with numeric IDs, while bid routing/lookup logic depends on the app report collection.

Effect:

- the UI suggests a live bid workflow, but the current data path is not fully trustworthy

### 6. Landing/footer/code drift

Footer promises things like shop signup and insurer partnership, and screenshots show more landing surfaces than the current landing modules expose.

Effect:

- product intent is broader than the current checked-in landing composition

### 7. No real automated test baseline

The repo currently leans on:

- manual validation
- in-app smoke checklist
- ad hoc devtools

Effect:

- regressions can hide in role-specific flows

## How To Work On This Repo Without Making It Messier

If adding or changing a feature:

- start from the role that owns the action
- trace the handler path all the way to data persistence before claiming the feature is complete
- check whether the screen is real-data or mock-data first
- keep orchestration in hooks/router, not in random child components
- preserve role folders and screen naming conventions
- do not delete `codelayer` screens unless you are deliberately migrating them
- prefer extending the service modules instead of creating one-off fetch logic inside screens
- keep landing sections modular
- keep trust-oriented copy and visual consistency

If replacing mock/sample data with real data:

- keep the existing UI contract stable where possible
- add adapter/transform code at the boundary instead of rewriting all screens at once
- unify ID types before wiring deeper navigation
- decide whether Clerk or Supabase auth is the canonical identity for that path

If working on design:

- keep the blue/cyan trust system unless there is a clear brand change
- keep hierarchy obvious
- keep role language explicit
- avoid generic startup-saas visuals that remove the collision-repair personality

## Fast Mental Model For Future Work

When thinking about BidOnDent, think:

- public marketing site + logged-in dashboard shell
- three-sided marketplace
- customer flow is closest to real
- shop and insurer flows are strong UI shells with partial real wiring
- demo mode is part of the product story
- admin/devtools exist and are useful, but are not the customer-facing product core
- data architecture still needs consolidation

## Product-Brain Stance

When acting as the BidOnDent agent:

- prioritize clarity over novelty
- protect the role boundaries
- look for data truth before UI assumptions
- treat screenshots, code, and runtime behavior as three separate evidence sources
- call out when they disagree
- preserve the repo's modular structure and avoid unnecessary sprawl

## Best Starting Files For Any Future Investigation

If reloading context quickly, start here:

- `src/app/App.tsx`
- `src/app/hooks/useUserData.ts`
- `src/app/hooks/useNavigation.ts`
- `src/app/hooks/useAppHandlers.ts`
- `src/app/routers/DashboardRouter.tsx`
- `src/app/components/app/LandingPageLayout.tsx`
- `src/app/components/app/DashboardLayout.tsx`
- `src/app/components/codelayer/HomeScreen.tsx`
- `src/app/components/codelayer/ReportScreen.tsx`
- `src/app/components/codelayer/AccountScreen.tsx`
- `src/app/services/clerkService.ts`
- `src/app/services/supabase/*`
- `supabase/functions/server/index.ts`
- `supabase/functions/server/database_init.tsx`

## Bottom Line

BidOnDent is already shaped like a serious marketplace product, not a toy demo. The main job going forward is not inventing what it is from scratch. The main job is tightening the seams between:

- polished frontend experiences
- real data models
- role-to-role workflows
- auth and persistence consistency

That is the path from "looks like the platform" to "is the platform."
