---
status: ACTIVE
authority: REF
scope: stacey-multi-page-expansion-evidence
canonical_source_of_truth: REF_PASS_311_STACEY_MULTI_PAGE_EXPANSION_2026-05-10.md
companion_to: REF_PASS_310_STACEY_REPO_BOOTSTRAP_2026-05-10.md
supersedes: []
superseded_by: null
safe_for_autopilot: false
requires_owner_approval: true
last_topology_audit: 2026-05-10
---

# Stacey Multi-Page Expansion (Pass 311, 2026-05-10)

**Author:** Claude Opus 4.7 (1M ctx) — autonomous execution per owner relay 2026-05-10 #37 (explicit authorization to continue implementation without per-pass ratification).

**Tier:** REF (brief evidence + handoff). Companion to the actual implementation in `/Users/molalignmeagher/yellow-legal-pad/`.

---

## §1. What was built

NEW commit on the yellow-legal-pad repo: **`2d524c0`**.

5-page structure replaces the single-page scaffold from Pass 310. Real tonal copy replaces placeholders (drawing on relay #33-#37 phrases; not final Stacey copy — she edits when ready).

| File | Status | LOC | Purpose |
|---|---|---:|---|
| `src/layouts/BaseLayout.astro` | NEW | 249 | Shared shell: head, quiet non-sticky text-link header, main slot, quiet footer. Single file; no Header/Footer split (avoids component-system gravity per relay #37). |
| `src/pages/index.astro` | REWRITE | 104 | Home as welcome-mat: reassurance + brief story preview + philosophy excerpt + invitation. Story moved to /about. |
| `src/pages/about.astro` | NEW | 143 | Full Grampy origin story + Stacey's path (placeholder paragraphs for her real career copy) + philosophy expanded + who-it's-for. Wide measure for narrative breathing. |
| `src/pages/services.astro` | NEW | 131 | Process clarity ("three specific things" framing) + 3 packages (Clarity Session / Quarterly Check-In / Family Conversation) as plain `<article>` blocks with equal visual weight. NO badges. |
| `src/pages/resources.astro` | NEW | 144 | Document-library feel, 5 placeholder guide entries with real titles and descriptions. Ungated (no email required). PDFs link in once Stacey provides. |
| `src/pages/contact.astro` | NEW | 228 | Two paths: direct `mailto:` (the simplest way) and a 3-field form (name, email, optional note). NO phone, NO company, NO "how did you hear" fields. |

Total LOC across yellow-legal-pad after Pass 311: **~1380** (was 671 after Pass 310).

---

## §2. Real tonal copy integrated

Drawn from relay #33-#37 phrasings. NOT final Stacey copy; she edits when ready. The intent is that the site should already read as Stacey speaking, not as Lorem ipsum:

- "The welcome mat is out."
- "You're in the right place. There's nothing to know before you arrive."
- "You are not financially unintelligent. You are financially underserved."
- "Wash a ziplock bag if it lets you fly first class once a year."
- "The best time to start was when Grampy was sitting at the kitchen table. The second best time is today."
- "You can do this. You don't need to panic."
- "The three specific things" framing in Services.
- Grampy + yellow legal pad story in full on About.

What remains as **placeholder paragraphs**: Stacey's specific career path on About (`[Stacey's path in her own words goes here]`), her real email address (`hello@yellowlegalpad.example`), her last name across all pages (`[last name TBD]`), and the actual PDF files for Resources.

---

## §3. Navigation choice

Per relay #37 §1: navigation should feel "quietly adjacent, not app-like."

**What was built:**
- Plain text links in a small, non-sticky header at the top of each page
- Same plain text links repeated in a quiet footer at the bottom of each page
- Astro file-based routing only — no router abstraction
- Active-link highlighting via gold underline only (matches existing link convention)

**What was deliberately NOT built:**
- No sticky / floating header
- No mobile hamburger menu (the header simply wraps to two lines on narrow viewports)
- No mega menu
- No transition system between pages
- No `<Header>` / `<Footer>` / `<Nav>` component decomposition (the layout is a single file)

---

## §4. Every relay #34-#37 anti-drift consideration honored

| Concern | Implementation choice |
|---|---|
| Permission architecture | Real copy preserves the "no judgment, no pressure" voice throughout |
| Anti-optimization | No CTA buttons; single underlined `<a>` for "Book a Discovery Call"; no urgency mechanics; no popups |
| Banned CTA phrases | None of "Get Started" / "Schedule Now" / "Claim Your Session" / "Transform Your Finances" / "Take Control Today" / "Start your journey" / "Unlock clarity" / "Take control" / "Build your future" / "Step into confidence" appear |
| Printed-not-engineered | Document composition throughout; semantic HTML; NO Card / Button / Container primitives |
| 3-beat rhythm | Philosophy + invitation sections preserve reassurance → practical → permission alternation |
| Near-zero runtime | ~15 lines of client JS total; same IntersectionObserver as Pass 310; works fully without JS |
| Motion = gentle appearance only | Same fade-in CSS as Pass 310; reduce-motion respected; gated behind `.js-enabled` |
| Slight asymmetry | Sections use `column` (38rem) or `column-wide` (44rem) measure deliberately differently |
| Aesthetic-overproduction | h1 still 2.5rem; muted palette; no oversized serif drama; no uppercase tracking |
| Quietly literate typography | EB Garamond regular weight + Inter at 400/500 |
| Package display | Plain `<article>` with equal visual weight; NO "BEST VALUE" / "RECOMMENDED" badges; pricing deferred to Discovery Call (concierge convention) |
| Anti-financial-performance | NO "track your progress"; NO productivity language; NO dashboard energy |
| Resources ungated | No email-for-download wall |
| Form friction minimized | 3 fields (name, email, optional note); only email is required |
| Avoid component-system gravity | Single BaseLayout file; no Header/Footer/Nav extracted |

---

## §5. What was deliberately NOT built (Phase A/B discipline)

- **No real PDFs** for Resources page (Stacey provides; Pass 312)
- **No real email address** (placeholder `hello@yellowlegalpad.example`)
- **No real Stacey career copy** on About (placeholder bracketed paragraphs)
- **No deploy** to Vercel (build + manual deploy after owner ratifies)
- **No analytics** (deferred per Pass 309 §6.4)
- **No `<Header>` / `<Footer>` / `<Nav>` extracted components** (BaseLayout is one file; relay #37 prohibition against premature abstraction)
- **No CSS framework expansion** (still Tailwind utilities + global.css; no design-token engine)
- **No favicon**
- **No tests / CI / deploy config**
- **No transition system between pages**

---

## §6. Pass 281 invariants check (BidOnDent)

| Invariant | Status |
|---|---|
| ALL Pass 281 §11 invariants | UNTOUCHED |
| Pass 281 §12 anti-patterns | ZERO violations |
| Relay #15-#37 prohibitions | ZERO violations |
| `placeDiscoveryQuality.ts` source | UNTOUCHED |
| `src/platform-core/` folder | UNTOUCHED (still 2 files + README) |
| LAW / MOLANDJESUS / CLAUDE.md / MAP_SHELL_HIERARCHY / PLAN_PLATFORM_* | UNTOUCHED |
| BidOnDent source (any file) | UNTOUCHED |
| Cross-repo infrastructure | NONE — yellow-legal-pad is fully independent |

ZERO new owner-decision points (cumulative remains 31).

---

## §7. Forward triggers

1. **Owner runs `npm install && npm run dev` in yellow-legal-pad** → confirms feel of all 5 pages OR identifies specific cracks → Pass 312 calibrates.
2. **Stacey provides her real path/career copy for /about** → Pass 312 replaces the bracketed placeholders.
3. **Stacey edits any tonal copy I drafted** (which she will — the home, philosophy, services prose was written in her tonal range but is not yet hers) → Pass 312 swaps in her edits.
4. **Stacey provides real package descriptions / pricing** → Pass 312 updates Services.
5. **Stacey provides real PDF guides** → Pass 312 wires them in to Resources.
6. **Stacey provides her real email address** → search-and-replace `hello@yellowlegalpad.example` and `[last name TBD]` globally.
7. **Owner suggests stack / visual adjustments** → Pass 312 amendments.
8. **Owner authorizes deploy** → Pass 313 deploys to Vercel.

---

## §8. Status

REF doc shipped Pass 311 (in BidOnDent). Code commit `2d524c0` shipped in `/Users/molalignmeagher/yellow-legal-pad/`.

The Stacey site now reads as a calmly-assembled set of personal documents: home with welcome-mat reassurance, About with the Grampy story in full, Services with three calmly-presented packages, Resources as Stacey's library of useful papers, Contact with two low-friction paths to reach her.

Real copy in Stacey's tonal range (drawn from relay materials; she edits later). Navigation that orients without performing. The runtime still stays out of the way.

**End of doc.**
