---
status: ACTIVE
authority: PLAN
scope: platform-bootstrap-prep
canonical_source_of_truth: PLAN_PLATFORM_BOOTSTRAP_PREP_2026-05-09.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-09
runtime_impact_if_misunderstood: low
ai_summary: Pass 269 deep-think planning doc per owner relay 2026-05-09 Point 7 (six architecture topics to resolve before any new platform repo bootstrap) + Point 2 (AI-operational environment as first-class platform asset). Surfaces options, recommendations, and explicit owner-decision points for naming architecture, package boundary philosophy, token/theme architecture, auth abstraction strategy, workspace tooling direction, AI-governance portability, and meta-doctrine extraction. Doc-only. Companion to Pass 268 Platform Extraction Discovery brief. Repo bootstrap remains owner-authorization-required.
last_updated: 2026-05-09
---

# Platform Bootstrap Prep — 2026-05-09

> **Tier:** PLAN. Future direction, not current truth.
> **Authority:** Pass 269. Owner relay 2026-05-09 Point 7 explicit
> "deeply think through" directive. Companion to Pass 268
> [`PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md`](PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md) (which surfaced
> the 4-tier extraction matrix + repo-split options + 9 doctrine
> principles).
>
> **What this doc is:** the architecture-decisions-substrate the
> owner needs in order to bootstrap a new platform repo without
> leaving easy-to-lock-in mistakes for later. Six topics +
> the meta-doctrine concept.
>
> **What this doc is NOT:**
> - LAW. Nothing here is binding.
> - A repo bootstrap. No new repos created; no code moved; no
>   packages published.
> - Stacey-specific. Brand work still gated on Pass 268 §8
>   answers.
> - A replacement for Pass 268. This pass extends Pass 268 by
>   going one level deeper on the bootstrap-prerequisite topics.

---

## §1 — Mission

Pass 268 produced the discovery substrate (extraction matrix +
repo-split options). Before any new repo can responsibly be
bootstrapped, six architecture decisions need to be deeply
thought through:

1. **Naming architecture** — what are things called, and why?
2. **Package boundary philosophy** — what is a package vs a
   sub-folder?
3. **Token/theme architecture** — how does brand-platform
   separation actually work in CSS/code?
4. **Auth abstraction strategy** — Clerk lock-in tradeoff?
5. **Workspace tooling direction** — pnpm? Turborepo? Nx?
6. **AI-governance portability** — how does the
   AI-operational environment transfer cleanly?

Plus the meta-concept owner relay Point 2 introduced:

7. **AI-operational doctrine as first-class platform asset** —
   formalize the operational philosophy itself as portable
   doctrine.

Each section below has the same shape:

- **Surface area** — what's actually being decided.
- **Options** — viable approaches with tradeoffs.
- **Recommendation** — best-confidence pick (or explicit
  "owner decides").
- **Owner-decision point(s)** — what needs ratification before
  the question is closed.

---

## §2 — Naming architecture

### §2.1 Surface area

What needs naming when bootstrapping the new repo:

1. The repo itself (the GitHub project name).
2. The platform-core package(s).
3. Optional modules.
4. Branded implementations (apps).
5. The npm/scoping convention if packages are published.
6. The release/version strategy.

### §2.2 Options

#### Repo name candidates (illustrative, not committed)

The platform must be **business-agnostic**. Naming therefore
should NOT include "bidondent", "auto", "shop", "claim",
"map", or anything domain-specific.

| Naming family   | Examples                           | Notes                                              |
| --------------- | ---------------------------------- | -------------------------------------------------- |
| Generic-tech    | `platform`, `core`, `kernel`, `forge`, `keel`, `stack` | Risk: low signal; collide with thousands of repos.  |
| Concept-natural | `prism`, `atrium`, `lattice`, `meridian`, `compass` | Memorable; brand-able; not over-claimed.            |
| Owner-personal  | `mola-platform`, `molakit`, `molabuild` | Anchors authorship; signals "this is Mola's kit". |
| Project-shape   | `monorepo-platform`, `business-os`, `brand-os` | Descriptive; less elegant.                          |

