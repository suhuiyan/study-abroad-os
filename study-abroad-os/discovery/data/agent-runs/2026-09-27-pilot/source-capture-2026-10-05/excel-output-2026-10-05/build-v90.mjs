import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const src = 'china-university-directory-1412-official-links-2026-10-06-v89.xlsx';
const out = 'china-university-directory-1412-official-links-2026-10-06-v90.xlsx';
const evidencePath = 'official-source-evidence-2026-10-06.jsonl';
const schools = [
  { row: 187, code: '4135013766', name: '泉州信息工程学院', F: 'https://www.qzuie.edu.cn/', G: 'https://zsb.qzuie.edu.cn/', H: 'https://zsb.qzuie.edu.cn/index.php?c=show&id=451&s=news', publisher: '泉州信息工程学院招生办公室', locator: '2026普通高考招生章程第十四至十六条奖助措施；2024域名变更通知确认官方域名', excerpt: '学校从学费收入提取6%用于奖励资助；国家奖学金、国家励志奖学金、学校及宇翔奖学金、国家助学金、生源地贷款、勤工助学', retrieval: 'First-party admissions office page; domain ownership corroborated by official university IT center domain notice.', unresolved: '资助条款面向普通统招学生；未据此确认留学生奖学金资格。' },
  { row: 190, code: '4135010390', name: '集美大学', F: 'https://www.jmu.edu.cn/', G: 'https://zsb.jmu.edu.cn/', H: 'https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view,schId-304,infoId-7635846247.dhtml', publisher: '教育部阳光高考信息平台（上级主管部门审核通过的高校章程）', locator: '第二条学校标识码；第二十二条奖助体系；第二十七条学校及招生联系信息', excerpt: '2026普通高考招生章程；专业/单项奖学金、社会捐赠奖学金、国家奖助学金、助学贷款、勤工助学、困难补助、就业补助等九位一体资助保障', retrieval: 'CHSI Ministry of Education Yangguang Gaokao page; charter marked approved by competent authority.', unresolved: '章程资助条款面向普通本科学生；国际生项目和资助资格需查看国际学生招生专页。' },
  { row: 195, code: '4135013471', name: '集美大学诚毅学院', F: 'http://chengyi.jmu.edu.cn/', G: 'https://cyzsb.jmu.edu.cn/', H: 'https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view,schId-1766,infoId-7635580749.dhtml', publisher: '教育部阳光高考信息平台（上级主管部门审核通过的高校章程）', locator: '第二十二条奖助学金制度；第二十四条招生办联系方式；院校标识码由Excel登记行确认', excerpt: '2026普通高考招生章程；专业奖学金、学习进步奖、单项奖、学科竞赛奖励、国家奖学金、国家励志奖学金、国家助学金、勤工助学岗位', retrieval: 'CHSI Ministry of Education Yangguang Gaokao page; charter marked approved by competent authority; official school and admissions subdomains independently referenced by CHSI.', unresolved: '章程资助条款面向普通本科学生；未据此确认留学生奖学金资格。' },
  { row: 196, code: '4135010402', name: '闽南师范大学', F: 'https://www.mnnu.edu.cn/', G: 'https://zsb.mnnu.edu.cn/', H: 'https://zsb.mnnu.edu.cn/info/1028/3891.htm', publisher: '闽南师范大学本科招生网', locator: '2026普通本科招生章程第二至七条学校/招生网身份与联系方式；资助政策条款如有列示以原文为准', excerpt: '闽南师范大学2026年普通本科招生章程（官方本科招生网，发布于2026-05-15）', retrieval: 'First-party university undergraduate admissions website; published 2026-05-15.', unresolved: '已核验主页、招生入口和当年章程；奖助信息请以章程正文及国际学生招生专页为准，不推断对国际生适用。' },
];
const existing = (await fs.readFile(evidencePath, 'utf8')).split(/\r?\n/).filter(Boolean).map(x => JSON.parse(x));
if (existing.some(x => schools.some(s => x.source_row === s.row && x.moe_code === s.code))) throw new Error('Evidence already exists for this batch; refusing duplicate append.');
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh = wb.worksheets.getItem('รายชื่อ 1412');
const date = new Date('2026-10-06T00:00:00Z');
for (const s of schools) {
  const code = sh.getRange(`C${s.row}`).values[0][0], name = sh.getRange(`D${s.row}`).values[0][0];
  if (String(code) !== s.code || String(name) !== s.name) throw new Error(`MOE/name mismatch at row ${s.row}: ${code} ${name}`);
  sh.getRange(`F${s.row}:H${s.row}`).values = [[s.F, s.G, s.H]];
  sh.getRange(`K${s.row}:M${s.row}`).values = [[date, 'พบเว็บไซต์มหาวิทยาลัย/招生办 และ章程本科ปี 2026; ตรวจตามรหัส MOE', `${s.name}：已核验官网、本科招生入口及2026招生章程。章程奖助信息是否适用于留学生须另核。`]];
}
wb.recalculate();
await (await SpreadsheetFile.exportXlsx(wb)).save(out);
const common = { source_workbook: src, source_sheet: 'รายชื่อ 1412', checked_at: '2026-10-06', input_version: null, capture_path: null, content_sha256: null };
const entries = [];
for (const s of schools) {
  const base = { ...common, region: '福建省', source_row: s.row, task_id: null, moe_code: s.code, name_zh: s.name, cycle: '2026', degree_level: 'undergraduate', applicant_channel: 'domestic applicants', decision: 'accepted_official_link', next_action: null, officiality: 'confirmed', publisher: s.publisher, published_at: '2026', unresolved: s.unresolved };
  for (const [link_type, url, page_title, excerpt] of [['homepage', s.F, `${s.name}官网`, `${s.name}官方主页`], ['admissions', s.G, `${s.name}本科招生网`, '学校章程或官网目录公布的本科招生入口'], ['scholarships', s.H, `${s.name}2026年招生章程/奖助政策`, s.excerpt]]) entries.push({ ...base, link_type, candidate_url: url, final_url: url, ownership_evidence_url: s.H, page_title, evidence_locator: s.locator, original_excerpt: excerpt, retrieval_status: s.retrieval });
}
await fs.appendFile(evidencePath, entries.map(x => JSON.stringify(x)).join('\n') + '\n', 'utf8');
console.log(JSON.stringify({ out, evidence_records_added: entries.length, schools: schools.map(s => ({ row: s.row, code: s.code, name: s.name })) }));
