# M5 dev-split report (EXPLORATORY)

Runs: artefacts/37157013736. Harness commit: fef0f381d47a. Oracle tables: `protocol/oracles/rules.v1.json`; triggers: `protocol/triggers.v1.json`. k = n per side and leg (DR-0031). Bootstrap: 10000 pattern-level resamples, seed 20261005. Detection needs a FAIL with the correct symptom; REVIEW is not detection and INCONCLUSIVE is a miss. "Any" credits an arm when any of its FAIL symptoms is correct; "earliest" only the earliest finding's. The reachability symptoms count as one family (P29). Rules approved by the owner 2026-10-03 (P28–P36, DR-0081). W = Wilson 95% over items; boot = pattern bootstrap 95%.

## Arms

Primary: detection weighted uniformly by expected symptom (HANDOFF §10.3), the mean of the per-symptom rates, with a pattern-level bootstrap 95% interval. The item-level rates follow.

| Arm | Detection, uniform by symptom | Symptoms detected (any) |
|---|---|---|
| A | 15% (boot 6%–29%) | AD 0/1, AM 0/3, FNM 0/1, FNR 0/1, IFUA 0/2, JB 0/1, KT 0/1, NNC 2/3, NTU 2/2, RNC 0/2, SNC 0/3 |
| B | 88% (boot 78%–100%) | AD 0/1, AM 2/3, FNM 1/1, FNR 1/1, IFUA 2/2, JB 1/1, KT 1/1, NNC 3/3, NTU 2/2, RNC 2/2, SNC 3/3 |
| B2 | 100% (boot 100%–100%) | AD 1/1, AM 3/3, FNM 1/1, FNR 1/1, IFUA 2/2, JB 1/1, KT 1/1, NNC 3/3, NTU 2/2, RNC 2/2, SNC 3/3 |
| C_UNION | 100% (boot 100%–100%) | AD 1/1, AM 3/3, FNM 1/1, FNR 1/1, IFUA 2/2, JB 1/1, KT 1/1, NNC 3/3, NTU 2/2, RNC 2/2, SNC 3/3 |
| C_ADJUDICATED | 97% (boot 88%–100%) | AD 1/1, AM 3/3, FNM 1/1, FNR 1/1, IFUA 2/2, JB 1/1, KT 1/1, NNC 3/3, NTU 2/2, RNC 2/2, SNC 2/3 |
| D_UNION | 100% (boot 100%–100%) | AD 1/1, AM 3/3, FNM 1/1, FNR 1/1, IFUA 2/2, JB 1/1, KT 1/1, NNC 3/3, NTU 2/2, RNC 2/2, SNC 3/3 |
| D_ADJUDICATED | 97% (boot 88%–100%) | AD 1/1, AM 3/3, FNM 1/1, FNR 1/1, IFUA 2/2, JB 1/1, KT 1/1, NNC 3/3, NTU 2/2, RNC 2/2, SNC 2/3 |

The secondary, owner-weighted analysis needs the owner's weights file (HANDOFF §10.3); none has been supplied.

