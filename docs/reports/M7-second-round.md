# M7 second-round confirmatory run

Status: complete. All 37 workflow jobs (plan plus 36 item jobs) succeeded on 2026-10-12; accepted through PR14 merge on 2026-10-12 (DR-0112).

The owner instructed “Please proceed” after the freeze/test/report sequence on 2026-10-12. PR13 merged at `22bbb9a2476fff62b34ac9de266a23ad9abfef22`. Annotated `protocol-freeze-v4` points to that exact commit and records:

`protocol-sha256: 65e188e8b79471aaa42713aaf4a635ef87696e894c4e7918b140ac77ffff9a5a`

The repository freeze guard accepts this test split. Previous freeze tags are preserved.

## Execution and analysis plan

Run [38276928082](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38276928082) uses `m4-items.yml` at `protocol-freeze-v4`: 18 newly admitted mined patterns, their 18 CSS_ONLY twins and 18 unchanged controls, in both NVDA legs (36 Windows jobs plus plan). Both sides, default frozen repetitions, axe enabled and K1 bracketing enabled; one shard per app. The 54 selected item ids are exactly the item paths added since `protocol-freeze-v3`. No old items are re-executed.

Combine this run with original run 38156720011 using the unchanged scorer under v4. Expected complete test set: 199 items (77 regression, 77 benign, 45 unchanged), 398 item/leg blocks. Preserve first-round G4 report and its decisions; report amended analysis separately. Frozen headline comparisons use symptom-uniform pattern bootstrap, 10000 resamples, seed 20261005, and the original 0.08 equivalence margin. No post-outcome oracle, trigger, journey, threshold or verdict edits. Failures and incomplete evidence are retained and reported; no outcome-driven reruns.

The accepted soak 38155513822 remains separately identified; no new soak is dispatched. M8 remains unauthorised.

## Verification before outcomes

- Published annotated v4 resolves to merged `22bbb9a`; remote tag object `d4e23e3c30c8858a50d2ea91175dc15c42785037`.
- Working-tree hash still matches v4 after documentation-only changes.
- No original v3 corpus item bytes changed. Full test registry contains 77 regression, 77 benign and 45 unchanged items.
- The reporting calculation reproduced all five first-round point estimates and percentile bounds exactly. The reproduction and source are retained under docs/research/m7-second-round-evidence. Source snapshot headline-analysis.mjs.txt is a standalone ES module: copy alongside it as headline-analysis.mjs and run from the repository root against the frozen scorer JSON; it does not change any scorer or detector code.
- Reporting PR14 repository checks passed at commit `8336e99`.

## Execution evidence

Run 38276928082 completed 16:22:22Z–16:48:28Z. 36 summaries, 108 blocks, 54 distinct items; all blocks CONFIRMATORY/VALID, no fatal errors, no invalid packages, no external requests. 324 attempts per leg; no new attempt validity reasons. All 216 K1 bracketing checks pass. Every job uses image 20260925.250.1, Node 24.21.0, Chrome 153.0.8010.12 and Playwright 1.63.0. NVDA-present jobs record NVDA 2026.2 with unchanged configuration/synth; NVDA-specific manifest fields are absent in the other leg.

The unchanged scorer combined old 145 items with new 54: 199 items and 398 item/leg blocks, 77 regressions, 77 benign, 45 unchanged. No missing-item override was used. Combined results, headline intervals and secondary analysis are retained in docs/research/m7-second-round-evidence. Gate report: docs/gates/G4-second-round.md; decisions: docs/gates/G4-second-round-brief.md.

## Limits observed under the frozen journeys

Four patterns have baseline steps UNREACHABLE in all 3 repetitions, including their twins and unchanged controls. Bootstrap 39189 cannot reach the opened-dialog goal in the NVDA-absent leg; its present leg detects the regression. Carbon 7861 cannot reach Chosen Alpha under real NVDA, while the absent leg detects the regression. Calendar 4620 cannot reach May 2018 under real NVDA, while the absent leg detects it; unchanged speech downgrades C_ADJUDICATED to REVIEW. Vuetify 22770 cannot reach the initial autocomplete in either leg and is a miss. These are baseline reachability limits, not invalid environment packages; the frozen oracles retain REVIEW or another leg's finding.

Date-picker 5428 produces FAILs, but their symptoms are INTERACTION_FAILS_UNDER_AT/JOURNEY_BLOCKED rather than its predeclared FOCUS_NOT_MOVED. It is therefore a primary-detection miss in every arm. No relabelling, dropped pattern, modified navigation or rerun follows these results. Candidate-only page errors are retained on Base UI 5532, Bootstrap 15168/39189 and MUI 46734 (three per leg); those agree with the reported broken-version exceptions. No attempt-level runner errors occurred.

This corpus has 51 seeded and 26 mined regressions; it is not a population estimate for product defects. No third expansion is pre-registered, and no M8 work has started.

## Published D6 archive

`artefacts/m7-second-round-archive/g4-second-round-evidence.tar.zst`: 704 files, 4,063,099 bytes; SHA-256 `05039cfd225f6674c1a6407541705e49d302ce00248e15c1694e9f7f61c64331`. Every archived file matches the downloaded source byte-for-byte. Mac filesystem metadata is excluded; all raw evidence files are retained and no NVDA binary is included. Manifest/checksums retained under docs/research/m7-second-round-evidence. Published on [results at 5ce8147](https://github.com/digitalcourtney87/a11y-regression-spike/tree/5ce8147bfba23ac7caca208a134c08791be07ff8/g4-second-round) after owner acceptance (DR-0112). The original preparation manifest/checksum is preserved; current publication metadata is in docs/research/m7-followup/archive-publication.json.
