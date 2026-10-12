# Proposed M8 recovery: missing working-release comparisons

Status: approved, P41/DR-0116, by “Merged, please continue” following PR16 merge. The single recovery dispatch is now consumed by successful run 38307364080 (DR-0117); no further dispatch is authorised. P40's one dispatch is complete with all four working-release builds unavailable because of the now-corrected log path. The owned controls have valid data and will not be repeated in this recovery.

Authorised: one additional dispatch, capped at two standard Windows jobs (one per leg), 60 minutes each/120 additional runner-minutes, with no retry.

Scope: Bootstrap 5.3.1, Vuetify 3.3.6, Calendar 5.40.2 and Carbon FilterableMultiSelect 7.28.0; their same original working fixtures/journeys and the already-approved early/late diagnostic observations, three base-only repetitions each. Expected eight blocks/24 attempts. No candidates, assigned corpus item, new measurement, changed navigation, detector fix or old-test rescore. Reuse the same pinned environment, read-only permissions, script-disabled installs and no-secret boundary. Retain all failures and unavailable mode evidence.

The consumed P40 workflow is disabled and will remain retired. P41 needs a separate approved request and workflow. Before dispatch, add a strictly validated working-only case selection to the request/launcher/build plan; verify local tests and ordinary CI. Source path repair and its red/green regression are already reviewable in PR16. The request is committed only after owner approval. This is a new additional budget, not a use of unspecified retries or a reinterpretation of P40's single-dispatch limit. Estimated incremental model effort: tens of thousands of tokens for implementation/analysis/reporting, within the unchanged owner-monitored model-spend cap.

Recommendation: Yes, to complete the missing comparisons before designing any remedy. If either job is incomplete, report that result and do not dispatch again without another decision.
