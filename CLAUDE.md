# CLAUDE.md — Accessibility Regression CI falsification spike

This is a research harness, not a product. It measures whether event observation and real NVDA detect accessibility regressions that axe and accessibility-tree testing miss. Owner: Courtney. Full brief: HANDOFF.md (v1.8). Protocol extract: docs/PRD-v0.3-technical-extract.md (the full PRD is held privately by the owner).

## Golden rules
- Public repository: no secrets, customer data, interview notes or identifiable defects.
- The full PRD and all commercial content are never committed; docs/PRD-v0.3.md stays git-ignored (D5, DR-0014).
- NVDA binaries are never committed, uploaded or included in evidence bundles (D6, DR-0015).
- No outward actions (visibility changes, tags, releases, publishing) without owner approval.
- Never request admin scope; repository settings are the owner's to apply (D7, DR-0016).
- Actions pinned to full SHAs; read-only permissions by default; inputs passed via env, never interpolated into run.
- Standard GitHub-hosted runners only.
- QPC is the only timebase: process.hrtime.bigint() in Node, Stopwatch.GetTimestamp() in C#. No wall-clock reads in collectors; only the per-process wall-clock anchor may read the wall clock (DR-0027).
- NVDA log lines may be bucketed into segments via the wall anchor only for parity counts and diagnostics, never for latency, ordering or validity (DR-0039).
- Exploratory until the protocol freeze; never execute or score the test split before it. From M4, call assertItemExecutable before executing any test-split item (DR-0034).
- Never tune oracles, triggers or thresholds on test data. Never hand-edit verdicts.
- INCONCLUSIVE comes only from checks completed before the outcome is known (D12, DR-0021). A check may produce INCONCLUSIVE only if the thing being judged cannot cause it to fail (DR-0032).
- Never switch navigation strategy on failure; report UNREACHABLE.
- No page.keyboard or page.click inside AT segments, and no keypress inside any observation window (D4, DR-0013).
- AT Driver is not used in Phase 0 (D2, DR-0011). Guidepup provides NVDA lifecycle and input only, with capture off; speech comes from the relay tap.
- Harness never imports NVDA code; NVDA add-on code is GPL and lives in adapters/nvda-addon/.
- Prompt to Page fixtures: de-branded only; no restricted fonts or protected marks.
- Stop and ask when a choice changes what is measured, what counts as detection, cost or security (hard rule 12); these are the only items brought to the owner. Decide and log everything else in docs/DECISIONS.md (DR-0045).
- Cost (DR-0046): use multi-agent orchestration only for gate reviews; work single-agent between gates, flag token-heavy work before running it, and estimate model spend in each gate report.
- At each gate, put a one-page brief in the gate PR alongside the report: at most 10 yes/no items, each with your recommendation (DR-0045).

## Commands
- npm run lint
- npm run typecheck
- npm test
- npm run protocol:hash (prints the protocol-sha256 line over the frozen set in protocol/frozen-paths.txt; DR-0033)
- gh workflow run phase0-nvda.yml --ref <branch> -f runs=50 (from M1)
- gh run watch
- gh run download <run-id> -D artefacts/<run-id>
- npm run report:phase0 -- artefacts/<run-id> (available from M1)
- npm run phase0:canaries -- --leg <nvda-absent|nvda-present> --runs <n> (available from M1; Windows CI only)
- npm run score -- --split dev (reports "not implemented" until M5)
- Archive at each gate (D6): gh run download the gate's runs on this machine, then commit a per-gate tar.zst bundle under 50 MB, with a SHA-256 manifest of run IDs, image versions and pinned versions, to the orphan results branch. Never include NVDA binaries.

## Current authorisation
M0–M4. The owner approved Gate G2 on 2026-10-03, which unlocked M3 (DR-0055), merged M3 and authorised M4 on 2026-10-03 (DR-0065). M5 onwards is not authorised: ask the owner before starting M5. The Phase 1 proceed/stop decision stays on Fri 27 Nov 2026, re-planned from Phase 0's measured costs (DR-0003).

## Logs
- docs/DECISIONS.md — decisions
- docs/LAB_NOTEBOOK.md — exploratory observations
- protocol/AMENDMENTS.md — post-freeze changes
- docs/research/ — desk research with evidence
