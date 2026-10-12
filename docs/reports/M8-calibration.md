# M8 exploratory calibration pilot

Status: single approved dispatch requested; results pending. Owner approval P40/DR-0114 after PR15 merge. Label: EXPLORATORY; no new freeze or revised M7 detection rates.

Implementation head before request:486cf44. Ordinary CI38298775548 passes after the full-repository safety-scan test timeout was adjusted; pre-dispatch CI38298492501 timed out on that test, with PowerShell syntax/lint/typecheck and754 tests passing. All755 local tests pass. New instrumentation/owned controls are disclosed in A-019; the test guard refuses the changed branch under the existing v4 freeze.

The workflow request is one dispatch with exactly two standard Windows jobs (absent/present),60minutes each, no retry. Five manifest cases: four owned controls plus working-only Bootstrap5.3.1, Vuetify3.3.6, Calendar5.40.2 and Carbon7.28.0. All blocks use new dev pseudo-items; no assigned corpus item or candidate release is loaded/built. Three repetitions per case. Bracketing K1, existing handover, environment/clock/validity checks retained; axe scoring is not part of this diagnostic.

Before-outcome criteria: docs/plans/2026-10-12-m8-calibration-criteria.md. Early and observation-end focus/identity reads remain separate; late observations cannot revise early goal outcomes. Internal NVDA mode is explicitly unavailable from the existing receive-only relay. Captured speech/page effects can support context hypotheses, not prove internal mode. Additional read overhead is retained as a timing limitation. Every failure and incomplete/unavailable observation will be reported; no second dispatch is authorised.
