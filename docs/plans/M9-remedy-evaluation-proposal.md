# Proposed M9: registered evaluation of cursor identity and focus-name reads

Status: proposed by Claude, P42, not approved (DR-0119). Nothing is implemented, registered or dispatched. M8 is closed (DR-0118); this follows the next step named in [the recovery report](../reports/M8-working-recovery.md). The documented milestones end at M7; as with M8, this scopes a possible next task, not a product milestone.

## Objective

Decide, on fresh owned controls whose answers are registered before execution, whether two harness changes are justified for future registered studies:

1. **Simulated-cursor identity and ignored ancestry.** A corrected cursor model, v2, beside the unchanged v1.
2. **Focused-node name reads.** Whether any focus reader should change. The default, given the evidence below, is no change.

The 77-pattern M7 result, its exposed cases and `protocol-freeze-v4` stay fixed. No outcome in this evaluation rescores, repairs or reinterprets an M7 verdict or rate.

## Evidence that motivates it

**Cursor stall, proved on owned data.** In the M8 feedback controls, BROWSE_NEXT in the NVDA-absent leg reached Alpha, then read the list bullet `• ` seven times. The [replay](../research/m8-calibration-evidence/cursor-replay.json) reproduces this from the [captured tree](../research/m8-calibration-evidence/owned-feedback-ax.json) with the unchanged helpers. The two causes are independent:

- *Identity.* The cursor stores only a DOM backend id. The bullet's text node has none, so the position stays on Alpha and the next step finds the same bullet.
- *Ignored ancestry.* Line grouping walks parents through the flattened tree, which omits ignored nodes. The bullet's parent is an ignored node (backend 21) inside the Alpha option. The walk stops there, so the bullet becomes its own line instead of joining Alpha's.

Fixing ancestry alone would end this stall. Generated text outside any line container would still stall through identity, so v2 addresses both.

**Focus-name: the readers agree with NVDA.** A new read-only check of the archived P41 blocks ([derivation](../research/m9-proposal-evidence/derive-vuetify-focus-speech.py), [result](../research/m9-proposal-evidence/vuetify-focus-speech.json)) narrows the Vuetify finding. On the first Tab into `input-0`, the following held in all three present-leg repetitions:

- NVDA spoke "main landmark" and "edit blank", with no name.
- MSAA read an unnamed editable field.

In the absent leg, the partial-tree read was unnamed in all three repetitions. The DOM reported two "Select an item" labels at every one of those points. The full tree names the same field only at step end, after focus has left it. This could be a name that depends on focus, or a name that arrives late; neither cause is established, and the Vuetify fixture is not run again. Either way, the focus-time readers report what a real NVDA user heard. A reader change that recovered the later name would make the NVDA-absent leg diverge from NVDA. The Vuetify goal is therefore best read as a journey-goal limit, like date-picker #5428's, not as a reader defect.

## Approaches considered

| | Approach | Cost | Verdict |
|---|---|---|---|
| A | Develop v2 offline on M8 owned data. Register fresh owned controls first. Validate in one bounded dispatch. | One dispatch, two jobs, up to 120 runner-minutes | **Recommended.** Independent validation at small cost |
| B | Offline only: implement v2 and replay captured owned trees | No runner time | v2 would be checked only on the data that exposed the stall. No validation, and no evidence on the focus readers under other naming patterns |
| C | A plus fresh, never-exposed third-party working releases | New mining plus more jobs | Premature until owned controls validate the mechanism |

## Design (approach A)

### Stage 1: register before building

Write the fresh owned controls and their known answers in a criteria document, and commit both before v2 exists. Record the fixture and criteria hashes. Nothing on the fresh controls is executed before the dispatch, locally or in CI. After first execution, any change to a control, prediction or rule needs a new registration with new controls. The M8 controls and captured trees are development data only.

Each cursor journey starts with DOCUMENT_TOP and then uses repeated BROWSE_NEXT with a declared maximum. Each focus journey uses one TAB goal with `maxAttempts: 1` and the M8 controls' 1000 ms observation window, so focus stays on the field for the end read. All markup is owned and de-branded.

