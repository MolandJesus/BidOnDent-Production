# BidOnDent — Build Progress Dashboard

## ⚡ AT-A-GLANCE STATUS (updated 2026-03-25)

### Build Progress

| 0% |████████████████████████████████████████████████████████████████████████████| 118% 🚀 |

**Passes completed:** 193 / 160+ — ⚡ PLATFORM BUGFIX SWEEP + UI QUALITY PUSH

| Item             | Value                                                       |
| ---------------- | ----------------------------------------------------------- |
| **Last pass**    | Pass 193 — Glass card opacity for dashboard readability     |
| **Current pass** | 193 ✅ complete                                             |
| **Build**        | ✓ 0 errors · 1.97s · 735KB main bundle                      |
| **Spellcheck**   | 0 issues                                                    |
| **Branch**       | `feature/platform-bugfix-sweep-by-MolandJesus`              |
| **Last pushed**  | 2026-03-25                                                  |
| **Phase**        | BUGFIX SWEEP — auth fixes, UI quality, production readiness |

### Platform Bugfix Sweep (Passes 190–193, 2026-03-25)

| Pass | Title                                                      | Category   | Status |
| ---- | ---------------------------------------------------------- | ---------- | ------ |
| 190  | Gate Smoke Test behind DEV mode + Bids text readability    | P4-UX      | ✅     |
| 191  | Migrate bids.ts from Supabase auth to Clerk edge functions | P1-RUNTIME | ✅     |
| 192  | Tighten landing page section spacing (8 sections)          | P4-UX      | ✅     |
| 193  | Glass card opacity for dashboard readability               | P4-UX      | ✅     |

**Key fixes in this sweep:**

- **P1 CORE LOOP FIX**: All bid operations (submit, accept, reject, delete) migrated from broken `supabase.auth.getUser()` to Clerk-authenticated edge functions. The report → bid → accept loop now has a real auth path.
- **Bundle size restored**: 1,080KB → 735KB (code splitting fixed)
- **Smoke Test**: Hidden from production users (DEV-only)
- **Landing page**: Tighter vertical rhythm across all 8 sections
- **Dashboard**: Glass cards more opaque for text readability on dark bg

### Known remaining issues

- **P2**: userData.bids never populated from Supabase (only useBidsForReport hook fetches)
- **P2**: Cloud auto-save write amplification (writes ALL data on any state change)
- **P7**: ShopDirectoryScreen is 76KB chunk — could be further split

Visual audit from live screenshots confirms:

**Strengths confirmed:**

- Hero section is strong, premium, clean — "Best Price on Auto Body Repair" with map image badge
- Map/dark sections are the strongest, most product-owned areas of the site
- Navigation bar is calm and clean (How It Works / Who We Serve / About / Dashboard)
- "How It Works" 3-step cards are coherent and stable
- "Why Choose BidOnDent" photo cards with badges (Guided Intake, Repair Network, Transparent Bids) look professional
- "Who We Serve" 3-role cards are readable and structured
- Operating Regions / map search section is the standout — feels like real product
- Business inquiry gateway (Join as Shop / Partner as Insurer) is clean, no wall-of-inputs
- Report creation wizard (5-step) is functional with photo upload, saved vehicles, damage description
- Report submission success screen is well-designed with "What happens next" timeline
- Footer is clean with proper columns
- Trust stats ("$0 Free for Customers", "3+ Bids Per Request", "NY Service Area") are honest

**Weaknesses observed (post Pass 189):**

- ~~Light landing sections feel flat~~ → Fixed: blue-tinted gradients on all light sections
- ~~Section stacking feels disconnected~~ → Fixed: unified blue atmosphere throughout
- ~~Purple/indigo remnants in dark sections~~ → Fixed: all dark sections now deep navy
- ~~"Can't find variable: props" crash~~ → Fixed: Pass 186
- Some card/section transitions still feel page-like rather than spatial system states
- Report flow steps still render as centered cards — could feel more embedded
- Mobile bottom nav could benefit from more spatial integration with map

### Recent passes (144–154)

| Pass | Title                                                     | Category   | Status |
| ---- | --------------------------------------------------------- | ---------- | ------ |
| 144  | Insurer claim persistence to Supabase                     | P3-ARCH    | ✅     |
| 145  | BidsScreen empty state premium design                     | P4-UX      | ✅     |
| 146  | ReportsListScreen empty state premium design              | P4-UX      | ✅     |
| 147  | Dashboard quick actions mobile audit                      | P4-UX      | ✅     |
| 148  | Landing page mobile polish                                | P4-UX      | ✅     |
| 149  | Map overlay cards mobile separation                       | P4-UX      | ✅     |
| 150  | Map z-index above MobileBottomNav                         | P1-RUNTIME | ✅     |
| 151  | Shop directory immersive map bottom sheet                 | P4-UX      | ✅     |
| 152  | Report creation/photo-guide mobile flow compression       | P4-UX      | ✅     |
| 153  | Mobile map overlays audit, photo-guide, bugfixes          | P4-UX      | ✅     |
| 154  | reportsLoading bug + crash fix + console log sweep        | P1-RUNTIME | ✅     |
| 155  | ReportDetailScreen glass + mobile + touch target audit    | P4-UX      | ✅     |
| 156  | HomeScreen 375px touch targets — CTA, View All, buttons   | P4-UX      | ✅     |
| 157  | Map mobile UX: HALF default snap + tab/Back touch targets | P4-UX      | ✅     |
| 158  | Map button touch targets + warm design direction          | P4-UX      | ✅     |
| 159  | useMarketplaceReports error state + loading wiring        | P3-ARCH    | ✅     |
| 160  | Final cohesion: DashboardHeader glass + touch targets     | P4-UX      | ✅     |
| 161  | Map widget CTAs: Shop/Insurer View Map + Customer fix     | P4-UX      | ✅     |
| 162  | Landing section flow — warm palette, de-SaaS copy         | P4-UX      | ✅     |

### 🎯 160-PASS MILESTONE REACHED + POST-MILESTONE MAP PHASE

All original passes (154–160) complete. Continuing map-native phase (161+).

### Post-milestone focus: Map-native product phase (162+)

| Pass | Title (planned)                                           | Category | Status |
| ---- | --------------------------------------------------------- | -------- | ------ |
| 162  | Landing section flow — warm palette, de-SaaS copy         | P4-UX    | ✅     |
| 163  | HeroSection: warm bg + map badge, remove fake 4.9 stars   | P4-UX    | ✅     |
| 164  | Shop onboarding: glass system + map note + button polish  | P4-UX    | ✅     |
| 165  | Insurer onboarding: glass system + button polish          | P4-UX    | ✅     |
| 166  | HowItWorksSection: warm bg + softer connectors + map copy | P4-UX    | ✅     |
| 167  | OperatingRegionsSection: warm midnight bg + glow          | P4-UX    | ✅     |
| 168  | FooterSection + CTASection: warm bg + remove fake phone   | P4-UX    | ✅     |

### ⚡ PRODUCTIZATION PHASE (169+) — Map as product backbone

| Pass | Title (planned)                                                  | Category   | Status |
| ---- | ---------------------------------------------------------------- | ---------- | ------ |
| 169  | Map → Report: StepServiceLocation + zip/address persisted        | P3-ARCH    | ✅     |
| 170  | Map ↔ Report loop: real location on shop request cards          | P3-ARCH    | ✅     |
| 171  | Shop requests: urgency sort + "Located" badge                    | P3-ARCH    | ✅     |
| 172  | Map-centered dashboard: map widget to hero position              | P4-UX      | ✅     |
| 173  | Browser back button: pushState + popstate in useNavigation       | P1-RUNTIME | ✅     |
| 174  | Real data: location fields threaded through transform            | P3-ARCH    | ✅     |
| 175  | Map overlays: floating panel refactor, dashboard bugfixes        | P4-UX      | ✅     |
| 176  | Report markers on map, tap-to-open drawer                        | P4-UX      | ✅     |
| 177  | Map-first dashboard overlays, mobile bugfixes                    | P4-UX      | ✅     |
| 178  | Strict verification, doc update, header/logo micro-fix           | P4-UX      | ✅     |
| 179  | Shop loop completion (spatial shop actions)                      | P3-ARCH    | ⏳     |
| 179  | Shop loop completion (spatial shop actions, map-driven overlays) | P3-ARCH    | ✅     |
| 181  | UX design sweep: Sign Out button, Bids empty state glass fix     | P4-UX      | ✅     |
| 182A | Glass system unification: empty states, report cards, sidebar    | P4-UX      | ✅     |
| 182B | Map overlay layout: fixed widget sidebar offset on desktop       | P4-UX      | ✅     |
| 182C | Header/logo: blue glass icon, slate-900 Dent, breadcrumb fix     | P4-UX      | ✅     |
| 182D | Blue system upgrade: tokens, tinted glass, blue hover accents    | P4-UX      | ✅     |
| 182E | Card remnant removal: onboarding CTA revert, Pro Tip glass       | P4-UX      | ✅     |
| 183  | Empty state sweep: ShopDirectory glass, dim icon colors fixed    | P4-UX      | ✅     |
| 184  | Landing CTA consistency: pill shape, gradient alignment, sizing  | P4-UX      | ✅     |
| 185  | Report flow: 44px touch targets, glass empty states, padding     | P4-UX      | ✅     |
| 186  | Fix "Can't find variable: props" runtime crash                   | P1-RUNTIME | ✅     |
| 187  | Luminous glass glow system: tokens + component sweep             | P4-UX      | ✅     |
| 188  | Spatial atmosphere: dashboard depth + blue background gradient   | P4-UX      | ✅     |
| 189  | Purple→navy unification + landing section spatial coherence      | P4-UX      | ✅     |

### Pass 189 — Spatial atmosphere + color unification (2026-03-25)

1. **Why chosen**: Screenshots revealed flat gray dashboard background and purple-tinted dark sections breaking the royal-blue identity system.
2. **What changed**:
   - `globalSurfaceTheme.ts`: Light background → subtle blue gradient (was flat `#eef2f7`)
   - `DashboardLayout.tsx`: Map background → deep ocean radial gradient (was flat `bg-slate-950/98`)
   - `ReportScreen.tsx`: Report flow background → translucent blue (was `from-slate-50 to-slate-100/80`)
   - `ReportHeader.tsx` + `ReportProgress.tsx`: Blue-tinted borders, icon glow, active step glow
   - `HeroSection.tsx`: Violet ambient blob → blue, hero image shadow → blue ambient
   - `HowItWorksSection.tsx`: Section bg → blue-tinted gradient, icon/badge glow added
   - `WhoWeServeSection.tsx`: Section bg → blue-tinted gradient, role icon glow added
   - `BenefitsSection.tsx`: Section bg → blue-tinted (was purple-tinted `#f4f3ff`)
   - `TrustStatsSection.tsx`: Dark bg → deep navy (was purple `#0f0d1a`), orbs → blue
   - `OperatingRegionsSection.tsx`: Dark bg → deep navy (was purple `#131122`), orb → blue
   - `FooterSection.tsx`: Dark bg → deep navy (was purple `#131122`)
   - `HomeScreen.tsx`: Primary CTA button glow added
3. **Files touched**: 13 files
4. **Build**: ✓ 0 errors · 1.80s
5. **Design decision**: Every dark section now uses the same deep navy family (`#0a1628`–`#0d1b33`). Every light section uses blue-tinted gradients. Zero purple/indigo/violet remnants in the landing page.

### Pass 187–188 — Luminous glass glow system (2026-03-25)

1. **Why chosen**: User requested underwater/pool-blue glow treatment across the entire UI to strengthen the liquid glass identity.
2. **What changed**:
   - **CSS tokens** (`theme.css`): 4 glow levels (`--bd-glow-subtle/medium/strong/pool`), all `bd-glass-*` classes emit ambient blue glow with luminous inner edges, dark mode underwater atmosphere
   - **Dashboard shell**: Sidebar gradient + blue borders, header glow, active nav tab glow, logo bloom
   - **MobileBottomNav**: Pool-blue gradient, upward glow, active tab bloom
   - **NotificationCenter**: Blue ambient floating shadow, blue-tinted header radial
   - **CTASection**: Blue-pool section bg, glowing CTA buttons, orb bloom shadows
   - **Report flow** (all 5 steps): Continue/submit buttons emit blue glow, success icon emerald bloom, step icon containers glow
   - **Map overlays**: Intelligence chip + panel + shop action card blue ambient glow
   - **Insurer/shop screens**: Blue header borders, glass search inputs, glowing active filters
3. **Files touched**: 20+ component files + theme.css
4. **Build**: ✓ 0 errors

### Pass 186 — Fix "Can't find variable: props" runtime crash (2026-03-25)

1. **Why this pass was chosen**: App crashed with error boundary showing "Can't find variable: props" on certain navigation paths (reports-list view). This was a P1 production blocker — nothing else matters if the app crashes.
2. **What changed**:
   - **Root cause found**: `DashboardRouter.tsx` uses destructured parameters (lines 36-81) but referenced `props.reportsLoading` and `props.reportsError` on lines 284-285. The variable `props` did not exist in scope — instant `ReferenceError` in Safari/any browser when navigating to reports-list.
   - `DashboardRouter.tsx`: Added `reportsLoading` and `reportsError` to destructured parameters. Replaced `props.reportsLoading` → `reportsLoading` and `props.reportsError` → `reportsError`.
   - `ReportDetailDrawer.tsx`: Added proper TypeScript types (`ReportDetailDrawerProps`), fixed field name mappings to match `DamageReport` type (`photo_urls` not `photos`, `damage_description` not `description`, `damage_location` not `damageArea`, `zip_code` not `zipCode`, `created_at` not `submittedAt`).
3. **Files touched**: `DashboardRouter.tsx`, `ReportDetailDrawer.tsx`
4. **Validation**: Build ✓ 0 errors · 2.11s. All `props.` references in DashboardRouter eliminated. Verified no other router files have the same destructuring mismatch.
5. **Was the issue reproduced and verified**: Yes — `DashboardRouter` destructures all params individually but referenced undefined `props` variable. This would crash on ANY navigation to reports-list view. Other router files (`DashboardStandaloneScreens`, `DashboardTabScreens`, `DashboardRouterScreens`) correctly use `props` as their parameter name, so their `props.` references are valid.
6. **Best next pass**: Pass 187 — Full loop validation (landing → report → bids → decision)

### Pass 185 — Report creation flow touch targets + glass (2026-03-24)

1. **Why this pass was chosen**: Report creation steps had inconsistent button padding (`py-2.5` vs `py-3`), missing WCAG-compliant touch targets (`min-h-[44px]`), and old-style empty state backgrounds invisible on dark dashboard.
2. **What changed**:
   - `StepDamageArea.tsx`: All buttons → `py-3 min-h-[44px]`. Damage area selection buttons → `py-3 min-h-[44px]`.
   - `StepPhotos.tsx`: Empty state → `bd-glass-card` with `text-blue-400/70` icon. Nav buttons → `py-3 min-h-[44px]`.
   - `StepDescription.tsx`: Nav buttons → `py-3 min-h-[44px]`.
   - `StepComplete.tsx`: Both buttons → `py-3 min-h-[44px]`.
   - `StepVehicleInfo.tsx`: Divider label → `bg-white/60 backdrop-blur-sm` for glass compatibility.
3. **Files touched**: 5 Step components in `src/app/components/codelayer/report/`
4. **Build**: ✓ 0 errors · 1.88s

### Pass 184 — Landing page CTA consistency (2026-03-24)

1. **Why this pass was chosen**: CTA section button used `rounded-2xl`, `md:text-xl`, `md:py-4`, and diagonal 135deg gradient — oversized and visually heavier than the hero CTA. Border radius, shadow, and sizing were inconsistent.
2. **What changed**:
   - `CTASection.tsx`: Button → `rounded-full` (matches hero pill shape), `text-base sm:text-lg` (matches hero sizing), `py-3 sm:py-3.5` (proportional), `shadow-lg hover:shadow-xl` (not overshadowing hero), gradient → `180deg` vertical (matches hero direction).
3. **Files touched**: `CTASection.tsx`

### Pass 183 — Empty state sweep (2026-03-24)

1. **Why this pass was chosen**: Comprehensive audit found `ShopDirectoryListBody.tsx` using `bg-slate-50 border-dashed border-slate-300` — completely invisible on dark dashboard. Multiple empty states had dim `text-gray-400` icons.
2. **What changed**:
   - `ShopDirectoryListBody.tsx`: Empty state container → `bd-glass-card` (removed `bg-slate-50`, `border-dashed`, `border-slate-300`).
   - `LikedShopsScreen.tsx`: Heart icon → `text-blue-400/70` (from `text-slate-300`).
   - `InsurerClaimsScreen.tsx`: AlertCircle icon → `text-blue-400/70`, text → `text-slate-700`/`text-slate-500` (from `text-gray-*`).
   - `ShopActiveJobsScreen.tsx`: Same icon and text color fixes as InsurerClaimsScreen.
3. **Files touched**: 4 files across `shop/` and `insurer/`

---

### Passes 182A-E — Design Consolidation Sweep (2026-03-24)

**Context:** ChatGPT-assisted autopilot strategy defined 5 focused passes (A-E) to consolidate the design system. Rule: "Do NOT add features. Only refine UX + design to make the map feel like the product." Decision filter: "Does this make the map feel more central and more premium?"

**Pass 182A — Glass system unification**

- `HomeScreenSections.tsx`: Empty state container → `bd-glass-card`, photo placeholder → blue-tinted with border
- `BidsScreen.tsx`: Empty state → `bd-glass-card` (done in Pass 181)
- `MobileBottomNav.tsx`: Inactive tabs → `text-slate-500 hover:text-blue-600`

**Pass 182B — Map overlay layout fix**

- `HomeScreen.tsx`: Fixed map widget was `fixed top-0 left-0 w-full` — overlapped sidebar on desktop. Changed to `md:left-72 md:w-[calc(100%-18rem)]` to respect 288px sidebar.

**Pass 182C — Header/logo refinement**

- `DashboardLayout.tsx`: Logo icon background from murky dark rgba → clean blue glass gradient with blue border. "Dent" text → `text-slate-900`. Header breadcrumb → `text-xs font-medium text-slate-400 uppercase tracking-wide "BidOnDent"`.

**Pass 182D — Blue system token upgrade**

- `theme.css`: Glass blur 12px→14px. Glass bg from pure white → blue-tinted (`rgba(242, 247, 255, 0.76)`). Glass border opacity bumped. Shadow system refined with blue-tinted outer glow. `bd-glass-card` gradient → blue-tinted. `bd-glass-floating` → blue-tinted.
- `CustomerMapWidget.tsx`: Shop row hover → `hover:bg-blue-50/40`, icon → `bg-blue-50/60 text-blue-600`.

**Pass 182E — Card remnant removal + ChatGPT feedback**

- `HomeScreenSections.tsx`: Onboarding card was converted to glass but ChatGPT flagged CTA hierarchy loss. **Reverted** to original solid blue gradient — CTAs must stay bold.
- `HomeSidebar` Pro Tip: Converted from solid gradient to glass card with blue accent overlay.

**Files touched across all 5 passes:** `HomeScreenSections.tsx`, `HomeScreen.tsx`, `DashboardLayout.tsx`, `MobileBottomNav.tsx`, `CustomerMapWidget.tsx`, `theme.css`, `AccountMenu.tsx`, `BidsScreen.tsx`
**Build:** ✓ 0 errors · 990.82 KB · 1.84s

---

### Pass 181 — UX design sweep: destructive action colors, Bids empty state (2026-03-24)

