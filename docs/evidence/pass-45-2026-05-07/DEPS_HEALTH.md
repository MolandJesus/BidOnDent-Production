# Sub-Audit B — npm Supply-Chain Health

**Status:** COMPLETE. Clean.

## npm audit

```
vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 }
dependencies:    { prod: 210, dev: 532, optional: 74, peer: 11, total: 744 }
```

**Zero vulnerabilities.** Raw: [`npm-audit.json`](npm-audit.json).

## npm outdated — security-relevant runtime deps

| Package | Current | Wanted (semver) | Latest | Notes |
|---|---|---|---|---|
| `@sentry/react` | 10.45.0 | 10.51.0 | 10.51.0 | Patch behind. Safe minor bump if desired post-launch. |
| `@supabase/supabase-js` | 2.95.3 | 2.105.3 | 2.105.3 | Minor behind (10 patch versions). No CVE. |
| `maplibre-gl` | 5.21.1 | 5.24.0 | 5.24.0 | Patch behind. No CVE. |
| `react` | 18.3.1 | 18.3.1 | **19.2.6** | Held at 18 deliberately. React 19 is a breaking upgrade. |
| `react-dom` | 18.3.1 | 18.3.1 | **19.2.6** | Held at 18 with `react`. |
| `vite` | 6.4.2 | 6.4.2 | **8.0.11** | Held. Vite 7+8 are major upgrades. No active CVE on 6.4.2. |

**No critical or high-severity runtime CVEs.** All "outdated" entries are version drift, not security advisories.

## Major-version-behind (informational only)

12 packages are at least one major behind latest. Most are React-19 ecosystem packages held back together with React itself:

- `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `react-day-picker`, `react-resizable-panels`, `recharts` — all depend on React 19 in their latest majors.
- `date-fns` 3→4, `lucide-react` 0.487→1.x, `typescript` 5.7→6.0 — independent majors. None are launch-blocking.

Raw: [`npm-outdated.json`](npm-outdated.json) (54 total entries).

## Recommendations

- **Pre-launch:** No action required.
- **Post-launch backlog:** A "supabase-js + maplibre-gl + sentry" patch sweep is low-risk and can be scheduled. React 19 / Vite 8 / TS 6 majors deserve their own scoped passes.
- **Do not run** `npm audit fix`, `npm update`, or any blanket upgrade. Each major is a deliberate hold.

## Hard-stop check

- ❌ No critical CVE in runtime deps → no escalation.
