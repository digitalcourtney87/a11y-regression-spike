# Technical protocol extract — PRD v0.3

> Extract of PRD v0.3 (technical sections only), as amended by HANDOFF v1.1 and owner decisions of 2026-10-02. The full PRD is held privately by the owner; commercial content is not part of this repository.

**Date:** 2026-10-02
**Status:** EXPLORATORY. Everything in this extract is exploratory until the protocol freeze at M6 (HANDOFF §4 rule 5). The confirmatory protocol will be `protocol/PROTOCOL.md`, hashed and tagged at the freeze (HANDOFF §9, DR-0028). This file sits outside `protocol/` and is not covered by the freeze hash.
**Scope (DR-0014):** hypotheses, arms, verdict rules, taxonomy, canaries and thresholds. Commercial and product sections are excluded. The owner publishes a hash of the commercial protocol separately, outside this repository (DR-0014).

## Provenance convention

Every section opens with a **Sources** line. Within a section:

| Tag | Meaning |
|---|---|
| PRD §n | PRD v0.3, section n. Text marked *(verbatim)* or set as a quotation keeps the PRD's wording exactly. The PRD itself is not in this repository. |
| HANDOFF §n, Rn | `HANDOFF.md` section n, or review amendment Rn in HANDOFF §5. v1.0 wording unless marked v1.1; R8 onwards are new in v1.1, which incorporates the decision records cited here. |
| DR-xxxx | Decision record in `docs/DECISIONS.md` (titles in the table below). DR-0010 to DR-0022 record owner decisions D1 to D13. |
| Proposed by Claude (not yet owner-approved) | A gap Claude had to fill. It is not an owner decision and may change. |

Where sources are combined, the row or paragraph names each one. Where a later source amends an earlier one, the later source wins (HANDOFF v1.0 header: HANDOFF wins over the PRD; owner decisions of 2026-10-02 win over HANDOFF v1.0).

| Decision record | Title |
|---|---|
| DR-0006 | Runner images |
| DR-0010 | D1 Clock alignment |
| DR-0011 | D2 Speech capture (incl. PRD §48 AT Driver teardown) |
| DR-0012 | D3 Virtual audio |
| DR-0013 | D4 Canaries (incl. pre-registered K6a rule) |
| DR-0014 | D5 PRD publication |
| DR-0017 | D8 NVDA channel and voice |
| DR-0018 | D9 Arm B evidence |
| DR-0019 | D10 B2 scope and listener |
| DR-0020 | D11 Separate legs |
| DR-0021 | D12 Gates and validity |
| DR-0022 | D13 H2 scope |
| DR-0023 | M6 pre-registration: rule-model secondary analysis |
| DR-0024 | Smaller fixes (approved as proposed) |
| DR-0026 | Schema v1.1 additions |
| DR-0028 | Protocol freeze guard |
| DR-0029 | Desk research basis (2026-10-02) |

---

## 1. Hypotheses

**Sources:** HANDOFF §1 (verbatim); PRD §58 questions 1–4 (verbatim); DR-0022; DR-0011; DR-0023; HANDOFF v1.1 R10.

### 1.1 Hypotheses H1–H4 (HANDOFF §1, verbatim)

| ID | Hypothesis |
|---|---|
| H1 | DOM-mutation and platform-event observation (Arm B2) detects meaningful regressions that axe plus accessibility-tree testing (Arm B) misses. |
| H2 | Real NVDA (Arm C) adds detections beyond B2 and/or removes B2 false FAILs, under defined combination rules. |
| H3 | A selective cascade (Arm D) retains most of C's valid detections at materially lower runtime. |
| H4 | NVDA execution reaches CI-grade reliability (known-answer success, INCONCLUSIVE and false-FAIL rates) and acceptable latency. |

Phase 0 asks a narrower question first (HANDOFF §1, verbatim): **can each instrument measure what the comparison needs?** If not, the comparison is meaningless and the spike stops cheaply.

### 1.2 Technical questions behind H1–H4 (PRD §58, verbatim)

PRD §58 frames the falsification protocol around these technical questions:

1. What does DOM/event observation detect beyond axe and accessibility-tree testing?
2. What does real NVDA detect beyond those event signals?
3. How much of that additional detection can a selective cascade retain?
4. Can the resulting system reach CI-grade reliability without excessive maintenance or latency?

The remaining PRD §58 questions are outside this repository's scope. Mapping (combined from HANDOFF §1 and PRD §58): question 1 → H1, 2 → H2, 3 → H3, 4 → H4.

### 1.3 H2 scope note (DR-0022)

- H2 is measured on **what NVDA queues to speak plus global cancels**, not on audio.
- ANNOUNCEMENT_INTERRUPTED and ANNOUNCEMENT_ORDER_BROKEN are excluded from the primary analysis unless the DR-0011 add-on rule brings them in (§4.4).
- Documented bias: **queued-then-cancelled text counts as spoken.** HANDOFF v1.1 R10 adds that cancellations NVDA makes inside its speech manager never reach the relay.

