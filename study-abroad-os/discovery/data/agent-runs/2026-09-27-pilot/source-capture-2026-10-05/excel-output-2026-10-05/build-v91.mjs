import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const src = 'china-university-directory-1412-official-links-2026-10-06-v90.xlsx';
const out = 'china-university-directory-1412-official-links-2026-10-06-v91.xlsx';
const evidencePath = 'official-source-evidence-2026-10-06.jsonl';
const schools = [
  { row:198, code:'4162011561', name:'甘肃民族师范学院', F:'http://www.gnun.edu.cn', G:'http://zsc.gnun.edu.cn/', H:'https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view,schId-855,infoId-7657109773.dhtml', publisher:'教育部阳光高考信息平台（上级主管部门审核通过的高校章程）', excerpt:'2026年普通本科招生章程；确认学校名称、代码及招生联系方式。普通高考章程未证明奖助条件适用于国际学生。', locator:'学校标识码4162011561；招生网信息；章程适用范围及联系方式', unresolved:'此链接用于学校与招生入口核验；未由普通高考章程推断国际生奖学金资格。' },
  { row:204, code:'4162010735', name:'甘肃中医药大学', F:'https://www.gszy.edu.cn/', G:'https://zsb.gszy.edu.cn/', H:'https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view,schId-575,infoId-7658763671.dhtml', publisher:'教育部阳光高考信息平台（上级主管部门审核通过的高校章程）', excerpt:'2026年普通本科招生章程；学校明确为中国政府奖学金来华留学生培养院校，但具体项目、资格与金额仍应查国际学生招生通知。', locator:'第三条学校代码4162010735；第十条办学及留学生培养信息；第三十二条招生办网址；第三十四条发布渠道', unresolved:'学校培养来华留学生不等同于该奖学金项目当年开放申请；需另查国际学生项目及资格。' },
  { row:205, code:'4162010736', name:'西北师范大学', F:'https://www.nwnu.edu.cn', G:'https://zsb.nwnu.edu.cn', H:'https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view,schId-576,infoId-7657713096.dhtml', publisher:'教育部阳光高考信息平台（上级主管部门审核通过的高校章程）', excerpt:'2026年普通本科招生章程，章程内载明官网及本科招生网；资助项目条款需按招生对象另行核对。', locator:'第五条学校标识码4162010736；第三十六条官网、本科招生网及联系方式', unresolved:'普通本科招生章程不是国际生奖学金资格证明。' },
  { row:209, code:'4162011406', name:'甘肃政法大学', F:'https://www.gsupl.edu.cn/', G:'https://bkzs.gsupl.edu.cn/', H:'https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view,schId-432333,infoId-7658474627.dhtml', publisher:'教育部阳光高考信息平台（上级主管部门审核通过的高校章程）', excerpt:'2026年普通本科招生章程；确认学校代码4162011406及本科招生网入口。普通本科资助规定不得视为国际生奖学金资格。', locator:'第二条学校全称及标识码；第十条招生办公室联系方式；第二十七条适用范围', unresolved:'需以国际学生招生页面确认留学生可申请的奖学金与条件。' },
  { row:212, code:'4162012834', name:'甘肃警察学院', F:'https://www.gsjcxy.edu.cn/', G:'https://www.gsjcxy.edu.cn/info/1016/37944.htm', H:'https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view,schId-1315,infoId-7658571948.dhtml', publisher:'教育部阳光高考信息平台（上级主管部门审核通过的高校章程）', excerpt:'2026年普通本专科招生章程；确认学校代码及学校官网。招生简章另载本科招生与奖助体系，国际生适用资格未确认。', locator:'第四条学校名称、办学层次及代码；章程官网信息；学院官网2026招生简章', unresolved:'警察专业招生另有资格限制；普通本科奖助政策不能推断为国际学生可申请。' },
  { row:218, code:'4162011806', name:'陇南师范学院', F:'http://www.lntc.edu.cn', G:'http://zsc.lntc.edu.cn/', H:'https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view,schId-916,infoId-7657005450.dhtml', publisher:'教育部阳光高考信息平台（上级主管部门审核通过的高校章程）', excerpt:'2026年招生章程，适用于普通本科及高职招生；载有困难补助、退役学生资助及绿色通道等信息。未证明国际生适用。', locator:'第六条学校代码4162011806；第二条招生层次；学生资助条款；第三十条招生联系方式', unresolved:'章程所载普通本专科资助不构成国际生奖学金资格确认。' }
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
  sh.getRange(`K${s.row}:M${s.row}`).values = [[date, 'พบเว็บไซต์มหาวิทยาลัย/招生办 และ章程本科ปี 2026; ตรวจตามรหัส MOE', `${s.name}：已核验官网、本科招生入口及2026年审核通过的招生章程。普通本科资助不推断为留学生可申请。`]];
}
wb.recalculate();
await (await SpreadsheetFile.exportXlsx(wb)).save(out);
const common = { source_workbook: src, source_sheet: 'รายชื่อ 1412', checked_at: '2026-10-06', input_version: null, capture_path: null, content_sha256: null };
const entries = [];
for (const s of schools) {
  const base = { ...common, region: '甘肃省', source_row: s.row, task_id: null, moe_code: s.code, name_zh: s.name, cycle: '2026', degree_level: 'undergraduate', applicant_channel: 'domestic applicants', decision: 'accepted_official_link', next_action: null, officiality: 'confirmed', publisher: s.publisher, published_at: '2026', unresolved: s.unresolved };
  for (const [link_type, url, page_title, excerpt] of [['homepage', s.F, `${s.name}官网`, `${s.name}官方主页`], ['admissions', s.G, `${s.name}本科招生网`, '官方章程确认学校招生入口'], ['scholarships', s.H, `${s.name}2026年招生章程`, s.excerpt]]) entries.push({ ...base, link_type, candidate_url: url, final_url: url, ownership_evidence_url: s.H, page_title, evidence_locator: s.locator, original_excerpt: excerpt, retrieval_status: 'CHSI Ministry of Education Yangguang Gaokao page; charter marked approved by competent authority; official school identity code matched.' });
}
await fs.appendFile(evidencePath, entries.map(x => JSON.stringify(x)).join('\n') + '\n', 'utf8');
console.log(JSON.stringify({ out, evidence_records_added: entries.length, schools: schools.map(s => ({ row: s.row, code: s.code, name: s.name })) }));
