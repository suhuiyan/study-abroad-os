import urllib.request,urllib.parse,re
u='https://zh.wikipedia.org/wiki/'+urllib.parse.quote('北京大学'); t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=20).read().decode('utf8','ignore');
for pat in ['官方网站','官网','p856','官方网站']: print(pat,t.find(pat))
i=t.find('官方网站'); print(t[i-500:i+1200])
