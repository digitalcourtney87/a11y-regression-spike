# What a real screen reader adds to accessibility regression testing: 77 regressions, tested

In a corpus of 77 accessibility regressions, cheaper automated checks caught about three-quarters, and a real screen reader added about five points. I tested them in continuous integration against a protocol frozen before scoring.

Courtney Allen, October 2026

## Why I ran it

Accessibility audits are snapshots. Between one audit and the next, an ordinary release can break something that used to work.

Most automated checks look at a page as it first loads. Many accessibility failures only appear after someone interacts with it. A dialog opens, a single-page application (SPA) changes route, or a status message should be announced. A check of the first state cannot see what happens next.

A screen reader, one kind of assistive technology (AT), experiences what happens next. It is also slow and awkward to run in continuous integration (CI). So I set out to answer one question: what does a real screen reader add, beyond the cheaper evidence a test can already collect?

## What I tested

I built a corpus of 77 regression patterns. I seeded 51 into two open-source demo apps, Atomic CRM and react-admin. I mined the other 26 from the real bug histories of open-source projects, mostly component libraries.

Every regression needs controls, or a check that flags everything would look perfect. I used 77 harmless changes, one for each regression, and 45 unchanged builds. A failure on any control is a false alarm.

I tested five configurations. Each adds one layer to the one before:

1. axe at each state of a scripted user journey.
2. Plus Chrome's accessibility tree.
3. Plus event observation: changes to the page, and the accessibility events Windows raises.
4. Plus NonVisual Desktop Access (NVDA), a real screen reader, at triggered steps only. A step is triggered when, for example, a dialog opens or code moves focus.
5. Plus NVDA on every step.

NVDA 2026.2 ran with the eSpeak NG voice, on Chrome for Testing 153, on GitHub-hosted Windows runners. The final 77-pattern analysis was scored once, against the protocol frozen at [the protocol-freeze-v4 tag](https://github.com/digitalcourtney87/a11y-regression-spike/tree/protocol-freeze-v4/protocol). The work ran from 2 to 12 October 2026.

## What I found

**Table 1. Regressions detected as each layer is added, out of 77 patterns**

<table>
<thead>
<tr><th scope="col">Layer</th><th scope="col">Detected (of 77)</th><th scope="col">Rate</th><th scope="col">95% interval</th></tr>
</thead>
<tbody>
<tr><th scope="row">axe at each journey state</th><td>13</td><td>15.7%</td><td>10.2% to 21.8%</td></tr>
<tr><th scope="row">Plus Chrome’s accessibility tree</th><td>57</td><td>66.8%</td><td>58.1% to 77.1%</td></tr>
<tr><th scope="row"><strong>Plus event observation</strong> (reference)</th><td><strong>61</strong></td><td><strong>74.8%</strong></td><td><strong>66.6% to 83.2%</strong></td></tr>
<tr><th scope="row">Plus NVDA at triggered steps</th><td>65</td><td>78.9%</td><td>70.2% to 88.1%</td></tr>
<tr><th scope="row">Plus NVDA on every step</th><td>66</td><td>80.1%</td><td>71.5% to 89.1%</td></tr>
</tbody>
</table>

Rates give each symptom type equal weight, so they differ from the raw counts. In both NVDA rows, the screen reader could only add failures. When it could also overrule the cheaper checks, its rate fell to 69.3%, which is 5.5 points below the reference row.

Event observation added 7.9 points over the accessibility tree, with an interval from 1.0 to 13.3. NVDA on every step added 5.3 points more, from 0.9 to 11.5. Both intervals exclude zero, but the second is wide.

Running NVDA only at triggered steps kept 4 of those 5 extra patterns. It needed an estimated 15% of the screen-reader time: 689 seconds across the 199 test items, against 4,605 seconds on every step.

axe scored 15.7%, and that says more about this corpus than about axe. It found all 7 patterns where a control lost its accessible name. But the corpus gives each symptom equal weight, and most symptoms are behaviours over time, such as focus moving or an announcement firing. Rule-based checks of a page state are not designed to detect those.

No configuration raised a false alarm, on any of the 77 harmless changes or 45 unchanged builds.

The harness itself held up. A known-answer soak ran 600 times with NVDA and 600 times without it, and recorded no failures in 599 valid runs on each side. Across the corpus, 0.48% of attempts were inconclusive, and no item ended inconclusive.

## What didn't work

**Letting the screen reader overrule.** Under that rule, NVDA could overrule the cheaper checks as well as add to them. It removed no false alarms, because there were none to remove. It did cost true detections. It turned 6 of the cheaper checks' detections into misses, and added 5 of its own. The net change was a fall of 5.5 points, with an interval from a fall of 14.4 to a rise of 4.6. That interval includes no difference, so the size of the cost is not settled.

**Two focus symptoms.** These stayed weak for every layer. Focus escaping a dialog was caught in 1 of 4 patterns at best. Focus not being restored was caught in 1 of 4, and only with the screen reader.

**Journeys that broke on working pages.** The hardest part was not the screen reader. It was writing journeys that reliably reach the right state. Of the 18 patterns added in the second round, 4 failed to reach a baseline step in every repetition. They failed on their harmless changes and unchanged builds too, so the regression was not the cause. One more pattern produced failures with the wrong symptom, so it counts as a miss.

## Limits

- **Capability, not prevalence.** The corpus weights each symptom type equally. It says nothing about how common each kind of regression is.
- **One environment.** One screen reader, one browser and one runner image. Other AT, voices or browsers may behave differently.
- **Queued speech, not audio.** I measured speech as the text NVDA queued. Speech queued and then cancelled counts as spoken.
- **A second round.** 18 of the 77 patterns were built after the first-round results were known. The protocol required that round and fixed its size in advance.
- **A wide interval.** The screen reader's added detection could be anywhere from 0.9 to 11.5 points.
- **Zero is an observation.** No false alarms observed is not a zero rate. The 95% upper bounds are 4.8% on harmless changes and 7.9% on unchanged builds.
- **Estimated time.** The time saving from triggered steps excludes screen-reader start-up and handover.

## What's next

The code, protocol, raw evidence and reports are public in [this repository](../README.md), under the Apache 2.0 licence. You can rerun it, or check my scoring. Every figure here comes from [the accepted 77-pattern gate report](gates/G4-second-round.md), [the frozen scorer's output](research/m7-second-round-evidence/combined-scorer-report.md) and [the reliability soak report](reports/M7-soak.md).

What I don't have is your experience. If your team runs consumer journeys such as checkout, booking or banking, and an accessibility regression has reached production, I'd like to hear about the last three. 45 minutes, research first: [hello@courtneyallen.co.uk](mailto:hello@courtneyallen.co.uk).

## Credits

This rests on other people's work. NV Access makes NVDA, and Guidepup's NVDA tooling let my tests drive it in CI. Deque makes axe-core, and Microsoft makes Playwright. Google publishes Chrome for Testing. Scream gave each runner somewhere to send speech. The World Wide Web Consortium (W3C) ARIA and Assistive Technologies (ARIA-AT) project's work on hosted runners was prior art.

*Independent research by Courtney Allen.*
