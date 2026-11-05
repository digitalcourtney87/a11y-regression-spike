# What a real screen reader adds to accessibility regression testing

This is a research study, not a product. It tested whether a real screen reader, run in continuous integration (CI), catches accessibility regressions that cheaper automated checks miss. The study used NonVisual Desktop Access (NVDA) on GitHub-hosted Windows runners, against a corpus of 77 regressions, scored against a protocol frozen before scoring.

**[Read the findings: 77 regressions, tested](docs/findings.md)**

## Results in brief

**Regressions detected as each layer is added, out of 77 patterns**

<table>
<thead>
<tr><th scope="col">Layer</th><th scope="col">Detected (of 77)</th><th scope="col">Rate</th><th scope="col">95% interval</th></tr>
</thead>
<tbody>
<tr><th scope="row">axe at each journey state</th><td>13</td><td>15.7%</td><td>10.2% to 21.8%</td></tr>
<tr><th scope="row">Plus Chrome’s accessibility tree</th><td>57</td><td>66.8%</td><td>58.1% to 77.1%</td></tr>
<tr><th scope="row">Plus event observation</th><td>61</td><td>74.8%</td><td>66.6% to 83.2%</td></tr>
<tr><th scope="row">Plus NVDA at triggered steps</th><td>65</td><td>78.9%</td><td>70.2% to 88.1%</td></tr>
<tr><th scope="row">Plus NVDA on every step</th><td>66</td><td>80.1%</td><td>71.5% to 89.1%</td></tr>
</tbody>
</table>

- Checks of the page and its accessibility tree caught about two-thirds. Watching page changes and Windows accessibility events took that to about three-quarters.
- The real screen reader added about five points more. That gain is real but uncertain: its interval runs from 0.9 to 11.5 points.
- Running NVDA only at triggered steps, such as a dialog opening, kept 4 of its 5 extra detections.
- No configuration raised a false alarm on 77 harmless changes or 45 unchanged builds.
- Letting the screen reader overrule the cheaper checks removed no false alarms, because there were none, and turned 6 of their detections into misses.

Rates give each symptom type equal weight, so they describe what each layer can detect in this corpus, not how common each kind of regression is. The [findings](docs/findings.md) explain the method, what didn't work and the limits.

## Check the results

- **Sources.** Every figure comes from [the accepted 77-pattern gate report](docs/gates/G4-second-round.md), [the frozen scorer's output](docs/research/m7-second-round-evidence/combined-scorer-report.md) and [the reliability soak report](docs/reports/M7-soak.md).
- **Protocol.** The confirmatory protocol is [`protocol/PROTOCOL.md`](protocol/PROTOCOL.md), with changes after the freeze in [`protocol/AMENDMENTS.md`](protocol/AMENDMENTS.md). The 77-pattern results were scored once, at [the `protocol-freeze-v4` tag](https://github.com/digitalcourtney87/a11y-regression-spike/tree/protocol-freeze-v4).
- **Raw evidence.** Each gate's raw evidence is on [the `results` branch](https://github.com/digitalcourtney87/a11y-regression-spike/tree/results), with a manifest, checksums and the steps to verify and rescore it. The bundles contain no NVDA binaries.
- **Rescoring.** The scorer refuses the test split unless the frozen files match the hash in the latest freeze tag. Later calibration work changed frozen files on `main`, so rescore from a checkout of `protocol-freeze-v4`.

## How the study ran

The study ran in milestones from 2 to 12 October 2026, with its gate reports and briefs in [`docs/gates/`](docs/gates/). Every path that can change a verdict is listed in [`protocol/frozen-paths.txt`](protocol/frozen-paths.txt) and hashed (`npm run protocol:hash`), and the freeze tag records that hash. The test split was not executed or scored before the freeze.

Two later studies, M8 and M9, calibrated parts of the instruments. They did not rescore the 77-pattern results. See [the M8 calibration report](docs/reports/M8-calibration.md) and [the M9 registered evaluation](docs/reports/M9-registered-evaluation.md).

Phase 0 is complete, and no further runs are authorised. Whether to continue to a further phase has not been decided.

## What's in this repository

| Path | What it holds |
|---|---|
| [`docs/findings.md`](docs/findings.md) | The plain-language write-up |
| [`protocol/`](protocol/) | The confirmatory protocol, oracles, triggers, amendments and the frozen-path list |
| [`corpus/`](corpus/) | Regression patterns, harmless twins and unchanged controls, as items and patches, with the dev and test split |
| [`journeys/`](journeys/) | The scripted user journeys that reach each state |
| [`fixtures/`](fixtures/) | Vendored copies of the two open-source demo apps, reproductions from open-source bug histories, canaries and calibration controls |
| [`harness/`](harness/) | The TypeScript runner, collectors, oracles and scorer, plus repository policy tests |
| [`listener/`](listener/) | The C# listener that records Windows accessibility events from Chrome |
| [`env/`](env/) | The pinned environment lock |
| [`docs/gates/`](docs/gates/) | Gate reports and their one-page briefs |
| [`docs/reports/`](docs/reports/) | Milestone reports |
| [`docs/research/`](docs/research/) | Desk research, mining ledgers and retained evidence |
| [`docs/plans/`](docs/plans/) | Plans and proposals |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | The decision log |
| [`docs/LAB_NOTEBOOK.md`](docs/LAB_NOTEBOOK.md) | Exploratory observations |
| [`docs/PRD-v0.3-technical-extract.md`](docs/PRD-v0.3-technical-extract.md) | The technical extract of the requirements the study was built to (the full document is private) |
| [`HANDOFF.md`](HANDOFF.md) and [`CLAUDE.md`](CLAUDE.md) | The working brief and standing rules for the coding agents that built and ran the harness |

## Development

Requires Node 24.21.0 (see `.nvmrc`). Screen-reader runs happen only on GitHub-hosted Windows runners.

```bash
npm ci
npm run lint
npm run typecheck
npm test
```

**Security note:** the Guidepup NVDA build hosts NVDA's Remote Access relay on all network interfaces, using a public password and a certificate whose private key is published. Anything that can reach port 6837 while NVDA runs could send it keystrokes. Run it only on ephemeral hosted runners, never on a developer machine on an untrusted network (DR-0009).

## Licence and credits

The harness is licensed under Apache-2.0 (see [LICENSE](LICENSE) and [NOTICE](NOTICE)). It contains no NVDA code and talks to NVDA only as a separate process. Any NVDA add-on code would live in `adapters/nvda-addon/`, under GPL-2.0-or-later.

This work rests on NVDA, Guidepup, axe-core, Playwright, Chrome for Testing and Scream, and the W3C ARIA-AT project's work on hosted runners was prior art. The [findings](docs/findings.md#credits) credit each one.

## Contact

To report a problem with the analysis or the code, [open an issue](https://github.com/digitalcourtney87/a11y-regression-spike/issues). If an accessibility regression has reached production on your team's consumer journeys, such as checkout, booking or banking, Courtney would like to hear about it: [hello@courtneyallen.co.uk](mailto:hello@courtneyallen.co.uk).

*Independent research by Courtney Allen.*
