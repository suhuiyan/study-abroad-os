import urllib.request,urllib.parse,re,html
u='https://www.bing.com/search?q='+urllib.parse.quote('北京大学 官网 国际学生 本科招生')
t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})).read().decode('utf8','ignore')
for m in re.finditer(r'<h2[^>]*>\s*<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>',t,re.S|re.I):
 print(m.group(1)[:300], re.sub('<.*?>','',m.group(2))[:100])
