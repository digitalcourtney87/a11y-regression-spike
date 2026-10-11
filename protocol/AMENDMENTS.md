# Protocol amendments

## Purpose

This file records every change made to the frozen set after the freeze (Gate G3, M6), with its justification (HANDOFF §11). The frozen set is the tracked files under every path listed in `protocol/frozen-paths.txt` (DR-0033). Besides `protocol/` itself, it covers the corpus, journeys, fixtures, harness source, listener and workflows, and the pins and scripts in `env/env.lock.json`, `package.json`, `package-lock.json` and `.nvmrc`. For every amendment, the results report presents **both** the original analysis, as frozen, and the amended analysis, so readers can see what the change did.

Rules:

- **Scope.** An amendment is any change, after the first freeze tag (`protocol-freeze-v1`) exists, to a tracked file under a path listed in `protocol/frozen-paths.txt`, including a change to the list itself (DR-0028, DR-0033). Amendments are not limited to files under `protocol/`: a post-freeze change to, for example, `corpus/`, `harness/src/`, `env/env.lock.json` or `package-lock.json` is an amendment too. Changes before the freeze are ordinary development and are not recorded here.
- **Owner approval.** Every amendment needs the owner's approval before it takes effect (HANDOFF §4 rule 12).
- **Hash and tag.** The protocol hash covers every tracked file in the frozen set, so changing any frozen path changes the hash. This file also lies inside `protocol/`, so recording an amendment changes the hash too. The scorer then refuses to score the test split, and the runner refuses to execute test-split items (DR-0034), until the owner creates a new annotated freeze tag, `protocol-freeze-v<N+1>`, recording the new hash (DR-0028, DR-0033). The original analysis stays reproducible from the earlier tag.
- **Disclosure of test-split exposure.** Each amendment states whether any test-split item had been executed or scored when the change was proposed, and what had been seen. A change made after seeing test-split results is reported as such and never presented as pre-registered.
- **No silent changes.** INCONCLUSIVE results are never converted by hand, and an amendment cannot re-label past verdicts (HANDOFF §4 rule 7).

## Entry template

Copy this block for each amendment, numbered A-001, A-002 and so on.

```markdown
### A-NNN: <short title>

| Field | Value |
|---|---|
| Date | YYYY-MM-DD |
| Proposed by | <name> |
| Owner approval | <name, date> |
| Freeze tag before | protocol-freeze-vN (protocol-sha256: <hash>) |
| Freeze tag after | protocol-freeze-vN+1 (protocol-sha256: <hash>), created by the owner |
| Files and sections changed | <paths in the frozen set and section names> |
| Related decision records | <DR-NNNN> |

**Change.** <Exact before and after text, or a reference to the diff between the two tags.>

**Justification.** <Why the change is needed, and why it could not wait for a later study.>

**Test-split exposure when proposed.** <Had any test-split item been executed or scored? By whom? What results, if any, had been seen?>

**Impact on analyses.** <Which hypotheses (H1–H4), arms, metrics or thresholds the change affects.>

**Reporting.** <Where the results report presents the original analysis and the amended analysis side by side.>
```

## Amendments

### A-001: Let the runner execute the test split, and pre-register the soak

| Field | Value |
|---|---|
| Date | 2026-10-11 |
| Proposed by | Implementation, on the owner's instruction to start M7 |
| Owner approval | Courtney, 2026-10-11 ("If M7 is next, please proceed") |
| Freeze tag before | protocol-freeze-v1 (protocol-sha256: 1d80884ecba3ed388138c9851b69ea3bed2ca69e749202c694148d134e09bd07) |
| Freeze tag after | protocol-freeze-v2. The hash is the tag message. It is not copied here, because this file is inside the hash. |
| Files and sections changed | `protocol/PROTOCOL.md` (status, §7, new §8), `protocol/AMENDMENTS.md`, `harness/src/runner/itemRun.ts`, `harness/src/runner/buildApp.ps1`, `harness/src/score/devReport.ts`, `harness/src/score/scoreRuns.ts`, `.github/workflows/m4-items.yml` |
| Related decision records | DR-0090 |

**Change.** The item runner takes `--split dev|test` and defaults to dev. `test` selects test-split items; `assertItemExecutable` still refuses them unless the latest freeze tag matches. Evidence blocks and the scorer's report say CONFIRMATORY for the test split and EXPLORATORY for the dev split. `buildApp.ps1 -Split` builds that split's candidates, including a mined pair's broken release when the split is test. The workflow passes `split` and defaults to dev. `PROTOCOL.md` §8 pre-registers the soak: 600 K1 attempts per leg, and one corpus pass at the frozen attempt counts.

**Justification.** `protocol-freeze-v1` allows the test split, but the runner still selected only dev items and the build step never built a test candidate. M7 cannot run without this. No oracle, trigger, threshold, journey or corpus item changes.

**Test-split exposure when proposed.** None. No test-split item had been executed or scored, and no test-split result had been seen.

**Impact on analyses.** None on the statistics. The test split becomes executable. The soak size is fixed before the run.

**Reporting.** The G4 report is the first test-split analysis. There is no earlier test-split analysis to set beside it. Dev results stay the exploratory report from `protocol-freeze-v1`.