| Arm | Detection (any) | Detection (earliest) | Wrong symptom | REVIEW (regr.) | INC (regr.) | False FAIL, benign | False FAIL, unchanged | REVIEW benign / unchanged | INC items |
|---|---|---|---|---|---|---|---|---|---|
| A | 4/20 (20%; W 8%–42%; boot 5%–40%) | 4/20 | 3 | 1 | 0 | 0/20 (0%; W 0%–16%; boot 0%–0%) | 0/16 (0%; W 0%–19%; boot 0%–0%) | 0 / 0 | 0/56 |
| B | 18/20 (90%; W 70%–97%; boot 75%–100%) | 16/20 | 0 | 0 | 0 | 0/20 (0%; W 0%–16%; boot 0%–0%) | 0/16 (0%; W 0%–19%; boot 0%–0%) | 0 / 0 | 0/56 |
| B2 | 20/20 (100%; W 84%–100%; boot 100%–100%) | 18/20 | 0 | 0 | 0 | 0/20 (0%; W 0%–16%; boot 0%–0%) | 0/16 (0%; W 0%–19%; boot 0%–0%) | 0 / 0 | 0/56 |
| C_UNION | 20/20 (100%; W 84%–100%; boot 100%–100%) | 18/20 | 0 | 0 | 0 | 0/20 (0%; W 0%–16%; boot 0%–0%) | 0/16 (0%; W 0%–19%; boot 0%–0%) | 0 / 0 | 0/56 |
| C_ADJUDICATED | 19/20 (95%; W 76%–99%; boot 85%–100%) | 18/20 | 0 | 1 | 0 | 0/20 (0%; W 0%–16%; boot 0%–0%) | 0/16 (0%; W 0%–19%; boot 0%–0%) | 0 / 0 | 0/56 |
| D_UNION | 20/20 (100%; W 84%–100%; boot 100%–100%) | 18/20 | 0 | 0 | 0 | 0/20 (0%; W 0%–16%; boot 0%–0%) | 0/16 (0%; W 0%–19%; boot 0%–0%) | 0 / 0 | 0/56 |
| D_ADJUDICATED | 19/20 (95%; W 76%–99%; boot 85%–100%) | 18/20 | 0 | 1 | 0 | 0/20 (0%; W 0%–16%; boot 0%–0%) | 0/16 (0%; W 0%–19%; boot 0%–0%) | 0 / 0 | 0/56 |

## Reliability per leg (attempt level)

| Leg | Attempts | INCONCLUSIVE attempts (Clopper–Pearson 95%) | K1 canaries passed (Clopper–Pearson 95%) |
|---|---|---|---|
| nvda-absent | 368 | 0 (0%–1%) | 112/112 (97%–100%) |
| nvda-present | 368 | 0 (0%–1%) | 112/112 (97%–100%) |

## Paired comparisons (PRD §34)

Discordant regression items (x detects, y does not: b; y detects, x does not: c) with the exact McNemar p; and discordant false FAILs on benign and unchanged items.

| Comparison | b | c | p | False FAIL b | False FAIL c | p |
|---|---|---|---|---|---|---|
| B2 versus B | 2 | 0 | 0.500 | 0 | 0 | 1.000 |
| C versus B2 (UNION) | 0 | 0 | 1.000 | 0 | 0 | 1.000 |
| C versus B2 (ADJUDICATED) | 0 | 1 | 1.000 | 0 | 0 | 1.000 |
| D versus C (UNION) | 0 | 0 | 1.000 | 0 | 0 | 1.000 |
| D versus C (ADJUDICATED) | 0 | 0 | 1.000 | 0 | 0 | 1.000 |

## Arm D: runtime and retention (H3)

Over 56 items, NVDA AT-segment time per attempt summed over items: C 1052.2 s, D 242.0 s (23% of C). Triggered steps: 70 of 159. D keeps 20 of C's 20 detections under UNION and 19 of 19 under ADJUDICATED. Runtime is estimated from the durations of triggered NVDA segments (HANDOFF §8.4); NVDA start-up and handover are excluded.

## Regression items

