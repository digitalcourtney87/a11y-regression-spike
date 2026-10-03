# G2 brief (one page)

**Result:** the B2 instruments pass G2 on `windows-2025`. 260 valid NVDA-absent runs of K1–K5 (52 each) gave 0 signature failures, with 0% INCONCLUSIVE (limit 5%). Every job's listener installed all six hook ranges, and every gating component was attributed by the element's own DOM id. With NVDA running, the signatures matched as without it (100 of 100 against 99 of 99), but that comparison also changes how the canary is activated. The zero failures rest on the definitions in item 2. Every number is exploratory. Full report: [G2.md](G2.md).

| # | Question (hard rule 12) | Why it matters | Recommendation |
|---|---|---|---|
| 1 | **Accept G2 and merge M2**, which unlocks M3 (HANDOFF §9)? | G2 is the event-instrument gate; M3 to M7 stay locked until you approve it | **Yes** |
| 2 | **P12: ratify the B2 signature definitions** (DR-0053 as narrowed by the gate review)? **Identity:** an event with an AutomationId (the DOM id) matches only by it; name, AriaRole or MSAA role are used only when there is none; LiveSetting is not used; browser-frame events are excluded (P3). **Components:** each gating canary needs the DOM and platform components in DR-0053, and K4 also needs SHOW on the dialog (made required after the smoke run). **Record-only:** a "separate update" is a live-region or IA2 text event on the region after its insertion, and K7 order is read per event type. **"Same frame":** the same task, or a rAF fill within one 60 Hz frame; other fills under 50 ms go to REVIEW | They decide what counts as a B2 match, and G2's result rests on them. They were fixed before the G2 runs. The review then narrowed identity, because the LiveSetting fallback had attributed a region's text to the region. Re-scored from the raw evidence, every G2 verdict and trace is unchanged | **Yes** |
| 3 | **Make P9 final, as tested**, for polite regions filled after load? Same-task and one-rAF fills count as populated insertions; fills from 50 ms count as separate updates. Every other fill under 50 ms routes to REVIEW (untested). The 350 ms pre-load boundary and other roles keep DR-0037's grading until M3 tests them. Conditional on item 2 | P9 asked G2 to confirm it against the NVDA-absent signatures. One-rAF fills gave no separate update (0 of 10; 0 of 20 with the pilot), and fills from 50 ms always did (50 of 50), matching NVDA's speech. It decides K6 grading in M3 and M5 | **Yes** |
| 4 | **P13: which errors may be INCONCLUSIVE?** Only a setup error before activation (browser launch, page load, process or window lookup) is INCONCLUSIVE (`ENV_FAILURE`). A failure of the B2 listener, or any error after activation, counts as a failure | An instrument fault should not be able to hide as INCONCLUSIVE (DR-0032). This was implemented after the review; `ENV_FAILURE` for setup errors has existed since M1 but was never put to you. No G1 or G2 attempt had either kind of error | **Yes** |

**For information (no decision needed):**

- **Hook ranges (P3):** the approved ranges covered every required signature component and stay unchanged. Events outside them could not be seen, so they are untested for M5.
- **Activation:** the NVDA-absent leg's click leaves pointer-state changes (inferred) on the clicked button and on the element under the pointer. They fall outside every signature.
- **Chrome's window (inferred):** a follow-up change can reach the platform up to about 150 ms after the previous serialisation. 50 ms fills arrived about 116 ms after the fill.
- **Wall anchor:** G1-type NVDA-present jobs still use the coarse Node anchor, because no listener runs there (P4). This departs from DR-0030's plan and affects only display and parity bucketing.
- **Interruption and queueing** stay out of C's primary scope (D13).
- **Cost:** 251 Windows job-minutes at £0. This review used 1.69M subagent tokens, 12.37M across all multi-agent runs to date.
- **Evidence:** `results` branch, `g2/` (SHA-256 `860478b1…947b2`).
