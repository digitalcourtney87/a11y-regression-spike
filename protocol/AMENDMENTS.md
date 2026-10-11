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

### A-002: Fetch the freeze tag, and stop the confirmatory report describing itself as dev

| Field | Value |
|---|---|
| Date | 2026-10-11 |
| Proposed by | Review on PR #11 (Codex and Devin) |
| Owner approval | Courtney, 2026-10-11 (asked for a response to that review) |
| Freeze tag before | protocol-freeze-v2 (protocol-sha256: 23dc31a3809ce3b6757019a2ac49156ed4958df83f93ca64df389d52c338d3bb) |
| Freeze tag after | protocol-freeze-v3. The hash is the tag message. It is not copied here, because this file is inside the hash. |
| Files and sections changed | `.github/workflows/m4-items.yml`, `harness/src/runner/itemRun.ts` (job summary label), `harness/src/score/devReport.ts` (test-split wording), `protocol/AMENDMENTS.md` |
| Related decision records | DR-0091 |

**Change.** The items job fetches tags and stops before the build if a test job has none. `--split test --journeys` keeps the job summary EXPLORATORY. The test report no longer says the oracles were developed on that split, and it omits power rows computed from the scores being reported. A test dispatch that leaves `apps` at the dev default is rewritten to the apps that have test items. A tag push no longer starts this workflow.

**Justification.** Run 38155512025 built candidates and then refused every test item, because the checkout had no freeze tag. The other edits stop a journey run being labelled confirmatory and stop the G4 report presenting test scores as a dev sample-size plan.

**Test-split exposure when proposed.** Run 38155512025 selected test items. The guard refused each one before a block, canary or attempt. A downloaded summary (`items-atomic-crm-nvda-absent-shard4`) records the refusal and no blocks. No arm verdict was produced, and nothing was scored. The run was cancelled.

**Impact on analyses.** None on the statistics. The test report's power section no longer offers a sample size computed from the confirmatory scores.

**Reporting.** There is still no test-split analysis. Dev results stay the exploratory report from `protocol-freeze-v1`.

### A-003: Exploratory second-round mining fixture

| Field | Value |
|---|---|
| Date | 2026-10-11 |
| Proposed by | Codex |
| Owner approval | Owner instruction to proceed with the bounded mining feasibility pass, 2026-10-11; confirmatory execution still awaits the owner's freeze tag |
| Freeze tag before | protocol-freeze-v3 (`protocol-sha256: 508302c493d1e35225fc409ea4d01c3c7e4b7b982c819efedac4783627d60ab2`) |
| Freeze tag after | None; this branch is not frozen for confirmatory execution |
| Files and sections changed | `fixtures/oss/fluent-4620/`; this amendment entry |
| Related decision records | DR-0092, DR-0093; `docs/research/2026-10-11-m7-mining-plan.md` |

**Change.** Add an unsplit exploratory fixture for Fluent UI issue #4620, checking whether one Space press advances the Calendar exactly one month. Source inspection suggests last good 5.40.2, first broken 5.41.0 and fixed 5.90.0; reproduction must establish the behavioural boundary. No corpus item or pattern is registered or assigned by this amendment. The check uses the issue and fix's expected behaviour, independently of the arm oracles.

**Justification.** The pre-registered second round needs new qualifying mined patterns. The bounded feasibility pass checks this candidate before any split assignment; it does not count an unverified candidate toward 77.

**Test-split exposure.** G4's 145-item confirmatory run and all five comparison intervals have already been seen. The search plan was recorded before new searches and did not select from G4 misses. This exploratory check is not represented as pre-registered before G4.

**Analysis and execution.** The accepted G4 analysis remains reproducible at `protocol-freeze-v3`. The new fixture is run only by the exploratory mining workflow, before any test assignment. No amended confirmatory analysis exists. Oracles, triggers, thresholds and original split assignments are unchanged. The owner must tag the amended tree before any subsequent confirmatory execution or scoring.

