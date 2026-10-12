"""P42/DR-0120: apply the registered definitions and decision rules to the downloaded run, mechanically.

Written and committed before the dispatch. Read-only over the downloaded artefacts; changes no evidence or outcome.
Usage: python3 -I derive-registered-results.py <dir holding m9-registered-evaluation-nvda-absent/ and -nvda-present/>
Definitions: docs/plans/2026-10-12-m9-registered-criteria.md.
"""
import gzip, json, pathlib, sys

CURSOR = {"m9-marker-list": "C1", "m9-generated-text": "C2", "m9-ignored-wrappers": "C3", "m9-plain-page": "C4"}
FOCUS = {"m9-static-label": ("F1", "Delivery note"), "m9-focus-hidden-label": ("F2", "Billing code"), "m9-delayed-label": ("F3", "Account reference"), "m9-unnamed-wrapper": ("F4", "Item name")}
REPS = (1, 2, 3)


def key(text):
    """The harness's speechKey: lower case, NFKC, letters and digits only."""
    import unicodedata
    return "".join(ch for ch in unicodedata.normalize("NFKC", text.lower()) if ch.isalnum())


def named(text, label):
    return None if text is None else key(label) in key(text)


def block(root, leg, case, journey):
    path = root / f"m9-registered-evaluation-{leg}" / case / "blocks" / f"m8-{journey}.json.gz"
    if not path.exists():
        return None, "missing"
    b = json.load(gzip.open(path))
    usable = b["validity"]["result"] == "VALID" and b["pre"].get("ok") is True and b["post"].get("ok") is True
    return (b if usable else None), ("usable" if usable else f"unusable: validity {b['validity']['result']}, K1 pre {b['pre'].get('ok')}, post {b['post'].get('ok')}")


def step(attempt, step_id):
    return next((s for s in attempt["steps"] if s.get("stepId") == step_id), None)


def by_rep(b):
    return {} if b is None else {a["repetition"]: a for a in b["attempts"]}


def cursor_attempt(a, leg):
    out = {}
    for sid in ("read-to-target", "past-end"):
        s = step(a, sid)
        if s is None:
            out[sid] = None
            continue
        trace = s.get("goalTrace") or []
        row = {"outcome": s.get("outcome"), "reachedAt": s.get("reachedAt"), "attempts": len(trace)}
        if leg == "nvda-absent":
            full = [[(n.get("name"), n.get("role"), n.get("backendId")) for n in (g.get("line") or [])] for g in trace]
            row["lines"] = [[[name, role] for name, role, _ in line] for line in full]
            row["repeatedPosition"] = any(full[k] == full[k - 1] for k in range(1, len(full)))
        else:
            row["speech"] = [g.get("speech") for g in trace]
        out[sid] = row
    return out


def focus_attempt(a, leg, label):
    s = step(a, "reach-field")
    if s is None or not s.get("goalTrace"):
        return None
    g0 = s["goalTrace"][0]
    points = s.get("calibration") or []
    early = next((p for p in points if p["phase"] == "goal-check"), None)
    end = next((p for p in points if p["phase"] == "observation-end"), None)
    early_name = (g0.get("node") or {}).get("name") if g0.get("node") is not None else None
    end_goal = (end or {}).get("goal") or {}
    end_name = (end_goal.get("node") or {}).get("name") if end_goal.get("node") is not None else None
    full_early = (early or {}).get("fullTreeFocus")
    full_end = (end or {}).get("fullTreeFocus")
    row = {
        "outcome": s.get("outcome"),
        "earlyRead": {"name": early_name, "role": (g0.get("node") or {}).get("role"), "named": named(early_name, label)},
        "endRead": {"name": end_name, "named": named(end_name, label)},
        "fullTreeEarly": None if full_early is None else {**full_early, "named": named(full_early.get("name"), label)},
        "fullTreeEnd": None if full_end is None else {**full_end, "named": named(full_end.get("name"), label)},
        "fullTreeErrors": [p["fullTreeError"] for p in points if "fullTreeError" in p],
        "readErrors": [p[k] for p in points for k in ("error", "goalError") if k in p],
    }
    if leg == "nvda-present" and early is not None:
        speech = [e for e in (a.get("speechEvents") or []) if e.get("kind") == "speak"]
        focus = [e["text"] for e in speech if g0["t"] <= e["t"] <= early["endedQpcNs"]]
        late_end = (end or {}).get("endedQpcNs", s.get("endedAt", early["endedQpcNs"]))
        late = [e["text"] for e in speech if early["endedQpcNs"] < e["t"] <= late_end]
        row["focusSpeech"] = {"utterances": focus, "named": any(named(u, label) for u in focus)}
        row["lateSpeech"] = {"utterances": late, "named": any(named(u, label) for u in late)}
    return row