Speech evidence comes from a receive-only relay tap on NVDA's Remote Access relay, with NVDA's DEBUG log copied after every NVDA run as a second record and message-count parity reported between the two (DR-0011). No AT Driver runs take place in Phase 0 (DR-0011).

### 1.4 Planned secondary analysis (DR-0023)

To be pre-registered at M6: a secondary analysis of how much of C's verdicts a rule model, fitted to B2 evidence on the dev split, predicts on the test split.

---

## 2. Arms

**Sources:** PRD §33 and §34 (verbatim); HANDOFF R3 (verbatim), §8.4, §10.2; HANDOFF v1.1 R3, R8; DR-0018; DR-0019; DR-0020; DR-0011; DR-0006; DR-0024.

### 2.1 Arm definitions (PRD §33, verbatim)

> **Arm A.** axe at every relevant journey state.
>
> **Arm B.** A + accessibility-tree / ARIA snapshot testing.
>
> **Arm B2.** B + DOM mutation timeline + platform accessibility-event trace.
>
> Investigate:
>
> - Windows UI Automation events.
> - Focus events.
> - Name-change events.
> - Live-region events.
> - Relevant browser accessibility events.
>
> Optionally evaluate simulated screen-reader output if it proves technically credible.
>
> **Arm C.** B2 + real NVDA execution.
>
> **Arm D.** Production-style selective cascade.
>
> Run A/B/B2 broadly.
>
> Invoke NVDA only when trigger rules determine it is warranted.

Transcription note: the `+` operators in Arms B, B2 and C were lost when the PRD was transferred and were restored to match HANDOFF §1 ("axe plus accessibility-tree testing").

### 2.2 Phase 0 evidence per arm

Combined from the sources named in each row. DR-0019 amends PRD §33's B2 "Investigate" list: WinEvents are the primary channel and UIA events are diagnostic only.

| Arm | Evidence in Phase 0 | Leg | Sources |
|---|---|---|---|
| A | axe at each relevant journey state. axe runs in its own browser context, never near an AT segment (its Playwright helper opens a new tab and steals focus). | NVDA-absent | PRD §33; DR-0018; DR-0024 |
| B | A, plus Chrome's accessibility tree via CDP `Accessibility.getFullAXTree` (including live, atomic, relevant and busy), plus `ariaSnapshot` for structure. | NVDA-absent | PRD §33; DR-0018 |
| B2 | B, plus the DOM mutation timeline (HANDOFF §8.3), plus platform events from a C# listener on .NET 10. WinEvents are primary: MSAA and IA2 event IDs, plus `EVENT_SYSTEM_ALERT`, `EVENT_SYSTEM_FOREGROUND` and `EVENT_OBJECT_DESCRIPTIONCHANGE`. Identity is resolved through MSAA and UIA property reads (AutomationId, LiveSetting, AriaRole); no IA2 QueryService and no proxy registration. UIA events are diagnostic only. | NVDA-absent | PRD §33; HANDOFF §8.3; DR-0019; DR-0024 |
| C | B2, plus real NVDA (Guidepup 0.35.0 for provisioning, lifecycle and input only, started with `capture:false`). Speech from the receive-only relay tap, attached before each segment; NVDA DEBUG log as a second record. Scored under UNION and ADJUDICATED (§2.3). | B2 evidence from the NVDA-absent leg; NVDA evidence from the NVDA-present leg (§2.4; the split for C is Proposed by Claude, not yet owner-approved; see §8) | PRD §33; HANDOFF R3, v1.1 R8; DR-0011; DR-0020 |
| D | Triggers applied to the NVDA-absent B2 evidence; NVDA evidence taken from the NVDA-present leg for triggered steps only. Trigger rules v1 are fixed in advance from PRD §14 (HANDOFF R5) in `protocol/triggers.v1.json`. Runtime is estimated from the durations of triggered NVDA segments (HANDOFF §8.4). Scored under UNION and ADJUDICATED. | Both, as stated | PRD §33; HANDOFF R3, R5, §8.4; DR-0020 |

Common to every arm:

- Chrome's accessibility mode is locked with `--force-renderer-accessibility=screen-reader` in every arm, and logged; `chromiumSandbox: true` (DR-0019).
- The handover checks the real foreground window (`GetForegroundWindow`) and platform focus, not page focus events, because Playwright always enables CDP focus emulation (DR-0024).
- Paired legs run within one dispatch so they share a runner image version; gates run on `windows-2025` (DR-0006).

### 2.3 Combination rules (HANDOFF R3, verbatim)

> C and D are each scored under **UNION** (FAIL if B2 or NVDA evidence FAILs) and **ADJUDICATED** (NVDA may downgrade a B2 FAIL to REVIEW when NVDA output is unchanged between base and candidate).

