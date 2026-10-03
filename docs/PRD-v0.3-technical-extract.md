# Technical protocol extract — PRD v0.3

> Extract of PRD v0.3 (technical sections only), as amended by HANDOFF v1.2, the owner decisions of 2026-10-02 and the owner review of M0 (2026-10-02; DR-0030 to DR-0045). The full PRD is held privately by the owner; commercial content is not part of this repository.

**Date:** 2026-10-02; updated 2026-10-03 for the owner review of M0 (review dated 2026-10-02, recorded 2026-10-03).
**Status:** EXPLORATORY. Everything in this extract is exploratory until the protocol freeze at M6 (HANDOFF §4 rule 5). The confirmatory protocol will be `protocol/PROTOCOL.md`, hashed and tagged at the freeze (HANDOFF §9, DR-0028). The freeze hash covers every path listed in `protocol/frozen-paths.txt` (DR-0033); `docs/` is not among them, so this file is not covered by the freeze hash. Test-split items are neither executed nor scored before the freeze (HANDOFF §4 rule 5; DR-0028, DR-0034).
**Scope (DR-0014):** hypotheses, arms, verdict rules, taxonomy, canaries and thresholds. Commercial and product sections are excluded. The owner publishes a hash of the commercial protocol separately, outside this repository (DR-0014).

## Provenance convention

Every section opens with a **Sources** line. Within a section:

| Tag | Meaning |
|---|---|
| PRD §n | PRD v0.3, section n. Text marked *(verbatim)* or set as a quotation keeps the PRD's wording exactly. The PRD itself is not in this repository. |
| HANDOFF §n, Rn | `HANDOFF.md` section n, or review amendment Rn in HANDOFF §5. v1.0 wording unless marked v1.1 or v1.2. R8 onwards are new in v1.1, which incorporates the decision records of 2026-10-02; v1.2 (2026-10-03) incorporates the owner review of M0. |
| DR-xxxx | Decision record in `docs/DECISIONS.md` (titles in the table below). DR-0010 to DR-0022 record owner decisions D1 to D13. DR-0030 to DR-0045 record the owner review of M0 (2026-10-02, recorded 2026-10-03). |
| Approved by the owner 2026-10-02 (DR-0030) | A part Claude proposed that the owner approved in the review of M0. Where a later record amends it, that record is cited as well. |
| Decided by Claude under DR-0045 (2026-10-03) | A gap Claude filled and logged under the owner's delegation. It is not a hard-rule-12 item (what is measured, what counts as detection, cost or security). |
| Proposed by Claude (not yet owner-approved) | A hard-rule-12 gap Claude had to fill. It is not an owner decision, may change, and is listed in §8 for the owner. Where the label names a pending owner item, it reads, for example, "Proposed by Claude (not yet owner-approved; pending P4)". |

Where sources are combined, the row or paragraph names each one. Where a later source amends an earlier one, the later source wins (HANDOFF v1.0 header: HANDOFF wins over the PRD; owner decisions of 2026-10-02 win over HANDOFF v1.0; the records of the owner review of M0 win over the records they amend).

Titles are the record headings in `docs/DECISIONS.md`, verbatim. The Note column gives only the later records that amend a record ("Amended by") and the records it relates to ("Related").

| Decision record | Title | Note |
|---|---|---|
| DR-0006 | Runner images | |
| DR-0008 | GitHub Action pins | |
| DR-0010 | D1 Clock alignment | Amended by DR-0039 |
| DR-0011 | D2 Speech capture (incl. PRD §48 AT Driver teardown) | Amended by DR-0039 |
| DR-0012 | D3 Virtual audio | Amended by DR-0040 |
| DR-0013 | D4 Canaries (incl. pre-registered K6a rule) | Amended by DR-0036, DR-0037 |
| DR-0014 | D5 PRD publication | |
| DR-0017 | D8 NVDA channel and voice | Amended by DR-0041 |
| DR-0018 | D9 Arm B evidence | |
| DR-0019 | D10 B2 scope and listener | Amended by DR-0037 |
| DR-0020 | D11 Separate legs | Amended by DR-0031 |
| DR-0021 | D12 Gates and validity | Amended by DR-0032, DR-0035, DR-0038 |
| DR-0022 | D13 H2 scope | Related: DR-0042 |
| DR-0023 | M6 pre-registration: rule-model secondary analysis | |
| DR-0024 | Smaller fixes (approved as proposed) | |
| DR-0026 | Schema v1.1 additions | Amended by owner amendments (a)–(c) in the record; DR-0035, DR-0038 |
| DR-0028 | Protocol freeze guard | Amended by DR-0033, DR-0034 |
| DR-0029 | Desk research basis (2026-10-02) | |
| DR-0030 | Owner review of M0: approvals | |
| DR-0031 | Item-level leg combination for C and D (amends DR-0020) | |
| DR-0032 | INCONCLUSIVE principle and the post-block canary (amends DR-0021) | |
| DR-0033 | Freeze scope: protocol/frozen-paths.txt (amends DR-0028) | |
| DR-0034 | Execution guard for the test split (hard rule 5) | |
| DR-0035 | Side-aware validity from M4; validity.ts is Phase 0-scoped (record now, implement before M4) | |
| DR-0036 | K6 and K7 in both legs; K6a rule on the NVDA-present leg (amends DR-0013) | |
| DR-0037 | K6 insertion-to-content delay grading replaces the same-batch flag (amends DR-0013, DR-0019, HANDOFF §8.3) | |
| DR-0038 | Per-canary INCONCLUSIVE reporting (amends DR-0021) | |
| DR-0039 | NVDA log bucketing via the wall anchor (amends DR-0010, DR-0011) | |
| DR-0040 | Scream Authenticode verification (amends DR-0012) | |
| DR-0041 | eSpeak NG at NVDA's default rate (amends DR-0017) | |
| DR-0042 | M5 planning note: ANNOUNCEMENT_DUPLICATED is anti-conservative (relates to DR-0022) | |
| DR-0045 | Escalation and gate-brief process (owner delegation) | |

