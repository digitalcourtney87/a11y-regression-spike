"""Read-only: first-Tab focus reads and NVDA speech for Vuetify 3.3.6 in P41 run 38307364080.

Usage: python3 -I derive-vuetify-focus-speech.py <extracted m8-working-recovery archive dir>
Reads the two retained block files and prints JSON. Changes no evidence, outcome or verdict.
"""
import gzip, json, pathlib, sys

root = pathlib.Path(sys.argv[1])
rows = []
for leg in ("nvda-absent", "nvda-present"):
    block = json.load(gzip.open(root / f"m8-working-recovery-{leg}/vuetify-input/blocks/m8-oss-vuetify-22770.json.gz"))
    for a in block["attempts"]:
        step = a["steps"][0]
        first, second = step["goalTrace"][0], step["goalTrace"][1]
        speech = [e["text"] for e in (a.get("speechEvents") or []) if e["kind"] == "speak" and first["t"] <= e["t"] < second["t"]]
        end_tree = {n["backendId"]: n for n in step["axTree"] if "backendId" in n and n["role"] == "textbox"}
        rows.append({
            "leg": leg,
            "repetition": a["repetition"],
            "step": step["stepId"],
            "outcome": step["outcome"],
            "firstTabGoalRead": first["node"],
            "firstTabDomFocus": {k: step["calibration"][0]["domFocus"][k] for k in ("tag", "id", "labels")},
            "speechBetweenFirstAndSecondTab": speech if leg == "nvda-present" else None,
            "stepEndFocus": step["focusAtEnd"],
            "stepEndFullTreeTextboxes": [{"backendId": b, "name": n["name"]} for b, n in sorted(end_tree.items())],
        })
print(json.dumps({
    "runId": 38307364080,
    "source": "results m8-working-recovery/ bundle sha256 847c304bcc01756af1395e49ff1f8ea829d6680f709ff7d8303ea1bc1a50d898",
    "method": "Speech events with receipt QPC from the first Tab's goal-check start up to the second Tab; absent leg has no speech. Read-only; no fixture execution.",
    "rows": rows,
}, indent=1))
