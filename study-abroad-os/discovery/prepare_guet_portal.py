import json
from pathlib import Path
q=Path('study-abroad-os/discovery/data/agent-runs/2026-09-27-pilot/research-tasks.jsonl'); t=next(json.loads(l) for l in q.read_text(encoding='utf8').splitlines() if l.strip() and json.loads(l)['university']['moeCode']=='4145010595'); t=dict(t); t['rowSnapshot']=dict(t['rowSnapshot']); t['rowSnapshot']['admissions_url']='http://admission.guet.edu.cn/'; Path('study-abroad-os/discovery/data/agent-runs/2026-09-27-pilot/guet-portal-task-2026-10-06.jsonl').write_text(json.dumps(t,ensure_ascii=False)+'\n',encoding='utf8')
