---
status: ACTIVE
authority: REF
scope: provider-order-preservation-invariants
canonical_source_of_truth: REF_PROVIDER_ORDER_DOCTRINE_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: high
ai_summary: Pass 281 provider-order doctrine formalization under owner relay 2026-05-09 #12 priority F. FIRST execution-phase pass (lowest-blast-radius doc-only invariant formalization) after the inventory lane (Passes 274-280) completed. Codifies the App.tsx 4-layer provider mount hierarchy (ClerkProvider → MapSessionProvider → AppearanceModeProvider → NotificationProvider) as preservation invariants future implementation work must respect. Each provider's mount-position rationale is documented: ClerkProvider outermost (auth root; vendor-bound), MapSessionProvider second (post-Clerk per Pass 259 §5 location-d + first-line resize-patch side-effect import per Pass 260 §6 #1), AppearanceModeProvider third (computes via useAppearanceMode hook reading bidondent.appearance-mode localStorage; hydration affects atmospheric rendering), NotificationProvider innermost (value computed via useNotificationEvents() inside AppWithToast subcomponent; auth-scoped lifecycle). Five preservation-critical dependency chains documented (Pass 280 §11): token→class→keyframe→component / reduced-motion guards→keyframes (LAW-protected) / dark-mode contrast→.dark ancestor (LAW-protected per CLAUDE.md §7) / provider-order→appearance-mode hydration→atmospheric rendering / cascade-order :root blocks→token-override semantics. Five lifecycle invariant categories: hydration timing / auth-boundary sequencing / atmosphere mount timing / persistence restoration ordering / notification teardown sequencing. Eight anti-patterns explicitly forbidden during future implementation work: provider reorder without re-test / collapsing AppWithToast subcomponent boundary / removing first-import-line resize-patch from MapSessionProvider / moving AppearanceModeProvider above MapSessionProvider / mounting NotificationProvider before useNotificationEvents() / removing the EmbeddedBrowserBanner Pass 170 dev-only mitigation between Clerk and MapSession / batching auth + appearance + notification under a single Provider wrapper / tier-mixing mount-order with Tier B map-engine-lift work. Demo-mode dual-provider pattern documented (DevDemoCustomerApp + DevDemoShopApp duplicate AppearanceModeProvider + NotificationProvider but NOT ClerkProvider or MapSessionProvider — demo apps run inside the parent provider tree). REF-tier (NOT new LAW per relay #5 strict-construction). Pre-extraction prep doc — establishes invariants subsequent implementation passes (cadence tokenization / blur tokenization / Clerk wrapper / etc.) must respect. NO source / LAW / MOLANDJESUS touched. ZERO new owner-decision points (cumulative remains 31).
last_updated: 2026-05-09
---

# Pass 281 — Provider-Order Doctrine

> **Tier:** REF. Current truth + preservation invariants for the
> App.tsx provider mount hierarchy.
> **Authority:** Owner relay 2026-05-09 #12 priority F (provider-order
> doctrine formalization).
>
> **What this doc is:** preservation invariants that future
> implementation work must respect. Codifies the rationale for
> the canonical 4-layer mount hierarchy and surfaces the
> dependency chains that extraction work cannot break.
>
> **What this doc is NOT:**
> - LAW. The relay authorized "doc + invariant references," not
>   new LAW. Per strict-construction this is REF-tier formalization
>   under existing LAW.
> - A re-test of convergence. Framework used as stable doctrine.
> - An extraction plan. Inventory + invariants are inputs, not
>   authority for implementation.
> - A modification of `LAW_ANIMATION_AND_ATMOSPHERE.md` or any
>   other LAW. Pass 281 cross-references existing canon.
> - A new decision-point generator. Pass 281 adds zero owner
>   decisions to cumulative 31.

---

## §1 — Mission

Per relay #12 priority F:

> "Provider-order doctrine formalization (doc + invariant
> references). Especially important: future implementation passes
> must continuously validate against ... provider-order doctrine."

The questions this pass answers:

1. What is the canonical App.tsx provider mount hierarchy?
2. Why is each provider in its current position?
3. What runtime invariants does the current order encode?
4. What dependency chains break if the order changes?
5. What anti-patterns must future implementation work avoid?

