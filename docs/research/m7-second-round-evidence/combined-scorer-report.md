# M5 test-split report (CONFIRMATORY)

Runs: artefacts/38156720011, artefacts/38276928082. Harness commit: 8336e99e60ab. Oracle tables: `protocol/oracles/rules.v1.json`; triggers: `protocol/triggers.v1.json`. k = n per side and leg (DR-0031). Bootstrap: 10000 pattern-level resamples, seed 20261005. Detection needs a FAIL with the correct symptom; REVIEW is not detection and INCONCLUSIVE is a miss. "Any" credits an arm when any of its FAIL symptoms is correct; "earliest" only the earliest finding's. The reachability symptoms count as one family (P29). Rules approved by the owner 2026-10-03 (P28–P36, DR-0081). W = Wilson 95% over items; boot = pattern bootstrap 95%.

## Arms

Primary: detection weighted uniformly by expected symptom (HANDOFF §10.3), the mean of the per-symptom rates, with a pattern-level bootstrap 95% interval. The item-level rates follow.

| Arm | Detection, uniform by symptom | Symptoms detected (any) |
|---|---|---|
| A | 16% (boot 10%–22%) | AD 0/3, AM 0/7, FED 0/4, FNM 0/4, FNR 0/4, IFUA 0/5, JB 2/20, KT 0/4, NNC 7/7, NTU 2/4, RNC 2/7, SNC 0/8 |
| B | 67% (boot 58%–77%) | AD 1/3, AM 2/7, FED 1/4, FNM 2/4, FNR 0/4, IFUA 4/5, JB 17/20, KT 4/4, NNC 7/7, NTU 4/4, RNC 7/7, SNC 8/8 |
| B2 | 75% (boot 67%–83%) | AD 3/3, AM 4/7, FED 1/4, FNM 2/4, FNR 0/4, IFUA 4/5, JB 17/20, KT 4/4, NNC 7/7, NTU 4/4, RNC 7/7, SNC 8/8 |
| C_UNION | 80% (boot 72%–89%) | AD 3/3, AM 6/7, FED 1/4, FNM 2/4, FNR 1/4, IFUA 4/5, JB 19/20, KT 4/4, NNC 7/7, NTU 4/4, RNC 7/7, SNC 8/8 |
| C_ADJUDICATED | 69% (boot 58%–81%) | AD 1/3, AM 6/7, FED 1/4, FNM 2/4, FNR 1/4, IFUA 3/5, JB 18/20, KT 4/4, NNC 7/7, NTU 3/4, RNC 7/7, SNC 7/8 |
| D_UNION | 79% (boot 70%–88%) | AD 3/3, AM 5/7, FED 1/4, FNM 2/4, FNR 1/4, IFUA 4/5, JB 19/20, KT 4/4, NNC 7/7, NTU 4/4, RNC 7/7, SNC 8/8 |
| D_ADJUDICATED | 72% (boot 63%–83%) | AD 1/3, AM 5/7, FED 1/4, FNM 2/4, FNR 1/4, IFUA 4/5, JB 19/20, KT 4/4, NNC 7/7, NTU 4/4, RNC 7/7, SNC 7/8 |

The secondary, owner-weighted analysis needs the owner's weights file (HANDOFF §10.3); none has been supplied.

| Arm | Detection (any) | Detection (earliest) | Wrong symptom | REVIEW (regr.) | INC (regr.) | False FAIL, benign | False FAIL, unchanged | REVIEW benign / unchanged | INC items |
|---|---|---|---|---|---|---|---|---|---|
| A | 13/77 (17%; W 10%–27%; boot 9%–26%) | 12/77 | 6 | 6 | 0 | 0/77 (0%; W 0%–5%; boot 0%–0%) | 0/45 (0%; W 0%–8%; boot 0%–0%) | 1 / 0 | 0/199 |
| B | 57/77 (74%; W 63%–83%; boot 64%–83%) | 51/77 | 5 | 3 | 0 | 0/77 (0%; W 0%–5%; boot 0%–0%) | 0/45 (0%; W 0%–8%; boot 0%–0%) | 3 / 2 | 0/199 |
| B2 | 61/77 (79%; W 69%–87%; boot 70%–88%) | 55/77 | 5 | 3 | 0 | 0/77 (0%; W 0%–5%; boot 0%–0%) | 0/45 (0%; W 0%–8%; boot 0%–0%) | 3 / 2 | 0/199 |
| C_UNION | 66/77 (86%; W 76%–92%; boot 78%–94%) | 60/77 | 5 | 2 | 0 | 0/77 (0%; W 0%–5%; boot 0%–0%) | 0/45 (0%; W 0%–8%; boot 0%–0%) | 5 / 4 | 0/199 |
| C_ADJUDICATED | 60/77 (78%; W 67%–86%; boot 69%–87%) | 57/77 | 5 | 8 | 0 | 0/77 (0%; W 0%–5%; boot 0%–0%) | 0/45 (0%; W 0%–8%; boot 0%–0%) | 5 / 4 | 0/199 |
| D_UNION | 65/77 (84%; W 75%–91%; boot 75%–92%) | 59/77 | 5 | 2 | 0 | 0/77 (0%; W 0%–5%; boot 0%–0%) | 0/45 (0%; W 0%–8%; boot 0%–0%) | 3 / 2 | 0/199 |
| D_ADJUDICATED | 62/77 (81%; W 70%–88%; boot 71%–90%) | 56/77 | 5 | 5 | 0 | 0/77 (0%; W 0%–5%; boot 0%–0%) | 0/45 (0%; W 0%–8%; boot 0%–0%) | 3 / 2 | 0/199 |

## Reliability per leg (attempt level)

| Leg | Attempts | INCONCLUSIVE attempts (Clopper–Pearson 95%) | K1 canaries passed (Clopper–Pearson 95%) |
|---|---|---|---|
| nvda-absent | 1262 | 6 (0%–1%) | 397/398 (99%–100%) |
| nvda-present | 1262 | 6 (0%–1%) | 398/398 (99%–100%) |

## Paired comparisons (PRD §34)

Discordant regression items (x detects, y does not: b; y detects, x does not: c) with the exact McNemar p; and discordant false FAILs on benign and unchanged items.

| Comparison | b | c | p | False FAIL b | False FAIL c | p |
|---|---|---|---|---|---|---|
| B2 versus B | 4 | 0 | 0.125 | 0 | 0 | 1.000 |
| C versus B2 (UNION) | 5 | 0 | 0.063 | 0 | 0 | 1.000 |
| C versus B2 (ADJUDICATED) | 5 | 6 | 1.000 | 0 | 0 | 1.000 |
| D versus C (UNION) | 0 | 1 | 1.000 | 0 | 0 | 1.000 |
| D versus C (ADJUDICATED) | 3 | 1 | 0.625 | 0 | 0 | 1.000 |

## Arm D: runtime and retention (H3)

Over 199 items, NVDA AT-segment time per attempt summed over items: C 4605.1 s, D 688.9 s (15% of C). Triggered steps: 285 of 889. D keeps 65 of C's 66 detections under UNION and 59 of 60 under ADJUDICATED. Runtime is estimated from the durations of triggered NVDA segments (HANDOFF §8.4); NVDA start-up and handover are excluded.

## Regression items

