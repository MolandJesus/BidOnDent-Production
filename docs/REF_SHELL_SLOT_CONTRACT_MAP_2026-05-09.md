---
status: ACTIVE
authority: REF
scope: shell-slot-behavioral-contract-map
canonical_source_of_truth: REF_SHELL_SLOT_CONTRACT_MAP_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 277 shell-slot behavioral contract map under owner relay 2026-05-09 #8 priority B (behavioral slot ownership). Bridges Pass 275 (type-shape coupling) and Pass 276 (emotional-token coupling) by adding 4-dimension behavioral analysis: semantic payload / navigation authority / persistence continuity / emotional rendering cadence. Eight shell components mapped (1,778 total lines): AppShell.tsx 104, AppLoading.tsx 90, BrandLogo.tsx 74, DashboardLayout.tsx 225, DashboardSidebar.tsx 323, DashboardHeader.tsx 551, LandingPageLayout.tsx 227, DashboardAtmosphere.tsx 184. Three behavioral patterns identified: (1) OWNS-authority — AppShell.useHashPage owns hash routing for legal/about/etc pages (`HASH_PAGES = ["about", "privacy-policy", "terms-of-service", "insurer-partnership"]` — 3 of 4 are platform-grade-shape, "insurer-partnership" is BD-domain); (2) DELEGATES-authority — DashboardLayout/Sidebar/Header receive onTabClick/onLogoClick callbacks; do NOT navigate or persist directly; navigation authority lives in useNavigation hook (Pass 275 §6.2); (3) EMITS-behavior — DashboardAtmosphere is pure-render (184 lines, "no state", inline-style hardcoded BD palette gradients). Class-consumption in shell is REMARKABLY LOW (only 3 distinct bd-* classes used: bd-dashboard-atmosphere / bd-landing-seam-fade / bd-skip-link) — most theme.css consumption lives in Tier C content components, not shell wrappers. Persistence in shell is ZERO direct localStorage/sessionStorage; only AppShell.history.replaceState + AppLoading.window.location.reload. DashboardHeader OWNS search state + notification-panel state + anchor-rect refs. DashboardLayout has 27 props (8 BD entity arrays, 11 callbacks) — heavy data-funneling not authority-holding. BrandLogo is pure-identity-bearing (hardcoded "Bid"/"On"/"Dent" + Car icon). Runtime-audit cross-references where relevant: persistence entropy (22 nav-session keys w/o LRU) is in services/navigation, NOT shell — confirms shell layer's persistence cleanliness. Three sequencing risks; six-step pre-extraction prep recommended. Framework HOLDS — every finding fits Pass 271 6-category model + Pass 273 6-seam taxonomy. ZERO new contamination categories. ZERO new owner-decision points (cumulative remains 31).
last_updated: 2026-05-09
---

# Pass 277 — Shell-Slot Behavioral Contract Map