---

## §2 — Authority hierarchy

This doc is REF-tier. It SUBORDINATES to:

- `docs/LAW_PROJECT_RULES.md` — primary LAW
- `docs/LAW_LAYERED_ARCHITECTURE.md` — layer model
- `docs/LAW_ANIMATION_AND_ATMOSPHERE.md` — emotional + reduced-motion canon (273 lines)
- `docs/LAW_HARDENING_PLAN.md` — execution authority

It REFINES (does not supersede):

- Pass 278 §7 [`REF_PROVIDER_ADAPTER_MATRIX_2026-05-09.md`](REF_PROVIDER_ADAPTER_MATRIX_2026-05-09.md) — initial provider hierarchy mapping
- Pass 280 §11 [`REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md`](REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md) — five preservation-critical dependency chains
- Pass 266 — MapSessionProvider inert-seam exemplar

It is INPUT FOR (and must be respected by):

- Future Pass 281+N implementation work (cadence tokenization,
  blur tokenization, Clerk wrapper inflation, notification
  parameterization, regression harness, etc.)
- Future extraction work (Pass 279 §9.1 phases)
- Any "cleanup refactor" touching `src/app/App.tsx` providers
  layer

---

## §3 — Canonical 4-layer mount hierarchy

`src/app/App.tsx` (verified 2026-05-09):

```jsx
return (
  <ClerkProvider                                            // line 478
    publishableKey={clerkPublishableKey}
    appearance={clerkAppearance}
    afterSignOutUrl="/"
  >
    <EmbeddedBrowserBanner />                               // line ~487 (Pass 170 dev-only)
    <MapSessionProvider>                                    // line 489
      <AppWithToast>
        <AppearanceModeProvider>                            // line ~527
          <NotificationProvider value={notificationActions}>// line ~528
            <AppContent />
            <NotificationToast />
          </NotificationProvider>
        </AppearanceModeProvider>
      </AppWithToast>
    </MapSessionProvider>
  </ClerkProvider>
);
```

`AppWithToast` is a subcomponent (not a provider) that:
1. Computes `notificationActions = useNotificationEvents()` — a
   hook depending on the React render tree (must run inside
   MapSessionProvider per current architecture).
2. Renders `<AppearanceModeProvider>` and
   `<NotificationProvider value={notificationActions}>`.
3. Hosts the offline/online status `useEffect` that fires toasts
   via `notificationActions`.

The `AppWithToast` boundary is intentional and load-bearing — it
ensures `notificationActions` are computed in the right scope
before being passed as the NotificationProvider value.

### §3.1 The 4 + 1 layers

| Position | Component                  | Type                            |
| -------- | -------------------------- | ------------------------------- |
| 1        | `ClerkProvider`            | Vendor-bound auth root          |
| —        | `EmbeddedBrowserBanner`    | Pass 170 dev-only mitigation (NOT a provider) |
| 2        | `MapSessionProvider`       | Map-session seam (Pass 266 inert) |
| —        | `AppWithToast`             | Subcomponent (NOT a provider; lifts notificationActions) |
| 3        | `AppearanceModeProvider`   | Appearance state distribution   |
| 4        | `NotificationProvider`     | Notification action distribution |

The 4 providers are stable boundaries. The 2 non-provider layers
(EmbeddedBrowserBanner, AppWithToast) are intentional architectural
choices that the order doctrine must preserve.

---

## §4 — Per-provider lifecycle invariants

### §4.1 ClerkProvider — auth root (OUTERMOST)

**Position:** outermost.

**Rationale:** auth must be available before any other provider
initializes. The Clerk SDK wires its own React Context internally;
all `useUser()`, `useClerk()`, `useAuth()` calls require this
ancestor.

**Lifecycle invariants:**
- Clerk session must be initialized before any auth-scoped data
  hydration (notification stream, persistence keys scoped to
  `clerk_user_id`, edge function calls with Clerk JWT).
- Sign-out triggers `afterSignOutUrl="/"`. Children unmount in
  React's natural inside-out order.

**Why outermost:**
1. Vendor-bound — moving Clerk inward would break direct
   `@clerk/clerk-react` imports inside child components.
