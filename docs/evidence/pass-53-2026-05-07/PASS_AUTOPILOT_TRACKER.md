# Pass 53→58 Autopilot Chain Tracker

**Authorized by planner-AI dispatch + owner standing directive 2026-05-07.**

| Pass | Title                                                     | Status                  | Commit        | Notes                                                                                                                                                                                 |
| ---- | --------------------------------------------------------- | ----------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 53   | Deep navigation engine audit (audit-only) + KI-075 update | **DONE**                | `16638e12`    | Discovered Pass 46 audit gap. Engine fully wired. KI-075 description corrected.                                                                                                       |
| 54   | Reroute confirm-timing bug (F1 from §F)                   | **DONE**                | `3c21907d`    | `useShopDirectoryNavigation.ts` only. Defers `confirmReroute()` until OSRM refresh delivers new `routePreview.fetchedAt`; calls `cancelReroute()` if `routeError`. Build 3.23s clean. |
| 55   | Docs hygiene sweep (advanced from planner Pass 58)        | **DONE**                | (this commit) | Split REF_KNOWN_ISSUES.md (1163 LOC, 95 entries) → active-only (341 LOC, 25) + new archive/RESOLVED_KIS_2026-05-07.md (828 LOC, 70). MITIGATED kept active. Cross-refs preserved.     |
| 56   | Animation 29-keyframe LAW audit + 2 CSS-only reduce-guard fixes (F5) | **DONE** | (this commit) | Audit doc at docs/evidence/pass-56-2026-05-07/ANIMATION_KEYFRAME_AUDIT.md. Gap-1: animations.css had ZERO reduce-guards on 24 keyframes / 27 utility classes since inception — added single @media block neutralizing all `.animate-*` + `.scroll-animate*`. Gap-2: theme.css `.animate-slide-in-right` toast missing reduce-guard — added. Gaps 3+4 (LAW doc inventory drift) deferred to planner per hard-stop. Build 3835.84 KiB clean. |
| 57   | Dual off-route paths consolidation (F3)                   | **DONE**                | (this commit) | Added optional `suppressOffRouteRefetch` arg to useNavigationRoutePreview. useShopDirectoryNavigation passes `true` whenever reroute.state.status is `pending` or `cooldown`. Silent ~100m off-route auto-refetch now stands down while the manual reroute lifecycle owns the OSRM call. Eliminates duplicate OSRM fires for the same deviation. 2 files, ~25 LOC. Build clean. useCoverageNavigationExperience left untouched (arg defaults to false → prior behavior preserved). |
| 58   | Docs hygiene sweep                                        | **MERGED INTO PASS 55** | (see above)   | Advanced earlier in chain because §F gaps hit hard-stops.                                                                                                                             |

**Hard-stop list (abort autopilot if any triggered):**

- build break or typecheck break
- schema migration mid-pass
- new runtime dependency
- new voice library or routing provider
- MOLANDJESUS_DESIGN_DECISIONS.md touch
- LAW\_\*.md touch beyond co-update
- prefers-reduced-motion regression
- auth/storage invariant change
- provider stack change
- dev-server smoke regression
- > 5 files or > 300 LOC in a single pass
- owner product decision needed
- any pass > 30 min wall-clock
- chain has shipped 4+ passes (pause for planner check-in)

**After Pass 58:** STOP and return to planner. Passes 59-61 (Supabase saved-places schema, real-time partner-shop availability, per-role map layer rules) require planner re-dispatch.

**No push.** Owner pushes manually.
