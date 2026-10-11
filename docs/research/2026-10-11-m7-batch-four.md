# M7 completion batch four

EXPLORATORY. [Recorded plan](2026-10-11-m7-completion-plan.md). [Full ledger](2026-10-11-m7-batch-four-ledger.json). Sources are the issue bodies, relevant comments, timelines and named fixes, read under the recorded plan before reproduction. Original six pending leads remain separate; do not recount them. No new query after the stopping rule.

| Query | Hits | Inspected | New selected |
|---|---|---|---|
| `repo:radix-ui/primitives is:issue is:closed keyboard in:title` | 25 | 25 | 2 |
| `repo:radix-ui/primitives is:issue is:closed accessibility in:title` | 18 | 18 | 2 |
| `repo:adobe/react-spectrum is:issue is:closed keyboard in:title` | 86 | 30 | 2 |
| `repo:adobe/react-spectrum is:issue is:closed accessibility in:title` | 23 | 23 | 2 |
| `repo:mui/material-ui is:issue is:closed keyboard in:title` | 137 | 30 | 2 |
| `repo:mui/material-ui is:issue is:closed accessibility in:title` | 75 | 30 | 2 |
| `repo:carbon-design-system/carbon is:issue is:closed keyboard in:title` | 194 | 30 | 2 |
| `repo:carbon-design-system/carbon is:issue is:closed accessibility in:title` | 159 | 30 | 2 |
| `repo:microsoft/fluentui is:issue is:closed keyboard in:title` | 360 | 30 | 2 |
| `repo:microsoft/fluentui is:issue is:closed accessibility in:title` | 631 | 30 | 2 |
| `repo:tailwindlabs/headlessui is:issue is:closed keyboard in:title` | 32 | 30 | 2 |
| `repo:tailwindlabs/headlessui is:issue is:closed accessibility in:title` | 16 | 16 | 2 |
| `repo:vuetifyjs/vuetify is:issue is:closed keyboard in:title` | 134 | 30 | 2 |
| `repo:vuetifyjs/vuetify is:issue is:closed accessibility in:title` | 57 | 30 | 2 |
| `repo:palantir/blueprint is:issue is:closed keyboard in:title` | 12 | 12 | 2 |
| `repo:palantir/blueprint is:issue is:closed accessibility in:title` | 5 | 5 | 2 |

Batch four additionally reviews eleven previously query-capped issues in their recorded order.

