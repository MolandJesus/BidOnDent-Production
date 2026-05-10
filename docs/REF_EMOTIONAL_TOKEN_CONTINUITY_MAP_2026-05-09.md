---
status: ACTIVE
authority: REF
scope: emotional-token-continuity-preservation-map
canonical_source_of_truth: REF_EMOTIONAL_TOKEN_CONTINUITY_MAP_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 280 emotional-token continuity map under owner relay 2026-05-09 #11 priority E (final inventory; largest remaining preservation surface). Mechanical+behavioral inventory of emotional-system continuity dependencies across 8 dimensions: cadence timing / easing system / opacity choreography / motion hierarchy / glow sequencing / atmospheric layering / light-dark emotional contrast / reduced-motion preservation. Surface: 25 keyframes in animations.css 553 lines + 35+ atmospheric class families in theme.css 4,913 lines + DashboardAtmosphere 184 lines pure-render with 10 stacked atmospheric layers + 8 distinct backdrop-blur radii forming depth hierarchy + 20+ distinct opacity values + 1 canonical easing token (--bd-flow-ease cubic-bezier(0.4, 0, 0.2, 1)) + 3 cadence-loop duration tokens (--bd-flow-loop-slow 28s / --bd-flow-loop-med 18s / --bd-flow-loop-fast 4.2s) + 19 dark-variant emotional class blocks + 23 reduced-motion guard blocks (10 in theme.css + 1 in animations.css covering 24 keyframes + 27 utility classes via Pass 56 2026-05-07 single additive block). Existing LAW: docs/LAW_ANIMATION_AND_ATMOSPHERE.md (273 lines, 21KB) ALREADY codifies trust+spatial-continuity filter, 29 canonical keyframes, mandatory prefers-reduced-motion contract, CSS-first lock, framer-motion escape clause — Pass 280 inventories under existing canon, does NOT modify. Three preservation-critical findings: (1) reduced-motion contract is mature LAW-tier infrastructure (Pass 56 audit + remediation pattern) — extraction inheritance is mechanical; (2) cadence timing is bound to ONE canonical easing token + 3 duration tokens — entire flow-motion family (Liquid Gold Flow, Map Sheen, Pin Pulse, Glass Float) shares same easing; (3) DashboardAtmosphere 10-layer composition encodes light-vs-dark emotional contrast through opacity choreography — preservation requires per-layer opacity preservation, not just color-token preservation. Continuity-preservation dependency graph: emotional classes depend on flow tokens, flow tokens depend on canonical easing, animations depend on reduced-motion guards, atmospheric layers depend on z-index + opacity hierarchy, light-vs-dark depends on .dark ancestor selector + 19 dark-variant blocks. Three sequencing implications: extraction must preserve reduced-motion guards mechanically (LAW-tier), cadence-token unification is platform-grade-shape but values are BD identity (Pass 271 emotional-seam category), atmospheric layering encodes runtime emotional behavior that extraction cannot flatten without identity erosion. Final inventory in execution-readiness lane — Passes 274-280 complete the conversion of Pass 273 qualitative seam taxonomy into mechanical location data spanning all 6 axes. Framework HOLDS. ZERO new contamination categories. ZERO new owner-decision points (cumulative remains 31). NO LAW edit / no source touch / no doctrine extension.
last_updated: 2026-05-09
---

# Pass 280 — Emotional-Token Continuity Map

