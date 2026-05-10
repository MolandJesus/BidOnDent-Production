---
status: ACTIVE
authority: REF
scope: stacey-repo-bootstrap-evidence
canonical_source_of_truth: REF_PASS_310_STACEY_REPO_BOOTSTRAP_2026-05-10.md
companion_to: REF_PASS_309_STACEY_IMPLEMENTATION_REFINEMENT_2026-05-10.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-10
---

# Stacey Repo Bootstrap (Pass 310, 2026-05-10)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner directive 2026-05-10: *"you are builder ai, go fully in autopilot and build off of chatGPT's findings as well."*

**Tier:** REF (evidence + handoff). Brief companion to the actual implementation work, which lives in a separate repo.

**Function:** documents what Pass 310 actually built so that BidOnDent's doctrine corpus has a record of when/why Stacey's repo was bootstrapped, what choices were baked in, and how the relay #34/#35 anti-drift considerations were honored.

---

## §1. What was built

A NEW git repo at:

**`/Users/molalignmeagher/yellow-legal-pad/`**

Sibling to BidOnDent (NOT a folder inside BidOnDent, NOT linked via package alias, NOT sharing node_modules). Initial commit hash: `78fe861`.

Total: 8 files committed (+ `.gitignore`), 671 LOC including extensive anti-drift commentary inline. Executable LOC excluding comments: ~250-350.

| File | LOC | Purpose |
|---|---|---|
| `.gitignore` | 23 | Standard Astro ignore patterns |
| `README.md` | 32 | What this is, how to run, posture notes (calmness as product, slight asymmetry healthy, success metric reframe) |
| `package.json` | 22 | 7 deps: astro, @astrojs/tailwind, @astrojs/check, tailwindcss, @fontsource/eb-garamond, @fontsource/inter, typescript |
| `astro.config.mjs` | 19 | Static output, Tailwind integration with `applyBaseStyles: false` (we own the baseline) |
| `tsconfig.json` | 5 | Strict, minimal |
| `tailwind.config.mjs` | 80 | Stacey palette (deep navy `#0e1a36` / warm ivory `#f6f1e6` / restrained gold `#a87f2b`); EB Garamond + Inter pair; prose measure 38rem ≈ 62ch; section spacing 8rem mobile / 12rem desktop |
| `src/styles/global.css` | 223 | Typography baseline, link styles with gold underlines, soft fade-in CSS (only motion at v1) |
| `src/pages/index.astro` | 290 | 7-section semantic HTML scaffold with placeholder copy; ZERO React; ZERO `client:*` directives; tiny IntersectionObserver (~15 lines) for soft fade-in |

---

## §2. Stack decisions

Implements Pass 308 §5 + Pass 309 §6 specifications:

- **Astro 5.x** in static output mode, used as a *document composer* (not application framework).
- **Tailwind 3.4** with `applyBaseStyles: false` and Tailwind's typography plugin DELIBERATELY NOT INSTALLED (would drift toward "designed-by-Tailwind" feel; we hand-author prose styling for "printed not engineered").
- **EB Garamond** (serif, 400 + 400-italic + 600 weights) + **Inter** (sans, 400 + 500 weights) — both via `@fontsource` npm packages so they ship with the build (no Google Fonts CDN; privacy + speed).
- **Zero JavaScript framework runtime.** No React, no Vue, no Svelte, no client islands.
- **Zero state management.** No store, no context, no provider.
- **Zero routing library.** Astro file-based routes only; v1 has a single `index.astro`.

---

## §3. How relay #34 + relay #35 anti-drift considerations were baked in

Each consideration is captured as an actual implementation choice (not a separate doc):

