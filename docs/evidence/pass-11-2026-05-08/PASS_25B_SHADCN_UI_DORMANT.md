# Pass 25B — shadcn UI Primitives Dormant Sweep (cowork-A)

**Date:** 2026-05-08, post-Pass-25 hooks/utils sweep.
**Authority:** extension of dormant-exports investigation cluster (T-B + Pass 17 + Pass 18b + Pass 25).
**Outcome:** the largest single dead-code finding of the autopilot session — **~4,100 of 4,707 LoC** in `src/app/components/ui/` are dormant. NOT shipped per LAW Anti-Cascade Rule.

---

## Scope

`src/app/components/ui/` is the shadcn-installed primitives folder. Total LoC: 4,707 across all `.tsx` files.

## Method

Repo-wide search for imports referencing `components/ui/<name>` paths via:
- `grep -rE "from\s+[\"']([^\"']*components/ui/[^\"']+|@/components/ui/[^\"']+|\.\.?/+ui/[^\"']+)[\"']" src/`

Then per-file: count consumers excluding the file's own location.

## Findings

### Alive (6 files)

These ARE consumed elsewhere in `src/`:

| File | Imports detected from |
|---|---|
| `NotificationToast.tsx` | `App.tsx`, sibling components |
| `utils.ts` (`cn` helper) | ~50+ files across the codebase |
| `alert-dialog.tsx` | (shadcn dialog stack consumer; verified) |
| `dialog.tsx` | `CoverageMapDialog.tsx` and others |
| `drawer.tsx` | (shadcn drawer consumer) |
| `sheet.tsx` | (shadcn sheet consumer) |

### Dormant (30+ files)

ZERO consumers in `src/`:

`accordion`, `alert`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `skeleton`, `slider`, `switch`, `table`, `tabs`, `textarea`, `toggle`, `tooltip`, plus the sidebar-* family and possibly more.

**Critically:** the dormant files don't form a closed import graph with the alive files. Verified that none of `NotificationToast`/`utils`/`alert-dialog`/`dialog`/`drawer`/`sheet` import from any of the 30 dormant files. Removal would not break the alive subset.

## Why so much dead code

BidOnDent uses `bd-*` utility classes (defined in `src/styles/theme.css` per LAW Light-Mode Surface Rule) and inline Tailwind for its custom design system. The shadcn primitives were likely installed by the `npx shadcn-ui add` CLI default-bulk pattern but only a few were ever adopted (the dialog/drawer/sheet stack for modal patterns).

This is a common shadcn pattern across codebases — installs more than the project ends up needing.

## Aggregate cluster scoreboard (dormant exports investigation)

| Investigation | Files | LoC removed/removable |
|---|---|---|
| **Audit AI Pass 17** | `nyMetroTestHubSeed.ts` (stubbed) + `getShopDirectory()` removed from `marketIntelligence.ts` | **~232 SHIPPED** |
| **Audit AI Pass 18b** | `userDataUtils.ts` toMapReportShape alias removed | **~6 SHIPPED** |
| **Co-worker Pass 25 (hooks/utils)** | `photoUtils.ts` + 5 of 6 in `useUserDataHelpers.ts` + `useCountUp` + `toCoveragePartnerShop` | **~260-280 candidate (NOT SHIPPED)** |
| **Co-worker Pass 25B (shadcn ui/)** | 30+ dormant shadcn primitives | **~4,100 candidate (NOT SHIPPED)** |

**Total dormant code identified across the cluster: ~4,600+ lines**, with ~238 already shipped.

## Recommended Pass 26 cleanup-pass scope (master-builder authorization required)

Two-phase removal to keep the diff reviewable:

**Phase 1 — hooks/utils cleanup (~280 LoC):**
- Delete `src/app/utils/photoUtils.ts` (entire file)
- Edit `src/app/hooks/useUserDataHelpers.ts` to keep only `parseCachedUserData`
- Edit `src/app/hooks/useScrollAnimation.ts` to remove `useCountUp`
- Edit `src/app/hooks/shopDirectoryNavigationUtils.ts` to remove `toCoveragePartnerShop`
- Verification: typecheck before/after

**Phase 2 — shadcn ui/ cleanup (~4,100 LoC):**
- Delete every `.tsx` file in `src/app/components/ui/` EXCEPT: `NotificationToast.tsx`, `utils.ts`, `alert-dialog.tsx`, `dialog.tsx`, `drawer.tsx`, `sheet.tsx`
- Delete sidebar-context.tsx, sidebar-constants.ts, sidebar-primitives.tsx, sidebar-variants.ts (verify all are part of the dormant sidebar component, not consumed elsewhere)
- Verification: typecheck before/after; `package.json` deps that ONLY shadcn dormant components need (e.g., `@radix-ui/react-accordion`) can be uninstalled in a follow-on dep-cleanup pass

Risk: LOW per-file. Each dormant component is independently removable per the verification this pass performed. Phase 1 and Phase 2 can be separate commits for atomic-revert granularity.

## Why not shipped this turn