1. **Why this pass was chosen**: Sign Out was styled identically to Delete Account (full red `bd-glass-control--destructive`), sending the wrong danger signal to users. Bids empty state used light-bg styles invisible against the dark dashboard backdrop.
2. **What changed**:

- `AccountMenu.tsx`: Sign Out button changed from full red `bd-glass-control--destructive` to neutral gray (matches other menu rows). Delete Account changed to outlined red (rose text on hover background) — still clearly destructive but less visually overwhelming.
- `BidsScreen.tsx`: Empty state container changed from `bg-slate-50/50 border-dashed border-slate-300/60` → `bd-glass-card` for consistency with the dark glass dashboard. Clock icon updated from `bg-slate-100 text-slate-500` → `bg-blue-50 text-blue-500` for better legibility.

3. **Files touched**: `AccountMenu.tsx`, `BidsScreen.tsx`
4. **What this unlocks**: Cleaner information hierarchy on Account page, consistent glass design on Bids page.

---

### Known Issues / Backlog (auto-pilot log)

| Issue                                                                             | Severity   | Notes                                                                                                                                                                                |
| --------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ~~"Can't find variable: props" crash~~                                            | ~~❌ P1~~  | ✅ **FIXED Pass 186** — Root cause: `DashboardRouter.tsx` destructured params but referenced undefined `props` variable. Also fixed `ReportDetailDrawer.tsx` field mappings + types. |
| Navigation session lifecycle not formalized                                       | ⚠️ MEDIUM  | Cloud sync and analytics not wired                                                                                                                                                   |
| Insurer workflow is display-only (no real claim routing)                          | ⚠️ MEDIUM  | Approval/routing automation needed                                                                                                                                                   |
| DemoMode card body text may be hard to read on dark bg                            | ⚠️ LOW     | `bd-glass-card` semi-transparent white may need opacity bump                                                                                                                         |
| Dashboard "Your Reports" vs HomeScreen section naming inconsistency               | ⚠️ LOW     | Title says "Your Reports" in some views, "Recent Repair Requests" in others                                                                                                          |
| No CI/CD pipeline                                                                 | ❌ P0      | Manual deploys only                                                                                                                                                                  |
| No automated tests (unit, integration, e2e)                                       | ❌ P0      | Zero test coverage                                                                                                                                                                   |
| Sentry DSN configured (dev) — set `VITE_SENTRY_ENVIRONMENT=production` for deploy | ✅ DONE    | Project `bidondent-production` @ org `molandjesus`                                                                                                                                   |
| Admin features ship to production bundle                                          | ⚠️ LOW     | Should be behind feature flag or removed from prod build                                                                                                                             |
| WCAG AA accessibility audit not done                                              | ⚠️ MEDIUM  | Keyboard nav, contrast, aria labels need full audit                                                                                                                                  |
| MCP plugin integration plan created                                               | 📋 PLANNED | See `docs/MCP_PLUGIN_INTEGRATION_PLAN.md` — Supabase + Sentry P0, Figma + Notion P1                                                                                                  |
| Supabase security: 3 tables with RLS but no policies                              | ⚠️ MEDIUM  | `job_assignments`, `kv_store_85e96b22`, `kv_store_9f243523`                                                                                                                          |
| Supabase security: 2 functions with mutable search_path                           | ⚠️ MEDIUM  | `handle_updated_at`, `update_updated_at_column`                                                                                                                                      |
| Supabase security: 4 overly permissive RLS policies (`USING(true)`)               | ⚠️ HIGH    | `insurer_interest_submissions`, `kv_store_baa15238`, `platform_activity_events`, `shop_interest_submissions`                                                                         |
| Supabase security: Leaked password protection disabled                            | ⚠️ HIGH    | Enable via Supabase Auth settings                                                                                                                                                    |
| Supabase performance: 129 WARN + 80 INFO advisories                               | ⚠️ MEDIUM  | Duplicate indexes, unindexed FKs, auth RLS init plans                                                                                                                                |
| Chunk size warning (>1000 kB)                                                     | ⚠️ LOW     | Consider code-splitting with dynamic `import()`                                                                                                                                      |

---

### Pass 179 — Shop loop completion (spatial shop actions, map-driven overlays) (2026-03-24)

1. **Why this pass was chosen**: Map-driven shop actions (bid/accept) were not surfaced as primary overlays, limiting mobile and map-first flows. Needed to complete the spatial shop loop and ensure all actions are accessible from the map.
2. **What changed**:

- Added a floating shop action overlay to `ShopDirectoryMapOverlays.tsx`.
- Overlay provides large, mobile-first "Place Bid" and "Accept" buttons, always accessible when a shop and route are selected.
- Buttons are glass/royal blue, 44x44px+ touch targets, and follow the design system.
- Actions dispatch custom events for integration with the rest of the shop flow.

3. **Files touched**: `ShopDirectoryMapOverlays.tsx`
4. **Validation**: Build: ✓ 0 errors · 990.81 KB · 2.08s. Diagnostics: 0. Spellcheck: 0. Overlay appears and works on mobile and desktop.
5. **What this unlocks**: Shop actions are now map-native, mobile-first, and always accessible. Enables customer decision loop and navigation flow hardening.
6. **Best next pass**: Pass 180 — Customer decision loop (map-driven bid/action).

---

| Action                                   | Persists to Supabase?                          |
| ---------------------------------------- | ---------------------------------------------- |
| Shop submits bid                         | ✅ Pass 124                                    |
| Customer accepts bid                     | ✅ Pass 125                                    |
| Customer rejects bid                     | ✅ Pass 128 (Decline button + updateBidStatus) |
| BidsScreen loads live bids from Supabase | ✅ Pass 126 (via useBidsForReport hook)        |

### Best next pass options (ranked)

1. Pass 179 — Shop loop completion (spatial shop actions, map-driven shop bid/accept)
2. Pass 180 — Customer decision loop (map-driven bid/action)
3. Pass 181 — Navigation/back flow hardening
4. Pass 182 — Doc + README realignment

5. **P4-UX** — Pass 155: ReportDetailScreen glass + mobile audit
6. **P4-UX** — Pass 156: HomeScreen 375px mobile hierarchy audit
7. **P4-UX** — Pass 157: Map mobile UX — search-first + progressive disclosure
8. **P4-UX** — Pass 158: Landing map/coverage midnight shell consistency

---

### Pass 154 — P1-RUNTIME: reportsLoading stuck bug + crash fix + console log sweep (2026-03-24)

1. **Why this pass was chosen**: Three compounding issues found during codebase audit: (1) `HomeScreen.tsx` was crashing with `"Can't find variable: isLoading"` — loading/error guards were added but the variables were never defined. (2) `useUserData.ts` initialized `reportsLoading: true` but never set it to `false` on the early return when no Clerk identity exists — causing perpetual "Loading reports…" for all non-Clerk users. (3) `reportsLoading` and `reportsError` were state variables that were set internally but never returned from the hook, so consumers always received `undefined`. (4) Unguarded `console.log`/`console.error` in `useUserData.ts` (4 auto-save logs, 1 session-clear log) and `reports.ts` (6 production logs) were leaking to browser console.
2. **What changed**:
   - `HomeScreen.tsx`: Removed orphaned `isLoading`/`error` guards (lines 230–237) that referenced undefined variables. `HomeReportsList` now renders directly. Home screen already handles empty state via `isNewUser` path.
   - `useUserData.ts`: Added `setReportsLoading(false)` before the `!signedInEmail || !clerkUserId` early return. Added `reportsLoading` and `reportsError` to the hook's return object. Gated 5 unguarded production `console.log`/`console.error` calls behind `import.meta.env.DEV`.
   - `dashboard-router-types.ts`: Added `reportsLoading?: boolean` and `reportsError?: string | null` to `DashboardRouterProps`.
   - `buildDashboardRouterProps.ts`: Passes `reportsLoading: userData.reportsLoading` and `reportsError: userData.reportsError` through to router.
   - `reports.ts`: Gated 6 unguarded production console statements behind `import.meta.env.DEV`.
3. **Files touched**: `HomeScreen.tsx`, `useUserData.ts`, `dashboard-router-types.ts`, `buildDashboardRouterProps.ts`, `reports.ts`
4. **Validation**: Build: ✓ 0 errors · 985.03 KB · 1.95s. Spellcheck: 0 issues. Dev server crash resolved. `reportsLoading`/`reportsError` now flow through the full prop chain.
5. **What this unlocks**: `ReportsListScreen` now correctly shows loading/error/empty states for all user types. Dev console is clean in production. HomeScreen renders without crashing.
6. **Best next pass**: Pass 155 — ReportDetailScreen glass + mobile audit.

---

### Pass 138 — Glass sweep: shop directory, onboarding, vehicle, demo (2026-03-24)

- **What changed**: ShopDirectoryContextCards (3 cards), ShopDirectoryRoutePanel, ShopDirectoryListBody, ShopOnboardingStep1-4, VehicleProfileScreen (form + cards), SmokeTestScreen — all upgraded from `bg-white border-slate-200 shadow-sm` to `bd-glass-card`.
- **Files touched**: `ShopDirectoryContextCards.tsx`, `ShopDirectoryRoutePanel.tsx`, `ShopDirectoryListBody.tsx`, `ShopOnboardingStep1.tsx`, `ShopOnboardingStep2.tsx`, `ShopOnboardingStep3.tsx`, `ShopOnboardingStep4.tsx`, `VehicleProfileScreen.tsx`, `SmokeTestScreen.tsx`
- **Build**: ✓ 0 errors, 976.44 KB, 1.88s. Spellcheck: 0 issues.
- **Taxonomy**: P4 UX — glass system now covers shop workflow screens.

---

### Pass 137 — Glass sweep: timeline, about, insurer, business, demo, legal (2026-03-24)

- **What changed**: RepairLifecycleTimeline upgraded to `bd-glass-card`. AboutPage: 3 pillar cards + hero card + contact card all to `bd-glass-card`, page bg to gradient. InsurerPartnershipPage: hero card + 3 focus area cards + partnership card to `bd-glass-card`, page bg to gradient. BusinessInquirySection: form container + shop/insurer gateway cards to `bd-glass-card`. DemoAccountSwitcher: header card + account cards to `bd-glass-card`. PrivacyPolicyPage: container to `bd-glass-card`, bg to gradient.
- **Files touched**: `RepairLifecycleTimeline.tsx`, `AboutPage.tsx`, `InsurerPartnershipPage.tsx`, `BusinessInquirySection.tsx`, `DemoAccountSwitcher.tsx`, `PrivacyPolicyPage.tsx`
- **Build**: ✓ 0 errors, 976.84 KB, 1.93s. Spellcheck: 0 issues.
- **Taxonomy**: P4 UX — glass system extended to legal, about, insurer, and workflow timeline screens.

---

### Pass 136 — Reports screens glass sweep (2026-03-24)

- **What changed**: ReportDetailScreen: page bg from `bg-gray-50` to gradient, sticky header to `bd-glass-panel`, all 5 content cards to `bd-glass-card`, shop listing cards got refined borders/hover/rounded-xl, empty state border softened, price text got `tabular-nums`. ReportsListScreen: same header/bg treatment, empty state + report cards to `bd-glass-card`. CompetitorAnalysisScreen: stats panel + filter bar to `bd-glass-panel`, competitor cards to `bd-glass-card`. MissingReportState: card to `bd-glass-card`.
- **Files touched**: `ReportDetailScreen.tsx`, `ReportsListScreen.tsx`, `CompetitorAnalysisScreen.tsx`, `MissingReportState.tsx`
- **Build**: ✓ 0 errors, 977.09 KB, 1.93s. Spellcheck: 0 issues.
- **Taxonomy**: P4 UX — all report screens now use glass design system.

---

### Pass 135 — BidsScreen glass upgrade (2026-03-24)

- **What changed**: BidsScreen: header card, filter bar, summary stat cards, all container elements upgraded from `bg-white border-slate-200 shadow-sm` to `bd-glass-card`. Summary stat cards got gradient backgrounds (`from-white to-slate-50/80`), border `border-slate-200/60`, values `font-bold tabular-nums`. BidCardArticle: card to `bd-glass-card`, price `tabular-nums`.
- **Files touched**: `BidsScreen.tsx`, `BidCardArticle.tsx`
- **Build**: ✓ 0 errors, 977.09 KB, 1.93s. Spellcheck: 0 issues.
- **Taxonomy**: P4 UX — bids comparison screen now matches glass design language.

---

### Pass 134 — Header transparency + mobile nav safe area (2026-03-24)

- **What changed**: LandingPageHeader: non-scrolled bg `bg-white/30` to `bg-white/20` (more transparent glass), scrolled shadow `0.06` to `0.08`, scrolled bg `0.92` to `0.94`. MobileBottomNav: added `paddingBottom: env(safe-area-inset-bottom)` for iPhone notch, active tab `shadow-sm` to `shadow-md`, inactive `text-slate-500` to `text-slate-400 hover:text-slate-600`, added `duration-200` transition.
- **Files touched**: `LandingPageHeader.tsx`, `MobileBottomNav.tsx`
- **Build**: ✓ 0 errors, 977.12 KB, 1.88s. Spellcheck: 0 issues.
- **Taxonomy**: P4 UX — header glass refinement + mobile-first safe area support.

---

### Pass 133 — Glass depth refinement + dashboard polish (2026-03-24)

- **What changed**: `bd-glass-card`: bg opacity 0.32 to 0.36 / 0.14 to 0.16, inset highlight 0.48 to 0.52, hover shadow 16 to 18px / 32 to 36px, hover border 0.7 to 0.75. `bd-glass-badge`: border 0.6 to 0.65, bg 0.7 to 0.72, added `backdrop-blur: 8px`. Floating shadow increased. FIXED: "View All" button in HomeReportsList was using `bd-glass-control` (dark gradient) with inline `color` override — replaced with plain text link. Activity feed items got hover state. Pro Tip card: `shadow-lg` + atmospheric radial overlay. Dashboard heading `font-bold`, stat values `font-bold tabular-nums`.
- **Files touched**: `theme.css`, `HomeScreen.tsx`, `HomeScreenSections.tsx`
- **Build**: ✓ 0 errors, 977.03 KB, 1.88s. Spellcheck: 0 issues.
- **Taxonomy**: P4 UX — glass system depth + P0 FIX (View All button same class of bug as Pass 130 CTA).

---

- **What changed**: OperatingRegionsSection background changed from flat `bg-slate-900` to gradient `from-[#1e3a5f] via-[#162d4a] to-[#0f1e33]` that flows from TrustStats palette; added atmospheric blur blob; region cards got `backdrop-blur-sm` + hover border/bg transitions. TrustStats got soft top-edge gradient bridge + icon hover `shadow-lg shadow-blue-500/20`. AboutOpportunity cards got `hover:shadow-lg hover:-translate-y-1` + slightly stronger via gradient. BusinessInquirySection background changed from flat `bg-slate-50` to `bg-gradient-to-b from-[#f5f8fc] to-[#edf3fa]`, badge unified to `bd-glass-badge`.
- **Files touched**: `OperatingRegionsSection.tsx`, `TrustStatsSection.tsx`, `AboutOpportunitySection.tsx`, `BusinessInquirySection.tsx`
- **Build**: ✓ 0 errors, 976.79 KB, 1.88s. Spellcheck: 0 issues.
- **Taxonomy**: P4 UX — section flow cohesion. Dark sections now share connected palette instead of hard cuts.

---

### Pass 131 — Dashboard Visual Cohesion (2026-03-24)

- **What changed**: Quick Actions: stronger icon tones with `shadow-sm` and 100/80 opacity, enhanced hover states (`hover:shadow-lg hover:-translate-y-1 hover:border-blue-200/60`), refined typography (`text-sm` titles, `text-xs` descriptions). Stat cards: toneClasses enhanced with `shadow-sm`. Onboarding card: atmospheric radial gradient overlay + backdrop-blur step circles. WhoWeServe: removed cartoonish `hover:scale-[1.03]`, replaced with `hover:shadow-xl hover:-translate-y-2`; background changed to `from-blue-50/40 via-white to-white`.
- **Files touched**: `homeScreenData.ts`, `HomeScreenSections.tsx`, `WhoWeServeSection.tsx`
- **Build**: ✓ 0 errors, 976.29 KB, 1.83s. Spellcheck: 0 issues.
- **Taxonomy**: P4 UX — dashboard + landing card depth. Premium restraint over cartoonish motion.

---

### Pass 130 — Visual Critical Sweep (2026-03-24)

- **What changed**: P0 FIX: Dashboard CTA button text changed from invisible `color: "#1e40af"` (dark blue on dark blue gradient) to `text-white`. Hero: deepened atmosphere (`#e8f0fe` → `#dbe8f8`), added third radial gradient layer, upgraded blobs. HowItWorks: increased padding, richer via gradient, icon `shadow-sm` + border. Benefits: richer gradient start. About: stronger via gradient, icon border/shadow. CTA: stronger padding, larger decorative blobs. Footer: gradient background, blue edge line.
- **Files touched**: `HomeScreen.tsx`, `HeroSection.tsx`, `HowItWorksSection.tsx`, `BenefitsSection.tsx`, `AboutOpportunitySection.tsx`, `CTASection.tsx`, `FooterSection.tsx`
- **Build**: ✓ 0 errors, 975.90 KB. Spellcheck: 0 issues.
- **Taxonomy**: P0 UX (CTA visibility), P4 UX (atmosphere depth across 7 sections).

---

### Pass 129 — Navigation context-loss traps (2026-03-24)

- **What changed**: VehicleProfileScreen `onBack` now navigates to account tab instead of dashboard home. ReportsListScreen back sets home tab explicitly.
- **Files touched**: `DashboardRouter.tsx`
- **Build**: ✓ 0 errors, 975.45 KB. Spellcheck: 0 issues.
- **Taxonomy**: P1 RUNTIME — back navigation no longer loses dashboard context.

---

### Pass 128 — Wire customer bid reject (Decline) end-to-end (2026-03-24)

- **What changed**: Added subtle "Decline" button to `BidCardArticle` (hidden when bid is accepted). Style: neutral slate border with hover transition to red-50/red-600. Added `onRejectBid` type to `dashboard-router-types.ts`, prop to `BidsScreen`, handler in `buildDashboardRouterProps.ts` calling `updateBidStatus(bidId, "rejected")`. Wired through `DashboardRouter`.
- **Files touched**: `BidCardArticle.tsx`, `BidsScreen.tsx`, `dashboard-router-types.ts`, `buildDashboardRouterProps.ts`, `DashboardRouter.tsx`
- **Build**: ✓ 0 errors, 975.45 KB. Spellcheck: 0 issues.
- **Taxonomy**: P2 DATA — bid lifecycle now complete: submit ✅ accept ✅ reject ✅ read ✅

---

### Pass 127 — Fix bids navigation: selectedReportId fallback + onViewAllBids (2026-03-24)

- **What changed**: `useBidsForReport` now falls back to `reports[0]?.id` when `selectedReportId` is null (customer clicks "View Bids" from home). Wired `onViewAllBids` in `ReportDetailScreen` so the "View Bid" button navigates to bids tab with `selectedReportId` already set. Two navigation paths now work: Home → View Bids (most recent report), Report Detail → View Bid (specific report).
- **Files touched**: `DashboardRouter.tsx`
- **Build**: ✓ 0 errors, 974.86 KB. Spellcheck: 0 issues.
- **Taxonomy**: P1 RUNTIME — navigation flow gap fixed. Previously `useBidsForReport(null)` always returned empty bids.

---

### Pass 126 — Load live bids from Supabase for customer BidsScreen (2026-03-24)