2. The 5 direct `useUser()` callsites (Pass 278 §5) and
   `<SignInButton>` / `<SignUpButton>` components in
   `LandingPageHeader.tsx` + `CTASection.tsx` all depend on
   ClerkProvider being an ancestor.
3. Pass 278 §10 step 3-5 will redirect direct callsites through
   a thin wrapper, but the wrapper itself still requires
   ClerkProvider as an ancestor.

**Cannot move:**
- Outward (already outermost).
- Inward (would break the dependency chain).

### §4.2 MapSessionProvider — post-Clerk seam (SECOND)

**Position:** second, immediately inside ClerkProvider.

**Rationale (Pass 266 + Pass 260 §4 + Pass 259 §5):**
1. **Post-Clerk position** is per Pass 259 §5 recommended location
   (d) — provider boundary at the post-Clerk app shell location
   so future Phase 5 auth-flip cleanup (engine disposal on
   sign-out) can listen to Clerk session signal cleanly.
2. **First-line side-effect import** per Pass 260 §6 #1:
   `MapSessionProvider.tsx:51` imports
   `../../utils/maplibreResizePatch` BEFORE any other provider
   logic. The patch must be applied before any future engine
   mount.
3. **Phase 1 inert** — currently 0 consumers (Pass 278 §4.1
   confirmed). Provides `MAP_SESSION_DEFAULT_VALUE` no-op so
   future Phase 2 engine-lift swap is transparent to consumers.

**Lifecycle invariants:**
- The resize-patch import MUST land before any engine mount.
  This is preserved by:
  - First-import-line convention in MapSessionProvider.tsx
  - Module-load caching (if any engine has already imported the
    patch elsewhere, the re-import is a no-op).
- Phase 2 engine-lift (when authorized) wires consumers; the
  provider boundary stays at the same position.

**Cannot move:**
- Outside ClerkProvider — would break Phase 5 auth-flip cleanup.
- Below AppearanceModeProvider — would mean an engine mount
  could occur during appearance hydration without the resize
  patch in place (Phase 2+ risk).
- Below NotificationProvider — would create teardown ordering
  fragility (engine could outlive notification stream cleanup).

**Cannot remove:**
- Removing `MapSessionProvider` would also remove the resize-patch
  side-effect-import path. Per Pass 266 file-header rollback
  note, removal is "TRIVIAL" but requires deleting the wrapper
  line in App.tsx + the file + its test — explicit operation,
  not implicit.

### §4.3 AppearanceModeProvider — appearance hydration (THIRD)

**Position:** third, inside MapSessionProvider, inside
AppWithToast subcomponent.

**Rationale:**
- Receives value from `useAppearanceMode()` hook which reads
  `bidondent.appearance-mode` localStorage (Pass 274 §3.2).
- Must mount AFTER auth/session establishes scope (Clerk).
- Must mount BEFORE any consumer (DashboardLayout, LandingPageLayout,
  DashboardAtmosphere) reads `useAppearanceModeCtx()`.

**Lifecycle invariants:**
- **Hydration timing:** the appearance-mode value derives from
  localStorage on first render. Pass 280 §11.3 finding: provider
  order affects emotional rendering hydration. Mounting
  AppearanceModeProvider late causes atmospheric layers to
  paint with default appearance briefly before resolving.
- **Storage key:** the underlying `useAppearanceMode` hook reads
  `bidondent.appearance-mode`. Pre-extraction prep (Pass 274 §3.4
  + Pass 276 §8 step 1) namespace parameterization must NOT
  invalidate user state on first load post-deploy without a
  migration script.

**Cannot move:**
- Above MapSessionProvider — appearance-mode read would happen
  before resize-patch side-effect; not strictly broken today
  but couples emotional rendering to engine readiness in
  Phase 2+.
- Above ClerkProvider — appearance-mode is currently anonymous-scoped
  (single localStorage key), but future user-scoped appearance
  preferences would require auth-after-clerk hydration ordering.

### §4.4 NotificationProvider — auth-scoped lifecycle (INNERMOST)

**Position:** innermost.

**Rationale:**
- Value (`notificationActions`) is computed by
  `useNotificationEvents()` inside `AppWithToast` (line 526
  area). The hook may have auth-dependent behavior.
