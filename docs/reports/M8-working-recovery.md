# M8 working-release calibration recovery

Status: authorised P41/DR-0116 recovery completed; accepted through PR17 merge on 2026-10-12 (DR-0118). This completes the missing exploratory comparisons from the partial P40 pilot. No M7 verdict, detection rate, inclusion decision, navigation, oracle or freeze tag changes.

## Execution and integrity

[Run 38307364080](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38307364080) ran once at `2c4ed7809b110cb263e44031d02e43b414171389`. Exactly two standard Windows jobs, capped 60 minutes each, completed successfully. Only Bootstrap 5.3.1, Vuetify 3.3.6, Calendar/office-ui-fabric-react 5.40.2 and Carbon FilterableMultiSelect 7.28.0 were built, once per leg; all eight builds succeeded. Three base-only repetitions per case produced eight EXPLORATORY/VALID blocks and 24 attempts. All 16 bracketing K1 checks pass; all eight environment manifests validate. No fatal runner, package, attempt, page, external-request or diagnostic-read errors. No controls were repeated, no candidate/assigned corpus item was loaded and no scorer was run.

Vuetify's baseline goal fails in both legs, so its subsequent open-options, first-option and wrap steps are explicitly not run in all six attempts. A successful workflow means evidence collection completed, not that every journey goal was reached. Those omissions are not repaired or treated as library regressions.

Evidence: [audit](../research/m8-recovery-evidence/evidence-audit.json), [step results](../research/m8-recovery-evidence/working-results.json), [workflow metadata](../research/m8-recovery-evidence/workflow-run.json), [read-only derivation](../research/m8-recovery-evidence/derive-working-results.py). Raw child summaries retain the inherited `calibrationApproval=P40/DR-0114` label from the original instrumentation. That consumed allowance does not authorise this run. The separate request, run head and parent pilot summaries establish P41/DR-0116 execution authority; the audit distinguishes these explicitly, without relabelling raw records.

## Repeated findings

Every observation below repeats in all three attempts per leg. Original journeys remain unchanged.

| Working release | NVDA-absent | NVDA-present | Interpretation |
|---|---|---|---|
| Bootstrap 5.3.1 | Early dialog goal UNREACHABLE; later Details dialog focused | Early goal REACHED; later Details dialog focused | The baseline timing mismatch repeats on the actual working release |
| Vuetify 3.3.6 | Initial named-input goal UNREACHABLE after 20 attempts | Same goal UNREACHABLE after 20 attempts | Both focused-node readers report an unnamed editable field despite retained labels/named nested full-tree evidence; downstream wrap navigation is untested |
| Calendar 5.40.2 | Next month reached in two attempts; May 2018 reached after four browse attempts | Next month reached in two attempts; May 2018 browse goal UNREACHABLE after 60, with no queued speech | Both pages display May 2018, but the fixed NVDA sequence does not traverse the result |
| Carbon 7.28.0 | Choices reached, Alpha selected, Chosen Alpha reached after 13 browse attempts | Choices reached, Alpha selected; Chosen Alpha browse goal UNREACHABLE after 60, with no queued speech | Both pages display Chosen Alpha; page functionality and goal navigation diverge |

Bootstrap's QPC interval from the last input request to the early diagnostic is 317.3–319.4 ms absent versus 914.4–916.0 ms present; observation-end diagnostics are 1322.2–1327.4 ms versus 1925.7–1926.9 ms. These are sampling times, not exact focus-event timestamps or audio latency. The absent early failure remains UNREACHABLE despite later native focus on the correct dialog. Combined with the owned delayed-modal control, this supports a sampling-time explanation for the baseline difference; it does not establish that only NVDA can observe the dialog.