| Item | Expected | A | B | B2 | C_UNION | C_ADJUDICATED | D_UNION | D_ADJUDICATED |
|---|---|---|---|---|---|---|---|---|
| acrm-action-tabindex-removed-add-tag | NTU | PASS | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU+JB ✓ | FAIL NTU+JB ✓ | FAIL NTU ✓ | FAIL NTU ✓ |
| acrm-busy-left-true-toaster | AM | PASS | PASS | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ |
| acrm-button-to-div-create-company | RNC | PASS | FAIL RNC+AM ✓ | FAIL RNC+AM ✓ | FAIL RNC+AM ✓ | FAIL RNC+AM ✓ | FAIL RNC+AM ✓ | FAIL RNC+AM ✓ |
| acrm-combobox-keyboard-broken-select | IFUA | REVIEW | FAIL IFUA ✓ | FAIL IFUA ✓ | FAIL IFUA ✓ | FAIL IFUA ✓ | FAIL IFUA ✓ | FAIL IFUA ✓ |
| acrm-combobox-role-removed-select | RNC | FAIL SNC+NNC ✗ | FAIL SNC+RNC+NNC ✓ | FAIL SNC+RNC+NNC ✓ | FAIL SNC+RNC+NNC+IFUA ✓ | FAIL RNC+SNC+NNC+IFUA ✓ | FAIL SNC+RNC+NNC+IFUA ✓ | FAIL SNC+RNC+NNC+IFUA ✓ |
| acrm-dialog-containment-removed-add-task | FED | FAIL NNC ✗ | FAIL NNC+IFUA ✗ | FAIL NNC+IFUA ✗ | FAIL NNC+IFUA ✗ | FAIL IFUA+NNC ✗ | FAIL NNC+IFUA ✗ | FAIL NNC+IFUA ✗ |
| acrm-dialog-focus-not-restored-company-picker | FNR | PASS | FAIL FNM ✗ | FAIL FNM ✗ | FAIL FNM ✗ | FAIL FNM ✗ | FAIL FNM ✗ | FAIL FNM ✗ |
| acrm-dialog-initial-focus-add-task | FNM | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| acrm-dialog-labelledby-removed-add-task | NNC | FAIL NNC ✓ | FAIL FNM+NNC+FED ✓ | FAIL FNM+NNC+FED ✓ | FAIL FNM+NNC+FED ✓ | FAIL FNM+NNC ✓ | FAIL FNM+NNC+FED ✓ | FAIL FNM+NNC+FED ✓ |
| acrm-error-not-announced-form-control | AM | PASS | PASS | PASS | FAIL AM ✓ | FAIL AM ✓ | PASS | PASS |
| acrm-expanded-not-updated-theme | SNC | PASS | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | REVIEW | FAIL SNC ✓ | REVIEW |
| acrm-field-label-disassociated-text-input | NNC | FAIL NNC ✓ | FAIL NNC+IFUA ✓ | FAIL NNC+IFUA ✓ | FAIL NNC+IFUA+JB ✓ | FAIL NNC+IFUA+JB ✓ | FAIL NNC+IFUA ✓ | FAIL NNC+IFUA ✓ |
| acrm-focus-left-on-removed-tags | FNM | PASS | FAIL FNM ✓ | FAIL FNM ✓ | FAIL FNM ✓ | FAIL FNM ✓ | FAIL FNM ✓ | FAIL FNM ✓ |
| acrm-heading-to-div-contact-name | RNC | PASS | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ |
| acrm-image-alt-removed-company-avatar | NNC | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ |
| acrm-invalid-missing-form-control | SNC | PASS | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ |
| acrm-landmark-removed-main | NTU | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ |
| acrm-live-region-removed-toaster | AM | PASS | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ |
| acrm-live-update-repeated-toast | AD | PASS | PASS | FAIL AD ✓ | FAIL AD ✓ | REVIEW | FAIL AD ✓ | REVIEW |
| acrm-menu-focus-not-restored-theme | FNR | PASS | FAIL FNM ✗ | FAIL FNM ✗ | FAIL FNM+KT ✗ | FAIL FNM+KT ✗ | FAIL FNM ✗ | FAIL FNM ✗ |
| acrm-navigation-hidden-header | NTU | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ | REVIEW | FAIL NTU ✓ | FAIL NTU ✓ |
| acrm-pointer-only-activation-edit-contact | IFUA | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | REVIEW | FAIL JB ✓ | FAIL JB ✓ |
| acrm-required-field-unnamed-last-name | JB | FAIL NNC ✗ | FAIL NNC+JB ✓ | FAIL NNC+JB ✓ | FAIL NNC+JB ✓ | FAIL JB+NNC ✓ | FAIL NNC+JB ✓ | FAIL NNC+JB ✓ |
| acrm-tab-swallowed-note | KT | PASS | FAIL KT+NTU ✓ | FAIL KT+NTU ✓ | FAIL KT+NTU+JB ✓ | FAIL KT+NTU+JB ✓ | FAIL KT+NTU ✓ | FAIL KT+NTU ✓ |
| acrm-toast-duplicated-announcer | AD | PASS | FAIL AD ✓ | FAIL AD ✓ | FAIL AD ✓ | FAIL AD ✓ | FAIL AD ✓ | FAIL AD ✓ |
| acrm-toast-region-created-populated | AM | PASS | PASS | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ |
| oss-baseui-5532 | JB | FAIL NTU ✓ | FAIL NTU+JB ✓ | FAIL NTU+JB ✓ | FAIL NTU+JB ✓ | FAIL JB+NTU ✓ | FAIL NTU+JB ✓ | FAIL JB+NTU ✓ |
| oss-blueprint-6163 | IFUA | FAIL RNC ✗ | FAIL RNC+IFUA ✓ | FAIL RNC+IFUA ✓ | FAIL RNC+IFUA+JB ✓ | FAIL RNC+IFUA+JB ✓ | FAIL RNC+IFUA ✓ | FAIL RNC+IFUA ✓ |
| oss-bootstrap-15168 | JB | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| oss-bootstrap-35496 | FNR | PASS | PASS | PASS | FAIL FNR ✓ | FAIL FNR ✓ | FAIL FNR ✓ | FAIL FNR ✓ |
| oss-bootstrap-39189 | JB | PASS | REVIEW | REVIEW | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU ✓ |
| oss-carbon-18824 | SNC | PASS | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ |
| oss-carbon-5623 | JB | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| oss-carbon-7253 | NNC | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ |
| oss-carbon-7861 | JB | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| oss-carbon-8392 | JB | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| oss-chakra-6693 | JB | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| oss-datepicker-5428 | FNM | PASS | FAIL IFUA ✗ | FAIL IFUA ✗ | FAIL IFUA+JB ✗ | FAIL IFUA+JB ✗ | FAIL IFUA+JB ✗ | FAIL IFUA+JB ✗ |
| oss-fluent-18714 | JB | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| oss-fluent-27997 | SNC | PASS | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ |
| oss-fluent-4620 | JB | REVIEW | FAIL IFUA ✓ | FAIL IFUA ✓ | FAIL IFUA ✓ | REVIEW | FAIL IFUA ✓ | FAIL IFUA ✓ |
| oss-fluent-7796 | RNC | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ |
| oss-headlessui-2084 | JB | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| oss-mui-44048 | JB | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| oss-mui-45049 | JB | FAIL SNC ✗ | FAIL SNC+JB ✓ | FAIL SNC+JB ✓ | FAIL SNC+JB ✓ | FAIL SNC+JB ✓ | FAIL SNC+JB ✓ | FAIL SNC+JB ✓ |
| oss-mui-46734 | JB | FAIL NTU ✓ | FAIL NTU+JB ✓ | FAIL NTU+JB ✓ | FAIL NTU+JB ✓ | FAIL NTU+JB ✓ | FAIL NTU+JB ✓ | FAIL NTU+JB ✓ |
| oss-radix-4014 | KT | PASS | FAIL KT ✓ | FAIL KT ✓ | FAIL KT ✓ | FAIL KT ✓ | FAIL KT ✓ | FAIL KT ✓ |
| oss-ras-8637 | JB | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| oss-reactselect-4421 | JB | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| oss-vuetify-21591 | JB | PASS | PASS | PASS | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| oss-vuetify-22770 | JB | PASS | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW |
| oss-vuetify-9627 | FED | PASS | FAIL FED ✓ | FAIL FED ✓ | FAIL FED ✓ | FAIL FED ✓ | FAIL FED ✓ | FAIL FED ✓ |
| ras-action-tabindex-removed-create | NTU | PASS | FAIL NTU ✓ | FAIL NTU ✓ | FAIL NTU+JB ✓ | FAIL NTU+JB ✓ | FAIL NTU ✓ | FAIL NTU ✓ |
| ras-aria-modal-removed-category | FED | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW |
| ras-busy-left-true-notification | AM | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| ras-checked-stale-notifications | SNC | PASS | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ |
| ras-combobox-keyboard-broken-category | IFUA | REVIEW | FAIL IFUA ✓ | FAIL IFUA ✓ | FAIL IFUA ✓ | FAIL IFUA ✓ | FAIL IFUA ✓ | FAIL IFUA ✓ |
| ras-combobox-role-removed-category | RNC | PASS | FAIL RNC+IFUA ✓ | FAIL RNC+IFUA ✓ | FAIL RNC+IFUA ✓ | FAIL RNC+IFUA ✓ | FAIL RNC+IFUA ✓ | FAIL RNC+IFUA ✓ |
| ras-dialog-containment-removed-category | FED | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| ras-error-not-announced-title | AM | PASS | PASS | PASS | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ |
| ras-escape-not-closing-category | KT | REVIEW | FAIL KT ✓ | FAIL KT ✓ | FAIL KT ✓ | FAIL KT ✓ | FAIL KT ✓ | FAIL KT ✓ |
| ras-expanded-not-updated-post-autocomplete | SNC | PASS | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ |
| ras-field-label-disassociated-title | NNC | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ |
| ras-focus-left-on-removed-backlinks | FNM | PASS | FAIL FNM ✓ | FAIL FNM ✓ | FAIL FNM ✓ | FAIL FNM ✓ | FAIL FNM ✓ | FAIL FNM ✓ |
| ras-heading-to-div-page-title | RNC | PASS | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ | FAIL RNC ✓ |
| ras-icon-button-label-removed-configure | NNC | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ | FAIL NNC ✓ |
| ras-image-alt-removed-avatar | NNC | FAIL NNC ✓ | FAIL NNC+FNM ✓ | FAIL NNC+FNM ✓ | FAIL NNC+FNM ✓ | FAIL NNC ✓ | FAIL NNC+FNM ✓ | FAIL NNC+FNM ✓ |
| ras-invalid-missing-title | SNC | PASS | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ |
| ras-live-region-hidden-ancestor-notification | AM | PASS | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ | FAIL AM ✓ |
| ras-live-update-repeated-post-saved | AD | PASS | PASS | FAIL AD ✓ | FAIL AD ✓ | REVIEW | FAIL AD ✓ | REVIEW |
| ras-menu-focus-not-restored-category | FNR | PASS | FAIL FNM ✗ | FAIL FNM ✗ | FAIL FNM ✗ | FAIL FNM ✗ | FAIL FNM ✗ | FAIL FNM ✗ |
| ras-pointer-only-activation-edit | IFUA | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| ras-required-field-unnamed-teaser | JB | FAIL NNC ✗ | FAIL NNC+JB ✓ | FAIL NNC+JB ✓ | FAIL NNC+JB ✓ | FAIL JB+NNC ✓ | FAIL NNC+JB ✓ | FAIL NNC+JB ✓ |
| ras-selected-stale-post-form | SNC | PASS | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ | FAIL SNC ✓ |
| ras-submit-pointer-only-post-save | JB | REVIEW | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ | FAIL JB ✓ |
| ras-tab-roles-removed-post-form | RNC | FAIL SNC+RNC ✓ | FAIL RNC+SNC ✓ | FAIL RNC+SNC ✓ | FAIL RNC+SNC ✓ | FAIL RNC+SNC ✓ | FAIL RNC+SNC ✓ | FAIL RNC+SNC ✓ |
| ras-tab-swallowed-search | KT | PASS | FAIL KT+NTU ✓ | FAIL KT+NTU ✓ | FAIL KT+NTU+JB ✓ | FAIL KT+NTU+JB ✓ | FAIL KT+NTU ✓ | FAIL KT+NTU ✓ |

