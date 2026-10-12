"""EXPLORATORY, read-only: per-journey time components and baseline goal reachability for the addendum.

Usage: python3 -I derive-time-and-reachability.py <corpus run dir> <second-round run dir> <unmasked scores json> <corpus/items dir>

Time uses only QPC stamps the runner recorded (DR-0027); NVDA log times are never used for latency (DR-0039).
The runner records no attempt-level start/end and no NVDA start-up duration, so these are measured components:
  span       first AT step start to last AT step end of one journey attempt (one side, one repetition)
  segments   sum of that attempt's AT step durations (each includes its observation window)
  gap        last step end of one attempt to the first step start of the next attempt in the same block:
             browser teardown/relaunch, page load, Playwright setup, the AT handover and, in the absent leg,
             the per-attempt axe run and evidence reads; no canaries
  lead       job summary start to the job's first AT step start: listener probe (absent leg) or NVDA
             start-up (present leg), first K1 bracket, first browser launch, setup and handover
Reachability: a base-side attempt whose goal-based AT step ends UNREACHABLE, per pattern and leg.
"""
import gzip, json, math, pathlib, statistics, sys

corpus, second, scores_path, items_dir = map(pathlib.Path, sys.argv[1:5])
items = {json.loads(p.read_text())["id"]: json.loads(p.read_text()) for p in items_dir.glob("*.json") if " 2." not in p.name}
scores = {s["itemId"]: s for s in json.load(open(scores_path))["scores"]}


def q(values, p):
    v = sorted(values)
    if not v:
        return None
    k = (len(v) - 1) * p
    lo, hi = math.floor(k), math.ceil(k)
    return v[lo] + (v[hi] - v[lo]) * (k - lo)


def summary(values):
    v = [x for x in values if x is not None]
    return {"n": len(v), "median": q(v, 0.5), "p25": q(v, 0.25), "p75": q(v, 0.75), "p90": q(v, 0.9), "max": max(v) if v else None}


per_item = {}
leads = {"nvda-absent": [], "nvda-present": []}
gaps = {"nvda-absent": [], "nvda-present": []}
reach = {}
for run in (corpus, second):
    for job in sorted(p for p in run.iterdir() if p.is_dir()):
        summ_path = next(job.glob("summary-*.json"), None)
        if summ_path is None:
            continue
        summ = json.load(open(summ_path))
        leg = summ["leg"]
        first_step = None
        for bp in sorted(job.glob("blocks/*.json.gz")):
            b = json.load(gzip.open(bp))
            item = b["item"]["id"] if isinstance(b.get("item"), dict) else bp.name[: -len(".json.gz")]
            prev_end = None
            for a in sorted(b["attempts"], key=lambda x: x.get("orderIndex", 0)):
                at = [s for s in a["steps"] if s.get("kind") == "at" and s.get("startedAt") and s.get("endedAt")]
                if at:
                    start, end = min(s["startedAt"] for s in at), max(s["endedAt"] for s in at)
                    first_step = start if first_step is None else min(first_step, start)
                    rec = per_item.setdefault(item, {}).setdefault(leg, [])
                    rec.append({"side": a["side"], "span": (end - start) / 1e9, "segments": sum(s["endedAt"] - s["startedAt"] for s in at) / 1e9,
                                "stepSeconds": {s["stepId"]: (s["endedAt"] - s["startedAt"]) / 1e9 for s in at}})
                    if prev_end is not None:
                        gaps[leg].append((start - prev_end) / 1e9)
                    prev_end = end
                if a["side"] == "base":
                    it = items[item]
                    failed = [s["stepId"] for s in a["steps"] if s.get("kind") == "at" and s.get("goalBased") and s.get("outcome") == "UNREACHABLE"]
                    r = reach.setdefault(it["patternId"], {}).setdefault(leg, {"baseAttempts": 0, "failedAttempts": 0, "steps": set(), "items": set()})
                    r["baseAttempts"] += 1
                    if failed:
                        r["failedAttempts"] += 1
                        r["steps"].update(failed)
                        r["items"].add(item)
        if first_step is not None:
            leads[leg].append((first_step - summ["startedQpcNs"]) / 1e9)

