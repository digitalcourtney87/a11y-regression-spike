# M7 second-round mining feasibility (2026-10-11)

EXPLORATORY. [Plan recorded before search](2026-10-11-m7-mining-plan.md); [candidate ledger and sources](2026-10-11-m7-mining-ledger.md); [machine-readable ledger](2026-10-11-m7-mining-ledger.json). Authority: P39/P22 and DR-0093. This is a bounded feasibility pass, not the second confirmatory round.

## Documentary result

| Stage | Count |
|---|---|
| Planned queries completed | 16 across 8 repositories |
| Unique selected issues outside the existing registry reviewed | 36 (cap 48) |
| Excluded from this pass | 30 |
| Pending documentary evidence | 5 |
| Documentary candidate taken to exploratory reproduction | 1: Fluent UI #4620 |
| Reproduced in two successful exploratory runs (including owner-authorised follow-up) | 1: Fluent UI #4620 |
| Corpus patterns admitted | 0 |

These dispositions are evidence states, not claims that every rejected issue is an invalid bug. Most excluded issues request features, discuss visual styling or touch behaviour, lack a specific library fix, or describe constructs not established as accessible in a last-good release. The existing registry has 11 entries, all verified pairs, and was excluded from selection. DR-0063 records 47 historical candidates reviewed, but that full survey is not the current registry. Headless UI #2934 was already mentioned in the earlier title survey and was rediscovered here; it is rejected and does not count as an addition. The fixed search order was not changed to target G4 misses.

## Reproduction

Exploratory run [38173756427](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38173756427) on `ea7dec0`, branch `codex/m7-mining-feasibility`, checks the new unsplit `fluent-4620` fixture at 5.40.2, 5.41.0 and 5.90.0 with React/react-dom 16.2.0. All three releases installed and built, but each check returned a page-render error because `Calendar.strings` was null. The required localisation strings were added identically on each release before a second dispatch, under P22 rule 8. The first attempt supplies no behavioural reproduction evidence. The replacement [run 38174040191](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38174040191), commit `d50c8c2`, reproduced the keyboard regression once: 5.40.2 advances April → May, 5.41.0 advances April → June, and 5.90.0 advances April → May. Pointer activation advances April → May in all three. Installs/builds return 0, with no page errors or external requests. Raw check and build outputs are preserved in [the evidence directory](m7-mining-evidence/38174040191-builds.json). That bounded pass reached its two-dispatch limit. The owner subsequently authorised one additional Calendar repeat; run 38174572204 (`0b5e0a1`) gives identical check outcomes and dependency locks, resolving the independent-repeat requirement (DR-0095).

The expectation is taken from the issue and fix: one Space press on Next month advances exactly one month. Pointer activation is a control.

The unchanged mining workflow also checks three existing dev fixtures and builds existing test twins. The first dispatch has one Ubuntu list job and five Windows jobs (four fixture jobs and the test-twins build). Test-split fixture checks remain excluded by the workflow's original split filter. No third-party fixture was executed locally. No confirmatory test item was executed or scored.

Adding the exploratory fixture changes the frozen set; [A-003](../../protocol/AMENDMENTS.md) discloses G4 exposure and records this change. No new freeze tag exists. Existing G4 scores stay reproducible at `protocol-freeze-v3`.

## Outstanding evidence

| Candidate | What is missing before reproduction/admission |
|---|---|
| React Spectrum #2572 | Accessible last-good and first-broken published release pair; the issue itself questions whether the missing key support is a regression. Fix #3000 alone does not establish that boundary |
| Carbon #2600 | Last-good release and exact merged fix/release; broken 6.28.3 is reported |
| Carbon #3397 | Complete MDX reproduction context and merged library fix; reported 7.2/7.3 transition alone is insufficient |
| Fluent UI #4432 | Published last-good/broken pair and NVDA/Chrome reproduction; the issue describes Narrator/Edge |
| Blueprint #3988 | Identified merged fix and compatible stable fixed release; closure only suggests a possible fix in 4.0.0-rc.1 |
| Fluent UI #4620 | Mapping to the existing primary symptom/journey vocabulary and companion twin/control work; the last-good release is labelled and keyboard reachable in the exploratory fixture, but full admission/journey requirements remain pending |

Pending documentary candidates are not scheduled for CI until their documentary requirements are met. No oracle or symptom definition will be changed to admit them.

## Feasibility and next step

This pass does not establish availability of 18 additions. Even if the Calendar candidate and all five documentary leads qualify, this selected set supplies at most six new patterns, leaving at least twelve to source. Confirmed corpus additions remain zero until full P22 checks and admission requirements pass.

The broad terms matched discussion text (including comments about preventing future regressions), and creation-date order favoured old enhancement issues. This is a limitation of this bounded search, not evidence that the libraries contain no further qualifying regressions. Do not extrapolate its yield to the whole ecosystem or select a new search from G4's misses.

Before a further pass, record a revised bounded query plan, prioritising explicit regression reports in titles/labels and continuing a deterministic ordering, while retaining P22 and excluding this ledger, the original registry and leads already recorded in earlier survey/verification notes. Resolve the five documentary leads by source/release history where feasible. Do not revive the dropped seeded patterns or alter a base app to meet the count.

## Cost and scope

The first pass reviewed 36 issues, followed relevant comments/fixes, inspected published Calendar source without executing it, and built one exploratory fixture. Two CI dispatches were used: the first candidate check failed its rendering precondition; the second reproduced the regression. Each dispatch schedules one Ubuntu list job and five Windows jobs, including existing dev-fixture checks and test-twin builds. The first overall run was cancelled by the replacement dispatch while its Carbon dev job remained running. This is overhead of the existing workflow, not 18 new-pattern construction cost. No reliable total cost for finding 18 pairs follows from this sample.

The 77-pattern target, original assignments, frozen oracles, triggers and thresholds, M8 boundary and 27 November 2026 decision date remain unchanged. A shortfall must be reported before changing context, base application, verification criteria or target count.

### Recorded runner elapsed time

Elapsed seconds are job start-to-completion intervals from GitHub, including setup and cancellations; they are not a billing estimate. [Job summaries](m7-mining-evidence/run-summary.json) preserve the timestamps.

| Run | Overall outcome | New Calendar job | Sum of five Windows jobs |
|---|---|---|---|
| [38173756427](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38173756427) | cancelled | 181 s | 842 s |
| [38174040191](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38174040191) | success | 119 s | 783 s |
| [38174572204](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38174572204) (owner-authorised follow-up) | success | 114 s | 797 s |

## Owner-authorised repeat (DR-0095)

[Run 38174572204](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38174572204) independently repeats the Calendar result without changing the fixture or execution paths. Good and fixed releases advance one month on Space; the broken release advances two. Pointer controls pass all releases, and there are no page errors or external requests. [The recorded comparison](m7-mining-evidence/calendar-repeat-comparison.json) also confirms identical resolved dependency locks and check output. The candidate now has two successful exploratory reproductions; admission remains outstanding.

This follow-up is one additional owner-authorised dispatch, separate from the bounded pass's original two-dispatch budget. It makes no new search or corpus assignment and changes no check criterion, oracle or threshold.

The repeat workflow completed successfully in all six jobs. The Calendar job elapsed time and the full Windows job sum are recorded above; these are not a billing estimate.
