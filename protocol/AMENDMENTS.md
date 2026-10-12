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

A-007 grouped-select first attempt38183612490 is an all-release setup failure: copied index.html supplies root but render targeted app, producing React error200 before any behavioral check. Repair the mount target uniformly to root under P22 rule8; leave releases, interactions and original criterion unchanged. Preserve all page errors and unsuccessful checks. Independently repeat repaired Vuetify menu criterion in the next recorded dispatch; neither candidate is assigned yet.

### A-010: Fifth second-round mined pattern

2026-10-12; owner completion instruction and “Please continue”, P22/P39; DR-0101. After two identical successful exploratory reproductions, append Vuetify #21591 as a test version pair, width-only twin, unchanged control and journey. Registry/pattern/split, three new items, twin spec/patch and journey change frozen set after G4 exposure. Retain earlier setup failure and supported pre-assignment repair. Preserve existing items/assignments, context and detection/scoring rules. No selection from original misses; no assigned execution before new owner tag, and no new tag applied.

A-007 batch-twelve unsplit candidate: published @carbon/react1.47.0 uses a native passive-modal close button;1.48.0 introduces IconButton with Tooltip's Escape-consuming handler. This narrows the existing #23126 lead without native-dialog flags; #23157 fixes only the flag escalation and is not claimed as a fix for this default construct. Shared React/react-dom18.2.0 and Sass1.69.7 predate the pair and satisfy peers. Original criterion is one Escape from the library's default close-button focus, with normal close-click control and fresh width-only twin. Standard existing safe build/check workflow, no assigned execution or changed oracle/threshold/context.

A-007 grouped-select second setup failure38211936352: visible placeholder intercepts a direct click on the tiny search input, uniformly across releases. Use the ordinary visible control click surface with the documented classNamePrefix prop. The older supported API exposes highlighted options via focused-option classes/live announcements, not input aria-activedescendant; use that same focused-option marker as the source fix's test for both precondition and observation. Preserve the original Ocean→Orange after one ArrowDown and Chosen Orange after Enter criterion and all pins. No forced click, changed navigation or fallback inside a failure. Record as pre-assignment measurement/setup repair, not admission.

A-007 passive-modal first run38212601361 installs both releases but fails to build: current Vite requires sass.initAsyncCompiler, unavailable in the historically pinned Sass. Replace only the styling import with @carbon/styles/css/styles.css, the published compiled CSS of the same internally declared Carbon styles dependency at release cutoff. Remove the unused direct Sass pin; runtime React pins and criterion remain unchanged. No builder/workflow/tool change. Keep both failed build logs and exit codes; no behavior or admission claimed. Grouped-select repaired check succeeds once in the same run; independent repeat remains required.

A-007 batch-thirteen source follow-up establishes Carbon #7861's zero-index selection boundary: published7.28.0 preserves changes.highlightedIndex,7.29.0 replaces it with changes.highlightedIndex || null, losing index0;7.32.0 contains fix#8178's explicit undefined guard/refactor. Add ordinary MultiSelect.Filterable with shared React/react-dom16.14.0 and internally resolved Carbon CSS, no extra framework variation. Original criterion: after filtering to Alpha, ArrowDown/Enter must select it; pointer option click and fresh width-only twin controls. Existing safe workflow, no assigned execution or new tag, no changed detection/scoring rules. Not admitted before two successful matching reproductions.

A-007 passive-modal CSS attempt38213037408 still fails to build: current minifier rejects a legacy media query in the published bundle's unrelated code-snippet rules. Preserve the complete published CSS as a raw import and install it as a style element, uniformly across releases, so the browser parses the original library stylesheet. No selector edits or builder/workflow change; original React pins and modal criterion remain. Keep both failed build logs. Before grouped-select assignment, consolidate its unchanged Chosen Orange visible feedback into one ordinary text node and add existing-model browse reachability diagnostics, with selection criterion and interactions unchanged. It remains unsplit until independent successful repeat of the final fixture/diagnostics; no scored or NVDA test execution.