| Item | Expected | A | B | B2 | C_UNION | C_ADJUDICATED | D_UNION | D_ADJUDICATED |
|---|---|---|---|---|---|---|---|---|
| acrm-checked-stale-checkbox | SNC | PASS | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | REVIEW | FAIL SNC ✓ | REVIEW |
| acrm-drag-only-deal-card | IFUA | PASS | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU+JB ✓ | FAIL NTU+JB ✓ | FAIL NTU ✓ | FAIL NTU ✓ |
| acrm-escape-not-closing-menu | KT | FAIL NTU ✗ | FAIL NTU+KT ✓ | FAIL NTU+KT ✓ | FAIL NTU+KT ✓ | FAIL KT+NTU ✓ | FAIL NTU+KT ✓ | FAIL KT+NTU ✓ |
| acrm-icon-button-label-task-actions | NNC | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ |
| acrm-live-region-hidden-toaster | AM | PASS | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ |
| acrm-selected-stale-tabs | SNC | PASS | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ |
| acrm-submit-pointer-only-save | JB | FAIL NNC ✗ | FAIL NNC+JB ✓ | FAIL NNC+JB ✓ | FAIL NNC+JB ✓ | FAIL NNC+JB ✓ | FAIL NNC+JB ✓ | FAIL NNC+JB ✓ |
| acrm-tab-roles-removed | RNC | FAIL SNC ✗ | FAIL RNC+SNC+FNM ✓ | FAIL RNC+SNC+FNM ✓ | FAIL RNC+SNC+FNM ✓ | FAIL RNC+SNC+FNM ✓ | FAIL RNC+SNC+FNM ✓ | FAIL RNC+SNC+FNM ✓ |
| oss-carbon-19563 | SNC | PASS | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ |
| oss-fluent-35927 | NNC | PASS | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ |
| oss-rac-8697 | IFUA | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| ras-button-to-div-quick-create-cancel | RNC | PASS | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ |
| ras-dialog-focus-not-restored-preview | FNR | PASS | FAIL FNR ✓ | FAIL FNR ✓ | FAIL FNR ✓ | FAIL FNR ✓ | FAIL FNR ✓ | FAIL FNR ✓ |
| ras-dialog-initial-focus-quick-create | FNM | REVIEW | FAIL FNM ✓ | FAIL FNM ✓ | FAIL FNM ✓ | FAIL FNM ✓ | FAIL FNM ✓ | FAIL FNM ✓ |
| ras-dialog-unnamed-preview | NNC | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ |
| ras-heading-removed-custom-page | NTU | FAIL NTU ✓ | FAIL JB+NTU ✓ | FAIL JB+NTU ✓ | FAIL JB+NTU ✓ | FAIL JB+NTU ✓ | FAIL JB+NTU ✓ | FAIL JB+NTU ✓ |
| ras-live-region-removed-notification | AM | PASS | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ |
| ras-navigation-hidden-menu | NTU | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ |
| ras-toast-duplicated-announcer | AD | PASS | PASS | FAIL AD ✓ | FAIL AD ✓ | FAIL AD ✓ | FAIL AD ✓ | FAIL AD ✓ |
| ras-toast-status-created-populated | AM | PASS | PASS | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ |

## Benign and unchanged items not PASS in every arm

| Item | Kind | A | B | B2 | C_UNION | C_ADJUDICATED | D_UNION | D_ADJUDICATED |
|---|---|---|---|---|---|---|---|---|
| (none) | | | | | | | | |

## Findings behind each non-PASS verdict

- **acrm-checked-stale-checkbox**
  - B FAIL STATE_NOT_CONVEYED at `tick-task` (expectation-state): stateIs:checkbox/#checkbox-list-label-391/checked=true: candidate checkbox/ checked=false / checkbox/ checked=false / checkbox/ checked=false
