"""Fetch Wikidata official-website statements as unverified candidates for MOE rows.
Does not edit Excel/SQLite and never upgrades a link to verified.
"""
from __future__ import annotations
import argparse, concurrent.futures, json, time, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

def batches(items, size):
    for i in range(0, len(items), size): yield items[i:i+size]

def fetch_batch(group, timeout):
    names = sorted({str(x['nameZh']) for x in group if x.get('nameZh')})
    vals = ' '.join(json.dumps(n, ensure_ascii=False) for n in names)
    sparql = f'''SELECT DISTINCT ?name ?item ?website WHERE {{
      VALUES ?name {{ {vals} }}
      ?item rdfs:label ?label ; wdt:P856 ?website .
      FILTER(LANG(?label) IN ("zh", "zh-hans", "zh-cn"))
      FILTER(STR(?label) = ?name)
    }}'''
    url = 'https://query.wikidata.org/sparql?' + urllib.parse.urlencode({'query': sparql, 'format': 'json'})
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Study-Abroad-OS university link discovery/1.0',
        'Accept': 'application/sparql-results+json'
    })
    with urllib.request.urlopen(req, timeout=timeout) as response:
        data = json.load(response)
    results = []
    for binding in data.get('results', {}).get('bindings', []):
        label = binding['name']['value']
        results.append({'nameZh': label, 'wikidataItem': binding['item']['value'], 'candidateUrl': binding['website']['value']})
    return results

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--queue', required=True)
    ap.add_argument('--output', required=True)
    ap.add_argument('--batch-size', type=int, default=40)
    ap.add_argument('--timeout', type=int, default=25)
    ap.add_argument('--delay', type=float, default=1.5)
    args = ap.parse_args()
    tasks = [json.loads(x) for x in Path(args.queue).read_text(encoding='utf-8').splitlines() if x.strip()]
    index = {}
    for task in tasks:
        row = task.get('rowSnapshot', {})
        if row.get('official_homepage') or row.get('admissions_url'): continue
        name = row.get('name_zh') or task.get('university', {}).get('nameZh')
        if name: index.setdefault(name, []).append(task)
    groups = list(batches([{'nameZh': name} for name in index], args.batch_size))
    all_rows = []
    for i, group in enumerate(groups, 1):
        try:
            found = fetch_batch(group, args.timeout)
            by_name = {}
            for item in found: by_name.setdefault(item['nameZh'], []).append(item)
            for name in [x['nameZh'] for x in group]:
                for task in index[name]:
                    snap = task.get('rowSnapshot', {})
                    for candidate in by_name.get(name, []):
                        all_rows.append({
                            'moeCode': snap.get('moe_code'), 'nameZh': name,
                            'region': snap.get('region'), 'taskId': task.get('taskId'),
                            'inputVersion': task.get('inputVersion'),
                            'sourceUrl': 'https://www.wikidata.org/wiki/' + candidate['wikidataItem'].rsplit('/', 1)[-1],
                            'wikidataItem': candidate['wikidataItem'],
                            'candidateUrl': candidate['candidateUrl'],
                            'checkedAt': datetime.now(timezone.utc).isoformat(),
                            'officiality': 'unconfirmed', 'decision': 'candidate_needs_review',
                            'retrievalStatus': 'Wikidata P856 statement; university ownership not independently verified'
                        })
        except Exception as exc:
            print(f'batch {i}/{len(groups)} failed: {type(exc).__name__}: {exc}', flush=True)
        if i % 5 == 0 or i == len(groups):
            print(f'batches {i}/{len(groups)}; candidates={len(all_rows)}', flush=True)
        time.sleep(args.delay)
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(''.join(json.dumps(row, ensure_ascii=False) + '\n' for row in all_rows), encoding='utf-8')
    print(json.dumps({'inputRows': sum(map(len, index.values())), 'uniqueNames': len(index), 'candidateRows': len(all_rows), 'output': str(output)}, ensure_ascii=False))

if __name__ == '__main__': main()