- Innermost position ensures notification stream teardown
  happens BEFORE auth unmount (sign-out cascades inside-out;
  notifications dismiss before Clerk completes sign-out
  redirect).

**Lifecycle invariants:**
- **Teardown ordering:** sign-out → NotificationProvider unmounts
  first (innermost) → AppearanceModeProvider unmounts →
  AppWithToast unmounts → MapSessionProvider unmounts → Phase
  5+ engine disposal → ClerkProvider completes redirect.
- **Value continuity:** `notificationActions` reference must
  survive across appearance-mode toggles (it does — appearance
  is a child of AppWithToast which holds the actions ref).
- **Toast scoping:** the offline/online status toasts fire from
  the `useEffect` in AppWithToast — cannot fire before
  NotificationProvider mounts because they call `notificationActions.showToast(...)`.

**Cannot move:**
- Outward (above AppearanceModeProvider) — would mean appearance
  state cannot influence toast styling (theming variants) without
  prop drilling.
- Above MapSessionProvider — would compute `notificationActions`
  outside the AppWithToast scope where the hook chain currently
  runs.

---

## §5 — Five preservation-critical dependency chains

(Cross-reference Pass 280 §11.5; Pass 281 contextualizes for
implementation work.)

### §5.1 Token → class → keyframe → component

Visual + motion identity chain:
- Cadence tokens (`--bd-flow-loop-*`, `--bd-flow-ease`) feed
  flow-motion classes (.bd-pin-pulse, .bd-bid-card-float, etc.)
- Classes consume keyframes (bdLiquidGoldFlow, bdPinPulse, etc.)
- Components consume classes (DashboardAtmosphere, Tier C BD
  components)

**Implementation invariant:** tokenizing inline values (relay #10
items A, B) must preserve the exact runtime values. Substitution
of "close" values erodes emotional continuity per Pass 280 §5.3.

### §5.2 Reduced-motion guards → keyframes (LAW-PROTECTED)

Per `LAW_ANIMATION_AND_ATMOSPHERE.md` §3 mandatory pattern path 1.

- Every keyframe consumer MUST have a corresponding
  `@media (prefers-reduced-motion: reduce)` guard.
- Pass 56 (2026-05-07) added single-block remediation in
  animations.css.
- 10-13 distributed guards in theme.css.

**Implementation invariant:** any pass that adds, modifies, or
moves a keyframe must verify the guard chain. Pass 280 §13 step 4
(reduce-guard audit script) is a planned validation pattern.

### §5.3 Dark-mode contrast → 19 override blocks → `.dark` ancestor (LAW-PROTECTED)

Per CLAUDE.md §7 + LAW_PROJECT_RULES.md "Light-Mode Surface Rule"
+ "Premium Gold Palette" (baseline locked 2026-05-03).

- 19 `.dark .bd-*` override blocks in theme.css.
- Class-based dark mode via Tailwind v4 `@custom-variant dark
  (&:is(.dark *))` (theme.css:147).
- Specific forbidden values explicitly enumerated:
  - `rgba(220, 165, 90)` halos — must not return
  - `rgba(254, 248, 220)` insets — must not return
  - `rgba(160, 95, 25)` trim — must not return

**Implementation invariant:** any token rename or class migration
must preserve the `.dark` ancestor selector relationship. Pass
276 §8 step 5 class-namespace migration must update both base
and `.dark` variants together.

### §5.4 Provider-order → appearance-mode hydration → atmospheric rendering

Pass 280 §11.3 + Pass 281 §4.3 detail.

- AppearanceModeProvider mount-order determines when
  `isLightAppearance` resolves.
- DashboardAtmosphere consumes `isLightAppearance` to choose
  light vs dark gradient stack.
- Misordering causes atmospheric layers to flash with default
  appearance during hydration.

**Implementation invariant:** any provider-tree refactor must
preserve AppearanceModeProvider's position relative to
DashboardAtmosphere consumers.

### §5.5 Cascade-order `:root` blocks → token-override semantics

Per Pass 276 §2.2 + theme.css line 2918 inline comment.

- Two intentional `:root` blocks at theme.css lines 895 + 2922.
- Dashboard tokens land AFTER glass tokens for cascade-override
  intent.
- Merging the blocks would break topical separation.

