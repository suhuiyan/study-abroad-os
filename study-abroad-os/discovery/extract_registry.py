"""Extract the official MOE institution register; does not infer admissions."""
import hashlib
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / '.vendor'))
import xlrd

URL = 'https://www.moe.gov.cn/jyb_xxgk/s5743/s5744/202606/W020260618416094865984.xls'
PAGE = 'https://www.moe.gov.cn/jyb_xxgk/s5743/s5744/202606/t20260618_1441074.html'


def extract():
    target = ROOT / 'data'
    target.mkdir(exist_ok=True)
    request = urllib.request.Request(URL, headers={'User-Agent': 'StudyAbroadOS-Discovery/1.0'})
    with urllib.request.urlopen(request, timeout=45) as response:
        content = response.read(10_000_001)
    if len(content) > 10_000_000:
        raise ValueError('MOE register exceeds size limit')
    book = xlrd.open_workbook(file_contents=content)
    rows = []
    province = None
    for sheet in book.sheets():
        for index in range(sheet.nrows):
            cells = [str(v).strip() if not isinstance(v, float) else str(int(v)) for v in sheet.row_values(index)]
            # The ministry groups institutions by province before numbered rows.
            if len(cells) >= 6 and cells[2].isdigit() and len(cells[2]) == 10:
                rows.append({'moeCode': cells[2], 'nameZh': cells[1], 'authority': cells[3],
                             'city': cells[4], 'level': cells[5], 'province': province,
                             'note': cells[6] if len(cells) > 6 else '', 'sheet': sheet.name, 'row': index + 1})
            else:
                for value in cells:
                    label = value.split('(')[0].split('\uff08')[0].strip()
                    if label.endswith(('省', '市', '自治区')):
                        province = label
    if len(rows) != 2952 or len({r['moeCode'] for r in rows}) != 2952:
        raise ValueError(f'Expected 2952 unique institutions in 2026 source; got {len(rows)}')
    bachelors = sum(r['level'] == '本科' for r in rows)
    if bachelors != 1412 or any(not r['province'] for r in rows):
        raise ValueError(f'Invalid level/province extraction: bachelors={bachelors}')
    digest = hashlib.sha256(content).hexdigest()
    (target / f'moe-2026-{digest[:12]}.xls').write_bytes(content)
    data = {'sourceUrl': URL, 'landingUrl': PAGE, 'publishedAt': '2026-06-18',
            'asOf': '2026-06-17', 'retrievedAt': datetime.now(timezone.utc).isoformat(),
            'sha256': digest, 'institutions': rows}
    (target / 'moe-2026.json').write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'institutions': len(rows), 'bachelors': bachelors, 'sha256': digest}))


if __name__ == '__main__':
    extract()
