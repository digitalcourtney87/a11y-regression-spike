# Decision-pack addendum: 27 November 2026

**Label: EXPLORATORY.** These are post-hoc analyses of the accepted, already-exposed confirmatory evidence, made at the owner's request on 13 October 2026.

- **Existing evidence only.** No Windows job, corpus round, calibration study, new freeze tag or verdict change.
- **Unchanged scorer.** Every figure comes from the unchanged `protocol-freeze-v4` scorer. Rate intervals use its paired pattern bootstrap (seed 20261005, 10,000 resamples); proportions use Wilson 95% intervals.
- **Method check.** The analysis first reproduced all ten accepted headline comparisons exactly: five at 77 patterns and five at 59.
- **Sources.** Evidence and commands are in [`docs/research/addendum-evidence/`](research/addendum-evidence/). This addendum accompanies the [decision pack](gates/decision-2026-11-27.md) and its [brief](gates/decision-2026-11-27-brief.md). The brief's items are on hold until you have read this.

## One-page summary

| # | Question | Finding |
|---|---|---|
| 1 | Share of C's added detections that D keeps (PRD §52) | **UNION: 4 of 5, 80% (Wilson 38–96%).** As a rate, (D−B2)/(C−B2) = 0.78 (bootstrap 0.18–1.00). **ADJUDICATED: undefined.** C is below B2 there (−0.055), so there is no gain to keep. D keeps 4 of the 5 items C adds, but loses 3 that B2 catches. Under UNION, B2 ⊆ D ⊆ C holds for every item. That bounds D−C to between −(C−B2) and 0, so the ±0.08 equivalence test can never fail on its upper side. It *can* fail on its lower side: a D that kept nothing would give −0.115 to −0.009, which is not equivalent. "Equivalent within 0.08" is therefore weak support for H3 |
| 2 | H2 and H3 at 59 against 77 patterns | At 59, under `protocol-freeze-v3`: C−B2 UNION is inconclusive (+0.045, 0.000 to 0.102), becoming a difference at 77 (+0.053, 0.009 to 0.115). All other calls are unchanged. D keeps 2 of 3 at 59 and 4 of 5 at 77 |
| 3 | REVIEW on non-regressions | 77 benign: A 1, B/B2/D 3 (3.9%, 1.3–10.8%), C 5 (6.5%, 2.8–14.3%). 45 unchanged: A 0, B/B2/D 2 (4.4%, 1.2–14.8%), C 4 (8.9%, 3.5–20.7%). At 59, every arm has 1 benign and 0 unchanged |
| 4 | Which B2 source carries H1? | **The WinEvents, entirely.** With WinEvents masked, B2 = B (61 → 57 detections; the difference is exactly 0). With the DOM timeline masked, nothing changes (61; +0.079, 0.010 to 0.133). The four gains are 2 ANNOUNCEMENT_MISSING and 2 ANNOUNCEMENT_DUPLICATED |
| 5 | DR-0023 rule model | It was run. Rule 1 ("C detects iff B2 detects") was chosen on dev. On test, C detects and the rule does not on 5/77 items (6.5%, 2.8–14.3%). Agreement is 93.5% under UNION and 85.7% under ADJUDICATED |
| 6 | Per-journey runner time with NVDA start-up and handover | Medians per journey. C: 45 s warm, 52 s cold. D: 33/40 s if NVDA can attach at the triggered step, but 43/50 s if NVDA must drive any triggered journey. **NVDA is needed on 74% of journeys.** D's 15% figure counts NVDA *segment* time only. Its runner time is 62–92% of C's, depending on how NVDA would attach |
| 7 | H4, split in two | **The instruments are reliable.** Gating canaries and the soak show 0 failures. The K1 soak (K1 only) gives 0/599 per leg: upper bound **0.50% one-sided, 0.61% two-sided**. **Journeys are not always reachable.** 4 of 77 patterns (5.2%, 2.0–12.6%) failed a baseline goal in every base attempt of a leg: 0 of the 59 original patterns, and 4 of the 18 mined in round two |
| 8 | Recommendation in pre-registered terms | **PIVOT** (technical reading), with **CASCADE** the alternative. Events catch 61 of the 66 UNION detections, and real NVDA's distinct additions are at most 4 items. PROCEED and STOP also turn on commercial evidence, which is outside this repository |
| 9 | Model spend against the £150 cap | **£0 metered.** Claude runs on a Max subscription with extra usage disabled (£0.00 of the £80 monthly extra-usage limit). Codex runs on its own plan. The fixed subscription fees are on your bills |
| 10 | Public write-up | A draft of under 1,000 words is in §10, for your review only |

