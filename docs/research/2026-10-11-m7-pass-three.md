# M7 broader mining pass

EXPLORATORY. [Plan](2026-10-11-m7-pass-three-plan.md) committed as `5607d07` before search; [full query/disposition ledger](2026-10-11-m7-pass-three-ledger.json). Owner authorised proceeding after the pass-two report. Repository/query ordering and caps are preserved. No candidate selected from G4 misses.

## Search

| Query | Total hits | Inspected | New selected |
|---|---|---|---|
| `repo:radix-ui/primitives is:issue is:closed regression in:title` | 8 | 8 | 4150 |
| `repo:radix-ui/primitives is:issue is:closed label:regression` | 0 | 0 | — |
| `repo:adobe/react-spectrum is:issue is:closed regression in:title` | 9 | 9 | 5887, 8637, 9776 |
| `repo:adobe/react-spectrum is:issue is:closed label:regression` | 0 | 0 | — |
| `repo:mui/material-ui is:issue is:closed regression in:title` | 39 | 30 | 7089, 8004, 11576 |
| `repo:mui/material-ui is:issue is:closed label:regression` | 0 | 0 | — |
| `repo:microsoft/fluentui is:issue is:closed regression in:title` | 43 | 30 | 1542, 2545, 5757 |
| `repo:microsoft/fluentui is:issue is:closed label:regression` | 0 | 0 | — |

Eight queries, 77 inspected hits and ten selected new issues. Four exact `regression` label queries were empty; this does not establish that the repositories lack differently named regression labels. Body-term filtering was deliberately broad, so code, boilerplate and styling requests also passed. Creation-date order favoured older reports. The JSON preserves every inspected hit and why it was excluded or left beyond the per-query cap. No query failed or was substituted.

## Documentary dispositions