**Implementation invariant:** any theme.css refactor must preserve
the two-block structure and their relative order.

---

## §6 — Hydration timing invariants

| Invariant | Rationale |
| --------- | --------- |
| Clerk session resolves before notification stream subscribes | `useNotificationEvents()` may scope to authenticated user |
| `bidondent.appearance-mode` localStorage read happens during AppearanceModeProvider mount | First-render appearance must match user's previous session |
| MapLibre resize-patch side-effect fires during MapSessionProvider module-load | Phase 2+ engine mount safety requires patch in place |
| `notificationActions` computed in AppWithToast scope | Must run inside MapSessionProvider; provides actions ref to NotificationProvider value |
| DashboardAtmosphere `isLightAppearance` resolves before first paint | Atmospheric layer choreography depends on appearance mode |

---

## §7 — Auth-boundary sequencing invariants

| Invariant | Rationale |
| --------- | --------- |
| Sign-in: ClerkProvider initializes → child providers mount inside-out | React natural mount order |
| Sign-out: NotificationProvider unmounts → AppearanceModeProvider → MapSessionProvider → ClerkProvider redirect | React natural unmount order; teardown happens before redirect |
| Auth state changes during session: `useUser()` re-renders consumers; provider tree stable | Clerk handles session updates internally |
| Demo-mode: ClerkProvider stays mounted; demo apps duplicate AppearanceModeProvider + NotificationProvider as their own subtree | DevDemoCustomerApp + DevDemoShopApp pattern (§14) |

---

## §8 — Atmosphere mount timing invariants

| Invariant | Rationale |
| --------- | --------- |
| DashboardAtmosphere mounts as a child of AppearanceModeProvider consumer chain | Consumes `isLightAppearance` from context |
| 10 atmospheric layer divs render in stable z-0 order | Pass 280 §5; opacity choreography depends on render order |
| Layer divs are `pointer-events-none` (except base) | UI interaction passes through atmospheric layers to the underlying app |
| Reduced-motion guards apply to atmospheric animations (orbDrift, etc.) | LAW-protected per §5.2 |
| Light-vs-dark gradient stack swaps via `isLightAppearance` flag | Atomic swap; not animated; relies on appearance mode being resolved at mount |

---

## §9 — Persistence restoration ordering invariants

| Invariant | Rationale |
| --------- | --------- |
| `bidondent.appearance-mode` reads on AppearanceModeProvider mount | First-render appearance |
| `bidondent_navigation_state` reads on useNavigation mount | useNavigation is consumed by App-internal routes (Pass 277 §4 confirms shell delegates) |
| `bidondent_nav_session_*` keys are dynamic; written incrementally | LRU policy NOT yet enforced (Pass 274 §3.4 RISK 1; runtime audit findings) |
| `bidondent.navigation.providerHealth.v1` + `mapPerformance.v1` read by services/navigation | Services-layer persistence; not provider-layer |
| Demo-mode persistence (`bidondent_demo_*`) scopes to demo subtree | DevDemo apps have their own Provider duplications |

---

## §10 — Notification teardown sequencing invariants

| Invariant | Rationale |
| --------- | --------- |
| Sign-out triggers cascade unmount innermost-first | NotificationProvider unmounts first |
| Active toasts dismiss as part of NotificationProvider unmount | `useNotificationEvents()` cleanup must run before Clerk redirect |
| Offline/online status toast dependency on `useOnlineStatus()` hook | Lives in AppWithToast; unmounts together with notifications |
| Service-worker update toast (`useServiceWorkerUpdate()`) | Same scope as offline/online |
| Notification stream subscription cleanup happens inside NotificationProvider unmount | Auth-scoped subscription tear-down before auth itself unmounts |

---

## §11 — Invariants for future implementation work

When future implementation passes (Pass 282+) modify any of:

- `src/app/App.tsx` providers tree
- `src/app/components/maps/MapSessionProvider.tsx`
- `src/app/hooks/AppearanceModeContext.tsx`
- `src/app/features/notifications/NotificationContext.ts`
- Any code path between `ClerkProvider` and `AppContent`

… those passes MUST:

1. **Preserve the 4-layer mount order** (Clerk → MapSession →
   Appearance → Notification).