- **acrm-drag-only-deal-card**
  - B FAIL NAV_TARGET_UNREACHABLE at `reach-deal-card` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-deal-card` (unreachable): candidate UNREACHABLE in 3 of 3
- **acrm-escape-not-closing-menu**
  - A FAIL NAV_TARGET_UNREACHABLE at `leave-focus-mode` (axe-aria-hidden-focus): axe aria-hidden-focus: base at most 0, candidate 2/2/2
  - A FAIL NAV_TARGET_UNREACHABLE at `leave-focus-mode` (axe-landmark-one-main): axe landmark-one-main: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `leave-focus-mode` (axe-page-has-heading-one): axe page-has-heading-one: base at most 0, candidate 1/1/1
  - A REVIEW at `leave-focus-mode` (axe-new-unmapped): axe region: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `close-task-actions` (axe-aria-hidden-focus): axe aria-hidden-focus: base at most 0, candidate 2/2/2
  - A FAIL NAV_TARGET_UNREACHABLE at `close-task-actions` (axe-landmark-one-main): axe landmark-one-main: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `close-task-actions` (axe-page-has-heading-one): axe page-has-heading-one: base at most 0, candidate 1/1/1
  - A REVIEW at `close-task-actions` (axe-new-unmapped): axe region: base at most 0, candidate 1/1/1
  - B FAIL KEYBOARD_TRAP at `close-task-actions` (expectation-focus): focusOn:button/task actions: candidate menuitem/Postpone to tomorrow / menuitem/Postpone to tomorrow / menuitem/Postpone to tomorrow
  - NVDA FAIL KEYBOARD_TRAP at `close-task-actions` (expectation-focus): focusOn:button/task actions: candidate (silence) / (silence) / (silence)
- **acrm-icon-button-label-task-actions**
  - A FAIL NAME_NOT_CONVEYED at `reach-task-checkbox` (axe-button-name): axe button-name: base at most 18, candidate 33/33/33
  - A FAIL NAME_NOT_CONVEYED at `reach-task-actions` (axe-button-name): axe button-name: base at most 18, candidate 33/33/33
  - B FAIL NAME_NOT_CONVEYED at `reach-task-actions` (expectation-name): focusOn:button/task actions: candidate button/ / button/ / button/
  - NVDA FAIL NAME_NOT_CONVEYED at `reach-task-actions` (expectation-name): focusOn:button/task actions: candidate menu button collapsed sub Menu / menu button collapsed sub Menu / menu button collapsed sub Menu
- **acrm-live-region-hidden-toaster**
  - B FAIL ANNOUNCEMENT_MISSING at `save-contact` (expectation-absent): announcementContains:Element created: candidate no live region holds it / no live region holds it / no live region holds it / no live region holds it / no live region holds it
  - B2 FAIL ANNOUNCEMENT_MISSING at `save-contact` (expectation-absent): announcementContains:Element created: candidate 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text
  - NVDA FAIL ANNOUNCEMENT_MISSING at `save-contact` (expectation-absent): announcementContains:Element created: candidate 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s)
- **acrm-selected-stale-tabs**
  - B FAIL STATE_NOT_CONVEYED at `reach-activity-tab` (expectation-state): stateIs:tab/Activity/selected=true: candidate tab/Activity selected=false / tab/Activity selected=false / tab/Activity selected=false
  - B FAIL STATE_NOT_CONVEYED at `next-tab` (expectation-state): stateIs:tab/*/selected=true: candidate tab/14 contacts selected=false / tab/14 contacts selected=false / tab/14 contacts selected=false
  - NVDA FAIL STATE_NOT_CONVEYED at `reach-activity-tab` (expectation-state): stateIs:tab/Activity/selected=true: candidate main landmark / tab control / Activity tab 1 of 3 / main landmark / tab control / Activity tab 1 of 3 / main landmark / tab control / Activity tab 1 of 3
  - NVDA FAIL STATE_NOT_CONVEYED at `next-tab` (expectation-state): stateIs:tab/*/selected=true: candidate 14 contacts tab 2 of 3 / 14 contacts tab 2 of 3 / 14 contacts tab 2 of 3
- **acrm-submit-pointer-only-save**
  - A FAIL NAME_NOT_CONVEYED at `save-contact` (axe-aria-command-name): axe aria-command-name: base at most 0, candidate 2/2/2
  - A FAIL NAME_NOT_CONVEYED at `save-contact` (axe-button-name): axe button-name: base at most 3, candidate 6/6/6
  - A REVIEW at `save-contact` (axe-new-unmapped): axe label-title-only: base at most 1, candidate 2/2/2
  - A FAIL NAME_NOT_CONVEYED at `leave-form` (axe-aria-command-name): axe aria-command-name: base at most 0, candidate 2/2/2
  - A FAIL NAME_NOT_CONVEYED at `leave-form` (axe-button-name): axe button-name: base at most 3, candidate 6/6/6
  - A REVIEW at `leave-form` (axe-new-unmapped): axe label-title-only: base at most 1, candidate 2/2/2
  - A FAIL NAME_NOT_CONVEYED at `page-top` (axe-aria-command-name): axe aria-command-name: base at most 0, candidate 2/2/2
  - A FAIL NAME_NOT_CONVEYED at `page-top` (axe-button-name): axe button-name: base at most 3, candidate 6/6/6
  - A REVIEW at `page-top` (axe-new-unmapped): axe label-title-only: base at most 1, candidate 2/2/2
  - A FAIL NAME_NOT_CONVEYED at `reach-new-contact` (axe-aria-command-name): axe aria-command-name: base at most 0, candidate 2/2/2
  - A FAIL NAME_NOT_CONVEYED at `reach-new-contact` (axe-button-name): axe button-name: base at most 3, candidate 6/6/6
  - A REVIEW at `reach-new-contact` (axe-new-unmapped): axe label-title-only: base at most 1, candidate 2/2/2
  - B FAIL JOURNEY_BLOCKED at `reach-new-contact` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-new-contact` (unreachable): candidate UNREACHABLE in 3 of 3
