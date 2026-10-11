# M7 completion batch five

EXPLORATORY. [Recorded plan](2026-10-11-m7-batch-five-plan.md). [Full ledger](2026-10-11-m7-batch-five-ledger.json). Sources are the issue bodies, relevant comments, timelines and named fixes, read under the recorded plan before reproduction. Original six pending leads remain separate; do not recount them. No new query after the stopping rule.

| Query | Hits | Inspected | New selected |
|---|---|---|---|
| `repo:radix-ui/primitives is:issue is:closed regression keyboard in:title,body` | 0 | 0 | 0 |
| `repo:radix-ui/primitives is:issue is:closed regression aria in:title,body` | 0 | 0 | 0 |
| `repo:adobe/react-spectrum is:issue is:closed regression keyboard in:title,body` | 8 | 8 | 2 |
| `repo:adobe/react-spectrum is:issue is:closed regression aria in:title,body` | 26 | 26 | 2 |
| `repo:mui/material-ui is:issue is:closed regression keyboard in:title,body` | 8 | 8 | 2 |
| `repo:mui/material-ui is:issue is:closed regression aria in:title,body` | 3 | 3 | 2 |
| `repo:carbon-design-system/carbon is:issue is:closed regression keyboard in:title,body` | 2 | 2 | 2 |
| `repo:carbon-design-system/carbon is:issue is:closed regression aria in:title,body` | 2 | 2 | 1 |
| `repo:microsoft/fluentui is:issue is:closed regression keyboard in:title,body` | 3 | 3 | 2 |
| `repo:microsoft/fluentui is:issue is:closed regression aria in:title,body` | 11 | 11 | 2 |
| `repo:tailwindlabs/headlessui is:issue is:closed regression keyboard in:title,body` | 0 | 0 | 0 |
| `repo:tailwindlabs/headlessui is:issue is:closed regression aria in:title,body` | 0 | 0 | 0 |
| `repo:vuetifyjs/vuetify is:issue is:closed regression keyboard in:title,body` | 2 | 2 | 2 |
| `repo:vuetifyjs/vuetify is:issue is:closed regression aria in:title,body` | 1 | 1 | 1 |
| `repo:palantir/blueprint is:issue is:closed regression keyboard in:title,body` | 1 | 1 | 0 |
| `repo:palantir/blueprint is:issue is:closed regression aria in:title,body` | 0 | 0 | 0 |

Batch four additionally reviews eleven previously query-capped issues in their recorded order.

| Candidate/source | Disposition | Evidence or remaining requirement |
|---|---|---|
| [adobe/react-spectrum #10051](https://github.com/adobe/react-spectrum/issues/10051) | rejected | Reporter explicitly says keyboard works; pointer-only shadow-root issue. |
| [adobe/react-spectrum #9631](https://github.com/adobe/react-spectrum/issues/9631) | rejected | Browser URL-hint visual/hover behaviour; maintainer defers to Chrome fix, no library keyboard regression. |
| [adobe/react-spectrum #10591](https://github.com/adobe/react-spectrum/issues/10591) | rejected | Reporter identifies log spam without user impact; no primary symptom. |
| [adobe/react-spectrum #10387](https://github.com/adobe/react-spectrum/issues/10387) | rejected | Firefox-specific selection focus issue; Chrome unaffected. |
| [mui/material-ui #48443](https://github.com/mui/material-ui/issues/48443) | rejected | Unstable MenuBar implementation request; no working stable release regression. |
| [mui/material-ui #48438](https://github.com/mui/material-ui/issues/48438) | rejected | Unstable NumberField implementation request; no working stable release regression. |
| [mui/material-ui #48908](https://github.com/mui/material-ui/issues/48908) | rejected | Reporter traces it to application renderInput dropping required slots; not library regression. |
| [mui/material-ui #34306](https://github.com/mui/material-ui/issues/34306) | rejected | Closed for missing minimal reproduction; no identified library fix. |
| [carbon-design-system/carbon #23126](https://github.com/carbon-design-system/carbon/issues/23126) | pending documentary | Merged fix #23157 for swallowed Escape in passive modal; working last-good/broken published boundary and exact setup still needed. |
| [carbon-design-system/carbon #7861](https://github.com/carbon-design-system/carbon/issues/7861) | pending documentary | Merged #8178 updates FilterableMultiSelect keyboard behaviour; accessible last-good/broken published boundary unestablished. |
| [carbon-design-system/carbon #21464](https://github.com/carbon-design-system/carbon/issues/21464) | rejected | Duplicate error-message IDs/description association; no issue-derived primary symptom established by the static report. |
| [microsoft/fluentui #9048](https://github.com/microsoft/fluentui/issues/9048) | rejected | Focus outline visibility regression; outside primary scored vocabulary. |
| [microsoft/fluentui #7622](https://github.com/microsoft/fluentui/issues/7622) | rejected | No library fix; maintainer suspects application React event bubbling. |
| [microsoft/fluentui #36685](https://github.com/microsoft/fluentui/issues/36685) | rejected | Headless versus styled package comparison, with missing decorative icon defaults; no same-package working/broken release pair established. |
| [microsoft/fluentui #36647](https://github.com/microsoft/fluentui/issues/36647) | pending documentary | Headless popover attribute override defect and fix linked; same-package working last-good and first-broken pair not established. |
| [vuetifyjs/vuetify #18547](https://github.com/vuetifyjs/vuetify/issues/18547) | rejected | Regression from Vue-2 Vuetify v2 to Vue-3 v3; cannot share the pinned framework dependencies. |
| [vuetifyjs/vuetify #14072](https://github.com/vuetifyjs/vuetify/issues/14072) | pending documentary | Reported good 2.4.5, broken 2.4.11; exact merged fix and keyboard-only selection path remain needed because reported path selects by mouse. |
| [vuetifyjs/vuetify #19460](https://github.com/vuetifyjs/vuetify/issues/19460) | rejected | Intentional change to select-only combobox semantics; no library fix or lost user-facing outcome established. |

DR-0099 is the current completion progress record. Vuetify has two identical exploratory reproductions and a test twin/control; DataGrid remains unadmitted after setup/reachability failures. [Evidence comparison](m7-completion-evidence/vuetify-repeat-comparison.json). No assigned execution or new tag. Fifteen additions still needed; completion continues.
