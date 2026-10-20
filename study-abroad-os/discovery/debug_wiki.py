import urllib.request,urllib.parse
u='https://zh.wikipedia.org/wiki/'+urllib.parse.quote('中国大陆高等学校列表'); t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})).read().decode('utf8','ignore'); print(len(t),t.find('4111010001'),t.find('北京大学')); open('study-abroad-os/discovery/wiki.html','w',encoding='utf8').write(t)
