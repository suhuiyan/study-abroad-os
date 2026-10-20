"""Private, loopback-only university discovery register and review API."""
import json
import os
import sqlite3
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
DATA = ROOT / 'data'
DB = DATA / 'discovery.sqlite3'
REGISTRY = DATA / 'moe-2026.json'
STATUSES = {'not_checked', 'source_found', 'needs_review', 'verified_admissions', 'not_verified', 'no_current_admissions'}
EXISTING = {
    '北京大学': ('https://www.isd.pku.edu.cn/en/detail.php?id=818', 'Peking University'),
    '复旦大学': ('https://iso.fudan.edu.cn/_upload/article/files/bc/ed/37f712cb4e3f8316f4ec2ebc4ba2/6c9fce5d-d137-4934-b484-1c4630f18aa5.pdf', 'Fudan University'),
    '上海交通大学': ('https://gc.sjtu.edu.cn/admission/international-undergraduate-admission/application-requirements/', 'Shanghai Jiao Tong University'),
    '浙江大学': ('https://iczu.zju.edu.cn/admissionsen/2024/1030/c68988a2981659/page.htm', 'Zhejiang University'),
    '厦门大学': ('https://admissions.xmu.edu.cn/Admissions/Undergraduate_Students.htm', 'Xiamen University'),
    '同济大学': ('https://study.tongji.edu.cn/__local/6/AE/A6/66E0A7D71A250672DFF40ED4048_3682FBF2_3762E.pdf', 'Tongji University'),
    '华东师范大学': ('https://lxs.ecnu.edu.cn/en_admission_degree_programs_undergraduate_program/', 'East China Normal University'),
    '北京语言大学': ('https://admission.blcu.edu.cn/en/384/list.htm', 'Beijing Language and Culture University'),
    '对外经济贸易大学': ('https://sie.uibe.edu.cn/en/Prgr/BacDegPro/OfEn/d56a3c4fd73446e9803fb0e0b1345f4a.htm', 'University of International Business and Economics'),
    '山东财经大学': ('https://sie.sdufe.edu.cn/info/1209/79441.htm', 'Shandong University of Finance and Economics'),
}
EXTRA_SEEDS = {
    '清华大学': ('https://international.join-tsinghua.edu.cn/', 'Tsinghua University',
        'https://international.join-tsinghua.edu.cn/', 'Found official international undergraduate admissions page and 2026 intake announcements; verify next cycle and scholarship details.'),
    '北京师范大学': ('https://international.bnu.edu.cn/user/sysNews/detail/23', 'Beijing Normal University',
        'https://admission-is.bnu.edu.cn/english/index.html', 'Found official 2026 undergraduate brochure for international students; verify next cycle and program-specific requirements.'),
    '北京理工大学': ('https://isc.bit.edu.cn/sylbt/c943f28225b14d3084e0049d049964c1.htm', 'Beijing Institute of Technology',
        'https://isc.bit.edu.cn/', 'Found official 2026 international admissions page with separate undergraduate brochure; review PDF and next cycle.'),
    '中国人民大学': ('https://iso.ruc.edu.cn/ENGLISH/banner/index.htm', 'Renmin University of China',
        'https://iso.ruc.edu.cn/ENGLISH/', 'Official international students office lists 2026 international admissions; undergraduate-specific notice still needs confirmation.'),
    '北京外国语大学': ('https://osao.bfsu.edu.cn/info/2612/7182.htm', 'Beijing Foreign Studies University',
        'https://osao.bfsu.edu.cn/Academics/Admissions_Brochure.htm', 'Found official 2026 international undergraduate prospectus; review linked major catalog and next applicable cycle.'),
    '南京大学': ('https://hwxy.nju.edu.cn/English/StudyatNJU/Admissions/BachelorsPrograms/index.html', 'Nanjing University',
        'https://hwxy.nju.edu.cn/', 'Official bachelor admissions page describes international applicants and CSCA from 2026/27; verify full guide, deadlines, scholarships, and next intake.'),
    '华中科技大学': ('https://iso.hust.edu.cn/info/1194/4638.htm', 'Huazhong University of Science and Technology',
        'https://iso.hust.edu.cn/', 'Official 2026 international undergraduate guide; 2025-10-15 to 2026-06-15 application period has passed, so verify next intake and scholarships.'),
    '哈尔滨工业大学': ('https://studyathit.hit.edu.cn/18338/list.htm', 'Harbin Institute of Technology',
        'https://studyathit.hit.edu.cn/', 'Official 2026 bachelor admissions page; 2026 deadlines have passed, so verify next intake, majors, and scholarship terms.'),
    '中国科学技术大学': ('https://isa.ustc.edu.cn/xs/disp.asp?menu1=99&menu2=04&ucode=195', 'University of Science and Technology of China',
        'https://isa.ustc.edu.cn/', 'Official undergraduate international admissions guide found, but portions appear several years old; do not treat criteria as current until a 2027 guide is confirmed.'),
    '中山大学': ('https://iso.sysu.edu.cn/en/application/guide/1420575.htm', 'Sun Yat-sen University',
        'https://iso.sysu.edu.cn/en/', 'Official 2026 international bachelor admission guide posted 2025-12-10; verify the next cycle and current scholarship notices.'),
    '深圳大学': ('https://en.szu.edu.cn/info/1023/1903.htm', 'Shenzhen University',
        'https://en.szu.edu.cn/', 'Official 2026 international bachelor brochure posted 2025-12-31; the final listed deadline was 2026-05-31, so verify the next cycle.'),
    '暨南大学': ('https://ms.jnu.edu.cn/2026/0330/c13218a852649/page.htm', 'Jinan University',
        'https://ms.jnu.edu.cn/', 'Official 2026 guide for overseas Chinese and other foreign students; distinguish applicant channels and verify next-cycle dates.'),
    '南方科技大学': ('https://global.sustech.edu.cn/en/international_students', 'Southern University of Science and Technology',
        'https://global.sustech.edu.cn/en', 'Official page confirms international undergraduate admissions and scholarship support; 2026 scholarship notices exist, but a next-cycle new-admission guide still needs confirmation.'),
    '四川大学': ('https://global.scu.edu.cn/oso/article/details/3445f292-d2e3-494a-9a8d-d49f8e829e88?lang=en', 'Sichuan University',
        'https://en.scu.edu.cn/', 'Official 2026 international undergraduate guide lists Jan 1-May 30, 2026, now closed; direct automated page retrieval was blocked, so inspect the source and attachments before verification.'),
    '江苏科技大学': ('https://admission.just.edu.cn/admissionen/2026/0409/c10152a372095/page.htm', 'Jiangsu University of Science and Technology',
        'https://en.just.edu.cn/', 'Official 2026 guide offers bachelor programs; application period Apr 10-Jun 10, 2026 is closed. It lists a JUST bachelor scholarship; confirm next cycle and current terms.'),
    '重庆大学': ('https://study.cqu.edu.cn/info/1887/2789.htm', 'Chongqing University',
        'https://english.cqu.edu.cn/', 'Official 2026 undergraduate guide and scholarship notices found, but direct page retrieval was blocked; verify the source and attachments manually before relying on dates or terms.'),
    '东南大学': ('https://cis.seu.edu.cn/hwenglish/2025/1125/c14043a546677/page.htm', 'Southeast University',
        'https://www.seu.edu.cn/english/main.htm', 'Official page is titled Application Information for Undergraduate Programs at SEU 2026 and dated Nov 25, 2025; guide body was not retrievable, so eligibility, deadlines, and scholarships require manual review.'),
}


