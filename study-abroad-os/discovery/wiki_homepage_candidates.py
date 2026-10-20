from __future__ import annotations
import argparse,concurrent.futures,html,json,random,re,time
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import quote,urlparse
from urllib.request import Request,urlopen

def one(task,timeout):
 s=task.get('rowSnapshot',{}); name=s.get('name_zh') or task.get('university',{}).get('nameZh',''); code=s.get('moe_code') or task.get('university',{}).get('moeCode'); article='https://zh.wikipedia.org/wiki/'+quote(name)
 out={'moeCode':code,'nameZh':name,'region':s.get('region'),'taskId':task.get('taskId'),'inputVersion':task.get('inputVersion'),'sourceUrl':article,'checkedAt':datetime.now(timezone.utc).isoformat(),'candidates':[],'error':None}
 try:
  u='https://zh.wikipedia.org/api/rest_v1/page/html/'+quote(name); req=Request(u,headers={'User-Agent':'Study-Abroad-OS-research/1.0'}); t=urlopen(req,timeout=timeout).read().decode('utf8','ignore'); marker=t.find('官方网站')
  if marker<0: marker=t.find('官方网站：')
  if marker>=0:
   sec=t[marker: t.find('</li>',marker)+5 if t.find('</li>',marker)>0 else marker+2500]
   seen=set()
   for href,label in re.findall(r'<a[^>]+href=["\'](https?://[^"\']+)["\'][^>]*>(.*?)</a>',sec,re.S|re.I):
    href=html.unescape(href); host=urlparse(href).netloc.lower(); lab=re.sub('<[^>]+>','',html.unescape(label)).strip()
    if host and host not in ('zh.wikipedia.org','query.wikidata.org') and href not in seen:
     seen.add(href); out['candidates'].append({'url':href,'host':host,'label':lab,'officiality':'unconfirmed','ownershipEvidenceUrl':article})
   out['candidates']=out['candidates'][:3]
  return out
 except Exception as e: out['error']=f'{type(e).__name__}: {e}'; return out

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--queue',required=True); ap.add_argument('--output',required=True); ap.add_argument('--workers',type=int,default=16); ap.add_argument('--timeout',type=float,default=15); args=ap.parse_args()
 tasks=[json.loads(x) for x in Path(args.queue).read_text(encoding='utf8').splitlines() if x.strip()]; tasks=[t for t in tasks if not(t.get('rowSnapshot',{}).get('official_homepage') or t.get('rowSnapshot',{}).get('admissions_url'))]
 out=Path(args.output); out.parent.mkdir(parents=True,exist_ok=True); results=[]
 with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
  for n,r in enumerate(ex.map(lambda t: one(t,args.timeout),tasks),1):
   results.append(r)
   if n%50==0: print(f'completed {n}/{len(tasks)}',flush=True)
 out.write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in results),encoding='utf8')
 print(json.dumps({'tasks':len(tasks),'results':len(results),'withCandidates':sum(bool(r['candidates']) for r in results),'errors':sum(bool(r['error']) for r in results),'output':str(out)},ensure_ascii=False))
if __name__=='__main__': main()