## Benign and unchanged items not PASS in every arm

| Item | Kind | A | B | B2 | C_UNION | C_ADJUDICATED | D_UNION | D_ADJUDICATED |
|---|---|---|---|---|---|---|---|---|
| oss-bootstrap-39189-twin | CSS_ONLY | PASS | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW |
| oss-bootstrap-39189-unchanged | unchanged | PASS | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW |
| oss-carbon-7861-twin | CSS_ONLY | PASS | PASS | PASS | REVIEW | REVIEW | PASS | PASS |
| oss-carbon-7861-unchanged | unchanged | PASS | PASS | PASS | REVIEW | REVIEW | PASS | PASS |
| oss-fluent-4620-twin | CSS_ONLY | PASS | PASS | PASS | REVIEW | REVIEW | PASS | PASS |
| oss-fluent-4620-unchanged | unchanged | PASS | PASS | PASS | REVIEW | REVIEW | PASS | PASS |
| oss-vuetify-22770-twin | CSS_ONLY | PASS | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW |
| oss-vuetify-22770-unchanged | unchanged | PASS | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW |
| ras-required-field-unnamed-teaser-twin | WRAPPER_ELEMENT | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW | REVIEW |

## Findings behind each non-PASS verdict

- **acrm-action-tabindex-removed-add-tag**
  - B FAIL NAV_TARGET_UNREACHABLE at `reach-add-tag` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-add-tag` (unreachable): candidate UNREACHABLE in 3 of 3
- **acrm-busy-left-true-toaster**
  - B2 FAIL ANNOUNCEMENT_MISSING at `save-company` (expectation-absent): announcementContains:Element created: candidate 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text
  - NVDA FAIL ANNOUNCEMENT_MISSING at `save-company` (expectation-absent): announcementContains:Element created: candidate 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s)
- **acrm-button-to-div-create-company**
  - B FAIL ROLE_NOT_CONVEYED at `reach-save` (expectation-role): focusOn:button/Create Company: candidate generic/Create Company / generic/Create Company / generic/Create Company
  - B FAIL ANNOUNCEMENT_MISSING at `save-company` (expectation-absent): announcementContains:Element created: candidate no live region holds it / no live region holds it / no live region holds it
  - B2 FAIL ANNOUNCEMENT_MISSING at `save-company` (expectation-absent): announcementContains:Element created: candidate 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text
  - NVDA FAIL ROLE_NOT_CONVEYED at `reach-save` (expectation-role): focusOn:button/Create Company: candidate Create Company section / Create Company section / Create Company section
  - NVDA FAIL ANNOUNCEMENT_MISSING at `save-company` (expectation-absent): announcementContains:Element created: candidate 0 utterance(s) / 0 utterance(s) / 0 utterance(s)
- **acrm-combobox-keyboard-broken-select**
  - A REVIEW at `pick-type` (axe-new-unmapped): axe region: base at most 0, candidate 1/1/1
  - B FAIL INTERACTION_FAILS_UNDER_AT at `pick-type` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL INTERACTION_FAILS_UNDER_AT at `pick-type` (unreachable): candidate UNREACHABLE in 3 of 3
- **acrm-combobox-role-removed-select**
  - A FAIL STATE_NOT_CONVEYED at `reach-add-task` (axe-aria-allowed-attr): axe aria-allowed-attr: base at most 0, candidate 2/2/2
  - A FAIL STATE_NOT_CONVEYED at `open-task-dialog` (axe-aria-allowed-attr): axe aria-allowed-attr: base at most 0, candidate 1/1/1
  - A FAIL STATE_NOT_CONVEYED at `reach-type` (axe-aria-allowed-attr): axe aria-allowed-attr: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `open-type` (axe-aria-input-field-name): axe aria-input-field-name: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `next-type` (axe-aria-input-field-name): axe aria-input-field-name: base at most 0, candidate 1/1/1
  - A FAIL STATE_NOT_CONVEYED at `pick-type` (axe-aria-allowed-attr): axe aria-allowed-attr: base at most 0, candidate 1/1/1
  - A FAIL STATE_NOT_CONVEYED at `reach-close` (axe-aria-allowed-attr): axe aria-allowed-attr: base at most 0, candidate 1/1/1
  - A FAIL STATE_NOT_CONVEYED at `wrap-around` (axe-aria-allowed-attr): axe aria-allowed-attr: base at most 0, candidate 1/1/1
  - B FAIL ROLE_NOT_CONVEYED at `reach-type` (expectation-role): focusOn:combobox/Type: candidate button/Type / button/Type / button/Type
  - NVDA FAIL ROLE_NOT_CONVEYED at `reach-type` (expectation-role): focusOn:combobox/Type: candidate Type button collapsed / Type button collapsed / Type button collapsed
  - NVDA FAIL INTERACTION_FAILS_UNDER_AT at `pick-type` (unreachable): candidate UNREACHABLE in 3 of 3
- **acrm-dialog-containment-removed-add-task**
  - A FAIL NAME_NOT_CONVEYED at `open-task-dialog` (axe-aria-command-name): axe aria-command-name: base at most 1, candidate 2/2/2
  - A FAIL NAME_NOT_CONVEYED at `open-task-dialog` (axe-button-name): axe button-name: base at most 0, candidate 6/6/6
  - A REVIEW at `open-task-dialog` (axe-new-unmapped): axe heading-order: base at most 0, candidate 1/1/1
  - A REVIEW at `open-task-dialog` (axe-new-unmapped): axe image-redundant-alt: base at most 0, candidate 1/1/1
  - A REVIEW at `open-task-dialog` (axe-new-unmapped): axe label-title-only: base at most 0, candidate 1/1/1
  - A REVIEW at `open-task-dialog` (axe-new-unmapped): axe landmark-unique: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `reach-type` (axe-aria-command-name): axe aria-command-name: base at most 1, candidate 2/2/2
  - A FAIL NAME_NOT_CONVEYED at `reach-type` (axe-button-name): axe button-name: base at most 0, candidate 6/6/6
  - A REVIEW at `reach-type` (axe-new-unmapped): axe heading-order: base at most 0, candidate 1/1/1
  - A REVIEW at `reach-type` (axe-new-unmapped): axe image-redundant-alt: base at most 0, candidate 1/1/1
  - A REVIEW at `reach-type` (axe-new-unmapped): axe label-title-only: base at most 0, candidate 1/1/1
  - A REVIEW at `reach-type` (axe-new-unmapped): axe landmark-unique: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `pick-type` (axe-aria-command-name): axe aria-command-name: base at most 1, candidate 2/2/2
  - A FAIL NAME_NOT_CONVEYED at `pick-type` (axe-button-name): axe button-name: base at most 0, candidate 6/6/6
  - A REVIEW at `pick-type` (axe-new-unmapped): axe heading-order: base at most 0, candidate 1/1/1
  - A REVIEW at `pick-type` (axe-new-unmapped): axe image-redundant-alt: base at most 0, candidate 1/1/1
  - A REVIEW at `pick-type` (axe-new-unmapped): axe label-title-only: base at most 0, candidate 1/1/1
  - A REVIEW at `pick-type` (axe-new-unmapped): axe landmark-unique: base at most 0, candidate 1/1/1
  - B FAIL INTERACTION_FAILS_UNDER_AT at `pick-type` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL INTERACTION_FAILS_UNDER_AT at `pick-type` (unreachable): candidate UNREACHABLE in 3 of 3
- **acrm-dialog-focus-not-restored-company-picker**
  - B FAIL FOCUS_NOT_MOVED at `close-company` (expectation-focus): focusOn:combobox/Company: candidate RootWebArea/Atomic CRM / RootWebArea/Atomic CRM / RootWebArea/Atomic CRM
  - NVDA FAIL FOCUS_NOT_MOVED at `close-company` (expectation-focus): focusOn:combobox/Company: candidate Atomic CRM document ￼ / Atomic CRM document ￼ / Atomic CRM document ￼
- **acrm-dialog-labelledby-removed-add-task**
  - A FAIL NAME_NOT_CONVEYED at `open-task-dialog` (axe-aria-dialog-name): axe aria-dialog-name: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `reach-type` (axe-aria-dialog-name): axe aria-dialog-name: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `pick-type` (axe-aria-dialog-name): axe aria-dialog-name: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `reach-close` (axe-aria-dialog-name): axe aria-dialog-name: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `wrap-around` (axe-aria-dialog-name): axe aria-dialog-name: base at most 0, candidate 1/1/1
  - B FAIL FOCUS_NOT_MOVED at `open-task-dialog` (expectation-focus): focusOn:dialog/Create task: candidate textbox/Description / textbox/Description / textbox/Description
  - B FAIL FOCUS_ESCAPES_DIALOG at `wrap-around` (expectation-focus): focusOn:dialog/Create task: candidate textbox/Description / textbox/Description / textbox/Description
  - NVDA FAIL NAME_NOT_CONVEYED at `open-task-dialog` (expectation-name): focusOn:dialog/Create task: candidate dialog / form landmark / dialog / form landmark / Description edit multi line blank / dialog / form landmark / dialog / form landmark / Description edit multi line blank / dialog / form landmark / dialog / form landmark / Description edit multi line blank
- **acrm-error-not-announced-form-control**
  - NVDA FAIL ANNOUNCEMENT_MISSING at `reach-linkedin` (expectation-absent): announcementContains:URL must be from linkedin: candidate 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s)
- **acrm-expanded-not-updated-theme**
  - B FAIL STATE_NOT_CONVEYED at `open-theme` (expectation-state): stateIs:button/Toggle theme/expanded=true: candidate button/Toggle theme expanded=false / button/Toggle theme expanded=false / button/Toggle theme expanded=false
- **acrm-field-label-disassociated-text-input**
  - A FAIL NAME_NOT_CONVEYED at `reach-save` (axe-label): axe label: base at most 0, candidate 5/5/5
  - A REVIEW at `reach-save` (axe-new-unmapped): axe label-title-only: base at most 2, candidate 7/7/7
  - A FAIL NAME_NOT_CONVEYED at `save-contact` (axe-label): axe label: base at most 0, candidate 5/5/5
  - A REVIEW at `save-contact` (axe-new-unmapped): axe label-title-only: base at most 2, candidate 7/7/7
  - A FAIL NAME_NOT_CONVEYED at `reach-last-name` (axe-label): axe label: base at most 0, candidate 5/5/5
  - A REVIEW at `reach-last-name` (axe-new-unmapped): axe label-title-only: base at most 2, candidate 7/7/7
  - B FAIL NAME_NOT_CONVEYED at `save-contact` (expectation-name): focusOn:textbox/First name: candidate textbox/ / textbox/ / textbox/
  - B FAIL NAME_NOT_CONVEYED at `save-contact` (expectation-name): stateIs:textbox/First name/invalid=true: candidate (target not found) / (target not found) / (target not found)
  - B FAIL INTERACTION_FAILS_UNDER_AT at `reach-last-name` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL NAME_NOT_CONVEYED at `save-contact` (expectation-name): focusOn:textbox/First name: candidate edit invalid entry Required blank / Close toast The form is not valid. Please check for errors / Notifications alt plus T / edit invalid entry Required blank / Close toast The form is not valid. Please check for errors / Notifications alt plus T / edit invalid entry Required blank / Close toast The form is not valid. Please check for errors / Notifications alt plus T
  - NVDA FAIL JOURNEY_BLOCKED at `reach-last-name` (unreachable): candidate UNREACHABLE in 3 of 3
- **acrm-focus-left-on-removed-tags**
  - B FAIL FOCUS_NOT_MOVED at `pick-tag` (expectation-focus): focusOn:button/Add tag: candidate RootWebArea/Atomic CRM / RootWebArea/Atomic CRM / RootWebArea/Atomic CRM
  - B REVIEW at `back-to-edit` (path-changed): candidate PATH_CHANGED in 3 of 3
  - NVDA FAIL FOCUS_NOT_MOVED at `pick-tag` (expectation-focus): focusOn:button/Add tag: candidate Atomic CRM document ￼ / Atomic CRM document ￼ / Atomic CRM document ￼
  - NVDA REVIEW at `back-to-edit` (path-changed): candidate PATH_CHANGED in 3 of 3
- **acrm-heading-to-div-contact-name**
  - B FAIL ROLE_NOT_CONVEYED at `reach-name` (expectation-role): focusOn:heading/Spencer Ledner: candidate StaticText/Spencer Ledner / StaticText/Spencer Ledner / StaticText/Spencer Ledner
  - NVDA FAIL ROLE_NOT_CONVEYED at `reach-name` (expectation-role): focusOn:heading/Spencer Ledner: candidate Spencer Ledner / Spencer Ledner / Spencer Ledner
- **acrm-image-alt-removed-company-avatar**
  - A FAIL NAME_NOT_CONVEYED at `page-top` (axe-image-alt): axe image-alt: base at most 0, candidate 3/3/3
  - A FAIL NAME_NOT_CONVEYED at `page-top` (axe-link-name): axe link-name: base at most 0, candidate 3/3/3
  - A FAIL NAME_NOT_CONVEYED at `reach-name` (axe-image-alt): axe image-alt: base at most 0, candidate 3/3/3
  - A FAIL NAME_NOT_CONVEYED at `reach-name` (axe-link-name): axe link-name: base at most 0, candidate 3/3/3
  - A FAIL NAME_NOT_CONVEYED at `reach-company-logo` (axe-image-alt): axe image-alt: base at most 0, candidate 3/3/3
  - A FAIL NAME_NOT_CONVEYED at `reach-company-logo` (axe-link-name): axe link-name: base at most 0, candidate 3/3/3
  - B FAIL NAME_NOT_CONVEYED at `reach-company-logo` (expectation-name): focusOn:img/Connelly, Lind and Jaskolski: candidate image/ / image/ / image/
  - NVDA FAIL NAME_NOT_CONVEYED at `reach-company-logo` (expectation-name): focusOn:img/Connelly, Lind and Jaskolski: candidate link Unlabeled graphic To get missing image descriptions, open the context menu. / link Unlabeled graphic To get missing image descriptions, open the context menu. / link Unlabeled graphic To get missing image descriptions, open the context menu.
- **acrm-invalid-missing-form-control**
  - B FAIL STATE_NOT_CONVEYED at `save-contact` (expectation-state): stateIs:textbox/First name/invalid=true: candidate textbox/First name invalid=false / textbox/First name invalid=false / textbox/First name invalid=false
  - NVDA FAIL STATE_NOT_CONVEYED at `save-contact` (expectation-state): stateIs:textbox/First name/invalid=true: candidate First name edit Required blank / Close toast The form is not valid. Please check for errors / Notifications alt plus T / First name edit Required blank / Close toast The form is not valid. Please check for errors / Notifications alt plus T / First name edit Required blank / Close toast The form is not valid. Please check for errors / Notifications alt plus T
- **acrm-landmark-removed-main**
  - A FAIL NAV_TARGET_UNREACHABLE at `page-top` (axe-landmark-one-main): axe landmark-one-main: base at most 0, candidate 1/1/1
  - A REVIEW at `page-top` (axe-new-unmapped): axe region: base at most 0, candidate 29/29/29
  - A FAIL NAV_TARGET_UNREACHABLE at `reach-deals-link` (axe-landmark-one-main): axe landmark-one-main: base at most 0, candidate 1/1/1
  - A REVIEW at `reach-deals-link` (axe-new-unmapped): axe region: base at most 0, candidate 29/29/29
  - A FAIL NAV_TARGET_UNREACHABLE at `reach-main` (axe-landmark-one-main): axe landmark-one-main: base at most 0, candidate 1/1/1
  - A REVIEW at `reach-main` (axe-new-unmapped): axe region: base at most 0, candidate 29/29/29
  - B FAIL NAV_TARGET_UNREACHABLE at `reach-main` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL NAV_TARGET_UNREACHABLE at `reach-main` (unreachable): candidate UNREACHABLE in 3 of 3
- **acrm-live-region-removed-toaster**
  - B FAIL ANNOUNCEMENT_MISSING at `save-company` (expectation-absent): announcementContains:Element created: candidate no live region holds it / no live region holds it / no live region holds it / no live region holds it / no live region holds it
  - B2 FAIL ANNOUNCEMENT_MISSING at `save-company` (expectation-absent): announcementContains:Element created: candidate 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text
  - NVDA FAIL ANNOUNCEMENT_MISSING at `save-company` (expectation-absent): announcementContains:Element created: candidate 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s)
- **acrm-live-update-repeated-toast**
  - B2 FAIL ANNOUNCEMENT_DUPLICATED at `save-company` (duplicate): announcementContains:Element created: 2/2/2 in the candidate, once in the base
  - NVDA REVIEW at `save-company` (duplicate-speech-only): announcementContains:Element created: spoken twice in the candidate, once in the base (DR-0042)
- **acrm-menu-focus-not-restored-theme**
  - B FAIL FOCUS_NOT_MOVED at `close-theme` (expectation-focus): focusOn:button/Toggle theme: candidate RootWebArea/Atomic CRM / RootWebArea/Atomic CRM / RootWebArea/Atomic CRM
  - NVDA FAIL KEYBOARD_TRAP at `close-theme` (expectation-focus): focusOn:button/Toggle theme: candidate (silence) / (silence) / (silence)
- **acrm-navigation-hidden-header**
  - A FAIL NAV_TARGET_UNREACHABLE at `page-top` (axe-aria-hidden-focus): axe aria-hidden-focus: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `reach-deals-link` (axe-aria-hidden-focus): axe aria-hidden-focus: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `reach-main` (axe-aria-hidden-focus): axe aria-hidden-focus: base at most 0, candidate 1/1/1
- **acrm-pointer-only-activation-edit-contact**
  - B FAIL JOURNEY_BLOCKED at `reach-first-name` (unreachable): candidate UNREACHABLE in 3 of 3
- **acrm-required-field-unnamed-last-name**
  - A FAIL NAME_NOT_CONVEYED at `reach-save` (axe-label): axe label: base at most 0, candidate 1/1/1
  - A REVIEW at `reach-save` (axe-new-unmapped): axe label-title-only: base at most 2, candidate 3/3/3
  - A FAIL NAME_NOT_CONVEYED at `save-contact` (axe-label): axe label: base at most 0, candidate 1/1/1
  - A REVIEW at `save-contact` (axe-new-unmapped): axe label-title-only: base at most 2, candidate 3/3/3
  - A FAIL NAME_NOT_CONVEYED at `reach-last-name` (axe-label): axe label: base at most 0, candidate 1/1/1
  - A REVIEW at `reach-last-name` (axe-new-unmapped): axe label-title-only: base at most 2, candidate 3/3/3
  - B FAIL JOURNEY_BLOCKED at `reach-last-name` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-last-name` (unreachable): candidate UNREACHABLE in 3 of 3
