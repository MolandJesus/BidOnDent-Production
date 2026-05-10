---
status: ACTIVE
authority: PLAN
scope: yellow-legal-pad-as-seed-for-future-branded-sites
canonical_source_of_truth: PLAN_YLP_TO_REUSABLE_STARTER_2026-05-10.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-10
runtime_impact_if_misunderstood: low
ai_summary: Pass 330 planning brief authored 2026-05-10 after the yellow-legal-pad site reached deploy-ready state across passes 310-329. Catalogues what's reusable vs Stacey-specific in the current YLP repo; surfaces three extraction strategies (template-clone, monorepo-shared-package, CLI-scaffold) with tradeoffs; flags the identity-extraction trap (a "calm starter" pre-baked with YLP's exact tokens would clone Stacey's look onto every future site, which is the wrong outcome); lists patterns worth extracting and patterns to deliberately leave site-specific; ends with open owner questions that gate any extraction work. Doc-only — no source touched in either repo. Decisions are surfaced for owner review, NOT pre-committed.
last_updated: 2026-05-10
---

# YLP → Reusable Starter — Planning Brief — 2026-05-10

> **Tier:** PLAN. Future direction, not current truth.
> **Authority:** Pass 330. Owner ask 2026-05-10 ("save work
> done so far to bidondent and work on planning to make site
> more modular for future sites to use off of").
>
> **What this doc is:** an audit of the yellow-legal-pad repo at
> Pass 329 and a surface of options for making its useful patterns
> reusable for future branded sites. Catalogues, classifies,
> recommends. Does NOT decide.
>
> **What this doc is NOT:**
> - LAW. No starter doctrine is binding until owner-ratified.
> - A YLP refactor instruction. YLP stays as-is until owner
>   chooses an extraction strategy.
> - A Stacey copy review. Copy stays Stacey-territory.
> - Implementation. No repos are created; no code is moved; no
>   packages are scaffolded.
>
> **Relation to prior platform-extraction docs:** this plan is
> *complementary*, not a replacement, for
> [`PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md`](PLAN_PLATFORM_EXTRACTION_BRIEF_2026-05-09.md)
> and the Pass 268-line of work. Those briefs analyzed
> BidOnDent → platform. This brief analyzes YLP-the-real-implementation
> → reusable-starter. They sit at different points in the same arc:
> BidOnDent is the heavy app being archived; YLP is the light
> document organism that actually shipped first; the question now
> is what gets factored out of YLP for the next branded site.

---

## §1 — Why this plan, why now

### §1.1 The shift since 2026-05-09

The 2026-05-09 owner relay declared:
- BidOnDent → legacy / R&D archive
- New modular platform repo planned
- Stacey site as first branded implementation

What happened next was different from what the 2026-05-09 docs
expected. Instead of building a platform first and Stacey second,
the **Stacey site (yellow-legal-pad) was built directly** —
Astro 5, static-only, no shared package, no monorepo. Passes
310-329 took it from atmosphere-only bootstrap through real
Stacey-tonal copy, mobile calmness, accessibility, metadata
correctness, and a fixed deployment-blocker (Pass 328: fonts
weren't bundling).

YLP at Pass 329 is a **working, deployable, calm document site**
with no extracted shared layer. That changes the extraction
question.

### §1.2 The new question

Not: *"what should the platform look like, in advance of any real
site?"*

But: *"now that one calm site exists, end-to-end, what's the
right shape for the second one — and the third?"*

This plan exists to surface that shape and the open decisions
behind it.

### §1.3 Why not just keep building YLP and decide later

Three reasons answer themselves and one doesn't:

- *Keep building YLP and decide later* is a valid path. YLP isn't
  blocked by lack of a starter; Stacey can launch on it as-is.
- *Extracting prematurely* is also valid to avoid — extracting
  before two sites exist often produces a "starter" shaped by
  one site's accidents.
- *Doing nothing* leaves the next site to start blank, which
  re-invents Pass 319's skip-link, Pass 320's canonical fix,
  Pass 327's aria-current, Pass 328's font-import-from-frontmatter,
  Pass 329's decorative-arrow a11y — work that took real reasoning.
- *The unanswered:* whether YLP-shaped sites are 1, 2, or 5+ in the
  near future. The right strategy depends on that count. §7.

This plan presumes the count is **at least 2** — otherwise the
answer is "do nothing yet" and this doc is over.

---

## §2 — Audit of yellow-legal-pad at Pass 329

### §2.1 Repo surface (small)

```
yellow-legal-pad/
├── astro.config.mjs            ~30 lines
├── tailwind.config.mjs         ~80 lines
├── tsconfig.json               4 lines
├── package.json                ~25 lines
├── public/
│   ├── favicon.svg             placeholder gold rule on ivory
│   ├── robots.txt              allow-all
│   └── sitemap.xml             relative-URL placeholder (broken-spec)
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro    ~310 lines (HTML + scoped style)
│   ├── pages/
│   │   ├── 404.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── index.astro
│   │   ├── resources.astro
│   │   └── services.astro
│   └── styles/
│       └── global.css          ~310 lines
├── README.md
└── TODO_STACEY.md              owner-input checklist
```

Total: ~916 lines of source across pages + layout + styles.
6 static HTML pages built. ~80KB pre-fonts; ~1.3MB shipped including
all woff2 subsets.

### §2.2 Classification matrix

Each piece sits in one of four buckets:

| Bucket            | Definition                                                                 | Fate in extraction                  |
| ----------------- | -------------------------------------------------------------------------- | ----------------------------------- |
| **Identity-free** | Patterns useful to any calm document site regardless of brand              | EXTRACT to starter                  |
| **Identity-soft** | Patterns shaped by calm/document posture but with no Stacey-specific atoms | EXTRACT as theme-overrideable       |
| **Identity-hard** | Tokens, names, copy, images, tone choices unique to YLP's brand            | DO NOT EXTRACT                      |
| **Site-specific** | Stacey's actual content                                                    | NEVER LEAVES YLP                    |

### §2.3 Per-file classification

| File                              | Bucket          | Notes                                                                                                |
| --------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------- |
| `astro.config.mjs`                | identity-free   | static output + tailwind integration; the `site:` swap pattern                                       |
| `tailwind.config.mjs`             | identity-soft   | structure (color names, font stacks, spacing scale) is reusable; values are YLP brand                |
| `tsconfig.json`                   | identity-free   | `astro/tsconfigs/strict` extension, ~4 lines                                                         |
| `package.json`                    | identity-soft   | the dep set is reusable; the `name` field isn't                                                      |
| `public/favicon.svg`              | identity-hard   | YLP-specific mark; future sites get their own                                                        |
| `public/robots.txt`               | identity-free   | allow-all is the right default for any new site                                                      |
| `public/sitemap.xml`              | identity-free   | currently broken-spec; whatever replaces it (static or `@astrojs/sitemap`) goes in starter           |
| `src/layouts/BaseLayout.astro`    | mixed           | structure is identity-free; specific class names + brand string ("Yellow Legal Pad") are identity-hard |
| `src/pages/404.astro`             | identity-soft   | structure reusable; copy is YLP-tonal                                                                |
| `src/pages/index.astro`           | site-specific   | Grampy story, philosophy, all Stacey                                                                 |
| `src/pages/about.astro`           | site-specific   | Stacey's story                                                                                       |
| `src/pages/contact.astro`         | site-specific   | Stacey's email + mailto                                                                              |
| `src/pages/resources.astro`       | site-specific   | Stacey's guides                                                                                      |
| `src/pages/services.astro`        | site-specific   | Stacey's three packages                                                                              |
| `src/styles/global.css`           | mixed           | reading rhythm + reveal-on-scroll + print + focus → identity-free; specific theme() lookups → soft   |
| `README.md`                       | identity-soft   | structure of the README is reusable; "Stacey" content isn't                                          |
| `TODO_STACEY.md`                  | site-specific   | Stacey's pending inputs; never copied                                                                |

### §2.4 The patterns earned in passes 310-329

These are the things a "blank Astro site" would NOT have, that
took real reasoning to land in YLP, and that are candidates for
the starter:

| Pattern                                | Pass | Identity bucket | Notes                                                                                          |
| -------------------------------------- | ---- | --------------- | ---------------------------------------------------------------------------------------------- |
| Skip-to-content link                   | 319  | free            | Standard a11y; invisible until tab focus                                                       |
| Conditional canonical / og:url         | 320  | free            | Suppresses tags until `Astro.site` is set; avoids shipping localhost URLs                      |
| 404 aria-labelledby consistency        | 322  | free            | Landmark labeling                                                                              |
| `<meta name="color-scheme" content="light">` | 323 | soft       | Right default for light-only sites; not for sites that opt into dark mode                      |
| Print stylesheet (chrome hidden, ink black, page-break rules) | 315/325 | free | Reusable for any document site                                              |
| `aria-current="page"` on active nav    | 327  | free            | Standard pattern, low cost, real screen-reader benefit                                         |
| Fontsource imports in frontmatter (not CSS @import) | 328 | free | Real correctness fix — avoids silent build-time asset drop                                     |
| Decorative arrows hidden from SR       | 329  | free            | `<span aria-hidden="true">→</span>` pattern                                                    |
| `prefers-reduced-motion` IO short-circuit | 310-pre | free        | Bail before observing; CSS is gated by `@media (prefers-reduced-motion: no-preference)`        |
| `.js-enabled` class added by inline script | 310-pre | free       | Progressive-enhancement gate so reveal-on-scroll degrades gracefully                           |
| Reading rhythm tokens (`--measure-prose`, `--line-height-body`) | 305 | free | Universal typography rhythm, value-soft                                                  |
| `bd-*`-style utility classes (.section, .column) | 305-pre | soft | Naming convention soft; structure free                                                          |

Twelve real patterns. Some are 2-line, some are 30-line. All of
them paid for themselves at least once in passes 310-329.

---

## §3 — The identity-extraction trap

The single largest mistake an extraction can make is shipping the
**brand atoms** along with the **structural patterns**.

YLP's brand atoms:
- Cool ivory paper (`#f6f1e6`) + warm-navy ink (`#0e1a36`) + restrained gold (`#a87f2b`)
- EB Garamond serif + Inter sans
- 18px body, generous line-height
- Section padding scale (mobile 4rem → desktop 12rem)
- Section-fade-in motion only
- "Yellow Legal Pad" header brand string
- Single-gold-rule favicon

These are **right for Stacey**. They are not right for "any future
calm site." A future therapist's site, or a writer's site, or a
small-firm consultancy's site — each has its own brand atoms.
A starter that pre-bakes YLP's atoms produces YLP-clones; that's
not modularization, that's stamping.

### §3.1 The corollary

The starter should ship **structure**, **patterns**, and
**defaults that are easy to override**, not finished aesthetic
choices.

Concretely:
- Color tokens by **role** (paper, ink, ink-soft, ink-muted,
  accent), not by **value** (#f6f1e6, #0e1a36, …).
- Font stacks by **role** (serif, sans), with fallback chains, not
  specific Fontsource imports.
- Spacing scale by **rhythm**, not absolute pixels.

Each new site supplies the values; the starter supplies the
shape. YLP's specific values move INTO YLP; nobody else inherits
them.

### §3.2 The harder corollary

Some of YLP's choices are not just brand — they're posture-
defining. "Document not application." "Reading not interface."
"No animation beyond fade-in." These are cross-brand commitments;
they DO belong in the starter and define what kind of starter it
is. A starter that allowed sticky-nav + parallax + click-burst
animations would be a different starter for a different kind of
site. Worth naming this explicitly so future contributors don't
"add features."

---

## §4 — Three extraction strategies

Each strategy answers: *how do future sites get the patterns?*

### §4.1 Strategy A — Repo template ("clone-and-customize")

**Mechanics:** Convert a sanitized YLP into a GitHub template
repo. Future sites click "Use this template," get a fresh repo
seeded with the structure, replace tokens + content, deploy.

**Pros:**
- Simplest possible. No new packages, no monorepo, no tooling.
- Zero coupling between sites after creation. Each site evolves
  independently.
- Owner can review and approve the template snapshot at one
  moment; from then on it's stable.

**Cons:**
- Improvements to the template after a child site exists do
  NOT propagate to the child. (The Pass 328 font fix would
  have to be ported manually to every site that already cloned.)
- Drift accumulates. After 5 sites, the template is "what site #1
  looked like six months ago."
- Discipline-dependent: only works if the same person/AI is
  applying the same patterns each time.

**Right for:** ≤3 sites total, infrequent changes, independent
brands.

### §4.2 Strategy B — Monorepo with shared package

**Mechanics:** Create one repo containing a `packages/calm-shell/`
(the starter as an installable package) and `apps/yellow-legal-pad/`,
`apps/<next-site>/` (the actual sites). Each app depends on
`@<org>/calm-shell` for the BaseLayout, tokens, and patterns.

**Pros:**
- Improvements to the shell propagate to all apps on the next
  install (or bumped version).
- One source of truth for the patterns from §2.4.
- Easier to test the shell in isolation.

**Cons:**
- Monorepo tooling overhead (workspaces, build orchestration).
  Not free.
- Tight coupling: a breaking change to the shell affects all
  consuming apps simultaneously. Versioning helps but doesn't
  eliminate the risk.
- Heavier mental model. Onboarding a new contributor (human or AI)
  costs more.
- Crosses the "don't make the site bigger" rule that YLP has
  successfully held to.

**Right for:** ≥4 sites with shared identity language, frequent
shared improvements, single team owning the shell.

### §4.3 Strategy C — CLI scaffold (degit-style)

**Mechanics:** A small script (or just `degit github:owner/calm-shell`)
copies the template into a new directory. Optionally replaces
brand placeholder strings during copy. After scaffolding, the new
site is independent — exactly like Strategy A, but the source-of-
truth template is more clearly labeled and the scaffold step is
named.

**Pros:**
- All of A's pros, plus a slightly clearer "this is the seed"
  intent.
- The scaffold script can do small ergonomic things (rename, fill
  meta, set first-commit message) without growing into a framework.

**Cons:**
- Same propagation gap as A. Once scaffolded, a child site is
  on its own.
- Adds a tiny bit of process (run the script) without solving
  the propagation problem.

**Right for:** same niche as A, with marginally better ergonomics
and explicitness.

### §4.4 Hybrid

A real-world compromise: **Strategy A or C for the chrome (BaseLayout,
print, a11y patterns) + a tiny shared `@<org>/calm-tokens` package
for ROLE-based tokens** (color roles, font roles, spacing rhythm).
Most updates go to the template (forked at clone-time). Tokens
that genuinely should be shared (e.g., the role taxonomy itself)
ship as a package. Everything inside each site's `tailwind.config`
references the shared role names but supplies its own values.

This buys most of A's simplicity with a small shared surface for
the parts where shared evolution actually matters.

---

## §5 — Patterns worth extracting (technical inventory)

This is the candidate "what goes in the starter" list, organized
by layer. Brand atoms (specific colors, fonts) are NOT in this
list — they belong to each site. Cross-reference §2.4 for which
pass each pattern was earned in.

### §5.1 Project shell

- `astro.config.mjs` skeleton: `output: "static"`, `tailwind` integration with `applyBaseStyles: false`, commented `site:` swap point.
- `tsconfig.json` extending `astro/tsconfigs/strict`.
- `.nvmrc` pinning Node 20.
- `.gitignore` covering `dist/`, `.astro/`, `node_modules/`, env, editor.
- `package.json` script set: `dev`, `start`, `build` (`astro check && astro build`), `preview`, `astro`.

### §5.2 Layout primitive

- A single `BaseLayout.astro` with:
  - `<head>` defaults (charset, viewport, description, theme-color, color-scheme, conditional canonical, conditional og:url, twitter card meta)
  - Skip-to-content link (`href="#main-content"`, off-screen by default, `:focus` slides in)
  - Plain-text header nav with `aria-current="page"` derived from `Astro.url.pathname`
  - `<main id="main-content" tabindex="-1">` slot
  - Plain-text footer nav with same links
  - Tiny inline IO script for `.reveal-on-scroll` fade-in (gated on `prefers-reduced-motion: no-preference`)

### §5.3 Reading-rhythm CSS

- `--line-height-body`, `--line-height-heading`, `--measure-prose` custom properties
- `body` baseline (font-family role, font-size 18px, line-height var, letter-spacing role)
- `h1/h2/h3` size scale (mobile + desktop breakpoints)
- `p` max-width = `--measure-prose`
- `a` underline + offset + thickness pattern, with reduced-motion override
- `blockquote`, `small`, `.caption` baselines
- `.section` padding scale (mobile / tablet / desktop)
- `.column`, `.column-wide` measure containers
- `.reveal-on-scroll` IO-paired class with reduced-motion gating
- `.skip-link` off-screen-until-focused pattern
- `:focus` reset + `:focus-visible` ring
- Print stylesheet (chrome hidden, white paper, black ink, URL-after-external-link, page-break-avoid on headings)

### §5.4 Patterns expressed as Astro frontmatter

- Conditional canonical/og:url block (Pass 320)
- Active-link computation (`isActive(href)` helper + `aria-current` + `is-active` class)
- Fontsource imports living in BaseLayout frontmatter (Pass 328)
- Decorative-arrow `<span aria-hidden="true">` pattern in CTAs

### §5.5 Public assets

- `robots.txt` (allow-all default)
- `favicon.svg` placeholder (the starter's placeholder, not YLP's specific gold rule — should be a brand-neutral mark like a single restrained line in a neutral color)

### §5.6 Documentation skeleton

- A `README.md` with the same structure as YLP's: what it is, how to run, how to build, posture statement.
- A `TODO_<site>.md` template for tracking owner inputs.
- An optional `AI_LOCK.md` if the site will be touched by multiple AIs.

---

## §6 — Patterns to deliberately leave site-specific

Things that look reusable but should NOT be extracted, because
extracting them violates §3:

- **Color palette values.** Roles yes, hex values no.
- **Font choices.** Stacks yes, specific Fontsource packages no.
- **Brand-name string in BaseLayout header.** Each site has its own.
- **Favicon shape.** YLP's gold rule belongs to YLP.
- **Theme-color value (`#f6f1e6`).** Each site provides its own.
- **Mailto link / contact email.** Site-specific.
- **All page copy.** Site-specific.
- **Specific page count** (YLP has 6; another site might have 3).
- **The "Discovery Call" framing.** YLP-specific business language.
- **Font-display values, unicode-ranges.** These are correct
  defaults from Fontsource; nothing to extract because Fontsource
  already ships them.

---

## §7 — Open questions (owner)

The right extraction strategy depends on facts that haven't been
stated. Each question gates a real fork in §4.

1. **How many YLP-shaped sites are realistically planned in the
   next 12 months?** 1, 2-3, 4+. The answer drives Strategy A vs C
   vs B.
2. **Are the future sites yours, or third-party clients?** Yours
   means coupling is fine. Clients means each site needs hard
   independence.
3. **Do future sites share an org / brand family / parent identity?**
   If yes, a tokens package makes sense. If no (each is an
   independent brand), Strategy A is right.
4. **Is BidOnDent expected to ever consume from this seed?** Per
   the 2026-05-09 brief, BidOnDent is being archived. If that holds,
   no — and the starter doesn't need to scale up to app complexity.
   If it doesn't hold, the starter has to leave room for that.
5. **How important is propagation of improvements?** If "Pass 328
   font fix" should automatically apply to every existing site,
   only Strategy B / hybrid covers it. If "fix it in each site
   when needed" is acceptable, A or C suffices.
6. **What's the org/scope name?** A tokens package needs a
   scope (`@<org>/calm-tokens`). This is administrative, not a
   plan question, but blocks B / hybrid.
7. **Should the starter ship a sitemap pattern?** YLP's static
   relative-URL sitemap is broken-spec. Options for the starter:
   (a) ship `@astrojs/sitemap` integration (auto-generates when
   `site:` set), (b) leave sitemap out and document it as an
   owner addition, (c) ship a static template with placeholder
   absolute URLs and explicit find-replace instructions.
8. **Should the starter assume light-only mode** (per the
   `<meta name="color-scheme" content="light">` default), or be
   neutral? YLP is light-only by intent. A document-shaped
   starter is probably also light-only by default. But other
   future sites might need dark mode.

These questions don't need to be answered all at once. Q1 and Q5
together determine strategy. The rest can resolve as the first
extraction proceeds.

---

## §8 — Recommendation (caveat: this is the planner's read, not a directive)

If the answer to Q1 is **2-3 sites in the next 12 months** and
the answer to Q5 is **propagation matters but not urgently**, the
fit is **Strategy C (CLI scaffold) + a tiny shared role-tokens
package** (§4.4 hybrid).

Concretely:
- One repo: `calm-shell-template` — sanitized YLP, identity atoms
  removed, ready to be cloned via `degit` or "Use this template."
- One package: `@<org>/calm-tokens` — exports the role taxonomy
  (paper / ink / ink-soft / ink-muted / accent / accent-soft) and
  the rhythm scale. NOT values.
- Each site (YLP, the next, the next) supplies its own values
  and depends on the tokens package only for the role names.

This buys:
- Easy "go from idea to deploying a calm site" (clone + replace
  tokens + write copy).
- A shared vocabulary for cross-site conversations.
- Identity independence (each site's atoms are its own).
- A small place to land future Pass-328-style patterns (in the
  template; child sites pull manually or re-clone).

It does NOT buy:
- Automatic propagation. That requires Strategy B's monorepo
  weight, which is overkill for ≤3 sites.

If the answer to Q1 is **1 site for the foreseeable future**,
the right action is **NOT YET**. Document the patterns from §2.4
inside YLP itself (a `PATTERNS.md` or extended `README.md`
section), so when site #2 arrives the extraction is informed by
two implementations, not one.

---

## §9 — Don't-do list

The directive's prohibitions still apply:

- **No design-system expansion.** The starter is a thin shell, not
  a UI kit. If a pattern would belong in a UI kit (Button.astro
  with variants, Card.astro with elevation tokens), it does NOT
  belong here.
- **No animation systems.** YLP has one motion: section fade-in,
  gated on prefers-reduced-motion. The starter inherits exactly
  that. Adding "and also a hover-lift utility, and also page
  transitions" turns the starter into a different kind of thing.
- **No conversion psychology.** Email-link-as-CTA is fine. Funnel
  optimization is not in scope.
- **No SEO-content scaffolding.** No blog template. No newsletter
  signup. No analytics integration baked in.
- **No sticky nav or mega menus.** The header is "the top of the
  page," not chrome.
- **No premium-web aesthetics.** No glassmorphism, no aurora
  gradients, no decorative blur. The starter's job is to disappear.

The single guardrail: **if a pattern increases visible
sophistication, it does not enter the starter.**

---

## §10 — Don't-do list, owner edition

Things the planner should NOT do without explicit owner direction:

- Create the new repo. (Q6 + Q7 must resolve first.)
- Modify YLP to "prepare for extraction." (YLP is deployable as-is;
  changes to support a future extraction risk regression in the
  thing that actually works.)
- Move BidOnDent files into the starter. (Per the 2026-05-09
  archive direction, BidOnDent is reference-only.)
- Choose a value for `@<org>` scope.
- Decide on Strategy A vs B vs C unilaterally.
- Author code for the starter before the strategy is chosen.

---

## §11 — Suggested next step (singular)

If the owner wants this to move:

> Answer Q1 and Q5 in `§7`. (How many sites? Does propagation
> matter?) Everything else falls out of those two answers.

If the answer is "not yet, just document," do exactly that —
add a `PATTERNS.md` inside yellow-legal-pad capturing §2.4 + §5
inline so the patterns are at least findable when site #2
arrives.

---

## §12 — Closing posture

YLP at Pass 329 is a small, calm, deployable site. Its real
achievement is what it didn't grow into: a framework, a design
system, a SaaS chassis. Any extraction has to honor that: ship
less, not more.

The extraction question is real. The extraction work is gated.
This brief surfaces both.

— end —