**Change from the decision pack.** The pack's "proceed in a scoped form" corresponds to CASCADE. This addendum moves my technical reading to PIVOT, for three reasons:
- D's runtime saving is smaller than the 15% segment figure suggested.
- H3's UNION equivalence is structurally weak.
- One of NVDA's five additions traces to a harness sampling-time effect (M8).

If you accept that reading, brief item 2 should be revised before 27 November.

## 1. H3 under the PRD §52 metric

The primary architecture metric is the share of C's added detections that D keeps, (D − B2)/(C − B2), read against the time saved (§6).

| Combination | C adds over B2 | D keeps | Count share (Wilson 95%) | Rate ratio (bootstrap 95%) |
|---|---|---|---|---|
| UNION, 77 patterns | 5 | 4 | 80.0% (37.6–96.4) | 0.775 (0.18–1.00); 46 of 10,000 resamples undefined |
| UNION, 59 patterns | 3 | 2 | 66.7% (20.8–93.9) | 0.733 (0.00–1.00); 462 of 10,000 resamples undefined |
| ADJUDICATED, 77 patterns | 5 | 4 | 80.0% (37.6–96.4) | Undefined: C−B2 = −0.055 |

**Which items.** C's five UNION additions at 77 are two seeded ANNOUNCEMENT_MISSING items and three mined items: Bootstrap 35496 (FOCUS_NOT_RESTORED), Bootstrap 39189 and Vuetify 21591 (both JOURNEY_BLOCKED). D misses only `acrm-error-not-announced-form-control`. Bootstrap 39189 is the M8 case: B2's baseline goal was checked before focus moved, so this addition reflects the legs' different sampling times, not NVDA-only information.

**Under ADJUDICATED.** D detects 3 items that C misses and misses 3 that B2 catches, so it does not lie between B2 and C.

**Why the equivalence test is one-sided under UNION.** D's UNION verdict combines B2 with a subset of C's NVDA segments, so for every item B2 ⊆ D ⊆ C. This holds with 0 exceptions at 59 and 77. Every resample therefore gives −(C−B2) ≤ D−C ≤ 0.

- **The upper side cannot fail.** D−C is never above 0.
- **The lower side can fail.** It only fails if D misses enough of C's gain over B2. The accepted result is −0.012 (−0.042 to 0.000). A D that kept nothing would give −0.115 to −0.009, which is a difference, not equivalence.
- **What the test can show.** At most whether D keeps a 5-item gain. It cannot show that a cascade preserves NVDA's value in general.

## 2. H2 and H3 at 59 and 77 patterns

The 59-pattern column is the original round under `protocol-freeze-v3`. Recomputed from the v4 scores of the original 145 items, it reproduces the accepted [G4](gates/G4.md) figures exactly.

| Comparison | 59 patterns (v3) | Call | 77 patterns (v4) | Call |
|---|---|---|---|---|
| C − B2, UNION (H2) | +0.045 (0.000 to 0.102) | inconclusive | +0.053 (0.009 to 0.115) | difference |
| C − B2, ADJUDICATED (H2) | −0.060 (−0.149 to 0.036) | inconclusive | −0.055 (−0.144 to 0.046) | inconclusive |
| D − C, UNION (H3) | −0.012 (−0.042 to 0.000) | equivalent | −0.012 (−0.042 to 0.000) | equivalent |
| D − C, ADJUDICATED (H3) | +0.026 (−0.025 to 0.090) | inconclusive | +0.030 (−0.023 to 0.095) | inconclusive |
| D keeps C's added detections (UNION) | 2 of 3 | — | 4 of 5 | — |

