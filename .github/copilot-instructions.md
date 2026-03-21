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
