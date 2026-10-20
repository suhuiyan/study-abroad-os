import json
from pathlib import Path
q=Path('study-abroad-os/discovery/data/agent-runs/2026-09-27-pilot/research-tasks.jsonl'); ts=[json.loads(l) for l in q.read_text(encoding='utf8').splitlines() if l.strip()]; t=next(x for x in ts if x['university']['moeCode']=='4145010595'); t['rowSnapshot']=dict(t['rowSnapshot']); t['rowSnapshot']['admissions_url']='https://www.guet.edu.cn/international/2026/0529/c663a154451/page.htm'; Path('study-abroad-os/discovery/data/agent-runs/2026-09-27-pilot/guet-scholarship-task-2026-10-06.jsonl').write_text(json.dumps(t,ensure_ascii=False)+'\n',encoding='utf8')
