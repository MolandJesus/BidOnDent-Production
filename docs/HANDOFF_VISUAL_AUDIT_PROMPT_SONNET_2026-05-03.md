---
title: HANDOFF — Sonnet Deep Visual Audit Prompt
date: 2026-05-03
target_model: Sonnet (Claude Sonnet 4.6 or the current visual-audit configuration)
estimated_duration: ~1 hour
companion_docs:
  - docs/REF_VISUAL_SYSTEM.md
  - docs/VISUAL_AUDIT_PREP_2026-05-03.md
  - docs/MOLANDJESUS_DESIGN_DECISIONS.md
  - docs/LAW_PROJECT_RULES.md
---

# Sonnet Deep Visual Audit — copy-paste prompt

Below is the canonical prompt for Sonnet. Paste it as-is. Do not run it through Opus — Opus already prepared this handoff and the docs.

---

## Prompt to paste into Sonnet

> You are doing a one-hour deep visual audit of BidOnDent. You are not implementing fixes. You are not refactoring. Your output is a single prioritized Markdown report.
>
> ### Required reading (in this order, before walking the site)
>
> 1. `docs/REF_VISUAL_SYSTEM.md` — current visual system (identity, `bd-*` utility inventory, cross-app adoption, intentionally separate sibling systems). **This overrides anything older.**
> 2. `docs/VISUAL_AUDIT_PREP_2026-05-03.md` — pre-flight notes from Opus: current strengths, current risks, where to look hardest, what NOT to do.
> 3. `docs/LAW_PROJECT_RULES.md` — what BidOnDent must never become. Visual recommendations cannot violate these.
> 4. `docs/MOLANDJESUS_DESIGN_DECISIONS.md` §7 (Color Decisions, Dashboard Material Tier, Things We Will Not Do) — the long-form *why*. The owner-authorized navy-lit-by-gold-lamp identity is binding.
>
> Do not read the archived landing plans in `docs/archive/` unless you need historical context for a specific decision. They are stale relative to the current system.
>
> ### Surfaces to walk (in priority order)
>
> Open the live site at `https://bid-on-dent-production.vercel.app` (canonical Vercel URL — confirmed live). If unreachable, fall back to the dev server (`npm run dev` → `http://localhost:5173`). Walk every surface in **both light and dark mode** and **both desktop (~1440px) and mobile (~375px)**.
>
> 1. **Landing hero above the fold** — light + dark, desktop + mobile. The signature surface.
> 2. **Hero map window / quote chip / ETA chip** — does the map field feel native to the hero, or like a pasted-on demo box? Does the report→route→result story read?
> 3. **Section-to-section seams on landing** — HowItWorks → Benefits → WhoWeServe → AboutOpportunity → TrustStats → OperatingRegions → BusinessInquiry → CTA → Footer. Does the warm/cool register rhythm work?
> 4. **Map-first coverage section** — at current network density (often "0 nearby repair options"), does the section tell the right story (calmly expanding, real network) or the wrong one (empty, broken)?
> 5. **Dashboard overview** — quick actions tiles, repair activity list, map preview, profile dropdown (open it), notification center (open it).
> 6. **Account / settings page** — preferences, profile tools (My Vehicles, Help & Support, Smoke Test Checklist), Session/Sensitive actions (Sign Out, Delete Account).
> 7. **Key modals** — EditProfile, ShopProfile, BidAcceptConfirmation, ServiceArea editor (if reachable).
> 8. **Mobile landing scrolled-header gold trim + hero scene at 375px** — does the gold-lamp top-edge identity carry on mobile?
>
> ### What you are looking for
>
> For each surface, evaluate against:
>
> - **Identity coherence:** does it carry the cool-blue-glass + warm-gold-lamp + map-first identity (per `REF_VISUAL_SYSTEM.md` §1)?
> - **Light / dark parity:** is light mode a true daylight twin of dark mode, or does it feel like a different product?
> - **Visual hierarchy:** does the eye land where the product wants it to (CTAs, key data, route/pin in the hero)? Or does decoration compete with content?
> - **Mobile risk:** any overflow, tap-target failures, scene-busyness?
> - **Gold restraint:** is gold trim/glow signature, or has it spread to the point of being wallpaper?
> - **Map-first identity strength:** does the surface feel like it belongs to a spatial product, or like generic SaaS?
> - **Premium vs generic:** which surfaces feel signature, which feel "off-the-shelf"?
> - **Anti-Goal compliance:** any live-ops claims that should be marked sample/illustrative? Any "fake shop" / "fake coverage" content?
>
> ### What you must NOT do
>
> - **No code changes.** Not even tiny ones. Doc typos in your own report only.
> - **No backend recommendations.** Visual scope only.
> - **No broad refactor recommendations** beyond visual concerns.
> - **No new feature suggestions.**
> - **No "remove the gold" recommendations.** The owner explicitly authorized the navy-lit-by-gold-lamp identity (see `MOLANDJESUS_DESIGN_DECISIONS.md` §7 Pass D4 final v2 reversal, and the `feedback_external_audit_handling.md` rule). External audits suggesting amber/gold stripping are rejected by default. You can flag if it's *overused*; you cannot recommend removing the identity.
> - **No "make it look like Apple Maps" framing.** That's a frozen aesthetic. Read the current identity in `REF_VISUAL_SYSTEM.md` §1.
> - **No flattening intentional sibling systems.** `bd-map-control-pill`, `bd-map-overlay-card`, `bd-bid-card-float`, dashboard role rims, search/address inputs, disabled-field styling — all are intentionally separate. Per `REF_VISUAL_SYSTEM.md` §3.
>
> ### Output format (single Markdown file)
>
> Return one file named `docs/visual_audit_sonnet_2026-05-03.md` with this structure:
>
> ```markdown
> ---
> title: Sonnet Deep Visual Audit
> date: 2026-05-03
> auditor: Sonnet
> target_url: <URL you actually walked>
> viewports: 1440px desktop, 375px mobile (or whatever you actually walked — be honest)
> modes: light, dark
> ---
>
> ## Overall verdict
>
> One paragraph. Calm/premium/map-first scorecard. Be specific.
>
> ## What is working (do not dismantle)
>
> Bullet list. For each: where (file or surface), why it works.
>
> ## Issues — prioritized
>
> ### P0 — must address before any further visual work
>
> For each:
> - **Where:** exact file path + class/selector/component name where possible.
> - **What:** visual symptom, screenshot reference if you captured one.
> - **Why it matters:** product or trust impact.
> - **Fix direction:** concrete next pass, not "polish more." Cite the system class to use if applicable.
>
> ### P1 — should address in the next visual pass
>
> Same structure.
>
> ### P2 — worth noting, lower urgency
>
> Same structure.
>
> ## Light vs dark parity check
>
> Per surface, two-column verdict: light parity / dark parity / divergence notes.
>
> ## Mobile risk check
>
> Per critical surface (hero, header, dashboard overview, key modals): pass/risk/fail at 375px.
>
> ## Do NOT fix
>
> False positives the audit might tempt the next pass to break. Cite each one and why it should stay.
>
> ## Console / runtime observations
>
> Any visual-adjacent console warnings (not strictly visual, but flag anything you saw in DevTools while walking).
>
> ## Recommended next visual pass — top 3
>
> Concrete passes the team should run next, in priority order.
> ```
>
> ### Operating constraints
>
> - **Time budget:** roughly one hour. Don't try to walk every modal in the app — cover the priority list above well.
> - **Be honest about what you walked.** If the VS Code browser pane limits you to ~680px, say that explicitly (this happened in the prior audit).
> - **Cite exact file paths and CSS classes.** "Hero feels off" is unactionable; "`HeroSection.tsx` map-stage `boxShadow` competes with the chip glow at lines 449-454" is actionable.
> - **Cap visual recommendations at concrete passes.** "Run a hero map-frame pass that drops the rounded container and bleeds contour lines into the hero atmosphere" is good. "Make it more premium" is not.
>
> When done, save the report at `docs/visual_audit_sonnet_2026-05-03.md` and stop. Do not continue into implementation.

---

## Notes for the human running this prompt

- Run this prompt against a fresh Sonnet session. Do not include prior conversation history about implementation work — Sonnet should come at the site cold.
- After Sonnet returns the report, Opus (or whichever model handles implementation) reads the report and decides which P0/P1 items become the next visual pass plan.
- Do not let Sonnet edit code in this pass. If Sonnet starts trying to write `Edit` calls, redirect to "stay in audit mode."
- Expected runtime: 30 minutes to ~1 hour depending on viewport coverage and modal walks.
