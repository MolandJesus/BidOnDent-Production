# REF — Spatial Density + Dead-Zone Audit (Pass 292, 2026-05-09)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-09 #17 (ChatGPT Priority 2: spatial density + dead-zone analysis, framed as emotional-navigation-engine reverse engineering — NOT layout-bug hunting).
**Tier:** REF (current truth — derived from source as of commit `558f165f`).
**Source modification:** ZERO. Pure read-only audit.
**Companion to:** [`REF_MAP_SHELL_HIERARCHY_2026-05-09.md`](REF_MAP_SHELL_HIERARCHY_2026-05-09.md) (8-surface inventory + archetype rules), Pass 289–291 audit trio.

---

## §1. Premise & framing

ChatGPT relay #17 was explicit: this is **NOT** a layout-bug audit. It is a reverse-engineering of:

- interaction pressure distribution (where does the user actually touch?)
- cognitive scan efficiency (where does the eye land first / next?)
- focus-anchor stability (what stays in place across surface transitions?)
- map-to-panel balance (how is screen real estate divided between spatial and informational content?)
- trust-preserving whitespace economics (what role does emptiness play in calm/premium feel?)

Approach: trace the actual sizing/positioning decisions in source, treat each as a **deliberate spatial signal** about the product's emotional architecture. Findings are observations, not bugs.

---

## §2. Map-bearing surface inventory + spatial allocation

`REF_MAP_SHELL_HIERARCHY §2` catalogues 8 map-bearing surfaces. Pass 292 layers spatial allocation on top:

| Surface | Mobile height | Desktop height | Map-to-screen ratio | Layout pattern |
|---|---|---|---|---|
| Shop Directory immersive | full viewport (`fixed inset-0`) | full viewport | ≈100% | tree-swap full-screen |
| Shop Directory hybrid map section | 420px (`h-[420px]`) | 520px (`sm`) → 640px (`xl`) | small fraction of long scroll | column-stack inside `max-w-[1480px]` |
| Coverage browse map | `h-[100dvh]` (mobile) | `h-[84vh]` (lg) | dominant on mobile, ≈70% on desktop | overlay-panel-on-map (panel positioned absolutely at `inset-y-4 left-3 w-[372-408px]` per breakpoint) |
| Coverage active navigation | `h-[100dvh]` (mobile) | `h-[84vh]` (lg) | dominant; HUD/maneuver cards overlay | overlay-on-map with floating cards at z-[400-580] |
| Coverage Map Dialog | depends on Radix Dialog max-w | desktop dialog | bounded | Radix Dialog (Pass 289 Pattern B) |
| Dashboard map widget (Tier B preview) | `h-[180px]` | `md:h-[200px]` | tiny — preview only | embedded card; tap-to-expand to Shop Directory |
| Mobile map bottom sheet | `h-[92dvh]` | n/a (mobile-only) | nearly full viewport | drawer pull-up (Pass 291 z-[610]) |
| Hero coverage map (landing) | embedded fixed height | embedded fixed height | small/medium | landing page hero |

**Headline observation:** the map-to-screen ratio is **highly bimodal**:
- Either **nearly the entire viewport** (immersive, coverage browse, mobile bottom sheet) = "this is a spatial workspace"
- Or **a small fixed-height preview** (dashboard widget, hybrid map section) = "this is a glance/teaser"

There is almost NO middle ground. The product makes a strong commitment per surface: map is either the protagonist or a peripheral.

---

## §3. Panel/map ratio — the Shop Directory hybrid stage finding

**Critical observation:** the Shop Directory hybrid stage is **NOT** a side-by-side panel/map split (the conventional "list left, map right" pattern). It is a **column-stacked layout** across all breakpoints.