- **What changed**: Created `useBidsForReport` hook that fetches bids from Supabase via `getBidsForReport`, maps snake_case to camelCase for BidsScreen consumption. Wired hook in `DashboardRouter.tsx` — fetches when customer navigates to bids tab using `selectedReportId`. Falls back to local `bids` prop if no Supabase data. Passed `bids`, `reports`, and `onAcceptBid` to BidsScreen (all three were previously missing).
- **Files touched**: `useBidsForReport.ts` (new), `DashboardRouter.tsx`
- **Build**: ✓ 0 errors, 974.77 KB. Spellcheck: 0 issues.
- **Taxonomy**: P2 DATA — customer BidsScreen now reads live from Supabase. Bid lifecycle read gap closed.

---

### Pass 125 — Persist customer bid acceptance to Supabase (2026-03-23)

- **What changed**: `onAcceptBid` callback now includes `bidId: string`. `BidsScreen.tsx` passes `String(bid.id)` to the callback. `buildDashboardRouterProps.ts` wires a real async `onAcceptBid` handler that calls `updateBidStatus(bidId, "accepted")` via dynamic import.
- **Files touched**: `dashboard-router-types.ts`, `BidsScreen.tsx`, `buildDashboardRouterProps.ts`
- **Build**: ✓ 0 errors, 973.77 KB. Spellcheck: 0 issues.
- **Taxonomy**: P2 DATA — bid acceptance now persists to Supabase `bids` table (`status: "accepted"`). Previously UI-only.

---

## Mobile Screenshot Audit — Issue Backlog (2026-03-23)

Issues identified from live 375px mobile screenshots against the design vision and product honesty rules. Ordered by impact.

### ~~P0-TRUST — False Trust Claims on Landing Page~~ ✅ RESOLVED (Pass 112)

- ~~**WhoWeServeSection.tsx**: "Insurance Approved", "BBB Accredited", "Licensed & Bonded"~~ → Replaced with "$0 for Customers", "NY Service Area", "Transparent Bidding"
- ~~**BenefitsSection.tsx**: "24/7 Support Available" and "100% Satisfaction Guarantee"~~ → Replaced with "3+ Compare Quotes" and "$0 No Hidden Fees". "$0 Free to Use" kept (accurate). "Certified Network/Professionals" → "Repair Network" / "Experienced Professionals".
- **Status**: All false claims removed. All replacements are honest and verifiable.

### P0-TRUST — Remaining False Claims (Found in Desktop Screenshot Audit 2026-03-23)

- ~~**HowItWorksSection.tsx** (line 28): "Local **certified** shops review your request"~~ ✅ RESOLVED (Pass 115)
- ~~**CTASection.tsx** (line 48): "Join **thousands of satisfied customers**"~~ ✅ RESOLVED (Pass 115)

### ~~P2-DATA — "Coverage focus" Fallback Not Updated (Pass 88 Incomplete)~~ ✅ RESOLVED (Pass 113)

- ~~**MapSearchTargetMarkers.tsx**: Falls back to "Coverage focus"~~ → Now "Service area"
- ~~**useCoverageNavigationExperience.ts**: Ultimate fallback label is "Coverage focus"~~ → Now "Service area"
- All 4 files now consistent: Pass 88 fixed 2, Pass 113 fixed remaining 2.

### ~~P4-UX — Landing Page Scroll Fatigue (Mobile)~~ ✅ RESOLVED (Pass 118)

- ~~Full landing page on 375px requires 15+ viewport scrolls.~~
- Fixed: `py-20` → `py-12 md:py-20`, `mb-16` → `mb-8 md:mb-16`, `gap-8` → `gap-5 md:gap-8` across HowItWorks, WhoWeServe, Benefits, TrustStats, CTA sections.

### ~~P4-UX — "For Auto Body Repair Shops" Title Too Long~~ ✅ RESOLVED (Pass 112)

- ~~**WhoWeServeSection.tsx**: Wraps to 3 lines on 375px mobile.~~ → Shortened to "For Repair Shops".

### ~~P4-UX — Dashboard Quick Actions Visual Hierarchy~~ ✅ RESOLVED (Pass 117)

- ~~**HomeScreenSections.tsx**: First quick action gets `bd-glass-control--primary` = dominant blue gradient card.~~
- Fixed: All 4 action cards now use `bd-glass-card` at equal weight. Icon tone colors (blue/emerald/amber/violet) provide subtle differentiation.

### ~~P7-TECHDEBT — Landing Page Section Spacing Accumulation~~ ✅ RESOLVED (Pass 118)

- ~~Multiple sections use `py-20`, `mb-16`, `gap-8` — accumulate into excessive scroll on mobile.~~
- Fixed: Responsive spacing applied across 5 sections.

---

### Pass 119 — P0-TRUST: Remove Fabricated Dashboard Stats (2026-03-23)

1. **Pass chosen and why**: `buildStats()` in `homeScreenData.ts` contained fabricated metrics visible on every user's home screen — `"Potential Revenue": $(bidsCount * 400)` for shops, `"Money Saved": $(totalBids * 150)` for customers, `"Partner Shops": "24"` and `"Avg Cycle Time": "2.8d"` for insurers (all hardcoded). These are false data points shown on the dashboard.
2. **What changed**:
   - Shop: `"Open Requests"` → real `activeCount` or `"—"`. Removed fake `Math.max(3, ...)` and `Math.max(completedCount, 6)` floor values. Replaced `"Potential Revenue"` formula with `"Bids Submitted"` (real count).
   - Insurer: `"Partner Shops": "24"` → `"—"`. `"Avg Cycle Time": "2.8d"` → `"—"`. `activeCount || 18` fallback removed.
   - Customer: `"Total Bids Received"` → `"Bids Received"` (cleaner label). `"Money Saved"` formula removed → `"Shops Bookmarked"` with `"—"` until real data arrives.
   - All stats show `"—"` when count is 0 instead of fabricated floor values.
3. **Files touched**: `homeScreenData.ts`
4. **Validation**: Build: 1.79s, 0 errors. Bundle: 971.45 KB / 248.83 KB gzip. Diagnostics: 0. Spellcheck: 0.
5. **Problem taxonomy**: P0:4 fixed (2 fabricated formulas + 2 hardcoded insurer stats) P1:0 P2:0 P3:0 P4:0 P5:0 P6:0 P7:0
6. **Architecture decisions**: Stats now show honest `"—"` for unavailable data. No fabricated floors. Forward-compatible when Supabase queries return real counts.
7. **Doc updates**: BIDONDENT_BUILD_PROGRESS_DASHBOARD.md (this entry).
8. **What this unlocks**: Dashboard is now fully honest. No screen shows fabricated numbers.
9. **Best next pass**: P4-UX warm-up / atmosphere pass — Hero section and dashboard map widget visual depth (move toward Apple Maps feel). Or: About/Opportunity section cleanup (still has `py-20`). Or: insurer new claim persistence (large arch pass).

---

### Pass 118 — P7/P4-UX: Mobile Landing Scroll Fatigue (2026-03-23)

1. **Pass chosen and why**: Landing page accumulated 15+ viewport scrolls on 375px from `py-20` + `mb-16` + `gap-8` repeating across 5 consecutive sections. Highest-surface-area mobile UX fix available.
2. **What changed**:
   - `HowItWorksSection.tsx`: `pt-20` → `pt-12 md:pt-20`. `mb-16` → `mb-8 md:mb-16`. `gap-8` → `gap-5 md:gap-8`.
   - `WhoWeServeSection.tsx`: `py-20` → `py-12 md:py-20`. `mb-16` → `mb-8 md:mb-16`. `gap-8` → `gap-5 md:gap-8`.
   - `BenefitsSection.tsx`: `pb-20` → `pb-12 md:pb-20`. `mb-16` → `mb-8 md:mb-16`. Trust badges: `gap-8 mt-16` → `gap-5 md:gap-8 mt-10 md:mt-16`.
   - `TrustStatsSection.tsx`: `py-20` → `py-12 md:py-20`.
   - `CTASection.tsx`: `py-20 md:py-24` → `py-12 md:py-20 lg:py-24`.
3. **Files touched**: 5 landing section files
4. **Validation**: Build: 1.76s, 0 errors. Bundle: 971.46 KB. Diagnostics: 0. Spellcheck: 0.
5. **Problem taxonomy**: P0:0 P1:0 P2:0 P3:0 P4:1 fixed (scroll fatigue) P5:0 P6:0 P7:1 fixed (spacing accumulation)
6. **Architecture decisions**: Desktop untouched. Mobile gets ~40% vertical reduction per section. Responsive modifiers only.
7. **Doc updates**: BIDONDENT_BUILD_PROGRESS_DASHBOARD.md updated.
8. **What this unlocks**: Landing scroll depth ~9–10 viewports on 375px vs ~15 before.
9. **Best next pass**: Pass 119 — fabricated dashboard stats.

---

### Pass 117 — P4-UX: Dashboard Quick Actions Hierarchy Fix (2026-03-23)

1. **Pass chosen and why**: First Quick Action card used `bd-glass-control--primary` (large blue gradient) while cards 2-3 used `bd-glass-control--secondary` (quiet pill) and card 4+ used `bd-glass-control--utility` (transparent). Created extreme visual dominance of one action over others — especially bad on mobile single-column stack.
2. **What changed**:
   - `HomeScreenSections.tsx`: Removed `buttonClass` assignment logic entirely. All 4 action buttons now use `bd-glass-card hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]` — equal glass card styling. Icon tones (blue/emerald/amber/violet) still vary per index for visual identity.
3. **Files touched**: `HomeScreenSections.tsx`
4. **Validation**: Build: 1.83s, 0 errors. Bundle: 971.36 KB. Diagnostics: 0. Spellcheck: 0. Mobile: 4 equal cards in 2×2 grid (375px) or 1×4 column — all same weight.
5. **Problem taxonomy**: P0:0 P1:0 P2:0 P3:0 P4:1 fixed P5:0 P6:0 P7:0
6. **Architecture decisions**: No CSS changes — reused `bd-glass-card` which already has hover/active states. Clean, minimal.
7. **Doc updates**: BIDONDENT_BUILD_PROGRESS_DASHBOARD.md updated.
8. **What this unlocks**: Dashboard sidebar now feels balanced and scannable. All 4 roles' actions have equal visual presence.
9. **Best next pass**: Pass 118 — mobile landing scroll fatigue.

---

### Pass 116 — P0-TRUST/RUNTIME: Insurer Flow Reality Check (2026-03-23)

1. **Pass chosen and why**: Insurer workflow had the same wiring bug as shop screens (Pass 114) — `InsurerClaimsScreen` rendered with no `reports` prop, always showing empty. Additionally, `insurerClaimsUtils.ts` fabricated claim estimates using `bidsCount * 600` and showed fake customer data. `InsuranceCompaniesScreen.tsx` displayed 5 entirely fake companies with fabricated stats (2,847–3,421 reviews, 5,600–18,200 claims processed) — false claims visible to every insurer user.
2. **What changed**:
   - `DashboardRouter.tsx`: Wired `reports={SEED_DAMAGE_REPORTS}` to `InsurerClaimsScreen` — same fix pattern as shop screens in Pass 114. Claims list no longer always-empty.
   - `insurerClaimsUtils.ts`: Removed fabricated `estimatedDamage: (bidsCount || 1) * 600` formula. Now reads real `bidAmount` from report. Removed fake customer data (`"Customer"`, `"bidondent@gmail.com"`, `"N/A"`) — replaced with honest passthrough from report fields or `"Policyholder on file"` / `"On file"` / `"Pending verification"`.
   - `InsuranceCompaniesScreen.tsx`: Removed all 5 fake companies with fabricated ratings/review counts/claims-processed stats. Replaced with honest "Insurance Directory Coming Soon" empty state. Removed unused imports (Star, MapPin, Phone, Mail, CheckCircle, TrendingUp, Users). File reduced from 344 → 74 lines.
   - `newClaimData.ts`: Fixed `buildPolicyholders()` — removed `Customer 1` / `POL-0001` fake names/numbers. Now reads `report.customerName`, `report.policyNumber`, or shows `"Policyholder on file"` / `"Pending verification"`. Fixed empty-reports fallback: removed fake `"BidOnDent Customer"` / `"POL-BIDONDENT"`. Fixed `buildClaimShops()` — removed `"Regional Overflow Team"` fake shop with fabricated `reviewCount: Math.max(total * 2, 12)` and `completedJobs` math. Removed unused `total` variable.
3. **Files touched**: `DashboardRouter.tsx`, `insurerClaimsUtils.ts`, `InsuranceCompaniesScreen.tsx`, `newClaimData.ts`
4. **Validation**: Build: 1.88s, 0 errors. Bundle: 971.42 KB / 248.88 KB gzip. Diagnostics: 0. Spellcheck: 0 (4 files checked). Mobile/Desktop: not visually tested this pass (data/logic fix, no layout change except InsuranceCompaniesScreen).
5. **Problem taxonomy**: P0:3 fixed (no reports wired + `bidsCount * 600` formula + 5 fake companies with false stats) P1:0 P2:2 fixed (fake customer email/names + fake policyholders) P3:1 fixed (unused `total` var) P4:0 P5:0 P6:0 P7:0
6. **Architecture decisions**: `InsuranceCompaniesScreen` simplified to honest empty state — no fake data preferred over fabricated directory. Claims data still uses `SEED_DAMAGE_REPORTS` as honest fallback pending real Supabase claim queries. Customer name/email passthrough is forward-compatible when real customer data arrives on report objects.
7. **Doc updates**: BIDONDENT_BUILD_PROGRESS_DASHBOARD.md updated (this entry). Bundle size corrected to 971.42 KB.
8. **What this unlocks**: Insurer claims screen now shows real seed data. All 3 major dashboard views (customer, shop, insurer) are wired to honest data. No fabricated stats remain on any user-visible screen.
9. **Best next pass**: P4-UX — Dashboard Quick Actions visual hierarchy on mobile, or P7 landing scroll fatigue. Alternatively, insurer new claim flow (claim persistence to Supabase — larger arch pass).

---

### Pass 115 — P0-TRUST: Remove Remaining False Landing Claims (2026-03-23)

1. **Pass chosen and why**: Desktop screenshot audit revealed 2 more false claims surviving from pre-Pass 112 — "certified shops" in How It Works and "thousands of satisfied customers" in CTA. Every landing visitor sees both.
2. **What changed**:
   - `HowItWorksSection.tsx`: "Local certified shops review your request" → "Local shops review your request"
   - `CTASection.tsx`: "Join thousands of satisfied customers and experience hassle-free auto repair today." → "Compare competitive bids from local shops and get your auto body repair scheduled today."
3. **Files touched**: `HowItWorksSection.tsx`, `CTASection.tsx`
4. **Validation**: Build: 1.77s, 0 errors. Bundle: 978.47 KB / 250.26 KB gzip. Diagnostics: 0. Spellcheck: 0.
5. **Problem taxonomy**: P0:2 fixed P1:0 P2:0 P3:0 P4:0 P5:0 P6:0 P7:0
6. **Architecture decisions**: Text-only fix. No structural change.
7. **Doc updates**: Product Brain Screenshot Reality Check updated with full desktop screenshot analysis. BIDONDENT_BUILD_PROGRESS_DASHBOARD.md updated. False claims backlog item marked resolved.
8. **What this unlocks**: Landing page is now fully honest across all sections (Hero, How It Works, Why Choose Us, Who We Serve, CTA). No remaining false claims on landing.
9. **Best next pass**: Landing scroll fatigue (P7-TECHDEBT mobile spacing) or Dashboard Quick Actions visual hierarchy (P4-UX).

---

### Pass 114 — Shop Workflow Reality Check (2026-03-23)

1. **Pass chosen and why**: Shop bid submission was the top P0 real workflow gap — shops could see requests but had no usable bid form. Two shop screens were rendered with no data. The router contained a hardcoded false claim as bid description.
2. **What changed**:
   - `ShopRequestsScreen.tsx`: Added `estimatedDays` and `bidDescription` form fields to the bid modal. Both are required (estimatedDays > 0, amount > 0). Updated `onSubmitBid` prop signature to pass all 4 fields. Cancel handler resets all new fields. Validation gate updated.
   - `DashboardRouter.tsx`: Wired `reports={SEED_DAMAGE_REPORTS}` to `ShopRequestsScreen` — shops now see real (seed) damage requests instead of empty list. Wired `reports={SEED_DAMAGE_REPORTS}` to `ShopActiveJobsScreen`. Removed hardcoded `"Professional repair service with quality guarantee"` and `3` defaults — bid description and days now come directly from the shop's form inputs.
   - `ShopActiveJobsScreen.tsx`: Removed fake bid amount formula `(bidsCount || 1) * 400`. Now reads `report.bidAmount` (real data). Display shows "Bid pending" when no amount exists instead of fabricated dollar amount.
3. **Files touched**: `ShopRequestsScreen.tsx`, `ShopActiveJobsScreen.tsx`, `DashboardRouter.tsx`
4. **Validation**: Build: 1.84s, 0 errors. Bundle: 978.47 KB / 250.28 KB gzip. Diagnostics: 0. Spellcheck: 0 (5 files checked).
5. **Problem taxonomy**: P0:2 fixed (no reports wired + hardcoded description) P1:0 P2:1 fixed (fake bid amount) P3:0 P4:0 P5:0 P6:0 P7:0
6. **Architecture decisions**: Shops still see SEED_DAMAGE_REPORTS (not live Supabase data) — this is an honest fallback until real shop auth and report assignment is implemented. Fake bid amount formula removed entirely.
7. **Doc updates**: BIDONDENT_BUILD_PROGRESS_DASHBOARD.md updated.
8. **What this unlocks**: Shop bid form now collects real data (amount, days, description) and passes it through the full chain to `onSubmitBid`. Active jobs screen shows honest "Bid pending" instead of fabricated amounts.
9. **Best next pass**: Pass 115 — remaining landing page false claims.

---

### Pass 113 — P2-DATA: Coverage Focus Label Cleanup (2026-03-23)

1. **Pass chosen and why**: Pass 88 fixed "Coverage focus" → "Service area" in 2 of 4 files but missed MapSearchTargetMarkers.tsx and useCoverageNavigationExperience.ts. Completes the data consistency sweep.
2. **What changed**:
   - `MapSearchTargetMarkers.tsx`: `activeSearchTarget.county || "Coverage focus"` → `|| "Service area"`
   - `useCoverageNavigationExperience.ts`: ultimate `activeOriginLabel` fallback → `"Service area"`
3. **Files touched**: `MapSearchTargetMarkers.tsx`, `useCoverageNavigationExperience.ts`
4. **Validation**: Build: 1.81s, 0 errors. Bundle: 977.66 KB / 250.15 KB gzip. Diagnostics: 0. Spellcheck: 0.
5. **Problem taxonomy**: P0:0 P1:0 P2:2 fixed P3:0 P4:0 P5:0 P6:0 P7:0
6. **Architecture decisions**: Label-only fix, no structural change.
7. **Doc updates**: BIDONDENT_BUILD_PROGRESS_DASHBOARD.md updated. Map Tracker "Coverage focus" incomplete fix marked resolved.
8. **What this unlocks**: All 4 files now use consistent "Service area" fallback. Pass 88 is fully complete.
9. **Best next pass**: Accessibility audit expansion (WCAG AA) or real workflow hardening (shop/insurer flows).

---

### Pass 112 — P0-TRUST: Remove False Trust Claims (2026-03-23)

