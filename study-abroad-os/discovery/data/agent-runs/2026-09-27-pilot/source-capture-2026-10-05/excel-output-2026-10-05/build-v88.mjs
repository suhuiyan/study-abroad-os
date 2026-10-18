import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const src = 'china-university-directory-1412-official-links-2026-10-06-v87.xlsx';
const out = 'china-university-directory-1412-official-links-2026-10-06-v88.xlsx';
const evidencePath = 'official-source-evidence-2026-10-06.jsonl';
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh = wb.worksheets.getItem('รายชื่อ 1412');
const date = new Date('2026-10-06T00:00:00Z');

const schools = [
  { row: 176, code: '4135011312', name: '龙岩学院', F: 'https://www.lyun.edu.cn/', G: 'https://zsw.lyun.edu.cn/index.htm', H: 'https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view,schId-763,infoId-7632754150.dhtml', publisher: '教育部阳光高考信息平台（上级主管部门审核通过的高校章程）', locator: '第二十三条奖学金政策、第二十四条助学政策；第二十五条列学校及招生办网址', excerpt: '2026普通高考章程；国家及校级奖学金、国家助学金、助学贷款、勤工助学、社会助学、临时困难补助；章程列明学校及招生办网址', unresolved: '奖助条款来自国内普通高考招生章程；未据此确认留学生奖学金资格。', retrieval: 'CHSI Ministry of Education Yangguang Gaokao page; 2026 charter explicitly marked approved by competent authority.' },
  { row: 177, code: '4135010397', name: '武夷学院', F: 'https://www.wuyiu.edu.cn/', G: 'https://www.wuyiu.edu.cn/zsb/', H: 'https://www.wuyiu.edu.cn/zsb/2026/0509/c2780a131866/page.htm', publisher: '武夷学院招生办', locator: '2026年普通高考招生章程；奖助体系及学校/招生网址条款', excerpt: '2026普通高考招生章程；包含奖、贷、助、勤、减、缓、补资助体系；学校网址及招生网址在章程中列明', unresolved: '奖助条款来自国内普通高考招生章程；未据此确认留学生奖学金资格。', retrieval: 'First-party university admissions website; published 2026-05-09.' },
  { row: 178, code: '4135010398', name: '宁德师范学院', F: 'https://www.ndnu.edu.cn/index.htm', G: 'https://zsb.ndnu.edu.cn/', H: 'https://zsb.ndnu.edu.cn/info/1007/2618.htm', publisher: '宁德师范学院招生办', locator: '宁德师范学院招生办章程列表：2026-05-11普通高考招生章程；资助政策条款待对照页面全文', excerpt: '宁德师范学院2026年普通高考招生章程（招生办官方列表及详情页）', unresolved: '官方招生办章程详情页检索确认，但正文抓取不稳定；奖助条文细节需人工复核。该章程面向国内普通高考，不确认留学生资助资格。', retrieval: 'First-party official university homepage and admissions office domain; 2026 charter linked from official charter list.' },
  { row: 179, code: '4135011498', name: '莆田学院', F: 'https://www.ptu.edu.cn/', G: 'https://www.ptu.edu.cn/zhaosheng/', H: 'https://www.ptu.edu.cn/zhaosheng/info/1007/2324.htm', publisher: '莆田学院招生网', locator: '第二十二条奖助项目；第二十三条家庭经济困难学生资助体系；第六条及第二十八条学校/本科招生范围', excerpt: '2026普通高考章程；国家奖学金、国家励志奖学金、校级奖学金、困难补助、社会捐资奖助学金、助学贷款、绿色通道、国家助学金、勤工助学', unresolved: '奖助条款来自国内普通高考招生章程；未据此确认留学生奖学金资格。', retrieval: 'First-party university admissions website; published 2026-06-22.' },
];

for (const s of schools) {
  const code = sh.getRange(`C${s.row}`).values[0][0];
  const name = sh.getRange(`D${s.row}`).values[0][0];
  if (String(code) !== s.code || String(name) !== s.name) throw new Error(`MOE/name mismatch at row ${s.row}: ${code} ${name}`);
  sh.getRange(`F${s.row}:H${s.row}`).values = [[s.F, s.G, s.H]];
  sh.getRange(`K${s.row}:M${s.row}`).values = [[date, 'พบเว็บไซต์มหาวิทยาลัย/招生办 และ章程本科ปี 2026; ตรวจตามรหัส MOE', `${s.name}：2026普通高考招生章程。资助信息仅为国内招生章程所述，不据此确认留学生奖学金资格。${s.unresolved.includes('正文抓取不稳定') ? ' 章程正文需复核资助细节。' : ''}`]];
}

wb.recalculate();
const file = await SpreadsheetFile.exportXlsx(wb);
await file.save(out);

const common = { source_workbook: src, source_sheet: 'รายชื่อ 1412', checked_at: '2026-10-06', input_version: null, capture_path: null, content_sha256: null };
const entries = [];
for (const s of schools) {
  const base = { ...common, region: '福建省', source_row: s.row, task_id: null, moe_code: s.code, name_zh: s.name, cycle: '2026', degree_level: 'undergraduate', applicant_channel: 'domestic applicants', decision: 'accepted_official_link', next_action: s.unresolved.includes('正文抓取不稳定') ? 'Review 2026 charter aid clauses on official page' : null, officiality: 'confirmed', publisher: s.publisher, published_at: '2026', unresolved: s.unresolved };
  for (const [link_type, url, page_title, excerpt] of [
    ['homepage', s.F, `${s.name}官网`, `${s.name}官方主页`],
    ['admissions', s.G, `${s.name}本科招生网`, '招生办网站/章程中公布的招生网址'],
    ['scholarships', s.H, `${s.name}2026普通高考招生章程及奖助政策`, s.excerpt],
  ]) entries.push({ ...base, link_type, candidate_url: url, final_url: url, ownership_evidence_url: s.H, page_title, evidence_locator: s.locator, original_excerpt: excerpt, retrieval_status: s.retrieval });
}
await fs.appendFile(evidencePath, entries.map(x => JSON.stringify(x)).join('\n') + '\n', 'utf8');
console.log(JSON.stringify({ out, evidence_records_added: entries.length, schools: schools.map(s => ({ row: s.row, code: s.code, name: s.name })) }));