| Consideration | Baked-in choice |
|---|---|
| **Permission architecture** (relay #34 / Pass 309 §1) | The placeholder copy in `index.astro` is DELIBERATELY GENERIC. Real copy comes from Stacey. The scaffold doesn't put words in her mouth that could subtly drift toward marketing tone. |
| **Anti-optimization** (Pass 309 §4) | No CTA buttons. The single CTA is a plain underlined `<a>` tag with the preserved phrase "Book a Discovery Call." No conversion-optimization patterns; no urgency mechanics; no popups; no scarcity language. |
| **Banned CTA micro-drifts** (relay #35 §4.2) | None of "Start your journey" / "Unlock clarity" / "Take control" / "Build your future" / "Step into confidence" appear anywhere. |
| **Printed not engineered** (Pass 309 §3) | Document composition: `<main>` + `<section>` + `<h1>/<h2>/<h3>` + `<p>` + `<article>` for packages. NO `<Card>` / `<Button>` / `<Container>` component primitives. |
| **3-beat rhythm** (Pass 309 §5) | The Philosophy section's three placeholder paragraphs are commented in the source as the three beats (reassurance / practical / permission), so when Stacey writes the real copy the rhythm is present in the structure. |
| **Near-zero runtime** (Pass 309 §6) | Total client-side JS: ~15 lines (IntersectionObserver for soft fade-in) + ~3 lines (set `js-enabled` class). No frameworks. The page works fully without JS. |
| **Motion = gentle appearance only** (Pass 309 §7) | Single CSS rule: `opacity 0 → 1` over 380ms when section enters viewport. Gated behind `@media (prefers-reduced-motion: no-preference)` AND the `.js-enabled` class. Reduce-motion preference → instant. JS disabled → instant. |
| **Slight asymmetry** (Pass 309 §9) | Sections do NOT all use identical structure: section 2 (Story) and section 6 (Packages) use the wider `column-wide` measure; the others use the narrower `column` measure. Different sections get different breathing without enforcing rigid consistency. |
| **Continuity rule** ("Stacey is emotionally regulated") (Pass 309 §10) | Comments throughout the source repeatedly remind future contributors of this. Implementation chose calm defaults at every decision point. |
| **Aesthetic overproduction risk** (relay #35) | h1 sits at 2.5rem (40px), not 4-6rem; no oversized serif drama. Palette is muted, not high-contrast luxury-magazine. No uppercase tracking. No ornamental flourishes. |
| **"Quietly literate, not fashion-editorial"** (relay #35) | EB Garamond at regular weight, not hyper-thin. Inter at modest weights (400/500). Tracking is subtle (-0.01em on headings). |
| **Anti-financial-performance space** (relay #35) | No analytics dashboards, no "track your progress" framing, no productivity language. Calmness is the product. |
| **Package display rules** (Pass 309 §4.3) | Packages render as plain `<article>` elements with equal visual weight. NO badges. NO "BEST VALUE." NO highlighted center column. Caption-class price text only if/when Stacey decides to show prices. |

---

## §4. What was deliberately NOT built

Per Pass 309 §8 Phase A discipline ("atmosphere only — empty atmosphere first; real copy in Pass 312-314"):

- **No real copy.** Every section uses square-bracketed placeholders.
- **No components folder.** Pass 308 §5.3 listed "components/" as "AS NEEDED." None were needed yet; the page is small enough that section-level inline structure is clearer than component decomposition. Components emerge in Pass 311+ if a specific section's complexity warrants it.
- **No content/ folder.** Pass 308 §5.3 listed `content/copy.md`; deferred until Stacey provides real copy.
- **No favicon.svg yet.** Referenced in `<head>` but the file isn't shipped — placeholder. Stacey/owner provides her own when ready.
- **No deploy config.** No `vercel.json`. Astro's default Vercel adapter detection works without one.
- **No tests.** The site is a static document; testing is visual review, not unit tests.
- **No CI.** Same reason.
- **No analytics/telemetry.** Per Pass 309 §6.4 vendor decisions: deferred indefinitely. Owner can add Plausible later if useful.
- **No design system.** Per relay #35 prohibitions: "design-system gravity" is on the watch list.
- **No layout component.** The `<head>` lives directly in `index.astro`. When v2 has more pages, a layout abstraction earns itself; not before.

---

## §5. Pass sequence resumed

Per Pass 309 §8 (now offset by +1 since this pass was 310 instead of being deferred):

| Pass | Phase | Trigger | Output |
|---|---|---|---|
| **310** ✅ | A | Owner authorizes "build" | Empty atmospheric scaffold (this pass) |
| 311 | A | Atmosphere validated by owner / Stacey reviews look-and-feel | Section structure refinement against representative content shapes; possibly extract 1-2 components if section grows past ~50 lines |
| 312 | B | Stacey provides reassurance + story copy | Implement sections 1-2 with real copy |
| 313 | B | Stacey provides philosophy + who-it's-for copy | Implement sections 3-4 |
| 314 | B | Stacey provides process + packages + invitation copy | Implement sections 5-7; add Calendly link or `mailto:` action |
| 315 | C | Stacey reviews staging deploy | Targeted refinements per Stacey's feedback |
| 316 | C | Owner authorizes launch | Deploy to production |

---

## §6. Pass 281 invariants check (BidOnDent)

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15-#35 prohibitions | ZERO violations |
| `placeDiscoveryQuality.ts` source | UNTOUCHED |
| `src/platform-core/` folder | UNTOUCHED (still 2 files + README) |
| LAW / MOLANDJESUS / CLAUDE.md / MAP_SHELL_HIERARCHY / PLAN_PLATFORM_* | UNTOUCHED |
| BidOnDent source (any file) | UNTOUCHED |
| BidOnDent stack migrated to Stacey repo | NO (relay #29-#35 prohibition observed) |
| Shared infrastructure between repos | NONE — completely independent |

ZERO new owner-decision points (cumulative remains 31).

---

## §7. What this pass does NOT do

- No modification of BidOnDent source
- No infrastructure migration / shared package / cross-repo platform-core / provider extraction (all relay #29-#35 prohibitions observed)
- No tests in the new repo (visual review is the appropriate test for a static document at this stage)
- No CI/CD config (manual deploy at Pass 315/316 is fine)
- No analytics
- No favicon assets (placeholder only)
- No real copy (atmosphere-only per Pass 309 §8 Phase A)
- No third extraction from BidOnDent (cumulative Phase F+ prohibition)
- No `npm install` performed — owner runs `npm install` to verify deps resolve (or amends)

---

## §8. Forward triggers

1. **Owner runs `cd /Users/molalignmeagher/yellow-legal-pad && npm install && npm run dev`** → site appears at `localhost:4321`. Owner confirms atmosphere "feels right" empty, OR identifies specific cracks → Pass 311 calibrates.
2. **Stacey provides real copy for sections 1-2** → Pass 312 implements.
3. **Owner suggests Stack adjustments** (e.g. "actually let's use Astro 4.x" / "drop Inter, try Public Sans") → Pass 311 amendments.
4. **Owner declines current plan** → revert via `git revert 78fe861` in the new repo + standdown.
5. **Build fails on owner's machine due to Astro 5.x being too recent** → Pass 311 pins to Astro 4.x or whatever resolves.

---

## §9. Status

REF doc shipped Pass 310 (in BidOnDent). Code commit `78fe861` shipped in `/Users/molalignmeagher/yellow-legal-pad/`. The Stacey atmospheric foundation is now live in its own repo. Next: owner verifies `npm install + npm run dev` produces the intended visual feeling, then Pass 311+ proceeds.

The runtime stays out of the way. The writing leads. END.