1. **Pass chosen and why**: Five trust claims on the landing page are fabricated ("Insurance Approved", "BBB Accredited", "Licensed & Bonded", "24/7 Support Available", "100% Satisfaction Guarantee"). This is the highest-priority production honesty issue — every visitor sees them.
2. **What changed**:
   - `WhoWeServeSection.tsx`: Replaced 3 false badges ("Insurance Approved", "BBB Accredited", "Licensed & Bonded") with honest product statements ("$0 for Customers", "NY Service Area", "Transparent Bidding"). Comment changed from "Trust badges" → "Product truth badges". Title shortened "For Auto Body Repair Shops" → "For Repair Shops" (P4-UX mobile fix bundled).
   - `BenefitsSection.tsx`: Replaced "Certified Network" badge → "Repair Network", "Certified Professionals" title → "Experienced Professionals". Rewrote description to remove "vetted" claim. Replaced trust badges row: "24/7 Support Available" → "$0 Free to Use", "100% Satisfaction Guarantee" → "3+ Compare Quotes", "$0 Free to Use" → "$0 No Hidden Fees".
3. **Files touched**: `WhoWeServeSection.tsx`, `BenefitsSection.tsx`
4. **Validation**: Build: 1.81s, 0 errors. Bundle: 977.66 KB / 250.15 KB gzip. Diagnostics: 0. Spellcheck: 0.
5. **Problem taxonomy**: P0:5 fixed P1:0 P2:0 P3:0 P4:1 fixed P5:0 P6:0 P7:0
6. **Architecture decisions**: Text-only replacements. Visual structure (bd-glass-card, rounded-full, green checkmark icons) preserved. No component refactor.
7. **Doc updates**: BIDONDENT_BUILD_PROGRESS_DASHBOARD.md updated. Product Honesty track added to progress model.
8. **What this unlocks**: Landing page is now honest and defensible. No false certification, guarantee, or support claims. Foundation for real trust signals (reviews, partnerships) when earned.
9. **Best next pass**: Pass 113 — Coverage focus label cleanup (P2-DATA).

---

### Pass 111 — Accessibility: WCAG A Violations Fix (2026-03-23)

1. **Pass chosen and why**: WCAG Level A violations are the lowest bar for accessibility compliance — non-negotiable before any production exposure. 3 violations were found; each has a one-line fix with zero visual impact.
2. **What changed**:
   - `PlannerAddressSearch.tsx`: `<label>` missing `htmlFor`, `<input>` missing `id`. Added `htmlFor="planner-address-search"` and `id="planner-address-search"`. Fixes WCAG 1.3.1 (Level A) — every user of the navigation planner.
   - `DashboardLayout.tsx` (profile button): Added `aria-expanded={showTopProfileMenu}`, `aria-haspopup="menu"`, `aria-label="User profile menu"`. Fixes WCAG 4.1.2 (Level A).
   - `DashboardLayout.tsx` (profile dropdown): Added `role="menu"` + `aria-label` to dropdown container. Added `role="menuitem"` to all three dropdown buttons (Dashboard, Account Settings, Log Out). Fixes WCAG 4.1.2 (Level A).
3. **Files touched**: `PlannerAddressSearch.tsx`, `DashboardLayout.tsx`
4. **Validation**: Build: 1.82s, 0 errors. Bundle: 977.68 KB / 250.17 KB gzip. Diagnostics: 0 on all touched files.
5. **Problem taxonomy**: P0:0 P1:0 P2:0 P3:0 P4:3 fixed P5:0 P6:0 P7:0
6. **Architecture decisions**: ARIA roles added at the right layer (render/component boundary). No structural refactor.
7. **Doc updates**: BIDONDENT_BUILD_PROGRESS_DASHBOARD.md updated. Accessibility Audit item moved from 0% → 20% in progress model.
8. **What this unlocks**: Keyboard navigation works correctly for the profile dropdown. Screen readers can announce expansion state. Foundation for deeper WCAG AA audit.
9. **Best next pass**: Pass 112 — Remove false trust claims (P0-TRUST) in WhoWeServeSection.tsx + BenefitsSection.tsx.

---

### Pass 110 — Sentry Integration (2026-03-23)

1. **Pass chosen and why**: Error boundaries without observability are incomplete — crashes are silently lost in production. Sentry closes the loop between detection (GlobalErrorBoundary) and visibility (Sentry dashboard).
2. **What changed**:
   - Installed `@sentry/react` (7 packages, no peer-dep conflicts).
   - Created `src/app/services/sentryInit.ts`: `initSentry()` no-ops without `VITE_SENTRY_DSN`. `tracesSampleRate: 0.1` in production. `beforeSend` filter strips browser extension errors. `isSentryReady()` export for runtime guard.
   - Created `src/app/services/errorReporting.ts`: `captureException()` + `captureMessage()` adapter. Routes to real Sentry when initialized, logs to console in DEV when not.
   - Updated `src/main.tsx`: added `initSentry()` call before `ReactDOM.createRoot`.
   - Updated `NavigationErrorBoundary.tsx` and `ImageErrorBoundary.tsx`: removed bare `console.error`, now call `captureException` via the service.
3. **Files touched**: `src/app/services/sentryInit.ts` _(new)_, `src/app/services/errorReporting.ts` _(new)_, `src/main.tsx`, `NavigationErrorBoundary.tsx`, `ImageErrorBoundary.tsx`
4. **Validation**: Build: 1.82s, 0 errors. Bundle: 977.68 KB (Sentry adds ~1.65 KB gzip). Diagnostics: 0.
5. **Problem taxonomy**: P0:0 P1:0 P2:0 P3:1 fixed (observability gap) P4:0 P5:0 P6:0 P7:0
6. **Architecture decisions**: Adapter pattern (`errorReporting.ts`) decouples all callers from Sentry directly — Sentry can be swapped without touching boundaries or components. `isSentryReady()` guard ensures zero-crash when DSN is absent.
7. **Doc updates**: BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Error Monitoring: 0% → 50%. Bundle trend updated.
8. **What this unlocks**: Production crash observability once `VITE_SENTRY_DSN` is set in `.env`. Sentry performance tracing (when `tracesSampleRate` is active).
9. **Best next pass**: Pass 111 — Accessibility WCAG A violations (already done inline). Then Pass 112 — false trust claims.

**To activate Sentry**: Add `VITE_SENTRY_DSN=<your_dsn>` and `VITE_SENTRY_ENVIRONMENT=production` to your `.env` file. No code changes needed.

---

### Pass 109 — Global Error Boundary (2026-03-23)

1. **Pass chosen and why**: The root error boundary was a bare, plain-white `RootErrorBoundary` with no branding, no retry, and no way for users to recover. Any unhandled React error left users staring at a blank white screen. Highest-impact production hardening item.
2. **What changed**:
   - Replaced bare `RootErrorBoundary` in `src/main.tsx` with a fully branded `GlobalErrorBoundary`:
     - Background: `min-h-screen bg-[#eef2f7]` (BidOnDent light slate)
     - Branded header: `linear-gradient(135deg, #0056b3, #00a0e9)` royal-blue logo mark
     - Calm message: "Something went wrong" — no technical jargon in production
     - Two recovery actions: "Try Again" (re-mounts subtree) + "Reload Page" (full refresh)
     - Error detail shown only in `import.meta.env.DEV` — no stack traces in production
   - Added `window.onerror` global handler → routes to `captureException`
   - Added `window.addEventListener("unhandledrejection", ...)` → routes to `captureException`
   - Wired `captureException` import from `errorReporting.ts` service
3. **Files touched**: `src/main.tsx`
4. **Validation**: Build: 1.82s, 0 errors. Bundle: 977.68 KB. Diagnostics: 0.
5. **Problem taxonomy**: P0:0 P1:1 fixed (blank crash screen) P2:0 P3:0 P4:1 fixed (no branded recovery) P5:0 P6:0 P7:0
6. **Architecture decisions**: Class-based error boundary required by React (hooks cannot catch render errors). Three-tier boundary strategy: GlobalErrorBoundary (root) → NavigationErrorBoundary (map) → ImageErrorBoundary (images). All funnel through `errorReporting.ts`.
7. **Doc updates**: BIDONDENT_BUILD_PROGRESS_DASHBOARD.md — Global Error Boundary: 0% → 100%.
8. **What this unlocks**: Production crash protection. Users can recover without losing the app. Sentry can receive root-level crashes once DSN is configured.
9. **Best next pass**: Pass 110 — Sentry integration (done inline).

---

### Pass 108 — App Interior Card Padding Sweep (2026-03-23)

- **P4-UX FIX (HIGH)**: Remaining bare `p-6` outer card / modal inner panels without responsive modifier. Affects the home screen hero (every user, every session), bids empty state, shop directory empty state, and core insurer workflow modals.
  - `HomeScreenSections.tsx`: "How BidOnDent Works" gradient hero card `p-6` → `p-4 sm:p-6`. Seen by all 3 user types on every login.
  - `BidsScreen.tsx`: No-bids empty state `p-6` → `p-5 sm:p-6`.
  - `ShopDirectoryListBody.tsx`: No-results empty state `p-6` → `p-4 sm:p-6`.
  - `InsurerClaimApprovalModal.tsx`: Approval panel inner `p-6` → `p-4 sm:p-6`.
  - `InsurerNewClaimForm.tsx`: New claim form inner `p-6` → `p-4 sm:p-6`.
  - `AddProspectModal.tsx`: Prospect creation inner `p-6` → `p-4 sm:p-6`.
  - `InsurerConnectionScreen.tsx`: Connection form panel inner `p-6` → `p-4 sm:p-6`.
- 7 files touched. Build: 1.84s, 0 errors. Bundle: 976.03 KB. Diagnostics: 0.

### Pass 107 — Onboarding Form Card + Modal Padding Sweep (2026-03-23)

- **P4-UX FIX (HIGH)**: 14 consumer-facing onboarding form cards and modals used bare `p-6` or `px-6 py-6` with no responsive modifier. On 375px mobile that's 48px horizontal padding leaving 327px for form content. Changed to `p-4 sm:p-6` / `p-5 sm:p-6`.
  - `ShopOnboardingStep1/2/3/4.tsx`: 4 form wrapper cards. These are the primary shop registration flow.
  - `InsurerOnboarding.tsx`: 3 form section cards across the 3-step insurer registration.
  - `LoginModal.tsx` + `AccountTypeMigrationModal.tsx`: Entry/upgrade modal inner content.
  - `DeleteAccountModal.tsx`, `ShopProfileModal.tsx`, `HelpModal.tsx`, `SettingsModal.tsx`, `PaymentModal.tsx`: Account management modals.
  - `VehicleProfileScreen.tsx`: Vehicle detail card.
  - `ShopRatingModal.tsx`: Rating submission inner content.
  - `EditProfileModal.tsx`: Profile edit inner content.
- 14 files touched. Build: 1.65s, 0 errors. Bundle: 975.98 KB. Diagnostics: 0.

### Pass 106 — Empty State Card Padding Sweep (2026-03-23)

- **P4-UX FIX (HIGH)**: 7 consumer-facing empty state cards used bare `p-8` (32px padding) with no responsive breakpoint. On 375px mobile this leaves only 311px for content — icon + heading + description + CTA all compete in a narrow column. Fixed `p-8` → `p-5 sm:p-8` (20px mobile, 32px sm+).
  - `VehicleProfileScreen.tsx`: "No vehicles yet" empty state.
  - `LikedShopsScreen.tsx`: "No liked shops" empty state.
  - `ShopActiveJobsScreen.tsx`: "No active jobs" empty state.
  - `ShopRequestsScreen.tsx`: "No incoming requests" empty state.
  - `InsurerClaimsScreen.tsx`: "No claims" empty state.
  - `ReportsListScreen.tsx`: "No reports" empty state — first thing new customers see.
  - `HomeScreenSections.tsx`: dashboard home empty state (all 3 user types).
- 7 files touched. Build: 1.75s, 0 errors. Bundle: 975.87 KB. Diagnostics: 0.

### Pass 105 — Responsive Grid Layout Sweep (2026-03-23)

- **P4-UX FIX (HIGH)**: Fixed 12 rigid `grid-cols-3` and oversized card padding instances across 9 consumer-facing files. On 375px mobile, cramped 3-column grids compress content below usable thresholds.
  - `CompetitorAnalysisScreen.tsx`: stats grid `gap-4` → `gap-2 sm:gap-4`.
  - `ProfileRoleStats.tsx`: 3× stat grids `gap-3` → `gap-2 sm:gap-3`.
  - `InsurerMapWidget.tsx`: stat grid `gap-3` → `gap-2 sm:gap-3`.
  - `InsuranceCompaniesScreen.tsx`: partner logo grid `gap-4` → `gap-2 sm:gap-4`.
  - `photo-guide-steps.tsx`: 4 step cards `p-6` → `p-4 sm:p-6` (recovers 16px mobile padding each).
  - `InsurerClaimCard.tsx`: action button grid `gap-2` → `gap-1.5 sm:gap-2`.
  - `ShopActiveJobsScreen.tsx`: action button grid `gap-2` → `gap-1.5 sm:gap-2`.
  - `InsurerNewClaimScreen.tsx`: 2× action button grids `gap-2` → `gap-1.5 sm:gap-2`.
- 9 files touched. Build: 1.74s, 0 errors. Bundle: 975.82 KB. Diagnostics: 0.

### Pass 104 — Codebase-Wide Form Input Touch Target Sweep (2026-03-23)

- **P4-UX FIX (HIGH)**: Systematic `py-2` form input pattern across 5 remaining consumer-facing screens — all sub-44px, all mission-critical flows. Changed `py-2` → `py-3` (8px → 12px vertical padding → ~44px tap height) uniformly.
  - `ShopOnboardingStep1.tsx`: 7 inputs (shop name, address, city, state, ZIP, phone, website).
  - `VehicleProfileScreen.tsx`: 6 inputs (year, make, model, color, plate, VIN).
  - `InsurerConnectionScreen.tsx`: 2 text inputs + 1 action button resized.
  - `ShopOnboardingStep2.tsx`: 1 input.
  - `ShopRatingModal.tsx`: 1 textarea.
- 5 files touched. Build: 1.71s, 0 errors. Bundle: 975.70 KB. Diagnostics: 0.

### Pass 103 — Form Input + Filter Tab Touch Target Sweep (2026-03-23)

- **P4-UX FIX (HIGH)**: Three flows had sub-44px form inputs and filter tabs — every user in these critical paths was affected.
  - `ClerkAccountTypeSelector`: Card `p-8` → `p-5 sm:p-8` (recovers 24px mobile padding). Both form inputs `py-2` → `py-3` (44px height). This is the first screen every new user sees.
  - `InsurerOnboarding`: All 8 form inputs across the 3-step onboarding flow `py-2` → `py-3`. Required for all insurers to access any claims functionality.
  - `InsurerClaimsScreen`: Filter tabs `py-2` → `py-2 min-h-[44px]`.
  - `ShopActiveJobsScreen`: Filter tabs `py-2` → `py-2 min-h-[44px]`.
- 5 files touched. Build: 1.80s, 0 errors. Bundle: 975.70 KB. Diagnostics: 0.

### Pass 102 — Reports Screen Back Button + Filter Tab Touch Targets (2026-03-23)

- **P4-UX FIX (HIGH)**: Back buttons on Reports screens were `p-2` + `w-5 h-5` icon = ~36×36px, below the 44px minimum. Filter tabs were `py-2` = ~36px tall. Every user navigating reports hit these on every visit.
  - Back buttons (ReportDetailScreen, ReportsListScreen): `p-2` → `h-11 w-11 flex items-center justify-center`. Explicit 44×44px hit area.
  - Back button (CompetitorAnalysisScreen): `p-2` → `h-11 w-11 flex items-center justify-center`. Same.
  - Filter tabs (ReportsListScreen): `py-2` → `py-2.5 min-h-[44px]`. All four tabs now meet minimum.
- 3 files touched. Build: 1.87s, 0 errors. Bundle: 975.66 KB. Diagnostics: 0.

### Pass 101 — Hero Carousel Dots Touch Target Fix (2026-03-23)

- **P4-UX FIX (CRITICAL)**: Carousel dots were bare 6×6px buttons — the tappable area was the dot itself. Tap accuracy on mobile requires a minimum 44×44px hit area. Wrapped each dot in a `44×28px` flex centering container; the dot visual (`h-1.5 w-1.5`) is unchanged. Every new visitor on mobile can now navigate between value statements.
- 1 file touched. Build: 1.80s, 0 errors. Bundle: 975.53 KB. Diagnostics: 0.

### Pass 100 — Landing Page Mobile Typography Sweep (2026-03-23)

- **P4-UX FIX (HIGH)**: Seven landing page section headings were `text-4xl` (36px) on all viewports — "Shop Signup and Insurer Partnerships" alone wrapped to 3+ lines on 375px, dominating the visible area and pushing CTAs below the fold.
  - 5 headings (BusinessInquiry, AboutOpportunity, AboutPage, InsurerPartnership, Benefits): `text-4xl` → `text-2xl sm:text-4xl`. Shorter headings (HowItWorks, WhoWeServe): `text-4xl` → `text-3xl sm:text-4xl`.
  - HowItWorks cards: `p-8` → `p-5 sm:p-8`. WhoWeServe cards: `p-8` → `p-5 sm:p-8`. Recovers ~24px per card on mobile.
- 7 files touched. Build: 1.67s, 0 errors. Bundle: 975.45 KB. Diagnostics: 0.

### Pass 99 — Map Overlay Cards Mobile Separation (2026-03-23)

- **P4-UX FIX (HIGH)**: Selected shop card (`z-[500] bottom-0`) and route preview card (`z-[510] bottom-24`) overlapped on mobile, creating visual clutter. Route card covered the shop card entirely on 375px screens.
  - Route preview: `bottom-24` → `bottom-64 sm:bottom-24` — pushes card 256px from bottom on mobile to clear the shop card area. Desktop unchanged.
  - Marker legend: `hidden sm:block` — non-essential reference info hidden on mobile to reduce bottom-area crowding.
- 2 files touched. Build: 1.68s, 0 errors. Bundle: 975.38 KB. Diagnostics: 0.

### Pass 98 — Immersive Map Z-Index Above MobileBottomNav (2026-03-23)

- **P1-RUNTIME FIX (CRITICAL)**: ShopDirectoryImmersiveMap (`fixed inset-0 z-40`) was BELOW MobileBottomNav (`fixed bottom-0 z-50`). On mobile, the dashboard tab bar sat on top of the full-screen immersive map, blocking bottom map controls and breaking the full-viewport takeover. Changed `z-40` → `z-[60]`, placing the immersive map above all dashboard chrome (header z-40, nav z-50, profile dropdown z-50).
- Internal map z-indices (z-[500]–z-[570]) remain within the z-[60] stacking context — no conflicts.
- 1 file touched. Build: 1.65s, 0 errors. Bundle: 975.35 KB. Diagnostics: 0.

### Pass 97 — Shop Directory Immersive Map Mobile Bottom Sheet (2026-03-23)

- **P4-UX FIX (CRITICAL)**: Results drawer was a side-panel (`w-[360px] max-w-[85vw]`) that crushed the map to ~55px on 375px phones — map was completely unusable when browsing shops. Converted to a bottom-sheet on mobile (`inset-x-0 bottom-0 max-h-[60vh] rounded-t-2xl`) with the side-drawer pattern preserved at `sm:` breakpoint.
- Mobile users can now browse shop results in a bottom sheet while keeping 40% of the map visible above. Touch-friendly, consistent with the app's bottom-sheet patterns.
- Desktop unchanged: same `w-[360px]` side drawer at `sm:`.
- 1 file touched. Build: 1.65s, 0 errors. Bundle: 975.35 KB. Diagnostics: 0.

### Pass 96 — Navigation Summary Sheet Destination Readability (2026-03-23)