The choice depends on whether the platform is:
- a personal toolkit Mola maintains and uses for own businesses, OR
- a publishable open-source platform others would adopt.

Pass 268 §1 framed this as Mola's reusable foundation; the
owner-personal family fits that framing. But the relay's
"premium business operating system" language could also fit a
neutral concept-natural name.

#### Package scope candidates

If npm-published:

- `@<scope>/platform-core`, `@<scope>/platform-modules`, etc.
- `@<scope>/auth`, `@<scope>/map-engine`, `@<scope>/ui`

The scope is the npm prefix (e.g., `@stripe/stripe-js`,
`@vercel/style-guide`). It's tied to either an npm organization
(paid in some cases) or an individual account.

If workspace-internal only (no npm publish):

- `<repo>/packages/platform-core/`
- `<repo>/apps/stacey/`

Package names within the workspace can be unscoped
(`platform-core`, `module-map`) or scoped consistently with the
repo's npm org if there is one.

#### Branded-implementation app naming

- `apps/stacey` — uses Stacey's first name; intimate; brand-anchored.
- `apps/stacey-financial` — descriptive; useful if multiple Stacey
  brands exist later.
- `apps/<domain>` — uses domain shorthand; abstract.
- `apps/<owner>-<service>` — verbose; clear ownership.

Recommendation: app folders use the BRAND IDENTITY as it
appears externally (so `apps/stacey-financial` if her business
name is "Stacey Financial", `apps/jeffrey-creative` for
Jeffrey, etc.).

### §2.3 Recommendation

**Owner decides the platform repo name.** No external constraint
forces a choice; this is a brand-of-the-platform decision and
not appropriate for a Builder to pre-commit.

Defaults if owner asks Builder for a starting point:

- Repo name: leave blank for owner choice; suggested family:
  concept-natural OR owner-personal.
- Package scope: `@<owner-scope>/...` if Mola has an npm org;
  unscoped workspace-internal otherwise.
- App naming: brand-shorthand (`apps/stacey`, `apps/jeffrey`).
- Module naming: descriptive single-word + capability
  (`@<scope>/auth`, `@<scope>/map-engine`,
  `@<scope>/persistent-map-session`).

### §2.4 Owner-decision points

1. Platform repo name (owner picks).
2. npm publish posture (private workspace / public registry /
   private registry).
3. npm org / scope name if publishing.
4. App folder naming convention (brand-shorthand recommended).

Until #1 is chosen, "the new repo" stays a placeholder in
documentation.

---

## §3 — Package boundary philosophy

### §3.1 Surface area

Once a package boundary exists, it's expensive to move. The
question is: what's the shape of the boundaries?

### §3.2 Options + recommendations

The recommended boundary shape (based on the Pass 268 Tier
A/B/C/D classification):

```
<platform-repo>/
  packages/
    platform-core/
      ui/                  # shadcn primitives + variants
      shell/               # AppShell, Layouts, Header, Sidebar
      providers/           # generalized provider seam pattern
      auth/                # provider-agnostic auth interface
      auth-clerk/          # Clerk-specific binding
      storage/             # pointer + signed-URL pattern
      tokens/              # design tokens (reference + system)
      motion/              # reduced-motion contract + primitives
      notifications/       # toast + deep-link
      error-boundaries/    # ScreenErrorBoundary etc.
      instrumentation/     # perfMarks, dev counters, harness
      hooks-core/          # useUser, useSession, useOnlineStatus, etc.
      services-core/       # errorReporting, sentryInit, etc.
    modules/
      map-engine/          # MapEngineCanvas + controllers
      persistent-map-session/  # PMS provider + lifecycle
      map-coverage/        # MapLibreServiceCoverageMap host
      navigation-turn-by-turn/ # collision-style navigation
      performance-tracking/    # mapPerformance + UI
      realtime-subscriptions/
      storage-media/       # photo gallery, media browser
      scheduling/          # NEW — booking/consultation
      content/             # NEW — blog/resources/courses
      lead-capture/        # forms + funnels
  apps/
    stacey-financial/      # Stacey's site
    jeffrey-creative/      # future Jeffrey site
    bidondent-legacy/      # IF moved here; defaults to staying in original repo
  brand-assets/
    stacey-financial/      # Stacey brand tokens + copy + photography
    jeffrey-creative/      # Jeffrey brand tokens + copy + photography
  docs/
    PLATFORM_LAW_*.md       # generalized doctrine
    PLATFORM_REF_*.md       # platform reference
    PLATFORM_PLAN_*.md      # platform planning
  AI_LOCK.md                # workspace-wide coordination
  README.md
  package.json              # workspace root
  pnpm-workspace.yaml       # workspace definition
  turbo.json                # build orchestration (optional)
```