- **acrm-tab-swallowed-note**
  - B FAIL KEYBOARD_TRAP at `leave-note` (expectation-focus): focusOn:button/Show options: candidate textbox/Add a note / textbox/Add a note / textbox/Add a note
  - B FAIL NAV_TARGET_UNREACHABLE at `reach-edit` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL KEYBOARD_TRAP at `leave-note` (expectation-focus): focusOn:button/Show options: candidate (silence) / (silence) / (silence)
  - NVDA FAIL JOURNEY_BLOCKED at `reach-edit` (unreachable): candidate UNREACHABLE in 3 of 3
- **acrm-toast-duplicated-announcer**
  - B FAIL ANNOUNCEMENT_DUPLICATED at `save-company` (duplicate): announcementContains:Element created: 2/2/2 in the candidate, once in the base
  - B2 FAIL ANNOUNCEMENT_DUPLICATED at `save-company` (duplicate): announcementContains:Element created: 2/2/2 in the candidate, once in the base
  - NVDA REVIEW at `save-company` (duplicate-speech-only): announcementContains:Element created: spoken twice in the candidate, once in the base (DR-0042)
- **acrm-toast-region-created-populated**
  - B2 FAIL ANNOUNCEMENT_MISSING at `save-company` (expectation-absent): announcementContains:Element created: candidate 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text
  - NVDA FAIL ANNOUNCEMENT_MISSING at `save-company` (expectation-absent): announcementContains:Element created: candidate 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s)
