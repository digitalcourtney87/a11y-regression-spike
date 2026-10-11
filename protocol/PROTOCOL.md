# Confirmatory protocol (M6, Gate G3)

**Status:** ratified by the owner on 2026-10-11 (G3 brief items 1–5, DR-0089). It becomes the confirmatory protocol when the annotated tag `protocol-freeze-v1` records this tree's protocol hash (DR-0028, DR-0033). Until that tag exists, the scorer and the runner refuse the test split (HANDOFF §4 rule 5).

No test-split item has been executed or scored. The dev results in `docs/reports/M5-dev.md` are exploratory and in-sample: the rules were developed on those items.

## 1. What is frozen

The protocol hash covers every tracked file under the paths in `protocol/frozen-paths.txt` (DR-0033). `npm run protocol:hash` prints the `protocol-sha256:` line for the tag message. The hash is of committed blobs, and it refuses while any listed path is dirty.

This file states the confirmatory choices. The rule tables it incorporates, which are hashed with it, are:

- `protocol/oracles/README.md` and `protocol/oracles/rules.v1.json` (P28–P33, P35, P36, P38)
- `protocol/triggers.v1.json` (P34)

A post-freeze change to any frozen path is an amendment (`protocol/AMENDMENTS.md`) and needs a new tag before the test split can be scored or executed again.

## 2. What is scored

The test split only, after the tag matches. `npm run score -- --split test --runs <dirs>`.

- **Primary detection.** An arm detects a regression when any of its FAIL symptoms is the correct one. The earliest finding's symptom is reported beside it, as a sensitivity reading (P29).
- **Reachability.** `NAV_TARGET_UNREACHABLE`, `INTERACTION_FAILS_UNDER_AT` and `JOURNEY_BLOCKED` count as one family (P29).
- **Weighting.** Uniform by symptom (HANDOFF §10.3). No owner weights file has been supplied, so the secondary weighted analysis is not part of this protocol. Supplying one later is an amendment.
- **INCONCLUSIVE** counts as a miss. Its rate is reported per arm.
- **False FAILs** are reported separately on benign items and on unchanged controls.
- **k = n** per side, within each leg. Legs are joined on the item. Repetition indices are never paired across legs (DR-0031).
- **Attempts per side.** 5 when the item's pattern, or for an unchanged control its journey, has a regression whose symptom is `ANNOUNCEMENT_MISSING`; otherwise 3. An item's own `repetitions` overrides that. This is the rule already in `harness/src/runner/order.ts` (DR-0068).
- **Intervals.** Wilson 95% for item proportions. Pattern-level bootstrap, 10,000 resamples, seed `20261005`, for symptom-uniform rates and for differences between arms. Exact McNemar on discordant items is secondary. Clopper–Pearson for reliability.

## 3. Headline comparisons

From PRD §34, each under the combination rule named:

| Comparison | Question |
|---|---|
| B2 versus B | Does event evidence add detections beyond the accessibility tree? |
| C versus B2, UNION and ADJUDICATED | Does real NVDA add detections beyond B2? |
| D versus C, UNION and ADJUDICATED | Does running NVDA only at triggered steps keep C's detections? |

The difference is the first arm's symptom-uniform detection rate minus the second's.

**Inconclusive range** (PRD §38, P37). A comparison is:

- a **difference**, when its pattern-bootstrap 95% interval excludes 0;
- **equivalent within 0.08**, when the interval lies entirely inside (−0.08, 0.08), the planning margin of HANDOFF §10.3;
- **inconclusive** otherwise: the interval contains 0 and some value at least 0.08 from 0.

**Second round.** If any headline comparison is inconclusive, a second round adds 18 regression patterns, taking the test regression count from 59 to 77. Seventy-seven is the B2-versus-B size in the dev power table (`docs/reports/M5-dev.md`), which is the only headline comparison with a finite dev estimate of a difference. The size is not recomputed from the confirmatory counts. The added patterns are built as the first 59 were, and they are not executed or scored until the owner tags the amended tree.

## 4. Rule-model secondary analysis (DR-0023)

Secondary. It never changes a primary verdict. It asks how much of C's detections a rule on B2 evidence predicts.

**Rules, in order.** Applied to each regression item:

1. C detects if and only if B2 detects (a FAIL whose symptom is the correct one).
2. C detects if and only if B2's verdict is FAIL.
3. C detects if and only if B2's verdict is not PASS.

**Fitting.** On the dev split only, separately for UNION and for ADJUDICATED. Choose the earliest rule with the highest agreement with C's detection. Agreement is the proportion of dev regression items on which the rule matches C.

**Test-split metric.** The rate at which C detects and the chosen rule does not, with a Wilson 95% interval, separately for UNION and for ADJUDICATED. Also report the agreement rate. The dev choice is applied unchanged.

## 5. Benign types

The names are fixed by HANDOFF §10.2. These descriptions are final (DR-0030, ratified 2026-10-11, DR-0089). They are not scored; the false-FAIL rate is.

| Type | Description |
|---|---|
| WRAPPER_ELEMENT | A non-semantic wrapper element added or removed |
| CLASS_RENAME | Class names changed with no change to behaviour or semantics |
| CSS_ONLY | Styling-only change |
| COPY_EDIT | Visible text edited |
| A11Y_IMPROVEMENT | An intentional accessibility improvement |
| EQUIVALENT_REFACTOR | A refactor with equivalent accessible behaviour |
| TIMING_WITHIN_TOLERANCE | A timing change within the declared tolerance |

## 6. Limits frozen with the corpus

These are properties of the test corpus, ratified as limits on 2026-10-11 (DR-0089). They are not redesigned before the tag.

- **Fixture edits after the split** (DR-0086). The Vuetify card carries the dialog role and name. The Carbon combo box is followed by a button named after the chosen fruit. Each Fluent card receives an id after rendering, and the page has a heading. None of these edits changes library code.
- **NVDA cannot see two symptoms on the base.** The Vuetify dialog pull-back, and the Fluent list-item role.
- **Bootstrap, from speech alone.** An Escape after which NVDA says nothing is classified as `KEYBOARD_TRAP`. The tree classifies the same step as `FOCUS_NOT_RESTORED` when focus has moved.
- **react-admin `busy-left-true`.** Whether the candidate shows any symptom is unknown. If it shows none, every arm misses it.

## 7. Tag

On the commit being frozen, with a clean frozen set:

```
git tag -a protocol-freeze-v1 -m "Protocol freeze 1

protocol-sha256: <hex from npm run protocol:hash>"
git push origin protocol-freeze-v1
```

The owner creates and pushes the tag. The message contains exactly one `protocol-sha256:` line (DR-0028).