| Candidate/source | Disposition | Evidence or remaining requirement |
|---|---|---|
| [adobe/react-spectrum #9937](https://github.com/adobe/react-spectrum/issues/9937) | rejected | Identifier/API render error; no identified library fix or declared keyboard release regression. Maintainer discussion includes unsupported Row nesting in a related reproduction. |
| [adobe/react-spectrum #10324](https://github.com/adobe/react-spectrum/issues/10324) | rejected | Underlay pointer-press scroll/animation regression; no keyboard reproduction of that pointer path. |
| [mui/material-ui #11587](https://github.com/mui/material-ui/issues/11587) | rejected | CSS specificity/design change crossing beta to release; no primary symptom. |
| [mui/material-ui #13247](https://github.com/mui/material-ui/issues/13247) | rejected | Browser bundling/process-variable failure, not a declared accessible interaction regression. |
| [mui/material-ui #13283](https://github.com/mui/material-ui/issues/13283) | rejected | Reporter could not reproduce outside own environment; resolved by dependency reinstall, no library fix. |
| [mui/material-ui #43741](https://github.com/mui/material-ui/issues/43741) | rejected | Button colour inheritance; no primary scored symptom. |
| [microsoft/fluentui #13012](https://github.com/microsoft/fluentui/issues/13012) | rejected | High-contrast CSS/browser tracking umbrella; no isolated primary symptom/release pair. |
| [microsoft/fluentui #22878](https://github.com/microsoft/fluentui/issues/22878) | rejected | Modeless modal placement/layout; reporter does not identify an accessibility interaction symptom. |
| [microsoft/fluentui #23680](https://github.com/microsoft/fluentui/issues/23680) | rejected | Skeleton visual animation; no primary symptom. |
| [microsoft/fluentui #25701](https://github.com/microsoft/fluentui/issues/25701) | rejected | Stack gap/wrap layout; no primary symptom. |
| [microsoft/fluentui #27997](https://github.com/microsoft/fluentui/issues/27997) | documentary candidate | Library revert and stable release boundary identified, but setup/reachability preconditions failed in 38178617035, 38178948350 and 38179257999. No behavioural keyboard evidence or admission yet; uniform API/navigation setup repairs under P22 rule 8. |
| [radix-ui/primitives #3709](https://github.com/radix-ui/primitives/issues/3709) | pending documentary | OTP value/navigation fix linked (#3831), but accessible last-good/first-broken release boundary remains unidentified. |
| [radix-ui/primitives #3396](https://github.com/radix-ui/primitives/issues/3396) | rejected | Firefox-only report, Chrome unaffected; maintainer cannot reproduce current version, no identified fix. |
| [radix-ui/primitives #4091](https://github.com/radix-ui/primitives/issues/4091) | rejected | Conformance report says all checks pass; not a release regression. |
| [radix-ui/primitives #3634](https://github.com/radix-ui/primitives/issues/3634) | rejected | Toast has a separate announcement element; visible-element off/status audit changes do not establish a working/broken announcement pair. Report also discusses external inert ancestors. |
| [adobe/react-spectrum #10132](https://github.com/adobe/react-spectrum/issues/10132) | rejected | Duplicate of longstanding TableView navigation issue #2328; no identified merged regression fix or working/broken release pair. |
| [adobe/react-spectrum #10055](https://github.com/adobe/react-spectrum/issues/10055) | pending documentary | Keyboard DnD fix #10170 linked; need published accessible last-good/first-broken boundary and stable compatible pins. |
| [adobe/react-spectrum #10440](https://github.com/adobe/react-spectrum/issues/10440) | rejected | Conformance report says all checks pass; not a release regression. |
| [adobe/react-spectrum #6377](https://github.com/adobe/react-spectrum/issues/6377) | rejected | Alpha CardView audit best-practice issue; no stable release pair or changed conveyed role established. |
| [mui/material-ui #48957](https://github.com/mui/material-ui/issues/48957) | rejected | Documentation website copy button; no two published library releases identified. |
| [mui/material-ui #48718](https://github.com/mui/material-ui/issues/48718) | rejected | Focus-ring feature RFC; no accessible release regression. |
| [mui/material-ui #48959](https://github.com/mui/material-ui/issues/48959) | rejected | Website focus contrast finding; outside primary symptom vocabulary. |
| [mui/material-ui #48941](https://github.com/mui/material-ui/issues/48941) | rejected | Conformance/default-mounting report; no established accessible last-good/library regression pair. |
| [carbon-design-system/carbon #22280](https://github.com/carbon-design-system/carbon/issues/22280) | rejected | Pointer text selection after tooltip focus; no keyboard-only reported reproduction or fix. |
| [carbon-design-system/carbon #21886](https://github.com/carbon-design-system/carbon/issues/21886) | rejected | Attribute/property synchronization report; no user-facing conveyed value failure established. |
| [carbon-design-system/carbon #22510](https://github.com/carbon-design-system/carbon/issues/22510) | rejected | Application-supplied invalidText content; maintainer assigns responsibility to implementer. |
| [carbon-design-system/carbon #22291](https://github.com/carbon-design-system/carbon/issues/22291) | rejected | Extra Tab stop complaint; no primary failure or working/broken release pair established. |
| [microsoft/fluentui #35657](https://github.com/microsoft/fluentui/issues/35657) | rejected | Duplicate of #35656 concerning Edge native password reveal; no Chrome/library last-good regression pair. |
| [microsoft/fluentui #35655](https://github.com/microsoft/fluentui/issues/35655) | rejected | Duplicate native password-reveal/contrast report; no independent mechanism or library release pair. |
| [microsoft/fluentui #35656](https://github.com/microsoft/fluentui/issues/35656) | rejected | Edge-native reveal control/contrast; no Chrome last-good/broken library path established. |
| [microsoft/fluentui #35150](https://github.com/microsoft/fluentui/issues/35150) | rejected | Browser-native password reveal tooltip; maintainer says not provided by the library. |
| [tailwindlabs/headlessui #3759](https://github.com/tailwindlabs/headlessui/issues/3759) | rejected | Pointer-position-dependent Tab behaviour; maintainer traces it to tabindex=-1, no library regression fix or good release established. |
| [tailwindlabs/headlessui #3739](https://github.com/tailwindlabs/headlessui/issues/3739) | pending documentary | Merged fix #3769 for incidental mouse hover during keyboard scrolling; last-good boundary and reproducible keyboard-only journey context remain unestablished. |
| [tailwindlabs/headlessui #3491](https://github.com/tailwindlabs/headlessui/issues/3491) | rejected | Focus guards are intentional; no last-good/broken user-facing symptom established. |
| [tailwindlabs/headlessui #3272](https://github.com/tailwindlabs/headlessui/issues/3272) | rejected | Maintainer describes normalization from intentionally native-select-like behaviour; no previously working Tab release. |
| [vuetifyjs/vuetify #22770](https://github.com/vuetifyjs/vuetify/issues/22770) | admitted | Two identical exploratory checks and locks (38178948350/38179257999), with same keyboard/twin outcomes; test regression/twin/control added under DR-0099. |
| [vuetifyjs/vuetify #22454](https://github.com/vuetifyjs/vuetify/issues/22454) | rejected | Documentation uses wrong format prop; fixed by correcting example, not library release regression. |
| [vuetifyjs/vuetify #22792](https://github.com/vuetifyjs/vuetify/issues/22792) | rejected | Vague scanner finding with no isolated reproducible library fix or working base. |
| [vuetifyjs/vuetify #22226](https://github.com/vuetifyjs/vuetify/issues/22226) | rejected | Mobile VoiceOver/TalkBack swipe navigation; outside pinned Windows/NVDA/Chrome path. |
| [palantir/blueprint #4810](https://github.com/palantir/blueprint/issues/4810) | rejected | Request to make non-href menu items focusable by default; no previously working accessible release. |
| [palantir/blueprint #4503](https://github.com/palantir/blueprint/issues/4503) | rejected | Reported trigger requires mouse blur after keyboard focus; no keyboard-only regression pair established. |
| [palantir/blueprint #7055](https://github.com/palantir/blueprint/issues/7055) | rejected | Firefox-only focus hang; report explicitly says Chrome correct. |
| [palantir/blueprint #6693](https://github.com/palantir/blueprint/issues/6693) | rejected | Alternate physical/character keyboard-layout mismatch; no compatible working/broken pair under pinned keyboard context established. |

DR-0099 is the current completion progress record. Vuetify has two identical exploratory reproductions and a test twin/control; DataGrid remains unadmitted after setup/reachability failures. [Evidence comparison](m7-completion-evidence/vuetify-repeat-comparison.json). No assigned execution or new tag. Fifteen additions still needed; completion continues.