2. **Preserve the AppWithToast subcomponent boundary** —
   `notificationActions` must be computed inside the
   MapSessionProvider scope.
3. **Preserve MapSessionProvider's first-import-line resize-patch
   side-effect.** Cannot move the import lower in the file or
   remove it.
4. **Preserve EmbeddedBrowserBanner's position** between
   ClerkProvider and MapSessionProvider (Pass 170 dev-only
   mitigation).
5. **Preserve light-vs-dark contrast LAW** — any token / class
   touching `.dark` variants must update both light and dark
   variants together.
6. **Preserve reduced-motion guards** for any keyframe added,
   modified, or moved (LAW per `LAW_ANIMATION_AND_ATMOSPHERE.md`
   §3).
7. **Run the Pass 280 §13 step 4 reduce-guard audit** if Pass
   282+ adds/modifies any keyframe.
8. **Document deviations explicitly** if a pass needs to break
   any of the above — owner authorization required.

---

## §12 — Anti-patterns: what future "cleanup refactors" must NOT do

Per relay #5 + #7: "do not allow future cleanup refactors to
reorder these surfaces casually."

| # | Anti-pattern                                                                  | Why forbidden                                                                                        |
| - | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1 | Provider reorder without re-test                                              | Breaks auth-boundary / hydration / teardown invariants                                              |
| 2 | Collapsing AppWithToast subcomponent boundary                                 | `notificationActions` lift point disappears                                                          |
| 3 | Removing first-import-line resize-patch from MapSessionProvider              | Phase 2+ engine mount loses safety patch                                                             |
| 4 | Moving AppearanceModeProvider above MapSessionProvider                        | Couples appearance hydration to non-engine-ready context                                             |
| 5 | Mounting NotificationProvider before useNotificationEvents() computes value   | NotificationProvider value would be undefined at mount                                              |
| 6 | Removing EmbeddedBrowserBanner Pass 170 dev-only mitigation                   | Would break dev workflow on Google OAuth disallowed_useragent                                       |
| 7 | Batching auth + appearance + notification under a single Provider wrapper    | Loses mount-order discipline; teardown ordering becomes ambiguous                                   |
| 8 | Tier-mixing mount-order with Tier B map-engine-lift work                     | Phase 2 PMS engine wiring depends on the existing provider tree position                            |

---

## §13 — Validation patterns

When future passes touch the providers layer, validation should
include:

1. **Mount-order compile-time check.** Verify in `App.tsx` that
   the JSX nesting order matches the canonical 4-layer hierarchy.
   (Cannot be auto-checked by TypeScript; manual diff review.)
2. **Hydration timing visual check.** Boot the app with browser
   localStorage cleared; verify `DashboardAtmosphere` paints with
   default appearance only briefly before resolving. (Manual
   smoke test; runtime audit lane.)
3. **Sign-out teardown check.** Verify in dev-tools that React
   component tree unmounts in inside-out order during sign-out.
   (Manual; React DevTools.)
4. **Reduce-guard audit** (Pass 280 §13 step 4 — when implemented):
   automated pattern that lists every keyframe consumer and
   verifies a guard exists.
5. **Demo-mode parity check.** Verify DevDemoCustomerApp +
   DevDemoShopApp continue mounting AppearanceModeProvider +
   NotificationProvider in their subtree. (Manual; smoke test.)

These are observational invariants; they support future regression
work (relay #12 priority G — runtime continuity regression
harness prep).

---

## §14 — Demo-mode dual-provider pattern

`src/app/components/dev/DevDemoCustomerApp.tsx` (line 188 + 248)
and `src/app/components/dev/DevDemoShopApp.tsx` (line 183 + 243)
mount their own `<NotificationProvider>` + `<AppearanceModeProvider>`
inside the demo subtree.

Pattern:
```jsx
<DevDemoCustomerApp>  // child of <AppContent /> — under main provider tree
  <NotificationProvider value={demoActions}>
    <AppearanceModeProvider>
      <DemoContent />
    </AppearanceModeProvider>
  </NotificationProvider>
</DevDemoCustomerApp>
```

**Invariant:** demo apps DO NOT duplicate `ClerkProvider` or
`MapSessionProvider`. They run inside the parent provider tree
for those layers.

