# M7 bounded mining candidate ledger (2026-10-11)

EXPLORATORY. Search plan: [bounded mining plan](2026-10-11-m7-mining-plan.md). The original pass left the 11-entry registry and split unchanged. DR-0096 subsequently admits Calendar as the twelfth mined pair and appends its test assignment; previous assignments remain unchanged. The earlier survey mentioned Headless UI #2934, which this query rediscovered because it is absent from that registry; it is rejected and contributes no addition. `Rejected` means excluded from this pass under P22/current scope, not that the reported bug never existed. `Pending documentary` lacks required evidence; `documentary candidate` is not verified or a corpus addition.

## Search log

GitHub REST search, creation date ascending, up to 30 hits inspected per query and three new issues selected per query. Issue bodies and relevant comments and timelines were inspected for all selected issues. Search matches can come from discussion text; a hit need not document a regression. Repository and query order follow the plan. No query failed.

| Repository | Term | Search total | Selected issue numbers | Excluded duplicates/previous entries before selection cap |
|---|---|---|---|---|
| radix-ui/primitives | accessibility | 3 | 212, 1351, 1925 | — |
| radix-ui/primitives | keyboard | 1 | 1236 | — |
| adobe/react-spectrum | accessibility | 1 | 10553 | — |
| adobe/react-spectrum | keyboard | 15 | 2030, 2572, 2608 | — |
| mui/material-ui | accessibility | 25 | 6293, 6799, 7617 | — |
| mui/material-ui | keyboard | 28 | 783, 4384, 5186 | — |
| carbon-design-system/carbon | accessibility | 19 | 2329, 4118, 4870 | — |
| carbon-design-system/carbon | keyboard | 18 | 2600, 3397, 3831 | 4870 |
| microsoft/fluentui | accessibility | 252 | 1216, 1618, 4432 | — |
| microsoft/fluentui | keyboard | 78 | 4619, 4620, 5115 | 1216 |
| tailwindlabs/headlessui | accessibility | 0 | — | — |
| tailwindlabs/headlessui | keyboard | 2 | 2243, 2934 | — |
| vuetifyjs/vuetify | accessibility | 5 | 1326, 2543, 17846 | — |
| vuetifyjs/vuetify | keyboard | 9 | 3177, 7310, 11370 | 1326 |
| palantir/blueprint | accessibility | 0 | — | — |
| palantir/blueprint | keyboard | 2 | 183, 3988 | — |

## Documentary dispositions

