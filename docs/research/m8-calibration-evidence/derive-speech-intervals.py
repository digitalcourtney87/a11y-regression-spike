"""Read retained QPC speech events; do not execute fixtures or change outcomes.
Run from the repository root after downloading run 38299059098 into artefacts/.
"""
import gzip
import json
from pathlib import Path

records = []
for path in sorted(Path('artefacts/38299059098/m8-calibration-nvda-present').rglob('blocks/*.json.gz')):
    block = json.loads(gzip.decompress(path.read_bytes()))
    for attempt in block['attempts']:
        for step in attempt['steps']:
            points = step.get('calibration', [])
            early = [p for p in points if p['phase'] == 'goal-check']
            late = next((p for p in points if p['phase'] == 'observation-end'), None)
            if not early or late is None or 'speech' not in (early[-1].get('goal') or {}):
                continue
            early = early[-1]
            since = early['goal'].get('t', step['startedAt'])
            bounds = [since, early['startedQpcNs'], early['endedQpcNs'], late['startedQpcNs'], late['endedQpcNs']]
            assert bounds == sorted(bounds)
            events = [e for e in attempt['speechEvents'] if e['kind'] == 'speak' and since <= e['t'] <= bounds[-1]]
            intervals = [[] for _ in range(4)]
            for event in events:
                index = next(i for i in range(4) if event['t'] <= bounds[i + 1])
                intervals[index].append({'t': event['t'], 'text': event['text']})
            assert sum(map(len, intervals)) == len(events)
            records.append({'journey': block['journeyId'], 'repetition': attempt['repetition'], 'step': step['stepId'], 'boundsQpcNs': bounds, 'beforeEarlyDiagnostic': intervals[0], 'duringEarlyDiagnostic': intervals[1], 'afterEarlyDiagnosticBeforeLateRead': intervals[2], 'duringLateDiagnostic': intervals[3], 'recordedEarlySpeech': early['goal']['speech'], 'recordedCumulativeEndSpeech': late['goal']['speech']})
results = [r for r in records if r['step'] == 'read-result' and r['journey'] == 'm8-feedback-document']
assert len(results) == 3
assert all(any(e['text'] == 'Chosen Alpha' for e in r['beforeEarlyDiagnostic']) and not any(r[k] for k in ['duringEarlyDiagnostic', 'afterEarlyDiagnosticBeforeLateRead', 'duringLateDiagnostic']) for r in results)
output = {'runId': 38299059098, 'method': 'Disjoint QPC receipt intervals around diagnostic read boundaries. Primary goal read precedes the early diagnostic start; exact goal-read timestamp is not separately captured. End goal speech is cumulative since last input and is not late-only evidence. Boundary-equal events belong only to the earlier interval.', 'records': records}
Path('docs/research/m8-calibration-evidence/speech-intervals.json').write_text(json.dumps(output, indent=2) + '\n')
print(f'Partitioned {len(records)} browse steps; Chosen Alpha is early in all three document repetitions, with no later speech.')
