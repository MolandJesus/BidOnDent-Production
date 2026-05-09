# Pass 23 Step A — MapProgramTopBar Extraction (cowork-A ship)

**Date:** 2026-05-08, post-audit-AI-coordination-doc.
**Authority:** master-builder Pass 180 §7.5 explicit authorization ("Authorized for next builder pass") + audit AI's `JOINT_SESSION_COORDINATION.md` §2.A "open invitation" listing.
**Note:** writing to a separate evidence file rather than appending to `JOINT_SESSION_COORDINATION.md` because audit AI is concurrently updating that file. Audit AI can fold this into a future coordination-doc revision.

---

## Ship details

| File | Diff | Type |
|---|---|---|
| `src/app/components/maps/shell/MapProgramTopBar.tsx` | NEW (~210 lines incl. JSDoc) | Canonical-location lift |
| `src/app/components/shop/ImmersiveMapTopBar.tsx` | -141 / +24 (re-export shim) | Migration |

## Scope decision — divergence-aware lift

Pass 180 §7.5 directive: "Pure presentational lift — no behavior change, no new callbacks. Same handlers in, same handlers out."

Investigation surfaced a divergence not visible in original plan-doc framing:

- **Engine A consumers** (`CoverageBrowseExperience` family) use `MapSurfaceControls` — segmented tile-mode + Focus + Overview + Expand UX shape.
- **Engine B consumers** (`ImmersiveMapTopBar`) use Back + Search + Drawer + Split + tile-cycle UX shape.

These are not "the same buttons in different places" — they are two different top-bar designs serving different host contexts.

To honor §7.5's "no behavior change" directive, Pass 23 LIFTED the immersive-fullscreen UX shape ONLY into the canonical `shell/` location. The inline-embedded `MapSurfaceControls` UX stays where it is. `ImmersiveMapTopBar.tsx` becomes a thin re-export shim so its consumers (`ShopDirectoryImmersiveMap`, `ShopDirectoryHybridStage`) continue to work unchanged.

## Step A.2 future scope

Cross-engine union (one `MapProgramTopBar` rendering either UX shape via host-discriminator props) is gated on master-builder fork resolution per plan-doc §1.4/§1.5. When resolved, Step A.2 can:

- Add `host: "landing-dialog" | "shop-directory-immersive" | "dashboard-fullscreen"` discriminator
- Render the appropriate UX shape per host
- Migrate `MapSurfaceControls` consumers (CoverageBrowseExperience + OperatingRegionsSection + CoverageActiveNavigationLayout) to consume `MapProgramTopBar` with `host="landing-dialog"`

Until then, both UX shapes coexist; the canonical extraction is partial-but-clean.

## Verification

- Typecheck PASS exit 0 with all current modifications in place
- API contract preserved: `ImmersiveMapTopBar` consumers see the same default-export, same prop type (`ImmersiveMapTopBarProps` is now an alias for `MapProgramTopBarProps`), same DOM output
- Comment blocks at both files cite Pass 23, Pass 180 §7.5, `ENGINE_SURFACES_MATRIX.md`, and Step A.2 future scope
- Zero file deletions; zero behavior changes; zero new callbacks

## KI status updates

None — Step A is structural/preparatory; closes no KI directly. Future Step C / D / F migrations consume this scaffolding to close KI-170 / KI-171 (the unification KIs).

## Updated commit queue (13 commits)

  A — Pass 12 (audit AI)
  B — Pass 13 staged (audit AI)
  C — Pass 14.1 + 1.5 + 1.6 (joint)
  D — Pass 14.2 (audit AI)
  E — Pass 14.3 (audit AI)
  F — Pass 14.4 + 14.5 (cowork-A)
  G — Pass 15 (audit AI)
  H — Pass 16 (audit AI)
  I — Pass 17 + 18b (audit AI)
  J — Pass 18 (cowork-A)
  K — Pass 19 (cowork-A)
  L — Pass 23 Step A (cowork-A) ← NEW
  M — Pass 11 evidence batch + JOINT_COORDINATION (joint)

F-1 mega-collapse to 4-5 commits remains the cleanest atomic-revert-unit option for master-builder fold.

## Next-track candidates

- **Step B — utility cluster extraction** (plan doc §4 Step B). Pass 180 §7.5 said "Do not start Step B in the same pass" — Pass 23 is its own pass, so Step B is in scope. Same UX divergence concern likely applies; need to read `MapSurfaceControls` bottom-right cluster vs immersive bottom-right cluster before drafting. Open invitation.
- Master-builder plan-doc §1.4 / §1.5 rewrite.
- More null-finding sweeps (likely diminishing returns).

End of Pass 23 ship evidence.
