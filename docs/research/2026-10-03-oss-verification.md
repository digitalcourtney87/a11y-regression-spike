# Mined open-source pairs: verification (2026-10-03)

EXPLORATORY. This is the verification pass of the mining method (DR-0062), with the reproduction method and rules of DR-0063. The registry is `corpus/oss-candidates.json`, the fixtures are in `fixtures/oss/`, and the runs are of `m3-oss-repro.yml` on `m3-corpus`.

## Funnel

| Stage | Count | Note |
|---|---|---|
| Candidates read at the documentary check (two search rounds) | 47 | 23 rejected from the issue alone (first survey and round two) |
| Accepted or pending after the documentary check | 24 | |
| Rejected on a closer reading of the issue, fix and source | 11 | Rules 2–7 of DR-0063 |
| Rejected by reproduction | 2 | floating-2874: the keyboard path does not reproduce; rac-8298: not reproduced in three fixtures |
| Verified | 11 | Reproduced on the keyboard path: the check holds on the last good release and fails on the first broken one |

## Verified pairs

Run 37133618945 (and 37134051657 for bootstrap-35496, after its install fix). "Fixed" is the first fixed release where it was tested; it held again in every case.

| Pair | Package (licence) | Last good → first broken (fixed) | Symptom | Operator | The check, from the issue |
|---|---|---|---|---|---|
| radix-4014 | @radix-ui/react-dismissable-layer (MIT), through react-dialog 1.1.16 on React 19.2 | 1.1.13 → 1.1.14 | KEYBOARD_TRAP | escape-not-closing | A Dialog blocks Escape while pending (true at mount, false 300 ms later); once ready, Escape must close it |
| rac-8697 | react-aria-components (Apache-2.0) | 1.10.0 → 1.11.0 | INTERACTION_FAILS_UNDER_AT | mined | Enter on a MenuItem link must open the link (the page must navigate) |
| bootstrap-35496 | bootstrap (MIT) | 5.0.2 → 5.1.0 | FOCUS_NOT_RESTORED | menu-focus-not-restored | Escape in an open dropdown must return focus to its toggle |
| carbon-18824 | @carbon/react (Apache-2.0) | 1.53.1 → 1.54.0 | STATE_NOT_CONVEYED | checked-stale | An icon-only ghost toggle button, turned on, must report aria-pressed="true" |
| carbon-19563 | @carbon/web-components (Apache-2.0) | 2.28.0 → 2.29.0 | STATE_NOT_CONVEYED | checked-stale | After the user ticks a checkbox, clearing it in code must untick the inner input |
| carbon-7253 | carbon-components (Apache-2.0), CSS under carbon-components-react 7.22.0 | 10.22.0 → 10.23.0 (10.24.0) | NAME_NOT_CONVEYED | icon-button-label-removed | Pagination's disabled "Previous page" button must keep its accessible name (read from Chrome's accessibility tree) |
| carbon-5623 | carbon-components-react (Apache-2.0) | 7.9.3 → 7.10.0 (7.11.0) | JOURNEY_BLOCKED | mined | A controlled ComboBox must accept typed text |
| fluent-35927 | @fluentui/react-badge (MIT) | 9.4.15 → 9.5.0 (9.5.1) | NAME_NOT_CONVEYED | mined | Each PresenceBadge's label must name its own status |
| fluent-7796 | office-ui-fabric-react (MIT) | 6.124.2 → 6.125.0 (6.129.4) | ROLE_NOT_CONVEYED | mined | A non-actionable DocumentCard given role="listitem" must keep that role |
| vuetify-9627 | vuetify (MIT) on Vue 2.6.10 | 2.0.14 → 2.0.15 (2.1.10) | FOCUS_ESCAPES_DIALOG | dialog-containment-removed | With a dialog open, eight Tab presses must keep focus inside it |
| blueprint-6163 | @blueprintjs/select (Apache-2.0) | 4.9.14 → 4.9.15 (4.9.16) | INTERACTION_FAILS_UNDER_AT | mined | Choosing an item with Enter must make the choice and close the popover |

## Rejected at verification

| Candidate | Rule (DR-0063) | Reason |
|---|---|---|
| headlessui-3821 | 2 | Maintainers: nested menus were never supported nor accessible to screen readers; the break began in 2.2.2 |
| bootstrap-36947 | 2 | Maintainers: tabs inside a dropdown are documented as unsupported, since they cannot map to an ARIA tab pattern |
| sonner-519 | 7 | 1.6 moved the live region to the Toaster section (aria-live=polite), so toasts are still announced |
| mui-30012 | 3 | 5.0.6 also has no aria-disabled on a non-clickable Chip (source and run agree); the change came in the v5 alphas (PR #22430) |
| mui-18484 | 6 | No library fix: an edge case of an unidiomatic ref pattern, by the maintainers; the issue's pattern did not reproduce either |
| carbon-4232 | 5 | The issue's own check is the tooltip's focus border, and the fix also restored lost focus styles and changed the markup, so the symptom (focus movement or visibility) and the pair are not determinable |
| ng-25676 | 4 | Material 13 → 14 needs Angular 14, so the releases cannot share pinned dependencies |
| radix-1528 | 4 | Only in release candidates (0.1.2-rc.49 to rc.53), fixed before 1.0.0 |
| radix-584 | 5 | A title only, with no steps or symptom; a pre-1.0 window with API changes across it |
| rac-6807 | 5 | The maintainers could not reproduce the reported example; the fix touches only the hook's own onAction prop |
| fluent-27510 | 4 | Spans a major and a package rename (office-ui-fabric-react 7 to @fluentui/react 8); the reporter marked it as not an accessibility issue |
| floating-2874 | 1 | The keyboard path holds on both releases; by the fix, the bug needs a menu opened on mousedown |
| rac-8298 | Not reproduced | Three fixtures: two React Aria Components layouts, then React Spectrum's ComboBox as in the fix's own test steps; every release kept the list open. The fix's author reproduced it only on the docs site, not in Storybook, so it depends on page context the issue does not give |

## Observations

- Static checks (labels, roles, an attribute) reproduce deterministically. Interaction checks needed the setup the issue or fix describes: carbon-19563 needed a user tick before the programmatic change, radix-4014 a handler whose state changes after mount, and rac-8697 a link to another page. rac-8298 never reproduced, even with the fix's own test component.
- A shared install date broke older releases of monorepo packages (rac 1.10.0 against later `@react-aria/*` siblings), so each release installs as of its own publish date.
- Most issues' "last good" was right. Three were not: carbon-18824 (the reporter did not know; source history gave 1.53.1), mui-30012 (wrong), headlessui-3821 (the maintainer found 2.2.2, not 2.2.3).
- The fixtures of rejected pairs are removed from `fixtures/oss/`; they stay in the branch history.
