---
status: ACTIVE
authority: REF
scope: stacey-identity-and-bootstrap-plan
canonical_source_of_truth: REF_PASS_308_STACEY_IDENTITY_AND_BOOTSTRAP_PLAN_2026-05-10.md
companion_to: REF_PASS_307_STACEY_IDENTITY_QUESTIONNAIRE_2026-05-10.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-10
---

# Stacey Identity Statement + Scope + Bootstrap Plan (Pass 308, 2026-05-10)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #33 (Phase I.4: real Stacey context arrived).

**Tier:** REF. **Plan only.** ZERO code. NO repo bootstrap until owner ratifies this plan.

**Why this pass exists now:** Pass 307 §1 specified the deliverable shape; relay #33 supplied the inputs (Yellow Legal Pad coaching presentation, philosophy doc, About Stacey, package docs, family/couples money guides). The questionnaire is functionally answered. Pass 308 translates owner-supplied identity signals into a concrete plan for Pass 309's repo bootstrap.

**Synthesis source:** owner-supplied materials via relay #33, NOT speculation.

---

## §1. Identity statement

**Yellow Legal Pad** is the financial coaching practice of Stacey [last name TBD per owner]. The site is not a fintech product, not a wealth-management page, not a startup landing — it is the digital analogue of someone intelligent and emotionally safe quietly sitting across a kitchen table. Its job is to make money less scary for people who feel underserved (not unintelligent) by financial advice as it is normally packaged. The visitor leaves having received permission, clarity, and an unhurried invitation to talk — not a sales pitch, not a productivity prompt, not a feature list. The runtime should feel like a beautifully restrained editorial document; the writing leads, the runtime stays out of the way.

**Identity dimension calibration** (Pass 307 §C):

| Pair | Stacey position | Notes |
|---|---|---|
| Calm ↔ Energetic | **Strongly calm** | Decompression, not coaching energy |
| Premium ↔ Approachable | **Both — restrained-premium that feels approachable** | "Expensive because restrained, not flashy" |
| Intimate ↔ Authoritative | **Intimate-with-quiet-authority** | Kitchen-table, not pulpit |
| Soft ↔ Structured | **Soft** | Editorial warmth |
| Boutique ↔ Scalable | **Boutique** | Small practice |
| Minimal ↔ Expressive | **Minimal** | Copy-forward |
| Luxurious ↔ Practical | **Luxurious-restraint** | Not luxe-signaling; quiet confidence |
| Warm ↔ Clinical | **Warm** | Maternal steadiness |
| Emotionally guided ↔ Information-dense | **Strongly emotionally guided** | Words do the work |
| Quiet confidence ↔ Strong personality | **Quiet confidence** | Non-performative expertise |

**Trust shape priority** (Pass 307 §D):

1. **Emotional trust** ("you are safe with me") — DOMINANT
2. **Calmness trust** ("nothing here is rushed or pushy")
3. **Warmth trust** ("she'd be kind to me")
4. **Premium-artisan trust** ("this is hand-considered, not generic")
5. **Concierge trust** ("she'll personally take care of me")

**Explicitly NOT primary:** expertise, precision, continuity (those are downstream consequences of the above, not foreground signals).

---

## §2. Essential surfaces

The site is **one page** with linear narrative scrolling. Sub-routes are deferred to v2 unless real demand emerges.

### 2.1 Single-page section sequence (per relay #33's psychologically-intelligent ordering)