---

## 1. Hypotheses

**Sources:** HANDOFF §1 (verbatim); PRD §58 questions 1–4 (verbatim); DR-0022; DR-0011; DR-0023; DR-0039; HANDOFF v1.1 R10.

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
- Documented bias: **queued-then-cancelled text counts as spoken.** HANDOFF v1.1 R10 adds that cancellations NVDA makes inside its speech manager never reach the relay. The bias makes ANNOUNCEMENT_DUPLICATED anti-conservative; M5 plans for it (§4.2, DR-0042).

Speech evidence comes from a receive-only relay tap on NVDA's Remote Access relay, with NVDA's DEBUG log copied after every NVDA run as a second record and message-count parity reported between the two (DR-0011). Log lines may be bucketed into segments via the wall anchor for parity counts and diagnostics only (DR-0039; §3.7). No AT Driver runs take place in Phase 0 (DR-0011).

### 1.4 Planned secondary analysis (DR-0023)

To be pre-registered at M6: a secondary analysis of how much of C's verdicts a rule model, fitted to B2 evidence on the dev split, predicts on the test split.

---

## 2. Arms

**Sources:** PRD §33 and §34 (verbatim); HANDOFF R3 (verbatim), §8.3, §8.4, §10.2; HANDOFF v1.1 and v1.2 R3, R8; DR-0018; DR-0019; DR-0020; DR-0030; DR-0031; DR-0037; DR-0011; DR-0006; DR-0024; DR-0010.

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
| B2 | B, plus the DOM mutation timeline (HANDOFF §8.3, with the insertion-to-content delay grading of DR-0037), plus platform events from a C# listener on .NET 10. WinEvents are primary: MSAA and IA2 event IDs, plus `EVENT_SYSTEM_ALERT`, `EVENT_SYSTEM_FOREGROUND` and `EVENT_OBJECT_DESCRIPTIONCHANGE`. Identity is resolved through MSAA and UIA property reads (AutomationId, LiveSetting, AriaRole); no IA2 QueryService and no proxy registration. UIA events are diagnostic only. The listener's hook ranges, its browser-PID and window-class filtering, and the exclusion of browser-UI alerts were approved by the owner on 2026-10-03 (P3; DR-0052). | NVDA-absent | PRD §33; HANDOFF §8.3; DR-0019; DR-0024; DR-0037 |
| C | B2, plus real NVDA (Guidepup 0.35.0 for provisioning, lifecycle and input only, started with `capture:false`). Speech from the receive-only relay tap, attached before each segment; NVDA DEBUG log as a second record. Scored under UNION and ADJUDICATED (§2.3). | B2 evidence from the NVDA-absent leg; NVDA evidence from the NVDA-present leg; combined at item level (§2.4). The split for C was approved by the owner 2026-10-02, with the item-level combination as an amendment (DR-0031). | PRD §33; HANDOFF R3, v1.2 R8; DR-0011; DR-0020; DR-0031 |
| D | Triggers applied to the NVDA-absent B2 evidence; NVDA evidence taken from the NVDA-present leg for triggered steps only; combined at item level, as for C (DR-0031). Trigger rules v1 are fixed in advance from PRD §14 (HANDOFF R5) in `protocol/triggers.v1.json`. Runtime is estimated from the durations of triggered NVDA segments (HANDOFF §8.4). Scored under UNION and ADJUDICATED. | Both, as stated | PRD §33; HANDOFF R3, R5, §8.4; DR-0020; DR-0031 |

Common to every arm:

- Chrome's accessibility mode is locked with `--force-renderer-accessibility=screen-reader` in every arm, and logged; `chromiumSandbox: true` (DR-0019).
- The handover checks the real foreground window (`GetForegroundWindow`) and platform focus, not page focus events, because Playwright always enables CDP focus emulation (DR-0024). In the NVDA-present leg, platform focus is verified by an MSAA-only focus read (§2.4; approved by the owner 2026-10-03, DR-0046).
- Paired legs run within one dispatch so they share a runner image version; gates run on `windows-2025` (DR-0006).

### 2.3 Combination rules (HANDOFF R3, verbatim)

> C and D are each scored under **UNION** (FAIL if B2 or NVDA evidence FAILs) and **ADJUDICATED** (NVDA may downgrade a B2 FAIL to REVIEW when NVDA output is unchanged between base and candidate).

This gives seven scored arms (HANDOFF §10.2 `Arm`): A, B, B2, C_UNION, C_ADJUDICATED, D_UNION, D_ADJUDICATED. Under DR-0022, "NVDA output" means queued speech plus global cancels (§1.3). Each rule combines per-item results, one from each leg (DR-0031, §2.4).

### 2.4 Separate legs (DR-0020, DR-0031)

| Leg | NVDA | Arms it produces | Note |
|---|---|---|---|
| NVDA-absent | Not running | A, B, B2 | "A, B and B2 run without NVDA, as the product would" (owner, DR-0020). |
| NVDA-present | Running | C (NVDA evidence); D (NVDA evidence on triggered steps) | "C runs with NVDA" (owner, DR-0020). |

