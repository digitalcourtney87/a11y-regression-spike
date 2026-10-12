# M8 calibration implementation

Owner approval: “Merged, please proceed with my approval”, following PR15 and P40. One dispatch; two Windows jobs; timeout 60 minutes each; no reruns.

Design: extend the existing journey-development runner with a strictly gated calibration option. Build only explicitly pinned working releases plus owned static controls. Calibration uses new dev pseudo-items, never reads assigned corpus items, and retains the existing early goal outcome. Read-only diagnostic points record goal-check/end focus and DOM identity, QPC times and explicit unavailable internal-mode state. No late observation changes a reached/unreachable outcome. The known controls are delayed modal focus, a labelled nested input, and the same selection feedback outside/inside an application container. Known functional content and navigation hypotheses are declared before dispatch.

Alternatives considered: a second independent AT runner would duplicate handover/clock/validity code; adding a new NVDA add-on API would expand the security/runtime boundary. Reuse the existing runner with no new relay capability. Internal mode is unavailable; speech, focus and controlled page effects are the evidence.

- [x] Tests first: calibration rejects test split, candidate sides, item ids, unknown cases and wrong repetition counts; pseudo-items stay dev/base-only. Diagnostic read failures are retained without changing the early goal.
- [x] Implement portable calibration definitions/observation helper and the opt-in runner path.
- [x] Add controlled pages and journeys; predeclare their expected content/early-late observations and browse hypotheses.
- [x] Build/launch script and one static two-leg workflow, capped 60 minutes/job. No request file until checks pass.
- [ ] Run targeted tests, full suite, lint/typecheck and workflow/clock safety policies; commit/push and verify ordinary CI.
- [ ] Commit the single dispatch request; retain both jobs regardless of outcome. Download, audit and report failures/unavailable observations; do not rerun.
- [ ] Prepare evidence/archive and reviewable result PR. Original M7 corpus, scores, oracles and freeze-v4 remain unchanged.
