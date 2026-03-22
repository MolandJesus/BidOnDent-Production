- [x] Verify that the copilot-instructions.md file in the .github directory is created.
- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [x] Launch the Project
- [x] Ensure Documentation is Complete
- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.

## Map And Navigation Non-Negotiables (Humans + AI)

- Supabase is source of truth for report, vehicle, and user persistence.
- localStorage is cache/recovery only and must not silently override cloud truth.
- Real providers are required for routing/place/search in production paths.
- Demo map data must stay clearly labeled and isolated to demo-only paths.
- Every map-related change must update both map master and tracker docs:
  - `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
  - `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`
- Validate mobile and desktop behavior for every map UI pass.

## Architecture Rules

- services = data/domain logic only
- hooks = orchestration/state lifecycle
- components = rendering + local interaction only
- utils/helpers = transforms/formatting/calculations
- Clerk = identity, Supabase = backend (via edge functions, never direct in components)
- File soft limit: 300 lines. Hard limit: 500 lines. Extract before deepening.
- Reuse existing services/hooks/components before creating new ones.
- Do not pack new behavior into already-large files — default toward extraction.

## Always-Run Quality Loop (Every Pass)

After every meaningful pass, check ALL of the following:

1. **Build**: Run `npm run build`. Inspect output. Do not ignore warnings.
2. **Diagnostics**: Check touched files for VS Code problems/errors. Fix real issues.
3. **Spellcheck**: Run `npx cspell lint` on touched files. Prioritize user-facing strings, doc headings, key terminology. Domain words go in `cspell.json`.
4. **Terminal**: Review terminal output for runtime warnings, deprecations, or unexpected behavior.
5. **Doc alignment**: If system meaning, stage status, or execution guidance changed, update the relevant docs (Product Brain, Map Tracker, Map Master Plan).
6. **Mobile + desktop**: For touched UI, verify both form factors where practical.

## Problem Taxonomy (P0–P7)

Classify issues found during any pass. Use these codes in reports and for prioritizing large-scale sweeps:

- **P0-BUILD**: Build-breaking, compile error, type failure
- **P1-RUNTIME**: Runtime crash, hydration failure, render failure, broken state flow
- **P2-DATA**: Schema drift, identity mismatch, persistence inconsistency, stale/malformed storage
- **P3-ARCH**: Architecture, file-shape, responsibility-boundary problem
- **P4-UX**: Misleading UI state, layout issue, weak recovery, mobile/desktop regression
- **P5-DOC**: Docs out of sync, wrong stage status, missing guidance
- **P6-SPELL**: Spelling, wording, terminology inconsistency
- **P7-TECHDEBT**: Known non-blocking weakness to stage later

When a pass introduces many issues of the same category, fix them as a coherent sweep.

## Large-Scale Change Protocol

For passes affecting multiple screens, shared shell surfaces, or multiple systems:

**Pre-pass**: Which docs govern this? Which systems are touched? Which weak seams (from Code Organization Audit) are nearby? What failure categories are most likely?

**Post-pass**: Build reviewed? Diagnostics reviewed? Spellcheck reviewed? Docs updated? Touched UI reviewed? Problem categories listed?

## Build & Verify Commands

- Build: `npm run build` (Vite, ~1.6-1.7s)
- Spellcheck: `npx cspell lint "src/**/*.{ts,tsx}" "docs/**/*.md" --no-progress`
- Do NOT use `npx tsc --noEmit` (resolves wrong package)

## Documentation as Operating System

Treat docs as essential to the codebase, not passive reference:

- `docs/BIDONDENT_PRODUCT_BRAIN.md` — primary execution framework
- `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` — strategic map law
- `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md` — delivery reality
- `docs/CODE_ORGANIZATION_AUDIT.md` — weak seams, safe boundaries

A future AI or human should be able to read one Quick Card and one Upgrade Checklist in the Product Brain and begin correct work without reading the full codebase.

## Report Format After Each Pass

1. Pass chosen and why
2. What changed
3. Files touched
4. Validation (build, diagnostics, spellcheck, mobile/desktop)
5. Problem taxonomy summary (P0–P7 found/fixed/remaining)
6. Architecture decisions made
7. Doc updates made
8. What this unlocks next
9. Best next immediate pass