- **oss-baseui-5532**
  - A FAIL NAV_TARGET_UNREACHABLE at `show-tabs` (axe-landmark-one-main): axe landmark-one-main: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `show-tabs` (axe-page-has-heading-one): axe page-has-heading-one: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `reach-overview` (axe-landmark-one-main): axe landmark-one-main: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `reach-overview` (axe-page-has-heading-one): axe page-has-heading-one: base at most 0, candidate 1/1/1
  - B FAIL JOURNEY_BLOCKED at `reach-overview` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-overview` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-blueprint-6163**
  - A FAIL ROLE_NOT_CONVEYED at `choose-film` (axe-aria-required-children): axe aria-required-children: base at most 0, candidate 1/1/1
  - A FAIL ROLE_NOT_CONVEYED at `choose-film` (axe-aria-required-parent): axe aria-required-parent: base at most 0, candidate 5/5/5
  - A FAIL ROLE_NOT_CONVEYED at `back-on-select` (axe-aria-required-children): axe aria-required-children: base at most 0, candidate 1/1/1
  - A FAIL ROLE_NOT_CONVEYED at `back-on-select` (axe-aria-required-parent): axe aria-required-parent: base at most 0, candidate 5/5/5
  - B FAIL INTERACTION_FAILS_UNDER_AT at `back-on-select` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `back-on-select` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-bootstrap-15168**
  - B FAIL JOURNEY_BLOCKED at `reach-information` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-information` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-bootstrap-35496**
  - NVDA FAIL FOCUS_NOT_RESTORED at `close-menu` (expectation-focus): focusOn:button/Menu: candidate section / bootstrap-35496 document ￼ / section / bootstrap-35496 document ￼ / section / bootstrap-35496 document ￼
