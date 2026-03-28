# BidOnDent — MCP Plugin Integration Plan

**Last updated:** March 28, 2026

**Created:** 2026-03-24
**Status:** Planning — ready for phased adoption
**Owner:** MolandJesus

---

## Overview

BidOnDent has access to 8 MCP plugin integrations. This document maps each plugin to concrete BidOnDent workflows, ranks them by impact, and defines an adoption roadmap.

---

## Plugin Assessment Matrix

| Plugin              | Relevance | Priority | BidOnDent Use Case                                                |
| ------------------- | --------- | -------- | ----------------------------------------------------------------- |
| **Supabase**        | Critical  | P0       | Database ops, migrations, type generation, security/perf advisors |
| **Sentry**          | Critical  | P0       | Error tracking, issue triage, release health                      |
| **Figma**           | High      | P1       | Design-to-code pipeline, component mapping, screenshot audits     |
| **Notion**          | High      | P1       | Project tracking, sprint docs, decision logs                      |
| **Google Calendar** | Medium    | P2       | Sprint planning, deadline tracking, release scheduling            |
| **Gmail**           | Medium    | P2       | Stakeholder updates, deploy notifications                         |
| **Indeed**          | Low       | P3       | Future hiring workflows (not relevant now)                        |
| **Microsoft Learn** | Low       | P3       | Azure/MS docs reference (not on MS stack)                         |

---

## P0 — Critical (Immediate Adoption)

### Supabase

BidOnDent's entire backend runs on Supabase. This plugin enables direct database management without leaving the development workflow.

**Capabilities:**

- `execute_sql` — Run queries, check data, debug issues
- `apply_migration` — Create and apply schema migrations
- `generate_typescript_types` — Auto-generate TS types from schema (eliminates manual type maintenance)
- `get_advisors` — Security and performance recommendations
- `list_tables` / `list_extensions` — Schema exploration
- `get_logs` — Runtime log inspection
- `list_migrations` — Migration history audit
- `deploy_edge_function` — Deploy serverless functions
- `get_project_url` / `get_publishable_keys` — Environment config

**Integration Plan:**

1. **Phase 1 (Now):** Run `get_advisors` to get security/perf recommendations. Run `list_tables` to verify schema state.
2. **Phase 2:** Use `generate_typescript_types` to auto-generate types and replace hand-maintained type files. Wire into build workflow.
3. **Phase 3:** Use `execute_sql` for data debugging during development. Use `get_logs` for runtime issue investigation.
4. **Phase 4:** Use `deploy_edge_function` for serverless API endpoints (notification delivery, bid matching logic).

**Known Blockers:**

- Need to verify Supabase project is connected and accessible via MCP
- Cost confirmation may be required for some operations

### Sentry

Error tracking is wired and **now configured**. Project `bidondent-production` created in org `molandjesus`. DSN added to `.env` as `VITE_SENTRY_DSN`.

**Capabilities:**

- `search_issues` / `get_issue_details` — Find and investigate errors
- `search_events` — Query error events with filters
- `create_project` / `create_dsn` — Set up error tracking
- `find_releases` — Track release health
- `update_issue` — Resolve/assign issues
- `analyze_issue_with_seer` — AI-powered root cause analysis
- `whoami` — Verify auth/org setup

**Integration Plan:**

1. ~~**Phase 1:** Verify connection, check project~~ ✅ DONE — org `molandjesus`, project `bidondent-production`
2. ~~**Phase 2:** Create project + wire DSN~~ ✅ DONE — DSN in `.env`, `sentryInit.ts` reads from `VITE_SENTRY_DSN`
3. **Phase 3 (Next):** After deploy, use `search_issues` for error triage. Use `analyze_issue_with_seer` for complex bugs.
4. **Phase 4:** Use `find_releases` to track release health after each deploy.

**Remaining:**

- Set `VITE_SENTRY_ENVIRONMENT=production` in production deploy environment
- Enable session replay sampling after initial error tracking is validated

---

## P1 — High Impact (Next Sprint)

### Figma

Design-to-code pipeline for translating design specs into BidOnDent components.

**Capabilities:**