def all3(rows, pred):
    vals = [r for r in rows if r is not None]
    return {"n": len(vals), "holds": len(vals) == 3 and all(pred(r) for r in vals)}


def main():
    root = pathlib.Path(sys.argv[1])
    blocks, cursor, focus = {}, {}, {}
    for journey, cid in CURSOR.items():
        for case, leg, model in (("p42-cursor", "nvda-absent", "v1"), ("p42-cursor-v2", "nvda-absent", "v2"), ("p42-cursor", "nvda-present", "nvda")):
            b, status = block(root, leg, case, journey)
            blocks[f"{cid} {model}"] = status
            reps = by_rep(b)
            cursor.setdefault(cid, {})[model] = {str(r): (cursor_attempt(reps[r], leg) if r in reps else None) for r in REPS}
    for journey, (fid, label) in FOCUS.items():
        for leg in ("nvda-absent", "nvda-present"):
            b, status = block(root, leg, "p42-focus", journey)
            blocks[f"{fid} {leg}"] = status
            reps = by_rep(b)
            focus.setdefault(fid, {"label": label})[leg] = {str(r): (focus_attempt(reps[r], leg, label) if r in reps else None) for r in REPS}

    def tgt(cid, model):
        return [None if r is None else r["read-to-target"] for r in cursor[cid][model].values()]

    def reached(r):
        return r["outcome"] == "REACHED"

    v2_ok = {c: all3(tgt(c, "v2"), lambda r: reached(r) and not r["repeatedPosition"]) for c in ("C1", "C2", "C3")}
    nvda_ok = {c: all3(tgt(c, "nvda"), reached) for c in ("C1", "C2", "C3", "C4")}
    c4_pairs = []
    for r in map(str, REPS):
        v1, v2 = cursor["C4"]["v1"][r], cursor["C4"]["v2"][r]
        if v1 is None or v2 is None:
            c4_pairs.append(None)
            continue
        c4_pairs.append(all((v1[s] or {}).get("lines") == (v2[s] or {}).get("lines") for s in ("read-to-target", "past-end")))
    c4_equal = {"n": sum(p is not None for p in c4_pairs), "holds": len([p for p in c4_pairs if p is not None]) == 3 and all(c4_pairs)}
    positive = all3(tgt("C1", "v1"), lambda r: r["repeatedPosition"] and not reached(r))
    rule1 = all(x["holds"] for x in v2_ok.values()) and c4_equal["holds"] and all(x["holds"] for x in nvda_ok.values())

    def c3_le():
        v1, v2 = tgt("C3", "v1"), tgt("C3", "v2")
        pairs = [(a, b) for a, b in zip(v1, v2) if a is not None and b is not None]
        return {"n": len(pairs), "holds": len(pairs) == 3 and all(reached(a) and reached(b) and b["attempts"] <= a["attempts"] for a, b in pairs)}

    def past_end(model):
        return all3([None if r is None else r["past-end"] for r in cursor["C4"][model].values()], lambda r: r is not None and reached(r))

    rule2 = {}
    for fid, data in focus.items():
        absent = [None if r is None else r["earlyRead"]["named"] for r in data["nvda-absent"].values()]
        msaa = [None if r is None else r["earlyRead"]["named"] for r in data["nvda-present"].values()]
        speech = [None if r is None else (r.get("focusSpeech") or {}).get("named") for r in data["nvda-present"].values()]
        full = [None if r is None or r["fullTreeEarly"] is None else r["fullTreeEarly"]["named"] for r in data["nvda-absent"].values()]
        values = absent + msaa + speech
        if any(v is None for v in values):
            verdict = "comparison missing"
        elif len(set(values)) == 1:
            verdict = "agree"
        elif len(set(speech)) != 1:
            verdict = "NVDA focus speech inconsistent across repetitions: report"
        else:
            reference = speech[0]
            notes = []
            if any(v != reference for v in absent):
                notes.append("partial read disagrees; full-tree agrees: propose later registration" if all(v == reference for v in full) else "partial read disagrees; full-tree does not agree: report")
            if any(v != reference for v in msaa):
                notes.append("MSAA disagrees: report only")
            verdict = "; ".join(notes)
        rule2[fid] = {"absentEarlyNamed": absent, "msaaEarlyNamed": msaa, "nvdaFocusSpeechNamed": speech, "absentFullTreeEarlyNamed": full, "verdict": verdict}

    def fpred(fid, expect_named):
        d = focus[fid]
        rows = [r for leg in ("nvda-absent", "nvda-present") for r in d[leg].values()]
        sp = [None if r is None else (r.get("focusSpeech") or {}).get("named") for r in d["nvda-present"].values()]
        ok = all(r is not None and r["earlyRead"]["named"] is expect_named for r in rows) and all(v is expect_named for v in sp)
        return {"n": sum(r is not None for r in rows), "holds": ok}

    f3_end = all(r is not None and r["endRead"]["named"] is True for leg in ("nvda-absent", "nvda-present") for r in focus["F3"][leg].values())
    predictions = {
        "C1 NVDA reaches": nvda_ok["C1"], "C1 v2 reaches, no repeat": v2_ok["C1"], "C1 v1 repeats a marker and does not reach (positive control)": positive,
        "C2 NVDA reaches": nvda_ok["C2"], "C2 v2 reaches, no repeat": v2_ok["C2"],
        "C3 NVDA reaches": nvda_ok["C3"], "C3 v1 and v2 reach, v2 attempts <= v1": c3_le(),
        "C4 v1 and v2 identical lines": c4_equal, "C4 v1 stays on last line past end": past_end("v1"), "C4 v2 stays on last line past end": past_end("v2"),
        "F1 all early reads and NVDA focus speech named": fpred("F1", True),
        "F2 all early reads and NVDA focus speech unnamed": fpred("F2", False),
        "F3 early reads and NVDA focus speech unnamed": fpred("F3", False), "F3 end reads named": {"holds": f3_end},
        "F4 all early reads and NVDA focus speech named": fpred("F4", True),
    }
    recorded = {
        "C2 v1 outcomes": [None if r is None else [r["outcome"], r["repeatedPosition"]] for r in tgt("C2", "v1")],
        "C4 NVDA past-end outcomes": [None if r is None else (r["past-end"] or {}).get("outcome") for r in cursor["C4"]["nvda"].values()],
        "F3 NVDA late speech named": [None if r is None else (r.get("lateSpeech") or {}).get("named") for r in focus["F3"]["nvda-present"].values()],
    }
    print(json.dumps({
        "approval": "P42/DR-0120",
        "blocks": blocks,
        "decisionRules": {
            "rule1CursorV2": {"accepted": rule1, "v2OnC1toC3": v2_ok, "c4LinesEqual": c4_equal, "nvdaReachesTargets": nvda_ok, "positiveControlC1": positive},
            "rule2FocusReaders": {"unchanged": all(v["verdict"] == "agree" for v in rule2.values()), "byControl": rule2},
        },
        "predictions": predictions,
        "recordedNotPredicted": recorded,
        "cursor": cursor,
        "focus": focus,
    }, indent=1))


main()