- **oss-bootstrap-39189**
  - B REVIEW at `open-details` (base-not-reached): base reached the step in 0 of 3 attempts
  - NVDA FAIL NAV_TARGET_UNREACHABLE at `open-details` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-bootstrap-39189-twin**
  - B REVIEW at `open-details` (base-not-reached): base reached the step in 0 of 3 attempts
- **oss-bootstrap-39189-unchanged**
  - B REVIEW at `open-details` (base-not-reached): base reached the step in 0 of 3 attempts
- **oss-carbon-18824**
  - B FAIL STATE_NOT_CONVEYED at `toggle-star` (expectation-state): stateIs:button/Favourite/pressed=true: candidate button/Favourite pressed=false / button/Favourite pressed=false / button/Favourite pressed=false
  - NVDA FAIL STATE_NOT_CONVEYED at `toggle-star` (expectation-state): stateIs:button/Favourite/pressed=true: candidate (silence) / (silence) / (silence)
- **oss-carbon-5623**
  - B FAIL JOURNEY_BLOCKED at `reach-order` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-order` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-carbon-7253**
  - A FAIL NAME_NOT_CONVEYED at `page-top` (axe-button-name): axe button-name: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `reach-previous` (axe-button-name): axe button-name: base at most 0, candidate 1/1/1
  - B FAIL NAME_NOT_CONVEYED at `reach-previous` (expectation-name): focusOn:button/Previous page: candidate button/ / button/ / button/
  - NVDA FAIL NAME_NOT_CONVEYED at `reach-previous` (expectation-name): focusOn:button/Previous page: candidate button unavailable / button unavailable / button unavailable
- **oss-carbon-7861**
  - B FAIL JOURNEY_BLOCKED at `reach-result` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA REVIEW at `reach-result` (base-not-reached): base reached the step in 0 of 3 attempts
- **oss-carbon-7861-twin**
  - NVDA REVIEW at `reach-result` (base-not-reached): base reached the step in 0 of 3 attempts
- **oss-carbon-7861-unchanged**
  - NVDA REVIEW at `reach-result` (base-not-reached): base reached the step in 0 of 3 attempts
- **oss-carbon-8392**
  - B FAIL JOURNEY_BLOCKED at `reach-saved` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-saved` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-chakra-6693**
  - B FAIL JOURNEY_BLOCKED at `reach-result` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-result` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-datepicker-5428**
  - B FAIL INTERACTION_FAILS_UNDER_AT at `previous-day` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `previous-day` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-fluent-18714**
  - B FAIL JOURNEY_BLOCKED at `reach-query-feedback` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-query-feedback` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-fluent-27997**
  - B FAIL STATE_NOT_CONVEYED at `select-beta` (expectation-state): stateIs:radio/Select Beta/checked=true: candidate radio/Select Beta checked=false / radio/Select Beta checked=false / radio/Select Beta checked=false
- **oss-fluent-4620**
  - A REVIEW at `advance-one-month` (axe-new-unmapped): axe color-contrast: base at most 2, candidate 5/5/5
  - A REVIEW at `return-to-browse-mode` (axe-new-unmapped): axe color-contrast: base at most 2, candidate 5/5/5
  - A REVIEW at `read-from-top` (axe-new-unmapped): axe color-contrast: base at most 2, candidate 5/5/5
  - A REVIEW at `reach-expected-month` (axe-new-unmapped): axe color-contrast: base at most 2, candidate 5/5/5
  - B FAIL INTERACTION_FAILS_UNDER_AT at `reach-expected-month` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA REVIEW at `reach-expected-month` (base-not-reached): base reached the step in 0 of 3 attempts
- **oss-fluent-4620-twin**
  - NVDA REVIEW at `reach-expected-month` (base-not-reached): base reached the step in 0 of 3 attempts
- **oss-fluent-4620-unchanged**
  - NVDA REVIEW at `reach-expected-month` (base-not-reached): base reached the step in 0 of 3 attempts
- **oss-fluent-7796**
  - A FAIL ROLE_NOT_CONVEYED at `page-top` (axe-aria-required-children): axe aria-required-children: base at most 0, candidate 1/1/1
  - A FAIL ROLE_NOT_CONVEYED at `reach-first-card` (axe-aria-required-children): axe aria-required-children: base at most 0, candidate 1/1/1
  - A FAIL ROLE_NOT_CONVEYED at `reach-second-card` (axe-aria-required-children): axe aria-required-children: base at most 0, candidate 1/1/1
  - B FAIL ROLE_NOT_CONVEYED at `reach-first-card` (expectation-role): focusOn:listitem/#card-1: candidate link/Quarterly report StaticText/Quarterly report / link/Quarterly report StaticText/Quarterly report / link/Quarterly report StaticText/Quarterly report
  - B FAIL ROLE_NOT_CONVEYED at `reach-second-card` (expectation-role): focusOn:listitem/#card-2: candidate link/Product roadmap StaticText/Product roadmap / link/Product roadmap StaticText/Product roadmap / link/Product roadmap StaticText/Product roadmap
- **oss-headlessui-2084**
  - B FAIL JOURNEY_BLOCKED at `reach-result` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-result` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-mui-44048**
  - B FAIL JOURNEY_BLOCKED at `reach-information` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-information` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-mui-45049**
  - A FAIL STATE_NOT_CONVEYED at `attempt-past-upper-mark` (axe-aria-valid-attr-value): axe aria-valid-attr-value: base at most 0, candidate 1/1/1
  - A FAIL STATE_NOT_CONVEYED at `browse-level` (axe-aria-valid-attr-value): axe aria-valid-attr-value: base at most 0, candidate 1/1/1
  - A FAIL STATE_NOT_CONVEYED at `start-document` (axe-aria-valid-attr-value): axe aria-valid-attr-value: base at most 0, candidate 1/1/1
  - A FAIL STATE_NOT_CONVEYED at `reach-preserved-level` (axe-aria-valid-attr-value): axe aria-valid-attr-value: base at most 0, candidate 1/1/1
  - B FAIL JOURNEY_BLOCKED at `reach-preserved-level` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-preserved-level` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-mui-46734**
  - A FAIL NAV_TARGET_UNREACHABLE at `choose-entry` (axe-landmark-one-main): axe landmark-one-main: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `choose-entry` (axe-page-has-heading-one): axe page-has-heading-one: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `browse-result` (axe-landmark-one-main): axe landmark-one-main: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `browse-result` (axe-page-has-heading-one): axe page-has-heading-one: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `start-document` (axe-landmark-one-main): axe landmark-one-main: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `start-document` (axe-page-has-heading-one): axe page-has-heading-one: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `reach-chosen-entry` (axe-landmark-one-main): axe landmark-one-main: base at most 0, candidate 1/1/1
  - A FAIL NAV_TARGET_UNREACHABLE at `reach-chosen-entry` (axe-page-has-heading-one): axe page-has-heading-one: base at most 0, candidate 1/1/1
  - B FAIL JOURNEY_BLOCKED at `reach-chosen-entry` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-chosen-entry` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-radix-4014**
  - B FAIL KEYBOARD_TRAP at `close-dialog` (expectation-focus): focusOn:button/Edit profile: candidate textbox/Name / textbox/Name / textbox/Name
  - NVDA FAIL KEYBOARD_TRAP at `close-dialog` (expectation-focus): focusOn:button/Edit profile: candidate (silence) / (silence) / (silence)
- **oss-ras-8637**
  - B FAIL JOURNEY_BLOCKED at `reach-expected-date` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-expected-date` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-reactselect-4421**
  - B FAIL JOURNEY_BLOCKED at `reach-chosen-orange` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-chosen-orange` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-vuetify-21591**
  - NVDA FAIL JOURNEY_BLOCKED at `enter-item-one` (unreachable): candidate UNREACHABLE in 3 of 3
- **oss-vuetify-22770**
  - B REVIEW at `reach-autocomplete` (base-not-reached): base reached the step in 0 of 3 attempts
  - NVDA REVIEW at `reach-autocomplete` (base-not-reached): base reached the step in 0 of 3 attempts
- **oss-vuetify-22770-twin**
  - B REVIEW at `reach-autocomplete` (base-not-reached): base reached the step in 0 of 3 attempts
  - NVDA REVIEW at `reach-autocomplete` (base-not-reached): base reached the step in 0 of 3 attempts