def connection():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def initialize():
    if not REGISTRY.exists():
        raise RuntimeError('MOE registry missing; run extract_registry.py first')
    DATA.mkdir(exist_ok=True)
    with connection() as conn:
        conn.execute('''CREATE TABLE IF NOT EXISTS datasets (
            dataset_id TEXT PRIMARY KEY, source_title TEXT NOT NULL, source_url TEXT NOT NULL,
            published_at TEXT NOT NULL, source_as_of TEXT NOT NULL, retrieved_at TEXT NOT NULL,
            source_sha256 TEXT NOT NULL, imported_count INTEGER NOT NULL)''')
        conn.execute('''CREATE TABLE IF NOT EXISTS universities (
            moe_code TEXT PRIMARY KEY, name_zh TEXT NOT NULL, name_en TEXT NOT NULL DEFAULT '',
            managing_authority TEXT NOT NULL DEFAULT '', region TEXT NOT NULL DEFAULT '', level TEXT NOT NULL DEFAULT '',
            notes TEXT NOT NULL DEFAULT '', official_homepage TEXT NOT NULL DEFAULT '', admissions_url TEXT NOT NULL DEFAULT '',
            verification_status TEXT NOT NULL DEFAULT 'not_checked', review_note TEXT NOT NULL DEFAULT '',
            reviewed_at TEXT NOT NULL DEFAULT '', source_as_of TEXT NOT NULL DEFAULT '2026-06-17')''')
        conn.execute('''CREATE TABLE IF NOT EXISTS review_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT, moe_code TEXT NOT NULL REFERENCES universities(moe_code),
            previous_status TEXT NOT NULL, next_status TEXT NOT NULL, note TEXT NOT NULL, changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)''')
        count = conn.execute('SELECT COUNT(*) FROM universities').fetchone()[0]
        if count == 0:
            register = json.loads(REGISTRY.read_text(encoding='utf-8'))
            conn.execute('''INSERT OR REPLACE INTO datasets VALUES(?,?,?,?,?,?,?,?)''',
                ('moe-ordinary-higher-education-2026','MOE National List of Higher Education Institutions',
                 register['sourceUrl'],register['publishedAt'],register['asOf'],register['retrievedAt'],
                 register['sha256'],len(register['institutions'])))
            for school in register['institutions']:
                link, english = EXISTING.get(school['nameZh'], ('', ''))
                homepage, review_note = '', ''
                if school['nameZh'] in EXTRA_SEEDS:
                    link, english, homepage, review_note = EXTRA_SEEDS[school['nameZh']]
                status = 'source_found' if link else 'not_checked'
                conn.execute('''INSERT INTO universities(moe_code,name_zh,name_en,managing_authority,region,level,notes,admissions_url,verification_status,official_homepage,review_note)
                    VALUES(?,?,?,?,?,?,?,?,?,?,?)''', (school['moeCode'], school['nameZh'], english, school['authority'],
                    school['province'] or '', school['level'], school['note'], link, status, homepage, review_note))