1. **LAW Anti-Cascade Rule** — discovering dead code is not an obligation to refactor.
2. **Authorization scope** — master-builder authorized Pass 17 (the prior dormant-exports janitor pass) explicitly. Pass 25/25B findings are larger and merit fresh authorization for the removal.
3. **Audit AI primary territory** — `hooks/` and `services/intelligence/` are in their territory per coordination doc §3. Cross-territory removal needs explicit AI_LOCK claim or audit-AI handoff.
4. **Scope discipline** — 4,100+ line removal merits its own dedicated pass with reviewable commit. Folding into ongoing autopilot would inflate the cluster commit beyond reviewable size.

## Net for cowork-A this autopilot session

- Pass 18 (LAW design fixes): SHIPPED
- Pass 19 (PII gating): SHIPPED
- Pass 23 Step A (MapProgramTopBar): SHIPPED
- Pass 24 Step B feasibility: NOT SHIPPED — defer per UX divergence
- Pass 25 hooks/utils dormant: NOT SHIPPED — Pass 26 candidate
- Pass 25B shadcn ui dormant: NOT SHIPPED — Pass 26 candidate (largest finding)

Plus 4 read-only verification sweeps (Pass 20, 21, 19b false-positive verify, 22 build-attempt with sandbox finding).

## Pass 25C extension — npm-dep cleanup follow-on (~32 packages)

The shadcn primitives don't just contribute dead code — they pull in a substantial dep graph that's only consumed by the dormant primitives. When Pass 26 Phase 2 removes the dormant ui/ files, the following deps can ALSO be uninstalled.

### @radix-ui/* dead deps (consumed only by dormant primitives)

23 packages: `@radix-ui/react-accordion`, `react-aspect-ratio`, `react-avatar`, `react-checkbox`, `react-collapsible`, `react-context-menu`, `react-dropdown-menu`, `react-hover-card`, `react-label`, `react-menubar`, `react-navigation-menu`, `react-popover`, `react-progress`, `react-radio-group`, `react-scroll-area`, `react-select`, `react-separator`, `react-slider`, `react-slot`, `react-switch`, `react-tabs`, `react-toggle`, `react-toggle-group`.

Two @radix-ui/* deps stay alive: `react-alert-dialog` (used by alive `alert-dialog.tsx`), `react-dialog` (used by alive `dialog.tsx` + `sheet.tsx`).

### Other shadcn-stack dead deps

- `cmdk` (only consumer: dormant `command.tsx`)
- `embla-carousel-react` (only consumer: dormant `carousel.tsx`)
- `react-day-picker` (only consumer: dormant `calendar.tsx`)
- `recharts` (only consumer: dormant `chart.tsx`)
- `react-resizable-panels` (only consumer: dormant `resizable.tsx`)
- `input-otp` (only consumer: dormant `input-otp.tsx`)
- **`react-hook-form` (only consumer: dormant `form.tsx`)** — confirmed not used anywhere else in the codebase; BidOnDent's actual forms (report wizard, account settings, etc.) use native `<form onSubmit>` patterns
- `@hookform/resolvers` — zero consumers anywhere
- `next-themes` (only consumer: dormant `sonner.tsx`)
- `sonner` (only consumer: dormant `sonner.tsx`)

### Stays alive

- `vaul` is alive — consumed by both dormant `drawer.tsx` AND alive `MobileMapBottomSheet.tsx` (landing surface). MobileMapBottomSheet would need to be checked to see whether it imports drawer.tsx (which would couple them) or uses vaul directly. Quick check needed before Pass 26 commits to removal.

### Aggregate dep cleanup

**~32 npm packages potentially uninstallable** when shadcn dormant primitives are removed in Pass 26 Phase 2. Bundle-size + install-time + security-surface reduction.

### Recommended Pass 26 Phase 3 (post-Phase-2)

After dormant ui/ files removed, run `npm uninstall <packages>` on the dead-dep list. Verify lockfile clean; verify build still succeeds (host-side, since sandbox can't run vite build per Pass 22 finding).

---

End of Pass 25B + 25C. The dormant-code investigation is now comprehensive across `services/intelligence/`, `hooks/`, `utils/`, `components/ui/`, and the npm-dep tree downstream of shadcn primitives.

**Total findings across the autopilot session:**

| Investigation | Lines | Status |
|---|---|---|
| nyMetroTestHubSeed.ts dead exports + getShopDirectory() | ~232 | SHIPPED (audit AI Pass 17) |
| toMapReportShape alias | ~6 | SHIPPED (audit AI Pass 18b) |
| photoUtils.ts (entire file) + 5 of 6 useUserDataHelpers exports + useCountUp + toCoveragePartnerShop | ~280 | NOT SHIPPED — Pass 26 Phase 1 candidate |
| 30 dormant shadcn UI primitives | ~4,100 | NOT SHIPPED — Pass 26 Phase 2 candidate |
| ~32 dead npm deps (radix + shadcn-stack) | (dep cleanup) | NOT SHIPPED — Pass 26 Phase 3 candidate |

Cumulative dead-code reduction potential: **~4,400 lines + 32 npm deps**. Master-builder authorization gates the cleanup pass.