- **oss-vuetify-22770-unchanged**
  - B REVIEW at `reach-autocomplete` (base-not-reached): base reached the step in 0 of 3 attempts
  - NVDA REVIEW at `reach-autocomplete` (base-not-reached): base reached the step in 0 of 3 attempts
- **oss-vuetify-9627**
  - B FAIL FOCUS_ESCAPES_DIALOG at `leave-forwards` (expectation-focus): focusOn:dialog/Edit name: candidate button/BEFORE / button/BEFORE / button/BEFORE
- **ras-action-tabindex-removed-create**
  - B FAIL NAV_TARGET_UNREACHABLE at `reach-create` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-create` (unreachable): candidate UNREACHABLE in 3 of 3
- **ras-aria-modal-removed-category**
  - A REVIEW at `open-create` (axe-new-unmapped): axe image-redundant-alt: base at most 0, candidate 1/1/1
  - A REVIEW at `reach-cancel` (axe-new-unmapped): axe image-redundant-alt: base at most 0, candidate 1/1/1
  - A REVIEW at `wrap-around` (axe-new-unmapped): axe image-redundant-alt: base at most 0, candidate 1/1/1
  - A REVIEW at `browse-mode` (axe-new-unmapped): axe image-redundant-alt: base at most 0, candidate 1/1/1
  - A REVIEW at `b1` (axe-new-unmapped): axe image-redundant-alt: base at most 0, candidate 1/1/1
  - A REVIEW at `b2` (axe-new-unmapped): axe image-redundant-alt: base at most 0, candidate 1/1/1
  - A REVIEW at `b3` (axe-new-unmapped): axe image-redundant-alt: base at most 0, candidate 1/1/1
- **ras-checked-stale-notifications**
  - B FAIL STATE_NOT_CONVEYED at `toggle-ray` (expectation-state): stateIs:checkbox/Ray Hakt/checked=false: candidate checkbox/☐ Ray Hakt checked=true / checkbox/☐ Ray Hakt checked=true / checkbox/☐ Ray Hakt checked=true
  - NVDA FAIL STATE_NOT_CONVEYED at `toggle-ray` (expectation-state): stateIs:checkbox/Ray Hakt/checked=false: candidate (silence) / (silence) / (silence)
- **ras-combobox-keyboard-broken-category**
  - A REVIEW at `pick-option` (axe-new-unmapped): axe region: base at most 0, candidate 1/1/1
  - B FAIL INTERACTION_FAILS_UNDER_AT at `pick-option` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL INTERACTION_FAILS_UNDER_AT at `pick-option` (unreachable): candidate UNREACHABLE in 3 of 3
- **ras-combobox-role-removed-category**
  - B FAIL ROLE_NOT_CONVEYED at `reach-category` (expectation-role): focusOn:combobox/Category: candidate button/Category Tech / button/Category Tech / button/Category Tech
  - B FAIL INTERACTION_FAILS_UNDER_AT at `pick-option` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL ROLE_NOT_CONVEYED at `reach-category` (expectation-role): focusOn:combobox/Category: candidate clickable Category Tech menu button collapsed opens list ​ / clickable Category Tech menu button collapsed opens list ​ / clickable Category Tech menu button collapsed opens list ​
  - NVDA FAIL INTERACTION_FAILS_UNDER_AT at `pick-option` (unreachable): candidate UNREACHABLE in 3 of 3
- **ras-error-not-announced-title**
  - NVDA FAIL ANNOUNCEMENT_MISSING at `save-post` (expectation-absent): announcementContains:Required: candidate 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s)
- **ras-escape-not-closing-category**
  - A REVIEW at `leave-focus-mode` (axe-new-unmapped): axe region: base at most 0, candidate 1/1/1
  - A REVIEW at `close-category` (axe-new-unmapped): axe region: base at most 0, candidate 1/1/1
  - B FAIL KEYBOARD_TRAP at `close-category` (expectation-focus): focusOn:combobox/Category: candidate option/Tech / option/Tech / option/Tech
  - NVDA FAIL KEYBOARD_TRAP at `close-category` (expectation-focus): focusOn:combobox/Category: candidate (silence) / (silence) / (silence)
- **ras-expanded-not-updated-post-autocomplete**
  - B FAIL STATE_NOT_CONVEYED at `open-post` (expectation-state): stateIs:combobox/Post/expanded=true: candidate combobox/Post expanded=false / combobox/Post expanded=false / combobox/Post expanded=false
  - NVDA FAIL STATE_NOT_CONVEYED at `open-post` (expectation-state): stateIs:combobox/Post/expanded=true: candidate Minima ea vero omnis odit officiis aut - 6 / Minima ea vero omnis odit officiis aut - 6 / Minima ea vero omnis odit officiis aut - 6
- **ras-field-label-disassociated-title**
  - A FAIL NAME_NOT_CONVEYED at `reach-save` (axe-label): axe label: base at most 1, candidate 2/2/2
  - A REVIEW at `reach-save` (axe-new-unmapped): axe label-title-only: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `save-post` (axe-label): axe label: base at most 1, candidate 2/2/2
  - A REVIEW at `save-post` (axe-new-unmapped): axe label-title-only: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `reach-teaser` (axe-label): axe label: base at most 1, candidate 2/2/2
  - A REVIEW at `reach-teaser` (axe-new-unmapped): axe label-title-only: base at most 0, candidate 1/1/1
  - B FAIL NAME_NOT_CONVEYED at `save-post` (expectation-name): focusOn:textbox/Title: candidate textbox/ / textbox/ / textbox/
  - B FAIL NAME_NOT_CONVEYED at `save-post` (expectation-name): stateIs:textbox/Title/invalid=true: candidate (target not found) / (target not found) / (target not found)
  - NVDA FAIL NAME_NOT_CONVEYED at `save-post` (expectation-name): focusOn:textbox/Title: candidate edit invalid entry Required blank / alert The form is not valid. Please check for errors / edit invalid entry Required blank / alert The form is not valid. Please check for errors / edit invalid entry Required blank / alert The form is not valid. Please check for errors
- **ras-focus-left-on-removed-backlinks**
  - B FAIL FOCUS_NOT_MOVED at `add-backlink` (expectation-focus): focusOn:Date/Date: candidate RootWebArea/React Admin / RootWebArea/React Admin / RootWebArea/React Admin
  - NVDA FAIL FOCUS_NOT_MOVED at `add-backlink` (expectation-focus): focusOn:Date/Date: candidate spin button / button Add / spin button / button Add / spin button / button Add
- **ras-heading-to-div-page-title**
  - B FAIL ROLE_NOT_CONVEYED at `reach-title` (expectation-role): focusOn:heading/Accusantium: candidate StaticText/Post "Accusantium qui nihil voluptatum quia voluptas maxime ab similique" / StaticText/Post "Accusantium qui nihil voluptatum quia voluptas maxime ab similique" / StaticText/Post "Accusantium qui nihil voluptatum quia voluptas maxime ab similique"
  - NVDA FAIL ROLE_NOT_CONVEYED at `reach-title` (expectation-role): focusOn:heading/Accusantium: candidate clickable Post Accusantium qui nihil voluptatum quia voluptas maxime ab similique / clickable Post Accusantium qui nihil voluptatum quia voluptas maxime ab similique / clickable Post Accusantium qui nihil voluptatum quia voluptas maxime ab similique
- **ras-icon-button-label-removed-configure**
  - A FAIL NAME_NOT_CONVEYED at `reach-configure` (axe-button-name): axe button-name: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `page-top` (axe-button-name): axe button-name: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `reach-title` (axe-button-name): axe button-name: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `reach-profile` (axe-button-name): axe button-name: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `avatar-line` (axe-button-name): axe button-name: base at most 0, candidate 1/1/1
  - B FAIL NAME_NOT_CONVEYED at `reach-configure` (expectation-name): focusOn:button/Configure this page: candidate button/ / button/ / button/
  - NVDA FAIL NAME_NOT_CONVEYED at `reach-configure` (expectation-name): focusOn:button/Configure this page: candidate button / button / button
- **ras-image-alt-removed-avatar**
  - A FAIL NAME_NOT_CONVEYED at `reach-configure` (axe-image-alt): axe image-alt: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `page-top` (axe-image-alt): axe image-alt: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `reach-title` (axe-image-alt): axe image-alt: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `reach-profile` (axe-image-alt): axe image-alt: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `avatar-line` (axe-image-alt): axe image-alt: base at most 0, candidate 1/1/1
  - B FAIL FOCUS_NOT_MOVED at `avatar-line` (expectation-focus): focusOn:img/John Doe: candidate menuitem/Posts / menuitem/Posts / menuitem/Posts
- **ras-invalid-missing-title**
  - B FAIL STATE_NOT_CONVEYED at `save-post` (expectation-state): stateIs:textbox/Title/invalid=true: candidate textbox/Title invalid=false / textbox/Title invalid=false / textbox/Title invalid=false
  - NVDA FAIL STATE_NOT_CONVEYED at `save-post` (expectation-state): stateIs:textbox/Title/invalid=true: candidate Title edit Required blank / alert The form is not valid. Please check for errors / Title edit Required blank / alert The form is not valid. Please check for errors / Title edit Required blank / alert The form is not valid. Please check for errors
- **ras-live-region-hidden-ancestor-notification**
  - B FAIL ANNOUNCEMENT_MISSING at `save-post` (expectation-absent): announcementContains:Post updated: candidate no live region holds it / no live region holds it / no live region holds it / no live region holds it / no live region holds it
  - B2 FAIL ANNOUNCEMENT_MISSING at `save-post` (expectation-absent): announcementContains:Post updated: candidate 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text / 0 announcing event(s), 0 tied to the text
  - NVDA FAIL ANNOUNCEMENT_MISSING at `save-post` (expectation-absent): announcementContains:Post updated: candidate 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s) / 0 utterance(s)
- **ras-live-update-repeated-post-saved**
  - B2 FAIL ANNOUNCEMENT_DUPLICATED at `save-post` (duplicate): announcementContains:Post updated: 2/2/2 in the candidate, once in the base
  - NVDA REVIEW at `save-post` (duplicate-speech-only): announcementContains:Post updated: spoken twice in the candidate, once in the base (DR-0042)
- **ras-menu-focus-not-restored-category**
  - B FAIL FOCUS_NOT_MOVED at `close-category` (expectation-focus): focusOn:combobox/Category: candidate RootWebArea/React Admin / RootWebArea/React Admin / RootWebArea/React Admin
  - NVDA FAIL FOCUS_NOT_MOVED at `close-category` (expectation-focus): focusOn:combobox/Category: candidate main landmark / menu / React Admin document ￼ / main landmark / menu / React Admin document ￼ / main landmark / menu / React Admin document ￼
- **ras-required-field-unnamed-teaser**
  - A FAIL NAME_NOT_CONVEYED at `reach-save` (axe-label): axe label: base at most 1, candidate 2/2/2
  - A REVIEW at `reach-save` (axe-new-unmapped): axe label-title-only: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `save-post` (axe-label): axe label: base at most 1, candidate 2/2/2
  - A REVIEW at `save-post` (axe-new-unmapped): axe label-title-only: base at most 0, candidate 1/1/1
  - A FAIL NAME_NOT_CONVEYED at `reach-teaser` (axe-label): axe label: base at most 1, candidate 2/2/2
  - A REVIEW at `reach-teaser` (axe-new-unmapped): axe label-title-only: base at most 0, candidate 1/1/1
  - B FAIL JOURNEY_BLOCKED at `reach-teaser` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-teaser` (unreachable): candidate UNREACHABLE in 3 of 3
