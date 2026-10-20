import json
from pathlib import Path
q=Path('study-abroad-os/discovery/data/agent-runs/2026-09-27-pilot/research-tasks.jsonl')
tasks={}
for line in q.read_text(encoding='utf8').splitlines():
 if line.strip():
  t=json.loads(line); tasks[t['university']['moeCode']]=t
urls={
 '4145010593':{'official_homepage':'https://www.gxu.edu.cn/'},
 '4133010336':{'admissions_url':'https://intedu.hdu.edu.cn/2026/0323/c12669a290539/page.htm','official_homepage':'https://lxsgl.hdu.edu.cn/'},
 '4145010595':{'admissions_url':'https://www.guet.edu.cn/internationaleng/2026/0511/c4882a153105/page.htm','official_homepage':'https://www.guet.edu.cn/international/2026/0529/c663a154451/page.htm'},
 '4151010613':{'admissions_url':'https://sie.swjtu.edu.cn/info/1029/3092.htm','official_homepage':'https://admission.swjtu.edu.cn/'},
}
out=[]
for code,fields in urls.items():
 t=tasks[code]; t=dict(t); t['rowSnapshot']=dict(t['rowSnapshot']); t['rowSnapshot'].update(fields); out.append(t)
Path('study-abroad-os/discovery/data/agent-runs/2026-09-27-pilot/targeted-followup-tasks-2026-10-06.jsonl').write_text(''.join(json.dumps(t,ensure_ascii=False)+'\n' for t in out),encoding='utf8')
print([(x['university']['moeCode'],x['university']['nameZh'],list(x['rowSnapshot'].keys())) for x in out])
