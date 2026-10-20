import urllib.request,urllib.parse,json,re
params={'action':'query','format':'json','prop':'revisions','rvprop':'content','rvslots':'main','titles':'北京大学','formatversion':'2'}; x=json.load(urllib.request.urlopen(urllib.request.Request('https://zh.wikipedia.org/w/api.php?'+urllib.parse.urlencode(params),headers={'User-Agent':'Study-Abroad-OS-research/1.0'}))); c=x['query']['pages'][0]['revisions'][0]['slots']['main']['content'];
for p in ['pku.edu.cn','官网','外部链接','Official']:
 i=c.find(p); print(p,i,c[i-200:i+300] if i>=0 else '')