| Control | Page | Registered prediction |
|---|---|---|
| C1 marker list | Ordered list of plain list items with numbered markers, then a target paragraph | NVDA reaches the target. v2 reaches it with no repeated position. v1 stalls at a marker, as the positive control for the mechanism |
| C2 generated text | CSS `::before` text in a generic container outside any line container, then a target paragraph | NVDA and v2 reach the target. v1 behaviour is recorded but not predicted |
| C3 ignored wrappers | Paragraph text nested inside `role="none"` and `role="presentation"` wrappers, then a target | NVDA, v1 and v2 reach the target. v2's attempt count is at most v1's |
| C4 no change | Headings, paragraphs and buttons with no ignored ancestry or generated text, then BROWSE_NEXT past the end | v1 and v2 produce identical line sequences. Both stay on the last line at the end (DR-0085) |
| F1 static label | Labelled input | Every focus-time reader and NVDA's focus speech give the name |
| F2 focus-hidden label | The visible label is hidden on focus while an `aria-hidden` copy shows | Every focus-time reader is unnamed, and NVDA's focus speech has no name |
| F3 delayed label | The label is associated 1100 ms after focus | Early reads are unnamed. End reads are named; P40 timings put both legs' end reads after 1100 ms. Whether NVDA announces the name change is recorded, not predicted |
| F4 unnamed wrapper | Unnamed `role="textbox"` wrapper around a labelled input | The readers return the input with its own name. NVDA speaks that name |

### Stage 2: implement v2 offline

- **Change.** v2 groups lines by walking ancestry through the full pruned tree, ignored nodes included, while keeping document order from the flattened tree. Its cursor position has a stable identity: the AX node id, plus, for nodes without a DOM backend, the nearest DOM-backed ancestor and an ordinal.
- **Selection.** v1 stays the default and its code path is untouched. v2 runs only when the calibration manifest selects it, and the existing guard keeps refusing the test split, candidates and item ids.
- **Development acceptance.** Replaying the M8 tree under v2 reaches Chosen Alpha, and all existing tests still pass.

### Stage 3: one validation dispatch

- **Absent leg:** C1–C4 under v1 and then under v2, in a fixed disclosed order, plus F1–F4.
- **Present leg:** all eight controls, with NVDA as the reference.
- **Repetitions and checks:** three base-only repetitions each, with bracketing K1 checks.
- **Observations:**
  - The approved early/late diagnostics are reused.
  - One read-only addition in calibration mode: at each focus goal check, in both legs, the full-tree name for the focused backend id at the same instant.

The added reads may shift sampling times; they are reported as such and never change a step outcome.

### Decision rules, declared now

1. **Cursor v2** is accepted for future registered studies only if all of the following hold:
   - In 3/3 repetitions on C1–C3, it reaches each target within the registered maximum and never repeats a position before the last line.
   - It matches v1 exactly on C4.
   - NVDA reaches every target in 3/3; otherwise that control is reported as invalid, not replaced.

   If v1 does not stall on C1, report that the positive control was not reproduced. This is not a v2 failure, but it limits the claim.
2. **Focus readers** stay unchanged if, on every F control in 3/3 repetitions, the early absent and MSAA reads agree with NVDA's focus speech on whether a name is present. If the partial read disagrees while the same-instant full-tree read agrees, a reader change goes to a later registration. A disagreement by MSAA is reported only.
3. Every failure, invalid control and missing comparison is retained. There is no tuning after results, no retry and no second dispatch.

## Boundaries

- **Budget.** One dispatch with two standard Windows jobs, one per leg, each capped at 60 minutes, so 120 runner-minutes at most. For scale, the P40 and P41 jobs ran 6–13 minutes each.
- **Unchanged environment.** The pinned environment, read-only workflow permissions, no secrets, standard runners and the receive-only relay stay as they are. NVDA's internal mode remains unobserved.
- **Labels and workflows.** Every block is EXPLORATORY. A new disabled-by-default workflow with its own request is retired after use, like P40 and P41.
- **Model effort.** Tens of thousands of output tokens for registration, implementation and report, single-agent, plus one independent gate review. This is a planning estimate, not billing.
- **Frozen paths.** `harness/src` changes add to the frozen-path drift since `protocol-freeze-v4` (the protocol hash on main already differs after M8). The v4 tag remains the only scoring reference for M7.
- **Not covered.** No third-party fixture is executed, locally or in CI. No old-test rescore, new freeze, corpus change, oracle or trigger edit, or Phase 1 commitment. The Phase 1 decision stays 27 November 2026.

## Owner decisions

| # | Yes/no decision | Recommendation |
|---|---|---|
| 1 | Approve P42 as scoped: register the fresh owned controls first, implement cursor v2 offline beside v1, then one dispatch of two Windows jobs (60 minutes each, 120 runner-minutes, no retry)? | Yes. This changes what is measured and sets a new budget, so hard rule 12 applies |
| 2 | Add the same-instant full-tree focus-name read, in calibration mode only? | Yes. It is the one new observation, and it is needed for decision rule 2 |
| 3 | Treat the Vuetify unnamed-focus result as a journey-goal limit, not a reader defect, unless the validation shows reader–NVDA disagreement? | Yes. The focus-time reads in both legs (6/6) agree with NVDA's focus speech (3/3) |