#### Boundary rules

These should be **codified into platform LAW** if owner
ratifies:

1. **Apps NEVER export anything.** Apps are leaf consumers.
2. **Packages NEVER import from apps.** One-way dependency
   (apps → packages).
3. **Optional modules NEVER import other optional modules.**
   Composition happens at the app layer via provider stacking.
4. **Brand-assets are app-private.** Each app has exactly one
   `brand-assets/<self>` it imports; no cross-brand imports.
5. **Platform-core may be a dep of any module.** Platform-core
   is the only "inheritable" package.
6. **Test utilities co-locate with the package they test.**
   Each package has its own `__tests__/` and test-utils.

#### Why these rules matter

Rule 3 (modules don't import each other) is the key insight
from Pass 266 — `MapSessionProvider` is an INERT seam. Future
modules should follow that pattern: be opt-in, with no-op
defaults, composing only at app level.

Rule 4 prevents the "Stacey accidentally inherits BidOnDent
amber-gold" problem the relay explicitly warned against.

Rule 6 prevents a single mega-test-utils package that becomes
its own coupling source.

### §3.3 Owner-decision points

1. Are these 6 boundary rules acceptable as future platform LAW?
   (Yes/No/With-amendments)
2. Does the proposed folder structure match owner mental model,
   or should it be reorganized?
3. Should `bidondent-legacy/` live in this monorepo, or stay in
   the current standalone repo? (Pass 268 §6.5 recommended
   stay-standalone by default; this can be revisited.)

---

## §4 — Token/theme architecture

### §4.1 Surface area

The hardest piece of brand-platform separation. The platform
must support:

- BidOnDent's Jeffrey aesthetic (cinematic dark navy + bronze
  amber gold + warm cream insets).
- Stacey's warmer/editorial aesthetic.
- Future brands (yet undefined).

Without polluting platform-core with brand-specific values.

### §4.2 Options

#### Option I — Three-tier token architecture (recommended)

```
Tier 1: Reference tokens   (platform-core; raw values)
  --color-blue-500: #2563eb
  --color-stone-100: #f5f5f4
  --motion-duration-base: 220ms
  --space-4: 1rem

Tier 2: System tokens      (platform-core CONTRACT; brand FILLS)
  --surface-primary
  --surface-elevated
  --action-primary
  --motion-trust
  (etc. — declared but unfilled in platform-core)

Tier 3: Component tokens   (platform-core; consumes Tier 2)
  --button-bg: var(--action-primary)
  --card-surface: var(--surface-elevated)

Brand override layer       (brand-assets/<brand>; fills Tier 2)
  --surface-primary: var(--color-blue-700)   /* Jeffrey */
  --surface-primary: var(--color-stone-50)   /* Stacey */
```

Components consume Tier 3 (or sometimes Tier 2 directly).
Brands fill Tier 2 from Tier 1. Platform-core ships Tier 1 and
Tier 3; Tier 2 is an **interface** that brands implement.

This is the standard design-system pattern (Carbon, Radix,
Polaris use variants of it).

#### Option II — Theme-object pattern (less recommended)

