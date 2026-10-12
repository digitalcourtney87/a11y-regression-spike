# Decision brief: proceed/stop, 27 November 2026

This brief accompanies the [decision pack](decision-2026-11-27.md) and was drafted on 2026-10-13.

**On hold (owner, 13 October 2026)** until the [addendum](../decision-2026-11-27-addendum.md) is in. The addendum's technical reading is PIVOT rather than CASCADE. If you accept it, item 2 should be revised to test an event-first proposition separately, keeping NVDA for adjudication research.

**Technical recommendation: proceed, in a scoped form.** That means a design where events (B2) are the core detector and NVDA runs selectively at triggered steps, with journey reachability addressed first. The proceed/stop decision itself, and every commercial judgement, are the owner's. They are outside this repository.

| Finding at 77 patterns | Result |
|---|---|
| H1, events beyond the tree | Supported: +0.079 (0.010 to 0.133) |
| H2, NVDA beyond events | Supported under UNION: +0.053 (0.009 to 0.115). Unsettled under ADJUDICATED |
| H3, selective cascade | Supported under UNION: equivalent within 0.08, at an estimated 15% of NVDA segment time. Unsettled under ADJUDICATED |
| H4, reliability | Met: 0/599 known-answer failures per leg, 0.48% INCONCLUSIVE and 0 false FAILs observed. Journey reachability is a risk |
| Measured cost | 6,366.5 Windows job-minutes over 11 days, £0 on public standard runners. A confirmatory round costs about 1,650 job-minutes. Model spend: see your dashboard (P7) |

| # | Yes/no decision | Recommendation |
|---|---|---|
| 1 | Use this pack's technical findings, and their limits, as the evidence base for the 27 November decision? | Yes |
| 2 | If you proceed, build on events as the core detector, with NVDA triggered selectively (Arm D, UNION) rather than run at every step? | Yes. D UNION stays within 0.08 of C at about 15% of NVDA segment time |
| 3 | Treat NVDA's value under adjudication as unsettled, so that any claim needs a new pre-registered study on fresh patterns, not a third expansion of this corpus? | Yes. Both adjudicated comparisons are inconclusive, and this corpus has been exposed |
| 4 | Before any confirmatory study in a next phase, register controls for goal-check timing, browse context and focus-dependent naming, and use cursor v2? | Yes. Four of the 18 second-round patterns failed a baseline goal on working pages |
| 5 | No further Windows runs before 27 November unless separately approved? | Yes. All three exploratory allowances are spent, and nothing pending needs one |
