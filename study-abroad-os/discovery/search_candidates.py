"""Search candidate official university URLs for rows with no source; read-only."""
from __future__ import annotations
import argparse, concurrent.futures, html, json, random, re, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, urlparse, parse_qs, unquote
from urllib.request import Request, urlopen

def search_one(task, timeout):
    snap=task.get('rowSnapshot',{}); name=snap.get('name_zh') or task.get('university',{}).get('nameZh',''); region=snap.get('region') or task.get('university',{}).get('region',''); city=snap.get('city','')
    query=f'"{name}" {region} {city} 官网 国际学生 本科 招生'
    search_url='https://lite.duckduckgo.com/lite/?q='+quote(query)
    base={'moeCode':snap.get('moe_code') or task.get('university',{}).get('moeCode'),'nameZh':name,'region':region,'taskId':task.get('taskId'),'inputVersion':task.get('inputVersion'),'query':query,'engine':'duckduckgo_lite','searchUrl':search_url,'checkedAt':datetime.now(timezone.utc).isoformat(),'candidates':[],'error':None}
    try:
        req=Request(search_url,headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64)','Accept-Language':'zh-CN,zh;q=0.9,en;q=0.6'})
        with urlopen(req,timeout=timeout) as resp: body=resp.read(300000); base['httpStatus']=getattr(resp,'status',200)
        text=body.decode('utf-8','ignore')
        # Lite result links carry a URL in uddg; use title/snippet from nearby HTML.
        for m in re.finditer(r'<a[^>]+href=["\']//duckduckgo\.com/l/\?uddg=([^&"\']+)[^>]*class=["\']result-link["\'][^>]*>(.*?)</a>', text, re.S|re.I):
            u=unquote(html.unescape(m.group(1))); title=re.sub(r'<[^>]+>','',html.unescape(m.group(2))).strip(); host=urlparse(u).netloc.lower()
            if not u.startswith(('http://','https://')) or not host or host=='duckduckgo.com': continue
            if any(c['url']==u for c in base['candidates']): continue
            end=text.find('</tr>',m.end()); snippet='';
            if end>m.end():
                part=text[m.end():end]; sm=re.search(r"class=['\"]result-snippet['\"]>(.*?)</td>",part,re.S|re.I)
                if sm: snippet=re.sub(r'<[^>]+>','',html.unescape(sm.group(1))).strip()
            base['candidates'].append({'url':u,'title':title,'snippet':snippet,'host':host})
            if len(base['candidates'])>=8: break
        return base
    except Exception as e:
        base['httpStatus']=None; base['error']=f'{type(e).__name__}: {e}'; return base

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--queue',required=True); ap.add_argument('--output',required=True); ap.add_argument('--workers',type=int,default=8); ap.add_argument('--timeout',type=float,default=20); ap.add_argument('--max-tasks',type=int); ap.add_argument('--delay',type=float,default=.2); args=ap.parse_args()
    tasks=[json.loads(x) for x in Path(args.queue).read_text(encoding='utf-8').splitlines() if x.strip()]
    tasks=[t for t in tasks if not (t.get('rowSnapshot',{}).get('official_homepage') or t.get('rowSnapshot',{}).get('admissions_url'))]
    if args.max_tasks: tasks=tasks[:args.max_tasks]
    out=Path(args.output); out.parent.mkdir(parents=True,exist_ok=True); results=[]
    def run(t): time.sleep(random.uniform(0,args.delay)); return search_one(t,args.timeout)
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        for n,r in enumerate(ex.map(run,tasks),1):
            results.append(r)
            if n%50==0: print(f'completed {n}/{len(tasks)}',flush=True)
    out.write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in results),encoding='utf-8')
    print(json.dumps({'tasks':len(tasks),'results':len(results),'withCandidates':sum(bool(r['candidates']) for r in results),'errors':sum(bool(r['error']) for r in results),'output':str(out)},ensure_ascii=False))
if __name__=='__main__': main()