```typescript
const jeffreyTheme = {
  surface: { primary: '#0b172f', elevated: '#1e293b' },
  action: { primary: '#2563eb' },
  motion: { trust: '320ms cubic-bezier(...)' }
};

const staceyTheme = {
  surface: { primary: '#fafaf9', elevated: '#ffffff' },
  action: { primary: '#7c5e00' },
  motion: { trust: '480ms cubic-bezier(...)' }
};
```

Components consume `theme.surface.primary` via context. Works
but couples to a specific theme-context library and is less
Tailwind-native.

#### Option III — Direct CSS variables (no contract)

Components hard-code variable names; brands just override them
arbitrarily. Simplest but no type-safety / no contract / no
documentation surface.

### §4.3 Recommendation

**Option I (three-tier)** is the right architecture:

- **Tailwind v4 native** — Tailwind v4 supports CSS custom
  properties directly; system tokens fit naturally.
- **Type-safe boundary possible** — TypeScript can enforce the
  Tier 2 contract via a `BrandTokens` interface every brand
  must satisfy.
- **Documentable** — Tier 2 is the documented brand-contract
  surface.
- **Reverse-mappable** — Existing BidOnDent `bd-*` utility
  classes can be progressively rewritten to consume Tier 2
  tokens. The current `theme.css` is already token-shaped in
  spirit; this formalizes it.

#### Concrete shape (illustrative — not authored yet)

```css
/* packages/platform-core/tokens/reference.css */
:root {
  --color-blue-500: #2563eb;
  --color-stone-100: #f5f5f4;
  --motion-duration-base: 220ms;
  /* ...all reference values */
}

/* packages/platform-core/tokens/contract.css */
:root {
  /* These declarations are placeholders — every BRAND fills them. */
  --surface-primary: var(--color-blue-500); /* fallback */
  --surface-elevated: var(--color-blue-500);
  --action-primary: var(--color-blue-500);
  --motion-trust-duration: var(--motion-duration-base);
}

/* packages/platform-core/tokens/components.css */
.bd-card {
  background: var(--surface-elevated);
  /* (rename "bd-" → "ui-" or "sys-" at extraction time) */
}

/* brand-assets/stacey-financial/tokens.css */
:root {
  --surface-primary: #fafaf9;
  --surface-elevated: #ffffff;
  --action-primary: #7c5e00;  /* warm gold */
  --motion-trust-duration: 480ms;  /* slower, calmer */
}

/* brand-assets/jeffrey-creative/tokens.css */
:root {
  --surface-primary: #0b172f;  /* navy */
  --surface-elevated: rgba(15, 23, 42, 0.84);
  --action-primary: #2563eb;
  --motion-trust-duration: 320ms;
}
```

App imports its own brand-assets at root level; everything
cascades.

### §4.4 Migration implication

The current BidOnDent `theme.css` is partly Tier 3 already. The
extraction work (Pass 268 §6 Phase β) requires:

1. Pull Tier 1 reference tokens from `theme.css` to
   `tokens/reference.css`.
2. Identify Tier 2 contract surface from `bd-*` utility usage;
   declare in `tokens/contract.css`.
3. Rewrite `bd-*` utilities to read from contract (Tier 3).
4. Move brand-specific values to `brand-assets/jeffrey-creative/`.

This is a meaningful refactor. ~500-1000 lines of CSS touched.
Should be its own pass when authorized.

### §4.5 Owner-decision points

1. Three-tier architecture acceptable, or prefer simpler
   Option II / III?
2. Naming: keep `bd-*` utility prefix or rename to neutral
   prefix (e.g., `ui-`, `sys-`)?
3. Tailwind v4 utility-prefix integration: extend Tailwind's
   theme config to consume the three-tier tokens?

---

## §5 — Auth abstraction strategy

### §5.1 Surface area

Current state: ~30+ files in `src/app/` directly import from
`@clerk/clerk-react`. The platform either:

- A. Inherits this Clerk lock-in (apps always use Clerk).
- B. Adds a thin wrapper so the integration is swappable later.
- C. Goes fully provider-agnostic with a complete abstraction
  layer.

### §5.2 Options + tradeoffs