This gives seven scored arms (HANDOFF §10.2 `Arm`): A, B, B2, C_UNION, C_ADJUDICATED, D_UNION, D_ADJUDICATED. Under DR-0022, "NVDA output" means queued speech plus global cancels (§1.3).

### 2.4 Separate legs (DR-0020)

| Leg | NVDA | Arms it produces | Note |
|---|---|---|---|
| NVDA-absent | Not running | A, B, B2 | "A, B and B2 run without NVDA, as the product would" (owner, DR-0020). |
| NVDA-present | Running | C (NVDA evidence); D (NVDA evidence on triggered steps) | "C runs with NVDA" (owner, DR-0020). |

- D applies triggers to the NVDA-absent B2 evidence and takes NVDA evidence from the NVDA-present leg (owner, DR-0020).
- The invariance test in HANDOFF v1.0 §8.4 is dropped. The NVDA on/off B2 comparison becomes a 20-run diagnostic, not a G2 criterion (owner, DR-0020).
- C_UNION and C_ADJUDICATED combine NVDA-absent B2 evidence with NVDA-present NVDA evidence (HANDOFF v1.1 R3, R8). This is how HANDOFF v1.1 reads DR-0020, where B2 runs without NVDA; the owner's wording names both legs explicitly only for D. It also means D versus C differs only by trigger masking.
- **Proposed by Claude (not yet owner-approved):** evidence is matched across legs by item, side and repetition index (HANDOFF v1.1 R8). B2 evidence recorded in the NVDA-present leg is used only for the 20-run diagnostic.

### 2.5 Primary comparisons (PRD §34, verbatim)

| Comparison | Question |
|---|---|
| B2 versus B | How much does temporal/event observation add? |
| C versus B2 | What does real NVDA uniquely add? |
| D versus C | How much runtime and operational complexity does selective AT execution save, and what regressions does it miss? |

> C versus B2 is the headline capability comparison.
>
> D versus C is the headline product-architecture comparison.

---

## 3. Verdict rules

**Sources:** PRD §18, §19, §20, §22 (verbatim); HANDOFF §4 rules 7 and 11, §6, §7.4, R7 (verbatim where marked); HANDOFF v1.1 R9, §7.3, §7.4; DR-0021; DR-0010; DR-0012; DR-0017; DR-0022; DR-0026.

### 3.1 Verdicts (PRD §18 definitions, verbatim)

| Verdict | PRD §18 definition *(verbatim)* | Spike rules (source) |
|---|---|---|
| PASS | Defined expected behaviour observed. | — |
| FAIL | Repeatable evidence demonstrates a defined accessibility regression. | FAIL is scored only on the symptoms in §4.2, with their objective definitions (HANDOFF R2, §6). |
| REVIEW | Potentially meaningful behaviour changed but requires human judgement. REVIEW is non-blocking. | REVIEW is not detection (PRD §22; HANDOFF §6). |
| INCONCLUSIVE | The testing environment or captured evidence cannot reliably determine an outcome. INCONCLUSIVE is non-blocking. | Decided only by pre-outcome checks (§3.6, DR-0021). Counts as a miss (§3.8, HANDOFF R7). Gate runs use retries off (DR-0021). |

HANDOFF §6 (verbatim): PASS · FAIL · REVIEW (non-blocking; needs human judgement) · INCONCLUSIVE (environment or evidence cannot determine an outcome).

PRD §18 also describes how the envisaged product routes REVIEW findings and retries INCONCLUSIVE jobs. Those behaviours are not part of the spike protocol and are omitted here.

Never hand-edit verdicts: INCONCLUSIVE is never converted to PASS or FAIL manually (HANDOFF §4 rule 7, verbatim).

### 3.2 Known-answer checks (PRD §19, verbatim)

> Every real-AT job begins with a known-answer test.
>
> The runner deliberately triggers behaviour whose expected AT response is known.
>
> For example:
>
> - A known live-region announcement.
>
> If expected output cannot be captured, subsequent absence claims are invalid.
>
> The job becomes:
>
> ```text
> INCONCLUSIVE
> ```
>
> rather than:
>
> ```text
> FAIL.
> ```

In the spike, known-answer canaries bracket every item block (HANDOFF §7.4), and a failed pre-canary is a pre-outcome INCONCLUSIVE check (DR-0021). The canaries are defined in §5.

### 3.3 Absence claims (PRD §20, verbatim)

> Claims such as:
>
> > “Expected announcement removed”
>
> require stronger evidence than detecting unexpected output.
>
> FAIL requires:
>
> - Successful known-answer check.
> - Expected behaviour repeatedly present in baseline runs.
> - Expected behaviour repeatedly absent from candidate runs.
> - No evidence that capture failure explains the absence.
>
> Where possible, the runner should determine whether speech occurred but was immediately interrupted or cancelled.
>
> If evidence remains ambiguous:
>
> - REVIEW or INCONCLUSIVE.

