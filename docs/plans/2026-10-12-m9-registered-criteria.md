# M9 registered criteria (P42)

2026-10-12. Approved as P42 (DR-0120). This document, `fixtures/m9-controls/` and `journeys/m9-*.json` are committed and checksummed in `docs/research/m9-registration/SHA256SUMS` **before cursor v2 exists**. Nothing on these controls is executed before the single dispatch, locally or in CI. After first execution, any change to a control, prediction, definition or rule needs a new registration with new controls. The M8 controls and captured trees are development data only.

All blocks are EXPLORATORY and base only, with three repetitions, bracketing K1 checks and the approved early and late diagnostics. The app is `m9-controls`. Every journey's anchor is `body`, and every step observes for 1000 ms.

## Cases and order

| Case | Leg | Cursor model | Journeys |
|---|---|---|---|
| `p42-cursor` | both | v1 in the absent leg; not used in the present leg | C1–C4 |
| `p42-cursor-v2` | absent only | v2 | C1–C4 |
| `p42-focus` | both | v1, unused by TAB steps | F1–F4 |

Each leg runs its cases in the order listed. The case order and the order of journeys within a case are fixed and not counterbalanced. Each repetition loads a fresh page.

## Controls and registered predictions

Cursor journeys run DOCUMENT_TOP, then BROWSE_NEXT until the target line, up to the stated maximum. C4 then sends one more BROWSE_NEXT whose goal is the same final line.

| Id | Journey | Target, maximum | Prediction |
|---|---|---|---|
| C1 | `m9-marker-list`: ordered `listbox` of three `option` list items with numbered CSS markers, then a paragraph | "Marker target reached", 15 | NVDA reaches the target. v2 reaches it with no repeated position. v1 repeats a marker position and does not reach the target (positive control) |
| C2 | `m9-generated-text`: generic container whose text begins with CSS `::before` "Note: ", then a paragraph | "Generated target reached", 10 | NVDA and v2 reach the target, v2 with no repeated position. v1 is recorded, not predicted |
| C3 | `m9-ignored-wrappers`: one paragraph whose two sentences sit inside `role="none"` and `role="presentation"` spans, then a paragraph | "Wrapper target reached", 10 | NVDA, v1 and v2 reach the target. v2's attempt count is at most v1's in every repetition |
| C4 | `m9-plain-page`: heading, paragraph, button, subheading and final paragraph, with no ignored ancestry or generated text | "Plain final line.", 8; then one past-end attempt | v1 and v2 have identical line sequences and reach the target. In the past-end step both remain on the final line (DR-0085). NVDA's past-end outcome is recorded, not predicted |

Each focus journey has one TAB step with goal role `textbox`, the label as goal name and `maxAttempts: 1`. Focus therefore stays on the field for the end read.

| Id | Journey | Label | Prediction at the early read |
|---|---|---|---|
| F1 | `m9-static-label`: visible label for the input | Delivery note | Every focus-time reader and NVDA's focus speech give the name |
| F2 | `m9-focus-hidden-label`: two labels for the input; on focus the resting label is `visibility: hidden` and the floating copy is `aria-hidden="true"` | Billing code | Every focus-time reader is unnamed, and NVDA's focus speech has no name |
| F3 | `m9-delayed-label`: the label is linked to the input 1100 ms after first focus | Account reference | Early reads are unnamed. End reads are named, because P40 timings put both legs' end reads after 1100 ms. Whether NVDA announces the name change is recorded, not predicted |
| F4 | `m9-unnamed-wrapper`: unnamed `role="textbox"` wrapper around a labelled input | Item name | Every focus-time reader returns the input with its own name, and NVDA's focus speech has it |

## Operational definitions

- **Name present.** The label, normalised by `speechKey`, is contained in the read name or utterance. This is the harness's existing containment rule.
- **Early absent read.** The NVDA-absent goal read for attempt 1: the partial-tree node of the deep active element.
- **Early MSAA read.** The NVDA-present goal read for attempt 1.
- **Same-instant full-tree read.** The approved new observation, made only for TAB and SHIFT_TAB steps of P42 cases. It runs in both legs, inside each goal-check and observation-end diagnostic point. It resolves the deep active element's backend id, then reads that node's name and role from one `Accessibility.getFullAXTree` call. It never changes an outcome.
- **NVDA focus speech.** Utterances from the TAB attempt's start up to the end of its goal-check diagnostic point. Later utterances up to step end are recorded separately as late speech.
- **End read.** The observation-end diagnostic point's goal read: the partial-tree read in the absent leg and MSAA in the present leg.
- **Line.** The absent-leg `goalTrace` line for one BROWSE_NEXT attempt, as a sequence of (name, role). Backend ids differ between page loads, so they are excluded from comparisons across runs.
- **Repeated position.** Two consecutive attempts in one step whose lines are identical, including backend ids, before the step reaches its goal.
- **Reaches the target.** The step's outcome is REACHED: by the line goal in the absent leg, and by speech in the present leg.

## Decision rules

1. **Cursor v2** is accepted for future registered studies only if all three hold:
   - In 3/3 repetitions on C1, C2 and C3, v2 reaches the target within the maximum with no repeated position.
   - On C4, v2's lines equal v1's in every repetition.
   - NVDA reaches the C1–C4 targets in 3/3. Otherwise that control is reported as invalid, not replaced, and v2 cannot be accepted on it.

   If v1 does not repeat a marker position on C1, the positive control was not reproduced. That is reported as a limit, not as a v2 failure. If acceptance fails, v1 remains the only model. No v2 change follows without a new registration.
2. **Focus readers** stay unchanged if, on every F control, name presence is identical across all of the following: the three early absent reads, the three early MSAA reads and the three NVDA focus-speech windows. If the partial read disagrees with NVDA while the same-instant full-tree read agrees, a reader change is proposed in a later registration, not adopted. A disagreement by MSAA alone is reported only. A failed page prediction is reported as a fact about the page mechanism; it does not by itself change the rule outcome.
3. **Invalidity.** An invalid block, missing build, read error or failed K1 bracket leaves the affected comparison missing. Nothing is substituted, retried or re-run. No threshold, maximum, definition or control changes after results.

The M7 result, its exposed cases, the Vuetify fixture and `protocol-freeze-v4` are not touched. No outcome here rescores or reinterprets an M7 verdict or rate.