def payload(row):
    result = dict(row)
    result['is_bachelor'] = result['level'] == '本科'
    return result


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def send_json(self, value, status=200):
        body = json.dumps(value, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlparse(self.path)
        if path.path == '/':
            body = (ROOT / 'index.html').read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path.path == '/api/universities':
            query = parse_qs(path.query)
            text = query.get('q', [''])[0].strip()[:120]
            region = query.get('region', [''])[0].strip()[:60]
            level = query.get('level', [''])[0]
            status = query.get('status', [''])[0]
            page = max(1, min(10000, int(query.get('page', ['1'])[0])))
            where, args = [], []
            if text:
                where.append('(name_zh LIKE ? OR name_en LIKE ? OR moe_code LIKE ?)')
                args.extend([f'%{text}%', f'%{text}%', f'%{text}%'])
            if region:
                where.append('region = ?'); args.append(region)
            if level == 'bachelor':
                where.append("level = '本科'")
            elif level == 'other':
                where.append("level <> '本科'")
            if status in STATUSES:
                where.append('verification_status = ?'); args.append(status)
            clause = (' WHERE ' + ' AND '.join(where)) if where else ''
            with connection() as conn:
                total = conn.execute('SELECT COUNT(*) FROM universities' + clause, args).fetchone()[0]
                rows = conn.execute('SELECT * FROM universities' + clause + ' ORDER BY region,name_zh LIMIT 50 OFFSET ?', [*args, (page - 1) * 50]).fetchall()
                counts = {row['verification_status']: row['n'] for row in conn.execute('SELECT verification_status,COUNT(*) n FROM universities GROUP BY verification_status')}
                meta = conn.execute("SELECT COUNT(*) n FROM universities WHERE level='本科'").fetchone()['n']
                regions = [r['region'] for r in conn.execute('SELECT DISTINCT region FROM universities ORDER BY region')]
            self.send_json({'items': [payload(r) for r in rows], 'total': total, 'page': page, 'pageSize': 50,
                            'bachelorCount': meta, 'counts': counts, 'regions': regions})
            return
        if path.path == '/api/meta':
            with connection() as conn:
                dataset = conn.execute('SELECT * FROM datasets ORDER BY dataset_id').fetchall()
            self.send_json({'datasets':[dict(row) for row in dataset]})
            return
        if path.path == '/api/history':
            code = parse_qs(path.query).get('moeCode', [''])[0][:10]
            with connection() as conn:
                rows = conn.execute('SELECT previous_status,next_status,note,changed_at FROM review_events WHERE moe_code=? ORDER BY id DESC LIMIT 30',(code,)).fetchall()
            self.send_json({'events':[dict(row) for row in rows]})
            return
        if path.path == '/api/export.csv':
            with connection() as conn:
                rows = conn.execute('SELECT * FROM universities ORDER BY region,name_zh').fetchall()
            import csv, io
            out = io.StringIO(newline='')
            writer = csv.writer(out)
            writer.writerow(['MOE code','Chinese name','English name','Province/region','Degree level','Foreign undergraduate admission status','Official homepage','Official admissions URL','Review note','Reviewed at','MOE source as of'])
            def safe_cell(value):
                value = str(value or '')
                return "'" + value if value.startswith(('=','+','-','@','\t','\r')) else value
            writer.writerows([[safe_cell(v) for v in [r['moe_code'],r['name_zh'],r['name_en'],r['region'],r['level'],r['verification_status'],r['official_homepage'],r['admissions_url'],r['review_note'],r['reviewed_at'],r['source_as_of']]] for r in rows])
            data = ('\ufeff' + out.getvalue()).encode('utf-8')
            self.send_response(200); self.send_header('Content-Type','text/csv; charset=utf-8'); self.send_header('Content-Disposition','attachment; filename="china-university-discovery.csv"'); self.send_header('Content-Length',str(len(data))); self.end_headers(); self.wfile.write(data)
            return
        self.send_json({'error':'not found'},404)

    def do_POST(self):
        origin = self.headers.get('Origin', '')
        if self.headers.get('Host') not in {'127.0.0.1:4173', 'localhost:4173'} or origin not in {'http://127.0.0.1:4173', 'http://localhost:4173'}:
            self.send_json({'error':'local origin required'},403); return
        path = urlparse(self.path)
        if path.path != '/api/university-review':
            self.send_json({'error':'not found'},404); return
        try:
            body = json.loads(self.rfile.read(min(int(self.headers.get('Content-Length', '0')), 12000)))
            code = str(body['moeCode'])[:10]
            status = str(body['status'])
            url = str(body.get('admissionsUrl', '')).strip()[:2000]
            note = str(body.get('reviewNote', '')).strip()[:4000]
            homepage = str(body.get('officialHomepage', '')).strip()[:2000]
            if status not in STATUSES or (url and not url.startswith('https://')) or (homepage and not homepage.startswith('https://')):
                raise ValueError('Use an allowed status and HTTPS URLs')
            if status in {'source_found','needs_review','verified_admissions','no_current_admissions'} and not url:
                raise ValueError('An official admissions URL is required for this status')
            if status in {'verified_admissions','no_current_admissions'} and not any(str(year) in note for year in range(2026,2036)):
                raise ValueError('Record the admission cycle year in the review note before confirming this status')
            with connection() as conn:
                row = conn.execute('SELECT verification_status FROM universities WHERE moe_code=?', (code,)).fetchone()
                if not row: self.send_json({'error':'unknown MOE code'},404); return
                conn.execute('UPDATE universities SET verification_status=?,admissions_url=?,official_homepage=?,review_note=?,reviewed_at=datetime(\'now\') WHERE moe_code=?', (status,url,homepage,note,code))
                conn.execute('INSERT INTO review_events(moe_code,previous_status,next_status,note) VALUES(?,?,?,?)',(code,row['verification_status'],status,note))
                updated = conn.execute('SELECT * FROM universities WHERE moe_code=?',(code,)).fetchone()
            self.send_json({'item':payload(updated)})
        except (ValueError,KeyError,json.JSONDecodeError) as error:
            self.send_json({'error':str(error)},400)


if __name__ == '__main__':
    initialize()
    print('Discovery register ready at http://127.0.0.1:4173')
    ThreadingHTTPServer(('127.0.0.1', 4173), Handler).serve_forever()
