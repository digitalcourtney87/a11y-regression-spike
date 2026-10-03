# SPA candidates for the M3 corpus (2026-10-03)

**Label:** EXPLORATORY. **Purpose:** HANDOFF §9 M3 asks for the realistic SPA to be selected after evaluating at least three candidates against ten criteria. **Method:** repository metadata read through the GitHub API (licence, tree, `package.json`, source files); install, build and an offline load of each production build measured on the gate runner by `m3-spa-probe.yml`, run [37126215365](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/37126215365) (commit `1207202`, image `win25-vs2026` 20260925.250.1). The probe blocks every request to another host and records it. No candidate code ran on the owner's machine.

## Candidates (pinned commits)

| Candidate | Repository and commit | What it is |
|---|---|---|
| **Atomic CRM**, demo build | `marmelab/atomic-crm` `b23289b` | A full CRM (contacts, companies, deals pipeline, tasks, notes, dashboard) on ra-core, React Router 7 and shadcn/ui (Radix primitives, Tailwind 4). The demo build (`vite.demo.config.ts`) uses an in-memory FakeRest provider and signs in a built-in demo user |
| **react-admin "simple"** | `marmelab/react-admin` `4789067`, `examples/simple` | The react-admin example app (posts, comments, users) on MUI 5 with static FakeRest data |
| **TanStack Router kitchen sink** | `TanStack/router` `1f0f20a`, `examples/react/kitchen-sink` | A routing showcase (dashboard, invoices, users) with simulated loaders |
| Angular Tour of Heroes (desk only) | `angular/angular` docs example | The Angular tutorial app with an in-memory API; not probed, because it has no dialog and no composite widget |

## Criteria

| Criterion (HANDOFF §9 M3) | Atomic CRM | react-admin simple | TanStack kitchen sink |
|---|---|---|---|
| Runs natively on Windows via Node | Yes: Node 24.21.0, Vite 8, no native build steps; install scripts were off | Yes | Yes |
| No external credentials | Yes: the demo user is built in. Offline, the only outside requests were telemetry (`atomic-crm-telemetry.marmelab.com`) and images on `marmelab.com` (83 blocked, no page error) | Yes: telemetry and one Google font request blocked, no page error | No credentials, but its data comes from `jsonplaceholder.typicode.com`; offline the data load fails (`TypeError: Failed to fetch`) |
| Permissive licence | MIT | MIT | MIT |
| Client-side routing | Yes: React Router 7 (hash routes `/#/contacts`, `/#/deals`, `/#/companies`) | Yes: React Router 6 (hash routes) | Yes |
| Form validation | Yes: ra-core validators on contact, company, deal and task forms | Yes: react-admin validators | Minimal |
| A dialog | Yes: shadcn/Radix `Dialog` (task, tag and data-import dialogs, delete confirmation) | Yes: MUI dialogs (delete confirmation) | No |
| A status update | Yes: Sonner toasts after create, update and delete (`components/ui/sonner.tsx`, `admin/notification.tsx`) | Yes: MUI Snackbar notifications | No |
| At least one composite widget | Yes: Radix Select, Tabs, DropdownMenu, a cmdk command combobox, autocomplete inputs, toggle groups, accordion, a kanban board. Probe: `combobox` on every list page | Yes: MUI Autocomplete, menus, a data table, TabbedForm | No |
| Deterministic data | Not as shipped: the FakeRest data come from `faker` 5 without a seed, and some depend on today's date. Needs a seed and a fixed clock (below) | Yes: static `data.tsx` | No (external API) |
| Builds in under five minutes | Yes: `npm ci` 30.7 s, demo build 7.7 s (Vite only; the type check is separate) | Yes: install 44.0 s (no lockfile in the example), build 2.4 s | Yes: 12.8 s and 1.8 s |

## Assessment

- **TanStack kitchen sink** fails "deterministic data" and has no dialog, status update or composite widget.
- **react-admin simple** meets every criterion as shipped. It is a small example app with MUI 5, and has no lockfile of its own.
- **Atomic CRM** meets every criterion after two small integration changes: seeding `faker`, and fixing the clock in each journey's setup. It is a realistic, current product: React 19-era stack, shadcn/ui and Radix primitives used in place, Tailwind 4, many dialogs, toasts and composite widgets. Its shadcn components are source files in the app, so a seeded regression is a realistic one-file change. Radix is one of the most widely used primitive libraries, so open-source Radix regressions can enter the corpus as version pairs of the same app.

## Integration notes (if Atomic CRM is selected)

- **Vendoring:** a copy at the pinned commit under `fixtures/spa/atomic-crm/`, holding only what the demo build needs (`src/`, `demo/`, `public/`, `index.html`, `vite.demo.config.ts`, the tsconfig files, `components.json`, `package.json`, `package-lock.json`, `LICENSE.md`; about 3 MB). Its repository also holds agent instruction files (`.claude/`, `CLAUDE.md`, `AGENTS.md`, `MEMORY.md`, `.mcp.json`). They are excluded, so they cannot act as instructions inside this repository.
- **Determinism:** seed `faker` in the FakeRest data generator, and fix the clock with Playwright's clock API in journey setup (Playwright establishes state only, HANDOFF §7.2).
- **Offline:** disable telemetry, and replace the `marmelab.com` image URLs with local assets.
- **Supply chain:** the lockfile has about 670 top-level packages, most for development (Storybook, Supabase, test tooling). The demo build needs a subset, which can be pruned in the vendored `package.json`. CI installs it from the lockfile with install scripts off, `contents: read`, no secrets and a separate npm cache, as in the probe.