H2 UNION becomes a difference only after the second round adds two NVDA-only detections: Bootstrap 39189 and Vuetify 21591. One of them is the sampling-time case above. The second round was built after the first round's outcomes were known (A-004 to A-018).

## 3. REVIEW rates on non-regression items

REVIEW is neither a FAIL nor a PASS. It routes an item to a human. Counts are items, with Wilson 95% intervals.

| Arm | Benign, 77 | Unchanged, 45 | Benign, 59 | Unchanged, 27 |
|---|---|---|---|---|
| A | 1 (1.3%; 0.2–7.0) | 0 (0–7.9) | 1 (1.7%; 0.3–9.0) | 0 (0–12.5) |
| B, B2, D UNION, D ADJ. | 3 (3.9%; 1.3–10.8) | 2 (4.4%; 1.2–14.8) | 1 (1.7%; 0.3–9.0) | 0 (0–12.5) |
| C UNION, C ADJ. | 5 (6.5%; 2.8–14.3) | 4 (8.9%; 3.5–20.7) | 1 (1.7%; 0.3–9.0) | 0 (0–12.5) |

Every REVIEW on a non-regression beyond the one shared benign item belongs to the twins and unchanged controls of the four patterns with baseline goal failures in §7:

- **B, B2 and D:** Bootstrap 39189 and Vuetify 22770.
- **C:** those two, plus Carbon 7861 and Fluent 4620, whose failures are in the NVDA leg.

## 4. Decomposing B2: WinEvents against the DOM timeline

**Method.** Two masked copies of all 398 archived blocks were made:
- **DOM-only:** every attempt's WinEvent trace emptied.
- **WinEvents-only:** every attempt's DOM mutation timeline emptied.

Nothing else changed. Each copy was re-scored with the unchanged v4 scorer. A and B are identical under both masks, so the masks do not leak into other arms.

| B2 variant | Detections /77 | B2 variant − B (bootstrap 95%) | Call |
|---|---|---|---|
| Full B2 (accepted) | 61 | +0.079 (0.010 to 0.133) | difference |
| DOM timeline only (WinEvents masked) | 57 | 0.000 (0.000 to 0.000) | no gain |
| WinEvents only (DOM timeline masked) | 61 | +0.079 (0.010 to 0.133) | difference |

**H1's whole gain comes from the WinEvent trace.** It rests on four seeded live-region items: `acrm-busy-left-true-toaster`, `acrm-toast-region-created-populated` (both ANNOUNCEMENT_MISSING), `acrm-live-update-repeated-toast` and `ras-live-update-repeated-post-saved` (both ANNOUNCEMENT_DUPLICATED).

**Both masks change nothing else:**
- no new FAIL;
- REVIEWs on benign and unchanged items stay at 3 and 2;
- no detection appears that full B2 lacks.

**Caveats:**
- In the frozen rules, the DOM timeline still feeds Arm D's triggers and the route-change check. Masking it here measures detection only.
- The 18 mined patterns add no B2-over-B detection, so the gain comes entirely from the seeded live-region family.

## 5. The DR-0023 rule-model secondary analysis

It was pre-registered at M6 (PROTOCOL §4) and run at both G4 analyses, so nothing is missing. On the dev split, each of the three candidate rules matched C on all 20 items under UNION and on 19 of 20 under ADJUDICATED. The earliest rule, "C detects iff B2 detects", was therefore chosen.

Applied unchanged to the test split:

| Combination | C detects, rule does not | Agreement |
|---|---|---|
| UNION, 77 | 5/77, 6.5% (2.8–14.3) | 72/77, 93.5% (85.7–97.2) |
| ADJUDICATED, 77 | 5/77, 6.5% (2.8–14.3) | 66/77, 85.7% (76.2–91.8) |

The five residual items are exactly C's five UNION additions in §1. So B2's verdict predicts C's detection except where NVDA adds an item. Source: [secondary-rule-model.json](research/m7-second-round-evidence/secondary-rule-model.json) and [G4 second round](gates/G4-second-round.md).