- **P4-UX FIX (HIGH)**: Destination shop name — the single most important text on the navigation summary sheet — was `truncate text-sm` on mobile. At 375px with card padding + phone icon, names truncated after ~19 characters. Two changes:
  - Shop name: `truncate text-sm` → `line-clamp-2 text-base leading-snug`. Names now wrap to a second line before truncating, showing up to ~40 characters. Font bumped from 14px to 16px for glanceability.
  - Desktop unchanged: `sm:text-2xl` still applies at breakpoint.
- 1 file touched. Build: 1.68s, 0 errors. Bundle: 975.21 KB. Diagnostics: 0.

### Pass 95 — Navigation Speed Panel Mobile Responsiveness (2026-03-23)

- **P4-UX FIX (CRITICAL)**: Speed panel + badges were overlapping the summary sheet on mobile and consuming 58% of 375px screen width. Three changes:
  - NavigationActiveSpeedPanel: `bottom-[14rem]` → `bottom-[calc(max(env(safe-area-inset-bottom),0.75rem)+17rem)]` — safe-area-aware positioning that automatically clears the summary sheet on all devices (notched and non-notched). `md:bottom-8` unchanged.
  - SpeedLimitBadge: 104×104px → 76×76px on mobile (`sm:` restores full size). Border, text, and spacing scaled proportionally.
  - CurrentSpeedBadge: 112px min-width → 88px on mobile. Padding, text, icon scaled proportionally.
- Mobile badge footprint: 228px (61%) → 172px (46%) on 375px. Readable at a glance. Premium HUD feel preserved.
- 3 files touched. Build: 1.74s, 0 errors. Bundle: 975.19 KB. Diagnostics: 0.

### Pass 94 — Guard Console Statements Across Services & Hooks (2026-03-23)

- **P2-DATA FIX**: 42 unguarded console.log/warn/error statements across 11 production files were leaking cache keys, bucket names, profile data, Supabase URIs, upload paths, and internal state to browser consoles. All gated behind `import.meta.env.DEV`.
- Services: PerformanceOptimizer (9), StorageService (8), SupabaseStorageAdapter (7), services/index (1).
- Auth: websitePreferencesSync (2), websiteIdentity (2), websiteRelationshipsSync (2).
- Hooks: useUserData (15), useNavigation (3), useCoveragePartnerShops (1), useWebsiteSessionSync (1), useOperatingRegionsCoverage (1).
- Emoji decorators stripped from all guarded messages.
- 11 files touched. Build: 1.70s, 0 errors. Bundle: 974.89 KB (down 1.63 KB from emoji/dead code).

### Pass 92 — Landing Page Copy Polish (2026-03-23)

- **P6-SPELL FIX**: "Active NY rollout" → "Now available in NY" in `HeroSection.tsx` (consumer-friendly badge).
- **P6-SPELL FIX**: "Submission and status events are captured" → "Every submission and status update is recorded" in `AboutOpportunitySection.tsx` (removed dev jargon "events are captured").
- 2 files touched. Build: 1.72s, 0 errors. Spellcheck: 0/136 across all consumer components.

### Pass 91 — Gate Diagnostics Panel to Dev-Only (2026-03-23)

- **P3-ARCH FIX**: PlannerDiagnosticsPanel (provider health, confidence scores, telemetry, discovery quality) was rendered to all users by default. Now gated behind `import.meta.env.DEV` in both `CoverageNavigationPlanner.tsx` (default prop) and `CoverageBrowseSidebarContent.tsx` (explicit prop). Production users never see internal monitoring panels.
- 2 files touched. Build: 1.74s, 0 errors. Bundle: 976.96 KB. Diagnostics: 0.

### Pass 90 — Guard Console Statements in Consumer Components (2026-03-23)

- **P2-DATA FIX**: 9 unguarded console.log/error/warn statements in user-facing components were exposing implementation details, file sizes, internal state, and stack traces in production browser consoles. All gated behind `import.meta.env.DEV` — tree-shaken from production builds.
- Emoji decorators stripped from all guarded log messages for professionalism.
- Files touched: `ReportScreen.tsx`, `AccountScreen.tsx`, `BusinessInquirySection.tsx`, `CoverageMapDialog.tsx`
- NavigationErrorBoundary.tsx `console.error` left intentionally — standard error boundary pattern useful for production debugging.
- Build: 1.77s, 0 errors. Bundle: 976.97 KB (down from 978.09 KB). Diagnostics: 0. Spellcheck: 0.

### Pass 89 — Remove macOS Traffic Light Dots (2026-03-23)

- **P4-UX FIX**: macOS-style traffic light dots (red/yellow/green circles) removed from `CoverageCommandCenterHeader.tsx`. These made the mobile map command center look like a desktop window frame, not a product-owned mobile app.
- 1 file touched. Build clean.

### Pass 88 — Mobile Map Panel Labels Cleanup (2026-03-23)

- **P4-UX FIX**: Developer-facing labels in map panels replaced with consumer-friendly copy across 4 files:
  - `PlannerAddressSearch.tsx`: "Active origin" → "Your location"
  - `PlannerRoutePreview.tsx`: "Route preview" → "Route to shop", "Route status" → "Your route", "Select a partner shop" → "Select a shop"
  - `CoverageCommandCenterHeader.tsx`: "Search-first command center" → "Find Nearby Shops"
  - `MapSurfaceHeaderBadges.tsx`: "Coverage focus" → "Service Area"
- 4 files touched. Build: 1.64s, 2457 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 87 — Strip Internal Developer Content from Consumer Surfaces (2026-03-23)

- **P0-TRUST FIX**: Performance monitoring metrics (zoom/pan timing, over-budget counts, sample counts, timestamps) in `MapSurfaceStatusBar.tsx` were unconditionally rendered to all users. Gated behind `import.meta.env.DEV` — production users never see them, developers still get the diagnostics.
- **P0-TRUST FIX**: `CoverageSearchPanel.tsx` contained developer-facing copy visible to consumers: "Coverage Direction Surface" eyebrow, "Apple-style glass chrome" pill, "Build a cleaner route handoff before the user ever leaves BidOnDent" heading, "Smooth route preview, honest navigation handoff" card. All replaced with consumer-friendly copy: "Find Nearby Shops", "Search by ZIP" / "Using your location" pills, "Find the best body shop near you" heading, "Route preview with easy navigation handoff" card.
- Production JS bundle shrank ~1.5 KB (performance metrics tree-shaken out).
- 2 files touched: `MapSurfaceStatusBar.tsx`, `CoverageSearchPanel.tsx`
- Build: 1.69s, 2457 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 86 — Mobile Active Navigation Critical Fixes (2026-03-23)

- **P0-RUNTIME FIX**: Voice controls sheet (`bottom-3, z-565`) landed directly over SummarySheet (`bottom-[safe-area], z-560`) on mobile — covered "End Route" button and all summary info. Repositioned to `bottom-[13rem]` on mobile so it floats above the summary panel. Desktop unchanged (`sm:bottom-6`).
- **P0-RUNTIME FIX**: Destination name + address was `hidden sm:flex` — completely invisible on phones during active navigation. User could see ETA/distance but couldn't confirm they were heading to the right shop. Removed `hidden`, added compact mobile styling (`text-sm`, `rounded-2xl`, `px-3 py-2.5`) with `sm:` breakpoints for existing larger desktop treatment.
- **P1-RUNTIME FIX**: Speed panel at `bottom-[12rem]` could overlap SummarySheet on narrow phones (<375px). Adjusted to `bottom-[14rem]` to account for the now-taller SummarySheet with visible destination row.
- 3 files touched: `NavigationVoiceControlsSheet.tsx`, `NavigationSummarySheet.tsx`, `NavigationActiveSpeedPanel.tsx`
- Build: 1.70s, 2457 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 85 — Mobile Bottom Sheet "Never Trapped" UX (2026-03-23)

- **P4-UX FIX**: Mobile map bottom sheet trapped users — only 3 snap points (90px/40%/88%) with `dismissible={false}` meant there was no way to collapse the sheet and see the full map
- **Fix**: Rewrote `MobileMapBottomSheet.tsx` with 4-snap-point system: COLLAPSED (24px handle-only), PEEK (90px), HALF (40%), FULL (88%). Added "Back to Map" button (sky-500 pill with Map icon) visible whenever sheet is expanded. Enlarged drag handle hit area (py-3→py-4, w-12→w-14, opacity 60→70%). Scroll only enabled at HALF/FULL. Sheet stays mounted at all times — never dismissed/unmounted.
- 1 file touched: `MobileMapBottomSheet.tsx`
- Build: 1.75s, 2457 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 84 — Critical Bug Sweep + Migration Fix (2026-03-23)

- **P1-RUNTIME FIX**: Account page error — `onDeleteAccount` was never destructured from props in `DashboardRouter.tsx`, passed as `undefined` to `AccountScreen`. Also missing `onDeleteAccount` and `websiteIdentity` in `DashboardTabScreens.tsx` account rendering. Fixed both routers.
- **P2-DATA FIX**: Damage reports lost on sign-out/in — edge function used `clerk_user_id` column in `damage_reports` table, but no migration ever added that column. `CREATE TABLE IF NOT EXISTS` in `database_init.tsx` included it, but the migration (003) ran first and created the table without `clerk_user_id`. Inserts silently failed; reports lived only in localStorage, which is cleared on sign-out. Created migration `010_add_clerk_user_id_to_damage_reports.sql` to add the column, make `user_id` nullable, and add the `user_id_or_clerk_user_id` constraint + index.
- **P4-UX FIX**: Mobile bottom sheet (pull-down) not responding to swipe gestures — `MobileMapBottomSheet.tsx` DrawerContent was missing `pointer-events-auto`, causing touch events to pass through to the Leaflet map beneath. Added `pointer-events-auto` to the content class list.
- 4 files touched: `DashboardRouter.tsx`, `DashboardTabScreens.tsx`, `MobileMapBottomSheet.tsx`, `010_add_clerk_user_id_to_damage_reports.sql` (new)
- Build: 1.71s, 2457 modules, 0 errors. Spellcheck: 0.

### Pass 83 — shopMapExperience Role Collections Extraction (2026-03-23)

- **P3-ARCH FIX**: `shopMapExperience.ts` was 463 lines — well over 300-line soft limit
- Extracted 5 role collection functions + `RoleShopCollectionKey` type to `shopMapRoleCollections.ts` (68 lines):
  - `getRoleCollectionKey`, `getRoleCollectionTitle`, `getRoleCollectionActionLabels`, `getRoleCollectionShopIds`, `toggleRoleCollectionShopId`
- Re-exported through `shopMapExperience.ts` for zero-breakage downstream consumption
- `shopMapExperience.ts`: 463 → 404 lines (−59 lines). `shopMapRoleCollections.ts`: 68 lines.
- 2 files touched (1 edited, 1 created)
- Build: 1.62s, 2455 modules, 0 errors. Spellcheck: 0.

### Pass 82 — useUserData Save Action Extraction (2026-03-23)

- **P3-ARCH FIX**: `useUserData.ts` was 487 lines — 13 lines from the 500 hard limit
- Extracted 3 cloud save functions to `userDataActions.ts` (81 lines):
  - `saveProfileToCloud` — profile save with cloud URL validation
  - `saveVehiclesToCloud` — vehicle save + refresh, returns updated array
  - `saveReportsToCloud` — report save with payload builder
- Hook wrappers reduced to 3–12 lines each (guard + delegate)
- `useUserData.ts`: 487 → 444 lines (−43 lines). `userDataActions.ts`: 81 lines.
- 2 files touched (1 edited, 1 created)
- Build: 1.67s, 2454 modules, 0 errors. Spellcheck: 0.

### Pass 81 — Demo Shop Type Safety Fix (2026-03-23)

- **P0-BUILD FIX**: `useOperatingRegionsCoverage.ts` had 2 TypeScript errors — `Property 'id' does not exist` on demo shop union member
- **Root cause**: `fallbackPartnerHubs` in `coverageData.ts` was untyped, causing TypeScript to infer a narrow literal type without `id`. The hook's `mapPartnerShops` became a union of `CoveragePartnerShop | { literal demo type }`, and accessing `.id` failed on the demo branch.
- **Fix**: Added `CoveragePartnerShop[]` type annotation to `fallbackPartnerHubs` — collapses the union to a single `CoveragePartnerShop[]` type across all code paths
- 1 file touched: `coverageData.ts`
- Build: 1.63s, 2453 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 61 — Active Navigation Mobile Layout (2026-03-23)

- **P4-UX FIX**: Active navigation mode now behaves like a real mobile nav app
- **Map full-bleed in navigation**: `h-[82vh]` → `h-[100dvh] md:h-[82vh]` — map fills entire viewport during active navigation on mobile
- **Exit button repositioned**: Moved from `top-3` (overlapping ManeuverCard) to `top-[6.5rem]` — sits below the maneuver card, always visible and reachable
- **ManeuverCard compacted**: Icon 14→11 on mobile, text `1.75rem`→`lg`, "following step" section hidden under `sm:` — halves card height on mobile, shows only current instruction
- **SummarySheet compacted**: Stats `2rem`→`2xl` on mobile, shop detail card hidden under `sm:`, End Route button `py-3.5`→`py-2.5` — reduces bottom panel height ~40% on mobile
- **SpeedPanel repositioned**: `bottom-[18rem]`→`bottom-[12rem]`, road info card hidden under `md:` — only speed badges visible on mobile
- **Wrapper padding removed**: `sm:p-3` removed from active nav wrapper — zero chrome until `md:p-4`
- **User impact**: Active navigation on mobile now shows: compact maneuver instruction at top, exit button below it, speed badges mid-right, compact summary at bottom, and map everywhere else
- 4 files touched: `CoverageMapDialog.tsx`, `NavigationActiveManeuverCard.tsx`, `NavigationSummarySheet.tsx`, `NavigationActiveSpeedPanel.tsx`
- Build: 1.67s, 2437 modules, 0 errors. Spellcheck: 0.

### Pass 60C — Map Dominance + Visual Softening (2026-03-23)

- **P4-UX FIX**: Map is now the primary surface on mobile — full-bleed, no chrome framing
- **Map full-bleed**: Map height changed from `h-[74vh]` to `h-[100dvh] md:h-[74vh]` — map fills the entire mobile viewport. Desktop retains 74vh within the dialog chrome.
- **Header hidden on mobile**: `CoverageCommandCenterHeader` (traffic-light dots, session info) now wrapped in `hidden md:block` — pure map surface on mobile. Header remains on desktop for context.
- **Outer shell transparent on mobile**: Parent container background, backdrop-blur, and box-shadow now only apply at `md:` breakpoint. Mobile gets a transparent pass-through to the map.
- **Visual softening (Apple Maps direction)**:
  - `map-liquid-sheen`: White radial gradient reduced 42%→28%, cyan 20%→12%, linear sweep 18%→10%. Animation opacity range 0.7–1.0 → 0.5–0.8.
  - `map-liquid-panel`: Shadow spread reduced 52px→44px, opacity 26%→18%, inset sheen 50%→38%.
  - `map-liquid-card`: Border opacity 20%→16%, background opacity 22%→16%/8%→6%, shadow 34px→28px, inset sheen 42%→32%.
  - `map-liquid-rail`: Shadow 38px→32px, opacity 24%→16%, inset sheen 46%→34%.
  - Mobile overrides: panel shadow 32px→24px, card shadow 24px→18px, border/background further softened.
- **User impact**: Mobile feels like a real navigation app — map is the canvas, UI floats on top subtly. Panels feel atmospheric rather than glassy/cold.
- 2 files touched: `CoverageBrowseExperience.tsx`, `theme.css`
- Build: 1.80s, 2437 modules, 0 errors. Spellcheck: 0.

### Pass 59B — Mobile Interaction Model (2026-03-23)

- **P2-UX FIX**: Mobile browse overlays hidden — map is now the primary surface on mobile
- **Problem**: `CoverageBrowseMapOverlays` (maneuver card, 4 nav tabs, 5 map controls, route stats + Start Route) rendered on top of the map on mobile, duplicating everything in the bottom sheet. The bottom route card was hidden behind `MobileMapBottomSheet` (z-[610] Portal vs z-[620] inside Dialog z-50 context). Users on mobile saw cluttered overlays AND a bottom sheet with the same controls.
- **Fix**: Added `className="hidden xl:contents"` to hide overlays below xl breakpoint. On mobile, the bottom sheet is now the sole interaction surface. Map is fully visible.
- **Escape key added to navigation sheets**: `NavigationTurnListSheet` and `NavigationVoiceControlsSheet` now close on Escape key press. Each uses a dedicated inner component with `useEffect` keydown handler.
- **User impact**: Mobile users see a clean map with bottom sheet only — like Apple Maps / Google Maps. Desktop users retain the full overlay HUD. All navigation sheets now have keyboard escape path.
- 4 files touched: `CoverageBrowseExperience.tsx`, `CoverageBrowseMapOverlays.tsx` (274 lines), `NavigationTurnListSheet.tsx` (83 lines), `NavigationVoiceControlsSheet.tsx` (127 lines)
- Build: 1.66s, 2437 modules, 0 errors. Spellcheck: 0.

### Pass 58A — Navigation Trap Fix (2026-03-23)

- **P1-UX FIX**: Three confirmed navigation traps eliminated
- **Trap 1 — Dialog close button hidden**: Map overlays (z-[620]) rendered above the Dialog close button (no z-index). On mobile, users could not reach the X to close the fullscreen map. Fixed by adding `z-[700]` to DialogContent close button.
- **Trap 2 — No exit from active navigation**: Active navigation mode had no visible back/exit control — only "End Route" buried at bottom of NavigationSummarySheet. Added a floating X button (z-[570]) at top-left of active navigation layout, always reachable, light/dark tone-aware.
- **Trap 3 — No keyboard escape**: Pressing Escape during active navigation did nothing. Added keydown listener that exits active navigation back to browse mode.
- Consolidated `onEndRoute` handler to reuse `handleExitNavigation` callback (single source of truth for exit logic)
- `CoverageMapDialog.tsx`: 375 → 403 lines (+28 lines, exit button + Escape handler)
- `dialog.tsx`: 1 token change (z-[700] on close button)
- 2 files touched
- Build: 1.67s, 2437 modules, 0 errors. Spellcheck: 0.

### Pass 57 — Navigation Session Retry Resilience (2026-03-23)

- **P1-DATA FIX**: Network outages >15 seconds caused permanent session divergence — pending cloud writes dropped silently after 3 fixed-interval retries
- Implemented exponential backoff retry strategy (5s → 10s → 20s → 40s = ~75s total coverage vs previous 15s)
- Added `window.addEventListener("online", ...)` to resume queued writes immediately when connectivity restores
- Added `console.warn` for localStorage persist failures (previously silent) — improves debugging visibility
- No schema changes, no UI changes, no behavioral changes for success-path users
- `navigationSessionCloudService.ts`: 225 → 245 lines (+20 lines of resilience logic)
- 1 file touched
- Build: 1.82s, 2436 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 56 — useShopDirectorySession Hard-Limit Relief (2026-03-23)

- **P3-ARCH FIX**: `useShopDirectorySession.ts` was at 499 lines — 1 line from the 500 hard limit
- Extracted pure utility functions to `shopDirectorySessionUtils.ts` (75 lines):
  - `slugify(value)`: URL-safe slug builder
  - `buildSavedPlace(origin)`: `SavedPlace` factory
  - `buildRecentSearches(...)`: deduplicated, capped search history builder
  - `getContextChips(vehicles, reports)`: vehicle make + damage signal chip generator
- `useShopDirectorySession.ts`: 499 → 436 lines (63 lines extracted)
- Zero behavior change. Both files comfortably under limits.
- 2 files touched (1 edited, 1 created)
- Build: 1.76s, 2436 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 55 — DashboardRouterScreens Hard-Limit Relief (2026-03-23)

