import urllib.request,urllib.parse,json
q='SELECT ?item ?itemLabel ?website WHERE { ?item wdt:P856 ?website; rdfs:label "北京大学"@zh-hans. SERVICE wikibase:label { bd:serviceParam wikibase:language "zh-hans". } } LIMIT 5'
u='https://query.wikidata.org/sparql?'+urllib.parse.urlencode({'query':q,'format':'json'})
r=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Study-Abroad-OS/1.0 research contact research@example.invalid','Accept':'application/sparql-results+json'}),timeout=30); d=json.load(r); print(json.dumps(d,ensure_ascii=False)[:2000])