| Candidate/source | Disposition | Evidence requirement or exclusion |
|---|---|---|
| [radix-ui/primitives #4150](https://github.com/radix-ui/primitives/issues/4150) | rejected | Nested Flight lazy render failure; no working accessible last-good release or declared keyboard regression established. |
| [adobe/react-spectrum #5887](https://github.com/adobe/react-spectrum/issues/5887) | rejected | Locale bundle-size/tree-shaking regression; strings remain included, no primary user-facing accessibility symptom. |
| [adobe/react-spectrum #8637](https://github.com/adobe/react-spectrum/issues/8637) | admitted (DR-0098) | Two reproductions, browse-outcome/CSS-twin diagnostics; test assignment with twin/control. |
| [adobe/react-spectrum #9776](https://github.com/adobe/react-spectrum/issues/9776) | pending documentary | Merged fix #9781 for initial render loop; needs compatible pinned release boundary and an accessible complete last-good construct/keyboard scenario. The reported example only renders a bare input. |
| [mui/material-ui #7089](https://github.com/mui/material-ui/issues/7089) | rejected | Input text colour styling; primary vocabulary does not score colour/contrast. |
| [mui/material-ui #8004](https://github.com/mui/material-ui/issues/8004) | rejected | TypeScript compilation failure across beta releases; no stable accessible user-facing keyboard pair. |
| [mui/material-ui #11576](https://github.com/mui/material-ui/issues/11576) | rejected | Keyboard issue is concrete, but closed as v0.x unmaintained with no library fix (P22 rule 6). |
| [microsoft/fluentui #1542](https://github.com/microsoft/fluentui/issues/1542) | pending documentary | Enter activates row handler instead of cell link; maintainer says fixed in new release, but exact merged fix and last-good/broken pair remain unidentified. |
| [microsoft/fluentui #2545](https://github.com/microsoft/fluentui/issues/2545) | rejected | Callout placement/available visual space; intentional change and no reported AT keyboard outcome. Linked #3719 is an issue, not a merged fix. |
| [microsoft/fluentui #5757](https://github.com/microsoft/fluentui/issues/5757) | rejected | Request for themed visual regression tests, not a concrete accessible release regression. |

Seven exclusions, two pending documentary leads and one candidate taken to reproduction and subsequently admitted. Pending leads are not admitted or scheduled for CI; the four earlier pending leads remain separate.

## DateField release evidence

[Issue #8637](https://github.com/adobe/react-spectrum/issues/8637) documents date-entry mistakes after leading-zero suppression. A comment specifies uninterrupted `01011970` yielding `1/1/1970` before the change. The [merged revert #8684](https://github.com/adobe/react-spectrum/pull/8684) undoes [#8447](https://github.com/adobe/react-spectrum/pull/8447). Public npm source contains the leading-zero suppression in @react-aria/datepicker 3.15.0, absent in 3.14.5 and 3.15.1. The corresponding stable umbrella releases are @adobe/react-spectrum 3.42.2, 3.43.0 and 3.44.0. [Source/release fingerprints](m7-pass-three-evidence/datefield-source-pins.json) retain publication dates, dependency ranges and licences. Source inference supports this proposed boundary; CI must establish the observed behaviour.

The new unsplit labelled DateField uses en-US and shared React/react-dom 18.3.1. It begins empty, receives continuous `01011970` from its first segment, and must produce `1970-01-01`. The keyboard scenario reaches the first segment by Tab; the pointer-start control clicks that segment before the same typing. Neither inserts manual segment navigation. The check is issue-derived and is independent of arm oracles.

The existing m3-oss-repro workflow is used with its existing safeguards and dev-fixture/test-twin-build overhead. Calendar is already test-assigned and excluded from fixture execution. No local third-party execution or confirmatory execution occurs. The admission below follows the two successful candidate checks. A-005 records the new fixture after G4 exposure; no freeze tag is created.

## Reproduction and admission (DR-0098)

Two candidate checks reproduce the same criterion. [Run 38176937862](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38176937862) on `ca2d1e9` returns January 1, 1970 on good 3.42.2 and fixed 3.44.0, but October 11, 970 on broken 3.43.0, from both pointer-start and Tab. All installs/builds exit zero and there are no page errors/external requests. Its candidate artifact finished before the replacement; the remaining Carbon dev job was cancelled by existing concurrency. The overall run is therefore cancelled, despite successful candidate results.

[Run 38177297242](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38177297242) on `6138990` repeats the original criterion unchanged, with identical resolved locks. Additional pre-assignment diagnostics find the expected ISO date at browse line 8 in good/fixed and nowhere in broken. A fresh-page main maxWidth 480 CSS-only twin preserves those outcomes. All six workflow jobs succeed. [Comparison](m7-pass-three-evidence/repeat-comparison.json), raw checks/builds and [run summaries](m7-pass-three-evidence/run-summary.json) are preserved with SHA-256 hashes.

Register `oss--ras-8637` with the existing JOURNEY_BLOCKED definition: continuous entry must reach the declared date. Its journey Tabs to the month segment, types the eight digits, restores browse mode, resets to document top and browses to `1970-01-01` (maximum 60 attempts). It uses the existing TYPE, mode-toggle and browse contract; no state/announcement definition, oracle or threshold is invented. The date string is an ordinary rendered output of the entered DateField value, identically on every release. NVDA's automatic focus mode for the editable segment is assumed by this declared path; actual NVDA journey behaviour remains evidence to collect after a new freeze, not evidence from this probe.

P39 appends one test assignment without changing any prior assignment. Immutable fixture commit `613899074a9864fff939ebaa29bdca6b77fc0ae5` is shared by base/candidate. Add a CSS_ONLY source patch setting main maxWidth to 480 and an unchanged base/base control for the new journey. The diagnostic applies that same inline style on a fresh page; the generated source patch passes applicability checks. No assigned test item is executed. The first workflow also built the existing Calendar twin successfully; this is build-only evidence, not an executed test journey.

Corpus validation: 207 items, 81 regression patterns, comprising 20 dev and 61 test. Lint/typecheck and all 154 corpus/schema tests pass. A-006 discloses admission after G4 exposure. Calendar and DateField are now two of the required 18 additions: **16 still needed**. Two new documentary leads plus the four earlier leads remain pending. Availability of the rest is unestablished; the bounded search and two-dispatch cap are reached.

## Recorded runner time

Elapsed start-to-completion intervals include setup/cancellations and are not billing estimates. Each dispatch schedules one list job and five Windows jobs (one new fixture, three existing dev checks and existing test-twin builds).

| Run | Overall outcome | DateField job | Sum of five Windows jobs |
|---|---|---|---|
| [38176937862](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38176937862) | cancelled | 132 s | 902 s |
| [38177297242](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38177297242) | success | 135 s | 817 s |