Vuetify's first focused element is INPUT `input-0`, with two Select an item labels and a textbox ancestor. The absent partial-tree focus read returns an unnamed textbox at the input's backend id; the retained end full-tree snapshot names that input Select an item, and the ARIA snapshot shows a named nested textbox. MSAA also returns an unnamed editable field at the first present-leg check. These reads occur at different times, so this establishes a read/sampling discrepancy, not its complete root cause or proof that a particular API flag is responsible. The labelled owned nested-input control worked in both legs; that does not resolve Vuetify's more specific structure. Changing the reader after observing these cases would need a separately registered evaluation, not old-test rescoring.

Calendar retains focus on Next month June after displaying May 2018; the DOM ancestor has role=application. Carbon's MSAA focus reports Alpha while the DOM focus remains on the Choices input. The fixed browse/toggle sequence produces no speech throughout either final present-leg browse segment, while each expected result exists in the retained page snapshots. This repeats the earlier navigation/context concern. Internal NVDA mode remains unavailable in every diagnostic point; role=application is not asserted for Carbon, and no internal-mode causal claim follows from the silence. Neither extra toggles nor alternate keys were tried.

## Speech and interpretation limits

[Disjoint speech intervals](../research/m8-recovery-evidence/speech-intervals.json) are derived from retained QPC receipt timestamps around the diagnostic reads. Observation-end `goal.speech` is cumulative since the last input, not late-only speech. The exact primary goal-read timestamp is not separately captured. Empty final browse segments in Calendar/Carbon are checked against the full step speech events as well as sampled goals; a cumulative snapshot cannot manufacture a delayed announcement.

The original M7 analysis remains a result of its registered method. These exploratory observations support limits on a stronger claim about unique NVDA information: timing, focused-node naming, virtual navigation and real browse context can change whether a valid working baseline is reached. They do not change any old detection rate or establish the cause of every old failure. The owned simulated-cursor stall remains a separate, proved control finding; the actual Carbon and Calendar native journeys reach their results here, so that stall is not attributed to them.

## Budget, checks and archive

Absent job: 6m23s; present: 13m15s; summed 19m38s (19.6 runner-minutes), below this dispatch's 120-minute cap. These are administrative job durations, not invoiced costs or collector latency. Together with P40's 14m02s, M8 used two separately approved dispatches/four jobs and 33m40s summed duration. No retry occurred. Incremental model effort is estimated at tens of thousands of tokens, within the unchanged owner-monitored cap; no metered billing claim is made.

Before execution, 771 portable tests, lint/typecheck and ordinary CI passed, including PowerShell request selection/absolute log-path verification without fixture execution. The recovery workflow is now disabled repository-wide and its job unconditionally skipped. P40 remains disabled. No further Windows dispatch is authorised. A retirement regression failed before the job guard changed and passed afterward.

The complete raw recovery archive contains 70 files, 356268 bytes compressed, verified file-for-file against its inventory; no NVDA binaries are included. [Archive manifest](../research/m8-recovery-evidence/archive-manifest.json), bundle SHA-256 `847c304bcc01756af1395e49ff1f8ea829d6680f709ff7d8303ea1bc1a50d898`. Published under D6 on results at `363cbf5`, under `m8-working-recovery/`, after the owner accepted PR17 ([publication record](../research/m8-recovery-evidence/archive-publication.json), DR-0118). The accepted original partial pilot remains on results at dbf0fc2, with all failures retained.

## Next step

The owner accepted this completed calibration record and its stated limits through PR17 merge (DR-0118). Next, design a separately evaluated remedy for simulated-cursor identity/ignored ancestry and focused-name sampling, using fresh owned controls. Register the measurement/validation changes before implementation and keep exposed M7 outcomes fixed. No new remedy, experiment, cost envelope or Phase 1 commitment is authorised by this report; the Phase 1 decision date remains 27 November 2026.

Independent final [gate review](../research/m8-recovery-evidence/gate-review.json) found no actionable defects and verified the raw counts, omissions, observations, budget, archive and retired workflows. All 27 targeted tests pass; the final local full suite passes 771 tests/typecheck. Local lint excludes only unrelated untracked duplicate files that appeared in the workspace; repository policy is unchanged and final CI runs normal lint on the committed head.
