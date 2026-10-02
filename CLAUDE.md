# CLAUDE.md — Accessibility Regression CI falsification spike

This is a research harness, not a product. It measures whether event observation and real NVDA detect accessibility regressions that axe and accessibility-tree testing miss. Owner: Courtney. Full brief: HANDOFF.md (v1.1). Protocol extract: docs/PRD-v0.3-technical-extract.md (the full PRD is held privately by the owner).

## Golden rules
- Public repository: no secrets, customer data, interview notes or identifiable defects.
- The full PRD and all commercial content are never committed; docs/PRD-v0.3.md stays git-ignored (D5, DR-0014).
- NVDA binaries are never committed, uploaded or included in evidence bundles (D6, DR-0015).
- No outward actions (visibility changes, tags, releases, publishing) without owner approval.
- Never request admin scope; repository settings are the owner's to apply (D7, DR-0016).
- Actions pinned to full SHAs; read-only permissions by default; inputs passed via env, never interpolated into run.
- Standard GitHub-hosted runners only.
- QPC is the only timebase: process.hrtime.bigint() in Node, Stopwatch.GetTimestamp() in C#. No wall-clock reads in collectors; only the per-process wall-clock anchor may read the wall clock (DR-0027).
- Exploratory until the protocol freeze; never execute or score the test split before it.
- Never tune oracles, triggers or thresholds on test data. Never hand-edit verdicts.
- INCONCLUSIVE comes only from checks completed before the outcome is known (D12, DR-0021).
- Never switch navigation strategy on failure; report UNREACHABLE.
- No page.keyboard or page.click inside AT segments, and no keypress inside any observation window (D4, DR-0013).
- AT Driver is not used in Phase 0 (D2, DR-0011). Guidepup provides NVDA lifecycle and input only, with capture off; speech comes from the relay tap.
- Harness never imports NVDA code; NVDA add-on code is GPL and lives in adapters/nvda-addon/.
- Prompt to Page fixtures: de-branded only; no restricted fonts or protected marks.
- Stop and ask when a choice changes what is measured, what counts as detection, or cost.

## Commands
- npm run lint
- npm run typecheck
- npm test
- gh workflow run phase0-nvda.yml --ref <branch> -f runs=50 (from M1)
- gh run watch
- gh run download <run-id> -D artefacts/<run-id>
- npm run report:phase0 -- artefacts/<run-id> (available from M1)
- npm run phase0:canaries -- --leg <nvda-absent|nvda-present> --runs <n> (available from M1; Windows CI only)
- npm run score -- --split dev (reports "not implemented" until M5)
- Archive at each gate (D6): gh run download the gate's runs on this machine, then commit a per-gate tar.zst bundle under 50 MB, with a SHA-256 manifest of run IDs, image versions and pinned versions, to the orphan results branch. Never include NVDA binaries.

## Current authorisation
M0–M2 only. G2 report due by Fri 6 Nov 2026, otherwise stop and report; the Phase 1 proceed/stop decision is on Fri 27 Nov 2026 (DR-0003). M3 onwards is locked until the owner approves Gate G2 (docs/gates/G2.md).

## Logs
- docs/DECISIONS.md — decisions
- docs/LAB_NOTEBOOK.md — exploratory observations
- protocol/AMENDMENTS.md — post-freeze changes
- docs/research/ — desk research with evidence
