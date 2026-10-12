"""EXPLORATORY ablation for the decision-pack addendum (owner request, 2026-10-13).

Writes a masked copy of a downloaded corpus run for re-scoring with the unchanged frozen scorer:
  dom-only        every attempt's WinEvent trace (listenerEvents) is emptied; the DOM timeline is kept
  winevents-only  every attempt's DOM mutation timeline (timeline) is emptied; WinEvents are kept
Nothing else in any block changes; b2Evidence keeps its recorded value so the scorer does not treat the
masked source as missing. Only blocks/*.json.gz are rewritten; every other file is copied unchanged.

Usage: python3 -I mask-b2-sources.py <dom-only|winevents-only> <run dir> <output dir>
"""
import gzip, json, pathlib, shutil, sys

mode, src, dst = sys.argv[1], pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3])
field = {"dom-only": "listenerEvents", "winevents-only": "timeline"}[mode]
masked_attempts = blocks = 0
for path in sorted(src.rglob("*")):
    out = dst / path.relative_to(src)
    if path.is_dir():
        out.mkdir(parents=True, exist_ok=True)
        continue
    out.parent.mkdir(parents=True, exist_ok=True)
    if path.name.endswith(".json.gz") and "blocks" in path.parts:
        b = json.load(gzip.open(path))
        for a in b.get("attempts", []):
            if field in a:
                a[field] = []
                masked_attempts += 1
        with gzip.open(out, "wt", encoding="utf-8") as f:
            json.dump(b, f)
        blocks += 1
    else:
        shutil.copy2(path, out)
print(json.dumps({"mode": mode, "maskedField": field, "blocks": blocks, "maskedAttempts": masked_attempts}))