- D applies triggers to the NVDA-absent B2 evidence and takes NVDA evidence from the NVDA-present leg (owner, DR-0020).
- The invariance test in HANDOFF v1.0 §8.4 is dropped. The NVDA on/off B2 comparison becomes a 20-run diagnostic, not a G2 criterion (owner, DR-0020).
- C uses the NVDA-absent B2 evidence, as D does: approved by the owner 2026-10-02 (DR-0031), confirming the DR-0020 proposal and HANDOFF v1.1 R8's reading. Owner wording: "C uses the NVDA-absent B2 evidence, as D does, so C and D differ only in trigger masking."
- **B2 collectors in the NVDA-present leg, and how platform focus is verified there** (approved by the owner 2026-10-03, P4; DR-0046, DR-0020). The in-page DOM timeline runs in both legs, because latency is measured from the canary events themselves (DR-0010), so G1 capture latency is measured from DOM mutation (page QPC) to tap receipt. The WinEvent listener runs in the NVDA-present leg only for the 20-run on/off diagnostic, not in G1 runs, because its UIA property reads register it as a UIA client, which can change what Chrome raises (DR-0019). Platform focus in that leg is verified at handover by an MSAA-only focus read (`accFocus` on Chrome's window), so that no UIA client registers (DR-0024). B2 output from the NVDA-present leg never feeds G2 or arm verdicts. Which collectors run alongside NVDA changes which events are captured in the leg that produces C's evidence, which is why it went to the owner (hard rule 12).

**Item-level combination (DR-0031, amends DR-0020).** Owner wording: "combine legs at item level. Each leg derives its own per-item result from its own repetitions (k of n). Repetition indices are kept for traceability only and are never paired across legs."

| Step | Rule |
|---|---|
| Per-leg item result | Each leg derives its own result for an item from its own base and candidate repetitions, with k of n (§3.5). |
| Combination | UNION and ADJUDICATED (§2.3) combine, for the same item, the NVDA-absent leg's B2 result with the NVDA-present leg's NVDA result. For D, only NVDA evidence for the steps that the triggers select on the NVDA-absent B2 evidence enters the NVDA result (trigger masking; DR-0020). |
| Repetition indices | Recorded in each leg for traceability. Never paired across legs. |

The earlier proposal to match evidence across legs by item, side and repetition index (HANDOFF v1.1 R8; DR-0020) is superseded by DR-0031.

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

**Sources:** PRD §18, §19, §20, §22 (verbatim); HANDOFF §4 rules 7 and 11, §6, §7.4, R7 (verbatim where marked); HANDOFF v1.1 and v1.2 R9, §7.3, §7.4; DR-0021; DR-0010; DR-0011; DR-0012; DR-0017; DR-0022; DR-0024; DR-0026; DR-0030; DR-0032; DR-0035; DR-0038; DR-0039; DR-0041; DR-0045.

### 3.1 Verdicts (PRD §18 definitions, verbatim)

| Verdict | PRD §18 definition *(verbatim)* | Spike rules (source) |
|---|---|---|
| PASS | Defined expected behaviour observed. | — |
| FAIL | Repeatable evidence demonstrates a defined accessibility regression. | FAIL is scored only on the symptoms in §4.2, with their objective definitions (HANDOFF R2, §6). |
| REVIEW | Potentially meaningful behaviour changed but requires human judgement. REVIEW is non-blocking. | REVIEW is not detection (PRD §22; HANDOFF §6). |
| INCONCLUSIVE | The testing environment or captured evidence cannot reliably determine an outcome. INCONCLUSIVE is non-blocking. | Decided only by pre-outcome checks that the thing being judged cannot cause to fail (§3.6; DR-0021, DR-0032). Counts as a miss (§3.8, HANDOFF R7). Gate runs use retries off (DR-0021). |

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

In the spike, known-answer canaries bracket every item block (HANDOFF §7.4), and a failed pre-canary is a pre-outcome INCONCLUSIVE check (DR-0021). A failed post-block canary never converts observed outcomes (§3.6; DR-0032). The canaries are defined in §5.

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

**Decided by Claude under DR-0045 (2026-10-03):** ambiguity in the outcome evidence routes to REVIEW, not INCONCLUSIVE, in the spike. This follows from DR-0021 (INCONCLUSIVE only from checks completed before the outcome is known) and DR-0032 (the thing being judged can cause ambiguous evidence, so it cannot yield INCONCLUSIVE). Neither REVIEW nor INCONCLUSIVE counts as detection (§3.5).

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

Under DR-0031, k of n is applied within each leg separately; repetitions are never pooled or paired across legs (§2.4).

### 3.6 INCONCLUSIVE only from pre-outcome checks (DR-0021, DR-0032)

Owner rule (DR-0021): INCONCLUSIVE is decided only by checks completed before the outcome is known (foreground HWND, injection marker, audio, clock, pre-canary), never by inspecting the outcome.

Owner principle (review of M0, DR-0032): "a check may produce INCONCLUSIVE only if the thing being judged cannot cause it to fail." The owner's application: "A post-block canary can fail because the block's own pages broke NVDA, so it cannot void outcomes."

The D1 clock conditions, as the owner listed them (DR-0010): INCONCLUSIVE only for

- native self-test disagreement > 0.5 ms;
- page-mapping uncertainty > 2 ms;
- drift > 1 ms within a segment;
- low-resolution TimeTicks;
- rAF gap > 100 ms.

The full set of pre-outcome checks (HANDOFF R9, v1.1 and v1.2), with the reason codes the harness emits (`harness/src/runner/validity.ts`; DR-0026, accepted with amendments by the owner 2026-10-02). A value strictly greater than its limit is INCONCLUSIVE; a value equal to the limit passes.

| Check | INCONCLUSIVE when | Legs | Reason code | Source |
|---|---|---|---|---|
| Foreground window | Browser window is not the verified foreground HWND, or platform focus is not on the declared anchor, at handover (in the NVDA-present leg, by an MSAA-only focus read, §2.4) | Both | `FOREGROUND_HWND` | DR-0021; HANDOFF §7.2; DR-0024 |
| Pre-canary | Pre-block known-answer canary fails | Both | `PRE_CANARY` | DR-0021; PRD §19 |
| Environment manifest | Manifest missing or invalid | Both | `MANIFEST_INVALID` | HANDOFF §4 rule 11 |
| Clock: native self-test | Disagreement > 0.5 ms between the orchestrator's and each native collector's QPC readings (method approved by the owner 2026-10-02, DR-0030; DR-0010) | Both | `CLOCK_NATIVE_SELF_TEST` | DR-0010; DR-0030; HANDOFF v1.1 §7.3 |
| Clock: page mapping | Uncertainty > 2 ms | Both | `CLOCK_PAGE_MAPPING` | DR-0010 |
| Clock: segment drift | Drift > 1 ms within a segment | Both | `CLOCK_SEGMENT_DRIFT` | DR-0010 |
| Clock: TimeTicks | TimeTicks is low-resolution | Both | `CLOCK_LOW_RES_TIMETICKS` | DR-0010 |
| Clock: rAF gap | Gap > 100 ms | Both | `CLOCK_RAF_GAP` | DR-0010 |
| NVDA injection | `nvdaHelperRemote*.dll` not loaded in `chrome.exe`, or no "Buffer load took" line in the NVDA log | NVDA-present | `NVDA_INJECTION_MARKER` | DR-0017 |
| Audio | No audio endpoint, or Audiosrv not running | NVDA-present | `AUDIO` | DR-0012; DR-0030 |
| Synth | Active synth is not the declared eSpeak NG configuration (any fallback) | NVDA-present | `SYNTH_FALLBACK` | DR-0017; DR-0041 |

- **How four D1 checks are computed.** The limits are the owner's (DR-0010). The native self-test method was approved on 2026-10-02 (DR-0030), and the computations of page-mapping uncertainty, segment drift, low-resolution TimeTicks and the rAF gap on 2026-10-03 (P6; DR-0049), as set out in DR-0010.
- **Audio check scope.** Limiting the audio check to the NVDA-present leg was approved by the owner 2026-10-02 (DR-0030); DR-0012 states the check without naming a leg. A missing NVDA-present check counts as failed.
- **Declared synth configuration (DR-0041, amends DR-0017).** eSpeak NG bundled with NVDA, at NVDA's default rate for eSpeak NG (30 on NVDA's 0–100 scale on a fresh configuration), rate boost off. The `nvda.ini` committed in M1 must not set an eSpeak rate, and the effective rate is recorded from the running synth each run (`EnvManifest.synth.rate`). An effective rate other than 30 is not a synth fallback, so `SYNTH_FALLBACK` is unchanged; it goes back to the owner (hard rule 12).