- **acrm-tab-roles-removed**
  - A FAIL STATE_NOT_CONVEYED at `reach-activity-tab` (axe-aria-allowed-attr): axe aria-allowed-attr: base at most 0, candidate 4/4/4
  - A FAIL STATE_NOT_CONVEYED at `next-tab` (axe-aria-allowed-attr): axe aria-allowed-attr: base at most 0, candidate 4/4/4
  - B FAIL ROLE_NOT_CONVEYED at `reach-activity-tab` (expectation-role): focusOn:tab/Activity: candidate button/Activity / button/Activity / button/Activity
  - B FAIL ROLE_NOT_CONVEYED at `reach-activity-tab` (expectation-role): stateIs:tab/Activity/selected=true: candidate (target not found) / (target not found) / (target not found)
  - B FAIL FOCUS_NOT_MOVED at `next-tab` (expectation-focus): focusOn:tab/*: candidate button/14 contacts / button/14 contacts / button/14 contacts
  - B FAIL FOCUS_NOT_MOVED at `next-tab` (expectation-focus): stateIs:tab/*/selected=true: candidate (target not found) / (target not found) / (target not found)
  - NVDA FAIL ROLE_NOT_CONVEYED at `reach-activity-tab` (expectation-role): focusOn:tab/Activity: candidate main landmark Activity button / main landmark Activity button / main landmark Activity button
  - NVDA FAIL STATE_NOT_CONVEYED at `reach-activity-tab` (expectation-state): stateIs:tab/Activity/selected=true: candidate main landmark Activity button / main landmark Activity button / main landmark Activity button
  - NVDA FAIL FOCUS_NOT_MOVED at `next-tab` (expectation-focus): focusOn:tab/*: candidate c / c / c
  - NVDA FAIL STATE_NOT_CONVEYED at `next-tab` (expectation-state): stateIs:tab/*/selected=true: candidate c / c / c
- **oss-carbon-19563**
  - B FAIL STATE_NOT_CONVEYED at `back-to-checkbox` (expectation-state): stateIs:checkbox/Show archived/checked=false: candidate checkbox/Show archived checked=true / checkbox/Show archived checked=true / checkbox/Show archived checked=true
  - NVDA FAIL STATE_NOT_CONVEYED at `back-to-checkbox` (expectation-state): stateIs:checkbox/Show archived/checked=false: candidate Show archived check box checked / Show archived check box checked / Show archived check box checked
- **oss-fluent-35927**
  - B FAIL NAME_NOT_CONVEYED at `first-badge` (expectation-name): focusOn:img/busy: candidate StaticText/Ana image/available / StaticText/Ana image/available / StaticText/Ana image/available
  - B FAIL NAME_NOT_CONVEYED at `second-badge` (expectation-name): focusOn:img/away: candidate StaticText/Ben image/available / StaticText/Ben image/available / StaticText/Ben image/available
  - B FAIL NAME_NOT_CONVEYED at `third-badge` (expectation-name): focusOn:img/offline: candidate StaticText/Cy image/available / StaticText/Cy image/available / StaticText/Cy image/available
  - NVDA FAIL NAME_NOT_CONVEYED at `first-badge` (expectation-name): focusOn:img/busy: candidate bullet Ana graphic available / bullet Ana graphic available / bullet Ana graphic available
  - NVDA FAIL NAME_NOT_CONVEYED at `second-badge` (expectation-name): focusOn:img/away: candidate bullet Ben graphic available / bullet Ben graphic available / bullet Ben graphic available
  - NVDA FAIL NAME_NOT_CONVEYED at `third-badge` (expectation-name): focusOn:img/offline: candidate bullet Cy graphic available / bullet Cy graphic available / bullet Cy graphic available