## 6. Per-journey runner time for C and D

**What is recorded.** The runner stamps every step on the QPC clock. It records no attempt-level start or end and no NVDA start-up duration. NVDA's log carries wall-clock times, which DR-0039 forbids for latency. So the table is built from measured components:

| Component | What it covers |
|---|---|
| **Journey span** | First to last AT step of one attempt |
| **Between-journey gap** | Browser relaunch, page, setup and handover. In the NVDA-absent leg it also includes the per-attempt axe run |
| **Job lead time** | Start of a job to its first step. In the NVDA-present leg this includes NVDA start-up |
| **Cold start-up estimate** | The present leg's median lead time (24.5 s) minus the absent leg's (17.4 s), about 7.2 s. This is rough: it also nets out the absent leg's listener probe |

| Measured component (seconds) | Median | Interquartile range | n |
|---|---|---|---|
| NVDA-absent journey span | 8.7 | 6.4–14.9 | 199 items |
| NVDA-present journey span | 15.1 | 8.9–33.0 | 199 |
| Triggered NVDA segments, when any step triggers | 4.3 | 2.9–5.9 | 148 |
| Gap between journeys, absent / present | 16.4 / 4.8 | 13.4–21.4 / 4.6–5.1 | 1,063 each |

Per journey, summing both legs' runner time (median, interquartile range):

| Configuration | Warm NVDA | Cold NVDA | Total runner time against C (warm) |
|---|---|---|---|
| C: both legs, every journey | 45.2 s (36.9–69.6) | 52.4 s (44.0–76.7) | 100% |
| D, NVDA attaching at the triggered step | 32.7 s (26.5–39.3) | 39.8 s (32.7–46.4) | 62% |
| D, NVDA driving the whole journey when triggered | 42.8 s (29.4–68.9) | 50.0 s (32.7–76.0) | 92% |

**How the D rows are built.** Both include the full absent leg. For triggered journeys, the attach row adds the present leg's whole between-journey overhead, plus start-up when cold.

**What drives D's cost.** 148 of 199 journeys (74.4%, 67.9–79.9%) trigger NVDA at least once. So D's cost depends mainly on whether NVDA can attach mid-journey, which this harness never tested. The pack's 15% is NVDA *segment* time only (689 against 4,605 s).

**Running the legs.** The legs run in parallel in CI, so elapsed time per journey is the slower leg, not the sum.

## 7. H4 split: instrument reliability and journey reachability

**Instrument reliability: met.**

| Check | Result |
|---|---|
| G1 speech instrument | 252 valid gating-canary runs, 0 failures; INCONCLUSIVE 1/253 |
| G2 event instruments | 260 valid, 0 signature failures; INCONCLUSIVE 0/260 |
| M7 soak, **K1 only** | 0 failures in 599 valid attempts per leg. Upper 95% bound **0.50% one-sided** (exact 0.499%; rule of three 0.501%) and **0.61% two-sided** (exact 0.614%). K2–K5 were not soaked |
| Corpus K1 brackets | 397/398 absent, 398/398 present |
| Corpus INCONCLUSIVE | 6/1,262 attempts per leg, 0.48% (0.17–1.03%) |

**Journey reachability: a limit.** A baseline goal failure means a goal-based step ended UNREACHABLE on the working (base) build. Four patterns had one, each in **9 of 9** base attempts of the affected leg (3 items × 3 repetitions); no other pattern had any:

| Pattern | Leg | Failing step | Cause (M8, M9) |
|---|---|---|---|
| Bootstrap 39189 | NVDA-absent | open-details | The goal is checked before focus moves |
| Carbon 7861 | NVDA-present | reach-result | The fixed browse sequence after selection produces no speech; unresolved (no application role asserted) |
| Fluent 4620 | NVDA-present | reach-expected-month | No speech from browsing inside an `application`-role container; unresolved |
| Vuetify 22770 | Both | reach-autocomplete | The field is unnamed while focused; NVDA says "edit blank" |

