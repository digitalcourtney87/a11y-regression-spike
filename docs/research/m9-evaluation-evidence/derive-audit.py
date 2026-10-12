"""P42/DR-0120: read-only integrity audit, focus diagnostic timings and text-node ancestry for run 38315343825.

Usage: python3 -I derive-audit.py <downloaded run dir>. Changes no evidence or outcome.
"""
import gzip, json, pathlib, sys

root = pathlib.Path(sys.argv[1])
legs = {}
for leg in ("nvda-absent", "nvda-present"):
    base = root / f"m9-registered-evaluation-{leg}"
    pilot = json.load(open(base / "pilot-summary.json"))
    summaries = {s.parent.name: json.load(open(s)) for s in sorted(base.glob("*/summary-*.json"))}
    blocks = []
    for path in sorted(base.glob("*/blocks/*.json.gz")):
        b = json.load(gzip.open(path))
        blocks.append({
            "case": path.parent.parent.name, "journey": b["journeyId"], "label": b["label"], "validity": b["validity"]["result"],
            "k1Pre": b["pre"].get("ok"), "k1Post": b["post"].get("ok"), "attempts": len(b["attempts"]),
            "sides": sorted({a["side"] for a in b["attempts"]}), "packageErrors": [e for e in b.get("packageErrors") or [] if e is not None],
            "attemptReasons": sorted({r for a in b["attempts"] for r in (a.get("reasons") or [])}),
            "calibrationReadErrors": sorted({p[k] for a in b["attempts"] for s in a["steps"] for p in (s.get("calibration") or []) for k in ("error", "goalError", "fullTreeError") if k in p}),
            "notRun": [n for a in b["attempts"] for n in (a.get("notRun") or [])],
        })
    legs[leg] = {
        "pilotSummary": pilot,
        "caseSummaries": {k: {f: v.get(f) for f in ("label", "calibrationCase", "calibrationApproval", "cursorModel", "fullTreeFocusName", "manifestValid")} for k, v in summaries.items()},
        "manifest": next(iter(summaries.values()))["manifest"],
        "blocks": blocks,
    }

timings = {}
for leg in ("nvda-absent", "nvda-present"):
    for path in sorted((root / f"m9-registered-evaluation-{leg}/p42-focus/blocks").glob("*.json.gz")):
        b = json.load(gzip.open(path))
        for a in b["attempts"]:
            s = a["steps"][0]
            t0 = s["goalTrace"][0]["t"]
            early, end = s["calibration"][0], s["calibration"][-1]
            ms = lambda x: round((x - t0) / 1e6, 1)
            row = {"earlyDiagnosticMs": [ms(early["startedQpcNs"]), ms(early["endedQpcNs"])], "endDiagnosticMs": [ms(end["startedQpcNs"]), ms(end["endedQpcNs"])]}
            if leg == "nvda-present":
                row["speechMs"] = [[ms(e["t"]), e["text"]] for e in (a.get("speechEvents") or []) if e.get("kind") == "speak" and e["t"] >= t0 and e["t"] <= end["endedQpcNs"]]
            timings.setdefault(b["journeyId"], {}).setdefault(leg, {})[str(a["repetition"])] = row

ancestry = {}
for journey in ("m9-marker-list", "m9-generated-text", "m9-ignored-wrappers"):
    b = json.load(gzip.open(root / f"m9-registered-evaluation-nvda-absent/p42-cursor/blocks/m8-{journey}.json.gz"))
    step = next(s for s in b["attempts"][0]["steps"] if s.get("stepId") == "read-to-target")
    by = {n["id"]: n for n in step["axTree"]}
    rows = []
    for n in step["axTree"]:
        if n["role"] != "StaticText" or not n.get("name", "").strip():
            continue
        chain, cur = [], n
        while cur is not None and len(chain) < 4:
            chain.append({"role": cur["role"], "ignored": cur.get("ignored", False), "backendId": cur.get("backendId")})
            cur = by.get(cur.get("parent"))
        rows.append({"text": n["name"], "chain": chain})
    ancestry[journey] = rows

print(json.dumps({"runId": 38315343825, "approval": "P42/DR-0120", "legs": legs, "focusTimings": timings, "textAncestryRep1": ancestry}, indent=1))
