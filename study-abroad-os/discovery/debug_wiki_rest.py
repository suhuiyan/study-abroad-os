import urllib.request,urllib.parse
u='https://zh.wikipedia.org/api/rest_v1/page/html/'+urllib.parse.quote('北京大学'); r=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Study-Abroad-OS-research/1.0'}),timeout=20); b=r.read(); print(r.status,len(b),r.geturl(),b[:60])
