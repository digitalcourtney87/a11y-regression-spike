# Atomic CRM (vendored)

- **Upstream:** https://github.com/marmelab/atomic-crm at commit `b23289b46734d796e74edd3ef224cbf23792ff82`
- **Licence:** MIT (`LICENSE.md`, copyright Marmelab)
- **Fetched:** 2026-10-03 as the GitHub tarball of that commit (SHA-256 `a01a9b6eeff564e6ce24897060d82de9983daa28f5b8f598242e84d62eba97db`)
- **Why:** the M3 SPA (P14, P17; DR-0056, DR-0057)

## What is kept

Only what the demo build (`vite.demo.config.ts`) needs: `src/` (without stories, tests, `src/test/` or READMEs), `demo/`, `public/`, `index.html`, `vite.demo.config.ts`, the tsconfig files, `components.json`, `package.json`, `package-lock.json` and `LICENSE.md`.

## What is left out

Everything else, including upstream's agent instruction files (`.claude/`, `CLAUDE.md`, `AGENTS.md`, `MEMORY.md`, `.mcp.json`), which must never act as instructions in this repository; its documentation, Supabase backend, end-to-end tests, Storybook set-up, scripts and CI.

## Changes from upstream

The commit after this file's first commit holds every change from upstream, so `git log -p fixtures/spa/atomic-crm` shows them. Corpus patches (`corpus/patches/`) apply on top of that integration commit.

## Building

The demo build runs only in CI (`npm ci --ignore-scripts`, then `npx --no-install vite build --config vite.demo.config.ts`), with `contents: read`, no secrets and a separate npm cache (P17).

### Integration commit (P14)

- `demo/App.tsx`: `disableTelemetry` on `<CRM>`, so the CRM's telemetry image request is never made (the admin kit's was already off).
- `src/components/atomic-crm/providers/fakerest/dataGenerator/index.ts`: both `faker` locale instances seeded with 20261004 before the data are generated.
- `companies.ts` and `contacts.ts`: company logos and contact avatars point to local placeholder SVGs in `public/demo-logos/` and `public/demo-avatars/` (generated for this repository) instead of `marmelab.com`.
- The clock is fixed by each journey's setup (Playwright's clock API), not in the app.