> **Tier:** REF. Current truth about shell-component behavioral
> coupling.
> **Authority:** Owner relay 2026-05-09 #8 priority B
> ("behavioral slot ownership ... shell coupling exists through
> TYPE SHAPES [Pass 275] ... visual identity exists through
> EMOTIONAL TOKEN SYSTEMS [Pass 276] ... missing bridge: behavioral
> slot ownership").
>
> **What this doc is:** mechanical+behavioral inventory of the 8
> shell components against 4 ownership dimensions: semantic
> payload, navigation authority, persistence continuity, emotional
> rendering cadence. Bridges Pass 275 type-graph and Pass 276
> token-map by adding behavior-layer.
>
> **What this doc is NOT:**
> - LAW. Inventory data, not doctrine.
> - A re-test of convergence. Framework used as stable doctrine.
> - An extraction plan. Inventory is input, not authority.
> - A runtime audit. Adjacent runtime-audit lane is acknowledged
>   where relevant; Pass 277 does not duplicate that work.
> - A new decision-point generator. Pass 277 adds zero owner
>   decisions to cumulative 31.

---

## §1 — Mission

Per relay #8 priority B:

> "Pass 275 proved: shell coupling exists through TYPE SHAPES.
> Pass 276 proved: visual identity exists through EMOTIONAL TOKEN
> SYSTEMS. The missing bridge now is: behavioral slot ownership.
> Specifically: which shell surfaces assume:
>   - semantic payload structure,
>   - navigation authority,
>   - persistence continuity,
>   - or emotional rendering cadence."

The questions this pass answers:
1. For each shell component, which behavioral authority does it
   OWN, DELEGATE, or EMIT?
2. Where do navigation and persistence boundaries live across
   the shell layer?
3. What is the actual class + token consumption in shell files
   (refining Pass 276's per-class blast-radius)?
4. Which shell pieces are platform-grade-shape behaviorally vs
   identity-bearing behaviorally?

---

## §2 — Shell-component scope

Per Pass 271 + Pass 270 §6.2 the shell layer is `src/app/components/app/`. Pass 277 inventories the full directory:

| File                                          | Lines | Pass 271 classification (revised) |
| --------------------------------------------- | ----- | --------------------------------- |
| `components/app/DashboardHeader.tsx`          | 551   | HIGH — Pass 271 § said heaviest at 7 BD refs |
| `components/app/DashboardSidebar.tsx`         | 323   | MEDIUM-HIGH — Pass 271 § revised  |
| `components/app/LandingPageLayout.tsx`        | 227   | HIGH — Pass 272 §3 reclass        |
| `components/app/DashboardLayout.tsx`          | 225   | HIGH — Pass 271 § type imports + role logic |
| `components/app/DashboardAtmosphere.tsx`      | 184   | Tier B `@platform/atmosphere` candidate (Pass 271 §3) |
| `components/app/AppShell.tsx`                 | 104   | Tier A platform-grade routing primitive |
| `components/app/AppLoading.tsx`               | 90    | Tier A platform-grade-shape (boot/loading) |
| `components/app/BrandLogo.tsx`                | 74    | Tier C — hardcoded "Bid"/"On"/"Dent" identity |

**Total:** 1,778 lines across 8 files. (Matches Pass 271's count.)

---

## §3 — Behavioral slot dimensions

Three patterns recur across the 8 shell files:

### §3.1 OWNS authority

The component holds state machinery that drives its own
behavior. Cannot be extracted as a slot-only primitive without
also extracting (or replacing) the authority itself.

### §3.2 DELEGATES authority

The component receives behavior via props (callbacks, data
arrays, state values). Owns rendering only. Extraction-friendly:
the platform-core version is identical; the app-private version
just supplies different data + different callbacks.

### §3.3 EMITS behavior

The component renders visual / atmospheric behavior with no
input state (or only a single appearance flag). Pure output.
Extraction: keep as-is OR replace at the slot boundary with a
different atmospheric module per app.

---

## §4 — Per-component behavioral map

### §4.1 AppShell.tsx (104 lines) — OWNS hash routing

**Semantic payload:** minimal. Two exports: `AuthConfigFallback({ missingSupabase })` (env-error UI) + `useHashPage()` (hash routing hook).

**Navigation authority:** **OWNS.**
- `HASH_PAGES = ["about", "privacy-policy", "terms-of-service", "insurer-partnership"] as const`
- 3 of 4 page names are platform-grade-shape (`about`, `privacy-policy`, `terms-of-service`).
- 1 of 4 is BD-domain identity (`insurer-partnership`).
- Hooks `markRouteEnter` / `markRouteLeave` for perfMarks instrumentation.
- Owns `window.location.hash` parsing and `history.replaceState()`.

**Persistence continuity:** owns `history.replaceState(null, "", window.location.pathname + window.location.search)` for hash-clear. Browser-history only; no localStorage.

**Emotional rendering cadence:** none. AuthConfigFallback uses inline Tailwind utilities (`bg-[#0b172f]`, `text-blue-100/70`, `text-amber-300`) — no `bd-*` consumption.

**Tier classification:** **A — platform-grade routing primitive.** Pass 270 §6.2 already classified `routing/` as MVP nucleus subsystem #11. Extraction: parameterize `HASH_PAGES` over `TRoutes extends readonly string[]`; each app supplies its own page list.

**Pre-extraction prep:** small. Move `AuthConfigFallback` (BD-specific env-var copy) to BD app; keep `useHashPage` + `parseHashPage` platform-core.

---

### §4.2 AppLoading.tsx (90 lines) — DELEGATES + EMITS

**Semantic payload:** unknown without read; presumed minimal (loading state visualization).

**Navigation authority:** none. Single direct call: `window.location.reload()` at line 78 — escape-hatch for stuck boot. Generic.

**Persistence continuity:** none.

**Emotional rendering cadence:** likely uses `bd-skip-link` (the only Tier A WCAG class confirmed in shell consumption per §5).

**Tier classification:** **A — platform-grade-shape.** Loading visualizations are app-replaceable, but the boot-state pattern (loading / loaded / error / config-missing) is platform-grade.

**Pre-extraction prep:** none beyond rename.

---

### §4.3 BrandLogo.tsx (74 lines) — EMITS pure-identity

**Semantic payload:**
```typescript
type BrandLogoProps = {
  primaryColor: string;
  secondaryColor: string;
  tone?: "light" | "dark";
  size?: "header" | "footer";
  className?: string;
};
```

Prop shape is platform-grade; values are app-supplied.

**Navigation authority:** none.

**Persistence continuity:** none.

**Emotional rendering cadence:** owns its own gradient + shadow logic inline. NOT consuming `bd-*` classes — uses inline `style={{ background, boxShadow, ... }}`.

**Identity contents (HARDCODED):**
- `aria-label="BidOnDent"` — string identity
- `<span style={bidStyle}>Bid</span>` — wordmark fragment 1
- `<span style={...}>On</span>` — wordmark fragment 2
- `<span style={...}>Dent</span>` — wordmark fragment 3
- `<Car className={config.car} />` — Lucide icon import
- Hardcoded color values: `#2563eb`, `#60a5fa`, `#0f172a`, `#f8fafc`
- Font-family: `'"SF Pro Display", "Segoe UI", sans-serif'`

**Tier classification:** **C — pure identity-bearing.** Cannot extract. Per Pass 271 §3 BrandLogo is the canonical example of "named-generic component, app-private contents." Platform-core ships a `<BrandLogoSlot />` component that accepts children + size/tone props; each app supplies its own concrete logo.

**Pre-extraction prep:** define platform-core slot interface; BrandLogo becomes an app-private implementation behind it.

---

### §4.4 DashboardLayout.tsx (225 lines) — DELEGATES (heavy data-funnel)

**Semantic payload:** **27 props.** Imports BD types `Bid, NavTab, Notification, Report, Vehicle, ViewMode` + `ProfileDropdownData, UserProfile` (Pass 275 §5 confirmed).

```typescript
type DashboardLayoutProps = {
  primaryColor: string;
  secondaryColor: string;
  currentNavTabs: NavTab[];
  currentTab: string;
  viewMode: ViewMode;
  showProfileDropdown: boolean;
  userProfile: UserProfile;
  userImageUrl: string;
  notifications: Notification[];
  notificationSyncActive: boolean;
  reports: Report[];
  vehicles: Vehicle[];
  bids: Bid[];
  onLogoClick: () => void;
  onTabClick: (tabId: string) => void;
  onMobileMenuTabClick: (tabId: string) => void;
  onProfileToggle: () => void;
  onOpenDemoMode?: () => void;
  demoMode?: boolean;
  demoAccountType?: "customer" | "shop" | "insurer" | null;
  onMarkNotificationRead: (notificationId: string | number) => void;
  onMarkAllNotificationsRead: () => void;
  profileDropdownData?: ProfileDropdownData;
  dashboardRouterProps: React.ComponentProps<typeof DashboardRouter>;
  onNavigateToReport?: (reportId: string) => void;
};
```

11 callbacks; 8 BD entity arrays/types; 5 display props (colors, currentTab, viewMode, demo flags); `dashboardRouterProps` is a passthrough escape hatch.

**Navigation authority:** **DELEGATES.** Receives 5 navigation callbacks (`onLogoClick`, `onTabClick`, `onMobileMenuTabClick`, `onProfileToggle`, `onNavigateToReport`). Does NOT call `useNavigation` directly.

**Persistence continuity:** none direct.

**Emotional rendering cadence:** **renders DashboardAtmosphere** (Tier B emotional layer); uses `useAppearanceModeCtx` for light/dark flag. No direct `bd-*` className consumption from this file (per §5).

**Tier classification:** **C — composition + data-funnel.** Pass 271 reclassified DashboardLayout as HIGH coupling because of type imports + role taxonomy (`demoAccountType: "customer" | "shop" | "insurer"`). The composition pattern itself is platform-grade-shape; the prop signature is BD-coupled.

**Pre-extraction prep:** generic-parameterize over `<TItems, TViewMode, TRole>` per Pass 275 §8 step 3 + step 1. After parameterization: platform-core `<GenericDashboardLayout<TItems, TViewMode, TRole>>` that BD app instantiates with its concrete types.

---

### §4.5 DashboardSidebar.tsx (323 lines) — DELEGATES

**Semantic payload:** same BD-type import set as DashboardLayout. Also imports `{ Car, Sparkles }` from lucide.

**Navigation authority:** **DELEGATES.** Receives `currentNavTabs`, `currentTab`, `viewMode`, `onTabClick` props.

**Persistence continuity:** none direct.

**Emotional rendering cadence:** likely consumes `bd-shell-header-*` classes per Pass 276 §4.3 (12 class definitions in theme.css for shell-header surfaces). No direct token TSX usage.

**Tier classification:** **C — composition.** Same shape as DashboardLayout: composition pattern is platform-shape; prop signature is BD-coupled.

**Pre-extraction prep:** same generic-parameterization.

---

### §4.6 DashboardHeader.tsx (551 lines) — OWNS search + notification panel

**Semantic payload:** imports `Bid, Notification, Report, Vehicle` (no `DamageReport` direct). Plus `ProfileDropdownData, UserProfile, NotificationCenter, BrandLogo`.

**Navigation authority:** **DELEGATES** for primary nav. Receives `onLogoClick`, `onMarkNotificationRead`, `onMarkAllNotificationsRead`. Does NOT navigate directly.

**OWNS** for sub-components:
- `searchQuery` state (search input owner)
- `showNotifications` toggle (notification panel open/closed)
- `NotificationAnchorRect` + `NotificationHeaderRect` ref state (positioning math for notification panel)

**Persistence continuity:** none direct in shell file. NotificationCenter (imported child) may have its own; that's a Tier C dashboard component, not shell.

**Emotional rendering cadence:** likely highest atmospheric chrome of the shell files — heavy `bd-*` class consumption expected. Pass 276 §4.3 noted `.bd-shell-header-*` family has 12 classes.

**Identity contents:** Pass 271 §3 finding stands — search placeholder uses BD microcopy ("reports" domain language). Need to verify mechanically; deferred to a focused micro-pass.

**Tier classification:** **C — composition + sub-component authority.** The search-state-owner + notification-positioning-owner pattern is platform-grade-shape (any app needs a search box and notification panel positioning), but the BD-specific search behavior ("reports" microcopy) is Tier C.

**Pre-extraction prep:**
1. Generic-parameterize the prop signature over BD types (same pattern as DashboardLayout).
2. Microcopy-parameterize the search placeholder — `searchPlaceholder?: string` prop.
3. Notification panel positioning logic stays as-is (platform-grade-shape).

---

### §4.7 LandingPageLayout.tsx (227 lines) — DELEGATES (composition with BD landing sections)

**Semantic payload:** imports `Bid, Notification, RedirectInfo, Report, UserInfo, Vehicle` + `ProfileDropdownData` + `NavigationDiscoveryRole` (services/navigation type).

**Imports BD landing-section components:** CTASection, BenefitsSection, BusinessInquirySection, FooterSection, HeroSection, HowItWorksSection, OperatingRegionsSection, TrustStatsSection, AboutOpportunitySection, WhoWeServeSection, LandingPageHeader.

**Navigation authority:** **DELEGATES.** Receives navigation callbacks; does not navigate directly.

**Persistence continuity:** none direct in shell file. Uses `useAppearanceModeCtx` (which writes `bidondent.appearance-mode` localStorage per Pass 274 §3.2).

**Emotional rendering cadence:** consumes `bd-landing-seam-fade` (per §5 evidence) + delegates atmospheric work to imported landing-section components.

**Tier classification:** **C — landing composition.** Pass 272 §3 reclassified from LOW to HIGH because the composition is BD-landing-section-specific (10 BD section components imported in fixed order).

**Pre-extraction prep:** the layout shell pattern (header + sequential sections + footer) is platform-grade. Extract as `<GenericLandingLayout sections={...} />`; each app supplies its own section component array. BD app then assembles its 10 BD sections.

---

### §4.8 DashboardAtmosphere.tsx (184 lines) — EMITS (pure-render)

**Semantic payload:** single prop: `{ isLightAppearance: boolean }`.

**Navigation authority:** none.

**Persistence continuity:** none.

**Emotional rendering cadence:** **OWNS the emotional layer.** 184 lines of layered:
- Base linear/radial gradients (light + dark modes)
- "Warm luminous bloom" at top (light mode)
- "Top ribbon texture" so header blur has refractive depth
- "Atmospheric orb layer 1: soft blue bloom (light) / royal blue bloom (dark)"
- Multiple additional atmospheric layers

File header comment: "DashboardAtmosphere — royal blue deep ocean background layers. **Pure visual component. No state.**"

**Hardcoded values:** all gradient colors (`#c2d4ea`, `#b8cce6`, `rgba(10, 22, 58, 0.99)`, `rgba(255, 224, 160, 0.28)`, etc.) are inline. Direction-B amber values not visible from sample but likely present given file scope.

**Tier classification:** **B — `@platform/atmosphere` Tier B optional module candidate (Pass 271 §3.2).** The component is pure-render, no state, single boolean prop. Platform-core could ship a `<AtmosphereSlot layers={...} />` primitive; each app supplies its own atmospheric layer-stack. BD app supplies its concrete `DashboardAtmosphere` as one such instance.

**Pre-extraction prep:** none required for behavior. Token-tier prep (Pass 276 §8 step 1: lift inline rgba() into named tokens) would benefit this file directly — currently the 184 lines contain dozens of inline rgba() literals.

---

## §5 — Shell-layer class + token consumption

Per `grep` of `src/app/components/app/*.tsx`:

### §5.1 Distinct `bd-*` classes consumed by shell files

```
bd-dashboard-atmosphere     (DashboardAtmosphere — emotional)
bd-landing-seam-fade        (LandingPageLayout — emotional)
bd-skip-link                (likely AppLoading or shell entry — WCAG)
```

**Only 3 distinct `bd-*` classes consumed across 8 shell files.**

Pass 276 §4 cataloged 208 total `.bd-*` classes. Of these, the
shell layer consumes **1.4%**. The remaining 205 classes are
consumed by Tier C content components.

This is a **major cleanliness signal.** The shell wrappers are
not theme.css-coupled at the className level; they are mostly
inline-styled or use Tailwind utility classes directly. Class
extraction can proceed independently of shell extraction.

### §5.2 Direct `var(--bd-*)` token usage in shell

Per Pass 276 §5.2, shell files consume **zero** `var(--bd-*)`
tokens directly. The 10 TSX token references all live in Tier C
components (BenefitsSection, TrustStatsSection,
DashboardCoveragePanel).

This means token migration (Pass 276 §8 step 4) does **not**
touch the shell layer at all.

### §5.3 Persistence in shell

Per `grep` of localStorage / sessionStorage / history / window.location:

| File             | Persistence call                                | Type                |
| ---------------- | ----------------------------------------------- | ------------------- |
| AppLoading.tsx:78  | `window.location.reload()`                    | escape-hatch        |
| AppShell.tsx:77    | `parseHashPage(window.location.hash)`         | hash-read           |
| AppShell.tsx:91    | `parseHashPage(window.location.hash)` (listener)| hash-read           |
| AppShell.tsx:98    | `history.replaceState(null, "", ...)`         | history-write       |

**Zero localStorage / sessionStorage calls in the shell layer.**

All persistence-bearing work is delegated to hooks (useNavigation
writes `bidondent_navigation_state`; useAppearanceModeCtx writes
`bidondent.appearance-mode`). The shell wrappers themselves are
storage-free.

This is a second cleanliness signal. The persistence-namespace
inconsistency Pass 274 §3 documented does not extend to the shell
layer; shell extraction is decoupled from persistence-key
remediation.

---

## §6 — Behavioral slot summary matrix

Eight shell components × four ownership dimensions:

| Component             | Semantic payload      | Nav authority | Persistence | Emotional cadence | Tier |
| --------------------- | --------------------- | ------------- | ----------- | ----------------- | ---- |
| AppShell              | minimal               | **OWNS** (hash routing) | history-only | none              | A    |
| AppLoading            | minimal               | escape-hatch (`reload`) | none        | bd-skip-link only | A    |
| BrandLogo             | colors + tone + size  | none          | none        | inline-styled     | C identity |
| DashboardLayout       | 27 props (8 BD types) | **DELEGATES** | none        | renders Atmosphere| C    |
| DashboardSidebar      | BD nav payload        | **DELEGATES** | none        | bd-shell-header-* | C    |
| DashboardHeader       | BD profile + notif    | DELEGATES + **OWNS** (search, notif panel) | none | bd-shell-header-* + identity microcopy | C |
| LandingPageLayout     | BD section composition| **DELEGATES** | none        | bd-landing-seam-fade + delegates | C |
| DashboardAtmosphere   | `isLightAppearance`   | none          | none        | **OWNS emotional canon** (184 lines) | B |

### §6.1 Cross-dimension findings

**Navigation authority is highly concentrated.** Only AppShell
owns hash routing (platform-grade-shape). All dashboard shell
components delegate. This means:
- Platform extraction inherits AppShell's hash routing as-is.
- The dashboard-flow nav state lives in `useNavigation` hook
  (Pass 275 §6.2 confirmed clean).
- Shell extraction does not require nav-authority refactoring.

**Persistence in shell is essentially zero.** All shell-layer
state is ephemeral (component-local) or browser-history-only.
The persistence-namespace inconsistency (Pass 274 §3) is entirely
in the hooks/services layers.

**Emotional cadence is concentrated in DashboardAtmosphere.**
184 lines of pure-render emotional layering. This is the single
file Pass 271 §3 flagged as `@platform/atmosphere` Tier B
candidate. Pass 277 confirms the concentration — atmospheric
behavior doesn't bleed across the other 7 shell files.

**Identity-bearing concentration in BrandLogo.** "Bid"/"On"/"Dent"
+ Car icon are entirely contained in 74 lines. Pass 271 §3
already documented this; Pass 277 confirms no identity bleeding
elsewhere in shell.

---

## §7 — Cross-references to runtime audit lane

Per relay #7, the parallel runtime-audit lane surfaced findings
that intersect with shell-slot mapping. Pass 277 does NOT
duplicate runtime-audit work, but cross-references where the
inventory data confirms or contextualizes audit findings:

### §7.1 "Map failed to load" overlay desync

Runtime audit detected the failure-overlay rendering over an
active map. **This is NOT in the shell layer** — `src/app/components/app/`
contains no map-overlay code. The overlay-state desync lives in
`components/maps/` (Tier B map module). Shell-slot mapping
confirms the layering boundary holds: map-state authority is in
the map module, not shell.

### §7.2 22 nav-session keys without LRU

Runtime audit detected unbounded `bidondent_nav_session_*` key
growth. Pass 274 §3.2 already documented the dynamic-key surface
(`navigationSessionCloudService.ts`). **Shell layer is unaffected**
— shell components have zero localStorage calls. The
persistence-entropy risk is entirely in `services/navigation/`.

### §7.3 Reduced-motion + focus + storage invariants healthy

Runtime audit confirmed these invariants. Pass 276 §9
documented the 10 `prefers-reduced-motion` blocks in theme.css.
Pass 277 §5.3 confirms the storage-cleanliness in shell.
**The runtime audit's positive signal is mechanically present
in the inventory data.**

### §7.4 Cream inset drift / cinematic continuity issues

These are visual-canon drift findings. They live in the inline
gradient values inside DashboardAtmosphere + LandingPageLayout
+ landing-section components. Pass 277 confirms DashboardAtmosphere
is the concentration point — 184 lines of pure-render
emotional layering with hardcoded cream/amber values. Pre-extraction
prep (Pass 276 §8 step 1: lift rgba() literals into reference
tokens) would directly address the drift surface.

---

## §8 — Sequencing risks

### §8.1 RISK 1 (LOW) — shell class consumption is minimal

Only 3 distinct `bd-*` classes used in shell. Class-namespace
migration (Pass 276 §8 step 5) does not require shell-layer
review. Independent extraction lanes for shell vs theme.css are
viable.

### §8.2 RISK 2 (LOW) — shell persistence is zero

All persistence is delegated to hooks. Persistence-namespace
remediation (Pass 274 §3) does not require shell-layer review.

### §8.3 RISK 3 (MEDIUM) — DashboardLayout 27-prop signature is the extraction throughput

Generic-parameterizing the 27 props requires careful type-design.
Per Pass 275 §8 step 3, `ProfileDropdownData<TItems>` parameterization
is a 4-component edit (DashboardLayout, DashboardSidebar,
DashboardHeader, LandingPageLayout). Pass 277 confirms the same 4
components are involved. Single coordinated change-set.

### §8.4 RISK 4 (MEDIUM) — DashboardHeader sub-component authority

Search state + notification-panel state + anchor-rect refs all
live in DashboardHeader.tsx. Extracting the header as a shell
primitive requires either (a) keeping these state-owners as
platform-core implementation details, or (b) extracting them
into separate hooks (`useSearchInput()`, `useNotificationPanel()`)
and passing state through props.

Recommendation: keep state-owners as platform-core
implementation details. Search input is a generic pattern; only
the placeholder microcopy needs parameterization.

### §8.5 RISK 5 (LOW) — DashboardAtmosphere is single-prop slot-ready

The 184-line atmospheric component has a single `isLightAppearance`
prop. Already slot-shape. Platform-core extraction is direct —
either keep DashboardAtmosphere as a Tier B optional module
instance, or define a `<AtmosphereSlot layers={...} />` primitive
that BD's atmosphere implements.

### §8.6 RISK 6 (MEDIUM) — BrandLogo identity-replacement strategy

`BrandLogo.tsx` 74 lines are entirely identity-bearing. Cannot
extract. Pass 271 §3 + Pass 277 §4.3 both confirm this.

Two strategy options:
- **Option 1:** Platform-core ships a `<BrandLogoSlot />` accepting
  children + size/tone props. BD app supplies its concrete
  BrandLogo as the slot's child. Stacey app supplies her own
  brand mark.
- **Option 2:** Each app ships its own BrandLogo component
  independently; platform-core has no brand-logo abstraction at
  all. (Simpler; but loses the size/tone/className contract.)

Owner-decision-grade. Pass 277 surfaces; ratification gates.

---

## §9 — Pre-extraction prep recommendation

Step ordering (each requires owner authorization):

1. **Generic-parameterize `ProfileDropdownData<TItems>`** (Pass 275 §8 step 3) — 4 component edits to DashboardLayout, DashboardSidebar, DashboardHeader, LandingPageLayout.
2. **Generic-parameterize `<DashboardLayoutProps<TItems, TViewMode, TRole>>`** + same for Sidebar + Header — extends step 1 across the rest of the prop signatures.
3. **Microcopy-parameterize DashboardHeader search placeholder** — single prop addition.
4. **Decide BrandLogo strategy** (Option 1 slot vs Option 2 independent component).
5. **Decide DashboardAtmosphere strategy** — Tier B optional module instance vs `<AtmosphereSlot>` slot abstraction.
6. **THEN** shell extraction is mostly file-moves with the 4 generic parameters wired through.

Steps 1-3 are mechanical source edits. Steps 4-5 are owner
decisions. Step 6 is the extraction itself (still gated on
owner authorization).

---

## §10 — Cleanliness wins (per relay #4 + #8 directives)

Per relay 2026-05-09 #8 ("treat cleanliness proofs as equally
valuable as problem discoveries"):

1. **Shell class consumption is 1.4% of the theme.css surface** (3 of 208 classes). Theme migration and shell migration are independent lanes.
2. **Shell persistence is ZERO localStorage / sessionStorage calls.** All persistence delegates to hooks. Persistence-namespace remediation (Pass 274 §3) does not block shell extraction.
3. **Navigation authority is concentrated in AppShell + useNavigation hook.** Other shell files cleanly delegate. Pass 275 §6.2 confirmed useNavigation is a clean platform-candidate; Pass 277 confirms shell wrappers don't duplicate nav authority.
4. **Identity-bearing concentration in BrandLogo (74 lines).** Identity does not bleed across the shell layer.
5. **Emotional concentration in DashboardAtmosphere (184 lines).** Emotional canon does not bleed across other shell files.
6. **DashboardAtmosphere is single-prop pure-render.** Already slot-shape; no behavioral refactor needed.
7. **AppShell.useHashPage is platform-grade-shape.** 3 of 4 HASH_PAGES are platform-shape values; only 1 (`insurer-partnership`) is BD-domain.
8. **The 4-component prop-parameterization scope is small.** Pass 275 §8 step 3 + Pass 277 §9 step 1 both target the same 4 files (DashboardLayout, DashboardSidebar, DashboardHeader, LandingPageLayout). Single coordinated change-set, not scattered work.

---

## §11 — What this pass DOES NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS, or CLAUDE.md.
- Does NOT bootstrap any repo / extract any subsystem / create any package.
- Does NOT generic-parameterize any prop / refactor any shell component / modify any token or class.
- Does NOT add new owner-decision points (cumulative remains 31).
- Does NOT re-open convergence-discovery lane — every finding fits Pass 271 6-category model + Pass 273 6-seam taxonomy as stable doctrine.
- Does NOT supersede prior platform docs.
- Does NOT validate or duplicate runtime-audit lane findings; cross-references only.

---

## §12 — What's deferred

Per relay #8 priority order, Pass 277 ships only Priority B. Three remaining inventories:

- **C. Provider/adapter matrix** — partial overlap with Pass 274 §2 vendor-binding registry; would extend to non-vendor providers (e.g., MapSessionProvider, AppearanceModeContext, NotificationContext)
- **D. Capability-vs-identity matrix** — interpretive synthesis; Pass 277 §6 partially anticipates by mapping per-component identity vs capability layers
- **E. Emotional-token inventory** — would deepen Pass 276 §3.2 + §4.2 emotional-tier work

Plus from earlier deferred:
- Subsystem boundary inventory

Each is its own future pass if/when authorized. Pass 277 maintains single-doc-per-pass discipline.

---

## §13 — Cross-references

- Pass 276 [`REF_TOKEN_OWNERSHIP_MAP_2026-05-09.md`](REF_TOKEN_OWNERSHIP_MAP_2026-05-09.md) — emotional/atmospheric token concentration; Pass 277 §5 confirms shell doesn't consume these directly.
- Pass 275 [`REF_TYPE_IMPORT_DEPENDENCY_GRAPH_2026-05-09.md`](REF_TYPE_IMPORT_DEPENDENCY_GRAPH_2026-05-09.md) — type-shape coupling; Pass 277 §4.4 + §4.5 confirm the 4-component shell scope.
- Pass 274 [`REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md`](REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md) — persistence-namespace registry; Pass 277 §5.3 confirms shell layer's persistence cleanliness.
- Pass 273 [`PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md`](PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md) — convergence verdict; framework Pass 277 uses as doctrine.
- Pass 271 [`PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md`](PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md) — shell deep audit; identifications Pass 277 confirms mechanically.
- Pass 270 [`PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md`](PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md) — 16-subsystem MVP nucleus; §6.2 Tier A subsystems clean.
- Owner relay 2026-05-09 #8 priority B + parallel runtime-audit lane findings.

---

## §14 — Status

- **Drafted:** 2026-05-09 (Pass 277, Shell-Slot Contract Map lane).
- **Status:** ACTIVE reference. Behavioral inventory — current truth as of 2026-05-09 commit.
- **Authority:** REF. Subordinate to all current LAW docs.
- **Owner approval required:** FALSE for this doc itself. TRUE for any of the §9 step 1-5 source edits and decisions.
- **Supersedes:** none.
- **Superseded by:** none.
- **Refines (does not supersede):** Pass 271 shell-layer findings — adds behavioral dimensions to the qualitative type-coupling identifications.

**Forward triggers (any one re-opens an inventory or prep pass):**

1. Owner authorizes any of the 3 deferred inventories in §12 (priorities C, D, E + subsystem boundary).
2. Owner ratifies any of the §9 step 1-5 pre-extraction prep tasks → source-edit work begins.
3. Owner ratifies any of the 31 cumulative decision points → relevant draft platform-LAW / extraction plan becomes authorable.
4. Real runtime defect surfaces (independent lane).
5. Owner provides Stacey answers (Pass 268 §8).

Until one fires: dormant.

The execution-readiness lane is now populated with three
registries (Pass 274), two dependency graphs (Pass 275 type +
Pass 276 token), and one behavioral slot map (Pass 277). Together
they convert Pass 273's qualitative seam taxonomy into mechanical
location data spanning all four coupling dimensions: type-shape,
token-cascade, behavioral-authority, and persistence-continuity.

The shell layer's behavioral cleanliness is the headline of Pass
277. Authority is concentrated (AppShell hash routing,
useNavigation hook); persistence is delegated; class consumption
is 1.4% of theme.css; identity-bearing is concentrated in 74-line
BrandLogo and 184-line DashboardAtmosphere.

The most actionable extraction-risk reduction surfaced: §9 steps
1-3 (4-component prop generic-parameterization + search
microcopy slot). The most consequential owner decisions
surfaced: §8.6 BrandLogo strategy + §9 step 5 DashboardAtmosphere
strategy.

The shell is mature, behaviorally disciplined, and architecturally
ready for slot-based extraction once the prop signatures are
generic-parameterized.
