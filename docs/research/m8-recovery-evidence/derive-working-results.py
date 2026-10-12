import pathlib,json,gzip
root=pathlib.Path('artefacts/38307364080');out=pathlib.Path('docs/research/m8-recovery-evidence');a=json.loads((out/'evidence-audit.json').read_text())
assert a['counts']['blocks']==8 and a['counts']['attempts']==24 and a['counts']['validity']=={'VALID':8}
assert all(s['manifestValid'] and not s['fatal'] for s in a['summaries'])
assert all(p['approval']=='P41/DR-0116' and len(p['results'])==4 and all(r['status']=='completed' for r in p['results']) for p in a['pilotSummaries'])
assert all(r['installExit']==0 and r['buildExit']==0 and not r['candidateBuilt'] for x in a['builds'] for r in x['builds'])
for b in a['blocks']:
 assert b['split']=='dev' and b['itemId'].startswith('m8-oss-') and b['candidate']=={} and b['pre']['ok'] and b['post']['ok']
 for t in b['attempts']:
  assert not any(t.get(k) for k in ['error','pageErrors','external'])
  assert (t['notRun'] or []) == (['open-options','reach-first-option','wrap-to-last-option'] if b['journeyId']=='oss-vuetify-22770' else [])
records=[];intervals=[];timings=[]
for path in sorted(root.rglob('blocks/*.json.gz')):
 b=json.loads(gzip.decompress(path.read_bytes()))
 for t in b['attempts']:
  for s in t['steps']:
   points=s.get('calibration',[]);early=[p for p in points if p['phase']=='goal-check'];late=next((p for p in points if p['phase']=='observation-end'),None)
   if not early or late is None:continue
   assert all(p['internalMode']['available'] is False for p in points)
   if s['stepId']=='open-details':timings.append({'leg':b['leg'],'repetition':t['repetition'],'earlySampleMs':(early[-1]['startedQpcNs']-s['goalTrace'][-1]['t'])/1e6,'lateSampleMs':(late['startedQpcNs']-s['goalTrace'][-1]['t'])/1e6})
   records.append({'journey':b['journeyId'],'leg':b['leg'],'repetition':t['repetition'],'step':s['stepId'],'outcome':s['outcome'],'goalAttempts':len(s.get('goalTrace',[])),'firstPoint':early[0],'finalGoalPoint':early[-1],'endPoint':late,'ariaSnapshot':s.get('ariaSnapshot',''),'fullTreeTextboxes': [n for n in s.get('axTree',[]) if n.get('role')=='textbox']})
   if 'speech' in (early[-1].get('goal') or {}):
    p=early[-1];since=p['goal'].get('t',s['startedAt']);bounds=[since,p['startedQpcNs'],p['endedQpcNs'],late['startedQpcNs'],late['endedQpcNs']];assert bounds==sorted(bounds)
    es=[e for e in t['speechEvents'] if e['kind']=='speak' and since<=e['t']<=bounds[-1]];parts=[[] for _ in range(4)]
    for e in es:parts[next(i for i in range(4) if e['t']<=bounds[i+1])].append({'t':e['t'],'text':e['text']})
    intervals.append({'journey':b['journeyId'],'repetition':t['repetition'],'step':s['stepId'],'boundsQpcNs':bounds,'beforeEarlyDiagnostic':parts[0],'duringEarlyDiagnostic':parts[1],'afterEarlyDiagnosticBeforeLateRead':parts[2],'duringLateDiagnostic':parts[3],'recordedEarlySpeech':p['goal']['speech'],'recordedCumulativeEndSpeech':late['goal']['speech']})
a['authority']={'execution':'P41/DR-0116','experimentalHead':'2c4ed7809b110cb263e44031d02e43b414171389','rawChildField':'calibrationApproval=P40/DR-0114 is inherited from original instrumentation; it does not authorise this recovery dispatch. Raw values are retained, not relabelled. Parent pilot-summary and request bind execution to P41/DR-0116.'}
(out/'evidence-audit.json').write_text(json.dumps(a,indent=2)+'\n');(out/'working-results.json').write_text(json.dumps({'runId':38307364080,'label':'EXPLORATORY','authority':a['authority'],'modalTimings':timings,'records':records},indent=2)+'\n');(out/'speech-intervals.json').write_text(json.dumps({'runId':38307364080,'method':'Disjoint retained QPC receipt intervals around diagnostic reads. Cumulative end snapshots are not late-only announcements; exact primary goal-read time is unavailable. Boundary-equal events belong to earlier interval.','records':intervals},indent=2)+'\n')
print('Verified 8 valid blocks, 24 base-only attempts, 16 K1 passes, 8 successful builds; no fatal/page/external/diagnostic errors. Vuetify subsequent steps correctly not run after baseline goal failure.')
print(timings)
for b in a['blocks']:
 if b['leg']=='nvda-present':
  s=b['attempts'][0]['steps'][-1];print(b['journeyId'],'totalLastStepSpeechEvents',s['totalSpeakEvents'],'focus',s['late']['domFocus'])
