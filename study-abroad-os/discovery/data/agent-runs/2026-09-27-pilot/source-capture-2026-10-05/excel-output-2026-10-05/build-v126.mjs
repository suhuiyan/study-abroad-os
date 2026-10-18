import fs from 'node:fs/promises';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const src='china-university-directory-1412-official-links-2026-10-06-v125.xlsx';
const out='china-university-directory-1412-official-links-2026-10-06-v126.xlsx';
const ep='official-source-evidence-2026-10-06.jsonl';
const row=329,code='4145010607',name='广西艺术学院';
const F='https://www.gxau.edu.cn/';
const G='https://www.gxau.edu.cn/zsjy/lxszs';
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(src));
const sh=wb.worksheets.getItem('รายชื่อ 1412');
if(String(sh.getRange(`C${row}`).values[0][0])!==code||String(sh.getRange(`D${row}`).values[0][0])!==name) throw Error('identity mismatch');
sh.getRange(`F${row}:H${row}`).values=[[F,G,'']];
sh.getRange(`K${row}:M${row}`).values=[[new Date('2026-10-06T00:00:00Z'),'พบหน้ารับสมัครนักศึกษาต่างชาติระดับ本科/硕士และข้อมูลทุนบนเว็บทางการ; หน้าไม่ระบุรอบปี/วันปิดรับ ต้องตรวจประกาศรอบล่าสุด','官网“留学生招生”页面明确面向外国留学生开放本科、硕士及进修生申请，列出学制、学费、报名材料、审查录取流程，并说明优秀留学生可获专项奖学金或部分学费减免。页面未注明招生年度、申请开放日期或截止日期；需向国际交流处确认当前批次。']];
const before=(await fs.readFile(ep,'utf8')).split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x));
if(before.some(x=>x.source_row===row&&x.moe_code===code)) throw Error('duplicate evidence');
await(await SpreadsheetFile.exportXlsx(wb)).save(out);
const base={source_workbook:src,source_sheet:'รายชื่อ 1412',checked_at:'2026-10-06',region:'广西壮族自治区',source_row:row,moe_code:code,name_zh:name,cycle:null,decision:'source_found',officiality:'confirmed'};
const ev=[
{...base,link_type:'homepage',candidate_url:F,final_url:F,publisher:name,page_title:'广西艺术学院官网',evidence_locator:'招生就业导航链接至“留学生招生”；页面版权与备案信息标明gxau.edu.cn',original_excerpt:'留学生招生；Copyright©2015-2026 www.gxau.edu.cn',applicant_channel:'general',retrieval_status:'Official university domain confirmed by institutional navigation, page copyright, and filing record.'},
{...base,link_type:'admissions',candidate_url:G,final_url:G,publisher:name,page_title:'留学生招生',evidence_locator:'页面“入学条件”(本科/硕士); “报名与资格审查”; “奖学金”; “录取/JW202”',original_excerpt:'外国籍人士均可报读本科开设的各专业(方向)；学校为学习成绩优秀的留学生提供专项奖学金或减免部分学费；报名随到随报；未标招生年度及截止日期。',applicant_channel:'international undergraduate, masters, and non-degree applicants',unresolved:'The page does not state a cycle, opening date, or deadline; verify current availability and exact program list with the International Exchange Office before applying.',retrieval_status:'Official foreign-student admission page verified; degree scope and scholarship statement visible.'}
];
await fs.appendFile(ep,ev.map(x=>JSON.stringify(x)).join('\n')+'\n');
console.log(JSON.stringify({out,added:ev.length,row,code,name}));