| # | Section | Purpose | Approx length |
|---|---|---|---|
| 1 | **Reassurance** | Above-the-fold permission moment. "You're in the right place. This isn't going to feel like every other financial advisor website." | 1 short paragraph + tagline |
| 2 | **Story** | Grampy + the yellow legal pad origin. The most distinctive content asset. | 2-3 paragraphs |
| 3 | **Philosophy** | "Wash a ziplock bag so you can fly first class." "You are not financially unintelligent — you are financially underserved." | 3-5 short paragraphs |
| 4 | **Who it's for** | Audience self-recognition. Family / couples / individuals who feel money-anxious. | Bullet list or short prose |
| 5 | **Process clarity** | What a clarity session is. "Three specific things." Demystifies before asking. | Step list, 3-5 items |
| 6 | **Packages** | Light comparison of the offered tiers. NO pricing pressure. Use Stacey's existing package-comparison framing. | Compact 2-3 column comparison |
| 7 | **Invitation** | Soft call-to-action. "The second best time is today." Booking link or contact form. | 1 paragraph + CTA |

### 2.2 Why one page

- Pass 305 §3 finding: continuity reassurance comes from RESTRAINT and EMOTIONAL PACING. Multiple pages introduce navigation cost.
- Relay #33 finding: low cognitive branching is desirable. No "where do I click?" pressure.
- Relay #33 finding: the writing IS the product. Splitting it across pages dilutes its cumulative emotional effect.

The reader enters at "reassurance" and leaves at "invitation," following Stacey's own narrative gradient. They never have to choose what to read next.

---

## §3. Deferred surfaces (explicit exclusions)

These are NOT in v1. Each could be added later if real need emerges. None should be pre-built.

| Surface | Why deferred |
|---|---|
| Blog / writing / news | Adds maintenance burden; v1 leads with the Grampy story, not running content |
| Multi-page navigation | Compromises one-page emotional gradient |
| Newsletter signup | Asks for commitment before relationship; conflicts with concierge-trust posture |
| Authentication / user accounts | Stacey's product is conversation, not software |
| Backend / database | Static site is sufficient for v1 |
| CMS | Stacey can hand-edit copy; CMS adds gravity |
| Telemetry (Sentry / analytics) | Defer — see G4 below |
| PWA / installable | Not needed for an editorial document |
| Payments / scheduling integration | Booking can be a Calendly link or contact form at v1 |
| Search functionality | One page; nothing to search |
| Dashboards / interactive tools | Explicit relay #33 prohibition |

---

## §4. Trust-voice note (translating identity into design implications)

Without specifying any code, here is how the identity translates to design behavior. Pass 309+ will operationalize these.

### 4.1 Typography