| Option | Cost                              | Switching cost (Clerk → other)                        | YAGNI risk |
| ------ | --------------------------------- | ------------------------------------------------------ | ---------- |
| A      | None upfront                       | Very high (every app rewritten)                        | None       |
| B      | One-time wrapping (~1 day)         | Moderate (binding package swapped; thin app changes)   | Low        |
| C      | Significant upfront (1-2 weeks)    | Low (just install a different binding)                 | High       |

### §5.3 Recommendation

**Option B (thin wrapper)** is the right balance.

#### Concrete shape

```
packages/platform-core/auth/
  index.ts                  // exports useUser, useSession, useAuth, SignInButton, etc.
  types.ts                  // PlatformUser, PlatformSession types

packages/platform-core/auth-clerk/
  index.ts                  // re-exports Clerk's hooks under platform-core/auth interface
  ClerkPlatformProvider.tsx // wraps ClerkProvider; ensures token-getter wiring

# Consumer pattern in app code:
import { useUser } from "@platform/core/auth";
# (resolves to Clerk-backed useUser)
```

The wrapper IS thin — `useUser()` from `@platform/core/auth`
delegates to Clerk's `useUser()` and re-exports the hook with a
platform-typed return shape. No behavioral abstraction.

But the boundary exists. If 18 months from now Clerk pricing
changes or Stacey's business needs an Auth0 binding, swapping
the integration is hours not weeks.

#### Edge function side

Per Pass 268 §5.8: the `requireClerkSession()` pattern stays as
platform doctrine (the in-function verification idiom is
reusable). At the package level:

```
packages/platform-core/auth/edge/
  requirePlatformSession.ts  // generalized
  
packages/platform-core/auth-clerk/edge/
  requireClerkSession.ts     // Clerk binding; current implementation
```

Apps that use Clerk import `requireClerkSession`; if the
platform later supports Auth0, that binding adds
`requireAuth0Session`. The edge function itself stays unaware
of which binding it uses.

### §5.4 Owner-decision points

1. Is Clerk the long-term identity provider commitment, or
   should the platform anticipate a swap?
2. Are there businesses-other-than-Stacey already in scope
   that might use a different identity provider?

---

## §6 — Workspace tooling direction

### §6.1 Surface area

Monorepo tooling (assuming Pass 268 §4.4 Option β —
monorepo — is owner-ratified). Three contenders:

### §6.2 Options

| Tool       | Strength                                       | Weakness                                              | Maturity |
| ---------- | ---------------------------------------------- | ----------------------------------------------------- | -------- |
| **pnpm + workspaces** (no orchestrator)         | Simple; native pnpm install; minimal config | No build cache by default; manual `pnpm -r` scripting   | Very high; default for many monorepos as of 2026.        |
| **pnpm + Turborepo**                             | Build cache + remote cache + parallel runs  | Extra config (`turbo.json`); Vercel-leaning ecosystem  | High; widely used.                                       |
| **Nx**                                           | Powerful build graph + plugin ecosystem      | Opinionated; learning curve; sometimes over-tooling   | High; better for very large monorepos.                   |

### §6.3 Recommendation

**Option β.1 — pnpm + Turborepo**.

Reasoning:

- Current BidOnDent already uses Vercel for deployment;
  Turborepo + Vercel composes naturally.
- pnpm's content-addressable store + workspace deduping is
  meaningfully better than npm/yarn for a monorepo this size.
- Turborepo's build caching saves CI time as packages multiply.
- Nx's extra opinionation isn't justified for a 5-10-package
  monorepo; reach for it later if scope explodes.

Nx is the right answer if/when:
- The monorepo grows past ~20 packages.
- Multiple teams own different packages.
- Build/test orchestration becomes the bottleneck.

For Stacey-as-first-app, Turborepo is sufficient and removable.

### §6.4 Concrete shape

```
<platform-repo>/
  pnpm-workspace.yaml           # declares packages/* and apps/*
  turbo.json                    # build pipeline
  package.json                  # workspace root, devDependencies only
  packages/
    platform-core/
      package.json
      src/
      tsconfig.json
    modules/
      map-engine/
        package.json
        src/
  apps/
    stacey-financial/
      package.json
      vite.config.ts
      index.html
      src/
```