**Pre-split setup repair.** Run 38173756427 installed and built all three releases, but each page failed to render because `Calendar.strings` was null. The fixture now supplies the documented English `ICalendarStrings` fields identically on all releases. The one-month criterion and release pins are unchanged. These errors are setup failures, not regression observations (P22 rule 8).

**Exploratory outcome.** The repaired fixture in run 38174040191 (`d50c8c2`) reproduces the good/broken/fixed keyboard boundary once, with pointer controls passing and no page errors or external requests. The first dispatch was cancelled by the replacement run after its candidate artifact completed. The two-dispatch budget is exhausted; independent successful repetition and corpus admission remain outstanding (DR-0094). No confirmatory verdict or split assignment was produced.

**Owner-authorised follow-up.** DR-0095 records run 38174572204, an independently successful repeat with unchanged fixture and execution paths. Both successful runs give identical check output and resolved dependency locks. The earlier bounded pass still used two dispatches; this additional dispatch was explicitly requested by the owner. Corpus admission remains outstanding, and no new freeze tag or confirmatory execution occurs.

### A-004: First second-round mined pattern

| Field | Value |
|---|---|
| Date | 2026-10-11 |
| Proposed by | Codex |
| Owner approval | Owner “Please proceed” after the Calendar admission recommendation; P39/P22 |
| Freeze tag before | protocol-freeze-v3 |
| Freeze tag after | None; confirmatory execution awaits a new owner tag |
| Files changed | `fixtures/oss/fluent-4620/check.mjs`, `corpus/oss-candidates.json`, `corpus/patterns.json`, `corpus/split.json`, three Calendar items, twin spec/patch, `journeys/oss-fluent-4620.json`; this entry |
| Decision | DR-0096 |

**Change and exposure.** G4 outcomes are known. Add accessible-month and benign-layout diagnostics before assignment, then register one qualifying Calendar pattern, a benign twin and unchanged control. The issue-derived criterion is unchanged. Assign the addition explicitly to test; preserve old assignments. Use the frozen journey vocabulary and JOURNEY_BLOCKED symptom; no oracle, trigger, threshold or scoring rule changes. The original G4 items and misses did not select this candidate. The branch's frozen-set hash changes; protocol-freeze-v3 retains the original G4 evidence. No assigned test item is executed or scored and no new tag is made.

### A-005: Pass-three exploratory DateField fixture

Owner authorised proceeding with the broader bounded search after pass two, 2026-10-11. G4 outcomes are known. Add unsplit `fixtures/oss/ras-8637/` using the issue's continuous leading-zero typing criterion, before any corpus assignment. Follow the pass-three recorded plan, P22 and existing workflow safeguards. No oracle, threshold, trigger, corpus assignment or new tag changes. The branch's frozen hash changes; confirmatory execution still requires a new owner freeze tag. Original G4 evidence remains at protocol-freeze-v3.

### A-006: Second second-round mined pattern

| Field | Value |
|---|---|
| Date | 2026-10-11 |
| Proposed by | Codex |
| Owner approval | Owner instruction to proceed with the broader pass; P22/P39 |
| Freeze tag before | protocol-freeze-v3 |
| Freeze tag after | None; assigned execution awaits a new owner tag |
| Files changed | `fixtures/oss/ras-8637/check.mjs`; registry/pattern/split files; DateField regression, twin/control items and twin spec/patch; `journeys/oss-ras-8637.json`; this entry |
| Related decision | DR-0098 |

**Change and exposure.** G4 outcomes are known. Add browse-outcome/CSS-twin diagnostics preserving the issue's original criterion, then admit the qualifying DateField pattern to test with twin/control after two exploratory reproductions. Prior assignments and items stay unchanged. Existing primary vocabulary and journey strategies represent the outcome; no oracle, trigger, threshold or scoring-rule changes. Original confirmatory misses did not select the candidate. Frozen-set hash changes; the original G4 evidence stays at protocol-freeze-v3. No assigned test item is executed or scored and no new tag is created.

### A-007: Batch-four exploratory controlled DataGrid fixture

