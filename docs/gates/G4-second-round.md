# Gate G4: second-round confirmatory results

Date: 2026-10-12. Owner review pending. This is the amended 77-pattern analysis; [the accepted 59-pattern report](G4.md) remains preserved. Decisions: [second-round brief](G4-second-round-brief.md). Execution and limits: [M7 second-round report](../reports/M7-second-round.md).

## Recommendation

Accept the second-round results with the baseline reachability limits disclosed. Events add detections beyond the tree, and real NVDA adds detections under UNION. Trigger masking retains UNION within the pre-registered 0.08 margin. C versus B2 and D versus C remain inconclusive under ADJUDICATED. Do not claim that the adjudicated hypotheses are settled, retune detection, or enlarge the confirmatory corpus from these outcomes. M8 remains unauthorised; any next research phase needs a separate owner decision.

## Evidence and freeze

Annotated `protocol-freeze-v4` points to merged commit `22bbb9a2476fff62b34ac9de266a23ad9abfef22`, with `protocol-sha256: 65e188e8b79471aaa42713aaf4a635ef87696e894c4e7918b140ac77ffff9a5a`. Authorisation is DR-0110. No frozen path changed on the reporting branch. A-004–018 document the second-round construction and metadata corrections after first-round exposure; oracles, triggers and measurement definitions remain unchanged.

New [run 38276928082](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38276928082), 16:22:22Z–16:48:28Z, has 36 successful item jobs, 36 confirmatory summaries and 108 valid blocks for 54 new items. Both legs are present for every item. 324 attempts per leg, no new validity reasons, all 216 bracketing canaries pass, no fatal or package errors. All jobs use image 20260925.250.1 and the pinned environment.

The frozen scorer combines it with original [run 38156720011](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38156720011): 199 items, 398 blocks, 77 regression, 77 benign, 45 unchanged. All original item bytes and assignments are preserved. No old item is re-executed and no missing-item override is used. First-round evidence/soak remain archived on results at `aea1b4f`; the new raw archive is prepared locally for publication after gate acceptance, as D6 requires. Its 704 files were verified byte-for-byte; the compressed bundle is 4,063,099 bytes and its [manifest and checksum](../research/m7-second-round-evidence/archive-manifest.json) are retained. Retained [scorer output](../research/m7-second-round-evidence/combined-scorer-report.md), [scores](../research/m7-second-round-evidence/combined-scores.json), [evidence audit](../research/m7-second-round-evidence/evidence-audit.json) and checksums make this analysis reviewable.

## Headline comparisons

Differences are symptom-uniform rates, not raw detection proportions. Same paired pattern bootstrap as the original report: 10000 resamples, seed 20261005, sorted pattern clusters, shared draws within each comparison, percentile floor(p× 10000). The reporting calculation exactly reproduces all five original G4 intervals before application to 77 patterns. The frozen scorer remains unchanged. Difference excludes 0; equivalence lies strictly inside (−0.08, 0.08); other cases are inconclusive (PROTOCOL §3).

| Comparison | Difference | 95% interval | Call |
|---|---|---|---|
| B2 versus B | +0.079365 | 0.010417 to 0.133333 | difference |
| C_UNION versus B2 | +0.052976 | 0.008772 to 0.115497 | difference |
| C_ADJUDICATED versus B2 | -0.054663 | -0.144444 to 0.045511 | inconclusive |
| D_UNION versus C_UNION | -0.011905 | -0.041667 to 0.000000 | equivalent within 0.08 |
| D_ADJUDICATED versus C_ADJUDICATED | +0.029762 | -0.022727 to 0.095000 | inconclusive |

C versus B2 UNION moves from inconclusive to difference. The adjudicated comparisons remain inconclusive at the pre-registered 77. B2 versus B and D versus C UNION retain their prior calls. McNemar is secondary: b/c/p are 4/0/0.125, 5/0/0.0625, 5/6/1.000, 0/1/1.000 and 3/1/0.625 in the table's order; false-FAIL discordants are all 0.

## Arms and false failures

Correct-symptom FAIL is detection; REVIEW and INCONCLUSIVE are misses. Reachability symptoms share the pre-registered family; FOCUS_NOT_MOVED does not join it.