Clock basis (DR-0010): QPC is the only timebase (`process.hrtime.bigint()` in Node, `Stopwatch.GetTimestamp()` in C#), with one precise wall-clock anchor per process for human-readable times only. Page time is mapped to QPC through CDP `Performance.getMetrics` (Timestamp, NavigationStart), verified once in M1a against a 16-ping minimum-RTT estimate and recomputed after every full navigation. The `document.title` marker is removed entirely; logs are joined by QPC and orchestrator-issued segment IDs. This replaces the HANDOFF v1.0 §7.3 title pulse and its 20 ms skew rule. `maxClockSkewMs` in the evidence package is redefined as max(native self-test disagreement, page-mapping uncertainty) (DR-0010; DR-0026, accepted with amendments by the owner 2026-10-02).

**Post-block canary (DR-0021 proposal, approved by the owner 2026-10-02; DR-0032).** A failed post-block canary (`canaries.post`) is reported with its block and never converts outcomes already observed; the next block must pass its own pre-block canary. HANDOFF v1.0 §7.4's rule that a failed post-block canary makes the whole block INCONCLUSIVE no longer applies. This first matters from M4, when item blocks are first run.

**Scope of the validity rule (DR-0035; DR-0026 amendment c).** The rule above is Phase 0-scoped. Owner wording: "Canaries are fixed pages, so the current rule stands for Phase 0." From M4, candidate builds can themselves steal the foreground, stall frames or crash NVDA, so the side-aware rule below replaces it. It is recorded now and implemented before M4.

| From M4, a check fails on | Result |
|---|---|
| Both base and candidate | INCONCLUSIVE |
| The candidate only | A finding: REVIEW unless a FAIL rule covers it |
| The base only | INCONCLUSIVE for that item |
| Neither | Valid |

- A check that covers both sides at once, such as the environment manifest, counts as failing on both sides (Decided by Claude under DR-0045 (2026-10-03); DR-0035).
- Pre-block canaries are fixed pages, not sides, so their rule is unchanged; post-block canaries follow DR-0032.
- Which FAIL rules cover which candidate-only check failures is set with the M5 oracles. That decides what counts as detection, so it comes to the owner (hard rule 12; DR-0035).

### 3.7 Measurement basis for speech, and its bias (DR-0022)

- What counts as NVDA output is what NVDA **queues** to speak (relay tap utterances, with their priority NORMAL, NEXT or NOW) plus global cancels, not audio. Every utterance in an NVDA-present evidence package carries its priority (DR-0026 amendment b).
- Bias: queued-then-cancelled text counts as spoken. Results that depend on this must say so. It makes ANNOUNCEMENT_DUPLICATED anti-conservative (§4.2, DR-0042).
- HANDOFF v1.0 R4 tied interruption and queueing to timestamp and cancel visibility; DR-0022 (D13) supersedes this: both symptoms are excluded from the primary analysis unless the DR-0011 add-on rule brings them in (§4.4; HANDOFF v1.1 R4, R10).
- **NVDA log (DR-0039, amends DR-0010 and DR-0011).** The DEBUG log is the second record, with message-count parity against the tap per NVDA run. Bucketing log lines into segments via the wall anchor is allowed for parity counts and diagnostics. It is never used for latency, ordering or validity. Corroborating a detection with segment-level log lines is neither a parity count nor a diagnostic, so it falls outside this ruling (DR-0039, DR-0042).

### 3.8 Scoring hygiene (HANDOFF R7, verbatim)

> INCONCLUSIVE counts as a miss in the primary analysis, and the protocol sets a ceiling on the INCONCLUSIVE rate.

For G1 and G2 the ceiling is 5% of attempts, pooled across K1–K5 (§6.1). Per-canary INCONCLUSIVE rates are also reported, and any canary above 10% is flagged (owner, DR-0038); flags do not change the gate result. The same flag is also reported for the record-only canaries (Decided by Claude under DR-0045 (2026-10-03); DR-0038; §6.1). The ceiling for the confirmatory analysis is set in `protocol/PROTOCOL.md` at the freeze (R7). The INCONCLUSIVE rate is reported per arm (HANDOFF §10.3).

---

## 4. Taxonomy

**Sources:** PRD §21 (verbatim); HANDOFF §6 (verbatim), R1, R2 (verbatim), R4, §10.2; DR-0022; DR-0011; DR-0013; DR-0042; DR-0045.

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

### 4.2 Symptoms and objective FAIL definitions (HANDOFF §6, verbatim; status column from DR-0022 and DR-0042)

| Symptom | Objective FAIL definition (base versus candidate, same environment) | Primary analysis |
|---|---|---|
| NAME_NOT_CONVEYED | Expected accessible name present in base, absent in candidate | Scored |
| ROLE_NOT_CONVEYED | Expected role present in base, absent or changed in candidate | Scored |
| STATE_NOT_CONVEYED | Expected state (expanded, checked, selected, required, invalid…) conveyed in base, not in candidate | Scored |
| ANNOUNCEMENT_MISSING | Expected announcement present in at least k of n base runs and absent in at least k of n candidate runs, with canaries passed | Scored |
| ANNOUNCEMENT_DUPLICATED | Same normalised announcement emitted at least twice within the observation window in candidate, once in base | Scored; anti-conservative, see the M5 planning note below (DR-0042) |
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

**M5 planning note (DR-0042, relates to DR-0022).** Claude's DR-0022 bias analysis shows that ANNOUNCEMENT_DUPLICATED is anti-conservative: a queued copy cancelled before it is heard still counts as spoken, so a duplicate can be credited that a listener would not hear. Owner wording: "Plan for duplicates to need NVDA-log corroboration or to route to REVIEW." M5 plans the oracle so that a duplicate seen only in the relay tap does one or the other. Which of the two, and what counts as corroboration, decides what counts as detection, so it comes to the owner at M5 (hard rule 12). DR-0039 allows wall-anchor bucketing of log lines only for parity counts and diagnostics, so corroboration would need another join method or a further owner decision. Until then the HANDOFF §6 definition above stands.

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

| BenignType (HANDOFF §10.2) | Working description — Decided by Claude under DR-0045 (2026-10-03) |
|---|---|
| WRAPPER_ELEMENT | A non-semantic wrapper element added or removed |
| CLASS_RENAME | Class names changed with no change to behaviour or semantics |
| CSS_ONLY | Styling-only change |
| COPY_EDIT | Visible text edited (an R1 example) |
| A11Y_IMPROVEMENT | Intentional accessibility improvement (an R1 example) |
| EQUIVALENT_REFACTOR | Refactor with equivalent accessible behaviour (an R1 example) |
| TIMING_WITHIN_TOLERANCE | Timing change within the declared tolerance |

The type names are fixed by HANDOFF §10.2. The descriptions are working descriptions only and are not used in Phase 0. The final descriptions belong in `protocol/PROTOCOL.md` and come to the owner as a hard-rule-12 item at the M6 freeze review (DR-0030).

---

## 5. Canaries

**Sources:** HANDOFF §8.3, §9.1 (verbatim where marked), §7.2, §7.4; DR-0013; DR-0010; DR-0019; DR-0021; DR-0022; DR-0024; DR-0026; DR-0030; DR-0036; DR-0037; DR-0045; DR-0029 (desk research, labelled where used).

### 5.1 General canary rules

| Rule | Source |
|---|---|
| K1–K5 are gating canaries. K6 and K7 are record-only at 20 runs each. | DR-0013 |
| "K6 and K7 are not pass/fail canaries. They test premises the corpus depends on." *(verbatim)* | HANDOFF §9.1 |
| K6 and K7 run in both legs: speech outcomes from the NVDA-present leg, B2 signatures from the NVDA-absent leg. | DR-0036 |
| The K6 B2 flag is the insertion-to-content delay grading (§5.3), which replaces the v1.0 same-batch flag. | DR-0037; HANDOFF §8.3 |
| Live regions carry an id but no accessible name. | DR-0013 |
| Fill delays are over 350 ms. K6e is the owner-specified exception: its sweep deliberately includes shorter delays. | DR-0013 |
| No keypress inside any observation window. | DR-0013 |
| K7 is triggered by a timer, not a key. | DR-0013 |
| K5 has no title dependency; no `document.title` marker exists. | DR-0013; DR-0010 |
| Latency is measured from the canary events themselves. | DR-0010 |
| The handover verifies the real foreground window and platform focus, not page focus events. In the NVDA-present leg, platform focus is verified by an MSAA-only focus read (§2.4; DR-0046). | DR-0024; HANDOFF §7.2 |
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

The relay tap records each utterance's priority (DR-0011, DR-0026); every utterance in an NVDA-present evidence package must carry it (DR-0026 amendment b). Desk research expects NORMAL for K1 and NEXT for K2 (DR-0029). Priority is recorded for K1–K5 but is not part of their expected outcome.

### 5.3 Record-only canaries K6 and K7 (DR-0013, DR-0036)

Behaviour and expected NVDA outcome are the owner's (DR-0013). The B2 column gives the HANDOFF v1.0 §9.1 signature for the K6 or K7 family *(verbatim)*. Each canary runs in both legs: the NVDA outcome is observed in the NVDA-present leg and the B2 signature in the NVDA-absent leg (DR-0036).

| ID | Behaviour | Expected NVDA outcome | Expected B2 signature (family) | Runs per leg |
|---|---|---|---|---|
| K6a | Populated region inserted as `aria-live=polite`, as `role=status`, and as `aria-live=assertive` (three variants) | Silent | Insertion with non-empty content flagged | 20 per variant |
| K6b | Populated `role=alert` inserted | Announced at NOW priority | Insertion with non-empty content flagged | 20 |
| K6e (exploratory) | Region inserted empty, then filled after 0 ms, one rAF, 50, 100, 150, 250 and 500 ms | Not pre-declared; recorded per delay | Insertion, then text mutation; record per delay | 10 per delay (7 delays) |
| K7a | Timer-driven polite update, then programmatic focus to a button | Polite text, then the button, no cancel | Mutation followed by focus events | 20 |
| K7b | As K7a, but focus moves into a text input from browse mode | Cancel | Mutation followed by focus events | 20 |

**K6 delay grading (DR-0037; amends DR-0013, DR-0019 and HANDOFF §8.3).** The DOM timeline records the insertion-to-content delay in milliseconds. A fill within Chrome's accessibility serialisation window (after load, at most one non-immediate serialisation per 150 ms; 350 ms before load) is graded as possibly indistinguishable from a populated insertion, so "flagged" in the K6 family signature means a populated insertion or a fill graded this way. This replaces the HANDOFF v1.0 §8.3 same-batch flag now (owner, DR-0037; basis DR-0029). K6e shows where the boundary falls on the runner; if K6e data contradict the 150 ms and 350 ms boundaries, the change goes to the owner (hard rule 12; DR-0037).

Event-level expectations from desk research — **Decided by Claude under DR-0045 (2026-10-03)** as predictions only, to be confirmed on the runner in M1a and M2 (DR-0029). They are not gate criteria; a change they lead to in a G1 or G2 criterion needs a new record and, as it changes what counts as detection, the owner (hard rule 12).

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

How the rule is read (DR-0013, DR-0030, DR-0036):

| Term | Reading | Status |
|---|---|---|
| Leg | The rule is evaluated on the NVDA-present leg | Owner (DR-0036) |
| Trigger | Any one K6a variant (polite, status or assertive) announced in 2 or more of its 20 runs | Decided by Claude under DR-0045 (2026-10-03): restates the owner's "more than 1 of 20" |
| Announced | The region's text appears in NVDA's queued speech (a relay tap `speak` message) during the observation window, consistent with the DR-0022 measurement basis | Approved by the owner 2026-10-02 (DR-0030); read from the NVDA-present leg only (DR-0036) |
| Creation-time regression family | Mechanisms that rely on content present at region creation being silent: a conditionally rendered, populated toast or status message; unhiding a populated region with `display:none` or the `hidden` attribute; re-mounting or re-keying the region element on each update; filling a region within the same accessibility snapshot as its insertion; downgrading a conditionally rendered message from `role=alert` to `role=status`; switching `aria-live` from off to polite on an already-populated node. "Live region inserted pre-populated" (HANDOFF R2) is one such mechanism. | Approved by the owner 2026-10-03 (P1; DR-0046) |
| Not affected | Mechanisms that do not depend on K6 stay eligible: `aria-busy` left true; an `aria-hidden` or `inert` ancestor; `aria-live=off` descendants; `aria-relevant` exclusions; focus moving into an edit field and cancelling speech (K7b); loss of foreground | Approved by the owner 2026-10-03 (P1; DR-0046) |

The family and its exclusions decide which mechanisms the M3 catalogue keeps if the rule triggers, so they went to the owner (hard rule 12) and were fixed on 2026-10-03, before any K6a data exist (DR-0046).

---

## 6. Thresholds

**Sources:** DR-0021 (owner wording where quoted); DR-0010; DR-0013; DR-0020; DR-0026; DR-0030; DR-0036; DR-0038; DR-0045; HANDOFF §6, §10.3. These replace the HANDOFF v1.0 §9 thresholds (98% and 90% bands for G1; 98% for G2).

### 6.1 Gates G1 and G2 (DR-0021, DR-0038)

| Gate | Rule |
|---|---|
| G1 | `windows-2025`, retries off, 50 valid runs per canary. Pooled K1–K5: at most 5 failures in 250, and no single canary with more than 3 (owner, DR-0021). |
| G2 | The same structure for B2 signature matches in the NVDA-absent leg (owner, DR-0021). |
| Validity | INCONCLUSIVE ≤ 5% of attempts (owner, DR-0021), pooled across K1–K5. Pooling was approved by the owner 2026-10-02: "keep the pooled 5% limit" (DR-0030, DR-0038). |
| Per-canary reporting | Per-canary INCONCLUSIVE rates are reported for K1–K5, and any canary above 10% is flagged (owner, DR-0038). Flags are reported but do not change pass or fail; the pooled 5% limit stays the rule. The owner's ruling sits with the pooled K1–K5 limit. The same rate and flag are also reported for the record-only canaries K6 and K7, in each leg in which they run (DR-0036); this is reporting only and never affects any result (Decided by Claude under DR-0045 (2026-10-03); DR-0038). |
| Reporting | Wilson intervals throughout; every Phase 0 result labelled exploratory (owner, DR-0021). |

Implemented pass condition (`harness/src/runner/validity.ts`): a gate passes if and only if every canary in K1–K5 has at least 50 valid runs, pooled failures are at most 5, no single canary has more than 3 failures, and pooled (attempts − valid) / attempts is at most 0.05. For each canary, `gateResult` also reports inconclusiveRate = (attempts − valid) / attempts and flags the canary when that rate is strictly greater than 0.10 (`PER_CANARY_INCONCLUSIVE_FLAG`); exactly 10% is not flagged (DR-0038).

Gate evidence packages must carry `leg`, `preflight` and a `segmentId` on every step; the M1 runner validates every gate package against `GateEvidencePackageSchema` (`harness/src/schema/`; DR-0026 amendment a).

Illustrative Wilson 95% intervals (z = 1.959964) at the gate boundaries. These are arithmetic, not thresholds:

| Observed | Lower | Upper |
|---|---|---|
| 250 of 250 | 0.9849 | 1.0000 |
| 245 of 250 (pooled limit) | 0.9540 | 0.9914 |
| 50 of 50 | 0.9287 | 1.0000 |
| 49 of 50 | 0.8950 | 0.9965 |
| 47 of 50 (single-canary limit) | 0.8378 | 0.9794 |

Illustrative INCONCLUSIVE boundaries. These are arithmetic, not thresholds:

| Case | Rate | Outcome |
|---|---|---|
| One canary: 50 valid of 55 attempts | 0.0909 | Not flagged |
| One canary: 54 valid of 60 attempts | 0.1000 | Not flagged (equal to 10%) |
| One canary: 50 valid of 56 attempts | 0.1071 | Flagged |
| Pooled: 250 valid of 263 attempts | 0.0494 | Validity passes |
| Pooled: 250 valid of 264 attempts | 0.0530 | Validity fails |
| One canary flagged at 6 of 56; the other four at 50 of 50 | Pooled 6 of 256 = 0.0234 | Flag reported; validity passes |

### 6.2 INCONCLUSIVE clock limits (DR-0010)

| Quantity | Limit | INCONCLUSIVE when |
|---|---|---|
| Native self-test disagreement | 0.5 ms | > 0.5 ms |
| Page-mapping uncertainty | 2 ms | > 2 ms |
| Drift within a segment | 1 ms | > 1 ms |
| rAF gap | 100 ms | > 100 ms |
| TimeTicks resolution | High resolution required | Low resolution |

The limits are the owner's. How each quantity is computed is set out in DR-0010 and was approved by the owner (DR-0030; P6, DR-0049). The other pre-outcome checks, and the Phase 0 scope of the validity rule, are in §3.6.

### 6.3 Run counts

| Run set | Count | Source |
|---|---|---|
| G1: each of K1–K5, NVDA-present leg | 50 valid runs (250 pooled) | DR-0021 |
| G2: each of K1–K5, NVDA-absent leg | 50 valid runs (250 pooled) | DR-0021 |
| K6a | 20 runs per variant (3 variants), in each leg | DR-0013; DR-0036 |
| K6b, K7a, K7b | 20 runs each, in each leg | DR-0013; DR-0036 |
| K6e | 10 runs per delay (7 delays), in each leg | DR-0013; DR-0036 |
| NVDA on/off B2 comparison | 20-run diagnostic | DR-0020 |
| Corpus items, per side | n = 3; n = 5 for absence-based symptoms; k = n (exploratory defaults; the protocol fixes k and n), applied within each leg (DR-0031) | HANDOFF §6; DR-0031 |

Record-only volume is therefore 190 runs per leg (K6a 60, K6b 20, K6e 70, K7a 20, K7b 20), 380 across both legs.

---

## 7. Amendments to the source texts reflected here

| Source text | Amended by | Effect in this extract |
|---|---|---|
| HANDOFF v1.0 §7.3 title-pulse clock and 20 ms skew rule | DR-0010 | QPC timebase; D1 limits in §6.2; `maxClockSkewMs` redefined |
| HANDOFF v1.0 §7.4: a failed post-block canary makes the block INCONCLUSIVE | DR-0021 (proposal approved, DR-0030); DR-0032 | Reported with the block; never converts observed outcomes (§3.6) |
| HANDOFF v1.0 §8.4 invariance test | DR-0020 | Separate legs; 20-run NVDA on/off diagnostic |
| HANDOFF v1.1 R8 cross-leg matching by item, side and repetition index | DR-0031 | Item-level combination; repetition indices for traceability only (§2.4) |
| HANDOFF v1.0 §8.1 two-adapter evaluation | DR-0011 | Guidepup for lifecycle and input; relay tap for speech; no AT Driver runs in Phase 0 |
| HANDOFF v1.0 §8.2 UIA as a capture channel | DR-0019 | WinEvents primary; UIA diagnostic only |
| HANDOFF v1.0 §8.3 same-batch flag | DR-0037 | Insertion-to-content delay grading (§5.3) |
| HANDOFF v1.0 §9 G1 and G2 thresholds | DR-0021 | Count-based gates and 5% validity limit in §6.1 |
| DR-0021 validity rule | DR-0035; DR-0038 | Phase 0-scoped, with side-aware validity from M4 (§3.6); per-canary INCONCLUSIVE reporting (§6.1) |
| HANDOFF v1.0 §9.1 K2, K5, K6, K7 | DR-0013 | K2 and K5 signatures amended; K6 split into K6a, K6b, K6e; K7 split into K7a, K7b |
| DR-0013: legs for K6 and K7 not decided | DR-0036 | Both legs; K6a rule evaluated on the NVDA-present leg (§5.3, §5.4) |
| DR-0017: numeric eSpeak rate to be proposed from M1a | DR-0041 | NVDA's default eSpeak NG rate, rate boost off; effective rate recorded per run (§3.6) |
| DR-0010 and DR-0011: NVDA log wall times display-only | DR-0039 | Segment bucketing via the wall anchor for parity counts and diagnostics only (§3.7) |
| DR-0028 freeze hash over `protocol/` | DR-0033 | The hash covers the paths listed in `protocol/frozen-paths.txt` (status line) |
| PRD §18 retry on INCONCLUSIVE | DR-0021 | Gate runs use retries off |
| HANDOFF §6 symptom set (primary analysis) | DR-0022 | ANNOUNCEMENT_INTERRUPTED and ANNOUNCEMENT_ORDER_BROKEN excluded unless the add-on rule applies |
| HANDOFF v1.0 R4 timing condition on interruption and queueing | DR-0022 | Replaced by the D13 exclusion and the fixed H2 scope in §1.3 and §3.7 |

## 8. Open points (hard rule 12, pending owner decision)

Only hard-rule-12 items still pending remain here: what is measured, what counts as detection, cost or security (DR-0045). The IDs are those of "Pending owner items (hard rule 12)" in `docs/DECISIONS.md`, which keeps them stable when an item is resolved. They go in the G1 brief; an item needed earlier is put to the owner when it is first needed, as a yes/no question with Claude's recommendation (DR-0045). The other open points of 2026-10-02 were resolved by the owner review of M0 (DR-0031, DR-0032, DR-0038 and the approvals in DR-0030) or decided by Claude under DR-0045; DR-0030 maps each one to its outcome.

| ID | Point | Proposal | Why it is a hard-rule-12 item | Needed by | Section |
|---|---|---|---|---|---|
| — | None pending | — | — | — | — |

P1, P2 and P4 were approved by the owner on 2026-10-03 (DR-0046). P3 (listener event scope), P9 (post-load K6 boundary for polite regions, provisional), P10 (focus-read retry) and P11 (canary speech matching) were approved at the G1 gate (DR-0052). P12 (the B2 signature definitions) and P13 (which errors may be INCONCLUSIVE) were approved at the G2 gate, and P9 was made final as tested (DR-0055). P23–P25 (the M4 journey model: execution per leg, goal-based step outcomes and the PRESS strategy) were approved on 2026-10-03 (DR-0067). P26 (the NVDA browse-mode commands FOCUS_MODE_TOGGLE and DOCUMENT_TOP) was approved on 2026-10-03 (DR-0071). P27 (frame gaps in corpus runs: only the part the page's own long work does not cover counts towards the 100 ms rAF limit) was approved on 2026-10-03 (DR-0076). P7 (a cost item) is outside this extract's scope and is listed only in `docs/DECISIONS.md`.

Conditional hard-rule-12 questions, which arise only if a later result triggers them:

| Question | Trigger | Record |
|---|---|---|
| A change to any G1 or G2 criterion | M2 data, including the desk-research predictions in §5.3 | DR-0013 |
| The K6 delay-grading boundaries | M2's NVDA-absent K6e signatures contradict the P9 post-load boundary for polite regions, or data contradict the 350 ms pre-load boundary or the boundary for other roles | DR-0037; DR-0052 |
| The FAIL rules that cover candidate-only check failures | Set with the M5 oracles | DR-0035 |
| The M5 handling of ANNOUNCEMENT_DUPLICATED (NVDA-log corroboration or REVIEW) | M5 | DR-0042 |
| The eSpeak NG rate | M1a finds an effective rate other than 30, or another reason to change it | DR-0041 |
| The final BenignType descriptions | The M6 freeze review | DR-0030 |
