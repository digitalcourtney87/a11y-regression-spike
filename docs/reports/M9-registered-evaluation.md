# M9 registered evaluation: cursor identity and focus-name reads

Status: the authorised P42/DR-0120 run is complete; owner gate acceptance is pending. PR20 merged the registration through the retirement (`cfa43b3`) before these results existed, so they follow in a separate gate PR. All evidence is EXPLORATORY. No M7 verdict, detection rate, corpus, oracle, trigger or `protocol-freeze-v4` change. Registered criteria: [2026-10-12-m9-registered-criteria.md](../plans/2026-10-12-m9-registered-criteria.md). Proposal: [M9-remedy-evaluation-proposal.md](../plans/M9-remedy-evaluation-proposal.md).

## Result

Both registered decision rules resolve, and every registered prediction holds in 3/3 repetitions.

- **Rule 1: cursor v2 is accepted for future registered studies.** It reached every C1–C3 target with no repeated position. It matched v1 line for line on C4. NVDA reached every target. v1's C1 stall, the positive control, was reproduced.
- **Rule 2: the focus readers stay unchanged.** On all four F controls, the early absent and MSAA reads agree with NVDA's focus speech on whether a name is present. So do the new same-instant full-tree reads.

The evidence also has limits, set out below. C3 did not exercise the mechanism it was built for. The model's lines are still not NVDA's lines.

## Execution and integrity

- **Run.** [Run 38315343825](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38315343825) ran once at `69760a0`. That was after the registration (`ac21ec8`), the implementation (`b750282`, with ordinary CI 38315076817 passing) and the analysis script (`f545d29`). Exactly two standard Windows jobs ran, each capped at 60 minutes, and both succeeded.
- **Blocks.** Twenty blocks, all EXPLORATORY and VALID, from 60 base-only attempts. That is 12 blocks in the absent leg (v1 cursor, v2 cursor and focus cases) and 8 in the present leg. All 40 K1 brackets pass and all five manifests validate.
- **Errors and omissions.** There are no package, attempt, diagnostic-read or full-tree-read errors. No step was omitted.
- **Labels.** Each raw summary carries its own `P42/DR-0120` label, cursor model and full-tree flag; none inherits P40's label.
- **Environment.** Image 20260925.250.1, Chrome 153.0.8010.12, Node 24.21.0, Playwright 1.63.0, and NVDA 2026.2 in the present leg. The listener was built from source unchanged since P41.
- **Retirement.** The workflow is retired in source (`3b2cf9e`; its budget test failed before the guard changed and passed after). It is now `disabled_manually` in GitHub, alongside P40 and P41.

Evidence: [audit](../research/m9-evaluation-evidence/evidence-audit.json) and [its derivation](../research/m9-evaluation-evidence/derive-audit.py); [registered results](../research/m9-evaluation-evidence/registered-results.json) from the [pre-committed analysis](../research/m9-evaluation-evidence/derive-registered-results.py); [workflow metadata](../research/m9-evaluation-evidence/workflow-run.json).

## Cursor controls

Attempt counts were identical in all three repetitions.

| Control | v1 (absent) | v2 (absent) | NVDA (present) | What it exercised |
|---|---|---|---|---|
| C1 marker list | Stalls on "1. " for all 15 attempts; UNREACHABLE | REACHED in 6; each marker joins its option's line | REACHED in 2; NVDA read the listbox as one line, so it never visited the options | v1's stall needs both causes: a marker with no backend under an ignored node. v2 cleared it through ignored ancestry alone, because every v2 stop landed on a node with a backend. So C1 does not test identity |
| C2 generated text | Stalls on "Note: " for all 10 attempts; UNREACHABLE (recorded, not predicted) | REACHED in 4 | REACHED in 2 | Identity only. The `::before` text has no backend and no line container |
| C3 ignored wrappers | REACHED in 3 | REACHED in 3 | REACHED in 2 | **Neither.** Chrome omits the `role="none"`/`presentation` spans, so the text sits directly under the paragraph. The ≤ prediction held only with equal counts |
| C4 no change | REACHED in 5; past the end, stays on the final line | Identical lines; stays | REACHED in 4; past the end, NVDA re-spoke "Plain final line." (recorded) | Non-regression |

Each correction is therefore validated on one fresh control:

- **Ignored ancestry:** C1, plus the M8 development tree.
- **Identity:** C2 only, plus synthetic unit tests.

**C1 deviation.** C1's page differs from the approved proposal. The proposal described plain list items. The registration, before any execution, used an ordered `listbox` of `option` items, because that structure puts the CSS marker under an ignored node, which is what v1's stall requires. The M8 tree shows the same structure. This choice made C1 a deliberate positive control for the known mechanism. It was not a blind test of an arbitrary list.

