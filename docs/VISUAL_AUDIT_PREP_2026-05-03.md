---
title: Visual Audit Prep — pre-flight notes for the Sonnet deep audit
date: 2026-05-03
authority: PREP — feeds `HANDOFF_VISUAL_AUDIT_PROMPT_SONNET_2026-05-03.md`
status: READY — Sonnet audit not yet run
---

# Visual Audit Prep — 2026-05-03

This doc is the pre-flight before the Sonnet visual audit. Sonnet should consume this **plus** `REF_VISUAL_SYSTEM.md` before walking the site. Owner-facing summary of where the design system stands and what we want Sonnet to look hardest at.

---

## 1. Current visual strengths

These are working well as of the doc cleanup. Sonnet should confirm rather than re-redesign.

- **Dark landing now reads premium and map-first.** The hero scene (Liquid Map Intelligence) shows a stylized map base + topographic contour + gold flow + route lines + pulsing report pin + 2 sample chips. Frame just softened from "card" to "embedded window" (no hard border, glassy inset highlight + ambient bloom). Top edge now carries the dashboard's gold-lamp shadow stack — landing → dashboard in dark mode reads as the same room.
- **Dashboard dark mode is strong.** Quick-action tiles, profile dropdown, notification center, role-stat strip all consistently carry the inset gold trim + ambient glow signature (`inset 0 -1px 0 rgba(220,165,90,~0.18)` + `0 0 ~24-28px rgba(220,140,50,~0.14-0.18)`).
- **Account/settings surfaces are clean.** Profile dropdown, account settings, notifications snapshot all feel like they belong to the same product.
- **Cross-app primary CTAs unified.** ~25+ primary CTAs (landing/auth/onboarding/dashboard/legal/error-boundary) now use `bd-dashboard-primary-button` shell. Hand-rolled `rounded-xl + opacity-90 hover` legacy is largely gone from primary CTAs.
- **Inputs unified.** Auth, landing inquiry forms, account modals, onboarding, report flow all share `bd-report-input` (warm cream bg in light, navy in dark, gold focus ring + translateY lift).
- **Reduced-motion + mobile motion-budget guards in place** for all Liquid Map Intelligence motion. Hero chips also now `display: none` < md (audit-resolved KI-062).

---

## 2. Current visual risks

These are the things most likely to fail an outside review. Sonnet should weight these in the report.

- **Hero right-side map field may still read as a "boxed mock."** Even after softening, the rounded frame + aspect-ratio container is a discrete rectangle. The chat brief target was "embedded map window with route artifacts magnetized to the network." Worth a fresh eye on whether the integration goes far enough or is still readable as "headline left, demo box right."
- **Light mode may not be a true daylight twin of dark mode.** Dark mode got the explicit gold-lamp parity pass; light mode hero already had rich amber atmosphere from earlier passes but wasn't re-walked against the dark identity. Risk: light reads as a different product than dark instead of the same product in different light.
- **Gold trim + glow can become overused.** The same shadow stack now appears on dashboard + landing header + landing hero. If it's also crept into too many cards/eyebrows, the warm rim becomes wallpaper instead of signature. Worth Sonnet inventorying every gold-trim site and flagging if it's diluting.
- **Mobile hero scene needs verification.** Chip overflow is fixed, but the underlying map stage at narrow viewports may itself be doing too much (drift, sheen, route shimmer all running). Sonnet should walk 375px in both modes and confirm the stage feels calm, not busy.
- **Coverage section "0 nearby repair options" empty state.** Real, by design at current network density. May read as "nothing here" rather than "calmly expanding" — worth a copy + tone check.
- **Footer + CTA section edges in light mode** transition from warm brown band → cool blue → cream. Worth Sonnet confirming the section seams feel intentional, not like print-color-bar artifacts.
- **Many surfaces use prop-drilled `isLightAppearance` ternaries.** Not a visual issue per se, but it makes per-surface mode parity hard to verify by reading code. Worth Sonnet flagging any surface where light/dark feel non-twin.

---

## 3. Highest-value audit targets for Sonnet

Walk these surfaces hardest, in this order:

1. **Landing hero above the fold (light + dark, desktop + mobile)** — the signature surface.
2. **Hero map window / quote chip / ETA chip integration** — does the scene feel native or pasted-on?
3. **Light vs dark mode parity** across hero + every landing section — same product in two lighting conditions, or two different products?
4. **Section-to-section seams** on landing — does the warm/cool register rhythm work, or are seams jarring?
5. **Map-first coverage section** — at this density, does it tell the right story (calmly expanding) or the wrong one (empty)?
6. **Dashboard overview** — quick actions, repair activity list, map preview, profile dropdown, notification center.
7. **Account / settings page** — preferences, profile tools, sensitive actions section.
8. **Key modals** — EditProfile, ShopProfile, BidAcceptConfirmation, ServiceArea editor.
9. **Mobile landing hero + scrolled header** — top edge gold-lamp, hero stage at 375px, mobile drawer.

---

## 4. Things Sonnet should NOT do in this audit

- No code changes. (Trivial doc typos OK; no source edits.)
- No backend changes.
- No broad refactor recommendations beyond visual concerns.
- No new feature suggestions.
- No fake shop/coverage/region claims (live ops content must stay accurate or marked sample).
- No "make it look like Apple Maps" framing — that's a frozen aesthetic from earlier and is no longer current. Read `REF_VISUAL_SYSTEM.md` §1 for the actual current identity.
- No "remove the gold" recommendations — owner explicitly authorized the navy-lit-by-gold-lamp identity (see `feedback_external_audit_handling.md` in agent memory and `MOLANDJESUS_DESIGN_DECISIONS.md` §7). External audits suggesting gold removal are rejected by default.
- No flattening of intentional sibling systems (`bd-map-control-pill`, `bd-bid-card-float`, role rims on dashboard cards, search/address inputs, disabled-field styling).

---

## 5. What Sonnet's output should look like

A single Markdown report with:

- A short overall verdict (calm/premium/map-first scorecard).
- A prioritized list of issues — P0 / P1 / P2 — each with:
  - **Where** (exact file path + selector/class where possible)
  - **What** (visual symptom)
  - **Why it matters**
  - **Fix direction** (concrete next pass, not "polish more")
- A "what's working" section so we don't dismantle wins.
- A "do NOT fix" section flagging false positives the audit might tempt us to break.

Sonnet should spend roughly an hour. Not a code-edit pass.

The detailed copy-paste-ready prompt for Sonnet lives in `HANDOFF_VISUAL_AUDIT_PROMPT_SONNET_2026-05-03.md`.
