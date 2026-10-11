# M7 second-round mining feasibility plan (2026-10-11)

EXPLORATORY. Recorded before new searches. Authority: P39, P22, DR-0092 and the correction in DR-0093. This pass tests whether the 18 new distinct mined patterns can be sourced; it does not execute or score confirmatory items.

## Search and stopping rules

Repository order: `radix-ui/primitives`, `adobe/react-spectrum`, `mui/material-ui`, `carbon-design-system/carbon`, `microsoft/fluentui`, `tailwindlabs/headlessui`, `vuetifyjs/vuetify`, `palantir/blueprint`.

For each repository, query GitHub issues with `is:issue is:closed regression accessibility`, then `is:issue is:closed regression keyboard`. Sort by creation date ascending. Read at most 30 search hits per query; select at most three new unique issues from each query after excluding all entries in `corpus/oss-candidates.json` and duplicates in this pass. The documentary cap is 48 new issues. Stop after these sixteen queries; do not substitute searches based on G4 misses. Log empty queries, duplicates and rejected candidates. This bounded pass can report fewer than 48 candidates.

Read each selected issue and its linked fix. Follow release/source history where the issue supports a regression of working accessible behaviour. Do not infer an acceptance from a closed issue or a keyword match. Record `rejected`, `pending documentary`, or `documentary candidate`; reserve `verified` for P22 reproduction evidence. Record exact good/broken/fixed releases only when supported, with links. Existing verified or rejected pairs do not count as additions.

## Verification and effort boundaries

P22/DR-0063 governs: permissive licence; documented, merged library fix; published releases of one package with compatible pinned dependencies; reproducible user-facing symptom mapped to the existing primary analysis; an accessible last-good construct; keyboard reproduction; checks derived from the issue/fix, not an arm oracle. No local execution of third-party fixture code. Reproduction uses `m3-oss-repro.yml` with install scripts disabled and no secrets. Do not run an existing test-split fixture. For this first bounded pass, allow at most three new fixture candidates and two reproduction dispatches; report the remaining queue explicitly. Do not change workflow safeguards or the frozen protocol merely to fit the pass.

Record documentary findings in a separate ledger under `docs/research/`; do not add unverified candidates to the frozen corpus or assign them to test. Any qualifying additions later need distinct mechanism/context identities, benign twins and unchanged controls for new journeys. All original dev/test assignments remain intact. A new owner freeze tag precedes confirmatory execution/scoring.

## Deliverables and decision

A source-linked candidate ledger, search log, and feasibility report: counts by stage, verified additions versus the target of 18, unresolved release/reproduction requirements, actual CI dispatch count and evidence-backed effort implications. If fewer than 18 qualify, report a shortfall rather than relaxing rules or reviving dropped seeded patterns. No new application context, base edits, detection rules or target count are introduced by this pass.

## Owner-authorised Calendar repeat (2026-10-11)

After the bounded pass used its two dispatches (one setup failure and one successful reproduction), the owner explicitly requested an independent repeat of the Calendar check. One additional exploratory dispatch, run 38174572204 on `0b5e0a1`, uses the unchanged fixture, releases, pinned dependencies and check criterion. This is a follow-up to the completed bounded pass; its original search and two-dispatch limits remain the historical record. No new search, split assignment or confirmatory execution is authorised by this repeat.
