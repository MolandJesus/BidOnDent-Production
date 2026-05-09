---
status: ACTIVE
authority: REF
scope: token-ownership-map-theme-css
canonical_source_of_truth: REF_TOKEN_OWNERSHIP_MAP_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: false
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 276 mechanical inventory of theme.css 4,913 lines under owner relay 2026-05-09 #7 priority A (largest unresolved hidden-coupling surface). Headline finding: Pass 269 §3 recommended 3-tier token architecture (reference / system / component) is NOT in use — current state is FLAT single-namespace `--bd-*` with 199 tokens + 208 utility classes + 1,150 inline rgba() literals. No reference-tier exists; raw color values are scattered across both token definitions AND component-level inline styles. Asymmetric blast-radius: tokens have 10 TSX usages (low-blast rename), classes have 398 TSX className references (high-blast rename). Two intentional :root blocks at lines 895 + 2922 (deliberate topical separation per inline comment). Three token-family clusters by tier potential: (1) platform-grade-shape primitives (--bd-glass-*, --bd-glow-*, --bd-radius-*, --bd-button-*, --bd-skip-link-*) — generic shape + BD-named values; (2) emotional / identity tokens (--bd-warm-dark-amber-*, --bd-liquid-gold-*, --bd-route-blue, --bd-royal-blue, --bd-flow-loop-*) — Pass 271 emotional-seam category candidates for `@platform/atmosphere` Tier B optional module; (3) BD-domain-named tokens (--bd-dashboard-*, --bd-report-*) — Tier C app-private. Class-family parallel: ~27 .bd-glass-* + .bd-button-* + .bd-skip-link-* are platform-grade-shape; ~94 .bd-dashboard-* + .bd-report-* + .bd-bid-card-* + .bd-shell-header-* are BD-coupled; ~17 .bd-landing-* + .bd-pin-pulse + .bd-route-line are emotional canon. Reduced-motion contract HONORED at 10 media-query sites (Pass 273 LAW pattern is mechanically present). Tier A subsystems (ui/, atmosphere/, features/) confirmed CLEAN of bd-* className usage — adding to Pass 275's clean type-import finding. Three sequencing risks: (HIGH) inline rgba() lift before tier separation; (HIGH) class-namespace 398-site rename; (MEDIUM) BD identity baked into 50+ token names. Six-step pre-extraction prep recommended. Framework HOLDS — every finding fits Pass 271 emotional-seam + Pass 273 token-seam categories. ZERO new contamination categories. ZERO new owner-decision points.
last_updated: 2026-05-09
---

# Pass 276 — Token Ownership Map (theme.css)

