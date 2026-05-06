# BidOnDent — AI Agent Prompt Design Kernel (OPS)

**Authority level:** OPS — operational lessons, used by future AI agents (especially Mola's Coder) when designing relay prompts or autopilot specs.
**Last updated:** 2026-05-05
**Status:** Active
**Worked example:** KI-113 / Phase 7.6 reduced-motion migration relay (v1 → v4 evolution, May 2026).
**Companion doc:** [`REF_AI_COLLABORATION_PROTOCOL.md`](REF_AI_COLLABORATION_PROTOCOL.md) — multi-AI source separation rules.

---

## Why This Exists

In May 2026 the orchestration layer (Opus advisor + Opus builder + Sonnet browser) iterated a single Sonnet relay prompt through four versions while shipping KI-113. Each round eliminated a specific class of LLM failure mode. The lessons are reusable for every future autopilot/relay spec written for Mola's Coder, Sonnet, or any execution-grade agent.

This doc captures **the patterns**, not the specific KI-113 prompt. Use it as the design checklist when writing the next one.

---

## The Four Iterations (compressed)

| Version | Core change                                                                                                                                                                                        | Failure mode it eliminated                                                     |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **v1**  | Single dense prompt mixing migration + UX audit + verification                                                                                                                                     | Role overlap, "model thinks like designer while coding"                        |
| **v2**  | Split into Executor (Commits 2–8) + Auditor (Commit 9)                                                                                                                                             | UX reasoning bleeding into mechanical edits                                    |
| **v3**  | Inline file anchors per commit; binary smoke rule; "prefer inclusion" global                                                                                                                       | Silent file omission; subjective smoke interpretation                          |
| **v4**  | Three-stage pipeline (Executor → Auditor → Finalizer); deterministic CSS rule (`transition-duration === "0s"` OR `transition-property === "none"`); prompt-as-source-of-truth; STOP-on-uncertainty | False-positive doc closures; cross-doc drift; ambiguous "uncertainty handling" |

---

## The Kernel — 8 Rules for Execution-Grade Agent Prompts

Apply these to every relay prompt longer than a single small task.

### 1. Stage separation (one cognitive task per stage)

Do not mix:

- mechanical mutation (Executor)
- runtime verification (Auditor)
- side effects with state, e.g. docs, branches, deploys (Finalizer)

Each stage gets its own prompt. Stages communicate only via a single explicit verdict (e.g. `CLEAN` / `BLOCKED`).

### 2. Prompt-as-source-of-truth

Inline every authoritative list (file paths, commit messages, smoke surfaces) directly in the prompt. Reference docs only as "informational." This eliminates cross-source ambiguity and protects against upstream doc drift.

**Tradeoff (must be conscious):** determinism increases, resilience to upstream doc edits decreases. Acceptable when execution discipline matters more than future re-runs.

### 3. Binary, observable, deterministic checks

Replace every UX-feel rule with a measurable runtime condition.

- ❌ "no fade", "feels instant", "visually imperceptible"
- ✅ `transition-duration === "0s"` OR `transition-property === "none"`
- ✅ literal substring match: `useReducedMotion()` AND `transition: { duration: reduceMotion ? 0 :`

If the rule cannot be evaluated by a string match or a `getComputedStyle()` lookup, it is too soft for an execution agent.

### 4. Anti-hallucination clause for runtime data

Always include literally:

> "If a value is not explicitly present in Playwright/runtime output, do not reconstruct or estimate. State `not observable in runtime log`."

Without this, agents fabricate plausible DOM values to satisfy the report schema.

### 5. Failure semantics must be explicit

`FAIL → STOP` is not enough. Spell out the state machine:

> "On FAIL: halt pipeline immediately and return control. Do not retry. Do not partially continue. Do not roll back."

Otherwise the agent freezes mid-pipeline in undefined state.

### 6. Scope guardrails (two-sided)

Tell the agent what to include AND what not to include:

> "Completeness within scope contract > correctness > optimization. Never add files not explicitly listed in this prompt."

The first half prevents silent omission. The second half prevents helpful expansion.

### 7. Global STOP-on-uncertainty valve

In every stage:

> "If any uncertainty arises, STOP and report. Do not continue the sequence."

This is the single most powerful safety rule. It costs nothing to add and prevents whole categories of drift.

### 8. Constraint compression

Repeating "do not refactor / do not optimize / do not chain" 6+ times causes saturation. Smaller models start ignoring constraints when the constraint surface is too large. Compress to one block:

> "Hard Constraint: No refactoring, no optimization, no global behavior changes, no scope expansion. Only apply [pattern] exactly."

---

## Anti-Patterns Observed (do not reintroduce)

| Anti-pattern                                     | Why it fails                                                  |
| ------------------------------------------------ | ------------------------------------------------------------- |
| "Use scope contract for exact file lists"        | Smaller models miss external lookups; silent omission         |
| "Quote DOM values verbatim" (without fallback)   | Hallucinated values to satisfy schema                         |
| "System feels correct" / "UX coherence" language | Triggers designer-mode reasoning during execution             |
| Auditor that also writes docs                    | Doc commits land even when audit found problems               |
| "CRITICAL" labels sprinkled throughout           | Saturation; everything becomes critical = nothing is critical |
| Onboarding-flow narrative simulations            | Non-deterministic, opinion-generating                         |
| Multiple "do not X" lines                        | Constraint saturation; ignored after ~5 repeats               |

---

## Reusable Patterns Observed (apply when applicable)

Positive-side catalog symmetric to anti-patterns. Each pattern surfaced from concrete in-session events; cite anchors are real commits so future sessions can verify the pattern was load-bearing.

### Pattern 1: Multi-source reconciliation — third-variable rule

**Rule:** When two trustworthy sources disagree, the answer is usually a third variable neither sees. Do not pick one source — find what's outside both.

**Why:** Two-source disagreement looks like a binary truth question ("which is right?"), but the failure mode for autonomous agents is picking one and acting on it. Both can be locally accurate while the system is in a state neither describes.

**Worked examples (BidOnDent autopilot session 2026-05-05):**

- Dependabot triage sweep: [`OPS_DEPENDABOT_TRIAGE_2026-05-04.md`](OPS_DEPENDABOT_TRIAGE_2026-05-04.md) reported `COMPLETE — 0 vulnerabilities`. GitHub Dependabot showed 3 OPEN alerts. Naive picks (dismiss alerts as fixed; re-run patches on the working branch) both wrong. Third variable: branch divergence. `BidOnDent-Horizon-Beta` had patches; `main` did not. Each source was accurate about its own scope. Resolution: document, defer to merge, ship 0 code. Commit `40cc5b4e`.
- Self-source drift catch (same session): the planner-AI wrote a Builder prompt asserting Phase 8.5 was "partially closed via §9 footer; this finishes the phase status itself." Builder grepped and found Phase 8.5 was already **CLOSED via Path Y** across all four load-bearing locations ([`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) session log, audit header, audit §9, [`PLAN_DOC_INDEX_BY_PHASE.md`](PLAN_DOC_INDEX_BY_PHASE.md) row) as of commit `baee9966`. Third variable: what shipped ~30 minutes earlier vs the planner's stale cache. Prompt withdrawn before send.

**How to apply:** When two authoritative sources contradict, the first move is to enumerate each source's scope and grep for variables outside both — *not* to pick one. Especially load-bearing when one source is "this session's prior commits" and the other is a stale doc, an external system, or a planner cache. Self-source drift is a real failure mode; the third-variable test catches it before action.

### Pattern 2: Audit pre-staging legalizes autopilot under hard-stop conditions

**Rule:** Pre-execution audits that name Path A (execute) / Path B (defer-with-annotation) / Path Y (docs-only) close-commit shapes AND explicitly default-recommend one path collapse the owner decision to "was there an explicit override?" — a check the agent can satisfy locally. Without that framing, the same close is a hard-stop awaiting owner pick.

**Why:** Owner-pick decisions are normally hard-stops for autopilot ("don't proceed without re-confirmation"). Audits that pre-stage paths convert a strategic decision into a constraint-satisfiable execution. The audit *converts* a soft preference into a binary override-check.

**Worked example:**

- Phase 8.5 close 2026-05-05: [`OPS_PHASE_8_5_PRE_EXECUTION_AUDIT_2026-05-05.md`](OPS_PHASE_8_5_PRE_EXECUTION_AUDIT_2026-05-05.md) §5 default-recommended Path Y; §8 enumerated close-commit shapes for both Path A and Path Y. Under autopilot directive with no explicit Path-A override, autopilot legally executed Path Y — folded findings F1+F2+F4 into KI-112 as F4+F5+F6 (audit F3 maps to existing KI-112 F2), 0 code edits. Commit `baee9966`. Without the audit's pre-staging, this would have been an owner-pick hard-stop.

**Counter-example (no pre-staging is correct here):** KI-112 sub-fix activation has no Path A/B/Y framing. Its fix-direction reads *"Owner taste decisions required before any sub-fix activation."* Autopilot cannot activate F1–F6 — there is no pre-staged default. This is the structural absence of the pattern, and it is correct: pre-staging only works when there's an autopilot-legal default. Pre-staging owner-taste decisions falsely implies the agent can execute without taste input.

**How to apply:** When designing a pre-execution audit, enumerate Path A/B/Y close-commit shapes and explicitly mark one as default-recommended. The default may legitimately be "defer" — that is a valid path. Do **not** pre-stage paths whose execution requires owner taste; the absence of a default is the correct posture in those cases. Pattern 2 is a tool for collapsing decisions agents can make, not a license to collapse decisions they can't.

---

## Pipeline Template (copy-adapt for next relay)

```
Stage 1 — Executor
  Global rules: scope-bounded completeness, prompt-authoritative, STOP on uncertainty
  Required reading: <minimum viable list, ≤3 docs>
  Pattern: <canonical code shape, exact>
  Per-batch file lists: <inline, fully enumerated>
  Per-batch smoke gate: <binary observable rule>
  Hard constraint: <one line>
  Hard stops: <enumerated triggers>
  Done condition: <branch state + handoff target>

Stage 2 — Auditor
  Validation only. No code edits. No docs edits.
  PASS / FAIL only. No commentary unless FAIL.
  Anti-hallucination clause.
  Tasks = boolean checks anchored to runtime DOM or literal string match.
  Verdict: CLEAN | BLOCKED. Hand off only if CLEAN.

Stage 3 — Finalizer
  Runs only if Stage 2 verdict = CLEAN.
  Optional: re-check Stage 2 summary counts before committing.
  Edits exactly the enumerated docs. Nothing else.
  Single commit with prescribed message.
```

---

## Mola's Coder Agent — Specific Notes

When invoking Mola's Coder for autopilot work:

1. **Always provide the pipeline template above** if work spans more than one commit
2. **Anchor file lists inline** — Mola's Coder reads docs but should not depend on them for execution truth
3. **Pre-classify uncertainty** — if you (the planner) are unsure, the executor will be too. Resolve before handoff
4. **Match autonomy to verifiability** — full autopilot only for scopes where every step has a binary smoke gate
5. **Smoke-gate substitution** — if owner cannot run browser smoke between batches, the executor must (Sonnet+Playwright). Never skip
6. **Hand off, do not chain** — Executor finishes → produces verdict → next agent picks up. No same-prompt multi-stage work

---

## Open Hardening (deferred)

These are next-step refinements not yet applied:

- **Finalizer cross-check** — Finalizer re-reads Auditor summary counts before committing docs (defense against false `CLEAN`)
- **DOM specificity rule** — replace "inspect every migrated `motion.*` element" with "inspect all DOM nodes containing `motion.*` in rendered routes touched in this commit"
- **Pattern-presence as string match** — Auditor Task "Pattern A present" should match literal substrings, not semantic intent
- **Reconciliation layer** — when prompt-as-source diverges from scope contract over time, who reconciles? (Currently: human)

These are tracked here so the next iteration of any execution-grade prompt can fold them in without re-discovering the gap.

---

## Cross-References

- [`REF_AI_COLLABORATION_PROTOCOL.md`](REF_AI_COLLABORATION_PROTOCOL.md) — how to extract directives from multi-AI pastes (input layer)
- [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) — non-negotiable rules every prompt must respect
- [`OPS_KI_113_REDUCED_MOTION_SCOPE_CONTRACT_2026-05-05.md`](OPS_KI_113_REDUCED_MOTION_SCOPE_CONTRACT_2026-05-05.md) — the worked example that produced this kernel

---

## Co-Update Trigger

Update this doc when:

- A new failure mode is observed in a relay prompt (add to anti-pattern table)
- A new positive pattern is observed across ≥2 relay events with concrete cite anchors (add to reusable-patterns section)
- A new rule proves necessary across ≥2 relay prompts (promote to kernel rule)
- An "open hardening" item is applied (move out of deferred list)
- The pipeline template gains or loses a stage