**Proposed by Claude (not yet owner-approved):** DR-0021 allows INCONCLUSIVE only from checks completed before the outcome is known. Ambiguity in the outcome evidence therefore routes to REVIEW, not INCONCLUSIVE, in the spike.

### 3.4 Detection definition (PRD §22, verbatim)

> For the falsification spike:
>
> Detection means:
>
> > A seeded or known regression produces a FAIL attributed to the correct regression category.
>
> REVIEW does not count as successful detection in the primary analysis.
>
> This definition must be frozen before results are collected.

### 3.5 Detection, false FAIL and repetitions (HANDOFF §6, verbatim)

- **Detection (primary analysis):** a regression item produces FAIL with the correct **symptom**. REVIEW is not detection. INCONCLUSIVE is a miss.
- **False FAIL:** a benign or unchanged item produces FAIL with any symptom.
- The protocol fixes the repetition parameters k and n. Exploratory defaults: n = 3 per side, n = 5 for absence-based symptoms, k = n.

### 3.6 INCONCLUSIVE only from pre-outcome checks (DR-0021)

Owner rule (DR-0021): INCONCLUSIVE is decided only by checks completed before the outcome is known (foreground HWND, injection marker, audio, clock, pre-canary), never by inspecting the outcome.

The D1 clock conditions, as the owner listed them (DR-0010): INCONCLUSIVE only for

- native self-test disagreement > 0.5 ms;
- page-mapping uncertainty > 2 ms;
- drift > 1 ms within a segment;
- low-resolution TimeTicks;
- rAF gap > 100 ms.

The full set of pre-outcome checks (HANDOFF v1.1 R9), with the reason codes the harness emits (`harness/src/runner/validity.ts`, DR-0026). A value strictly greater than its limit is INCONCLUSIVE; a value equal to the limit passes.

| Check | INCONCLUSIVE when | Legs | Reason code | Source |
|---|---|---|---|---|
| Foreground window | Browser window is not the verified foreground HWND, or platform focus is not on the declared anchor, at handover | Both | `FOREGROUND_HWND` | DR-0021; HANDOFF §7.2; DR-0024 |
| Pre-canary | Pre-block known-answer canary fails | Both | `PRE_CANARY` | DR-0021; PRD §19 |
| Environment manifest | Manifest missing or invalid | Both | `MANIFEST_INVALID` | HANDOFF §4 rule 11 |
| Clock: native self-test | Disagreement > 0.5 ms between the orchestrator's and each native collector's QPC readings (method Proposed by Claude, not yet owner-approved; DR-0010) | Both | `CLOCK_NATIVE_SELF_TEST` | DR-0010; HANDOFF v1.1 §7.3 |
| Clock: page mapping | Uncertainty > 2 ms | Both | `CLOCK_PAGE_MAPPING` | DR-0010 |
| Clock: segment drift | Drift > 1 ms within a segment | Both | `CLOCK_SEGMENT_DRIFT` | DR-0010 |
| Clock: TimeTicks | TimeTicks is low-resolution | Both | `CLOCK_LOW_RES_TIMETICKS` | DR-0010 |
| Clock: rAF gap | Gap > 100 ms | Both | `CLOCK_RAF_GAP` | DR-0010 |
| NVDA injection | `nvdaHelperRemote*.dll` not loaded in `chrome.exe`, or no "Buffer load took" line in the NVDA log | NVDA-present | `NVDA_INJECTION_MARKER` | DR-0017 |
| Audio | No audio endpoint, or Audiosrv not running | NVDA-present | `AUDIO` | DR-0012 |
| Synth | Active synth is not the declared eSpeak NG configuration (any fallback) | NVDA-present | `SYNTH_FALLBACK` | DR-0017 |

Limiting the audio check to the NVDA-present leg is **Proposed by Claude (not yet owner-approved)**; DR-0012 states the check without naming a leg. A missing NVDA-present check counts as failed.

