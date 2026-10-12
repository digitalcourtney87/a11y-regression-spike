# G4 brief (one page)

**Second-round update (2026-10-12):** the77-pattern analysis is in [G4-second-round-brief.md](G4-second-round-brief.md). This accepted first-round record is preserved.
**Result:** the owner approved all seven items on 2026-10-11 (DR-0092). Corpus run [38156720011](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38156720011) on `protocol-freeze-v3` (`8082479`; `protocol-sha256: 508302c493d1e35225fc409ea4d01c3c7e4b7b982c819efedac4783627d60ab2`). 145 items, both legs, 0 fatals. Soak run [38155513822](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38155513822): 0 K1 failures in 599 valid attempts per leg. Full report: [G4.md](G4.md).

| # | Question (hard rule 12) | Why it matters | Recommendation |
|---|---|---|---|
| 1 | **Accept the five headline calls** as this round's record? B2 versus B is a difference (+0.079; 0.012 to 0.132). D versus C, union, is equivalent within 0.08 (−0.012; −0.042 to 0.000). C versus B2, both rules, and D versus C, adjudicated, are inconclusive | These are the pre-registered comparisons. The intervals were computed from the frozen scores with the §3 bootstrap; the frozen renderer does not print them | **Yes** |
| 2 | **Treat the second round as triggered** and add 18 regression patterns, 59 to 77, with the size left at the dev table's 77? | PROTOCOL §3. Three comparisons are inconclusive. The size is not recomputed from these counts | **Yes** |
| 3 | **Choose those 18 as P39 proposes?** Same method as the first 59: catalogue operators on controls that do not already carry them, in the two SPA contexts, plus mined pairs that pass P22; a benign twin each; an unchanged control when the journey is new; test split. The symptoms this round missed do not choose the operators or the controls. No execution until you tag the amended tree | The count is pre-registered. Which regressions are added still decides what the second round measures | **Yes** |
| 4 | **Leave the oracles, triggers and thresholds as frozen?** | Changing them from this split would retune detection on confirmatory data | **Yes** |
| 5 | **Leave the scorer unamended for this round,** with the difference intervals kept in the gate report? | Adding the interval to a frozen path now would be an amendment after the test split was scored. A later amendment has to disclose that | **Yes** |
| 6 | **Archive this corpus run and the soak** to the `results` branch after you accept the gate, with a SHA-256 manifest and no NVDA binaries? | D6. The raw evidence is what a later reading can re-score | **Yes** |
| 7 | **Leave M8 unstarted,** and leave the Phase 1 proceed/stop decision on 27 November 2026? | M8 is outside the authorised scope. The date is DR-0003 | **Yes** |

**For information (no decision needed):**

- False FAILs are 0/59 benign and 0/27 unchanged, in every arm.
- The rule model (PROTOCOL §4) chooses rule 1 on the dev split for both combination rules. On the test split, C detects and the rule does not in 3/59 items (Wilson 1.7%–13.9%), under both rules. It does not change a verdict.
- `ras-busy-left-true-notification` is PASS in every arm, which is the frozen limit in PROTOCOL §6.
- The soak's phase0 renderer prints a G1 failure because K2–K5 were absent. That line is the G1 rule.
- **Cost:** this draft is single-agent. The Windows runs have already finished. The pattern build is the next model spend, and it is authorised.

**Build-allocation correction (2026-10-11, DR-0093):** item 3 above is retained as the approved recommendation. DR-0092's later five-seeded-plus-thirteen-mined allocation was incorrect: the five seeded entries had already been dropped on base-only evidence. The existing catalogue has no unused non-dropped patterns. The 18 additions require new qualifying mined patterns under P39/P22; their availability is not established. See [DR-0093](../DECISIONS.md#dr-0093-correction-of-the-second-round-build-allocation).