- **Two faces:** a serif for headings + key body passages; a clean sans for navigation, captions, supporting text. Pairing should feel like fine editorial publishing (think *The New Yorker*'s restraint, not magazine glamour).
- Font sizes generous (long-form-readable, not dense).
- Line-height comfortable (1.6-1.7 for body).
- Measure (line length) restricted to ~60-72 characters for prose.
- No display-weight jokes. No giant marketing headlines.

### 4.2 Palette

- **Deep navy** as primary (think `#0a1a38`-range, not vibrant blue).
- **Warm ivory / cream** as base (yellow-legal-pad warmth without literal yellow).
- **Restrained gold** as accent (used sparingly — rule lines, key emphasis, link underline). NOT BD's premium-gold-lamp; quieter, more print-like.
- **No gradients beyond functional.** No glow effects. No glass shells.

### 4.3 Spacing rhythm

- Generous whitespace between sections (think 8-12rem section padding on desktop).
- Right-margin / left-margin generous on text columns.
- Sections separated by quiet rule-lines or whitespace, not loud dividers.

### 4.4 Motion

- **Almost none.** Reduce-motion contract honored at the CSS level (every transition has a `motion-reduce:` companion).
- Maximum acceptable motion: subtle fade-in on initial section reveal (under 400ms).
- No parallax. No scroll-triggered theatrics. No carousels. No rotating testimonials.

### 4.5 Interaction surface

- Reading scroll only.
- ONE form (contact / clarity-session request).
- One link to a booking system if Stacey already has one.
- That is it. No nav menu (or a vestigial one with anchor links, optional).

### 4.6 Voice constants (if any are introduced)

Pass 305 §2 catalogued BD's 18 timing constants. Stacey's v1 should aim for **0 explicit constants** at first. Calm CSS defaults (`transition-all duration-200`, browser-default text rendering) likely suffice. If specific cracks appear after build, calibrate locally per Pass 306 §6 calm-defaults-vs-calibration hypothesis. Each calibration is EARNED by a specific perceived flaw, not inherited.

---

## §5. Bootstrap-plan recommendation

### 5.1 Stack

The relay #33 was explicit: **static-first, minimal/no React, Tailwind only if used lightly, no provider stack, no shared infrastructure migration from BidOnDent**.

**Recommendation:** **Astro** (or pure HTML+CSS) over React.

Why Astro:
- Static-first by default (matches relay #33).
- Component composition without shipping JS to the browser.
- Excellent typography support (built-in image optimization, CSS layout shines).
- Tailwind integration if desired (for spacing/typography utilities only — not component variants).
- No provider stack required.
- No state management.
- Output is static HTML; no SSR runtime.
- Vercel-native.

Pure HTML+CSS would also work for v1 if Astro feels heavy. The choice is light.

**REJECTED stacks:**
- React + Vite (BidOnDent's stack) — overkill; introduces runtime weight Stacey doesn't need.
- Next.js — has Server Components / SSR / image optimization, but its "platform" gravity is exactly what relay #29-#33 rejects.
- Webflow / Squarespace / SquarespaceFluid / Webflow / WordPress — opinionated platforms that fight the editorial restraint goal.

### 5.2 Repo location

**NEW git repo.** NOT a folder inside BidOnDent. NOT linked via package alias. NOT sharing any node_modules.

Suggested repo name: `yellow-legal-pad` or `stacey-site` — owner picks.

### 5.3 Initial commit shape (Pass 309 target)

Approximately:

```
yellow-legal-pad/
├── README.md              (3-5 lines: what this is, how to run)
├── astro.config.mjs       (minimal — Astro defaults + Tailwind)
├── package.json           (~10 deps: astro, tailwindcss, @astrojs/tailwind, typescript, prettier)
├── tsconfig.json
├── tailwind.config.mjs    (Stacey palette + typography + NO bd-* anything)
├── src/
│   ├── pages/
│   │   └── index.astro    (the one page; sections inline initially)
│   ├── components/        (~3-5 components AS NEEDED — likely Hero, StorySection, PackageCard, ContactForm, FooterNote)
│   ├── styles/
│   │   └── global.css     (typography defaults, color tokens — Stacey-specific, not BD)
│   └── content/
│       └── copy.md        (Stacey's actual writing; can be inlined into .astro or sourced from MDX)
└── public/
    └── (any photos / assets Stacey provides)
```

**Total LOC target: <500.** Per Pass 306 §4 minimum-viable-organism hypothesis. If v1 exceeds 500 lines, examine what's actually there — likely some surface is over-built.

### 5.4 Vendor decisions

Per Pass 307 §G + relay #33:

| Vendor question | Recommended v1 answer |
|---|---|
| Hosting | Vercel (lightweight, free tier sufficient, Astro-native) |
| Auth | NONE — static site, no accounts |
| Backend / DB | NONE — static site |
| Telemetry | DEFER — owner can decide later. Possibly Plausible Analytics (privacy-friendly, calm-aligned) over Sentry/GA. NOT essential at v1. |
| PWA | NO — defer indefinitely |
| Stack | Astro + Tailwind (lite use) |
| Form submission | Either a Calendly link, a `mailto:` link, or a Vercel-hosted form action that emails Stacey. NO third-party form services with their own branding. |

### 5.5 Branding constraints

Per relay #33:

- Logo: Stacey may have one; if not, defer
- Domain: owner provides
- Imagery: minimal — avoid stock photos of smiling office workers (relay #33 avoid-list); a single Grampy photo or yellow-legal-pad illustration would be more authentic
- Custom fonts: probably yes — invest in good serif + sans pairing (e.g. EB Garamond + Söhne, or a similar editorial duo). Self-host for performance + privacy.

---

## §6. Implementation sequence (Pass 309+)

Each pass executes ONE step. Single-doc-per-pass discipline preserved.

| Pass | Trigger | Output |
|---|---|---|
| **309** | Owner ratifies this plan | NEW git repo bootstrap. `astro create` minimal scaffold + Tailwind config + first version of `index.astro` containing all 7 sections in placeholder form. ~150-200 LOC initial commit. |
| **310** | Stacey provides finalized copy for sections 1-2 (Reassurance + Story) | Implement Reassurance + Story sections with real copy. Adjust typography to feel right against actual content. |
| **311** | Stacey provides copy for sections 3-4 (Philosophy + Who) | Implement Philosophy + Who-it's-for sections. |
| **312** | Stacey provides copy for sections 5-7 (Process + Packages + Invitation) | Implement Process + Packages + Invitation sections. Add contact form / Calendly link. |
| **313** | Stacey reviews v1 staging deploy | Apply targeted refinements based on Stacey's feedback. |
| **314** | Owner authorizes production launch | Deploy to production domain. |

**Each pass < 300 lines of source change.** If a pass requires more, the scope is wrong.

**No architecture passes between these.** No "let's set up a design system" pass. No "let's add a CMS" pass. The goal is: ship the editorial document, then iterate from real reader response.

---

## §7. What this pass does NOT do

- No code (per Pass 307 §1)
- No NEW git repo (awaits Pass 309 + owner ratification of this plan)
- No infrastructure migration of any kind
- No shared package planning
- No platform-core thinking
- No provider extraction from BidOnDent
- No continuity framework
- No orchestration skeleton
- No design-token engine
- No abstraction forecasting
- No "future-proofing"
- No third live extraction (cumulative Phase F+ prohibition)
- No source modification of BidOnDent
- No LAW edit
- No CLAUDE.md / MOLANDJESUS / MAP_SHELL_HIERARCHY edit
- No PLAN_PLATFORM_* edit
- No fix or rename of `placeDiscoveryQuality.ts:51` (per relay #18)
- No fix of the 4 pre-existing TypeScript errors
- No modification of any pre-existing dirty file in working tree
- Adds ZERO new owner-decision points (cumulative remains 31)

---

## §8. Pass 281 invariants check

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15-#33 prohibitions | ZERO violations |
| `placeDiscoveryQuality.ts` source | UNTOUCHED |
| `src/platform-core/` folder | UNTOUCHED (still 2 files + README) |
| LAW / MOLANDJESUS / CLAUDE.md / MAP_SHELL_HIERARCHY / PLAN_PLATFORM_* | UNTOUCHED |
| BidOnDent source (any file) | UNTOUCHED |

---

## §9. Forward triggers

1. **Owner ratifies this plan** → Pass 309 = NEW `yellow-legal-pad` (or chosen-name) git repo bootstrap. ~150-200 LOC initial commit per §5.3 shape.
2. **Owner suggests adjustments to this plan** → Pass 308 amendments via Edit on this doc; Pass 309 begins after amendments settled.
3. **Stacey provides real copy for sections** → Pass 310+ implements one or more sections with real content per §6 sequence.
4. **Owner declines to bootstrap** → standdown.
5. **Open Pass 307 questions still useful to answer** → if any section A/B/H question (Stacey's last name? geographic reach? timeline? maintenance steward? favorite reference site?) gets answered, Pass 308 amendments capture them.

---

## §10. Status

REF doc shipped Pass 308. Plan complete. The autonomous lane has now produced a concrete, owner-facing, ratifiable plan that translates real Stacey context into specific implementation choices — without crossing the boundary into actual code. Pass 309 awaits owner ratification.

The transferable asset from BidOnDent (per Pass 305 anchor finding: "continuity reassurance is a HABIT, not a system") applies here unchanged: Stacey's site will earn its felt-continuity from local restraint and editorial care, not from inherited infrastructure. The framework is now in service of the writing, exactly as relay #33 directed.

**End of doc.**
