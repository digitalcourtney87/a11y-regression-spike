# Protocol amendments

## Purpose

This file records every change made to the frozen protocol after the freeze (Gate G3, M6), with its justification (HANDOFF §11). For every amendment, the results report presents **both** the original analysis, as frozen, and the amended analysis, so readers can see what the change did.

Rules:

- **Scope.** An amendment is any change to a file under `protocol/` after the first freeze tag (`protocol-freeze-v1`) exists. Changes before the freeze are ordinary development and are not recorded here.
- **Owner approval.** Every amendment needs the owner's approval before it takes effect (HANDOFF §4 rule 12).
- **Hash and tag.** This file lies inside `protocol/`, so recording an amendment changes the protocol hash. The scorer then refuses to score the test split until the owner creates a new annotated freeze tag, `protocol-freeze-v<N+1>`, recording the new hash (DR-0028). The original analysis stays reproducible from the earlier tag.
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
| Files and sections changed | <paths under protocol/ and section names> |
| Related decision records | <DR-NNNN> |

**Change.** <Exact before and after text, or a reference to the diff between the two tags.>

**Justification.** <Why the change is needed, and why it could not wait for a later study.>

**Test-split exposure when proposed.** <Had any test-split item been executed or scored? By whom? What results, if any, had been seen?>

**Impact on analyses.** <Which hypotheses (H1–H4), arms, metrics or thresholds the change affects.>

**Reporting.** <Where the results report presents the original analysis and the amended analysis side by side.>
```

## Amendments

No amendments: the protocol is not yet frozen.