**Fidelity limit.** v2 fixes the stall; it does not reproduce NVDA's line segmentation. NVDA read "Note: Check the second panel before continuing." and "Route stops list North gate" as single lines, where v2 splits them. NVDA's DOCUMENT_TOP also speaks the first line, while the simulated DOCUMENT_TOP reads nothing. So attempt counts differ between legs (2 against 6 on C1). The harness compares path counts only within a leg (PATH_CHANGED), so these differences do not touch either decision rule. They do rule out any claim of line-level fidelity to NVDA.

## Focus controls

The table shows the early reads in each leg, the full-tree reads and NVDA's focus speech, identical in every repetition.

| Control | Early absent read, MSAA, full-tree | NVDA focus speech | End reads | Prediction |
|---|---|---|---|---|
| F1 static label | Delivery note | "main landmark", "Delivery note edit blank" | Named | Holds |
| F2 focus-hidden label | Unnamed | "main landmark", "edit blank" | Unnamed (focus stays on the field) | Holds |
| F3 delayed label | Unnamed | "main landmark", "edit blank"; later "Account reference" at 1134–1139 ms | Named | Holds |
| F4 unnamed wrapper | Item name | "main landmark", "Item name edit blank" | Named | Holds |

- **F3 timings.** QPC times from the Tab request: the early diagnostic at 316–324 ms (absent) and 912–919 ms (present); the end diagnostic at 1324–1335 ms and 1925–1938 ms. The 1100 ms association falls between them, as registered. NVDA announced the name 1134–1139 ms after the Tab request. The label is linked 1100 ms after focus, so this is at most 35–39 ms after the link. That announcement was recorded, not predicted.
- **F2 and Vuetify.** Owned markup reproduces the Vuetify 3.3.6 signature exactly: "main landmark, edit blank", with every reader unnamed. The markup is two labels for the input, one `aria-hidden` and the resting one `visibility: hidden` while focused. That mechanism is therefore *sufficient* for the observed Vuetify symptom. Because the Vuetify fixture is not run again, it is not shown to be Vuetify's mechanism.
- **Reader accuracy.** Every focus-time reader reported what NVDA spoke. Under DR-0120 item 3, the Vuetify goal failure stays a journey-goal limit, like date-picker #5428, and no reader change follows.

## Interpretation and limits

- **Scope of acceptance.** Accepting v2 means it is the cursor model to register in any future study. It does not change, rescore or reinterpret M7, which was measured with v1 under `protocol-freeze-v4`. v1 remains the model that reproduces those results.
- **Sample.** The evidence is eight owned controls with three repetitions each, in one environment. Case order was fixed and not counterbalanced. The NVDA leg ran each cursor control once per repetition, under its own cursor.
- **Unobserved.** NVDA's internal mode remains unobserved. The full-tree read added a few milliseconds to each diagnostic point; it was a read only.
- **Analysis details.** The analysis script was committed before the run and is unchanged. Three of its details differ slightly from the criteria, and none changes a rule outcome:
  - Its F3 row also checks that NVDA's focus speech is unnamed, which is stricter than the registered prediction and holds.
  - Its positive-control test accepts any repeated line. The repeated line was checked by hand: it is the "1. " marker.
  - Its late-speech window ends at the end diagnostic rather than at step end. That affects recorded-only data.
- **Labels and frozen paths.** P42 pseudo-items keep the calibration runner's `m8-` id prefix. This branch adds files under frozen paths (harness, journeys, fixtures and workflows), so the protocol hash moves further from `protocol-freeze-v4`. The v4 tag remains the only scoring reference for M7.
- **Not shown.** C3 did not test ignored wrappers. A future registration wanting that coverage needs markup that Chrome keeps as ignored ancestors; C1's marker structure shows one such case. v2's ACTIVATE keeps v1's rule of acting on the last node with a backend. That was not exercised. The unit tests do not cover READ_CURRENT, the focus fallback or quick navigation from a position with no backend. As in v1, a position that resolves neither directly nor through focus restarts from the top of the document.

## Budget and archive

| Item | Value |
|---|---|
| Absent job | 9m38s |
| Present job | 7m11s |
| Summed for this dispatch | 16m49s, under the 120 runner-minute cap |
| M8 and M9 together | 50m29s across six jobs in three separately approved dispatches |
| Retries | None |
| Model effort | Tens of thousands of output tokens, single-agent. The one independent gate review used about 219,000 subagent tokens, input and output. These are estimates, not billing |

The job durations are administrative times, not billing or collector latency.

The complete raw archive has 40 files, 151,272 bytes compressed, and was verified file for file against its [manifest](../research/m9-evaluation-evidence/archive-manifest.json). Bundle SHA-256: `5a4fadb4bc7eb1db265413227afe5507cc6468e26a0313ff758d35a08236fb8d`. It contains no NVDA binaries. It is prepared locally for D6 publication on results after the owner accepts this gate.

## Next step

No further run, remedy, freeze or Phase 1 commitment is authorised. Owner decisions: [M9 gate brief](../gates/M9-brief.md). The Phase 1 decision remains on 27 November 2026.
