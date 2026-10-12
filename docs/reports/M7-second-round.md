# M7 second-round confirmatory run

Status: dispatched; results pending.

The owner instructed “Please proceed” after the freeze/test/report sequence on 2026-10-12. PR13 merged at `22bbb9a2476fff62b34ac9de266a23ad9abfef22`. Annotated `protocol-freeze-v4` points to that exact commit and records:

`protocol-sha256: 65e188e8b79471aaa42713aaf4a635ef87696e894c4e7918b140ac77ffff9a5a`

The repository freeze guard accepts this test split. Previous freeze tags are preserved.

## Execution and analysis plan

Run [38276928082](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38276928082) uses `m4-items.yml` at `protocol-freeze-v4`: 18 newly admitted mined patterns, their 18 CSS_ONLY twins and 18 unchanged controls, in both NVDA legs (36 Windows jobs plus plan). Both sides, default frozen repetitions, axe enabled and K1 bracketing enabled; one shard per app. The 54 selected item ids are exactly the item paths added since `protocol-freeze-v3`. No old items are re-executed.

Combine this run with original run38156720011 using the unchanged scorer under v4. Expected complete test set:199 items (77 regression,77 benign,45 unchanged),398 item/leg blocks. Preserve first-round G4 report and its decisions; report amended analysis separately. Frozen headline comparisons use symptom-uniform pattern bootstrap,10000 resamples,seed20261005, and the original0.08 equivalence margin. No post-outcome oracle, trigger, journey, threshold or verdict edits. Failures and incomplete evidence are retained and reported; no outcome-driven reruns.

The accepted soak38155513822 remains separately identified; no new soak is dispatched. M8 remains unauthorised.