| Source issue | Disposition | Evidence and remaining requirement |
|---|---|---|
| [radix-ui/primitives #212](https://github.com/radix-ui/primitives/issues/212) | rejected | Development warnings request; no release regression or library fix for a primary symptom. |
| [radix-ui/primitives #1351](https://github.com/radix-ui/primitives/issues/1351) | rejected | Maintainers say mobile tooltips not opening on focus is intentional. The linked regression concerns opening on touch, not the reported keyboard behaviour. |
| [radix-ui/primitives #1925](https://github.com/radix-ui/primitives/issues/1925) | rejected | Scrollbar/layout shift; no primary-analysis semantic or keyboard symptom established. |
| [radix-ui/primitives #1236](https://github.com/radix-ui/primitives/issues/1236) | rejected | The reporter explicitly says Escape and other keyboard interactions work; failure is touch-only (P22 rule 1). |
| [adobe/react-spectrum #10553](https://github.com/adobe/react-spectrum/issues/10553) | rejected | Documentation/resource suggestion, not a library regression. |
| [adobe/react-spectrum #2030](https://github.com/adobe/react-spectrum/issues/2030) | rejected | iOS touch-paste behaviour; does not establish a reproducible Windows/Chrome keyboard regression. |
| [adobe/react-spectrum #2572](https://github.com/adobe/react-spectrum/issues/2572) | pending documentary | Keyboard failures and a merged fix (#3000) are documented; no last-good/first-broken published release pair established. The issue itself asks whether this is a regression. |
| [adobe/react-spectrum #2608](https://github.com/adobe/react-spectrum/issues/2608) | rejected | Duplicate of #2572; cannot add another independent pattern. |
| [mui/material-ui #6293](https://github.com/mui/material-ui/issues/6293) | rejected | Hover/focus background colour design discussion; no existing primary-analysis symptom established. |
| [mui/material-ui #6799](https://github.com/mui/material-ui/issues/6799) | rejected | Library integration discussion, not a release regression. |
| [mui/material-ui #7617](https://github.com/mui/material-ui/issues/7617) | rejected | Guidelines-checker feature proposal; no regression pair. |
| [mui/material-ui #783](https://github.com/mui/material-ui/issues/783) | rejected | Long-running focus-loss reports include remount/key problems; no specific merged library fix and compatible release pair established (P22 rules 5/6). |
| [mui/material-ui #4384](https://github.com/mui/material-ui/issues/4384) | rejected | Request for dialog focus trapping and later reports; no accessible last-good release or specific regression/fix pair established. |
| [mui/material-ui #5186](https://github.com/mui/material-ui/issues/5186) | rejected | Visual hover/selected distinction on the next branch; no primary symptom and stable published regression pair established. |
| [carbon-design-system/carbon #2329](https://github.com/carbon-design-system/carbon/issues/2329) | rejected | Helper-text design enhancement, not a release regression. |
| [carbon-design-system/carbon #4118](https://github.com/carbon-design-system/carbon/issues/4118) | rejected | Umbrella refactor/testing request spanning several issues; no single defined release regression pair. |
| [carbon-design-system/carbon #4870](https://github.com/carbon-design-system/carbon/issues/4870) | rejected | Request for manual tab activation; maintainers describe automatic/manual activation as valid patterns, not loss of accessible behaviour. |
| [carbon-design-system/carbon #2600](https://github.com/carbon-design-system/carbon/issues/2600) | pending documentary | Keyboard Enter failure is described at 6.28.3, but last-good release and exact merged fix/release boundary remain unidentified. |
| [carbon-design-system/carbon #3397](https://github.com/carbon-design-system/carbon/issues/3397) | rejected on follow-up | Closed as stale with incomplete MDX reproduction context and no identified library fix (P22 rules 5/6, DR-0096). |
| [carbon-design-system/carbon #3831](https://github.com/carbon-design-system/carbon/issues/3831) | rejected | Reporter later succeeds with JAWS 20/Windows 10; maintainers cannot reproduce on Windows 10. No package regression pair established (P22 rule 5). |
| [microsoft/fluentui #1216](https://github.com/microsoft/fluentui/issues/1216) | rejected | IE/Edge-injected clear pseudo-element, absent in Chrome; does not establish the required browser/keyboard regression pair. |
| [microsoft/fluentui #1618](https://github.com/microsoft/fluentui/issues/1618) | rejected | AT/browser compatibility report with no accessible last-good package release; does not establish a release regression pair. |
| [microsoft/fluentui #4432](https://github.com/microsoft/fluentui/issues/4432) | pending documentary | Dropdown option announcements on arrows; merged fix #5385 referenced, but last-good/broken releases and NVDA/Chrome reproduction remain unresolved. |
| [microsoft/fluentui #4619](https://github.com/microsoft/fluentui/issues/4619) | rejected | Loss of visual focus outline is outside the current primary-analysis symptom set; no semantic focus-loss claim. |
| [microsoft/fluentui #4620](https://github.com/microsoft/fluentui/issues/4620) | admitted (DR-0096) | Two independent reproductions, plus browse-goal and CSS-twin diagnostics in run 38175379953. Test pattern, benign twin and unchanged control built; no confirmatory execution. |
| [microsoft/fluentui #5115](https://github.com/microsoft/fluentui/issues/5115) | rejected | Design/spec discussion; maintainers regard tab behaviour as intentional/wont-fix. No release regression pair established. |
| [tailwindlabs/headlessui #2243](https://github.com/tailwindlabs/headlessui/issues/2243) | rejected | Maintainer closure explains NuxtLink click handling/workaround; no merged library fix and keyboard reproduction pair established (P22 rules 1/6). |
| [tailwindlabs/headlessui #2934](https://github.com/tailwindlabs/headlessui/issues/2934) | rejected | Maintainer describes tab-to-select as intended; changing nullable defaults in v2 is not evidence of an accessible last-good regression pair. |
| [vuetifyjs/vuetify #1326](https://github.com/vuetifyjs/vuetify/issues/1326) | rejected | Escape-closing feature request; no last-good release regression. |
| [vuetifyjs/vuetify #2543](https://github.com/vuetifyjs/vuetify/issues/2543) | rejected | Heading font sizes/CSS styling change; no primary-analysis symptom established. |
| [vuetifyjs/vuetify #17846](https://github.com/vuetifyjs/vuetify/issues/17846) | rejected | Accessibility-scanning feature request spanning a major version; no single compatible release pair. |
| [vuetifyjs/vuetify #3177](https://github.com/vuetifyjs/vuetify/issues/3177) | rejected | List-group expansion behaviour enhancement; maintainer states remaining reported behaviours are not bugs. |
| [vuetifyjs/vuetify #7310](https://github.com/vuetifyjs/vuetify/issues/7310) | rejected | Reported steps require pointer clicking a Snackbar; keyboard regression and last-good release are not established. |
| [vuetifyjs/vuetify #11370](https://github.com/vuetifyjs/vuetify/issues/11370) | rejected | Dynamic item-text question closed with slot/workaround guidance; no merged library fix or last-good regression pair established. |
| [palantir/blueprint #183](https://github.com/palantir/blueprint/issues/183) | rejected | Overlay size/scroll layout issue; no current primary-analysis symptom and last-good regression established. |
| [palantir/blueprint #3988](https://github.com/palantir/blueprint/issues/3988) | pending documentary | Keyboard cell editing regression reported in table 3.8.x, good 3.7.1 corroborated. Closure says it might be fixed in 4.0.0-rc.1; merged fix and compatible stable fixed release remain unestablished. |

## Calendar release investigation

[Fluent UI #4620](https://github.com/microsoft/fluentui/issues/4620) describes one keyboard invocation advancing two months. The maintainer identifies [commit fd2206f](https://github.com/microsoft/fluentui/commit/fd2206f8041ba6aca3b61a67a8552652e67d4954), changing clickable spans to buttons. [Merged fix #4662](https://github.com/microsoft/fluentui/pull/4662) gates keydown handling to Enter because native button activation also handles Space. This is the independent check specification: one Space on Next month must advance exactly one month; pointer activation is a control.

The [npm registry metadata](https://registry.npmjs.org/office-ui-fabric-react) identifies MIT licensing, compatible React 16 peer ranges, and published releases. Read-only inspection of published tarball source found no native CalendarDay navigation buttons in 5.40.2 and native buttons in the next release, 5.41.0. 5.89.0 still routes Space through keydown; 5.90.0 restricts that handler to Enter. These were source-inferred boundaries before CI. Run 38174040191 subsequently reproduced the expected good/broken/fixed behaviour once. The exploratory fixture pins React/react-dom 16.2.0, published before the earliest library release, and tests 5.40.2, 5.41.0 and 5.90.0 in CI only.

Even successful reproduction does not itself establish corpus readiness: check the accessible last-good construct, compatibility with the frozen symptom/journey vocabulary, mechanism/context independence, and two-run stability before admission. No symptom definition may be changed to admit this candidate.

## Exploratory reproduction outcome

[Run 38173756427](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38173756427) built all versions but failed to render without required `Calendar.strings`. That setup error was corrected identically on each release under P22 rule 8. The replacement dispatch cancelled the first run's remaining job via the existing concurrency rule; the completed candidate artifact was retained.

[Run 38174040191](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38174040191), commit `d50c8c2`, produced:

| Release | Pointer, one click | Keyboard, one Space | Page errors / external requests |
|---|---|---|---|
| 5.40.2 | April → May, holds | April → May, holds | 0 / 0 |
| 5.41.0 | April → May, holds | April → June, fails | 0 / 0 |
| 5.90.0 | April → May, holds | April → May, holds | 0 / 0 |

All three installs and builds returned exit 0. The [saved check output](m7-mining-evidence/38174040191-5.41.0.check.json) preserves the broken-release observation; adjacent files preserve the controls, setup failures and build results. This is one successful exploratory reproduction. At the end of the bounded pass, an independent repeat remained outstanding because the two-dispatch cap included the setup repair; the owner-authorised follow-up below resolves that requirement. No candidate has been assigned or admitted to the corpus.

## Owner-authorised independent repeat

[Run 38174572204](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38174572204), commit `0b5e0a1`, independently repeated the same check on the same releases and dependencies. Fixture and execution paths are unchanged from the first successful run. Each check output and resolved dependency lock matches the earlier successful run exactly: good 5.40.2 and fixed 5.90.0 advance April → May on Space; broken 5.41.0 advances April → June. Pointer activation advances April → May in all releases. All installs/builds return 0, with no page errors or external requests. [Repeat check output](m7-mining-evidence/38174572204-5.41.0.check.json) and [comparison with dependency-lock hashes](m7-mining-evidence/calendar-repeat-comparison.json) are retained.

Two successful exploratory reproductions now support the release boundary. The owner explicitly authorised this additional dispatch after the bounded pass; it does not retroactively change that pass's limits. DR-0095 records the follow-up. No corpus pattern is admitted or assigned by this repeat; frozen-vocabulary compatibility and companion twin/control work remain.

## Admission follow-up

DR-0096 admits Calendar after the planned diagnostics; current dispositions are 31 excluded, four pending documentary and one admitted. Earlier reproduction sections above are historical. See [admission report](2026-10-11-calendar-admission.md), [lead follow-up](2026-10-11-m7-leads-followup.md) and [next bounded search plan](2026-10-11-m7-next-mining-plan.md).