A-007 batch-fourteen unsplit fixtures: Chakra #6693 uses reported2.2.8/2.2.9 and source-fixed2.3.4 (editable2.0.11 stabilizes onEdit callback), with identical pre-earliest React/Emotion/motion pins. Original continuous-typing criterion and ordinary supported Editable onChange/onEdit construct. Headless Vue #2084 uses reported1.7.4/1.7.5/fixed1.7.6, shared Vue3.2.41, documented object displayValue with no defaultValue. A normal conditional-render button exposes the same mount failure after an explicit user action: keyboard task must mount, reach Assignee input and choose Beta. The missing input is the observed issue-derived failure, not a repaired precondition or alternate path. Preserve library render errors and reject if no keyboard task failure follows. Existing vanilla Vue render functions/React build mode and safe workflow only, no assigned execution or new tag, no changed scoring definition.

Chakra pre-dispatch setup uses the resulting Text input as the Tab target: supported preview focus enters editing and redirects DOM focus to the input, so measuring the transient preview would be an invalid entry check. Same bounded Tab path, original typing criterion and all pins; recorded before any outcome.

A-007 batch-thirteen outcomes:38213610821 reproduces first-option FilterableMultiSelect good/fixed vs broken, but attempts blocked external Carbon fonts. Apply the same system-font override on every release before assignment; keep library styles, original criterion and pins, and add existing-model browse-goal diagnostics. Repeat twice after this repair. React-select's final ordinary feedback/browse diagnostic passes on good/fixed (line7), fails broken (absent); independent repeat remains needed for final fixture. Passive-modal default path cannot qualify under P22 rule6: #23157 fixes native-dialog cancel escalation, not this non-flag tooltip-Escape path. Retire it without admission and retain source plus all build/check/font-request evidence. Do not enable the flag only to find a passing fix.

A-007 pre-assignment journey construction: frozen PRESS keys do not include Control+A. Chakra's documented default already selects the whole initial text on editing entry; assert that unchanged setup rather than send the redundant Control+A. For Headless input, use the supported native onFocus/onClick props to select its existing text uniformly, yielding the same prepared selection before the original Be/ArrowDown/Enter sequence. No alternative route within a failed check or new driver strategy; original entered/chosen-value criteria and pins remain. Add existing-model browse diagnostics (Entered abc, Chosen Beta). Consolidate FilterableMultiSelect's unchanged Chosen Alpha visible feedback into one ordinary text node because the earlier split nodes do not match the declared existing-model name goal. Final fixtures stay unsplit pending two matching checks/locks and successful browse/twin diagnostics; earlier observations retained.

### A-011: Sixth second-round mined pattern

2026-10-12; owner completion instruction and “Please continue”, P22/P39; DR-0102. Append grouped react-select#4421 as a test version pair, CSS_ONLY twin, unchanged control and journey after two matching final exploratory checks/locks. Registry/pattern/split, three new items and twin spec/patch/journey change frozen set after G4 exposure. Prior assignments/items and measurement/scoring definitions preserved; no issue selected from G4 misses. Assigned execution remains gated by a new owner tag; no tag applied.

A-007 batch-twenty unsplit Bootstrap#39189: native data-api modal with valid HTML colon id, reported5.3.1/5.3.2/fixed5.3.3, same direct Popper2.11.8. Merged fix#39201's modal unit test explicitly supports this construct; earlier maintainer speculation about accidental support is retained, not treated as documentation declaring it inaccessible. Original activation/open criterion plus focused named-dialog goal, pointer and Tab/Enter paths, fresh width-only twin. No escaped-selector workaround between releases. Retain broken release's selector error as issue-derived library behavior; do not replace navigation on failure. Safe existing vanilla workflow, no assigned execution/new tag or changed measurement definitions.

### A-012: Seventh through ninth second-round mined patterns

2026-10-12; owner completion instruction and “Please continue”, P22/P39; DR-0103. Append Carbon FilterableMultiSelect #7861, Chakra Editable #6693 and Headless Vue Combobox #2084 after matching final exploratory checks/locks, accessible result diagnostics and width-only twins. Registry/pattern/split, nine new items, three twin spec/patches and journeys change frozen set after G4 exposure. Prior assignments/items and measurement/scoring definitions remain unchanged. No cases selected from G4 misses, no new strategy/oracle/threshold/context and no assigned execution before a new owner tag. No tag applied.