# Per journey attempt (per item, median over its attempts), by leg.
journey = []
for item, legs in sorted(per_item.items()):
    if "nvda-absent" not in legs or "nvda-present" not in legs:
        continue
    trig = {t["stepId"] for t in scores[item]["triggers"] if t["triggered"]}
    ab = statistics.median(r["span"] for r in legs["nvda-absent"])
    pr = statistics.median(r["span"] for r in legs["nvda-present"])
    pr_seg = statistics.median(r["segments"] for r in legs["nvda-present"])
    trig_seg = statistics.median(sum(v for k, v in r["stepSeconds"].items() if k in trig) for r in legs["nvda-present"])
    journey.append({"item": item, "kind": items[item]["expected"]["kind"], "absentSpan": ab, "presentSpan": pr, "presentSegments": pr_seg, "triggeredSegments": trig_seg, "triggered": bool(trig)})

gap_a, gap_p = statistics.median(gaps["nvda-absent"]), statistics.median(gaps["nvda-present"])
lead_a, lead_p = statistics.median(leads["nvda-absent"]), statistics.median(leads["nvda-present"])
startup = lead_p - lead_a  # rough: NVDA start-up net of the absent leg's listener probe and of handover differences
models = {}
for name, warm in (("warm", 0.0), ("cold", startup)):
    c = [j["absentSpan"] + gap_a + j["presentSpan"] + gap_p + warm for j in journey]
    # Attach at trigger: the NVDA leg's whole between-journey overhead (relaunch, setup, handover) is charged to every triggered journey.
    d_low = [j["absentSpan"] + gap_a + ((j["triggeredSegments"] + gap_p + warm) if j["triggered"] else 0.0) for j in journey]
    d_high = [j["absentSpan"] + gap_a + ((j["presentSpan"] + gap_p + warm) if j["triggered"] else 0.0) for j in journey]
    models[name] = {"C": summary(c), "D_attachAtTrigger": summary(d_low), "D_fullNvdaJourneyWhenTriggered": summary(d_high),
                    "totalsSecondsPerAttemptSet": {"C": sum(c), "D_attachAtTrigger": sum(d_low), "D_fullNvdaJourneyWhenTriggered": sum(d_high)}}

failing = {p: {leg: {**v, "steps": sorted(v["steps"]), "items": sorted(v["items"])} for leg, v in legs.items() if v["failedAttempts"]}
           for p, legs in sorted(reach.items())}
failing = {p: v for p, v in failing.items() if v}


def cp_upper(x, n, alpha):
    # Exact Clopper-Pearson upper bound for x = 0: 1 - alpha ** (1 / n).
    assert x == 0
    return 1 - alpha ** (1 / n)


print(json.dumps({
    "label": "EXPLORATORY",
    "method": __doc__.strip().splitlines()[0],
    "journeysWithBothLegs": len(journey),
    "triggeredJourneys": sum(j["triggered"] for j in journey),
    "componentsSeconds": {
        "absentSpan": summary(j["absentSpan"] for j in journey), "presentSpan": summary(j["presentSpan"] for j in journey),
        "presentSegments": summary(j["presentSegments"] for j in journey), "triggeredSegmentsWhenTriggered": summary(j["triggeredSegments"] for j in journey if j["triggered"]),
        "gapAbsent": summary(gaps["nvda-absent"]), "gapPresent": summary(gaps["nvda-present"]),
        "leadAbsent": summary(leads["nvda-absent"]), "leadPresent": summary(leads["nvda-present"]), "nvdaStartupEstimate": startup,
    },
    "perJourneySeconds": models,
    "reachability": {
        "patternsWithBaselineGoalFailure": len(failing), "patternsTotal": len({it["patternId"] for it in items.values() if it.get("split") == "test" and it["expected"]["kind"] == "regression"}),
        "byPattern": failing,
    },
    "soakBoundsK1": {"valid": 599, "failures": 0, "oneSided95ExactUpper": cp_upper(0, 599, 0.05), "ruleOfThree": 3 / 599, "twoSided95ExactUpper": cp_upper(0, 599, 0.025)},
}, indent=1, default=sorted))
