# M8 working-only recovery implementation

P41/DR-0116 approved through PR16 merge and “Merged, please continue”. One dispatch, two Windows legs, 60 minutes each, three base-only repetitions; no retry or controlled-page repeat.

- [x] Strict request schema selecting exactly the four missing working releases; portable rejection tests.
- [x] Share the validated case selection between the existing builder and launcher; retain all early/late diagnostic semantics.
- [x] Separate push-triggered workflow, with no manual trigger and no rerun attempts. Original P40 workflow stays disabled.
- [ ] Local lint/typecheck/tests and ordinary CI, including PowerShell request/path validation without building fixtures.
- [ ] Commit exactly one recovery request after checks pass; retain every job/build/attempt regardless of result.
- [ ] Download, audit, archive and report; disable the consumed recovery workflow. No further dispatch.

The complete accepted partial P40 archive is published on results at dbf0fc2. Estimated incremental model work remains tens of thousands of tokens within the owner-monitored cap. Original M7 source/corpus/oracles/trigger files, scores and freeze tag remain unchanged.
