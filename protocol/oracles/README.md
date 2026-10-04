# Oracles v1 (EXPLORATORY until the M6 freeze)

How evidence becomes a verdict per arm. The code is in `harness/src/oracles/`; the tables are in `rules.v1.json`; Arm D's triggers are in `../triggers.v1.json`. Everything here was developed on the dev split only (hard rule 6). The parts that decide what counts as detection were approved by the owner on 2026-10-03 (P28–P36; DR-0080, DR-0081).

## Families of evidence

| Family | Leg | Evidence | Judges |
|---|---|---|---|
| A | NVDA-absent | axe at each step's end state, in its own context (DR-0024) | New violations (step rule) |
| B | NVDA-absent | Accessibility tree at each step's end, the settled tree 1 s into long windows (DR-0079), and step outcomes | `focusOn`, `stateIs`, `announcementContains` (a live region holding the text), reachability |
| B2 | NVDA-absent | Platform events and the DOM timeline, with B's tree for text | `announcementContains` (alert and live-region events), ROUTE_CHANGE_SILENT (step rule) |
| NVDA | NVDA-present | Queued speech (relay tap) and step outcomes | `focusOn`, `stateIs`, `announcementContains`, reachability |

The arms nest as PRD §33 defines them:
- A is family A;
- B is A plus B;
- B2 is B plus B2;
- C and D add NVDA, combined at item level (DR-0031).

## One expectation, one attempt

- **`focusOn role|name`**:
  - **Tree:** the focused node, its ancestors, or a descendant reached through single children all count as focus on the target. The last case covers a focused wrapper whose only child is the element, as MUI's dialog container is for its dialog. After a browse step, the line under the simulated cursor counts instead.
  - **Speech:** the step's speech contains the name and the role's NVDA word.
  - **Failure classes:**
    - `name` if the element itself has the role but not the name;
    - `role` if it has the name but not the role;
    - `focus` otherwise.
- **`stateIs role|name|state=value`**:
  - **Tree:** the target's property. A missing property counts as "false". A `#id` target is found by its DOM id.
  - **Speech:** NVDA's en-GB state label, matched word by word, so that "not checked" never reads as "checked".
- **`announcementContains text`**:
  - **Tree:** an innermost live region (role alert, status, log, marquee or timer, or aria-live polite or assertive) whose text contains the expected text, in the settled or end tree. The count is the number of such regions.
  - **Events:** alert and live-region-changed events in the step, tied by role or live setting to a region holding the text. The count is the number of tied events.
  - **Speech:** the utterances containing the text.
- **Speech normaliser:** before comparing, an expected text is rendered as NVDA speaks it. Symbols spoken at NVDA's default punctuation level become their names ("/" is "slash"). Both sides are then reduced to lower-cased letters and digits and compared by containment (P11).

## Base against candidate, per leg and family (k = n)

1. **Reachability (B, NVDA):**
   - The base must reach each step in k of n attempts.
   - A candidate that is UNREACHABLE in k of n attempts gives FAIL, and the comparison stops there. In fewer than k attempts, it gives REVIEW.
   - PATH_CHANGED in any candidate attempt gives REVIEW.
2. **Expectations:**
   - If the base never meets an expectation, the family cannot observe it, and it gives nothing.
   - If the base meets it in some but not k attempts, it gives REVIEW.
   - If the base meets it in k of n and the candidate fails it in k of n, it gives FAIL with the symptom of the candidate's most common failure class. If the candidate fails it in fewer than k, it gives REVIEW.
   - Base once and candidate at least twice gives ANNOUNCEMENT_DUPLICATED. From speech alone, that is REVIEW (DR-0042).
3. **Step rules:**
   - Arm A gives a new violation when a rule's count is higher in every candidate attempt than in every base attempt. A mapped rule gives FAIL with its symptom; any other gives REVIEW.
   - B2 gives ROUTE_CHANGE_SILENT when a route change is conveyed in the base and not in the candidate. Conveying means a focus event, an announcement event or a title change. The rule applies only at steps that declare no expected announcement; where a step declares one, that expectation judges it.

## Failure class to symptom

| Class | Symptom |
|---|---|
| name | NAME_NOT_CONVEYED |
| role | ROLE_NOT_CONVEYED |
| state | STATE_NOT_CONVEYED |
| absent | ANNOUNCEMENT_MISSING |
| focus | Decided by the step's place in the journey: <ul><li>KEYBOARD_TRAP: Escape leaves focus inside the component (tree), or NVDA says nothing (speech).</li><li>FOCUS_ESCAPES_DIALOG: the target is a dialog an earlier step had focus in.</li><li>FOCUS_NOT_RESTORED: the target is the anchor or an earlier step's target, and focus went elsewhere in between.</li><li>FOCUS_NOT_MOVED: otherwise.</li></ul> |
| unreachable | <ul><li>JOURNEY_BLOCKED: the candidate never meets the goal's name.</li><li>INTERACTION_FAILS_UNDER_AT: an action came since the last navigation step.</li><li>NAV_TARGET_UNREACHABLE: otherwise.</li></ul> For scoring, the three form one family. |

## Verdicts

- **One leg:**
  - INCONCLUSIVE when the block is INCONCLUSIVE (DR-0035) or missing;
  - FAIL when a family in the arm FAILs;
  - REVIEW when there is a REVIEW finding, or a check failed on the candidate only (no FAIL rule covers those);
  - PASS otherwise.
- **C and D:**
  - **UNION:** FAIL if B2 or NVDA FAILs. Combining legs, FAIL outranks INCONCLUSIVE, which outranks REVIEW and PASS.
  - **ADJUDICATED:** NVDA's FAILs stand. A B2 FAIL becomes REVIEW when NVDA's output at that step is unchanged. Unchanged means every candidate attempt's set of normalised utterances equals some base attempt's.
  - **D:** takes NVDA evidence only at triggered steps, and can adjudicate only there.
- **Detection:** a FAIL with the correct symptom. Two readings are reported: any of the arm's FAIL symptoms (primary, P29), and the earliest finding's only (sensitivity).
