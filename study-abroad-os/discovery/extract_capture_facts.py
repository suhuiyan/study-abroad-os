import json,re
from pathlib import Path
from html.parser import HTMLParser
class P(HTMLParser):
 def __init__(self): super().__init__(); self.title=False; self.in_title=False; self.parts=[]
 def handle_starttag(self,t,a):
  if t=='title': self.in_title=True
  if t in ('script','style','noscript'): self.parts.append(' ')
 def handle_endtag(self,t):
  if t=='title': self.in_title=False
 def handle_data(self,d): self.parts.append(d)
root=Path('study-abroad-os/discovery/data/agent-runs/2026-09-27-pilot/targeted-followup-captures-2026-10-06')
for line in (root/'source-captures.jsonl').read_text(encoding='utf8').splitlines():
 c=json.loads(line); f=root/c['capturePath']; t=f.read_text(encoding='utf8',errors='ignore'); p=P(); p.feed(t); text=' '.join(' '.join(p.parts).split()); title=re.search(r'<title[^>]*>(.*?)</title>',t,re.S|re.I); title=re.sub('<.*?>','',title.group(1)).strip() if title else ''
 terms=['2026','本科','Undergraduate','国际学生','international','Scholarship','奖学金','Application Period','Application Deadline','申请日期','截止']
 snippets=[]
 for term in terms:
  m=re.search(term,text,re.I)
  if m: snippets.append(text[max(0,m.start()-140):min(len(text),m.end()+240)])
 print('\n',c['moeCode'],c['urlField'],c['finalUrl'],'TITLE=',title)
 for s in dict.fromkeys(snippets): print(' -',s)
