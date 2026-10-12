# M9 gate brief

2026-10-12. [Report](../reports/M9-registered-evaluation.md).

P42/DR-0120's single dispatch is consumed by run 38315343825. It used exactly two Windows jobs, which took 16m49s in total, against a cap of 120 runner-minutes. The run produced twenty valid exploratory blocks from 60 base-only attempts, and all 40 K1 brackets pass. There were no retries. The workflow is retired in source and disabled in GitHub.

Every registered prediction holds in 3/3 repetitions:

- **Rule 1:** cursor v2 is accepted for future registered studies.
- **Rule 2:** the focus readers stay unchanged.

| # | Yes/no decision | Reason | Recommendation |
|---|---|---|---|
| 1 | Accept the M9 evidence and its stated limits? | v1's stall reproduced and v2 cleared it on the marker control. v2 also cleared the generated-text stall, and it matched v1 on the plain page. All focus readers matched NVDA's focus speech. Limits: C3 did not exercise ignored wrappers; v2 still segments lines differently from NVDA; this is one environment with eight owned controls. | Yes |
| 2 | Record v2 as the cursor model for any future registered study, keeping v1 as the frozen M7 model? | Rule 1 passed as registered. M7 stays measured with v1 under `protocol-freeze-v4`, with no rescore. Using v2 in a study still needs that study's own registration or freeze. | Yes |

**Reader decision.** DR-0120 item 3 already settled what happens when the readers agree with NVDA, so it needs no new owner decision. They did agree, so the Vuetify goal failure stays a journey-goal limit. Separately, owned markup with a hidden label and an `aria-hidden` copy reproduces Vuetify's "edit blank" signature exactly. That shows the mechanism is sufficient for the symptom, not that Vuetify uses it.

**Cost and archive.** M8 and M9 together used 50m29s across six jobs. Model effort is estimated at tens of thousands of output tokens, plus one gate review. The 40-file raw archive is verified (SHA-256 `5a4fadb4…`) and will be published on results under D6 after acceptance.

No further run is requested. The Phase 1 decision remains on 27 November 2026.
