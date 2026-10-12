# M9 registered evaluation implementation (P42)

P42 was approved through PR19 merge and “Merged, please proceed with my approval” (DR-0120). The budget is one dispatch with two Windows legs, 60 minutes each, and three base-only repetitions. There is no retry.

- [x] Register the fresh owned controls, journeys, criteria and checksums before cursor v2 exists. This is pushed as its own commit.
- [x] Build cursor v2 test-first in a separate module, beside an unchanged v1. Development acceptance: replaying the M8 owned tree reaches Chosen Alpha, and all existing tests pass.
- [x] Add calibration case fields for the cursor model and the full-tree focus read. M8 cases keep their behaviour and labels, and each case carries its own approval label.
- [x] Add a strict P42 request and plan selecting the three cases per leg. Add portable rejection tests, and extend the build script to copy the owned controls.
- [x] Add a separate push-triggered workflow with no manual trigger, no rerun attempts and a static two-job, 120-minute budget test. P40 and P41 stay disabled.
- [x] Run lint, typecheck, tests and ordinary CI. Then commit exactly one request.
- [x] Download, audit, analyse against the registered rules, archive and report. Then retire the workflow. No further dispatch.

The estimated model work is tens of thousands of output tokens, single-agent, plus one independent gate review. The M7 corpus, oracles, triggers, scores and `protocol-freeze-v4` stay unchanged.

Pre-dispatch CI 38315076817 passed at `b750282`: lint, typecheck, the PowerShell P42 selection check, 819 tests and the listener build. The analysis script was committed at `f545d29`, before the dispatch. Under DR-0120, exactly one request is committed now, with no retries.

Run 38315343825 completed in both legs: 20 valid blocks and 60 attempts. Every registered prediction held. The workflow is retired in source and disabled in GitHub. The archive is verified and prepared locally. Report: docs/reports/M9-registered-evaluation.md; DR-0121.
