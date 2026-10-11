# M7 reliability soak (CONFIRMATORY)

PROTOCOL.md §8, run [38155513822](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38155513822). Commit `e8903e4`. Seed `20261011`. Both legs, 10 shards, canary K1 only. All 20 jobs used image `20260925.250.1`. Scored with `npm run report:phase0`. That renderer still prints EXPLORATORY and fails its G1 rule because K2–K5 were not in this run. Those lines are the G1 gate, not this soak.

| Leg | Attempts | Valid | Failures | INCONCLUSIVE | Pass rate among valid (Wilson 95%) |
|---|---|---|---|---|---|
| nvda-present | 600 | 599 | 0 | 1 | 100.0% (99.4–100.0) |
| nvda-absent | 600 | 599 | 0 | 1 | 100.0% (99.4–100.0) |

Each inconclusive attempt is `CLOCK_RAF_GAP` (the limit is 100 ms). The present leg's largest rAF gap is 125 ms; the absent leg's is 500 ms. Neither leg has a speech or signature failure. INCONCLUSIVE is 0.2% (Wilson 0.0–0.9), under the 10% flag.

Zero failures in 599 valid attempts gives a rule-of-three upper bound of 3/599 = 0.50%, which is the §10.3 approximation PROTOCOL §8 cites. The scorer's two-sided Clopper–Pearson 95% upper bound on 0/599 is 0.61%.

Segment tap-versus-log parity: 600 segments, 0 mismatched. Three NVDA-present shards have a tap/log count difference of −1 or −2. That does not change the K1 result.

The confirmatory corpus is run [38156720011](https://github.com/digitalcourtney87/a11y-regression-spike/actions/runs/38156720011), recorded in [docs/gates/G4.md](../gates/G4.md).