> **Tier:** REF. Current truth — emotional-system continuity
> dependency graph.
> **Authority:** Owner relay 2026-05-09 #11 priority E
> ("the largest remaining unmapped preservation surface ...
> cadence timing, opacity choreography, motion hierarchy, glow
> sequencing, atmospheric layering, transition softness,
> emotional contrast systems, continuity-preservation
> dependencies").
>
> **What this doc is:** mechanical+behavioral inventory of the
> emotional-system surface that extraction work must preserve.
> Final inventory in the execution-readiness lane (Passes
> 274-280).
>
> **What this doc is NOT:**
> - LAW. Inventory under existing canon.
> - A re-test of convergence. Framework used as stable doctrine.
> - An extraction plan. Inventory is input, not authority.
> - A modification of `LAW_ANIMATION_AND_ATMOSPHERE.md` (273 lines,
>   already-LAW). Pass 280 cross-references that doc; does NOT edit it.
> - A new decision-point generator. Pass 280 adds zero owner
>   decisions to cumulative 31.

---

## §1 — Mission

Per relay #11:

> "The dominant risks are now: emotional continuity erosion,
> sequencing mistakes, provider-order instability, authority
> fragmentation, hydration drift, namespace over-normalization,
> and preservation failures during otherwise-correct extraction
> work."

The questions this pass answers:
1. What are the emotional-system surfaces extraction work must preserve?
2. How do cadence / easing / opacity / motion / glow / atmosphere / contrast / reduced-motion surfaces depend on each other?
3. Where does the existing `LAW_ANIMATION_AND_ATMOSPHERE.md` already codify preservation?
4. Which surfaces are platform-grade-shape (cadence primitives) vs identity-bearing (BD-flavor values)?
5. What is the continuity-preservation dependency graph extraction must respect?

---

## §2 — Existing LAW: cross-reference (NOT modified)

`docs/LAW_ANIMATION_AND_ATMOSPHERE.md` (273 lines, 21KB) already
codifies the emotional-system canon. Pass 280 inventories under
this existing LAW; does NOT modify it.

Per CLAUDE.md, the LAW codifies:
- Trust + spatial-continuity filter
- 29 canonical keyframes
- Mandatory `prefers-reduced-motion` contract
- CSS-first lock
- framer-motion escape clause

The LAW is the authority. Pass 280 maps the implementation
surface and the dependency graph; the LAW already specifies the
rules.

---

## §3 — Cadence timing + duration tokens

### §3.1 The 3 canonical loop-duration tokens

`src/styles/theme.css:953-955`:

```css
--bd-flow-loop-slow: 28s;     /* slow ambient drift */
--bd-flow-loop-med: 18s;      /* medium cadence */
--bd-flow-loop-fast: 4.2s;    /* pin-pulse rhythm */
```

These are the **primary cadence primitives**. Three semantic
tempi: slow (atmospheric drift), medium (transition rhythm),
fast (interaction pulse).

### §3.2 Inline duration values across theme.css

Beyond the 3 tokens, additional durations appear inline:

| Duration       | Use                                    | Pattern                               |
| -------------- | -------------------------------------- | ------------------------------------- |
| 7.2s           | mapLiquidSheenDrift                    | atmospheric secondary drift           |
| 6s             | bdRouteShimmer / mapGlassFloat         | medium-loop cadence                   |
| 5.6s           | mapGlassFloat                          | medium-loop cadence                   |
| 36s reverse    | orbDrift counter-pair                  | symmetric-pair drift                  |
| 28s            | orbDrift primary                       | matches `--bd-flow-loop-slow`         |
| 2.8s           | mapNavIconPulse                        | between fast & medium                 |
| 1100ms         | bdGoldSheenOneShot (dashboard variant) | one-shot transition                   |
| 1000ms         | bdGoldSheenOneShot (alternate)         | one-shot transition                   |
| 900ms          | bdGoldSheenOneShot (warmer variant)    | one-shot transition                   |
| 1.4s           | bdGoldSheenOneShot                     | one-shot transition                   |
| 420ms          | mapUiEnter                             | UI entrance                           |
| 280ms          | mapPopupEnter                          | popup entrance                        |
| 220ms          | transition: background / transform     | hover-state response                  |
| 0.3s           | slide-in-right                         | notification entrance                 |

### §3.3 Pre-extraction prep observation

The 3 canonical loop tokens are the platform-grade-shape surface.
The ~14 inline durations are the identity-bearing surface (each
is a BD-tuned value chosen for a specific motion).

**Cadence preservation:** extraction must preserve both the
abstract cadence (slow/medium/fast taxonomy) AND the concrete
inline values (each tuned through visual-canon iteration).
Re-tokenizing inline values into named tokens (e.g.,
`--bd-cadence-popup-enter: 280ms`) is the recommended pre-extraction
prep — converts the implicit identity into explicit named tokens.

---

## §4 — Easing system

### §4.1 The 1 canonical easing token

`src/styles/theme.css:956`:

```css
--bd-flow-ease: cubic-bezier(0.4, 0, 0.2, 1);
```

Used by:
- `bdLiquidGoldFlow` (theme.css:4047)
- `mapLiquidSheenDrift` (theme.css:4073)
- `bdPinPulse` (theme.css:4115)
- `mapGlassFloat` (theme.css:4180)

**Single canonical easing token shared across the entire flow-motion
family.** This is one of the strongest cleanliness signals in
the emotional system.

### §4.2 Inline easing values

Beyond the canonical token, inline easings appear:

| Easing                           | Use                                          |
| -------------------------------- | -------------------------------------------- |
| `cubic-bezier(0.2, 0.8, 0.2, 1)` | mapUiEnter / mapPopupEnter (entrance physics) |
| `cubic-bezier(0.4, 0, 0.2, 1)`   | transition: background / transform / matches `--bd-flow-ease` |
| `ease-in-out`                    | orbDrift / orb pairs / sheen drift           |
| `ease-out`                       | bdGoldSheenOneShot variants / hover transitions |
| `linear`                         | bdRouteShimmer (constant-velocity motion)    |

### §4.3 Easing taxonomy

Four distinct easing roles:

1. **Flow easing** (`--bd-flow-ease`): canonical infinite-loop motion
2. **Entrance easing** (`cubic-bezier(0.2, 0.8, 0.2, 1)`): UI elements arriving
3. **Atmospheric easing** (`ease-in-out`): orb drift, ambient layers
4. **One-shot easing** (`ease-out`): interaction responses (gold sheen, hover)
5. **Linear**: constant-velocity (route shimmer)

**Extraction implication:** the canonical `--bd-flow-ease` token
is platform-grade-shape (the easing taxonomy is reusable). The
4 inline easings should be tokenized pre-extraction:

```
--bd-ease-flow:     cubic-bezier(0.4, 0, 0.2, 1)
--bd-ease-entrance: cubic-bezier(0.2, 0.8, 0.2, 1)
--bd-ease-ambient:  ease-in-out
--bd-ease-response: ease-out
--bd-ease-linear:   linear
```

---

## §5 — Opacity choreography (DashboardAtmosphere as canonical example)

### §5.1 DashboardAtmosphere 10-layer stack

`src/app/components/app/DashboardAtmosphere.tsx` (184 lines)
defines 10 atmospheric layers, all `fixed inset-0 z-0` with
`pointer-events-none` (except base layer). Each layer is a
specific `<div>` with inline `style={{ background: ... }}`
applying gradient/radial composition.

### §5.2 Opacity hierarchy in DashboardAtmosphere

Mechanical inventory of distinct rgba alpha values used:

| Alpha range | Use                                                    |
| ----------- | ------------------------------------------------------ |
| 0.04 - 0.06 | Far-edge atmospheric haze (subtle)                    |
| 0.08 - 0.10 | Inner atmospheric layers (gentle presence)             |
| 0.14        | Medium ambient bloom                                   |
| 0.18 - 0.22 | Stronger atmospheric warmth (lamp glow visible)        |
| 0.28        | Warm luminous bloom (top-cast lamp light)              |
| 0.34        | Top-ribbon refractive depth                            |
| 0.55        | (route-blue alpha — reference; not in atmosphere)      |
| 0.99        | Deep navy base (light-mode 100% solid)                 |

Color families used in DashboardAtmosphere:
- Bronze gold: `rgba(196, 130, 45, ...)` — outer atmosphere
- Cream gold: `rgba(196, 144, 65, ...)` — inner lamp light
- Light blue: `rgba(147, 197, 253, ...)` — light-mode bloom
- Ribbon cream: `rgba(226, 236, 252, ...)` — top-cast light
- Lavender: `rgba(139, 92, 246, ...)` — accent atmospheric
- Cyan: `rgba(14, 165, 233, ...)` — accent atmospheric
- Deep navy: `rgba(10, 22, 58, ...)` — dark-mode base
- Cream white: `rgba(255, 224, 160, ...)` — warm luminous bloom

### §5.3 Opacity preservation criticality

The atmospheric layering is **runtime-visible behavioral identity**
per Pass 271 + relay #4. The opacity choreography encodes:

- Visual depth (layer-stacked alpha contributes to perceived depth)
- Emotional pacing (bloom intensity sets emotional weight)
- Trust signal (calm + premium feel from restrained alphas)
- Cinematic continuity (top-cast lamp ≠ stamped paint)

**Opacity values are not arbitrary. Each value is canon-tuned
through visual iteration.** Pass 276 §8 step 1 (rgba lift)
should preserve the EXACT alpha values when lifting into named
tokens; substituting "close" values would erode emotional continuity.

---

## §6 — Motion hierarchy + keyframe inventory

### §6.1 25 keyframes in `src/styles/animations.css`

Per Pass 272 §10 audit:

| Keyframe                | Line | Category       |
| ----------------------- | ---- | -------------- |
| `float`                 | 4    | Landing badge bob |
| `float-slow`            | 14   | Landing badge bob (slower) |
| `float-delayed`         | 24   | Landing badge bob (rotated) |
| `fadeInUp`              | 35   | Section reveal |
| `fadeInDown`            | 46   | Section reveal |
| `fadeInLeft`            | 57   | Section reveal |
| `fadeInRight`           | 68   | Section reveal |
| `fadeIn`                | 79   | Generic reveal |
| `scaleIn`               | 89   | Modal/card emergence |
| `pulseGlow`             | 101  | Attention pulse |
| `shimmer`               | 112  | Skeleton/loading |
| `slideInNotification`   | 122  | Notification entrance |
| `countGrow`             | 134  | Stat-counter growth |
| `blobFloat`             | 146  | Decorative blob motion |
| `bounceSoft`            | 167  | Gentle bounce |
| `dashMove`              | 178  | Dashed-line crawl |
| `spinSlow`              | 185  | Slow rotation (loading rings) |
| `speedWarningPulse`     | 238  | Speed-limit warning |
| `orbDrift`              | 365  | Atmospheric orb drift |
| `orbGlow`               | 382  | Atmospheric orb glow |
| `orbFloat`              | 395  | Atmospheric orb float |
| `orbRotateDrift`        | 412  | Atmospheric orb rotation |
| `orbBreathe`            | 429  | Atmospheric orb breathing |
| `arrival-scale-in`      | 463  | Arrival-state celebration |
| `bdTileFade`            | 538  | Map tile-style cross-fade (Pass 93) |

### §6.2 Additional keyframes in theme.css (estimate)

Per Pass 272 §10 + Pass 280 inline-survey: ~6-10 additional
keyframes defined inline in theme.css (e.g., `bdLiquidGoldFlow`,
`mapLiquidSheenDrift`, `mapNavIconPulse`, `mapUiEnter`,
`mapPopupEnter`, `bdPinPulse`, `mapGlassFloat`, `bdRouteShimmer`,
`bdGoldSheenOneShot`).

### §6.3 Motion hierarchy

Three motion-energy layers:

1. **Atmospheric (slow infinite):** orb*, mapLiquidSheenDrift,
   bdLiquidGoldFlow, mapGlassFloat — runs continuously; sets
   ambient mood
2. **Interaction (one-shot):** bdGoldSheenOneShot, mapUiEnter,
   mapPopupEnter, fadeIn*, scaleIn, slideInNotification,
   bdTileFade — fires on user actions or state changes
3. **Pulse (fast loop):** bdPinPulse, mapNavIconPulse, pulseGlow,
   speedWarningPulse — attention-drawing rhythmic pulses

Each tier has a preservation profile. Atmospheric tier is the
most preservation-sensitive (its absence breaks emotional
continuity); interaction tier is replaceable; pulse tier is
preservation-critical for accessibility (speedWarning) and
identity (pinPulse).

---

## §7 — Glow sequencing

### §7.1 Glow tokens (Pass 276 §3.1)

`src/styles/theme.css` `--bd-glow-*` family (4 tokens):

```css
--bd-glow-subtle: 0 0 16px rgba(59, 130, 246, 0.06);
--bd-glow-medium: 0 0 24px rgba(59, 130, 246, 0.1), 0 0 8px rgba(96, 165, 250, 0.06);
--bd-glow-strong: 0 0 32px rgba(59, 130, 246, 0.16), 0 0 12px rgba(96, 165, 250, 0.1);
--bd-glow-pool:   0 0 48px rgba(59, 130, 246, 0.12), 0 0 16px rgba(147, 197, 253, 0.08);
```

Four-tier glow scale: subtle → medium → strong → pool. Each
combines a primary blue-500 glow with a secondary blue-400/300
support glow.

### §7.2 Glow class consumers

`.bd-glow` (3 class blocks per Pass 276 §4.2). Plus
`.bd-landing-cta-glow` (2 blocks), `.bd-pin-pulse` (6 blocks
using glow logic implicitly).

### §7.3 Glow-vs-glow-in-motion distinction

Static glows (`--bd-glow-*`) set surface presence. Motion glows
(pulseGlow keyframe, pin-pulse, gold-sheen) modulate glow over
time. Pass 280 finds these are kept separate by design — static
tokens for box-shadow; keyframes for animated alpha shifts.

---

## §8 — Atmospheric layering: backdrop-blur depth hierarchy

### §8.1 Eight distinct blur radii in theme.css

| Blur radius | Occurrence count | Use                                            |
| ----------- | ---------------- | ---------------------------------------------- |
| 28px        | 20               | Primary glass depth (most common)              |
| 20px        | 12               | Secondary glass / subdued depth                |
| 32px        | 2                | Heaviest glass (special cases)                 |
| 26px        | 2                | Variant primary                                |
| 24px        | 2                | Variant secondary                              |
| 22px        | 2                | Variant secondary                              |
| 16px        | 2                | Light glass / `--bd-glass-blur` token value    |
| 18px        | 1                | Variant                                        |
| 14px        | 1                | Light variant                                  |
| 10px        | 2                | Lightest glass                                 |

### §8.2 Blur depth taxonomy

Three primary tiers:
- **Heavy depth (28-32px):** primary glass surfaces (cards, panels)
- **Medium depth (16-26px):** secondary glass + map UI
- **Light depth (10-14px):** subtle / mobile-optimized glass

The `--bd-glass-blur: 16px` token represents the medium tier.
The other 7 radii are inline values.

### §8.3 Pre-extraction prep observation

Same pattern as cadence timing (§3.3) — 1 named token + multiple
inline values. Pre-extraction prep: tokenize the 3-tier blur
hierarchy explicitly (`--bd-blur-heavy`, `--bd-blur-medium`,
`--bd-blur-light`).

---

## §9 — Light-vs-dark emotional contrast

### §9.1 Dark-mode override mechanism

Per Pass 276 §2.5, theme.css defines:

```css
@custom-variant dark (&:is(.dark *));
```

Tailwind v4 custom variant. Class-based dark mode triggered by
ancestor `.dark` selector.

### §9.2 Dark-variant emotional class blocks

Per Pass 280 mechanical count: **19 dark-variant blocks** for
atmospheric/emotional classes (`.dark .bd-dashboard-atmosphere`,
`.dark .bd-landing-section`, `.dark .bd-glass-card`,
`.dark .bd-bloom-atmosphere`, `.dark .bd-liquid-gold`,
`.dark .bd-pin-pulse`, etc.).

### §9.3 Light-vs-dark cinematic contrast

Light mode and dark mode are not just color-flipped. Each carries
a different emotional register:

- **Light mode:** cool misty blue-gray canvas + warm cream-gold
  hero lamp light + warm pop tiles (per CLAUDE.md §7 Light-Mode
  Surface Rule)
- **Dark mode:** royal blue deep ocean + premium gold lamp trim
  (Direction-B Amber-Lit Garage register for warm sections)

The 19 dark-variant blocks encode the dark-mode emotional
contrast as overrides on top of the light-mode base. Both modes
share class names; only values differ.

### §9.4 Preservation criticality

Per CLAUDE.md §7 + LAW_PROJECT_RULES.md "Light-Mode Surface Rule"
+ "Premium Gold Palette" — owner-approved baseline locked
2026-05-03. Specific forbidden values explicitly enumerated:
- Forbidden halos: `rgba(220, 165, 90)` (must not return)
- Forbidden insets: `rgba(254, 248, 220)` (must not return)
- Forbidden trim: `rgba(160, 95, 25)` (must not return)

**Light-vs-dark emotional contrast is LAW-protected.** Pass 280
inventories under existing canon; extraction must preserve the
locked palette.

---

## §10 — Reduced-motion preservation contract

### §10.1 Single-block remediation in animations.css

`src/styles/animations.css:490-528` (Pass 56, 2026-05-07) adds a
single `@media (prefers-reduced-motion: reduce)` block covering:
- 19 explicit `.animate-*` classes (every keyframe consumer)
- 4 explicit `.scroll-animate*` classes
- `.bd-tile-fade` (Pass 93 tile cross-fade)

Pass 56 file header (animations.css:479-490): "LAW_ANIMATION_AND_ATMOSPHERE.md
§3 mandatory pattern path 1 ... discovered this file shipped 24
keyframes + 27 utility classes with ZERO guards since inception.
Single additive block neutralizes all consumers. Authored to
mirror the existing theme.css pattern."

### §10.2 Reduced-motion guards in theme.css

Per file-header reference list: lines 689, 772, 782, 1142, 1210,
1320, 1353, 2134, 3724, 4393, 4473, 4544, 4583. Pass 276 §2.5
counted 10 `prefers-reduced-motion` blocks; the file header lists
13 — Pass 280 confirms ~10-13 guards in theme.css plus the
canonical animations.css block.

### §10.3 Total reduced-motion contract surface

| Location          | Pattern                                | Coverage        |
| ----------------- | -------------------------------------- | --------------- |
| animations.css    | Single canonical block (Pass 56)        | 24 keyframes + 27 utility classes |
| theme.css         | ~10-13 distributed guards               | Per-class scoped |
| LAW doc           | docs/LAW_ANIMATION_AND_ATMOSPHERE.md §3 | Mandatory contract pattern |

### §10.4 Preservation criticality

Reduced-motion is **WCAG accessibility + LAW-tier doctrine**.
Extraction MUST preserve every guard. Loss of any guard breaks
accessibility for users who rely on reduced-motion.

The single-block pattern in animations.css is the canonical
extraction-friendly form. Pre-extraction prep: confirm every
keyframe + utility class has a reduce-guard before extraction;
no migrations should remove or reorder these guards.

---

## §11 — Continuity-preservation dependency graph

### §11.1 Token → class → component dependency chain

```
Layer 1 — REFERENCE TOKENS (Pass 276):
  --bd-flow-loop-slow / -med / -fast    (3 cadence durations)
  --bd-flow-ease                        (1 canonical easing)
  --bd-glass-blur                       (1 blur tier)
  --bd-glow-subtle / -medium / -strong / -pool  (4 glow tiers)
  --bd-warm-dark-amber-* (8)
  --bd-liquid-gold-* (6)
  --bd-route-blue-*, --bd-royal-blue-*  (5)
  --bd-flow-color-* (4)
  --bd-radius-*, --bd-glass-bg-*, --bd-glass-border-*, --bd-glass-shadow*

Layer 2 — UTILITY CLASSES (Pass 276 §4):
  .bd-glass-* (27 classes — depend on glass tokens)
  .bd-glow (3 classes — depend on --bd-glow-* tokens)
  .bd-pin-pulse (6 — depends on --bd-flow-loop-fast + --bd-flow-ease)
  .bd-bid-card-float (6 — depends on flow tokens)
  .bd-liquid-gold-* (4 — depends on --bd-liquid-gold-* tokens)
  .bd-landing-section-toplamp/bottomwash/cta-glow (12 — landing emotional surface)
  .bd-dashboard-atmosphere (5 — depends on atmosphere tokens)
  .bd-bloom-atmosphere (3)
  .bd-route-line (1 — depends on --bd-route-blue-*)
  .bd-map-contour (2 — depends on --bd-map-contour-*)
  .bd-gold-sheen-hover (1)
  .bd-skip-link (3 — WCAG; LAW-protected)

Layer 3 — KEYFRAMES (Pass 280 §6):
  25 in animations.css + ~9 in theme.css = ~34 keyframes
  Each keyframe is referenced by 1-N utility classes
  Each utility class with animation MUST have reduced-motion guard

Layer 4 — COMPONENTS:
  DashboardAtmosphere (184 lines pure-render — composes 10 layers
    from 8 color families + 20 distinct alphas)
  BrandLogo (74 lines — embeds gradient + lighting; uses no bd-* tokens)
  LandingPage sections (10 BD landing components — consume
    .bd-landing-section-* family)
  Map module components (consume .bd-map-* + .bd-route-line)

Layer 5 — DARK-MODE CONTRAST:
  19 .dark .bd-* override blocks
  Class-based dark mode (.dark ancestor selector)
  LAW-protected palette per CLAUDE.md §7
```

### §11.2 Reduced-motion guard dependency

Every keyframe consumer (any `.bd-*` class with `animation: ...`)
has a corresponding reduced-motion guard. Per Pass 56 (animations.css)
+ ~10-13 distributed guards (theme.css).

**This is the most preservation-critical chain.** Extraction
must preserve guards mechanically. A keyframe extracted without
its guard breaks accessibility.

### §11.3 Provider-order dependency (Pass 278 §7)

Provider mount order in App.tsx:
```
ClerkProvider → MapSessionProvider → AppearanceModeProvider → NotificationProvider
```

`AppearanceModeProvider` reads `bidondent.appearance-mode`
localStorage (Pass 274 §3.2) which determines `isLightAppearance`
flag passed to DashboardAtmosphere. **Provider order affects
emotional rendering hydration.** Mount AppearanceModeProvider
late → atmospheric layers paint with default appearance briefly
before resolving.

### §11.4 Cascade-order dependency (theme.css §2.2)

Two intentional `:root` blocks (theme.css lines 895 + 2922).
Per Pass 276 §2.2 inline comment: "dashboard tokens land after
glass tokens so a later override is possible." Merging breaks
cascade intent.

### §11.5 Dependency summary

Five preservation-critical dependency chains:

1. **Token → class → keyframe → component** (visual + motion identity)
2. **Reduced-motion guards → keyframes** (LAW-protected accessibility)
3. **Dark-mode contrast → 19 override blocks → ancestor selector** (LAW-protected palette)
4. **Provider-order → appearance-mode hydration → atmospheric rendering** (continuity)
5. **Cascade-order :root blocks → token-override semantics** (file-internal architecture)

---

## §12 — Sequencing implications

### §12.1 RISK 1 (HIGH) — reduced-motion guards must be preserved mechanically

LAW-tier accessibility contract. Extraction script must verify every keyframe consumer has a guard before extraction proceeds. Pre-extraction prep: audit script that lists every `.bd-*` class with `animation:` property and confirms a corresponding reduce-guard exists.

### §12.2 RISK 2 (MEDIUM) — cadence + easing tokens are platform-grade-shape; values are identity

The 3 loop tokens + 1 easing token (§3.1 + §4.1) have generic
shape (slow/medium/fast taxonomy + canonical curve) but BD-tuned
values. Pre-extraction prep: tokenize the ~14 inline durations
+ 4 inline easings into named tokens; the tokens themselves
become a platform-grade-shape contract; the values stay BD identity.

### §12.3 RISK 3 (HIGH) — DashboardAtmosphere 10-layer composition encodes emotional behavior

184 lines. 10 layers. 20 distinct alphas. 8 color families.
Cannot flatten or simplify without breaking emotional continuity.
Pass 277 §4.8 noted this is single-prop slot-ready. Pass 280
confirms: extraction strategy is preserve-as-Tier-B-module-instance,
NOT decompose-into-platform-primitives.

### §12.4 RISK 4 (MEDIUM) — light-vs-dark contrast palette is LAW-locked

Per CLAUDE.md §7 + LAW_PROJECT_RULES.md. Specific forbidden
values explicitly enumerated. Extraction must inherit the locked
palette; substitution forbidden.

### §12.5 RISK 5 (MEDIUM) — provider-order affects emotional hydration

Pass 278 §7 documented App.tsx 4-layer mount hierarchy. Pass 280
adds: AppearanceModeProvider mount-order affects atmospheric
rendering hydration. Provider-order doctrine (Pass 278 §10 step 1)
must include the emotional-hydration consideration.

### §12.6 RISK 6 (LOW) — keyframe reuse across modules is bounded

The 25 keyframes in animations.css cluster as: landing motion (8),
section reveals (5), generic UI (5), atmospheric orb pairs (5),
arrival celebration (1), tile cross-fade (1). Plus theme.css
inline keyframes. Pre-extraction prep: classify each keyframe by
which module owns it (Tier A / Tier B / Tier C). Then move
keyframes with their owner modules.

---

## §13 — Pre-extraction prep recommendation

Step ordering (each requires owner authorization):

1. **Tokenize the ~14 inline cadence durations** into named
   `--bd-cadence-*` tokens. Source edit; mechanical pattern.
2. **Tokenize the 4 inline easings** into named `--bd-ease-*`
   tokens (matches §4.3). Source edit; mechanical.
3. **Tokenize the 3 backdrop-blur tiers** into named `--bd-blur-*`
   tokens (matches §8.3). Source edit; mechanical.
4. **Audit script: every keyframe consumer has a reduce-guard.**
   Output report; no source edits initially. If gaps surface,
   single-block remediation per Pass 56 pattern.
5. **Classify each keyframe by owner module** (Tier A / Tier B /
   Tier C). Add inline comments above keyframes; auditable diff.
   Source edit; doc-only annotations.
6. **THEN** emotional-system extraction is mostly file-moves with
   the cadence + easing + blur tokens as the platform-grade-shape
   contract that BD's identity values populate.

Steps 1-3 are mechanical source edits. Step 4 is read-only audit.
Step 5 is doc-only annotations. Step 6 is the actual extraction
(still gated on owner authorization).

---

## §14 — Cleanliness wins

Per relay #4 + #8:

1. **`LAW_ANIMATION_AND_ATMOSPHERE.md` already exists** (273 lines, 21KB) — emotional-system canon is LAW-tier. Extraction inherits explicit doctrine, not implicit conventions.
2. **Single canonical reduced-motion block** in animations.css covers 24 keyframes + 27 utility classes (Pass 56 single-additive remediation pattern). Mechanically extraction-friendly.
3. **One canonical easing token** (`--bd-flow-ease`) shared by 4 flow-motion classes. Strong cleanliness signal.
4. **Three-tier cadence taxonomy** (slow/medium/fast) with clean semantic boundaries.
5. **Eight-tier blur depth** with clear primary/secondary/light hierarchy.
6. **Four-tier glow scale** (subtle/medium/strong/pool) — explicit ordering.
7. **DashboardAtmosphere is single-prop pure-render** (Pass 277 §4.8) — already slot-shape; no behavioral refactor needed for extraction.
8. **Light-vs-dark contrast is LAW-protected** — palette baseline locked 2026-05-03; specific forbidden values explicitly enumerated. Extraction preservation is mechanical.
9. **25 keyframes in animations.css are file-organized by emotional category** — landing motion / section reveals / generic / orb pairs / arrival / tile fade. Self-documenting structure.
10. **Per-rule WHY-comments preserved** in theme.css per file mandate (lines 26-30: "Per-rule comment preambles INTENTIONALLY KEPT — they document the WHY ... Future audits should NOT trim them"). The file enforces its own historical preservation discipline.

---

## §15 — What this pass DOES NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS, or CLAUDE.md.
- **Does NOT modify `LAW_ANIMATION_AND_ATMOSPHERE.md`** — that doc is the authority; Pass 280 inventories under it.
- Does NOT bootstrap any repo / extract any subsystem / create any package.
- Does NOT tokenize any inline value / refactor any keyframe / modify any guard.
- Does NOT add new owner-decision points (cumulative remains 31).
- Does NOT re-open convergence-discovery lane — every finding fits Pass 271 emotional-architecture concept + Pass 273 emotional-seam category as stable doctrine.
- Does NOT supersede prior platform docs; Pass 280 is the FINAL inventory in the execution-readiness lane.
- Does NOT validate or duplicate runtime-audit lane findings; cross-references only.

---

## §16 — The execution-readiness lane is now COMPLETE

Pass 280 is the final inventory in the lane. The full sequence:

| Pass | Inventory | Surface |
| --- | --- | --- |
| 274 | Vendor / storage / realtime / route registries | runtime-coupling sites |
| 275 | Type-import dependency graph | type-shape coupling |
| 276 | Token ownership map (theme.css) | token + class surfaces |
| 277 | Shell-slot behavioral contract map | behavioral authority |
| 278 | Provider/adapter matrix | runtime authority topology |
| 279 | Capability-vs-identity matrix | synthesis across 6 axes |
| 280 | Emotional-token continuity map | emotional preservation surface |

**Together Passes 274-280 convert Pass 273's qualitative seam
taxonomy into mechanical location data spanning all 6 axes the
framework predicts.**

The execution-readiness lane is mechanically complete. Future
work in this direction would be either:
- Per-subsystem deep dives (e.g., full per-file map of services/
  or hooks/) — incremental value
- Pre-extraction prep source edits — owner-authorized
- Extraction itself — owner-authorized

No new inventory categories are needed. The framework predicts
six axes; six axes are mapped.

---

## §17 — Cross-references

- Pass 279 [`REF_CAPABILITY_VS_IDENTITY_MATRIX_2026-05-09.md`](REF_CAPABILITY_VS_IDENTITY_MATRIX_2026-05-09.md) — synthesis matrix; Pass 280 deepens the emotional-infrastructure axis.
- Pass 278 [`REF_PROVIDER_ADAPTER_MATRIX_2026-05-09.md`](REF_PROVIDER_ADAPTER_MATRIX_2026-05-09.md) — provider topology; Pass 280 §11.3 cross-references emotional-hydration.
- Pass 277 [`REF_SHELL_SLOT_CONTRACT_MAP_2026-05-09.md`](REF_SHELL_SLOT_CONTRACT_MAP_2026-05-09.md) — DashboardAtmosphere classification; Pass 280 §5 + §12.3 deepens.
- Pass 276 [`REF_TOKEN_OWNERSHIP_MAP_2026-05-09.md`](REF_TOKEN_OWNERSHIP_MAP_2026-05-09.md) — token surface; Pass 280 §3 + §4 + §7 + §8 deepens emotional-token portion.
- Pass 274 [`REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md`](REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md) — runtime registries; Pass 280 cross-references for context.
- Pass 273 [`PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md`](PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md) — convergence verdict + 6-seam taxonomy.
- Pass 272 [`PLAN_PLATFORM_CONVERGENCE_TEST_2_2026-05-09.md`](PLAN_PLATFORM_CONVERGENCE_TEST_2_2026-05-09.md) — animations.css emotional-token finding; Pass 280 confirms.
- Pass 271 [`PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md`](PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md) — emotional architecture concept origination; Pass 280 confirms full mechanical realization.
- **`docs/LAW_ANIMATION_AND_ATMOSPHERE.md`** — existing LAW (273 lines); Pass 280 inventories under, does NOT modify.
- `docs/evidence/pass-56-2026-05-07/ANIMATION_KEYFRAME_AUDIT.md` — Pass 56 reduced-motion gap discovery referenced in animations.css:484-489.
- Owner relay 2026-05-09 #11 priority E + parallel runtime-audit lane findings.

---

## §18 — Status

- **Drafted:** 2026-05-09 (Pass 280, Emotional-Token Continuity Map lane).
- **Status:** ACTIVE reference. Mechanical+behavioral inventory — current truth as of 2026-05-09 commit.
- **Authority:** REF. Subordinate to all current LAW docs, especially `LAW_ANIMATION_AND_ATMOSPHERE.md`.
- **Owner approval required:** FALSE for this doc itself. TRUE for any of the §13 step 1-5 source edits.
- **Supersedes:** none.
- **Superseded by:** none.
- **Refines (does not supersede):** Pass 276 §3.2 + §4.2 emotional-token portion; Pass 277 §4.8 DashboardAtmosphere classification.

**Forward triggers (any one re-opens an inventory or prep pass):**

1. Owner authorizes any of the §13 step 1-5 pre-extraction prep tasks → source-edit work begins.
2. Owner ratifies any of the 31 cumulative decision points → relevant draft platform-LAW / extraction plan becomes authorable.
3. Real runtime defect surfaces (independent lane).
4. Owner provides Stacey answers (Pass 268 §8).
5. Owner authorizes extraction Phase 0 (pure-capability ports per Pass 279 §9.1).
6. Owner authorizes a deep-dive into a specific subsystem not yet fully classified (e.g., full per-file `services/` mapping).

Until one fires: dormant.

The execution-readiness lane is now mechanically complete. The
emotional-system continuity map (Pass 280) is the seventh and
final inventory. Together with Passes 274-279 it converts Pass
273's qualitative seam taxonomy into mechanical location data
across all 6 axes.

The most actionable extraction-risk reduction surfaced: §13 step
4 (audit script verifying every keyframe has a reduce-guard).
The most consequential preservation insight: §12.3 DashboardAtmosphere
10-layer composition cannot be flattened without identity
erosion — extraction strategy is preserve-as-Tier-B-module-instance.

The repo's emotional-system canon is mature, LAW-protected, and
mechanically extractable as a coherent preservation surface. The
framework predicted it; the inventory data confirmed it; the
continuity map specifies what extraction must preserve.