[`ShopDirectoryHybridStage.tsx:149-249`](../src/app/components/shop/ShopDirectoryHybridStage.tsx#L149) renders, in vertical order:

1. **Header** (search, sort, mode toggle) — `ShopDirectoryHybridHeader`
2. **Search panel** — `ShopDirectorySearchPanel className="mt-4"`
3. **Map section** — `ShopDirectoryHybridMapSection` (h-[420/520/640px])
4. **List body** — `ShopDirectoryListBody`

All wrapped in `mx-auto max-w-[1480px]`. The grid has NO `grid-cols-2` / `lg:flex` / `lg:w-[NN%]` directives in this file. There is no side-by-side ever.

**Implication for cognitive scan efficiency:**
- Users must **scroll vertically** to see the list while the map is in view (or vice versa).
- Map and list are **temporally separated** in user attention, not spatially co-present.
- The "hybrid" label is misleading — it's a vertically-laminated workspace, not a split-pane.

This is a strong product opinion. It de-prioritizes the conventional "scan list, glance at map, scan list" loop and instead enforces a "look at map, then look at list" sequencing. May be intentional (matches map-first product identity per CLAUDE.md), or may be an organic accumulation. **Currently undocumented as a design stance** — no LAW or REF doc explains why hybrid is column-stacked.

**Compare to Coverage browse:** Coverage browse uses overlay-panel-on-map at desktop (panel absolutely positioned at `inset-y-4 left-3 w-[372-408px]`). This IS the conventional split-pane idiom — panel hovers OVER the map at desktop, map below.

So the codebase has TWO incompatible panel/map ratio patterns:
- Shop Directory hybrid: column-stacked (panel above map, not over)
- Coverage browse: overlay-panel-on-map (panel hovers over map at desktop)

Owner-decision territory: is this divergence intentional (different product surfaces, different emphasis) or accidental (organic accumulation)?

---

## §4. Mobile thumb-zone analysis

iOS/Android ergonomic standard: the thumb-reachable arc on a one-handed mobile grip extends roughly the **bottom 60–70%** of the viewport. The top corners are the LEAST reachable.

**Where does BidOnDent place primary actions?**

| Action | Position | Thumb-zone score |
|---|---|---|
| Mobile bottom nav (`MobileBottomNav.tsx`) | `fixed bottom-0` with `safe-area-inset-bottom` | ✅ Excellent — within thumb arc |
| Profile dropdown (mobile fallback) | `max-md:bottom-[max(env(safe-area-inset-bottom),12px)]` | ✅ Excellent — bottom-anchored |
| Dashboard map widget "Open" button | `absolute top-3 right-3` | ⚠️ Far top-right corner — hardest reach for right-handed thumb |
| Dashboard map widget "View options" button | `absolute top-3 right-3 z-10` (CustomerMapWidget) | ⚠️ Same corner — duplicated thumb-stress |
| Immersive map top bar (back button) | top of immersive container | ⚠️ Top-left corner — hardest reach for left-handed thumb |
| Immersive map results drawer | bottom-pulled drawer (Pass 291) | ✅ Excellent |
| Shop info panel (immersive) | floats — typically bottom area | ✅ Good |
| Toast notifications | `top-4 right-4 z-[9999]` | ⚠️ Top-right corner; but toasts are notifications, dismissal can be alternative-method (auto-dismiss) so reachability matters less |
| Service-worker update banner | `fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999]` (App.tsx:536) | ✅ Excellent — bottom-anchored above bottom-nav |
| ShopDetailSheet | `inset-x-0 bottom-0 z-[701]` with `pb-[env(safe-area-inset-bottom)]` | ✅ Excellent — full bottom |

**Observations:**
- **Bottom-zone discipline is strong** for the major surfaces (sheets, nav, banners).
- **Top-right corner is overloaded** — the same hard-to-reach area carries 4+ different action sites (toast, dashboard map button, immersive top-bar controls). On mobile, the user's right thumb travels there many times per session.
- **No consistent "primary action zone"** across surfaces — each map surface decides for itself. This is consistent with the codebase's no-orchestration-depth stance but means thumb-load is unbudgeted.

**Continuity surface SP1:** the dashboard map widget's "Open" button at `top-3 right-3` is the highest-frequency tap target on the dashboard map widget surface — but it's in the worst thumb-reach zone. Owner-decision: relocate to bottom-aligned, accept top-right as a deliberate "lift to enter" gesture, or treat the widget as a glance-only surface where tapping is rare?

---

## §5. Z-axis × spatial intersection — the bottom nav occlusion finding

**Mobile bottom nav** is at `z-50` (`MobileBottomNav.tsx:32`). **Immersive map container** is at `z-[60]` (`ShopDirectoryImmersiveMap.tsx:128`).

**Net effect:** when the user enters immersive map mode on mobile, the bottom navigation tabs are **OCCLUDED** by the immersive container. The tabs are still in the React tree but visually covered.

**What this means for navigation UX:**
- User in immersive mode wants to switch tabs (e.g. to "Bids") → cannot via bottom nav (covered) → must press the immersive top-bar back button OR ESC OR top-bar mode selector → then bottom nav becomes visible.
- This forces immersive to be an **EXIT-VIA-CHROME experience** rather than allowing direct cross-section navigation.

**Interpretation:**
- This is consistent with `MAP_SHELL_HIERARCHY §3.5` (immersive owns viewport).
- It also matches CLAUDE.md fact #5 / `bd-design-identity` skill (mobile map-first posture: protect map-as-primary).
- It may be intentional — immersive is a "modal workspace" the user enters with full attention.
- But it is **never documented as a deliberate stance**. The z-50 vs z-[60] relationship is ad-hoc per file, not a coordinated decision.

**Continuity surface SP2:** if the bottom nav is intended to be visible during immersive (some products keep nav visible to allow quick switch), the z-relationship needs inversion. If it's intended to be hidden (current behavior), the doctrine should be documented.

**Cross-doc observation:** Pass 291 §2 catalogued the numeric z-axis canon. Pass 292 surfaces that the z-axis canon and the spatial canon are NOT cross-checked anywhere — z-50 (bottom nav) vs z-[60] (immersive) is the only point where the two canons collide directly, and it's unspoken.

---

## §6. Dead-zone observations

A "dead zone" here is a region of the viewport that is consistently **empty of information AND empty of interaction** — not white space (intentional emptiness) but unclaimed space.

| Surface | Identified dead zone | Spatial implication |
|---|---|---|
| Hybrid stage | The vertical gap between map section bottom and list body top — `mx-4` containers stacked with no explicit transition affordance | User has to scroll past the map to discover there's a list. No "scroll for more" cue. |
| Immersive map | Center of map when no shop is selected, no route is plotted, no overlay is active | This IS spatial whitespace by design (the map IS the content). NOT a dead zone. |
| Dashboard map widget | The center 80% of the 200px-tall preview when no markers are in view | Glance-only by design; tap-to-expand is the affordance. NOT a dead zone. |
| Coverage browse on desktop | Right side of viewport (panel is on left at `left-3`, map fills rest) | Map dominates. NOT a dead zone (map IS content). |
| Coverage browse on mobile | None obvious — sheet pulls up to 92dvh | Mobile pattern is well-occupied. |
| Mobile bottom nav padding | The space ABOVE the bottom nav (where the nav background extends `safe-area-inset-bottom`) | Necessary for iOS notch/home-indicator. NOT a dead zone. |

**Observation:** there are **no significant dead zones** in BidOnDent's primary map surfaces. Empty regions are either:
- Map content (the map IS the visual)
- Trust-preserving whitespace (calm/premium identity)
- Affordance-bounded (preview surfaces commit to being small)

The **only candidate dead zone** is the hybrid stage gap between map and list — and even that is structural (sections separated by `<section className="mx-4">` with implicit spacing). This is a UX observation, not a defect.

**Continuity surface SP3:** the hybrid stage's vertical column-stacking (Pass 292 §3) compounds with this — the user discovers the list only by scrolling past the map. There is no "see list below" indicator. May be intentional (assumes user knows the layout); may benefit from a scroll-cue affordance. Owner-decision territory.

---

## §7. Trust-preserving whitespace economics

The relay #17 framing names "trust-preserving whitespace economics" as a goal. Tracing the actual whitespace patterns:

**Padding standards:**
- Container max-width: `max-w-[1480px]` (Shop Directory hybrid) and `max-w-7xl` (DashboardHeader, = 1280px)
- Container side-padding: `mx-4` (mobile) → `sm:p-4`, `lg:px-6` (desktop)
- Section gaps: `space-y-3`, `space-y-6`, `mt-4`, `mt-5` (Tailwind scale)
- Card inner padding: `p-3 sm:p-4` (Shop Directory hybrid stage shell), `p-4 sm:p-5` (panel inside)

**Observation:** padding is **consistent and breathing** — never edge-tight on the larger surfaces. Card-in-card uses progressive padding (outer p-3/4, inner p-4/5) creating perceived depth.

**Trust signal:** the consistent breathing + `bd-glass-*` premium glass shells (per `MOLANDJESUS_DESIGN_DECISIONS`) + cool-blue-with-gold-lamp light mode (per CLAUDE.md fact #7) work together as a **calm/premium signal**. Whitespace is not arbitrary — it is part of the brand contract.

**Continuity property:** any future "tighten the layout" work would compromise this trust signal. The whitespace IS the product, not just background. This corroborates the LAW_PROJECT_RULES rejection of "modernize to flat white" / "neutral SaaS palette" external audit recommendations (per CLAUDE.md fact #7) — those audits typically also recommend "denser layouts" which would erode the same trust signal.

**No new finding;** this section confirms the existing brand canon is reflected in actual spacing decisions.

---

## §8. Cognitive scan + focus-anchor stability

**Eye-tracking simulation** (mental model from layout):

When a user lands on the **dashboard** for the first time:
1. Top-left logo + role pill (DashboardHeader brand area)
2. Center / hero — first card or map widget
3. Bottom — bottom nav

When a user lands on **Shop Directory hybrid**:
1. Top — header section
2. Search bar (heavy visual weight from premium glass shell)
3. Map (fixed-height block)
4. List below

When a user lands on **Shop Directory immersive**:
1. Top-bar with back button
2. Map (full viewport)
3. Drawer pull-tab (bottom)

**Focus anchor patterns:**
- **Dashboard:** brand pill is the focus anchor (always top-left). Persistent across tab changes.
- **Shop Directory:** the search panel is the recurring anchor (always near top of stage).
- **Coverage browse desktop:** the left-anchored panel at `left-3 w-[372px]` is the focus anchor.
- **Immersive:** the back button is the only persistent UI anchor.

**Observation:** focus anchors **don't survive** Pass 289 Pattern A tree-swaps. When user toggles immersive ↔ hybrid, the brand pill / search panel anchors disappear (immersive doesn't have them), replaced with the immersive top bar (different shape, different visual weight). This is a **perceived discontinuity** — not a bug, but a UX cost.

**Continuity surface SP4:** the cross-mode focus anchors are inconsistent. A user toggling between hybrid and immersive must re-orient on each transition. Owner-decision: introduce a persistent cross-mode anchor (e.g. always-visible search pill), or accept per-mode anchor differentiation as deliberate (each mode has its own "voice")?

---

## §9. Connections + contributions

### 9.1 To prior audit-lane work

Pass 289 → 290 → 291 → 292 form a coherent 4-axis audit:
- **Pass 289:** within-tab lifecycle (state survival across tree-swap)
- **Pass 290:** across-tab continuity (sync across browser tabs)
- **Pass 291:** within-frame overlay topology (z-axis stack + gesture precedence)
- **Pass 292:** spatial allocation + thumb economics (where things live in the viewport, what they signal)

Together these reverse-engineer the codebase's **continuity operating system** as relay #17 framed it.

### 9.2 To relay #15 #7 / relay #17 themes

Pass 292 strengthens the "semantic vs. visual decoupling" theme along a new axis:
- Pass 289: visual STATE is disposable; semantic state survives.
- Pass 290: visual state is per-tab; semantic state may sync.
- Pass 291: visual POSITION is fragmented across mount sites (guidance card jump).
- Pass 292: visual ANCHORS are mode-specific (focus anchors don't carry across tree-swap modes).

This is a 4-layer demonstration of the same architectural choice. The codebase consistently prioritizes **semantic continuity** over **visual continuity** at every scale (component, tab, frame, viewport).

### 9.3 To `MAP_SHELL_HIERARCHY §3` archetypes

Pass 292 §2's height/ratio table is a quantitative companion to §3's qualitative archetypes (map-first vs panel-first). The two together fully specify the spatial commitment per surface.

### 9.4 To `bd-design-identity` skill

The whitespace economics findings (§7) directly corroborate the `bd-design-identity` skill's "calm/premium/map-first" identity. Spacing decisions are not arbitrary — they instantiate the brand.

### 9.5 No new convergence on `placeDiscoveryQuality.ts:51` hotspot

Pass 292 finds zero new convergence on the Pass 288/290 hotspot. Spatial topology does not touch persistence. Per relay #17: continue treating that surface carefully.

---

## §10. Owner-decision-bound items surfaced

Pass 292 surfaces the following observations. Each is observation-only; remediation is conditional on owner first deciding the asymmetry/divergence is undesirable:

1. **§3 hybrid-stage column-stack:** intentional product-opinion or organic? Document as REF stance, or accept as undocumented practice?
2. **§3 panel-on-map vs column-stack divergence (Coverage vs Shop Directory):** intentional per-surface, or should be unified under one pattern?
3. **§4 SP1 thumb-zone overload at top-right corner:** relocate primary actions, or accept as desktop-friendly default?
4. **§5 SP2 bottom-nav occlusion in immersive:** invert z to keep nav visible, or document hidden-during-immersive as deliberate?
5. **§6 SP3 hybrid map→list scroll cue:** add affordance, or accept that users scroll naturally?
6. **§8 SP4 cross-mode focus-anchor differentiation:** unify anchor across modes, or accept per-mode "voice"?

**Pass 292 introduces ZERO new owner-decision points to the cumulative count of 31** (each is conditional on owner first deciding the asymmetry is undesirable).

---

## §11. Pass 281 invariants check

| Invariant | Status |
|---|---|
| 4-layer provider mount order | UNTOUCHED |
| AppWithToast subcomponent boundary | UNTOUCHED |
| First-import-line resize-patch | UNTOUCHED |
| Light-vs-dark contrast LAW palette | UNTOUCHED |
| Reduced-motion guards (35/35 per Pass 284) | UNTOUCHED |
| Two intentional `:root` blocks | UNTOUCHED |
| Pass 282 cadence/easing tokenization | UNTOUCHED |
| Pass 283 blur tokenization | UNTOUCHED |
| Pass 286 Clerk wrapper inflation | UNTOUCHED |
| Pass 287 provider-mount-order test | UNTOUCHED |
| Pass 288 persistence-namespace test | UNTOUCHED |
| Pass 289 fullscreen-lifecycle observations | UNTOUCHED (extended) |
| Pass 290 cross-tab observations | UNTOUCHED (extended) |
| Pass 291 overlay-topology observations | UNTOUCHED (extended) |

Pass 281 §12 anti-patterns: ZERO violations.
Relay #15 / #17 prohibitions: ZERO violations.

---

## §12. What this pass does NOT do

- No source modification (audit-only)
- No LAW edit
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit
- No proposal to fix any SP-series observation
- No new test files
- No proposed unification of hybrid-stage vs coverage layout patterns (would be substantial design decision)
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #17)
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §13. Forward triggers

1. Owner authorizes documenting the hybrid-stage column-stack stance as a REF or LAW clause.
2. Owner authorizes thumb-zone heatmap exercise (designer/owner co-decides primary action placement standard).
3. Owner authorizes z-axis × spatial reconciliation (bottom nav vs immersive doctrine).
4. Owner authorizes Phase 2 harness candidate: snapshot-test that Pass 292 §2 height-grammar values are unchanged.
5. Pass 293+ continues remaining relay #17 list:
   - **responsiveness continuity** (READ-ONLY ONLY per relay #17 — resize-patch is continuity-sensitive; Pass 281 invariant #3 protected; do NOT move into implementation unless instability is mechanically undeniable)

---

## §14. Status

REF doc shipped Pass 292. Audit-only — preserves all existing doctrine. The audit lane (Pass 289 + 290 + 291 + 292) now covers four orthogonal axes of map continuity: within-tab lifecycle, across-tab sync, within-frame overlay topology, viewport-spatial allocation. Final remaining relay #17 audit item is responsiveness continuity (read-only).

**End of doc.**