2026-10-11; owner instruction to finish test patterns under P39/P22. G4 outcomes are known. Add unsplit `fixtures/oss/fluent-27997/` from issues #27997/#27896 and merged fix #27978; issue-derived row selection plus equivalent width-only twin diagnostic. No registry/split admission yet, oracle/trigger/threshold change or new tag. Assigned test fixtures remain excluded by the existing mining workflow. Preserve original G4 evidence at protocol-freeze-v3; new confirmatory execution remains gated on an owner tag.

Batch-four A-007 follow-up: repair DataGrid render-function setup uniformly (P22 rule 8), without changing the criterion, and add unsplit `fixtures/oss/vuetify-22770/` from the issue/fix's keyboard-wrap scenario, on two releases sharing Vue 3.3.4. Plain JavaScript rendering uses existing vanilla build mode, with no execution/security safeguard change. No assignment or new tag. Preserve first setup failure and all later check outcomes.

### A-008: Third second-round mined pattern

2026-10-11; owner instruction to finish patterns under P39/P22. G4 outcomes are known. After two identical exploratory reproductions, register Vuetify #22770, append its test assignment, version-pair item, benign width-only twin and unchanged control, and add `journeys/oss-vuetify-22770.json`. Registry/pattern/split and new item/spec/patch files change the frozen set. Existing assignments/items and oracle/trigger/threshold/scoring definitions stay unchanged. No original misses select this issue. Actual assigned execution/scoring awaits a new owner freeze tag; original G4 evidence remains at protocol-freeze-v3. Related record: DR-0099. DataGrid setup repairs in the unsplit fixture are retained as P22 pre-assignment diagnostics, with original criterion unchanged and no alternate path within a failed check.

A-007 further unsplit exploratory work: refine DataGrid's source-supported release boundary after 9.20.0 is disproved as last good; add `fixtures/oss/mantine-2503/` from issue #2503/fix #2602 under the owner completion instruction and recorded batch-six plan. Same direct framework pins per pair, original criterion, existing safe workflow and no assigned test execution/new tag. No oracle, trigger or threshold changes. Failed boundary hypotheses remain in evidence.

### A-009: Fourth second-round mined pattern

2026-10-12; owner instruction to finish test patterns, P22/P39; DR-0100. G4 outcomes are known. After independent matching reproductions, append Fluent DataGrid #27997 to the frozen set as a test regression pair with CSS_ONLY twin and unchanged control, plus its journey. Registry/pattern/split, three new items and twin spec/patch change. Preserve prior assignments/items and detection/scoring definitions. The earlier false last-good hypothesis and setup failures remain recorded. No selection from G4 misses. Actual assigned execution/scoring awaits a new owner freeze tag; G4 evidence remains at protocol-freeze-v3.

A-007 further unsplit work, batch seven: add Vuetify #21591 from its reported 3.4.9/3.4.10 boundary and fix #22242. Shared Vue 3.3.8, original zero-delay keyboard-menu criterion, ordinary render-function fixture in existing vanilla build mode. No assigned execution or changed oracle, threshold, security context or tag. The later fixed release is documentary only because its framework requirements differ.

A-007 batch-nine unsplit candidate: react-select #4421's reported 3.2.0/4.0.2 grouped filtered-navigation failure, fixed source in 4.1.0 (#4422), shared React/react-dom16.14.0. Original filter 'o', then one ArrowDown must focus the next rendered option Orange, and Enter chooses Orange. No altered criterion after observations; ordinary supported labeled select, safe existing workflow, no new tag or assigned execution. Retire unqualified Mantine fixture from the workflow directory; its exact source remains in git at f028211 and failed checks are retained.

A-007 batch-eight pre-assignment setup repair: first menu run 38183361845 keeps the good menu open but focuses the VList container, not an interactive Item 1. The modern fix's string-only item example is not an interactive selectable-list construct on the older releases. Published VListItem source requires link/value for focusability, and the list root's default tabindex is itself focusable. Supply explicit item values/link and null root tabindex uniformly; retain the exact one-ArrowDown Item 1 focus/open/visible criterion, pins and check. This is setup construction under P22 rule 8, not a successful reproduction or changed outcome definition. Keep first failed check outputs.