- **oss-rac-8697**
  - B FAIL JOURNEY_BLOCKED at `reach-new-page` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA REVIEW at `reach-new-page` (base-not-reached): base reached the step in 2 of 3 attempts
- **ras-button-to-div-quick-create-cancel**
  - B FAIL ROLE_NOT_CONVEYED at `reach-cancel` (expectation-role): focusOn:button/Cancel: candidate generic/Cancel / generic/Cancel / generic/Cancel
  - NVDA FAIL ROLE_NOT_CONVEYED at `reach-cancel` (expectation-role): focusOn:button/Cancel: candidate clickable Cancel / clickable Cancel / clickable Cancel
- **ras-dialog-focus-not-restored-preview**
  - B FAIL FOCUS_NOT_RESTORED at `close-preview` (expectation-focus): focusOn:button/Show: candidate RootWebArea/React Admin / RootWebArea/React Admin / RootWebArea/React Admin
  - NVDA FAIL FOCUS_NOT_RESTORED at `close-preview` (expectation-focus): focusOn:button/Show: candidate main landmark / menu / main landmark / menu / main landmark / menu
- **ras-dialog-initial-focus-quick-create**
  - A REVIEW at `open-quick-create` (axe-new-unmapped): axe color-contrast: base at most 1, candidate 2/2/2
  - B FAIL FOCUS_NOT_MOVED at `open-quick-create` (expectation-focus): focusOn:dialog/New post: candidate combobox/Post ​ / combobox/Post ​ / combobox/Post ​
  - NVDA FAIL FOCUS_NOT_MOVED at `open-quick-create` (expectation-focus): focusOn:dialog/New post: candidate main landmark / form landmark / Post ​ combo box ​ collapsed opens list ​ / menu / main landmark / form landmark / Post ​ combo box ​ collapsed opens list ​ / menu / main landmark / form landmark / Post ​ combo box ​ collapsed opens list ​ / menu
- **ras-dialog-unnamed-preview**
  - A FAIL NAME_NOT_CONVEYED at `open-preview` (axe-aria-dialog-name): axe aria-dialog-name: base at most 0, candidate 1/1/1
  - B FAIL NAME_NOT_CONVEYED at `open-preview` (expectation-name): focusOn:dialog/New post: candidate generic/ / generic/ / generic/
  - NVDA FAIL NAME_NOT_CONVEYED at `open-preview` (expectation-name): focusOn:dialog/New post: candidate dialog / dialog / dialog