**Why:** demo mode bypasses Clerk auth via `?demo=customer` URL
flag (Pass 170). The demo subtree needs its OWN appearance +
notification providers (separate state from the main app), but
shares the parent Clerk auth boundary and resize-patch side-effect.

**Implementation invariant:** any pass that modifies the demo
apps must preserve the dual-provider pattern. Adding Clerk or
MapSession providers inside the demo subtree would create
duplicate side-effects / auth conflicts.

---

## §15 — Sequencing implications for extraction work

Per Pass 279 §9.1 phased pre-extraction prep:

### §15.1 Phase 0 (pure-capability ports)

`components/ui/`, `theme/`, `services/storage/` — extraction
does NOT touch the providers layer. Phase 0 is provider-order-safe.

### §15.2 Phase 2 (type-parameter generics)

Includes `features/notifications/` parameterization over
`<TCategory, TDeepLink>` (Pass 273 §2.2 + Pass 275 §4.2). The
NotificationContext value shape changes; the Provider mount-order
does NOT.

**Provider-order doctrine invariant:** type-parameterizing the
Notification machinery must NOT move the NotificationProvider
mount position.

### §15.3 Phase 3 (vendor wrappers)

Includes Clerk thin-wrapper retrofit (Pass 278 §10 step 3-5).
The wrapper redirects 5 direct `useUser()` callsites; ClerkProvider
mount stays in the same position (outermost).

**Provider-order doctrine invariant:** the wrapper exposes a
generic interface, but ClerkProvider remains the auth-root
ancestor.

### §15.4 Phase 4 (provider authority)

Includes potential `RealtimeSubscriptionProvider` +
`PersistenceProvider w/ LRU` (Pass 278 §12.1 + §12.2). New
providers would extend the hierarchy.

**Provider-order doctrine invariant for new providers:**
- `RealtimeSubscriptionProvider`: must mount AFTER ClerkProvider
  (auth required for channels) and AFTER MapSessionProvider
  (resize patch in place if realtime drives map updates).
  Likely position: between AppearanceModeProvider and
  NotificationProvider.
- `PersistenceProvider`: must mount AFTER ClerkProvider (user-scoped
  persistence) and BEFORE AppearanceModeProvider (the appearance
  preference reads through it). Likely position: between
  MapSessionProvider and AppearanceModeProvider.

These are recommendations for future architecture; not authorized
as implementation today.

### §15.5 Phase 5 (class-namespace migration)

Touches theme.css + 398 TSX className references. Does NOT touch
the providers layer. Phase 5 is provider-order-safe.

### §15.6 Phase 6 (extraction itself)

The extraction MUST extract the entire provider tree as a single
preservation unit. Cannot split ClerkProvider into one package
and AppearanceModeProvider into another without breaking the
mount-order invariants.

**Recommendation:** extract `App.tsx` provider hierarchy as part
of `@platform-core/app-shell/` — a single provider-composition
unit. Apps using the platform-core shell inherit the canonical
order; deviations require explicit owner authorization.

---

## §16 — What this pass DOES NOT do

- Does NOT touch any production source.
- Does NOT touch `LAW_ANIMATION_AND_ATMOSPHERE.md`,
  `LAW_PROJECT_RULES.md`, `LAW_LAYERED_ARCHITECTURE.md`,
  `LAW_HARDENING_PLAN.md`, or any other LAW.
- Does NOT modify `MOLANDJESUS_DESIGN_DECISIONS.md` or `CLAUDE.md`.
- Does NOT bootstrap any repo / extract any subsystem / create
  any package.
- Does NOT add new owner-decision points (cumulative remains 31).
- Does NOT re-open convergence-discovery lane — every invariant
  fits Pass 271 + 273 framework as stable doctrine.
- Does NOT supersede prior platform docs; codifies invariants
  surfaced by Passes 274-280.
- Does NOT validate or duplicate runtime-audit lane findings;
  cross-references where context applies.
- Does NOT mutate any provider order. Pass 281 codifies the
  CURRENT order as preservation invariants.
- **Does NOT author new LAW.** Pass 281 is REF-tier per relay
  #12 strict-construction. Future LAW elevation (if owner
  authorizes) would be a separate decision.

---