Each package + app has its own `tsconfig.json` extending a
root `tsconfig.base.json`. Turborepo's pipeline declares:

```jsonc
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test":  { "dependsOn": ["^build"] },
    "lint":  {},
    "dev":   { "cache": false, "persistent": true }
  }
}
```

### §6.5 Versioning + publishing

If platform-core is npm-published:

- **Changesets** (`@changesets/cli`) for semver + changelog generation.
- Per-package versioning (each package independent).

If workspace-internal only:

- No publishing; apps consume `workspace:*` references.
- Simpler; recommended for single-owner monorepos.

Recommendation: workspace-internal at first; switch to
changesets+publish only if external consumers emerge.

### §6.6 Owner-decision points

1. pnpm + Turborepo acceptable, or prefer plain pnpm / Nx?
2. Workspace-internal-only or npm-publish path?
3. Is there a CI provider commitment (GitHub Actions / Vercel
   / Other) that constrains tooling?

---

## §7 — AI-governance portability

### §7.1 Surface area

This is owner relay Point 2 — formalize the AI-operational
environment as a first-class platform asset. The current repo
has organically developed an AI-governance system that:

- Coordinates multi-AI sessions (`AI_LOCK.md`).
- Separates LAW / REFERENCE / PLAN with explicit authority tiers.
- Records convergence metadata in commit messages.
- Documents rollback shape per pass.
- Phases authorization (owner-gates between phases).
- Tracks invariants in dedicated REF docs.
- Surfaces hidden-authority risks before they ship.
- Enforces containment-over-expansion via stored feedback memory.

This is genuinely portable. But:

- BidOnDent-specific LAW docs (`LAW_PROJECT_RULES`,
  `LAW_HARDENING_PLAN`, `MOLANDJESUS_DESIGN_DECISIONS`) are
  domain-coupled and should NOT clone.
- The OPERATIONAL philosophy (the schemas, the workflows, the
  conventions) IS reusable.

### §7.2 Two-layer extraction

The right separation is:

#### Layer 1 — Operational doctrine (portable)

- AI_LOCK schema + rules (already in `AI_LOCK.md`).
- Pass commit convention (numbered passes, type prefix, body
  shape).
- Convergence metadata format (the 10-line metadata block
  this repo uses).
- Rollback-shape requirement (every pass declares its rollback
  in body).
