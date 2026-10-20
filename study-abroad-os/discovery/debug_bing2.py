import urllib.request,urllib.parse,re
q='北京大学 官网 国际学生 本科招生'; u='https://www.bing.com/search?cc=cn&setlang=zh-cn&form=QBLH&q='+urllib.parse.quote(q); t=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'})).read().decode('utf8','ignore');
for x in ['b_algo','北京大学','No results','captcha','因特网']: print(x,t.find(x))
print(re.sub('<[^>]+>',' ',t)[:2000])
