# react-admin "simple" example (vendored)

- **Upstream:** https://github.com/marmelab/react-admin at commit `47890673cae903b9c5a33898c07a12ea94205b5a`, directory `examples/simple`
- **Licence:** MIT (`LICENSE.md`, copied from the repository root; copyright Francois Zaninotto, Marmelab)
- **Fetched:** 2026-10-03 by a sparse, blob-filtered git fetch of that commit (only `examples/simple` and `LICENSE.md`)
- **Why:** the second corpus SPA (P19; DR-0058, DR-0059)

## What is kept

The example as upstream ships it, except `README.md`, `sandbox.config.json` and `.gitignore`. It contains no agent instruction files.

## Changes from upstream

The commit after this file's first commit holds every change from upstream. The example has no lockfile of its own; one is generated in CI and committed separately.

## Building

Only in CI (`npm ci --ignore-scripts`, then `npx --no-install vite build`), with `contents: read`, no secrets and a separate npm cache (P17, P19). Outside the react-admin monorepo, its `vite.config.ts` resolves the published packages.

### Integration commit (P19)

- `index.html`: the Google web-font loader (`ajax.googleapis.com`) is removed; the system font stack applies.
- `src/index.tsx`: `disableTelemetry` on `<Admin>`.
- The data (`src/data.tsx`) are static with fixed dates, so no seed is needed; journeys still fix the clock.