That is 4 of 77 patterns (5.2%, 2.0–12.6%): 0 of the 59 seeded or first-round patterns, and 4 of the 18 mined in round two (22%, 9–45%). Date-picker 5428 reaches its goal but carries the wrong symptom, so it is not counted here.

## 8. Recommendation in the pre-registered vocabulary

PRD §42 defines four outcomes. Only their technical conditions are assessed here; PROCEED and STOP also need commercial evidence, which this repository excludes.

| Outcome | Technical condition | Evidence | Fit |
|---|---|---|---|
| PROCEED | Real AT adds meaningful incremental signal, at acceptable reliability | Small UNION gain: 5 items, one a sampling artefact. Unsettled under ADJUDICATED. Journey reachability is a limit | Weak |
| CASCADE | Real AT adds useful signal but is too slow or unreliable to run broadly; adjudicate selectively | AT does add signal under UNION. C costs about 45 s per journey against the absent leg's 25 s. D keeps 4 of 5 additions but saves only 8–38% of runner time | Partial |
| PIVOT | Event-based testing captures most meaningful regressions | B2 catches 61 of C's 66 UNION detections (92.4%; 83.5–96.7%). The WinEvent trace is the active ingredient. Under ADJUDICATED, C detects fewer than B2 | **Strongest** |
| STOP | No meaningful technical differentiation | Events do differentiate: H1 is a difference, entirely from WinEvents | Not supported |

**Technical recommendation: PIVOT.** Treat an event-first proposition, built on WinEvent observation, as the thing to test next, separately and on its own terms. PRD §53 already asks that a tree- or event-first product be validated independently, not continued by default. Keep real NVDA for adjudication research only.

**When CASCADE is the better reading.** If you judge NVDA's residual additions commercially important, choose CASCADE. Those are missed error announcements and focus restoration. It would then need a test of whether NVDA can attach at a triggered step, because D's value depends on it.

The PRD allows one predefined, time-boxed improvement round before a final decision. Per your instruction, none is started.

## 9. Model spend against the £150 cap

| Source | Measured or recorded | Against the cap |
|---|---|---|
| Claude (Claude Code) | Max subscription. Extra usage **disabled; £0.00 spent** of an £80 monthly extra-usage limit (app usage card, read 13 October 2026). Plan usage this week: 3% of the all-models limit | **£0 metered.** The fixed subscription fee is not attributable to this project from here |
| Codex / ChatGPT | Its own subscription. Code reviews reported reaching their usage limit on PR19 and PR21 | Not visible here; your billing decides |
| Logged subagent tokens | 12.37M up to G2, about 0.22M for the M9 review, and the M8 review unlogged: at least 12.6M | Indicative only: at Claude Opus 5.5's uncached input rate ($4 per million tokens), about **US$50**. Not a bill. The logs don't split input, cached input and output, and main sessions are not logged |

**Estimate: £0 of metered spend against the £150 cap.** If the cap was meant to cover subscription fees, your statements are the authority.

## 10. Draft public write-up (for owner review; under 1,000 words)

