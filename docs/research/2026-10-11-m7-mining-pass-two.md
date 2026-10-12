# M7 mining pass two

EXPLORATORY. [Pre-recorded plan](2026-10-11-m7-next-mining-plan.md); [machine-readable ledger](2026-10-11-m7-mining-pass-two.json). Owner authorised moving to the next task after PR #12; PR #12 was already merged when checked (merge ba2831f). This pass ran on its successor branch.

## Search result

Eight queries completed in the recorded repository/term order, sorted by creation date ascending, with at most 30 hits inspected per query. Three hits total; two already reviewed, one new issue selected. Five queries were empty. No query failed or was substituted.

| Query | Hits | New selected | Already reviewed |
|---|---|---|---|
| `repo:radix-ui/primitives is:issue is:closed regression keyboard in:title` | 0 | — | — |
| `repo:radix-ui/primitives is:issue is:closed regression accessibility in:title` | 0 | — | — |
| `repo:adobe/react-spectrum is:issue is:closed regression keyboard in:title` | 1 | — | 8298 |
| `repo:adobe/react-spectrum is:issue is:closed regression accessibility in:title` | 0 | — | — |
| `repo:mui/material-ui is:issue is:closed regression keyboard in:title` | 1 | — | 18236 |
| `repo:mui/material-ui is:issue is:closed regression accessibility in:title` | 0 | — | — |
| `repo:microsoft/fluentui is:issue is:closed regression keyboard in:title` | 0 | — | — |
| `repo:microsoft/fluentui is:issue is:closed regression accessibility in:title` | 1 | 8750 | — |

[React Spectrum #8298](https://github.com/adobe/react-spectrum/issues/8298) and [MUI #18236](https://github.com/mui/material-ui/issues/18236) are already excluded in the original registry/survey and contribute no new candidate. The first had failed earlier reproduction; the second lacked a primary symptom.

## New candidate disposition

[Fluent UI #8750](https://github.com/microsoft/fluentui/issues/8750) reports an accessibility scanner's invalid `aria-describedby` reference after upgrading to 6.165.0. Discussion separates documentation-site findings from a Picker-library finding. [Merged library fix #8753](https://github.com/microsoft/fluentui/pull/8753) was released as 6.167.2 according to the issue's release comments.

The [source diff](https://github.com/microsoft/fluentui/pull/8753/files) changes the reference from always present to present only when `items.length > 0`. Snapshot changes remove that reference on an empty Picker; the input's accessible name, role and state remain. With no selected items, the referenced list contains no expected descriptive content to convey. The issue's check is a scanner finding, not a specified missing name, state, announcement or failed keyboard outcome. This is an inference from the fix and report, and excludes the candidate under P22 rule 7/current primary vocabulary; it does not claim the library fix was unnecessary. No working last-good release is established, and no reproduction is scheduled.

## Feasibility and boundaries

One new documentary candidate reviewed, one excluded, zero admitted patterns. No fixtures, corpus assignments, frozen paths or workflows changed; no local third-party execution, CI dispatch, confirmatory execution or new tag. Existing Calendar admission remains one of the required 18 additions: 60 test patterns, with **17 still needed**. Four earlier documentary leads remain pending.

The title-only intersection is too sparse in these four repositories to supply additional candidates in this pass. This result says nothing about all remaining issues or libraries. A further search needs a recorded revised plan, for example regression titles/labels with keyboard/accessibility terms allowed in the body; do not improvise extra queries or relax P22 to meet the count. Expanding context, target or verification criteria remains an owner decision under hard rule 12.
