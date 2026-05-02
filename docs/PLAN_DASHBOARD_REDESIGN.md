# PLAN — Dashboard Premium Lift (2026-05-02)

**Authority:** PLAN-tier — future direction, not current truth. Each pass activates only when the owner greenlights it.
**Last updated:** 2026-05-02
**Status:** Pass D2 shipped (Tier 1 chrome material lift — header, sidebar, profile dropdown, notification center, role stats, market indicator, mobile bottom nav). Pass D3 gated on owner visual review of D2 on Vercel.
**Scope:** All authenticated dashboard surfaces across all four roles (customer, shop, insurer, admin) — visible primary screens, hidden deep pages, modals, overlays, and onboarding. Auth screens (login modal) included since they're first-impression chrome.
**Companion docs:** [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) §9 inheritance rule, [`PLAN_LANDING_REDESIGN.md`](PLAN_LANDING_REDESIGN.md) STATUS COMPLETE (the source quality bar this plan inherits without violating boundaries), [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md), [`bd-design-identity` skill](~/.claude/skills/bd-design-identity/SKILL.md), [`REF_SYSTEM_STATE.md`](REF_SYSTEM_STATE.md) for component map.

---

## Hardening Phase Context

Per [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md), the project is in Soft Launch Hardening. This redesign is **visual polish only** — no functional changes, no new features, no data-model touches, no auth/storage drift. If a pass reveals a structural bug, file as a new KI; do not fix inline. Launch correctness > visual completion.

---

## Locked Boundary — Dashboard Inheritance Rule

