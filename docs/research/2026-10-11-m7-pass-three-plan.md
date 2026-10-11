# M7 mining pass three plan

EXPLORATORY. Owner authorised the broader search after pass two. Recorded and committed before new queries. Retain P22/P39, existing primary vocabulary and 77-test-pattern target; no selection from G4 misses.

Repository order: radix-ui/primitives, adobe/react-spectrum, mui/material-ui, microsoft/fluentui. Two queries per repository: `is:issue is:closed regression in:title`, then `is:issue is:closed label:regression`. Sort by creation date ascending; inspect at most 30 hits per query. Locally retain issues whose body contains a case-insensitive keyboard/accessibility term: keyboard, accessibility, accessible, screen reader, aria, focus, tab, enter, or space (word boundaries for tab/enter/space). This two-stage approach avoids GitHub's global `in:` qualifier applying title and body restrictions ambiguously.

Exclude every registry candidate/rejection, all earlier M7 ledger entries and issues named in the original survey/verification notes. Select at most three new unique eligible issues per query, deduplicating across queries. Stop after eight queries or 24 selected issues; log empty queries, exclusions, body-filter failures and eligible candidates not selected after the cap. No query substitution after results.

Read selected issues, comments, timelines and linked fixes. Preserve exact sources and disposition: rejected, pending documentary or eligible for reproduction. Require the accessible last-good, compatible stable one-package pair, merged fix and issue-derived keyboard symptom under P22. At most two new fixtures and two existing-workflow exploratory dispatches, with prior safeguards and existing-job overhead disclosed. No local third-party execution or assigned test-item execution. Any admitted addition gets twin/control and test assignment under P39. No new freeze tag. If availability remains short, report it without relaxing context, criteria or count.

Deliverables: source-linked JSON/Markdown ledger, search counts and feasibility result, plus DR record. Previous four documentary leads remain separate; do not count them again.