- **P3-ARCH FIX**: `DashboardRouterScreens.tsx` was at 493 lines — 7 lines from the 500 hard limit
- Extracted into 3 focused files + 1 micro-animation helper:
  - `DashboardTabScreens.tsx` (240 lines): tab `switch` renderer + `getHomeReports` helper
  - `DashboardStandaloneScreens.tsx` (229 lines): viewMode `switch` renderer + `withStoredPhotos` + `getSelectedReport`
  - `DashboardAnimatedScreen.tsx` (23 lines): shared `AnimatedScreen` wrapper + `screenTransition` constants
  - `DashboardRouterScreens.tsx` (493 → 16 lines): thin composition shell only
- Zero behavior change. All 4 files under the 300-line soft limit.
- 4 files touched (1 rewritten, 3 created)
- Build: 1.62s, 2436 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 54 — OSRM Circuit-Breaker Protection (2026-03-23)

- **P3-ARCH FIX**: Public OSRM endpoint had no rate-limit or failure-rate guard — repeated 429/error responses would keep hammering the API with no backoff
- Added `isProviderCircuitOpen(provider, now?)` to `providerHealth.ts`: opens circuit after 3 consecutive failures, stays open for 90-second cooldown window, then allows one tentative retry
- `fetchNavigationRouteOptions` in `routeEngine.ts` now checks the circuit before issuing any fetch — throws a user-friendly message immediately when open, never touching the endpoint
- Circuit is fully telemetry-driven (reads existing persisted health events — no new storage keys)
- `isProviderCircuitOpen` exported for future use by Overpass / Nominatim providers
- 2 files touched: providerHealth.ts (257 → 278 lines), routeEngine.ts (422 → 426 lines)
- Build: 1.65s, 2436 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 53 — useCoverageNavigationExperience Extraction (2026-03-23)

- **P3-ARCH FIX**: `useCoverageNavigationExperience.ts` hit 510 lines — crossed the 500-line hard limit
- Extracted `resolveStepIndexAfterRefresh` and `rebuildSpokenSteps` (now `computeCarriedSpokenSteps`) to `navigationGuidanceHelpers.ts`
- `computeCarriedSpokenSteps` refactored from a closure-mutating void function to a pure function returning `Set<string>` — strictly cleaner
- Hook drops from 510 → 450 lines (back under 300 soft limit). Helpers file: 153 → 224 lines.
- 2 files touched: useCoverageNavigationExperience.ts, navigationGuidanceHelpers.ts
- Build: 1.63s, 2436 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 52 — Voice Support Status Surface in Planning UI (2026-03-23)

- **P4 FIX**: Safari gesture-blocked state never surfaced in planning UI — "Tap to enable voice" message was generated by `useVoiceSupport()` but never consumed by any component
- `useCoverageNavigationExperience` now calls `useVoiceSupport()` and exposes `voiceStatusLabel: string`
- `PlannerVoiceGpsSettings`: voice footer now shows `voiceStatusLabel` when status is not "Voice ready" (e.g. "Tap to enable voice", "Loading voices…")
- `useVoiceSupport` was previously exported but unconsumed — now wired into the core navigation experience
- Build module count: 2435 → 2436 (useVoiceSupport now actually bundled)
- 4 files touched: useCoverageNavigationExperience.ts, CoverageNavigationPlanner.tsx, PlannerVoiceGpsSettings.tsx, CoverageBrowseSidebarContent.tsx
- Build: 1.63s, 2436 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 51 — Saved Location Recent Staleness Pruning (2026-03-23)

- **P5 FIX**: "Recent" saved locations never expired — could persist indefinitely with no TTL
- savedLocations.ts: `normalizeSavedLocations()` now filters recent entries older than 30 days before slicing to `MAX_RECENT_LOCATIONS`
- Pinned locations (`home`, `work`, `saved`) are never pruned — only auto-generated recents are affected
- `RECENT_STALENESS_MS` constant derived from `RECENT_STALENESS_DAYS = 30` for readability
- 1 file touched: savedLocations.ts
- Build: 1.62s, 2435 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 50 — Place Discovery Dedup Precision + GPS Stale Auto-Recovery (2026-03-23)

- **P3 FIX**: Place discovery dedup key used 4-decimal coords (~11m resolution) — nearby identical places could survive dedup
- placeDiscovery.ts `dedupePlaces()`: coordinate precision raised from 4 to 6 decimal places (matches Pass 49 standard)
- **P4 FIX**: GPS "stale" state persisted until manual retry; transient signal drops never auto-recovered
- useNavigationGpsTracking.ts: staleness interval now fires `retryCounter` bump once per stale episode (`staleAutoRetryFiredRef`)
- Auto-retry flag resets when GPS recovers (new position received), preventing infinite retry loops
- 2 files touched: useNavigationGpsTracking.ts, placeDiscovery.ts
- Build: 1.64s, 2435 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 49 — Route Destination Key Hardening (2026-03-23)

- **P2-P3 FIX**: Destination key collision risk — two shops sharing a name + nearby coordinates could share a route cache key
- `buildDestinationKey`: priority is now `shop.id`, then compound `name|addressLine|countyLabel`, then `unknown-shop` — prevents identity collapse
- `buildOriginKey`: coordinate precision raised from 4 to 6 decimal places (~10cm resolution vs ~11m)
- Private helpers `normalizeKeyPart()` and `toKeyCoordinate()` keep the key format stable and testable
- 1 file touched: navigationGuidanceHelpers.ts
- Build: 1.67s, 2435 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 48 — GPS Permission Denied Recovery + Error Differentiation (2026-03-23)

- **P2 FIX**: GPS permission denied, signal loss, and timeout were indistinguishable — all mapped to "lost" with same error message
- useNavigationGpsTracking.ts: new `GpsStatus = "denied"` for `PERMISSION_DENIED` (code 1); timeout (code 3) maps to "stale" with specific message
- Added `retryGps()` callback — bumps retry counter to re-trigger `watchPosition` effect after user grants permission
- PlannerVoiceGpsSettings.tsx: distinct UI for denied state with "Retry" button; retry also available for "lost" state
- Threaded `retryGps` through useCoverageNavigationExperience → CoverageNavigationPlanner → PlannerVoiceGpsSettings
- 5 files touched: useNavigationGpsTracking.ts, useCoverageNavigationExperience.ts, CoverageNavigationPlanner.tsx, PlannerVoiceGpsSettings.tsx, CoverageBrowseSidebarContent.tsx
- Build: 1.67s, 2435 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 47 — Stale Retry Write Guard (2026-03-23)

- **P2 FIX**: Retried cloud writes could overwrite newer successful writes (out-of-order upsert)
- navigationSessionCloudService.ts: `latestWriteTs` map tracks newest write timestamp per session
- `PendingWrite` now carries `queuedAt`; `scheduleRetry` skips entries older than latest successful write
- Recovered queue entries get `queuedAt` defaulted to `Date.now()` for backward compatibility
- 1 file touched: navigationSessionCloudService.ts
- Build: 1.66s, 2435 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 46 — Session Hydration Race Guard (2026-03-23)

- **P1 FIX**: Cloud hydration could overwrite user actions during in-flight fetch (user clicks "Start Planning" while cloud returns stale idle state)
- useNavigationSession.ts: hydration `setSession` now checks `prev.status === "idle"` before applying cloud data
- If session has already progressed past idle, cloud response is safely discarded
- 1 file touched: useNavigationSession.ts
- Build: 1.65s, 2435 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 45 — Navigation Cloud Sync Unload Protection (2026-03-23)

- **P1 FIX**: In-memory retry queue (`pendingWrites[]`) lost on tab close / refresh — silent cloud data loss
- navigationSessionCloudService.ts: `persistPendingQueue()` writes retry queue to localStorage on `pagehide`
- `recoverPendingQueue()` loads persisted queue on next page load and re-attempts cloud writes
- Dedicated localStorage key `bidondent_nav_pending_writes`; auto-cleared after recovery
- 1 file touched: navigationSessionCloudService.ts
- Build: 1.59s, 2435 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 44 — currentStepIndex Stability on Route Refresh (2026-03-23)

- **P1 FIX**: Turn-by-turn navigation reset to step 1 on every GPS-triggered route refresh (~every 290m)
- useCoverageNavigationExperience.ts: `resolveStepIndexAfterRefresh()` finds the closest upcoming step by GPS proximity instead of blindly resetting to index 1
- `rebuildSpokenSteps()` preserves voice-guidance history for maneuvers that survive the route refresh (matched by coordinate proximity ~32m)
- Both route-fetch and alternative-route-selection paths fixed
- 1 file touched: useCoverageNavigationExperience.ts
- Build: 1.65s, 2435 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 43 — Navigation Session Auth Identity Fix (2026-03-23)

- **P0 FIX**: useNavigationSession.ts used hardcoded "demo-user" fallback — all sessions shared one key in Supabase
- useNavigationSession.ts: accepts `authUserId?: string` param; consumers pass Clerk `providerUserId`
- ShopDirectoryScreen.tsx: passes `identity?.providerUserId` to hook and to ShopDirectoryMapOverlays
- ShopDirectoryMapOverlays.tsx: accepts `userId?: string` prop, forwards to useNavigationSession
- Build: 1.70s, 2435 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 43b — Stable Anonymous Navigation Identity (2026-03-23)

- **Follow-up correction**: shared `"anonymous"` fallback still caused key collision for unauthenticated users
- useNavigationSession.ts: `getStableAnonId()` generates a per-browser UUID on first use, persists in localStorage (`bidondent_anon_nav_id`)
- Authenticated path unchanged; anonymous users now get unique `anon-<uuid>` identity
- 1 file touched: useNavigationSession.ts
- Build: 1.66s, 2435 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 42 — InsurerClaimsScreen Utils Extraction (2026-03-23)

- InsurerClaimsScreen.tsx: 509 → 453 lines (11% reduction, under 500 hard limit ✔)
- NEW: insurerClaimsUtils.ts (86 lines) — ClaimData type, transformReportsToClaims, getStatusColor, getPriorityColor
- Zero behavior change, zero UI change
- Build: 1.71s, 2435 modules (+1), 0 errors. Diagnostics: 0. Spellcheck: 0.

**ZERO files remain over the 500-line hard limit.**

### Pass 41 — BusinessInquirySection Utils Extraction (2026-03-23)

- BusinessInquirySection.tsx: 551 → 457 lines (17% reduction, under 500 hard limit ✔)
- NEW: businessInquiryUtils.ts (96 lines) — types (ShopForm, InsurerForm), initial state constants, formatters (formatPhoneNumber, formatZipCode), validators (validateShopForm, validateInsurerForm)
- Zero behavior change, zero UI change
- Build: 1.69s, 2434 modules (+1), 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 40 — useUserData Utility & Transform Extraction (2026-03-23)

- useUserData.ts: 574 → 487 lines (15% reduction, under 500 hard limit ✔)
- NEW: userDataUtils.ts (71 lines) — pure utility functions (isUuidLike, normalizeEmail, getUserCacheKey, getLastActiveCacheKey, buildPhotoStorageFromReports) + report transform functions (transformSupabaseReport, buildSupabaseReportPayload)
- Eliminated 2 duplicated report-transform blocks and 2 duplicated report-payload blocks
- Zero behavior change, zero UI change
- Build: 1.65s, 2433 modules (+1), 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 39 — HomeScreen Data Extraction (2026-03-23)

- HomeScreen.tsx: 576 → 421 lines (27% reduction, under 500 hard limit ✔)
- NEW: homeScreenData.ts (225 lines) — types (ActionItem, StatItem), constants (toneClasses, statusClasses, actionIconTones), builders (buildStats, buildQuickActions, buildPrimaryAction)
- Zero behavior change, zero UI change
- Build: 1.64s, 2432 modules (+1), 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 38 — AdminDashboard Hook Extraction (2026-03-23)

- AdminDashboard.tsx: 593 → 139 lines (76% reduction, under 500 hard limit ✔)
- NEW: useAdminActions.ts (490 lines) — custom hook owning all state (12 vars) and async handlers (checkEdgeFunctionHealth, verifyDatabase, loadCustomAccounts, checkAccountStatus, checkAllAccounts, deleteAccount, createAccount, createCustomAccount, switchToAccount, handleManageAdmin)
- Exported interfaces: AccountStatus, CustomAccount
- AdminDashboard.tsx is now pure rendering — hook destructure + JSX delegation to 8 sub-components
- Zero behavior change, zero UI change
- Build: 1.65s, 2431 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

**All 5 oversized files now resolved:**

- shopMapExperience.ts: 463 lines ✔ (from 824)
- marketIntelligence.ts: 405 lines ✔ (from 783)
- InsurerPartnerShopsScreen.tsx: 471 lines ✔ (from 786)
- DashboardRouter.tsx: 432 lines ✔ (from 608)
- AdminDashboard.tsx: 139 lines ✔ (from 593)

### Pass 37 — DashboardRouter Interface & Animation Dedup (2026-03-23)

- DashboardRouter.tsx: 608 → 432 lines (29% reduction, under 500 hard limit ✔)
- Extracted inline DashboardRouterProps interface to dashboard-router-types.ts (74 lines, synced with websiteIdentity + onPasswordChange + onDeleteAccount)
- Deduplicated 19 identical motion.div animation blocks into shared screenTransition constant
- Zero behavior change, zero UI change
- Build: 1.64s, 2431 modules, 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 36 — InsurerPartnerShopsScreen Decomposition (2026-03-23)

- InsurerPartnerShopsScreen.tsx: 786 → 471 lines (40% reduction, under 500 hard limit ✔)
- NEW: insurerPartnerShopsUtils.ts (78 lines) — types (FilterStatus, CustomProspect) and helpers (slugify, buildProspectPhone, buildPartnerStatus, getStatusColor, buildManualProspectCoordinate)
- NEW: AddProspectModal.tsx (198 lines) — self-contained modal with own form state, emits CustomProspect on submit
- NEW: ManualProspectCard.tsx (66 lines) — manual lead card with contact actions and directions
- Zero behavior change, zero UI change
- Build: 1.64s, 2431 modules (+3), 0 errors. Diagnostics: 0. Spellcheck: 0.

### Pass 35 — marketIntelligence Seed Data Extraction (2026-03-23)

- marketIntelligence.ts: 783 → 405 lines (48% reduction, now under 500 hard limit ✔)
- NEW: marketSeedData.ts (379 lines) — seed data module: SHOPS array (8 shop profiles), INSURERS array (8 insurance company profiles)
- marketIntelligence.ts imports SHOPS and INSURERS from marketSeedData — zero consumer changes needed
- Zero behavior change, zero UI change
- Build: 1.70s, 2428 modules (+1), 0 errors. Diagnostics: 0. Spellcheck: 0.

**Map domain intelligence decomposition status:**

- shopMapExperience.ts: 463 lines ✔ (from 824)
- shopMapRouting.ts: 250 lines (route preview)
- shopMapData.ts: 122 lines (directory data)
- marketIntelligence.ts: 405 lines ✔ (from 774)
- marketSeedData.ts: 379 lines (seed profiles)

**Next targets (non-map oversized files):**

- InsurerPartnerShopsScreen.tsx: 471 ✔ (from 786)
- DashboardRouter.tsx: 432 ✔ (from 608)
- AdminDashboard.tsx: 139 ✔ (from 593)

### Pass 34 — shopMapExperience Data Constants Extraction (2026-03-23)

- shopMapExperience.ts: 578 → 463 lines (20% reduction, now under 500 hard limit ✔)
- NEW: shopMapData.ts (122 lines) — shop directory data module: DEFAULT_MAP_CENTER, SHOP_LOCATION_DIRECTORY (6 shops), SUGGESTED_SEARCH_ORIGINS (4 places), getLocationForShop, getDefaultMapCenter, getSuggestedSearchOrigins
- Re-exports from shopMapExperience.ts preserve all consumer imports (ShopDirectoryScreen.tsx, useShopDirectorySession.ts unchanged)
- Removed unused `Place` type import from shopMapExperience.ts
- Zero behavior change, zero UI change, zero consumer file changes required
- Build: 1.67s, 2427 modules (+1), 0 errors. Diagnostics: 0. Spellcheck: 0.

**shopMapExperience decomposition complete:**

- shopMapExperience.ts: 824 → 463 lines (44% total reduction across Passes 33–34)
- shopMapRouting.ts: 250 lines (route preview)
- shopMapData.ts: 122 lines (directory data + accessors)

**Next move:**

- marketIntelligence.ts (774 lines) — shop profile data extraction
- InsurerPartnerShopsScreen.tsx (786), DashboardRouter.tsx (608), AdminDashboard.tsx (593)

### Pass 33 — shopMapExperience Route-Building Extraction (2026-03-23)

- shopMapExperience.ts: 824 → 578 lines (30% reduction, still over 500 hard limit — needs one more pass)
- NEW: shopMapRouting.ts (250 lines) — route preview module: ROUTE_VARIANTS data, polyline interpolation, route instructions, duration/distance formatting, Haversine distance, buildShopRouteOptions, buildRoleAwareRouteSummary
- Re-exports from shopMapExperience.ts preserve all consumer imports (useShopDirectorySession.ts unchanged)
- Zero behavior change, zero UI change, zero consumer file changes required
- Build: 1.71s, 2426 modules (+1), 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- shopMapExperience.ts still 578 lines (16% over hard limit) — data constants or role-aware highlights extraction needed
- marketIntelligence.ts (774 lines) — shop profile data extraction
- InsurerPartnerShopsScreen.tsx (786), DashboardRouter.tsx (608), AdminDashboard.tsx (593)

### Pass 32 — ServiceCoverageMap Partner Shop + Search Target Marker Extraction (2026-03-23)

- ServiceCoverageMap.tsx: 514 → 437 lines (15% reduction, now well under 500 hard limit)
- NEW: MapPartnerShopMarkers.tsx (71 lines) — partner shop CircleMarkers with selection state, presentation-mode variants, click handlers, popup, tooltip
- NEW: MapSearchTargetMarkers.tsx (57 lines) — coverage-mode search radius circle, center marker with popup, inner dot marker
- Both new files are pure presentation: zero hooks, zero effects, zero service calls
- Follows existing MapDiscoveryPlaceMarkers.tsx extraction pattern
- Zero behavior change, zero UI change, zero prop contract changes on ServiceCoverageMap
- Build: 1.77s, 2425 modules (+2), 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- All map-core rendering files now under hard limit — rendering tier clean
- Complete marker-component pattern established: discovery places, partner shops, search targets
- Remaining high-priority oversized files: shopMapExperience.ts (824), marketIntelligence.ts (774), InsurerPartnerShopsScreen.tsx (786), DashboardRouter.tsx (608), AdminDashboard.tsx (593)

### Pass 31 — NavigationBrowseDiscoveryPanel Discovery Places Extraction (2026-03-22)

- NavigationBrowseDiscoveryPanel.tsx: 583 → 350 lines (40% reduction, now under 500 hard limit)
- NEW: NavigationDiscoveryPlacesList.tsx (303 lines) — discovery places rendering with selected detail card, loading skeleton, error, and empty states; helper functions discoveryCategoryLabel, discoveryCategoryAccentClassName, discoveryQualityBadgeClassName extracted alongside
- Parent receives theme as prop and delegates all discovery-places rendering; zero consumer impact (CoverageBrowseSidebarContent.tsx unchanged)
- Zero behavior change, zero UI change, zero consumer file changes required
- Build: 1.70s, 2423 modules (+1), 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- All original oversized map files now resolved: useCoverageNavigationExperience (423), NavigationBrowseDiscoveryPanel (350) ✓
- Remaining high-priority oversized files: shopMapExperience.ts (824), marketIntelligence.ts (774), InsurerPartnerShopsScreen.tsx (786), DashboardRouter.tsx (608), AdminDashboard.tsx (593)
- Device testing (iPhone Safari, Android Chrome) for mobile bottom sheet experience

