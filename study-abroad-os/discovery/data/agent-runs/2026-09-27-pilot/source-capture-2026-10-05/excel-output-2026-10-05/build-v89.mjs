import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const src = 'china-university-directory-1412-official-links-2026-10-06-v88.xlsx';
const out = 'china-university-directory-1412-official-links-2026-10-06-v89.xlsx';
const evidencePath = 'official-source-evidence-2026-10-06.jsonl';
const schools = [
  { row: 181, code: '4135010399', name: '泉州师范学院', F: 'https://www.qztc.edu.cn/', G: 'https://www.qztc.edu.cn/zs/', H: 'https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view,schId-311,infoId-7632726232.dhtml', publisher: '教育部阳光高考信息平台（上级主管部门审核通过的高校章程）', locator: '第十一条学生资助措施；第十四条联系方式；章程列出学校和招生网址', excerpt: '2026普通高等教育招生章程；国家奖学金、国家励志奖学金、优秀学生奖学金、国家助学金、助学贷款、临时困难补助、勤工助学、社会及发展性资助', retrieval: 'CHSI Ministry of Education Yangguang Gaokao page; charter marked approved by competent authority.', unresolved: '奖助条款面向普通本科学生；未据此确认留学生奖学金资格。' },
  { row: 182, code: '4135011317', name: '黎明职业大学', F: 'http://www.lmu.edu.cn/', G: 'http://zsb.lmu.edu.cn/', H: 'https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view,schId-767,infoId-7606241060.dhtml', publisher: '教育部阳光高考信息平台（上级主管部门审核通过的高校章程）', locator: '第二条院校标识码；第十一条助学体系；第十二至十三条招生网信息', excerpt: '2026普通高考招生章程；奖、助、贷、勤、免、缓、补七位一体，国家助学贷款/助学金、校内困难补助、勤工助学、绿色通道；列招生网址', retrieval: 'CHSI Ministry of Education Yangguang Gaokao page; charter marked approved by competent authority. Fujian Education Department official notice confirms school homepage URL.', unresolved: '奖助条款面向普通高考学生；未据此确认留学生奖学金资格。' },
  { row: 185, code: '4135012928', name: '泉州职业技术大学', F: 'https://www.qvtu.edu.cn/', G: 'https://www.qvtu.edu.cn/zsw/', H: 'https://sim.qvtu.edu.cn/info/1111/8813.htm', publisher: '泉州职业技术大学招生办公室', locator: '2026年普通高考招生章程第十二至十三条奖助政策；第二条学校标识码/网址', excerpt: '国家奖学金、国家励志奖学金、国家助学金、生源地助学贷款；校级20余类奖学金及爱心工程、勤工助学等助学项目', retrieval: 'First-party official university subdomain; 2026 charter published by admissions office.', unresolved: '奖助条款面向普通高考学生；未据此确认留学生奖学金资格。' },
  { row: 186, code: '4135012992', name: '闽南科技学院', F: 'https://www.mku.edu.cn/', G: 'https://zsw.mku.edu.cn/', H: 'https://zsw.mku.edu.cn/info/1003/3142.htm', publisher: '闽南科技学院招生信息网', locator: '第二十条国家及校级奖助政策；第二十一条联系方式、主页和招生网址', excerpt: '2026普通高考招生章程；国家奖学金、国家励志奖学金、校级优秀学生奖学金、国家助学金、生源地信用助学贷款、勤工助学、临时困难补助', retrieval: 'First-party university admissions website; published 2026-05-12.', unresolved: '奖助条款面向普通本科学生；未据此确认留学生奖学金资格。' },
];

const existing = (await fs.readFile(evidencePath, 'utf8')).split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
const collision = existing.filter(x => schools.some(s => x.source_row === s.row && x.moe_code === s.code));
if (collision.length) throw new Error(`Evidence already exists for this batch (${collision.length} records); refusing duplicate append.`);

const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh = wb.worksheets.getItem('รายชื่อ 1412');
const date = new Date('2026-10-06T00:00:00Z');
for (const s of schools) {
  const code = sh.getRange(`C${s.row}`).values[0][0];
  const name = sh.getRange(`D${s.row}`).values[0][0];
  if (String(code) !== s.code || String(name) !== s.name) throw new Error(`MOE/name mismatch at row ${s.row}: ${code} ${name}`);
  sh.getRange(`F${s.row}:H${s.row}`).values = [[s.F, s.G, s.H]];
  sh.getRange(`K${s.row}:M${s.row}`).values = [[date, 'พบเว็บไซต์มหาวิทยาลัย/招生办 และ章程本科ปี 2026; ตรวจตามรหัส MOE', `${s.name}：2026招生章程奖助政策。该信息针对普通本科/高考学生，不据此确认留学生奖学金资格。`]];
}
wb.recalculate();
await (await SpreadsheetFile.exportXlsx(wb)).save(out);

const common = { source_workbook: src, source_sheet: 'รายชื่อ 1412', checked_at: '2026-10-06', input_version: null, capture_path: null, content_sha256: null };
const entries = [];
for (const s of schools) {
  const base = { ...common, region: '福建省', source_row: s.row, task_id: null, moe_code: s.code, name_zh: s.name, cycle: '2026', degree_level: 'undergraduate', applicant_channel: 'domestic applicants', decision: 'accepted_official_link', next_action: null, officiality: 'confirmed', publisher: s.publisher, published_at: '2026', unresolved: s.unresolved };
  for (const [link_type, url, page_title, excerpt] of [['homepage', s.F, `${s.name}官网`, `${s.name}官方主页`], ['admissions', s.G, `${s.name}本科招生网`, '章程或学校信息列明的招生办公室网址'], ['scholarships', s.H, `${s.name}2026年招生章程及奖助政策`, s.excerpt]]) entries.push({ ...base, link_type, candidate_url: url, final_url: url, ownership_evidence_url: s.H, page_title, evidence_locator: s.locator, original_excerpt: excerpt, retrieval_status: s.retrieval });
}
await fs.appendFile(evidencePath, entries.map(x => JSON.stringify(x)).join('\n') + '\n', 'utf8');
console.log(JSON.stringify({ out, evidence_records_added: entries.length, schools: schools.map(s => ({ row: s.row, code: s.code, name: s.name })) }));