[`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) §9 item 9 states:

> Do not apply the landing-page automotive identity layer to dashboard surfaces. The dashboard inherits the calm-map / glass-shell system documented under Dark Shell Design System; the automotive register (sedan silhouettes, lane dashes, warm amber atmosphere, Direction C luminance) is a landing-only signature. Mixing them dilutes both.

**This plan respects that rule absolutely.** The dashboard premium lift will use:

✅ **Allowed (transferable from landing):**
- The `bd-glass-card` and `bd-glass-card--landing` glass system architecture (the *class system*, not the warm variant)
- Premium card material concepts: heavier shadow, inset highlight, hover lift, lit-glass top-radial inner highlight (Pass 9 AboutOpportunity treatment)
- Calm cool-blue atmospheric depth (sky/royal/cobalt families) at low opacities (5–10%, vs landing's 15–25%)
- Polished empty states with iconplate framing (Pass 11 "Coverage is expanding" treatment)
- `bd-bloom-atmosphere` scroll-entry as opt-in for hero-sized dashboard surfaces only (most workspace UI should NOT bloom — too playful)
- Refined section eyebrow typography (small caps, tracking) — no flanking strokes
- Premium modal glass with stronger `backdrop-filter` + inset highlight

❌ **Forbidden (landing-only signature):**
- ⛔ NO sedan silhouettes, lane dashes, road-line patterns, automotive iconography
- ⛔ NO warm amber atmosphere (Direction B is a landing-only register split)
- ⛔ NO warm gold flanking accents (Pass 12/13 is landing-only)
- ⛔ NO sky teal / royal / cobalt / slate flanking strokes (Pass 14 is landing-only editorial typography)
- ⛔ NO white-cream lamp accents (Pass 15 CTA-specific)
- ⛔ NO topographic concentric rings (landing Coverage-only)
- ⛔ NO atmospheric corner luminance accents per section (Pass 6 Direction C)
- ⛔ NO `bd-glass-card--landing-warm` variant on any dashboard surface

The dashboard's job is **calm focused workspace**, not cinematic narrative. Decoration density should be ~30–50% of landing.

---

## Audit Findings (visual review of 19 owner-provided screenshots, 2026-05-02)

### What's working now

- **Sidebar navigation** is clear, role-stable, and structurally sound. The user-card with quick stats (Reports / Vehicles / Bids count) + Notifications panel + secondary nav links is a good information density choice.
- **Multi-step Report intake** has a clean step indicator (1–5 circles) and good copy rhythm ("Tell us about your vehicle" → "Where is the damage?" → "Set where shops should see this report"). The flow itself is well-organized.
- **Quick Actions cards** (New Repair Request / View Bids / Connect Insurance / Find Shops) are a good high-visibility pattern.
- **Smart Map Tools** section (AI Matching / Directions / Compare) is a useful decision-aid surface.
- **Both light and dark mode already implemented baseline** — no fundamental rework needed, just material lift.
- **Dark mode** uses the cool navy register correctly (no fight with landing identity).

### What's weak (compared to the landing's post-redesign quality bar)

- **No atmospheric depth.** Background colors are flat solid panels in both modes. Landing has subtle radial ellipse overlays that give the page a sense of "lit space"; dashboard has none. This is the single biggest perception gap.
- **Cards lack premium material weight.** Most dashboard cards use a base `rounded-{lg|xl|2xl}` + border + simple shadow. Compared to landing's `bd-glass-card--landing` (heavier shadow, stronger inset highlight, premium hover lift), they read as functional containers, not lit-glass plates.
- **No section-level rhythm.** Every section has the same gray-blue background; no chapter-break atmosphere. Section eyebrows ("REPAIR OVERVIEW", "YOUR DASHBOARD", "REPAIR ACTIVITY") are present but plain text — no typographic anchor.
- **Empty states are functional but bare.** "No nearby shops yet — Open the map to search your area." is correct copy with an icon, but doesn't have the "Coverage is expanding" lit-glass-icon-plate treatment Pass 11 introduced.
- **Modals lack glass material.** The Photo tips modal, login modals, etc. use simple `bg-white` / `bg-slate-900` cards without the `backdrop-filter` + inset highlight + premium border treatment.
- **Color inconsistency on action accents.** The amber/orange "Damage Report" and "Damage zone" pills in Report intake feel orphaned — amber doesn't appear elsewhere in the dashboard. Should be cool-blue family for consistency.
- **Step indicator could be premium.** The 1-5 circles work but are basic; could use lit-glass plate treatment for the active step + subtle progress fill animation.
- **Map widgets feel basic.** `CustomerMapWidget`, `ShopMapWidget`, `InsurerMapWidget` and the `MapLibreDashboardMapPreview` use simpler chrome than the landing Coverage Map widget. Could match the Coverage Map preview tier (premium glass shell + better region pills).
- **Selected/hover states under-deliver.** No subtle scale-on-hover, no inset glow on selected, no premium micro-interactions.
- **Section eyebrow typography is plain.** Could use small-caps + tracking + subtle color bleed for editorial polish (without flanking strokes).
- **Profile dropdown + Notifications dropdown** look clean but could feel more premium with stronger glass material and refined item rows.

### What's notably good (don't touch)

- The user-card in the sidebar (avatar + email + role pill + 3-stat grid + notifications snapshot + quick links + Log Out) is a strong information-dense pattern. Polish, don't redesign.
- The vertical step indicator + side-by-side form layout in Report intake is good — keep structure, polish material.
- The Bid comparison filter pills (All Bids / Lowest Price / Fastest / Highest Rated) are a good UX pattern — polish, don't redesign.
- Vehicle selection card pattern in Report intake (with "2 saved" pill and "Use" affordance) is well-designed.

---

## Design Philosophy

**Calm premium for workspace surfaces.** The dashboard is where users do real work (submit reports, compare bids, manage claims, browse shops). It must:

1. **Feel premium without distracting.** Atmospheric depth is subtle (5–10% opacity), motion is functional (no bloom-on-scroll for most surfaces), accents support hierarchy not narrative.
2. **Stay calm under information density.** A user with 30 active jobs and 5 notifications shouldn't feel visual noise added by the design system.
3. **Inherit the cool-blue glass shell.** Sky / royal / navy / gray-blue. No warm register. No automotive cues. No cinematic Direction C accents.
4. **Match landing's *quality* bar without imitating its *identity*.** Glass material, polished empty states, refined typography, premium hover/focus — yes. Editorial flanking strokes, warm amber sections, sedan silhouettes — no.
5. **Respect role differentiation.** Customer / shop / insurer / admin all share the chrome but their primary content differs. The plan must polish all four without making them homogeneous.

> **The discipline filter, run on every change:** "Does this make the user's work feel more focused, more trustworthy, and more premium — or is it decoration?" If it's decoration, skip.

---

## Dashboard Surface Inventory (the work to scope)

### Tier 1: Always-visible chrome (highest impact, every screen inherits)

`src/app/components/dashboard/`:

- `DashboardHeader.tsx` — top bar: title + search + bell + avatar
- `DesktopNavTabs.tsx` — sidebar nav (Dashboard / Report / Bids / Account / role-specific)
- `MobileBottomNav.tsx` — mobile-only bottom tab bar
- `ProfileDropdown.tsx` — avatar dropdown menu
- `NotificationCenter.tsx` — bell dropdown
- `ProfileRoleStats.tsx` — sidebar user-card stats
- `MarketStatusIndicator.tsx` — sidebar live-state pill
- `DashboardCoveragePanel.tsx` — embedded map + smart tools

Plus: `DashboardLayout` + `DashboardRouter` (under `routers/`) — structural wrappers.

### Tier 2: Per-role primary screens

**Customer** (`src/app/components/codelayer/`, 35 files):

- `HomeScreen.tsx` (Dashboard home — what the screenshots showed)
- `ReportScreen.tsx` + 5-step intake (`StepVehicleInfo`, `StepDamageArea`, `StepServiceLocation`, `StepPhotos`, `StepDescription`, `StepComplete`) + `ReportHeader`, `ReportProgress`, `CarDiagram`, `ReportAutoSaveIndicator`
- `BidsScreen.tsx` + `BidCardArticle`, `BidsSummaryHeader`, `BidsGeographyMap`, `BidsEmptyState`, `BidAcceptConfirmationDialog`, `AcceptedBidConfirmationSheet`
- `AccountScreen.tsx` + `AccountHeader`, `AccountInfoCard`, `AccountMenu`, `AccountAdminOverlay`, `EditProfileModal`, `DeleteAccountModal`, `HelpModal`, `PaymentModal`, `SettingsModal`, `ServiceAreaEditorModal`, `ShopProfileModal`

**Shop** (`src/app/components/shop/`, 59 files — largest role):

- `ShopRequestsScreen.tsx` (incoming repair requests)
- `ShopActiveJobsScreen.tsx` + `ShopActiveJobCard`, `ShopActiveJobDetailModal`
- `ShopDirectoryScreen.tsx` + ~30 sub-components for the immersive shop directory map experience: `ShopDirectoryHero`, `ShopDirectoryHybridStage`, `ShopDirectoryImmersiveMap`, `ImmersiveOriginPicker`, `ImmersiveMapTopBar`, `ImmersiveMapResultsDrawer`, `ImmersiveMapViewport`, `MapLibreShopDirectoryMapPane`, `MapPaneLegendPanel`, `MapPaneAtmosphereOverlays`, `MapPaneInfoPopups`, `ShopDirectoryContextCards`, `ShopDirectoryExpandedView`, `ShopDirectoryGuidanceCard`, `ShopDirectoryHybridHeader`, `ShopDirectoryHybridMapSection`, `ShopDirectoryIntelligencePanel`, `ShopDirectoryRoutePanelGuidanceControls`, `RoutePanelGuidanceControls`, `GuidanceArrivalSection`, `LikedShopCard`, `LikedShopsScreen`, `ShopDetailSheet`, `EstimateRequestSheet`, `PhotoGuide`, `ShopBidModal`, `ShopBidsSummary`
- `ShopOnboardingStep1-4.tsx`
- `ShopRequestCard.tsx`, `ShopRatingModal.tsx`, `VehicleProfileScreen.tsx`

**Insurer** (`src/app/components/insurer/`, 14 files):

- `InsurerClaimsScreen.tsx` + `InsurerClaimCard`, `InsurerClaimApprovalModal`, `InsurerClaimDenialModal`
- `InsurerNewClaimScreen.tsx` + `InsurerNewClaimForm`
- `InsurerPartnerShopsScreen.tsx` + `InsurerPartnerShopCard`
- `InsurerConnectionScreen.tsx` + `InsurerConnectFormModal`
- `InsuranceCompaniesScreen.tsx`
- `InsurerOnboarding.tsx`
- `AddProspectModal.tsx`, `ManualProspectCard.tsx`

**Admin** (`src/app/components/admin/`, 12 files):

- `AdminDashboard.tsx`
- `AdminAccountManager.tsx`, `AdminAccountSetup.tsx`
- `AdminInfoPanel.tsx`, `AdminIntakeOperationsPanel.tsx`, `AdminManagementPanel.tsx`
- `AdminHeader.tsx`
- `DeleteUserUtility.tsx`, `LinkedTestAccounts.tsx`
- `NewAccountForm.tsx`, `QuickActions.tsx`, `SwitchBackPanel.tsx`

### Tier 3: Modals, dialogs, overlays (cross-role)

- Photo tips modal (in Report intake)
- All `*Modal.tsx` files across roles (~25 modal files total)
- `AccountOverlays.tsx`, `AccountAdminOverlay.tsx`
- `NotificationToast.tsx` (UI primitive)
- Confirmation dialogs (bid accept, claim approval/denial, delete account)

### Tier 4: Auth & onboarding (first-impression chrome)

`src/app/components/auth/`:

- `LoginModal.tsx`, `LoginMainView.tsx`, `LoginLoginView.tsx`, `LoginSignupView.tsx`, `ClerkAccountTypeSelector.tsx`

### Tier 5: Map widgets (cross-role embedded)

- `CustomerMapWidget.tsx`, `ShopMapWidget.tsx`, `InsurerMapWidget.tsx`
- `MapLibreDashboardMapPreview.tsx`
- Shop directory immersive map (inside Tier 2 Shop)

### Tier 6: Hidden / dev-only / less-used

- `SmokeTestChecklist` (Account → dev QA shortcuts)
- `DemoSwitcher`, demo-mode UIs
- `DevTools/`, `dev/AppearanceToggle.tsx`
- Vehicle profile screens
- Competitor analysis (insurer)

---

## Pass Sequence (proposed)

Like landing, this plan ships in tightly-scoped passes with owner greenlight between each. Each pass has a single clear theme and is reversible.

### Pass D1 — Foundation: bd-glass-card--dashboard variant + atmospheric base layer

**Scope:**

- Add `bd-glass-card--dashboard` variant to [`src/styles/theme.css`](../src/styles/theme.css). Treatment:
  - Light mode: heavier shadow than base `bd-glass-card`, inset top highlight, subtle 0 0 36px ambient glow at `rgba(59,130,246,0.08)`, 4px hover lift
  - Dark mode: stronger inset highlight, deeper shadow, subtle ambient glow at `rgba(59,130,246,0.12)`
  - Quieter than `--landing` (which is meant to be premium-marketing-anchor). `--dashboard` is calm-workspace-anchor.
- Add subtle atmospheric base layer to `DashboardLayout` background — single very-low-opacity radial ellipse (5–8% effective). Cool blue family. No motion. No section alternation.
- Establish `bd-section-eyebrow` utility class for the small-caps section labels ("REPAIR OVERVIEW", "YOUR DASHBOARD", "REPAIR ACTIVITY") — refined typography, no flanking.

**Files touched:** `theme.css`, `DashboardLayout.tsx` (or wherever the dashboard root is).

**Risk:** Low. New variant, new class, additive only.

**Validation:** Visit dashboard home; cards should feel slightly more "lit" without anything looking different structurally. Atmospheric base should be perceptible on scroll but never dominant.

---

### Pass D2 — Tier 1 chrome: header, sidebar nav, dropdowns, notification center

**Scope:**

- `DashboardHeader.tsx`: apply `bd-glass-card--dashboard` to the top bar. Premium glass material. Search input gets refined focus state (subtle glow, not aggressive).
- `DesktopNavTabs.tsx` / sidebar: nav-item active state gets lit-glass plate treatment (cool blue inset glow). Hover: subtle scale + brighter border. Inactive: clean and quiet.
- `ProfileDropdown.tsx`: refined glass material on the dropdown panel itself; menu items get hover backdrop + small tracking adjustment.
- `NotificationCenter.tsx`: bell dropdown gets premium glass; empty state ("No notifications yet") gets the lit-glass icon-plate treatment.
- `ProfileRoleStats.tsx`: the 3-stat grid (Reports/Vehicles/Bids) gets subtle inset highlight per cell.
- `MobileBottomNav.tsx` (mobile only): premium glass + refined active-state.

**Files touched:** ~8 files in `dashboard/`.

**Risk:** Low–medium. Chrome is everywhere; regression here is visible everywhere. Build verify + visual review.

---

### Pass D3 — Customer Tier 2: HomeScreen + Report intake polish

**Scope:**

- `HomeScreen.tsx` (`codelayer/`): all card surfaces (Quick Actions, Repair Activity rows, Smart Map Tools, Nearby Matches) → `bd-glass-card--dashboard`. Section eyebrows → `bd-section-eyebrow`. Empty states ("No nearby shops yet") → lit-glass icon-plate treatment matching Pass 11's "Coverage is expanding."
- `ReportScreen.tsx` + step components: step indicator gets lit-glass active circle + animated progress fill. The amber/orange "Damage Report" / "Damage zone" / "Service radius" / "Photo evidence" pills get cool-blue family treatment (sky-blue badge with light tint) — fixes the color orphan issue.
- `CarDiagram.tsx` (the car illustration in DamageArea step): zone selection buttons → premium glass with cool-blue selected state (replace amber selection).
- `ReportProgress.tsx`: refined progress affordance.

**Files touched:** ~12 files in `codelayer/` and `codelayer/report/`.

**Risk:** Medium. Report intake is the customer's primary funnel. Touch carefully, build verify, manual click-through after.

---

### Pass D4 — Customer Tier 2: BidsScreen + AccountScreen polish

**Scope:**

- `BidsScreen.tsx` + `BidCardArticle`, `BidsSummaryHeader`, `BidsGeographyMap`, `BidsEmptyState`: all card surfaces → `bd-glass-card--dashboard`. Sort/Compare filter pills get refined treatment. Bid card hover gets premium lift. "Recommended" / "Lowest bid" badges refined. Geography map gets premium chrome.
- `BidAcceptConfirmationDialog.tsx`, `AcceptedBidConfirmationSheet.tsx`: modal glass + iconplate.
- `AccountScreen.tsx` + `AccountHeader`, `AccountInfoCard`, `AccountMenu`: card surfaces → `bd-glass-card--dashboard`. Profile completion progress bar gets premium inset. Vehicle list gets lit-glass row treatment.
- Account modals (`EditProfileModal`, `HelpModal`, `SettingsModal`, `PaymentModal`, `ServiceAreaEditorModal`, `ShopProfileModal`, `DeleteAccountModal`): all modal panels get premium glass + iconplate header.

**Files touched:** ~15 files.

**Risk:** Medium. Account modals touch sensitive flows (delete, payment, service area). Visual changes only — no logic touches.

---

### Pass D5 — Shop Tier 2 cohort A: Requests + Active Jobs + Onboarding

**Scope:**

- `ShopRequestsScreen.tsx` + `ShopRequestCard.tsx`: card surfaces → `bd-glass-card--dashboard`. Refined status badges. Empty state lit-glass treatment.
- `ShopActiveJobsScreen.tsx` + `ShopActiveJobCard.tsx`, `ShopActiveJobDetailModal.tsx`: same treatment.
- `ShopOnboardingStep1-4.tsx`: step indicator + form chrome polish (consistent with Customer Report intake).
- `VehicleProfileScreen.tsx`: card material + refined fields.
- `ShopBidModal.tsx`: premium glass + form polish.
- `ShopRatingModal.tsx`: premium glass + iconplate.

**Files touched:** ~10 files.

**Risk:** Medium. Shop role is the highest-volume content surface — many cards rendered per page.

---

### Pass D6 — Shop Tier 2 cohort B: Shop Directory + immersive map

**Scope:** This is the biggest single-pass surface area on the dashboard side.

- `ShopDirectoryScreen.tsx` orchestrator: section glass material refinement.
- `ShopDirectoryHero.tsx`, `ShopDirectoryHybridStage.tsx`, `ShopDirectoryHybridHeader.tsx`, `ShopDirectoryHybridMapSection.tsx`: hybrid-mode chrome polish.
- `ShopDirectoryImmersiveMap.tsx` + the immersive map family (`ImmersiveMapTopBar`, `ImmersiveMapResultsDrawer`, `ImmersiveMapViewport`, `ImmersiveOriginPicker`, `MapLibreShopDirectoryMapPane`, `MapPaneLegendPanel`, `MapPaneAtmosphereOverlays`, `MapPaneInfoPopups`): premium glass shell + refined controls. **The immersive map already has its own atmospheric overlay system — match the Coverage Map Dialog quality bar from landing here.**
- `ShopDirectoryContextCards.tsx`, `ShopDirectoryExpandedView.tsx`, `ShopDirectoryGuidanceCard.tsx`, `ShopDirectoryIntelligencePanel.tsx`: card material refinement.
- `LikedShopCard.tsx`, `LikedShopsScreen.tsx`: card material refinement.
- `ShopDetailSheet.tsx`, `EstimateRequestSheet.tsx`: premium sheet glass.
- `RoutePanelGuidanceControls.tsx`, `GuidanceArrivalSection.tsx`: refined navigation chrome.
- `PhotoGuide.tsx`: premium modal.

**Files touched:** ~30 files. Largest single pass.

**Risk:** High. Shop Directory is the most complex surface in the app. Strict visual-only constraint; if a refactor is tempted, file as separate KI.

**Preferred sub-split:** Could break this into D6a (Hero + hybrid stage + directory cards) and D6b (immersive map family) if the surface area is too large for one safe commit.

---

### Pass D7 — Insurer Tier 2 (all insurer screens)

**Scope:**

- `InsurerClaimsScreen.tsx` + `InsurerClaimCard`, `InsurerClaimApprovalModal`, `InsurerClaimDenialModal`
- `InsurerNewClaimScreen.tsx` + `InsurerNewClaimForm`
- `InsurerPartnerShopsScreen.tsx` + `InsurerPartnerShopCard`
- `InsurerConnectionScreen.tsx` + `InsurerConnectFormModal`
- `InsuranceCompaniesScreen.tsx`
- `InsurerOnboarding.tsx`
- `AddProspectModal.tsx`, `ManualProspectCard.tsx`

All: card surface → `bd-glass-card--dashboard`. Modals → premium glass. Empty states → lit-glass iconplate. Forms → polished focus states.

**Files touched:** ~14 files.

**Risk:** Medium. Insurer flow is critical for B2B relationships.

---

### Pass D8 — Admin Tier 2 (all admin screens)

**Scope:**

- `AdminDashboard.tsx`, `AdminHeader.tsx`
- `AdminAccountManager.tsx`, `AdminAccountSetup.tsx`, `NewAccountForm.tsx`
- `AdminInfoPanel.tsx`, `AdminIntakeOperationsPanel.tsx`, `AdminManagementPanel.tsx`
- `DeleteUserUtility.tsx`, `LinkedTestAccounts.tsx`, `SwitchBackPanel.tsx`, `QuickActions.tsx`

Card material refinement, modal polish, premium destructive-action affordance (delete user).

**Files touched:** ~12 files.

**Risk:** Low (admin-only, smaller user surface).

---

### Pass D9 — Auth & onboarding chrome

**Scope:**

- `LoginModal.tsx`, `LoginMainView.tsx`, `LoginLoginView.tsx`, `LoginSignupView.tsx`, `ClerkAccountTypeSelector.tsx`: premium login modal glass + refined Clerk-style form fields. Reads as premium SaaS sign-in, not basic auth screen.
- Cross-link to onboarding flows (Shop and Insurer Onboarding components already covered in their respective passes; this pass handles auth/login chrome only).

**Files touched:** ~5 files.

**Risk:** Low. Auth is sensitive but visual changes only.

---

### Pass D10 — Map widget consistency tier

**Scope:**

- `CustomerMapWidget.tsx`, `ShopMapWidget.tsx`, `InsurerMapWidget.tsx`: all three role-specific widgets get matching premium chrome (glass shell + ambient overlay + region pills) at the **Coverage Map preview tier** from landing — not the immersive dialog tier (that's the Shop Directory's job).
- `MapLibreDashboardMapPreview.tsx`: shared base also lifted.
- `DashboardCoveragePanel.tsx`: section chrome.

**Files touched:** ~5 files.

**Risk:** Medium. Map widgets render real MapLibre canvases — make sure visual changes don't fight WebGL layering.

---

### Pass D11 — Modal & overlay consistency sweep

**Scope:** Cross-role pass to make sure every modal/overlay/dialog has matching premium glass material.

- All remaining `*Modal.tsx` files not yet touched by previous passes
- `AccountOverlays.tsx`, `AccountAdminOverlay.tsx`
- `NotificationToast.tsx` (UI primitive — premium toast)
- Photo tips modal in Report intake
- Confirmation dialogs (already partly covered, verify consistency)

**Files touched:** ~10 files.

**Risk:** Low. Consistency pass; should mostly apply pre-built variants.

---

### Pass D12 — Polish + edge cases + sign-off

**Scope:**

- Hidden surfaces: `SmokeTestChecklist`, `DemoSwitcher`, `dev/` and `devtools/` components — apply minimum chrome consistency, don't overinvest (these are dev-only).
- Tablet (1024px) and mobile (375/414px) audit pass — ensure dashboard premium reads well across breakpoints. Many shop directory and immersive map components have mobile-specific behavior.
- Empty-state audit: confirm every "nothing here yet" surface uses the lit-glass iconplate treatment.
- Reduced-motion verification: any `bd-bloom-atmosphere` opt-ins must respect `prefers-reduced-motion`.
- WCAG AA contrast spot-check on all new card variants.
- Final visual review pass.

**Files touched:** Variable — issue-driven.

**Risk:** Low. Polish + cleanup.

---

## What Each Pass Will NOT Do (scope discipline)

Per landing's lessons:

- ❌ No new feature work, no new pages, no new functionality
- ❌ No automotive identity (locked rule)
- ❌ No editorial flanking strokes (landing-only)
- ❌ No warm amber atmosphere (Direction B is landing-only)
- ❌ No Direction C luminance accents (landing-only)
- ❌ No "while-I'm-here" refactors of business logic, hooks, services, types, or routing
- ❌ No bundling unrelated work into a pass — one theme per pass
- ❌ No skipping owner visual review between passes — do not assume the next pass is greenlit just because the prior one shipped

---

## Co-Update Commitments (binding)

Per [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) § Co-Update Rules:

| Trigger | Doc to update | Pass |
|---|---|---|
| New `bd-glass-card--dashboard` variant added | [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) §7 (Design System / Established Glass Patterns) | D1 |
| New `bd-section-eyebrow` utility | [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) §5 (CSS / Motion System Reference) | D1 |
| Atmospheric base layer added to `DashboardLayout` | [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) §7 (Dark Shell Design System / atmospheric notes) | D1 |
| Each pass complete | This plan doc — Status section, with commit hash + main merge hash | every pass |
| Plan complete | Mark this doc STATUS COMPLETE; archive any audit docs that supported it | After D12 |

---

## Open Questions — ALL ANSWERED / LOCKED (2026-05-02, owner-authorized)

All six gating questions are resolved. Answers are binding on every subsequent pass; do not re-litigate.

1. **Atmospheric base layer:** ✅ YES at **5–7% peak opacity**. Subtle radial, cool-blue, top-anchored. No motion. No section alternation. Shipped in D1 as `bd-dashboard-atmosphere` utility class applied at `DashboardLayout` root, sitting atop the existing layered `DashboardAtmosphere` component. If it reads decorative in D12, dial to 0 then — not before.

2. **`bd-glass-card--dashboard` variant strategy:** ✅ SEPARATE variant (do NOT mutate base `bd-glass-card`). Parallel to `--landing` and `--landing-warm`. Three-tier card hierarchy now documented in `MOLANDJESUS_DESIGN_DECISIONS.md` §7. Shipped in D1.

3. **Report-intake amber/orange pills** ("Damage Report", "Damage zone", "Service radius", "Photo evidence"): ✅ Convert to **cool-blue dashboard family**. Amber is landing-only register and feels orphaned in the dashboard. **Scope: D3, NOT D1.** Do not touch in D1.

4. **Shop Directory immersive map quality bar:** ✅ YES match Coverage Map Dialog *quality* tier. Quality, not identity. No automotive cues, no topographic rings, no warm garage lighting transferred. **Scope: D6, NOT D1.**

5. **Mobile + desktop scope per pass:** ✅ Every pass touches both. D12 is a dedicated breakpoint sweep, but mobile cannot wait until the end because dashboard mobile is too interaction-heavy.

6. **Separate audit doc:** ✅ NO. This plan's Audit Findings section is sufficient. No separate audit doc to be created for dashboard.

---

## Identity Guardrails (binding every pass)

From [`bd-design-identity` skill](~/.claude/skills/bd-design-identity/SKILL.md), [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md), and [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md):

- **Calm > lively.** Calm, premium, breathable, trustworthy, product-owned. Workspace surfaces should reduce cognitive load, not add to it.
- **Map is the base layer; glass floats above.** Never weaken the map for chrome.
- **Blue system has 4 roles** — royal (identity/action), sky (atmosphere/guidance), navy (depth/night), gray-blue (subdued). Don't bleed roles into each other.
- **Glass is breathable + cool + translucent**, not over-solidified, painted, warm, or aggressively glossy. (Note: dashboard glass is *cool*, not warm. Warm glass is landing-only via `--landing-warm`.)
- **`bd-*` utilities** — prefer over hand-rolled Tailwind. New variants land in `theme.css`, not in component files.
- **No automotive cues, no Direction C accents, no editorial flanking strokes** — those are landing's signature.
- **The discipline filter, run on every change:** "Does this make the user's workspace feel more focused, more trustworthy, and more premium — or is it decoration?" If it's decoration: skip.

---

## Status / First Action

- [x] Plan written 2026-05-02
- [x] Owner reviews this plan, answers open questions (all 6 locked 2026-05-02), greenlights Pass D1
- [x] **Pass D1 — Foundation shipped 2026-05-02** (commit pending; this commit). Three additions in [`src/styles/theme.css`](../src/styles/theme.css): `bd-glass-card--dashboard` variant (light + dark + hover), `bd-section-eyebrow` utility (light + dark), `bd-dashboard-atmosphere` overlay class (light + dark, no motion). One application: [`DashboardLayout.tsx`](../src/app/components/app/DashboardLayout.tsx) root gets the atmosphere overlay as a single absolute child behind content. Co-update: [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md) §7 now documents the three-tier card hierarchy + dashboard ambient layer + section eyebrow utility. **No page components touched (Tier 1+ is D2's job).**
- [x] **Pass D2 — Tier 1 Chrome Material Lift shipped 2026-05-02** (commit pending; this commit). Seven chrome surfaces lifted: [`DashboardHeader.tsx`](../src/app/components/app/DashboardHeader.tsx) (search input amber→cool-blue, premium dropdowns, focus rings), [`DashboardSidebar.tsx`](../src/app/components/app/DashboardSidebar.tsx) (warm-cream light surface→cool-blue calm-workspace, lit-glass active nav state), [`ProfileDropdown.tsx`](../src/app/components/dashboard/ProfileDropdown.tsx) (panel material aligned to dashboard glass tier, cool-blue dividers), [`NotificationCenter.tsx`](../src/app/components/dashboard/NotificationCenter.tsx) (warm-cream panel→cool-blue dashboard glass, amber empty-state→lit-glass cool-blue plate), [`ProfileRoleStats.tsx`](../src/app/components/dashboard/ProfileRoleStats.tsx) (cool-blue gradient + inset highlight), [`MarketStatusIndicator.tsx`](../src/app/components/dashboard/MarketStatusIndicator.tsx) (small material polish), [`MobileBottomNav.tsx`](../src/app/components/dashboard/MobileBottomNav.tsx) (active state matched to sidebar quality bar). One co-update in [`theme.css`](../src/styles/theme.css) `bd-shell-header--light` (warm-cream inset→cool-blue inset). **Dead code skipped:** `dashboard/DesktopNavTabs.tsx` and `dashboard/DashboardHeader.tsx` confirmed unused (only barrel exports + stale comment). **No page components touched (D3+).** Build clean (`npx vite build` 3.30s).
- [ ] **Pass D3 GATED on owner visual review of D2 on Vercel.** Customer HomeScreen + Report intake polish — including converting the orphaned amber/orange Report-intake pills ("Damage Report", "Damage zone", "Service radius", "Photo evidence") to cool-blue dashboard family per locked Q3.
- [ ] Pass D4 — Customer Bids + Account + modals
- [ ] Pass D5 — Shop Requests + Active Jobs + Onboarding
- [ ] Pass D6 — Shop Directory + immersive map (largest pass; may split D6a/D6b)
- [ ] Pass D7 — Insurer all screens
- [ ] Pass D8 — Admin all screens
- [ ] Pass D9 — Auth & onboarding chrome
- [ ] Pass D10 — Map widget consistency
- [ ] Pass D11 — Modal & overlay consistency sweep
- [ ] Pass D12 — Polish + edge cases + sign-off

When the dashboard premium lift is complete, mark this doc STATUS COMPLETE and archive any audit assets generated during the passes.

---

## Estimated Scope Summary

- **~139 component files across 6 tiers**
- **12 passes, owner-gated between each**
- **Realistic timeline:** several owner-review cycles. Like landing, individual passes can be 30 min – 2 hr each, but visual review between passes is the real time gate.
- **Reversibility:** every pass commits independently. Any single pass can be reverted without affecting others.

This plan respects the locked dashboard inheritance rule (no automotive register), inherits the landing's *quality* bar without imitating its *identity*, and scopes the work into safe incremental passes the owner can greenlight, review, and revert pass-by-pass.

**D2 shipped. Awaiting owner visual review on Vercel before D3 greenlight.**