## §17 — Cross-references

- Pass 280 [`REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md`](REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md) — five preservation-critical dependency chains; Pass 281 §5 codifies the provider-order chain (#4) explicitly.
- Pass 278 [`REF_PROVIDER_ADAPTER_MATRIX_2026-05-09.md`](REF_PROVIDER_ADAPTER_MATRIX_2026-05-09.md) — initial 4-layer mount hierarchy mapping; Pass 281 refines with AppWithToast subcomponent detail.
- Pass 279 [`REF_CAPABILITY_VS_IDENTITY_MATRIX_2026-05-09.md`](REF_CAPABILITY_VS_IDENTITY_MATRIX_2026-05-09.md) — phased extraction recommendations; Pass 281 §15 contextualizes per phase.
- Pass 277 [`REF_SHELL_SLOT_CONTRACT_MAP_2026-05-09.md`](REF_SHELL_SLOT_CONTRACT_MAP_2026-05-09.md) — shell behavioral mapping; Pass 281 §4-5 confirms shell delegation pattern.
- Pass 274 [`REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md`](REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md) — storage-key registry; Pass 281 §9 cross-references.
- Pass 273 [`PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md`](PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md) — convergence verdict + 6-seam taxonomy.
- Pass 270 [`PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md`](PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md) — 16-subsystem MVP nucleus.
- Pass 266 — MapSessionProvider Phase 1 inert-seam doctrine; cross-referenced inside MapSessionProvider.tsx file header.
- Pass 260 §4 / §6 — PMS architecture options + Phase 1 spec.
- Pass 259 §5 — recommended provider-mount location (d) post-Clerk.
- `docs/LAW_ANIMATION_AND_ATMOSPHERE.md` — LAW-tier emotional + reduced-motion canon (273 lines).
- `docs/LAW_PROJECT_RULES.md` — primary LAW.
- `docs/LAW_LAYERED_ARCHITECTURE.md` — layer model.
- `CLAUDE.md` §7 — Light-Mode Surface Rule + Premium Gold Palette baseline.
- Owner relay 2026-05-09 #12 priority F — provider-order doctrine formalization directive.

---

## §18 — Status

- **Drafted:** 2026-05-09 (Pass 281, Provider-Order Doctrine lane).
- **Status:** ACTIVE reference. Preservation invariants — current truth as of 2026-05-09 commit.
- **Authority:** REF. Subordinate to all current LAW docs.
- **Owner approval required:** FALSE for this doc itself. TRUE for any source edit that breaks any invariant in §11 or §12.
- **Supersedes:** none.
- **Superseded by:** none.
- **Refines (does not supersede):** Pass 278 §7 + Pass 280 §11.3 by adding implementation-time invariants and anti-patterns.

**This is the FIRST execution-phase pass.** The inventory lane
(Passes 274-280) closed at Pass 280; the execution-phase opens
at Pass 281 with this doc-only invariant formalization (lowest
blast among the relay's 7 work items A-G).

**Forward triggers (any one opens the next implementation pass):**

1. Owner authorizes Pass 282 = relay #12 item A (cadence/easing
   token extraction — first source-edit pass; mechanical pattern).
2. Owner authorizes Pass 282 = relay #12 item B (blur-tier token
   extraction).
3. Owner authorizes Pass 282 = relay #12 item C (reduced-motion
   audit script — read-only validation infrastructure).
4. Owner authorizes Pass 282 = relay #12 item D (Clerk wrapper
   inflation — bounded but multi-file source edit).
5. Owner authorizes Pass 282 = relay #12 item E (notification
   generic parameterization prep).
6. Owner authorizes Pass 282 = relay #12 item G (runtime
   continuity regression harness prep).
7. Owner ratifies any of the 31 cumulative decision points.
8. Real runtime defect surfaces (independent lane).
9. Owner provides Stacey answers (Pass 268 §8).

Until one fires: dormant.

The invariant doctrine codified here is the foundation for the
next implementation passes. Any pass that touches the providers
layer — directly or indirectly — must respect §11 invariants
and avoid §12 anti-patterns.

The repo has crossed the inventory→execution threshold. Pass 281
is the bridge. Subsequent passes operate within the preservation
governance this doc codifies.
