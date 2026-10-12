# M8 calibration criteria declared before execution

2026-10-12; P40/DR-0114. All blocks EXPLORATORY, base only, three repetitions. No old test item/candidate is loaded. One dispatch/two60-minute Windows jobs.

| Controlled case | Known page behaviour | Diagnostic question/prediction |
|---|---|---|
| Delayed modal | Enter on Open details schedules visible focused Details after800ms, without another input | Nominal absent300ms goal check precedes focus; late1000ms observation-end read should show the dialog. Present900ms check should see focus. Actual QPC intervals/overhead are reported, not assumed exact. Late truth cannot revise early UNREACHABLE. |
| Nested editor | Wrapper named Wrapper field; native input labelled Actual field | First Tab should focus actual input with its own name, distinct from its named ancestor. Read both focused AX/MSAA node and deep active-element identity. |
| Feedback document | Input ArrowDown focuses Alpha; Enter or invoked click selects Alpha and writes Chosen Alpha, retaining option focus | Declare the same toggle/document-top/browse sequence before outcomes. Hypothesis: result is spoken within12browse attempts; failure is retained without another strategy or toggle. |
| Feedback application | Same markup/actions/content as feedback document, with only role=application on the container | Compare the same sequence; hypothesis: application context can prevent browse traversal. Internal mode is unavailable; neither presence nor absence of speech proves internal mode by itself. |

Working fixtures, once per leg/three baseline repetitions: Bootstrap5.3.1, Vuetify3.3.6, Fluent Calendar5.40.2 and Carbon FilterableMultiSelect7.28.0. Keep their original fixtures and journeys unchanged. Compare early/late/native-focus observations and speech with the four recorded limits; report if those behaviours do not repeat. No success condition requires navigation to be repaired or the hypotheses to hold.

Read-only additional observations may alter sampling delay. A focus read or goal read that is unavailable stays explicit; it neither supplies a fallback goal nor changes a primary step outcome. Environment/validity and bracketing K1 checks remain recorded. No renderer/scorer is used to turn these exposed cases into revised detection rates.