- **ras-heading-removed-custom-page**
  - A FAIL NAV_TARGET_UNREACHABLE at `reach-page-heading` (axe-page-has-heading-one): axe page-has-heading-one: base at most 0, candidate 1/1/1
  - B FAIL JOURNEY_BLOCKED at `reach-page-heading` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-page-heading` (unreachable): candidate UNREACHABLE in 3 of 3
- **ras-live-region-removed-notification**
  - B FAIL ANNOUNCEMENT_MISSING at `save-post` (expectation-absent): announcementContains:Post updated: candidate no live region holds it / no live region holds it / no live region holds it / no live region holds it / no live region holds it
  - B2 FAIL ANNOUNCEMENT_MISSING at `save-post` (expectation-absent): announcementContains:Post updated: candidate 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text
  - NVDA FAIL ANNOUNCEMENT_MISSING at `save-post` (expectation-absent): announcementContains:Post updated: candidate 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s)
- **ras-navigation-hidden-menu**
  - A FAIL NAV_TARGET_UNREACHABLE at `reach-comments-menu` (axe-aria-hidden-focus): axe aria-hidden-focus: base at most 0, candidate 1/1/1
  - B FAIL NAV_TARGET_UNREACHABLE at `reach-comments-menu` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL NAV_TARGET_UNREACHABLE at `reach-comments-menu` (unreachable): candidate UNREACHABLE in 3 of 3
- **ras-toast-duplicated-announcer**
  - B2 FAIL ANNOUNCEMENT_DUPLICATED at `save-post` (duplicate): announcementContains:Post updated: 2/2/2 in the candidate, once in the base
  - NVDA REVIEW at `save-post` (duplicate-speech-only): announcementContains:Post updated: spoken twice in the candidate, once in the base (DR-0042)
- **ras-toast-status-created-populated**
  - B2 FAIL ANNOUNCEMENT_MISSING at `save-post` (expectation-absent): announcementContains:Post updated: candidate 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text
  - NVDA FAIL ANNOUNCEMENT_MISSING at `save-post` (expectation-absent): announcementContains:Post updated: candidate 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s)

## Expectations each family can observe

Per family, journey expectations by result over all items: observable ones pass or fail; "unobservable" means the base does not meet the expectation in that family's evidence; "not judgeable" means evidence is missing.

| Family | pass | fail | review | unobservable | not-judgeable | not-run |
|---|---|---|---|---|---|---|
| B | 73 | 19 | 0 | 0 | 0 | 0 |
| B2 | 10 | 4 | 0 | 0 | 0 | 3 |
| NVDA | 66 | 19 | 1 | 6 | 0 | 0 |

## Triggers (Arm D)

| Trigger | Steps it fired on (items × steps) |
|---|---|
| T1-live-region | 22 |
| T2-role-status | 2 |
| T3-role-alert | 7 |
| T4-dialog-opening | 9 |
| T5-route-transition | 21 |
| T6-programmatic-focus | 64 |
| T7-active-descendant | 0 |

## Power table

Patterns needed to estimate a detection rate within ±d (95%), n = z²·p(1 − p)/d², planned with p, or for a dev estimate with its Wilson 95% bound nearest 0.5, since 20 dev patterns cannot pin a rate near 0 or 1. The test split holds 59 regression patterns (`corpus/split.json`, dropped patterns excluded).

| Basis | p (dev) | Planning p | ±0.05 | ±0.08 | ±0.10 | ±0.15 |
|---|---|---|---|---|---|---|
| worst case | 0.50 | 0.50 | 385 | 151 | 97 | 43 |
| HANDOFF §10.3 example | 0.15 | 0.15 | 196 | 77 | 49 | 22 |
| A detection (dev) | 0.20 | 0.42 | 374 | 146 | 94 | 42 |
| B detection (dev) | 0.90 | 0.70 | 324 | 127 | 81 | 36 |
| B2 detection (dev) | 1.00 | 0.84 | 208 | 82 | 52 | 24 |
| C_UNION detection (dev) | 1.00 | 0.84 | 208 | 82 | 52 | 24 |
| C_ADJUDICATED detection (dev) | 0.95 | 0.76 | 278 | 109 | 70 | 31 |
| D_UNION detection (dev) | 1.00 | 0.84 | 208 | 82 | 52 | 24 |
| D_ADJUDICATED detection (dev) | 0.95 | 0.76 | 278 | 109 | 70 | 31 |

Pairs needed for each paired comparison at α = 0.05 and power 0.8 (Connor 1987), from the dev discordant proportions. With 20 dev patterns these proportions are rough.

| Comparison | p10 | p01 | Patterns needed |
|---|---|---|---|
| B2 versus B | 0.10 | 0.00 | 77 |
| C versus B2 (UNION) | 0.00 | 0.00 | ∞ (no difference) |
| C versus B2 (ADJUDICATED) | 0.00 | 0.05 | 155 |
| D versus C (UNION) | 0.00 | 0.00 | ∞ (no difference) |
| D versus C (ADJUDICATED) | 0.00 | 0.00 | ∞ (no difference) |

## Biases and limits

- Speech is what NVDA queues plus global cancels, not audio: queued-then-cancelled text counts as spoken, and cancellations inside NVDA's speech manager never reach the relay (R10, DR-0022). This makes ANNOUNCEMENT_DUPLICATED anti-conservative; a duplicate seen only in speech is REVIEW (DR-0042; P36).
- The oracles were developed on this split. Its results show the rules work as written; they are not estimates for the test split.
- Every dev pattern has one regression item, so item-level and pattern-level counts agree; the bootstrap matters for the test split's mixed clusters (P20).
- The tree and B2 tie an announcement's text to a live region read at the step's end or 1 s into its window (DR-0079). A message shown and removed within that second is missed by both.
