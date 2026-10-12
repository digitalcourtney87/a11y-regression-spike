# Proposed M8: exploratory harness calibration

Status: approved by the owner on 2026-10-12 (P40, DR-0114), after PR15 merge. The documented milestone sequence ends at M7; this scopes a possible next task rather than assuming a product milestone. M7's two adjudicated comparisons remain inconclusive. The [retained-evidence diagnosis](../reports/M7-followup-diagnosis.md) identifies specific journey/measurement limits that should be understood before another study.

## Objective and scope

Determine whether late focus changes, native input naming and NVDA mode/context explain the recorded baseline limits. This pilot validates the harness assumptions; it does not increase the 77-pattern confirmatory sample or establish revised detection rates. Date-picker's goal/expectation mismatch is already established statically and needs a future protocol design, not another attempt at the original test.

1. First build controlled known-answer pages: a delayed modal focus transfer, a labelled nested editable widget, and selection feedback both inside and outside an application container. Declare success criteria before their execution.
2. Add diagnostic observations for focus at the original goal-check time and at observation end, the actual focused element's accessible name, and read-position/mode evidence where available. Record any unavailable mode evidence explicitly. No added activation, fallback navigation, live threshold selection or hidden retry.
3. Compare those observations with the working releases of Bootstrap #39189, Vuetify #22770, Calendar #4620 and Carbon #7861. These source fixtures are exposed follow-up cases, not new confirmatory evidence. Use base-only exploratory blocks; do not load assigned test items or evaluate broken releases in this pilot.
4. Produce a findings report and a separate amendment/design proposal if changes are justified. Any later evaluation of a changed detector or journey requires a new pre-registered protocol, freeze and independent validation data.

## Execution envelope

- One dispatch, at most two standard Windows jobs: one NVDA-absent and one NVDA-present. Each job includes the controlled pages and four working fixtures, with three repetitions per case.
- Timeout 60 minutes per job: hard upper bound 120 runner-minutes. No automatic retries, extra soak or second dispatch without a new owner decision. If this envelope proves insufficient, report incomplete evidence rather than enlarge it.
- Preserve pinned Node/Chrome/NVDA, synth, locale, listener and existing workflow security: read-only permissions, no secrets, install scripts disabled for third-party fixtures, public source/package pins, standard runners. No third-party fixture execution locally. No additional external service or credential.
- Label every block and report EXPLORATORY. Work on a separate branch. Changes to frozen paths cannot be used to execute or rescore the old test split; protocol-freeze-v4 stays unchanged.
- Estimated incremental model work: tens of thousands of tokens for implementation/diagnosis/reporting; this is a planning order of magnitude, not priced billing. Measured run duration and actual dispatch count go in the final report.

## Completion criteria

The report distinguishes observed evidence from hypotheses, compares early/late focus on the known-answer modal, establishes which native node is actually focused, and shows whether browse input is interpreted as document reading on the controlled cases. Every failure and unavailable diagnostic is retained. Success does not require the old four fixtures to become navigable. No detector or past verdict is changed by this pilot.

## Owner decision

Approve this bounded exploratory pilot with its new diagnostic observations and at most two Windows jobs/120 runner-minutes? Recommendation: Yes. The repository's hard rule 12 requires approval because this adds what is measured and defines a new cost envelope. Approved by the owner; implementation and the single bounded dispatch may proceed (DR-0114).