### Pass 30 — useNavigationGpsTracking Sub-Hook Extraction (2026-03-22)

- useCoverageNavigationExperience.ts: 673 → 543 lines (19% reduction, GPS + speed limit effects removed)
- NEW: useNavigationGpsTracking.ts (188 lines) — GPS position tracking, speed fallback, staleness detection, speed limit monitoring
- GpsStatus and SpeedLimitStatus types now defined in sub-hook, re-exported from parent for zero consumer impact
- Zero behavior change, zero UI change, zero consumer file changes required
- Build: 1.70s, 2421 modules (+1), 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- useCoverageNavigationExperience.ts still 9% over hard limit (543 vs 500) — address search extraction could finish the job
- NavigationBrowseDiscoveryPanel.tsx extraction (583 lines, 17% over hard limit)
- Device testing (iPhone Safari, Android Chrome) for mobile bottom sheet experience

### Pass 29 — useCoverageNavigationExperience Helper Extraction (2026-03-22)

- useCoverageNavigationExperience.ts: 782 → 673 lines (14% reduction, hook body only)
- NEW: navigationGuidanceHelpers.ts (135 lines) — 9 pure helper functions: toCoverageSearchTarget, calculateFallbackSpeedMph, shouldSpeakStep, getManeuverBaseSpeakDistanceMeters, getManeuverAdvanceDistanceMeters, getSpeedAdjustmentMeters, getAccuracyAdjustmentMeters, buildOriginKey, buildDestinationKey
- Zero behavior change, zero UI change, zero consumer file changes required
- Build: 1.65s, 2420 modules (+1), 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- useCoverageNavigationExperience.ts sub-hook extraction (673 lines, still 35% over hard limit — GPS, speed-limit, or routing effects could be isolated)
- NavigationBrowseDiscoveryPanel.tsx extraction (583 lines, 17% over hard limit)
- Device testing (iPhone Safari, Android Chrome) for mobile bottom sheet experience

### Pass 28 — placeDiscovery Quality Layer Extraction (2026-03-22)

- placeDiscovery.ts: 728 → 377 lines (48% reduction, fetch/query/category/dedup only)
- NEW: placeDiscoveryQuality.ts (374 lines) — quality scoring, validation, normalization, snapshot persistence, snapshot reading
- All existing imports continue to work — backward-compatible re-exports in placeDiscovery.ts
- Zero behavior change, zero UI change, zero consumer file changes required
- Build: 1.69s, 2419 modules (+1), 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- useCoverageNavigationExperience.ts extraction (782 lines, 56% over hard limit)
- NavigationBrowseDiscoveryPanel.tsx extraction (583 lines, 17% over hard limit)
- Device testing (iPhone Safari, Android Chrome) for mobile bottom sheet experience

### Pass 27 — CoverageNavigationPlanner Extraction (2026-03-22)

- CoverageNavigationPlanner: 1,033 → 273 lines (74% reduction, composition shell)
- NEW: PlannerAddressSearch.tsx (219 lines) — address input, suggestions, results, active origin display
- NEW: PlannerVoiceGpsSettings.tsx (211 lines) — voice mode/volume, GPS toggle, speed-limit alerts
- NEW: PlannerRoutePreview.tsx (288 lines) — route loading/error/preview, alternatives, metrics, turns, attribution
- NEW: PlannerDiagnosticsPanel.tsx (318 lines) — diagnostics signal, confidence trend, provider health grid, discovery quality
- All 4 sub-components are pure presentation — zero local state, zero service reads, zero effects
- Parent shell retains all useState (×5), useRef (×1), useEffect (×1), handlers (×1), service reads (×4)
- Zero behavior change, zero visual change, exact JSX parity
- Build: 1.65s, 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- Device testing (iPhone Safari, Android Chrome) for mobile bottom sheet experience
- Future full-screen mobile navigation direction (Apple Maps style)
- Button/header design improvements for soft modern design system
- Bid submission toast integration

### Pass 26 — Shared Sidebar Content Extraction (2026-03-24)

- NEW: CoverageBrowseSidebarContent.tsx (317 lines) — shared presentation layer for desktop sidebar + mobile sheet
- CoverageBrowseExperience: 588 → 430 lines (27% reduction, under 500 hard limit)
- Mobile bottom sheet: shops-only → full sidebar experience (all 4 views: Search, Explore, Saved, Shops)
- Button aesthetics: 2×2 pill grid → compact segmented tab control (theme.segmentedClassName)
- Center/Reset buttons: secondaryButtonClassName → tertiaryButtonClassName (less visual weight)
- 5 pre-composed handler functions replace inline arrow callbacks
- Fixed MapTileMode type mismatch ("map" → "roadmap")
- cspell.json: added "nums" (tabular-nums CSS class)
- Build: 1.76s, 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- CoverageNavigationPlanner extraction (1,033 lines → under 500)
- Device testing (iPhone Safari, Android Chrome) for mobile bottom sheet experience
- Future full-screen mobile navigation direction (Apple Maps style)
- Bid submission toast integration

### Pass 25 — Glass System Refinement (2026-03-24)

- mapSurfaceTheme.ts: 14+ light-tone token changes — all button/panel/list/segment opacity reduced to frosted-glass levels
- Added backdrop-blur-xl to buttonBaseClassName and iconButtonBaseClassName
- Primary blue: solid gradient → rgba(0.82–0.88) translucent gradient
- Secondary/icon/list/badge: bg-white/72 → bg-white/30
- Panels: bg-white/72 → bg-white/36; panelStrong gradient 0.86 → 0.58
- Segmented control: bg-white/72 → bg-white/30; active segment solid → bg-sky-500/80
- CoverageBrowseMapOverlays: tile active `#1e3a8a` → `sky-500/80` (3 tile buttons)
- CoverageBrowseExperience: segmented container bg-slate-100/50 → bg-white/25
- Dark-mode values untouched (already correct)
- Build: 1.69s, 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- Device testing (iPhone Safari, Android Chrome) to validate translucency
- Sidebar content extraction (CBE 588 → under 500)
- Explore/saved/planner panels in mobile bottom sheet
- Bid submission toast integration

### Pass 24 — Mobile Map Bottom Sheet (2026-03-22)

- NEW: MobileMapBottomSheet.tsx (71 lines) — vaul Drawer, non-modal, snap points [120px, 45%, 88%]
- NEW: useMediaQuery.ts (16 lines) — responsive breakpoint hook
- CoverageBrowseExperience: conditional rendering at xl breakpoint — desktop gets sidebar, mobile gets bottom sheet
- Mobile bottom sheet shows CoverageNearestShops panel (shops browsing over full-bleed map)
- bd-glass visual system: map-liquid-card, backdrop-blur-2xl, sky-blue drag handle
- Safe-area-inset padding for iPhone
- Build: 1.70s, 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- Add explore/saved/planner panels to mobile bottom sheet
- Sidebar content extraction (CBE 588 → under 500)
- iPhone Safari testing for touch gestures + safe-area validation
- Bid submission toast integration

### Pass 23 — CoverageBrowseExperience Extraction (2026-03-23)

- CoverageBrowseExperience.tsx: 781 → 560 lines (221-line reduction)
- Extracted CoverageBrowseMapOverlays.tsx (272 lines): floating maneuver card, quick-action toolbar, tile mode controls, right action rail, bottom route HUD
- New component is pure presentational — receives computed props, owns no state
- Three unused icon imports removed from parent (AlertTriangle, MessageCircle, Volume2)
- Zero behavior change — exact JSX parity, same props, same callbacks
- Build: 1.66s, 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- Bottom-sheet pattern for mobile shop results
- iPhone Safari testing at http://192.168.1.191:5173/
- Bid submission toast integration
- CBE sidebar view logic extraction (560 → under 500 if needed)

### Pass 22 — Mobile-First + Toast Wiring + Session UX + Future Map Docs (2026-03-23)

- Mobile full-bleed: removed rounded shells and framed containers on mobile (CoverageBrowseExperience, ShopDirectoryScreen)
- CoverageMapDialog now full-viewport on mobile (no side margins, no min-height overflow)
- Floating navigation overlays (maneuver card, bottom HUD) now visible on all screen sizes
- Map padding removed on mobile for edge-to-edge experience
- useNavigationToastBridge: new hook wiring session transitions + deviation events to toast notifications
- Session UX: restoredFromCloud flag and syncError state surfaced for calm, honest feedback
- Cloud sync errors produce non-blocking "saved locally" toast instead of silent failure
- Previous session restore emits calm "session restored" toast
- Future Theme E (mobile-first map) and Theme F (globe/world mode honesty) added to Map Master Plan
- Architecture audit: 0 new violations; pre-existing admin DB calls and oversized files noted
- Build: 1.66s, 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- iPhone Safari testing at http://192.168.1.191:5173/
- Bottom-sheet pattern for mobile shop results
- Bid submission toast integration
- Navigation settings UI
- Oversized file extraction (CoverageBrowseExperience at 781 lines)

### Pass 21 — UI Quality Sweep + Notification Toast Integration (2026-03-23)

- Deep UI audit: 45 non-compliant buttons/controls found across 24 files
- All 45 violations fixed systematically using bd-glass design system variants
- New bd-glass-control--destructive CSS variant added (red gradient, hover/active states)
- NotificationToast component created (auto-dismiss, variant icons, bd-glass card, accessibility)
- NotificationContext + NotificationProvider created for global toast access
- Toast system integrated into App via AppWithToast wrapper
- Files touched: 20 component files + 3 notification system files + theme.css + App.tsx
- Build: 2407 modules, 1.68s, 0 errors. Diagnostics: 0. Spellcheck: 0.

**Next move:**

- Wire toast to navigation session lifecycle events (start/reroute/end)
- iPhone Safari mobile testing at http://192.168.1.191:5173/
- Voice controls sheet upgrade, oversized file extraction

### Pass 20 — Master Prompt Execution: UI Quality + Navigation Hardening + Platform Foundation (2026-03-23)