### A-013: Tenth second-round mined pattern

2026-10-12; owner completion instruction and “Please continue”, P22/P39; DR-0104. Append Bootstrap#39189 after two matching original activation/focused-dialog checks and dependency locks. Registry/pattern/split, three items and twin spec/patch/journey change the frozen set after G4 exposure. Prior assignments/items and measurement definitions preserved. No cases selected from G4 misses; no assigned execution, new tag or M8 work.

A-007 batch-twenty-three unsplit Base UI#5532/#5432: one composite ref-loop defect with reported1.6.0/1.7.0 and published1.8.0 fix#5441. Same compatible React18.2.0 and react-router7.6.2 across versions; original router tabs mount/settle criterion, native Show tabs activation and ordinary Overview focus. Do not upgrade framework after outcomes to manufacture a failure. Pointer control and fresh width-only twin, existing safe workflow only.

A-007 batch-twenty-four unsplit react-datepicker#5428: original same-month arrow navigation must move actual day focus, not just its visual class. Reported first-broken7.0.0; source-supported6.9.0 still propagates containerRef,7.0.0 does not, published8.2.0 contains merged5456 restoration and wrapper ref fix. Treat6.9.0 as a source-supported working hypothesis until checks hold, not a reporter-named last-good. Same direct React/react-dom18.2.0, standard controlled selected Feb19 date, native input Tab then ArrowDown entry precondition, ArrowLeft must focus Feb18. Pointer selection control and fresh width-only twin. Criterion fixed before outcomes; no workaround/fallback or framework change. Base UI gets its independent repeat in this same dispatch; at most two dispatches for batch24 and two total for batch23.

### A-014: Eleventh second-round mined pattern

2026-10-12; owner completion instruction and “Please continue”, P22/P39; DR-0105. Append Base UI router-tab ref-loop pattern after two matching original rendering/focus checks and dependency locks. Duplicate reports count as one defect. Registry/pattern/split, three items and twin spec/patch/journey change frozen set after G4 exposure; prior assignments/items and measurement definitions preserved. No assigned execution, new tag or M8 work.

A-007 batch24 first date-picker attempt38227533511:6.9.0/7.0.0 install/build but fail mounting with React130 because Vite presents the published older CommonJS default as a namespace object;8.2.0 mounts and passes. This is not the reported keyboard regression. Preserve all failed checks. Normalize the default export uniformly (`module.default ?? module`) before assignment, using the exact same component/props on every release. Original pointer/date-focus criterion and entry preconditions remain unchanged; no fallback navigation. Batch24 second dispatch is first repaired check; independent final repeat will be separately recorded if it qualifies.

A-007 batch26 unsplit MUI#46734: original freeSolo text/Enter selection must report foobar rather than undefined; source comments also give empty options/autoHighlight typing-blur trigger and confirm regression after earlier unsupported-combination speculation. Reported7.2.0/7.3.0 pair, merged46894 syncs highlighted index on popupOpen, published7.3.3 contains fix (7.3.2 predates merge and is not called fixed). Same React18.2.0 and Emotion11.14.0 direct pins before earliest release. Standard controlled multiple/freeSolo/autoHighlight/autoSelect, empty options, named Entry, single ordinary Chosen feedback text; keyboard native Tab/type/Enter, pointer focus/type/blur and fresh width-only twin. Criterion recorded before outcomes. Retain actual broken errors if any; no fallback selection or context change. First dispatch shared with repaired date-picker check, separate per-plan dispatch counts retained.

A-007 batch27 unsplit react-modal#732: original Tab containment when first/last button is display:none. Source inspection finds reported3.8.1 already has flawed overflow-visible zero-size logic in3.7.1 and older3.2.1/3.1.13; do not call3.7.1 last-good or invent nonexistent3.8.0. Published3.1.0 predates the overflow logic and is a source-supported good hypothesis,3.11.1 contains merged774 scroll-size guard. Shared React/react-dom16.0.0 (before3.1.0; satisfies all peers), documented modal construct with setAppElement, native opener and two visible buttons between hidden edges. Initial Tab reaches First action, next Last action, next must wrap First action without outside focus events; original never-escape criterion recorded before outcomes. Pointer activation and width-only twin. Ordinary focus-event diagnostic retains any transient escape rather than hiding it with later focus restoration; no oracle or navigation fallback change. Independently repeat only if good/fixed hold.

