from __future__ import annotations
import argparse,json,re,time,urllib.parse,urllib.request
from datetime import datetime,timezone
from pathlib import Path

def chunks(a,n):
 for i in range(0,len(a),n): yield a[i:i+n]
def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--queue',required=True); ap.add_argument('--output',required=True); args=ap.parse_args()
 tasks=[json.loads(x) for x in Path(args.queue).read_text(encoding='utf8').splitlines() if x.strip()]; tasks=[t for t in tasks if not(t.get('rowSnapshot',{}).get('official_homepage') or t.get('rowSnapshot',{}).get('admissions_url'))]
 result={}; names=[(t.get('rowSnapshot',{}).get('name_zh') or t.get('university',{}).get('nameZh','')) for t in tasks]
 for n,group in enumerate(chunks(names,40),1):
  params={'action':'query','format':'json','prop':'revisions','rvprop':'content','rvslots':'main','titles':'|'.join(group),'formatversion':'2'}; u='https://zh.wikipedia.org/w/api.php?'+urllib.parse.urlencode(params)
  try:
   req=urllib.request.Request(u,headers={'User-Agent':'Study-Abroad-OS-research/1.0'}); data=json.load(urllib.request.urlopen(req,timeout=30))
   for p in data.get('query',{}).get('pages',[]):
    title=p.get('title',''); c=((p.get('revisions') or [{}])[0].get('slots',{}).get('main',{}).get('content',''))
    urls=[]
    for tm in re.findall(r'\{\{official websites\|(.+?)\}\}',c,re.I|re.S):
     for url in re.findall(r'https?://[^|}\s]+',tm):
      if url not in urls: urls.append(url)
    result[title]=urls[:5]
  except Exception as e:
   print('batch_error',n,type(e).__name__,e,flush=True)
  if n%5==0: print(f'batches {n}/{(len(names)+39)//40}',flush=True)
  time.sleep(.5)
 out=[]
 for t in tasks:
  s=t.get('rowSnapshot',{}); name=s.get('name_zh') or t.get('university',{}).get('nameZh',''); urls=result.get(name,[]); article='https://zh.wikipedia.org/wiki/'+urllib.parse.quote(name)
  out.append({'moeCode':s.get('moe_code') or t.get('university',{}).get('moeCode'),'nameZh':name,'region':s.get('region'),'taskId':t.get('taskId'),'inputVersion':t.get('inputVersion'),'sourceUrl':article,'checkedAt':datetime.now(timezone.utc).isoformat(),'candidates':[{'url':u,'officiality':'unconfirmed','ownershipEvidenceUrl':article,'source':'wikipedia_official_websites_template'} for u in urls],'error':None if name in result else 'no_wikipedia_page_or_api_result'})
 Path(args.output).write_text(''.join(json.dumps(x,ensure_ascii=False)+'\n' for x in out),encoding='utf8'); print(json.dumps({'tasks':len(tasks),'withCandidates':sum(bool(x['candidates']) for x in out),'output':args.output},ensure_ascii=False))
if __name__=='__main__': main()