| Arm | Detection | Symptom-uniform rate (bootstrap 95%) | Wrong-symptom FAIL | Regression REVIEW |
|---|---|---|---|---|
| A | 13/77 | 15.7% (10.2–21.8) | 6 | 6 |
| B | 57/77 | 66.8% (58.1–77.1) | 5 | 3 |
| B2 | 61/77 | 74.8% (66.6–83.2) | 5 | 3 |
| C_UNION | 66/77 | 80.1% (71.5–89.1) | 5 | 2 |
| C_ADJUDICATED | 60/77 | 69.3% (58.4–81.3) | 5 | 8 |
| D_UNION | 65/77 | 78.9% (70.2–88.1) | 5 | 2 |
| D_ADJUDICATED | 62/77 | 72.3% (62.5–83.3) | 5 | 5 |

Every arm has 0/77 false FAILs on benign items (Wilson 95% 0–4.8%) and 0/45 on unchanged controls (0–7.9%). Zero observed false failures does not establish a zero population rate. Item-level INCONCLUSIVE is 0/199 in every arm. REVIEW counts for benign/unchanged are A 1/0, B/B2/D_UNION/D_ADJUDICATED3/2, and C_UNION/C_ADJUDICATED5/4.

## Baseline reachability and symptom limits

[The audit](../research/m7-second-round-evidence/evidence-audit.json) retains every attempted step. Four new patterns fail a baseline goal in all repetitions, also on twins and unchanged controls:

| Pattern | Leg/goal | Frozen reading |
|---|---|---|
| Bootstrap 39189 | Absent/open-details | B/B2 REVIEW; real NVDA detects the regression |
| Carbon 7861 | Present/reach-result | NVDA baseline REVIEW; B2 supplies the detection |
| Calendar 4620 | Present/reach-expected-month | NVDA baseline REVIEW; B2 detects, C_ADJUDICATED downgrades unchanged speech |
| Vuetify 22770 | Both/reach-autocomplete | REVIEW and primary miss |

Date-picker 5428 FAILs carry reachability symptoms instead of its predeclared FOCUS_NOT_MOVED, so all arms miss it in the primary correct-symptom analysis. No items are excluded and no verdicts are hand-edited. No navigation repair or outcome-driven rerun was performed. Candidate page errors on Base UI 5532, Bootstrap 15168/39189 and MUI 46734 are retained; they match the published broken-version exceptions. No external requests or attempt-level runner errors occurred.

## Rule-model secondary analysis

The dev-selected rule 1 (C detects iff B2 detects) is unchanged. C detects and rule 1 does not in 5/77 for either combination: 6.5%, Wilson 2.8–14.3%. Agreement is 72/77 UNION (93.5%, 85.7–97.2%) and 66/77 ADJUDICATED (85.7%, 76.2–91.8%). The five residual items are the original three plus Bootstrap 39189 and Vuetify 21591. This does not alter any primary verdict.

## Reliability and timing

Combined attempt counts are 1262 per leg, with 6 pre-outcome inconclusive attempts each (0.48%, exact 95% 0.17–1.03%), all retained from round 1. Bracketing K1 is 397/398 absent and 398/398 present; the absent failure is also from round 1. The original 600-per-leg known-answer soak is unchanged: 599 valid, 0 failures, 1 inconclusive per leg; its two-sided exact upper bound remains 0.61%. See [M7-soak](../reports/M7-soak.md).

Estimated AT-segment time over 199 items: C 4605.1 s, D 688.9 s (15.0% of C); 285/889 steps triggered. D keeps 65/66 C UNION detections and 59/60 C ADJUDICATED detections, while detecting three additional items under adjudication. These are estimates from triggered segment durations, excluding startup/handover, not measured end-to-end savings.

## Scope and next decision

This is a single-agent report using the authorised M7 run; gate review has not been performed with multiple agents. Direct model spend cannot be recovered as a priced total from repository records; estimated incremental model use for execution oversight and reporting is tens of thousands of tokens (an order-of-magnitude estimate, not metered billing), smaller than the 18-pattern mining/build effort, whose 34 source-reproduction dispatches are separately recorded. The new run contains 36 standard Windows jobs and took 26m06s wall time; no additional soak or outcome-driven reruns were dispatched.

The corpus comprises 51 seeded and 26 mined regressions; it does not estimate population prevalence. The amended build was performed after first-round outcomes were known, as disclosed in A-004–018, under P22/P39 and the fixed 77 target. No third expansion is pre-registered. Preserve both analyses, publish the prepared D6 archive after acceptance, and keep M8 unstarted pending a separately scoped plan. Phase 1 proceed/stop remains 27 November 2026 (DR-0003).
