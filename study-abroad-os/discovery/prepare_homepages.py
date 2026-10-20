import json
from pathlib import Path
q=Path('study-abroad-os/discovery/data/agent-runs/2026-09-27-pilot/research-tasks.jsonl'); tasks={}
for l in q.read_text(encoding='utf8').splitlines():
 if l.strip():
  t=json.loads(l); tasks[t['university']['moeCode']]=t
items={'4145010593':'https://www.gxu.edu.cn/','4133010336':'https://www.hdu.edu.cn/','4145010595':'https://www.guet.edu.cn/','4151010613':'https://www.swjtu.edu.cn/'}
out=[]
for code,url in items.items():
 t=dict(tasks[code]); t['rowSnapshot']=dict(t['rowSnapshot']); t['rowSnapshot']['official_homepage']=url; out.append(t)
Path('study-abroad-os/discovery/data/agent-runs/2026-09-27-pilot/targeted-homepages-2026-10-06.jsonl').write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in out),encoding='utf8')
