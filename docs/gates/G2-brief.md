# G2 brief (one page)

**Result:** the B2 instruments pass G2 on `windows-2025`. 260 valid NVDA-absent runs of K1–K5 (52 each) gave 0 signature failures, with INCONCLUSIVE at 0% (limit 5%). The listener installed all its hooks and resolved identity in every attempt. With NVDA running, the signatures matched exactly as without it (diagnostic, 100 of 100 against 99 of 99). The zero failures rest on the signature definitions in item 2. Every number is exploratory. Full report: [G2.md](G2.md).

| # | Question (hard rule 12) | Why it matters | Recommendation |
|---|---|---|---|
| 1 | **Accept G2 and merge M2**, which unlocks M3 (HANDOFF §9)? | G2 is the event-instrument gate; M3 to M7 stay locked until you approve it | **Yes** |
| 2 | **P12: ratify the B2 signature definitions** (DR-0053)? Platform events are attributed by AutomationId (the DOM id), then name, AriaRole, LiveSetting or MSAA role. Each gating canary needs the DOM and platform components listed in DR-0053; K4 also needs EVENT_OBJECT_SHOW on the dialog, made required after the smoke run. P9's "same frame" means a fill within one 60 Hz frame (1000/60 ms) | They decide what counts as a B2 match, and G2's result rests on them. They were fixed before the G2 runs, and the raw evidence allows re-scoring under another reading without new runs | **Yes** |
| 3 | **Make P9 final** for polite regions filled after load (it is provisional)? Same-frame fills count as populated insertions and fills from 50 ms as separate updates. The 350 ms pre-load boundary, the band between one frame and 50 ms, and other roles keep DR-0037's grading until M3 tests them | P9 asked G2 to confirm it against the NVDA-absent signatures. It agrees: same-frame fills gave no separate update (0 of 20), fills from 50 ms gave one (50 of 50), matching NVDA's speech. It decides K6 grading in M3 and M5 | **Yes** |

**For information (no decision needed):**

- **P3:** the approved hook ranges were sufficient and stay unchanged.
- **Interruption and queueing** stay out of C's primary scope (D13).
- **Chrome's 150 ms serialisation window** shows as a delay, not a merge. Fills at 50–150 ms reached the platform at about 165 ms, still separate from the insertion, so M5's oracle windows must allow for a rapid follow-up update arriving up to about 150 ms late.
- **Activation:** the NVDA-absent leg's click adds a STATECHANGE on the activating button. It falls outside every signature.
- **Runner time:** 228 job-minutes at £0.
- **Evidence:** `results` branch, `g2/` (SHA-256 `f6205c7e…0256d`).
