"""Read-only: measured GitHub Actions job time for every workflow run in the repository, by workflow and runner OS.

Usage: python3 -I derive-runner-minutes.py > runner-minutes.json  (needs an authenticated `gh`).
Job time is completed_at minus started_at per job, as GitHub reports it; skipped jobs count as zero.
These are administrative durations, not billing; the repository is public and uses standard runners.
"""
import json, subprocess
from collections import defaultdict
from datetime import datetime

REPO = "digitalcourtney87/a11y-regression-spike"


def api(path):
    out = subprocess.run(["gh", "api", "--paginate", path], check=True, capture_output=True, text=True).stdout
    # --paginate concatenates JSON objects; split them.
    objs, dec, i = [], json.JSONDecoder(), 0
    while i < len(out):
        while i < len(out) and out[i].isspace():
            i += 1
        if i >= len(out):
            break
        obj, i = dec.raw_decode(out, i)
        objs.append(obj)
    return objs


def ts(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


runs = [r for page in api(f"repos/{REPO}/actions/runs?per_page=100") for r in page["workflow_runs"]]
by_workflow = defaultdict(lambda: {"runs": 0, "jobs": 0, "seconds": {"windows": 0.0, "linux": 0.0, "other": 0.0}})
per_run = []
for r in sorted(runs, key=lambda x: x["id"]):
    jobs = [j for page in api(f"repos/{REPO}/actions/runs/{r['id']}/jobs?per_page=100&filter=all") for j in page["jobs"]]
    secs = {"windows": 0.0, "linux": 0.0, "other": 0.0}
    for j in jobs:
        if not j.get("started_at") or not j.get("completed_at"):
            continue
        d = max(0.0, (ts(j["completed_at"]) - ts(j["started_at"])).total_seconds())
        labels = " ".join(j.get("labels") or []).lower()
        os_ = "windows" if "windows" in labels else "linux" if ("ubuntu" in labels or "linux" in labels) else "other"
        secs[os_] += d
    w = by_workflow[r["name"]]
    w["runs"] += 1
    w["jobs"] += len(jobs)
    for k in secs:
        w["seconds"][k] += secs[k]
    per_run.append({"id": r["id"], "workflow": r["name"], "event": r["event"], "conclusion": r["conclusion"], "started": r["run_started_at"], "jobs": len(jobs), "seconds": {k: round(v, 1) for k, v in secs.items()}})

total = {k: round(sum(w["seconds"][k] for w in by_workflow.values()) / 60, 1) for k in ("windows", "linux", "other")}
print(json.dumps({
    "repository": REPO,
    "method": "Sum of per-job completed_at - started_at from the GitHub Actions API; administrative durations, not billing.",
    "runs": len(per_run),
    "totalMinutes": total,
    "byWorkflowMinutes": {name: {"runs": w["runs"], "jobs": w["jobs"], **{k: round(v / 60, 1) for k, v in w["seconds"].items()}} for name, w in sorted(by_workflow.items())},
    "perRun": per_run,
}, indent=1))
