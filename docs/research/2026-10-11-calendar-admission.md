# Calendar second-round admission

EXPLORATORY. DR-0096; [recorded plan](../plans/2026-10-11-calendar-admission.md). One addition is now built: `oss--fluent-4620`, assigned to test with a benign twin and unchanged control. The corpus has 20 dev and 60 test regression patterns. **17 further qualifying additions are required** to reach 77 test patterns. No new freeze tag or confirmatory execution has occurred.

## Evidence and symptom

[Fluent UI issue #4620](https://github.com/microsoft/fluentui/issues/4620) requires one month/year advance per keyboard activation. [Library fix #4662](https://github.com/microsoft/fluentui/pull/4662) corrects duplicate activation after controls became native buttons. Source/release fingerprints and the two independent earlier checks are in [the evidence directory](m7-mining-evidence/calendar-repeat-comparison.json).

[Admission run 38175379953](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38175379953), fixture commit `09b9e5a89192a20e055ef288b3db5f51f67601ad`, retains the original one-Space criterion. New diagnostics inspect the accessible month with the existing virtual-cursor model and repeat the keyboard check on a fresh page with main maxWidth 480, the benign twin's identical inline CSS change.

| office-ui-fabric-react | Pointer | Keyboard | Browse goal May 2018 after Space | CSS-only twin |
|---|---|---|---|---|
| 5.40.2 (good) | April → May | April → May | Reached at line 4 | April → May; line 4 |
| 5.41.0 (broken) | April → May | April → June | Unreachable | April → June; unreachable |
| 5.90.0 (fixed) | April → May | April → May | Reached at line 2 | April → May; line 2 |

All installs/builds exit 0, and all pages have zero errors/external requests. Raw [good](m7-mining-evidence/38175379953-5.40.2.check.json), [broken](m7-mining-evidence/38175379953-5.41.0.check.json), [fixed](m7-mining-evidence/38175379953-5.90.0.check.json) and [build](m7-mining-evidence/38175379953-builds.json) records are retained. The fixed release's different browse count is documentary corroboration only; the corpus pair is good/broken.

The existing `JOURNEY_BLOCKED` definition covers failure to complete the declared outcome: reach May 2018 after one Space. The journey Tabs to Next month, enters focus mode, presses Space, restores browse mode, resets to document top and browses until May 2018 with at most 60 attempts. Explicit focus mode preserves the reported native Space path. There is no invented live announcement or new state expectation, oracle or threshold. The probe checks accessibility-tree reachability, not real NVDA speech; actual assigned journey execution remains behind the new-tag requirement.

## Companion items and assignment

- Regression: immutable fixture commit shared by good 5.40.2 and broken 5.41.0; React/react-dom 16.2.0 on both, MIT package.
- Benign twin: one `CSS_ONLY` edit sets main maxWidth 480. Date, labels, Calendar props and handlers stay identical. The diagnostic checks the same CSS on a fresh page; the generated source patch passes `git apply --check`. No assigned twin is browser-executed before the new freeze.
- Unchanged control: exactly the same last-good ref on both sides of the new journey.

P39 explicitly assigns additions to test. The all-test append records an unused seed 0 and testFraction 1; the prior randomized split algorithm is not invoked. All 79 previous pattern assignments, existing items and journeys are preserved. The candidate registry now holds 12 verified mined pairs. Pointer reproduction metadata is false because the pointer control stays correct on the broken release; keyboard reproduction metadata is true.

Corpus validation reports 204 items and 80 regression patterns: 20 dev and 60 test. Lint/typecheck and all 154 existing corpus/schema tests pass. A-004 records the frozen-set changes after G4 exposure; the old G4 evidence stays pinned to protocol-freeze-v3.

## Remaining work

[Follow-up](2026-10-11-m7-leads-followup.md) excludes Carbon #3397 and leaves four documentary leads pending, none ready for CI. [The next bounded search plan](2026-10-11-m7-next-mining-plan.md) is recorded before search. No new query under that plan has run. Do not infer availability of the other 17 patterns from Calendar's admission.

All six admission workflow jobs completed successfully. Calendar elapsed 116 seconds; the sum of the five Windows jobs was 873 seconds. These start-to-completion intervals include setup and are not a billing estimate. [Run summary](m7-mining-evidence/run-summary.json) preserves the timestamps. The workflow checked only then-unsplit Calendar and existing dev fixtures; its existing test-twins job built previously assigned twins without executing them.
