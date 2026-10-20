import urllib.request,urllib.parse,re,html
for q in ['Peking University official website','Tsinghua University official website','北京大学 官网']:
 u='https://www.bing.com/search?q='+urllib.parse.quote(q)+'&setmkt=en-US'; t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})).read().decode('utf8','ignore'); print('\nQ',q,'len',len(t),'algo',t.find('b_algo'),'h2',t.find('<h2'))
 for m in re.finditer(r'<h2[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>',t,re.S|re.I): print(html.unescape(m.group(1))[:120],re.sub('<.*?>','',m.group(2))[:80])