> **Tier:** REF. Current truth about the codebase's token surface.
> **Authority:** Owner relay 2026-05-09 #7 priority A
> ("Token ownership map (theme.css 4,913 lines). Now likely the
> largest unresolved hidden-coupling surface.").
> Discovery lane CLOSED; execution-readiness lane OPEN; Pass 275
> shipped type-graph; Pass 276 ships token-graph.
>
> **What this doc is:** mechanical inventory of where tokens
> live, how they are organized, what tier each family belongs
> to, and where TSX consumers couple to them.
>
> **What this doc is NOT:**
> - LAW. Inventory data, not doctrine.
> - A re-test of convergence. Framework used as stable doctrine.
> - An extraction plan. Inventory is input, not authority.
> - Exhaustive line-by-line audit of theme.css 4,913 lines.
>   Family-pattern coverage by token / class prefix is sufficient
>   to surface sequencing risks.
> - A token rename. No token / class identifier changes.
> - A new decision-point generator. Pass 276 adds zero owner
>   decisions to cumulative 31.

---

## §1 — Mission

Per relay #7 priority A:

> "Token ownership map (theme.css 4,913 lines). Now likely the
> largest unresolved hidden-coupling surface. theme.css is likely
> hiding the most subtle contamination."

Token coupling is Pass 273 §6.1 token-seam category. Pass 276
quantifies it mechanically: which tokens exist, how they cluster
by tier potential, and where TSX components couple to them.

The questions this pass answers:
1. Does the 3-tier token architecture (Pass 269 §3) exist in
   the current codebase?
2. What is the class / token / hex-literal / rgba()-literal
   surface size?
3. Which token + class families belong to which extraction tier
   (A platform-core / B optional module / C app-private)?
4. What's the TSX blast-radius of token rename vs class rename?
5. What pre-extraction prep would prevent partial-extraction
   instability?

---

## §2 — theme.css structural breakdown

### §2.1 File scale

```
src/styles/theme.css       4,913 lines
src/styles/animations.css    553 lines  (audited Pass 272 §10)
src/styles/index.css            ?       (entry point)
src/styles/tailwind.css         ?       (Tailwind v4 config)
src/styles/fonts.css            ?       (font face declarations)
```

The entire token + utility-class definition surface lives in two
files: theme.css + animations.css. Pass 272 §10 audited
animations.css; Pass 276 audits theme.css.

### §2.2 Two intentional :root blocks

```
Line 895 :root {  ── glass / glow / radii / atmospheric / motion / report tokens
Line 2922 :root { ── dashboard-surface tokens
```

The line 2918 inline comment makes the architecture explicit:

> "Cascade order is structural: dashboard tokens land after glass
> tokens so a later override is possible. Merging would force one
> giant `:root` and break the topical separation that the rest
> of the codebase navigates by."

This is **deliberate organization**, not legacy drift. Worth
preserving when the file extracts.

### §2.3 Section markers (file's own Pass index)

The file opens (lines 1-31) with a self-documenting Pass index
listing 15 visual-canon passes (A through O, 2026-05-04 to
2026-05-05) with commit hashes + KI references. Each section has
WHY-comments documenting hard-stop rationale ("ruled-out
hypotheses", "owner feedback ... still look like light is
stamped on"). The file mandates these comments be preserved:

> "Per-rule comment preambles INTENTIONALLY KEPT — they document
> the WHY (root-cause analysis, ruled-out hypotheses, hard-stop
> rationale) that no single-line index reference can convey.
> Future audits should NOT trim them."

This is a maturity signal. The file's own discipline matches the
governance discipline of the platform-extraction work.

### §2.4 Surface counts

| Category                       | Count |
| ------------------------------ | ----- |
| CSS custom properties (`--bd-*`) | **199** |
| Utility classes (`.bd-*`)      | **208** |
| Hex color literals (`#XXXXXX`) | 85    |
| `rgba()` literals              | **1,150** |
| `prefers-reduced-motion` blocks | 10   |
| `.dark .bd-*` override blocks  | 12+   |

The **1,150 rgba() literals** is the headline finding: most
colors in theme.css are NOT routed through tokens. They are
inline values. (See §6 for tier implications.)

### §2.5 Dark-mode mechanism

Line 147: `@custom-variant dark (&:is(.dark *));`

Tailwind v4 custom variant. Class-based dark mode triggered by
ancestor `.dark` selector. Used by 12+ `.dark .bd-*` override
blocks throughout theme.css.

This is **platform-grade-shape**. Apps could use the same
mechanism with their own ancestor class.

---

## §3 — Token-family taxonomy

199 tokens cluster into the following families. Tier classification
column applies Pass 271 + 273 framework.

### §3.1 Platform-grade-shape token families (Tier A candidates)

| Family                  | Count | Tier signal                                       |
| ----------------------- | ----- | ------------------------------------------------- |
| `--bd-glass-*`          | ~12   | Generic glass primitive (blur, bg, border, shadow) |
| `--bd-glow-*`           | 8     | Generic glow scale (subtle/medium/strong/pool)    |
| `--bd-radius-*`         | 3     | Generic radius scale (panel/card/badge)           |

**Total Tier A candidates: ~23 tokens.** Generic in shape;
BD-named values inside. Platform-core extraction would rename
prefix and parameterize values.

### §3.2 Emotional / identity token families (Tier B candidates — `@platform/atmosphere`)

| Family                       | Count | Tier signal                                                                    |
| ---------------------------- | ----- | ------------------------------------------------------------------------------ |
| `--bd-warm-dark-amber-*`     | 8     | Direction-B Amber-Lit Garage register (BD identity, Tier B emotional candidate) |
| `--bd-liquid-gold-*`         | 6     | "Liquid Map Intelligence" landing motion canon (BD identity)                   |
| `--bd-route-blue-*`          | 3     | BD product-action color identity                                               |
| `--bd-royal-blue-*`          | 2     | BD brand color                                                                 |
| `--bd-flow-loop-*` (timing)  | 3     | BD motion durations (28s / 18s / 4.2s)                                         |
| `--bd-flow-color-*`          | 4     | BD motion-color identity                                                       |
| `--bd-map-contour-*`         | 2     | Map module aesthetic                                                           |

**Total emotional-tier candidates: ~28 tokens.** Pass 271 §6.2
classified Jeffrey atmospheric layering as Tier B optional module
candidate. These tokens are its concrete realization.

Pass 273 §6 emotional-seam category mapping: these tokens are the
"emotional primitives" that the platform extraction would either
(a) generalize via token-contract slots, or (b) keep BD-private as
"BD-flavored Tier B atmospheric module instance."

### §3.3 BD-domain token families (Tier C app-private)

| Family                       | Count | Tier signal                              |
| ---------------------------- | ----- | ---------------------------------------- |
| `--bd-dashboard-*` (all sub-families) | ~34   | BD dashboard surface (panel/section/chip/note/secondary/ghost/atmosphere) |
| `--bd-report-*` (all sub-families)    | ~50   | BD damage-report wizard (text/shell/panel/input/choice/pill/divider/note/secondary) |
| `--bd-shell-header-*`        | (in classes; tokens may piggyback dashboard) | BD shell context |

**Total Tier C: ~84 tokens.** Half the token surface (84/199 =
42%) is BD-domain.

### §3.4 Token-tier ratio summary

| Tier            | Count    | % of 199 |
| --------------- | -------- | -------- |
| A (platform)    | ~23      | 12%      |
| B (atmosphere)  | ~28      | 14%      |
| C (BD-private)  | ~84      | 42%      |
| Mixed / unclassified | ~64 | 32%      |

**The "mixed/unclassified" 32% is the audit cost** of the absent
3-tier architecture — without explicit reference-layer
separation, every additional token requires per-symbol inspection
to classify.

---

## §4 — Utility-class family taxonomy

208 classes cluster as follows.

### §4.1 Platform-grade-shape class families

| Family                  | Count | Tier signal                                       |
| ----------------------- | ----- | ------------------------------------------------- |
| `.bd-glass-card*`       | 14    | Glass card primitive + variants                   |
| `.bd-glass-control*`    | 13    | Glass button / control primitive                  |
| `.bd-button-*`          | 4     | Button variants (warn etc.)                       |
| `.bd-skip-link-*`       | 3     | WCAG accessibility primitive                      |
| `.bd-glass-panel`       | 1     | Generic glass panel                               |
| `.bd-glass-badge`       | 1     | Generic glass badge                               |
| `.bd-glass-floating`    | 1     | Generic floating layer                            |
| `.bd-section-eyebrow`   | 1     | Generic section heading style                     |

**Total Tier A class candidates: ~38 classes.**

### §4.2 Emotional / identity class families (Tier B candidates)

| Family                            | Count | Tier signal                          |
| --------------------------------- | ----- | ------------------------------------ |
| `.bd-pin-pulse*`                  | 6     | BD map-pin animation canon           |
| `.bd-bid-card-float*`             | 6     | BD bid-card float motion             |
| `.bd-bloom-atmosphere*`           | 3     | BD bloom motion                      |
| `.bd-liquid-gold-*`               | 4     | BD liquid-gold motion                |
| `.bd-landing-section-toplamp*`    | 5     | BD landing top-cast lamp lighting    |
| `.bd-landing-section-bottomwash*` | 5     | BD landing bottom seam-fade          |
| `.bd-landing-cta-glow*`           | 2     | BD landing CTA glow                  |
| `.bd-landing-seam-fade`           | 1     | BD landing section-transition fade   |
| `.bd-route-line`                  | 1     | BD map route line styling            |
| `.bd-map-contour*`                | 2     | Map contour (Tier B map module)      |
| `.bd-map-canvas-sheen`            | 1     | BD map canvas sheen                  |
| `.bd-gold-sheen-hover`            | 1     | BD gold sheen hover                  |
| `.bd-dashboard-atmosphere*`       | 5     | BD dashboard atmospheric layer       |

**Total Tier B class candidates: ~42 classes.**

### §4.3 BD-domain class families (Tier C app-private)

| Family                       | Count | Tier signal                            |
| ---------------------------- | ----- | -------------------------------------- |
| `.bd-dashboard-*` (sub-families) | ~59 | dashboard surface                       |
| `.bd-report-*` (sub-families)    | ~35 | damage-report wizard                    |
| `.bd-shell-header-*`         | 12    | shell header (BD context)               |
| `.bd-landing-section-*`      | 10    | landing section (BD identity)          |
| `.bd-bid-card-*`             | 6     | BD bid-card UI                          |
| `.bd-notice--warn`           | 1     | (platform-shape; warn variant generic) |
| `.bd-banner--warn-prominent` | 1     | (platform-shape; warn variant generic) |
| `.bd-status--warn`           | 1     | (platform-shape; warn variant generic) |
| `.bd-map-tooltip`            | 1     | Map tooltip (Tier B map module)        |

**Total Tier C: ~125 classes.** 125/208 = 60% of class surface
is BD-domain.

### §4.4 Class-tier ratio

| Tier            | Count    | % of 208 |
| --------------- | -------- | -------- |
| A (platform)    | ~38      | 18%      |
| B (atmosphere/map) | ~42   | 20%      |
| C (BD-private)  | ~125     | 60%      |
| Unclassified    | ~3       | 2%       |

Class taxonomy is **more clearly tier-separable than token
taxonomy** because class names tend to encode their domain
(e.g., `.bd-report-progress` is unambiguously BD; `.bd-glass-card`
is unambiguously platform-shape). Tokens like `--bd-glass-bg-light`
suggest platform-shape but their values are BD-tuned.

---

## §5 — TSX consumer surface

### §5.1 Class consumption (HIGH blast radius)

```
className references to bd-* classes in TSX/TS files: 398
```

Top-consuming files:

| File                                                    | bd-* className refs |
| ------------------------------------------------------- | ------------------- |
| `components/landing/HeroSection.tsx`                    | 17                  |
| `components/reports/ReportDetailScreen.tsx`             | 15                  |
| `components/insurer/InsurerOnboarding.tsx`              | 15                  |
| `components/insurer/InsurerNewClaimScreen.tsx`          | 15                  |
| `components/reports/CompetitorAnalysisScreen.tsx`       | 14                  |
| `components/dashboard/CustomerMapWidget.tsx`            | 14                  |
| `components/codelayer/report/StepVehicleInfo.tsx`       | 13                  |
| `components/codelayer/BidCardArticle.tsx`               | 13                  |
| `components/reports/ReportsListScreen.tsx`              | 12                  |
| `components/shop/ShopOnboardingStep1.tsx`               | 10                  |

All 10 top consumers are **Tier C BD-domain components** (landing,
reports, insurer, dashboard, codelayer, shop). Pass 270 §6.2
classifies them all Tier C — high bd-* usage is correct for layer.

### §5.2 Token consumption (LOW blast radius)

```
var(--bd-*) references in TSX/TS files: 10
```

| File                                              | Token refs                               |
| ------------------------------------------------- | ---------------------------------------- |
| `components/landing/BenefitsSection.tsx`          | 5 — `--bd-warm-dark-amber-*`             |
| `components/landing/TrustStatsSection.tsx`        | 4 — `--bd-warm-dark-amber-*`             |
| `components/dashboard/DashboardCoveragePanel.tsx` | 1 — `--bd-royal-blue` (chip text color)  |

All 10 token TSX usages are **emotional / identity tokens used
at runtime for inline-styled atmospheric elements.** Tier B
emotional category. None of the platform-shape tokens
(`--bd-glass-*`, `--bd-glow-*`, `--bd-radius-*`) are referenced
from TSX — they're cascade-only.

### §5.3 Asymmetric blast-radius finding

**Token rename:** 10 TSX sites + N CSS sites (in theme.css).
Mechanical grep+replace; bounded.

**Class rename:** 398 TSX sites + N CSS sites. Mechanical
grep+replace, but the surface is 40× larger.

**Sequencing implication:** **Token rename is a smaller, safer
operation than class rename.** Pre-extraction prep should
sequence token-tier-separation BEFORE class-namespace migration.
Token migration can land first; class migration is a separate
authorized pass.

### §5.4 Tier A subsystem class cleanliness

Pass 270 §6.2 estimated `components/ui/` is ~95% clean (only
NotificationToast had `bd-*`). Pass 275 confirmed `components/ui/`
+ `components/atmosphere/` + `features/` are ZERO BD-domain TYPE
references.

For className references, the 398 sites cluster in Tier C
components; spot-checking the top-10 list shows ZERO Tier A
subsystem files in the top consumers. The clean-boundary signal
extends from types to classes.

---

## §6 — Tier architecture: current vs Pass 269 recommendation

### §6.1 Pass 269 §3 recommended (3-tier architecture)

```
Tier 1 (Reference) — raw values:
  --color-blue-500: hsl(217, 91%, 60%);
  --space-4: 1rem;
  --duration-fast: 200ms;

Tier 2 (System) — semantic mapping:
  --color-primary: var(--color-blue-500);
  --color-surface: var(--color-blue-50);

Tier 3 (Component) — slot-named:
  --bd-button-bg: var(--color-primary);
  --bd-card-padding: var(--space-4);
```

Apps redefine Tier 2 mapping to brand-recolor without touching
Tier 3 component slots. Stacey gets her own `--color-primary`
binding while reusing all `--bd-*` component contracts (renamed
to `--platform-*` after extraction).

### §6.2 Current state (1-tier flat)

```
Single :root block (mostly):
  --bd-glass-blur: 16px;                              (Tier 1 raw)
  --bd-glass-bg-light: rgba(240, 247, 255, 0.72);     (Tier 1 raw rgba)
  --bd-glass-border-light: rgba(191, 219, 254, 0.55); (Tier 1 raw rgba)
  --bd-radius-panel: 1rem;                            (Tier 1 raw)
  --bd-royal-blue-strong: #1e40af;                    (Tier 1 raw hex)
  --bd-warm-dark-amber-start: #1a0c06;                (Tier 1 raw hex; BD identity)
  --bd-flow-loop-slow: 28s;                           (Tier 1 raw duration; BD identity)
```

Plus 1,150 inline `rgba()` literals scattered across class
definitions (NOT routed through any token).

**There is no Tier 2 or Tier 3. The token layer IS the reference
layer, mixed with semantic intent in the same names.**

### §6.3 Implication for extraction

Pass 269 §3's 3-tier recommendation cannot be applied as a
post-extraction concern. It must be a PRE-extraction prep step,
or the extraction inherits the flat shape.

Two viable strategies:

**Strategy A (recommended) — introduce Tier 1 reference layer first.**

Add a new `:root` block at the top of theme.css containing raw
reference tokens (`--color-blue-500`, `--space-4`,
`--duration-fast`, etc.). DON'T re-route existing `--bd-*` tokens
through them yet. Future extraction passes lift inline rgba()
literals into Tier 1, then re-route Tier 3 (`--bd-*`) through
Tier 1 / Tier 2.

**Strategy B — keep flat tokens BD-private; extract platform with
its own native Tier 1 + Tier 2.**

Platform-core ships `--platform-color-*` reference layer.
`@bd-app/theme` redefines `--bd-*` from platform-core base (or
keeps current flat shape; both compile). The extraction inherits
flat BD shape but doesn't propagate it; platform-core stays clean.

Both strategies are owner-decision-grade. Pass 276 surfaces the
choice; ratification gates which strategy applies.

### §6.4 The 1,150 rgba() literal sub-finding

Even under Strategy B, the 1,150 inline rgba() literals couple
specific colors to specific class definitions. After extraction:

- Extracted `.platform-glass-*` classes still contain inline
  rgba() values from the BD palette.
- Stacey's atmospheric work would either redefine the classes
  (lots of duplication) or accept BD-tuned colors.

Pre-extraction prep option: **lift the most-repeated rgba()
literals into named tokens.** The top-N literals (e.g.,
`rgba(96, 165, 250, ...)` for BD blue, `rgba(196, 144, 65, ...)`
for BD gold) probably account for >50% of the 1,150 occurrences.
Lifting these into `--bd-blue-base` / `--bd-gold-base` reference
tokens reduces the inline-color surface dramatically.

This is the most leverage-dense pre-extraction prep work
remaining.

---

## §7 — Sequencing risks

### §7.1 RISK 1 (HIGH) — class-namespace migration is 398-site refactor

Renaming `.bd-*` → `.platform-*` (or any class-prefix change)
touches 398 TSX className references plus 208 class definitions
in theme.css. Mechanical grep+replace IF naming patterns are
regular (which they appear to be — every class is `.bd-` prefixed,
no exceptions). Pre-extraction prep: confirm pattern regularity;
script the rename; dry-run; execute as a single authorized pass.

### §7.2 RISK 2 (HIGH) — flat token architecture means tier-separation must precede platform extraction

Pass 269 §3's 3-tier recommendation isn't deferrable. Without it,
extracting a platform-core token surface inherits the BD-tuned
flat shape; Stacey's app cannot redefine semantics without
touching component-tier slots.

Pre-extraction prep: introduce Tier 1 reference layer at
theme.css top OR commit to Strategy B (platform-core defines its
own Tier 1; BD app stays flat).

### §7.3 RISK 3 (MEDIUM) — BD identity baked into 50+ token names

50+ tokens have BD-identity-named families:
- `--bd-warm-dark-amber-*` (8)
- `--bd-liquid-gold-*` (6)
- `--bd-flow-loop-*`, `--bd-flow-color-*` (7)
- `--bd-route-blue-*`, `--bd-royal-blue-*` (5)
- `--bd-dashboard-*` (~34)
- `--bd-report-*` (~50)

These cannot rename to `--platform-*` even semantically — the
identity (Direction-B amber, liquid gold, BD royal blue) is part
of the token meaning. The extraction strategy is:

- Tier A platform-shape (`--bd-glass-*`, `--bd-glow-*`,
  `--bd-radius-*`, ~23 tokens) → rename to `--platform-*`.
- Tier B emotional / atmospheric (`--bd-warm-dark-amber-*`,
  `--bd-liquid-gold-*`, ~28 tokens) → keep BD identity; ship as
  `@bd-app/atmosphere` Tier B optional module's token contract.
- Tier C BD-domain (`--bd-dashboard-*`, `--bd-report-*`, ~84
  tokens) → stays in BD app private.

This is a per-family decision, not a global rename.

### §7.4 RISK 4 (MEDIUM) — 1,150 inline rgba() literals not extractable as tokens

Inline values in class definitions cannot be externally
overridden. Stacey's app cannot recolor `.bd-glass-card` without
duplicating the entire class. Pre-extraction prep: lift the
top-N most-repeated rgba() values into reference tokens. Reduces
inline surface from 1,150 to ~200-400.

### §7.5 RISK 5 (LOW) — two intentional :root blocks must not be merged

Line 2918 inline comment forbids merging the two :root blocks.
The dashboard tokens land after glass tokens for cascade-override
intent. Pre-extraction prep: any extraction-script that
flattens or relocates :root blocks must preserve the two-block
structure.

### §7.6 RISK 6 (LOW) — reduced-motion contract is 10 sites

10 `@media (prefers-reduced-motion: reduce)` blocks honor Pass
273 §6 LAW pattern. Extraction must preserve all 10. (This is
not actually a risk — it's a cleanliness signal that the LAW is
already mechanically present in the file.)

---

## §8 — Pre-extraction prep recommendation

Step ordering (lowest blast first, owner authorization required for each):

1. **Lift top-N inline rgba() literals into named reference tokens.**
   Largest leverage; reduces ~1,150 → ~200-400. Source edit;
   automated pattern (single-color literals are mechanically
   identifiable). Owner-authorize as one pass.
2. **Decide Strategy A (introduce Tier 1) vs Strategy B (platform
   defines its own Tier 1; BD stays flat).** Owner decision; not
   a code change.
3. **(If Strategy A)** Introduce Tier 1 reference layer at
   theme.css top. Don't re-route Tier 3 yet. Source edit.
4. **Per-family tier-classification commit.** Add inline
   comments above each token family declaring its tier
   (`/* Tier A platform-shape — rename to --platform-glass-* */`).
   No rename yet; just classification. Source edit; auditable
   diff.
5. **Class-namespace migration script + dry-run.** 398 TSX +
   208 CSS sites. Mechanical. Owner-authorize as one pass.
6. **THEN** extraction is mostly file-moves (theme.css
   splits into platform-core/, atmosphere-bd/, app-bd/).

Steps 1, 3, 4, 5 each require owner authorization (source edits).

---

## §9 — Cleanliness wins (per relay #8 directive)

Per relay 2026-05-09 #8 ("treat cleanliness proofs as equally
valuable as problem discoveries"):

1. **Reduced-motion contract HONORED.** 10 `@media (prefers-reduced-motion: reduce)` blocks in theme.css. Pass 273's LAW pattern is mechanically present. Extraction inherits the LAW behavior automatically.
2. **Two intentional :root blocks DOCUMENTED.** Line 2918 inline comment makes architectural intent explicit. Future agents won't accidentally merge them.
3. **Pass index in file header.** 31 lines of self-documentation listing every visual-canon pass with commit + KI references. The file knows its own history.
4. **Tier A subsystem class cleanliness.** Top-10 bd-* className-using files are all Tier C BD-domain components. Zero Tier A subsystems in the top consumers.
5. **Token TSX coupling is LOW.** Only 10 var(--bd-*) sites in TSX. Most tokens cascade-only. Token migration is contained.
6. **Class names are tier-separable.** Class taxonomy is more cleanly tier-classifiable than token taxonomy because class names encode domain (`.bd-report-*` is unambiguously BD; `.bd-glass-card` is unambiguously platform-shape).
7. **`--bd-glass-*` + `--bd-glow-*` + `--bd-button-*` + `--bd-skip-link-*` families are platform-grade-shape.** ~38 classes ready for direct port to `@platform-core/ui` after rename.
8. **Pass 271 + 273 emotional-seam category VALIDATED in token data.** `--bd-warm-dark-amber-*` (Direction B), `--bd-liquid-gold-*` (landing motion), `--bd-flow-loop-*` (motion durations) are concrete realizations of Pass 271 emotional architecture concept. The category is mechanically present, not theoretical.

---

## §10 — What this pass DOES NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS, or CLAUDE.md.
- Does NOT bootstrap any repo / extract any subsystem / create any package.
- Does NOT split theme.css / lift any rgba() literal / introduce Tier 1 reference layer / rename any class or token. Those are §8 step 1-5 pre-extraction prep tasks requiring owner authorization.
- Does NOT add new owner-decision points (cumulative remains 31).
- Does NOT re-open convergence-discovery lane — every finding fits Pass 271 emotional-seam + Pass 273 token-seam categories as stable doctrine.
- Does NOT supersede prior platform docs.

---

## §11 — What's deferred

Per relay #7 priority order, Pass 276 ships only Priority A. Four other
inventories remain:

- **B. Shell-slot contract mapping** — qualitative analysis of which shell components need which slots (Pass 271 surfaced; mechanical mapping deferred)
- **C. Provider/adapter matrix** — partial overlap with Pass 274 §2 vendor-binding registry; would extend to non-vendor providers (e.g., MapSessionProvider)
- **D. Capability-vs-identity matrix** — interpretive synthesis; better after mechanical maps exist
- **E. Emotional-token inventory** — would deepen Pass 276 §3.2 + §4.2 emotional-tier work; deferred for own pass

Plus from Pass 274 §8 / Pass 275 §10:
- Subsystem boundary inventory

Each is its own future pass if/when authorized. Pass 276
intentionally ships only Priority A to maintain single-doc-per-pass
discipline.

---

## §12 — Cross-references

- Pass 275 [`REF_TYPE_IMPORT_DEPENDENCY_GRAPH_2026-05-09.md`](REF_TYPE_IMPORT_DEPENDENCY_GRAPH_2026-05-09.md) — type-graph counterpart; Pass 276 confirms Pass 275's Tier A cleanliness extends from types to classes.
- Pass 274 [`REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md`](REF_EXTRACTION_READINESS_INVENTORY_2026-05-09.md) — vendor / storage / realtime / route inventories.
- Pass 273 [`PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md`](PLAN_PLATFORM_CONVERGENCE_TEST_3_2026-05-09.md) — convergence verdict; framework Pass 276 uses as doctrine. §6.1 token-seam category.
- Pass 272 [`PLAN_PLATFORM_CONVERGENCE_TEST_2_2026-05-09.md`](PLAN_PLATFORM_CONVERGENCE_TEST_2_2026-05-09.md) — animations.css emotional-token finding; Pass 276 §3.2 extends to theme.css.
- Pass 271 [`PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md`](PLAN_PLATFORM_SHELL_STABILITY_TEST_2026-05-09.md) — emotional architecture concept; Pass 276 confirms mechanical realization.
- Pass 270 [`PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md`](PLAN_PLATFORM_CONTAMINATION_AUDIT_2026-05-09.md) — initial 196-token estimate (actual 199); 208 utility class estimate (actual 208); 4,913-line theme.css.
- Pass 269 [`PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md`](PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md) — §3 3-tier token architecture recommendation; §8 step 2 strategy decision.
- Owner relay 2026-05-09 #7 priority A directive.

---

## §13 — Status

- **Drafted:** 2026-05-09 (Pass 276, Token Ownership Map lane).
- **Status:** ACTIVE reference. Mechanical inventory — current truth as of 2026-05-09 commit.
- **Authority:** REF. Subordinate to all current LAW docs.
- **Owner approval required:** FALSE for this doc itself. TRUE for any of the §8 step 1-5 pre-extraction prep source edits (rgba() lift, Tier 1 introduction, family classification comments, class-namespace migration).
- **Supersedes:** none.
- **Superseded by:** none.
- **Refines:** Pass 273 §6.1 token-seam category — converts qualitative seam finding to mechanical line-by-line surface.

**Forward triggers (any one re-opens an inventory or prep pass):**

1. Owner authorizes any of the 4 deferred inventories in §11 (priorities B-E + subsystem boundary).
2. Owner ratifies any of the §8 step 1-5 pre-extraction prep tasks → source-edit work begins.
3. Owner ratifies any of the 31 cumulative decision points → relevant draft platform-LAW / extraction plan becomes authorable.
4. Real runtime defect surfaces (independent lane).
5. Owner provides Stacey answers (Pass 268 §8).

Until one fires: dormant.

The execution-readiness lane is now populated with three
registries (vendor / storage / realtime / route) + two dependency
graphs (type-import + token-ownership). Together they convert
~99% of Pass 273's qualitative seam taxonomy into mechanical
location data ready for owner-authorized pre-extraction prep.

The most actionable extraction-risk reduction Pass 276 surfaces
is **§8 step 1 (rgba() literal lift) + step 5 (class-namespace
migration script)** — both are mechanical and high-leverage. The
strategy decision in §8 step 2 (Strategy A vs B for token-tier
architecture) is the most consequential owner-decision item the
inventory work has surfaced.

The theme.css file is mature, self-documented, and architecturally
deliberate. It is not contamination to clean up — it is canon to
preserve while routing platform-grade primitives into
extractable shape.