### A-015: Twelfth and thirteenth second-round mined patterns

2026-10-12; owner completion instruction and “Please continue”, P22/P39; DR-0106. Append react-datepicker same-month actual-focus and MUI empty-option freeSolo selection after matching final original criteria/checks and dependency locks. Registry/pattern/split, six items, two twin spec/patches and journeys change frozen set after G4 exposure. Prior assignments/items and measurement definitions preserved. No assigned execution, new tag or M8 work.

A-007 react-modal initial38229251699: all three installs succeed, builds fail because React16.0 predates automatic JSX runtime. Keep all failures; do not upgrade framework after outcomes. Rewrite the same fixture elements/props with supported React.createElement uniformly, leaving the same component, visibility, original Tab-containment criterion and tools. Batch28 first dispatch checks this repaired construct; its second dispatch may independently repeat, with prior batch27 budget exhausted.

A-007 modal repaired-build38229779177: all versions now build.3.1.0 has no default dialog role in its published Modal.defaultProps, so the named-role entry lookup fails;3.8.1 fails one-Tab wrap while fixed3.11.1 holds. Preserve these outputs. Explicitly set supported role="dialog" uniformly, keeping the same contentLabel, elements, props and Tab criterion. This prepares an accessible supported baseline across releases, not a fallback lookup inside failed navigation. Retain focus-event diagnostic and add actual active tag; do not claim outside DOM focus events when earlier result records none. Batch28 second dispatch becomes first final role-prepared check and may share batch29 first new-fixture dispatch; a final independent repeat needs a separately counted slot.

A-007 batch29 two unsplit fixtures before outcomes. MUI#44048 reported5.10.17 working/5.16.7 broken; published5.16.14 reverts41300 via44857 and restores custom Paper even with empty freeSolo options. Same React18.2.0/Emotion11.10.5, standard custom Paper ordinary No recent searches paragraph, no fabricated interactive options; disablePortal uniformly keeps information in document order. Pointer input click and native Tab/ArrowDown must render it; existing-model browse diagnostic and width twin. Original expected behavior explicitly includes displaying other information in a custom Paper. Carbon#8392 reported7.31.0/7.32.0, published7.33.0 contains8362 timeout argument restoration. Shared React16.14.0 and supported carbon-components10.30.0 before earliest. Native Save changes reveals standard ToastNotification with specified10000ms timeout; Saved must remain visible at1500ms (well before expiry), matching issue's any-indicated-timeout criterion. Same keyboard Tab/Enter and pointer activation, ordinary browse goal, width twin and system-font override planned before outcomes. No claim of actual NVDA announcement, no new timebase/oracle/threshold or fallback; properties and original criteria unchanged across releases. This dispatch is batch29 first and also batch28 second final-role-prepared modal attempt.

A-007 batch29 first38231384520: MUI custom Paper good/fixed render No recent searches and existing-model browse reaches line4; broken does not. Carbon toast good/fixed persist, broken disappears, but the generic Saved goal incorrectly matches static heading Saved notification in every version. Before assignment, rename only the heading/document title to neutral Notification lifetime; keep actual Saved feedback and original1500ms/10000ms criterion. Require two final matching browse diagnostics with goal absent broken. Modal role-prepared good/fixed wrap, broken does not; DOM outside-focus event list is empty and activeElement tag remains BUTTON. Add document.hasFocus diagnostic for original focus-outside criterion, since leaving the page to browser UI can retain its last DOM activeElement; do not claim a DOM escape without evidence. Same one-Tab wrap/never-escape criterion, no fallback or new measurement rule. Next dispatch is batch29 second/30 first: MUI repeat, first final Carbon and modal diagnostics, first Fluent/query and controlled-close fixtures. Further independent final repetitions consume batch30 second.