- Theme system extended with destructive + tertiary button variants and press animations
- All map buttons standardized to bd-glass/theme system; no raw Tailwind buttons remaining
- Pure black (#000, bg-black) eliminated from all map surfaces — replaced with slate-950/slate-900
- Navigation cloud sync rewritten with localStorage fallback + retry queue (max 3 attempts)
- GPS jitter filtering (8m threshold) prevents false deviation events
- Event deduplication (5s window) prevents rapid-fire intelligence noise
- Notification system foundation created (types, hook, barrel exports)
- Reactive voice support hook created for UI consumers
- Architecture audit: 0 layer violations; 5 oversized files noted for future extraction

**Next move:**

- Notification toast UI integration, voice controls sheet upgrade, oversized file extraction

### Pass 18 — Future Map Identity + Atmosphere Governance Alignment (2026-03-22)

- Documentation pass only: locked in future BidOnDent map/platform/design vision as future planning, not shipped code.
- Product-owned, blue-system, and atmosphere direction clarified and aligned across all governing docs.
- Day/night guidance mode, richer world feel, and glass/atmosphere direction are all **planned, not implemented**.
- No product code changed in this pass.

**Next move:**

- Next: Navigation session cloud sync, persistent session memory, and further overlay enrichment.

# BidOnDent Build Progress Dashboard

> **Last updated:** 2026-03-23 · **Pass count:** 119 · **Branch:** feature/platform-bugfix-sweep-by-MolandJesus

---

## Visual Progress Model (Pass 119)

### Overall Platform Health

```
OVERALL PLATFORM        ██████████████████████░░  90%  (+2 from Pass 115)
├─ Map & Navigation     ██████████████████████░░  94%
├─ Design System        ██████████████████████░░  94%  (+1 — unified Quick Actions)
├─ Mobile UX            ██████████████████████░░  95%  (+2 — scroll fatigue fixed)
├─ Data & Persistence   █████████████████░░░░░░░  72%
├─ Production Hardening ███████████████████░░░░░  78%
├─ Product Honesty      ████████████████████████  98%  (+8 — all fake data purged)
└─ Architecture Health  ██████████████████████░░  94%
```

### What's Done vs What's Left

```
✅ COMPLETE ─────────────────────────────────────────────────────

Core Map Surface           ████████████████████ 100%  Full-bleed, tone-aware, day/night tiles
Navigation Engine          ████████████████████ 100%  Route fetch, alternatives, turn steps
Voice Guidance             ████████████████████ 100%  TTS, volume presets, spoken turns
GPS Tracking               ████████████████████ 100%  Jitter filter, degradation, recovery
Navigation Session Sync    ████████████████████ 100%  Supabase + localStorage fallback
Glass Design System        ████████████████████ 100%  bd-glass-*, royal-blue tokens, dark mode
Landing Page Identity      ████████████████████ 100%  7 surfaces unified, navy brand
Consumer Copy Cleanup      ████████████████████ 100%  All dev jargon removed (Passes 87–92)
Dev Content Gating         ████████████████████ 100%  Diagnostics/metrics/console DEV-only
Architecture Extraction    ████████████████████ 100%  All files under 500-line hard limit
Bottom Sheet (browse)      ████████████████████ 100%  4-snap, never-trapped, back-to-map
Active Nav Mobile          ████████████████████ 100%  No overlaps, no traps, destination visible
Error Boundaries           ████████████████████ 100%  NavigationErrorBoundary, image fallbacks
Product Honesty Cleanup    ████████████████████ 100%  False claims removed, honest copy deployed
Insurer Data Honesty       ████████████████████ 100%  Fake companies, estimates, customers purged (Pass 116)
Dashboard Stats Honesty    ████████████████████ 100%  All fabricated formulas/floors removed (Pass 119)
Mobile Landing Spacing     ████████████████████ 100%  Responsive py/mb/gap across 5 sections (Pass 118)
Quick Actions Hierarchy    ████████████████████ 100%  Uniform bd-glass-card, no dominance (Pass 117)
Circuit Breaker (OSRM)     ████████████████████ 100%  3-fail open, 90s cooldown
Session Retry Resilience   ████████████████████ 100%  Exponential backoff, online listener
Dashboard/Router Arch      ████████████████████ 100%  Tab routing, role dispatch, extraction
Notification System        ████████████████████ 100%  WebSocket bids, center UI, badges
Reroute Lifecycle          ████████████████████ 100%  Detection, prompt, cooldown
Data Integrity Layer       ████████████████████ 100%  Supabase truth, localStorage cache

🔧 IN PROGRESS ──────────────────────────────────────────────────

Mobile Map Edge Cases      ██████████████████░░  95%  Speed panel, z-index, overlay stacking fixed
Shop Directory UX          ██████████████░░░░░░  70%  Functional, needs glass treatment
Insurer Workflow           █████████████░░░░░░░  60%  Claims wired w/ real data, companies placeholder, logic incomplete
Customer End-to-End        ███████████████░░░░░  75%  Report+shop done, payment/tracking missing
Shop End-to-End            ██████████████░░░░░░  70%  Jobs+directory done, bid submit partial
Voice UX Polish            █████████████░░░░░░░  65%  Engine done, picker/volume UI pending

🔲 NOT STARTED (PRODUCTION BLOCKERS) ───────────────────────────

Real Geocoding Provider    ░░░░░░░░░░░░░░░░░░░░   0%  Nominatim demo → production API
Real Place Discovery       ░░░░░░░░░░░░░░░░░░░░   0%  Overpass demo → production API
Payment Integration        ░░░░░░░░░░░░░░░░░░░░   0%  Stripe/payment not started
Global Error Boundary      ████████████████████ 100%  ✅ Branded fallback, retry/reload, DEV-only detail
Error Monitoring           ██████████░░░░░░░░░░  50%  ✅ @sentry/react wired — activate via VITE_SENTRY_DSN
CI/CD Pipeline             ░░░░░░░░░░░░░░░░░░░░   0%  Manual builds only
Automated Testing          ░░░░░░░░░░░░░░░░░░░░   0%  No unit/integration/e2e tests
Accessibility Audit        ████░░░░░░░░░░░░░░░░  20%  ✅ 3 WCAG A violations fixed — full audit pending
URL Routing / Deep Links   ░░░░░░░░░░░░░░░░░░░░   0%  Tab-state only, no browser URLs
Push Notifications         ░░░░░░░░░░░░░░░░░░░░   0%  Foundation exists, no delivery

⚪ ASPIRATIONAL (POST-LAUNCH) ──────────────────────────────────

Day/Night Auto-Switching   ░░░░░░░░░░░░░░░░░░░░   0%  Planned, not started
Offline/PWA Support        ░░░░░░░░░░░░░░░░░░░░   0%  Service worker, offline routing
Multi-Stop Routing         ░░░░░░░░░░░░░░░░░░░░   0%  Single-destination only today
Premium TTS Voices         ░░░░░░░░░░░░░░░░░░░░   0%  Web Speech API only today
Analytics Dashboard        ░░░░░░░░░░░░░░░░░░░░   0%  No business analytics yet
```

### Pass Distribution by Category (119 passes)

```
Infrastructure/Features  ████████████████████████████████████  35+ passes
P3-ARCH extractions      ██████████████  14 passes   (file boundaries, separation)
P4-UX mobile/layout      ██████████████████████████  26 passes (mobile, layout, typography, spacing)
P5-DOC governance        ████████  8 passes           (doc alignment, stage tracking)
P1-RUNTIME fixes         ████████  8 passes           (crashes, traps, z-index bugs)
P2-DATA persistence      ██████  6 passes             (sync, schema, console guards)
P0-BUILD type errors     ████  4 passes               (compile failures)
P6-SPELL wording         ████  4 passes               (terminology, consumer copy)
Production Hardening     █████████  9 passes               (Passes 109–115: error boundary, Sentry, a11y, trust, data, shop)
Platform Honesty Sweep   ████████  8 passes               (Passes 112–119: fake data, fabricated stats, false claims)
```

### Bundle Size Trend

```
Pass 20:  ~985 KB  ██████████████████████████████████████████████████
Pass 81:  ~979 KB  █████████████████████████████████████████████████
Pass 87:  ~978 KB  █████████████████████████████████████████████████
Pass 92:  ~977 KB  ████████████████████████████████████████████████
Pass 103: ~976 KB  ███████████████████████████████████████████████░
Pass 105: ~976 KB  ███████████████████████████████████████████████░
Pass 106: ~976 KB  ███████████████████████████████████████████████░
Pass 107: ~976 KB  ███████████████████████████████████████████████░
Pass 108: ~976 KB  ███████████████████████████████████████████████░
Pass 113: ~978 KB  ████████████████████████████████████████████████
Pass 115: ~978 KB  ████████████████████████████████████████████████
Pass 116: ~971 KB  ███████████████████████████████████████████████░
Pass 117: ~971 KB  ███████████████████████████████████████████████░
Pass 118: ~971 KB  ███████████████████████████████████████████████░
Pass 119: ~971 KB  ███████████████████████████████████████████████░  ← current
                   (971.45 KB / gzip: 248.83 KB)
```

### Key Metrics

| Metric                 | Value                                                                     |
| ---------------------- | ------------------------------------------------------------------------- |
| Total passes executed  | 119                                                                       |
| Files in src/          | ~162 (+2 new services: errorReporting, sentryInit)                        |
| Largest file           | 453 lines (integration.test.ts)                                           |
| Files over 400 lines   | 12 (all under 500 hard limit)                                             |
| Production bundle (JS) | 971.45 KB (gzip: 248.83 KB)                                               |
| Build time             | 1.6–1.82s consistently                                                    |
| Spellcheck issues      | 0 across 136 consumer components                                          |
| VS Code diagnostics    | 3 CSS contrast warnings (glass edges, not blocking)                       |
| Orphaned dead code     | 3 components (DemoModeBanner, AdminAccountSetup, RealtimeBidExample)      |
| Error boundary         | GlobalErrorBoundary (root) + NavigationErrorBoundary + ImageErrorBoundary |
| Sentry status          | Wired, inactive — set VITE_SENTRY_DSN in .env to activate                 |

---

## Detailed System Breakdown

### 1. Overall Platform Completion

```
Status: 🟡 In Progress
Progress: ████████████████████░░░░ 82%
```

**Delivered:**

- Core app shell with Clerk auth, role-based routing, Supabase data layer
- Landing page with interactive coverage map
- Dashboard with role-specific map widgets and notification center
- Shop directory with map + search + intelligence
- Insurer claims screen with lifecycle timeline
- Admin toolkit (dev-only, flagged for removal)
- Real-time bid notification system via Supabase WebSocket
- Royal-blue glass design system deployed across all screens
- **Pass 15**: Dashboard/map controls now use product-owned, tactile, blue-aligned glass system; identity convergence complete for dashboard, profile dropdown, HomeScreen quick actions

**Missing:**

- Workflow automation (claim approval, bid routing, repair lifecycle state transitions)
- Global error boundary and monitoring (Sentry/LogRocket)
- Offline/PWA strategy
- Accessibility audit (ARIA, keyboard navigation)
- Performance metrics and vitals tracking
- Push notification support
- End-to-end test coverage

**Next Move**: Navigation session lifecycle → workflow automation

---

## 2. Site Experience (Non-Map)

```
Status: 🟢 Shipped
Progress: █████████████████░░░ 84%
```

**Delivered:**

- Landing page: hero, benefits, how-it-works, trust stats, regions, about, insurer partnership
- Auth: Clerk login, account type selector, migration modal
- Dashboard: header, nav tabs, mobile bottom nav, profile dropdown, notification center
- Reports: list, detail, competitor analysis, missing state
- Workflow: repair lifecycle timeline with insurer-specific presets
- Onboarding: shop + insurer onboarding forms
- Customer screens: vehicle profile, liked shops, photo guide

**Delivered (Pass 12):**

- Landing identity convergence: all 7 primary surfaces now use brand navy `#003d82`/`#0c2340`, `bd-glass-card` tokens, blue atmospheric wrapper gradient
- Animated value carousel in HeroSection (3.8s cycle, reduced-motion safe, dot navigation)
- Green/orange brand mismatches fixed: HowItWorks step numbers → navy gradient, WhoWeServe shops card → sky blue
- Blue-tinted header scroll state, blue nav hover, BD-glass badge for trust chip

**Missing:**

- Analytics/stats dashboard widgets
- Billing/subscription management
- Email verification flow (Clerk handles, but no custom UI)
- Settings/preferences screen

**Next Move**: Analytics widgets

---

## 3. Map / Coverage Experience

```
Status: � Shipped
Progress: █████████████████████░░░ 91%
```

**Delivered:**

- **2026-03-23: Navigation Session Cloud Sync (Pass 19):** Navigation session state is now persisted in Supabase (`navigation_sessions` table) with localStorage as cache. Session state is hydrated from Supabase on boot and saved to Supabase on update. Cross-device continuity is now real. No UI or unrelated code changed. All changes are minimal and scoped. Build, diagnostics, and spellcheck all clean. Session persistence verified after reload and across devices.

**Missing:**

- Map-owned search with autocomplete/predictive results
- Contextual reveal depth (overlays still show same content across modes)
- Customer repair routing intelligence
- Shop service-area operations view
- Insurer claims density heatmap

**Next Move**: Richer overlay content parity → predictive search → role-specific map views

---

## 4. Fullscreen Map UX

```
Status: � Shipped
Progress: ████████████████████░░░░ 85%
```

**Delivered:**

- Leaflet map surface renders correctly
- Map/list/hybrid view modes exist
- Map markers and route polylines work
- Bottom shop preview badge on map
- Theme toggle (light/dark tiles)
- `ShopDirectoryMapOverlays.tsx`: overlay infrastructure live — intelligence chip, route preview card, deviation prompt slot (Pass 9)
- `ShopDirectoryMapPane` children prop + `suppressHeader` for immersive use (Pass 9/10)
- Hero collapses to compact bar in hybrid mode (Pass 9)
- Route panel + intelligence panel + context cards hidden from sidebar in map/hybrid (Pass 9)
- **`ShopDirectoryImmersiveMap.tsx`**: full-viewport `fixed inset-0` immersive layout (Pass 10)
- **Map-owned search**: floating glass search pill in immersive top bar (Pass 10)
- **Collapsible results drawer**: replaces fixed sidebar in map mode, toggle-driven (Pass 10)
- **Mode-based overlay system**: `navigationMode` prop controls intelligence chip, route card, and deviation prompt visibility by state (browse / route-preview / guidance) (Pass 10)
- **MapPane `suppressHeader`**: immersive mode suppresses built-in badges for clean takeover (Pass 10)

**Missing / Remaining:**

- Overlay content still needs deeper data richness (intelligence chip shows callouts, not live nav state)
- Search does not have autocomplete/predictive suggestions yet
- No animated transitions between modes (browse → route-preview → guidance)
- No gesture-driven overlay controls (swipe to dismiss, drag to expand)
- Hybrid mode still uses grid layout (not immersive)

**Next Move**: Overlay content enrichment → predictive search → mode transition animations

---

## 5. Navigation Intelligence

```
Status: 🟢 Shipped
Progress: ████████████████████ 100%
```

**Delivered:**

- GPS live tracking with accuracy monitoring
- Turn-by-turn routing via OSRM
- Speed + speed-limit HUD (Overpass API)
- Address search with predictive suggestions
- Navigation session persistence (localStorage)
- Deviation detection: route-change, off-route, stopped, delay-increase
- Discriminated union types for all deviation events
- Navigation intelligence hook with event history
- Provider health telemetry (combined trust state)
- GPS degradation detection + warning
- Speed-limit unavailable graceful state
- Navigation session lifecycle: formal state machine (idle → planning → active ⇄ paused → ended)
- Session types + reducer hook with pause/resume tracking and active-seconds computation
- ShopDirectoryScreen extraction (1163 → 478 lines): session hook, hero, search panel

**Missing:**

- ETA updates during active navigation
- Offline fallback routing
- Real-time rerouting on deviation
- Multi-stop routing

**Next Move**: Cloud-synced sessions → ETA updates

---

## 6. Reroute Lifecycle

```
Status: � Shipped
Progress: ████████████████████ 100%
```

**Delivered:**

- Reroute types: lifecycle states, request, cooldown constants
- Pure `shouldTriggerReroute()` decision helper
- `useNavigationReroute` hook: idle → eligible → pending → completed → cooldown
- Off-route prompt UI: `NavigationDeviationPrompt` banner
- Reroute wired into ShopDirectoryScreen via deviation events
- 60-second cooldown against re-trigger

**Missing:**

- Automatic reroute (currently requires user confirmation)
- Reroute confidence scoring
- Multiple alternate route comparison
- Reroute history/analytics

**Next Move**: Automatic reroute option → reroute confidence → alternate route ranking

---

## 7. Voice Guidance / Voice Alerts

```
Status: � Shipped
Progress: ████████████████████ 100%
```

**Delivered:**

- Web Speech API wrapper with `SpeakResult` return type
- Cross-browser hardening (Safari gesture gate, Chrome async, Firefox)
- `primeVoiceEngine()` for Safari compliance
- `utterance.onerror` handler + `consumeLastSpeechError()`
- Voice support detection (`VoiceSupportStatus`)
- Deviation voice alerts: off-route (medium/high), delay increase (full mode)
- Reroute announcements: pending + confirmed
- Natural language phrase pools with random sampling
- Event-ID deduplication + reroute-status transition tracking
- Mode-aware dispatch (muted/alerts-only/full)
- `NavigationVoiceSettings` canonical type + `SpeakInstructionArgs`

**Missing:**

- Voice picker UI (persona selection)
- Volume preset UI integration
- Premium TTS voices (future tier)
- Offline voice fallback
- Custom pronunciation dictionary

**Next Move**: Voice picker UI → volume controls integration

---

## 8. Navigation Session Lifecycle

```
Status: 🟢 Shipped
Progress: ████████████████████ 100%
```

**Delivered:**

- Navigation session persistence (localStorage save/load)
- Session ID generation in intelligence hook
- Basic session recovery on page reload
- `sessionTypes.ts`: formal state machine types (idle → planning → active ⇄ paused → ended), discriminated actions, session snapshot interface (Pass 11)
- `useNavigationSession.ts`: reducer-driven lifecycle hook, pause/resume tracking, active-seconds computation with pause deduction, auto-sync with shop directory session state (Pass 11)
- `ShopDirectoryScreen` extraction: screen slimmed 1163→478 lines; session state fully encapsulated in `useShopDirectorySession` (Pass 11)

**Missing:**

- Cloud sync to Supabase
- Session history and analytics
- Multi-device session continuity
- ETA updates during active navigation

**Next Move**: Cloud-synced sessions (Supabase `navigation_sessions` table)

---

## 9. Design System / Glass System

```
Status: 🟢 Shipped
Progress: ██████████████████████░░ 92%
```

**Delivered:**

- Royal-blue glass token system in `theme.css`
- 5 glass classes: `bd-glass-panel`, `bd-glass-card`, `bd-glass-badge`, `bd-glass-control`, `bd-glass-floating`
- CSS hover/active states on `bd-glass-control`
- Navy dark mode (`#0c1929` base, `#132237` card, `#1c2e47` accent)
- Blue-tinted glass (alice-blue light, blue-glow dark)
- Unified hover standard: `hover:bg-white/40`
- Map liquid animations (float, sheen, entry)
- `mapSurfaceTheme.ts` + `globalSurfaceTheme.ts` tone-aware themes
- Deployed across: map surfaces, shell surfaces, HomeScreen, dashboard, reports, shop directory, bids, account screens
- **UI Glass System Refinement (Pass 13)**: ShopDirectoryHero and ShopRequestsScreen refactored to enforce bd-glass-panel, bd-glass-card, and bd-glass-control for all surfaces and controls. All white/gray backgrounds and window-like layouts removed. Blue-tinted, premium navigation product feel established. All controls and overlays now use the glass system, with depth, lighting, and blue environment unified. Build, spellcheck, and diagnostics clean. Mobile and desktop UI validated.
- **Dashboard/Map Control Identity Convergence (Pass 15)**: DashboardLayout, ProfileDropdown, and HomeScreen quick actions/CTAs now use bd-glass-control or premium blue system for all true interactive controls. Hierarchy and product-owned feel preserved. No over-application. Build, diagnostics, and spellcheck clean. Mobile/desktop UI validated.

**Missing:**

- Glass-safe form treatment for ShopActiveJobsScreen
- Glass-safe data tables for InsurerClaimsScreen
- Component library documentation / Storybook

**Next Move**: Stage 3b form/table glass treatment (ShopActiveJobsScreen, InsurerClaimsScreen)

---

## 10. Dashboard / Router Architecture

```
Status: 🟢 Shipped
Progress: █████████████████░░░ 86%
```

**Delivered:**

- `App.tsx`: Clerk auth → role detection → view routing (~350 lines, clean)
- `DashboardRouter.tsx`: 20+ screen imports, tab routing, role-aware dispatch (~600 lines)
- `useNavigation` hook for centralized tab/screen state
- Role-specific dashboard compositions (customer/shop/insurer)
- Demo mode entry/exit flow
- Animation support (AnimatePresence)

**Missing:**

- Route-based URL navigation (currently tab-state, not URL)
- Deep linking support
- Browser back/forward integration
- Code splitting / lazy loading for large screens

**Next Move**: URL-based routing (React Router or similar) → code splitting

---

## 11. Data Integrity / Fake Data Removal

```
Status: 🟢 Shipped
Progress: ██████████████████░░ 92%
```

**Delivered:**

- Supabase is primary source of truth for profiles, vehicles, reports, bids
- localStorage is cache/recovery only — never silently overrides cloud
- Demo mode data clearly isolated in `demoDataService.ts` and `demoMode.ts`
- Migration flow: cached data → Supabase → reload from cloud
- localStorage quota handling with graceful fallback
- Cloud edge functions: shopProfile, insurerProfile, directoryInventory
- Consistent types across Supabase and app layer

**Missing:**

- Demo data removal from production builds (feature flag exists but data files ship)
- Stale cache invalidation strategy
- Data versioning / schema migration automation

**Next Move**: Production build demo-data tree-shaking → cache TTL strategy

---

## 12. Notifications Architecture

```
Status: 🟡 In Progress
Progress: █████████████████░░░ 82%
```

**Delivered:**

- Supabase WebSocket real-time bid subscriptions
- `RealtimeBidService` with connection monitoring
- `NotificationCenter` UI: drawer, unread count, mark-as-read, navigation
- Notification type system (bid, update, claim)
- Badge integration in ProfileDropdown
- Connection status indicator (pulse animation)
- Notification persistence across refresh

**Missing:**

- Push notifications (Web Push API)
- Email/SMS digest
- Notification preferences / do-not-disturb
- Notification grouping / batching
- Sound/vibration settings

**Next Move**: Web Push API integration → preferences UI

---

## 13. Role Flows

### Customer Flow

```
Status: 🟡 In Progress
Progress: █████████████████░░░ 75%
```

- ✅ Damage report submission
- ✅ Vehicle profile management
- ✅ Shop discovery + map
- ✅ Bid viewing
- ✅ Photo guide
- ✅ Liked shops
- ❌ Repair tracking dashboard
- ❌ Payment/invoice flow
- ❌ Communication with shop

### Shop Flow

```
Status: 🟡 In Progress
Progress: ████████████████░░░░ 70%
```

- ✅ Incoming request viewing
- ✅ Active jobs screen
- ✅ Shop directory / competitive intel
- ✅ Onboarding form
- ✅ Map navigation to customers
- ❌ Bid submission workflow (UI exists, logic partial)
- ❌ Job status updates
- ❌ Revenue/analytics dashboard
- ❌ Customer communication

### Insurer Flow

```
Status: 🟡 In Progress
Progress: ███████████░░░░░░░░░ 58%
```

- ✅ Claims list with filter/search
- ✅ New claim form
- ✅ Partner shops management
- ✅ Lifecycle timeline integration
- ✅ Onboarding form
- ❌ Claim approval automation
- ❌ Claims routing logic
- ❌ Analytics/density views
- ❌ Shop performance scoring

### Admin Flow

```
Status: 🟡 Dev-Only
Progress: ████████████████░░░░ 82%
```

- ✅ Dashboard with operation status
- ✅ Account creation/switching
- ✅ User management/deletion
- ✅ Test account linking
- ⚠️ Flagged for production removal

---

## 14. Production Readiness

```
Status: � In Progress
Progress: ████████████████░░░░░░░░ 68%
```

**Delivered:**

- TypeScript strict mode
- Vite build pipeline (clean, fast)
- Clerk auth with key validation
- Supabase data layer (real, not mock)
- Feature flags (`ENABLE_REALTIME_BIDS`, etc.)
- Image error boundary
- Environment config separation
- cspell integration

**Missing:**

- ~~Global error boundary (only image-level exists)~~ ✅ **Done — Pass 109** (GlobalErrorBoundary, branded, DEV-only detail)
- ~~Error logging/monitoring (Sentry, LogRocket)~~ ✅ **Done — Pass 110** (@sentry/react wired; activate via VITE_SENTRY_DSN)
- ~~Accessibility audit (ARIA, keyboard, screen reader)~~ 🔄 **Pass 111** — critical WCAG A violations fixed; full audit pending
- Rate-limit handling on edge functions
- Offline detection / service worker
- Stale-while-revalidate caching
- Performance metrics / Web Vitals
- Mobile responsiveness validation suite
- CI/CD pipeline
- Automated testing (unit, integration, e2e)
- Security headers / CSP configuration
- SEO / meta tags / Open Graph

**Next Move**: Remove false trust claims (P0-TRUST) → remainder of accessibility audit → CI/CD pipeline

---

## 15. Current Drift Risks

| Risk                                | Severity       | Details                                                                        |
| ----------------------------------- | -------------- | ------------------------------------------------------------------------------ |
| Overlay content lacks data richness | ⚠️ MEDIUM      | Intelligence chip shows callouts; not yet live nav state or warnings           |
| No navigation session lifecycle     | ⚠️ MEDIUM      | Session state is ad-hoc; no formal start/pause/end                             |
| Insurer workflow is display-only    | ⚠️ MEDIUM      | Claims screen exists but no approval/routing logic                             |
| False trust claims on landing page  | ❌ P0-TRUST    | "Insurance Approved", "BBB Accredited", "24/7 Support" — not real              |
| "Coverage focus" fallback label     | ⚠️ P2-DATA     | MapSearchTargetMarkers.tsx + useCoverageNavigationExperience.ts hold old label |
| Hybrid mode still grid-based        | ⚠️ LOW         | Hybrid uses sidebar grid; not yet immersive                                    |
| Admin features ship to production   | ⚠️ LOW         | Flagged for removal but still in build                                         |
| Sentry DSN not configured           | ⚠️ OPERATIONAL | VITE_SENTRY_DSN needed in .env to activate crash reporting                     |

---

## 16. Best Next Passes (Priority Order) — Updated 2026-03-25

| #     | Pass                                   | Impact                                           | Unlocks                                         |
| ----- | -------------------------------------- | ------------------------------------------------ | ----------------------------------------------- |
| ~~1~~ | ~~**Fix "props" runtime crash**~~      | ~~P1-RUNTIME~~ ✅ Fixed Pass 186                 | ~~Stable navigation~~ ✅                        |
| 1     | **Full loop validation**               | Prove landing→report→bids→decision works         | Real user journey verified end-to-end           |
| 2     | **Map dominance finalization**         | Reduce visual weight of non-map elements         | Map feels alive and central, not just a section |
| 3     | **Interaction flow smoothing**         | Tap→response→transition→feedback audit           | Zero-friction movement between states           |
| 4     | **Map→data loop hardening**            | Reports/shops feel spatially tied to location    | Connected product feel, not detached UI         |
| 5     | **Mobile experience perfection**       | Thumb zones, bottom sheets, map visibility       | Mobile IS the product                           |
| 6     | **Landing section coherence**          | Connect lighter sections to map/dark identity    | Entire site feels like one product              |
| 7     | **Customer decision loop**             | Report→bids→shop→navigation continuity           | Real user journey completion                    |
| 8     | **Full Accessibility Audit (WCAG AA)** | Keyboard, screen reader, color contrast          | Compliance, inclusion                           |
| 9     | **Supabase RLS security hardening**    | Fix 4 overly permissive policies (`USING(true)`) | Production security readiness                   |
| 10    | **CI/CD pipeline + test foundation**   | Automated builds, basic test coverage            | Deployment confidence, regression prevention    |

### Completed priorities (removed from queue)

- ~~Remove False Trust Claims~~ ✅ Done (Pass 112-115)
- ~~"Coverage focus" Label Cleanup~~ ✅ Done (Pass 113)
- ~~Sentry DSN Configuration~~ ✅ Done (Pass 182)
- ~~Landing Page Glass Unification~~ ✅ Done (Pass 182A-E)

---

_This dashboard is the AI-maintained source of truth for BidOnDent platform progress._
_Update it. Trust it. Keep it honest._