Clock basis (DR-0010): QPC is the only timebase (`process.hrtime.bigint()` in Node, `Stopwatch.GetTimestamp()` in C#), with one precise wall-clock anchor per process for human-readable times only. Page time is mapped to QPC through CDP `Performance.getMetrics` (Timestamp, NavigationStart), verified once in M1a against a 16-ping minimum-RTT estimate and recomputed after every full navigation. The `document.title` marker is removed entirely; logs are joined by QPC and orchestrator-issued segment IDs. This replaces the HANDOFF v1.0 §7.3 title pulse and its 20 ms skew rule. `maxClockSkewMs` in the evidence package is redefined as max(native self-test disagreement, page-mapping uncertainty) (DR-0010, DR-0026).

**Post-block canary, Proposed by Claude (not yet owner-approved):** HANDOFF v1.0 §7.4 made a whole block INCONCLUSIVE when its post-block canary failed. A post-block canary completes after the outcome is known, so it is not among the DR-0021 checks. HANDOFF v1.1 §7.4 therefore proposes that a failed post-block canary (`canaries.post`) is reported with the block but does not convert outcomes already observed, and the next block must pass its own pre-block canary. This matters from M4, when item blocks are first run.

### 3.7 Measurement basis for speech, and its bias (DR-0022)

- What counts as NVDA output is what NVDA **queues** to speak (relay tap utterances, with their priority NORMAL, NEXT or NOW) plus global cancels, not audio.
- Bias: queued-then-cancelled text counts as spoken. Results that depend on this must say so.
- HANDOFF v1.0 R4 tied interruption and queueing to timestamp and cancel visibility; DR-0022 (D13) supersedes this: both symptoms are excluded from the primary analysis unless the DR-0011 add-on rule brings them in (§4.4; HANDOFF v1.1 R4, R10).

### 3.8 Scoring hygiene (HANDOFF R7, verbatim)

> INCONCLUSIVE counts as a miss in the primary analysis, and the protocol sets a ceiling on the INCONCLUSIVE rate.

For G1 and G2 the ceiling is 5% of attempts (§6.1). The ceiling for the confirmatory analysis is set in `protocol/PROTOCOL.md` at the freeze (R7). The INCONCLUSIVE rate is reported per arm (HANDOFF §10.3).

---

## 4. Taxonomy

**Sources:** PRD §21 (verbatim); HANDOFF §6 (verbatim), R1, R2 (verbatim), R4, §10.2; DR-0022; DR-0011; DR-0013.

### 4.1 PRD categories (PRD §21, verbatim)

> FAIL should initially be restricted to defined categories.
>
> Examples:
>
> - Accessible name lost.
> - Required role lost.
> - Required state lost.
> - Expected announcement removed.
> - Focus fails to move.
> - Focus fails to return.
> - Required navigation strategy cannot reach target.
> - Keyboard trap introduced.
> - Journey becomes blocked.
> - Expected AT interaction fails.
>
> Potentially subjective issues become REVIEW.
>
> Examples:
>
> - Verbosity changes.
> - Announcement wording.
> - Questionable sequencing.
> - Unexpected but functional navigation.
> - Potentially confusing focus behaviour.

For scoring, the HANDOFF §6 symptoms below are the unit (HANDOFF R2; HANDOFF takes precedence over the PRD).

### 4.2 Symptoms and objective FAIL definitions (HANDOFF §6, verbatim; status column from DR-0022)

| Symptom | Objective FAIL definition (base versus candidate, same environment) | Primary analysis |
|---|---|---|
| NAME_NOT_CONVEYED | Expected accessible name present in base, absent in candidate | Scored |
| ROLE_NOT_CONVEYED | Expected role present in base, absent or changed in candidate | Scored |
| STATE_NOT_CONVEYED | Expected state (expanded, checked, selected, required, invalid…) conveyed in base, not in candidate | Scored |
| ANNOUNCEMENT_MISSING | Expected announcement present in at least k of n base runs and absent in at least k of n candidate runs, with canaries passed | Scored |
| ANNOUNCEMENT_DUPLICATED | Same normalised announcement emitted at least twice within the observation window in candidate, once in base | Scored |
| ANNOUNCEMENT_ORDER_BROKEN | Journey declares an ordering expectation that holds in base and fails in candidate | Excluded (DR-0022), unless the add-on rule in §4.4 brings it in |
| ANNOUNCEMENT_INTERRUPTED | Expected announcement completes in base and is cancelled before modelled completion in candidate (only if R4 timing passes) | Excluded (DR-0022), unless the add-on rule in §4.4 brings it in |
| FOCUS_NOT_MOVED | Expected focus target reached in base, not in candidate | Scored |
| FOCUS_NOT_RESTORED | Focus returns to the invoking control in base, not in candidate | Scored |
| FOCUS_ESCAPES_DIALOG | Focus or virtual cursor stays within the modal in base, leaves it in candidate | Scored |
| KEYBOARD_TRAP | Candidate cannot leave a component by its documented keys; base can | Scored |
| NAV_TARGET_UNREACHABLE | Declared strategy reaches its target in base, UNREACHABLE in candidate | Scored |
| INTERACTION_FAILS_UNDER_AT | Declared AT interaction achieves its outcome in base, not in candidate (e.g. browse or focus-mode failure) | Scored |
| ROUTE_CHANGE_SILENT | Route change conveyed (focus or announcement) in base, nothing conveyed in candidate | Scored |
| JOURNEY_BLOCKED | Journey completes in base, cannot complete in candidate | Scored |

### 4.3 Symptoms versus mechanisms (HANDOFF R2, verbatim)

> Detection is scored on user-facing **symptoms** with objective FAIL definitions (§6). Mechanisms (e.g. "live region inserted pre-populated") are diagnostic metadata, never the scoring unit. Duplicates, ordering and interruption either get objective definitions or are analysed separately as REVIEW-routing accuracy.

In the data contract, a regression item's `expected` is `{ kind: "regression"; symptom; mechanism }`, where the mechanism is metadata only (HANDOFF §10.2).

### 4.4 Exclusions and the add-on rule (DR-0022, DR-0011)

- ANNOUNCEMENT_INTERRUPTED and ANNOUNCEMENT_ORDER_BROKEN are excluded from the primary analysis (DR-0022).
- They can return only through the GPL add-on rule (DR-0011): an add-on is proposed only if K7 shows drops or interruptions that the relay tap and the NVDA debug log cannot classify, **and** interruption or ordering is still wanted in H2. Owner approval is required.
- The pre-registered K6a rule (§5.4) can remove the creation-time regression family from the M3 catalogue.

### 4.5 Benign changes and unchanged controls (HANDOFF R1, §10.2)

HANDOFF R1 (verbatim): "The corpus includes benign changes (refactors, copy edits, intentional accessibility improvements) at roughly 1:1 with regressions. False-FAIL rate is measured separately on benign items and on unchanged reruns."

Items carry `expected` of kind `regression`, `benign` (with a `benignType`) or `unchanged` (HANDOFF §10.2).

| BenignType (HANDOFF §10.2) | Working description — Proposed by Claude (not yet owner-approved) |
|---|---|
| WRAPPER_ELEMENT | A non-semantic wrapper element added or removed |
| CLASS_RENAME | Class names changed with no change to behaviour or semantics |
| CSS_ONLY | Styling-only change |
| COPY_EDIT | Visible text edited (an R1 example) |
| A11Y_IMPROVEMENT | Intentional accessibility improvement (an R1 example) |
| EQUIVALENT_REFACTOR | Refactor with equivalent accessible behaviour (an R1 example) |
| TIMING_WITHIN_TOLERANCE | Timing change within the declared tolerance |

The type names are fixed by HANDOFF §10.2; the descriptions must be settled before the freeze.

---

## 5. Canaries

**Sources:** HANDOFF §9.1 (verbatim where marked), §7.2, §7.4; DR-0013; DR-0010; DR-0021; DR-0022; DR-0024; DR-0029 (desk research, labelled where used).

### 5.1 General canary rules

| Rule | Source |
|---|---|
| K1–K5 are gating canaries. K6 and K7 are record-only at 20 runs each. | DR-0013 |
| "K6 and K7 are not pass/fail canaries. They test premises the corpus depends on." *(verbatim)* | HANDOFF §9.1 |
| Live regions carry an id but no accessible name. | DR-0013 |
| Fill delays are over 350 ms. K6e is the owner-specified exception: its sweep deliberately includes shorter delays. | DR-0013 |
| No keypress inside any observation window. | DR-0013 |
| K7 is triggered by a timer, not a key. | DR-0013 |
| K5 has no title dependency; no `document.title` marker exists. | DR-0013; DR-0010 |
| Latency is measured from the canary events themselves. | DR-0010 |
| The handover verifies the real foreground window and platform focus, not page focus events. | DR-0024; HANDOFF §7.2 |
| Known-answer canaries bracket every item block. | HANDOFF §7.4 |
| Gate runs use `windows-2025` with retries off. | DR-0021 |
| Fixtures live in `fixtures/canaries/`. | HANDOFF §9.1 |

### 5.2 Gating canaries K1–K5

HANDOFF §9.1 text, amended by DR-0013 where marked. The NVDA outcome is scored in G1 (NVDA-present leg); the B2 signature is scored in G2 (NVDA-absent leg).

| ID | Behaviour | Expected NVDA outcome | Expected B2 signature |
|---|---|---|---|
| K1 | Polite live region present and empty at load; text inserted 500 ms after activation | Utterance containing the text within 3 s | Text mutation inside the live region; live-region or text events |
| K2 | `role="alert"` content update | Utterance containing the text | `EVENT_OBJECT_LIVEREGIONCHANGED` plus IA2 `TEXT_INSERTED` on the alert, not `EVENT_SYSTEM_ALERT` (DR-0013; replaces v1.0 "As K1, assertive") |
| K3 | Programmatic focus moved to a named button | Name and role conveyed | `focusin`; focus WinEvent |
| K4 | Dialog opens with `aria-labelledby`; focus moves to its first control | Dialog name conveyed | Dialog inserted or shown; focus events |
| K5 | `pushState` route change; focus moves to `h1` (v1.0 also updated the title; no expected outcome or signature depends on it, DR-0013) | `h1` text conveyed | History event; focus events (no title event, DR-0013) |

The relay tap records each utterance's priority (DR-0011, DR-0026). Desk research expects NORMAL for K1 and NEXT for K2 (DR-0029). Priority is recorded for K1–K5 but is not part of their expected outcome.

### 5.3 Record-only canaries K6 and K7 (DR-0013)

Behaviour and expected NVDA outcome are the owner's (DR-0013). The B2 column gives the HANDOFF v1.0 §9.1 signature for the K6 or K7 family *(verbatim)*.

| ID | Behaviour | Expected NVDA outcome | Expected B2 signature (family) | Runs |
|---|---|---|---|---|
| K6a | Populated region inserted as `aria-live=polite`, as `role=status`, and as `aria-live=assertive` (three variants) | Silent | Insertion with non-empty content flagged | 20 per variant |
| K6b | Populated `role=alert` inserted | Announced at NOW priority | Insertion with non-empty content flagged | 20 |
| K6e (exploratory) | Region inserted empty, then filled after 0 ms, one rAF, 50, 100, 150, 250 and 500 ms | Not pre-declared; recorded per delay | Insertion, then text mutation; record per delay | 10 per delay (7 delays) |
| K7a | Timer-driven polite update, then programmatic focus to a button | Polite text, then the button, no cancel | Mutation followed by focus events | 20 |
| K7b | As K7a, but focus moves into a text input from browse mode | Cancel | Mutation followed by focus events | 20 |

Event-level expectations from desk research — **Proposed by Claude (not yet owner-approved)**; to be confirmed on the runner in M1a and M2 (DR-0029):

| ID | Expected platform events and notes (Chrome 154 and NVDA source reading) |
|---|---|
| K1 | IA2 `TEXT_INSERTED` on the live root; `EVENT_OBJECT_SHOW` on the new node; `EVENT_OBJECT_REORDER` and `EVENT_OBJECT_LIVEREGIONCHANGED` on the root. Whether the empty region is in the tree (event on root versus parent) is an open question. |
| K2 | `EVENT_OBJECT_LIVEREGIONCHANGED` plus IA2 `TEXT_REMOVED`/`TEXT_INSERTED` on the alert; no `EVENT_SYSTEM_ALERT`. Spoken without an "alert" prefix. |
| K3 | `EVENT_OBJECT_FOCUS` on the button. Chrome suppresses focus events when its window is not foreground. |
| K4 | `EVENT_OBJECT_SHOW` on the dialog, then `EVENT_OBJECT_FOCUS`. No `EVENT_SYSTEM_DIALOGSTART`. |
| K5 | No accessibility event for `pushState`; `EVENT_OBJECT_FOCUS` on the `h1`. |
| K6a | `EVENT_OBJECT_SHOW` on the region root; `EVENT_OBJECT_REORDER` and IA2 `TEXT_INSERTED` on the (non-live) parent; no `EVENT_OBJECT_LIVEREGIONCHANGED`. |
| K6b | `EVENT_SYSTEM_ALERT` on the inserted alert. |
| K6e | Chrome batches ordinary accessibility updates at most once per 150 ms after page load. A fill in the same batch as the insertion should look like K6a; a later fill should look like K1. |
| K7a, K7b | IA2 `TEXT_INSERTED` before `EVENT_OBJECT_FOCUS` within one update. K7b's browse-to-focus-mode switch makes NVDA cancel speech. |

UIA events seen for any canary are diagnostic only (DR-0019). Browser-UI events are told apart from page events by window class (`PlatformEvent.hwndClass`, DR-0026).

### 5.4 Pre-registered K6a rule (DR-0013, owner wording)

> If any K6a variant is announced in more than 1 of 20 runs, the creation-time regression family leaves the M3 catalogue.

- **Proposed by Claude (not yet owner-approved):** "creation-time regression family" is read as in DR-0013's "Creation-time regression family" row: mechanisms that rely on content present at region creation being silent. DR-0013 lists them: a conditionally rendered, populated toast or status message; unhiding a populated region with `display:none` or the `hidden` attribute; re-mounting or re-keying the region element on each update; filling a region within the same accessibility snapshot as its insertion; downgrading a conditionally rendered message from `role=alert` to `role=status`; switching `aria-live` from off to polite on an already-populated node. "Live region inserted pre-populated" (HANDOFF R2) is one such mechanism.
- **Proposed by Claude (not yet owner-approved):** "announced" means the region's text appears in NVDA's queued speech (relay tap) during the observation window, consistent with the DR-0022 measurement basis.

---

## 6. Thresholds

**Sources:** DR-0021 (owner wording where quoted); DR-0010; DR-0013; DR-0020; HANDOFF §6, §10.3. These replace the HANDOFF v1.0 §9 thresholds (98% and 90% bands for G1; 98% for G2).

### 6.1 Gates G1 and G2 (DR-0021)

| Gate | Rule (owner, DR-0021) |
|---|---|
| G1 | `windows-2025`, retries off, 50 valid runs per canary. Pooled K1–K5: at most 5 failures in 250, and no single canary with more than 3. |
| G2 | The same structure for B2 signature matches in the NVDA-absent leg. |
| Validity | INCONCLUSIVE ≤ 5% of attempts. |
| Reporting | Wilson intervals throughout; every Phase 0 result labelled exploratory. |

Implemented pass condition (`harness/src/runner/validity.ts`): a gate passes if and only if every canary in K1–K5 has at least 50 valid runs, pooled failures are at most 5, no single canary has more than 3 failures, and pooled (attempts − valid) / attempts is at most 0.05. Pooling the validity ratio across K1–K5 is **Proposed by Claude (not yet owner-approved)**; DR-0021 says "≤ 5% of attempts" without naming the unit.

Illustrative Wilson 95% intervals (z = 1.959964) at the gate boundaries. These are arithmetic, not thresholds:

| Observed | Lower | Upper |
|---|---|---|
| 250 of 250 | 0.9849 | 1.0000 |
| 245 of 250 (pooled limit) | 0.9540 | 0.9914 |
| 50 of 50 | 0.9287 | 1.0000 |
| 49 of 50 | 0.8950 | 0.9965 |
| 47 of 50 (single-canary limit) | 0.8378 | 0.9794 |

### 6.2 INCONCLUSIVE clock limits (DR-0010)

| Quantity | Limit | INCONCLUSIVE when |
|---|---|---|
| Native self-test disagreement | 0.5 ms | > 0.5 ms |
| Page-mapping uncertainty | 2 ms | > 2 ms |
| Drift within a segment | 1 ms | > 1 ms |
| rAF gap | 100 ms | > 100 ms |
| TimeTicks resolution | High resolution required | Low resolution |

The other pre-outcome checks are in §3.6.

### 6.3 Run counts

| Run set | Count | Source |
|---|---|---|
| G1: each of K1–K5, NVDA-present leg | 50 valid runs (250 pooled) | DR-0021 |
| G2: each of K1–K5, NVDA-absent leg | 50 valid runs (250 pooled) | DR-0021 |
| K6a | 20 runs per variant (3 variants) | DR-0013 |
| K6b, K7a, K7b | 20 runs each | DR-0013 |
| K6e | 10 runs per delay (7 delays) | DR-0013 |
| NVDA on/off B2 comparison | 20-run diagnostic | DR-0020 |
| Corpus items, per side | n = 3; n = 5 for absence-based symptoms; k = n (exploratory defaults; the protocol fixes k and n) | HANDOFF §6 |

---

## 7. Amendments to the source texts reflected here

| Source text | Amended by | Effect in this extract |
|---|---|---|
| HANDOFF v1.0 §7.3 title-pulse clock and 20 ms skew rule | DR-0010 | QPC timebase; D1 limits in §6.2; `maxClockSkewMs` redefined |
| HANDOFF v1.0 §8.4 invariance test | DR-0020 | Separate legs; 20-run NVDA on/off diagnostic |
| HANDOFF v1.0 §8.1 two-adapter evaluation | DR-0011 | Guidepup for lifecycle and input; relay tap for speech; no AT Driver runs in Phase 0 |
| HANDOFF v1.0 §8.2 UIA as a capture channel | DR-0019 | WinEvents primary; UIA diagnostic only |
| HANDOFF v1.0 §9 G1 and G2 thresholds | DR-0021 | Count-based gates and 5% validity limit in §6.1 |
| HANDOFF v1.0 §9.1 K2, K5, K6, K7 | DR-0013 | K2 and K5 signatures amended; K6 split into K6a, K6b, K6e; K7 split into K7a, K7b |
| PRD §18 retry on INCONCLUSIVE | DR-0021 | Gate runs use retries off |
| HANDOFF §6 symptom set (primary analysis) | DR-0022 | ANNOUNCEMENT_INTERRUPTED and ANNOUNCEMENT_ORDER_BROKEN excluded unless the add-on rule applies |
| HANDOFF v1.0 R4 timing condition on interruption and queueing | DR-0022 | Replaced by the D13 exclusion and the fixed H2 scope in §1.3 and §3.7 |

## 8. Open points (Proposed by Claude, not yet owner-approved)

| Point | Proposal | Section |
|---|---|---|
| Post-block canary under DR-0021 | Report with the block; do not convert observed outcomes (as HANDOFF v1.1 §7.4) | §3.6 |
| Ambiguous outcome evidence (PRD §20) | Route to REVIEW, since INCONCLUSIVE needs a pre-outcome check | §3.3 |
| Leg for C's B2 component | NVDA-absent leg, as HANDOFF v1.1 R8 reads DR-0020; owner to confirm, since the owner's wording is explicit only for D | §2.4 |
| Cross-leg matching | By item, side and repetition index (as HANDOFF v1.1 R8) | §2.4 |
| Audio check scope | NVDA-present leg only | §3.6 |
| Unit of the 5% validity limit | Pooled across K1–K5 | §6.1 |
| Meaning of "announced" in the K6a rule | Region text appears in NVDA's queued speech | §5.4 |
| Membership of the creation-time regression family | The mechanisms listed in DR-0013's proposed reading | §5.4 |
| Native self-test method | Orchestrator-to-collector QPC ping-pong, as DR-0010 proposes | §3.6 |
| BenignType descriptions | Working descriptions in §4.5 | §4.5 |
| Event-level canary expectations | Desk-research expectations in §5.3, confirmed in M1a and M2 | §5.3 |