- `get_design_context` — Extract code + screenshot from Figma designs
- `get_screenshot` — Visual reference for any Figma node
- `get_metadata` — Component/style metadata
- `search_design_system` — Find design tokens and components
- `get_variable_defs` — Extract design variables (colors, spacing, typography)
- `create_design_system_rules` — Define code ↔ design mappings
- `get_code_connect_suggestions` — Auto-suggest component mappings

**Integration Plan:**

1. **Phase 1:** When BidOnDent Figma designs exist, use `get_variable_defs` to extract design tokens and compare against `theme.css` values.
2. **Phase 2:** Use `get_design_context` during design passes to translate Figma mockups directly into React+Tailwind components.
3. **Phase 3:** Set up Code Connect mappings between Figma components and BidOnDent's component library (`bd-glass-card`, `bd-glass-panel`, etc.).
4. **Phase 4:** Use `get_screenshot` for visual regression checks during design sweeps.

**Depends On:** Figma designs being created and shared.

### Notion

Project management, sprint tracking, and decision documentation.

**Capabilities:**

- `notion-search` — Find pages and databases
- `notion-create-pages` / `notion-create-database` — Create structured project docs
- `notion-update-page` — Update existing docs
- `notion-get-comments` / `notion-create-comment` — Discussion threads
- `notion-get-users` / `notion-get-teams` — Team management
- `notion-fetch` — Read any Notion page/block

**Integration Plan:**

1. **Phase 1:** Create a BidOnDent project workspace in Notion with databases for: Sprint Tracker, Bug Backlog, Design Decisions, Release Notes.
2. **Phase 2:** Auto-sync active pass governance (from `BIDONDENT_MAP_TRACKER_2026-03-21.md`) to Notion for better visibility.
3. **Phase 3:** Use Notion databases as the source of truth for pass planning — replace the markdown-based tracker.
4. **Phase 4:** Create a public-facing changelog page auto-updated on each release.

**Depends On:** Notion workspace access and structure decisions.

---

## P2 — Medium Impact (Future Sprints)

### Google Calendar

Sprint cadence management and release scheduling.

**Use Cases:**

- Schedule design review sessions
- Set release freeze reminders
- Track sprint boundaries with calendar events
- Find free time for stakeholder reviews

**Integration Plan:**

1. Create a "BidOnDent Development" calendar
2. Auto-create events for planned passes/sprints
3. Set reminders before merge freezes or release cuts

### Gmail

Stakeholder communication and deploy notifications.

**Use Cases:**

- Draft release notes emails to stakeholders
- Send deploy confirmation summaries
- Search for feedback/bug reports from email threads

**Integration Plan:**

1. Create email templates for release notes
2. Draft deploy summaries after major milestones
3. Search email for user feedback to inform pass planning

---

## P3 — Low Impact (Defer)

### Indeed

- Only relevant if BidOnDent needs to hire. No current use case.

### Microsoft Learn

- BidOnDent is not on the Microsoft/Azure stack (uses Supabase + Vercel/Vite). Only useful for occasional reference if Azure services are evaluated.

---

## Adoption Roadmap

| Phase       | Timeline     | Actions                                                                                   |
| ----------- | ------------ | ----------------------------------------------------------------------------------------- |
| **Phase 1** | ✅ DONE      | Supabase + Sentry connections verified. Advisors run. Sentry project created + DSN wired. |
| **Phase 2** | Next session | Generate Supabase types. Set up Notion workspace. Address security advisories.            |
| **Phase 3** | Next sprint  | Figma design-to-code pipeline. Notion sprint tracking. Sentry issue triage post-deploy.   |
| **Phase 4** | Ongoing      | Full workflow integration: edge functions, release health, design system sync.            |

---

## Decision Log

| Date       | Decision                                  | Rationale                                                                                                      |
| ---------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 2026-03-24 | Supabase + Sentry are P0                  | Already wired into codebase, highest immediate impact                                                          |
| 2026-03-24 | Indeed + MS Learn deferred                | No current use case for BidOnDent                                                                              |
| 2026-03-24 | Figma depends on design assets            | Can't use until Figma files are created/shared                                                                 |
| 2026-03-24 | Sentry project created + DSN wired        | Phase 1 complete — `bidondent-production` in org `molandjesus`                                                 |
| 2026-03-24 | Supabase advisors run — 129 WARN, 80 INFO | Security: overly permissive RLS, leaked password protection off. Performance: duplicate indexes, unindexed FKs |
