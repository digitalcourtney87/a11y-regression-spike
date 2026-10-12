# M8 exploratory calibration pilot

Status: authorised dispatch completed with partial evidence; working-release comparisons remain incomplete. Owner approval P40/DR-0114. All evidence is EXPLORATORY. No new freeze or revised M7 detection rates.

## Execution and failure

[Run 38299059098](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38299059098) executed the one authorised dispatch at `e786e870fd73f044f3917c79cfd895fb07ce7a83`. Exactly two standard Windows jobs ran, each capped at 60 minutes. Both jobs failed because four working-release builds were unavailable, but both continued with the owned controls and uploaded all evidence. No experiment was retried.

The build failure is a path-handling error in the new script: `$logs` was relative to the repository; `Push-Location` entered the temporary fixture directory before `Out-File` opened each install log. The target log directory did not exist there. This affected Bootstrap 5.3.1, Vuetify 3.3.6, Calendar 5.40.2 and Carbon 7.28.0 in both legs. None of those working fixtures ran; no candidate release was built. Their eight missing case/leg comparisons are not treated as failures of the libraries or as detection misses.

The source repair resolves the evidence directory to an absolute path before any location change. A regression check added before that repair failed in ordinary Linux CI [38300158837](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38300158837). After repair it passed in [38300368608](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38300368608): the check writes a log after switching into another directory, without installing/building any fixture. The repaired working-release builds have not been tested in another Windows run. The failed pilot's code/evidence remains identified by its original head.

## Evidence integrity

Both owned-control groups completed: four controlled scenarios in each leg, eight blocks and 24 base-only attempts. All eight blocks are EXPLORATORY/VALID; all 16 K1 brackets pass; no fatal runner error, invalid package, attempt error, external request, page error or diagnostic-read error. All points explicitly mark internal NVDA mode unavailable. “Speech” in this report is text NVDA queues to the relay, not recorded audio. Both manifests retain the pinned environment; image `20260925.250.1`, Node 24.21.0, Chrome 153.0.8010.12, Playwright 1.63.0; the present leg records NVDA 2026.2, the unchanged config hash and eSpeak settings.

Source data: [audit](../research/m8-calibration-evidence/evidence-audit.json), [control results](../research/m8-calibration-evidence/control-results.json), [workflow metadata](../research/m8-calibration-evidence/workflow-run.json). Expected total was 16 blocks/48 attempts including the working fixtures; only the eight owned-control blocks/24 attempts were collected. Missing comparisons remain explicit. No assigned corpus item was loaded, no candidate side executed and no scorer was used.

## Speech interval interpretation

The raw observation-end `goal.speech` is cumulative since the last input and can repeat speech already seen by the primary goal check. It is not a late-only announcement record. The original receipt timestamps are retained in each attempt's `speechEvents`; [the interval audit](../research/m8-calibration-evidence/speech-intervals.json) partitions them into disjoint intervals before/during the early diagnostic and before/during the end diagnostic. [The read-only derivation](../research/m8-calibration-evidence/derive-speech-intervals.py) preserves every timestamp and event. Diagnostic boundaries bracket the additional reads; the exact primary goal-read timestamp is not separately captured, so these intervals do not establish its exact latency.

Chosen Alpha arrived before the early diagnostic in all three document-context repetitions, and no speech arrived in the remaining intervals. The repeated cumulative end snapshot does not indicate delayed feedback. Primary outcomes and archived raw evidence remain unchanged.

## Controlled findings

Every row describes all three repetitions per leg. Predictions were declared in [the criteria](../plans/2026-10-12-m8-calibration-criteria.md) before dispatch.

| Control | NVDA-absent | NVDA-present | Reading |
|---|---|---|---|
| Delayed modal | Early goal UNREACHABLE 3/3; late focus Details 3/3 | Early goal and late focus Details 3/3 | Timing mismatch is reproduced; late evidence does not rewrite early outcomes |
| Nested editor | Actual field/input reached 3/3 | Actual field/editable text reached 3/3 | Correctly labelled native input is distinguished from its differently named wrapper |
| Feedback in document | Chosen Alpha exists, but browse goal UNREACHABLE 3/3 | Chosen Alpha is queued and reached within three browse attempts, 3/3 | Native model has a separate cursor stall; real NVDA traverses this control |
| Feedback in application | Chosen Alpha exists, but browse goal UNREACHABLE 3/3 | Chosen Alpha exists, but 12 browse attempts produce no queued speech, 3/3 | Context-sensitive observable difference for the fixed sequence; internal mode is not directly established |

For the modal, nominal focus transfer is scheduled at 800 ms. QPC time from input request to the early diagnostic point is 312.2–313.1 ms absent and 909.3–910.0 ms present; corresponding observation-end points are 1316.1–1317.5 ms and 1915.2–1917.9 ms. These are diagnostic sampling times, not the exact focus-event timestamp or audio latency. Native early failure remains UNREACHABLE even when the later read sees a visible focused dialog.

