import urllib.request,urllib.parse,re
for base in ['https://search.brave.com/search?q=','https://www.ecosia.org/search?q=','https://search.yahoo.com/search?p=']:
 try:
  u=base+urllib.parse.quote('北京大学 官网 国际学生 本科招生'); t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=20).read().decode('utf8','ignore'); print(base,len(t),[(x[:100]) for x in re.findall(r'https?://[^"<> ]+',t)[:5]])
 except Exception as e: print(base,e)
