import urllib.request,urllib.parse,re
q='北京大学 官网 国际学生 本科招生'; u='https://www.baidu.com/s?wd='+urllib.parse.quote(q); t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=20).read().decode('utf8','ignore'); print(len(t),t.find('北京大学')); print(re.findall(r'<a[^>]+href="(https?://[^" ]+)"',t)[:10])