The nested editor's actual input has id `actual`, label/aria-label Actual field, and a role=textbox ancestor named Wrapper field. Both focus readers return Actual field. This shows that the generic focused-node read can distinguish a correctly named nested input. It does not establish why the retained Vuetify input is unnamed; its fresh working-release comparison is missing.

The feedback pages share their markup/handlers, differing in the container's application role. Both select Alpha and display Chosen Alpha under real NVDA. Document context queues the result; application context keeps focus on Alpha and has no queued browse speech. Case order is fixed, not counterbalanced, and internal browse/focus state is unavailable from the receive-only relay. The observation supports a context hypothesis for this sequence; it is not a proof of internal mode or a universal rule for application containers.

## Simulated-cursor stall found on owned data

In both native feedback controls, attempts 6–12 repeatedly read the bullet static-text node, which has no backend DOM id. The cursor retains the previous Alpha option's backend id, so the next action finds the same bullet again. The bullet's parent is an ignored AX node, omitted from the flattened tree; line grouping therefore cannot follow that parent back to the option. This separates the bullet into another line, while the backend-id-only position cannot advance past it.

A [read-only replay](../research/m8-calibration-evidence/cursor-replay.json) of the captured [owned AX tree](../research/m8-calibration-evidence/owned-feedback-ax.json), using the unchanged `nextIndex`, `lineAt`, `indexOfBackend` and cursor-update rule, reproduces the same 12-step sequence. No fixture/browser/AT code was executed locally for this replay. This is an actionable limitation of the simulated cursor on that owned tree. No cursor, oracle, original journey or M7 verdict was changed. Any future cursor remedy needs a separately registered evaluation; it cannot be used to rescore exposed M7 results.

## Limits on the M7 interpretation

The accepted M7 rates remain results of the registered method. These diagnostics show that goal-check timing and navigation-model behaviour can affect which leg reaches a valid baseline, rather than isolating observation information alone. In the retained Bootstrap M7 case, B2 had a baseline goal failure while later native focus was already on the correct dialog; C detected the broken release in the other leg. That residual is not proof that only NVDA can observe the defect. The controlled delayed-modal result reinforces the timing concern, without replacing the missing fresh library comparison. The new cursor finding is proved on owned data, not attributed to every old item. No original statistic, verdict or inclusion decision is changed; stronger information-advantage claims need a separately designed, independently evaluated study.

## Budget and validation

Job durations: absent 6m51s, present 7m11s; summed duration 14m02s (14.0 runner-minutes) under the 120 runner-minute cap. These are GitHub administrative job durations, not invoiced billing or QPC comparison latency. Only one Windows dispatch and two jobs were used. No extra soak or retry occurred.

Implementation checks before dispatch: 755 local tests, lint/typecheck, workflow/clock policies and PowerShell syntax passed. Ordinary CI first timed out on the repository-wide safety scan at the old five-second test deadline; only that integration deadline was extended to 30 seconds, retaining all files and rules. Diagnostic isolation/read-error/budget tests and the later path regression check remain in CI. Incremental model work is estimated at tens of thousands of tokens, not priced/metered billing; the existing owner-monitored spend cap remains in force.

## Next step

M8's controlled calibration has useful findings, but the four working-release comparisons are incomplete. [The proposed recovery](../plans/M8-recovery-proposal.md) collects only those missing working releases, retaining the existing control data and navigation. It requires a new owner decision because the one-dispatch/two-job allowance has been consumed, even though its runner-minute cap was not reached. No recovery run has been launched. Separately, a future cursor-design amendment can address stable position/ignored ancestry, with independent validation rather than changed M7 rates.

## Gate review and archive

Independent gate review under the requesting-code-review skill found no actionable Critical/Important/Minor defects. It checked the isolation, raw counts, job durations, path repair and all 12 replay steps; 13 targeted portable tests pass. Owner brief: [M8 calibration gate](../gates/M8-calibration-brief.md). The complete failed-run evidence archive is prepared and verified, with its [manifest and checksum](../research/m8-calibration-evidence/archive-manifest.json) retained alongside the audit; publish under D6 after owner acceptance. The working-release build repair remains unverified in Windows, and P41 is pending.

## PR16 bot feedback follow-up

The handoff is now v1.17 and clearly separates current P40-consumed/P41-pending authority from historical records. Calibration rejects any shard other than 1/1 before selecting items. Regression tests failed before these guards and passed afterward. The P40 workflow is disabled in GitHub (including old refs), its manual trigger is removed, and its Windows job is unconditionally skipped in this head. P41 requires a separately approved request/workflow; no new dispatch occurred. Cumulative speech has been audited in disjoint retained-event intervals above, without changing what is collected.
