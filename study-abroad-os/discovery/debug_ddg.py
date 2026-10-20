import urllib.request,urllib.parse,re
u='https://lite.duckduckgo.com/lite/?q='+urllib.parse.quote('Peking University official website'); t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})).read().decode('utf8','ignore');
for pat in ['result-link','result__a','Peking','uddg'] : print(pat,t.find(pat))
print(t[t.find('result'):t.find('result')+2000])
