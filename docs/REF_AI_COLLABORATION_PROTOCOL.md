# BidOnDent - AI Collaboration Protocol (REFERENCE)

**Authority level:** REFERENCE - current operating truth for multi-AI sessions, owner relay prompts, and agent-to-agent planning.
**Last updated:** 2026-05-05
**Status:** Active reference
**Scope:** How AI agents should interpret, clean up, and act on Mola's multi-agent conversations inside this repo.
**Companion (output layer):** [`OPS_AI_AGENT_PROMPT_DESIGN_KERNEL.md`](OPS_AI_AGENT_PROMPT_DESIGN_KERNEL.md) — when writing a relay prompt for an execution agent (Sonnet, Mola's Coder, etc.), use the kernel's 8 rules + 3-stage pipeline template.

---

## Why This Exists

Mola often works with several AI agents in sequence or in parallel: Codex, Claude/Opus, Sonnet, Cursor, ChatGPT, and other planning/build agents. A single message may contain:

- Mola's live instruction
- a pasted transcript from another AI
- a handoff prompt written by a previous agent
- screenshots or visual audit notes
- Mola's extra add-on ideas inserted in the middle
- code/output logs from another tool
- a request to plan only, or a request to go full autopilot

Agents must not treat that whole paste as one flat prompt. The job is to extract the real steering signals, separate evidence from opinion, respect repo law, and turn the conversation into clean next action.

This protocol is the canonical BidOnDent rule for that work.

---

## Source Hierarchy

Use this hierarchy when multi-agent context conflicts:

1. **LAW docs** - `docs/LAW_PROJECT_RULES.md` and `docs/LAW_HARDENING_PLAN.md`.
2. **Explicit owner directives in the current session** - unless they violate LAW or safety boundaries.
3. **Verified code/runtime/screenshot reality** - what the current branch and browser actually show.
4. **REFERENCE docs** - current truth, updated as facts change.
5. **Other AI output** - useful context, not proof.
6. **PLAN docs and handoff prompts** - proposed direction, not current truth unless explicitly approved.
7. **Archived docs** - history only.

If Mola says something that appears to conflict with LAW, do not silently obey or silently reject. Name the conflict, explain the safe interpretation, and proceed only within the allowed path or ask for an explicit per-session override when the LAW permits one.

---

## The Directive Extraction Loop

When Mola pastes a long multi-AI transcript, run this loop before acting:

1. **Identify Mola's current ask.**
   - Is this planning-only?
   - Is this a prompt-writing request?
   - Is this permission to execute?
   - Is this a status update from another AI that Mola wants folded in?

2. **Separate voices.**
   - Owner directive: what Mola is saying now.
   - Prior AI claim: what another AI said or did.
   - Evidence: screenshots, code, terminal output, audit findings.
   - Proposal: plan, suggested pass order, future prompt, optional idea.

3. **Extract add-on directives.**
   Mola often adds key constraints in casual phrases such as:
   - "also add..."
   - "what ChatGPT wanted to add..."
   - "this is what Codex wants you to see..."
   - "go full auto..."
   - "do not do anything yet..."
   - "don't white things out..."
   - "make it premium everywhere..."

   Treat those as real owner input. Do not discard them as noise because they are embedded inside a pasted transcript.

4. **Translate expressive language into constraints.**
   Preserve the intent, then operationalize it.

   | Mola phrase                                              | Engineering/design interpretation                                                                                             |
   | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
   | "go full hammer" / "to the max"                          | Be ambitious within the approved scope, but preserve existing wins and verify hard.                                           |
   | "do not white things out"                                | Do not flatten visual depth, remove atmosphere, or replace rich treatment with plain panels.                                  |
   | "more gold / amber glow"                                 | Richer gold as light: rim, halo, inset, bloom, sheen. Do not make gold paint or wallpaper.                                    |
   | "liquid glass / 3D / more shadow"                        | Add thickness, refraction, inset highlights, contact shadows, layered depth, and glass hierarchy.                             |
   | "make mobile user friendly / map focus"                  | Protect mobile bottom tabs, safe areas, compact headers, visible map surfaces, and avoid sheet-first fullscreen maps.         |
   | "landing more eye catching, dashboard more professional" | Landing can carry stronger gold story bands; dashboard gets restrained cool glass with gold lighting, rim, shadow, and sheen. |
   | "talk and plan only"                                     | No file edits. Synthesize, ask, prompt, or plan.                                                                              |
   | "go full auto / do not stop for me"                      | Execute approved scope using safe defaults. Stop only for hard-stop risks.                                                    |

5. **Restate the extracted plan when useful.**
   For complex work, briefly reflect the interpreted directives before editing. This catches misunderstandings without forcing Mola to rewrite everything.

6. **Act according to the mode.**
   Planning-only means no edits. Autopilot means execute scoped work, validate, update docs, and report.

---

## Planning-Only vs Autopilot Cues

### Planning-Only Cues

If Mola says any of these, do not edit files unless explicitly invited:

- "don't do anything yet"
- "just planning"
- "just talk with me"
- "thinking/gathering context"
- "write a prompt back"
- "what do you think?"

In planning-only mode, useful outputs include:

- a clean synthesis
- a prompt for another AI
- a proposed pass order
- risks and corrections to another AI's read
- a decision table
- a lightweight checklist

### Autopilot Cues

If Mola says any of these, proceed within the approved scope:

- "go full auto"
- "do so yourself"
- "do what's best"
- "don't stop for input"
- "full autopilot approved"
- "start working"
- "execute V1/V2/V3"

Autopilot does not remove safety. It means:

- use judgment on small choices
- do not pause for copy/color/spacing micro-decisions
- keep the pass scoped
- validate
- update docs when facts change

Stop only for hard-stop risks listed below.

---

## Hard Stops Even During Autopilot

Stop and ask before proceeding if the work requires or risks:

- a LAW conflict
- destructive data mutation
- production database changes
- schema migration
- auth/storage invariant changes
- map provider changes
- secret/deploy/cloud-resource actions
- data loss
- payment/transaction behavior changes
- broad product-scope expansion beyond the approved pass
- overwriting unrelated user or agent changes

Do not stop for:

- small copy choices
- exact glow/shadow values
- hover treatment details
- whether to wrap vs scroll a noncritical pill row
- local docs-only edits
- splitting an implementation into safer commits

---

## Multi-AI Relay Prompt Pattern

When Mola asks one agent to prompt another, produce a clean relay prompt with these sections when relevant:

1. **Mission**
   - What the next AI should accomplish.

2. **Required reading**
   - LAW/REF/PLAN docs in the correct order.

3. **Current state**
   - What is shipped, what is in-flight, what is historical.

4. **Owner directives**
   - Mola's live add-ons, translated into concrete constraints.

5. **Corrections to prior AI output**
   - Claims that need verification, were wrong, or require nuance.

6. **Preserve list**
   - Existing wins that must not be flattened or removed.

7. **Scope**
   - What to change and what not to change.

8. **Autonomy level**
   - Planning-only, suggested plan, scoped execution, or full autopilot.

9. **Stop conditions**
   - The hard stops for that specific pass.

10. **Verification**

- Build, browser surfaces, mobile/desktop, light/dark, screenshots, console checks.

11. **Expected output**

- Plan doc, patch, commit, report, screenshot set, or handoff prompt.

Do not paste raw messy chat as the only handoff if there is time to synthesize it. The value of the relay is reducing ambiguity for the next agent.

### Required Design Relay Addendum

If the relay prompt is for BidOnDent visual work, include an explicit anti-regression block:

- Current design is already premium; the next agent improves only.
- No whitewashing, no flat white SaaS reset, no removal of the gold-lamp identity.
- Light mode must stay cool blue-gray + cream/champagne glass + bronze trim; dark mode stays navy/cool map world with gold lighting.
- Gold means premium light behavior: top lamp, edge rim, inset reflection, focus halo, hover sheen, atmospheric bloom.
- Landing can be more eye-catching with stronger warm/gold narrative bands; dashboard should stay professional, scannable, cool, and map-first.
- Mobile screenshots count as primary evidence. Call out safe-area, browser-toolbar, bottom-nav, sheet height, and map-visibility findings.

---

## Handling Other AI Claims

Other AI output is useful but can be stale, branch-specific, or overconfident.

Before acting on another AI's claim:

- Check whether it used production, localhost, or the active branch.
- Check whether screenshots match current code.
- Check whether a P1/P2 label is based on user trust, actual breakage, or visual taste.
- Check whether a claimed root cause is proven by code.
- Check whether a proposed fix violates LAW/REF docs.

Examples from current visual work:

- A red dashboard thumbnail with other thumbnails working is likely a single bad record or fallback-state issue, not automatically a global storage hydration bug.
- A production Vercel screenshot may reflect `main`, while active work may live on `BidOnDent-Horizon-Beta`.
- "More gold" must be reconciled with the visual-system rule that gold is light, not paint.

When correcting another AI, do it plainly and usefully. Do not dunk on it. Fold the corrected understanding into the next plan.

---

## Dirty Worktree and Parallel Agent Protocol

Mola may have multiple agents editing the same repo. Before editing:

1. Run `git status --short`.
2. Identify files already modified or untracked.
3. Assume unknown changes belong to Mola or another agent.
4. Do not revert, reset, or overwrite them.
5. Avoid editing a file another agent is clearly working in unless the user's current request requires it.
6. If you must touch an already modified file, read it first and make a narrow patch around the target section.
7. In your final report, name any existing dirty files you intentionally avoided.

For relay/planning/doc work, prefer docs and agent instructions over source files when another implementation agent is active.

---

## Documentation Hygiene

Do not create doc sprawl. Use the authority model:

- New permanent operating behavior belongs in `REF_*` or `LAW_*`, depending on authority.
- Current visual truth belongs in `REF_VISUAL_SYSTEM.md`.
- Current system truth belongs in `REF_SYSTEM_STATE.md`.
- Known bugs belong in `REF_KNOWN_ISSUES.md`.
- Temporary handoff prompts can exist, but should be archived when superseded.
- Historical plans should move to `docs/archive/` after completion.

When adding a new AI-agent behavior that applies across projects, consider lifting it into a reusable skill under `~/.claude/skills/`. For BidOnDent-specific relay handling, this REF doc is the canonical source.

---

## Reporting Back to Mola

When work came from a multi-AI relay, final reports should say:

- what owner directives were treated as binding
- which other-AI findings were accepted, corrected, or deferred
- which docs or source files changed
- what was deliberately not touched to avoid collision
- what was verified
- what remains for the next agent/pass

Keep it direct. Mola wants continuity and judgment, not a generic summary.
