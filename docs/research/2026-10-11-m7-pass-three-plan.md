# M7 mining pass three plan

EXPLORATORY. Owner authorised the broader search after pass two. Recorded and committed before new queries. Retain P22/P39, existing primary vocabulary and 77-test-pattern target; no selection from G4 misses.

Repository order: radix-ui/primitives, adobe/react-spectrum, mui/material-ui, microsoft/fluentui. Two queries per repository: `is:issue is:closed regression in:title`, then `is:issue is:closed label:regression`. Sort by creation date ascending; inspect at most 30 hits per query. Locally retain issues whose body contains a case-insensitive keyboard/accessibility term: keyboard, accessibility, accessible, screen reader, aria, focus, tab, enter, or space (word boundaries for tab/enter/space). This two-stage approach avoids GitHub's global `in:` qualifier applying title and body restrictions ambiguously.

Exclude every registry candidate/rejection, all earlier M7 ledger entries and issues named in the original survey/verification notes. Select at most three new unique eligible issues per query, deduplicating across queries. Stop after eight queries or 24 selected issues; log empty queries, exclusions, body-filter failures and eligible candidates not selected after the cap. No query substitution after results.

Read selected issues, comments, timelines and linked fixes. Preserve exact sources and disposition: rejected, pending documentary or eligible for reproduction. Require the accessible last-good, compatible stable one-package pair, merged fix and issue-derived keyboard symptom under P22. At most two new fixtures and two existing-workflow exploratory dispatches, with prior safeguards and existing-job overhead disclosed. No local third-party execution or assigned test-item execution. Any admitted addition gets twin/control and test assignment under P39. No new freeze tag. If availability remains short, report it without relaxing context, criteria or count.

Deliverables: source-linked JSON/Markdown ledger, search counts and feasibility result, plus DR record. Previous four documentary leads remain separate; do not count them again.

## Selected reproduction, before dispatch

DateField #8637: merged revert #8684 undoes leading-zero suppression in #8447. Published @react-aria/datepicker source has the suppression in 3.15.0, absent in 3.14.5 and 3.15.1. The corresponding reported umbrella package @adobe/react-spectrum releases are last good 3.42.2, first broken 3.43.0, fixed 3.44.0. Use React/react-dom 18.3.1 (predates all). A labelled en-US DateField begins empty; the issue comment's continuous `01011970` sequence must produce `1970-01-01`. Tab to first segment, then type without manual segment moves. A pointer-start control clicks that segment before the same typing sequence. Run up to two dispatches under the recorded cap, preserving failures. No assigned corpus item is executed or admitted by this reproduction alone.

## Second-dispatch diagnostics, before dispatch

Run 38176937862 reproduces once: good/fixed produce 1970-01-01, broken produces 0970-10-11, both from Tab and pointer-start. Keep that criterion unchanged. The second permitted dispatch repeats it and adds diagnostics: existing accessibility-tree virtual-cursor browse goal `1970-01-01`, maximum 60 from document top, and a fresh-page main maxWidth 480 CSS-only twin. These are pre-assignment admission checks, not changed oracles or real NVDA evidence. Only admit if they agree with the original behaviour. First-run outputs stay preserved. No assigned test item is executed before a new tag.