> **Do real screen readers catch accessibility regressions that automated checks miss? Results from one pre-registered study**
>
> We tested whether running a real screen reader in continuous integration catches accessibility regressions that cheaper automated checks miss. The results below describe one corpus of web components and pages under one set of conditions. They do not tell you how often such regressions occur in the wild, and they are not a product claim.
>
> **What we compared.** Four layers of checking ran on the same journeys through the same pages:
>
> - **A:** the axe rules engine.
> - **B:** A plus snapshots of Chrome's accessibility tree.
> - **B2:** B plus a time-stamped record of DOM changes and Windows accessibility events (WinEvents).
> - **C:** B2 plus the NVDA screen reader, observed through the text it queued to speak.
>
> A fifth configuration, **D**, ran NVDA only at steps that pre-registered trigger rules flagged.
>
> **The corpus.** 77 regression patterns. 51 were seeded into two open-source admin applications, and 26 were mined from real bugs in open-source component libraries. Each pattern had a benign twin, a change that should not fail, and many had an unchanged control. That made 199 items in all.
>
> **How we ran it.** Every journey ran three times on the working and the changed version of each page, in two separate Windows legs: one without NVDA and one with it. Detection meant a failure with the correct, pre-declared symptom. Uncertain outcomes counted as misses.
>
> **How we protected the result.** Rules, triggers and thresholds were developed on a separate development split. The protocol was then frozen and tagged before any test item ran. The test split ran once. An 18-pattern second round, required by the protocol's sample-size rule, was built after the first round's outcomes were known. We disclose that, and we report both rounds.
>
> **What we found**
>
> *Event observation adds detections beyond the accessibility tree.* B2 detected 61 of 77 regressions against B's 57. On the pre-registered symptom-weighted rate, that is a difference of +0.079 (95% interval 0.010 to 0.133). In an exploratory re-analysis, masking each event source in turn showed that the whole gain came from the WinEvent trace, not the DOM mutation record. All four extra detections were live-region announcements that went missing or were duplicated.
>
> *A real screen reader added a small number of detections, depending on how its evidence is combined.* Counting a failure in either leg (UNION), C detected 66 of 77, a difference over B2 of +0.053 (0.009 to 0.115). When the NVDA leg's evidence had to be adjudicated against B2's (ADJUDICATED), the comparison was inconclusive (−0.055, −0.144 to 0.046). One of the five extra UNION detections traced to the two legs checking a dialog at different times after a key press, not to information only the screen reader had. With 59 patterns, before the second round, the UNION comparison was itself inconclusive.
>
> *Running the screen reader only at triggered steps kept most of its additions.* D kept 4 of C's 5 extra detections, and its UNION rate was within the pre-registered ±0.08 of C's. That test is weaker than it sounds. Under UNION, D can never score above C, so the test can fail only on one side. And because triggers fired in 74% of journeys, D's saving in total runner time ranged from about 8% to 38%, depending on whether the screen reader could join a journey midway. We did not test that.
>
> *The instruments were reliable; the journeys were less so.* Known-answer checks passed throughout. A 600-attempt soak of one live-region check had no failures in 599 valid attempts per leg. That puts the upper 95% bound on its failure rate at 0.61% (two-sided). False failures were zero on 77 benign and 45 unchanged items, though zero observed is not a zero rate. Separately, 4 of the 18 mined patterns could not complete a journey goal on the *working* page in at least one leg. In two, the screen reader produced no speech when reading on after a selection; one of these was inside an application-role widget. One was a goal checked before focus moved. One was a field that was genuinely unnamed while it had focus.
>
> *Human review load was modest but real.* With the tree, event and screen-reader checks, 4% to 9% of non-regression items were routed to human review rather than passed. The screen-reader configuration had the highest rate, all of it on the patterns with unreachable journeys.
>
> **What this does and does not show**
>
> In this corpus, the cheapest robust gain came from observing platform accessibility events, not from running a screen reader. A real screen reader added a few detections, chiefly missed error announcements and focus restoration. Under a stricter adjudicated reading, it added nothing measurable. Selective execution preserved those additions in this sample, but at a smaller time saving than segment timings alone suggest.
>
> The study does not show:
> - how common any of these regressions are in practice;
> - how other screen readers, browsers or platforms would behave (we used NVDA 2026.2 with eSpeak NG, Chrome 153 and Windows Server 2025);
> - whether the results hold for applications unlike these.
>
> Speech was measured as the text NVDA queued, not as audio. NVDA's internal browse/focus mode was not observable.
>
> **Lessons for anyone building something similar**
>
> - Journey goals need care. A goal checked too early, or one that requires a name the page exposes only when unfocused, turns a working page into a false limitation.
> - A simulated screen-reader cursor needs a stable notion of position. Ours stalled on CSS-generated text until we corrected it, and we validated the correction separately on fresh controls.
> - Pre-register what counts as detection, freeze it, and report negative and inconclusive results alongside the positive ones.
>
> **Reproducibility.** The frozen protocol, scorer, analysis scripts and complete raw evidence archives are published in the project repository, with checksums. Every headline figure can be regenerated from the archived evidence with the documented commands.