- **ras-required-field-unnamed-teaser-twin**
  - A REVIEW at `reach-teaser` (axe-new-unmapped): axe color-contrast: base at most 2, candidate 3/3/3
- **ras-selected-stale-post-form**
  - B FAIL STATE_NOT_CONVEYED at `reach-summary` (expectation-state): stateIs:tab/Summary/selected=true: candidate tab/SUMMARY selected=false / tab/SUMMARY selected=false / tab/SUMMARY selected=false
  - NVDA FAIL STATE_NOT_CONVEYED at `reach-summary` (expectation-state): stateIs:tab/Summary/selected=true: candidate form landmark / tab control / SUMMARY tab 1 of 4 / form landmark / tab control / SUMMARY tab 1 of 4 / form landmark / tab control / SUMMARY tab 1 of 4
- **ras-submit-pointer-only-post-save**
  - A REVIEW at `reach-add-filter` (axe-new-unmapped): axe color-contrast: base at most 1, candidate 2/2/2
  - B FAIL JOURNEY_BLOCKED at `reach-add-filter` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL JOURNEY_BLOCKED at `reach-add-filter` (unreachable): candidate UNREACHABLE in 3 of 3
- **ras-tab-roles-removed-post-form**
  - A FAIL STATE_NOT_CONVEYED at `reach-summary` (axe-aria-allowed-attr): axe aria-allowed-attr: base at most 0, candidate 4/4/4
  - A FAIL ROLE_NOT_CONVEYED at `reach-summary` (axe-aria-required-children): axe aria-required-children: base at most 0, candidate 1/1/1
  - B FAIL ROLE_NOT_CONVEYED at `reach-summary` (expectation-role): focusOn:tab/Summary: candidate button/SUMMARY / button/SUMMARY / button/SUMMARY
  - B FAIL ROLE_NOT_CONVEYED at `reach-summary` (expectation-role): stateIs:tab/Summary/selected=true: candidate (target not found) / (target not found) / (target not found)
  - NVDA FAIL ROLE_NOT_CONVEYED at `reach-summary` (expectation-role): focusOn:tab/Summary: candidate section SUMMARY button / section SUMMARY button / section SUMMARY button
  - NVDA FAIL STATE_NOT_CONVEYED at `reach-summary` (expectation-state): stateIs:tab/Summary/selected=true: candidate section SUMMARY button / section SUMMARY button / section SUMMARY button
- **ras-tab-swallowed-search**
  - B FAIL KEYBOARD_TRAP at `leave-search` (expectation-focus): focusOn:button/Add filter: candidate textbox/Search / textbox/Search / textbox/Search
  - B FAIL NAV_TARGET_UNREACHABLE at `reach-create` (unreachable): candidate UNREACHABLE in 3 of 3
  - NVDA FAIL KEYBOARD_TRAP at `leave-search` (expectation-focus): focusOn:button/Add filter: candidate (silence) / (silence) / (silence)
  - NVDA FAIL JOURNEY_BLOCKED at `reach-create` (unreachable): candidate UNREACHABLE in 3 of 3

## Expectations each family can observe

Per family, journey expectations by result over all items: observable ones pass or fail; "unobservable" means the base does not meet the expectation in that family's evidence; "not judgeable" means evidence is missing.

| Family | pass | fail | review | unobservable | not-judgeable | not-run |
|---|---|---|---|---|---|---|
| B | 302 | 41 | 0 | 16 | 0 | 0 |
| B2 | 11 | 8 | 0 | 16 | 0 | 10 |
| NVDA | 278 | 36 | 3 | 42 | 0 | 0 |

## Triggers (Arm D)

| Trigger | Steps it fired on (items × steps) |
|---|---|
| T1-live-region | 79 |
| T2-role-status | 15 |
| T3-role-alert | 24 |
| T4-dialog-opening | 50 |
| T5-route-transition | 38 |
| T6-programmatic-focus | 245 |
| T7-active-descendant | 24 |

## Power table

The worst case and the HANDOFF §10.3 example are the planning figures already used. Rates from these scores are not a new sample-size plan, and they are not a reason to add patterns or move a threshold. A second round is the rule in `PROTOCOL.md` §3. The test split holds 77 regression patterns (`corpus/split.json`, dropped patterns excluded).

| Basis | p | Planning p | ±0.05 | ±0.08 | ±0.10 | ±0.15 |
|---|---|---|---|---|---|---|
| worst case | 0.50 | 0.50 | 385 | 151 | 97 | 43 |
| HANDOFF §10.3 example | 0.15 | 0.15 | 196 | 77 | 49 | 22 |

## Biases and limits

- Speech is what NVDA queues plus global cancels, not audio: queued-then-cancelled text counts as spoken, and cancellations inside NVDA's speech manager never reach the relay (R10, DR-0022). This makes ANNOUNCEMENT_DUPLICATED anti-conservative; a duplicate seen only in speech is REVIEW (DR-0042; P36).
- The oracles, triggers and thresholds were fixed before this split was executed. These figures are the confirmatory results.
- Every dev pattern has one regression item, so item-level and pattern-level counts agree; the bootstrap matters for the test split's mixed clusters (P20).
- The tree and B2 tie an announcement's text to a live region read at the step's end or 1 s into its window (DR-0079). A message shown and removed within that second is missed by both.