- Phase-gate pattern (no phase begins without owner approval
  of the prior phase's outcome).
- Hidden-authority tracking (KIs filed for any silent override).
- Containment-over-expansion principle.

These become a single `META_AI_OPERATIONAL_DOCTRINE.md` in the
new platform repo's `docs/`. Generic. Business-agnostic.
Reusable for ANY AI-governed engineering project.

#### Layer 2 — Project-specific LAW (per-app)

Each branded app may add its own LAW docs that customize for
the app's domain — but never modify the meta-doctrine.

Example: an app that touches HIPAA-protected data adds its own
`<app>_LAW_HIPAA_INVARIANTS.md`. The meta-doctrine stays
unchanged.

### §7.3 Skill portability

These existing skills are reusable as-is in a platform repo:

- `mola-ai-relay-protocol` — multi-AI relay parsing. Generic.
- `supabase-clerk-edge-function` — generic Supabase + Clerk
  pattern.
- `supabase-storage-signed-urls` — generic storage-pointer
  pattern.
- `supabase-pro-cost-control` — generic Supabase cost
  knowledge.

These do NOT transfer:

- `bd-design-identity` — BidOnDent-specific brand. Stays in
  legacy.

A NEW skill could be authored at platform extraction time:

- `platform-extraction-discipline` — the
  containment-over-expansion + single-doc-per-pass pattern
  validated during Passes 262–269.

### §7.4 What gets ported, summarized

| Asset                                          | Port verbatim | Generalize | Stay in legacy |
| ---------------------------------------------- | ------------- | ---------- | -------------- |
| AI_LOCK.md schema                              | ✓             |            |                |
| Pass commit convention                         | ✓             |            |                |
| Convergence metadata format                    | ✓             |            |                |
| Rollback-shape requirement                     | ✓             |            |                |
| Phase-gate pattern                             | ✓             |            |                |
| KI numbering                                   | ✓             |            |                |
| `LAW_LAYERED_ARCHITECTURE.md` content          |               | ✓          |                |
| `LAW_ANIMATION_AND_ATMOSPHERE.md` content      |               | ✓          |                |
| `LAW_PROJECT_RULES.md` content                 |               |            | ✓              |
| `LAW_HARDENING_PLAN.md` content                |               |            | ✓              |
| `MOLANDJESUS_DESIGN_DECISIONS.md`              |               |            | ✓              |
| `bd-design-identity` skill                     |               |            | ✓              |
| `mola-ai-relay-protocol` skill                 | ✓             |            |                |
| `supabase-*` skills                            | ✓             |            |                |
| Memory entries (e.g., `feedback_containment`)  | ✓ (re-pathed) |            |                |

### §7.5 Owner-decision points

1. Approve `META_AI_OPERATIONAL_DOCTRINE.md` extraction
   approach (single doc consolidating the operational
   schemas)?
2. Skill list above: anything missing or anything to demote?
3. Memory portability: should existing `feedback_*` entries
   migrate verbatim to the new platform's memory system, or
   be re-curated?

---

## §8 — Meta-doctrine: the platform's most underrated asset

The owner relay Point 2 framing is correct: the operational
intelligence accumulated during BidOnDent's hardening phase is
one of the repo's most valuable assets. It is more reusable
than any specific component.

### §8.1 Why this matters

The patterns that produced Passes 262–268's clean execution
(no semantic drift, no premature expansion, rollback-first,
gated phases, owner-decision points surfaced explicitly) are
not BidOnDent-specific. They are AI-governed engineering
patterns. Any future business implementation built on this
platform inherits the same operational quality if the doctrine
ports.

### §8.2 What the platform contributes back

The old framing — "build a product" — produced BidOnDent.

The new framing — "platform exposes seams; brands plug in;
modules opt in; AI governs change" — is recursive: every new
business implementation makes the platform stronger if it
contributes back any genuinely-reusable pattern. The platform
doctrine itself becomes a living artifact.

### §8.3 Critical guardrail (relay Point 8)

> "Never allow future business implementations to pollute
> platform-core doctrine. The current repo became powerful
> because the doctrine grew around a single difficult product
> and stabilized through hardening pressure. Future
> implementations should PLUG INTO the platform. They should
> not redefine it casually."

Operational consequence:

- Any change to platform-core or platform-modules requires
  explicit owner authorization (same gate-pattern as PMS
  Phase 1 / 2).
- Brand implementations that need behavior NOT in the platform
  add it AT THEIR OWN APP LAYER first; only AFTER the pattern
  proves itself across multiple apps does it become a
  candidate for promotion to platform-modules.
- This prevents platform churn driven by single-app urgency.

This is itself an operational rule worth codifying in
`META_AI_OPERATIONAL_DOCTRINE.md`.

---

## §9 — Bootstrap pre-requisite checklist

For owner reference. Before bootstrapping the new platform repo:

| Item                                                         | Status   | Owner-decision-point |
| ------------------------------------------------------------ | -------- | -------------------- |
| Platform repo name chosen                                    | OPEN     | §2.4 #1              |
| npm publish posture (private/workspace/public)               | OPEN     | §2.4 #2              |
| npm scope name                                                | OPEN     | §2.4 #3              |
| App folder naming convention                                 | OPEN     | §2.4 #4              |
| Package boundary rules (1-6 in §3.2)                         | OPEN     | §3.3 #1              |
| Folder structure                                             | OPEN     | §3.3 #2              |
| `bidondent-legacy` placement                                 | OPEN     | §3.3 #3              |
| Token architecture (3-tier vs alternatives)                  | OPEN     | §4.5 #1              |
| Utility prefix (`bd-` vs neutral)                            | OPEN     | §4.5 #2              |
| Tailwind v4 token integration approach                       | OPEN     | §4.5 #3              |
| Auth abstraction (B thin wrapper recommended)                | OPEN     | §5.4 #1              |
| Multi-provider auth scope                                    | OPEN     | §5.4 #2              |
| Workspace tooling (pnpm+Turbo recommended)                   | OPEN     | §6.6 #1              |
| Workspace-internal vs npm-publish                            | OPEN     | §6.6 #2              |
| CI provider commitment                                        | OPEN     | §6.6 #3              |
| `META_AI_OPERATIONAL_DOCTRINE.md` extraction approval        | OPEN     | §7.5 #1              |
| Skill port list                                              | OPEN     | §7.5 #2              |
| Memory entry migration approach                              | OPEN     | §7.5 #3              |
| Pass 268 §5 platform doctrine principles ratification        | OPEN     | (Pass 268 §11)       |
| Pass 268 §4 repo-split option choice                         | OPEN     | (Pass 268 §11)       |
| Pass 268 §8 Stacey question answers                          | OPEN     | (Pass 268 §11)       |

**21 owner-decision points across Passes 268 + 269.** None
require resolution today; all gate any new repo work.

---

## §10 — What this doc does NOT do

- Does NOT touch any production source.
- Does NOT touch any LAW doc, MOLANDJESUS_DESIGN_DECISIONS,
  CLAUDE.md, or any existing `bd-*` utility.
- Does NOT bootstrap any repo.
- Does NOT install pnpm, Turborepo, or any tool.
- Does NOT publish any package.
- Does NOT extract any subsystem.
- Does NOT decide platform repo name.
- Does NOT pre-commit token architecture, package boundaries,
  or any architectural choice.
- Does NOT author Stacey content (Pass 268 §8 still gating).
- Does NOT modify the AI-governance system in this repo
  (preserved as-is; meta-doctrine extraction is for the
  future repo).
- Does NOT supersede or replace Pass 268. This pass extends.

---

## §11 — Cross-references

- Pass 268 [`PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md`](PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md) — discovery substrate this brief builds on.
- Owner relay 2026-05-09 (Points 1-8 of strategic-direction message).
- `LAW_LAYERED_ARCHITECTURE.md` — current 4-layer model; candidate for §7.2 Layer-1 extraction.
- `LAW_ANIMATION_AND_ATMOSPHERE.md` — motion canon; candidate for §7.2 Layer-1 extraction.
- `MOLANDJESUS_DESIGN_DECISIONS.md` — locked BD canon; explicitly NOT extracted (relay Point 4).
- `AI_LOCK.md` — current AI-governance schema; reusable verbatim per §7.4.
- Pass 266 `MapSessionProvider` — exemplar provider seam pattern referenced throughout.
- Pass 267 KI-197 fix — example of bug-fix lane discipline that should port to meta-doctrine.

---

## §12 — Status

- **Drafted:** 2026-05-09 (Pass 269, Platform Bootstrap Prep lane).
- **Status:** ACTIVE planning.
- **Authority:** PLAN. Subordinate to all current LAW docs.
  Surfaces options + recommendations for owner ratification.
- **Owner approval required:** TRUE for any subsequent
  repo-bootstrap action. Twenty-one decision points listed in §9.
- **Supersedes:** none.
- **Superseded by:** none.

**Next legitimate forward triggers:**

1. Owner answers any of the 21 decision points → that
   sub-question closes; bootstrap inches forward.
2. Owner ratifies a coherent subset (e.g., naming + repo-split
   + workspace tooling) → repo bootstrap becomes authorized.
3. Owner provides Stacey answers (Pass 268 §8) → Stacey brand
   direction doc becomes authorable in parallel.
4. Owner authorizes PMS Phase 2 → independent PMS work
   resumes (matching the discipline that platform extraction
   does not unblock PMS, and vice versa).

Until ratification: disciplined hold. Same discipline that
produced the successful Passes 262–268 sequence. The platform
direction expands the canvas; the canvas does not loosen the
brushwork.
